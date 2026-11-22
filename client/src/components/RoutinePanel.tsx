import React from "react";
import type { RoutineChoice, ActivityType } from "../types/index.js";
import { Compass, Plus, Trash2 } from "lucide-react";

interface RoutinePanelProps {
  choices: RoutineChoice[];
  onChangeChoices: (choices: RoutineChoice[]) => void;
}

const MODES: { value: ActivityType; label: string }[] = [
  { value: "metro", label: "Metro / Suburban Rail" },
  { value: "walk", label: "Walk / Cycle" },
  { value: "wfh", label: "Work from Home" },
  { value: "autorickshaw", label: "Auto-rickshaw (CNG)" },
  { value: "bike", label: "Bike / Scooter (Petrol)" },
  { value: "car", label: "Car (Petrol)" },
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-lg">Daily Commute & Activities</h3>
        </div>
        {choices.length < 5 && (
          <button
            type="button"
            onClick={addChoice}
            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Leg / Leg
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Configure daily family activities to calculate carbon savings vs. solo petrol car driving.
      </p>

      <div className="space-y-3">
        {choices.map((c, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80"
          >
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Mode
              </label>
              <select
                value={c.activityType}
                onChange={(e) =>
                  updateChoice(idx, { activityType: e.target.value as ActivityType })
                }
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-28">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Distance (km)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={c.distanceKm ?? 10}
                onChange={(e) =>
                  updateChoice(idx, { distanceKm: Number(e.target.value) })
                }
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="w-full sm:w-28">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Duration (min)
              </label>
              <input
                type="number"
                min={0}
                max={240}
                value={c.durationMinutes}
                onChange={(e) =>
                  updateChoice(idx, { durationMinutes: Number(e.target.value) })
                }
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {choices.length > 1 && (
              <button
                type="button"
                onClick={() => removeChoice(idx)}
                className="text-slate-400 hover:text-red-500 self-end sm:self-center mt-2 sm:mt-4 p-1"
                title="Remove routine leg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
