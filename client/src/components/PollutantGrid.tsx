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
      <div className="flex items-center gap-2 mb-3">
        <Wind className="w-5 h-5 text-slate-600" />
        <h3 className="font-bold text-slate-800 text-lg">CPCB Pollutant Breakdown</h3>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
          6 Key Parameters
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutants.map((p) => {
          const theme = AQI_CATEGORY_THEMES[p.category];
          const name = POLLUTANT_NAMES[p.pollutant];

          return (
            <div
              key={p.pollutant}
              className={`rounded-xl border ${theme.border} bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="text-xs font-semibold text-slate-500 truncate" title={name}>
                {name}
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {p.concentration.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">{p.unit}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-700">
                    {p.subIndex}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Sub-index</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.badge}`}>
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
