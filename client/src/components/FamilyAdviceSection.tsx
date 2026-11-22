import React from "react";
import type { MemberAdvice } from "../types/index.js";
import { UserCheck, ShieldAlert, CheckCircle2, HeartPulse } from "lucide-react";

interface FamilyAdviceSectionProps {
  memberAdvice: MemberAdvice[];
}

export const FamilyAdviceSection: React.FC<FamilyAdviceSectionProps> = ({
  memberAdvice,
}) => {
  if (!memberAdvice || memberAdvice.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <UserCheck className="w-4 h-4" />
        </div>
        <h3 className="font-extrabold text-slate-100 text-lg tracking-tight">
          Personalized Family Member Health Protocols
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberAdvice.map((advice) => (
          <div
            key={advice.memberId}
            className="glass-card rounded-3xl p-5 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all duration-300 relative group overflow-hidden"
          >
            {/* Top highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  {advice.memberName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                  Tailored Action
                </span>
              </div>

              {/* Health Impact Box */}
              <div className="text-xs text-rose-200 bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 mb-3.5 flex items-start gap-2.5 shadow-inner">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-normal">{advice.healthImpact}</p>
              </div>

              {/* Actionable Tips */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                  Specific Safeguards
                </span>
                {advice.personalTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
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
