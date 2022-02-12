import express from 'express';
import axios from 'axios';
import sharp from 'sharp';
import { createCanvas } from 'canvas';
import { renderIcon } from '@download/blockies';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

const router = express.Router();

async function getEnsName(address) {
  const provider = new StaticJsonRpcProvider('https://cloudflare-eth.com');
  const abi = ['function getNames(address[]) view returns (string[])'];
  const contract = new Contract('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', abi, provider);
  const names = await contract.getNames([address]);
  return names[0];
}

async function getBlockie(address) {
  const canvas = createCanvas(64, 64);
  renderIcon({ seed: address, scale: 64 }, canvas);
  return canvas.createPNGStream({ compressionLevel: 0, resolution: 100 });
}

router.get('/img/:address', async (req, res) => {
  let { address } = req.params;
  address = address.toLowerCase();
  const query: any = req.query;
  const s = query.s ? parseInt(query.s) : 256;
  const w = query.w ? parseInt(query.w) : s;
  const h = query.h ? parseInt(query.h) : s;

  let stream;

  try {
    const ensName = await getEnsName(address);
    const url = `https://metadata.ens.domains/mainnet/avatar/${ensName}`;
    stream = (await axios({ url, responseType: 'stream' })).data;
  } catch (e) {
    // console.log(e);
  }

  if (!stream) stream = await getBlockie(address);

  const src = stream.pipe(
    sharp()
      .resize(w, h)
      .webp({ lossless: true })
  );
  src.pipe(res);
});

export default router;
