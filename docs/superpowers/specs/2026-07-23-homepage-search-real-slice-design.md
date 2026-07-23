# Homepage Search — Real Slice

**Date:** 2026-07-23
**Status:** Design approved → plan
**Scope:** Homepage (`index.html` / `home.js`) hero search, with a small reuse-driven addition to the Hadith page and a prefill hook on the Verify page.

---

## 1. Problem

The homepage hero search is non-functional: the `<form>` has `onsubmit="event.preventDefault()"`, the scope chips (All/Qur'an/Hadith/Dua/Verify) only toggle a CSS `active` class, the mic button does nothing, there is no "continue where you left off" chip, and there is no topics entry. The target design (mockup) wants a content-type-aware search with a working mic and a continue chip.

**Backend reality (verified 2026-07-23):** only **Hadith** has a real search backend (`/api/hadith/search`, deployed). Qur'an and Dua have **no** search endpoint. `/api/verify` is a **pending Worker stub** and `verify.html` shows a canned demo (a separate, known, authenticity-sensitive bug — see `verify-demo-fallback-bug` memory). Federated "All" therefore cannot be built without fabricating results.

## 2. Goals (the approved slice)

- Make the hero search **real for the modes that have backends**, and **honest** for those that don't — never fake or partial results.
- **Hadith** tab → real global hadith search, **reusing** existing rendering/logic (no homepage-local copy).
- **Verify** tab → mode switch (placeholder + submit) that **routes + prefills** the claim into the verify engine.
- **Mic** → Web Speech voice-to-text into the input.
- **Continue chip** → most-recent last-viewed across Hadith + Qur'an, by real **timestamp**; hidden when none.
- **Topic pills** → links into the existing `/hadith/topics` index.
- **Qur'an / Dua / All** → honest "coming soon" state.

## 3. Non-Goals

- **Not** building Qur'an search, Dua search, or federated "All" (no backends — separate future projects).
- **Not** fixing the Verify engine (`/api/verify` stub / canned-demo bug). This slice only routes + prefills a claim into it. The engine remains separately flagged.
- No new hadith content, gradings, or citations. Hadith results render via the unit-locked `feed.buildCardHTML`; grades come only from source data.
- No design-system changes beyond reusing existing tokens/components.

## 4. Decisions

- **D1 — Default tab = Hadith.** The one working backend, matching the mockup, so the search is useful by default (not a "coming soon" landing).
- **D2 — Route to page for results, not inline on the homepage.** The mockup shows no inline results; routing reuses each destination page's full rendering + behavior and avoids a duplicate results renderer on the homepage.
- **D3 — The Hadith global search lives on the Hadith page** (reused by both the hadith page's own hero search and the homepage), not duplicated on the homepage.
- **D4 — Timestamp both last-viewed writes** so "most recent across types" uses real data, not a guessed priority. Keep existing key shapes backward-compatible.
- **D5 — Verify routes to a known-limited engine** (owner-accepted); prefill support is added to the verify page.

## 5. Architecture

### 5.1 Homepage — `src/js/home.js` + `index.html`

- **Tab state machine** (client-side, no reload). Active tab = the search `mode`. Default `hadith`. Update the chips' `active` class + `aria-pressed`. **Verify is a mode switch**, not just a filter: it swaps the input placeholder to "Paste a claim to verify…".
- **Dispatch on submit** (Enter key, Search button, or mic result), by `mode`:
  - `hadith` → `location.assign('hadith.html?q=' + encodeURIComponent(query))`.
  - `verify` → `location.assign('verify.html?claim=' + encodeURIComponent(query))`.
  - `quran` | `dua` | `all` → render an inline honest note under the bar ("Qur'an search is coming soon — try the Hadith tab, which is live." / etc.). No navigation, no results.
  - Empty query → focus the input, no-op.
- **Mic** — Web Speech API (`SpeechRecognition || webkitSpeechRecognition`); on result, fill the input and dispatch per the active mode; toast/no-op when unsupported. Mirror the hadith page's `wireSearch` mic implementation.
- **Continue chip** — see §5.4.
- **Topic pills** — a compact hero row: each pill `<a href="/hadith/topics/<key>">`, active-styled; a "View all topics" `<a href="/hadith/topics">`. Uses the existing hadith topic keys (from `II.hadithTopics` / the topics list) or a short static curated set of pill labels→keys if that module isn't loaded on the homepage.
- Replace the dead inline `onsubmit`/chip script with `home.js` wiring. The hero `<button type="submit">` becomes the Search action.

### 5.2 Hadith page — global search (the reuse) — `src/js/hadith.js`

- On load, if `?q=<query>` is present, run **global** hadith search: `api.fetchHadithSearch(q)` → render results into the feed area with `feed.buildCardHTML`, under a "Results for '<q>'" header with a result count; each card deep-links to its hadith (reusing the existing `data-act="full"` / card routing). Empty → honest "No results for '<q>'."
- Wire the hadith page's **own hero search box** to the same global search (today it is a client-side substring over the loaded feed — this replaces that stub with the real API path), so there is exactly one global-search implementation.
- Errors → honest "Search temporarily unavailable — try again," never a blank or fabricated result.
- No change to the Tier-3a in-collection search built earlier; this is the collection-wide entry.

### 5.3 Verify page — prefill — `src/js/verify.js`

- On load, read `?claim=` (fallback `?q=`); if present, populate the claim input. Do **not** auto-submit (the engine is known-limited; let the user trigger it). Purely a prefill hook — the engine/`/api/verify` stub is out of scope.

### 5.4 Continue chip + timestamped last-viewed

- **Writes (add timestamps, backward-compatible):**
  - `islamicinfo-hadith-last-read`: add a `ts` field (epoch ms) at every write site (`hadith.js`, `tier3-deep-view.js`). Existing readers ignore the extra field.
  - Qur'an: keep `ii-quran-last-surah` (number) unchanged for `quran.js`'s reader; **add** a parallel `ii-quran-last-surah-ts` (epoch ms) written alongside it.
- **Chip (homepage):** read both records; pick the one with the greater `ts` (a record missing a `ts` sorts oldest). Render "Continue where you left off → <label>" linking to:
  - hadith → `/hadith/<slug>/<book>/<num>` (label: "<Collection>, Hadith <num>" — collection name resolved from the collections seed/list; fall back to the slug).
  - quran → `quran.html` (auto-restores the last surah; label: "Surah <n>").
  - **Hide the chip entirely** when neither record exists.
- Pure recency/selection logic (which record wins, label building) goes in a small tested core (see §5.5).

### 5.5 Testing

- New pure core (e.g. `src/js/home-search-core.js`): `dispatchTarget(mode, query)` → `{ kind:'navigate'|'note'|'noop', url?/message? }`; `pickContinue(hadithRec, quranRec)` → the winning record + a display label; placeholder-for-mode. Unit tests in `worker/test/*.test.js` (import via `../../src/js/...`), covering: each tab's dispatch, empty query, coming-soon modes, timestamp tiebreak (including a missing-`ts` record), and hidden-when-none.
- Hadith `?q=` global-search wiring and the mic/DOM are verified by parse-check + manual browser sign-off (repo convention).

## 6. Invariants & Risk

- **No fabrication.** Coming-soon modes render an honest note, never fake results. Hadith results come only from `/api/hadith/search` + `feed.buildCardHTML` (grades from source).
- **Verify honesty.** The Verify tab routes to a page whose engine is separately known-limited; this slice does not claim it works. (D5, owner-accepted.)
- **Backward-compatible storage.** `ii-quran-last-surah` shape unchanged; `islamicinfo-hadith-last-read` only gains a field. No new localStorage keys beyond `ii-quran-last-surah-ts`.
- **Design system.** Reuse existing search/chip/card tokens and components; no raw hex.
- **Graceful degradation.** Mic absent → no-op/toast; search API down → honest error; corrupt last-viewed → chip hidden, never throws.

## 7. Verification (Definition of Done)

- [ ] Each tab dispatches correctly: Hadith → hadith.html?q= results; Verify → verify.html prefilled; Qur'an/Dua/All → honest coming-soon note.
- [ ] Hadith `?q=` runs the real global search and renders `buildCardHTML` results; the hadith page's own hero search uses the same path.
- [ ] Mic fills the input and dispatches; no-op when unsupported.
- [ ] Continue chip shows the most-recent by timestamp, deep-links correctly, hides when none; both write sites stamp `ts`.
- [ ] Topic pills link to `/hadith/topics/<key>`; "View all topics" → `/hadith/topics`.
- [ ] Verify prefill populates (no auto-submit).
- [ ] Unit tests pass (new core + no regressions); parse checks pass.
- [ ] Live browser smoke (deferred to human sign-off).

## 8. Open Questions

- Topic-pill label set: reuse the hadith topics module's keys if available on the homepage, else a short curated pill set. Resolved at plan time (non-blocking).
