import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

//@ts-expect-error missing types
import * as BufferLayout from "buffer-layout";

import * as fs from "fs";

export const logError = (msg: string) => {
  console.log(`\x1b[31m${msg}\x1b[0m`);
};

const LOCAL_VALIDATOR_URL = "http://localhost:8899";
const DEV_NET_URL = 'https://api.devnet.solana.com';

/**
 * Establish a connection to the cluster
 */
 export async function establishConnection(): Promise<Connection> {
  let connection = new Connection(DEV_NET_URL, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', version);
  return connection;
}

/**
 * Build Public Key from file in keys/ directory with provided name.
 */
export const getPublicKey = (name: string) =>
  new PublicKey(
    JSON.parse(fs.readFileSync(`./keys/${name}_pub.json`) as unknown as string)
  );

/**
 * Build Private Key from file in keys/ directory with provided name.
 */
export const getPrivateKey = (name: string) =>
  Uint8Array.from(
    JSON.parse(fs.readFileSync(`./keys/${name}_private.json`) as unknown as string)
  );

/**
 * Build Key Pair from file in keys/ directory with provided name.
 */
export const getKeypair = (name: string) =>
  new Keypair({
    publicKey: getPublicKey(name).toBytes(),
    secretKey: getPrivateKey(name),
  });

export const getProgramId = () => {
  try {
    return getPublicKey("program");
  } catch (e) {
    logError("Given programId is missing or incorrect");
    process.exit(1);
  }
};