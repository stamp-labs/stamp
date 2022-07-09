import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('nft', () => {
    describe('erc721', () => {
      it('should resolve on-chain metadata', async () => {
        const result = await resolvers.nft('0x29b4ea6b1164c7cd8a3a0a1dc4ad88d1e0589124', '6364');

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(500);
      });

      it('should resolve IPFS metadata', async () => {
        const result = await resolvers.nft('0x7f8162f4ffe3db46cd3b0626dab699506c0ff63a', '6386');

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(500);
      });
    });

    describe('erc1155', () => {
      it('should resolve IPFS metadata', async () => {
        const result = await resolvers.nft('0x3b1417c1f204607deda4767929497256e4ff540c', '1');

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(500);
      });

      it.skip('should resolve OpeanSea metadata', async () => {
        // TODO: for some reason URL for metadata returns 404 every time
        // -> https://api.opensea.io/api/v1/metadata/0x495f947276749Ce646f68AC8c248420045cb7b5e/0x{id}
        // -> https://api.opensea.io/api/v1/metadata/0x495f947276749Ce646f68AC8c248420045cb7b5e/0x9dbe56e659611800000000000000000000000000000000000000000000000000
        //
        // 9dbe56e659611800000000000000000000000000000000000000000000000000 is hex from 71349417930267003648058267821921373972951788320258492784107927381794011217921

        const result = await resolvers.nft(
          '0x495f947276749Ce646f68AC8c248420045cb7b5e',
          '71349417930267003648058267821921373972951788320258492784107927381794011217921'
        );

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(500);
      });
    });
  });
});
