# Wave readiness statement — all 48 famous-dua rows

Generated 2026-08-02 from `search-corpus.json` (566 records),
`famous_named_duas_v2.csv` and `src/js/dua-clause-core.js`. Regenerate with
`node scripts/build-wave1-readiness.mjs` — do not hand-edit, it will drift.

**This is the document Session 4 is held against.** A row may not be built unless its
*Remaining* column is empty.

> ## This document is the source of truth for wave membership
> 
> **The `build_wave` column in `docs/seo/famous_named_duas_v2.csv` is SUPERSEDED.** It records a
> keyword-priority judgement made before any record was inspected. Where it and the
> `wave_assignment` column below disagree — and they disagree substantially — **this document
> governs**. Rank order does not govern the build sequence.
> 
> **The `1a` set below is an upper bound, further narrowed by**
> **[`DUA-WAVE-1A-GATE-EVIDENCE.md`](DUA-WAVE-1A-GATE-EVIDENCE.md).** This generator tests what
> is mechanically testable from the record. That document tests each `1a` row against Gates 1, 2
> and 3 individually and **drops `49:148`, `60:165` and `85:196`**, leaving **10**. Where the two
> disagree, the evidence document governs, and no row may be built on this document alone.

## wave_assignment

The `build_wave` column in the CSV records a **keyword-priority** judgement made before any of
the integrity work. `wave_assignment` here records what the **record can actually support**.
They disagree substantially, and where they do, this column governs.

| Value | Meaning |
|---|---|
| `1a` | Buildable today. No extraction, no reviewer dependency, no Gate 1/2/3 remediation. |
| `1b` | Was assigned Wave 1, but needs reviewer sign-off before it can be built. |
| `2` | Assigned Wave 2 and also carries outstanding items. |
| `blocked` | Carries a defect that is not merely a review — see the row's `status_note`. |

## Summary

| wave_assignment | Rows |
|---|---:|
| `1a` — **buildable today** | **13** |
| `1b` | 18 |
| `2` | 15 |
| `blocked` | 2 |
| **total non-dropped** | **48** |

**13 rows are buildable today.** That clears the 12-row threshold, so this set becomes Wave 1 and rank order stops governing the build sequence — a wave is only useful if it is large enough to read an index-rate signal from, and rank order was assigned before any record was inspected.

## Wave 1a — buildable today

Every row here needs no extraction, no reviewer dependency and no remediation. The
qualifying test is the same for all of them: the record's Arabic field holds the supplication
and nothing else, a transliteration is present, and no gate applies.

| Rank | Dua | corpus_id | Why it qualifies |
|---:|---|---|---|
| 16 | Sayyidul Istighfar | `27:79` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 24 | Kaffaratul Majlis | `85:196` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 25 | Ruqyah dua (A'udhu bikalimatillahi at-tammati) | `27:97` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 27 | Dua after waking up (Alhamdu lillahil-ladhi ahyana) | `1:1` | Arabic is the dua text alone; transliteration present; not a full-āyah record |
| 28 | Dua for the sick (As'alullahal-'azim) | `49:148` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 29 | Dua for entering the market | `98:209` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 30 | Dua for thunder | `62:168` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 31 | Dua for new clothes | `3:6` | Arabic is the dua text alone; transliteration present; not a full-āyah record |
| 32 | Dua for visiting graves | `60:165` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 33 | Dua for a traveler (resident's dua for someone leaving) | `101:212` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 35 | Dua for the deceased (funeral prayer) | `55:156` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 49 | Dua between the Yemenite Corner and Black Stone | `117:235` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |
| 50 | Dua for the groom (Barakallahu laka) | `79:190` | Arabic is a single delimited dua; transliteration present; not a full-āyah record |

## All rows

| Rank | wave_assignment | Dua | corpus_id | Extraction shape | Sign-off needed | Remaining |
|---:|---|---|---|---|:--:|---|
| 1 | `1b` | Ayatul Kursi | `27:75` | prefix-trim | yes | clause extraction (prefix-trim) unverified |
| 2 | `1b` | Rabbana atina fid-dunya hasanah | `quran:2:201` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 3 | `1b` | Rabbana la tu'akhidhna | `28:101` | verse-from-bundle | yes | clause extraction (verse-from-bundle) unverified |
| 4 | `1b` | Dua of Yunus (AS) - La ilaha illa anta | `quran:21:87` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2); build_gate: awaiting-original-rendering |
| 5 | `1b` | Rabbi ishrah li sadri | `quran:20:25` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 6 | `1b` | Rabbi zidni ilma | `quran:20:114` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2); build_gate: awaiting-original-rendering |
| 7 | `1b` | Rabbana hab lana min azwajina | `quran:25:74` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 8 | `1b` | Rabbi habli minas saliheen | `quran:37:100` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 9 | `1b` | Rabbi hab li min ladunka dhurriyyatan tayyibah | `quran:3:38` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 10 | `1b` | Rabbi inni lima anzalta ilayya min khairin faqir | `quran:28:24` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 11 | `1b` | Rabbana afrigh alayna sabran | `quran:2:250` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 12 | `1b` | Hasbunallahu wa ni'mal wakeel | `quran:3:173` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2); build_gate: awaiting-original-rendering |
| 13 | `1b` | Rabbi ighfir li waliwalidayya | `quran:71:28` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2); build_gate: awaiting-original-rendering |
| 14 | `1b` | Rabbana la taj'alna fitnatan lilladhina kafaru | `quran:60:5` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 15 | `1b` | Rabbi awzi'ni an ashkura ni'mataka | `quran:27:19` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 16 | `1a` | Sayyidul Istighfar | `27:79` | none | no | — |
| 17 | `1b` | Istikharah dua | `26:74` | prefix-trim | yes | clause extraction (prefix-trim) unverified; Arabic opens with a narration prefix (Gate 3); no transliteration (Gate 2) |
| 18 | `blocked` | Dua Qunut | `abudawud:1426` | classb-isnad | yes | status = blocked; clause extraction (classb-isnad) unverified; no transliteration (Gate 2) |
| 19 | `1b` | Dua for entering the mosque | `13:20` | prefix-trim | yes | clause extraction (prefix-trim) unverified |
| 20 | `1b` | Dua for travelling (safar) | `96:207` | prefix-trim | yes | clause extraction (prefix-trim) unverified; no transliteration (Gate 2) |
| 21 | `2` | Rabbi irhamhuma kama rabbayani sagheera | `quran:17:24` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2); build_gate: awaiting-original-rendering |
| 22 | `2` | Talbiyah - Labbaik Allahumma Labbaik | `115:233` | none | yes | no transliteration (Gate 2) |
| 23 | `2` | Dua for the Day of Arafat | `119:237` | prefix-trim | yes | clause extraction (prefix-trim) unverified; Arabic opens with a narration prefix (Gate 3); no transliteration (Gate 2) |
| 24 | `1a` | Kaffaratul Majlis | `85:196` | none | no | — |
| 25 | `1a` | Ruqyah dua (A'udhu bikalimatillahi at-tammati) | `27:97` | none | no | — |
| 27 | `1a` | Dua after waking up (Alhamdu lillahil-ladhi ahyana) | `1:1` | none | no | — |
| 28 | `1a` | Dua for the sick (As'alullahal-'azim) | `49:148` | none | no | — |
| 29 | `1a` | Dua for entering the market | `98:209` | none | no | — |
| 30 | `1a` | Dua for thunder | `62:168` | none | no | — |
| 31 | `1a` | Dua for new clothes | `3:6` | none | no | — |
| 32 | `1a` | Dua for visiting graves | `60:165` | none | no | — |
| 33 | `1a` | Dua for a traveler (resident's dua for someone leaving) | `101:212` | none | no | — |
| 34 | `blocked` | Dua for good news | `106:218` | prefix-trim | yes | status = blocked; clause extraction (prefix-trim) unverified; Arabic opens with a narration prefix (Gate 3); no transliteration (Gate 2) |
| 35 | `1a` | Dua for the deceased (funeral prayer) | `55:156` | none | no | — |
| 37 | `2` | Dua for pain in the body | `124:243` | none | yes | translation opens with an instruction, not the dua; no transliteration (Gate 2) |
| 38 | `2` | Dua of Ibrahim for Makkah | `quran:14:35` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 39 | `2` | Dua of Ibrahim and Ismail (building the Kaaba) | `quran:2:127` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 40 | `2` | Dua of Ayyub (Job) for healing | `quran:21:83` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2); build_gate: awaiting-original-rendering |
| 41 | `2` | Dua of Nuh for forgiveness | `quran:11:47` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 42 | `2` | Dua of Adam and Hawa (repentance) | `quran:7:23` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 43 | `2` | Dua of Yusuf (a good death upon faith) | `quran:12:101` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 44 | `2` | Dua against heart deviation | `quran:3:8` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 45 | `2` | Dua for firm feet in hardship | `quran:3:147` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 46 | `2` | Dua for light on the Day of Judgment | `quran:66:8` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2) |
| 47 | `2` | Dua for fulfillment of Allah's promise | `quran:3:194` | quran-clause | yes | clause extraction (quran-clause) unverified; no transliteration (Gate 2); build_gate: awaiting-original-rendering |
| 48 | `2` | Dua at Safa and Marwah | `118:236` | prefix-trim | yes | clause extraction (prefix-trim) unverified; Arabic opens with a narration prefix (Gate 3); no transliteration (Gate 2) |
| 49 | `1a` | Dua between the Yemenite Corner and Black Stone | `117:235` | none | no | — |
| 50 | `1a` | Dua for the groom (Barakallahu laka) | `79:190` | none | no | — |

## What each outstanding item means

| Item | Who clears it | Where |
|---|---|---|
| `clause extraction (…) unverified` | reviewer | package Parts 4–5 |
| `no transliteration (Gate 2)` | reviewer | package Part 3 |
| `Arabic opens with a narration prefix` | reviewer, then a corpus edit | package Part 4 pattern |
| `translation opens with an instruction` | reviewer, then a corpus edit | not yet in the package |
| `build_gate: awaiting-original-rendering` | owner — original English rendering | — |
| `Gate 1 …, second signal NOT confirmed` | reviewer | package Part 1 |
| `status = blocked` | depends on the row's `status_note` | — |

## Extraction shapes in Wave 1

| Shape | Rows |
|---|---:|
| `prefix-trim` | 7 |
| `quran-clause` | 24 |
| `verse-from-bundle` | 1 |
| `classb-isnad` | 1 |
| none needed | 15 |

Every extraction above is a **proposal**. `dua-clause-core.js` returns `verified: false` on
every result it produces, and `DUA-PAGE-CONTENT-SPEC.md` §1.1 forbids rendering an unverified
clause. Nothing has been written to the corpus.
