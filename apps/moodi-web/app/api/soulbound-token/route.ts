export const dynamic = "force-dynamic"; // static by default, unless reading the request
import nacl from "tweetnacl";
import bs58 from "bs58";
import { createSouldboundNftTx } from "@/app/admin/moodi";
import { RPC_URL } from "@/app/admin/constants";
import { BURN_TO_MINT_TO_EARN_MESSAGE } from "@/entities/rewards/constants";

/**
 * 1. Verify user's signed message, and verify the message is to burn the tradable nft for the soulbound one.
 * 2. Verify that they have tradable nft
 * 3. Sign a tx to burn tradable NFT, transfer 500 moodi to user's wallet, and transfer souldbound NFT to user's wallet.
 * 4. Set user as tx payer
 * 5. Send raw tx to frontend to be signed by user
 */
export async function POST(request: Request) {
  const { signature, wallet }: { signature: string; wallet: string } =
    await request.json();

  const verified = nacl.sign.detached.verify(
    new TextEncoder().encode(BURN_TO_MINT_TO_EARN_MESSAGE),
    bs58.decode(signature),
    bs58.decode(wallet)
  );

  if (!verified) {
    return new Response(null, {
      status: 401,
      statusText: `Verification failed`,
    });
  }

  const rawTx = await createSouldboundNftTx(RPC_URL, wallet);

  return new Response(JSON.stringify(rawTx), {
    status: 200,
  });
}
