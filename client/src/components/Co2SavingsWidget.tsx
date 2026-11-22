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
    <div className="cyber-panel-glow rounded-3xl p-6 sm:p-7 border border-emerald-500/30 mb-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-black text-xl text-white tracking-tight">
              Deterministic Family CO₂ Savings Engine
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Pure mathematical calculation of emissions saved against standard solo petrol car transit (0.14 kg CO₂/km).
            {totalKm > 0 && (
              <span className="text-emerald-400 font-semibold ml-1">
                Active commute: {totalKm.toFixed(1)} km across {totalMinutes} min.
              </span>
            )}
          </p>
        </div>

        <span className="text-[11px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full font-black self-start sm:self-center">
          {sourceLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Solo Car Baseline */}
        <div className="cyber-panel rounded-xl p-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Solo Car Baseline</span>
            <Car className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {baselineKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-slate-400">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            0.140 kg CO₂/km standard
          </span>
        </div>

        {/* Your Routine Footprint */}
        <div className="cyber-panel rounded-xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Your Routine Footprint
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {optimisedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-semibold text-emerald-300/70">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            With low-carbon modes
          </span>
        </div>

        {/* Daily Carbon Cut */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            Daily Carbon Cut
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {savedKgPerDay.toFixed(2)}{" "}
            <span className="text-xs font-bold text-emerald-300">kg/day</span>
          </div>
          <span className="text-[10px] text-emerald-300 mt-1 block font-semibold">
            {percentReduction}% lower footprint ({savedKgPerYear.toFixed(1)} kg/yr)
          </span>
        </div>

        {/* Annual Sequestration */}
        <div className="cyber-panel rounded-xl p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
            <Trees className="w-3.5 h-3.5" />
            Annual Sequestration
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300">
            {annualTreeYears.toFixed(1)}{" "}
            <span className="text-xs font-semibold text-cyan-400/80">tree-years</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            = {equivalentTreeDays.toFixed(0)} tree-days ({annualTreeYears.toFixed(1)} mature trees/yr)
          </span>
        </div>
      </div>

      {/* Explanatory Formula Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Formula:</strong> ({savedKgPerDay.toFixed(2)} kg/day × 365 days) ÷ 21 kg CO₂/tree/year = <strong>{annualTreeYears.toFixed(1)} mature tree-years</strong> of annual absorption.
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
          <ShieldCheck className="w-3 h-3 text-emerald-500" /> USDA Forest Service 21 kg/tree/yr standard
        </div>
      </div>
    </div>
  );
};
