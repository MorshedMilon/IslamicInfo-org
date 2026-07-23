# Hadith Collection Browse — Endless List + In-Collection Search

**Date:** 2026-07-23
**Status:** Design approved (awaiting spec review → plan)
**Scope:** Hadith Library, Tier-3a in-book list view + one additive Worker route

---

## 1. Problem

Every hadith collection a user opens lands in the shared **Tier-3a list view**
([`src/js/tier3-deep-view.js`](../../../src/js/tier3-deep-view.js) → `renderList`). That view has three hard limits:

1. **Caps at 25 hadith, forever.** It calls `fetchHadithsByBook(slug, book, 1, 25)`
   (page 1, limit 25) and never requests page 2. There is no "Load More" in this view.
2. **"Previous / Next" navigate *books*, not hadith.** They are the `.dv-prevnext`
   book nav (`bookNavHTML`, "← Previous book / Next book →"). For multi-book collections
   they jump chapters; for direct-source collections (Bulugh, Muwatta, …) the book list
   is empty so no nav renders at all — the reader is stranded at 25 with no way forward.
3. **No search.** A reader cannot jump to a hadith number or filter by keyword.

Additionally, the per-card **"Open Full View"** (the "view more" button) is wired but
reported as not working for the user; the true cause is to be found by systematic
debugging (suspected: the `slug:0:num` book segment on bookless collections, or a
deep-view stub path).

## 2. Goals

- A collection reads as **one endless list**: "Load More" appends 25 more and keeps
  flowing **past book/chapter boundaries automatically** — no "next book" jump during reading.
- An **in-collection search** box that (a) jumps directly to a hadith by number, and
  (b) filters by keyword text — both scoped to the collection currently being viewed.
- Behaviour is **consistent across every collection** (sidebar menu item), both
  hadithapi-backed and direct-source (fawazahmed0 / AhmedBaset).
- **"Open Full View" works everywhere.**

## 3. Non-Goals

- No global cross-collection search (explicitly deferred; scoped to current collection).
- No new hadith content, gradings, isnad, or translations authored. This is a
  **UX/pagination change only** — all content-authenticity invariants are untouched
  (grade rules per `hadith-module-decisions`: grader `null` → honest fallback, never
  fabricated; direct-source `grade:null` → collection-level characterization badge).
- No change to the Module-2 landing feed (`loadHadithFeed` / `#hadith-feed`).
- No removal of the books grid (see Decision D3).

## 4. Decisions (from brainstorm)

- **D1 — Endless across books.** Load More streams the *whole collection* continuously.
  For hadithapi collections this requires a small additive Worker route serving a
  collection flat (see §5.1). Direct sources already return the whole collection.
- **D2 — Search: number + keyword, current collection only.** Number → opens that
  hadith's full view. Keyword → results via the existing `/api/hadith/search`, scoped
  to the current collection.
- **D3 — Keep the books grid as an *optional* "jump to chapter" entry.** Removing the
  automatic next-book jump during reading is the ask; the deliberate ability to navigate
  to a specific book/topic is retained because hadith collections are organized
  thematically. Entering via a specific book anchors the endless list at that book and
  flows forward through the rest of the collection (see §5.2).
- **D4 — Approach A: upgrade Tier-3a in place.** Reuse the existing card rendering,
  grade-filter pills, routing, and the proven `feed.dedupeByRef` + Load-More state
  pattern rather than retiring the view or building a new module.

## 5. Architecture

> **Implementation refinement (added at plan time, 2026-07-23).** Endless pagination
> for hadithapi collections is implemented as a **chapter-walk** (page through book 1,
> then book 2, … using the *existing* per-book route + the cached book list) rather than
> a chapter-less flat listing. Same user-facing behaviour (one endless list across book
> boundaries), it makes the D3 books-grid anchoring trivial (start the walk at the chosen
> book), and it removes the unverified "hadithapi serves a book-only listing" assumption
> from the critical path. The new Worker route below is retained **only** as the
> number→book resolver (`?hadithNumber=`, a proven filter); its flat-list mode is a
> verified bonus, not required for pagination. Direct-source collections page a single
> flat sequence as before.

### 5.1 Backend — one new route (additive): number resolver (+ optional flat list)

File: [`worker/src/hadith.js`](../../../worker/src/hadith.js)

```
GET /api/hadith/collections/:slug/hadiths?page=&limit=
```

- Validates `slug ∈ ALLOWED_SLUGS`; `limit = min(limit||25, 200)`; `page = page||1`.
- Calls hadithapi via `hadithsUrl(base, key, { book: slug, paginate: limit, page })`
  — **no `chapter`** → the whole collection, sequentially.
- Normalizes with the existing `normalizeHadith`; returns the SAME envelope shape as the
  per-book route: `{ hadiths, page, limit, total, lastPage }` (from `raw.hadiths.total`
  / `raw.hadiths.last_page`).
- KV cache key `hKey('flatlist', slug, page)`, `TTL.DAY`, same `liveOrCache` pattern.
- The existing per-book route (`/collections/:slug/books/:bookNum/hadiths`) is **kept
  unchanged** — the Tier-3b deep-view neighbour logic and the books-grid entry still use it.

> **VERIFY BEFORE SHIP (anti-hallucination):** confirm against a *live* hadithapi
> response that a book-only query (no `chapter`) returns paginated hadith with populated
> `total` / `last_page`. If book-only listing is not supported, fall back to
> chapter-walk (page through book 1, then book 2, …) driven client-side — see §5.2
> continuation logic, which already crosses books.

Client wrapper: `api.fetchHadithCollectionFlat(slug, page, limit)` in
[`src/js/api.js`](../../../src/js/api.js), routed by provider:
- `hadithapi` → the new flat route.
- direct sources → existing `fetchHadithsByBook(slug, book, page, limit)` (already flat,
  already returns `total`/`lastPage` via `_pageDirect`).

### 5.2 Frontend — endless list state (`renderList`)

Introduce per-view state, mirroring the Module-2 `FEED`:

```
LIST = { slug, startBook, page, lastPage, total, refs:Set, byRef:{}, grade, loading }
```

- **Initial load:** page 1 of the flat stream (or, when entered via the books grid,
  anchored at `startBook` — see below). Render via `host.feed.buildCardHTML`, dedupe
  with `feed.dedupeByRef`.
- **Load More:** a single centered button (reuse `.load-more-btn` markup + a
  `setLoadMore`-style state machine: `idle | loading | end | error`). Each click fetches
  `page + 1`, dedupes, **appends**. When `page >= lastPage` → end state ("You've reached
  the end of {collection}"). Errors → non-destructive toast + retry (never wipes loaded
  cards), matching the Module-2 feed behaviour.
- **Book Prev/Next nav (`bookNavHTML`) is removed** from this view — its job (crossing
  books) is now the endless stream's job.
- **Grade-filter pills** keep working, re-applied to the growing list (`applyListGradeFilter`).

**Books-grid entry (D3) anchoring.** When the user arrives from the books grid at a
specific book:
- hadithapi: start by loading that book (existing per-book route), then Load More
  continues into subsequent books to the end of the collection (endless forward). A
  "↑ Earlier books" affordance may load preceding books; if that proves fiddly it is a
  plan-time refinement, not a blocker.
- direct sources: books grid is not shown (they are bookless); entry is always the whole
  flat collection.

### 5.3 Frontend — in-collection search (D2)

A search bar at the top of the list, scoped to `LIST.slug`:

- **Number path** (input parses to a positive integer): open that hadith's full view.
  - direct sources: `fetchSingleHadith(slug, book, num)` already finds-by-number in the
    loaded flat file → route to Tier-3b.
  - hadithapi: resolve the number to its real book via a `{ book: slug, hadithNumber }`
    query (chapter-less), then route to Tier-3b with the resolved book. (Implementation
    may reuse the flat route with an optional `hadithNumber` param, or a thin resolver —
    decided in the plan.)
  - Not found → honest inline "No hadith #N in {collection}."
- **Keyword path** (non-numeric text ≥ 2 chars): call `/api/hadith/search`, extended
  with an optional `collection`/`slug` param passed to hadithapi as
  `{ book: slug, hadithEnglish|hadithArabic: q }`. If hadithapi will not combine `book`
  with a text filter, fall back to filtering search results client-side by
  `collectionSlug`. Direct sources: filter the loaded flat array client-side (the whole
  collection is already in memory). Results render as cards in the same list container
  with a "clear search → back to full collection" control.

### 5.4 "Open Full View" fix (§1.4)

Reproduce, then fix via `superpowers:systematic-debugging`. Ensure the card's
`data-act="full"` → `host.routeTo({collection, book, hadith})` opens the real Tier-3b
deep view for **every** collection (bookless `slug:0:num` included), with no stub path.

### 5.5 Tests

- Pure pagination/search-state logic (append, dedupe, `page>=lastPage` end, number-vs-keyword
  parse) → unit tests in the repo's core/DOM split style (extend
  `worker/test/*` or a new `*-core.test.js`).
- New Worker flat route → handler test with an injected `fetcher` (no network), asserting
  URL params (`book=slug`, no `chapter`), envelope shape, and `total`/`lastPage` mapping.
- Search route `collection` scoping → handler test.

## 6. Invariants & Risk

- **Authenticity untouched.** No content authored; grade/isnad/translation rules unchanged.
  Cards continue to render via the unit-locked `feed.buildCardHTML`.
- **Additive backend.** New route only; existing routes byte-unchanged → no regression to
  deep-view neighbours or books grid.
- **No new secrets, keys, or localStorage keys** beyond existing `islamicinfo-hadith-*`
  cache conventions.
- **Design system locked.** Reuse existing `.load-more-btn`, `.dv-*`, grade-pill, and
  card styles — no new colors/tokens; search bar uses existing input styles.
- **Graceful degradation.** Flat-route failure → retry without wiping loaded cards;
  search failure → toast + keep the full list.

## 7. Verification (Definition of Done)

- [ ] Live hadithapi book-only listing confirmed (§5.1 VERIFY) before merge.
- [ ] Every collection (hadithapi + direct-source) loads > 25 via Load More, endlessly to end.
- [ ] Number search opens the correct hadith on both provider families.
- [ ] Keyword search returns in-collection matches; clear returns to full list.
- [ ] "Open Full View" opens the deep view on every collection.
- [ ] Grade filter works across the grown list.
- [ ] Unit + Worker tests pass; no regression in existing hadith tests.
- [ ] Live browser smoke (deferred to human sign-off per prior module posture).

## 8. Open Questions

- None blocking. "↑ Earlier books" when entering mid-collection (§5.2) is a plan-time
  refinement, not a design blocker.
