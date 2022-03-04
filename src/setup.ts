import { establishConnection, getPrivateKey, getPublicKey } from './util';
import { SystemProgram, Transaction, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";

// Example function that can be written to interact with Solana.
async function transfer() {
  console.log("Establishing connection to network...");
  const connection = await establishConnection();

  const fromPubkey = getPublicKey("diego");
  const toPubkey = getPublicKey("sean");

  const instructions =  SystemProgram.transfer({
    fromPubkey: fromPubkey,
    toPubkey: toPubkey,
    lamports: 100
  });

  const signers = [
    {
      publicKey: fromPubkey,
      secretKey: getPrivateKey("diego"),
    },
  ];
  
  const transaction = new Transaction().add(instructions);
  console.log("Initializing transfer");
  console.log("Sender Account: ", fromPubkey.toBase58());
  console.log("Sender Starting Balance: ", await connection.getBalance(fromPubkey));
  console.log("Receiver Account: ", toPubkey.toBase58());
  console.log("Receiver Starting Balance: ", await connection.getBalance(toPubkey));

  const hash = await sendAndConfirmTransaction(
    connection,
    transaction,
    signers,
  );

  console.log(`Transaction complete. Hash: ${hash}`);
  console.log("Sender Starting Balance: ", await connection.getBalance(fromPubkey));
  console.log("Receiver Starting Balance: ", await connection.getBalance(toPubkey));

}

transfer();

module.exports = transfer;
