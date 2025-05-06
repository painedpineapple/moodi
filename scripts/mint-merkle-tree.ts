import * as utils from "./utils";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { generateSigner } from "@metaplex-foundation/umi";
import {
  createTree,
  getMerkleTreeSize,
  MPL_BUBBLEGUM_PROGRAM_ID,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@metaplex-foundation/mpl-bubblegum";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { ValidDepthSizePair } from "@solana/spl-account-compression";
import {
  AccountMeta,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import * as beet from "@metaplex-foundation/beet";

const BUBBLE_PROGRAM_ID = new PublicKey(MPL_BUBBLEGUM_PROGRAM_ID.toString());

export type CreateTreeInstructionArgs = {
  maxDepth: number;
  maxBufferSize: number;
  public: boolean;
};

export type CreateTreeInstructionAccounts = {
  treeAuthority: PublicKey;
  merkleTree: PublicKey;
  payer: PublicKey;
  treeCreator: PublicKey;
  logWrapper: PublicKey;
  compressionProgram: PublicKey;
  systemProgram?: PublicKey;
  anchorRemainingAccounts?: AccountMeta[];
};

const createTreeStruct = new beet.FixableBeetArgsStruct(
  [
    ["instructionDiscriminator", beet.uniformFixedSizeArray(beet.u8, 8)],
    ["maxDepth", beet.u32],
    ["maxBufferSize", beet.u32],
    ["public", beet.coption(beet.bool)],
  ],
  "CreateTreeInstructionArgs"
);

const createTreeInstructionDiscriminator = [
  165, 83, 136, 142, 89, 202, 47, 220,
];

const createCreateTreeInstruction = (
  accounts: CreateTreeInstructionAccounts,
  args: CreateTreeInstructionArgs,
  programId = BUBBLE_PROGRAM_ID
) => {
  const [data] = createTreeStruct.serialize({
    instructionDiscriminator: createTreeInstructionDiscriminator,
    ...args,
  });
  const keys = [
    {
      pubkey: accounts.treeAuthority,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.merkleTree,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.treeCreator,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.logWrapper,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.compressionProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ];
  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc);
    }
  }
  const ix = new TransactionInstruction({
    programId,
    keys,
    data,
  });
  return ix;
};

// ~0.31 SOL
async function main() {
  console.log("in main");
  const keypairs = await utils.getMoodiKeypairs();

  const depthSize: ValidDepthSizePair = {
    maxBufferSize: 64,
    maxDepth: 20,
  };

  const canopyDepth = 12;

  const space = getMerkleTreeSize(
    depthSize.maxDepth,
    depthSize.maxBufferSize,
    canopyDepth
  );
  const lamports = await utils.connection.getMinimumBalanceForRentExemption(
    space
  );

  const allocTreeIx = SystemProgram.createAccount({
    fromPubkey: keypairs.admin.publicKey,
    newAccountPubkey: keypairs.merkleTree.publicKey,
    space,
    lamports,
    programId: new PublicKey(SPL_ACCOUNT_COMPRESSION_PROGRAM_ID.toString()),
  });

  const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
    [keypairs.merkleTree.publicKey.toBuffer()],
    BUBBLE_PROGRAM_ID
  );

  const createTreeIx = createCreateTreeInstruction(
    {
      payer: keypairs.admin.publicKey,
      treeCreator: keypairs.admin.publicKey,
      treeAuthority,
      merkleTree: keypairs.merkleTree.publicKey,
      compressionProgram: new PublicKey(
        SPL_ACCOUNT_COMPRESSION_PROGRAM_ID.toString()
      ),
      logWrapper: new PublicKey(SPL_NOOP_PROGRAM_ID.toString()),
    },
    {
      maxBufferSize: depthSize.maxBufferSize,
      maxDepth: depthSize.maxDepth,
      public: false,
    },
    BUBBLE_PROGRAM_ID
  );

  const tx = new Transaction().add(allocTreeIx, createTreeIx);
  tx.feePayer = keypairs.admin.publicKey;

  const blockhash = await utils.connection.getLatestBlockhash();

  tx.recentBlockhash = blockhash.blockhash;

  const fee = await tx.getEstimatedFee(utils.connection);

  console.warn(
    { costInSol: ((fee || 0) + lamports) / LAMPORTS_PER_SOL },
    "Comment out the return statement if you want to proceed with this cost."
  );
  return;

  const sx = await sendAndConfirmTransaction(
    utils.connection,
    tx,
    [keypairs.merkleTree, keypairs.admin],
    {
      ...blockhash,
      commitment: "confirmed",
      skipPreflight: true,
    }
  );

  // const sx_ = await sendAndConfirmTransaction(utils.connection, tx);

  // @ts-ignore
  utils.logSx(sx);
}

main();
