import { Hono } from "hono";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Inspection } from "@inspect-ai/shared";
import { store } from "../store.js";
import { fillWindMit } from "../pdf/wind-mit.js";

export const pdf = new Hono();

/**
 * GET /pdf/:inspectionId?type=four_point|wind_mitigation|both
 *
 *   - wind_mitigation: fills the OFFICIAL FL OIR-B1-1802 fillable AcroForm
 *     template (carrier-acceptable). See pdf/wind-mit.ts for the mapping.
 *   - four_point: generated summary via pdf-lib (no single official form
 *     exists; each carrier has variants).
 *   - both: fills OIR-B1-1802 first, then appends the 4-point summary
 *     pages.
 */
pdf.get("/:inspectionId", async (c) => {
  const inspection = await store.getInspection(c.req.param("inspectionId"));
  if (!inspection) return c.json({ error: "not_found" }, 404);

  const type = (c.req.query("type") ?? inspection.type) as
    | "four_point"
    | "wind_mitigation"
    | "both";

  let bytes: Uint8Array;

  if (type === "wind_mitigation") {
    bytes = await fillWindMit(inspection);
  } else if (type === "four_point") {
    bytes = await renderFourPointSummary(inspection);
  } else {
    // type === "both": OIR-B1-1802 template + 4-point summary appended
    const wmBytes = await fillWindMit(inspection);
    const fpBytes = await renderFourPointSummary(inspection);
    bytes = await mergePdfs([wmBytes, fpBytes]);
  }

  c.header("Content-Type", "application/pdf");
  c.header(
    "Content-Disposition",
    `inline; filename="inspection-${inspection.id}.pdf"`,
  );
  return c.body(bytes as unknown as ArrayBuffer);
});

// ─── 4-point summary (no official template) ────────────────────────────────

async function renderFourPointSummary(inspection: Inspection): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage();
  page.drawText("Florida 4-Point Inspection Report", { x: 50, y: 760, size: 18, font: bold });
  page.drawText(
    `${inspection.address.line1}, ${inspection.address.city}, ${inspection.address.state} ${inspection.address.zip}`,
    { x: 50, y: 740, size: 11, font },
  );
  if (inspection.property?.ownerName) {
    page.drawText(`Owner: ${inspection.property.ownerName}`, { x: 50, y: 725, size: 10, font });
  }
  if (inspection.property?.yearBuilt) {
    page.drawText(`Year Built: ${inspection.property.yearBuilt}`, { x: 50, y: 710, size: 10, font });
  }
  if (inspection.inspectorName) {
    page.drawText(
      `Inspector: ${inspection.inspectorName}${inspection.inspectorLicense ? ` (Lic. ${inspection.inspectorLicense})` : ""}`,
      { x: 50, y: 695, size: 10, font },
    );
  }
  page.drawLine({
    start: { x: 50, y: 685 },
    end: { x: 545, y: 685 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  const fp = (inspection.fourPoint ?? {}) as any;
  let y = 660;
  const rows: [string, string][] = [
    ["Roof Covering", fp?.roof?.coveringType ?? "—"],
    ["Roof Age (yrs)", String(fp?.roof?.ageYears ?? "—")],
    ["Roof Condition", fp?.roof?.condition ?? "—"],
    ["Electrical Panel", `${fp?.electrical?.panelBrand ?? "—"} @ ${fp?.electrical?.panelAmps ?? "—"}A`],
    ["Wiring Type", fp?.electrical?.wiringType ?? "—"],
    ["Plumbing Supply", fp?.plumbing?.supplyMaterial ?? "—"],
    ["Water Heater Age", String(fp?.plumbing?.waterHeaterAgeYears ?? "—")],
    ["HVAC Type", fp?.hvac?.systemType ?? "—"],
    ["HVAC Age", String(fp?.hvac?.ageYears ?? "—")],
  ];
  for (const [k, v] of rows) {
    page.drawText(k, { x: 50, y, size: 10, font: bold });
    page.drawText(v, { x: 220, y, size: 10, font });
    y -= 22;
  }
  return await doc.save();
}

// ─── PDF merge helper ──────────────────────────────────────────────────────

async function mergePdfs(parts: Uint8Array[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (const part of parts) {
    const src = await PDFDocument.load(part);
    const copied = await out.copyPages(src, src.getPageIndices());
    for (const p of copied) out.addPage(p);
  }
  return await out.save();
}
