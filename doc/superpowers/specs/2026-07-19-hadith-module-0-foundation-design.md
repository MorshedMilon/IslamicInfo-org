# Hadith Module 0 — Data Foundation, Backend Proxy & Content Safety

> Design spec · 2026-07-19 · Page: `hadith.html` (Hadith Library)
> Status: **Approved** (design), pending spec review → implementation plan
> Companion docs: PRD v1.1, Functional Doc v1.0, TechSpec, API-SPEC.md, DATA.md, CONTENT-POLICY.md

---

## 1. Purpose & Scope

Module 0 builds the **secure backend + content-safety foundation** that every later Hadith
Library module consumes. It ships **no visual feature wiring** — the locked `hadith.html`
design is untouched — except for a set of **safe, shared frontend utilities** (loading /
error / toast / focus-trap / escaping) that layer onto the existing client without changing
any markup.

The single blocker it clears: `/api/hadith` is currently a 501 stub
([worker/src/index.js:162](../../../worker/src/index.js), `PENDING` array). Module 0 makes it
real.

**In scope:** Worker hadith router, hadithapi.com adapter + normalized schema, KV caching,
input validation / rate-limit / timeout, content-safety gate, shared frontend utils, unit
tests, doc/ADR updates.

**Out of scope (later modules):** rendering into `hadith.html`, isnad/narrator/trace UI,
bookmarks/notes/audio/AI wiring, curator enrichment pipeline.

---

## 2. Key Decisions (resolved during brainstorming)

| # | Decision | Rationale |
|---|---|---|
| D1 | **Cloudflare-native** (Worker + KV), not Supabase Postgres | Matches the real, deployed stack; no new vendor/secret surface; reuses existing `worker/src/lib/*` + test harness. The 13-table Postgres schema in the Module 0 prompt is deferred as YAGNI until a curator-enrichment pipeline actually exists. Cloudflare D1 is a future option **only if** relational curation later needs it. |
| D2 | **hadithapi.com is the sole hadith source** | Explicit user override of the Sunnah.com references in existing docs. Requires an ADR + updates to API-SPEC.md / DATA.md. |
| D3 | **REST sub-path endpoints** (`/api/hadith/collections/...`) are canonical | Cleaner than the legacy `/api/hadith?collection=&book=` query-param contract in api.js; matches the PRD route map. Old contract superseded via ADR; api.js gains matching methods. |
| D4 | `narrators/:id` **stubbed** to `{status:'unavailable'}`; `verify-or-enrich` **deferred** | No curator store exists yet, so there is nothing behind an enrichment write path. Honest "unavailable" until curation is built. |
| D5 | Enrichment (isnad, reliability, commentary, alt-gradings, related, audio) renders **explicit unavailable** | Content-policy: never fabricate. Only grade + grader (from hadithapi's `status`) are authoritative in Module 0. |

---

## 3. Verified hadithapi.com Contract

Grounded from the live docs (not memory). **Caveat:** the public docs expose endpoints,
auth, slugs, params, and status codes but **not the response body field names** — those
require a live API key to observe. The adapter is therefore built against a fixture with
field mappings explicitly marked `ASSUMPTION — verify vs live key`.

- **Auth:** register → API key on profile → passed as `?apiKey=` **query param, server-side only**.
- **Books:** `GET https://hadithapi.com/public/api/books?apiKey=`
- **Chapters:** `GET https://hadithapi.com/api/{bookSlug}/chapters?apiKey=`
- **Hadiths:** `GET https://hadithapi.com/api/hadiths/?apiKey=` — filters: `book` (slug),
  `chapter`, `status` (`Sahih`/`Hasan`/`Da'eef`), `hadithNumber`,
  `hadithEnglish`/`hadithArabic`/`hadithUrdu` (search), `paginate` (default 25, max 200), `page`.
- **Book slugs:** `sahih-bukhari`, `sahih-muslim`, `al-tirmidhi`, `abu-dawood`,
  `ibn-e-majah`, `sunan-nasai`, `mishkat`, `musnad-ahmad`, `al-silsila-sahiha`.
- **Status codes:** 200 OK · 401 invalid key · 403 missing key · 404 not found.

Sources: hadithapi.com/ , hadithapi.com/docs/hadiths , hadithapi.com/public/docs/books.

---

## 4. API Surface

Extend the existing Worker: remove `/api/hadith` from `PENDING`; add `worker/src/hadith.js`
router dispatched from `worker/src/index.js`.

**Built in Module 0:**

| Endpoint | Purpose | Cache |
|---|---|---|
| `GET /api/hadith/collections` | normalized collections list | KV 7d |
| `GET /api/hadith/collections/:slug/books` | chapters within a collection | KV 7d |
| `GET /api/hadith/collections/:slug/books/:bookNum/hadiths?page=&limit=` | paginated feed | KV 24h |
| `GET /api/hadith/:slug/:bookNum/:hadithNum` | single hadith | KV 24h (immutable) |
| `GET /api/hadith/search?q=&scope=&lang=&page=` | search (`q` trimmed ≥2 chars) | KV 1h |
| `GET /api/hadith/daily` | hadith of the day (KV-scheduled) | KV to midnight UTC |

**Stubbed / deferred (D4):**
- `GET /api/hadith/narrators/:id` → `{ status:'unavailable' }` (200, honest).
- `POST /api/hadith/verify-or-enrich` → **not built** in Module 0 (future curation module).

All responses use a **uniform envelope** so the client never sees an unhandled error:
`{ ok:boolean, data?, error?:{code,message,retryable:boolean}, source:'live'|'cache'|'fallback' }`.

---

## 5. Adapter & Normalized Schema

`worker/src/lib/hadith-adapter.js` — a **pure, unit-tested** function converting hadithapi.com
payloads to the internal normalized object. Defensive by contract: unconfirmed fields map to
explicit status, never to a guess or an omission.

```
Hadith {
  id, source:'hadithapi', sourceId,
  collectionSlug, collectionName, collectionArabicName,
  bookNumber, bookName, bookArabicName,
  hadithNumber, reference,
  arabicMatn,
  translation: { text, language, edition, translator },
  narrator:    { id?, name?, arabicName? },
  grade: { value:'sahih'|'hasan'|'daif'|'mawdu'|'unknown', label, grader,
           sourceCitation?, disputed:boolean, alternateGradings?:[] },
  isnad: { status:'available'|'unavailable', narrators:[] },   // always 'unavailable' in M0
  topics: [],
  audio:  { status:'unavailable', url?, reciter? },            // always 'unavailable' in M0
  sourceMetadata: { fetchedAt, sourceUrlOrId, contentHash, verificationStatus }
}
```

**Normalization rules:**
- Missing/blank `status` → `grade.value:'unknown'`, `label:'Grade Unknown'` — **the badge is
  never dropped** (content-policy + TechSpec §7.1).
- `contentHash` = stable hash of (arabicMatn + translation.text + reference) for audit/dedup.
- `verificationStatus` starts `'source-only'`; upgraded only by a future curator record.

---

## 6. Storage & Caching (KV — reuse `worker/src/lib/cache.js`)

| Key | TTL |
|---|---|
| `hadith:collections` | 7d |
| `hadith:chapters:{slug}` | 7d |
| `hadith:list:{slug}:{book}:{page}` | 24h |
| `hadith:one:{slug}:{book}:{num}` | 24h (immutable payload) |
| `hadith:daily:{YYYY-MM-DD}` | to midnight UTC |
| `hadith:search:{sha256(q+scope+lang+page)}` | 1h |

- Nothing user-specific is ever written to public cache.
- Every upstream call: `AbortController` timeout (8s data / 10s search) → on failure serve
  cached copy, else static fallback (`/api/hadith/daily` falls back to Bukhari #1), `source:'fallback'`.

---

## 7. Content-Safety / Verification Gate

- Grade + grader come **directly** from hadithapi's `status` field; weak/disputed narrations
  carry the exact project-doc notice strings ( `[GRADE DISPUTED]` + both named graders, no
  resolution ).
- **All enrichment** (isnad, narrator reliability, commentary, alternate gradings, related
  narrations, audio) is served **only** from a curator-verified store. That store does not
  exist yet → every such field returns explicit `unavailable`. No fabrication, ever.
- No AI surface, no fatwa/ruling path in Module 0.
- Reuse `worker/src/lib/safety.js` patterns for validation; extend where hadith-specific.

---

## 8. Shared Frontend Utilities (safe, no markup change)

Add to a shared util module consumed by the existing client (layers onto
[src/js/api.js](../../../src/js/api.js); does **not** touch `hadith.html` markup):
`apiFetchWithTimeout()`, `safeLocalStorageGet()`, `safeLocalStorageSet()` (QuotaExceeded →
existing-style toast "Storage full — clear some bookmarks or notes"), `showToast()`,
`renderLoadingState()` / `renderErrorState()` (match the locked skeleton look), `escapeHTML()`,
`focusTrap()`, analytics event helper. New api.js methods for the REST sub-path endpoints (D3).

---

## 9. Validation, Rate-Limit, Timeout

- Collection slug must be in the allowed set; `bookNum`/`hadithNum` positive integers → 400 on violation.
- Search `q` trimmed ≥2 chars (client debounce 300ms is a later-module concern).
- Rate-limit reuses `worker/src/lib/quota.js` pattern (per-IP/fingerprint) where applicable.
- Secrets: `HADITH_API_KEY` + `HADITH_API_BASE_URL` as Worker secrets / `.dev.vars` — **never**
  in client, HTML, or `wrangler.toml` (RULE 6).

---

## 10. Tests (Vitest, mirroring `worker/test/`)

- Adapter normalization against fixture (happy path + partial payloads).
- Missing grade → `grade.value:'unknown'`, badge present (not omitted).
- Missing isnad/audio → `status:'unavailable'`.
- Invalid deep-link params rejected (bad slug, non-positive num) → 400 retryable=false.
- Search `<2` chars rejected.
- **No secret leaks to any client bundle** (grep guard).
- Every endpoint returns the uniform retryable envelope on simulated upstream 5xx/timeout.
- Playwright E2E is **thin** in Module 0 (health/contract checks only) — full UI flows land
  when `hadith.html` is wired in a later module.

---

## 11. Dependencies & Risks

- **Blocker:** requires a hadithapi.com account + `HADITH_API_KEY`. Adapter + unit tests build
  against fixtures without it; **live field-mapping verification and real-data E2E need the key.**
- **Doc debt (this module fixes):** update API-SPEC.md + DATA.md (Sunnah.com → hadithapi.com;
  query-param → REST paths); add ADRs for D2 (source) and D3 (path convention) in DECISIONS.md.
- **Field-mapping risk:** exact hadithapi response fields unverified from public docs — mapped
  as `ASSUMPTION` in the adapter, confirmed against a live response before the module is "done".
- **Content gate:** any surfaced hadith is subject to the CONTENT-POLICY §5 human-review gate.

---

## 12. Definition of Done (Module 0)

- [ ] All six live endpoints + two stub/deferred behaviors implemented per §4, uniform envelope.
- [ ] Adapter normalizes to §5 schema; grade badge never omitted; enrichment = `unavailable`.
- [ ] KV keys/TTLs per §6; timeout + fallback verified.
- [ ] No API key in any client artifact (test-guarded).
- [ ] Unit tests green (§10); doc/ADR updates committed (§11).
- [ ] Standard per-module report produced (elements handled, files/endpoints added, fields
      rendered, acceptance checklist PASS/FAIL, verification note).
