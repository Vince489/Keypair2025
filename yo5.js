import { Keypair } from './keypair.js';
import { PublicKey } from './publicKey.js';
import { TransactionInstruction } from './transactionInstruction.js';
import { Transaction } from './transaction.js';

export class VaultProgram {
  static PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

  static createAccount({ payer, newAccount, vinnies, space, programId }) {
    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: newAccount.publicKey, isSigner: true, isWritable: true },
    ];

    const data = Buffer.concat([
      Buffer.from([0]), // Instruction identifier for account creation
      this._encodeVinnies(vinnies),
      this._encodeSpace(space),
      programId.toBytes(),
    ]);

    return new TransactionInstruction({
      keys,
      programId: VaultProgram.PROGRAM_ID,
      data,
    });
  }

  static transfer({ from, to, vinnies }) {
    const keys = [
      { pubkey: from, isSigner: true, isWritable: true },
      { pubkey: to, isSigner: false, isWritable: true },
    ];

    const data = Buffer.concat([
      Buffer.from([1]), // Instruction identifier for transfer
      this._encodeVinnies(vinnies),
    ]);

    return new TransactionInstruction({
      keys,
      programId: VaultProgram.PROGRAM_ID,
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

// // Example usage:
// const payerKeypair = new Keypair();
// console.log('Payer Public Key:', payerKeypair.publicKey.toString());

// const newAccountKeypair = Keypair.generate();
// console.log('New Account Public Key:', newAccountKeypair.publicKey.toString());

// // Create a New Account Instruction
// const createAccountInstruction = VaultProgram.createAccount({
//   payer: payerKeypair.publicKey,
//   newAccount: newAccountKeypair,
//   vinnies: 1_000_000, // Initial balance for the new account
//   space: 256,         // Reserve 256 bytes of storage
//   programId: VaultProgram.PROGRAM_ID,
// });

// // Transfer Funds Instruction
// const transferInstruction = VaultProgram.transfer({
//   from: payerKeypair.publicKey, // Source account
//   to: newAccountKeypair.publicKey, // Destination account
//   vinnies: 500_000,             // Amount to transfer
// });

// // Create a new Transaction and add instructions
// const transaction = new Transaction();
// transaction.add(createAccountInstruction, transferInstruction);

// // **Sign the transaction first** with the payer's keypair
// transaction.sign(payerKeypair);

// // Now, you can add the payer's signature to the transaction
// transaction.addSignature(payerKeypair.publicKey, payerKeypair.sign(transaction.compileMessage()));

// // Compile the Message for broadcasting
// const compiledMessage = transaction.compileMessage();
// console.log('Compiled Message:', compiledMessage);

// // Get the JSON representation of the transaction
// const transactionJSON = transaction.toJSON();
// console.log('Transaction JSON:', transactionJSON);


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
  space: 256,         // Reserve 256 bytes of storage
  programId: VaultProgram.PROGRAM_ID,
});

// Transfer Funds Instruction
const transferInstruction = VaultProgram.transfer({
  from: payerKeypair.publicKey, // Source account
  to: newAccountKeypair.publicKey, // Destination account
  vinnies: 500_000,             // Amount to transfer
});

// Create a new Transaction and add instructions
const transaction = new Transaction();
transaction.add(createAccountInstruction, transferInstruction);

// **Sign the transaction first** with the payer's keypair
transaction.sign(payerKeypair);

// Now, you can add the payer's signature to the transaction
transaction.addSignature(payerKeypair.publicKey, payerKeypair.sign(transaction.compileMessage()));

// Compile the Message for broadcasting
const compiledMessage = transaction.compileMessage();
console.log('Compiled Message:', compiledMessage);

// Get the JSON representation of the transaction
const transactionJSON = transaction.toJSON();
console.log('Transaction JSON:', transactionJSON);