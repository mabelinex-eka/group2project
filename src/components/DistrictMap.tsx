import React from 'react';
import { SMU_AREA_CARPARKS } from '../data/carparks.ts';
import { SMU_SCHOOLS } from '../data/smuSchools.ts';
import { Carpark, SMUSchool } from '../types/commute.ts';
import { MapPin, Bus, Navigation, Footprints, ShieldCheck } from 'lucide-react';

interface DistrictMapProps {
  selectedCarparkId: string | null;
  onSelectCarpark: (id: string) => void;
  selectedSchoolId: string;
  onSelectSchool: (id: string) => void;
  liveCarparks: Carpark[];
}

// Coordinate mapping onto a 1000x600 viewBox for schematic rendering
interface MapNode {
  id: string;
  name: string;
  x: number; // 0 - 1000
  y: number; // 0 - 600
  type: 'school' | 'carpark' | 'busStop';
}

const SCHOOL_NODES: Record<string, { x: number; y: number; label: string }> = {
  lkcsb: { x: 520, y: 320, label: 'LKCSB (Business)' },
  soa: { x: 440, y: 330, label: 'SOA (Accountancy)' },
  connexion: { x: 380, y: 280, label: 'SMU Connexion' },
  law: { x: 300, y: 350, label: 'YPHSL (Law)' },
  scis: { x: 480, y: 220, label: 'SCIS (Computing)' },
  soe_soss: { x: 380, y: 190, label: 'SOE / SOSS' },
  admin: { x: 570, y: 300, label: 'Admin Building' },
};

const CARPARK_NODES: Record<string, { x: number; y: number }> = {
  'smu-campus': { x: 460, y: 310 },
  'bras-basah-complex': { x: 740, y: 250 },
  'national-museum': { x: 250, y: 290 },
  'plaza-singapura': { x: 220, y: 120 },
  'funan': { x: 340, y: 510 },
  'raffles-city': { x: 680, y: 440 },
  'sunshine-plaza': { x: 590, y: 120 },
  'manulife-centre': { x: 560, y: 220 },
  'capitol-sg': { x: 520, y: 460 },
  'fort-canning-ura': { x: 190, y: 410 },
  'rendezvous-hotel': { x: 330, y: 180 },
};

const BUS_STOPS = [
  { id: '04121', name: 'SMU / Stamford Rd (Stop 04121)', x: 480, y: 370, buses: '7, 14, 16, 36, 111, 857' },
  { id: '08019', name: 'Bras Basah Stn (Stop 08019)', x: 460, y: 260, buses: '7, 14, 16, 131, 167, 857' },
  { id: '04142', name: 'SMU Law / Armenian St (Stop 04142)', x: 270, y: 380, buses: '2, 12, 33, 51, 61, 80' },
  { id: '04019', name: 'Bencoolen Stn (Stop 04019)', x: 430, y: 170, buses: '64, 65, 139, 147, 166' },
];

export const DistrictMap: React.FC<DistrictMapProps> = ({
  selectedCarparkId,
  onSelectCarpark,
  selectedSchoolId,
  onSelectSchool,
  liveCarparks,
}) => {
  const currentSchool = SCHOOL_NODES[selectedSchoolId] || SCHOOL_NODES['lkcsb'];
  const currentCarparkCoord = selectedCarparkId ? CARPARK_NODES[selectedCarparkId] : null;
  const activeCarpark = liveCarparks.find((c) => c.id === selectedCarparkId);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>SMU Bras Basah District &amp; Transit Canvas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive spatial layout showing SMU schools, surrounding carpark lots, and primary bus stops.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span>SMU Schools</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Carpark &amp; Lots</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Bus Stops</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full bg-slate-950 text-slate-100 overflow-hidden select-none">
        <svg
          viewBox="0 0 960 580"
          className="w-full h-auto max-h-[560px] block"
          style={{ background: '#090d16' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
            {/* Dashed line marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width="960" height="580" fill="url(#grid)" />

          {/* District Arterial Roads */}
          <g stroke="rgba(255,255,255,0.12)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Bras Basah Road */}
            <path d="M 120 160 L 860 300" />
            {/* Stamford Road */}
            <path d="M 180 340 L 780 430" />
            {/* Victoria Street */}
            <path d="M 540 80 L 640 540" />
            {/* Bencoolen Street */}
            <path d="M 440 90 L 460 360" />
            {/* North Bridge Road */}
            <path d="M 690 180 L 400 540" />
          </g>

          {/* Road Labels */}
          <g fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="monospace" fontWeight="600">
            <text x="730" y="285" transform="rotate(11, 730, 285)">BRAS BASAH ROAD</text>
            <text x="620" y="400" transform="rotate(8, 620, 400)">STAMFORD ROAD</text>
            <text x="590" y="160" transform="rotate(78, 590, 160)">VICTORIA ST</text>
            <text x="475" y="125" transform="rotate(84, 475, 125)">BENCOOLEN ST</text>
          </g>

          {/* Walking Route Path if Carpark & School Selected */}
          {currentCarparkCoord && currentSchool && (
            <g>
              <line
                x1={currentCarparkCoord.x}
                y1={currentCarparkCoord.y}
                x2={currentSchool.x}
                y2={currentSchool.y}
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6,6"
                strokeLinecap="round"
              />
              {/* Walking duration pill tag at center of line */}
              <g transform={`translate(${(currentCarparkCoord.x + currentSchool.x) / 2}, ${(currentCarparkCoord.y + currentSchool.y) / 2 - 12})`}>
                <rect
                  x="-42"
                  y="-10"
                  width="84"
                  height="20"
                  rx="10"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {activeCarpark?.walkMinutesToSchool[selectedSchoolId] || 3} min walk
                </text>
              </g>
            </g>
          )}

          {/* Bus Stops */}
          {BUS_STOPS.map((stop) => (
            <g key={stop.id} transform={`translate(${stop.x}, ${stop.y})`} className="cursor-default">
              <circle r="9" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
              <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                B
              </text>
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fill="#fcd34d"
                fontSize="9"
                fontWeight="500"
                fontFamily="sans-serif"
              >
                {stop.id}
              </text>
            </g>
          ))}

          {/* SMU School Building Nodes */}
          {SMU_SCHOOLS.map((school) => {
            const coord = SCHOOL_NODES[school.id];
            if (!coord) return null;
            const isSelected = selectedSchoolId === school.id;

            return (
              <g
                key={school.id}
                transform={`translate(${coord.x}, ${coord.y})`}
                onClick={() => onSelectSchool(school.id)}
                className="cursor-pointer group"
              >
                {/* Glow ring if selected */}
                {isSelected && (
                  <circle r="22" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3,3" opacity="0.8" />
                )}
                {/* Node icon */}
                <rect
                  x="-16"
                  y="-16"
                  width="32"
                  height="32"
                  rx="6"
                  fill={isSelected ? '#2563eb' : '#1e293b'}
                  stroke={isSelected ? '#93c5fd' : '#475569'}
                  strokeWidth="2"
                  className="transition-colors group-hover:stroke-blue-400"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  SMU
                </text>
                {/* School Name label */}
                <text
                  x="0"
                  y="28"
                  textAnchor="middle"
                  fill={isSelected ? '#93c5fd' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : '500'}
                  fontFamily="sans-serif"
                >
                  {coord.label}
                </text>
              </g>
            );
          })}

          {/* Carpark Nodes */}
          {liveCarparks.map((carpark) => {
            const coord = CARPARK_NODES[carpark.id];
            if (!coord) return null;
            const isSelected = selectedCarparkId === carpark.id;
            const isFull = carpark.availableLots <= 5;
            const isModerate = carpark.availableLots > 5 && carpark.availableLots < 40;

            const badgeColor = isFull ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981';

            return (
              <g
                key={carpark.id}
                transform={`translate(${coord.x}, ${coord.y})`}
                onClick={() => onSelectCarpark(carpark.id)}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle r="26" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.9" />
                )}
                {/* Carpark pin pill */}
                <rect
                  x="-36"
                  y="-14"
                  width="72"
                  height="26"
                  rx="13"
                  fill={isSelected ? '#0369a1' : '#0f172a'}
                  stroke={badgeColor}
                  strokeWidth="2"
                  className="transition-all group-hover:scale-105"
                />
                {/* Pin text */}
                <text
                  x="-4"
                  y="3"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {carpark.availableLots}P
                </text>
                <circle cx="22" cy="0" r="4" fill={badgeColor} />
                {/* Carpark label below */}
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#94a3b8'}
                  fontSize="9.5"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="sans-serif"
                >
                  {carpark.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Active Selection Info Bar */}
        {activeCarpark && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white text-sm">
                {activeCarpark.name}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-400 font-semibold tabular-nums font-mono">
                {activeCarpark.availableLots} lots open
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                {activeCarpark.walkMinutesToSchool[selectedSchoolId]}m walk to {currentSchool.label}
              </span>
            </div>

            <button
              onClick={() => onSelectCarpark(activeCarpark.id)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
            >
              Calculate detailed parking rates
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Footprints className="w-3.5 h-3.5 text-blue-500" />
          <span>Click any carpark or SMU school above to preview real-time walking distance &amp; lot availability.</span>
        </div>
        <span className="hidden sm:inline font-mono text-[11px]">Grid: Bras Basah / Bugis Civic District</span>
      </div>
    </div>
  );
};
