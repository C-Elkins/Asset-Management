#!/usr/bin/env node
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 4173);

// Accept primitive JSON bodies like `null` for endpoints that don't send a payload (e.g., /auth/refresh)
app.use(express.json({ strict: false }));

// Simple in-memory user
const demoUser = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'SUPER_ADMIN',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// API mock under /api
const api = express.Router();

api.get('/actuator/health', (_req, res) => {
  res.json({ status: 'UP' });
});

api.post('/auth/login', (req, res) => {
  const { username, email, password } = req.body || {};
  const userField = username || email;
  // Accept common demo creds used in tests
  const isAdmin = userField === 'admin' && password === 'admin123';
  const isDevUser = userField === 'user@devorg.com' && password === 'DevUser123!';
  if (isAdmin || isDevUser) {
    return res.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: demoUser,
      expiresIn: 15 * 60,
    });
  }
  return res.status(401).json({ message: 'Invalid username or password.' });
});

api.post('/auth/refresh', (req, res) => {
  const refresh = req.get('X-Refresh-Token');
  if (!refresh) return res.status(401).json({ message: 'Missing refresh token' });
  return res.json({
    accessToken: 'mock-access-token-refreshed',
    refreshToken: 'mock-refresh-token-rotated',
    user: demoUser,
    expiresIn: 15 * 60,
  });
});

api.get('/auth/me', (req, res) => {
  const auth = req.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  return res.json(demoUser);
});

// Mount API under both /api and /api/v1 to satisfy different test expectations
app.use('/api', api);
app.use('/api/v1', api);

// Static frontend from dist
const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  console.error('ERROR: dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

// Rate limiter: max 100 requests per 15 minutes per IP
const frontendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(frontendLimiter, express.static(distDir));
// SPA fallback for any non-API GET route
app.use(frontendLimiter, (req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`E2E server listening on http://localhost:${port}`);
});
