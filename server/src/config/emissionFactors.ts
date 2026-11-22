/**
 * CO₂ emission factors per transport mode.
 *
 * All values are APPROXIMATE. They are mid-range figures derived from
 * published India-specific research and IPCC fuel emission factors.
 * Actual emissions depend on vehicle age, engine size, load, and traffic.
 *
 * Sources:
 *  - India GHG Program / Shakti Sustainable Energy Foundation:
 *    "India Specific Road Transport Emission Factors" (shaktifoundation.in)
 *  - IPCC 2006 Guidelines for National Greenhouse Gas Inventories
 *    (CNG emission factor: 2.69 kg CO₂/kg, mobile combustion)
 *  - TERI / Delhi Metro Rail Corporation environmental reports
 *    (CEA India grid emission factor applied to metro energy use)
 *  - USDA Forest Service: average tree absorption ~21 kg CO₂/year
 */

export interface EmissionFactor {
  /** kg CO₂ emitted per kilometre travelled */
  kgPerKm: number;
  /** Short human-readable label shown in the UI */
  label: string;
  /** Source name shown in the UI next to the estimate */
  source: string;
  /** Publication year of the source */
  year: number;
  /** Notes on assumptions */
  notes: string;
}

export const EMISSION_FACTORS: Record<string, EmissionFactor> = {
  car: {
    kgPerKm: 0.14,
    label: "Car (petrol)",
    source: "India GHG Program / Shakti Foundation",
    year: 2023,
    notes:
      "Mid-range for a common Indian petrol hatchback/sedan (0.111–0.166 kg/km range) with 10% real-world uplift.",
  },
  bike: {
    kgPerKm: 0.04,
    label: "Bike / Scooter (petrol)",
    source: "India GHG Program / Shakti Foundation",
    year: 2023,
    notes:
      "Mid-range for a petrol scooter <150 CC with 10% real-world uplift (0.037–0.047 kg/km range).",
  },
  autorickshaw: {
    kgPerKm: 0.09,
    label: "Auto-rickshaw (CNG)",
    source: "IPCC 2006 / Shakti Foundation",
    year: 2023,
    notes:
      "Derived from IPCC CNG emission factor (2.69 kg CO₂/kg) ÷ typical Indian auto fuel economy (30 km/kg). Corroborated by TERI/Shakti literature.",
  },
  metro: {
    kgPerKm: 0.032,
    label: "Metro / Suburban rail",
    source: "TERI / Delhi Metro Rail Corp",
    year: 2022,
    notes:
      "Based on CEA India grid emission factor applied to metro energy consumption per passenger-km.",
  },
  walk: {
    kgPerKm: 0.0,
    label: "Walk / Cycle",
    source: "—",
    year: 2024,
    notes: "Zero tailpipe emissions.",
  },
  wfh: {
    kgPerKm: 0.0,
    label: "Work from home",
    source: "—",
    year: 2024,
    notes: "Zero commute emissions.",
  },
} as const;

/** Average CO₂ absorbed by one tree per year (kg). USDA Forest Service. */
export const KG_CO2_PER_TREE_PER_YEAR = 21;
