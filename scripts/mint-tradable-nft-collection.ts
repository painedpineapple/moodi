import * as utils from "./utils";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

async function main() {
  const keypairs = await utils.getMoodiKeypairs();
  const owner = {
    publicKey: publicKey(keypairs.admin.publicKey),
    secretKey: keypairs.admin.secretKey,
  };

  const collectionMint = {
    publicKey: publicKey(keypairs.nftTradable.publicKey),
    secretKey: keypairs.nftTradable.secretKey,
  };

  const umi = createUmi(utils.connection.rpcEndpoint)
    .use(keypairIdentity(owner))
    .use(mplTokenMetadata());

  const metadatas = await utils.getMoodiMetadata();

  console.log({
    collection: collectionMint.publicKey.toString(),
    ...metadatas.nftTradable,
  });

  const response = await createNft(umi, {
    ...metadatas.nftTradable,
    mint: createSignerFromKeypair(umi, collectionMint),
    // where do we put the collection mint?
    isCollection: true,
    sellerFeeBasisPoints: percentAmount(5.5), // 5.5%
    authority: createSignerFromKeypair(umi, owner),
    updateAuthority: createSignerFromKeypair(umi, owner),
    creators: [
      {
        address: publicKey(keypairs.admin.publicKey),
        verified: true,
        share: 100,
      },
    ],
  }).sendAndConfirm(umi);

  console.log({ response });
}

main();
