import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const PollutantIdSchema = z.enum([
  "pm2_5",
  "pm10",
  "no2",
  "so2",
  "o3",
  "co",
]);
export type PollutantId = z.infer<typeof PollutantIdSchema>;

export const CategorySchema = z.enum([
  "Good",
  "Satisfactory",
  "Moderately Polluted",
  "Poor",
  "Very Poor",
  "Severe",
]);
export type Category = z.infer<typeof CategorySchema>;

// ---------------------------------------------------------------------------
// Air quality query (GET /api/air-quality query params)
// ---------------------------------------------------------------------------

export const AirQualityQuerySchema = z.object({
  lat: z.coerce
    .number({ invalid_type_error: "lat must be a number" })
    .min(6, "lat must be ≥ 6 (southern tip of India)")
    .max(36, "lat must be ≤ 36 (northern tip of India)"),
  lon: z.coerce
    .number({ invalid_type_error: "lon must be a number" })
    .min(68, "lon must be ≥ 68 (western coast of India)")
    .max(97, "lon must be ≤ 97 (eastern border of India)"),
  city: z.string().min(1).max(100).optional(),
});
export type AirQualityQuery = z.infer<typeof AirQualityQuerySchema>;

// ---------------------------------------------------------------------------
// Pollutant reading (one pollutant's sub-index result)
// ---------------------------------------------------------------------------

export const PollutantReadingSchema = z.object({
  pollutant: PollutantIdSchema,
  concentration: z.number().nonnegative(),
  /** The unit that was used for the CPCB breakpoint lookup */
  unit: z.enum(["µg/m³", "mg/m³"]),
  subIndex: z.number().int().min(0).max(500),
  category: CategorySchema,
});
export type PollutantReading = z.infer<typeof PollutantReadingSchema>;

// ---------------------------------------------------------------------------
// AQI response (GET /api/air-quality response)
// ---------------------------------------------------------------------------

export const DATA_NOTE =
  "Estimated AQI from model data (hourly) — not an official CPCB reading." as const;

export const AqiResponseSchema = z.object({
  city: z.string(),
  lat: z.number(),
  lon: z.number(),
  aqi: z.number().int().min(0).max(500),
  category: CategorySchema,
  prominentPollutant: PollutantIdSchema,
  pollutants: z.array(PollutantReadingSchema),
  timestamp: z.string().datetime(),
  dataNote: z.literal(DATA_NOTE),
});
export type AqiResponse = z.infer<typeof AqiResponseSchema>;

// ---------------------------------------------------------------------------
// Family profile (part of advice request)
// ---------------------------------------------------------------------------

/** Sanitise a name: strip injection-risky characters */
const sanitiseName = (s: string) => s.replace(/[<>"'\n\r]/g, "").trim();

export const FamilyMemberSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(50, "Name must be ≤ 50 characters")
    .transform(sanitiseName),
  role: z.enum([
    "infant",
    "child",
    "adult",
    "senior",
    "pregnant",
    "asthmatic",
    "cardiac",
  ]),
});
export type FamilyMember = z.infer<typeof FamilyMemberSchema>;

export const FamilyProfileSchema = z.object({
  members: z
    .array(FamilyMemberSchema)
    .min(1, "At least one family member is required")
    .max(10, "Maximum 10 family members"),
});
export type FamilyProfile = z.infer<typeof FamilyProfileSchema>;

// ---------------------------------------------------------------------------
// Routine choices (commute / activity inputs for CO₂ engine)
// ---------------------------------------------------------------------------

export const ActivityTypeSchema = z.enum([
  "car",
  "bike",
  "autorickshaw",
  "metro",
  "walk",
  "wfh",
]);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const RoutineChoiceSchema = z.object({
  activityType: ActivityTypeSchema,
  durationMinutes: z
    .number()
    .int()
    .min(0)
    .max(240, "Duration cannot exceed 240 minutes"),
  distanceKm: z
    .number()
    .nonnegative()
    .max(100, "Distance cannot exceed 100 km")
    .optional(),
});
export type RoutineChoice = z.infer<typeof RoutineChoiceSchema>;

// ---------------------------------------------------------------------------
// Indoor context (optional part of advice request)
// ---------------------------------------------------------------------------

export const IndoorContextSchema = z
  .object({
    hasAirPurifier: z.boolean(),
    hasPlants: z.boolean(),
    ventilationType: z.enum(["none", "natural", "mechanical"]),
  })
  .optional();
export type IndoorContext = z.infer<typeof IndoorContextSchema>;

// ---------------------------------------------------------------------------
// Full advice request (POST /api/advice body)
// ---------------------------------------------------------------------------

export const AdviceRequestSchema = z.object({
  aqiSnapshot: AqiResponseSchema,
  familyProfile: FamilyProfileSchema,
  routineChoices: z
    .array(RoutineChoiceSchema)
    .min(1, "At least one routine choice is required")
    .max(5, "Maximum 5 routine choices"),
  indoorContext: IndoorContextSchema,
});
export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;

// ---------------------------------------------------------------------------
// CO₂ estimate (computed deterministically, embedded in advice response)
// ---------------------------------------------------------------------------

export const Co2EstimateSchema = z.object({
  baselineKgPerDay: z.number(),
  optimisedKgPerDay: z.number(),
  savedKgPerDay: z.number(),
  savedKgPerYear: z.number(),
  equivalentTreeDays: z.number(),
  sourceLabel: z.string(),
});
export type Co2Estimate = z.infer<typeof Co2EstimateSchema>;

// ---------------------------------------------------------------------------
// Advice response (POST /api/advice response)
// ---------------------------------------------------------------------------

export const MemberAdviceSchema = z.object({
  memberId: z.string(),
  memberName: z.string(),
  healthImpact: z.string(),
  personalTips: z.array(z.string()).max(5),
});
export type MemberAdvice = z.infer<typeof MemberAdviceSchema>;

export const AdviceResponseSchema = z.object({
  memberAdvice: z.array(MemberAdviceSchema),
  routineSuggestions: z.array(z.string()).max(5),
  indoorTips: z.array(z.string()).max(5),
  co2Estimate: Co2EstimateSchema,
  generatedAt: z.string().datetime(),
});
export type AdviceResponse = z.infer<typeof AdviceResponseSchema>;
