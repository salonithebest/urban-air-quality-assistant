import React from "react";
import type { PollutantReading } from "../types/index.js";
import { AQI_CATEGORY_THEMES, POLLUTANT_NAMES } from "../utils/aqiColors.js";
import { Wind, HelpCircle } from "lucide-react";

interface PollutantGridProps {
  pollutants: PollutantReading[];
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wind className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-100 text-lg tracking-tight">
            CPCB Pollutant Sub-Index Breakdown
          </h3>
          <span className="text-[11px] bg-slate-800 text-slate-300 border border-white/10 px-2 py-0.5 rounded-full font-semibold">
            6 Criteria Pollutants
          </span>
        </div>

        <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          Sub-index &gt; 100 triggers advisory
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutants.map((p) => {
          const theme = AQI_CATEGORY_THEMES[p.category] || AQI_CATEGORY_THEMES["Moderately Polluted"];
          const name = POLLUTANT_NAMES[p.pollutant] || p.pollutant;

          return (
            <div
              key={p.pollutant}
              className={`glass-card rounded-2xl p-4 flex flex-col justify-between border ${theme.border} group relative overflow-hidden`}
            >
              {/* Subtle top glow bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: theme.badgeHex }}
              />

              <div>
                <div className="text-[11px] font-bold text-slate-300 truncate mb-1" title={name}>
                  {p.pollutant.toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-400 truncate mb-3" title={name}>
                  {name.split("(")[0]?.trim()}
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-2xl font-black text-white tracking-tight">
                      {p.concentration.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1 font-medium">{p.unit}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-200">
                      {p.subIndex}
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">
                      Sub-Index
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${theme.badge}`}>
                  {p.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
