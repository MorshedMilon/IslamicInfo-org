# Dua corpus — reviewer work package

**For a qualified reviewer. No repository access required — every record is reproduced in full below.**

Generated from `src/data/dua/search-corpus.json` (566 records) and
`src/data/dua/gate1-route-out.json`. Governing spec: `DUA-CONTENT-INTEGRITY-v1_0.md`.

Five independent asks. Each has its own table and its own sign-off column.
Write directly in the **Reviewer ruling** and **Reviewer notes** columns; nothing else needs changing.

Nothing in this package has been acted on. No page is being published on the strength of it.

---

# Covering note — please read before you start

**Added 2026-08-02. Suggested order of work, and why.**

The five parts are independent and you may do them in any order. But they are **not** equally
unblocking, and the numbering does not reflect that. If your time is limited, this is where it
buys the most.

## Start with Parts 4 and 5

**These two unblock 18 pages between them.** Every one of those 18 is a page we consider
otherwise ready — the text is sound, the sourcing is settled, and the single thing standing
between it and publication is a clause boundary that only you can confirm.

| | Rows | What blocks them |
|---|---:|---|
| **Part 4** — Arabic-field defects | 7 | The Arabic field holds a narrator's frame, a full isnad, or two duas run together. We have proposed the supplication; we cannot confirm it. |
| **Part 5** — Qur'anic full-āyah rows | 26 | The record stores the complete āyah and the supplication is one clause inside it. |

Our extraction module returns `verified: false` on **every** result it produces, by design, and
our content spec forbids rendering an unverified clause. **Nothing has been written to the
corpus.** So these rows are not waiting on engineering — they are waiting only on you, and they
will keep waiting until you rule.

Part 5 is also the least effortful of the two relative to its size: on **24 of its 26 rows** you
are *checking* a proposal, not transcribing from scratch. The rule behind those proposals agreed
with an independently-recorded incipit on 24 of 25 resolvable rows. Ranks **1 and 3** are the
exceptions and need transcription — they are written up as worked examples at the head of that
part, deliberately, so the shape is familiar rather than met cold.

## Part 3 is large, and mostly not on the critical path

Part 3 is the biggest single ask in this package — **75 transliterations**, roughly double what
an earlier estimate stated. It is real work and it does need doing. **But it unblocks almost
nothing on its own.**

Of the 32 famous-dua rows that lack a transliteration, **30 are blocked on something else as
well** — nearly always the same clause-extraction question that Parts 4 and 5 exist to answer.
Supplying a transliteration for those 30 moves none of them to publishable; they simply trade
one blocker for another.

**Exactly one row in the whole set is blocked on transliteration alone:** rank 22, the Talbiyah
(`115:233`, *Labbaik Allahumma labbaik*). One row.

So Part 3 is best understood as **groundwork for the long tail**, not as a release blocker. The
sequencing follows: rule the clauses first, and the transliteration work then lands on rows that
have nothing else in the way.

If you would rather not carry 75 at once, **rank 22 first** is the highest-value single item in
Part 3, and Part 3's Track A section (3a) serves more near-ready pages than section 3b.

## Parts 1 and 2 are route-outs, not releases

Neither publishes a page. Part 1 confirms — or rejects — a removal already held; §1.5 of our
spec requires a second independent signal before any removal is permanent, and **a record
wrongly classified is removed for no reason**, so a rejection is as valuable to us as a
confirmation. Part 2 is explicitly a *candidate pool built on one mechanical signal*, not a
finding; membership in it is not evidence of anything and we would rather you narrowed it than
accepted it.

## Two questions outside the five parts

Both arose on 2026-08-02 while verifying a small set of pages record by record. Each is one
question, and each currently blocks one otherwise-ready page.

1. **`85:196` and `9:15` carry the byte-identical citation** `Riyad as-Salihin 152 (Abu Hurairah
   (May Allah be pleased with him) reported:)`. Their Arabic is the same text — *Subhanaka-llahumma
   wa bihamdika…* — but they are filed under different occasions: **expiation of an assembly**
   (`85:196`) and **upon completing ablution** (`9:15`). At most one of those is what Riyad
   as-Salihin 152 attests. **Which occasion does that reference belong to, and what is the correct
   reference for the other?**

2. **`60:165`** (*Invocation for visiting the graves*) — the Arabic contains a bracketed clause,
   `[وَيَرْحَمُ اللَّهُ الْمُسْتَقدِمِينَ مِنَّا وَالْمُستأْخِرِينَ]`, which appears in **neither the transliteration nor
   the translation**. A reader following our transliteration would silently skip a line of the
   Arabic in front of them. **Does that clause belong in the recited text?** If yes, we need its
   transliteration and translation (this becomes a Part 3 item). If no, it should come out of the
   Arabic field.

---

## Part 1 — Condemned-speech route-out: second-signal confirmation

**24 records.** Each was classified as speech the Qur'an quotes in order to report or
condemn it — not a supplication to recite. They are currently held `noindex` and are not
published as duas.

§1.5 of the spec requires that classification be confirmed against **a second independent
signal — speaker attribution in the Arabic, or the surrounding ayat — rather than a single
reading**, before any is routed out permanently. All are marked `secondSignalConfirmed: false`.

> This cuts both ways: a page wrongly classified as condemned speech is removed for no reason.
> If a record does **not** belong here, say so — that is as useful as confirming one.

| # | Ref | Verse text (English) | Why it was flagged | **Reviewer ruling** (confirm / reject) | **Reviewer notes** |
|---|---|---|---|---|---|
| 1 | Qur'an 2:200 | Our Lord, give us in this world | Already flagged `contextual` in the corpus: the Qur'an quotes this as the request of those who ask only for this world. 2:201 is the praised form. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: 2:200 is the deficient half of the deliberate 2:200/2:201 contrast — "give us in this world" with no hereafter clause and no protection-from-the-Fire clause. The Qur'an holds it up as the incomplete example so 2:201 can follow as the praised model; uncontroversial in tafsir, not a contested question. Publishing it alone would have a reader reciting the exact prayer the Qur'an presents as lacking. 2:201 already exists as the rank-2 famous dua ("rabbana atina fid-dunya hasanah"), so routing out 2:200 loses nothing and protects the real page. |
| 2 | Qur'an 6:128 | Our Lord, some of us made use of others, and we have [now] reached our term which You appointed for us. | Speech of jinn and men on the Day of Judgement. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 3 | Qur'an 7:38 | Our Lord, these had misled us, so give them a double punishment of the Fire. | The damned in the Fire asking for their misleaders to be doubly punished. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 4 | Qur'an 14:44 | Our Lord, delay us for a short term; we will answer Your call and follow the messengers. | The wrongdoers on the Day of Judgement asking to be sent back. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 5 | Qur'an 15:36 | My Lord, then reprieve me until the Day they are resurrected. | Speech of Iblis, asking to be reprieved until the Day of Resurrection. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed (speech of Iblis). |
| 6 | Qur'an 15:39 | My Lord, because You have put me in error, I will surely make [disobedience] attractive to them [i.e., mankind] on earth, and I will mislead them all | Speech of Iblis, vowing to make disobedience attractive to mankind. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed (speech of Iblis). |
| 7 | Qur'an 16:86 | Our Lord, these are our partners [to You] whom we used to invoke [in worship] besides You. | The polytheists pointing to their idols on the Day of Judgement. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 8 | Qur'an 20:125 | My Lord, why have you raised me blind while I was [once] seeing? | The one raised blind on the Day of Judgement, asking why. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 9 | Qur'an 20:134 | Our Lord, why did You not send to us a messenger so we could have followed Your verses [i.e., teachings] before we were humiliated and disgraced? | The damned asking why no messenger was sent to them. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 10 | Qur'an 23:106 | Our Lord, our wretchedness overcame us, and we were a people astray. | The damned admitting their wretchedness in the Fire. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 11 | Qur'an 23:107 | Our Lord, remove us from it, and if we were to return [to evil], we would indeed be wrongdoers. | The damned asking to be removed from the Fire. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 12 | Qur'an 28:47 | Our Lord, why did You not send us a messenger so we could have followed Your verses and been among the believers? | The damned asking why no messenger was sent. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 13 | Qur'an 28:63 | Our Lord, these are the ones we led to error. We led them to error just as we were in error. We declare our disassociation [from them] to You. They did not used to worship [i.e., obey] us. | Those who misled others disowning them on the Day of Judgement. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 14 | Qur'an 32:12 | Our Lord, we have seen and heard, so return us [to the world]; we will work righteousness. Indeed, we are [now] certain. | The criminals asking to be returned to the world. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 15 | Qur'an 33:67 | Our Lord, indeed we obeyed our masters and our dignitaries, and they led us astray from the [right] way. | The damned blaming their leaders. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 16 | Qur'an 33:68 | Our Lord, give them double the punishment and curse them with a great curse. | The damned asking that their leaders be doubly punished. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 17 | Qur'an 34:19 | Our Lord, lengthen the distance between our journeys | Already flagged `contextual`: the people of Saba asking for hardship in their travels, and punished for it. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed (Saba ingratitude, punished). |
| 18 | Qur'an 35:37 | Our Lord, remove us; we will do righteousness - other than what we were doing! | The damned asking to be removed so they may do righteousness. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 19 | Qur'an 38:16 | Our Lord, hasten for us our share [of the punishment] before the Day of Account. | The mockers asking for their share of punishment to be hastened. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 20 | Qur'an 38:61 | Our Lord, whoever brought this upon us - increase for him double punishment in the Fire. | The damned asking for double punishment on whoever brought it upon them. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 21 | Qur'an 40:11 | Our Lord, You made us lifeless twice and gave us life twice, and we have confessed our sins. So is there to an exit any way? | The damned confessing their sins and asking for a way out. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 22 | Qur'an 41:29 | Our Lord, show us those who misled us of the jinn and men [so] we may put them under our feet that they will be among the lowest. | The damned asking to see those who misled them. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 23 | Qur'an 50:27 | Our Lord, I did not make him transgress, but he [himself] was in extreme error. | Satan's companion disowning him on the Day of Judgement. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |
| 24 | Qur'an 63:10 | My Lord, if only You would delay me for a brief term so I would give charity and be of the righteous. | The one who neglected charity, asking at death to be delayed. | **Confirm route-out** | Owner (Morshed Milon), 2026-08-03: confirmed. |

### Arabic for Part 1

Speaker attribution is usually visible in the Arabic, so it is given separately here at full length.

**Qur'an 2:200** (`quran:2:200`)

> رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا وَمَا لَهُۥ فِى ٱلْـَٔاخِرَةِ مِنْ خَلَـٰقٍ

**Qur'an 6:128** (`quran:6:128`)

> رَبَّنَا ٱسْتَمْتَعَ بَعْضُنَا بِبَعْضٍ وَبَلَغْنَآ أَجَلَنَا ٱلَّذِىٓ أَجَّلْتَ لَنَا ۚ قَالَ ٱلنَّارُ مَثْوَىٰكُمْ خَـٰلِدِينَ فِيهَآ إِلَّا مَا شَآءَ ٱللَّهُ ۗ إِنَّ رَبَّكَ حَكِيمٌ عَلِيمٌ

**Qur'an 7:38** (`quran:7:38`)

> رَبَّنَا هَـٰٓؤُلَآءِ أَضَلُّونَا فَـَٔاتِهِمْ عَذَابًا ضِعْفًا مِّنَ ٱلنَّارِ ۖ قَالَ لِكُلٍّ ضِعْفٌ وَلَـٰكِن لَّا تَعْلَمُونَ

**Qur'an 14:44** (`quran:14:44`)

> رَبَّنَآ أَخِّرْنَآ إِلَىٰٓ أَجَلٍ قَرِيبٍ نُّجِبْ دَعْوَتَكَ وَنَتَّبِعِ ٱلرُّسُلَ ۗ أَوَلَمْ تَكُونُوٓا۟ أَقْسَمْتُم مِّن قَبْلُ مَا لَكُم مِّن زَوَالٍ

**Qur'an 15:36** (`quran:15:36`)

> رَبِّ فَأَنظِرْنِىٓ إِلَىٰ يَوْمِ يُبْعَثُونَ

**Qur'an 15:39** (`quran:15:39`)

> رَبِّ بِمَآ أَغْوَيْتَنِى لَأُزَيِّنَنَّ لَهُمْ فِى ٱلْأَرْضِ وَلَأُغْوِيَنَّهُمْ أَجْمَعِينَ

**Qur'an 16:86** (`quran:16:86`)

> رَبَّنَا هَـٰٓؤُلَآءِ شُرَكَآؤُنَا ٱلَّذِينَ كُنَّا نَدْعُوا۟ مِن دُونِكَ ۖ فَأَلْقَوْا۟ إِلَيْهِمُ ٱلْقَوْلَ إِنَّكُمْ لَكَـٰذِبُونَ

**Qur'an 20:125** (`quran:20:125`)

> رَبِّ لِمَ حَشَرْتَنِىٓ أَعْمَىٰ وَقَدْ كُنتُ بَصِيرًا

**Qur'an 20:134** (`quran:20:134`)

> رَبَّنَا لَوْلَآ أَرْسَلْتَ إِلَيْنَا رَسُولًا فَنَتَّبِعَ ءَايَـٰتِكَ مِن قَبْلِ أَن نَّذِلَّ وَنَخْزَىٰ

**Qur'an 23:106** (`quran:23:106`)

> رَبَّنَا غَلَبَتْ عَلَيْنَا شِقْوَتُنَا وَكُنَّا قَوْمًا ضَآلِّينَ

**Qur'an 23:107** (`quran:23:107`)

> رَبَّنَآ أَخْرِجْنَا مِنْهَا فَإِنْ عُدْنَا فَإِنَّا ظَـٰلِمُونَ

**Qur'an 28:47** (`quran:28:47`)

> رَبَّنَا لَوْلَآ أَرْسَلْتَ إِلَيْنَا رَسُولًا فَنَتَّبِعَ ءَايَـٰتِكَ وَنَكُونَ مِنَ ٱلْمُؤْمِنِينَ

**Qur'an 28:63** (`quran:28:63`)

> رَبَّنَا هَـٰٓؤُلَآءِ ٱلَّذِينَ أَغْوَيْنَآ أَغْوَيْنَـٰهُمْ كَمَا غَوَيْنَا ۖ تَبَرَّأْنَآ إِلَيْكَ ۖ مَا كَانُوٓا۟ إِيَّانَا يَعْبُدُونَ

**Qur'an 32:12** (`quran:32:12`)

> رَبَّنَآ أَبْصَرْنَا وَسَمِعْنَا فَٱرْجِعْنَا نَعْمَلْ صَـٰلِحًا إِنَّا مُوقِنُونَ

**Qur'an 33:67** (`quran:33:67`)

> رَبَّنَآ إِنَّآ أَطَعْنَا سَادَتَنَا وَكُبَرَآءَنَا فَأَضَلُّونَا ٱلسَّبِيلَا۠

**Qur'an 33:68** (`quran:33:68`)

> رَبَّنَآ ءَاتِهِمْ ضِعْفَيْنِ مِنَ ٱلْعَذَابِ وَٱلْعَنْهُمْ لَعْنًا كَبِيرًا

**Qur'an 34:19** (`quran:34:19`)

> رَبَّنَا بَـٰعِدْ بَيْنَ أَسْفَارِنَا وَظَلَمُوٓا۟ أَنفُسَهُمْ فَجَعَلْنَـٰهُمْ أَحَادِيثَ وَمَزَّقْنَـٰهُمْ كُلَّ مُمَزَّقٍ ۚ إِنَّ فِى ذَٰلِكَ لَـَٔايَـٰتٍ لِّكُلِّ صَبَّارٍ شَكُورٍ

**Qur'an 35:37** (`quran:35:37`)

> رَبَّنَآ أَخْرِجْنَا نَعْمَلْ صَـٰلِحًا غَيْرَ ٱلَّذِى كُنَّا نَعْمَلُ ۚ أَوَلَمْ نُعَمِّرْكُم مَّا يَتَذَكَّرُ فِيهِ مَن تَذَكَّرَ وَجَآءَكُمُ ٱلنَّذِيرُ ۖ فَذُوقُوا۟ فَمَا لِلظَّـٰلِمِينَ مِن نَّصِيرٍ

**Qur'an 38:16** (`quran:38:16`)

> رَبَّنَا عَجِّل لَّنَا قِطَّنَا قَبْلَ يَوْمِ ٱلْحِسَابِ

**Qur'an 38:61** (`quran:38:61`)

> رَبَّنَا مَن قَدَّمَ لَنَا هَـٰذَا فَزِدْهُ عَذَابًا ضِعْفًا فِى ٱلنَّارِ

**Qur'an 40:11** (`quran:40:11`)

> رَبَّنَآ أَمَتَّنَا ٱثْنَتَيْنِ وَأَحْيَيْتَنَا ٱثْنَتَيْنِ فَٱعْتَرَفْنَا بِذُنُوبِنَا فَهَلْ إِلَىٰ خُرُوجٍ مِّن سَبِيلٍ

**Qur'an 41:29** (`quran:41:29`)

> رَبَّنَآ أَرِنَا ٱلَّذَيْنِ أَضَلَّانَا مِنَ ٱلْجِنِّ وَٱلْإِنسِ نَجْعَلْهُمَا تَحْتَ أَقْدَامِنَا لِيَكُونَا مِنَ ٱلْأَسْفَلِينَ

**Qur'an 50:27** (`quran:50:27`)

> رَبَّنَا مَآ أَطْغَيْتُهُۥ وَلَـٰكِن كَانَ فِى ضَلَـٰلٍۭ بَعِيدٍ

**Qur'an 63:10** (`quran:63:10`)

> رَبِّ لَوْلَآ أَخَّرْتَنِىٓ إِلَىٰٓ أَجَلٍ قَرِيبٍ فَأَصَّدَّقَ وَأَكُن مِّنَ ٱلصَّـٰلِحِينَ

---

## Part 2 — Narrative-statement candidates

**The spec states these are 19 records but does not enumerate them, and no register in the
repository identifies them by id.** Deciding whether a passage is a supplication or a narrative
statement is tafsir-level adjudication, which §1.3 explicitly places outside this project's
competence. So this section does **not** claim to be "the 19".

What follows is a **candidate pool built on one stated, mechanical signal**: the English reads as
a third-person report or an instruction to a person, rather than as an address to Allah. It is
offered as a starting set to narrow the reviewer's search, not as a finding. The true set may be
larger or smaller, and membership here is not evidence of anything.

§1.3 names `11:45` (Nuh's appeal, rebuked in the following verse) as the case where a
plausible-looking reading produces a badly wrong page. It is included below where present.

Candidates surfaced: **10**

| # | id | Chapter | English | Citation | **Reviewer ruling** (narrative / supplication) | **Notes** |
|---|---|---|---|---|---|---|
| 1 | `15:26` | What to say upon hearing the Athan (call to pr | One should also supplicate for himself during the time between the athan and the iqamah as supplication at such time is not rejected. | not recorded | **Supplication** | Owner (Morshed Milon), 2026-08-03: keep as supplication. |
| 2 | `31:114` | What to do if you have a bad dream or nightmar | [((Spit on your left three times)(Spit: A form of spitting comprising mainly of air with little spittle)) - (Seek refuge in Allah from shaytan and the evil of what you sa | not recorded | **Supplication** | Owner (Morshed Milon), 2026-08-03: keep — the "seek refuge in Allah from shaytan" content is recitable. |
| 3 | `31:115` | What to do if you have a bad dream or nightmar | (Get up and pray if you so desire.) | not recorded | **Narrative statement** | Owner (Morshed Milon), 2026-08-03: pure instruction, no recitation text — remove from dua corpus. |
| 4 | `40:134` | Invocations for if you are stricken by in your | (He should say: (I have believed in Allah and His Messenger.)) | not recorded | **Narrative statement** | Owner (Morshed Milon), 2026-08-03: ruled narrative (the "He should say" frame). Embedded phrase "I have believed in Allah and His Messenger" noted but not kept as a corpus dua. |
| 5 | `40:135` | Invocations for if you are stricken by in your | (He should also recite the following verse: (He is The First and The Last, Aththahir and Al-Batin and He knows well all things.)(ththahir: Indicates the greatness of His | not recorded | **Narrative statement** | Owner (Morshed Milon), 2026-08-03: instruction to recite Qur'an 57:3 (an ayah, not a dua) — remove from dua corpus. |
| 6 | `113:231` | How a Muslim should praise another Muslim | (He said: ‘If anyone of you is impelled to praise his brother, then he should say: ‘I deem so-and-so to be…and Allah is his reckoner…and I don’t praise anyone, putting it | not recorded | **Narrative statement** | Owner (Morshed Milon), 2026-08-03: hadith narrative / praise etiquette addressed to people, not to Allah — remove from dua corpus. |
| 7 | `129:249` | Repentance and seeking forgiveness | (He also said: ‘O People, Repent! Verily I repent to Allah, a hundred times a day.) | not recorded | **Narrative statement** | Owner (Morshed Milon), 2026-08-03: exhortation to people ("O People, Repent!"), not an address to Allah — remove from dua corpus. |
| 8 | `129:251` | Repentance and seeking forgiveness | (He said: ‘The nearest the Lord comes to His servant is in the middle of the night, so if you are able to be of those who remember Allah at that time, then be so.) | not recorded | **Narrative statement** | Owner (Morshed Milon), 2026-08-03: teaching statement about when to remember Allah, no recitation text — remove from dua corpus. |
| 9 | `129:252` | Repentance and seeking forgiveness | (He also said: ‘The nearest a servant is to his Lord is when he is prostrating, so supplicate much therein.) | not recorded | **Narrative statement** | Owner (Morshed Milon), 2026-08-03: teaching + instruction to supplicate, no worded dua — remove from dua corpus. |
| 10 | `130:254` | The excellence of remembering Allah | (Whoever says:(How perfect Allah is and I praise Him.) a hundred times during the day, his sins are wiped away, even if they are like the foam of the sea.) | not recorded | **Narrative statement** | Owner (Morshed Milon), 2026-08-03: ruled narrative (reward/virtue frame). Embedded dhikr "Subhan Allah wa bihamdih" noted but not kept as a corpus dua under this record. |

### Arabic for Part 2

**`15:26`** — What to say upon hearing the Athan (call to prayer)

> ((يَدْعُو لِنَفسِهِ بَيْنَ الْأَذَانِ وَالْإِقَامَةِ فَإِنَّ الدُّعَاءَ حِينَئِذٍ لاَ يُرَدُّ)).

**`31:114`** — What to do if you have a bad dream or nightmare

> ((يَنْفُثُ عَنْ يَسَارِهِ)) (ثلاثاً).

**`31:115`** — What to do if you have a bad dream or nightmare

> ((ويَقُومُ يُصَلِّي إِنْ أَرَادَ ذَلِكَ)).

**`40:134`** — Invocations for if you are stricken by in your faith

> ((يَقُولُ: ((آمَنْتُ بِاللَّهِ وَرُسُلِهِ)).

**`40:135`** — Invocations for if you are stricken by in your faith

> ((يَقْرَأُ قَوْلَهُ تَعَالَى: ﴿هُوَ الْأوَّلُ وَالْآخِرُ وَالظّاهِرُ وَالْباطِنُ وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ﴾)).

**`113:231`** — How a Muslim should praise another Muslim

> قَالَ النَّبِيُّ صلى الله عليه وسلم: ((إِذَا كَانَ أَحَدُكُم مَادِحاً صَاحِبَهُ لاَ مَحَالَةَ فَلْيَقُلْ: أَحْسِبُ فُلاَناً وَاللَّهُ حَسِيبُهُ، وَلاَ أُزَكِّي عَلَى اللَّهِ أَحَداً، أَحْسِبُهُ – إِنْ كَانَ يَعْلَمُ ذَاكَ – كَذَا وَكَذَا)).

**`129:249`** — Repentance and seeking forgiveness

> وَقَالَ صلى الله عليه وسلم: ((يَا أَيُّهَا النَّاسُ تُوبُوا إِلَى اللَّهِ فَإِنِّي أَتُوبُ فِي الْيَوْمِ إِلَيْهِ مِائَةَ مَرَّةٍ)).

**`129:251`** — Repentance and seeking forgiveness

> وَقَالَ صلى الله عليه وسلم: ((أَقْرَبُ مَا يَكُونُ الرَّبُّ مِنَ الْعَبْدِ فِي جَوْفِ اللَّيْلِ الآخِرِ فَإِنِ اسْتَطَعْتَ أَنْ تَكُونَ مِمَّنْ يَذْكُرُ اللَّهَ فِي تِلْكَ السَّاعَةِ فَكُنْ)).

**`129:252`** — Repentance and seeking forgiveness

> وَقَالَ صلى الله عليه وسلم: ((أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكثِرُوا الدُّعَاءَ)).

**`130:254`** — The excellence of remembering Allah

> قَالَ صلى الله عليه وسلم مَنْ قَالَ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَلَوْ كَانَتْ مِثْلَ زَبَدِ الْبَحْر)).

---

## Part 3 — Transliteration gap — 75 records, not the 38 previously quoted

> ### ⚠ Workload change — please read before committing your time
> An earlier estimate put this section at roughly **38** records. The correct figure is **75**.
> The spec's Gate 2 figure (~28 for Track A) was measured before commit `2a7b68b` nulled 37
> contaminated transliterations in the corpus; those records now have no transliteration at all,
> so the gap grew by exactly 37. Adding the 10 newly ingested Qur'anic verses gives 75.
> Nothing was hidden and nothing changed in the underlying texts — the earlier number was
> simply stale. **This roughly doubles Part 3.** Parts 1, 2, 4 and 5 are unaffected.

Gate 2 rule, unchanged from v1.1 §A1: **sourced or reviewed, never machine-generated and
shipped unread; no page ships without it.**

A transliteration is needed for each record below. It must come from a published edition the
reviewer can name, or be written by the reviewer. We will not generate it.

- **Track A (occasion chapters), active: 65**
- **Newly ingested Qur'anic verses: 10** — added 2026-08-02 from quran.com edition 19 (Pickthall, public domain)
- Track A but already routed out under Gate 1 (listed for completeness, **no work needed unless Part 1 reverses**): 0
- **Total requiring a transliteration: 75**

### 3a — Track A

| # | id | Chapter | Arabic | English | **Transliteration (reviewer)** | **Source named** |
|---|---|---|---|---|---|---|
| 1 | `27:77` | Words of remembrance for morning and eve | ((أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيرَ مَا بَعْدَهُ ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ)). [ وإذا أمسى قال: أمسينا وأمسى الملك للَّه] [وإذا أمسى قال: رب أسألك خير ما في هذه الليلة، وخير ما بعدها، وأعوذ بك من شر ما في هذه الليلة، وشر ما بعدها.] | ‘We have reached the morning and at this very time unto Allaah, belongs all sovereignty , and all praise is fo | | |
| 2 | `15:22` | What to say upon hearing the Athan (call | يَقُولُ مِثْلَ مَا يَقُولُ المُؤَذِّنُ إِلاَّ فِي ((حَيَّ عَلَى الصَّلَاةِ وَحَيَّ عَلَى الْفَلَاحِ)) فَيقُولُ: ((لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ)). | ‘One repeats just as the mu-aththin (one who calls to prayer) says, except when he says: Hayya AAalas-salah (o | | |
| 3 | `15:23` | What to say upon hearing the Athan (call | يَقُولُ: ((وَأَنَا أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ وَأَنَّ مُحَمَّداً عَبْدُهُ وَرَسُولُهُ، رَضِيتُ بِاللَّهِ رَبَّاً، وَبِمُحَمَّدٍ رَسُولاً، وَبِالْإِسْلاَمِ دِينَاً)) ((يَقُولُ ذَلِكَ عَقِبَ تَشَهُّدِ الْمُؤَذِّنِ)). | Immediately following the declaration of faith called by the mu-aththin, one says:‘And I too bear witness that | | |
| 4 | `15:26` | What to say upon hearing the Athan (call | ((يَدْعُو لِنَفسِهِ بَيْنَ الْأَذَانِ وَالْإِقَامَةِ فَإِنَّ الدُّعَاءَ حِينَئِذٍ لاَ يُرَدُّ)). | One should also supplicate for himself during the time between the athan and the iqamah as supplication at suc | | |
| 5 | `19:46` | Invocations during Sujood | ((اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ: دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلاَنِيَّتَهُ وَسِرَّهُ)). | O Allah! Forgive all my sins, the small and the great, first and the last, the open and the secret. | | |
| 6 | `22:52` | Invocation for At-Tashahhud (sitting in | ((التَّحِيَّاتُ لِلَّهِ، وَالصَّلَواتُ، وَالطَّيِّباتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّداً عَبْدُهُ وَرَسولُهُ)). | Allah compliments, prayers and pure words are due to Allah. Peace be upon you, O Prophet, and the mercy of All | | |
| 7 | `24:60` | Invocations after the final Tash-ahhud a | ((اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبُخْلِ، وَأَعوذُ بِكَ مِنَ الْجُبْنِ، وَأَعُوذُ بِكَ مِنْ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الدُّنْيَا وَعَذَابِ الْقَبْرِ)). | O Allah, I seek refuge with You from miserliness, and I seek refuge with You from cowardice, and I seek refuge | | |
| 8 | `26:74` | Istikharah (seeking Allah's Counsel) | قَالَ جَابرُ بْنُ عَبْدِ اللَّهِ رَضِيَ اللَّهُ عَنْهُمَا: كَانَ رسُولُ اللَّهِ صلى الله عليه وسلم يُعَلِّمُنَا الْاسْتِخَارَةَ فِي الْأُمُورِ كُلِّهَا كَمَا يُعَلِّمُنَا السُّورَةَ مِنَ الْقُرْآنِ، يَقُولُ: ((إِذَا هَمَّ أَحَدُكُمْ بِالْأَمْرِ فَلْيَرْكَعْ رَكْعَتَيْنِ مِنْ غَيْرِ الْفَرِيضَةِ، ثُمَّ لْيَقُلْ: اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ؛ فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأمْرَ - وَيُسَمِّي حَاجَتَهُ - خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ - فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ – فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ، ثُمَّ أَرْضِنِي بِهِ)).وَمَا نَدِمَ مَنِ اسْتَخَارَ الْخَالِقَ، وَشَاوَرَ الْمَخْلُوقِينَ الْمُؤْمِنِينَ وَتَثَبَّتَ فِي أَمْرِهِ، فَقَدْ قَالَ اللَّه تعالى: ﴿وَشاوِرْهُمْ فِي الْأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾ . | O Allah, I seek Your counsel by Your knowledge and by Your power I seek strength and I ask You from Your immen | | |
| 9 | `31:114` | What to do if you have a bad dream or ni | ((يَنْفُثُ عَنْ يَسَارِهِ)) (ثلاثاً). | [((Spit on your left three times)(Spit: A form of spitting comprising mainly of air with little spittle)) - (S | | |
| 10 | `31:115` | What to do if you have a bad dream or ni | ((ويَقُومُ يُصَلِّي إِنْ أَرَادَ ذَلِكَ)). | (Get up and pray if you so desire.) | | |
| 11 | `33:119` | What to say immediately following the Wi | ((سُبْحَانَ المَلِكِ القُدُّوسِ)) ثلاثَ مرَّاتٍ والثَّالِثَةُ يَجْهَرُ بها ويَمُدُّ بها صَوتَهُ يقولُ: [رَبِّ الْمَلاَئِكَةِ وَالرُّوحِ])). | (How perfect The King, The Holy One is.(three times) on the third time he would raise his voice, elongate it a | | |
| 12 | `35:125` | Invocations for anguish | ((اللَّهُ اللَّهُ رَبِّي لاَ أُشْرِكُ بِهِ شَيْئاً)). | (Allah, Allah is my Lord, I do not associate anything with Him.) | | |
| 13 | `44:140` | What to say and do if you commit a sin | ((مَا مِنْ عَبْدٍ يُذنِبُ ذَنْباً فَيُحْسِنُ الطُّهُورَ، ثُمَّ يَقُومُ فَيُصَلِّي رَكْعَتَيْنِ، ثُمَّ يَسْتَغْفِرُ اللَّهَ إِلاَّ غَفَرَ اللَّهُ لَهُ)). | (Any servant who commits a sin and as a result, performs ablution, prays two units of prayer (i.e. two rakAAas | | |
| 14 | `45:141` | Invocations against the Devil and his pr | ((الْاسْتِعَاذَةُ بِاللَّهِ مِنْهُ)). | Seeking refuge from him. | | |
| 15 | `45:142` | Invocations against the Devil and his pr | الْأَذَانُ | The Adhaan [call to prayer]. | | |
| 16 | `45:143` | Invocations against the Devil and his pr | ((الْأَذْكَارُ وَقِرَاءَةُ الْقُرْآنِ)). | (Recitation of the Quran and the authentic texts of remembrance and supplications.)(e.g. ‘Do not make your hom | | |
| 17 | `47:145` | Congratulations for new parents and how | ((بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ)). وَيَرُدُّ عَلَيْهِ الْمُهَــــــنَّأُ فَيَقُولُ: ((بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ، وَجَزَاكَ اللَّهُ خَيْراً، وَرَزَقَكَ اللَّهُ مِثْلَهُ، وَأَجْزَلَ ثَوَابَكَ)). | May Allah bless you with His gift to you and may you (the new parent) give thanks, may the child reach the mat | | |
| 18 | `48:146` | How to seek Allah's protection for child | كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم يُعَوِّذُ الحَسَنَ وَالحُسَينَ رضي الله عنهما ((أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لاَمَّةٍ)). | I commend you two to the protection of Allah's perfect words from every devil, vermin, and every evil eye. | | |
| 19 | `51:151` | Invocations of the terminal ill | ((جَعَلَ النَّبِيُّ صلى الله عليه وسلم عِنْدَ مَوْتِهِ يُدْخِلُ يَدَيْهِ فِي الْمَاءِ فَيَمْسَحُ بِهِمَا وَجْهَهُ، وَيَقُولُ: لاَ إِلَهَ إِلاَّ اللَّهُ إِنَّ لِلْمَوْتِ سَكَرَاتٍ)). | None has the right to be worshipped except Allah, death does indeed contain agony. | | |
| 20 | `52:153` | What to encourage the dying person to sa | ((مَنْ كَانَ آخِرُ كَلاَمِهِ لاَ إِلَهَ إِلاَّ اللَّهُ دَخَلَ الْجَنَّةَ)). | i.e. those around the sick should instruct and encourage him to say the shahadah. (He whose last words are: (N | | |
| 21 | `55:157` | Invocations for the dead in the Funeral | ((اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا، وَشَاهِدِنَا وَغَائِبِنَا، وَصَغِيرِنَا وَكَبيرِنَا، وَذَكَرِنَا وَأُنْثَانَا. اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلاَمِ، وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الإِيمَانِ، اللَّهُمَّ لاَ تَحْرِمْنَا أَجْرَهُ، وَلاَ تُضِلَّنَا بَعْدَهُ)). | O Allah, forgive our living and our dead, those who are present and those who are absent, our young and our ol | | |
| 22 | `55:158` | Invocations for the dead in the Funeral | ((اللَّهُمَّ إِنَّ فُلاَنَ بْنَ فُلاَنٍ فِي ذِمَّتِكَ، وَحَبْلِ جِوَارِكَ، فَقِهِ مِنْ فِتْنَةِ الْقَبْرِ، وَعَذَابِ النَّارِ، وَأَنْتَ أَهْلُ الْوَفَاءِ وَالْحَقِّ، فَاغْفِرْ لَهُ وَارْحَمْهُ إِنَّكَ أَنْتَ الغَفُورُ الرَّحيمُ)). | O Allah, so-and-so the son of so-and-so is in Your case and under Your protection. Protect him from the trial | | |
| 23 | `61:167` | Invocations for when the wind blows | ((اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَخَيْرَ مَا فِيهَا، وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ مَا فِيهَا، وَشَرِّ مَا أُرْسِلَتْ بِهِ)). | O Allah, I beg of You its good and the good of that which it contains and the good of the purpose for which it | | |
| 24 | `69:178` | Invocations before eating | ((إِذَا أَكَلَ أَحَدُكُمْ طَعَاماً فَلْيَقُلْ بِسْمِ اللَّهِ، فَإِنْ نَسِيَ فِي أَوَّلِهِ فَلْيَقُلْ بسمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ)). | (When you are about to eat, you should say:(Bismil-lah.)and if you forget to say it before starting, then you | | |
| 25 | `77:188` | Invocation for sneezing | ((إِذَا عَطَسَ أَحَدُكُم فَلْيَقُلِ الْحَمْدُ لِلَّهِ، وَلْيَقُلْ لَهُ أَخُوهُ أَوْ صَاحِبُهُ: يَرْحَمُكَ اللَّهُ، فَإِذَا قَالَ لَهُ: يَرحَمُكَ اللَّهُ، فَلْيَقُلْ: يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ)). | (When one of you sneezes he should say:(All praise if for Allah.) and his brother or companion should say to h | | |
| 26 | `80:191` | The groom’s supplication on the wedding | إِذَا تَزَوَّجَ أَحَدُكُمُ امْرَأَةً، أَوْ إِذَا اشْتَرَى خَادِماً فَلْيَقُلْ: ((اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ، وَإِذَا اشْتَرَى بَعِيراً فَلْيَأْخُذْ بِذِرْوَةِ سَنَامِهِ وَلْيَقُلْ مِثْلَ ذَلِكَ)). | (when you marry a woman or buy a maidservant, you should say:(O Allah, I ask You for the goodness within her a | | |
| 27 | `84:195` | What to say while sitting in an assembly | ((عَنِ ابْنِ عُمَرَ رضي الله عنه قَاَلَ: كَانَ يُعَدُّ لِرَسُولِ اللَّهِ صلى الله عليه وسلم فِي الْمَجْلِسِ الوَاحِدِ مِائَةُ مَرَّةٍ مِنْ قَبْلِ أَنْ يَقُومَ: ((رَبِّ اغْفِرْ لِي، وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الغَفُورُ)). | O my Lord, forgive me and turn towards me (to accept my repentance). Verily You are The Oft-Returning, The Oft | | |
| 28 | `86:197` | vocation for someone who says: May Allah | ((وَلَكَ)). | And you. | | |
| 29 | `87:198` | Invocation for someone who does good to | ((جَزَاكَ اللَّهُ خَيْراً)). | (If someone does you a favour and you say: (May Allah reward you with goodness.) then you have indeed excelled | | |
| 30 | `88:199` | Invocation for Allah's protection from t | ((مَنْ حَفِظَ عَشْرَ آيَاتٍ مِنْ أَوَّلِ سُورَةِ الْكَهْفِ عُصِمَ مِنَ الدَّجَّالِ)) ، وَالْاسْتِعَاذَةُ بِاللَّهِ مِنْ فِتْنَتِهِ عَقِبَ التَّشَهُّدِ الْأَخِيرِ مِنْ كُلِّ صَلاَةٍ. | (Dajjal: among the great signs of the last hour and the greatest trials to befall mankind, which every Prophet | | |
| 31 | `92:203` | Invocation for fear of Shirk | ((اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لاَ أَعْلَمُ)). | (shirk: to associate others with Allah in those things which are specific to Him. This can occur in (1) belief | | |
| 32 | `93:204` | Invocation for someone who tells you: Ma | ((وَفِيكَ بَارَكَ اللَّهُ)). | And may Allah bless them. | | |
| 33 | `94:205` | Invocation against evil portent | ((اللَّهُمَّ لاَ طَيْرَ إِلاَّ طَيْرُكَ، وَلاَ خَيْرَ إِلاَّ خَيْرُكَ، وَلاَ إِلَهَ غَيْرُكَ)). | (This supplication is used whenever one initially thinks a casual event or occurrence to foretell good or evil | | |
| 34 | `96:207` | Invocation for traveling | اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، ﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ﴾ ((اللَّهُمَّ إِنّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا البِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَليفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ))، وإذا رَجَعَ قَالَهُنَّ وَزَادَ فِيهِنَّ: ((آيِبُونَ، تائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ)). | Allah is the greatest, Allah is the greatest, Allah is the greatest, How perfect He is, The One Who has placed | | |
| 35 | `102:214` | Glorifying and magnifying Allah on the j | قَالَ جَابِرٌ رضي الله عنه: ((كُنَّا إِذَا صَعَدْنَا كَبَّرْنَا، وَإِذَا نَزَلْنَا سَبَّحْنَا)). | Jabir said: Whenever we went up a hill we would say Allaahu 'Akber (Allah is the Most Great) and when we desce | | |
| 36 | `105:217` | What to say upon returning from a Journe | ((يُكَبِّرُ عَلَى كُلِّ شَرَفٍ ثَلاَثَ تَكْبِيرَاتٍ ثُمَّ يَقُولُ: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنا حَامِدُونَ، صَدَقَ اللَّهُ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزابَ وَحْدَهُ)). | Allah is the greatest, Allah is the greatest, Allah is the greatest. None has the right to be worshipped excep | | |
| 37 | `106:218` | What to say if something happens to plea | كَانَ النَّبِيُّ صلى الله عليه وسلم إِذَا أَتَاهُ الْأَمْرُ يَسُرُّهُ قَالَ: ((الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ)) وَإِذَا أَتَاهُ الْأَمْرُ يَكْرَهُهُ قَالَ: ((الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ)). | Praise is to Allah Who by His blessings all good things are perfected. — And upon what displeases: Praise is t | | |
| 38 | `108:225` | spreading the greetings of Salam (Peace) | ((ثَلاَثٌ مَنْ جَمَعَهُنَّ فَقَدْ جَمَعَ الْإِيمَانَ: الْإِنْصَافُ مِنْ نَفْسِكَ، وَبَذْلُ السَّلاَمِ لِلْعَالَمِ، وَالْإِنْفَاقُ مِنَ الإِقْتَارِ)). | (Aammar said: ‘Three characteristics, whoever combines them, has completed his faith: to be just, to spread gr | | |
| 39 | `109:227` | How to reply to a disbeliever if he says | ((إذَا سَلَّمَ عَلَيْكُمْ أَهْلُ الْكِتَابِ فَقُولُوا: وَعَلَيْكُمْ)). | (When the people of the Book greet you, reply by saying: (And upon you.)) | | |
| 40 | `110:228` | Invocation upon hearing the cock's crow | ((إِذَا سَمِعْتُمْ صِيَاحَ الدِّيَكَةِ فَاسْأَلُوا اللَّهَ مِنْ فَضْلِهِ؛ فَإِنَّهَا رَأَتْ مَلَكاً وَإِذَا سَمِعْتُمْ نَهِيقَ الْحِمَارِ فَتَعَوَّذُوا بِاللَّهِ مِنَ الشَّيطَانِ؛ فَإِنَّهُ رَأَى شَيْطَاناً)). | (If you hear the crow of a rooster, ask Allah for his bounty for it has seen an angel and if you hear the bray | | |
| 41 | `111:229` | Invocation upon hearing a dog barking in | ((إِذَا سَمِعْتُمْ نُبَاحَ الْكِلاَبِ وَنَهِيقَ الْحَمِيرِ بِاللَّيْلِ فَتَعَوَّذُوا بِاللَّهِ مِنْهُنَّ؛ فَإِنَّهُنَّ يَرَيْنَ مَا لاَ تَرَوْنَ)). | (If you hear the barking of dogs or the braying of asses at night, seek refuge in Allah for they see what you | | |
| 42 | `113:231` | How a Muslim should praise another Musli | قَالَ النَّبِيُّ صلى الله عليه وسلم: ((إِذَا كَانَ أَحَدُكُم مَادِحاً صَاحِبَهُ لاَ مَحَالَةَ فَلْيَقُلْ: أَحْسِبُ فُلاَناً وَاللَّهُ حَسِيبُهُ، وَلاَ أُزَكِّي عَلَى اللَّهِ أَحَداً، أَحْسِبُهُ – إِنْ كَانَ يَعْلَمُ ذَاكَ – كَذَا وَكَذَا)). | (He said: ‘If anyone of you is impelled to praise his brother, then he should say: ‘I deem so-and-so to be…and | | |
| 43 | `115:233` | The pilgrim's announcement of his arriva | ((لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ، وَالنِّعْمَةَ، لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ)). | Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and blessings are | Labbayka-llāhumma labbayk, labbayka lā sharīka laka labbayk, inna-l-ḥamda wa-n-niʿmata laka wa-l-mulk, lā sharīka lak. | ✅ **Reviewer-written (adopted).** Owner-reviewer Morshed Milon (ADR-044), 2026-08-03: standard ALA-LC rendering of a well-known phrase, machine-proposed by Claude then read and **adopted by the reviewer as their own** — not quoted from any specific edition, so no edition is cited. Read, not machine-shipped-unread → satisfies Gate 2 (§A1: "sourced or reviewed"). |
| 44 | `116:234` | Saying Allahu Akbar when passing the Bla | ((طَافَ النَّبيُّ صلى الله عليه وسلم بِالْبَيْتِ عَلَى بَعِيرٍ كُلَّمَا أَتَى الرُّكْنَ أَشَارَ إِلَيْهِ بِشَيْءٍ عِنْدَهُ وَكَبَّرَ)). | Allah is the greatest. | | |
| 45 | `118:236` | Invocation to be recited while standing | لَمَّا دَنَا النَّبِيُّ صلى الله عليه وسلم مِنَ الصَّفَا قَرَأَ: ﴿إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَآئِرِ اللَّهِ﴾ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ)) فَبَدَأَ بِالصَّفَا فَرَقِيَ عَلَيْهِ حَتَّى رَأَى الْبَيْتَ، فَاسْتَقْبَلَ الْقِبْلَةَ، فَوَحَّدَ اللَّهَ وَكبَّرَهُ وَقَالَ: ((لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ، ثُمَّ دَعَا بَيْنَ ذلكَ. قَالَ مِثْلَ هَذَا ثَلاَثَ مَرَّاتٍ)) الْحَدِيثُ. وَفِيهِ: ((فَفَعَلَ عَلَى الْمَرْوَةِ كَمَا فَعَلَ عَلَى الصَّفَا)). | Allah is the greatest, Allah is the greatest, Allah is the greatest. None has the right to be worshipped excep | | |
| 46 | `119:237` | Invocation to be recited on the Day of A | قَالَ النَّبِيُّ صلى الله عليه وسلم: ((خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ، وَخَيْرُ مَا قُلْتُ أَنَا وَالنَّبيُّونَ مِنْ قَبْلِي: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ)). | None has the right to be worshipped except Allah, alone, without partner. To Him belongs all praise and sovere | | |
| 47 | `124:243` | What to say when you feel a pain in your | ((ضَعْ يَدَكَ عَلَى الَّذِي تَألَّمَ مِنْ جَسَدِكَ وَقُلْ: بِسْمِ اللَّهِ، ثَلاَثاً، وَقُلْ سَبْعَ مَرَّاتٍ: أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ)). | (Place your hand at the site of the pain and say: (In the name of Allah(three times)) the supplicate seven tim | | |
| 48 | `125:244` | What to say when you fear you may afflic | ((إِذَا رَأَى أَحَدُكُم مِنْ أَخِيهِ، أَوْ مِنْ نَفْسِهِ، أَوْ مِنْ مَالِهِ مَا يُعْجِبُهُ [فَلْيَدْعُ لَهُ بِالْبَرَكَةِ] فَإِنَّ الْعَيْنَ حَقٌّ)). | If you see anything of your brother that pleases you, or of his person or of his property [then ask Allah to b | | |
| 49 | `129:249` | Repentance and seeking forgiveness | وَقَالَ صلى الله عليه وسلم: ((يَا أَيُّهَا النَّاسُ تُوبُوا إِلَى اللَّهِ فَإِنِّي أَتُوبُ فِي الْيَوْمِ إِلَيْهِ مِائَةَ مَرَّةٍ)). | (He also said: ‘O People, Repent! Verily I repent to Allah, a hundred times a day.) | | |
| 50 | `129:250` | Repentance and seeking forgiveness | وَقَالَ صلى الله عليه وسلم: ((مَنْ قَالَ أَسْتَغْفِرُ اللَّهَ الْعَظيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ القَيّوُمُ وَأَتُوبُ إِلَيهِ، غَفَرَ اللَّهُ لَهُ وَإِنْ كَانَ فَرَّ مِنَ الزَّحْفِ)). | (He also said: ‘Whoever says:(I seek Allah’s forgiveness, besides whom, none has the right to be worshipped ex | | |
| 51 | `129:251` | Repentance and seeking forgiveness | وَقَالَ صلى الله عليه وسلم: ((أَقْرَبُ مَا يَكُونُ الرَّبُّ مِنَ الْعَبْدِ فِي جَوْفِ اللَّيْلِ الآخِرِ فَإِنِ اسْتَطَعْتَ أَنْ تَكُونَ مِمَّنْ يَذْكُرُ اللَّهَ فِي تِلْكَ السَّاعَةِ فَكُنْ)). | (He said: ‘The nearest the Lord comes to His servant is in the middle of the night, so if you are able to be o | | |
| 52 | `129:252` | Repentance and seeking forgiveness | وَقَالَ صلى الله عليه وسلم: ((أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكثِرُوا الدُّعَاءَ)). | (He also said: ‘The nearest a servant is to his Lord is when he is prostrating, so supplicate much therein.) | | |
| 53 | `130:254` | The excellence of remembering Allah | قَالَ صلى الله عليه وسلم مَنْ قَالَ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَلَوْ كَانَتْ مِثْلَ زَبَدِ الْبَحْر)). | (Whoever says:(How perfect Allah is and I praise Him.) a hundred times during the day, his sins are wiped away | | |
| 54 | `130:255` | The excellence of remembering Allah | وَقَالَ صلى الله عليه وسلم: ((مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ عَشْرَ مِرَارٍ، كَانَ كَمَنْ أَعْتَقَ أَرْبَعَةَ أَنْفُسٍ مِنْ وَلَدِ إِسْمَاعِيلَ)). | None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and p | | |
| 55 | `130:256` | The excellence of remembering Allah | وَقَالَ صلى الله عليه وسلم: ((كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحانَ اللَّهِ الْعَظِيمِ)). | How perfect Allah is and I praise Him. How perfect Allah is, The Supreme. | | |
| 56 | `130:257` | The excellence of remembering Allah | وَقَالَ صلى الله عليه وسلم: ((لَأَنْ أَقُولَ سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، أَحَبُّ إِلَيَّ مِمَّا طَلَعَتْ عَلَيْهِ الشَّمسُ)). | How perfect Allah is, and all praise is for Allah. None has the right to be worshipped except Allah, and Allah | | |
| 57 | `130:258` | The excellence of remembering Allah | وَقَالَ صلى الله عليه وسلم: ((أَيَعْجِزُ أَحَدُكُم أَنْ يَكْسِبَ كُلَّ يَوْمٍ أَلْفَ حَسَنَةٍ)) فَسَأَلَهُ سَائِلٌ مِنْ جُلَسَائِهِ كَيْفَ يَكْسِبُ أَحَدُنَا أَلْفَ حَسَنَةٍ؟ قَالَ: ((يُسَبِّحُ مِائَةَ تَسْبِيحَةٍ، فَيُكتَبُ لَهُ أَلْفُ حَسَنَةٍ أَوْ يُحَطُّ عَنْهُ أَلْفُ خَطِيئَةٍ)). | How perfect Allah is. | | |
| 58 | `130:259` | The excellence of remembering Allah | ((مَنْ قَالَ: سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ غُرِسَتْ لَهُ نَخْلَةٌ فِي الْجَنَّةِ)). | How perfect Allah is, The Supreme, and I praise Him. | | |
| 59 | `130:260` | The excellence of remembering Allah | وَقَالَ صلى الله عليه وسلم: ((يَا عَبْدَ اللَّهِ بْنَ قَيْسٍ أَلاَ أَدُلُّكَ عَلَى كَنْزٍ مِنْ كُنُوزِ الْجَنَّةِ))؟ فَقُلْتُ: بَلَى يَا رَسُولَ اللَّهِ، قَالَ: ((قُلْ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ)). | There is no might nor power except with Allah. | | |
| 60 | `130:261` | The excellence of remembering Allah | وَقَالَ صلى الله عليه وسلم: ((أَحَبُّ الْكَلاَمِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، لاَ يَضُرُّكَ بِأَيِّهِنَّ بَدَأتَ)). | (the most beloved words to Allah are four: (How perfect Allah is, all praise is for Allah. None has the right | | |
| 61 | `130:262` | The excellence of remembering Allah | جَاءَ أَعْرَابِيٌّ إِلَى رَسُولِ اللَّهِ صلى الله عليه وسلم فَقَالَ: عَلِّمْنِي كَلاماً أَقُولُهُ: قَالَ: ((قُلْ: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، اللَّهُ أَكْبَرُ كَبِيراً، وَالْحَمْدُ لِلَّهِ كَثِيراً، سُبْحَانَ اللَّهِ رَبِّ العَالَمِينَ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَزِيزِ الْحَكِيمِ)) قَالَ: فَهَؤُلاَءِ لِرَبِّي، فَمَا لِي؟ قَالَ: ((قُلْ: اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَارْزُقْنِي)). | None has the right to be worshipped except Allah, alone without partner. Allah is most great and much praise i | | |
| 62 | `130:263` | The excellence of remembering Allah | كَانَ الرَّجُلُ إِذَا أَسْلَمَ عَلَّمَهُ النَّبيُّ صلى الله عليه وسلم الصَّلاَةَ ثُمَّ أَمَرَهُ أَنْ يَدْعُوَ بِهَؤُلاَءِ الْكَلِمَاتِ: ((اللَّهُمَّ اغْفِرِ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي وَارْزُقْنِي)). | O Allah, grant me pardon, have mercy upon me, direct me to the path of righteousness, grant me protection and | | |
| 63 | `130:264` | The excellence of remembering Allah | ((إِنَّ أَفْضَلَ الدُّعَاءِ الْحَمْدُ لِلَّهِ، وَأَفْضَلَ الذِّكْرِ لاَ إِلَهَ إِلاَّ اللَّهُ)). | All praise is for Allah. — And the best form of remembrance: None has the right to be worshipped except Allah. | | |
| 64 | `130:265` | The excellence of remembering Allah | الباقيات الصالحات : سبحان الله والحمد لله ، ولا إله إلا الله ،والله أكبر ،و لا حول ولا قوة إلا بالله | The good deeds which endure are 'Glorified is Allah', and 'The praise is for Allah', and 'but There is none wo | | |
| 65 | `132:267` | Types of goodness and good etiquette for |  | When evening descends, bring your children indoors for the devils scatter out at this hour. Then after the pas | | |

### 3b — Newly ingested Qur'anic verses

These carry `build_gate: awaiting-original-rendering` and cannot enter a sitemap until that is
lifted. The English below is Pickthall (public domain), held as the corpus base — it is **not**
the text that will publish.

| # | id | Verse | Arabic | English (Pickthall, base only) | **Transliteration (reviewer)** | **Source named** |
|---|---|---|---|---|---|---|
| 1 | `quran:21:87` | 21:87 | وَذَا ٱلنُّونِ إِذ ذَّهَبَ مُغَـٰضِبًا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِى ٱلظُّلُمَـٰتِ أَن لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ | And (mention) Dhu'n-Nun, when he went off in anger and deemed that We had no power over him, but he cried out | | |
| 2 | `quran:20:26` | 20:26 | وَيَسِّرْ لِىٓ أَمْرِى | And ease my task for me; | | |
| 3 | `quran:20:27` | 20:27 | وَٱحْلُلْ عُقْدَةً مِّن لِّسَانِى | And loose a knot from my tongue, | | |
| 4 | `quran:20:28` | 20:28 | يَفْقَهُوا۟ قَوْلِى | That they may understand my saying. | | |
| 5 | `quran:20:114` | 20:114 | فَتَعَـٰلَى ٱللَّهُ ٱلْمَلِكُ ٱلْحَقُّ ۗ وَلَا تَعْجَلْ بِٱلْقُرْءَانِ مِن قَبْلِ أَن يُقْضَىٰٓ إِلَيْكَ وَحْيُهُۥ ۖ وَقُل رَّبِّ زِدْنِى عِلْمًا | Then exalted be Allah, the True King! And hasten not (O Muhammad) with the Qur'an ere its revelation hath been | | |
| 6 | `quran:3:173` | 3:173 | ٱلَّذِينَ قَالَ لَهُمُ ٱلنَّاسُ إِنَّ ٱلنَّاسَ قَدْ جَمَعُوا۟ لَكُمْ فَٱخْشَوْهُمْ فَزَادَهُمْ إِيمَـٰنًا وَقَالُوا۟ حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ | Those unto whom men said: Lo! the people have gathered against you, therefor fear them. (The threat of danger) | | |
| 7 | `quran:71:28` | 71:28 | رَّبِّ ٱغْفِرْ لِى وَلِوَٰلِدَىَّ وَلِمَن دَخَلَ بَيْتِىَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَٱلْمُؤْمِنَـٰتِ وَلَا تَزِدِ ٱلظَّـٰلِمِينَ إِلَّا تَبَارًۢا | My Lord! Forgive me and my parents and him who entereth my house believing, and believing men and believing wo | | |
| 8 | `quran:17:24` | 17:24 | وَٱخْفِضْ لَهُمَا جَنَاحَ ٱلذُّلِّ مِنَ ٱلرَّحْمَةِ وَقُل رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًا | And lower unto them the wing of submission through mercy, and say: My Lord! Have mercy on them both as they di | | |
| 9 | `quran:21:83` | 21:83 | ۞ وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُۥٓ أَنِّى مَسَّنِىَ ٱلضُّرُّ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ | And Job, when he cried unto his Lord, (saying): Lo! adversity afflicteth me, and Thou art Most Merciful of all | | |
| 10 | `quran:3:194` | 3:194 | رَبَّنَا وَءَاتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ ٱلْقِيَـٰمَةِ ۗ إِنَّكَ لَا تُخْلِفُ ٱلْمِيعَادَ | Our Lord! And give us that which Thou hast promised to us by Thy messengers. Confound us not upon the Day of R | | |

---

## Part 4 — Arabic-field defects, Waves 1–2

Some records hold something other than the supplication in their Arabic field. The English
field is usually correct; the Arabic is not. A page built from these would show a reader a
chain of narrators, or a narrator's framing sentence, or two different duas run together, as
the words to recite.

**This part was previously scoped to one defect (records carrying a full isnad). That was the
wrong cut** — you would have met the other shapes cold in a later batch. All **7** affected
rows across Waves 1–2 are now here, whichever detector found them.

| # | Rank | id | Defect | English (believed correct) | Proposed Arabic | Confidence | **Correct? (Y/N)** | **Corrected Arabic** |
|---|---:|---|---|---|---|---|---|---|
| 1 | 17 | `26:74` | narrator's frame ahead of the dua | O Allah, I seek Your counsel by Your knowledge and by Your power I seek strength and I ask You from Your immen | إِذَا هَمَّ أَحَدُكُمْ بِالْأَمْرِ فَلْيَرْكَعْ رَكْعَتَيْنِ مِنْ غَيْرِ الْفَرِيضَةِ، ثُمَّ لْيَقُلْ: اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ؛ فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأمْرَ - وَيُسَمِّي حَاجَتَهُ - خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ - فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ – فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ، ثُمَّ أَرْضِنِي بِهِ | low ⚠ | | |
| 2 | 18 | `abudawud:1426` | full isnad stored in the Arabic field | O Allah, guide me among those Thou hast guided, grant me security among those Thou hast granted security, take | اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ وَبَارِكْ لِي فِيمَا أَعْطَيْتَ وَقِنِي شَرَّ مَا قَضَيْتَ إِنَّكَ تَقْضِي وَلاَ يُقْضَى عَلَيْكَ وَإِنَّهُ لاَ يَذِلُّ مَنْ وَالَيْتَ وَلاَ يَعِزُّ مَنْ عَادَيْتَ تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ | medium | | |
| 3 | 19 | `13:20` | 2 separate delimited duas in one record | I take refuge with Allah, The Supreme and with His Noble Face, and His eternal authority from the accursed dev | أَعُوذُ بِاللَّهِ العَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ | low ⚠ | | |
| 4 | 20 | `96:207` | 2 separate delimited duas in one record | Allah is the greatest, Allah is the greatest, Allah is the greatest, How perfect He is, The One Who has placed | اللَّهُمَّ إِنّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا البِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَليفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ | low ⚠ | | |
| 5 | 23 | `119:237` | narrator's frame ahead of the dua | None has the right to be worshipped except Allah, alone, without partner. To Him belongs all praise and sovere | خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ، وَخَيْرُ مَا قُلْتُ أَنَا وَالنَّبيُّونَ مِنْ قَبْلِي: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ | low ⚠ | | |
| 6 | 34 | `106:218` | narrator's frame ahead of the dua; 2 separate delimited duas in one record | Praise is to Allah Who by His blessings all good things are perfected. — And upon what displeases: Praise is t | الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ | low ⚠ | | |
| 7 | 48 | `118:236` | narrator's frame ahead of the dua; 2 separate delimited duas in one record | Allah is the greatest, Allah is the greatest, Allah is the greatest. None has the right to be worshipped excep | لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ، ثُمَّ دَعَا بَيْنَ ذلكَ. قَالَ مِثْلَ هَذَا ثَلاَثَ مَرَّاتٍ | low ⚠ | | |

**⚠ Every `low` row above is a guess you are being asked to overrule or confirm, not a
proposal we have confidence in.** Three worked examples of why the delimiter cannot be trusted:

- `96:207` (rank 20) — the takbīr and Qur'anic opening that sit *before* the delimiter are part
  of the travel dua. Dropping them removes half the supplication.
- `26:74` (rank 17) — the *only* delimited span is the instruction ("let him pray two rakʿahs,
  then let him say…"). The istikhāra dua itself is not inside it.
- `13:20` (rank 19) — here the pre-delimiter text genuinely is an instruction and dropping it is
  correct. Same structure, opposite answer.

There are **154** isnad-carrying records in the corpus in total. Only the 1 needed for
Waves 1–2 appear here; the remaining **153** belong to Wave 3–4 chapter pages and are
deliberately held back. Please do not work ahead of this table.

### 4b — translation-field defect

Same effect, different field: the English opens with an instruction rather than the dua.

| Rank | id | Translation as stored |
|---:|---|---|
| 37 | `124:243` | (Place your hand at the site of the pain and say: (In the name of Allah(three times)) the supplicate seven times: (I take refuge in Allah and within His omnipotence from the evil that I feel |

**Full source text for every row above, so each extraction can be checked in context:**

**`26:74`** (rank 17) — Istikharah (seeking Allah's Counsel) — not recorded

> قَالَ جَابرُ بْنُ عَبْدِ اللَّهِ رَضِيَ اللَّهُ عَنْهُمَا: كَانَ رسُولُ اللَّهِ صلى الله عليه وسلم يُعَلِّمُنَا الْاسْتِخَارَةَ فِي الْأُمُورِ كُلِّهَا كَمَا يُعَلِّمُنَا السُّورَةَ مِنَ الْقُرْآنِ، يَقُولُ: ((إِذَا هَمَّ أَحَدُكُمْ بِالْأَمْرِ فَلْيَرْكَعْ رَكْعَتَيْنِ مِنْ غَيْرِ الْفَرِيضَةِ، ثُمَّ لْيَقُلْ: اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ؛ فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأمْرَ - وَيُسَمِّي حَاجَتَهُ - خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ - فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ – فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ، ثُمَّ أَرْضِنِي بِهِ)).وَمَا نَدِمَ مَنِ اسْتَخَارَ الْخَالِقَ، وَشَاوَرَ الْمَخْلُوقِينَ الْمُؤْمِنِينَ وَتَثَبَّتَ فِي أَمْرِهِ، فَقَدْ قَالَ اللَّه تعالى: ﴿وَشاوِرْهُمْ فِي الْأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾ .

**`abudawud:1426`** (rank 18) — Supplications in the Witr Prayer (Kitab al-Witr) — Sunan Abi Dawud 1426 — Al-Hasan ibn Ali

> حَدَّثَنَا قُتَيْبَةُ بْنُ سَعِيدٍ، وَأَحْمَدُ بْنُ جَوَّاسٍ الْحَنَفِيُّ، قَالاَ حَدَّثَنَا أَبُو الأَحْوَصِ، عَنْ أَبِي إِسْحَاقَ، عَنْ بُرَيْدِ بْنِ أَبِي مَرْيَمَ، عَنْ أَبِي الْحَوْرَاءِ، قَالَ قَالَ الْحَسَنُ بْنُ عَلِيٍّ رضى الله عنهما عَلَّمَنِي رَسُولُ اللَّهِ صلى الله عليه وسلم كَلِمَاتٍ أَقُولُهُنَّ فِي الْوِتْرِ قَالَ ابْنُ جَوَّاسٍ فِي قُنُوتِ الْوِتْرِ ‏
"‏ اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ وَبَارِكْ لِي فِيمَا أَعْطَيْتَ وَقِنِي شَرَّ مَا قَضَيْتَ إِنَّكَ تَقْضِي وَلاَ يُقْضَى عَلَيْكَ وَإِنَّهُ لاَ يَذِلُّ مَنْ وَالَيْتَ وَلاَ يَعِزُّ مَنْ عَادَيْتَ تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ ‏"‏ ‏.‏

**`13:20`** (rank 19) — Invocation for entering the mosque — not recorded

> (يَبْدَأُ بِرِجْلِهِ الْيُمْنَى) ، وَيَقُولُ: ((أَعُوذُ بِاللَّهِ العَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ)) [بِسْمِ اللَّهِ، وَالصَّلَاةُ] [وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ] ((اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ)).

**`96:207`** (rank 20) — Invocation for traveling — not recorded

> اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، ﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ﴾ ((اللَّهُمَّ إِنّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا البِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَليفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ))، وإذا رَجَعَ قَالَهُنَّ وَزَادَ فِيهِنَّ: ((آيِبُونَ، تائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ)).

**`119:237`** (rank 23) — Invocation to be recited on the Day of Arafat — not recorded

> قَالَ النَّبِيُّ صلى الله عليه وسلم: ((خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ، وَخَيْرُ مَا قُلْتُ أَنَا وَالنَّبيُّونَ مِنْ قَبْلِي: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ)).

**`106:218`** (rank 34) — What to say if something happens to please you or to displease you — not recorded

> كَانَ النَّبِيُّ صلى الله عليه وسلم إِذَا أَتَاهُ الْأَمْرُ يَسُرُّهُ قَالَ: ((الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ)) وَإِذَا أَتَاهُ الْأَمْرُ يَكْرَهُهُ قَالَ: ((الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ)).

**`118:236`** (rank 48) — Invocation to be recited while standing at Safa and Marwah — not recorded

> لَمَّا دَنَا النَّبِيُّ صلى الله عليه وسلم مِنَ الصَّفَا قَرَأَ: ﴿إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَآئِرِ اللَّهِ﴾ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ)) فَبَدَأَ بِالصَّفَا فَرَقِيَ عَلَيْهِ حَتَّى رَأَى الْبَيْتَ، فَاسْتَقْبَلَ الْقِبْلَةَ، فَوَحَّدَ اللَّهَ وَكبَّرَهُ وَقَالَ: ((لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ، ثُمَّ دَعَا بَيْنَ ذلكَ. قَالَ مِثْلَ هَذَا ثَلاَثَ مَرَّاتٍ)) الْحَدِيثُ. وَفِيهِ: ((فَفَعَلَ عَلَى الْمَرْوَةِ كَمَا فَعَلَ عَلَى الصَّفَا)).

**`124:243`** (rank 37) — What to say when you feel a pain in your body — not recorded

> ((ضَعْ يَدَكَ عَلَى الَّذِي تَألَّمَ مِنْ جَسَدِكَ وَقُلْ: بِسْمِ اللَّهِ، ثَلاَثاً، وَقُلْ سَبْعَ مَرَّاتٍ: أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ)).

---

## Part 5 — Qur'anic full-ayah rows: the supplication clause

**26 rows.** These records store the **complete āyah**. In most, the supplication is one
clause inside a longer narrative verse — `21:83` opens *"And Job, when he cried unto his Lord"*,
and the dua proper begins several words later. An Arabic block rendering the whole āyah presents
narrative as the words to recite.

A rule was tested: locate the first vocative or address marker (`رَبَّنَا`, `رَبِّ`, `اللَّهُمَّ`,
`حَسْبُنَا`, `لَا إِلَٰهَ إِلَّا أَنتَ`, …) and take the clause from there. It was checked against the
transliterated incipit recorded independently in our keyword table.

**It agreed with the expected incipit on 24 of 25 resolvable rows.** The proposal below is
therefore likely to be right — but *likely* is not the standard this content is held to, so every
row still needs your eye.

### How your time splits on this part

| | Rows | What you are doing |
|---|---:|---|
| Rule proposed a clause and it is probably right | **24** | **Checking** — read the proposal against the full āyah and accept or correct it |
| Rule cannot help | **2** (ranks 1 and 3) | **Transcribing** — the clause has to be established by hand |

The two hand rows are ranks 1 and 3, explained immediately below.

> **A note on scope, so the numbers reconcile.** Five Wave 1 rows in total need hand treatment:
> ranks **1, 3, 17, 19, 20**. Only **1 and 3** are Qur'anic and appear here; **17, 19 and 20** are
> hadith records and are in Part 4. Across the whole famous-50 the hand-treatment count is 8 —
> 7 `prefix-trim` (ranks 1, 17, 19, 20, 23, 34, 48) plus 1 `verse-from-bundle` (rank 3). If you
> were told "5 rows, all prefix-trim", the set was right for Wave 1 but the label was not:
> rank 3 is a different shape, and ranks 23, 34 and 48 are the same shape in Wave 2.

### Two rows are a different shape — please read these first

Most rows below are one supplication inside one verse. **Ranks 1 and 3 are not**, and each is the
only example of its kind in this wave. They are shown here as worked examples so the shape is
familiar when it recurs at scale in a later batch, rather than being met cold.

**Rank 1 — `27:75` — prefix trim**

Ayat al-Kursi is printed after a taʿawwudh (*A'ūdhu billāhi min ash-shayṭān ir-rajīm*). The taʿawwudh is said before reciting; it is not part of 2:255. It is also a declarative verse, not a petition, so the vocative rule correctly finds nothing to extract — the fix is to remove a prefix, not to locate a clause.

- Stored text: أَعُوذُ بِاللَّهِ مِنَ الشَّيطَانِ الرَّجِيمِ ﴿اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ
- Proposed recitable portion: اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالْأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾.
- How: removed the taʿawwudh printed ahead of the passage — removed: أَعُوذُ بِاللَّهِ مِنَ الشَّيطَانِ الرَّجِيمِ

**Rank 3 — `28:101` — one verse from a bundle**

2:286 is stored together with 2:285 in a single record (the two closing verses of al-Baqarah, recited before sleeping). Taking the first vocative marker lands at the **end of 2:285** — *rabbanā wa ilayka al-maṣīr* — which is the wrong verse. The extractor therefore refuses to choose and requires an anchor naming the target verse's opening words. The anchor used is shown in the table.

- Stored text: ﴿آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلآئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لاَ نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ وَقَالُواْ سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَ
- Proposed recitable portion: رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَا إِصْراً كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلاَ تُحَمِّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَآ أَنتَ مَوْلاَنَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ﴾.
- How: sliced at a reviewer-supplied anchor — anchor: ربنا لا تؤاخذنا

| # | Rank | id | Verse | Shape | Proposed clause | % of record | How located | **Correct? (Y/N)** | **Corrected clause** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | `27:75` | Quran 2:255 | prefix-trim | اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالْأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾. | 89% | removed the taʿawwudh printed ahead of the passage | | |
| 2 | 2 | `quran:2:201` | 2:201 | quran-clause | رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ | 100% | first vocative marker: ربنا | | |
| 3 | 3 | `28:101` | Quran 2:286 | verse-from-bundle | رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَا إِصْراً كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلاَ تُحَمِّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَآ أَنتَ مَوْلاَنَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ﴾. | 47% | sliced at a reviewer-supplied anchor | | |
| 4 | 4 | `quran:21:87` | 21:87 | quran-clause | لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ | 41% | first vocative marker: لا اله الا انت | | |
| 5 | 5 | `quran:20:25` | 20:25 | quran-clause | رَبِّ ٱشْرَحْ لِى صَدْرِى | 100% | first vocative marker: رب (anywhere) | | |
| 6 | 6 | `quran:20:114` | 20:114 | quran-clause | رَّبِّ زِدْنِى عِلْمًا | 15% | first vocative marker: رب (anywhere) | | |
| 7 | 7 | `quran:25:74` | 25:74 | quran-clause | رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا | 100% | first vocative marker: ربنا | | |
| 8 | 8 | `quran:37:100` | 37:100 | quran-clause | رَبِّ هَبْ لِى مِنَ ٱلصَّـٰلِحِينَ | 100% | first vocative marker: رب (anywhere) | | |
| 9 | 9 | `quran:3:38` | 3:38 | quran-clause | رَبِّ هَبْ لِى مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ ٱلدُّعَآءِ | 100% | first vocative marker: رب (anywhere) | | |
| 10 | 10 | `quran:28:24` | 28:24 | quran-clause | رَبِّ إِنِّى لِمَآ أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍ فَقِيرٌ | 100% | first vocative marker: رب (anywhere) | | |
| 11 | 11 | `quran:2:250` | 2:250 | quran-clause | رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ | 100% | first vocative marker: ربنا | | |
| 12 | 12 | `quran:3:173` | 3:173 | quran-clause | حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ | 24% | first vocative marker: حسبنا | | |
| 13 | 13 | `quran:71:28` | 71:28 | quran-clause | رَّبِّ ٱغْفِرْ لِى وَلِوَٰلِدَىَّ وَلِمَن دَخَلَ بَيْتِىَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَٱلْمُؤْمِنَـٰتِ وَلَا تَزِدِ ٱلظَّـٰلِمِينَ إِلَّا تَبَارًۢا | 100% | first vocative marker: رب (anywhere) | | |
| 14 | 14 | `quran:60:5` | 60:5 | quran-clause | رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلَّذِينَ كَفَرُوا۟ وَٱغْفِرْ لَنَا رَبَّنَآ ۖ إِنَّكَ أَنتَ ٱلْعَزِيزُ ٱلْحَكِيمُ | 100% | first vocative marker: ربنا | | |
| 15 | 15 | `quran:27:19` | 27:19 | quran-clause | رَبِّ أَوْزِعْنِىٓ أَنْ أَشْكُرَ نِعْمَتَكَ ٱلَّتِىٓ أَنْعَمْتَ عَلَىَّ وَعَلَىٰ وَٰلِدَىَّ وَأَنْ أَعْمَلَ صَـٰلِحًا تَرْضَىٰهُ وَأَدْخِلْنِى بِرَحْمَتِكَ فِى عِبَادِكَ ٱلصَّـٰلِحِينَ | 100% | first vocative marker: رب (anywhere) | | |
| 16 | 21 | `quran:17:24` | 17:24 | quran-clause | رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًا | 44% | first vocative marker: رب (anywhere) | | |
| 17 | 38 | `quran:14:35` | 14:35 | quran-clause | رَبِّ ٱجْعَلْ هَـٰذَا ٱلْبَلَدَ ءَامِنًا وَٱجْنُبْنِى وَبَنِىَّ أَن نَّعْبُدَ ٱلْأَصْنَامَ | 100% | first vocative marker: رب (anywhere) | | |
| 18 | 39 | `quran:2:127` | 2:127 | quran-clause | رَبَّنَا تَقَبَّلْ مِنَّآ ۖ إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلْعَلِيمُ | 100% | first vocative marker: ربنا | | |
| 19 | 40 | `quran:21:83` | 21:83 | quran-clause | أَنِّى مَسَّنِىَ ٱلضُّرُّ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ | 61% | first vocative marker: اني مسني | | |
| 20 | 41 | `quran:11:47` | 11:47 | quran-clause | رَبِّ إِنِّىٓ أَعُوذُ بِكَ أَنْ أَسْـَٔلَكَ مَا لَيْسَ لِى بِهِۦ عِلْمٌ ۖ وَإِلَّا تَغْفِرْ لِى وَتَرْحَمْنِىٓ أَكُن مِّنَ ٱلْخَـٰسِرِينَ | 100% | first vocative marker: رب (anywhere) | | |
| 21 | 42 | `quran:7:23` | 7:23 | quran-clause | رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ | 100% | first vocative marker: ربنا | | |
| 22 | 43 | `quran:12:101` | 12:101 | quran-clause | رَبِّ قَدْ ءَاتَيْتَنِى مِنَ ٱلْمُلْكِ وَعَلَّمْتَنِى مِن تَأْوِيلِ ٱلْأَحَادِيثِ ۚ فَاطِرَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ أَنتَ وَلِىِّۦ فِى ٱلدُّنْيَا وَٱلْـَٔاخِرَةِ ۖ تَوَفَّنِى مُسْلِمًا وَأَلْحِقْنِى بِٱلصَّـٰلِحِينَ | 100% | first vocative marker: رب (anywhere) | | |
| 23 | 44 | `quran:3:8` | 3:8 | quran-clause | رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ ٱلْوَهَّابُ | 100% | first vocative marker: ربنا | | |
| 24 | 45 | `quran:3:147` | 3:147 | quran-clause | رَبَّنَا ٱغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِىٓ أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ | 100% | first vocative marker: ربنا | | |
| 25 | 46 | `quran:66:8` | 66:8 | quran-clause | رَبَّنَآ أَتْمِمْ لَنَا نُورَنَا وَٱغْفِرْ لَنَآ ۖ إِنَّكَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ | 100% | first vocative marker: ربنا | | |
| 26 | 47 | `quran:3:194` | 3:194 | quran-clause | رَبَّنَا وَءَاتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ ٱلْقِيَـٰمَةِ ۗ إِنَّكَ لَا تُخْلِفُ ٱلْمِيعَادَ | 100% | first vocative marker: ربنا | | |

**Full āyah text for each, for comparison:**

**`27:75`** — Qur'an undefined

> أَعُوذُ بِاللَّهِ مِنَ الشَّيطَانِ الرَّجِيمِ ﴿اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالْأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾.

**`quran:2:201`** — Qur'an 2:201

> رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ

**`28:101`** — Qur'an undefined

> ﴿آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلآئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لاَ نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ وَقَالُواْ سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ* لاَ يُكَلِّفُ اللَّهُ نَفْساً إِلاَّ وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَا إِصْراً كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلاَ تُحَمِّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَآ أَنتَ مَوْلاَنَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ﴾.

**`quran:21:87`** — Qur'an 21:87

> وَذَا ٱلنُّونِ إِذ ذَّهَبَ مُغَـٰضِبًا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِى ٱلظُّلُمَـٰتِ أَن لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ

**`quran:20:25`** — Qur'an 20:25

> رَبِّ ٱشْرَحْ لِى صَدْرِى

**`quran:20:114`** — Qur'an 20:114

> فَتَعَـٰلَى ٱللَّهُ ٱلْمَلِكُ ٱلْحَقُّ ۗ وَلَا تَعْجَلْ بِٱلْقُرْءَانِ مِن قَبْلِ أَن يُقْضَىٰٓ إِلَيْكَ وَحْيُهُۥ ۖ وَقُل رَّبِّ زِدْنِى عِلْمًا

**`quran:25:74`** — Qur'an 25:74

> رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا

**`quran:37:100`** — Qur'an 37:100

> رَبِّ هَبْ لِى مِنَ ٱلصَّـٰلِحِينَ

**`quran:3:38`** — Qur'an 3:38

> رَبِّ هَبْ لِى مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ ٱلدُّعَآءِ

**`quran:28:24`** — Qur'an 28:24

> رَبِّ إِنِّى لِمَآ أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍ فَقِيرٌ

**`quran:2:250`** — Qur'an 2:250

> رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ

**`quran:3:173`** — Qur'an 3:173

> ٱلَّذِينَ قَالَ لَهُمُ ٱلنَّاسُ إِنَّ ٱلنَّاسَ قَدْ جَمَعُوا۟ لَكُمْ فَٱخْشَوْهُمْ فَزَادَهُمْ إِيمَـٰنًا وَقَالُوا۟ حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ

**`quran:71:28`** — Qur'an 71:28

> رَّبِّ ٱغْفِرْ لِى وَلِوَٰلِدَىَّ وَلِمَن دَخَلَ بَيْتِىَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَٱلْمُؤْمِنَـٰتِ وَلَا تَزِدِ ٱلظَّـٰلِمِينَ إِلَّا تَبَارًۢا

**`quran:60:5`** — Qur'an 60:5

> رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلَّذِينَ كَفَرُوا۟ وَٱغْفِرْ لَنَا رَبَّنَآ ۖ إِنَّكَ أَنتَ ٱلْعَزِيزُ ٱلْحَكِيمُ

**`quran:27:19`** — Qur'an 27:19

> رَبِّ أَوْزِعْنِىٓ أَنْ أَشْكُرَ نِعْمَتَكَ ٱلَّتِىٓ أَنْعَمْتَ عَلَىَّ وَعَلَىٰ وَٰلِدَىَّ وَأَنْ أَعْمَلَ صَـٰلِحًا تَرْضَىٰهُ وَأَدْخِلْنِى بِرَحْمَتِكَ فِى عِبَادِكَ ٱلصَّـٰلِحِينَ

**`quran:17:24`** — Qur'an 17:24

> وَٱخْفِضْ لَهُمَا جَنَاحَ ٱلذُّلِّ مِنَ ٱلرَّحْمَةِ وَقُل رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًا

**`quran:14:35`** — Qur'an 14:35

> رَبِّ ٱجْعَلْ هَـٰذَا ٱلْبَلَدَ ءَامِنًا وَٱجْنُبْنِى وَبَنِىَّ أَن نَّعْبُدَ ٱلْأَصْنَامَ

**`quran:2:127`** — Qur'an 2:127

> رَبَّنَا تَقَبَّلْ مِنَّآ ۖ إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلْعَلِيمُ

**`quran:21:83`** — Qur'an 21:83

> ۞ وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُۥٓ أَنِّى مَسَّنِىَ ٱلضُّرُّ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ

**`quran:11:47`** — Qur'an 11:47

> رَبِّ إِنِّىٓ أَعُوذُ بِكَ أَنْ أَسْـَٔلَكَ مَا لَيْسَ لِى بِهِۦ عِلْمٌ ۖ وَإِلَّا تَغْفِرْ لِى وَتَرْحَمْنِىٓ أَكُن مِّنَ ٱلْخَـٰسِرِينَ

**`quran:7:23`** — Qur'an 7:23

> رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ

**`quran:12:101`** — Qur'an 12:101

> رَبِّ قَدْ ءَاتَيْتَنِى مِنَ ٱلْمُلْكِ وَعَلَّمْتَنِى مِن تَأْوِيلِ ٱلْأَحَادِيثِ ۚ فَاطِرَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ أَنتَ وَلِىِّۦ فِى ٱلدُّنْيَا وَٱلْـَٔاخِرَةِ ۖ تَوَفَّنِى مُسْلِمًا وَأَلْحِقْنِى بِٱلصَّـٰلِحِينَ

**`quran:3:8`** — Qur'an 3:8

> رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ ٱلْوَهَّابُ

**`quran:3:147`** — Qur'an 3:147

> رَبَّنَا ٱغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِىٓ أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ

**`quran:66:8`** — Qur'an 66:8

> رَبَّنَآ أَتْمِمْ لَنَا نُورَنَا وَٱغْفِرْ لَنَآ ۖ إِنَّكَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ

**`quran:3:194`** — Qur'an 3:194

> رَبَّنَا وَءَاتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ ٱلْقِيَـٰمَةِ ۗ إِنَّكَ لَا تُخْلِفُ ٱلْمِيعَادَ

---

## Part 6 — Duplicate-scripture clusters this corpus cannot resolve

Added 2026-08-03 (owner routing, ADR-067). Validator rule R6 groups records whose Arabic is
identical under the Uthmani-folding normalisation. Eight clusters were registered in
`src/data/dua/duplicate-scripture-allowlist.json`; **six are adjudicated and indexed**, on the
owner's rule that *where Hisn lists the same wording under two chapters, that cross-listing is
by itself sufficient basis to index both members*.

**Two are routed here instead, because they turn on sourcing questions the corpus cannot
answer.** Neither is resolvable by inspecting the data, and neither should be settled by a code
change — the allowlist's own `_meta` says adjudication moves entries "on a reviewer or owner
ruling, never on a code change".

### 6.1 — `27:85` / `28:109`: indexed, but neither record carries any hadith citation

These two are already **live** (cluster A, adjudicated on occasion/keyword grounds: morning &
evening vs before sleeping). The R6 question is settled. What is **not** settled is that
**neither record carries a `hadithCitation` at all** — their source is recorded only as the
`dua-dhikr collection`, with the site-wide Hisn translation attribution. Every other adjudicated
cluster carries a citation on both members.

The charter requires that every hadith or claim carries a source or is not shown. These pages
render a supplication with a source *label* but no hadith *reference*, so the A2 block has no
citation to print.

**Question for the reviewer:** where is this wording recorded, and what citation should these two
pages carry? If none can be established, the follow-up question is whether they should stay
indexed at all — that is a content decision, not an R6 one, and it is deliberately left open here
rather than resolved by inference.

| id | slug | chapter | occasion | citation |
|---|---|---|---|---|
| `27:85` | `words-of-remembrance-for-morning-and-evening-hisn-27-85` | Words of remembrance for morning and evening | morning-evening | **none** |
| `28:109` | `what-to-say-before-sleeping-hisn-28-109` | What to say before sleeping | sleep-waking | **Allaahumma 'aalimal ghaybi wash shahaadati, faatiras samaawaati wal ardi, rabba kulli shay'in wamaleekahu, ashhadu an laa ilaaha illaa anta, a'oodhu bika min sharri nafsee, wamin sharrish shaytaani washirkihi, wa an aqtarifa 'alaa nafsee soo'an, aw ajurrahu ilaa muslim** |

### 6.2 — `8:12` / `5:9` / `99:210`: three pages whose entire Arabic is *Bismillah*

**NOT indexed. Not permitted by the allowlist.** A three-member cluster where the whole Arabic of
each page is `بسم الله`. This is an incidental collision on a very short text rather than a
deliberate cross-listing, so the "Hisn lists it under two chapters" rule that resolved the other
six **does not apply**.

Two problems sit on top of R6 and are the reason this is a reviewer question:

- **Thin content.** A page whose entire scripture is two words has very little to distinguish it
  from its two siblings, whatever the chapter label says.
- **Cannibalisation.** Three pages competing for the same short phrase is the clearest
  cannibalisation risk in the corpus.

**Question for the reviewer:** should any of the three be indexed, and if so which one — or is the
right outcome a single page for the phrase with the other two routed out? Please also confirm
whether the three chapter placements are genuinely distinct occasions of use.

### Not in scope here

`9:15` / `85:196` remains in `pendingAdjudication` and is already covered: ADR-066 dropped
`85:196` because it shares a **byte-identical `hadithCitation`** with `9:15` under a different
occasion, so at most one is correct. That is a citation-correctness question, tracked there.


---

## Part 7 — Wave 2, Class B clause proposals (batch 1) — PARKED

Added 2026-08-03, and **parked the same day**. Recorded here so the batch is not silently
re-attempted; the reason it stopped is in `doc/DUA-PARKED-REVIEWER-QUESTIONS.md`.

**Proposals only. Nothing written to the corpus, no page built.** `dua-clause-core.js` returns
`verified: false` on every result by design, and R3 blocks any Class B record from indexing
until a confirmed clause field exists. Confirmed: **0 of 566 records carry `dua_clause_arabic`
or `dua_clause_verified`.**

**17 of these 20 are medium confidence, 3 are low.**

### The blocker no ruling here can clear

**Not one of the 154 Class B records carries a transliteration.** Zero, not a shortfall. Gate 2
requires one that is sourced, provenance-named and covers the whole rendered Arabic — and a
clause needs a transliteration *of the clause*, which exists nowhere in our data and, unlike the
Qur'anic set in Part 8, has no word-aligned source to assemble one from. Confirming a clause here
is necessary but not sufficient.

### What the extractor got wrong — 3 of 3 low-confidence proposals

Checked against each record's own translation:

**`abudawud:1481`** — The proposed span is **not a supplication** — it reads *“There will be people who transgress in supplication”*, the narration's warning **about** dua. The record's own translation (*“O Allah, I ask Thee for Paradise…”*) does not appear in the span at all.

**`abudawud:1496`** — The proposed span is the Prophet's **comment on** the supplication (*“He has supplicated Allah by His greatest name…”*), not the supplication itself.

**`abudawud:1552`** — The span opens with **`قُلِ` (“Say:”)** — an instruction verb that is not part of the recited words. Published as-is a reader would recite the instruction. Same defect class as the Ibn Majah 3590 inversion.

Every medium-confidence proposal in this batch matched its translation and every low-confidence
one did not, so the confidence signal separated cleanly here — but 20 rows is not enough to treat
`low` as a filter, and it is **not** grounds to accept `medium` unread.

### The batch

| id | confidence | proposed recitable span | the record's own translation |
|---|---|---|---|
| `abudawud:1426` | medium | اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِ… | O Allah, guide me among those Thou hast guided, gran… |
| `abudawud:1481` | low ⚠ | سَيَكُونُ قَوْمٌ يَعْتَدُونَ فِي الدُّعَاءِ | O Allah, I ask Thee for Paradise, its blessings, its… |
| `abudawud:1496` | low ⚠ | لَقَدْ دَعَا اللَّهَ بِاسْمِهِ الْعَظِيمِ الَّ… | O Allah, I ask Thee by virtue of the fact that prais… |
| `abudawud:1509` | medium | اللَّهُمَّ رَبَّنَا وَرَبَّ كُلِّ شَىْءٍ أَنَا… | O Allah, our Lord and Lord of everything, I bear wit… |
| `abudawud:1511` | medium | رَبِّ أَعِنِّي وَلاَ تُعِنْ عَلَىَّ وَانْصُرْن… | My Lord, help me and do not give help against me; gr… |
| `abudawud:1513` | medium | اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَ… | O Allah, You are As Salam, and from you is As Salam.… |
| `abudawud:1517` | medium | رَبِّ اغْفِرْ لِي وَتُبْ عَلَىَّ إِنَّكَ أَنْت… | My Lord, forgive me and pardon me; Thou art the Pard… |
| `abudawud:1541` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ … | O Allah, I seek refuge in You from weakness, and laz… |
| `abudawud:1542` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ و… | O Allah, I seek refuge in You from grief and anxiety… |
| `abudawud:1543` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَ… | O Allah! I seek refuge in You from the punishment of… |
| `abudawud:1544` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ فِتْنَةِ ا… | O Allah! I seek refuge in You from the trials of the… |
| `abudawud:1545` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْفَقْرِ … | O Allah, I seek refuge in Thee from poverty", lack a… |
| `abudawud:1547` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الشِّقَاقِ… | O Allah, I seek refuge in Thee from divisiveness, hy… |
| `abudawud:1548` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْجُوعِ ف… | O Allah, I seek refuge in Thee from hunger, for it i… |
| `abudawud:1549` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الأَرْبَعِ… | O Allah, I seek refuge in Thee from four things: Kno… |
| `abudawud:1550` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ صَلاَةٍ لا… | O Allah, I seek refuge in You from a prayer that is … |
| `abudawud:1551` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا … | O Allah, I seek refuge in You from the evil of what … |
| `abudawud:1552` | low ⚠ | قُلِ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ… | O Allah, I seek refuge in Thee from the evil of what… |
| `abudawud:1553` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَدْمِ … | O Allah, I seek refuge in Thee from my house falling… |
| `abudawud:1555` | medium | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبَرَصِ … | O Allah, I seek refuge in Thee from leprosy, madness… |

`abudawud:1426` is already in this package under **Part 4** and is not a second question; it
appears here only because it falls in this batch. One ruling covers both.

---

## Part 8 — Wave 2, Qur'anic clause confirmations (batch 2)

Added 2026-08-03. **Proposals only. Nothing written to the corpus, no page built.** These are the
`quran:` records not already covered by Part 5 — 58 remain in total, 20 here.

**A lighter ask than Part 7, and different in kind.** All 20 extract at **medium confidence with
none low**, because the work has largely already been done at ingest: **15 of 20 records
already store the supplication clause with the narrative frame stripped.** Checked word-by-word
against quran.com, `quran:10:85` begins at word 5 of 10 — the corpus has already dropped *“So
they said, upon Allah we have relied”*; `quran:11:45` begins at word 5 of 15, dropping *“And
Noah called out to his Lord and said”*; `quran:21:89` likewise drops *“And Zechariah, when he
called to his Lord”*.

So the question is **not “where does the supplication begin”** but **“is the boundary already in
our data the right one”**. That is a confirmation, not a transcription.

### All 20 of 20 align exactly to quran.com word-by-word

Every stored clause matched a contiguous run of words in its āyah. That matters for Gate 2:
because the alignment is exact, a transliteration can be **assembled from the per-word
transliteration quran.com already publishes** rather than transcribed by hand. The assembled
column below is generated that way, and none of it carries the `AA` romanisation artifact that
contaminates much of our existing transliteration data.

**Shown for review, not adopted.** Nothing is written to the corpus, and Gate 2 separately
requires that the provenance be named — a decision about crediting quran.com's word-by-word data,
which this table does not settle.

### The batch

| id | clause begins | stored Arabic (the proposed clause) | translation | assembled transliteration |
|---|---|---|---|---|
| `quran:10:85` | word 5/10 | رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْق… | Our Lord, make us not [objects of] trial for t… | rabbanā lā tajʿalnā fit'natan lil'qawmi … |
| `quran:10:88` | word 3/29 | رَبَّنَآ إِنَّكَ ءَاتَيْتَ فِرْعَوْنَ و… | Our Lord, indeed You have given Pharaoh and hi… | rabbanā innaka ātayta fir'ʿawna wamala-a… |
| `quran:11:45` | word 5/15 | رَبِّ إِنَّ ٱبْنِى مِنْ أَهْلِى وَإِنَّ … | My Lord, indeed my son is of my family; and in… | rabbi inna ib'nī min ahlī wa-inna waʿdak… |
| `quran:12:33` | word 2/17 | رَبِّ ٱلسِّجْنُ أَحَبُّ إِلَىَّ مِمَّا ي… | My Lord, prison is more to my liking than that… | rabbi l sij'nu aḥabbu ilayya mimmā yadʿū… |
| `quran:14:36` | whole āyah | رَبِّ إِنَّهُنَّ أَضْلَلْنَ كَثِيرًا مِّ… | My Lord, indeed they have led astray many amon… | rabbi innahunna aḍlalna kathīran mina l-… |
| `quran:14:37` | word 13/26 | رَبَّنَا لِيُقِيمُوا۟ ٱلصَّلَوٰةَ فَٱجْع… | Our Lord, I have settled some of my descendant… | rabbanā liyuqīmū l-ṣalata fa-ij'ʿal afid… |
| `quran:14:38` | whole āyah | رَبَّنَآ إِنَّكَ تَعْلَمُ مَا نُخْفِى و… | Our Lord, indeed You know what we conceal and … | rabbanā innaka taʿlamu mā nukh'fī wamā n… |
| `quran:14:40` | word 7/9 | رَبَّنَا وَتَقَبَّلْ دُعَآءِ | Our Lord, and accept my supplication. | rabbanā wataqabbal duʿāi |
| `quran:14:41` | whole āyah | رَبَّنَا ٱغْفِرْ لِى وَلِوَٰلِدَىَّ وَلِ… | Our Lord, forgive me and my parents and the be… | rabbanā igh'fir lī waliwālidayya walil'm… |
| `quran:18:10` | word 7/16 | رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةً… | Our Lord, grant us from Yourself mercy and pre… | rabbanā ātinā min ladunka raḥmatan wahay… |
| `quran:19:4` | word 2/14 | رَبِّ إِنِّى وَهَنَ ٱلْعَظْمُ مِنِّى وَٱ… | My Lord, indeed my bones have weakened, and my… | rabbi innī wahana l-ʿaẓmu minnī wa-ish't… |
| `quran:19:8` | word 2/14 | رَبِّ أَنَّىٰ يَكُونُ لِى غُلَـٰمٌ وَكَا… | My Lord, how will I have a boy when my wife ha… | rabbi annā yakūnu lī ghulāmun wakānati i… |
| `quran:2:126` | word 4/30 | رَبِّ ٱجْعَلْ هَـٰذَا بَلَدًا ءَامِنًا و… | My Lord, make this a secure city and provide i… | rabbi ij'ʿal hādhā baladan āminan wa-ur'… |
| `quran:2:128` | whole āyah | رَبَّنَا وَٱجْعَلْنَا مُسْلِمَيْنِ لَكَ … | Our Lord, and make us Muslims [in submission] … | rabbanā wa-ij'ʿalnā mus'limayni laka wam… |
| `quran:2:129` | whole āyah | رَبَّنَا وَٱبْعَثْ فِيهِمْ رَسُولًا مِّن… | Our Lord, and send among them a messenger from… | rabbanā wa-ib'ʿath fīhim rasūlan min'hum… |
| `quran:2:260` | word 4/39 | رَبِّ أَرِنِى كَيْفَ تُحْىِ ٱلْمَوْتَىٰ … | My Lord, show me how You give life to the dead… | rabbi arinī kayfa tuḥ'yī l mawtā qāla aw… |
| `quran:20:45` | word 2/10 | رَبَّنَآ إِنَّنَا نَخَافُ أَن يَفْرُطَ … | Our Lord, indeed we are afraid that he will ha… | rabbanā innanā nakhāfu an yafruṭa ʿalayn… |
| `quran:21:112` | word 2/10 | رَبِّ ٱحْكُم بِٱلْحَقِّ ۗ وَرَبُّنَا ٱلر… | My Lord, judge [between us] in truth. And our … | rabbi uḥ'kum bil-ḥaqi warabbunā l raḥmān… |
| `quran:21:89` | word 5/11 | رَبِّ لَا تَذَرْنِى فَرْدًا وَأَنتَ خَيْ… | My Lord, do not leave me alone [with no heir],… | rabbi lā tadharnī fardan wa-anta khayru … |
| `quran:23:109` | word 7/14 | رَبَّنَآ ءَامَنَّا فَٱغْفِرْ لَنَا وَٱر… | Our Lord, we have believed, so forgive us and … | rabbanā āmannā fa-igh'fir lanā wa-ir'ḥam… |

### What we are asking

One question per row: **is the stored Arabic the supplication, at the right boundary?** Useful
answers take three shapes — *confirmed*; *move the boundary* (say which word it starts or ends
at); or *not a supplication*, which is a Gate 1 answer and a valid one.

The row marked **“whole āyah”** stores the entire verse rather than a clause and deserves a
second look: either the āyah is supplication throughout, or the frame was missed at ingest.

### Not asked

We are not asking you to transcribe transliteration — the assembled column exists so that work
does not fall to you. Not asking about occasion assignment. And **no** `dua_clause_arabic` or
`dua_clause_verified` value has been written: under R3a as amended on 2026-08-03 that flag is
set only by owner sign-off recorded in this document, and never carries a name onto a rendered
page.

---

## Part 9 — Transliteration adoption, batch 1 (18 records, 12 distinct texts)

Added 2026-08-03. **⚠ NOT Gate-2 satisfied — machine-proposed, UNVERIFIED.**

Every proposal below is machine-proposed and carries that flag until you individually **adopt,
correct, or reject** it, exactly as row 43 (the Talbiyah) was handled. **Nothing has been written
to the corpus and no `transliterationSource` has been set.** Only your ruling clears the ⚠.
"Reviewer-written (adopted)" has deliberately **not** been pre-applied.

### Why these 18 first

12 distinct texts cover 18 records because **six of them are exact-duplicate Arabic** —
the same six R6 clusters already adjudicated. One ruling clears both members of each pair.

### House style, following row 43

The adopted Talbiyah set the conventions, and these follow it rather than inventing a second
style: long vowels **ā ī ū**; **ʿ** for ʿayn and **ʾ** for hamza; emphatics **ḥ ṣ ḍ ṭ ẓ**;
digraphs **th dh kh sh gh**; sun letters assimilated (`wa-n-niʿmata`, not `wa-l-niʿmata`);
the article hyphenated; elision marked (`Labbayka-llāhumma`).

**This is a full correction, not an `AA`→`ʿ` swap.** A partial fix produces a worse hybrid —
proper ʿayn beside `innee`, `oshhiduk` — that reads as corrected while still being wrong. Long
vowels, hamza, emphatics and assimilation are all restored together.

### The batch

| id | Arabic | existing (flawed) | **proposed ALA-LC** | translation |
|---|---|---|---|---|
| `17:34`<br>`19:42` | <div dir="rtl" lang="ar">((سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ، اللَّهُمَّ اغْفِرْ لِي)).</div> | (Subhanakal-lahumma rabbana wabihamdik, allahummagh-fir lee) | **Subhaanaka allaahumma rabbanaa wabihamdika, allaahummaghfir lee** | (How perfect You are O Allah, our Lord and I praise You. O Allah, forgive me.) |
| `17:35`<br>`19:43` | <div dir="rtl" lang="ar">((سُبُّوُحٌ، قُدُّوسٌ، رَبُّ المَلاَئِكَةِ وَالرُّوحِ)).</div> | (Subboohun quddoos, rabbul-mala-ikati warrooh.) | **Subboohun, Quddoosun, rabbul malaa'ikati war rooh** | (Perfect and Holy (He is), Lord of the angles and the Rooh (i.e. Jibra-eel).) |
| `17:37`<br>`19:45` | <div dir="rtl" lang="ar">((سُبْحَانَ ذِي الْجَبَرُوتِ، وَالْمَلَكُوتِ، وَالْكِبْرِيَاءِ، وَالْعَظَمَةِ)).</div> | (Subhana thil-jabaroot, walmalakoot, walkibriya/, walAAathamah.) | **Subhaana dheel jabarooti, wal malakooti, wal kibriyaa'i, wal 'azamah** | (How perfect He is, The Possessor of total power, sovereignty, magnificence and grandeur.) |
| `19:47`<br>`32:117` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَعُوذُ بِرِضَاكَ مِنْ سَخَطِكَ، وَبِمُعَافَاتِكَ مِنْ عُقوبَتِكَ، وَأَعُوذُ بِكَ مِنْكَ، لاَ أُحْصِي ثَنَاءً عَلَيْكَ، أَنْتَ كَمَا أَثْنَيْتَ عَلَى نَفْسِكَ)).</div> | (Allahumma innee aAAoothu biridaka min sakhatik, wa-bimuAAafatika min AAuqoobatik, wa-aAAoothu bika mink, la ohsee thana-an AAalayk, anta kama athnayta AAala nafsik.) | **Allaahumma innee a'oodhu biridaaka min sakhatika, wabimu'aafaatika min 'uqoobatika, wa a'oodhu bika minka, laa uhsee thanaa'an 'alayka, anta kamaa athnayta 'alaa nafsika** | (O Allah, I take refuge within Your pleasure from Your displeasure and within Your pardon from Your punishment, and I take refuge in You from You. I cannot enumerate Your praise, You are as You have praised Yourself.) |
| `27:85`<br>`28:109` | <div dir="rtl" lang="ar">((اللَّهُمَّ عَالِمَ الغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطانِ وَشَرَكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ)).</div> | allahumma 'alimal-ghaybi wash shahadati, fatiras-samawati wal ard, rabbakulli shayin wa malikahu. ashhadu alla ilaha illa anta, a'udhu bika min sharri nafsi, wa min sharri ash shaytani wa shirkih. wa an aqtarifa 'ala nafsi su'an aw ajurrahu ila muslim | **Allaahumma 'aalimal ghaybi wash shahaadati, faatiras samaawaati wal ardi, rabba kulli shay'in wamaleekahu, ashhadu an laa ilaaha illaa anta, a'oodhu bika min sharri nafsee, wamin sharrish shaytaani washarakihi, wa an aqtarifa 'alaa nafsee soo'an, aw ajurrahu ilaa muslim** | O Allah, Knower of the unseen and the seen, Creator of the heavens and the earth, Lord of all things and their Sovereign. I bear witness that there is no deity worthy of worship except You. I seek refuge in You from the evil of myself, Satan and his soldiers (temptations to commit shirk against Allah), and I (seek refuge in You) from committing evil against myself or dragging it to a Muslim. ⚠ **This cell shows `27:85` only — `28:109` reads `washirkihi` (وَشِرْكِهِ), not `washarakihi` (وَشَرَكِهِ). search-corpus.json is authoritative.** |
| `34:121`<br>`41:137` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ)).</div> | (Allahumma innee aAAoothu bika minal-hammi walhuzn, walAAajzi walkasali walbukhli waljubn, wadalAAid-dayni waghalabatir-rijal.) | **Allaahumma innee a'oodhu bika minal hammi wal hazani, wal 'ajzi wal kasali, wal bukhli wal jubni, wadala'id dayni waghalabatir rijaal** | (O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being over powered by men.) |
| `126:245` | <div dir="rtl" lang="ar">((لاَ إِلَهَ إِلاَّ اللَّهُ!)).</div> | (La ilaha illal-lah.) | **Laa ilaaha illallaah** | (None has the right to be worshipped except Allah.) |
| `27:95` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً)) (إذا أصبحَ).</div> | allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan | **Allaahumma innee as'aluka 'ilman naafi'an, warizqan tayyiban, wa'amalan mutaqabbalan** | O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds. |
| `24:61` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ)).</div> | (Allahumma innee as alukal-jannah, wa-aAAoothu bika minan-nar.) | **Allaahumma innee as'alukal jannata wa a'oodhu bika minan naar** | (O Allah, I ask You to grant me Paradise and I take refuge in You from the Fire.) |
| `61:166` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَسْــــــأَلُكَ خَيْرَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا)).</div> | allahumma inni as'aluka khayraha wa a'udhu bika min sharriha | **Allaahumma innee as'aluka khayrahaa, wa a'oodhu bika min sharrihaa** | O Allah, I ask You for the good of this wind, and I seek refuge in You from its evil. |
| `27:93` | <div dir="rtl" lang="ar">((لاَ إِلَهَ إِلاَّ اللَّهُ، وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ)) (مائةَ مرَّةٍ إذا أصبحَ).</div> | la ilaha illa allah wahdahu la sharika lah. lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir | **Laa ilaaha illallaahu, wahdahu laa shareeka lah, lahul mulku walahul hamdu wahuwa 'alaa kulli shay'in qadeer** | There is no deity worthy of worship except Allah alone, He has no partner. To Him belongs dominion and praise, and He is over all things competent. |
| `6:10` | <div dir="rtl" lang="ar">([بِسْمِ اللَّهِ] اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبائِث).</div> | ((Bismil-lah) allahumma innee aAAoothu bika minal-khubthi wal khaba-ith.) | **[Bismillaah] Allaahumma innee a'oodhu bika minal khubthi wal khabaa'ith** | ((In the name of Allah). O Allah, I take refuge with you from all evil and evil-doers.) |

**`27:85` / `28:109` — the table row above shows `27:85`'s text only.** The two records do
NOT share a transliteration: `27:85` reads `washarakihi` (Arabic وَشَرَكِهِ) and `28:109` reads
`washirkihi` (Arabic وَشِرْكِهِ). A single table row cannot carry both, so the **corpus is
authoritative** for `28:109` and this row is a display artifact. Verified by codepoint.

### Source-text defects found while transliterating

**`17:35` / `19:43`** — The Arabic field reads `سُبُّوُحٌ` — a damma on the wāw that is not standard orthography (expected `سُبُّوحٌ`). Transliterated as the standard form; **flagging the source text, not silently normalising it**.

**`17:37` / `19:45`** — Old romanisation contained a stray `/` (`walkibriya/`) and rendered `ظ` as `th` (`walAAathamah`); `ظ` is ẓ.

**`27:85` / `28:109`** — This pair's existing romanisation is in a DIFFERENT scheme from the `AA` set (apostrophe for ʿayn, all-lowercase). The 116 are not one scheme — see the note under the table.

**`34:121` / `41:137`** — Old read `walhuzn`; the Arabic is `الْحَزَنِ` (ḥazan), not ḥuzn.

**`27:95`** — The Arabic field carries a trailing Arabic instruction `(إذا أصبحَ)` — “when morning comes”. NOT transliterated: it is an annotation, not recited text. Related to parked item 1.

**`61:166`** — The Arabic contains tatweel (kashida) padding: `أَسْــــــأَلُكَ`. Decorative elongation, carries no sound; ignored for transliteration and flagged as a source defect.

**`27:93`** — Trailing `(مائةَ مرَّةٍ إذا أصبحَ)` is a repetition instruction, not recited text — not transliterated.

**`6:10`** — Square brackets preserved from the source, which marks `بِسْمِ اللَّهِ` as an optional/variant opening.

### One finding that changes the shape of the remaining work

**The 116 are not a single romanisation scheme.** `27:85`/`28:109` use apostrophe-for-ʿayn
lowercase (`allahumma 'alimal-ghaybi`), while the `AA` set uses `AAala`. At least two upstream
conventions are mixed in, so a single find-and-replace was never going to work — which is the
same conclusion the sourcing investigation reached from the other direction.

### What we are asking

Per record (or per pair): **adopt** the proposal as reviewer-written, **correct** the wording, or
**reject** it. Adoption is what sets `transliterationSource` and clears both Gate 2 and validator
rule R10 for that record — and the on-page "Romanization source not verified" note retires itself
automatically on the next build, since it is gated on the same test.

---

## Part 10 — Transliteration adoption, batch 2 (14 records)

Added 2026-08-03. **⚠ NOT Gate-2 satisfied — machine-proposed, UNVERIFIED.**

Same standing as Part 9: nothing written to the corpus, no `transliterationSource` set, nothing
marked reviewer-written. Only your ruling — **adopt, correct or reject** — clears the ⚠.

These continue the shared-formula priority: all 14 carry the tahlil
(`لا إله إلا الله وحده لا شريك له…`), the `اللهم إني أسألك` opening, or the
`أعوذ بك من` formula, so the recurring phrases are ruled once and reused.

### The batch

| id | Arabic | existing (flawed) | **proposed ALA-LC** | translation |
|---|---|---|---|---|
| `27:92` | <div dir="rtl" lang="ar">((لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ)) (عشرَ مرَّات) ، أَوْ (مرَّةً واحدةً عندَ الكَسَلِ).</div> | la ilaha illa allah wahdahu la sharika lah. lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir | **Laa ilaaha illallaahu, wahdahu laa shareeka lah, lahul mulku walahul hamdu wahuwa 'alaa kulli shay'in qadeer** | There is no deity worthy of worship except Allah alone, He has no partner. To Him belongs dominion and praise, and He is over all things competent. |
| `25:69` | <div dir="rtl" lang="ar">((سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ (ثلاثاً وثلاثين) لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ)).</div> | (Subhanal-lah walhamdu lillah, wallahu akbar (thirty-three times). (La ilaha illal-lahu wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa AAala kulli shayin qadeer.)) | **Subhaanallaahi, wal hamdu lillaahi, wallaahu akbar. Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul mulku walahul hamdu wahuwa 'alaa kulli shay'in qadeer** | (How perfect Allah is, all praise is for Allah, and Allah is the greatest.(thirty-three times) (None has the right to be worshipped except Allah, alon |
| `98:209` | <div dir="rtl" lang="ar">((لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لاِ يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ)).</div> | (La ilaha illal-lah, wahdahu la shareeka lah, lahul-mulku walahul-hamd, yuhyee wayumeetu wahuwa hayyun la yamoot, biyadihil-khayru wahuwa AAala kulli shayin qadeer.) | **Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul mulku walahul hamdu, yuhyee wayumeetu, wahuwa hayyun laa yamootu, biyadihil khayru, wahuwa 'alaa kulli shay'in qadeer** | (None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise. He gives life and causes death,  |
| `25:73` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً)) بَعْدَ السّلامِ مِنْ صَلاَةِ الفَجْرِ.</div> | allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan | **Allaahumma innee as'aluka 'ilman naafi'an, warizqan tayyiban, wa'amalan mutaqabbalan** | O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds. |
| `24:56` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَعوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَأَعوذُ بِكَ مِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ، وَأَعوذُ بِكَ مِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ. اللَّهُمَّ إِنِّي أَعوذُ بِكَ مِنَ الْمَأْثَمِ وَالْمَغْرَمِ)).</div> | (Allahumma innee aAAoothu bika min AAathabil-qabr, wa-aAAoothu bika min fitnatil-maseehid-dajjal, wa-aAAoothu bika min fitnatil-mahya walmamat. Allahumma innee aAAoothu bika minal-ma/thami walmaghram.) | **Allaahumma innee a'oodhu bika min 'adhaabil qabri, wa a'oodhu bika min fitnatil maseehid dajjaali, wa a'oodhu bika min fitnatil mahyaa wal mamaati. Allaahumma innee a'oodhu bika minal ma'thami wal maghram** | (O Allah, I take refuge in You from the punishment of the grave, and I take refuge in You from the temptation and trial of Al Maseeh Ad Dajjal, and I  |
| `9:13` | <div dir="rtl" lang="ar">(أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّداً عَبْدُهُ وَرَسُولُهُ..).</div> | (Ashhadu an la ilaha illal-lahu wahdahu la shareeka lah, wa-ashhadu anna Muhammadan AAabduhu warasooluh.) | **Ashhadu an laa ilaaha illallaahu wahdahu laa shareeka lah, wa ashhadu anna Muhammadan 'abduhu warasooluh** | (I bear witness that none has the right to be worshipped except Allah, alone without partner, and I bear witness that Muhammad is His slave and Messen |
| `35:122` | <div dir="rtl" lang="ar">((لاَ إِلَهَ إِلاَّ اللَّهُ الْعَظِيمُ الْحَلِيمُ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ)).</div> | (La ilaha illal-lahul-AAatheemul-haleem, la ilaha illal-lahu rabbul-AAarshil-AAatheem, la ilaha illal-lahu rabbus-samawati warabbul-ardi warabbul-AAarshil-kareem.) | **Laa ilaaha illallaahul 'azeemul haleem, laa ilaaha illallaahu rabbul 'arshil 'azeem, laa ilaaha illallaahu rabbus samaawaati warabbul ardi warabbul 'arshil kareem** | (None has the right to be worshipped except Allah Forbearing. None has the right to be worshipped except Allah, Lord of the magnificent throne. None h |
| `35:124` | <div dir="rtl" lang="ar">((لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظّالِمِينَ)).</div> | (La ilaha illa anta subhanaka innee kuntu minath-thalimeen.) | **Laa ilaaha illaa anta subhaanaka innee kuntu minaz zaalimeen** | (None has the right to be worshipped except You. How perfect You are, verily I was among the wrong-doers.) |
| `1:1` | <div dir="rtl" lang="ar">(.الْحَمْدُ للَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا، وَإِلَيْهِ النُّشُورُ )</div> | alhamdulillahilladhi ahyana ba'da ma amatana wa ilayhin-nushur | **Alhamdu lillaahi alladhee ahyaanaa ba'da maa amaatanaa, wa ilayhin nushoor** | All praise is for Allah who gives us life after He has caused us to die, and to Him is the resurrection. |
| `27:82` | <div dir="rtl" lang="ar">((اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ)) (ثلاثَ مرَّاتٍ).</div> | allahumma 'afini fi badani, allahumma 'afini fi sam'i, allahumma 'afini fi basari, la ilaha illa anta. allahumma inni a'udhu bika minal-kufri wal faqr, allahumma inni a'udhu bika min 'adhabil-qabr, la ilaha illa anta | **Allaahumma 'aafinee fee badanee, allaahumma 'aafinee fee sam'ee, allaahumma 'aafinee fee basaree, laa ilaaha illaa anta. Allaahumma innee a'oodhu bika minal kufri wal faqri, wa a'oodhu bika min 'adhaabil qabri, laa ilaaha illaa anta** | O Allah, protect my body (from illness and from what I do not want). O Allah, protect my hearing (from illness and disobedience or from what I do not  |
| `24:64` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ لَا إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، الْمَنَّانُ، يَا بَدِيعَ السَّمَوَاتِ وَالْأَرْضِ يَا ذَا الْجَلاَلِ وَالْإِكْرَامِ، يَا حَيُّ يَا قَيُّومُ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ)).</div> | (Allahumma innee as aluka bianna lakal-hamd, la ilaha illa ant wahdaka la shareeka lak, almannan, ya badeeAAas-samawati wal ard, ya thal-jalali wal ikram, ya hayyu ya qayyoom, innee as alukal-jannah, wa-aAAoothu bika minan-nar.) | **Allaahumma innee as'aluka bi anna lakal hamda, laa ilaaha illaa anta wahdaka laa shareeka lak, al Mannaan, yaa Badee'as samaawaati wal ard, yaa Dhaal jalaali wal ikraam, yaa Hayyu yaa Qayyoom, innee as'alukal jannata wa a'oodhu bika minan naar** | (O Allah, I ask You as unto You is all praise, none has the right to be worshipped except You, alone, without partner. You are the Benefactor. O Origi |
| `1:2` | <div dir="rtl" lang="ar">لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَريكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ للَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفرْ لِي</div> | (La ilaha illal-lahu wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa AAala kulli shay-in qadeer, subhanal-lah, walhamdu lillah, wala ilaha illal-lah wallahu akbar, wala hawla wala quwwata illa billahil-AAaliyyil AAatheem. Rabbigh-fir lee) | **Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul mulku walahul hamdu, wahuwa 'alaa kulli shay'in qadeer. Subhaanallaahi, wal hamdu lillaahi, walaa ilaaha illallaahu, wallaahu akbar, walaa hawla walaa quwwata illaa billaahil 'aliyyil 'azeem. Rabbighfir lee** | (None has the right to be worshipped except Allah, alone without associate, to Him belongs sovereignty and praise and He is over all things wholly cap |
| `25:67` | <div dir="rtl" lang="ar">((لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ [ثلاثاً]، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الجَدُّ)).</div> | la ilaha illa allah wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir. allahumma la mani'a lima a'tayta wa la mu'tiya lima mana'ta wa la yanfa'u dhal-jaddi minkal-jaddu | **Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul mulku walahul hamdu wahuwa 'alaa kulli shay'in qadeer. Allaahumma laa maani'a limaa a'tayta, walaa mu'tiya limaa mana'ta, walaa yanfa'u dhaal jaddi minkal jadd** | There is no deity worthy of worship except Allah alone, He has no partner. To Him belongs dominion and praise, and He is over all things competent. O  |
| `25:68` | <div dir="rtl" lang="ar">((لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ، وَلاَ نَعْبُدُ إِلاَّ إِيَّاهُ, لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لَا إِلَهَ إِلاَّ اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الكَافِرُونَ)).</div> | la ilaha illa allah wahdahu la sharika lah. lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir. la hawla wa la quwwata illa billah. la ilaha illa allah wa la na'budu illa iyyah. lahun-ni'mah wa lahul-fadl wa lahuth-thana'ul-hasan. la ilaha illa allah mukhlisina lahud-dina wa law karihal-kafirun | **Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul mulku walahul hamdu, wahuwa 'alaa kulli shay'in qadeer. Laa hawla walaa quwwata illaa billaah, laa ilaaha illallaah, walaa na'budu illaa iyyaah, lahun ni'matu walahul fadlu walahuth thanaa'ul hasan, laa ilaaha illallaahu mukhliseena lahud deena walaw karihal kaafiroon** | There is no deity worthy of worship except Allah alone, He has no partner. To Him belongs dominion and praise, and He is over all things competent. Th |

### Source-text defects found while transliterating

**`27:92`** — **Recited text is identical to `27:93` in Part 9.** The stored fields differ by a single stranded word — `أَوْ` (“or”), sitting between two instruction parentheticals and inside neither, so it survives annotation-stripping. One ruling should cover both.

**`25:69`** — The count `(ثلاثاً وثلاثين)` sits mid-text and is an instruction, not recited words — not transliterated. The old romanisation rendered it as English “(thirty-three times)”, i.e. it **translated inside a transliteration field**.

**`98:209`** — Arabic reads `لاِ يَمُوتُ` — a kasra on the alif of `لا`, not standard (expected `لاَ`). Transliterated as the standard form; source flagged, not silently rewritten.

**`25:73`** — **Recited text is identical to `27:95` in Part 9.** The fields differ only because this record stores its instruction as bare prose — `بَعْدَ السّلامِ مِنْ صَلاَةِ الفَجْرِ` — rather than in parentheses, so no mechanical strip catches it. One ruling should cover both.

**`24:56`** — Old romanisation contained a stray `/` (`minal-ma/thami`) — the same corruption seen at `17:37`. It stands for the hamza in `الْمَأْثَمِ`.

**`35:124`** — Old rendered `ظ` as `th` (`minath-thalimeen`); `ظ` is ẓ, and the article assimilates: `mina-ẓ-ẓālimīn`.

**`1:1`** — The Arabic field opens with a stray full stop before the text (`(.الْحَمْدُ`) — a source artifact, not recited.

**`27:82`** — The old romanisation inserts a second `allahumma inni a'udhu bika` before `min 'adhabil-qabr`; the Arabic reads only `وَأَعُوذُ بِكَ`. The proposal follows the **Arabic**, not the old romanisation.

### A counting correction, and why it matters for planning

Part 9 stated **110 distinct transliterations** for the 116 records, from de-duplicating on raw
Arabic. Two refinements since:

- Stripping instruction annotations before comparing gives **109**, not 110.
- More importantly, **mechanical de-duplication UNDERCOUNTS the real overlap**, because
  instruction annotations are stored in at least three inconsistent forms — parenthesised
  (`(إذا أصبحَ)`), bracketed (`[ثلاثاً]`), and **bare prose**
  (`بَعْدَ السّلامِ مِنْ صَلاَةِ الفَجْرِ`). Two pairs in this batch are word-for-word identical
  in **recited text** yet differ as stored fields: `27:92`/`27:93` by a single stranded
  `أَوْ` between two parentheticals, and `25:73`/`27:95` by a bare unparenthesised
  instruction.

So the number of distinct **recited** texts is lower than 109, and cannot be established by
string comparison while annotations live inside the `arabic` field. That is the same defect as
parked item 1, surfacing from a new direction: it does not just affect display, it defeats
de-duplication.

**A first honest correction was itself caught here.** An earlier version of the de-dup regex
matched from the outer `((` delimiter and swallowed a whole prefix, reporting `25:69` and
`27:93` as identical when they are not. Recorded because the failure mode — a grouping that
looks like leverage but is an artifact — would have had you adopt one ruling across two different
supplications.

---

## Part 11 — Transliteration adoption, batch 3 (18 records)

Added 2026-08-03. **⚠ NOT Gate-2 satisfied — machine-proposed, UNVERIFIED.**

Same standing as Parts 9 and 10: nothing written to the corpus, no `transliterationSource` set,
nothing marked reviewer-written.

The shared-formula seam is now essentially worked out — of the 84 records remaining before this
batch, only **7** still shared a formula with another remaining record. This batch takes those
first, then the shortest unique records, on the reasoning that short records are the cheapest to
rule and clear the most ground per minute of review.

### The batch

| id | Arabic | existing (flawed) | **proposed ALA-LC** | translation |
|---|---|---|---|---|
| `27:83` | <div dir="rtl" lang="ar">((حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيهِ تَوَكَّلتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ)) (سَبْعَ مَرّاتٍ).</div> | (Hasbiyal-lahu la ilaha illa huwa, AAalayhi tawakkalt, wahuwa rabbul-AAarshil-AAatheem (Recite seven times in Arabic.) | **Hasbiyallaahu laa ilaaha illaa huwa, 'alayhi tawakkaltu, wahuwa rabbul 'arshil 'azeem** | Allah is Sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.’ (Recite s |
| `35:123` | <div dir="rtl" lang="ar">((اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لاَ إِلَهَ إِلاَّ أَنْتَ)).</div> | (Allahumma rahmataka arjoo fala takilnee ila nafsee tarfata AAayn, wa-aslih lee sha/nee kullah, la ilaha illa ant.) | **Allaahumma rahmataka arjoo, falaa takilnee ilaa nafsee tarfata 'ayn, wa aslih lee sha'nee kullah, laa ilaaha illaa ant** | (O Allah, it is Your mercy that I hope for, so do not leave me in charge of my affairs even for a blink of an eye and rectify for me all of  |
| `24:58` | <div dir="rtl" lang="ar">((اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ، وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ، وَمَا أَعْلَنْتُ، وَمَا أَسْرَفْتُ، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي. أَنْتَ الْمُقَدِّمُ، وَأَنْتَ الْمُؤَخِّرُ لاَ إِلَهَ إِلاَّ أَنْتَ)).</div> | (Allahummagh-fir lee ma qaddamtu, wama akhkhart, wama asrartu wama aAAlant, wama asraftt, wama anta aAAlamu bihi minnee, antal-muqaddimu wa-antal-mu-akhkhiru la ilaha illa ant.) | **Allaahummaghfir lee maa qaddamtu, wamaa akhkhartu, wamaa asrartu, wamaa a'lantu, wamaa asraftu, wamaa anta a'lamu bihi minnee. Antal Muqaddimu wa antal Mu'akhkhiru, laa ilaaha illaa ant** | O Allah, forgive me for those sins which have come to pass as well as those which shall come to pass, and those I have committed in secret a |
| `27:80` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتِكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ)) (أربعَ مَرَّاتٍ).[ وإذا أمسى قال: اللَّهم إني أمسيت...]</div> | (Allahumma innee asbahtu oshhiduk, wa-oshhidu hamalata AAarshik, wamala-ikatak, wajameeAAa khalqik, annaka antal-lahu la ilaha illa ant, wahdaka la shareeka lak, wa-anna Muhammadan AAabduka warasooluk .) (four times in the morning & evening)(Note: for the evening, one reads (amsaytu) instead of (asbahtu).) | **Allaahumma innee asbahtu ushhiduka, wa ushhidu hamalata 'arshika, wamalaa'ikataka, wajamee'a khalqika, annaka anta allaahu laa ilaaha illaa anta wahdaka laa shareeka lak, wa anna Muhammadan 'abduka warasooluk** | (O Allah, verily I have reached the morning and call on You, the bearers of Your throne, Your angles, and all of Your creation to witness th |
| `27:79` | <div dir="rtl" lang="ar">((اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنوبَ إِلاَّ أَنْتَ)).</div> | allahumma anta rabbi la ilaha illa anta khalaqtani wa ana 'abduka wa ana 'ala 'ahdika wa wa'dika mastata'tu a'udhu bika min sharri ma sana'tu abu'u laka bini'matika 'alayya wa abu'u bidhanbi faghfir li fa innahu la yaghfirudh-dhunuba illa anta | **Allaahumma anta Rabbee laa ilaaha illaa anta, khalaqtanee wa anaa 'abduka, wa anaa 'alaa 'ahdika wawa'dika mastata'tu, a'oodhu bika min sharri maa sana'tu, aboo'u laka bini'matika 'alayya, wa aboo'u bidhanbee faghfir lee fa innahu laa yaghfirudh dhunooba illaa ant** | O Allah, You are my Lord. There is no deity worthy of worship except You. You created me, and I am Your servant. I abide to Your covenant an |
| `7:11` | <div dir="rtl" lang="ar">(غُفْرَانَكَ).</div> | ghufranak | **Ghufraanak** | I ask for Your forgiveness (O Allah). |
| `64:172` | <div dir="rtl" lang="ar">((اللَّهُمَّ صَيِّباً نَافِعاً)).</div> | allahumma sayyiban nafi'a | **Allaahumma sayyiban naafi'an** | O Allah, make it a beneficial rain. |
| `18:38` | <div dir="rtl" lang="ar">((سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ)).</div> | (SamiAAal-lahu liman hamidah) | **Sami'allaahu liman hamidah** | (May Allah answer he who praises Him.)(This supplication is to be made while rising.) |
| `28:105` | <div dir="rtl" lang="ar">((بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا)).</div> | bismika allahumma amutu wa ahya | **Bismika allaahumma amootu wa ahyaa** | In Your name, O Allah, I die and I live. |
| `36:128` | <div dir="rtl" lang="ar">((حَسْبُنا اللَّهُ وَنِعْمَ الْوَكِيلُ)).</div> | (Hasbunal-lahu waniAAmal-wakeel.) | **Hasbunallaahu wani'mal wakeel** | (Allah is sufficient for us, and how fine a trustee (He is).) |
| `39:132` | <div dir="rtl" lang="ar">((اللَّهُمَّ اكْفِنِيهِمْ بِمَا شِئْتَ)).</div> | (Allahummak-fineehim bima shi/.) | **Allaahummakfineehim bimaa shi'ta** | (O Allah, protect me from them with what You choose.) |
| `65:173` | <div dir="rtl" lang="ar">((مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ)).</div> | mutirna bi fadlillahi wa rahmatih | **Mutirnaa bifadlillaahi warahmatih** | We have been given rain by the bounty and mercy of Allah. |
| `75:186` | <div dir="rtl" lang="ar">((إِنِّي صَائِمٌ، إِنِّي صَائِمٌ)).</div> | (Innee sa-im, innee sa-im.) | **Innee saa'imun, innee saa'im** | (I am fasting, I am fasting.) |
| `89:200` | <div dir="rtl" lang="ar">((أَحَبَّكَ الَّذِي أَحْبَبْتَنِي لَهُ)).</div> | (Ahabbakal-lathee ahbabtanee lah.) | **Ahabbaka alladhee ahbabtanee lah** | (May He, for whom you have loved me, love you.) |
| `27:91` | <div dir="rtl" lang="ar">((سُبْحَانَ اللَّهِ وَبِحَمْدِهِ)) (مائة مرَّةٍ).</div> | subhanallahi wa bihamdihi | **Subhaanallaahi wabihamdih** | Glory be to Allah, and praise be to Him. |
| `59:164` | <div dir="rtl" lang="ar">((اللَّهُمَّ اغْفِرْ لَهُ، اللَّهُمَّ ثَبِّتْهُ)).</div> | Allaahum-maghfir lahu Allaahumma thabbithu | **Allaahummaghfir lahu, allaahumma thabbithu** | O Allah, forgive him. O Allah, strengthen him |
| `20:48` | <div dir="rtl" lang="ar">((رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي)).</div> | (Rabbigh-fir lee, rabbigh-fir lee.) | **Rabbighfir lee, rabbighfir lee** | (My Lord forgive me, My Lord forgive me.) |
| `28:104` | <div dir="rtl" lang="ar">((اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ)).</div> | (Allahumma qinee AAathabaka yawma tabAAathu AAibadak.) | **Allaahumma qinee 'adhaabaka yawma tab'athu 'ibaadak** | (O Allah, protect me from Your punishment on the day Your servants are resurrected.) |

### Source-text defects found while transliterating

**`27:83`** — Old field ends `(Recite seven times in Arabic.` — an **English instruction inside the transliteration field**, with an unbalanced parenthesis. Not recited; not transliterated.

**`35:123`** — Third instance of the stray `/` standing for hamza (`sha/nee` → `shaʾnī`), after `17:37` and `24:56`.

**`24:58`** — Old contains a plain typo — `asraftt` with a doubled final t.

**`27:80`** — The `arabic` field carries a bracketed **evening variant** — `[وإذا أمسى قال: اللَّهم إني أمسيت...]` — i.e. a second recitable form stored as an annotation. Only the morning form (`aṣbaḥtu`) is transliterated. **Whether the evening form should be its own record is a content question, not a transliteration one.**

**`64:172`** — Old `nafi'a` drops the final tanwīn `-an`.

**`39:132`** — **The old romanisation LOST A WORD.** It reads `bima shi/.` — `شِئْتَ` (*shiʾta*, “You choose”) is not transliterated at all, only a stray `/` and a full stop. The most severe defect found so far: this is not a spelling problem, it is a missing word.

**`59:164`** — Old reads `Allaahum-maghfir` — long ā written as doubled `aa`. That is a **FOURTH** convention, distinct from the three already catalogued.

### The 116 contain FOUR romanisation conventions, not one

A census of the existing romanisations across all 116 records:

| n | convention | example |
|---:|---|---|
| **54** | `AA` for ʿayn — the Hisn-Muslim-Json scheme | `aAAoothu` |
| **31** | apostrophe for ʿayn, lowercase | `a'udhu` |
| **26** | plain ASCII, no ʿayn marker at all | `la ilaha illal-lah` |
| **5** | **already ALA-LC-like**, with macrons and ʿayn | `yaʿlamu`, `ḥif'ẓuhumā` |

Plus a fourth-convention outlier inside the ASCII group (`59:164`: `Allaahumma`, long ā as
doubled `aa`).

This is the strongest confirmation yet that **no character-level find-and-replace was ever
viable** — the same conclusion the upstream sourcing investigation reached from the other
direction, now established from the data itself.

### A subset may have a nameable source after all — 5 records, deferred

The 5 ALA-LC-like records — `1:4`, `27:75`, `27:76`, `28:100`, `28:101` — are **not**
from the Hisn dataset. All five carry
`translationSource: "Saheeh International via quran.com API v4, edition 20"`, i.e. their
romanisation arrived through the quran.com pipeline alongside the translation, not through
`wafaaelmaandy/Hisn-Muslim-Json`.

That matters twice over:

1. **Provenance.** Unlike the Hisn set, there is a named upstream pipeline to point at. Whether
   quran.com itself names a transliteration scheme or author is the open question — but this is
   the first subset where a metadata-only fix is even conceivable.
2. **Correction profile.** These are already close. Their defects are systematic rather than
   wholesale: hamza dropped (`takhudhuhu` → `taʾkhudhuhu`, `shāa` → `shāʾa`,
   `yaūduhu` → `yaʾūduhu`), gemination lost (`l-ḥayu` → `l-ḥayyu`), and an apostrophe
   used to mark sukūn (`idh'nihi`, `ʿil'mihi`, `kur'siyyuhu`, `ḥif'ẓuhumā`) which is not
   an ALA-LC convention.

**They are deliberately held out of this batch.** Correcting them alongside the Hisn set would
mix two different questions — a full retranscription and a light systematic fix on possibly
attributable text — into one ruling. They are proposed as their own batch once the quran.com
provenance question is answered, since a positive answer could clear them without any text change
at all.

---

## Part 12 — The 5 quran.com-sourced transliterations, corrected and normalised (5 records)

Added 2026-08-03. **⚠ NOT Gate-2 satisfied — machine-proposed, UNVERIFIED.**
Nothing written to the corpus. `transliterationSource` is **not** set until you approve.

### The mapping was proven, not assumed

None of these 5 carries a `verseRef` — all are `sourceKey: "other"` with no citation — so the
verse mapping could not be looked up. It was established by **reproduction**: assembling
quran.com's per-word transliteration for a candidate range and comparing to the string already in
our corpus.

| record | verse range | evidence |
|---|---|---|
| `27:75` | Qur'an 2:255 | assembled == stored, exact |
| `28:100` | Qur'an 2:255 | assembled == stored, exact |
| `28:101` | Qur'an 2:285–286 | assembled == stored, exact |
| `27:76` | Qur'an 112:1–4, 113:1–5, 114:1–6 | assembled == stored, exact |
| `1:4` | Qur'an 3:190–200 | assembled == stored, exact, 195 words |

A 195-word string reproducing character-for-character is not coincidence. It also **proves the
source**: the stored romanisation IS quran.com word-level output, so its defects were quran.com's,
not ours. My first candidate for `1:4` was 3:190–191; the data rejected it and the range widened
until it matched, so the mapping is evidence-led throughout.

### Two passes, applied in order

**Pass 1 — defect correction.** An explicit hand-verified map of **45 rules**; every rule matched
at least once, and any word not in the map kept quran.com's text unchanged.

| class | example | rules |
|---|---|---|
| gemination restored | `l-ḥayu` → `l-ḥayyu`, `l-qayūmu` → `l-qayyūmu` | 5 |
| medial/final hamza restored | `takhudhuhu` → `taʾkhudhuhu`, `shāa` → `shāʾa` | 13 |
| apostrophe-for-sukūn removed | `kur'siyyuhu` → `kursiyyuhu`, `ʿil'mihi` → `ʿilmihi` | 27 |

**Pass 2 — house-style normalisation (owner ruling 2026-08-03).** Sun-letter assimilation of the
article, matching Parts 9–11 and the Talbiyah row. **10 distinct transforms:**

```
l-samāwāti  -> s-samāwāti      wal-nāsi    -> wa-n-nāsi
l-rasūlu    -> r-rasūlu        wal-nahāri  -> wa-n-nahāri
l-ṣamadu    -> ṣ-ṣamadu        l-nāri      -> n-nāri
l-nafāthāti -> n-nafāthāti     l-nāra      -> n-nāra
l-nāsi      -> n-nāsi          l-thawābi   -> th-thawābi
```

Moon letters keep `l-` (`l-arḍi`, `l-ʿaẓīmu`); lām+lām is already written doubled
(`al-layli`); `al-lahu` is left as the conventional form of the divine name.

**Scope limit, stated so it is not mistaken for an oversight.** Only the ARTICLE was normalised.
The tokens' hyphenation to neighbouring words is left exactly as quran.com tokenises it —
restructuring token boundaries across a 195-word passage is a different and much larger change,
and was not what was ruled.

### This ruling is library-wide

Sun-letter assimilation is now the **standing convention for the whole dua library**, not a local
choice for these 5. Parts 9–11 already follow it; every future batch will. Recorded here because
it is the first point at which the convention was applied against a *named external base* rather
than to our own text.

### What this does to the provenance claim

Normalising conventions means these are no longer quran.com's text lightly corrected — they are
**reviewer-normalised**. The proposed `transliterationSource` says exactly that, so the base and
the intervention stay separable:

```
Base: quran.com API v4 word-level transliteration (verses/by_key,
word_fields=transliteration). Reviewer-corrected for gemination, medial hamza and
sukūn notation, and normalised to house-style sun-letter assimilation —
<date>, owner (ADR-044).
```

Same shape as the Talbiyah row: a named base plus a named intervention, neither claimed as the
other, and neither overstated.

#### `27:75` — Qur'an 2:255

*50 words · chapter: Words of remembrance for morning and evening*

**Base — quran.com API v4, verbatim:**

> al-lahu lā ilāha illā huwa l-ḥayu l-qayūmu lā takhudhuhu sinatun walā nawmun lahu mā fī l-samāwāti wamā fī l-arḍi man dhā alladhī yashfaʿu ʿindahu illā bi-idh'nihi yaʿlamu mā bayna aydīhim wamā khalfahum walā yuḥīṭūna bishayin min ʿil'mihi illā bimā shāa wasiʿa kur'siyyuhu l-samāwāti wal-arḍa walā yaūduhu ḥif'ẓuhumā wahuwa l-ʿaliyu l-ʿaẓīmu

**Proposed — corrected + normalised to house style:**

> A'oodhu billaahi minash shaytaanir rajeem. Allaahu laa ilaaha illaa huwal hayyul qayyoomu, laa ta'khudhuhu sinatun walaa nawmun lahu maa fees samaawaati wamaa feel ardi man dhaa alladhee yashfa'u 'indahu illaa bi idhnihi ya'lamu maa bayna aydeehim wamaa khalfahum walaa yuheetoona bishay'in min 'ilmihi illaa bimaa shaa'a wasi'a kursiyyuhus samaawaati wal arda walaa ya'ooduhu hifzuhumaa wahuwal 'aliyyul 'azeemu

**Translation on record:** Allāh - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is i…

#### `28:100` — Qur'an 2:255

*50 words · chapter: What to say before sleeping*

**Base — quran.com API v4, verbatim:**

> al-lahu lā ilāha illā huwa l-ḥayu l-qayūmu lā takhudhuhu sinatun walā nawmun lahu mā fī l-samāwāti wamā fī l-arḍi man dhā alladhī yashfaʿu ʿindahu illā bi-idh'nihi yaʿlamu mā bayna aydīhim wamā khalfahum walā yuḥīṭūna bishayin min ʿil'mihi illā bimā shāa wasiʿa kur'siyyuhu l-samāwāti wal-arḍa walā yaūduhu ḥif'ẓuhumā wahuwa l-ʿaliyu l-ʿaẓīmu

**Proposed — corrected + normalised to house style:**

> allaahu laa ilaaha illaa huwal hayyul qayyoomu laa ta'khudhuhu sinatun walaa nawmun lahu maa fees samaawaati wamaa feel ardi man dhaa alladhee yashfa'u 'indahu illaa bi idhnihi ya'lamu maa bayna aydeehim wamaa khalfahum walaa yuheetoona bishay'in min 'ilmihi illaa bimaa shaa'a wasi'a kursiyyuhus samaawaati wal arda walaa ya'ooduhu hifzuhumaa wahuwal 'aliyyul 'azeemu

**Translation on record:** Allāh - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is i…

#### `28:101` — Qur'an 2:285-286

*76 words · chapter: What to say before sleeping*

**Base — quran.com API v4, verbatim:**

> āmana l-rasūlu bimā unzila ilayhi min rabbihi wal-mu'minūna kullun āmana bil-lahi wamalāikatihi wakutubihi warusulihi lā nufarriqu bayna aḥadin min rusulihi waqālū samiʿ'nā wa-aṭaʿnā ghuf'rānaka rabbanā wa-ilayka l-maṣīru lā yukallifu l-lahu nafsan illā wus'ʿahā lahā mā kasabat waʿalayhā mā ik'tasabat rabbanā lā tuākhidh'nā in nasīnā aw akhṭanā rabbanā walā taḥmil ʿalaynā iṣ'ran kamā ḥamaltahu ʿalā alladhīna min qablinā rabbanā walā tuḥammil'nā mā lā ṭāqata lanā bihi wa-uʿ'fu ʿannā wa-igh'fir lanā wa-ir'ḥamnā anta mawlānā fa-unṣur'nā ʿalā l-qawmi l-kāfirīna

**Proposed — corrected + normalised to house style:**

> aamanar rasoolu bimaa unzila ilayhi min rabbihi wal mu'minoona kullun aamana billaahi wamalaa'ikatihi wakutubihi warusulihi laa nufarriqu bayna ahadin min rusulihi waqaaloo sami'naa wa ata'naa ghufraanaka rabbanaa wa ilaykal maseeru laa yukallifu allaahu nafsan illaa wus'ahaa lahaa maa kasabat wa'alayhaa maa iktasabat rabbanaa laa tu'aakhidhnaa in naseenaa aw akhta'naa rabbanaa walaa tahmil 'alaynaa isran kamaa hamaltahu 'alaa alladheena min qablinaa rabbanaa walaa tuhammilnaa maa laa taaqata lanaa bihi wa u'fu 'annaa waghfir lanaa warhamnaa anta mawlaanaa fansurnaa 'alaal qawmil kaafireena

**Translation on record:** The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allāh and His angels and His books and His messengers, [saying], "We mak…

#### `27:76` — Qur'an 112:1-4, 113:1-5, 114:1-6

*58 words · chapter: Words of remembrance for morning and evening*

**Base — quran.com API v4, verbatim:**

> qul huwa l-lahu aḥadun al-lahu l-ṣamadu lam yalid walam yūlad walam yakun lahu kufuwan aḥadun qul aʿūdhu birabbi l-falaqi min sharri mā khalaqa wamin sharri ghāsiqin idhā waqaba wamin sharri l-nafāthāti fī l-ʿuqadi wamin sharri ḥāsidin idhā ḥasada qul aʿūdhu birabbi l-nāsi maliki l-nāsi ilāhi l-nāsi min sharri l-waswāsi l-khanāsi alladhī yuwaswisu fī ṣudūri l-nāsi mina l-jinati wal-nāsi

**Proposed — corrected + normalised to house style:**

> qul huwa allaahu ahadun allaahus samadu lam yalid walam yoolad walam yakun lahu kufuwan ahadun qul a'oodhu birabbil falaqi min sharri maa khalaqa wamin sharri ghaasiqin idhaa waqaba wamin sharrin nafaathaati feel 'uqadi wamin sharri haasidin idhaa hasada qul a'oodhu birabbin naasi malikin naasi ilaahin naasi min sharril waswaasil khannaasi alladhee yuwaswisu fee sudoorin naasi minal jinnati wan naasi

**Translation on record:** Say, "He is Allāh, [who is] One, Allāh, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent." Say, "I seek refuge in the Lord of daybreak From the evil of that which …

#### `1:4` — Qur'an 3:190-200

*195 words · chapter: supplications for when you wake up*

**Base — quran.com API v4, verbatim:**

> inna fī khalqi l-samāwāti wal-arḍi wa-ikh'tilāfi al-layli wal-nahāri laāyātin li-ulī l-albābi alladhīna yadhkurūna l-laha qiyāman waquʿūdan waʿalā junūbihim wayatafakkarūna fī khalqi l-samāwāti wal-arḍi rabbanā mā khalaqta hādhā bāṭilan sub'ḥānaka faqinā ʿadhāba l-nāri rabbanā innaka man tud'khili l-nāra faqad akhzaytahu wamā lilẓẓālimīna min anṣārin rabbanā innanā samiʿ'nā munādiyan yunādī lil'īmāni an āminū birabbikum faāmannā rabbanā fa-igh'fir lanā dhunūbanā wakaffir ʿannā sayyiātinā watawaffanā maʿa l-abrāri rabbanā waātinā mā waʿadttanā ʿalā rusulika walā tukh'zinā yawma l-qiyāmati innaka lā tukh'lifu l-mīʿāda fa-is'tajāba lahum rabbuhum annī lā uḍīʿu ʿamala ʿāmilin minkum min dhakarin aw unthā baʿḍukum min baʿḍin fa-alladhīna hājarū wa-ukh'rijū min diyārihim waūdhū fī sabīlī waqātalū waqutilū la-ukaffiranna ʿanhum sayyiātihim wala-ud'khilannahum jannātin tajrī min taḥtihā l-anhāru thawāban min ʿindi l-lahi wal-lahu ʿindahu ḥus'nu l-thawābi lā yaghurrannaka taqallubu alladhīna kafarū fī l-bilādi matāʿun qalīlun thumma mawāhum jahannamu wabi'sa l-mihādu lākini alladhīna ittaqaw rabbahum lahum jannātun tajrī min taḥtihā l-anhāru khālidīna fīhā nuzulan min ʿindi l-lahi wamā ʿinda l-lahi khayrun lil'abrāri wa-inna min ahli l-kitābi laman yu'minu bil-lahi wamā unzila ilaykum wamā unzila ilayhim khāshiʿīna lillahi lā yashtarūna biāyāti l-lahi thamanan qalīlan ulāika lahum ajruhum ʿinda rabbihim inna l-laha sarīʿu l-ḥisābi yāayyuhā alladhīna āmanū iṣ'birū waṣābirū warābiṭū wa-ittaqū l-laha laʿallakum tuf'liḥūna

**Proposed — corrected + normalised to house style:**

> inna fee khalqis samaawaati wal ardi wa ikhtilaafil layli wan nahaari laaayaatin li uleel albaabi alladheena yadhkuroona allaaha qiyaaman waqu'oodan wa'alaa junoobihim wayatafakkaroona fee khalqis samaawaati wal ardi rabbanaa maa khalaqta haadhaa baatilan subhaanaka faqinaa 'adhaaban naari rabbanaa innaka man tudkhilin naara faqad akhzaytahu wamaa lilzzaalimeena min ansaarin rabbanaa innanaa sami'naa munaadiyan yunaadee lil eemaani an aaminoo birabbikum faaamannaa rabbanaa faghfir lanaa dhunoobanaa wakaffir 'annaa sayyiaatinaa watawaffanaa ma'al abraari rabbanaa waaatinaa maa wa'adttanaa 'alaa rusulika walaa tukhzinaa yawmal qiyaamati innaka laa tukhliful mee'aada fastajaaba lahum rabbuhum annee laa udee'u 'amala 'aamilin minkum min dhakarin aw unthaa ba'dukum min ba'din fa alladheena haajaroo wa ukhrijoo min diyaarihim waoodhoo fee sabeelee waqaataloo waqutiloo la ukaffiranna 'anhum sayyiaatihim wala udkhilannahum jannaatin tajree min tahtihaal anhaaru thawaaban min 'indi allaahi wallaahu 'indahu husnuth thawaabi laa yaghurrannaka taqallubu alladheena kafaroo feel bilaadi mataa'un qaleelun thumma ma'waahum jahannamu wabi'sal mihaadu laakini alladheena ittaqaw rabbahum lahum jannaatun tajree min tahtihaal anhaaru khaalideena feehaa nuzulan min 'indi allaahi wamaa 'inda allaahi khayrun lil abraari wa inna min ahlil kitaabi laman yu'minu billaahi wamaa unzila ilaykum wamaa unzila ilayhim khaashi'eena lillahi laa yashtaroona biaayaati allaahi thamanan qaleelan ulaa'ika lahum ajruhum 'inda rabbihim inna allaaha saree'ul hisaabi yaa ayyuhaa alladheena aamanosbiroo wasaabiroo waraabitoo wa ittaqoo allaaha la'allakum tuflihoona

**Translation on record:** Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding - Who remember Allāh while standing or sitting or [lying] on thei…

---

## Part 13 — Multi-verse records: a content-structure question (parked)

Added 2026-08-03. **Parked — does NOT block Part 12.** Surfaced by the alignment work, but it is
not a transliteration question and should not be settled inside one.

| record | contains | stored as |
|---|---|---|
| `27:76` | **three complete sūrahs** — al Ikhlāṣ, al Falaq, an Nās | one record, one page |
| `1:4` | **eleven verses** — Āl ʿImrān 3:190–200 | one record, one page |

Alignment made this visible: assembling them required 15 and 11 separate verse fetches.

**The question:** is a record one supplication, or one *recitation unit*? Both readings are
defensible — a reader looking up "what to recite on waking" wants the whole passage, while a reader
looking up al-Ikhlāṣ will not find it at its own URL. It bears on page granularity, titling,
keyword targeting, and R6 (a sūrah stored inside a composite record cannot cluster against the same
sūrah stored alone).

**Deliberately not inferred.** Whatever is decided, the Part 12 transliterations remain correct for
the text as currently stored — so approving Part 12 does not prejudge this, and this does not hold
up Part 12.

---

## Part 14 — Transliteration adoption, batch 4 (18 records)

Added 2026-08-03. **⚠ NOT Gate-2 satisfied — machine-proposed, UNVERIFIED.**
Nothing written to the corpus, no `transliterationSource` set, nothing marked reviewer-written.

First batch written under the **confirmed library-wide convention** (owner ruling, Part 12):
sun-letter assimilation of the article throughout. Parts 9–11 already followed it; Part 12
normalised the quran.com set to it; it is now simply the house style.

The shared-formula seam is exhausted, so selection is by **shortest first** — cheapest to rule,
most records cleared per minute of review. All 18 are 6–10 words.

### The batch

| id | Arabic | existing (flawed) | **proposed ALA-LC** | translation |
|---|---|---|---|---|
| `49:147` | <div dir="rtl" lang="ar">((لاَ بأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ)).</div> | (La ba'sa tahoorun in shaal-lah.) | **Laa ba'sa tahoorun in shaa'allaah** | (Never mind, may it (the sickness) be a purification, if Allah wills.) |
| `58:163` | <div dir="rtl" lang="ar">((بِسْمِ اللَّهِ وَعَلَى سُنَّةِ رَسُولِ اللَّهِ)).</div> | (Bismil-lahi waAAala sunnati rasoolil-lah.) | **Bismillaahi wa'alaa sunnati rasoolillaah** | In the name of Allah and upon the sunnah of the Messenger of Allah. |
| `63:170` | <div dir="rtl" lang="ar">((اللَّهُمَّ أَغِثْنَا، اللَّهُمَّ أَغِثْنَا، اللَّهُمَّ أَغِثْنَا)).</div> | (Allahumma aghithna, allahumma aghithna, allahumma aghithna.) | **Allaahumma aghithnaa, allaahumma aghithnaa, allaahumma aghithnaa** | (O Allah, relieve us, O Allah, relieve us, O Allah, relieve us.) |
| `90:201` | <div dir="rtl" lang="ar">((بَارَكَ اللَّهُ لَكَ فِي أَهْلِكَ وَمَالِكَ)).</div> | (Barakal-lahu laka fee ahlika wamalik.) | **Baarakallaahu laka fee ahlika wamaalik** | (May Allah bless for you, your family and wealth.) |
| `24:59` | <div dir="rtl" lang="ar">((اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبادَتِكَ)).</div> | (Allahumma aAAinnee AAala thikrik, washukrik, wahusni AAibadatik.) | **Allaahumma a'innee 'alaa dhikrika, washukrika, wahusni 'ibaadatik** | (O Allah, help me to remember You, to thank You, and to worship You in the best of manners.) |
| `51:150` | <div dir="rtl" lang="ar">((اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَأَلْحِقْنِي بِالرَّفِيقِ الْأَعْلَى)).</div> | (Allahummagh-fir lee, warhamnee wa-alhiqnee birrafeeqil-aAAla.) | **Allaahummaghfir lee, warhamnee, wa alhiqnee bir rafeeqil a'laa** | ‘O Allaah, forgive me, have mercy upon me and unite me with the highest companions |
| `9:14` | <div dir="rtl" lang="ar">(اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ)</div> | (Allahummaj-AAalnee minat-tawwabeena wajAAalnee minal-mutatahhireen.) | **Allaahummaj'alnee minat tawwaabeena waj'alnee minal mutatahhireen** | (O Allah, make me of those who return to You often in repentance and make me of those who remain clean and pure.) |
| `18:39` | <div dir="rtl" lang="ar">((رَبَّنَا وَلَكَ الْحَمْدُ، حَمْداً كَثيراً طَيِّباً مُبارَكاً فِيهِ)).</div> | (Rabbana walakal-hamdu hamdan katheeran tayyiban mubarakan feeh.) | **Rabbanaa walakal hamdu, hamdan katheeran tayyiban mubaarakan feeh** | (Our Lord, for You is all praise, an abundant beautiful blessed praise.) |
| `27:96` | <div dir="rtl" lang="ar">((أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ)) (مِائَةَ مَرَّةٍ فِي الْيَوْمِ).</div> | astaghfirullah wa atubu ilayh | **Astaghfirullaaha wa atoobu ilayh** | I seek forgiveness from Allah and repent to Him. |
| `27:98` | <div dir="rtl" lang="ar">((اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ)) (عشرَ مرَّاتٍ).</div> | Allaahumma salli wa sallim 'alaa Nabiyyinaa Muhammadin[ten times] | **Allaahumma salli wasallim 'alaa nabiyyinaa Muhammad** | ‘O Allaah, send prayers and peace upon our Prophet Muhammad.’ [ten times] |
| `62:168` | <div dir="rtl" lang="ar">((سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلاَئِكةُ مِنْ خِيفَتِهِ)).</div> | (Subhanal-lathee yusabbihur-raAAdu bihamdih, walmala-ikatu min kheefatih.) | **Subhaana alladhee yusabbihur ra'du bihamdihi, wal malaa'ikatu min kheefatih** | (How perfect He is, (The One) Whom the thunder declares His perfection with His praise, as do the angles out of fear of Him.) |
| `71:182` | <div dir="rtl" lang="ar">((اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُم، وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ)).</div> | (Allahumma barik lahum feema razaqtahum, waghfir lahum warhamhum.) | **Allaahumma baarik lahum feemaa razaqtahum, waghfir lahum warhamhum** | (O Allah, bless for them, that which You have provided them, forgive them and have mercy upon them.) |
| `36:126` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِم، وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ)).</div> | (Allahumma inna najAAaluka fee nuhoorihim wanaAAoothu bika min shuroorihim.) | **Allaahumma innaa naj'aluka fee nuhoorihim, wana'oodhu bika min shuroorihim** | (O Allah, we place You before them and we take refuge in You from their evil.) |
| `68:176` | <div dir="rtl" lang="ar">((ذَهَبَ الظَّمَأُ وَابْتَلَّتِ العُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ)).</div> | dhahabadh-dhama'u wabtallatil-'uruqu wa thabatal-ajru insha allah | **Dhahabaz zama'u wabtallatil 'urooqu, wathabatal ajru in shaa'allaah** | The thirst has gone, the veins are moistened, and the reward is confirmed, Insha Allah. |
| `73:184` | <div dir="rtl" lang="ar">((أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلاَئِكَةُ)).</div> | (Aftara AAindakumus-sa-imoon, wa-akala taAAamakumul-abrar, wasallat AAalaykumul-mala-ikah.) | **Aftara 'indakumus saa'imoona, wa akala ta'aamakumul abraaru, wasallat 'alaykumul malaa'ikah** | (May the fasting break their fast in your home, and may the dutiful and pious eat your food, and may the angles send prayers upon  |
| `79:190` | <div dir="rtl" lang="ar">((بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ)).</div> | (Barakal-lahu lak, wabaraka AAalayk, wajamaAAa baynakuma fee khayr.) | **Baarakallaahu lak, wabaaraka 'alayk, wajama'a baynakumaa fee khayr** | (May Allah bless for you (your spouse) and bless you, and may He unite both of you in goodness.) |
| `81:192` | <div dir="rtl" lang="ar">((بِسْمِ اللَّهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ، وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا)).</div> | (Bismil-lah, allahumma jannibnash-shaytan, wajannibish-shaytana ma razaqtana.) | **Bismillaah, allaahumma jannibnaash shaytaana, wajannibish shaytaana maa razaqtanaa** | (In the name of Allah. O Allah, keep the devil away from us and keep the devil away from what you have blessed us with.) |
| `127:246` | <div dir="rtl" lang="ar">((بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ [اللَّهُمَّ مِنْكَ وَلَكَ] اللَّهُمَّ تَقَبَّلْ مِنِّي)).</div> | (Bismil-lah wallahu akbar, allahumma minka walak, allahumma taqabbal minnee.) | **Bismillaahi wallaahu akbar. [Allaahumma minka walak.] Allaahumma taqabbal minnee** | (In the name of Allah, and Allah is the greatest. O Allah, (it is) from You and belongs to You, O Allah, accept this from me.) |

### Source-text defects found while transliterating

**`49:147`** — Old `in shaal-lah` loses the hamza of `شَاءَ` and runs the words together.

**`51:150`** — Assimilation: `الرَّفِيقِ` → `bi-r-rafīqi` (sun letter r), against the old `birrafeeqil`.

**`9:14`** — Both articles in one line, one of each kind: `التَّوَّابِينَ` assimilates (`mina-t-tawwābīn`), `الْمُتَطَهِّرِينَ` does not (`mina-l-mutaṭahhirīn`).

**`27:96`** — The count `(مِائَةَ مَرَّةٍ فِي الْيَوْمِ)` is an instruction; not transliterated.

**`27:98`** — **Two defects.** The Arabic reads `نَبَيِّنَا` — vowelled *nabayyinā*, where the word is `نَبِيِّنَا` (*nabiyyinā*); transliterated as the correct form, source flagged. And the old field ends `Muhammadin[ten times]` — an English instruction fused to the last word with **no separator at all**.

**`68:176`** — Old runs `insha allah` together and drops the hamza; `الظَّمَأُ` assimilates to `-ẓ-ẓamaʾu`.

**`127:246`** — **CORRECTED 2026-08-03 under the owner's bracket ruling.** As first proposed, the brackets were dropped and `[اللَّهُمَّ مِنْكَ وَلَكَ]` was folded into the running text — silently promoting an *optional* clause to an unconditional one, and treating this record differently from `6:10`, which is the same case and kept its brackets. The brackets are now preserved, so the optionality the source marked survives into the transliteration. Rule 3 below.

### Assimilation in practice

`9:14` is the clearest single illustration of the ruled convention, carrying both kinds of
article in one line:

```
التَّوَّابِينَ   sun letter t  ->  mina-t-tawwābīna
الْمُتَطَهِّرِينَ  moon letter m ->  mina-l-mutaṭahhirīn
```

Others in this batch: `bi-r-rafīqi` (`51:150`), `-ṣ-ṣāʾimūna` (`73:184`),
`-sh-shayṭāna` (`81:192`), `-ẓ-ẓamaʾu` (`68:176`), `-r-raʿdu` (`62:168`).

---

## Part 13a — Bracket policy (ruled) and four records routed here

Added 2026-08-03, **owner-ruled**. Square brackets are used for three different things in this
corpus and the notation itself does not distinguish them. The rule below is now binding on every
batch; before it, the calls were being made case by case and **inconsistently** — `6:10` and
`127:246` are the same case and were handled two different ways until this ruling.

| # | span looks like | ruling | example |
|---|---|---|---|
| 1 | a count or a time, only | **drop** — instruction, not recited | `[ثلاثاً]` (`25:67`) |
| 2 | conditional + speech verb (`وإذا أمسى قال: …`) | **do not transliterate**; route to Part 13 | `27:80` |
| 3 | address to Allah, no framing | **transliterate AND keep the brackets** | `6:10`, `127:246` |
| 4 | honorific mid-text (ﷺ, رضي الله عنه) | **exclude** — compiler convention | `27:87` |
| 5 | ROUND brackets | **superseded by 5b below** | — |
| **5b** | ROUND brackets marking an optional/variant WORD | **transliterate AND keep the brackets** — same treatment as rule 3 | `2:5` `(ath thawba)` |

Rule 3 is the correction: the brackets carry meaning — they mark the clause optional — so
removing them changes what the page tells a reader to recite.

### A signal that was tried and does not work

"Does the pre-existing romanisation cover the span", proxied by word count, **fails on half the
cases** and must not be relied on. Two confounds: transliteration tokens merge Arabic words
(`Bismil-lah` is one token for two words), and English instructions live *inside* the
transliteration field — `27:80`'s field carries `(four times in the morning & evening)(Note: …)`,
inflating its count by about 13 words. Only the framing-language signal survived scrutiny.

### Four records routed here: they may contain TWO supplications, not one

Each stores the **evening form** inside the morning record's `arabic` field as a bracketed
annotation. The upstream romanised both: `27:89`'s transliteration field holds two complete
supplications separated by `[For the evening, the supplication is read as follows: ]`, and
`27:78` the same with `[In the evening:]`.

| record | morning form | evening form in source | note |
|---|---|---|---|
| `27:78` | complete | **complete** | both forms fully present |
| `27:89` | complete | **complete** | both forms fully present, both romanised upstream |
| `27:81` | complete | **TRUNCATED** — `اللَّهم ما أمسى بي...` | ⚠ incomplete in source |
| `27:90` | complete | **TRUNCATED** — `أمسينا على فطرة الإسلام...` | ⚠ incomplete in source |

**The truncation matters for whatever Part 13 decides.** If the ruling is "yes, separate them",
`27:78` and `27:89` can be split from data already held — but `27:81` and `27:90` **cannot**.
Their evening text ends in an ellipsis, so splitting them would require sourcing the missing
wording, which is a content task and not a split. A ruling of "separate" is therefore only
half-executable today, and the other half needs the same sourcing route as any other gap.

None of the four is transliterated in any batch. They are held here.

### Rule 4 — honorifics embedded mid-text are excluded (standing rule, owner-ruled 2026-08-03)

`صلى الله عليه وسلم` (ﷺ), `رضي الله عنه` and the like, where they appear **inside** a record's
`arabic` field, are **editorial/compiler convention, not part of the recitable supplication**, and
are excluded from the transliteration.

**This is a standing rule, not a per-record judgment.** It settles `27:87` (Part 15), where the
honorific sits mid-sentence and the old romanisation transliterated it
(`sallallahu 'alayhi wa sallama`), and it applies to every future record without being re-argued.

The rule governs **transliteration only**. It says nothing about whether the honorific should
render on the page in Arabic or in English — that is a display question, untouched here.

### Rule 5 — parentheses are OVERLOADED and no parenthesised span is treated by analogy

`2:5` carries `(الثَّوْبَ)` — "the garment" — an *optional word* in round brackets: the rule-3
shape, in the wrong notation. Rules 1–3 govern **square** brackets only, so nothing in the ruled
policy reaches it.

**Until this is ruled, no parenthesised span is transliterated by analogy to rule 3.** `2:5`'s
Part 15 proposal keeps `(th-thawba)` on that basis and is flagged there; it should not be adopted
before this is settled.

#### The census, and what it actually shows

Run across all 116, stripping the outer recitation delimiter first:

| | count |
|---|---:|
| inner parenthesised Arabic spans | 26 |
| …that are instructions (count/time/how) | 6 |
| …that are the supplication text itself, surfaced as an artifact | 19 |
| …that are a genuine optional word | **1** (`2:5`) |

**The scope is one record.** That is the useful result: this needs a ruling, not a policy
programme.

**The census itself demonstrates the overload.** It took two attempts. The first conflated the
`((…))` recitation delimiter with real inner parentheses and reported 107 spurious spans. Even
after stripping the outer delimiter, 19 of the remaining 26 are still the supplication text —
because a record with a trailing instruction takes the shape `((dua)) (instruction)`, which
defeats a single outer strip. One mark doing three jobs is not a cosmetic complaint: **it defeats
mechanical classification**, which is why the ruling has to be human and why nothing here was
extended by analogy.

This is the same class of finding as Part 10's — instruction annotations stored inconsistently
defeat de-duplication; here inconsistent bracketing defeats classification. Both trace to the
same root cause: **annotations live inside the `arabic` field with no structural separation.**


---

## Part 15 — Transliteration adoption, batch 5 (18 records)

Added 2026-08-03. **⚠ NOT Gate-2 satisfied — machine-proposed, UNVERIFIED.**
Nothing written to the corpus, no `transliterationSource` set, nothing marked reviewer-written.

First batch under the **ruled bracket policy** (Part 13a). The two straightforwardly transliterable
bracketed records lead — `114:232` and `17:36`, both rule 3, both keeping their brackets — and
the rest is shortest-first from the remaining pool.

### The batch

| id | Arabic | existing (flawed) | **proposed ALA-LC** | translation |
|---|---|---|---|---|
| `114:232` | <div dir="rtl" lang="ar">((اللَّهُمَّ لاَ تُؤَاخِذْنِي بِمَا يَقُولُونَ، وَاغْفِرْ لِي مَا لاَ يَعْلَمُونَ، [وَاجْعَلْنِي خَيْراً مِمَّا يَظُّنُّونَ])).</div> | Allaahumma laa tu'aakhithnee bimaa yaqooloona, waghfir lee maa laa ya'lamoona [waj'alnee khayram-mimmaa yadhunnoon] | **Allaahumma laa tu'aakhidhnee bimaa yaqooloona, waghfir lee maa laa ya'lamoona, [waj'alnee khayran mimmaa yazunnoon]** | O Allah, do not call me to account for what they say and forgive me for what they have no knowledge of [and make me better th |
| `17:36` | <div dir="rtl" lang="ar">((اللَّهُمَّ لَكَ رَكَعْتُ، وَبِكَ آمَنْتُ، وَلَكَ أَسْلَمْتُ، خَشَعَ لَكَ سَمْعِي، وَبَصَرِي، وَمُخِّي، وَعَــــظْمِي، وَعَصَبِي، [وَمَا استَقَلَّتْ بِهِ قَدَمِي])).</div> | (Allahumma laka rakaAAt, wabika amant, walaka aslamt, khashaAAa laka samAAee, wabasaree, wamukhkhee, waAAathmee, waAAasabee, wamas-taqalla bihi qadamee.) | **Allaahumma laka raka'tu, wabika aamantu, walaka aslamtu, khasha'a laka sam'ee, wabasaree, wamukhkhee, wa'azmee, wa'asabee, [wamastaqallat bihi qadamee]** | (O Allah, unto You I have bowed, and in You I have believed, and to You I have submitted. My hearing, sight, mind, bones, ten |
| `16:28` | <div dir="rtl" lang="ar">((سُبْحانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلاَ إِلَهَ غَيْرُكَ)).</div> | (Subhanakal-lahumma wabihamdika watabarakas-muka wataAAala jadduka wala ilaha ghayruk.) | **Subhaanaka allaahumma wabihamdika, watabaarakasmuka, wata'aalaa jadduka, walaa ilaaha ghayruk** | (How perfect You are O Allah, and I praise You. Blessed be Your name, and lofty is Your position and none has the right to be |
| `38:131` | <div dir="rtl" lang="ar">((اللَّهُمَّ مُنْزِلَ الْكِتَابِ، سَرِيعَ الْحِسَابِ، اهْزِمِ الأَحْزَابَ، اللَّهُمَّ اهزِمْهُمْ وَزَلْزِلْهُمْ)).</div> | (Allahumma munzilal-kitab, sareeAAal-hisab, ihzimil-ahzab, allahummah-zimhum wazalzilhum.) | **Allaahumma munzilal kitaab, saree'al hisaab, ihzimil ahzaab, allaahummahzimhum wazalzilhum** | (O Allah, Revealer of the Book, Swift at reckoning, defeat the confederates. O Allah, defeat them and convulse them.) |
| `10:16` | <div dir="rtl" lang="ar">(بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَاَ حَوْلَ وَلَا قُوَّةَ إِلاَّ بِاللَّهِ).</div> | bismillah, tawakkaltu 'alallah, la hawla wa la quwwata illa billah | **Bismillaah, tawakkaltu 'alaa allaah, walaa hawla walaa quwwata illaa billaah** | In the name of Allah, I place my trust in Allah. There is no might nor power except with Allah. |
| `36:127` | <div dir="rtl" lang="ar">((اللَّهُمَّ أَنْتَ عَضُدِي، وَأَنْتَ نَصِيرِي، بِكَ أَحُولُ وَبِكَ أَصُولُ، وَبِكَ أُقاتِلُ)).</div> | (Allahumma anta AAadudee, wa-anta naseeree, bika ajoolu wabika asoolu wabika oqatil) | **Allaahumma anta 'adudee, wa anta naseeree, bika ahoolu wabika asoolu, wabika uqaatil** | (O Allah, You are my supporter and You are my helper, by You I move and by You I attack and by You I battle.) |
| `68:177` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي)).</div> | (Allahumma inne as aluka birahmatikal-latee wasiAAat kulla shay, an taghfira lee.) | **Allaahumma innee as'aluka birahmatika allatee wasi'at kulla shay'in an taghfira lee** | (O Allah, I ask You by Your mercy which envelopes all things, that You forgive me.) |
| `91:202` | <div dir="rtl" lang="ar">((بارَكَ اللَّهُ لَكَ فِي أَهْلِكَ وَمَالِكَ، إِنَّمَا جَزَاءُ السَّلَفِ الْحَمْدُ وَالأَدَاءُ)).</div> | (Barakal-lahu laka fee ahlika wamalik, innama jaza-os-salafil-hamdu wal ada'.) | **Baarakallaahu laka fee ahlika wamaalik, innamaa jazaa'us salafil hamdu wal adaa** | (May Allah bless for you, your family and wealth. Surely commendation and payment are the reward for a loan.) |
| `1:3` | <div dir="rtl" lang="ar">( الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لي بِذِكْرِهِ )</div> | (Alhamdu lillahil-lathee AAafanee fee jasadee waradda AAalayya roohee wa-athina lee bithikrih.) | **Alhamdu lillaahi alladhee 'aafaanee fee jasadee, waradda 'alayya roohee, wa adhina lee bidhikrih** | (All praise is for Allah who restored to me my health and returned my soul and has allowed me to remember Him.) |
| `27:97` | <div dir="rtl" lang="ar">((أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ)) (ثلاثَ مرَّاتٍ إذا أمسى).</div> | a'udhu bikalimatillahit-tammati min sharri ma khalaq | **A'oodhu bikalimaati allaahit taammaati min sharri maa khalaq** | I seek refuge in the perfect words of Allah from the evil of what He has created. |
| `28:106` | <div dir="rtl" lang="ar">((سُبْحَانَ اللَّهِ (ثلاثاً وثلاثين) وَالْحَمْدُ لِلَّهِ (ثلاثاً وثلاثين) وَاللَّهُ أَكْبَرُ (أربعاً وثلاثينَ))).</div> | (Subhanal-lah. (thirty-three times) Alhamdu lillah. (thirty-three times) Allahu akbar. (thirty-four times)) | **Subhaanallaah. Wal hamdu lillaah. Wallaahu akbar** | (How Perfect Allah is. (thirty-three times) All praise is for Allah.(thirty-three times) Allah is the greatest.(thirty-four t |
| `63:169` | <div dir="rtl" lang="ar">((اللَّهُمَّ اسْقِنَا غَيْثاً مُغِيثاً مَرِيئاً مَرِيعاً، نَافِعاً غَيْرَ ضَارٍّ، عَاجِلاً غَيْرَ آجِلٍ)).</div> | (Allahummas-qina ghaythan mugheethan maree-an mureeAAan, nafiAAan, ghayra dar, AAajilan ghayra ajil.) | **Allaahummasqinaa ghaythan mugheethan maree'an maree'an, naafi'an ghayra daarr, 'aajilan ghayra aajil** | (O Allah, send upon us helpful, wholesome and healthy rain, beneficial not harmful rain, now, not later.) |
| `70:180` | <div dir="rtl" lang="ar">((الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ)).</div> | alhamdulillahilladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah | **Alhamdu lillaahi alladhee at'amanee haadhaa, warazaqaneehi, min ghayri hawlin minnee walaa quwwah** | All praise is to Allah who has fed me this and provided for me without any power or strength from me. |
| `27:87` | <div dir="rtl" lang="ar">((رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالْإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيّاً)) (ثلاثَ مرَّاتٍ).</div> | raditu billahi rabba, wa bil islami dina, wa bi-muhammadin sallallahu 'alayhi wa sallama nabiyya | **Radeetu billaahi rabban, wabil islaami deenan, wabi Muhammadin nabiyyan** | I am pleased with Allah as my Lord, Islam as my religion, and Muhammad, sallallahu 'alayhi wa sallam, as my Prophet. |
| `2:5` | <div dir="rtl" lang="ar">(الْحَمْدُ للَّهِ الَّذِي كَسَانِي هَذَا (الثَّوْبَ) وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّة...)</div> | alhamdulillahilladhi kasani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah | **Alhamdu lillaahi alladhee kasaanee haadhaa (ath thawba) warazaqaneehi min ghayri hawlin minnee walaa quwwah** | Praise be to Allah who has clothed me with this garment and provided it for me without any power or strength from me. |
| `43:139` | <div dir="rtl" lang="ar">((اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً)).</div> | allahumma la sahla illa ma ja'altahu sahla, wa anta taj'alul-hazna idha shi'ta sahla | **Allaahumma laa sahla illaa maa ja'altahu sahlan, wa anta taj'alul hazna idhaa shi'ta sahlan** | O Allah, there is no ease except in that which You make easy, and You make the difficult easy if You wish. |
| `53:154` | <div dir="rtl" lang="ar">((إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي، وَأَخْلِفْ لِي خَيْرَاً مِنْهَا)).</div> | inna lillahi wa inna ilayhi raji'un. allahumma'jurni fi musibati wa akhlif li khayran minha | **Innaa lillaahi wa innaa ilayhi raaji'oon. Allaahumma'jurnee fee museebatee, wa akhlif lee khayran minhaa** | Indeed we belong to Allah, and indeed to Him we will return. O Allah, reward me for my affliction and replace it with somethi |
| `83:194` | <div dir="rtl" lang="ar">((الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلاَكَ بِهِ، وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلاً)).</div> | (Alhamdu lillahil-lathee AAafanee mimmab-talaka bih, wafaddalanee AAala katheerin mimman khalaqa tafdeela.) | **Alhamdu lillaahi alladhee 'aafaanee mimmabtalaaka bihi, wafaddalanee 'alaa katheerin mimman khalaqa tafdeelan** | (All praise is for Allah Who saved me from that which He tested you with and Who most certainly favoured me over much of His  |

### Source-text defects found while transliterating

**`114:232`** — **Bracket rule 3 applied** — address to Allah, no framing, so transliterated with the brackets kept. Arabic reads `يَظُّنُّونَ` with a shadda on **both** ẓ and n; the standard form is `يَظُنُّونَ`. Transliterated as standard, source flagged. Old field also uses the doubled-`aa` convention (`Allaahumma`).

**`17:36`** — **Bracket rule 3 applied.** The old romanisation drops the brackets *and* mis-renders `استَقَلَّتْ` as `mas-taqalla`, losing the final `-at`. Arabic also carries tatweel padding (`وَعَــــظْمِي`).

**`36:127`** — **The old romanisation contradicts the Arabic.** It reads `bika ajoolu` — jīm — where the Arabic is `أَحُولُ`, ḥāʾ. Not a spelling variant: two different roots. The proposal follows the **Arabic**, and the discrepancy is flagged rather than resolved, since which one is correct is a sourcing question. **Escalated to Part 16 as a Gate 3 defect on a live page** — the translation appears to corroborate the transliteration, not the Arabic, so this proposal should not be adopted before Part 16 is settled.

**`27:97`** — Trailing `(ثلاثَ مرَّاتٍ إذا أمسى)` is a count plus a time — bracket rule 1, dropped.

**`28:106`** — **Three counts interleaved through the text**, not trailing it. All are rule-1 instructions and are dropped. The old field rendered each as English (`(thirty-three times)`) inside the transliteration — the same category error as `25:69` and `27:83`.

**`27:87`** — **Judgment flagged, not silently made.** The Arabic field carries the honorific `صلى الله عليه وسلم` mid-sentence, and the old romanisation includes it (`sallallahu 'alayhi wa sallama`). It is excluded here on the reading that it is an editorial honorific rather than part of this supplication's wording — but that is the same *class* of call as the bracket question, and it is **not covered by the ruled policy**. See the note below.

**`2:5`** — **Two problems.** `(الثَّوْبَ)` is an *optional word* in parentheses — the parenthesis analogue of bracket rule 3, which the ruling does not currently reach. Kept, in parentheses, by analogy; flagged for confirmation. And the Arabic field **ends in an ellipsis** (`وَلاَ قُوَّة...`) — truncated in source, same class as `27:81`/`27:90`.

### Two gaps in the ruled policy, surfaced by this batch

The bracket ruling covers **square brackets**. Two records here carry the same *kind* of question
in notation the ruling does not reach. Both are flagged rather than decided.

**1. Optional text in ROUND brackets — `2:5`.** `(الثَّوْبَ)` is an optional word, exactly the
rule-3 shape but parenthesised. Parentheses are otherwise used in this corpus for instructions
(rule 1) and as the `((…))` recitation delimiters, so the same mark now carries three jobs.
Kept in parentheses here **by analogy only**. If rule 3 extends to round brackets, say so; the
alternative readings are "drop it" or "promote it to unconditional", and they give different pages.

**2. The honorific inside the text — `27:87`.** The Arabic carries
`صلى الله عليه وسلم` mid-sentence and the old romanisation transliterates it. Excluded here as
editorial rather than recited — but that is a judgment of the same class the bracket policy was
written to stop me making silently, so it is surfaced, not buried. A ruling would also settle any
other record where the honorific sits inside the recited span.

### Not a notation question: `36:127`

Worth separating from the above. The old romanisation reads `bika ajoolu` (jīm) where the Arabic
reads `أَحُولُ` (ḥāʾ) — **two different roots**, not a transcription variant. The proposal follows
the Arabic. Which of the two the source intends is a sourcing question and is left open.

---

## Part 16 — Gate 3 defect on a LIVE page: `36:127` Arabic and English are on different roots

Added 2026-08-03. **This is a Gate 3 text-integrity issue, not a transliteration note.** It was
found while preparing a transliteration, but it is not fixed by one, and the page is live now.

### The three fields disagree

| field | reads | root |
|---|---|---|
| `arabic` | `بِكَ أَحُولُ` | **ح-و-ل** (ḥ-w-l) |
| `transliteration` | `bika ajoolu` | **ج-و-ل** (j-w-l) |
| `translation` | "by You I move" | — |

**This is not a transcription variant.** ḥāʾ and jīm are different letters and these are different
roots: ح-و-ل is to turn, shift, change, interpose; ج-و-ل is to roam, range, move about. The
transliteration is not a sloppy rendering of the Arabic — it is a rendering of a *different word*.

### What the translation appears to corroborate — stated as suggestive, not proven

The English reads **"by You I move"**. "Move" is the natural sense of ج-و-ل (*to move about,
range*); a translator working from ح-و-ل would more naturally write "I turn", "I shift" or
"I manoeuvre". On that reading, **two of the three fields point to ج-و-ل and only the Arabic
points to ح-و-ل**.

**That inference is suggestive, not conclusive, and should not be treated as a finding.** "I move"
is generic enough to render either root loosely, and both verbs are plausible in this supplication's
martial context — it sits beside `أَصُولُ` ("I attack") and `أُقَاتِلُ` ("I battle"). What is *not*
in doubt is that the Arabic and the transliteration are on different roots. That much is a hard
disagreement whichever way the sourcing question falls.

### No corpus-internal evidence is available

`36:127` is the **only** record in all 566 containing either root, the only one whose
transliteration contains `ajool`, and the only one whose translation contains "I move". There is
no second instance to compare against, so this cannot be resolved from our own data.

### Why this is Gate 3 and why it is urgent-ish

Gate 3 is text integrity — narration leakage, truncation, bleed, fields that disagree. This is
squarely that, with two aggravating facts:

- **The page is LIVE.** `invocations-for-when-you-meet-an-adversary-or-a-powerful-rul-hisn-36-127`
  is in the sitemap and in R10's baseline of 116.
- **The divergence is audible.** A reader reciting from the Arabic says *aḥūlu*; a reader following
  the transliteration on the same page says *ajūlu*. The page gives two different words for the
  same position in the supplication, and does not disclose that it is doing so.

The existing "Romanization source not verified" note does **not** cover this. That note is about
provenance; this is a contradiction between two sourced fields.

### What is needed, and what was deliberately not done

**Needed:** a sourcing decision — what does Ḥiṣn al-Muslim actually read at this entry? That
settles which field is wrong and therefore which one is corrected.

**Not done, deliberately:**
- The Arabic was **not** "corrected" to match the transliteration, nor the reverse. Either would be
  inventing the resolution rather than sourcing it.
- The page was **not** noindexed. That call is the owner's, and this is flagged for it rather than
  actioned.
- The Part 15 proposal for `36:127` follows the **Arabic** (`bika aḥūlu`) and says so. If the
  sourcing decision goes the other way, that proposal changes with it — which is why it should not
  be adopted before this is settled.

### The wider question this raises

This was found by hand, on one record, while doing something else. Nothing systematically compares
the Arabic against its own transliteration or translation. `36:127` is the only record where all
three fields could be checked against each other *because* the transliteration happened to be
legible enough to disagree — most of the 116 are in the `AA` scheme, where a root-level
disagreement of exactly this kind would be far harder to notice. **The absence of other findings
is not evidence that there are none.**


---

## Part 17 — Transliteration adoption, batch 6 (11 records)

Added 2026-08-03. **⚠ NOT Gate-2 satisfied — machine-proposed, UNVERIFIED.**
Nothing written to the corpus, no `transliterationSource` set, nothing marked reviewer-written.

**First half of the final 21.** The three heaviest records were deliberately separated rather than
stacked: `24:62` (76 words) sits here; `28:107` (56) and `27:84` (42) go to batch 7. That keeps
both batches mixed rather than one being uniformly dense — 293 words here against 266 in batch 7.

Ruled policy from Part 13a applied throughout: rule 1 drops counts and times, rule 4 excludes
honorifics, and no parenthesised span is treated by analogy.

### The batch

| id | Arabic | existing (flawed) | **proposed ALA-LC** | translation |
|---|---|---|---|---|
| `11:18` | <div dir="rtl" lang="ar">(بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا، ثُمَّ لِيُسَلِّمْ عَلَى أَهْلِهِ).</div> | (Bismil-lahi walajna, wabismil-lahi kharajna, waAAala rabbina tawakkalna.) | **Bismillaahi walajnaa, wabismillaahi kharajnaa, wa'alaa allaahi rabbinaa tawakkalnaa** | (In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust.) |
| `28:108` | <div dir="rtl" lang="ar">((الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا، وَآوَانَا، فَكَمْ مِمَّنْ لاَ كَافِيَ لَهُ وَلاَ مُؤْوِيَ)).</div> | (Alhamdu lillahil-lathee atAAamana wasaqana, wakafana, wa-awana, fakam mimman la kafiya lahu wala mu'wee.) | **Alhamdu lillaahi alladhee at'amanaa wasaqaanaa, wakafaanaa, wa aawaanaa, fakam mimman laa kaafiya lahu walaa mu'wiya** | (All praise is for Allah, Who fed us and gave us drink, and Who is sufficient for us and has sheltered us, for how many  |
| `27:94` | <div dir="rtl" lang="ar">((سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ)) (ثلاثَ مرَّاتٍ إذا أصبحَ).</div> | subhanallahi wa bihamdihi 'adada khalqihi wa rida nafsihi wa zinata 'arshihi wa midada kalimatihi | **Subhaanallaahi wabihamdihi: 'adada khalqihi, waridaa nafsihi, wazinata 'arshihi, wamidaada kalimaatih** | Glory be to Allah, as many as His creations, Glory be to Allah as much as His pleasure, Glory be to Allah as much as the |
| `27:88` | <div dir="rtl" lang="ar">((يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغيثُ أَصْلِحْ لِي شَأْنِيَ كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ)).</div> | ya hayyu ya qayyum, bi-rahmatika astaghith, wa aslih li sha'ni kullahu wa la takilni ila nafsi tarfata 'aynin abada | **Yaa Hayyu yaa Qayyoom, birahmatika astagheethu, aslih lee sha'niya kullahu walaa takilnee ilaa nafsee tarfata 'ayn** | O Ever-Living, O Self-Sustaining, by Your mercy I seek help, rectify all my affairs and do not leave me to myself even f |
| `3:6` | <div dir="rtl" lang="ar">( اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ).</div> | allahumma lakal-hamdu anta kasawtanihi. as'aluka min khayrihi wa khayri ma suni'a lah, wa a'udhu bika min sharrihi wa sharri ma suni'a lah | **Allaahumma lakal hamdu anta kasawtaneehi, as'aluka min khayrihi wakhayri maa suni'a lah, wa a'oodhu bika min sharrihi washarri maa suni'a lah** | O Allah, to You is all praise. You have clothed me with this. I ask You for its goodness and the goodness for which it w |
| `10:17` | <div dir="rtl" lang="ar">(اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ، أَوْ أُضَلَّ، أَوْ أَزِلَّ، أَوْ أُزَلَّ، أَوْ أَظْلِمَ، أَوْ أُظْلَمَ، أَوْ أَجْهَلَ، أَوْ يُجْهَلَ عَلَيَّ).</div> | allahumma inni a'udhu bika an adilla aw udalla, aw azilla aw uzalla, aw adhlima aw udhlama, aw ajhala aw yujhala 'alayya | **Allaahumma innee a'oodhu bika an adilla, aw udalla, aw azilla, aw uzalla, aw azlima, aw uzlama, aw ajhala, aw yujhala 'alayya** | O Allah, I seek refuge in You lest I should stray or be led astray, slip or be tripped, wrong or be wronged, or act fool |
| `21:51` | <div dir="rtl" lang="ar">((اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْراً، وَضَعْ عَنِّي بِهَا وِزْراً، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْراً، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ)).</div> | (Allahummak-tub lee biha AAindaka ajra, wadaAA AAannee biha wizra, wajAAalha lee AAindaka thukhra, wataqabbalha minnee kama taqabbaltaha min AAabdika Dawood.) | **Allaahummaktub lee bihaa 'indaka ajran, wada' 'annee bihaa wizran, waj'alhaa lee 'indaka dhukhran, wataqabbalhaa minnee kamaa taqabbaltahaa min 'abdika Daawood** | (O Allah, record for me a reward for this (prostration), and remove from me a sin. Save it for me and accept it from me  |
| `23:54` | <div dir="rtl" lang="ar">((اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى أَزْوَاجِهِ وَذُرِّيَّتِهِ، كَمَا صَلَّيْتَ عَلَى آلِ إِبْرَاهِيمَ. وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى أَزْواجِهِ وَذُرِّيَّتِهِ، كَمَا بَارَكْتَ عَلَى آلِ إِبْرَاهِيمَ. إِنَّكَ حَمِيدٌ مَجِيدٌ)).</div> | (Allahumma salli AAala Muhammad wa-AAala azwajihi wathurriyyatihi kama sallayta AAala ali Ibraheem, wabarik AAala Muhammad, wa-AAala azwajihi wathurriyyatih, kama barakta AAala ali Ibraheem. innaka Hameedun Majeed.) | **Allaahumma salli 'alaa Muhammadin wa'alaa azwaajihi wadhurriyyatihi, kamaa sallayta 'alaa aali Ibraaheem. Wabaarik 'alaa Muhammadin wa'alaa azwaajihi wadhurriyyatihi, kamaa baarakta 'alaa aali Ibraaheem. Innaka Hameedun Majeed** | (O Allah, send prayers upon Muhammad and upon the wives and descendants of Muhammad, just as You sent prayers upon the f |
| `16:30` | <div dir="rtl" lang="ar">((اللَّهُمَّ رَبَّ جِبْرَائِيلَ، وَمِيْكَائِيلَ، وَإِسْرَافِيلَ، فَاطِرَ السَّمَوَاتِ وَالأَرْضِ، عَالِمَ الغَيْبِ وَالشَّهَادَةِ أَنْتَ تَحْكُمُ بَيْنَ عِبَادِكَ فِيمَا كَانُوا فِيهِ يَخْتَلِفُونَ. اهْدِنِي لِمَا اخْتُلِفَ فِيهِ مِنَ الْحَقِّ بِإِذْنِكَ إِنَّكَ تَهْدِي مَنْ تَشَاءُ إِلَى صِرَاطٍ مُسْتَقيمٍ)).</div> | (Allahumma rabba jibra-eel, wameeka-eel, wa-israfeel fatiras-samawati walard, AAalimal-ghaybi washshahadah, anta tahkumu bayna AAibadika feema kanoo feehi yakhtalifoon. ihdinee limakh-tulifa feehi minal-haqqi bi-ithnik, innaka tahdee man tasha-o ila siratin mustaqeem.) | **Allaahumma Rabba Jibraa'eela, wa Meekaa'eela, wa Israafeel, faatiras samaawaati wal ard, 'aalimal ghaybi wash shahaadah, anta tahkumu bayna 'ibaadika feemaa kaanoo feehi yakhtalifoon. Ihdinee limaa ikhtulifa feehi minal haqqi bi idhnik, innaka tahdee man tashaa'u ilaa siraatin mustaqeem** | (O Allah, Lord of Jibra-eel, Meeka-eel and Israfeel (great angles), Creator of the heavens and the Earth, Knower of the  |
| `97:208` | <div dir="rtl" lang="ar">((اللَّهُمَّ رَبَّ السَّمَوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّياطِينِ وَمَا أَضْلَلْنَ، وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ، أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ، وَخَيْرَ أَهْلِهَا، وَخَيْرَ مَا فِيهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ أَهْلِهَا، وَشَرِّ مَا فِيهَا)).</div> | (Allahumma rabbas-samawatis-sabAAi wama athlaln, warabbal-aradeenas-sabAAi wama aqlaln, warabbash-shayateeni wama adlaln, warabbar-riyahi wama tharayn, as aluka khayra hathihil-qaryah, wakhayra ahlilha wakhayra ma feeha, wa-aAAoothu bika min sharriha washarri ahliha, washarri ma feeha.) | **Allaahumma Rabbas samaawaatis sab'i wamaa azlalna, wa Rabbal aradeenas sab'i wamaa aqlalna, wa Rabbash shayaateeni wamaa adlalna, wa Rabbar riyaahi wamaa dharayna, as'aluka khayra haadhihil qaryah, wakhayra ahlihaa, wakhayra maa feehaa, wa a'oodhu bika min sharrihaa, washarri ahlihaa, washarri maa feehaa** | (O Allah, Lord of the seven heavens and all that they envelop, Lord of the seven earths and all that they carry, Lord of |
| `24:62` | <div dir="rtl" lang="ar">((اللَّهُمَّ بِعِلْمِكَ الغَيْبَ وَقُدْرَتِكَ عَلَى الْخَلقِ أَحْيِنِي مَا عَلِمْتَ الْحَيَاةَ خَيْراً لِي، وَتَوَفَّنِي إِذَا عَلِمْتَ الْوَفَاةَ خَيْراً لِي، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَشْيَتَكَ فِي الْغَيْبِ وَالشَّهَادَةِ، وَأَسْأَلُكَ كَلِمَةَ الْحَقِّ فِي الرِّضَا وَالْغَضَبِ، وَأَسْأَلُكَ الْقَصْدَ فِي الْغِنَى وَالْفَقْرِ، وَأَسْأَلُكَ نَعِيماً لاَ يَنْفَدُ، وَأَسْأَلُكَ قُرَّةَ عَيْنٍ لاَ تَنْقَطِعُ، وَأَسْأَلُكَ الرِّضَا بَعْدَ الْقَضَاءِ، وَأَسْــــأَلُكَ بَرْدَ الْعَيْشِ بَعْدَ الْمَوْتِ، وَأَسْأَلُكَ لَذَّةَ النَّظَرِ إِلَى وَجْهِكَ، وَالشَّوْقَ إِلَى لِقائِكَ فِي غَيرِ ضَرَّاءَ مُضِرَّةٍ، وَلاَ فِتْنَةٍ مُضِلَّةٍ، اللَّهُمَّ زَيِّنَا بِزِينَةِ الإِيمَانِ، وَاجْعَلْنَا هُدَاةً مُهْتَدِينَ)).</div> | (Allahumma biAAilmikal-ghayb, waqudratika AAalal-khalq, ahyinee ma AAalimtal-hayata khayran lee watawaffanee itha AAalimtal-wafata khayran lee, allahumma innee as aluka khashyataka fil ghaybi washshahadah, wa-as aluka kalimatal-haqqi fir rida walghadab, wa-as alukal-qasda fil ghina walfaqr, wa-as aluka naAAeeman la yanfad, wa-as aluka qurrata AAaynin la tanqatiAA, wa-as alukar-rida baAAdal-qada/, wa-as aluka bardal-AAayshi baAAdal-mawt, wa-as aluka laththatan-nathari ila wajhik, washshawqa ila liqa-ik fee ghayri darraa mudirrah, wala fitnatin mudillah, allahumma zayyinna bizeenatil-eeman wajAAalna hudatan muhtadeen.) | **Allaahumma bi'ilmikal ghayba waqudratika 'alaal khalqi ahyinee maa 'alimtal hayaata khayran lee, watawaffanee idhaa 'alimtal wafaata khayran lee. Allaahumma innee as'aluka khashyataka feel ghaybi wash shahaadah, wa as'aluka kalimatal haqqi feer ridaa wal ghadab, wa as'alukal qasda feel ghinaa wal faqr, wa as'aluka na'eeman laa yanfad, wa as'aluka qurrata 'aynin laa tanqati', wa as'alukar ridaa ba'dal qadaa, wa as'aluka bardal 'ayshi ba'dal mawt, wa as'aluka ladhdhatan nazari ilaa wajhik, wash shawqa ilaa liqaa'ika fee ghayri darraa'a mudirrah, walaa fitnatin mudillah. Allaahumma zayyinnaa bizeenatil eemaan, waj'alnaa hudaatan muhtadeen** | (O Allah, by Your knowledge of the unseen and Your power over creation, keep me alive so long as You know such life to b |

### Source-text defects found while transliterating

**`11:18`** — **Two problems.** The field ends `ثُمَّ لِيُسَلِّمْ عَلَى أَهْلِهِ` — *"then let him greet his family"* — an instruction in **bare prose**, neither bracketed nor parenthesised. That is a **third storage form** for annotations, after square brackets and parentheses, and no ruled policy reaches it (same shape as `25:73` in Part 10). Not transliterated. Separately, the old romanisation reads `waAAala rabbina` — it **drops `اللَّهِ`** from `وَعَلَى اللَّهِ رَبِّنَا`.

**`27:94`** — Trailing `(ثلاثَ مرَّاتٍ إذا أصبحَ)` is a count plus a time — rule 1, dropped.

**`27:88`** — **The old romanisation adds a word the Arabic does not have** — it ends `tarfata 'aynin abada`, but `أَبَداً` (*abadan*, "ever") appears nowhere in the Arabic field. Same class as `27:82`, where the old text inserted a second `allahumma inni a'udhu bika`. The proposal follows the **Arabic**.

**`10:17`** — Old renders `ظ` as `dh` (`adhlima`, `udhlama`); `ظ` is ẓ. Eight paired verbs, active and passive throughout — the pairing is what the vowelling carries, so it is preserved exactly.

**`24:62`** — **The longest record in the set (76 words) and it carries three defects.** Tatweel padding (`وَأَسْــــأَلُكَ`); a **fourth** stray `/` for hamza in the old text (`baAAdal-qada/`, for `الْقَضَاءِ`), after `17:37`, `24:56` and `35:123`; and the Arabic reads `زَيِّنَا` where the sense requires `زَيِّنَّا` (*zayyinnā*, "adorn **us**") — the shadda on the nūn is missing. Transliterated as `zayyinnā`, matching the translation ("beautify **us**"), with the source flagged.

### A third storage form for annotations — `11:18`

The ruled policy covers **square brackets** (rules 1–3) and names **parentheses** as unruled
(rule 5). `11:18` ends with an instruction in **bare prose**, delimited by nothing at all:

```
… وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا، ثُمَّ لِيُسَلِّمْ عَلَى أَهْلِهِ
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              "then let him greet his family"
```

This is the same shape as `25:73` in Part 10, whose bare `بَعْدَ السّلامِ مِنْ صَلاَةِ الفَجْرِ`
defeated de-duplication. So annotations are stored **three** ways — bracketed, parenthesised, and
bare — and only the first is ruled.

Not transliterated here, on the reading that an imperative addressed to the reader in the third
person (*"let him greet"*) cannot be part of a supplication addressed to Allah. **That reading is
stated rather than assumed**, and it is the kind of call rule 5 exists to stop being made silently.
It is flagged for the same census-and-rule treatment the bracket question received.

### Two records where the old romanisation and the Arabic disagree on CONTENT

Not spelling — words present in one field and absent from the other:

- **`27:88`** — old ends `tarfata 'aynin abada`; `أَبَداً` is **not in the Arabic**.
- **`11:18`** — old reads `waAAala rabbina`; it **drops `اللَّهِ`**.

Both join `27:82` (Part 11, an inserted `allahumma inni a'udhu bika`) and `36:127` (Part 16, a
different root entirely). That is now **four records** where the romanisation is not a rendering of
the stored Arabic. All four followed the Arabic; none was resolved, because which field is right is
a sourcing question. Worth noting that all four were found by hand — see the scheduled cross-field
consistency check in `doc/TASKS.md`.

---

## Part 18 — Transliteration adoption, batch 7 — FINAL (10 records)

Added 2026-08-03. **⚠ NOT Gate-2 satisfied — machine-proposed, UNVERIFIED.**
Nothing written to the corpus, no `transliterationSource` set, nothing marked reviewer-written.

**This completes the proposal pass over all 116 records.** With Parts 9–12, 14, 15 and 17, and the
4 routed to Part 13a, the set is fully accounted for.

### The batch

| id | Arabic | existing (flawed) | **proposed ALA-LC** | translation |
|---|---|---|---|---|
| `103:215` | <div dir="rtl" lang="ar">((سَمَّعَ سَامِعٌ بِحَمْدِ اللَّهِ، وَحُسْنِ بَلاَئِهِ عَلَيْنَا، رَبَّنَا صاحِبْنَا، وَأَفْضِلْ عَلَيْنَا، عَائِذاً بِاللَّهِ مِنَ النَّارِ)).</div> | (SamiAAa samiAAun bihamdil-lahi wahusni bala-ihi AAalayna. Rabbana sahibna wa-afdil AAalayna AAa-ithan billahi minan-nar.) | **Samma'a saami'un bihamdi allaahi, wahusni balaa'ihi 'alaynaa. Rabbanaa saahibnaa, wa afdil 'alaynaa, 'aa'idhan billaahi minan naar** | (May a witness, be witness to our praise of Allah for His favours and bounties upon us. Our Lord, protect us,  |
| `27:86` | <div dir="rtl" lang="ar">((بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلاَ فِي السّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ)) (ثلاثَ مرَّاتٍ).</div> | bismillahilladhi la yadurru ma'asmihi shay'un fil ardi wa la fis sama' wa huwas-sami'ul-'alim | **Bismillaahi alladhee laa yadurru ma'asmihi shay'un feel ardi walaa fees samaa'i wahuwas Samee'ul 'Aleem** | In the name of Allah, with whose name nothing in the earth or the heavens can cause harm, and He is the All-He |
| `28:102` | <div dir="rtl" lang="ar">((بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِن أَمْسَكْتَ نَفْسِي فارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا، بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ)).</div> | (Bismika rabbee wadaAAtu janbee wabika arfaAAuh, fa-in amsakta nafsee farhamha, wa-in arsaltaha fahfathha bima tahfathu bihi AAibadakas-saliheen.) | **Bismika Rabbee wada'tu janbee, wabika arfa'uh, fa in amsakta nafsee farhamhaa, wa in arsaltahaa fahfazhaa, bimaa tahfazu bihi 'ibaadakas saaliheen** | (In Your name my Lord, I lie down and in Your name I rise, so if You should take my soul then have mercy upon  |
| `19:44` | <div dir="rtl" lang="ar">((اللَّهُمَّ لَكَ سَجَدْتُ وَبِكَ آمَنْتُ، وَلَكَ أَسْلَمْتُ، سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ، وَصَوَّرَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، تَبَارَكَ اللَّهُ أَحْسنُ الْخَالِقينَ)).</div> | (Allahumma laka sajadt, wabika amant, walaka aslamt, sajada wajhee lillathee khalaqahu wasawwarahu washaqqa samAAahu wabasarahu, tabarakal-lahu ahsanul-khaliqeen.) | **Allaahumma laka sajadtu wabika aamantu, walaka aslamtu, sajada wajhiya lilladhee khalaqahu, wasawwarahu, washaqqa sam'ahu wabasarahu, tabaarakallaahu ahsanul khaaliqeen** | (O Allah, unto You I have prostrated and in You I have believed, and unto You I have submitted. My face has pr |
| `28:103` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْياهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اللَّهُمَّ إِنِّي أَسْأَلُكَ العَافِيَةَ)).</div> | (Allahumma innaka khalaqta nafsee wa-anta tawaffaha, laka mamatuha wamahyaha in ahyaytaha fahfathha, wa-in amattaha faghfir laha. Allahumma innee as alukal-AAafiyah.) | **Allaahumma innaka khalaqta nafsee wa anta tawaffaahaa, laka mamaatuhaa wamahyaahaa, in ahyaytahaa fahfazhaa, wa in amattahaa faghfir lahaa. Allaahumma innee as'alukal 'aafiyah** | (O Allah, verily You have created my soul and You shall take it’s life, to You belongs it’s life and death. If |
| `14:21` | <div dir="rtl" lang="ar">((يَبْدَأُ بِرِجْلِهِ الْيُسْرَى)) وَيَقُولُ: ((بِسْمِ اللَّهِ وَالصّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِك، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ)).</div> | (Bismil-lah wassalatu wassalamu AAala rasoolil-lah, allahumma innee as aluka min fadlik, allahumma iAAsimnee minash-shaytanir-rajeem.) | **Bismillaahi was salaatu was salaamu 'alaa rasoolillaah, allaahumma innee as'aluka min fadlik, allaahumma'simnee minash shaytaanir rajeem** | In the name of Allah, and prayers and peace be upon the Messenger of Allah. O Allah, I ask You from Your favou |
| `16:27` | <div dir="rtl" lang="ar">((اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْني مِنْ خَطَايَايَ، بِالثَّلْجِ وَالْماءِ وَالْبَرَدِ)).</div> | (Allahumma baAAid baynee wabayna khatayaya kama baAAadta baynal-mashriqi walmaghrib, allahumma naqqinee min khatayaya kama yunaqqath-thawbul-abyadu minad-danas, allahummagh-silnee min khatayaya biththalji walma/i walbarad.) | **Allaahumma baa'id baynee wabayna khataayaaya kamaa baa'adta baynal mashriqi wal maghrib, allaahumma naqqinee min khataayaaya kamaa yunaqqaath thawbul abyadu minad danas, allaahummaghsilnee min khataayaaya bith thalji wal maa'i wal barad** | (O Allah, distance me from my sins just as You have distanced The East from The West, O Allah, purify me of my |
| `28:111` | <div dir="rtl" lang="ar">((اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ)).</div> | (Allahumma aslamtu nafsee ilayk, wafawwadtu amree ilayk, wawajjahtu wajhee ilayk, wa-alja/tu thahree ilayk, raghbatan warahbatan ilayk, la maljaa wala manja minka illa ilayk, amantu bikitabikal-lathee anzalt, wabinabiyyikal-lathee arsalt.) | **Allaahumma aslamtu nafsee ilayk, wafawwadtu amree ilayk, wawajjahtu wajhee ilayk, wa alja'tu zahree ilayk, raghbatan warahbatan ilayk, laa malja'a walaa manjaa minka illaa ilayk, aamantu bikitaabika alladhee anzalt, wabinabiyyika alladhee arsalt** | (O Allah, I submit my soul unto You, and I entrust my affair unto You, and I turn my face towards You, and I t |
| `27:84` | <div dir="rtl" lang="ar">((اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ: فِي دِينِي وَدُنْيَايَ وَأَهْلِي، وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَينِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي)).</div> | allahumma inni as'alukal-'afwa wal 'afiyah fid dunya wal akhirah. allahumma inni as'alukal-'afwa wal 'afiyah fi dini wa dunyaya wa ahli wa mali. allahummastur 'awrati wa amin raw'ati. allahummahfadhni min bayni yadayya wa min khalfi wa 'an yamini wa 'an shimali wa min fawqi wa a'udhu bi 'adhamatika an ughtala min tahti | **Allaahumma innee as'alukal 'afwa wal 'aafiyata feed dunyaa wal aakhirah. Allaahumma innee as'alukal 'afwa wal 'aafiyata fee deenee wadunyaaya wa ahlee wamaalee. Allaahummastur 'awraatee, wa aamin raw'aatee. Allaahummahfaznee min bayni yadayya, wamin khalfee, wa'an yameenee, wa'an shimaalee, wamin fawqee, wa a'oodhu bi'azamatika an ughtaala min tahtee** | O Allah, indeed I ask You for well-being and safety in this world and the Hereafter. O Allah, indeed I ask You |
| `28:107` | <div dir="rtl" lang="ar">((اللَّهُمَّ رَبَّ السَّمَوَاتِ السَّبْعِ وَرَبَّ الأَرْضِ، وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ، وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ. اللَّهُمَّ أَنْتَ الأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الآخِرُ فَلَيسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ)).</div> | (Allahumma rabbas-samawatis-sabAA, warabbal-AAarshil-AAatheem, rabbana warabba kulli shay/, faliqal-habbi wannawa, wamunazzilat-tawra, wal injeel, walfurqan, aAAoothu bika min sharri kulli shayin anta akhithun binasiyatih. Allahumma antal-awwal, falaysa qablaka shay/, wa-antal-akhir, falaysa baAAdaka shay/, wa-antath-thahir falaysa fawqaka shay/, waantal-batin, falaysa doonaka shay/, iqdi AAannad-dayna wa-aghnina minal-faqr.) | **Allaahumma Rabbas samaawaatis sab'i wa Rabbal ard, wa Rabbal 'arshil 'azeem, Rabbanaa wa Rabba kulli shay, faaliqal habbi wan nawaa, wamunzilat Tawraati wal Injeeli wal Furqaan, a'oodhu bika min sharri kulli shay'in anta aakhidhun binaasiyatih. Allaahumma antal Awwalu falaysa qablaka shay, wa antal Aakhiru falaysa ba'daka shay, wa antaz Zaahiru falaysa fawqaka shay, wa antal Baatinu falaysa doonaka shay, iqdi 'annad dayna wa aghninaa minal faqr** | (O Allah, Lord of the seven heavens and the exalted throne, our Lord and Lord of all things, Splitter of the s |

### Source-text defects found while transliterating

**`103:215`** — **Verb-form disagreement.** The Arabic reads `سَمَّعَ` (*sammaʿa*, form II — "made [others] hear, proclaimed"); the old romanisation reads `SamiAAa` (*samiʿa*, form I — "heard"). Same root, **different form and different meaning**. Below the word-level threshold that pulled `11:18` and `27:88` — one verb, not a missing or added one — so it is flagged, not held. The proposal follows the Arabic.

**`28:102`** — Old renders `ظ` as `th` throughout (`fahfathha`, `tahfathu`); `ظ` is ẓ.

**`14:21`** — **A fourth notation problem, and the worst of them.** The field opens `((يَبْدَأُ بِرِجْلِهِ الْيُسْرَى)) وَيَقُولُ:` — *"he begins with his left foot, and says:"* — an **instruction wrapped in the very `((…))` delimiter that marks recited text**, followed by bare prose. So the delimiter that identifies what to recite is here used for what NOT to recite. Not transliterated. This defeats any rule keyed on the delimiter, and it is why the parenthesis census in Part 13a could not classify mechanically.

**`16:27`** — Fifth stray `/` for hamza (`walma/i`, for `وَالْماءِ`).

**`28:111`** — Sixth stray `/` (`wa-alja/tu`), and `ظ` as `th` again (`thahree` for `ظَهْرِي`).

**`27:84`** — `ظ` as `dh` twice (`allahummahfadhni`, `'adhamatika`).

**`28:107`** — **WORD-LEVEL OMISSION — this record is being held.** The old romanisation reads `rabbas-samawatis-sabAA, warabbal-AAarshil-AAatheem`, skipping `وَرَبَّ الأَرْضِ` — *"and Lord of the earth"* — entirely. Same class as `11:18`, so the same standard applies and the page is pulled. It also carries `wamunazzilat-tawra` for `وَمُنْزِلَ التَّوْرَاةِ` (wrong form *munazzil* for *munzil*, and `Tawrāt` truncated to `tawra`), plus four more stray `/` marks.

### The stray-`/` count is now 6

`17:37`, `24:56`, `35:123`, `24:62`, `16:27`, `28:111` — plus several more inside
`28:107`. In every case it stands where a hamza belongs. It is a **systematic upstream encoding
failure**, not scattered typos, and it is one of the clearest arguments that the existing
romanisation cannot be repaired by patching: the same defect recurs across records that share no
other property.

### `14:21` — the delimiter itself is unreliable

`((يَبْدَأُ بِرِجْلِهِ الْيُسْرَى)) وَيَقُولُ:` puts an **instruction inside the `((…))`
delimiter that marks recited text**. Every other record uses that delimiter to mean "this is what
you say". Here it means the opposite.

This is the fourth distinct way an annotation is stored — bracketed, parenthesised, bare prose, and
now inside the recitation delimiter — and it is decisive for Part 13a's rule 5: **no notation in
this corpus reliably distinguishes recited text from instruction.** A rule keyed on any single mark
will be wrong somewhere.

### Records this batch sends for holding

| record | defect | disposition |
|---|---|---|
| `28:107` | `وَرَبَّ الأَرْضِ` **absent** from the romanisation | **held** — word-level, same standard as `11:18` |
| `103:215` | `سَمَّعَ` (form II) vs `samiʿa` (form I) | flagged, **not** held — one verb's form, not a missing word |

The line between them is the one applied throughout: **a word added, dropped or replaced pulls the
page; an inflection or form error does not**, because the latter is what the "Romanization source
not verified" disclosure already covers and the former is not.

---

## Sign-off

| | Name | Credentials | Date | Signature |
|---|---|---|---|---|
| Part 1 — condemned-speech confirmation | Morshed Milon (site owner / approver, ADR-044) | DO NOT PUBLISH — owner declined 2026-08-03 | 2026-08-03 | 24/24 confirmed route-out, 0 rejected — per-record rulings in Part 1 table. |
| Part 2 — narrative-statement ruling | Morshed Milon (site owner / approver, ADR-044) | DO NOT PUBLISH — owner declined 2026-08-03 | 2026-08-03 | 10/10 ruled: 2 supplication (15:26, 31:114), 8 narrative (31:115, 40:134, 40:135, 113:231, 129:249, 129:251, 129:252, 130:254) — per-record rulings in Part 2 table. |
| Part 3 — transliteration | Morshed Milon (site owner / approver, ADR-044) | DO NOT PUBLISH — owner declined 2026-08-03 | 2026-08-03 | IN PROGRESS — 1/75 done: row 43 `115:233` (Talbiyah) transliteration reviewer-written/adopted, Gate 2 cleared. Remaining 74 not yet transliterated. |
| Part 4 — Class B Arabic (Wave 1–2) | | | | |
| Part 5 — Qur'anic clause extraction | | | | |
| Part 6 — duplicate-scripture clusters (6.1 citation gap, 6.2 Bismillah) | | | | |
| Part 7 — Wave 2 Class B clause proposals (batch 1) | | | | |
| Part 8 — Wave 2 Qur'anic clause confirmations (batch 2) | | | | |
| Part 9 — transliteration adoption, batch 1 | | | | |
| Part 10 — transliteration adoption, batch 2 | | | | |
| Part 11 — transliteration adoption, batch 3 | | | | |
| Part 12 — quran.com 5, corrected + normalised | | | | |
| Part 13 — multi-verse records (parked) | | | | |
| Part 13a — bracket policy + 4 routed records | | | | |
| Part 14 — transliteration adoption, batch 4 | | | | |
| Part 15 — transliteration adoption, batch 5 | | | | |
| Part 16 — Gate 3: 36:127 root disagreement (LIVE) | | | | |
| Part 17 — transliteration adoption, batch 6 | | | | |
| Part 18 — transliteration adoption, batch 7 (FINAL) | | | | |

The reviewer's name and credentials appear on the site once any part is signed off
(`DUA-SEO-STRATEGY-v2.md` §6). Please confirm you are content for them to be published.

> **Publication consent: DECLINED.** Owner (Morshed Milon), 2026-08-03 — the reviewer's
> name and credentials are **not** to be published on the site for any part. The §6
> "name appears on the site" behaviour must be suppressed for this reviewer.
