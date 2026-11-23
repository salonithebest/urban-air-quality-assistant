import React from "react";
import type { Co2Estimate, RoutineChoice } from "../types/index.js";
import { calculateDeterministicCo2 } from "../utils/co2Calculator.js";
import { Leaf, Trees, ArrowDownRight, Info, Car, ShieldCheck } from "lucide-react";

interface Co2SavingsWidgetProps {
  co2Estimate?: Co2Estimate;
  routineChoices?: RoutineChoice[];
}

export const Co2SavingsWidget: React.FC<Co2SavingsWidgetProps> = ({
  co2Estimate: serverEstimate,
  routineChoices,
}) => {
  // If active routineChoices are provided, compute live deterministic metrics
  const liveMetrics = routineChoices ? calculateDeterministicCo2(routineChoices) : null;

  // Use live metrics if available, otherwise server estimate
  const baselineKgPerDay = liveMetrics
    ? liveMetrics.soloCarBaselineKg
    : serverEstimate?.baselineKgPerDay ?? 0;

  const optimisedKgPerDay = liveMetrics
    ? liveMetrics.routineFootprintKg
    : serverEstimate?.optimisedKgPerDay ?? 0;

  const savedKgPerDay = liveMetrics
    ? liveMetrics.dailyCarbonCutKg
    : serverEstimate?.savedKgPerDay ?? 0;

  const savedKgPerYear = liveMetrics
    ? liveMetrics.savedKgPerYear
    : serverEstimate?.savedKgPerYear ?? savedKgPerDay * 365;

  const percentReduction = liveMetrics
    ? liveMetrics.percentReduction
    : serverEstimate?.percentReduction ??
      (baselineKgPerDay > 0 ? Math.round((savedKgPerDay / baselineKgPerDay) * 100) : 0);

  const annualTreeYears = liveMetrics
    ? liveMetrics.annualTreeYears
    : serverEstimate?.annualTreeYears ??
      Math.round((savedKgPerYear / 21) * 10) / 10;

  const equivalentTreeDays = liveMetrics
    ? liveMetrics.equivalentTreeDays
    : serverEstimate?.equivalentTreeDays ??
      Math.round(annualTreeYears * 365 * 10) / 10;

  const sourceLabel = liveMetrics
    ? liveMetrics.sourceLabel
    : serverEstimate?.sourceLabel ?? "India GHG Program & TERI";

  const totalKm = liveMetrics ? liveMetrics.totalKm : 0;
  const totalMinutes = liveMetrics ? liveMetrics.totalMinutes : 0;

  return (
    <div className="glass-card-glow rounded-3xl p-6 sm:p-7 mb-6 relative overflow-hidden shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-teal-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-black text-xl text-slate-900 tracking-tight">
              Deterministic Family CO₂ Savings Engine
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Pure mathematical calculation of emissions saved against standard solo petrol car transit (0.14 kg CO₂/km).
            {totalKm > 0 && (
              <span className="text-teal-700 font-bold ml-1">
                Active commute: {totalKm.toFixed(1)} km across {totalMinutes} min.
              </span>
            )}
          </p>
        </div>

        <span className="text-[11px] bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1 rounded-full font-black self-start sm:self-center shadow-2xs">
          {sourceLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Solo Car Baseline */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Solo Car Baseline</span>
            <Car className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {baselineKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-slate-400">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            0.140 kg CO₂/km standard
          </span>
        </div>

        {/* Your Routine Footprint */}
        <div className="glass-card rounded-2xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Your Routine Footprint
          </span>
          <div className="text-2xl sm:text-3xl font-black text-teal-700">
            {optimisedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-teal-600/70">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            With low-carbon modes
          </span>
        </div>

        {/* Daily Carbon Cut */}
        <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-1 text-[10px] font-black text-teal-800 uppercase tracking-widest mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-teal-600" />
            Daily Carbon Cut
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-800">
            {savedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-bold text-teal-700">kg/day</span>
          </div>
          <span className="text-[10px] text-teal-700 mt-1 block font-bold">
            {percentReduction}% lower footprint ({savedKgPerYear.toFixed(1)} kg/yr)
          </span>
        </div>

        {/* Annual Sequestration */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-700 uppercase tracking-widest mb-1">
            <Trees className="w-3.5 h-3.5" />
            Annual Sequestration
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-800">
            {annualTreeYears.toFixed(1)}{" "}
            <span className="text-xs font-semibold text-cyan-600">tree-years</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block font-medium">
            = {equivalentTreeDays.toFixed(0)} tree-days ({annualTreeYears.toFixed(1)} mature trees/yr)
          </span>
        </div>
      </div>

      {/* Explanatory Formula Footer */}
      <div className="mt-4 pt-3.5 border-t border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>
            <strong>Formula:</strong> ({savedKgPerDay.toFixed(2)} kg/day × 365 days) ÷ 21 kg CO₂/tree/year = <strong>{annualTreeYears.toFixed(1)} mature tree-years</strong> of annual absorption.
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
          <ShieldCheck className="w-3 h-3 text-teal-600" /> USDA Forest Service 21 kg/tree/yr standard
        </div>
      </div>
    </div>
  );
};
