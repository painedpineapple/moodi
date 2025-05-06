// https://developers.metaplex.com/token-metadata/token-standard
import * as utils from "./utils";
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

async function main() {
  const keypairs = await utils.getMoodiKeypairs();
  const owner = new PublicKey("BypJbNiuwWyK2ettdE8mibzxVsVERU6K9Pe4ZBk8Yu1B");

  const ata = await getAssociatedTokenAddress(
    keypairs.soulboundTokenMint.publicKey,
    owner,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const ataIx = await createAssociatedTokenAccountInstruction(
    keypairs.admin.publicKey,
    ata,
    owner,
    keypairs.soulboundTokenMint.publicKey,
    TOKEN_2022_PROGRAM_ID
  );

  const mintToIx = await createMintToInstruction(
    keypairs.soulboundTokenMint.publicKey,
    ata,
    keypairs.admin.publicKey,
    1,
    [],
    TOKEN_2022_PROGRAM_ID
  );

  const tx = new Transaction().add(ataIx, mintToIx);

  const sx = await sendAndConfirmTransaction(utils.connection, tx, [
    keypairs.admin,
  ]);

  utils.logSx(sx || "");
}

main();
