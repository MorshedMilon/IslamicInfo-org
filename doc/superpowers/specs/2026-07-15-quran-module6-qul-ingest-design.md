# Module 6 — QUL Reciter Ingest (static-hosted) — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Stage:** audio expansion · **Date:** 2026-07-15
**Governing docs:** CONTENT-POLICY §5/§9 (scripture audio + attribution) · DATA.md · ARCHITECTURE (AudioSource seam) · DEFINITION-OF-DONE.md
**Blueprint:** attached `quran.html` (locked). **Builds on:** Module 3 (pluggable `AudioSource`, `QuranComAudioSource`, `normalizeSegments`, reciter picker).

---

## 1. Purpose & Scope

Expand the reciter picker beyond Quran.com's 12 by ingesting **QUL** (qul.tarteel.ai) word-segmented reciters. QUL has **no API** (bulk per-reciter JSON/SQLite download) and **per-resource licensing**, so this ships as a **build-time ingest pipeline + static hosting**, not a live integration. The picker gains QUL reciters only after an **operator** clears a reciter's license, downloads its export, and runs the ingest tool.

### In scope
- **Pure transform core** (`quran-qul-core.js`, node:test): QUL export record → our `AyahAudio` shape; reciter-id offset scheme; group-by-surah.
- **Ingest CLI** (`tools/qul-ingest.mjs`, operator-run): QUL ayah-by-ayah export JSON → `src/data/qul/{offsetId}/{surahId}.json` + updates `src/data/qul/reciters.json`.
- **Runtime sources** (added to `quran-audio.js`): `QulAudioSource` (fetch static timing JSON, cache, graceful `[]`), `CompositeAudioSource` (merge `listReciters`, route `getSurahAudio` by id). Swap the engine's `source` to the composite.
- **Static data** shipped **empty** (`src/data/qul/reciters.json = []`) + a README documenting the operator workflow, expected export shape, and the licensing/🕌 gate.

### ID scheme
QUL reciter ids are **offset by +1,000,000** in our manifest + file paths, so they never collide with Quran.com's numeric ids and Module 3's `Number(localStorage)` / strict-`===` id logic stays untouched. `CompositeAudioSource` routes `id ≥ 1,000,000` → QUL, else Quran.com.

### Data layout (static, served by Pages — no binding, no RULE-7)
- `src/data/qul/reciters.json` → `[{ id, name, style }]` (ships `[]`)
- `src/data/qul/{offsetId}/{surahId}.json` → `[{ verse_key, url, segments:[{word,start,end}] }]` (final shape). **Audio streams from the `url` in the export (its own CDN); we host only the small timing JSON.**

### Deferred / Non-goals
- No live QUL API (there is none). No audio-file mirroring/hosting (we hotlink the export's URLs; if a reciter's export has non-hotlinkable URLs, that's an operator ingest-time problem — the tool warns).
- No bulk auto-download of all 57 (manual, license-gated, operator).
- No 🕌 gate on the shipped **code** (empty manifest — no scripture surfaced). Each **ingested reciter** carries Module 3's scripture-audio status: license cleared + attribution + (pending) 🕌 review — documented in the README as the operator gate.
- No Cloudflare binding; no backend.

---

## 2. Elements / integration points

- `quran-audio.js`: `source` (line 67), `source.getSurahAudio` (98), `source.listReciters` (255). Reciter id persisted as `Number(localStorage['ii-quran-reciter'])` (254) → **offset ids must stay numeric** (they do).
- Reuses `readCache`/`writeCache`/`core.isFresh` already in `quran-audio.js`.
- `quran.html`: one new include (`quran-qul-core.js`) **before** `quran-audio.js` (which references `window.II.qulCore` at load).

---

## 3. Pure core — `src/js/quran-qul-core.js` (UMD `window.II.qulCore`)

- `QUL_OFFSET = 1000000`; `isQulId(id)` → `Number(id) >= QUL_OFFSET`; `offsetId(qulId)` → `QUL_OFFSET + Number`; `baseId(offset)` → `Number - QUL_OFFSET`.
- `parseQulAyah(raw)` → `{ surah, ayah, url, segments }` with tolerant field detection (`surah`/`sura_number`/`chapter`/`chapter_id`; `ayah`/`ayah_number`/`verse_number`/`verse`; `audio_url`/`audio`/`url`/`audio.url`; `segments`/`audio.segments`).
- `qulSegments(raw)` → `[{word,start,end}]`. 3-tuple `[idx,start,end]` → `{word:s[0],start:s[1],end:s[2]}`; tolerates 4-tuple `[idx,word,start,end]` (mirrors `normalizeSegments`); object form passthrough; drops entries missing start/end.
- `toAyahAudio(raw)` → `{ verse_key:'{surah}:{ayah}', url, segments }`, or `null` if surah/ayah missing.
- `groupBySurah(rawAyahs)` → `{ surahId: AyahAudio[] }`, each surah sorted by ayah number.

Pure/DOM-free/immutable.

## 4. Ingest CLI — `tools/qul-ingest.mjs` (operator-run, Node ESM)

`node tools/qul-ingest.mjs --in <export.json> --id <qulReciterId> --name "<name>" [--style "<style>"]`
- Reads the export (array, or `{ayahs|data|segments}` wrapper), `core.groupBySurah`, writes `src/data/qul/{offsetId}/{surah}.json` per surah, upserts `{id:offsetId,name,style}` into `reciters.json` (sorted, replace-by-id).
- Prints a summary + a **licensing/hotlink reminder**. Exits non-zero on bad args.

## 5. Runtime sources — added to `src/js/quran-audio.js`

- `QulAudioSource.listReciters()` → GET `src/data/qul/reciters.json` (8s timeout) → array | `[]`; cache `ii-qul-reciters` (7d); **any failure → `[]`** (picker just shows Quran.com).
- `QulAudioSource.getSurahAudio(reciterId, surahId)` → GET `src/data/qul/{reciterId}/{surahId}.json` → `AyahAudio[]` | `[]`; cache `ii-qul-audio-{reciter}-{surah}` (7d); **fail/404 → `[]`** (engine shows its "no audio" state).
- `CompositeAudioSource(primary, qul)`: `listReciters()` → `Promise.all` of both (each `.catch(→[])`) concatenated; `getSurahAudio(id,surah)` → `qulCore.isQulId(id) ? qul : primary`.
- Change `var source = new QuranComAudioSource();` → `var source = new CompositeAudioSource(new QuranComAudioSource(), new QulAudioSource());`.
- **Invariant:** with an empty QUL manifest, `listReciters()` = Quran.com list + `[]`, and all Quran.com ids route to primary → **behavior identical to Module 3** (verified in the harness).

## 6. States (RULE 5)

| State | Behavior |
|---|---|
| QUL manifest empty / 404 | picker shows only Quran.com's 12 (no error) |
| QUL surah JSON 404 / parse fail | `[]` → engine's existing "audio unavailable" path |
| QUL fetch timeout | `[]`, Quran.com unaffected |
| Both lists fail | `[]` concat `[]` → empty picker (Module 3's existing seed-fallback still applies to the Quran.com source) |
| localStorage quota/parse | existing try/catch (unchanged) |

## 7. Files

| File | Change |
|---|---|
| `src/js/quran-qul-core.js` | **NEW** — pure (UMD `window.II.qulCore`), unit-tested |
| `tools/qul-ingest.mjs` | **NEW** — Node CLI (operator-run) |
| `src/js/quran-audio.js` | **EDIT** — add `QulAudioSource` + `CompositeAudioSource`; swap `source` |
| `src/data/qul/reciters.json` | **NEW** — `[]` (empty manifest) |
| `src/data/qul/README.md` | **NEW** — operator workflow + export shape + licensing/🕌 gate |
| `tests/quran/qul-core.test.js` | **NEW** — `node:test` |
| `quran.html` | **MINIMAL** — 1 include (`quran-qul-core.js`) before `quran-audio.js` |
| `doc/DATA.md` | register `ii-qul-reciters`, `ii-qul-audio-{reciter}-{surah}` + static file layout |
| `doc/DECISIONS.md` | ADR-017 |

## 8. Testing

- **Core** (`node:test`): id offset/detect/roundtrip; `parseQulAyah` tolerant field names; `qulSegments` (3-tuple/4-tuple/object/drops-bad); `toAyahAudio` (shape + null on missing surah/ayah); `groupBySurah` (grouped + sorted by ayah) against a synthetic export fixture.
- **Ingest CLI** (scratchpad): run against a synthetic 2-surah export → assert `src/data/qul/{offset}/{1,2}.json` created with correct `AyahAudio` shape + manifest upserted. (Run in a temp dir; do NOT leave synthetic data in the repo.)
- **Runtime** (jsdom harness, mock `fetch`): manifest with 1 QUL reciter (offset id) + a Quran.com stub → `CompositeAudioSource.listReciters()` merges both; `getSurahAudio(offsetId, s)` fetches the QUL static path; `getSurahAudio(7, s)` routes to Quran.com; QUL 404 → `[]` (no throw); **empty manifest → only Quran.com reciters (Module 3 parity)**; zero console errors.

## 9. Definition-of-Done

- Universal: additive; both themes; no console errors; graceful fallbacks; self-reviewed.
- Design: no CSS/token change; reciter opts use existing `.reciter-opt` (Module 3) rendering; 1 script include only.
- Data: `ii-qul-reciters` / `ii-qul-audio-{reciter}-{surah}` registered + static layout documented; all `localStorage` try/catch.
- Content: **ships no scripture** (empty manifest) → **no 🕌 gate on the code**. README documents the per-reciter operator gate: QUL license cleared + attribution + 🕌 review before an ingested reciter is treated as production-live (parity with Modules 2/3).
- No API/binding gate (static hosting).

## 10. Follow-ups

Operator: clear licenses + ingest an initial curated set. Ayah/surah gapless handling if a reciter is surah-by-surah only (this module targets ayah-by-ayah gapped exports). Reciter search/filter in the picker (grows with 57). Optional: a small "source" badge (Quran.com vs QUL) in the picker. Possible future migration of timing JSON to KV/R2 if the repo grows large.
