import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import hpp from 'hpp';
import xss from 'xss-clean';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// Render/Vercel and most PaaS providers sit behind a reverse proxy —
// required for correct client IPs (rate limiting) and secure cookies.
app.set('trust proxy', 1);

// --- Security headers ---
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// --- CORS ---
const allowedOrigins = [env.clientUrl, ...env.clientUrls].filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl, server-to-server, health checks) with no origin.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);

// --- Body parsing ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(env.cookies.secret));

// --- Hardening ---
app.use(hpp());
app.use(xss());
app.use(compression());

// --- Logging ---
if (!env.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// --- Rate limiting (applies to all API routes) ---
app.use(`/api/${env.apiVersion}`, apiLimiter);

// --- Routes ---
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WishCraft API — Create • Share • Celebrate',
    docs: '/api/' + env.apiVersion + '/health',
  });
});

app.use(`/api/${env.apiVersion}`, routes);

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
