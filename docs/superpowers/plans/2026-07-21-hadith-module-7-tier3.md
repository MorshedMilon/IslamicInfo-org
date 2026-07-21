# Hadith Module 7 — Tier 3a List & Tier 3b Deep-View — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the scoped hadith-in-book list (Tier 3a, `/hadith/[collection]/[book]`) and the single-hadith deep-view page (Tier 3b, `/hadith/[collection]/[book]/[hadith]`) — the canonical shareable URL for every hadith.

**Architecture:** A new pure/UMD core (`src/js/tier3-deep-view-core.js`, unit-tested with `node:test`) builds all block HTML as strings and resolves prev/next neighbors. A thin DOM/data layer (`src/js/tier3-deep-view.js`) fetches data, renders the two tiers, wires translation-tab switching + localStorage, and handles per-block error fallbacks. `hadith.js` routing is rewired to call the new layer instead of `renderTier3Placeholder`. CSS is inline in `hadith.html` (Module 1–6 convention). Tier 3a reuses `II.hadithFeed.buildCardHTML` as-is; Tier 3b's enlarged body card + gradings table reuse the exact `gradeParts`/`gradeBadgeHTML` pair (one grade source of truth).

**Tech Stack:** Vanilla ES5-style browser JS (UMD, no build step — ADR-001), `node --test` (worker/), History API SPA routing (ADR-026), design-system CSS tokens in `hadith.html`.

**Spec:** `docs/superpowers/specs/2026-07-21-hadith-module-7-tier3-design.md`

---

## File Structure

- **Create** `src/js/tier3-deep-view-core.js` — pure, no DOM/network, UMD (`window.II.tier3Core` / `module.exports`). All block-HTML builders + `resolveNeighbors` + `translationModel`. Depends on `hadith-feed-core.js` (`gradeParts`, `gradeBadgeHTML`, `refOf`, `_esc`) resolved via `require` (Node) or `window.II.hadithFeed` (browser).
- **Create** `src/js/tier3-deep-view.js` — DOM/data layer, UMD (`window.II.tier3`). `init(host)`, `renderList(r,c)` (Tier 3a), `renderDeepView(r,c)` (Tier 3b), tab switching, deferred prev/next, error states.
- **Create** `worker/test/tier3-deep-view-core.test.js` — unit tests for the core.
- **Modify** `src/js/hadith-feed-core.js` — add `gradeBadgeHTML` to the exported `core` object.
- **Modify** `worker/test/hadith-feed-core.test.js` — one test asserting `gradeBadgeHTML` is exported and reuses the fallback.
- **Modify** `src/js/hadith.js` — rewire `renderRoute`; register the host via `II.tier3.init(...)`.
- **Modify** `hadith.html` — add two `<script>` includes (correct order) + inline CSS block for Tier 3a/3b.
- **Modify** `doc/DECISIONS.md` — ADR-027 (JS file-split convention).
- **Modify** `doc/TASKS.md` — translation-editions content-sourcing item.
- **Modify** `doc/DATA.md` — register `islamicinfo-hadith-lang` localStorage key.

**Load order in `hadith.html` (critical):** `hadith-feed-core.js` → `tier3-deep-view-core.js` → `tier3-deep-view.js` → `hadith.js`.

---

## Task 1: Export `gradeBadgeHTML` from the feed core (shared grade source of truth)

**Files:**
- Modify: `src/js/hadith-feed-core.js:162-169` (the `core` export object)
- Test: `worker/test/hadith-feed-core.test.js`

- [ ] **Step 1: Write the failing test** — append to `worker/test/hadith-feed-core.test.js`:

```js
/* ── gradeBadgeHTML export (Module 7: deep-view reuses it) ── */
test('gradeBadgeHTML is exported and renders the null-grader fallback (shared source of truth)', () => {
  assert.equal(typeof core.gradeBadgeHTML, 'function');
  const html = core.gradeBadgeHTML(core.gradeParts(bukhari()));
  assert.match(html, /grade-badge grade-sahih/);
  assert.match(html, /grader not individually cited/);
});
```

- [ ] **Step 2: Run it, verify it fails**

Run (from `worker/`): `node --test test/hadith-feed-core.test.js`
Expected: FAIL — `core.gradeBadgeHTML is not a function` / `typeof` assertion fails.

- [ ] **Step 3: Add `gradeBadgeHTML` to the export** — in `src/js/hadith-feed-core.js`, change the `core` object (currently lines 162-169):

```js
  var core = {
    gradeParts: gradeParts,
    gradeBadgeHTML: gradeBadgeHTML,
    refOf: refOf,
    matchesGrade: matchesGrade,
    dedupeByRef: dedupeByRef,
    buildCardHTML: buildCardHTML,
    _esc: esc,
  };
```

- [ ] **Step 4: Run the whole feed-core suite, verify pass**

Run (from `worker/`): `node --test test/hadith-feed-core.test.js`
Expected: PASS (27 tests — the 26 existing + 1 new).

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-feed-core.js worker/test/hadith-feed-core.test.js
git commit -m "feat(hadith): export gradeBadgeHTML from feed core for Tier 3b reuse

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Docs foundation — DATA.md key, DECISIONS ADR-027, TASKS content item

No tests (documentation). Do this before Task 4 uses the localStorage key.

- [ ] **Step 1: Register the localStorage key in `doc/DATA.md`.** Find the localStorage key registry table (search for `islamicinfo-hadith-last-read`) and add a row immediately after it:

```markdown
| `islamicinfo-hadith-lang` | string | Preferred hadith translation language code (`en`/`ur`/`fr`/`id`/`tr`) for the Tier 3b deep-view translation tabs. Written on tab switch; read on deep-view render. Defaults to `en` when unset or when the stored language is not present in the payload. | Module 7 (Tier 3b) |
```

(If the registry uses a different column shape, match the existing columns exactly — key, type, description, owner/module.)

- [ ] **Step 2: Add ADR-027 to `doc/DECISIONS.md`** (append after ADR-026):

```markdown

## ADR-027 · Per-feature JS files for the Hadith app; CSS stays inline · Accepted · 2026-07-21
**Context.** `hadith.js` reached ~656 lines through Module 6. Module 7 (Tier 3a list + Tier 3b
deep-view: 7 blocks, translation tabs, prev/next) would push it well past a size that stays
reasoning-friendly and reliably editable. TechSpec planned separate files
(`src/js/tier3-deep-view.js`, `src/css/deep-view.css`), but Modules 1–6 kept all hadith CSS inline
in `hadith.html`.
**Decision.** Any hadith module whose JS would meaningfully bloat `hadith.js` gets its **own
feature-named JS file** (e.g. `tier3-deep-view.js`, `tier3-deep-view-core.js`, future
`narrator-panel.js`, `trace-view.js`), following the existing UMD pattern (`window.II.<feature>` /
`module.exports`), with a pure `*-core.js` sibling for unit-testable logic where it helps. **CSS
stays inline in `hadith.html`** everywhere until/unless we deliberately run a **full whole-page CSS
extraction as its own planned pass** — never a per-module half-migration. Modules 8+ follow this
without re-asking.
**Consequences.** Module 7 adds `tier3-deep-view-core.js` + `tier3-deep-view.js`; `hadith.html`
gains two `<script>` includes and an inline CSS block; no `src/css/*.css` files are created.
```

- [ ] **Step 3: Add the translation content-sourcing item to `doc/TASKS.md`** under "Next — Ready to Start" (near the other 🚧 hadith items):

```markdown
- [ ] 🕌🚧 **Hadith translations — source additional editions (UR/FR/ID/TR).** The Tier 3b deep-view
  translation-tab UI + `islamicinfo-hadith-lang` localStorage preference are **built and shipped**
  (Module 7); they render a tab per language *present in the payload* and honor the saved choice the
  moment more languages arrive. Today the provider returns a single English (or Arabic) translation,
  so only one language renders and no tab strip shows. **This is unblocked-by-engineering,
  blocked-by-content-sourcing:** obtain permissively-licensed UR/FR/ID/TR translation editions
  (mirroring the ADR-024 direct-source approach) and surface them as `h.translations[]` on the
  normalized hadith. No code change is required in Module 7's deep-view to light them up.
```

- [ ] **Step 4: Commit**

```bash
git add doc/DATA.md doc/DECISIONS.md doc/TASKS.md
git commit -m "docs(hadith): Module 7 foundations — DATA lang key, ADR-027, translation-sourcing task

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Tier 3 pure core — scaffold + `translationModel`

**Files:**
- Create: `src/js/tier3-deep-view-core.js`
- Test: `worker/test/tier3-deep-view-core.test.js`

- [ ] **Step 1: Create the module scaffold** `src/js/tier3-deep-view-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — tier3-deep-view-core.js  (Module 7)
   Pure, framework-free HTML builders + helpers for Tier 3a (in-book list)
   and Tier 3b (single-hadith deep-view). NO DOM, NO network — inputs passed
   in, builders return strings. UMD: window.II.tier3Core in the browser,
   module.exports in tests. Mirrors hadith-feed-core.js.

   Content-authenticity (see hadith-module-decisions memory + spec):
   - Grade badge / gradings table reuse hadith-feed-core gradeParts +
     gradeBadgeHTML (one source of truth); null grader → "grader not
     individually cited"; NEVER a fabricated second scholar.
   - Isnad / topics / extra translations render honest empty states when
     the provider supplies none (always, live).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var feed = (typeof require !== 'undefined')
    ? require('./hadith-feed-core.js')
    : (root.II && root.II.hadithFeed);

  function esc(s) {
    if (feed && typeof feed._esc === 'function') return feed._esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Canonical translation languages + display labels (TechSpec §2.7 order).
  var LANG_ORDER = ['en', 'ur', 'fr', 'id', 'tr'];
  var LANG_LABELS = { en: 'English', ur: 'اردو', fr: 'Français', id: 'Indonesia', tr: 'Türkçe' };

  // ── translationModel ──────────────────────────────────────────────
  // Present languages only. Live payload has a single `translation`; future
  // enrichment adds `translations[]`. Never fabricates a missing language.
  function translationModel(h) {
    var out = [];
    function push(t) {
      if (!t || !t.text) return;
      var lang = String(t.language || 'en').toLowerCase();
      if (lang === 'ar') lang = 'en';                 // provider text is the EN translation of AR matn
      if (out.some(function (o) { return o.lang === lang; })) return;
      out.push({ lang: lang, label: LANG_LABELS[lang] || lang.toUpperCase(),
                 text: t.text, translator: t.translator || null, edition: t.edition || null });
    }
    if (h && h.translation) push(h.translation);
    if (h && Array.isArray(h.translations)) h.translations.forEach(push);
    out.sort(function (a, b) {
      var ia = LANG_ORDER.indexOf(a.lang), ib = LANG_ORDER.indexOf(b.lang);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return out;
  }

  function chooseLang(model, preferred) {
    if (!model || !model.length) return null;
    var hit = preferred && model.filter(function (m) { return m.lang === preferred; })[0];
    return (hit || model[0]).lang;
  }

  var core = {
    _esc: esc,
    LANG_ORDER: LANG_ORDER,
    LANG_LABELS: LANG_LABELS,
    translationModel: translationModel,
    chooseLang: chooseLang,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.tier3Core = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 2: Create the test file** `worker/test/tier3-deep-view-core.test.js`:

```js
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
```

- [ ] **Step 3: Run, verify pass**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: PASS (5 tests).

- [ ] **Step 4: Commit**

```bash
git add src/js/tier3-deep-view-core.js worker/test/tier3-deep-view-core.test.js
git commit -m "feat(hadith): Tier 3 core scaffold + translationModel (present-languages-only)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Core — grading table + translation block builders

**Files:**
- Modify: `src/js/tier3-deep-view-core.js`
- Test: `worker/test/tier3-deep-view-core.test.js`

- [ ] **Step 1: Write failing tests** — append to `worker/test/tier3-deep-view-core.test.js`:

```js
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
```

- [ ] **Step 2: Run, verify fail**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: FAIL — `core.gradingsTableHTML is not a function`.

- [ ] **Step 3: Implement.** In `src/js/tier3-deep-view-core.js`, add these functions above the `var core = {` block:

```js
  // ── gradingsTableHTML ─────────────────────────────────────────────
  // Reuses hadith-feed-core gradeParts (one grade source of truth). Live:
  // one row, grader null → fallback text, + gap note. Multi-row only when
  // real alternateGradings exist (future curated data). Never fabricates.
  function gradingsTableHTML(h) {
    var p = (h && h.value && h.className) ? h : feed.gradeParts(h);  // accept hadith OR gradeParts
    if (p.value === 'unknown') {
      return '<div class="dv-gradings-empty">Scholarly grading not individually recorded for this narration.</div>';
    }
    var rows = [{ label: p.label, grader: p.grader }];
    (p.alternates || []).forEach(function (a) {
      rows.push({ label: a.label || a.value || 'Grade Unknown', grader: a.grader || null });
    });
    var body = rows.map(function (row) {
      var grader = row.grader ? esc(row.grader) : 'grader not individually cited';
      return '<tr><td class="dv-grade-cell">' + esc(row.label) + '</td><td class="dv-grader-cell">' + grader + '</td></tr>';
    }).join('');
    var gap = (rows.length < 2)
      ? '<p class="dv-gradings-note">Additional scholarly gradings not yet available for this narration.</p>' : '';
    return '<table class="dv-gradings"><thead><tr><th scope="col">Grade</th><th scope="col">Graded by</th></tr></thead>' +
           '<tbody>' + body + '</tbody></table>' + gap;
  }

  // ── translationBlockHTML ──────────────────────────────────────────
  // Tab strip ONLY when >=2 languages present (a real choice). Single
  // language → no strip. Empty → honest unavailable.
  function translationBlockHTML(model, activeLang) {
    if (!model || !model.length) {
      return '<div class="dv-block dv-translations"><h2 class="dv-block-title">Translation</h2>' +
             '<div class="dv-empty">Translation temporarily unavailable.</div></div>';
    }
    activeLang = chooseLang(model, activeLang);
    var tabs = '';
    if (model.length >= 2) {
      tabs = '<div class="dv-tabs" role="tablist">' + model.map(function (m) {
        var on = m.lang === activeLang;
        return '<button class="dv-tab' + (on ? ' on' : '') + '" role="tab" type="button" ' +
               'aria-selected="' + (on ? 'true' : 'false') + '" data-lang="' + esc(m.lang) + '">' + esc(m.label) + '</button>';
      }).join('') + '</div>';
    }
    var panes = model.map(function (m) {
      var on = m.lang === activeLang;
      var by = m.translator ? ('<div class="dv-tr-by">— ' + esc(m.translator) + '</div>') : '';
      return '<div class="dv-tr-pane" role="tabpanel" data-lang="' + esc(m.lang) + '"' + (on ? '' : ' hidden') + '>' +
             '<p class="dv-tr-text">' + esc(m.text) + '</p>' + by + '</div>';
    }).join('');
    return '<div class="dv-block dv-translations"><h2 class="dv-block-title">Translation</h2>' + tabs + panes + '</div>';
  }
```

Then add them to the `core` export object:

```js
    gradingsTableHTML: gradingsTableHTML,
    translationBlockHTML: translationBlockHTML,
```

- [ ] **Step 4: Run, verify pass**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: PASS (12 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/js/tier3-deep-view-core.js worker/test/tier3-deep-view-core.test.js
git commit -m "feat(hadith): Tier 3b gradings table (single honest row) + translation tabs

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Core — body card, isnad, topics, related, breadcrumb, actions, prev/next

**Files:**
- Modify: `src/js/tier3-deep-view-core.js`
- Test: `worker/test/tier3-deep-view-core.test.js`

- [ ] **Step 1: Write failing tests** — append:

```js
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
```

- [ ] **Step 2: Run, verify fail**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: FAIL — `core.bodyCardHTML is not a function`.

- [ ] **Step 3: Implement.** Add these functions in `src/js/tier3-deep-view-core.js` above the `var core = {` block:

```js
  // ── bodyCardHTML (enlarged Tier 3b variant of the feed card) ──────
  function bodyCardHTML(h) {
    if (!h) return '<div class="dv-body-card dv-body-unavailable">Hadith temporarily unavailable</div>';
    var p = feed.gradeParts(h);
    var arabic = h.arabicMatn ? '<div class="hadith-arabic dv-arabic" dir="rtl" lang="ar">' + esc(h.arabicMatn) + '</div>' : '';
    var narrator = (h.narrator && h.narrator.name) ? '<div class="hadith-narrator">' + esc(h.narrator.name) + '</div>' : '';
    var text = (h.translation && h.translation.text) ? '<div class="hadith-text dv-text">' + esc(h.translation.text) + '</div>' : '';
    var ref = h.reference || '';
    return '<div class="hadith-card hadith-card--deep dv-body-card" data-ref="' + esc(feed.refOf(h) || '') + '" data-grade="' + esc(p.value) + '">' +
      '<div class="hadith-teal-bar"></div><div class="hadith-inner">' +
        '<div class="hadith-header"><div class="hadith-meta">' +
          '<span class="hadith-num">Hadith #' + esc(h.hadithNumber) + '</span>' + feed.gradeBadgeHTML(p) +
        '</div></div>' + arabic +
        '<div class="hadith-translation">' + narrator + text + '</div>' +
        (ref ? '<div class="hadith-footer"><div class="hadith-ref"><span class="hadith-ref-icon">📖</span>' + esc(ref) + '</div></div>' : '') +
      '</div></div>';
  }

  // ── isnadInlineHTML (inline, NOT modal — TechSpec §2.7) ───────────
  function isnadInlineHTML(h) {
    var isn = h && h.isnad;
    var nodes = (isn && Array.isArray(isn.narrators)) ? isn.narrators : [];
    if (!nodes.length) {
      return '<div class="dv-block dv-isnad"><h2 class="dv-block-title">Chain of Narration (Isnad)</h2>' +
             '<div class="dv-empty">Chain of narration not available for this hadith.</div></div>';
    }
    var chain = nodes.map(function (n, i) {
      n = n || {};
      var nm = n.fullName || n.arabicName || ('Narrator ' + (i + 1));
      var meta = [n.role, n.lifespan || n.era].filter(Boolean).map(esc).join(' · ');
      return '<li class="dv-isnad-node"><span class="dv-isnad-name">' + esc(nm) + '</span>' +
             (meta ? '<span class="dv-isnad-meta">' + meta + '</span>' : '') + '</li>';
    }).join('');
    return '<div class="dv-block dv-isnad"><h2 class="dv-block-title">Chain of Narration (Isnad)</h2>' +
           '<ol class="dv-isnad-chain">' + chain + '</ol></div>';
  }

  // ── topicsChipsHTML (hidden when empty — always, live) ────────────
  function topicsChipsHTML(h) {
    var topics = (h && Array.isArray(h.topics)) ? h.topics.filter(Boolean) : [];
    if (!topics.length) return '';
    var chips = topics.map(function (t) {
      var label = (typeof t === 'string') ? t : (t.name || t.label || '');
      return label ? '<span class="dv-topic-chip">' + esc(label) + '</span>' : '';
    }).join('');
    return '<div class="dv-block dv-topics"><h2 class="dv-block-title">Topics</h2><div class="dv-topic-chips">' + chips + '</div></div>';
  }

  // ── relatedPlaceholderHTML (Module 11 fills it) ───────────────────
  function relatedPlaceholderHTML() {
    return '<div class="dv-block dv-related"><h2 class="dv-block-title">Related Narrations</h2>' +
           '<div class="dv-empty">Related narrations arrive in a later update.</div></div>';
  }

  // ── breadcrumbHTML ────────────────────────────────────────────────
  function breadcrumbHTML(r, c, h) {
    var slug = r.collection;
    var collName = (c && c.nameEnglish) || (h && h.collectionName) || slug || '';
    var bookNum = (h && h.bookNumber != null) ? h.bookNumber : (r ? r.book : null);
    var bookName = (h && h.bookName) || (bookNum != null ? ('Book ' + bookNum) : '');
    var hadNum = (h && h.hadithNumber != null) ? h.hadithNumber : (r ? r.hadith : '');
    var parts = [
      '<a class="dv-crumb" href="/hadith.html">Hadith</a>',
      '<a class="dv-crumb" href="/hadith/' + encodeURIComponent(slug) + '">' + esc(collName) + '</a>',
    ];
    if (bookNum != null) parts.push('<a class="dv-crumb" href="/hadith/' + encodeURIComponent(slug) + '/' + encodeURIComponent(bookNum) + '">' + esc(bookName) + '</a>');
    parts.push('<span class="dv-crumb dv-crumb-current" aria-current="page">Hadith ' + esc(hadNum) + '</span>');
    return '<nav class="dv-breadcrumb" aria-label="Breadcrumb">' + parts.join('<span class="dv-crumb-sep" aria-hidden="true">›</span>') + '</nav>';
  }

  // ── actionButtonsHTML (rendered; wiring is Module 10 — no dead onclick) ──
  function actionButtonsHTML() {
    return '<div class="dv-actions">' +
      '<button class="dv-action-btn" type="button" data-act="bookmark" title="Bookmark" aria-label="Bookmark">🔖</button>' +
      '<button class="dv-action-btn" type="button" data-act="share" title="Share" aria-label="Share">↗</button>' +
      '<button class="dv-action-btn" type="button" data-act="copy" title="Copy with attribution" aria-label="Copy with attribution">📋</button>' +
    '</div>';
  }

  // ── resolveNeighbors (by list order, not contiguous-number assumption) ──
  function resolveNeighbors(list, currentNum) {
    var nums = (Array.isArray(list) ? list : []).map(function (x) {
      return (x && typeof x === 'object') ? x.hadithNumber : x;
    }).filter(function (n) { return n != null; });
    var i = nums.map(String).indexOf(String(currentNum));
    if (i === -1) return { prev: null, next: null };
    return { prev: i > 0 ? nums[i - 1] : null, next: i < nums.length - 1 ? nums[i + 1] : null };
  }

  // ── prevNextNavHTML ───────────────────────────────────────────────
  function prevNextNavHTML(neighbors, slug, book) {
    neighbors = neighbors || { prev: null, next: null };
    function btn(num, dir, label) {
      if (num == null) return '<span class="dv-nav-btn dv-nav-' + dir + ' dv-nav-disabled" aria-disabled="true">' + label + '</span>';
      var href = '/hadith/' + encodeURIComponent(slug) + '/' + encodeURIComponent(book) + '/' + encodeURIComponent(num);
      return '<a class="dv-nav-btn dv-nav-' + dir + '" href="' + href + '">' + label + '</a>';
    }
    return '<nav class="dv-prevnext" aria-label="Hadith navigation">' +
      btn(neighbors.prev, 'prev', '← Previous') + btn(neighbors.next, 'next', 'Next →') + '</nav>';
  }
```

Then add all of them to the `core` export object:

```js
    bodyCardHTML: bodyCardHTML,
    isnadInlineHTML: isnadInlineHTML,
    topicsChipsHTML: topicsChipsHTML,
    relatedPlaceholderHTML: relatedPlaceholderHTML,
    breadcrumbHTML: breadcrumbHTML,
    actionButtonsHTML: actionButtonsHTML,
    resolveNeighbors: resolveNeighbors,
    prevNextNavHTML: prevNextNavHTML,
```

- [ ] **Step 4: Run, verify pass**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: PASS (24 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/js/tier3-deep-view-core.js worker/test/tier3-deep-view-core.test.js
git commit -m "feat(hadith): Tier 3b core blocks — body/isnad/topics/related/breadcrumb/prev-next

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Core — full deep-view assembler `deepViewHTML` (§2.7 block order)

**Files:**
- Modify: `src/js/tier3-deep-view-core.js`
- Test: `worker/test/tier3-deep-view-core.test.js`

- [ ] **Step 1: Write failing test** — append:

```js
/* ── deepViewHTML: exact §2.7 block order ── */
test('deepViewHTML: blocks appear in TechSpec §2.7 order', () => {
  const r = { collection: 'sahih-bukhari', book: '1', hadith: '1' };
  const html = core.deepViewHTML(r, { nameEnglish: 'Sahih al-Bukhari' }, bukhari(),
    { activeLang: 'en', neighbors: { prev: null, next: 2 } });
  const order = ['dv-breadcrumb', 'dv-actions', 'dv-body-card', 'dv-isnad',
                 'dv-gradings', 'dv-translations', 'dv-related', 'dv-prevnext'];
  let last = -1;
  order.forEach((cls) => {
    const idx = html.indexOf(cls);
    assert.ok(idx > last, `block ${cls} out of order (idx ${idx} after ${last})`);
    last = idx;
  });
  // topics is hidden (empty) live — must NOT appear
  assert.doesNotMatch(html, /dv-topics/);
});

test('deepViewHTML: null hadith → body "temporarily unavailable" but prev/next still present', () => {
  const r = { collection: 'sahih-bukhari', book: '1', hadith: '9' };
  const html = core.deepViewHTML(r, { nameEnglish: 'Sahih al-Bukhari' }, null,
    { neighbors: { prev: 5, next: null } });
  assert.match(html, /Hadith temporarily unavailable/);
  assert.match(html, /dv-prevnext/);
  assert.match(html, /href="\/hadith\/sahih-bukhari\/1\/5"/);   // prev still works
});
```

- [ ] **Step 2: Run, verify fail**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: FAIL — `core.deepViewHTML is not a function`.

- [ ] **Step 3: Implement.** Add in `src/js/tier3-deep-view-core.js` above the `core` object:

```js
  // ── deepViewHTML — assembles Tier 3b in EXACT TechSpec §2.7 order:
  //   header(breadcrumb+actions) → body card → isnad(inline) → gradings
  //   → translations → topics(hidden if empty) → related → prev/next.
  // opts: { activeLang, neighbors, book }. `book` for prev/next when h is null.
  function deepViewHTML(r, c, h, opts) {
    opts = opts || {};
    var book = (h && h.bookNumber != null) ? h.bookNumber : (opts.book != null ? opts.book : r.book);
    return '<article class="dv" data-slug="' + esc(r.collection) + '">' +
      '<header class="dv-header">' + breadcrumbHTML(r, c, h) + actionButtonsHTML() + '</header>' +
      bodyCardHTML(h) +
      isnadInlineHTML(h) +
      '<div class="dv-block dv-gradings-block"><h2 class="dv-block-title">Grading</h2>' +
        (h ? gradingsTableHTML(h) : '<div class="dv-empty">—</div>') + '</div>' +
      translationBlockHTML(translationModel(h), opts.activeLang) +
      topicsChipsHTML(h) +
      relatedPlaceholderHTML() +
      '<div class="dv-prevnext-slot">' + prevNextNavHTML(opts.neighbors, r.collection, book) + '</div>' +
    '</article>';
  }
```

Add to the `core` export object:

```js
    deepViewHTML: deepViewHTML,
```

- [ ] **Step 4: Run, verify pass**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: PASS (26 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/js/tier3-deep-view-core.js worker/test/tier3-deep-view-core.test.js
git commit -m "feat(hadith): Tier 3b deepViewHTML assembler in exact §2.7 block order

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: DOM/data layer `src/js/tier3-deep-view.js`

No unit tests (DOM + network); verified in-browser in Task 11. Every fetch failure degrades to an honest state (FIX-4 / §5.2).

**Files:**
- Create: `src/js/tier3-deep-view.js`

- [ ] **Step 1: Create the file** `src/js/tier3-deep-view.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — tier3-deep-view.js  (Module 7)
   DOM + data layer for Tier 3a (in-book list) and Tier 3b (deep-view).
   Pure HTML comes from II.tier3Core; this layer only does fetch + DOM +
   tab switching + localStorage + prev/next + error fallbacks.
   Host (setTier/tier2El/routeTo/api/ui/feed) is injected by hadith.js via
   II.tier3.init(host) so this file never reaches into hadith.js internals.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var II = root.II = root.II || {};
  var t3 = II.tier3Core;
  var host = null;                                   // set by init()
  var LANG_KEY = 'islamicinfo-hadith-lang';
  var GRADE_VALUES = { all: 1, sahih: 1, hasan: 1, daif: 1, mawdu: 1 };
  var BOOKLESS_DEFAULT = 1;                          // bookless collections use book segment 1

  function esc(s) { return (host && host.ui && host.ui.escapeHTML) ? host.ui.escapeHTML(s) : String(s == null ? '' : s); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  function init(h) { host = h; }

  /* ── shared: localStorage language preference ── */
  function readLang() {
    var v = host.ui && host.ui.safeLocalStorageGet ? host.ui.safeLocalStorageGet(LANG_KEY, null) : null;
    return (v && t3.LANG_LABELS[v]) ? v : 'en';
  }
  function writeLang(lang) {
    if (host.ui && host.ui.safeLocalStorageSet) host.ui.safeLocalStorageSet(LANG_KEY, lang);
  }

  /* ═══════════════ Tier 3a — in-book list ═══════════════ */

  function listHeaderHTML(c, bookNum, bookName, count) {
    var name = bookName || (bookNum != null ? ('Book ' + bookNum) : c.nameEnglish);
    var n = (count != null) ? (' · ' + count + ' hadith' + (count === 1 ? '' : 's')) : '';
    return '<div class="t3a-header">' +
      '<nav class="dv-breadcrumb" aria-label="Breadcrumb">' +
        '<a class="dv-crumb" href="/hadith.html">Hadith</a>' +
        '<span class="dv-crumb-sep" aria-hidden="true">›</span>' +
        '<a class="dv-crumb" href="/hadith/' + encodeURIComponent(c.slug) + '">' + esc(c.nameEnglish) + '</a>' +
        '<span class="dv-crumb-sep" aria-hidden="true">›</span>' +
        '<span class="dv-crumb dv-crumb-current" aria-current="page">' + esc(name) + n + '</span>' +
      '</nav></div>';
  }

  function gradePillsHTML(active) {
    var pills = [['all', 'All'], ['sahih', 'Sahih'], ['hasan', 'Hasan'], ['daif', "Da'if"], ['mawdu', "Mawdu'"]];
    return '<div class="grade-filter t3a-grade-filter" role="group" aria-label="Filter by grade">' +
      pills.map(function (p) {
        var on = p[0] === active;
        return '<button class="grade-filter-pill ' + p[0] + (on ? ' on' : '') + '" type="button" ' +
               'data-grade="' + p[0] + '" role="button" aria-pressed="' + (on ? 'true' : 'false') + '">' + p[1] + '</button>';
      }).join('') + '</div>';
  }

  function applyListGradeFilter(listEl, filter) {
    var cards = listEl.querySelectorAll('.hadith-card[data-ref]');
    var shown = 0;
    cards.forEach(function (card) {
      var vis = (filter === 'all' || card.getAttribute('data-grade') === filter);
      card.style.display = vis ? '' : 'none';
      if (vis) shown++;
    });
    var status = $('#t3a-status');
    if (status) status.textContent = 'Showing ' + shown + ' of ' + cards.length + ' loaded hadith' + (cards.length === 1 ? '' : 's');
  }

  function bookNavHTML(slug, books, currentBook) {
    if (!Array.isArray(books) || !books.length) return '';
    var nums = books.map(function (b) { return b.bookNumber; }).filter(function (n) { return n != null; });
    var i = nums.map(String).indexOf(String(currentBook));
    function link(num, dir, label) {
      if (num == null) return '<span class="dv-nav-btn dv-nav-' + dir + ' dv-nav-disabled" aria-disabled="true">' + label + '</span>';
      return '<a class="dv-nav-btn dv-nav-' + dir + '" href="/hadith/' + encodeURIComponent(slug) + '/' + encodeURIComponent(num) + '">' + label + '</a>';
    }
    var prev = (i > 0) ? nums[i - 1] : null, next = (i >= 0 && i < nums.length - 1) ? nums[i + 1] : null;
    return '<nav class="dv-prevnext t3a-booknav" aria-label="Book navigation">' +
      link(prev, 'prev', '← Previous book') + link(next, 'next', 'Next book →') + '</nav>';
  }

  async function renderList(r, c) {
    host.setTier(2);
    var el = host.tier2El(); if (!el) return;
    var slug = c.slug;
    var book = (r.book != null && r.book !== '') ? r.book : BOOKLESS_DEFAULT;
    var grade = 'all';
    var skeleton = '';
    for (var i = 0; i < 4; i++) skeleton += '<div class="hadith-card" aria-hidden="true" style="opacity:.5;height:120px;"></div>';
    el.innerHTML = listHeaderHTML(c, book, null, null) + gradePillsHTML(grade) +
      '<div id="t3a-status" class="ii-sr-live" aria-live="polite" style="font-size:12px;color:var(--ink-muted);margin:8px 0;"></div>' +
      '<div class="t3a-list" id="ii-t3a-list">' + skeleton + '</div>' +
      '<div id="ii-t3a-booknav"></div>';

    // hadiths (provider-routed) — handles hadithapi + direct sources
    var res;
    try { res = await host.api.fetchHadithsByBook(slug, book, 1, 25); } catch (_) { res = null; }
    var listEl = $('#ii-t3a-list'); if (!listEl) return;              // route changed mid-fetch
    if (!res || !res.ok || !res.data || !Array.isArray(res.data.hadiths)) {
      listEl.innerHTML = '<div class="books-error"><div class="books-empty-title">Hadiths temporarily unavailable</div>' +
        '<div>We couldn’t load the hadiths for this book.</div>' +
        '<button class="btn-glass" id="ii-t3a-retry" type="button" style="margin-top:14px;">Try again</button></div>';
      var retry = $('#ii-t3a-retry'); if (retry) retry.addEventListener('click', function () { renderList(r, c); });
      return;
    }
    var hadiths = res.data.hadiths;
    listEl.innerHTML = hadiths.length
      ? hadiths.map(host.feed.buildCardHTML).join('')
      : '<div class="books-empty"><div class="books-empty-title">No hadiths in this book.</div></div>';

    // header count (now known) + status
    var header = $('.t3a-header');
    if (header && res.data.total != null) header.outerHTML = listHeaderHTML(c, book, null, res.data.total);
    applyListGradeFilter(listEl, grade);

    // grade pills
    el.querySelectorAll('.t3a-grade-filter .grade-filter-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        grade = pill.getAttribute('data-grade');
        el.querySelectorAll('.t3a-grade-filter .grade-filter-pill').forEach(function (p) {
          var on = p === pill; p.classList.toggle('on', on); p.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyListGradeFilter(listEl, grade);
      });
    });

    // "Open Full View" (data-act="full") on each card → Tier 3b
    listEl.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-act="full"]');
      if (!btn || !listEl.contains(btn)) return;
      var card = btn.closest('.hadith-card'); if (!card) return;
      var ref = card.getAttribute('data-ref'); if (!ref) return;
      var parts = ref.split(':');                                     // slug:book:num
      host.routeTo({ collection: parts[0], book: parts[1], hadith: parts[2] }, true);
    });

    // book nav (deferred, non-blocking): needs the collection's book list
    host.api.fetchHadithBooks(slug).then(function (b) {
      var nav = $('#ii-t3a-booknav');
      if (nav && b && b.ok && Array.isArray(b.data)) nav.innerHTML = bookNavHTML(slug, b.data, book);
    }).catch(function () {});
  }

  /* ═══════════════ Tier 3b — deep-view ═══════════════ */

  function wireDeepView(el, r, slug, book) {
    // translation tab switching + persistence
    el.addEventListener('click', function (e) {
      var tab = e.target.closest && e.target.closest('.dv-tab[data-lang]');
      if (tab && el.contains(tab)) {
        var lang = tab.getAttribute('data-lang');
        el.querySelectorAll('.dv-tab[data-lang]').forEach(function (t) {
          var on = t === tab; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        el.querySelectorAll('.dv-tr-pane[data-lang]').forEach(function (pane) {
          if (pane.getAttribute('data-lang') === lang) pane.removeAttribute('hidden'); else pane.setAttribute('hidden', '');
        });
        writeLang(lang);
        return;
      }
      // Module 10 wiring stub — honest toast, no dead onclick
      var act = e.target.closest && e.target.closest('.dv-action-btn[data-act]');
      if (act && el.contains(act) && host.ui && host.ui.showToast) {
        host.ui.showToast('This action arrives in a later update');
      }
    });
  }

  async function renderDeepView(r, c) {
    host.setTier(2);
    var el = host.tier2El(); if (!el) return;
    var slug = c.slug;
    var book = (r.book != null && r.book !== '') ? r.book : BOOKLESS_DEFAULT;
    var num = r.hadith;
    var activeLang = readLang();

    el.innerHTML = '<div class="dv dv-loading"><div class="dv-body-card" aria-hidden="true" style="opacity:.5;height:220px;"></div></div>';

    // 1) core single-hadith fetch (body block critical path)
    var res;
    try { res = await host.api.fetchSingleHadith(slug, book, num); } catch (_) { res = null; }
    if ($('#ii-tier2') !== el && !host.tier2El()) return;             // route changed mid-fetch
    var h = (res && res.ok && res.data) ? res.data : null;

    // 2) paint immediately with no neighbors yet (prev/next resolved after)
    el.innerHTML = t3.deepViewHTML(r, c, h, { activeLang: activeLang, neighbors: { prev: null, next: null }, book: book });
    wireDeepView(el, r, slug, book);

    // 3) deep-link scroll + gold pulse (TechSpec §3.5; respects reduced-motion)
    var body = el.querySelector('.dv-body-card');
    if (body) {
      body.scrollIntoView({ behavior: (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth', block: 'start' });
      if (!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        body.classList.add('pulse-gold');
        setTimeout(function () { body.classList.remove('pulse-gold'); }, 1600);
      }
    }

    // 4) resolve prev/next from the book list (deferred, non-blocking — never blocks body paint)
    host.api.fetchHadithsByBook(slug, book, 1, 1000).then(function (lst) {
      var slot = el.querySelector('.dv-prevnext-slot'); if (!slot) return;
      var list = (lst && lst.ok && lst.data && Array.isArray(lst.data.hadiths)) ? lst.data.hadiths : [];
      var neighbors = t3.resolveNeighbors(list, num);
      slot.innerHTML = t3.prevNextNavHTML(neighbors, slug, book);
    }).catch(function () {});

    // 5) record last-read (Continue Reading source) when the hadith loaded
    if (h && host.ui && host.ui.safeLocalStorageSet) {
      host.ui.safeLocalStorageSet('islamicinfo-hadith-last-read', { collectionSlug: slug, book: book, hadithNum: num });
    }
  }

  II.tier3 = { init: init, renderList: renderList, renderDeepView: renderDeepView };

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 2: Sanity-check the file parses** (no browser yet — just syntax)

Run: `node --check src/js/tier3-deep-view.js`
Expected: no output (exit 0). If it errors, fix the syntax before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/js/tier3-deep-view.js
git commit -m "feat(hadith): Tier 3a/3b DOM layer — list, deep-view, tabs, prev/next, errors

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> **Note for the implementer:** confirm `host.ui.safeLocalStorageSet` exists in `src/js/ui-utils.js` (its sibling `safeLocalStorageGet` is used in `hadith.js:243`). If the setter is named differently or absent, add a minimal `safeLocalStorageSet(key, val)` to `ui-utils.js` (try/catch `localStorage.setItem(key, JSON.stringify(val))`) as a preliminary step and commit it separately — do NOT invent a different key or skip persistence.

---

## Task 8: Wire the router in `src/js/hadith.js`

**Files:**
- Modify: `src/js/hadith.js` (`renderRoute` at 203-212; `init` at 637-652)

- [ ] **Step 1: Replace the Tier-3 branch in `renderRoute`.** Change lines 208-211:

```js
    var c = collectionBySlug(r.collection);
    if (!c) { setTier(1); applyFilter(); try { history.replaceState(null, '', '/hadith.html'); } catch (_) {} return; } // invalid → Tier 1 (TechSpec §10)
    if (r.hadith) { if (II.tier3) II.tier3.renderDeepView(r, c); else renderTier3Placeholder(r, c); return; }   // Tier 3b
    if (r.book || isBookless(r.collection)) { if (II.tier3) II.tier3.renderList(r, c); else renderTier3Placeholder(r, c); return; }   // Tier 3a
    loadBooksGrid(c);
```

(`renderTier3Placeholder` stays in the file as a defensive fallback if the module failed to load. Do not delete it.)

- [ ] **Step 2: Register the host in `init`.** In `src/js/hadith.js`, inside `init()` after `wireRouting();` (line 646), add:

```js
    if (II.tier3 && II.tier3.init) {
      II.tier3.init({
        setTier: setTier, tier2El: tier2El, routeTo: routeTo,
        api: api, ui: ui, feed: feed,
      });
    }
```

- [ ] **Step 3: Sanity-check parse**

Run: `node --check src/js/hadith.js`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): route Tier 3a/3b to II.tier3 (placeholder kept as fallback)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Script includes + inline CSS in `hadith.html`

**Files:**
- Modify: `hadith.html` (script includes near the existing `hadith-feed-core.js`/`hadith.js` tags; `<style>` block)

- [ ] **Step 1: Add the two script includes in the correct order.** Find the existing includes (search for `hadith-feed-core.js`). Ensure this order, adding the two new lines:

```html
<script src="src/js/hadith-feed-core.js"></script>
<script src="src/js/tier3-deep-view-core.js"></script>
<script src="src/js/tier3-deep-view.js"></script>
<script src="src/js/hadith.js"></script>
```

(`tier3-deep-view-core.js` MUST precede `tier3-deep-view.js`, and both MUST precede `hadith.js` so `II.tier3` exists when `init()` calls `II.tier3.init(...)`.)

- [ ] **Step 2: Add the inline CSS block.** Inside the existing `<style>` in `hadith.html` (append near the `.hadith-card` rules, ~line 525), add — using only existing design tokens, no raw hex except inside `rgba()` shadows that mirror existing patterns:

```css
/* ── Module 7: Tier 3a list + Tier 3b deep-view ── */
.t3a-header, .dv-header { margin: 0 0 18px; }
.dv { max-width: 760px; margin: 0 auto; padding: 8px 0 48px; }
.dv-breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-muted); }
.dv-crumb { color: var(--teal-700); text-decoration: none; }
.dv-crumb:hover { text-decoration: underline; }
.dv-crumb-current { color: var(--ink-body); font-weight: 600; }
.dv-crumb-sep { color: var(--ink-faint); }
.dv-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dv-actions { display: flex; gap: 8px; }
.dv-action-btn { width: 38px; height: 38px; border-radius: var(--r-md); border: 1px solid var(--ink-faint);
  background: var(--surface-card); cursor: pointer; font-size: 16px; line-height: 1; display: inline-flex;
  align-items: center; justify-content: center; transition: box-shadow .2s var(--ease); }
.dv-action-btn:hover { box-shadow: var(--elev-1); }

/* Enlarged body card (§2.7: Arabic 24px+) */
.hadith-card--deep { margin: 18px 0; }
.hadith-card--deep .dv-arabic { font-size: 26px; line-height: 2.1; padding: 24px; }
.hadith-card--deep .dv-text { font-size: 17px; line-height: 1.85; }
.dv-body-unavailable { padding: 40px 24px; text-align: center; color: var(--ink-muted);
  border: 1px dashed var(--ink-faint); border-radius: var(--r-xl); margin: 18px 0; }

/* Generic block chrome */
.dv-block { margin: 24px 0; }
.dv-block-title { font-family: var(--font-serif); font-size: 18px; color: var(--ink-primary); margin: 0 0 12px; }
.dv-empty { color: var(--ink-muted); font-size: 14px; padding: 14px 16px; background: var(--surface);
  border-radius: var(--r-md); border: 1px solid var(--ink-faint); }

/* Isnad (inline) */
.dv-isnad-chain { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.dv-isnad-node { padding: 10px 14px; background: var(--teal-50); border-radius: var(--r-md);
  display: flex; flex-direction: column; }
.dv-isnad-name { font-weight: 600; color: var(--ink-body); }
.dv-isnad-meta { font-size: 12px; color: var(--ink-muted); }

/* Gradings table */
.dv-gradings { width: 100%; border-collapse: collapse; font-size: 14px; }
.dv-gradings th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .04em;
  color: var(--ink-muted); padding: 6px 12px; border-bottom: 1px solid var(--ink-faint); }
.dv-gradings td { padding: 10px 12px; border-bottom: 1px solid var(--ink-faint); color: var(--ink-body); }
.dv-grade-cell { font-weight: 600; }
.dv-gradings-note, .dv-gradings-empty { font-size: 13px; color: var(--ink-muted); margin: 10px 0 0; font-style: italic; }

/* Translation tabs */
.dv-tabs { display: flex; gap: 6px; margin: 0 0 12px; flex-wrap: wrap; }
.dv-tab { padding: 6px 14px; border-radius: var(--r-sm); border: 1px solid var(--ink-faint);
  background: var(--surface-card); cursor: pointer; font-size: 13px; color: var(--ink-body); }
.dv-tab.on { background: var(--teal-700); color: var(--white); border-color: var(--teal-700); }
.dv-tr-text { font-size: 16px; line-height: 1.8; color: var(--ink-body); margin: 0; }
.dv-tr-by { font-size: 13px; color: var(--ink-muted); margin-top: 8px; }

/* Topics */
.dv-topic-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.dv-topic-chip { padding: 5px 12px; border-radius: 999px; background: var(--teal-50);
  color: var(--teal-700); font-size: 13px; }

/* Prev/Next (shared by 3a book nav + 3b hadith nav) */
.dv-prevnext { display: flex; justify-content: space-between; gap: 12px; margin: 32px 0 0; }
.dv-nav-btn { padding: 10px 18px; border-radius: var(--r-md); border: 1px solid var(--ink-faint);
  background: var(--surface-card); color: var(--teal-700); text-decoration: none; font-size: 14px; font-weight: 600; }
.dv-nav-btn:hover { box-shadow: var(--elev-1); }
.dv-nav-disabled { opacity: .4; pointer-events: none; color: var(--ink-muted); }
.dv-nav-next { margin-left: auto; }

/* Tier 3a list */
.t3a-list { display: flex; flex-direction: column; gap: 16px; }
.t3a-grade-filter { margin: 0 0 8px; }

/* Deep-link pulse (TechSpec §3.5) */
@keyframes dv-pulse-gold { 0% { box-shadow: 0 0 0 0 var(--gold-aura); } 100% { box-shadow: var(--elev-1); } }
.pulse-gold { animation: dv-pulse-gold 1.6s var(--ease); }
@media (prefers-reduced-motion: reduce) { .pulse-gold { animation: none; } }
```

- [ ] **Step 3: Verify tokens resolve in dark mode.** Confirm every `var(--…)` used above appears in both the light `:root` and the `[data-theme="dark"]` blocks in `hadith.html` (the tokens used — `--teal-700`, `--teal-50`, `--ink-*`, `--surface*`, `--white`, `--r-*`, `--elev-1`, `--gold-aura`, `--ease`, `--font-serif` — are all present per the design-token audit). No raw hex was introduced outside `rgba()` shadows.

- [ ] **Step 4: Commit**

```bash
git add hadith.html
git commit -m "feat(hadith): Tier 3a/3b inline CSS + script includes (correct load order)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Full test suite green

- [ ] **Step 1: Run the entire worker test suite**

Run (from `worker/`): `npm test`
Expected: all suites PASS, including the new `tier3-deep-view-core.test.js` (26) and the updated `hadith-feed-core.test.js` (27). Zero failures. If any fail, fix before proceeding (do not weaken assertions to pass).

- [ ] **Step 2: Commit** (only if any fixups were needed)

```bash
git add -A
git commit -m "test(hadith): Module 7 suite green

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: In-browser verification + Lighthouse

Manual verification (no automated browser harness in-repo — Playwright is deferred to Module 18 per project convention).

- [ ] **Step 1: Serve the static site locally.** From repo root:

Run: `python -m http.server 8080` (or any static server that serves the repo root so `/src/js/*` and `<base href="/">` resolve).

- [ ] **Step 2: Tier 3a checks** — visit `http://localhost:8080/hadith/sahih-bukhari/1`:
  - Sticky/breadcrumb header shows `Hadith › Sahih al-Bukhari › Book 1 · N hadiths`.
  - Cards render via the existing feed card component (teal spine, grade badge with "grader not individually cited").
  - Grade pills filter the loaded cards in place; the aria-live status updates.
  - "Previous/Next book" nav appears at the bottom and links to adjacent book routes.
  - Clicking a card's **Open Full View** navigates to Tier 3b (URL becomes `/hadith/sahih-bukhari/1/<n>`).

- [ ] **Step 3: Tier 3b checks** — visit `http://localhost:8080/hadith/sahih-bukhari/1/1`:
  - Block order top-to-bottom: breadcrumb+actions → enlarged body card (Arabic ≥24px) → isnad ("Chain of narration not available") → gradings table (one row: `Sahih` / `grader not individually cited` + gap note; **no second scholar**) → translation (single EN, **no tab strip**) → (no topics block) → Related Narrations placeholder → Prev/Next hadith nav.
  - Body card gets the gold pulse on load; scrolls into view; reduced-motion disables the animation.
  - Prev/Next hadith links work and change the route; landing on an adjacent hadith re-renders correctly.
  - Toggle dark mode — badges, tokens, and table borders remain legible (WCAG per ADR-025).

- [ ] **Step 4: Error-path check** — visit a non-existent hadith, e.g. `http://localhost:8080/hadith/sahih-bukhari/1/999999`:
  - Body block shows "Hadith temporarily unavailable"; **Prev/Next still renders** and is usable.

- [ ] **Step 5: Lighthouse on the benchmark route.** Attempt:

Run: `npx lighthouse http://localhost:8080/hadith/sahih-bukhari/1/1 --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless" --output=json --output-path=../scratch-lh.json`

  - If it runs: record the four scores. Target ≥90 each (PRD DoD-15). If any category <90, note the top opportunity from the report; small perf fixes (lazy-load, defer non-critical work) may be applied and re-run.
  - **If Lighthouse cannot run in this environment, state that explicitly in the session report — do NOT claim a score.** (Known caveat: the SEO category may be capped by the ADR-026 GitHub-Pages 404-status limitation, which is a separate hosting-migration initiative, not a Module 7 defect — call that out if it lowers SEO.)

- [ ] **Step 6: Session verification note.** Write a short closing report covering:
  - Which routes were verified in-browser and the result.
  - Actual Lighthouse scores **or** an explicit "could not run Lighthouse here" statement.
  - Alternate-gradings entries: confirm all live entries are single-sourced with the honest fallback and **none fabricated** (expected: every live hadith is single-sourced; the multi-row path is exercised only by unit tests).

---

## Definition of Done (verify all before finishing)

- [ ] Every hadith has a canonical shareable URL (`/hadith/[collection]/[book]/[hadith]`).
- [ ] Deep-view block order matches TechSpec §2.7 exactly (asserted by `deepViewHTML` order test + in-browser check).
- [ ] Alternate gradings never show a fabricated second scholar (single honest row + gap note).
- [ ] Body-card + gradings-table grade badges share one source of truth (`gradeParts`/`gradeBadgeHTML`).
- [ ] Tier 3a reuses `buildCardHTML` as-is (no second card component).
- [ ] Translation tabs render only present languages; `islamicinfo-hadith-lang` persists the choice.
- [ ] Per-block partial-failure fallbacks; body-block "temporarily unavailable"; Prev/Next survives partial failure.
- [ ] TASKS.md + DECISIONS.md (ADR-027) + DATA.md entries added.
- [ ] `npm test` green (worker/).
- [ ] Lighthouse ≥90 ×4 on `bukhari/1/1` **run and reported**, or explicitly reported as un-runnable here.

---

## Self-Review (completed by plan author)

**Spec coverage:** Tier 3a (Task 7 `renderList` + Task 9 CSS) ✓; Tier 3b §2.7 order (Tasks 3–6 core + Task 6 assembler + Task 7 render) ✓; enlarged Arabic (Task 9 `.hadith-card--deep .dv-arabic`) ✓; inline isnad (Task 5) ✓; single-row gradings + gap note (Task 4) ✓; present-languages-only tabs + localStorage (Tasks 3–4 + Task 7) ✓; topics hidden (Task 5) ✓; related placeholder (Task 5) ✓; prev/next hadith + book nav (Tasks 5, 7) ✓; FIX-4 error states (Task 7 + Task 6 null-hadith test) ✓; body-badge grader:null confirmation (Task 1 reuse) ✓; file-split convention + TASKS + DATA key (Task 2) ✓; Lighthouse (Task 11) ✓; Stage-4 deferrals (Trace View, reading-path strip) intentionally absent ✓.

**Placeholder scan:** No TBD/TODO; every code step contains complete code. The one implementer note (Task 7 `safeLocalStorageSet`) is a verify-or-add instruction with the exact fallback code, not a placeholder.

**Type/name consistency:** `gradeParts`/`gradeBadgeHTML` (feed core) reused consistently; `II.tier3Core` builders and `II.tier3.{init,renderList,renderDeepView}` names match across Tasks 3–8; `islamicinfo-hadith-lang` used identically in Task 2 (registry), Task 7 (`LANG_KEY`); `deepViewHTML` opts (`activeLang`, `neighbors`, `book`) consistent between Task 6 definition and Task 7 call sites; `resolveNeighbors`/`prevNextNavHTML` signatures consistent between Task 5 and Task 7.
