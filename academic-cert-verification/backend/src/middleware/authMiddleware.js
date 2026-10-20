const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication token required. Please log in as university administrator.",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "certix_super_secure_jwt_secret_academic_2026";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired authentication token. Please log in again.",
    });
  }
}

module.exports = authMiddleware;
