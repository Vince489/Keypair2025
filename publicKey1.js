import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { verify } from './utils/ed25519.js';


/**
 * Size of a valid public key in bytes (32 bytes for Ed25519)
 */
const PUBLIC_KEY_LENGTH = 32;

/**
 * Class representing a public key
 */
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


  /**
   * Get the public key as a Base58 string
   * @returns {string} Base58-encoded public key
   */
  toBase58() {
    return bs58.encode(this._key);
  }

  /**
   * Get the public key as a Uint8Array
   * @returns {Uint8Array} Public key
   */
  toBytes() {
    return this._key;
  }

  /**
   * Check if two public keys are equal
   * @param {PublicKey} other - Another PublicKey instance
   * @returns {boolean} True if equal, false otherwise
   */
  equals(other) {
    if (!(other instanceof PublicKey)) {
      throw new TypeError('Argument must be a PublicKey');
    }
    return this.toBase58() === other.toBase58();
  }

  /**
   * Convert the public key to a string (Base58)
   * @returns {string} Base58-encoded public key
   */
  toString() {
    return this.toBase58();
  }

  /**
   * Convert the public key to a Buffer
   * @returns {Buffer} Public key as a Buffer
   */
  toBuffer() {
    return Buffer.from(this._key);
  }

  /**
   * Verifies a signature against a message using this public key.
   * @param {Uint8Array | Buffer} message - The original message.
   * @param {Uint8Array} signature - The signature to verify.
   * @returns {boolean} True if valid, false otherwise.
   */
  verify(message, signature) {
    if (!(message instanceof Uint8Array || Buffer.isBuffer(message))) {
      throw new TypeError('Message must be a Uint8Array or Buffer');
    }
    return verify(message, signature, this.toBytes());
  }
}

// Export the PublicKey class
export default PublicKey;
