# Design — Search Slice 2: Dua Search Backend

**Date:** 2026-07-25
**Status:** Approved (design)
**Program:** Hero search federation (Slice 2 of 3). Slice 1 = Qur'an search (LIVE). Slice 3 = frontend federation.

## Goal

A self-owned Dua keyword-search backend: `GET /api/dua/search?q=` returning real, sourced supplications (Arabic + transliteration + English + category) from the ingested Hisn al-Muslim corpus, scanned in the Worker with per-query KV caching. No fabricated dua text — every result comes from the ingested dataset.

## Owner decisions (locked)

- **Approach:** established open Hisnul Muslim JSON, verified reachable/structured before ingest; log a DECISION; fall back + report if the candidate isn't clean.
- **Verified source:** `github.com/wafaaelmaandy/Hisn-Muslim-Json`, raw `husn_en.json` (master). Confirmed reachable (240 KB) and well-structured: **132 categories, 267 duas**. Per-chapter `{ ID, TITLE, AUDIO_URL, TEXT[] }`; per-dua `{ ID, ARABIC_TEXT, LANGUAGE_ARABIC_TRANSLATED_TEXT (transliteration), TRANSLATED_TEXT (English), REPEAT, AUDIO }`.
- **Storage/search:** static JSON corpus + Worker scan + KV per-query cache, **reusing** the Slice-1 diacritic-insensitive normalizers (`worker/src/lib/quran-search-core.js`). Same D1+FTS5 upgrade path applies.

## Provenance & license (must be honest)

- The dataset carries **no explicit license**, and has **no per-dua Quran/hadith citation field** — the provenance is the *Hisn al-Muslim (Fortress of the Muslim)* compilation by Sa'id ibn Ali al-Qahtani.
- Corpus `meta` records: `source: "Hisn al-Muslim (Fortress of the Muslim), Sa'id al-Qahtani"`, `sourceDataset: "github.com/wafaaelmaandy/Hisn-Muslim-Json (husn_en.json)"`, `licenseNote: "dataset license unstated; text is the Hisn al-Muslim compilation"`, `fetchedAt`, `count`.
- **Owner-review license gate (before the Dua pill goes public in Slice 3):** owner confirms attribution/permission is acceptable, mirroring ADR-048's dorar.net terms gate. This is recorded in the ADR. Until then, the corpus + endpoint can exist but the pill stays "coming soon" if the owner hasn't cleared it. (Search-result rendering always shows the "Hisn al-Muslim" attribution.)
- No fabrication: verse/dua text is only ever the ingested dataset text; if the source is unreachable at ingest time, the task reports BLOCKED — never hand-authored.

## Components

### 1. Ingest — `worker/scripts/ingest-dua-corpus.mjs` (Node ESM)
- Fetch `https://raw.githubusercontent.com/wafaaelmaandy/Hisn-Muslim-Json/master/husn_en.json` (URL pinned in a const; the `English` array is the categories).
- Flatten to per-dua records: for each chapter `c` and each `t` in `c.TEXT`:
  `{ id: "<c.ID>:<t.ID>", category: c.TITLE, arabic: t.ARABIC_TEXT, transliteration: t.LANGUAGE_ARABIC_TRANSLATED_TEXT || '', translation: t.TRANSLATED_TEXT || '' }`.
  Trim/collapse whitespace on each string.
- Drop any record with empty `arabic` AND empty `translation` (must have at least one substantive field), logging how many were dropped.
- Write `src/data/dua/search-corpus.json`:
  ```json
  { "meta": { "source": "Hisn al-Muslim (Fortress of the Muslim), Sa'id al-Qahtani",
              "sourceDataset": "github.com/wafaaelmaandy/Hisn-Muslim-Json (husn_en.json)",
              "licenseNote": "dataset license unstated; text is the Hisn al-Muslim compilation",
              "fetchedAt": "<ISO>", "count": <N>, "schema": 1 },
    "duas": [ { "id":"27:75","category":"…","arabic":"…","transliteration":"…","translation":"…" } ] }
  ```
- Assert `count >= 250` (sanity floor — the dataset is ~267; abort if far fewer, indicating a fetch/parse problem). Print summary.

### 2. Pure search core — `worker/src/lib/dua-search-core.js` (ESM named exports)
- **Reuse** `normalizeArabic`, `normalizeLatin`, `isArabic` by importing from `./quran-search-core.js` (do NOT duplicate the normalization logic).
- `searchDuas(duas, q, opts)` — `{page=1, limit=20}`:
  - Arabic query (`isArabic(q)`) → match tokens against `normalizeArabic(dua.arabic)`.
  - Latin query → match tokens against `normalizeLatin(dua.translation + ' ' + dua.category + ' ' + dua.transliteration)` (English searchers also find by category name / transliteration).
  - Token-AND (all tokens present); phrase-hit scored above scattered tokens; sort score desc then by `id`.
  - Returns `{ total, page, totalPages, limit, results }` (results = the matched dua objects, paginated).

### 3. Worker endpoint — `GET /api/dua/search`
- New `worker/src/dua-search.js` mirroring `quran-search.js`: local `ok`/`fail`/`posInt`; imports `json` (cors), `getJson`/`putJson`/`TTL` (hadith-cache), `searchDuas` + `isArabic`/`normalizeArabic`/`normalizeLatin` (dua/quran cores).
- Params: `q` (2–100 chars), `page`, `limit` (default 20, cap 50).
- Corpus: module-global memo, `fetch(env.DUA_CORPUS_URL || 'https://islamicinfo.org/src/data/dua/search-corpus.json')`; failure → `fail('corpus_unavailable', …, 503, true)`.
- KV cache: `dsearch:{page}:{limit}:{normalizedQ}`, `TTL.HOUR`.
- Response: `{ ok, data:{ query, page, totalPages, total, results:[{id,category,arabic,transliteration,translation}], source, sourceDataset } }`.
- **Routing:** add the `/api/dua/search` branch in `index.js` GET block, alongside the `/api/quran/search` branch (inside the GET block where `cache` is in scope). Cache 200s in the edge cache. Add `/api/dua/search` to the root manifest `live` array.

### 4. Tests
- `worker/test/dua-search-core.test.js` (ESM): fixture of 3–4 duas; English query matches translation; English query matches by category; Arabic query matches diacritic-insensitively; category-name query works; token-AND; pagination; non-match empty.
- `worker/test/dua-corpus.test.js` (ESM): load `src/data/dua/search-corpus.json` if present (skip if absent); assert `meta.count >= 250`, `duas.length === meta.count`, every dua has a non-empty `arabic` OR `translation`, unique-ish `id`, and `meta.source` includes "Hisn al-Muslim".

### 5. DECISION entry — `doc/DECISIONS.md`
- ADR: **Dua search corpus = Hisn al-Muslim (Fortress of the Muslim) via `wafaaelmaandy/Hisn-Muslim-Json`; static JSON + Worker scan + KV; owner license/attribution review gate before the Dua pill goes public.** Rationale, provenance, license-unstated caveat + owner gate, reuse of Slice-1 normalizers.

## "Flip the Dua pill on" checklist (gates Slice 3 pill)
1. Ingest produces `search-corpus.json` with ≥250 sourced duas (integrity test green).
2. `dua-search-core` unit tests green; full `worker` suite green.
3. Deployed `/api/dua/search?q=` returns real sourced duas for a sample Arabic query and English query (each result carrying arabic/translation/category/source).
4. **Owner clears the license/attribution gate** (ADR) — until then the Slice-3 Dua pill stays "coming soon" even if 1–3 pass.

## Out of scope (Slice 2)
- Frontend / results page (Slice 3).
- Per-dua Quran/hadith citations (dataset lacks them; corpus attributes the compilation).
- Non-English dua translations.

## Verification
- `cd worker && npm test` green (Slice-1 total + new dua core/integrity tests).
- Ingest run committed; integrity test proves provenance/shape.
- Manual (deploy): `GET /api/dua/search?q=forgiveness` and `?q=<arabic>` return sourced duas; `?q=a` → 400.
