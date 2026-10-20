# Blockchain-Based Secure Academic Certificate Verification System

> **A production-style, conference-ready decentralized framework that allows universities to issue tamper-evident academic certificates and allows employers, universities, or students to verify authenticity, identify modifications, and detect revocations in seconds.**

---

## 1. Project Overview & Objective

Academic credential fraud, fake diplomas, and altered transcripts undermine trust in educational achievements. Traditional paper credentials and simple digital PDFs are vulnerable to unauthorized edits, forged seals, and slow manual background verification bureaucracies.

This project implements a complete, end-to-end, privacy-preserving blockchain architecture:
1. **University Administrator** creates and signs academic certificates. The system generates an official landscape PDF containing university seal, signatures, and an embedded verification QR code.
2. The **SHA-256 cryptographic hash** of the final document is computed and anchored directly to an Ethereum smart contract (`AcademicCertificateRegistry.sol`).
3. **No Private Personal Data (PII) is stored on-chain**. The blockchain acts solely as an immutable proof of authenticity.
4. **Students** can access, download, and share their credentials, copy verification links, and display verification QR codes.
5. **Public Verifiers & Employers** can verify certificates instantly by:
   - Entering the Certificate ID / Document Number, OR
   - Scanning the certificate's embedded QR code, OR
   - Drag-and-dropping the PDF document for client-side and server-side cryptographic hash comparison.
6. The verification engine delivers one of four clear, unambiguous outcomes:
   - **"Certificate is valid and authentic"**
   - **"Certificate has been modified"** (tamper detected)
   - **"Certificate not found"**
   - **"Certificate has been revoked"**

---

## 2. System Architecture

```
[ Frontend: React.js + Vite + Tailwind CSS ]
           │
           │  REST API Calls (Axios + Multipart Form-Data)
           ▼
[ Backend: Node.js + Express.js API ]
   ├── Authentication (JWT + Bcrypt Password Hashing)
   ├── PDF Generation Engine (pdf-lib, A4 Landscape, Seals, Signatures)
   ├── Dynamic QR Code Generator (qrcode, links to /verify/:id)
   ├── Cryptographic Hash Engine (SHA-256 via Crypto / Web Crypto)
   └── Storage & Database
         ├── Local Uploads Directory (/uploads/cert_*.pdf, /uploads/qr_*.png)
         └── SQLite Database (Users, Certificates Metadata, Verification Audit Logs)
           │
           │  Ethers.js v6 (JSON-RPC)
           ▼
[ Blockchain Trust Layer: Hardhat Local EVM Node (Port 8545) ]
   └── Smart Contract: AcademicCertificateRegistry.sol
         ├── issueCertificate(id, bytes32Hash, docRef)
         ├── verifyCertificateHash(id, bytes32Candidate)
         ├── revokeCertificate(id)
         ├── certificateExists(id)
         └── Access Control Modifiers (onlyOwner, onlyAuthorized)
```

---

## 3. Technology Stack

| Layer | Technologies Used | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons, React Router DOM, Axios | React 18, Vite 5 | Fast, responsive UI for Admin, Student, and Public Verifier |
| **Backend** | Node.js, Express.js, Multer, Bcrypt.js, JsonWebToken | Express 4.19 | REST API, input validation, authentication, and error handling |
| **Blockchain** | Solidity, Hardhat, Ethers.js | Solidity 0.8.20, Hardhat 2.22, Ethers 6.13 | Smart contract registry, local EVM node, and cryptographic transactions |
| **Database** | SQLite3 | 5.1.7 | Self-contained metadata storage, user credentials, and verification audit trail |
| **Document Tools** | pdf-lib, qrcode | pdf-lib 1.17, qrcode 1.5 | Official certificate PDF rendering and dynamic QR code generation |
| **Testing** | Mocha, Chai, Supertest, Hardhat Test | Mocha 10, Chai 4 | Smart contract unit tests & backend integration testing |

---

## 4. Project Directory Structure

```
academic-cert-verification/
├── blockchain/
│   ├── contracts/
│   │   └── AcademicCertificateRegistry.sol  # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js                        # Hardhat deployment script (exports ABI/address)
│   ├── test/
│   │   └── AcademicCertificateRegistry.test.js # 15 Smart contract tests (100% pass)
│   ├── hardhat.config.js                    # Hardhat config (Solidity 0.8.20, localhost)
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js                  # SQLite database setup & admin seeder
│   │   │   ├── blockchain.js                # Provider & wallet connection
│   │   │   └── contractConfig.json          # Auto-generated contract ABI & address
│   │   ├── controllers/
│   │   │   ├── authController.js            # Login & JWT profile
│   │   │   ├── certificateController.js     # Issuance, listing, download, revocation
│   │   │   ├── verificationController.js    # ID & File upload verification
│   │   │   └── dashboardController.js       # Admin stats & node telemetry
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js            # JWT verification middleware
│   │   │   ├── uploadMiddleware.js          # File type (.pdf only) & 15MB size check
│   │   │   └── errorHandler.js              # Centralized error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── certificateRoutes.js
│   │   │   ├── verificationRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── services/
│   │   │   ├── blockchainService.js         # Direct on-chain calls with nonce tracking
│   │   │   ├── hashService.js               # SHA-256 calculation
│   │   │   ├── pdfService.js                # Official certificate PDF generation
│   │   │   └── qrService.js                 # High-res verification QR code generator
│   │   ├── app.js                           # Express application
│   │   └── server.js                        # HTTP server runner
│   ├── test/
│   │   └── api.test.js                      # 10 Integration tests (Mocha/Chai/Supertest)
│   ├── uploads/                             # Stored PDFs and QR code PNGs
│   ├── .env.example                         # Environment template
│   ├── .env                                 # Local configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                   # Responsive header navigation
│   │   │   ├── Footer.jsx                   # Footer & system info
│   │   │   ├── StatusBadge.jsx              # Color-coded status indicator
│   │   │   └── AlertToast.jsx               # Error/success alert banners
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx              # 1. Landing page
│   │   │   ├── AdminLoginPage.jsx           # 2. Admin login page
│   │   │   ├── AdminDashboardPage.jsx       # 3. Admin dashboard
│   │   │   ├── IssueCertificatePage.jsx     # 4. Issue certificate page
│   │   │   ├── CertificateListPage.jsx      # 5. Certificate list page
│   │   │   ├── CertificateDetailsPage.jsx   # 6. Certificate details page
│   │   │   ├── StudentCertificatesPage.jsx  # 7. Student certificate page
│   │   │   ├── PublicVerificationPage.jsx   # 8. Public verification page
│   │   │   └── AboutProjectPage.jsx         # 10. About/project architecture page
│   │   ├── services/
│   │   │   └── api.js                       # Axios client & Web Crypto SHA-256
│   │   ├── App.jsx                          # React Router definitions
│   │   ├── index.css                        # Tailwind CSS styles
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── test_e2e_flow.js                         # 11 Automated end-to-end integration tests
└── README.md
```

---

## 5. Prerequisites & Environment Setup

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Operating System**: macOS, Linux, or Windows (WSL / PowerShell)

### Environment Variables (`backend/.env`)

```ini
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security & Authentication
JWT_SECRET=certix_super_secure_jwt_secret_academic_2026
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=Admin@Cert2026!

# Hardhat Local Node
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
# Hardhat Account #0 default private key
ISSUER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Database & Storage
DB_PATH=./data/academic_cert.db
UPLOAD_DIR=./uploads
```

---

## 6. Step-by-Step Installation & Local Execution

### Step 1: Clone or Navigate to the Project

```bash
cd academic-cert-verification
```

### Step 2: Install Dependencies

```bash
# 1. Install Blockchain dependencies
cd blockchain && npm install

# 2. Install Backend dependencies
cd ../backend && npm install

# 3. Install Frontend dependencies
cd ../frontend && npm install

cd ..
```

### Step 3: Start the Local Hardhat Blockchain Node

Open **Terminal 1**:
```bash
cd academic-cert-verification/blockchain
npx hardhat node
```
*Leave this terminal running. It will expose a JSON-RPC endpoint at `http://127.0.0.1:8545`.*

### Step 4: Deploy the Smart Contract

Open **Terminal 2**:
```bash
cd academic-cert-verification/blockchain
npx hardhat run scripts/deploy.js --network localhost
```
*Output will display:*
```text
AcademicCertificateRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Contract config written to backend: .../backend/src/config/contractConfig.json
```

### Step 5: Start the Backend API Server

In **Terminal 2**:
```bash
cd ../backend
npm start
```
*Server will start on `http://localhost:5001`.*

### Step 6: Start the Frontend Web Application

Open **Terminal 3**:
```bash
cd academic-cert-verification/frontend
npm run dev
```
*Vite dev server will start at:*
```text
➜ Local: http://localhost:5173/
```

Open your browser and navigate to **`http://localhost:5173`**!

---

## 7. Demo Administrator Credentials

The SQLite database is pre-seeded on startup with a default administrator account:
- **Email:** `admin@university.edu`
- **Password:** `Admin@Cert2026!`
- *(Or click the **"Auto-Fill Demo Admin Credentials"** button on `/admin/login`)*

---

## 8. Example Verification Workflow (Live Demonstration)

### Flow A: University Administrator Issues Certificate
1. Open `http://localhost:5173/admin/login` and log in.
2. Click **"Issue Certificate"** in the navigation bar.
3. Click **"Auto-Fill Realistic Sample Data"** (or enter student details manually).
4. Click **"Inscribe & Anchor on Blockchain"**.
5. The system:
   - Generates an official landscape PDF certificate with signatures.
   - Embeds a dynamic QR code linking to `/verify/CERT-...`.
   - Computes the SHA-256 hash.
   - Sends a smart contract transaction on the Hardhat node.
   - Shows the generated Certificate ID, Transaction Hash, and **"Download Official PDF"** button.

### Flow B: Employer/Verifier Verifies by Certificate ID or QR
1. Go to `http://localhost:5173/verify`.
2. Enter the Certificate ID (e.g., `CERT-NIT-2026-0042`) or scan the QR code.
3. Click **"Verify Certificate on Blockchain"**.
4. Result: **`Certificate is valid and authentic`** with full academic metadata and blockchain transaction proof.

### Flow C: Employer/Verifier Verifies by File Upload
1. On `http://localhost:5173/verify`, switch to the **"Upload Certificate PDF"** tab.
2. Drag and drop the downloaded certificate PDF.
3. The browser calculates the SHA-256 hash in real-time.
4. Click **"Calculate Hash & Verify Document"**.
5. Result: **`Certificate is valid and authentic`**.

### Flow D: Tampering Detection Demonstration
1. Open the downloaded certificate PDF in a text editor or hex editor.
2. Alter any single character (e.g., changing grade or student name) and save.
3. Upload the modified PDF to `http://localhost:5173/verify` and supply the claimed Certificate ID.
4. Result: **`Certificate has been modified`** with amber tamper warning!

### Flow E: Certificate Revocation
1. Log in as Admin and go to `/admin/certificates`.
2. Click **"Revoke"** next to the certificate and provide a reason.
3. An on-chain transaction updates the smart contract status.
4. When any verifier now checks this certificate, it immediately returns: **`Certificate has been revoked`**.

---

## 9. Automated Testing & Verification Commands

### 1. Smart Contract Test Suite (15 Tests)
```bash
cd blockchain
npx hardhat test
```
*Results:*
```text
  AcademicCertificateRegistry Contract
    Deployment & Authorization
      ✔ Should set the deployer as owner and authorized issuer
      ✔ Should allow owner to authorize and deauthorize issuers
      ✔ Should reject authorization attempt by non-owner
    Certificate Issuance
      ✔ Should allow authorized owner to issue a certificate and emit event
      ✔ Should allow authorized university issuer to issue certificate
      ✔ Should reject issuance by unauthorized user
      ✔ Should prevent duplicate certificate IDs
      ✔ Should reject empty certificate ID or zero hash
    Certificate Verification
      ✔ Should verify authentic certificate hash correctly
      ✔ Should return invalid when certificate has been modified/tampered
      ✔ Should return not found for non-existent certificate ID
    Certificate Revocation
      ✔ Should allow authorized issuer to revoke a certificate and emit event
      ✔ Should prevent revoking an already revoked certificate
      ✔ Should reject revocation by unauthorized user
    Enumeration
      ✔ Should track total certificates and allow indexed retrieval

  15 passing (714ms)
```

### 2. Backend API Integration Test Suite (10 Tests)
```bash
cd backend
npm test
```
*Results:*
```text
  Backend API Integration Tests
    GET /api/health
      ✔ Should return 200 and healthy status
    Authentication API
      ✔ Should reject login with invalid credentials
      ✔ Should allow access to /api/auth/me with valid JWT
      ✔ Should reject /api/auth/me without authorization header
    Public Verification API
      ✔ Should return 404 for non-existent certificate ID
      ✔ Should reject file verification when no file is uploaded
      ✔ Should reject non-PDF file upload with validation error
    Certificate Issuance Validation
      ✔ Should reject issuance without admin JWT token
      ✔ Should reject issuance when mandatory fields are missing
    Admin Dashboard API
      ✔ Should return statistics and blockchain status for authenticated admin

  10 passing (981ms)
```

### 3. Full End-to-End Test Suite (11 Tests)
```bash
# From project root with node and backend running:
node test_e2e_flow.js
```
*Results:*
```text
==========================================================
STARTING END-TO-END VERIFICATION & SECURITY TEST SUITE
==========================================================
[Test 1] Health Check... ✓ Passed
[Test 2] Admin Login & JWT Issuance... ✓ Passed
[Test 3] Issuing Academic Certificate & Anchoring to Hardhat Smart Contract... ✓ Passed
[Test 4] Testing Duplicate Certificate ID Prevention... ✓ Passed (Status 409)
[Test 5] Certificate Retrieval by ID... ✓ Passed
[Test 6] Public Verification by ID (Valid Certificate)... ✓ Passed (VALID)
[Test 7] Public Verification by Uploading Authentic PDF Document... ✓ Passed (VALID)
[Test 8] Modifying Certificate Document to Test Tampering Detection... ✓ Passed (MODIFIED)
[Test 9] Revoking Certificate on Blockchain... ✓ Passed (Mined Tx)
[Test 10] Verifying Revoked Certificate Behavior... ✓ Passed (REVOKED)
[Test 11] Admin Dashboard Metrics & Activity... ✓ Passed
==========================================================
ALL 11 END-TO-END AUTOMATED VERIFICATION TESTS PASSED 100%!
==========================================================
```

---

## 10. Security Requirements & Design Implementation

1. **SHA-256 Certificate Hashing**:
   - Implemented via Node.js `crypto` streams and Web Crypto API.
   - Collision-resistant (2^128 operations needed for birthday attack).
2. **Blockchain Immutability**:
   - Once written to Ethereum state, transaction history and storage slots cannot be altered or removed.
3. **Wallet-Based Authorization**:
   - `onlyAuthorized` modifier in Solidity checks that `msg.sender == owner || authorizedIssuers[msg.sender]`.
   - Protects issuance and revocation functions against unauthorized third parties.
4. **Role-Based Access Control (RBAC)**:
   - Backend routes are protected by JWT Bearer tokens verifying administrator credentials.
5. **Password Hashing**:
   - Bcrypt with 10 salt rounds protects administrator credentials stored in SQLite.
6. **File & Input Validation**:
   - Multer middleware enforces strict PDF MIME-type verification and a 15 MB file size limit.
   - All input parameters are sanitized and verified before smart contract submission.
7. **Protection of Private Keys**:
   - Private keys are stored exclusively in backend `.env` variables and never exposed to the frontend.
8. **Duplicate Prevention**:
   - Database UNIQUE constraints prevent duplicate certificate numbers.
   - Smart contract `require(certificates[id].issueTimestamp == 0)` ensures no ID can be overwritten on-chain.
9. **Revocation Handling**:
   - Permanent boolean flag `isRevoked` in Solidity and timestamped reason in database ensure verifiable audit trails.
10. **Privacy-Conscious Storage**:
    - The blockchain stores only proof of authenticity (32-byte hash) and public metadata. Student GPA, personal identifiers, and demographic information remain off-chain.

---

## 11. Known Limitations & Future Improvements

- **Current Limitation**: Hardhat local node state resets if restarted without persistent cache flags.
  - *Future Improvement*: Deploy contract to an EVM testnet (e.g. Ethereum Sepolia or Polygon Amoy) and verify contract on Etherscan.
- **Decentralized Storage**: Currently uses a local `/uploads` directory.
  - *Future Improvement*: Add native IPFS (Pinata/Web3.Storage) pinning for certificate PDF files.
- **Multi-Institution Federation**:
  - *Future Improvement*: Expand to a multi-tenant university registry where each institution is identified by its Decentralized Identifier (DID).
- **Zero-Knowledge Proofs (ZKP)**:
  - *Future Improvement*: Allow students to selectively disclose specific claims (e.g., proof of graduation without revealing GPA).

---

## 12. License

This project is licensed under the **MIT License**. Free for academic research, education, and institutional demonstrations.
