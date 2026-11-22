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
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3.5">
        <UserCheck className="w-5 h-5 text-emerald-400" />
        <h3 className="font-extrabold text-white text-lg tracking-tight">
          Personalized Family Member Health Protocols
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberAdvice.map((advice) => (
          <div
            key={advice.memberId}
            className="cyber-panel rounded-2xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  {advice.memberName}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  Action Protocol
                </span>
              </div>

              {/* Health Vulnerability Box */}
              <div className="text-xs text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-3.5 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{advice.healthImpact}</p>
              </div>

              {/* Specific Safeguards */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
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
