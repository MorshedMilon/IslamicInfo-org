# Hadith Module 10 — Per-Hadith Action Suite (Bookmarks, Notes, Audio, Verify/Ask CTAs)

**Date:** 2026-07-21
**Covers:** PRD §3.2 US-H12, §3.4 US-H23 (Bookmark/Notes/Listen rows) · TechSpec §2.4 items 6–7, §3.6–3.9
**Status:** Design — awaiting user review before plan.

---

## 1. Context & reconciliation

The Module 10 build prompt assumes a greenfield state that the repo does **not** match — the
same "prompt assumes greenfield, repo is ahead/different" pattern seen in Modules 7–9. Before
any code, four assumptions were reconciled against the actual code:

| Prompt assumption | Actual repo state | Resolution |
|---|---|---|
| Audio has a source; build a full player (play/pause, progress, speed, waveform, reciter name). | Adapter hardcodes `audio: { status:'unavailable', url:null, reciter:null }` for **every** hadith ([api.js:416](../../../src/js/api.js#L416)); live card's Listen button is already `aria-disabled`. hadithapi.com serves no audio; no hadith-recitation CDN exists. | **Honest unavailable-only.** Listen opens the mini-player scaffold in its "Audio unavailable for this hadith" state only. No `<audio>` element, no CDN, no reciter printed, no speed/waveform logic. A functional player is deferred to when a real audio source + reciter data lands (mirrors Module 8's narrator-panel precedent). This upholds the invariant "carries a source — or it is not shown / never invent endpoints." |
| A Notes icon already sits in the card markup. | `buildCardHTML` header renders **Bookmark/Share/Copy** only ([hadith-feed-core.js:148-152](../../../src/js/hadith-feed-core.js#L148-L152)); no note icon. Module 4's DoD ([HADITH-MODULE-BUILD-PROMPTS-v1.md:342](../../../doc/HADITH-MODULE-BUILD-PROMPTS-v1.md#L342)) placed "Bookmark/Share/Copy — icons only, wiring comes in Module 10". | Add one `data-act="note"` icon button to the header set (→ Bookmark/Note/Share/Copy). This is the minimal structural change and does not restructure header/body/footer. Module 4's DoD explicitly names `note-editor` as an approved **sibling-below-card** injection ([:327-328](../../../doc/HADITH-MODULE-BUILD-PROMPTS-v1.md#L327-L328)) — the editor placement matches the DoD exactly. |
| CTA target is `/verify` with `?claim=`. | Site link is `verify.html` (relative). Its prefill handler reads `?q=` + `?ref=` + `?mode=` ([verify.html:1036-1047](../../../verify.html#L1036-L1047)) — **not** `?claim=`; unknown params are ignored (would silently fail to prefill). | Build the "Ask a Question" CTA against the real `verify.html?q=…&ref=…&mode=claim` contract so the DoD "pre-fills correctly" is genuinely met. |
| Wrap every JSON.parse / setItem in bespoke try/catch. | `ui.safeLocalStorageGet/Set` already do this; `safeLocalStorageSet` already catches `QuotaExceededError` and toasts ([ui-utils.js:31](../../../src/js/ui-utils.js#L31)). | **Reuse** `ui.safeLocalStorageGet/Set`. No new storage-guard code; `setItem` failure leaves the prior value intact (atomic), satisfying "never silently lose existing data". |

**localStorage keys are registered** (not invented): `islamicinfo-hadith-bookmarks` = `HadithBookmark[]`,
`islamicinfo-hadith-notes` = `HadithNote[]` ([DATA.md §2:28-29](../../../doc/DATA.md)).

### 1a. Net-new components — no mockup precedent ⚠️

**Neither the canonical mockup (`mockups/hadith.html`) nor the built `hadith.html` contains a
`.note-editor`, `.audio-mini-player`, or bookmarks-panel.** The mockup has only static cards +
`.hadith-num` styling. These three components are therefore **net-new visuals with no canonical
blueprint to defer to.** They will be built strictly from locked design-system tokens (existing
`card`/`glass`/`chip` classes, `--teal-*`/`--gold-*` vars — **no new colors/fonts, no raw hex
inline**), matching the visual language of existing components. **Visual-check gate:** each of the
three is screenshotted (via a local fixture harness — see §7) and shared for user approval **before
Module 10 is marked done.**

---

## 2. Architecture

Follows the established per-module split: pure, unit-tested `*-core.js` + thin DOM layer in `hadith.js`.

```
hadith-actions-core.js  (NEW, pure/UMD, unit-tested)
   ├─ bookmark ops: toggleBookmark, setCategory, addCustomCategory, dedupeByRef, buildBookmark
   └─ note ops:     upsertNote, getNote, clampNoteText, buildNote
hadith-feed-core.js     (EDIT + test)  → add data-act="note" header button
hadith.js               (EDIT)         → DOM wiring, panel, tooltip, editor, audio-unavailable, CTAs
hadith.html             (EDIT)         → bookmarks-panel markup + CSS for the 3 net-new components + gold dot
```

**Why a new core module:** the DoD's testable invariants (idempotent toggle, max-5 custom
categories, 2000-char clamp, Set dedup) belong in pure functions with unit tests, exactly like
`hadith-feed-core` / `reading-progress-core`. Inlining them in `hadith.js` would make them
un-unit-testable. Rejected.

**Handler placement:** bookmark/note/listen are wired via a **document-delegated handler on
`.hadith-card[data-ref]`**, so they work in both the Tier-1 feed (`#hadith-feed`) and the Tier-3a
list — both render via `buildCardHTML` ([tier3-deep-view.js:120](../../../src/js/tier3-deep-view.js#L120)).
This avoids dead buttons in Tier-3a. (The existing `wireFeedActions` isnad/deferral handler on
`#hadith-feed` stays; its `bookmark`/`listen` deferral-toast entries are removed.)

---

## 3. Data model (`hadith-actions-core.js`)

```js
// Registered key: islamicinfo-hadith-bookmarks
HadithBookmark = {
  ref: "collectionSlug:bookNum:hadithNum",   // canonical ref (feed-core.refOf format)
  collectionSlug, bookNum, hadithNum,        // denormalized for the panel + Jump routing
  category: "General" | "For Memorisation" | "Reflection" | "To Verify" | <custom>,
  createdAt: <ms epoch>,
}
// Registered key: islamicinfo-hadith-notes
HadithNote = { hadithRef: "<ref>", text: <=2000 chars, updatedAt: <ms epoch> }
```

Built-in categories: **General · For Memorisation · Reflection · To Verify**. Custom categories are
**not** stored in a separate key (that would invent an unregistered localStorage key). They are
**derived** from the set of `category` values present across existing `HadithBookmark[]` that are not
built-ins — i.e. a custom category exists exactly as long as ≥1 bookmark uses it. **Max 5 custom**
distinct names beyond the built-ins is enforced in `addCustomCategory(existingCustoms, name)`, which
returns `{ ok:false }` (unchanged) when 5 distinct customs are already in use. All array writes pass
through `dedupeByRef` (Set) before persisting.

**Pure-function contract (no DOM, no storage inside core):**
- `toggleBookmark(list, entry) → { list, added:boolean }` — idempotent: second toggle of the same
  ref removes it (TechSpec §10 edge case).
- `setCategory(list, ref, category) → list`
- `addCustomCategory(customs, name) → { customs, ok:boolean }` — `ok:false` when at 5.
- `dedupeByRef(list) → list`
- `upsertNote(list, note) → list` — replaces the note with matching `hadithRef`, else appends.
- `getNote(list, ref) → HadithNote | null`
- `clampNoteText(s) → s.slice(0,2000)`

`hadith.js` owns all `localStorage` I/O (via `ui.safeLocalStorage*`) and passes the parsed arrays in.

---

## 4. Behaviors (DOM layer)

### 4.1 Bookmark
- Delegated click on `[data-act="bookmark"]` → resolve card `data-ref` → `toggleBookmark` → persist →
  toggle `.has-bookmark` on the card (gold dot via CSS `::after` on `.hadith-num`).
- On **add**, show a category tooltip/popover anchored to the button: the 4 built-ins + any customs +
  a **`+ New`** row (prompts for a name; rejected with a toast when 5 customs already exist).
  **Auto-dismiss after 2.5s**; selecting a category calls `setCategory` + persists.
- Idempotent: clicking bookmark on an already-bookmarked card removes it (dot clears, tooltip not shown).

### 4.2 Notes
- Delegated click on `[data-act="note"]` → inject a `.note-editor` **sibling immediately after the
  card** (matches Module 4 DoD; never restructures the card). Contains a textarea (`min-height:72px`,
  `maxlength="2000"`) prefilled from `getNote`, plus **Save / Cancel**.
- **Save** → `upsertNote` → persist → `.has-note` gold dot → collapse editor.
- **Cancel** → discard, never persists, collapse editor.
- Re-clicking note toggles the editor closed.

### 4.3 Audio (honest unavailable-only)
- Delegated click on `[data-act="listen"]` → inject an `.audio-mini-player` **sibling after the card**
  showing **only** "Audio unavailable for this hadith". Player chrome (play/progress/speed) may be
  rendered **visibly disabled** for layout fidelity, but there is **no `<audio>` element, no network
  request, no reciter text** (reciter is `null` for all hadith — printing it would violate the
  no-fabrication rule, TechSpec §7.5 rule 5). Re-click closes.
- No single global `<audio>`, no `beforeunload` cleanup, no auto-advance — there is nothing to play.
  These are documented as deferred until an audio source lands.

### 4.4 Verify / Ask CTAs (sidebar)
The two sidebar CTAs are currently static `onclick="location.href='verify.html'"`
([hadith.html:1096-1107](../../../hadith.html#L1096-L1107)). Rewire in `hadith.js`:
- **Verify a Source** → `verify.html` always.
- **Ask a Question** — tier-aware, computed from the current route (`parseRoute()`):
  - **Tier 3** (a hadith is in context): `verify.html?q=<encoded matn>&ref=<encoded "Collection · Book N · Hadith M">&mode=claim` — lands prefilled + auto-runs via verify.html's existing handler.
  - **Tier 1** (collections grid): `verify.html` (empty), input focused, no prefill.
  - Matn/collection/book/num are sourced from `FEED.byRef` / the deep-view's current hadith — never guessed; if unavailable, fall back to the empty Tier-1 behavior.

### 4.5 Bookmarks panel
- Slide-in from the right; opened from a sidebar/panel trigger. Focus-trapped (`ui.focusTrap`), Esc closes.
- **Chip filter row**: All + one chip per category in use; filters the list in place.
- Each row shows collection · hadith ref + category, with a **Jump (→)** button → `routeTo` the
  hadith's route and reuse **`pulseRing`** (Module 9) to highlight the landed card.
- Renders from `islamicinfo-hadith-bookmarks` via `ui.safeLocalStorageGet` (corrupt → empty default).

---

## 5. Gold dot

`buildCardHTML` stays pure (no storage reads). After each feed/list render, `hadith.js` reads the
bookmark + note refs once and applies `.has-bookmark` / `.has-note` classes to matching cards. CSS
renders a small gold dot as `::after` on `.hadith-num` when either class is present. Toggling a
bookmark/note updates the class immediately.

---

## 6. Storage integrity (TechSpec §7.4)

- **All reads** via `ui.safeLocalStorageGet(key, default)` → try/catch → `removeItem` + default on
  corrupt JSON (already implemented).
- **All writes** via `ui.safeLocalStorageSet(key, value)` → catches `QuotaExceededError` → toast
  "Storage full — clear some bookmarks or notes." (already implemented). Prior value is preserved
  because the failed `setItem` is atomic.
- Arrays deduped with a Set (`dedupeByRef`) before every write.
- **Verification requirement:** the QuotaExceededError path is *tested* (simulated full quota), not
  assumed — see §7.

---

## 7. Testing & verification

**Unit tests (`worker/test/`):**
- `hadith-actions-core.test.js` — idempotent toggle; max-5 custom categories; 2000-char clamp;
  dedupeByRef; upsert/get note.
- `hadith-feed-core.test.js` — assert the new `data-act="note"` button renders in the header.

**Node checks:** `node --check` on all touched JS; full `npm test` (currently 204 tests) stays green.

**Visual-check gate (net-new components, §1a):** a small **local fixture harness** page renders the
three components with mock data (note-editor and audio-unavailable are pure UI; bookmarks panel reads
seeded localStorage — none need the live Worker/hadithapi backend, which is unreachable under a bare
static serve per the api-reachability constraint). Screenshot each of the three and share for user
approval **before marking Module 10 done.**

**Named verification (prompt requirement):** explicitly exercise the QuotaExceededError path
(simulate a full quota) and confirm the toast fires + existing data survives — do not assume the
try/catch works.

---

## 8. Files touched

| File | Change |
|---|---|
| `src/js/hadith-actions-core.js` | **NEW** — pure bookmark/note ops (UMD), unit-tested. |
| `src/js/hadith-feed-core.js` | Add `data-act="note"` header button + unit test. |
| `src/js/hadith.js` | Wire bookmark toggle + category tooltip, note editor, audio-unavailable player, bookmarks panel, tier-aware CTAs, gold-dot application. Remove `bookmark`/`listen` deferral-toast entries. |
| `hadith.html` | Bookmarks-panel markup, sidebar-CTA hook points, CSS for `.note-editor` / `.audio-mini-player` / `.bookmarks-panel` / gold dot (locked tokens only). Load `hadith-actions-core.js`. |
| `worker/test/hadith-actions-core.test.js` | **NEW** unit tests. |
| `doc/DATA.md` | (If needed) confirm `HadithBookmark`/`HadithNote` schema notes match §3. |

---

## 9. Scope boundaries (YAGNI)

**In:** Bookmark (toggle/category/panel/gold-dot), Notes (editor/gold-dot), Audio (unavailable-only),
Verify/Ask CTAs (tier-aware), on the shared card component (Tier-1 feed + Tier-3a list) + sidebar.

**Out (deferred, explicitly):**
- Functional audio player (no source exists) — its own module when audio data lands.
- **Tier-3b deep-view** bookmark/note rows (Module 7's separate `.dv-action-btn` set) — follow-up module.
- Share / Copy wiring (not in US-H12 scope; stay as current deferral).
- Server-side note validation (localStorage-only through Stages 1–4 per PRD §9).

---

## 10. Definition of Done (from prompt)

- [ ] Bookmark toggle idempotent; max 5 custom categories enforced (unit-tested).
- [ ] Notes max 2000 chars enforced; Cancel never persists.
- [ ] Reciter name never renders (unavailable-only); Listen shows graceful "Audio unavailable".
- [ ] QuotaExceededError shows toast and preserves existing data (path *tested*, not assumed).
- [ ] Ask a Question pre-fills correctly on Tier 3 (`?q=&ref=&mode=claim`), empty on Tier 1.
- [ ] Gold dot appears on `.hadith-num` when bookmarked/noted; clears on removal.
- [ ] Bookmarks panel: chip filter + Jump→scroll+pulse.
- [ ] Net-new components screenshotted + user-approved before done.
- [ ] `node --check` clean; full test suite green.
