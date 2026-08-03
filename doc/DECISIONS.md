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
**UPDATE 2026-07-25 — owner cleared the license/attribution gate; Dua pill made PUBLIC.** Project owner (Morshed Milon, the CONTENT-POLICY §5 approver per ADR-044) reviewed and approved the Hisn al-Muslim source + attribution. `DUA_SEARCH_PUBLIC` flipped to `true` in `src/js/search-results-core.js` — the Dua pill now navigates to real results and Dua joins the `scope=all` federation. The "Hisn al-Muslim (Fortress of the Muslim)" attribution remains rendered on every dua result (corpus `meta` + `buildDuaCardHTML`). Gate CLOSED.
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

## ADR-053 · Dua page naming governed by DUA-KEYWORD-NAMING v1.1: two-track model, occasion/topic taxonomy, transliteration content gate · Accepted · 2026-07-31 · Dua detail pages (SEO naming + architecture)
**Context.** `doc/DUA-KEYWORD-NAMING-v1_0.md` set title/H1/slug/meta rules for the 506 dua detail pages on the assumption that all 132 chapter labels describe an **occasion**. The Phase 1 read-only audit (`CHAPTER-LABELS-AUDIT.md`, `DUPLICATE-CLUSTERS.md`, `COMMON-NAME-CANDIDATES.md`, 2026-07-31) established that assumption is false for half the corpus, and surfaced five further conflicts between the spec and the data. The owner amended the spec rather than the finding.
**Decision.** `doc/DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md` is adopted and **wins over v1.0 on conflict**. It supersedes v1.0 §3/§4 (scope), §5 (disambiguator ladder), §7 S3/S4 (slugs), §11 (phasing) and §12 (architecture); v1.0 §2, §6 (as extended), §8, §9, §10, §13, §14 stand. The substantive rulings:
- **A1 — transliteration is a hard content gate above all SEO considerations.** 307 of 506 pages lack a usable transliteration while their H1 and meta description promise "Arabic, Transliteration & Meaning". No page ships without one; transliteration must be **sourced or reviewed, never machine-generated and shipped unread** (automated romanisation is unreliable on emphatics, hamza and taa marbuta, and a wrong transliteration on a dua page is a trust failure of a different order than a bad title). Pages whose transliteration cannot be sourced stay `noindex` and out of the sitemap indefinitely.
- **A2/A3 — two-track model.** Track A = ~124 occasion chapters (~247 pages), which keep v1.0 §3–§4. Track B = **8 collection book-name labels covering 259 pages (51.2%)**, for which the label is discarded as a title element and survives only as source metadata; the formula inverts to `{Dua name or incipit}: {Topic}`. Book names label a position in a manuscript, not a situation, so no lexical substitution can make them searchable — the fix is structural.
- **A10 — navigation taxonomy is occasion and topic; source collection is metadata, never navigation.** Supersedes v1.0 §12. Topic hubs (~40–60, indexed and comprehensive) + named spokes (~120–180, indexed where the dua has standalone demand) + anchor entries (`noindex,follow`) + one canonical page per unique text (Ayatul Kursi is one page cited by three occasions, not three pages).
- **A4 — disambiguator ladder gains an English-opening rung (c)**, ≤30 chars, whole words, no ellipsis or unbalanced punctuation. v1.0's ban targeted malformed truncations, not clean phrases.
- **A5 — slug references are retained where meaningful; numeric collision suffixes (`-2`…`-99`) are prohibited.** v1.0 S3 was over-corrected: dropping every reference removed the only uniqueness guarantee.
- **A8 — L1 (must contain Dua/Duas/Adhkar) is exempted where the entry is not a supplication.** A label must never claim a page contains a dua when it does not. Dhikr formulas take their correct term (takbir, tasbih); greetings, etiquette and the 20 English-narration guidance entries are routed **out of `/duas/`** entirely. **Bug B3 (v1.0 §11 Phase 3, "missing Hisn 28 entry 110") is WITHDRAWN** — the audit proved 28:110 exists and is correctly excluded as `entryType: "guidance"` (it describes a practice and contains no supplication text).
- **A9 — five audit corrections accepted**, including `hisn-27-76` being the **Three Quls** (112+113+114), not Surah Al-Ikhlas, and that similarity thresholds must **never auto-merge** duplicate clusters: DUP-08 and DUP-12 are partial overlaps where one entry contains a passage the other also has, not duplicates. Every cluster requires human adjudication.
- **A6 — §6 spelling extended:** `Adhan` (cover athan/azan in body) and `Salawat` (cover durood/darood in body), on the Salah/Namaz principle already established.
- **A11 — new Phase 1.5 content gate** blocking Phase 3: source the 307 transliterations, assign topics to the 259 Track B pages, route non-dua entries out, repair the ch40 corpus label and audit for others. Recommendation: **ship Track A first as its own release** rather than holding 506 pages for the harder half.
**Consequences.** Phase 3 is blocked until Phase 1.5 completes; the critical path is now transliteration sourcing, not naming. The 259 Track B topic assignments are real editorial work with no mechanical shortcut. All 506 pages remain `noindex,follow` and absent from `sitemap.xml`; batches 1–2 remain `approved: false`. No slugs have changed and `page-copy.json` is untouched. The ch40 corpus label ("Invocations for if you are stricken by in your faith") is a **source data defect** to be verified against a print copy of Hisn al-Muslim and repaired — never guessed.
**References.** `doc/DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md` (wins on conflict); `doc/DUA-KEYWORD-NAMING-v1_0.md`; Phase 1 artifacts `CHAPTER-LABELS-AUDIT.md`, `DUPLICATE-CLUSTERS.md`, `COMMON-NAME-CANDIDATES.md`; `docs/seo/DUA-URL-SCHEME.md` (D8 guidance-entry exclusion, upheld); ADR-051 (Hisn al-Muslim corpus + owner licence gate); [[content-review-gate-owner]] (ADR-044).

## ADR-054 · Dua corpus content integrity supersedes naming: three gates (not-a-dua route-out, transliteration, text integrity) block all naming work · Accepted · 2026-07-31 · Dua detail pages (content integrity)
**Context.** ADR-053 adopted `DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md` and made transliteration (§A1) a content gate above SEO. The **Phase 1.5 audit (2026-07-31)** — run to satisfy the A11 gate — established that the transliteration gap is not the only, or the worst, content defect in the 506-page dua corpus. It found three defect classes that no naming rule could have caught, one of which (Ibn Majah 3590) publishes as a dua the exact wording its own narration prohibits. The project was scoped as a titling exercise; the audit establishes it is a **content integrity remediation with a titling component**, and the documents and effort must reflect that order.
**Decision.** `doc/DUA-CONTENT-INTEGRITY-v1_0.md` is adopted. It **supersedes `DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md` §A1** (which it restates with measured numbers) and **sits above both naming specs** — v1.0 and v1.1 alike. Naming, topic-assignment and indexing work is **paused** until Gates 1–3 clear. On conflict the order is: DUA-CONTENT-INTEGRITY v1.0 > DUA-KEYWORD-NAMING v1.1 > DUA-KEYWORD-NAMING v1.0. The substantive rulings:
- **Gate 1 — not-a-dua (45 pages).** 25 condemned-speech entries (speech of Iblis 15:36/15:39, the pleas of the damned, Satan's companion disowning him at 50:27), 1 inverted narration (Ibn Majah 3590), and 19 narrative statements currently render as duas. **Ruling: route out of `/duas/` entirely, do not warn-and-keep.** `entryType: "contextual"` plus an on-page notice is the right *identification* mechanism and the wrong *mitigation* — a warning fixes the page and has no effect on the SERP, which displays the title; a page titled as a dua is received as a dua by everyone who never opens it. The words `Dua`, `Duas`, `Adhkar` must not appear in the title, H1, meta description or slug of any of the 45. **Records are not deleted** — the data is sound, the framing was wrong; route-out means `noindex`, parked, pending a future honest home (e.g. *Speech of Iblis Recorded in the Qur'an*, or a hadith-guidance page *Why Not to Say "O Allah, Forgive Me If You Will"*), never in `/duas/`.
- **Gate 1 verification requirement (§1.5).** The 25 were identified by a single reading. Before any is routed out permanently, each must be confirmed against a **second independent signal** — speaker attribution in the Arabic, or the surrounding ayat. This cuts both ways: a page wrongly classified is removed for no reason.
- **The 19 narrative entries are out of scope for Claude Code and for the owner.** Identifying a speaker and determining whether a Qur'anic passage constitutes a supplication is **tafsir-level adjudication** (11:45 — Nuh's appeal, rebuked in the following verse — is the exemplar). Routed to **qualified scholarly review**; the same reviewer covers §1.5 verification of the 25 and the ch40 print-copy check. This is a real external dependency with no internal substitute.
- **Ibn Majah 3590 is the single most urgent page.** Its narration quotes "O Allah, forgive me if You will" as the wording one must **not** use, and continues *"Let him be definite in his asking."* The page teaches the opposite of its own source — an **inversion**, not a gap — and is pulled ahead of all other work in this document.
- **Gate 2 — transliteration, restated with measured numbers (supersedes v1.1 §A1).** Track A (occasion chapters): 247 pages, **48** lacking transliteration (80.6% covered); 20 of the 48 overlap the A8 English-prose route-out list, so **Track A's real requirement is ~28 pages**, all Hisn al-Muslim — one source, one dataset. Track B (book-name chapters): 259 pages, **0% covered** — ~74 Qur'anic (post-Gate-1), suppliable from the already-integrated quran.com API v4 published transliteration, and ~160 hadith-collection pages that remain genuine sourcing work with no shortcut. v1.1 §A1's rules stand unchanged: **sourced or reviewed, never machine-generated and shipped unread; no page ships without it.**
- **Gate 3 — text integrity, a newly-bounded defect class.** Six Track B entries carry defects that are not naming problems (`Nasa'i 5464` narration leaked into the translation; `Nasa'i 5539` — *the dua itself is missing*; `Tirmidhi 3597` truncated with transliteration bled into the translation; `132:267` no Arabic at all; two more in the same class). **These were found incidentally during topic assignment**, over a 259-page sample, not 506. A defect class discovered by accident during unrelated work **has not been bounded**. Requirement: a deliberate integrity scan of all 506 Arabic and translation fields — narration leakage, transliteration bleed, truncation, unbalanced quotes/parens, empty fields, Arabic-without-translation and the reverse — **before any naming work proceeds**.
- **Track A ships as a separate release.** ~215 shippable pages after A8 and Gate 1 removals, ~28 transliterations, one source, one bounded content task — weeks not months, and it validates the naming system against real search behaviour before the 259-page Track B effort is committed.
**Corrections to v1.1 (§4).** **A9 #11 was wrong and so was the finding v1.1 accepted**: there are **12 full duplicates and 1 near-duplicate, zero partial overlaps**. 27:76 / 25:70 are both the Three Quls in full — 25:70 is longer only because an editorial recitation schedule is prefixed into its translation field; 9:15 / 85:196 are the same Kaffaratul Majlis text differing in punctuation. The **never-auto-merge-on-similarity** principle survives and is better evidenced than before: pairs match for varying reasons (deliberate cross-listing, separation by a repetition count stated in the Arabic, incidental collision on a short text), so each cluster still needs individual adjudication. **New convention: cite duplicate clusters by member id, never by DUP number** — cluster IDs proved unstable across runs. A7 ch45/ch128 collision dissolves (Hisn 45 is a list of remedies with no text to recite → A8 route-out; Hisn 128 is a genuine dua → `Dua for Protection from All Evil`); the waswasa reading belongs to ch40. A9 #8 ch40 remains **open** — the intended label is almost certainly *"Invocations for if you are stricken by [doubt/whisperings] in your faith"*, but **must not be repaired from inference**; verify against a print copy. The ch40 corruption scan is **closed**: ch40 is the only genuine hit across all 132 chapters.
**Consequences.** Phase 3 remains blocked, and Phase 1.5's critical path moves again — from transliteration sourcing to integrity verification. Five decisions are pending the owner (§5): approve the Gate 1 route-out of the 26 unambiguous entries; identify a qualified reviewer for the 19; approve Track A as a separate release; decide the future home of the 45 or approve parking them `noindex` indefinitely; approve the §4 corrections. All 506 pages remain `noindex,follow` and absent from `sitemap.xml`; batches 1–2 remain `approved: false`; `page-copy.json` and `slugs.lock.json` are untouched except for the Ibn Majah 3590 route-out. Housekeeping mandated by §5: this file's pointer in `.claude/CLAUDE.md` was `docs/DECISIONS.md` (nonexistent) — a broken pointer to the ADR log means governance references silently fail; the five Phase 1 artifacts move from repo root into `doc/`; and the build's 533-page report against a 506-page corpus is confirmed rather than assumed.
**References.** `doc/DUA-CONTENT-INTEGRITY-v1_0.md` (wins on conflict); ADR-053 (`DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md` §A1 superseded); `doc/DUA-KEYWORD-NAMING-v1_0.md`; Phase 1 artifacts `CHAPTER-LABELS-AUDIT.md`, `DUPLICATE-CLUSTERS.md`, `COMMON-NAME-CANDIDATES.md`, `TRACK-B-TOPICS.md`; ADR-051 (Hisn al-Muslim corpus); [[content-review-gate-owner]] (ADR-044).

## ADR-055 · Gate 1 is 44 pages, not 45: Ibn Majah 3590 is counted inside the 25 NOT-A-DUA, and the condemned-speech set is 24 · Accepted · 2026-07-31 · Dua detail pages (content integrity)
**Context.** `doc/DUA-CONTENT-INTEGRITY-v1_0.md` §1 tallies Gate 1 as **45** pages: 25 condemned speech + 1 inverted narration (Ibn Majah 3590) + 19 narrative statements. ADR-054 adopted that document and records those figures as written. Executing §7 item 4 required resolving each flagged entry to a real corpus id, which surfaced an arithmetic error in the tally. This ADR corrects the arithmetic only; it does not reopen any ruling.
**Evidence.** `doc/TRACK-B-TOPICS.md` is the Phase 1 artifact from which the Gate 1 classes derive, and it is internally consistent. Its summary table reports **50 flagged** = 25 `NOT-A-DUA` + 19 `NARRATIVE` + 6 `UNCLEAR`. Counting the flagged table rows themselves returns the same 25 / 19 / 6, and **`Sunan Ibn Majah 3590` is one of the 25 `NOT-A-DUA` rows** — it is a member of that class, not an addition to it. The integrity document treats it as a 26th entry, double-counting it once.
**Decision.** The corrected figures, which govern from here:
- **Gate 1 total = 44**, not 45. Arithmetic: 24 condemned speech + 1 inverted narration + 19 narrative = 44.
- **The condemned-speech set is 24 Qur'anic entries**, not 25. Enumerated: 2:200, 6:128, 7:38, 14:44, 15:36, 15:39, 16:86, 20:125, 20:134, 23:106, 23:107, 28:47, 28:63, 32:12, 33:67, 33:68, 34:19, 35:37, 38:16, 38:61, 40:11, 41:29, 50:27, 63:10.
- **§1.1's prose enumeration carries the same off-by-one.** It names eight refs (15:36, 15:39, 23:107, 32:12, 40:11, 33:68, 63:10, 50:27) "and 17 others", totalling 25. Against 24 actual, **"17 others" should read "16 others"**.
- **The set the owner approved for route-out on 2026-07-31 as "all 26" is 25 records**: the 24 condemned-speech entries plus `ibnmajah:3590`. That is exactly what `src/data/dua/gate1-route-out.json` contains and what was acted on — 1 `removed`, 24 `noindex-hold`. No page was wrongly removed or wrongly held by the miscount.
- **§7 item 6 second-signal confirmation covers 24 pages**, not 25. `ibnmajah:3590` is excluded because its defect was confirmed at source: the Arabic reads لاَ يَقُولَنَّ أَحَدُكُمُ اللَّهُمَّ اغْفِرْ لِي إِنْ شِئْتَ ("None of you should say 'O Allah, forgive me if You will'"), and the corpus `translation` field opens mid-sentence with the prohibition clause absent — a data defect in the record, not only a titling one.
- **§7 item 7 carries 44 into the Track A subtraction and shows it**, rather than absorbing the difference silently.
**Non-decisions, recorded so they are not re-litigated.** `doc/DUA-CONTENT-INTEGRITY-v1_0.md` is **not** edited — the owner ruled the specification stands as authored and the correction lives here. **ADR-054 is not edited**; this log is append-only, so its 45/25 figures remain on the record as adopted, superseded on the arithmetic by this entry. The 6 `UNCLEAR` entries remain unrouted, unheld and unscheduled — they are reported for review under §7 item 8 alongside the 19, and are classified by no one in this session.
**Consequences.** Where the two conflict on a count, ADR-055 wins over ADR-054 and over `DUA-CONTENT-INTEGRITY-v1_0.md` §1. No ruling, route-out status, page or record changes as a result of this correction. Track A's shippable-page arithmetic shifts by one page and is re-derived from the corpus in `TRACK-A-SCOPE.md` rather than from the document's provisional §6 figures.
**References.** ADR-054 (superseded on arithmetic only); `doc/DUA-CONTENT-INTEGRITY-v1_0.md` §1, §1.1, §6; `doc/TRACK-B-TOPICS.md` (evidence — summary table and flagged rows); `src/data/dua/gate1-route-out.json`.

## ADR-056 · Repository governance pointers repaired: the ADR log is doc/DECISIONS.md, and the Phase 1 artifacts move to doc/ · Accepted · 2026-07-31 · Repo hygiene (governance references)
**Context.** `doc/DUA-CONTENT-INTEGRITY-v1_0.md` §5 flagged that `.claude/CLAUDE.md` pointed at `docs/DECISIONS.md`, a path that does not exist, while the real ADR log is `doc/DECISIONS.md`. A broken pointer to the ADR log means governance references silently fail — worse than a missing one, because it reads as satisfied. The audit also found the Phase 1 artifacts sitting at the repo root rather than beside the specs they support.
**Investigation.** `doc/DECISIONS.md` is confirmed as the only ADR log on disk and the only one tracked by git; the sole other `DECISIONS`-shaped path is a vendored third-party skill's directory, unrelated to this project. The bad `docs/DECISIONS.md` pointer was **not** confined to `.claude/CLAUDE.md` — it appeared in **15 files**, including three shipped source files. Auditing the rest of `.claude/CLAUDE.md` found the same `docs/` vs `doc/` bug across **nine further governance pointers**.
**Decision.** All `docs/DECISIONS.md` references are repointed to `doc/DECISIONS.md`, and every other resolvable `docs/` pointer in `.claude/CLAUDE.md` is corrected to `doc/`. Two references in `doc/DECISIONS.md` and `doc/DUA-CONTENT-INTEGRITY-v1_0.md` are deliberately **left unchanged**: they describe the bug rather than point at the log, and the ADR log is append-only. The five Phase 1-era dua documents move from the repo root into `doc/`, and every inbound reference is updated in the same commit. The root copy of `DUA-KEYWORD-NAMING-v1_0.md`, verified byte-identical to `doc/DUA-KEYWORD-NAMING-v1_0.md`, is removed as a stray duplicate. `.claude/CLAUDE.md` also gains a pointer to `doc/DUA-CONTENT-INTEGRITY-v1_0.md`, since ADR-054 placed it above both naming specs and the entry point named neither its authority nor the pause it imposes.
**Two dangling references are reported, not repaired.** `.claude/CLAUDE.md` names a root `CLAUDE.md` project charter — "Root CLAUDE.md (charter) wins on any conflict with this file" — which **does not exist and has never existed in git history**; and `Islamic-Prompt-Template/PAGE-BUILD-TEMPLATE.md`, whose directory exists nowhere in the repo. No target was invented for either. The charter gap is the more serious: the entry point defers final authority to a document that is not there, so the "full list in root CLAUDE.md §3" of non-negotiable invariants is unreachable and only the six-line summary survives.
**Consequences.** Governance references resolve. `doc/` now holds the specs and their Phase 1 artifacts together. Historical superpowers plan and spec files were rewritten in place: they are records of completed work, but they contain executable instructions ("open `docs/DECISIONS.md` … append") that would send a future session to a nonexistent path, so correctness outranks preserving them verbatim. The two dangling references remain open items for the owner.
**References.** `doc/DUA-CONTENT-INTEGRITY-v1_0.md` §5 (housekeeping); ADR-054; `.claude/CLAUDE.md`.

## ADR-057 · Dua search + browse taken dark; dua result attribution reads the record's own sourceLabel, never a constant · Accepted · 2026-07-31 · Search (dua) + content attribution
**Context.** Gate 1 (ADR-054) routed 25 not-a-dua records out of `/duas/` at **build time**: one page deleted, 24 forced `noindex`. Verifying the boundary of that fix showed it does not reach the search layer at all. `GET /api/dua/search` fetches `src/data/dua/search-corpus.json` at runtime and `searchDuas()` scans **every record in it — 556 — with no exclusion of any kind**. `noindex` governs crawlers; it does not govern on-site search.
**Measured exposure (real `searchDuas` against the real corpus, 2026-07-31).** All 25 Gate 1 records were reachable by a query drawn from their own text — **25 of 25**. The query `definite in his asking` returned `ibnmajah:3590` as the **sole result on the site**: a card showing the full Arabic and the English that opens on "O Allah, forgive me if You will" — the exact wording its own narration prohibits, and the defect the page was deleted for. `forgive` (72 results) also returned it. `reprieve me until the Day` returned the speech of Iblis (`quran:15:36`) as its only result. The card carries no `<a href>`, so this is a **snippet exposure, not a dead link** — which is worse: there is no page left to correct, only a card asserting the text is a dua. A second surface has the same hole: `/dua.html` hydrates from `library.json` (536 records) and filters `guidance` but not Gate 1.
**Decision — the surface is closed before the fix is built.** Three independent gates, all default-off, owner-reversible:
- `DUA_SEARCH_PUBLIC = false` in `src/js/search-results-core.js` — the Dua pill returns to "coming soon" and Dua leaves the `scope=all` federation. Reverses the ADR-051 UPDATE that made it public on 2026-07-25.
- **New Worker env flag `DUA_SEARCH_ENABLED`, default `"false"`** (`worker/wrangler.toml`), checked as the first statement of `handleDuaSearch` — ahead of the KV read, so no cached result can be served either. The frontend flag only darkens the UI; the route stays directly callable, so both had to be closed.
- `LIBRARY_LIVE = false` in `src/js/dua-library.js` — `/dua.html` keeps its 12 build-time cards (verified to contain **no** Gate 1 record) and loses only live search/filter/load-more, taking the page's existing honest-degraded path.
**Decision — attribution is the record's, never a constant.** `buildDuaCardHTML` stamped the literal string `Hisn al-Muslim` onto **every** dua result while the corpus `meta` records four distinct translation sources (Saheeh International via quran.com, dua-dhikr, AhmedBaset hadith-json, and the Hisn compilation) and every record carries its own `sourceLabel`. A Qur'anic or Sunan Ibn Majah record was therefore shipped asserting a source its own data contradicts. **This is treated as severity-equal to Gate 1, not incidental** — it shipped on every result rather than on 25, and a card claiming a source the record does not support is the same failure class as a hadith shown without its grade. The card now reads `sourceLabel` from the record; **a record with no `sourceLabel` renders no attribution element at all rather than a guessed one**, and joins the corpus exclusion set until sourced.
**Measured: 20 of 556 records lack a `sourceLabel`, and they are exactly the 20 already excluded** — the 18 `guidance` narrations plus the 2 records with no translation (`40:133`, `74:185`). The attribution rule therefore adds **zero** new records to the exclusion set; the two sets coincide exactly.
**Consequences.** Dua search and the dua library are dark until the corpus-level exclusion ships **and the owner re-approves** — re-enabling is explicitly not a build step. ADR-051's "Gate CLOSED / pill PUBLIC" update is superseded on this point. `meta.entryTypes.contextual` corrected 1 → 2 (the corpus is minified and was rewritten minified). Test suite: 576 pass, 0 fail; the two tests that asserted the old behaviour (`DUA_SEARCH_PUBLIC=true`, hardcoded Hisn attribution) were rewritten to lock the new contract, including that a missing `sourceLabel` emits no `sr-attrib` element.
**Deployment is a separate, un-taken step, and production remains exposed until it happens.** The Worker must be redeployed and Pages must publish; until then the live site still serves the pre-fix behaviour. Two caches sit in front of the Worker: `caches.default` is consulted in `index.js` **before route dispatch**, so previously-cached 200s bypass the new gate entirely for up to `s-maxage=3600`; the KV keys `dsearch:*` (1h TTL) are already unreachable because the gate precedes the KV read. **The edge cache must be purged on deploy**; the KV purge is belt-and-braces.
**Open, reported and not acted on.** 15 records carry `sourceLabel: "Other source"` with `sourceKey: "other"` — a label that names no source, presented in the attribution slot as though it did. Not "missing", so the new rule renders it faithfully; whether a vacuous attribution is better or worse than none is an owner call. `meta.entryTypes.supplications: 346` is also wrong (actual non-guidance, non-contextual = 536) and was left alone — only the `contextual` correction was authorised.
**References.** ADR-054 (Gate 1, build-time only); ADR-055 (Gate 1 arithmetic); ADR-051 (Hisn corpus + the licence gate this reverses); ADR-052 (`DUA_SEARCH_PUBLIC` flag); `doc/DUA-CONTENT-INTEGRITY-v1_0.md` §1.4; `worker/src/dua-search.js`; `worker/src/lib/dua-search-core.js`; `src/js/search-results-core.js`; `src/js/dua-library.js`.

## ADR-058 · The dua corpus of record has no working generator; the documented ingest script is disarmed rather than modernised · Accepted · 2026-07-31 · Dua corpus (provenance + build integrity)
**Context.** `worker/scripts/ingest-dua-corpus.mjs` is named in ADR-051 as the generator of `src/data/dua/search-corpus.json`, and its own header instructed the reader to run it. Investigating where a Gate 1 exclusion should be produced established that the script no longer produces the file it claims to.
**Finding.** The script emits **267 records, `schema: 1`, 5 fields per record, 5 `meta` keys**. The corpus that exists is **556 records, `schema: 2`, ~12 fields, 14 `meta` keys**. The additional ~289 records and every enrichment — `entryType`, `variantRole`/`variantGroup`, the occasion facets, `sourceLabel`, `reviewNote`, the four-way `meta.translationSources` split — were produced by later passes that exist nowhere in the script and cannot be derived from it. The script **overwrites rather than merges**, and it re-writes the upstream English that `meta.arabicSourceDataset` records as "unlicensed and has been fully replaced or nulled". Running the documented command would therefore have silently destroyed two thirds of the corpus and reintroduced a licensing defect, with no error and no recovery path except git.
**Decision.** The script is **disarmed, not modernised**. A `guard()` refuses to run whenever `search-corpus.json` exists and prints why: that it is stale, that it emits 5 fields against the corpus's current shape, and that it overwrites rather than merges. The file header is changed to `STALE — DO NOT RUN`. No attempt is made to teach it the current schema: reconstructing a real generator is a substantial task that must be scoped on its own, and a half-modernised ingest is more dangerous than an honestly dead one.
**Consequence recorded plainly: the corpus of record is now effectively hand-maintained.** It is a tracked file mutated in place by successive passes (`scripts/build-dua-occasions.mjs` writes it back), with no reproducible path from upstream. Corrections must be made in place. This also decided where the exclusion set lives (ADR-059): stamping a file that cannot be regenerated is a corpus write, so the mechanism was placed in the script that already writes the corpus rather than in a new generator.
**References.** ADR-051 (names this script as the generator); `worker/scripts/ingest-dua-corpus.mjs`; `scripts/build-dua-occasions.mjs`; ADR-059.

## ADR-059 · Dua exclusion set is produced once and stamped into the corpus as `meta.excluded`; consumers read it and never re-derive it · Accepted · 2026-07-31 · Dua corpus (content integrity)
**Context.** Gate 1 (ADR-054/055) routed 25 not-a-dua records out of `/duas/` **at build time**. The search and browse layers never saw that decision: `/api/dua/search` fetches `search-corpus.json` at runtime and scanned all 556 records with no exclusion, and `/dua.html` hydrates from `library.json`, which filtered guidance but not Gate 1. All 25 records were reachable — verified 25/25 — and the query `definite in his asking` returned `ibnmajah:3590` as the sole result on the site, showing the exact wording its own narration prohibits. `noindex` governs crawlers, not on-site search. The page-layer route-out was correct and insufficient.
**Decision.** One exclusion set, produced **once**, in `scripts/build-dua-occasions.mjs` — the script that actually writes the corpus, not the one the docs said produces it (ADR-058) — and stamped into `meta.excluded` as `{ note, generator, reasons, count, ids }`. Consumers read `meta.excluded.ids` and decide nothing: `worker/src/lib/dua-search-core.js` (`excludedIdSet` + `searchDuas({exclude})`) and `scripts/build-dua-library.mjs`, which **aborts** if the stamp is absent rather than shipping an unfiltered library. A future gate adds one entry to `REASONS`; the union recomputes and every consumer inherits it. **Filter-per-consumer is prohibited** — it is the exact defect this ADR closes.
**The set is 45:** 25 Gate 1 (24 condemned speech + `ibnmajah:3590`) + 18 `entryType: "guidance"` + 2 records with no translation (`40:133`, `74:185`). Library output falls 556 → 511 with zero excluded records leaking; search leaks fall from 25/25 reachable to 0.
**Variants are deliberately NOT excluded.** All 30 `variantRole: "variant"` records surface on a query without their primary's context, and all 30 have a null `variantLead`. The owner ruled that a variant carries its own citation and its own `sourceLabel`, so what it loses is **framing, not provenance**, and suppressing 30 authentic narrations to fix a presentation gap is the wrong trade. Follow-up, unscheduled: a "further narration of …" line on the card.
**Attribution rules settled alongside.** The dua result card and the library payload both used to assert a source the record contradicted — the card hardcoded `Hisn al-Muslim` on every result, and `sourceLine()` fell back to the same string for anything without a verse ref or hadith citation, stamping one compilation onto records drawn from four sources. Both now read the record. **A record that cannot name its source shows no attribution element** rather than a guessed one. `sourceKey: "other"` (label "Other source", 15 records) takes that same path: it fills the slot while naming nothing, which is the failure, not an exception to it. Those 15 are **not excluded** — an unnamed source is a transparency gap, not a defective record — and are logged in `doc/DUA-SOURCING-BACKLOG.md` with ids and text. `meta.entryTypes` corrected: `supplications` 346 → 536, `contextual` 1 → 2, both now recomputed from the records on every build rather than hand-set.
**References.** ADR-054/055 (Gate 1); ADR-058 (no working generator); `doc/DUA-CONTENT-INTEGRITY-v1_0.md` §1.4; `doc/DUA-SOURCING-BACKLOG.md`.

## ADR-060 · The `Hisn al-Muslim` source label is a class-level default, not a per-record assertion; and the corpus still carries the upstream English it states was replaced · Accepted · 2026-07-31 · Dua corpus (attribution + licensing)
**Context.** Before the attribution fix in ADR-059 was allowed to stand, the owner required verification that the 187 records labelled `sourceLabel: "Hisn al-Muslim"` assert that source **per record**, rather than having received it from an enrichment pass writing a constant. The concern was precise: the result card defaulted to that exact string for months, and if a build pass did the same thing to the data, then "the card now reads the record" makes a defaulted attribution look verified.
**Finding 1 — the label is class-level, and the concern was justified in substance.** All 187 carry `sourceKey: "hisn"` and **one identical `translationSource` string**, ending `— see site-wide attribution`. It is a blanket attribution by its own wording. Of the 187, **81 carry a `hadithCitation` naming a different collection** (Sunan Abi Dawud 5083, Jami at-Tirmidhi 3485, Sahih al-Bukhari 6076, …) — for these the label is compilation-level and correct, because *Hisn al-Muslim* is a compilation that quotes those collections, and the render path already prefers the citation. **106 carry no citation of any kind**, so for them "Hisn al-Muslim" is the entire provenance and identifies the compilation, never the underlying hadith or ayah. The label is therefore not fabricated, but it is not a per-record source assertion either, and it must not be read as one.
**Finding 2 — a stated licensing mitigation is contradicted by the data.** `meta.arabicSourceDataset` states that the upstream dataset's "bundled English translation is unlicensed and **has been fully replaced or nulled**". Tested directly against the pinned upstream (`wafaaelmaandy/Hisn-Muslim-Json`, `husn_en.json`, 267 records): of the **205** corpus records attributed to "Hisn al-Muslim compilation English", **179 are byte-identical** to the upstream English and **4 more match after stripping wrapping parentheses — 183 of 205, 89%**. Only 22 genuinely differ. Corpus-wide, 186 of 556 records carry upstream text. **The replacement did not happen.** No record names a translator or an edition (`translator` field: 0 records), so the provenance of that English resolves to `see site-wide attribution` → `meta.attribution` → the compilation itself, which is circular and names no licensed edition.
**Decision.** Both findings are recorded, and **neither is repaired in this ADR.** Finding 1 does not invalidate ADR-059: reading the record is still strictly better than a hardcoded constant, and the 81 citation-bearing records already render their real collection. Finding 2 is a licensing and provenance question that sits above naming, attribution display and the exclusion set, and is the owner's to decide — the honest options (source a licensed English edition, obtain permission, or null the affected translations) all have consequences well beyond this corpus. No text was altered, no record was excluded, and the inaccurate `meta` statement is left in place rather than quietly corrected, because silently amending a claim is how it stopped being checked.
**Consequences.** The `hisn` label is not added to the vacuous-label suppression list (ADR-061): it names a real compilation and, for the 81, is corroborated by a citation. But it cannot be cited as evidence that a record's source is known. Any future claim that the corpus is free of unlicensed text must be checked against this ADR first.
**References.** ADR-051 (the ingest + owner licence gate); ADR-058 (no working generator — corrections are in-place); ADR-059 (attribution reads the record); `doc/DUA-SOURCING-BACKLOG.md` §C.

## ADR-061 · Variants excluded from search as a reversible hold; one rule for labels that name no source; vacuous attribution never causes exclusion · Accepted · 2026-07-31 · Dua corpus (content integrity)
**Context.** ADR-059 kept the 30 `variantRole: "variant"` records in search on the grounds that a variant carries its own citation, so what it loses on a query is framing rather than provenance. Re-examination of the data reversed that.
**Decision — variants are excluded, as a HOLD, not a ruling.** `variantLead` is **null on all 30**. The corpus policy states variants are "surfaced under the group's lead card and by search", but the lead-card relationship that policy depends on **does not exist in the data**, so "findable by search" currently means "renders as a standalone dua it is not". Their authenticity is not in question and no text is touched. **Reversal condition, recorded so the hold cannot silently become permanent:** populate `variantLead` and render a "one of N narrations" line on the card, then drop `variant-no-lead` from `REASONS` and all 30 return. The exclusion set becomes **75**: 25 Gate 1 + 18 guidance + 2 no-translation + 30 variants. Library output 556 → **481**, zero leaks.
**Decision — one rule for vacuous labels.** `sourceKey: "other"` (15 records, label "Other source") and `sourceKey: "dua-dhikr"` (45 records) are handled identically: **a label that names no source renders as no attribution.** "Other source" fills the slot while identifying nothing; `dua-dhikr` names the *dataset the English came from*, not the collection the supplication is from — it answers "where did this translation come from", not "which collection is this dua from". Both take the same path as a missing label in `duaSourceLabel` (`src/js/search-results-core.js`) and `sourceLine` (`scripts/build-dua-library.mjs`). 60 records now render with no attribution element, up from 15.
**Decision — the principle, stated so the set does not look inconsistent.** **Missing or vacuous attribution NEVER causes exclusion on its own.** An unnamed source is a transparency gap; a record that is not a supplication, or has no text, is a defective one. Only the latter is excluded. The 20 records with no `sourceLabel` at all *are* excluded, but every one of them is excluded as a guidance narration or an untranslated record — **not** for lacking a label. All 60 vacuous-label records and all 20 label-less records are enumerated with ids, current label, what the record does carry (`hadithCitation`/`verseRef`/`sourceKey`) and text in `doc/DUA-SOURCING-BACKLOG.md`.
**Naming note.** The stamp is `meta.excluded`, not `meta.gate1Excluded` as originally specified. It now carries four reason classes of which Gate 1 is one; a Gate-1-specific name would misdescribe the field, and the Gate 1 membership is preserved exactly in `reasons['gate1-not-a-dua']`. Flagged for reversal if the owner prefers the original name.
**References.** ADR-059 (superseded on variants only); ADR-060 (the attribution verification that ran alongside); `doc/DUA-SOURCING-BACKLOG.md`.

## ADR-062 · ADR identity should not be a contended global counter — date-slug or file-per-ADR, with a CI uniqueness backstop · Proposed (UNBUILT) · 2026-07-31 · Repo governance (ADR log)
**Context.** Two sessions independently appended an `ADR-057` to this log without seeing each other. Both read the log, saw `056` as the highest, and claimed the next number. Git did not catch it: the appends landed on different branches, and a textual append at the end of a file is not a semantic conflict. The collision was found by hand and resolved by renumbering the later pair to 058/059.
**Diagnosis.** The ADR identifier is a **globally shared, monotonically allocated counter read at write time**, with no coordination between writers. Any two concurrent authors will collide, and the failure is silent — the log stays syntactically valid while two entries claim one identity, so every cross-reference to that number becomes ambiguous.
**Proposal (NOT BUILT — recorded only).** Remove the contended resource rather than guard it: derive the identifier from something the writer already owns uniquely — a date-plus-slug key (`ADR-2026-07-31-dua-exclusion-set`), or one file per ADR under `adr/` where the filename *is* the identity and git reports a real add/add conflict. Add a CI uniqueness check as a backstop so any residual collision fails the build instead of duplicating a number silently.
**Status.** Proposed and deliberately unbuilt, at the owner's instruction. Existing numeric ADRs are not renumbered; this would apply to new entries only, and migrating the back catalogue is explicitly out of scope.
**References.** ADR-057 (the collision); ADR-058/059 (the renumbered pair).

## ADR-063 · ADR-051's licence clearance is WITHDRAWN; no upstream source has an established permission, and quran.com's terms are restrictive on their face · Accepted · 2026-07-31 · Dua corpus (licensing)
**Supersedes** the `UPDATE 2026-07-25` clearance in ADR-051. ADR-051's analysis is otherwise unchanged and was accurate when written.
**What was verified.** Full evidence, with endpoints and exact quotations, is preserved read-only at `doc/evidence/2026-07-31-upstream-source-licence-evidence.md`.
- **Hisn al-Muslim (`wafaaelmaandy/Hisn-Muslim-Json`, 188 records).** The repository carries **no licence**: 14 candidate paths (`LICENSE`, `LICENCE`, `COPYING`, `COPYRIGHT`, `NOTICE`, `README*`, `USAGE.md`, `TERMS.md`, and variants) all return **HTTP 404**; GitHub's licence endpoint returns `Not Found` and the repo object reports `license: null`; the **complete recursive tree is one file**, `husn_en.json`. The dataset contains no licence text. No commit SHA is pinned — the ingest fetches a moving `master` reference.
- **The corpus `meta` claim is false.** `meta.arabicSourceDataset` states the bundled English "is unlicensed and **has been fully replaced or nulled**". It was not. **179 records are byte-identical** to that dataset and 4 more match after stripping wrapping parentheses — 183 of 205. **Nothing was nulled**, and the 22 that differ are edits of the same upstream text, 19 of them explicitly noted as "supplication extracted from the narration in the source compilation". No record names a translator or edition.
- **quran.com API v4 / Saheeh International, edition 20 (106 records).** The API's edition record carries **no licence, copyright, permission or usage field**. quran.com's published Terms and Conditions state that Content is made available **"FOR YOUR PERSONAL, NON-COMMERCIAL USE ONLY"**, that use is permitted **"for individual, noncommercial, informational purposes only"**, and that a user **"will not copy, reproduce, alter, modify, create derivative works from, … distribute or publicly display any of the Content (except for your own personal, non commercial use) … without the prior written consent of Quran.com."** **ADR-049 records no licence review of this source at all** — only that text must be sourced and attributed rather than model-generated.
- **`AhmedBaset/hadith-json` (198 records).** `license: null`, licence endpoint `Not Found`, no `LICENSE`/`COPYING`/`NOTICE`. A README exists and contains **no licence, permission or usage-terms statement**. It states the data is **"scraped from Sunnah.com"**, which places a further upstream party's terms above this dataset. **No ADR records any licence review of this source.**
**Decision.**
1. **The clearance is withdrawn**, pending an owner decision. `DUA_SEARCH_PUBLIC`, `DUA_SEARCH_ENABLED` and `LIBRARY_LIVE` remain false and are not to be flipped as part of this entry.
2. **The gate ADR-051 closed was misnamed.** It is titled "license/attribution" and what was actually reviewed and approved was **source + attribution**. Attribution identifies a source; it does not establish permission from it. The two were treated as one decision, and only one of them was made.
3. **The scope is all three sources, not Hisn.** Hisn was found first, but it is 188 of 556 records. **No upstream source has an established, recorded permission.** For quran.com there are published terms and they are restrictive on their face; for the other two there are no terms at all.
4. **`/dua.html` publishes zero dua text while the hold is open** — not a filtered subset. 5 of its 12 build-time cards were upstream-verbatim, and the other 7 carry `sourceKey` `other` or `dua-dhikr`, labels that name no source, so their provenance is unknown too. Unknown provenance is not published while this is open. The page and its chrome remain, with an honest note.
5. **`meta.arabicSourceDataset` is NOT edited.** The inaccurate claim stays on the record. Quietly correcting it is how it stopped being checked the first time.
**Deliberately not decided here.** This entry records observations and quotations only. **No characterisation of the legal position is offered**, no view is taken on whether any use is or is not permitted, and no remedy is chosen. Sourcing a licensed English edition, seeking written permission, nulling affected translations, or continuing on a different basis are all owner decisions requiring input this project does not have.
**Consequences.** Track A shipping (ADR-053 A11, DUA-CONTENT-INTEGRITY §6) is blocked on this, not merely on transliteration: 188 of the ~215 shippable Track A pages draw on the Hisn dataset. The Gate 1, exclusion-set, attribution and integrity work all stand and are unaffected — they concern what is true about the records, not who may publish them.
**References.** `doc/evidence/2026-07-31-upstream-source-licence-evidence.md`; ADR-051 (clearance superseded); ADR-049 (quran.com, no licence review recorded); ADR-060 (the verification that surfaced this); ADR-058 (no working generator); [[content-review-gate-owner]] (ADR-044).

## ADR-064 · Owner determination: the upstream licence hold is LIFTED for all three sources; hubs return as link layers, not text dumps · Accepted · 2026-07-31 · Dua corpus (licensing + hub architecture)
**Supersedes** the hold in ADR-063. ADR-063's *observations* stand unchanged and are not withdrawn — only the hold it imposed is lifted.
**This is an owner determination, not a legal finding.** No legal advice was sought, given, or relied upon, and nothing in this entry characterises the legal position of any party.
- **Who decided.** Morshed Milon, project owner and the CONTENT-POLICY §5 approver per ADR-044.
- **On what grounds.** That IslamicInfo.org is a **free, non-commercial, informational site**, and that use of all three upstream sources is within scope on that basis.
- **Against which evidence.** `doc/evidence/2026-07-31-upstream-source-licence-evidence.md`, reviewed by the owner before deciding. It records, with endpoints and exact quotations: that `wafaaelmaandy/Hisn-Muslim-Json` carries no licence (14 candidate paths HTTP 404, `license: null`, a one-file tree); that quran.com's published Terms permit use "for individual, noncommercial, informational purposes only" and restrict copying, distribution and public display "without the prior written consent of Quran.com"; and that `AhmedBaset/hadith-json` carries no licence and states its data is "scraped from Sunnah.com". **The evidence file is retained and must not be deleted** — it is the traceable basis for this determination and is written to be readable outside the project.
**What is corrected from ADR-051.** ADR-051 closed a gate named "license/attribution" having reviewed **source and attribution only**; ADR-049 recorded no licence review of quran.com, and no ADR had ever reviewed `AhmedBaset/hadith-json`. That gap is now closed explicitly rather than by implication: all three sources are determined together, on stated grounds, against evidence gathered first.
**Attribution — stands and strengthens (ADR-051, ADR-059, ADR-061).** Every record renders **its own `sourceLabel`**, never a hardcoded default and never a placeholder. `sourceKey` values that name no source (`other`, `dua-dhikr`) render **no attribution element at all** rather than a filler string, and all 60 such records are enumerated in `doc/DUA-SOURCING-BACKLOG.md` for resolution. The 187 `Hisn al-Muslim` labels remain class-level attributions, not per-record source assertions (ADR-060) — that finding is unaffected by this determination.
**The old hubs are NOT restored.** Their defect was architectural and independent of the licence question: `/duas/source/hisn.html` was 193 KB reproducing every child's full Arabic and translation while linking to **none** of them, 123 duas were reachable from no hub, and the `ItemList` carried no item URLs. The §17 rewrite ships instead — hubs are **link layers**: one descriptive link plus a short factual snippet per entry, `dua-source-core` grouping, `other`/`dua-dhikr` retired as source keys (30 hubs → 28). Measured after: hisn 193 KB → 115 KB with **247 detail links** (was 0) and **zero** full translations; **505 children linked, 0 orphans** (was 123).
**What is NOT lifted.** **The integrity gate stands.** `DUA-CONTENT-INTEGRITY-v1_0` Gates 1–3 are unaffected: the 75-record exclusion set, the Gate 1 route-out, the variant hold (ADR-061) and the `meta`-versus-data findings all remain in force. `dua.html` keeps `CARDS_HOLD = true` — the cards return when detail pages exist for them to link to, which is a navigation decision, not a licence one. `meta.arabicSourceDataset` is still **not edited**; its false "fully replaced or nulled" claim stays on the record.
**Consequences.** Track A is unblocked on licensing and remains blocked on integrity (the Gate 3 scan) and transliteration. The two corpus assets are re-tracked and publish again; the `.gitignore` hold block is cleared, since ignore patterns over tracked files would silently skip newly generated hubs.
**Deployment status (recorded so this entry is not read as describing production).** The determination is effective immediately and the hold is lifted. The **§17 hub rewrite, the corpus re-tracking and the cleared `.gitignore` block are NOT yet deployed** — they sit on `feat/dua-hubs-s17` and are held back deliberately, because the new hubs link to 505 detail pages that have never been committed and would ship as 404s. `main` carries the closures only: the old 193 KB text-dump hubs are un-published, both JSON assets are un-published, `dua.html` renders no cards, and `sitemap.xml` is 14 URLs. Hubs and detail pages ship together or not at all.
**References.** `doc/evidence/2026-07-31-upstream-source-licence-evidence.md` (retained); ADR-063 (hold superseded, observations stand); ADR-051 (clearance basis corrected); ADR-049; ADR-059/060/061 (attribution); [[content-review-gate-owner]] (ADR-044); `DUA-ENGINE-SEO-ADDENDUM-v1_0.md` §17.

## ADR-065 · Track A shipping scope corrected: 247 shippable, 65 transliteration gaps, 182 ready today — §6's estimate double-subtracted records that were never slugged · Accepted · 2026-07-31 · Dua detail pages (Track A scope)
**Context.** `DUA-CONTENT-INTEGRITY-v1_0` §6 projects "~215 shippable, 28 transliterations required" for Track A. Item 7 required that figure be re-derived from the corpus against the corrected Gate 1 of 44 (ADR-055) and the enlarged transliteration gap created by nulling the 39 contaminated transliteration fields.
**Corrected arithmetic.** Track A = the 247 slugged records whose `sourceKey` is not one of the seven collection keys.
```
  247   Track A pages (slugged)
 −  0   Gate 1 removals falling in Track A
 −  0   guidance entries
 −  0   no-translation records
 −  0   variants (held, ADR-061)
 ─────
  247   SHIPPABLE
```
**All 44 Gate 1 records fall in Track B; none in Track A.** The route-out does not reduce Track A at all. The remaining zeros are not an error: guidance entries, untranslated records and variants were never assigned slugs, so they cannot be subtracted from a slug-derived count.
**Cause of the discrepancy — §6 subtracts records that are not in the set it subtracts them from.** §6 begins at 247 and removes 20 English-prose entries, ~7 non-dua chapters, 3 Hisn-45 entries and `132:267`. **None of those appear in `slugs.lock.json`**, so they were already outside the 247. **Evidence:** §A1 states Track A has 48 records lacking a transliteration and that removing the 20 English-prose entries leaves "approximately 28". The measured pre-existing gap among the 247 slugged records is **exactly 28**. That equality holds only if the 20 are already outside the slug set — which is what makes the §6 subtraction a double-count.
**Transliteration gap, enlarged by the nulling.**
```
   28   pre-existing gap (matches the §A1 figure exactly)
 + 37   newly nulled falling in Track A shippable (of 39; 40:133 and 74:185 are not slugged)
 ─────
   65   total gap   →   182 pages ready to ship today
```
**Chapter coherence (asked before release shape was decided).** The 182 are **not** a scattered remainder. Of 124 Track A chapters, **79 are fully complete with zero gaps, covering 133 of the 182**. Only 6 chapters are partially ready, and the largest — *Words of remembrance for morning and evening* — is 23 ready against 1 gap. 36 chapters have zero ready pages (53 slugged), and those are what the gap work buys. 86 of the 124 chapters contain a single record, so "complete chapter" is frequently a one-page chapter.
**Consequences.** The §6 estimate is superseded for planning: Track A is larger (247 vs ~215) and its content debt is larger (65 vs 28) than projected. Neither figure is a reason to delay — 182 pages sit in 79 complete chapters and can ship as a coherent set. `DUA-CONTENT-INTEGRITY-v1_0` is **not edited**; the correction lives here, consistent with ADR-055.
**References.** ADR-055 (Gate 1 = 44); ADR-061 (variant hold); `DUA-CONTENT-INTEGRITY-v1_0.md` §6, §A1; `src/data/dua/slugs.lock.json` (membership evidence); `doc/DUA-INTEGRITY-SCAN.md`.

---

## ADR-066 · ADR-054's global hold becomes a per-page gate: a page may ship when it individually satisfies Gates 1–3, evidenced per record · SUPERSEDED by ADR-067 · 2026-08-02 · Dua detail pages (content integrity)
**Status: SUPERSEDED by ADR-067 (2026-08-03).** Its central proposal — that ADR-054's global hold becomes a **per-page gate** — was **accepted** and is now in force; ADR-067 is the record of what actually shipped under it. Its **scope limb is superseded**: this ADR authorised 10 named records, and 115 pages now index. Nothing here is deleted, because the reasoning that established per-page gating as safe (a per-page test only works if it discriminates — and it did, removing three of thirteen rows) is the reasoning ADR-067 rests on. Read this for the argument; read ADR-067 for the state.

**Original status, retained as written.** *Proposed — awaiting owner approval. This is an amendment with its evidence attached, not a clearance. Nothing has been built, indexed, approved or added to a sitemap on the strength of it. ADR-054 remains in force until this is accepted or rejected.*

**Context.** ADR-054 adopted `DUA-CONTENT-INTEGRITY-v1_0.md` and imposed a **global hold**: no page is named, indexed or shipped until Gates 1–3 clear across the corpus. That was the right instrument at the time — the gates had been measured in aggregate and no record had been individually verified, so there was no basis on which to distinguish a sound page from an unsound one. A global hold is the correct default when the unit of evidence is the corpus.

The unit of evidence has since changed. Gate 1 is resolved to a concrete route-out set of 44 records stamped into `meta.excluded` (ADR-055, ADR-059). Gate 3's deliberate scan has run over all records that existed on 2026-07-31 (`DUA-INTEGRITY-SCAN.md`), and the Arabic-field detector gap it left has been closed (`scan-arabic-narration.mjs`). Gate 2 is measured per record. **Every gate is now testable against a single record**, which is precisely the condition a global hold exists to compensate for the absence of.

**The precondition stated for this amendment was not met, and the amendment is narrowed rather than waived.** This ADR was requested conditional on all 13 rows of `DUA-WAVE-1-READINESS.md`'s `wave_assignment: 1a` set passing per-record verification. **They did not. Three failed and are dropped.** Full evidence, per record and per gate, is in `doc/DUA-WAVE-1A-GATE-EVIDENCE.md`:

- **`49:148`** — Gate 2 and Gate 3. Its translation carries the narration's reported *outcome* (`(he (the sick person) will be cured.)`) presented as part of the supplication, plus an unterminated quotation mark; its transliteration sits in the 7-record annotation class on which `DUA-INTEGRITY-SCAN.md` explicitly holds an **open owner ruling**.
- **`60:165`** — Gate 2 in substance. A bracketed clause of the Arabic is absent from both the transliteration and the translation, so a reader following the transliteration silently skips a line of the Arabic in front of them.
- **`85:196`** — passes all three gates. Dropped on a separate ground: it shares a **byte-identical** `hadithCitation` with `9:15` under a different occasion, so at most one is correct and the reference would publish inside its A2 block.

**That the verification removed three rows is the argument for this ADR, not against it.** A per-page gate is only safe if per-page testing actually discriminates. It did — including on two records (`1:1`, `3:6`) whose 1a assignment rested on a branch in `build-wave1-readiness.mjs` that returns "clean" without testing whenever the Arabic lacks a `((` delimiter. Both records are in fact clean; the evidence behind them was not. A global hold would have concealed that; a per-page gate is what surfaced it.

**Decision (proposed).** ADR-054's global hold is amended to a **per-page gate**. A dua detail page may be built, named and indexed when its source record individually satisfies all three gates, with the evidence recorded per record. The hold is **not lifted** — it is relocated from the corpus to the record. Every page that cannot show the evidence stays held, and the great majority of the corpus does stay held.

A record satisfies the gate when **all** of the following hold and are evidenced:
1. **Gate 1** — absent from `gate1-route-out.json`, from `meta.excluded.ids`, from the reviewer package's Part 1 (24) and Part 2 (10) candidate sets; and carrying no `entryType` other than the default supplication type.
2. **Gate 2** — a non-empty transliteration whose **provenance is named**, sourced or reviewer-supplied, never machine-generated, and **covering the whole Arabic the page renders**. The coverage limb is new here and is what `60:165` fails; presence alone was the old test and it is insufficient.
3. **Gate 3** — passing every detector in `DUA-INTEGRITY-SCAN.md` and every Arabic-field detector in `scan-arabic-narration.mjs`, with no narration prefix, no multi-span record and no isnad. Detector counts are **floors, not sets** — `49:148` carries a narration leakage that no detector's word list matches — so a per-record read stands behind the detectors and is not replaced by them.

**Scope of this amendment: 10 records.** `27:79`, `27:97`, `1:1`, `98:209`, `62:168`, `3:6`, `101:212`, `55:156`, `117:235`, `79:190`. It authorises no other page and creates no general clearance. `27:97` carries a build condition: its Arabic block must render the delimited span only, since a recitation count sits outside the `))` and appears in neither the transliteration nor the translation.

**Two conditions that should attach before any of the 10 is built.**
- **`transliterationSource` must exist on the record.** No such field exists on any of the 566 records, and `meta` makes no claim about transliteration at all. The provenance in the evidence document is reconstructed from commit history and romanisation style. It is sound, and it is not evidence the data carries — which makes Gate 2's "sourced, never machine-generated" unverifiable by anyone who does not repeat the `git show`.
- **`DUA-PAGE-CONTENT-SPEC.md` §5 check 6 must be amended.** It asserts "collection ref and grading non-null", which **no record in this corpus can satisfy** — there is no grading field anywhere in the data, and 10 of these 10 carry no `hadithCitation`. §2 A2's honest-null path ("the note says the grading is not recorded in our source") is the correct and charter-compliant behaviour; check 6 contradicts it and would fail the build on the first page attempted.

**Consequences.** The wave shrinks from 13 to 10 and, on the two conditions above being met, becomes buildable without a corpus-wide clearance. `DUA-WAVE-1-READINESS.md` justifies retiring rank order on a **12-row threshold that 10 does not clear**; retiring rank order remains right — rank was assigned before any record was inspected, and this verification is that inspection — but it now rests on that reasoning rather than on the threshold, and the owner should be the one to say so. Two of the three drops are recoverable inside the reviewer package already going out: confirming which occasion Riyad as-Salihin 152 attests restores `85:196` (→ 11), and confirming `60:165`'s bracketed clause as a Part 3 item restores it (→ 12). `49:148` needs an owner ruling and then a corpus edit. `DUA-CONTENT-INTEGRITY-v1_0.md` is **not edited**, consistent with ADR-055 and ADR-065; the amendment lives here.

**Non-decisions, recorded so they are not re-litigated.** This does **not** lift Gate 1, Gate 2 or Gate 3 for any record it does not name. It does **not** reopen the route-out of the 44, the variant hold (ADR-061), or R3's block on Class B and `quran:` records. It does **not** adjudicate the `27:97` naming mismatch — the CSV names it "Ruqyah dua" while the record attests only the evening adhkar — which is a naming-spec question logged in the evidence document, not settled here. It authorises **no page building in the session that produced it.**

**References.** ADR-054 (amended, not superseded); ADR-055 (Gate 1 = 44); ADR-059 (`meta.excluded`); ADR-061 (variant hold); ADR-065 (Track A scope); `doc/DUA-WAVE-1A-GATE-EVIDENCE.md` (the per-record evidence this ADR rests on); `doc/DUA-WAVE-1-READINESS.md`; `doc/DUA-INTEGRITY-SCAN.md`; `docs/seo/VALIDATOR-RULES-SESSION-1.md` R3, R6; `docs/seo/DUA-PAGE-CONTENT-SPEC.md` §2 A2, §5 check 6.

---

## ADR-067 · Per-page gating is in force: 115 dua pages index under owner batch sign-off, R6 clusters adjudicated, FAQ overlap window carved out · Accepted · 2026-08-03 · Dua detail pages (indexing + validator scope)
**Status.** **Accepted on direct owner instruction, and applied** — `page-copy.json`, `duas/*.html`, `sitemap.xml` and `duplicate-scripture-allowlist.json` are built to match. **This ADR supersedes ADR-066 and is the record of what shipped.**

**It resolves the conflict ADR-066 left open.** ADR-066 proposed per-page gating but held its own scope to 10 named records while ADR-054's global hold stayed nominally in force. That gap is now closed by decision rather than left to drift: **per-page gating is in force, and the gate is the owner's batch sign-off under ADR-044 plus the per-record evidence built across Sessions 0.6–1.0.** ADR-054's global hold is **discharged**, not waived — it is replaced by a per-page test that runs on every record and that demonstrably fails records that deserve to fail (ADR-066 removed 3 of 13 rows on exactly this test; R6 held 10 pages here before 8 were adjudicated and 2 remain held).

**Evidence the gate stands on, by session.** Gate 1 resolved to a concrete route-out set of 44 records stamped into `meta.excluded` (ADR-055, ADR-059, Session 0.6). Gate 2 measured per record, with the transliteration-coverage limb added by ADR-066. Gate 3 scanned across all 556 records with the Arabic-field detector gap closed by `scan-arabic-narration.mjs` (`DUA-INTEGRITY-SCAN.md`, Session 0.7), detector counts recorded as **floors, not sets**. Session 1.0 added the duplicate-scripture rule (R6) and its normalisation, and Sessions 1.0–1.1 added R7 (FAQ carve-out) and R8 (link integrity, the first of these rules actually enforced in a script).

**Decision 1 — the B4 FAQ overlap window excludes verbatim quoted spans.** Owner-approved in the same terms as the A2 carve-out: text that is expected to repeat *because it is the dua's own wording* is not a templating leak. Only spans matching the record's `translation`, `transliteration`, or the authored A1 (`meaning` / `timing` / `reflection`) **verbatim** are subtracted, and each subtraction leaves a barrier rather than a join, so no 12-gram is minted across the seam. Generated connective phrasing is never exempt. Full rule and rationale: `docs/seo/VALIDATOR-RULES-SESSION-1.md` R7.

The number going to zero is not the evidence. A carve-out that swallows its window also reports zero. The evidence is a **negative control**: an identical connective sentence injected into 3 real pages was still caught (3 twelve-grams on 3 pages), and the pages were restored. Result: 539 quoted spans subtracted across 117 pages, FAQ leaks **0**, A1 leaks 0, lede leaks 0, per-entry failures 0, `validate-seo.mjs` PASS over 515 pages, 602/602 worker tests.

**Decision 2 — batches 1–7 are approved, and 87 pages flipped to indexable (95 after the R6 ruling below).** Applied in exactly the shape batch 3 was flipped on 2026-08-02: per entry `indexable: true`, `reviewStatus: "reviewed"`, `indexReason: approved-by-owner-2026-08-03`; per batch `approved: true` with date and approver (ADR-044). **No authored prose was edited** — the diff is confined to those three fields. Indexable pages go 20 → 107 → **115** once clusters A/C/D/F are released; sitemap `<loc>` 42 → **167**, zero duplicates, every URL resolving to a committed file.

Note for anyone repeating this: flipping `_meta.batches[].approved` **alone does nothing**. `indexDecision()` checks the per-entry `cp.indexable` boolean *before* it consults batch approval, so a stale per-entry `false` silently outranks an approved batch.

**Decision 3 — R6 held 10 pages inside approved batches; 8 are now released by adjudication, 2 remain held.** Six clusters have two authored members rendering the same Arabic under the R6 normalisation, all sitting in `duplicate-scripture-allowlist.pendingAdjudication`, which does not permit them. Pending the ruling they carried `indexable: false` / `indexReason: r6-duplicate-scripture-pending-adjudication`. Where neither member was live **both** were held, because picking which page owns the query *is* the adjudication and the allowlist states that ruling is a reviewer's, "never a code change"; where one was already live (`19:42`, `19:47`, batch 3) only the newcomer was held, preserving the existing state without a choice being made.

**Decision 4 — clusters A, C, D, F are adjudicated: both members index, cross-linked, no canonical.** Ruled by the owner on the evidence below; a data change to `duplicate-scripture-allowlist.json` only, per that file's own rule. All four take the same disposition as the seed `117:235`/`quran:2:201` pair.

| cluster | members | chapters / keywords | occasions | disposition |
|---|---|---|---|---|
| A | `27:85` `28:109` | morning & evening *(derived per entry)* vs before sleeping *("dua for sleeping")* | morning-evening vs sleep-waking | both index |
| C | `17:35` `19:43` | Ruku' *("dua for ruku")* vs Sujood *("dua for sujood")* | both `prayer` | both index |
| D | `17:37` `19:45` | Ruku' *("dua for ruku")* vs Sujood *("dua for sujood")* | both `prayer` | both index |
| F | `34:121` `41:137` | worry & grief *("dua for worry and grief")* vs settling a debt *("dua for debt relief")* | both `distress` | both index |

Three findings carried the ruling. **The occasion bucket is our own facet, not the search intent** — C, D and F share a bucket but target distinct queries, and "what to say in ruku" is not answered by the sujood page. **The narrations genuinely attest both placements**: 'Aishah's report puts C's words in both postures, 'Asim bin Humaid's does the same for D, and F's supplication names eight things spanning both anxiety and the burden of debt. **Each pair has a real differentiator in its authored prose** — measured Jaccard overlap 0.22–0.30, with distinct openings and timing sentences naming the specific posture, moment or narrator. F needed the most scrutiny and resolved on its own text: `41:137`'s prose states the proportion honestly rather than overclaiming — *"Only one of the eight things named concerns debt, and it sits seventh in the list"* — so the page serves the debt query without pretending to be a debt-specific supplication.

Cross-linking is not new work: ADDENDUM §15 already emits "The same wording is also listed in this library under …" on each member, filtered to published pages by R8. Verified rendering on all 8. **No `rel=canonical` is set on either member of any pair** — each is self-canonical, by decision.

**Still held after this ruling: 2 pages — `17:34` (cluster B) and `32:117` (cluster E).** Both were outside the scope given, and both are structurally the same question as C and D: B is another Ruku'/Sujood cross-listing, and E pairs Qunut in the Witr prayer against Sujood. Each has a member already live from batch 3 (`19:42`, `19:47`), so each is one ruling away from releasing one more page. **They are not resolved and must not be assumed to follow C and D — that inference is the adjudication, and it is the owner's.** Four clusters remain in `pendingAdjudication` overall, including the three-member `Bismillah` cluster (`8:12`/`5:9`/`99:210`), which carries thin-content and cannibalisation questions independent of R6.

**A structural finding the "noindex + rel=canonical" branch surfaced, recorded so it is not re-derived.** That branch of the rule cannot be expressed in this architecture: **only indexable pages are published** (R8, and the commit set itself), so a page held at `noindex` is not in the deploy artifact at all and has no live URL on which a `rel=canonical` could be read. Consolidating a duplicate therefore means either publishing the loser as an indexable-but-canonicalised page — which the builder does not currently support, since `head()` always emits a self-canonical — or simply not publishing it. Nothing was lost here, because all four clusters resolved to "both index". A future cluster resolving the other way needs a builder change first, and the standard guidance against combining `noindex` with `rel=canonical` (the `noindex` can propagate to the canonical target) is a second reason to prefer publish-the-winner-only.

**Still unresolved, and load-bearing.** **R1–R6 are implemented by no script.** `validate-seo.mjs` asserts §5 naming, rendered-output shape and now R8; it does not implement the duplicate-scripture rule, the `build_gate` rule, or the Class B / `quran:` clause rule. The R6 holds and this adjudication were applied by hand from a one-off audit, so the next batch approval can silently re-introduce a collision. R3 and R4 currently bind nothing in the authored set (no authored record is a `quran:` record, a Class B narration, or carries `build_gate`) — which is why this passed, not because the rules ran.

**References.** ADR-044 (owner is the content approver); ADR-054 (global hold, discharged here); ADR-066 (**superseded** by this ADR); ADR-055/ADR-059 (Gate 1 = 44, `meta.excluded`); `docs/seo/VALIDATOR-RULES-SESSION-1.md` R6 (superseded section), R7 (FAQ carve-out), R8 (link integrity, enforced); `src/data/dua/duplicate-scripture-allowlist.json`; `scripts/check-dua-a1-overlap.mjs`; `scripts/validate-seo.mjs`.
