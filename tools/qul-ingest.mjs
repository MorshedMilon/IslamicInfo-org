#!/usr/bin/env node
/* Module 6 — QUL ingest CLI (operator-run).
   Usage: node tools/qul-ingest.mjs --in <export.json> --id <qulReciterId> --name "<name>" [--style "<style>"]
   Transforms a QUL ayah-by-ayah export into static per-surah AyahAudio JSON under src/data/qul/. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../src/js/quran-qul-core.js');

function arg(name, def) { const i = process.argv.indexOf('--' + name); return (i !== -1 && process.argv[i + 1]) ? process.argv[i + 1] : def; }

const inFile = arg('in'), qulId = arg('id'), name = arg('name'), style = arg('style', '');
if (!inFile || !qulId || !name) {
  console.error('Usage: node tools/qul-ingest.mjs --in <export.json> --id <qulReciterId> --name "<name>" [--style "<style>"]');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const ayahs = Array.isArray(raw) ? raw : (raw.ayahs || raw.data || raw.segments || []);
const grouped = core.groupBySurah(ayahs);
const offset = core.offsetId(qulId);
const outDir = path.join('src', 'data', 'qul', String(offset));
fs.mkdirSync(outDir, { recursive: true });

let surahCount = 0, ayahCount = 0;
for (const surah of Object.keys(grouped)) {
  fs.writeFileSync(path.join(outDir, surah + '.json'), JSON.stringify(grouped[surah]));
  surahCount++; ayahCount += grouped[surah].length;
}

const manifestPath = path.join('src', 'data', 'qul', 'reciters.json');
let manifest = [];
try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (_) {}
manifest = manifest.filter((r) => r.id !== offset);
manifest.push({ id: offset, name, style });
manifest.sort((a, b) => a.id - b.id);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Ingested "${name}" (QUL ${qulId} -> id ${offset}): ${surahCount} surahs, ${ayahCount} ayahs -> ${outDir}`);
console.log(`Manifest: ${manifestPath} (${manifest.length} QUL reciters)`);
console.log('REMINDER: confirm this reciter\'s QUL license permits redistribution AND that the audio URLs are hotlinkable before committing/pushing.');
