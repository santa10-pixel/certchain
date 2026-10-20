require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static generated uploads (PDFs, QR codes)
const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, "../uploads");
app.use("/uploads", express.static(uploadDir));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Blockchain-Based Secure Academic Certificate Verification System API",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
