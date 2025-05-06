import { searchAssets } from "@/common/das.utils";
import {
  MOODI_ADMIN_ADDRESS,
  SOULBOUND_TOKEN_MINT,
  TRADABLE_NFT_COLLECTION_MINT,
} from "../../common/constants";

export const getIsEligibleForSouldboundNft = async (
  rpc: string,
  wallet: string
) => {
  const res = await searchAssets(rpc, {
    page: 1,
    ownerAddress: wallet,
    grouping: ["collection", TRADABLE_NFT_COLLECTION_MINT],
  });

  return res.items.some(
    (i) =>
      // double-check wallet is owner
      i.ownership.owner === wallet &&
      // make sure we're the authority
      i.creators![0].address === MOODI_ADMIN_ADDRESS &&
      i.creators![0].verified &&
      // make sure that it's verified
      i.grouping?.find(
        (g) =>
          g.group_key === "collection" &&
          g.group_value === TRADABLE_NFT_COLLECTION_MINT
      )
  );
};

export const getIsEligibleForReward = async (rpc: string, wallet: string) => {
  const res = await searchAssets(rpc, {
    page: 1,
    ownerAddress: wallet,
    // @ts-ignore tokenType prop exists
    tokenType: "fungible",
  });

  return res.items.some(
    (i) =>
      i.ownership.owner === wallet &&
      i.burnt === false &&
      i.id === SOULBOUND_TOKEN_MINT
  );
};

export const getTradableNft = async (rpc: string, wallet: string) => {
  const res = await searchAssets(rpc, {
    page: 1,
    ownerAddress: wallet,
    grouping: ["collection", TRADABLE_NFT_COLLECTION_MINT],
  });

  return res.items.find(
    (i) =>
      // double-check wallet is owner
      i.ownership.owner === wallet &&
      i.burnt === false &&
      // make sure we're the authority
      i.creators![0].address === MOODI_ADMIN_ADDRESS &&
      i.creators![0].verified &&
      // make sure that it's verified
      i.grouping?.find(
        (g) =>
          g.group_key === "collection" &&
          g.group_value === TRADABLE_NFT_COLLECTION_MINT
      )
  );
};
