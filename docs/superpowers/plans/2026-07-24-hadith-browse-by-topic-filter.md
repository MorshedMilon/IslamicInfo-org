# Browse by Topic — corpus-wide in-place filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the 14 "Browse by Topic" pills on `hadith.html` into an accessible, in-place, corpus-wide topic filter (radiogroup + `?topic=` URL state + honest live count + skeleton/empty/error states), replacing the current route-away behavior.

**Architecture:** Pills become a WAI-ARIA `radiogroup`; selecting one runs the existing corpus search (`/api/hadith/search`, no `collection=` → all collections) with the topic's keyword and renders into `#hadith-feed`. State lives in the URL (`?topic=<key>`) and a small module-level `TOPIC` object. Pure logic (keyword mapping, count-copy selection, radio-state derivation) goes in the existing `hadith-topics-core.js` for unit testing; DOM/network orchestration goes in `hadith.js`. A tiny additive Worker change exposes the search `total` so the live count is truthful.

**Tech Stack:** Vanilla ES5-style UMD JS (no build step — ADR-001), Node's built-in `node:test` for unit tests, Cloudflare Worker (`worker/src/hadith.js`), JSON locale files, `II.t()` i18n runtime.

**Design spec:** `docs/superpowers/specs/2026-07-24-hadith-browse-by-topic-filter-design.md`

**Honesty invariant (root CLAUDE.md §3):** No curated topic taxonomy exists. A pill maps to a *keyword*; results are a keyword match across all collections, disclosed in the UI. No fabricated counts/summaries/relationships. The only quantitative claim is the search engine's own `total`.

---

## File Structure

- `worker/src/hadith.js` — `search()` normalizer gains `total`/`lastPage` passthrough (mirrors list handler). Responsibility: search API envelope.
- `worker/test/hadith-router.test.js` — add one assertion for the passthrough.
- `src/js/hadith-topics-core.js` — add pure helpers `topicSearchQuery`, `countKind`, `radioState`. Responsibility: topic taxonomy + pure UI logic. No DOM/network.
- `worker/test/hadith-topics-core.test.js` — add unit tests for the three helpers.
- `src/locales/en.json`, `src/locales/ar.json` — new topic-filter i18n keys (other 8 locales fall back to English via `II.t` fallback / the HTML `aria-label` default).
- `hadith.html` — pill strip → radiogroup markup; new `#ii-topic-status` region; CSS for checked state + empty state.
- `src/js/hadith.js` — topic-filter orchestration: `TOPIC` state, `runTopicFilter`, `selectTopic`/`clearTopicFilter`/`scheduleTopicFilter`, `applyRadioState`, `topicStatus`/`topicEmptyHTML`, `readTopicFromUrl`/`pushTopicUrl`, keyboard nav, rewritten `wireTopics`, `renderRoute` base-branch reconcile, init bootstrap, langchange re-render.

---

## Task 1: Worker — expose search `total`/`lastPage`

**Files:**
- Modify: `worker/src/hadith.js` (the `search()` normalizer, ~line 203)
- Test: `worker/test/hadith-router.test.js`

- [ ] **Step 1: Write the failing test**

Add this test to `worker/test/hadith-router.test.js` (after the existing `search returns normalized results` test near line 141). It reuses the existing `listFetcher`, which already returns `last_page: 1, total: 1`:

```javascript
test('search passes upstream total/lastPage through the envelope', async () => {
  const res = await handleHadith('/api/hadith/search', new URLSearchParams('q=intention'),
    ENV(), ORIGIN, { fetcher: listFetcher });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.total, 1);
  assert.equal(b.data.lastPage, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: FAIL — the new test reports `b.data.total` is `undefined` (normalizer drops it).

- [ ] **Step 3: Write minimal implementation**

In `worker/src/hadith.js`, the `search()` function's normalizer currently reads:

```javascript
      (raw) => ({ results: safeMap(raw.hadiths && raw.hadiths.data, (h) => normalizeHadith(h, { language: lang })),
                  page, query: q }),
```

Change it to add the passthrough (mirrors the list handler at lines ~118/175):

```javascript
      (raw) => ({ results: safeMap(raw.hadiths && raw.hadiths.data, (h) => normalizeHadith(h, { language: lang })),
                  page, query: q,
                  total: (raw.hadiths && raw.hadiths.total) ?? null,
                  lastPage: (raw.hadiths && raw.hadiths.last_page) ?? null }),
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: PASS — all search tests pass, including the new passthrough test.

- [ ] **Step 5: Commit**

```bash
git add worker/src/hadith.js worker/test/hadith-router.test.js
git commit -m "feat(worker): expose total/lastPage in /api/hadith/search envelope

Mirrors the list handler so the client can show a truthful corpus-wide
result count for the Browse-by-Topic filter. Additive; nullable fallback.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Core — pure helpers `topicSearchQuery`, `countKind`, `radioState`

**Files:**
- Modify: `src/js/hadith-topics-core.js`
- Test: `worker/test/hadith-topics-core.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `worker/test/hadith-topics-core.test.js`:

```javascript
test('topicSearchQuery: valid key → keyword, unknown → null', () => {
  assert.equal(core.topicSearchQuery('prayer'), 'prayer');
  assert.equal(core.topicSearchQuery('charity'), 'charity');
  assert.equal(core.topicSearchQuery('nope'), null);
  assert.equal(core.topicSearchQuery(null), null);
});

test('countKind: classifies the live-count copy path', () => {
  assert.equal(core.countKind(0), 'zero');
  assert.equal(core.countKind(1), 'one');
  assert.equal(core.countKind(2), 'many');
  assert.equal(core.countKind(312), 'many');
  assert.equal(core.countKind(null), 'more');      // total unavailable → page-scoped fallback
  assert.equal(core.countKind(undefined), 'more');
  assert.equal(core.countKind(-5), 'more');        // nonsense → safe fallback
});

test('radioState: one checked = tab stop; none checked = first is tab stop', () => {
  const keys = ['faith', 'prayer', 'charity'];

  const active = core.radioState(keys, 'prayer');
  assert.deepEqual(active.checked, { faith: false, prayer: true, charity: false });
  assert.deepEqual(active.tabindex, { faith: -1, prayer: 0, charity: -1 });

  const none = core.radioState(keys, null);
  assert.deepEqual(none.checked, { faith: false, prayer: false, charity: false });
  assert.deepEqual(none.tabindex, { faith: 0, prayer: -1, charity: -1 });

  const bad = core.radioState(keys, 'xyz');   // unknown active behaves like none
  assert.deepEqual(bad.checked, { faith: false, prayer: false, charity: false });
  assert.deepEqual(bad.tabindex, { faith: 0, prayer: -1, charity: -1 });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd worker && node --test test/hadith-topics-core.test.js`
Expected: FAIL — `core.topicSearchQuery is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `src/js/hadith-topics-core.js`, add these three functions after `coOccurringTopics` (before the `var core = {…}` export block):

```javascript
  // Topic key → the English keyword used for the corpus search (topics have no
  // curated taxonomy; keyword is the honest proxy). Unknown key → null.
  function topicSearchQuery(key) {
    var t = topicByKey(key);
    return t ? t.keyword : null;
  }

  // Which live-count copy to show. Number ≥ 0 → 'zero' | 'one' | 'many';
  // null/undefined/negative → 'more' (total unavailable → page-scoped "25+" fallback).
  function countKind(n) {
    if (n == null) return 'more';
    n = Number(n);
    if (!isFinite(n) || n < 0) return 'more';
    if (n === 0) return 'zero';
    if (n === 1) return 'one';
    return 'many';
  }

  // Derive radiogroup state for the pills. `keys` = topic keys in DOM order,
  // `activeKey` = selected key or null. The checked pill is the roving tab stop;
  // when nothing is checked (initial / unknown active), the FIRST pill is the tab stop.
  function radioState(keys, activeKey) {
    keys = Array.isArray(keys) ? keys : [];
    var hasActive = keys.indexOf(activeKey) !== -1;
    var checked = {}, tabindex = {};
    keys.forEach(function (k, i) {
      var on = hasActive && k === activeKey;
      checked[k] = on;
      tabindex[k] = (on || (!hasActive && i === 0)) ? 0 : -1;
    });
    return { checked: checked, tabindex: tabindex };
  }
```

Then extend the export object (the `var core = {…}` block) to include them:

```javascript
  var core = {
    TOPICS: TOPICS, topicByKey: topicByKey, isTopicKey: isTopicKey,
    coOccurringTopics: coOccurringTopics,
    topicSearchQuery: topicSearchQuery, countKind: countKind, radioState: radioState,
  };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd worker && node --test test/hadith-topics-core.test.js`
Expected: PASS — all topics-core tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-topics-core.js worker/test/hadith-topics-core.test.js
git commit -m "feat(hadith): topic-filter pure helpers (query/count/radio-state)

topicSearchQuery, countKind, radioState added to hadith-topics-core for the
in-place Browse-by-Topic filter. Pure, unit-tested, no DOM/network.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: i18n — topic-filter strings (en + ar)

**Files:**
- Modify: `src/locales/en.json`, `src/locales/ar.json`

Other 8 locales intentionally omit these keys and fall back to the English `II.t` fallback string (and the HTML `aria-label` English default) — consistent with the spec §9.

- [ ] **Step 1: Add keys to `src/locales/en.json`**

Add these flat keys alongside the existing `hadith.topics.*` keys (keep them grouped near `"hadith.topics.viewAll"`):

```json
  "hadith.topics.ariaLabel": "Browse hadith by topic",
  "hadith.topics.clear": "Clear",
  "hadith.topics.filteredBy": "Filtered by {topic}",
  "hadith.topics.countOne": "{n} hadith",
  "hadith.topics.countMany": "{n} hadiths",
  "hadith.topics.countMore": "25+ — scroll for more",
  "hadith.topics.empty": "No hadith found for this topic yet",
  "hadith.topics.error": "Search temporarily unavailable — try again",
  "hadith.topics.keywordNote": "Matched by keyword across all collections",
```

- [ ] **Step 2: Add the same keys to `src/locales/ar.json`**

Add alongside the existing Arabic `hadith.topics.*` keys:

```json
  "hadith.topics.ariaLabel": "تصفّح الأحاديث حسب الموضوع",
  "hadith.topics.clear": "مسح",
  "hadith.topics.filteredBy": "مُرشَّح حسب {topic}",
  "hadith.topics.countOne": "{n} حديث",
  "hadith.topics.countMany": "{n} حديثًا",
  "hadith.topics.countMore": "‏25+ — مرّر لعرض المزيد",
  "hadith.topics.empty": "لا توجد أحاديث لهذا الموضوع بعد",
  "hadith.topics.error": "البحث غير متاح مؤقتًا — حاول مرة أخرى",
  "hadith.topics.keywordNote": "مطابقة بالكلمة المفتاحية عبر جميع المجموعات",
```

- [ ] **Step 3: Verify both files are valid JSON**

Run: `node -e "require('./src/locales/en.json'); require('./src/locales/ar.json'); console.log('OK')"`
Expected: prints `OK` (no JSON parse error).

- [ ] **Step 4: Verify the keys resolve**

Run:
```bash
node -e "const en=require('./src/locales/en.json'), ar=require('./src/locales/ar.json'); for (const k of ['hadith.topics.ariaLabel','hadith.topics.filteredBy','hadith.topics.empty','hadith.topics.keywordNote']) { if(!en[k]||!ar[k]) throw new Error('missing '+k); } console.log('all present');"
```
Expected: prints `all present`.

- [ ] **Step 5: Commit**

```bash
git add src/locales/en.json src/locales/ar.json
git commit -m "i18n(hadith): Browse-by-Topic filter strings (en, ar)

aria-label, filteredBy, count copy, empty/error, keyword-match disclosure.
Other locales fall back to English per existing II.t pattern.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: HTML — radiogroup markup + status region + CSS

**Files:**
- Modify: `hadith.html` (pill strip ~lines 1536-1551; topic CSS ~lines 436-447)

- [ ] **Step 1: Convert the pill strip to a radiogroup**

Replace the existing `<div class="topics-grid …" id="topic-index"> … </div>` block (lines ~1536-1551) with this. Note: `role="radiogroup"` + `data-i18n-attr` aria-label; every pill `role="radio" aria-checked="false"`; the first pill `tabindex="0"`, all others `tabindex="-1"`; `featured-topic` removed from `faith`. A status region is added right after the grid.

```html
    <div class="topics-grid fade-up" id="topic-index" role="radiogroup"
         aria-label="Browse hadith by topic" data-i18n-attr="aria-label:hadith.topics.ariaLabel">
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="0"  data-topic="faith"        data-i18n="hadith.topics.faith">Faith &amp; Belief</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="prayer"       data-i18n="hadith.topics.prayer">Prayer (Salah)</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="charity"      data-i18n="hadith.topics.zakat">Charity (Zakat)</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="fast"         data-i18n="hadith.topics.fasting">Fasting (Sawm)</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="hajj"         data-i18n="hadith.topics.hajj">Hajj &amp; 'Umrah</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="purification" data-i18n="hadith.topics.purification">Purification</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="knowledge"    data-i18n="hadith.topics.knowledge">Knowledge &amp; Wisdom</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="character"    data-i18n="hadith.topics.ethics">Ethics &amp; Character</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="marriage"     data-i18n="hadith.topics.family">Family &amp; Marriage</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="supplication" data-i18n="hadith.topics.dua">Supplications</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="hereafter"    data-i18n="hadith.topics.afterlife">Afterlife &amp; Judgment</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="trade"        data-i18n="hadith.topics.trade">Trade &amp; Finance</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="death"        data-i18n="hadith.topics.death">Death &amp; Burial</span>
      <span class="topic-chip" role="radio" aria-checked="false" tabindex="-1" data-topic="justice"      data-i18n="hadith.topics.governance">Governance &amp; Justice</span>
    </div>
    <div id="ii-topic-status" class="topic-status" role="status" aria-live="polite" hidden></div>
```

- [ ] **Step 2: Add CSS for the checked pill, status line, and empty state**

In the `/* ─── TOPIC CHIPS ─── */` block (~line 436), keep the existing `.topic-chip` rules and the existing `.featured-topic` rule (it now expresses the *checked* visual). Add these rules immediately after the existing `[data-theme="dark"] .topic-chip.featured-topic` rule (~line 447):

```css
/* Checked pill = the existing featured-topic visual; keyboard focus ring for a11y */
.topic-chip[aria-checked="true"] { background: var(--teal-700); color: white; border-color: transparent; }
.topic-chip:focus-visible { outline: 2px solid var(--teal-700); outline-offset: 2px; }

/* Topic filter status line (filtered-by + live count + clear + keyword note) */
.topic-status { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 12px;
  margin: -32px 0 28px; font-size: 13px; color: var(--ink-muted); }
.topic-status__label { color: var(--ink-body); font-weight: 500; }
.topic-status__count { color: var(--ink-body); }
.topic-status__note  { flex-basis: 100%; font-size: 12px; color: var(--ink-muted); }
.topic-status__clear { background: none; border: 0; padding: 0; cursor: pointer;
  color: var(--teal-700); font: inherit; text-decoration: underline; }
.topic-status__clear:focus-visible { outline: 2px solid var(--teal-700); outline-offset: 2px; }

/* Genuine empty result — a calm note, deliberately NOT styled like the error card */
.topic-empty { text-align: center; padding: 40px 24px; }
.topic-empty__title { font-family: var(--font-serif); font-size: 18px; color: var(--ink-body); margin-bottom: 6px; }
.topic-empty__hint  { font-size: 13px; color: var(--ink-muted); }
```

Note: the `margin: -32px 0 28px` pulls the status directly under the pills, above the `#hadith-feed`. If the existing `.topics-grid` `margin-bottom` (44px) makes the spacing look off in the browser check (Task 6), adjust the negative top margin then — do not change `.topics-grid`.

- [ ] **Step 3: Verify markup only (no test harness for HTML)**

Run: `node -e "const s=require('fs').readFileSync('hadith.html','utf8'); if(!/role=\"radiogroup\"/.test(s)) throw new Error('no radiogroup'); if((s.match(/role=\"radio\"/g)||[]).length!==14) throw new Error('expected 14 radios'); if(!/id=\"ii-topic-status\"/.test(s)) throw new Error('no status region'); if(/featured-topic[^)]*data-topic=\"faith\"/.test(s)) throw new Error('faith still preselected'); console.log('markup OK');"`
Expected: prints `markup OK`.

- [ ] **Step 4: Commit**

```bash
git add hadith.html
git commit -m "feat(hadith): Browse-by-Topic radiogroup markup + status/empty CSS

14 pills → role=radiogroup/radio + aria-checked, no preselected default,
i18n aria-label; new #ii-topic-status region; checked/focus/empty styling
using locked tokens (no new hex).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: hadith.js — topic-filter orchestration

**Files:**
- Modify: `src/js/hadith.js` (`wireTopics` ~1386-1398; `renderRoute` base branch ~454; init ~1529 & ~1535-1541)

This task has no unit test of its own (DOM/network orchestration; the pure logic is covered by Task 2 and the state transitions are exercised in the Task 6 browser check). Implement it as one cohesive change, then run the full suite to confirm no regressions.

- [ ] **Step 1: Add module-level topic state**

Near the top of the IIFE where other state is declared (right after `var topics = II.hadithTopics;` at line 16), add:

```javascript
  var TOPIC = { active: null, ready: false };   // in-place Browse-by-Topic filter state
  var _topicTimer = null;
```

- [ ] **Step 2: Replace `wireTopics` and add the orchestration helpers**

Replace the entire existing `wireTopics` function (lines ~1386-1398) with the following block (the comment documents the whole-corpus vs book-scoped distinction so the two are never conflated):

```javascript
  /* ── Browse by Topic (US-H06/H14) — Module 11 route-away pills are now an IN-PLACE,
     WHOLE-CORPUS keyword filter. A pill maps to a keyword; selecting it runs the corpus
     search (/api/hadith/search, NO collection= → all collections) and renders into
     #hadith-feed with ?topic= URL state, a truthful live count, and honest empty/error
     states. This is SEPARATE from per-collection book-scoped browsing (sidebar → book →
     chapter walk); the two filtering models are independent and must not be conflated.
     No curated topic taxonomy exists — keyword match is the honest proxy, disclosed in UI. ── */
  function topicChips() { return document.querySelectorAll('.topics-grid .topic-chip'); }
  function topicKeys() {
    return Array.prototype.map.call(topicChips(), function (c) { return c.getAttribute('data-topic'); });
  }
  function topicPill(key) { return document.querySelector('.topics-grid .topic-chip[data-topic="' + key + '"]'); }
  function topicLabelText(key) { var p = topicPill(key); return p ? (p.textContent || '').trim() : key; }
  function readTopicFromUrl() {
    try { return new URLSearchParams(location.search).get('topic'); } catch (_) { return null; }
  }
  function pushTopicUrl(key) {
    try { history.pushState({ topic: key || null }, '',
      location.pathname + (key ? ('?topic=' + encodeURIComponent(key)) : '')); } catch (_) {}
  }

  function applyRadioState(activeKey) {
    if (!topics) return;
    var st = topics.radioState(topicKeys(), activeKey);
    topicChips().forEach(function (c) {
      var k = c.getAttribute('data-topic'), on = !!st.checked[k];
      c.setAttribute('aria-checked', on ? 'true' : 'false');
      c.classList.toggle('featured-topic', on);
      c.setAttribute('tabindex', String(st.tabindex[k]));
    });
  }

  function hideTopicStatus() { var s = $('#ii-topic-status'); if (s) { s.hidden = true; s.innerHTML = ''; } }
  // opts: { key, label, count(number|null|undefined), loading?, error? }
  function topicStatus(opts) {
    var s = $('#ii-topic-status'); if (!s) return;
    var label = II.t('hadith.topics.filteredBy', 'Filtered by {topic}', { topic: opts.label });
    var count = '';
    if (!opts.loading && !opts.error) {
      var kind = topics.countKind(opts.count);
      if (kind === 'one')  count = II.t('hadith.topics.countOne', '{n} hadith', { n: opts.count });
      else if (kind === 'many') count = II.t('hadith.topics.countMany', '{n} hadiths', { n: opts.count });
      else if (kind === 'more') count = II.t('hadith.topics.countMore', '25+ — scroll for more');
      // kind === 'zero' → no count chip; the empty state carries the message
    }
    var note = II.t('hadith.topics.keywordNote', 'Matched by keyword across all collections');
    var clear = II.t('hadith.topics.clear', 'Clear');
    s.innerHTML =
      '<span class="topic-status__label">' + esc(label) + '</span>' +
      (count ? '<span class="topic-status__count">· ' + esc(count) + '</span>' : '') +
      '<button type="button" class="topic-status__clear" id="ii-topic-clear">' + esc(clear) + '</button>' +
      '<span class="topic-status__note">' + esc(note) + '</span>';
    s.hidden = false;
    var btn = $('#ii-topic-clear');
    if (btn) btn.addEventListener('click', function () { clearTopicFilter(true); });
  }

  function topicEmptyHTML() {
    return '<div class="topic-empty" role="note">' +
      '<p class="topic-empty__title">' + esc(II.t('hadith.topics.empty', 'No hadith found for this topic yet')) + '</p>' +
      '<p class="topic-empty__hint">' + esc(II.t('hadith.topics.keywordNote', 'Matched by keyword across all collections')) + '</p>' +
      '</div>';
  }

  // Runs the corpus search for a topic keyword and renders results / empty / error.
  // lang is fixed 'en': topic keywords are English words matched against English text,
  // regardless of the UI language.
  async function runTopicFilter(key) {
    var el = feedEl(); if (!el || !feed || !topics) return;
    var kw = topics.topicSearchQuery(key);
    if (!kw) { clearTopicFilter(false); return; }
    var label = topicLabelText(key);
    FEED.query = '';
    setLoadMore('hide');
    ui.renderLoadingState(el, 3);            // skeleton while the query is in flight
    topicStatus({ key: key, label: label, loading: true });
    var res; try { res = await api.fetchHadithSearch(kw, 'en', 1); } catch (_) { res = null; }
    if (TOPIC.active !== key) return;        // selection changed mid-flight → drop stale response
    if (!res || !res.ok || !res.data || !Array.isArray(res.data.results)) {
      ui.renderErrorState(el, II.t('hadith.topics.error', 'Search temporarily unavailable — try again'),
        function () { runTopicFilter(key); });
      topicStatus({ key: key, label: label, error: true });
      return;
    }
    var results = res.data.results;
    FEED.byRef = {};
    results.forEach(function (h) { var r = feed.refOf(h); if (r) FEED.byRef[r] = h; });
    if (!results.length) {                   // genuine zero — NOT an error
      el.innerHTML = topicEmptyHTML();
      topicStatus({ key: key, label: label, count: 0 });
      return;
    }
    el.innerHTML = results.map(feed.buildCardHTML).join('');
    markCardStates(el);
    applyGradeFilter();
    var total = (typeof res.data.total === 'number') ? res.data.total : null;
    topicStatus({ key: key, label: label, count: total });
  }

  function scheduleTopicFilter(key, delay) {
    if (_topicTimer) { clearTimeout(_topicTimer); _topicTimer = null; }
    if (!delay) { runTopicFilter(key); return; }
    _topicTimer = setTimeout(function () {
      _topicTimer = null; if (TOPIC.active === key) runTopicFilter(key);
    }, delay);
  }

  function selectTopic(key, push, delay) {
    if (!topics || !topics.isTopicKey(key)) return;
    if (push) pushTopicUrl(key);
    TOPIC.active = key;
    applyRadioState(key);
    scheduleTopicFilter(key, delay || 0);
  }

  function clearTopicFilter(push) {
    if (_topicTimer) { clearTimeout(_topicTimer); _topicTimer = null; }
    if (push) pushTopicUrl(null);
    TOPIC.active = null;
    applyRadioState(null);
    hideTopicStatus();
    loadHadithFeed(false);                   // restore the neutral default feed
  }

  function wireTopics() {
    var chips = topicChips();
    applyRadioState(null);                    // no preselected default
    chips.forEach(function (chip, idx) {
      function activate() {
        var key = chip.getAttribute('data-topic');
        if (!key) return;
        if (TOPIC.active === key) clearTopicFilter(true);   // toggle the active pill → neutral
        else selectTopic(key, true, 0);
      }
      chip.addEventListener('click', activate);
      chip.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'Enter' || k === ' ' || k === 'Spacebar') { e.preventDefault(); activate(); return; }
        var dir = (k === 'ArrowRight' || k === 'ArrowDown') ? 1
                : (k === 'ArrowLeft'  || k === 'ArrowUp')   ? -1 : 0;
        var jump = (k === 'Home') ? 'first' : (k === 'End') ? 'last' : null;
        if (!dir && !jump) return;
        e.preventDefault();
        var n = chips.length;
        var next = jump === 'first' ? 0 : jump === 'last' ? n - 1 : (idx + dir + n) % n;
        var nextChip = chips[next], nextKey = nextChip.getAttribute('data-topic');
        selectTopic(nextKey, true, 300);      // radiogroup: arrow moves+selects; debounce the fetch
        nextChip.focus();
      });
    });
    // Re-render the status line (dynamic {topic}/{n} strings) when the language changes.
    document.addEventListener('ii:langchange', function () {
      if (TOPIC.active) topicStatus({ key: TOPIC.active, label: topicLabelText(TOPIC.active), count: TOPIC._lastCount });
    });
  }
```

Also record the last count for the langchange re-render: inside `runTopicFilter`, set `TOPIC._lastCount` wherever `topicStatus({... count ...})` is called with a real value. Add `TOPIC._lastCount = 0;` before the empty-state `topicStatus`, and `TOPIC._lastCount = total;` before the success `topicStatus`. (Loading/error re-renders harmlessly show the last count on language change; acceptable.)

- [ ] **Step 3: Wire `?topic=` reconcile into `renderRoute`'s base branch**

In `renderRoute`, replace the base-route line (line ~454):

```javascript
    if (!r.collection) { setTier(1); applyFilter(); return; }
```

with:

```javascript
    if (!r.collection) {
      setTier(1);
      var tk = readTopicFromUrl();
      if (TOPIC.ready && tk && topics && topics.isTopicKey(tk)) {   // popstate → topic state
        if (TOPIC.active !== tk) selectTopic(tk, false, 0);
        return;
      }
      if (TOPIC.ready && !tk && TOPIC.active) { clearTopicFilter(false); return; }  // popstate → neutral
      applyFilter();
      return;
    }
```

- [ ] **Step 4: Make the init bootstrap topic-aware and set `TOPIC.ready`**

In `init`, replace the bootstrap block (lines ~1535-1541):

```javascript
      var q0; try { q0 = new URLSearchParams(location.search).get('q'); } catch (_) { q0 = null; }
      if (q0 && q0.trim()) {
        var si = $('#hadith-search-input'); if (si) si.value = q0;
        runGlobalHadithSearch(q0);
      } else {
        loadHadithFeed(false);
      }
```

with:

```javascript
      var q0; try { q0 = new URLSearchParams(location.search).get('q'); } catch (_) { q0 = null; }
      var t0 = readTopicFromUrl();
      if (q0 && q0.trim()) {                       // ?q= (hero search) wins over ?topic=
        var si = $('#hadith-search-input'); if (si) si.value = q0;
        runGlobalHadithSearch(q0);
      } else if (t0 && topics && topics.isTopicKey(t0)) {   // deep-link ?topic=<key>
        selectTopic(t0, false, 0);
      } else {
        loadHadithFeed(false);
      }
      TOPIC.ready = true;
```

- [ ] **Step 5: Run the full test suite to confirm no regressions**

Run: `npm test`
Expected: PASS — all existing tests plus the Task 1 & Task 2 additions are green (≥ the current count).

- [ ] **Step 6: Lint-check the changed file parses**

Run: `node -e "require('fs').readFileSync('src/js/hadith.js','utf8'); new Function(require('fs').readFileSync('src/js/hadith.js','utf8')); console.log('parses')"`
Expected: prints `parses` (no SyntaxError). *(This wraps the file in a Function to catch syntax errors without executing it.)*

- [ ] **Step 7: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): in-place corpus Browse-by-Topic filter

wireTopics rewritten from route-away to radiogroup in-place filter over
/api/hadith/search: ?topic= URL state (pushState + popstate reconcile),
truthful live count, skeleton/empty/error states, keyboard radiogroup nav
(arrow=move+select, debounced fetch), toggle-to-clear, langchange re-render.
Whole-corpus scope documented; separate from book-scoped browsing.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Verification — full suite + manual browser smoke (DoD)

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: PASS — full green, no regressions.

- [ ] **Step 2: Manual browser smoke checklist**

Serve the site locally (e.g. `npx serve .` or the project's usual static server) and open `hadith.html`. Confirm each — record pass/fail:

- [ ] On load, **no pill is selected** (none teal-filled) and a neutral default feed renders (not a topic).
- [ ] Clicking **"Charity (Zakat)"** filters the feed, sets the pill checked, URL becomes `…?topic=charity`, status shows *"Filtered by Charity (Zakat) · N hadith · Clear"* + the keyword-match note.
- [ ] A **skeleton** shows while the query is in flight (throttle network to observe).
- [ ] A topic with zero results shows the **empty note** ("No hadith found for this topic yet") — visually distinct from an error (kill the network to compare the two).
- [ ] With the network down, a topic shows the **error state + Try again**, distinct from empty.
- [ ] **Clear** returns to the neutral default feed, unchecks all pills, and drops `?topic=` from the URL.
- [ ] Clicking the **already-selected** pill again clears (toggles) back to neutral.
- [ ] **Deep link**: opening `hadith.html?topic=charity` directly restores the checked pill + filtered results on load.
- [ ] **Back/Forward**: after selecting a topic then Clear, Back re-applies the topic and Forward returns to neutral (feed + pill state stay coherent).
- [ ] **Keyboard**: Tab reaches the group once; Arrow keys move selection through pills (with the debounced fetch); Enter/Space selects; a visible focus ring is present.
- [ ] **RTL**: switch to Arabic — pills wrap into ~2 rows with **no horizontal scroll**; status line reads right-to-left; pill + aria labels are Arabic.
- [ ] **"View all topics →"** still routes to the existing `/hadith/topics` index (unchanged).

- [ ] **Step 3: Screenshot light + dark (optional but recommended)**

Capture the filtered state and the empty state in both themes for the record (no browser-automation tool in this environment — manual). Attach to the branch/PR notes.

- [ ] **Step 4: Final commit (only if Steps 1-2 surfaced fixes)**

```bash
git add -A
git commit -m "fix(hadith): Browse-by-Topic filter — browser smoke fixes

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-review (completed by plan author)

- **Spec coverage:** §2 scope → Task 5 Step 2 comment; §3 honesty/disclosure → Tasks 3, 5 (keywordNote); §4 interaction/no-default/clear/deep-link/popstate → Tasks 4, 5; §5 data flow → Task 5 `runTopicFilter`; §6 live count → Tasks 1, 5; §7 loading/empty/error → Task 5; §8 layout/RTL → Task 4 + Task 6 checks; §9 i18n/Arabic → Task 3 + Task 4 aria-label; §11 files → all tasks; §12 testing → Tasks 1, 2, 6. All covered.
- **Placeholder scan:** none — every code step shows complete code; every command shows expected output.
- **Type/name consistency:** `topicSearchQuery`/`countKind`/`radioState` defined in Task 2 and used in Task 5; `TOPIC`/`_topicTimer`/`selectTopic`/`clearTopicFilter`/`scheduleTopicFilter`/`runTopicFilter`/`applyRadioState`/`topicStatus`/`topicEmptyHTML`/`readTopicFromUrl`/`pushTopicUrl`/`topicLabelText`/`topicChips`/`topicKeys`/`topicPill` all defined and used within Task 5. i18n keys added in Task 3 match those referenced in Task 5. `res.data.total` produced in Task 1 consumed in Task 5.
- **Known deferrals (from spec §13, intentionally not in this plan):** curated topic dataset/counts-by-collection; multi-collection neutral feed; localizing `hadith-topics-core.js` `label:`; aligning landing pages to corpus search.
