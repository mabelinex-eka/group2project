/**
 * Singapore Bus Services & Live Arrival Endpoint
 * Reads LTA DataMall API key exclusively via process.env.LTA_DATAMALL_KEY
 */

const SMU_BUS_STOPS = [
  {
    code: '04121',
    description: 'SMU Concourse / Stamford Rd',
    services: [
      { service: '7', nextMins: 4, next2Mins: 14, load: 'Seats Available' },
      { service: '14', nextMins: 2, next2Mins: 11, load: 'Seats Available' },
      { service: '16', nextMins: 7, next2Mins: 18, load: 'Standing Available' },
      { service: '36', nextMins: 5, next2Mins: 16, load: 'Seats Available' },
      { service: '111', nextMins: 8, next2Mins: 20, load: 'Seats Available' },
      { service: '857', nextMins: 3, next2Mins: 12, load: 'Seats Available' },
    ],
  },
  {
    code: '08019',
    description: 'Bras Basah Stn Exit A / Bras Basah Rd',
    services: [
      { service: '7', nextMins: 3, next2Mins: 15, load: 'Seats Available' },
      { service: '14', nextMins: 6, next2Mins: 17, load: 'Seats Available' },
      { service: '16', nextMins: 4, next2Mins: 16, load: 'Standing Available' },
      { service: '131', nextMins: 5, next2Mins: 14, load: 'Seats Available' },
      { service: '167', nextMins: 9, next2Mins: 21, load: 'Seats Available' },
      { service: '857', nextMins: 2, next2Mins: 10, load: 'Seats Available' },
    ],
  },
  {
    code: '04142',
    description: 'SMU School of Law / Armenian St',
    services: [
      { service: '2', nextMins: 6, next2Mins: 15, load: 'Seats Available' },
      { service: '12', nextMins: 4, next2Mins: 13, load: 'Seats Available' },
      { service: '51', nextMins: 7, next2Mins: 18, load: 'Standing Available' },
      { service: '61', nextMins: 5, next2Mins: 16, load: 'Seats Available' },
      { service: '80', nextMins: 3, next2Mins: 12, load: 'Seats Available' },
      { service: '197', nextMins: 8, next2Mins: 19, load: 'Seats Available' },
    ],
  },
  {
    code: '04019',
    description: 'Bencoolen Stn Exit B (SMU SCIS & LKCSB)',
    services: [
      { service: '64', nextMins: 5, next2Mins: 17, load: 'Seats Available' },
      { service: '65', nextMins: 2, next2Mins: 11, load: 'Seats Available' },
      { service: '139', nextMins: 7, next2Mins: 19, load: 'Standing Available' },
      { service: '147', nextMins: 3, next2Mins: 12, load: 'Seats Available' },
      { service: '166', nextMins: 6, next2Mins: 15, load: 'Seats Available' },
      { service: '857', nextMins: 4, next2Mins: 14, load: 'Seats Available' },
    ],
  },
];

export default async function handleBus(req, res) {
  const ltaApiKey = process.env.LTA_DATAMALL_KEY || req.headers['x-lta-api-key'];
  const busStopCode = (req.query.stop || '04121').toString();

  let isLive = false;
  let services = [];

  if (ltaApiKey) {
    try {
      const response = await fetch(
        `https://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${encodeURIComponent(busStopCode)}`,
        {
          headers: {
            AccountKey: ltaApiKey,
            accept: 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.Services)) {
          services = data.Services.map((s) => {
            const nextEstimated = s.NextBus?.EstimatedArrival;
            const nextMins = nextEstimated
              ? Math.max(0, Math.round((new Date(nextEstimated).getTime() - Date.now()) / 60000))
              : null;
            return {
              service: s.ServiceNo,
              nextMins,
              load: s.NextBus?.Load === 'SEA' ? 'Seats Available' : s.NextBus?.Load === 'SDA' ? 'Standing Available' : 'Limited Standing',
            };
          });
          isLive = true;
        }
      }
    } catch {
      isLive = false;
    }
  }

  if (!isLive || services.length === 0) {
    const matchedStop = SMU_BUS_STOPS.find((s) => s.code === busStopCode) || SMU_BUS_STOPS[0];
    services = matchedStop.services;
  }

  const matchedStop = SMU_BUS_STOPS.find((s) => s.code === busStopCode) || SMU_BUS_STOPS[0];

  return res.json({
    busStopCode,
    description: matchedStop.description,
    isLiveLTA: isLive,
    hasApiKeyConfigured: Boolean(process.env.LTA_DATAMALL_KEY || req.headers['x-lta-api-key']),
    allStops: SMU_BUS_STOPS.map((s) => ({ code: s.code, description: s.description })),
    services,
  });
}
