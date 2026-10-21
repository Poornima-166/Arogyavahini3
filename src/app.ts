import express, { Express, Request, Response, NextFunction } from 'express';
import { runMigrations } from './db/migrations';
import { checkDatabaseConnection, memoryStore } from './db/pool';
import { authRouter } from './routes/authRoutes';
import { emergencyRouter } from './routes/emergencyRoutes';
import { hospitalRouter } from './routes/hospitalRoutes';
import { adminRouter } from './routes/adminRoutes';
import { trafficRouter } from './routes/trafficRoutes';

export const app: Express = express();

// 1. Universal CORS Middleware to allow client connections from Vercel, local dev, or custom domains
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Vercel Rewrite URL Normalizer:
// When Vercel rewrites /api/(.*) to /api/index, restore the original URI so Express router matches properly
app.use((req: Request, _res: Response, next: NextFunction) => {
  const originalPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-forwarded-url'] as string) ||
    (req.headers['x-vercel-matched-path'] as string);

  if (originalPath && originalPath.startsWith('/api') && (req.url === '/api/index' || req.url === '/api')) {
    req.url = originalPath;
  }
  next();
});

// 3. Defensive JSON Body Parser (supports both Vercel pre-parsed body and standard stream)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    return next();
  }
  express.json()(req, res, next);
});

// -------------------------------------------------------------
// HEALTH & READINESS ENDPOINTS (Render & Cloud Monitoring Ready)
// -------------------------------------------------------------
app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'live',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();
  res.status(dbStatus.connected ? 200 : 503).json({
    status: dbStatus.connected ? 'ready' : 'degraded',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Initialization tracker for database migrations (eager or serverless lazy)
let initialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await runMigrations();
      } catch (err: any) {
        console.warn('[Database Migration Warning]', err.message);
      } finally {
        initialized = true;
      }
    })();
  }
  return initPromise;
}

// Automatically ensure initialization before processing API requests with non-blocking timeout protection
app.use('/api', async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await Promise.race([
      ensureInitialized(),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  } catch (err: any) {
    console.warn('[DB Init Middleware Warning]', err?.message);
  }
  next();
});

// -------------------------------------------------------------
// ROUTE MODULES
// -------------------------------------------------------------

// Module 1: Authentication & User Management
app.use('/api/v1/auth', authRouter);

// Module 2: Emergency & Ambulance Operations
app.use('/api/v1/sos', emergencyRouter);
app.use('/api/v1', emergencyRouter); // Also mounts /api/v1/ambulances, /api/v1/route, etc.

// Module 3: Hospital ER Coordination
app.use('/api/v1/hospitals', hospitalRouter);

// Module 4: Administrative Control & Governance (role-protected)
app.use('/api/v1/admin', adminRouter);

// Module 5: Traffic & Green-Wave Software Advisory
app.use('/api/v1/traffic', trafficRouter);

// General Diagnostic Health Probe
app.get('/api/v1/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    status: 'healthy',
    service: 'ArogyaVahini Smart Ambulance & Hospital Coordination System',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    nodes: {
      ambulances: memoryStore.ambulances.length,
      hospitals: memoryStore.hospitals.length,
      incidents: memoryStore.emergency_incidents.length,
      registeredUsers: memoryStore.users.length,
    },
  });
});

// Catch-all 404 for any unmatched /api requests
app.use('/api', (req: Request, res: Response) => {
  if (!res.headersSent) {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
    });
  }
});

// Global Error Handler for Express
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Express Unhandled Error]', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  }
});

export default app;
