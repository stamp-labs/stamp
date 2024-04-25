import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('starknet', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.starknet('test-not-existing.stark');

      expect(result).toBe(false);
    });

    describe('with a simple image', () => {
      it('should resolve with address', async () => {
        const result = await resolvers.starknet(
          '0x00C09F8D8CEfb5f094547f0a8B26c88Ca9fD684B4810F3f14C4ef6602FFa7516'
        );

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(1000);
      });
    });

    describe('with an NFT image', () => {
      it('should resolve with handle', async () => {
        const result = await resolvers.starknet('fricoben.stark');

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(1000);
      });

      it('should resolve with address', async () => {
        const result = await resolvers.starknet(
          '0x072d4f3fa4661228ed0c9872007fc7e12a581e000fad7b8f3e3e5bf9e6133207'
        );

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(1000);
      });
    });
  });
});
