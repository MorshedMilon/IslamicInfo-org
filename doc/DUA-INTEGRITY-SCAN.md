# DUA-INTEGRITY-SCAN.md — Gate 3 deliberate scan

**Read-only.** 2026-07-31. No record was modified. Item 5 of `DUA-CONTENT-INTEGRITY-v1_0` §7,
executed against **all 556 records**, Arabic and translation fields, per the owner's correction
that 506 is the slug layer and not the text layer.

Seeded with the two confirmed contamination records, `35:125` and `40:133`.

---

## Buckets

| Layer | Records | Has a page | Renders where |
|---|---:|---|---|
| **slugged** | 506 | yes | detail pages + hubs |
| **variant** | 30 | no | inside a primary's page, and by search |
| **guidance** | 18 | no | search only |
| **no-translation** | 2 | no | corpus only |
| **TOTAL** | **556** | | |

---

## Findings

**46 distinct records carry at least one finding** — 42 slugged, 0 variant, 2 guidance,
2 no-translation. Counts below are per detector and overlap.

| Detector | Total | slugged | variant | guidance | no-tr |
|---|---:|---:|---:|---:|---:|
| transliteration holds prose (see §Contamination) | 39 | 37 | 0 | 0 | 2 |
| unbalanced parentheses | 9 | 9 | 0 | 0 | 0 |
| narration leakage | 6 | 4 | 0 | 2 | 0 |
| **leading-clause truncation** | **3** | 3 | 0 | 0 | 0 |
| unbalanced quotes | 3 | 3 | 0 | 0 | 0 |
| trailing truncation | 2 | 2 | 0 | 0 | 0 |
| Arabic with no translation | 2 | 0 | 0 | 0 | 2 |
| translation with no Arabic | 1 | 1 | 0 | 0 | 0 |
| transliteration duplicates translation | 0 | — | — | — | — |
| both fields empty | 0 | — | — | — | — |
| Latin text in the Arabic field | 0 | — | — | — | — |

**The variant layer is clean — zero findings across all 30.** That is worth stating plainly:
the variant hold (ADR-061) rests on a missing `variantLead`, not on any text defect.

---

## Leading-clause truncation — reported separately, per the owner

The distinct hazard is that these read as fluent text, so nothing looks wrong.

| id | Layer | Opens |
|---|---|---|
| `52:153` | slugged | `"i.e. those around the sick should instruct and…"` |
| `86:197` | slugged | `"And you."` |
| `93:204` | slugged | `"And may Allah bless them."` |

All three open mid-sentence: one on a lowercase abbreviation, two on a bare conjunction that
continues a clause which is not present. `86:197` and `93:204` are reply-formulae whose prompt
has been cut, so the page presents an answer with no question.

`ibnmajah:3590` — the case that established this subclass — is no longer in the scan set:
it was routed out under Gate 1 and is not in the corpus's active surface.

---

## Contamination — the transliteration field, and a distinction that matters

**39 records hold narration or translation prose in `transliteration`.** Both seeds confirmed
(`35:125`, `40:133`). This is the class where the field holds English that belongs elsewhere:

```
27:77  15:23  26:74  33:119  35:125  40:133  47:145  48:146  51:151  52:153
69:178 74:185 77:188 80:191  84:195  86:197  87:198  92:203  93:204  94:205
96:207 105:217 106:218 116:234 118:236 119:237 124:243 129:250
130:254 130:255 130:256 130:257 130:258 130:259 130:260 130:261 130:262 130:264 130:265
```

Chapter 130 accounts for 11 of the 39 — a cluster, not a scatter, which suggests one bad
ingest pass rather than record-by-record damage.

**A separate class of 18 records is NOT contamination and should not be remediated as such.**
These carry English *recitation annotations* inside the transliteration — `(four times in the
morning & evening)`, `(ten times after the maghrib & fajr prayers)`, `[In the evening:]`,
`(Note: for the evening, one reads (amsaytu) instead of (asbahtu).)`. That is how the source
compilation states repetition counts, and `meta.editorialNote` already acknowledges recitation-
context labels as deliberate. **This needs an owner ruling, not a fix.**

**`40:133` is recoverable from the data.** Its translation is empty and its transliteration holds
`"(Say:) I seek refuge in Allah. (Then you should desist from doing what you are in doubt about.)"`
— the missing translation is sitting in the wrong field. Same shape as `35:125`. This does not
touch the corrupted ch40 **label**, which remains under the §4 no-inference-repair ruling.

---

## Cross-validation against the six known Gate 3 defects

| Record | Detected as |
|---|---|
| `nasai:5464` | unbalanced parens + narration leakage ✅ |
| `nasai:5539` | unbalanced parens + narration leakage ✅ |
| `tirmidhi:3597` | unbalanced parens ✅ |
| `132:267` | translation with no Arabic ✅ |

Four of the six named in `DUA-CONTENT-INTEGRITY-v1_0` Gate 3 are independently re-found. The
document says "two further entries in the same class" without naming them, so those two cannot
be checked by id.

---

## Deliverable 9 — meta versus data

Every structural claim in `meta`, checked against the records.

| Claim | Stated | Actual | |
|---|---|---|---|
| `count` | 556 | 556 | ✅ |
| `entryTypes.supplications` | 536 | 536 | ✅ |
| `entryTypes.guidanceNarrations` | 18 | 18 | ✅ |
| `entryTypes.contextual` | 2 | 2 | ✅ |
| `translationSources` Hisn / dua-dhikr / Saheeh / AhmedBaset / null | 205/45/106/198/2 | identical | ✅ |
| `excluded.count` | 75 | 75 | ✅ |
| `facets.occasion.buckets` | 20 | 20 | ✅ |
| **`variantGroups['bukhari-seeking-refuge'].total`** | **11** | **14** | ❌ |
| **`variantGroups['bukhari-seeking-refuge'].secondary`** | **8** | **11** | ❌ |
| **`variantGroups._policy` lead-card relationship** | exists | `variantLead` null on all 30 | ❌ |
| **`arabicSourceDataset` "fully replaced or nulled"** | replaced | 183 of 205 verbatim | ❌ |
| `reviewQueue` — "entries carrying a `reviewNote`" | some | **0 records have `reviewNote`** | ⚠ |

**Four failures and one unsupported claim.** Two are new here: the `bukhari-seeking-refuge`
group is understated by 3 members, and `reviewQueue` documents a review mechanism keyed on a
field that exists on no record — so any entry that was meant to be queued for manual accuracy
checking is not queued anywhere.

The `arabicSourceDataset` and `_policy` failures were already known (ADR-060, ADR-061) and are
repeated here for completeness. Per ADR-063/064 the `arabicSourceDataset` text stays unedited.

---

## Method, and its limits

**The first pass over-fired badly and was rejected.** v1 reported 103 trailing truncations and
47 transliteration defects. Sampling showed most were sound: a complete translation with no
final full stop is not truncated, and a correct romanised transliteration is not contamination.
Reporting those would have sent someone to "fix" 100+ healthy records.

**`35:125` exposed a recall gap.** After tightening, the detector missed one of the two seeded
cases — its English prose scored below threshold. The word list was widened and both seeds now
detect. A scan validated only against its own output would not have caught this; it was caught
because the owner supplied known cases. **The remaining detectors have no such control**, so
recall is unmeasured — these are lower bounds, not complete sets.

**The contamination/annotation split is heuristic.** It strips parenthetical groups containing
recitation-count language before scoring. Records near the boundary may be classified wrongly in
either direction, and the 39/18 split should be eyeballed before any remediation.

Counts are precision-first throughout: a false defect costs more than a missed one here, because
it puts sound text on a repair list.
