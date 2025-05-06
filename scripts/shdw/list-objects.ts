import { getShdwDrive } from "../utils";

const main = async () => {
  try {
    const { drive, account } = await getShdwDrive();
    const items = await drive.listObjects(account);

    console.log(items);
  } catch (error) {
    console.error(error);
  }
};

main();
