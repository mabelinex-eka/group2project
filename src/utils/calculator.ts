import { Carpark, CarparkCostCalculation, CommutePreference, CommuteVerdict, TransitOrigin } from '../types/commute.ts';

/**
 * Accurately calculate the parking cost for a given carpark given arrival time and duration
 */
export function calculateCarparkParkingCost(
  carpark: Carpark,
  arrivalDate: Date,
  durationHours: number
): { totalCost: number; breakdown: string[] } {
  const breakdown: string[] = [];
  const dayOfWeek = arrivalDate.getDay(); // 0 is Sunday, 6 is Saturday
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isWeekday = !isSunday && !isSaturday;

  const startHour = arrivalDate.getHours();
  const startMinute = arrivalDate.getMinutes();
  const startDecimal = startHour + startMinute / 60;
  const endDecimal = startDecimal + durationHours;

  let totalCost = 0;

  // Sunday / Public Holiday rule
  if (isSunday) {
    const sunRule = carpark.rates.sundayPh;
    if (sunRule.perEntryRate !== undefined && sunRule.ratePerHour === undefined) {
      totalCost = sunRule.perEntryRate;
      breakdown.push(`Sunday flat per-entry: $${totalCost.toFixed(2)}`);
    } else if (sunRule.ratePerHour === 0 && sunRule.perEntryRate === 0) {
      totalCost = 0;
      breakdown.push(`Sunday free parking scheme: $0.00`);
    } else if (sunRule.ratePerHour) {
      totalCost = Math.ceil(durationHours) * sunRule.ratePerHour;
      breakdown.push(`Sunday hourly (${durationHours}h @ $${sunRule.ratePerHour.toFixed(2)}/h): $${totalCost.toFixed(2)}`);
    } else if (sunRule.perEntryRate !== undefined) {
      totalCost = sunRule.perEntryRate;
      breakdown.push(`Sunday per-entry: $${totalCost.toFixed(2)}`);
    } else {
      totalCost = durationHours * 3.0;
      breakdown.push(`Standard rate: $${totalCost.toFixed(2)}`);
    }
    return { totalCost, breakdown };
  }

  // Saturday rule
  if (isSaturday) {
    const satDay = carpark.rates.saturdayDay;
    const satEve = carpark.rates.saturdayEvening;
    const eveningCutoff = 18.0;

    if (startDecimal >= eveningCutoff) {
      const perEntry = satEve.perEntryRate ?? (satEve.ratePerHour ? satEve.ratePerHour * durationHours : 3.50);
      totalCost = perEntry;
      breakdown.push(`Saturday evening per-entry (after 18:00): $${perEntry.toFixed(2)}`);
    } else if (endDecimal <= eveningCutoff) {
      const hourly = satDay.ratePerHour ?? (satDay.ratePerMinute ? satDay.ratePerMinute * 60 : 3.0);
      totalCost = durationHours * hourly;
      breakdown.push(`Saturday daytime (${durationHours.toFixed(1)}h @ $${hourly.toFixed(2)}/h): $${totalCost.toFixed(2)}`);
    } else {
      const dayHours = eveningCutoff - startDecimal;
      const hourly = satDay.ratePerHour ?? 3.0;
      const dayCost = dayHours * hourly;
      const perEntry = satEve.perEntryRate ?? 3.50;
      totalCost = dayCost + perEntry;
      breakdown.push(`Saturday day (${dayHours.toFixed(1)}h): $${dayCost.toFixed(2)}`);
      breakdown.push(`Saturday evening entry: $${perEntry.toFixed(2)}`);
    }
    return { totalCost, breakdown };
  }

  // Weekday rules (Mon - Fri)
  const dayRule = carpark.rates.weekdayDay;
  const eveRule = carpark.rates.weekdayEvening;
  const eveningCutoff = carpark.id === 'bras-basah-complex' || carpark.id === 'fort-canning-ura' ? 17.0 : 18.0;

  if (carpark.id === 'bras-basah-complex') {
    // HDB Central rate: $1.20/hr (07:00-17:00), $0.60/30m (after 17:00 cap $5.00)
    if (startDecimal >= 17.0) {
      const eveningCost = Math.min(5.0, Math.ceil(durationHours * 2) * 0.60);
      totalCost = eveningCost;
      breakdown.push(`HDB evening rate capped at $5.00: $${totalCost.toFixed(2)}`);
    } else if (endDecimal <= 17.0) {
      totalCost = Math.ceil(durationHours * 2) * 0.60;
      breakdown.push(`HDB daytime (${durationHours.toFixed(1)}h @ $1.20/h): $${totalCost.toFixed(2)}`);
    } else {
      const dayHours = 17.0 - startDecimal;
      const dayCost = Math.ceil(dayHours * 2) * 0.60;
      const eveHours = endDecimal - 17.0;
      const eveCost = Math.min(5.0, Math.ceil(eveHours * 2) * 0.60);
      totalCost = dayCost + eveCost;
      breakdown.push(`Daytime (${dayHours.toFixed(1)}h @ $1.20/h): $${dayCost.toFixed(2)}`);
      breakdown.push(`Evening rate: $${eveCost.toFixed(2)}`);
    }
    return { totalCost, breakdown };
  }

  // Standard carparks (SMU, Raffles City, Plaza Sing, etc.)
  if (startDecimal >= eveningCutoff) {
    // Flat per entry in evening
    const perEntry = eveRule.perEntryRate ?? (eveRule.ratePerHour ? eveRule.ratePerHour * durationHours : 3.50);
    totalCost = perEntry;
    breakdown.push(`Evening flat entry (after 18:00): $${perEntry.toFixed(2)}`);
  } else if (endDecimal <= eveningCutoff) {
    const hourly = dayRule.ratePerHour ?? (dayRule.ratePerMinute ? dayRule.ratePerMinute * 60 : 3.0);
    totalCost = durationHours * hourly;
    breakdown.push(`Daytime parking (${durationHours.toFixed(1)}h @ $${hourly.toFixed(2)}/h): $${totalCost.toFixed(2)}`);
  } else {
    // Crosses over 18:00
    const dayHours = eveningCutoff - startDecimal;
    const hourly = dayRule.ratePerHour ?? 3.0;
    const dayCost = dayHours * hourly;
    const perEntry = eveRule.perEntryRate ?? 3.50;
    totalCost = dayCost + perEntry;
    breakdown.push(`Daytime until 18:00 (${dayHours.toFixed(1)}h @ $${hourly.toFixed(2)}/h): $${dayCost.toFixed(2)}`);
    breakdown.push(`Evening flat entry: $${perEntry.toFixed(2)}`);
  }

  return { totalCost, breakdown };
}

/**
 * Fuel/Power cost per km based on vehicle type
 */
export function getVehicleRunningCostPerKm(vehicleType: 'petrol' | 'hybrid' | 'ev' | 'motorcycle'): number {
  switch (vehicleType) {
    case 'petrol':
      return 0.24; // ~12 km/L @ $2.88/L
    case 'hybrid':
      return 0.14; // ~20 km/L
    case 'ev':
      return 0.06; // ~16 kWh/100km @ $0.36/kWh
    case 'motorcycle':
      return 0.08;
    default:
      return 0.24;
  }
}

/**
 * Determine if arrival time hits Singapore ERP peak
 */
export function getApplicableErpCost(arrivalDate: Date, origin: TransitOrigin): number {
  const day = arrivalDate.getDay();
  if (day === 0) return 0; // No ERP on Sunday
  const hour = arrivalDate.getHours();
  const minute = arrivalDate.getMinutes();
  const timeVal = hour + minute / 60;

  // Morning peak 08:00 - 09:30 CTE / Orchard / CBD
  if (timeVal >= 8.0 && timeVal <= 9.5) {
    return origin.typicalErpPeak;
  }
  // Evening peak 17:30 - 19:30
  if (timeVal >= 17.5 && timeVal <= 19.5) {
    return origin.typicalErpPeak * 0.75;
  }
  return origin.typicalErpOffPeak;
}

/**
 * Calculate calculations and ranking for all carparks
 */
export function evaluateAllCarparks(
  carparks: Carpark[],
  preferences: CommutePreference,
  selectedSchoolId: string
): CarparkCostCalculation[] {
  const arrival = new Date(preferences.arrivalDateTime);

  const results: CarparkCostCalculation[] = carparks.map((carpark) => {
    const { totalCost, breakdown } = calculateCarparkParkingCost(
      carpark,
      arrival,
      preferences.parkingDurationHours
    );

    const walkMinutes = carpark.walkMinutesToSchool[selectedSchoolId] ?? 5;
    const occupancy = carpark.totalLots > 0
      ? Math.round(((carpark.totalLots - carpark.availableLots) / carpark.totalLots) * 100)
      : 80;

    let risk: 'low' | 'moderate' | 'high' | 'full' = 'low';
    if (carpark.availableLots <= 0) risk = 'full';
    else if (carpark.availableLots < 15) risk = 'high';
    else if (carpark.availableLots < 40) risk = 'moderate';
    else risk = 'low';

    const badges: string[] = [];

    // Assign badges
    if (carpark.id === 'bras-basah-complex') badges.push('Cheapest Rate');
    if (walkMinutes <= 2) badges.push('Closest Walk');
    if (carpark.availableLots > 100) badges.push('High Availability');
    if (carpark.isSheltered) badges.push('Covered Walkway');
    if (carpark.hasEVCharging) badges.push('EV Ready');

    // Composite ranking score (lower is better)
    // Weight factors: Cost (40%), Walk time (30%), Availability risk (30%)
    let riskPenalty = 0;
    if (risk === 'full') riskPenalty = 100;
    if (risk === 'high') riskPenalty = 40;
    if (risk === 'moderate') riskPenalty = 10;

    const score = totalCost * 2.5 + walkMinutes * 3.5 + riskPenalty;

    return {
      carpark,
      totalCost,
      effectiveHourlyRate: totalCost / preferences.parkingDurationHours,
      isAvailable: carpark.availableLots > 0,
      lotsAvailable: carpark.availableLots,
      occupancyPercent: Math.min(100, Math.max(0, occupancy)),
      availabilityRisk: risk,
      walkTimeToSelectedSchool: walkMinutes,
      shelteredWalk: carpark.isSheltered,
      costBreakdown: breakdown,
      badges,
      overallScore: score,
    };
  });

  // Sort by overall composite score ascending
  return results.sort((a, b) => a.overallScore - b.overallScore);
}

/**
 * Formulate final verdict between Bus and Driving
 */
export function generateCommuteVerdict(
  origin: TransitOrigin,
  preferences: CommutePreference,
  evaluatedCarparks: CarparkCostCalculation[]
): CommuteVerdict {
  const arrival = new Date(preferences.arrivalDateTime);
  const hour = arrival.getHours();
  const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

  // Bus calculation
  const busFareOneWay = preferences.userType === 'student'
    ? origin.busFareStudent
    : origin.busFareAdult;
  const busTotalCost = busFareOneWay * 2; // Round trip

  let busTravelOneWay = isPeak ? origin.busTravelTimeMins.peak : origin.busTravelTimeMins.offPeak;
  if (preferences.weatherCondition === 'rain') {
    busTravelOneWay += 8; // Rain slow down
  }
  const busTotalTimeMins = busTravelOneWay + origin.busWalkMins;

  // Best carpark
  const primaryCarpark = evaluatedCarparks[0] || {
    carpark: {} as Carpark,
    totalCost: 12,
    walkTimeToSelectedSchool: 3,
    availabilityRisk: 'low',
    lotsAvailable: 50,
  } as CarparkCostCalculation;

  const alternateCarpark = evaluatedCarparks[1];

  // Drive calculation
  const runningCostPerKm = getVehicleRunningCostPerKm(preferences.vehicleType);
  const fuelCostRoundTrip = origin.distanceKm * 2 * runningCostPerKm;
  const erpCost = getApplicableErpCost(arrival, origin);
  const driveTotalCost = fuelCostRoundTrip + erpCost + primaryCarpark.totalCost;

  let driveTravelOneWay = isPeak ? origin.driveTimeMins.peak : origin.driveTimeMins.offPeak;
  if (preferences.weatherCondition === 'rain') {
    driveTravelOneWay += 6;
  }
  // Drive total time includes drive + finding lot + walking to school
  let parkingDelayMins = 3;
  if (primaryCarpark.availabilityRisk === 'high') parkingDelayMins = 8;
  if (primaryCarpark.availabilityRisk === 'full') parkingDelayMins = 15;

  const driveTotalTimeMins = driveTravelOneWay + parkingDelayMins + primaryCarpark.walkTimeToSelectedSchool;

  const costDifference = driveTotalCost - busTotalCost;
  const timeDifferenceMins = busTotalTimeMins - driveTotalTimeMins; // positive means driving is faster

  // Decision logic
  // Monetize time difference using user's hourly value
  const hourlyValue = preferences.valuePerHourOfTime || 15;
  const monetizedTimeSavedByDriving = (timeDifferenceMins / 60) * hourlyValue;
  const netDriveBenefit = monetizedTimeSavedByDriving - costDifference;

  let recommendation: 'BUS' | 'DRIVE' | 'TOSS_UP' = 'BUS';
  let title = '';
  let summary = '';

  if (primaryCarpark.availabilityRisk === 'full') {
    recommendation = 'BUS';
    title = 'Take the Bus (Carparks are at Critical Occupancy)';
    summary = `Nearby carparks have nearly 0 available lots. The hassle of queuing for parking negates driving speed. Take ${origin.recommendedBusRoute.split(' ')[0]} ${origin.recommendedBusRoute.split(' ')[1]} directly to SMU and save $${costDifference.toFixed(2)}.`;
  } else if (preferences.weatherCondition === 'rain' && timeDifferenceMins >= 15) {
    recommendation = 'DRIVE';
    title = `Drive & Park at ${primaryCarpark.carpark.shortLabel} (Rain Advantage)`;
    summary = `Due to tropical rain, sheltered driving saves you ~${timeDifferenceMins} mins and avoids wet walking. Best option: ${primaryCarpark.carpark.name} (${primaryCarpark.lotsAvailable} lots open).`;
  } else if (costDifference > 18 && timeDifferenceMins < 20) {
    recommendation = 'BUS';
    title = `Take the Bus (Save $${costDifference.toFixed(2)})`;
    summary = `Bus is significantly more cost-effective. You save $${costDifference.toFixed(2)} round-trip while driving only saves ~${Math.max(5, timeDifferenceMins)} mins after parking and walking.`;
  } else if (netDriveBenefit > 5 && primaryCarpark.availabilityRisk !== 'high') {
    recommendation = 'DRIVE';
    title = `Drive & Park at ${primaryCarpark.carpark.shortLabel}`;
    summary = `Driving saves you ~${timeDifferenceMins} mins. ${primaryCarpark.carpark.shortLabel} offers ${primaryCarpark.lotsAvailable} available lots and is just a ${primaryCarpark.walkTimeToSelectedSchool}-min walk to your SMU school.`;
  } else if (costDifference < 8 && timeDifferenceMins >= 25) {
    recommendation = 'DRIVE';
    title = `Drive & Park at ${primaryCarpark.carpark.shortLabel}`;
    summary = `Driving is over ${timeDifferenceMins} minutes faster from ${origin.name} with minimal price premium. Recommended lot: ${primaryCarpark.carpark.shortLabel}.`;
  } else {
    recommendation = 'BUS';
    title = `Take the Bus (Balanced & Stress-Free)`;
    summary = `Taking the bus costs only $${busTotalCost.toFixed(2)} round-trip compared to $${driveTotalCost.toFixed(2)} for driving, avoiding CBD congestion and carpark hunt.`;
  }

  const keyFactors = [
    {
      label: 'Round-Trip Cost',
      busDetail: `$${busTotalCost.toFixed(2)} (Fare only)`,
      driveDetail: `$${driveTotalCost.toFixed(2)} ($${primaryCarpark.totalCost.toFixed(2)} park + $${fuelCostRoundTrip.toFixed(2)} fuel + $${erpCost.toFixed(2)} ERP)`,
      winner: (costDifference > 0 ? 'BUS' : 'DRIVE') as 'BUS' | 'DRIVE' | 'TIE',
    },
    {
      label: 'One-Way Travel Time',
      busDetail: `${busTotalTimeMins} mins (${busTravelOneWay}m ride + ${origin.busWalkMins}m walk)`,
      driveDetail: `${driveTotalTimeMins} mins (${driveTravelOneWay}m drive + ${parkingDelayMins + primaryCarpark.walkTimeToSelectedSchool}m park/walk)`,
      winner: (timeDifferenceMins > 8 ? 'DRIVE' : timeDifferenceMins < -5 ? 'BUS' : 'TIE') as 'BUS' | 'DRIVE' | 'TIE',
    },
    {
      label: 'Parking & Lot Hassle',
      busDetail: 'Zero parking stress. Drops right at SMU Stamford / Bras Basah stops.',
      driveDetail: `${primaryCarpark.lotsAvailable} lots at ${primaryCarpark.carpark.shortLabel} (${primaryCarpark.availabilityRisk} risk).`,
      winner: (primaryCarpark.availabilityRisk === 'low' ? 'TIE' : 'BUS') as 'BUS' | 'DRIVE' | 'TIE',
    },
    {
      label: 'Weather Impact',
      busDetail: preferences.weatherCondition === 'rain' ? 'Subject to wet walk between bus stops.' : 'Comfortable sheltered walkway available.',
      driveDetail: primaryCarpark.shelteredWalk ? 'Fully sheltered basement parking to SMU concourse.' : 'Exposed walk from carpark to school.',
      winner: (preferences.weatherCondition === 'rain' && primaryCarpark.shelteredWalk ? 'DRIVE' : 'TIE') as 'BUS' | 'DRIVE' | 'TIE',
    },
  ];

  return {
    recommendation,
    title,
    summary,
    busTotalCost,
    busTotalTimeMins,
    driveTotalCost,
    driveTotalTimeMins,
    costDifference,
    timeDifferenceMins,
    primaryCarpark,
    alternateCarpark,
    weatherImpactNote: preferences.weatherCondition === 'rain'
      ? 'Tropical rain slows traffic by ~15-20% and makes waiting at unsheltered bus stops less pleasant.'
      : undefined,
    keyFactors,
  };
}
