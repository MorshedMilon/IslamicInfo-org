# Related Hadith Knowledge Index — Design Spec

**Date:** 2026-07-17
**Status:** Approved (brainstorming) → ready for implementation plan
**Slice:** 2 of 3 of the "QuranlyAI Knowledge Index" (Related Hadith)
**Predecessor:** `2026-07-17-related-verses-index-design.md` (slice 1, shipped)

---

## 1. Context & scope

Slice 2 adds a topic-based **Related Hadith** panel to the Quran reader, mirroring the shipped
Related Verses feature but carrying hadith's stricter authenticity gates. It reuses the taxonomy and
the `verse-index.json` artifact built in slice 1: a verse's topic slugs drive **both** panels.

Unlike verses (verbatim primary text, shipped without a 🕌 gate), hadith is a higher risk class.
CONTENT-POLICY §5 makes the human-review gate the primary safeguard: *draft → hadith-verifier →
human review → publish*. This slice honors that — **only reviewed entries ship; production go-live is
gated on the operator's (Morshed's) 🕌 sign-off.**

### Decisions resolved during brainstorming

| Fork | Decision | Rationale |
|---|---|---|
| Surface | **Verse-reader panel on the shared taxonomy** | Reuses slice-1's 20 topic slugs + `verse-index.json`; "Related Hadith" sits beside "Related Verses" on each verse. Highest reuse; matches the original Knowledge Index "verseId/topicSlug → hadith" shape. Hadith-page cross-linking deferred. |
| Storage | **Static JSON** (not D1/FTS5) | Topic lookup is exact-match, no free-text search. Same pattern as slice 1. **D1 + FTS5 moves to the Vocabulary slice**, where free-text search actually justifies it. This slice touches neither D1 nor the `/api/hadith` 501 route (that route powers the separate hadith *browse* page, unrelated to a topic index). |
| Authenticity threshold | **Sahih + Hasan only** | Weak (Da'if), fabricated (Mawdu'), and disputed-grade narrations are excluded from the index entirely — never surfaced as a suggestion to a general reader. Grade + gradedBy shown on every row regardless. Disputed-grade handling deferred. |
| Canonical source | **hadithapi.com** | sunnah.com API access was applied for and not granted. hadithapi.com provides ~9 major collections (Bukhari, Muslim, Tirmidhi, Abu Dawud, Ibn Majah, Nasa'i, Mishkat, Musnad Ahmad, Silsila Sahiha) in Arabic/English/Urdu with a `status` grade field (Sahih/Hasan/Da'eef). Gaps: no structured isnad field, no documented `gradedBy` or licensing — filled/confirmed at curation (below). Every entry is independently verifier-gated, so the API's SLA is not on the critical path. |
| Isnad | **Verified `isnadSummary` per hadith, shown on expand** | Free APIs don't expose structured chains. The hadith-verifier skill produces an "Isnad Chain: key narrators" line per confirmed hadith; that verified summary is authored into the row (+ full Arabic, which carries the sanad). Treated like a citation: **never invented, fail-closed if absent.** Full multi-generation chains are out of scope for the compact list. |
| Review gate | **Build + stage; hold production behind 🕌 sign-off** | Every row has a `reviewed` boolean; the build emits **only `reviewed:true`** rows. Unreviewed content never reaches the client. Initial ship may be empty/partial; the panel shows an empty state until entries are signed off. |
| Module structure | **Parallel module, shared taxonomy** | New `quran-related-hadith-*` files; the shipped, reviewed Related Verses module is left untouched. The shared artifact is the taxonomy + `verse-index.json`, not the code — hadith's stricter gates stay cleanly separated. |

---

## 2. Data model & files

**Reused (unchanged):** `src/data/related-verses/verse-index.json` — verse → topic slugs. Hadith are
tagged to those **same 20 slugs**.

### New files
| File | Responsibility | New/Modify |
|---|---|---|
| `tools/related-hadith/topics.source.json` | Hand-authored curation source; **all** entries with a `reviewed` flag. | Create |
| `tools/related-hadith-build.mjs` | Validating, fail-closed build; emits only `reviewed:true` rows. | Create |
| `src/data/related-hadith/topics.json` | Generated: topic slug → reviewed hadith rows. | Generated |
| `src/js/quran-related-hadith-core.js` | Pure: `validateSource`, `compileIndex`, `relatedHadith`. | Create |
| `src/js/quran-related-hadith.js` | Browser wrapper: load + render the per-verse panel. | Create |
| `tests/quran/related-hadith-core.test.js` | Unit tests. | Create |
| `quran.html` | Panel markup hook, CSS, script includes. | Modify |
| `src/js/quran-verses.js` | Footer "Related Hadith" button + panel container in `buildCard`. | Modify |
| `doc/DATA.md`, `doc/API-SPEC.md`, `doc/TASKS.md` | Register data files + client-direct feature. | Modify |

### Curation source row (`topics.source.json`)
Fuller than the verses source — hadith text is **authored + verifier-confirmed**, not fetched, so
**no API key in the build**:
```json
{
  "patience": {
    "label": "Patience (Sabr)",
    "hadith": [
      { "collection": "Sahih al-Bukhari", "book": "Book of Patience", "number": 1469,
        "arabic": "…full Arabic incl. sanad…", "english": "…translation…",
        "narrator": "Abu Sa'id al-Khudri",
        "isnadSummary": "Malik → … → Abu Sa'id al-Khudri → Prophet ﷺ",
        "grade": "Sahih", "gradedBy": "Al-Bukhari",
        "url": "https://hadithapi.com/…", "score": 9, "reviewed": false }
    ]
  }
}
```

### Generated row (`src/data/related-hadith/topics.json`)
Same minus `reviewed` (stripped — only reviewed rows ship), plus a composed `ref`
("Sahih al-Bukhari 1469"), rows sorted by `score` desc.

**Taxonomy consistency:** the build loads `src/data/related-verses/topics.json` and **fails** if a
hadith uses a topic slug/label absent from the shared taxonomy — the two features cannot drift apart.

---

## 3. Authoring, verification & the fail-closed build

`tools/related-hadith-build.mjs` **aborts (nothing ships)** if any row fails:

- **Grade whitelist:** `grade` is exactly `"Sahih"` or `"Hasan"`.
- **`gradedBy` non-blank** — grading scholar always named.
- **`isnadSummary` non-blank** — verified chain; treated like a citation, never invented.
- **Required + typed:** `collection` (∈ allowed canonical list), `number` (positive int), `arabic`,
  `english`, `narrator`, `url` (https), `score` (int 1–10), `reviewed` (boolean).
- **No duplicate** `(collection, number)` within a topic.
- **Taxonomy check:** slug + label present in the verses taxonomy.
- **Review filter:** only `reviewed:true` rows compile; the build **logs the count of pending
  (`reviewed:false`) rows held back** (no silent truncation). Topics with zero reviewed hadith are
  omitted from the generated index.

### Allowed canonical collections
Sahih al-Bukhari · Sahih Muslim · Jami' at-Tirmidhi · Sunan Abu Dawud · Sunan Ibn Majah ·
Sunan an-Nasa'i · Mishkat al-Masabih · Musnad Ahmad · Al-Silsila as-Sahiha.

### Curation pipeline (per hadith)
1. Pull candidate text + grade from **hadithapi.com**.
2. **Run the hadith-verifier skill** — cross-reference ≥2 trusted sources (sunnah.com / ihadis.com /
   islamqa.info); confirm collection · number · narrator · **isnad** · grade · gradedBy. If it can't
   be confirmed, **drop it** (never guess).
3. Author the row into `topics.source.json` with `reviewed: false`.
4. **Human-review gate (operator):** review the verified set, flip approved rows to `reviewed: true`,
   rebuild. Unreviewed content never reaches the client.

---

## 4. Runtime module & UI

### `quran-related-hadith-core.js` (pure, DOM-free — shared by build + browser)
- `validateSource(source, taxonomy)` → `{ ok, errors }` (the §3 gate).
- `compileIndex(source, taxonomy)` → `{ topics, pendingCount }` (filters `reviewed:true`, strips the
  flag, composes `ref`, sorts by score desc with deterministic tiebreak).
- `relatedHadith(verseKey, hadithTopics, verseIndex, { limit = 5 })` → the verse's topic slugs (from
  the reused `verse-index.json`) → hadith across those topics, dedup by `collection+number` (highest
  score wins), score-desc + deterministic tiebreak, capped at `limit`. Each row carries its topic
  label.

### `quran-related-hadith.js` (wrapper)
Loads `src/data/related-hadith/topics.json` + `src/data/related-verses/verse-index.json`
(browser-cached), adds a **"Related Hadith"** footer button beside "Related Verses" on each verse
card. Rendering:
- **Collapsed row:** grade badge (`[Sahih]` / `[Hasan]`, authenticity-label style) · `collection ·
  number` · narrator · English snippet.
- **Expand ("View full ▾"):** full **Arabic (RTL)**, `isnadSummary`, `gradedBy`, `source ↗` link.
- **Empty state:** *"No reviewed related hadith yet."* (honest about the review gate).
- Same lazy-load + retry-on-transient-failure pattern as the verses panel. All dynamic text via
  `textContent` (XSS-safe); Arabic set `dir="rtl"`. No verdicts — sourced graded list only.

---

## 5. Testing, content-policy compliance & success check

### Tests (`tests/quran/related-hadith-core.test.js`)
- **Core lookup:** `relatedHadith()` gathers across a verse's topics; dedups a hadith tagged under
  two topics (highest score); sorts by score; respects `limit`; `[]` for an untagged verse.
- **Build/validation (fail-closed):** `validateSource` rejects — grade ∉ {Sahih, Hasan}; blank
  `gradedBy`; blank `isnadSummary`; missing `collection`/`number`/`arabic`/`english`/`narrator`/`url`;
  non-boolean `reviewed`; score out of range; duplicate `(collection, number)`; slug/label absent
  from the verses taxonomy.
- **Review filter:** `compileIndex` emits only `reviewed:true` rows, strips the flag, reports
  `pendingCount`; a topic with zero reviewed hadith is omitted.
- **Data integrity:** every generated row has grade ∈ {Sahih, Hasan}, non-blank `gradedBy` +
  `isnadSummary`, and a valid `ref`.

### Content-policy compliance
- Grade + gradedBy on every row (build-enforced). ✅
- isnad verified, never invented; fail-closed. ✅
- Sahih/Hasan only; weak/fabricated/disputed excluded. ✅
- hadith-verifier skill run per hadith at curation. ✅
- Human-review gate honored — only `reviewed:true` ships. ✅
- No fatwas — sourced graded list, no verdicts. ✅

### Verifiable success check (definition of done)
1. Build runs clean; with an all-`reviewed:false` source it emits an **empty** index and logs the
   pending count.
2. All unit + validation tests pass.
3. Flip a couple of verified entries to `reviewed:true`, rebuild → in `quran.html`, a tagged verse
   (e.g. 2:153) shows a **Related Hadith** panel with grade badge + citation + narrator, expandable
   to Arabic + isnad + gradedBy + source link; a verse whose topics have no reviewed hadith shows the
   empty state.

---

## 6. Deferred-work ledger (after this slice)

- ⏳ **Vocabulary** — terms + cross-references into verses & hadith; **D1 + FTS5** (free-text search
  justifies the DB here).
- ⏳ **`/api/index/*` worker routes** (with D1).
- ⏳ **Hadith-page cross-linking** (related hadith on `hadith.html`; separate from the `/api/hadith`
  501 route).
- ⏳ **Disputed-grade handling** (surface al-Albani vs al-Arna'ut style disputes with `[GRADE
  DISPUTED]`).
- ⏳ **AI connecting-explanation blurb** (reuses `/api/ask-claude` guardrails + human-review gate).
- ⏳ **Web-based admin bulk-review UI** (replaces the flip-`reviewed`-in-JSON workflow at scale).
- ⏳ **Scale tag coverage** via external index / staged suggestions.
- ⚠️ **Production go-live for Related Hadith is gated on the operator's 🕌 sign-off.**

---

*Derived from a brainstorming session on 2026-07-17. Next step: writing-plans skill → implementation
plan. Introduces no new worker routes, secrets, or storage bindings; reuses the slice-1 taxonomy and
`verse-index.json`.*
