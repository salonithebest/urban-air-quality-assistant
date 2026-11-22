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
    <div className="min-h-screen text-[#0F172A] flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full">
        {/* Luxury Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Google PromptWars 06
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                CPCB National AQI Standard
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Urban Air Quality Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Family-centered urban air health planner for Indian cities with verified CPCB breakpoint interpolation &amp; deterministic carbon reduction.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              onClick={refetch}
              disabled={aqiLoading}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              title="Refresh live atmospheric data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${aqiLoading ? "animate-spin" : ""}`} />
              <span>{aqiLoading ? "Syncing..." : "Refresh Atmosphere"}</span>
            </button>
          </div>
        </header>

        {/* City / Locality Selector */}
        <CitySelector
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          isLoading={aqiLoading}
        />

        {/* Loading State */}
        {aqiLoading && !aqiData && (
          <div className="luxury-card rounded-2xl p-14 text-center mb-6 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="font-extrabold text-slate-900 text-base">Fetching live atmospheric models from Open-Meteo...</p>
            <p className="text-xs text-slate-400 mt-1">Executing CPCB segmented linear sub-index interpolation</p>
          </div>
        )}

        {/* Error Notice */}
        {aqiError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs sm:text-sm mb-6 flex items-start gap-3">
            <Shield className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-slate-900 block mb-0.5">Atmospheric Sync Notice:</strong>
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

        {/* Household & Commute Inputs */}
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

        {/* Advice CTA Action Banner */}
        {aqiData && (
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white mb-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
                  AI-Powered Family Intelligence
                </span>
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Synthesize Personalized Family Protocol
              </h3>
              <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
                Grounds Gemini 2.0 Flash in your household's vulnerable conditions, {selectedCity.name}’s calculated AQI ({aqiData.aqi} - {aqiData.category}), and chosen commute legs to output time-slotted routines and indoor air safeguards.
              </p>
            </div>

            <button
              onClick={handleGenerateAdvice}
              disabled={adviceLoading}
              className="relative z-10 w-full md:w-auto px-7 py-3.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 font-black text-sm text-slate-950 rounded-xl shadow-md flex items-center justify-center gap-2.5 shrink-0 transition-all active:scale-95 cursor-pointer"
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
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs mb-6">
            <strong className="text-slate-900 block mb-0.5">Generation Warning:</strong>
            {adviceError}
          </div>
        )}

        {/* Advice & CO2 Results Display */}
        {advice && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Family Action Plan &amp; Low-Emission Strategy
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
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
