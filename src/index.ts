import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import api from './api';
import { initLogger, fallbackLogger } from '@snapshot-labs/snapshot-sentry';

const app = express();
const PORT = process.env.PORT || 3000;

initLogger(app);

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: false }));

app.use(cors({ maxAge: 86400 }));
app.use(compression());
app.use('/', api);

fallbackLogger(app);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
