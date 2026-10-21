import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { app, ensureInitialized } from './src/app';
import { initSocketIO } from './src/services/socketService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize Socket.IO real-time engine
  initSocketIO(httpServer);

  // Run database migrations on startup
  await ensureInitialized();

  // -------------------------------------------------------------
  // VITE MIDDLEWARE (DEV) OR STATIC SERVE (PROD)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use((await import('express')).default.static(path.resolve(__dirname, 'dist')));
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
