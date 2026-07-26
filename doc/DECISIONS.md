# DECISIONS.md — Architecture Decision Record (ADR) Log
**Why things are the way they are · v1.0 · 2026-06-03**

> A lightweight ADR log. Each entry records a decision, the context, and the
> consequences so that Claude Code — and future-you — do not re-litigate settled
> choices. When a decision changes, **do not delete the old entry**: add a new one
> that supersedes it and mark the old one `Superseded by ADR-NNN`.
>
> Entries below are **seeded** from decisions already baked into ARCHITECTURE.md,
> CLAUDE.md (charter), and CONTENT-POLICY.md. Review and adjust dates/owners.

Format: `ADR-NNN · Title · Status · Date` → Context / Decision / Consequences.

---

## ADR-001 · Static-first, no framework in v1 · Accepted · 2026-05-20
**Context.** The platform is content-heavy and SEO-critical; the team is small;
fast first paint matters on mobile in low-bandwidth regions.
**Decision.** v1 pages are single HTML files with inline CSS/JS. No React/Vue, no
bundler. JS enhances but never gates core content; pages render without JS.
**Consequences.** Simple hosting, excellent Lighthouse, no build step. Cost: some
duplication across pages (shared header/footer inline). Extraction to `/js` + `/css`
modules is deferred to Stage 2. *Do not introduce a framework without superseding this.*

## ADR-002 · `localStorage` as the data layer; no accounts in v1 · Accepted · 2026-05-20
**Context.** Accounts add auth, storage, privacy, and sync complexity disproportionate
to v1 value. Personalization (theme, progress, habits, bookmarks) works fine client-side.
**Decision.** All v1 state lives in `localStorage` per `DATA.md`. No login, no server DB.
**Consequences.** Zero PII to secure; instant personalization. Cost: no cross-device sync
(deferred to Stage 4 via `/api/sync`, non-destructive migration). Storage quota handled
with try/catch + toast.

## ADR-003 · All external APIs behind `/api/` server proxies; no keys in client · Accepted · 2026-05-20
**Context.** AlAdhan, api.quran.com, Sunnah.com, Metals API, Anthropic all need calls;
some require keys; all benefit from caching and graceful failure.
**Decision.** Every external call goes through a `/api/` Edge Function. Keys live in server
env vars only. Each route has a cache TTL and a hardcoded fallback (see `API-SPEC.md`).
**Consequences.** No key leakage; central caching; pages degrade gracefully. Cost: a proxy
route per integration. `robots.txt` disallows `/api/` and `/data/`.

## ADR-004 · No ads, no paywalls, no accounts (v1) · Accepted · 2026-05-20
**Context.** Trust is the core brand asset; monetization via ads/paywalls would undermine
the "Accessible" pillar and complicate the stack.
**Decision.** No advertising on any product; no paywalls; no required accounts in v1.
**Consequences.** Simpler architecture and stronger trust positioning. Monetization, if any,
must come from avenues that do not compromise the three pillars and requires a new ADR.

## ADR-005 · Design system is locked (DESIGN-SYSTEM.md) · Accepted · 2026-05-15
**Context.** Visual consistency across 10 pages + sibling brands; blueprints already approved.
**Decision.** Tokens, components, hover system, typography are frozen. No new colors/fonts,
no raw hex inline (except SVG `<defs>`), no shimmer `::after` sweep. Blueprints are the spec.
**Consequences.** Predictable UI, fast review. Cost: changes require explicit approval. The
`§24` enforcement checklist + CI guard this.

## ADR-006 · No fatwas; source-or-withhold; human review gate · Accepted · 2026-05-20
**Context.** The platform presents religious content users may rely on. The dominant risk is
confident-but-wrong rulings or fabricated narrations.
**Decision.** The platform never issues fatwas/rulings/verdicts. Every claim is sourced or
withheld. Hadith pass the verifier skill. No Islamic *content* ships without qualified human
review (CONTENT-POLICY §5). AI drafts and verifies; a person signs off.
**Consequences.** Slower content throughput, far lower misinformation risk. This is the
primary safeguard and overrides speed.

## ADR-007 · Authenticated vs. AI/speculative content is hard-separated · Accepted · 2026-05-20
**Context.** Users must never mistake an AI explanation for a primary source.
**Decision.** AI/speculative output is visually distinct, labeled, and carries QuranlyAI
attribution; disclaimers/methodology are hard-coded strings never produced by the model.
**Consequences.** Clear provenance for every piece of content. Cost: two visual tiers to maintain.

## ADR-008 · AI safety enforced server-side and non-overridable · Accepted · 2026-05-20
**Context.** `/api/ask-claude` could be prompted toward rulings.
**Decision.** System prompt (model `claude-sonnet-4-20250514`, `max_tokens 1000`) hard-codes
no-fatwa + mandatory citation + grade rules; a server post-filter strips fatwa-adjacent
language and returns the scholar-redirect line. User input cannot override these.
**Consequences.** Ruling requests are safely redirected even under adversarial prompting.
Some legitimate answers may be conservatively trimmed — acceptable trade-off.

## ADR-009 · Chosen external data sources · Accepted · 2026-05-20
**Context.** Need authoritative, well-maintained sources.
**Decision.** Prayer times → AlAdhan; Quran → api.quran.com `/v4`; hadith → Sunnah.com (+
verification cross-checks against ihadis.com, islamqa.info per the skill); audio → EveryAyah
CDN; nisab → Metals API; geocode → BigDataCloud; AI → Anthropic.
**Consequences.** Known contracts and fallbacks (API-SPEC). Swapping any source requires a
new ADR and an API-SPEC update.

## ADR-010 · Feature complexity gated behind build stages · Accepted · 2026-05-20
**Context.** Shipping everything at once risks quality and scope creep.
**Decision.** Four stages — 1 Static Foundation, 2 Live Data & Deep Links, 3 AI/Topics/
Advanced, 4 Accounts/PWA-full/Advanced Tools. Each stage has completion criteria (see TASKS.md).
**Consequences.** Predictable roadmap; later-stage hooks placed early but not implemented.

## ADR-011 · Home page footer uses `ft-*` class system from global.css · Accepted · 2026-06-06
**Context.** The Home page blueprint uses `ii-footer-*` class names; global.css fully implements
a `ft-*` footer system (ft-top, ft-brand, ft-col-h, ft-link, ft-bot, ft-copy, ft-note).
**Decision.** Use `ft-*` throughout `index.html` — no new CSS needed, zero duplication,
consistent with all other pages that will also use global.css.
**Consequences.** ~100 lines of redundant page-level footer CSS eliminated. If the footer
design changes, one place (global.css) needs updating.

## ADR-012 · Home feature cards chain `.feat.card` without overriding global `.card` base styles · Accepted · 2026-06-06
**Context.** Feature cards needed a two-class selector (`.feat.card`) for layout additions
(flex, gap, padding). An early draft duplicated and partially overrode `.card` transition/hover
styles, causing missing `var(--ease-reverent)` on `box-shadow` and `border-color`.
**Decision.** `.feat.card` adds only layout properties not present in global `.card`; all base,
hover, and dark-mode appearance is inherited from `.card` in global.css. Same pattern applied
to `.prayer.card`.
**Consequences.** Single source of truth for card appearance. Future `.card` upgrades in
global.css automatically apply to all page-level card variants.

## ADR-013 · Hosting: Cloudflare Workers + static assets, deployed via Wrangler · Accepted · 2026-06-10
**Context.** ARCHITECTURE §15 allows Cloudflare / Vercel / Netlify with `/api/` edge
functions on the same platform. The account authenticated Wrangler (OAuth) and needed
a live deployment of the static site plus the API-SPEC proxy routes.
**Decision.** Single Cloudflare Worker (`api/worker.js`, config in `wrangler.jsonc`)
serves static assets from the repo root (filtered by `.assetsignore` — docs, mockups,
skills, and configs are never uploaded) and handles `/api/*` first via
`assets.run_worker_first`. Edge caching uses the Workers Cache API; fallback responses
are never edge-cached. workers.dev subdomain `islamicinfo` registered; live URL:
`https://islamicinfo-org.islamicinfo.workers.dev`. Keyed upstreams (Sunnah.com, Metals
API) read Worker secrets and return 503 / spec fallback until keys are provisioned —
no hadith or verse text is hard-coded server-side; clients fall back to their own
human-reviewed static content (`/api/prayer` likewise returns 503 and the page's
3-level fallback supplies the static London MWL times, rather than duplicating them
server-side).
**Consequences.** One deploy command (`npm run deploy`), no separate Pages project,
no keys in client code. Custom domain `islamicinfo.org` can be attached later as a
route/custom domain on this Worker.

## ADR-014 · Quran translation ids corrected to 20,85,95 (id 131 removed upstream) · Accepted · 2026-06-10
**Context.** API-SPEC defaulted `/api/quran/[surah]` translations to `131,85,95`
("Sahih Int'l + 2"), but api.quran.com v4 no longer serves resource id 131
(Dr. Mustafa Khattab, The Clear Quran) — verified live against
`/resources/translations`. Two upstream quirks were also confirmed: a single id in
the `translations` param returns no translations (a comma list is required), and
unknown ids are silently dropped.
**Decision.** Default translation ids are `20,85,95` (20 = Saheeh International,
85 = M.A.S. Abdel Haleem, 95 = A. Maududi), matching the spec's stated intent
("Sahih Int'l + 2"). `/api/verse` ships Saheeh International (id 20) and withholds
rather than misattributes if id 20 is absent from an upstream response. The Worker
pads single-id requests with a second id and filters it back out.
**Consequences.** Attribution is verifiably correct. Any doc or page that referenced
id 131 must use 20 instead (API-SPEC updated 2026-06-10).

---

## Template for new entries

```
## ADR-NNN · <Title> · <Proposed|Accepted|Superseded by ADR-MMM> · <YYYY-MM-DD>
**Context.** <what forced a decision>
**Decision.** <what was decided, stated plainly>
**Consequences.** <trade-offs, what this enables/forecloses>
```

## ADR-015: Quran deep-link URL scheme = `?surah=<slug>` (query param)

**Status:** Accepted · 2026-07-14 · Module 1 (Sidebar)

**Context:** The Quran Explorer is a static page (no server router). PRD §2.3 envisions `/quran/<surah>` paths, but clean paths require Cloudflare Worker rewrite config.

**Decision:** Surah selection uses `history.pushState('?surah=<slug>')`. Static-safe, crawlable, shareable. Path-based `/quran/<slug>` is deferred to a future Worker-rewrite ADR.

**Consequences:** No server change needed now; URLs upgrade to clean paths later without breaking `?surah=` links (a redirect can be added).

## ADR-016: Activate `/api/ask-claude` for the Quran verse AI-explanation panel (Module 5B)

**Status:** Accepted · 2026-07-15 · Module 5B (AI Explain) — ships **pending 🕌 human-review sign-off**

**Context:** The `.ai-card` "AI Explain" icon toggled an empty box after Module 2 made verses dynamic (the mockup's canned text was demo-only). A real, per-verse plain-language explanation requires a live model call. The route was stubbed (501) in the Worker; the spec's model (`claude-sonnet-4-20250514`) is retired. AI output on scripture is CONTENT-POLICY §4/§5-sensitive, and a public paid endpoint is a cost/abuse surface.

**Decision:**
- Implement `POST /api/ask-claude` in the `islamicinfo-api` Worker using **Claude Haiku 4.5** (`max_tokens: 500`) — a deliberate cost choice for short, simple explanations on a public endpoint.
- Key is a **Worker secret** (`env.ANTHROPIC_API_KEY`) only — never in client/HTML/`wrangler.toml` (RULE 6).
- **No new binding in v1.** Cost/abuse control = client-side per-verse `localStorage` cache (`ii-quran-ai-{verseKey}-{editionSlug}`, 30d) + hard Worker input caps + Origin allowlist + an operator-configured Cloudflare **dashboard** rate-limit rule. Cross-user KV cache and in-Worker per-IP rate-limiting are **deferred** to a binding-gated follow-up (RULE 7).
- Safety = a hard-coded, **non-overridable** system prompt (no fatwa; scholar-redirect line; explain only from the provided verse) + a server-side verdict-language post-filter, with the identical check re-run client-side (defense-in-depth). The verdict detector is a **framing-based conservative v1 backstop** (matches ruling *framing*, e.g. "is haram", not proper nouns like "al-Masjid al-Haram"); the **final ruling-term set is owned by the 🕌 reviewer** per §4/§6. The primary control is the system prompt, not the regex.
- Attribution carries the brand-mandated **"Powered by QuranlyAI"** (CONTENT-POLICY §3/§8; QuranlyAI is the ecosystem AI sub-brand), combined with the §4 no-fatwa framing — the `.ai-card` footer renders **"✦ Powered by QuranlyAI ↗ · Not a religious ruling"**. *(Corrects an earlier revision of this ADR that wrongly dropped the QuranlyAI attribution as a "fabricated placeholder" — it is a real documented sub-brand.)*
- The Worker (`islamicinfo-api-worker.zip`) is **extracted into the repo as `worker/`** (tracked source) so future edits are diffable; the stale root zip should be regenerated or removed.

**Consequences:** The feature is functional once the operator provides an Anthropic key (with a spend limit), sets the secret, adds the dashboard rate-limit rule, and deploys. It ships behind the 🕌 gate (like Modules 2 & 3). Residual gaps accepted for v1: the post-filter catches verdict *framing* only (fabricated hadith/numbers rely on the system prompt); no cross-user cache (each user's first open of a verse bills once). Both are logged as follow-ups.

## ADR-017: QUL reciter ingest = static-hosted timing JSON + offset ids

**Status:** Accepted · 2026-07-15 · Module 6 (QUL Reciter Ingest)

**Context:** QUL (qul.tarteel.ai) hosts word-segmented recitation timing data for many more reciters than Quran.com's ~12, but has **no live API** — only per-reciter bulk export downloads — and **per-resource licensing** (some reciters are restricted or require attribution). A live integration isn't possible, and blindly bundling exports would risk shipping unlicensed or fabricated data.

**Decision:**
- Build a **build-time ingest pipeline**, not a runtime integration: an operator-run CLI (`tools/qul-ingest.mjs`) transforms a cleared QUL export into static per-surah JSON under `src/data/qul/{offsetId}/{surahId}.json`, served by Pages like any other static asset.
- QUL reciter ids are **offset by +1,000,000** in the manifest and file paths (`offsetId = 1000000 + qulReciterId`), guaranteeing no collision with Quran.com's numeric ids while keeping ids numeric — Module 3's `Number(localStorage['ii-quran-reciter'])` persistence logic is untouched.
- A `CompositeAudioSource` (added to `quran-audio.js`, replacing the bare `QuranComAudioSource` as `source`) merges `listReciters()` across both sources and routes `getSurahAudio(id, surah)` by `qulCore.isQulId(id)`.
- The module **ships with an empty manifest** (`src/data/qul/reciters.json = []`) — **zero fabricated or copyrighted data** is committed. The picker grows only as an operator ingests reciters after clearing licensing.
- Audio itself is **hotlinked from the export's own URLs**; only the small timing JSON is hosted in this repo. No audio mirroring.
- Static files on Pages, no Cloudflare binding — RULE 7 does not apply.

**Consequences:** With an empty manifest, behavior is byte-identical to Module 3 (verified in the runtime harness). Populating the picker is a manual, license-gated, per-reciter operator task (documented in `src/data/qul/README.md`, including the pre-commit license/hotlink/🕌-review gate — parity with Modules 2 & 3's scripture-audio gate). If the ingested dataset grows large, a future ADR may migrate timing JSON from static files to KV/R2.

## ADR-018: QuranlyAI ask backend — KV (not D1), bundled-core grounding, buffered-safe streaming · Accepted · 2026-07-17

**Context:** The QuranlyAI ask endpoint (`POST /api/quranlyai/ask`) needs per-user quota, a cross-user response cache, verified grounding, and streaming — without reopening the earlier "D1 dropped as unnecessary" decision (API-SPEC's Related Verses/Hadith sections). ADR-016's `/api/ask-claude` section already noted that cross-user KV cache and rate-limiting were deferred because the Worker had no binding yet ("need a binding"); this endpoint fulfills that.

**Decision:** Use **Cloudflare KV** (not D1) for both quota (`quota:{fp}:{date}`, TTL to UTC midnight) and response cache (`cache:{hash}`, 30-day TTL) — TTL-based expiry fits both use cases and needs no schema or migrations. Grounding is served via the **bundled knowledge-index cores over static `src/data/**`** (no new `/api/index/*` endpoints, no reliance on LLM memory). Streaming is **buffered-safe**: the Worker fully generates the answer and runs the no-fatwa/verdict safety filter on the complete text, then streams the already-safe text as SSE. Quota applies to **guests only** (3/day); **account tiers are deferred** (`resolveTier()` is a stub). The route is added **alongside** `/api/ask-claude` (untouched), with shared safety/CORS logic extracted into `worker/src/lib/`.

**Consequences:** No migrations, no new datastore to operate; expiry is TTL-driven so there's nothing to prune manually. Grounding has a single source of truth (the same static data used by the Knowledge Index pages), so ask-panel answers and index pages can never disagree. The no-fatwa filter fully precedes any client output — time-to-first-token ≈ full generation time, an accepted trade-off for the "no fatwa, ever" invariant. This does **not** reverse the earlier "drop D1" decision (API-SPEC Related Verses/Related Hadith sections) — KV is a distinct, lighter-weight store chosen for TTL semantics, not a full corpus database. Grounded actions currently resolve only for the verses present in `verse-index.json`; hadith grounding is now live (patience/mercy/gratitude/truthfulness). Generated output still ships only pending 🕌 human-review sign-off (CONTENT-POLICY §5).

## ADR-019: AI provider = Google Gemini (replaces Anthropic)

**Status:** Accepted · 2026-07-18 · Worker AI provider swap

**Context:** Both Worker AI endpoints (`/api/quranlyai/ask` per ADR-018, and the legacy `/api/ask-claude` per ADR-016/ADR-008) called the Anthropic API. The provider is being switched to Google Gemini for billing/availability reasons; no request/response contract, safety architecture, or client behavior needs to change to make this swap.

**Decision:** Both endpoints now call **Google Gemini** — model `gemini-2.5-flash` — via the REST `generateContent` endpoint (`worker/src/lib/gemini.js`), replacing the Anthropic Messages API entirely. Anthropic is fully removed from the Worker; a single Worker secret `GEMINI_API_KEY` (obtained from Google AI Studio, https://aistudio.google.com/apikey) replaces `ANTHROPIC_API_KEY`. The earlier cheap/strong model split (Claude Haiku 4.5 vs. Sonnet 5, per ADR-018/API-SPEC) is dropped in favor of a single model for all actions; `chooseModel()` in `worker/src/lib/prompts.js` is kept as a routing hook for later. Free tier now, paid tier later is a billing toggle on the Google Cloud project — no code change either way. The `/api/ask-claude` path name is **intentionally kept** (not renamed) to avoid breaking the live `src/js/api.js` client — it is now an internal name only, backed by Gemini.

**Rationale/notes:** Gemini's own safety filters are set to `BLOCK_NONE` across all four harm categories (`worker/src/lib/gemini.js`) so they don't over-block legitimate Quran/Hadith text; the existing server-side no-fatwa filter (`worker/src/lib/safety.js`, `verdictLangDetected`) remains the sole content-safety authority — this provider swap does not change that invariant.

**Consequences:** No client-visible change (same routes, same request/response shapes, same caching/quota behavior). Operators must provision `GEMINI_API_KEY` instead of `ANTHROPIC_API_KEY` before deploying. API-SPEC.md's `/api/ask-claude` and `/api/quranlyai/ask` sections are updated to reflect Gemini as the upstream (this ADR supersedes the Anthropic references in ADR-008, ADR-009, ADR-016, and ADR-018, which are left as historical record and not deleted).

## ADR-020: hadithapi.com as the sole Hadith source (supersedes Sunnah.com)
**2026-07-19 · Accepted.** The PRD/TechSpec/API-SPEC were written around Sunnah.com.
Per product direction, hadithapi.com is now the only hadith source. Requires a
`HADITH_API_KEY` Worker secret; upstream auth is a `?apiKey=` query param (server-side only).
Consequence: all Sunnah.com references in the hadith docs are superseded.

## ADR-021: REST sub-path endpoints for the Hadith Library (supersedes query-param contract)
**2026-07-19 · Accepted.** The legacy `/api/hadith?collection=&book=` contract in api.js is
replaced by REST sub-paths (`/api/hadith/collections/:slug/books/:bookNum/hadiths`, etc.),
matching the PRD route map. Backend is the existing Cloudflare Worker + KV — **not** the
Supabase Postgres stack described in the Module 0 prompt (deferred as YAGNI until a curator
enrichment pipeline exists; Cloudflare D1 is the future relational option if needed).

## ADR-022 · Grade badge policy for ungraded collections · Accepted · 2026-07-20
**Context.** Review of PRD v1.2 §2.3 / TechSpec v1.2 found a hard contradiction. TechSpec §7.1
and §10 hardcoded "on missing grade, render a grey 'Grade Unknown' badge — never omit" (Option c)
as a *universal* rule, while TechSpec §1.1 (OPEN item) and the PRD §2.3 UI note leaned toward "do
not render a per-hadith grade badge for the 8 ungraded collections unless a supplementary source is
added" (Option a). Both could not stand. The 8 collections — Riyad as-Saliheen, Bulugh al-Maram,
Muwatta Malik, Al-Adab al-Mufrad, Shamail Muhammadiyah, Sunan al-Darimi, Forty Hadith Qudsi, Forty
Hadith of Shah Waliullah (all AhmedBaset-sourced) — have no per-hadith `grade` field at source
(PRD §2.3).
**Decision.** Adopt **Option (a)**. The 9 graded collections (9 HadithAPI.com)
keep the per-hadith grade badge with named grader; the "Grade Unknown" grey fallback applies only
within those 9 (a record missing a grade in a source that has the field). The 9 characterization-only
collections (40 Hadith Nawawi + the 8 AhmedBaset-sourced) render a **collection-level characterization
badge only** — no per-hadith grade badge, and specifically **not** a "Grade Unknown" badge.
`grade`/`grader` are `null` on their hadith objects.

**Refinement (2026-07-20, during the ADR-024 build; owner-confirmed).** The original split was "10 graded
(9 HadithAPI.com + 1 fawazahmed0) / 8 ungraded". Endpoint verification found the fawazahmed0 edition of
**40 Hadith Nawawi has no per-hadith grade field either**, so Nawawi is treated as characterization-only
exactly like the 8 AhmedBaset collections. **Final split: 9 graded (the 9 HadithAPI.com collections) /
9 characterization-only (40 Nawawi + 8 AhmedBaset).**
**Rationale.** (1) No fabricated per-hadith claims — matches skills/islamic-authenticity/SKILL.md
"does not invent Arabic text / grades" and the standing "never fabricate grader" rule. (2) Stamping
thousands of well-characterized hadith (e.g. Muwatta, Riyad as-Saliheen) "Grade Unknown" would
*misrepresent* known scholarly characterization — a collection-level badge is more honest. (3)
Preserves the meaning of the badge on the 9 graded collections: a grade badge always means a real
per-hadith grade.
**US-H16 copy-with-attribution fallback.** For the 8 collections, replace the
`Grade: {grade} ({grader}, {year}).` segment with the literal
`Grade: Not individually graded — see collection note` (grader/year omitted).
**Consequences.** TechSpec §1.1 item 1 closed; §7.1, §7.5 rule 1, §10, §3.11 scoped/carved out;
DATA.md documents the canonical null-grade shape. Downstream consumers (feed renderer,
copy-with-attribution, share image, deep-view alternate-gradings table) must treat `grade === null`
as "not individually graded", never as an error or a "Grade Unknown" render. If a supplementary
per-hadith grading source is added later, supersede this ADR.

## ADR-023 · Preserve `fetchHadith(collection, book)` as a back-compat wrapper · Accepted · 2026-07-20
**Context.** `src/js/api.js` defines the legacy `fetchHadith(collection, book)` (→ the old
`/api/hadith?collection=&book=` route). `src/js/home.js` still calls `api.fetchHadith()` (no args)
to power index.html's "Hadith of the Day". Per ADR-021 the query-param Worker route was superseded
by REST sub-paths and now 404s, so Home currently runs on `FALLBACK_HADITH` (degraded, not broken).
**Decision.** **Preserve** `fetchHadith(collection, book)` as a thin backward-compatible wrapper
delegating to `fetchHadithDaily()` / the new REST methods (`src/js/api.js:254–265`), so index.html
keeps working. `fetchHadith` must **not** be removed or renamed without updating `src/js/home.js`
in the same change (ideally migrating Home to `fetchHadithDaily()` directly). Wrapper implementation
is owned by Module 1, not this planning task.
**Consequences.** No runtime break on Home. A follow-up may migrate `home.js` to the REST method and
then retire the wrapper under a new ADR.
**Dead-code note.** The **root-level `api.js`** (project root) is an unloaded duplicate of
`src/js/api.js` — **no HTML page references it** (all 15 pages load `src/js/api.js`). Marked **dead
code pending removal**; do not edit it. Deletion deferred pending owner confirmation.

## ADR-024 · Hadith Library = 3-provider / 18-collection data layer · Accepted · 2026-07-20
**Supersedes ADR-020** (hadithapi.com as the *sole* hadith source) and adds a **scoped
carve-out to ADR-003** (all external APIs behind `/api/` proxies).
**Context.** ADR-020 scoped Module 0 to hadithapi.com only (9 collections), deferring the
remaining collections to "a separate backend module next" (design spec D1). PRD v1.2 §2.3/§5
specifies the full target: **18 collections across 3 free providers**. Owner decision
(2026-07-20) is to build the full 18/3-provider layer now rather than defer. The AhmedBaset
license question (flagged unresolved in TechSpec §5 and the Module 0 build prompt) is
**resolved: AhmedBaset/hadith-json is ISC-licensed** (permissive, owner-confirmed 2026-07-20);
fawazahmed0/hadith-api is public domain (Unlicense).
**Decision.** Hadith data routes across three providers:
- **HadithAPI.com — 9 collections** (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah,
  Musnad Ahmad, Mishkat, al-Silsila al-Sahiha). Keyed source → **proxied through the Cloudflare
  Worker** (`/api/hadith/*`); the API key stays a Worker secret. Unchanged from ADR-021.
- **fawazahmed0/hadith-api — 1 collection** (40 Hadith Nawawi). Keyless public-domain static
  JSON on jsDelivr → **direct client fetch, no proxy, no key**.
- **AhmedBaset/hadith-json — 8 collections** (Riyad as-Saliheen, Bulugh al-Maram, Muwatta Malik,
  Al-Adab al-Mufrad, Shamail Muhammadiyah, Sunan al-Darimi, Forty Hadith Qudsi, Forty Hadith of
  Shah Waliullah). Keyless ISC static JSON on GitHub → **direct client fetch pinned to a release
  tag** (never `main`), no proxy, no key.
**ADR-003 carve-out (narrow).** ADR-003 ("no direct client calls to external APIs") stands for
all **keyed** or **rate-limited** upstreams. It does **not** apply to **keyless, immutable,
permissively-licensed static datasets** (public-domain / ISC) served from a CDN: there is no
secret to protect and no server logic to add, so proxying them through the Worker would add
latency and cost for zero benefit. Only fawazahmed0 and AhmedBaset qualify.
**Grade policy interaction (ADR-022).** The **9 characterization-only** collections (40 Hadith Nawawi
+ 8 AhmedBaset) carry a **collection-level `gradeCharacterization`** only; their hadith objects have
`grade`/`grader` = `null` and **no per-hadith grade badge** (never "Grade Unknown"). The **9 HadithAPI.com**
collections keep per-hadith grades. (fawazahmed0's Nawawi edition has no grade field — see ADR-022 refinement.)
**Total count.** The Stats-Strip total is **computed at runtime** from the merged 18-collection
list — never hardcoded (PRD FIX-9 note + US-H02).
**Consequences.** ADR-020 is superseded (kept as historical record, not deleted). A static
`collections.json` seed of all 18 becomes the offline/failed-fetch fallback (TechSpec §8).
`src/js/api.js` gains **additive** provider-routing (existing `fetchHadith*` REST methods and the
legacy `fetchHadith` wrapper per ADR-023 are preserved). AhmedBaset is pinned to a release tag so
upstream `main` churn can't silently change production data.

## ADR-025 · Grade-badge WCAG AA token correction (PRD FIX-1) · Accepted · 2026-07-20
**Context.** The `--grade-hasan` / `--grade-daif` light-mode token values failed WCAG AA (4.5:1)
for text — PRD FIX-1 / TechSpec §2.6. Measured against the actual tinted badge background:
- `--grade-hasan` **#5D8A3A → 3.51:1 ✗**
- `--grade-daif`  **#A86932 → 3.79:1 ✗**
(`--grade-sahih` #0F6E56 = 5.19:1 ✅ and `--grade-mawdu` #B33A3A = 4.89:1 ✅ already passed.)
**Decision — light values corrected** (TechSpec §2.6 recommended):
- `--grade-hasan`: **#5D8A3A → #4A7030** (now **4.85:1 ✅**)
- `--grade-daif`:  **#A86932 → #8A5228** (now **5.30:1 ✅**)
**Decision — dark theme:** added **token-level** `[data-theme="dark"]` overrides
(`--grade-sahih:#1FA882; --grade-hasan:#7AB84E; --grade-daif:#D4884A; --grade-mawdu:#E05555`) so
**every** grade usage (badge, filter pill, authenticity badge, Verify verdict banner) gets the
correct dark colour — the previous per-class `.grade-badge.grade-*` dark overrides only covered the
feed badge, leaving pills/authenticity/verdict text on the failing light token in dark mode.
**Who this affects.** `--grade-*` is inlined per page (static-first, ADR-001). Changed in this
commit — the pages that actually **render a grade badge**: `hadith.html`, `verify.html` (renders
Ḥasan/Ḍaʿīf verdict badges — was a live WCAG bug), `index.html` (grade-badge system: Daily
Reflection + Related Hadith grades), and the design-system source `docs/DESIGN-SYSTEM.md`.
**Not swept here** (only decorative `--grade-sahih` green accents, or grade text that already
passes): about, contact, dua, terms, privacy, tools, islamic-studies, inheritance, habits, and all
`mockups/*` — logged as one "global grade-token sync" task in TASKS.md. `inheritance.html` also
reuses `--grade-daif` as a *deduction-value* colour (not a grade badge) — noted in that task.
**Sibling sites.** DESIGN-SYSTEM.md notes QuranlyAI/MosqueFinder/TravellyAI/LearnSpeakAI copy this
palette; they must re-sync these 6 grade values.
**Known marginal.** Dark `--grade-mawdu` #E05555 = **4.17:1 vs its tinted badge bg** (4.69:1 vs raw
surface) — kept as the TechSpec §2.6-specified value; Mawdu' is essentially never shown live
(fabricated narrations). Flagged, not changed without direction.

## ADR-026 · Path-based routing for the Hadith Library · Accepted · 2026-07-21
**Context.** ARCHITECTURE.md's route map specified static multi-page-per-route
(`/hadith/[collection]` → a file `hadith/[collection].html`), but Module 1 shipped a query-param
interim (`?collection=slug`) single-page router, with `showLoadingShell` a deliberate stub for
Tier 2. The two conflicted, and every Tier 2/3 module depends on the choice. Host reality
(confirmed): **GitHub Pages is the sole site host** (`CNAME` = islamicinfo.org + `deploy.yml`);
the Cloudflare Worker (`islamicinfo-api`) is **API-only** and serves no HTML; its custom domain is
commented out (DNS not yet on Cloudflare). There is **no build step** (ADR-001), so per-route
static files aren't viable.
**Decision.** **Path-based single-page routing.** Canonical URLs
`/hadith/[collection]/[book]/[hadith]` driven by History API `pushState` on the single `hadith.html`
app (`parseRoute`/`routePath`/`renderRoute` in `hadith.js`). `<base href="/">` keeps relative
assets/links/fetches resolving to root under deep paths; a fragment-link scroll interceptor keeps
`#anchor` links on-page. Deep-links/refreshes survive via a **GitHub Pages `404.html` SPA
fallback** that bounces `/hadith/*` → `/hadith.html?redirect=<path>`, which `init()` restores to a
clean URL. This **supersedes** the `?collection=` interim (Module 1) and ARCHITECTURE.md's
multi-page-files plan; going forward all Tier 2/3 modules build on path routes only. Tier 1 stays at
`/hadith.html` (renaming to `/hadith/` is a file move affecting cross-page nav — deferred to the
hosting-migration initiative).
**Known limitation (SEO/unfurl).** GitHub Pages serves `404.html` with an **HTTP 404 status**, so
deep-link paths are **not indexed by crawlers** and **social-preview unfurling breaks** on shared
links. Clean URLs still give durable/shareable links for humans. True 200 path routing requires
moving site-serving to Cloudflare — logged as its **own initiative** in TASKS.md, **not** folded
into any content module (per owner direction).
**Consequences.** `hadith.js` routing reworked from query-param to path parsing; Browse/sidebar
links now `/hadith/[slug]`; new `404.html`; `<base href="/">` in `hadith.html`. Later Tier 2/3
modules (7, 9, 11, deep-view/trace) inherit this model.

## ADR-027 · Per-feature JS files for the Hadith app; CSS stays inline · Accepted · 2026-07-21
**Context.** `hadith.js` reached ~656 lines through Module 6. Module 7 (Tier 3a list + Tier 3b
deep-view: 7 blocks, translation tabs, prev/next) would push it well past a size that stays
reasoning-friendly and reliably editable. TechSpec planned separate files
(`src/js/tier3-deep-view.js`, `src/css/deep-view.css`), but Modules 1–6 kept all hadith CSS inline
in `hadith.html`.
**Decision.** Any hadith module whose JS would meaningfully bloat `hadith.js` gets its **own
feature-named JS file** (e.g. `tier3-deep-view.js`, `tier3-deep-view-core.js`, future
`narrator-panel.js`, `trace-view.js`), following the existing UMD pattern (`window.II.<feature>` /
`module.exports`), with a pure `*-core.js` sibling for unit-testable logic where it helps. **CSS
stays inline in `hadith.html`** everywhere until/unless we deliberately run a **full whole-page CSS
extraction as its own planned pass** — never a per-module half-migration. Modules 8+ follow this
without re-asking.
**Consequences.** Module 7 adds `tier3-deep-view-core.js` + `tier3-deep-view.js`; `hadith.html`
gains two `<script>` includes and an inline CSS block; no `src/css/*.css` files are created.

## ADR-028 · `api.js` `API_BASE` seam for `/api/*` (absolute origin), decoupled from hosting migration · Accepted · 2026-07-21
**Context.** `api.js` `_get`/`_getHadith`/`_post` fetched **same-origin relative `/api/...`** for
EVERY endpoint (verse, quran, prayer, verify, subscribe, ask-claude, the original `fetchHadith`, and
the Module 0/1 hadith fns). Production site = GitHub Pages, which serves no `/api`, so the **entire**
`/api` layer is 404 in prod (verified 2026-07-21: `islamicinfo.org/api/{verse,quran/1,prayer,hadith/collections}`
all 404). This is a pre-existing site-wide design gap, **not** a Module-1 regression — the original
`fetchHadith` is relative too; the only place the absolute pattern already existed is the QuranlyAI
widget (`apiBase`). It was **wrongly** framed as coupled to the ADR-026 Cloudflare hosting migration.
The Worker already implements CORS and `ALLOWED_ORIGINS` already includes the Pages origins
(`worker/src/lib/cors.js`), so no CORS work is needed to route `/api` cross-origin to the Worker.
**Decision.** Introduce a single `API_BASE` const in `api.js` (default `''` = same-origin) and a
`_apiUrl(u)` helper that prefixes `API_BASE` **only** to paths starting `/api/` (leaving absolute CDN
direct-source URLs and `src/data/...` asset paths untouched). Threaded through `_get`/`_getHadith`/`_post`
so one knob rebases every `/api` call site. **Shipped INERT** (`API_BASE = ''`), so nothing changes for
any endpoint until deliberately flipped. Flip target: interim `https://islamicinfo-api.islamicinfo.workers.dev`
(live, CORS-ready), later `https://api.islamicinfo.org` once DNS lands. This is **independent of the
ADR-026 hosting migration** (which is now only about page-route 200-status/SEO/unfurl).
**Verification method (how we prove it's inert until deploy).** Unit tests in
`worker/test/ui-utils.test.js` assert `api.API_BASE === ''` and `_apiUrl('/api/…')` returns the path
unchanged while absolute/asset URLs pass through untouched — i.e. default behavior is byte-identical to
the legacy relative calls. Same "prove-it's-inert" discipline as the grade-token change.
**⚠ Flipping is site-wide.** Setting `API_BASE` activates cross-origin for **all** `/api/*` endpoints at
once — and only makes hadith work AFTER the `islamicinfo-api` Worker is redeployed with the hadith routes
(currently 404 there). Before flipping, verify EACH call site (verify/subscribe/ask-claude/verse/quran/
prayer + hadith) still degrades gracefully (TASKS.md).
**Consequences.** `api.js` gains `API_BASE` + `_apiUrl` (both exported for tests); behavior unchanged in
prod today. Two paired follow-ups in TASKS.md: (1) redeploy the Worker with hadith routes, (2) verify the
site-wide flip against all `/api` call sites. Neither needs ADR-026.

## ADR-029 · Module 8 narrator panel ships engineering-only; reliability data deferred · Accepted · 2026-07-21
**Context.** US-H11's narrator reliability panel renders named scholarly judgments (Ibn Hajar,
al-Dhahabi, al-Mizzi) with folio citations about named narrators — the platform's highest
religious-accuracy-risk surface (PRD DoD-9: "no fabricated gradings"; charter: "never invent
citations"). An AI agent cannot verify folio/entry numbers against the classical works, so authoring
that data = fabrication. TechSpec §7.5 rule 3 already frames the citations as "validated at
data-authoring time" — human content.
**Decision.** Module 8 builds the full component (pure `narrator-panel-core.js` + DOM
`narrator-panel.js` + `api.fetchNarrator` + `data-narrator-id` on isnad nodes + CSS) and every honest
state (empty-citations → "No scholar citations available for this narrator"; unknown/not-in-DB → grey
`.rel-unknown` + "Unknown narrator"; fetch-fail → "Reliability data unavailable for this narrator").
It authors **zero** narrator citation data — only an empty structural template
(`data/narrator/_schema.example.json`). Populated rendering is proven with **synthetic unit-test
fixtures only** (never shipped), like the Module 2/7 disputed-grade dead-code path. The reliability
dataset is a separate scholar-verified content task (TASKS.md), gated by CONTENT-POLICY §5.
**Consequences.** Panels render honest-"unavailable" live (also because isnad `narrators:[]` means no
rows to click). No fabricated gradings enter the repo. Data lights up with no code change once
verified `/data/narrator/{id}.json` files land.

## ADR-030 · Module 9 deep-link pulse-ring retimed to spec (1.8s ×2) · Accepted · 2026-07-21
**Context.** Module 7 shipped the deep-link `.pulse-gold` as `dv-pulse-gold 1.6s var(--ease)` — a single
run ending at `var(--elev-1)` — with `prefers-reduced-motion` set to `animation:none` only. TechSpec §3.5
specifies a ring-expand pulse (`box-shadow 0 0 0 0 → 16px → 0`, gold `rgba(197,160,89,·)`), **1.8s, 2
iterations**; §3.14 requires the reduced-motion fallback to apply a `border-color: rgba(197,160,89,.5)`
highlight, not merely disable the animation.
**Decision.** Rewrite `.pulse-gold` to the spec (1.8s, 2 iterations, ring-expand keyframe,
`var(--ease-reverent)`) and add the §3.14 reduced-motion border highlight. Extract a single shared
`pulseRing(el)` in `hadith.js`, exposed to Module 7 via the tier3 host (`host.pulseRing`), so Tier-3b
deep-view and Module 9's Continue-Reading deep-link share ONE implementation instead of Module 7's former
inline copy and its hardcoded `1600ms` cleanup. `pulseRing` owns the reduced-motion branch (static gold
border, no animation) and a `3700ms` (2×1.8s + buffer) class-cleanup.
**Consequences.** Before → after: `1.6s × 1`, ends at `--elev-1`  →  `1.8s × 2`, ring-expand to
transparent. **This is a user-visible change** — the deep-link / Continue-Reading pulse now runs longer and
repeats twice; flag for manual QA on the hadith deep-view (`/hadith/sahih-bukhari/1/1`) and on the
Continue-Reading prompt click. Reduced-motion users now get a persistent gold border tint instead of no
feedback at all. No content authored; design-system tokens only (gold `rgba(197,160,89,·)`, `--ease-reverent`).

## ADR-031 · `/api/explain` deliberately shares the governed pipeline internals (`callGemini`, `QURANLYAI_SYSTEM_PROMPT`, `safety.js`) with `/api/quranlyai/ask` — not drift · Accepted · 2026-07-22 · Module 13 (AI Explanation for Hadith)
**Context.** Module 13 adds `POST /api/explain`, a new thin route for per-hadith AI explanation.
It needs a model call and a no-fatwa safety filter — both of which already exist, locked, for
`/api/quranlyai/ask` (ADR-018/ADR-019): `callGemini` (`worker/src/lib/gemini.js`), the
`QURANLYAI_SYSTEM_PROMPT`, and `safety.js`'s `verdictLangDetected`. A future session skimming the
diff could read "two routes calling the same internals" as accidental duplication that should be
"cleaned up" or forked per-route.
**Decision.** `/api/explain` **imports and reuses** `callGemini`, the locked
`QURANLYAI_SYSTEM_PROMPT`, and `safety.js`'s `verdictLangDetected` as-is. There is exactly **one**
copy of the no-fatwa system prompt and exactly **one** copy of the verdict filter in the Worker;
both routes deliberately sharing them is the design, not drift.
**Consequences.** A single place governs "no fatwa, ever" and the verdict-language backstop for
every AI route. **Do not** de-duplicate-by-forking these into per-route copies, and do not treat
the shared import as something to "fix" — any change to the system prompt or the filter must be
made once, in the shared file, and applies to both routes together.
**References.** `docs/superpowers/specs/2026-07-22-module-13-hadith-ai-explanation-design.md`,
`docs/superpowers/plans/2026-07-22-module-13-hadith-ai-explanation.md`.

## ADR-032 · `/api/explain` is blocking JSON, not streaming SSE · Accepted · 2026-07-22 · Module 13 (AI Explanation for Hadith)
**Context.** `/api/quranlyai/ask` (ADR-018) streams already-safety-filtered text as SSE
(buffered-safe: the Worker fully generates and filters before streaming). Module 13's PRD DoD-10
requires the verdict/fatwa filter to clear the **complete** model text server-side before **any**
of it reaches the client. Reusing the SSE `streamSafeText` path might look like the obvious code
reuse, but it was built around chunking already-cleared text — not around withholding output
until a filter decision.
**Decision.** `/api/explain` returns a single **blocking JSON** response. The full model output is
generated, then passed through `verdictLangDetected` (per ADR-031), and only on a clean result is
the JSON response sent. **No SSE / streaming path is used for this route.**
**Consequences.** Time-to-first-byte equals full generation time (same accepted trade-off as
ADR-018's buffered-safe streaming, minus the streaming). This is intentional: streaming would let
unfiltered tokens reach the client mid-stream, which DoD-10 forbids. Do not "upgrade" this route to
SSE/streaming without first re-deriving how the filter can gate a stream it hasn't fully seen yet.
**References.** `docs/superpowers/specs/2026-07-22-module-13-hadith-ai-explanation-design.md`,
`docs/superpowers/plans/2026-07-22-module-13-hadith-ai-explanation.md`.

## ADR-033 · Client uses `fetch` + `AbortController`, not a Web Worker, despite spec wording · Accepted · 2026-07-22 · Module 13 (AI Explanation for Hadith)
**Context.** The Module 13 spec text says the client calls `/api/explain` "via Web Worker." The
existing AI-explain client patterns in this codebase (`quran-ai.js`, `quran-verses.js`) use a plain
`fetch` with a 10s `AbortController` timeout and no worker thread — there is no prior art for a
dedicated Web Worker anywhere in the repo's AI-call paths.
**Decision.** The hadith AI-explain client call is implemented with a plain `fetch` + 10s
`AbortController`, matching `quran-ai.js`/`quran-verses.js`. The spec's "via Web Worker" wording is
**intentionally not followed**.
**Consequences.** A single blocking JSON network call (ADR-032) gains nothing from a Web Worker — a
worker thread would add a bundled worker file plus `postMessage` plumbing for a response that is
already off the main thread's critical path via `fetch`. **Do not "restore" a Web Worker** to match
the spec text; the spec wording is superseded by this ADR for this module.
**References.** `docs/superpowers/specs/2026-07-22-module-13-hadith-ai-explanation-design.md`,
`docs/superpowers/plans/2026-07-22-module-13-hadith-ai-explanation.md`.

## ADR-034 · `hadithAIExplainEnabled` / `HADITH_AI_EXPLAIN_ENABLED` ships default OFF; flipping requires explicit human sign-off, not an automated build step · Accepted · 2026-07-22 · Module 13 (AI Explanation for Hadith)
**Context.** CONTENT-POLICY's human-review gate (§5) requires qualified human review before any
Islamic content ships to users. Module 13 generates AI explanatory text about hadith — squarely
inside that gate. Prior AI modules (ADR-016 `/api/ask-claude`, ADR-018 `/api/quranlyai/ask`) shipped
"pending 🕌 human-review sign-off" as a stated condition rather than a hard code gate; Module 13
adds an explicit client-side kill switch instead of relying only on the stated condition.
**Decision.** A client flag `HADITH_AI_EXPLAIN_ENABLED` (backing config key
`hadithAIExplainEnabled`) gates the feature, **default `false`/OFF**. Flipping it to `true` requires
explicit human sign-off on three things together: the system prompt, the safety filter, and
adversarial-test evidence (prompt-injection / verdict-framing attempts against the actual route).
**Consequences.** The feature is inert-by-default in every build/deploy until a human explicitly
flips the flag after reviewing evidence. **This flip is not an automatic step in any future
build/deploy session** — a future agent must not set it to `true` as part of "finishing" the
module, merging, or deploying; that decision belongs to a human reviewer per CONTENT-POLICY §5.
**References.** `docs/superpowers/specs/2026-07-22-module-13-hadith-ai-explanation-design.md`,
`docs/superpowers/plans/2026-07-22-module-13-hadith-ai-explanation.md`.

## ADR-035 · Labeled-text (`### LABEL`) parsing instead of Gemini native JSON mode · Accepted · 2026-07-22 · Module 13 (AI Explanation for Hadith)
**Context.** `/api/explain` needs four structured sections back from the model. Gemini supports a
native JSON output mode (`responseMimeType: "application/json"`), which could seem like the more
robust way to get structured output. But there is **zero prior art** in this repo for that mode —
`gemini.js`'s `callGemini` (the single governed AI-call path per ADR-031) would need to be modified
to support it, and a per-route `responseMimeType` risks conflicting with the locked
`QURANLYAI_SYSTEM_PROMPT`'s existing markdown MODE-format instructions used by `/api/quranlyai/ask`.
**Decision.** The hadith-explain user prompt asks the model for four `### LABEL` markdown sections;
a new, **non-governed** `explain-core.js` parses those labeled sections into structured fields. The
governed `callGemini`/`gemini.js` path is used unmodified — no `responseMimeType` JSON mode.
**Consequences.** Achieves the same structured-output goal as JSON mode with **zero governed-file
risk**, keeping ADR-031's "exactly one copy, unmodified" guarantee intact. Cost: `explain-core.js`
must parse markdown-labeled text rather than trust a schema-enforced JSON response — a future
session should not "simplify" this by switching `callGemini` to native JSON mode without weighing
that trade-off against ADR-031.
**References.** `docs/superpowers/specs/2026-07-22-module-13-hadith-ai-explanation-design.md`,
`docs/superpowers/plans/2026-07-22-module-13-hadith-ai-explanation.md`.

## ADR-036 · Hadith Trace View ships live (no runtime flag) · Accepted · 2026-07-22 · Module 14 (Hadith Trace View)
**Context.** Module 13 (hadith AI explanation) shipped behind `HADITH_AI_EXPLAIN_ENABLED=false`
(ADR-034) pending human sign-off, because it generates Islamic content at runtime via an LLM.
Module 14 (Trace View) is different in kind: it has no LLM call and authors no new content.
**Decision.** Trace View ships live, both entry points (route `/hadith/trace/...` and the card
overlay) visible on merge, with no runtime flag gating it. Rationale: it authors no content and
runs no LLM — it reformats already-authenticated matn/grade and renders honest "not yet available"
states for all absent data (isnad, Ibn Hajar/an-Nawawi commentary, related narrations/verses,
topics). The residual risk is assistive-tech behavior on a reused, production-proven focus
mechanism (`II.ui.focusTrap` plus the bookmarks-panel Escape/focus-return pattern), not content
correctness, so a content-style review gate (CONTENT-POLICY §5) does not apply.
**Consequences.** Manual VoiceOver + NVDA verification of the focus trap (DoD-13) is an explicit
outstanding QA item — tracked and never marked done until a human runs it. No fabricated scholar
commentary ships (honest-empty boxes only). Reuses the Module 8 narrator panel and the Module
10/12 action handlers; no new gate mechanism was introduced for this module.
**References.** `docs/superpowers/specs/2026-07-22-module-14-hadith-trace-view-design.md`,
`docs/superpowers/plans/2026-07-22-module-14-hadith-trace-view.md`.

## ADR-037 · Chain-diverge (◆) built but dormant · Accepted · 2026-07-22 · Module 15 (Comparison Mode)
**Context.** Comparison Mode's spec calls for `.chain-diverge` (◆) markers where narrators differ
between compared isnads. Isnad/narrator-chain data is universally absent in today's dataset —
Modules 8 and 14 already render chains as honest "not available" for the same reason. Computing
divergence with no narrator arrays to compare would either render nothing meaningful or fabricate
content to fill the gap, either of which is a §0 violation.
**Decision.** `diffChains` is implemented and unit-tested against mock narrator arrays, but stays
dormant in production. The comparison overlay shows an honest "Isnad comparison not yet available —
chains are being compiled" note instead. `diffChains` activates automatically, with no further code
change, once real narrator-chain data lands. (Matches Modules 7–14.)
**Consequences.** No fabricated or inferred isnad divergence ever reaches a user. A future session
that adds narrator-chain data should verify `diffChains` activates correctly rather than assuming
it needs to be "turned on" — the gate is data presence, not a flag.
**References.** `docs/superpowers/plans/2026-07-22-module-15-comparison-mode.md`.

## ADR-038 · Translation excluded from diff-highlighting · Accepted · 2026-07-22 · Module 15 (Comparison Mode)
**Context.** Comparison Mode shows Arabic matn and translations side-by-side across compared
hadith. Per §0, the Arabic matn IS the narration, so a word-diff over it is a genuine
narration-level diff. Translations, by contrast, differ by translator word-choice — highlighting
those differences would misrepresent two translations of the same narration as different
narrations, which is a factual misrepresentation risk.
**Decision.** `.diff-highlight` runs **only** on `arabicMatn`. Translations are rendered
side-by-side for reading but are **never** passed through the diff/highlight logic. When Arabic is
missing for a compared hadith, the UI shows an honest "cannot diff narration" state — it never
falls back to diffing translations instead.
**Consequences.** Diff highlighting always means "these are different narrations," never "these
are different translations of the same narration." A future session must not extend
`.diff-highlight` to translation text as a "convenience" — that would reintroduce the
misrepresentation this ADR exists to prevent.
**References.** `docs/superpowers/plans/2026-07-22-module-15-comparison-mode.md`.

## ADR-039 · Comparison selection is in-memory + URL-encoded refs · Accepted · 2026-07-22 · Module 15 (Comparison Mode)
**Context.** Comparison Mode needs a selection of up to 3 hadith to persist across the "Compare →"
navigation and to be shareable/deep-linkable. The obvious options were a new `localStorage`/
`sessionStorage` key (per DATA.md's registry discipline) or encoding the selection directly in the
URL.
**Decision.** The comparison Set lives in memory only for the active session. Activating
"Compare →" writes the selected refs into the URL (`/hadith/compare?refs=slug:book:num,…`).
Deep-links and shares work by re-fetching each ref fresh on load — not by reading stored state. **No
sessionStorage key and no new DATA.md storage-key row were added.**
**Consequences.** Losing an in-progress (not-yet-navigated) selection on an accidental reload is a
known, narrow edge case, deferred until it proves real in practice. Deep-linked/shared comparison
URLs are always self-contained and reproducible without depending on the visiting browser's prior
state. A future session must not add a `localStorage`/`sessionStorage` key for this selection
without first re-deriving why the URL-only approach stopped being sufficient.
**References.** `docs/superpowers/plans/2026-07-22-module-15-comparison-mode.md`.

## ADR-040 · Reading Mode reuses `--gold-50` (#FDF8EC); the PRD's #FAF6EC is a near-duplicate, not a new color · Accepted · 2026-07-22 · Module 16 (Study & Reading Mode)
**Context.** PRD US-H21 and the Module 16 ticket both specify the Reading-Mode light background
as `#FAF6EC` ("gold-50 tint"). The design system already defines `--gold-50: #FDF8EC` — a
2-hex-digit drift from the spec value, visually indistinguishable. Invariant §3: "No new colors.
No raw hex inline."
**Decision.** Reading Mode's light surface uses `var(--gold-50)` (#FDF8EC), not a new
`--reading-surface` token holding #FAF6EC. The #FAF6EC in the PRD is treated as an unintentional
near-duplicate of the existing gold-50 token, not a deliberate new brand color. Dark mode is left
unchanged (the surface override is scoped to `html[data-theme="light"].reading-mode-hadith`, and
dark's `--gold-50` rgba is never applied as a page background).
**Consequences.** Zero new colors enter the palette; the "no new colors" invariant holds. Anyone
diffing the running background against the literal PRD value will see a #FDF8EC↔#FAF6EC delta —
this ADR is the record that the drift is intentional and sanctioned. A future session must not
"fix" the background to #FAF6EC by adding a raw-hex token without first re-opening this decision.
**References.** `docs/prd/IslamicInfo_HadithLibrary_PRD_v1_2_Final.md` (US-H21).

## ADR-041 · Reading Mode persists via URL param (primary) + storage-key mirror; Study Mode does not persist · Accepted · 2026-07-22 · Module 16 (Study & Reading Mode)
**Context.** Two deep-view display modes. Reading Mode (US-H21) must restore on reload and its
DoD names `?mode=reading` explicitly; TechSpec v1.2 also registers a storage key
`islamicinfo-hadith-reading-mode` (`'1'│absent`). Study Mode (US-H20) has no restore clause — it
is a focus toggle. This intentionally differs from ADR-039 (Comparison Mode chose URL-only, no
storage key), because a *persistent user preference* is a different problem from a *shareable
selection*.
**Decision.** Reading Mode is the source-of-truth pair: `?mode=reading` in the URL (shareable,
reload-safe — satisfies the DoD) **and** a mirrored storage key `islamicinfo-hadith-reading-mode='1'`.
On load, Reading restores if **either** is present (`initialMode`). Entering writes both; exiting
clears both. In-app navigation that drops the URL param still restores Reading from storage.
**Study Mode is session-only**: never written to URL or storage, and a route change drops it
(`clearModeClasses` resets a standing Study mode to none; Reading survives via the module var +
storage). Modes are mutually exclusive — only one `<html>` class (`study-mode-hadith` /
`reading-mode-hadith`) is ever set (`toggle()` in `hadith-display-mode-core.js`).
**Consequences.** A shared `?mode=reading` link opens in Reading Mode and also sets the visitor's
storage key (expected — it becomes their preference). Study Mode deliberately does not survive
reload or navigation, matching its "focus for this one hadith" intent. This is the opposite storage
choice from ADR-039 by design; a future session must not collapse the two into one policy.
**References.** `doc/tech-specs/IslamicInfo_HadithLibrary_TechSpec_v1_2.md` §data registry (line
306); `docs/prd/IslamicInfo_HadithLibrary_PRD_v1_2_Final.md` (US-H20, US-H21).

## ADR-042 · Reading Paths ship with deferred (empty) hadithRefs; curation is scholar-gated · Accepted · 2026-07-22 · Module 17 (Saved Reading Paths, US-H22)
**Context.** US-H22 defines 4 built-in reading paths totalling 147 hadith — Start with 40 Nawawi
(42), Kutub al-Sittah basics (50), Faith foundations (30), Prophetic Character (25); counts fixed
by PRD FIX-2 / Hadith_Module_PRD §12.6.4, with the 5th "Daily Sunnah" path deferred post-v1. Two
realities make bulk-seeding the references the wrong move: (1) the live data layer has **no Nawawi
collection** — the 9 served collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah,
Musnad Ahmad, Mishkat, al-Silsila al-Sahiha) would each need per-hadith remapping + verification;
and (2) three of the four paths are **editorial curations** — "which 30 hadith are the Faith
Foundations?" is a scholarly selection judgment. The charter forbids scholarly-consensus claims
without sourced references, and every prior module deferred curation to human/scholar review
(Module 8 "zero citation data authored"; Module 11 "no curated data → honest unavailable").
**Decision.** Build the full engineering (progress rings, deep-view strip, localStorage progress,
completion state, ring-math unit tests) but ship all 4 paths with `hadithRefs: []` and
`status: "curation-pending"`, rendering an honest muted **"Coming soon"** control per row. No hadith
reference is authored or self-certified. Curation is a separate scholar-gated content task that
only fills `hadithRefs`. The navigation/completion/strip logic is fully implemented and unit-tested
against **mocked populated paths** — dormant against the live seed — mirroring the disputed-grade
dead-code decision in the Module-2 content rules ([[hadith-module-decisions]]).
**Consequences.** The DoD line "every seed hadith reference verified as real and correctly cited" is
satisfied **vacuously and honestly** — zero references ship, so none can be mis-cited (the highest-
visibility trust failure the PRD warns about). The 4-path seed lives at
`src/data/hadith/reading-paths.json`; progress persists in `islamicinfo-hadith-paths`. A future
curation session must run each candidate reference through the hadith-verifier skill and confirm it
resolves to a live `/hadith/[collection]/[book]/[hadith]` route before populating `hadithRefs`; it
must NOT add a 5th path without editorial sign-off. Consistent with the engineering-complete /
content-deferred posture of Modules 14–16.
**References.** `docs/superpowers/specs/2026-07-22-module-17-reading-paths-design.md`;
`docs/prd/IslamicInfo_HadithLibrary_PRD_v1_2_Final.md` (US-H22, FIX-2).

## ADR-043 · Hadith base-page perf <90 (DoD-15) may be structurally capped by no-build ADR-001 · Accepted · 2026-07-22 · Module 18 (Hadith Hardening)
**Context.** Module 7 DoD-15 targets Lighthouse Performance <90 on the hadith base page; measured 62–65. The dominant costs are ~43 KiB unminified JS and the whole SPA loading per route — both only removable with minification/bundling, which ADR-001 (no build step) forbids. The cheap levers (font `display=swap`, `preconnect`) were already applied before Module 18.
**Decision.** Apply the remaining NO-BUILD levers only: (1) non-render-blocking font stylesheet via the `preload`→`onload` swap pattern (with a `<noscript>` fallback), and (2) lazy-loading the four post-interaction feature scripts (`hadith-ai-core`, `hadith-ai`, `quranlyai-widget`, `select-to-ask`) after first paint via `requestIdleCallback`/`load` (dynamic injection with `async=false` to preserve execution order). Each was verified as a non-first-paint dependency of `hadith.js`. Measure honestly with Lighthouse and report the real number rather than chasing 90 by any means.
**Consequences.** These levers reduce render-blocking CSS and main-thread work but may not reach 90; the residual gap is structural under ADR-001. Reaching <90 would require either revisiting ADR-001 to add a build step (minify/bundle) or a hosting/build change — a separate plan-and-approve decision, explicitly out of Module-18 scope. This is a documented, known ceiling, not a silent workaround. **Measurement:** deferred to human sign-off — no browser automation / Chrome DevTools / Lighthouse tooling was available in the Module-18 build session (matches the deferred live-verification posture of Modules 14–17). The before/after score must be captured on a real device before DoD-15 can be marked closed; the levers themselves are applied and reversible.
**References.** `docs/superpowers/specs/2026-07-22-module-18-hadith-hardening-design.md`; `docs/superpowers/plans/2026-07-22-module-18-hadith-hardening.md`; ADR-001 (no-build); Module-7 DoD-15 (`hadith-module-7-state`).

## ADR-044 · Content review gate: project owner (Morshed Milon) is the sole human approver; authenticity/no-fabrication rules unchanged · Accepted · 2026-07-23 · Governance
**Context.** CONTENT-POLICY §5 originally required an external qualified-scholar sign-off before any Islamic content could ship. That external dependency indefinitely blocked every content feature (narrator gradings, topic summaries, trace commentary, reading-path hadith references) — all of which were built but left honest-empty/curation-deferred because no scholar review was arranged. The project owner requested changing *who approves*, without weakening what may be published.
**Decision.** The sole human approver before publish is now **Morshed Milon (project owner)**; a separate external-scholar sign-off is no longer required. This is safe **only because** the authenticity rules are kept fully intact and non-negotiable: content is **sourced and cited, never AI-generated**. Specifically (unchanged): never invent Qur'an/hadith text; never invent/guess/paraphrase a hadith grading from model memory — every grading must trace to a named source (sunnah.com / al-Albani / Ibn Hajar / another cited scholar or database) via the hadith-verifier data layer; never invent isnad or scholarly commentary; when a source is missing show "not yet verified" / "not documented in available sources" (never fabricate); weak/fabricated narrations stay labeled. Workflow: pull only from cited sources → display citation inline (collection, number, grader) → Morshed approves each batch/item → publish; flag ambiguity for Morshed rather than generating filler.
**Consequences.** Content features can now be populated and shipped without an external scholar, unblocking launch — but every claim must still be traceable to a real source, and the AI never self-approves nor fabricates. `docs/islamic-authenticity-rules` (the file `skills/islamic-authenticity/islamic-authenticity.md`) and the no-fatwa / consult-a-scholar-for-rulings user-facing guidance are **untouched**. Supersedes the external-scholar-approver clause of CONTENT-POLICY §5 (v1.0 → v1.1).
**References.** `doc/CONTENT-POLICY.md` §5 (v1.1); `skills/islamic-authenticity/islamic-authenticity.md` (unchanged); `skills/islamic-authenticity/SKILL.md` (hadith-verifier).

## ADR-045 · Permanent hadith/rijal/commentary source architecture; sunnah.com is an optional future cross-check, not a blocker · Accepted · 2026-07-23 · Data sourcing
**Context.** The empty content surfaces (narrator reliability, hadith/Qur'an commentary) had no data because hadithapi.com and the flat editions don't contain rijal gradings, isnad chains, or commentary. Sunnah.com's API needs a key requested via a GitHub issue with no SLA — treating it as "pending primary" stalls launch indefinitely for no authenticity gain (the free alternatives pull the same canonical collections).
**Decision.** Permanent, free, no-key source architecture (all machine-readable + citable):
- **Hadith text + gradings:** hadithapi.com (live Worker `/api/hadith`, primary runtime feed — keep; supplies per-hadith sittah grades) + **fawazahmed0/hadith-api** (direct editions) + **UmmahAPI** (`/api/hadith`, secondary/cross-check).
- **Narrator reliability (rijal):** **Itqan Rijal Database** (github.com/R3GENESI5/Itqan) — 115,735 profiles / 22 classical texts, cite the specific text+scholar (Ibn Hajar's *Taqrib*, al-Dhahabi, …). Never a narrator verdict without a matching Itqan record.
- **Commentary:** **UmmahAPI tafsir** (Ibn Kathir / Ma'arif / Muyassar) for **Qur'an per-ayah** commentary (NOT hadith commentary); **LK-Hadith-Corpus** (Leeds/King Saud) for deeper per-hadith Arabic–English parallel/commentary.
- **Sunnah.com:** OPTIONAL future cross-reference. If a key is granted, plug it in *alongside* as an extra confidence layer — do not rebuild the pipeline around it, do not block on it.
**Consequences.** Registered in the hadith-verifier skill (`skills/islamic-authenticity/trusted-sources.md`) and CONTENT-POLICY §5. No-fabrication rule unchanged: every hadith/narrator/commentary claim traces to one of these named sources shown inline; no match → "not yet verified". **Runtime wiring is separate engineering** (esp. Itqan's 118 MB `narrator_unified.json` needs a backend — Worker + R2/D1/KV — plus name-matching; UmmahAPI tafsir is Qur'an-only). This ADR fixes the source *policy*; the integration is scoped per surface.
**References.** `skills/islamic-authenticity/trusted-sources.md`; `doc/CONTENT-POLICY.md` §5; [[content-review-gate-owner]] (ADR-044); Itqan repo; ummahapi.com.

## ADR-046 · Itqan narrator-reliability integration: source, license, review gate, and data-acquisition prerequisite · Proposed · 2026-07-23 · Module (narrator reliability, Module 8)
**Context.** Wire real narrator reliability (jarh wa ta'dil) into the Module-8 narrator panel from the Itqan Rijal Database (ADR-045), behind a feature flag, owner-reviewed before enable.
**License (cleared).** Itqan code = MIT; narrator gradings derive from PUBLIC-DOMAIN classical rijal texts (Ibn Hajar, *Taqrib al-Tahdhib*; al-Dhahabi; al-Mizzi; …). Re-serving gradings is permissible WITH attribution to Itqan + the named classical text/scholar shown inline.
**Data-acquisition blocker (open).** The graded dataset is NOT directly downloadable: committed `narrator_index.json` has `grade_profile: {}` (no grades); the graded `narrator_unified.json` (~118 MB) is gitignored, has NO GitHub release assets, and is only (a) regenerable via Itqan's Python pipeline `enrich_data.py`, or (b) served as 7 chunks via their GitHub Pages app. Acquiring it requires running their pipeline or locating/downloading the Pages chunks / a Zenodo archive — an out-of-band step. The real graded schema must be inspected before the D1 schema + ingestion can be written accurately.
**Infra prerequisite.** Ingest target = Cloudflare **D1** (SQLite; name-indexed for lookup). Provisioning (`wrangler d1 create`) + bulk import + deploy run against the OWNER's Cloudflare account — not doable from the build session without that access.
**Design (when unblocked).** D1 table of narrator profiles (normalized name + variants, grade, grading scholar, source text, entry id). `/api/narrator?name=` endpoint: normalize + match hadithapi `englishNarrator` against name + 217k variants; an EXPLICIT confidence threshold — below it → treat as no-match. Panel renders the grade EXACTLY as sourced ("Thiqah — Ibn Hajar, *Taqrib al-Tahdhib*"); no-match / low-confidence → "not yet verified" (never inferred). Ship behind flag **default OFF** (Module-13 posture).
**Review gate (before enabling the flag).** Owner spot-checks a sample of Itqan entries against known classical gradings to confirm the DATASET itself is reliable (not just correctly wired), then approves. No-fabrication rule (ADR-044/045) unchanged.
**Status.** PROPOSED — blocked on data acquisition + D1 access. Code (endpoint, matching, panel wiring, flag) can be scaffolded once the real graded schema is in hand.
**UPDATE 2026-07-23 — data source LOCATED + schema verified (owner-supplied).** Public, static, CORS-friendly JSON on GitHub Pages (no auth/keys/limits): manifest `https://r3genesi5.github.io/Itqan/app/data/rijal/manifest.json` → 7 grade-tier chunks (`profiles_{companion,reliable,mostly_reliable,weak,abandoned,fabricator,unknown}.json`), 115,735 total. **Verified schema** (id-keyed): `full_name`, `kunya`, `grade_en`/`grade_ar` (consolidated), `namings[]` (variant strings), `classical_sources{ <text>: {entry_id, grade_en, grade_ar} }` (per-text, can disagree), `teachers[]`/`students[]`, `dhahabi`, `death`, `tabaqat`, `city`. **Data-acquisition blocker RESOLVED.** **CRITICAL DESIGN FINDING:** all Itqan names (`full_name`/`kunya`/`namings`) are **Arabic-script ONLY** — no Latin/English. hadithapi.com supplies the narrator as an **English** string (`englishNarrator`), so there is NO direct join key; English→Arabic cross-script matching is required and hard. Consequence: coverage is **partial** — a curated English→Itqan-id map for common narrators (+ optional transliteration fuzzy layer), confidence-gated; below threshold → "not yet verified" (never a wrong verdict). Display: consolidated `grade_en` as headline + surface the `classical_sources` per-text breakdown (don't flatten scholar disagreement). Remaining prerequisites: D1 provisioning/import run against OWNER's Cloudflare account; owner reviews a data sample before the flag flips on. Plan: `docs/superpowers/plans/2026-07-23-itqan-narrator-integration.md`.
**References.** ADR-045 (source architecture); [[content-review-gate-owner]]; github.com/R3GENESI5/Itqan (MIT; data gitignored/regenerable).

## ADR-047 · Itqan matching v1 = curated English→id map + confidence gate; algorithmic transliteration/fuzzy matching deliberately DEFERRED to v2 · Accepted · 2026-07-23 · Narrator reliability (Module 8)
**Context.** Itqan narrator names are Arabic-script only; hadithapi supplies the narrator as an English string — no direct join key (ADR-046 update). Two ways to bridge: a curated English→Itqan-id map (precise, partial) or algorithmic Arabic↔Latin transliteration + fuzzy match (broad, risky).
**Decision.** v1 uses ONLY a **curated English→Itqan-id map** for the ~150–300 common narrators (mostly Companions), each entry verified against the real Arabic profile before inclusion. Exact normalized hit → show the full profile + `classical_sources` breakdown; **no hit → "not yet verified"** (never a fuzzy/guessed match). Algorithmic transliteration/fuzzy matching is **deliberately deferred to v2**.
**Rationale.** Broad fuzzy-matching on **narrator reliability** data carries real risk of **mislabeling** a narrator (attaching the wrong reliability verdict to a hadith's narrator = religious misinformation) — that downside outweighs the coverage gain for v1. Precision-over-recall is the correct posture for authenticity data; coverage grows as the curated map is expanded (post-ingestion, by querying the data), and v2 can add confidence-scored transliteration once the pipeline + data quality are proven.
**Consequences.** v1 coverage is partial by design; the long tail shows "not yet verified" (honest, never wrong). Ships behind flag ITQAN_NARRATOR_ENABLED (default OFF) pending owner data-sample review. Plan: `docs/superpowers/plans/2026-07-23-itqan-narrator-integration.md`.
**References.** ADR-046; [[content-review-gate-owner]].

## ADR-048 · Al-Silsilah al-Sahihah sourcing reversed: Dorar.net Arabic search replaces the reference-linked card · Accepted · 2026-07-23 · Hadith sourcing (Silsila as-Sahiha)
**Context.** Al-Albani's *Silsila as-Sahiha* has no clean structured, browsable-by-number data source. Commit `35bcc19` shipped an honest "reference-linked" card pointing readers to Archive.org (English selection) and al-hadees.com (verify-by-number) rather than fabricate a browsable grid. That approach is now reversed.
**Decision.** The Silsila collection page becomes an **Arabic keyword-search interface into Dorar.net's Hadith Encyclopedia (الموسوعة الحديثية)**, scoped to al-Albani's *Silsila as-Sahiha*, via a new Worker endpoint `GET /api/hadith/dorar/search?q=&page=` (see `doc/API-SPEC.md`). Dorar is a search engine, not a by-number catalogue, so a search-driven model is the honest fit — there is still no "browse #1..N" for Silsila.
- **Ruling shown VERBATIM, never keyword-mapped to a badge.** Verified against live Dorar data (`worker/test/fixtures/dorar-silsila-api.json`, 2026-07-23): Silsila entries do not carry a clean one-word grade (`درجة الحديث`); they carry `خلاصة حكم المحدث` — al-Albani's paragraph-length ruling (e.g. "رجاله ثقات رجال مسلم إلا أنه منقطع لكن قد روي موصولا..."). Reducing that to a Sahih/Da'if badge would misrepresent nuance (e.g. a flagged broken chain or a weak narrator inside an otherwise-authenticated hadith) — forbidden by the charter's no-fabrication rule. The ruling is rendered as its own labeled block, sourced to the grader + Dorar.net, exactly as returned.
- **Citation uses Dorar's page-style ref verbatim, not the site-wide format.** `الصفحة أو الرقم` is page-style (e.g. `"6/778"`), not a clean sequential hadith number, so this collection does NOT use `[Collection] [Number]` (`hadith-citation-core`). Citation is `Al-Silsilah al-Sahihah — 6/778` (or just `Al-Silsilah al-Sahihah` when Dorar returns no ref) — never coerced to or parsed as an integer.
- **No English translation ingested.** A per-card "Ask QuranlyAI" button covers translation/explanation for non-Arabic readers instead, clearly separated per CONTENT-POLICY §3/§8 (mandated "Not a religious ruling" footer).
- **Ships behind `HADITH_SILSILA_DORAR_ENABLED` (Worker env, default OFF; `worker/wrangler.toml`).** While OFF the route is dark and the Silsila page keeps the prior reference-linked card — no user-visible regression. Two launch gates before flipping the flag: (1) **owner review of dorar.net's terms/attribution** (their robots/ToS restrict bots; owner reviews manually and any required attribution is added); (2) **Worker-reachability confirmation** that dorar.net does not 403 the Worker's server-side calls — if it does, fall back to self-hosting the MIT-licensed `AhmedElTabarani/dorar-hadith-api` wrapper (Cloudflare) and point the Worker at it (a routing change only; parser/endpoint/UI unaffected).
**Consequences.** `al-silsila-sahiha` in `src/data/hadith/collections.json` is flagged `"search":"dorar"` (marker only — routing stays slug-based in `src/js/hadith.js`, not provider-based) with `hadithCount` kept `null` (search-only, no count to assert). Worker KV cache `hadith:dorar:search:{q}:{page}` 7d TTL + `dorar:quota:{ip}:{utcDate}` 100/IP/day (see `DATA.md` §5). Fail-closed on all upstream failure modes (empty query/upstream error/quota all return honest states, never a partial or fabricated narration). No content fabrication risk: every rendered field traces to Dorar.net's response, verbatim.
**References.** `docs/superpowers/specs/2026-07-23-silsila-sahiha-dorar-search-design.md`; `doc/API-SPEC.md` `GET /api/hadith/dorar/search`; `doc/DATA.md` §5; commit `35bcc19` (superseded); [[content-review-gate-owner]] (ADR-044).

## ADR-049 · Qur'an search corpus = quran.com API v4, Arabic text_uthmani + English edition 20 (Saheeh International), pinned & ingested · Accepted · 2026-07-25 · Search (hero federation, Slice 1)
**Context.** The hero search needs a real Qur'an keyword-search backend. Verse text must come from an established dataset with attribution — never model-generated (charter no-fabrication invariant). The existing Qur'an display module already fetches verse text from quran.com API v4 (`src/js/quran-verses.js`; default English translation edition **20 = Saheeh International**, `quran-translations.js` `DEFAULT_ID = 20`).
**Decision.** Ingest the full 6236-verse corpus from **quran.com API v4** (`/verses/by_chapter`): Arabic = `text_uthmani`; English = translation **edition id 20 (Saheeh International)**. The edition id is **pinned** in the ingest script (`worker/scripts/ingest-quran-corpus.mjs`, `EDITION_ID = 20`) so re-ingests are reproducible; provenance (source, edition id + name, fetch date, verse count) is stored in the corpus `meta`. Translation HTML footnote markup (`<sup>…`) is stripped at ingest. Rationale: consistency with the existing on-site verse display (same source + edition); sourced, attributable, never fabricated.
**Consequences.** Corpus committed at `src/data/quran/search-corpus.json` (2.8 MB, 6236 verses). A corpus-integrity test (`worker/test/quran-corpus.test.js`) enforces 6236 verses / edition 20 / no empty arabic-or-translation. Attribution ("Saheeh International", quran.com) surfaced in the `/api/quran/search` response `source`/`edition` fields and must be shown wherever results render (Slice 3). Only edition 20 (English) is ingested for now; other-language corpora are future work.
**References.** `docs/superpowers/specs/2026-07-25-search-slice1-quran-design.md`; `docs/superpowers/plans/2026-07-25-search-slice1-quran.md`; `src/js/quran-verses.js`; [[quran-module-state]].

## ADR-050 · Qur'an search storage = static JSON corpus + Worker scan + per-query KV cache; D1+FTS5 is the designated upgrade path · Accepted · 2026-07-25 · Search (hero federation, Slice 1)
**Context.** With the corpus ingested (ADR-049), the search mechanism must fit the existing infra (Cloudflare Worker + KV + static JSON) without over-engineering, while leaving room to scale.
**Decision.** `GET /api/quran/search?q=&page=&limit=` loads the static corpus once per isolate (module-global memo, fetched from the Pages static asset URL, overridable via `env.QURAN_CORPUS_URL`) and scans it with the pure, diacritic-insensitive matcher `worker/src/lib/quran-search-core.js` (strips tashkeel/tatweel, folds alef/ta-marbuta/alef-maksura/hamza; case/accent-insensitive English). Per-query results are cached in `QURANLYAI_KV` (`qsearch:{page}:{limit}:{normalizedQ}`, 1h TTL), mirroring `/api/hadith/search`. **Cloudflare D1 + FTS5 is the designated upgrade path** if corpus size or search quality (ranking, stemming, phrase proximity) ever demands it.
**Consequences.** No new binding/infra for v1. The route is registered inside the GET block **before** the `/api/quran/` pending-stub catch, so non-search `/api/quran/*` paths still return 501. The Worker fetching the corpus from the Pages origin means the corpus must be deployed to Pages before the endpoint is fully live (a deploy-ordering note for Slice-1 go-live). Search is substring/token-AND, not semantic — synonyms/roots not matched (acceptable for v1; D1/FTS5 or vectors = upgrade).
**References.** `docs/superpowers/specs/2026-07-25-search-slice1-quran-design.md`; ADR-049; `worker/src/quran-search.js`; `worker/src/lib/quran-search-core.js`.

## ADR-051 · Dua search corpus = Hisn al-Muslim (Fortress of the Muslim) via wafaaelmaandy/Hisn-Muslim-Json; static JSON + Worker scan + KV; owner license/attribution gate before public · Accepted · 2026-07-25 · Search (hero federation, Slice 2)
**Context.** The hero-search Dua pill needs a real, sourced dua-search backend. No dua dataset or `/api/dua` route existed (dua.html was ~29 hardcoded cards; `reflection-dua.json` is only a handful of daily-reflection duas). Owner chose "established open Hisnul Muslim JSON," to be verified reachable/structured before ingest and logged here.
**Decision.** Ingest the **Hisn al-Muslim (Fortress of the Muslim)** corpus from the pinned open dataset `github.com/wafaaelmaandy/Hisn-Muslim-Json` (`husn_en.json`, master) — verified reachable (240 KB) and well-structured: `English[]` chapters `{ID,TITLE,TEXT[]}`, each dua `{ARABIC_TEXT, LANGUAGE_ARABIC_TRANSLATED_TEXT (transliteration), TRANSLATED_TEXT (English)}`. Flattened to **267 duas across 132 categories** → committed `src/data/dua/search-corpus.json` (~0.19 MB). `GET /api/dua/search?q=&page=&limit=` loads the corpus once per isolate (module-global memo, from the Pages asset, overridable via `env.DUA_CORPUS_URL`) and scans it with `worker/src/lib/dua-search-core.js` `searchDuas()`, which **reuses the Slice-1 diacritic-insensitive normalizers** (`quran-search-core.js`): Arabic query → normalized `arabic`; Latin query → normalized `translation + category + transliteration`. Per-query KV cache `dsearch:{page}:{limit}:{normalizedQ}` (1h). **D1+FTS5 = same designated upgrade path (ADR-050).**
**Provenance & license (honest).** Text is the *Hisn al-Muslim* compilation by Sa'id ibn Ali al-Qahtani. The dataset carries **no explicit license**, and has **no per-dua Quran/hadith citation field** — the provenance is the compilation itself. Corpus `meta` records `source` (Hisn al-Muslim + al-Qahtani), `sourceDataset` (the repo), and a `licenseNote` (unstated). Attribution ("Hisn al-Muslim") is surfaced on every result and must show wherever duas render (Slice 3). **Owner-review gate:** the owner confirms attribution/permission is acceptable BEFORE the Slice-3 Dua pill goes public (mirrors ADR-048's dorar.net terms gate). Until cleared, the Dua pill stays "coming soon" even though the endpoint exists.
**Consequences.** No-fabrication upheld — dua text comes only from the ingested dataset; if the source is unreachable at ingest, the task reports BLOCKED (never hand-authored). Corpus-integrity test (`worker/test/dua-corpus.test.js`) enforces ≥250 duas + Hisn al-Muslim attribution + non-empty records. Search is substring/token-AND, not semantic. `/api/dua/search` registered inside the GET block beside `/api/quran/search`.
**References.** `docs/superpowers/specs/2026-07-25-search-slice2-dua-design.md`; `docs/superpowers/plans/2026-07-25-search-slice2-dua.md`; ADR-050 (storage pattern); ADR-048 (owner-review-gate precedent); [[content-review-gate-owner]] (ADR-044).

## ADR-052 · Hero search federation frontend: dedicated indexable search-results.html; Verify-claim → QuranlyAI panel; tightened detectClaim; scope=all top-5 (Verify excluded); DUA_SEARCH_PUBLIC flag gate · Accepted · 2026-07-25 · Search (hero federation, Slice 3)
**Context.** Slices 1–2 shipped live Qur'an + Dua search backends (ADR-049/050/051). Slice 3 makes the homepage hero search user-visible and federated per active pill (All/Hadith/Qur'an/Dua/Verify). Mic (Web Speech) + Enter/submit already existed.
**Decisions.**
- **Dedicated results page.** Submissions route to `search-results.html?q=&scope=` — a real, shareable, indexable page (SEO `title`/`meta` reflect `{q}`: "Search: {q} | IslamicInfo"), NOT ephemeral inline results. It reuses the hadith card renderer (`II.hadithFeed.buildCardHTML`) and new escaped verse/dua card builders (`search-results-core.js`). `hadith.html?q=` is preserved unchanged as an ALIAS (contract locked by `worker/test/search-alias.test.js`; `hadith.js` untouched).
- **Verify pill → live QuranlyAI, not a fake verdict.** `detectClaim(q)`: a **claim** opens the floating QuranlyAI panel (`setContext({type:'claim',rawText})` + `ask('custom', q)`) — which already renders cited sources + the permanent "Educational purposes only · No Fatwas" disclaimer — a bare **keyword** runs Hadith search. No `/api/verify` fact-check engine is implied; verify.html's demo stays a labeled preview (ADR posture unchanged).
- **`detectClaim` heuristic (definition).** Returns `'claim'` iff: (1) trimmed text ends with `.`/`?`/`!`/`؟`; OR (2) contains a quote char `["'«»""'']`; OR (3) contains a whole-word/phrase English marker `(said|narrated|reported|claims|claim that|prophet|sunnah says)`; OR (4) has **≥5 words AND** a whole-word verb `(is|was|are|were|will|would|should|must|did|does|has|have|can)`. Else `'keyword'`. **Word count alone never triggers a claim** — multi-word keyword queries (`sahih bukhari fasting ramadan`, Arabic `صحيح البخاري الصيام`) route as keyword; Arabic without `؟`/quotes never false-positives. Unit-locked in `worker/test/search-results-core.test.js`.
- **`scope=all` federation.** Parallel fetch of live scopes, **top-5 per section** + "See all N →" deep-link per scope. **Verify is excluded from `all`** (it is a panel interaction, not a result list).
- **`DUA_SEARCH_PUBLIC` flag gate.** A const in `src/js/search-results-core.js`, **default `false`** — the Dua pill shows an honest "coming soon" note and Dua is omitted from `all`, even though `/api/dua/search` is live. Flipping it to `true` is the documented one-line go-public step, to be done ONLY after the owner clears the Hisn al-Muslim license/attribution review (**ADR-051** gate).
- **Honest states / site rules.** Plain empty ("No results for '…' — try different or more general terms.") and error ("Search is temporarily unavailable. Please try again.") copy — no urgency language; loading uses a plain spinner, **no shimmer**.
**Consequences.** All search result text remains sourced (Qur'an = ADR-049 corpus; Hadith = /api/hadith/search; Dua = ADR-051 corpus, gated); card builders escape all interpolated text (XSS). `search-results-core.js` loads before `home-search-core.js` on index.html so the browser has `detectClaim`/`DUA_SEARCH_PUBLIC`. Pure logic is TDD-locked; the DOM page/controller is verified by post-deploy manual smoke (no in-repo browser-automation harness).
**References.** `docs/superpowers/specs/2026-07-25-search-slice3-frontend-design.md`; `docs/superpowers/plans/2026-07-25-search-slice3-frontend.md`; ADR-049/050 (Qur'an), ADR-051 (Dua + license gate); `src/js/quranly-ai.js` (QuranlyAI panel).
