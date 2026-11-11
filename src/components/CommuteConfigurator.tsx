import React from 'react';
import { TRANSIT_ORIGINS } from '../data/transitOrigins.ts';
import { SMU_SCHOOLS } from '../data/smuSchools.ts';
import { CommutePreference } from '../types/commute.ts';
import { CloudRain, Sun, Clock, MapPin, GraduationCap, Car, UserCheck } from 'lucide-react';

interface CommuteConfiguratorProps {
  preferences: CommutePreference;
  onChange: (updated: Partial<CommutePreference>) => void;
}

export const CommuteConfigurator: React.FC<CommuteConfiguratorProps> = ({
  preferences,
  onChange,
}) => {
  const selectedOrigin = TRANSIT_ORIGINS.find((o) => o.id === preferences.originId) || TRANSIT_ORIGINS[0];

  // Quick preset helper
  const setQuickArrival = (hour: number, minute: number = 0) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    onChange({ arrivalDateTime: d.toISOString() });
  };

  const currentDate = new Date(preferences.arrivalDateTime);
  const formattedTimeInput = `${String(currentDate.getHours()).padStart(2, '0')}:${String(
    currentDate.getMinutes()
  ).padStart(2, '0')}`;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const d = new Date(preferences.arrivalDateTime);
      d.setHours(h, m, 0, 0);
      onChange({ arrivalDateTime: d.toISOString() });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Commute &amp; Schedule Parameters</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare bus journey against driving to SMU campus with today&apos;s real-time rate &amp; lot availability.
          </p>
        </div>

        {/* Weather condition toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChange({ weatherCondition: 'clear' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              preferences.weatherCondition === 'clear'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Fair / Dry</span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ weatherCondition: 'rain' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              preferences.weatherCondition === 'rain'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-200" />
            <span>Heavy Rain</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* Origin Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Starting Origin (Singapore)</span>
          </label>
          <select
            value={preferences.originId}
            onChange={(e) => onChange({ originId: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            {TRANSIT_ORIGINS.map((origin) => (
              <option key={origin.id} value={origin.id}>
                {origin.name} ({origin.distanceKm} km · {origin.zone})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Direct routes: {selectedOrigin.busServices.slice(0, 3).map((s) => `Bus ${s}`).join(', ')}
          </div>
        </div>

        {/* Destination SMU School */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Target SMU School</span>
          </label>
          <select
            value={preferences.destinationSchoolId}
            onChange={(e) => onChange({ destinationSchoolId: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            {SMU_SCHOOLS.map((school) => (
              <option key={school.id} value={school.id}>
                {school.shortName}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Affects closest walking carpark calculation
          </div>
        </div>

        {/* Arrival Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Target Arrival Time</span>
          </label>
          <input
            type="time"
            value={formattedTimeInput}
            onChange={handleTimeChange}
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors tabular-nums"
          />
          <div className="flex items-center gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange({ arrivalDateTime: now.toISOString() });
              }}
              className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline"
            >
              Now
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={() => setQuickArrival(8, 30)}
              className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline"
            >
              8:30 AM
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={() => setQuickArrival(13, 30)}
              className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline"
            >
              1:30 PM
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={() => setQuickArrival(18, 30)}
              className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline font-medium text-blue-600 dark:text-blue-400"
            >
              6:30 PM (Per-Entry)
            </button>
          </div>
        </div>

        {/* Parking Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Parking Stay Duration</span>
          </label>
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 8].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => onChange({ parkingDurationHours: hours })}
                className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  preferences.parkingDurationHours === hours
                    ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {hours === 8 ? '8h+' : `${hours}h`}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            Selected: <span className="font-semibold text-slate-800 dark:text-slate-200">{preferences.parkingDurationHours} hour(s)</span>
          </div>
        </div>
      </div>

      {/* Secondary filter strip: Profile & Vehicle */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          {/* User Type */}
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Fare Type:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => onChange({ userType: 'adult' })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  preferences.userType === 'adult'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Adult SimplyGo
              </button>
              <button
                type="button"
                onClick={() => onChange({ userType: 'student' })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  preferences.userType === 'student'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tertiary / Student
              </button>
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="hidden sm:flex items-center gap-2">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Drive Type:</span>
            <select
              value={preferences.vehicleType}
              onChange={(e) => onChange({ vehicleType: e.target.value as CommutePreference['vehicleType'] })}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="petrol">Petrol Car (~$0.24/km)</option>
              <option value="hybrid">Hybrid Car (~$0.14/km)</option>
              <option value="ev">Electric Vehicle (~$0.06/km)</option>
              <option value="motorcycle">Motorcycle (~$0.08/km)</option>
            </select>
          </div>
        </div>

        {/* Origin summary indicator */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          <span>Route: </span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{selectedOrigin.name}</span>
          <span> → SMU Bras Basah (</span>
          <span className="tabular-nums font-mono text-slate-700 dark:text-slate-300">{selectedOrigin.distanceKm} km</span>
          <span>)</span>
        </div>
      </div>
    </div>
  );
};
