const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AcademicCertificateRegistry Contract", function () {
  let registry;
  let owner, issuer, verifier, unauthorizedUser;

  const sampleCertId = "CERT-2026-0001";
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("Sample Academic Certificate PDF Bytes 12345"));
  const modifiedHash = ethers.keccak256(ethers.toUtf8Bytes("Tampered Certificate PDF Bytes"));
  const sampleDocRef = "/uploads/cert-2026-0001.pdf";

  beforeEach(async function () {
    [owner, issuer, verifier, unauthorizedUser] = await ethers.getSigners();
    const RegistryFactory = await ethers.getContractFactory("AcademicCertificateRegistry");
    registry = await RegistryFactory.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment & Authorization", function () {
    it("Should set the deployer as owner and authorized issuer", async function () {
      expect(await registry.owner()).to.equal(owner.address);
      expect(await registry.authorizedIssuers(owner.address)).to.equal(true);
    });

    it("Should allow owner to authorize and deauthorize issuers", async function () {
      await expect(registry.authorizeIssuer(issuer.address))
        .to.emit(registry, "IssuerAuthorized")
        .withArgs(issuer.address);

      expect(await registry.authorizedIssuers(issuer.address)).to.equal(true);

      await expect(registry.deauthorizeIssuer(issuer.address))
        .to.emit(registry, "IssuerDeauthorized")
        .withArgs(issuer.address);

      expect(await registry.authorizedIssuers(issuer.address)).to.equal(false);
    });

    it("Should reject authorization attempt by non-owner", async function () {
      await expect(
        registry.connect(unauthorizedUser).authorizeIssuer(issuer.address)
      ).to.be.revertedWith("Only contract owner can execute this");
    });
  });

  describe("Certificate Issuance", function () {
    it("Should allow authorized owner to issue a certificate and emit event", async function () {
      await expect(registry.issueCertificate(sampleCertId, sampleHash, sampleDocRef))
        .to.emit(registry, "CertificateIssued")
        .withArgs(sampleCertId, sampleCertId, sampleHash, owner.address, (await ethers.provider.getBlock("latest")).timestamp + 1);

      const exists = await registry.certificateExists(sampleCertId);
      expect(exists).to.equal(true);

      const cert = await registry.getCertificate(sampleCertId);
      expect(cert.id).to.equal(sampleCertId);
      expect(cert.hash).to.equal(sampleHash);
      expect(cert.issuer).to.equal(owner.address);
      expect(cert.isRevoked).to.equal(false);
      expect(cert.documentReference).to.equal(sampleDocRef);
    });

    it("Should allow authorized university issuer to issue certificate", async function () {
      await registry.authorizeIssuer(issuer.address);
      await registry.connect(issuer).issueCertificate(sampleCertId, sampleHash, sampleDocRef);

      const cert = await registry.getCertificate(sampleCertId);
      expect(cert.issuer).to.equal(issuer.address);
    });

    it("Should reject issuance by unauthorized user", async function () {
      await expect(
        registry.connect(unauthorizedUser).issueCertificate(sampleCertId, sampleHash, sampleDocRef)
      ).to.be.revertedWith("Not authorized to perform this operation");
    });

    it("Should prevent duplicate certificate IDs", async function () {
      await registry.issueCertificate(sampleCertId, sampleHash, sampleDocRef);

      await expect(
        registry.issueCertificate(sampleCertId, sampleHash, sampleDocRef)
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("Should reject empty certificate ID or zero hash", async function () {
      await expect(
        registry.issueCertificate("", sampleHash, sampleDocRef)
      ).to.be.revertedWith("Certificate ID cannot be empty");

      await expect(
        registry.issueCertificate("VALID-ID", ethers.ZeroHash, sampleDocRef)
      ).to.be.revertedWith("Invalid certificate hash");
    });
  });

  describe("Certificate Verification", function () {
    beforeEach(async function () {
      await registry.issueCertificate(sampleCertId, sampleHash, sampleDocRef);
    });

    it("Should verify authentic certificate hash correctly", async function () {
      const [isValid, isRevoked, originalHash] = await registry.verifyCertificateHash(sampleCertId, sampleHash);
      expect(isValid).to.equal(true);
      expect(isRevoked).to.equal(false);
      expect(originalHash).to.equal(sampleHash);
    });

    it("Should return invalid when certificate has been modified/tampered", async function () {
      const [isValid, isRevoked, originalHash] = await registry.verifyCertificateHash(sampleCertId, modifiedHash);
      expect(isValid).to.equal(false);
      expect(isRevoked).to.equal(false);
      expect(originalHash).to.equal(sampleHash);
    });

    it("Should return not found for non-existent certificate ID", async function () {
      const [isValid, isRevoked, originalHash] = await registry.verifyCertificateHash("NON_EXISTENT", sampleHash);
      expect(isValid).to.equal(false);
      expect(isRevoked).to.equal(false);
      expect(originalHash).to.equal(ethers.ZeroHash);
    });
  });

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      await registry.issueCertificate(sampleCertId, sampleHash, sampleDocRef);
    });

    it("Should allow authorized issuer to revoke a certificate and emit event", async function () {
      await expect(registry.revokeCertificate(sampleCertId))
        .to.emit(registry, "CertificateRevoked")
        .withArgs(sampleCertId, sampleCertId, owner.address, (await ethers.provider.getBlock("latest")).timestamp + 1);

      const cert = await registry.getCertificate(sampleCertId);
      expect(cert.isRevoked).to.equal(true);
      expect(cert.revokeTimestamp).to.be.greaterThan(0);

      // Verify that verification now indicates revocation
      const [isValid, isRevoked] = await registry.verifyCertificateHash(sampleCertId, sampleHash);
      expect(isValid).to.equal(false);
      expect(isRevoked).to.equal(true);
    });

    it("Should prevent revoking an already revoked certificate", async function () {
      await registry.revokeCertificate(sampleCertId);
      await expect(registry.revokeCertificate(sampleCertId)).to.be.revertedWith("Certificate is already revoked");
    });

    it("Should reject revocation by unauthorized user", async function () {
      await expect(
        registry.connect(unauthorizedUser).revokeCertificate(sampleCertId)
      ).to.be.revertedWith("Not authorized to perform this operation");
    });
  });

  describe("Enumeration", function () {
    it("Should track total certificates and allow indexed retrieval", async function () {
      expect(await registry.getTotalCertificatesCount()).to.equal(0);
      await registry.issueCertificate("CERT-1", sampleHash, "ref1");
      await registry.issueCertificate("CERT-2", sampleHash, "ref2");

      expect(await registry.getTotalCertificatesCount()).to.equal(2);
      expect(await registry.getCertificateIdByIndex(0)).to.equal("CERT-1");
      expect(await registry.getCertificateIdByIndex(1)).to.equal("CERT-2");
    });
  });
});
