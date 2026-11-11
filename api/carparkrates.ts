/**
 * Data.gov.sg Carpark Pricing API Integration
 * Resource ID: d_9f6056bdb6b1dfba57f063593e4f34ae
 * Endpoint: https://data.gov.sg/api/action/datastore_search?resource_id=d_9f6056bdb6b1dfba57f063593e4f34ae
 *
 * Pulls official Singapore government carpark tariff schedules.
 * Public open data endpoint - no hardcoded secret keys required.
 */

import type { Request, Response } from 'express';

export interface DataGovCarparkRateRecord {
  _id: number;
  carpark: string;
  category: string;
  weekdays_rate_1: string;
  weekdays_rate_2: string;
  saturday_rate: string;
  sunday_publicholiday_rate: string;
}

// In-memory cache
let cachedRecords: DataGovCarparkRateRecord[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

export async function fetchDataGovCarparkRates(searchQuery?: string): Promise<DataGovCarparkRateRecord[]> {
  const now = Date.now();
  if (!cachedRecords || now - lastCacheTime > CACHE_TTL_MS) {
    try {
      const url = 'https://data.gov.sg/api/action/datastore_search?resource_id=d_9f6056bdb6b1dfba57f063593e4f34ae&limit=400';
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (response.ok) {
        const json = await response.json();
        if (json?.success && Array.isArray(json?.result?.records)) {
          cachedRecords = json.result.records;
          lastCacheTime = now;
        }
      }
    } catch (err) {
      console.error('Failed to fetch from data.gov.sg dataset:', err);
    }
  }

  const records = cachedRecords || [];
  if (!searchQuery) return records;

  const q = searchQuery.toLowerCase().trim();
  return records.filter((r) => r.carpark.toLowerCase().includes(q));
}

// Relevant Civic District & SMU surrounding carparks mapping
export const CIVIC_CARPARK_RATE_ALIASES: Record<string, string[]> = {
  'bras-basah-complex': ['Bras Basah Complex'],
  'plaza-singapura': ['Plaza Singapura', 'Atrium @ Orchard'],
  'raffles-city': ['Raffles City'],
  'sunshine-plaza': ['Sunshine Plaza'],
  'funan': ['Funan DigitaLife Mall', 'Funan'],
  'rendezvous-hotel': ['Rendezvous Hotel'],
  'national-museum': ['National Museum of Singapore'],
  'smu-campus': ['Singapore Management University', 'SMU'],
};

export default async function handleCarparkRates(req: Request, res: Response) {
  const q = (req.query.q as string) || '';
  const datasetId = 'd_9f6056bdb6b1dfba57f063593e4f34ae';

  const allRecords = await fetchDataGovCarparkRates();
  const filtered = q
    ? allRecords.filter((r) => r.carpark.toLowerCase().includes(q.toLowerCase()))
    : allRecords;

  // Map to SMU area carparks
  const matchedSmuRates: Record<string, DataGovCarparkRateRecord | null> = {};
  for (const [id, aliases] of Object.entries(CIVIC_CARPARK_RATE_ALIASES)) {
    const match = allRecords.find((r) =>
      aliases.some((alias) => r.carpark.toLowerCase().includes(alias.toLowerCase()))
    );
    matchedSmuRates[id] = match || null;
  }

  return res.json({
    success: true,
    source: 'data.gov.sg',
    datasetId,
    endpointUrl: `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}`,
    totalRecords: allRecords.length,
    matchingRecords: filtered.length,
    matchedSmuRates,
    records: filtered.slice(0, 50),
  });
}
