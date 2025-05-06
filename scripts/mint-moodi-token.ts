// https://developers.metaplex.com/token-metadata/token-standard
import * as utils from "./utils";
import {
  createV1,
  fetchDigitalAsset,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createAmount,
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
  some,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";

const ACTION: "init" | "update" | "fetch" = "fetch";

const network =
  "https://devnet.helius-rpc.com?api-key=1c934aaa-2f9a-4e7f-8f55-8776aab520dd";

async function main() {
  const onChainMetadata: {
    name: string;
    symbol: string;
    description: string;
  } = await Bun.file("../storage/moodi-metadata.json").json();

  const metadata = {
    ...onChainMetadata,
    uri: "https://shdw-drive.genesysgo.net/8zrkXW3dm2ULkxxvE4C4W11c7RmsEWENHv8nLTMzAz9J/moodi-metadata.json",
    sellerFeeBasisPoints: createAmount(0, "%", 2),
    tokenStandard: TokenStandard.Fungible,
    decimals: some(9),
  };

  const wallet = await utils.loadHomeKeypair("moodi-admin");
  const mint = await utils.loadHomeKeypair("moodi-token-mint");

  const umi = createUmi(network);
  const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(wallet));
  umi.use(signerIdentity(signer, true)).use(mplTokenMetadata());

  if (ACTION === "init") {
    const result = await createV1(umi, {
      ...metadata,
      mint: createSignerFromKeypair(umi, fromWeb3JsKeypair(mint)),
    }).sendAndConfirm(umi);

    console.log(result);
  } else if (ACTION === "fetch") {
    const result = await fetchDigitalAsset(umi, publicKey(mint.publicKey));

    console.log(result);
  } else if (ACTION === "update") {
    console.log("UPDATE moodi-token not implemented");
  }
}

main();
