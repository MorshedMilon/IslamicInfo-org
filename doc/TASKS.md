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

- [ ] Create `docs/DATA.md` link-back from `ARCHITECTURE §6` (remove duplicated key tables; point to DATA.md).
- [ ] Stand up CI checks (see §CI below) before building more pages.
- [ ] 🚧 Create missing utility pages: `contact.html`, `privacy.html`, `terms.html`.

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
*Source: ARCHITECTURE §3 build stages + §15.3 CI checks + PROJECT_STRUCTURE build order.
Keep statuses current — this file is only useful if it reflects reality.*
