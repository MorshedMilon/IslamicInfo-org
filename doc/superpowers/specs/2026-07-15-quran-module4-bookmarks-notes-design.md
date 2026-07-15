# Module 4 — Bookmarks + Notes — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Stage:** 2 (reader comfort) · **Date:** 2026-07-15
**Governing docs:** PRD US-Q09 (notes) / US-Q10 (bookmarks) · TechSpec §3.8 / §3.9 / §6.2 / §13 · DATA.md · CONTENT-POLICY (user content + verse copies — no new scripture) · DEFINITION-OF-DONE.md
**Blueprint:** attached `quran.html` (locked). **Builds on:** Module 2 (dynamic `.ayah-card` `a-{key}`, empty `.note-editor` `n-{k}`, note btn `nbtn-{k}`).

---

## 1. Purpose & Scope

Make bookmarks and notes real: persist per-verse bookmarks + inline notes to `localStorage`, populate the bookmarks panel (with category filtering + jump-to-verse), and re-apply the saved visual state whenever Module 2 re-renders cards.

### In scope
- **Bookmarks (US-Q10):** `toggleBookmark(btn,e)` persists to `ii-quran-bookmarks`; gold `.bookmarked` icon; category `"General"`.
- **Bookmarks panel:** `toggleBookmarks()` opens `#bookmarksPanel`, renders `.bp-list` from storage; `.bp-cats` chips filter by category; `.bp-item` (arabic + translation snippet + ref + tag) → jump.
- **Jump-to-verse:** select the surah (Module 1 `selectSurah` → `loadSurah`) → after render scroll to `a-{key}` + `.pulse-hl` (same surah → scroll only).
- **Notes (US-Q09):** `toggleNote(id)` lazy-builds the empty `.note-editor` (textarea + Cancel/Save, prefilled), `saveNote(editorId,btnId)` persists to `ii-quran-notes` (≤2000 chars); gold note icon + `.ndot` on badge; empty text removes the note.
- **Re-apply on render:** `MutationObserver` on `#versesCardList` re-applies bookmarked/noted state to (re)rendered cards.

### Deferred (agreed)
- Custom categories / `"+ New"` / re-categorize (locked design has no assign UI). All bookmarks → `"General"`; filter chips functional.
- Ayah-level deep-link **pulse-ring** (US-Q12, Stage 2) — jump uses scroll + `.pulse-hl` only.
- Accounts / cloud sync (no DB/auth in v1).

### Non-goals
- No DB, no `/api/` route, no new scripture surfaced (notes are user content; bookmark snippets are copies of already-rendered authoritative verses).

---

## 2. HTML elements in scope (locked `quran.html`)

- Bookmark btn (2nd in `.ayah-actions`) → `toggleBookmark(this,event)`, `.bookmarked`; Note btn (5th, id `nbtn-{k}`) → `toggleNote('n-{k}')`
- `.note-editor` (`n-{k}`, empty from Module 2) → textarea + `.note-acts` (`.note-cancel` / `.note-save`); `saveNote('n-{k}','nbtn-{k}')`
- `.ayah-num-badge` + `.ndot` (gold dot; noted verses)
- `#bookmarksPanel` `.bookmarks-panel` → `toggleBookmarks()`; `.bp-cats` (`.bp-cat` chips: All / General / Memorization / Reflection / + New); `.bp-list` → `.bp-item` (`.bp-ar` / `.bp-en` / `.bp-meta` (`.bp-tag`)); `jumpTo`

---

## 3. Pure core (DOM-free, tested) — `quran-marks-core.js`

- `isBookmarked(bookmarks, verseKey)` → bool
- `toggleBookmark(bookmarks, bm)` → new array (remove if `verseKey` present, else append `bm`)
- `filterByCategory(bookmarks, category)` → array (`'All'` → all)
- `findNote(notes, verseKey)` → note|null; `upsertNote(notes, note)` → new array (replace-by-`verseKey` or append); `removeNote(notes, verseKey)` → new array
- `capText(s, max=2000)` → trimmed to `max` chars

All pure, immutable (return new arrays). UMD `window.II.marksCore`.

---

## 4. Controller (`quran-marks.js`)

Load `bookmarks`/`notes` from `localStorage` (try/catch → `[]` on parse fail). Persist helpers wrap `setItem` in try/catch (quota → toast).

**Bookmarks:**
- `window.toggleBookmark(btn,e)` — `e.stopPropagation()`; `card = btn.closest('.ayah-card')`; `vk = card.dataset.key`; build `Bookmark` from card DOM (surahName from `#bcTitle` text before `·`, surahId/ayahNo from `vk`, `arabic` from `.ayah-arabic`, `translation` from `.ayah-translation`, `category:'General'`, `addedAt:Date.now()`); `bookmarks = core.toggleBookmark(bookmarks, bm)`; persist; set icon (gold filled + `.bookmarked` if now bookmarked, else outline); toast; if panel open, re-render.
- `window.toggleBookmarks()` — toggle `#bookmarksPanel.open`; close settings panel (as inline does); `renderBookmarksPanel()`.
- `renderBookmarksPanel()` — clear `.bp-list`; `filterByCategory(bookmarks, activeCat)` → build `.bp-item` per bookmark (`.bp-ar`=arabic, `.bp-en`=translation, `.bp-meta` with `surahName ayahNo` + `.bp-tag`=category); click → `jumpToVerse(bm)`. Empty → "No bookmarks yet — tap the bookmark icon on any verse."
- `.bp-cat` chips → set `activeCat`, toggle `.on`, re-render.

**Jump:**
- `jumpToVerse(bm)` — close panel; if `bm.surahId === currentSurahFromDom()` → `scrollToCard(bm.verseKey)`; else find `.surah-row[data-id=bm.surahId]` → `window.selectSurah(row)` (loads) → poll for `a-{key}` (≤2s) → `scrollToCard`. `scrollToCard(vk)` = `scrollIntoView({block:'center'})` + add `.pulse-hl` (remove after 3.8s).
- `window.jumpTo(id)` — defensive legacy shim: if `document.getElementById(id)` exists, scroll + pulse; else no-op.

**Notes:**
- `window.toggleNote(id)` — `ed = getElementById(id)`; if not built (`!ed.dataset.built`), build `<textarea class="note-input" maxlength="2000" placeholder="Your reflection…"></textarea><div class="note-acts"><button class="note-cancel">Cancel</button><button class="note-save">Save note</button></div>`, wire Cancel→close, Save→`saveNote(id, 'nbtn-'+k)`, set `dataset.built='1'`; prefill textarea from `findNote(notes, vk)`; toggle `.show`.
- `window.saveNote(editorId, btnId)` — `text = capText(textarea.value, 2000)`; if text → `notes = upsertNote(notes, {verseKey, text, updatedAt:Date.now()})` else `notes = removeNote(notes, vk)`; persist; close editor; update `noted` visual (note btn gold + `.ndot` present iff text); toast "Note saved" / "Note removed".

**Re-apply on render (decoupled):**
- `applyMarks(card)` — `vk=card.dataset.key`; if `isBookmarked(bookmarks,vk)` → bookmark btn gold + `.bookmarked`; if `findNote(notes,vk)` → note btn gold + ensure `.ndot` on `.ayah-num-badge`.
- `MutationObserver` on `#versesCardList` (childList, subtree) → for each added `.ayah-card` call `applyMarks`. Also run once on init for existing cards.

**Icon helpers:** filled-bookmark SVG (`fill="currentColor"`) vs outline; gold via `.bookmarked` class (existing CSS). `.ndot` = `document.createElement('div'); className='ndot'` appended to `.ayah-num-badge` (once).

---

## 5. States (RULE 5)

| State | Behavior |
|---|---|
| No bookmarks | Panel empty state text |
| `localStorage` parse fail | try/catch → treat as `[]`; drop bad key |
| Note save quota exceeded | toast "Storage full — couldn't save"; existing data preserved |
| Jump target card absent after load (timeout) | no-op (no throw) |
| Filter category with no items | empty list (no error) |

---

## 6. Files

| File | Change |
|---|---|
| `src/js/quran-marks-core.js` | **NEW** — pure (UMD `window.II.marksCore`), unit-tested |
| `src/js/quran-marks.js` | **NEW** — controller: overrides + panel + notes + MutationObserver |
| `tests/quran/marks-core.test.js` | **NEW** — `node:test` |
| `quran.html` | **MINIMAL** — 2 `<script>` includes only (panel + note markup repopulated by JS) |
| `DATA.md` | register `ii-quran-bookmarks` / `ii-quran-notes` + `Bookmark` / `Note` shapes |

Load order: after `quran-verses.js` / `quran-audio.js` (so overrides win over the inline demo `toggleBookmark`/`toggleNote`/`saveNote`/`toggleBookmarks`/`jumpTo`).

---

## 7. Testing

- **Pure core** (`node:test`): `isBookmarked`; `toggleBookmark` add/remove by verseKey (immutability); `filterByCategory` (All + specific); `upsertNote` replace vs append; `removeNote`; `findNote`; `capText` (≤2000, trim).
- **Controller** (jsdom harness): bookmark toggle persists to `ii-quran-bookmarks` + icon gold; survives a simulated re-render (MutationObserver re-applies); note save persists + `.ndot` added + prefill on reopen; empty-note removes; panel renders + category filter narrows; jump (same surah) scrolls + `.pulse-hl`; empty-state text; zero console errors.

---

## 8. Definition-of-Done gates

- **Universal:** matches PRD US-Q09/Q10; only requested changes; both themes; no console errors; self-reviewed.
- **Design:** no CSS/token change; panel/note/bp-item reuse existing classes; no raw hex.
- **Data:** `ii-quran-bookmarks`/`ii-quran-notes` registered + `Bookmark`/`Note` shapes; all `localStorage` try/catch; no PII.
- **Content:** N/A beyond no-fabrication — notes are user-authored; bookmark snippets are verbatim copies of already-rendered authoritative verses; no new scripture, no hadith, no fatwa, no AI content. **No 🕌 human-review gate triggered.**
- **(No API gate.)**

---

## 9. Follow-ups

Custom bookmark categories + assign UI (needs a design iteration). Ayah-level deep-link pulse (Stage 2). Bookmark remove-from-panel control. Notes export. Account sync (Stage 4).
