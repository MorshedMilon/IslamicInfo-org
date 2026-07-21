# Hadith Library — Module-by-Module Claude Code Build Prompts
**Source of truth:** `IslamicInfo_HadithLibrary_PRD_v1_2_Final.md` + `IslamicInfo_HadithLibrary_TechSpec_v1_2.md`
**Design system:** `CLAUDE.md` (locked, v3.0 tokens) — no deviations
**Current file state:** `hadith.html` (1,747 lines) already exists as a **stage-labeled static scaffold** — every section is present in-markup with a `.prd-stage-label` (Stage 1–4) badge, but it was built against the **v1.0/v1.1 9-collection assumption** and has no live data wiring. `src/js/hadith.js` does **not exist yet**. The shared `api.js` has a stub `fetchHadith(collection, book)` calling a single placeholder endpoint — this predates the confirmed 3-provider routing.
**Blueprint check:** `mockups_hadith.html` (the locked visual blueprint) also shows only 9 collections / 6 visible cards. This is the exact "OPEN — layout not verified against 18 collections" item flagged in PRD v1.2 — it is real, not hypothetical, and is why **Module 0 must run first.**

> ⚠️ **OUTDATED — do not act on the "Current file state" line above without re-checking the repo (flagged 2026-07-20).** This pack predates the actual build. As of the current `feat/hadith-module-1-foundation` branch: `src/js/hadith.js` **exists**, `src/js/api.js` **already has the full REST `fetchHadith*` suite**, and git history shows Module 0/1/2 work committed. The claims "`src/js/hadith.js` does not exist yet" and "`api.js` has a stub `fetchHadith`" are **stale**. Whether this is a fresh Module 1 build or a re-review of already-built work is pending owner confirmation — resolve that before running any module from this pack. (Note left per project owner request; the prompt body below is intentionally unmodified.)

---

## How to use this pack

1. Run modules **in order**. Each stage's modules build on the previous stage's data/markup.
2. Paste **one module at a time** into a fresh (or focused) Claude Code session. Each module below is standalone — it re-states the constraints it needs, so you never have to paste a second file alongside it.
3. Every module ends with a **Verification Note** the agent must fill in before you consider the session done. Read it before merging.
4. Every module that touches hadith text, grading, or narrator/isnad data must run through the **hadith-verifier** skill (`skills/islamic-authenticity/SKILL.md`) before anything is written to a data file or rendered as real content — not just for editorial copy, but for any seed/sample data the agent generates. Placeholder Latin text ("Lorem ipsum") is fine for pure layout scaffolding; anything presented as an actual hadith, grade, or narrator citation is not.
5. **Surgical Changes is non-negotiable on this page.** `api.js`, `global.js`, and `tokens.css` are shared across all 10 pages. Every module that touches them says so explicitly and tells the agent to `grep` for existing usages first so nothing on Home, Quran Explorer, etc. breaks.

---

## ⚠️ Before Module 1: two open decisions only you can make

PRD v1.2 flags these as genuinely unresolved — I have **not** silently picked an answer for you, because both are editorial/legal calls, not engineering ones. Module 0 below is written to walk you (or Claude Code, with you reviewing) through making them explicit and durable, but you should read this section first.

**Decision A — grade badges on the 8 ungraded collections**
10 of 18 collections (9 via HadithAPI.com + 40 Nawawi via fawazahmed0) have a real per-hadith `grade` field. The 8 AhmedBaset-sourced collections (Riyad as-Saliheen, Bulugh al-Maram, Muwatta Malik, Adab al-Mufrad, Shamail, Darimi, both Forty Hadith collections) do not. The PRD's own DoD item 8 says every card needs a grade badge with a named grader; §UI note under §2.3 says don't fabricate one. Three real options:
- **(a)** Omit the per-hadith badge for these 8 collections and show a collection-level characterization badge instead (e.g. "Sahih/Hasan compilation" on the collection card, nothing per-card) — matches the §UI note, technically breaks DoD-8 as literally worded, so DoD-8 needs a footnote.
- **(b)** Source a supplementary grading dataset for these 8 (more engineering + a new religious-accuracy review burden — every added grade is a new claim that needs sourcing).
- **(c)** Render "Grade Unknown" (grey) per §7.1 of the TechSpec as the fallback state, applied deliberately rather than as an error fallback.
Module 0 below defaults to recommending **(a)** for cards + **(c)** for the rare edge case, because it's the only option that ships without inventing new sourced claims — but it is written as a decision for you to confirm or override, not as something already decided.

**Decision B — blueprint layout at 18 collections**
`mockups_hadith.html` was drawn for 9 cards. Going to 18 roughly doubles grid rows, sidebar height, and mobile scroll length. This needs a real look at the mockup before Module 2 touches the grid — Module 0 includes the specific check.

---

## MODULE 0 — Decision Gate & Pre-Build Verification
**Type:** Planning / review session (produces a decision record, not shippable code)
**Blocks:** every other module

```
§0 — THINK BEFORE CODING
Do not write or edit any file in this session. This is a review-and-decide
session. Read CLAUDE.md (design system), skills/islamic-authenticity/SKILL.md,
and the two attached docs (Hadith PRD v1.2, Hadith TechSpec v1.2) before
answering anything below.

CONTEXT
hadith.html currently renders 9 hadith collections (see sidebar list and
.stats-strip "9 Major Collections"). The approved PRD v1.2 requires 18
collections across 3 data providers (HadithAPI.com, fawazahmed0,
AhmedBaset — see PRD §2.3 and TechSpec §5). Two items are explicitly
flagged OPEN in both source docs and must be resolved here, not assumed.

TASK 1 — Grade badge policy for ungraded collections
Read PRD §2.3 §UI note and TechSpec §7.1. Ten collections (9 HadithAPI +
40 Nawawi) have a real per-hadith grade field. Eight AhmedBaset-sourced
collections do not. Present three options in a short table with the
tradeoffs: (a) collection-level characterization badge only, no
per-hadith badge, for the 8 ungraded collections; (b) source a
supplementary per-hadith grading dataset for those 8; (c) render
"Grade Unknown" (grey badge) as the deliberate per-hadith fallback.
Do not pick one — present the table and stop for a human decision.
Flag explicitly: whichever option is chosen, it must be written into
DATA.md / DECISIONS.md as a decision record before Module 1 starts,
because every later module assumes one specific answer.

TASK 2 — Blueprint layout check at 18 collections
Open mockups_hadith.html and hadith.html side by side. Confirm: does the
.collections-grid CSS (grid-template-columns, gap, card min-height) hold
up visually at 18 cards instead of 9/6? Does the sidebar's fixed-height
assumption (240px column, "18 rows" per PRD §2.4) cause the READING
PATHS / Browse / CTA block to be pushed below the fold or force the
sidebar to scroll independently from main? Report findings only —
do not change any CSS in this session. If the grid/sidebar breaks
visually, say so plainly; that becomes a scoped CSS task in Module 2,
not a silent fix here.

TASK 3 — Blast-radius check on shared files
grep the whole project for every call site of `fetchHadith(`, and for
any other page (index.html, quran.html, etc.) that reads
`localStorage['ii-cache-hadith']` or references `/api/hadith`. Report
the list. This tells us whether Module 1's api.js changes are isolated
to hadith.html or need to preserve a public signature other pages
depend on.

OUTPUT FORMAT
1. Decision table for Task 1 (no decision made, just the table)
2. Plain findings for Task 2 (pass/fail per breakpoint: 1100/900/760/700/440)
3. List of call sites for Task 3
4. A short "Ready for Module 1?" verdict — only YES if Task 3 finds no
   surprises; otherwise list what must be confirmed with Milan first.

VERIFICATION NOTE (required at end of session)
State plainly: no files were modified in this session (planning-only).
List every file you opened to reach these conclusions.
```

---

# STAGE 1 — FOUNDATION

## MODULE 1 — Data Layer: 18-Collection Registry & 3-Provider Routing
**Covers:** PRD §2.3, §6 (FIX-6/7/8/9/10) · TechSpec §5, §6.1
**Depends on:** Module 0 Decision A confirmed and recorded

```
§0 — THINK BEFORE CODING
Read CLAUDE.md, DATA.md (if it exists), and the Module 0 decision record
before writing anything. Confirm which grade-badge policy was chosen —
if DATA.md/DECISIONS.md doesn't show a recorded decision, STOP and ask
Milan rather than guessing.

GOAL
Build the data layer for all 18 hadith collections and the 3-provider
routing described in TechSpec §5, without breaking any existing page
that uses api.js.

SCOPE — IN
1. Create /data/collections.json seed with all 18 collections from PRD
   §2.3 (name, Arabic name, compiler + lifespan, hadith count — mark
   edition-dependent counts as approximate per the PRD's own caveat,
   grade characterization, source provider). This is the fallback used
   when live fetch fails (TechSpec §8 "Collections grid fetch fails").
2. Extend api.js with NEW functions only — do not rename or remove
   fetchHadith's existing signature unless Module 0 Task 3 showed zero
   external call sites (check the Module 0 output first):
   - fetchHadithCollections() → merged list from 3 providers, 7d cache
   - fetchHadithBooks(collectionSlug) → HadithAPI-sourced only (9 of 18)
   - fetchHadithsByBook(collectionSlug, bookNum, page)
   - fetchSingleHadith(collectionSlug, hadithId)
   - fetchHadithOfDay()
   Route each to the correct provider per TechSpec §5 table: HadithAPI.com
   collections go through the Cloudflare Worker proxy (key never reaches
   client); fawazahmed0 (40 Nawawi) and the 8 AhmedBaset collections are
   direct keyless fetches — do NOT proxy those, and do NOT add an API key
   parameter to those calls, there isn't one.
3. Apply whichever grade-badge policy Module 0 recorded to the data
   shape itself: if policy (a), the 8 AhmedBaset collection objects
   should carry a `gradeCharacterization` field at the collection level
   and no `perHadithGrade: true` flag; hadith objects from those 8
   collections should NOT include a fabricated `grade` field.
4. localStorage cache keys: reuse the existing `ii-cache-hadith-*`
   pattern already in api.js; add new keys for books/single-hadith/
   collections per TechSpec §6.2 naming convention
   (`islamicinfo-hadith-*`). Wrap every JSON.parse/setItem in try/catch
   per TechSpec §7.4 — corrupt entries get removed, not crashed on.

SCOPE — OUT
- No UI changes in this module. This is data + fetch layer only.
- Do not touch quran.html, index.html, or any other page's api.js usage.
- Do not implement search, narrator data, or AI explain yet (later modules).

RELIGIOUS ACCURACY GATE
Every collection name, Arabic name, compiler name/lifespan, and hadith
count you put in collections.json must be run through the hadith-verifier
skill before it's written to the seed file — these are factual claims
about real classical works, not placeholder content. If a count is
edition-dependent (Mishkat, Bulugh al-Maram, Sunan al-Darimi per PRD
§2.3), keep the PRD's own "verify at build" caveat in a code comment
rather than asserting false precision.

FILES TOUCHED
- /data/collections.json (new)
- api.js (extend only — additive functions)
- DATA.md (append new localStorage keys + Cloudflare KV keys from
  TechSpec §6.1/§6.2 — do not rewrite existing entries)

DEFINITION OF DONE (this module)
- [ ] All 18 collections present with correct source provider per PRD §2.3
- [ ] Stats total is computed from the merged collections list at runtime,
      never hardcoded (PRD explicitly calls this out twice — FIX-9 note
      and US-H02)
- [ ] No API key appears in any client-side code path for fawazahmed0/
      AhmedBaset calls
- [ ] Existing fetchHadith() callers (from Module 0 Task 3 list) still work
- [ ] AhmedBaset collections pinned to a release tag, not `main`, per
      TechSpec §5 licensing caveat — flag license status as unresolved
      in a code comment, don't silently ship to production data

VERIFICATION NOTE (required at end of session)
List which of the 18 collections you ran through hadith-verifier and
what came back CONFIRMED vs UNCERTAIN. List every localStorage/KV key
you added. Confirm you did not modify any file outside the list above.
```

---

## MODULE 2 — Sidebar & Collections Grid (US-H01)
**Covers:** PRD §3.1 US-H01, §4.3 · TechSpec §2.4, §3.1
**Depends on:** Module 1 (collections.json + fetchHadithCollections)

```
§0 — THINK BEFORE CODING · SIMPLICITY FIRST · SURGICAL CHANGES
This module edits hadith.html directly. Before touching it, re-read
CLAUDE.md §27.4 (no shimmer ::after, ever) and the approved card hover
spec (translateY(-5px) scale(1.012) + teal glow, no exceptions).
If Module 0 Task 2 found the 18-collection grid breaks a breakpoint,
that fix belongs in THIS module's CSS, scoped only to .collections-grid
and .sidebar — do not touch unrelated sections of hadith.html's <style>
block while you're in there.

GOAL
Update hadith.html's sidebar and collections grid from 9 → 18 collections,
wired to fetchHadithCollections() from Module 1, replacing the current
hardcoded 9-item markup.

SCOPE — IN
- Sidebar: all 18 collection rows with count badges (.count-badge,
  teal-700 on teal-50), rendered from data not hardcoded HTML. Keep the
  existing CLASSICAL SCHOLARS / READING PATHS / Browse / Verify CTA /
  Ask CTA blocks exactly as they are in the current file — only the
  HADITH COLLECTIONS section is being converted to data-driven.
- Collections grid: 18 cards, each with card-motif, Arabic name
  (font-arabic, gold-700), compiler + lifespan, stats, authenticity
  badge (grade dot + label — apply Module 0's Decision A: collection-
  level characterization badge for the 8 ungraded collections, not a
  fabricated per-hadith grade), "Browse →" link.
- Sahih al-Bukhari card keeps class="collection-card featured" + the
  gold-aura shadow + "✦ Most Authentic" seal — this is locked, do not
  move the seal to another collection.
- Filter tabs (All · Kutub al-Sittah · Musnad · Selected): in-place
  DOM show/hide, no route change, per PRD US-H01. Wire the existing
  .chip markup to actual filtering logic in a new src/js/hadith.js
  (this file doesn't exist yet — create it now, load it after api.js
  in the existing <script src="src/js/hadith.js"> tag that's already
  in hadith.html referencing a file that doesn't exist yet).
- Loading state: skeleton shimmer (a *loading* shimmer is fine — the
  banned shimmer in CLAUDE.md §27.4 is specifically the hover-sweep on
  cards, not a loading skeleton) while fetchHadithCollections() resolves;
  seed-JSON fallback per TechSpec §8 on fetch failure, no visible error.

SCOPE — OUT
- Do not build Tier 2 (/hadith/[collection]) routing yet — "Browse →"
  can be a placeholder href for now; Module 6 wires real navigation.
- Do not build the illustrated per-collection SVG motifs (US-H17) yet —
  use the existing emoji/simple-SVG placeholder motif pattern already
  in the file for the 9 existing cards, extended to the 9 new ones.
  Module 12 replaces these with the final illustrated set.

FILES TOUCHED
- hadith.html (sidebar + .collections-grid sections only)
- src/js/hadith.js (new file)
- No changes to global.js, tokens.css, or api.js beyond what Module 1 did

DEFINITION OF DONE (this module)
- [ ] 18 sidebar rows, 18 grid cards, all rendered from Module 1's data
- [ ] Bukhari featured treatment unchanged
- [ ] Filter tabs functional, in-place, no route change
- [ ] No new CSS colors/radii/easing outside CLAUDE.md tokens (DoD-7
      from PRD §10)
- [ ] Grid and sidebar verified at 1100/900/760/700/440px — this is the
      exact check Module 0 Task 2 flagged; confirm it now for real
- [ ] Grade characterization badges for the 8 ungraded collections show
      no per-hadith grade claim on the collection card

VERIFICATION NOTE (required at end of session)
Confirm which breakpoints you actually tested (not just "should work").
Confirm the 8 ungraded collections show collection-level characterization
only. List the exact diff scope in hadith.html (line ranges touched).
```

---

## MODULE 3 — Stats Strip & Hadith of the Day (US-H02, US-H03)
**Covers:** PRD §3.1 US-H02/US-H03 · TechSpec §2.1 zone 4–5, §4.2

```
§0 — THINK BEFORE CODING
Read Module 1's fetchHadithCollections() and fetchHadithOfDay() before
writing UI code — do not invent a different data shape.

GOAL
Wire .stats-strip and .daily-strip to live data with correct fallbacks.

SCOPE — IN
- Stats strip: 4 metrics — total hadiths (computed live by summing
  Module 1's collections data, never hardcoded), "18 Major Collections"
  (this literal number IS correct now and can be a static string),
  "12+ Languages", "100% Source-Verified". 4-col ≥1100px, 2-col ≤700px,
  1-col ≤440px, per existing CSS — confirm it still holds at these
  breakpoints, don't rewrite the grid unless it's broken.
- .fade-up entrance via IntersectionObserver, threshold 0.12 — reuse
  the existing reveal-observer pattern from global.js if one exists;
  don't invent a second observer pattern for one section.
- Hadith of the Day: fetchHadithOfDay() → render Arabic matn (font-
  arabic, ~24px, RTL), English translation, reference line (collection
  · hadith number · narrator · grade), 3 actions (Bookmark/Share/View
  Full Isnad). Skeleton shimmer during fetch (loading-skeleton, not the
  banned hover shimmer). On fetch failure: static fallback = Bukhari #1
  "actions are judged by intentions" — this is the one hadith you may
  hardcode as a literal fallback string, per TechSpec §8, because it's
  the documented emergency fallback, not a shortcut. Still run it
  through hadith-verifier once before hardcoding it, since it becomes
  permanent fallback content shipped to every user on API failure.
- "View Full Isnad" button: Stage 1 opens the existing Isnad modal
  pattern already scaffolded in the file (Module 4 finalizes it) —
  don't build Tier 3b routing here, that's Module 7.

FILES TOUCHED
- hadith.html (.stats-strip, .daily-strip sections)
- src/js/hadith.js (add renderStatsStrip, renderHotD functions)

DEFINITION OF DONE
- [ ] Total hadith count is a computed sum, not a literal string
- [ ] HotD renders from fetchHadithOfDay() with correct fallback hadith
      on failure, and that fallback hadith has been through hadith-verifier
- [ ] Grade badge on HotD reference line follows Module 0 Decision A if
      the daily hadith happens to come from an ungraded collection

VERIFICATION NOTE (required at end of session)
State whether the fallback Bukhari #1 hadith text was verified this
session or was already verified in a prior session (cite which).
```

---

## MODULE 4 — Hadith Feed, Grade Badges & Grade Filter (US-H04)
**Covers:** PRD §3.1 US-H04, §4.4, §4.5 (FIX-1) · TechSpec §2.5, §2.6

```
§0 — THINK BEFORE CODING · SURGICAL CHANGES
This is the highest-traffic component on the page — most later modules
(bookmarks, notes, AI, isnad, trace view) attach to .hadith-card. Get
the base structure exactly right before any later module builds on it.
Do not restructure .hadith-card's DOM shape once this module ships —
later modules should only ever ADD sibling elements below the card
(isnad-preview, ai-card, note-editor), never restructure the header/
body/footer you build here.

GOAL
Render the hadith feed for the active collection/book with the full
card anatomy and grade filter, and fix the dark-mode grade-badge
contrast failures flagged in PRD FIX-1.

SCOPE — IN
- Default view: Sahih al-Bukhari, Book 1 — Revelation, loaded via
  Module 1's fetchHadithsByBook('bukhari', 1).
- Card anatomy exactly per TechSpec §2.5: .hadith-teal-bar (4px left,
  var(--teal-700)) → header (.hadith-num + .grade-badge with
  .grade-dot + text + .grader-label, e.g. "· Darussalam"; 3 action
  icons Bookmark/Share/Copy — icons only, wiring comes in Module 10)
  → .hadith-arabic (Amiri, RTL, line-height 2.05) → .hadith-translation
  (.hadith-narrator line + "┃" teal-bar + text, with a Prophet ﷺ salawat
  span) → footer (.hadith-ref + View Isnad/Listen/Open Full View —
  Isnad wiring in Module 5, Listen in Module 10, Open Full View routes
  to Tier 3b in Module 7, placeholder href until then).
- Grade badge CSS — apply TechSpec §2.6's corrected token table exactly:
  light mode #0F6E56/#4A7030(recommended)/#8A5228(recommended)/#B33A3A;
  dark mode #1FA882/#7AB84E/#D4884A/#E05555. The current CLAUDE.md
  --grade-hasan/--grade-daif light values (#5D8A3A / #A86932) FAIL
  WCAG AA per the TechSpec's own contrast math (3.37:1 / 3.64:1). This
  is a design-system-level token, not a one-off — update the token
  values in CLAUDE.md's :root block section 1 AND note the change in
  DECISIONS.md, since other pages may reference --grade-* too (grep
  first, per SKILL.md §18 "grade colors only used on IslamicInfo.org
  and QuranlyAI" — check if QuranlyAI-facing code also references these
  tokens before changing them).
- Add the missing [data-theme="dark"] overrides for all 4 grades —
  this is mandatory before Stage 1 ships per both source docs.
- Grade filter pills (All/Sahih/Hasan/Da'if — no Mawdu' pill per
  blueprint, that grade only appears inline if a fabricated narration
  is ever shown, which should be rare/flagged): in-place filter,
  aria-live region announcing result count, ?grade= URL param per
  TechSpec §5.1 for deep-linkability.
- "Load more hadiths": ?page=N pagination, appends without re-rendering
  existing cards (this exact non-regression behavior is a named unit
  test in TechSpec §14.1 — hadith-feed.js).
- Musnad Ahmad edge case (TechSpec §10): no fixed book structure —
  handle missing `book` field, render flat feed, breadcrumb-ready label
  "Musnad Ahmad › Hadith N" without a book segment (breadcrumb itself
  is Module 9, just don't let the missing book field crash rendering
  here).

RELIGIOUS ACCURACY GATE
Every hadith rendered — Arabic text, translation, grade, grader name —
must come verbatim from Module 1's provider data, never paraphrased or
reconstructed. If you need sample/seed hadiths for local dev before the
live API is wired, run each one through hadith-verifier before putting
it in a fixture file; do not write a "close enough" placeholder hadith.

FILES TOUCHED
- hadith.html (.hadith-list section + <style> grade-badge block)
- CLAUDE.md (§1 :root token correction — flag clearly in DECISIONS.md)
- src/js/hadith.js (renderHadithCard, filterByGrade, loadMore)

DEFINITION OF DONE
- [ ] All 4 grade colors pass WCAG AA 4.5:1 in BOTH themes (this is a
      named CI test: grade-badge-contrast.test.ts in TechSpec §14.1 —
      write it if a test harness exists in the repo, flag if it doesn't)
- [ ] Grade badge always shows a named grader; ungraded-collection
      hadiths show Module 0 Decision A's treatment, never a fabricated name
- [ ] Filter is in-place, deep-linkable via ?grade=
- [ ] "Load more" doesn't re-render existing cards
- [ ] Musnad Ahmad's missing book field doesn't crash the feed

VERIFICATION NOTE (required at end of session)
State the exact contrast ratios you computed for each of the 8 grade-
color/theme combinations. Confirm CLAUDE.md's token change was recorded
in DECISIONS.md with the before/after values and who it affects.
```

---

## MODULE 5 — Isnad Modal v1, Topics Strip & Hero Search (US-H05, US-H06, US-H07)
**Covers:** PRD §3.1 US-H05/06/07 · TechSpec §2.1 zones 2 & 7, §3.3

```
§0 — THINK BEFORE CODING
Stage 1 closes with this module. Re-read the Stage 1 acceptance
criteria in PRD §3.1 in full before starting, and don't start Stage 2
work even if it seems like a natural next step — Module 6 depends on
routing decisions this module doesn't make.

GOAL
Finish the three remaining Stage 1 components.

SCOPE — IN
1. Isnad modal v1 (US-H05): "View Isnad" footer button toggles
   .isnad-preview (id="isnad-{N}") below the card. Chain: Prophet ﷺ →
   Companion → Tabi'i → ... → Compiler. Each node: avatar circle
   (Arabic initials, role-colored: prophet/companion/tabii/compiler),
   full name, lifespan/era, reliability dot only (green=Thiqah,
   gold=Saduq, red=Da'if) — no text panel yet, that's Module 8 (Isnad
   v2). Connector: 1px dashed rgba(0,105,110,.25). CSS max-height
   transition (0.38s ease-reverent), no layout reflow.
2. Topics strip (US-H06): 14 topic chips verbatim from blueprint list
   (Faith & Belief featured, Prayer, Zakat, Fasting, Hajj, Purification,
   Knowledge, Ethics, Family, Supplications, Afterlife, Trade, Death,
   Governance). Stage 1: clicking filters the hadith feed in-place via
   data-topic attribute matching, no route change. "View all topics →"
   link exists in markup but is a placeholder href until Module 11
   builds /hadith/topics.
3. Hero search (US-H07): glass search pill, backdrop-filter blur,
   microphone icon (voice input — Web Speech API if available, silently
   no-op if not, never throw), scope selector chips (All/Hadith/Qur'an/
   Dua/Verify ✦). Results: hadith reference, Arabic snippet with <mark>
   highlight, English snippet with <mark> highlight, grade badge,
   "Open →" (placeholder href to Tier 3b until Module 7). Wire to a
   stub search function now that calls Module 1's data locally
   (client-side substring match against loaded feed data) — the real
   /api/hadith/search proxy from TechSpec §4.4 is out of scope here,
   flag it as a follow-up in TASKS.md rather than building a fake
   network call.

SCOPE — OUT
- No real backend search proxy (documented above)
- No topic landing pages (/hadith/topics/[topic]) — Stage 3, Module 11

RELIGIOUS ACCURACY GATE
Narrator names and role classifications (prophet/companion/tabi'i/
compiler) in the isnad chain must come from the actual isnad data
returned by the provider APIs (Module 1), never inferred or guessed
by pattern-matching a name. If a narrator's role can't be determined
from source data, render them as an unlabeled node rather than guessing
a role — this mirrors the "never fabricate reliability grade" rule in
TechSpec §10 edge cases, applied to role classification too.

FILES TOUCHED
- hadith.html (.isnad-preview markup, .topics-grid, hero search pill)
- src/js/hadith.js (toggleIsnad, filterByTopic, searchStub)

DEFINITION OF DONE (Stage 1 complete after this module)
- [ ] All Stage 1 US-H01–H07 acceptance criteria pass
- [ ] Isnad chain shows reliability dots only (text panel deferred correctly)
- [ ] Topic filter and search both in-place, no premature routing
- [ ] Full CLAUDE.md §24 enforcement checklist passes on the page

VERIFICATION NOTE (required at end of session)
Confirm Stage 1 is fully closed — list any US-H01–H07 criterion you
could NOT complete and why, rather than marking it done regardless.
```

---

# STAGE 2 — LIBRARY NAVIGATION

## MODULE 6 — Tier 2: Book List Page (US-H08)
**Covers:** PRD §3.2 US-H08 · TechSpec §2.1, §4 error handling

```
§0 — THINK BEFORE CODING · GOAL-DRIVEN EXECUTION
This is the first real routing module. Before writing routing code,
confirm with the existing project architecture (check
docs_architecture_ARCHITECTURE.md if present) whether this is a
static-multi-page-per-route build or a client-side router — do not
assume one over the other; if ARCHITECTURE.md is silent, ask rather
than picking arbitrarily, since every later Tier 2/3 module depends
on this choice.

GOAL
"Browse →" on any collection card routes to /hadith/[collection]
rendering a books grid.

SCOPE — IN
- Collection header strip: display-lg collection name, Arabic name
  (font-arabic gold-700), compiler lifespan, "↩ All Collections" button
  back to Tier 1.
- Books grid: 3-col ≥1100px, 2-col ≤900px, 1-col ≤700px. Book card:
  number chip (font-mono, gold-50 bg, gold border), English name
  (Inter 600 15px), Arabic name (font-arabic 13px gold-700), hadith
  count badge, "Browse hadiths →" → Tier 3a.
- Hover: translateY(-4px) scale(1.012) + elev-3 (matches mockup —
  slightly different translate distance than the -5px card standard,
  this is intentional per PRD, don't "correct" it to match .card default)
- Edge case (TechSpec §10): Riyad as-Saliheen and 40 Nawawi have no
  bookNum structure — for these two, "Browse →" skips Tier 2 entirely
  and goes straight to Tier 3a. Musnad Ahmad also lacks fixed books —
  same treatment.
- Error state (TechSpec §8, FIX-4): book list fetch failure → "Books
  temporarily unavailable — try again" empty-state card + retry button;
  "↩ All Collections" stays functional regardless of fetch state.

FILES TOUCHED
- hadith.html or new route template (per architecture decision above)
- src/js/hadith.js (loadBooksGrid, retry handler)

DEFINITION OF DONE
- [ ] Correct breakpoint columns (3/2/1 at 1100/900/700)
- [ ] Riyad as-Saliheen, 40 Nawawi, Musnad Ahmad skip Tier 2 correctly
- [ ] Fetch failure shows retry state without breaking breadcrumb/back nav

VERIFICATION NOTE (required at end of session)
State which architecture pattern you used (routed pages vs SPA-style)
and why, if ARCHITECTURE.md didn't specify.
```

---

## MODULE 7 — Tier 3a Hadith-in-Book List & Tier 3b Deep-View Page (US-H09, US-H10)
**Covers:** PRD §3.2 US-H09/H10, §4.7 · TechSpec §2.7

```
§0 — THINK BEFORE CODING
Reuse Module 4's .hadith-card component as-is for Tier 3a — do not
build a second card component. Tier 3b (deep-view) is the one place
that legitimately needs an enlarged variant; keep it a CSS/size
variation of the same markup shape, not a parallel structure.

GOAL
Build the scoped hadith-in-book list (Tier 3a) and the single-hadith
deep-view page (Tier 3b) — the canonical, shareable URL for every hadith.

SCOPE — IN
Tier 3a (/hadith/[collection]/[book]):
- Sticky header: "Collection › Book name · N hadiths"
- Same .hadith-card component as Module 4, each now with a working
  "Open →" action routing to Tier 3b
- Grade filter pills remain available; Prev/Next book nav at bottom

Tier 3b (/hadith/[collection]/[book]/[hadith]):
- Block order exactly per TechSpec §2.7: page header (breadcrumb +
  🔖/↗/📋 buttons — wiring in Module 10) → hadith body card (enlarged
  Arabic 24px+) → isnad chain INLINE (not modal — this is a deliberate
  difference from the feed card) → alternate gradings table (min 2
  scholars, e.g. "al-Albani: Sahih", "Darussalam: Sahih" — real
  citations from provider data, never invented) → translations tabs
  (EN/UR/FR/ID/TR, preference saved to localStorage) → topics chips →
  related narrations (placeholder section, Module 11 fills it) →
  Previous/Next hadith nav within the same book.
- This route is the Lighthouse CI benchmark page (bukhari/1/1) — keep
  an eye on bundle size/lazy-loading from the start rather than
  retrofitting performance later (PRD DoD-15, TechSpec §11).
- Error handling (FIX-4): per-block "—" fallback on partial fetch
  failure; "Hadith temporarily unavailable" on the body block
  specifically; Prev/Next stays functional even if the current
  hadith's data partially failed.

RELIGIOUS ACCURACY GATE
Alternate gradings table entries are direct scholarly citations. Each
one you populate (scholar name + grade text + source) must be verified
via hadith-verifier before it ships — this is exactly the kind of
"disputed grade" case the skill's Special Cases section covers. If
only one scholar's grade is available from provider data, do not
invent a second one to satisfy "min 2 scholars" — ship with one and
flag the gap rather than fabricating.

FILES TOUCHED
- New Tier 3a / Tier 3b templates or routes (per Module 6's architecture)
- src/js/hadith.js (deep-view render + translation tab switch)

DEFINITION OF DONE
- [ ] Every hadith has a canonical, shareable URL
- [ ] Deep-view block order matches TechSpec §2.7 exactly
- [ ] Alternate gradings never show a fabricated second scholar
- [ ] Lighthouse Performance/Accessibility/Best-Practices/SEO ≥ 90 on
      this route (PRD DoD-15) — run it, don't assume

VERIFICATION NOTE (required at end of session)
Report actual Lighthouse scores if you were able to run them in this
environment; if not, say so explicitly rather than claiming a number.
List which alternate-gradings entries were verified vs left single-
sourced.
```

---

## MODULE 8 — Narrator Reliability Panel / Isnad v2 (US-H11)
**Covers:** PRD §3.2 US-H11, §4.6 · TechSpec §3.3, §4.3

```
§0 — THINK BEFORE CODING
This module is the single highest religious-accuracy-risk component on
the page — it renders named scholarly judgments about named historical
narrators. Read TechSpec §7.1 and §7.5 rule 3 in full before writing
any narrator data.

GOAL
Each narrator row in the isnad chain (built in Module 5) becomes
clickable, expanding an inline reliability panel.

SCOPE — IN
- Click narrator row → inline .narrator-panel below that row (not a
  modal): avatar, full name, kunya + nasab (italic 13px), lifespan +
  place, reliability grade badge (Thiqah green / Saduq gold / Da'if
  red / Unknown grey), scholar gradings table.
- Scholar gradings table: minimum 3 rows — Ibn Hajar al-'Asqalani,
  al-Dhahabi, al-Mizzi — columns: scholar name, grade text (e.g.
  "Thiqah thabt"), source citation in font-mono 11px (e.g. "Taqrib
  at-Tahdhib, no. 4686").
- Data source: /data/narrator/{id}.json, seeded from Taqrib at-Tahdhib
  and Tahdhib al-Kamal per TechSpec §4.3. Lazy-fetch on first panel open.
- If graderCitations[] is empty for a narrator: render "No scholar
  citations available for this narrator" — never fabricate a citation
  to fill the 3-row minimum. The "minimum 3 rows" is a target for
  well-documented narrators, not a requirement to invent rows.
- If a narrator in the chain isn't in the narrator DB at all: grey dot
  (.rel-unknown), tooltip "Unknown narrator" — per TechSpec §10 edge case.

RELIGIOUS ACCURACY GATE — mandatory, not optional, for this module
Every single graderCitations[] entry you write into /data/narrator/*.json
must go through hadith-verifier and be traced to Taqrib at-Tahdhib,
Tahdhib al-Kamal, or Siyar A'lam an-Nubala' with a real folio/entry
number (PRD DoD-9: "Narrator reliability grading audit: every
reliability text traces to a named classical work. No fabricated
gradings."). This is called out as a Product + Scholarly Review DoD
item, not just an engineering one — flag clearly in your session output
which narrator entries still need human scholarly sign-off before
this ships, even if the citations look plausible to you.

FILES TOUCHED
- /data/narrator/*.json (new files, one per seeded narrator)
- hadith.html (.narrator-panel markup — nested .card, inner-light shadow)
- src/js/hadith.js (loadNarrator, toggleNarratorPanel)

DEFINITION OF DONE
- [ ] Zero fabricated gradings — every citation traces to a named work
- [ ] Missing-citation and unknown-narrator states both handled per spec
- [ ] Panel is a nested .card with inner-light shadow, not a new shadow token

VERIFICATION NOTE (required at end of session — this one matters most)
For every narrator entry created this session, list: name, which
scholars' gradings were included, and the exact source citation for
each. Explicitly flag this data as "pending human scholarly review"
per CONTENT-POLICY.md's mandatory human review gate — do not present
it as final/ship-ready in this note.
```

---

## MODULE 9 — Breadcrumbs, Deep Links & Continue Reading (US-H13, US-H23b / FIX-5)
**Covers:** PRD §3.2 US-H13, §3.3 US-H23b · TechSpec §3.4, §3.5

```
§0 — THINK BEFORE CODING
Two independent features share this module because they both revolve
around "where is the user in the corpus" — implement them together so
they don't fight over the same scroll/routing logic, but keep the code
paths separable (breadcrumbs must work even with last-read disabled/
cleared).

GOAL
Add breadcrumb navigation on all Tier 2+ routes, canonical deep-link
handling with pulse-ring, and last-read restoration with a "Continue
Reading" hero prompt.

SCOPE — IN
Breadcrumbs (US-H13):
- .breadcrumb strip below sticky header on Tier 2+: "Hadith › Sahih
  al-Bukhari › Book of Revelation › Hadith 1", caps-xs Inter, ink-muted,
  gold-700 "›" separators, each segment a working link.
- Mobile ≤700px: collapse middle segments to "..."
- Deep-link pulse: on load with an explicit collection/book/hadith in
  the URL, scroll to that card, apply 2-iteration gold pulse-ring
  (1.8s ease-reverent). prefers-reduced-motion: border-color highlight
  only, no animation — reuse the exact reduced-motion block already
  specified in TechSpec §3.14, don't write a second one.

Continue Reading / Last-Read (US-H23b, FIX-5):
- IntersectionObserver (throttled 1s, threshold 0.5) tracks topmost
  visible .hadith-card; a hadith counts as "read" after ≥3 continuous
  seconds visible (IO + setTimeout combo, not IO alone).
- Persist {collectionSlug, bookNum, hadithNum, timestamp} to
  localStorage['islamicinfo-hadith-last-read'] on read.
- On page load with NO explicit collection/book/hadith in the URL:
  pre-select last-read collection in sidebar, scroll feed to last-read
  position.
- Hero "Continue Reading" prompt: only shown when last-read data
  exists AND the user did not arrive via a shared deep-link URL —
  explicit URL always takes precedence and suppresses this prompt
  (this exact precedence rule is a named edge case in TechSpec §10,
  don't invert it).
- Clicking the prompt fires the same 2-iteration gold pulse-ring as
  the deep-link case above — reuse the same animation function, don't
  duplicate it.

FILES TOUCHED
- hadith.html (.breadcrumb markup, hero Continue Reading slot)
- src/js/hadith.js (breadcrumb render, last-read IO tracker, pulse-ring fn)

DEFINITION OF DONE
- [ ] Explicit deep-link URL always wins over last-read restoration
- [ ] 3-second read threshold verified (not 2s — this is a named unit
      test in TechSpec §14.1: reading-progress.js)
- [ ] Reduced-motion users get border highlight, never the animation
- [ ] Mobile breadcrumb ellipsis collapse works at ≤700px

VERIFICATION NOTE (required at end of session)
Confirm you tested the "arrived via shared link + has stale last-read
data" case specifically, since it's the one place two features could
silently conflict.
```

---

## MODULE 10 — Per-Hadith Action Suite: Bookmarks, Notes, Audio, Verify/Ask CTAs (US-H12, US-H23 Stage-2 rows)
**Covers:** PRD §3.2 US-H12, §3.4 US-H23 (Bookmark/Notes/Listen rows) · TechSpec §2.4 items 6–7, §3.6–3.9

```
§0 — THINK BEFORE CODING · SURGICAL CHANGES
Four features in one module because they're all "wire up an icon that
was already sitting in the card markup since Module 4." Do not touch
the card's header/body/footer structure itself — only attach behavior
to the existing icon buttons and inject sibling elements below the
card (note-editor, audio-mini-player) exactly as Module 4's DEFINITION
OF DONE required.

GOAL
Wire Bookmark, Notes, Audio, and the two sidebar CTAs (Verify a Source /
Ask a Question) to real behavior.

SCOPE — IN
Bookmark:
- Toggle filled/unfilled + category tooltip (General/For Memorisation/
  Reflection/To Verify/+New, max 5 custom categories), 2.5s auto-dismiss.
- Storage: Array<HadithBookmark> in localStorage['islamicinfo-hadith-
  bookmarks']. Gold dot on .hadith-num badge when bookmarked. Idempotent
  toggle (second click removes, per TechSpec §10 edge case).
- Bookmarks panel: slide from right, chip filter row, Jump (→) button
  → scroll to hadith + pulse-ring (reuse Module 9's pulse function).

Notes:
- Toggle .note-editor below card, textarea min 72px, Save/Cancel.
- Max 2000 chars, enforced client-side (maxlength) — server-side check
  is N/A since this is localStorage-only in Stages 1–4 per PRD §9 Out
  of Scope.
- Storage: Array<{hadithRef, text, updatedAt}> in localStorage
  ['islamicinfo-hadith-notes']. Gold dot on .hadith-num badge on save.
  Cancel discards without persisting.

Audio:
- "Listen" injects .audio-mini-player: play/pause, progress bar,
  speed selector (0.75×/1×/1.25×/1.5×), reciter name ALWAYS visible
  (never renders undefined — this is a named content-safety rule,
  TechSpec §7.5 rule 5). Waveform animation during playback.
  Auto-advance option loads next hadith in feed on `audio.ended`.
- CDN 404/error: "Audio unavailable for this hadith" inline, player
  controls stay visible but disabled appropriately.
- Single global <audio> element; cleanup on navigation and beforeunload.

Verify/Ask CTAs:
- "Verify a Source" → /verify, always.
- "Ask a Question": on Tier 3 routes, encode current hadith
  {matn, collection, book, hadithNum} → /verify?claim=[encoded] with
  input pre-filled; on Tier 1 (collections grid) → /verify empty,
  input focused, no pre-fill.

localStorage INTEGRITY (TechSpec §7.4 — applies to all of the above)
Wrap every JSON.parse in try/catch → removeItem + empty default on
failure. Wrap every setItem in try/catch → catch QuotaExceededError →
toast "Storage full — clear some bookmarks or notes" → never silently
lose existing data. Deduplicate any array-of-refs with Set before
persisting.

FILES TOUCHED
- hadith.html (bookmarks panel markup, sidebar CTA hrefs)
- src/js/hadith.js (bookmark toggle, note editor, audio player, CTA wiring)

DEFINITION OF DONE
- [ ] Bookmark toggle idempotent; max 5 custom categories enforced
- [ ] Notes max 2000 chars enforced; cancel never persists
- [ ] Reciter name never renders undefined; CDN 404 handled gracefully
- [ ] QuotaExceededError shows toast and preserves existing data
- [ ] Ask a Question pre-fills correctly on Tier 3, empty on Tier 1

VERIFICATION NOTE (required at end of session)
Confirm you tested the QuotaExceededError path (simulate a full quota)
rather than assuming the try/catch works.
```

---

# STAGE 3 — SCHOLARLY TOOLING

## MODULE 11 — Topic Index, Topic Landing Pages & Related-Hadith Graph (US-H14, US-H15)
**Covers:** PRD §3.3 US-H14/H15 · TechSpec (Stage 3 sections)

```
§0 — THINK BEFORE CODING
Topic chips already exist and filter in-place since Module 5. This
module changes their Stage-1 in-place behavior to Stage-3 routing —
confirm you're not leaving both behaviors half-wired (PRD is explicit:
"From Stage 3 onward: clicking a topic chip routes instead of
filtering in-place").

GOAL
Build /hadith/topics (index) and /hadith/topics/[topic] (landing page),
and the related-hadith graph on every Tier 3b deep-view page.

SCOPE — IN
Topic index (/hadith/topics):
- 16 topic cards (note: 2 more than the 14 hero-strip chips — confirm
  the additional 2 against PRD §3.3 wording before inventing which
  ones; if the PRD doesn't name all 16 explicitly, flag the gap rather
  than guessing 2 topics).
- Each card: icon (reuse existing vocabulary, don't invent new icons),
  topic name, hadith count across all collections, top-3 contributing
  collection chips, "Study this topic →".

Topic landing (/hadith/topics/[topic]):
- Header: display-lg + 2-line scholarly italic summary (this summary
  text is editorial content about the topic — treat it like any other
  Islamic-content claim: source it, don't improvise scholarly framing).
- Key Narrations strip: 3 .card-featured hadith cards
- Study order: numbered list, teal circle + serif numeral + hadith
  preview + grade badge + "Open →"
- Right rail: related topics chips
- Filtered hadith feed for that topic (reuse Module 4's feed component)

Related-hadith graph (Tier 3b, below Topics section):
- .related-grid, 4 cards (2-col ≥900px, 1-col below): "Thematically
  related" / "Same narrator" / "Parallel narration" / "Scholar
  commentary" — each: relation label (italic gold-700), 2-line matn
  preview, reference, arrow → that hadith's deep-view.
- Filter chips above: by topic / by narrator / by collection.
- Data source: /api/hadith/{collection}/{id}/similar (HadithAPI-sourced
  collections only per TechSpec §5 — the 8 AhmedBaset collections won't
  have a "similar" endpoint; for those, either omit the related section
  gracefully or compute a simple topic-tag match client-side — do not
  fabricate a "same narrator" relationship without real chain data.

RELIGIOUS ACCURACY GATE
Topic landing page summaries and "Scholar commentary" related-cards are
editorial content that reads as scholarly framing. Route these through
hadith-verifier / the general islamic-authenticity review process
before publishing — this is exactly the kind of content CONTENT-POLICY.md's
human review gate exists for.

FILES TOUCHED
- New topic index/landing templates or routes
- hadith.html (related-grid markup on Tier 3b, topic chip hrefs updated
  from Module 5's in-place filter to real links)
- src/js/hadith.js (topic index/landing render, related-graph fetch)

DEFINITION OF DONE
- [ ] Topic chip behavior fully switched from in-place filter to routing
- [ ] Related graph never fabricates a relationship for ungraded-
      collection hadiths lacking real similarity data
- [ ] Topic landing summaries flagged for human review, not auto-published

VERIFICATION NOTE (required at end of session)
List the 16 topics you used and flag whether all 16 came from an
explicit PRD source or whether any were inferred to fill the count.
```

---

## MODULE 12 — Copy with Attribution, Translation Compare & Illustrated Collection Motifs (US-H16, US-H23 translation row, US-H17)
**Covers:** PRD §3.3 US-H16/H17, §3.4 US-H23 · TechSpec §3.11

```
§0 — THINK BEFORE CODING · SIMPLICITY FIRST
Three features, but they're all "finishing touches" on components that
already exist (card action row, translations tabs stub from Module 7,
placeholder card motifs from Module 2) — resist the urge to redesign
anything while finishing it.

GOAL
Wire real copy-with-attribution behavior, translation comparison, and
replace the placeholder collection-card motifs with the final 18
illustrated SVGs.

SCOPE — IN
Copy with attribution (US-H16):
- Exact payload format, character-for-character:
  `"{translation text}" — Narrated by {primary narrator}. {Collection}
  · Book {N} · Hadith {N}. Grade: {grade} ({grader}, {year}). Source:
  https://islamicinfo.org/hadith/{collection}/{book}/{hadith}`
- Arabic-only copy option: copies only .hadith-arabic text.
- Toast: "Copied with citation ✦", 2.5s, slides from bottom, reuse
  the existing toast component from elsewhere in the codebase — do
  not build a second toast implementation.
- Attribution is never optional/strippable — the ONLY reduced-copy
  option is the separate Arabic-only button, per TechSpec §7.5 rule 4.
  Grade for the 8 ungraded collections in this payload should reflect
  Module 0 Decision A (characterization, not a fabricated per-hadith
  grade + fake grader name).

Translation compare (US-H23 row):
- Panel with up to 4 stacked translations (English/Darussalam, English/
  USC-MSA, English/Siddiqui + multilingual where available), primary
  highlighted, preference saved to localStorage.
- Only show translations actually present in provider data — do not
  render a translation edition that doesn't exist for a given hadith
  just to fill the "up to 4" slot.

Illustrated motifs (US-H17):
- 18 custom SVGs, 64×64px inline, monochrome line art + gold-500
  accent only, readable at 32×32, currentColor stroke, no fills beyond
  the gold accent. Styles per PRD: 8-pointed star variants, arabesque
  corners, calligraphic ligatures.
- Commit to /packages/ui/src/illustrations/hadith/{collection-slug}.svg
  (18 files) — adjust the path if this project's actual asset directory
  differs from the PRD's assumed monorepo path; check the real project
  structure first rather than creating a path that doesn't match how
  other pages store SVG assets.
- Verify dark-mode legibility for every one of the 18 (gold accent
  against dark surface) — this is a per-asset check, not a one-time
  spot check.

FILES TOUCHED
- src/js/hadith.js (copy handler, translation tab logic)
- /packages/ui/src/illustrations/hadith/*.svg (18 new files, or the
  project's actual equivalent path)
- hadith.html (swap placeholder motifs for final SVGs in collection cards)

DEFINITION OF DONE
- [ ] Copy payload matches the spec format exactly, verified against a
      real example, not just eyeballed
- [ ] No translation edition rendered that isn't actually present in data
- [ ] All 18 motifs legible in both themes at 32×32 and 64×64

VERIFICATION NOTE (required at end of session)
Paste one full example of the copy-with-attribution output for a real
hadith and confirm it matches the spec template character-for-character.
```

---

## MODULE 13 — AI Explanation for Hadith (US-H23 AI row)
**Covers:** PRD §3.4 US-H23 AI Explanation row · TechSpec §3.10, §4.1, §4.5, §7.5, §8

```
§0 — THINK BEFORE CODING
This module talks to a real LLM endpoint and outputs Islamic content
programmatically at scale — treat every requirement here as load-
bearing, not stylistic. Re-read CONTENT-POLICY.md's human-review gate
and the "no fatwas, ever" hard constraint from skills_main_SKILL.md §1
before writing the system prompt.

GOAL
Wire the ✦ AI Explanation button to a server-side proxy with a
non-overridable system prompt and a content-safety filter.

SCOPE — IN
- ✦ AI button (last in .hadith-actions) → .ai-card slides up (0.38s
  ease-reverent) with skeleton shimmer (loading state, not the banned
  hover shimmer) → fetch via Web Worker → POST /api/explain
  {type:'hadith', id: hadithRef, content: arabicMatn + translation,
  language}.
- AbortController 10s timeout. On timeout: "Explanation unavailable —
  please try again" in .ai-card, retry button, ✕ close always present
  (must work even mid-error, per TechSpec §8).
- Server-side system prompt — hardcoded, non-overridable by any client
  input, exactly this shape per TechSpec §4.1: a hadith study assistant
  that explains meaning/vocabulary/scholarly context/practical lesson,
  never issues a fatwa or ruling, never fabricates narrators/sources/
  chains, cites named classical scholars only when accurate. Do not let
  any client-supplied `language` or `content` field alter the system
  prompt itself — those are user-content parameters, not prompt
  parameters.
- Post-process filter (TechSpec §4.5, §7.5): regex-strip/reject fatwa
  patterns ("is permissible", "is forbidden", "is halal/haram" as
  rulings) server-side before the response ever reaches the client. On
  a match: return {safe: false, fallback: "Unable to generate
  explanation for this hadith."} — the client never sees the raw
  flagged text, even to log it for debugging in a way that could leak
  into the UI.
- Rate limit: 20 requests/IP/hour, 429 with Retry-After.
- Cache: Cloudflare KV key hadith_explain:{hadithRef}:{lang}, TTL 24h
  (server-side only — no client-side AI cache on this page, per
  TechSpec §4.1's explicit "not Redis, this project runs on Cloudflare"
  correction).
- Render: plain paragraphs (summary/vocabulary/context/practical
  lesson) + "✦ Powered by QuranlyAI" footer link to quranlyai.com.

RELIGIOUS ACCURACY / SAFETY GATE — this is the core of the module
Write the adversarial test cases yourself before calling this done:
try prompts designed to elicit a ruling ("is it haram to skip this
hadith's advice"), a fabricated narrator, or an attempt to override
the system prompt via the `content` field. Confirm the filter catches
them. PRD DoD-10 explicitly requires this: "AI Explanation system
prompt verified as non-overridable. Fatwa/ruling detection strip
tested with adversarial prompts."

FILES TOUCHED
- Backend: /api/explain proxy handler (wherever other API proxies for
  this project live — check ARCHITECTURE.md / how Verify's POST
  /api/verify or Islamic Studies' /api/ask-claude are implemented, and
  match that pattern rather than inventing a new backend convention)
- hadith.html (.ai-card markup)
- src/js/hadith.js (AI button handler, Web Worker fetch)

DEFINITION OF DONE
- [ ] System prompt is server-side only, never sent to or alterable
      by the client
- [ ] Adversarial test set (fatwa-elicitation, fabrication-elicitation,
      prompt-override attempts) run and documented as passing
- [ ] Rate limit enforced with correct 429/Retry-After behavior
- [ ] "✦ Powered by QuranlyAI" always visible in rendered output

VERIFICATION NOTE (required at end of session)
List every adversarial prompt you tested and the actual result for
each — not "should be fine," the literal output or filtered result.
```

---

# STAGE 4 — SIGNATURE FEATURES

## MODULE 14 — Hadith Trace View (US-H18)
**Covers:** PRD §3.4 US-H18, §4.8 (FIX-3) · TechSpec §2.8

```
§0 — THINK BEFORE CODING
PRD FIX-3 already resolved a spec conflict for you: the Functional
Document originally specified 4 columns, but the locked HTML blueprint
implements 3. The 3-column blueprint is canonical for this web build —
do not "restore" a 4th column because the Functional Document mentions
it; that document's 4-column layout is explicitly scoped to future
mobile-app planning, not this page.

GOAL
Build the signature 3-column research view: Matn · Isnad · Scholarly
Grading, both as a full route and as a full-screen overlay.

SCOPE — IN
- Entry points: "View as Trace →" on any deep-view page (routes to
  /hadith/trace/[collection]/[book]/[hadith]) AND a button in the
  hadith card action row that opens the same layout as a full-screen
  overlay without a route change.
- Layout: 3-column grid, 1fr:1.2fr:1fr at ≥1300px, stacks at ≤900px,
  each column scrolls independently.
- LEFT (Matn): Arabic matn (Amiri 18px+, RTL, teal-tinted bg,
  border-radius 12px) → "┃" teal-bar translation (CG italic 17px) →
  topic chips → related Qur'anic verses if any (only if real cross-
  references exist in data — don't invent a Qur'an-hadith link).
- CENTRE (Isnad): full vertical chain, dashed connectors, each narrator
  clickable → reliability panel slides from inline-start (reuse Module
  8's narrator panel component, don't rebuild it for this layout).
  Chain divergence markers ◆ gold-500 where applicable.
- RIGHT (Scholarly Grading): grade block (grade-sahih green bg + grade
  text + scholar commentary citation) → Ibn Hajar commentary box →
  Imam an-Nawawi commentary box → 2 related narration links.
- Persistent top bar: breadcrumb | 🔖/↗/📋 (.trace-act buttons, reuse
  Module 10/12 handlers) | "Exit Trace View →" (teal button, returns to
  the deep-view page at the same hadith).
- Focus trap required (PRD DoD-13): Tab must stay within .trace-layout;
  Escape closes; focus returns to the trigger element. This needs
  manual VoiceOver + NVDA verification per TechSpec §14.4, not just an
  automated axe-core pass.

RELIGIOUS ACCURACY GATE
"Ibn Hajar commentary box" and "Imam an-Nawawi commentary box" render
named scholars' actual commentary (sharh) on a specific hadith — this
is a direct scholarly attribution, same bar as the narrator panel in
Module 8. Verify each commentary excerpt via hadith-verifier before
it ships; if no verified commentary exists for a given hadith, show an
honest "commentary not yet available" state rather than a generic
paraphrase attributed to a named scholar.

FILES TOUCHED
- New /hadith/trace/[collection]/[book]/[hadith] route
- hadith.html (overlay-mode trigger + .trace-layout markup)
- src/js/hadith.js (trace view render, focus trap, exit handler)

DEFINITION OF DONE
- [ ] 3-column layout matches blueprint exactly (not the 4-column
      Functional Doc version — FIX-3 is settled, don't reopen it)
- [ ] Focus trap verified with VoiceOver AND NVDA, not just axe-core
- [ ] No fabricated scholar commentary — verified or honestly absent

VERIFICATION NOTE (required at end of session)
Confirm which screen readers you were actually able to test focus trap
with in this environment; if manual AT testing isn't possible here,
say so and flag it as an outstanding QA task rather than marking it done.
```

---

## MODULE 15 — Comparison Mode (US-H19)
**Covers:** PRD §3.4 US-H19 · TechSpec §3.13

```
§0 — THINK BEFORE CODING
Comparison mode reads as "diff this narration against that one" — the
diff-highlighting must be textually honest. Do not highlight stylistic
translation differences as if they were narration-level (matn)
differences; that would misrepresent two translations of the same
narration as two different narrations.

GOAL
Let users select 2–3 hadiths and compare matn + isnad side by side.

SCOPE — IN
- Entry: "Add to comparison" in card action menu → comparison drawer
  at bottom (max 3 items, Set-based, no duplicates).
- "Compare →" activates at 2+ items, routes to /hadith/compare.
- Header: "Comparing" + removable chips (× button) + "+ Add Hadith".
- Layout: 2 or 3 equal columns (tabs on ≤900px instead of columns).
  Each column: collection + number label, Arabic matn, "┃" teal-bar
  translation.
- .diff-highlight (gold-50 bg, 3px radius) on textually differing
  words between matns — word-level diff, not a cosmetic random highlight.
- .chain-diverge (◆ gold-500) at isnad points where narrators differ
  between the compared hadiths, with an explanatory note below.
- Edge case: hadiths from the same collection/same chain → diff
  computed as normal but chain-diverge markers may legitimately be
  absent; show "Same chain" note rather than forcing a marker to appear.

FILES TOUCHED
- New /hadith/compare route
- hadith.html (comparison drawer, "Add to comparison" menu item)
- src/js/hadith.js (comparison Set state, diff algorithm, chain-diverge logic)

DEFINITION OF DONE
- [ ] Max 3 items enforced; UI disables "Add" at capacity
- [ ] Diff highlighting is a real word-level text diff, not decorative
- [ ] Mobile ≤900px uses tabs, not squeezed columns

VERIFICATION NOTE (required at end of session)
Show one real 2-hadith diff example and confirm the highlighted words
are genuinely different, not a false positive from whitespace/
punctuation differences.
```

---

## MODULE 16 — Study Mode & Reading Mode (US-H20, US-H21)
**Covers:** PRD §3.4 US-H20/H21 · TechSpec (Stage 4 sections)

```
§0 — THINK BEFORE CODING
Both modes are display transformations of the SAME deep-view page data
— implement them as CSS/state toggles on the existing Tier 3b page,
not as separate page builds. Confirm they can't both be active at once
(or if they can, that Reading Mode simply wins/takes full-screen, per
the mobile bottom-sheet + Reading Mode precedent in TechSpec §10).

GOAL
Add two focused-reading display toggles to the deep-view page.

SCOPE — IN
Study Mode (US-H20):
- Toggle → .study-mode-banner (dark green bar, pulsing green dot,
  "Study Mode Active" + subtitle + "Exit Study Mode ×").
- 4-quadrant layout at ≥1440px: top-left Matn, top-right Isnad chain,
  bottom-left Grading panel, bottom-right Topics + related — all 4
  visible without scrolling at 1440×900. Sidebar collapses; prev/next,
  load-more, collections grid all hidden (distraction-free by design,
  don't leave any of these visible "just in case").
- Exit via "Exit Study Mode ×" (top-right, .exit-study) or Escape;
  focus returns to the deep-view page.

Reading Mode (US-H21):
- Toggle in header on Tier 3 routes. Hides sidebar, hero, footer,
  action rails, collections grid.
- Single column, max-width 720px, centered. Arabic +2 font-size steps,
  translation +1 step.
- Background: light mode surface → #FAF6EC (gold-50 tint); dark mode
  unchanged (this asymmetry is intentional, don't "fix" dark mode to
  match).
- Exit: fixed top-right "×" or Escape. URL appends ?mode=reading,
  restored on reload (check for this param on page load).
- prefers-reduced-motion: all reading-mode transitions instant, no
  animated toggle.

FILES TOUCHED
- hadith.html (mode toggle buttons, study-mode-banner, quadrant CSS,
  reading-mode CSS)
- src/js/hadith.js (mode state management, Escape key handling,
  ?mode=reading URL sync)

DEFINITION OF DONE
- [ ] All 4 Study Mode quadrants fit without scroll at 1440×900
- [ ] Reading Mode restores correctly from ?mode=reading on reload
- [ ] Escape key exits whichever mode is active; focus returns correctly
- [ ] Reduced-motion users get instant transitions in both modes

VERIFICATION NOTE (required at end of session)
Confirm you tested at exactly 1440×900 for Study Mode's no-scroll
requirement, not just "large desktop."
```

---

## MODULE 17 — Saved Reading Paths (US-H22)
**Covers:** PRD §3.4 US-H22, §3.4 FIX-2 · TechSpec §3.12

```
§0 — THINK BEFORE CODING
The PRD already resolved a count discrepancy for you (FIX-2): the
blueprint visually shows 3 sidebar rows, but the canonical path count
is 4, with the sidebar showing the first 3 + "View all →". Do not
"fix" this back to 3 canonical paths, and do not add a 5th path
("Daily Sunnah") — it's explicitly deferred post-v1 pending editorial
review, per the PRD's own note.

GOAL
Implement the 4 built-in reading paths with progress tracking.

SCOPE — IN
- /data/reading-paths.json: 4 built-in paths — Start with 40 Nawawi
  (42 hadiths), Kutub al-Sittah basics (50), Faith foundations (30),
  Prophetic Character (25). These are curated hadith-reference lists —
  each hadith reference in these paths should be verified as a real,
  correctly-cited hadith via hadith-verifier before the seed file
  ships, since a broken/wrong reference in a "start here" path is a
  high-visibility trust failure.
- Sidebar: first 3 rows + "View all →" expand link. Each row: SVG
  progress ring (teal-700 stroke filled arc, grey track,
  stroke-dashoffset computed from % complete) + path name + "N of M
  read" + "Continue →".
- Reading-path strip on deep-view (if current hadith is in an active
  path): "Reading: [Path Name] · Hadith N of M" + Prev/Next within
  the path.
- Storage: {slug, readHadiths: string[]} in localStorage
  ['islamicinfo-hadith-paths'], deduplicated via Set before persisting.
- "Continue" button: opens the next unread hadith in that path. At
  100%: button becomes "Path complete ✓" (gold, no action), ring at
  100% — per TechSpec §10 edge case, this is a real terminal state,
  not an error.

FILES TOUCHED
- /data/reading-paths.json (new)
- hadith.html (reading-path-row markup, reading-path-strip on deep-view)
- src/js/hadith.js (progress ring calc, path navigation, completion state)

DEFINITION OF DONE
- [ ] Exactly 4 canonical paths; no 5th path added
- [ ] Progress ring stroke-dashoffset verified correct at 0%/50%/100%
      (named unit test in TechSpec §14.1: reading-paths.js)
- [ ] Every seed hadith reference in the 4 paths verified as real and
      correctly cited
- [ ] 100%-complete state shows "Path complete ✓", not a broken "Continue"

VERIFICATION NOTE (required at end of session — Stage 4 complete after this)
List all hadith references used to seed the 4 reading paths and
confirm each was checked via hadith-verifier. Confirm Stage 4 is fully
closed against PRD §3.4's US-H18–H22 acceptance criteria.
```

---

## MODULE 18 — Full Definition-of-Done & QA Pass
**Covers:** PRD §10 (all 18 DoD items) · TechSpec §14 (unit/integration/E2E/accessibility/Lighthouse)

```
§0 — THINK BEFORE CODING
This module does not add features. It verifies everything built in
Modules 0–17 against the PRD's own Definition of Done table and the
TechSpec's test plan. Do not mark an item done because it was "in
scope" for an earlier module — actually re-check it now.

GOAL
Run the full Phase 7 Definition of Done checklist (PRD §10, 18 items)
and the TechSpec §14 test plan, and produce a single pass/fail report.

SCOPE — IN, go through literally all 18 PRD DoD items in order:
1. All four stages signed off against their own acceptance criteria
2. Every route deep-links, shares, and handles back/forward correctly
3. Every visible string from the blueprint preserved verbatim (cross-
   check the NEW 18-collection content against this — the blueprint's
   OWN text said "9" in places; confirm those were deliberately
   corrected per Module 0/2, not accidentally left as "9")
4. Dark-mode parity audit — every component in both themes, especially
   grade badges, narrator dots, trace view columns
5. Breakpoints 1100/900/760/700/440 all render cleanly on real devices,
   not just devtools resize
6. All hover interactions use var(--ease-reverent) (cards/panels) or
   var(--ease-premium) (buttons) — grep for any stray transition
   timing function that isn't one of these two
7. No new CSS colors/radii/easing outside CLAUDE.md §1 (note: this
   audit must account for the corrected grade-badge tokens from
   Module 4, which ARE an approved, documented exception — verify
   they're documented in DECISIONS.md, not just "new but fine")
8. Grade badge with named grader on every card across all 18
   collections — verify this literally holds given Module 0's Decision
   A; if it doesn't hold as literally worded, confirm the DoD item's
   footnote (per Module 0) is recorded, not silently ignored
9. Narrator reliability grading audit — every citation traces to a
   named classical work, zero fabrications (cross-check Module 8's
   flagged-for-review list actually got reviewed)
10. AI system prompt non-overridable; fatwa/ruling filter tested
    adversarially; QuranlyAI attribution visible (re-run Module 13's
    adversarial test set fresh, don't just cite the old note)
11. Audio always shows reciter name; copy always includes attribution;
    translation always shows edition name
12. Verify/Ask CTAs wired correctly, Ask pre-fills on Tier 3 routes
13. Focus trap in Trace View and Share Modal, verified with VoiceOver
    and NVDA
14. All error fallback states tested: API timeout, CDN 404, narrator
    fetch failure, AI timeout, storage quota, canvas font timeout
15. Lighthouse ≥90 across all 4 categories on /hadith/bukhari/1/1
16. Reading path progress persists correctly across sessions;
    "Continue" opens next unread hadith
17. GA4 custom events firing for all 10 KPI metrics from PRD §1
    (hotd_interacted, isnad_opened, narrator_panel_opened, Tier-3
    pageviews, ai_explain_opened, bookmark_saved/note_saved,
    trace_view_opened, reading_path_progress, copy_with_citation) —
    if analytics wiring was never actually built in Modules 1–17,
    say so plainly here rather than reporting a false pass
18. CLAUDE.md §24 enforcement checklist passes on every route

RELIGIOUS ACCURACY GATE (final check, not a new check)
Confirm items 8 and 9 above one more time, explicitly, since they are
the two DoD items directly tied to CONTENT-POLICY.md's mandatory human
review gate. This module's report should state clearly whether
Islamic-content items (narrator gradings, alternate gradings, topic
summaries, trace-view scholar commentary, reading-path hadith
references) have actually received human scholarly review, or whether
they are still sitting in the "flagged for review" state from earlier
modules — do not let this module's own thoroughness on engineering
checks imply the content review happened if it didn't.

OUTPUT FORMAT
A single markdown table: DoD # | Criterion | Status (Pass/Fail/Partial) |
Evidence | Owner-per-PRD (Engineering/QA/Product/Scholarly Review) |
Notes. Follow with a short list of anything Partial/Fail and what
module should fix it.

FILES TOUCHED
- None (verification only) — update TASKS.md with the DoD results and
  any follow-up items this pass surfaces.

VERIFICATION NOTE (required at end of session)
State plainly whether this page is ready to ship pending only the
scholarly-review sign-offs already flagged, or whether it needs
another engineering pass first — and which DoD items are false-passes
if analytics/AT-testing genuinely couldn't be verified in this
environment.
```

---

## Quick reference — module → PRD user story map

| Module | Stage | User Stories | Depends on |
|---|---|---|---|
| 0 | Gate | — | none |
| 1 | 1 | data layer (§2.3, §6) | 0 |
| 2 | 1 | US-H01 | 1 |
| 3 | 1 | US-H02, US-H03 | 1, 2 |
| 4 | 1 | US-H04 | 1, 2 |
| 5 | 1 | US-H05, US-H06, US-H07 | 4 |
| 6 | 2 | US-H08 | 2 |
| 7 | 2 | US-H09, US-H10 | 4, 6 |
| 8 | 2 | US-H11 | 5, 7 |
| 9 | 2 | US-H13, US-H23b | 4, 7 |
| 10 | 2 | US-H12, US-H23 (partial) | 4, 7 |
| 11 | 3 | US-H14, US-H15 | 5, 7 |
| 12 | 3 | US-H16, US-H17, US-H23 (partial) | 4, 2 |
| 13 | 3 | US-H23 (AI row) | 7 |
| 14 | 4 | US-H18 | 7, 8, 10, 12 |
| 15 | 4 | US-H19 | 7 |
| 16 | 4 | US-H20, US-H21 | 7 |
| 17 | 4 | US-H22 | 7, 9 |
| 18 | QA | all of §10 | everything |

---

*End of build-prompt pack. Source docs: `IslamicInfo_HadithLibrary_PRD_v1_2_Final.md`, `IslamicInfo_HadithLibrary_TechSpec_v1_2.md`, `CLAUDE.md` (design system), `skills/islamic-authenticity/SKILL.md`, existing `hadith.html`, `api.js`, `mockups_hadith.html`.*
