import React, { useState } from "react";
import { INDIAN_CITIES, type City } from "../config/cities.js";
import { MapPin, Search } from "lucide-react";

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

  const filtered = INDIAN_CITIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Select Indian City
          </label>
          <div className="text-xl font-bold text-slate-800">
            {selectedCity.name}, <span className="text-slate-500 font-normal text-base">{selectedCity.state}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search city (e.g., Surat, Delhi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedCity.name}
            disabled={isLoading}
            onChange={(e) => {
              const found = INDIAN_CITIES.find((c) => c.name === e.target.value);
              if (found) onSelectCity(found);
            }}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {filtered.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name} ({city.state})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
