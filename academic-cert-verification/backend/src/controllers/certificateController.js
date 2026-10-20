const path = require("path");
const fs = require("fs");
const db = require("../config/database");
const HashService = require("../services/hashService");
const QRService = require("../services/qrService");
const PDFService = require("../services/pdfService");
const blockchainService = require("../services/blockchainService");

class CertificateController {
  /**
   * Issue a new academic certificate
   * Generates QR code, creates PDF document, calculates SHA-256 hash, and anchors hash to Blockchain
   */
  static async issueCertificate(req, res, next) {
    try {
      const {
        student_name,
        student_id,
        course_name,
        university_name,
        certificate_type,
        issue_date,
        graduation_date,
        certificate_number,
      } = req.body;

      // 1. Validate required fields
      if (
        !student_name ||
        !student_id ||
        !course_name ||
        !university_name ||
        !certificate_type ||
        !issue_date ||
        !graduation_date ||
        !certificate_number
      ) {
        return res.status(400).json({
          success: false,
          error: "All certificate fields are mandatory: Student Name, Student ID, Course Name, University Name, Certificate Type, Issue Date, Graduation Date, Certificate Number.",
        });
      }

      // 2. Prevent duplicate Certificate Number in database
      const existingCert = await db.getAsync(
        "SELECT id FROM certificates WHERE certificate_number = ?",
        [certificate_number.trim()]
      );
      if (existingCert) {
        return res.status(409).json({
          success: false,
          error: `A certificate with Certificate Number '${certificate_number}' already exists.`,
        });
      }

      // Generate systematic Certificate ID
      const sanitizedNum = certificate_number.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
      const certificateId = `CERT-${sanitizedNum}`;

      // Check if ID exists
      const existingId = await db.getAsync("SELECT id FROM certificates WHERE id = ?", [certificateId]);
      if (existingId) {
        return res.status(409).json({
          success: false,
          error: `Certificate ID '${certificateId}' already exists in registry.`,
        });
      }

      const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 3. Generate QR Code linking to verification page
      const qrResult = await QRService.generateCertificateQR(certificateId, uploadDir);

      let pdfFilePath;
      let pdfRelativePath;

      // 4. Handle PDF creation or uploaded file
      if (req.file) {
        // If an external custom PDF was uploaded
        pdfFilePath = req.file.path;
        pdfRelativePath = `/uploads/${path.basename(req.file.path)}`;
      } else {
        // Automatically generate official university certificate PDF with embedded QR code
        const pdfResult = await PDFService.generateCertificatePDF(
          {
            certificateId,
            studentName: student_name.trim(),
            studentId: student_id.trim(),
            courseName: course_name.trim(),
            universityName: university_name.trim(),
            certificateType: certificate_type.trim(),
            issueDate: issue_date.trim(),
            graduationDate: graduation_date.trim(),
            certificateNumber: certificate_number.trim(),
          },
          qrResult.filePath,
          uploadDir
        );
        pdfFilePath = pdfResult.filePath;
        pdfRelativePath = `/uploads/${pdfResult.filename}`;
      }

      // 5. Calculate cryptographic SHA-256 hash of final PDF
      const certificateHash = await HashService.calculateFileHash(pdfFilePath);
      console.log(`Certificate ${certificateId} SHA-256 Hash:`, certificateHash);

      // 6. Submit hash & certificate metadata to Blockchain Smart Contract
      let txHash = null;
      let blockNumber = null;
      let issuerAddress = null;

      try {
        const onChainResult = await blockchainService.issueCertificateOnChain(
          certificateId,
          certificateHash,
          pdfRelativePath
        );
        txHash = onChainResult.txHash;
        blockNumber = onChainResult.blockNumber;
        issuerAddress = onChainResult.issuer;
        console.log(`On-chain transaction confirmed: ${txHash} at block ${blockNumber}`);
      } catch (chainErr) {
        console.error("Blockchain anchoring error:", chainErr);
        // Clean up generated files if blockchain call fails
        try {
          if (fs.existsSync(pdfFilePath)) fs.unlinkSync(pdfFilePath);
          if (fs.existsSync(qrResult.filePath)) fs.unlinkSync(qrResult.filePath);
        } catch (_) {}

        return res.status(500).json({
          success: false,
          error: `Failed to anchor certificate on blockchain: ${chainErr.message}. Ensure Hardhat local node is running.`,
        });
      }

      // 7. Store off-chain non-PII and verification record in SQLite database
      const qrRelativePath = `/uploads/${qrResult.filename}`;
      await db.runAsync(
        `INSERT INTO certificates (
          id, student_name, student_id, course_name, university_name,
          certificate_type, issue_date, graduation_date, certificate_number,
          certificate_hash, tx_hash, block_number, issuer_address,
          pdf_path, qr_path, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID', datetime('now'))`,
        [
          certificateId,
          student_name.trim(),
          student_id.trim(),
          course_name.trim(),
          university_name.trim(),
          certificate_type.trim(),
          issue_date.trim(),
          graduation_date.trim(),
          certificate_number.trim(),
          certificateHash,
          txHash,
          blockNumber,
          issuerAddress,
          pdfRelativePath,
          qrRelativePath,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Academic certificate issued and anchored to blockchain successfully.",
        certificate: {
          id: certificateId,
          studentName: student_name.trim(),
          studentId: student_id.trim(),
          courseName: course_name.trim(),
          universityName: university_name.trim(),
          certificateType: certificate_type.trim(),
          issueDate: issue_date.trim(),
          graduationDate: graduation_date.trim(),
          certificateNumber: certificate_number.trim(),
          certificateHash,
          blockchainTxHash: txHash,
          blockNumber,
          issuerAddress,
          status: "VALID",
          pdfUrl: pdfRelativePath,
          qrUrl: qrRelativePath,
          qrDataUrl: qrResult.dataUrl,
          verificationUrl: qrResult.verificationUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all certificates with search and filters
   */
  static async getAllCertificates(req, res, next) {
    try {
      const { search, status, course, studentId } = req.query;

      let sql = "SELECT * FROM certificates WHERE 1=1";
      const params = [];

      if (search) {
        sql += " AND (id LIKE ? OR student_name LIKE ? OR certificate_number LIKE ? OR course_name LIKE ?)";
        const term = `%${search.trim()}%`;
        params.push(term, term, term, term);
      }

      if (status) {
        sql += " AND status = ?";
        params.push(status.trim().toUpperCase());
      }

      if (course) {
        sql += " AND course_name LIKE ?";
        params.push(`%${course.trim()}%`);
      }

      if (studentId) {
        sql += " AND student_id = ?";
        params.push(studentId.trim());
      }

      sql += " ORDER BY created_at DESC";

      const certificates = await db.allAsync(sql, params);

      res.json({
        success: true,
        count: certificates.length,
        certificates,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get certificate by ID
   */
  static async getCertificateById(req, res, next) {
    try {
      const { id } = req.params;
      const cert = await db.getAsync("SELECT * FROM certificates WHERE id = ? OR certificate_number = ?", [
        id.trim(),
        id.trim(),
      ]);

      if (!cert) {
        return res.status(404).json({
          success: false,
          error: `Certificate with ID '${id}' was not found.`,
        });
      }

      // Read live on-chain record for double confirmation
      let onChainData = null;
      try {
        onChainData = await blockchainService.getCertificateOnChain(cert.id);
      } catch (chainErr) {
        console.warn("Could not retrieve live on-chain details:", chainErr.message);
      }

      res.json({
        success: true,
        certificate: cert,
        blockchainVerification: onChainData,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Revoke certificate
   */
  static async revokeCertificate(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const cert = await db.getAsync("SELECT * FROM certificates WHERE id = ?", [id.trim()]);
      if (!cert) {
        return res.status(404).json({
          success: false,
          error: `Certificate with ID '${id}' was not found.`,
        });
      }

      if (cert.status === "REVOKED") {
        return res.status(400).json({
          success: false,
          error: "Certificate has already been revoked.",
        });
      }

      // Execute on-chain revocation transaction
      let revokeTx = null;
      try {
        revokeTx = await blockchainService.revokeCertificateOnChain(cert.id);
        console.log(`Certificate ${cert.id} revoked on-chain in tx ${revokeTx.txHash}`);
      } catch (chainErr) {
        return res.status(500).json({
          success: false,
          error: `Failed to execute revocation on blockchain: ${chainErr.message}`,
        });
      }

      // Update SQLite database status
      await db.runAsync(
        "UPDATE certificates SET status = 'REVOKED', revocation_reason = ?, revoked_at = datetime('now') WHERE id = ?",
        [reason || "Revoked by University Administration", cert.id]
      );

      res.json({
        success: true,
        message: `Certificate '${cert.id}' has been permanently revoked on-chain.`,
        certificateId: cert.id,
        txHash: revokeTx.txHash,
        status: "REVOKED",
        revocationReason: reason || "Revoked by University Administration",
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Download certificate PDF directly
   */
  static async downloadCertificatePDF(req, res, next) {
    try {
      const { id } = req.params;
      const cert = await db.getAsync("SELECT * FROM certificates WHERE id = ?", [id.trim()]);
      if (!cert) {
        return res.status(404).json({ success: false, error: "Certificate not found." });
      }

      const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads");
      const filename = path.basename(cert.pdf_path);
      const fullPath = path.join(uploadDir, filename);

      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ success: false, error: "Certificate PDF file not found on disk." });
      }

      res.download(fullPath, `${cert.id}_${cert.student_name.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CertificateController;
