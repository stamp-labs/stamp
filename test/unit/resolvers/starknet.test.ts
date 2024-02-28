import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('starknet', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.starknet('test-checkpoint.stark');

      expect(result).toBe(false);
    }, 10e3);

    it('should resolve a domain', async () => {
      const result = await resolvers.starknet('checkpoint.stark');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    }, 10e3);

    it('should resolve an address', async () => {
      const result = await resolvers.starknet(
        '0x07FF6B17f07c4d83236E3Fc5f94259A19D1Ed41bBCf1822397EA17882E9b038d'
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    }, 10e3);
  });
});
