import { Keypair } from './keypair.js'; // Importing Keypair class
import { TransactionInstruction } from './transactionInstruction.js'; // Importing TransactionInstruction
import { Transaction } from './transaction1.js'; // Importing Transaction class
import { VaultProgram } from './vaultProgram.js'; // Importing VaultProgram
import { PublicKey } from './publicKey1.js'; // Importing PublicKey class

async function main() {
  // Step 1: Generate new accounts
  const newAccount = Keypair.generate();
  console.log("New Account Public Key:", newAccount.publicKey.toBase58());

  const payer = Keypair.generate();
  console.log("Payer Public Key:", payer.publicKey.toBase58());

  // Step 2: Set PROGRAM_ID
  VaultProgram.PROGRAM_ID = new PublicKey('11111111111111111111111111111111');
  console.log("VaultProgram PROGRAM_ID set:", VaultProgram.PROGRAM_ID.toBase58());

  // Step 3: Account creation instruction using VaultProgram
  const createAccountInstruction = VaultProgram.createAccount({
    payer: payer.publicKey,
    newAccount: newAccount.publicKey,
    vinnies: 1000, // Set the amount of funds (vinnies)
    space: 1024, // Space needed for the account
    programId: VaultProgram.PROGRAM_ID,
  });

  console.log("Raw Create Account Data:", createAccountInstruction.data);

  const accountCreationData = Buffer.from(createAccountInstruction.data); // Wrap data in Buffer

  // Keys for account creation instruction
  const accountKeys = [
    { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // Payer
    { pubkey: newAccount.publicKey, isSigner: true, isWritable: true } // New Account
  ];

  // Add account creation instruction to transaction
  const createInstruction = new TransactionInstruction({
    programId: VaultProgram.PROGRAM_ID,
    keys: accountKeys,
    data: accountCreationData, // Ensure data is a Buffer
  });

  const transaction = new Transaction();
  transaction.add(createInstruction);

  // Step 5: Transfer instruction using VaultProgram
  const transferInstruction = VaultProgram.transfer({
    from: payer.publicKey,
    to: newAccount.publicKey,
    vinnies: 500, // Amount to transfer
  });

  console.log("Raw Transfer Data:", transferInstruction.data);

  const transferData = Buffer.from(transferInstruction.data);

  // Keys for transfer instruction
  const transferKeys = [
    { pubkey: payer.publicKey, isSigner: true, isWritable: true },
    { pubkey: newAccount.publicKey, isSigner: false, isWritable: true }
  ];

  const transferTxnInstruction = new TransactionInstruction({
    programId: VaultProgram.PROGRAM_ID,
    keys: transferKeys,
    data: transferData,
  });

  transaction.add(transferTxnInstruction);

  // Step 6: Sign the transaction using the keypairs
  transaction.sign(payer, newAccount);

  const serializedTransaction = transaction.serialize();
  console.log("Serialized Transaction:", JSON.stringify(serializedTransaction, null, 2));

  const deserializedTransaction = Transaction.deserialize(serializedTransaction);
  console.log("Deserialized Transaction:", JSON.stringify(deserializedTransaction, null, 2));
}

main().catch(err => console.error("Error:", err));
