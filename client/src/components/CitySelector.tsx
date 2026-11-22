import React, { useState, useEffect } from "react";
import { INDIAN_CITIES, type City } from "../config/cities.js";
import { MapPin, Search, Loader2, Sparkles, ChevronDown } from "lucide-react";

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

  // Open-Meteo free geocoding search for any Indian locality (e.g. Limla, Hazira, Pune)
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
        // Fallback silently
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [search]);

  // Combine unique cities including the selectedCity if it's a custom locality
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
    <div className="luxury-card rounded-2xl p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active City Display */}
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-slate-500">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Selected Locality
            </span>
            {selectedCity.name === "Limla" && (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Hyperlocal
              </span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
            {selectedCity.name}
            <span className="text-sm font-medium text-slate-500">
              {selectedCity.state}
            </span>
            <span className="text-xs font-mono text-slate-400 font-normal hidden sm:inline">
              ({selectedCity.lat.toFixed(2)}°N, {selectedCity.lon.toFixed(2)}°E)
            </span>
          </div>
        </div>

        {/* Search & Selector Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Indian city or town (e.g. Limla, Surat)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs luxury-input rounded-xl focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 animate-spin" />
            )}
          </div>

          <div className="relative min-w-[190px]">
            <select
              value={`${selectedCity.name}|${selectedCity.lat}`}
              disabled={isLoading}
              onChange={(e) => {
                const [name, latStr] = e.target.value.split("|");
                const found = combinedCities.find((c) => c.name === name && c.lat === Number(latStr));
                if (found) {
                  onSelectCity(found);
                  setSearch("");
                }
              }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-xs luxury-input rounded-xl font-semibold text-slate-800 cursor-pointer"
            >
              {combinedCities.map((city) => (
                <option key={`${city.name}-${city.lat}`} value={`${city.name}|${city.lat}`}>
                  {city.name} ({city.state})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Suggested Search Chips */}
      {search.trim().length >= 2 && combinedCities.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Matching Locations:
          </span>
          {combinedCities.slice(0, 6).map((city) => (
            <button
              key={`chip-${city.name}-${city.lat}`}
              type="button"
              onClick={() => {
                onSelectCity(city);
                setSearch("");
              }}
              className="text-xs bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 px-2.5 py-1 rounded-lg font-medium transition-all active:scale-95"
            >
              📍 {city.name} <span className="text-[10px] text-slate-500">({city.state})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
