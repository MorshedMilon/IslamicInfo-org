# Hadith Module 1 — Stage 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire the locked `hadith.html` Stage-1 regions (sidebar, collections grid, stats strip, Hadith of the Day, filters, Browse routing, Continue-Reading, mobile bottom-sheet) to Module 0's live data — data-driven, no visual redesign.

**Architecture:** One `fetchHadithCollections()` call feeds sidebar + grid; each record is merged with a curated static presentation-meta map. Pure data logic lives in a UMD `-core.js` (unit-tested via the worker suite); DOM rendering lives in a rewritten `src/js/hadith.js`. Only minimal markup/CSS is added to the locked page.

**Tech Stack:** vanilla ES2022 (UMD/IIFE like `api.js`), `window.II.api`/`window.II.ui` from Module 0, `node:test` for core tests. Branch `feat/hadith-module-1-foundation` (stacked on Module 0).

---

## Conventions
- Core tests run from the worker suite: `cd worker && npm test` (ESM importing the UMD default, like `grounding.test.js` imports `src/js/*-core.js`).
- Never fabricate: API supplies authoritative counts/English-name/compiler; curated meta supplies Arabic name / lifespan / motif / category / collection-authenticity; gaps → honest fallback (`—` / omit), never invented.
- All dynamic text inserted into the DOM goes through `window.II.ui.escapeHTML`.
- `collections-meta.json` is curated reference data → **flag for human ð review** in the final report.

---

## Task 1: Curated collection presentation-metadata

**Files:**
- Create: `src/data/hadith/collections-meta.json`

- [ ] **Step 1: Create the file** with EXACTLY this content. (Reference data sourced from PRD §2.3 + well-established facts; **pending ð human review**. Keyed by hadithapi slug. Authenticity label/tone and Arabic names/lifespans/motifs are presentation metadata — the live API still governs counts + English name + compiler.)

```json
{
  "_note": "Curated presentation metadata for Hadith collections. Reference data pending human review (CONTENT-POLICY §5). The live /api/hadith/collections governs counts, English name, and compiler; this map only fills Arabic name, lifespan, motif, filter category, and collection-level authenticity label — fields the API does not provide.",
  "sahih-bukhari":     { "arabicName": "صحيح البخاري", "lifespan": "810–870 CE", "motif": "📖", "category": "sittah",   "featured": true,  "authLabel": "Sahih — Highest Standard", "authTone": "sahih", "compiledPeriod": "16 yrs" },
  "sahih-muslim":      { "arabicName": "صحيح مسلم",    "lifespan": "815–875 CE", "motif": "📬", "category": "sittah",   "featured": false, "authLabel": "Sahih",                    "authTone": "sahih" },
  "abu-dawood":        { "arabicName": "سنن أبي داود",  "lifespan": "817–889 CE", "motif": "⚖️", "category": "sittah",   "featured": false, "authLabel": "Mixed Grades",             "authTone": "hasan" },
  "al-tirmidhi":       { "arabicName": "جامع الترمذي",  "lifespan": "824–892 CE", "motif": "🌙", "category": "sittah",   "featured": false, "authLabel": "Mixed Grades",             "authTone": "hasan" },
  "sunan-nasai":       { "arabicName": "سنن النسائي",   "lifespan": "829–915 CE", "motif": "🕌", "category": "sittah",   "featured": false, "authLabel": "Mixed Grades",             "authTone": "hasan" },
  "ibn-e-majah":       { "arabicName": "سنن ابن ماجه",  "lifespan": "824–887 CE", "motif": "📜", "category": "sittah",   "featured": false, "authLabel": "Mixed Grades",             "authTone": "hasan" },
  "musnad-ahmad":      { "arabicName": "مسند أحمد",     "lifespan": "780–855 CE", "motif": "📚", "category": "musnad",   "featured": false, "authLabel": "Mixed Grades",             "authTone": "hasan" },
  "mishkat":           { "arabicName": "مشكاة المصابيح","lifespan": "d. ~741 AH", "motif": "🔦", "category": "selected", "featured": false, "authLabel": "Mixed Grades",             "authTone": "hasan" },
  "al-silsila-sahiha": { "arabicName": "السلسلة الصحيحة","lifespan": "1914–1999 CE","motif": "✨", "category": "selected", "featured": false, "authLabel": "Sahih",                    "authTone": "sahih" }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/hadith/collections-meta.json
git commit -m "feat(hadith): curated collection presentation-metadata (pending human review)"
```

---

## Task 2: Pure core logic + unit tests

**Files:**
- Create: `src/js/hadith-collections-core.js`
- Test: `worker/test/hadith-collections-core.test.js`

- [ ] **Step 1: Write the failing test** — create `worker/test/hadith-collections-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-collections-core.js';

const META = {
  'sahih-bukhari': { arabicName: 'صحيح البخاري', lifespan: '810–870 CE', motif: '📖', category: 'sittah', featured: true, authLabel: 'Sahih — Highest Standard', authTone: 'sahih' },
  'musnad-ahmad':  { arabicName: 'مسند أحمد', lifespan: '780–855 CE', motif: '📚', category: 'musnad', featured: false, authLabel: 'Mixed Grades', authTone: 'hasan' },
  'mishkat':       { arabicName: 'مشكاة المصابيح', lifespan: 'd. ~741 AH', motif: '🔦', category: 'selected', featured: false, authLabel: 'Mixed Grades', authTone: 'hasan' },
};
const api = { collectionSlug: 'sahih-bukhari', collectionName: 'Sahih Bukhari', compiler: 'Imam Bukhari', hadithCount: 7276, chaptersCount: 99 };

test('mergeCollection: API wins for authoritative fields, meta fills presentation', () => {
  const c = core.mergeCollection(api, META);
  assert.equal(c.slug, 'sahih-bukhari');
  assert.equal(c.nameEnglish, 'Sahih Bukhari');   // API authoritative
  assert.equal(c.compiler, 'Imam Bukhari');        // API authoritative
  assert.equal(c.hadithCount, 7276);
  assert.equal(c.nameArabic, 'صحيح البخاري');       // meta
  assert.equal(c.lifespan, '810–870 CE');          // meta
  assert.equal(c.motif, '📖');
  assert.equal(c.category, 'sittah');
  assert.equal(c.featured, true);
  assert.equal(c.authLabel, 'Sahih — Highest Standard');
  assert.equal(c.authTone, 'sahih');
});

test('mergeCollection: missing meta → null presentation fields, no fabrication', () => {
  const c = core.mergeCollection({ collectionSlug: 'unknown-x', collectionName: 'X', hadithCount: null }, META);
  assert.equal(c.nameArabic, null);
  assert.equal(c.lifespan, null);
  assert.equal(c.motif, null);
  assert.equal(c.category, 'other');
  assert.equal(c.featured, false);
  assert.equal(c.authLabel, null);
  assert.equal(c.hadithCount, null);
});

test('inCategory: tab membership', () => {
  const bukhari = core.mergeCollection(api, META);
  const ahmad = core.mergeCollection({ collectionSlug: 'musnad-ahmad', collectionName: 'Musnad Ahmad' }, META);
  const mishkat = core.mergeCollection({ collectionSlug: 'mishkat', collectionName: 'Mishkat' }, META);
  assert.ok(core.inCategory(bukhari, 'all'));
  assert.ok(core.inCategory(bukhari, 'sittah'));
  assert.ok(!core.inCategory(bukhari, 'musnad'));
  assert.ok(core.inCategory(ahmad, 'musnad'));
  assert.ok(core.inCategory(mishkat, 'selected'));
  assert.ok(core.inCategory(mishkat, 'all'));
});

test('aggregateStats: sums confirmable counts, flags partial on null', () => {
  const list = [
    core.mergeCollection({ collectionSlug: 'sahih-bukhari', collectionName: 'B', hadithCount: 7276 }, META),
    core.mergeCollection({ collectionSlug: 'musnad-ahmad', collectionName: 'A', hadithCount: 26000 }, META),
  ];
  const s = core.aggregateStats(list);
  assert.equal(s.collectionCount, 2);
  assert.equal(s.totalHadiths, 33276);
  assert.equal(s.partial, false);
  assert.equal(s.verifiedPct, 100);

  const withNull = list.concat(core.mergeCollection({ collectionSlug: 'mishkat', collectionName: 'M', hadithCount: null }, META));
  const s2 = core.aggregateStats(withNull);
  assert.equal(s2.collectionCount, 3);
  assert.equal(s2.totalHadiths, 33276); // null skipped
  assert.equal(s2.partial, true);
});

test('formatCountK: locked N,K+ shape and honest fallback', () => {
  assert.deepEqual(core.formatCountK(60123), { lead: '60,', suffix: 'K+' });
  assert.deepEqual(core.formatCountK(7276), { lead: '7,', suffix: 'K+' });
  assert.deepEqual(core.formatCountK(null), { lead: '—', suffix: '' });
  assert.deepEqual(core.formatCountK(0), { lead: '—', suffix: '' });
});

test('formatInt: thousands separators or fallback', () => {
  assert.equal(core.formatInt(7276), '7,276');
  assert.equal(core.formatInt(null), 'Unavailable');
});

test('hotdFields: grade always present, missing → Grade Unknown', () => {
  const good = core.hotdFields({ collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari', bookNumber: 1,
    hadithNumber: 1, arabicMatn: 'إنما الأعمال', translation: { text: 'Actions by intentions' },
    narrator: { name: 'Umar' }, grade: { value: 'sahih', label: 'Sahih', grader: 'Imam al-Bukhari' } });
  assert.equal(good.gradeValue, 'sahih');
  assert.equal(good.gradeLabel, 'Sahih');
  assert.equal(good.grader, 'Imam al-Bukhari');
  assert.equal(good.narrator, 'Umar');
  assert.match(good.reference, /Sahih al-Bukhari/);

  const noGrade = core.hotdFields({ collectionSlug: 'x', collectionName: 'X', hadithNumber: 5,
    arabicMatn: 'a', translation: { text: 'b' }, narrator: { name: null }, grade: null });
  assert.equal(noGrade.gradeValue, 'unknown');
  assert.equal(noGrade.gradeLabel, 'Grade Unknown');
  assert.equal(noGrade.grader, null);
  assert.equal(noGrade.narrator, null);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd worker && node --test test/hadith-collections-core.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** `src/js/hadith-collections-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-collections-core.js
   Pure, framework-free logic for the Hadith Library Stage-1 UI.
   UMD (window.II.hadithCollections in the browser; module.exports in tests),
   mirroring api.js. NO DOM, NO network — all inputs passed in.
   Rule: the live API governs authoritative fields; the curated meta map only
   fills presentation gaps; missing data → null / honest fallback (never faked).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var CATEGORIES = {
    sittah:   ['sahih-bukhari', 'sahih-muslim', 'abu-dawood', 'al-tirmidhi', 'sunan-nasai', 'ibn-e-majah'],
    musnad:   ['musnad-ahmad'],
    selected: ['mishkat', 'al-silsila-sahiha'],
  };

  function mergeCollection(api, meta) {
    api = api || {};
    var slug = api.collectionSlug || null;
    var m = (meta && slug && meta[slug]) || {};
    var hc = (typeof api.hadithCount === 'number') ? api.hadithCount : null;
    var cc = (typeof api.chaptersCount === 'number') ? api.chaptersCount : null;
    return {
      slug: slug,
      nameEnglish: api.collectionName || m.nameEnglish || slug || 'Unknown',
      nameArabic: m.arabicName || null,
      compiler: api.compiler || m.compiler || null,
      lifespan: m.lifespan || null,
      motif: m.motif || null,
      hadithCount: hc,
      chaptersCount: cc,
      compiledPeriod: m.compiledPeriod || null,
      category: m.category || 'other',
      featured: m.featured === true,
      authLabel: m.authLabel || null,
      authTone: m.authTone || 'sahih',
    };
  }

  function inCategory(c, tab) {
    if (!c) return false;
    if (tab === 'all' || !tab) return true;
    return c.category === tab;
  }

  function aggregateStats(list) {
    list = Array.isArray(list) ? list : [];
    var total = 0, partial = false;
    for (var i = 0; i < list.length; i++) {
      var n = list[i] && list[i].hadithCount;
      if (typeof n === 'number' && n > 0) total += n; else partial = true;
    }
    return { collectionCount: list.length, totalHadiths: total, partial: partial, verifiedPct: 100 };
  }

  function formatCountK(n) {
    if (typeof n !== 'number' || !(n > 0)) return { lead: '—', suffix: '' };
    var k = Math.floor(n / 1000);
    return { lead: k + ',', suffix: 'K+' };
  }

  function formatInt(n) {
    if (typeof n !== 'number' || !(n >= 0)) return 'Unavailable';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function hotdFields(d) {
    d = d || {};
    var grade = d.grade || {};
    var hasGrade = grade.value && grade.value !== 'unknown';
    var ref = [d.collectionName || d.collectionSlug,
               d.bookNumber != null ? ('Book ' + d.bookNumber) : null,
               d.hadithNumber != null ? ('Hadith ' + d.hadithNumber) : null]
              .filter(Boolean).join(' · ');
    return {
      arabic: d.arabicMatn || '',
      translation: (d.translation && d.translation.text) || '',
      reference: ref,
      narrator: (d.narrator && d.narrator.name) || null,
      gradeValue: hasGrade ? grade.value : 'unknown',
      gradeLabel: hasGrade ? (grade.label || grade.value) : 'Grade Unknown',
      grader: (hasGrade && grade.grader) ? grade.grader : null,
    };
  }

  var core = {
    CATEGORIES: CATEGORIES,
    mergeCollection: mergeCollection,
    inCategory: inCategory,
    aggregateStats: aggregateStats,
    formatCountK: formatCountK,
    formatInt: formatInt,
    hotdFields: hotdFields,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithCollections = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd worker && node --test test/hadith-collections-core.test.js`
Expected: PASS (8 tests). Then `cd worker && npm test` — full suite green.

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-collections-core.js worker/test/hadith-collections-core.test.js
git commit -m "feat(hadith): Stage-1 collections core logic (merge/category/stats/hotd) + tests"
```

---

## Task 3: Minimal markup + CSS in hadith.html

**Files:**
- Modify: `hadith.html`

FIRST read `hadith.html` around: the stats-strip (~line 942), collections-grid `id="collections"` (~977), the sidebar collection rows (~845–866), the filter-tabs (~968–973), the hero scope-chips (~), the daily-strip (~), and the classical-scholars sidebar section, plus the `<style>` grade-badge block.

- [ ] **Step 1: Sidebar — wrap the 9 hardcoded collection rows in a JS target container.** The rows are the `<a class="sidebar-item" href="#hadith-feed">…</a>` collection entries (Bukhari … 40 Nawawi) that follow the `All Collections` item. Wrap ONLY those collection rows (not "All Collections", not the divider) in:

```html
<div id="ii-sidebar-collections">
  <!-- existing hardcoded .sidebar-item collection rows stay here as no-JS fallback; JS replaces innerHTML -->
</div>
```

- [ ] **Step 2: Collections grid — already has `id="collections"`.** No change needed (JS targets `#collections`).

- [ ] **Step 3: Stats strip — add id hooks.** In the `.stats-strip`, give the first stat-num (Total Hadiths) `id="ii-stat-total"` and the second (Major Collections) `id="ii-stat-collections"`. Add an accessible qualifier to the verified stat: on the 4th `.stat-item`, add `title="Every collection shown is a source-verified record from the live library"` and `aria-label="100% Source-Verified — every collection shown is a source-verified record"`. Do not change the visible numbers/labels themselves (JS updates them).

- [ ] **Step 4: Filter tabs — add an aria-live status region.** Immediately after the `.filter-tabs` container, add:

```html
<span id="ii-filter-status" class="sr-only" role="status" aria-live="polite"></span>
```
And add the `.sr-only` utility to the `<style>` block if not already present:

```css
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
```

- [ ] **Step 5: Hero — add the Continue-Reading slot.** Immediately AFTER the hero `.scope-chips` container (before it closes the hero wrapper), add (hidden by default; JS reveals):

```html
<a id="ii-continue-reading" class="hijri-pill" href="#" style="display:none;margin-top:8px;text-transform:none;letter-spacing:0;font-weight:500;"></a>
```

- [ ] **Step 6: Daily strip — add id hooks.** On the `.daily-strip`, give `.daily-strip-arabic` `id="ii-hotd-arabic"`, `.daily-strip-text` `id="ii-hotd-text"`, `.daily-strip-ref` `id="ii-hotd-ref"`. On the "View Full Isnad" button add `id="ii-hotd-isnad-btn"`. (JS fills text and manages the disabled-isnad state.)

- [ ] **Step 7: Classical scholars — make them non-clickable info rows.** Change the four classical-scholar `<a class="sidebar-item" href="#">…</a>` rows to `<div class="sidebar-item" style="cursor:default;" aria-disabled="true">…</div>` (no href → no fake destination). Keep their text/count exactly.

- [ ] **Step 8: Dark-mode grade-badge overrides (TechSpec §2.6).** Add to the `<style>` block (after the existing `.grade-badge` rules):

```css
[data-theme="dark"] .grade-badge.grade-sahih { color:#1FA882; background:rgba(31,168,130,.12); border-color:rgba(31,168,130,.3); }
[data-theme="dark"] .grade-badge.grade-hasan { color:#7AB84E; background:rgba(122,184,78,.12); border-color:rgba(122,184,78,.3); }
[data-theme="dark"] .grade-badge.grade-daif  { color:#D4884A; background:rgba(212,136,74,.12); border-color:rgba(212,136,74,.3); }
[data-theme="dark"] .grade-badge.grade-mawdu { color:#E05555; background:rgba(224,85,85,.12); border-color:rgba(224,85,85,.3); }
```

- [ ] **Step 9: Mobile bottom-sheet — trigger + sheet skeleton.** Just before `</body>` (near the other floating scripts), add:

```html
<button id="ii-sheet-trigger" aria-label="Open collections" aria-haspopup="dialog" aria-expanded="false"
  style="display:none;position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:250;gap:8px;
         align-items:center;padding:11px 20px;border:none;border-radius:24px;cursor:pointer;
         background:linear-gradient(135deg,var(--teal-700),var(--teal-500));color:#fff;font-family:var(--font-body);
         font-size:13px;font-weight:600;box-shadow:0 6px 20px rgba(0,105,110,.35);">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  <span>Collections</span>
</button>
<div id="ii-sheet-backdrop" role="dialog" aria-modal="true" aria-label="Hadith collections"
  style="display:none;position:fixed;inset:0;z-index:260;background:rgba(6,38,40,.5);backdrop-filter:blur(6px);">
  <div id="ii-sheet-panel"
    style="position:absolute;left:0;right:0;bottom:0;max-height:75vh;overflow-y:auto;background:var(--surface-base);
           border-radius:20px 20px 0 0;padding:16px 18px 28px;box-shadow:0 -12px 40px rgba(0,0,0,.25);">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <div class="sidebar-section-label" style="margin:0;padding:0;">Hadith Collections</div>
      <button id="ii-sheet-close" aria-label="Close" class="hadith-action-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div id="ii-sheet-list"></div>
  </div>
</div>
@media (max-width:760px){ /* CSS: reveal trigger */ }
```
Then add to the `<style>` block:
```css
@media (max-width:760px){ #ii-sheet-trigger{ display:inline-flex !important; } }
```
(Remove the stray `@media` comment line from the HTML block above — it was only a placement note.)

- [ ] **Step 10: Commit**

```bash
git add hadith.html
git commit -m "feat(hadith): Stage-1 markup hooks (sidebar/stats/hotd ids, aria-live, continue-reading, dark grade badges, bottom-sheet)"
```

---

## Task 4: Rewrite `src/js/hadith.js` (data wiring + rendering)

**Files:**
- Modify (full rewrite): `src/js/hadith.js`

The current file targets non-existent IDs (`#hadithOfDay`, `#collectionSelect`). Replace its entire contents with the module below. It uses `window.II.api` (Module 0), `window.II.ui`, and `window.II.hadithCollections` (core), and targets the real hadith.html classes/IDs.

- [ ] **Step 1: Replace the whole file** `src/js/hadith.js` with EXACTLY:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith.js  (Module 1 · Stage-1 foundation)
   Wires hadith.html sidebar, collections grid, stats strip, Hadith of the
   Day, filter tabs, Browse routing, Continue-Reading, and the mobile
   bottom-sheet to live Module 0 data. No visual redesign.
   Requires (loaded before this): api.js (window.II.api), ui-utils.js
   (window.II.ui), hadith-collections-core.js (window.II.hadithCollections).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var II = window.II || {};
  var api = II.api, ui = II.ui, core = II.hadithCollections;
  if (!api || !ui || !core) { console.error('[hadith.js] missing II.api/ui/hadithCollections'); return; }

  var META_URL = 'src/data/hadith/collections-meta.json';
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var esc = ui.escapeHTML;

  var state = { collections: [], activeTab: 'all', meta: {} };

  /* ── Templates (reproduce locked .collection-card / .sidebar-item anatomy) ── */
  function toneStyle(tone) { return tone === 'hasan' ? ' style="color:var(--grade-hasan);"' : ''; }
  function dotStyle(tone) { return tone === 'hasan' ? ' style="background:var(--grade-hasan);"' : ''; }

  function cardHTML(c) {
    var hadiths = core.formatInt(c.hadithCount);
    var books = core.formatInt(c.chaptersCount);
    var compiler = [c.compiler, c.lifespan].filter(Boolean).map(esc).join(' · ');
    var seal = c.featured ? '<div class="featured-seal">✦ Most Authentic</div>' : '';
    var third = c.compiledPeriod ? ('<div class="card-stat"><div class="card-stat-num">' + esc(c.compiledPeriod) + '</div><div class="card-stat-label">Compiled</div></div>') : '';
    var arabic = c.nameArabic ? ('<div class="card-arabic">' + esc(c.nameArabic) + '</div>') : '';
    var motif = c.motif ? ('<div class="card-motif">' + esc(c.motif) + '</div>') : '';
    return '' +
      '<div class="collection-card' + (c.featured ? ' featured' : '') + '" data-slug="' + esc(c.slug) + '" data-cat="' + esc(c.category) + '">' +
        seal + motif +
        '<div class="card-name">' + esc(c.nameEnglish) + '</div>' +
        arabic +
        (compiler ? '<div class="card-compiler">' + compiler + '</div>' : '') +
        '<div class="card-divider"></div>' +
        '<div class="card-stats">' +
          '<div class="card-stat"><div class="card-stat-num">' + esc(hadiths) + '</div><div class="card-stat-label">Hadiths</div></div>' +
          '<div class="card-stat"><div class="card-stat-num">' + esc(books) + '</div><div class="card-stat-label">Books</div></div>' +
          third +
        '</div>' +
        '<div class="card-footer">' +
          '<div class="authenticity-badge"' + toneStyle(c.authTone) + '><div class="authenticity-dot"' + dotStyle(c.authTone) + '></div><span>' + esc(c.authLabel || 'Grade Unavailable') + '</span></div>' +
          '<a class="browse-btn" href="?collection=' + encodeURIComponent(c.slug) + '" data-browse="' + esc(c.slug) + '">Browse →</a>' +
        '</div>' +
      '</div>';
  }

  function sidebarRowHTML(c) {
    var count = c.hadithCount != null ? core.formatInt(c.hadithCount) : '';
    var badge = count ? ' <span class="count-badge">' + esc(count) + '</span>' : '';
    return '<a class="sidebar-item" href="?collection=' + encodeURIComponent(c.slug) + '" data-browse="' + esc(c.slug) + '">' + esc(c.nameEnglish) + badge + '</a>';
  }

  function gridSkeleton(n) {
    var out = '';
    for (var i = 0; i < (n || 6); i++) {
      out += '<div class="collection-card" aria-hidden="true" style="opacity:.5;">' +
        '<div style="height:24px;width:40%;background:rgba(0,105,110,.1);border-radius:6px;margin-bottom:14px;"></div>' +
        '<div style="height:60px;background:rgba(0,105,110,.06);border-radius:10px;"></div></div>';
    }
    return out;
  }

  /* ── Renders ── */
  function renderGrid(list) {
    var grid = $('#collections'); if (!grid) return;
    if (!list.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--ink-muted);padding:32px;">No collections available.</div>'; return; }
    grid.innerHTML = list.map(cardHTML).join('');
  }

  function renderSidebar(list) {
    var box = $('#ii-sidebar-collections'); if (!box) return;
    box.innerHTML = list.map(sidebarRowHTML).join('');
  }

  function renderStats(list) {
    var s = core.aggregateStats(list);
    var total = $('#ii-stat-total');
    if (total) { var f = core.formatCountK(s.totalHadiths); total.innerHTML = esc(f.lead) + (f.suffix ? '<span>' + f.suffix + '</span>' : ''); }
    var colls = $('#ii-stat-collections');
    if (colls) colls.textContent = String(s.collectionCount);
  }

  function announce(list) {
    var el = $('#ii-filter-status'); if (el) el.textContent = 'Showing ' + list.length + ' collection' + (list.length === 1 ? '' : 's');
  }

  function applyFilter() {
    var visible = state.collections.filter(function (c) { return core.inCategory(c, state.activeTab); });
    renderGrid(visible); announce(visible);
    // re-mark active route after re-render
    reflectActiveRoute();
  }

  /* ── Filter tabs (in-place, no route change) ── */
  function wireFilterTabs() {
    var tabs = document.querySelectorAll('.filter-tab');
    var MAP = ['all', 'sittah', 'musnad', 'selected']; // order matches All · Kutub al-Sittah · Musnad · Selected
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
        tab.classList.add('active'); tab.setAttribute('aria-pressed', 'true');
        state.activeTab = MAP[i] || 'all';
        applyFilter();
      });
      tab.setAttribute('aria-pressed', tab.classList.contains('active') ? 'true' : 'false');
    });
  }

  /* ── Browse / route (?collection=slug + loading shell; no faked Tier 2) ── */
  function currentSlug() { try { return new URLSearchParams(location.search).get('collection'); } catch (_) { return null; } }

  function reflectActiveRoute() {
    var slug = currentSlug();
    document.querySelectorAll('.sidebar-item[data-browse]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-browse') === slug);
    });
  }

  function showLoadingShell(slug) {
    var c = state.collections.filter(function (x) { return x.slug === slug; })[0];
    var name = c ? c.nameEnglish : slug;
    var grid = $('#collections'); if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--ink-muted);">' +
      '<div style="font-family:var(--font-display);font-size:22px;color:var(--ink-primary);margin-bottom:8px;">' + esc(name) + '</div>' +
      '<div>Loading collection… the full library view arrives soon.</div>' +
      '<a class="browse-btn" href="?" style="margin-top:14px;display:inline-block;">← All collections</a></div>';
  }

  function routeTo(slug, push) {
    if (push) { try { history.pushState({ collection: slug }, '', slug ? ('?collection=' + encodeURIComponent(slug)) : location.pathname); } catch (_) {} }
    reflectActiveRoute();
    if (slug) showLoadingShell(slug); else applyFilter();
  }

  function wireBrowse() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-browse]');
      if (!a) return;
      e.preventDefault();
      routeTo(a.getAttribute('data-browse'), true);
      var main = document.querySelector('.main'); if (main) main.scrollIntoView({ behavior: 'smooth' });
    });
    window.addEventListener('popstate', function () { var s = currentSlug(); routeTo(s, false); });
  }

  /* ── Continue Reading (read-only; tracking is Module 7) ── */
  function renderContinueReading() {
    var el = $('#ii-continue-reading'); if (!el) return;
    if (currentSlug()) return; // explicit route overrides
    var lr = ui.safeLocalStorageGet('islamicinfo-hadith-last-read', null);
    if (!lr || !lr.collectionSlug || lr.hadithNum == null) return;
    var c = state.collections.filter(function (x) { return x.slug === lr.collectionSlug; })[0];
    var name = c ? c.nameEnglish : lr.collectionSlug;
    el.textContent = 'Continue where you left off → ' + name + ', Hadith ' + lr.hadithNum;
    el.setAttribute('href', '?collection=' + encodeURIComponent(lr.collectionSlug));
    el.setAttribute('data-browse', lr.collectionSlug);
    el.style.display = 'inline-flex';
  }

  /* ── Load collections ── */
  function collectionsError() {
    var grid = $('#collections'); if (!grid) return;
    ui.renderErrorState(grid, 'Collections temporarily unavailable.', function () { loadCollections(); });
  }

  async function loadCollections() {
    var grid = $('#collections'); if (grid) grid.innerHTML = gridSkeleton(6);
    var res = await api.fetchHadithCollections();
    if (!res || !res.ok || !Array.isArray(res.data) || !res.data.length) { collectionsError(); return; }
    state.collections = res.data.map(function (r) { return core.mergeCollection(r, state.meta); });
    renderSidebar(state.collections);
    renderStats(state.collections);
    renderContinueReading();
    var slug = currentSlug();
    if (slug) { reflectActiveRoute(); showLoadingShell(slug); } else { applyFilter(); }
  }

  /* ── Hadith of the Day ── */
  async function loadHotD() {
    var res = await api.fetchHadithDaily();
    if (!res || !res.ok || !res.data) return; // leave the static mockup content as the no-JS fallback
    var h = core.hotdFields(res.data);
    var ar = $('#ii-hotd-arabic'); if (ar) ar.textContent = h.arabic;
    var tx = $('#ii-hotd-text'); if (tx) tx.textContent = '"' + h.translation + '"';
    var ref = $('#ii-hotd-ref');
    if (ref) {
      var narr = h.narrator ? (' · Narrated by ' + h.narrator) : '';
      var grader = h.grader ? (' · ' + h.grader) : '';
      ref.textContent = '📚 ' + h.reference + narr + ' · Graded ' + h.gradeLabel + grader;
    }
    var isnad = $('#ii-hotd-isnad-btn');
    if (isnad) { // isnad enrichment is unavailable until Module 3 — honest disabled state
      isnad.setAttribute('disabled', 'disabled');
      isnad.setAttribute('aria-disabled', 'true');
      isnad.setAttribute('title', 'Verified isnad data unavailable');
      isnad.style.opacity = '.55'; isnad.style.cursor = 'not-allowed';
      isnad.onclick = function (e) { e.preventDefault(); e.stopPropagation(); ui.showToast('Verified isnad data unavailable'); };
    }
  }

  /* ── Mobile bottom-sheet ── */
  function wireSheet() {
    var trigger = $('#ii-sheet-trigger'), backdrop = $('#ii-sheet-backdrop'),
        panel = $('#ii-sheet-panel'), listEl = $('#ii-sheet-list'), closeBtn = $('#ii-sheet-close');
    if (!trigger || !backdrop || !listEl) return;
    var lastFocus = null;
    function open() {
      listEl.innerHTML = state.collections.map(sidebarRowHTML).join('');
      lastFocus = document.activeElement;
      backdrop.style.display = 'block'; trigger.setAttribute('aria-expanded', 'true');
      var first = listEl.querySelector('a'); if (first) first.focus();
      document.addEventListener('keydown', onKey);
    }
    function close() {
      backdrop.style.display = 'none'; trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    trigger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    var trap = ui.focusTrap(panel); void trap;
  }

  /* ── Init ── */
  async function init() {
    try {
      var r = await fetch(META_URL);
      state.meta = await r.json();
    } catch (_) { state.meta = {}; } // meta optional — cards degrade gracefully
    await loadCollections();
    wireFilterTabs();
    wireBrowse();
    wireSheet();
    loadHotD();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
```

- [ ] **Step 2: Sanity check (no bundler; just parse)** — Run: `node --check src/js/hadith.js`
Expected: no output (valid syntax).

- [ ] **Step 3: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): wire Stage-1 sidebar/grid/stats/HotD/filters/route/sheet to live data"
```

---

## Task 5: Manual verification + Module report

**No code.** Serve the site locally (e.g. `python -m http.server` from repo root, or any static server) with the Module 0 Worker reachable, and verify:

- [ ] **Both themes:** toggle light/dark — collections grid, stats, HotD render; dark-mode grade badge on HotD is legible.
- [ ] **Data-driven:** grid + sidebar show the live collections (9 from hadithapi), each with motif · English name · Arabic name · compiler · lifespan · Hadiths/Books stats · authenticity badge · Browse →.
- [ ] **Bukhari only** has `.featured` + `✦ Most Authentic` seal + gold aura; no other card does.
- [ ] **Filters:** clicking All / Kutub al-Sittah / Musnad / Selected filters in place (no navigation, no URL change); `#ii-filter-status` announces the count (check with a screen reader or inspect textContent).
- [ ] **Browse / sidebar click:** sets `?collection=slug`, marks the sidebar row active, shows the loading shell (NOT a faked books list); back button returns to the grid.
- [ ] **Stats:** total reflects summed live counts in the `N,K+` visual; collection count = live count; "100% Source-Verified" retains wording + has the aria qualifier.
- [ ] **HotD:** shows Arabic + translation + reference + narrator + grade + named grader (or "Grade Unknown"); "View Full Isnad" is disabled with the unavailable message.
- [ ] **Continue Reading:** with `localStorage['islamicinfo-hadith-last-read']` set to `{"collectionSlug":"sahih-bukhari","bookNum":1,"hadithNum":5}`, the hero slot appears and links to `?collection=sahih-bukhari`; with it cleared, the slot is hidden.
- [ ] **API failure:** block the Worker (or set an offline state) → grid shows the retry state; clicking retry re-fetches.
- [ ] **Mobile (≤760px):** the "Collections" trigger appears; opens the bottom-sheet; Escape, click-outside, and the close button all dismiss it and return focus to the trigger.
- [ ] **Core unit tests green:** `cd worker && npm test`.
- [ ] **No console errors** on load in either theme.

- [ ] **Produce the Standard Module report** per the master context (elements handled, files/endpoints, real fields rendered, PASS/FAIL checklist, content-verification note) and **flag `collections-meta.json` for ð human review**.

---

## Self-Review Notes (author)
- **Spec coverage:** sidebar+grid one-source → Tasks 2/4; Bukhari featured → cardHTML featured branch; filters+aria-live → wireFilterTabs+announce; Browse/route shell → routeTo/showLoadingShell; classical scholars non-clickable → Task 3 Step 7; stats → renderStats+aggregateStats; HotD grade-always → hotdFields+loadHotD; Continue-Reading → renderContinueReading; bottom-sheet → wireSheet; dark grade badges → Task 3 Step 8; curated meta → Task 1 (D4); tests → Task 2.
- **Deferred (by design, not gaps):** reading-path progress (shell only), full bookmark system, Tier-2 books, isnad panel, Playwright E2E, multi-provider.
- **Honesty:** counts/English-name/compiler from live API; Arabic/lifespan/motif/authenticity from curated meta (ð review); every gap → null/`—`/Unavailable; HotD grade never omitted.
