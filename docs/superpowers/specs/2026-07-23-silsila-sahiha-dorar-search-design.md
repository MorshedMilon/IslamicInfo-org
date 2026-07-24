# Al-Silsila as-Sahiha — Dorar-backed Arabic Search (design)

**Date:** 2026-07-23
**Status:** Approved (design) — pending spec review → implementation plan
**Supersedes:** commit `35bcc19` (Silsila as a static "reference-linked" collection)

## 1. Summary & motivation

Al-Albani's *Silsila as-Sahiha* has no clean structured, browsable-by-number
data source. The current shipping approach (commit `35bcc19`) renders an honest
"reference-linked" card that points readers to Archive.org (English selection)
and al-hadees.com (verify-by-number). We are **reversing** that decision.

Instead, the Silsila collection page becomes an **Arabic keyword-search
interface into Dorar.net's Hadith Encyclopedia (الموسوعة الحديثية)**, scoped to
al-Albani's *Silsila as-Sahiha*. Dorar is a *search* engine, not a by-number
catalogue — it cannot enumerate "Silsila #1..N in order" — so a search-driven
model is the honest fit for what the source actually provides.

Each matching narration renders with its Arabic text, narrator, and
**al-Albani's ruling exactly as Dorar returns it** — cited to the grader and
to Dorar.net, the same way we cite al-Albani/Ibn Hajar elsewhere; NOT
footnote-scraped, NOT AI-generated. No English translation is shipped; a
per-card **"Ask QuranlyAI"** button covers translation/explanation for
non-Arabic readers.

**Grading reality (verified against live Dorar data, 2026-07-23 — see
`worker/test/fixtures/dorar-silsila-api.json`):** Silsila entries do NOT carry
a clean one-word grade (`درجة الحديث`). They carry `خلاصة حكم المحدث` —
al-Albani's *paragraph-length* ruling, e.g.
"رجاله ثقات رجال مسلم إلا أنه منقطع لكن قد روي موصولا [بإسناد فيه] ابن مجبر ضعيف".
We therefore display that ruling **verbatim** and never reduce it to a
Sahih/Da'if badge — keyword-mapping a nuanced ruling (which may flag a broken
chain or a weak narrator) to a one-word verdict would misrepresent it, which
the charter forbids. Likewise `الصفحة أو الرقم` is page-style (e.g. "6/778"),
not a clean sequential number, so citations show it verbatim (see §5).

### Non-goals (YAGNI)
- No by-number browse / endless list for Silsila (Dorar can't support it).
- No English translation ingested or displayed for Silsila narrations.
- No general multi-book Dorar search (scope is Silsila as-Sahiha only for now).
- No bulk ingest / local mirror of Dorar content — live search only, cached.

## 2. Invariants honoured (project charter)

- **Every claim carries a source.** Every rendered narration shows its grade
  sourced to the grader (`mohdith`) and to `Dorar.net`; a narration with no
  resolvable grade is shown honestly (no fabricated grade, never "Grade
  Unknown"→invented).
- **No fatwas / no rulings.** Showing an authenticity *grade* is sourced
  scholarly data, not a ruling — consistent with existing al-Albani/Ibn Hajar
  citations. AI translation/explanation is clearly separated and carries the
  mandated "✦ Powered by QuranlyAI · Not a religious ruling" footer.
- **Never invent Arabic, gradings, citations, or endpoints.** All text/grade
  comes verbatim from Dorar; missing fields are omitted, not filled.
- **Content review gate → owner.** New sourced+cited content is owner-directed
  (ADR-044): this feature is requested by the owner; Dorar grading is
  sourced+cited, satisfying the gate.

## 3. Architecture

```
Browser (hadith.html, Silsila route)
   └─ RTL Arabic search box ──▶ api.js: fetchDorarSilsila(q, page)
          │                          └─▶ GET {API_BASE}/api/hadith/dorar/search?q=&page=
          │                                     │  (Cloudflare Worker)
          │                                     ├─ KV cache lookup (query,page)
          │                                     ├─ per-IP daily quota
          │                                     ├─ fetch dorar.net official API (server-side, scoped to Silsila)
          │                                     ├─ dorar-parse.js: HTML-in-JSON → normalized items
          │                                     └─ { ok, data:{items,page,...}, source }
          ▼
   Dorar result cards (Arabic + grade + citation + "Ask QuranlyAI")
          └─ Ask QuranlyAI ──▶ window.QuranlyAI.openPanel(context, ask-prompt)
```

### 3.1 Worker endpoint
`GET /api/hadith/dorar/search?q={arabic}&page={n}` — added to the existing
hadith router (`worker/src/hadith.js`).

- **Upstream call:** dorar.net official Hadith Encyclopedia API, server-side
  (no browser CORS problem from a Worker), filtered to al-Albani's *Silsila
  as-Sahiha* via Dorar's book filter (`s[]` = Silsila's Dorar book id;
  **exact id + exact official endpoint string resolved during implementation**
  and pinned in a constant with a comment).
- **Parsing:** the official API returns HTML-embedded results. A pure module
  `worker/src/lib/dorar-parse.js` extracts the fields (logic ported from the
  MIT-licensed `AhmedElTabarani/dorar-hadith-api`; MIT attribution in the file
  header). Pure + injectable for unit tests (HTML fixture in → items out).
- **Envelope:** uniform `{ ok, data?, error?, source }`, matching sibling
  hadith endpoints.
- **Cache:** KV per `(q, page)` key, TTL 7 days (`source:'live'|'cache'`).
- **Quota:** 100 searches / IP / day (mirrors the wrapper default; reuses the
  QuranlyAI KV-quota pattern). Over quota → `{ ok:false, error:{code:'quota'} }`.
- **Fail-closed:** upstream 403 / non-200 / timeout / empty-parse →
  `{ ok:false, error:{code:'upstream'|'parse', retryable:true} }`. Never
  emits a partial or fabricated narration.
- **Query guard:** empty/whitespace `q` → 400 `{code:'bad_query'}` (no upstream
  call). `q` length-capped; `page` coerced to a positive int.

### 3.2 Normalized item shape
```js
{
  arabicMatn: string,            // Dorar hadith text (Arabic), highlight tags stripped
  narrator: string | null,       // rawi
  ruling: string,                // خلاصة حكم المحدث VERBATIM (fallback: درجة الحديث
                                 //   if only that label is present). Never derived.
  grader: string | null,         // mohdith (e.g. "الألباني"); passed through, never fabricated
  rulingSource: 'Dorar.net',
  collectionSlug: 'al-silsila-sahiha',
  collectionName: 'Al-Silsilah al-Sahihah',
  numberOrPage: string | null,   // Dorar's ref VERBATIM (e.g. "6/778"); null if absent
  reference: string,             // see §5
}
```
**No grade vocab, no badge, no keyword mapping.** Fields are keyed by their
Arabic label (not by position, which varies): الراوي→narrator, المحدث→grader,
المصدر→book (scope filter), الصفحة أو الرقم→numberOrPage, and
خلاصة حكم المحدث→ruling (falling back to درجة الحديث only if that is the sole
ruling label present). `ruling` and `grader` are passed through verbatim.

### 3.3 Frontend — Silsila route becomes a search view
In `src/js/hadith.js`, the route branch for `al-silsila-sahiha` renders a
**search view** instead of the book grid / reference card:
- RTL Arabic `<input>` + submit button + honest helper text ("Search Arabic
  keywords across al-Albani's Silsila as-Sahiha, via Dorar.net").
- On submit → `api.fetchDorarSilsila(q, page)` → render result cards.
- States: initial (prompt to search), loading skeleton, results, no-results
  ("no narrations matched"), error ("search temporarily unavailable — try
  again"), over-quota (honest message). Pagination via a "Load more" button.
- **No English translation** rendered.

Rendering logic lives in a pure core `src/js/dorar-card-core.js` (UMD, like
the other `-core` files): `buildDorarCardHTML(item)` returns the card string.
Escapes all Arabic/narrator/ruling text (XSS). DOM glue (search box, fetch,
events, Ask wiring) stays in `hadith.js`.

Card anatomy:
- Arabic matn (RTL, `dir="rtl" lang="ar"`), narrator line.
- **Ruling block** (NOT a badge): a labelled block showing al-Albani's ruling
  **verbatim** in RTL — label `<grader> · via Dorar.net` (e.g.
  `الألباني · via Dorar.net`; falls back to `Grader's ruling · via Dorar.net`
  when grader is null), then the `ruling` text unchanged.
- Citation line (§5) + `Source · Dorar.net`.
- `✦ Ask QuranlyAI` button.
- `data-ai-selectable="hadith"` retained so global Select-&-Ask still works.

### 3.4 Ask QuranlyAI button
Per card, calls `window.QuranlyAI.openPanel(context, prefilledAction)` (falls
back to `runAsk`) with:
- context = the card's Arabic matn + reference (so grounding has the text),
- prefilled prompt: **"Translate and explain this hadith, citing your
  sources."**

Reuses the existing QuranlyAI panel + its mandated footer. If
`window.QuranlyAI` is absent (widget not loaded), the button is not rendered
(no dead button) — the QuranlyAI widget tag is added to `hadith.html`.

## 4. Removals

- `REFERENCE_LINKED` map, `renderReferenceCard`, the `↗ ref` count-badge
  branch, and the route dispatch to it (`src/js/hadith.js` ~112, 196–204,
  288–300, 432).
- The Archive.org + al-hadees.com links.
- `hadith.html` markup/CSS specific to `.ref-collection*` if unused elsewhere.
- `al-silsila-sahiha` stays in `src/data/hadith/collections.json` and the
  collections grid, re-flagged as Dorar-search-backed (drop any
  reference-linked flag; the sidebar entry routes to the search view).

## 5. Citation

Silsila's `الصفحة أو الرقم` is page-style (e.g. "6/778"), not a clean
sequential hadith number, so this collection does NOT use the site-wide
`[Collection] [Number]` format (`hadith-citation-core`). Instead:
- When Dorar returns a ref → `Al-Silsilah al-Sahihah — <numberOrPage verbatim>`
  (e.g. `Al-Silsilah al-Sahihah — 6/778`).
- When Dorar returns no ref → `Al-Silsilah al-Sahihah` (no invented number).
Built by a small dedicated helper `buildSilsilaReference(numberOrPage)`; the
verbatim string is never parsed into or coerced to an integer. The ruling is
shown in its own block on the card, sourced to the grader via Dorar.net.

## 6. Attribution & launch gate

- Per-card `Source · Dorar.net`; a page-level attribution line
  ("Grading data from the Hadith Encyclopedia, Dorar.net (الدرر السنية)").
- `dorar-parse.js` header credits the MIT-licensed wrapper it ports from.
- **Hard blockers before going live (feature ships behind a flag, default
  OFF):**
  1. **Owner review of dorar.net terms/attribution** (article/389 blocks bots;
     owner reviews manually). Add whatever attribution the terms require.
  2. **Worker reachability:** confirm dorar.net does not 403 the Worker's
     server-side calls. If it does, fall back to self-hosting the MIT wrapper
     (Cloudflare) and point the Worker at it — a routing change only, the
     parser/endpoint/UI are unaffected.
- Flag name: `HADITH_SILSILA_DORAR_ENABLED` (Worker env). While OFF, the
  Silsila route keeps the current reference card (no user-visible regression
  until the gates clear).

## 7. Error handling (summary)

| Condition | Worker | UI |
|-----------|--------|----|
| empty query | 400 bad_query (no upstream) | inline "enter a search term" |
| upstream 403 / non-200 / timeout | `{ok:false, upstream}` | "search temporarily unavailable — try again" |
| parse yields 0 usable items | `{ok:true, data:{items:[]}}` | "no narrations matched" |
| over quota | `{ok:false, quota}` | honest quota message |
| flag OFF | route not served | existing reference card |

No path renders a fabricated or partial narration.

## 8. Testing

- **`dorar-parse.js` (pure):** real captured fixture + inline fixtures → items;
  label-keyed extraction (order-independent); `ruling` = خلاصة حكم المحدث
  verbatim (fallback درجة الحديث); `numberOrPage` verbatim (page-style kept as
  a string, never coerced); missing matn/ruling or non-Silsila book → dropped
  (fail-closed); XSS escaping happens at render, parser keeps text raw.
- **`dorar-card-core.js` (pure):** card HTML anatomy, ruling block + grader
  label fallback, citation via `buildSilsilaReference` (with/without ref),
  `Source · Dorar.net` present, Ask button present, no grade badge/vocab, all
  fields escaped.
- **Endpoint:** envelope shape; cache hit/miss (`source`); quota exhaustion;
  bad_query; upstream failure fail-closed — all with an injected fetcher (no
  network), mirroring existing worker tests (`node --test`).
- Regression: removing `REFERENCE_LINKED` doesn't break other routes.

## 9. Open items resolved during implementation

1. Exact dorar.net official endpoint string + Silsila book id (`s[]`), pinned
   as constants with comments.
2. Confirm `numberOrPage` semantics for Silsila entries (number vs page).
3. Final Ask-QuranlyAI prompt wording + the exact `window.QuranlyAI` call
   signature (`openPanel`/`runAsk`) against the live panel API.

## 10. Sub-decisions (accepted defaults)

1. Endpoint path: `/api/hadith/dorar/search` (namespaced under hadith).
2. Number: prefer Silsila number from `numberOrPage`; omit rather than fake.
3. Quota/cache: 100 searches/IP/day + KV cache 7 days per query.
