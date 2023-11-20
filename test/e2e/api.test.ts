describe('E2E api', () => {
  describe('GET type/TYPE/ID', () => {
    it.todo('returns a 500 status on invalid query');

    describe('when the image is not cached', () => {
      it.todo('returns the image');
      it.todo('caches the base image');
      it.todo('caches the resized image');
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
    describe('when passing invalid method', () => {
      it.todo('returns an error');
    });

    describe('when method is missing', () => {
      it.todo('returns an error');
    });

    describe('on lookup_addresses', () => {
      describe('when not passing an array as params', () => {
        it.todo('returns an error');
      });
    });
  });
});
