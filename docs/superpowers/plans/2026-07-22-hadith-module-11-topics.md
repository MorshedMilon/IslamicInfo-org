# Hadith Module 11 — Topic Index / Landing + Related-Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the honest engineering slice of Module 11 — topic-chip routing switch, `/hadith/topics` index, `/hadith/topics/[topic]` landing (honest header + keyword-filtered feed + real keyword-co-occurrence rail), and the honest Tier-3b related-grid state. Zero fabricated content/data.

**Architecture:** New pure `hadith-topics-core.js` (14-topic taxonomy from the real hero chips + `coOccurringTopics`), unit-tested; `hadith.js` does routing + DOM reusing the existing feed/route machinery; `tier3-deep-view-core.js` gets the honest related copy.

**Tech Stack:** Vanilla ES5 IIFE (matches existing `*-core.js` + `hadith.js`), `node:test`/`assert` run from `worker/`, static HTML/CSS with locked design-system tokens.

**Spec:** `docs/superpowers/specs/2026-07-22-hadith-module-11-topics-design.md`
**Branch:** `feat/hadith-module-11-topics` (already created).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/js/hadith-topics-core.js` | **NEW** — `TOPICS` (14), `topicByKey`/`isTopicKey`, `coOccurringTopics` (UMD `II.hadithTopics`). |
| `worker/test/hadith-topics-core.test.js` | **NEW** — unit tests. |
| `src/js/tier3-deep-view-core.js` | **MODIFY** — honest related copy in `relatedPlaceholderHTML`. |
| `worker/test/tier3-deep-view-core.test.js` | **MODIFY** — assert the honest copy. |
| `hadith.html` | **MODIFY** — load core; "View all topics" href; topic index/landing/rail CSS (locked tokens). |
| `src/js/hadith.js` | **MODIFY** — topic routing, index + landing render, co-occurrence rail, chip switch. |
| `tools/hadith-module11-fixture.html` | **NEW (throwaway)** — screenshot harness for the net-new topic pages. |

---

## Task 1: core — TOPICS taxonomy + lookup (TDD)

**Files:** Create `src/js/hadith-topics-core.js`, `worker/test/hadith-topics-core.test.js`.

- [ ] **Step 1: failing test** — create `worker/test/hadith-topics-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-topics-core.js';

const KEYS = ['faith','prayer','charity','fast','hajj','purification','knowledge',
  'character','marriage','supplication','hereafter','trade','death','justice'];

test('TOPICS: exactly the 14 PRD hero-chip topics, in order', () => {
  assert.equal(core.TOPICS.length, 14);
  assert.deepEqual(core.TOPICS.map(t => t.key), KEYS);
  core.TOPICS.forEach(t => { assert.ok(t.label && t.keyword, 'label+keyword present'); });
});

test('topicByKey / isTopicKey', () => {
  assert.equal(core.topicByKey('prayer').label, 'Prayer (Salah)');
  assert.equal(core.topicByKey('nope'), null);
  assert.equal(core.isTopicKey('hajj'), true);
  assert.equal(core.isTopicKey('xyz'), false);
});
```

- [ ] **Step 2: run → FAIL** — `cd worker && node --test test/hadith-topics-core.test.js` → `Cannot find module`.

- [ ] **Step 3: implement** — create `src/js/hadith-topics-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-topics-core.js  (Module 11)
   Pure taxonomy + co-occurrence logic for the hadith Topic index/landing.
   UMD (window.II.hadithTopics / module.exports). NO DOM/network/storage.
   TOPICS = the 14 real hero-strip chips (PRD US-H06/H14 name only these 14;
   the PRD's "16" is an unresolved gap — 2 topics unnamed, NOT invented here).
   No per-topic counts/collections (no data source — deferred to curation).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var TOPICS = [
    { key: 'faith',        label: 'Faith & Belief',       keyword: 'faith' },
    { key: 'prayer',       label: 'Prayer (Salah)',       keyword: 'prayer' },
    { key: 'charity',      label: 'Charity (Zakat)',      keyword: 'charity' },
    { key: 'fast',         label: 'Fasting (Sawm)',       keyword: 'fast' },
    { key: 'hajj',         label: "Hajj & 'Umrah",        keyword: 'hajj' },
    { key: 'purification', label: 'Purification',         keyword: 'purification' },
    { key: 'knowledge',    label: 'Knowledge & Wisdom',   keyword: 'knowledge' },
    { key: 'character',    label: 'Ethics & Character',   keyword: 'character' },
    { key: 'marriage',     label: 'Family & Marriage',    keyword: 'marriage' },
    { key: 'supplication', label: 'Supplications',        keyword: 'supplication' },
    { key: 'hereafter',    label: 'Afterlife & Judgment', keyword: 'hereafter' },
    { key: 'trade',        label: 'Trade & Finance',      keyword: 'trade' },
    { key: 'death',        label: 'Death & Burial',       keyword: 'death' },
    { key: 'justice',      label: 'Governance & Justice', keyword: 'justice' },
  ];

  var BY_KEY = {};
  TOPICS.forEach(function (t) { BY_KEY[t.key] = t; });

  function topicByKey(key) { return BY_KEY[key] || null; }
  function isTopicKey(key) { return Object.prototype.hasOwnProperty.call(BY_KEY, key); }

  // (coOccurringTopics added in Task 2)

  var core = { TOPICS: TOPICS, topicByKey: topicByKey, isTopicKey: isTopicKey };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithTopics = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: run → PASS** — `cd worker && node --test test/hadith-topics-core.test.js` → 2 tests pass.

- [ ] **Step 5: commit**
```bash
git add src/js/hadith-topics-core.js worker/test/hadith-topics-core.test.js
git commit -m "feat(hadith): Module 11 — 14-topic taxonomy core (PRD hero chips; 16-gap flagged)"
```

---

## Task 2: core — coOccurringTopics (TDD)

**Files:** Modify `src/js/hadith-topics-core.js`, `worker/test/hadith-topics-core.test.js`.

- [ ] **Step 1: append tests:**

```js
const H = (txt) => ({ text: txt });

test('coOccurringTopics: counts other-topic keyword co-occurrence among current-topic hadith', () => {
  // 3 hadith mention "prayer"; of those, 2 also mention "charity", 1 also "fast"
  const loaded = [
    H('prayer and charity'), H('prayer and charity again'),
    H('prayer and fast'), H('unrelated hajj text'),
  ];
  const co = core.coOccurringTopics(loaded, 'prayer', core.TOPICS);
  const charity = co.find(x => x.key === 'charity');
  const fast = co.find(x => x.key === 'fast');
  assert.equal(charity.count, 2);
  assert.equal(fast.count, 1);
  assert.ok(!co.find(x => x.key === 'hajj'), 'hajj not among prayer-matching hadith');
  assert.ok(!co.find(x => x.key === 'prayer'), 'current topic excluded');
  assert.ok(co.indexOf(charity) < co.indexOf(fast), 'sorted by count desc');
});

test('coOccurringTopics: empty when no hadith match the current topic, or blank keyword', () => {
  assert.deepEqual(core.coOccurringTopics([H('only hajj')], 'prayer', core.TOPICS), []);
  assert.deepEqual(core.coOccurringTopics([H('prayer')], '', core.TOPICS), []);
  assert.deepEqual(core.coOccurringTopics([], 'prayer', core.TOPICS), []);
});

test('coOccurringTopics: matching is case-insensitive', () => {
  const co = core.coOccurringTopics([H('PRAYER and CHARITY')], 'prayer', core.TOPICS);
  assert.equal(co.find(x => x.key === 'charity').count, 1);
});
```

- [ ] **Step 2: run → FAIL** (`coOccurringTopics is not a function`).

- [ ] **Step 3: implement** — add before the `var core = {` line, and add `coOccurringTopics: coOccurringTopics,` to exports:

```js
  // Over the loaded hadith whose text contains the current topic's keyword, count how
  // many ALSO contain each OTHER topic's keyword. Returns others with count>=1, sorted
  // count desc then label asc. Matching = case-insensitive substring (same shallow
  // heuristic as the feed's keyword filter — a text signal, NOT a curated relationship).
  function coOccurringTopics(loadedHadith, topicKeyword, topics) {
    topics = topics || TOPICS;
    var kw = String(topicKeyword == null ? '' : topicKeyword).toLowerCase();
    if (!kw) return [];
    var texts = (Array.isArray(loadedHadith) ? loadedHadith : [])
      .map(function (h) { return String((h && h.text) || '').toLowerCase(); })
      .filter(function (t) { return t.indexOf(kw) !== -1; });
    if (!texts.length) return [];
    var out = [];
    topics.forEach(function (t) {
      if (!t || !t.keyword) return;
      var uk = String(t.keyword).toLowerCase();
      if (uk === kw) return;                       // exclude the current topic
      var count = 0;
      texts.forEach(function (txt) { if (txt.indexOf(uk) !== -1) count++; });
      if (count > 0) out.push({ key: t.key, label: t.label, count: count });
    });
    out.sort(function (a, b) {
      return (b.count - a.count) || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0);
    });
    return out;
  }
```

- [ ] **Step 4: run → PASS** — 5 tests total.

- [ ] **Step 5: commit**
```bash
git add src/js/hadith-topics-core.js worker/test/hadith-topics-core.test.js
git commit -m "feat(hadith): Module 11 — keyword co-occurrence signal (pure, labeled non-curated)"
```

---

## Task 3: tier3-deep-view-core — honest related copy (TDD)

**Files:** Modify `src/js/tier3-deep-view-core.js:165-168`, `worker/test/tier3-deep-view-core.test.js`.

- [ ] **Step 1: add test** (append to `worker/test/tier3-deep-view-core.test.js`; it already imports the core as `core`):

```js
test('relatedPlaceholderHTML: honest "unavailable" state, no fabricated relation cards', () => {
  const html = core.relatedPlaceholderHTML();
  assert.ok(html.indexOf('Related Narrations') !== -1);
  assert.ok(/compiled|verified against source chains/i.test(html), 'honest deferral copy');
  // must NOT fabricate the mockup relation labels
  ['Same narrator', 'Parallel narration', 'Scholar commentary', 'Thematically related']
    .forEach(l => assert.ok(html.indexOf(l) === -1, l + ' must not appear'));
});
```

- [ ] **Step 2: run → FAIL** — `cd worker && node --test test/tier3-deep-view-core.test.js` (the honest-copy assertion fails on the current "arrive in a later update" text only if the regex doesn't match — it won't, so it fails).

- [ ] **Step 3: implement** — replace `relatedPlaceholderHTML` (lines 165-168):

```js
  // Honest "unavailable" state (Module 11). No /similar endpoint + no verified
  // similarity/chain data exist, so we render NO relation cards and never fabricate
  // a "same narrator"/"parallel"/"commentary" relationship. Real graph is deferred.
  function relatedPlaceholderHTML() {
    return '<div class="dv-block dv-related"><h2 class="dv-block-title">Related Narrations</h2>' +
           '<div class="dv-empty">Related narrations are being compiled and will appear once verified against source chains.</div></div>';
  }
```

- [ ] **Step 3b: update any existing assertion on the OLD copy** — grep the test file for the previous string and fix it if present:
```bash
grep -n "arrive in a later update" worker/test/tier3-deep-view-core.test.js
```
If it matches, update that assertion to the new honest copy (or the new test supersedes it) so the suite reflects the intended text, not the old placeholder.

- [ ] **Step 4: run → PASS** — that test + the existing suite for the file stay green.

- [ ] **Step 5: commit**
```bash
git add src/js/tier3-deep-view-core.js worker/test/tier3-deep-view-core.test.js
git commit -m "feat(hadith): Module 11 — Tier-3b related-grid honest unavailable state (no fabricated relations)"
```

---

## Task 4: hadith.html — load core, View-all href, CSS

**Files:** Modify `hadith.html`.

- [ ] **Step 1: load the core** — after `<script src="src/js/hadith-actions-core.js"></script>` add:
```html
<script src="src/js/hadith-topics-core.js"></script>
```

- [ ] **Step 2: point "View all topics" at the route** — change the link (currently `href="#"` at ~line 1333):
```html
      <a class="section-action" href="/hadith/topics" data-i18n="hadith.topics.viewAll">View all topics →</a>
```

- [ ] **Step 3: add CSS** — append to the inline `<style>` (locked tokens only; no new colors/hex except `white` on solid teal per the existing pattern):

```css
/* ── Module 11: topic index ── */
.topic-index-head { margin-bottom: 20px; }
.topic-index-sub { color: var(--ink-muted); font-size: 13.5px; margin-top: 6px; max-width: 640px; }
.topic-index-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.topic-card { display: flex; flex-direction: column; gap: 8px; padding: 18px; text-decoration: none;
  background: var(--surface-base); border: 0.5px solid rgba(0,105,110,.14); border-radius: 14px;
  box-shadow: var(--elev-1); transition: transform .18s, box-shadow .18s; }
.topic-card:hover { transform: translateY(-2px); box-shadow: var(--elev-2); }
.topic-card-icon { color: var(--teal-700); }
.topic-card-name { font-weight: 600; font-size: 16px; color: var(--ink-body); }
.topic-card-cta { font-size: 13px; color: var(--teal-700); font-weight: 600; margin-top: 2px; }

/* ── Module 11: topic landing ── */
.topic-landing-head { margin-bottom: 18px; }
.topic-landing-note { color: var(--ink-muted); font-size: 13px; font-style: italic; margin-top: 6px; max-width: 640px; }
.topic-landing-body { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 900px) { .topic-landing-body { grid-template-columns: 1fr 260px; } }
.topic-feed-label { font-size: 12.5px; color: var(--ink-muted); margin-bottom: 14px; }
.topic-feed-loading, .topic-feed-empty { color: var(--ink-muted); font-size: 13.5px; padding: 24px 0; }
.topic-rail { align-self: start; }
.topic-rail-title { font-size: 14px; font-weight: 600; color: var(--teal-700); }
.topic-rail-note { font-size: 11.5px; color: var(--ink-muted); margin: 4px 0 10px; }
.topic-rail-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.topic-rail-list a { color: var(--ink-body); text-decoration: none; font-size: 13.5px; }
.topic-rail-list a:hover { color: var(--teal-700); }
.topic-rail-count { color: var(--ink-subtle); font-size: 12px; margin-left: 6px; }
```

> Grep `:root` in hadith.html first to confirm `--elev-1`/`--elev-2`/`--ink-body`/`--ink-subtle` exist (they do). Substitute nearest existing token if any is missing; never add hex.

- [ ] **Step 4: verify well-formed** — open `hadith.html`, confirm it still parses (feed needs the backend; you're checking markup/CSS/script-load only).

- [ ] **Step 5: commit**
```bash
git add hadith.html
git commit -m "feat(hadith): Module 11 — load topics-core, View-all route, topic index/landing CSS (locked tokens)"
```

---

## Task 5: hadith.js — topic routing + index page

**Files:** Modify `src/js/hadith.js`.

- [ ] **Step 1: reference the core + a text helper** — near the top, after `var actions = II.hadithActions;` add:
```js
  var topics = II.hadithTopics;
  function feedHadithText(h) {
    if (!h) return '';
    return [h.arabicMatn, h.translation && h.translation.text, h.reference,
            h.narrator && h.narrator.name].filter(Boolean).join(' ');
  }
```

- [ ] **Step 2: intercept the topics route** — in `renderRoute`, immediately after the `if (!r.collection) { setTier(1); applyFilter(); return; }` line, add:
```js
    if (r.collection === 'topics') { renderTopics(r.book); return; }   // Module 11
```

- [ ] **Step 3: add the topic index render** — add this block (near `loadBooksGrid`):
```js
  /* ── Module 11: topic index / landing ── */
  var TOPIC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>';
  function topicsBreadcrumb(currentLabel) {
    var crumbs = '<a class="dv-crumb" href="/hadith.html">Hadith</a><span class="dv-crumb-sep" aria-hidden="true">›</span>';
    if (currentLabel) {
      crumbs += '<a class="dv-crumb" href="/hadith/topics">Topics</a><span class="dv-crumb-sep" aria-hidden="true">›</span>' +
                '<span class="dv-crumb dv-crumb-current" aria-current="page">' + esc(currentLabel) + '</span>';
    } else {
      crumbs += '<span class="dv-crumb dv-crumb-current" aria-current="page">Topics</span>';
    }
    return '<nav class="dv-breadcrumb" aria-label="Breadcrumb" style="margin-bottom:12px;">' + crumbs + '</nav>';
  }
  function renderTopics(topicKey) {
    if (topicKey) renderTopicLanding(topicKey);
    else renderTopicIndex();
  }
  function renderTopicIndex() {
    setTier(2);
    var el = tier2El(); if (!el || !topics) return;
    var cards = topics.TOPICS.map(function (t) {
      return '<a class="topic-card" href="/hadith/topics/' + encodeURIComponent(t.key) + '">' +
        '<span class="topic-card-icon">' + TOPIC_ICON + '</span>' +
        '<span class="topic-card-name">' + esc(t.label) + '</span>' +
        '<span class="topic-card-cta">Study this topic →</span></a>';
    }).join('');
    el.innerHTML = topicsBreadcrumb('') +
      '<div class="topic-index-head"><h1 class="collection-header-name">Topics</h1>' +
      '<p class="topic-index-sub">Browse hadith by subject. Curated topic statistics and study aids are being prepared and will appear after review.</p></div>' +
      '<div class="topic-index-grid">' + cards + '</div>';
  }
```

- [ ] **Step 4: `node --check`** — `node --check src/js/hadith.js` → clean. (`renderTopicLanding` lands in Task 6; declaration-hoisted, so syntax is fine.)

- [ ] **Step 5: commit**
```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 11 — topics route intercept + index page (nav-only cards)"
```

---

## Task 6: hadith.js — topic landing (keyword feed + co-occurrence rail)

**Files:** Modify `src/js/hadith.js`.

- [ ] **Step 1: add the landing render** — add after `renderTopicIndex`:
```js
  function renderTopicLanding(key) {
    var t = topics && topics.topicByKey(key);
    if (!t) { try { history.replaceState(null, '', '/hadith/topics'); } catch (_) {} renderTopicIndex(); return; }
    setTier(2);
    var el = tier2El(); if (!el) return;
    el.innerHTML = topicsBreadcrumb(t.label) +
      '<div class="topic-landing-head"><h1 class="collection-header-name">' + esc(t.label) + '</h1>' +
      '<p class="topic-landing-note">Curated study aids for this topic — scholarly summary, key narrations, and study order — are being prepared and will appear after review.</p></div>' +
      '<div class="topic-landing-body">' +
        '<div class="topic-feed">' +
          '<div class="topic-feed-label">Hadith matching “' + esc(t.label) + '” — a keyword match across the loaded hadith, not a curated topic classification.</div>' +
          '<div id="ii-topic-feed-list"></div>' +
        '</div>' +
        '<aside class="topic-rail" id="ii-topic-rail"></aside>' +
      '</div>';
    renderTopicFeed(t);
  }
  function loadedHadithArray() {
    return Object.keys(FEED.byRef).map(function (r) { return FEED.byRef[r]; });
  }
  function renderTopicFeed(t) {
    var listEl = $('#ii-topic-feed-list'); if (!listEl) return;
    var loaded = loadedHadithArray();
    if (!loaded.length) {                                  // direct deep-link before the feed loaded
      listEl.innerHTML = '<div class="topic-feed-loading">Loading hadith…</div>';
      loadHadithFeed(false).then(function () {
        if ($('#ii-topic-feed-list') === listEl) renderTopicFeed(t);   // still on this landing
      });
      return;
    }
    var kw = t.keyword.toLowerCase();
    var matches = loaded.filter(function (h) { return feedHadithText(h).toLowerCase().indexOf(kw) !== -1; });
    if (!matches.length) {
      listEl.innerHTML = '<div class="topic-feed-empty">No matching hadith in the loaded set yet. Full cross-collection topic search arrives with curated topic data.</div>';
    } else {
      listEl.innerHTML = matches.map(feed.buildCardHTML).join('');
      markCardStates(listEl);                              // Module 10 gold dots
    }
    renderTopicRail(t, loaded);
  }
  function renderTopicRail(t, loaded) {
    var rail = $('#ii-topic-rail'); if (!rail || !topics) return;
    var withText = loaded.map(function (h) { return { text: feedHadithText(h) }; });
    var co = topics.coOccurringTopics(withText, t.keyword, topics.TOPICS);
    if (!co.length) { rail.style.display = 'none'; rail.innerHTML = ''; return; }   // honest empty → omit
    rail.style.display = '';
    rail.innerHTML = '<h2 class="topic-rail-title">Also appears in these hadith</h2>' +
      '<p class="topic-rail-note">Topics whose keywords co-occur in the loaded hadith — a text signal over the loaded sample, not a curated relationship.</p>' +
      '<ul class="topic-rail-list">' + co.map(function (x) {
        return '<li><a href="/hadith/topics/' + encodeURIComponent(x.key) + '">' + esc(x.label) +
          '</a><span class="topic-rail-count">' + x.count + '</span></li>';
      }).join('') + '</ul>';
  }
```

- [ ] **Step 2: `node --check`** — clean.

- [ ] **Step 3: commit**
```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 11 — topic landing (keyword feed + real co-occurrence rail, honest empties)"
```

---

## Task 7: hadith.js — chip behavior switch (in-place filter → routing)

**Files:** Modify `src/js/hadith.js` (`wireTopics`).

- [ ] **Step 1: replace `wireTopics`** — the whole function becomes:
```js
  // Module 11: topic chips ROUTE (Stage 3) instead of filtering in-place (Module 5 behavior removed).
  function wireTopics() {
    var chips = document.querySelectorAll('.topics-grid .topic-chip');
    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', 'false');
      function act() {
        var key = chip.getAttribute('data-topic');
        if (key) routeTo({ collection: 'topics', book: key }, true);
      }
      chip.addEventListener('click', act);
      chip.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
  }
```

- [ ] **Step 2: `node --check`** — clean.

- [ ] **Step 3: verify no dangling refs** — grep to confirm nothing else depends on the removed in-place behavior:
```bash
grep -n "topic-chip.*selected\|chip.classList.*selected" src/js/hadith.js || echo "clean — no leftover in-place topic-selected logic"
```
Expected: clean (the `.selected` toggle lived only inside the old `wireTopics`).

- [ ] **Step 4: run full suite** — `cd worker && node --test "test/*.test.js"` → all green (existing + Module 11 core + tier3 test).

- [ ] **Step 5: commit**
```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 11 — topic chips route to /hadith/topics/[topic] (drop in-place filter)"
```

---

## Task 8: fixture + screenshots (visual gate — user sign-off)

The topic index + landing are net-new with no mockup → screenshot for user approval before done (same gate as Module 10).

**Files:** Create `tools/hadith-module11-fixture.html`.

- [ ] **Step 1: build a self-contained fixture** — inline the `:root` token values + dark overrides + the Module 11 CSS (copy from hadith.html), and render: (a) the topic **index** grid (14 `.topic-card`s), (b) a topic **landing** (header + honest note + a couple of sample `.hadith-card`s in the feed area + the co-occurrence rail with 2–3 sample rows). Reuse the light/dark token pattern + `?theme=dark` toggle from `tools/hadith-module10-fixture.html`.

- [ ] **Step 2: screenshot light + dark** — headless Chrome (as in Module 10):
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1.25 --window-size=1200,1400 --screenshot="<scratch>/module11.png" "file:///c:/Users/User/Downloads/IslamicInfo-org/tools/hadith-module11-fixture.html"
```
and again with `...fixture.html?theme=dark`.

- [ ] **Step 3: share both screenshots with the user for sign-off.** Do NOT mark Module 11 done until approved. Adjust CSS + re-shoot if changes requested.

- [ ] **Step 4: commit the fixture**
```bash
git add tools/hadith-module11-fixture.html
git commit -m "chore(hadith): Module 11 — fixture harness for topic index/landing screenshots"
```

---

## Task 9: verification + wrap-up

- [ ] **Step 1: Verification Note (required)** — record: the **14 topics used** (all from the PRD hero-strip chips US-H06/H14) and explicitly flag that the PRD says **"16"** but names only these **14** — the 2 extra are an **unresolved PRD gap, not filled/invented**.

- [ ] **Step 2: full verification**
```bash
node --check src/js/hadith-topics-core.js && node --check src/js/hadith.js && node --check src/js/tier3-deep-view-core.js
cd worker && node --test "test/*.test.js"
```
Expected: clean + all green.

- [ ] **Step 3: manual route check (once backend reachable / on live)** — `/hadith/topics` (14 cards), a chip click → `/hadith/topics/[topic]` (header + labelled feed + rail or honest-omitted rail), a Tier-3b page shows the honest Related Narrations state. (Feed needs the Worker — verify on the live site or note as deferred like other modules.)

- [ ] **Step 4: update memory** — write `hadith-module-11-state.md` (engineering-only slice, honest states, 16-gap flagged, co-occurrence signal, deferred datasets) + MEMORY.md index line.

- [ ] **Step 5: finish the branch** — invoke `superpowers:finishing-a-development-branch` (merge/PR per user).

---

## Verification Note (fill in before done)
- [ ] 14 topics used (list): faith, prayer, charity, fast, hajj, purification, knowledge, character, marriage, supplication, hereafter, trade, death, justice — **all PRD hero-chip sourced.** PRD says "16"; **2 unnamed → gap flagged, not invented.**
- [ ] Co-occurrence rail shows only real ≥1 signals, labeled non-curated; omitted when empty. Result: ______
- [ ] Tier-3b related shows honest unavailable state; no fabricated relation cards. Result: ______
- [ ] Chip routing fully replaces in-place filter. Result: ______
- [ ] Net-new topic pages screenshotted (light+dark) + user-approved. Result: ______
- [ ] `node --test` green. Result: ______
