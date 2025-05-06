import {Helius} from 'helius-sdk';

export const helius = new Helius(process.env.HELIUS_API_KEY as string);
