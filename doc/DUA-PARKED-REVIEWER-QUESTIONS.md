# Parked — reviewer and owner questions on held dua records

**Filed 2026-08-02. Parked deliberately: none of these blocks any other work.**
They affect ~34 held records, plus the 154 Class B records parked at item 7. Nothing waits on them; they are recorded so they
are not rediscovered, and so the held records have a route back in when answered.

Governing: `DUA-CONTENT-INTEGRITY-v1_0.md`, `doc/DUA-INTEGRITY-SCAN.md`, ADR-044
(owner is the sole content approver).

---

## 1. Annotation class — needs an OWNER ruling, not a fix

`DUA-INTEGRITY-SCAN.md` §Contamination states this explicitly: *"This needs an owner
ruling, not a fix."* Five records carry an English recitation annotation inside the
transliteration field — `(three times)`, `(7times)`, `(ten times after the maghrib
and fajr prayers)`.

| id | annotation in `transliteration` |
|---|---|
| `17:33` | `(Subhana rabbiyal-AAatheem (three times))` |
| `19:41` | `(Subhana rabbiyal-aAAla. (three times)))` |
| `25:72` | `(… (ten times after the maghrib and fajr prayers))` |
| `27:80` | `(Note: …)` |
| `49:148` | `(Asalul-lahal-AAatheem … an yashfeek (7times).)` |

**The question:** is a recitation count inside the transliteration field acceptable as
the source compilation's own convention, or is it contamination to be stripped?

The scan is explicit that this is *not* the same class as the 39 nulled
transliterations — those held translation prose. These hold a genuine repetition
count that the compilation states. `49:148` was dropped from Wave 1a partly on this
ground; the other four were held for consistency.

---

## 2. Translator glosses bled into the translation field — reviewer

21 records carry an explanatory gloss appended to, or embedded in, the translation.
The gloss is the compilation's footnote, not words to recite. A page rendering the
field whole presents the footnote as part of the supplication.

Worst cases:

| id | gloss |
|---|---|
| `24:55` | `(Al-Maseeh Ad-Dajjal: …)` — ~124 words of eschatological explanation |
| `32:116` | appended paren group, 129 words |
| `16:29` | appended paren group, 126 words |
| `24:63`, `24:65` | `(AS-Samad: The Self-Sufficient Master …)` |
| `25:66` | `(AS-Salam: The One Who is free from all defects …)` |
| `4:7`, `4:8` | term-definition glosses (`shaheed:`, `The intended meaning:`) |
| `54:155`, `69:179` | instruction/rubric inside the translation |

Full list of 21 in the scan output; detector is
`translation-field contamination` in this session's audit.

**The question:** should the gloss be (a) stripped from the translation and dropped,
(b) stripped and re-presented as a labelled footnote on the page, or (c) left in
place? Only (b) needs new template work.

---

## 3. `9:15` / `85:196` — one citation, two occasions

Both records carry the **byte-identical** `hadithCitation`:

```
Riyad as-Salihin 152 (Abu Hurairah (May Allah be pleased with him) reported:)
```

Their Arabic is the same text — *Subhanaka-llahumma wa bihamdika…* — but they are
filed under different occasions: **expiation of an assembly** (`85:196`) and **upon
completing ablution** (`9:15`).

**The question:** which occasion does Riyad as-Salihin 152 actually attest, and what
is the correct reference for the other record?

At most one can be right. `85:196` was dropped from Wave 1a on this ground and `9:15`
was held from authoring for the same reason. This is also the reason the pair sits in
`duplicate-scripture-allowlist.json` under `pendingAdjudication` rather than
`allowed` — R6 cannot clear it until the citation is resolved.

---

## 4. Individually held records

| id | why | who clears it |
|---|---|---|
| `46:144` | translation carries `(for verily 'If' lets in the work of the devil.)` — the narration's reasoning, not recited words | reviewer |
| `37:130` | translation carries `(Recite three times in Arabic)` and a `[name of the person]` placeholder | owner — needs a presentation decision |
| `8:12`, `5:9`, `99:210` | all three are the 5-word translation *"In the name of Allah."* | owner — three near-identical pages is a thin-content and R6 cannibalisation risk |
| `122:240`, `122:241` | *"Glory be to Allah"* / *"Allah is the Greatest"*, 4 words each | escape-hatch per spec A1; `noindex` + honest note, never padded |

---

## 5. Block B2 (word-by-word breakdown) — PARKED, needs data acquisition

**Owner decision 2026-08-02: not this week.** Parked for the same reason as the Itqan
narrator map — it is a data-acquisition task, not a build task, and blocks nothing.

Why it cannot be built on current data:

| Finding | Figure |
|---|---|
| Authored records that are Qur'anic | **0** of 113 (79 Hisn, 33 dua-dhikr, 5 other) |
| Coverage from quran.com word-by-word (the verified WBW source already integrated) | **none** — it serves Qur'anic text only |
| Lexicon in repo (`src/data/vocab/terms.json`) | **16 entries**, a concept glossary (*taqwa*, *sabr*), not a dictionary |
| Distinct Arabic word-forms needing a gloss | **922** across 2,380 tokens |

Two blockers, the second worse than the first: there is no lexicon to draw glosses
from, and even with one (Lane's Lexicon is public domain) mapping an inflected form
such as `أَعُوذُ` to its lemma needs morphological analysis. A wrong gloss is a wrong
claim about the meaning of a supplication. `DUA-PAGE-CONTENT-SPEC.md` §3 is explicit
that *"partial glosses don't count"*, so a half-covered table does not satisfy B2
either.

**To unblock:** source and approve a licensed Arabic lexicon plus a morphological
analyser, the same shape of work as ADR-045/046 for Itqan.

**Shipped instead:** B4 (FAQ block), which §3 sources from `secondary_keywords` in
`chapter_keywords_v2.csv` (73 of the 113) and from the dua's own English for the
remaining 44 — no invented content.

---

## 6. What is NOT parked

These remain live and are not part of this file:

- **Block B** — still unbuilt, and it blocks §7 definition-of-done for all 117
  authored pages including the 20 indexed.
- **The corrected `DUA-PAGE-CONTENT-SPEC.md`** — the attachment never arrived; §5
  check 6 still contradicts §2 A2 on grading.
- **The four R6 duplicate clusters** — they go live the moment batches 4–7 index.

---

## 7. Wave 2 Class B clause extraction (all 154) — PARKED, needs source data

**Owner decision 2026-08-03: parked, same status as B1/B2.** A real future item, not
blocked on a ruling — blocked on **missing source data with no clean fix visible today.**
Attempted as Wave 2 batch 1 (20 records, routed as Part 7 of the reviewer package) and
stopped there. Recorded with its evidence so nobody re-opens it without seeing why it
stopped.

### Why it stopped — two independent blockers

**1. Transliteration: 0 of 154.** Not a shortfall, zero. Gate 2 requires a
transliteration that is sourced, provenance-named, and covers the whole of the Arabic a
page renders. A clause extraction needs a transliteration **of the clause**, and unlike
the Qur'anic set there is **no word-aligned source to assemble one from** — quran.com's
word-by-word data serves Qur'anic text only, which is the same wall Block B2 hit. No
ruling on any clause boundary can clear this.

**2. The extractor is not reliable enough to accept unread.** Across the 154:
**122 medium confidence, 32 low.** In batch 1, all three low-confidence proposals were
checked against their own record's translation and **all three were wrong**:

| id | proposed span | what is wrong |
|---|---|---|
| `abudawud:1481` | *"There will be people who transgress in supplication"* | **Not a supplication** — the narration's warning *about* dua. The record's own translation (*"O Allah, I ask Thee for Paradise…"*) does not appear in the span at all. |
| `abudawud:1496` | *"He has supplicated Allah by His greatest name…"* | The Prophet's **comment on** the supplication, not the supplication. |
| `abudawud:1552` | opens with `قُلِ` — *"Say:"* | An **instruction verb inside the recitable text**. Published as-is a reader would recite the instruction. Same defect class as the Ibn Majah 3590 inversion, which `DUA-CONTENT-INTEGRITY-v1_0.md` §1.2 calls the most urgent single page in the corpus. |

Every medium-confidence proposal in that batch matched its translation and every
low-confidence one did not, so confidence separated cleanly on 20 rows — but that is far
too small a sample to treat `low` as a filter, and it is **not** grounds to accept
`medium` unread. 32 rows sit in the class that was 3-for-3 wrong.

### What it is NOT blocked on

Not on a clause-boundary ruling, and not on R3a. R3a was amended on 2026-08-03 so
verification is internal-only (owner sign-off recorded in the reviewer package, no name
in rendered HTML), which removed the collision with the public-credit-deferred decision.
That collision is resolved; this is not waiting on it.

### To unblock

Source a transliteration for Class B narrations — either a published romanised edition of
the six collections, or a per-record reviewer-supplied transliteration of the confirmed
clause (Part 3 territory, and 154 records is far larger than Part 3's current 75). Until
one exists, confirming clause boundaries produces pages that still cannot publish, so the
boundary work is deliberately **not** being done in advance.

**Not parked:** the Qur'anic clause set. It has a word-aligned transliteration source, all
20 of batch 2 aligned exactly, and 15 of 20 already store the clause with the frame
stripped. That set continues as Part 8.

---
