import type { Category, PollutantId } from "../types/index.js";

export interface AqiTheme {
  bg: string;
  glow: string;
  text: string;
  border: string;
  badge: string;
  badgeHex: string;
  label: string;
  advisory: string;
}

export const AQI_CATEGORY_THEMES: Record<Category, AqiTheme> = {
  Good: {
    bg: "from-emerald-950/40 via-emerald-900/20 to-transparent",
    glow: "rgba(16, 185, 129, 0.2)",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
    badgeHex: "#10b981",
    label: "Good (0–50)",
    advisory: "Air quality is exemplary. Ideal for outdoor athletics, children's play, and natural ventilation.",
  },
  Satisfactory: {
    bg: "from-lime-950/40 via-lime-900/20 to-transparent",
    glow: "rgba(132, 204, 22, 0.2)",
    text: "text-lime-400",
    border: "border-lime-500/30",
    badge: "bg-lime-500/20 text-lime-300 border border-lime-500/40",
    badgeHex: "#84cc16",
    label: "Satisfactory (51–100)",
    advisory: "Minor breathing irritation possible for sensitive individuals. Acceptable for general population.",
  },
  "Moderately Polluted": {
    bg: "from-amber-950/40 via-amber-900/20 to-transparent",
    glow: "rgba(245, 158, 11, 0.2)",
    text: "text-amber-400",
    border: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    badgeHex: "#f59e0b",
    label: "Moderate (101–200)",
    advisory: "Noticeable breathing discomfort for asthmatic, cardiac, senior, and pediatric household members.",
  },
  Poor: {
    bg: "from-orange-950/40 via-orange-900/20 to-transparent",
    glow: "rgba(249, 115, 22, 0.25)",
    text: "text-orange-400",
    border: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-300 border border-orange-500/40",
    badgeHex: "#f97316",
    label: "Poor (201–300)",
    advisory: "Breathing discomfort to most people upon prolonged exposure. Vulnerable groups must stay indoors.",
  },
  "Very Poor": {
    bg: "from-rose-950/50 via-rose-900/25 to-transparent",
    glow: "rgba(244, 63, 94, 0.3)",
    text: "text-rose-400",
    border: "border-rose-500/40",
    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
    badgeHex: "#f43f5e",
    label: "Very Poor (301–400)",
    advisory: "Significant respiratory illness risk on sustained exposure. Wear N95 outdoors; keep air purifiers active.",
  },
  Severe: {
    bg: "from-red-950/60 via-red-900/30 to-transparent",
    glow: "rgba(239, 68, 68, 0.4)",
    text: "text-red-400",
    border: "border-red-500/50",
    badge: "bg-red-500/30 text-red-200 border border-red-500/50",
    badgeHex: "#ef4444",
    label: "Severe (401–500)",
    advisory: "Critical health advisory: impacts healthy adults severely; hazardous to pre-existing conditions. Seal windows.",
  },
};

export const POLLUTANT_NAMES: Record<PollutantId, string> = {
  pm2_5: "PM₂.₅ (Fine Particulates)",
  pm10: "PM₁₀ (Coarse Dust)",
  no2: "Nitrogen Dioxide (NO₂)",
  so2: "Sulphur Dioxide (SO₂)",
  o3: "Ozone (O₃ - 8h Rolling)",
  co: "Carbon Monoxide (CO - 8h Rolling)",
};
