/* Ingest the Hisn al-Muslim (Fortress of the Muslim) dua corpus.
   Source dataset (pinned): github.com/wafaaelmaandy/Hisn-Muslim-Json (husn_en.json).
   Run: node worker/scripts/ingest-dua-corpus.mjs  →  <repo>/src/data/dua/search-corpus.json */
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SRC = 'https://raw.githubusercontent.com/wafaaelmaandy/Hisn-Muslim-Json/master/husn_en.json';
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../src/data/dua/search-corpus.json');
const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

async function main() {
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
