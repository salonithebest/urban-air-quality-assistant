import React, { useState } from "react";
import type { FamilyMember, FamilyRole } from "../types/index.js";
import { Users, Plus, Trash2, HeartPulse, ShieldAlert } from "lucide-react";

interface FamilyProfileFormProps {
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, "id">) => void;
  onRemoveMember: (id: string) => void;
}

const ROLES: { value: FamilyRole; label: string; badge: string; isHighRisk?: boolean }[] = [
  { value: "infant", label: "Infant (0–2 yrs)", badge: "bg-purple-50 text-purple-700 border-purple-200", isHighRisk: true },
  { value: "child", label: "Child (3–12 yrs)", badge: "bg-blue-50 text-blue-700 border-blue-200", isHighRisk: true },
  { value: "senior", label: "Senior Citizen (60+ yrs)", badge: "bg-rose-50 text-rose-700 border-rose-200", isHighRisk: true },
  { value: "asthmatic", label: "Asthmatic / Respiratory", badge: "bg-red-50 text-red-700 border-red-200", isHighRisk: true },
  { value: "cardiac", label: "Cardiac / Heart condition", badge: "bg-amber-50 text-amber-700 border-amber-200", isHighRisk: true },
  { value: "pregnant", label: "Pregnant", badge: "bg-pink-50 text-pink-700 border-pink-200", isHighRisk: true },
  { value: "adult", label: "Healthy Adult", badge: "bg-slate-100 text-slate-700 border-slate-200" },
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
    <div className="luxury-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
              Household Vulnerability Profile
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {highRiskCount > 0 && (
              <span className="text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-500" />
                {highRiskCount} High Risk
              </span>
            )}
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              {members.length} / 10 Members
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Tailors biological protection protocols according to age, minute-ventilation rate, and pre-existing medical conditions.
        </p>

        {/* Member Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {members.map((m) => {
            const roleObj = ROLES.find((r) => r.value === m.role);
            return (
              <div
                key={m.id}
                className="flex items-center gap-2 bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
              >
                <HeartPulse
                  className={`w-3.5 h-3.5 ${roleObj?.isHighRisk ? "text-rose-500" : "text-emerald-600"}`}
                />
                <span className="font-bold text-slate-800">{m.name}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleObj?.badge || "bg-slate-100 text-slate-700"}`}>
                  {m.role}
                </span>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.id)}
                    className="text-slate-400 hover:text-rose-600 ml-0.5 transition-colors p-0.5"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Form */}
      {members.length < 10 && (
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Family member name (e.g. Grandma, Kabir)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs luxury-input rounded-xl focus:outline-none placeholder:text-slate-400"
            maxLength={50}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as FamilyRole)}
            className="px-3 py-2 text-xs luxury-input rounded-xl font-semibold text-slate-700 cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </form>
      )}
    </div>
  );
};
