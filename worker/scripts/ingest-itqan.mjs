#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   ingest-itqan.mjs — fetch the Itqan Rijal Database (public static JSON
   on GitHub Pages) and emit a D1-importable SQL file. Runs on the OWNER's
   machine (Node 18+ — global fetch, no size limit). ADR-046/047.

   Usage:
     node worker/scripts/ingest-itqan.mjs --dry      # fetch + count only (verify 115,735)
     node worker/scripts/ingest-itqan.mjs            # write worker/migrations/0002_narrators_data.sql
   Then:
     wrangler d1 execute rijal --file worker/migrations/0001_narrators.sql
     wrangler d1 execute rijal --file worker/migrations/0002_narrators_data.sql

   NO fabrication: every row is copied verbatim from the source; missing
   fields are stored as-is (often "-"). This script only transports data.
   ═══════════════════════════════════════════════════════════════════ */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = 'https://r3genesi5.github.io/Itqan/app/data/rijal/';
const MANIFEST = BASE + 'manifest.json';
const DRY = process.argv.includes('--dry');
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../migrations/0002_narrators_data.sql');
const BATCH = 400; // rows per INSERT statement

function sqlStr(v) {
  if (v == null) return 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function rowValues(id, p) {
  return '(' + [
    Number(id) || 0,
    sqlStr(p.full_name), sqlStr(p.kunya), sqlStr(p.grade_en), sqlStr(p.grade_ar),
    sqlStr(p.dhahabi), sqlStr(p.death), sqlStr(p.tabaqat), sqlStr(p.city),
    sqlStr(JSON.stringify(p.classical_sources || {})),
    sqlStr(JSON.stringify(p.namings || [])),
  ].join(',') + ')';
}

async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
  return r.json();
}

async function main() {
  const manifest = await getJson(MANIFEST);
  const files = manifest.files || [];
  console.error(`manifest v${manifest.version} — ${files.length} files, total_profiles=${manifest.total_profiles}`);

  const cols = 'id,full_name,kunya,grade_en,grade_ar,dhahabi,death,tabaqat,city,classical_sources,namings';
  const chunks = [];
  let total = 0;

  for (const f of files) {
    const name = f.file || f.filename || f.name;
    const profiles = await getJson(BASE + name);
    const ids = Object.keys(profiles);
    console.error(`  ${name}: ${ids.length} (manifest count ${f.count})`);
    total += ids.length;
    if (DRY) continue;
    for (let i = 0; i < ids.length; i += BATCH) {
      const rows = ids.slice(i, i + BATCH).map((id) => rowValues(id, profiles[id]));
      chunks.push(`INSERT OR REPLACE INTO narrators (${cols}) VALUES\n${rows.join(',\n')};`);
    }
  }

  console.error(`TOTAL profiles: ${total} (expected 115735)`);
  if (DRY) { console.error('dry run — no file written'); return; }
  writeFileSync(OUT, chunks.join('\n') + '\n', 'utf8');
  console.error(`wrote ${OUT} (${chunks.length} INSERT batches)`);
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
