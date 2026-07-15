# Quran Audio — Reciter Selection Fix + Verse-Highlight Layers — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Stage:** audio polish · **Date:** 2026-07-15
**Governing docs:** PRD US-Q04 · CONTENT-POLICY §5 (recitation) · DEFINITION-OF-DONE.md
**Blueprint:** attached `quran.html` (locked). **Builds on:** Module 3 (audio engine, reciter picker, `.word-active` word-sync), Module 6 (CompositeAudioSource).

---

## 1. Purpose & Scope

Three user requests:
1. **Reciter selection (Task 1):** the dropdown currently shows the locked page's hardcoded 5-reciter *demo* (default "Al-Hussary"); users must be able to pick from the full real reciter list, and the floating player (`#apReciterName`) must always show the current reciter.
2. **Verse highlight (Task 2):** in addition to the existing single-word highlight (`.word-active`), add **two independently-toggleable** highlight layers — a **strengthened whole-verse block highlight** and a **progressive/cumulative word-fill**. Dev toggle to A/B them live; default both; keep `.word-active` untouched.
3. **Default reciter (Task 3):** default = **Mishary Rashid Alafasy** (Quran.com id 7); users can change anytime.

### Root cause (Tasks 1 & 3)
Locked HTML hardcodes the demo: `#apReciterName` = "Sheikh Mahmoud Khalil Al-Hussary" (L1795), `#reciterLabel` = "Al-Hussary" (L1824), and a 5-`.reciter-opt` demo picker (L1826–1830). Module 3's `populatePicker()` is supposed to replace all of it with the 12 real reciters + set the label to the default — so the demo persists when that swap doesn't reliably run (stale build, empty list, or a bogus saved pref falling back to `reciters[0]`).

### Non-goals
- No 🕌 gate on the code (no new scripture; audio already ships under Module 3's pending review).
- No change to `.word-active` (single-word highlight stays exactly as-is).
- The dev toggle is **temporary** — once the user picks a permanent mode, a follow-up strips the toggle + the unused layer.

---

## 2. Tasks 1 & 3 — Reciter robustness (`quran-audio.js`)

- `DEFAULT_RECITER_ID = 7`, `DEFAULT_RECITER = { id: 7, name: 'Mishary Rashid Alafasy', style: '' }`.
- **`init()` rewrite (robust):**
  1. `reciterId = DEFAULT_RECITER_ID`; then load `ii-quran-reciter` (only override if `> 0`).
  2. If `reciters` is empty, seed it with `[DEFAULT_RECITER]` and `populatePicker()` **immediately** — this replaces the hardcoded Al-Hussary demo on load (dropdown + `#reciterLabel` + `#apReciterName`) even before the async list resolves.
  3. `source.listReciters()` → if non-empty, `reciters = list`; if the saved/`reciterId` isn't in the list, prefer `DEFAULT_RECITER_ID` (fall back to `reciters[0]` only if 7 is absent); `populatePicker()` again with the full list.
  4. On fetch failure, keep the default-seeded picker (never revert to the demo).
- **`populatePicker()`** already renders `.reciter-opt` per reciter (wired to `selectReciter(r.id, opt)`), marks `.on`, and sets `#reciterLabel`/`#apReciterName` — unchanged except it's now guaranteed to run with a non-empty list.
- **Player name always current:** `#apReciterName` is set in `populatePicker` (load), `selectReciter` (change), and `markPlaying` (play) — verify all three; init's immediate populate covers the pre-play state.

Result: full list selectable, Alafasy default for fresh users, saved choice respected, player + label always synced, demo never shown.

---

## 3. Task 2 — Two verse-highlight layers (independent, toggleable)

### 3.1 Layer markers (JS adds these element classes; unchanged by mode)
- **Block:** `markPlaying()` already adds `.ayah-playing` to the active card — keep it (the block marker).
- **Fill (NEW):** `onTime()` adds `.word-filled` to every already-recited word in the active card (cumulative), in addition to toggling the existing `.word-active` on the current word.
  - Given 1-based current word `w = activeWordAt(segments, ms)` and 0-based index `i`: `word-active` ⇔ `i === w-1` (unchanged); `word-filled` ⇔ `w > 0 && i <= w-1` (new).
- `clearHighlights()` also removes `.word-filled` (on ayah change / stop).

### 3.2 Layer styling (injected `<style id="vhl-styles">` from JS — no `quran.html` CSS edit)
Two **independent** ancestor-scoped layers, gated by a mode class on `#versesCardList`:
- `.vhl-block .ayah-card.ayah-playing { … }` — **strengthened** whole-verse highlight (clearly visible gold background + a solid gold left accent-bar), noticeably stronger than the locked `.ayah-playing` (0.05/0.02 tint), both themes.
- `.vhl-fill .wbw-word.word-filled { … }` — **lighter** gold fill (e.g. `rgba(197,160,89,.10)` bg) so recited words read as "done" without competing with `.word-active` (which stays on top, unchanged).
- Neither rule touches the other or `.word-active`. Removing `.vhl-block` disables block; removing `.vhl-fill` disables fill.

### 3.3 Dev toggle (temporary)
- `applyHighlightMode(mode)` sets classes on `#versesCardList`: `vhl-block` ⇔ mode ∈ {block, both}; `vhl-fill` ⇔ mode ∈ {fill, both}.
- **Initial mode:** `?highlight=block|fill|both` from the URL, default `both`.
- **Live switch (no reload):** keyboard shortcut — `Shift+H` cycles `both → block → fill → both`, applies immediately, and toasts the mode. (Lets the user A/B while audio plays.)
- Exposed on `window.II.quranAudio` for tests (`_setHighlightMode`, `_mode`).

---

## 4. Pure core additions (`quran-audio-core.js`, node:test)

- `parseHighlightMode(search)` → `'block'|'fill'|'both'` from a query string (`?highlight=…`); default `'both'`; invalid → `'both'`.
- `modeFlags(mode)` → `{ block: bool, fill: bool }`.
- `wordFillStates(w, count)` → array length `count` of `{ active, filled }` per the §3.1 rule (pure; drives + documents the DOM logic).
- `nextHighlightMode(mode)` → cycles `both→block→fill→both`.

---

## 5. Files

| File | Change |
|---|---|
| `src/js/quran-audio-core.js` | **EDIT** — add `parseHighlightMode`, `modeFlags`, `wordFillStates`, `nextHighlightMode` |
| `src/js/quran-audio.js` | **EDIT** — robust `init()`/reciter default; `onTime` word-fill; `clearHighlights`; inject `<style>`; `applyHighlightMode` + query-param + `Shift+H`; expose test hooks |
| `tests/quran/audio-core.test.js` | **EDIT** — tests for the 4 new pure helpers |
| — | No `quran.html` edit (CSS injected via JS; reciter is JS) |

## 6. Testing

- **Core** (`node:test`): `parseHighlightMode` (block/fill/both/missing/invalid); `modeFlags`; `wordFillStates` (w=0 → none; w=1 → only index 0 filled, active; w=3 → 0,1,2 filled, 2 active; clamps to count); `nextHighlightMode` cycle.
- **Reciter (jsdom harness):** mock `source.listReciters` → 12 reciters; init populates 12 `.reciter-opt` (demo replaced), default `.on` = Alafasy (id 7), `#reciterLabel`/`#apReciterName` = Alafasy; clicking another opt → `selectReciter` updates `#apReciterName` + persists `ii-quran-reciter`; empty-list fetch → default-seeded picker (Alafasy), never the demo; zero console errors.
- **Highlight (jsdom harness):** with segments + dispatched `timeupdate`, `.ayah-playing` on active card; `.word-filled` accumulates 0→1→…→n as currentTime advances; `.word-active` still only the current word; `applyHighlightMode('block'|'fill'|'both')` toggles `#versesCardList.vhl-block`/`.vhl-fill` correctly; `Shift+H` cycles; playback logic (playAt/onEnded) unaffected; zero console errors.

## 7. Definition-of-Done

- Universal: additive; both themes; no console errors; graceful fallbacks; self-reviewed.
- Design: no `quran.html`/CSS-file edit (styles injected via JS, easily strippable); no new raw hex outside the injected `<style>` (which references the locked gold/teal token values); `.word-active` untouched.
- Reciter: full list selectable; **default Alafasy (id 7)**; player + label always reflect current reciter; demo never shown.
- Highlight: two independent layers, dev-toggleable, default both; temporary toggle documented for the user's A/B.
- Content: recitation audio already under Module 3's pending 🕌 review; no new scripture. No API/binding gate.

## 8. Follow-ups

After the user's live A/B: keep the chosen mode as the permanent default, strip the `Shift+H`/`?highlight=` dev toggle and the unused layer. Reciter search/filter in the picker. Possible "source badge" (Quran.com vs QUL).
