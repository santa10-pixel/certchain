import { CredentialPayload } from '@/types';
import { CryptoService } from './CryptoService';
import { BlockchainService } from './BlockchainService';

export interface VerificationResult {
  success: boolean;
  statusText: string;
  message: string;
  latencyMs: number;
  mode: 'ONLINE' | 'OFFLINE';
  blockchainTx?: string;
  threatDetected?: string;
}

export class VerificationService {
  private blockchain = new BlockchainService();
  private usedNonces = new Set<string>();

  async verify(payloadRaw: string, isOffline: boolean = false): Promise<VerificationResult> {
    const start = performance.now();
    let payload: CredentialPayload;

    try {
      payload = JSON.parse(payloadRaw);
    } catch (e) {
      return this.fail('INVALID', 'Malformed JSON payload.', start);
    }

    // Replay Check
    if (this.usedNonces.has(payload.nonce)) {
      return this.fail('BLOCKED', 'Replay attack detected. Nonce already consumed.', start, 'Replay Attack');
    }
    this.usedNonces.add(payload.nonce);

    // Chain Lookup
    const chainRef = this.blockchain.getTrustRecord(payload.id);
    if (!chainRef && !isOffline) {
      return this.fail('NOT FOUND', 'Credential ID not anchored on blockchain.', start);
    }

    // Status Check
    if (chainRef && chainRef.status === 'REVOKED') {
      return this.fail('REVOKED', 'Credential is authentic but was REVOKED by the issuer.', start);
    }

    // Cryptographic Integrity (Reconstruct Root Hash)
    const orderedKeys = ['name', 'reg', 'prog', 'cgpa', 'skills'];
    const reconstructedHashes: string[] = [];
    for (const k of orderedKeys) {
      if (payload.claims[k]) {
        reconstructedHashes.push(await CryptoService.hashData(payload.claims[k].val + payload.claims[k].salt));
      } else if (payload.hidden[k]) {
        reconstructedHashes.push(payload.hidden[k]);
      }
    }

    const testRoot = await CryptoService.hashData(reconstructedHashes.join(''));
    if (chainRef && testRoot !== chainRef.root && !isOffline) {
      return this.fail('TAMPERED', 'Cryptographic claim commitment mismatch. Data was modified.', start, 'Tampered Claims');
    }

    // Signature Check
    let validSig = false;
    if (chainRef) {
      validSig = await CryptoService.verifySignature(chainRef.pub, payload.sig, testRoot);
    } else if (isOffline) {
      validSig = true; // Simulate cached success in offline mode
    }

    if (!validSig) {
      return this.fail('INVALID', 'ECDSA Digital Signature verification failed.', start, 'Invalid Signature');
    }

    // Success
    const ms = Math.round(performance.now() - start);
    return {
      success: true,
      statusText: 'VERIFIED',
      message: 'Authentic & Verified',
      latencyMs: ms,
      mode: isOffline ? 'OFFLINE' : 'ONLINE',
      blockchainTx: chainRef ? chainRef.tx : 'Cached Proof (0xOffline)',
    };
  }

  private fail(statusText: string, message: string, startTime: number, threat?: string): VerificationResult {
    return {
      success: false,
      statusText,
      message,
      latencyMs: Math.round(performance.now() - startTime),
      mode: 'ONLINE',
      threatDetected: threat,
    };
  }
}
