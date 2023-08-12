import init from '@snapshot-labs/snapshot-metrics';
import type { Express } from 'express';

export default function initMetrics(app: Express) {
  init(app);
}
