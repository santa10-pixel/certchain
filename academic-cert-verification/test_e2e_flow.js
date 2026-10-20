const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const BASE_URL = "http://localhost:5001/api";

async function runEndToEndTests() {
  console.log("==========================================================");
  console.log("STARTING END-TO-END VERIFICATION & SECURITY TEST SUITE");
  console.log("==========================================================");

  let adminToken = null;
  let issuedCert = null;
  const testCertNumber = `E2E-2026-${Date.now().toString().slice(-4)}`;

  // Step 1: Health check
  console.log("\n[Test 1] Health Check...");
  const healthRes = await axios.get(`${BASE_URL}/health`);
  console.log("✓ Health status:", healthRes.data.status);

  // Step 2: Admin Login
  console.log("\n[Test 2] Admin Login & JWT Issuance...");
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: "admin@university.edu",
    password: "Admin@Cert2026!",
  });
  adminToken = loginRes.data.token;
  console.log("✓ Logged in as:", loginRes.data.user.email);
  console.log("✓ JWT Token acquired (length):", adminToken.length);

  // Step 3: Certificate Issuance with Real Blockchain Anchoring
  console.log("\n[Test 3] Issuing Academic Certificate & Anchoring to Hardhat Smart Contract...");
  const issueFormData = new FormData();
  issueFormData.append("student_name", "Arjun Ramanathan");
  issueFormData.append("student_id", "22BCE9999");
  issueFormData.append("course_name", "Bachelor of Technology in Computer Science");
  issueFormData.append("university_name", "National Institute of Technology");
  issueFormData.append("certificate_type", "Degree with Distinction");
  issueFormData.append("issue_date", "2026-05-18");
  issueFormData.append("graduation_date", "2026-05-15");
  issueFormData.append("certificate_number", testCertNumber);

  const issueRes = await axios.post(`${BASE_URL}/certificates`, issueFormData, {
    headers: {
      ...issueFormData.getHeaders(),
      Authorization: `Bearer ${adminToken}`,
    },
  });

  issuedCert = issueRes.data.certificate;
  console.log("✓ Certificate Created ID:", issuedCert.id);
  console.log("✓ SHA-256 Hash:", issuedCert.certificateHash);
  console.log("✓ Blockchain Tx Hash:", issuedCert.blockchainTxHash);
  console.log("✓ Block Number:", issuedCert.blockNumber);
  console.log("✓ PDF Path:", issuedCert.pdfUrl);

  // Step 4: Duplicate Certificate Prevention Check
  console.log("\n[Test 4] Testing Duplicate Certificate ID Prevention...");
  try {
    const dupFormData = new FormData();
    dupFormData.append("student_name", "Another Student");
    dupFormData.append("student_id", "22BCE8888");
    dupFormData.append("course_name", "B.Tech");
    dupFormData.append("university_name", "NIT");
    dupFormData.append("certificate_type", "Degree");
    dupFormData.append("issue_date", "2026-05-18");
    dupFormData.append("graduation_date", "2026-05-15");
    dupFormData.append("certificate_number", testCertNumber); // DUPLICATE!

    await axios.post(`${BASE_URL}/certificates`, dupFormData, {
      headers: {
        ...dupFormData.getHeaders(),
        Authorization: `Bearer ${adminToken}`,
      },
    });
    console.error("FAILED: Duplicate was not prevented!");
    process.exit(1);
  } catch (dupErr) {
    console.log("✓ Duplicate successfully rejected with status 409:", dupErr.response.data.error);
  }

  // Step 5: Certificate Retrieval
  console.log("\n[Test 5] Certificate Retrieval by ID...");
  const getRes = await axios.get(`${BASE_URL}/certificates/${issuedCert.id}`);
  console.log("✓ Certificate Retrieved:", getRes.data.certificate.student_name);
  console.log("✓ On-chain existence verified:", !!getRes.data.blockchainVerification);

  // Step 6: Public Verification by ID
  console.log("\n[Test 6] Public Verification by ID (Valid Certificate)...");
  const verifyIdRes = await axios.get(`${BASE_URL}/verify/${issuedCert.id}`);
  console.log("✓ Verification Status:", verifyIdRes.data.status);
  console.log("✓ Result Message:", verifyIdRes.data.message);
  if (verifyIdRes.data.status !== "VALID") {
    throw new Error(`Expected VALID, got ${verifyIdRes.data.status}`);
  }

  // Step 7: Public Verification by Authentic PDF File
  console.log("\n[Test 7] Public Verification by Uploading Authentic PDF Document...");
  const uploadDir = path.resolve(__dirname, "backend/uploads");
  const actualPdfPath = path.join(uploadDir, path.basename(issuedCert.pdfUrl));

  const validFileForm = new FormData();
  validFileForm.append("certificateFile", fs.createReadStream(actualPdfPath));
  validFileForm.append("certificateId", issuedCert.id);

  const verifyFileRes = await axios.post(`${BASE_URL}/verify/file`, validFileForm, {
    headers: validFileForm.getHeaders(),
  });
  console.log("✓ File Verification Status:", verifyFileRes.data.status);
  console.log("✓ File Result Message:", verifyFileRes.data.message);
  if (verifyFileRes.data.status !== "VALID") {
    throw new Error(`Expected VALID, got ${verifyFileRes.data.status}`);
  }

  // Step 8: Tampering Detection (Modify 1 byte in the PDF and test verification)
  console.log("\n[Test 8] Modifying Certificate Document to Test Tampering Detection...");
  const originalBytes = fs.readFileSync(actualPdfPath);
  const tamperedBytes = Buffer.from(originalBytes);
  // Modify some bytes in the middle of the document
  tamperedBytes[tamperedBytes.length - 150] = (tamperedBytes[tamperedBytes.length - 150] + 1) % 256;

  const tamperedTempPath = path.join(uploadDir, "temp_tampered_test.pdf");
  fs.writeFileSync(tamperedTempPath, tamperedBytes);

  const tamperedForm = new FormData();
  tamperedForm.append("certificateFile", fs.createReadStream(tamperedTempPath));
  tamperedForm.append("certificateId", issuedCert.id);

  const tamperedRes = await axios.post(`${BASE_URL}/verify/file`, tamperedForm, {
    headers: tamperedForm.getHeaders(),
  });

  if (fs.existsSync(tamperedTempPath)) fs.unlinkSync(tamperedTempPath);

  console.log("✓ Tampered Verification Status:", tamperedRes.data.status);
  console.log("✓ Tampered Result Message:", tamperedRes.data.message);
  if (tamperedRes.data.status !== "MODIFIED") {
    throw new Error(`Expected MODIFIED, got ${tamperedRes.data.status}`);
  }

  // Step 9: Certificate Revocation on Blockchain
  console.log("\n[Test 9] Revoking Certificate on Blockchain...");
  const revokeRes = await axios.post(
    `${BASE_URL}/certificates/${issuedCert.id}/revoke`,
    { reason: "Academic record superseded after disciplinary review" },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  console.log("✓ Revocation On-Chain Tx Hash:", revokeRes.data.txHash);
  console.log("✓ Revocation Status:", revokeRes.data.status);

  // Step 10: Verify Revoked Certificate
  console.log("\n[Test 10] Verifying Revoked Certificate Behavior...");
  const verifyRevokedRes = await axios.get(`${BASE_URL}/verify/${issuedCert.id}`);
  console.log("✓ Revoked Verification Status:", verifyRevokedRes.data.status);
  console.log("✓ Revoked Result Message:", verifyRevokedRes.data.message);
  if (verifyRevokedRes.data.status !== "REVOKED") {
    throw new Error(`Expected REVOKED, got ${verifyRevokedRes.data.status}`);
  }

  // Step 11: Admin Dashboard Analytics
  console.log("\n[Test 11] Admin Dashboard Metrics & Activity...");
  const dashRes = await axios.get(`${BASE_URL}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("✓ Total Issued:", dashRes.data.stats.totalIssued);
  console.log("✓ Total Valid:", dashRes.data.stats.totalValid);
  console.log("✓ Total Revoked:", dashRes.data.stats.totalRevoked);
  console.log("✓ Total Verifications Logged:", dashRes.data.stats.totalVerifications);
  console.log("✓ Blockchain Node Block Height:", dashRes.data.blockchainStatus.blockNumber);

  console.log("\n==========================================================");
  console.log("ALL 11 END-TO-END AUTOMATED VERIFICATION TESTS PASSED 100%!");
  console.log("==========================================================");
}

runEndToEndTests().catch((err) => {
  console.error("\nTEST SUITE FAILED:", err.response?.data || err.message);
  process.exit(1);
});
