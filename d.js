import { VirtronVaultAPI } from './virtronVaultAPI.js';
import { PublicKey } from './publicKey1.js';

const payer = new PublicKey('...');
const newAccount = { publicKey: new PublicKey('...') };
const programId = new PublicKey('...');

VirtronVaultAPI.setVaultProgramId(programId);

const createInstruction = VirtronVaultAPI.createVaultAccount({
  payer,
  newAccount,
  vinnies: 100,
  space: 1024,
});

const transferInstruction = VirtronVaultAPI.transferVinnies({
  from: payer,
  to: newAccount.publicKey,
  vinnies: 50,
});
