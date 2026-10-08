import { WalletCredential, CredentialPayload } from '@/types';
import { CryptoService } from './CryptoService';

export class ShareService {
  static generateSharePayload(
    credential: WalletCredential,
    disclosedKeys: string[]
  ): CredentialPayload {
    const payload: CredentialPayload = {
      id: credential.id,
      claims: {},
      hidden: {},
      sig: credential.signature,
      nonce: CryptoService.generateNonce(),
    };

    const orderedKeys = ['name', 'reg', 'prog', 'cgpa', 'skills'];

    orderedKeys.forEach((k) => {
      if (disclosedKeys.includes(k)) {
        payload.claims[k] = {
          val: credential.record[k] || '',
          salt: credential.salts[k],
        };
      } else {
        payload.hidden[k] = credential.hashes[k];
      }
    });

    return payload;
  }
}
