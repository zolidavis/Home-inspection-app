/**
 * Fill the Citizens Property Insurance 4-Point Inspection Form (Insp4pt
 * 03 25) by OVERLAYING text on the flat PDF template.
 *
 * Citizens' form is not an AcroForm (zero fillable fields) but is the
 * de-facto carrier-accepted 4-Point in Florida. We bundle the official
 * template and use pdf-lib's drawText() to put values at hard-coded
 * positions next to the printed labels.
 *
 * **V1 scope (this commit):** identifies the inspection at the top of
 * the form (insured name, address, year built, inspection date) and the
 * inspector at the bottom of page 3 (name, license number, date). The
 * detailed electrical/HVAC/plumbing/roof body sections are NOT yet
 * overlaid — they require ~50 individually-measured x/y positions and
 * checkbox coordinates. V2 will iterate on those.
 *
 * Coordinate system: PDF points, bottom-left origin. US Letter = 612×792.
 * Positions measured from the rendered template
 * (/src/inspect-ai-citizens-4pt-p{1,2,3}.png) and pdftotext bbox output.
 */
import {
  PDFDocument,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { Inspection } from "@inspect-ai/shared";
import { CITIZENS_4PT_BASE64 } from "./citizens-4pt.base64.js";

const PAGE_H = 792;

/** Map pdftotext bbox (top-down) yMax → pdf-lib baseline y. */
const yFromTop = (yMaxTopDown: number) => PAGE_H - yMaxTopDown;

// Cache the decoded template bytes per warm-isolate.
let cachedBytes: Uint8Array | null = null;
function templateBytes(): Uint8Array {
  if (cachedBytes) return cachedBytes;
  const bin = atob(CITIZENS_4PT_BASE64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  cachedBytes = out;
  return out;
}

interface FieldDraw {
  page: 0 | 1 | 2;
  x: number;
  y: number;
  size?: number;
  value: unknown;
  bold?: boolean;
}

function fieldsFor(inspection: Inspection): FieldDraw[] {
  const property: any = inspection.property ?? {};
  const addr = inspection.address;
  const out: FieldDraw[] = [];

  const push = (f: FieldDraw) => {
    if (f.value === undefined || f.value === null || f.value === "") return;
    out.push({ size: 10, ...f });
  };

  // ── PAGE 1 — Header (verified correct) ─────────────────────────────────
  // "Insured/Applicant Name:" — label bbox ends at (~128, 64-73 top-down)
  push({ page: 0, x: 134, y: yFromTop(73), value: property.ownerName });
  // "Address Inspected:" — label ends at (~112, 82-91 top-down)
  const fullAddr = `${addr.line1}, ${addr.city}, ${addr.state} ${addr.zip}`;
  push({ page: 0, x: 116, y: yFromTop(91), value: fullAddr });
  // "Actual Year Built:" — label ends at (~104, 103-112)
  push({ page: 0, x: 108, y: yFromTop(112), value: property.yearBuilt });
  // "Date Inspected:" — label ends at (~375, 103-112)
  push({
    page: 0,
    x: 379,
    y: yFromTop(112),
    value: inspection.inspectedOn?.slice(0, 10),
  });

  // ── PAGE 3 — Inspector signature block ─────────────────────────────────
  // Signature lines at PNG y ≈ 895 → PDF top-down y = 895 × 0.72 ≈ 644.
  // The inspector types name in lieu of signature (paper-signed after print).
  push({ page: 2, x: 50, y: yFromTop(648), value: inspection.inspectorName });
  push({ page: 2, x: 444, y: yFromTop(648), value: inspection.inspectorLicense });
  push({
    page: 2,
    x: 465, // Date column starts after License Number; was 632 (off page).
    y: yFromTop(625), // Date column is a bit higher than the others.
    value: inspection.inspectedOn?.slice(0, 10),
  });

  // TODO(v2): overlay electrical / HVAC / plumbing / roof sections.
  // Each requires individually measured positions; the rendered output
  // PNGs at /src/inspect-ai-4pt-filled-p{1,2,3}.png show current state.
  // The pdftotext bbox HTML at /tmp/oir/4pt-bbox.html has every label's
  // exact PDF point coordinates — use those.

  return out;
}

function drawAll(
  pages: PDFPage[],
  font: PDFFont,
  fontBold: PDFFont,
  fields: FieldDraw[],
) {
  for (const f of fields) {
    const page = pages[f.page];
    if (!page) continue;
    page.drawText(String(f.value), {
      x: f.x,
      y: f.y,
      size: f.size ?? 10,
      font: f.bold ? fontBold : font,
    });
  }
}

export async function fillFourPoint(inspection: Inspection): Promise<Uint8Array> {
  const doc = await PDFDocument.load(templateBytes());
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pages = doc.getPages();
  const fields = fieldsFor(inspection);
  drawAll(pages, font, fontBold, fields);

  return await doc.save();
}
