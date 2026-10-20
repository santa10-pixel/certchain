const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

class QRService {
  /**
   * Generate QR Code linking to verification URL
   * @param {string} certificateId
   * @param {string} outputDir
   * @returns {Promise<{ filePath: string, dataUrl: string, verificationUrl: string }>}
   */
  static async generateCertificateQR(certificateId, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${frontendBaseUrl}/verify/${encodeURIComponent(certificateId)}`;

    const filename = `qr_${certificateId.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
    const filePath = path.join(outputDir, filename);

    // Save PNG file
    await QRCode.toFile(filePath, verificationUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
      color: {
        dark: "#1e1b4b", // deep indigo
        light: "#ffffff",
      },
    });

    // Also get data URL for embedding or frontend display
    const dataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
    });

    return {
      filePath,
      filename,
      dataUrl,
      verificationUrl,
    };
  }
}

module.exports = QRService;
