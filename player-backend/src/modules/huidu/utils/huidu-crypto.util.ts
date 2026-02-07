import * as crypto from 'crypto';

export class HuiduCrypto {
  private readonly key: Buffer;

  constructor(aesKey: string) {
    // Key is a 32-char string used as UTF-8 bytes (confirmed by PHP/Java examples in Huidu docs)
    this.key = Buffer.from(aesKey, 'utf-8');
    if (this.key.length !== 32) {
      throw new Error(`AES key must be 32 bytes, got ${this.key.length}`);
    }
  }

  encrypt(plaintext: string): string {
    const cipher = crypto.createCipheriv('aes-256-ecb', this.key, null);
    cipher.setAutoPadding(true); // PKCS7 padding
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf-8'),
      cipher.final(),
    ]);
    return encrypted.toString('base64');
  }

  decrypt(base64Ciphertext: string): string {
    const decipher = crypto.createDecipheriv('aes-256-ecb', this.key, null);
    decipher.setAutoPadding(true);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(base64Ciphertext, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf-8');
  }

  encryptJson(obj: Record<string, any>): string {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptJson<T = any>(base64: string): T {
    return JSON.parse(this.decrypt(base64));
  }
}
