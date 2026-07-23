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

/* ── characterization-only collections: never "Grade Unknown" (ADR-022/024) ── */
test('gradeParts: surfaces gradeCharacterization when present', () => {
  const p = core.gradeParts(bukhari({ grade: { value: null }, gradeCharacterization: 'Sahih / Hasan — compiler’s selection' }));
  assert.equal(p.value, 'unknown');
  assert.equal(p.characterization, 'Sahih / Hasan — compiler’s selection');
});
test('gradeBadgeHTML: unknown grade WITH characterization → shows characterization, NOT "Grade Unknown"', () => {
  const p = core.gradeParts(bukhari({ grade: { value: null }, gradeCharacterization: 'Mixed Grades' }));
  const html = core.gradeBadgeHTML(p);
  assert.match(html, /Mixed Grades/);
  assert.doesNotMatch(html, /Grade Unknown/);
});
test('gradeBadgeHTML: unknown grade WITHOUT characterization → still "Grade Unknown" (genuinely unknown)', () => {
  const p = core.gradeParts(bukhari({ grade: { value: 'unknown', label: 'Grade Unknown' } }));
  assert.match(core.gradeBadgeHTML(p), /Grade Unknown/);
});
test('buildCardHTML: characterization-only hadith card badge shows characterization, not "Grade Unknown"', () => {
  const html = core.buildCardHTML(bukhari({ grade: { value: null }, gradeCharacterization: 'Sahih / Hasan' }));
  assert.match(html, /Sahih \/ Hasan/);
  assert.doesNotMatch(html, /Grade Unknown/);
});

/* ── Module 10: per-card note action button ── */
test('buildCardHTML: renders a data-act="note" header button between bookmark and share', () => {
  const html = core.buildCardHTML(bukhari());
  assert.ok(html.indexOf('data-act="note"') !== -1, 'note button present');
  // order: bookmark then note then share
  assert.ok(html.indexOf('data-act="bookmark"') < html.indexOf('data-act="note"'));
  assert.ok(html.indexOf('data-act="note"') < html.indexOf('data-act="share"'));
});

/* ── Module 12: translation compare (US-H23) + copy-arabic action ── */
test('buildTranslations: single adapter shape → one primary edition, translator omitted when null', () => {
  const out = core.buildTranslations(bukhari());
  assert.equal(out.length, 1);
  assert.equal(out[0].primary, true);
  assert.equal('translator' in out[0], false);
});
test('buildTranslations: keeps translator when present; multi-edition marks only first primary + drops empty', () => {
  const out = core.buildTranslations({ translations: [
    { text: 'A', edition: 'darussalam', translator: 'Khan' }, { text: '', edition: 'ghost' }, { text: 'B', edition: 'usc-msa' },
  ] });
  assert.deepEqual(out.map(e => e.edition), ['darussalam', 'usc-msa']);
  assert.equal(out[0].primary, true);
  assert.equal(out[1].primary, false);
  assert.equal(out[0].translator, 'Khan');
});
test('buildTranslations: no translation data → empty array', () => {
  assert.deepEqual(core.buildTranslations({ translation: null }), []);
});
test('renderTranslations: single edition → plain .hadith-text row, no tabs (visual unchanged)', () => {
  const html = core.renderTranslations(core.buildTranslations(bukhari()));
  assert.match(html, /<div class="hadith-text">/);
  assert.doesNotMatch(html, /dv-tabs/);
});
test('renderTranslations: single edition shows the translation source label (DoD-11)', () => {
  const html = core.renderTranslations([{ text: 'X', edition: 'hadithapi.com' }]);
  assert.match(html, /class="hadith-tr-edition"/);
  assert.match(html, /hadithapi\.com/);
});
test('renderTranslations: single edition with no edition name → no source label (graceful, no fabrication)', () => {
  const html = core.renderTranslations([{ text: 'X', edition: null }]);
  assert.doesNotMatch(html, /hadith-tr-edition/);
});
test('renderTranslations: >1 edition → tablist with one panel each, only first tab on', () => {
  const html = core.renderTranslations([
    { text: 'A', edition: 'darussalam', primary: true }, { text: 'B', edition: 'usc-msa', primary: false },
  ]);
  assert.match(html, /class="dv-tabs"/);
  assert.equal((html.match(/class="dv-tab( on)?"/g) || []).length, 2);
  assert.equal((html.match(/aria-selected="true"/g) || []).length, 1);
  assert.match(html, /data-edition="darussalam"/);
  assert.match(html, /data-edition="usc-msa"/);
  assert.match(html, /hidden/); // the non-primary panel is hidden
});
test('renderTranslations: prefEdition selects the active tab when present', () => {
  const html = core.renderTranslations([
    { text: 'A', edition: 'darussalam' }, { text: 'B', edition: 'usc-msa' },
  ], 'usc-msa');
  assert.match(html, /data-edition="usc-msa" aria-selected="true"/);
});
test('renderTranslations: 0 editions → empty string', () => {
  assert.equal(core.renderTranslations([]), '');
});
test('renderTranslations: translator label only when present', () => {
  assert.doesNotMatch(core.renderTranslations([{ text: 'x', edition: 'e' }]), /Translated by/);
  assert.match(core.renderTranslations([{ text: 'x', edition: 'e', translator: 'Khan' }]), /Translated by Khan/);
});
test('buildCardHTML: exposes copy + copy-arabic actions in order', () => {
  const html = core.buildCardHTML(bukhari());
  assert.ok(html.indexOf('data-act="copy"') !== -1);
  assert.ok(html.indexOf('data-act="copy-arabic"') !== -1);
  assert.ok(html.indexOf('data-act="copy"') < html.indexOf('data-act="copy-arabic"'));
});

/* ── Module 14: card action row includes View-as-Trace ── */
test('card action row includes a View-as-Trace button (data-act="trace")', () => {
  const html = core.buildCardHTML(bukhari());
  assert.match(html, /data-act="trace"/);
  assert.match(html, /title="View as Trace"/);
});

/* ── Module 15: card action row includes Add-to-comparison ── */
test('card action row includes an Add-to-comparison button (data-act="compare-add")', () => {
  const html = core.buildCardHTML(bukhari());
  assert.match(html, /data-act="compare-add"/);
  assert.match(html, /Add to comparison/);
});
