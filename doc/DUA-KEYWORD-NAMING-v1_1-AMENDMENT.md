# DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md

**Status:** Amends `DUA-KEYWORD-NAMING-v1_0.md`. Read both. Where they conflict, this wins.
**Trigger:** Phase 1 audit findings, 2026-07-31.
**Supersedes:** v1.0 §3 (scope), §4 (scope), §5 (ladder), §7 S3/S4, §11 (phasing), §12 (architecture).
**Unchanged and still in force:** v1.0 §2, §6 (as extended), §8, §9, §10, §13, §14.

---

## A0. What the audit changed

v1.0 assumed all 132 chapter labels describe an **occasion** ("before sleeping", "when waking up"),
which is true of the Hisn al-Muslim chapters and false of the rest. Eight labels are **collection
book names** covering 259 pages — 51.2% of the corpus. A book name labels a position in a
manuscript, not a situation a person is in. No amount of vocabulary substitution turns "Chapters on
Supplication (Kitab al-Da'awat)" into something a person searches for, and forcing it into
`Dua for X` would either invent a topic the source doesn't state or give 99 unrelated pages one
generic name.

Claude Code was correct to refuse to propose labels for those eight. The fix is structural, not
lexical, and it is set out in A2 and A10.

---

## A1. The transliteration gap — highest priority, precedes everything

**307 of 506 pages have no transliteration.** This surfaced as a naming obstacle. It is not one.
It is a content integrity problem that happens to also block naming.

Every page currently carries an H1 and meta description promising *Arabic, Transliteration &
Meaning*. On 61% of the corpus, the transliteration does not exist. Shipping that is a
promise-and-fail pattern: it damages the one asset this site is being built to have, which is
being the source people trust for accurate, verifiable text.

**Ruling:**

- No page ships without transliteration. This is a hard gate, above every SEO consideration in
  either document.
- Filling the gap is Phase 1.5 (A11) and blocks Phase 3.
- Transliteration must be **sourced or reviewed, never machine-generated and shipped unread.**
  Automated Arabic romanisation is inconsistent on exactly the letters that matter here — the
  emphatics, the hamza, the taa marbuta. A wrong transliteration on a dua page is a trust failure
  of a different order than a bad title.
- Where transliteration cannot be sourced for a page, that page does not ship. It stays
  `noindex` and out of the sitemap indefinitely. A smaller correct corpus beats a larger
  half-delivered one.

Once this gate is met, v1.0 §5(b) covers the 419 pages that need a disambiguator, and finding 2
resolves without a new mechanism.

---

## A2. Two-track model — supersedes v1.0 §3 and §4 scope

The corpus splits. Apply different rules to each track.

| | Track A — occasion chapters | Track B — book-name chapters |
|---|---|---|
| Labels | ~124 | 8 |
| Pages | ~247 | 259 |
| Label describes | a situation | a position in a collection |
| v1.0 §3 rules | apply as written | **do not apply** |
| Title anchor | the label | the dua itself |

**Track A** proceeds under v1.0 §3–§4 unchanged, with the additions in A6–A8.

**Track B** discards the chapter label as a title element entirely. The label survives only as
source metadata displayed on the page and in the meta description. See A3.

---

## A3. Track B naming — the formula inverts

For the 259 pages under book-name labels, the dua leads and the topic follows:

```
{Dua name or incipit}: {Topic} | IslamicInfo.org
```

```
Rabbana Atina Fid Dunya: Dua for Good in Both Worlds | IslamicInfo.org
Rabbi Zidni Ilma: Dua for Knowledge | IslamicInfo.org
```

**Where the topic comes from.** It is derived from the dua's own content, which is an editorial
act, not a mechanical rewrite. Claude Code may propose; Milan approves. This is tractable because
the pages are genuinely topically distinct — the audit itself notes Kitab al-Da'awat holds 53 duas
on 53 subjects.

**The 99 Qur'anic pages are the easier half.** They are not an undifferentiated bucket — most are
individually searched by their transliterated opening, and collectively they are the *Rabbana
duas*, a category with its own established demand. The surah:ayah reference gives every one of
them a stable, meaningful handle. Treat this bucket as:

- Hub: `Duas from the Qur'an` / `Rabbana Duas`
- Spokes: named by transliterated incipit, disambiguated by surah:ayah

**Do not** create a hub called "Chapters on Supplication" or "Qur'anic supplications". Those are
bibliographic descriptions. Nobody searches them.

---

## A4. Revised disambiguator ladder — supersedes v1.0 §5

v1.0's ladder dropped 284 pages into manual naming, which is not a workable instruction at that
volume. Revised, and applied **after** the A1 transliteration gate is met:

| Rung | Source | Notes |
|---|---|---|
| (a) | `common_name`, curated | Unchanged from v1.0. Milan verifies each. Never generated. |
| (b) | Transliterated opening, 2–4 words | Whole words, Title Case, no ellipsis. Now covers the corpus because A1 fills the gap. |
| (c) | **English opening phrase, 3–5 whole words** | **New rung.** Permitted where (a) and (b) fail. |
| (d) | Source reference | Permitted **in slugs only**, never in titles. See A5. |
| (e) | Manual flag | Genuine last resort. Should be a handful, not 284. |

**On rung (c).** v1.0 §5 banned "truncated English quotes". That ban was aimed at the malformed
output in the first pass — `(Say, "He is Allāh, [who is]…)` with an unclosed quote, an unclosed
bracket, and an ellipsis. A clean phrase taken at a word boundary is a different artefact and is
acceptable:

```
✗  What to say before sleeping (O Allah, verily You have…)
✓  Dua Before Sleeping: O Allah You Created My Soul | IslamicInfo.org
```

Rules for (c): whole words only, no ellipsis, no unbalanced quotes or brackets, no mid-clause cut,
Title Case, ≤ 30 characters.

**The 20 entries holding English narration prose** are not supplications and are handled under A8,
not here.

---

## A5. Revised slug rules — supersedes v1.0 §7 S3 and S4

Claude Code is right that dropping every reference removes the only uniqueness guarantee and that
`-99` numeric runs are worse than what exists today. v1.0 S3 was over-corrected.

**S3 (revised).** Drop *meaningless* references. Retain *meaningful* ones where they are the only
uniqueness source. A reference that identifies the text is useful in a URL even though it is
useless in a title — slugs are addresses, titles are advertisements, and the two have different
jobs.

**S4 (revised).** Numeric collision suffixes (`-2`, `-3`, `-99`) are **prohibited**. If a slug
would collide, resolve it with a meaningful reference instead.

Resolution order for slugs:

```
1. /duas/{label}-{common_name}              morning-evening-adhkar-ayatul-kursi
2. /duas/{label}-{transliterated-incipit}   dua-before-sleeping-bismika-rabbi-wadatu
3. /duas/{incipit}-{surah}-{ayah}           rabbana-atina-fid-dunya-2-201
4. /duas/{label}-{collection}-{number}      dua-for-forgiveness-bukhari-6306
```

Rungs 3 and 4 are meaningful, stable, unique, and readable. They are the correct answer for the
Qur'an bucket, not a numeric run.

S1, S2, S5, S6 from v1.0 stand unchanged. Fix the nine mid-word truncations (11 pages).

---

## A6. Spelling — extends v1.0 §6

Two gaps, resolved on the principle already established there: **scholarly standard in the title,
regional variant covered in body copy.** This is the same call made for Salah/Namaz.

| Use in titles/H1 | Cover in body, H2, or FAQ | Rationale |
|---|---|---|
| **Adhan** | athan, azan | Matches the Salah/Wudu standard. `azan` carries real volume in South Asian English and must appear in body copy. |
| **Salawat** | durood, durood sharif, darood | Same principle. `Durood` has substantial South Asian demand — it must appear on the page, in an H2 or FAQ, not in the title. |

Add both rows to v1.0 §6. Add `adhan` and `salawat` to the §14 verification list.

---

## A7. Label collisions — resolutions

Four collisions, three resolvable from the audit's own parentheticals:

| Chapters | Resolution |
|---|---|
| ch3 / ch4 | `Dua When Wearing New Clothes` / `Dua for Someone in New Clothes` |
| ch51 / ch52 | `Dua for the Terminally Ill` / `Dua at the Time of Death` |
| ch96 / ch101 | `Dua for Travel` / `Dua for Someone Travelling` |
| ch45 / ch128 | **Unresolved.** Both render "against the devil". Send me the source text of each. My provisional read is that one concerns seeking refuge from Shaytan generally and the other concerns waswasa specifically, which would give `Dua for Protection from Shaytan` and `Dua for Waswasa` — but I am not naming two pages on an inference. |

---

## A8. Non-dua chapters — L1 exemption

Seven chapters are not supplications. v1.0 §3 rule L1 requires every label to contain
`Dua`/`Duas`/`Adhkar`, which cannot be honestly satisfied for a takbir, a greeting, or an etiquette
chapter.

**L1 is exempted where the entry is not a supplication.** A label must never claim the page
contains a dua when it does not. This is not a concession — it is the site's differentiator
operating as intended. Honest labelling outranks keyword compliance every time.

| Entry type | Treatment |
|---|---|
| Dhikr formulas (takbir, tasbih, tahlil) | Label with the correct term: `Takbir at the Black Stone`. These have their own search demand. |
| Greetings, etiquette, conduct | **These do not belong under `/duas/`.** Re-home them to an appropriate section, or hold them `noindex`. A page about spreading salam is not a dua page and should not compete in that index. |
| The 20 English-narration entries | Same as above. Guidance narrations describing a practice are not supplication pages. Route them out of the dua corpus. |

This is consistent with how the audit already handled Hisn 28:110 — correctly excluded as
`entryType: "guidance"`. Apply the same logic to the other guidance entries rather than forcing
them into a naming scheme built for supplications. **Bug B3 in v1.0 §11 Phase 3 is withdrawn.**

---

## A9. Corrections accepted

| # | Correction | Action |
|---|---|---|
| 4 | `hisn-27-76` is the Three Quls (112 + 113 + 114), not Surah Al-Ikhlas | v1.0 §5 candidate table corrected. `common_name` = **The Three Quls**. Naming a page for one surah when it delivers three is exactly the promise-and-fail pattern A1 prohibits. Good catch. |
| 8 | ch40 label is grammatically broken in the corpus | This is a source data defect, not a naming defect. Verify against a print copy of Hisn al-Muslim and repair the corpus text. Likely refers to one afflicted by doubt or whisperings in faith — do not guess. **Audit for other corrupted labels before assuming it is the only one.** |
| 9 | 32 slugs hit the cap, only 9 cut mid-word | Accepted. Fix the nine. |
| 10 | Hisn 104 uses parentheses, 64 chars | Accepted, no effect. |
| 11 | DUP-08 and DUP-12 are partial overlaps, not duplicates | **Accepted and important.** Similarity thresholds must not auto-merge. Every cluster requires human adjudication before consolidation. Add to v1.0 §13 checklist. |

---

## A10. Architecture decision — supersedes v1.0 §12

**Decision: the navigation taxonomy is by occasion and topic. Source collection is metadata, never
navigation.**

This is the structural answer to finding 1. A user looking for what to say before sleeping does not
care whether it came from Hisn al-Muslim chapter 28 or Kitab al-Da'awat, and never searches by
collection. Organising by source is organising the site around the corpus's filing system instead
of around the reader.

**Structure:**

| Layer | Definition | Indexed |
|---|---|---|
| **Topic hubs** (~40–60) | One per occasion or need. Comprehensive: every dua for that occasion, with Arabic, transliteration, meaning, repetitions, source. These are the pages that compete. | Yes |
| **Named spokes** (~120–180) | Individual pages where the dua has standalone demand — a known name, or a distinctive transliterated incipit. | Yes |
| **Anchor entries** | Everything else. Lives on its hub with an anchor link, or as a `noindex,follow` spoke so it can be linked directly without competing with its own hub. | No |
| **Canonical duplicates** | One page per unique text, referenced from every hub that needs it. Ayatul Kursi is **one page** cited by three occasions, not three pages. | Yes (the canonical) |

Book-name labels do not produce hubs. Their 259 pages are re-homed under topic hubs per A3.

**What this costs:** assigning a topic to 259 pages. That is real editorial work and it is the
price of finding 1. There is no mechanical shortcut, because the shortcut is what produced the
current situation.

---

## A11. Revised phasing — supersedes v1.0 §11

**Phase 1.5 — Content gate (new, blocks everything downstream)**

1. Source transliteration for the 307 pages lacking it. Sourced or reviewed, never
   generate-and-ship (A1).
2. Assign and approve topics for the 259 Track B pages (A3).
3. Route the guidance and non-dua entries out of the dua corpus (A8).
4. Repair the ch40 corpus label and audit for others (A9).

**Phase 2 — Decide.** Approve the 33 flagged labels, the four collisions in A7, the ch45/ch128
source text, the `common_name` list, and the topic assignments.

**Phase 3–5** proceed as v1.0 §11, with bug B3 withdrawn.

### Scope recommendation

Track A (~247 pages) is close to ready. Track B (259 pages) needs transliteration and topics.
**Ship Track A first, as its own release.** It gets a real corpus live, it validates the naming
system against actual search behaviour before the harder half is committed, and it means the
259-page editorial effort is informed by data rather than by this document.

Holding all 506 until everything is perfect is the failure mode here. So is shipping 307 pages that
promise transliteration they don't have.

---

## A12. Still needs Milan

- [ ] Approve A10 architecture before any Phase 3 work
- [ ] Approve or amend the Track A / Track B split
- [ ] Send ch45 and ch128 source text (A7)
- [ ] Decide sourcing route for 307 transliterations (A1) — this is the critical path
- [ ] Approve the 33 flagged labels from `doc/CHAPTER-LABELS-AUDIT.md`
- [ ] Verify `common_name` candidates, including the 5 proposed and the 3 declined
- [ ] Adjudicate all 13 duplicate clusters individually (A9 #11)
- [ ] Confirm Adhan and Salawat in Keyword Planner alongside the v1.0 §14 list
- [ ] Decide whether Track A ships as a separate release

---

## A13. Message for Claude Code

```
Read DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md alongside v1_0. Where they
conflict, v1.1 wins.

Your Phase 1 findings were correct and the spec has been amended, not
defended. Specifically: finding 1 was right that book-name labels can't
be rewritten lexically — the fix is A2/A3/A10. Finding 4 was right about
the Three Quls. Findings 3, 9, 10, 11 are accepted as corrections.
B3 is withdrawn per A8.

Still no writes to page-copy.json, no builds, no slug changes. Batches
1-2 stay unapproved.

Next, read-only:

1. Confirm the Track A / Track B page split from A2 against the data.
   Give me exact counts per track and per book-name label.

2. For the 307 pages lacking transliteration: report what IS present on
   each (Arabic only? Arabic + English? neither?), grouped by source
   collection, so I can decide the sourcing route. Do not generate any
   transliteration.

3. For Track B: propose a topic for each of the 259 pages per A3.
   Propose only — leave the data untouched. Flag any where the dua's
   content doesn't support a clear topic.

4. Send me the source text for ch45 and ch128 (A7), and your reading of
   the intended ch40 label with the corpus evidence.

5. Re-scan all 132 labels for the corruption pattern found in ch40.

6. Of the 13 duplicate clusters, mark each as full-duplicate or partial
   overlap with the evidence, per your finding 11. Do not merge anything.

Then stop. Log the v1.1 amendment in the ADR log before you begin.
```
