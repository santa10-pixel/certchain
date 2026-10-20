import { WalletCredential, StudentRecord } from '@/types';
import { CryptoService } from './CryptoService';
import { BlockchainService } from './BlockchainService';
import { LocalStorageRepository } from '../repositories/LocalStorageRepository';
import { DatabaseService } from './DatabaseService';

export class CredentialService {
  private walletRepo = new LocalStorageRepository<WalletCredential>('certix_wallet');
  private blockchain = new BlockchainService();
  private dbService = new DatabaseService();
  
  // Singleton for demo issuer key
  private async getIssuerKey(): Promise<CryptoKeyPair> {
    if (typeof window === 'undefined') throw new Error('Client only');
    const stored = localStorage.getItem('certix_issuer_key');
    if (stored) {
       if ((window as any).__demoKeyPair) return (window as any).__demoKeyPair;
    }
    const keyPair = await CryptoService.generateKeyPair();
    (window as any).__demoKeyPair = keyPair;
    return keyPair;
  }

  async issueCredential(record: StudentRecord): Promise<WalletCredential> {
    const salts: Record<string, string> = {};
    const hashes: Record<string, string> = {};
    const orderedKeys = ['name', 'reg', 'prog', 'cgpa', 'skills'];

    for (const key of orderedKeys) {
      const val = record[key] || '';
      const salt = CryptoService.generateSalt();
      salts[key] = salt;
      hashes[key] = await CryptoService.hashData(val + salt);
    }

    const rootHash = await CryptoService.hashData(
      orderedKeys.map((k) => hashes[k]).join('')
    );

    const keyPair = await this.getIssuerKey();
    const signature = await CryptoService.signData(keyPair.privateKey, rootHash);
    const pubJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

    const certId = 'CERT-' + CryptoService.generateSalt().toUpperCase();

    // Anchor to blockchain
    await this.blockchain.anchorCredential(
      certId,
      rootHash,
      'did:certix:vit-chennai',
      pubJwk
    );

    const credential: WalletCredential = {
      id: certId,
      record,
      salts,
      hashes,
      signature,
      root: rootHash,
      status: 'ACTIVE',
      issuedAt: Date.now(),
    };

    this.walletRepo.add(credential);

    // Sync to remote Supabase if connected
    this.dbService.syncToCloud().catch(() => {});

    return credential;
  }

  getWallet(registrationNumber?: string): WalletCredential[] {
    const all = this.walletRepo.getAll();
    if (registrationNumber) {
      return all.filter((c) => c.record.reg === registrationNumber);
    }
    return all;
  }

  revoke(certId: string): void {
    this.blockchain.updateStatus(certId, 'REVOKED');
    this.walletRepo.update((c) => c.id === certId, (c) => ({ ...c, status: 'REVOKED' }));
    this.dbService.syncToCloud().catch(() => {});
  }
}
