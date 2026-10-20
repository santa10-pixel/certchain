// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AcademicCertificateRegistry
 * @dev Smart contract for registering, verifying, and revoking academic certificate proofs on Ethereum.
 * Stores only cryptographic hashes and verification metadata. No PII is stored on-chain.
 */
contract AcademicCertificateRegistry {
    address public owner;

    struct CertificateRecord {
        string certificateId;
        bytes32 certificateHash; // SHA-256 hash of certificate document
        address issuer;
        uint256 issueTimestamp;
        bool isRevoked;
        uint256 revokeTimestamp;
        string documentReference; // Local reference or IPFS CID
    }

    // Mapping from certificateId => CertificateRecord
    mapping(string => CertificateRecord) private certificates;
    // Track registered certificate IDs
    string[] private allCertificateIds;
    // Authorized issuer addresses
    mapping(address => bool) public authorizedIssuers;

    event CertificateIssued(
        string indexed certificateIdIndex,
        string certificateId,
        bytes32 certificateHash,
        address indexed issuer,
        uint256 issueTimestamp
    );

    event CertificateRevoked(
        string indexed certificateIdIndex,
        string certificateId,
        address indexed revoker,
        uint256 revokeTimestamp
    );

    event IssuerAuthorized(address indexed issuer);
    event IssuerDeauthorized(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can execute this");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedIssuers[msg.sender], "Not authorized to perform this operation");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender);
    }

    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid address");
        require(!authorizedIssuers[issuer], "Already authorized");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function deauthorizeIssuer(address issuer) external onlyOwner {
        require(issuer != owner, "Cannot deauthorize contract owner");
        require(authorizedIssuers[issuer], "Not currently authorized");
        authorizedIssuers[issuer] = false;
        emit IssuerDeauthorized(issuer);
    }

    /**
     * @notice Issue a new certificate record on-chain
     * @param certificateId Unique human-readable or system identifier (e.g. CERT-2026-0001)
     * @param certificateHash SHA-256 hash (bytes32) of the final certificate PDF
     * @param documentReference Optional storage or IPFS reference
     */
    function issueCertificate(
        string calldata certificateId,
        bytes32 certificateHash,
        string calldata documentReference
    ) external onlyAuthorized {
        require(bytes(certificateId).length > 0, "Certificate ID cannot be empty");
        require(certificateHash != bytes32(0), "Invalid certificate hash");
        require(certificates[certificateId].issueTimestamp == 0, "Certificate ID already exists");

        certificates[certificateId] = CertificateRecord({
            certificateId: certificateId,
            certificateHash: certificateHash,
            issuer: msg.sender,
            issueTimestamp: block.timestamp,
            isRevoked: false,
            revokeTimestamp: 0,
            documentReference: documentReference
        });

        allCertificateIds.push(certificateId);

        emit CertificateIssued(
            certificateId,
            certificateId,
            certificateHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Revoke an existing certificate
     * @param certificateId Identifier of certificate to revoke
     */
    function revokeCertificate(string calldata certificateId) external onlyAuthorized {
        require(certificates[certificateId].issueTimestamp > 0, "Certificate does not exist");
        require(!certificates[certificateId].isRevoked, "Certificate is already revoked");

        certificates[certificateId].isRevoked = true;
        certificates[certificateId].revokeTimestamp = block.timestamp;

        emit CertificateRevoked(
            certificateId,
            certificateId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Retrieve certificate record details
     * @param certificateId Identifier of the certificate
     */
    function getCertificate(string calldata certificateId)
        external
        view
        returns (
            string memory id,
            bytes32 hash,
            address issuer,
            uint256 issueTimestamp,
            bool isRevoked,
            uint256 revokeTimestamp,
            string memory documentReference
        )
    {
        require(certificates[certificateId].issueTimestamp > 0, "Certificate does not exist");
        CertificateRecord memory cert = certificates[certificateId];
        return (
            cert.certificateId,
            cert.certificateHash,
            cert.issuer,
            cert.issueTimestamp,
            cert.isRevoked,
            cert.revokeTimestamp,
            cert.documentReference
        );
    }

    /**
     * @notice Check whether a certificate exists on-chain
     * @param certificateId Identifier of certificate
     */
    function certificateExists(string calldata certificateId) external view returns (bool) {
        return certificates[certificateId].issueTimestamp > 0;
    }

    /**
     * @notice Verify whether a given document hash matches the anchored hash
     * @param certificateId Identifier of certificate
     * @param candidateHash SHA-256 hash of document to verify
     * @return isValid True if certificate exists, hash matches, and is NOT revoked
     * @return isRevoked True if the certificate was revoked
     * @return originalHash The anchored hash on-chain
     */
    function verifyCertificateHash(string calldata certificateId, bytes32 candidateHash)
        external
        view
        returns (
            bool isValid,
            bool isRevoked,
            bytes32 originalHash
        )
    {
        if (certificates[certificateId].issueTimestamp == 0) {
            return (false, false, bytes32(0));
        }

        CertificateRecord memory cert = certificates[certificateId];
        bool hashMatches = (cert.certificateHash == candidateHash);
        bool valid = hashMatches && (!cert.isRevoked);

        return (valid, cert.isRevoked, cert.certificateHash);
    }

    /**
     * @notice Get total count of registered certificates
     */
    function getTotalCertificatesCount() external view returns (uint256) {
        return allCertificateIds.length;
    }

    /**
     * @notice Retrieve certificate ID by index for enumeration
     */
    function getCertificateIdByIndex(uint256 index) external view returns (string memory) {
        require(index < allCertificateIds.length, "Index out of bounds");
        return allCertificateIds[index];
    }
}
