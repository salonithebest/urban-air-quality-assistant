import type { RawConcentration } from "./aqiEngine.js";
import { computeAqi } from "./aqiEngine.js";
import type { AqiResponse } from "../types/index.js";

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

export async function fetchClientAqi(
  lat: number,
  lon: number,
  cityName: string
): Promise<AqiResponse> {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set(
    "current",
    "pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide"
  );
  url.searchParams.set("timezone", "Asia/Kolkata");

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`Open-Meteo returned status ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoAirQualityResponse;
  if (!data.current) {
    throw new Error("No current conditions returned from Open-Meteo");
  }

  const c = data.current;
  const coMgM3 =
    typeof c.carbon_monoxide === "number" && c.carbon_monoxide !== null
      ? c.carbon_monoxide / 1000
      : null;

  const rawConcentrations: RawConcentration[] = [
    { pollutant: "pm2_5", concentration: c.pm2_5 ?? null },
    { pollutant: "pm10", concentration: c.pm10 ?? null },
    { pollutant: "no2", concentration: c.nitrogen_dioxide ?? null },
    { pollutant: "so2", concentration: c.sulphur_dioxide ?? null },
    { pollutant: "o3", concentration: c.ozone ?? null },
    { pollutant: "co", concentration: coMgM3 },
  ];

  const calculated = computeAqi(rawConcentrations);

  return {
    city: cityName,
    lat,
    lon,
    aqi: calculated.aqi,
    category: calculated.category,
    prominentPollutant: calculated.prominentPollutant,
    pollutants: calculated.readings,
    timestamp: c.time ?? new Date().toISOString(),
    dataNote: "Estimated AQI from model data (hourly) — not an official CPCB reading.",
  };
}
