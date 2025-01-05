import { PublicKey } from './publicKey.js';
import { 
  generateKeypair, 
  getPublicKey, 
  sign, 
  verify, 
  fromMnemonic as utilsFromMnemonic 
} from './utils/ed25519.js';
import * as bip39 from 'bip39';

export class Keypair {
  // Private fields
  #keypair;
  #mnemonic;

  constructor(mnemonic) {
    if (mnemonic) {
      this.#keypair = Keypair.fromMnemonic(mnemonic);
      this.#mnemonic = mnemonic;
    } else {
      this.#mnemonic = bip39.generateMnemonic();
      this.#keypair = Keypair.fromMnemonic(this.#mnemonic);
    }
  }

  static generate() {
    return new KeypairFromGenerated(generateKeypair());  // Call subclass for generated keypair
  }

  static fromMnemonic(mnemonic) {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }
    return utilsFromMnemonic(mnemonic);
  }

  static fromSecretKey(secretKey, options) {
    if (secretKey.byteLength !== 64) {
      throw new Error('bad secret key size');
    }

    const publicKey = secretKey.slice(32, 64);

    if (!options || !options.skipValidation) {
      const privateKey = secretKey.slice(0, 32);
      const computedPublicKey = getPublicKey(privateKey);

      for (let ii = 0; ii < 32; ii++) {
        if (publicKey[ii] !== computedPublicKey[ii]) {
          throw new Error('provided secretKey is invalid');
        }
      }
    }

    return new Keypair({ publicKey, secretKey });
  }

  // Public getter methods
  get publicKey() {
    return new PublicKey(this.#keypair.publicKey);
  }

  get secretKey() {
    return new Uint8Array(this.#keypair.secretKey);
  }

  getMnemonic() {
    return this.#mnemonic;
  }

  recoverFromMnemonic() {
    if (!this.#mnemonic) {
      throw new Error('No mnemonic available to recover from');
    }
    return new Keypair(this.#mnemonic);
  }

  sign(message) {
    if (!(message instanceof Uint8Array || Buffer.isBuffer(message))) {
      throw new TypeError('Message must be a Uint8Array or Buffer');
    }
    return sign(message, this.secretKey);
  }

  verify(message, signature, publicKey) {
    if (!(message instanceof Uint8Array || Buffer.isBuffer(message))) {
      throw new TypeError('Message must be a Uint8Array or Buffer');
    }

    if (!(publicKey instanceof PublicKey)) {
      throw new TypeError('Public key must be an instance of PublicKey');
    }

    return verify(message, signature, publicKey.toBytes());
  }

  // Setter method to allow subclasses to set #keypair
  _setKeypair(keypair) {
    if (!keypair || !keypair.publicKey || !keypair.secretKey) {
      throw new Error('Invalid keypair');
    }
    this.#keypair = keypair;
  }  
}

// Subclass that inherits from Keypair
class KeypairFromGenerated extends Keypair {
  constructor(generatedKeypair) {
    super();  // Call the parent constructor (which is empty, no mnemonic)
    this._setKeypair(generatedKeypair);  // Use the setter method to safely assign the keypair
  }
}

export default Keypair;
