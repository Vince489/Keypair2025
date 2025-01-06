import bs58 from 'bs58'; // Import bs58 at the top of your file
import { TransactionInstruction } from './transactionInstruction.js'; // Import TransactionInstruction
import { PublicKey } from './publicKey1.js'; // Import PublicKey

export class Transaction {
  constructor() {
    this.instructions = [];
    this.signatures = [];
    this.accountKeys = []; // Initialize accountKeys array
  }

  // Add instructions and update accountKeys
  add(...instructions) {
    instructions.forEach(instruction => {
      this.instructions.push(instruction);
      instruction.keys.forEach(key => {
        if (!this.accountKeys.some(existingKey => existingKey.equals(key.pubkey))) {
          this.accountKeys.push(key.pubkey);
        }
      });
    });
  }

  addInstruction(instruction) {
    this.instructions.push(instruction);
  }

  // Serialize the entire transaction
  serialize() {
    return {
      instructions: this.instructions.map(instr => ({
        programId: instr.programId.toBase58(),
        keys: instr.keys.map(key => ({
          pubkey: key.pubkey.toBase58(),
          isSigner: key.isSigner,
          isWritable: key.isWritable
        })),
        data: instr.data.toString('base64')
      })),
      signatures: this.signatures.map(sig => ({
        publicKey: sig.publicKey.toBase58(),
        signature: sig.signature.toString('base64')
      }))
    };
  }

  // Deserialize the transaction from serialized data
  static deserialize(serialized) {
    const transaction = new Transaction();

    // Restore instructions
    serialized.instructions.forEach(instruction => {
      const keys = instruction.keys.map(key => ({
        pubkey: new PublicKey(key.pubkey),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      }));

      transaction.addInstruction(new TransactionInstruction({
        programId: new PublicKey(instruction.programId),
        keys,
        data: Buffer.from(instruction.data, 'base64'),
      }));
    });

    // Restore signatures
    if (serialized.signatures) {
      serialized.signatures.forEach(sig => {
        transaction.signatures.push({
          publicKey: new PublicKey(sig.publicKey),
          signature: Buffer.from(sig.signature, 'base64'), // Decode the base64 signature
        });
      });
    }

    // Restore accountKeys
    transaction.accountKeys = [
      ...new Set(transaction.instructions.flatMap(instr => instr.keys.map(k => k.pubkey)))
    ];

    return transaction;
  }

  // Add a signature to the transaction
  addSignature(publicKey, signature) {
    this.signatures.push({ publicKey, signature });
  }

  // Sign the transaction with the provided keypair
  sign(...keypairs) {
    // Ensure accountKeys are populated
    if (this.accountKeys.length === 0) {
      throw new Error("Account keys are missing. Add instructions before signing.");
    }

    // Compile message for signing
    const message = this.compileMessage();

    // Sign with each keypair
    keypairs.forEach(keypair => {
      const signature = keypair.sign(message); // Ensure keypair.sign is properly implemented
      this.signatures.push({
        publicKey: keypair.publicKey,
        signature: signature,
      });
    });
  }

  static populate(message, signatures = []) {
    const transaction = new Transaction();

    // Populate the recent blockhash
    transaction.recentBlockhash = message.recentBlockhash;

    // Set fee payer if required
    if (message.header.numRequiredSignatures > 0) {
      transaction.feePayer = message.accountKeys[0];
    }

    // Map signatures to public keys
    signatures.forEach((signature, index) => {
      const sigPubkeyPair = {
        signature: signature === null ? null : bs58.decode(signature),
        publicKey: message.accountKeys[index],
      };
      transaction.signatures.push(sigPubkeyPair);
    });

    // Parse instructions
    message.instructions.forEach((instruction) => {
      const keys = instruction.accounts.map((accountIndex) => {
        const pubkey = message.accountKeys[accountIndex];
        return {
          pubkey,
          isSigner: transaction.signatures.some(
            (keyObj) => keyObj.publicKey.equals(pubkey)
          ) || message.isAccountSigner(accountIndex),
          isWritable: message.isAccountWritable(accountIndex),
        };
      });

      // Add the instruction to the transaction
      transaction.instructions.push(
        new TransactionInstruction({
          keys,
          programId: message.accountKeys[instruction.programIdIndex],
          data: Buffer.from(instruction.data, 'base58'),
        })
      );
    });

    // Set additional metadata if needed
    transaction._message = message;
    transaction._json = transaction.toJSON();

    return transaction;
  }

  // Partially sign the transaction with the specified signers
  partialSign(...signers) {
    if (signers.length === 0) {
      throw new Error('No signers provided');
    }

    // Deduplicate signers
    const seen = new Set();
    const uniqueSigners = [];
    for (const signer of signers) {
      const key = signer.publicKey.toString();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSigners.push(signer);
      }
    }

    // Compile the message to ensure it's up-to-date
    const message = this._compile();

    // Perform the partial signing operation
    this._partialSign(message, ...uniqueSigners);
  }

  // Internal method to compile the transaction message
  _compile() {
    const message = this.compileMessage();

    if (!message.accountKeys || message.accountKeys.length === 0) {
      throw new Error("Account keys are not populated properly.");
    }

    const signedKeys = message.accountKeys.slice(
      0,
      message.header.numRequiredSignatures,
    );

    if (this.signatures.length === signedKeys.length) {
      const valid = this.signatures.every((pair, index) => {
        return signedKeys[index].equals(pair.publicKey);
      });

      if (valid) return message;
    }

    this.signatures = signedKeys.map(publicKey => ({
      signature: null,
      publicKey,
    }));

    return message;
  }

  /**
   * Serialize the transaction, converting each instruction to a plain object.
   * @returns {Object} The serialized transaction.
   */
  serialize() {
    return {
      instructions: this.instructions.map(instr => ({
        programId: instr.programId.toBase58(),
        keys: instr.keys.map(key => ({
          pubkey: key.pubkey.toBase58(),
          isSigner: key.isSigner,
          isWritable: key.isWritable
        })),
        data: instr.data.toString('base64')
      })),
      signatures: this.signatures.map(sig => ({
        publicKey: sig.publicKey.toBase58(),
        signature: sig.signature.toString('base64')
      }))
    };
  }

  // Ensure compileMessage returns a Buffer or Uint8Array
  compileMessage() {
    // Simulate the message compilation process
    const message = {
      accountKeys: this.accountKeys,
      header: {
        numRequiredSignatures: this.signatures.length,
      },
    };

    // Create a Buffer from the compiled message (for simplicity, using JSON)
    const messageBuffer = Buffer.from(JSON.stringify(message));

    return messageBuffer;
  }

  // Return the JSON representation of the transaction
  toJSON() {
    return {
      instructions: this.instructions,
      signatures: this.signatures,
    };
  }
}
