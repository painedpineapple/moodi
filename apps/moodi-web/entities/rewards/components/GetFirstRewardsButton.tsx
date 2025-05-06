"use client";

import { base58 } from "@scure/base";
import { RPC_URL } from "@/common/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { getIsEligibleForReward, getTradableNft } from "../utils";
import { BURN_TO_MINT_TO_EARN_MESSAGE } from "../constants";
import { sendAndConfirmTransaction, Transaction } from "@solana/web3.js";

const buttonClass =
  "p-4 rounded text-black bg-blue-50 hover:bg-blue-300 transition-all";

export const GetFirstRewardsButton = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const eligibilityStatus = useMutation<null | "CanEarn" | "CanMintNft">({
    mutationKey: ["reward-eligibility-status", wallet.publicKey?.toString()],
    mutationFn: async () => {
      if (!wallet.publicKey) return null;

      const canGetReward = await getIsEligibleForReward(
        RPC_URL,
        wallet.publicKey.toString()
      );

      if (canGetReward) {
        return "CanEarn";
      } else {
        const tradableNft = await getTradableNft(
          RPC_URL,
          wallet.publicKey.toString()
        );

        return tradableNft ? "CanMintNft" : null;
      }
    },
  });

  useEffect(() => {
    if (
      wallet.publicKey &&
      !eligibilityStatus.isPending &&
      !eligibilityStatus.data &&
      !eligibilityStatus.isError
    ) {
      eligibilityStatus.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.publicKey]);

  const burnAndEarn = useMutation({
    mutationKey: ["burn-to-mint-and-earn", wallet.publicKey?.toString()],
    mutationFn: async () => {
      try {
        if (
          !wallet.signMessage ||
          !wallet.publicKey ||
          !wallet.signTransaction
        ) {
          throw new Error("Wallet not connected");
        }

        const encodedMessage = new TextEncoder().encode(
          BURN_TO_MINT_TO_EARN_MESSAGE
        );

        const signatureRaw = await wallet.signMessage(encodedMessage);

        const res = await fetch("/api/soulbound-token", {
          method: "POST",
          body: JSON.stringify({
            wallet: wallet.publicKey.toString(),
            signature: base58.encode(signatureRaw),
          }),
        });

        if (res.status > 299) throw new Error(res.statusText);

        const data = await res.json();

        const rawTx = Buffer.from(data, "base64");
        const tx = Transaction.from(rawTx);

        const signedTx = await wallet.signTransaction(tx);

        const signature = await connection.sendRawTransaction(
          (await signedTx).serialize(),
          { skipPreflight: true }
        );

        const blockhash = await connection.getLatestBlockhash();
        const confRes = await connection.confirmTransaction(
          {
            ...blockhash,
            signature,
          },
          "confirmed"
        );

        if (confRes.value.err) {
          console.log({ confRes });
          throw new Error(JSON.stringify(confRes.value.err, null, 2));
        }

        return `Your MOODIS NFT and initial MOODI token reward have been sent to your wallet. You can now start earning MOODI each day as you record an entry.`;
      } catch (error: any) {
        console.log(error);
        throw new Error(
          `Message: ${error.message}.\nLogs: ${JSON.stringify(
            error.logs || "",
            null,
            2
          )}`
        );
      }
    },
  });

  switch (eligibilityStatus.data) {
    case null:
      // don't have either NFT, suggest they buy one to earn
      return (
        <div className="flex flex-col gap-1">
          <p>
            With the MOODI NFT you&lsquo;ll be able to earn MOODI tokens each
            day that you record your life metrics.
          </p>
          <button
            className={buttonClass}
            // onClick={() => create.mutate()}
          >
            Buy MOODI NFT
          </button>
        </div>
      );
    case "CanMintNft":
      // user can burn tradable nft for non-transferrable NFT to earn moodi
      return (
        <div className="flex flex-col gap-1">
          <div>{burnAndEarn.isPaused ? "Submitting..." : null}</div>
          <div>{burnAndEarn.isSuccess ? burnAndEarn.data : null}</div>
          <div>{burnAndEarn.error ? burnAndEarn.error.message : null}</div>
          <p>
            You can burn your tradable Moodi NFT to receive a non-transferrable
            MOODI NFT and earn MOODI tokens each day you record a life metric.
            Burn now and get a bonus 500 MOODI
          </p>
          <button className={buttonClass} onClick={() => burnAndEarn.mutate()}>
            Start Earning Now
          </button>
        </div>
      );
    // they just need to create life metric to earn
    case "CanEarn":
    // loading data
    case undefined:
    default:
      return null;
  }
};
