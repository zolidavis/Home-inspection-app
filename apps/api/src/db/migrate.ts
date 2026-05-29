/**
 * Standalone migration runner. Use `pnpm db:migrate` to apply pending
 * migrations against $DATABASE_URL. Safe to run repeatedly — Drizzle
 * tracks applied migrations in the __drizzle_migrations metadata table.
 *
 * Uses the same neon-http driver as the app — each SQL statement in a
 * migration file becomes its own HTTP request, no TCP required.
 */
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);
const db = drizzle(sql);

const here = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(here, "../../drizzle");

await migrate(db, { migrationsFolder });
console.log("✓ migrations applied");
