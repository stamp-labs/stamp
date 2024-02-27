import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('crossbell', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.crossbell('0x703348443C25C6AFd59b1A167E20B22C10836C4C');

      expect(result).toBe(false);
    });

    it('should resolve with handle', async () => {
      const result = await resolvers.crossbell('crossbell');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });

    it('should resolve with address', async () => {
      const result = await resolvers.crossbell('0xc560eb6fd0c2eb80Df50E5e06715295AE1205049');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
