import React from 'react';
import { CommuteVerdict, TransitOrigin, SMUSchool } from '../types/commute.ts';
import { Bus, Car, ArrowRight, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

interface VerdictCardProps {
  verdict: CommuteVerdict;
  origin: TransitOrigin;
  school: SMUSchool;
  onSelectCarpark: (carparkId: string) => void;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  verdict,
  origin,
  school,
  onSelectCarpark,
}) => {
  const isBusRecommended = verdict.recommendation === 'BUS';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Top Verdict Ribbon */}
      <div
        className={`px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isBusRecommended
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/60'
            : 'bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/60'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
              isBusRecommended
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {isBusRecommended ? <Bus className="w-6 h-6" /> : <Car className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Decision Recommendation</span>
              <span aria-hidden="true">·</span>
              <span className={isBusRecommended ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}>
                {isBusRecommended ? 'Optimal Choice: Public Bus' : 'Optimal Choice: Drive & Park'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {verdict.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {verdict.summary}
            </p>
          </div>
        </div>

        {/* Quick Decision Stat Callout */}
        <div className="shrink-0 flex items-center gap-4 bg-white dark:bg-slate-800/90 px-4 py-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Round-Trip Savings</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums font-mono">
              ${Math.abs(verdict.costDifference).toFixed(2)}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Time Variance</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums font-mono">
              {verdict.timeDifferenceMins > 0 ? `+${verdict.timeDifferenceMins}m` : `${verdict.timeDifferenceMins}m`}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Taking the Bus Option */}
          <div
            className={`rounded-xl border p-5 transition-all ${
              isBusRecommended
                ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-400/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Option A: Public Bus</h2>
              </div>
              {isBusRecommended && (
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  Recommended Strategy
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Round-Trip Cost</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                  ${verdict.busTotalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">One-Way Journey Time</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums font-mono">
                  {verdict.busTotalTimeMins} mins
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Direct Service</span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 text-right">
                  {origin.recommendedBusRoute}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">SMU Drop-off Stop</span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 text-right">
                  Stamford Rd (Stop 04121) or Bras Basah Rd (Stop 08019)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  No parking hassle
                </span>
                <span>Walk: ~{origin.busWalkMins} mins</span>
              </div>
            </div>
          </div>

          {/* Right Column: Driving Option */}
          <div
            className={`rounded-xl border p-5 transition-all ${
              !isBusRecommended
                ? 'border-blue-300 dark:border-blue-700/80 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-400/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Option B: Drive &amp; Park</h2>
              </div>
              {!isBusRecommended && (
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                  Recommended Strategy
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Driving Cost</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                  ${verdict.driveTotalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">One-Way Journey Time</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums font-mono">
                  {verdict.driveTotalTimeMins} mins (drive + park)
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Best Carpark</span>
                <button
                  type="button"
                  onClick={() => onSelectCarpark(verdict.primaryCarpark.carpark.id)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-right"
                >
                  <span>{verdict.primaryCarpark.carpark.name}</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                </button>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Live Availability</span>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    {verdict.primaryCarpark.lotsAvailable} lots open
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                    ({verdict.primaryCarpark.availabilityRisk} risk)
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Parking fee: ${verdict.primaryCarpark.totalCost.toFixed(2)}</span>
                <span>Walk to {school.shortName}: {verdict.primaryCarpark.walkTimeToSelectedSchool}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown of Key Factors Table */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
          <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Factor-by-Factor Evaluation
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {verdict.keyFactors.map((factor, idx) => (
              <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="w-48 font-medium text-slate-800 dark:text-slate-200 shrink-0">
                  {factor.label}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Bus:</span>
                    <span>{factor.busDetail}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Drive:</span>
                    <span>{factor.driveDetail}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {factor.winner === 'BUS' && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Bus Favored
                    </span>
                  )}
                  {factor.winner === 'DRIVE' && (
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                      Drive Favored
                    </span>
                  )}
                  {factor.winner === 'TIE' && (
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      Even
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Recommendation Callout */}
        {verdict.alternateCarpark && (
          <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Backup Carpark: If {verdict.primaryCarpark.carpark.shortLabel} is full, next best is{' '}
                <strong className="text-slate-900 dark:text-white font-medium">
                  {verdict.alternateCarpark.carpark.name}
                </strong>{' '}
                (${verdict.alternateCarpark.totalCost.toFixed(2)} total, {verdict.alternateCarpark.lotsAvailable} lots open).
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectCarpark(verdict.alternateCarpark!.carpark.id)}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-3"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
