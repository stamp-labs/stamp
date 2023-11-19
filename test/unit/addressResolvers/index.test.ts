import { lookupAddresses } from '../../../src/addressResolvers';
import { getCache, setCache } from '../../../src/addressResolvers/cache';
import redis from '../../../src/helpers/redis';

describe('addressResolvers', () => {
  afterAll(async () => {
    await redis.quit();
  });

  describe('lookupAddresses()', () => {
    describe('when passing more than 250 addresses', () => {
      it('rejects with an error', () => {
        const params = Array(251);

        expect(lookupAddresses(params)).rejects.toEqual({
          error: 'params must contains less than 250 addresses',
          code: 400
        });
      });
    });

    describe('when the params contains invalid address', () => {
      it('rejects with an error', () => {
        expect(lookupAddresses(['test'])).rejects.toEqual({
          error: 'params contains invalid address',
          code: 400
        });
      });
    });

    describe('when not cached', () => {
      beforeEach(async () => {
        await redis.flushDb();
      });

      it('should return the ENS handle first if associated to multiple resolvers', () => {
        return expect(
          lookupAddresses(['0xeF8305E140ac520225DAf050e2f71d5fBcC543e7'])
        ).resolves.toEqual({
          '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7': 'fabien.eth'
        });
      }, 10e3);

      it('does not return addresses without domain', () => {
        return expect(
          lookupAddresses([
            '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7',
            '0x0C67A201b93cf58D4a5e8D4E970093f0FB4bb0D1'
          ])
        ).resolves.toEqual({
          '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7': 'fabien.eth'
        });
      }, 10e3);
    });

    describe('when cached', () => {
      beforeEach(async () => {
        await redis.flushDb();
      });

      it('should cache the results', async () => {
        await expect(
          lookupAddresses([
            '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7',
            '0x0C67A201b93cf58D4a5e8D4E970093f0FB4bb0D1'
          ])
        ).resolves.toEqual({
          '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7': 'fabien.eth'
        });

        return expect(
          getCache([
            '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7',
            '0x0C67A201b93cf58D4a5e8D4E970093f0FB4bb0D1'
          ])
        ).resolves.toEqual({
          '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7': 'fabien.eth',
          '0x0C67A201b93cf58D4a5e8D4E970093f0FB4bb0D1': ''
        });
      });

      it('should return the cached results', async () => {
        await setCache({ '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7': 'test.eth' });

        return expect(
          lookupAddresses(['0xeF8305E140ac520225DAf050e2f71d5fBcC543e7'])
        ).resolves.toEqual({
          '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7': 'test.eth'
        });
      });
    });
  });
});
