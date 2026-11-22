import React from "react";
import type { AqiResponse } from "../types/index.js";
import { AQI_CATEGORY_THEMES, POLLUTANT_NAMES } from "../utils/aqiColors.js";
import { Activity, Clock, Gauge } from "lucide-react";

interface AqiGaugeProps {
  data: AqiResponse;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({ data }) => {
  const theme = AQI_CATEGORY_THEMES[data.category] || AQI_CATEGORY_THEMES["Moderately Polluted"];
  const prominent = POLLUTANT_NAMES[data.prominentPollutant] || data.prominentPollutant;

  // Percentage for spectrum needle (capped at 500)
  const aqiPercentage = Math.min(100, Math.max(0, (data.aqi / 500) * 100));

  return (
    <div className="cyber-panel-glow rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="flex-1">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
            <span
              className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm"
              style={{
                backgroundColor: `${theme.accent}20`,
                color: theme.accent,
                borderColor: `${theme.accent}60`,
              }}
            >
              {data.category}
            </span>

            <span className="text-xs text-slate-300 font-semibold bg-slate-900/80 border border-slate-700/80 px-3 py-1 rounded-full flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: theme.accent }}
              />
              Prominent Pollutant: <strong className="text-white font-bold">{prominent}</strong>
            </span>

            <span className="text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Estimated AQI (CPCB method, hourly model data) for {data.city}</span>
          </h2>

          <p className="text-sm mt-2.5 text-slate-300 max-w-2xl leading-relaxed font-normal">
            {theme.advisory}
          </p>
        </div>

        {/* CPCB Score Display */}
        <div className="cyber-panel rounded-2xl p-5 sm:px-8 sm:py-6 flex flex-col items-center justify-center min-w-[190px] shrink-0 border border-emerald-500/30 relative">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" /> CPCB AQI
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-5xl sm:text-6xl font-black tracking-tight"
              style={{ color: theme.accent }}
            >
              {data.aqi}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 500</span>
          </div>
          <span
            className="text-xs font-black uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${theme.accent}20`,
              color: theme.accent,
            }}
          >
            {theme.label}
          </span>
        </div>
      </div>

      {/* Gradient Spectrum Bar with active indicator */}
      <div className="mt-8 relative z-10">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
          <span className="text-emerald-400">0 Good</span>
          <span className="text-cyan-400">100 Sat.</span>
          <span className="text-amber-400">200 Mod.</span>
          <span className="text-orange-400">300 Poor</span>
          <span className="text-rose-400">400 V.Poor</span>
          <span className="text-red-500">500 Severe</span>
        </div>

        {/* Gradient bar track */}
        <div className="relative h-3 w-full rounded-full overflow-visible bg-slate-800">
          <div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #10b981 0%, #06b6d4 20%, #f59e0b 40%, #f97316 60%, #ef4444 80%, #991b1b 100%)",
            }}
          />

          {/* Indicator Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-500"
            style={{ left: `${aqiPercentage}%` }}
          />
        </div>

        {/* Linear interpolation note */}
        <div className="mt-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">ℹ Formula:</span> Linear interpolation: I = ((I_hi - I_lo) / (C_hi - C_lo)) * (C - C_lo) + I_lo
          </span>
          <span className="text-slate-500 mt-1 sm:mt-0 font-mono">
            O₃ &amp; CO use 8-hr rolling window standards
          </span>
        </div>
      </div>
    </div>
  );
};
