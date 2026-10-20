const request = require("supertest");
const { expect } = require("chai");
const path = require("path");
const fs = require("fs");
const app = require("../src/app");
const db = require("../src/config/database");

describe("Backend API Integration Tests", function () {
  this.timeout(15000);

  let adminToken;
  const testCertNumber = "TEST-2026-9999";
  const testCertId = "CERT-TEST-2026-9999";

  before(async function () {
    // Wait briefly for SQLite to initialize tables & seed admin
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Authenticate admin to get JWT token
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@university.edu",
        password: "Admin@Cert2026!",
      });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.token).to.be.a("string");
    adminToken = res.body.token;
  });

  after(async function () {
    // Clean up test certificate from DB if created
    await db.runAsync("DELETE FROM certificates WHERE id = ? OR certificate_number = ?", [
      testCertId,
      testCertNumber,
    ]);
  });

  describe("GET /api/health", function () {
    it("Should return 200 and healthy status", async function () {
      const res = await request(app).get("/api/health");
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("healthy");
    });
  });

  describe("Authentication API", function () {
    it("Should reject login with invalid credentials", async function () {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@university.edu",
          password: "WrongPassword123!",
        });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
    });

    it("Should allow access to /api/auth/me with valid JWT", async function () {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.user.email).to.equal("admin@university.edu");
    });

    it("Should reject /api/auth/me without authorization header", async function () {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).to.equal(401);
    });
  });

  describe("Public Verification API", function () {
    it("Should return 404 for non-existent certificate ID", async function () {
      const res = await request(app).get("/api/verify/CERT-DOES-NOT-EXIST-404");
      expect(res.status).to.equal(404);
      expect(res.body.status).to.equal("NOT_FOUND");
      expect(res.body.message).to.equal("Certificate not found");
    });

    it("Should reject file verification when no file is uploaded", async function () {
      const res = await request(app).post("/api/verify/file");
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include("upload a certificate PDF file");
    });

    it("Should reject non-PDF file upload with validation error", async function () {
      const tempTxt = path.join(__dirname, "test_file.txt");
      fs.writeFileSync(tempTxt, "This is not a PDF");

      const res = await request(app)
        .post("/api/verify/file")
        .attach("certificateFile", tempTxt);

      if (fs.existsSync(tempTxt)) fs.unlinkSync(tempTxt);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include("Only official PDF documents are accepted");
    });
  });

  describe("Certificate Issuance Validation", function () {
    it("Should reject issuance without admin JWT token", async function () {
      const res = await request(app)
        .post("/api/certificates")
        .send({
          student_name: "John Doe",
          student_id: "2026CS01",
        });

      expect(res.status).to.equal(401);
    });

    it("Should reject issuance when mandatory fields are missing", async function () {
      const res = await request(app)
        .post("/api/certificates")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          student_name: "John Doe",
          // missing other required fields
        });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include("mandatory");
    });
  });

  describe("Admin Dashboard API", function () {
    it("Should return statistics and blockchain status for authenticated admin", async function () {
      const res = await request(app)
        .get("/api/dashboard/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.stats).to.have.property("totalIssued");
      expect(res.body.stats).to.have.property("totalValid");
      expect(res.body.stats).to.have.property("totalRevoked");
      expect(res.body).to.have.property("blockchainStatus");
    });
  });
});
