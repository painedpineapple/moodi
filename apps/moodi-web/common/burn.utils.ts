import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { MPL_BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import * as beet from "@metaplex-foundation/beet";

const BUBBLE_PROGRAM_ID = new PublicKey(MPL_BUBBLEGUM_PROGRAM_ID.toString());

const burnStruct = new beet.BeetArgsStruct(
  [
    ["instructionDiscriminator", beet.uniformFixedSizeArray(beet.u8, 8)],
    ["root", beet.uniformFixedSizeArray(beet.u8, 32)],
    ["dataHash", beet.uniformFixedSizeArray(beet.u8, 32)],
    ["creatorHash", beet.uniformFixedSizeArray(beet.u8, 32)],
    ["nonce", beet.u64],
    ["index", beet.u32],
  ],
  "BurnInstructionArgs"
);

const burnDescriminator = [116, 110, 29, 56, 107, 219, 42, 93];

export type BurnInstructionArgs = {
  root: number[];
  dataHash: number[];
  creatorHash: number[];
  nonce: beet.bignum;
  index: number;
};
export type BurnInstructionAccounts = {
  treeAuthority: PublicKey;
  leafOwner: PublicKey;
  leafDelegate: PublicKey;
  merkleTree: PublicKey;
  logWrapper: PublicKey;
  compressionProgram: PublicKey;
  systemProgram?: PublicKey;
  anchorRemainingAccounts?: AccountMeta[];
};

export const createBurnCnftInstruction = async (
  accounts: BurnInstructionAccounts,
  args: BurnInstructionArgs,
  programId: PublicKey = BUBBLE_PROGRAM_ID
): Promise<TransactionInstruction> => {
  const [data] = burnStruct.serialize({
    instructionDiscriminator: burnDescriminator,
    ...args,
  });
  const keys = [
    {
      pubkey: accounts.treeAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.leafOwner,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.leafDelegate,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.merkleTree,
      isWritable: true,
      isSigner: false,
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
