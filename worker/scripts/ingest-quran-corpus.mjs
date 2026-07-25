/* Ingest the full Qur'an search corpus from quran.com API v4.
   Arabic = text_uthmani; English = translation edition 20 (Saheeh International, pinned).
   Reproducible. Run: node worker/scripts/ingest-quran-corpus.mjs
   Writes <repo>/src/data/quran/search-corpus.json */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const EDITION_ID = 20;                 // Saheeh International (pinned)
const EDITION_NAME = 'Saheeh International';
const API = 'https://api.quran.com/api/v4/verses/by_chapter';
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../src/data/quran/search-corpus.json');
const CHAPTERS = resolve(__dir, '../../src/data/chapters.json');

const stripHtml = (s) => String(s || '').replace(/<sup[^>]*>.*?<\/sup>/gis, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function loadSurahNames() {
  try {
    const raw = JSON.parse(await readFile(CHAPTERS, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.chapters || []);
    const map = {};
    for (const c of list) {
      const id = c.id || c.chapter_number || c.number;
      const name = c.name_simple || c.nameSimple || c.englishName || c.name || ('Surah ' + id);
      if (id) map[id] = name;
    }
    return map;
  } catch { return {}; }
}

async function fetchChapter(id) {
  const out = [];
  let page = 1, totalPages = 1;
  do {
    const url = `${API}/${id}?language=en&fields=text_uthmani&translations=${EDITION_ID}&per_page=300&page=${page}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`chapter ${id} p${page} HTTP ${r.status}`);
    const j = await r.json();
    for (const v of j.verses) {
      const tr = (v.translations && v.translations[0] && v.translations[0].text) || '';
      out.push({ verseKey: v.verse_key, surah: id, ayah: v.verse_number, arabic: v.text_uthmani, translation: stripHtml(tr) });
    }
    totalPages = (j.pagination && j.pagination.total_pages) || 1;
    page++;
  } while (page <= totalPages);
  return out;
}

async function main() {
  const names = await loadSurahNames();
  const verses = [];
  for (let id = 1; id <= 114; id++) {
    const rows = await fetchChapter(id);
    for (const row of rows) row.surahName = names[id] || ('Surah ' + id);
    verses.push(...rows);
    process.stderr.write(`surah ${id}: ${rows.length} (total ${verses.length})\n`);
  }
  if (verses.length !== 6236) throw new Error(`expected 6236 verses, got ${verses.length} — aborting write`);
  const doc = { meta: { source: 'quran.com API v4', arabicField: 'text_uthmani',
    translationEditionId: EDITION_ID, translationEditionName: EDITION_NAME,
    fetchedAt: new Date().toISOString(), verseCount: verses.length, schema: 1 }, verses };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(doc));
  process.stderr.write(`WROTE ${OUT} — ${verses.length} verses, ${(JSON.stringify(doc).length/1e6).toFixed(2)} MB\n`);
}
main().catch((e) => { process.stderr.write('INGEST FAILED: ' + e.message + '\n'); process.exit(1); });
