import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { inspections } from "./routes/inspections.js";
import { photos } from "./routes/photos.js";
import { address } from "./routes/address.js";
import { ai } from "./routes/ai.js";
import { pdf } from "./routes/pdf.js";
import { suggestions } from "./routes/suggestions.js";

const app = new Hono();
app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => c.json({ name: "hia-api", status: "ok" }));
app.get("/health", (c) => c.json({ ok: true }));

app.route("/inspections", inspections);
app.route("/photos", photos);
app.route("/address", address);
app.route("/ai", ai);
app.route("/pdf", pdf);
// `suggestions` defines its own /inspections/:id/* paths so it mounts at root.
app.route("/", suggestions);

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`hia-api listening on http://localhost:${port}`);
