// VaultProgram class

class VaultProgram {
    static PROGRAM_ID = new PublicKey("11111111111111111111111111111111");
  
    static INSTRUCTION = {
      CREATE_ACCOUNT: 0,
      TRANSFER: 1,
      ALLOCATE_FUNDS: 2,
    };
  
    static INITIAL_SUPPLY = 1000000000000; // 1 billion VRT in Vinnies (1 VRT = 1000 Vinnies)
  
    static initializeVault({ treasuryAccount, space }) {
      // Initialize the vault with the 1 billion VRT (1 trillion Vinnies)
      const initialVinnies = VaultProgram.INITIAL_SUPPLY;
      return VaultProgram.createAccount({
        payer: treasuryAccount.publicKey, 
        newAccount: treasuryAccount, 
        vinnies: initialVinnies,
        space,
      });
    }
  
    static allocateFunds({ payer, to, vinnies }) {
      if (vinnies <= 0) throw new Error("Amount to allocate must be greater than 0.");
    
      // Allocate funds to specific account
      return VaultProgram.transfer({
        from: payer.publicKey, // Treasury account
        to: to.publicKey, // Recipient account
        vinnies: vinnies,
      });
    }
  
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
  