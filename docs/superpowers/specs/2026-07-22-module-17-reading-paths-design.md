# Module 17 — Saved Reading Paths (US-H22) — Design

**Date:** 2026-07-22
**Covers:** PRD §3.4 US-H22, FIX-2 · TechSpec §3.12, §14.1
**Posture:** Engineering-complete, curation-deferred (user-approved 2026-07-22)
**Stage:** Stage 4 closer (US-H18–H22)

---

## 1. Context & the core tension

US-H22 asks for 4 built-in reading paths (curated hadith sequences) with progress
tracking. The naive reading of the module brief is "seed `reading-paths.json` with
147 verified hadith references." Two hard realities make that the wrong first move:

1. **The live data layer has no Nawawi collection.** The app serves 9 collections
   via hadithapi.com — Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah,
   Musnad Ahmad, Mishkat, al-Silsila al-Sahiha
   (`src/data/hadith/collections-meta.json`). A `Continue →` opens
   `/hadith/[collection]/[book]/[hadith]`, so every reference must be a
   `{collection, book, hadith}` tuple resolving against one of those 9. "Nawawi #1"
   does not resolve — each would need remapping to its Bukhari/Muslim origin.

2. **Three of the four paths are editorial curations, not fixed collections.**
   "Which 30 hadith are the *Faith Foundations*?" is a scholarly selection judgment.
   The project's binding content rules (`hadith-module-decisions` memory) and every
   prior module (Module 8: "zero citation data authored"; Module 11: "no curated
   data exists → honest unavailable") defer exactly this kind of curation to
   human/scholar review. The charter forbids scholarly-consensus claims without
   sourced references.

**Decision (user-approved):** Build the full engineering. Ship the 4 canonical path
*definitions* but with `hadithRefs` deferred behind an honest "curation pending"
state — matching Modules 8 & 11. **Zero unverified references ship.** Real curation
becomes a separate scholar-gated content task.

This means the DoD line "every seed hadith reference verified as real and correctly
cited" is satisfied **vacuously and honestly** — no references ship, so none can be
mis-cited. This is documented in the verification note, not glossed over.

---

## 2. Existing fabricated markup to remove

`hadith.html` currently contains mockup-port demo data that must be de-fabricated
(same move Module 15 made removing its static demo):

- Sidebar: 3 hard-coded `.reading-path-row` blocks with fake progress
  (`17 of 42 read` / `40%`, `11 of 50` / `21%`, `3 of 30` / `10%`), a mislabeled
  "Faith topics" (canonical: "Faith foundations"), and a missing 4th path.
- Deep-view: a `.reading-path-strip` hard-coded to
  "Reading: **Kutub al-Sittah basics** · Hadith 12 of 50".

Both are replaced with JS-populated containers. Existing CSS classes
(`.reading-path-row`, `.path-ring`, `.path-ring-text`, `.reading-path-strip`,
`.path-nav-btn`) are reused unchanged — no new tokens/colors.

---

## 3. Architecture (core + DOM split, per ADR-027)

### 3.1 Seed data — `src/data/hadith/reading-paths.json` (new)

Matches `collections-meta.json` location + honest `_note` convention.
Forward-compatible: a later curation task only fills `hadithRefs`.

```json
{
  "_note": "Built-in reading path definitions. hadithRefs deferred pending editorial + scholar curation (CONTENT-POLICY §5). Each ref, once curated, is {collection,book,hadith} resolving to a live /api/hadith route.",
  "paths": [
    { "slug": "nawawi-40",           "name": "Start with 40 Nawawi",   "targetCount": 42, "accent": "teal", "status": "curation-pending", "hadithRefs": [], "description": "..." },
    { "slug": "kutub-sittah-basics", "name": "Kutub al-Sittah basics", "targetCount": 50, "accent": "teal", "status": "curation-pending", "hadithRefs": [], "description": "..." },
    { "slug": "faith-foundations",   "name": "Faith foundations",      "targetCount": 30, "accent": "gold", "status": "curation-pending", "hadithRefs": [], "description": "..." },
    { "slug": "prophetic-character", "name": "Prophetic Character",     "targetCount": 25, "accent": "gold", "status": "curation-pending", "hadithRefs": [], "description": "..." }
  ]
}
```

- **Exactly 4 paths. No 5th ("Daily Sunnah" deferred per FIX-2).**
- `name` / `description` are neutral UI copy (not religious content) — safe to author.
- `accent` selects an existing ring stroke token (`--teal-700` / `--gold-500`), no new color.
- A curated `hadithRefs` entry (future) is `{ "collection": "sahih-bukhari", "book": "...", "hadith": "1" }`.

**Fetch path:** confirm at implementation whether the frontend fetches
`src/data/hadith/…` or a rewritten `/data/…` path; match how `collections-meta.json`
is currently loaded (single source of truth — do not invent a new fetch convention).

### 3.2 Pure core — `src/js/reading-paths-core.js` (new)

DOM-free, fully unit-tested. Exports:

| Function | Contract |
|---|---|
| `ringGeometry(percent, r=12)` | `{ dashArray, dashOffset }`. `circ = 2πr`; `dashArray = circ`; `dashOffset = circ · (1 − clamp(percent,0,100)/100)`. **DoD-critical.** |
| `pathProgress(path, readSet)` | `{ readCount, targetCount, percent, complete }`. `percent = round(readCount/targetCount·100)`; `complete = targetCount>0 && readCount>=targetCount`. Empty path → `0/42`, 0%, not complete. |
| `nextUnread(path, readSet)` | first `hadithRefs` entry not in `readSet`, else `null` (complete OR empty). |
| `pathIndexOf(path, ref)` | 1-based position of `ref` in `hadithRefs`, for the strip's "Hadith N of M"; `null` if not a member. |
| `isEmptyPath(path)` | `true` if `status==='curation-pending'` or `hadithRefs.length===0` → drives "Coming soon" state. |
| `loadPaths()` / `savePathProgress(slug, refs)` | localStorage `islamicinfo-hadith-paths`, shape `{ [slug]: string[] }`; merge via `Set` + dedup before persist; `QuotaExceededError` swallowed (Module-10 pattern). |

Full navigation + completion logic lives here and is **unit-tested against mocked
populated paths** — the same "built + unit-test-only, dormant against live data"
pattern as the disputed-grade branch in `hadith-module-decisions`. Live seed renders
the empty state; the logic is proven ready for the future curated data.

### 3.3 DOM layer — `src/js/reading-paths.js` (new, dedicated file)

Chosen over inlining in `hadith.js` to match the `tier3-deep-view.js` /
`compare-view.js` DOM-file pattern and keep `hadith.js` from growing.

- **Sidebar render:** data-driven from `reading-paths.json`. First 3 rows +
  **"View all →"** expand control revealing the 4th. Each row: SVG ring (geometry
  from `ringGeometry`), name, `N of M read`, Continue control.
- **Empty state (live):** ring at 0%, `0 of N read`, Continue replaced by a **muted,
  non-interactive "Coming soon"** — honest, no dead link.
- **Populated state (future / tested via mock):** ring at real %, Continue → opens
  `nextUnread` route; at 100% → **`Path complete ✓`** (gold, non-action, terminal —
  per TechSpec §10 this is a real state, not an error).
- **Deep-view `.reading-path-strip`:** renders only if the current hadith is a member
  of an active path (via `pathIndexOf`). With the deferred seed no hadith is a member
  → strip stays hidden. Prev/Next wired to path-order navigation (built + tested).
- Mounted on sidebar init + on deep-view paint (mirrors `mountModeControls`).

### 3.4 Markup — `hadith.html`

Remove the 3 fabricated `.reading-path-row` blocks and the fabricated
`.reading-path-strip`; leave a `#reading-paths-list` sidebar container and a
`#reading-path-strip-slot` in deep-view for the JS to populate. Add the
`reading-paths-core.js` + `reading-paths.js` script tags. CSS unchanged.

### 3.5 Docs

- Register `islamicinfo-hadith-paths` (`{ [slug]: string[] }`) in `doc/DATA.md`.
- ADR in `doc/DECISIONS.md`: "Module 17 ships path definitions with deferred
  hadithRefs; curation is scholar-gated" (rationale: §1 above).

---

## 4. Testing — `worker/test/reading-paths-core.test.js` (new)

Named per TechSpec §14.1. Coverage:

- **`ringGeometry` at 0% / 50% / 100%** (DoD): dashOffset = `circ`, `circ/2`, `0`
  respectively (± float tolerance).
- `pathProgress`: empty path → `0/N`, 0%, not complete; partial; full → complete.
- `nextUnread`: partial → first unread; complete → null; empty → null.
- `pathIndexOf`: member → 1-based N; non-member → null.
- `isEmptyPath`: curation-pending / empty refs → true; populated → false.
- Storage merge + dedup: overlapping saves deduplicate; `QuotaExceededError` swallowed.
- Completion state: mocked full path → `complete:true` (drives "Path complete ✓").

All existing tests (369 baseline) must stay green.

---

## 5. Definition of Done → evidence map

| DoD item | How satisfied |
|---|---|
| Exactly 4 canonical paths; no 5th | `reading-paths.json` has 4; "Daily Sunnah" absent by design |
| Ring dashoffset correct at 0/50/100% | `reading-paths-core.test.js` named unit test |
| Every seed hadith reference verified | **Vacuous & honest** — no refs ship; curation deferred (documented in verification note) |
| 100%-complete → "Path complete ✓" | Built in `reading-paths.js`, unit-tested via mocked full path |

---

## 6. Out of scope (explicit)

- Authoring/curating the 147 hadith references (separate scholar-gated content task).
- A 5th "Daily Sunnah" path (deferred post-v1 per FIX-2).
- User-created custom paths (not in US-H22).
- Live browser / VoiceOver / NVDA verification — deferred to human sign-off, matching
  every prior Stage-4 module's posture (no browser automation in the build session).

---

## 7. Stage 4 closure note

After this module, list all four path slugs and confirm each ships with
`hadithRefs: []` (no reference authored, none to verify), and confirm Stage 4
(US-H18–H22) is closed against PRD §3.4 acceptance criteria at the
engineering-complete / content-deferred posture consistent with Modules 14–16.
