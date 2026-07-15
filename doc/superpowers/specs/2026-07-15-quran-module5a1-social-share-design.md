# Module 5A.1 — Direct WhatsApp / SMS / Copy share — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Stage:** 3 (share) · **Date:** 2026-07-15
**Governing docs:** CONTENT-POLICY §9 (translation attribution) · DEFINITION-OF-DONE.md
**Blueprint:** attached `quran.html` (locked). **Extends:** Module 5A (`quran-share-core.js`, `quran-share.js`, `#shareModal`).

---

## 1. Purpose & Scope

Add direct **WhatsApp**, **SMS**, and **Copy** actions to the share modal that pre-fill the **verse text** (Arabic + translation + reference + edition + a link), for text-based sharing. Complements the existing image share (Download PNG / native Share ↗) — these three carry **text only** (URL schemes can't attach the PNG).

### In scope
- A compact quick-share row **injected by JS** into `.share-content` after `.share-acts` (three `<button>`s reusing the existing `.share-fmt button` pill styling — **no HTML/CSS edit, no new colors**; icons monochrome via `currentColor`).
- **WhatsApp** → opens `https://wa.me/?text=<encoded>`; **SMS** → opens `sms:?&body=<encoded>` (best-effort cross-platform); **Copy** → clipboard + "Copied" toast (with a `<textarea>`+`execCommand` fallback).
- Shared text mirrors the image and satisfies §9: Arabic, translation (quoted), `— {ref} ({edition})`, and a surah link (current `?surah=` URL if present, else built from the surah slug).

### Deferred / Non-goals
- No image via these links (scheme limitation — stated to user).
- No new social targets (X/Telegram/email) in v1.
- No 🕌 gate (verbatim, already-attributed verse). No backend, no localStorage.
- No edit to the locked share-modal markup or CSS — the row is created at runtime (add-JS-behavior-only, like every module).

---

## 2. Elements in scope

- `.share-content` (inject target), `.share-acts` (insert-after anchor). Existing `.share-fmt` / `.share-fmt button` classes reused for the new row's styling. The Module-5A `current` share model (`{ ar, en (raw), ref, edition, vk, surahName }`) is the data source.

---

## 3. Core additions — `src/js/quran-share-core.js`

- `buildShareText(model, url)` → multi-line string. Lines (skip empty): `ar`; `'"' + en + '"'`; `'— ' + ref + (edition ? ' (' + edition + ')' : '')`; `url`. Joined with `\n`.
- `waHref(text)` → `'https://wa.me/?text=' + encodeURIComponent(text)`.
- `smsHref(text)` → `'sms:?&body=' + encodeURIComponent(text)` (the `?&` form is the most compatible across iOS/Android).

All pure, UMD (`window.II.shareCore`). `slug` (existing) is reused for the link.

## 4. Controller additions — `src/js/quran-share.js`

- `shareUrl()` — if `location.search` matches `/[?&]surah=/` → `location.href`; else `location.origin + location.pathname + (slug ? '?surah=' + slug : '')` where `slug = core.slug(current.surahName)`; wrapped in try/catch → `'https://islamicinfo.org/quran.html'`.
- `injectQuickRow()` (in `init()`, once — guard on `.share-quick` existing): create `<div class="share-fmt share-quick">`; append three `<button type="button">` (WhatsApp / SMS / Copy) each `innerHTML = <inline monochrome SVG> + '<span>Label</span>'`; insert after `.share-acts` in `.share-content`. Buttons are direct children of a `.share-fmt` container → inherit `.share-fmt button` styling (no new CSS).
- Handlers (read `current` fresh at click time; guard null → "Open a verse to share"):
  - WhatsApp → `window.open(core.waHref(core.buildShareText(current, shareUrl())), '_blank', 'noopener')`.
  - SMS → `window.open(core.smsHref(core.buildShareText(current, shareUrl())), '_blank')`.
  - Copy → `copyText()`: `navigator.clipboard.writeText(text).then(ok→toast 'Copied', fail→fallbackCopy)`; if no `navigator.clipboard`, `fallbackCopy` (hidden `<textarea>` + `document.execCommand('copy')` in try/catch → 'Copied' / 'Could not copy').
- Expose on `window.II.quranShare`: `_shareText: () => core.buildShareText(current, shareUrl())`, plus `openWA`, `openSMS`, `copyText` for tests.

**States:** null `current` → toast, no throw; clipboard unavailable → textarea fallback; window.open blocked → best-effort (no throw). Zero console errors.

## 5. Files

| File | Change |
|---|---|
| `src/js/quran-share-core.js` | **EDIT** — add `buildShareText`, `waHref`, `smsHref` |
| `src/js/quran-share.js` | **EDIT** — inject quick row + 3 handlers + `shareUrl` |
| `tests/quran/share-core.test.js` | **EDIT** — cases for the 3 new pure fns |
| — | No `quran.html` change (row injected at runtime); no CSS |

## 6. Testing

- **Core:** `buildShareText` (all fields → 4 lines; no edition → no parens; no url → 3 lines; missing ar → skipped); `waHref`/`smsHref` (correct prefix + `encodeURIComponent`, e.g. spaces→`%20`, newlines→`%0A`).
- **Controller (jsdom, stub `window.open`, `navigator.clipboard.writeText`, `showToast`):** row injected with 3 buttons after `.share-acts`; after `openShareModal(...)`, WhatsApp click → `window.open` href starts `https://wa.me/?text=` and (decoded) contains the translation + edition + link; SMS click → `window.open` href starts `sms:?&body=`; Copy click → `clipboard.writeText` called with §9-attributed text (contains edition) + 'Copied' toast; null-current guard → toast; zero console errors.

## 7. Definition-of-Done

- Universal: additive only; both themes; no console errors; graceful fallbacks; self-reviewed.
- Design: no HTML/CSS edit; reuses `.share-fmt` tokens; **no WhatsApp brand green** / no new hex; monochrome icons.
- Content (§9): shared text includes translator/edition; verbatim verse; no fabrication. **No 🕌 gate.**

## 8. Follow-ups

Add X/Telegram/email targets. Ayah-level deep-link (Stage 2) for a precise share URL. Platform-specific SMS scheme refinement if field reports show issues.
