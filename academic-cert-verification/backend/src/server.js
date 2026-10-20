const app = require("./app");

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log("=================================================");
  console.log(`Backend Server running on port: ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log("=================================================");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
