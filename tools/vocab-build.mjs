#!/usr/bin/env node
/* Vocabulary — build CLI (operator-run).
   Usage: node tools/vocab-build.mjs [--in tools/vocab/terms.source.json]
   Validates the curation source against the slice-1 taxonomy (fail-closed) and emits
   src/data/vocab/terms.json + topic-terms.json. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../src/js/quran-vocab-core.js');

function arg(name, def) { const i = process.argv.indexOf('--' + name); return (i !== -1 && process.argv[i + 1]) ? process.argv[i + 1] : def; }

const inFile = arg('in', 'tools/vocab/terms.source.json');
const OUT_DIR = 'src/data/vocab';

let source;
try { source = JSON.parse(fs.readFileSync(inFile, 'utf8')); }
catch (e) { console.error('Cannot read/parse ' + inFile + ': ' + e.message); process.exit(1); }

// Shared taxonomy { slug: label } from slice 1 — build fails if a term maps outside it.
const versesTopics = JSON.parse(fs.readFileSync('src/data/related-verses/topics.json', 'utf8'));
const taxonomy = {};
Object.keys(versesTopics).forEach(function (slug) { taxonomy[slug] = versesTopics[slug].label; });

const v = core.validateSource(source, taxonomy);
if (!v.ok) {
  console.error('❌ Source validation failed (' + v.errors.length + ' error(s)):');
  v.errors.forEach(function (e) { console.error('  - ' + e); });
  process.exit(1);
}

const out = core.compileIndex(source, taxonomy);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'terms.json'), JSON.stringify(out.terms, null, 2) + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'topic-terms.json'), JSON.stringify(out.topicTerms, null, 2) + '\n');
console.log('✅ Wrote ' + Object.keys(out.terms).length + ' terms across ' + Object.keys(out.topicTerms).length + ' topic(s) to ' + OUT_DIR);
