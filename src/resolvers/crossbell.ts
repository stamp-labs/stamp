import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';

const API_URL = 'https://indexer.crossbell.io/v1';

function getDefaultImage(data) {
  const metadata = data.list?.length > 0 ? data.list[0].metadata : data.metadata;
  if (metadata?.content?.avatars?.length > 0) {
    return metadata.content.avatars[0];
  }
  return null;
}

export default async function resolve(address: string) {
  const endpoint = isAddress(address)
    ? `${API_URL}/addresses/${getAddress(address)}/characters`
    : `${API_URL}/handles/${address}/character`;

  try {
    const { data } = await axios({
      url: endpoint
    });
    const sourceUrl = getDefaultImage(data);
    if (!sourceUrl) return false;

    const url = getUrl(sourceUrl);
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
