import bs58 from 'bs58'; // Import bs58 for base58 encoding/decoding

export class Transaction {
  constructor() {
    this.instructions = [];
    this.signatures = [];
    this.accountKeys = [];
    this.recentBlockhash = 'mockedBlockhash1234567890'; // Mocked blockhash for testing
  }

  // Add instructions and update accountKeys
  add(...instructions) {
    instructions.forEach((instruction) => {
      this.instructions.push(instruction);
      instruction.keys.forEach((key) => {
        if (!this.accountKeys.some((existingKey) => existingKey.equals(key.pubkey))) {
          this.accountKeys.push(key.pubkey);
        }
      });
    });
  }

  // Add a signature to the transaction
  addSignature(publicKey, signature) {
    this.signatures.push({ publicKey, signature });
  }

  // Sign the transaction with the provided keypair
  sign(...keypairs) {
    // Ensure accountKeys is populated before signing
    this.accountKeys = [...new Set(this.accountKeys)];
    const message = this.compileMessage();

    if (!(message instanceof Buffer || message instanceof Uint8Array)) {
      throw new TypeError('Message must be a Uint8Array or Buffer');
    }

    keypairs.forEach((keypair) => {
      this.signatures.push({
        publicKey: keypair.publicKey,
        signature: keypair.sign(message),
      });
    });
  }

  // Populate the transaction with message and signatures
  static populate(message, signatures = []) {
    const transaction = new Transaction();
    transaction.recentBlockhash = message.recentBlockhash || 'mockedBlockhash1234567890';

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
          isSigner: transaction.signatures.some((keyObj) => keyObj.publicKey.equals(pubkey)) ||
            message.isAccountSigner(accountIndex),
          isWritable: message.isAccountWritable(accountIndex),
        };
      });

      transaction.instructions.push(
        new TransactionInstruction({
          keys,
          programId: message.accountKeys[instruction.programIdIndex],
          data: bs58.decode(instruction.data),
        })
      );
    });

    return transaction;
  }

  // Partially sign the transaction with the specified signers
  partialSign(...signers) {
    if (signers.length === 0) {
      throw new Error('No signers provided');
    }

    // Ensure deduplication of signers
    const uniqueSigners = Array.from(new Set(signers.map((signer) => signer.publicKey.toString())))
      .map((key) => signers.find((signer) => signer.publicKey.toString() === key));

    const message = this.compileMessage();

    uniqueSigners.forEach((signer) => {
      const signature = signer.sign(message);
      this.signatures.push({ publicKey: signer.publicKey, signature });
    });
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
}

