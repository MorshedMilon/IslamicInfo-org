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

test('trace empty notices carry role="note" (ARIA on honest-unavailable text)', () => {
  // Force the empty branch in each exported column builder and assert EVERY emitted
  // .dv-empty notice is a role="note" (not a live region). Matn col: Arabic-not-available
  // + topics + qverses; isnad col: chain-unavailable; grading col: grading + 2 commentary
  // + related. Covers all 7 notice sites across the 3 exported builders.
  const matn = core.buildMatnColHTML({});               // no arabic, no topics, no qverses
  const isnad = core.buildIsnadColHTML({});              // no narrators
  const grading = core.buildGradingColHTML({});          // no grade, no characterization
  [matn, isnad, grading].forEach((html) => {
    // No bare <div class="dv-empty"> without role="note" may survive.
    assert.doesNotMatch(html, /class="dv-empty"(?![^>]*role="note")/);
  });
  assert.match(matn, /class="dv-empty" role="note">Arabic text not available\./);
  assert.match(matn, /class="dv-empty" role="note">Topics are being compiled/);
  assert.match(isnad, /class="dv-empty" role="note">Chain of narration not available/);
  assert.match(grading, /class="dv-empty" role="note">Scholarly grading not individually recorded/);
  assert.match(grading, /class="dv-empty" role="note">Commentary not yet available\./);
  // Live-region role must NOT be used for these static honest-unavailable notices.
  assert.doesNotMatch(matn + isnad + grading, /class="dv-empty"[^>]*role="status"/);
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

test('builders never throw on null/undefined/malformed hadith', () => {
  const inputs = [null, undefined, {}, { topics: 'nope', isnad: { narrators: 'nope' } }, { grade: null }, { isnad: {} }];
  for (const h of inputs) {
    assert.doesNotThrow(() => core.buildTraceHTML(h));
    assert.doesNotThrow(() => core.buildBreadcrumb(h));
    assert.doesNotThrow(() => core.buildCopyContent(h, ''));
  }
});

test('non-array topics/narrators fall back to honest states, no fabrication', () => {
  const h = core.buildMatnColHTML(bukhari({ topics: 'notanarray' }));
  assert.match(h, /Topics are being compiled/);
  assert.ok(!/topic-chip/.test(h));
  const i = core.buildIsnadColHTML(bukhari({ isnad: { narrators: 'notanarray' } }));
  assert.match(i, /Chain of narration not available/);
  assert.ok(!/trace-isnad-node/.test(i));
});

test('XSS: narrator id + name and grade fields are escaped', () => {
  const i = core.buildIsnadColHTML(bukhari({ isnad: { narrators: [{ id: '"><img src=x onerror=1>', fullName: '<script>a</script>', role: 'Tabii' }] } }));
  assert.ok(!/<img /.test(i));
  assert.ok(!/<script>/.test(i));
  assert.match(i, /data-narrator-id="&quot;&gt;/); // quote-breakout neutralized in the attribute
  const g = core.buildGradingColHTML(bukhari({ grade: { value: 'sahih', label: '<b>x</b>', grader: '<i>y</i>' } }));
  assert.ok(!/<b>/.test(g) && !/<i>/.test(g));
});
