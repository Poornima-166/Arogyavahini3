import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './src/db/migrations';
import { checkDatabaseConnection, memoryStore } from './src/db/pool';
import { authRouter } from './src/routes/authRoutes';
import { emergencyRouter } from './src/routes/emergencyRoutes';
import { hospitalRouter } from './src/routes/hospitalRoutes';
import { adminRouter } from './src/routes/adminRoutes';
import { trafficRouter } from './src/routes/trafficRoutes';
import { initSocketIO } from './src/services/socketService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Socket.IO real-time engine
  initSocketIO(httpServer);

  // -------------------------------------------------------------
  // HEALTH & READINESS ENDPOINTS (Render Deployment Ready)
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

  // Run database migrations and seed initial data
  await runMigrations();

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

  // General Health & Operational Diagnostic Probe
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

  // -------------------------------------------------------------
  // VITE MIDDLEWARE (DEV) OR STATIC SERVE (PROD)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[ArogyaVahini] Full-Stack Backend & Socket.IO running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
