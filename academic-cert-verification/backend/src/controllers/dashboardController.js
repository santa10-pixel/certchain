const db = require("../config/database");
const blockchainService = require("../services/blockchainService");

class DashboardController {
  static async getStats(req, res, next) {
    try {
      // Aggregate stats
      const totalIssuedRow = await db.getAsync("SELECT COUNT(*) as count FROM certificates");
      const validCertsRow = await db.getAsync("SELECT COUNT(*) as count FROM certificates WHERE status = 'VALID'");
      const revokedCertsRow = await db.getAsync("SELECT COUNT(*) as count FROM certificates WHERE status = 'REVOKED'");
      const totalVerificationsRow = await db.getAsync("SELECT COUNT(*) as count FROM verification_logs");

      // Recent certificates
      const recentCertificates = await db.allAsync(
        "SELECT id, student_name, student_id, course_name, university_name, certificate_number, status, tx_hash, created_at FROM certificates ORDER BY created_at DESC LIMIT 5"
      );

      // Recent verification activity
      const recentVerifications = await db.allAsync(
        "SELECT id, certificate_id, verification_method, result, ip_address, verified_at FROM verification_logs ORDER BY verified_at DESC LIMIT 10"
      );

      // Blockchain live status
      const blockchainStatus = await blockchainService.getNetworkStatus();

      res.json({
        success: true,
        stats: {
          totalIssued: totalIssuedRow ? totalIssuedRow.count : 0,
          totalValid: validCertsRow ? validCertsRow.count : 0,
          totalRevoked: revokedCertsRow ? revokedCertsRow.count : 0,
          totalVerifications: totalVerificationsRow ? totalVerificationsRow.count : 0,
        },
        recentCertificates,
        recentVerifications,
        blockchainStatus,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DashboardController;
