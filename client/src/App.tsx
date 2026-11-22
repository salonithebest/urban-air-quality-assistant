import React, { useState } from "react";
import { INDIAN_CITIES, type City } from "./config/cities.js";
import { useAirQuality } from "./hooks/useAirQuality.js";
import { useFamilyProfile } from "./hooks/useFamilyProfile.js";
import { useGeminiAdvice } from "./hooks/useGeminiAdvice.js";
import type { RoutineChoice } from "./types/index.js";

import { CitySelector } from "./components/CitySelector.js";
import { DimensionalPentagon } from "./components/DimensionalPentagon.js";
import { AqiGauge } from "./components/AqiGauge.js";
import { PollutantGrid } from "./components/PollutantGrid.js";
import { FamilyProfileForm } from "./components/FamilyProfileForm.js";
import { RoutinePanel } from "./components/RoutinePanel.js";
import { FamilyAdviceSection } from "./components/FamilyAdviceSection.js";
import { IndoorTipsPanel } from "./components/IndoorTipsPanel.js";
import { Co2SavingsWidget } from "./components/Co2SavingsWidget.js";
import { AqiCardFooter } from "./components/AqiCardFooter.js";

import { Sparkles, Loader2, RefreshCw, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

export const App: React.FC = () => {
  // Start with Surat (as requested by user)
  const [selectedCity, setSelectedCity] = useState<City>(INDIAN_CITIES[0]!);

  // Default routine choices: 50 min total, 15.0 km active transit
  const [routineChoices, setRoutineChoices] = useState<RoutineChoice[]>([
    { activityType: "metro", durationMinutes: 35, distanceKm: 14 },
    { activityType: "walk", durationMinutes: 15, distanceKm: 1 },
  ]);

  // Data hooks
  const { data: aqiData, loading: aqiLoading, error: aqiError, refetch } = useAirQuality(selectedCity);
  const { members, addMember, removeMember } = useFamilyProfile();
  const { advice, lastGeneratedSnapshot, loading: adviceLoading, error: adviceError, getAdvice } = useGeminiAdvice();

  // Detect whether the currently rendered advice is stale / out of sync with current session inputs
  const isPlanOutOfSync = Boolean(
    advice &&
      lastGeneratedSnapshot &&
      (lastGeneratedSnapshot.city.toLowerCase() !== selectedCity.name.toLowerCase() ||
        lastGeneratedSnapshot.aqi !== aqiData?.aqi ||
        JSON.stringify(lastGeneratedSnapshot.members) !== JSON.stringify(members) ||
        JSON.stringify(lastGeneratedSnapshot.routineChoices) !== JSON.stringify(routineChoices))
  );

  const handleGenerateAdvice = () => {
    if (!aqiData) return;
    if (members.length === 0) return;
    getAdvice(aqiData, members, routineChoices);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full">
        {/* Luxury Cyber Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/30">
                Google PromptWars 06
              </span>
              <span className="text-[11px] font-bold text-slate-300 bg-slate-800/80 border border-slate-700 px-3 py-0.5 rounded-full hidden sm:inline-block">
                CPCB National AQI Standard
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Urban Air Quality Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Family-centered urban air health planner for Indian cities with verified CPCB breakpoint interpolation &amp; deterministic carbon reduction.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              onClick={refetch}
              disabled={aqiLoading}
              className="px-4 py-2.5 bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500 text-white hover:text-emerald-300 text-xs font-black rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-black/40 cursor-pointer"
              title="Refresh live atmospheric data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${aqiLoading ? "animate-spin" : ""}`} />
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
          <div className="cyber-panel rounded-3xl p-14 text-center mb-6 flex flex-col items-center justify-center border border-emerald-500/20">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
            <p className="font-black text-white text-lg">Fetching live atmospheric models from Open-Meteo...</p>
            <p className="text-xs text-slate-400 mt-1">Executing CPCB segmented linear sub-index interpolation for {selectedCity.name}</p>
          </div>
        )}

        {/* Error Notice */}
        {aqiError && (
          <div className="bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-2xl p-4 text-xs sm:text-sm mb-6 flex items-start gap-3">
            <Shield className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block mb-0.5">Atmospheric Sync Notice:</strong>
              {aqiError}
            </div>
          </div>
        )}

        {/* Core Atmospheric Visualization */}
        {aqiData && (
          <>
            {/* 3D Dimensional Atmosphere Matrix (Naukri Campus AI-Q inspired) */}
            <DimensionalPentagon
              aqi={aqiData.aqi}
              category={aqiData.category}
              city={aqiData.city}
              prominentPollutant={aqiData.prominentPollutant}
              pollutants={aqiData.pollutants}
            />

            {/* Standard CPCB Gauge */}
            <AqiGauge data={aqiData} />

            {/* 6 Pollutant Micro-Cards */}
            <PollutantGrid pollutants={aqiData.pollutants} />
          </>
        )}

        {/* Household & Commute Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FamilyProfileForm
            members={members}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            activeAqi={aqiData?.aqi}
            activeCategory={aqiData?.category}
            activeProminentPollutant={aqiData?.prominentPollutant}
          />
          <RoutinePanel
            choices={routineChoices}
            onChangeChoices={setRoutineChoices}
          />
        </div>

        {/* Real-time Deterministic Commute CO₂ Engine (Live sync with RoutinePanel) */}
        <div className="mb-6">
          <Co2SavingsWidget routineChoices={routineChoices} />
        </div>

        {/* Advice CTA Action Banner */}
        {aqiData && (
          <div className="cyber-panel-glow rounded-3xl p-6 sm:p-8 text-white mb-6 flex flex-col md:flex-row items-center justify-between gap-5 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                  AI-Powered Family Intelligence
                </span>
              </div>
              <h3 className="font-black text-2xl sm:text-3xl text-white tracking-tight">
                Synthesize Personalized Family Protocol
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
                Grounds Gemini 2.0 Flash strictly in {selectedCity.name}’s calculated CPCB AQI ({aqiData.aqi} - {aqiData.category}), prominent driver ({aqiData.prominentPollutant.toUpperCase()}), {members.length} family profiles, and low-emission commute legs.
              </p>

              {members.length === 0 && (
                <p className="text-xs text-amber-300 mt-2 font-semibold">
                  ⚠️ Please add at least one household member above before generating your action plan.
                </p>
              )}
            </div>

            <button
              onClick={handleGenerateAdvice}
              disabled={adviceLoading || members.length === 0}
              className="relative z-10 w-full md:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed font-black text-sm text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 shrink-0 transition-all active:scale-95 cursor-pointer"
            >
              {adviceLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing Strategy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{advice ? "Re-synthesize Action Plan" : "Get Family Action Plan"}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Advice Error Display */}
        {adviceError && (
          <div className="bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-2xl p-4 text-xs mb-6">
            <strong className="font-bold text-white block mb-0.5">Advice Synthesis Notice:</strong>
            {adviceError}
          </div>
        )}

        {/* Out-of-Sync Indicator Banner */}
        {isPlanOutOfSync && lastGeneratedSnapshot && (
          <div className="bg-amber-500/15 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-amber-300 text-sm sm:text-base block">
                  Action Plan Out of Sync with Current Session Inputs
                </span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  The protocol below was generated for <strong>{lastGeneratedSnapshot.city}</strong> (AQI {lastGeneratedSnapshot.aqi}), but your current active inputs are <strong>{selectedCity.name}</strong> (AQI {aqiData?.aqi ?? "..."}) with {members.length} members and {routineChoices.length} commute legs. Click Refresh to regenerate.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAdvice}
              disabled={adviceLoading || members.length === 0}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shrink-0 transition-all active:scale-95 shadow-md cursor-pointer self-stretch md:self-auto justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${adviceLoading ? "animate-spin" : ""}`} />
              <span>Update Plan Now</span>
            </button>
          </div>
        )}

        {/* AI Action Plan Results */}
        {advice && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Personalized Family Action Plan
                </h2>
              </div>

              {lastGeneratedSnapshot && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Synchronized with <strong>{lastGeneratedSnapshot.city}</strong> (AQI {lastGeneratedSnapshot.aqi}) • {lastGeneratedSnapshot.members.length} Profiles
                  </span>
                </div>
              )}
            </div>

            {/* Individual Family Member Protocols */}
            <FamilyAdviceSection memberAdvice={advice.memberAdvice} />

            {/* Indoor Air Hacks & Commute Schedules */}
            <IndoorTipsPanel
              routineSuggestions={advice.routineSuggestions}
              indoorTips={advice.indoorTips}
            />
          </div>
        )}

        {/* Methodology & Data Source Disclaimers */}
        {aqiData && <AqiCardFooter dataNote={aqiData.dataNote} />}
      </div>
    </div>
  );
};
