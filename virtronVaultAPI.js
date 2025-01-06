import { VaultProgram } from './vaultProgram.js';

export class VirtronVaultAPI {
  static createVaultAccount({ payer, newAccount, vinnies, space }) {
    return VaultProgram.createAccount({
      payer,
      newAccount,
      vinnies,
      space,
    });
  }

  static transferVinnies({ from, to, vinnies }) {
    return VaultProgram.transfer({
      from,
      to,
      vinnies,
    });
  }
}
