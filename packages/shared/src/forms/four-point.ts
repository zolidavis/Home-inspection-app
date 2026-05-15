import { z } from "zod";

/**
 * Florida 4-Point Insurance Inspection.
 * Covers the four systems insurers care about for older homes:
 * roof, electrical, plumbing, HVAC.
 *
 * Field names below align with most common carrier templates
 * (Citizens, Universal, etc.). Carrier-specific variations are
 * accommodated by the optional `carrierFields` map.
 */

export const RoofSchema = z.object({
  coveringType: z.enum([
    "asphalt_shingle",
    "metal",
    "tile",
    "built_up",
    "membrane",
    "wood_shake",
    "other",
  ]),
  ageYears: z.number().int().min(0),
  remainingLifeYears: z.number().int().min(0).nullable(),
  condition: z.enum(["good", "fair", "poor"]),
  visibleDamage: z.boolean(),
  notes: z.string().optional(),
});

export const ElectricalSchema = z.object({
  panelBrand: z.string(),
  panelAmps: z.number().int(),
  wiringType: z.enum(["copper_romex", "aluminum", "knob_tube", "mixed", "other"]),
  hazardsPresent: z.boolean(),
  hazardsDescription: z.string().optional(),
  gfciPresent: z.boolean(),
});

export const PlumbingSchema = z.object({
  supplyMaterial: z.enum(["copper", "cpvc", "pex", "polybutylene", "galvanized", "mixed"]),
  drainMaterial: z.enum(["pvc", "cast_iron", "abs", "mixed"]),
  waterHeaterAgeYears: z.number().int().min(0),
  leaksObserved: z.boolean(),
  notes: z.string().optional(),
});

export const HvacSchema = z.object({
  systemType: z.enum(["central_ac", "heat_pump", "window_units", "mini_split", "other"]),
  ageYears: z.number().int().min(0),
  condition: z.enum(["good", "fair", "poor"]),
  notes: z.string().optional(),
});

export const FourPointFormSchema = z.object({
  roof: RoofSchema,
  electrical: ElectricalSchema,
  plumbing: PlumbingSchema,
  hvac: HvacSchema,
  carrierFields: z.record(z.string(), z.string()).optional(),
});
export type FourPointForm = z.infer<typeof FourPointFormSchema>;

export const photoTags = [
  "roof.covering",
  "roof.condition",
  "electrical.panel",
  "electrical.wiring",
  "plumbing.supply",
  "plumbing.water_heater",
  "hvac.condenser",
  "hvac.air_handler",
] as const;
export type PhotoTag = (typeof photoTags)[number];
