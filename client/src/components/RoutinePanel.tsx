import React from "react";
import type { RoutineChoice, ActivityType } from "../types/index.js";
import { Compass, Plus, Trash2, Train, Footprints, Laptop, Car, Bike } from "lucide-react";

interface RoutinePanelProps {
  choices: RoutineChoice[];
  onChangeChoices: (choices: RoutineChoice[]) => void;
}

const MODES: { value: ActivityType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: "metro", label: "Metro / Suburban Rail", icon: Train },
  { value: "walk", label: "Walk / Cycle", icon: Footprints },
  { value: "wfh", label: "Work from Home (WFH)", icon: Laptop },
  { value: "autorickshaw", label: "Auto-rickshaw (CNG)", icon: Car },
  { value: "bike", label: "Motorbike / Scooter (Petrol)", icon: Bike },
  { value: "car", label: "Personal Car (Petrol Solo)", icon: Car },
];

export const RoutinePanel: React.FC<RoutinePanelProps> = ({
  choices,
  onChangeChoices,
}) => {
  const addChoice = () => {
    if (choices.length >= 5) return;
    onChangeChoices([
      ...choices,
      { activityType: "metro", durationMinutes: 30, distanceKm: 10 },
    ]);
  };

  const removeChoice = (idx: number) => {
    if (choices.length <= 1) return;
    onChangeChoices(choices.filter((_, i) => i !== idx));
  };

  const updateChoice = (idx: number, patch: Partial<RoutineChoice>) => {
    const updated = choices.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChangeChoices(updated);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-white/10 relative overflow-hidden transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-100 text-lg tracking-tight">
              Daily Family Commute Legs
            </h3>
          </div>

          {choices.length < 5 && (
            <button
              type="button"
              onClick={addChoice}
              className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Commute Leg
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Configure daily transport legs to calculate tailored tailpipe exposure &amp; deterministic carbon reduction vs. solo car transit.
        </p>

        {/* List of routine choices */}
        <div className="space-y-2.5 mb-2">
          {choices.map((c, idx) => {
            const modeObj = MODES.find((m) => m.value === c.activityType);
            const Icon = modeObj?.icon || Car;

            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="p-2 rounded-xl bg-slate-800/80 text-emerald-400 border border-white/5 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <select
                    value={c.activityType}
                    onChange={(e) =>
                      updateChoice(idx, { activityType: e.target.value as ActivityType })
                    }
                    className="w-full text-xs font-semibold glass-input rounded-xl px-2.5 py-2 text-slate-200 cursor-pointer"
                  >
                    {MODES.map((m) => (
                      <option key={m.value} value={m.value} className="bg-slate-900 text-slate-100">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Km"
                      value={c.distanceKm ?? 10}
                      onChange={(e) =>
                        updateChoice(idx, { distanceKm: Number(e.target.value) })
                      }
                      className="w-full text-xs font-bold glass-input rounded-xl px-2.5 py-2 text-slate-200 text-center"
                    />
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block text-center mt-0.5">
                      Dist (km)
                    </span>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min={0}
                      max={240}
                      placeholder="Min"
                      value={c.durationMinutes}
                      onChange={(e) =>
                        updateChoice(idx, { durationMinutes: Number(e.target.value) })
                      }
                      className="w-full text-xs font-bold glass-input rounded-xl px-2.5 py-2 text-slate-200 text-center"
                    />
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block text-center mt-0.5">
                      Duration (min)
                    </span>
                  </div>

                  {choices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChoice(idx)}
                      className="text-slate-500 hover:text-rose-400 p-2 transition-colors"
                      title="Remove commute leg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
