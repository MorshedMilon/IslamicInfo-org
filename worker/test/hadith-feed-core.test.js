import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-feed-core.js';

/* Fixtures mirror the normalized hadith shape from worker/src/lib/hadith-adapter.js.
   Live hadithapi.com always yields grader:null, disputed:false (see
   hadith-module-decisions memory). Disputed/graded fixtures are synthetic —
   they exercise the dead-code branch a future curated store would feed. */
function bukhari(over = {}) {
  return Object.assign({
    collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari',
    bookNumber: 1, bookName: 'Revelation', hadithNumber: 1,
    reference: 'Sahih al-Bukhari · Book 1 · Hadith 1',
    arabicMatn: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    translation: { text: 'The reward of deeds depends upon the intentions.', edition: 'hadithapi.com', translator: null },
    narrator: { id: null, name: "Narrated 'Umar ibn al-Khattab:", arabicName: null },
    grade: { value: 'sahih', label: 'Sahih', grader: null, disputed: false, alternateGradings: [] },
    isnad: { status: 'unavailable', narrators: [] },
  }, over);
}
const grade = (g) => ({ grade: Object.assign({ grader: null, disputed: false, alternateGradings: [] }, g) });

/* ── gradeParts ─────────────────────────────────────────────── */

test('gradeParts: known grade with null grader → "grader not individually cited" (Decision 1)', () => {
  const p = core.gradeParts(bukhari());
  assert.equal(p.value, 'sahih');
  assert.equal(p.className, 'grade-sahih');
  assert.equal(p.label, 'Sahih');
  assert.equal(p.badgeGraderText, ' · grader not individually cited');
});

test('gradeParts: known grade with a real grader → uses the named grader, never the fallback', () => {
  const p = core.gradeParts(bukhari(grade({ value: 'hasan', label: 'Hasan', grader: 'al-Albani' })));
  assert.equal(p.grader, 'al-Albani');
  assert.equal(p.badgeGraderText, ' · al-Albani');
  assert.ok(!/not individually cited/.test(p.badgeGraderText));
});

test('gradeParts: missing/unknown grade → Grade Unknown, grey class, NO grader phrase', () => {
  const p = core.gradeParts(bukhari(grade({ value: 'unknown', label: 'Grade Unknown' })));
  assert.equal(p.className, 'grade-unknown');
  assert.equal(p.label, 'Grade Unknown');
  assert.equal(p.badgeGraderText, '');
});

test('gradeParts: null hadith / null grade object → unknown fallback, never throws', () => {
  assert.equal(core.gradeParts(null).value, 'unknown');
  assert.equal(core.gradeParts({}).value, 'unknown');
  assert.equal(core.gradeParts({ grade: null }).label, 'Grade Unknown');
});

test('gradeParts: unrecognised status string → unknown (no fabricated label)', () => {
  const p = core.gradeParts(bukhari(grade({ value: 'totally-made-up', label: 'x' })));
  assert.equal(p.value, 'unknown');
  assert.equal(p.className, 'grade-unknown');
});

test('gradeParts: disputed flag surfaces both gradings (dead-code branch, Decision 2)', () => {
  const p = core.gradeParts(bukhari(grade({
    value: 'sahih', label: 'Sahih', grader: 'Imam al-Bukhari', disputed: true,
    alternateGradings: [{ value: 'daif', label: "Da'if", grader: 'al-Albani' }],
  })));
  assert.equal(p.disputed, true);
  assert.equal(p.alternates.length, 1);
});

/* ── refOf ──────────────────────────────────────────────────── */

test('refOf: builds a stable collectionSlug:bookNumber:hadithNumber ref', () => {
  assert.equal(core.refOf(bukhari()), 'sahih-bukhari:1:1');
  assert.equal(core.refOf(bukhari({ bookNumber: 4, hadithNumber: 273 })), 'sahih-bukhari:4:273');
});

test('refOf: any missing part → null (never a partial/fabricated ref)', () => {
  assert.equal(core.refOf(bukhari({ hadithNumber: null })), null);
  assert.equal(core.refOf(bukhari({ collectionSlug: null })), null);
  assert.equal(core.refOf(null), null);
});

test('refOf: book-less collection (Musnad Ahmad — no fixed book, TechSpec §10) → stable 0-book ref', () => {
  assert.equal(core.refOf(bukhari({ collectionSlug: 'musnad-ahmad', bookNumber: null, hadithNumber: 42 })), 'musnad-ahmad:0:42');
});

/* ── matchesGrade ───────────────────────────────────────────── */

test('matchesGrade: All Grades matches everything; specific pill matches its value', () => {
  const sahih = bukhari();
  const daif = bukhari(grade({ value: 'daif', label: "Da'if" }));
  assert.ok(core.matchesGrade(sahih, 'all'));
  assert.ok(core.matchesGrade(sahih, null));
  assert.ok(core.matchesGrade(sahih, 'sahih'));
  assert.ok(!core.matchesGrade(sahih, 'hasan'));
  assert.ok(core.matchesGrade(daif, 'daif'));
  assert.ok(!core.matchesGrade(daif, 'sahih'));
});

test('matchesGrade: unknown-grade card only matches All (its badge is still rendered)', () => {
  const unk = bukhari(grade({ value: 'unknown', label: 'Grade Unknown' }));
  assert.ok(core.matchesGrade(unk, 'all'));
  assert.ok(!core.matchesGrade(unk, 'sahih'));
});

/* ── dedupeByRef ────────────────────────────────────────────── */

test('dedupeByRef: drops records whose ref is already loaded (no duplicate cards on Load more)', () => {
  const existing = ['sahih-bukhari:1:1'];
  const batch = [bukhari({ hadithNumber: 1 }), bukhari({ hadithNumber: 2 })];
  const fresh = core.dedupeByRef(existing, batch);
  assert.equal(fresh.length, 1);
  assert.equal(core.refOf(fresh[0]), 'sahih-bukhari:1:2');
});

test('dedupeByRef: de-duplicates within the incoming batch too', () => {
  const fresh = core.dedupeByRef([], [bukhari({ hadithNumber: 5 }), bukhari({ hadithNumber: 5 }), bukhari({ hadithNumber: 6 })]);
  assert.deepEqual(fresh.map(core.refOf), ['sahih-bukhari:1:5', 'sahih-bukhari:1:6']);
});

test('dedupeByRef: drops null-ref (unrenderable) records; accepts a Set for existing', () => {
  const fresh = core.dedupeByRef(new Set(['sahih-bukhari:1:1']), [bukhari({ hadithNumber: null }), bukhari({ hadithNumber: 2 })]);
  assert.equal(fresh.length, 1);
  assert.equal(core.refOf(fresh[0]), 'sahih-bukhari:1:2');
});

/* ── buildCardHTML ──────────────────────────────────────────── */

test('buildCardHTML: renders locked card anatomy with a stable data-ref', () => {
  const html = core.buildCardHTML(bukhari());
  assert.ok(html.includes('class="hadith-card"'));
  assert.ok(html.includes('data-ref="sahih-bukhari:1:1"'));
  assert.ok(html.includes('hadith-teal-bar'));
  assert.ok(html.includes('Hadith #1'));
  assert.ok(html.includes('Sahih al-Bukhari · Book 1 · Hadith 1'));
});

test('buildCardHTML: grade badge uses the exact locked class + grader fallback', () => {
  const html = core.buildCardHTML(bukhari());
  assert.ok(html.includes('grade-badge grade-sahih'));
  assert.ok(html.includes('Sahih'));
  assert.ok(html.includes(' · grader not individually cited'));
});

test('buildCardHTML: Grade Unknown card shows grey badge and NO grader phrase', () => {
  const html = core.buildCardHTML(bukhari(grade({ value: 'unknown', label: 'Grade Unknown' })));
  assert.ok(html.includes('grade-badge grade-unknown'));
  assert.ok(html.includes('Grade Unknown'));
  assert.ok(!html.includes('grader not individually cited'));
});

test("buildCardHTML: Da'if card renders the amber badge + grader fallback, and adds NO extra warning copy (Decision 3)", () => {
  const html = core.buildCardHTML(bukhari(grade({ value: 'daif', label: "Da'if" })));
  assert.ok(html.includes('grade-badge grade-daif'));
  assert.ok(html.includes("Da&#39;if") || html.includes("Da'if"));
  assert.ok(html.includes(' · grader not individually cited'));
  assert.ok(!/DISPUTED/i.test(html));
});

test('buildCardHTML: disputed card shows [GRADE DISPUTED] + both graders + both labels (dead-code, Decision 2)', () => {
  const html = core.buildCardHTML(bukhari(grade({
    value: 'sahih', label: 'Sahih', grader: 'Imam al-Bukhari', disputed: true,
    alternateGradings: [{ value: 'daif', label: "Da'if", grader: 'al-Albani' }],
  })));
  assert.ok(html.includes('[GRADE DISPUTED]'));
  assert.ok(html.includes('Imam al-Bukhari'));
  assert.ok(html.includes('al-Albani'));
  assert.ok(html.includes('Sahih'));
  assert.ok(/Da&#39;if|Da'if/.test(html));
});

test('buildCardHTML: Arabic matn keeps RTL direction', () => {
  const html = core.buildCardHTML(bukhari());
  assert.ok(/<div class="hadith-arabic"[^>]*dir="rtl"/.test(html));
  assert.ok(html.includes('إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ'));
});

test('buildCardHTML: sanitizes remote text — no raw HTML injected (XSS)', () => {
  const html = core.buildCardHTML(bukhari({
    arabicMatn: '<img src=x onerror=alert(1)>',
    translation: { text: '<script>alert(1)</script>', edition: 'hadithapi.com', translator: null },
    narrator: { name: '<b>evil</b>', arabicName: null },
  }));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!html.includes('<img src=x onerror'));
  assert.ok(!html.includes('<b>evil</b>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('buildCardHTML: narrator line only appears when the source supplies one (never fabricated)', () => {
  const withNarr = core.buildCardHTML(bukhari());
  assert.ok(withNarr.includes('hadith-narrator'));
  const noNarr = core.buildCardHTML(bukhari({ narrator: { name: null, arabicName: null } }));
  assert.ok(!noNarr.includes('hadith-narrator'));
});

test('buildCardHTML: footer wires isnad/listen/full via data-act; isnad is a toggle, listen honestly disabled', () => {
  const html = core.buildCardHTML(bukhari());
  assert.ok(html.includes('data-act="isnad"'));
  assert.ok(html.includes('data-act="listen"'));
  assert.ok(html.includes('data-act="full"'));
  assert.ok(/data-act="isnad"[^>]*aria-expanded="false"/.test(html));   // US-H05 toggle, not disabled
  assert.ok(/data-act="listen"[^>]*aria-disabled="true"/.test(html));    // audio still honestly unavailable
});

test('buildCardHTML: unrenderable record (null ref) yields empty string, never a broken card', () => {
  assert.equal(core.buildCardHTML(bukhari({ hadithNumber: null })), '');
});

test('buildCardHTML: book-less hadith (Musnad Ahmad) renders flat — card present, no "Book" label, keeps Hadith #N', () => {
  const html = core.buildCardHTML(bukhari({
    collectionSlug: 'musnad-ahmad', collectionName: 'Musnad Ahmad',
    bookNumber: null, bookName: null, hadithNumber: 42, reference: null,
  }));
  assert.ok(html.includes('class="hadith-card"'));
  assert.ok(html.includes('data-ref="musnad-ahmad:0:42"'));
  assert.ok(html.includes('Hadith #42'));
  assert.ok(!/·\s*Book\s/.test(html));   // flat feed: no "· Book N" segment
});

test('buildCardHTML: card carries data-grade so the DOM grade filter can match it', () => {
  assert.ok(core.buildCardHTML(bukhari()).includes('data-grade="sahih"'));
  assert.ok(core.buildCardHTML(bukhari(grade({ value: 'daif', label: "Da'if" }))).includes('data-grade="daif"'));
  assert.ok(core.buildCardHTML(bukhari(grade({ value: 'unknown', label: 'Grade Unknown' }))).includes('data-grade="unknown"'));
});

/* ── gradeBadgeHTML export (Module 7: deep-view reuses it) ── */
test('gradeBadgeHTML is exported and renders the null-grader fallback (shared source of truth)', () => {
  assert.equal(typeof core.gradeBadgeHTML, 'function');
  const html = core.gradeBadgeHTML(core.gradeParts(bukhari()));
  assert.match(html, /grade-badge grade-sahih/);
  assert.match(html, /grader not individually cited/);
});
