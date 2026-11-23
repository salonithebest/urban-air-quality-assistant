import React from "react";
import type { RoutineChoice, ActivityType } from "../types/index.js";
import { Compass, Plus, Trash2, Train, Footprints, Laptop, Car, Bike, Home } from "lucide-react";

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
    onChangeChoices(choices.filter((_, i) => i !== idx));
  };

  const updateChoice = (idx: number, patch: Partial<RoutineChoice>) => {
    const updated = choices.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChangeChoices(updated);
  };

  const activeLegs = choices.filter((c) => c.activityType !== "wfh");
  const wfhLegs = choices.filter((c) => c.activityType === "wfh");
  const totalActiveMinutes = activeLegs.reduce((acc, c) => acc + (c.durationMinutes || 0), 0);
  const totalActiveKm = activeLegs.reduce((acc, c) => acc + (c.distanceKm || 0), 0);
  const totalWfhMinutes = wfhLegs.reduce((acc, c) => acc + (c.durationMinutes || 0), 0);

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
              Daily Family Commute Legs
            </h3>
          </div>

          {choices.length < 5 && (
            <button
              type="button"
              onClick={addChoice}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-1.5 rounded-xl border border-teal-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Commute Leg
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
          Configure daily transport legs to calculate personal particulate exposure &amp; deterministic carbon reduction vs. solo driving.
        </p>

        {/* Routine list or Empty State */}
        {choices.length > 0 ? (
          <div className="space-y-2.5 mb-2">
            {choices.map((c, idx) => {
              const modeObj = MODES.find((m) => m.value === c.activityType);
              const Icon = modeObj?.icon || Car;
              const isWfh = c.activityType === "wfh";

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <select
                      value={c.activityType}
                      aria-label={`Commute mode for leg ${idx + 1}`}
                      onChange={(e) => {
                        const newMode = e.target.value as ActivityType;
                        updateChoice(idx, {
                          activityType: newMode,
                          distanceKm: newMode === "wfh" ? 0 : (c.distanceKm && c.distanceKm > 0 ? c.distanceKm : 5),
                        });
                      }}
                      className="w-full text-xs glass-input rounded-xl px-2.5 py-1.5 font-bold text-slate-800 cursor-pointer"
                    >
                      {MODES.map((m) => (
                        <option key={m.value} value={m.value} className="bg-white text-slate-900">
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={480}
                        aria-label={`Commute duration in minutes for leg ${idx + 1}`}
                        value={c.durationMinutes}
                        onChange={(e) =>
                          updateChoice(idx, {
                            durationMinutes: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-14 text-xs glass-input rounded-xl px-2 py-1.5 text-center font-bold"
                      />
                      <span className="text-[11px] text-slate-500 font-semibold">min</span>
                    </div>

                    {isWfh ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 select-none">
                        <Home className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                        <span className="text-teal-700 font-mono">0 km</span>
                        <span className="text-[10px] text-slate-400 font-medium">(Home)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0.1}
                          max={200}
                          step={0.5}
                          aria-label={`Commute distance in kilometers for leg ${idx + 1}`}
                          value={c.distanceKm ?? 1}
                          onChange={(e) =>
                            updateChoice(idx, {
                              distanceKm: Math.max(0.1, Number(e.target.value) || 0.1),
                            })
                          }
                          className="w-14 text-xs glass-input rounded-xl px-2 py-1.5 text-center font-bold"
                        />
                        <span className="text-[11px] text-slate-500 font-semibold">km</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeChoice(idx)}
                      aria-label={`Remove commute leg ${idx + 1}`}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg ml-1 cursor-pointer"
                      title="Remove leg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-dashed border-slate-300 text-xs text-slate-500 mb-4 flex items-center justify-between font-medium">
            <span>No daily commute legs configured (zero travel footprint).</span>
            <button
              type="button"
              onClick={addChoice}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold underline cursor-pointer"
            >
              + Add First Leg
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1.5 font-medium">
        <span>Total daily active transit:</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-teal-700">
            {totalActiveMinutes} min • {totalActiveKm.toFixed(1)} km
          </span>
          {totalWfhMinutes > 0 && (
            <span className="text-slate-600 font-semibold text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              + {(totalWfhMinutes / 60).toFixed(1)}h WFH (indoor)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
