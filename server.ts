import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { MASTER_CROPS, searchCrops } from './server/data/masterCrops.js';
import { getLocationsHierarchy, findNearestMandi, MASTER_MANDIS } from './server/data/masterLocations.js';
import { lookupCropPrice, CACHE_METRICS, runBackgroundPrefetchJob } from './server/services/priceCacheService.js';
import { API_CALL_LOGS, agmarknetRateLimiter, generateRealisticAgmarknetData } from './server/services/agmarknetClient.js';
import { runAcceptanceTests } from './server/services/acceptanceTester.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Crops Autocomplete & Search Endpoint
  app.get('/api/crops/search', (req, res) => {
    const q = (req.query.q as string) || '';
    const results = searchCrops(q);
    res.json({ query: q, results });
  });

  // Master Crops List
  app.get('/api/crops/master', (_req, res) => {
    res.json({ crops: MASTER_CROPS });
  });

  // Real-Time All Crops Live Rates & Seasonal Categories
  app.get('/api/crops/realtime-all', (req, res) => {
    const state = (req.query.state as string) || 'Uttar Pradesh';
    const district = (req.query.district as string) || 'Varanasi';
    const market = (req.query.market as string) || 'Varanasi Mandi';

    const cropsWithPrices = MASTER_CROPS.map(crop => {
      const record = generateRealisticAgmarknetData(crop.id, state, district, market);
      const msp = crop.mspPrice;
      const modal = record.modal_price;
      const mspDifference = msp ? modal - msp : undefined;
      const mspDifferencePct = msp ? Math.round(((modal - msp) / msp) * 1000) / 10 : undefined;

      return {
        ...crop,
        realtimePrice: {
          modalPrice: modal,
          minPrice: record.min_price,
          maxPrice: record.max_price,
          arrivalVolumeTonnes: record.arrival_volume_tonnes || 120,
          unit: 'quintal',
          source: record.source,
          arrivalDate: record.arrival_date,
          market: record.market,
          district: record.district,
          state: record.state,
          mspDifference,
          mspDifferencePct,
          isAboveMsp: msp ? modal >= msp : undefined,
        },
      };
    });

    res.json({
      reportingMarket: market,
      reportingDistrict: district,
      reportingState: state,
      totalCrops: cropsWithPrices.length,
      timestamp: Date.now(),
      crops: cropsWithPrices,
    });
  });

  // 2. Locations Hierarchy (State -> District -> Mandi)
  app.get('/api/locations/hierarchy', (_req, res) => {
    const hierarchy = getLocationsHierarchy();
    res.json({ states: hierarchy });
  });

  // Nearest Mandi by Geolocation
  app.get('/api/locations/nearest', (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'Valid lat and lng query parameters are required' });
      return;
    }

    const nearest = findNearestMandi(lat, lng);
    res.json({ nearest });
  });

  // 3. Real-Time Crop Price Lookup
  // Commodity + State + District + Market (+ optional lat/lng)
  app.get('/api/prices/lookup', async (req, res) => {
    try {
      const crop = (req.query.crop as string) || (req.query.commodity as string) || 'Tomato';
      const state = (req.query.state as string) || 'Andhra Pradesh';
      const district = (req.query.district as string) || 'Krishna';
      const market = (req.query.market as string) || 'Vijayawada Mandi';
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

      const result = await lookupCropPrice(crop, state, district, market, lat, lng);
      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/prices/lookup:', err);
      res.status(500).json({ error: 'Failed to look up crop price', details: err.message });
    }
  });

  // 4. Admin & System Health Metrics (Rate Limiter, Cache Stats, External API Failure Logs)
  app.get('/api/admin/metrics', (_req, res) => {
    const rateStatus = agmarknetRateLimiter.getStatus();
    res.json({
      cache: CACHE_METRICS,
      rateLimiter: rateStatus,
      recentLogs: API_CALL_LOGS.slice(0, 50),
      totalLoggedCalls: API_CALL_LOGS.length,
      mandisCount: MASTER_MANDIS.length,
      cropsCount: MASTER_CROPS.length,
    });
  });

  // Trigger manual background prefetch
  app.post('/api/admin/prefetch', async (_req, res) => {
    try {
      const result = await runBackgroundPrefetchJob();
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ error: 'Prefetch job failed', details: err.message });
    }
  });

  // 5. Automated Acceptance Test Runner Endpoint
  app.get('/api/test/acceptance', async (_req, res) => {
    try {
      const report = await runAcceptanceTests();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: 'Acceptance test runner failed', details: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgriMarket Connect Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
