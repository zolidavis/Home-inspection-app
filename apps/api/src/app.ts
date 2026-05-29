import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { inspections } from "./routes/inspections";
import { photos } from "./routes/photos";
import { address } from "./routes/address";
import { ai } from "./routes/ai";
import { pdf } from "./routes/pdf";
import { suggestions } from "./routes/suggestions";

/**
 * Hono app. Exported separately from the dev-server entry so it can be
 * mounted both locally (via `@hono/node-server`) and on Vercel
 * serverless functions (via `hono/vercel` from `../api/index.ts`).
 */
export const app = new Hono();
app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => c.json({ name: "inspect-ai-api", status: "ok" }));
app.get("/health", (c) => c.json({ ok: true }));

app.route("/inspections", inspections);
app.route("/photos", photos);
app.route("/address", address);
app.route("/ai", ai);
app.route("/pdf", pdf);
// `suggestions` defines its own /inspections/:id/* paths so it mounts at root.
app.route("/", suggestions);
