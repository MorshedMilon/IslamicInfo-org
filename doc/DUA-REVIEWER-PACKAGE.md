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
| `28:109` | `what-to-say-before-sleeping-hisn-28-109` | What to say before sleeping | sleep-waking | **none** |

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
| `abudawud:1513` | medium | اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَ… | O Allah, You are As-Salam, and from you is As-Salam.… |
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
| `quran:12:33` | word 2/17 | رَبِّ ٱلسِّجْنُ أَحَبُّ إِلَىَّ مِمَّا ي… | My Lord, prison is more to my liking than that… | rabbi l-sij'nu aḥabbu ilayya mimmā yadʿū… |
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
| `quran:2:260` | word 4/39 | رَبِّ أَرِنِى كَيْفَ تُحْىِ ٱلْمَوْتَىٰ … | My Lord, show me how You give life to the dead… | rabbi arinī kayfa tuḥ'yī l-mawtā qāla aw… |
| `quran:20:45` | word 2/10 | رَبَّنَآ إِنَّنَا نَخَافُ أَن يَفْرُطَ … | Our Lord, indeed we are afraid that he will ha… | rabbanā innanā nakhāfu an yafruṭa ʿalayn… |
| `quran:21:112` | word 2/10 | رَبِّ ٱحْكُم بِٱلْحَقِّ ۗ وَرَبُّنَا ٱلر… | My Lord, judge [between us] in truth. And our … | rabbi uḥ'kum bil-ḥaqi warabbunā l-raḥmān… |
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

The reviewer's name and credentials appear on the site once any part is signed off
(`DUA-SEO-STRATEGY-v2.md` §6). Please confirm you are content for them to be published.

> **Publication consent: DECLINED.** Owner (Morshed Milon), 2026-08-03 — the reviewer's
> name and credentials are **not** to be published on the site for any part. The §6
> "name appears on the site" behaviour must be suppressed for this reviewer.
