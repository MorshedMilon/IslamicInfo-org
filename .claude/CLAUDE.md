# Claude Code — IslamicInfo.org Entry Point

The **project charter** is at the root: `../CLAUDE.md`
The **design system v3.0** is at: `../doc/DESIGN-SYSTEM.md`
Claude Code reads this file first, then the root `CLAUDE.md` automatically.

## Context Reading Order

When starting any task, read these files in this priority order:

1. `CLAUDE.md` (root) ← Project charter: invariants, what must never happen, document map
2. `doc/DESIGN-SYSTEM.md` ← Full design system v3.0: tokens, components, nav rules, §24 enforcement
3. `skills/main/SKILL.md` ← Brand skill: condensed platform overview + hard constraints
4. `doc/CONTENT-POLICY.md` ← Islamic content rules, human review gate, authenticated vs AI separation
5. `doc/API-SPEC.md` ← All /api/ route contracts: endpoints, shapes, cache, fallbacks
6. `doc/DATA.md` ← localStorage key registry + schemas (ii-habits, is-progress, etc.)
7. `doc/architecture/ARCHITECTURE.md` ← System architecture, build stages, fallback table
8. `doc/brand/ISLAMICINFO_BRAND_IDENTITY.md` ← Brand identity rules

Then, for the specific page being worked on:

9.  `doc/prd/[page]_PRD*.md` ← Requirements
10. `doc/functional/[page]_Functional_Document*.md` ← Behaviour and states
11. `doc/tech-specs/[page]-technical-doc.md` ← Implementation spec
12. `mockups/[page].html` ← Visual blueprint (canonical — do not deviate)

## Reference docs (read when relevant to the task)

- `doc/DECISIONS.md` ← Why things are the way they are (ADR log)
- `doc/ANTI-HALLUCINATION-PROMPT.md` ← Verification rules + phase prompts
- `doc/CLAUDE-CODE-PLAYBOOK.md` ← Session workflow + task templates
- `Islamic-Prompt-Template/PAGE-BUILD-TEMPLATE.md` ← Master build prompt + per-page parameter sheet
- `doc/TASKS.md` ← Live task board (backlog → in progress → done)
- `doc/DEFINITION-OF-DONE.md` ← Per-task ship checklist

## Skill Library

- `skills/main/SKILL.md` ← Brand skill (always read)
- `skills/islamic-authenticity/` ← Hadith verifier + labels + trusted sources (read for all 🕌 content)
- `skills/qa/SKILL.md` ← QA and testing patterns
- `skills/inheritance/` ← Inheritance calculator spec + QA guide

## Non-Negotiable Invariants (summary — full list in root CLAUDE.md §3)

- No fatwas. No rulings. No halal/haram verdicts. Ever.
- Every Quran verse, hadith, or claim carries a source — or it is not shown.
- Never invent Arabic, hadith, citations, endpoints, tokens, or localStorage keys.
- Run the hadith-verifier skill before any hadith output.
- Design system is locked. No new colors/fonts. No raw hex inline.
- Root CLAUDE.md (charter) wins on any conflict with this file.

Dua page naming is governed by `doc/DUA-KEYWORD-NAMING-v1_0.md` as amended by
`doc/DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md`. v1.1 wins on conflict. Read both
before touching /duas/ titles, slugs, H1s, or meta descriptions.

`doc/DUA-CONTENT-INTEGRITY-v1_0.md` sits **above both naming specs** and
supersedes v1.1 §A1 (ADR-054). Naming is downstream of integrity: naming,
topic-assignment and indexing work is paused until its Gates 1–3 clear.
Read it first.

## PRECONDITION — `DUA_SEARCH_PUBLIC` must not flip until held records are excluded

**Standing requirement, logged 2026-08-03. Blocks the flag, not the search work.**

Before `DUA_SEARCH_PUBLIC` (`src/js/search-results-core.js`, currently `false`) is set true,
whatever powers dua search **must explicitly exclude every record whose `page-copy.json` entry
has `indexable:false`.** This is general: it covers `36:127` and `103:215`, and **every future
Gate 3 hold automatically**. Do not special-case ids.

**There is nothing to add a filter to today — the exclusion has to be built, not amended.**
Checked 2026-08-03: there is **no dua search-index build step at all**. `search-corpus.json` *is*
the index — the raw 566-record corpus, tracked, and already served in production at
`/src/data/dua/search-corpus.json` (HTTP 200, ~795 KB, both held records present in it). No
client code fetches it yet, which is the only reason held records are not currently reachable
through search. So the guarantee rests entirely on the flag being off, and flipping the flag
without building the exclusion first would surface held records immediately.

Why it matters: a Gate 3 hold means the stored Arabic and the stored transliteration/translation
disagree and **which one is right is not established**. Surfacing such a record in search
publishes the unresolved text as if it were settled — the exact thing the hold exists to prevent.
Removing the page from the sitemap and the index does *not* cover the search surface.

**Check at flip time:** hold a record, then confirm it returns no search result. An exclusion
never made to fail on purpose is not known to work (same standard as the R1–R6 negative controls
in `doc/TASKS.md`).

✅ **ENFORCED 2026-08-04 — this is no longer a written precondition, it is validator rule R11.**
"Logged in CLAUDE.md" is precisely the artefact class this programme has repeatedly shown to be
unreliable: it depends on someone remembering at the moment it matters. R11 fails the build if a
held record is present in the served `search-corpus.json` while `DUA_SEARCH_PUBLIC` is true, and
**fails closed** if it cannot read the flag at all. Negative control run and passing: flipping the
flag to true produced `R11: FAIL (3)` naming `27:90`, `36:127`, `103:215`; reverting restored PASS.
The preferred permanent fix is still to exclude held records from the served artifact entirely, at
which point the flag coupling disappears — R11 then passes on structure rather than on the flag.

## Transliteration house style (STANDING CONVENTION, owner-ruled 2026-08-03)

**Popular style, not academic ALA-LC.** Binding on all dua work from now on — the
remaining adoption batches, Wave 2, and Class B whenever it unblocks. Superseded the
ALA-LC used in reviewer-package Parts 9–18; those proposals were re-spelled in place.
The ALA-LC originals survive in git history at commit `430d7cd` and in Part 12's
"Base — quran.com API v4, verbatim" blocks, which are **quoted source and must never
be restyled**.

**Characters.** `ā→aa  ī→ee  ū→oo` · `ḥ→h  ṭ→t  ṣ→s  ḍ→d  ẓ→z` · digraphs
`th dh kh sh gh` unchanged.

**Rule A — apostrophe.** ʿayn and hamza both become `'`. Keep it everywhere **except
word-finally**, where it is dropped — with one refinement (owner-ruled 2026-08-04):
**final hamza is dropped, final ʿayn is KEPT**, because dropping a final ʿayn removes a
real consonant sound while dropping a final hamza barely changes pronunciation.
`aʿūdhu→a'oodhu` · `asʾaluka→as'aluka` · `duʿāʾ→du'aa` · `ʿalā→'alaa` ·
`wa-ḍaʿ→wada'` · `tanqaṭiʿ→tanqati'`.
Only `21:51` and `24:62` carry a word-final ʿayn — that is the entire blast radius.

**Rule H — word division (FINAL, owner-ruled 2026-08-04 as "Option A").**
Sun-letter assimilation is KEPT — this does *not* reverse the Part 12 ruling — but the
academic hyphenated joins are gone. **The article fuses onto the word before it, then a
SPACE before its noun.** Never fused to the noun (`minal hammi`, not `minalhammi`), never
hyphenated (not `mina-l-hammi`).

| | example |
|---|---|
| article fuses left, space before the noun | `minal hammi` `wal hazani` `lahul mulku` `as'alukal jannata` |
| assimilation shows as the doubled consonant across the space | `wash shahaadati` `faatiras samaawaati` `minan naar` `war rooh` |
| **Rule H5 — hamzat al-waṣl ELIDES in connected speech** and fuses onto the preceding word | `allaahummaghfir lee` · `warhamnee` · `Allaahummakfineehim` · `waj'alnee` |
| …a preceding long vowel shortens before the cluster | `maa istata'tu → mastata'tu` · `mimmaa ibtalaaka → mimmabtalaaka` |
| …but waṣl at the START of an utterance keeps its vowel | `Ihdinee` · `Isbiroo` |
| a prefix never fuses onto a vowel-initial stem or a proper noun | `wa anta` · `wa Rabba` · `wabi Muhammadin` |
| conventional divine-name fusions (closed list) | `bismillaah lillaah billaah wallaah illallaah allaahumma lilladhee` |

**Rule H5 was wrong until 2026-08-04** and shipped that way in the first 5 adoptions: it
wrote `allaahumma ighfir lee`, restoring a vowel that is silent in connected speech. The
old romanisation had this right. All 27 affected records were corrected, including the
already-live `39:132`.

**H5 reaches VERBS, not the divine name.** `allaah` / `allaahumma` / `allatee` / `alladhee`
stay **split** from the preceding word unless the result is on the closed fusion list.
Confirmed against 16 live records (`Subhaanaka allaahumma`, `wa'alaa allaahi`,
`anta allaahu`, `lillaahi alladhee`, `Subhaana alladhee`, `dhaa alladhee`,
`yukallifu allaahu`, `Bismika allaahumma`, `Labbayka allaahumma`, `Ahabbaka alladhee`).
Closed list: `illallaah bismillaah lillaah billaah wallaah Subhaanallaah Hasbiyallaah
Hasbunallaah Sami'allaah Astaghfirullaah Baarakallaah Tabaarakallaah shaa'allaah`.

**Honorifics live in the translation field, never in the transliteration** (Part 13a rule 4,
owner-confirmed 2026-08-04). `27:87` carries ﷺ in its `arabic` and in its `translation`, and
deliberately **not** in its `transliteration`. The two fields disagreeing on this is intended,
not drift. Normalising honorifics in translations would be a separate pass over all records.

**Round brackets are ruled** as of 2026-08-04 — Part 13a **rule 5b**: a round-bracketed
optional/variant WORD is transliterated **with its brackets**, exactly like square-bracket
rule 3. `2:5` → `haadhaa (ath thawba) warazaqaneehi`. Rule 5 ("unruled") is superseded.

**Rule P — pause form (owner-ruled 2026-08-04, after a defect).** Pause form may drop only
**iʿrāb** (case/mood) vowels and pronoun-suffix vowels, and only at the **end of an utterance**.
It must **never** drop a **bināʾ** vowel — those are part of the word, not inflection.
The failure that produced this rule: `97:208` shipped as proposed with `aẓlaln aqlaln aḍlaln
dharayn` for أَظْلَلْنَ أَقْلَلْنَ أَضْلَلْنَ ذَرَيْنَ. That final fatḥa is **nūn an-niswah**,
structural, and does not drop; `azlaln` is an unpronounceable cluster, which is the tell.
Correct: `azlalna aqlalna adlalna dharayna`. **The ALA-LC proposal already had it wrong** —
it copied the old romanisation's `wama athlaln` — so Part 17's "full correction, not a partial
fix" claim did not hold for that record.

⚠ **Rule P is stated but NOT yet applied library-wide.** Pause form is currently applied *by
feel*, inherited from the ALA-LC proposals, and it does not track the stored vowelling: the
Arabic is fully vowelled in every case checked, yet identical `لَهُ` renders `lah` in `3:6`
and `lahu` in `28:108`, and `وَالأَرْضِ` renders `wal ard` at an internal comma in `16:30`.
Sweeping this needs per-record Arabic alignment — logged in `doc/TASKS.md`, not mechanisable
from the romanisation alone.

**Rule A's ʿ/ʾ collision is accepted, never patched per-word.** `63:169` renders
`مَرِيئاً مَرِيعاً` (two distinct words) as `maree'an maree'an`. Owner-ruled 2026-08-04:
keep it, because the convention's value is that it is mechanically derivable from the
Arabic — a one-off exception means the transliteration can no longer be re-derived by rule.
Record the loss in the record's `textNote`; do not alter the transliteration.

## STANDING RULE — no mechanical step is trusted on its own report

**Owner-ruled 2026-08-04, promoted from four separate incidents with one failure mode.**
Every one was a step that silently did not execute and reported success:

| incident | what happened |
|---|---|
| `/\bli-lladhī\b/` | `\b` after a macron can never fire. The rule never once executed, and reported nothing. |
| mutation 1 | the seeded defect's anchor didn't match, so the mutation never applied — and scored as a pass. |
| package↔corpus sync | reported "3 synced", did 2; the third was a no-op on a stale anchor. |
| `fuseArticleLeft` | swallowed the particle أَنْ, deleting a word, and produced valid-looking output. |

**The rule, in two parts:**
1. **Assert on the artifact afterwards, never on the step's report.** Re-read the file, re-parse
   the JSON, count the matches. A script that prints "done" is not evidence that anything changed.
   Prefer asserting a **count or a parse** over asserting a substring, and assert the *absence* of
   the old value as well as the presence of the new one.
2. **No pattern or rule ships without a negative control proving it can fire at all.** A rule that
   matches nothing is indistinguishable from a rule that passes. This already applies to
   `validate-seo.mjs` (R1–R6) — it is now general: regexes, build gates, verification scripts,
   mutation tests. For a gate, prove **both** directions: it fires when it should and does not when
   it shouldn't.
3. **AMENDED 2026-08-04 — end-to-end controls are not enough; every RULE carries its own fixture.**
   The cross-field scan's `dedupe` rule silently never fired — twice — because an escaping layer
   turned its backreference into a literal `0x01` byte. **The scan's own end-to-end controls passed
   the whole time**; it was caught only because the flag count looked implausibly high. A control on
   the gate protects the gate, not the rules inside it.
   **Requirement:** every rule in a pipeline carries a known-positive fixture, and a **pre-run
   self-test asserts each rule matches at least one fixture before the run proceeds. A rule matching
   zero fixtures ABORTS the run rather than reporting clean.** This makes the whole family
   structurally impossible instead of caught by luck: the `\b`-after-non-ASCII bug, the `0x01`
   backreference, and the mutation with the bad anchor were all the same shape.
   Implemented in `occasion.mjs` — 6 rules, 6 fixtures, `process.exit(2)` on any dead rule.
4. **A parser that visibly mis-handles one construction must be cleared on ALL instances of it.**
   The visible failure is the lucky one; the same weakness usually also produces a *silent skip*,
   which reports as clean. Worked example: nested/wrapper parens in the `arabic` field produced one
   visible false positive (`2:5`) **and one silent skip (`27:76`, verified correct by hand)**. Count
   the construction across the corpus and account for every instance, not just the one that shouted.

**The two things that worked are this rule already operating**: the sync no-op was caught by
re-reading the package, and the unapplied mutation was refused a pass rather than counted. That is
why it is written down rather than left as four fixes.

## CANONICAL DENOMINATORS (recomputed 2026-08-04 — do not quote a count from memory)

Both scope claims that have failed in this programme were **reconstructed by hand**; every claim
about derivation *mechanics* was computed and has held. Hence the rule, and hence this table:

> **If a claim was not computed from stored data, it is a hypothesis until it is.**

| count | what it is | what it excludes |
|---:|---|---|
| **566** | records in `search-corpus.json` | — the whole corpus, most never published |
| **114** | LIVE published pages (tracked + `indexable !== false`) | the 3 held; the 452 never published |
| **113** | live pages carrying a transliteration | `27:77`, which has no transliteration field and so correctly shows no disclosure note |
| **109** | records with `transliterationSource` (**R10's number**) | — provenance only; says nothing about accuracy |
| **0** | records with `transliterationVerified` | — nothing has been checked against the Arabic |
| **3** | HELD (`indexable:false`, untracked, 404) | `27:90` `36:127` `103:215` |
| **116** | the reviewer set, Parts 9–18 | — |
| **112** | of the 116 that got a written proposal | the 4 routed to Part 13a (`27:78` `27:81` `27:89` `27:90`) — content questions, never proposed |
| **5** | live, carry a transliteration, have **no** provenance | `27:76` `27:78` `27:81` `27:89` `1:4` — R10's entire remaining debt. Was 6; `27:90` left this set by being held |
| **45 / 32** | `dua-dhikr`/fitrahive records in corpus / live | was reported as "1" — wrong by a factor of 33 |
| **166** | `<loc>` entries in `sitemap.xml` | the 3 held |

Relationships worth stating because they have been confused: **109 ≠ 112 − 3.** The 109 includes
`115:233` (the Talbiyah), which was adopted in Part 3 and was never in the 112; and it excludes the
5 above plus `27:76`/`1:4`, which are in the 112 but parked. The reviewer set (116) and the live set
(114) are **different populations that overlap**, not subsets of one another.

## KNOWN LIMITATIONS of the transliteration programme (read before claiming anything is verified)

**0. FIVE live pages have never been through the derivation programme at all** (was six; `27:90` is
now held — see below). They carry a transliteration, have **no** `transliterationSource`, and were
never in the 112 that were diffed: `27:76` `27:78` `27:81` `27:89` `1:4`. They are parked on
**content** questions, which is why they left the derivation denominator while staying published,
and they are R10's entire remaining debt. Do not read "109 adopted" as "the library is covered".

⚠ **This item was previously WRONG IN TWO DIRECTIONS, and the correction is the point.** It said
`27:81`/`27:90` "carry the source-truncation flag (their Arabic ends mid-text)". That **overstated
damage to recited text**: in both records the ellipsis sits inside the *bracketed evening
annotation*, and the main `((…))` supplication is complete. It simultaneously **understated a real
cross-field defect sitting in the same records** — `27:90` had morning Arabic under an evening
transliteration, translation, H1 and title, which is far more serious than a truncated annotation
and was not mentioned at all. **A limitations register that misdescribes its own items is worse
than a short one**; re-derive each entry from stored data before trusting it.

**0a. `27:90` — field provenance divergence, the defect class re-derivation cannot see.** Its
`arabic` is Hisn's morning text; its `transliteration`, `translation`, H1 and `<title>` are
fitrahive's **evening** supplication. Two supplications joined on an id. Every prior defect was
*within-field* ("the Arabic → Latin transform was imperfect") and therefore findable by
re-derivation; this one is *cross-field*, the transform was never run on it, and **the harness is
blind to it by construction** — there is no ALA-LC lineage to validate. Only a cross-field
agreement check finds it. Held 2026-08-04 (`indexable:false`, untracked, 404). The evidence points
to it being an **evening record with the wrong Arabic**, not a morning record with four wrong
fields — three of four content fields agree on evening. Resolves with the Part 13a split.
Cross-field scan over all live records: **`27:90` was the only instance**; occasion-consistency scan
across `arabic`/`transliteration`/`translation`/`title`: **0 conflicts remaining**.

**1. Nothing in the corpus has been derived from the Arabic.** All 112 proposals came from one
machine pass. The re-derivation harness validates the **ALA-LC → popular** transform only; it
re-runs the spelling step and cannot see an error in the **Arabic → ALA-LC** step, because it
takes the ALA-LC as its input. `97:208` is the proof: the ALA-LC proposal itself carried
`aẓlaln` (copied from the old romanisation `wama athlaln`), the restyle faithfully preserved it,
and the diff came back clean. **A clean diff means the spelling transform is faithful, not that
the text is right.** Closing that gap is the scheduled cross-field consistency check.

**2. `transliterationSource: "Reviewer-written (adopted)"` is a Gate-2 provenance value, NOT a
verification claim.** Owner rulings resolved flagged edge cases in the derivation; they are not a
scholarly check of the text against a named source. Adopted records keep `indexable:true` **and**
the on-page disclosure note is retired only because R10 is gated on the same field — that is a
provenance gate, not an accuracy gate. Never let "owner-ruled" read as "verified" in metadata,
changelogs or commit messages.

**3. Article fusion is keyed on the LATIN shape, not on ال in the Arabic.** `fuseArticleLeft`
guesses Arabic grammar from the romanisation, with a same-consonant back-reference as its only
guard. That guard is necessary and not sufficient: a particle followed by a word beginning with
that particle's final consonant would still fuse wrongly (`an` + a nūn-initial verb). Scanned
2026-08-04 across all 112 — **zero hits today** — but the residual is structural. The real fix is
to key fusion on the article in the `arabic` field. Not built; recorded.

**4. Rule P (pause form) is stated but NOT applied library-wide.** See Rule P above and
`doc/TASKS.md`. Do not attempt it as a regex.

**Verification standard, learned the hard way (2026-08-04).** Re-derivation beats inspection, and
the evidence is `1:4`: the particle أَنْ had been silently swallowed into the preceding word by
the article-fusion bug — a word gone from the text, reading perfectly. **Inspection had passed
over it repeatedly; only re-deriving all 112 and diffing surfaced it.** Cite this the next time
verifying-by-reading is proposed. Two further corollaries:
- **A checker repeatedly adjusted until its diff goes clean is fitted to its target.** Three gaps
  in the harness were fixed exactly that way. Measure sensitivity with a **mutation test** —
  seed one synthetic defect per failure class and require every one to be flagged (10/10 on
  2026-08-04) — otherwise "0 defects" only means the two artifacts agree.
- **A script that reports success is not evidence.** The package↔corpus sync reported "3 synced"
  having done 2; the third was a no-op. Assert on the artifact afterwards, never on the report.

**`src/data/dua/search-corpus.json` is AUTHORITATIVE; the reviewer package is a review document.**
The builder reads the corpus and the corpus is what ships. They drifted silently once
(`Alhamdu` × 6, plus 3 owner rulings applied to the corpus only) and the corpus happened to be
correct — luck, not architecture. One divergence is legitimate and documented in Part 9:
`27:85`/`28:109` share a table row but not a transliteration. **Nothing enforces this today** —
a package↔corpus diff belongs in `validate-seo.mjs`; logged in `doc/TASKS.md`.

**Never re-derive from the Arabic when restyling.** Restyling is a spelling operation
only. Which words are present and which root is right is settled work — carry it
through untouched. Gate 2/3 rulings, `transliterationSource` and hold status are
orthogonal to style and are never changed by a restyle.

The transform is **lossy and one-way**: `ḥ/h`, `ṣ/s`, `ṭ/t`, `ḍ/d`, `ẓ/z` collapse and
ʿ/ʾ merge, so the ALA-LC cannot be recovered from the popular form. Keep the audit
trail.

## Repo trap — line endings (STANDING RULE, added 2026-08-03)

**This repo's tracked text files are restored by git with CRLF on Windows.** Any operation
that is line-ending sensitive — regex strip or insert, file splicing, anchor matching,
"replace everything between X and Y" — **must normalise first, or match `\r?\n` explicitly.**

This is a known trap, not a one-off. It silently defeated **three separate operations in a
single session on 2026-08-03**, and in every case the failure was invisible — the operation
reported success and did nothing:

1. **`sitemap.xml` strip-and-rebuild** in both dua builders. The regex ended ``<\/url>\n``,
   matched zero of the CRLF entries, so the strip became a no-op and every URL was appended a
   second time. This is the real cause of the "duplicate hub URLs" seen on 2026-08-01 — the
   bug appears on a fresh checkout and hides itself as soon as one build rewrites the file
   with LF. Fixed to ``<\/url>\r?\n``.
2. **`editorial-policy.html` splice** from `about.html`. The `<main>…</main>` anchor used
   ``\n``, matched nothing, and produced a page that was a byte-for-byte copy of about.html.
3. **Reviewer-package Part 7/8 insertion**. The anchor ``\n---\n\n## Sign-off`` matched
   nothing, so both document bodies were silently dropped.

**Verify against a string that only exists if the operation worked.** Incident 3 was reported
as successful because the check tested a substring that also appeared in a sign-off row added
by the *same* run — a self-confirming check. Assert on something unique to the payload, and
prefer asserting a count or a parse over asserting a substring.
