/* Regenerate src/data/tafsir-saadi/{surah}.json from the archive.org English
   Tafseer as-Sa'di 10-volume set (layout-aware DjVu-XML OCR ingest).

   Usage:  node tools/saadi-ingest/run.mjs
   Downloads the 10 volume _djvu.xml files (~83 MB) to a temp dir, parses them with
   ./parse.js (geometry-aware: drops headers/footers/footnotes/Arabic, segments by
   running "(N-M)" range headers + "X:N." verse-key runs), and writes the per-surah
   block JSON the app loads. Requires network. See README.md for provenance. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');
const { ingest } = require('./parse.js');

const BASE = 'https://archive.org/download/Tafseer-As-Sadi-Juz-1-30';
const VOLS = {
  1: 'Volume-1-Juz-1-3', 2: 'Volume-2-Juz-4-6', 3: 'Volume-3-Juz-7-9',
  4: 'Volume-4-Juz-10-12', 5: 'Volume-5-Juz-13-15', 6: 'Volume-6-Juz-16-18',
  7: 'Volume-7-Juz-19-21', 8: 'Volume-8-Juz-22-24', 9: 'Volume-9-Juz-25-27',
  10: 'Volume-10-Juz-28-30'
};

const tmp = path.join(os.tmpdir(), 'saadi-ingest');
fs.mkdirSync(tmp, { recursive: true });

async function download(n) {
  const dst = path.join(tmp, `vol${n}.xml`);
  if (fs.existsSync(dst) && fs.statSync(dst).size > 1e6) return dst;
  const url = `${BASE}/Tafseer-As-Sadi-${VOLS[n]}_djvu.xml`;
  process.stderr.write(`downloading vol${n}…\n`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`vol${n}: HTTP ${res.status}`);
  fs.writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
  return dst;
}

const all = [];
for (let n = 1; n <= 10; n++) {
  const f = await download(n);
  const blocks = ingest(f);
  process.stderr.write(`vol${n}: ${blocks.length} blocks\n`);
  all.push(...blocks);
}

const bySurah = {};
for (const b of all) (bySurah[b.surah] ??= []).push(b);

const outDir = path.join(REPO, 'src', 'data', 'tafsir-saadi');
fs.mkdirSync(outDir, { recursive: true });
let files = 0;
for (const s of Object.keys(bySurah)) {
  const arr = bySurah[s]
    .map(b => ({ from: b.from, to: b.to, text: b.text }))
    .sort((a, b) => a.from - b.from || a.to - b.to);
  fs.writeFileSync(path.join(outDir, `${s}.json`), JSON.stringify(arr));
  files++;
}
const covered = Object.keys(bySurah).map(Number).sort((a, b) => a - b);
const missing = []; for (let s = 1; s <= 114; s++) if (!bySurah[s]) missing.push(s);
console.log(`wrote ${files} surah files → ${outDir}`);
console.log(`surahs covered: ${covered.length}/114  |  missing: ${missing.join(',') || 'none'}`);
