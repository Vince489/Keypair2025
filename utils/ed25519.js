// utils/ed25519.js

import nacl from 'tweetnacl';
import * as bip39 from 'bip39';

/**
 * Generates a random 32-byte private key.
 * @returns {Uint8Array} A private scalar.
 */
function generatePrivateKey() {
  return nacl.randomBytes(32);
}

/**
 * Generates an Ed25519 keypair.
 * @returns {{ publicKey: Uint8Array, secretKey: Uint8Array }} The generated keypair.
 */
function generateKeypair() {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: keypair.publicKey,
    secretKey: keypair.secretKey,
  };
}

/**
 * Derives the public key from a given private key.
 * @param {Uint8Array} privateKey - The 32-byte private scalar.
 * @returns {Uint8Array} The public key.
 */
function getPublicKey(privateKey) {
  return nacl.sign.keyPair.fromSecretKey(privateKey).publicKey;
}

/**
 * Checks if a given public key is valid and lies on the Ed25519 curve.
 * @param {Uint8Array} publicKey - The public key to check.
 * @returns {boolean} True if valid, false otherwise.
 */
function isOnCurve(publicKey) {
  try {
    nacl.sign.keyPair.fromSecretKey(new Uint8Array([...new Array(32).fill(0), ...publicKey]));
    return true;
  } catch {
    return false;
  }
}

/**
 * Signs a message using the secret key.
 * @param {Uint8Array | Buffer} message - The message to sign.
 * @param {Uint8Array} secretKey - The 64-byte secret key.
 * @returns {Uint8Array} The signature.
 */
function sign(message, secretKey) {
  return nacl.sign.detached(message, secretKey);
}

/**
 * Verifies a signature against a message and public key.
 * @param {Uint8Array | Buffer} message - The original message.
 * @param {Uint8Array} signature - The signature to verify.
 * @param {Uint8Array} publicKey - The public key.
 * @returns {boolean} True if valid, false otherwise.
 */
function verify(message, signature, publicKey) {
  // console.log('Verify Inputs:', { message, signature, publicKey });
  return nacl.sign.detached.verify(message, signature, publicKey);
}

/**
 * Generates an Ed25519 keypair from a mnemonic phrase.
 * @param {string} mnemonic - The BIP39 mnemonic.
 * @returns {{ publicKey: Uint8Array, secretKey: Uint8Array }} The derived keypair.
 * @throws {Error} If the mnemonic is invalid.
 */
function fromMnemonic(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic');
  }

  // Convert mnemonic to seed (32 bytes)
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // Use the first 32 bytes of the seed for Ed25519 key generation
  const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));

  return {
    publicKey: keypair.publicKey,
    secretKey: keypair.secretKey,
  };
}

export { 
  generatePrivateKey, 
  generateKeypair, 
  getPublicKey, 
  isOnCurve, 
  sign, 
  verify,
  fromMnemonic
};
