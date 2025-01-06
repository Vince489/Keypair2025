import { Keypair } from './keypair.js';
import { VirtronVaultAPI } from './virtronVaultAPI.js';
import { Transaction } from './transaction1.js';

// Generate keypairs
const payer = Keypair.generate();
const newAccount = Keypair.generate();

// Create a vault account
const createInstruction = VirtronVaultAPI.createVaultAccount({
  payer: payer.publicKey,
  newAccount,
  vinnies: 1000,
  space: 1024,
});

// Transfer vinnies
const transferInstruction = VirtronVaultAPI.transferVinnies({
  from: payer.publicKey,
  to: newAccount.publicKey,
  vinnies: 500,
});

// Create a transaction and add instructions
const transaction = new Transaction();
transaction.add(createInstruction);
transaction.add(transferInstruction);

// Sign and serialize the transaction
transaction.sign(payer, newAccount);
const serializedTransaction = transaction.serialize();
console.log("Serialized Transaction:", serializedTransaction);
