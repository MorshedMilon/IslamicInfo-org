# Module 18 — Full Definition-of-Done & QA Report

**Date:** 2026-07-23 · **Covers:** PRD §10 (18 DoD items) · TechSpec §14 test plan
**Type:** Verification-only (no features). Read-only audit of Modules 0–17 against the PRD's own DoD.
**Environment limits (material):** no browser / real device, no screen reader (VoiceOver/NVDA), no live-model calls, no Lighthouse/Chrome-DevTools. Code verified against current `main`; unit tests read, not executed in this pass. Anything requiring those tools is marked and **not** passed.

**Method:** six parallel read-only evidence-gathering audits across the 18 items; findings synthesized below. One pre-audit belief was corrected: the "Stage-1 Modules 0–8 unmerged" lead is **stale** — `git rev-list main..origin/feat/hadith-module-1-foundation` = 0, i.e. all engineering is on `main`.

**Tally:** 3 Pass · 11 Partial · 4 Fail/Not-Built.

---

## DoD results

| # | Criterion | Status | Evidence | Owner (PRD) | Notes |
|---|---|---|---|---|---|
| 1 | All four stages signed off vs acceptance criteria | **Partial** | All modules merged to `main` (Stage 1 `e2bba18`/`cb540e5`… Stage 4 `237429c`/`cfcabd9`/`ba364d6`/`3836925`); `git rev-list main..…module-1-foundation`=0 | QA + Scholarly | "Merged" ≠ "signed off". No filled per-stage acceptance record in `doc/DEFINITION-OF-DONE.md`; AT/live-browser/perf/content sign-offs all open. |
| 2 | Every route deep-links, shares, back/forward | **Pass** | `hadith.js` `parseRoute:182`, `routePath:191`, `wireRouting:404`, popstate `:420`; `404.html` SPA fallback `:17-22` | Engineering | All 8 route types handled. Nuance: `/hadith/compare` shares via `?refs=` (`openCompareRoute:779`), not `routePath`. Live back/forward not runnable here. |
| 3 | Blueprint strings verbatim; 9→18 deliberate | **Pass** | ADR-024/ADR-022 (`doc/DECISIONS.md`); runtime count `hadith.js:138-143`; no stray "9 collections" | — | `collections-meta.json` 9 entries is intentional presentation-only metadata; live API governs 18. |
| 4 | Dark-mode parity (grade badges, narrator dots, trace cols) | **Partial** | Dark tokens `hadith.html:62-71`; grade dark overrides `:494-500`; dots token-driven `:698-713`; trace surfaces `:918-943` | Frontend/Design + QA | Code theme-aware across all three families; **WCAG contrast + FIX-1 sahih/mawdu legibility need a browser.** |
| 5 | Breakpoints 1100/900/760/700/440 on real devices | **Partial** | `@media` rules for all five present (`hadith.html:136,138,139,345,346` + more) | Frontend + QA | All 5 present in CSS; "clean on **real devices**" unverifiable here. |
| 6 | All hover transitions use `--ease-reverent`/`--ease-premium` | **Fail** (literal) | 54 transitions; 22 not on ease tokens; ~8 hadith hover components use default `ease`: `.reading-path-row:296`, `.sidebar-cta:318`, `.section-action:377`, `.breadcrumb a:751`, `.path-nav-btn:767`, `.exit-study:780`, `.trace-act:922`, `.topic-card:1132` | **Engineering** | Fixable now. 6 further stray-easing items are inherited shell components. |
| 7 | No new colors/radii/easing outside §1; grade exception documented | **Partial** | Grade exception **documented** ADR-025; new hex `#4ADE80` `.study-mode-dot` `hadith.html:778` | **Engineering** + Design | `#4ADE80` (Module 16) is the one genuine new-color violation; ~40 other raw-hex are pre-existing platform shell debt. No new radii/easing tokens. |
| 8 | Grade badge w/ named grader on every card, all 18 collections | **Fail-by-design** | `hadith-adapter.js:28-34` `grader:null` always; fallback "· grader not individually cited" (`hadith-feed-core.js:46`); characterization-only 9 show no per-hadith badge (ADR-022) | Data-source / Scholarly | Intentional **anti-fabrication**; recorded (ADR-022, `hadith-module-decisions`). Named grader can't be shown — source lacks it. |
| 9 | Narrator citations → named classical work, zero fabrication; list reviewed | **Partial** | `narrator-panel-core.js` renderer-only; only `data/narrator/_schema.example.json` exists (not loaded); ADR-029 | **Scholarly Review** | Zero fabrication = safe. But no citations exist and the flagged list was **never reviewed** → content-incomplete. |
| 10 | AI prompt non-overridable; fatwa filter adversarial; attribution visible | **Partial** | Locked `system_instruction` (`gemini.js:17-19`, `explain.js:28-37`); safety gate `explain-core.js:53-64`; adversarial tests `explain*.test.js`; footer `hadith-ai.js:33-41` | AI/Backend + Reviewer | Code Pass. Ships **DARK** (`HADITH_AI_EXPLAIN_ENABLED=false`, ADR-034). Live-model adversarial re-run + human sign-off outstanding. |
| 11 | Audio reciter / copy attribution / translation edition always shown | **Partial** | copy never-unattributed (`hadith-actions-core.js:141-146`, callers abort on empty); audio `unavailable/reciter:null` (`api.js:447`); edition label only on multi-edition path (`hadith-feed-core.js:159-176`) | Frontend + Data | Copy = Pass. Audio honest-unavailable (no source). Edition label dormant until >1 edition. |
| 12 | Verify/Ask CTAs wired; Ask pre-fills on Tier 3 | **Pass** | `hadith.js:967` (Verify→verify.html), `:972`→`buildAskUrl` (`hadith-actions-core.js:113-120`) `?q&ref&mode=claim`; receiver `verify.html:1037,549` | Engineering | Handoff contract confirmed both sides. |
| 13 | Focus trap in Trace View + Share Modal, via VoiceOver + NVDA | **Partial** | `ui.focusTrap` (`ui-utils.js:87-111`) wired: Trace `trace-view.js:22`, Bookmarks `hadith.js:920`, Compare `compare-view.js:26` | Frontend + QA | "Share Modal" is native OS share (no trappable modal → maps to Bookmarks panel). **VoiceOver/NVDA not runnable here.** |
| 14 | Error fallbacks tested: API/CDN404/narrator/AI/quota/canvas-font | **Partial** | API timeout+narrator+AI = handled **and tested** (`ui-utils.js:36-44`, `narrator-panel.js:25`, `explain.js:74`, tests present); storage-quota handled `ui-utils.js:28-34` but **no test**; CDN-404 no hadith handler; canvas-font N/A (hadith share is text) | Frontend + Worker | DoD's "all tested" is false: quota untested; CDN-404/canvas not applicable/not built for hadith. |
| 15 | Lighthouse ≥90 all 4 categories on /hadith/bukhari/1/1 | **Fail** / unverifiable | Perf last-known **62–65** (<90); ADR-043 `doc/DECISIONS.md:674`; A11y 97/BP 96/SEO 90 last-known but not re-measured | Perf/Infra | No Lighthouse here → **no score fabricated.** Structural no-build ceiling (ADR-001). |
| 16 | Reading-path progress persists; "Continue" opens next unread | **Partial** | Persistence + progress + Continue logic built/tested (`reading-paths(-core).js`); seed `reading-paths.json` all `hadithRefs:[]`/`curation-pending` | Scholarly/Product | Live "Continue" = "Coming soon"; cannot open next unread until refs curated (ADR-042). |
| 17 | GA4 custom events for all 10 KPI metrics | **NOT BUILT** | Repo grep: `gtag`/`dataLayer`/`analytics` + all 10 event names → **zero hits in `src/`/`worker/`** (only in PRD/docs) | Unassigned | Analytics layer never wired; **0/10 events**. Reporting Pass would be a false-pass. |
| 18 | CLAUDE.md §24 enforcement passes on every route | **Partial** | Most static §24 items pass (`data-theme`, tokens, 10-item nav, breakpoints, reveal); fails hover-easing (DoD-6) + Ecosystem/LearnSpeakAI item | Design + Eng | Ecosystem/LearnSpeakAI failure = **stale §24 doc** (hadith.html matches live 6-site footer). Hero/theme/card-hover items need runtime. |

---

## Partial / Fail — what fixes it

**Engineering (this codebase, no content gate):**
- **DoD-6 (Fail):** switch the 8 hadith hover components to `var(--ease-reverent)` (cards/panels) / `var(--ease-premium)` (buttons).
- **DoD-7 (Partial):** tokenize or remove the new hex `#4ADE80` in `.study-mode-dot`.
- **DoD-14 (Partial):** add the storage-quota (`QuotaExceededError`) unit test the Module-10 plan required.
- **DoD-11 (Partial):** surface the translation edition name on the single-edition path (currently only labeled when >1 edition).
- **DoD-18 (Partial):** DoD-6 rollup + update DESIGN-SYSTEM §24/§26 (stale Ecosystem/LearnSpeakAI vs live footer) — **Design/Product** owns the doc.

**Product decision:**
- **DoD-17 (Not Built):** analytics was never wired. Either build GA4 (gtag/dataLayer + the 10 KPI events) or formally descope it in the PRD. It is a false-pass to leave it implied-done.

**Environmental — needs the tools this session lacked (QA):**
- **DoD-15:** run Lighthouse on `/hadith/bukhari/1/1` (before/after Module-18 perf levers) to close or confirm the ADR-043 ceiling.
- **DoD-4 / -5 / -13 / -18:** live-browser contrast + real-device breakpoints + VoiceOver/NVDA + runtime §24 visual pass.
- **DoD-10:** live-model adversarial re-run before flipping `HADITH_AI_EXPLAIN_ENABLED`.

**Scholarly review (blocking ship of content features) — see gate below.**

---

## Religious-accuracy gate (DoD-8 + DoD-9, CONTENT-POLICY §5)

**The mandatory human scholarly-review gate is UNMET.** No Islamic-content feature has received scholarly review:

| Feature | State | Evidence |
|---|---|---|
| Narrator gradings (M8) | Zero data authored; honest-empty renderer | `narrator-panel-core.js`; only `_schema.example.json`; ADR-029 |
| Alternate/disputed gradings | Dead-code branch, unreachable live | `hadith-adapter.js:33` `disputed:false` |
| Topic summaries (M11) | Nav-only chips; summaries not authored | `hadith-topics-core.js`; `topics:[]` |
| Trace-view scholar commentary (M14) | Honest "Commentary not yet available." | `trace-view-core.js:14,77-87` |
| Reading-path hadith refs (M17) | All 4 paths `hadithRefs:[]`, `curation-pending` | `reading-paths.json`; ADR-042 |

The code is **commendably fabrication-free** — it refuses to invent grader names, narrator citations, commentary, topic relationships, or path references, and each honesty state is unit-locked. But "no fabrication" ≠ "reviewed." The engineering/display layer is safe to ship; the platform is **NOT cleared** to present narrator reliability, scholar commentary, topic summaries, alternate gradings, or curated reading paths as scholarly-reviewed content.

---

## Verification note (required)

**Is the page ready to ship pending only the already-flagged scholarly sign-offs, or does it need another engineering pass first?**

**It needs a short engineering pass AND the scholarly-review gate — it is not ship-ready on scholarly sign-off alone.** Specifically:

1. **Not ship-ready as-is.** Two items are hard blockers beyond content: **DoD-17 (analytics never built — 0/10 KPIs)** and **DoD-15 (Performance 62–65 < 90, unresolved).** DoD-17 is a genuine gap, not an environmental limitation.
2. **Small engineering pass** closes DoD-6, DoD-7, DoD-14, DoD-11 (all local, no content gate) — a few hours of work.
3. **Scholarly review** is the largest and most important blocker: every Islamic-content feature is honest-unavailable / curation-deferred and cannot ship as "reviewed."

**False-pass warning — items that would be false-passes if reported "done":**
- **DoD-15 (Lighthouse)** — no Lighthouse tooling this session; last-known Performance failing. Any "≥90" claim would be fabricated.
- **DoD-13 (VoiceOver/NVDA)** — no screen reader; only code-level focus-trap presence confirmed.
- **DoD-4 / -5 / -18 (visual/device/runtime)** — code-level only; visual parity, real-device rendering, and runtime §24 checks unconfirmed.
- **DoD-17 (GA4)** — reporting Pass would be the worst false-pass: the analytics layer does not exist at all.

**Bottom line:** engineering integration is complete and honest; the display layer is shippable. Before public launch of the *content* features: (a) build or descope analytics, (b) run real Lighthouse + AT + device passes, (c) complete the small engineering fix list, and (d) obtain CONTENT-POLICY §5 scholarly sign-off on every Islamic-content surface. Until then, the Hadith Library ships only its fabrication-free engineering/display scaffold.
