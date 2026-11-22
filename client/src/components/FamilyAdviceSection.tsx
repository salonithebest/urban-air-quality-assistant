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
        <UserCheck className="w-5 h-5 text-indigo-600" />
        <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
          Personalized Family Member Health Protocols
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberAdvice.map((advice) => (
          <div
            key={advice.memberId}
            className="luxury-card rounded-2xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <span className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  {advice.memberName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  Action Protocol
                </span>
              </div>

              {/* Health Vulnerability Box */}
              <div className="text-xs text-rose-900 bg-rose-50/70 border border-rose-200 rounded-xl p-3 mb-3.5 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{advice.healthImpact}</p>
              </div>

              {/* Specific Safeguards */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  Specific Safeguards
                </span>
                {advice.personalTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
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
