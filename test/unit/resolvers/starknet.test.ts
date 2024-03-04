import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('starknet', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.starknet('test-checkpoint.stark');

      expect(result).toBe(false);
    }, 10e3);

    it('should resolve a domain', async () => {
      const result = await resolvers.starknet('fricoben.stark');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    }, 10e3);

    it('should resolve an address', async () => {
      const result = await resolvers.starknet(
        '0x061b6c0a78f9edf13cea17b50719f3344533fadd470b8cb29c2b4318014f52d3'
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    }, 10e3);
  });
});
