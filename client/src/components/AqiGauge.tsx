import React from "react";
import type { AqiResponse } from "../types/index.js";
import { AQI_CATEGORY_THEMES, POLLUTANT_NAMES } from "../utils/aqiColors.js";
import { Activity, AlertTriangle, ShieldCheck, Clock, Gauge } from "lucide-react";

interface AqiGaugeProps {
  data: AqiResponse;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({ data }) => {
  const theme = AQI_CATEGORY_THEMES[data.category] || AQI_CATEGORY_THEMES["Moderately Polluted"];
  const prominent = POLLUTANT_NAMES[data.prominentPollutant] || data.prominentPollutant;

  // Percentage for spectrum needle (capped at 500)
  const aqiPercentage = Math.min(100, Math.max(0, (data.aqi / 500) * 100));

  return (
    <div
      className={`glass-panel rounded-3xl p-6 sm:p-8 mb-6 border ${theme.border} relative overflow-hidden transition-all duration-500`}
      style={{
        boxShadow: `0 20px 40px -15px ${theme.glow}, 0 0 0 1px rgba(255, 255, 255, 0.05)`,
      }}
    >
      {/* Background ambient lighting */}
      <div
        className={`absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br ${theme.bg} rounded-full blur-3xl pointer-events-none opacity-60`}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="flex-1">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${theme.badge} shadow-sm backdrop-blur-md`}
            >
              {data.category}
            </span>
            <span className="text-xs text-slate-300 font-medium glass-card px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Prominent: <strong className="text-slate-100 font-semibold">{prominent}</strong>
            </span>
            <span className="text-xs text-slate-400 glass-card px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <Activity className={`w-7 h-7 ${theme.text}`} />
            Estimated AQI (CPCB method, hourly model data) for {data.city}
          </h2>

          <p className="text-sm mt-2 text-slate-300 max-w-2xl leading-relaxed font-normal">
            {theme.advisory}
          </p>
        </div>

        {/* AQI Numeric Glass Orb */}
        <div className="relative group shrink-0">
          <div
            className="absolute -inset-1 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500"
            style={{ backgroundColor: theme.badgeHex }}
          />
          <div className="relative glass-card border border-white/10 rounded-3xl px-7 py-5 flex flex-col items-center justify-center min-w-[170px]">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-0.5">
              <Gauge className="w-3 h-3 text-emerald-400" /> CPCB Index
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black tracking-tight text-white drop-shadow-md">
                {data.aqi}
              </span>
              <span className="text-xs font-bold text-slate-400">/500</span>
            </div>
            <span className={`text-[11px] font-extrabold uppercase tracking-wider mt-1 ${theme.text}`}>
              {theme.label}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Spectrum Needle Bar */}
      <div className="mt-8 relative z-10">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
          <span className="text-emerald-400">0 Good</span>
          <span className="text-lime-400">100 Sat.</span>
          <span className="text-amber-400">200 Mod.</span>
          <span className="text-orange-400">300 Poor</span>
          <span className="text-rose-400">400 V.Poor</span>
          <span className="text-red-500">500 Severe</span>
        </div>

        <div className="h-3 w-full bg-slate-900/80 rounded-full p-0.5 border border-white/10 relative overflow-visible shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              background: "linear-gradient(90deg, #10b981 0%, #84cc16 20%, #eab308 40%, #f97316 60%, #f43f5e 80%, #b91c1c 100%)",
              width: `${aqiPercentage}%`,
            }}
          />
          {/* Glowing cursor pointer */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full border-2 border-white bg-slate-900 shadow-lg transition-all duration-1000 ease-out"
            style={{ left: `${aqiPercentage}%`, borderColor: theme.badgeHex }}
          />
        </div>
      </div>

      {/* Bottom context notice */}
      <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          {data.aqi <= 100 ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>
            Computed strictly via standard CPCB segmented linear interpolation:{" "}
            <code className="text-slate-300 font-mono text-[11px]">I = ((I_hi - I_lo)/(C_hi - C_lo)) * (C - C_lo) + I_lo</code>
          </span>
        </div>
      </div>
    </div>
  );
};
