function createAccount(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.Create;
    const data = encodeData(type, {
      lamports: params.lamports,
      space: params.space,
      programId: toBuffer(params.programId.toBuffer()),
    });

    return new TransactionInstruction({
      keys: [
        {pubkey: params.fromPubkey, isSigner: true, isWritable: true},
        {pubkey: params.newAccountPubkey, isSigner: true, isWritable: true},
      ],
      programId: this.programId,
      data,
    });
}