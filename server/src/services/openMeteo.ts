/**
 * openMeteo.ts
 *
 * Client for Open-Meteo Air Quality API.
 * Fetches hourly/current concentrations of:
 *   - pm2_5
 *   - pm10
 *   - nitrogen_dioxide
 *   - sulphur_dioxide
 *   - ozone
 *   - carbon_monoxide
 *
 * CRITICAL RULE:
 * Open-Meteo returns CO in µg/m³. CPCB breakpoints require mg/m³.
 * This client divides the raw CO value by 1000 before returning it.
 */

import type { RawConcentration } from "./aqiEngine.js";

export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  current?: {
    time: string;
    interval: number;
    pm10?: number | null;
    pm2_5?: number | null;
    carbon_monoxide?: number | null;
    nitrogen_dioxide?: number | null;
    sulphur_dioxide?: number | null;
    ozone?: number | null;
  };
}

export async function fetchPollutantData(
  lat: number,
  lon: number
): Promise<{
  rawConcentrations: RawConcentration[];
  timestamp: string;
}> {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set(
    "current",
    "pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide"
  );
  url.searchParams.set("timezone", "Asia/Kolkata");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `Open-Meteo API returned status ${response.status}: ${response.statusText}`
    );
  }

  const data = (await response.json()) as OpenMeteoAirQualityResponse;

  if (!data.current) {
    throw new Error("No current conditions returned from Open-Meteo API");
  }

  const c = data.current;

  // IMPORTANT: CO in µg/m³ converted to mg/m³ for CPCB formula
  const coMgM3 =
    typeof c.carbon_monoxide === "number" && c.carbon_monoxide !== null
      ? c.carbon_monoxide / 1000
      : null;

  const rawConcentrations: RawConcentration[] = [
    {
      pollutant: "pm2_5",
      concentration: typeof c.pm2_5 === "number" ? c.pm2_5 : null,
    },
    {
      pollutant: "pm10",
      concentration: typeof c.pm10 === "number" ? c.pm10 : null,
    },
    {
      pollutant: "no2",
      concentration:
        typeof c.nitrogen_dioxide === "number" ? c.nitrogen_dioxide : null,
    },
    {
      pollutant: "so2",
      concentration:
        typeof c.sulphur_dioxide === "number" ? c.sulphur_dioxide : null,
    },
    {
      pollutant: "o3",
      concentration: typeof c.ozone === "number" ? c.ozone : null,
    },
    {
      pollutant: "co",
      concentration: coMgM3,
    },
  ];

  return {
    rawConcentrations,
    timestamp: c.time ? new Date(c.time).toISOString() : new Date().toISOString(),
  };
}
