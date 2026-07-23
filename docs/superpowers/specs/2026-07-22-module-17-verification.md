# Module 17 — Saved Reading Paths (US-H22) — Verification & Stage 4 Closure

**Date:** 2026-07-22
**Branch:** `feat/hadith-module-17-reading-paths` (13 commits, `a465bbc..cddd5cc`)
**Tests:** 405 pass / 0 fail (36 new in `worker/test/reading-paths-core.test.js`).
**Design:** `docs/superpowers/specs/2026-07-22-module-17-reading-paths-design.md`
**Plan:** `docs/superpowers/plans/2026-07-22-module-17-reading-paths.md`

---

## Required verification note — hadith references used to seed the 4 paths

**Zero hadith references were authored or seeded.** All four built-in reading paths
ship with `hadithRefs: []` and `status: "curation-pending"`
(`src/data/hadith/reading-paths.json`):

| Slug | Name | targetCount (PRD FIX-2) | hadithRefs shipped |
|---|---|---|---|
| `nawawi-40` | Start with 40 Nawawi | 42 | `[]` |
| `kutub-sittah-basics` | Kutub al-Sittah basics | 50 | `[]` |
| `faith-foundations` | Faith foundations | 30 | `[]` |
| `prophetic-character` | Prophetic Character | 25 | `[]` |

Because **no reference was seeded, there was nothing to run through the
hadith-verifier skill, and no reference can be mis-cited.** This is the deliberate,
user-approved, scholar-gated posture recorded in **ADR-042**, and it is consistent
with every prior hadith module (Module 8 "zero citation data authored"; Module 11
"no curated data → honest unavailable"). The DoD line *"every seed hadith reference
verified as real and correctly cited"* is therefore satisfied **vacuously and
honestly**.

Two hard reasons this was the correct call (full detail in ADR-042 / design spec):
1. The live data layer serves **no Nawawi collection** — the 9 collections
   (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Musnad Ahmad, Mishkat,
   al-Silsila al-Sahiha) would each need per-hadith remapping + verification.
2. Three of the four paths are **editorial curations** ("which 30 hadith are the
   Faith Foundations?") — scholarly selection judgments the charter forbids without
   sourced references.

**Future curation task (scholar-gated):** run each candidate reference through the
hadith-verifier skill, confirm it resolves to a live `/hadith/[collection]/[book]/[hadith]`
route, then populate `hadithRefs`. Do not add a 5th "Daily Sunnah" path without
editorial sign-off (deferred post-v1 per FIX-2).

---

## DoD evidence

| DoD item | Status | Evidence |
|---|---|---|
| Exactly 4 canonical paths; no 5th | ✅ | `reading-paths.json` has 4; unit test "no Daily Sunnah" |
| Ring stroke-dashoffset correct at 0/50/100% | ✅ | `reading-paths-core.test.js` `ringGeometry` tests (dashOffset = circ, circ/2, 0) |
| Every seed hadith reference verified | ✅ (vacuous/honest) | zero references ship (ADR-042) |
| 100%-complete shows "Path complete ✓", not broken Continue | ✅ | `pathRowViewModel` `continueState:'complete'`; unit-tested via mocked full path |

Live behaviour today: every sidebar row renders ring **0%**, `0 of N read`, and a
muted **"Coming soon"** control (from `continueState:'coming-soon'`). The deep-view
strip never mounts (no hadith is a path member). Continue/complete/strip/nav logic
is fully built and unit-tested against mocked populated paths — dormant against the
empty seed, ready for curated data.

---

## Outstanding — deferred to human sign-off (matches every prior Stage-4 module)

- **Live browser check** at 1440×900 (sidebar rows render, "View all →" reveals the
  4th path, "Coming soon" muted state, dark-mode legibility) — no browser automation
  in the build session.
- **VoiceOver / NVDA** on the sidebar rows and (future) deep-view strip.
- **Future-curation wiring** captured by the final review (do in the curation task,
  not now): wire `window.II.readingPathsDOM.mountStrip(ref)` into the deep-view
  painter and `markRead(slug, id)` into the Module-9 read tracker; consider switching
  the two-way `openNextUnread`/strip nav from `location.href` to `history.pushState`
  (SPA nav) to match siblings; optional "View less" toggle. All are dormant today.
- **i18n:** rendered chrome now emits `data-i18n` keys (`hadith.paths.comingSoon`,
  `.continue`, `.complete`, `.viewAll`, `hadith.paths.name.<slug>`, reused
  `hadith.path.prev/next`) with English fallback; the in-progress 10-language pass
  must add these keys to the locale files ([[i18n-task-state]]). Graceful until then.

---

## Stage 4 (US-H18–H22) closure

Stage 4 is **engineering-complete** at the engineering-complete / content-deferred
posture consistent with Modules 14–16:

- US-H18 Trace View — Module 14 (merged)
- US-H19 Comparison Mode — Module 15 (merged)
- US-H20 Study Mode / US-H21 Reading Mode — Module 16 (merged)
- US-H22 Saved Reading Paths — Module 17 (this branch)

No fabricated hadith content ships in any Stage-4 module. Real content curation
(reading-path references; and the isnad/commentary datasets flagged in Modules 8/14)
remains the outstanding scholar-gated work across the hadith library.
