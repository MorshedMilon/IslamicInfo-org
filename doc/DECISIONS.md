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
