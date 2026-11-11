/**
 * Health Check Endpoint
 * Verifies system status, SGT time, and LTA AccountKey availability in process.env.
 * No keys are hardcoded.
 */

import type { Request, Response } from 'express';

export default function handleHealth(_req: Request, res: Response) {
  const sgtDate = new Date(Date.now() + 8 * 3600 * 1000);
  const hasAccountKey = Boolean(
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY
  );

  return res.json({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    serverTimeSGT: sgtDate.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    ltaIntegration: {
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      hasAccountKeyConfigured: hasAccountKey,
      agencies: ['HDB', 'LTA', 'URA'],
      note: hasAccountKey
        ? 'AccountKey detected in process.env'
        : 'AccountKey not yet provided in process.env. Inject LTA_DATAMALL_KEY or pass AccountKey header.',
    },
    registeredEndpoints: [
      '/api/carparkavailability',
      '/api/health',
      '/api/feed',
      '/api/bus',
    ],
  });
}
