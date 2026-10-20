const express = require("express");
const router = express.Router();
const VerificationController = require("../controllers/verificationController");
const upload = require("../middleware/uploadMiddleware");

// Public verification endpoints
router.get("/:id", VerificationController.verifyById);
router.post("/file", upload.single("certificateFile"), VerificationController.verifyByFile);

module.exports = router;
