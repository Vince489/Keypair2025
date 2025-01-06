import { PublicKey } from './publicKey1.js';

/**
 * Class representing a transaction instruction.
 */
class TransactionInstruction {
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

  static createKey(pubkey, isSigner, isWritable) {
    if (!(pubkey instanceof PublicKey)) {
      throw new Error('pubkey must be an instance of PublicKey');
    }
    return { pubkey, isSigner, isWritable };
  }
}

export { TransactionInstruction };
