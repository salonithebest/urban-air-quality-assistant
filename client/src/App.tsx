import React, { useState } from "react";
import { INDIAN_CITIES, type City } from "./config/cities.js";
import { useAirQuality } from "./hooks/useAirQuality.js";
import { useFamilyProfile } from "./hooks/useFamilyProfile.js";
import { useGeminiAdvice } from "./hooks/useGeminiAdvice.js";
import type { RoutineChoice } from "./types/index.js";

import { CitySelector } from "./components/CitySelector.js";
import { AqiGauge } from "./components/AqiGauge.js";
import { PollutantGrid } from "./components/PollutantGrid.js";
import { FamilyProfileForm } from "./components/FamilyProfileForm.js";
import { RoutinePanel } from "./components/RoutinePanel.js";
import { FamilyAdviceSection } from "./components/FamilyAdviceSection.js";
import { IndoorTipsPanel } from "./components/IndoorTipsPanel.js";
import { Co2SavingsWidget } from "./components/Co2SavingsWidget.js";
import { AqiCardFooter } from "./components/AqiCardFooter.js";

import { Sparkles, Loader2, RefreshCw, Shield, Award } from "lucide-react";

export const App: React.FC = () => {
  // Start with Surat (as requested by user)
  const [selectedCity, setSelectedCity] = useState<City>(INDIAN_CITIES[0]!);

  // Default routine choices
  const [routineChoices, setRoutineChoices] = useState<RoutineChoice[]>([
    { activityType: "metro", durationMinutes: 35, distanceKm: 14 },
    { activityType: "walk", durationMinutes: 15, distanceKm: 1 },
  ]);

  // Data hooks
  const { data: aqiData, loading: aqiLoading, error: aqiError, refetch } = useAirQuality(selectedCity);
  const { members, addMember, removeMember } = useFamilyProfile();
  const { advice, loading: adviceLoading, error: adviceError, getAdvice } = useGeminiAdvice();

  const handleGenerateAdvice = () => {
    if (!aqiData) return;
    getAdvice(aqiData, members, routineChoices);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full">
        {/* Header Bar */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
                Google PromptWars 06
              </span>
              <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 hidden sm:inline-block">
                CPCB National AQI Standard
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
              Urban Air Quality Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Family-centered urban air health planner for Indian cities with verified CPCB breakpoint interpolation &amp; deterministic carbon reduction.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              onClick={refetch}
              disabled={aqiLoading}
              className="px-4 py-2.5 glass-card rounded-2xl hover:border-emerald-500/40 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              title="Refresh live atmospheric data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${aqiLoading ? "animate-spin" : ""}`} />
              <span>{aqiLoading ? "Syncing..." : "Refresh Atmosphere"}</span>
            </button>
          </div>
        </header>

        {/* City / Locality Selector with Live Geocoding */}
        <CitySelector
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          isLoading={aqiLoading}
        />

        {/* Live Loading State */}
        {aqiLoading && !aqiData && (
          <div className="glass-panel rounded-3xl p-14 text-center mb-6 flex flex-col items-center justify-center animate-pulse">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
            <p className="font-extrabold text-slate-100 text-lg">Fetching live atmospheric models from Open-Meteo...</p>
            <p className="text-xs text-slate-400 mt-1">Executing CPCB segmented linear sub-index interpolation</p>
          </div>
        )}

        {/* Error Alert */}
        {aqiError && (
          <div className="glass-panel border-rose-500/40 bg-rose-950/40 text-rose-200 rounded-3xl p-5 text-xs sm:text-sm mb-6 flex items-start gap-3">
            <Shield className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block mb-0.5">Atmospheric Sync Notice:</strong>
              {aqiError}
            </div>
          </div>
        )}

        {/* Core AQI View */}
        {aqiData && (
          <>
            <AqiGauge data={aqiData} />
            <PollutantGrid pollutants={aqiData.pollutants} />
          </>
        )}

        {/* Family & Routine Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FamilyProfileForm
            members={members}
            onAddMember={addMember}
            onRemoveMember={removeMember}
          />
          <RoutinePanel
            choices={routineChoices}
            onChangeChoices={setRoutineChoices}
          />
        </div>

        {/* Advice CTA Action Card */}
        {aqiData && (
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-7 text-white mb-6 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300">
                  AI-Powered Family Intelligence
                </span>
              </div>
              <h3 className="font-black text-xl sm:text-2xl text-white tracking-tight">
                Synthesize Personalized Family Protocol
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Grounds Gemini 2.0 Flash in your household's vulnerable conditions, {selectedCity.name}’s calculated AQI ({aqiData.aqi} - {aqiData.category}), and chosen commute legs to output time-slotted routines and indoor air safeguards.
              </p>
            </div>

            <button
              onClick={handleGenerateAdvice}
              disabled={adviceLoading}
              className="relative z-10 w-full md:w-auto px-7 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 font-black text-sm text-slate-950 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 shrink-0 transition-all active:scale-95 hover:shadow-emerald-500/25 cursor-pointer"
            >
              {adviceLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing Strategy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{advice ? "Re-synthesize Strategy" : "Get Family Action Plan"}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Advice Error Notice */}
        {adviceError && (
          <div className="glass-panel border-rose-500/40 bg-rose-950/40 text-rose-200 rounded-3xl p-5 text-xs mb-6">
            <strong className="text-white block mb-0.5">Generation Warning:</strong>
            {adviceError}
          </div>
        )}

        {/* Advice & CO2 Results Display */}
        {advice && (
          <div className="space-y-6 mb-8 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Family Action Plan &amp; Low-Emission Strategy
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tailored health buffer &amp; commute mitigation for {selectedCity.name} at AQI {aqiData?.aqi} ({aqiData?.category}).
                </p>
              </div>
            </div>

            {/* CO2 Savings Widget */}
            <Co2SavingsWidget co2Estimate={advice.co2Estimate} />

            {/* Personalized Family Members Health Advice */}
            <FamilyAdviceSection memberAdvice={advice.memberAdvice} />

            {/* Indoor & Commute Tips */}
            <IndoorTipsPanel
              routineSuggestions={advice.routineSuggestions}
              indoorTips={advice.indoorTips}
            />
          </div>
        )}

        {/* Footer with CC-BY 4.0 Attribution and Disclaimer */}
        <AqiCardFooter
          dataNote={
            aqiData?.dataNote ||
            "Estimated AQI from model data (hourly) — not an official CPCB reading."
          }
        />
      </div>
    </div>
  );
};
