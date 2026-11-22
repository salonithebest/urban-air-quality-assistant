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
      <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-slate-100 text-base tracking-tight">
            Exposure-Minimizing Commute Protocol
          </h4>
        </div>
        <ul className="space-y-3">
          {routineSuggestions.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-200 bg-amber-950/25 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-3 shadow-inner hover:border-amber-500/40 transition-colors"
            >
              <span className="w-5 h-5 bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed font-normal">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Indoor air quality */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Home className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-slate-100 text-base tracking-tight">
            Indoor Air &amp; Micro-Climate Safeguards
          </h4>
        </div>
        <ul className="space-y-3">
          {indoorTips.map((tip, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-200 bg-teal-950/25 border border-teal-500/20 rounded-2xl p-3.5 flex items-start gap-3 shadow-inner hover:border-teal-500/40 transition-colors"
            >
              <div className="p-1 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                <Fan className="w-3.5 h-3.5" />
              </div>
              <span className="leading-relaxed font-normal">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
