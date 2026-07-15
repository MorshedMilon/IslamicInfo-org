# Module 5A — Share PNG (verse image) — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Stage:** 3 (share) · **Date:** 2026-07-15
**Governing docs:** PRD (share verse card) · TechSpec §3.10 · CONTENT-POLICY §9 (translation attribution) · DEFINITION-OF-DONE.md
**Blueprint:** attached `quran.html` (locked — share modal markup + CSS are final). **Builds on:** Module 2 (dynamic `.ayah-card` `a-{key}`, `.ayah-trans-attr`, share button → `window.openShareModal(ar,en,ref)`).

---

## 1. Purpose & Scope

The share modal preview already works (clicking the ayah share icon opens `#shareModal` and fills Arabic / translation / logo / ref). But the two action buttons are **stubs**: `.share-dl` (Download PNG) fires `showToast('Downloading image…')` and `.share-native` (Share ↗) fires `showToast('Sharing…')` — neither produces a file. Make them real: rasterize the preview to a PNG via **manual `<canvas>` drawing** (matching the locked design tokens), download it, and offer native share where supported. Also fix a CONTENT-POLICY §9 correctness bug: the inline `openShareModal` **hardcodes `· Sahih International`** onto every ref regardless of the actual translation edition.

### In scope
- **Download PNG:** draw the verse card onto an off-screen canvas at the selected format (**Square 1080×1080** or **Story 1080×1920**) using the locked tokens (teal gradient + gold radial glow, `ISLAMICINFO.ORG` logo, Arabic RTL wrapped, gold divider, italic translation wrapped, ref line), `canvas.toBlob()` → download `islamicinfo-{surah-slug}-{ayah}.png`. Await web-font load before drawing so Arabic never renders as tofu.
- **Share ↗:** Web Share API with the PNG as a `File` (`navigator.share({files})`) where `navigator.canShare({files})` is true; otherwise fall back to the download path + a toast (no silent failure).
- **Attribution fix:** override `openShareModal` to read the **real** edition from the source card's `.ayah-trans-attr` (Module 4's approach) and render it into `#shareRef` — in both the preview and the exported image — instead of the hardcoded string.

### Deferred (agreed)
- Additional formats / templates beyond the locked Square + Story.
- Server-side / OG image generation.
- Sharing translation text-only (this is the image feature).

### Non-goals
- No CSS/markup change to the share modal (visual design is locked); the canvas **mirrors** the preview look by value, it does not restyle it.
- No new scripture surfaced — the image renders an already-rendered, already-attributed verse.
- No backend, no API key, no localStorage. **No 🕌 review gate** (verbatim copy of an authoritative verse the user already sees, correctly attributed).

---

## 2. HTML / trigger elements in scope (locked `quran.html`)

- Ayah share button (4th in `.ayah-actions`) → Module 2 wires `window.openShareModal(v.text_uthmani, v.translation, ctxSurahName + ' ' + v.verse_key)` (ref has **no** edition; inline appends the hardcoded one).
- `#shareModal.share-modal` / `.share-content`; `.share-fmt` two buttons (`setShareFmt('square'|'story',this)`, active `.on`); `#sharePreview.share-preview` (aspect-ratio 1/1 ↔ 9/16) containing `.sp-logo` (`ISLAMICINFO.ORG`), `.sp-ar#shareAr`, `.sp-divline`, `.sp-en#shareEn`, `.sp-ref#shareRef`.
- `.share-acts`: `.share-dl` (Download PNG, currently `onclick="showToast('Downloading image…')"`), `.share-native` (Share ↗, currently `onclick="showToast('Sharing…')"`).
- Overridden inline globals (locked JS stays, superseded): `openShareModal`, and the `.share-dl` / `.share-native` behavior (wired via `addEventListener` in the controller; the inline `onclick` toasts remain as a pre-JS fallback but the listeners drive the real action).

## 3. Design tokens the canvas mirrors (from locked `:root`)

- Preview bg: `linear-gradient(135deg, #004E55 (teal-800), #062628 (teal-950))`.
- Radial glows: teal `rgba(0,105,110,.3)` ellipse at ~20%/30%; gold `rgba(197,160,89,.2)` ellipse at ~80%/20%.
- Logo `.sp-logo`: font `Cormorant Garamond` (display), `rgba(255,255,255,.4)`, uppercase, letter-spacing ~.12em.
- Arabic `.sp-ar`: font `Amiri` (arabic), `rgba(255,255,255,.95)`, RTL, centered, line-height ~1.9.
- Divider `.sp-divline`: ~60px × ~2px gold `#C5A059` centered.
- Translation `.sp-en`: font `Cormorant Garamond` italic, `rgba(255,255,255,.80)`, centered, line-height ~1.65.
- Ref `.sp-ref`: font `JetBrains Mono` (mono), `rgba(255,255,255,.4)`.

Sizes scale from the ~420px preview to the 1080px canvas (≈2.57× base). Font-family fallbacks: display→`Georgia,serif`, arabic→`serif`, mono→`monospace`.

---

## 4. Pure core (DOM-free, tested) — `src/js/quran-share-core.js`

UMD (`window.II.shareCore` + `module.exports`). All pure/deterministic.

- `dims(fmt)` → `{ w, h }`: `'story' → {1080,1920}`, else `{1080,1080}`.
- `slugFilename(surahName, verseKey)` → `'islamicinfo-' + slug(surahName) + '-' + verseKey.replace(':','-') + '.png'` (slug = lowercase, non-alnum→`-`, trimmed).
- `stripQuotes(s)` → trims wrapping straight/curly quotes.
- `editionFromAttr(attr)` → text before first `·`, trimmed (`''` if none).
- `wrapText(text, maxWidth, measure)` → `string[]` lines. Greedy word-wrap using the injected `measure(str)→number` (so it's testable without a real canvas). Splits on whitespace; a single word longer than `maxWidth` is kept on its own line (no mid-word break for v1). For RTL Arabic, wrapping is by whitespace-separated tokens the same way (the controller sets `ctx.direction='rtl'` + `textAlign='center'` at draw time).
- `TOKENS` — an object literal of the color/font constants above (so both the controller and tests reference one source).

---

## 5. Controller — `src/js/quran-share.js`

Loaded after `quran-verses.js`. Uses `window.II.shareCore`. Keeps a module-level `current` share model.

**Attribution-correct open (override):**
- `window.openShareModal(ar, en, ref)` — derive the verse key = last whitespace token of `ref`; find `document.querySelector('.ayah-card[data-key="'+vk+'"]')`; `edition = shareCore.editionFromAttr(card ? card.querySelector('.ayah-trans-attr').textContent : '')` with fallback to the global translation label if the card isn't found (else `''`). Set `#shareAr = ar`, `#shareEn = '"'+en+'"'`, `#shareRef = ref + (edition ? ' · ' + edition : '')`. Store `current = { ar, en: stripQuotes(en), ref, edition, vk, surahName: ref w/o trailing key }`. Add `.open` to `#shareModal`.
- Format is read from the DOM at export time: the `.share-fmt button.on` index (0 = square, 1 = story) → `fmt`. (No need to override `setShareFmt`.)

**Canvas draw (pure-ish, testable with a recording stub ctx):**
- `drawShareCard(ctx, model, d)` — fill bg linear-gradient(`d`), paint the two radial glows, then draw logo / Arabic (RTL, wrapped via `wrapText` using `ctx.measureText`) / gold divider / translation (italic, wrapped) / ref, all centered horizontally, vertically composed with token-scaled sizes and gaps. Issues only `ctx.*` calls — a stub ctx that records calls verifies the sequence in tests.

**Real actions (wired via `addEventListener` in init):**
- `downloadPNG()` — build `<canvas>` at `dims(fmt)`; `await ensureFonts()` (`document.fonts.load` for Amiri / Cormorant Garamond / JetBrains Mono, guarded — skip if `document.fonts` absent); `drawShareCard(ctx, current, d)`; `canvas.toBlob(blob => { url=createObjectURL; a=<a download=filename>; a.click(); revoke; showToast('Image saved') }, 'image/png')`. Filename = `shareCore.slugFilename(current.surahName, current.vk)`.
- `shareNative()` — same canvas/blob; `const file = new File([blob], filename, {type:'image/png'})`; if `navigator.canShare && navigator.canShare({files:[file]})` → `navigator.share({ files:[file], title:'IslamicInfo.org', text: current.ref })` (catch/ignore `AbortError`); else fall back to `downloadPNG()` + `showToast('Sharing not supported — image downloaded')`.
- `init()` — attach listeners to `.share-dl` (→ downloadPNG) and `.share-native` (→ shareNative) once; run on DOMContentLoaded / immediately if already loaded. Expose `window.II.quranShare = { _draw: drawShareCard, _model: () => current, downloadPNG, shareNative }`.

**States (RULE 5):**

| State | Behavior |
|---|---|
| No verse open / `current` null | buttons no-op safely (guard) |
| `canvas.getContext` unavailable | toast "Image export not supported on this browser"; no throw |
| Fonts not loaded / `document.fonts` absent | draw with fallback fonts (Georgia/serif/monospace); still produces an image |
| `navigator.share` unsupported | fall back to download + toast |
| User cancels native share (`AbortError`) | silently ignore (no error toast) |
| Card not found for edition | fall back to global translation label, else omit edition |

---

## 6. Files

| File | Change |
|---|---|
| `src/js/quran-share-core.js` | **NEW** — pure (UMD `window.II.shareCore`), unit-tested |
| `src/js/quran-share.js` | **NEW** — canvas draw + `openShareModal` override + button wiring |
| `tests/quran/share-core.test.js` | **NEW** — `node:test` |
| `quran.html` | **MINIMAL** — 2 `<script>` includes after the AI-explain includes (`quran-ai.js`) |
| — | No DATA.md change (nothing persisted); no DECISIONS ADR needed (client-only, no arch decision) — a one-line note in the module memory suffices |

Load order: after `quran-verses.js` (so the `openShareModal` override wins over the inline demo).

---

## 7. Testing

- **Pure core** (`node:test`): `dims` (square/story); `slugFilename` (`:`→`-`, slug); `stripQuotes` (straight + curly); `editionFromAttr` (with/without `·`, empty); `wrapText` with an injected measurer (fits-on-one-line; wraps at width; a single over-long word stays alone; empty string → `['']` or `[]`).
- **Controller** (jsdom harness, **mock canvas**: stub `HTMLCanvasElement.prototype.getContext` → recording 2d-context stub with `measureText`→`{width:len*C}`, `createLinearGradient`/`createRadialGradient`→stub with `addColorStop`; stub `toBlob(cb)` → `cb(new Blob())`; stub `URL.createObjectURL`/`revokeObjectURL`; stub `document.fonts`): 
  - `openShareModal('ARB','the mercy','Al-Fatihah 1:1')` with a matching `.ayah-card[data-key="1:1"]` whose `.ayah-trans-attr` = "Dr. Mustafa Khattab · Al-Fatihah 1:1" → `#shareRef` ends with **"· Dr. Mustafa Khattab"** (NOT "Sahih International"); `current.edition` correct.
  - `.share-dl` click → `getContext('2d')` used, `drawShareCard` issued fillRect/gradient/fillText calls, `toBlob` called, a `<a download="islamicinfo-al-fatihah-1-1.png">` was clicked.
  - Story format selected (`.share-fmt` 2nd button `.on`) → canvas sized 1080×1920.
  - `.share-native` with `navigator.canShare` true → `navigator.share` called with a `files` array; with it false → falls back to download.
  - `getContext` returning null → toast, no throw.
  - zero console errors.
- **Pixel fidelity** vs. the preview is **visually verified in-browser by the user** (canvas mirrors locked tokens by construction; not asserted in the harness).

---

## 8. Definition-of-Done gates

- **Universal:** matches the share PRD intent; only requested changes; both themes (image is theme-independent — teal card); no console errors; graceful fallbacks; self-reviewed.
- **Design:** no CSS/token/markup change to the modal; canvas mirrors locked tokens by value; no raw hex introduced into the page (hex lives only inside the JS draw code, referencing the locked token values).
- **Content (§9):** exported image + preview show the **real** translator/edition (attribution bug fixed); no fabricated content; verbatim verse + its own attribution. **No 🕌 gate.**
- **(No API / no data-key gates.)**

---

## 9. Follow-ups

Mid-word break for very long unbroken tokens. Additional share templates. OG/social meta image. Copy-image-to-clipboard (`ClipboardItem`). Font-preload hint for the three canvas fonts to speed first export.
