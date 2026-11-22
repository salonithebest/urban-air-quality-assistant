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
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
            CPCB Pollutant Concentrations &amp; Sub-Indices
          </h3>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
            6 Parameters
          </span>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Sub-index &gt; 100 exceeds national ambient standard
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutants.map((p) => {
          const theme = AQI_CATEGORY_THEMES[p.category] || AQI_CATEGORY_THEMES["Moderately Polluted"];
          const name = POLLUTANT_NAMES[p.pollutant] || p.pollutant;

          return (
            <div
              key={p.pollutant}
              className="luxury-card rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    {name}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      {p.concentration.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {p.unit}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-base font-extrabold"
                      style={{ color: theme.accent }}
                    >
                      {p.subIndex}
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase font-semibold">
                      Sub-Index
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
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
