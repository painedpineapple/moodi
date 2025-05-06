// https://developers.metaplex.com/token-metadata/token-standard
import * as utils from "./utils";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import {
  keypairIdentity,
  Metaplex,
  mintTokensBuilder,
  token,
} from "@metaplex-foundation/js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const network =
  "https://devnet.helius-rpc.com?api-key=1c934aaa-2f9a-4e7f-8f55-8776aab520dd";

async function main() {
  const wallet = await utils.loadHomeKeypair("moodi-admin");
  const mint = await utils.loadHomeKeypair("moodi-token-mint");
  const recepient = utils.devWallet;

  const metaplex = new Metaplex(utils.connection).use(keypairIdentity(wallet));

  const ata = await getOrCreateAssociatedTokenAccount(
    utils.connection,
    wallet,
    mint.publicKey,
    recepient
  );

  console.log({ ata: ata.address.toString() });

  const tx = await mintTokensBuilder(metaplex, {
    mintAddress: mint.publicKey,
    toOwner: recepient,
    amount: token(100000, utils.MOODI_DECIMALS),
  });

  const sx = await tx.sendAndConfirm(metaplex);

  utils.logSx(sx.response.signature);
}

main();
