const multer = require("multer");

function errorHandler(err, req, res, next) {
  console.error("API Error encountered:", err);

  // Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File upload size exceeded limit. Maximum allowable certificate file size is 15 MB.",
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  }

  // Custom validation or format error
  if (err.message && err.message.includes("Invalid file format")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Blockchain contract revert or RPC connection failure
  if (err.code === "CALL_EXCEPTION" || err.message?.includes("revert")) {
    return res.status(400).json({
      success: false,
      error: `Blockchain execution reverted: ${err.reason || err.shortMessage || err.message}`,
    });
  }

  // General server error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error occurred while processing your request.",
  });
}

module.exports = errorHandler;
