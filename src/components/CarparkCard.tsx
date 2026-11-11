import React, { useState } from 'react';
import { CarparkCostCalculation, SMUSchool } from '../types/commute.ts';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Zap,
  Umbrella,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface CarparkCardProps {
  calc: CarparkCostCalculation;
  rank: number;
  school: SMUSchool;
  isSelected: boolean;
  onSelect: () => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  calc,
  rank,
  school,
  isSelected,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { carpark, totalCost, lotsAvailable, occupancyPercent, availabilityRisk, walkTimeToSelectedSchool } = calc;

  // Status badge styling
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
      case 'moderate':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
      case 'high':
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
      default:
        return 'text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div
      className={`border rounded-xl transition-all duration-200 bg-white dark:bg-slate-900 ${
        isSelected
          ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Rank & Carpark Title */}
          <div className="flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                rank === 1
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              #{rank}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  onClick={onSelect}
                  className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {carpark.name}
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {carpark.operator}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{carpark.address}</span>
              </div>
            </div>
          </div>

          {/* Cost Metric Display */}
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Today</div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono">
              ${totalCost.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              ~${calc.effectiveHourlyRate.toFixed(2)}/hr
            </div>
          </div>
        </div>

        {/* Live Lots & Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums font-mono">
                {lotsAvailable} lots available
              </span>
              <span className="text-slate-400">/ {carpark.totalLots} total</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getRiskColor(
                availabilityRisk
              )}`}
            >
              {availabilityRisk === 'low'
                ? 'High Vacancy'
                : availabilityRisk === 'moderate'
                ? 'Moderate Vacancy'
                : 'Limited Lots'}
            </span>
          </div>

          {/* Occupancy bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                occupancyPercent > 85
                  ? 'bg-rose-500'
                  : occupancyPercent > 65
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Proximity & Facilities */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {walkTimeToSelectedSchool} min walk
              </span>
              <span>to {school.shortName}</span>
            </div>
            {carpark.isSheltered && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400" title="Covered sheltered walk">
                <Umbrella className="w-3.5 h-3.5 text-blue-500" />
                <span>Sheltered</span>
              </span>
            )}
            {carpark.hasEVCharging && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400" title="EV charging available">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>EV</span>
              </span>
            )}
          </div>

          {/* Expand calculation button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>{isExpanded ? 'Hide Rate Breakdown' : 'View Rate Breakdown'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Rate Breakdown Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg p-3 text-xs space-y-2">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Today&apos;s Calculation:</span>
              <ul className="mt-1 space-y-1 text-slate-600 dark:text-slate-400">
                {calc.costBreakdown.map((item, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-blue-500">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Rate Structure:</span>
              <div className="mt-0.5">Day: {carpark.rates.weekdayDay.description}</div>
              <div>Evening: {carpark.rates.weekdayEvening.description}</div>
              {carpark.rates.specialNotes && (
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Note: {carpark.rates.specialNotes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
