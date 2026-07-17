# Related Verses Knowledge Index — Design Spec

**Date:** 2026-07-17
**Status:** Approved (brainstorming) → ready for implementation plan
**Slice:** 1 of 3 of the "QuranlyAI Knowledge Index" (Related Verses only)

---

## 1. Context & scope decision

The originating request ("QuranlyAI Knowledge Index") describes **three features on one shared
foundation** — Related Verses, Related Hadith, and Vocabulary — plus a D1/FTS5 backend, seed
scripts, and an admin review UI. That is too large for one design/plan cycle, and two of the three
features are gated by hard content-policy invariants (hadith needs grade + gradedBy, the
hadith-verifier skill, and a human-review gate; `/api/hadith` is still 501).

**Decision:** decompose and build the **Related Verses vertical slice first**. It is the one dataset
*not* gated by the hadith-verifier / human-review requirements, and it establishes the whole
reusable pattern (data model → curation/build → runtime lookup → UI → tests). Hadith and Vocabulary
follow in their own spec→plan→implementation cycles.

### Architectural forks resolved during brainstorming

| Fork | Decision | Rationale |
|---|---|---|
| Storage | **Static pre-built JSON** (not D1/FTS5) for this slice | Workload is tiny exact-match lookup (6,236 verses, a few thousand tag rows); no free-text search needed. Zero infra, zero cost, works on **both** GitHub Pages and Cloudflare, mirrors existing `src/data/*.json` pattern. D1 is deferred to the Hadith cycle where the corpus is genuinely large and FTS earns its place. |
| Tag sourcing | **Hand-curated, fully-sourced starter set** (~25–40 topics) | Satisfies "every claim carries a source." No dependency on licensing an external dataset. The build's output format is identical regardless of future sourcing, so external-index / staged-suggestion flows feed the same pipeline later. |
| AI connecting-blurb | **Deferred** | The verified list is zero-AI, zero-cost, 100% sourced — it ships with **no human-review gate**. Adding AI commentary on scripture trips CONTENT-POLICY's review gate + cost + no-fatwa post-filter. |
| Verse display text | **Baked into the index at build time** | The point of a pre-built index is that the answer is already computed. Baking reference + Saheeh International translation + translator + citation avoids live-fetch latency/failure modes and keeps the panel self-contained. |
| Lookup location | **Fully client-side** (no worker route) | For a static file a worker adds latency + a Cloudflare-only dependency with no benefit. `/api/index/*` routes are introduced with D1 in the Hadith cycle. |

---

## 2. Data model & files

Two build-time artifacts under `src/data/related-verses/`:

### `topics.json` — compiled runtime index (topic → verses)
```json
{
  "patience": {
    "label": "Patience (Sabr)",
    "verses": [
      {
        "key": "2:153",
        "score": 9,
        "translation": "O you who have believed, seek help through patience and prayer…",
        "translator": "Saheeh International",
        "sourceCitation": "Thematic index: <named source>"
      }
    ]
  }
}
```

### `verse-index.json` — reverse map (verse → its topic slugs)
```json
{ "2:153": ["patience", "prayer"] }
```

**Invariant baked into the data:** every verse row carries `translator` **and** a non-empty
`sourceCitation`. Provenance lives in the data, not asserted at runtime.

---

## 3. Authoring & build workflow (minimized "admin" surface)

No web admin UI in this slice (deferred to the Hadith cycle). Curation is a git-tracked file + a
validating build script.

- **Source of truth:** `tools/related-verses/topics.source.json` — human-authored: each topic, its
  `label`, and its verse list with `score` (1–10) + `sourceCitation`. Editable, diff-able,
  code-reviewed.
- **Build script:** `tools/related-verses-build.mjs` (mirrors `tools/qul-ingest.mjs`). It:
  1. reads the source file;
  2. **validates** — every verse key well-formed and real (surah 1–114, valid ayah number), every
     row has non-empty `sourceCitation` and `score` in 1–10, no duplicate key within a topic;
  3. **fetches & bakes** the Saheeh International translation for each key once, at build time;
  4. emits `src/data/related-verses/topics.json` + `verse-index.json`.
- **Fail-closed:** if any row is missing a citation or references an invalid verse, the build
  **errors out** — nothing unsourced can reach the runtime index. This is the invariant's teeth.

Pipeline: *edit source → run build → verified JSON ships.* Future sourcing models produce more
`topics.source.json` rows and flow through the same validating build.

---

## 4. Runtime module & UI integration

Follows the established `foo.js` (thin DOM wrapper) + `foo-core.js` (testable, no-DOM) split used by
every Quran feature.

### `quran-related-core.js` (pure, no DOM)
- `loadIndex()` — fetches the two JSONs once, caches them.
- `topicsForVerse(verseKey)` → the verse's topic slugs (from `verse-index.json`).
- `relatedVerses(verseKey, { limit = 8 })` → dedup'd, `score`-desc rows across all the verse's
  topics, **excluding the queried verse itself**.

### `quran-related.js` (DOM wrapper)
- Adds a **"Related Verses"** action on the per-verse tool row (peer to Tafsir / the `.ai-card`),
  tracking the active `verseKey` like the other modules.
- Clicking opens a panel listing each related verse as **reference · snippet · topic chip**; each
  row links to that verse and navigates the reader there.
- Empty state for an untagged verse: *"No related verses indexed yet."*
- Fully self-contained: no spinner, no network beyond the one-time JSON load, no AI, no worker.

**Data flow:** `verseKey` → `relatedVerses()` → render baked rows.

---

## 5. Testing & content-policy compliance

### Tests (`tests/quran/…`)
- **Core unit tests:** `relatedVerses()` sorts by `score` desc; dedups a verse tagged under multiple
  topics; excludes the queried verse; respects `limit`; returns `[]` for an untagged verse.
- **Build/validation tests:** build rejects missing `sourceCitation`, malformed/out-of-range verse
  key, `score` outside 1–10, duplicate key within a topic.
- **Data integrity test:** every `key` in `topics.json` appears in `verse-index.json` and vice-versa.

### Content-policy compliance
- No fatwas/rulings — the feature only *lists sourced verses*; renders no verdicts. ✅
- Every verse carries `translator` + `sourceCitation` (build fails otherwise). ✅
- No invented Arabic/citations — translations from the same Saheeh source `/api/verse` uses;
  citations human-authored and validated non-empty. ✅
- No AI on scripture in this slice → **no human-review gate needed to ship.** ✅

### Verifiable success check (definition of done for the slice)
1. `tools/related-verses-build.mjs` runs clean and emits both JSONs.
2. All unit + validation tests pass.
3. In `quran.html`, opening a tagged verse (e.g. 2:153) shows a "Related Verses" panel listing other
   patience verses, each with a working navigation link and a visible source label; an untagged
   verse shows the empty state.

---

## 6. Deferred-work ledger (to finish the full 3-feature set)

- ⏳ **Related Hadith** — corpus import + topic tags; gated by grade+gradedBy, hadith-verifier skill,
  human-review gate, and un-501'ing `/api/hadith`.
- ⏳ **Vocabulary** — term list + cross-references into verses *and* hadith; FTS lookup.
- ⏳ **Adopt D1 + FTS5** for the corpus (introduced with Hadith).
- ⏳ **`/api/index/*` worker routes** (introduced with D1).
- ⏳ **AI connecting-explanation blurb** (reuses `/api/ask-claude` guardrails + human-review gate).
- ⏳ **Web-based admin bulk-review UI**.
- ⏳ **Scale tag coverage** via external thematic index / staged suggestions.

---

*Derived from a brainstorming session on 2026-07-17. Next step: writing-plans skill →
implementation plan. Follows API-SPEC / ARCHITECTURE / CONTENT-POLICY invariants; introduces no new
worker routes, secrets, or storage bindings in this slice.*
