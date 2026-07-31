# DUPLICATE-CLUSTERS.md

**Phase 1 artifact** — produced under `DUA-KEYWORD-NAMING-v1_0.md` §11 Phase 1 and adjudicated per
`DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md` A9 #11. Read-only; nothing merged, nothing modified.

## ⚠ Correction to my earlier finding 11

**I was wrong, and the amendment accepted the wrong claim.** I previously reported that two clusters
(then numbered DUP-08 and DUP-12) were *partial overlaps* — different duas sharing a long passage.
On re-reading the source text, both are **full duplicates**:

- **`27:76` / `25:70`** — both are the **Three Quls** in full. `25:70` is longer only because its
  translation field is prefixed with *"Recited after the obligatory prayers — once after Zuhr, Asr,
  and Isha, and three times after Fajr and Maghrib:"*. That prefix is **acknowledged editorial
  phrasing**, declared in the entry's own `translationSource`. Strip it and the texts are identical.
- **`9:15` / `85:196`** — identical 33-word text differing only in punctuation and the word order
  of the closing clause ("turn in repentance to You" vs "turn to You in repentance"). Same
  supplication (*Kaffaratul Majlis*), listed in two chapters.

**The principle in A9 #11 still stands and is now better evidenced**: a similarity threshold must
never auto-merge, because the *reason* two pages match differs from cluster to cluster. But the
specific examples I gave were misdiagnosed. Adjudication below is by evidence, not by score.

Two entries corpus-wide carry an editorial recitation prefix inside the translation field —
`25:70` and `25:71` — and both declare it. It is contained and honest, but it is the sole reason
those two clusters looked like partial overlaps. Worth separating verse text from recitation notes
into distinct fields.

## Cluster IDs are now stable

The previous version numbered clusters by object-insertion order, which is not deterministic —
IDs shifted between runs. Clusters are now sorted by their lowest member id, and members within a
cluster by id. **Always cite a cluster by its member ids, not by its DUP number.**

## Verdicts

| Verdict | Clusters |
|---|---:|
| FULL DUPLICATE | 12 |
| PARTIAL OVERLAP | 0 |
| NEAR-DUPLICATE | 1 |
| **Total** | **13** |

Method: two pages join a cluster when translations score ≥ 0.94 **or** Arabic ≥ 0.80 on 5-gram
Jaccard (diacritics and non-Arabic stripped). Clusters are the transitive closure. The Arabic
threshold is lower because the same verse recurs with small orthographic differences — that is how
the three Ayatul Kursi pages score 0.85–0.94 rather than 1.0.

## Adjudication

### DUP-01 — 3 pages · **FULL DUPLICATE**

*Evidence:* translation and Arabic byte-identical after normalisation.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `5:9` | Hisn al-Muslim 5 | What to say when undressing | 5 |
| `8:12` | Hisn al-Muslim 8 | What to say before performing ablution | 5 |
| `99:210` | Hisn al-Muslim 99 | Invocation for when your vehicle or mount begins to fail | 5 |

> In the name of Allah.

### DUP-02 — 2 pages · **NEAR-DUPLICATE**

*Evidence:* same supplication with wording variance (punctuation and word order only).

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `9:15` | Hisn al-Muslim 9 | What to say upon completing ablution | 33 |
| `85:196` | Hisn al-Muslim 85 | The Expiation of Assembly - Kaffaratul-Majlis | 33 |

> (How perfect You are O Allah, and I praise You, I bear witness that none has the right to be worshipped except You, I seek Your forgiveness and turn in repentance to You.)

### DUP-03 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation and Arabic byte-identical after normalisation.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `17:34` | Hisn al-Muslim 17 | Invocations during Ruki' (bowing in prayer) | 16 |
| `19:42` | Hisn al-Muslim 19 | Invocations during Sujood | 16 |

> (How perfect You are O Allah, our Lord and I praise You. O Allah, forgive me.)

### DUP-04 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation and Arabic byte-identical after normalisation.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `17:35` | Hisn al-Muslim 17 | Invocations during Ruki' (bowing in prayer) | 14 |
| `19:43` | Hisn al-Muslim 19 | Invocations during Sujood | 14 |

> (Perfect and Holy (He is), Lord of the angles and the Rooh (i.e. Jibra-eel).)

### DUP-05 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation and Arabic byte-identical after normalisation.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `17:37` | Hisn al-Muslim 17 | Invocations during Ruki' (bowing in prayer) | 13 |
| `19:45` | Hisn al-Muslim 19 | Invocations during Sujood | 13 |

> (How perfect He is, The Possessor of total power, sovereignty, magnificence and grandeur.)

### DUP-06 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation and Arabic byte-identical after normalisation.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `19:47` | Hisn al-Muslim 19 | Invocations during Sujood | 38 |
| `32:117` | Hisn al-Muslim 32 | Invocations for Qunut in the Witr prayer | 38 |

> (O Allah, I take refuge within Your pleasure from Your displeasure and within Your pardon from Your punishment, and I take refuge in You from You. I cannot enumerate Your praise, You are as You have p…

### DUP-07 — 2 pages · **FULL DUPLICATE**

*Evidence:* translations identical once an editorial recitation prefix is removed from `25:70`.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `25:70` | Hisn al-Muslim 25 | What to say after completing the prayer | 128 |
| `27:76` | Hisn al-Muslim 27 | Words of remembrance for morning and evening | 109 |

> Recited after the obligatory prayers — once after Zuhr, Asr, and Isha, and three times after Fajr and Maghrib: Say, "He is Allāh, [who is] One, Allāh, the Eternal Refuge. He neither begets nor is born…

### DUP-08 — 3 pages · **FULL DUPLICATE**

*Evidence:* translations identical once an editorial recitation prefix is removed from `25:71`.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `25:71` | Hisn al-Muslim 25 | What to say after completing the prayer | 100 |
| `27:75` | Hisn al-Muslim 27 | Words of remembrance for morning and evening | 95 |
| `28:100` | Hisn al-Muslim 28 | What to say before sleeping | 95 |

> Recited after each obligatory prayer: Allāh - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens …

### DUP-09 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation byte-identical; Arabic differs only in orthography/diacritics.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `25:73` | Hisn al-Muslim 25 | What to say after completing the prayer | 13 |
| `27:95` | Hisn al-Muslim 27 | Words of remembrance for morning and evening | 13 |

> O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.

### DUP-10 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation and Arabic byte-identical after normalisation.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `27:85` | Hisn al-Muslim 27 | Words of remembrance for morning and evening | 73 |
| `28:109` | Hisn al-Muslim 28 | What to say before sleeping | 73 |

> O Allah, Knower of the unseen and the seen, Creator of the heavens and the earth, Lord of all things and their Sovereign. I bear witness that there is no deity worthy of worship except You. I seek ref…

### DUP-11 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation byte-identical; Arabic differs only in orthography/diacritics.

*Separated by real source data:* the Arabic states different repetition counts — `27:92` = ten times, or once if tired, `27:93` = one hundred times in the morning. These pages are not interchangeable.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `27:92` | Hisn al-Muslim 27 | Words of remembrance for morning and evening | 27 |
| `27:93` | Hisn al-Muslim 27 | Words of remembrance for morning and evening | 27 |

> There is no deity worthy of worship except Allah alone, He has no partner. To Him belongs dominion and praise, and He is over all things competent.

### DUP-12 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation byte-identical; Arabic differs only in orthography/diacritics.

*Separated by real source data:* the Arabic states different repetition counts — `27:97` = three times in the evening, `104:216` = none. These pages are not interchangeable.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `27:97` | Hisn al-Muslim 27 | Words of remembrance for morning and evening | 17 |
| `104:216` | Hisn al-Muslim 104 | Invocation for a layover (stopping along the way) on the journey | 17 |

> I seek refuge in the perfect words of Allah from the evil of what He has created.

### DUP-13 — 2 pages · **FULL DUPLICATE**

*Evidence:* translation and Arabic byte-identical after normalisation.

| Entry | Source ref | Chapter | Words |
|---|---|---|---:|
| `34:121` | Hisn al-Muslim 34 | Invocations in times of worry and grief | 28 |
| `41:137` | Hisn al-Muslim 41 | Invocations for the setting of a debt | 28 |

> (O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being over powered by men.)

## What still needs your adjudication

Every cluster above is a **full duplicate** in text. That does not make the consolidation decision
mechanical, because the reason each pair exists differs:

**(a) Deliberate cross-listing by the compilation.** `17:34`/`19:42`, `17:35`/`19:43`,
`17:37`/`19:45` (ruku' and sujood), `34:121`/`41:137` (worry and debt), and the Ayatul Kursi
trio. Hisn al-Muslim lists these more than once on purpose. Under A10 these become **one canonical
page referenced from several topic hubs** — the amendment already answers this.

**(b) Separated by a repetition count stated in the Arabic.** `DUP-11`, `DUP-12`. Real source
data distinguishes them, so they are not interchangeable even though the words match.

**(c) Incidental collision on a very short text.** `8:12`/`5:9`/`99:210` are all *"In the name of
Allah."* — five words. Three URLs cannot meaningfully differ, and no disambiguator rung in A4 can
separate them, because the text itself is the disambiguator and it is identical. These are the
strongest candidates for **not existing as pages at all**, only as anchors on their topic hubs.

I have merged nothing and changed nothing.
