import React, { useState } from "react";
import type { FamilyMember, FamilyRole } from "../types/index.js";
import { Users, Plus, Trash2, ShieldAlert } from "lucide-react";

interface FamilyProfileFormProps {
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, "id">) => void;
  onRemoveMember: (id: string) => void;
}

const ROLES: { value: FamilyRole; label: string; badge: string; isHighRisk?: boolean }[] = [
  { value: "infant", label: "Infant (0–2 yrs)", badge: "bg-purple-500/20 text-purple-300 border-purple-500/40", isHighRisk: true },
  { value: "child", label: "Child (3–12 yrs)", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40", isHighRisk: true },
  { value: "senior", label: "Senior Citizen (60+ yrs)", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40", isHighRisk: true },
  { value: "asthmatic", label: "Asthmatic / Respiratory", badge: "bg-red-500/20 text-red-300 border-red-500/40", isHighRisk: true },
  { value: "cardiac", label: "Cardiac / Heart condition", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", isHighRisk: true },
  { value: "pregnant", label: "Pregnant", badge: "bg-pink-500/20 text-pink-300 border-pink-500/40", isHighRisk: true },
  { value: "adult", label: "Healthy Adult", badge: "bg-slate-800 text-slate-300 border-slate-700" },
];

export const FamilyProfileForm: React.FC<FamilyProfileFormProps> = ({
  members,
  onAddMember,
  onRemoveMember,
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<FamilyRole>("child");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMember({ name: name.trim(), role });
    setName("");
  };

  const highRiskCount = members.filter((m) =>
    ["infant", "child", "senior", "asthmatic", "cardiac", "pregnant"].includes(m.role)
  ).length;

  return (
    <div className="cyber-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              Household Vulnerability Profile
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {highRiskCount > 0 && (
              <span className="text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                {highRiskCount} High Risk
              </span>
            )}
            <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {members.length} / 10 Members
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Tailors biological protection protocols according to age, minute-ventilation rate, and pre-existing medical conditions.
        </p>

        {/* Member Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {members.map((m) => {
            const roleObj = ROLES.find((r) => r.value === m.role) || ROLES[6]!;
            return (
              <div
                key={m.id}
                className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs shadow-sm hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-black text-white">{m.name}</span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border mt-0.5 inline-block ${roleObj.badge}`}
                  >
                    {roleObj.label.split("(")[0]}
                  </span>
                </div>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded"
                    title="Remove member"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Form */}
      {members.length < 10 && (
        <form
          onSubmit={handleSubmit}
          className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <input
            type="text"
            placeholder="Name (e.g. Aarav, Dadi)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs cyber-input rounded-xl focus:outline-none"
            maxLength={30}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as FamilyRole)}
            className="px-3 py-2 text-xs cyber-input rounded-xl font-medium cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-[#0b1120] text-white">
                {r.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      )}
    </div>
  );
};
