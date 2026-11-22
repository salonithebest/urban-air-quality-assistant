import { useState, useCallback } from "react";
import type {
  AqiResponse,
  FamilyMember,
  RoutineChoice,
  IndoorContext,
  AdviceResponse,
} from "../types/index.js";

export function useGeminiAdvice() {
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
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

      try {
        const payload = {
          aqiSnapshot,
          familyProfile: { members: familyMembers },
          routineChoices,
          indoorContext: indoorContext ?? {
            hasAirPurifier: true,
            hasPlants: true,
            ventilationType: "natural",
          },
        };

        const res = await fetch("/api/advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const detailsMsg = errJson.details
            ? errJson.details.map((d: { field: string; message: string }) => `${d.field}: ${d.message}`).join("; ")
            : null;
          throw new Error(detailsMsg || errJson.error || errJson.message || `Failed with status ${res.status}`);
        }

        const data = (await res.json()) as AdviceResponse;
        setAdvice(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to generate personalized advice");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { advice, loading, error, getAdvice };
}
