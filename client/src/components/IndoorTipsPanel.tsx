import React from "react";
import { Sparkles, Home, Fan } from "lucide-react";

interface IndoorTipsPanelProps {
  routineSuggestions: string[];
  indoorTips: string[];
}

export const IndoorTipsPanel: React.FC<IndoorTipsPanelProps> = ({
  routineSuggestions,
  indoorTips,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Smog-smart routines */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h4 className="font-bold text-slate-800 text-base">
            Low-Emission Commute Routines
          </h4>
        </div>
        <ul className="space-y-2.5">
          {routineSuggestions.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-700 bg-amber-50/60 border border-amber-100/80 rounded-xl p-3 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Indoor air quality */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-5 h-5 text-teal-600" />
          <h4 className="font-bold text-slate-800 text-base">
            Indoor Air & Ventilation Tips
          </h4>
        </div>
        <ul className="space-y-2.5">
          {indoorTips.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-700 bg-teal-50/60 border border-teal-100/80 rounded-xl p-3 flex items-start gap-2.5"
            >
              <Fan className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
