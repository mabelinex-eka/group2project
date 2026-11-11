import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertTriangle, Moon, Sun, Shield, ExternalLink } from 'lucide-react';

interface LtaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ltaApiKey: string;
  onSaveApiKey: (key: string) => void;
  isLiveLTA: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LtaSettingsModal: React.FC<LtaSettingsModalProps> = ({
  isOpen,
  onClose,
  ltaApiKey,
  onSaveApiKey,
  isLiveLTA,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [keyInput, setKeyInput] = useState(ltaApiKey);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setTestingStatus('testing');
    try {
      const res = await fetch('/api/carparkavailability', {
        headers: keyInput ? { AccountKey: keyInput, 'x-lta-api-key': keyInput } : {},
      });
      const data = await res.json();
      if (data && (data.smuCarparks || data.carparks)) {
        setTestingStatus(data.isLiveLTA ? 'success' : 'idle');
        onSaveApiKey(keyInput);
      } else {
        setTestingStatus('failed');
      }
    } catch {
      setTestingStatus('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Data Source &amp; LTA DataMall Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage live API connectivity and display preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Active Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isLiveLTA
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 text-blue-800 dark:text-blue-300'
            }`}
          >
            {isLiveLTA ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold text-xs">
                {isLiveLTA
                  ? 'Connected to Live Singapore LTA DataMall v2 Feed'
                  : 'Operating in High-Fidelity SGT Live Dynamic Simulation Mode'}
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {isLiveLTA
                  ? 'Lot availability is queried in real time directly from LTA DataMall CarParkAvailabilityv2.'
                  : 'Simulating live turnover, occupancy shifts, and peak-hour dynamics synchronized with Singapore Time (UTC+8). Enter your own LTA DataMall AccountKey below to connect directly.'}
              </p>
            </div>
          </div>

          {/* Key Input */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>LTA DataMall AccountKey</span>
              <a
                href="https://datamall.lta.gov.sg/content/datamall/en/request-api.html"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-normal"
              >
                <span>Request Free LTA Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              placeholder="Paste your LTA DataMall AccountKey here..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Keys are passed safely via headers and read exclusively with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">process.env</code> on the backend. Never exposed in public client bundles.
            </p>
          </div>

          {/* Theme Settings */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">Color Appearance</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Toggle between light and dark interface theme
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTestAndSave}
            disabled={testingStatus === 'testing'}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            {testingStatus === 'testing' ? 'Testing Connection...' : 'Save & Connect Feed'}
          </button>
        </div>
      </div>
    </div>
  );
};
