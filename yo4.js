import { Keypair } from './keypair.js';
import { PublicKey } from './publicKey.js';
import { TransactionInstruction } from './transactionInstruction.js';

export class SystemProgram {
    static PROGRAM_ID = new PublicKey('11111111111111111111111111111111');
  
    static createAccount({ payer, newAccount, vinnies, space, programId }) {
      const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: newAccount.publicKey, isSigner: true, isWritable: true },
      ];
  
      const data = Buffer.concat([
        Buffer.from([0]), // Instruction identifier
        this._encodeVinnies(vinnies),
        this._encodeSpace(space),
        programId.toBytes(),
      ]);
  
      return new TransactionInstruction({
        keys,
        programId: SystemProgram.PROGRAM_ID,
        data,
      });
    }
  
    static transfer({ from, to, vinnies }) {
      const keys = [
        { pubkey: from, isSigner: true, isWritable: true },
        { pubkey: to, isSigner: false, isWritable: true },
      ];
  
      const data = Buffer.concat([
        Buffer.from([1]), // Instruction identifier
        this._encodeVinnies(vinnies),
      ]);
  
      return new TransactionInstruction({
        keys,
        programId: SystemProgram.PROGRAM_ID,
        data,
      });
    }
  
    static _encodeVinnies(vinnies) {
      const buffer = Buffer.alloc(8);
      buffer.writeBigUInt64LE(BigInt(vinnies));
      return buffer;
    }
  
    static _encodeSpace(space) {
      const buffer = Buffer.alloc(8);
      buffer.writeBigUInt64LE(BigInt(space));
      return buffer;
    }
  }

// Step 1: Generate Keypairs
// Payer: The account funding the operations
const payerKeypair = new Keypair();
console.log('Payer Public Key:', payerKeypair.publicKey.toString());

// New Account: The account being created
const newAccountKeypair = Keypair.generate();
console.log('New Account Public Key:', newAccountKeypair.publicKey.toString());

// Recipient: The account receiving funds
const recipientKeypair = Keypair.generate();
console.log('Recipient Public Key:', recipientKeypair.publicKey.toString());

// Step 2: Create a New Account Instruction
const createAccountInstruction = SystemProgram.createAccount({
  payer: payerKeypair.publicKey,
  newAccount: newAccountKeypair,
  vinnies: 1_000_000, // Initial balance for the new account
  space: 256,         // Reserve 256 bytes of storage
  programId: SystemProgram.PROGRAM_ID, // Default SystemProgram ID
});

console.log('Create Account Instruction:', createAccountInstruction.data);

// Step 3: Transfer Funds Instruction
const transferInstruction = SystemProgram.transfer({
  from: payerKeypair.publicKey, // Source account
  to: recipientKeypair.publicKey, // Destination account
  vinnies: 500_000,             // Amount to transfer
});

console.log('Transfer Instruction:', transferInstruction.data);

// Step 4: Validation
// Validate the instructions
if (createAccountInstruction.validate()) {
  console.log('Create Account Instruction is valid.');
} else {
  console.error('Create Account Instruction validation failed.');
}

if (transferInstruction.validate()) {
  console.log('Transfer Instruction is valid.');
} else {
  console.error('Transfer Instruction validation failed.');
}
