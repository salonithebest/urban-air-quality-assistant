import type { Category, PollutantId } from "../types/index.js";

export interface AqiTheme {
  accent: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  lightBg: string;
  cardBorder: string;
  label: string;
  advisory: string;
}

export const AQI_CATEGORY_THEMES: Record<Category, AqiTheme> = {
  Good: {
    accent: "#059669", // emerald 600
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    lightBg: "bg-emerald-50/40",
    cardBorder: "border-emerald-200/60",
    label: "Good (0–50)",
    advisory: "Air quality is pristine. Perfect for all outdoor exercises, children's activities, and open ventilation.",
  },
  Satisfactory: {
    accent: "#65a30d", // lime 600
    badgeBg: "bg-lime-50",
    badgeText: "text-lime-800",
    badgeBorder: "border-lime-200",
    lightBg: "bg-lime-50/40",
    cardBorder: "border-lime-200/60",
    label: "Satisfactory (51–100)",
    advisory: "Minor breathing discomfort to sensitive individuals. Generally safe for regular household routines.",
  },
  "Moderately Polluted": {
    accent: "#d97706", // amber 600
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    lightBg: "bg-amber-50/40",
    cardBorder: "border-amber-200/60",
    label: "Moderate (101–200)",
    advisory: "Noticeable breathing discomfort to family members with asthma, cardiac, or respiratory conditions.",
  },
  Poor: {
    accent: "#ea580c", // orange 600
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-800",
    badgeBorder: "border-orange-200",
    lightBg: "bg-orange-50/40",
    cardBorder: "border-orange-200/60",
    label: "Poor (201–300)",
    advisory: "Breathing discomfort to most people upon prolonged exposure. Sensitive groups should stay indoors.",
  },
  "Very Poor": {
    accent: "#e11d48", // rose 600
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-800",
    badgeBorder: "border-rose-200",
    lightBg: "bg-rose-50/40",
    cardBorder: "border-rose-200/60",
    label: "Very Poor (301–400)",
    advisory: "Severe respiratory impact upon sustained exposure. Keep indoor air purifiers running and wear N95 outdoors.",
  },
  Severe: {
    accent: "#b91c1c", // red 700
    badgeBg: "bg-red-50",
    badgeText: "text-red-900",
    badgeBorder: "border-red-200",
    lightBg: "bg-red-50/40",
    cardBorder: "border-red-200/60",
    label: "Severe (401–500)",
    advisory: "Hazardous health alert. Impacts healthy adults and critically affects vulnerable individuals. Seal windows.",
  },
};

export const POLLUTANT_NAMES: Record<PollutantId, string> = {
  pm2_5: "PM₂.₅",
  pm10: "PM₁₀",
  no2: "NO₂ (Nitrogen)",
  so2: "SO₂ (Sulphur)",
  o3: "O₃ (Ozone)",
  co: "CO (Carbon)",
};
