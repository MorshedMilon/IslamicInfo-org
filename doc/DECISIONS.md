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
