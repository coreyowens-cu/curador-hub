import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const MIGRATIONS_FOLDER = "./lib/db/migrations";

/**
 * Repair partial-migration state where the schema from a migration exists
 * in the DB but the corresponding row in drizzle.__drizzle_migrations is
 * missing (e.g. an earlier deploy crashed after DDL but before recording
 * the migration). Without this, every subsequent deploy tries to re-run
 * the already-applied DDL and crashes on "relation already exists".
 *
 * For each journaled migration, if the DB already contains tables/columns
 * the migration would create but the hash row is missing, we insert it.
 */
async function repairMigrationsTable(sql: postgres.Sql) {
  // Make sure drizzle.__drizzle_migrations exists before we try to read it
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  const journalPath = path.join(MIGRATIONS_FOLDER, "meta", "_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8")) as {
    entries: { tag: string; when: number }[];
  };

  // Sentinel objects: if any `table` exists (or `column` exists on `table`),
  // we assume that migration has already been applied.
  const sentinels: Record<
    string,
    { table: string; column?: string }[]
  > = {
    "0000_mushy_young_avengers": [{ table: "users" }, { table: "kv_store" }],
    "0001_little_spiral": [
      { table: "email_allowlist" },
      { table: "users", column: "is_admin" },
    ],
  };

  for (const entry of journal.entries) {
    const sentinel = sentinels[entry.tag];
    if (!sentinel) continue;

    // Does the schema for this migration already exist?
    let schemaPresent = false;
    for (const check of sentinel) {
      if (check.column) {
        const [row] = await sql<
          { exists: boolean }[]
        >`SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = ${check.table}
              AND column_name = ${check.column}
          ) AS exists`;
        if (row.exists) {
          schemaPresent = true;
          break;
        }
      } else {
        const [row] = await sql<
          { exists: boolean }[]
        >`SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ${check.table}
          ) AS exists`;
        if (row.exists) {
          schemaPresent = true;
          break;
        }
      }
    }
    if (!schemaPresent) continue;

    // Compute the hash the way drizzle-orm's migrator does
    const sqlFile = fs.readFileSync(
      path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`),
      "utf8"
    );
    const hash = crypto.createHash("sha256").update(sqlFile).digest("hex");

    // Already recorded?
    const [existing] = await sql<
      { id: number }[]
    >`SELECT id FROM drizzle.__drizzle_migrations WHERE hash = ${hash} LIMIT 1`;
    if (existing) continue;

    console.log(
      `Repair: marking migration ${entry.tag} as applied (schema already present)`
    );
    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${hash}, ${entry.when})
    `;
  }
}

// Kill the process if migrations hang for more than 30 seconds
const TIMEOUT_MS = 30_000;
const timer = setTimeout(() => {
  console.error("Migration timed out after 30s — exiting");
  process.exit(1);
}, TIMEOUT_MS);

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(connectionString, {
    max: 1,
    connect_timeout: 10,
    idle_timeout: 10,
  });
  const db = drizzle(client);

  console.log("Repairing migration state (if needed)...");
  await repairMigrationsTable(client);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log("Migrations complete.");

  clearTimeout(timer);
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  clearTimeout(timer);
  console.error("Migration failed:", err);
  process.exit(1);
});
