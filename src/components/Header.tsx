import React from 'react';
import { RefreshCw, SlidersHorizontal, MapPin } from 'lucide-react';

interface HeaderProps {
  activeTab: 'decision' | 'carparks' | 'rates' | 'map';
  setActiveTab: (tab: 'decision' | 'carparks' | 'rates' | 'map') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  isLiveLTA: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  isLiveLTA,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single line text element) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('decision');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            SMU
          </span>
          <span>Commute Navigator</span>
        </a>

        {/* Zone 2: 4 single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('decision')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'decision'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Decision Engine
          </button>
          <button
            onClick={() => setActiveTab('carparks')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'carparks'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Which Carpark
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'rates'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Parking Rates Today
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>District Map</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action button area */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Feed:</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {isLiveLTA ? 'LTA DataMall (Direct)' : 'SGT Real-Time Calibrated'}
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh live carpark availability"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>LTA Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
