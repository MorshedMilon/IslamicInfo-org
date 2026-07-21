import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/tier3-deep-view-core.js';

/* Fixture mirrors the normalized hadith shape (worker/src/lib/hadith-adapter.js).
   Live hadithapi always yields a single EN translation, grader:null,
   isnad.narrators:[], topics:[], alternateGradings:[]. */
function bukhari(over = {}) {
  return Object.assign({
    collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari',
    bookNumber: 1, bookName: 'Revelation', hadithNumber: 1,
    reference: 'Sahih al-Bukhari · Book 1 · Hadith 1',
    arabicMatn: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    translation: { text: 'The reward of deeds depends upon the intentions.', language: 'en', edition: 'hadithapi.com', translator: null },
    narrator: { id: null, name: "Narrated 'Umar ibn al-Khattab:", arabicName: null },
    grade: { value: 'sahih', label: 'Sahih', grader: null, disputed: false, alternateGradings: [] },
    isnad: { status: 'unavailable', narrators: [] },
    topics: [],
  }, over);
}

test('translationModel: single EN translation → one entry, English label', () => {
  const m = core.translationModel(bukhari());
  assert.equal(m.length, 1);
  assert.equal(m[0].lang, 'en');
  assert.equal(m[0].label, 'English');
  assert.match(m[0].text, /reward of deeds/);
});

test('translationModel: AR-tagged provider translation is treated as EN (no fabricated language)', () => {
  const m = core.translationModel(bukhari({ translation: { text: 'x', language: 'ar' } }));
  assert.equal(m.length, 1);
  assert.equal(m[0].lang, 'en');
});

test('translationModel: multiple editions sort into canonical EN·UR·FR·ID·TR order', () => {
  const m = core.translationModel(bukhari({
    translations: [{ text: 'tr', language: 'tr' }, { text: 'ur', language: 'ur' }],
  }));
  assert.deepEqual(m.map((x) => x.lang), ['en', 'ur', 'tr']);
});

test('translationModel: empty payload → empty array, never throws', () => {
  assert.deepEqual(core.translationModel(null), []);
  assert.deepEqual(core.translationModel({}), []);
  assert.deepEqual(core.translationModel({ translation: { text: '' } }), []);
});

test('chooseLang: honors preferred when present, else first available', () => {
  const m = core.translationModel(bukhari({ translations: [{ text: 'ur', language: 'ur' }] }));
  assert.equal(core.chooseLang(m, 'ur'), 'ur');
  assert.equal(core.chooseLang(m, 'fr'), 'en');   // preferred absent → first
  assert.equal(core.chooseLang([], 'en'), null);
});

/* ── gradingsTableHTML ── */
test('gradingsTableHTML: live single grade → one row + gap note, no fabricated scholar', () => {
  const html = core.gradingsTableHTML(bukhari());
  assert.match(html, /Sahih/);
  assert.match(html, /grader not individually cited/);
  assert.match(html, /Additional scholarly gradings not yet available/);
  assert.doesNotMatch(html, /Darussalam|al-Albani/);   // never invented
});

test('gradingsTableHTML: characterization-only (unknown value) → no table, honest note', () => {
  const html = core.gradingsTableHTML(bukhari({ grade: { value: null } }));
  assert.match(html, /not individually recorded/);
  assert.doesNotMatch(html, /<table/);
});

test('gradingsTableHTML: 2+ real gradings (future curated) → multi-row, NO gap note', () => {
  const html = core.gradingsTableHTML(bukhari({ grade: {
    value: 'sahih', label: 'Sahih', grader: 'al-Bukhari', disputed: false,
    alternateGradings: [{ value: 'sahih', label: 'Sahih', grader: 'al-Albani' }],
  }}));
  assert.match(html, /al-Bukhari/);
  assert.match(html, /al-Albani/);
  assert.doesNotMatch(html, /Additional scholarly gradings not yet available/);
});

/* ── translationBlockHTML ── */
test('translationBlockHTML: single language → NO tab strip, translation shown', () => {
  const html = core.translationBlockHTML(core.translationModel(bukhari()), 'en');
  assert.doesNotMatch(html, /class="dv-tabs"/);
  assert.match(html, /reward of deeds/);
});

test('translationBlockHTML: 2+ languages → tab strip with active tab flagged', () => {
  const m = core.translationModel(bukhari({ translations: [{ text: 'اردو', language: 'ur' }] }));
  const html = core.translationBlockHTML(m, 'ur');
  assert.match(html, /class="dv-tabs"/);
  assert.match(html, /data-lang="ur"[^>]*aria-selected="true"|aria-selected="true"[^>]*data-lang="ur"/);
});

test('translationBlockHTML: empty model → honest unavailable state', () => {
  const html = core.translationBlockHTML([], 'en');
  assert.match(html, /Translation temporarily unavailable/);
});

/* ── bodyCardHTML ── */
test('bodyCardHTML: enlarged variant class + shared grade badge + arabic', () => {
  const html = core.bodyCardHTML(bukhari());
  assert.match(html, /hadith-card--deep/);
  assert.match(html, /dv-arabic/);
  assert.match(html, /grade-badge grade-sahih/);
  assert.match(html, /grader not individually cited/);
  assert.match(html, /reward of deeds/);
});
test('bodyCardHTML: null hadith → "Hadith temporarily unavailable", never throws', () => {
  const html = core.bodyCardHTML(null);
  assert.match(html, /Hadith temporarily unavailable/);
});

/* ── isnadInlineHTML ── */
test('isnadInlineHTML: empty narrators (live) → honest unavailable, NOT a modal', () => {
  const html = core.isnadInlineHTML(bukhari());
  assert.match(html, /Chain of narration not available/);
  assert.doesNotMatch(html, /modal/);
});
test('isnadInlineHTML: narrators present → ordered chain nodes', () => {
  const html = core.isnadInlineHTML(bukhari({ isnad: { status: 'ok', narrators: [
    { fullName: 'Umar ibn al-Khattab', role: 'companion' }, { fullName: 'Alqamah', role: 'tabii' },
  ]}}));
  assert.match(html, /Umar ibn al-Khattab/);
  assert.match(html, /Alqamah/);
  assert.match(html, /<ol/);
});

/* ── topicsChipsHTML ── */
test('topicsChipsHTML: empty topics (live) → empty string (block hidden)', () => {
  assert.equal(core.topicsChipsHTML(bukhari()), '');
});
test('topicsChipsHTML: topics present → chips', () => {
  const html = core.topicsChipsHTML(bukhari({ topics: ['Intentions', 'Deeds'] }));
  assert.match(html, /Intentions/);
  assert.match(html, /Deeds/);
});

/* ── relatedPlaceholderHTML ── */
test('relatedPlaceholderHTML: renders a Related Narrations placeholder (Module 11)', () => {
  assert.match(core.relatedPlaceholderHTML(), /Related Narrations/);
});

/* ── breadcrumbHTML ── */
test('breadcrumbHTML: collection + book links + current hadith', () => {
  const html = core.breadcrumbHTML({ collection: 'sahih-bukhari', book: '1', hadith: '1' },
    { nameEnglish: 'Sahih al-Bukhari' }, bukhari());
  assert.match(html, /href="\/hadith\/sahih-bukhari"[^>]*>Sahih al-Bukhari/);
  assert.match(html, /href="\/hadith\/sahih-bukhari\/1"/);
  assert.match(html, /aria-current="page"[^>]*>Hadith 1|Hadith 1/);
});

/* ── resolveNeighbors ── */
test('resolveNeighbors: middle item → prev + next by list order (not numeric assumption)', () => {
  const list = [{ hadithNumber: 1 }, { hadithNumber: 5 }, { hadithNumber: 9 }];
  assert.deepEqual(core.resolveNeighbors(list, 5), { prev: 1, next: 9 });
});
test('resolveNeighbors: ends → null on the missing side; unknown → both null', () => {
  const list = [1, 2, 3];
  assert.deepEqual(core.resolveNeighbors(list, 1), { prev: null, next: 2 });
  assert.deepEqual(core.resolveNeighbors(list, 3), { prev: 2, next: null });
  assert.deepEqual(core.resolveNeighbors(list, 99), { prev: null, next: null });
});

/* ── prevNextNavHTML ── */
test('prevNextNavHTML: links present sides, disables missing sides', () => {
  const html = core.prevNextNavHTML({ prev: null, next: 5 }, 'sahih-bukhari', 1);
  assert.match(html, /dv-nav-disabled[^>]*>← Previous|← Previous/);
  assert.match(html, /href="\/hadith\/sahih-bukhari\/1\/5"[^>]*>Next/);
});
