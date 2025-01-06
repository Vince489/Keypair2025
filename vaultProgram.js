import { PublicKey } from './publicKey1.js';
import { TransactionInstruction } from './transactionInstruction.js';
import { VAULT_INSTRUCTION_LAYOUTS } from './vaultLayouts.js'; // Import layouts

export class VaultProgram {
  // Hardcode the PROGRAM_ID to a fixed value
  static PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

  static createAccount({ payer, newAccount, vinnies, space }) {
    if (vinnies <= 0) throw new Error("Vinnies must be greater than 0.");
    if (space <= 0) throw new Error("Space must be greater than 0.");

    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: newAccount.publicKey, isSigner: true, isWritable: true },
    ];

    const layout = VAULT_INSTRUCTION_LAYOUTS.CREATE_ACCOUNT.layout;
    const data = Buffer.alloc(layout.span);
    layout.encode(
      {
        instruction: VAULT_INSTRUCTION_LAYOUTS.CREATE_ACCOUNT.index,
        vinnies,
        space,
      },
      data
    );

    return new TransactionInstruction({
      keys,
      programId: this.PROGRAM_ID,
      data,
    });
  }

  static transfer({ from, to, vinnies }) {
    if (vinnies <= 0) throw new Error("Vinnies must be greater than 0.");

    const keys = [
      { pubkey: from, isSigner: true, isWritable: true },
      { pubkey: to, isSigner: false, isWritable: true },
    ];

    const layout = VAULT_INSTRUCTION_LAYOUTS.TRANSFER.layout;
    const data = Buffer.alloc(layout.span);
    layout.encode(
      {
        instruction: VAULT_INSTRUCTION_LAYOUTS.TRANSFER.index,
        vinnies,
      },
      data
    );

    return new TransactionInstruction({
      keys,
      programId: this.PROGRAM_ID,
      data,
    });
  }
}
