import React, { useState } from "react";
import type { MemberAdvice } from "../types/index.js";
import {
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  HeartPulse,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface FamilyAdviceSectionProps {
  memberAdvice: MemberAdvice[];
}

export const FamilyAdviceSection: React.FC<FamilyAdviceSectionProps> = ({
  memberAdvice,
}) => {
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});

  if (!memberAdvice || memberAdvice.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 mb-6 text-center text-slate-500">
        <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No family member advice generated yet.</p>
        <p className="text-xs text-slate-500 mt-1">Add members to your household profile to synthesize custom health protocols.</p>
      </div>
    );
  }

  const allFlipped = memberAdvice.every((m) => flippedMap[m.memberId]);

  const toggleCard = (memberId: string) => {
    setFlippedMap((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const toggleAllCards = () => {
    const nextState = !allFlipped;
    const updated: Record<string, boolean> = {};
    memberAdvice.forEach((m) => {
      updated[m.memberId] = nextState;
    });
    setFlippedMap(updated);
  };

  return (
    <div className="mb-8" role="region" aria-label="Personalized Family Member Health Protocols">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-2">
              Personalized Family Member Health Protocols
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                Interactive 3D Flip
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Click any card to flip between exposure summary and time-slotted safeguards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleAllCards}
            type="button"
            aria-label={allFlipped ? "Flip all cards to summary view" : "Flip all cards to full protocol details"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
            <span>{allFlipped ? "Flip All to Summary" : "Flip All to Full Details"}</span>
          </button>

          <span className="text-xs font-bold text-slate-700 bg-white/80 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            {memberAdvice.length} {memberAdvice.length === 1 ? "Member Protocol" : "Member Protocols"}
          </span>
        </div>
      </div>

      {/* 3D Flip Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 perspective-1000">
        {memberAdvice.map((advice) => {
          const isFlipped = !!flippedMap[advice.memberId];

          return (
            <div
              key={advice.memberId}
              className="relative w-full h-[460px] perspective-1000 group cursor-pointer select-none"
              onClick={() => toggleCard(advice.memberId)}
              title="Click to flip card"
              role="button"
              tabIndex={0}
              aria-expanded={isFlipped}
              aria-label={`Interactive protocol card for ${advice.memberName}. Currently showing ${isFlipped ? "full details" : "summary preview"}. Click or press Enter to flip.`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleCard(advice.memberId);
                }
              }}
            >
              <div
                className={`flip-card-inner w-full h-full relative transform-style-3d ${
                  isFlipped ? "is-flipped" : ""
                }`}
              >
                {/* ================= FRONT CARD FACE ================= */}
                <div className="absolute inset-0 backface-hidden glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between border border-teal-200/60 bg-white/85 shadow-sm hover:shadow-xl hover:border-teal-400 transition-all">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <span className="font-black text-slate-900 text-lg tracking-tight flex items-center gap-2.5">
                        <HeartPulse className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>{advice.memberName}</span>
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-teal-600" /> Summary View
                      </span>
                    </div>

                    {/* Biological Health Vulnerability Assessment */}
                    <div className="text-xs sm:text-sm text-rose-900 bg-rose-50/85 border border-rose-200/90 rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-2xs">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 block mb-1">
                          Physiological Exposure Assessment
                        </span>
                        <p className="text-slate-700 font-medium line-clamp-3">
                          {advice.healthImpact}
                        </p>
                      </div>
                    </div>

                    {/* Safeguards Preview */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-800 block">
                        Safeguards Preview ({advice.personalTips.length} actions)
                      </span>
                      {advice.personalTips.slice(0, 2).map((tip, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed bg-white/90 border border-slate-200/80 rounded-xl p-2.5 font-medium shadow-2xs line-clamp-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{tip}</span>
                        </div>
                      ))}
                      {advice.personalTips.length > 2 && (
                        <p className="text-[11px] font-bold text-teal-700 pl-1">
                          + {advice.personalTips.length - 2} more tailored countermeasures inside...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Interactive Flip CTA Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-teal-800 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2.5 rounded-2xl border border-teal-200/70 shadow-2xs group-hover:from-teal-100 group-hover:to-emerald-100 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                      Click anywhere on card to flip
                    </span>
                    <span className="flex items-center gap-1 text-teal-700 font-bold group-hover:translate-x-1 transition-transform">
                      View Full Protocol <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* ================= BACK CARD FACE ================= */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between border-2 border-teal-400 bg-white/95 shadow-2xl">
                  <div className="overflow-y-auto pr-1">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-teal-100 pb-3 mb-3 sticky top-0 bg-white/90 backdrop-blur-xs z-10">
                      <span className="font-black text-slate-900 text-lg tracking-tight flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                        <span>{advice.memberName} — Full Protocol</span>
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-teal-700" /> Detailed Directives
                      </span>
                    </div>

                    {/* Complete Physiological Exposure Assessment */}
                    <div className="text-xs text-rose-900 bg-rose-50/90 border border-rose-200 rounded-xl p-3 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 block mb-0.5">
                        Complete Clinical Rationale
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {advice.healthImpact}
                      </p>
                    </div>

                    {/* All Specific Safeguards */}
                    <div className="space-y-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-800 block">
                        All Time-Slotted Routines &amp; Mitigations
                      </span>
                      {advice.personalTips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 font-medium shadow-2xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Flip Back CTA Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-700 bg-slate-100/90 px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs hover:bg-slate-200 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      Click card to flip back
                    </span>
                    <span className="text-slate-600 font-bold">
                      ↩ Return to Summary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
