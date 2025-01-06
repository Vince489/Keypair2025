const { VaultProgram } = require('./vaultProgram');
const { Keypair } = require('./keypair');
const { Transaction } = require('./transaction');
const mongoose = require('mongoose');

// MongoDB Schema for transaction
const transactionSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  amountVRT: Number,
  amountVinnies: Number,
  transactionStatus: String,
  timestamp: { type: Date, default: Date.now },
});

const TransactionModel = mongoose.model('Transaction', transactionSchema);

// Function to handle transfer
async function handleTransfer(req, res) {
  const { senderPublicKey, receiverPublicKey, amountVRT } = req.body;

  if (!senderPublicKey || !receiverPublicKey || !amountVRT) {
    return res.status(400).send({ message: 'Missing required fields.' });
  }

  try {
    // Convert VRT to Vinnies (Assuming 1 VRT = 1000 Vinnies)
    const amountVinnies = amountVRT * 1000;

    // Generate Keypair for sender (already have the sender's public key)
    const senderKeypair = Keypair.fromPublicKey(senderPublicKey);
    const receiverKeypair = Keypair.fromPublicKey(receiverPublicKey);

    // Create the transfer instruction
    const transferInstruction = VaultProgram.transfer({
      from: senderKeypair.publicKey,
      to: receiverKeypair.publicKey,
      vinnies: amountVinnies,
    });

    // Add this instruction to a new transaction
    const transaction = new Transaction();
    transaction.add(transferInstruction);

    // Simulate signing the transaction (you would normally sign it with the sender's keypair)
    transaction.sign(senderKeypair);

    // Serialize the transaction for submission
    const serializedTransaction = transaction.serialize();
    console.log('Serialized Transaction:', serializedTransaction);

    // Send transaction to the blockchain and handle response (mocked here)
    const transactionResult = await processBlockchainTransaction(serializedTransaction);

    // If successful, save the transaction in MongoDB
    if (transactionResult.status === 'success') {
      const transactionRecord = new TransactionModel({
        sender: senderPublicKey,
        receiver: receiverPublicKey,
        amountVRT,
        amountVinnies,
        transactionStatus: 'completed',
      });

      await transactionRecord.save();

      res.status(200).send({ message: 'Transfer successful.', transactionId: transactionRecord._id });
    } else {
      res.status(500).send({ message: 'Blockchain transaction failed.' });
    }

  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).send({ message: 'Internal Server Error.' });
  }
}

// Example function to mock blockchain transaction submission
async function processBlockchainTransaction(serializedTransaction) {
  // Simulate successful blockchain transaction processing
  return { status: 'success', transactionId: 'mocked_transaction_id' };
}

