import { useState, useCallback } from "react";
import type {
  AqiResponse,
  FamilyMember,
  RoutineChoice,
  IndoorContext,
  AdviceResponse,
  AdviceInputSnapshot,
} from "../types/index.js";
import { generateClientFallbackAdvice } from "../utils/clientFallbackAdvice.js";

export function useGeminiAdvice() {
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [lastGeneratedSnapshot, setLastGeneratedSnapshot] = useState<AdviceInputSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = useCallback(
    async (
      aqiSnapshot: AqiResponse,
      familyMembers: FamilyMember[],
      routineChoices: RoutineChoice[],
      indoorContext?: IndoorContext
    ) => {
      setLoading(true);
      setError(null);

      const effectiveIndoorContext = indoorContext ?? {
        hasAirPurifier: true,
        hasPlants: true,
        ventilationType: "natural",
      };

      try {
        const payload = {
          aqiSnapshot,
          familyProfile: { members: familyMembers },
          routineChoices,
          indoorContext: effectiveIndoorContext,
        };

        const res = await fetch("/api/advice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer guest-client-session",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.warn(`Server /api/advice returned ${res.status}. Using direct client fallback engine.`);
          const fallbackData = generateClientFallbackAdvice(
            aqiSnapshot,
            familyMembers,
            routineChoices,
            effectiveIndoorContext
          );
          setAdvice(fallbackData);
        } else {
          const data = (await res.json()) as AdviceResponse;
          setAdvice(data);
        }

        // Save immutable snapshot of exact inputs used to generate this plan
        setLastGeneratedSnapshot({
          city: aqiSnapshot.city,
          lat: aqiSnapshot.lat,
          lon: aqiSnapshot.lon,
          aqi: aqiSnapshot.aqi,
          category: aqiSnapshot.category,
          prominentPollutant: aqiSnapshot.prominentPollutant,
          pollutants: [...aqiSnapshot.pollutants],
          members: familyMembers.map((m) => ({ ...m })),
          routineChoices: routineChoices.map((r) => ({ ...r })),
          generatedAt: new Date().toISOString(),
        });
      } catch (err: unknown) {
        console.warn("Advice request failed, executing client fallback:", err);
        const fallbackData = generateClientFallbackAdvice(
          aqiSnapshot,
          familyMembers,
          routineChoices,
          effectiveIndoorContext
        );
        setAdvice(fallbackData);
        setLastGeneratedSnapshot({
          city: aqiSnapshot.city,
          lat: aqiSnapshot.lat,
          lon: aqiSnapshot.lon,
          aqi: aqiSnapshot.aqi,
          category: aqiSnapshot.category,
          prominentPollutant: aqiSnapshot.prominentPollutant,
          pollutants: [...aqiSnapshot.pollutants],
          members: familyMembers.map((m) => ({ ...m })),
          routineChoices: routineChoices.map((r) => ({ ...r })),
          generatedAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { advice, lastGeneratedSnapshot, loading, error, getAdvice };
}
