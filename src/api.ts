import express, { NextFunction, Request, Response } from 'express';
import { capture } from '@snapshot-labs/snapshot-sentry';
import {
  parseFallback,
  resize,
  setHeader,
  getCacheKey,
  parseRequestedSize,
  parseIdentifier
} from './utils';
import { set, get, streamToBuffer } from './aws';
import resolvers from './resolvers';
import constants from './constants.json';
import { rpcError, rpcSuccess } from './helpers/utils';
import { lookupAddresses, resolveNames } from './addressResolvers';
import lookupDomains from './lookupDomains';
import { z } from 'zod';

const router = express.Router();

router.post('/v2/lookup/domains', async (req, res) => {
  const { id = null, address, network } = req.body;

  if (!address || !network) return rpcError(res, 400, 'address and network are required', id);

  try {
    const result = await lookupDomains(address, network);
    return rpcSuccess(res, result, id);
  } catch (e) {
    const err = e as any;
    capture(err.error ? new Error(err.error) : err);
    return rpcError(res, 500, e, id);
  }
});

router.post('/v2/lookup/addresses', async (req, res) => {
  const { id = null, params } = req.body;

  if (!Array.isArray(params)) return rpcError(res, 400, 'params must be an array of string', id);

  try {
    const result = await lookupAddresses(params);
    return rpcSuccess(res, result, id);
  } catch (e) {
    const err = e as any;
    capture(err.error ? new Error(err.error) : err);
    return rpcError(res, 500, e, id);
  }
});

router.post('/v2/resolve/names', async (req, res) => {
  const { id = null, params } = req.body;

  if (!Array.isArray(params)) return rpcError(res, 400, 'params must be an array of string', id);

  try {
    const result = await resolveNames(params);
    return rpcSuccess(res, result, id);
  } catch (e) {
    const err = e as any;
    capture(err.error ? new Error(err.error) : err);
    return rpcError(res, 500, e, id);
  }
});

const paramsSchema = z.object({
  identifier: z.string()
});

const querySchema = z.object({
  s: z.string().optional(),
  w: z.string().optional(),
  h: z.string().optional(),
  fallback: z.string().optional()
});

type Params = z.infer<typeof paramsSchema>;
type Query = z.infer<typeof querySchema>;
type AvatarRequest = Request<Params, any, any, Query>;

function validateRequest(req: AvatarRequest, res: Response, next: NextFunction) {
  try {
    paramsSchema.parse(req.params);
    querySchema.parse(req.query);
    next();
  } catch (e) {
    res.status(400).json({ status: 'error', error: 'bad request' });
  }
}

async function processRequest(req: AvatarRequest, res: Response) {
  const type = 'avatar';
  const { identifier } = req.params;

  const { address, network } = parseIdentifier(identifier);
  const { w, h, maxSize } = parseRequestedSize(req.query, type);
  const { fallback } = parseFallback(req.query);

  const requestedImageCacheKey = getCacheKey({ type, network, address, fallback, w, h });

  const cachedRequestedImage = await get(requestedImageCacheKey);
  if (cachedRequestedImage) {
    setHeader(res);
    return cachedRequestedImage.pipe(res);
  }

  const baseImageCacheKey = getCacheKey({
    type,
    network,
    address,
    fallback,
    w: maxSize,
    h: maxSize
  });

  const cachedBasedImage = await get(baseImageCacheKey);
  if (cachedBasedImage) {
    const baseImageBuffer = await streamToBuffer(cachedBasedImage);
    const resizedImage = await resize(baseImageBuffer, w, h);
    await set(requestedImageCacheKey, resizedImage);

    setHeader(res);
    return resizedImage.pipe(res);
  }

  const resolvedImages = await Promise.all(
    constants.resolvers.avatar.map(r => resolvers[r](address, network))
  );
  const newBaseImage = resolvedImages.find(Boolean);
  if (newBaseImage) {
    const resizedImage = await resize(newBaseImage, w, h);
    await set(baseImageCacheKey, newBaseImage);
    await set(requestedImageCacheKey, resizedImage);

    setHeader(res);
    return resizedImage.pipe(res);
  }

  const fallbackImage = await resolvers[fallback](address, network);
  const resizedFallbackImage = await resize(fallbackImage, w, h);

  await set(requestedImageCacheKey, resizedFallbackImage);

  setHeader(res, 'SHORT_CACHE');
  return res.send(resizedFallbackImage);
}

router.get(`/avatar/:identifier`, validateRequest, processRequest);

export default router;
