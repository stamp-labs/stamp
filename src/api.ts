import express from 'express';
import axios from 'axios';
import sharp from 'sharp';
import { createCanvas } from 'canvas';
import { renderIcon } from '@download/blockies';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { set, get } from './aws';
import { sha256 } from './utils';

const router = express.Router();

async function getEnsName(network, address) {
  const provider = new StaticJsonRpcProvider('https://cloudflare-eth.com');
  const abi = ['function getNames(address[]) view returns (string[])'];
  const contract = new Contract('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', abi, provider);
  const names = await contract.getNames([address]);
  return names[0];
}

async function getBlockie(address) {
  const canvas = createCanvas(64, 64);
  renderIcon({ seed: address, scale: 64 }, canvas);
  return canvas.toBuffer();
}

async function resize(input, w, h) {
  return sharp(input)
    .resize(w, h)
    .webp({ lossless: true })
    .toBuffer();
}

router.get('/avatar/:id', async (req, res) => {
  // Parse query
  const { id } = req.params;
  let address = id;
  const network = '1';
  const chunks = id.split(':');
  if (chunks.length === 2) {
    address = chunks[1];
  } else if (chunks.length === 3) {
    address = chunks[2];
  }
  address = address.toLowerCase();
  const query: any = req.query;
  const size = 64;
  const maxSize = 500;
  let s = query.s ? parseInt(query.s) : size;
  if (s < 1 || s > maxSize || isNaN(s)) s = size;
  let w = query.w ? parseInt(query.w) : s;
  if (w < 1 || w > maxSize || isNaN(w)) w = size;
  let h = query.h ? parseInt(query.h) : s;
  if (h < 1 || h > maxSize || isNaN(h)) h = size;

  // Generate key
  const key = sha256(
    JSON.stringify({
      network,
      address,
      w,
      h
    })
  );

  // Check cache
  const data: any = await get(key);
  if (data) {
    console.log('Got cache', address);
    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400',
      Expires: new Date(Date.now() + 86400000).toUTCString()
    });
    return data.pipe(res);
  }

  let input;
  let file;

  // ENS avatar lookup
  try {
    const ensName = await getEnsName(network, address);
    const url = `https://metadata.ens.domains/mainnet/avatar/${ensName}`;
    input = (await axios({ url, responseType: 'arraybuffer' })).data as Buffer;
    file = await resize(input, w, h);
  } catch (e) {
    // console.log(e);
  }

  // Fallback to Blockie
  if (!file) {
    // console.log('Fallback', address);
    input = await getBlockie(address);
    file = await resize(input, w, h);
  }

  // Render image
  try {
    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400',
      Expires: new Date(Date.now() + 86400000).toUTCString()
    });
    res.send(file);
  } catch (e) {
    console.log('Render image failed', address, e);
    return res.status(500).json({
      error: {
        message: 'server error',
        data: e
      }
    });
  }

  try {
    await set(key, file);
    console.log('Stored cache', address);
  } catch (e) {
    console.log('Store cache failed', address, e);
  }
});

export default router;
