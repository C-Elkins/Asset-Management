#!/usr/bin/env node
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 4173);

// Accept primitive JSON bodies like `null` for endpoints that don't send a payload (e.g., /auth/refresh)
app.use(express.json({ strict: false }));

// Simple in-memory user
const demoUser = {
  id: "1",
  username: "admin",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  role: "SUPER_ADMIN",
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// API mock under /api
const api = express.Router();

// Apply a conservative rate limiter ONLY to API routes, not to static assets
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // generous to avoid test flakiness
  standardHeaders: true,
  legacyHeaders: false,
});
api.use(apiLimiter);

api.get("/actuator/health", (_req, res) => {
  res.json({ status: "UP" });
});

api.post("/auth/login", (req, res) => {
  const { username, email, password } = req.body || {};
  const userField = username || email;
  // Accept common demo creds used in tests
  const isAdmin = userField === "admin" && password === "admin123";
  const isDevUser =
    userField === "user@devorg.com" && password === "DevUser123!";
  if (isAdmin || isDevUser) {
    return res.json({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: demoUser,
      expiresIn: 15 * 60,
    });
  }
  return res.status(401).json({ message: "Invalid username or password." });
});

api.post("/auth/refresh", (req, res) => {
  const refresh = req.get("X-Refresh-Token");
  if (!refresh)
    return res.status(401).json({ message: "Missing refresh token" });
  return res.json({
    accessToken: "mock-access-token-refreshed",
    refreshToken: "mock-refresh-token-rotated",
    user: demoUser,
    expiresIn: 15 * 60,
  });
});

api.get("/auth/me", (req, res) => {
  const auth = req.get("Authorization") || "";
  if (!auth.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });
  return res.json(demoUser);
});

// Mount API under both /api and /api/v1 to satisfy different test expectations
app.use("/api", api);
app.use("/api/v1", api);

// Static frontend from dist
const distDir = path.resolve(__dirname, "../dist");
if (!fs.existsSync(distDir)) {
  console.error("ERROR: dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

// Serve static frontend without rate limiting to prevent 429s from many asset requests in E2E
app.use(express.static(distDir));
// SPA fallback for any non-API GET route
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`E2E server listening on http://localhost:${port}`);
});
