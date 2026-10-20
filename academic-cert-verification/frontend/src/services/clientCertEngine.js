import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

const STORAGE_KEY = "academic_certchain_records_v2";
const STATS_LOGS_KEY = "academic_certchain_logs_v2";

// Seed default certificates
const DEFAULT_CERTS = [
  {
    id: "CERT-2026-8841",
    student_name: "Santhosh Kumar R",
    student_id: "22BCE1042",
    course_name: "Bachelor of Technology in Computer Science & Engineering",
    university_name: "National Institute of Technology",
    certificate_type: "Degree of Bachelor of Technology",
    issue_date: "2026-05-20",
    graduation_date: "2026-05-15",
    certificate_number: "NIT-2026-8841",
    certificate_hash: "a4f8d2e5b9c17e3f608291a4b5c7d8e9f0123456789abcdef0123456789abcde",
    tx_hash: "0x7d9f3a1b5c8e2d4f6a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f",
    block_number: 14209,
    issuer_address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    status: "VALID",
    created_at: new Date().toISOString(),
  },
  {
    id: "CERT-2026-7219",
    student_name: "Alice M. Johnson",
    student_id: "22BCE0912",
    course_name: "Master of Science in Cybersecurity",
    university_name: "National Institute of Technology",
    certificate_type: "Master of Science Degree",
    issue_date: "2026-06-10",
    graduation_date: "2026-06-01",
    certificate_number: "NIT-2026-7219",
    certificate_hash: "b5e9c3f6a0d28f4a719302b5c6d7e8f10234567890bcdef0123456789abcdef0",
    tx_hash: "0x8e0a4b2c6d9f3e5a7b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a",
    block_number: 14218,
    issuer_address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    status: "VALID",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "CERT-2026-3011",
    student_name: "David K. Miller",
    student_id: "21BCE0455",
    course_name: "Bachelor of Science in Data Analytics",
    university_name: "National Institute of Technology",
    certificate_type: "Bachelor of Science Degree",
    issue_date: "2025-11-12",
    graduation_date: "2025-11-01",
    certificate_number: "NIT-2025-3011",
    certificate_hash: "c6f0d4a7b1e39a5b820413c6d7e8f21345678901cdef0123456789abcdef0123",
    tx_hash: "0x9f1b5c3d7e0a4f6b8c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
    block_number: 13950,
    issuer_address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    status: "REVOKED",
    revocation_reason: "Academic misconduct flagged by Examination Ethics Committee",
    revoked_at: "2026-02-14T10:30:00Z",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export class ClientCertEngine {
  static getStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CERTS));
        return [...DEFAULT_CERTS];
      }
      return JSON.parse(data);
    } catch {
      return [...DEFAULT_CERTS];
    }
  }

  static saveStorage(certs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
    } catch (e) {
      console.warn("Storage write error", e);
    }
  }

  static getLogs() {
    try {
      const data = localStorage.getItem(STATS_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static logVerification(log) {
    try {
      const logs = this.getLogs();
      logs.unshift({
        ...log,
        id: Date.now(),
        verified_at: new Date().toISOString(),
      });
      localStorage.setItem(STATS_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.warn("Log write error", e);
    }
  }

  static async computeSHA256(dataBuffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static generateRandomTxHash() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static async generateQRCode(text) {
    return await QRCode.toDataURL(text, {
      width: 260,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  }

  /**
   * Generates a high-resolution, professional academic certificate PDF in-browser
   */
  static async buildCertificatePDF(certData, qrDataUrl) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const navy = rgb(0.08, 0.12, 0.28);
    const gold = rgb(0.79, 0.64, 0.28);
    const borderGold = rgb(0.85, 0.72, 0.38);
    const darkSlate = rgb(0.18, 0.22, 0.28);
    const mutedSlate = rgb(0.45, 0.5, 0.58);

    // Decorative Borders
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: navy,
      borderWidth: 4,
    });

    page.drawRectangle({
      x: 28,
      y: 28,
      width: width - 56,
      height: height - 56,
      borderColor: borderGold,
      borderWidth: 1.5,
    });

    // Header
    const uniText = (certData.university_name || "NATIONAL UNIVERSITY").toUpperCase();
    const uniWidth = timesRomanBold.widthOfTextAtSize(uniText, 26);
    page.drawText(uniText, {
      x: (width - uniWidth) / 2,
      y: height - 85,
      size: 26,
      font: timesRomanBold,
      color: navy,
    });

    const titleText = (certData.certificate_type || "OFFICIAL DEGREE CERTIFICATE").toUpperCase();
    const titleWidth = timesRoman.widthOfTextAtSize(titleText, 14);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 110,
      size: 14,
      font: timesRoman,
      color: gold,
    });

    // Body
    const introText = "This is to certify that";
    const introWidth = timesRomanItalic.widthOfTextAtSize(introText, 14);
    page.drawText(introText, {
      x: (width - introWidth) / 2,
      y: height - 160,
      size: 14,
      font: timesRomanItalic,
      color: darkSlate,
    });

    const studentName = certData.student_name || "Student Name";
    const nameWidth = timesRomanBold.widthOfTextAtSize(studentName, 30);
    page.drawText(studentName, {
      x: (width - nameWidth) / 2,
      y: height - 205,
      size: 30,
      font: timesRomanBold,
      color: navy,
    });

    const idText = `Student Identification No: ${certData.student_id || "N/A"}`;
    const idWidth = helvetica.widthOfTextAtSize(idText, 11);
    page.drawText(idText, {
      x: (width - idWidth) / 2,
      y: height - 230,
      size: 11,
      font: helvetica,
      color: mutedSlate,
    });

    const completionText = "has fulfilled all academic requirements and successfully completed the curriculum for";
    const compWidth = timesRoman.widthOfTextAtSize(completionText, 13);
    page.drawText(completionText, {
      x: (width - compWidth) / 2,
      y: height - 270,
      size: 13,
      font: timesRoman,
      color: darkSlate,
    });

    const courseText = certData.course_name || "Degree Program";
    const courseWidth = timesRomanBold.widthOfTextAtSize(courseText, 20);
    page.drawText(courseText, {
      x: (width - courseWidth) / 2,
      y: height - 305,
      size: 20,
      font: timesRomanBold,
      color: navy,
    });

    // Dates and Meta
    const datesText = `Graduation Date: ${certData.graduation_date || "N/A"}   |   Date of Issue: ${certData.issue_date || "N/A"}`;
    const datesWidth = helvetica.widthOfTextAtSize(datesText, 10);
    page.drawText(datesText, {
      x: (width - datesWidth) / 2,
      y: height - 345,
      size: 10,
      font: helvetica,
      color: darkSlate,
    });

    const certNumText = `Certificate Serial: ${certData.certificate_number || certData.id}`;
    const certNumWidth = helveticaBold.widthOfTextAtSize(certNumText, 10);
    page.drawText(certNumText, {
      x: (width - certNumWidth) / 2,
      y: height - 365,
      size: 10,
      font: helveticaBold,
      color: gold,
    });

    // Embed QR Code
    if (qrDataUrl) {
      try {
        const qrImage = await pdfDoc.embedPng(qrDataUrl);
        page.drawImage(qrImage, {
          x: 55,
          y: 60,
          width: 95,
          height: 95,
        });

        page.drawText("Scan to Verify on Chain", {
          x: 50,
          y: 45,
          size: 8,
          font: helveticaBold,
          color: navy,
        });
      } catch (err) {
        console.warn("QR embed warning", err);
      }
    }

    // Signatures
    page.drawLine({
      start: { x: width - 260, y: 105 },
      end: { x: width - 60, y: 105 },
      thickness: 1,
      color: darkSlate,
    });
    page.drawText("Authorized University Registrar", {
      x: width - 240,
      y: 90,
      size: 10,
      font: helveticaBold,
      color: navy,
    });
    page.drawText("Cryptographically Verified Credential", {
      x: width - 248,
      y: 75,
      size: 8,
      font: helvetica,
      color: mutedSlate,
    });

    // Blockchain Hash Footer
    const hashLabel = `Blockchain Hash: ${certData.certificate_hash || "PENDING_BLOCKCHAIN_ANCHOR"}`;
    page.drawText(hashLabel.substring(0, 85), {
      x: 170,
      y: 45,
      size: 7.5,
      font: helvetica,
      color: mutedSlate,
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
