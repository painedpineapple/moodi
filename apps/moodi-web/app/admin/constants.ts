import { Connection, Keypair, PublicKey } from "@solana/web3.js";

export const RPC_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_RPC__MAINNET || ""
    : process.env.NEXT_PUBLIC_RPC__DEVNET || "";

export const connection = new Connection(RPC_URL, "confirmed");

export const adminKeypair = Keypair.fromSecretKey(
  Buffer.from(process.env.ADMIN_AUTHORITY_KEYPAIR!, "base64")
);

export const moodiMintKeypair = Keypair.fromSecretKey(
  Buffer.from(process.env.MOODI_MINT_KEYPAIR!, "base64")
);

export const METADATA_STORAGE_ACCOUNT =
  process.env.NODE_ENV === "production"
    ? process.env.METADATA_SHDW_STORAGE_ACCOUNT || ""
    : process.env.METADATA_SHDW_STORAGE_ACCOUNT__DEVELOPMENT || "";

export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);
