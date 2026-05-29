#!/usr/bin/env node
/**
 * Bundle the Hono app into a self-contained Edge function and write
 * the Vercel Build Output API structure.
 *
 * Why we own this step instead of letting `vercel build` do it: in a
 * pnpm workspace, Vercel's auto-bundling doesn't reliably inline our
 * dependencies (it produced a 3.6 KB stub with external references in
 * Draft Buddy). Bundling here, locally, with esbuild gives us a
 * deterministic self-contained Edge function and lets us deploy with
 * `vercel deploy --prebuilt`.
 *
 * Output layout (Vercel Build Output API v3):
 *   .vercel/output/config.json                       — routing
 *   .vercel/output/functions/api/index.func/
 *     ├─ index.js                                    — bundled function
 *     └─ .vc-config.json                             — runtime metadata
 */
import { build } from "esbuild";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".vercel/output");
const FUNC = join(OUT, "functions/api/index.func");

await rm(OUT, { recursive: true, force: true });
await mkdir(FUNC, { recursive: true });

console.log("Bundling api/index.ts → .vercel/output/functions/api/index.func/index.js");

const result = await build({
  entryPoints: [join(ROOT, "api/index.ts")],
  bundle: true,
  platform: "neutral",
  format: "esm",
  target: "es2022",
  outfile: join(FUNC, "index.js"),
  // Resolve packages preferring Edge/worker entry points, then ESM, then CJS.
  conditions: ["edge-light", "workerd", "worker", "browser", "import", "default"],
  mainFields: ["module", "main"],
  // Edge runtime exposes Web APIs; mark common Node-only modules external so
  // the bundle errors loudly if anything tries to import them at runtime.
  external: ["node:*"],
  legalComments: "none",
  minify: true,
});

if (result.warnings.length) {
  for (const w of result.warnings) console.warn("warn:", w.text);
}

await writeFile(
  join(FUNC, ".vc-config.json"),
  JSON.stringify({ runtime: "edge", entrypoint: "index.js" }, null, 2)
);

await writeFile(
  join(OUT, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [{ src: "/(.*)", dest: "/api/index" }],
    },
    null,
    2
  )
);

const { statSync } = await import("node:fs");
const bundleKB = Math.round(statSync(join(FUNC, "index.js")).size / 1024);
console.log(`✓ Built. Bundle: ${bundleKB} KB`);
