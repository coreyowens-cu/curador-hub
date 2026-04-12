import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

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

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
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
