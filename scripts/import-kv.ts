import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

const DATABASE_URL = process.argv[2];
if (!DATABASE_URL) {
  console.error("Usage: npx tsx scripts/import-kv.ts <DATABASE_URL>");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

// Known shared state keys we care about
const VALID_PREFIXES = [
  "ns-brands",
  "ns-camp-timeline",
  "ns-campaigns",
  "ns-company",
  "ns-compliance",
  "ns-concept",
  "ns-gantt",
  "ns-initiatives",
  "ns-notes",
  "ns-strategy",
  "ns-team",
  "ns-user",
];

function isValidKey(key: string): boolean {
  return VALID_PREFIXES.some((p) => key.startsWith(p));
}

// Parse CSV properly handling quoted fields with newlines
function parseCSV(raw: string) {
  const rows: { key: string; value: string; updatedAt: string }[] = [];

  // Skip header line
  let pos = raw.indexOf("\n") + 1;

  while (pos < raw.length) {
    // Read key (unquoted, up to first comma)
    const keyEnd = raw.indexOf(",", pos);
    if (keyEnd === -1) break;
    const key = raw.substring(pos, keyEnd);

    // Read value (may be quoted with embedded commas, quotes, newlines)
    let valueStart = keyEnd + 1;
    let value: string;
    let valueEnd: number;

    if (raw[valueStart] === '"') {
      // Quoted field — find the closing quote (not followed by another quote)
      valueStart++; // skip opening quote
      let end = valueStart;
      while (end < raw.length) {
        const q = raw.indexOf('"', end);
        if (q === -1) { end = raw.length; break; }
        if (raw[q + 1] === '"') {
          // Escaped quote, skip both
          end = q + 2;
          continue;
        }
        // Found closing quote
        end = q;
        break;
      }
      value = raw.substring(valueStart, end).replace(/""/g, '"');
      valueEnd = end + 1; // skip closing quote
      // Skip comma after closing quote
      if (raw[valueEnd] === ",") valueEnd++;
    } else {
      // Unquoted field — up to next comma
      const nextComma = raw.indexOf(",", valueStart);
      if (nextComma === -1) break;
      value = raw.substring(valueStart, nextComma);
      valueEnd = nextComma + 1;
    }

    // Read updated_at (rest of line)
    const lineEnd = raw.indexOf("\n", valueEnd);
    const updatedAt = lineEnd === -1
      ? raw.substring(valueEnd).trim()
      : raw.substring(valueEnd, lineEnd).trim();

    pos = lineEnd === -1 ? raw.length : lineEnd + 1;

    if (key && isValidKey(key)) {
      rows.push({ key, value, updatedAt });
    }
  }

  return rows;
}

async function main() {
  const csvPath = join(process.cwd(), "kv_store_rows.csv");
  const raw = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);

  console.log(`Parsed ${rows.length} valid rows from CSV\n`);

  let imported = 0;
  for (const row of rows) {
    if (!row.value || row.value.length === 0) {
      console.log(`  Skipping: ${row.key} (empty value)`);
      continue;
    }

    const ts = row.updatedAt && !isNaN(Date.parse(row.updatedAt))
      ? new Date(row.updatedAt)
      : new Date();

    console.log(`  Importing: ${row.key} (${row.value.length} chars)`);
    await sql`
      INSERT INTO kv_store (key, value, updated_at)
      VALUES (${row.key}, ${row.value}, ${ts})
      ON CONFLICT (key) DO UPDATE SET value = ${row.value}, updated_at = ${ts}
    `;
    imported++;
  }

  console.log(`\nDone! Imported ${imported} rows.`);
  await sql.end();
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});
