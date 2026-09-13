// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertShield
 * @dev Privacy-Preserving and Resilient Blockchain-Based Academic Credential Verification
 */
contract CertShield {
    address public admin;

    enum CredentialStatus { NOT_FOUND, ISSUED, ACTIVE, SUPERSEDED, REVOKED }

    struct Credential {
        string certId;
        string rootHash;
        address issuer;
        uint256 timestamp;
        CredentialStatus status;
        uint256 version;
        string supersededBy;
        string signature;
    }

    struct AuditEvent {
        string eventType;
        uint256 timestamp;
        string certId;
        address issuerOrVerifier;
        string txReference;
    }

    mapping(address => bool) public authorizedIssuers;
    mapping(string => Credential) private credentials;
    AuditEvent[] public auditTrail;

    event IssuerRegistered(address indexed issuer);
    event CredentialIssued(string indexed certId, address indexed issuer, uint256 timestamp);
    event CredentialUpdated(string indexed oldCertId, string indexed newCertId, address indexed issuer);
    event CredentialRevoked(string indexed certId, address indexed issuer);
    event VerificationRecorded(string indexed certId, address indexed verifier);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedIssuers[msg.sender] = true; // Admin is also an issuer for testing
    }

    function registerIssuer(address issuer) external onlyAdmin {
        authorizedIssuers[issuer] = true;
        emit IssuerRegistered(issuer);
    }

    function issueCredential(
        string memory _certId,
        string memory _rootHash,
        string memory _signature
    ) external onlyIssuer {
        require(credentials[_certId].timestamp == 0, "Credential already exists");

        credentials[_certId] = Credential({
            certId: _certId,
            rootHash: _rootHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            status: CredentialStatus.ACTIVE,
            version: 1,
            supersededBy: "",
            signature: _signature
        });

        _recordAudit("ISSUED", _certId, msg.sender);
        emit CredentialIssued(_certId, msg.sender, block.timestamp);
    }

    function getCredential(string memory _certId) external view returns (Credential memory) {
        return credentials[_certId];
    }

    function verifyCredential(string memory _certId) external view returns (bool, CredentialStatus, string memory) {
        Credential memory cred = credentials[_certId];
        if (cred.timestamp == 0) {
            return (false, CredentialStatus.NOT_FOUND, "");
        }
        return (true, cred.status, cred.rootHash);
    }

    function revokeCredential(string memory _certId) external onlyIssuer {
        require(credentials[_certId].timestamp != 0, "Credential not found");
        require(credentials[_certId].issuer == msg.sender, "Not the issuer");

        credentials[_certId].status = CredentialStatus.REVOKED;
        _recordAudit("REVOKED", _certId, msg.sender);
        emit CredentialRevoked(_certId, msg.sender);
    }

    function supersedeCredential(
        string memory _oldCertId,
        string memory _newCertId,
        string memory _newRootHash,
        string memory _newSignature
    ) external onlyIssuer {
        require(credentials[_oldCertId].timestamp != 0, "Old credential not found");
        require(credentials[_oldCertId].issuer == msg.sender, "Not the issuer");
        require(credentials[_newCertId].timestamp == 0, "New credential already exists");

        // Mark old as superseded
        credentials[_oldCertId].status = CredentialStatus.SUPERSEDED;
        credentials[_oldCertId].supersededBy = _newCertId;
        _recordAudit("SUPERSEDED", _oldCertId, msg.sender);

        // Issue new
        credentials[_newCertId] = Credential({
            certId: _newCertId,
            rootHash: _newRootHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            status: CredentialStatus.ACTIVE,
            version: credentials[_oldCertId].version + 1,
            supersededBy: "",
            signature: _newSignature
        });

        _recordAudit("UPDATED", _newCertId, msg.sender);
        emit CredentialUpdated(_oldCertId, _newCertId, msg.sender);
    }

    function recordVerification(string memory _certId) external {
        // Optional function for verifiers to log their verification on-chain
        _recordAudit("VERIFIED", _certId, msg.sender);
        emit VerificationRecorded(_certId, msg.sender);
    }

    function _recordAudit(string memory _eventType, string memory _certId, address _actor) internal {
        auditTrail.push(AuditEvent({
            eventType: _eventType,
            timestamp: block.timestamp,
            certId: _certId,
            issuerOrVerifier: _actor,
            txReference: "TX_HASH_PLACEHOLDER" // In a real environment, this could be omitted or queried from event logs
        }));
    }

    function getAuditTrailCount() external view returns (uint256) {
        return auditTrail.length;
    }

    function getAuditTrailEvent(uint256 index) external view returns (AuditEvent memory) {
        require(index < auditTrail.length, "Index out of bounds");
        return auditTrail[index];
    }
}
