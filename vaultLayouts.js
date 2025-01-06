import * as BufferLayout from 'buffer-layout';

export const VAULT_INSTRUCTION_LAYOUTS = {
  CREATE_ACCOUNT: {
    index: 0,
    layout: BufferLayout.struct([
      BufferLayout.u8('instruction'), // Instruction type
      BufferLayout.nu64('vinnies'),   // Number of vinnies
      BufferLayout.nu64('space'),     // Account space
    ]),
  },
  TRANSFER: {
    index: 1,
    layout: BufferLayout.struct([
      BufferLayout.u8('instruction'), // Instruction type
      BufferLayout.nu64('vinnies'),   // Number of vinnies
    ]),
  },
};
