# Prominent top domain wordmark on share cards

**Date:** 2026-07-25
**Status:** Approved (design) — small visual change
**Surfaces:** Reflection share card (`src/js/reflection-actions.js` `drawCard`) and Quran
verse share card (`src/js/quran-share.js` `drawShareCard`).

## Problem
The `ISLAMICINFO.ORG` wordmark on every generated share PNG is faded (`white40`),
small, and — on the reflection card — placed at the **bottom**, where viewers ignore it.
The domain should be seen first.

## Change (owner-approved)
Make the domain wordmark **bold, bright (near-white `white95`), larger (~20% up), and
pinned at the top** of both cards. Remove the redundant faded bottom wordmark on the
reflection card. No new colors/fonts (design system locked) — only existing TOKENS.

### Reflection card (`drawCard`)
- **Add** a top wordmark as the first drawn text, above the "TODAY'S REFLECTION · date"
  eyebrow: `ctx.fillStyle = T.white95; ctx.font = '700 ' + Math.round(W*0.031) + 'px ' + T.fontDisplay;`
  drawn at `cx, H*0.072`, text `'I S L A M I C I N F O . O R G'`.
- **Remove** the bottom wordmark (current lines ~203–205: comment + `white40` fillText at
  `H*0.925`). The bottom keeps only the reference line at `H*0.86`.
- Eyebrow (`H*0.115`) and gold type label positions unchanged.

### Quran card (`drawShareCard`)
- **Upgrade** the existing top logo (currently `white40`, `600`, `W*0.026`, at `H*0.15`)
  to `white95`, weight `700`, size `W*0.031`, lifted to `H*0.11` (clearly at top).
- Bottom reference line unchanged.

### Font loading
- Both `ensureFonts()` add `'700 20px "Cormorant Garamond"'` to the preload list so the
  bold weight rasterizes crisply (browser synthesizes bold if the face lacks 700).

## Consistency
Both cards use the same wordmark spec (white95 / 700 / `W*0.031` / `fontDisplay`,
letter-spaced) for a single brand treatment across all shared images.

## Validation
No logic/unit change — existing tests stay green (canvas draw only). Visual check: open
the share modal on the homepage (reflection) and the Quran page; confirm the bold bright
domain sits at the top in both Square and Story formats, light + dark, with no text
overflow at the card edges. If the wordmark crowds the card width at `W*0.031`, step down
to `W*0.029`.

## Out of scope
Any other card content, layout, or the per-reflection permalink/OG-image work.
