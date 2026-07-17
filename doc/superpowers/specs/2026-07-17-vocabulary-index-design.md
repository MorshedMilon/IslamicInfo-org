# Vocabulary Knowledge Index — Design Spec

**Date:** 2026-07-17
**Status:** Approved (brainstorming) → ready for implementation plan
**Slice:** 3 of 3 of the "QuranlyAI Knowledge Index" (Vocabulary) — the finale
**Predecessors:** `2026-07-17-related-verses-index-design.md` (slice 1, live), `2026-07-17-related-hadith-index-design.md` (slice 2, live)

---

## 1. Context & scope

Slice 3 adds a per-verse **Key Terms** panel — a curated Arabic-term glossary — completing the
reader trio (Related Verses · Related Hadith · Key Terms). Each term carries a sourced definition and
maps to existing topic slug(s); its cross-references into verses & hadith are **inherited** from the
already-shipped `related-verses` / `related-hadith` indexes. Vocabulary is a *definition layer* on top
of the shared taxonomy.

### Decisions resolved during brainstorming

| Fork | Decision | Rationale |
|---|---|---|
| Storage / FTS | **Static JSON; NO D1/FTS5** | Vocabulary is a curated glossary (dozens–hundreds of terms), browsed/searched client-side — the same trivial workload the translations picker already handles for 126 items live. FTS5 would only pay off for a *corpus-wide full-text search engine* (a different, larger feature with Arabic-morphology needs we can't meet). **This drops D1 + FTS5 + `/api/index/*` from the roadmap entirely — the whole Knowledge Index ships as static JSON.** |
| Cross-references | **Term → topic mapping; reuse the shipped indexes** | Many key terms *are* the topics (Sabr→patience, Shukr→gratitude, Taqwa→fear-of-allah, Tawhid→oneness-of-allah, Rahmah→mercy). A term points at topic slug(s) and inherits that topic's verified verses + hadith — **zero new verse/hadith curation.** New curation = definitions + the mapping. |
| Definition sourcing | **Per-term citation, fail-closed, grounded in real references** | A definition is a synthesized claim → same invariant as verses/hadith. Every term has a non-blank `source`; the build fails otherwise. Definitions grounded (at curation) in established references (Lane's Arabic-English Lexicon, recognized Islamic/tafsir glossaries), never from memory. |
| Surface | **Per-verse "Key Terms" panel** | Completes the reader trio; near-exact mirror of the two shipped panels; adds the *meaning* dimension. Global "search any term" glossary lookup deferred to the ledger. |
| Term-detail depth | **Definition + inline cross-refs** | Expanding a term shows short + long definition, source, AND a compact list of the term's top verses + hadith (from the reused indexes). Makes it more than a flat dictionary; costs only a couple extra static reads. |
| Review gate | **Sourced + fail-closed, NO 🕌 gate — with a restricted term set** | Lexical definitions grounded in cited classical sources are a lower risk class than hadith. Shippable without a review bottleneck **provided** the starter set is restricted to well-established linguistic/spiritual terms (taqwa, sabr, shukr, iman, ihsan, dhikr, tawbah, rahmah, sidq, tawhid…). Theologically contested, sectarian, or ruling-adjacent terms are **excluded from this slice** (ledger). |
| Module structure | **Parallel module** | New `quran-vocab-*` files; the shipped verses/hadith modules untouched. Consistent with slices 1–2. |

---

## 2. Data model & files

**Reused (unchanged):** `src/data/related-verses/verse-index.json` (verse → topics),
`src/data/related-verses/topics.json` + `src/data/related-hadith/topics.json` (for a term's
cross-refs).

### New files
| File | Responsibility | New/Modify |
|---|---|---|
| `tools/vocab/terms.source.json` | Hand-authored, sourced curation source. | Create |
| `tools/vocab-build.mjs` | Validating, fail-closed build. | Create |
| `src/data/vocab/terms.json` | Generated: term slug → term record. | Generated |
| `src/data/vocab/topic-terms.json` | Generated: reverse map, topic slug → [term slugs]. | Generated |
| `src/js/quran-vocab-core.js` | Pure: `validateSource`, `compileIndex`, `keyTermsForVerse`, `termCrossRefs`. | Create |
| `src/js/quran-vocab.js` | Browser wrapper: load + render the per-verse panel. | Create |
| `tests/quran/vocab-core.test.js` | Unit tests. | Create |
| `quran.html` | Panel CSS + script includes. | Modify |
| `src/js/quran-verses.js` | "Key Terms" footer button + panel container in `buildCard`. | Modify |
| `doc/DATA.md`, `doc/API-SPEC.md`, `doc/TASKS.md` | Register data files + feature. | Modify |

### Curation source row (`terms.source.json`)
```json
{
  "taqwa": {
    "arabic": "تَقْوَىٰ",
    "translit": "Taqwā",
    "shortDef": "God-consciousness; mindful reverence of Allah.",
    "longDef": "Fuller definition, compiled from the cited source(s)…",
    "source": "Lane's Arabic-English Lexicon (root و-ق-ي); …",
    "topics": ["fear-of-allah"]
  }
}
```

### Generated
- `terms.json` = the validated term records (same shape).
- `topic-terms.json` = `{ "fear-of-allah": ["taqwa"], … }` (reverse map).

### Fail-closed validation
kebab-case term slug; non-blank `arabic`, `translit`, `shortDef`, `longDef`, `source`; `topics` a
non-empty array whose every slug **exists in the shared taxonomy** (`related-verses/topics.json`) —
the same drift-guard as slice 2.

---

## 3. Authoring & the fail-closed build

`tools/vocab-build.mjs`: loads the source + the shared taxonomy `{slug: label}` from
`related-verses/topics.json`, runs `validateSource` (aborts on any failure), compiles `terms.json` +
`topic-terms.json`.

### Curation pipeline (per term)
1. Pick the term; **ground its definition in an established reference** (Lane's Lexicon, a recognized
   Islamic/tafsir glossary) via real research — never from memory.
2. Write `shortDef` + `longDef` + a non-blank `source` citation; map to existing topic slug(s).
3. Build validates + compiles.

**Term-set restriction (the safeguard in lieu of a review gate):** only well-established
linguistic/spiritual terms with lexicon-grounded definitions. Theologically contested, sectarian, or
ruling-adjacent terms are excluded from this slice.

---

## 4. Runtime module & UI

### `quran-vocab-core.js` (pure, DOM-free — shared by build + browser)
- `validateSource(source, taxonomy)` → `{ ok, errors }` (the §3 gate).
- `compileIndex(source, taxonomy)` → `{ terms, topicTerms }` (validated records + reverse map).
- `keyTermsForVerse(verseKey, topicTerms, verseIndex, terms)` → the verse's topics → their term
  summaries `{ slug, arabic, translit, shortDef }`, deduped, sorted by `translit`.
- `termCrossRefs(termSlug, terms, relatedVersesTopics, relatedHadithTopics, { vLimit = 3, hLimit = 2 })`
  → `{ verses, hadith }` gathered from the term's topic(s) in the shipped related indexes, deduped +
  capped.

### `quran-vocab.js` (wrapper)
Loads `src/data/vocab/terms.json` + `topic-terms.json` + the three reused indexes
(`related-verses/verse-index.json`, `related-verses/topics.json`, `related-hadith/topics.json`;
browser-cached). Adds a **"Key Terms"** footer button (third in the trio) → panel `kt-<k>`.
Rendering:
- **Chips:** each key term as `arabic · Translit` with the short definition beneath.
- **Expand:** long definition, the `source` citation, and cross-refs — *"In the Qur'an"* (top 3 verse
  refs) + *"In hadith"* (top 2, with grade badge) — pulled from the reused indexes.
- **Empty state:** *"No key terms indexed for this verse yet."*
- Same lazy-load + retry-on-transient-failure pattern as the sibling panels; `textContent` everywhere
  (XSS-safe); Arabic `dir="rtl"`.

---

## 5. Testing, compliance & success check

### Tests (`tests/quran/vocab-core.test.js`)
- **Core lookup:** `keyTermsForVerse()` returns the verse's topics' terms; dedups a term mapped to two
  of the verse's topics; sorts by `translit`; `[]` for an untagged verse. `termCrossRefs()` gathers
  from the term's topics, dedups, respects `vLimit`/`hLimit`.
- **Build/validation (fail-closed):** `validateSource` rejects blank `arabic`/`translit`/`shortDef`/
  `longDef`/`source`; empty `topics`; a topic slug absent from the taxonomy; non-kebab-case term slug.
- **Compile:** `compileIndex` builds the reverse `topicTerms` map (a term under two topics appears
  under both).
- **Data integrity:** every generated term has a non-blank `source` and ≥1 topic present in the
  taxonomy.

### Content-policy compliance
- Every definition carries a `source` (build-enforced). ✅
- No invented content — definitions grounded in cited references at curation. ✅
- No fatwas/rulings — lexical definitions only; contested/ruling-adjacent terms excluded. ✅
- Cross-refs reuse already-verified verse/hadith data (hadith only the signed-off Sahih/Hasan set). ✅

### Verifiable success check (definition of done)
1. Build runs clean; emits `terms.json` + `topic-terms.json`.
2. All unit + validation tests pass.
3. In `quran.html`, a tagged verse (e.g. 2:153) shows a **Key Terms** panel with the mapped term
   chip(s); expanding *Taqwā*/*Sabr* reveals the sourced definition + cross-ref verses/hadith; an
   untagged verse shows the empty state.

---

## 6. Deferred-work ledger (after this slice completes the Knowledge Index)

- ⏳ **Global glossary term-search** (type any term → definition; the net-new floating-search surface).
- ⏳ **Hadith-page cross-linking** (`hadith.html`).
- ⏳ **Disputed-grade handling** (`[GRADE DISPUTED]`).
- ⏳ **AI connecting-explanation blurb** (reuses `/api/ask-claude` guardrails + human-review gate).
- ⏳ **Web-based admin bulk-review UI**.
- ⏳ **Scale coverage** (more terms/tags via external references / staged suggestions).
- ⏳ **Contested / ruling-adjacent terms** (would need a review gate — deliberately out of this slice).
- ✅ **DROPPED as unnecessary:** D1 + FTS5 + `/api/index/*` worker routes — the curated exact-match/
  filter workload never justified a database; the whole Knowledge Index ships as static JSON.

---

*Derived from a brainstorming session on 2026-07-17. Next step: writing-plans skill → implementation
plan. Introduces no new worker routes, secrets, or storage bindings; reuses the slice-1/2 taxonomy and
indexes.*
