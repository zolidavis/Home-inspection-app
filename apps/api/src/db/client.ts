/**
 * Drizzle + @neondatabase/serverless (HTTP driver).
 *
 * Single source of truth for DB access. Works in both Node (local dev,
 * the migrate script) and Vercel Edge (the deployed function) because
 * the Neon HTTP driver only uses `fetch` — no TCP, no WebSocket.
 *
 * Migrations are NOT auto-applied at import time. Run `pnpm db:migrate`
 * once after schema changes.
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Provision a Neon (or any Postgres) " +
      "instance and add the connection string to your env.",
  );
}

const sql = neon(url);

export const db = drizzle(sql, { schema });
