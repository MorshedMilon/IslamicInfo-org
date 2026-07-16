# Quran Explorer — Authentic Madina Mushaf + Tajweed (Module 5a)

**Date:** 2026-07-15
**Status:** Approved design → implementation
**Owner:** Quran Explorer
**Depends on:** Modules 1 (sidebar), 2 (Study Mode verses), 3 (audio) — all merged.

---

## 1. Goal

Replace the current hardcoded-Al-Fatihah placeholders for Mushaf Mode and Tajweed with
real, data-driven features that work for **any** surah/page.

Three user-facing tasks:

- **Task 1 — Mushaf Mode.** Enabling Mushaf Mode renders the exact **QCF v2 Madina
  Mushaf** (King Fahd / QPC HAFS) — 604 pages, 15 lines per page, authentic glyph
  layout, page breaks, verse positions, sajdah markers, rub-el-hizb (۞) symbols, and
  Juz / Hizb / page numbering.
- **Task 2 — Mushaf + Tajweed.** With Mushaf Mode on, pressing Tajweed swaps to the
  **QCF Tajweed V4** colored font, preserving the *identical* page geometry.
- **Task 3 — Tajweed Mode.** The Tajweed button also color-codes the normal flowing
  **Study view** so "the entire Quran" is covered in both views.

---

## 2. Current state (what we are replacing)

- **Study card view** (`src/js/quran-verses.js`): live, fetches every surah from
  `api.quran.com/api/v4/verses/by_chapter/{id}` and renders `text_uthmani` per word in
  the **Amiri** Google font. Works. No tajweed data is fetched today.
- **Mushaf Mode** (`quran.html` inline): `switchToMushafMode()` only toggles visibility
  of `#mushafPageView`, which is a **hardcoded Al-Fatihah** 16-line block. It is NOT
  built from the loaded surah. → **placeholder, to be replaced.**
- **Tajweed** (`quran.html` inline `toggleTajweed()`): only shows a legend and un-hides
  `.tj-*` spans that exist **only in the hardcoded Al-Fatihah sample**. Live surahs have
  no tajweed data. → **placeholder, to be replaced.**
- Existing tajweed color tokens (reuse, do NOT invent new colors):
  `.tj-madd` (teal-600), `.tj-ghunna` (#2E7D32), `.tj-ikhfa` (#8A6500),
  `.tj-idgham` (#1565C0), `.tj-qalqalah` (#880E4F), with `[data-theme="dark"]` variants.

---

## 3. Non-negotiable constraints (charter)

- Every verse/word rendered carries a real source. **Nothing invented** — Arabic,
  glyph codes, tajweed rules, and page layout all come from quran.com / Quran
  Foundation data, never hand-authored.
- No new colors/fonts beyond the QCF Quran faces. Tajweed reuses the 5 existing
  `.tj-*` families. No raw hex inline (reuse tokens / existing classes).
- Graceful fallbacks required (static-first ethos): never leave the user stuck.
- Ships **pending 🕌 human-review sign-off** (CONTENT-POLICY §5), like Modules 2 & 3.

---

## 4. Data sources & dependencies (approved)

### 4.1 Page layout — live API
```
GET {API_BASE}/verses/by_page/{page}
    ?words=true
    &word_fields=code_v2,line_number,page_number,char_type_name,position
    &mushaf=1            # QCF V2 geometry
    &per_page=... (all words for the page)
```
- `API_BASE` = `https://api.quran.com/api/v4` (the host the app already uses keyless).
  **Verification checkpoint V1:** confirm `by_page` + `code_v2` are served keyless on
  this host. If not, fall back to `https://apis.quran.foundation/content/api/v4`
  (may require a client key — handle at that point).
- Response gives words tagged with `page_number`, `line_number`, `char_type_name`
  (`word` | `end`), and `code_v2` (PUA glyph string). **One printed line can contain
  words from multiple verses — group by `line_number`, not by verse.**
- Header/basmala lines: line 1 of a surah's first page is a `surah_name` header; a
  basmala line precedes surah starts (except Al-Fatihah, At-Tawbah). We derive these
  from verse/word boundaries returned for the page (first line of a new surah →
  ornamental header; the standalone basmala → centered line). Centered lines are
  centered; ayah lines are justified.

### 4.2 Fonts — CDN on-demand (`FontFace` API)
- Plain: `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p{N}.woff2`,
  family `p{N}-v2`.
- Tajweed: `https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p{N}.woff2`,
  family `p{N}-v4` (COLRv1 + `@font-palette-values` for light/dark). Firefox path:
  `.../v4/ot-svg/{light|dark}/woff2/p{N}.woff2` (baked palettes; `font-palette`
  unsupported there).
- Load only the visited page's font; prefetch the next page's. Cache loaded families.
- Glyph runs are injected via `innerHTML` (PUA codes), never `textContent`.
- **Verification checkpoint V2:** confirm the same `code_v2` string renders correctly
  in both `p{N}-v2` and `p{N}-v4` (research says yes — same codes/geometry). Verify on
  page 1 before building the rest.

### 4.3 Flowing-view tajweed — existing verses fetch, extra field
- Add `text_uthmani_tajweed` to the `fields=` list in `quran-verses.js` fetch.
- Returns per-verse HTML with `<tajweed class="…">` spans over Uthmani Unicode.

### 4.4 Fallbacks
- Page-layout API fails, or a page font fails to load → toast "Mushaf temporarily
  unavailable — staying in Study Mode", remain in / revert to Study Mode, and (if a
  partial page rendered) degrade glyph text to Amiri using `text_qpc_hafs`/`text_uthmani`.
- `text_uthmani_tajweed` fetch fails → keep plain text, toast "Tajweed colors
  unavailable right now".
- All network calls: `AbortController` + 8s timeout, matching existing modules.

---

## 5. Tajweed class → family mapping (flowing view only)

The V4 font colors the Mushaf view itself; this map is only for the Study view's
`text_uthmani_tajweed` spans. Map the ~15 API classes onto the 5 existing families:

| API `tajweed class`                                                                 | Family → CSS class |
|-------------------------------------------------------------------------------------|--------------------|
| `madda_normal`, `madda_permissible`, `madda_necessary`, `madda_obligatory`          | `tj-madd`          |
| `ghunnah`                                                                            | `tj-ghunna`        |
| `ikhafa`, `ikhafa_shafawi`                                                           | `tj-ikhfa`         |
| `idgham_ghunnah`, `idgham_wo_ghunnah`, `idgham_shafawi`, `idgham_mutajanisayn`, `idgham_mutaqaribayn`, `iqlab` | `tj-idgham` |
| `qalqalah`                                                                           | `tj-qalqalah`      |
| `ham_wasl`, `slnt`, `laam_shamsiyah`, unknown                                        | *(no color — inherit)* |

Legend stays the 5 named families (Madd, Ghunna, Ikhfa, Idgham, Qalqalah).

---

## 6. Components (new, focused, vanilla JS)

Follows the existing `*-core.js` (pure) + `*.js` (DOM/wiring) split used across the
Quran modules. Attach to `window.II` namespace like siblings.

### 6.1 `src/js/quran-mushaf-core.js` — pure logic, no DOM
```
II.mushafCore = {
  surahFirstPage(surahId): number          // map surah → its first mushaf page
  fetchPage(page): Promise<PageModel>       // by_page fetch + normalize (timeout/abort)
  loadFont(page, variant): Promise<string>  // FontFace load+cache; returns family name
                                            //   variant: 'v2' | 'v4'
  PAGE_MIN=1, PAGE_MAX=604
}

PageModel = {
  page: number,
  juz: number, hizb: number,                // from verse fields on the page
  lines: Line[]                             // exactly the lines present (≤15)
}
Line = {
  n: number,                                // line_number 1..15
  type: 'ayah'|'surah_name'|'basmallah',
  centered: boolean,
  words: Word[]                             // [] for header/basmala rendered specially
}
Word = { code: string, type: 'word'|'end', verseKey?: string }
```
- No DOM, no globals beyond `II.mushafCore`. Independently testable with a fake fetch.

### 6.2 `src/js/quran-mushaf.js` — DOM render + mode wiring
```
window.enterMushafMode(surahId?)   // build page view, jump to surah's first page
window.exitMushafMode()            // restore Study card list exactly
window.mushafGoToPage(page)        // render a specific page (fonts on demand)
window.mushafChangePage(dir)       // prev/next with clamp + prefetch
II.mushaf = { current(): number, isActive(): boolean }
```
- Renders the **page sheet**: ornamental surah header (`surah_name`), centered basmala,
  15 justified ayah lines, glyphs via `innerHTML` in the page font, footer
  "Page N · Juz J · Hizb H".
- Replaces `switchToMushafMode` / `switchToStudyMode` bodies (kept as thin wrappers so
  existing `onclick=` attributes keep working). Removes the hardcoded `#mushafPageView`
  Al-Fatihah markup; `#mushafPageView` becomes an empty render target.
- Ayah-level highlight only (word-level audio sync in Mushaf is out of scope).

### 6.3 `src/js/quran-tajweed.js` — coloring for both views
```
window.toggleTajweed(btn)          // context-aware, replaces inline version
II.tajweed = {
  isOn(): boolean,
  applyFlow(): void,               // color Study view from text_uthmani_tajweed
  clearFlow(): void,
  applyMushaf(): void,             // swap page font family v2→v4 + set palette
  clearMushaf(): void,
  mapClass(apiClass): string       // → 'tj-madd' | ... | ''  (§5)
}
```
- **Study view coloring:** for each card, keep the existing per-word `.al-word` layer
  AND add a hidden `.ayah-tajweed` layer containing the mapped `text_uthmani_tajweed`
  HTML. Tajweed on → show tajweed layer, hide word layer; off → reverse. Audio
  highlight targets whichever layer is visible (ayah-level when tajweed on — rule spans
  legitimately cross word boundaries, so per-word splitting is unsafe).
- **Mushaf coloring:** re-render current page words with family `p{N}-v4` + palette
  (light/dark by theme). No geometry change. Toggling off restores `p{N}-v2`.
- Remembers state across mode switches (like the existing `mushaf*On` flags).

---

## 7. Page presentation ("open mushaf", fit-to-height)

- The page renders as a centered **paper sheet** in `#versesArea`: fixed mushaf aspect
  ratio, subtle paper tone, thin gold frame, vertically + horizontally centered.
- **Fit-to-height:** the whole 15-line page scales to available viewport height so it
  reads like an open physical mushaf with no inner scroll where possible. Implemented
  by sizing the page's line font from a CSS custom property computed against the pane
  height (clamp-based), lines using `text-align: justify; text-align-last: justify`;
  header/basmala lines centered.
- Footer: "Page N · Juz J · Hizb H" using design-system tokens.
- Dark mode inherits existing dark tokens; tajweed uses the V4 dark palette.
- All styling via design tokens / classes — no raw hex inline, no new fonts beyond the
  QCF faces loaded at runtime.

---

## 8. Interaction model

- **Mushaf button** → `enterMushafMode(loadedSurah)`; jump to that surah's first page.
  Prev/next + page-number nav. **Study button** → `exitMushafMode()` (mutually
  exclusive, as today).
- **Tajweed button is context-aware:**
  - In Mushaf mode → font swap v2 ↔ V4 (instant, no reflow).
  - In Study mode → recolor flowing text via the tajweed layer.
  - Works in either mode; state remembered when switching.
- Legend shows only when tajweed is on (both views).

---

## 9. Out of scope (agreed)

- Per-word **audio** highlighting inside Mushaf pages for arbitrary surahs (today's
  word-sync is a hardcoded Al-Fatihah simulation — Module 3 territory). Mushaf keeps
  ayah-level highlight only.
- Self-hosting fonts / offline font bundling (using CDN on-demand).
- QCF v1 and the newer 47-file QCF4 — we use v2 geometry + Tajweed V4 colors.
- 🕌 authenticity review remains a separate downstream gate.

---

## 10. Verification & testing

- **V1:** `by_page` + `code_v2` served keyless on `api.quran.com`? (else foundation host)
- **V2:** same `code_v2` renders in both `p{N}-v2` and `p{N}-v4` (verify page 1 first).
- **V3:** CSP / Cloudflare Worker allows `verses.quran.foundation` (fonts) and the API
  host. Add to any CSP/connect/font-src allowlist if present.
- Unit (pure core, fake fetch): `surahFirstPage`, line grouping (multi-verse line),
  header/basmala classification, PageModel shape, tajweed `mapClass`.
- Manual/e2e: load Al-Baqarah → Mushaf → correct page fills pane centered; page
  nav; Tajweed in Mushaf recolors with no reflow; Tajweed in Study colors flowing
  text; theme toggle recolors; API-down + font-fail fallbacks; RTL correctness.

---

## 11. File change summary

| File | Change |
|---|---|
| `src/js/quran-mushaf-core.js` | **new** — pure page/font logic |
| `src/js/quran-mushaf.js` | **new** — page render + mode wiring |
| `src/js/quran-tajweed.js` | **new** — both-view tajweed coloring |
| `src/js/quran-verses.js` | add `text_uthmani_tajweed` field; keep per-word + add tajweed layer hook |
| `quran.html` | remove hardcoded `#mushafPageView` Al-Fatihah markup; add page-sheet CSS + `<script>` includes; thin wrappers delegate to new modules |
| `doc/API-SPEC.md` | document by_page + tajweed field + font CDN |
| `doc/DATA.md` | note any new localStorage keys (e.g. `ii-quran-mushaf-page`) |
