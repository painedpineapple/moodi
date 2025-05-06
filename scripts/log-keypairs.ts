import * as utils from "./utils";

const main = async () => {
  const keypairs = await utils.getMoodiKeypairs();
  Object.entries(keypairs).map(([key, val]) => {
    console.log({ [key]: val.publicKey.toString() });
  });
};

main();
