# TASKS.md — Working Board
**Live task board · v1.0 · 2026-06-03**

> The roadmap lives in `ARCHITECTURE §3`; this is the *working* version of it —
> the place you actually move things across columns. Keep it current: when you start
> a task move it to **In Progress**, when it ships move it to **Done** with a date.
> One page/feature per session (charter §5). Tasks touching Islamic content are
> marked 🕌 and are **not Done** until human review sign-off (CONTENT-POLICY §5).
>
> Status legend: `[ ]` backlog · `[~]` in progress · `[x]` done · 🕌 needs content review · 🚧 known gap

---

## Now — In Progress
_Move tasks here as you pick them up. Keep this short (1–3 items)._

- [~] _Restructure governance docs:_ rename current `CLAUDE.md` → `docs/DESIGN-SYSTEM.md`; place new charter `CLAUDE.md` at root; add `CONTENT-POLICY.md`, `API-SPEC.md`, `DATA.md`, `DECISIONS.md`.

## Next — Ready to Start
_Top of the backlog, unblocked, scoped._

- [x] **R1–R6 enforced in `scripts/validate-seo.mjs`** (owner directive 2026-08-03) — done. All nine rules (R1–R6, R3a, R8, R9) now run every validator pass, each verified by a negative control in `scripts/test/negative-control-validator-rules.mjs` (10/10 cases fire and restore byte-identically). **Luck-vs-design reported: R1, R2, R3/R3a and R4 were vacuous — passing on set composition, not enforcement; R5 and R6 were genuinely load-bearing.** R2 surfaced real drift: 16 chapters flagged `gets_static_chapter_page=yes` against 10 built pages. Table in `docs/seo/VALIDATOR-RULES-SESSION-1.md`.
- [ ] 🔒 **BLOCKED UNTIL THE TRANSLITERATION ADOPTION BATCH COMPLETES — cross-field consistency check (Arabic ↔ transliteration ↔ translation).** Owner directive 2026-08-03, logged not started. Build a check that derives each record's Arabic root(s) and compares them against what its transliteration and its translation actually say, flagging disagreements. **The worked example is `36:127`**: `arabic` reads `بِكَ أَحُولُ` (ح-و-ل, *to turn/shift*), `transliteration` reads `bika ajoolu` (ج-و-ل, *to roam/move*), and `translation` reads "by You I move" — so two of three fields agree with each other and disagree with the Arabic. Different roots, not a transcription variant. That record is now held (`indexReason: gate3-hold-36-127-root-disagreement`) and written up as reviewer-package Part 16.
  **Why it is blocked and must not be started early:** the check is only as good as the romanisation it reads. `36:127` was catchable *because* its transliteration was legible enough to disagree; **54 of the 116 are in the `AA` scheme** (`aAAoothu`), where a root-level disagreement of exactly this kind is far harder to see, and 26 more are plain ASCII with no ʿayn marker at all. Running this before adoption would produce a low-signal pass and, worse, **manufacture false confidence** — the absence of findings would be read as absence of defects. Adoption is what produces the clean base this depends on.
  **Scope note:** `36:127` was found by hand while doing something else. Nothing systematically compares these fields today, so the current count of known root disagreements is **1 found, not 1 existing** — treat it as a floor, the same way `DUA-INTEGRITY-SCAN.md` treats its detector counts.
- [ ] **Make the dua build sequence unmissable — orchestrating script and/or a staleness assertion.**
  The correct order is **`build-dua-pages.mjs` → `build-dua-landing-pages.mjs`**. Verified from the
  code, not from habit: `build-dua-pages.mjs` **writes** `src/data/dua/page-names.json`
  (`NAMES_PATH`, "the ONE place a page's name is resolved") and `build-dua-landing-pages.mjs`
  **reads** it and aborts `FATAL` if it is missing or stale. Same order is asserted in that file's
  own `_meta.buildOrder`.
  **The real defect is not ordering — it is that neither builder knows the other is stale.**
  Both write `sitemap.xml`, and each on its own produces a self-consistent, clean-looking result.
  On 2026-08-03, holding `103:215` and re-running **only** the pages builder gave a clean
  `INDEXABLE: 115 / sitemap 167` while `validate-seo.mjs` came back `RESULT: FAIL (2)` — R8,
  `duas/occasion/travel.html` and `duas/source/hisn.html` still linking
  `/duas/the-travelers-invocation-at-dawn-hisn-103-215.html : no such file`. The landing pages were
  simply never rebuilt. **The failure is silent in the builder and only surfaces in the validator**,
  so anyone who skips the validator ships broken internal links.
  Rule to encode: **any change to `page-copy.json` or the corpus requires BOTH builders to run, in
  the order above.**
  Two options:
  - a single `scripts/build-dua-all.mjs` that runs both in sequence and is what CI and the playbook
    call, or
  - a staleness assertion in `build-dua-landing-pages.mjs`: fail if any published detail page or
    `page-copy.json` is newer than the landing pages it is about to link.
  **Prefer doing both** — an orchestrator only helps people who use it, while the assertion also
  catches whoever runs a builder directly out of habit. Whichever is chosen, add a negative control
  that proves it fires (hold a record, run one builder only, confirm the build refuses), per the
  R1–R6 precedent above — an ordering check never made to fail on purpose is not known to work.
- [ ] Create `docs/DATA.md` link-back from `ARCHITECTURE §6` (remove duplicated key tables; point to DATA.md).
- [ ] Stand up CI checks (see §CI below) before building more pages.
- [x] **api.js — `API_BASE` seam added (INERT), 2026-07-21 (ADR-028).** `_get`/`_getHadith`/`_post`
  now route through `_apiUrl()` which prefixes `API_BASE` to `/api/*` paths only (CDN + `src/data`
  URLs untouched). Default `API_BASE=''` = same-origin, byte-identical to legacy behavior — unit-tested
  inert (`worker/test/ui-utils.test.js`). Flip target wired: `https://islamicinfo-api.islamicinfo.workers.dev`
  (later `api.islamicinfo.org`). CORS + Pages-origin allowlist already done. NOT a Module-1 regression;
  independent of ADR-026. **Remaining = flip + verify ↓↓.**
- [ ] 🚧🕌 **Flip `API_BASE` + verify EVERY `/api/*` call site degrades gracefully (site-wide).**
  Before setting `API_BASE` to the Worker origin, confirm each endpoint — `verse`, `quran`, `prayer`,
  `verify`, `subscribe`, `ask-claude`, **and** hadith — still degrades gracefully cross-origin (the flip
  activates all of them at once, and touches the auth-adjacent POST endpoints). The whole `/api` layer
  shares this same latent gap today (all 404 in prod), not just hadith — so this is a site-wide check,
  not a per-page one. **Gated on:** the Worker redeploy ↓ (hadith routes must exist first, else hadith
  stays 404 cross-origin). See DECISIONS.md ADR-028.
- [ ] 🚧🕌 **Redeploy the `islamicinfo-api` Worker so it carries the hadith routes.**
  Verified 2026-07-21: the Worker is deployed/alive (root → 200, `/api/quran/*` → 501, a recognized
  route) but **every `/api/hadith/*` path returns 404** — the Module-0 hadith endpoints
  (`worker/src/hadith.js`, `handleHadith`) are NOT in the deployed build. Redeploy from the current
  `worker/` with `HADITH_API_KEY` secret + KV binding (`cd worker && npm run deploy`; verify
  `/api/hadith/collections` → 200 after). Pair with the `API_BASE` fix above so the 9 hadithapi.com
  collections (Bukhari, Muslim, the Sittah…) load live. Until both land, only the 9 direct-source
  (fawazahmed0/AhmedBaset) CDN collections work in production. Neither depends on the ADR-026 hosting
  migration (that's page-route 200-status/SEO only). See DECISIONS.md ADR-024 (3-provider routing).
- [ ] 🚧 **Cloudflare hosting migration (dedicated initiative — needs Milan's cost/benefit call).**
  Move static-site serving from GitHub Pages to Cloudflare (Worker static-assets or CF Pages) so
  path routes (`/hadith/[collection]/…`, ADR-026) return **HTTP 200** and are crawler-indexable.
  **Scope is broad: affects all 10 pages, DNS (islamicinfo.org → Cloudflare), and the deploy
  pipeline** — this is NOT a quick follow-up and must not be folded into a content module.
  **Until it happens:** shared hadith deep-links return 404 to crawlers (no search indexing) **and
  have broken social-preview unfurling** (Open Graph/Twitter cards won't render) — weigh both when
  prioritising. `worker/wrangler.toml` already anticipates the DNS move (commented `api.islamicinfo.org`
  route). Also revisit renaming Tier 1 `/hadith.html` → `/hadith/` at that point. See DECISIONS.md ADR-026.
- [ ] 🚧 **Hadith search — real proxy.** Stage-1 hero search is a client-side substring stub over
  the *loaded* feed only (`hadith.js` `wireSearch`/`setSearchQuery`). Build the real
  `GET /api/hadith/search` proxy (TechSpec §4.4) — full-corpus search with `<mark>` ranges,
  grade badge, and Tier-3b `Open →` deep-links. Wire the scope chips (All/Qur'an/Dua/Verify) to
  real cross-scope search once those exist.
- [ ] 🕌🚧 **Hadith isnad chains + topic tags — curated data source.** hadithapi.com returns no
  structured isnad (`narrators: []`) and no topic tags (`topics: []`), so at Stage 1 the isnad
  panel shows "unavailable" and topic chips run a labeled keyword heuristic (not curated
  classification). Provide a verifier-reviewed narrator/isnad + topic dataset (per TechSpec §4.3;
  mirrors the related-hadith curation gate) so US-H05 renders real chains and US-H06 filters by
  real topic tags. `hadith.js` `isnadInnerHTML`/`isnadNodeHTML` already render dot-nodes the moment
  real `narrators[]` data arrives — no UI change needed, data only.
- [ ] 🕌🚧 **Hadith translations — source additional editions (UR/FR/ID/TR).** The Tier 3b deep-view
  translation-tab UI + `islamicinfo-hadith-lang` localStorage preference are **built and shipped**
  (Module 7); they render a tab per language *present in the payload* and honor the saved choice the
  moment more languages arrive. Today the provider returns a single English (or Arabic) translation,
  so only one language renders and no tab strip shows. **This is unblocked-by-engineering,
  blocked-by-content-sourcing:** obtain permissively-licensed UR/FR/ID/TR translation editions
  (mirroring the ADR-024 direct-source approach) and surface them as `h.translations[]` on the
  normalized hadith. No code change is required in Module 7's deep-view to light them up.
- [ ] 🕌🚧 **Narrator reliability dataset — scholar-verified (Module 8 data half; DoD-9).** The panel
  ENGINEERING ships in Module 8 (component, lazy-fetch, all honest states), rendering
  honest-"unavailable" until data exists. Seed `/data/narrator/{id}.json` (schema:
  `data/narrator/_schema.example.json`) from **Taqrib at-Tahdhib / Tahdhib al-Kamal / Siyar A'lam
  an-Nubala'**; EVERY `graderCitations[]` entry (scholar + gradeText + source + folio/`sourceRef`) must
  trace to a named classical work and pass the **islamic-authenticity / hadith-verifier** skill. This is
  a **Product + Scholarly Review** task, NOT engineering — gated by CONTENT-POLICY §5 human sign-off; no
  fabricated gradings, ever, and never pad to the "min 3 rows" target. Also needs the upstream curated
  isnad dataset (live chains are `narrators:[]`, so panels aren't reachable until narrator rows exist).
- [ ] 🚧 **Hadith page performance pass (PRD DoD-15 gap).** Local Lighthouse on the Tier 3b
  benchmark route (`/hadith/sahih-bukhari/1/1`) scored **Performance 62–65** (target ≥90);
  Accessibility 97, Best-Practices 96, SEO 90 all pass. The perf cost is **base-`hadith.html`
  page-wide** (render-blocking web fonts, ~43 KiB unminified JS, LCP ~5–9s, the SPA loading all
  Tier-1 sections + the live feed + widgets on every route) — the score is ~identical whether the
  deep-view's data loads or not, so it is NOT specific to the Module-7 Tier-3 code (CLS 0.072, its
  2 added scripts + inline CSS are negligible). Fix as a dedicated pass: `defer`/async non-critical
  scripts, `font-display: swap`, and a JS-minify step (blocked by the no-build-step constraint,
  ADR-001 — may need a lightweight build or CDN-minified assets). Re-run Lighthouse in a
  production-like env (API reachable). NOTE: production SEO will also be capped by the ADR-026
  GitHub-Pages 404-status deep-link limitation until the hosting migration lands.
- [ ] 🚧 Create missing utility pages: `contact.html`, `privacy.html`, `terms.html`.
- [ ] 🚧 **Global grade-token WCAG sync** — propagate the ADR-025 grade-badge fix
  (`--grade-hasan #5D8A3A→#4A7030`, `--grade-daif #A86932→#8A5228`, plus the
  `[data-theme="dark"]` grade overrides `#1FA882/#7AB84E/#D4884A/#E05555`) to pages **not**
  touched by the hadith module: `about`, `contact`, `dua`, `terms`, `privacy`, `tools`,
  `islamic-studies`, `habits`, `inheritance` (+ all `mockups/*`). Most only use `--grade-sahih`
  as a decorative green accent (no grade badge, no WCAG bug), **but `inheritance.html` renders
  text in `--grade-daif` for deduction values (3.79:1) — a real fix, not decorative.** Verify
  each page before editing. Re-sync sibling sites (QuranlyAI/MosqueFinder/…). See DECISIONS.md ADR-025.

## Done
_Shipped work, most recent first._

- [x] **Related Verses** (Quran Explorer knowledge index — slice 1 of 3) — topic-based
  "Related Verses" panel in the Quran reader, powered by a pre-built, hand-curated,
  fully-sourced static JSON index (`src/data/related-verses/`); zero AI, zero backend,
  client-side lookup. Build script (`tools/related-verses-build.mjs`) is fail-closed —
  every row requires a `sourceCitation`. See `doc/DATA.md` and `doc/API-SPEC.md`. (2026-07-17)
- [x] 🕌 **Related Hadith** (Quran Explorer knowledge index — slice 2 of 3) — **LIVE; 🕌
  sign-off completed 2026-07-17.** Topic-based "Related Hadith" panel in the Quran
  reader, mirroring Related Verses; static JSON, zero AI, zero backend, client-side lookup;
  reuses the slice-1 `src/data/related-verses/verse-index.json` for verse → topic mapping. Fail-
  closed build (`tools/related-hadith-build.mjs`) emits only `reviewed:true` rows from the
  verifier-confirmed curation source (`tools/related-hadith/topics.source.json`) into
  `src/data/related-hadith/topics.json` — **6 hadith across 4 topics** (patience, mercy,
  gratitude, truthfulness) signed off by the operator (CONTENT-POLICY §5). No new `/api/` route.
  See `doc/DATA.md` and `doc/API-SPEC.md`. (2026-07-17)
- [x] **Vocabulary / Key Terms** (Quran Explorer knowledge index — slice 3 of 3) — **LIVE.**
  Per-verse "Key Terms" glossary panel completing the reader trio (Related Verses · Related
  Hadith · Key Terms); static JSON, zero AI, zero backend, client-side lookup. Fail-closed
  build (`tools/vocab-build.mjs`) compiles the hand-authored curation source
  (`tools/vocab/terms.source.json`) into `src/data/vocab/terms.json` +
  `src/data/vocab/topic-terms.json` — **16 terms**, every definition grounded in Lane's
  Arabic-English Lexicon (`source` field mandatory). Reuses the shared taxonomy plus the
  slice-1/2 `related-verses`/`related-hadith` indexes for cross-refs — no new database. No
  review gate (restricted to well-established lexical terms). No new `/api/` route.
  See `doc/DATA.md` and `doc/API-SPEC.md`. (2026-07-17)

**Knowledge Index (all 3 slices — Related Verses, Related Hadith, Vocabulary) is now
COMPLETE.** Entire feature ships as static JSON; D1 + FTS5 + `/api/index/*` were evaluated and
dropped as unnecessary.

### Knowledge Index — Deferred Backlog
_Follow-on ideas beyond the shipped 3-slice set; not yet scoped as individual tasks._

- [ ] Global glossary term-search (search across all Vocabulary terms, not just per-verse).
- [ ] Hadith-page cross-linking (surface Related Hadith rows on `hadith.html`, not just the
  Quran reader panel).
- [ ] Disputed-grade handling (multiple graders disagree; currently Sahih/Hasan-only, single
  `gradedBy` per row).
- [ ] 🕌 AI connecting-explanation blurb — reuses `/api/ask-claude` guardrails + human-review gate.
- [ ] Web-based admin bulk-review UI (flip `reviewed:true` without hand-editing source JSON).
- [ ] Contested-terms handling (terms with disputed/multiple scholarly definitions).
- [ ] Scale tag coverage via external thematic index / staged suggestions.

**Dropped as unnecessary:** Adopt D1 + FTS5 for the corpus; introduce `/api/index/*` worker
routes. The Knowledge Index ships entirely as static JSON — no database, no new routes.

---

## Stage 1 — Static Foundation
**Goal:** pixel-perfect replica of all 10 blueprints, both themes, static content, no real API calls.

### Pages (build order from PROJECT_STRUCTURE)
- [ ] `src/css/tokens.css` + `src/js/global.js` — extract from DESIGN-SYSTEM; everything depends on this
- [ ] `index.html` (Home) — establishes the pattern
- [ ] `about.html` — no APIs/tools; validates the shell · 🕌 (methodology/scholars copy)
- [ ] `verify.html` — 2200 ms simulation, static demo result · 🕌 (disclaimer string hard-coded)
- [ ] `habits.html` — full localStorage wiring, no API
- [ ] `tools.html` — 12 tools, hardcoded prayer times, static Nisab `$6,180` · 🕌 (inheritance calc cites ayat)
- [ ] `knowledge-hub.html` — clusters, trending, scholars, email capture, search routes · 🕌
- [ ] `dua.html` — full dua library, category filters · 🕌
- [ ] `islamic-studies.html` — pathways, lesson display, quiz band (static), IS↔KH handoff · 🕌
- [ ] `hadith.html` — 9-collection sidebar, trace layout, grade filter, static hadith · 🕌
- [ ] `quran.html` — surah reader (Surah 1), word-by-word, audio controls, 3-source tafsir panel · 🕌

### Stage 1 completion criteria
- [ ] Lighthouse Performance / Accessibility / SEO ≥ 90 on all 10 pages
- [ ] Both light and dark themes verified on all pages
- [ ] All `localStorage` keys wired (Habit Tracker, Islamic Studies progress) per DATA.md
- [ ] All nav/footer/CTA hrefs correct — no `href="#"` in production
- [ ] `sitemap.xml` and `robots.txt` deployed
- [ ] `contact.html`, `privacy.html`, `terms.html` exist
- [ ] DESIGN-SYSTEM §24 enforcement checklist passes on every page
- [ ] CONTENT-POLICY §6 checklist passes on every 🕌 page (human review signed off)

---

## Stage 2 — Live Data & Deep Links
**Goal:** real API data flowing, deep-link routes live, audio working, bookmarks/notes persisted.

- [ ] `/api/prayer` live → Home + Tools prayer times (AlAdhan)
- [ ] `/api/verse` + `/api/hadith` → Home daily rotation · 🕌
- [ ] Quran full reader on `/api/quran/[surah]` (api.quran.com /v4) · 🕌
- [ ] 50+ reciters dropdown + audio (EveryAyah CDN)
- [ ] Hadith Tier 2 + Tier 3 routes (Sunnah.com) · 🕌
- [ ] Deep link `/quran/[surah]/[ayah]` (scroll + gold pulse ring)
- [ ] Bookmarks + notes persisted (Quran, Hadith) per DATA.md
- [ ] `islamicinfo-is-progress` wiring + return-detection (`visibilitychange`)
- [ ] Quiz full flow + gating (70% threshold)
- [ ] Live Nisab via `/api/nisab` (Metals API)
- [ ] Email capture `/api/subscribe`
- [ ] Service worker + PWA (`quran-sw.js`, `manifest.json`)
- [ ] Sentry + uptime monitoring
- [ ] GA4 custom events (no PII)
- [ ] Extract inline CSS/JS → `/css`, `/js` modules (ADR-001 deferral)

---

## Stage 3 — AI, Topics & Advanced
**Goal:** AI explanation integrated, topic navigation, advanced search.

- [ ] `/api/ask-claude` AI explanation panel (Quran, Hadith) · 🕌 (server safety filter + attribution)
- [ ] QuranlyAI attribution on all AI panels
- [ ] Hadith topics route `/hadith/topics` · 🕌
- [ ] Quran compare mode `/quran/compare`
- [ ] Scholar pages `/scholars/[slug]` (×4) · 🕌
- [ ] Related-hadith graph + narrator grades · 🕌
- [ ] `islamicinfo-lang` i18n selector + locale JSON
- [ ] Web Workers for AI fetch

---

## Stage 4 — Accounts, Full PWA, Advanced Tools
**Goal:** optional accounts, cross-device sync, advanced research tools.

- [ ] Optional user accounts (auth hook; localStorage → server, non-destructive) — **new ADR required**
- [ ] Cross-device sync `/api/sync` (Habits, Islamic Studies)
- [ ] PDF/WhatsApp citation export `/api/export/pdf` (Verify, Hadith) · 🕌
- [ ] Quran trace view `/quran/trace`
- [ ] Hadith compare `/hadith/compare` (3-pane) · 🕌
- [ ] Saved verifications (requires accounts)
- [ ] Certificate generation (Islamic Studies; `certificates[]` hook → Canvas)
- [ ] Region pages `/region/[slug]` (×6)

---

## Known Gaps 🚧
- [ ] `contact.html` — linked from About/footer, not yet created
- [ ] `team.html` — footer "Meet the Team" target (Stage 2)
- [ ] _(low priority)_ **Custom API domain `api.islamicinfo.org`.** Once the API is routed via
  `API_BASE` (ADR-028), optionally set up a Cloudflare custom-domain route so `API_BASE` can move from
  `…workers.dev` to `https://api.islamicinfo.org` (nicer/stable URL; the QuranlyAI widget already
  prefers it with a `…workers.dev` fallback). Cosmetic — `…workers.dev` works fine; do NOT block the
  API flip or the Worker redeploy on this. Separate from (and lighter than) the ADR-026 site-hosting migration.

## CI Checks (wire once, run every deploy)
- [ ] Lighthouse ≥ 90 on all 10 core pages
- [ ] No `href="learn.html"` anywhere
- [ ] No `href="#"` in production (except intentional in-progress)
- [ ] No `quranlya.com` (wrong domain)
- [ ] No shimmer `::after` CSS
- [ ] `knowledge-hub.html` present in all nav + footer Quick Access lists
- [ ] All 10 pages present in `sitemap.xml`
- [ ] `[data-theme="dark"]` is a sibling to `:root` — not merged

---

## Module 18 — Full DoD & QA Pass (PRD §10, 18 items) — run 2026-07-23

Verification-only audit of everything built in Modules 0–17 (read-only, code-level;
no browser / screen-reader / live-model / Lighthouse tooling available this session).
Full report: `docs/superpowers/specs/2026-07-23-module-18-dod-qa-report.md`.

**Verdict tally:** 3 Pass · 11 Partial · 4 Fail/Not-Built. NOT ship-ready — blocked by
the unmet scholarly-review gate (content) plus DoD-17 (analytics never built) and
DoD-6/-7 (engineering fixes). The stale "Stage-1 unmerged" belief was corrected: all
engineering IS on `main` (`feat/hadith-module-1-foundation` fully contained in main).

| DoD | Status | Owner | Follow-up |
|---|---|---|---|
| 1 four stages signed off | Partial | QA + Scholarly | acceptance sign-off not recorded; AT/perf/content pending |
| 2 deep-link/share/back-fwd | Pass | Eng | (compare shares via ?refs= not routePath — minor) |
| 3 blueprint 9→18 deliberate | Pass | — | documented ADR-022/024 |
| 4 dark-mode parity | Partial | Frontend/QA | code theme-aware; visual contrast needs browser |
| 5 breakpoints 1100/900/760/700/440 | Partial | Frontend/QA | all present in CSS; real-device render unverified |
| 6 hover easing tokens | **Fail** | **Eng** | ~8 new hadith components use default `ease` on hover — fix |
| 7 no new colors; grade exc doc'd | Partial | **Eng** + Design | grade exc doc'd (ADR-025); **`#4ADE80` .study-mode-dot** new hex → tokenize |
| 8 named grader every card | Fail-by-design | Data/Scholarly | grader always null → "not individually cited" (anti-fabrication, ADR-022) |
| 9 narrator citations reviewed | Partial | **Scholarly** | zero data authored; list NOT reviewed |
| 10 AI prompt/filter/attribution | Partial | AI + Reviewer | code Pass; ships DARK; live adversarial + sign-off pending |
| 11 audio/copy/translation attribution | Partial | Frontend | copy Pass; audio honest-unavailable; edition-label dormant (single edition) |
| 12 Verify/Ask CTAs + prefill | Pass | Eng | — |
| 13 focus trap + VoiceOver/NVDA | Partial | Frontend/QA | trap wired (Trace/Bookmarks/Compare); **AT pass not runnable here** |
| 14 6 error-fallback states tested | Partial | Frontend/Worker | 3 tested; **storage-quota handled but UNTESTED**; CDN-404 no hadith handler; canvas N/A |
| 15 Lighthouse ≥90 ×4 | **Fail** | Perf/Infra | Perf last-known 62–65; ADR-043 (no-build ceiling); unmeasurable here |
| 16 reading-path Continue | Partial | Scholarly/Product | logic built/tested; empty hadithRefs → live "Coming soon" (ADR-042) |
| 17 GA4 10 KPI events | **NOT BUILT** | Unassigned | **zero analytics wiring anywhere**; 0/10 events |
| 18 §24 enforcement per route | Partial | Design + Eng | hover(6) + stale Ecosystem/LearnSpeakAI §24 doc; hero/theme need runtime |

**Religious-accuracy gate: UNMET.** No scholarly human review (CONTENT-POLICY §5) has
occurred for any Islamic-content feature — narrator gradings, alternate gradings, topic
summaries, trace-view commentary, reading-path refs are all honest-unavailable /
curation-deferred / zero-content scaffold. Safe to ship the engineering/display layer;
NOT cleared to present those as reviewed content.

### Fixes applied — 2026-07-23 (branch feat/hadith-module-18-dod-fixes)
Engineering items from the follow-up list, now done (verified by the suite, 421 tests):
- **DoD-6 → Pass:** 8 hadith hover components now use `var(--ease-reverent)`/`--ease-premium`.
- **DoD-7 → Pass:** `.study-mode-dot` `#4ADE80` → `var(--teal-300)` (no raw hex).
- **DoD-11 → Pass:** single-edition translations render a `.hadith-tr-edition` "Source · <edition>" label (honest source attribution; graceful when absent).
- **DoD-14 → Pass:** `safeLocalStorageSet` quota fallback now unit-tested (success/QuotaExceeded/generic).
- **DoD-17 → Live (pending deploy verification):** analytics layer built + **activated**. GA4 id `G-JMH3Q4XTNY` hardcoded in `analytics.js`; consent **on by default** (product decision 2026-07-23, no banner; `II.analytics.revokeConsent()` opt-out hook retained). Loaded **site-wide** via `global.js` `loadAnalytics()` (all 14 pages) → fires initial GA4 `page_view` on every page load (visitor/traffic/geo reports) + the 10 hadith KPI custom events. `analytics-core.js` (10-KPI allowlist + gating, 7 tests). **Remaining:** confirm hits in GA4 Realtime/DebugView after deploy; SPA in-app route changes on hadith.html don't emit extra page_views (initial page_view + `tier3_pageview` custom event cover it) — revisit if per-route SPA pageviews are wanted.
- **DoD-18 → improved:** the DoD-6 hover portion is fixed; the stale Ecosystem/LearnSpeakAI §24 doc item remains a Product/Design call.

KPI-semantics follow-ups (from final review — not bugs): `hotd_interacted` currently only fires on the HotD isnad button; `trace_view_opened` fires even on a failed hadith load; `narrator_panel_opened` counts first-open only. Revisit when analytics goes live.

NOT fixable this session (unchanged): DoD-8/9/16 + religious gate (need human scholarly review — fabricating content is forbidden); DoD-15 (no Lighthouse tooling); DoD-13/4/5 visual/AT (no browser/screen-reader); DoD-10 live-model re-run.

### Follow-up items surfaced by this pass
- [ ] **DoD-6 (Eng):** switch ~8 hadith hover components to `var(--ease-reverent)`/`--ease-premium` (`.reading-path-row`, `.sidebar-cta`, `.section-action`, `.breadcrumb a`, `.path-nav-btn`, `.exit-study`, `.trace-act`, `.topic-card`).
- [ ] **DoD-7 (Eng):** tokenize/remove new hex `#4ADE80` (`hadith.html` `.study-mode-dot`).
- [ ] **DoD-14 (Eng):** add the missing storage-quota (`QuotaExceededError`) unit test the Module-10 plan required.
- [ ] **DoD-17 (Product/Eng):** analytics never built — decide scope (GA4 gtag/dataLayer + 10 KPI events) or formally descope in PRD.
- [ ] **DoD-18 (Design):** update DESIGN-SYSTEM §24/§26 — Ecosystem column/LearnSpeakAI item is stale vs the live 6-site footer.
- [ ] **DoD-15 (QA/Infra):** run real Lighthouse on `/hadith/bukhari/1/1` (before/after Module-18 perf levers) to close or confirm the ADR-043 ceiling.
- [ ] **DoD-4/5/13/18 (QA):** live-browser + real-device + VoiceOver/NVDA pass (the environmental gaps this session couldn't cover).
- [ ] **Scholarly Review (blocking ship of content features):** narrator dataset, topic summaries, trace commentary, reading-path refs, alternate gradings — CONTENT-POLICY §5 human sign-off.

### Follow-up — 2026-07-30 (dua sidebar)
- [ ] **Dua sidebar type/contrast is a LOCAL override, pending the site-wide WCAG token sync.**
  `dua.html` raises `.dsb-item` 13px→14px, `.dsb-count` 10px→11px, `.dsb-label` 9.5px→11px, and
  `.dsb-item` colour `var(--ink-muted)`→`var(--ink-body)`. These are scoped to the dua sidebar
  only; no design token was changed. Reconcile them into the site-wide token pass rather than
  letting the dua page fork — if the tokens land first, delete these four overrides.
  (Note for whoever picks this up: there is no `src/css/tokens.css`; the tokens are the inline
  `:root` / dark-theme blocks in each page, `dua.html` lines ~50 and ~73.)

---
*Source: ARCHITECTURE §3 build stages + §15.3 CI checks + PROJECT_STRUCTURE build order.
Keep statuses current — this file is only useful if it reflects reality.*
