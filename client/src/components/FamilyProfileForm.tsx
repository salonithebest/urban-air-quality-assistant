import React, { useState } from "react";
import type { FamilyMember, FamilyRole } from "../types/index.js";
import { Users, Plus, Trash2, HeartPulse, ShieldAlert } from "lucide-react";

interface FamilyProfileFormProps {
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, "id">) => void;
  onRemoveMember: (id: string) => void;
}

const ROLES: { value: FamilyRole; label: string; badge: string; isHighRisk?: boolean }[] = [
  { value: "infant", label: "Infant (0–2 yrs)", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", isHighRisk: true },
  { value: "child", label: "Child (3–12 yrs)", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", isHighRisk: true },
  { value: "senior", label: "Senior Citizen (60+ yrs)", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30", isHighRisk: true },
  { value: "asthmatic", label: "Asthmatic / Respiratory", badge: "bg-red-500/20 text-red-300 border-red-500/30", isHighRisk: true },
  { value: "cardiac", label: "Cardiac / Heart condition", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", isHighRisk: true },
  { value: "pregnant", label: "Pregnant", badge: "bg-pink-500/20 text-pink-300 border-pink-500/30", isHighRisk: true },
  { value: "adult", label: "Healthy Adult", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
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
    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-white/10 relative overflow-hidden transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-100 text-lg tracking-tight">
              Household Vulnerability Profile
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {highRiskCount > 0 && (
              <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                {highRiskCount} High Risk
              </span>
            )}
            <span className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
              {members.length}/10 Members
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Tailors real-time advice to each family member's biological susceptibility, respiratory volume, and pre-existing medical conditions.
        </p>

        {/* Member Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {members.map((m) => {
            const roleObj = ROLES.find((r) => r.value === m.role);
            return (
              <div
                key={m.id}
                className="flex items-center gap-2 glass-card rounded-2xl px-3 py-2 text-xs border border-white/10 hover:border-white/20 transition-all"
              >
                <HeartPulse
                  className={`w-3.5 h-3.5 ${roleObj?.isHighRisk ? "text-rose-400" : "text-emerald-400"}`}
                />
                <span className="font-bold text-slate-200">{m.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleObj?.badge || "bg-slate-700 text-slate-200"}`}>
                  {m.role}
                </span>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.id)}
                    className="text-slate-500 hover:text-red-400 ml-0.5 transition-colors p-0.5"
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

      {/* Add New Member Input */}
      {members.length < 10 && (
        <form onSubmit={handleSubmit} className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Family member name (e.g. Grandma, Kabir)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs glass-input rounded-2xl focus:border-indigo-500/60 transition-all placeholder:text-slate-500"
            maxLength={50}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as FamilyRole)}
            className="px-3 py-2 text-xs glass-input rounded-2xl font-semibold text-slate-200 cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-slate-900 text-slate-100">
                {r.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </form>
      )}
    </div>
  );
};
