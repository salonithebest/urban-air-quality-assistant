import React, { useState } from "react";
import type { FamilyMember, FamilyRole } from "../types/index.js";
import { Users, Plus, Trash2, ShieldAlert, UserPlus, ChevronDown, ChevronUp, HeartPulse, User } from "lucide-react";

interface FamilyProfileFormProps {
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, "id">) => void;
  onRemoveMember: (id: string) => void;
  activeAqi?: number;
  activeCategory?: string;
  activeProminentPollutant?: string;
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

function getSensitivityNote(role: FamilyRole, aqi: number = 138, category: string = "Moderately Polluted", prominent: string = "PM₂.₅"): string {
  const aqiText = `AQI ${aqi} (${category})`;
  const driverText = prominent.toUpperCase();

  switch (role) {
    case "infant":
      return `Immature nasal filtration & 2–3× higher inhalation rate per kg body weight; high vulnerability to alveolar micro-particle penetration at ${aqiText} driven by ${driverText}.`;
    case "child":
      return `Developing lung bronchioles and rapid breathing cadence; outdoor exertion triggers mouth breathing and deeper ${driverText} deposition deep in lung tissue.`;
    case "senior":
      return `Declined pulmonary reserves & vascular elasticity; heightened susceptibility to systemic oxidative stress and systolic blood pressure elevation at ${aqiText}.`;
    case "asthmatic":
      return `Hyper-reactive bronchial airways; inhalation of ${driverText} at ${aqiText} triggers smooth muscle spasms, coughing, and nocturnal peak-flow drops.`;
    case "cardiac":
      return `Endothelial arterial vasoconstriction; elevated myocardial oxygen demand with reduced coronary perfusion under ${aqiText} atmospheric conditions.`;
    case "pregnant":
      return `Micro-particulates cross alveolar-capillary membranes into maternal circulation; strict avoidance of congested traffic corridors recommended at ${aqiText}.`;
    default:
      return `Mucosal oxidative irritation, eye stinging, and throat dryness during prolonged outdoor exercise or rush-hour exposure at ${aqiText}.`;
  }
}

export const FamilyProfileForm: React.FC<FamilyProfileFormProps> = ({
  members,
  onAddMember,
  onRemoveMember,
  activeAqi = 138,
  activeCategory = "Moderately Polluted",
  activeProminentPollutant = "PM₂.₅",
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<FamilyRole>("child");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
          Click any family member below to open their vulnerability assessment &amp; active AQI sensitivity tier.
        </p>

        {/* Members Per-Member Dropdowns */}
        {members.length > 0 ? (
          <div className="space-y-2.5 mb-4">
            {members.map((m) => {
              const roleObj = ROLES.find((r) => r.value === m.role) || ROLES[6]!;
              const isExpanded = expandedIds.has(m.id);
              const sensitivityNote = getSensitivityNote(
                m.role,
                activeAqi,
                activeCategory,
                activeProminentPollutant
              );

              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden transition-all duration-200"
                >
                  {/* Compact Header: Name + Dropdown Toggle (Category Hidden Until Expanded) */}
                  <div
                    onClick={() => toggleExpand(m.id)}
                    className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-slate-800/60 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-white text-xs sm:text-sm">{m.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
                        {isExpanded ? "Hide profile" : "View profile"}
                      </span>
                      <button
                        type="button"
                        className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                        aria-label={isExpanded ? "Collapse member" : "Expand member"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Dropdown Content: Revealed ONLY when clicked */}
                  {isExpanded && (
                    <div className="px-3.5 py-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Vulnerability Tier:
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${roleObj.badge}`}
                          >
                            {roleObj.label}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveMember(m.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Active CPCB AQI Sensitivity Note */}
                      <div className="text-xs text-slate-300 bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 leading-relaxed">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                          <HeartPulse className="w-3 h-3 text-rose-400" />
                          <span>Sensitivity for AQI {activeAqi} ({activeCategory}):</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{sensitivityNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 text-xs text-slate-400 mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>No family members added yet. Add a family member below (e.g. child, senior, asthmatic) to tailor protection protocols.</span>
          </div>
        )}
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
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      )}
    </div>
  );
};
