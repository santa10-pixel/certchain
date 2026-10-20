const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `upload_${uniqueSuffix}_${sanitized}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Enforce PDF only
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype === "application/pdf" || ext === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Only official PDF documents are accepted for verification."), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit
  },
  fileFilter,
});

module.exports = upload;
