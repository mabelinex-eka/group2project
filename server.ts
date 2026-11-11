import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// Import root api endpoints
import handleFeed from './api/feed.js';
import handleBus from './api/bus.js';
import handleCarparkAvailability from './api/carparkavailability.ts';
import handleHealth from './api/health.ts';
import handleCarparkRates from './api/carparkrates.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Register API routes
app.get('/api/carparkrates', handleCarparkRates);
app.get('/carparkrates', handleCarparkRates);
app.get('/api/carparkavailability', handleCarparkAvailability);
app.get('/carparkavailability', handleCarparkAvailability);
app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Existing endpoints
app.get('/api/feed', handleFeed);
app.get('/api/bus', handleBus);
app.get('/api/carparks', handleFeed);

// Health & Environment status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  const sgtNow = new Date(Date.now() + 8 * 3600 * 1000);
  res.json({
    status: 'ok',
    serverTimeSGT: sgtNow.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
    hasLtaKey: Boolean(
      process.env.LTA_DATAMALL_KEY ||
      process.env.LTA_ACCOUNT_KEY ||
      process.env.ACCOUNT_KEY
    ),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    version: '1.0.0',
  });
});

// Setup Vite dev server or static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
