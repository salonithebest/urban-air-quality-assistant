import type {
  AqiResponse,
  FamilyMember,
  RoutineChoice,
  IndoorContext,
  AdviceResponse,
} from "../types/index.js";
import { calculateDeterministicCo2 } from "./co2Calculator.js";

export function generateClientFallbackAdvice(
  aqiSnapshot: AqiResponse,
  familyMembers: FamilyMember[],
  routineChoices: RoutineChoice[],
  indoorContext?: IndoorContext
): AdviceResponse {
  const { city, aqi, category, prominentPollutant } = aqiSnapshot;
  const prominentDisplay = prominentPollutant.toUpperCase().replace("_", ".");

  const co2 = calculateDeterministicCo2(routineChoices);
  const isSevere = aqi > 300;

  const memberAdvice = familyMembers.map((member) => {
    switch (member.role) {
      case "infant":
        return {
          memberId: member.id,
          memberName: member.name,
          healthImpact: `Developing lungs and hyper-cadence respiratory volume expose infants in ${city} to extreme particulate deposition at AQI ${aqi} (${prominentDisplay} driver). Alveolar development is critically vulnerable to oxidative cellular damage.`,
          personalTips: [
            `Maintain absolute indoor shelter in a HEPA-purified nursery; keep PM2.5 levels strictly below 15 µg/m³.`,
            `Seal perimeter door sweeps and window gaskets during peak morning (6:00–9:30 AM) and evening thermal inversion hours.`,
            `Do not use open prams or strollers outdoors during ${category.toLowerCase()} air quality episodes.`,
          ],
        };
      case "child":
        return {
          memberId: member.id,
          memberName: member.name,
          healthImpact: `Developing lung alveoli and rapid respiratory cadence make children highly susceptible to ${category} air in ${city} (AQI ${aqi}). Physical exertion forces mouth-breathing, bypassing nasal cilia and depositing ${prominentDisplay} deep into bronchioles.`,
          personalTips: [
            `Reschedule strenuous outdoor sports or playground sessions from morning hours to early afternoon (2:00 PM – 4:30 PM) when convective solar mixing lowers ground pollutant density.`,
            `Ensure an N95 or well-sealed child-sized particulate mask during school commutes via open auto-rickshaws or school buses.`,
            `Encourage warm hydration and vitamin C-rich citrus fruits to bolster mucosal barrier defense against free radicals.`,
          ],
        };
      case "senior":
        return {
          memberId: member.id,
          memberName: member.name,
          healthImpact: `Senior cardiovascular elasticity and pulmonary reserves decline naturally. At AQI ${aqi} in ${city}, ${prominentDisplay} induces systemic vascular oxidative stress and elevates blood pressure.`,
          personalTips: [
            `Shift morning walking routines strictly indoors until ambient ground inversion dissipates.`,
            `Keep your doctor-prescribed medications easily accessible; consult your physician if you experience any breathing changes.`,
            `Operate indoor HEPA air purification continuously with closed windows during night and early morning hours.`,
          ],
        };
      case "pregnant":
        return {
          memberId: member.id,
          memberName: member.name,
          healthImpact: `Fine particulates (${prominentDisplay}) at AQI ${aqi} (${category}) can elevate maternal airway sensitivity and systemic inflammatory markers.`,
          personalTips: [
            `Strictly avoid busy arterial roadside transit and congested junctions during peak rush hours.`,
            `Utilize high-filtration N95 respirators whenever stepping outside for antenatal clinic visits.`,
            `Maintain optimal maternal hydration and consume antioxidant-dense whole foods to mitigate systemic oxidative stress.`,
          ],
        };
      case "asthmatic":
        return {
          memberId: member.id,
          memberName: member.name,
          healthImpact: `Concentrated ${prominentDisplay} at AQI ${aqi} is a potent bronchoconstrictor in ${city}, heightening airway hyper-reactivity, wheezing, and daytime coughing.`,
          personalTips: [
            `Carry your prescribed rescue inhaler on your person at all times during any necessary transit.`,
            `Ask your doctor whether you should use your rescue inhaler before outdoor exposure.`,
            `Rinse nasal cavities with isotonic sterile saline spray upon returning home to eliminate deposited particulate mass.`,
          ],
        };
      case "cardiac":
        return {
          memberId: member.id,
          memberName: member.name,
          healthImpact: `Inhalation of fine particulates at AQI ${aqi} stimulates autonomic nervous imbalance, blood hyper-viscosity, and elevated myocardial ischemic risk in ${city}.`,
          personalTips: [
            `Refrain completely from outdoor cardio workouts, brisk climbing, or heavy carrying in ambient outdoor air.`,
            `Monitor daily blood pressure and pulse rhythm closely; report chest tightness or undue palpitations immediately.`,
            `Adopt carpooling with closed recirculation windows or work from home on days exceeding AQI 200.`,
          ],
        };
      default:
        return {
          memberId: member.id,
          memberName: member.name,
          healthImpact: `At AQI ${aqi} (${category}), even healthy adult mucosal linings experience oxidative irritation, resulting in throat dryness, eye stinging, and post-commute fatigue from ${prominentDisplay} uptake.`,
          personalTips: [
            `Avoid intensive outdoor running or jogging during morning (6:00–9:00 AM) and night (8:00–11:00 PM) pollution peaks.`,
            `Use closed-window metro, train, or carpool options rather than open two-wheeler travel for commutes over 5 km.`,
            `Flush eyes with clean water and gargle with warm saline upon returning home after evening transit.`,
          ],
        };
    }
  });

  return {
    memberAdvice,
    routineSuggestions: [
      `Shift departure times by 45–60 minutes away from morning rush-hour peaks to reduce acute ${prominentDisplay} exposure by up to 35%.`,
      `Choose air-conditioned metro transit or closed-window electric carpooling over open two-wheelers and auto-rickshaws.`,
      `Utilize Work-From-Home (WFH) days whenever city AQI crosses 250 to completely eliminate outdoor commute exposure.`,
    ],
    indoorTips: [
      isSevere
        ? "Run HEPA filters at Maximum/Turbo speed continuously; inspect and pre-clean carbon pre-filters."
        : "Maintain continuous Auto/Medium HEPA filtration with windows sealed during morning and nighttime hours.",
      isSevere
        ? "Strictly seal all windows; zero outdoor ventilation recommended until AQI improves below 250."
        : "Brief 15-minute cross-ventilation during peak solar convective dispersion (1:30 PM – 4:00 PM) only.",
      indoorContext?.hasPlants
        ? "Wipe foliage of indoor Areca Palms and Snake Plants with a damp cloth every 48 hours to maintain stomatal gas exchange."
        : "Introduce indoor phytoremediative plants (Areca Palm, Sansevieria) to augment ambient indoor VOC capture.",
    ],
    co2Estimate: {
      baselineKgPerDay: co2.soloCarBaselineKg,
      optimisedKgPerDay: co2.routineFootprintKg,
      savedKgPerDay: co2.dailyCarbonCutKg,
      savedKgPerYear: co2.savedKgPerYear,
      equivalentTreeDays: co2.equivalentTreeDays,
      annualTreeYears: co2.annualTreeYears,
      percentReduction: co2.percentReduction,
      sourceLabel: co2.sourceLabel,
    },
    generatedAt: new Date().toISOString(),
  };
}
