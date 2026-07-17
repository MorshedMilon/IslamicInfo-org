# Design — Quran Explorer: Multiple Translations (Task 7)

**Date:** 2026-07-16
**Status:** Approved (brainstorm) → implementing
**Scope:** Primary translation picker only. Compare feature is out of scope (separate task).

## Goal

Let users choose their preferred translation in the Quran Explorer. English
(Saheeh International, edition `20`) remains the default for anyone who never
opens the picker. Source the full live list of translations from the quran.com
API (dynamic, ~126 translations across ~69 languages).

## Key finding — no "Arabic translation"

The quran.com `/resources/translations` endpoint returns **126 translations in
69 languages but none in Arabic** — Arabic is the *source text* (already shown
as the primary Uthmani verse), not a translation. So the requested "Arabic" is
already on screen; the picker covers every other requested language (Urdu,
Hindi, Bengali, Turkish, Indonesian, French, Spanish, German, Russian) plus 59
more. Arabic tafsir remains available separately in the existing Tafsir panel.

## Current state (what exists)

- `quran-verses.js:20-23` — `edition()` reads `localStorage['ii-quran-translation']`,
  defaults to `20`. **The verses layer already honors this key** — nothing writes it yet.
- `quran-verses.js:57-59` — fetch URL passes a single `translations=<id>`.
- `quran-verses-core.js:10` — `EDITIONS` map (only 3 ids), `editionName(id)`.
- `quran.html:1549` — the "Sahih Intl." toolbar button is a **cosmetic stub**
  (`onclick="showToast(...)"`); no dropdown, never writes the key.
- `quran-audio.js` — a **complete working analog**: fetches quran.com
  `/resources/recitations`, caches (`ii-reciters`, 7d), seeds from
  `src/data/reciters.json`, renders a floating picker appended to `<body>`,
  persists `ii-quran-reciter`, closes on outside-click. The translation picker
  mirrors this pattern.

## Architecture

### 1. Pure helpers — `quran-verses-core.js` (DOM-free, unit-tested)

Add (keep `EDITIONS`/`editionName` as fallback):

- `normalizeTranslation(x)` → `{ id, name, author, language, dir }` from an API
  resource `{id, name, author_name, language_name, translated_name}`. `name`
  prefers `author_name`, falls back to `name`. `dir` is `'rtl'|'ltr'`.
- `isRtlLanguage(langName)` → substring match against an RTL token set
  (`urdu, persian, dari, pashto, sindhi, uighur, uyghur, divehi, dhivehi,
  maldivian, hebrew, kurdish, arabic`). Uses `includes` because some API
  `language_name`s are combined strings (e.g. `"divehi, dhivehi, maldivian"`).
- `groupTranslationsByLanguage(list)` → `[{ language, items:[...] }]`, languages
  alphabetical **but English first**, items sorted by author.
- `filterTranslations(list, query)` → case-insensitive match on
  name/author/language (for the picker search box).
- `translationsCacheKey()` → `'ii-quran-translations-list'`.

### 2. Browser controller — `src/js/quran-translations.js` (NEW)

Mirrors `quran-audio.js`. Responsibilities:

- **Load list:** fetch `https://api.quran.com/api/v4/resources/translations`,
  cache to `ii-quran-translations-list` (`{fetchedAt, data}`, 7-day TTL via
  `core.isFresh`). On failure, fall back to `src/data/translations.json` (curated
  seed). Always available: an inline default of edition `20` so the picker never
  renders empty.
- **Floating picker** appended to `<body>` (`id="translationFloatPicker"`,
  reuses `.reciter-picker` dark styling + a `.tp-*` search/group extension):
  a sticky search input on top, then translations **grouped by language**
  (English group first), current selection highlighted. Positioned relative to
  the trigger, kept on-screen, opens upward if trigger is in the lower half.
  Max-height with internal scroll (126 items).
- **`window.selectTranslation(id)`**: write `ii-quran-translation`, update the
  toolbar label, close the picker, and call `window.loadSurah(window.currentSurahId || 1)`
  to re-fetch verses in the chosen edition. English default unchanged.
- **`window.toggleTranslationPicker(btn)`** + outside-click dismiss.
- **Exposes** `window.II.translations = { name(id), dir(id), isRtl(id), init, ... }`
  so the verses renderer can resolve names/direction for any of the 126 ids.

### 3. Rendering — `quran-verses.js`

- `buildCard()` `:159-160`: when `window.II.translations` is present, set the
  translation `<div>`'s `dir` (and a `trans-rtl` class for the Arabic font stack
  + right alignment) from `II.translations.dir(ctxEditionId)`, and use
  `II.translations.name(ctxEditionId)` for the attribution line. Falls back to
  `core.editionName` when the module hasn't loaded. No change to fetch shape —
  the single selected `edition()` already flows through.

### 4. Markup + CSS — `quran.html`

- Replace the stub button `:1549` with a real trigger:
  `id="translationBtnTop"`, `onclick="toggleTranslationPicker(this)"`,
  `<span id="translationLabelTop">`, chevron, inner `<div class="reciter-picker" id="translationPickerTop">`.
- Add `<script src="src/js/quran-translations.js">` after the audio scripts.
- Add CSS: `.tp-search` (sticky search input, dark theme), `.tp-group-label`
  (language header), and a `.translation-picker` max-height/scroll variant of
  `.reciter-picker`. `.ayah-translation.trans-rtl { direction:rtl; text-align:right; font-family:<arabic stack>; }`.

### 5. Seed + docs

- `src/data/translations.json` — curated offline fallback (~16 real ids covering
  English default + the requested languages), stored in API resource shape.
  Real ids only (verified against the live endpoint — project invariant: never
  invent ids). No Arabic (none exists).
- `doc/DATA.md` — register `ii-quran-translations-list` (`{fetchedAt, data}`, 7d).

## Data flow

open picker → (cached list ? render : fetch live → cache → render; on fail →
seed json) → user clicks a translation → `selectTranslation(id)` writes
`ii-quran-translation` + label → `loadSurah(current)` → `edition()` reads key →
`fetchPage(..., translations=id)` → verses re-render (RTL dir applied if needed)
→ per-edition verse cache `ii-verses-{surah}-{id}`.

## Error handling

- List fetch fails → seed json → inline default. Picker always usable.
- Verse fetch for a chosen edition fails → existing `renderError` + Retry path
  (unchanged); surah 1 still seeds edition `20`.
- Unknown/removed id (e.g. ADR-014's `131`) → `pickTranslation` already falls
  back to `translations[0]`; `name()`/`dir()` fall back to core defaults.

## Testing

- `tests/quran/verses-core.test.js`: add cases for `normalizeTranslation`,
  `isRtlLanguage` (incl. combined language strings), `groupTranslationsByLanguage`
  (English-first ordering), `filterTranslations`, `translationsCacheKey`.
- Run: `node --test tests/quran/verses-core.test.js`.
- Manual: open picker, search, pick Urdu (RTL renders right-to-left), reload page
  (persists), pick English back (default restored).

## Out of scope (unchanged)

Compare feature, word-by-word glosses (stay English — separate data), tafsir/AI
panels (already edition-aware), Mushaf mode compare panel.
