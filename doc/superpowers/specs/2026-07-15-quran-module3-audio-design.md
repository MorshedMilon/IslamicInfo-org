# Module 3 — Audio Playback, Reciter Picker, Word-Sync — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Stage:** 1 (audio) · **Date:** 2026-07-15
**Governing docs:** PRD US-Q04 · TechSpec §3.3 / §5 / §5.1 / §8 / §10 · DATA.md · CONTENT-POLICY (🕌 audio recitation) · DEFINITION-OF-DONE.md
**Blueprint:** attached `quran.html` (locked). **Builds on:** Module 2 (dynamic `.ayah-card` `a-{key}`, `.wbw-word`).

---

## 1. Purpose & Scope

Replace the locked page's inline `SYNC_DATA` **simulation** with a real `<audio>` engine: stream per-ayah recitation, populate the reciter picker from live data, and drive real `.ayah-playing` + `.word-active` highlighting from the API's per-word timestamps. Built behind a **pluggable `AudioSource`** so the next module (QUL 57-reciter ingest) swaps the data source without touching the engine.

### In scope
- **T1** — Per-ayah audio from Quran.com: `/verses/by_chapter/{id}?audio={reciter}` → `audio.url` + `audio.segments`.
- **T2** — Reciter picker from `/resources/recitations` (~12 reciters), replacing the 5 hardcoded `.reciter-opt`s at runtime.
- **T3** — Real `toggleAyahPlay`/`masterPlayPause`: stream audio, `.ayah-playing` on the current card via `timeupdate`, `.word-active` on the current word via segments.
- **T4** — Repeat, autoplay-next-ayah, now-playing badge reflect real `<audio>` state.
- **T5** — Persist reciter to `localStorage['ii-quran-reciter']` (translation already `ii-quran-translation`). **No Supabase** (no DB/auth in v1) — deferred to the accounts stage.

### Deferred (agreed)
- **QUL 57-reciter ingest** → next module (download QUL datasets → host in Cloudflare Worker KV/D1 with schema sign-off → plug a `QulAudioSource` into the same engine).
- **Mushaf-view word-sync** → with the Mushaf module. Module 3 syncs the **study-mode dynamic cards** only.
- Reciters/ayahs without segments → ayah-level highlight only (graceful).

### Non-goals
- No DB, no `/api/` route (keyless client-direct fetch per TechSpec §5), no download-for-offline, no per-word audio files (per-ayah files only).

---

## 2. HTML elements in scope (locked `quran.html`)

`.audio-player` bar · `#masterPlayBtn`/`#playLabel`/`#masterWaveform` (topbar) · `#apPlayBtn`/`.ap-play`/`#apPlayIcon` · `#apFill`/`#apBar` (scrub) · `#apTime`/`#apDuration` · `#speedBtn` · prev/next `.ap-btn` (`skipAyah`) · `#repeatBtn`/`.repeat-on` · `#reciterBtn`/`#reciterLabel`/`#reciterPicker`/`.reciter-opt` · `#apReciterName`/`#apSurah`/`#apArt` · `.now-playing-badge`/`#nowPlayingBadge`/`#nowPlayingText` · sync classes `.ayah-playing` (on `.ayah-card`) / `.word-active` (on `.wbw-word`) / `.ap-play.syncing`.
Overridden inline globals (locked JS stays, superseded): `masterPlayPause`, `masterPlay`, `masterPause`, `masterStop`, `toggleAyahPlay`, `skipAyah`, `scrubAudio`, `cycleSpeed`, `toggleRepeat`, `selectReciter`, `toggleReciterPicker`.

---

## 3. Pluggable data layer

```
AudioSource interface:
  listReciters() -> Promise<Reciter[]>            // Reciter = { id, name, style }
  getSurahAudio(reciterId, surahId) -> Promise<AyahAudio[]>
                                                  // AyahAudio = { verse_key, url, segments:{word,start,end}[] }
```
Module 3 implements **`QuranComAudioSource`**:
- `listReciters()` → `GET /api/v4/resources/recitations?language=en` → `[{id, name:reciter_name, style}]`; seed fallback `src/data/reciters.json`; cache `ii-reciters` 7d.
- `getSurahAudio(reciterId, surahId)` → `GET /api/v4/verses/by_chapter/{surahId}?audio={reciterId}&fields=text_uthmani&words=false&per_page=50&page={n}`, paginate via `meta.pagination.total_pages`, map each `verse.audio` → `{ verse_key, url: normalizeAudioUrl(audio.url), segments: normalizeSegments(audio.segments) }`; cache `ii-audio-{surahId}-{reciterId}` 7d (timings immutable).

The engine only ever calls the interface — the QUL module later provides `QulAudioSource` with the same shape.

---

## 4. Pure core (DOM-free, tested) — `quran-audio-core.js`

- `normalizeAudioUrl(url, base)` → absolute URL. `http…`→as-is; `//host…`→`https:`+url; else `base+url` (`base='https://audio.qurancdn.com/'`).
- `normalizeSegments(raw)` → `{word,start,end}[]`. Handles Quran.com 4-tuple `[idx,word,start,end]` **and** QUL 3-tuple `[word,start,end]` (future-compatible): `len===4 → {word:r[1],start:r[2],end:r[3]}`; `len===3 → {word:r[0],start:r[1],end:r[2]}`.
- `activeWordAt(segments, ms)` → 1-based `word` of the segment with `start ≤ ms < end`, else `-1`.
- `formatTime(sec)` → `"m:ss"` (zero-padded seconds; `0`/NaN→`"0:00"`).
- `recitersCacheKey()`, `audioCacheKey(surahId, reciterId)`, `isFresh(fetchedAt, now, maxAge=7d)`.

---

## 5. Engine (`quran-audio.js`)

Single global `<audio>` (created once, hidden, appended to body). State: `reciterId`, `surahId`, `ayahs:AyahAudio[]`, `idx` (0-based), `repeat`, `autoplay=true`, `speed`, `reciters[]`.

**Current surah is derived from the DOM** (decoupled from Module 2): first `#versesCardList .ayah-card[data-key]` → surah = key before `:`. If no cards, play is a no-op + "loading" toast.

**Playback:**
- `ensureAudio(surahId)` — if `surahId`/`reciterId` changed or `ayahs` empty → `source.getSurahAudio()` (cache-first) → set `ayahs`.
- `playAt(i)` — `audio.src = ayahs[i].url`; `audio.playbackRate = speed`; `audio.play()`; set `idx`; mark card `.ayah-playing` (+scroll into view if offscreen); update now-playing badge (`Ayah {n}`), `#apSurah`/`#apReciterName`/`#apArt`; icons→pause; `.ap-play.syncing`.
- `timeupdate` → `ms = currentTime*1000`; update `#apFill` width, `#apTime`; `w = activeWordAt(ayahs[idx].segments, ms)`; move `.word-active` to the `(w-1)`th `.wbw-word` in the current card (clear others). No segments → skip word highlight (ayah-level only).
- `loadedmetadata` → `#apDuration = formatTime(duration)`.
- `ended` → `repeat` ? `playAt(idx)` : (`autoplay && idx<last`) ? `playAt(idx+1)` : `stop()` + "End of Surah" toast.
- `error` (per ayah) → inline "Audio unavailable for this ayah" toast; if autoplay → skip to `idx+1`.

**Overrides (real behavior):** `masterPlayPause` (play/resume/pause), `toggleAyahPlay(btn,e)` (play that card's ayah / pause if it's current), `skipAyah(dir)`, `scrubAudio(e,bar)` (`currentTime = ratio*duration`), `cycleSpeed` (`[1,1.25,1.5,2]`→`playbackRate`), `toggleRepeat` (`.repeat-on`), `masterStop` (pause+reset+clear `.ayah-playing`/`.word-active`+hide badge — already called by Module 1/2 `selectSurah` on surah change), `selectReciter(id, el)` (persist `ii-quran-reciter`, update labels, re-fetch audio, resume at `idx` if was playing).

**Reciter picker:** on init, `listReciters()` → clear `#reciterPicker`, append one `.reciter-opt` per reciter (existing classes; `.on` for current; `addEventListener`→`selectReciter`). Default reciter = `ii-quran-reciter` or `7` (Alafasy). Update `#reciterLabel`/`#apReciterName`.

---

## 6. States (RULE 5)

| State | Behavior |
|---|---|
| Reciter list fetch fails | seed `src/data/reciters.json`; `console.warn` |
| Surah audio fetch fails | toast "Audio unavailable — try again"; player controls stay; no crash |
| Per-ayah 404/`audio.onerror` | inline "Audio unavailable for this ayah" toast; autoplay skips to next |
| No segments for reciter/ayah | ayah-level `.ayah-playing` only; no `.word-active` (graceful) |
| Play before verses render | "Loading surah…" toast; no-op |
| `localStorage` parse/quota | try/catch; skip cache; playback proceeds |

---

## 7. Files

| File | Change |
|---|---|
| `src/js/quran-audio-core.js` | **NEW** — pure (UMD `window.II.audioCore`), unit-tested |
| `src/js/quran-audio.js` | **NEW** — engine + `QuranComAudioSource` + global overrides |
| `tests/quran/audio-core.test.js` | **NEW** — `node:test` |
| `src/data/reciters.json` | **NEW** — real 12-reciter seed (from `/resources/recitations`) |
| `quran.html` | **MINIMAL** — 2 `<script>` includes only (`audio-core`, `audio`); reciter opts repopulated by JS (no markup removed) |
| `DATA.md` | register `ii-quran-reciter`, `ii-reciters`, `ii-audio-{surah}-{reciter}` + `Reciter`/`AyahAudio` shapes |

---

## 8. Testing

- **Pure core** (`node:test`): `normalizeAudioUrl` (abs/`//`/relative); `normalizeSegments` (4-tuple + 3-tuple); `activeWordAt` (in-range, boundary, gap→-1); `formatTime` (0/NaN/65s→"1:05"); cache keys + `isFresh`.
- **Engine** (jsdom headless harness, mock `<audio>` with settable `currentTime`/`duration` + dispatched `timeupdate`/`ended`/`error`): playAt sets src + `.ayah-playing`; `timeupdate` moves `.word-active` across words per segments; `ended`→autoplay advances / repeat re-plays / stop at surah end; `selectReciter` re-fetches + persists `ii-quran-reciter`; reciter picker populated (12 opts, `.on`); missing-segments → no `.word-active` but `.ayah-playing` present; audio-error path skips; **zero console errors**.

---

## 9. Definition-of-Done gates

- **Universal:** matches PRD US-Q04; only requested changes; both themes; no console errors; graceful audio/seed fallbacks; self-reviewed.
- **Design:** no CSS/token change; reciter opts use existing `.reciter-opt` classes; no raw hex.
- **Data:** `ii-quran-reciter`/`ii-reciters`/`ii-audio-{surah}-{reciter}` registered; all `localStorage` try/catch.
- **Content (🕌 audio recitation):** audio streamed from authoritative Quran.com; reciter attributed (`#apReciterName`); nothing fabricated; no fatwa. **Human-review sign-off (CONTENT-POLICY §5) = pending reviewer** (the one item not self-satisfiable).
- **(No API gate:** keyless client-direct fetch.)**

---

## 10. Follow-ups

QUL 57-reciter ingest module (host segments in Worker KV/D1 → `QulAudioSource`). Mushaf-view word-sync. Download-for-offline audio. `ii-audio-*` key sweep. Reciter search/filter in picker.
