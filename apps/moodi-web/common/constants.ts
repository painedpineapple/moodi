export const SOULBOUND_TOKEN_MINT =
  "mosoxcodWrB2mKS87JXy4SFE6tErc7UgjEJC7CXiNUy";

export const TRADABLE_NFT_COLLECTION_MINT =
  "MoT5NjhKsihhyjFfdp2C1MsmoDNUzgYim4ru5bWFj5X";

export const TRADABLE_NFT_MERKLE_TREE =
  "MKT8iacdgA1qn56mXCKiQchfj7JtDypvjMTLjAYT8Gp";

export const MOODI_ADMIN_ADDRESS =
  "ppx2ZNdXMBGVq2dr1QxCc2a5BR635fBJKQYg6vSgNwZ";

export const MOODI_TOKEN_ADDRESS =
  "mtoJ5iNdmFzCBhczLGxPAMzXkmJDkQXCTwcmVbQwq5E";

export const MOODI_DECIMALS = 9;

export const SHDW_BASE_URL = "https://shdw-drive.genesysgo.net";

export const METADATA_SHDW_STORAGE_ACCOUNT__DEVELOPMENT =
  "4gJsKWRmdWGqJSF6hxjYV5WiFJnqPCo29fvneBtNstjo";

export const METADATA_SHDW_STORAGE_ACCOUNT =
  "7RcsrcgLnDND9nMvAi2CSC8t4EdX8q9PXT8R7WrMhuZW";

export const RPC_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_RPC__MAINNET || ""
    : process.env.NEXT_PUBLIC_RPC__DEVNET || "";
