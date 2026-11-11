import React, { useState } from 'react';
import { SMU_AREA_CARPARKS } from '../data/carparks.ts';
import { calculateCarparkParkingCost } from '../utils/calculator.ts';
import { Calendar, HelpCircle, Check, Info } from 'lucide-react';

export const CarparkRatesTable: React.FC = () => {
  const [testDay, setTestDay] = useState<'today' | 'weekday' | 'saturday' | 'sunday'>('today');

  const getTestDate = () => {
    const d = new Date();
    if (testDay === 'weekday') {
      // Set to Wednesday 14:00
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            SMU Vicinity Parking Rates Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified official tariff cards across all university, public HDB/URA, and commercial carparks in Bras Basah.
          </p>
        </div>

        {/* Day Preview Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setTestDay('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              testDay === 'today'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Today ({new Date().toLocaleDateString('en-SG', { weekday: 'short' })})
          </button>
          <button
            type="button"
            onClick={() => setTestDay('weekday')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              testDay === 'weekday'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Weekday (Mon–Fri)
          </button>
          <button
            type="button"
            onClick={() => setTestDay('saturday')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              testDay === 'saturday'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Saturday
          </button>
          <button
            type="button"
            onClick={() => setTestDay('sunday')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              testDay === 'sunday'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sunday / PH
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Carpark &amp; Operator</th>
              <th className="py-3.5 px-4 font-semibold">Weekday Daytime (07:00–18:00)</th>
              <th className="py-3.5 px-4 font-semibold">Evening Rate (After 18:00)</th>
              <th className="py-3.5 px-4 font-semibold">Sunday / Public Holiday</th>
              <th className="py-3.5 px-4 font-semibold text-right">2h Stay</th>
              <th className="py-3.5 px-4 font-semibold text-right">4h Stay</th>
              <th className="py-3.5 px-4 font-semibold text-center">Sheltered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {SMU_AREA_CARPARKS.map((carpark) => {
              const cost2h = calculateCarparkParkingCost(carpark, activeDate, 2).totalCost;
              const cost4h = calculateCarparkParkingCost(carpark, activeDate, 4).totalCost;

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
                      {carpark.operator} · {carpark.totalLots} total lots
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
                  <td className="py-3 px-4">
                    <div className="text-slate-700 dark:text-slate-300">
                      {carpark.rates.sundayPh.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    ${cost2h.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    ${cost4h.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {carpark.isSheltered ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Standard grace period for all listed carparks is 10 minutes. For SMU basement, rates apply equally across all campus basements (Concourse, LKCSB, SOA, SCIS, SMU Connexion). HDB Bras Basah Complex enforces electronic per-minute charges rounded to 30-minute intervals.
        </p>
      </div>
    </div>
  );
};
