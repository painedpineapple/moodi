import * as web3 from "@solana/web3.js";
import anchor from "@project-serum/anchor";
import { ShdwDrive } from "@shadow-drive/sdk";
import { percentAmount, publicKey } from "@metaplex-foundation/umi";
import { Creator } from "@metaplex-foundation/mpl-token-metadata";

export const mainnetConnection = new web3.Connection(
  "https://mainnet.helius-rpc.com?api-key=[YOUR_KEY]",
  "confirmed"
);

export const devnetConnection = new web3.Connection(
  "https://devnet.helius-rpc.com?api-key=[YOUR_KEY]",
  "confirmed"
);

export const connection = devnetConnection;

export const devWallet = new web3.PublicKey(
  "FRGkJho6fY7XivWsEBjousTaZBT6eUBkkrDyCN4nWcPR"
);

const cluster =
  connection.rpcEndpoint === devnetConnection.rpcEndpoint
    ? "devnet"
    : "mainnet-beta";

export const MOODI_DECIMALS = 9;

export const loadHomeKeypair = async (name: string) => {
  const file = await Bun.file(
    `${import.meta.dir}/../../../.config/solana/${name}.json`,
    {
      type: "utf-8",
    }
  ).json();

  return web3.Keypair.fromSecretKey(Buffer.from(file));
};

export const getShdwDrive = async () => {
  const keypair = await loadHomeKeypair("moodi-admin");

  const wallet = new anchor.Wallet(keypair);
  const drive = await new ShdwDrive(mainnetConnection, wallet).init();
  // account for token and NFT metdata
  const accountAddress = "8zrkXW3dm2ULkxxvE4C4W11c7RmsEWENHv8nLTMzAz9J";

  return {
    drive,
    keypair,
    url: `https://shdw-drive.genesysgo.net/${accountAddress}`,
    account: new web3.PublicKey(accountAddress),
  };
};

export const logSx = (sig: string) =>
  console.log(`https://solana.fm/tx/${sig}?cluster=${cluster}`);

export const getMoodiKeypairs = async () => {
  return {
    // ppx2ZNdXMBGVq2dr1QxCc2a5BR635fBJKQYg6vSgNwZ
    admin: await loadHomeKeypair("moodi-admin"),
    // mtoJ5iNdmFzCBhczLGxPAMzXkmJDkQXCTwcmVbQwq5E
    token: await loadHomeKeypair("moodi-token-mint"),
    // mosoxcodWrB2mKS87JXy4SFE6tErc7UgjEJC7CXiNUy
    soulboundTokenMint: await loadHomeKeypair("moodi-soulbound-token-mint"),
    // MoT5NjhKsihhyjFfdp2C1MsmoDNUzgYim4ru5bWFj5X
    nftTradable: await loadHomeKeypair("moodi-nft-tradable-mint"),
    // MKT8iacdgA1qn56mXCKiQchfj7JtDypvjMTLjAYT8Gp
    merkleTree: await loadHomeKeypair("moodi-merkle-tree-mint"),
  };
};

export const loadWhitelist = async (name: string): Promise<string[]> => {
  const file = await Bun.file(`${import.meta.dir}/whitelists/${name}.json`, {
    type: "utf-8",
  }).json();

  return file;
};

export const writeLog = async (name: string, data: string): Promise<void> => {
  await Bun.write(`${import.meta.dir}/mint-logs/${name}.json`, data);

  console.log(`\nWRITE LOG SUCCESS: ${name}\n\n${data}\n\n`);
};

export type MoodiNftMetadata = {
  name: string;
  symbol: string;
  description: string;
  uri: string;
  creators: Creator[];
};

export const getMoodiMetadata = async (): Promise<
  Record<"nftTradable" | "soulboundTokenMint", MoodiNftMetadata>
> => {
  const keypairs = await getMoodiKeypairs();
  return {
    nftTradable: {
      uri: "https://shdw-drive.genesysgo.net/8zrkXW3dm2ULkxxvE4C4W11c7RmsEWENHv8nLTMzAz9J/moodi-tradable-nft-metadata.json",
      ...(await Bun.file(
        `${import.meta.dir}/../storage/moodi-tradable-nft-metadata.json`
      ).json()),
      creators: [
        {
          address: publicKey(keypairs.admin.publicKey),
          verified: true,
          share: 100,
        },
      ],
    },
    soulboundTokenMint: {
      uri: "https://shdw-drive.genesysgo.net/8zrkXW3dm2ULkxxvE4C4W11c7RmsEWENHv8nLTMzAz9J/moodi-soulbound-token-metadata.json",
      ...(await Bun.file(
        `${import.meta.dir}/../storage/moodi-soulbound-token-metadata.json`
      ).json()),
      sellerFeeBasisPoints: percentAmount(0),
      creators: [
        {
          address: publicKey(keypairs.admin.publicKey),
          verified: true,
          share: 100,
        },
      ],
    },
  };
};
