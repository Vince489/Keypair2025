// import { Keypair } from './keypair.js'; // Importing Keypair class

// // Create a Keypair for the new account
// const newAccount = Keypair.generate();
// console.log("New Account Public Key:", newAccount.publicKey.toBase58());

// // Sign a message
// const message = "Hello, Virtron!";

// // Convert the message to a Buffer (or Uint8Array)
// const messageBuffer = Buffer.from(message, 'utf-8'); // 'utf-8' encoding to convert the string

// // Sign the message
// const signature = newAccount.sign(messageBuffer);
// console.log("Signature:", signature);


import { Keypair } from './keypair.js'; // Importing Keypair class
import bs58 from 'bs58'; // Import bs58 at the top of your file

// Create a Keypair for the new account
const newAccount = Keypair.generate();
console.log("New Account Public Key:", newAccount.publicKey.toBase58());

// Sign a message
const message = "Hello, Virtron!";
const messageBuffer = Buffer.from(message, 'utf-8'); // Convert string to Buffer

// Sign the message
const signature = newAccount.sign(messageBuffer);

// Convert the signature (Uint8Array) to base58
const signatureBase58 = bs58.encode(signature);
console.log("Signature (Base58):", signatureBase58);

