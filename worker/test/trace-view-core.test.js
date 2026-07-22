import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/trace-view-core.js';

// Mirrors the normalized hadith shape (worker/src/lib/hadith-adapter.js): live data yields
// grade sahih/unknown, grader:null, isnad.narrators:[], topics:[], gradeCharacterization for direct source.
function bukhari(over = {}) {
  return Object.assign({
    collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari',
    bookNumber: 1, bookName: 'Revelation', hadithNumber: 1, reference: 'Sahih al-Bukhari 1',
    arabicMatn: 'إنما الأعمال بالنيات', translation: { text: 'Actions are but by intentions', language: 'en' },
    narrator: { name: 'Umar ibn al-Khattab' },
    grade: { value: 'sahih', label: 'Sahih', grader: null, sourceCitation: null, disputed: false, alternateGradings: [] },
    isnad: { status: 'unavailable', narrators: [] }, topics: [],
  }, over);
}

test('buildBreadcrumb: Collection › Book › #N', () => {
  const b = core.buildBreadcrumb(bukhari());
  assert.match(b, /Sahih al-Bukhari/);
  assert.match(b, /Revelation/);
  assert.match(b, /#1/);
});

test('matn column: real arabic + translation present', () => {
  const h = core.buildMatnColHTML(bukhari());
  assert.match(h, /إنما الأعمال بالنيات/);
  assert.match(h, /Actions are but by intentions/);
});

test('matn column: empty topics + no qverses render honest states (never invented)', () => {
  const h = core.buildMatnColHTML(bukhari());
  assert.match(h, /Topics are being compiled/i);
  assert.match(h, /No linked Qur/i);
  assert.ok(!/topic-chip/.test(h)); // no chips fabricated when topics:[]
});

test('isnad column: empty narrators → honest "not available", no fabricated chain', () => {
  const h = core.buildIsnadColHTML(bukhari());
  assert.match(h, /Chain of narration not available for this hadith\./);
  assert.ok(!/trace-isnad-node/.test(h));
});

test('isnad column: when narrators present, rows carry data-narrator-id for Module 8 reuse', () => {
  const h = core.buildIsnadColHTML(bukhari({ isnad: { status: 'ok', narrators: [{ id: 'n1', fullName: 'Yahya', role: 'Tabii' }] } }));
  assert.match(h, /data-narrator-id="n1"/);
  assert.match(h, /role="button"/);
  assert.match(h, /Yahya/);
});

test('grading column: real sahih grade block + grader-not-cited honesty', () => {
  const h = core.buildGradingColHTML(bukhari());
  assert.match(h, /grade-sahih/);
  assert.match(h, /Sahih/);
  assert.match(h, /grader not individually cited/);
});

test('grading column: ADVERSARIAL — Ibn Hajar + an-Nawawi boxes are honest-empty, NEVER paraphrased', () => {
  const h = core.buildGradingColHTML(bukhari());
  assert.match(h, /Ibn Hajar/);
  assert.match(h, /an-Nawawi/i);
  // Both boxes must contain ONLY the honest unavailable string — no scholar prose.
  const boxes = h.match(/Commentary not yet available\./g) || [];
  assert.equal(boxes.length, 2, 'both commentary boxes must be honest-empty');
  assert.match(h, /Related narrations are being compiled/);
});

test('grading column: no grade + characterization → collection-level honesty', () => {
  const h = core.buildGradingColHTML(bukhari({ grade: null, gradeCharacterization: 'Sahih (collection-level)' }));
  assert.match(h, /Sahih \(collection-level\)/);
  assert.match(h, /collection-level characterization/);
});

test('buildCopyContent: maps hadith → the content shape buildCopyText expects', () => {
  const c = core.buildCopyContent(bukhari(), 'https://islamicinfo.org/hadith/sahih-bukhari/1/1');
  assert.equal(c.arabic, 'إنما الأعمال بالنيات');
  assert.equal(c.translation, 'Actions are but by intentions');
  assert.equal(c.reference, 'Sahih al-Bukhari 1');
  assert.equal(c.grade, 'Sahih');
  assert.equal(c.sourceUrl, 'https://islamicinfo.org/hadith/sahih-bukhari/1/1');
});

test('resolveExitTarget: viaRoute → nav to deep-view route; card → no nav', () => {
  const r = { collection: 'sahih-bukhari', book: 1, hadith: 1 };
  assert.deepEqual(core.resolveExitTarget({ viaRoute: true, route: r }), { nav: true, route: r });
  assert.deepEqual(core.resolveExitTarget({ viaRoute: false }), { nav: false, route: null });
});

test('XSS: matn/translation are escaped', () => {
  const h = core.buildMatnColHTML(bukhari({ arabicMatn: '<script>x</script>', translation: { text: '<img src=x onerror=1>' } }));
  assert.ok(!/<script>/.test(h));
  assert.ok(!/<img /.test(h));
  assert.match(h, /&lt;script&gt;/);
});
