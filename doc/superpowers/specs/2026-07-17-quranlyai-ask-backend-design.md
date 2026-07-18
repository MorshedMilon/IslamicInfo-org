# QuranlyAI `/api/quranlyai/ask` — Backend Design

- **Date:** 2026-07-17
- **Status:** Approved (design), pending implementation plan
- **Author:** Claude Code session
- **Endpoint:** `POST /api/quranlyai/ask` (Cloudflare Worker)
- **Related docs:** `doc/API-SPEC.md`, `doc/CONTENT-POLICY.md`, `doc/DECISIONS.md`, `doc/architecture/ARCHITECTURE.md`

---

## 1. Purpose

Add an educational Islamic learning assistant endpoint to the existing IslamicInfo.org
API Worker. It explains authentic Quran / Hadith / Dua / Tafsir content **using only
verified sources supplied in the prompt**, never issues fatwas or rulings, and enforces
per-user quota + response caching to control cost.

This is a richer sibling of the existing live `POST /api/ask-claude`. That endpoint stays
untouched; the new one adds quota, caching, grounded lookups, action variants, model
routing, and a (safety-buffered) streaming response.

---

## 2. Reconciliation with the original task spec

The task brief assumed infrastructure that does not match the repo. Corrections, all
confirmed with the user:

| Task brief assumed | Reality in repo | Decision |
|---|---|---|
| Cloudflare **D1** for quota + cache | D1 was evaluated and **dropped as unnecessary** (`doc/TASKS.md`, `doc/API-SPEC.md`); repo has zero D1/KV/SQL | Use **Cloudflare KV**. No migrations. |
| Knowledge Index served from `/api/index/*` endpoints | Index ships as **static JSON** in `src/data/**` with pure cores in `src/js/quran-*-core.js`; those HTTP endpoints do not exist | **Bundle** the JSON + reuse the cores directly in the Worker. No new endpoints. |
| Token streaming as generated | Hard content-safety invariant: the no-fatwa filter needs the **complete** text | **Buffer → filter → stream** the safe text. |
| Guest / free / premium tiers | Static site, **no auth/account system** | Tiers **on hold**. Single guest quota now; `resolveTier()` stub isolated for later. |

---

## 3. Locked decisions

1. **Datastore:** Cloudflare **KV**, one namespace, two key prefixes (`quota:`, `cache:`). TTL does expiry for both. No migrations, no SQL.
2. **Grounding:** Import `src/data/**` JSON and reuse the existing pure cores (`relatedVerses`, `relatedHadith`, `keyTermsForVerse`) directly in the Worker bundle. Single source of truth.
3. **Streaming:** Buffer the full AI output → run the safety filter → stream the *safe* text to the client. No unsafe token can reach the client.
4. **Existing endpoint:** `/api/ask-claude` stays live and unchanged. Shared safety code is **extracted** into a module both routes import. Migrating `src/js/quran-ai.js` to the new endpoint is a later, separate task.
5. **Tiers:** not built. Single guest quota (default 3/day). `resolveTier()` always returns `"guest"` today.

---

## 4. Request contract

`POST /api/quranlyai/ask`

```jsonc
{
  "context": {
    "type": "quran" | "hadith" | "dua" | "article" | "search",
    "surah": 2, "ayah": 255,
    "hadithBook": "Sahih al-Bukhari", "hadithNumber": 50,
    "duaId": "morning-dua-1",
    "articleId": "string",
    "translationId": "en-saheeh",
    "tafsirSource": "ibn-kathir",
    "language": "en",
    "rawText": "ONLY the specific verse/hadith/dua text — never full page"
  },
  "action": "explain" | "simple" | "summarize_tafsir" | "key_lessons"
          | "related_verses" | "related_hadith" | "asbab_al_nuzul"
          | "compare_translations" | "vocabulary" | "custom",
  "customQuestion": "string (only when action = custom)",
  "userIdOrFingerprint": "string"
}
```

**Validation** (same discipline as `handleAskClaude`):
- `context.rawText` trimmed length 3–4000; else `400`.
- `customQuestion` ≤ 200 chars; else `400`.
- `action` must be in the allowed set; else `400`.
- `userIdOrFingerprint` required, ≤ 128 chars; else `400`.
- Body must be valid JSON; else `400`.

---

## 5. Response contract

**Content-Type:** `text/event-stream` (SSE).

- Zero or more token events: `data: {"delta":"<text chunk>"}\n\n`
- One terminal event carrying metadata:
  ```
  event: done
  data: {"sources":[...],"confidence":"High|Medium|Low","model":"...",
         "cached":true|false,"remaining":<int>}
  ```
- Response headers include `X-Cache: HIT|MISS`.

The streamed body text follows the fixed **RESPONSE FORMAT** (see §8): `**Answer**`,
`**Key Lessons**`, `**Sources**`, `**Confidence**`, `**Note**` footer.

**Streaming caveat (documented, accepted):** because the safety filter needs the whole
response, the Worker fully generates and filters before emitting. Time-to-first-token ≈
full generation time; the stream is a progressive render of already-safe text, not early
tokens. This is the deliberate price of the "no fatwa, ever" invariant.

---

## 6. Server pipeline (executes in this order)

1. **CORS / origin** — reuse `ALLOWED_ORIGINS`. Off-list → `403`.
2. **Validate** body (§4). Bad → `400`.
3. **Quota check** — KV `quota:{fingerprint}:{utcDate}`, value = count, TTL to UTC
   midnight (`secondsUntilUTCMidnight()`). If `count >= limit` → `429 {remaining:0}`.
   Checked on **every** request; incremented only after a real generation (step 8), so
   cache hits never burn quota.
4. **Cache check** — KV `cache:{sha256}` (helper `hashContext`). Hit → set `X-Cache: HIT`,
   stream cached safe text, emit `done` with `cached:true`, **no** AI call, **no** quota
   increment. Miss → continue.
5. **Grounding** — only `related_verses` / `related_hadith` / `vocabulary`:
   - `related_verses` → `relatedVerses(verseKey, topics, verseIndex, opts)`
   - `related_hadith` → `relatedHadith(verseKey, hadithTopics, verseIndex, opts)`
     (dataset currently empty/staged → yields the "not documented in available sources"
     grounding, honestly surfaced)
   - `vocabulary` → `keyTermsForVerse(verseKey, topicTerms, verseIndex, terms)` (+
     `termCrossRefs` when a specific term is asked)
   - `asbab_al_nuzul` → no dataset exists → "not documented in available sources"
   - all other actions → ground on `context.rawText` only.
   Verified results are injected into the prompt as the ONLY factual source.
6. **Model routing** —
   - `simple` / `summarize_tafsir` / `vocabulary` / `key_lessons` → `claude-haiku-4-5`
   - `custom` **or** ruling-adjacent (see `looksRulingAdjacent()`) → `claude-sonnet-5`
   - `explain` / `related_*` / `compare_translations` / `asbab_al_nuzul` → `claude-haiku-4-5`
7. **Generate + safety** — call Anthropic (buffered, `max_tokens` per action, 15s abort).
   Run `verdictLangDetected()` on the complete text. If ruling language detected, or the
   model refused, replace the body with the **RULING_DEFLECTION** template (with any
   grounded sources appended).
8. **Persist (via `ctx.waitUntil`, off the response path)** — write safe text to
   `cache:{sha256}`, increment `quota:{fingerprint}:{utcDate}`.
9. **Stream out** the safe text as SSE (§5).

---

## 7. Cache key (`hashContext`)

`sha256` (Web Crypto `crypto.subtle.digest`) over a **canonical** JSON string built from a
stable, sorted field set:

```
{ type, surah, ayah, hadithBook, hadithNumber, duaId, articleId,
  translationId, tafsirSource, language, action, customQuestion }
```

`rawText` is excluded from the key derivation only if a stable id set exists; when the
context is `search`/free-form with no ids, include a hash of `rawText` so distinct texts
cache separately. Language and translation are always part of the key so different
translations never collide.

---

## 8. System prompt & response format

The new endpoint uses the **stricter QuranlyAI system prompt** from the task brief
(supersedes the terse `ask-claude` prompt for this route):

- Answer ONLY from sources provided in the prompt. Never rely on training knowledge of
  Quran/Hadith/Tafsir text.
- If sources don't fully support an answer, say so — do not fill gaps.
- Never issue a fatwa / halal-haram verdict / legal ruling / sectarian side.
- Fiqh/ruling questions → **RULING_DEFLECTION** template (scholar redirect + relevant
  sources), never an indirect ruling.
- Never invent a verse number, hadith reference, tafsir citation, or date. Unsure →
  "not available in provided sources."
- Every response ends with a **Sources** block and a **Confidence** rating.

**RESPONSE FORMAT** (always):

```
**Answer**
[plain-language explanation, tone per requested simplicity]

**Key Lessons**
- ...

**Sources**
- Quran: [surah:ayah]
- Hadith: [collection, number]
- Tafsir: [scholar]

**Confidence**: High | Medium | Low

**Note**: Educational explanation only. Not a fatwa. Consult a qualified scholar for religious rulings.
```

**Action → prompt variant:**

| Action | Variant behavior |
|---|---|
| `explain` | standard explanation of `rawText` |
| `simple` | + "explain as if to a 12-year-old" |
| `summarize_tafsir` | cap output to **5 bullets max** |
| `key_lessons` | Key Lessons block only |
| `related_verses` | grounded list from core; explain relationships, no new verses |
| `related_hadith` | grounded list from core; empty → "not documented" |
| `asbab_al_nuzul` | only if dataset exists (none today) → "not documented" |
| `compare_translations` | explain wording differences without inventing intent |
| `vocabulary` | grounded term(s); cross-reference Quran + Hadith usage |
| `custom` | free text `customQuestion`, still bound by system prompt |

The **RULING_DEFLECTION** and safety regexes are the shared `verdictLangDetected()` /
`SCHOLAR_REDIRECT` logic extracted from the current Worker; the human 🕌 reviewer owns the
final ruling-term set per `doc/CONTENT-POLICY.md` §4/§6.

---

## 9. Model routing detail

- Cheap model: `claude-haiku-4-5` (matches current `/api/ask-claude`).
- Strong model: `claude-sonnet-5` (custom + ruling-adjacent questions).
- `looksRulingAdjacent(text)` — conservative keyword heuristic (e.g. riba, interest,
  bitcoin, halal, haram, divorce, permissible, forbidden, obligatory). Used **only** to
  upgrade the model, not to decide the answer; the system prompt + post-filter remain the
  actual safety mechanism.
- `max_tokens` per action: standard actions ~500; `summarize_tafsir` and `key_lessons`
  smaller; `custom` up to ~800. Exact values set in `prompts.js`.

---

## 10. Quota

- KV key `quota:{fingerprint}:{utcDate}` → integer count string, TTL =
  `secondsUntilUTCMidnight()`.
- Guest limit: **3/day** (single `GUEST_DAILY_LIMIT` constant, easy to change).
- `resolveTier(request, env)` → always `"guest"` today; the only place tier logic lives, so
  accounts can be wired in later without touching the pipeline.
- Increment is read-modify-write (`get` → `+1` → `put` with remaining TTL). KV is
  eventually consistent; acceptable for a soft cost-guard quota (documented limitation —
  a determined user could race a few extra calls; not a security control).

---

## 11. File layout

```
worker/src/index.js            add one route branch to the dispatcher
worker/src/quranlyai.js        orchestrator: the §6 pipeline
worker/src/lib/cors.js         extracted json/err/corsHeaders/ALLOWED_ORIGINS (shared)
worker/src/lib/safety.js       QuranlyAI system prompt + verdict filter + deflection +
                               looksRulingAdjacent (shared with ask-claude via extraction)
worker/src/lib/quota.js        KV quota check/increment + resolveTier() stub
worker/src/lib/cache.js        hashContext + KV get/put
worker/src/lib/grounding.js    imports bundled data + cores; grounding text per action
worker/src/lib/prompts.js      action → prompt-variant + max_tokens builder
worker/src/lib/anthropic.js    model routing + Anthropic call (buffered)
worker/wrangler.toml           add [[kv_namespaces]] binding (first binding in repo)
```

- `grounding.js` imports `../../src/data/related-verses/topics.json`,
  `../../src/data/related-verses/verse-index.json`,
  `../../src/data/related-hadith/topics.json`, `../../src/data/vocab/terms.json`,
  `../../src/data/vocab/topic-terms.json`, and the cores from `../../src/js/quran-*-core.js`.
- **Bundling risk (flagged, not a blocker):** the cores use a UMD `module.exports` guard.
  If esbuild's CJS→ESM interop does not expose the export cleanly in the Worker bundle,
  add a ~3-line ESM shim that requires the core and re-exports its functions. Verify during
  first `wrangler dev`.
- Refactor `index.js` to import `json/err/corsHeaders/ALLOWED_ORIGINS` from `lib/cors.js`
  and the safety helpers from `lib/safety.js`, keeping `handleAskClaude` behavior identical.

---

## 12. Configuration & secrets

- `ANTHROPIC_API_KEY` — Worker **secret** (already the pattern; never in `wrangler.toml`).
- `[[kv_namespaces]]` binding, e.g. `QURANLYAI_KV` — added to `wrangler.toml`; namespace
  created via `wrangler kv namespace create`.
- No new frontend wiring in this task (client migration is deferred).

---

## 13. Error responses (explicit)

| Condition | Status | Body |
|---|---|---|
| Off-list origin | `403` | `{error:"forbidden origin"}` |
| Missing/oversized context or bad action | `400` | `{error:"..."}` |
| Quota exceeded | `429` | `{remaining:0}` |
| No API key configured | `503` | `{error:"AI temporarily unavailable"}` |
| Provider failure / timeout | `502` | `{error:"AI explanation unavailable — please try again"}` |

All via the shared `err()` helper. Errors are JSON (not SSE) so the client can distinguish
a failed request from a stream.

---

## 14. Testing

- **Unit (Node, `tests/quran/`):** `hashContext` determinism + field sensitivity;
  `looksRulingAdjacent` keyword coverage; `verdictLangDetected` reused-behavior parity;
  grounding functions return verified shapes for a known verse and empty for staged hadith;
  quota math (increment, limit boundary, TTL).
- **Integration (`wrangler dev`):** happy path per action; quota `429` after limit; cache
  `HIT` on repeat; ruling-adjacent question returns the deflection template; grounded
  actions never emit a source absent from the bundled data.
- **Safety:** a prompt-injection attempt in `customQuestion` cannot produce a verdict; a
  fiqh question ("Is interest halal?") returns RULING_DEFLECTION.

---

## 15. Out of scope (YAGNI / deferred)

Account auth, free/premium tiers, D1, FTS5, `/api/index/*` HTTP endpoints, asbab/tafsir
datasets, and migrating `src/js/quran-ai.js` to the new endpoint. Each is a separate future
task.

---

## 16. Follow-ups to record on approval

- ADR in `doc/DECISIONS.md`: "QuranlyAI ask endpoint uses KV (not D1); grounding via
  bundled cores; buffered-safe streaming" — note this consciously **does not** reverse the
  prior "drop D1" decision (KV ≠ D1).
- Update `doc/API-SPEC.md` with the new route contract.
- 🕌 human review gate applies before any generated output ships publicly
  (`doc/CONTENT-POLICY.md`).
