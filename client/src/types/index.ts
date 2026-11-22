export type PollutantId = "pm2_5" | "pm10" | "no2" | "so2" | "o3" | "co";

export type Category =
  | "Good"
  | "Satisfactory"
  | "Moderately Polluted"
  | "Poor"
  | "Very Poor"
  | "Severe";

export interface PollutantReading {
  pollutant: PollutantId;
  concentration: number;
  unit: "µg/m³" | "mg/m³";
  subIndex: number;
  category: Category;
}

export interface AqiResponse {
  city: string;
  lat: number;
  lon: number;
  aqi: number;
  category: Category;
  prominentPollutant: PollutantId;
  pollutants: PollutantReading[];
  timestamp: string;
  dataNote: string;
}

export type FamilyRole =
  | "infant"
  | "child"
  | "adult"
  | "senior"
  | "pregnant"
  | "asthmatic"
  | "cardiac";

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
}

export interface FamilyProfile {
  members: FamilyMember[];
}

export type ActivityType =
  | "car"
  | "bike"
  | "autorickshaw"
  | "metro"
  | "walk"
  | "wfh";

export interface RoutineChoice {
  activityType: ActivityType;
  durationMinutes: number;
  distanceKm?: number;
}

export interface IndoorContext {
  hasAirPurifier: boolean;
  hasPlants: boolean;
  ventilationType: "none" | "natural" | "mechanical";
}

export interface Co2Estimate {
  baselineKgPerDay: number;
  optimisedKgPerDay: number;
  savedKgPerDay: number;
  savedKgPerYear: number;
  equivalentTreeDays: number;
  annualTreeYears?: number;
  percentReduction?: number;
  sourceLabel: string;
}

export interface AdviceInputSnapshot {
  city: string;
  lat: number;
  lon: number;
  aqi: number;
  category: Category;
  prominentPollutant: PollutantId;
  pollutants: PollutantReading[];
  members: FamilyMember[];
  routineChoices: RoutineChoice[];
  generatedAt: string;
}

export interface MemberAdvice {
  memberId: string;
  memberName: string;
  healthImpact: string;
  personalTips: string[];
}

export interface AdviceResponse {
  memberAdvice: MemberAdvice[];
  routineSuggestions: string[];
  indoorTips: string[];
  co2Estimate: Co2Estimate;
  generatedAt: string;
}
