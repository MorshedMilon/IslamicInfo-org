# DUA-KEYWORD-NAMING-v1_0.md

**Scope:** Title, H1, slug, and meta description naming for the 506 dua detail pages under `/duas/`.
**Status:** v1.0 — supersedes the conditional brand-drop rule and the truncated-quote disambiguator.
**Applies to:** `src/data/dua/page-copy.json`, the page builder, and the batch review report.

---

## 1. Why this document exists

The first title pass optimised for character count and produced titles that are shorter but
unsearchable and, in places, malformed. Two findings drove the rewrite:

1. **The chapter labels use archival English with no search demand.** "Words of remembrance for
   morning and evening", "Invocation for entering the restroom", "Supplications for when you wake
   up". Every site currently ranking for this content uses *dua*, *duas*, or *adhkar*. Not one uses
   *invocation* or *words of remembrance*.
2. **The label is also the character cost.** "Words of remembrance for morning and evening" is 44
   characters before anything else is added. Fixing the vocabulary shortens the title *and* fixes
   the keyword — the same edit solves both problems, which is why the brand suffix does not need to
   be sacrificed.

**Consequence:** the brand suffix stays on all 506 pages. Inconsistent branding across a corpus is
a worse trade than a slightly long title, and once labels are fixed the room exists anyway.

---

## 2. Title formula

```
{Label}: {Disambiguator} | IslamicInfo.org
{Label} | IslamicInfo.org                     ← when the label is already unique
```

**Budget:** brand suffix = 18 chars. Separator = 2. Leaves 40 for label + disambiguator.
- Label: target ≤ 24 characters, hard cap 28.
- Disambiguator: target ≤ 16 characters.

**Length policy:** target ≤ 60. Hard cap 65. A small tail between 60 and 65 is acceptable and
should NOT be fixed by breaking naming consistency — Google truncates on pixel width (~600px), not
character count, so 60 is a guideline, not a wall. Report anything over 65 for manual review.

**Never in a title tag:**
- `in Arabic, Transliteration & Meaning` — 37 characters of boilerplate. Keep this wording in the
  H1 and meta description, where there is no length pressure. Title and H1 do not need to match.
- A citation: `(Hisn al-Muslim 27, entry 92)` has zero search demand.
- A truncated quote with an ellipsis: `(Say, "He is Allāh, [who is]…)` is malformed — unclosed
  quote, unclosed bracket, broken sentence.

---

## 3. Chapter label rules

Every label must satisfy all four:

| # | Rule |
|---|------|
| L1 | Contains `Dua`, `Duas`, or `Adhkar` |
| L2 | Reads as a phrase a person would type into a search box |
| L3 | ≤ 28 characters |
| L4 | Uses the spelling standard in §6 |

### 3.1 Structural patterns

Match the source label text and rewrite to the target pattern:

| Source pattern | Target pattern | Example |
|---|---|---|
| `Supplications for when you X` | `Dua When X` | Dua When Waking Up |
| `Supplication(s) for X` | `Dua for X` | Dua for Rain |
| `Invocation(s) for X` | `Dua for X` | Dua for Entering the Bathroom |
| `Invocation(s) when X` | `Dua When X` | Dua When Leaving Home |
| `What to say before X` | `Dua Before X` | Dua Before Sleeping |
| `What to say after X` | `Dua After X` | Dua After Salah |
| `What to say when X` | `Dua When X` | Dua When It Rains |
| `Words of remembrance for X` | `X Adhkar` | Morning & Evening Adhkar |
| `Remembrance(s) of/for X` | `X Adhkar` or `Dhikr for X` | Adhkar After Salah |
| `On X` / `Concerning X` | `Dua for X` | Dua for Travel |

Where the rewritten label would exceed 28 characters, shorten the *context*, never drop the
`Dua`/`Adhkar` token. `&` is preferred over `and` in labels for length.

### 3.2 Vocabulary substitution

Mechanical, applies wherever the term appears in a label:

| Replace | With | Note |
|---|---|---|
| Supplication, Supplications | Dua | singular `Dua` outranks `Duas` in almost every context |
| Invocation, Invocations | Dua | `invocation` has effectively no demand in this sense |
| Words of remembrance | Adhkar | |
| Remembrance | Dhikr / Adhkar | `Adhkar` for a set, `Dhikr` for the practice |
| Glorification | Tasbih | |
| Seeking forgiveness | Istighfar | |
| Ablution | Wudu | |
| The prayer, Salat, Prayers | Salah | see §6 on `Namaz` |
| Restroom, Lavatory, Water closet | Bathroom | `toilet` covered in body copy, not the title |
| The pilgrimage | Hajj / Umrah | disambiguate by which |
| Funeral, The deceased | Janazah / Funeral | `Dua for the Deceased` is the searched form |
| Distress, Anguish, Sorrow | Anxiety / Grief / Worry | high-demand emotional terms |
| Affliction, Malady | Sickness / Illness | |
| Provision, Sustenance | Rizq / Provision | `Dua for Rizq` is the searched form |
| One's, Thy, Thine | your / plain English | |

**Do not substitute** where the source term is already the searched term: *Rain*, *Travel*,
*Fasting*, *Marriage*, *Evil Eye*, *Forgiveness*, *Protection*, *Guidance*, *Parents*, *Children*.

---

## 4. Confirmed label mappings

Verified against the batch 1–2 report. These are approved and may be applied directly.

| Source chapter | Old label (chars) | New label (chars) |
|---|---|---|
| Hisn al-Muslim 1 | Supplications for when you wake up (34) | Dua When Waking Up (18) |
| Hisn al-Muslim 6 | Invocation for entering the restroom (36) | Dua for Entering the Bathroom (29)* |
| Hisn al-Muslim 25 | What to say after completing the prayer (39) | Dua After Salah (15) |
| Hisn al-Muslim 27 | Words of remembrance for morning and evening (44) | Morning & Evening Adhkar (24) |
| Hisn al-Muslim 28 | What to say before sleeping (27) | Dua Before Sleeping (19) |
| Hisn al-Muslim 104 | Invocation for a layover, stopping along the way on the journey (63) | Dua for Stopping on a Journey (29)* |

\* Exceeds the 28-char target by 1. Accepted — shortening further ("Dua for the Bathroom") loses
the searched phrasing. These two are the exceptions, not a licence to relax the cap.

**The remaining 126 labels have not been reviewed.** They must be dumped, run through §3, and
approved as a diff before any build. See §11, Phase 1.

---

## 5. Disambiguator rules

Roughly 374 of 506 pages share a chapter label with a sibling and need a disambiguator. Priority
order, strictly:

**(a) Curated common name — `common_name` field**

A new field on the dua record. Populated only from a hand-approved allowlist. **Claude Code must
not generate these.** It may propose candidates; each requires Milan's verification before use.
This is source-attribution territory, and a wrong name on a dua page is a trust failure, not a
typo.

Confirmed candidates from batches 1–2:

| Page | `common_name` |
|---|---|
| `hisn-28-100` | Ayatul Kursi |
| `hisn-27-75` | Ayatul Kursi |
| `hisn-25-71` | Ayatul Kursi |
| `hisn-27-76` | Surah Al-Ikhlas |
| `hisn-27-79` | Sayyidul Istighfar |
| `hisn-28-101` | Last Two Verses of Al-Baqarah |
| `hisn-28-106` | Tasbih Fatimah |
| `hisn-28-105` | Bismika Allahumma Amutu wa Ahya |
| `hisn-27-88` | Ya Hayyu Ya Qayyum |
| `hisn-27-83` | Hasbiyallahu La Ilaha Illa Huwa |

Names over 16 characters (`Last Two Verses of Al-Baqarah`, 29) will push the title past 60. Accept
up to 65, or use a short form (`Last Two Ayahs of Al-Baqarah`) — do not truncate mid-phrase.

**(b) Transliterated opening words — automatic fallback**

Where `common_name` is null: the first 2–4 words of the existing transliteration field, taken
whole. Never mid-word. Never an ellipsis. Title Case.

```
Dua Before Sleeping: Bismika Rabbi Wada'tu | IslamicInfo.org
Morning & Evening Adhkar: Allahumma Bika Asbahna | IslamicInfo.org
```

This works because people remember duas by sound, not by chapter number — the transliteration is
itself a searched string.

**(c) Nothing else.** No citations, no entry numbers, no truncated English quotes. If (a) and (b)
both fail, flag the page for manual naming rather than emitting a placeholder.

---

## 6. Spelling & transliteration standard

Lock these. Inconsistency across 506 pages is worse than any individual choice.

| Use in titles/H1 | Also cover in body/FAQ | Do not use |
|---|---|---|
| Dua | duaa, du'a, dua'a | supplication (as primary) |
| Adhkar | azkar, athkar, azkaar | — |
| Dhikr | zikr | — |
| Ayatul Kursi | Ayat al-Kursi, Ayatul Kursy | — |
| Salah | salat, namaz | — |
| Wudu | wudhu, ablution | — |
| Istighfar | astaghfirullah | — |

**On `Namaz`:** it carries real volume in South Asian English and a meaningful share of your
audience uses it. Keep `Salah` in titles for consistency, and ensure `namaz` appears naturally in
the body copy or an FAQ heading on relevant pages so those queries still match.

**Two to verify before locking** (the only cases where the variant choice materially affects
volume): `Ayatul Kursi` vs `Ayat al-Kursi`, and `Sayyidul Istighfar` vs `Sayyid al-Istighfar`.
Both spellings appear on currently-ranking pages. Check in Keyword Planner and record the decision
in the ADR log.

---

## 7. Slug rules

**Slugs change in the same pass as labels.** All 506 pages are `noindex,follow` and excluded from
`sitemap.xml`, so no URL has ever been indexed. There is nothing to redirect and no equity to
preserve. Doing labels now and slugs later would create a redirect migration for no reason.

```
/duas/{label-slug}-{disambiguator-slug}
```

| Rule | Detail |
|---|---|
| S1 | Lowercase, hyphen-separated, ASCII only |
| S2 | **Truncate at word boundaries only.** Current bug: `...on-the-way-on-the-journ-hisn-104-216` cuts mid-word. Audit all 506. |
| S3 | Drop the `hisn-NN-NNN` suffix. It is dead weight and no user or search engine benefits from it. |
| S4 | On collision, append `-2`, `-3`. Never a chapter reference. |
| S5 | Max 60 characters |
| S6 | **Freeze on approval.** Once a slug is approved, write it into `page-copy.json` as a literal `slug` field and never regenerate it. If the generator recomputes slugs from labels, a future label tweak silently breaks every URL. |

```
Before:  /duas/words-of-remembrance-for-morning-and-evening-hisn-27-75
After:   /duas/morning-evening-adhkar-ayatul-kursi

Before:  /duas/what-to-say-before-sleeping-hisn-28-106
After:   /duas/dua-before-sleeping-tasbih-fatimah
```

Note the `/duas/` path already carries the keyword, so `dua-` in the slug is mildly redundant.
Keeping it is still preferred: it groups siblings alphabetically in the file tree and in any
crawl export, which matters more at 506 pages than one duplicated token.

---

## 8. Meta description rules

| # | Rule |
|---|------|
| D1 | 140–155 characters. Current corpus has ~10 of 40 over 160, up to 226. |
| D2 | **No ellipsis inside the sentence.** Current bug: `"...meaning of Words of remembrance for morning and…, a dua for..."` — the template truncates the label mid-sentence. Use the full new label, which now fits. |
| D3 | Must vary between siblings. All 20 batch-1 descriptions are currently near-identical. Use `common_name` or the transliterated opening to differentiate. |
| D4 | Include: the label, the word `dua`, the disambiguator, and the source reference. |
| D5 | Citations live here, not in the title. |

```
Ayatul Kursi as part of the morning and evening adhkar — Arabic,
transliteration and English meaning, with repetitions. Source: Hisn
al-Muslim 27.
```

---

## 9. H1 rules

| # | Rule |
|---|------|
| H1a | Must be a complete phrase. No truncated quotes, no trailing ellipsis. Current H1s like `Words of remembrance for morning and evening — "Allāh - there is no deity except Him, the…"` are broken. |
| H1b | No length cap — this is where `in Arabic, Transliteration & Meaning` belongs. |
| H1c | Format: `{New Label}: {Disambiguator} in Arabic, Transliteration & Meaning` |
| H1d | May differ from the title tag. This is intentional and correct. |

---

## 10. Prohibited patterns

These have real search volume and must still be avoided. They conflict with the no-fatwa and
no-urgency conventions in `CLAUDE.md`, and on religious content they read as bait:

- `Powerful dua for X`, `Miracle dua`, `Dua that works instantly`, `Guaranteed dua`
- `Wazifa for X` — high volume, but associated with folk practice the site does not endorse
- Outcome promises: `Dua to get rich`, `Dua to make someone love you`
- Urgency framing: `Read this before it's too late`, `Must-read dua`
- Any phrasing that implies a ruling or a guaranteed result

The site's differentiator is verifiable sourcing. Ranking a page by promising an outcome
undermines the one thing that makes it worth ranking.

---

## 11. Execution sequence

Slugs, labels, and the review report all move together. Do not start Phase 3 before Phase 2 is
approved.

### Phase 0 — Freeze (no action)
Confirm all 506 remain `noindex,follow` and absent from `sitemap.xml`. Nothing ships until Phase 5.

### Phase 1 — Gather (read-only, no writes)

```
Read-only task. Do not modify any file. Produce three artifacts:

1. doc/CHAPTER-LABELS-AUDIT.md — all 132 chapter labels with: source chapter ref,
   current label, character count, page count in that chapter, and a proposed
   new label per DUA-KEYWORD-NAMING-v1_0.md §3. Flag any where the rules give
   an ambiguous or >28-char result.

2. doc/DUPLICATE-CLUSTERS.md — hash the translation text across all 506 pages.
   List every cluster of 2+ pages sharing identical or near-identical
   translation, with members and their chapter refs. I know of three already:
   Ayatul Kursi at hisn-27-75 / hisn-28-100 / hisn-25-71, and the identical
   pair hisn-27-92 / hisn-27-93.

3. doc/COMMON-NAME-CANDIDATES.md — pages you believe have a well-known name
   (Ayatul Kursi, Sayyidul Istighfar, Tasbih Fatimah, the Three Quls, etc.).
   Propose only; leave common_name null in the data. I verify each one.
   Where you are not confident, say so rather than guessing.

Also confirm whether Hisn al-Muslim 28 entry 110 is intentionally absent —
the sequence runs 109 → 111.
```

### Phase 2 — Decide (Milan)
Approve the 132-label diff. Verify the `common_name` candidates. Make the architecture call in §12
before anything is written.

### Phase 3 — Apply

```
Apply DUA-KEYWORD-NAMING-v1_0.md across all 506 pages in one pass:
labels (§3–4), disambiguators (§5), spelling (§6), slugs (§7), meta
descriptions (§8), H1s (§9). Freeze slugs into page-copy.json per S6.

Fix the three bugs:
  B1 slug truncation mid-word (§7 S2)
  B2 ellipsis inside meta descriptions + descriptions over 160 (§8 D1, D2)
  B3 missing Hisn 28 entry 110

Revert the conditional brand-drop rule — "| IslamicInfo.org" on all 506.

Log every decision in the DECISION/ADR log before writing.
```

### Phase 4 — Re-report

```
Rebuild the batch review report with four new columns:
  - contains Dua/Duas/Adhkar (y/n)
  - disambiguator type (common_name / transliteration / none)
  - duplicate cluster ID (blank if unique)
  - slug changed (y/n)

Include the under-60 / 60-65 / over-65 / median / max table for the new
format, and a uniqueness check on titles, slugs, and meta descriptions.
Verify in Chrome as before: rows render, filters return, no JS errors.
```

### Phase 5 — Approve and ship
Batch by batch. Flip `approved: true`, remove `noindex`, add to `sitemap.xml`.

---

## 12. Open item — corpus architecture

**This is the decision that outranks everything in this document, and it is Milan's alone.**

Twenty pages currently exist for Hisn al-Muslim chapter 27, one per entry, each a single line of
Arabic with a translation. The pages that currently rank for this content are single comprehensive
ones — complete collections with Arabic, transliteration, translation, repetitions and sources on
one URL. Twenty fragments will lose to one strong page, and the duplicate clusters in §11 Phase 1
will compound the problem.

**Recommended structure — hub and spoke:**

- **Hub:** one indexed page per chapter (`/duas/morning-evening-adhkar`) carrying all entries with
  anchor links. This is the page that competes.
- **Spokes:** individual pages indexed *only* where the dua has standalone demand — Ayatul Kursi,
  Sayyidul Istighfar, Tasbih Fatimah, the Three Quls, Ayat 2:285–286. Perhaps 40–60 of 506.
- **Remainder:** kept as anchors on the hub, or published as spokes with `noindex,follow` so they
  exist for direct linking without competing with their own hub.
- **Duplicate clusters:** one canonical page per unique dua (`/duas/ayatul-kursi`), with the
  context chapters linking to it rather than restating it. Ayatul Kursi is one page referenced by
  three chapters, not three pages.

Deciding this *before* Phase 3 avoids naming 506 pages under an architecture you then change.

---

## 13. Verification checklist

Before any batch is approved:

- [ ] Every title contains `Dua`, `Duas`, or `Adhkar`
- [ ] No title contains `Invocation`, `Supplication`, or `Words of remembrance`
- [ ] No title contains a citation, entry number, or ellipsis
- [ ] `| IslamicInfo.org` present on 506/506
- [ ] Titles 506/506 unique; slugs 506/506 unique; descriptions 506/506 unique
- [ ] Titles ≤ 60 target; anything 60–65 accepted; anything > 65 flagged
- [ ] Descriptions 140–155, no internal ellipsis
- [ ] No slug truncated mid-word; no slug contains `hisn-`
- [ ] Slugs frozen as literal fields in `page-copy.json`
- [ ] No H1 ends in a truncated quote
- [ ] No prohibited pattern from §10
- [ ] Every `common_name` verified by Milan, not generated
- [ ] Duplicate clusters resolved per the §12 decision
- [ ] Decisions logged in the ADR log

---

## 14. Confidence note

The vocabulary recommendations are grounded in the terminology used by pages currently ranking for
this content, not in volume data. Before applying 132 label rewrites, confirm the four highest-
frequency substitutions in Google Keyword Planner (free with an Ads account):

- `dua` vs `supplication`
- `adhkar` vs `azkar` vs `words of remembrance`
- `dua before sleeping` vs `what to say before sleeping`
- `Ayatul Kursi` vs `Ayat al-Kursi`

Ten minutes of verification on a decision touching 506 pages. Record the results in the ADR log so
the choice is auditable later.
