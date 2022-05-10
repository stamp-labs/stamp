import express from 'express';
import { parseQuery, resize, setHeader, sha256 } from './utils';
import { set, get, streamToBuffer, clear } from './aws';
import resolvers from './resolvers';
import constants from './constants.json';

const router = express.Router();

router.get('/clear/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    const { address, network, w, h } = await parseQuery(id, { s: constants.max });
    const key = sha256(JSON.stringify({ type, network, address, w, h }));
    await clear(key);
    res.status(200).json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e });
  }
});

router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { address, network, w, h } = await parseQuery(id, req.query);
  const key1 = sha256(
    JSON.stringify({ type, network, address, w: constants.max, h: constants.max })
  );
  const key2 = sha256(JSON.stringify({ type, network, address, w, h }));
  let currentResolvers = constants.resolvers.avatar;
  if (type === 'token') currentResolvers = constants.resolvers.token;

  // Check resized cache
  const cache = await get(`${key1}/${key2}`);
  if (cache) {
    console.log('Got cache', address);
    setHeader(res);
    return cache.pipe(res);
  }

  // Check base cache
  const base = await get(`${key1}/${key1}`);
  let file1;
  if (base) {
    file1 = await streamToBuffer(base);
    console.log('Got base cache');
  } else {
    console.log('No cache for', key1, base);
    const p = currentResolvers.map(r => resolvers[r](address, network));
    const files = await Promise.all(p);
    files.forEach(file => {
      if (file) file1 = file;
    });
  }

  // Resize and return image
  const file2 = await resize(file1, w, h);
  setHeader(res);
  res.send(file2);

  // Store cache
  try {
    if (!base) {
      await set(`${key1}/${key1}`, file1);
      console.log('Stored base cache', key1);
    }
    await set(`${key2}/${key1}`, file2);
    console.log('Stored cache', address);
  } catch (e) {
    console.log('Store cache failed', address, e);
  }
});

router.get('/*', async (req, res) => {
  res.redirect('https://github.com/snapshot-labs/stamp');
});

export default router;
