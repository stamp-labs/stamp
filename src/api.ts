import express from 'express';
import { parseQuery, resize, sha256 } from './utils';
import { set, get, streamToBuffer, remove } from './aws';
import resolvers from './resolvers';
import constants from './constants.json';

const router = express.Router();

router.delete('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const { address, network, w, h } = await parseQuery(id, { s: constants.max });
    const baseImageFolder = sha256(JSON.stringify({ type, network, address, w, h }));
    remove(baseImageFolder);

    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:type/:id', async (req, res) => {
  // Generate keys
  const { type, id } = req.params;
  const { address, network, w, h } = await parseQuery(id, req.query);

  const baseImageKey = sha256(
    JSON.stringify({ type, network, address, w: constants.max, h: constants.max })
  );
  const resizedImageKey = sha256(JSON.stringify({ type, network, address, w, h }));
  let currentResolvers = constants.resolvers.avatar;
  if (type === 'token') currentResolvers = constants.resolvers.token;

  // Check cache
  const resizedImageCache = await get(resizedImageKey, baseImageKey);
  if (resizedImageCache) {
    console.log('Got cache', address);
    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': `public, max-age=${constants.ttl}`,
      Expires: new Date(Date.now() + constants.ttl * 1e3).toUTCString()
    });
    return resizedImageCache.pipe(res);
  }

  const baseImageCache = await get(baseImageKey, baseImageKey);
  let baseImage;
  if (baseImageCache) {
    baseImage = await streamToBuffer(baseImageCache);
    console.log('Got base cache');
  } else {
    console.log('No cache for', baseImageKey, baseImageCache);
    const p = currentResolvers.map(r => resolvers[r](address, network));
    const resolvedImages = await Promise.all(p);
    resolvedImages.forEach(file => {
      if (file) baseImage = file;
    });
  }

  // Resize and return image
  const resizedImage = await resize(baseImage, w, h);
  res.set({
    'Content-Type': 'image/webp',
    'Cache-Control': `public, max-age=${constants.ttl}`,
    Expires: new Date(Date.now() + constants.ttl * 1e3).toUTCString()
  });
  res.send(resizedImage);

  // Store cache
  try {
    if (!baseImageCache) {
      await set(baseImageKey, baseImage, baseImageKey);
      console.log('Stored base cache', baseImageKey);
    }
    await set(resizedImageKey, resizedImage, baseImageKey);
    console.log('Stored cache', address);
  } catch (e) {
    console.log('Store cache failed', address, e);
  }
});

router.get('/*', async (req, res) => {
  res.redirect('https://github.com/snapshot-labs/stamp');
});

export default router;
