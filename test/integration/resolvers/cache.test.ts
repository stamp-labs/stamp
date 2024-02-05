import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import Cache from '../../../src/resolvers/cache';
import { parseQuery } from '../../../src/utils';
import { set, streamToBuffer } from '../../../src/aws';
import constants from '../../../src/constants.json';

const image_buffer = fs.readFileSync(path.join(__dirname, '../../fixtures/sample.webp'));

describe('image resolver cache', () => {
  let cache: Cache;

  describe('getBaseImage()', () => {
    afterEach(async () => {
      await cache.clear();
    });

    describe('when the image is cached', () => {
      it('should return the cached image', async () => {
        const parsedQuery = await parseQuery('0x0-test-getbaseimage', 'avatar', {});
        cache = new Cache(parsedQuery);

        await set(cache.baseImageCacheKey, image_buffer);
        const result = await cache.getBaseImage();
        return expect(streamToBuffer(result as Readable)).resolves.toEqual(image_buffer);
      });
    });

    describe('when the image is not cached', () => {
      it('should return false', async () => {
        const parsedQuery = await parseQuery('0x1-test-getbaseimage', 'avatar', {});
        cache = new Cache(parsedQuery);

        return expect(cache.getBaseImage()).resolves.toBe(false);
      });
    });
  });

  describe('getResizedImage()', () => {
    afterEach(async () => {
      await cache.clear();
    });

    describe('when the image is cached', () => {
      it('should return the cached image', async () => {
        const parsedQuery = await parseQuery('0x0-test-getresizedimage', 'avatar', {});
        cache = new Cache(parsedQuery);

        await set(cache.resizedImageCacheKey, image_buffer);
        const result = await cache.getResizedImage();
        return expect(streamToBuffer(result as Readable)).resolves.toEqual(image_buffer);
      });
    });

    describe('when the image is not cached', () => {
      it('should return false', async () => {
        const parsedQuery = await parseQuery('0x1-test-getresizedimage', 'avatar', {});
        cache = new Cache(parsedQuery);

        return expect(cache.getResizedImage()).resolves.toBe(false);
      });
    });
  });

  describe('setBaseImage', () => {
    it('should save the image in the cache', async () => {
      const parsedQuery = await parseQuery('0x0-set-base-image', 'avatar', {});
      cache = new Cache(parsedQuery);

      return expect(cache.setBaseImage(image_buffer)).resolves.toEqual(
        expect.objectContaining({
          $metadata: expect.objectContaining({ httpStatusCode: 200 })
        })
      );
    });
  });

  describe('setResizedImage()', () => {
    it('should save the image in the cache', async () => {
      const parsedQuery = await parseQuery('0x0-set-resized-image', 'avatar', {});
      cache = new Cache(parsedQuery);

      return expect(cache.setResizedImage(image_buffer)).resolves.toEqual(
        expect.objectContaining({
          $metadata: expect.objectContaining({ httpStatusCode: 200 })
        })
      );
    });
  });

  describe('clear()', () => {
    describe('when the cache exist', () => {
      it('should clear the cache', async () => {
        const parsedQuery = await parseQuery('0x0-clear-exist', 'avatar', {
          s: constants.max,
          fb: 'fb-0',
          cb: 'cb-0'
        });
        cache = new Cache(parsedQuery);
        await cache.setBaseImage(image_buffer);

        expect(cache.clear()).resolves.toBe(true);
        expect(cache.getBaseImage()).resolves.toBe(false);
        expect(cache.getResizedImage()).resolves.toBe(false);
      });
    });

    describe('when the cache does not exist', () => {
      it('should return false', async () => {
        const parsedQuery = await parseQuery('0x0-clear-not-exist', 'avatar', {
          s: constants.max,
          fb: 'fb-1',
          cb: 'cb-1'
        });
        cache = new Cache(parsedQuery);
        return expect(cache.clear()).resolves.toBe(false);
      });
    });
  });
});
