import React from "react";
import type { Co2Estimate } from "../types/index.js";
import { Leaf, Trees, Award, ArrowDownRight } from "lucide-react";

interface Co2SavingsWidgetProps {
  co2Estimate: Co2Estimate;
}

export const Co2SavingsWidget: React.FC<Co2SavingsWidgetProps> = ({
  co2Estimate,
}) => {
  return (
    <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-md mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-emerald-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-emerald-100">
              Personalized CO₂ Savings Engine
            </h3>
          </div>
          <p className="text-xs text-emerald-300 mt-0.5">
            Deterministic carbon reduction benchmarked against solo petrol car transit.
          </p>
        </div>

        <span className="text-[11px] bg-emerald-800/70 border border-emerald-600/40 text-emerald-200 px-3 py-1 rounded-full font-medium">
          {co2Estimate.sourceLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-800/40 border border-emerald-700/50 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block mb-1">
            Baseline (All Car)
          </span>
          <div className="text-2xl font-black text-white">
            {co2Estimate.baselineKgPerDay}{" "}
            <span className="text-xs font-normal text-emerald-300">kg/day</span>
          </div>
        </div>

        <div className="bg-emerald-800/40 border border-emerald-700/50 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block mb-1">
            Optimized Routine
          </span>
          <div className="text-2xl font-black text-emerald-200">
            {co2Estimate.optimisedKgPerDay}{" "}
            <span className="text-xs font-normal text-emerald-300">kg/day</span>
          </div>
        </div>

        <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            Daily Reduction
          </div>
          <div className="text-2xl font-black text-emerald-300">
            {co2Estimate.savedKgPerDay}{" "}
            <span className="text-xs font-normal text-emerald-200">kg/day</span>
          </div>
        </div>

        <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-3.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
            <Trees className="w-3.5 h-3.5 text-emerald-400" />
            Tree Days Offset
          </div>
          <div className="text-2xl font-black text-emerald-300">
            {Math.round(co2Estimate.equivalentTreeDays)}{" "}
            <span className="text-xs font-normal text-emerald-200">tree-days/yr</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-300">
        <Award className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          By choosing metro, walking, or shared rides, your family prevents ~
          <strong>{Math.round(co2Estimate.savedKgPerYear)} kg</strong> of tailpipe emissions annually!
        </span>
      </div>
    </div>
  );
};
