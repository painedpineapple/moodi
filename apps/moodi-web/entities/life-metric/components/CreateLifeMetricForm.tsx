"use client";

import { encryptData } from "@/common/encrypt.utils";
import { base58 } from "@scure/base";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CREATE_MESSAGE } from "../constants";

require("@solana/wallet-adapter-react-ui/styles.css");

const MOCK_PASSPHRASE = "I'd rather spend the day at the mall with McNab";

export const CreateLifeMetricForm = () => {
  const wallet = useWallet();

  const create = useMutation({
    mutationKey: ["create-life-metric"],
    mutationFn: async () => {
      if (!wallet.signMessage || !wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      const encodedMessage = new TextEncoder().encode(CREATE_MESSAGE);
      const signatureRaw = await wallet.signMessage(encodedMessage);

      const mockEntry = {
        highMood: "HypoManic",
        lowMood: "neutral",
        sleepDisturbance: true,
        caffeineIntake: true,
      };

      const res = await axios.post("/api/life-metric", {
        signature: base58.encode(signatureRaw),
        wallet: wallet.publicKey.toString(),
        lifeMetric: encryptData(JSON.stringify(mockEntry), MOCK_PASSPHRASE),
      });

      if (res.status > 299) throw new Error(res.statusText);

      return res.statusText;
    },
  });

  return (
    <div className="flex flex-col gap-4 text-center">
      <button
        className="p-4 rounded text-black bg-blue-50 hover:bg-blue-300 transition-all"
        onClick={() => create.mutate()}
      >
        Store Entry
      </button>
      <div>{create.isPaused ? "Submitting..." : null}</div>
      <div>{create.isSuccess ? create.data : null}</div>
      <div>{create.error ? create.error.message : null}</div>
    </div>
  );
};
