const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const dbPath = process.env.DB_PATH || path.resolve(__dirname, "../../data/academic_cert.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database at:", dbPath);
    initTables();
  }
});

function initTables() {
  db.serialize(() => {
    // Users table for Admin / Staff auth
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Certificates table for off-chain metadata & document tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        student_name TEXT NOT NULL,
        student_id TEXT NOT NULL,
        course_name TEXT NOT NULL,
        university_name TEXT NOT NULL,
        certificate_type TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        graduation_date TEXT NOT NULL,
        certificate_number TEXT UNIQUE NOT NULL,
        certificate_hash TEXT NOT NULL,
        tx_hash TEXT,
        block_number INTEGER,
        issuer_address TEXT,
        pdf_path TEXT NOT NULL,
        qr_path TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'VALID',
        revocation_reason TEXT,
        revoked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verification activity logs for audit and analytics
    db.run(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        certificate_id TEXT,
        verification_method TEXT NOT NULL,
        result TEXT NOT NULL,
        computed_hash TEXT,
        onchain_hash TEXT,
        ip_address TEXT,
        verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default admin user if not exists
    const defaultEmail = process.env.ADMIN_EMAIL || "admin@university.edu";
    const defaultPass = process.env.ADMIN_PASSWORD || "Admin@Cert2026!";

    db.get("SELECT id FROM users WHERE email = ?", [defaultEmail], (err, row) => {
      if (err) {
        console.error("Error querying users table:", err);
        return;
      }
      if (!row) {
        const hash = bcrypt.hashSync(defaultPass, 10);
        db.run(
          "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
          [defaultEmail, hash, "admin"],
          (insertErr) => {
            if (insertErr) {
              console.error("Error creating default admin user:", insertErr);
            } else {
              console.log("Default admin account created:", defaultEmail);
            }
          }
        );
      }
    });
  });
}

// Promisified database helpers for clean async/await code
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = db;
