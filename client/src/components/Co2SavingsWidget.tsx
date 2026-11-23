/**
 * @file Co2SavingsWidget.tsx
 * @description Deterministic carbon reduction and tree-years sequestration widget.
 * Implements emission factors from India GHG Program and USDA Forest Service tree sequestration standards.
 */

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

  const sourceLabel = liveMetrics
    ? liveMetrics.sourceLabel
    : serverEstimate?.sourceLabel ?? "India GHG Program & TERI";

  const totalKm = liveMetrics ? liveMetrics.totalKm : 0;
  const totalMinutes = liveMetrics ? liveMetrics.totalMinutes : 0;

  return (
    <section
      className="glass-card-glow rounded-3xl p-6 sm:p-7 mb-6 relative overflow-hidden shadow-lg"
      role="region"
      aria-label="Deterministic Commute Carbon and Tree Sequestration Metrics"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-teal-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
              <Leaf className="w-4 h-4 text-teal-700" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-teal-800">
              Deterministic Climate Accounting
            </span>
            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-600" aria-hidden="true" /> Verified Baseline
            </span>
          </div>

          <h3 className="font-black text-slate-900 text-xl tracking-tight">
            Commute Carbon Savings vs. Solo Petrol Car
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Based on {totalMinutes} min / {totalKm.toFixed(1)} km daily transit vs. baseline (0.14 kg CO₂/km).
          </p>
        </div>

        <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs">
          Source: {sourceLabel}
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {/* Solo Car Baseline */}
        <div className="bg-white/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Solo Car Baseline
            </span>
            <Car className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-700">
            {baselineKgPerDay.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-0.5">kg CO₂ / day</div>
        </div>

        {/* Your Routine Footprint */}
        <div className="bg-white/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
              Routine Footprint
            </span>
            <Leaf className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-700">
            {optimisedKgPerDay.toFixed(2)}
          </div>
          <div className="text-[11px] text-teal-600 font-semibold mt-0.5">kg CO₂ / day</div>
        </div>

        {/* Daily Carbon Cut */}
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Daily Carbon Cut</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">
            -{savedKgPerDay.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
            {percentReduction}% cut vs. solo car
          </div>
        </div>

        {/* Annual Sequestration */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-teal-800 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Annual Sequestration</span>
            <Trees className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-800">
            {annualTreeYears}
          </div>
          <div className="text-[11px] text-teal-700 font-bold mt-0.5">
            tree-years / yr ({savedKgPerYear.toFixed(0)} kg CO₂)
          </div>
        </div>
      </div>

      {/* Explanatory Footer */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/70 border border-slate-200/80 rounded-xl px-3.5 py-2 font-medium">
        <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" aria-hidden="true" />
        <span>
          Annual sequestration is calculated via the USDA Forest Service benchmark (1 urban tree absorbs ~21 kg CO₂ per year). Calculations exclude Work from Home (0 km) travel.
        </span>
      </div>
    </section>
  );
};
