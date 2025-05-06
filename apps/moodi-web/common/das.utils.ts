import { DAS } from "helius-sdk/dist/src/types/das-types";

export const searchAssets = async (
  rpc: string,
  params: DAS.SearchAssetsRequest
): Promise<DAS.GetAssetResponseList> => {
  const response = await fetch(rpc, {
    method: `POST`,
    headers: {
      "Content-Type": `application/json`,
    },
    body: JSON.stringify({
      jsonrpc: `2.0`,
      id: `my-id`,
      method: `searchAssets`,
      params,
    }),
  });
  const { result, error } = await response.json();
  if (error) throw error;
  return result;
};

export const getAssetProof = async (
  rpc: string,
  id: string
): Promise<DAS.GetAssetProofResponse> => {
  const response = await fetch(rpc, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetProof",
      params: {
        id,
      },
    }),
  });
  const { result } = await response.json();
  return result;
};
