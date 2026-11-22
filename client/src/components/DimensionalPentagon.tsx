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
    { id: "pm2_5", label: "PM₂.₅", angle: -90, color: "#10b981", fullLabel: "Fine Inhalable Particles" },
    { id: "pm10", label: "PM₁₀", angle: -30, color: "#06b6d4", fullLabel: "Coarse Roadway Dust" },
    { id: "no2", label: "NO₂", angle: 30, color: "#3b82f6", fullLabel: "Nitrogen Vehicle Exhaust" },
    { id: "so2", label: "SO₂", angle: 90, color: "#8b5cf6", fullLabel: "Sulphur Industrial Gas" },
    { id: "o3", label: "O₃", angle: 150, color: "#f59e0b", fullLabel: "Photochemical Ozone" },
    { id: "co", label: "CO", angle: 210, color: "#ef4444", fullLabel: "Combustion Carbon Gas" },
  ];

  // Center coordinate
  const cx = 200;
  const cy = 200;
  const rOuter = 135;

  // Calculate coordinates for outer vertex positions
  const outerCoords = vertices.map((v) => {
    const rad = (v.angle * Math.PI) / 180;
    return {
      ...v,
      x: cx + rOuter * Math.cos(rad),
      y: cy + rOuter * Math.sin(rad),
    };
  });

  // Dynamic real-time polygon coordinates scaled by subIndex (0 to 500 mapped to 35..130)
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
    <div className="cyber-panel-glow rounded-3xl p-6 sm:p-8 mb-6 border border-emerald-500/30 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left Information Column */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin-3d-fast" />
            <span>3D Dimensional Atmosphere Matrix</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Spatial Dispersion for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              {city}
            </span>
          </h2>

          <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            Interactive multi-axis dimensional polyhedron inspired by AI benchmark frameworks. Tracks real-time CPCB sub-index dispersion across PM₂.₅, PM₁₀, NO₂, SO₂, O₃, and CO.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <div className="cyber-panel px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">CPCB Status</span>
                <span className="text-xs font-black text-emerald-400">{category}</span>
              </div>
            </div>

            <div className="cyber-panel px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Prominent Driver</span>
                <span className="text-xs font-black text-cyan-300">{prominentName}</span>
              </div>
            </div>

            <div className="cyber-panel px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
              {aqi <= 100 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">National AQI</span>
                <span className="text-xs font-black text-white">{aqi} / 500</span>
              </div>
            </div>
          </div>

          {/* Interactive node detail hover card */}
          {activePollutant ? (
            <div className="mt-5 p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/50 backdrop-blur-xl transition-all shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {POLLUTANT_NAMES[activePollutant.pollutant]} ({activePollutant.pollutant.toUpperCase()})
                </span>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Sub-Index: {activePollutant.subIndex}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                Measured concentration: <strong className="text-white">{activePollutant.concentration.toFixed(1)} {activePollutant.unit}</strong> • Health Impact Category: <strong className="text-emerald-300">{activePollutant.category}</strong>
              </p>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hover or tap any node on the 3D matrix to isolate individual pollutant concentration &amp; breakpoint tier.</span>
            </div>
          )}
        </div>

        {/* Right 3D Dimensional Graphic */}
        <div className="relative w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] flex items-center justify-center shrink-0">
          {/* Animated 3D spinning wireframe rings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[310px] h-[310px] rounded-full border border-emerald-500/20 animate-spin-3d" />
            <div className="w-[270px] h-[270px] rounded-full border border-cyan-500/20 animate-spin-3d-reverse absolute" />
            <div className="w-[330px] h-[330px] rounded-full border border-dashed border-emerald-400/10 animate-spin-3d-fast absolute" />
          </div>

          {/* SVG Multi-Axis Radar */}
          <svg className="w-full h-full relative z-10" viewBox="0 0 400 400">
            <defs>
              <radialGradient id="matrixGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#050811" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Concentric baseline polygons */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => {
              const pts = vertices
                .map((v) => {
                  const rad = (v.angle * Math.PI) / 180;
                  return `${cx + rOuter * scale * Math.cos(rad)},${cy + rOuter * scale * Math.sin(rad)}`;
                })
                .join(" ");
              return (
                <polygon
                  key={i}
                  points={pts}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                  strokeDasharray={i === 3 ? "4 4" : undefined}
                />
              );
            })}

            {/* Radial axis lines */}
            {outerCoords.map((v) => (
              <line
                key={`line-${v.id}`}
                x1={cx}
                y1={cy}
                x2={v.x}
                y2={v.y}
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="1"
              />
            ))}

            {/* Dynamic Real-time Air Quality Polygon */}
            <polygon
              points={dataPolygonPoints}
              fill="url(#polyGrad)"
              stroke="#10b981"
              strokeWidth="2.5"
              className="transition-all duration-700 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            />

            {/* Central Glowing AI-Q Core Orb */}
            <circle
              cx={cx}
              cy={cy}
              r="40"
              fill="#070b16"
              stroke="#10b981"
              strokeWidth="2"
              className="animate-pulse-core"
            />
            <circle cx={cx} cy={cy} r="34" fill="url(#matrixGlow)" />

            {/* Center AQI Text */}
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="24"
              fontWeight="900"
              fontFamily="Plus Jakarta Sans"
            >
              {aqi}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fill="#34d399"
              fontSize="9"
              fontWeight="800"
              letterSpacing="1.5"
            >
              CPCB AQI
            </text>

            {/* Interactive Outer Node Pills */}
            {outerCoords.map((v) => {
              const reading = pollutants.find((p) => p.pollutant === v.id);
              const subIndex =
                reading && typeof reading.subIndex === "number" && !isNaN(reading.subIndex)
                  ? reading.subIndex
                  : "—";
              const isProminent = v.id === prominentPollutant;

              return (
                <g
                  key={`node-${v.id}`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setActivePollutant(reading || null)}
                  onMouseLeave={() => setActivePollutant(null)}
                >
                  {/* Glow circle behind node */}
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={isProminent ? "18" : "15"}
                    fill={v.color}
                    fillOpacity={isProminent ? "0.35" : "0.2"}
                    className={isProminent ? "animate-ping" : ""}
                  />
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={isProminent ? "16" : "13"}
                    fill="#0a0f1d"
                    stroke={v.color}
                    strokeWidth={isProminent ? "2.5" : "1.5"}
                    className="group-hover:stroke-white transition-colors"
                  />
                  <text
                    x={v.x}
                    y={v.y + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isProminent ? "11" : "10"}
                    fontWeight="900"
                    fontFamily="Plus Jakarta Sans"
                  >
                    {v.label}
                  </text>

                  {/* Sub-index floating badge next to node */}
                  <text
                    x={v.x}
                    y={v.y + (v.angle > 0 ? 25 : -18)}
                    textAnchor="middle"
                    fill={v.color}
                    fontSize="11"
                    fontWeight="900"
                    className="drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]"
                  >
                    {subIndex}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
