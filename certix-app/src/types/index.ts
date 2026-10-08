export type CredentialStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'SUPERSEDED' | 'EXPIRED';

export interface StudentRecord {
  name: string;
  reg: string;
  prog: string;
  cgpa: string;
  skills: string;
  [key: string]: string;
}

export interface CredentialClaim {
  val: string;
  salt: string;
}

export interface CredentialPayload {
  id: string;
  claims: Record<string, CredentialClaim>;
  hidden: Record<string, string>; // hashes
  sig: string; // base64
  nonce: string;
}

export interface WalletCredential {
  id: string;
  record: StudentRecord;
  salts: Record<string, string>;
  hashes: Record<string, string>;
  signature: string; // base64
  root: string; // hash
  status: CredentialStatus;
  issuedAt: number;
}

export interface TrustRecord {
  id: string; // certId
  root: string; // hash
  status: CredentialStatus;
  issuer: string; // DID
  tx: string; // hash
  pub: any; // JWK
  timestamp: number;
}
