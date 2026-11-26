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

import { Sparkles, Loader2, RefreshCw, Shield, AlertTriangle, CheckCircle2, Wind } from "lucide-react";

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
  const { members, addMember, removeMember, resetToDefaults } = useFamilyProfile();
  const { advice, lastGeneratedSnapshot, loading: adviceLoading, error: adviceError, isFallback, getAdvice } = useGeminiAdvice();

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

  // Auto-generate initial advice when aqiData first loads so advice appears immediately on screen
  React.useEffect(() => {
    if (aqiData && !advice && !adviceLoading && members.length > 0) {
      getAdvice(aqiData, members, routineChoices);
    }
  }, [aqiData, advice, adviceLoading, members, routineChoices, getAdvice]);

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 flex flex-col items-center justify-between">
      {/* WCAG 2.1 AAA Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only sr-only-focusable z-50 bg-teal-800 text-white font-bold px-4 py-2 rounded-xl shadow-lg border border-teal-600 fixed top-3 left-3"
      >
        Skip to main content
      </a>

      {/* Floating Ambient Organic Blobs for Dreamy SaaS Background */}
      <div className="fixed top-12 left-10 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl pointer-events-none -z-10" aria-hidden="true" />
      <div className="fixed bottom-16 right-10 w-[28rem] h-[28rem] bg-indigo-300/30 rounded-full blur-3xl pointer-events-none -z-10" aria-hidden="true" />
      <div className="fixed top-1/2 left-1/3 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -z-10" aria-hidden="true" />

      {/* Main Glass Canvas Container */}
      <div className="frosted-canvas max-w-6xl w-full rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative">
        {/* Luxury SaaS Header */}
        <header role="banner" className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 pb-8">
          <div>
            {/* Top Brand & Status Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                  <Wind className="w-4 h-4" />
                </span>
                Urban Air Quality Assistant
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                Live Atmospheric Model
              </span>

              <span className="text-[11px] font-bold text-slate-600 bg-white/80 border border-slate-200/80 px-3 py-1 rounded-full shadow-xs hidden sm:inline-block">
                CPCB National AQI Standard
              </span>
            </div>

            {/* Hero Title & Value Proposition */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Urban Air Quality Assistant
            </h1>

            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed font-medium">
              Protect your family from winter smog with CPCB breakpoint calculations, personalized vulnerability protocols, and carbon-cutting commute routines.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={refetch}
              disabled={aqiLoading}
              className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 hover:text-teal-700 text-xs font-black rounded-2xl flex items-center gap-2.5 transition-all active:scale-95 shadow-sm shadow-slate-200/50 cursor-pointer"
              title="Refresh live atmospheric data"
            >
              <RefreshCw className={`w-4 h-4 text-teal-600 ${aqiLoading ? "animate-spin" : ""}`} />
              <span>{aqiLoading ? "Syncing..." : "Refresh Readings"}</span>
            </button>
          </div>
        </header>

        {/* Main Content Landmark */}
        <main id="main-content" role="main" tabIndex={-1} className="outline-none">

        {/* City / Locality Selector */}
        <CitySelector
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          isLoading={aqiLoading}
        />

        {/* Loading State */}
        {aqiLoading && !aqiData && (
          <div className="glass-card rounded-3xl p-14 text-center mb-6 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-3" />
            <p className="font-black text-slate-900 text-lg">Fetching live atmospheric models from Open-Meteo...</p>
            <p className="text-xs text-slate-500 mt-1">Executing CPCB segmented linear sub-index interpolation for {selectedCity.name}</p>
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

        {/* Core Atmospheric Visualization */}
        {aqiData && (
          <>
            {/* 3D Dimensional Atmosphere Matrix */}
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
            onResetToDefaults={resetToDefaults}
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
          <div className="glass-card-glow rounded-3xl p-6 sm:p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-teal-800">
                  AI-Powered Family Intelligence
                </span>
              </div>
              <h3 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Synthesize Personalized Family Protocol
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed font-medium">
                Grounds Gemini 2.0 Flash strictly in {selectedCity.name}’s calculated CPCB AQI ({aqiData.aqi} - {aqiData.category}), prominent driver ({aqiData.prominentPollutant.toUpperCase()}), {members.length} family profiles, and low-emission commute legs.
              </p>

              {members.length === 0 && (
                <p className="text-xs text-amber-700 mt-2 font-semibold">
                  ⚠️ Please add at least one household member above before generating your action plan.
                </p>
              )}
            </div>

            <button
              onClick={handleGenerateAdvice}
              disabled={adviceLoading || members.length === 0}
              className="relative z-10 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed font-black text-sm text-white rounded-2xl shadow-xl shadow-teal-600/25 flex items-center justify-center gap-2.5 shrink-0 transition-all active:scale-95 cursor-pointer"
            >
              {adviceLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Strategy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{advice ? "Re-synthesize Action Plan" : "Get Family Action Plan"}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Advice Error Display */}
        {adviceError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs mb-6">
            <strong className="font-bold text-slate-900 block mb-0.5">Advice Synthesis Notice:</strong>
            {adviceError}
          </div>
        )}

        {/* Out-of-Sync Indicator Banner */}
        {isPlanOutOfSync && lastGeneratedSnapshot && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-amber-900 text-sm sm:text-base block">
                  Action Plan Out of Sync with Current Session Inputs
                </span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  The protocol below was generated for <strong>{lastGeneratedSnapshot.city}</strong> (AQI {lastGeneratedSnapshot.aqi}), but your current active inputs are <strong>{selectedCity.name}</strong> (AQI {aqiData?.aqi ?? "..."}) with {members.length} members and {routineChoices.length} commute legs. Click Refresh to regenerate.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAdvice}
              disabled={adviceLoading || members.length === 0}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl flex items-center gap-2 shrink-0 transition-all active:scale-95 shadow-md cursor-pointer self-stretch md:self-auto justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${adviceLoading ? "animate-spin" : ""}`} />
              <span>Update Plan Now</span>
            </button>
          </div>
        )}

        {/* AI Action Plan Results */}
        {advice && (
          <div className="mt-8 pt-8 border-t border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600" />
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Personalized Family Action Plan
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isFallback ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    Offline Rule-Engine Fallback
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Synthesized via Gemini 2.0 Flash
                  </span>
                )}

                {lastGeneratedSnapshot && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      Synchronized with <strong>{lastGeneratedSnapshot.city}</strong> (AQI {lastGeneratedSnapshot.aqi}) • {lastGeneratedSnapshot.members.length} Profiles
                    </span>
                  </div>
                )}
              </div>
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
        </main>

        {/* Methodology & Data Source Disclaimers */}
        {aqiData && <AqiCardFooter dataNote={aqiData.dataNote} />}
      </div>
    </div>
  );
};
