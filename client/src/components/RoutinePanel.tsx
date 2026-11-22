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
    <div className="cyber-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              Daily Family Commute Legs
            </h3>
          </div>

          {choices.length < 5 && (
            <button
              type="button"
              onClick={addChoice}
              className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Commute Leg
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
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
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <select
                      value={c.activityType}
                      onChange={(e) => {
                        const newMode = e.target.value as ActivityType;
                        updateChoice(idx, {
                          activityType: newMode,
                          distanceKm: newMode === "wfh" ? 0 : (c.distanceKm && c.distanceKm > 0 ? c.distanceKm : 5),
                        });
                      }}
                      className="w-full text-xs cyber-input rounded-lg px-2.5 py-1.5 font-bold cursor-pointer"
                    >
                      {MODES.map((m) => (
                        <option key={m.value} value={m.value} className="bg-[#0b1120] text-white">
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
                        value={c.durationMinutes}
                        onChange={(e) =>
                          updateChoice(idx, {
                            durationMinutes: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-14 text-xs cyber-input rounded-lg px-2 py-1.5 text-center font-bold"
                      />
                      <span className="text-[11px] text-slate-400 font-semibold">min</span>
                    </div>

                    {isWfh ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-400 select-none">
                        <Home className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-mono">0 km</span>
                        <span className="text-[10px] text-slate-500 font-medium">(Home)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0.1}
                          max={200}
                          step={0.5}
                          value={c.distanceKm ?? 1}
                          onChange={(e) =>
                            updateChoice(idx, {
                              distanceKm: Math.max(0.1, Number(e.target.value) || 0.1),
                            })
                          }
                          className="w-14 text-xs cyber-input rounded-lg px-2 py-1.5 text-center font-bold"
                        />
                        <span className="text-[11px] text-slate-400 font-semibold">km</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeChoice(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg ml-1 cursor-pointer"
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
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 text-xs text-slate-400 mb-4 flex items-center justify-between">
            <span>No daily commute legs configured (zero travel footprint).</span>
            <button
              type="button"
              onClick={addChoice}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
            >
              + Add First Leg
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1.5">
        <span>Total daily active transit:</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">
            {totalActiveMinutes} min • {totalActiveKm.toFixed(1)} km
          </span>
          {totalWfhMinutes > 0 && (
            <span className="text-slate-400 font-medium text-[10px] bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              + {(totalWfhMinutes / 60).toFixed(1)}h WFH (indoor)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
