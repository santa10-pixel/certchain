# CertiX Phase 1: Codebase Audit & Architecture Strategy

## 1. Audit of Existing Prototype (`certix.html` & `CertShield.sol`)

### What is currently implemented:
- **Frontend**: A monolithic 1130-line HTML/JS single-page application (`certix.html`). Uses vanilla DOM manipulation without a framework.
- **Backend / Database**: No dedicated backend API. Uses the `@supabase/supabase-js` client directly in the browser to sync a single massive `DB` JSON object containing all certificates, wallets, and audit events to a single `certix_state` table via `certix_schema.sql`.
- **Smart Contracts**: `CertShield.sol` exists but is **not** actively integrated into the frontend. The frontend *simulates* blockchain logic by appending records to an in-memory `DB.chain` array.
- **Authentication**: Fully simulated. Users "log in" just by typing a string (e.g. "vit-chennai"), without real cryptographic authentication or JWTs.
- **Cryptography**: Uses Web Crypto API (`ECDSA P-256`) to generate temporary keys in the browser session. These keys are lost upon refresh. Hashes use SHA-256. 
- **Selective Disclosure**: Implemented logically in JS, but relies on a simple JSON payload hash check rather than true cryptographic Merkle proofs or zero-knowledge mechanisms.
- **Verification**: Functional in UI, but parses simulated cryptographic payloads. 
- **Risk Engine**: A simplistic Javascript counter (`rapidRequests`) that flags "HIGH RISK" if verified >3 times rapidly. Simulated ML.
- **QR Generation**: Fully functional (uses `qrcode.js`) to generate a deep-link with a Base64 JSON payload.

### What is Real vs Simulated:
- **REAL**: Web Crypto signature generation/verification, Supabase data persistence (single JSON dump), QR code generation, HTML UI navigation.
- **SIMULATED**: Blockchain transactions (no Web3 provider, no ethers.js, no real anchoring), Issuer Identity (keys are ephemeral per tab), AI/ML Anomaly Detection (just an `if` statement), Authentication (no real passwords/JWT), Row Level Security (public read/write on the JSON state).

---

## 2. Target Architecture (The Upgrade Plan)

To transition from this prototype to the **Conference-Ready CertiX Framework**, the system must be entirely re-architected into a monorepo containing:

### Layer 1: Next.js Web Application
- **Stack**: Next.js 14 (App Router), React, TailwindCSS, shadcn/ui.
- **Role**: Replaces the monolithic HTML file. Will contain dedicated dashboards for `/institution`, `/student`, `/verifier`, and `/admin`. 

### Layer 2: API & Services Layer (Next.js Edge / FastAPI)
- **Stack**: Next.js API Routes (Node) or a separate FastAPI (Python) service for the ML model.
- **Role**: Securely handles credential batching, Merkle tree generation, and proxying requests to the ML risk engine.

### Layer 3: Database & Security (Supabase)
- **Stack**: PostgreSQL with strict Row Level Security (RLS).
- **Role**: Drops the `certix_state` JSON blob. Introduces normalized tables: `issuers`, `credentials`, `presentations`, `audit_events`.

### Layer 4: Trust & Blockchain (Hardhat + Solidity)
- **Stack**: Solidity, Hardhat, ethers.js/viem.
- **Role**: `CertiXRegistry.sol` deployed to a testnet (e.g., Sepolia or local Hardhat node). The backend signs and anchors the Merkle root of credential batches onto this contract. The frontend uses `viem` to read status/revocations directly from the RPC during verification.

### Layer 5: ML Risk Engine (Python)
- **Stack**: Scikit-Learn (Isolation Forest), FastAPI.
- **Role**: Analyzes verification metadata (frequency, IP, payload anomalies) and returns an Explainable Risk Score (0-100).

---

## 3. Implementation Strategy & Migration Path
Because the new system requires rewriting the foundation from the ground up, the migration path involves:
1. **Scaffolding the Monorepo**: Creating `certix-v2/` with `/web`, `/contracts`, and `/ml`.
2. **Database Normalization**: Replacing `certix_schema.sql` with Supabase migration files establishing RLS.
3. **Smart Contract Refactor**: Writing a production `CertiXRegistry.sol` that uses `bytes32` Merkle roots rather than string manipulation.
4. **UI Porting**: Rebuilding the Vanilla JS views into React components using Tailwind.
5. **Connecting the Layers**: Linking the Next.js frontend to Supabase Auth, Ethers.js to the Smart Contract, and the API to the ML service.
