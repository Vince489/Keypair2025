// Example Usage

async function initializeVaultAndAllocateFunds() {
    const treasuryKeypair = Keypair.generate(); // This is the vault's treasury account
    const userPurchaseAccount = Keypair.generate(); // Account for users to purchase VRT from
  
    // Initialize Vault by creating the treasury account with 1 billion VRT (1 trillion Vinnies)
    const initializeVaultInstruction = VaultProgram.initializeVault({
      treasuryAccount: treasuryKeypair,
      space: 1024, // Example space for the treasury account
    });
  
    // Transfer coins from treasury account to the user purchase account
    const allocateFundsInstruction = VaultProgram.allocateFunds({
      payer: treasuryKeypair, // Treasury account
      to: userPurchaseAccount, // User's account to purchase coins
      vinnies: 500000000000, // Allocate 500 billion Vinnies for purchase (example)
    });
  
    // Here you'd build and send the transaction using these instructions.
    const transaction = new Transaction();
    transaction.add(initializeVaultInstruction);
    transaction.add(allocateFundsInstruction);
  
    // Sign the transaction and submit it to the blockchain
    const serializedTransaction = transaction.serialize();
    console.log("Serialized Transaction:", serializedTransaction);
  
    // Process the transaction (mocked here)
    const result = await processBlockchainTransaction(serializedTransaction);
    console.log("Transaction Result:", result);
  }
  
  // Mocking blockchain transaction submission
  async function processBlockchainTransaction(serializedTransaction) {
    // Simulate successful blockchain transaction processing
    return { status: 'success', transactionId: 'mocked_transaction_id' };
  }
  
  