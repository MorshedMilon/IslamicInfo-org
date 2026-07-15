# Module 3 — Audio Playback, Reciter Picker, Word-Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the locked page's `SYNC_DATA` audio simulation with a real `<audio>` engine — per-ayah streaming from Quran.com, a live reciter picker, and real `.ayah-playing`/`.word-active` word-sync from API segment timestamps — behind a pluggable `AudioSource` so the QUL module can swap the data source later.

**Architecture:** Static site + vanilla JS. Pure DOM-free logic in UMD `quran-audio-core.js` (unit-tested); engine `quran-audio.js` holds one hidden `<audio>`, a `QuranComAudioSource`, and overrides the locked inline audio globals. Client-direct keyless fetch to `api.quran.com`; no DB, no `/api/` route.

**Tech Stack:** ES5-safe browser JS, Node `node:test`, Quran.com API v4, `localStorage`.

**Spec:** `doc/superpowers/specs/2026-07-15-quran-module3-audio-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/data/reciters.json` (NEW) | Real 12-reciter seed from `/resources/recitations` |
| `src/js/quran-audio-core.js` (NEW) | Pure: URL/segment normalize, activeWordAt, formatTime, cache keys, isFresh. UMD. |
| `src/js/quran-audio.js` (NEW) | Engine + `QuranComAudioSource` + global overrides |
| `tests/quran/audio-core.test.js` (NEW) | `node:test` |
| `quran.html` (MODIFY) | 2 `<script>` includes only |
| `DATA.md` (MODIFY) | Register 3 keys + `Reciter`/`AyahAudio` shapes |

**Interfaces (identical across tasks):** core exports (`window.II.audioCore` / Node): `normalizeAudioUrl(url,base?)`, `normalizeSegments(raw)`, `activeWordAt(segments,ms)`, `formatTime(sec)`, `recitersCacheKey()`, `audioCacheKey(surah,reciter)`, `isFresh(fetchedAt,now,maxAge?)`. `AudioSource`: `listReciters()→Reciter[]`, `getSurahAudio(reciterId,surahId)→AyahAudio[]`. `Reciter={id,name,style}`. `AyahAudio={verse_key,url,segments:{word,start,end}[]}`.

---

## Task 1: Reciter seed

**Files:** Create `src/data/reciters.json`

- [ ] **Step 1: Fetch + save (real API data)**
```bash
node -e '
const https=require("https");
https.get("https://api.quran.com/api/v4/resources/recitations?language=en",r=>{let b="";r.on("data",d=>b+=d);r.on("end",()=>{
  const list=JSON.parse(b).recitations.map(x=>({id:x.id,name:x.reciter_name,style:x.style||""}));
  require("fs").writeFileSync("src/data/reciters.json",JSON.stringify(list,null,2));
  console.log("wrote",list.length,"reciters");
});}).on("error",e=>{console.error(e.message);process.exit(1);});'
```
Expected: `wrote 12 reciters` (±). If network unavailable → BLOCKED (don't hand-write).

- [ ] **Step 2: Verify**
```bash
node -e 'const r=require("./src/data/reciters.json");const a=require("assert");a.ok(r.length>=10);r.forEach(x=>{a.ok(typeof x.id==="number"&&x.name);});a.ok(r.some(x=>/Alafasy|Afasy/i.test(x.name)));console.log("reciters OK",r.length);'
```

- [ ] **Step 3: Commit**
```bash
git add src/data/reciters.json
git commit -m "feat(quran): add reciter seed from Quran.com recitations"
```

---

## Task 2: Pure core (TDD)

**Files:** Create `src/js/quran-audio-core.js`, `tests/quran/audio-core.test.js`

- [ ] **Step 1: Failing tests** — create `tests/quran/audio-core.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-audio-core.js');

test('normalizeAudioUrl: relative, protocol-relative, absolute', () => {
  assert.equal(core.normalizeAudioUrl('Alafasy/mp3/001001.mp3'),
    'https://audio.qurancdn.com/Alafasy/mp3/001001.mp3');
  assert.equal(core.normalizeAudioUrl('//mirrors.quranicaudio.com/x/001001.mp3'),
    'https://mirrors.quranicaudio.com/x/001001.mp3');
  assert.equal(core.normalizeAudioUrl('https://a.com/b.mp3'), 'https://a.com/b.mp3');
  assert.equal(core.normalizeAudioUrl('/Alafasy/1.mp3', 'https://cdn/'), 'https://cdn/Alafasy/1.mp3');
});

test('normalizeSegments: Quran.com 4-tuple and QUL 3-tuple', () => {
  assert.deepEqual(core.normalizeSegments([[0,1,60,610],[1,2,620,1310]]),
    [{word:1,start:60,end:610},{word:2,start:620,end:1310}]);
  assert.deepEqual(core.normalizeSegments([[1,0,960],[2,970,1420]]),
    [{word:1,start:0,end:960},{word:2,start:970,end:1420}]);
  assert.deepEqual(core.normalizeSegments(null), []);
});

test('activeWordAt: in-range, boundary, gap', () => {
  const s = [{word:1,start:60,end:610},{word:2,start:620,end:1310}];
  assert.equal(core.activeWordAt(s, 60), 1);
  assert.equal(core.activeWordAt(s, 700), 2);
  assert.equal(core.activeWordAt(s, 615), -1); // gap
  assert.equal(core.activeWordAt(s, 1310), -1); // end exclusive
  assert.equal(core.activeWordAt([], 100), -1);
});

test('formatTime', () => {
  assert.equal(core.formatTime(0), '0:00');
  assert.equal(core.formatTime(65), '1:05');
  assert.equal(core.formatTime(600), '10:00');
  assert.equal(core.formatTime(NaN), '0:00');
  assert.equal(core.formatTime(-5), '0:00');
});

test('cache keys + isFresh (7d)', () => {
  assert.equal(core.recitersCacheKey(), 'ii-reciters');
  assert.equal(core.audioCacheKey(2, 7), 'ii-audio-2-7');
  const now = 1e12;
  assert.equal(core.isFresh(now - 6*86400e3, now), true);
  assert.equal(core.isFresh(now - 8*86400e3, now), false);
  assert.equal(core.isFresh(undefined, now), false);
});
```

- [ ] **Step 2: Run — expect FAIL**: `node --test tests/quran/audio-core.test.js`

- [ ] **Step 3: Create `src/js/quran-audio-core.js`:**
```js
/* IslamicInfo.org — quran-audio-core.js
   Pure, DOM-free audio helpers. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.audioCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function normalizeAudioUrl(url, base) {
    base = base || 'https://audio.qurancdn.com/';
    url = String(url == null ? '' : url);
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf('//') === 0) return 'https:' + url;
    return base + url.replace(/^\//, '');
  }

  function normalizeSegments(raw) {
    return (raw || []).map(function (s) {
      if (!Array.isArray(s)) return null;
      if (s.length >= 4) return { word: s[1], start: s[2], end: s[3] };
      if (s.length === 3) return { word: s[0], start: s[1], end: s[2] };
      return null;
    }).filter(Boolean);
  }

  function activeWordAt(segments, ms) {
    var s = segments || [];
    for (var i = 0; i < s.length; i++) { if (ms >= s[i].start && ms < s[i].end) return s[i].word; }
    return -1;
  }

  function formatTime(sec) {
    sec = Number(sec); if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function recitersCacheKey() { return 'ii-reciters'; }
  function audioCacheKey(surahId, reciterId) { return 'ii-audio-' + surahId + '-' + reciterId; }
  function isFresh(fetchedAt, now, maxAgeMs) {
    if (typeof maxAgeMs !== 'number') maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    return typeof fetchedAt === 'number' && (now - fetchedAt) < maxAgeMs;
  }

  return { normalizeAudioUrl, normalizeSegments, activeWordAt, formatTime,
           recitersCacheKey, audioCacheKey, isFresh };
});
```

- [ ] **Step 4: Run — expect PASS** (5 tests): `node --test tests/quran/audio-core.test.js`

- [ ] **Step 5: Commit**
```bash
git add src/js/quran-audio-core.js tests/quran/audio-core.test.js
git commit -m "feat(quran): tested pure core for audio (url/segment normalize, word-at, cache)"
```

---

## Task 3: Register keys + shapes

**Files:** Modify `doc/DATA.md`

- [ ] **Step 1: Add 3 key rows** — in §1 after the `ii-verses-{surah}-{edition}` row:
```
| `ii-quran-reciter` | string (reciter id) | Quran Explorer | Until user changes |
| `ii-reciters` | `{ fetchedAt:number, data:Reciter[] }` (JSON) | Quran Explorer | 7 days |
| `ii-audio-{surah}-{reciter}` | `{ fetchedAt:number, ayahs:AyahAudio[] }` (JSON) | Quran Explorer | 7 days |
```

- [ ] **Step 2: Add shapes** — in §2 after the `Verse` line:
```
Reciter        = { id: number; name: string; style: string }
AyahAudio      = { verse_key: string; url: string; segments: { word: number; start: number; end: number }[] }
```

- [ ] **Step 3: Commit**
```bash
git add doc/DATA.md
git commit -m "docs(quran): register audio keys (reciter/reciters/audio) + shapes"
```

---

## Task 4: Audio engine

**Files:** Create `src/js/quran-audio.js`

- [ ] **Step 1: Create `src/js/quran-audio.js`:**
```js
/* IslamicInfo.org — quran-audio.js
   Real <audio> engine (Module 3): per-ayah streaming, reciter picker, word-sync.
   Depends on: window.II.audioCore (quran-audio-core.js). Overrides the locked
   inline SYNC_DATA simulation globals. Data via pluggable AudioSource. */
(function () {
  'use strict';

  var core = window.II && window.II.audioCore;
  var RECITERS_URL = 'https://api.quran.com/api/v4/resources/recitations?language=en';
  var VERSES_URL   = 'https://api.quran.com/api/v4/verses/by_chapter/';
  var SEED_RECITERS = 'src/data/reciters.json';
  var SPEEDS = [1, 1.25, 1.5, 2];

  // ---- cache ----
  function readCache(k) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { try { localStorage.removeItem(k); } catch (_) {} return null; } }
  function writeCache(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---- pluggable source: Quran.com ----
  function QuranComAudioSource() {}
  QuranComAudioSource.prototype.listReciters = function () {
    var key = core.recitersCacheKey();
    var c = readCache(key);
    if (c && Array.isArray(c.data) && core.isFresh(c.fetchedAt, Date.now())) return Promise.resolve(c.data);
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(RECITERS_URL, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var list = (j.recitations || []).map(function (x) { return { id: x.id, name: x.reciter_name, style: x.style || '' }; });
        if (!list.length) throw new Error('empty');
        writeCache(key, { fetchedAt: Date.now(), data: list });
        return list;
      })
      .catch(function (e) {
        console.warn('[quran] reciters API failed, using seed:', e && e.message);
        return fetch(SEED_RECITERS).then(function (r) { return r.json(); });
      })
      .finally(function () { clearTimeout(t); });
  };
  QuranComAudioSource.prototype.getSurahAudio = function (reciterId, surahId) {
    var key = core.audioCacheKey(surahId, reciterId);
    var c = readCache(key);
    if (c && Array.isArray(c.ayahs) && core.isFresh(c.fetchedAt, Date.now())) return Promise.resolve(c.ayahs);
    return fetchPage(reciterId, surahId, 1).then(function (first) {
      var total = (first.pagination && first.pagination.total_pages) || 1;
      var verses = (first.verses || []).slice();
      if (total <= 1) return finish(key, verses);
      var rest = []; for (var p = 2; p <= total; p++) rest.push(fetchPage(reciterId, surahId, p));
      return Promise.all(rest).then(function (pages) { pages.forEach(function (pg) { verses = verses.concat(pg.verses || []); }); return finish(key, verses); });
    });
  };
  function fetchPage(reciterId, surahId, page) {
    var url = VERSES_URL + surahId + '?audio=' + reciterId + '&fields=text_uthmani&words=false&per_page=50&page=' + page;
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }
  function finish(key, verses) {
    var ayahs = verses.filter(function (v) { return v.audio; }).map(function (v) {
      return { verse_key: v.verse_key, url: core.normalizeAudioUrl(v.audio.url), segments: core.normalizeSegments(v.audio.segments) };
    });
    writeCache(key, { fetchedAt: Date.now(), ayahs: ayahs });
    return ayahs;
  }

  // ---- state ----
  var source = new QuranComAudioSource();
  var audio = null, reciters = [], reciterId = 7;
  var loadedSurah = null, loadedReciter = null, ayahs = [], idx = 0;
  var repeat = false, autoplay = true, speedIdx = 0;

  function $(s) { return document.querySelector(s); }
  function setText(sel, txt) { var el = $(sel); if (el) el.textContent = txt; }
  function toast(m) { if (window.showToast) window.showToast(m); }
  function reciterFull(id) { var r = reciters.filter(function (x) { return x.id === id; })[0]; return r ? r.name : ('Reciter ' + id); }
  function reciterStyled(id) { var r = reciters.filter(function (x) { return x.id === id; })[0]; return r ? (r.name + (r.style ? ' (' + r.style + ')' : '')) : ('Reciter ' + id); }
  function shortLabel(id) { var n = reciterFull(id); return n.length > 16 ? n.slice(0, 15) + '…' : n; }
  function cardFor(vk) { return document.getElementById('a-' + vk.replace(':', '-')); }
  function currentSurahFromDom() { var c = $('#versesCardList .ayah-card[data-key]'); return c ? Number(c.dataset.key.split(':')[0]) : null; }

  function getAudio() {
    if (!audio) {
      audio = document.createElement('audio'); audio.preload = 'none'; audio.style.display = 'none';
      document.body.appendChild(audio);
      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('loadedmetadata', onMeta);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      audio.addEventListener('play', function () { reflect(true); });
      audio.addEventListener('pause', function () { reflect(false); });
    }
    return audio;
  }

  function ensure(surahId) {
    if (loadedSurah === surahId && loadedReciter === reciterId && ayahs.length) return Promise.resolve(ayahs);
    return source.getSurahAudio(reciterId, surahId).then(function (a) { ayahs = a; loadedSurah = surahId; loadedReciter = reciterId; return a; });
  }
  function playAt(i) {
    if (i < 0 || i >= ayahs.length) return;
    idx = i; var a = getAudio();
    a.src = ayahs[i].url; a.playbackRate = SPEEDS[speedIdx];
    var pr = a.play(); if (pr && pr.catch) pr.catch(function () {});
    markPlaying();
  }
  function playFromDom(start) {
    var s = currentSurahFromDom();
    if (!s) { toast('Loading surah…'); return; }
    ensure(s).then(function () { if (ayahs.length) playAt(start || 0); })
      .catch(function (e) { console.warn('[quran] audio fetch failed:', e && e.message); toast('Audio unavailable — try again'); });
  }

  function clearHighlights() {
    Array.prototype.forEach.call(document.querySelectorAll('.ayah-card.ayah-playing'), function (c) { c.classList.remove('ayah-playing'); });
    Array.prototype.forEach.call(document.querySelectorAll('.wbw-word.word-active'), function (w) { w.classList.remove('word-active'); });
  }
  function markPlaying() {
    clearHighlights();
    var ay = ayahs[idx]; if (!ay) return;
    var card = cardFor(ay.verse_key);
    if (card) {
      card.classList.add('ayah-playing');
      var r = card.getBoundingClientRect();
      if (r.top < 80 || r.bottom > (window.innerHeight || 800)) { try { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }
    }
    var bc = document.getElementById('bcTitle'); if (bc) setText('#apSurah', bc.textContent);
    setText('#apReciterName', reciterStyled(reciterId));
    var badge = document.getElementById('nowPlayingBadge'); if (badge) badge.classList.add('show');
    setText('#nowPlayingText', 'Ayah ' + ay.verse_key.split(':')[1]);
  }
  function onTime() {
    if (!audio) return;
    if (audio.duration) { var f = document.getElementById('apFill'); if (f) f.style.width = ((audio.currentTime / audio.duration) * 100).toFixed(1) + '%'; }
    setText('#apTime', core.formatTime(audio.currentTime));
    var ay = ayahs[idx]; if (!ay || !ay.segments || !ay.segments.length) return;
    var w = core.activeWordAt(ay.segments, audio.currentTime * 1000);
    var card = cardFor(ay.verse_key); if (!card) return;
    var words = card.querySelectorAll('.wbw-row .wbw-word');
    Array.prototype.forEach.call(words, function (el, i) { el.classList.toggle('word-active', i === (w - 1)); });
  }
  function onMeta() { setText('#apDuration', core.formatTime(audio.duration)); }
  function onEnded() {
    if (repeat) { playAt(idx); return; }
    if (autoplay && idx < ayahs.length - 1) { playAt(idx + 1); return; }
    stop(); toast('End of Surah');
  }
  function onError() { toast('Audio unavailable for this ayah'); if (autoplay && idx < ayahs.length - 1) playAt(idx + 1); }
  function reflect(playing) {
    var ic = document.getElementById('apPlayIcon');
    if (ic) ic.innerHTML = playing ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>' : '<polygon points="5 3 19 12 5 21 5 3"/>';
    var lbl = document.getElementById('playLabel'); if (lbl) lbl.textContent = playing ? 'Pause' : 'Play Surah';
    var pb = document.getElementById('apPlayBtn'); if (pb) pb.classList.toggle('syncing', playing);
  }
  function stop() {
    if (audio) { audio.pause(); try { audio.removeAttribute('src'); audio.load(); } catch (e) {} }
    clearHighlights(); reflect(false);
    var badge = document.getElementById('nowPlayingBadge'); if (badge) badge.classList.remove('show');
    var f = document.getElementById('apFill'); if (f) f.style.width = '0%';
    setText('#apTime', '0:00');
  }

  // ---- overrides of locked inline globals ----
  window.masterPlayPause = function () {
    if (audio && !audio.paused) { audio.pause(); return; }
    if (audio && audio.src) { var pr = audio.play(); if (pr && pr.catch) pr.catch(function () {}); return; }
    playFromDom(0);
  };
  window.masterPlay = window.masterPlayPause;
  window.masterPause = function () { if (audio) audio.pause(); };
  window.masterStop = function () { loadedSurah = null; ayahs = []; idx = 0; stop(); };
  window.toggleAyahPlay = function (btn, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    var card = btn && btn.closest ? btn.closest('.ayah-card') : null;
    if (!card || !card.dataset.key) { playFromDom(0); return; }
    var s = Number(card.dataset.key.split(':')[0]);
    ensure(s).then(function () {
      var i = ayahs.map(function (x) { return x.verse_key; }).indexOf(card.dataset.key);
      if (i < 0) return;
      if (audio && !audio.paused && idx === i) { audio.pause(); return; }
      playAt(i);
    }).catch(function () { toast('Audio unavailable — try again'); });
  };
  window.skipAyah = function (dir) {
    if (!ayahs.length) { playFromDom(0); return; }
    playAt(Math.max(0, Math.min(ayahs.length - 1, idx + dir)));
  };
  window.scrubAudio = function (e, bar) {
    if (!audio || !audio.duration) return;
    var r = bar.getBoundingClientRect(); var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    audio.currentTime = p * audio.duration;
  };
  window.cycleSpeed = function () {
    speedIdx = (speedIdx + 1) % SPEEDS.length; if (audio) audio.playbackRate = SPEEDS[speedIdx];
    var b = document.getElementById('speedBtn'); if (b) b.textContent = SPEEDS[speedIdx] + '×';
  };
  window.toggleRepeat = function (btn) {
    repeat = !repeat; var b = btn || document.getElementById('repeatBtn'); if (b) b.classList.toggle('repeat-on', repeat);
    toast(repeat ? 'Repeat ayah on' : 'Repeat off');
  };
  window.selectReciter = function (id, el) {
    reciterId = Number(id);
    try { localStorage.setItem('ii-quran-reciter', String(reciterId)); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll('#reciterPicker .reciter-opt'), function (o) { o.classList.remove('on'); });
    if (el) el.classList.add('on');
    setText('#reciterLabel', shortLabel(reciterId));
    setText('#apReciterName', reciterStyled(reciterId));
    var picker = document.getElementById('reciterPicker'); if (picker) picker.classList.remove('open');
    var wasPlaying = audio && !audio.paused, resumeIdx = idx, s = loadedSurah || currentSurahFromDom();
    loadedSurah = null; ayahs = [];
    if (s) ensure(s).then(function () { if (wasPlaying && ayahs.length) playAt(Math.min(resumeIdx, ayahs.length - 1)); }).catch(function () {});
    toast('Reciter: ' + shortLabel(reciterId));
  };
  if (typeof window.toggleReciterPicker !== 'function') {
    window.toggleReciterPicker = function () { var p = document.getElementById('reciterPicker'); if (p) p.classList.toggle('open'); };
  }

  // ---- reciter picker ----
  function populatePicker() {
    var picker = document.getElementById('reciterPicker'); if (!picker) return;
    picker.innerHTML = '';
    reciters.forEach(function (r) {
      var opt = document.createElement('div'); opt.className = 'reciter-opt' + (r.id === reciterId ? ' on' : '');
      var dot = document.createElement('div'); dot.className = 'reciter-opt-dot'; opt.appendChild(dot);
      opt.appendChild(document.createTextNode(r.name + (r.style ? ' (' + r.style + ')' : '')));
      opt.addEventListener('click', function () { window.selectReciter(r.id, opt); });
      picker.appendChild(opt);
    });
    setText('#reciterLabel', shortLabel(reciterId));
    setText('#apReciterName', reciterStyled(reciterId));
  }

  function init() {
    if (!core) return;
    try { var saved = Number(localStorage.getItem('ii-quran-reciter')); if (saved) reciterId = saved; } catch (e) {}
    source.listReciters().then(function (list) {
      reciters = list || [];
      if (!reciters.some(function (r) { return r.id === reciterId; }) && reciters[0]) reciterId = reciters[0].id;
      populatePicker();
    }).catch(function (e) { console.warn('[quran] reciters load failed:', e && e.message); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.quranAudio = {
    init: init, source: source,
    _audio: function () { return audio; },
    _state: function () { return { reciterId: reciterId, idx: idx, ayahs: ayahs, repeat: repeat, loadedSurah: loadedSurah }; },
    _setReciters: function (l) { reciters = l; populatePicker(); }
  };
})();
```

- [ ] **Step 2: Syntax-check**: `node --check src/js/quran-audio.js` (expect exit 0)

- [ ] **Step 3: Commit**
```bash
git add src/js/quran-audio.js
git commit -m "feat(quran): real audio engine — streaming, reciter picker, word-sync, overrides"
```

---

## Task 5: Wire `quran.html`

**Files:** Modify `quran.html`

- [ ] **Step 1: Add the two script includes** — after the Module-2 verses scripts:

FIND:
```html
<script src="src/js/quran-verses-core.js"></script>
<script src="src/js/quran-verses.js"></script>
```
REPLACE:
```html
<script src="src/js/quran-verses-core.js"></script>
<script src="src/js/quran-verses.js"></script>
<script src="src/js/quran-audio-core.js"></script>
<script src="src/js/quran-audio.js"></script>
```

- [ ] **Step 2: Confirm minimal diff**
```bash
git diff quran.html
```
Expected: exactly the 2 added `<script>` lines, nothing else.

- [ ] **Step 3: Re-run all module tests**
```bash
node --test tests/quran/audio-core.test.js tests/quran/verses-core.test.js tests/quran/sidebar-core.test.js
```
Expected: all pass.

- [ ] **Step 4: Commit**
```bash
git add quran.html
git commit -m "feat(quran): wire audio engine into quran.html"
```

---

## Task 6: Headless verification + DoD gate

**Files:** none (verification; jsdom harness in scratchpad).

- [ ] **Step 1: Build the harness** — jsdom loads a minimal DOM with: `.audio-player` controls (`#apPlayBtn`,`#apPlayIcon`,`#playLabel`,`#apFill`,`#apTime`,`#apDuration`,`#speedBtn`,`#repeatBtn`,`#nowPlayingBadge`,`#nowPlayingText`,`#reciterPicker`,`#reciterLabel`,`#apReciterName`,`#apSurah`), a `#bcTitle`, and a `#versesCardList` with 3 real `.ayah-card` (ids `a-1-1`,`a-1-2`,`a-1-3`, each `data-key` + a `.wbw-row` of `.wbw-word`s). Inject `quran-audio-core.js` + `quran-audio.js`. Stub: `win.AbortController`; `win.HTMLMediaElement.prototype.play`=dispatch 'play'+resolve, `pause`=dispatch 'pause', `load`=noop; define writable `currentTime`/`duration` on the prototype; mock `fetch` routing reciters → `reciters.json`, verses?audio → a page built with real `verses-1.json` verse_keys + synthetic segments (`[[0,1,0,500],[1,2,500,1000],...]`). Grab the audio element via `win.II.quranAudio._audio()`.
  - **A (reciter picker):** after init, `#reciterPicker` has ≥10 `.reciter-opt`; one has `.on`; `#reciterLabel` non-empty.
  - **B (play + ayah-playing):** call `win.toggleAyahPlay(playBtnOf('a-1-1'), {stopPropagation(){}})`; after audio fetch, assert `a-1-1` has `.ayah-playing`, `#apPlayIcon` shows pause, badge `.show`.
  - **C (word-sync):** set `audio.currentTime=0.7` (700ms) + dispatch `timeupdate`; assert the 2nd `.wbw-word` in `a-1-1` has `.word-active` and others don't; move to 0.2s → 1st word active.
  - **D (autoplay-next):** dispatch `ended` on `a-1-1` → `a-1-2` becomes `.ayah-playing` (idx advanced).
  - **E (repeat):** `win.toggleRepeat()`; dispatch `ended` → same ayah replays (idx unchanged, still `a-1-2`).
  - **F (reciter change persists + re-fetch):** `win.selectReciter(3, opt)` → `localStorage['ii-quran-reciter']==='3'`; `_state().reciterId===3`; `.on` moved.
  - **G (speed/scrub):** `win.cycleSpeed()` → `audio.playbackRate===1.25`, `#speedBtn` text `1.25×`; `win.scrubAudio({clientX:...},bar)` sets `currentTime`.
  - **H (missing segments):** an ayah with `segments:[]` → `timeupdate` adds `.ayah-playing` but no `.word-active`.
  - **I:** assert **zero console errors** across all scenarios (a single reciters/audio `console.warn` on a forced-failure sub-check is allowed).

- [ ] **Step 2: Run harness** — expect all assertions pass, 0 console errors.

- [ ] **Step 3: Spot-check real word alignment** (optional) — fetch real Alafasy segments for 1:1 (`verses/by_chapter/1?audio=7`) and confirm segment count matches the 4 WBW words, so `.word-active` maps 1:1 with Module-2 cards.

- [ ] **Step 4: Serve + eyeball** — `npx --yes serve -l 5000 .`, open `/quran.html`: press Play → Al-Fatihah audio plays, ayah highlights + words highlight in sync, autoplay advances, reciter picker lists ~12 and switching works + persists on reload; dark theme OK; Console clean.

- [ ] **Step 5: DoD report** — pass/fail per spec §9; flag 🕌 Content human-review as **pending reviewer**.

---

## Self-Review (author checklist — completed)

- **Spec coverage:** T1 audio fetch → Task 2 (`normalize*`) + Task 4 (`getSurahAudio`); T2 reciter picker → Task 1 (seed) + Task 4 (`listReciters`/`populatePicker`); T3 play + sync → Task 4 (`playAt`/`onTime`/`activeWordAt`); T4 repeat/autoplay/badge → Task 4 (`onEnded`/`markPlaying`); T5 persist → Task 4 (`selectReciter` → `ii-quran-reciter`). Deferred (QUL 57, Mushaf sync) correctly absent; pluggable `AudioSource` is the QUL seam.
- **Placeholder scan:** none — full code every step.
- **Type/name consistency:** core exports match Task 4 usage; `Reciter`/`AyahAudio` shapes + cache keys consistent across Tasks 3,4; overrides match the locked inline global names (`masterPlayPause`/`toggleAyahPlay`/`skipAyah`/`scrubAudio`/`cycleSpeed`/`toggleRepeat`/`selectReciter`/`masterStop`).
```
