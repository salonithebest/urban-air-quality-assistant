/**
 * @file PollutantGrid.tsx
 * @description Accessible 6-criteria pollutant micro-card grid.
 * Displays real-time measured concentrations and corresponding CPCB sub-indices.
 */

import React from "react";
import type { PollutantReading } from "../types/index.js";
import { AQI_CATEGORY_THEMES, POLLUTANT_NAMES } from "../utils/aqiColors.js";
import { Wind } from "lucide-react";

interface PollutantGridProps {
  pollutants: PollutantReading[];
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  return (
    <section className="mb-6" role="region" aria-label="CPCB Criteria Pollutant Concentrations and Sub-Indices">
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
            CPCB Pollutant Concentrations &amp; Sub-Indices
          </h3>
          <span className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold">
            {pollutants.length} Parameters
          </span>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Sub-index &gt; 100 exceeds national ambient standard
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5" role="list">
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
              role="listitem"
              aria-label={`${name}: ${displayConc} ${p.unit}, sub-index ${displaySubIndex}, status ${p.category}`}
              className="glass-card rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-800">
                    {name}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {displayConc}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">
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

              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <span
                  className="text-[10px] font-black block truncate uppercase tracking-wider"
                  style={{ color: theme.accent }}
                >
                  {p.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
