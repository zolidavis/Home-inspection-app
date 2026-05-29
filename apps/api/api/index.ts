import { handle } from "hono/vercel";
import { app } from "../src/app";

/**
 * Vercel serverless function entry. The Build Output API config at
 * .vercel/output/config.json catches every path and routes it through
 * this function; Hono's internal router takes it from there.
 *
 * Edge runtime — `hono/vercel`'s `handle()` returns a Web-standard
 * `(req: Request) => Response`, which is what Vercel Edge invokes
 * directly. Notes:
 *   - DB driver is @neondatabase/serverless (HTTP fetch over Neon's
 *     proxy), so no TCP needed.
 *   - Anthropic SDK (>=0.32) ships an Edge-compatible fetch transport.
 *   - @aws-sdk/client-s3 works on Edge.
 *   - The local-disk path in storage.ts lazy-imports node:fs/promises
 *     so the Edge bundle never tries to load it at cold start.
 */
export const config = { runtime: "edge" };

export default handle(app);
