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
    <div className="luxury-hero rounded-2xl p-6 sm:p-7 border border-emerald-200/80 mb-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">
              Deterministic Family CO₂ Savings Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pure mathematical calculation of emissions saved against standard solo petrol car transit.
          </p>
        </div>

        <span className="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-bold self-start sm:self-center">
          {co2Estimate.sourceLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="luxury-card rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Solo Car Baseline
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-800">
            {co2Estimate.baselineKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-slate-400">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            0.14 kg CO₂/km standard
          </span>
        </div>

        <div className="luxury-card rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Your Routine Footprint
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {co2Estimate.optimisedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-emerald-600/70">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            With low-carbon modes
          </span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
            Daily Carbon Cut
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">
            {co2Estimate.savedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-bold text-emerald-700">kg/day</span>
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block font-semibold">
            ≈ {co2Estimate.savedKgPerYear.toFixed(1)} kg CO₂/year
          </span>
        </div>

        <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4">
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-teal-800 uppercase tracking-widest mb-1">
            <Trees className="w-3.5 h-3.5 text-teal-600" />
            Tree Days Offset
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-800">
            {Math.round(co2Estimate.equivalentTreeDays)}{" "}
            <span className="text-xs font-bold text-teal-700">tree-days/yr</span>
          </div>
          <span className="text-[10px] text-teal-700 mt-1 block font-semibold">
            (at 21 kg/tree/yr standard)
          </span>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
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
