const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

class PDFService {
  /**
   * Generate an official academic certificate PDF with embedded QR code and verification footprint
   * @param {Object} certData
   * @param {string} qrImagePath
   * @param {string} outputDir
   * @returns {Promise<{ filePath: string, filename: string, buffer: Buffer }>}
   */
  static async generateCertificatePDF(certData, qrImagePath, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const {
      certificateId,
      studentName,
      studentId,
      courseName,
      universityName,
      certificateType,
      issueDate,
      graduationDate,
      certificateNumber,
    } = certData;

    // Landscape A4: 841.89 x 595.28 points
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Color definitions
    const navy = rgb(0.08, 0.12, 0.28);
    const gold = rgb(0.79, 0.64, 0.28);
    const darkSlate = rgb(0.18, 0.22, 0.28);
    const mutedSlate = rgb(0.45, 0.5, 0.58);
    const borderGold = rgb(0.85, 0.72, 0.38);

    // Outer decorative border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: navy,
      borderWidth: 4,
    });

    // Inner gold border
    page.drawRectangle({
      x: 28,
      y: 28,
      width: width - 56,
      height: height - 56,
      borderColor: borderGold,
      borderWidth: 1.5,
    });

    // Corner decorative accents
    const corners = [
      { x: 32, y: height - 32 },
      { x: width - 42, y: height - 32 },
      { x: 32, y: 42 },
      { x: width - 42, y: 42 },
    ];
    for (const c of corners) {
      page.drawRectangle({
        x: c.x,
        y: c.y - 10,
        width: 10,
        height: 10,
        color: gold,
      });
    }

    // Header: University Name
    const uniText = (universityName || "NATIONAL UNIVERSITY OF TECHNOLOGY").toUpperCase();
    const uniTextWidth = timesRomanBold.widthOfTextAtSize(uniText, 26);
    page.drawText(uniText, {
      x: (width - uniTextWidth) / 2,
      y: height - 85,
      size: 26,
      font: timesRomanBold,
      color: navy,
    });

    // Certificate Type title (e.g. DEGREE CERTIFICATE, CERTIFICATE OF ACHIEVEMENT)
    const titleText = (certificateType || "OFFICIAL DEGREE CERTIFICATE").toUpperCase();
    const titleWidth = timesRoman.widthOfTextAtSize(titleText, 14);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 110,
      size: 14,
      font: timesRoman,
      color: gold,
    });

    // Decorative divider line under header
    page.drawLine({
      start: { x: width / 2 - 140, y: height - 122 },
      end: { x: width / 2 + 140, y: height - 122 },
      thickness: 1,
      color: gold,
    });

    // "This is to certify that"
    const certifyText = "This is to certify that";
    const certifyWidth = timesRomanItalic.widthOfTextAtSize(certifyText, 15);
    page.drawText(certifyText, {
      x: (width - certifyWidth) / 2,
      y: height - 165,
      size: 15,
      font: timesRomanItalic,
      color: darkSlate,
    });

    // Student Name (large, bold, prominent)
    const nameText = studentName || "Student Name";
    const nameWidth = timesRomanBold.widthOfTextAtSize(nameText, 30);
    page.drawText(nameText, {
      x: (width - nameWidth) / 2,
      y: height - 210,
      size: 30,
      font: timesRomanBold,
      color: navy,
    });

    // Student ID subtitle
    const idSubtitle = `Student Registration ID: ${studentId || "N/A"}`;
    const idWidth = helvetica.widthOfTextAtSize(idSubtitle, 11);
    page.drawText(idSubtitle, {
      x: (width - idWidth) / 2,
      y: height - 232,
      size: 11,
      font: helvetica,
      color: mutedSlate,
    });

    // Degree / Course conferral statement
    const conferralText = "has successfully completed the prescribed curriculum and fulfilled all academic requirements for";
    const conferralWidth = timesRoman.widthOfTextAtSize(conferralText, 13);
    page.drawText(conferralText, {
      x: (width - conferralWidth) / 2,
      y: height - 275,
      size: 13,
      font: timesRoman,
      color: darkSlate,
    });

    // Course Name (prominent bold)
    const courseText = courseName || "Bachelor of Technology in Computer Science";
    const courseWidth = timesRomanBold.widthOfTextAtSize(courseText, 22);
    page.drawText(courseText, {
      x: (width - courseWidth) / 2,
      y: height - 310,
      size: 22,
      font: timesRomanBold,
      color: navy,
    });

    // Dates statement
    const dateStatement = `Awarded on ${issueDate || "N/A"}  •  Graduation Date: ${graduationDate || "N/A"}`;
    const dateWidth = helvetica.widthOfTextAtSize(dateStatement, 11);
    page.drawText(dateStatement, {
      x: (width - dateWidth) / 2,
      y: height - 345,
      size: 11,
      font: helvetica,
      color: darkSlate,
    });

    // Embed QR Code if exists
    if (qrImagePath && fs.existsSync(qrImagePath)) {
      const qrImageBytes = fs.readFileSync(qrImagePath);
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      const qrSize = 92;

      // Draw QR Code on the bottom-right
      page.drawImage(qrImage, {
        x: width - 150,
        y: 65,
        width: qrSize,
        height: qrSize,
      });

      const qrLabel = "Scan to Verify On-Chain";
      const qrLabelWidth = helveticaBold.widthOfTextAtSize(qrLabel, 8);
      page.drawText(qrLabel, {
        x: width - 150 + (qrSize - qrLabelWidth) / 2,
        y: 52,
        size: 8,
        font: helveticaBold,
        color: navy,
      });
    }

    // Signatures Section (Left: Registrar, Center: Dean)
    // Registrar Signature
    page.drawLine({
      start: { x: 70, y: 100 },
      end: { x: 230, y: 100 },
      thickness: 1,
      color: darkSlate,
    });
    page.drawText("Dr. Rajeshwar Sharma", {
      x: 75,
      y: 86,
      size: 10,
      font: timesRomanBold,
      color: navy,
    });
    page.drawText("University Registrar", {
      x: 75,
      y: 72,
      size: 9,
      font: timesRomanItalic,
      color: mutedSlate,
    });

    // Vice-Chancellor / Dean Signature
    page.drawLine({
      start: { x: 280, y: 100 },
      end: { x: 440, y: 100 },
      thickness: 1,
      color: darkSlate,
    });
    page.drawText("Prof. K. Sundararajan", {
      x: 285,
      y: 86,
      size: 10,
      font: timesRomanBold,
      color: navy,
    });
    page.drawText("Vice-Chancellor & Dean", {
      x: 285,
      y: 72,
      size: 9,
      font: timesRomanItalic,
      color: mutedSlate,
    });

    // Bottom Security & Blockchain Footprint Bar
    const footerText = `Certificate ID: ${certificateId}  |  Doc No: ${certificateNumber}  |  Secured by Ethereum Smart Contract`;
    page.drawText(footerText, {
      x: 40,
      y: 35,
      size: 8.5,
      font: helveticaBold,
      color: navy,
    });

    const pdfBytes = await pdfDoc.save();
    const filename = `cert_${certificateId.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    const filePath = path.join(outputDir, filename);

    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    return {
      filePath,
      filename,
      buffer: Buffer.from(pdfBytes),
    };
  }
}

module.exports = PDFService;
