/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { CommuteConfigurator } from './components/CommuteConfigurator.tsx';
import { VerdictCard } from './components/VerdictCard.tsx';
import { CarparkRankingList } from './components/CarparkRankingList.tsx';
import { CarparkRatesTable } from './components/CarparkRatesTable.tsx';
import { DistrictMap } from './components/DistrictMap.tsx';
import { BusStopsExplorer } from './components/BusStopsExplorer.tsx';
import { LtaSettingsModal } from './components/LtaSettingsModal.tsx';

import { SMU_AREA_CARPARKS } from './data/carparks.ts';
import { TRANSIT_ORIGINS } from './data/transitOrigins.ts';
import { SMU_SCHOOLS } from './data/smuSchools.ts';
import { Carpark, CommutePreference } from './types/commute.ts';
import { evaluateAllCarparks, generateCommuteVerdict } from './utils/calculator.ts';
import {
  Clock,
  Sparkles,
  MapPin,
  Car,
  Bus,
  BadgeDollarSign,
  Info,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'decision' | 'carparks' | 'rates' | 'map'>('decision');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLiveLTA, setIsLiveLTA] = useState<boolean>(false);
  const [sgtTimeString, setSgtTimeString] = useState<string>('');

  const [liveCarparks, setLiveCarparks] = useState<Carpark[]>(SMU_AREA_CARPARKS);
  const [selectedCarparkId, setSelectedCarparkId] = useState<string | null>(null);

  // Commute preference state
  const [preferences, setPreferences] = useState<CommutePreference>(() => {
    const now = new Date();
    return {
      originId: 'tampines',
      destinationSchoolId: 'lkcsb',
      userType: 'adult',
      vehicleType: 'petrol',
      arrivalDateTime: now.toISOString(),
      parkingDurationHours: 3,
      weatherCondition: 'clear',
      valuePerHourOfTime: 18,
      ltaApiKey: typeof window !== 'undefined' ? localStorage.getItem('lta_api_key') || '' : '',
    };
  });

  // Dark mode handler
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch live carpark lots from /api/feed
  const fetchCarparkFeed = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const headers: Record<string, string> = {};
      if (preferences.ltaApiKey) {
        headers['x-lta-api-key'] = preferences.ltaApiKey;
      }

      const res = await fetch('/api/feed', { headers });
      if (res.ok) {
        const data = await res.json();
        setIsLiveLTA(Boolean(data.isLiveLTA));
        setSgtTimeString(data.sgtFormattedTime || '');

        if (Array.isArray(data.carparks)) {
          setLiveCarparks((prev) =>
            prev.map((cp) => {
              const match = data.carparks.find((d: { id: string }) => d.id === cp.id);
              if (match) {
                return {
                  ...cp,
                  availableLots: match.availableLots,
                  totalLots: match.totalLots || cp.totalLots,
                  lastUpdated: match.lastUpdated || 'Just now',
                };
              }
              return cp;
            })
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch /api/feed', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [preferences.ltaApiKey]);

  useEffect(() => {
    fetchCarparkFeed();
  }, [fetchCarparkFeed]);

  // Handle preference changes
  const handlePreferenceChange = (updated: Partial<CommutePreference>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  // Handle saving LTA key
  const handleSaveApiKey = (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lta_api_key', key);
    }
    setPreferences((prev) => ({ ...prev, ltaApiKey: key }));
    setIsSettingsOpen(false);
    fetchCarparkFeed();
  };

  // Find active origin & school
  const activeOrigin = useMemo(() => {
    return TRANSIT_ORIGINS.find((o) => o.id === preferences.originId) || TRANSIT_ORIGINS[0];
  }, [preferences.originId]);

  const activeSchool = useMemo(() => {
    return SMU_SCHOOLS.find((s) => s.id === preferences.destinationSchoolId) || SMU_SCHOOLS[0];
  }, [preferences.destinationSchoolId]);

  // Evaluate carparks & calculate costs
  const evaluatedCarparks = useMemo(() => {
    return evaluateAllCarparks(liveCarparks, preferences, preferences.destinationSchoolId);
  }, [liveCarparks, preferences]);

  // Generate commute verdict
  const verdict = useMemo(() => {
    return generateCommuteVerdict(activeOrigin, preferences, evaluatedCarparks);
  }, [activeOrigin, preferences, evaluatedCarparks]);

  // Rate band description
  const arrivalDate = new Date(preferences.arrivalDateTime);
  const arrivalHour = arrivalDate.getHours();
  const isEveningRate = arrivalHour >= 18;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Strict 3-zone Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={fetchCarparkFeed}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLiveLTA={isLiveLTA}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Section with Architectural SMU Image */}
        <section className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-900">
            <img
              src="/src/assets/images/smu_bras_basah_1794370613165.jpg"
              alt="Singapore Management University campus with green facade, bus stop, and civic streetscape"
              className="w-full h-full object-cover object-center opacity-85"
              referrerPolicy="no-referrer"
            />
            {/* Scrim overlay for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col justify-end">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium mb-1.5">
                <span>Singapore Management University</span>
                <span aria-hidden="true">·</span>
                <span>Bras Basah &amp; Stamford Transit Corridor</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SGT: {sgtTimeString || 'Live UTC+8'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-balance">
                Bus vs. Driving to SMU &amp; Live Carpark Guide
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                Real-time decision analyzer comparing SimplyGo bus routes against driving costs, ERP tolls, and today&apos;s live LTA carpark vacancy across 11 campus &amp; nearby carparks.
              </p>

              {/* 3 Quick-Glance Mobility Metrics */}
              <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Rate Band</div>
                  <div className="text-xs sm:text-sm font-semibold truncate">
                    {isEveningRate ? 'Night Per-Entry (Flat)' : 'Daytime Hourly ($1.20 - $3.60/h)'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Bus Fare (Round Trip)</div>
                  <div className="text-xs sm:text-sm font-bold tabular-nums font-mono text-emerald-400">
                    ${verdict.busTotalCost.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Top Lot Recommendation</div>
                  <div className="text-xs sm:text-sm font-semibold truncate text-blue-300">
                    {verdict.primaryCarpark.carpark.shortLabel} ({verdict.primaryCarpark.lotsAvailable} lots)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cheapest Today</div>
                  <div className="text-xs sm:text-sm font-semibold text-amber-300">
                    Bras Basah Complex ($1.20/h)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Commute Configuration Card */}
        <section aria-label="Commute parameters">
          <CommuteConfigurator
            preferences={preferences}
            onChange={handlePreferenceChange}
          />
        </section>

        {/* Tab-driven Content Switcher */}
        {activeTab === 'decision' && (
          <section className="space-y-6">
            {/* The Master Decision Verdict */}
            <VerdictCard
              verdict={verdict}
              origin={activeOrigin}
              school={activeSchool}
              onSelectCarpark={(id) => {
                setSelectedCarparkId(id);
                setActiveTab('carparks');
              }}
            />

            {/* Quick Carpark Ranking Strip */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Top Recommended Carparks for {activeSchool.shortName}
                </h2>
                <button
                  onClick={() => setActiveTab('carparks')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  View all 11 carparks →
                </button>
              </div>
              <CarparkRankingList
                calculations={evaluatedCarparks.slice(0, 4)}
                school={activeSchool}
                selectedCarparkId={selectedCarparkId}
                onSelectCarpark={setSelectedCarparkId}
                parkingHours={preferences.parkingDurationHours}
              />
            </div>

            {/* Bus Arrivals & Perimeters */}
            <BusStopsExplorer ltaApiKey={preferences.ltaApiKey} />
          </section>
        )}

        {activeTab === 'carparks' && (
          <section className="space-y-6">
            <CarparkRankingList
              calculations={evaluatedCarparks}
              school={activeSchool}
              selectedCarparkId={selectedCarparkId}
              onSelectCarpark={setSelectedCarparkId}
              parkingHours={preferences.parkingDurationHours}
            />
          </section>
        )}

        {activeTab === 'rates' && (
          <section className="space-y-6">
            <CarparkRatesTable />
          </section>
        )}

        {activeTab === 'map' && (
          <section className="space-y-6">
            <DistrictMap
              selectedCarparkId={selectedCarparkId}
              onSelectCarpark={setSelectedCarparkId}
              selectedSchoolId={preferences.destinationSchoolId}
              onSelectSchool={(id) => handlePreferenceChange({ destinationSchoolId: id })}
              liveCarparks={liveCarparks}
            />
          </section>
        )}

        {/* Informative Guidance & Methodology */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Singapore Transport &amp; Parking Methodology</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-slate-300 leading-relaxed">
            <div>
              <strong className="text-slate-900 dark:text-white block mb-1">
                LTA DataMall Availability
              </strong>
              Lot counts are synchronized with Land Transport Authority (LTA) CarParkAvailabilityv2 data, calibrated with empirical peak turnover models for SMU basement and Bras Basah municipal parking.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-1">
                Real-World Parking Costs Today
              </strong>
              SMU charges $0.05/min ($3.00/h) daytime 07:00–18:00 and $4.00 per-entry after 18:00. HDB Bras Basah Complex charges $1.20/h and offers free parking on Sundays daytime.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-1">
                Transit Fare Calculation
              </strong>
              Bus fares use standard SimplyGo distance-based pricing. Concession fares apply for matriculated SMU students, while adult fare cards apply to visitors and working professionals.
            </div>
          </div>
        </section>
      </main>

      {/* Settings Modal */}
      <LtaSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ltaApiKey={preferences.ltaApiKey || ''}
        onSaveApiKey={handleSaveApiKey}
        isLiveLTA={isLiveLTA}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span>SMU Commute &amp; Carpark Decision Engine</span>
            <span className="mx-2">·</span>
            <span>Civic District Bras Basah, Singapore</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by LTA DataMall v2 API</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              API Key Config
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
