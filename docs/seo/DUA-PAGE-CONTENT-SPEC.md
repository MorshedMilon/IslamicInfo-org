# DUA-PAGE-CONTENT-SPEC

Per-page original-content specification for individual dua pages on islamicinfo.org.
Companion to `DUA-SEO-STRATEGY-v2.md` (§1 Block A / Block B) and the DECISIONS log (D-A).
**All CSV references below are to the v2 files.** The v1 files (`individual_dua_keywords_by_chapter.csv`,
`hub_pages_keywords.csv`, `famous_named_duas_priority_list.csv`) are malformed and archived — never read them.
Intended to be attached to the Session 2 skill — this is the file the skill enforces.

**Scope:** all 505 individual dua pages under `/duas/{chapter-words}-{stable-id}.html`.
Hub pages (`/duas/occasion/*`, `/duas/source/*`, `/duas/chapter/*`) are out of scope and have
their own requirements in the strategy doc.

---

## 0. The premise, stated once

Identical Arabic, transliteration, and English translation across our pages and competitors' is
**not** a ranking problem in itself. Google's position is that duplicate content is only actionable
where intent is deceptive or where content is republished "without adding any additional value"
(https://developers.google.com/search/blog/2008/09/demystifying-duplicate-content-penalty).
Every scripture site quotes the same text; nobody differentiates on the quotation.

Two consequences that drive this whole spec:

1. **Do not spend effort making the quoted text unique.** The translation line is 1–3 sentences,
   roughly 5% of the page. Rewriting it changes almost nothing about how the page competes.
2. **The added value must be real, per-page, and human-checkable.** The failure mode we are
   actually exposed to is *scaled content abuse* — mass-generated pages that differ only by
   find-and-replace of the dua name. Google's spam policy defines this as "many pages generated for
   the primary purpose of manipulating search rankings and not helping users… large amounts of
   unoriginal content that provides little to no value to users, **no matter how it's created**"
   (https://developers.google.com/search/docs/essentials/spam-policies). The March 2024 rewrite
   made it deliberately method-agnostic — human, AI, or both
   (https://developers.google.com/search/blog/2024/03/core-update-spam-policies). Unlike duplicate
   content, this carries manual actions and site-level risk. A 505-page library built from one
   template with a swapped noun is exactly the pattern the policy describes.

So: identical scripture, genuinely distinct commentary. Block A and Block B below are the
mechanism.

---

## 1. Page anatomy

Every indexed dua page has three content zones. Only zone 3 is ours to differentiate.

| Zone | Contents | Origin | Uniqueness expectation |
|---|---|---|---|
| 1. Scripture | Arabic text, transliteration | Public domain classical text | Identical to everyone. Fine. |
| 2. Translation | English rendering | Attributed third-party, or our own for the top 50 | May match other sites. Fine. Must carry attribution. |
| 3. Original layer | **Block A** (mandatory) + **Block B** (≥1 required) | Written by us | Must be unique per page and non-templated. |

A page missing Block A **must not be indexed.** It may exist and be linked, but ships with
`<meta name="robots" content="noindex,follow">` until Block A is written. This is the only
noindex condition in this spec — licence status never gates indexing (see D-A in the DECISIONS log).

### 1.1 Zone 1 rule — extracted clauses must be shown as extracts

Many corpus records store more than the supplication. A Qur'anic record holds the whole āyah, and
the dua is often one clause of it — `21:83` opens *"And Job, when he cried unto his Lord"*, and the
words to recite begin several words later. A hadith-collection record holds the entire narration
including its isnad, while its English field holds only the dua. Four extraction shapes are defined
in `src/js/dua-clause-core.js`: `quran-clause`, `classb-isnad`, `verse-from-bundle`, `prefix-trim`.

**Where zone 1 renders an extracted clause rather than the whole record, the page must:**

1. **Label the clause as the recitable portion** — not present it as though it were the complete
   āyah or the complete narration.
2. **Show or link the full āyah or narration** it was taken from, in the same zone, so a reader can
   always see the extract in its context.
3. **Name the extraction** in the authentication note (A2): which shape ran, and that a named
   reviewer confirmed it.

**A clause that has not been confirmed by a reviewer must not render at all.** The extractor never
self-certifies — every result it returns carries `needsReview: true` and `verified: false`, and the
page falls back to `noindex` rather than displaying an unverified clause.

**Why this is a zone-1 rule and not a nicety.** Presenting a sub-clause of revelation as a
standalone unit misrepresents the text: it silently redraws the boundary of an āyah, and a reader
memorising from the page would learn that boundary as the verse. That is the same class of error
`DUA-CONTENT-INTEGRITY-v1_0` Gate 1 guards against — a page that is received as something its
source does not say. Extraction is necessary because the alternative (rendering an isnad as the
dua) is worse, but it is a **presentation** change and must be visible as one.

This is the second noindex condition in this spec. It gates zone 1; the Block A condition above
gates zone 3. Neither has anything to do with licence status.

---

## 2. Block A — mandatory, every indexed page

Two components. Both required.

### A1. Context paragraph — "when and why to recite this"

- **Length:** 80–150 words. Hard fail outside that range.
- **Placement:** immediately below the translation, above Block B. Not in a collapsed accordion,
  not below the fold on mobile.
- **Must answer, in prose, at least three of:**
  - What specific moment or situation is this recited in, precisely enough to act on?
  - How many times, and is there a stated time window?
  - What did the Prophet ﷺ or the narrator do or say in the incident this comes from?
  - What is the stated benefit, and where is that stated?
  - What is commonly confused with this dua, or commonly done wrong?
  - Why this dua rather than a similar one for the same occasion?
- **Must contain at least one concrete, checkable specific** — a named narrator, a repetition
  count, a time window ("between Fajr and sunrise"), a place, or a hadith-stated outcome. A
  paragraph with no verifiable specific is filler and fails review.
- **Escape hatch — read this before writing any of the ~300 Tier C pages.** Where the corpus
  record carries no narrator, count, window, or stated outcome, the page **ships `noindex,follow`
  with a short honest note**. It does not get padded to 80 words, and a specific is never
  supplied from memory or inference. A hard word-count floor plus a hard specificity requirement
  plus an AI writer is a fabrication engine, and a fabricated narrator on an Islamic site is the
  one error that no ranking gain offsets (see A2). Many single-line duas in the long tail
  genuinely have nothing more to say — leaving those unindexed is the correct outcome, not a
  failure. Expect this to apply to a meaningful share of Wave 4.
- **Must not** open with the dua's own name as the subject of the first sentence
  ("Ayatul Kursi is a powerful dua that…"). That construction is the single strongest tell of a
  templated library. Open with the situation, the narration, or the question the reader arrived
  with.

### A2. Authentication note

One to three sentences, in a visually distinct block, stating:

- The collection and reference number, from the corpus fields — never reconstructed from memory.
- The grading (`sahih`, `hasan`, `da'if`, or `Qur'an {surah}:{ayah}` for Qur'anic entries) exactly
  as carried in the corpus record.
- Who graded it, where the corpus record has that field (e.g. al-Albani in the Hisn al-Muslim
  takhrij), otherwise the collection's own grading convention.
- For anything not `sahih` or `hasan`: an explicit plain-English caution that the chain is weak
  and the dua is presented for completeness.

**Hard rule: no invented references, no invented gradings, no invented fadā'il.** If a corpus
field is null, the note says the grading is not recorded in our source rather than filling it in.
A fabricated hadith reference on an Islamic content site is a trust failure that no ranking gain
offsets, and it is the one error type that will get the site cited by other scholars' sites.

---

## 3. Block B — at least one per indexed page

Pick whichever genuinely fits the dua. Do not add all five to every page; a page with five
half-hearted blocks reads worse than a page with one good one. Own translation is deliberately
**not** on this list — it is not a differentiator (§0).

| Option | Minimum bar to count | Best fit |
|---|---|---|
| **B1. Audio recitation** | Real recorded audio of this specific dua, with reciter credited. Not TTS. | Duas people memorize: morning/evening, sleep, salah |
| **B2. Word-by-word breakdown** | Every Arabic word with transliteration + gloss, in a table. Partial glosses don't count. | Short, high-volume duas; the 50 famous named duas |
| **B3. Common-mistake note** | A specific, named error — wrong wording, wrong time, wrong count, a widely circulated but unsourced variant — with the correction. Generic "recite with sincerity" fails. | Duas with popular incorrect versions in circulation |
| **B4. FAQ block** | 3–6 questions, each answered in 40–80 words, ones people actually type. Source: `secondary_keywords` in the dua's chapter row of `chapter_keywords_v2.csv`, or the `secondary_keywords` column of `famous_named_duas_v2.csv` for the top 50. **64 chapters covering 371 duas have this column deliberately empty** (`keyword_rule = derive_per_entry_from_translation`) — for those, derive questions from the dua's own English text and occasion angle, or pick a different Block B option. Never invent keyword volume. | Pages with a populated secondary_keywords row |
| **B5. Sourced fadā'il** | The stated virtue, quoted, with collection + number + grading. Unsourced virtue claims are a hard fail, not a weak pass. | Duas with authentic narrated virtues |

### B4 markup caveat

Ship the FAQ **content**. Skip `FAQPage` structured data. Since August 2023 Google shows FAQ rich
results "only for well-known, authoritative government and health websites"
(https://developers.google.com/search/blog/2023/08/howto-faq-changes), so the markup earns us no
SERP feature. Google also states unused structured data causes no problems, so this is a
don't-bother rather than a hazard — the only real downside is maintaining markup that must stay in
sync with visible content for no return. Plain semantic HTML (`<h3>` question, `<p>` answer) gives
the same user and crawler benefit with nothing to maintain.

---

## 4. Voice and writing rules

- Second person, present tense, direct. "Recite this after you wake" — not "It is recommended that
  one should recite."
- Say ﷺ as the honorific after the Prophet's name, consistently, once per mention.
- Arabic terms: transliterate, then gloss on first use per page (`fadā'il` (virtues)). Don't
  re-gloss in the same page.
- No superlatives about the dua's power ("most powerful", "miraculous", "guaranteed"). State what
  the narration states and stop.
- No promises of worldly outcomes not in the narration. This is both an integrity rule and a
  YMYL-adjacent risk: unsourced spiritual-outcome claims are exactly what a quality rater
  penalizes.
- **Banned openers** (each is a templating tell, and the validator rejects them):
  `This dua is`, `This powerful`, `One of the most`, `In Islam,`, `Muslims believe`,
  `{dua name} is a`, `Are you looking for`, `In this article`.
- **Banned filler phrases:** `it is important to note`, `plays a vital role`, `serves as a
  reminder`, `rich tapestry`, `delve into`, `in today's fast-paced world`.

---

## 5. Occasion angle library

The 20 occasion groups are the reason 505 pages can avoid sounding identical: each occasion has a
different natural question behind it. Block A's context paragraph should lean into the angle for
its occasion rather than reaching for a generic frame. Counts are corpus sizes — the large groups
are where templating pressure is highest and this matters most.

| Occasion (count) | Angle for the context paragraph |
|---|---|
| protection (109) | Protection *from what*, specifically, and the boundary of the claim |
| general (99) | Why this one belongs in daily rotation vs. the alternatives — hardest group, most likely to go generic |
| prayer (60) | Exact position in the salah sequence; what precedes and follows |
| forgiveness (41) | The state of the person reciting; what makes istighfār accepted per the narration |
| morning-evening (26) | Precise time window; repetition count; what happens if missed |
| sleep-waking (20) | Order within the bedtime routine; whether it's before or after lying down |
| distress (20) | The specific kind of distress named in the narration — grief, debt, fear, illness are not interchangeable |
| funeral-illness (20) | Who says it, to whom, and at which point — the etiquette is the content |
| travel (19) | Stage of journey: mounting, departing, arriving, returning |
| family-children (17) | Who recites over whom; age applicability |
| praise-dhikr (16) | Counting method, tasbīh practice, stated reward per repetition |
| weather-nature (12) | Trigger event and the narrow window it applies in |
| social (11) | The social situation and what's being repaired or acknowledged |
| home-clothing (10) | Threshold moments — entering, leaving, wearing new |
| food-drink (8) | Before/after distinction; what to do if forgotten mid-meal |
| guidance (5) | The decision being made; relationship to istikhāra |
| hajj-umrah (5) | Exact ritual step and location |
| fasting (4) | Suhūr/iftār timing and the disputed wordings |
| quran-recitation (2) | Before/after recitation; adab of handling the text |
| provision (2) | Rizq framing without drifting into prosperity-gospel claims |

---

## 6. Validation — run before any wave ships

Programmatic, on the whole wave, not per page:

1. **Block A present** on every page marked indexable; `noindex` on every page without it.
2. **Word count** of A1 within 80–150.
3. **Banned-phrase scan** across §4 lists → zero hits.
4. **Cross-page 12-gram overlap** on **A1 text only** across the entire library. Any 12-word
   sequence appearing on 3+ pages is a templating leak — rewrite. This is the single most useful
   check in this spec; run it library-wide every wave, not just within the wave.
   **Exclude A2 from this check.** Authentication notes legitimately repeat formulae ("narrated by
   Abu Hurayrah, may Allah be pleased with him", "graded sahih by al-Albani") and scoping the
   check to A1 avoids ~90% of the false positives that would otherwise make it unusable.
5. **Specificity check:** each A1 contains at least one digit, proper noun, or time expression.
6. **Authentication completeness:** collection ref and grading non-null and drawn from corpus
   fields; flag any grading string that does not appear in the source record.
7. **Block B count** ≥1, and the chosen block meets its minimum bar in §3 (spot-check 10% by hand).
8. **No `FAQPage` schema** anywhere in the wave (no benefit; see §3). Ship `WebPage` +
   `BreadcrumbList`. Pick one and hold it library-wide — do not mix `Article` on some pages and
   `WebPage` on others. Never emit `CreationalWork`; that type does not exist in schema.org and
   was a typo in the v1 strategy doc.
9. **Title-tag uniqueness** across the library — carries over from the strategy doc's
   cannibalization rule, since most of the famous 50 sit inside a handful of mega-chapters.

Reviewer sign-off: a named reviewer with stated credentials approves each wave's authentication
notes and any fadā'il claims, and the reviewer's name and credentials appear on the site. For
religious content this is a stronger trust signal than anything else in this spec, and it is
cheap — one person, one page, one review pass per wave.

---

## 7. Definition of done, per page

- [ ] Arabic + transliteration present, from corpus
- [ ] Translation present, with attribution (or marked `translation_license: original` for the top 50)
- [ ] Block A1 context paragraph, 80–150 words, ≥1 checkable specific, approved opener
- [ ] Block A2 authentication note, all fields from corpus, caution added if not sahih/hasan
- [ ] ≥1 Block B option meeting its minimum bar
- [ ] Passes all nine §6 checks
- [ ] Reviewer signed off on A2 and any fadā'il (batched per wave, not per page — see §6)
- [ ] Title tag ≤60 chars and unique library-wide; meta description ≤155
- [ ] Primary keyword sourced correctly: from the chapter row in `chapter_keywords_v2.csv` **only
      where that row's `keyword_rule` is `use_as_is`**. Where `keyword_rule` is
      `derive_per_entry_from_translation` (9 chapters, 300+ duas including all 99 Qur'anic
      supplications), the keyword is derived from this dua's own English text and must never fall
      back to the chapter label — that is what produces 99 pages fighting over one phrase
- [ ] Arabic block wrapped `lang="ar" dir="rtl"`; transliteration is text, never an image
- [ ] Internal links present: occasion hub + source hub + 2–3 related duas
- [ ] For the 6 rows in `famous_named_duas_v2.csv` where `canonical_owner = quran`: `rel=canonical`
      points to the Qur'an Explorer verse page, and the transliterated verse name is not the H1
