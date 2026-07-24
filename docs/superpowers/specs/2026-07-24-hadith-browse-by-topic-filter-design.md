# Browse by Topic — corpus-wide in-place filter

**Date:** 2026-07-24
**Status:** Approved (design) — ready for implementation plan
**Surface:** `hadith.html` "Browse by Topic" pill strip (US-H06 / US-H14)
**Supersedes (behavior):** Module 11's route-away pill interaction on the hadith page
(see `docs/superpowers/specs/2026-07-22-hadith-module-11-topics-design.md`). Per-topic
landing pages (`/hadith/topics/[key]`) and the index (`/hadith/topics`) are retained.

---

## 1. Problem & goal

The 14 "Browse by Topic" pills on `hadith.html` currently **route** (SPA-navigate) to
separate `/hadith/topics/[key]` landing pages that keyword-filter only the *loaded*
feed (Bukhari, Book 1). The first pill (`faith`) is hardcoded as visually "selected."

Goal: turn the pills into an **in-place, corpus-wide topic filter** with honest state,
accessibility, and result feedback — without conflating this with the existing
per-collection book-scoped browsing, and without fabricating a topic taxonomy that
does not exist.

## 2. Scope (documented to prevent conflation)

- **This feature** filters the **whole hadith corpus** by keyword via the existing
  `/api/hadith/search` endpoint called with **no `collection=` parameter** → all
  collections. Results render into the existing `#hadith-feed`.
- It is **separate from** per-collection book-scoped browsing (sidebar → collection →
  book → chapter walk, which sets `collection=`/book state). The two filtering models
  are independent and must not be conflated. This distinction is stated here and in a
  code comment on `wireTopics`.

## 3. Honesty / content-authenticity (charter invariant)

No curated topic taxonomy exists — Module 11 established that the provider returns no
topic tags (`topics: []`), and there is no `/similar` capability. Therefore:

- A pill maps to a **keyword** (e.g. `faith → "faith"`), and results are a **keyword
  match across all collections**, NOT a curated topic index.
- The status/count line carries a plain-language disclosure:
  **"Matched by keyword across all collections."**
- No per-topic counts, summaries, collection breakdowns, or relationships are
  fabricated. The only quantitative claim shown is the search engine's own result
  `total` (see §6).

This keeps the feature inside the no-fabrication invariant (root `CLAUDE.md` §3).

## 4. Interaction & state model

### Roles / ARIA
- `.topics-grid` → `role="radiogroup"` with an i18n `aria-label`
  (`hadith.topics.ariaLabel` = "Browse hadith by topic").
- Each pill → `role="radio"`, `aria-checked="true|false"`, roving `tabindex`
  (selected pill `tabindex=0`, all others `tabindex=-1`). This matches the
  reading-mode a11y pattern (radiogroup + `aria-checked`).
- Keyboard (WAI-ARIA radiogroup): Left/Up → previous pill (move + select),
  Right/Down → next pill (move + select), Home/End → first/last, Enter/Space →
  select focused. Selection change triggers the filter.

### No default selection
- On load with no `?topic=`, **zero pills checked**; the hardcoded `featured-topic`
  class is removed from `faith`. The neutral state shows the existing default feed
  (Bukhari, Book 1). *Interpretation confirmed with owner: "neutral mixed feed" means
  "no topic pre-applied," not a new multi-collection default. A genuinely
  multi-collection neutral feed is out of scope for this spec.*
- Roving-tabindex initial state (nothing checked): the **first** pill is the tab stop
  (`tabindex=0`), consistent with the radiogroup pattern for an unselected group; it is
  NOT `aria-checked` until chosen.

### Select / clear
- Selecting a pill:
  1. `history.pushState({... topic:key}, '', 'hadith.html?topic=<key>')`.
  2. Set that pill `aria-checked=true` (+ visual `featured-topic`), all others false;
     update roving tabindex.
  3. Run `runTopicFilter(key)` (§5).
- **Return to neutral**: a **"Clear"** control in the status line (not an extra "All"
  pill — preserves the fixed 14-pill, ~2-row, no-scroll layout). Clearing:
  `pushState` back to `hadith.html` (no `?topic=`), uncheck all pills, restore the
  neutral default feed.
- **Deep-link / restore**: on load, parse `?topic=<key>`; if valid, mark the pill
  checked and run the filter. Invalid key → strip param, neutral state.
- **`popstate`**: re-derive checked pill + feed from the URL (back/forward safe). Reuses
  the existing `renderRoute`/`parseRoute` plumbing where practical; `?topic=` is a
  query-param layer on the base `hadith.html` route (not a new path route).

## 5. Data flow

```
pill select ──▶ topicSearchQuery(key)  [pure core]  ──▶ keyword
            └─▶ ?topic=<key>  (pushState)
keyword ──▶ api.fetchHadithSearch(keyword, lang, page=1)  [GET /api/hadith/search]
        ──▶ { ok, data:{ results, total, lastPage, page, query } }
results ──▶ feed.buildCardHTML → #hadith-feed ; markCardStates ; applyGradeFilter
total   ──▶ status line "N hadith" (aria-live)
```

`runTopicFilter(key)` is a sibling of the existing `runGlobalHadithSearch(q)` and
reuses the same rendering path (card renderer, `FEED.byRef`, grade filter). It differs
only in: source of the query (topic keyword), URL state, status/count line, and the
topic-specific empty copy.

## 6. Live result count

- **Worker change (additive, safe):** in `worker/src/hadith.js` `search()`, the
  normalizer currently returns `{ results, page, query }`. Add
  `total: raw.hadiths?.total ?? null` and `lastPage: raw.hadiths?.last_page ?? null`,
  mirroring the list/collection handlers that already pass these through.
- **Frontend:** read `res.data.total`. If a number → show **"N hadith"** in an
  `aria-live="polite"` status region. If `null` (provider omits / stale cache without
  the field) → honest fallback **"25+ · Load more"** (page-scoped), never a fabricated
  total.
- The count line also hosts the **"Clear"** control and the §3 keyword disclosure.

## 7. Loading / empty / error — three distinct states

| State | Trigger | Rendering | Copy |
|-------|---------|-----------|------|
| Skeleton | query in flight | `ui.renderLoadingState(#hadith-feed, N)` | (skeleton cards) |
| Empty | `ok && results.length === 0` | dedicated empty block (not a card, not an error) | "No hadith found for this topic yet" |
| Error | `!ok` / network / bad shape | `ui.renderErrorState(..., retry)` | "Search temporarily unavailable — try again" + Try again |

Empty and error are visually and semantically distinct — an empty result must never
look like a failed request. Empty is a calm note; error is an alert with a retry action.

## 8. Layout / RTL

Keep the existing `.topics-grid` `display:flex; flex-wrap:wrap` (14 pills, ~2 rows, no
scroll). No horizontal scroll is introduced (deliberate: RTL scroll-direction bugs for
no benefit over the link-out). "View all topics →" links to the existing
`/hadith/topics` index (reused, not rebuilt). RTL is inherited from the page `dir`.

## 9. i18n / Arabic labels

- Pills are already fully translated (all 14 in `ar.json` via `data-i18n`). Confirmed
  present.
- **New keys** (added to `en.json` + `ar.json`; other 8 locales fall back to English per
  the existing i18n fallback): `hadith.topics.ariaLabel`, `hadith.topics.clear`,
  `hadith.topics.countOne` / `hadith.topics.countMany` (or a `{n}` template),
  `hadith.topics.countMore` ("25+"), `hadith.topics.empty`,
  `hadith.topics.error`, `hadith.topics.keywordNote` (disclosure),
  `hadith.topics.filteredBy` ("Filtered by {topic}").
- The status "Filtered by {topic}" label uses the **translated pill text** (from the
  DOM), NOT the core's English `label:` — so it is correct in Arabic.

**Flagged limitation (not fixed here):** `src/js/hadith-topics-core.js` `TOPICS[].label`
values remain English-only. They are still consumed by the retained landing pages
(`renderTopicLanding` header/breadcrumb) and the co-occurrence rail. Localizing the core
labels is a separate follow-up, tracked but out of scope for this feature.

## 10. Accepted inconsistency (flagged)

The retained per-topic landing pages keyword-filter only the *loaded* feed, while the
pills now filter the *corpus*. This mild inconsistency is accepted: landing pages are a
separate deep-link surface reachable via "View all topics → index → cards." Aligning
landings to corpus search is a possible future follow-up, not part of this spec.

## 11. Files touched

- `hadith.html` — pill strip: `role=radiogroup`, per-pill `role=radio`/`aria-checked`,
  remove `featured-topic` default on `faith`, add status/count/clear container, i18n
  hooks; CSS for checked state (reuse `featured-topic` visual) + empty-state styling.
- `src/js/hadith.js` — rewrite `wireTopics()` (route → in-place filter + keyboard
  radiogroup nav); `?topic=` parse on init + `popstate`; new `runTopicFilter(key)`;
  status/count/clear rendering; scope comment.
- `src/js/hadith-topics-core.js` — additive pure helpers: `topicSearchQuery(key)`,
  `formatTopicCount(n)` / count copy selection, `radioState(topics, activeKey)` (derive
  aria-checked/tabindex map). No change to existing exports.
- `worker/src/hadith.js` — `search()` normalizer: add `total`/`lastPage` passthrough.
- `src/locales/en.json`, `src/locales/ar.json` — new keys (§9); other locales fall back.
- Tests (§12).

## 12. Testing (TDD)

- **Worker:** `search returns total/lastPage passthrough` (extend
  `worker/test/hadith-router.test.js` fixtures which already include `total`/`last_page`).
- **Core (`hadith-topics-core`):** `topicSearchQuery` mapping (valid key → keyword,
  invalid → null); count copy (`0`→empty path, `1`→singular, `n`→plural, `null`→"25+");
  `radioState` derives one checked + roving tabindex, none-checked initial → first is
  tab stop.
- **State transitions (unit, mockable):** select sets `?topic=`/checked; clear restores
  neutral; deep-link `?topic=charity` restores checked + triggers filter; invalid key
  strips param.

## 13. Out of scope

- Curated topic dataset / per-topic counts-by-collection / summaries / relationships.
- Multi-collection neutral default feed.
- Localizing `hadith-topics-core.js` `label:` values.
- Aligning landing pages to corpus search.
- Adding topics beyond the 14 named in the PRD (the PRD's "16" gap stays flagged, not
  invented — consistent with Module 11).
