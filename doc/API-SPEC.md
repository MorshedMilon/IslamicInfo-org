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
- **Guards (abuse/cost):** POST-only; **Origin must be in the Worker's `ALLOWED_ORIGINS`** → 403; **input caps** — `context` (trimmed) 3–1500 chars, `question` ≤200, `sourceRef` ≤40 → 400; missing key → 503.
- **Response:** `{ answer, attribution, sourcesCited: [sourceRef?] }` where `attribution = "AI-generated to aid understanding — not a religious ruling."` *(supersedes the earlier placeholder "Powered by QuranlyAI").*
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

## Cross-Cutting Rules

- **No secret in client.** Any new route that touches a keyed API must be added here *and* implemented as a `/api/` proxy before client code calls it.
- **Every new route declares:** method, params, response shape, cache TTL, fallback, and (if it returns Islamic content) its CONTENT-POLICY obligations.
- **Universal call pattern** (cache-first, fallback-on-error) is in `ARCHITECTURE §14.1` — all client fetches follow it.
- **Adding/changing a route** is an architectural decision → record it in `docs/DECISIONS.md`.

---
*Derived from ARCHITECTURE §5–§6 and §14. Keep this file in sync when routes change —
it is the contract Claude Code reads to avoid guessing endpoint shapes.*
