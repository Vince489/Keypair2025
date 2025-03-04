// publicKey1.js

import bs58 from 'bs58'; // Make sure you have the 'bs58' package installed

const PUBLIC_KEY_LENGTH = 32; // Solana public key length

export class PublicKey {
  constructor(value) {
    if (typeof value === 'string') {
      try {
        // Decode from Base58 string
        const decoded = bs58.decode(value);
        if (decoded.length !== PUBLIC_KEY_LENGTH) {
          throw new Error('Invalid public key length');
        }
        this._key = decoded;
      } catch (e) {
        if (e.message.includes('Non-base58 character') || e.message.includes('invalid character')) {
          throw new Error('Non-base58 character in public key');
        } else {
          throw new Error('Invalid public key length');
        }
      }
    } else if (value instanceof Uint8Array) {
      // Use Uint8Array directly
      if (value.length !== PUBLIC_KEY_LENGTH) {
        throw new Error('Invalid public key length');
      }
      this._key = value;
    } else {
      throw new TypeError('PublicKey must be a Base58 string or Uint8Array');
    }
  }

  toBase58() {
    return bs58.encode(this._key);
  }

  static fromBase58(base58String) {
    return new PublicKey(bs58.decode(base58String));
  }

  toBytes() {
    return this._key;
  }

  equals(other) {
    if (!(other instanceof PublicKey)) {
      throw new TypeError('Argument must be a PublicKey');
    }
    return this.toBase58() === other.toBase58();
  }

  toString() {
    return this.toBase58();
  }

  toBuffer() {
    return Buffer.from(this._key);
  }

  verify(message, signature) {
    if (!(message instanceof Uint8Array || Buffer.isBuffer(message))) {
      throw new TypeError('Message must be a Uint8Array or Buffer');
    }
    return verify(message, signature, this.toBytes());
  }
}
