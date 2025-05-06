import {
  METADATA_SHDW_STORAGE_ACCOUNT,
  METADATA_SHDW_STORAGE_ACCOUNT__DEVELOPMENT,
  SHDW_BASE_URL,
} from "./constants";

export const getMetadataFilename = (wallet: string) =>
  `${wallet}--metadata.json`;

export const getMetadataUriBase = (isProd: boolean) =>
  `${SHDW_BASE_URL}/${
    isProd
      ? METADATA_SHDW_STORAGE_ACCOUNT
      : METADATA_SHDW_STORAGE_ACCOUNT__DEVELOPMENT
  }`;

export const getMetadataUri = (isProd: boolean, wallet: string) =>
  `${getMetadataUriBase(isProd)}/${getMetadataFilename(wallet)}`;
