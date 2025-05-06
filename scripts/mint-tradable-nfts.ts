import { mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum";
import {
  keypairIdentity,
  PublicKey,
  publicKey,
  Umi,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import * as utils from "./utils";

type MintResult = {
  success: boolean;
  address: string;
  sig?: string;
  error?: any;
};

const mintTnft = async (
  address: string,
  merkleTree: PublicKey,
  collectionMint: PublicKey,
  metadata: utils.MoodiNftMetadata,
  umi: Umi
): Promise<MintResult> => {
  try {
    const res = await mintToCollectionV1(umi, {
      leafOwner: publicKey(address),
      merkleTree,
      collectionMint,
      metadata: {
        ...metadata,
        collection: { key: collectionMint, verified: true },
        sellerFeeBasisPoints: 550, // 5.5%
      },
    }).sendAndConfirm(umi);

    return {
      success: true,
      address,
      sig: base58.deserialize(res.signature)[0],
    };
  } catch (error) {
    return {
      success: false,
      address,
      error,
    };
  }
};

const main = async () => {
  const whitelist = await utils.loadWhitelist("initial-tnft-airdrop");
  const keypairs = await utils.getMoodiKeypairs();
  const creator = keypairIdentity({
    publicKey: publicKey(keypairs.admin.publicKey),
    secretKey: keypairs.admin.secretKey,
  });
  const umi = createUmi(utils.connection.rpcEndpoint).use(creator);
  const merkleTree = publicKey(keypairs.merkleTree.publicKey);
  const collectionMint = publicKey(keypairs.nftTradable.publicKey);
  const metadatas = await utils.getMoodiMetadata();

  const results = await Promise.all(
    whitelist.map((a) =>
      mintTnft(a, merkleTree, collectionMint, metadatas.nftTradable, umi)
    )
  );

  await utils.writeLog(
    `initial-tnft-airdrop--${Date.now()}`,
    JSON.stringify(results, null, 2)
  );
};

main();
