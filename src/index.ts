// restart trigger: ensure .env changes are reloaded by ts-node-dev
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = Number(process.env.PORT) || 3000;

(async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 API listening on http://localhost:${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received, closing HTTP server`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
})().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});