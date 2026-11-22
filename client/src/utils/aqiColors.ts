import type { Category, PollutantId } from "../types/index.js";

export interface AqiTheme {
  bg: string;
  text: string;
  border: string;
  badge: string;
  label: string;
  advisory: string;
}

export const AQI_CATEGORY_THEMES: Record<Category, AqiTheme> = {
  Good: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
    badge: "bg-emerald-600 text-white",
    label: "Good (0–50)",
    advisory: "Minimal impact. Clean air ideal for all outdoor activities.",
  },
  Satisfactory: {
    bg: "bg-lime-50",
    text: "text-lime-700",
    border: "border-lime-300",
    badge: "bg-lime-600 text-white",
    label: "Satisfactory (51–100)",
    advisory: "Minor breathing discomfort to sensitive people.",
  },
  "Moderately Polluted": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    badge: "bg-amber-500 text-white",
    label: "Moderate (101–200)",
    advisory: "Breathing discomfort to people with lungs, asthma and heart diseases.",
  },
  Poor: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-300",
    badge: "bg-orange-500 text-white",
    label: "Poor (201–300)",
    advisory: "Breathing discomfort to most people on prolonged exposure.",
  },
  "Very Poor": {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-300",
    badge: "bg-rose-600 text-white",
    label: "Very Poor (301–400)",
    advisory: "Respiratory illness on prolonged exposure. Severe effect on people with heart disease.",
  },
  Severe: {
    bg: "bg-red-100",
    text: "text-red-950",
    border: "border-red-400",
    badge: "bg-red-800 text-white",
    label: "Severe (401–500)",
    advisory: "Affects healthy people and seriously impacts those with existing diseases. Stay indoors.",
  },
};

export const POLLUTANT_NAMES: Record<PollutantId, string> = {
  pm2_5: "PM₂.₅",
  pm10: "PM₁₀",
  no2: "Nitrogen Dioxide (NO₂)",
  so2: "Sulphur Dioxide (SO₂)",
  o3: "Ozone (O₃)",
  co: "Carbon Monoxide (CO)",
};
