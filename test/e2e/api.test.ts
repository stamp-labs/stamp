describe('E2E api', () => {
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
