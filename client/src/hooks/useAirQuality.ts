import { useState, useEffect, useCallback } from "react";
import type { AqiResponse } from "../types/index.js";
import type { City } from "../config/cities.js";

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
      const res = await fetch(url);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to fetch AQI (HTTP ${res.status})`);
      }

      const json = (await res.json()) as AqiResponse;
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load air quality data");
    } finally {
      setLoading(false);
    }
  }, [city.lat, city.lon, city.name]);

  useEffect(() => {
    fetchAqi();
  }, [fetchAqi]);

  return { data, loading, error, refetch: fetchAqi };
}
