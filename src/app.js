import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes        from './routes/auth.routes.js';
import userRoutes        from './routes/user.routes.js';
import startupRoutes     from './routes/startup.routes.js';
import opportunityRoutes from './routes/opportunity.routes.js';
import applicationRoutes from './routes/application.routes.js';
import paymentRoutes     from './routes/payment.routes.js';
import adminRoutes       from './routes/admin.routes.js';

const app = express();

/* ── Core middleware ── */
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin:      (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)),
  credentials: true,
}));

// Stripe webhook needs the raw body for signature verification — must be
// registered before express.json() and only for that one route.
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize()); // strip $-prefixed / dotted keys from body, query, params

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

/* ── Health check ── */
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/* ── API routes ── */
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/startups',     startupRoutes);
app.use('/api/opportunities',opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payment',      paymentRoutes);
app.use('/api/admin',        adminRoutes);

/* ── 404 handler ── */
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

/* ── Global error handler ── */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.message ?? 'Internal server error' });
});

export default app;
