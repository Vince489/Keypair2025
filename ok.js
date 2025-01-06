class PublicKey {
  constructor(value) {
    this.value = value;
  }

  toBase58() {
    // Simulate base58 encoding for simplicity
    return Buffer.from(this.value).toString('base64');
  }

  static fromBase58(base58String) {
    // Decode base58 to public key (simplified for this example)
    return new PublicKey(Buffer.from(base58String, 'base64').toString());
  }
}

class TransactionInstruction {
  constructor({ programId, keys, data }) {
    this.programId = programId;  // PublicKey
    this.keys = keys;            // Array of key objects
    this.data = data;            // Instruction data (Buffer)
  }

  // Serialize the instruction to a simple object
  serialize() {
    return {
      programId: this.programId.toBase58(),
      keys: this.keys.map(key => ({
        pubkey: key.pubkey.toBase58(),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
      data: this.data.toString('base64'),
    };
  }

  static deserialize(serialized) {
    return new TransactionInstruction({
      programId: new PublicKey(serialized.programId),
      keys: serialized.keys.map(key => ({
        pubkey: new PublicKey(key.pubkey),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
      data: Buffer.from(serialized.data, 'base64'),
    });
  }
}

class Transaction {
  constructor() {
    this.instructions = [];
  }

  addInstruction(instruction) {
    this.instructions.push(instruction);
  }

  // Serialize the entire transaction
  serialize() {
    return {
      instructions: this.instructions.map(instr => instr.serialize()),
    };
  }

  // Deserialize the transaction from serialized data
  static deserialize(serialized) {
    const transaction = new Transaction();
    serialized.instructions.forEach(instr => {
      transaction.addInstruction(TransactionInstruction.deserialize(instr));
    });
    return transaction;
  }
}

// Example usage:
const payerKeypair = new Keypair();
console.log('Payer Public Key:', payerKeypair.publicKey.toString());

const newAccountKeypair = Keypair.generate();
console.log('New Account Public Key:', newAccountKeypair.publicKey.toString());

// Create a New Account Instruction
const createAccountInstruction = VaultProgram.createAccount({
  payer: payerKeypair.publicKey,
  newAccount: newAccountKeypair,
  vinnies: 1_000_000, // Initial balance for the new account
  space: 256, // Reserve 256 bytes of storage
  programId: VaultProgram.PROGRAM_ID, // Explicitly pass the correct programId here
});

// Transfer Funds Instruction
const transferInstruction = VaultProgram.transfer({
  from: payerKeypair.publicKey, // Source account
  to: newAccountKeypair.publicKey, // Destination account
  vinnies: 500_000, // Amount to transfer
  programId: VaultProgram.PROGRAM_ID, // Explicitly pass the correct programId here
});

// Create a new Transaction and add instructions
const transaction = new Transaction();

// Debugging: Ensure instructions are being added
console.log('Adding instructions to transaction...');
transaction.add(createAccountInstruction, transferInstruction);

// Debug: Log transaction before signing
console.log('Transaction before signing:', transaction);

// Sign the transaction
transaction.sign(payerKeypair);

// Serialize the transaction
const serializedMessage = transaction.compileMessage();

// Debugging: Log the serialized message to check its structure
console.log('Serialized Message:', serializedMessage);

// Ensure instructions exist before proceeding
if (serializedMessage && serializedMessage.instructions && serializedMessage.instructions.length > 0) {
  try {
    // Deserialize the transaction if instructions exist
    const deserializedTransaction = Transaction.populate(
      JSON.parse(serializedMessage.toString()),
      transaction.signatures.map((s) => bs58.encode(s.signature)) // Use bs58 for encoding signatures
    );

    // Log the deserialized transaction
    console.log('Deserialized Transaction:', deserializedTransaction);
  } catch (error) {
    console.error('Error deserializing transaction:', error);
  }
} else {
  console.error('Error: Serialized message is missing instructions or is malformed');
}
