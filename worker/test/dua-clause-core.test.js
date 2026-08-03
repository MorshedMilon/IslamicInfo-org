import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const core = require(resolve(ROOT, 'src/js/dua-clause-core.js'));
const corpus = JSON.parse(readFileSync(resolve(ROOT, 'src/data/dua/search-corpus.json'), 'utf8'));
const byId = Object.fromEntries(corpus.duas.map((d) => [String(d.id), d]));

test('normalise strips 0653-0655 so laa-alif-maddah matches plain laa', () => {
  // "لَّآ إِلَٰهَ إِلَّآ أَنتَ" must reduce to "لا اله الا انت".
  assert.ok(core.normalise('لَّآ إِلَـٰهَ إِلَّآ أَنتَ').out.includes('لا اله الا انت'));
});

test('normalise index map slices the ORIGINAL text, diacritics intact', () => {
  const src = byId['quran:3:173'];
  const r = core.extract(src);
  assert.ok(r.ok);
  assert.ok(src.arabic.includes(r.text), 'returned text must be a verbatim substring of the source');
  assert.match(r.text, /[ً-ْ]/, 'diacritics must survive in the output');
});

test('shape detection', () => {
  assert.equal(core.detectShape(byId['abudawud:1426']), core.SHAPES.CLASS_B);
  assert.equal(core.detectShape(byId['quran:3:173']), core.SHAPES.QURAN_CLAUSE);
  assert.equal(core.detectShape(byId['106:218']), core.SHAPES.PREFIX_TRIM);
  assert.equal(core.detectShape({ id: 'x', arabic: '' }), null);
});

test('every result demands review and is never self-certified', () => {
  for (const id of ['abudawud:1426', 'quran:3:173', '106:218', '27:75']) {
    const r = core.extract(byId[id]);
    assert.equal(r.needsReview, true, id);
    assert.equal(r.verified, false, id);
  }
});

/* Compare through normalise(), never against a hand-typed Arabic literal. The corpus and a
   literal in this file can carry the same word in different Unicode forms, and four
   assertions here failed on exactly that before the text itself was ever wrong. */
const norm = (s) => core.normalise(String(s || '')).out;

test('quran-clause finds the supplication inside a narrative ayah', () => {
  const r = core.extract(byId['quran:21:83']);           // "And Job, when he cried unto his Lord…"
  assert.ok(r.ok);
  assert.ok(norm(r.text).startsWith('اني مسني'), norm(r.text).slice(0, 30));
  assert.ok(r.pctOfAyah < 100, 'a narrative ayah must yield less than the whole verse');
});

test('quran-clause declines on a verse that is not a petition', () => {
  // Ayat al-Kursi is declarative; there is no vocative to find. Declining is correct.
  const r = core.extract({ id: 'quran:2:255', arabic: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ' });
  assert.equal(r.ok, false);
  assert.match(r.why, /not be a petition/);
});

test('class B trims an instruction that precedes the dua inside the same quote', () => {
  const r = core.extract(byId['bukhari:6114']);   // "…let him say: O Allah, keep me alive…"
  assert.ok(r.ok);
  assert.equal(r.via, 'trimmed at a reporting verb');
  assert.ok(norm(r.text).startsWith('اللهم'), norm(r.text).slice(0, 24));
});

test('class B reports low confidence rather than pretending, when no marker matches', () => {
  const r = core.extract({ id: 'x:1', arabic: 'حَدَّثَنَا فُلَانٌ "نص لا يبدأ بنداء ولا فعل قول هنا"' });
  assert.ok(r.ok);
  assert.equal(r.confidence, 'low');
  assert.match(r.via, /no marker matched/);
});

test('verse-from-bundle refuses to guess without an anchor', () => {
  const r = core.extract(byId['28:101'], { shape: core.SHAPES.VERSE_FROM_BUNDLE });
  assert.equal(r.ok, false);
  assert.match(r.why, /refusing to guess/);
});

test('verse-from-bundle: a naive clause pass lands in the WRONG ayah, the anchor fixes it', () => {
  // 28:101 holds 2:285 and 2:286. 2:285 ends "غُفْرَانَكَ رَبَّنَا…", so the first vocative
  // belongs to the previous verse — this is the whole reason the shape exists.
  const naive = core.extract(byId['28:101'], { shape: core.SHAPES.QURAN_CLAUSE });
  assert.ok(naive.ok);
  assert.ok(norm(naive.text).startsWith('ربنا واليك المصير'),
    'the naive pass lands at the END of 2:285, not the start of 2:286 — that is the bug this shape exists for');

  const anchored = core.extract(byId['28:101'], { anchor: 'ربنا لا تؤاخذنا' });
  assert.ok(anchored.ok, anchored.why);
  assert.equal(anchored.shape, core.SHAPES.VERSE_FROM_BUNDLE);
  assert.ok(norm(anchored.text).startsWith('ربنا لا تؤاخذنا'));
});

test('verse-from-bundle rejects an ambiguous anchor', () => {
  const r = core.extract({ id: 'x', arabic: 'رَبَّنَا آتِنَا ... رَبَّنَا آتِنَا' }, { anchor: 'ربنا اتنا' });
  assert.equal(r.ok, false);
  assert.match(r.why, /more than once/);
});

test('prefix-trim removes a taawwudh printed ahead of the passage', () => {
  const r = core.extract(byId['27:75']);          // Ayat al-Kursi with an a'udhu prefix
  assert.ok(r.ok);
  assert.match(r.via, /taʿawwudh/);
  assert.ok(!norm(r.text).includes('الشيطان'), 'the taawwudh must be gone from the output');
  assert.ok(norm(r.removed).includes('اعوذ'), 'and must be reported as removed');
});

test('prefix-trim drops a narrator frame ahead of ((delimited)) text', () => {
  const r = core.extract(byId['106:218']);        // "كان النبي ﷺ إذا أتاه الأمر يسره قال: ((…))"
  assert.ok(r.ok);
  assert.ok(!norm(r.text).includes('كان النبي'), 'narrator frame must be gone');
  assert.ok(norm(r.removed).includes('كان النبي'), 'and reported as removed');
});

test('a record holding two delimited duas takes the first and reports the count', () => {
  // 106:218 carries one dua for news that pleases and another for news that does not.
  const r = core.extract(byId['106:218']);
  assert.equal(r.delimitedSpans, 2);
  assert.ok(!r.text.includes('))'), 'must not run past the first closing delimiter');
});

/* The delimiter is not a reliable boundary in either direction. These three records are the
   evidence for grading every delimiter-based prefix-trim LOW regardless of span count —
   without them the shape looks far more trustworthy than it is. */
test('delimiter-based prefix-trim is always low confidence, and here is why', () => {
  // 96:207 — the takbir and Qur'anic opening BEFORE the delimiter are part of the travel dua.
  const travel = core.extract(byId['96:207']);
  assert.equal(travel.confidence, 'low');
  assert.ok(norm(travel.removed).includes('الله اكبر'), 'the removed text is really part of the dua');

  // 26:74 — the ONLY delimited span is the instruction; the istikhara dua is not inside it.
  const istikhara = core.extract(byId['26:74']);
  assert.equal(istikhara.delimitedSpans, 1, 'single span');
  assert.equal(istikhara.confidence, 'low', 'a single span must not be graded higher');
  assert.ok(norm(istikhara.text).startsWith('اذا هم احدكم'), 'kept text is the instruction, not the dua');

  // 13:20 — here the pre-delimiter text genuinely IS an instruction, correctly dropped.
  const mosque = core.extract(byId['13:20']);
  assert.ok(norm(mosque.removed).includes('يقول'), 'correctly drops "and he says:"');
});

test('the taawwudh case stays medium — it is structurally unambiguous', () => {
  assert.equal(core.extract(byId['27:75']).confidence, 'medium');
});

test('the source arabic is never mutated', () => {
  const before = byId['106:218'].arabic;
  core.extract(byId['106:218']);
  assert.equal(byId['106:218'].arabic, before);
});
