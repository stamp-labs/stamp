import axios from 'axios';
import fetch from 'node-fetch';
import redis from '../../src/helpers/redis';
import { KEY_PREFIX } from '../../src/addressResolvers/cache';

const HOST = `http://localhost:${process.env.PORT || 3003}`;

async function purge(): Promise<void> {
  if (!redis) return;

  const keys = await redis.keys(`${KEY_PREFIX}:*`);
  const transaction = redis.multi();

  keys.map((key: string) => transaction.del(key));
  transaction.exec();
}

async function imageToBase64(url: string) {
  const response = await fetch(url);
  const buffer = await response.buffer();

  return buffer.toString('base64');
}

describe('E2E api', () => {
  describe('GET type/TYPE/ID', () => {
    it.todo('returns a 500 status on invalid query');

    describe('when the image is not cached', () => {
      it.todo('returns the image');
      it.todo('caches the base image');
      it.todo('caches the resized image');

      it('returns same space avatar for snapshot legacy and non-legacy format', async () => {
        expect(await imageToBase64(`${HOST}/space/ens.eth`)).toEqual(
          await imageToBase64(`${HOST}/space/s:ens.eth`)
        );
        expect(
          await imageToBase64(
            `${HOST}/space/sn:0x07c251045154318a2376a3bb65be47d3c90df1740d8e35c9b9d943aa3f240e50`
          )
        ).toEqual(
          await imageToBase64(
            `${HOST}/space-sx/0x07c251045154318a2376a3bb65be47d3c90df1740d8e35c9b9d943aa3f240e50`
          )
        );
      });

      it('returns different space avatar for different network', async () => {
        expect(await imageToBase64(`${HOST}/space/s:ens.eth`)).not.toEqual(
          await imageToBase64(`${HOST}/space/s-tn:ens.eth`)
        );
      });

      it('returns same space cover for snapshot legacy and non-legacy format', async () => {
        expect(await imageToBase64(`${HOST}/space-cover/test.wa0x6e.eth`)).toEqual(
          await imageToBase64(`${HOST}/space-cover/s:test.wa0x6e.eth`)
        );
        expect(
          await imageToBase64(
            `${HOST}/space-cover/sn:0x07c251045154318a2376a3bb65be47d3c90df1740d8e35c9b9d943aa3f240e50`
          )
        ).toEqual(
          await imageToBase64(
            `${HOST}/space-cover-sx/0x07c251045154318a2376a3bb65be47d3c90df1740d8e35c9b9d943aa3f240e50`
          )
        );
      });

      it('returns different space cover for different network', async () => {
        expect(await imageToBase64(`${HOST}/space-cover/s:test.wa0x6e.eth`)).not.toEqual(
          await imageToBase64(`${HOST}/space-cover/s-tn:test.wa0x6e.eth`)
        );
      });
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

  describe('POST /', () => {
    afterEach(async () => {
      await purge();
    });

    describe('when passing invalid method', () => {
      it.todo('returns an error');
    });

    describe('when method is missing', () => {
      it.todo('returns an error');
    });

    describe('on lookup_addresses', () => {
      function fetchLookupAddresses(params: any) {
        return axios({
          url: HOST,
          method: 'POST',
          responseType: 'json',
          data: { method: 'lookup_addresses', params }
        });
      }

      describe('when not passing an array as params', () => {
        const tests = [
          ['a string', 'a simple string'],
          ['an object', { a: 'b' }],
          ['a number', 123],
          ['null', null],
          ['undefined', undefined],
          ['a boolean', true]
        ];
        // @ts-ignore
        it.each(tests)('returns an error when passing %s', async (title: string, params: any) => {
          expect(fetchLookupAddresses(params)).rejects.toThrowError(/status code 400/);
        });
      });

      describe('when passing EVM addresses', () => {
        it('returns only addresses with associated domains', async () => {
          const response = await fetchLookupAddresses([
            '0xE6D0Dd18C6C3a9Af8C2FaB57d6e6A38E29d513cC',
            '0xe6d0dd18c6c3a9af8c2fab57d6e6a38e29d513cc',
            '0x0C67A201b93cf58D4a5e8D4E970093f0FB4bb0D1'
          ]);

          expect(response.status).toBe(200);
          expect(response.data.result).toEqual({
            '0xE6D0Dd18C6C3a9Af8C2FaB57d6e6A38E29d513cC': 'sdntestens.eth',
            '0xe6d0dd18c6c3a9af8c2fab57d6e6a38e29d513cc': 'sdntestens.eth'
          });
        });
      });

      describe('when passing non-EVM addresses', () => {
        it('returns only addresses with associated domains', async () => {
          const response = await fetchLookupAddresses([
            '0x07FF6B17F07C4D83236E3FC5F94259A19D1ED41BBCF1822397EA17882E9B038D',
            '0x07ff6b17f07c4d83236e3fc5f94259a19d1ed41bbcf1822397ea17882e9b038d',
            '0x040f81578c2ab498c1252fdebdf1ed5dc083906dc7b9e3552c362db1c7c23a02'
          ]);

          expect(response.status).toBe(200);
          expect(response.data.result).toEqual({
            '0x07FF6B17F07C4D83236E3FC5F94259A19D1ED41BBCF1822397EA17882E9B038D': 'Checkpoint',
            '0x07ff6b17f07c4d83236e3fc5f94259a19d1ed41bbcf1822397ea17882e9b038d': 'Checkpoint'
          });
        });
      });

      describe('when passing a mix of EVM and non-EVM addresses', () => {
        it('returns only addresses with associated domains', async () => {
          const response = await fetchLookupAddresses([
            '0x07FF6B17F07C4D83236E3FC5F94259A19D1ED41BBCF1822397EA17882E9B038D',
            '0x07ff6b17f07c4d83236e3fc5f94259a19d1ed41bbcf1822397ea17882e9b038d',
            '0x040f81578c2ab498c1252fdebdf1ed5dc083906dc7b9e3552c362db1c7c23a02',
            '0xE6D0Dd18C6C3a9Af8C2FaB57d6e6A38E29d513cC',
            '0xe6d0dd18c6c3a9af8c2fab57d6e6a38e29d513cc'
          ]);

          expect(response.status).toBe(200);
          expect(response.data.result).toEqual({
            '0x07FF6B17F07C4D83236E3FC5F94259A19D1ED41BBCF1822397EA17882E9B038D': 'Checkpoint',
            '0x07ff6b17f07c4d83236e3fc5f94259a19d1ed41bbcf1822397ea17882e9b038d': 'Checkpoint',
            '0xE6D0Dd18C6C3a9Af8C2FaB57d6e6A38E29d513cC': 'sdntestens.eth',
            '0xe6d0dd18c6c3a9af8c2fab57d6e6a38e29d513cc': 'sdntestens.eth'
          });
        });
      });
    });
  });
});
