# Design — Search Slice 1: Qur'an Search Backend

**Date:** 2026-07-25
**Status:** Approved (design)
**Program:** Hero search federation (Slice 1 of 3). Slice 2 = Dua search; Slice 3 = frontend federation (`search-results.html`, Verify→QuranlyAI, honest pill states).

## Goal

A self-owned Qur'an keyword-search backend: `GET /api/quran/search?q=` returning real, sourced verse results (Arabic + English), backed by an ingested static corpus scanned in the Worker with per-query KV caching. No fabricated verse text — every result comes from the ingested quran.com corpus.

## Owner decisions (locked)

- **Corpus source:** quran.com API v4 (same source the Qur'an display module already uses).
- **Editions:** Arabic = `text_uthmani`; English = translation **edition id 20 (Saheeh International)** — the Qur'an module's default (`quran-verses.js` `edition()` default 20; `quran-translations.js` `DEFAULT_ID = 20`).
- **Storage/search:** static JSON corpus + Worker scan + KV per-query cache. **D1 + FTS5 is the designated upgrade path** if corpus size or search quality ever demands it.
- **Reproducibility:** ingest pins/records the translation edition id so re-ingests are deterministic.
- **Arabic matching:** diacritic-insensitive normalization in the matcher.
- Both decisions logged in `doc/DECISIONS.md`.

## Components

### 1. Ingest script — `worker/scripts/ingest-quran-corpus.mjs` (Node ESM)
- For each surah 1..114: GET `https://api.quran.com/api/v4/verses/by_chapter/{id}?language=en&fields=text_uthmani&translations=20&per_page=300&page=N`, paginating on `pagination.total_pages`.
- Per verse extract: `verse_key` (e.g. "2:255"), `surah` (int), `ayah` (int), `arabic` = `text_uthmani`, `translation` = `translations[0].text` with HTML footnote markup stripped (`<sup …>…</sup>`, tags → removed; entities left intact).
- Pull surah English names from the existing `src/data/chapters.json` (already committed) so results carry a `surahName` without another API.
- Write `src/data/quran/search-corpus.json`:
  ```json
  {
    "meta": { "source": "quran.com API v4",
              "arabicField": "text_uthmani",
              "translationEditionId": 20,
              "translationEditionName": "Saheeh International",
              "fetchedAt": "<ISO>", "verseCount": 6236, "schema": 1 },
    "verses": [ { "verseKey":"1:1","surah":1,"ayah":1,"surahName":"Al-Fatihah",
                  "arabic":"…","translation":"…" }, … ]
  }
  ```
- Idempotent, safe to re-run. Prints a summary (verse count, byte size). Must assert 6236 verses before writing (fail loudly otherwise).

### 2. Pure search core — `worker/src/quran-search-core.js` (UMD, no I/O)
Exports (`module.exports` for tests, `globalThis`/window otherwise):
- `normalizeArabic(s)` — strip tashkeel (U+0610–U+061A, U+064B–U+065F, U+0670), tatweel (U+0640); fold: alef variants (أ إ آ ٱ → ا), ة → ه, ى → ي, ؤ/ئ → hamza-less. Collapse whitespace.
- `normalizeLatin(s)` — lowercase; strip combining accents (NFD + remove U+0300–U+036F); strip punctuation to spaces; collapse whitespace.
- `tokenize(s)` — split normalized string on whitespace → non-empty tokens.
- `isArabic(s)` — any char in Arabic block U+0600–U+06FF.
- `searchCorpus(verses, q, opts)` — normalize q; pick Arabic vs Latin normalization per `isArabic(q)`; a verse matches if ALL query tokens appear (substring on the normalized field: Arabic query → normalized arabic; Latin query → normalized translation). Score = phrase-hit bonus + token coverage; sort desc, then by surah/ayah asc. Returns `{ total, page, totalPages, limit, results }` where results are the matched verse objects sliced to the page. Defaults: `page=1`, `limit=20`.

Pure and deterministic → fully unit-testable without network or the Worker.

### 3. Worker endpoint — `GET /api/quran/search`
- Add `quran-search.js` (or a handler in `index.js`) exposing `handleQuranSearch(searchParams, env, origin, deps)`.
- Params: `q` (required, trimmed, 2–100 chars else `fail('bad_query', …, 400)`), `page` (posInt, default 1), `limit` (default 20, cap 50), `lang` (informational; matching auto-detects Arabic vs Latin from the query).
- **Corpus loading:** lazy, memoized in a module-global (`let CORPUS = null`). On first use, `fetch(CORPUS_URL)` where `CORPUS_URL = env.QURAN_CORPUS_URL || '<pinned Pages asset URL>'` (the committed `src/data/quran/search-corpus.json`), parse, keep `CORPUS.verses`. On fetch failure → `fail('corpus_unavailable', 'Qur\'an search temporarily unavailable', origin, 503, true)`.
- **Per-query KV cache:** key `qsearch:{page}:{limit}:{normalizedQ}` in `QURANLYAI_KV`, `TTL.HOUR`; check before scan, store after. Reuse existing `getJson`/`putJson`.
- Response via existing `ok(data, source, origin, ttl)` with:
  ```json
  { "query":"…","page":1,"totalPages":N,"total":M,
    "results":[ {"verseKey":"2:255","surah":2,"ayah":255,"surahName":"Al-Baqarah",
                 "arabic":"…","translation":"…"} ],
    "source":"quran.com API v4","edition":"Saheeh International (20)" }
  ```
- **Routing:** in `index.js` GET block, add the `/api/quran/search` branch **before** the existing `if (path.startsWith('/api/quran/') || PENDING.includes(path)) return err(... 501)` catch, so it isn't swallowed by the pending stub. Non-search `/api/quran/*` paths keep returning the existing 501. Cache 200s in the edge `cache` like the hadith branch.
- CORS via existing `corsHeaders(origin)` (inherited through `ok`).

### 4. Tests — `worker/test/quran-search-core.test.js` (node --test)
- `normalizeArabic` removes diacritics + folds alef/ta-marbuta (e.g. `الرَّحْمَٰن` ≈ `الرحمن`).
- Arabic query matches diacritic-free (query `الرحمن` finds a verse whose stored arabic has full tashkeel).
- `normalizeLatin` lowercases + strips punctuation/accents.
- English query case-insensitive: `mercy` matches "the Most Merciful"? (token substring: "merc" — verify tokenization semantics; test uses a token that is a real substring, e.g. query `merciful` matches translation containing "Merciful").
- Multi-token AND semantics; non-match returns empty.
- Pagination: `total`, `totalPages`, correct slice; `page` beyond range → empty results, correct `total`.
- Query < 2 chars / empty handled by the Worker layer (covered in a light handler test if feasible without network; otherwise document as endpoint-level).
- **Corpus integrity** (`worker/test/quran-corpus.test.js`): load `src/data/quran/search-corpus.json`, assert `meta.verseCount === 6236`, `verses.length === 6236`, every verse has non-empty `arabic` + `translation` + valid `verseKey`, and `meta.translationEditionId === 20`. (Skips with a clear message if the corpus file is absent, so core tests still run pre-ingest.)

### 5. DECISION entries — `doc/DECISIONS.md`
- ADR: **Qur'an search corpus = quran.com API v4, edition 20 (Saheeh International), Arabic `text_uthmani`.** Rationale: consistency with existing display; no model-generated verse text; reproducible pinned edition.
- ADR: **Qur'an search storage = static JSON corpus + Worker scan + KV per-query cache; D1+FTS5 = upgrade path.** Rationale: matches existing Worker+KV+static-JSON patterns, no new binding; upgrade when scale/quality demands.

## "Flip the Qur'an pill on" checklist (gates Slice 3 wiring)
1. Ingest produces `search-corpus.json` with exactly 6236 sourced verses (integrity test green).
2. `quran-search-core` unit tests green; full `worker` suite still green.
3. Deployed `/api/quran/search?q=` returns real sourced results for a sample Arabic query (`الرحمن`) and English query (`patience`), each result carrying arabic+translation+verseKey+source.

## Out of scope (Slice 1)
- Any frontend wiring / results page (Slice 3).
- Dua search (Slice 2).
- Tafsir, per-word, or semantic/vector search (D1/FTS5 or vector = future upgrade).
- Non-English translation corpora (edition 20 only for now).

## Verification
- `cd worker && npm test` green (existing 502 + new core/integrity tests).
- Ingest run committed; corpus integrity test proves provenance.
- Manual: `wrangler dev` (or deployed) `GET /api/quran/search?q=الرحمن` and `?q=patience` return sourced verses; `?q=a` → 400; unknown `/api/quran/foo` → still 501.
