# Tafsir Panel + Daily Reflection — Design Spec

**Date:** 2026-07-16
**Status:** Approved design → implementation
**Depends on:** Quran Explorer Modules 1–5 + Mushaf/Tajweed (all merged/live).

---

## 1. Goals

**Task 1 — Tafsir (functional, per-ayah, multi-source).**
The Tafsir side panel becomes fully functional: the user picks among authentic tafsir
sources; clicking any ayah shows that ayah's tafsir in the right panel, well formatted.
Panel is **open by default** and closable.

**Task 2 — Daily Reflection (functional, daily-rotating, authentic).**
The three daily cards (Verse / Hadith / Dua of the Day) become functional, show
**authentic content** (live API where sensible, curated static otherwise), **rotate
automatically each day**, and their **"View" / "Read in context"** buttons open the full
item in-app.

---

## 2. Verified facts (live-tested 2026-07-16)

- **Tafsir — English available for exactly three of the requested sources:**
  Ibn Kathir, Ma'arif al-Qur'an, Al-Jalalayn. **As-Sa'di and al-Tabari/al-Qurtubi have
  NO free English per-ayah data** (Arabic-only / PDF-only). Per user decision: ship the 3
  English now; **As-Sa'di via archive.org OCR ingest is a separate fast-follow task**
  (its `_djvu.txt` OCR layer exists — viable but needs a parser + validation pass).
- **spa5k/tafsir_api** (jsDelivr CDN, keyless, CORS `*`): `en-tafisr-ibn-kathir`,
  `en-tafsir-maarif-ul-quran`, `tafsir-al-jalalayn` all return real English text
  (`{ "text": "…\n\n…" }`, plain text with newlines).
- **quran.com v4** (keyless, CORS `*`): `GET /tafsirs/{id}/by_ayah/{s:a}` → `{tafsir:{text}}`
  (HTML). Ibn Kathir=169, Ma'arif=168. (No Jalalayn.)
- **alquran.cloud** (keyless, CORS `*`): `GET /v1/ayah/{ref}/editions/quran-uthmani,en.sahih`
  → `{data:[{text,…}, {text,…}]}` (Arabic + Saheeh Intl.).
- **Deployment reality:** `/api/*` Worker routes are unreliable on the GitHub Pages
  deployment; `/api/hadith` returns 501, no `/api/dua`/`/api/tafsir`. → **Call free
  CORS APIs client-direct** (the prayer-widget pattern), not the Worker.

---

## 3. Constraints (charter)

- Every verse/hadith/dua/tafsir carries a **source**; nothing invented. Arabic text comes
  from APIs/authenticated datasets — never hand-transcribed.
- No new colors/fonts; reuse design tokens and existing `.tp-*` / `.trio-*` styles.
- Graceful fallbacks; 8s timeout + abort on every fetch.
- Ships **pending 🕌 human-review sign-off** (CONTENT-POLICY §5), like Modules 2/3/5B.
- Run the islamic-authenticity skill over the curated hadith set before shipping.

---

## 4. Task 1 — Tafsir

### 4.1 Sources (config, in core)
```
TAFSIR_SOURCES = [
  { key:'ik', label:'Ibn Kathir',      spa5k:'en-tafisr-ibn-kathir',      quranId:169, lang:'en' },
  { key:'ma', label:"Ma'arif al-Qur'an", spa5k:'en-tafsir-maarif-ul-quran', quranId:168, lang:'en' },
  { key:'ja', label:'Al-Jalalayn',     spa5k:'tafsir-al-jalalayn',        quranId:null, lang:'en' }
]
```
(As-Sa'di appended later as `{ key:'sa', label:"As-Sa'di", static:'src/data/tafsir-saadi/…' }`.)

### 4.2 Fetch (core, pure-ish)
- Primary: `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/{spa5k}/{surah}/{ayah}.json`
  → `{text}` (plain text, `\n` paragraph breaks).
- Fallback (if primary fails AND `quranId`): `https://api.quran.com/api/v4/tafsirs/{quranId}/by_ayah/{s:a}`
  → `{tafsir:{text}}` (HTML → strip to text via a sanitizer that keeps paragraph breaks,
  drops tags/inline styles, unescapes entities).
- `AbortController` + 8s timeout. Returns `{ text, sourceLabel, verseKey, lang }` or throws.

### 4.3 Formatting (core)
- `formatTafsir(rawText, isHtml)` → array of paragraph strings:
  - HTML path: strip tags (keep `<h1/h2/h3>` as heading text on their own line), decode
    entities, collapse whitespace, split on double newline / block boundaries.
  - Plain path: split on `\n{2,}` (fallback single `\n`), trim empties.
- No script/style survives (XSS-safe: build text nodes / escape).

### 4.4 DOM controller (`quran-tafsir.js`)
```
window.II.tafsir = {
  setVerse(verseKey, surahName),  // load tafsir for this ayah + current source
  setSource(key),                 // switch source, reload current verse
  current(): {verseKey, source}
}
window.switchTafsir(btn, key)     // replaces inline version → II.tafsir.setSource
window.openTafsir() / closeTafsir()  // existing; ensure default-open
```
- Renders `#tafsirBody`: `.tp-ref` (`{SurahName} · {s}:{a} · {label}`), paragraphs as
  `.tp-text`, `.tp-attr` (`Tafsir {label} · via spa5k/quran.com`). Loading + error states.
- `lang:'ar'` sources (future) → `dir=rtl` + Quran font + "Arabic" pill. (All 3 now = LTR.)
- Cache: `localStorage['ii-tafsir-'+verseKey+'-'+key]` = `{text, isHtml, ts}`, TTL 30d
  (tafsir is static). Cache-first, revalidate on miss.

### 4.5 Wiring
- Hook `setActiveVerse(card)` (in `quran-verses.js`) → after marking active, call
  `window.II.tafsir && II.tafsir.setVerse(card.dataset.key, ctxSurahName)`.
- The per-card footer "Tafsir" button + toolbar `#tafsirCtrlBtn` → `openTafsir()` then load
  active verse.
- Relabel the 3 `.tp-src` buttons to Ibn Kathir / Ma'arif al-Qur'an / Al-Jalalayn
  (`switchTafsir(this,'ik'|'ma'|'ja')`).
- **Default open:** ensure `#tafsirPanel` has no `.closed` at load AND is not force-closed
  by Mushaf/Reading toggles unless the user closed it. (Reading Mode still closes it.)
- Remove hardcoded `tafsirTexts` + the inline `switchTafsir`.

### 4.6 Fallbacks
- Fetch fail (both providers) → `#tafsirBody` shows "Tafsir temporarily unavailable for
  this ayah — please try again." + keep panel usable.
- On first load (no active verse yet) → show a gentle "Select an ayah to read its tafsir."

---

## 5. Task 2 — Daily Reflection (shared)

### 5.1 Files
- `src/js/reflection-core.js` (pure): `dayIndex(nowMs, len)`, curated verse-ref list,
  pickers, shape normalizers.
- `src/js/reflection.js` (DOM): fetch verse, read static hadith/dua, fill cards, wire buttons.
- `src/data/reflection-hadith.json`, `src/data/reflection-dua.json` (curated seeds).

### 5.2 Daily rotation (deterministic, UTC)
- `dayIndex(nowMs, len) = Math.floor(nowMs / 86400000) % len` — same all day globally.
- Verse ref, hadith, dua each indexed independently by `dayIndex`.

### 5.3 Verse of the Day
- Curated list of ~40 reflection verse keys (well-known, uplifting) in core.
- Fetch live: `alquran.cloud /v1/ayah/{s:a}/editions/quran-uthmani,en.sahih`
  → `{arabic, english, surahName, surahNumber, ayah, ref, slug}`.
- Cache `localStorage['ii-refl-verse']` = `{day, data}` 24h; fallback to Ayat al-Kursi seed.

### 5.4 Hadith of the Day (curated static)
- `reflection-hadith.json`: ~40 authentic hadith objects, **built from Sahih Bukhari/Muslim
  via fawazahmed0 at build time** (real Arabic + English, no transcription). Shape:
  `{ arabic, english, collection, number, grade:'Sahih', narrator, ref, url }`.
- Daily pick; render arabic + english + grade tag + ref.

### 5.5 Dua of the Day (curated static)
- `reflection-dua.json`: ~40 authentic duas (Quranic duas + Hisnul-Muslim via dua-dhikr at
  build time). Shape: `{ arabic, translit, english, source, ref, surahSlug? }`.
- Daily pick; render arabic + english + source.

### 5.6 Card hooks (both pages)
Add data attributes to the trio cards so one module fills both layouts:
- Card: `data-refl-card="verse|hadith|dua"`.
- Fields: `data-refl="arabic|text|ref|grade|action"`.
- Pages: quran.html `.trio-section` cards (Verse/Hadith/Dua) + index.html "Daily Trio" cards.
- `reflection.js` queries `[data-refl-card]` and fills present fields (works on either page).

### 5.7 Buttons
- Verse `data-refl="action"` (Read in context) → `quran.html?surah={slug}`.
- Hadith action (View) → `hadith.html`.
- Dua action (View/Listen) → `dua.html`.
- (Item-level deep-links into hadith/dua pages = future; page-level now.)

### 5.8 Fallbacks
- Verse fetch fail → seed verse. Hadith/dua are static (always present).
- No card hooks on a page → module no-ops there.

---

## 6. Out of scope (this pass)
- As-Sa'di English tafsir (fast-follow: archive.org OCR → per-ayah JSON + validation).
- al-Tabari / al-Qurtubi (no English; dropped per user).
- Item-level deep-links into hadith.html / dua.html.
- Ayah-precise scroll for "Read in context" (surah-level now; ayah anchor optional).
- Arabic-language tafsir toggle.

---

## 7. Testing
- Core unit (node:test): `dayIndex` rotation/bounds; `formatTafsir` (HTML + plain, XSS
  strip, paragraph split); verse-ref normalizer; source config lookup.
- Manual/headless: click ayah → tafsir loads (each of 3 sources); panel default-open +
  close/reopen; cache hit; fallback on blocked network; daily cards fill on both pages;
  buttons navigate; dark mode; RTL sanity.

## 8. File change summary
| File | Change |
|---|---|
| `src/js/quran-tafsir-core.js` | **new** — sources, fetch, formatTafsir (node-tested) |
| `src/js/quran-tafsir.js` | **new** — panel controller + wiring |
| `src/js/reflection-core.js` | **new** — dayIndex, verse-ref list, normalizers (node-tested) |
| `src/js/reflection.js` | **new** — fill cards + buttons (both pages) |
| `src/data/reflection-hadith.json` | **new** — curated authentic hadith seed |
| `src/data/reflection-dua.json` | **new** — curated authentic dua seed |
| `src/js/quran-verses.js` | hook `setActiveVerse` → tafsir |
| `quran.html` | relabel tafsir tabs, default-open, `data-refl` hooks, script includes, drop hardcoded tafsir |
| `index.html` | `data-refl` hooks on Daily Trio, `reflection.js` include |
| `doc/API-SPEC.md`, `doc/DATA.md` | document sources + new localStorage keys |
