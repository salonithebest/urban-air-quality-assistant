/**
 * @file CitySelector.tsx
 * @description Accessible Indian locality and municipality selector.
 * Integrates predefined national urban centers and live Open-Meteo geocoding search.
 */

import React, { useState, useEffect } from "react";
import { INDIAN_CITIES, type City } from "../config/cities.js";
import { MapPin, Search, Loader2, Sparkles, ChevronDown } from "lucide-react";

/**
 * Component properties for CitySelector.
 */
interface CitySelectorProps {
  /** Active city object selected in user session */
  selectedCity: City;
  /** Callback fired when user selects a new city */
  onSelectCity: (city: City) => void;
  /** Whether atmospheric data is currently loading */
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

  // Filter local predefined cities
  const localFiltered = INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  // Open-Meteo free geocoding search for any Indian locality
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
        )}&count=6&language=en`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.results && Array.isArray(json.results)) {
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
        // Fallback gracefully
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [search]);

  // Combine unique cities
  const combinedCities: City[] = [];
  const seen = new Set<string>();

  const addUnique = (city: City) => {
    const key = `${city.name.toLowerCase()}-${city.lat.toFixed(2)}-${city.lon.toFixed(2)}`;
    if (!seen.has(key)) {
      seen.add(key);
      combinedCities.push(city);
    }
  };

  addUnique(selectedCity);
  liveResults.forEach(addUnique);
  localFiltered.forEach(addUnique);

  return (
    <section className="glass-card rounded-3xl p-5 sm:p-6 mb-6" role="region" aria-label="Locality and City Selector">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Active City Display */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span className="text-[11px] font-black uppercase tracking-widest text-teal-700">
              Selected Locality
            </span>
            {selectedCity.name === "Limla" && (
              <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-teal-600" aria-hidden="true" /> Hyperlocal
              </span>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2.5">
            <span>{selectedCity.name}</span>
            <span className="text-sm font-semibold text-slate-500">
              {selectedCity.state}
            </span>
            <span className="text-xs font-mono text-slate-400 font-normal hidden sm:inline">
              ({selectedCity.lat.toFixed(2)}°N, {selectedCity.lon.toFixed(2)}°E)
            </span>
          </div>
        </div>

        {/* Search & Selector Controls with Accessible Labels */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-lg w-full">
          <div className="relative flex-1">
            <label htmlFor="locality-search-input" className="sr-only">
              Search Indian locality or municipality
            </label>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="locality-search-input"
              type="text"
              placeholder="Search Indian locality (e.g. Limla, Surat)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs glass-input rounded-xl focus:outline-none font-medium"
              aria-label="Search Indian locality or municipality"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 animate-spin" aria-hidden="true" />
            )}
          </div>

          <div className="relative min-w-[200px]">
            <label htmlFor="locality-select-dropdown" className="sr-only">
              Select Indian city from list
            </label>
            <select
              id="locality-select-dropdown"
              value={`${selectedCity.name}|${selectedCity.lat}`}
              disabled={isLoading}
              aria-label="Select Indian city from list"
              onChange={(e) => {
                const [name, latStr] = e.target.value.split("|");
                const found = combinedCities.find((c) => c.name === name && c.lat === Number(latStr));
                if (found) {
                  onSelectCity(found);
                  setSearch("");
                }
              }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-xs glass-input rounded-xl font-bold text-slate-800 cursor-pointer"
            >
              {combinedCities.map((city) => (
                <option key={`${city.name}-${city.lat}`} value={`${city.name}|${city.lat}`} className="bg-white text-slate-900">
                  {city.name} ({city.state})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Suggested Search Chips */}
      {search.trim().length >= 2 && combinedCities.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center gap-2" role="group" aria-label="Matching localities">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Matching Localities:
          </span>
          {combinedCities.slice(0, 6).map((city) => (
            <button
              key={`chip-${city.name}-${city.lat}`}
              type="button"
              onClick={() => {
                onSelectCity(city);
                setSearch("");
              }}
              aria-label={`Select ${city.name}, ${city.state}`}
              className="text-xs bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 px-3 py-1 rounded-lg font-medium transition-all active:scale-95 shadow-2xs"
            >
              📍 {city.name} <span className="text-[10px] text-slate-400">({city.state})</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
