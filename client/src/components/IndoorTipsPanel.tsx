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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
      {/* Smog-smart routines */}
      <div className="luxury-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-slate-900 text-base tracking-tight">
            Exposure-Minimizing Commute Protocol
          </h4>
        </div>
        <ul className="space-y-3">
          {routineSuggestions.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-700 bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3"
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
      <div className="luxury-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-teal-600" />
          <h4 className="font-extrabold text-slate-900 text-base tracking-tight">
            Indoor Air &amp; Micro-Climate Safeguards
          </h4>
        </div>
        <ul className="space-y-3">
          {indoorTips.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-700 bg-teal-50/60 border border-teal-200/80 rounded-xl p-3.5 flex items-start gap-3"
            >
              <div className="p-1 rounded-md bg-teal-100 text-teal-700 shrink-0 mt-0.5">
                <Fan className="w-3.5 h-3.5" />
              </div>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
