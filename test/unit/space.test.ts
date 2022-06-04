import resolvers from '../../src/resolvers';

describe('resolvers', () => {
  describe('space', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.space('idonthaveensdomain.eth');

      expect(result).toBe(false);
    });

    it('should resolve', async () => {
      const result = await resolvers.space('ens.eth');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
