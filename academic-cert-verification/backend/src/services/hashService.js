const crypto = require("crypto");
const fs = require("fs");

class HashService {
  /**
   * Calculate SHA-256 hash of a file at the given filepath
   * @param {string} filePath
   * @returns {Promise<string>} 64-character lowercase hex string
   */
  static calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(filePath);

      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", (err) => reject(err));
    });
  }

  /**
   * Calculate SHA-256 hash of a buffer or string
   * @param {Buffer|string} buffer
   * @returns {string} 64-character lowercase hex string
   */
  static calculateBufferHash(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Convert a hex string to standard bytes32 hex format for Solidity (prefix with 0x)
   * @param {string} hexString
   * @returns {string}
   */
  static toBytes32(hexString) {
    const clean = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
    return "0x" + clean.padStart(64, "0").slice(0, 64);
  }
}

module.exports = HashService;
