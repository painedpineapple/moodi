export const dynamic = "force-dynamic"; // static by default, unless reading the request
import nacl from "tweetnacl";
import bs58 from "bs58";
import { CREATE_MESSAGE } from "@/entities/life-metric/constants";
import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";
import { LifeMetricRequest, Metadata } from "@/common/types";
import { processLifeMetricAndReward } from "@/app/admin/moodi";
import {
  connection,
  METADATA_STORAGE_ACCOUNT,
  adminKeypair,
} from "@/app/admin/constants";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { getMetadataFilename, getMetadataUri } from "@/common/metadata.utils";

export async function POST(request: Request) {
  const {
    signature,
    wallet,
    lifeMetric,
  }: { signature: string; wallet: string; lifeMetric: LifeMetricRequest } =
    await request.json();

  const verified = nacl.sign.detached.verify(
    new TextEncoder().encode(CREATE_MESSAGE),
    bs58.decode(signature),
    bs58.decode(wallet)
  );

  if (!verified) {
    return new Response(null, {
      status: 401,
      statusText: `Verification failed`,
    });
  }

  const userMetadataFilename = getMetadataFilename(wallet);

  const metadataUrl = getMetadataUri(
    process.env.NODE_ENV === "production",
    wallet
  );

  // get existing metadata, create new one if it doesn't exist
  let metadata: Metadata | null;

  const metadataRes = await fetch(metadataUrl);

  let metadataFileExists;
  if (metadataRes.status === 200) {
    metadata = await metadataRes.json();
    metadataFileExists = true;
  } else if (metadataRes.status === 404) {
    metadataFileExists = false;
    metadata = null;
  } else {
    return new Response(null, {
      status: metadataRes.status,
      statusText: `Could not process user metadata`,
    });
  }

  const updates = await processLifeMetricAndReward(
    wallet,
    lifeMetric,
    metadata
  );

  const drive = await new ShdwDrive(
    connection,
    new Wallet(adminKeypair)
  ).init();

  const file: ShadowFile = {
    name: userMetadataFilename,
    file: Buffer.from(JSON.stringify(updates.metadata), "utf-8"),
  };

  if (metadataFileExists) {
    if (process.env.NODE_ENV === "production") {
      await drive.editFile(
        new PublicKey(METADATA_STORAGE_ACCOUNT),
        metadataUrl,
        file
      );
    } else {
      return new Response(Buffer.from(JSON.stringify("")), {
        status: 201,
        // this is currently a limitation of shdw drive
        statusText: "Files cannot be updated on devnet at this time.",
      });
    }
  } else {
    await drive.uploadFile(new PublicKey(METADATA_STORAGE_ACCOUNT), file);
  }

  return new Response(null, {
    status: 200,
    statusText: `Your life metric was updated.${
      updates.airdropSent
        ? ` ${updates.airdropSent} MOODI were sent to your wallet.`
        : ""
    }`,
  });
}
