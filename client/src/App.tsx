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

import { Sparkles, Loader2, RefreshCw } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Google PromptWars 06
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Urban Air Quality Assistant
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Family-focused health planner, CPCB national index, and low-emission routine optimizer.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={refetch}
              disabled={aqiLoading}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${aqiLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* City Selector */}
        <CitySelector
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          isLoading={aqiLoading}
        />

        {/* Live AQI Error/Loading State */}
        {aqiLoading && !aqiData && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm mb-6 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="font-semibold text-slate-700">Fetching live atmosphere data from Open-Meteo...</p>
            <p className="text-xs text-slate-400 mt-1">Applying CPCB linear sub-index interpolation formulas</p>
          </div>
        )}

        {aqiError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-sm mb-6">
            <strong>Unable to load air data:</strong> {aqiError}
          </div>
        )}

        {/* Core AQI View */}
        {aqiData && (
          <>
            <AqiGauge data={aqiData} />
            <PollutantGrid pollutants={aqiData.pollutants} />
          </>
        )}

        {/* Family & Routine Planner Inputs */}
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

        {/* Advice Generator Call-To-Action */}
        {aqiData && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 shadow-md text-white mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                Generate Family Impact & Routine Advice
              </h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                Synthesizes Gemini 2.0 Flash with your family’s ages/conditions, calculated AQI ({aqiData.aqi}), and low-emission commute choices.
              </p>
            </div>

            <button
              onClick={handleGenerateAdvice}
              disabled={adviceLoading}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 disabled:opacity-75 font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              {adviceLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {advice ? "Re-generate Advice" : "Get Family Action Plan"}
                </>
              )}
            </button>
          </div>
        )}

        {adviceError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-sm mb-6">
            {adviceError}
          </div>
        )}

        {/* Advice & CO2 Results Display */}
        {advice && (
          <>
            <Co2SavingsWidget co2Estimate={advice.co2Estimate} />
            <FamilyAdviceSection memberAdvice={advice.memberAdvice} />
            <IndoorTipsPanel
              routineSuggestions={advice.routineSuggestions}
              indoorTips={advice.indoorTips}
            />
          </>
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
