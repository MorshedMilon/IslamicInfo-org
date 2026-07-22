# Hadith Module 11 — Topic Index, Topic Landing Pages & Related-Hadith Graph (US-H14/H15)

**Date:** 2026-07-22
**Covers:** PRD §3.3 US-H14/H15 · TechSpec Stage-3 sections
**Status:** Design — awaiting user review before plan.

---

## 1. Context & reconciliation (the deciding facts)

Module 11's prompt describes a rich, curated content feature. Exploration shows **almost all of its
substance is curated Islamic content/data that does not exist in the repo and cannot be fabricated** —
the same pattern as Module 8 (narrator panel: engineering-only, dataset deferred) and the review-gated
Knowledge Index. Confirmed against the repo:

| Prompt / PRD asks for | Repo reality | Resolution |
|---|---|---|
| **16 topic cards** | PRD US-H14 says "16" but **names only 14** — the hero-strip chips (`faith, prayer, charity, fast, hajj, purification, knowledge, character, marriage, supplication, hereafter, trade, death, justice`). The 2 extra are unnamed anywhere. | **Use the 14 real topics; flag the 16-gap** (do not invent 2). Verification note lists all 14 as PRD-sourced + the unresolved gap. |
| Per-topic **hadith count across all collections** + **top-3 contributing collections** | Adapter returns `topics: []` (provider has **no** topic tags — [api.js:415](../../../src/js/api.js), [worker/src/lib/hadith-source.js](../../../worker/src/lib/hadith-source.js) exposes only chapters/hadiths). No curated hadith-topic dataset for this taxonomy. | **Omit counts + top-3 collections** (no source — never faked). Deferred to a curated dataset + review. |
| Topic-landing **scholarly summaries** + **"Scholar commentary"** related-cards | Editorial Islamic content → **CONTENT-POLICY.md §5 human-review gate** (draft → hadith-verifier → human review → publish). | **Not authored.** One honest header line states curated study aids are pending review. |
| `/api/hadith/{collection}/{id}/similar` (related graph) | **No such endpoint**; hadithapi.com has no similar/topic capability; isnad data is "unavailable" (Module 8). | **Honest "unavailable" `.related-grid` shell**, zero fabricated cards; never a fake "Same narrator". |
| Topic index/landing **mockup** | None — only `hadith.html`. Net-new pages, no canonical visual (like Module 10 components). | Build from **locked design-system tokens** (collection-card vocabulary). |

**Approved scope (user, 2026-07-22):** honest engineering slice — routing + shells + the chip-behavior
switch + the existing **keyword-filtered feed** (honestly labeled) + honest deferred states. **Zero**
fabricated taxonomy/counts/summaries/narrations/relationships.

---

## 2. Architecture

New pure module **`src/js/hadith-topics-core.js`** (UMD `II.hadithTopics`, unit-tested), holding:
- **`TOPICS`** — the 14-topic taxonomy `{ key, label, keyword }`, derived from the real hero chips.
  **No counts/collections** (deferred).
- `topicByKey(key)`, `isTopicKey(key)` — lookup + slug validation.
- **`coOccurringTopics(loadedHadith, topicKeyword, topics)`** — pure; see §5.

`hadith.js` does routing + DOM (reusing the existing feed/render/route machinery). `tier3-deep-view-core.js`
gains the honest related-grid block. Mirrors every other hadith module's core+DOM split.

---

## 3. Routing

Extend `renderRoute(r)`: intercept `r.collection === 'topics'` **before** the collection lookup.
- `/hadith/topics` (`r.book == null`) → **topic index**.
- `/hadith/topics/[topic]` (`r.book` = topic key; validated via `isTopicKey`) → **topic landing**; unknown
  key → redirect to `/hadith/topics`.
Reuses `parseRoute` (the existing 3-segment regex already parses these), `routeTo`/pushState, and the
GitHub-Pages 404-SPA deep-link fallback. Breadcrumbs reuse `.dv-breadcrumb`. No new routing primitives.

---

## 4. `/hadith/topics` — index page

Rendered into the existing Tier-2 container (`#ii-tier2`, `setTier(2)`). Header + breadcrumb (`Hadith › Topics`).
**14 cards** in a grid, reusing collection-card vocabulary. Each card:
- **icon** (reuse existing vocabulary — the hero-chip / collection-card icon set; no new icons),
- **topic name** (Inter 600),
- **"Study this topic →"** link → `/hadith/topics/[key]`.

**No hadith count, no top-3 collection chips** — omitted (no data source; never faked). Cards are pure
navigation. Net-new visuals built from locked tokens (no new colors/fonts/hex).

---

## 5. `/hadith/topics/[topic]` — landing page

- **Header:** topic name (display-lg) + one honest line:
  *"Curated study aids for this topic — scholarly summary, key narrations, and study order — are being
  prepared and will appear after review."* (No summary authored.)
- **Topic-keyword-filtered feed (the real value):** render into the `#ii-tier2` landing a keyword-filtered
  list built from the **already-loaded `FEED.byRef`** via `II.hadithFeed.buildCardHTML` (the same card
  component). Filter = the existing case-insensitive keyword substring test over each hadith's text. If
  `FEED.byRef` is empty (direct deep-link before the Tier-1 feed loaded), trigger `loadHadithFeed(false)`
  first, then render. This does **not** reuse the Tier-1 `#hadith-feed` container (hidden under
  `data-tier=2`) and does **not** rewire `loadHadithFeed`. Landing pagination/"load more" is **deferred**
  (shows matches within the loaded feed). Cards render with an honest label: *"Hadith matching '[label]'
  — a keyword match across the loaded hadith, not a curated topic classification."* Bookmark/note/etc.
  work automatically via the document-delegated `wireCardActions` + `markCardStates`.
- **Right rail — co-occurring topics (real signal, honest):**
  - Computed by `coOccurringTopics(loadedHadith, topic.keyword, TOPICS)`: over the loaded hadith whose text
    contains this topic's keyword, count how many **also** contain each other topic's keyword; return the
    others with count ≥ 1, **ranked by count desc**.
  - Rendered as a labeled list: header **"Also appears in these hadith"** + sub-note *"Topics whose
    keywords co-occur in the loaded hadith — a text signal over the loaded sample, not a curated
    relationship."* Each row: topic name → `/hadith/topics/[key]` + the co-occurrence count.
  - **Omitted entirely** when the list is empty or the feed isn't loaded (honest empty, no false claim).
  - `coOccurringTopics` is pure/unit-tested (text-blob array + keyword in → ranked `{key,label,count}[]`).
- **Key Narrations / Study-order scaffolding: skipped** (YAGNI — pure empty placeholders; the one honest
  header line covers the deferral).

**`coOccurringTopics` contract:**
```js
// loadedHadith: Array<{ text: string }>  (hadith.js builds text from FEED.byRef: matn+translation+narrator+reference)
// returns others with count>=1, sorted by count desc then label asc
coOccurringTopics(loadedHadith, topicKeyword, topics) -> Array<{ key, label, count }>
```
Matching is the same case-insensitive substring test the feed already uses (consistent with Module 5's
heuristic). No stemming/curation claimed.

---

## 6. Topic-chip behavior switch (DoD)

`wireTopics` flips from **in-place filter → routing**: a chip click routes to `/hadith/topics/[key]`
(no more `setSearchQuery`/in-place toggle). The hero **"View all topics →"** header link → `/hadith/topics`.
Removes the dual behavior entirely (PRD: *"clicking a topic chip routes instead of filtering in-place"*).
Chip `keyword`/`data-topic` values are unchanged (reused as the landing's feed keyword).

---

## 7. Related-hadith graph — Tier-3b (`tier3-deep-view-core.js`)

Add an honest **`.related-grid` block** to the Tier-3b deep view, below the topics section:
- A single honest state: *"Related narrations are being compiled and will appear once verified against
  source chains."*
- **Zero** cards, no "Thematically related / Same narrator / Parallel narration / Scholar commentary"
  fabrication, no filter chips (nothing to filter).
- Wired to a future `/similar`-style source + curated data (deferred). Never asserts a relationship
  without real chain/similarity data.

---

## 8. Content-authenticity boundaries (firm)

- No editorial summaries, no scholar commentary, no fabricated counts / top-3 collections / key narrations
  / study order / related cards / topic-relevance rankings.
- The only relevance signal shown is **keyword co-occurrence over the loaded feed**, explicitly labeled as
  a text signal, not curation.
- Everything deferred is flagged for human curation + CONTENT-POLICY §5 review.
- Verification note (required): list the **14 topics used** (all PRD-sourced) and flag the **2 unnamed**
  (16-gap) as inferred-gap-not-filled.

---

## 9. Files touched

| File | Change |
|---|---|
| `src/js/hadith-topics-core.js` | **NEW** — `TOPICS` (14), `topicByKey`/`isTopicKey`, `coOccurringTopics`; UMD + unit tests. |
| `worker/test/hadith-topics-core.test.js` | **NEW** — taxonomy shape (14, PRD keys), lookup/validation, co-occurrence ranking + empties. |
| `src/js/hadith.js` | Topic routing (`renderRoute` intercept), index + landing render, chip-behavior switch, co-occurrence rail. |
| `hadith.html` | Topic-card + topic-index/landing + co-occurrence-rail CSS (locked tokens); "View all topics →" link; chip hrefs. |
| `src/js/tier3-deep-view-core.js` | Honest `.related-grid` unavailable block on Tier-3b. |

---

## 10. Scope boundaries (YAGNI / deferred)

**In:** chip-routing switch, `/hadith/topics` index (nav-only cards), `/hadith/topics/[topic]` landing
(honest header + keyword feed + co-occurrence rail), honest Tier-3b related-grid state.

**Out (deferred to human curation + review):** the 2 unnamed topics; curated per-topic counts + top-3
collections; scholarly summaries; key narrations; study order; the real related-hadith graph (needs a
`/similar` source + verified similarity/chain data); curated topic-relevance rankings.

**Documented limitation (honest, labeled):** the landing's keyword feed + co-occurrence rail operate over
the **loaded default feed** (Sahih al-Bukhari, Book 1 — the only feed Stage-1 loads), not the full corpus.
Real cross-collection topic retrieval is deferred (needs the curated topic dataset). The UI never implies
otherwise ("across the loaded hadith").

---

## 11. Definition of Done

- [ ] Topic chips fully switched from in-place filter → routing (no dual behavior).
- [ ] `/hadith/topics` renders the 14 topic cards (nav-only; no faked counts).
- [ ] `/hadith/topics/[topic]` renders header + honest deferral line + keyword-filtered feed (labeled).
- [ ] Co-occurrence rail shows only real ≥1 co-occurrences (ranked), labeled as keyword co-occurrence;
      omitted when empty. Pure fn unit-tested.
- [ ] Tier-3b related-grid shows the honest "unavailable" state; **no** fabricated relationship cards.
- [ ] No editorial/scholarly content authored; deferred items flagged for review.
- [ ] Verification note lists the 14 PRD-sourced topics + flags the 2-topic gap.
- [ ] `node --check` clean; full test suite green.
