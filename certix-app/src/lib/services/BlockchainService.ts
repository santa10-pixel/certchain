import { TrustRecord, CredentialStatus } from '@/types';
import { CryptoService } from './CryptoService';
import { LocalStorageRepository } from '../repositories/LocalStorageRepository';

export class BlockchainService {
  private trustRepo = new LocalStorageRepository<TrustRecord>('certix_trust_chain');

  async anchorCredential(
    certId: string,
    rootHash: string,
    issuerDid: string,
    pubJwk: any
  ): Promise<TrustRecord> {
    // Simulate Blockchain transaction anchoring
    const txHash = '0x' + (await CryptoService.hashData(certId + Date.now().toString()));
    
    const record: TrustRecord = {
      id: certId,
      root: rootHash,
      status: 'ACTIVE',
      issuer: issuerDid,
      tx: txHash,
      pub: pubJwk,
      timestamp: Date.now(),
    };

    this.trustRepo.add(record);
    return record;
  }

  getTrustRecord(certId: string): TrustRecord | undefined {
    return this.trustRepo.getAll().find((r) => r.id === certId);
  }

  updateStatus(certId: string, status: CredentialStatus): boolean {
    let updated = false;
    this.trustRepo.update(
      (r) => r.id === certId,
      (r) => {
        updated = true;
        return { ...r, status };
      }
    );
    return updated;
  }
}
