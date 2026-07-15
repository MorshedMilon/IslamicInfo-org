# Dual Word-Sync + Reciter Dropdown Wiring — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Date:** 2026-07-15
**Builds on:** Module 2 (verse card render), Module 3 (audio word-sync + reciter picker).
**Blueprint:** attached `quran.html` (locked — but the two broken reciter buttons + the word span markup are being *wired/fixed* at the user's request).

---

## 1. Purpose (three fixes; no style redesign)

1. **Dual word-sync:** during recitation, the current word must highlight in BOTH the **main verse line** AND its matching **word-by-word tile** simultaneously, driven by the SAME segment-derived index. Today only the WBW tile highlights (the verse line is a single string with no per-word elements).
2. **Top toolbar reciter dropdown** ([quran.html:1514](): a static `ctrl-btn` with `onclick="showToast(...)"`, no picker) — wire it to open a reciter list, change the reciter, and persist.
3. **Player-bar reciter dropdown** (`#reciterBtn`/`#reciterPicker`, [quran.html:1822]()) — ensure it opens/lists/selects, and that **both dropdowns share one reciter state** (selecting in either updates the other + the player name + playback + `ii-quran-reciter`).

---

## 2. Task 1 — Dual word-sync (one index → both elements)

### Rendering (`quran-verses.js`)
- Replace `card.appendChild(el('div','ayah-arabic', v.text_uthmani))` with a `.ayah-arabic` div built from **per-word spans**: for each `v.words[i]`, append `<span class="al-word" data-wi="{i+1}">{w.ar}</span>` and a space text node between words. `data-wi` is **1-based** to match the segment word number (`activeWordAt` returns 1-based; `v.words` already aligns with the segments — same source as the WBW tiles). `textContent` of `.ayah-arabic` still yields the full verse (spaces preserved) so Modules 4/5 that read it are unaffected.
- Add `data-wi="{i+1}"` to each `.wbw-word` tile (same index).

### Highlight (`quran-audio.js` `onTime`)
- Compute `w = activeWordAt(ay.segments, ms)` (unchanged, ONE index).
- Replace the positional `.wbw-word` loop with a **single** attribute-matched update over BOTH element types:
  `card.querySelectorAll('[data-wi]').forEach(el => el.classList.toggle('word-active', Number(el.dataset.wi) === w))`.
  Because both the verse-line span and the WBW tile carry the same `data-wi`, the same `.word-active` is added/removed on both in one call — no separate traversal or timing.
- `clearHighlights()` must remove `.word-active` from **any** element (broaden the selector from `.wbw-word.word-active` to `.word-active`) so verse-line spans clear on ayah change / stop.

### Style (`quran.html`, minimal add — matches existing gold, no redesign)
```
.ayah-arabic .al-word{border-radius:6px;padding:0 2px;transition:background .15s;}
.ayah-arabic .al-word.word-active{background:rgba(197,160,89,.18);color:var(--gold-700);}
[data-theme="dark"] .ayah-arabic .al-word.word-active{color:#D7B675;}
```
(Same gold as the existing `.wbw-word.word-active` tile.)

---

## 3. Tasks 2 & 3 — Reciter dropdowns unified

### HTML (`quran.html`, targeted wiring edits)
- **Toolbar pill (1514):** add `id="reciterBtnTop"`, `style="position:relative;"`; change `onclick="showToast('Reciter: Al-Hussary')"` → `onclick="toggleReciterPicker(this)"`; wrap the label in `<span id="reciterLabelTop">Al-Hussary</span>`; append `<div class="reciter-picker" id="reciterPickerTop"></div>` inside the button.
- **Player pill (1822):** change `onclick="toggleReciterPicker()"` → `onclick="toggleReciterPicker(this)"`.
- **CSS:** override the toolbar picker to open **downward** (the base `.reciter-picker` opens upward for the player bar):
  `#reciterPickerTop{top:calc(100% + 8px);bottom:auto;left:0;right:auto;}`

### JS (`quran-audio.js` — one shared reciter state)
- `window.toggleReciterPicker = function(btn)` — close every `.reciter-picker.open`; if `btn` has an inner `.reciter-picker` that wasn't already open, open it (toggle). Works for both buttons.
- `populatePicker()` — populate **both** `#reciterPicker` and `#reciterPickerTop` with the same opts (each opt's click → `e.stopPropagation()` then `selectReciter(r.id, opt)`); set `#reciterLabel`, `#reciterLabelTop`, and `#apReciterName` — all three from the current `reciterId`.
- `selectReciter(id, el)` — set `reciterId`, persist `ii-quran-reciter`, call `populatePicker()` (rebuilds BOTH pickers with correct `.on` + all labels — keeps them in sync), close open pickers, then the existing gen-guarded re-fetch/resume. (No manual per-`el` `.on` toggling — populatePicker is the single source of sync.)
- `init()` immediate + async `populatePicker()` now fills both pickers; default reciter stays **Alafasy (id 7)** (kept from the prior fix).

Both dropdowns are rebuilt from the same `reciterId` on every select → always show the same reciter; selecting in either updates playback + the other + the player name.

---

## 4. Files

| File | Change |
|---|---|
| `src/js/quran-verses.js` | **EDIT** — `.ayah-arabic` per-word spans + `data-wi`; `.wbw-word` `data-wi` |
| `src/js/quran-audio.js` | **EDIT** — `onTime` dual-highlight by `[data-wi]`; broaden `clearHighlights`; `populatePicker` (both pickers + 3 labels); `selectReciter` (sync via populatePicker); `toggleReciterPicker(btn)` override |
| `quran.html` | **EDIT** — wire toolbar reciter pill (id + picker + onclick); player pill onclick(this); CSS: `.al-word` active + `#reciterPickerTop` downward |
| — | No new localStorage keys; reuses `ii-quran-reciter` |

## 5. Testing

- **Existing** `node:test` (`activeWordAt`, etc.) must still pass — the ONE index is unchanged.
- **Dual word-sync (jsdom harness):** render a card for 2:6 with `v.words` incl. سَوَآءٌ at index 4 and segments `[[…],[…],[…],[4, tA, tB],…]`; set `audio.currentTime` inside `[tA,tB]`, dispatch `timeupdate` → assert the `.al-word[data-wi="4"]` (verse line) AND the `.wbw-word[data-wi="4"]` (tile) BOTH have `.word-active`; advance to the next word → assert BOTH index-4 elements lose `.word-active` and both index-5 elements gain it. (Per the user's explicit test requirement.)
- **Reciter (jsdom harness):** both `#reciterBtnTop` and `#reciterBtn` toggle their picker open; both pickers list the full reciter set; selecting in the toolbar picker updates `#reciterLabel` + `#reciterLabelTop` + `#apReciterName` + persists `ii-quran-reciter`, and the player picker's `.on` reflects it (and vice-versa); default = Alafasy; zero console errors.
- (Harnesses are scratchpad per repo convention; results reported. Committed tests remain node:test on `*-core.js`.)

## 6. Definition-of-Done

- Word-sync: verse-line word + WBW tile highlight together from ONE `activeWordAt` index, matched by `data-wi` in one update; verified on 2:6 (سَوَآءٌ / "IT IS SAME"). Existing `.word-active` style reused (no redesign).
- Reciter: both dropdowns open, list, select, persist; single shared state; player name + both labels always agree; default Alafasy.
- `.ayah-arabic` textContent still returns the verse (Modules 4/5 unaffected). No console errors. Both themes.

## 7. Follow-ups

Visual check that per-word-span verse line matches the previous `text_uthmani` rendering (word Uthmani may differ subtly). Reciter search/filter. Close pickers on outside-click.
