# Module 18 — Hadith Engineering Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three independent engineering-only hardening items — reading-path SPA nav, empty-state unification + ARIA, and no-build perf levers — with zero content authored and ADR-001 (no-build) intact.

**Architecture:** Item 1 converts reading-path controls to anchors so the existing `wireRouting` document interceptor handles SPA nav (removing bespoke listeners). Item 2 standardizes Module 8/14 empty states on `.dv-empty` (+`--compact`) with `role="note"`. Item 3 applies no-build page levers to `hadith.html` and records an honest ADR.

**Tech Stack:** Vanilla ES5/UMD JS, `node --test`, static HTML/CSS. Test command: `cd worker && npm test` (baseline **405 pass / 0 fail** — must stay green).

**Design spec:** `docs/superpowers/specs/2026-07-22-module-18-hadith-hardening-design.md`

---

## File Structure
- **Modify** `src/js/reading-paths.js` — Continue + strip → anchors; remove `openNextUnread`/listeners (Item 1).
- **Modify** `src/js/narrator-panel-core.js` — empty states → `.dv-empty dv-empty--compact` + `role="note"` (Item 2).
- **Modify** `src/js/trace-view-core.js` — empty notices gain `role="note"` (Item 2).
- **Modify** `worker/test/narrator-panel-core.test.js`, `worker/test/trace-view-core.test.js` — assert class/role (Item 2, TDD).
- **Modify** `hadith.html` — `.dv-empty--compact` CSS + remove `.narrator-empty`; anchor CSS; non-blocking font; lazy-load scripts (Items 1–3).
- **Modify** `doc/DECISIONS.md` — ADR-043 perf ceiling (Item 3).

---

## Task 1: Item 1 — reading-path controls → anchors (SPA nav)

**Files:** Modify `src/js/reading-paths.js`, `hadith.html` (CSS)

- [ ] **Step 1: Convert `continueControl` + `rowHTML` to emit an anchor for the `continue` state**

In `src/js/reading-paths.js`, replace the `continueControl` and `rowHTML` functions (currently at ~L66–88) with:

```js
  function continueControl(vm, continueHref) {
    if (vm.continueState === 'coming-soon') {
      return '<span class="path-continue path-continue--soon" aria-disabled="true" data-i18n="hadith.paths.comingSoon">Coming soon</span>';
    }
    if (vm.continueState === 'complete') {
      return '<span class="path-continue path-continue--done" data-i18n="hadith.paths.complete">Path complete ✓</span>';
    }
    return '<a class="path-continue" href="' + esc(continueHref) + '" data-i18n="hadith.paths.continue">Continue →</a>';
  }

  function rowHTML(path, readSet) {
    var vm = core.pathRowViewModel(path, readSet);
    var continueHref = vm.continueState === 'continue' ? routeFor(core.nextUnread(path, readSet)) : '';
    return (
      '<div class="reading-path-row" data-path-slug="' + esc(vm.slug) + '">' +
        ringSVG(vm) +
        '<div class="reading-path-meta">' +
          '<div class="reading-path-name" data-i18n="hadith.paths.name.' + esc(vm.slug) + '">' + esc(vm.name) + '</div>' +
          '<div class="reading-path-count">' + esc(vm.countLabel) + '</div>' +
        '</div>' +
        continueControl(vm, continueHref) +
      '</div>'
    );
  }
```

- [ ] **Step 2: Remove the now-dead `[data-path-continue]` listener block and `openNextUnread`**

In `render()`, delete these lines (currently ~L113–117):

```js
    // Continue buttons are inert for the deferred seed (no rows emit them),
    // but wire them for the future curated data path.
    list.querySelectorAll('[data-path-continue]').forEach(function (btn) {
      btn.addEventListener('click', function () { openNextUnread(btn.getAttribute('data-path-continue')); });
    });
```

And delete the entire `openNextUnread` function (currently ~L128–135, the block `function openNextUnread(slug) { … location.href = routeFor(next); }`). Keep the `routeFor` helper (still used).

- [ ] **Step 3: Convert the strip Prev/Next to anchors (SPA nav; disabled span at ends)**

Replace the `mountStrip` body from the `var n = core.pathIndexOf(...)` line through the two `addEventListener` lines (currently ~L169–185) with:

```js
    var n = core.pathIndexOf(path, id);
    var prev = path.hadithRefs[n - 2];
    var next = path.hadithRefs[n];
    function navBtn(key, label, ref) {
      if (ref) return '<a class="path-nav-btn" href="' + esc(routeFor(ref)) + '" data-i18n="' + key + '">' + label + '</a>';
      return '<span class="path-nav-btn" aria-disabled="true" data-i18n="' + key + '">' + label + '</span>';
    }
    slot.innerHTML =
      '<div class="reading-path-strip fade-up">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
        '<span>Reading: <strong>' + esc(path.name) + '</strong> · Hadith ' + n + ' of ' + path.targetCount + '</span>' +
        '<div class="path-nav-btns">' +
          navBtn('hadith.path.prev', '← Previous', prev) +
          navBtn('hadith.path.next', 'Next →', next) +
        '</div>' +
      '</div>';
    i18nApply(slot);
```

(The `location.href` reload path and the `prevBtn`/`nextBtn` listeners are gone — the existing `wireRouting` interceptor in `hadith.js` handles the `/hadith/…` anchors as SPA nav.)

- [ ] **Step 4: Add anchor CSS so links don't underline / keep button look**

In `hadith.html`, find the `.path-continue {` rule (added in Module 17, ~L305) and the pre-existing `.path-nav-btn` rule. Ensure both include `text-decoration:none;`. If `.path-continue` lacks it, append to that rule: `text-decoration: none;`. Add a rule for the nav button if needed:

```css
.path-continue { text-decoration: none; }
.path-nav-btn { text-decoration: none; }
```

(Reuse existing tokens; verify `.path-nav-btn`'s existing declaration and only add `text-decoration:none` if absent — do not duplicate other properties.)

- [ ] **Step 5: Syntax check**

Run: `node --check src/js/reading-paths.js`
Expected: no output (exit 0).

- [ ] **Step 6: Full suite (regression — core tests unaffected)**

Run: `cd worker && npm test`
Expected: 405 pass / 0 fail.

- [ ] **Step 7: Commit**

```bash
git add src/js/reading-paths.js hadith.html
git commit -m "refactor(hadith): Module 18 reading-path controls → anchors for SPA nav (US-H22 follow-up)"
```

---

## Task 2: Item 2a — narrator-panel-core empty states unified + ARIA (TDD)

**Files:** Modify `worker/test/narrator-panel-core.test.js`, then `src/js/narrator-panel-core.js`

- [ ] **Step 1: Add failing assertions for the unified class + role**

In `worker/test/narrator-panel-core.test.js`, add these tests (place near the existing empty-state tests):

```js
test('graderRowsHTML: empty citations use unified .dv-empty--compact + role="note"', () => {
  const html = core.graderRowsHTML([]);
  assert.match(html, /class="dv-empty dv-empty--compact"/);
  assert.match(html, /role="note"/);
  assert.doesNotMatch(html, /narrator-empty/);
});

test('buildNarratorPanelHTML: null uses unified .dv-empty--compact + role="note"', () => {
  const html = core.buildNarratorPanelHTML(null);
  assert.match(html, /class="dv-empty dv-empty--compact"/);
  assert.match(html, /role="note"/);
  assert.doesNotMatch(html, /narrator-empty/);
});
```

- [ ] **Step 2: Run — confirm the two new tests FAIL**

Run: `cd worker && node --test test/narrator-panel-core.test.js`
Expected: FAIL on the two new tests (still `narrator-empty`, no role).

- [ ] **Step 3: Update the two empty-state strings in narrator-panel-core.js**

In `src/js/narrator-panel-core.js`:
- Line ~53: replace `'<div class="narrator-empty">No scholar citations available for this narrator</div>'` with `'<div class="dv-empty dv-empty--compact" role="note">No scholar citations available for this narrator</div>'`.
- Line ~58: replace `'<div class="narrator-empty">Reliability data unavailable for this narrator</div>'` with `'<div class="dv-empty dv-empty--compact" role="note">Reliability data unavailable for this narrator</div>'`.

(Copy text byte-identical — only the wrapper class + role change.)

- [ ] **Step 4: Run — confirm PASS (new + pre-existing text-regex tests)**

Run: `cd worker && node --test test/narrator-panel-core.test.js`
Expected: all pass (existing `/No scholar citations…/` and `/Reliability data unavailable…/` still match — text unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/js/narrator-panel-core.js worker/test/narrator-panel-core.test.js
git commit -m "refactor(hadith): Module 18 narrator empty states → unified .dv-empty--compact + role=note"
```

---

## Task 3: Item 2b — trace-view-core empty notices gain role="note" (TDD)

**Files:** Modify `worker/test/trace-view-core.test.js`, then `src/js/trace-view-core.js`

- [ ] **Step 1: Add a failing assertion for role on trace empty notices**

In `worker/test/trace-view-core.test.js`, add:

```js
test('trace empty notices carry role="note" (ARIA on honest-unavailable text)', () => {
  // isnad with no chain → honest unavailable notice
  const isnadEmpty = core.isnadColumnHTML ? core.isnadColumnHTML([]) : null;
  if (isnadEmpty !== null) {
    assert.match(isnadEmpty, /class="dv-empty" role="note"/);
  }
  // commentary with no text → honest unavailable notice
  const commentaryEmpty = core.commentaryHTML ? core.commentaryHTML('Ibn Hajar', '') : null;
  if (commentaryEmpty !== null) {
    assert.match(commentaryEmpty, /class="dv-empty" role="note"/);
  }
});
```

NOTE: before writing this, open `src/js/trace-view-core.js` and confirm the exact exported function names that produce `.dv-empty` notices (e.g. the isnad column builder, commentary builder). Adjust the calls above to the real exported names and minimal valid args so each returns an empty-notice branch. If a builder is not individually exported, instead assert against the top-level `traceViewHTML`/`buildTraceHTML` output with inputs that force empty branches. The assertion to prove is: every emitted `<div class="dv-empty">` now includes `role="note"`.

- [ ] **Step 2: Run — confirm FAIL**

Run: `cd worker && node --test test/trace-view-core.test.js`
Expected: FAIL (current markup is `class="dv-empty"` with no role).

- [ ] **Step 3: Add role="note" to every `.dv-empty` notice in trace-view-core.js**

In `src/js/trace-view-core.js`, replace all 7 occurrences of the literal `<div class="dv-empty">` with `<div class="dv-empty" role="note">` (use a replace-all — every current `.dv-empty` in this file is an honest-unavailable notice; the 7 sites are the Arabic-not-available, topics, Qur'anic-verses, isnad, grading, commentary, and related-narrations notices). Do not change any copy text or the `UNAVAIL_*` constants.

- [ ] **Step 4: Run — confirm PASS**

Run: `cd worker && node --test test/trace-view-core.test.js`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/js/trace-view-core.js worker/test/trace-view-core.test.js
git commit -m "refactor(hadith): Module 18 trace empty notices gain role=note (ARIA)"
```

---

## Task 4: Item 2c — hadith.html empty-state CSS (add compact modifier, remove narrator-empty)

**Files:** Modify `hadith.html`

- [ ] **Step 1: Add the `.dv-empty--compact` modifier**

In `hadith.html`, find the `.dv-empty {` rule (~L588). Immediately after it, add:

```css
.dv-empty--compact { font-size: 12.5px; background: none; padding: 4px 0; }
```

(These override `.dv-empty`'s size/bg/padding to preserve the narrator panel's density; the `.dv-empty` base still supplies color etc.)

- [ ] **Step 2: Remove the now-unused `.narrator-empty` rule**

Find and delete the rule `.narrator-empty { font-size: 12.5px; color: var(--ink-muted); padding: 4px 0; }` (~L746).

- [ ] **Step 3: Confirm no remaining references to `narrator-empty`**

Run: `grep -rn "narrator-empty" src/js hadith.html worker/test`
Expected: no matches (all migrated to `.dv-empty dv-empty--compact`).

- [ ] **Step 4: Full suite**

Run: `cd worker && npm test`
Expected: 405+ pass / 0 fail.

- [ ] **Step 5: Commit**

```bash
git add hadith.html
git commit -m "refactor(hadith): Module 18 add .dv-empty--compact, remove .narrator-empty"
```

---

## Task 5: Item 3a — non-render-blocking font stylesheet

**Files:** Modify `hadith.html`

- [ ] **Step 1: Convert the blocking font `<link>` to preload-swap**

In `hadith.html`, find the render-blocking font stylesheet (~L21):

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

Replace it with the preload-swap pattern (keep the exact same URL in both places):

```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"></noscript>
```

(Leave the two `preconnect` links above it unchanged.)

- [ ] **Step 2: Sanity check the file still loads (static)**

Run: `grep -c "onload=\"this.onload=null;this.rel='stylesheet'\"" hadith.html`
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add hadith.html
git commit -m "perf(hadith): Module 18 non-render-blocking font stylesheet (preload-swap)"
```

---

## Task 6: Item 3b — lazy-load post-interaction feature scripts

**Files:** Modify `hadith.html`

- [ ] **Step 1: Verify each script is safe to defer**

Open `src/js/hadith-ai-core.js`, `src/js/hadith-ai.js`, `src/js/quranlyai-widget.js`, `src/js/select-to-ask.js`. Confirm none is a first-paint dependency of `hadith.js` (they self-init for the explain button / floating widget / text-selection menu, all post-interaction). If any MUST run before first paint or is depended on synchronously by `hadith.js`, LEAVE it as an eager `<script>` and note why in the commit message. Report findings.

- [ ] **Step 2: Replace the four blocking script tags with an idle loader**

In `hadith.html`, find the four tags (~L2086–2090):

```html
<script src="src/js/hadith-ai-core.js"></script>
<script src="src/js/hadith-ai.js"></script>
<script src="src/js/quranlyai-widget.js?v=20260718c"></script>
<script src="src/js/select-to-ask.js?v=20260719a"></script>
```

Replace them (only the ones confirmed safe in Step 1) with a small deferred loader:

```html
<script>
  /* Module 18 perf: load post-interaction feature scripts after first paint —
     none is a first-paint dependency (explain button, floating widget, text-selection). */
  (function () {
    var deferred = [
      'src/js/hadith-ai-core.js',
      'src/js/hadith-ai.js',
      'src/js/quranlyai-widget.js?v=20260718c',
      'src/js/select-to-ask.js?v=20260719a'
    ];
    function load() {
      deferred.forEach(function (src) {
        var s = document.createElement('script');
        s.src = src; s.async = false; // preserve execution order
        document.body.appendChild(s);
      });
    }
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 3000 });
    else window.addEventListener('load', load);
  })();
</script>
```

(`s.async = false` on dynamically-inserted scripts preserves relative execution order — `hadith-ai-core` before `hadith-ai`.)

- [ ] **Step 3: Syntax/structure check**

Run: `grep -c "requestIdleCallback" hadith.html`
Expected: `1`. Confirm the four original `<script src=…hadith-ai…>` / `quranlyai-widget` / `select-to-ask` standalone tags are gone (now inside the loader array).

- [ ] **Step 4: Manual smoke (if a browser is available)**

If `npx serve` + a browser is available: load `hadith.html`, confirm no console errors, the page renders, and (after a moment) the floating QuranlyAI button and text-selection menu still work. If no browser automation is available, note that this is deferred to human sign-off (matches prior modules) — do NOT block.

- [ ] **Step 5: Commit**

```bash
git add hadith.html
git commit -m "perf(hadith): Module 18 lazy-load post-interaction feature scripts (idle/load)"
```

---

## Task 7: Item 3c — measure + ADR-043

**Files:** Modify `doc/DECISIONS.md` (+ optional perf note)

- [ ] **Step 1: Measure before/after with Lighthouse (web-perf skill)**

Attempt a Lighthouse Performance measurement of `hadith.html` using the **web-perf skill** (Chrome DevTools MCP): capture the score BEFORE Module-18 perf changes (git stash or checkout the pre-Task-5 commit if needed) and AFTER. Record both numbers and the key metrics (LCP, TBT, render-blocking resources).

If no browser automation / Chrome DevTools MCP is available in this session (as in prior modules), SKIP measurement, record "measurement deferred to human sign-off — no browser automation available", and do NOT fabricate a score.

- [ ] **Step 2: Add ADR-043**

In `doc/DECISIONS.md`, after the last ADR (verify the highest number first: `grep -oE "ADR-04[0-9]" doc/DECISIONS.md | sort -u | tail -1` — expect `ADR-042`; if higher, bump), append:

```
## ADR-043 · Hadith base-page perf <90 (DoD-15) may be structurally capped by no-build ADR-001 · Accepted · 2026-07-22 · Module 18 (Hadith Hardening)
**Context.** Module 7 DoD-15 targets Lighthouse Performance <90 on the hadith base page; measured 62–65. The dominant costs are ~43 KiB unminified JS and the whole SPA loading per route — both only removable with minification/bundling, which ADR-001 (no build step) forbids. The cheap levers (font-display, preconnect) were already applied.
**Decision.** Apply the remaining NO-BUILD levers only: non-render-blocking font stylesheet (preload-swap) and lazy-loading post-interaction feature scripts (hadith-ai, quranlyai-widget, select-to-ask) after first paint. Measure honestly with Lighthouse and report the real number rather than chasing 90 by any means.
**Consequences.** These levers reduce render-blocking + main-thread work but may not reach 90; the residual gap is structural under ADR-001. Reaching <90 would require either revisiting ADR-001 to add a build step (minify/bundle) or a hosting/build change — a separate plan-and-approve decision, explicitly out of Module-18 scope. This is a documented, known ceiling, not a silent workaround. [Record measured before/after here if a browser was available; otherwise note measurement deferred to human sign-off.]
**References.** `docs/superpowers/specs/2026-07-22-module-18-hadith-hardening-design.md`; ADR-001 (no-build); Module-7 DoD-15.
```

Fill the bracketed measured-number line from Step 1 (or the deferral note).

- [ ] **Step 3: Commit**

```bash
git add doc/DECISIONS.md
git commit -m "docs(hadith): Module 18 ADR-043 — perf <90 structurally capped by no-build ADR-001"
```

---

## Task 8: Final regression + review

- [ ] **Step 1: Full suite**

Run: `cd worker && npm test`
Expected: all pass (405 baseline + new item-2 assertions), 0 fail. Record the count.

- [ ] **Step 2: Confirm no content authored / no new tokens / ADR-001 intact**

Run: `git diff main..HEAD -- src/ hadith.html` and confirm: no hadith reference/Arabic/citation authored; no new color tokens; no build step / minified files introduced; `mountStrip`/`markRead` still unwired (deferred).

- [ ] **Step 3: Dispatch final whole-branch code review** (per subagent-driven-development).

---

## Self-Review

**Spec coverage:** Item 1 → Task 1 (anchors + listener removal + CSS). Item 2 → Tasks 2 (narrator TDD), 3 (trace TDD), 4 (CSS unify/remove). Item 3 → Tasks 5 (font), 6 (lazy scripts), 7 (measure + ADR-043). Final regression → Task 8. All design DoD items mapped.

**Placeholder scan:** No TBD/TODO. Task 3 Step 1 and Task 6 Step 1 carry explicit "verify exact names / verify safe to defer" instructions (real verification steps, not placeholders). Task 7 has an explicit measurement-contingency. ADR number has a verify step.

**Type/naming consistency:** `continueControl(vm, continueHref)` new 2-arg signature used consistently in `rowHTML`. `routeFor` retained and reused (Continue href + `navBtn`). `.dv-empty dv-empty--compact` + `role="note"` identical across narrator core, tests, and CSS. Trace uses `.dv-empty" role="note"` (no compact modifier — full-width notices). `.narrator-empty` fully removed (Task 4 Step 3 greps to prove).
