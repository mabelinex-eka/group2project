import React, { useState, useEffect } from 'react';
import { SMU_AREA_CARPARKS } from '../data/carparks.ts';
import { calculateCarparkParkingCost } from '../utils/calculator.ts';
import { Info, Database, Search, RefreshCw, ExternalLink } from 'lucide-react';

interface DataGovRate {
  _id: number;
  carpark: string;
  category: string;
  weekdays_rate_1: string;
  weekdays_rate_2: string;
  saturday_rate: string;
  sunday_publicholiday_rate: string;
}

export const CarparkRatesTable: React.FC = () => {
  const [testDay, setTestDay] = useState<'today' | 'weekday' | 'saturday' | 'sunday'>('today');
  const [viewMode, setViewMode] = useState<'smu_matrix' | 'datagov_search'>('smu_matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataGovRecords, setDataGovRecords] = useState<DataGovRate[]>([]);
  const [matchedSmuRates, setMatchedSmuRates] = useState<Record<string, DataGovRate | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchRates = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/carparkrates?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setDataGovRecords(data.records || []);
        if (data.matchedSmuRates) {
          setMatchedSmuRates(data.matchedSmuRates);
        }
      }
    } catch (err) {
      console.error('Failed to load data.gov.sg rates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(searchQuery);
  }, [searchQuery]);

  const getTestDate = () => {
    const d = new Date();
    if (testDay === 'weekday') {
      d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7 || 7));
      d.setHours(14, 0, 0, 0);
    } else if (testDay === 'saturday') {
      d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
      d.setHours(14, 0, 0, 0);
    } else if (testDay === 'sunday') {
      d.setDate(d.getDate() + ((0 - d.getDay() + 7) % 7 || 7));
      d.setHours(14, 0, 0, 0);
    }
    return d;
  };

  const activeDate = getTestDate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Official Carpark Tariff Directory
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              <Database className="w-3 h-3" />
              <span>data.gov.sg synced</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pulling live government records from dataset <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">d_9f6056bdb6b1dfba57f063593e4f34ae</code>.
          </p>
        </div>

        {/* View Mode & Preset Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('smu_matrix')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'smu_matrix'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              SMU &amp; Vicinity
            </button>
            <button
              type="button"
              onClick={() => setViewMode('datagov_search')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'datagov_search'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Search Open Registry (350+)
            </button>
          </div>

          {viewMode === 'smu_matrix' && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setTestDay('today')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  testDay === 'today'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTestDay('weekday')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  testDay === 'weekday'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Weekday
              </button>
              <button
                type="button"
                onClick={() => setTestDay('saturday')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  testDay === 'saturday'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sat
              </button>
              <button
                type="button"
                onClick={() => setTestDay('sunday')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  testDay === 'sunday'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sun/PH
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mode 1: SMU Vicinity Table with Live Data.gov.sg Tariffs */}
      {viewMode === 'smu_matrix' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Carpark &amp; Operator</th>
                <th className="py-3.5 px-4 font-semibold">Weekday Daytime (07:00–18:00)</th>
                <th className="py-3.5 px-4 font-semibold">Evening Tariff (After 18:00)</th>
                <th className="py-3.5 px-4 font-semibold">Official data.gov.sg Tariff</th>
                <th className="py-3.5 px-4 font-semibold text-right">2h Stay</th>
                <th className="py-3.5 px-4 font-semibold text-right">4h Stay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SMU_AREA_CARPARKS.map((carpark) => {
                const cost2h = calculateCarparkParkingCost(carpark, activeDate, 2).totalCost;
                const cost4h = calculateCarparkParkingCost(carpark, activeDate, 4).totalCost;
                const govRecord = matchedSmuRates[carpark.id];

                return (
                  <tr
                    key={carpark.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {carpark.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {carpark.operator} · {carpark.totalLots} lots
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200">
                        {carpark.rates.weekdayDay.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {carpark.rates.weekdayEvening.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {govRecord ? (
                        <div className="text-[11px] text-slate-700 dark:text-slate-300">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {govRecord.carpark}:
                          </span>{' '}
                          {govRecord.weekdays_rate_1}
                          {govRecord.weekdays_rate_2 !== '-' && ` · ${govRecord.weekdays_rate_2}`}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          SMU verified campus schedule
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                      ${cost2h.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                      ${cost4h.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mode 2: Full Data.gov.sg Dataset Search */}
      {viewMode === 'datagov_search' && (
        <div className="p-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search 350+ Singapore carparks (e.g. Bras Basah, Bugis, Orchard, Raffles, Suntec)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-semibold">Carpark</th>
                  <th className="py-3 px-3 font-semibold">Area Category</th>
                  <th className="py-3 px-3 font-semibold">Weekday Daytime</th>
                  <th className="py-3 px-3 font-semibold">Weekday Evening</th>
                  <th className="py-3 px-3 font-semibold">Saturday</th>
                  <th className="py-3 px-3 font-semibold">Sunday / Public Holiday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dataGovRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {r.carpark}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{r.category}</td>
                    <td className="py-2.5 px-3">{r.weekdays_rate_1}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {r.weekdays_rate_2 !== '-' ? r.weekdays_rate_2 : 'Same as daytime'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {r.saturday_rate !== '-' ? r.saturday_rate : 'Same as weekdays'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {r.sunday_publicholiday_rate !== '-'
                        ? r.sunday_publicholiday_rate
                        : 'Same as Saturday'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            Tariffs pulled directly from Singapore Open Data API (resource ID:{' '}
            <code className="font-mono">d_9f6056bdb6b1dfba57f063593e4f34ae</code>).
          </span>
        </div>
        <a
          href="https://data.gov.sg/api/action/datastore_search?resource_id=d_9f6056bdb6b1dfba57f063593e4f34ae"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          <span>View Raw Dataset</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
