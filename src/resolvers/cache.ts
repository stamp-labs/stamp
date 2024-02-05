import { createHash } from 'crypto';
import { Readable } from 'stream';
import { set as setCache, get as getCache, clear as clearCache, isConfigured } from '../aws';
import constants from '../constants.json';
import { imageResolversCacheHitCount } from '../helpers/metrics';
import { capture } from '@snapshot-labs/snapshot-sentry';

export function sha256(str: string) {
  return createHash('sha256')
    .update(str)
    .digest('hex');
}

type ParamsType = {
  type: string;
  network: string;
  address: string;
  w: number;
  h: number;
  fallback?: string;
  cb?: string;
};

export default class Cache {
  baseImageCacheKey: string;
  resizedImageCacheKey: string;
  isConfigured: boolean;

  constructor({ type, network, address, w, h, fallback, cb }: ParamsType) {
    const data = { type, network, address, w, h };
    if (fallback !== 'blockie') data['fallback'] = fallback;
    if (cb) data['cb'] = cb;

    const baseImageKey = this._buildKey({ ...data, w: constants.max, h: constants.max });
    const resizedImageKey = this._buildKey(data);

    this.baseImageCacheKey = `${baseImageKey}/${baseImageKey}`;
    this.resizedImageCacheKey = `${baseImageKey}/${resizedImageKey}`;
    this.isConfigured = isConfigured;

    if (!this.isConfigured) {
      console.log('[cache:resolver] Cache is not configured');
    }
  }

  async getBaseImage(): Promise<Readable | boolean> {
    return await this._getCache(this.baseImageCacheKey);
  }

  async getResizedImage(): Promise<Readable | boolean> {
    return await this._getCache(this.resizedImageCacheKey);
  }

  async setBaseImage(value: Buffer) {
    return await this._setCache(this.baseImageCacheKey, value);
  }

  async setResizedImage(value: Buffer) {
    return await this._setCache(this.resizedImageCacheKey, value);
  }

  async clear(): Promise<boolean> {
    if (this.isConfigured) return false;

    try {
      const result = await clearCache(this.baseImageCacheKey);

      console.log(`[cache:resolver] Cached cleared ${this.baseImageCacheKey}`);

      return result;
    } catch (e) {
      console.log(`[cache:resolver] Failed to clear cache ${this.baseImageCacheKey}`);
      capture(e);
      return false;
    }
  }

  private async _getCache(key: string) {
    if (this.isConfigured) return false;

    try {
      console.log(`[cache:resolver] Getting cache ${key}`);
      const cache = await getCache(key);

      imageResolversCacheHitCount.inc({ status: cache ? 'HIT' : 'MISS' }, 1);

      return cache;
    } catch (e) {
      capture(e);
      console.log(`[cache:resolver] Failed to get cache ${key}`);
      return false;
    }
  }

  private async _setCache(key: string, value: Buffer) {
    if (this.isConfigured) return false;

    try {
      console.log(`[cache:resolver] Setting cache ${key}`);
      return await setCache(key, value);
    } catch (e) {
      capture(e);
      console.log(`[cache:resolver] Failed to set cache ${key}`);
    }
  }

  private _buildKey(params: ParamsType): string {
    return sha256(JSON.stringify(params));
  }
}
