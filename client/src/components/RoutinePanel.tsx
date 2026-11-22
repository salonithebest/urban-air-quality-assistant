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
    <div className="luxury-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
              Daily Family Commute Legs
            </h3>
          </div>

          {choices.length < 5 && (
            <button
              type="button"
              onClick={addChoice}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Commute Leg
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Configure daily transport legs to calculate personal particulate exposure &amp; deterministic carbon reduction vs. solo driving.
        </p>

        {/* Routine list */}
        <div className="space-y-2.5 mb-2">
          {choices.map((c, idx) => {
            const modeObj = MODES.find((m) => m.value === c.activityType);
            const Icon = modeObj?.icon || Car;

            return (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-emerald-700 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <select
                    value={c.activityType}
                    onChange={(e) =>
                      updateChoice(idx, { activityType: e.target.value as ActivityType })
                    }
                    className="w-full text-xs font-semibold luxury-input rounded-xl px-2.5 py-1.5 text-slate-800 cursor-pointer"
                  >
                    {MODES.map((m) => (
                      <option key={m.value} value={m.value}>
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
                      className="w-full text-xs font-bold luxury-input rounded-xl px-2 py-1.5 text-slate-900 text-center"
                    />
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
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
                      className="w-full text-xs font-bold luxury-input rounded-xl px-2 py-1.5 text-slate-900 text-center"
                    />
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
                      Duration (min)
                    </span>
                  </div>

                  {choices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChoice(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
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
