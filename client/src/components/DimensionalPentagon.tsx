/**
 * @file DimensionalPentagon.tsx
 * @description Interactive 3D Atmospheric Dispersion Matrix for criteria pollutants.
 * Visualizes dynamic spatial vectors and provides full WCAG 2.1 screen-reader table fallback.
 */

import React, { useState } from "react";
import type { PollutantReading, Category } from "../types/index.js";
import { POLLUTANT_NAMES } from "../utils/aqiColors.js";
import { Sparkles, Activity, ShieldCheck, AlertTriangle, Layers, Eye } from "lucide-react";

interface DimensionalPentagonProps {
  aqi: number;
  category: Category;
  city: string;
  prominentPollutant: string;
  pollutants: PollutantReading[];
}

export const DimensionalPentagon: React.FC<DimensionalPentagonProps> = ({
  aqi,
  category,
  city,
  prominentPollutant,
  pollutants,
}) => {
  const [activePollutant, setActivePollutant] = useState<PollutantReading | null>(null);

  // Pollutant sub-indices mapped to radial vertices (PM2.5, PM10, NO2, SO2, O3, CO)
  const vertices = [
    { id: "pm2_5", label: "PM₂.₅", angle: -90, color: "#0d9488", fullLabel: "Fine Inhalable Particles" },
    { id: "pm10", label: "PM₁₀", angle: -30, color: "#0284c7", fullLabel: "Coarse Roadway Dust" },
    { id: "no2", label: "NO₂", angle: 30, color: "#4f46e5", fullLabel: "Nitrogen Vehicle Exhaust" },
    { id: "so2", label: "SO₂", angle: 90, color: "#7c3aed", fullLabel: "Sulphur Industrial Gas" },
    { id: "o3", label: "O₃", angle: 150, color: "#d97706", fullLabel: "Photochemical Ozone" },
    { id: "co", label: "CO", angle: 210, color: "#dc2626", fullLabel: "Combustion Carbon Gas" },
  ];

  const cx = 200;
  const cy = 200;
  const rOuter = 135;

  const outerCoords = vertices.map((v) => {
    const rad = (v.angle * Math.PI) / 180;
    return {
      ...v,
      x: cx + rOuter * Math.cos(rad),
      y: cy + rOuter * Math.sin(rad),
    };
  });

  const dataPolygonPoints = vertices
    .map((v) => {
      const reading = pollutants.find((p) => p.pollutant === v.id);
      const subIndex =
        reading && typeof reading.subIndex === "number" && !isNaN(reading.subIndex)
          ? reading.subIndex
          : 50;
      const rScale = 35 + Math.min(95, (subIndex / 500) * 95);
      const rad = (v.angle * Math.PI) / 180;
      const x = cx + rScale * Math.cos(rad);
      const y = cy + rScale * Math.sin(rad);
      return `${x},${y}`;
    })
    .join(" ");

  const prominentName = POLLUTANT_NAMES[prominentPollutant as keyof typeof POLLUTANT_NAMES] || prominentPollutant;

  return (
    <section
      className="glass-card-glow rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-xl"
      role="region"
      aria-label="3D Atmospheric Dispersion Matrix and Pollutant Telemetry"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Screen Reader Data Table Fallback for WCAG 2.1 AAA Compliance */}
      <table className="sr-only">
        <caption>Detailed criteria pollutant concentrations and CPCB sub-indices for {city}</caption>
        <thead>
          <tr>
            <th scope="col">Pollutant</th>
            <th scope="col">Concentration</th>
            <th scope="col">Sub-Index</th>
            <th scope="col">Category</th>
          </tr>
        </thead>
        <tbody>
          {pollutants.map((p) => (
            <tr key={p.pollutant}>
              <td>{POLLUTANT_NAMES[p.pollutant] || p.pollutant}</td>
              <td>{p.concentration.toFixed(1)} {p.unit}</td>
              <td>{p.subIndex}</td>
              <td>{p.category}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left Information Column */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200/90 text-teal-800 text-xs font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin-3d-fast" aria-hidden="true" />
            <span>3D Atmospheric Dispersion Matrix</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Spatial Dispersion for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600">
              {city}
            </span>
          </h2>

          <p className="text-sm text-slate-600 mt-2 max-w-xl leading-relaxed font-medium">
            Interactive multi-axis dimensional polyhedron tracking real-time CPCB sub-index dispersion across PM₂.₅, PM₁₀, NO₂, SO₂, O₃, and CO.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <div className="glass-card px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-xs">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600" />
              </span>
              <div className="text-left">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">CPCB Status</span>
                <span className="text-xs font-black text-teal-700">{category}</span>
              </div>
            </div>

            <div className="glass-card px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-xs">
              <Activity className="w-4 h-4 text-cyan-600" aria-hidden="true" />
              <div className="text-left">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Prominent Driver</span>
                <span className="text-xs font-black text-cyan-800">{prominentName}</span>
              </div>
            </div>

            <div className="glass-card px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-xs">
              {aqi <= 100 ? (
                <ShieldCheck className="w-4 h-4 text-teal-600" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
              )}
              <div className="text-left">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">National AQI</span>
                <span className="text-xs font-black text-slate-900">{aqi} / 500</span>
              </div>
            </div>
          </div>

          {/* Interactive node detail hover card */}
          {activePollutant ? (
            <div className="mt-5 p-4 rounded-2xl bg-white/95 border border-teal-300 backdrop-blur-xl transition-all shadow-md" role="status" aria-live="polite">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                  {POLLUTANT_NAMES[activePollutant.pollutant]} ({activePollutant.pollutant.toUpperCase()})
                </span>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Sub-Index: {activePollutant.subIndex}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">
                Measured concentration: <strong className="text-slate-900">{activePollutant.concentration.toFixed(1)} {activePollutant.unit}</strong> • Health Impact Category: <strong className="text-teal-700">{activePollutant.category}</strong>
              </p>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Layers className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
              <span>Hover or tap any node on the 3D matrix to isolate individual pollutant concentration &amp; breakpoint tier.</span>
            </div>
          )}
        </div>

        {/* Right 3D Dimensional Graphic */}
        <div className="relative w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] flex items-center justify-center shrink-0">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
            <div className="w-[310px] h-[310px] rounded-full border border-teal-500/20 animate-spin-3d" />
            <div className="w-[270px] h-[270px] rounded-full border border-cyan-500/20 animate-spin-3d-reverse absolute" />
            <div className="w-[330px] h-[330px] rounded-full border border-dashed border-indigo-400/20 animate-spin-3d-fast absolute" />
          </div>

          <svg
            className="w-full h-full relative z-10"
            viewBox="0 0 400 400"
            role="img"
            aria-label={`Visual spatial dispersion radar for ${city}. National AQI is ${aqi}, category ${category}, prominent pollutant ${prominentName}.`}
          >
            <title>3D Atmospheric Dispersion Matrix for {city}</title>
            <defs>
              <radialGradient id="matrixGlowLight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="polyGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Concentric Guide Circles */}
            {[35, 65, 95, 125].map((r, i) => (
              <circle
                key={`grid-ring-${i}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray={i === 3 ? "0" : "3,3"}
                opacity="0.8"
              />
            ))}

            {/* Radial Spokes */}
            {outerCoords.map((v) => (
              <line
                key={`spoke-${v.id}`}
                x1={cx}
                y1={cy}
                x2={v.x}
                y2={v.y}
                stroke="#94a3b8"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}

            {/* Core Background Gradient */}
            <circle cx={cx} cy={cy} r="125" fill="url(#matrixGlowLight)" />

            {/* Dynamic Data Polygon */}
            <polygon
              points={dataPolygonPoints}
              fill="url(#polyGradLight)"
              stroke="#0d9488"
              strokeWidth="2.5"
              className="transition-all duration-700 ease-out"
            />

            {/* Interactive Outer Nodes */}
            {outerCoords.map((v) => {
              const reading = pollutants.find((p) => p.pollutant === v.id);
              const isProminent = v.id === prominentPollutant;
              const isSelected = activePollutant?.pollutant === v.id;

              return (
                <g
                  key={`node-${v.id}`}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => reading && setActivePollutant(reading)}
                  onMouseLeave={() => setActivePollutant(null)}
                  onClick={() => reading && setActivePollutant(reading)}
                >
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={isSelected ? "18" : isProminent ? "16" : "13"}
                    fill={isProminent ? "#0f766e" : "#0f172a"}
                    stroke={isSelected ? "#14b8a6" : isProminent ? "#5eead4" : "#e2e8f0"}
                    strokeWidth={isSelected ? "3" : "2"}
                    className="transition-all"
                  />
                  <text
                    x={v.x}
                    y={v.y + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isProminent ? "10" : "9"}
                    fontWeight="800"
                  >
                    {v.label}
                  </text>
                </g>
              );
            })}

            {/* Central Core Gauge */}
            <circle
              cx={cx}
              cy={cy}
              r="34"
              fill="#ffffff"
              stroke="#0d9488"
              strokeWidth="2.5"
              className="animate-pulse-core shadow-md"
            />
            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              fill="#0f172a"
              fontSize="16"
              fontWeight="900"
            >
              {aqi}
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fill="#0d9488"
              fontSize="7.5"
              fontWeight="800"
              letterSpacing="0.05em"
            >
              CPCB AQI
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
};
