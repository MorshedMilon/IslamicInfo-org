# Module 14 — Hadith Trace View (US-H18) — Verification + DoD

**Date:** 2026-07-22
**Branch:** `feat/hadith-module-14-trace-view`
**Covers:** Design spec `docs/superpowers/specs/2026-07-22-module-14-hadith-trace-view-design.md` §11 Definition of Done, DoD-13, ADR-036.

This is Task 9 (final) of Module 14: a verification record, not new code. Only what was
actually observed in this environment is claimed as done. Anything requiring a browser,
a screen reader, or a live Worker is recorded as **outstanding**.

---

## A. Automated test summary (literal output)

Command: `cd worker && node --test "test/*.test.js"`

```
ℹ tests 311
ℹ suites 0
ℹ pass 311
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1015.8338
```

**Full suite: 311/311 passing, 0 failures.**

Module 14 files, run individually:

| File | tests | pass | fail |
|---|---|---|---|
| `test/trace-view-core.test.js` | 14 | 14 | 0 |
| `test/hadith-feed-core.test.js` | 42 | 42 | 0 |
| `test/tier3-deep-view-core.test.js` | 32 | 32 | 0 |

`trace-view-core.test.js` (new in this module) includes, by name, the honesty/security
assertions the design brief calls out:

- `grading column: ADVERSARIAL — Ibn Hajar + an-Nawawi boxes are honest-empty, NEVER paraphrased`
- `isnad column: empty narrators → honest "not available", no fabricated chain`
- `matn column: empty topics + no qverses render honest states (never invented)`
- `non-array topics/narrators fall back to honest states, no fabrication`
- `XSS: matn/translation are escaped`
- `XSS: narrator id + name and grade fields are escaped`
- `builders never throw on null/undefined/malformed hadith`

All 14 in this file pass. `hadith-feed-core.test.js` and `tier3-deep-view-core.test.js`
(touched by this module for the card trace button and the "View as Trace →" deep-view
link, respectively) are unmodified in their pre-existing assertions and pass in full.

---

## B. DoD checklist (design spec §11) — evidence, honestly split

| # | DoD item | Status | Evidence |
|---|---|---|---|
| 1 | 3-column layout (not 4) — `1fr:1.2fr:1fr`, FIX-3 | **Code-verified by inspection** | `hadith.html:796` — `.trace-layout{...display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:20px;...}`. Responsive collapse at 1300px (2-col) and 900px (1-col) present at lines 797–798. |
| 2 | Both entry points (deep-view "View as Trace →" route+overlay; card button overlay-only) | **Code-complete; browser flow OUTSTANDING** | `src/js/tier3-deep-view-core.js` adds the `dv-trace-link` per spec §7; `src/js/hadith.js:363` opens `II.traceView` with `viaRoute:true` from `parseRoute`'s trace branch; `hadith.js:736` wires the card `data-act="trace"` with `viaRoute:false`. **Not exercised in a live browser** — actually clicking through both entry points requires the Worker/hadithapi reachable to load real hadith data, consistent with every prior hadith module in this repo (Modules 7–12) where live-browser verification was deferred for the same reason. Marked OUTSTANDING here, not done. |
| 3 | Honest states / no fabricated scholar commentary | **PROVEN by unit tests** | `trace-view-core.test.js`: both the Ibn Hajar and an-Nawawi commentary boxes render honest-empty ("ADVERSARIAL" test explicitly asserts no paraphrase text appears); empty isnad/topics/qverses/related all render "not yet available" states, never fabricated content. |
| 4 | `.trace-act` reuse of `buildCopyText` (no new copy-text logic) | **Code-verified by inspection** | `src/js/hadith.js:695` — `onTraceCopy` calls `actions.buildCopyText(traceCopyContent(hadith))`; `traceCopyContent` (line 688) delegates shape-mapping to `II.traceViewCore.buildCopyContent`, which is unit-tested in `trace-view-core.test.js` ("buildCopyContent: maps hadith → the content shape buildCopyText expects"). `onTraceShare`/`onTraceBookmark` similarly reuse existing Module 10/12 handlers — no new logic authored. |
| 5 | Focus trap: Tab-cycle + Escape + focus-return + `role="dialog"`/`aria-modal` | **Code-verified by inspection** | `hadith.html:1868` — overlay markup carries `role="dialog" aria-modal="true" aria-label="Hadith Trace View"`. `src/js/trace-view.js:22` — `II.ui.focusTrap(ov)` applied once on first open (reuses the production-proven `ui-utils` helper). `trace-view.js:17` — Escape key closes. `trace-view.js:46` captures `state.lastFocus = document.activeElement` **before** the `await` on line 47 (the fix noted in project memory — focus is captured synchronously, not after the async hadith fetch resolves, so a fast Escape/close during the await still returns focus correctly). `trace-view.js:70` restores focus to `lastFocus` on close. Not run in a live browser — see Automated a11y and Manual AT sections below. |
| 6 | Automated a11y check run and recorded | **Attempted; none available in-environment** | See below. |
| 7 | Manual VoiceOver + NVDA verification (DoD-13) | **OUTSTANDING QA — NOT done** | See Verification Note below. Cannot be performed in this environment. Never marked done here. |
| 8 | 1 DECISION entry (ships-live rationale) | **Done** | `doc/DECISIONS.md:542` — `ADR-036 · Hadith Trace View ships live (no runtime flag) · Accepted · 2026-07-22 · Module 14 (Hadith Trace View)`. |
| 9 | Pure core unit-tested; full worker suite green | **Done** | See §A above — 311/311 full suite, 14/14 `trace-view-core.test.js`. |

### Automated a11y check (attempted)

Checked for an automated a11y tool available in this environment without a network-heavy
install:

- `npx --no-install axe` → `npm error could not determine executable to run` (axe-core CLI
  not installed locally).
- `npx --no-install pa11y` → `npm error npx canceled due to missing packages and no YES
  option: ["pa11y@9.1.1"]` (not installed locally; npx refused to auto-install).
- `eslint` is present (`v10.7.0`) but no `eslint-plugin-jsx-a11y` or a11y-specific rule set
  is configured in this project (`package.json` has no a11y-related devDependency; no
  `.eslintrc`/`eslint.config.*` a11y config found).
- No `axe`/`pa11y`/`a11y` package found under `node_modules`.

**Result: no automated a11y tool is available in this environment. None was run, and none
is claimed to have run.** This is a real gap, not a check that "passed silently" — it is
recorded here as deferred, same as the code-verified-by-inspection items above it that
were not exercised live.

---

## C. Verification note (required)

- **No screen reader was testable in this environment.** This is a headless Node.js/CLI
  environment with no VoiceOver (macOS-only) or NVDA (requires Windows GUI + the screen
  reader installed and running) available to drive. Zero manual assistive-technology
  verification was performed.
- **DoD-13 (manual VoiceOver + NVDA focus-trap verification) is explicitly NOT marked
  done.** It is an outstanding QA task that must be performed by a human with access to
  the real browser + real assistive technology before this module can be considered fully
  verified per the design spec's own §8 requirement ("CANNOT be performed in this
  environment... never marked done until a human runs it").
- **Live browser verification of both entry-point flows (route link and card overlay) is
  also outstanding.** Exercising them end-to-end requires the Worker/hadithapi backend to
  be reachable so real hadith data loads into the feed and deep-view; that dependency was
  not available/exercised in this session. This mirrors the same deferral recorded for
  prior hadith modules (Modules 7, 9, 10, 11) in this repo.
- **No automated a11y tool was available in-environment** (axe-core, pa11y, and any
  a11y-linting plugin were all absent and not installed, per the constraint against
  network-heavy installs). This is recorded as a gap, not a pass.

**Bottom line:** the pure-logic honesty and security guarantees (no fabricated scholar
commentary, no fabricated isnad/topics/qverses, escaped model text) are proven by 311/311
passing automated unit tests, and the layout/reuse/focus-trap wiring is verified correct
by direct code inspection. What is **not** proven — and is explicitly flagged as
outstanding, not silently skipped — is: automated a11y tooling output, manual
VoiceOver/NVDA verification, and live end-to-end browser exercise of both entry points.
