# API-SPEC.md — `/api/` Proxy Route Contracts
**Single source of truth for endpoint contracts · v1.0 · 2026-06-03**

> All external data flows through server-side proxy routes under `/api/`.
> **API keys are never in client code** — only in server env vars.
> Every route has a defined cache policy and a defined fallback; the client never
> sees an unhandled error. Fallback behavior detail lives in `ARCHITECTURE §14`;
> this document is the request/response contract.
>
> Conventions: all responses are JSON. Success = HTTP 200 with the shape under
> **Response**. On upstream failure the route returns its **Fallback** payload
> (still HTTP 200 where possible) so the page degrades gracefully. Client caches
> in `localStorage` per the keys in `DATA.md`; server caches per `ARCHITECTURE §6.4`.

---

## Route Index

| Endpoint | Method | Upstream | Cache TTL | Stage | Fallback |
|---|---|---|---|---|---|
| `/api/prayer` | GET | AlAdhan `timingsByCity` | 24h per city+date | 2 | Hardcoded London MWL times |
| `/api/nisab` | GET | Metals API (gold price) | 24h | 2 | `$6,180` hardcoded |
| `/api/verse` | GET | api.quran.com random verse | 24h, cache-bust daily | 2 | Static hardcoded verse |
| `/api/hadith` | GET | Sunnah.com `/v1/...` | 24h | 2 | Last cached response |
| `/api/geocode` | GET | BigDataCloud reverse geocode | Session | 2 | `"Near your location"` |
| `/api/quran/[surah]` | GET | api.quran.com `/v4/verses/by_chapter/{id}` | 7 days | 2 | Static seed data |
| `/api/verify` | POST | IslamicInfo corpus search | None | 1→2 | 2200 ms simulation (v1) |
| `/api/ask-claude` | POST | Anthropic API (Claude Haiku 4.5) | None (client caches 30d) | 3 | "AI unavailable" inline state |
| `/api/subscribe` | POST | Email provider | None | 2 | Inline error state |

`robots.txt` disallows `/api/` and `/data/`.

---

## GET `/api/prayer`
Prayer times for a city/date.

- **Query:** `city` (string, required), `country` (string, optional), `method` (string, optional — calc method id), `date` (`DD-MM-YYYY`, optional, default today)
- **Response:** `{ city, date, method, timings: { Fajr, Dhuhr, Asr, Maghrib, Isha, Sunrise }, source: "aladhan"|"cache"|"fallback" }`
- **Cache:** server `prayer:{city}:{date}` 24h; client `islamicinfo-prayer-{city}-{date}` 1 day
- **Fallback:** hardcoded London MWL times, `source: "fallback"`, with the date shown so stale data is visible
- **Errors handled:** upstream 5xx/timeout → fallback; missing `city` → 400 `{ error: "city required" }`

## GET `/api/nisab`
Current nisab threshold from gold price (Zakat tool).

- **Query:** `currency` (string, optional, default `USD`)
- **Response:** `{ currency, goldPricePerGram, nisabValue, asOf, source }`
- **Cache:** server `nisab:{date}` 24h; client `islamicinfo-nisab-{date}` 1 day
- **Fallback:** `nisabValue: 6180`, `source: "fallback"`; UI shows "Using cached nisab from {date}"

## GET `/api/verse`
Verse of the day (Home rotation).

- **Query:** none (server keys by date)
- **Response:** `{ surahName, surahNumber, ayahNumber, arabic, translation, translator, reference }`
- **Cache:** server `verse:{date}` 24h, cache-bust at midnight UTC
- **Fallback:** static hardcoded verse (last-known)
- **Content note:** subject to CONTENT-POLICY — Arabic only from authoritative source; translation labeled.

## GET `/api/hadith`
Hadith of the day, or a hadith for a collection/book.

- **Query:** `collection` (slug, optional), `book` (number, optional). No params → hadith of the day (always Sahih).
- **Response:** `{ collection, book, number, narrator, grade, gradedBy, arabic, translation, translator, sourceUrl }`
- **Cache:** server `hadith:{date}` (daily) and `hadith:{collection}:{book}:{date}` 24h; client `islamicinfo-hadith-{collection}-{book}-{date}`
- **Fallback:** last cached response
- **Content note:** the verifier skill governs any hadith surfaced; `grade` and `gradedBy` are mandatory; daily hadith always carries the SAHIH badge.

## GET `/api/geocode`
Reverse-geocode coordinates to a city label (prayer-time UX).

- **Query:** `lat` (number, required), `lon` (number, required)
- **Response:** `{ city, region, country }`
- **Cache:** session
- **Fallback:** `{ city: "Near your location" }`; if geolocation denied, UI shows manual city input

## GET `/api/quran/[surah]`
Verses for one surah (Quran Explorer reader).

- **Path:** `surah` (1–114)
- **Query:** `translations` (comma ids, default `20,85,95` — 20 = Saheeh Int'l, 85 = Abdel Haleem, 95 = Maududi; id 131 no longer exists upstream, see ADR-014), `audio` (reciter id, optional)
- **Response:** `{ surahNumber, verses: [ { ayah, arabic, translations: [{id, translator, text}], audioUrl? } ] }`
- **Audio:** EveryAyah CDN — `https://everyayah.com/data/{reciter_path}/{surah_padded}{ayah_padded}.mp3`
- **Cache:** server `quran:{surah}` 7 days; client `ii-quran-translation` stores chosen edition
- **Fallback:** static seed data (Surah 1 hardcoded); on audio 404, `audio.onerror` → "Audio unavailable for this ayah"

## POST `/api/verify`
Claim verification against the IslamicInfo corpus (Verify page).

- **Body:** `{ query: string, mode?: "quran"|"hadith"|"general" }`
- **Response:** `{ query, results: [ { type, sourceRef, grade?, excerpt, sourceUrl, confidence } ], disclaimer }`
- **Cache:** none
- **v1:** 2200 ms simulation returning a static demo result; `populateResults(data)` is the production swap point (ARCHITECTURE §16)
- **Content note:** `disclaimer` is a **hard-coded** string (CONTENT-POLICY §3); results never assert a ruling — they report what sources say.
- **Errors handled:** 503 → error banner "Verification service unavailable"; empty → empty state + "Try a different search" + Verify CTA

## POST `/api/ask-claude`  *(Stage 3 — implemented Module 5B, 2026-07-15)*
Proxied Anthropic call for the Quran verse AI-explanation panel (`.ai-card`).

- **Body:** `{ context: string, question: string, sourceRef?: string }`
- **Upstream:** model `claude-haiku-4-5`, `max_tokens: 500`. Key is a Worker secret (`env.ANTHROPIC_API_KEY`) — never in client/HTML/`wrangler.toml` (RULE 6).
- **Guards (abuse/cost):** POST-only; **Origin must be in the Worker's `ALLOWED_ORIGINS`** → 403; **input caps** — `context` ≥3 chars trimmed and ≤4000 chars (4000 covers the longest verse, Al-Baqarah 2:282, + translation), `question` ≤200, `sourceRef` ≤40 → 400; missing key → 503. Output cost is bounded by `max_tokens: 500`, not the input cap.
- **Response:** `{ answer, attribution, sourcesCited: [sourceRef?] }` where `attribution = "Powered by QuranlyAI"` (brand-mandated AI attribution, CONTENT-POLICY §3/§8). The `.ai-card` footer renders **"✦ Powered by QuranlyAI ↗ · Not a religious ruling"** — combining the brand attribution with the §4 no-fatwa framing.
- **Cache:** none server-side (POST). **Client** caches per verse in `localStorage['ii-quran-ai-{verseKey}-{editionSlug}']` (30-day freshness) — re-opening a verse never re-bills. Cross-user KV cache + in-Worker per-IP rate-limit are deferred (need a binding; v1 uses a Cloudflare **dashboard** rate-limit rule + input caps).
- **Hard-coded, non-overridable system-prompt safety (see CONTENT-POLICY §4):**
  - never issues a fatwa or ruling (no halal/haram/obligatory/forbidden verdicts)
  - explains **only** from the provided verse + translation — invents no hadith, Arabic, citations, names, dates, or numbers
  - ruling requests → "For personal religious guidance, consult a qualified scholar"
- **Server post-filter:** verdict-language (framing-based detector — conservative v1 backstop; final term set owned by the 🕌 reviewer per §4/§6) → replace answer with the scholar-redirect line, keep attribution, log. The **client** re-runs the identical check on both the cache-read and fresh-fetch paths (defense-in-depth).
- **Fallback:** "AI explanation unavailable — please try again" inline (retry, not cached); attribution still shown.
- **Content gate:** AI output on scripture → ships **pending 🕌 human-review sign-off** (CONTENT-POLICY §5), like Modules 2 & 3.

## POST `/api/subscribe`
Email capture (Knowledge Hub).

- **Body:** `{ email: string, source?: string }`
- **Response:** `{ ok: true }` on success
- **Cache:** none
- **Validation:** server-side email format check → 400 on invalid
- **Fallback:** inline error state; no redirect on success (success state shown in place)
- **Privacy:** no PII beyond email; GA4 events carry no PII

---

## Madina Mushaf + Tajweed (Module 5a — client-direct, keyless)

These are **third-party read-only** endpoints called directly from the client (no `/api/`
proxy — they are public, keyless, and CORS-enabled). Documented here so shapes are not guessed.

### Mushaf page layout — `GET https://api.quran.com/api/v4/verses/by_page/{page}`
- **Params:** `words=true&word_fields=code_v2,line_number,page_number,char_type_name,position&fields=juz_number,hizb_number,page_number&per_page=50&mushaf=1`
- **Returns:** `{ verses: [{ verse_key, verse_number, juz_number, hizb_number, words: [{ code_v2, line_number, char_type_name('word'|'end'), position }] }] }`
- **Use:** `quran-mushaf-core.buildPageModel()` groups words **by `line_number`** (one printed line may span verses) and derives `surah_name`/`basmallah` header lines from empty line-gaps above each surah start.
- **Cache/fallback:** 8s timeout + abort; on failure → toast + revert to Study Mode.
- **Fallback host** (if keyless access ever changes): `https://apis.quran.foundation/content/api/v4` (may require a client key).

### Tajweed (flowing Study view) — field on `verses/by_chapter`
- Add `text_uthmani_tajweed` to the existing `fields=` list. Returns Uthmani HTML with
  `<tajweed class="madda_normal|ghunnah|ikhafa|idgham_*|iqlab|qalqalah|ham_wasl|…">` spans.
- `quran-tajweed-core.colorize()` maps the ~15 classes → 5 site families (`tj-madd/ghunna/ikhfa/idgham/qalqalah`); neutral classes unwrap to plain text.

### QCF fonts — `https://verses.quran.foundation/fonts/quran/hafs/…` (CDN, on-demand)
- **Plain (v2):** `v2/woff2/p{1..604}.woff2`, `@font-face` family `p{N}-v2`.
- **Tajweed (v4, colored):** `v4/colrv1/woff2/p{N}.woff2` (COLRv1 + palettes; Chrome/Safari/Edge)
  and `v4/ot-svg/{light|dark}/woff2/p{N}.woff2` (Firefox). Family `p{N}-v4`. Same `code_v2`
  glyphs + identical page geometry as v2 — Tajweed Mode in Mushaf is a **font swap only**.
- Loaded via `FontFace` (only visited page + prefetch next). Glyph codes injected via
  `innerHTML` (Private-Use-Area chars). **CSP:** allow `verses.quran.foundation` in `font-src`.

---

## Tafsir + Daily Reflection (client-direct, keyless, free)

Client-direct free CORS APIs (no `/api/` proxy — the Worker's `/api/hadith` is 501 and there
is no `/api/tafsir`/`/api/dua`; these work on GitHub Pages too).

### Tafsir (per-ayah, 3 English sources)
- **Primary:** spa5k/tafsir_api (jsDelivr CDN) —
  `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/{slug}/{surah}/{ayah}.json` → `{text}` (plain).
  Slugs: Ibn Kathir `en-tafisr-ibn-kathir`, Ma'arif `en-tafsir-maarif-ul-quran`, Jalalayn `tafsir-al-jalalayn`.
- **Fallback:** quran.com v4 `https://api.quran.com/api/v4/tafsirs/{id}/by_ayah/{s:a}` → `{tafsir:{text}}` (HTML).
  Ids: Ibn Kathir 169, Ma'arif 168. (Jalalayn has no quran.com id — spa5k only.)
- **Note:** al-Tabari/al-Qurtubi/As-Sa'di have NO free English data (Arabic/PDF only).
  As-Sa'di English = future archive.org OCR ingest.

### Daily Reflection
- **Verse:** `https://api.alquran.cloud/v1/ayah/{s:a}/editions/quran-uthmani,en.sahih` → `{data:[ar,en]}`.
  Daily pick from a curated reflection-verse list (`reflection-core.verseRefs`).
- **Hadith / Dua:** curated static seeds `src/data/reflection-hadith.json` (Sahih Bukhari via
  fawazahmed0) + `reflection-dua.json` (Hisnul Muslim via dua-dhikr). UTC-daily rotation. No live call.

### Related Verses (topic index — knowledge index slice 1)
- **Source:** static JSON — `src/data/related-verses/topics.json` (topic → verses) and
  `src/data/related-verses/verse-index.json` (verse → topic slugs). No `/api/` route in this
  slice, and the AI is **not** involved — every row is pre-verified by a human curator with a
  `sourceCitation` baked in at build time (see `DATA.md`).
- **Deferred:** `/api/index/related-verses` (and D1 + FTS5 for the full corpus) are deferred to
  the Hadith cycle, alongside Related Hadith and Vocabulary (see `TASKS.md`).

### Related Hadith (topic index — knowledge index slice 2)
- **Source:** static JSON — `src/data/related-hadith/topics.json` (topic → hadith rows),
  reusing the slice-1 `src/data/related-verses/verse-index.json` (verse → topic slugs). No
  `/api/` route in this slice, and the AI is **not** involved. Curation source is
  hadithapi.com, hand-authored into `tools/related-hadith/topics.source.json` and compiled by
  `tools/related-hadith-build.mjs` (see `DATA.md`).
- **Content gate:** every row passes the hadith-verifier skill gate (Sahih/Hasan grade only,
  verified isnad) *and* a human-review gate — the build emits only `reviewed:true` rows.
  Production is **gated on 🕌 sign-off** (CONTENT-POLICY §5). Sign-off completed 2026-07-17:
  the index now ships **6 hadith across 4 topics** (patience, mercy, gratitude, truthfulness).
- **Deferred:** `/api/index/*` (and D1 + FTS5 for the full corpus) remain deferred to the
  Vocabulary slice (see `TASKS.md`).

---

## Cross-Cutting Rules

- **No secret in client.** Any new route that touches a keyed API must be added here *and* implemented as a `/api/` proxy before client code calls it.
- **Every new route declares:** method, params, response shape, cache TTL, fallback, and (if it returns Islamic content) its CONTENT-POLICY obligations.
- **Universal call pattern** (cache-first, fallback-on-error) is in `ARCHITECTURE §14.1` — all client fetches follow it.
- **Adding/changing a route** is an architectural decision → record it in `docs/DECISIONS.md`.

---
*Derived from ARCHITECTURE §5–§6 and §14. Keep this file in sync when routes change —
it is the contract Claude Code reads to avoid guessing endpoint shapes.*
