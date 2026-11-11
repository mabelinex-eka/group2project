import React, { useState, useEffect } from 'react';
import { Bus, Clock, MapPin, RefreshCw, Users, ShieldCheck } from 'lucide-react';

interface BusService {
  service: string;
  nextMins: number | null;
  load: string;
}

interface BusStopData {
  code: string;
  description: string;
}

export const BusStopsExplorer: React.FC<{ ltaApiKey?: string }> = ({ ltaApiKey }) => {
  const [selectedStop, setSelectedStop] = useState<string>('04121');
  const [busData, setBusData] = useState<{
    services: BusService[];
    description: string;
    isLiveLTA: boolean;
    allStops: BusStopData[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchBusArrivals = async (stopCode: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bus?stop=${stopCode}`, {
        headers: ltaApiKey ? { 'x-lta-api-key': ltaApiKey } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setBusData(data);
      }
    } catch (err) {
      console.error('Failed to load bus arrivals', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusArrivals(selectedStop);
  }, [selectedStop, ltaApiKey]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>SMU Campus Bus Stops &amp; Live Arrivals</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time SimplyGo bus arrival times and occupancy at SMU perimeter bus stops.
          </p>
        </div>

        <button
          onClick={() => fetchBusArrivals(selectedStop)}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Arrivals</span>
        </button>
      </div>

      {/* Bus Stop Selector Tabs */}
      <div className="px-5 pt-4 flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        {[
          { code: '04121', name: 'Stop 04121: SMU Stamford Rd' },
          { code: '08019', name: 'Stop 08019: Bras Basah Rd' },
          { code: '04142', name: 'Stop 04142: SMU Law (Armenian St)' },
          { code: '04019', name: 'Stop 04019: Bencoolen St (SCIS)' },
        ].map((stop) => (
          <button
            key={stop.code}
            onClick={() => setSelectedStop(stop.code)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedStop === stop.code
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {stop.name}
          </button>
        ))}
      </div>

      {/* Arrivals Grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {busData?.services.map((svc) => (
            <div
              key={svc.service}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-center"
            >
              <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                {svc.service}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs tabular-nums font-mono">
                <Clock className="w-3 h-3" />
                <span>{svc.nextMins !== null ? `${svc.nextMins} min` : 'Arr'}</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {svc.load}
              </div>
            </div>
          ))}
        </div>

        {/* Informative Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Fares: Distance-based SimplyGo ($1.09 to $2.37 adult / $0.56 to $0.80 student).</span>
          </div>
          <span>Source: {busData?.isLiveLTA ? 'Live LTA DataMall' : 'Real-time Transport Model'}</span>
        </div>
      </div>
    </div>
  );
};
