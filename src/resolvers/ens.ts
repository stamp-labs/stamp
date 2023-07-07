import axios from 'axios';
import { getProvider, resize } from '../utils';
import { max } from '../constants.json';
import { Contract } from '@ethersproject/contracts';

async function resolveName(address) {
  const provider = getProvider(1);
  const abi = ['function getNames(address[]) view returns (string[])'];
  const contract = new Contract('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', abi, provider);
  const names = await contract.getNames([address]);
  return names[0];
}

export default async function resolve(address) {
  try {
    const provider = getProvider(1);
    const name = await resolveName(address);
    if (!name) return false;
    const url = await provider.getAvatar(name);
    if (!url) return false;
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
