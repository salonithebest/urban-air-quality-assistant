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
  { value: "infant", label: "Infant (0–2 yrs)", badge: "bg-purple-50 text-purple-700 border-purple-200", isHighRisk: true },
  { value: "child", label: "Child (3–12 yrs)", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", isHighRisk: true },
  { value: "senior", label: "Senior Citizen (60+ yrs)", badge: "bg-rose-50 text-rose-700 border-rose-200", isHighRisk: true },
  { value: "asthmatic", label: "Asthmatic / Respiratory", badge: "bg-red-50 text-red-700 border-red-200", isHighRisk: true },
  { value: "cardiac", label: "Cardiac / Heart condition", badge: "bg-amber-50 text-amber-700 border-amber-200", isHighRisk: true },
  { value: "pregnant", label: "Pregnant", badge: "bg-pink-50 text-pink-700 border-pink-200", isHighRisk: true },
  { value: "adult", label: "Healthy Adult", badge: "bg-slate-100 text-slate-700 border-slate-200" },
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
    <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
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
            <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs">
              {members.length} / 10 Members
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
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
                  className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all duration-200"
                >
                  {/* Compact Header: Name + Dropdown Toggle (Category Hidden Until Expanded) */}
                  <div
                    onClick={() => toggleExpand(m.id)}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm">{m.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                        {isExpanded ? "Hide profile" : "View profile"}
                      </span>
                      <button
                        type="button"
                        className="p-1 text-slate-500 hover:text-teal-600 transition-colors"
                        aria-label={isExpanded ? "Collapse member" : "Expand member"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-teal-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Dropdown Content: Revealed ONLY when clicked */}
                  {isExpanded && (
                    <div className="px-4 py-3.5 border-t border-slate-100 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Vulnerability Tier:
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${roleObj.badge}`}
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
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Active CPCB AQI Sensitivity Note */}
                      <div className="text-xs text-slate-700 bg-white border border-slate-200/80 rounded-xl p-3 leading-relaxed shadow-2xs">
                        <div className="flex items-center gap-1.5 text-teal-800 font-bold text-[10px] uppercase tracking-wider mb-1">
                          <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sensitivity for AQI {activeAqi} ({activeCategory}):</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{sensitivityNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-dashed border-slate-300 text-xs text-slate-500 mb-4 flex items-center gap-2 font-medium">
            <UserPlus className="w-4 h-4 text-teal-600" />
            <span>No family members added yet. Add a family member below (e.g. child, senior, asthmatic) to tailor protection protocols.</span>
          </div>
        )}
      </div>

      {/* Add Member Form */}
      {members.length < 10 && (
        <form
          onSubmit={handleSubmit}
          className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          aria-label="Add new household member form"
        >
          <label htmlFor="member-name-input" className="sr-only">
            Family member name
          </label>
          <input
            id="member-name-input"
            type="text"
            placeholder="Name (e.g. Child, Senior)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs glass-input rounded-xl focus:outline-none font-medium"
            maxLength={30}
            aria-label="Family member name"
          />

          <label htmlFor="member-role-select" className="sr-only">
            Vulnerability profile role
          </label>
          <select
            id="member-role-select"
            value={role}
            onChange={(e) => setRole(e.target.value as FamilyRole)}
            className="px-3 py-2.5 text-xs glass-input rounded-xl font-bold text-slate-800 cursor-pointer"
            aria-label="Select biological vulnerability role"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-white text-slate-900">
                {r.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!name.trim()}
            aria-label="Add member to household"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add</span>
          </button>
        </form>
      )}
    </div>
  );
};
