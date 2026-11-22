import React from "react";
import type { MemberAdvice } from "../types/index.js";
import { UserCheck, ShieldAlert, CheckCircle2, HeartPulse, Sparkles } from "lucide-react";

interface FamilyAdviceSectionProps {
  memberAdvice: MemberAdvice[];
}

export const FamilyAdviceSection: React.FC<FamilyAdviceSectionProps> = ({
  memberAdvice,
}) => {
  if (!memberAdvice || memberAdvice.length === 0) {
    return (
      <div className="cyber-panel rounded-2xl p-6 mb-6 text-center text-slate-400">
        <UserCheck className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">No family member advice generated yet.</p>
        <p className="text-xs text-slate-500 mt-1">Add members to your household profile to synthesize custom health protocols.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-white text-xl tracking-tight">
              Personalized Family Member Health Protocols
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted biological vulnerability mitigation and daily exposure scheduling per household profile.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full hidden sm:inline-block">
          {memberAdvice.length} {memberAdvice.length === 1 ? "Member Protocol" : "Member Protocols"}
        </span>
      </div>

      {/* Spacious 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {memberAdvice.map((advice) => (
          <div
            key={advice.memberId}
            className="cyber-panel-glow rounded-3xl p-6 sm:p-7 flex flex-col justify-between border border-emerald-500/25 hover:border-emerald-500/50 transition-all shadow-xl"
          >
            <div>
              {/* Member Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="font-black text-white text-lg tracking-tight flex items-center gap-2.5">
                  <HeartPulse className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{advice.memberName}</span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Action Protocol
                </span>
              </div>

              {/* Biological Health Vulnerability Assessment */}
              <div className="text-xs sm:text-sm text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block mb-1">
                    Physiological Exposure Assessment
                  </span>
                  <p className="text-slate-200">{advice.healthImpact}</p>
                </div>
              </div>

              {/* Specific Safeguards & Actionable Countermeasures */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  Specific Safeguards &amp; Time-Slotted Routines
                </span>
                {advice.personalTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
