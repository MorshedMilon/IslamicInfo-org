# Hadith Module 8 — Narrator Reliability Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make each isnad narrator row clickable to expand an inline reliability panel (avatar, name, lifespan, reliability badge, scholar-gradings table) — building the full component + schema + honest states while authoring **zero** narrator citation data (fabrication forbidden; DoD-9).

**Architecture:** New pure core `src/js/narrator-panel-core.js` (unit-tested HTML builders + `reliabilityParts`) + DOM/data layer `src/js/narrator-panel.js` (lazy-fetch + toggle + delegated wiring, host injected by `hadith.js`). `api.js` gains `fetchNarrator(id)` (cache-first `/data/narrator/{id}.json`). Both isnad node renderers emit `data-narrator-id`. CSS reuses existing `.narrator-panel`/`.scholar-*`/`.reliability-dot` shells in `hadith.html`. **No shipped citation data** — one empty structural template only; populated rendering proven with synthetic test fixtures.

**Tech Stack:** Vanilla ES5-style UMD browser JS (no build, ADR-001), `node --test` (worker/), design-system CSS tokens.

**Spec:** `docs/superpowers/specs/2026-07-21-hadith-module-8-narrator-panel-design.md`

---

## File Structure

- **Create** `src/js/narrator-panel-core.js` — pure UMD (`window.II.narratorPanel`), builders + `reliabilityParts`.
- **Create** `src/js/narrator-panel.js` — DOM/data (`window.II.narratorPanelDom`): `init`/`loadNarrator`/`toggleNarratorPanel`/`wire`.
- **Create** `worker/test/narrator-panel-core.test.js` — unit tests (synthetic fixtures only).
- **Create** `data/narrator/_schema.example.json` — empty-citations structural template (no gradings).
- **Modify** `src/js/api.js` — `fetchNarrator(id)`.
- **Modify** `src/js/hadith.js` — `isnadNodeHTML` emits `data-narrator-id`; `init()` registers host + wires delegated click.
- **Modify** `src/js/tier3-deep-view-core.js` — `isnadInlineHTML` nodes emit `data-narrator-id`.
- **Modify** `worker/test/tier3-deep-view-core.test.js` — assert `data-narrator-id` present when node has `id`.
- **Modify** `hadith.html` — 2 script includes (correct order) + CSS additions.
- **Modify** `doc/TASKS.md`, `doc/DECISIONS.md`.

**Load order in `hadith.html`:** existing cores → `narrator-panel-core.js` → `narrator-panel.js` → `hadith.js` (last).

---

## Task 1: Pure core `narrator-panel-core.js` + tests

**Files:** Create `src/js/narrator-panel-core.js`, `worker/test/narrator-panel-core.test.js`

- [ ] **Step 1: Create the test file** `worker/test/narrator-panel-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/narrator-panel-core.js';

/* SYNTHETIC fixtures only — never shipped. Live data has narrators:[] and no
   citation files; these mocked entries exercise the populated render path the
   way Module 2/7 tested disputed-grade dead-code. NOT real scholarly data. */
function narrator(over = {}) {
  return Object.assign({
    id: 'test-1', fullName: 'Test Narrator', arabicName: 'فلان',
    lifespan: 'd. 100 AH', era: 'Tabi‘i', reliabilityGrade: 'thiqah',
    graderCitations: [
      { scholar: 'Scholar A', gradeText: 'Thiqah', source: 'Some Work', sourceRef: 'no. 1' },
    ],
  }, over);
}

test('reliabilityParts: thiqah/saduq/daif map to known badge + dot classes', () => {
  assert.deepEqual(
    ['thiqah', 'saduq', 'daif'].map((g) => core.reliabilityParts(g).dotClass),
    ['thiqah', 'saduq', 'daif']);
  assert.equal(core.reliabilityParts('thiqah').label, 'Thiqah');
  assert.equal(core.reliabilityParts('saduq').badgeClass, 'rel-saduq');
  assert.equal(core.reliabilityParts('daif').label, "Da'if");
  assert.ok(core.reliabilityParts('thiqah').known);
});

test('reliabilityParts: unknown/missing/garbage → grey unknown, never guessed', () => {
  ['', null, undefined, 'majhul', 'made-up'].forEach((g) => {
    const p = core.reliabilityParts(g);
    assert.equal(p.grade, 'unknown');
    assert.equal(p.dotClass, 'unknown');
    assert.equal(p.badgeClass, 'rel-unknown');
    assert.equal(p.known, false);
  });
});

test('graderRowsHTML: renders a row per citation with scholar/grade/citation', () => {
  const html = core.graderRowsHTML([
    { scholar: 'Ibn Hajar', gradeText: 'Thiqah thabt', source: 'Taqrib at-Tahdhib', sourceRef: 'no. 4686' },
  ]);
  assert.match(html, /Ibn Hajar/);
  assert.match(html, /Thiqah thabt/);
  assert.match(html, /Taqrib at-Tahdhib, no\. 4686/);
  assert.match(html, /scholar-grading-row/);
});

test('graderRowsHTML: empty citations → honest "No scholar citations", NEVER padded rows', () => {
  const html = core.graderRowsHTML([]);
  assert.match(html, /No scholar citations available for this narrator/);
  assert.doesNotMatch(html, /scholar-grading-row/);
});

test('graderRowsHTML: escapes provider text (no raw HTML)', () => {
  const html = core.graderRowsHTML([{ scholar: '<script>x</script>', gradeText: 'y', source: 's', sourceRef: 'r' }]);
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('buildNarratorPanelHTML: full panel — name, arabic, reliability badge, gradings', () => {
  const html = core.buildNarratorPanelHTML(narrator());
  assert.match(html, /Test Narrator/);
  assert.match(html, /rel-thiqah/);
  assert.match(html, /Thiqah/);
  assert.match(html, /scholar-grading-row/);
});

test('buildNarratorPanelHTML: null → honest "Reliability data unavailable", never throws', () => {
  assert.match(core.buildNarratorPanelHTML(null), /Reliability data unavailable for this narrator/);
});

test('buildNarratorPanelHTML: narrator with empty citations → panel + honest no-citations note', () => {
  const html = core.buildNarratorPanelHTML(narrator({ graderCitations: [] }));
  assert.match(html, /Test Narrator/);
  assert.match(html, /No scholar citations available for this narrator/);
});
```

- [ ] **Step 2: Run it, verify it FAILS**

Run (from `worker/`): `node --test test/narrator-panel-core.test.js`
Expected: FAIL — cannot find module / `core.reliabilityParts is not a function`.

- [ ] **Step 3: Create `src/js/narrator-panel-core.js`:**

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — narrator-panel-core.js  (Module 8)
   Pure, framework-free HTML builders for the narrator reliability panel
   (Isnad v2). NO DOM, NO network — inputs passed in, returns strings.
   UMD: window.II.narratorPanel in the browser; module.exports in tests.

   RELIGIOUS ACCURACY (highest-risk module): this file only RENDERS narrator
   data — it authors none. Reliability grades + scholar citations come solely
   from provider/curated `/data/narrator/{id}.json` (human, scholar-verified).
   Empty citations → honest "No scholar citations available" (never padded).
   Unknown reliability → grey 'unknown' (never guessed). See DoD-9 + ADR-029.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Canonical reliability map — the ONLY source of badge/dot class + label.
  // Anything not here (incl. missing) collapses to grey 'unknown' (never guessed).
  var REL = {
    thiqah: { label: 'Thiqah', dot: 'thiqah', badge: 'rel-thiqah' },
    saduq:  { label: 'Saduq',  dot: 'saduq',  badge: 'rel-saduq' },
    daif:   { label: "Da'if",  dot: 'daif',   badge: 'rel-daif' },
  };

  function reliabilityParts(grade) {
    var key = String(grade == null ? '' : grade).toLowerCase();
    var hit = Object.prototype.hasOwnProperty.call(REL, key) ? REL[key] : null;
    if (hit) return { grade: key, label: hit.label, dotClass: hit.dot, badgeClass: hit.badge, known: true };
    return { grade: 'unknown', label: 'Unknown', dotClass: 'unknown', badgeClass: 'rel-unknown', known: false };
  }

  // One row per citation. NEVER pads to a "minimum" — renders exactly what's
  // present; empty → honest note (never fabricated to fill the 3-row target).
  function graderRowsHTML(citations) {
    var list = Array.isArray(citations) ? citations : [];
    var rows = list.map(function (c) {
      c = c || {};
      var scholar = c.scholar ? esc(c.scholar) : '';
      var gradeText = c.gradeText ? esc(c.gradeText) : '';
      if (!scholar && !gradeText) return '';                 // never a blank/padded row
      var cite = [c.source, c.sourceRef].filter(Boolean).map(esc).join(', ');
      return '<div class="scholar-grading-row">' +
        '<span class="sg-scholar">' + scholar + '</span>' +
        '<span class="sg-grade">' + gradeText + '</span>' +
        (cite ? '<span class="sg-note">' + cite + '</span>' : '') +
      '</div>';
    }).filter(Boolean);
    if (!rows.length) return '<div class="narrator-empty">No scholar citations available for this narrator</div>';
    return '<div class="scholar-gradings">' + rows.join('') + '</div>';
  }

  function buildNarratorPanelHTML(n) {
    if (!n) return '<div class="narrator-empty">Reliability data unavailable for this narrator</div>';
    var rel = reliabilityParts(n.reliabilityGrade);
    var face = n.arabicName ? String(n.arabicName).slice(0, 2)
             : (n.fullName ? String(n.fullName).trim().charAt(0) : '·');
    var kunyaNasab = [n.kunya, n.nasab].filter(Boolean).map(esc).join(' ');
    var lifePlace = [n.lifespan, n.place || n.era].filter(Boolean).map(esc).join(' · ');
    var arabic = n.arabicName ? ' <span class="narrator-arabic" dir="rtl" lang="ar">' + esc(n.arabicName) + '</span>' : '';
    return '<div class="narrator-panel-inner">' +
      '<div class="narrator-panel-head">' +
        '<div class="narrator-avatar ' + rel.dotClass + '">' + esc(face) + '</div>' +
        '<div class="narrator-panel-id">' +
          '<div class="narrator-panel-name">' + (n.fullName ? esc(n.fullName) : 'Unknown narrator') + arabic + '</div>' +
          (kunyaNasab ? '<div class="narrator-panel-kunya">' + kunyaNasab + '</div>' : '') +
          (lifePlace ? '<div class="narrator-lifespan">' + lifePlace + '</div>' : '') +
        '</div>' +
        '<span class="rel-badge ' + rel.badgeClass + '"><span class="reliability-dot ' + rel.dotClass + '"></span>' + esc(rel.label) + '</span>' +
      '</div>' +
      graderRowsHTML(n.graderCitations) +
    '</div>';
  }

  var core = {
    reliabilityParts: reliabilityParts,
    graderRowsHTML: graderRowsHTML,
    buildNarratorPanelHTML: buildNarratorPanelHTML,
    _esc: esc,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.narratorPanel = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run, verify PASS**

Run (from `worker/`): `node --test test/narrator-panel-core.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/js/narrator-panel-core.js worker/test/narrator-panel-core.test.js
git commit -m "feat(hadith): Module 8 narrator-panel core — reliability + gradings, honest states

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `api.js` `fetchNarrator(id)`

**Files:** Modify `src/js/api.js` (add fn + export), `worker/test/ui-utils.test.js` (test)

- [ ] **Step 1: Write failing test** — append to `worker/test/ui-utils.test.js`:

```js
test('api.js exposes fetchNarrator (Module 8) and it targets /data/narrator (not /api, so API_BASE-exempt)', () => {
  assert.equal(typeof api.fetchNarrator, 'function');
  // /data/ path is NOT rebased by _apiUrl (only /api/ is) — stays same-origin static asset
  assert.equal(api._apiUrl('/data/narrator/x.json'), '/data/narrator/x.json');
});
```

- [ ] **Step 2: Run, verify FAIL**

Run (from `worker/`): `node --test test/ui-utils.test.js`
Expected: FAIL — `api.fetchNarrator is not a function`.

- [ ] **Step 3: Add `fetchNarrator`.** In `src/js/api.js`, immediately after `function fetchHadithDaily() { return _getHadith('/api/hadith/daily'); }` add:

```js
  /* Narrator reliability data (Module 8, TechSpec §4.3) — self-hosted static
     JSON, cache-first 7d, lazy on panel open. Returns the narrator object or
     null (honest "unavailable"). NOT an /api route → API_BASE-exempt. */
  function fetchNarrator(id) {
    var safe = String(id == null ? '' : id).replace(/[^a-z0-9_-]/gi, '');
    if (!safe) return Promise.resolve(null);
    return _get('ii-cache-narrator-' + safe, '/data/narrator/' + safe + '.json', TTL_7D, false);
  }
```

Then add `fetchNarrator,` to the exported `api` object (next to `fetchHadithDaily`).

- [ ] **Step 4: Run, verify PASS**

Run (from `worker/`): `node --test test/ui-utils.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/js/api.js worker/test/ui-utils.test.js
git commit -m "feat(api): fetchNarrator(id) — cache-first /data/narrator/{id}.json (Module 8)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: DOM/data layer `narrator-panel.js`

**Files:** Create `src/js/narrator-panel.js`. No unit tests (DOM+network); `node --check` + browser-verified later.

- [ ] **Step 1: Create the file:**

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — narrator-panel.js  (Module 8)
   DOM + data layer for the narrator reliability panel. Pure HTML comes from
   II.narratorPanel; this only does lazy-fetch + toggle + delegated wiring.
   Host (api/ui) injected by hadith.js via II.narratorPanelDom.init(host).

   The panel nests INSIDE the clicked row (works for both the feed card's
   `.isnad-link` div and the deep-view `<li>`), so no invalid sibling markup.
   Reachable only when an isnad node carries data-narrator-id — live chains are
   empty (narrators:[]), so this is build-ahead of curated data (ADR-029).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var II = root.II = root.II || {};
  var core = II.narratorPanel;
  var host = null;                 // { api, ui }
  var CACHE = {};                  // id -> narrator object | null (session-scoped)

  function init(h) { host = h; }

  async function loadNarrator(id) {
    if (Object.prototype.hasOwnProperty.call(CACHE, id)) return CACHE[id];
    var data;
    try { data = await host.api.fetchNarrator(id); } catch (_) { data = null; }
    CACHE[id] = data || null;      // null = unavailable/unknown (honest)
    return CACHE[id];
  }

  async function toggleNarratorPanel(row, id) {
    if (!row) return;
    var existing = row.querySelector(':scope > .narrator-panel');
    if (existing) {
      var open = existing.classList.toggle('open');
      row.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    var panel = document.createElement('div');
    panel.className = 'narrator-panel open';
    panel.innerHTML = '<div class="narrator-empty">Loading…</div>';
    row.appendChild(panel);
    row.setAttribute('aria-expanded', 'true');

    var data = id ? await loadNarrator(id) : null;
    if (!panel.isConnected) return;                 // row/panel removed mid-fetch
    panel.innerHTML = data
      ? core.buildNarratorPanelHTML(data)
      : '<div class="narrator-empty">Reliability data unavailable for this narrator</div>';
  }

  // Delegated: a click on any isnad node carrying data-narrator-id toggles its
  // panel. Wire ONCE on a persistent container (document) to avoid leaks.
  function wire(container) {
    container = container || document;
    if (container.__narratorWired) return;
    container.__narratorWired = true;
    container.addEventListener('click', function (e) {
      var row = e.target.closest && e.target.closest('[data-narrator-id]');
      if (!row || !container.contains(row)) return;
      var id = row.getAttribute('data-narrator-id');
      if (!id) return;                              // unknown narrator (no id) → not clickable
      toggleNarratorPanel(row, id);
    });
    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var row = e.target.closest && e.target.closest('[data-narrator-id]');
      if (!row || !row.getAttribute('data-narrator-id')) return;
      e.preventDefault();
      toggleNarratorPanel(row, row.getAttribute('data-narrator-id'));
    });
  }

  II.narratorPanelDom = { init: init, loadNarrator: loadNarrator, toggleNarratorPanel: toggleNarratorPanel, wire: wire };

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 2: Syntax check**

Run: `node --check src/js/narrator-panel.js`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/js/narrator-panel.js
git commit -m "feat(hadith): Module 8 narrator-panel DOM layer — lazy-fetch, nested toggle, delegated wiring

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Isnad nodes emit `data-narrator-id`

**Files:** Modify `src/js/hadith.js` (`isnadNodeHTML`), `src/js/tier3-deep-view-core.js` (`isnadInlineHTML`), `worker/test/tier3-deep-view-core.test.js`

- [ ] **Step 1: Write failing test** — append to `worker/test/tier3-deep-view-core.test.js`:

```js
test('isnadInlineHTML: nodes with an id carry data-narrator-id (narrator panel trigger); rows without id do not', () => {
  const html = core.isnadInlineHTML(bukhari({ isnad: { status: 'ok', narrators: [
    { id: 'malik-123', fullName: 'Malik ibn Anas' },
    { fullName: 'Unknown One' },
  ]}}));
  assert.match(html, /data-narrator-id="malik-123"/);
  // the id-less node must NOT get a fabricated/blank data-narrator-id attribute
  assert.doesNotMatch(html, /data-narrator-id=""/);
});
```

- [ ] **Step 2: Run, verify FAIL**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: FAIL — no `data-narrator-id` in output.

- [ ] **Step 3a: Update `tier3-deep-view-core.js` `isnadInlineHTML`.** Replace the node `.map` body (the `<li>` builder) with:

```js
    var chain = nodes.map(function (n, i) {
      n = n || {};
      var nm = n.fullName || n.arabicName || ('Narrator ' + (i + 1));
      var meta = [n.role, n.lifespan || n.era].filter(Boolean).map(esc).join(' · ');
      var idAttr = n.id ? ' data-narrator-id="' + esc(n.id) + '" tabindex="0" role="button" aria-expanded="false"' : '';
      return '<li class="dv-isnad-node"' + idAttr + '><span class="dv-isnad-name">' + esc(nm) + '</span>' +
             (meta ? '<span class="dv-isnad-meta">' + meta + '</span>' : '') + '</li>';
    }).join('');
```

- [ ] **Step 3b: Update `hadith.js` `isnadNodeHTML`.** Replace the `return` in `isnadNodeHTML` (feed card isnad) with an `id`-aware version — also add an "Unknown narrator" title when there is no id (TechSpec §10):

```js
    var idAttr = n.id ? ' data-narrator-id="' + esc(n.id) + '" tabindex="0" aria-expanded="false"' : ' title="Unknown narrator"';
    return '<div class="isnad-link" role="listitem"' + idAttr + '>' +
      '<div class="isnad-avatar' + (role ? ' ' + role : '') + '">' + esc(face) + '</div>' +
      name + life + '<div class="reliability-dot ' + rel + '"></div></div>';
```

- [ ] **Step 4: Run, verify PASS**

Run (from `worker/`): `node --test test/tier3-deep-view-core.test.js`
Expected: PASS (existing tier3 tests + the new one). Also run `node --check src/js/hadith.js` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/js/tier3-deep-view-core.js src/js/hadith.js worker/test/tier3-deep-view-core.test.js
git commit -m "feat(hadith): isnad nodes emit data-narrator-id (Module 8 panel trigger); id-less → Unknown narrator

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Wire host + delegated handler in `hadith.js`

**Files:** Modify `src/js/hadith.js` (`init`)

- [ ] **Step 1: Register host + wire.** In `src/js/hadith.js` `init()`, immediately after the existing `if (II.tier3 && II.tier3.init) { … }` block, add:

```js
    if (II.narratorPanelDom && II.narratorPanelDom.init) {
      II.narratorPanelDom.init({ api: api, ui: ui });
      II.narratorPanelDom.wire(document);   // delegated, once — reachable when isnad nodes carry data-narrator-id
    }
```

- [ ] **Step 2: Syntax check**

Run: `node --check src/js/hadith.js`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): register + wire narrator panel host in init (Module 8)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: `hadith.html` — script includes + CSS

**Files:** Modify `hadith.html`

- [ ] **Step 1: Add the two script includes** in the correct relative order (find the existing `tier3-deep-view.js` / `hadith.js` includes). Insert so the order is:

```html
<script src="src/js/tier3-deep-view.js"></script>
<script src="src/js/narrator-panel-core.js"></script>
<script src="src/js/narrator-panel.js"></script>
<script src="src/js/hadith.js"></script>
```

(`narrator-panel-core.js` before `narrator-panel.js`, both before `hadith.js` so `II.narratorPanelDom` exists when `init()` runs.)

- [ ] **Step 2: Update + add CSS.** In the existing `<style>`, (a) give `.narrator-panel` the `--inner-light` shadow (nested-card look, DoD — no new token), and (b) make `.sg-note` the citation `font-mono 11px`, and (c) add the new panel-part classes. Replace the existing `.narrator-panel { … }` rule and the `.sg-note` rule, and append the rest:

Replace:
```css
.narrator-panel {
  background: var(--surface-base); border: 0.5px solid rgba(0,105,110,.14);
  border-radius: var(--r-lg); padding: 20px; margin-top: 12px; display: none;
}
```
with:
```css
.narrator-panel {
  background: var(--surface-base); border: 0.5px solid rgba(0,105,110,.14);
  border-radius: var(--r-lg); padding: 18px 20px; margin-top: 12px; display: none;
  box-shadow: var(--inner-light);   /* nested .card, existing token (DoD: no new shadow) */
}
```
Replace:
```css
.sg-note { font-size: 11.5px; color: var(--ink-muted); }
```
with:
```css
.sg-note { font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted); }
```
Append (near the `.narrator-panel` rules):
```css
.narrator-panel-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.narrator-panel-id { flex: 1; min-width: 0; }
.narrator-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-arabic); font-size: 15px; color: var(--white);
  background: var(--ink-muted);
}
.narrator-avatar.thiqah { background: var(--grade-sahih); }
.narrator-avatar.saduq  { background: var(--gold-500); }
.narrator-avatar.daif   { background: var(--grade-mawdu); }
.narrator-avatar.unknown { background: var(--ink-muted); }
.narrator-arabic { font-family: var(--font-arabic); font-size: 15px; color: var(--ink-body); font-weight: 400; }
.narrator-lifespan { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }
.rel-badge {
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
  background: var(--surface); border: 0.5px solid var(--ink-faint); color: var(--ink-body);
}
.narrator-empty { font-size: 12.5px; color: var(--ink-muted); padding: 4px 0; }
```

- [ ] **Step 3: Confirm tokens resolve.** Grep that `--inner-light`, `--font-mono`, `--grade-sahih`, `--gold-500`, `--grade-mawdu`, `--ink-muted`, `--ink-faint`, `--surface`, `--surface-base`, `--white`, `--font-arabic`, `--r-lg` all exist in the `:root` block of `hadith.html`. If any is missing, STOP and report (do not invent). (All are present per the Module-7 token audit + the existing `.reliability-dot` rules.)

- [ ] **Step 4: Commit**

```bash
git add hadith.html
git commit -m "feat(hadith): Module 8 narrator-panel CSS + script includes (inner-light card, font-mono citation)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Structural template `data/narrator/_schema.example.json`

**Files:** Create `data/narrator/_schema.example.json`

- [ ] **Step 1: Create the file** (root-level `data/narrator/` = the `/data/narrator/` served path per TechSpec §4.3). It is a schema template with **empty** `graderCitations` — NO gradings:

```json
{
  "_note": "SCHEMA TEMPLATE ONLY — not real data, not loaded by any narrator id. Real /data/narrator/{id}.json files are authored by a human scholar-review process (DoD-9, CONTENT-POLICY §5); graderCitations must trace to Taqrib at-Tahdhib / Tahdhib al-Kamal / Siyar with a real folio/number, each verified via the islamic-authenticity skill. Never fabricated.",
  "id": "example-id",
  "fullName": "",
  "arabicName": "",
  "kunya": "",
  "nasab": "",
  "lifespan": "",
  "era": "",
  "place": "",
  "reliabilityGrade": "unknown",
  "graderCitations": []
}
```

- [ ] **Step 2: Commit**

```bash
git add data/narrator/_schema.example.json
git commit -m "docs(hadith): narrator JSON schema template (empty citations, no data) — Module 8

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Docs — TASKS.md dataset task + DECISIONS ADR-029

**Files:** Modify `doc/TASKS.md`, `doc/DECISIONS.md`

- [ ] **Step 1: Add the dataset content task to `doc/TASKS.md`** under "Next — Ready to Start" (near the other 🕌 hadith items):

```markdown
- [ ] 🕌🚧 **Narrator reliability dataset — scholar-verified (Module 8 data half; DoD-9).** The panel
  ENGINEERING ships in Module 8 (component, lazy-fetch, all honest states), rendering
  honest-"unavailable" until data exists. Seed `/data/narrator/{id}.json` (schema:
  `data/narrator/_schema.example.json`) from **Taqrib at-Tahdhib / Tahdhib al-Kamal / Siyar A'lam
  an-Nubala'**; EVERY `graderCitations[]` entry (scholar + gradeText + source + folio/`sourceRef`) must
  trace to a named classical work and pass the **islamic-authenticity / hadith-verifier** skill. This is
  a **Product + Scholarly Review** task, NOT engineering — gated by CONTENT-POLICY §5 human sign-off; no
  fabricated gradings, ever, and never pad to the "min 3 rows" target. Also needs the upstream curated
  isnad dataset (live chains are `narrators:[]`, so panels aren't reachable until narrator rows exist).
```

- [ ] **Step 2: Append ADR-029 to `doc/DECISIONS.md`:**

```markdown

## ADR-029 · Module 8 narrator panel ships engineering-only; reliability data deferred · Accepted · 2026-07-21
**Context.** US-H11's narrator reliability panel renders named scholarly judgments (Ibn Hajar,
al-Dhahabi, al-Mizzi) with folio citations about named narrators — the platform's highest
religious-accuracy-risk surface (PRD DoD-9: "no fabricated gradings"; charter: "never invent
citations"). An AI agent cannot verify folio/entry numbers against the classical works, so authoring
that data = fabrication. TechSpec §7.5 rule 3 already frames the citations as "validated at
data-authoring time" — human content.
**Decision.** Module 8 builds the full component (pure `narrator-panel-core.js` + DOM
`narrator-panel.js` + `api.fetchNarrator` + `data-narrator-id` on isnad nodes + CSS) and every honest
state (empty-citations → "No scholar citations available for this narrator"; unknown/not-in-DB → grey
`.rel-unknown` + "Unknown narrator"; fetch-fail → "Reliability data unavailable for this narrator").
It authors **zero** narrator citation data — only an empty structural template
(`data/narrator/_schema.example.json`). Populated rendering is proven with **synthetic unit-test
fixtures only** (never shipped), like the Module 2/7 disputed-grade dead-code path. The reliability
dataset is a separate scholar-verified content task (TASKS.md), gated by CONTENT-POLICY §5.
**Consequences.** Panels render honest-"unavailable" live (also because isnad `narrators:[]` means no
rows to click). No fabricated gradings enter the repo. Data lights up with no code change once
verified `/data/narrator/{id}.json` files land.
```

- [ ] **Step 3: Commit**

```bash
git add doc/TASKS.md doc/DECISIONS.md
git commit -m "docs(hadith): Module 8 — narrator dataset content task + ADR-029 (engineering-only, data deferred)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Full suite + syntax + smoke verification

- [ ] **Step 1: Full worker test suite**

Run (from `worker/`): `npm test`
Expected: all PASS — including `narrator-panel-core.test.js` (8) and the updated `ui-utils`/`tier3-deep-view-core` suites. Zero failures. Fix any regression before proceeding (do not weaken assertions).

- [ ] **Step 2: Syntax check all touched JS**

Run: `node --check src/js/narrator-panel-core.js && node --check src/js/narrator-panel.js && node --check src/js/api.js && node --check src/js/hadith.js && node --check src/js/tier3-deep-view-core.js`
Expected: all exit 0.

- [ ] **Step 3: Browser smoke (wiring reachable via synthetic node).** Serve locally (`python -m http.server 8080` from repo root) and, because live isnad chains are empty, verify the wiring with an injected synthetic node in the console on `http://127.0.0.1:8080/hadith.html`:

```js
// paste in DevTools console:
document.body.insertAdjacentHTML('beforeend',
  '<div class="isnad-link" data-narrator-id="nope">row</div>');
document.querySelector('[data-narrator-id="nope"]').click();
// EXPECT: a .narrator-panel appears with "Reliability data unavailable for this narrator"
//         (fetchNarrator('nope') 404s → honest unavailable). No console errors.
```
Confirm: panel toggles open/closed on repeat clicks; no listener errors; keyboard Enter also toggles. (If a browser isn't available in the environment, say so explicitly — do not claim it passed.)

- [ ] **Step 4: Commit** (only if fixups were needed)

```bash
git add -A
git commit -m "test(hadith): Module 8 suite green + smoke verification

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Definition of Done (verify all)

- [ ] Zero fabricated gradings — no citation data authored; template `graderCitations` is `[]`.
- [ ] Empty-citations → "No scholar citations available for this narrator"; never padded to a minimum.
- [ ] Unknown/not-in-DB narrator → grey `.rel-unknown` + "Unknown narrator"; fetch-fail → "Reliability data unavailable for this narrator".
- [ ] Panel is a nested `.card` with `--inner-light` (no new shadow token); citation in `font-mono 11px`.
- [ ] `reliabilityParts` reuses existing grade/gold/ink tokens; no new colors.
- [ ] Panel inline (nested in row, not a modal); lazy-fetch on first open; per-narrator `catch`.
- [ ] Isnad nodes emit `data-narrator-id` only when `id` present; wiring delegated + wired once.
- [ ] Unit tests (synthetic fixtures only) green; full `npm test` green.
- [ ] TASKS.md dataset task + DECISIONS ADR-029 added.

---

## Self-Review (completed by plan author)

**Spec coverage:** panel component + click-expand (Tasks 1,3,5) ✓; schema §7.1 (Task 1 core + Task 7 template) ✓; reliability badge Thiqah/Saduq/Da'if/Unknown (Task 1 `reliabilityParts` + Task 6 CSS) ✓; gradings table scholar/gradeText/citation font-mono (Task 1 `graderRowsHTML` + Task 6 `.sg-note`) ✓; lazy-fetch `/data/narrator/{id}.json` (Task 2 + Task 3) ✓; empty-citations / unknown-narrator / fetch-fail states (Tasks 1,3,4) ✓; nested-card inner-light, no new token (Task 6) ✓; no fabricated data (Task 7 empty template; synthetic fixtures) ✓; TASKS+ADR (Task 8) ✓; verification note (Task 9 + session note) ✓.

**Placeholder scan:** none — every code step is complete.

**Type/name consistency:** `II.narratorPanel` (core) / `II.narratorPanelDom` (dom) consistent Tasks 1,3,5; `reliabilityParts`/`graderRowsHTML`/`buildNarratorPanelHTML` names consistent core↔tests; `fetchNarrator` consistent api↔dom↔test; `data-narrator-id` consistent Tasks 3,4; `/data/narrator/{id}.json` path consistent Task 2 (fetch) ↔ Task 7 (file location) — root-level `data/narrator/`.
