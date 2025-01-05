import { PublicKey } from './publicKey.js';

/**
 * Class representing a transaction instruction
 */
class TransactionInstruction {
  /**
   * Create a new TransactionInstruction instance.
   * @param {Object} params - The parameters for the instruction.
   * @param {PublicKey} params.programId - The program ID as a PublicKey.
   * @param {Array} params.keys - The list of account keys.
   * @param {Buffer} params.data - The instruction data as a Buffer.
   */
  constructor({ programId, keys, data }) {
    if (!(programId instanceof PublicKey)) {
      throw new Error('programId must be an instance of PublicKey');
    }
    if (!Array.isArray(keys)) {
      throw new Error('keys must be an array');
    }
    if (!(data instanceof Buffer)) {
      throw new Error('data must be a Buffer');
    }

    this.programId = programId;
    this.keys = keys;
    this.data = data;
  }

  /**
   * Validate the instruction fields.
   * @returns {boolean} True if valid, false otherwise.
   */
  validate() {

    // Validate programId is a PublicKey instance
    if (!(this.programId instanceof PublicKey)) {
      console.error('Validation failed: Invalid programId');
      return false;
    }

    // Validate keys is a non-empty array
    if (!Array.isArray(this.keys) || this.keys.length === 0) {
      console.error('Validation failed: Keys must be a non-empty array');
      return false;
    }

    // Validate data is a Buffer
    if (!(this.data instanceof Buffer)) {
      console.error('Validation failed: Data must be a Buffer');
      return false;
    }

    return true; // All validations passed
  }

  /**
   * Convert the instruction to a JSON-serializable object.
   * @returns {Object} JSON representation of the instruction.
   */
  toJSON() {
    return {
      programId: this.programId.toBase58(),
      keys: this.keys,
      data: this.data.toString('base64'),
    };
  }

  /**
   * Create a TransactionInstruction from a JSON object.
   * @param {Object} json - The JSON object.
   * @returns {TransactionInstruction} The created instruction.
   */
  static fromJSON(json) {
    return new TransactionInstruction({
      programId: new PublicKey(json.programId),
      keys: json.keys,
      data: Buffer.from(json.data, 'base64'),
    });
  }

  /**
   * Helper to create a key object.
   * @param {PublicKey} pubkey - The public key for the account.
   * @param {boolean} isSigner - Whether this key signs the transaction.
   * @param {boolean} isWritable - Whether this key is writable.
   * @returns {Object} The key object.
   */
  static createKey(pubkey, isSigner, isWritable) {
    if (!(pubkey instanceof PublicKey)) {
      throw new Error('pubkey must be an instance of PublicKey');
    }
    return { pubkey, isSigner, isWritable };
  }
}

export { TransactionInstruction };
