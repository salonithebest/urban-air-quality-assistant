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
      <div className="glass-card rounded-2xl p-6 mb-6 text-center text-slate-500">
        <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No family member advice generated yet.</p>
        <p className="text-xs text-slate-500 mt-1">Add members to your household profile to synthesize custom health protocols.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-xl tracking-tight">
              Personalized Family Member Health Protocols
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Targeted biological vulnerability mitigation and daily exposure scheduling per household profile.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full hidden sm:inline-block">
          {memberAdvice.length} {memberAdvice.length === 1 ? "Member Protocol" : "Member Protocols"}
        </span>
      </div>

      {/* Spacious 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {memberAdvice.map((advice) => (
          <div
            key={advice.memberId}
            className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm"
          >
            <div>
              {/* Member Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="font-black text-slate-900 text-lg tracking-tight flex items-center gap-2.5">
                  <HeartPulse className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>{advice.memberName}</span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-teal-600" /> Action Protocol
                </span>
              </div>

              {/* Biological Health Vulnerability Assessment */}
              <div className="text-xs sm:text-sm text-rose-900 bg-rose-50/80 border border-rose-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 block mb-1">
                    Physiological Exposure Assessment
                  </span>
                  <p className="text-slate-700 font-medium">{advice.healthImpact}</p>
                </div>
              </div>

              {/* Specific Safeguards & Actionable Countermeasures */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-800 block mb-1">
                  Specific Safeguards &amp; Time-Slotted Routines
                </span>
                {advice.personalTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
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
