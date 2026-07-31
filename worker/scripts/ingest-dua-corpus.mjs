/* Ingest the Hisn al-Muslim (Fortress of the Muslim) dua corpus.
   Source dataset (pinned): github.com/wafaaelmaandy/Hisn-Muslim-Json (husn_en.json).
   STALE — DO NOT RUN. See the guard below and ADR-058: this script no longer
   reproduces search-corpus.json and would destroy it. */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SRC = 'https://raw.githubusercontent.com/wafaaelmaandy/Hisn-Muslim-Json/master/husn_en.json';
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../src/data/dua/search-corpus.json');
const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

/* ─────────────────────────────────────────────────────────────────────────
   STALE — DO NOT RUN AGAINST THE LIVE CORPUS.

   This script is the documented generator of search-corpus.json (ADR-051) and
   it no longer generates it. The file it would write bears no relation to the
   file that exists:

       this script emits   267 records, schema 1,  5 fields, 5 meta keys
       the live corpus is  556 records, schema 2, ~12 fields, 14 meta keys

   The extra ~289 records and every enrichment pass — entryType, variantRole/
   variantGroup, the occasion facets, sourceLabel, reviewNote, the four-way
   translationSources split — were produced by later passes that are not in
   this script and are not reproducible from it. It also writes the upstream
   English that the corpus meta records as "unlicensed and has been fully
   replaced or nulled", so a run would reintroduce a licensing problem on top
   of the data loss.

   It OVERWRITES; it does not merge. There is no recovery path except git.

   The guard below refuses to run whenever the corpus exists. Do not remove it
   to "just re-ingest" — there is currently no working generator for the corpus
   of record, and rebuilding one is a real task, not a flag flip. See ADR-058.
   ───────────────────────────────────────────────────────────────────────── */
function guard() {
  if (!existsSync(OUT)) return;
  process.stderr.write(
    '\nREFUSING TO RUN — this script is stale and would destroy the corpus.\n\n' +
    `  target: ${OUT}\n\n` +
    '  It emits 267 records with 5 fields each (schema 1). The corpus that\n' +
    '  exists has 556 records with ~12 fields each (schema 2), including\n' +
    '  entryType, variantRole, the occasion facets and sourceLabel — none of\n' +
    '  which this script produces and none of which it can rebuild.\n\n' +
    '  It OVERWRITES rather than merges, so a run silently discards ~289\n' +
    '  records and every enrichment pass, and restores upstream English the\n' +
    '  corpus meta records as unlicensed.\n\n' +
    '  The corpus of record currently has NO working generator (ADR-058).\n' +
    '  If you genuinely intend to re-ingest from scratch, move the existing\n' +
    '  corpus aside deliberately and knowingly first.\n\n');
  process.exit(1);
}

async function main() {
  guard();
  const r = await fetch(SRC);
  if (!r.ok) throw new Error('source HTTP ' + r.status);
  const j = await r.json();
  const chapters = j.English || j.english || [];
  if (!Array.isArray(chapters) || !chapters.length) throw new Error('unexpected dataset shape (no English[] array)');
  const duas = [];
  let dropped = 0;
  for (const c of chapters) {
    const category = clean(c.TITLE);
    for (const t of (c.TEXT || [])) {
      const arabic = clean(t.ARABIC_TEXT);
      const translation = clean(t.TRANSLATED_TEXT);
      const transliteration = clean(t.LANGUAGE_ARABIC_TRANSLATED_TEXT);
      if (!arabic && !translation) { dropped++; continue; }
      duas.push({ id: `${c.ID}:${t.ID}`, category, arabic, transliteration, translation });
    }
  }
  if (duas.length < 250) throw new Error(`expected >=250 duas, got ${duas.length} — aborting write`);
  const doc = { meta: {
    source: "Hisn al-Muslim (Fortress of the Muslim), Sa'id al-Qahtani",
    sourceDataset: 'github.com/wafaaelmaandy/Hisn-Muslim-Json (husn_en.json)',
    licenseNote: 'dataset license unstated; text is the Hisn al-Muslim compilation',
    fetchedAt: new Date().toISOString(), count: duas.length, schema: 1 }, duas };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(doc));
  process.stderr.write(`WROTE ${OUT} — ${duas.length} duas (dropped ${dropped} empty), ${(JSON.stringify(doc).length/1e6).toFixed(2)} MB\n`);
}
main().catch((e) => { process.stderr.write('INGEST FAILED: ' + e.message + '\n'); process.exit(1); });
