import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { Core } from '@self.id/core';

const core = new Core({ ceramic: 'https://ceramic-private.3boxlabs.com' });

export default async function resolve(address: string) {
  try {
    const did = await core.getAccountDID(`${getAddress(address)}@eip155:1`);
    const result = await core.get('basicProfile', did);

    const { src } = result?.image?.original || {};
    if (!src) return false;

    const url = getUrl(src);
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
