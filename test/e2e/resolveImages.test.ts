import axios from 'axios';
import {
  HOST,
  UNKNOWN_AVATAR_ID_FORMAT,
  DEFAULT_SIZE,
  DEFAULT_AVATAR_FALLBACK_TYPE,
  DEFAULT_TOKEN_FALLBACK_TYPE,
  FALLBACK_REASONS,
  RANDOM_ETH_ADDRESS,
  AVATAR_ID,
  RESIZE_SIZE,
  TOKEN_ID,
  expectHeaders,
  expectImageResponse,
  getAvatarResponse,
  getTokenResponse,
  UNKNOWN_TOKEN_ID_FORMAT
} from './helpers';

describe('resolving images', () => {
  it('returns a Bad Request response for an invalid type', async () => {
    const makeInvalidRequest = async () => await axios.get(`${HOST}/invalid_type/0x123`);

    expect(makeInvalidRequest()).rejects.toThrowError(/status code 400/);
  });

  describe('returns an avatar image', () => {
    describe('with headers', () => {
      describe('indicating a fallback was used ', () => {
        it('because of an unknown identifier format', async () => {
          const response = await getAvatarResponse(UNKNOWN_AVATAR_ID_FORMAT);

          await expectImageResponse(response, DEFAULT_SIZE);
          expectHeaders(response, {
            'x-avatar-fallback-type': DEFAULT_AVATAR_FALLBACK_TYPE,
            'x-avatar-fallback-reason': FALLBACK_REASONS.unknownIdentifierFormat
          });
        });
        it('because no image was found', async () => {
          const response = await getAvatarResponse(RANDOM_ETH_ADDRESS);

          await expectImageResponse(response, DEFAULT_SIZE);
          expectHeaders(response, {
            'x-avatar-fallback-type': DEFAULT_AVATAR_FALLBACK_TYPE,
            'x-avatar-fallback-reason': FALLBACK_REASONS.noImageFound
          });
        });
      });
      it.todo('containing timestamp and ttl of the avatar');
    });
    it('of custom size', async () => {
      const response = await getAvatarResponse(`${AVATAR_ID}?s=${RESIZE_SIZE}`);

      await expectImageResponse(response, RESIZE_SIZE);
    });
  });

  describe('returns a token image', () => {
    describe('with headers', () => {
      describe('indicating a fallback was used ', () => {
        it('because of an unknown identifier format', async () => {
          const response = await getTokenResponse(UNKNOWN_TOKEN_ID_FORMAT);

          await expectImageResponse(response, DEFAULT_SIZE);
          expectHeaders(response, {
            'x-token-fallback-type': DEFAULT_TOKEN_FALLBACK_TYPE,
            'x-token-fallback-reason': FALLBACK_REASONS.unknownIdentifierFormat
          });
        });
        it('because no image was found', async () => {
          const response = await getTokenResponse(RANDOM_ETH_ADDRESS);

          await expectImageResponse(response, DEFAULT_SIZE);
          expectHeaders(response, {
            'x-token-fallback-type': DEFAULT_TOKEN_FALLBACK_TYPE,
            'x-token-fallback-reason': FALLBACK_REASONS.noImageFound
          });
        });
      });
      it.todo('containing timestamp and ttl of the token image');
    });
    it('of custom size', async () => {
      const response = await getTokenResponse(`${TOKEN_ID}?s=${RESIZE_SIZE}`);

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
