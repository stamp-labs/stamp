import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('starknet', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.starknet('test-checkpoint.stark');

      expect(result).toBe(false);
    });

    it('should resolve', async () => {
      const result = await resolvers.starknet('checkpoint.stark');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
