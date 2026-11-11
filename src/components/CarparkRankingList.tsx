import React, { useState, useMemo } from 'react';
import { CarparkCostCalculation, SMUSchool } from '../types/commute.ts';
import { CarparkCard } from './CarparkCard.tsx';
import { SlidersHorizontal, ArrowUpDown, Filter } from 'lucide-react';

interface CarparkRankingListProps {
  calculations: CarparkCostCalculation[];
  school: SMUSchool;
  selectedCarparkId: string | null;
  onSelectCarpark: (id: string) => void;
  parkingHours: number;
}

type SortOption = 'recommended' | 'cost' | 'walk' | 'lots';

export const CarparkRankingList: React.FC<CarparkRankingListProps> = ({
  calculations,
  school,
  selectedCarparkId,
  onSelectCarpark,
  parkingHours,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'budget' | 'close' | 'high_lots' | 'sheltered' | 'ev'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  // Total district lots summary
  const totalAvailableLots = useMemo(() => {
    return calculations.reduce((acc, curr) => acc + curr.lotsAvailable, 0);
  }, [calculations]);

  // Filter and sort carparks
  const processedCarparks = useMemo(() => {
    let list = [...calculations];

    // Filter
    if (filterType === 'budget') {
      list = list.filter((c) => c.totalCost <= 8.0);
    } else if (filterType === 'close') {
      list = list.filter((c) => c.walkTimeToSelectedSchool <= 3);
    } else if (filterType === 'high_lots') {
      list = list.filter((c) => c.lotsAvailable >= 40);
    } else if (filterType === 'sheltered') {
      list = list.filter((c) => c.shelteredWalk);
    } else if (filterType === 'ev') {
      list = list.filter((c) => c.carpark.hasEVCharging);
    }

    // Sort
    if (sortBy === 'cost') {
      list.sort((a, b) => a.totalCost - b.totalCost);
    } else if (sortBy === 'walk') {
      list.sort((a, b) => a.walkTimeToSelectedSchool - b.walkTimeToSelectedSchool);
    } else if (sortBy === 'lots') {
      list.sort((a, b) => b.lotsAvailable - a.lotsAvailable);
    } else {
      // Default recommended
      list.sort((a, b) => a.overallScore - b.overallScore);
    }

    return list;
  }, [calculations, filterType, sortBy]);

  return (
    <div className="space-y-4">
      {/* Title & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Which Carpark Should You Park At?</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked recommendation for <strong className="text-slate-800 dark:text-slate-200 font-medium">{school.name}</strong> ({parkingHours}h stay).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">District Vacancy:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
              {totalAvailableLots} lots open
            </span>
            <span className="text-slate-400">across 11 carparks</span>
          </div>
        </div>

        {/* Filter and Sort Bar */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Carparks ({calculations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('budget')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'budget'
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Budget (&le;$8)
            </button>
            <button
              type="button"
              onClick={() => setFilterType('close')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'close'
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              &le; 3 min Walk
            </button>
            <button
              type="button"
              onClick={() => setFilterType('high_lots')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'high_lots'
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              &ge; 40 Lots Open
            </button>
            <button
              type="button"
              onClick={() => setFilterType('sheltered')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'sheltered'
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sheltered
            </button>
            <button
              type="button"
              onClick={() => setFilterType('ev')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'ev'
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              EV Ready
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="recommended">Best Balance (Score)</option>
              <option value="cost">Lowest Cost Today</option>
              <option value="walk">Shortest Walk</option>
              <option value="lots">Most Lots Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processedCarparks.map((calc, index) => (
          <CarparkCard
            key={calc.carpark.id}
            calc={calc}
            rank={index + 1}
            school={school}
            isSelected={selectedCarparkId === calc.carpark.id}
            onSelect={() => onSelectCarpark(calc.carpark.id)}
          />
        ))}

        {processedCarparks.length === 0 && (
          <div className="col-span-2 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No carparks match your selected filter criteria.
            </p>
            <button
              onClick={() => setFilterType('all')}
              className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Reset filters to show all carparks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
