#!/usr/bin/env node
/* Related Verses — build CLI (operator-run).
   Usage: node tools/related-verses-build.mjs [--in tools/related-verses/topics.source.json]
   Validates the curation source (fail-closed), bakes Saheeh Int'l translations,
   and emits src/data/related-verses/topics.json + verse-index.json. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../src/js/quran-related-core.js');

function arg(name, def) { const i = process.argv.indexOf('--' + name); return (i !== -1 && process.argv[i + 1]) ? process.argv[i + 1] : def; }

const inFile = arg('in', 'tools/related-verses/topics.source.json');
const OUT_DIR = 'src/data/related-verses';
const TRANSLATOR = 'Saheeh International';

// 1. Load source + chapters
let source;
try { source = JSON.parse(fs.readFileSync(inFile, 'utf8')); }
catch (e) { console.error('Cannot read/parse ' + inFile + ': ' + e.message); process.exit(1); }

const chapters = JSON.parse(fs.readFileSync('src/data/chapters.json', 'utf8'));
const chapterList = Array.isArray(chapters) ? chapters : (chapters.chapters || chapters.data || []);
const ayahCounts = {}, surahNames = {};
chapterList.forEach(function (c) { ayahCounts[c.id] = c.verses_count; surahNames[c.id] = c.name_simple; });

// 2. Validate — fail closed
const v = core.validateSource(source, ayahCounts);
if (!v.ok) {
  console.error('❌ Source validation failed (' + v.errors.length + ' error(s)):');
  v.errors.forEach(function (e) { console.error('  - ' + e); });
  process.exit(1);
}

// 3. Bake translations for each unique key
const keys = [];
Object.keys(source).forEach(function (slug) {
  source[slug].verses.forEach(function (row) { if (keys.indexOf(row.key) === -1) keys.push(row.key); });
});

async function fetchTranslation(key) {
  const url = 'https://api.alquran.cloud/v1/ayah/' + key + '/en.sahih';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'IslamicInfo.org build (hello@islamicinfo.org)' },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const text = data && data.data && data.data.text;
  if (!text) throw new Error('unexpected upstream shape');
  return String(text).trim();
}

const translations = {};
for (const key of keys) {
  try {
    translations[key] = { translation: await fetchTranslation(key), translator: TRANSLATOR };
    console.log('  ✓ ' + key);
  } catch (e) {
    console.error('❌ Could not fetch translation for ' + key + ': ' + e.message);
    process.exit(1); // fail closed — never ship a row without its baked translation
  }
  await new Promise(function (r) { setTimeout(r, 120); }); // gentle throttle
}

// 4. Compile + write
const out = core.compileIndex(source, translations, surahNames);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'topics.json'), JSON.stringify(out.topics, null, 2) + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'verse-index.json'), JSON.stringify(out.verseIndex, null, 2) + '\n');
console.log('✅ Wrote ' + Object.keys(out.topics).length + ' topics, ' + Object.keys(out.verseIndex).length + ' verses to ' + OUT_DIR);
