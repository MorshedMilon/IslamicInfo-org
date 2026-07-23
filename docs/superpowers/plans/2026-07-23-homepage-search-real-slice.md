# Homepage Search (Real Slice) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage hero search real for the modes with backends — Hadith (real global search, reused on the hadith page), Verify (route + prefill), Mic, a timestamped "continue where you left off" chip, and topic pills — while Qur'an/Dua/All show an honest "coming soon". No fabricated results.

**Architecture:** A new pure core (`home-search-core.js`) holds the tab-dispatch + continue-recency logic (unit-tested). `home.js` wires the homepage DOM to it (tabs, submit dispatch, mic, chip, topic pills). Hadith results are NOT rendered on the homepage — the Hadith tab navigates to `hadith.html?q=`, and `hadith.js` gains a global-search view (reusing `api.fetchHadithSearch` + `feed.buildCardHTML`) shared with its own hero search box. `verify.js` gains a `?claim=` prefill. Both last-viewed writes gain a timestamp.

**Tech Stack:** Vanilla ES5-style browser JS (UMD cores + IIFE page modules), `node --test` from `worker/`.

**Spec:** [docs/superpowers/specs/2026-07-23-homepage-search-real-slice-design.md](../specs/2026-07-23-homepage-search-real-slice-design.md)

**Conventions:** Tests run from `worker/` (`npm test`). Pure cores in `src/js/*-core.js` (UMD), tests in `worker/test/*.test.js` importing `../../src/js/<name>.js`. Commit after each task. No content/authenticity changes.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/js/home-search-core.js` | **New** pure logic: dispatch target per tab, placeholder per mode, continue-chip recency + label | Create |
| `worker/test/home-search-core.test.js` | Unit tests for the core | Create |
| `src/js/home.js` | Homepage wiring | Modify: tabs, submit dispatch, mic, continue chip, topic pills |
| `index.html` | Homepage markup | Modify: ids/data-scope on search + chips, mic id, chip order + default, remove dead inline chip script, add topic-pill row + chip/note containers |
| `src/js/hadith.js` | Hadith page | Modify: `runGlobalHadithSearch(q)` + `?q=` init + wire hero search box to it |
| `src/js/verify.js` | Verify page | Modify: read `?claim=`/`?q=` → prefill `#verifyInput` |
| `src/js/quran.js` | Quran page | Modify: write `ii-quran-last-surah-ts` alongside `ii-quran-last-surah` |
| `src/js/tier3-deep-view.js` | Hadith deep view | Modify: add `ts` + `collectionName` to the last-read write |

---

## Task 1: Pure core — `home-search-core.js`

**Files:**
- Create: `src/js/home-search-core.js`
- Test: `worker/test/home-search-core.test.js`

- [ ] **Step 1: Write the failing tests**

Create `worker/test/home-search-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/home-search-core.js';

test('dispatchTarget: hadith navigates to hadith.html?q=', () => {
  assert.deepEqual(core.dispatchTarget('hadith', ' patience '),
    { kind: 'navigate', url: 'hadith.html?q=patience' });
});

test('dispatchTarget: verify navigates to verify.html?claim=', () => {
  assert.deepEqual(core.dispatchTarget('verify', 'the prophet said X'),
    { kind: 'navigate', url: 'verify.html?claim=the%20prophet%20said%20X' });
});

test('dispatchTarget: coming-soon modes return an honest note (no navigation)', () => {
  ['quran', 'dua', 'all'].forEach(function (m) {
    var r = core.dispatchTarget(m, 'zakat');
    assert.equal(r.kind, 'note');
    assert.match(r.message, /coming soon/i);
  });
});

test('dispatchTarget: empty query is a noop for any mode', () => {
  assert.deepEqual(core.dispatchTarget('hadith', '   '), { kind: 'noop' });
  assert.deepEqual(core.dispatchTarget('verify', ''), { kind: 'noop' });
});

test('placeholderFor: verify differs from search modes', () => {
  assert.match(core.placeholderFor('verify'), /claim/i);
  assert.match(core.placeholderFor('hadith'), /search/i);
});

test('pickContinue: picks the record with the greater timestamp', () => {
  var h = { collectionSlug: 'sunan-nasai', collectionName: "Sunan an-Nasa'i", bookNum: 1, hadithNum: 3234, ts: 200 };
  var q = { surah: 2, ts: 100 };
  var r = core.pickContinue(h, q);
  assert.equal(r.kind, 'hadith');
  assert.equal(r.url, '/hadith/sunan-nasai/1/3234');
  assert.match(r.label, /Sunan an-Nasa'i.*3234/);
});

test('pickContinue: quran wins when newer; label + url correct', () => {
  var h = { collectionSlug: 'sahih-bukhari', bookNum: 1, hadithNum: 5, ts: 100 };
  var q = { surah: 18, ts: 500 };
  var r = core.pickContinue(h, q);
  assert.equal(r.kind, 'quran');
  assert.equal(r.url, 'quran.html');
  assert.match(r.label, /Surah 18/);
});

test('pickContinue: a record missing ts sorts oldest', () => {
  var h = { collectionSlug: 'sahih-muslim', bookNum: 2, hadithNum: 9 };   // no ts
  var q = { surah: 3, ts: 1 };
  assert.equal(core.pickContinue(h, q).kind, 'quran');
});

test('pickContinue: null when neither record exists', () => {
  assert.equal(core.pickContinue(null, null), null);
});

test('pickContinue: hadith label falls back to the slug when no name stored', () => {
  var h = { collectionSlug: 'sahih-bukhari', bookNum: 1, hadithNum: 1, ts: 5 };
  assert.match(core.pickContinue(h, null).label, /sahih-bukhari.*1/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd worker && node --test test/home-search-core.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Create the core**

Create `src/js/home-search-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — home-search-core.js
   Pure logic for the homepage hero search: tab dispatch, per-mode
   placeholder, and continue-chip recency. NO DOM, NO network. UMD
   (window.II.homeSearch in the browser; module.exports in tests).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var COMING_SOON = {
    quran: 'Qur’an search is coming soon — the Hadith tab is live now.',
    dua:   'Dua search is coming soon — the Hadith tab is live now.',
    all:   'Full search across all types is coming soon — the Hadith tab is live now.',
  };

  // Where a submitted query should go, by active tab.
  //   { kind:'navigate', url }   — go to a page
  //   { kind:'note', message }   — show an honest coming-soon note (no results)
  //   { kind:'noop' }            — empty query
  function dispatchTarget(mode, rawQuery) {
    var q = String(rawQuery == null ? '' : rawQuery).trim();
    if (!q) return { kind: 'noop' };
    if (mode === 'hadith') return { kind: 'navigate', url: 'hadith.html?q=' + encodeURIComponent(q) };
    if (mode === 'verify') return { kind: 'navigate', url: 'verify.html?claim=' + encodeURIComponent(q) };
    return { kind: 'note', message: COMING_SOON[mode] || COMING_SOON.all };
  }

  function placeholderFor(mode) {
    return (mode === 'verify')
      ? 'Paste a claim to verify…'
      : 'Search hadiths, narrators, topics, or paste a claim…';
  }

  // Prettify a collection slug when no display name was stored (e.g. "sahih-bukhari").
  function prettySlug(slug) {
    return String(slug || '').split('-').map(function (w) {
      return w ? (w.charAt(0).toUpperCase() + w.slice(1)) : w;
    }).join(' ');
  }

  // Choose the more-recent last-viewed record (hadith vs quran) by `ts`.
  // Returns { kind, url, label } or null when neither exists.
  function pickContinue(hadithRec, quranRec) {
    var hTs = (hadithRec && typeof hadithRec.ts === 'number') ? hadithRec.ts : -1;
    var qTs = (quranRec && typeof quranRec.ts === 'number') ? quranRec.ts : -1;
    var hasH = !!hadithRec, hasQ = !!quranRec;
    if (!hasH && !hasQ) return null;
    var useH = hasH && (!hasQ || hTs >= qTs);
    if (useH) {
      var name = hadithRec.collectionName || prettySlug(hadithRec.collectionSlug);
      return {
        kind: 'hadith',
        url: '/hadith/' + encodeURIComponent(hadithRec.collectionSlug) + '/' +
             encodeURIComponent(hadithRec.bookNum) + '/' + encodeURIComponent(hadithRec.hadithNum),
        label: name + ', Hadith ' + hadithRec.hadithNum,
      };
    }
    return { kind: 'quran', url: 'quran.html', label: 'Surah ' + quranRec.surah };
  }

  var core = { dispatchTarget: dispatchTarget, placeholderFor: placeholderFor, pickContinue: pickContinue, prettySlug: prettySlug };
  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.homeSearch = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd worker && node --test test/home-search-core.test.js`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/js/home-search-core.js worker/test/home-search-core.test.js
git commit -m "feat(home): pure core for homepage search dispatch + continue recency"
```

---

## Task 2: Homepage markup — `index.html`

**Files:** Modify `index.html` (hero search block ~lines 1669-1687; inline chip script ~line 2220; script includes ~line 2375).

- [ ] **Step 1: Update the hero search markup**

Replace the hero search block (the `<form class="searchbar">` … `</div>` scope-chips, ~lines 1670-1686) with (giving stable ids + `data-scope`, Hadith default, real Search button, mic id, and adding a note + chip + topic-pill row):

```html
            <form class="searchbar" id="home-search-form">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="color:var(--ink-muted)"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input type="text" id="home-search-input" placeholder="Search hadiths, narrators, topics, or paste a claim…" aria-label="Search" data-i18n-attr="placeholder:home.hero.searchPh;aria-label:chrome.search.aria" />
              <button type="button" class="icon-btn" id="home-mic-btn" aria-label="Voice search" data-i18n-attr="aria-label:home.hero.voiceAria" style="width:38px;height:38px;border:none;background:transparent;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3"/></svg>
              </button>
              <button type="submit" class="search-go" id="home-search-go" aria-label="Search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            </form>
            <div class="scope-chips" id="home-scope-chips" role="tablist" aria-label="Search type">
              <button class="chip" data-scope="all" role="tab" aria-selected="false" data-i18n="home.chip.all">All</button>
              <button class="chip active" data-scope="hadith" role="tab" aria-selected="true" data-i18n="home.chip.hadith">Hadith</button>
              <button class="chip" data-scope="quran" role="tab" aria-selected="false" data-i18n="home.chip.quran">Qur'an</button>
              <button class="chip" data-scope="dua" role="tab" aria-selected="false" data-i18n="home.chip.dua">Dua</button>
              <button class="chip" data-scope="verify" role="tab" aria-selected="false" data-i18n="home.chip.verify">Verify</button>
            </div>
            <div id="home-search-note" class="home-search-note" role="status" aria-live="polite" hidden></div>
            <div id="home-continue" class="home-continue" hidden></div>
            <div class="home-topics" id="home-topics" aria-label="Browse topics"></div>
```

- [ ] **Step 2: Remove the dead inline chip script**

Find the inline chip script (~line 2220, `document.querySelectorAll('.scope-chips .chip').forEach(c => { … active … })`) and delete that block (home.js now owns chip behavior). Leave the theme-toggle code in that same `<script>` intact — remove ONLY the `.scope-chips .chip` loop.

- [ ] **Step 3: Load the cores before home.js**

In the script includes (~line 2374-2375), add `home-search-core.js` immediately BEFORE `home.js`:

```html
<script src="src/js/api.js"></script>
<script src="src/js/home-search-core.js"></script>
<script src="src/js/home.js"></script>
```

- [ ] **Step 4: Add minimal CSS**

In the homepage `<style>` (near `.scope-chips` ~line 964), add:

```css
.home-search-note { max-width: 620px; margin: 14px auto 0; text-align: center; font-size: 14px; color: var(--ink-muted); }
.home-continue { text-align: center; margin-top: 16px; }
.home-continue a { display: inline-block; padding: 10px 18px; border-radius: 999px; background: var(--surface-2, rgba(0,105,110,.06)); color: var(--teal-700); font-weight: 600; text-decoration: none; }
.home-continue a:hover { text-decoration: underline; }
.home-topics { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 18px; }
.home-topics a { font-size: 13px; padding: 6px 14px; border-radius: 999px; border: 1px solid var(--ink-faint); color: var(--ink-body); text-decoration: none; }
.home-topics a:hover { border-color: var(--teal-700); color: var(--teal-700); }
.home-topics a.home-topics-all { font-weight: 600; color: var(--teal-700); border-color: var(--teal-700); }
```

> If `--surface-2` isn't defined, use the nearest existing surface token used by chips in this file. No raw hex beyond the rgba fallback shown.

- [ ] **Step 5: Verify the page still parses/loads**

Open `index.html` in a browser (or `node -e "require('fs').readFileSync('index.html','utf8')"` for a read sanity check). Confirm no console errors from missing ids yet (home.js not updated until Task 3). Visual check deferred.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(home): hero search markup — ids, data-scope tabs, mic, continue + topics containers"
```

---

## Task 3: Homepage wiring — `home.js` (tabs, dispatch, mic, continue chip, topics)

**Files:** Modify `src/js/home.js`. Also modify the timestamped writes: `src/js/quran.js`, `src/js/tier3-deep-view.js`.

- [ ] **Step 1: Add timestamps to the last-viewed writes**

In `src/js/quran.js` (~line 158), change:
```js
    localStorage.setItem('ii-quran-last-surah', surahNumber);
```
to:
```js
    localStorage.setItem('ii-quran-last-surah', surahNumber);
    try { localStorage.setItem('ii-quran-last-surah-ts', String(Date.now())); } catch (_) {}
```

In `src/js/tier3-deep-view.js`, find the deep-view last-read write:
```js
      host.ui.safeLocalStorageSet('islamicinfo-hadith-last-read', { collectionSlug: slug, bookNum: book, hadithNum: num });
```
and change it to include a timestamp + collection name (the deep view has the collection object `c`):
```js
      host.ui.safeLocalStorageSet('islamicinfo-hadith-last-read', { collectionSlug: slug, bookNum: book, hadithNum: num, collectionName: (c && c.nameEnglish) || null, ts: Date.now() });
```
> Verify `c` (the collection) is in scope at that write site; if the variable has a different name there, use it. If no collection object is available, set `collectionName: null` (the chip falls back to the slug).

- [ ] **Step 2: Add the search wiring to `home.js`**

In `src/js/home.js`, inside the IIFE (after the existing helpers, before the `Boot` block's `DOMContentLoaded`), add:

```js
  /* ─── Hero search (real slice) ───────────────────────────────── */
  var core = window.II && window.II.homeSearch;

  var HOME_TOPICS = [
    { key: 'salah', label: 'Salah' }, { key: 'zakat', label: 'Zakat' },
    { key: 'fasting', label: 'Fasting' }, { key: 'hajj', label: 'Hajj' },
    { key: 'charity', label: 'Charity' }, { key: 'patience', label: 'Patience' },
  ];

  function currentMode() {
    var active = document.querySelector('#home-scope-chips .chip.active');
    return (active && active.getAttribute('data-scope')) || 'hadith';
  }

  function showNote(msg) {
    var note = document.getElementById('home-search-note');
    if (!note) return;
    note.textContent = msg || '';
    note.hidden = !msg;
  }

  function submitSearch() {
    if (!core) return;
    var input = document.getElementById('home-search-input');
    var res = core.dispatchTarget(currentMode(), input ? input.value : '');
    if (res.kind === 'navigate') { window.location.assign(res.url); }
    else if (res.kind === 'note') { showNote(res.message); }
    else if (input) { input.focus(); }   // noop → focus
  }

  function wireTabs() {
    var chips = document.querySelectorAll('#home-scope-chips .chip');
    var input = document.getElementById('home-search-input');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
        chip.classList.add('active'); chip.setAttribute('aria-selected', 'true');
        showNote('');   // clear any coming-soon note on tab change
        if (input && core) input.placeholder = core.placeholderFor(chip.getAttribute('data-scope'));
      });
    });
  }

  function wireForm() {
    var form = document.getElementById('home-search-form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); submitSearch(); });
  }

  function wireMic() {
    var mic = document.getElementById('home-mic-btn'), input = document.getElementById('home-search-input');
    if (!mic) return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { mic.addEventListener('click', function () { showNote('Voice search isn’t supported in this browser.'); }); return; }
    mic.addEventListener('click', function () {
      try {
        var rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
        mic.classList.add('listening');
        rec.onresult = function (ev) { var txt = ev.results[0][0].transcript; if (input) { input.value = txt; submitSearch(); } };
        rec.onerror = function () { showNote('Voice search didn’t catch that.'); };
        rec.onend = function () { mic.classList.remove('listening'); };
        rec.start();
      } catch (_) { mic.classList.remove('listening'); }
    });
  }

  function renderContinue() {
    var el = document.getElementById('home-continue'); if (!el || !core) return;
    var h = null, q = null;
    try { h = JSON.parse(localStorage.getItem('islamicinfo-hadith-last-read') || 'null'); } catch (_) { h = null; }
    var surah = null, qts = null;
    try { surah = localStorage.getItem('ii-quran-last-surah'); qts = localStorage.getItem('ii-quran-last-surah-ts'); } catch (_) {}
    if (surah) q = { surah: parseInt(surah, 10), ts: qts ? parseInt(qts, 10) : -1 };
    var pick = core.pickContinue(h, q);
    if (!pick) { el.hidden = true; return; }
    el.innerHTML = '<a href="' + pick.url + '">Continue where you left off → ' + escapeHTML(pick.label) + '</a>';
    el.hidden = false;
  }

  function renderTopics() {
    var el = document.getElementById('home-topics'); if (!el) return;
    var pills = HOME_TOPICS.map(function (t) {
      return '<a href="/hadith/topics/' + encodeURIComponent(t.key) + '">' + escapeHTML(t.label) + '</a>';
    }).join('');
    el.innerHTML = pills + '<a class="home-topics-all" href="/hadith/topics">View all topics →</a>';
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function initHomeSearch() {
    if (!core) { console.error('[home.js] home-search-core not loaded'); return; }
    var input = document.getElementById('home-search-input');
    if (input) input.placeholder = core.placeholderFor(currentMode());   // Hadith default
    wireTabs(); wireForm(); wireMic(); renderContinue(); renderTopics();
  }
```

- [ ] **Step 3: Call it on boot**

In the `DOMContentLoaded` handler (the Boot block), add `initHomeSearch();` alongside `loadVerse(); loadHadith();`:
```js
  document.addEventListener('DOMContentLoaded', () => {
    loadVerse();
    loadHadith();
    initHomeSearch();
    document.addEventListener('ii:langchange', () => { loadVerse(); loadHadith(); });
  });
```

- [ ] **Step 4: Parse checks**

Run:
```bash
node -e "new Function(require('fs').readFileSync('src/js/home.js','utf8')); console.log('home OK')"
node -e "new Function(require('fs').readFileSync('src/js/quran.js','utf8')); console.log('quran OK')"
node -e "new Function(require('fs').readFileSync('src/js/tier3-deep-view.js','utf8')); console.log('tier3 OK')"
```
Expected: three `… OK` lines.

- [ ] **Step 5: Full test suite (no regressions)**

Run: `cd worker && node --test "test/*.test.js"`
Expected: all pass (previous 450 + the new home-search-core tests).

- [ ] **Step 6: Commit**

```bash
git add src/js/home.js src/js/quran.js src/js/tier3-deep-view.js
git commit -m "feat(home): wire hero search — tabs, dispatch, mic, continue chip (timestamped), topics"
```

---

## Task 4: Hadith global search — `hadith.js` (the reuse)

**Files:** Modify `src/js/hadith.js` (`wireSearch` ~lines 1280-1318; the init/boot block; add `runGlobalHadithSearch`).

> Reuses `api.fetchHadithSearch(q)` (global, no collection) + `feed.buildCardHTML` + the existing `#hadith-feed` container and `wireFeedActions` card routing. Replaces the hero search's client-side substring stub with the real API.

- [ ] **Step 1: Add `runGlobalHadithSearch`**

In `src/js/hadith.js`, near `loadHadithFeed` / the feed helpers, add:

```js
  // Global hadith search (US-H07 real): runs /api/hadith/search and renders results
  // into the feed area with the existing card renderer. Shared by the hero search box
  // and the homepage (hadith.html?q=). Never fabricates; honest empty/error states.
  async function runGlobalHadithSearch(q) {
    var el = feedEl(); if (!el || !feed) return;
    q = (q || '').trim(); if (!q) return;
    FEED.query = q;
    setLoadMore('hide');
    ui.renderLoadingState(el, 3); feedStatus('Searching “' + q + '”…');
    var res; try { res = await api.fetchHadithSearch(q, 'en', 1); } catch (_) { res = null; }
    if (!res || !res.ok || !res.data || !Array.isArray(res.data.results)) {
      ui.renderErrorState(el, 'Search temporarily unavailable — try again', function () { runGlobalHadithSearch(q); });
      return;
    }
    var results = res.data.results;
    FEED.byRef = {};
    results.forEach(function (h) { var r = feed.refOf(h); if (r) FEED.byRef[r] = h; });
    if (!results.length) {
      el.innerHTML = '<div class="hadith-card"><div class="hadith-inner" style="text-align:center;padding:32px;color:var(--ink-muted);">No results for “' + esc(q) + '”.</div></div>';
      feedStatus('No results for “' + q + '”.');
      return;
    }
    el.innerHTML = results.map(feed.buildCardHTML).join('');
    markCardStates(el);
    feedStatus(results.length + ' result' + (results.length === 1 ? '' : 's') + ' for “' + q + '”');
  }
```
> Confirm `esc`, `feedEl`, `feedStatus`, `markCardStates`, `ui`, `api`, `feed`, `FEED`, `setLoadMore` are all in scope in `hadith.js` (they are, per the existing feed code). If `esc` isn't defined at that scope, use `ui.escapeHTML`.

- [ ] **Step 2: Wire the hero search box to it (replace the substring stub)**

In `wireSearch` (~lines 1280-1287), replace the input/submit handlers that call `setSearchQuery(...)` with the real global search:

```js
  function wireSearch() {
    var input = $('#hadith-search-input'), submit = $('#hadith-search-submit'), mic = $('#hadith-mic-btn');
    function run() { if (input && input.value.trim()) { runGlobalHadithSearch(input.value); scrollFeed(); } }
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    if (submit) submit.addEventListener('click', function () { run(); });
```
Keep the rest of `wireSearch` (the mic block and the `.scope-chips` visual block) unchanged below this. (The old `input` 200ms debounce `setSearchQuery` stub is removed.) Update the mic's `onresult` to call `run()` instead of `setSearchQuery(txt); scrollFeed();`:
```js
            rec.onresult = function (ev) { var txt = ev.results[0][0].transcript; if (input) { input.value = txt; run(); } };
```

- [ ] **Step 3: Handle `?q=` on init**

Find the hadith init/boot (the block that wires the feed, ~line 1466, `if (feed) { … loadHadithFeed(false); }`). Change it so a `?q=` query runs the global search instead of the default feed:

```js
    if (feed) {
      FEED.filter = readGradeFromUrl(); wireGradeFilter(); wireLoadMore(); wireFeedActions();
      wireCardActions(); wireCompareDrawer(); wireTranslationTabs(); wireSearch();
      var q0; try { q0 = new URLSearchParams(location.search).get('q'); } catch (_) { q0 = null; }
      if (q0 && q0.trim()) {
        var si = $('#hadith-search-input'); if (si) si.value = q0;
        runGlobalHadithSearch(q0);
      } else {
        loadHadithFeed(false);
      }
    }
```
> Only add the `q0` branch + `wireSearch()` call if they aren't already present; keep every other wiring call in that block exactly as-is. Confirm the exact current contents of that init block before editing and preserve all existing calls.

- [ ] **Step 4: Parse check + tests**

Run:
```bash
node -e "new Function(require('fs').readFileSync('src/js/hadith.js','utf8')); console.log('hadith OK')"
cd worker && node --test "test/*.test.js"
```
Expected: `hadith OK`; all tests pass.

- [ ] **Step 5: Manual verification**

Load `hadith.html?q=zakat`: the feed area shows real search results (cards with grade badges), status "N results for 'zakat'". The hadith page's own hero search box, on Enter, runs the same global search. Empty query → default feed. Console: no errors. (Live browser sign-off deferred.)

- [ ] **Step 6: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): real global search (api.fetchHadithSearch) via hero box + ?q= — replaces feed substring stub"
```

---

## Task 5: Verify prefill — `verify.js`

**Files:** Modify `src/js/verify.js`.

- [ ] **Step 1: Add the prefill on boot**

In `src/js/verify.js`, inside the IIFE, find the `DOMContentLoaded` / init that wires `#verifyInput`/`#verifyBtn`. Add a prefill that runs on load (do NOT auto-submit):

```js
  function prefillFromQuery() {
    var claim = null;
    try {
      var p = new URLSearchParams(location.search);
      claim = p.get('claim') || p.get('q');
    } catch (_) { claim = null; }
    if (!claim) return;
    var input = document.getElementById('verifyInput');
    if (input) { input.value = claim; input.focus(); }
  }
```
Call `prefillFromQuery();` from the existing boot handler (e.g. inside the `DOMContentLoaded` callback, after the input is present). If there is no boot handler yet, add:
```js
  document.addEventListener('DOMContentLoaded', prefillFromQuery);
```
> Confirm the input id is `#verifyInput` (per verify.js's header comment) before editing; adjust if the actual id differs.

- [ ] **Step 2: Parse check**

Run: `node -e "new Function(require('fs').readFileSync('src/js/verify.js','utf8')); console.log('verify OK')"`
Expected: `verify OK`.

- [ ] **Step 3: Manual verification**

Load `verify.html?claim=the%20prophet%20said%20x`: the claim input is populated and focused; the engine is NOT auto-run (user triggers it). Console: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/js/verify.js
git commit -m "feat(verify): prefill the claim input from ?claim= (no auto-submit)"
```

---

## Task 6: Full regression + wrap-up

- [ ] **Step 1: Run the whole suite**

Run: `cd worker && node --test "test/*.test.js"`
Expected: all pass (450 prior + new home-search-core tests, none regressed).

- [ ] **Step 2: Cross-page manual smoke**

- Homepage: default tab Hadith; type "zakat" + Enter → lands on `hadith.html?q=zakat` with real results. Switch to Qur'an/Dua/All → honest coming-soon note (no results). Switch to Verify → placeholder changes; submit → `verify.html?claim=…` prefilled. Mic fills input (if supported). Continue chip shows the most-recent last-viewed (open a hadith and a surah in different orders to confirm the timestamp tiebreak), hidden when localStorage is cleared. Topic pills link to `/hadith/topics/<key>`; "View all topics" → `/hadith/topics`.
- Confirm no console errors on `index.html`, `hadith.html?q=…`, `verify.html?claim=…`.

- [ ] **Step 3: Update the spec DoD**

Check off the verified items in the spec §7; mark live-browser items as human-sign-off-pending.

- [ ] **Step 4: Commit + offer the branch**

```bash
git add docs/superpowers/specs/2026-07-23-homepage-search-real-slice-design.md
git commit -m "docs(home): record homepage-search verification status"
```
Summarize what shipped on `feat/homepage-search-real-slice` and ask the owner how to finish (merge / PR). No push without the owner's go-ahead.

---

## Self-Review Notes (for the executor)

- **Spec coverage:** tab dispatch + coming-soon (Task 1,3) · Hadith real search reused on the hadith page (Task 4) · Verify route+prefill (Task 1 dispatch, Task 5 prefill) · mic (Task 3) · timestamped continue chip (Task 1 core, Task 3 writes+render) · topic pills (Task 2,3). Qur'an/Dua/All honesty = coming-soon note (Task 1).
- **Type consistency:** `dispatchTarget` returns `{kind:'navigate'|'note'|'noop', url?/message?}`; `pickContinue` returns `{kind:'hadith'|'quran', url, label}` or `null` — used identically in `home.js`.
- **No content/authenticity change:** hadith results render via `feed.buildCardHTML`; coming-soon modes never fabricate; the Verify engine is untouched (prefill only).
