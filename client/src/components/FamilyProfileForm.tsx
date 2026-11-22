import React, { useState } from "react";
import type { FamilyMember, FamilyRole } from "../types/index.js";
import { Users, Plus, Trash2, HeartPulse } from "lucide-react";

interface FamilyProfileFormProps {
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, "id">) => void;
  onRemoveMember: (id: string) => void;
}

const ROLES: { value: FamilyRole; label: string }[] = [
  { value: "infant", label: "Infant (0–2 yrs)" },
  { value: "child", label: "Child (3–12 yrs)" },
  { value: "adult", label: "Healthy Adult" },
  { value: "senior", label: "Senior Citizen (60+ yrs)" },
  { value: "asthmatic", label: "Asthmatic / Respiratory" },
  { value: "cardiac", label: "Cardiac / Heart condition" },
  { value: "pregnant", label: "Pregnant" },
];

export const FamilyProfileForm: React.FC<FamilyProfileFormProps> = ({
  members,
  onAddMember,
  onRemoveMember,
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<FamilyRole>("adult");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMember({ name: name.trim(), role });
    setName("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-lg">Family Profile</h3>
        </div>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
          {members.length} / 10 Members
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Personalized advice will adapt to each member’s respiratory vulnerability, age, and health profile.
      </p>

      {/* Member Chips list */}
      <div className="flex flex-wrap gap-2 mb-4">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold text-slate-800">{m.name}</span>
            <span className="text-slate-400">({m.role})</span>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveMember(m.id)}
                className="text-slate-400 hover:text-red-500 ml-1 transition-colors"
                title="Remove member"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new member form */}
      {members.length < 10 && (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100">
          <input
            type="text"
            placeholder="Family member name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={50}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as FamilyRole)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </form>
      )}
    </div>
  );
};
