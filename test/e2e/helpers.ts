import axios, { AxiosResponse } from 'axios';
import sharp from 'sharp';
import redis from '../../src/helpers/redis';
import { KEY_PREFIX } from '../../src/addressResolvers/cache';

export const HOST = `http://localhost:${process.env.PORT || 3003}`;
export const AVATAR_ID = '0x89ceF96c58A85d9bE6DFa46D667e71f45f9Ad046';
export const TOKEN_ID = '0x89ceF96c58A85d9bE6DFa46D667e71f45f9Ad046';
export const CUSTOM_SIZE = 32;
export const DEFAULT_SIZE = 64;
export const RANDOM_ETH_ADDRESS = '0x0f4C3548B3000f1E180F3F2258A4573c9925e229';
export const UNKNOWN_ID_FORMAT = '~0x/123,joe';

export const FALLBACK_REASONS = {
  notCached: 'not cached',
  unknownIdentifierFormat: 'unknown identifier format',
  noImageFound: 'no image found'
} as const;

export async function purge(): Promise<void> {
  if (!redis) return;

  const keys = await redis.keys(`${KEY_PREFIX}:*`);
  const transaction = redis.multi();

  keys.map((key: string) => transaction.del(key));
  transaction.exec();
}

export async function expectImageResponse(response: AxiosResponse, expectedSize: number) {
  expect(response.status).toBe(200);
  expect(response.data.length).toBeGreaterThan(0);

  const metadata = await sharp(response.data).metadata();

  expect(metadata.width).toBe(expectedSize);
  expect(metadata.height).toBe(expectedSize);
  expect(metadata.format).toBe('webp');
}

export function expectHeader(response: AxiosResponse, key: string, value: string) {
  expect(response.headers[key]).toBe(value);
}

export function getImageResponse(type: string, identifier: string) {
  return axios.get(`${HOST}/${type}/${identifier}`, { responseType: 'arraybuffer' });
}
