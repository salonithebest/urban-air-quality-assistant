import React from "react";
import type { PollutantReading } from "../types/index.js";
import { AQI_CATEGORY_THEMES, POLLUTANT_NAMES } from "../utils/aqiColors.js";
import { Wind } from "lucide-react";

interface PollutantGridProps {
  pollutants: PollutantReading[];
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-emerald-400" />
          <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
            CPCB Pollutant Concentrations &amp; Sub-Indices
          </h3>
          <span className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
            {pollutants.length} Parameters
          </span>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Sub-index &gt; 100 exceeds national ambient standard
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {pollutants.map((p) => {
          const theme = AQI_CATEGORY_THEMES[p.category] || AQI_CATEGORY_THEMES["Moderately Polluted"];
          const name = POLLUTANT_NAMES[p.pollutant] || p.pollutant;
          const displayConc =
            p.concentration !== null && p.concentration !== undefined && !isNaN(p.concentration)
              ? p.concentration.toFixed(1)
              : "N/A";
          const displaySubIndex =
            p.subIndex !== null && p.subIndex !== undefined && !isNaN(p.subIndex)
              ? p.subIndex
              : "—";

          return (
            <div
              key={p.pollutant}
              className="cyber-panel rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-200">
                    {name}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {displayConc}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {p.unit}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-base font-black"
                      style={{ color: theme.accent }}
                    >
                      {displaySubIndex}
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                      Sub-Index
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800">
                <span
                  className="text-[10px] font-extrabold block truncate uppercase tracking-wider"
                  style={{ color: theme.accent }}
                >
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
