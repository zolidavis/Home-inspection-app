import { z } from "zod";

/**
 * Uniform Mitigation Verification Inspection Form
 * OIR-B1-1802 (Rev. 01/12), the Florida wind mitigation form.
 *
 * Section letters/numbers below mirror the official form.
 * See: https://www.floir.com/sections/pandc/forms.aspx
 */

// 1. Building Code
export const BuildingCodeSchema = z.enum([
  "a_built_2002_or_later_fbc",
  "b_built_1994_2001_sfbc",
  "c_unknown_or_not_meeting",
]);

// 2. Roof Covering
export const RoofCoveringTypeSchema = z.enum([
  "asphalt_fiberglass_shingle",
  "concrete_clay_tile",
  "metal",
  "built_up",
  "membrane",
  "wood_shake",
  "other",
]);
export const RoofCoveringSchema = z.object({
  type: RoofCoveringTypeSchema,
  // Per-covering FBC/Miami-Dade product approval data
  permitApplicationDate: z.string().nullable(), // ISO date
  installationDate: z.string().nullable(),
  fbcOrMiamiDadeApproved: z.boolean(),
  meetsCode: z.enum(["a_compliant", "b_non_compliant", "c_unknown"]),
});

// 3. Roof Deck Attachment
export const RoofDeckAttachmentSchema = z.enum([
  "a_plywood_osb_6d_nails_6_12",
  "b_plywood_osb_8d_nails_6_12",
  "c_plywood_osb_8d_nails_6_6",
  "d_reinforced_concrete",
  "e_other",
  "f_unknown",
]);

// 4. Roof to Wall Attachment
export const RoofToWallSchema = z.enum([
  "a_toe_nails",
  "b_clips",
  "c_single_wraps",
  "d_double_wraps",
  "e_structural",
  "f_other",
  "g_unknown",
]);

// 5. Roof Geometry
export const RoofGeometrySchema = z.enum(["a_hip", "b_flat", "c_other"]);

// 6. Secondary Water Resistance (SWR)
export const SwrSchema = z.enum(["a_yes", "b_no", "c_unknown"]);

// 7. Opening Protection
export const OpeningProtectionSchema = z.enum([
  "a_hurricane_impact",
  "b_basic_impact",
  "c_none",
  "n_other",
  "x_unknown",
]);

export const WindMitFormSchema = z.object({
  buildingCode: BuildingCodeSchema,
  roofCovering: RoofCoveringSchema,
  roofDeckAttachment: RoofDeckAttachmentSchema,
  roofToWallAttachment: RoofToWallSchema,
  roofGeometry: RoofGeometrySchema,
  secondaryWaterResistance: SwrSchema,
  openingProtection: OpeningProtectionSchema,
  yearOfHomeOriginalConstruction: z.number().int(),
  notes: z.string().optional(),
});
export type WindMitForm = z.infer<typeof WindMitFormSchema>;

export const photoTags = [
  "wm.elevation_front",
  "wm.elevation_rear",
  "wm.elevation_left",
  "wm.elevation_right",
  "wm.roof_covering",
  "wm.roof_deck_attic",
  "wm.roof_to_wall",
  "wm.roof_geometry",
  "wm.swr",
  "wm.opening_protection",
  "wm.permit_documents",
] as const;
export type PhotoTag = (typeof photoTags)[number];
