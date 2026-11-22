import React from "react";
import type { AqiResponse } from "../types/index.js";
import { AQI_CATEGORY_THEMES, POLLUTANT_NAMES } from "../utils/aqiColors.js";
import { Activity, AlertCircle, ShieldCheck, Clock, Gauge } from "lucide-react";

interface AqiGaugeProps {
  data: AqiResponse;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({ data }) => {
  const theme = AQI_CATEGORY_THEMES[data.category] || AQI_CATEGORY_THEMES["Moderately Polluted"];
  const prominent = POLLUTANT_NAMES[data.prominentPollutant] || data.prominentPollutant;

  // Percentage for spectrum needle (capped at 500)
  const aqiPercentage = Math.min(100, Math.max(0, (data.aqi / 500) * 100));

  return (
    <div className="luxury-hero rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
            >
              {data.category}
            </span>

            <span className="text-xs text-slate-700 font-medium bg-slate-100 border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.accent }}
              />
              Prominent Pollutant: <strong className="text-slate-900 font-semibold">{prominent}</strong>
            </span>

            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-600 shrink-0" />
            Estimated AQI (CPCB method, hourly model data) for {data.city}
          </h2>

          <p className="text-sm mt-2 text-slate-600 max-w-2xl leading-relaxed">
            {theme.advisory}
          </p>
        </div>

        {/* Clean Minimalist Score Card */}
        <div className="luxury-card rounded-2xl p-5 sm:px-7 sm:py-5 flex flex-col items-center justify-center min-w-[170px] shrink-0 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-0.5">
            <Gauge className="w-3 h-3 text-emerald-600" /> CPCB AQI
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className="text-5xl sm:text-6xl font-black tracking-tight"
              style={{ color: theme.accent }}
            >
              {data.aqi}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 500</span>
          </div>
          <span
            className="text-[11px] font-extrabold uppercase tracking-wider mt-1"
            style={{ color: theme.accent }}
          >
            {theme.label}
          </span>
        </div>
      </div>

      {/* Clean Gradient Spectrum Bar */}
      <div className="mt-8">
        <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-2">
          <span>0 Good</span>
          <span>100 Sat.</span>
          <span>200 Mod.</span>
          <span>300 Poor</span>
          <span>400 V.Poor</span>
          <span>500 Severe</span>
        </div>

        <div className="h-2.5 w-full bg-slate-100 rounded-full relative overflow-visible">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              background: "linear-gradient(90deg, #10b981 0%, #84cc16 20%, #f59e0b 40%, #ea580c 60%, #e11d48 80%, #991b1b 100%)",
              width: `${aqiPercentage}%`,
            }}
          />
          {/* Subtle position marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-5 rounded-full border-2 border-white bg-slate-900 shadow-md transition-all duration-700 ease-out"
            style={{ left: `${aqiPercentage}%`, backgroundColor: theme.accent }}
          />
        </div>
      </div>

      {/* Technical Methodology Strip */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          {data.aqi <= 100 ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>
            Linear interpolation formula:{" "}
            <code className="text-slate-700 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
              I = ((I_hi - I_lo) / (C_hi - C_lo)) * (C - C_lo) + I_lo
            </code>
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          O₃ &amp; CO use 8-hr rolling window standards
        </span>
      </div>
    </div>
  );
};
