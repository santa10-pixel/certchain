const express = require("express");
const router = express.Router();
const CertificateController = require("../controllers/certificateController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Admin operations (protected)
router.post(
  "/",
  authMiddleware,
  upload.single("certificateFile"),
  CertificateController.issueCertificate
);
router.get("/", CertificateController.getAllCertificates); // Public/Student can filter by studentId, search, etc.
router.get("/:id", CertificateController.getCertificateById);
router.post("/:id/revoke", authMiddleware, CertificateController.revokeCertificate);
router.get("/:id/download", CertificateController.downloadCertificatePDF);

module.exports = router;
