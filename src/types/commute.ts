export interface SMUSchool {
  id: string;
  name: string;
  shortName: string;
  address: string;
  iconName: string;
}

export interface RateRule {
  description: string;
  ratePerHour?: number;
  ratePerMinute?: number;
  perEntryRate?: number;
  freePeriodMinutes?: number;
}

export interface CarparkRateCard {
  weekdayDay: RateRule; // Mon-Fri 07:00 or 08:00 to 17:00 / 18:00
  weekdayEvening: RateRule; // Mon-Fri after 17:00 / 18:00
  saturdayDay: RateRule;
  saturdayEvening: RateRule;
  sundayPh: RateRule;
  gracePeriodMins: number;
  specialNotes?: string;
}

export interface Carpark {
  id: string;
  name: string;
  shortLabel: string;
  address: string;
  operator: 'SMU' | 'HDB' | 'URA' | 'Commercial' | 'Hotel';
  totalLots: number;
  availableLots: number;
  lastUpdated: string;
  agencyCode: string;
  ltaDevelopmentName: string;
  distanceMeters: number;
  walkMinutesToSchool: Record<string, number>;
  isSheltered: boolean;
  hasEVCharging: boolean;
  rates: CarparkRateCard;
  coordinates: {
    lat: number;
    lng: number;
  };
  recommendationReason?: string;
}

export interface TransitOrigin {
  id: string;
  name: string;
  zone: 'East' | 'West' | 'North' | 'North-East' | 'Central';
  distanceKm: number;
  busServices: string[];
  recommendedBusRoute: string;
  busTravelTimeMins: {
    peak: number;
    offPeak: number;
  };
  busWalkMins: number;
  busFareAdult: number;
  busFareStudent: number;
  driveTimeMins: {
    peak: number;
    offPeak: number;
  };
  typicalErpPeak: number;
  typicalErpOffPeak: number;
}

export interface CommutePreference {
  originId: string;
  destinationSchoolId: string;
  userType: 'student' | 'adult';
  vehicleType: 'petrol' | 'hybrid' | 'ev' | 'motorcycle';
  arrivalDateTime: string;
  parkingDurationHours: number;
  weatherCondition: 'clear' | 'rain';
  valuePerHourOfTime: number; // SGD $/hour
  ltaApiKey?: string;
}

export interface CarparkCostCalculation {
  carpark: Carpark;
  totalCost: number;
  effectiveHourlyRate: number;
  isAvailable: boolean;
  lotsAvailable: number;
  occupancyPercent: number;
  availabilityRisk: 'low' | 'moderate' | 'high' | 'full';
  walkTimeToSelectedSchool: number;
  shelteredWalk: boolean;
  costBreakdown: string[];
  badges: string[];
  overallScore: number; // lower is better or normalized 0-100
}

export interface CommuteVerdict {
  recommendation: 'BUS' | 'DRIVE' | 'TOSS_UP';
  title: string;
  summary: string;
  busTotalCost: number; // Round trip
  busTotalTimeMins: number; // One-way or round trip
  driveTotalCost: number; // Fuel/EV + ERP + Carpark
  driveTotalTimeMins: number; // Drive + park + walk
  costDifference: number; // Positive = drive is more expensive
  timeDifferenceMins: number; // Positive = bus takes more minutes
  primaryCarpark: CarparkCostCalculation;
  alternateCarpark?: CarparkCostCalculation;
  weatherImpactNote?: string;
  keyFactors: {
    label: string;
    busDetail: string;
    driveDetail: string;
    winner: 'BUS' | 'DRIVE' | 'TIE';
  }[];
}
