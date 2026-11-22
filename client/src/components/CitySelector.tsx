import React, { useState, useEffect } from "react";
import { INDIAN_CITIES, type City } from "../config/cities.js";
import { MapPin, Search, Loader2, Sparkles } from "lucide-react";

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
    }, 300);

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

  // Ensure selectedCity is present so the <select> element always shows the active city
  addUnique(selectedCity);
  liveResults.forEach(addUnique);
  localFiltered.forEach(addUnique);

  return (
    <div className="glass-panel rounded-3xl p-5 mb-6 relative overflow-hidden transition-all duration-300">
      {/* Decorative ambient subtle light */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Indian Locality
            </span>
            {selectedCity.name === "Limla" && (
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Hyperlocal
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-100 tracking-tight flex items-baseline gap-2">
            {selectedCity.name}
            <span className="text-sm font-normal text-slate-400">
              ({selectedCity.state}) • {selectedCity.lat.toFixed(2)}°N, {selectedCity.lon.toFixed(2)}°E
            </span>
          </div>
        </div>

        {/* Live Search & Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search any town or city (e.g. Limla, Surat, Pune)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs glass-input rounded-2xl focus:border-emerald-500/60 transition-all placeholder:text-slate-500"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 animate-spin" />
            )}
          </div>

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
            className="px-3.5 py-2.5 text-xs glass-input rounded-2xl font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer min-w-[200px]"
          >
            {combinedCities.map((city) => (
              <option
                key={`${city.name}-${city.lat}`}
                value={`${city.name}|${city.lat}`}
                className="bg-slate-900 text-slate-100"
              >
                {city.name} ({city.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested chips when user types */}
      {search.trim().length >= 2 && combinedCities.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-wrap items-center gap-2 animate-fadeIn">
          <span className="text-[11px] text-slate-400 font-medium">Results:</span>
          {combinedCities.slice(0, 6).map((city) => (
            <button
              key={`chip-${city.name}-${city.lat}`}
              type="button"
              onClick={() => {
                onSelectCity(city);
                setSearch("");
              }}
              className="text-xs glass-card px-3 py-1.5 rounded-xl text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {city.name} <span className="text-[10px] text-slate-500">({city.state})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
