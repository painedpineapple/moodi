import {
  createInitializeInstruction,
  pack,
  type TokenMetadata,
} from "@solana/spl-token-metadata";
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createInitializeNonTransferableMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as utils from "./utils";

type MintResult = {
  success: boolean;
  sig?: string;
  error?: any;
};

export const getMetadataUri = (wallet: string) => `${wallet}--metadata-v0.json`;

const mintSoulbound = async (
  admin: Keypair,
  mintKeypair: Keypair
): Promise<MintResult> => {
  try {
    const mint = mintKeypair.publicKey;
    const payer = admin;

    const metadataExt = TYPE_SIZE + LENGTH_SIZE;
    const moodiMetadata = await utils.getMoodiMetadata();

    const metadata: TokenMetadata = {
      name: "Your Moodi Sol",
      mint,
      symbol: "MOODIS",
      uri: moodiMetadata.soulboundTokenMint.uri,
      additionalMetadata: [],
    };

    const metadataLen = pack(metadata).length;

    const mintLen = getMintLen([
      ExtensionType.NonTransferable,
      ExtensionType.MetadataPointer,
    ]);

    const lamports = await utils.connection.getMinimumBalanceForRentExemption(
      mintLen + metadataExt + metadataLen
    );

    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const initializeNonTransferableMintInstruction =
      createInitializeNonTransferableMintInstruction(
        mint, // Mint Account address
        TOKEN_2022_PROGRAM_ID // Token Extension Program ID
      );

    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mint, // Mint Account address
        admin.publicKey, // Authority that can set the metadata address
        mint, // Account address that holds the metadata
        TOKEN_2022_PROGRAM_ID
      );

    const initializeMintInstruction = createInitializeMintInstruction(
      mint, // Mint Account Address
      0, // Decimals of Mint
      admin.publicKey, // Designated Mint Authority
      null, // Optional Freeze Authority
      TOKEN_2022_PROGRAM_ID // Token Extension Program ID
    );

    const initializeMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mint, // Account address that holds the metadata
      updateAuthority: admin.publicKey, // Authority that can update the metadata
      mint: mint, // Mint Account address
      mintAuthority: admin.publicKey, // Designated Mint Authority
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    });

    const tx = new Transaction().add(
      createAccountIx,
      initializeNonTransferableMintInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
      initializeMetadataInstruction
    );

    const sx = await sendAndConfirmTransaction(utils.connection, tx, [
      admin,
      mintKeypair,
    ]);

    return {
      success: true,
      sig: sx,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error,
    };
  }
};

const main = async () => {
  const keypairs = await utils.getMoodiKeypairs();

  const results = await mintSoulbound(
    keypairs.admin,
    keypairs.soulboundTokenMint
  );

  utils.logSx(results.sig || "");
};

main();
