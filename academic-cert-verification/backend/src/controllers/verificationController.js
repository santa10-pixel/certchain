const path = require("path");
const fs = require("fs");
const db = require("../config/database");
const HashService = require("../services/hashService");
const blockchainService = require("../services/blockchainService");

class VerificationController {
  /**
   * Verify by Certificate ID (from direct entry or QR scan)
   */
  static async verifyById(req, res, next) {
    try {
      const { id } = req.params;
      const clientIp = req.ip || req.connection.remoteAddress;

      if (!id || id.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Certificate ID is required for verification.",
        });
      }

      const certId = id.trim();
      const cert = await db.getAsync(
        "SELECT * FROM certificates WHERE id = ? OR certificate_number = ?",
        [certId, certId]
      );

      const timestamp = new Date().toISOString();

      if (!cert) {
        // Log not found event
        await db.runAsync(
          "INSERT INTO verification_logs (certificate_id, verification_method, result, ip_address) VALUES (?, 'ID', 'NOT_FOUND', ?)",
          [certId, clientIp]
        );

        return res.status(404).json({
          success: false,
          status: "NOT_FOUND",
          message: "Certificate not found",
          details: {
            certificateId: certId,
            verificationTimestamp: timestamp,
          },
        });
      }

      // Check on-chain verification
      let onChainResult = null;
      try {
        onChainResult = await blockchainService.verifyCertificateOnChain(
          cert.id,
          cert.certificate_hash
        );
      } catch (chainErr) {
        console.warn("Direct on-chain read warning:", chainErr.message);
      }

      const isRevoked = cert.status === "REVOKED" || (onChainResult && onChainResult.isRevoked);

      if (isRevoked) {
        await db.runAsync(
          "INSERT INTO verification_logs (certificate_id, verification_method, result, computed_hash, onchain_hash, ip_address) VALUES (?, 'ID', 'REVOKED', ?, ?, ?)",
          [cert.id, cert.certificate_hash, cert.certificate_hash, clientIp]
        );

        return res.json({
          success: true,
          status: "REVOKED",
          message: "Certificate has been revoked",
          details: {
            studentName: cert.student_name,
            courseName: cert.course_name,
            universityName: cert.university_name,
            certificateNumber: cert.certificate_number,
            certificateId: cert.id,
            issueDate: cert.issue_date,
            graduationDate: cert.graduation_date,
            blockchainTxHash: cert.tx_hash,
            blockNumber: cert.block_number,
            certificateHash: cert.certificate_hash,
            certificateStatus: "REVOKED",
            revocationReason: cert.revocation_reason,
            revokedAt: cert.revoked_at,
            verificationTimestamp: timestamp,
            verificationMethod: "ID_LOOKUP",
            onChainVerified: !!onChainResult,
          },
        });
      }

      // Valid and authentic
      await db.runAsync(
        "INSERT INTO verification_logs (certificate_id, verification_method, result, computed_hash, onchain_hash, ip_address) VALUES (?, 'ID', 'VALID', ?, ?, ?)",
        [cert.id, cert.certificate_hash, cert.certificate_hash, clientIp]
      );

      return res.json({
        success: true,
        status: "VALID",
        message: "Certificate is valid and authentic",
        details: {
          studentName: cert.student_name,
          courseName: cert.course_name,
          universityName: cert.university_name,
          certificateNumber: cert.certificate_number,
          certificateId: cert.id,
          issueDate: cert.issue_date,
          graduationDate: cert.graduation_date,
          blockchainTxHash: cert.tx_hash,
          blockNumber: cert.block_number,
          issuerAddress: cert.issuer_address,
          certificateHash: cert.certificate_hash,
          certificateStatus: "VALID",
          verificationTimestamp: timestamp,
          verificationMethod: "ID_LOOKUP",
          pdfUrl: cert.pdf_path,
          onChainVerified: !!onChainResult,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Verify uploaded certificate PDF document
   * Calculates SHA-256 hash of uploaded file, matches against blockchain, and reports outcome
   */
  static async verifyByFile(req, res, next) {
    let uploadedFilePath = null;
    try {
      const clientIp = req.ip || req.connection.remoteAddress;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Please upload a certificate PDF file to verify.",
        });
      }

      uploadedFilePath = req.file.path;
      // 1. Calculate SHA-256 hash of the uploaded document
      const uploadedHash = await HashService.calculateFileHash(uploadedFilePath);
      console.log("Uploaded file SHA-256 hash computed:", uploadedHash);

      const timestamp = new Date().toISOString();

      // Check if optional certificateId was provided in body
      const providedCertId = req.body.certificateId ? req.body.certificateId.trim() : null;

      let cert = null;
      if (providedCertId) {
        cert = await db.getAsync("SELECT * FROM certificates WHERE id = ? OR certificate_number = ?", [
          providedCertId,
          providedCertId,
        ]);
      } else {
        // Search by computed hash directly
        cert = await db.getAsync("SELECT * FROM certificates WHERE certificate_hash = ?", [uploadedHash]);
      }

      // If matching by provided ID but the hash doesn't match: TAMPERED / MODIFIED!
      if (cert && cert.certificate_hash.toLowerCase() !== uploadedHash.toLowerCase()) {
        await db.runAsync(
          "INSERT INTO verification_logs (certificate_id, verification_method, result, computed_hash, onchain_hash, ip_address) VALUES (?, 'FILE_UPLOAD', 'MODIFIED', ?, ?, ?)",
          [cert.id, uploadedHash, cert.certificate_hash, clientIp]
        );

        return res.json({
          success: false,
          status: "MODIFIED",
          message: "Certificate has been modified",
          details: {
            certificateId: cert.id,
            studentName: cert.student_name,
            courseName: cert.course_name,
            universityName: cert.university_name,
            certificateNumber: cert.certificate_number,
            issueDate: cert.issue_date,
            blockchainTxHash: cert.tx_hash,
            originalHash: cert.certificate_hash,
            uploadedFileHash: uploadedHash,
            certificateStatus: "TAMPERED / MODIFIED",
            verificationTimestamp: timestamp,
            verificationMethod: "FILE_HASH_COMPARISON",
          },
        });
      }

      // If no certificate was found for this hash
      if (!cert) {
        await db.runAsync(
          "INSERT INTO verification_logs (certificate_id, verification_method, result, computed_hash, ip_address) VALUES ('UNKNOWN', 'FILE_UPLOAD', 'NOT_FOUND', ?, ?)",
          [uploadedHash, clientIp]
        );

        return res.status(404).json({
          success: false,
          status: "NOT_FOUND",
          message: "Certificate not found",
          details: {
            computedHash: uploadedHash,
            verificationTimestamp: timestamp,
            verificationMethod: "FILE_HASH_LOOKUP",
          },
        });
      }

      // We have matching certificate; check revocation status
      let onChainResult = null;
      try {
        onChainResult = await blockchainService.verifyCertificateOnChain(cert.id, uploadedHash);
      } catch (chainErr) {
        console.warn("Direct on-chain check error:", chainErr.message);
      }

      const isRevoked = cert.status === "REVOKED" || (onChainResult && onChainResult.isRevoked);

      if (isRevoked) {
        await db.runAsync(
          "INSERT INTO verification_logs (certificate_id, verification_method, result, computed_hash, onchain_hash, ip_address) VALUES (?, 'FILE_UPLOAD', 'REVOKED', ?, ?, ?)",
          [cert.id, uploadedHash, cert.certificate_hash, clientIp]
        );

        return res.json({
          success: true,
          status: "REVOKED",
          message: "Certificate has been revoked",
          details: {
            studentName: cert.student_name,
            courseName: cert.course_name,
            universityName: cert.university_name,
            certificateNumber: cert.certificate_number,
            certificateId: cert.id,
            issueDate: cert.issue_date,
            blockchainTxHash: cert.tx_hash,
            certificateHash: cert.certificate_hash,
            uploadedFileHash: uploadedHash,
            certificateStatus: "REVOKED",
            revocationReason: cert.revocation_reason,
            revokedAt: cert.revoked_at,
            verificationTimestamp: timestamp,
            verificationMethod: "FILE_HASH_VERIFICATION",
            onChainVerified: !!onChainResult,
          },
        });
      }

      // Authentic and valid
      await db.runAsync(
        "INSERT INTO verification_logs (certificate_id, verification_method, result, computed_hash, onchain_hash, ip_address) VALUES (?, 'FILE_UPLOAD', 'VALID', ?, ?, ?)",
        [cert.id, uploadedHash, cert.certificate_hash, clientIp]
      );

      return res.json({
        success: true,
        status: "VALID",
        message: "Certificate is valid and authentic",
        details: {
          studentName: cert.student_name,
          courseName: cert.course_name,
          universityName: cert.university_name,
          certificateNumber: cert.certificate_number,
          certificateId: cert.id,
          issueDate: cert.issue_date,
          graduationDate: cert.graduation_date,
          blockchainTxHash: cert.tx_hash,
          blockNumber: cert.block_number,
          issuerAddress: cert.issuer_address,
          certificateHash: cert.certificate_hash,
          uploadedFileHash: uploadedHash,
          certificateStatus: "VALID",
          verificationTimestamp: timestamp,
          verificationMethod: "FILE_HASH_VERIFICATION",
          pdfUrl: cert.pdf_path,
          onChainVerified: !!onChainResult,
        },
      });
    } catch (err) {
      next(err);
    } finally {
      // Clean up uploaded temporary verification file
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (_) {}
      }
    }
  }
}

module.exports = VerificationController;
