/**
 * @file IndoorTipsPanel.tsx
 * @description Accessible indoor air quality, filtration, and commute schedule mitigation panel.
 */

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6" role="region" aria-label="Indoor Air Quality and Commute Mitigation Directives">
      {/* Smog-smart routines */}
      <section className="glass-card rounded-3xl p-6 sm:p-7 shadow-xs" aria-label="Exposure-Minimizing Commute Protocol">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
            Exposure-Minimizing Commute Protocol
          </h4>
        </div>
        <ol className="space-y-3">
          {routineSuggestions.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs sm:text-sm text-slate-700 bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 font-medium leading-relaxed"
            >
              <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-2xs" aria-hidden="true">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Indoor air quality */}
      <section className="glass-card rounded-3xl p-6 sm:p-7 shadow-xs" aria-label="Indoor Air and Micro-Climate Safeguards">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-teal-600" aria-hidden="true" />
          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
            Indoor Air &amp; Micro-Climate Safeguards
          </h4>
        </div>
        <ul className="space-y-3">
          {indoorTips.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs sm:text-sm text-slate-700 bg-teal-50/70 border border-teal-200/90 rounded-2xl p-4 flex items-start gap-3.5 font-medium leading-relaxed"
            >
              <div className="p-1 rounded-md bg-teal-200/60 text-teal-800 shrink-0 mt-0.5" aria-hidden="true">
                <Fan className="w-3.5 h-3.5" />
              </div>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
