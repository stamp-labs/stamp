import express from 'express';
import axios from 'axios';
import sharp from 'sharp';
import { createCanvas } from 'canvas';
import { renderIcon } from '@download/blockies';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { set, get, streamToString } from './aws';
import { sha256 } from './utils';

const router = express.Router();

async function resize(input, w, h) {
  return sharp(input)
    .resize(w, h)
    .webp({ lossless: true })
    .toBuffer();
}

async function getBlockie(address) {
  const canvas = createCanvas(64, 64);
  renderIcon({ seed: address, scale: 64 }, canvas);
  const input = canvas.toBuffer();
  return await resize(input, 500, 500);
}

async function getEnsName(network, address) {
  const provider = new StaticJsonRpcProvider('https://cloudflare-eth.com');
  const abi = ['function getNames(address[]) view returns (string[])'];
  const contract = new Contract('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', abi, provider);
  const names = await contract.getNames([address]);
  return names[0];
}

async function getEns(address, network) {
  try {
    const ensName = await getEnsName(network, address);
    const url = `https://metadata.ens.domains/mainnet/avatar/${ensName}`;
    const input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, 500, 500);
  } catch (e) {
    // console.log(e);
    return false;
  }
}

function parseQuery(id, query) {
  let address = id;
  const network = '1';
  const chunks = id.split(':');
  if (chunks.length === 2) {
    address = chunks[1];
  } else if (chunks.length === 3) {
    address = chunks[2];
  }
  address = address.toLowerCase();
  const size = 64;
  const maxSize = 500;
  let s = query.s ? parseInt(query.s) : size;
  if (s < 1 || s > maxSize || isNaN(s)) s = size;
  let w = query.w ? parseInt(query.w) : s;
  if (w < 1 || w > maxSize || isNaN(w)) w = size;
  let h = query.h ? parseInt(query.h) : s;
  if (h < 1 || h > maxSize || isNaN(h)) h = size;
  return {
    address,
    network,
    w,
    h
  };
}

router.get('/avatar/:id', async (req, res) => {
  // Generate keys
  const { address, network, w, h } = parseQuery(req.params.id, req.query);
  const key1 = sha256(JSON.stringify({ network, address }));
  const key2 = sha256(JSON.stringify({ network, address, w, h }));

  // Check cache
  const cache2: any = await get(key2);
  if (cache2) {
    console.log('Got cache', address);
    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400',
      Expires: new Date(Date.now() + 86400000).toUTCString()
    });
    return cache2.pipe(res);
  }

  const cache1: any = await get(key1);
  let file1;
  if (cache1) {
    file1 = await streamToString(cache1);
    console.log('Got base cache');
  } else {
    console.log('No cache for', key1, cache1);
    const [blockie, ens] = await Promise.all([getBlockie(address), getEns(address, network)]);
    file1 = ens ? ens : blockie;
  }

  // Resize and return image
  const file2 = await resize(file1, w, h);
  res.set({
    'Content-Type': 'image/webp',
    'Cache-Control': 'public, max-age=86400',
    Expires: new Date(Date.now() + 86400000).toUTCString()
  });
  res.send(file2);

  // Store cache
  try {
    if (!cache1) {
      await set(key1, file1);
      console.log('Stored base cache', key1);
    }
    await set(key2, file2);
    console.log('Stored cache', address);
  } catch (e) {
    console.log('Store cache failed', address, e);
  }
});

export default router;
