import React from "react";
import type { MemberAdvice } from "../types/index.js";
import { UserCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

interface FamilyAdviceSectionProps {
  memberAdvice: MemberAdvice[];
}

export const FamilyAdviceSection: React.FC<FamilyAdviceSectionProps> = ({
  memberAdvice,
}) => {
  if (!memberAdvice || memberAdvice.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-slate-800 text-lg">
          Personalized Health Impact & Routine Tips
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberAdvice.map((advice) => (
          <div
            key={advice.memberId}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="font-bold text-slate-900 text-base">
                  {advice.memberName}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Personal Care
                </span>
              </div>

              <div className="text-xs text-rose-700 bg-rose-50/70 border border-rose-100 rounded-xl p-2.5 mb-3 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{advice.healthImpact}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recommended Routine Actions
                </span>
                {advice.personalTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
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
