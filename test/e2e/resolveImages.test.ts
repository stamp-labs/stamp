import axios from 'axios';
import {
  HOST,
  UNKNOWN_ID_FORMAT,
  DEFAULT_SIZE,
  FALLBACK_REASONS,
  RANDOM_ETH_ADDRESS,
  RESIZE_SIZE,
  expectImageResponse,
  getImageResponse,
  expectHeader
} from './helpers';

describe('resolving images', () => {
  it('returns a Bad Request response for an invalid type', async () => {
    const makeInvalidRequest = async () => await axios.get(`${HOST}/invalid_type/0x123`);

    expect(makeInvalidRequest()).rejects.toThrowError(/status code 400/);
  });

  describe.each([['avatar'], ['token']])('returns %s image', type => {
    describe('with headers', () => {
      describe('indicating a fallback was used because', () => {
        it('it was the first request ever for this identifier', async () => {
          const response = await getImageResponse(type, RANDOM_ETH_ADDRESS);

          await expectImageResponse(response, DEFAULT_SIZE);
          expectHeader(response, `x-${type}-fallback-reason`, FALLBACK_REASONS.notCached);
        });

        it('the identifier format is unknown', async () => {
          const response = await getImageResponse(type, UNKNOWN_ID_FORMAT);

          await expectImageResponse(response, DEFAULT_SIZE);
          expectHeader(
            response,
            `x-${type}-fallback-reason`,
            FALLBACK_REASONS.unknownIdentifierFormat
          );
        });
        it('no image was found for the identifier', async () => {
          const response = await getImageResponse(type, RANDOM_ETH_ADDRESS);

          await expectImageResponse(response, DEFAULT_SIZE);
          expectHeader(response, `x-${type}-fallback-reason`, FALLBACK_REASONS.noImageFound);
        });
      });
      it('containing timestamp and ttl of the image', async () => {
        const response = await getImageResponse(type, RANDOM_ETH_ADDRESS);

        const timestampStr = response.headers[`x-${type}-timestamp`];
        const ttlStr = response.headers[`x-${type}-ttl`];
        const timestamp = parseInt(timestampStr);
        const ttl = parseInt(ttlStr);

        expect(timestamp).toBeGreaterThan(0);
        expect(ttl).toBeGreaterThan(new Date().getTime());
      });
    });
    it('of custom size', async () => {
      const response = await getImageResponse(type, `${RANDOM_ETH_ADDRESS}?s=${RESIZE_SIZE}`);

      await expectImageResponse(response, RESIZE_SIZE);
    });
  });

  describe('when the image is not cached', () => {
    it.todo('returns the image');
    it.todo('caches the base image');
    it.todo('caches the resized image');
  });

  describe('when the base image is cached, but not the requested size', () => {
    it.todo('resize the image from the cached base image');
    it.todo('caches the resized image');
  });

  describe('when the resized image is cached', () => {
    it.todo('returns the cached resize image');
  });

  it.todo('clears the cache');
});
