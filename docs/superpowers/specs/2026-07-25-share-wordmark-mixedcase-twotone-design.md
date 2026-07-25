# Share-card wordmark → mixed-case, two-tone

**Date:** 2026-07-25
**Status:** Approved — refinement of `2026-07-25-share-card-top-wordmark-design.md`
**Surfaces:** `src/js/reflection-actions.js` `drawCard`, `src/js/quran-share.js` `drawShareCard`.

## Rationale
The prior top wordmark was all-caps, letter-spaced (`I S L A M I C I N F O . O R G`).
Two problems:
1. **Readability.** Reading relies on word-shape (bouma) recognition. All-caps flattens
   the silhouette and the per-letter tracking shatters it into disconnected glyphs,
   forcing slow letter-by-letter parsing.
2. **Brand consistency.** The brand is written **`IslamicInfo.org`** everywhere else on
   the site; the all-caps card was the outlier.

## Change
Render the wordmark as **`IslamicInfo.org`** — mixed case, **no letter-spacing**, bold
(`700`), at the top (positions unchanged: reflection `H*0.072`, Quran `H*0.11`). Apply a
**two-tone** colour split so the colour break lands on the word break:
- `Islamic` → `white95`
- `Info` → `gold` (`#C5A059`)
- `.org` → `white80` (muted)

Size `W*0.033` (mixed case is far more compact than the spaced caps, so no overflow).

## Implementation
A small `drawWordmark(ctx, [T,] W, y)` helper in each drawer (each file is self-contained
by design). It sets the bold display font, measures the three segments, and draws them
centered with `textAlign='left'` advancing by measured width (canvas `fillText` is
single-colour, so segments are drawn sequentially), restoring the previous `textAlign`.

## Validation
No logic/unit change — 125 tests stay green. Visual check in the share modal (reflection
+ Quran, Square + Story, light + dark): `IslamicInfo.org` reads as one word, `Info` gold,
sits crisply at the top, no edge overflow.

## Out of scope
Font/size of other card text; the two golds concern is resolved by the two-tone split
(only `Info` is gold, distinct from the full-gold "Verse of the Day" label).
