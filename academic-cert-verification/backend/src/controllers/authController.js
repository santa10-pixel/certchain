const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required fields.",
        });
      }

      const user = await db.getAsync("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password.",
        });
      }

      const secret = process.env.JWT_SECRET || "certix_super_secure_jwt_secret_academic_2026";
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        secret,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Administrator authenticated successfully.",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await db.getAsync("SELECT id, email, role, created_at FROM users WHERE id = ?", [req.user.id]);
      if (!user) {
        return res.status(404).json({ success: false, error: "User record not found." });
      }
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
