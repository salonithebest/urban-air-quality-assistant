import { useState, useEffect, useCallback } from "react";
import type { AqiResponse } from "../types/index.js";
import type { City } from "../config/cities.js";
import { fetchClientAqi } from "../utils/clientOpenMeteo.js";

export function useAirQuality(city: City) {
  const [data, setData] = useState<AqiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAqi = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/air-quality?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(
        city.name
      )}`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        // Fallback directly to client-side Open-Meteo & CPCB calculation
        console.warn(`Server /api/air-quality returned ${res.status}. Using direct Open-Meteo client fallback.`);
        const directData = await fetchClientAqi(city.lat, city.lon, city.name);
        setData(directData);
        return;
      }

      const json = (await res.json()) as AqiResponse;
      setData(json);
    } catch (err: unknown) {
      console.warn("API fetch error, falling back to client-side Open-Meteo engine:", err);
      try {
        const directData = await fetchClientAqi(city.lat, city.lon, city.name);
        setData(directData);
      } catch (fallbackErr: unknown) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : "Failed to load air quality data");
      }
    } finally {
      setLoading(false);
    }
  }, [city.lat, city.lon, city.name]);

  useEffect(() => {
    fetchAqi();
  }, [fetchAqi]);

  return { data, loading, error, refetch: fetchAqi };
}
