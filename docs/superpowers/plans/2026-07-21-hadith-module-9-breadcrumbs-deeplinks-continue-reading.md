# Hadith Module 9 — Breadcrumbs, Deep Links & Continue Reading — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the Module 9 gaps left after Module 7 — a scroll-based last-read tracker, a Tier-2 breadcrumb, a spec-correct shared deep-link pulse-ring, and last-read restore with correct deep-link precedence — without duplicating what Module 7 already ships.

**Architecture:** A new pure/testable core (`reading-progress-core.js`, `II.readingProgress`) owns the read-detection rules and payload parsing (no DOM, no timers, no `Date.now()` inside). `hadith.js` owns the single `IntersectionObserver`, persistence, Tier-2 breadcrumb, restore-scroll, precedence, and a shared `pulseRing()` fn exposed to Module 7 via the tier3 host. `tier3-deep-view.js` gets two thin hooks only: `host.observeFeed(listEl)` so Tier-3a list cards join the same observer, and `host.pulseRing(body)` replacing its inline pulse.

**Tech Stack:** Vanilla ES5-style IIFE modules (UMD dual-export: `module.exports` for tests / `root.II.*` for browser), `node:test` + `node:assert` unit tests under `worker/test/` (`worker` is `type: module`), no build step for the page.

---

## File Structure

| File | Create/Modify | Responsibility |
|---|---|---|
| `src/js/reading-progress-core.js` | **Create** | Pure: 3s dwell state machine (time-injected), topmost-visible selection, `slug:book:hadith` → last-read payload |
| `worker/test/reading-progress-core.test.js` | **Create** | Unit tests for the core (incl. the named §14.1 "3s not 2s" test) |
| `src/js/hadith.js` | Modify | IO tracker + persistence, `observeFeed`, `pulseRing`, Tier-2 breadcrumb, restore-scroll, prompt deep-link + precedence |
| `src/js/tier3-deep-view.js` | Modify | Call `host.observeFeed(listEl)` after Tier-3a paint; replace inline Tier-3b pulse with `host.pulseRing(body)` |
| `hadith.html` | Modify | Rewrite `.pulse-gold` keyframe/reduced-motion, add ≤700px breadcrumb ellipsis rule, add `reading-progress-core.js` script include |
| `doc/DECISIONS.md` | Modify | ADR logging the pulse timing change (user-visible) |

**Verification convention (matches Modules 7/8):** the pure core is TDD-unit-tested; the DOM layers (`hadith.js`, `tier3-deep-view.js`, CSS) are verified by the full unit suite still passing plus a manual browser smoke check (Task 8). There is no jsdom harness in this repo — do not invent one.

---

## Task 1: `reading-progress-core.js` — pure read-detection core (TDD)

**Files:**
- Create: `src/js/reading-progress-core.js`
- Test: `worker/test/reading-progress-core.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/reading-progress-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/reading-progress-core.js';

/* ── constants ── */
test('exposes THRESHOLD_MS = 3000 and MIN_RATIO = 0.5', () => {
  assert.equal(core.THRESHOLD_MS, 3000);
  assert.equal(core.MIN_RATIO, 0.5);
});

/* ── createTracker: the named §14.1 dwell test ── */
test('createTracker: ref counted read after 3s continuous visibility, NOT at 2s', () => {
  const t = core.createTracker();
  assert.equal(t.update('sahih-bukhari:1:5', 0), null);      // arm
  assert.equal(t.update('sahih-bukhari:1:5', 2000), null);   // 2s — not yet
  assert.equal(t.update('sahih-bukhari:1:5', 3000), 'sahih-bukhari:1:5'); // 3s — read
});

test('createTracker: changing ref re-arms the timer (previous progress discarded)', () => {
  const t = core.createTracker();
  t.update('a', 0);
  assert.equal(t.update('b', 1000), null);   // switched to b, arms at 1000
  assert.equal(t.update('b', 3900), null);   // 2.9s of b
  assert.equal(t.update('b', 4000), 'b');    // 3s of b
});

test('createTracker: leaving all cards (null) disarms; re-entry restarts the 3s clock', () => {
  const t = core.createTracker();
  t.update('a', 0);
  assert.equal(t.update(null, 1000), null);  // nothing visible → disarm
  assert.equal(t.update('a', 2000), null);   // re-armed at 2000
  assert.equal(t.update('a', 4900), null);   // only 2.9s since re-arm
  assert.equal(t.update('a', 5000), 'a');    // 3s since re-arm
});

test('createTracker: does not re-fire for the same continuously-visible ref', () => {
  const t = core.createTracker();
  t.update('a', 0);
  assert.equal(t.update('a', 3000), 'a');    // fires once
  assert.equal(t.update('a', 6000), null);   // already recorded — no repeat
});

/* ── topmost: pick the topmost card at or above MIN_RATIO ── */
test('topmost: returns the qualifying record closest to the top of the viewport', () => {
  const r = core.topmost([
    { ref: 'a', ratio: 0.6, top: 300 },
    { ref: 'b', ratio: 0.9, top: 100 },
  ]);
  assert.equal(r, 'b');
});

test('topmost: ignores records below MIN_RATIO', () => {
  assert.equal(core.topmost([{ ref: 'a', ratio: 0.3, top: 100 }]), null);
});

test('topmost: empty set → null', () => {
  assert.equal(core.topmost([]), null);
});

/* ── payloadFromRef: slug:book:hadith → last-read payload ── */
test('payloadFromRef: parses slug:book:hadith with injected timestamp', () => {
  assert.deepEqual(core.payloadFromRef('sahih-bukhari:1:5', 111), {
    collectionSlug: 'sahih-bukhari', bookNum: '1', hadithNum: '5', timestamp: 111,
  });
});

test('payloadFromRef: bookless-style ref (default book segment) still parses', () => {
  assert.deepEqual(core.payloadFromRef('musnad-ahmad:1:20', 222), {
    collectionSlug: 'musnad-ahmad', bookNum: '1', hadithNum: '20', timestamp: 222,
  });
});

test('payloadFromRef: malformed or empty ref → null (never persist garbage)', () => {
  assert.equal(core.payloadFromRef('bad', 1), null);
  assert.equal(core.payloadFromRef('', 1), null);
  assert.equal(core.payloadFromRef(null, 1), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/reading-progress-core.test.js`
Expected: FAIL — `Cannot find module '../../src/js/reading-progress-core.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/js/reading-progress-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — reading-progress-core.js  (Module 9)
   Pure read-detection rules for the Continue-Reading tracker. NO DOM, NO
   IntersectionObserver, NO timers, NO Date.now() — the caller injects the
   current time so this core is fully deterministic and unit-testable.
   UMD: window.II.readingProgress in the browser, module.exports in tests.
   Mirrors the hadith-feed-core / tier3-deep-view-core dual-export shape.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var THRESHOLD_MS = 3000;   // continuous-visibility dwell before a hadith counts as read (§3.4)
  var MIN_RATIO = 0.5;       // IntersectionObserver threshold a card must meet to be "visible"

  // Given records [{ref, ratio, top}], return the ref of the topmost card
  // (smallest boundingClientRect.top) whose ratio >= MIN_RATIO, else null.
  function topmost(records) {
    var best = null;
    (records || []).forEach(function (r) {
      if (!r || r.ratio < MIN_RATIO) return;
      if (best === null || r.top < best.top) best = r;
    });
    return best ? best.ref : null;
  }

  // Parse a feed data-ref ("slug:book:hadith") into the last-read payload,
  // stamping the caller-supplied timestamp. Malformed refs → null.
  function payloadFromRef(ref, timestamp) {
    if (!ref || typeof ref !== 'string') return null;
    var parts = ref.split(':');
    if (parts.length < 3 || !parts[0] || !parts[2]) return null;
    return {
      collectionSlug: parts[0],
      bookNum: parts[1],
      hadithNum: parts[2],
      timestamp: timestamp,
    };
  }

  // Time-injected dwell state machine. Call update(topRef, now) on every
  // observer/timer tick; it returns the ref that has just crossed the 3s
  // threshold exactly once, else null. Changing/losing the top ref re-arms.
  function createTracker() {
    var armedRef = null, armedSince = 0, firedRef = null;
    return {
      update: function (topRef, now) {
        if (topRef !== armedRef) {           // changed (incl. → null): re-arm
          armedRef = topRef;
          armedSince = topRef ? now : 0;
          firedRef = null;
          return null;
        }
        if (!armedRef || firedRef === armedRef) return null;   // nothing armed / already fired
        if (now - armedSince >= THRESHOLD_MS) { firedRef = armedRef; return armedRef; }
        return null;
      },
      reset: function () { armedRef = null; armedSince = 0; firedRef = null; },
    };
  }

  var api = {
    THRESHOLD_MS: THRESHOLD_MS,
    MIN_RATIO: MIN_RATIO,
    topmost: topmost,
    payloadFromRef: payloadFromRef,
    createTracker: createTracker,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.readingProgress = api; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/reading-progress-core.test.js`
Expected: PASS — all 11 tests pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/js/reading-progress-core.js worker/test/reading-progress-core.test.js
git commit -m "feat(hadith): Module 9 reading-progress-core — pure 3s-dwell/topmost/payload (TDD)"
```

---

## Task 2: Register the core + IO tracker skeleton in `hadith.js`

**Files:**
- Modify: `hadith.html:1900-1905` (script includes)
- Modify: `src/js/hadith.js` (module handle + observer)

- [ ] **Step 1: Add the script include**

In `hadith.html`, the current include block ends at line 1905:

```html
<script src="src/js/hadith-collections-core.js"></script>
<script src="src/js/hadith-feed-core.js"></script>
<script src="src/js/tier3-deep-view-core.js"></script>
<script src="src/js/tier3-deep-view.js"></script>
<script src="src/js/narrator-panel-core.js"></script>
<script src="src/js/narrator-panel.js"></script>
```

Insert `reading-progress-core.js` **before** `hadith.js` is loaded (it must exist on `II` before `hadith.js` runs). Add this line immediately after the `tier3-deep-view-core.js` line:

```html
<script src="src/js/reading-progress-core.js"></script>
```

Verify `hadith.js` itself is included after this block (search the file for `src/js/hadith.js` — it is loaded last). If `hadith.js`'s `<script>` tag is not already present after these cores, do not add it; it is included elsewhere in the page and loads after. (Confirm with: `grep -n "src/js/hadith.js" hadith.html`.)

- [ ] **Step 2: Add the reading-progress module handle + observer to `hadith.js`**

In `src/js/hadith.js`, the module-handle line (line 13) is:

```js
  var api = II.api, ui = II.ui, core = II.hadithCollections, feed = II.hadithFeed;
```

Change it to also grab the reading-progress core:

```js
  var api = II.api, ui = II.ui, core = II.hadithCollections, feed = II.hadithFeed;
  var RP = II.readingProgress;
```

Then, immediately **above** the `/* ── Continue Reading` comment block (currently line 240), insert the observer machinery:

```js
  /* ── Reading-progress tracker (US-H23b / FIX-5) ─────────────────────
     One IntersectionObserver over .hadith-card[data-ref] across the Tier-1
     feed AND Tier-3a list (via host.observeFeed). A card counts as "read"
     after ≥3 continuous seconds ≥50% visible (IO + setTimeout combo; the
     pure rules live in II.readingProgress). On read → persist last-read. */
  var rpObserver = null, rpTracker = null, rpRecords = {}, rpTimer = null, rpCurrent = null;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function rpPersist(ref) {
    var payload = RP.payloadFromRef(ref, Date.now());
    if (payload) ui.safeLocalStorageSet('islamicinfo-hadith-last-read', payload);
  }
  function rpEvaluate() {
    var records = Object.keys(rpRecords).map(function (k) { return rpRecords[k]; });
    var top = RP.topmost(records);
    if (top === rpCurrent) return;                     // no change in topmost → nothing to do
    rpCurrent = top;
    rpTracker.update(top, Date.now());                 // (re)arm the dwell clock in the core
    if (rpTimer) { clearTimeout(rpTimer); rpTimer = null; }
    if (top) {
      rpTimer = setTimeout(function () {
        var read = rpTracker.update(rpCurrent, Date.now());
        if (read) rpPersist(read);
      }, RP.THRESHOLD_MS);
    }
  }
  function initReadingObserver() {
    if (!RP || typeof window.IntersectionObserver !== 'function') return;   // old browser → tracker no-ops
    rpTracker = RP.createTracker();
    var lastEval = 0, pending = false;
    rpObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var ref = en.target.getAttribute('data-ref'); if (!ref) return;
        if (en.isIntersecting && en.intersectionRatio >= RP.MIN_RATIO) {
          rpRecords[ref] = { ref: ref, ratio: en.intersectionRatio, top: en.boundingClientRect.top };
        } else { delete rpRecords[ref]; }
      });
      var now = Date.now();                            // throttle evaluate to ~1s (TechSpec §3.4)
      if (now - lastEval >= 1000) { lastEval = now; rpEvaluate(); }
      else if (!pending) { pending = true; setTimeout(function () { pending = false; lastEval = Date.now(); rpEvaluate(); }, 1000); }
    }, { threshold: [0, RP.MIN_RATIO, 1] });
  }
  // Reset tracker state when a feed/list is fully re-rendered (not on append).
  function resetReadingProgress() {
    rpRecords = {}; rpCurrent = null;
    if (rpTimer) { clearTimeout(rpTimer); rpTimer = null; }
    if (rpTracker) rpTracker.reset();
  }
  // Observe all current .hadith-card[data-ref] in a container (Tier-1 feed or Tier-3a list).
  function observeFeed(container) {
    if (!rpObserver || !container) return;
    container.querySelectorAll('.hadith-card[data-ref]').forEach(function (card) { rpObserver.observe(card); });
  }
```

- [ ] **Step 3: Verify the page still loads without error (no wiring yet)**

Open `hadith.html` in a browser (or the project's dev serve). Confirm the console shows no `[hadith.js]` error and the collections grid still renders. The observer exists but isn't started yet — that is Task 5. This step only proves the new code parses and `II.readingProgress` is present.

Run in the browser console: `II.readingProgress.THRESHOLD_MS`
Expected: `3000`

- [ ] **Step 4: Commit**

```bash
git add hadith.html src/js/hadith.js
git commit -m "feat(hadith): Module 9 reading-progress observer scaffold + core include (inert)"
```

---

## Task 3: Shared `pulseRing()` + spec-correct keyframe

**Files:**
- Modify: `hadith.html:597-600` (keyframe + reduced-motion)
- Modify: `src/js/hadith.js` (add `pulseRing`)

- [ ] **Step 1: Rewrite the `.pulse-gold` keyframe to the §3.5 / §3.14 spec**

In `hadith.html`, the current block (lines 597-600) is:

```css
/* Deep-link pulse (TechSpec §3.5) */
@keyframes dv-pulse-gold { 0% { box-shadow: 0 0 0 0 var(--gold-aura); } 100% { box-shadow: var(--elev-1); } }
.pulse-gold { animation: dv-pulse-gold 1.6s var(--ease); }
@media (prefers-reduced-motion: reduce) { .pulse-gold { animation: none; } }
```

Replace it with the spec version — ring-expand 0→16px, 1.8s, **2 iterations**, plus the §3.14 reduced-motion border highlight:

```css
/* Deep-link pulse (TechSpec §3.5) — 2-iteration gold ring; §3.14 reduced-motion */
@keyframes dv-pulse-gold {
  0%   { box-shadow: 0 0 0 0   rgba(197,160,89,.5); }
  50%  { box-shadow: 0 0 0 16px rgba(197,160,89,0); }
  100% { box-shadow: 0 0 0 0   rgba(197,160,89,0); }
}
.pulse-gold { animation: dv-pulse-gold 1.8s var(--ease-reverent) 2; }
@media (prefers-reduced-motion: reduce) {
  .pulse-gold { animation: none; border-color: rgba(197,160,89,.5); }
}
```

- [ ] **Step 2: Add the shared `pulseRing()` fn to `hadith.js`**

In `src/js/hadith.js`, immediately after the `prefersReducedMotion()` function added in Task 2, insert:

```js
  // Shared deep-link pulse (TechSpec §3.5). Single source of truth: Module 7's
  // Tier-3b deep-view calls this via the tier3 host, and the Continue-Reading
  // deep-link reuses it through the normal deep-link render path. Reduced-motion
  // users get the §3.14 border highlight instead of the animation.
  function pulseRing(el) {
    if (!el) return;
    if (prefersReducedMotion()) { el.style.borderColor = 'rgba(197,160,89,.5)'; return; }
    el.classList.remove('pulse-gold');
    void el.offsetWidth;                                 // reflow so re-adding restarts the animation
    el.classList.add('pulse-gold');
    setTimeout(function () { el.classList.remove('pulse-gold'); }, 3700);   // 2 × 1.8s + buffer
  }
```

- [ ] **Step 3: Verify parse + no regression**

Run the full unit suite to confirm nothing broke (CSS/JS changes don't affect the core, but keep the habit):

Run: `cd worker && node --test "test/*.test.js"`
Expected: PASS — all existing tests plus Task 1's 11 tests pass, 0 fail.

- [ ] **Step 4: Commit**

```bash
git add hadith.html src/js/hadith.js
git commit -m "feat(hadith): Module 9 — spec-correct .pulse-gold (1.8s x2 + reduced-motion) + shared pulseRing()"
```

---

## Task 4: Wire Module 7 to the shared `pulseRing` + `observeFeed` (host hooks)

**Files:**
- Modify: `src/js/hadith.js` (host injection in `init()`)
- Modify: `src/js/tier3-deep-view.js` (Tier-3b pulse → host; Tier-3a observe hook)

- [ ] **Step 1: Pass `observeFeed` + `pulseRing` into the tier3 host**

In `src/js/hadith.js`, `init()` currently registers the tier3 host (lines 649-654):

```js
    if (II.tier3 && II.tier3.init) {
      II.tier3.init({
        setTier: setTier, tier2El: tier2El, routeTo: routeTo,
        api: api, ui: ui, feed: feed,
      });
    }
```

Extend the injected host with the two new hooks:

```js
    if (II.tier3 && II.tier3.init) {
      II.tier3.init({
        setTier: setTier, tier2El: tier2El, routeTo: routeTo,
        api: api, ui: ui, feed: feed,
        observeFeed: observeFeed, pulseRing: pulseRing,
      });
    }
```

- [ ] **Step 2: Replace Module 7's inline Tier-3b pulse with the shared fn**

In `src/js/tier3-deep-view.js`, the Tier-3b pulse block (lines 205-213) is:

```js
    // 3) deep-link scroll + gold pulse (TechSpec §3.5; respects reduced-motion)
    var body = el.querySelector('.dv-body-card');
    if (body) {
      body.scrollIntoView({ behavior: (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth', block: 'start' });
      if (!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        body.classList.add('pulse-gold');
        setTimeout(function () { body.classList.remove('pulse-gold'); }, 1600);
      }
    }
```

Replace it with — scroll stays here (tier3 decides scroll behavior), pulse delegates to the shared host fn (single source of truth, correct 2-iteration timing, reduced-motion handled inside):

```js
    // 3) deep-link scroll + shared gold pulse (TechSpec §3.5; pulse fn owns reduced-motion)
    var body = el.querySelector('.dv-body-card');
    if (body) {
      var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
      body.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (host.pulseRing) host.pulseRing(body);
    }
```

- [ ] **Step 3: Observe Tier-3a list cards with the same tracker**

In `src/js/tier3-deep-view.js`, `renderList` paints the list at line 118-120:

```js
    var hadiths = res.data.hadiths;
    listEl.innerHTML = hadiths.length
      ? hadiths.map(host.feed.buildCardHTML).join('')
      : '<div class="books-empty"><div class="books-empty-title">No hadiths in this book.</div></div>';
```

Immediately after that assignment, add the observe hook so Tier-3a reading counts toward last-read:

```js
    if (host.observeFeed) host.observeFeed(listEl);   // Module 9: same tracker observes Tier-3a cards
```

- [ ] **Step 4: Verify the unit suite still passes**

Run: `cd worker && node --test "test/*.test.js"`
Expected: PASS — 0 fail. (These files have no unit tests; this confirms nothing imported them in a way that breaks.)

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith.js src/js/tier3-deep-view.js
git commit -m "feat(hadith): Module 9 — Tier-3b reuses shared pulseRing; Tier-3a joins reading tracker (host hooks)"
```

---

## Task 5: Start the observer + observe the Tier-1 feed

**Files:**
- Modify: `src/js/hadith.js` (`init()` + `loadHadithFeed`)

- [ ] **Step 1: Start the observer in `init()`**

In `src/js/hadith.js`, `init()` currently ends its feed setup at line 666:

```js
    if (feed) { FEED.filter = readGradeFromUrl(); wireGradeFilter(); wireLoadMore(); wireFeedActions(); loadHadithFeed(false); }
```

Add `initReadingObserver()` before the feed loads so the observer exists when cards render:

```js
    initReadingObserver();
    if (feed) { FEED.filter = readGradeFromUrl(); wireGradeFilter(); wireLoadMore(); wireFeedActions(); loadHadithFeed(false); }
```

- [ ] **Step 2: Reset + observe on Tier-1 feed render**

In `src/js/hadith.js`, `loadHadithFeed` renders cards at lines 399-400:

```js
    if (append) { if (html) el.insertAdjacentHTML('beforeend', html); }
    else el.innerHTML = html || emptyFeedHTML();
```

Change it to reset tracker state on a full render and observe the current cards in both paths:

```js
    if (append) { if (html) el.insertAdjacentHTML('beforeend', html); }
    else { resetReadingProgress(); el.innerHTML = html || emptyFeedHTML(); }
    observeFeed(el);   // Module 9: track topmost visible card for last-read
```

- [ ] **Step 3: Browser smoke — last-read is written after 3s of dwell**

Open `hadith.html`, scroll the feed so a hadith card sits at the top of the viewport, and hold still for ~4 seconds. Then in the console:

```js
JSON.parse(localStorage.getItem('islamicinfo-hadith-last-read'))
```

Expected: an object `{collectionSlug:"sahih-bukhari", bookNum:"1", hadithNum:"<n>", timestamp:<ms>}` matching the card at the top. Scroll to a different card, wait 4s, re-check — `hadithNum` updates. Scroll a card away before 3s → it must NOT become the last-read.

- [ ] **Step 4: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 9 — activate reading tracker on Tier-1 feed (3s dwell → last-read)"
```

---

## Task 6: Tier-2 breadcrumb + mobile ellipsis

**Files:**
- Modify: `src/js/hadith.js:154-161` (`collectionHeaderHTML`)
- Modify: `hadith.html` (≤700px ellipsis rule near the `.dv-breadcrumb` CSS)

- [ ] **Step 1: Add the breadcrumb to the Tier-2 header**

In `src/js/hadith.js`, `collectionHeaderHTML` (lines 154-161) is:

```js
  function collectionHeaderHTML(c) {
    var arabic = c.nameArabic ? '<div class="collection-header-arabic">' + esc(c.nameArabic) + '</div>' : '';
    var meta = [c.compiler, c.lifespan].filter(Boolean).map(esc).join(' · ');
    return '<div class="collection-header">' +
      '<a class="back-btn" href="/hadith.html">↩ All Collections</a>' +
      '<h1 class="collection-header-name">' + esc(c.nameEnglish) + '</h1>' + arabic +
      (meta ? '<div class="collection-header-meta">' + meta + '</div>' : '') + '</div>';
  }
```

Add a `dv-breadcrumb` strip (reusing Module 7's existing breadcrumb classes — no new CSS system) between the back button and the `<h1>`:

```js
  function collectionHeaderHTML(c) {
    var arabic = c.nameArabic ? '<div class="collection-header-arabic">' + esc(c.nameArabic) + '</div>' : '';
    var meta = [c.compiler, c.lifespan].filter(Boolean).map(esc).join(' · ');
    var crumbs = '<nav class="dv-breadcrumb" aria-label="Breadcrumb" style="margin-bottom:12px;">' +
      '<a class="dv-crumb" href="/hadith.html">Hadith</a>' +
      '<span class="dv-crumb-sep" aria-hidden="true">›</span>' +
      '<span class="dv-crumb dv-crumb-current" aria-current="page">' + esc(c.nameEnglish) + '</span>' +
      '</nav>';
    return '<div class="collection-header">' +
      '<a class="back-btn" href="/hadith.html">↩ All Collections</a>' + crumbs +
      '<h1 class="collection-header-name">' + esc(c.nameEnglish) + '</h1>' + arabic +
      (meta ? '<div class="collection-header-meta">' + meta + '</div>' : '') + '</div>';
  }
```

- [ ] **Step 2: Add the ≤700px ellipsis-collapse rule**

In `hadith.html`, the `.dv-breadcrumb` CSS lives around line 531 (`.dv-crumb-sep { color: var(--ink-faint); }`). Immediately after the `.dv-crumb-sep` rule, add the mobile collapse (applies to every tier that uses `.dv-breadcrumb`):

```css
/* Module 9: collapse middle breadcrumb segments to … on narrow screens */
@media (max-width: 700px) {
  .dv-breadcrumb > :not(:first-child):not(.dv-crumb-current) { display: none; }
  .dv-breadcrumb .dv-crumb-current::before { content: '\2026\00A0\203A\00A0'; color: var(--ink-faint); }
}
```

This hides every middle crumb and separator, keeping the first crumb (`Hadith`) and the current crumb, with a `… › ` marker before the current one. On Tier 2 (only two segments) nothing collapses.

- [ ] **Step 3: Browser smoke — breadcrumb renders and links work**

Open `hadith.html`, click a collection's **Browse →** to enter Tier 2 (books grid). Confirm a breadcrumb `Hadith › <Collection>` appears above the title, and clicking **Hadith** returns to Tier 1. Resize the window to ≤700px on a Tier-3b deep-view (`/hadith/sahih-bukhari/1/1`) and confirm the middle segments collapse to `… ›` while the first and last remain.

- [ ] **Step 4: Commit**

```bash
git add src/js/hadith.js hadith.html
git commit -m "feat(hadith): Module 9 — Tier-2 breadcrumb (reuses dv-breadcrumb) + <=700px ellipsis collapse"
```

---

## Task 7: Last-read restore-scroll + deep-link prompt + precedence

**Files:**
- Modify: `src/js/hadith.js` (`init()`, `renderContinueReading`, `loadHadithFeed`)

- [ ] **Step 1: Record whether the user arrived via an explicit deep-link**

In `src/js/hadith.js`, `init()` restores the SPA redirect at line 641:

```js
    try { var rd = new URLSearchParams(location.search).get('redirect'); if (rd && rd.charAt(0) === '/') history.replaceState(null, '', rd); } catch (_) {}
```

Immediately after that line, compute the precedence flag from the **resolved** path (path-based only, per ADR-026 / the design decision — `?collection=` query deep-links are not supported):

```js
    // Precedence (TechSpec §10): an explicit deep-link (a collection segment in the
    // resolved path) always wins over last-read restoration — suppress the prompt and
    // skip restore-scroll. Computed AFTER the ?redirect= restore above.
    state.arrivedViaDeepLink = !!parseRoute().collection;
```

(`state` is the object declared at line 20; `parseRoute` is defined below in the file but hoisted as a function declaration, so it is callable here.)

- [ ] **Step 2: Make the Continue-Reading prompt a deep-link to the last-read hadith**

In `src/js/hadith.js`, `renderContinueReading` (lines 241-252) currently sets the href to the collection only:

```js
  function renderContinueReading() {
    var el = $('#ii-continue-reading'); if (!el) return;
    if (currentSlug()) return;
    var lr = ui.safeLocalStorageGet('islamicinfo-hadith-last-read', null);
    if (!lr || !lr.collectionSlug || lr.hadithNum == null) return;
    var c = state.collections.filter(function (x) { return x.slug === lr.collectionSlug; })[0];
    var name = c ? c.nameEnglish : lr.collectionSlug;
    el.textContent = 'Continue where you left off → ' + name + ', Hadith ' + lr.hadithNum;
    el.setAttribute('href', '/hadith/' + encodeURIComponent(lr.collectionSlug));
    el.setAttribute('data-browse', lr.collectionSlug);
    el.style.display = 'inline-flex';
  }
```

Change the href to a full deep-link when book + hadith are known, so clicking the prompt routes to Tier-3b and **reuses Module 7's scroll + shared pulseRing** (no duplicated pulse logic). The existing `if (currentSlug()) return;` already enforces precedence for the prompt — a deep-link path has a collection segment, so the prompt is suppressed:

```js
  function renderContinueReading() {
    var el = $('#ii-continue-reading'); if (!el) return;
    if (currentSlug()) return;                          // explicit deep-link present → suppress (§10)
    var lr = ui.safeLocalStorageGet('islamicinfo-hadith-last-read', null);
    if (!lr || !lr.collectionSlug || lr.hadithNum == null) return;
    var c = state.collections.filter(function (x) { return x.slug === lr.collectionSlug; })[0];
    var name = c ? c.nameEnglish : lr.collectionSlug;
    var href = '/hadith/' + encodeURIComponent(lr.collectionSlug);
    if (lr.bookNum != null && lr.hadithNum != null) {   // deep-link → Tier-3b scroll + pulse reuse
      href += '/' + encodeURIComponent(lr.bookNum) + '/' + encodeURIComponent(lr.hadithNum);
    }
    el.textContent = 'Continue where you left off → ' + name + ', Hadith ' + lr.hadithNum;
    el.setAttribute('href', href);
    el.setAttribute('data-browse', lr.collectionSlug);
    el.style.display = 'inline-flex';
  }
```

- [ ] **Step 3: Restore-scroll to the last-read card on a non-deep-link load**

In `src/js/hadith.js`, add a one-shot restore helper just below `resetReadingProgress` (added in Task 2). It only fires when the user did NOT arrive via a deep-link and the last-read card is actually in the loaded default feed (Tier-1 feed only holds Bukhari Book 1 — we never fake a scroll to an un-rendered card):

```js
  // Restore-scroll (TechSpec §3.4): on a non-deep-link load, scroll the Tier-1 feed to
  // the last-read card IF it is present in the currently-loaded default feed. One-shot.
  var rpRestored = false;
  function maybeRestoreScroll() {
    if (rpRestored || state.arrivedViaDeepLink) return;
    var lr = ui.safeLocalStorageGet('islamicinfo-hadith-last-read', null);
    if (!lr || lr.collectionSlug !== FEED.slug || String(lr.bookNum) !== String(FEED.book)) return;
    var el = feedEl(); if (!el) return;
    var card = el.querySelector('.hadith-card[data-ref="' + FEED.slug + ':' + FEED.book + ':' + lr.hadithNum + '"]');
    if (card) {
      rpRestored = true;
      card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }
```

(Feed data-refs are `slug:book:hadith`; the colons are literal inside a quoted attribute selector — no escaping needed.)

Then call it at the end of the initial feed render only. In `loadHadithFeed`, the render/observe lines from Task 5 are:

```js
    if (append) { if (html) el.insertAdjacentHTML('beforeend', html); }
    else { resetReadingProgress(); el.innerHTML = html || emptyFeedHTML(); }
    observeFeed(el);   // Module 9: track topmost visible card for last-read
```

Add the restore call, guarded to the non-append path:

```js
    if (append) { if (html) el.insertAdjacentHTML('beforeend', html); }
    else { resetReadingProgress(); el.innerHTML = html || emptyFeedHTML(); }
    observeFeed(el);   // Module 9: track topmost visible card for last-read
    if (!append) maybeRestoreScroll();
```

- [ ] **Step 4: Browser smoke — the flagged conflict case**

This is the required verification for the two-features-conflict case.

1. **Restore path:** `localStorage.setItem('islamicinfo-hadith-last-read', JSON.stringify({collectionSlug:'sahih-bukhari',bookNum:'1',hadithNum:'5',timestamp:Date.now()}))`, then load `/hadith.html` (no path segment). Expected: the Continue Reading pill shows "…Sahih al-Bukhari, Hadith 5", the sidebar pre-selects Bukhari, and the feed scrolls to hadith 5 (if within the first loaded page).
2. **Precedence path (the conflict):** keep the same stale last-read, but load an explicit deep-link `/hadith/sahih-bukhari/1/1`. Expected: the Continue Reading pill is **hidden** (suppressed), there is **no** restore-scroll to hadith 5, and the deep-view pulses on hadith 1. Explicit URL wins.
3. **Prompt click:** from step 1, click the Continue Reading pill. Expected: it routes to `/hadith/sahih-bukhari/1/5`, scrolls to that hadith, and fires the 2-iteration gold pulse (reusing Module 7's path).

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 9 — last-read restore-scroll + deep-link prompt; explicit URL precedence (§10)"
```

---

## Task 8: DECISIONS.md ADR + full verification

**Files:**
- Modify: `doc/DECISIONS.md`

- [ ] **Step 1: Add the pulse-timing ADR**

Open `doc/DECISIONS.md`, find the last ADR heading (search for the highest `ADR-0NN`; Module 8 added ADR-029, so this is **ADR-030** — confirm the next free number before writing). Append:

```markdown
## ADR-030 — Deep-link pulse-ring retimed to spec (Module 9)

**Status:** Accepted · 2026-07-21

**Context:** Module 7 shipped `.pulse-gold` as `dv-pulse-gold 1.6s var(--ease)`, a
single run ending at `--elev-1`, with `prefers-reduced-motion` set to `animation:none`
only. TechSpec §3.5 specifies a ring-expand pulse (`0 0 0 0 → 16px → 0`), **1.8s, 2
iterations**, and §3.14 requires the reduced-motion fallback to apply a
`border-color: rgba(197,160,89,.5)` highlight (not merely disable the animation).

**Decision:** Rewrite `.pulse-gold` to the spec: 1.8s, 2 iterations, ring-expand
keyframe, `var(--ease-reverent)`; add the §3.14 reduced-motion border highlight. Extract
a single shared `pulseRing(el)` in `hadith.js` (exposed to Module 7 via the tier3 host)
so Tier-3b and Module 9 share one implementation instead of the previous inline copy and
its hardcoded `1600ms` cleanup.

**Before → After:** `1.6s × 1`, ends at `--elev-1`  →  `1.8s × 2`, ring-expand to
transparent. **This is a user-visible change:** the deep-link/Continue-Reading pulse now
runs longer and repeats twice. Flag for manual QA on the hadith deep-view.
```

- [ ] **Step 2: Run the full unit suite**

Run: `cd worker && node --test "test/*.test.js"`
Expected: PASS — every existing test plus the 11 new `reading-progress-core` tests pass, 0 fail. Capture the summary line (`ℹ pass N / ℹ fail 0`).

- [ ] **Step 3: Full browser smoke checklist (record pass/fail for each)**

Verify against the DoD in the module prompt:
- [ ] Explicit deep-link URL always wins over last-read restoration (Task 7 step 4.2).
- [ ] 3-second read threshold: a card held ~4s becomes last-read; a card scrolled away before 3s does not (Task 5 step 3).
- [ ] Reduced-motion: with OS "reduce motion" on, the deep-link pulse shows a gold border, no animation (toggle and reload `/hadith/sahih-bukhari/1/1`).
- [ ] Mobile ≤700px: breadcrumb middle segments collapse to `…` (Task 6 step 3).
- [ ] Tier-2 breadcrumb renders and its `Hadith` link returns to Tier 1.
- [ ] Pulse runs 2 iterations on deep-view load and on prompt click.

- [ ] **Step 4: Commit**

```bash
git add doc/DECISIONS.md
git commit -m "docs(hadith): ADR-030 — Module 9 deep-link pulse retimed to spec (1.8s x2), user-visible QA flag"
```

---

## Task 9: Update memory

**Files:** memory directory (outside the repo)

- [ ] **Step 1: Write the Module 9 state memory**

After Task 8 passes, create a `hadith-module-9-state.md` memory file (per the memory
convention) summarizing: Module 9 BUILT on `main` (or the working branch), what it added
(reading-progress-core + tracker, Tier-2 breadcrumb, shared pulseRing / ADR-030,
restore-scroll + precedence), the reconciliation with Module 7, test count, and that it
is still 🕌 review-gated for any content (none authored here). Add the one-line pointer to
`MEMORY.md`. This is a manual step — not committed to the repo.

---

## Self-Review Notes (author)

- **Spec coverage:** §3.4 (Task 5 tracker + Task 7 restore/precedence), §3.5 (Task 3 keyframe + Task 4 shared pulse), §3.14 (Task 3 reduced-motion), §10 precedence (Task 7), §14.1 reading-progress unit test (Task 1). US-H13 breadcrumb Tier-2 gap (Task 6); Tier-3 breadcrumbs pre-exist (Module 7).
- **Deliberate deviation from the module prompt's FILES TOUCHED:** adds `reading-progress-core.js`, `tier3-deep-view.js` edits, a test file, and DECISIONS.md — documented in the design (§8) and approved.
- **Naming consistency:** `observeFeed`, `pulseRing`, `resetReadingProgress`, `maybeRestoreScroll`, `initReadingObserver`, `rpEvaluate` are defined once in `hadith.js` and referenced consistently; `II.readingProgress` methods (`THRESHOLD_MS`, `MIN_RATIO`, `topmost`, `payloadFromRef`, `createTracker`) match between core, tests, and callers.
- **Query-param deep-links:** intentionally unsupported (path-based precedence only) per the design decision.
