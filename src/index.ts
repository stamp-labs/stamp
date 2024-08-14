import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { initLogger, fallbackLogger } from '@snapshot-labs/snapshot-sentry';
import initMetrics from './helpers/metrics';
import api from './api';
import { name, version } from '../package.json';
import { initTokenLists } from './helpers/tokenlists';

const app = express();
const PORT = process.env.PORT || 3008;

initLogger(app);
initMetrics(app);

app.disable('x-powered-by');
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: false }));
app.use(cors({ maxAge: 86400 }));
app.use(compression());
app.use('/', api);

app.get('/', (_req, res) => {
  const commit = process.env.COMMIT_HASH ?? undefined;
  res.json({ name, version, commit });
});

fallbackLogger(app);

app.use((_, res) => {
  res.status(400).json({ message: 'Not found' });
});

async function boot() {
  await initTokenLists();
}

boot().then(() => {
  app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
});
