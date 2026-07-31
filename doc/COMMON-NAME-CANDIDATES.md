# COMMON-NAME-CANDIDATES.md

**Phase 1 artifact** — produced under `DUA-KEYWORD-NAMING-v1_0.md` §11, Phase 1 (read-only).
No project data was modified. **`common_name` is null everywhere in the data and stays null.**

Per §5(a), these are *proposals only*. Every one needs your verification before it reaches a page.
I have grouped them by how confident I am, and where I am not confident I have said so rather than
filling the row.

---

## A. Your 10 candidates, checked against the corpus text

All ten entries exist in the 506-page browse set and I read each translation. Nine match the
proposed name. **One does not.**

| Page | Your proposed `common_name` | Chars | Verdict |
|---|---|---:|---|
| `hisn-28-100` | Ayatul Kursi | 12 | ✅ Matches — Qur'an 2:255, full text present |
| `hisn-27-75` | Ayatul Kursi | 12 | ✅ Matches — same text as 28:100 |
| `hisn-25-71` | Ayatul Kursi | 12 | ✅ Matches — prefixed "Recited after each obligatory prayer:" |
| `hisn-27-76` | Surah Al-Ikhlas | 15 | ❌ **Incorrect — see below** |
| `hisn-27-79` | Sayyidul Istighfar | 18 | ✅ Matches — "O Allah, You are my Lord… I abide to Your covenant" |
| `hisn-28-101` | Last Two Verses of Al-Baqarah | 29 | ✅ Matches — Qur'an 2:285–286, "The Messenger has believed…" |
| `hisn-28-106` | Tasbih Fatimah | 14 | ✅ Matches — 33 / 33 / 34 counts present in the Arabic |
| `hisn-28-105` | Bismika Allahumma Amutu wa Ahya | 31 | ✅ Matches the transliteration field exactly |
| `hisn-27-88` | Ya Hayyu Ya Qayyum | 18 | ✅ Matches — "O Ever-Living, O Self-Sustaining…" |
| `hisn-27-83` | Hasbiyallahu La Ilaha Illa Huwa | 31 | ✅ Matches — note the Arabic also states "recite seven times" |

### ❌ `hisn-27-76` is not Surah Al-Ikhlas alone

The entry contains **all three Quls**, not one surah. Its full translation runs:

> Say, "He is Allāh, [who is] One… Nor is there to Him any equivalent." Say, "I seek refuge in the
> Lord of daybreak… from the evil of an envier when he envies." Say, "I seek refuge in the Lord of
> mankind… From among the jinn and mankind".

That is Al-Ikhlas (112) **+ Al-Falaq (113) + An-Nas (114)**. Naming the page "Surah Al-Ikhlas" would
tell a reader they are getting one surah and give them three, and it would target a query the page
does not actually answer best.

**Proposed correction: `The Three Quls` (14 chars).** I am confident the *content* is the three
Quls; I am not making the call on the *name* — "Three Quls" vs "Al-Muawwidhat" vs listing them —
because that is a naming decision with real query-volume consequences. Your call.

---

## B. Further candidates I am confident about

Content verified against the translation. Names still need your sign-off.

| Page | Chapter | Proposed `common_name` | Chars | Basis |
|---|---|---|---:|---|
| `hisn-26-74` | Istikharah (seeking Allah's Counsel) | Istikhara Dua | 13 | Chapter already carries the name; text is the Istikhara dua |
| `hisn-85-196` | The Expiation of Assembly | Kaffaratul Majlis | 17 | Chapter already carries the transliterated name |
| `hisn-22-52` | Invocation for At-Tashahhud | At-Tahiyyat | 11 | Text is the Tashahhud: "Allah compliments, prayers and pure words are due to Allah…" |
| `hisn-115-233` | The pilgrim's announcement of arrival | Talbiyah | 8 | The Hajj/Umrah talbiyah |
| `hisn-23-53` | How to recite blessings on the Prophet | Durood Ibrahim | 14 | "O Allah, send prayers upon Muhammad… just as You sent prayers upon Ibraheem" |

**Caveat on the two `hisn-23-*` pages.** Both entries in that chapter are forms of the same
salawat — `23:53` is the familiar wording, `23:54` adds "the wives and descendants of Muhammad".
If `23:53` takes `Durood Ibrahim`, then `23:54` needs its own name or the pair needs the §12
treatment, because they will otherwise collide. Separately, the **`Durood` vs `Salawat`** choice is
the §6 gap already flagged in `CHAPTER-LABELS-AUDIT.md` for chapter 23 — it changes the target
query and I am not resolving it.

---

## C. Candidates I am **not** confident enough to propose

Listed so they are not lost, with the specific reason I stopped short.

| Page | Chapter | Possible name | Why I am not proposing it |
|---|---|---|---|
| `hisn-32-117` | Invocations for Qunut in the Witr prayer | Dua Qunut | The text is "O Allah, I take refuge within Your pleasure from Your displeasure…", which is **not** the well-known Qunut supplication ("Allahumma ihdini fiman hadayta"). Attaching the famous name to this text would misattribute it. |
| `hisn-27-77` | Words of remembrance for morning and evening | Asbahna wa Asbahal-Mulku Lillah | This is a recognised opening, but I am not certain it is *commonly searched by name* rather than by occasion. Low confidence on demand, not on content. |
| `hisn-28-102` | What to say before sleeping | Bismika Rabbi Wada'tu Janbi | Genuine transliterated opening, but §5(b) would generate essentially this automatically. Promoting it to a curated `common_name` adds risk without adding signal. |

---

## D. Things I deliberately did **not** do

- I did not populate `common_name` anywhere. The field does not yet exist in the data.
- I did not propose names for the 99 Qur'an-sourced pages. Each is a verse or passage with a real
  reference (`Qur'an 2:126` etc.), and inventing popular names for them is exactly the
  source-attribution risk §5(a) warns about. If you want surah names there, that is a separate
  decision and it should come from the verse reference, not from me.
- I did not propose names for any of the 259 pages under the eight collection book-chapters. Those
  need the §12 architecture decision first.

---

## E. One dependency worth flagging

§5(a) names `hisn-27-75`, `hisn-28-100` and `hisn-25-71` all as "Ayatul Kursi". If all three keep a
`common_name` of "Ayatul Kursi", their **titles will be identical** unless the chapter label
distinguishes them:

```
Morning & Evening Adhkar: Ayatul Kursi | IslamicInfo.org
Dua Before Sleeping: Ayatul Kursi | IslamicInfo.org
Dua After Salah: Ayatul Kursi | IslamicInfo.org
```

Those are unique and read well — but only because the three chapter labels differ. It works here.
It will **not** work for `hisn-27-92` / `hisn-27-93` (DUP-03), which sit in the *same* chapter with
the *same* translation, separated only by a repetition count stated in the Arabic. If either gets a
`common_name`, both need one, or the pair needs the §12 treatment. Flagging rather than resolving.

Also note §6 asks you to verify `Ayatul Kursi` vs `Ayat al-Kursi` and `Sayyidul Istighfar` vs
`Sayyid al-Istighfar` in Keyword Planner before locking. That check is still outstanding and it
affects 4 of the 10 candidates above.
