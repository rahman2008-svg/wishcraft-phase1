import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

let server;

const start = async () => {
  try {
    await connectDatabase();

    server = app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(
        `[server] WishCraft API running in ${env.nodeEnv} mode on port ${env.port}\n` +
          `[server] Health check: http://localhost:${env.port}/api/${env.apiVersion}/health`
      );
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n[server] Received ${signal}, shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      // eslint-disable-next-line no-console
      console.log('[server] Closed all connections. Goodbye!');
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }

  // Force-exit if shutdown hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('[server] Unhandled promise rejection:', reason);
});

start();
