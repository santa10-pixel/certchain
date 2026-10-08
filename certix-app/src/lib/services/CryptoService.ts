const encoder = new TextEncoder();

export class CryptoService {
  static toBase64(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  static fromBase64(str: string): ArrayBuffer {
    const bin = atob(str);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr.buffer;
  }

  static async hashData(str: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', encoder.encode(str));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static generateSalt(): string {
    return Math.random().toString(36).substring(2, 10);
  }
  
  static generateNonce(): string {
    return crypto.randomUUID();
  }

  static async generateKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );
  }

  static async signData(
    privateKey: CryptoKey,
    data: string
  ): Promise<string> {
    const sigBuf = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      encoder.encode(data)
    );
    return this.toBase64(sigBuf);
  }

  static async verifySignature(
    pubJwk: any,
    signatureBase64: string,
    data: string
  ): Promise<boolean> {
    try {
      const pub = await crypto.subtle.importKey(
        'jwk',
        pubJwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
      );
      return await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        pub,
        this.fromBase64(signatureBase64),
        encoder.encode(data)
      );
    } catch (e) {
      return false;
    }
  }
}
