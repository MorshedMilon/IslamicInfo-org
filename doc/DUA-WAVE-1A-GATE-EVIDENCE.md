# Wave 1a — per-record Gate 1/2/3 evidence

**Read-only verification, 2026-08-02.** No record, page, slug or sitemap was modified.

Subject: the **13 rows** `doc/DUA-WAVE-1-READINESS.md` assigns `wave_assignment: 1a`.
Governing spec: `DUA-CONTENT-INTEGRITY-v1_0.md`. This document is the evidence base for
the ADR-054 amendment; it is not itself a clearance.

> **`DUA-WAVE-1-READINESS.md` is the source of truth for wave membership, and the
> `build_wave` column in `docs/seo/famous_named_duas_v2.csv` is superseded.** Where the two
> disagree, the readiness document governs. This document narrows the readiness document's
> 1a set; it does not widen it.

**Result: 10 of 13 pass. 3 are dropped from 1a.**

---

## 1. Method

Each of the 13 was resolved to its corpus record and tested individually. Nothing was
inherited from `DUA-WAVE-1-READINESS.md` — that document's own Gate 3 test was re-run from
the record rather than trusted, which is how findings §4.3 and §5.2 below were reached.

Membership sets used, all read from checked-in data rather than from prose:

| Set | Source | Size |
|---|---|---:|
| Part 1 condemned speech | `gate1-route-out.json`, `class = condemned-speech` | 24 |
| Part 2 narrative candidates | `DUA-REVIEWER-PACKAGE.md` Part 2 table | 10 |
| Gate 1 route-out | `gate1-route-out.json` `entries` | 25 |
| Corpus exclusion set | `search-corpus.json` `meta.excluded.ids` | 75 |

---

## 2. Gate 1 — not-a-dua · **13 of 13 pass**

No row of the 13 appears in any of the four sets above, and none carries an `entryType`
other than the default supplication type (`contextual` and `guidanceNarration` are both
absent across all 13).

| corpus_id | in the 24 | in the 10 | in `gate1-route-out.json` | in `meta.excluded.ids` | `entryType` | verdict |
|---|:--:|:--:|:--:|:--:|---|---|
| `27:79` | no | no | no | no | — | pass |
| `85:196` | no | no | no | no | — | pass |
| `27:97` | no | no | no | no | — | pass |
| `1:1` | no | no | no | no | — | pass |
| `49:148` | no | no | no | no | — | pass |
| `98:209` | no | no | no | no | — | pass |
| `62:168` | no | no | no | no | — | pass |
| `3:6` | no | no | no | no | — | pass |
| `60:165` | no | no | no | no | — | pass |
| `101:212` | no | no | no | no | — | pass |
| `55:156` | no | no | no | no | — | pass |
| `117:235` | no | no | no | no | — | pass |
| `79:190` | no | no | no | no | — | pass |

This is a strong pass rather than a lucky one: **all 44 Gate 1 records fall in Track B**
(ADR-065), and all 13 of these are Track A. Gate 1 was never capable of touching this set.
That is worth stating so the pass is not read as evidence the gate was tested hard here.

---

## 3. Gate 2 — transliteration present **and sourced** · **13 present, 12 cleanly sourced, 1 with an open owner ruling**

All 13 carry a non-empty transliteration. None was touched by commit `2a7b68b`, which nulled
the 39 contaminated fields — verified by diffing `2a7b68b^` against `HEAD` for all 13: **0 changed**.

### 3.1 Provenance — two datasets, mechanically distinguishable

The 13 split exactly on `sourceKey`, and the two groups use incompatible romanisation
conventions. That split is the evidence that neither group was generated in this repository.

| Group | Rows | Convention | Provenance |
|---|---:|---|---|
| `hisn` | 7 | parenthesised, `AA` for ʿayn (`waAAafihi`, `AAatheem`) | upstream dataset field, copied verbatim |
| `dua-dhikr` | 6 | bare, lowercase, apostrophe for ʿayn (`a'udhu`, `'abduka`) | dua-dhikr (fitrahive) dataset, via the re-source |

**The 7 `hisn` rows** — `85:196`, `49:148`, `98:209`, `62:168`, `60:165`, `55:156`, `79:190`.
Copied verbatim from `LANGUAGE_ARABIC_TRANSLATED_TEXT` in the pinned upstream dataset
`github.com/wafaaelmaandy/Hisn-Muslim-Json` (`husn_en.json`) by
`worker/scripts/ingest-dua-corpus.mjs` at commit `7392380`. The script is on the record and
the field mapping is a direct assignment with whitespace normalisation only — no
transformation, no generation. This is the compilation's own romanisation.

**The 6 `dua-dhikr` rows** — `27:79`, `27:97`, `1:1`, `3:6`, `101:212`, `117:235`. These were
**replaced** at commit `735cdda` ("re-source dua corpus English from free-licensed sources")
from the dua-dhikr (fitrahive) dataset. The replacement is directly evidenced:

> At ingest (`7392380`), `117:235`'s transliteration field held
> `"The Prophet PBUH used to say between the Yemeni corner and the black stone…"` — English
> narration prose sitting in the transliteration field, the same contamination class the
> integrity scan later bounded at 39 records. At `735cdda` it became
> `"rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar"`.
> The field was **repaired from a dataset, not nulled and not romanised in-repo.**

Corroborating: **all 45** `dua-dhikr` records carry a transliteration, against **130 of 187**
`hisn` records. A field present on 100% of one source's records and 70% of another's is
inherited from the sources, not produced here.

All 6 were read against their Arabic and each is a correct romanisation of the text stored on
its own record. This was an inspection of six items, not a systematic character-level audit.

### 3.2 Two limits on this evidence, stated rather than buried

1. **No record asserts its own transliteration provenance.** There is no
   `transliterationSource` field on any of the 566 records, and `meta` makes **no claim about
   transliteration at all** — `translationSource` covers the translation only. Everything in
   §3.1 is reconstructed from commit history and romanisation style. It is good evidence; it
   is not evidence the data carries. **The amendment should require a per-record
   `transliterationSource` before these ship**, so the next reader does not have to re-derive
   this from `git show`.
2. **The `735cdda` match was made on English-translation similarity** (the commit records
   strict directional coverage plus Jaccard). The transliteration rode along with the matched
   dua-dhikr record; it was never independently verified against the Arabic stored here. For
   these 6 that inspection has now been done by eye and each corresponds. The method, not the
   result, is the caveat.

### 3.3 `49:148` — transliteration sits in an unresolved class

`49:148`'s transliteration is `(Asalul-lahal-AAatheem rabbal-AAarshil-AAatheem an yashfeek
(7times).)`. The `(7times)` is an English recitation annotation inside the transliteration
field. `DUA-INTEGRITY-SCAN.md` §Contamination separates this class from the 39 and rules:
**"This needs an owner ruling, not a fix."** Seven records are in it — `27:80`, `27:81`,
`17:33`, `19:41`, `25:66`, `25:72`, `49:148`.

A row carrying an open owner ruling is by definition not "no reviewer dependency, no
remediation". `49:148` fails 1a's own qualifying test on this ground alone, before Gate 3.

---

## 4. Gate 3 — text integrity · **11 of 13 pass, 2 fail**

Every detector from `DUA-INTEGRITY-SCAN.md` was re-run per record, plus the Arabic-field
detectors from `scan-arabic-narration.mjs`, plus the three the owner named explicitly.

**Narration prefix: 0 of 13.** **Multi-span: 0 of 13.** **Isnad: 0 of 13.** No record contains
`حدثنا`/`أخبرنا`/`حدثني`/`أخبرني` anywhere in its Arabic; no record has more than one `((`
span; no record's Arabic opens on a narrative frame. No row is Class B, so R3 does not engage.
No row is a `quran:` record, so the full-āyah limb of R3 does not engage either.

Also clean across all 13: balanced parentheses, balanced quotes, no Latin text in the Arabic
field, no empty field, no Arabic-without-translation or the reverse, no transliteration
duplicating its translation, no leading-clause or trailing truncation.

### 4.1 `49:148` — **FAIL**, three defects

```
AR : ((أَسْأَلُ اللَّهَ الْعَظيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفيَكَ)) (سبع مرات).
TRL: (Asalul-lahal-AAatheem rabbal-AAarshil-AAatheem an yashfeek (7times).)
EN : (I ask Allah The Supreme, Lord of the magnificent throne to cure you’.(7times) (he (the sick person) will be cured.))
```

1. **Narration leakage in the translation.** `(he (the sick person) will be cured.)` is the
   *outcome reported in the narration*, not part of the supplication. A page rendering this
   translation tells the reader the words are part of what they recite. This is the same
   defect class as `nasai:5464`.
2. **Stray `’`** after "cure you" — an unterminated quotation mark left by the source.
3. **`(سبع مرات)` sits outside the `))` delimiter**, and the count appears in the Arabic and
   the transliteration but not the translation.

**Note on detector recall.** The integrity scan reported 6 narration-leakage records and named
only 4. `49:148` is either one of the two it left unnamed, or a miss — that cannot be resolved
from the record. Either way it supports the scan's own conclusion that **its counts are floors**.
The phrasing here ("he … will be cured") matches no marker in the scan's word list.

### 4.2 `60:165` — **FAIL**, three-field coverage

```
AR : ((السَّلاَمُ عَلَيْكُمْ أَهْلَ الدِّيَارِ… لاَحِقُونَ، [وَيَرْحَمُ اللَّهُ الْمُسْتَقدِمِينَ مِنَّا وَالْمُستأْخِرِينَ] أَسْاَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ)).
TRL: (Assalamu AAalaykum ahlad-diyari… wa-inna in shaal-lahu bikum lahiqoon, nas-alul-laha lana walakumul-AAafiyah.)
EN : (Peace be upon you all, O inhabitants of the graves… we ask Allah for well-being for us and you.)
```

The bracketed clause — *"and may Allah have mercy on those of us who have gone ahead and those
who come later"* — is **present in the Arabic and absent from both the transliteration and the
translation**. A reader following the transliteration silently skips a line of the Arabic in
front of them, with nothing on the page explaining why.

This fails no detector on any existing list, which is why it is reported here rather than
inherited. It is a Gate 2 failure in substance: the transliteration does not romanise the
Arabic the page renders. The spec's own definition-of-done — *"Arabic + transliteration
present, from corpus"* — is satisfied on presence and violated on correspondence.

Secondary: `mu/mineena` in the transliteration carries a stray `/` where a hamza belongs — an
upstream character artifact.

**This is recoverable and cheap.** It is a Part 3 item: the reviewer confirms whether the
bracketed clause belongs in the recited text and supplies its transliteration and translation,
or confirms it should be dropped from the Arabic. Either answer clears the row.

### 4.3 `27:97` — passes, with a flag

`(ثلاثَ مرَّاتٍ إذا أمسى)` — *"three times when evening comes"* — sits **outside** the `))`
delimiter, and appears in neither the transliteration nor the translation. Same family as
§4.2 but materially milder: the omitted content is an **editorial recitation count, not a
clause of the supplication**, so no reader is misled about the words themselves.

Repairable at build time without a corpus edit or a reviewer: render the Arabic block from the
delimited span only and state the count in Block A. **Kept in 1a, with that build requirement
attached.**

Separately, and not a gate matter: `famous_named_duas_v2.csv` rank 25 names this row **"Ruqyah
dua"**, while the record's own category is *Words of remembrance for morning and evening* and
its Arabic annotation says `إذا أمسى` — evening. The text is narrated for both usages; **this
record attests only the evening one.** A page titled for ruqyah would assert an occasion its
own source record does not carry. That is a naming-spec question, downstream of integrity, and
it is logged here so it is not discovered after the title is frozen.

### 4.4 `1:1` and `3:6` — records pass; **the readiness generator never tested them**

Both store their Arabic in single `( … )` rather than the compilation's `(( … ))`:

```
1:1  : (.الْحَمْدُ للَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا، وَإِلَيْهِ النُّشُورُ )
3:6  : ( اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ… )
```

Neither contains an isnad verb, so **neither is Class B** and R3 does not engage. Running the
nine narration-frame patterns over the *entire* field — the correct treatment when no
delimiter marks where recitable text begins — produces **no hit for either.** Both records are
clean.

**But the evidence behind their 1a assignment was vacuous.** `build-wave1-readiness.mjs`
line 38 reads:

```js
const ar = d.arabic || ""; const i = ar.indexOf("((");
if (i <= 0) return false;          // ← no "((" ⇒ declared clean without testing
```

When there is no `((`, `prefixDefect()` returns `false` immediately. **The two records with
anomalous delimiters are exactly the two the generator's Gate 3 check silently skips.**
`scan-arabic-narration.mjs` does not have this bug — its `prefixOf()` treats the whole field
as prefix in that case, which is the right behaviour — so the standalone scan did cover them
and the readiness generator did not.

The same line explains the readiness table's stated justification. `"Arabic is the dua text
alone"` is emitted by `ar.startsWith("((") ? … : …` — a string test on the first two
characters, not a finding about content. For these two rows that column asserted more than the
code behind it checked.

Also on `1:1`: a stray `.` immediately follows the opening parenthesis — a trailing full stop
rendered at the wrong end under RTL. Cosmetic, and it will render.

**Both are kept in 1a**, now on evidence rather than on a skipped branch. `build-wave1-readiness.mjs`
should be fixed regardless, since the bug will mis-clear future rows silently.

---

## 5. Findings outside the three gates

These fail no gate. They are recorded because they land on the same 13 pages and two of them
bear directly on what the owner asked for in the duplicate-scripture rule.

### 5.1 `85:196` shares a verbatim citation with a differently-occasioned record

`85:196` (*The Expiation of Assembly — Kaffaratul-Majlis*) and `9:15` (*What to say upon
completing ablution*) carry the **byte-identical** `hadithCitation`:

```
Riyad as-Salihin 152 (Abu Hurairah (May Allah be pleased with him) reported:)
```

Both are slugged, neither is excluded, and their Arabic is the same text differing only in
punctuation — the pair `DUA-CONTENT-INTEGRITY-v1_0` §4 already identifies as a full duplicate.

Two occasions, one reference. At most one record's occasion is what Riyad as-Salihin 152
attests, and **`85:196` is the one inside Wave 1a** — so that citation would publish inside its
A2 authentication block. The spec's hard rule is *"no invented references… never reconstructed
from memory"*; a reference that is demonstrably wrong for at least one of the two records it
sits on is not a reference this project can publish without a reviewer confirming which
occasion it belongs to.

The citation also embeds a narrator frame — `(Abu Hurairah (May Allah be pleased with him)
reported:)` — inside a field that should hold a reference. 10 `hadithCitation` strings are
shared by more than one record corpus-wide; this is the only one among the 13.

**Recommend dropping `85:196` from 1a pending one reviewer question.** It is the cheapest of
the three drops to recover.

### 5.2 The 13 cannot satisfy the spec's A2 block as the validator states it

Not a gate finding, and not a reason to withhold the amendment — but it will stop the build on
the first page attempted, so it should not surface in Session 2.

- **The corpus has no grading field.** No `grade`, `grading`, `takhrij`, `gradedBy` or
  equivalent exists on any of the 566 records.
- **10 of the 13 have no `hadithCitation` at all.** Only `85:196` (contested, §5.1), `98:209`
  (Sunan ad-Darimi 1960) and `79:190` (Sunan ad-Darimi 1459) carry one. Corpus-wide, 272 of
  566 records do.

`DUA-PAGE-CONTENT-SPEC.md` §2 A2 requires the collection reference and the grading "from the
corpus fields — never reconstructed from memory", and permits an honest null: *"If a corpus
field is null, the note says the grading is not recorded in our source."* But §5 check 6
asserts **"collection ref and grading non-null"**. Those two cannot both hold for any record in
this corpus. **The spec contradicts itself, and the honest-null path is the correct one** — it
is the path the charter requires. Check 6 needs amending to assert *"grading is either present
from the record or explicitly stated as not recorded"*, never to require a non-null value the
data cannot supply.

---

## 6. Verdict

| corpus_id | Rank | Gate 1 | Gate 2 | Gate 3 | Outcome |
|---|---:|:--:|:--:|:--:|---|
| `27:79` | 16 | pass | pass | pass | **1a** |
| `27:97` | 25 | pass | pass | pass · flagged §4.3 | **1a**, build must drop the count from the Arabic block |
| `1:1` | 27 | pass | pass | pass · §4.4 | **1a** |
| `98:209` | 29 | pass | pass | pass | **1a** |
| `62:168` | 30 | pass | pass | pass | **1a** |
| `3:6` | 31 | pass | pass | pass · §4.4 | **1a** |
| `101:212` | 33 | pass | pass | pass | **1a** |
| `55:156` | 35 | pass | pass | pass | **1a** |
| `117:235` | 49 | pass | pass | pass | **1a** |
| `79:190` | 50 | pass | pass | pass | **1a** |
| `49:148` | 28 | pass | **FAIL** §3.3 | **FAIL** §4.1 | **dropped** |
| `60:165` | 32 | pass | **FAIL** §4.2 | **FAIL** §4.2 | **dropped** |
| `85:196` | 24 | pass | pass | pass | **dropped** — §5.1 citation |

**Wave 1a = 10 rows.**

### 6.1 The threshold argument does not survive the drop

`DUA-WAVE-1-READINESS.md` justifies retiring rank order on an explicit condition: *"13 rows
are buildable today. That clears the 12-row threshold, so this set becomes Wave 1 and rank
order stops governing."* At 10, **that condition is no longer met on its own terms.**

Retiring rank order is still right — rank was assigned before any record was inspected, and
this exercise is the inspection. But it should now rest on that reasoning rather than on a
threshold the set no longer clears, and the owner should be the one to say so.

### 6.2 Recovery, cheapest first

| Row | What clears it | Who | Cost |
|---|---|---|---|
| `85:196` | Confirm which occasion Riyad as-Salihin 152 attests | reviewer | one question → **11** |
| `60:165` | Confirm the bracketed clause, supply or drop its transliteration | reviewer, Part 3 | one record → **12** |
| `49:148` | Owner ruling on the 7-record annotation class, **then** a translation repair | owner, then a corpus edit | two steps → **13** |

`85:196` and `60:165` together restore the set to 12 and are both reviewer questions that fit
inside the package going out today.

---

## 7. Repository defects found during this verification

Logged so they are fixed rather than rediscovered. None was acted on.

1. **`build-wave1-readiness.mjs:38`** — `prefixDefect()` returns `false` whenever the Arabic
   has no `((`, so records with anomalous delimiters are declared clean without being tested
   (§4.4). Fix: fall through to testing the whole field, as `scan-arabic-narration.mjs` does.
2. **`scan-arabic-narration.mjs:19` reads a key that does not exist.**
   `raw.meta?.facets?.excluded?.ids || raw.meta?.excluded?.ids` — the first branch is always
   `undefined`; the real path is `meta.excluded.ids`. The fallback saves it, so output is
   correct today and would break silently if the fallback were ever removed.
3. **No `transliterationSource` field exists** on any record (§3.2).
4. **`DUA-PAGE-CONTENT-SPEC.md` §5 check 6 contradicts §2 A2** and cannot pass against this
   corpus (§5.2).
5. **`DUA-WAVE-1-READINESS.md` header says 566 records; `DUA-INTEGRITY-SCAN.md` scanned 556.**
   Both are correct for their date — the 10 Qur'anic records ingested since are unscanned by
   Gate 3. None is in Wave 1a, so nothing here is affected, but **the Gate 3 scan does not
   currently cover the whole corpus** and the readiness document does not say so.
