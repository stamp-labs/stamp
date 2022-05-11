import { createHash } from 'crypto';
import sharp from 'sharp';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import snapshot from '@snapshot-labs/snapshot.js';

export function sha256(str) {
  return createHash('sha256')
    .update(str)
    .digest('hex');
}

export async function resize(input, w, h) {
  return sharp(input)
    .resize(w, h)
    .webp({ lossless: true })
    .toBuffer();
}

export async function parseQuery(id, query) {
  let address = id;
  let network = '1';

  // Resolve format
  let format;
  const chunks = id.split(':');
  if (chunks.length === 2) {
    format = 'eip3770';
    address = chunks[1];
  } else if (chunks.length === 3) {
    format = 'caip10';
    address = chunks[2];
    network = chunks[1];
  } else if (id.startsWith('did:')) {
    format = 'did';
    address = id.slice(4);
  }
  console.log('Format', format);

  // Resolve ENS name
  if (address.includes('.')) {
    const provider = new StaticJsonRpcProvider('https://cloudflare-eth.com');
    const addressFromEns = await provider.resolveName(address);
    if (addressFromEns) address = addressFromEns;
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
    h,
    cb: query.cb || false
  };
}

export function getUrl(url) {
  const gateway: string = process.env.IPFS_GATEWAY || 'cloudflare-ipfs.com';
  return snapshot.utils.getUrl(url, gateway);
}

/**
 * @param methods An array of methods for benchmarking
 * @param inputs An array of inputs. These will be zippered to the methods
 * @param iterations The number of iterations to run to find the average
 * @param message An array of identifier message for similar functions. Useful when methods share names
 * Example:
 * import { resolveName, resolveName_ethers } from './ens';
 * import { benchmark } from './utils'
 * 
 * const methods = [resolveName, resolveName_ethers];
 * const inputs = [['0x809fa673fe2ab515faa168259cb14e2bedebf68e'], ['0x809fa673fe2ab515faa168259cb14e2bedebf68e']];
 * benchmark(methods, inputs, 3);
 * 
 * Then run:
 * 
 * yarn benchmark
 */
export async function benchmark(methods, inputs, iterations, identifiers) {
  for (let i = 0; i < methods.length; i++) {
    let sum = 0;
    for (let j = 0; j < iterations; j++) {
      const t0 = performance.now();
      await methods[i](...inputs[i]);
      const t1 = performance.now();
      console.log(`Call to ${methods[i].name} (${identifiers[i]}) took ${t1 - t0} milliseconds.`);
      const duration = t1 - t0;
      sum += duration;
    }
    const average = sum / iterations;
    console.log(
      `Average response time for ${methods[i].name} (${identifiers[i]}) after ${iterations} calls is ${average} milliseconds.\n`
    );
  }
}
