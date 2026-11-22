import React from "react";
import type { Co2Estimate } from "../types/index.js";
import { Leaf, Trees, ArrowDownRight, Info } from "lucide-react";

interface Co2SavingsWidgetProps {
  co2Estimate: Co2Estimate;
}

export const Co2SavingsWidget: React.FC<Co2SavingsWidgetProps> = ({
  co2Estimate,
}) => {
  const percentReduction =
    co2Estimate.baselineKgPerDay > 0
      ? (co2Estimate.savedKgPerDay / co2Estimate.baselineKgPerDay) * 100
      : 0;

  return (
    <div className="cyber-panel-glow rounded-3xl p-6 sm:p-7 border border-emerald-500/30 mb-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">
              Deterministic Family CO₂ Savings Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pure mathematical calculation of emissions saved against standard solo petrol car transit.
          </p>
        </div>

        <span className="text-[11px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full font-black self-start sm:self-center">
          {co2Estimate.sourceLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="cyber-panel rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Solo Car Baseline
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {co2Estimate.baselineKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-slate-400">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            0.14 kg CO₂/km standard
          </span>
        </div>

        <div className="cyber-panel rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Your Routine Footprint
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {co2Estimate.optimisedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-emerald-300/70">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            With low-carbon modes
          </span>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            Daily Carbon Cut
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {co2Estimate.savedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-bold text-emerald-300">kg/day</span>
          </div>
          <span className="text-[10px] text-emerald-300 mt-1 block font-semibold">
            {percentReduction.toFixed(0)}% lower footprint
          </span>
        </div>

        <div className="cyber-panel rounded-xl p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
            <Trees className="w-3.5 h-3.5" />
            Annual Sequestration
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300">
            {co2Estimate.equivalentTreeDays.toFixed(1)}{" "}
            <span className="text-xs font-semibold text-cyan-400/80">tree-days</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            USDA forest metric
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          Emissions factors based on {co2Estimate.sourceLabel}. Equivalent tree-days calculated from 21 kg CO₂ absorbed per tree per year standard (USDA Forest Service).
        </span>
      </div>
    </div>
  );
};
