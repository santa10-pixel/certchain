const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractConfig = null;
    this.initPromise = this.init();
  }

  async init() {
    try {
      const configPath = path.resolve(__dirname, "../config/contractConfig.json");
      if (fs.existsSync(configPath)) {
        this.contractConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      } else {
        console.warn("contractConfig.json not found. Run smart contract deployment first.");
      }

      const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      const privateKey = process.env.ISSUER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      if (this.contractConfig && this.contractConfig.address && this.contractConfig.abi) {
        this.contract = new ethers.Contract(
          this.contractConfig.address,
          this.contractConfig.abi,
          this.wallet
        );
        console.log("Blockchain Service initialized with contract at:", this.contractConfig.address);
      }
    } catch (err) {
      console.warn("Blockchain Service initialization warning:", err.message);
    }
  }

  async isConnected() {
    try {
      if (!this.provider) return false;
      const network = await this.provider.getNetwork();
      return !!network;
    } catch {
      return false;
    }
  }

  async getLatestNonce() {
    const hex = await this.provider.send("eth_getTransactionCount", [this.wallet.address, "latest"]);
    return parseInt(hex, 16);
  }

  async getNetworkStatus() {
    try {
      await this.initPromise;
      if (!this.provider) throw new Error("Provider not initialized");

      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      let balance = "0";
      if (this.wallet) {
        const bal = await this.provider.getBalance(this.wallet.address);
        balance = ethers.formatEther(bal);
      }

      return {
        online: true,
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        contractAddress: this.contractConfig ? this.contractConfig.address : null,
        issuerAddress: this.wallet ? this.wallet.address : null,
        issuerBalanceETH: balance,
      };
    } catch (err) {
      return {
        online: false,
        error: err.message,
        contractAddress: this.contractConfig ? this.contractConfig.address : null,
      };
    }
  }

  /**
   * Submit certificate hash to smart contract on blockchain
   * @param {string} certificateId
   * @param {string} certificateHashHex 64-char hex SHA-256
   * @param {string} docRef
   * @returns {Promise<{ txHash: string, blockNumber: number, issuer: string }>}
   */
  async issueCertificateOnChain(certificateId, certificateHashHex, docRef = "") {
    await this.initPromise;
    if (!this.contract) {
      throw new Error("Smart contract is not deployed or configured. Please run deployment script.");
    }

    const bytes32Hash = certificateHashHex.startsWith("0x")
      ? certificateHashHex
      : "0x" + certificateHashHex;

    // Check if duplicate on-chain
    const exists = await this.contract.certificateExists(certificateId);
    if (exists) {
      throw new Error(`Certificate with ID '${certificateId}' already exists on blockchain`);
    }

    const nonce = await this.getLatestNonce();

    // Call smart contract transaction
    const tx = await this.contract.issueCertificate(certificateId, bytes32Hash, docRef, { nonce });
    const receipt = await tx.wait(1);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      issuer: this.wallet.address,
    };
  }

  /**
   * Verify certificate hash against on-chain anchor
   * @param {string} certificateId
   * @param {string} candidateHashHex
   * @returns {Promise<{ exists: boolean, isValid: boolean, isRevoked: boolean, onchainHash: string }>}
   */
  async verifyCertificateOnChain(certificateId, candidateHashHex) {
    await this.initPromise;
    if (!this.contract) {
      throw new Error("Smart contract is not deployed or configured.");
    }

    const bytes32Candidate = candidateHashHex.startsWith("0x")
      ? candidateHashHex
      : "0x" + candidateHashHex;

    const exists = await this.contract.certificateExists(certificateId);
    if (!exists) {
      return {
        exists: false,
        isValid: false,
        isRevoked: false,
        onchainHash: null,
      };
    }

    const [isValid, isRevoked, originalHash] = await this.contract.verifyCertificateHash(
      certificateId,
      bytes32Candidate
    );

    return {
      exists: true,
      isValid,
      isRevoked,
      onchainHash: originalHash,
    };
  }

  /**
   * Retrieve certificate details directly from on-chain state
   * @param {string} certificateId
   */
  async getCertificateOnChain(certificateId) {
    await this.initPromise;
    if (!this.contract) {
      throw new Error("Smart contract is not configured.");
    }

    const cert = await this.contract.getCertificate(certificateId);
    return {
      id: cert[0],
      hash: cert[1],
      issuer: cert[2],
      issueTimestamp: Number(cert[3]),
      isRevoked: cert[4],
      revokeTimestamp: Number(cert[5]),
      documentReference: cert[6],
    };
  }

  /**
   * Revoke certificate on blockchain
   * @param {string} certificateId
   */
  async revokeCertificateOnChain(certificateId) {
    await this.initPromise;
    if (!this.contract) {
      throw new Error("Smart contract is not configured.");
    }

    const nonce = await this.getLatestNonce();
    const tx = await this.contract.revokeCertificate(certificateId, { nonce });
    const receipt = await tx.wait(1);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }
}

module.exports = new BlockchainService();
