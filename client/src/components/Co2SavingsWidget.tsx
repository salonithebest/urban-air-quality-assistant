import React from "react";
import type { Co2Estimate } from "../types/index.js";
import { Leaf, Trees, Award, ArrowDownRight, Info } from "lucide-react";

interface Co2SavingsWidgetProps {
  co2Estimate: Co2Estimate;
}

export const Co2SavingsWidget: React.FC<Co2SavingsWidgetProps> = ({
  co2Estimate,
}) => {
  return (
    <div className="glass-panel-glow rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300">
      {/* Background emerald ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-black text-xl text-slate-100 tracking-tight">
              Deterministic Family CO₂ Savings Engine
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Pure mathematical calculation of emissions saved against standard solo petrol car transit.
          </p>
        </div>

        <span className="text-[11px] glass-card border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full font-semibold self-start sm:self-center">
          {co2Estimate.sourceLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 relative z-10">
        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Solo Car Baseline
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-200">
            {co2Estimate.baselineKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-slate-400">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            0.14 kg CO₂/km standard
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Your Routine Footprint
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {co2Estimate.optimisedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-emerald-500/70">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            With low-carbon modes
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            Daily Carbon Cut
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300">
            {co2Estimate.savedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-emerald-400/80">kg/day</span>
          </div>
          <span className="text-[10px] text-emerald-400/70 mt-1 block font-medium">
            ≈ {co2Estimate.savedKgPerYear.toFixed(1)} kg CO₂/year
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-1 text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">
            <Trees className="w-3.5 h-3.5 text-cyan-400" />
            Tree Days Offset
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300">
            {Math.round(co2Estimate.equivalentTreeDays)}{" "}
            <span className="text-xs font-semibold text-cyan-400/80">tree-days/yr</span>
          </div>
          <span className="text-[10px] text-cyan-400/70 mt-1 block font-medium">
            (at 21 kg/tree/yr rate)
          </span>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300 relative z-10">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Annual impact: Your family avoids approx. <strong>{Math.round(co2Estimate.savedKgPerYear)} kg</strong> of tailpipe emissions every year.
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
          <Info className="w-3 h-3" />
          USDA Forest Service 21 kg/tree/yr absorption standard
        </div>
      </div>
    </div>
  );
};
