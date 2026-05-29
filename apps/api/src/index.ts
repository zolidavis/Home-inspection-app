import { serve } from "@hono/node-server";
import { app } from "./app";

/**
 * Local Node dev entry. On Vercel the function lives at
 * `apps/api/api/index.ts` and uses the Edge runtime.
 */
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`inspect-ai-api listening on http://localhost:${port}`);
