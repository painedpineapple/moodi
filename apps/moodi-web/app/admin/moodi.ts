// only to be used in API
import {
  MOODI_DECIMALS,
  MOODI_TOKEN_ADDRESS,
  SOULBOUND_TOKEN_MINT,
} from "@/common/constants";
import {
  convertUtcToLocal,
  isConsecutiveDay,
  isSameDay,
  parseDate,
} from "@/common/date.utils";
import { LifeMetricRequest, Metadata } from "@/common/types";
import {
  getIsEligibleForReward,
  getTradableNft,
} from "@/entities/rewards/utils";
import {
  Metaplex,
  mintTokensBuilder,
  keypairIdentity,
  token,
} from "@metaplex-foundation/js";
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  adminKeypair,
  connection,
  moodiMintKeypair,
  RPC_URL,
  TOKEN_2022_PROGRAM_ID,
} from "./constants";
import { getAssetProof } from "@/common/das.utils";
import { createBurnCnftInstruction } from "@/common/burn.utils";
import {
  ConcurrentMerkleTreeAccount,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";

const createMintMoodiIx = async (ata: PublicKey, qty: number) => {
  return createMintToInstruction(
    new PublicKey(MOODI_TOKEN_ADDRESS),
    ata,
    adminKeypair.publicKey,
    qty * 10 ** MOODI_DECIMALS,
    []
  );
};

// A simple calculation that's easy for people to understand what their rewards should be each day. In crypto there's too much confusion around projects, best to keep things that have high expectations from users very simple to understand
export const getRewardQty = (streak: number) => streak * 10;

const airdropReward = async (recipient: string, qty: number) => {
  const mint = moodiMintKeypair.publicKey;

  const metaplex = new Metaplex(connection).use(keypairIdentity(adminKeypair));

  // TODO: we should create this token account as part of the tx when the user burns the tradable NFT. That way the user pays for the tx costs. We'll also airdrop some MOODI to them when they do that.
  await getOrCreateAssociatedTokenAccount(
    connection,
    adminKeypair,
    mint,
    new PublicKey(recipient)
  );

  const tx = await mintTokensBuilder(metaplex, {
    mintAddress: mint,
    toOwner: new PublicKey(recipient),
    amount: token(qty, MOODI_DECIMALS),
  });

  const sx = await tx.sendAndConfirm(metaplex);

  return sx.response.signature;
};

/**
 * @description Handle all validation to be sure that the user is eligible for an airdrop and update all user data (life metrics, metadata) accordingly.
 *
 * Validation:
 * - User must have not received an airdrop between 0:00 - 23:59 during their timezone. This should be based off of the previous life metric `timezoneOffsetMinutes` if it exists.
 * - User must have non-transferrable Moodi NFT in their wallet
 *
 * @param wallet User wallet address
 * @param newEntry The new life metric to be added (or updated)
 * @param lifeMetrics Should not updated with new life metric before being sent here, unless the user is updating an existing life metric. This function will return the updated life metrics after there is/isn't a Moodi airdrop.
 * @param user Not updated yet, as we want to update everything as atomically as possibly when doing the airdrop. This function will return the updated user metadata after there is/isn't a Moodi airdrop.
 */
export const processLifeMetricAndReward = async (
  wallet: string,
  newEntry: LifeMetricRequest,
  metadata: Metadata | null
): Promise<{
  metadata: Metadata;
  airdropSent: number;
}> => {
  const dateUtc = new Date().toISOString();
  // Check that they haven't already received a reward today. Update life metric
  const latestLifeMetric =
    (metadata?.lifeMetrics?.length || 0) > 0
      ? metadata?.lifeMetrics[(metadata?.lifeMetrics.length || 1) - 1]
      : undefined;

  if (metadata && latestLifeMetric) {
    const latestDateLocal = convertUtcToLocal(
      parseDate(latestLifeMetric.dateUtc),
      metadata.timezoneOffsetMinutes
    );
    const newDateLocal = convertUtcToLocal(
      parseDate(dateUtc),
      metadata.timezoneOffsetMinutes
    );

    if (isSameDay(latestDateLocal, newDateLocal)) {
      // update entry
      const newLifeMetric = {
        ...latestLifeMetric,
        ...newEntry,
        dateUtc,
      };
      let lifeMetrics = metadata.lifeMetrics;
      lifeMetrics[metadata.lifeMetrics.length - 1] = newLifeMetric;

      return {
        metadata: {
          ...metadata,
          lifeMetrics,
        },
        airdropSent: 0,
      };
    } else if (isConsecutiveDay(latestDateLocal, newDateLocal)) {
      const currentStreak = metadata.currentStreak + 1;

      const isEligibleForReward = await getIsEligibleForReward(RPC_URL, wallet);
      const rewardQty = isEligibleForReward
        ? getRewardQty(currentStreak)
        : null;
      const signature =
        isEligibleForReward && rewardQty
          ? await airdropReward(wallet, rewardQty)
          : null;
      // streak continues
      const newLifeMetric = {
        ...newEntry,
        dateUtc,
        rewardSignature: signature,
        rewardQty,
      };

      return {
        metadata: {
          ...metadata,
          total: metadata.total + 1,
          longestStreakDays:
            currentStreak > metadata.longestStreakDays
              ? currentStreak
              : metadata.longestStreakDays,
          currentStreak,
          lifeMetrics: [...metadata.lifeMetrics, newLifeMetric],
        },
        airdropSent: signature && rewardQty ? rewardQty : 0,
      };
    } else {
      // new life metric for existing user

      const currentStreak = 1;
      const isEligibleForReward = await getIsEligibleForReward(RPC_URL, wallet);
      const rewardQty = isEligibleForReward
        ? getRewardQty(currentStreak)
        : null;
      const signature =
        isEligibleForReward && rewardQty
          ? await airdropReward(wallet, rewardQty)
          : null;

      // streak starts over
      const newLifeMetric = {
        ...newEntry,
        dateUtc,
        rewardSignature: signature,
        rewardQty,
      };

      return {
        metadata: {
          ...metadata,
          total: metadata.total + 1,
          longestStreakDays:
            currentStreak > metadata.longestStreakDays
              ? currentStreak
              : metadata.longestStreakDays,
          currentStreak,
          lifeMetrics: [...metadata.lifeMetrics, newLifeMetric],
        },
        airdropSent: signature && rewardQty ? rewardQty : 0,
      };
    }
  } else {
    // no previous metadata or metrics
    const currentStreak = 1;
    const isEligibleForReward = await getIsEligibleForReward(RPC_URL, wallet);
    const rewardQty = isEligibleForReward ? getRewardQty(currentStreak) : null;
    const signature =
      isEligibleForReward && rewardQty
        ? await airdropReward(wallet, rewardQty)
        : null;

    // streak starts over
    const newLifeMetric = {
      ...newEntry,
      dateUtc,
      rewardSignature: signature,
      rewardQty,
    };

    return {
      metadata: {
        total: 1,
        // TODO: timezone implementation
        lastTimezoneChange: dateUtc,
        currentStartStreak: dateUtc,
        longestStreakDays: 1,
        currentStreak: 1,
        timezoneOffsetMinutes: 0,
        lifeMetrics: [newLifeMetric],
        version: "v0",
      },
      airdropSent: signature && rewardQty ? rewardQty : 0,
    };
  }
};

export const createSouldboundNftTx = async (rpc: string, wallet: string) => {
  const tradableNft = await getTradableNft(rpc, wallet);

  if (tradableNft) {
    const owner = new PublicKey(wallet);

    const moodiTokenMint = new PublicKey(MOODI_TOKEN_ADDRESS);

    const tokenAta = await getAssociatedTokenAddress(
      moodiTokenMint,
      owner,
      undefined
    );

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      owner,
      { mint: moodiTokenMint }
    );

    let tokenAtaIx: TransactionInstruction | undefined;

    if (tokenAccounts.value.length === 0) {
      // create moodi token account

      tokenAtaIx = await createAssociatedTokenAccountInstruction(
        adminKeypair.publicKey,
        tokenAta,
        owner,
        moodiTokenMint
      );
    }

    let soulboundAtaIx: TransactionInstruction | undefined;

    const soulboundMint = new PublicKey(SOULBOUND_TOKEN_MINT);

    const soulboundAta = await getAssociatedTokenAddress(
      soulboundMint,
      owner,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const soulboundTokenAccounts =
      await connection.getParsedTokenAccountsByOwner(owner, {
        mint: soulboundMint,
      });

    if (soulboundTokenAccounts.value.length === 0) {
      soulboundAtaIx = await createAssociatedTokenAccountInstruction(
        adminKeypair.publicKey,
        soulboundAta,
        owner,
        soulboundMint,
        TOKEN_2022_PROGRAM_ID
      );
    }

    const assetProof = await getAssetProof(RPC_URL, tradableNft.id);

    const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
      connection,
      new PublicKey(assetProof.tree_id)
    );

    const treeAuthority = treeAccount.getAuthority();
    const canopyDepth = treeAccount.getCanopyDepth();

    const proof: AccountMeta[] = assetProof.proof
      // remove the id's that are already part of the canopy
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }))
      .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0));

    const burnIx = await createBurnCnftInstruction(
      {
        leafOwner: owner,
        leafDelegate: owner,
        merkleTree: new PublicKey(assetProof.tree_id),
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        treeAuthority,
        anchorRemainingAccounts: proof,
      },
      {
        root: Array.prototype.slice.call(
          new PublicKey(assetProof.root.trim()).toBytes()
        ),
        dataHash: Array.prototype.slice.call(
          new PublicKey(tradableNft.compression!.data_hash.trim()).toBytes()
        ),
        creatorHash: Array.prototype.slice.call(
          new PublicKey(tradableNft.compression!.creator_hash.trim()).toBytes()
        ),
        nonce: tradableNft.compression!.leaf_id,
        index: assetProof.node_index - 2 ** assetProof.proof.length,
        // index: tradableNft.compression!.leaf_id,
      }
    );

    // mint soul-bound token
    const mintSoulboundTokenIx = createMintToInstruction(
      soulboundMint,
      soulboundAta,
      adminKeypair.publicKey,
      1,
      [],
      TOKEN_2022_PROGRAM_ID
    );

    // mint moodi tokens
    const mintMoodiIx = await createMintMoodiIx(tokenAta, 500);

    const tx = new Transaction();

    if (tokenAtaIx) {
      console.log("adding tokenAtaIx");
      tx.add(tokenAtaIx);
    }

    if (soulboundAtaIx) {
      console.log("adding soulboundAtaIx");
      tx.add(soulboundAtaIx);
    }

    tx.add(burnIx, mintSoulboundTokenIx, mintMoodiIx);

    const blockhash = await connection.getLatestBlockhash();

    tx.recentBlockhash = blockhash.blockhash;
    tx.feePayer = adminKeypair.publicKey;

    const rentExemptBalance =
      await connection.getMinimumBalanceForRentExemption(
        // The size of a typical token account
        165
      );
    const txFee = await tx.getEstimatedFee(connection);

    // have the user "pay us back" for tx fee and token account creation
    const transferFeeIx = SystemProgram.transfer({
      fromPubkey: owner,
      lamports: rentExemptBalance + (txFee || 0),
      toPubkey: adminKeypair.publicKey,
    });

    tx.add(transferFeeIx);

    await tx.partialSign(adminKeypair);

    return tx
      .serialize({
        requireAllSignatures: false,
      })
      .toString("base64");
  } else {
    throw new Error("NFT Verification Failed");
  }
};
