"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export const RPC_URL: string =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_RPC__MAINNET || ""
    : process.env.NEXT_PUBLIC_RPC__DEVNET || "";

export const WalletClient = ({ children }: { children: React.ReactNode }) => {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider
      endpoint={RPC_URL}
      config={{
        commitment: "confirmed",
      }}
    >
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="flex flex-col my-4">
            <div className="flex py-2 w-full justify-center gap-2">
              <WalletMultiButton />
              <WalletDisconnectButton />
            </div>
            {children}
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
