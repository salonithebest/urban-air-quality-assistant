import React from "react";
import type { AqiResponse } from "../types/index.js";
import { AQI_CATEGORY_THEMES, POLLUTANT_NAMES } from "../utils/aqiColors.js";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";

interface AqiGaugeProps {
  data: AqiResponse;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({ data }) => {
  const theme = AQI_CATEGORY_THEMES[data.category] || AQI_CATEGORY_THEMES["Moderately Polluted"];
  const prominent = POLLUTANT_NAMES[data.prominentPollutant] || data.prominentPollutant;

  // Percentage for progress bar (max 500)
  const aqiPercentage = Math.min(100, Math.max(0, (data.aqi / 500) * 100));

  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-6 shadow-sm transition-all mb-6`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
              {data.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Prominent Pollutant: <strong className="text-slate-800">{prominent}</strong>
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-slate-700" />
            Estimated AQI (CPCB method, hourly model data) for {data.city}
          </h2>
          <p className="text-sm mt-1 text-slate-600 max-w-xl">
            {theme.advisory}
          </p>
        </div>

        {/* AQI Score Display */}
        <div className="flex items-baseline gap-2 bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl px-6 py-4 shadow-inner">
          <span className="text-5xl font-black tracking-tight text-slate-900">
            {data.aqi}
          </span>
          <span className="text-sm font-semibold text-slate-400 uppercase">
            / 500 AQI
          </span>
        </div>
      </div>

      {/* Visual spectrum bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
          <span>0 (Good)</span>
          <span>100 (Satisfactory)</span>
          <span>200 (Moderate)</span>
          <span>300 (Poor)</span>
          <span>400 (V. Poor)</span>
          <span>500 (Severe)</span>
        </div>
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-red-700 rounded-full transition-all duration-700"
            style={{ width: `${aqiPercentage}%` }}
          />
        </div>
      </div>

      {/* Health status badge */}
      <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-600">
        {data.aqi <= 100 ? (
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        )}
        <span>
          Based on CPCB National AQI linear interpolation math. Last updated: {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
        </span>
      </div>
    </div>
  );
};
