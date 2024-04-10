import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('farcaster', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.farcaster('0x0000000000000000000000000000000000000000');

      expect(result).toBe(false);
    });

    it('should resolve with address', async () => {
      const result = await resolvers.farcaster('0x09CEdb7bb69f9F6DF646dBa107D2bAACda93D6C9')

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
