const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected dashboard stats
router.get("/stats", authMiddleware, DashboardController.getStats);

module.exports = router;
