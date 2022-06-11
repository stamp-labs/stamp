import { JSDOM } from 'jsdom';
import sharp from 'sharp';
import jazzicon from '@metamask/jazzicon';
import { resize } from '../utils';
import { max } from '../constants.json';

const dom = new JSDOM('');
global.document = dom.window.document;

export default async function resolve(address) {
  const { innerHTML, style } = jazzicon(64, parseInt(address.slice(2, 10), 16));

  const input = await sharp(Buffer.from(innerHTML, 'utf-8'))
    .flatten({ background: style.background })
    .webp({ lossless: true })
    .toBuffer();

  return await resize(input, max, max);
}
