import express, { Express } from 'express';
import { runMigrations } from './db/migrations';
import { checkDatabaseConnection, memoryStore } from './db/pool';
import { authRouter } from './routes/authRoutes';
import { emergencyRouter } from './routes/emergencyRoutes';
import { hospitalRouter } from './routes/hospitalRoutes';
import { adminRouter } from './routes/adminRoutes';
import { trafficRouter } from './routes/trafficRoutes';

export const app: Express = express();

// Universal CORS Middleware to allow client connections from Vercel, local dev, or custom domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// -------------------------------------------------------------
// HEALTH & READINESS ENDPOINTS (Render & Cloud Monitoring Ready)
// -------------------------------------------------------------
app.get('/health/live', (_req, res) => {
  res.status(200).json({
    status: 'live',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', async (_req, res) => {
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

// Automatically ensure initialization before processing API requests
app.use('/api', async (_req, _res, next) => {
  await ensureInitialized();
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

// Module 3: Administrative Control & Governance (role-protected)
app.use('/api/v1/admin', adminRouter);

// Traffic & Green-Wave Software Advisory
app.use('/api/v1/traffic', trafficRouter);

// General Diagnostic Health Probe
app.get('/api/v1/health', async (_req, res) => {
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

export default app;
