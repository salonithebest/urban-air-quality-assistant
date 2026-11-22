import React, { useState, useEffect } from "react";
import { INDIAN_CITIES, type City } from "../config/cities.js";
import { MapPin, Search, Loader2 } from "lucide-react";

interface CitySelectorProps {
  selectedCity: City;
  onSelectCity: (city: City) => void;
  isLoading?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  onSelectCity,
  isLoading,
}) => {
  const [search, setSearch] = useState("");
  const [liveResults, setLiveResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter local predefined 30 cities
  const localFiltered = INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  // Open-Meteo free geocoding search for any town/locality (e.g. Limla, Hazira, Adajan, etc.)
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed.length < 2) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          trimmed
        )}&count=5&language=en`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.results && Array.isArray(json.results)) {
            // Filter to India
            const indiaLocations: City[] = json.results
              .filter((r: { country_code?: string; country?: string }) => r.country_code === "IN" || r.country === "India")
              .map((r: { name: string; admin1?: string; admin2?: string; latitude: number; longitude: number }) => ({
                name: r.name,
                state: r.admin2 ? `${r.admin2}, ${r.admin1 || "India"}` : r.admin1 || "India",
                lat: r.latitude,
                lon: r.longitude,
              }));
            setLiveResults(indiaLocations);
          } else {
            setLiveResults([]);
          }
        }
      } catch {
        // Fallback silently to local list on network error
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // Combine local and live results without duplicates
  const combinedCities = [...localFiltered];
  for (const live of liveResults) {
    if (!combinedCities.some((c) => c.name.toLowerCase() === live.name.toLowerCase())) {
      combinedCities.push(live);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Select Indian City / Locality
          </label>
          <div className="text-xl font-bold text-slate-800">
            {selectedCity.name}, <span className="text-slate-500 font-normal text-base">{selectedCity.state}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg w-full relative">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search any city or town (e.g., Limla, Surat, Delhi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 animate-spin" />
            )}
          </div>

          <select
            value={selectedCity.name}
            disabled={isLoading}
            onChange={(e) => {
              const found = combinedCities.find((c) => c.name === e.target.value);
              if (found) {
                onSelectCity(found);
                setSearch("");
              }
            }}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
          >
            {combinedCities.length > 0 ? (
              combinedCities.map((city) => (
                <option key={`${city.name}-${city.lat}`} value={city.name}>
                  {city.name} ({city.state})
                </option>
              ))
            ) : (
              <option value="">No matching locations found</option>
            )}
          </select>
        </div>
      </div>

      {/* Suggested chips when user types something like Limla */}
      {search.trim().length >= 2 && combinedCities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Suggestions:</span>
          {combinedCities.slice(0, 6).map((city) => (
            <button
              key={`${city.name}-${city.lat}`}
              type="button"
              onClick={() => {
                onSelectCity(city);
                setSearch("");
              }}
              className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200/60 px-2.5 py-1 rounded-lg text-slate-700 transition-colors"
            >
              📍 {city.name} ({city.state})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
