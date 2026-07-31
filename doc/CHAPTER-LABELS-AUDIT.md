# CHAPTER-LABELS-AUDIT.md

**Phase 1 artifact** — produced under `DUA-KEYWORD-NAMING-v1_0.md` §11, Phase 1 (read-only).
No project data was modified. No build was run. Batches 1–2 remain unapproved and `noindex,follow`.

All 132 chapter labels covering the 506 browse pages, with a proposed new label per §3.
**Proposals are for review, not application.** 99 of 132 come through the §3 rules cleanly;
33 are flagged and need a decision before Phase 3.

## Summary

| Metric | Value |
|---|---:|
| Distinct chapter labels | 132 |
| Pages covered | 506 |
| Labels the §3 rules resolve cleanly | 99 |
| Labels flagged for a decision | 33 |
| — `BOOK`: collection book name, §3 has no pattern | 8 (**259 pages, 51.2% of the corpus**) |
| — `AMBIGUOUS`: rules give more than one defensible answer | 8 |
| — `L1-FAIL`: content is not a dua, so no honest Dua/Adhkar token | 7 |
| — `COLLISION`: two chapters reduce to the same label | 6 |
| — `DATA DEFECT`: source label is broken in the corpus | 2 |
| — `OVER-28` accepted per §4 | 2 |
| Current labels over 28 chars | 114 |
| Longest current label | 105 chars |

## The blocker: 8 book-chapter labels covering 259 pages

§4 says "the remaining 126 labels have not been reviewed", which reads as though all 132 follow the
Hisn al-Muslim pattern. They do not. Eight are **the compilation's own book names**, and they cover
**259 of 506 pages (51.2%)**:

| Pages | Source | Label |
|---:|---|---|
| 99 | The Qur'an | Qur'anic supplications |
| 53 | Jami at-Tirmidhi | Chapters on Supplication (Kitab al-Da'awat) |
| 36 | Sunan an-Nasa'i | Seeking Refuge with Allah (Kitab al-Isti'adha) |
| 22 | Sahih Muslim | Remembrance & Supplication (Kitab al-Dhikr wa'l-Du'a) |
| 21 | Sunan Abi Dawud | Supplications in the Witr Prayer (Kitab al-Witr) |
| 20 | Sunan Ibn Majah | Supplication (Kitab al-Du'a) |
| 7 | Sahih al-Bukhari | Invocations (Kitab al-Da'awat) |
| 1 | Jami at-Tirmidhi | The Book on Al-Witr (Kitab al-Witr) |

None of the §3.1 source patterns match these, and the reason is structural rather than cosmetic:
a book name labels **a location in a collection, not an occasion**. "Chapters on Supplication
(Kitab al-Da'awat)" is shared by 53 different duas about 53 different subjects. Rewriting it to a
single `Dua for X` would either invent a topic the source does not state — which §1(B) of the
master spec forbids — or give 53 unrelated pages one generic name, which fails L2 and makes the
disambiguator carry the entire search signal.

**This needs your decision before any of the 132 can be finalised**, because it interacts directly
with the §12 hub-and-spoke question: these 8 labels are exactly the chapters where a hub page would
carry the topic and the spokes would each need their own.

## Full audit

`Flag` blank = the §3 rules resolve cleanly and the proposal is ready for your approval.

| # | Ref | Current label | Chars | Pages | Proposed | Chars | Flag | Note |
|---:|---|---|---:|---:|---|---:|---|---|
| 1 | The Qur'an | Qur'anic supplications | 22 | 99 | — *(none proposed)* | — | BOOK | §3 provides no pattern for a collection book name |
| 2 | Jami at-Tirmidhi | Chapters on Supplication (Kitab al-Da'awat) | 43 | 53 | — *(none proposed)* | — | BOOK | §3 provides no pattern for a collection book name |
| 3 | Sunan an-Nasa'i | Seeking Refuge with Allah (Kitab al-Isti'adha) | 46 | 36 | — *(none proposed)* | — | BOOK | §3 provides no pattern for a collection book name |
| 4 | Hisn al-Muslim 27 | Words of remembrance for morning and evening | 44 | 24 | **Morning & Evening Adhkar** | 24 |  | confirmed in §4 |
| 5 | Sahih Muslim | Remembrance & Supplication (Kitab al-Dhikr wa'l-Du'a) | 53 | 22 | — *(none proposed)* | — | BOOK | §3 provides no pattern for a collection book name |
| 6 | Sunan Abi Dawud | Supplications in the Witr Prayer (Kitab al-Witr) | 48 | 21 | — *(none proposed)* | — | BOOK | §3 provides no pattern for a collection book name |
| 7 | Sunan Ibn Majah | Supplication (Kitab al-Du'a) | 28 | 20 | — *(none proposed)* | — | BOOK | §3 provides no pattern for a collection book name |
| 8 | Hisn al-Muslim 130 | The excellence of remembering Allah | 35 | 12 | **Virtues of Dhikr** | 16 | L1-FAIL | chapter is about the VIRTUE of dhikr, not a dua to recite. "Dhikr" satisfies §6 but not L1, which lists only Dua/Duas/Adhkar |
| 9 | Hisn al-Muslim 24 | Invocations after the final Tash-ahhud and before ending the prayer | 67 | 11 | **Dua After Tashahhud** | 19 |  |  |
| 10 | Hisn al-Muslim 28 | What to say before sleeping | 27 | 11 | **Dua Before Sleeping** | 19 |  | confirmed in §4 |
| 11 | Hisn al-Muslim 25 | What to say after completing the prayer | 39 | 8 | **Dua After Salah** | 15 |  | confirmed in §4 |
| 12 | Sahih al-Bukhari | Invocations (Kitab al-Da'awat) | 30 | 7 | — *(none proposed)* | — | BOOK | §3 provides no pattern for a collection book name |
| 13 | Hisn al-Muslim 19 | Invocations during Sujood | 25 | 7 | **Dua in Sujood** | 13 |  |  |
| 14 | Hisn al-Muslim 16 | Invocations for the beginning of the prayer | 43 | 6 | **Dua to Start Salah** | 18 |  |  |
| 15 | Hisn al-Muslim 17 | Invocations during Ruki' (bowing in prayer) | 43 | 5 | **Dua in Ruku** | 11 |  |  |
| 16 | Hisn al-Muslim 35 | Invocations for anguish | 23 | 4 | **Dua for Anxiety** | 15 |  |  |
| 17 | Hisn al-Muslim 55 | Invocations for the dead in the Funeral prayer | 46 | 4 | **Janazah Dua for the Dead** | 24 |  |  |
| 18 | Hisn al-Muslim 129 | Repentance and seeking forgiveness | 34 | 4 | **Dua for Istighfar** | 17 |  |  |
| 19 | Hisn al-Muslim 1 | supplications for when you wake up | 34 | 4 | **Dua When Waking Up** | 18 |  | confirmed in §4 |
| 20 | Hisn al-Muslim 15 | What to say upon hearing the Athan (call to prayer) | 51 | 4 | **Dua After the Adhan** | 19 | AMBIGUOUS | source spells it "Athan". §6 locks Salah/Wudu/Adhkar but says nothing about Adhan vs Athan vs Azan — needs a ruling |
| 21 | Hisn al-Muslim 45 | Invocations against the Devil and his promptings | 48 | 3 | **Dua Against Shaytan** | 19 | COLLISION | collides with ch128 "What to say to foil the devil's plots"; both reduce to a dua against the devil |
| 22 | Hisn al-Muslim 32 | Invocations for Qunut in the Witr prayer | 40 | 3 | **Dua Qunut for Witr** | 18 |  |  |
| 23 | Hisn al-Muslim 18 | Invocations for rising from the Ruki' | 37 | 3 | **Dua After Ruku** | 14 |  |  |
| 24 | Hisn al-Muslim 36 | Invocations for when you meet an adversary or a powerful ruler. | 63 | 3 | **Dua Before Facing a Ruler** | 25 | AMBIGUOUS | source names TWO situations, "an adversary or a powerful ruler". Any ≤28-char label drops one |
| 25 | Hisn al-Muslim 51 | Invocations of the terminal ill | 31 | 3 | **Dua for the Terminally Ill** | 26 | COLLISION | near-collides with ch52 "What to encourage the dying person to say" |
| 26 | Hisn al-Muslim 63 | Some invocations for rain | 25 | 3 | **Dua for Rain** | 12 |  |  |
| 27 | Hisn al-Muslim 9 | What to say upon completing ablution | 36 | 3 | **Dua After Wudu** | 14 |  |  |
| 28 | Hisn al-Muslim 23 | How to recite blessings on the Prophet after the Tashahhud | 58 | 2 | **Durood After Tashahhud** | 22 | AMBIGUOUS | "Durood" is South Asian, "Salawat" is Arabic. §6 does not cover the choice and it materially changes the target query |
| 29 | Hisn al-Muslim 70 | Invocations after eating | 24 | 2 | **Dua After Eating** | 16 |  |  |
| 30 | Hisn al-Muslim 37 | Invocations against the oppression of rulers | 44 | 2 | **Dua Against Oppression** | 22 |  |  |
| 31 | Hisn al-Muslim 69 | Invocations before eating | 25 | 2 | **Dua Before Eating** | 17 |  |  |
| 32 | Hisn al-Muslim 56 | Invocations for a child in the Funeral prayer | 45 | 2 | **Janazah Dua for a Child** | 23 |  |  |
| 33 | Hisn al-Muslim 68 | Invocations for breaking the fast | 33 | 2 | **Dua for Iftar** | 13 |  |  |
| 34 | Hisn al-Muslim 40 | Invocations for if you are stricken by in your faith | 52 | 2 | — *(none proposed)* | — | DATA DEFECT | source label is grammatically broken: "Invocations for if you are stricken by in your faith". Cannot be rewritten faithfully until the corpus text is repaired |
| 35 | Hisn al-Muslim 20 | Invocations for sitting between two prostrations | 48 | 2 | **Dua Between Sujood** | 18 |  |  |
| 36 | Hisn al-Muslim 4 | Invocations for someone who has put on new clothes | 50 | 2 | **Dua for New Clothes** | 19 | COLLISION | ch3 is the wearer's own dua, ch4 is said TO someone wearing new clothes. Both reduce to the same label |
| 37 | Hisn al-Muslim 41 | Invocations for the setting of a debt | 37 | 2 | **Dua for Debt Relief** | 19 |  |  |
| 38 | Hisn al-Muslim 49 | Invocations for visiting the sick | 33 | 2 | **Dua for the Sick** | 16 |  |  |
| 39 | Hisn al-Muslim 61 | Invocations for when the wind blows | 35 | 2 | **Dua for Wind** | 12 |  |  |
| 40 | Hisn al-Muslim 34 | Invocations in times of worry and grief | 39 | 2 | **Dua for Worry & Grief** | 21 |  |  |
| 41 | Hisn al-Muslim 21 | Supplications for prostrating due to recitation of the Qur'an | 61 | 2 | **Dua for Sajdah Tilawah** | 22 |  |  |
| 42 | Hisn al-Muslim 101 | The resident's invocations for the traveler | 43 | 2 | **Dua for Someone Travelling** | 26 | COLLISION | ch96 is the traveller's own dua; ch101 is said by the resident FOR the traveller |
| 43 | Hisn al-Muslim 31 | What to do if you have a bad dream or nightmare | 47 | 2 | **Dua for Bad Dreams** | 18 |  |  |
| 44 | Hisn al-Muslim 10 | What to say when leaving the home | 33 | 2 | **Dua When Leaving Home** | 21 |  |  |
| 45 | Hisn al-Muslim 122 | What to say when surprised or startled | 38 | 2 | **Dua When Startled** | 17 |  |  |
| 46 | Hisn al-Muslim 71 | A dinner guest's invocation for his host | 40 | 1 | **Dua for Your Host** | 17 |  |  |
| 47 | Hisn al-Muslim 47 | Congratulations for new parents and how they should respond | 59 | 1 | **Dua for New Parents** | 19 |  |  |
| 48 | Hisn al-Muslim 102 | Glorifying and magnifying Allah on the journey | 46 | 1 | **Tasbih While Travelling** | 23 |  |  |
| 49 | Hisn al-Muslim 113 | How a Muslim should praise another Muslim | 41 | 1 | — *(none proposed)* | — | L1-FAIL | "How a Muslim should praise another Muslim" is etiquette guidance, not a dua. No §3 pattern yields a Dua/Adhkar token honestly |
| 50 | Hisn al-Muslim 109 | How to reply to a disbeliever if he says Salam to you | 53 | 1 | — *(none proposed)* | — | L1-FAIL | "How to reply to a disbeliever if he says Salam" is a reply formula, not a dua |
| 51 | Hisn al-Muslim 48 | How to seek Allah's protection for children | 43 | 1 | **Dua to Protect Children** | 23 |  |  |
| 52 | Hisn al-Muslim 91 | Invocation (upon receipt of the loan) for someone who lends you money | 69 | 1 | **Dua for a Lender** | 16 |  |  |
| 53 | Hisn al-Muslim 38 | Invocation against an enemy | 27 | 1 | **Dua Against an Enemy** | 20 |  |  |
| 54 | Hisn al-Muslim 94 | Invocation against evil portent | 31 | 1 | **Dua Against Bad Omens** | 21 |  |  |
| 55 | Hisn al-Muslim 73 | Invocation for a family who invites you to break your fast with them | 68 | 1 | **Dua for Your Iftar Host** | 23 |  |  |
| 56 | Hisn al-Muslim 104 | Invocation for a layover (stopping along the way) on the journey | 64 | 1 | **Dua for Stopping on a Journey** | 29 | OVER-28 (accepted) | 29 chars — confirmed and accepted in §4 |
| 57 | Hisn al-Muslim 88 | Invocation for Allah's protection from the False Messiah | 56 | 1 | **Dua Against the Dajjal** | 22 |  |  |
| 58 | Hisn al-Muslim 82 | Invocation for anger | 20 | 1 | **Dua for Anger** | 13 |  |  |
| 59 | Hisn al-Muslim 22 | Invocation for At-Tashahhud (sitting in prayer) | 47 | 1 | **Tashahhud Dua** | 13 |  |  |
| 60 | Hisn al-Muslim 54 | Invocation for closing the eyes of the dead | 43 | 1 | **Dua When Closing the Eyes** | 25 |  |  |
| 61 | Hisn al-Muslim 98 | Invocation for entering a market | 32 | 1 | **Dua for Entering a Market** | 25 |  |  |
| 62 | Hisn al-Muslim 97 | Invocation for entering a town or city | 38 | 1 | **Dua for Entering a City** | 23 |  |  |
| 63 | Hisn al-Muslim 13 | Invocation for entering the mosque | 34 | 1 | **Dua for Entering the Masjid** | 27 |  |  |
| 64 | Hisn al-Muslim 6 | Invocation for entering the restroom | 36 | 1 | **Dua for Entering the Bathroom** | 29 | OVER-28 (accepted) | 29 chars — confirmed and accepted in §4 |
| 65 | Hisn al-Muslim 92 | Invocation for fear of Shirk | 28 | 1 | **Dua Against Shirk** | 17 |  |  |
| 66 | Hisn al-Muslim 12 | Invocation for going to the mosque | 34 | 1 | **Dua for Going to the Masjid** | 27 |  |  |
| 67 | Hisn al-Muslim 14 | Invocation for leaving the mosque | 33 | 1 | **Dua for Leaving the Masjid** | 26 |  |  |
| 68 | Hisn al-Muslim 7 | Invocation for leaving the restroom | 35 | 1 | **Dua for Leaving the Bathroom** | 28 |  |  |
| 69 | Hisn al-Muslim 95 | Invocation for riding in a vehicle or on an animal | 50 | 1 | **Dua for Riding a Vehicle** | 24 |  |  |
| 70 | Hisn al-Muslim 67 | Invocation for sighting the new moon | 36 | 1 | **Dua for the New Moon** | 20 |  |  |
| 71 | Hisn al-Muslim 77 | Invocation for sneezing | 23 | 1 | **Dua for Sneezing** | 16 |  |  |
| 72 | Hisn al-Muslim 87 | Invocation for someone who does good to you | 43 | 1 | **Dua for Someone Kind to You** | 27 |  |  |
| 73 | Hisn al-Muslim 72 | Invocation for someone who gives you drink or offers it to you | 62 | 1 | **Dua for One Who Gives Drink** | 27 |  |  |
| 74 | Hisn al-Muslim 90 | Invocation for someone who offers you a share of his wealth | 59 | 1 | **Dua for a Generous Giver** | 24 |  |  |
| 75 | Hisn al-Muslim 89 | Invocation for someone who tells you I love you for the sake of Allah | 69 | 1 | **Dua for One Who Loves You** | 25 |  |  |
| 76 | Hisn al-Muslim 93 | Invocation for someone who tells you: May Allah bless you | 57 | 1 | **Dua for One Who Blesses You** | 27 |  |  |
| 77 | Hisn al-Muslim 112 | Invocation for someone you have spoken ill to | 45 | 1 | **Dua for One You Wronged** | 23 |  |  |
| 78 | Hisn al-Muslim 57 | Invocation for the bereaved | 27 | 1 | **Dua for the Bereaved** | 20 |  |  |
| 79 | Hisn al-Muslim 79 | Invocation for the groom | 24 | 1 | **Dua for the Groom** | 17 |  |  |
| 80 | Hisn al-Muslim 66 | Invocation for the withholding of the rain | 42 | 1 | **Dua to Stop the Rain** | 20 |  |  |
| 81 | Hisn al-Muslim 96 | Invocation for traveling | 24 | 1 | **Dua for Travel** | 14 |  |  |
| 82 | Hisn al-Muslim 60 | Invocation for visiting the graves | 34 | 1 | **Dua for Visiting Graves** | 23 |  |  |
| 83 | Hisn al-Muslim 64 | Invocation for when it rains | 28 | 1 | **Dua When It Rains** | 17 |  |  |
| 84 | Hisn al-Muslim 62 | Invocation for when it thunder | 30 | 1 | **Dua for Thunder** | 15 |  |  |
| 85 | Hisn al-Muslim 46 | Invocation for when something you dislike happens, or for when you fail to achieve what you attempt to do | 105 | 1 | **Dua When Things Go Wrong** | 24 | AMBIGUOUS | source label is 105 characters and names two distinct situations. This compresses hard — verify it still describes the dua |
| 86 | Hisn al-Muslim 53 | Invocation for when tragedy strikes | 35 | 1 | **Dua When Tragedy Strikes** | 24 |  |  |
| 87 | Hisn al-Muslim 43 | Invocation for when you find something becoming difficult for you | 65 | 1 | **Dua for Difficulty** | 18 |  |  |
| 88 | Hisn al-Muslim 76 | Invocation for when you see the first dates of the season | 57 | 1 | **Dua for the First Dates** | 23 |  |  |
| 89 | Hisn al-Muslim 99 | Invocation for when your vehicle or mount begins to fail | 56 | 1 | **Dua When a Vehicle Fails** | 24 |  |  |
| 90 | Hisn al-Muslim 59 | Invocation to be recited after burying the dead | 47 | 1 | **Dua After Burial** | 16 |  |  |
| 91 | Hisn al-Muslim 81 | Invocation to be recited before intercourse | 43 | 1 | **Dua Before Intimacy** | 19 |  |  |
| 92 | Hisn al-Muslim 117 | Invocation to be recited between the Yemenite Corner and the Black Stone | 72 | 1 | **Dua Between the Corners** | 23 | AMBIGUOUS | loses "Yemenite Corner and the Black Stone", which is the searchable specificity |
| 93 | Hisn al-Muslim 119 | Invocation to be recited on the Day of Arafat | 45 | 1 | **Dua for the Day of Arafah** | 25 |  |  |
| 94 | Hisn al-Muslim 58 | Invocation to be recited when placing the dead in his grave | 59 | 1 | **Dua When Placing in Grave** | 25 |  |  |
| 95 | Hisn al-Muslim 118 | Invocation to be recited while standing at Safa and Marwah | 58 | 1 | **Dua at Safa & Marwah** | 20 |  |  |
| 96 | Hisn al-Muslim 29 | Invocation to say if you stir in the night | 42 | 1 | **Dua When Waking at Night** | 24 |  |  |
| 97 | Hisn al-Muslim 111 | Invocation upon hearing a dog barking in the night | 50 | 1 | **Dua When a Dog Barks** | 20 |  |  |
| 98 | Hisn al-Muslim 110 | Invocation upon hearing the cock's crow or the bray of a donkey | 63 | 1 | **Dua When a Rooster Crows** | 24 | AMBIGUOUS | source covers "the cock's crow OR the bray of a donkey"; the donkey half is dropped |
| 99 | Hisn al-Muslim 2 | Invocation when getting dressed | 31 | 1 | **Dua When Getting Dressed** | 24 |  |  |
| 100 | Hisn al-Muslim 3 | Invocation when putting on new clothes | 38 | 1 | **Dua for Wearing New Clothes** | 27 | COLLISION | see ch4 |
| 101 | Hisn al-Muslim 26 | Istikharah (seeking Allah's Counsel) | 36 | 1 | **Istikhara Dua** | 13 |  |  |
| 102 | Hisn al-Muslim 116 | Saying Allahu Akbar when passing the Black Stone | 48 | 1 | — *(none proposed)* | — | L1-FAIL | "Saying Allahu Akbar when passing the Black Stone" is a takbir, not a dua |
| 103 | Hisn al-Muslim 108 | spreading the greetings of Salam (Peace) | 40 | 1 | — *(none proposed)* | — | L1-FAIL | "Spreading the greetings of Salam" is a practice, not a dua |
| 104 | Hisn al-Muslim 65 | Supplication after it rains | 27 | 1 | **Dua After Rain** | 14 |  |  |
| 105 | Jami at-Tirmidhi | The Book on Al-Witr (Kitab al-Witr) | 35 | 1 | — *(none proposed)* | — | BOOK | §3 provides no pattern for a collection book name |
| 106 | Hisn al-Muslim 85 | The Expiation of Assembly - Kaffaratul-Majlis | 45 | 1 | **Kaffaratul Majlis Dua** | 21 |  |  |
| 107 | Hisn al-Muslim 80 | The groom’s supplication on the wedding night or when buying an animal | 70 | 1 | **Dua for the Wedding Night** | 25 | AMBIGUOUS | source covers the wedding night OR buying an animal; the second half is dropped |
| 108 | Hisn al-Muslim 115 | The pilgrim's announcement of his arrival for Hajj or Umrah | 59 | 1 | **Talbiyah for Hajj & Umrah** | 25 |  |  |
| 109 | Hisn al-Muslim 103 | The traveler's invocation at dawn | 33 | 1 | **Traveller's Dua at Dawn** | 23 |  |  |
| 110 | Hisn al-Muslim 100 | The traveler's invocation for the one he leaves behind | 54 | 1 | **Dua Before Leaving Family** | 25 |  |  |
| 111 | Hisn al-Muslim 132 | Types of goodness and good etiquette for community life | 55 | 1 | — *(none proposed)* | — | L1-FAIL | "Types of goodness and good etiquette for community life" is etiquette guidance, not a dua |
| 112 | Hisn al-Muslim 86 | vocation for someone who says: May Allah forgive you | 52 | 1 | **Dua for One Who Forgives You** | 28 | DATA DEFECT | source label carries a typo: "vocation" for "Invocation". Corpus must be fixed; the frozen slug already contains it |
| 113 | Hisn al-Muslim 114 | What a Muslim should say when he is praised | 43 | 1 | **Dua When Praised** | 16 |  |  |
| 114 | Hisn al-Muslim 52 | What to encourage the dying person to say | 41 | 1 | **Talqin for the Dying** | 20 | L1-FAIL | a talqin is a prompting, not a dua. "Dua for the Dying" would collide with ch51 |
| 115 | Hisn al-Muslim 44 | What to say and do if you commit a sin | 38 | 1 | **Dua After Sinning** | 17 |  |  |
| 116 | Hisn al-Muslim 8 | What to say before performing ablution | 38 | 1 | **Dua Before Wudu** | 15 |  |  |
| 117 | Hisn al-Muslim 106 | What to say if something happens to please you or to displease you | 66 | 1 | **Dua for Good & Bad News** | 23 |  |  |
| 118 | Hisn al-Muslim 30 | What to say if you are afraid to go to sleep or feel lonely and depressed | 73 | 1 | **Dua for Fear at Night** | 21 |  |  |
| 119 | Hisn al-Muslim 39 | What to say if you fear people may harm you | 43 | 1 | **Dua Against Harm** | 16 |  |  |
| 120 | Hisn al-Muslim 83 | What to say if you see someone afflicted by misfortune | 54 | 1 | **Dua on Seeing Affliction** | 24 |  |  |
| 121 | Hisn al-Muslim 33 | What to say immediately following the Witr prayer | 49 | 1 | **Dua After Witr** | 14 |  |  |
| 122 | Hisn al-Muslim 128 | What to say to foil the devil's plots | 37 | 1 | **Dua Against the Devil** | 21 | COLLISION | see ch45 |
| 123 | Hisn al-Muslim 78 | What to say to the disbeliever if he sneezes and praises Allah | 62 | 1 | **Dua for a Sneeze Reply** | 22 | AMBIGUOUS | source is specifically the reply to a NON-Muslim who sneezes; the label drops that distinction |
| 124 | Hisn al-Muslim 105 | What to say upon returning from a Journey | 41 | 1 | **Dua After Returning Home** | 24 |  |  |
| 125 | Hisn al-Muslim 11 | What to say when entering the home | 34 | 1 | **Dua When Entering Home** | 22 |  |  |
| 126 | Hisn al-Muslim 127 | What to say when slaughtering or sacrificing an animal | 54 | 1 | **Dua for Slaughtering** | 20 |  |  |
| 127 | Hisn al-Muslim 5 | What to say when undressing | 27 | 1 | **Dua When Undressing** | 19 |  |  |
| 128 | Hisn al-Muslim 75 | What to say when you are fasting and someone is rude to you | 59 | 1 | **Dua When Fasting & Insulted** | 27 |  |  |
| 129 | Hisn al-Muslim 125 | What to say when you fear you may afflict something with the evil eye | 69 | 1 | **Dua Against the Evil Eye** | 24 |  |  |
| 130 | Hisn al-Muslim 124 | What to say when you feel a pain in your body | 45 | 1 | **Dua for Pain** | 12 |  |  |
| 131 | Hisn al-Muslim 126 | What to say when you feel frightened | 36 | 1 | **Dua for Fear** | 12 |  |  |
| 132 | Hisn al-Muslim 84 | What to say while sitting in an assembly | 40 | 1 | **Dua for a Gathering** | 19 |  |  |

## Cross-cutting issues found while auditing

**1. §5(b) cannot cover the pages that need it.** §5 estimates "roughly 374 of 506" pages need a
disambiguator. The measured figure is **419** (87 chapters hold exactly one page). Of those 419,
only **135 have a usable transliteration** — 307 corpus entries have no transliteration at all, and
20 more hold English narration prose rather than romanised Arabic. So **284 pages fall through to
§5(c) "flag for manual naming"**. That is not an edge case; it is 56% of the pages needing a
disambiguator, and it has to be resolved before Phase 3 rather than discovered during it.

**2. §7 S3 + S4 interact badly at this scale.** Dropping the `hisn-NN-NNN` suffix removes the only
structurally-guaranteed uniqueness in the slug. With 284 pages having no disambiguator, collisions
would be resolved by S4's numeric suffix, producing runs like `dua-before-sleeping-2` …
`dua-before-sleeping-11` and, for the Qur'an bucket, up to `-99`. Those are less searchable than
the current slugs and fail the spirit of L2. The current id suffix is ugly but it is *derived from
the source citation*, not an arbitrary counter.

**3. §7's premise "no URL has ever been indexed" holds, but for a different reason.** The 506 detail
pages have never been committed to git — they are untracked working-tree files — so they have never
been deployed, independent of their robots state. The claim is true. Worth recording *why*, because
the 30 occasion/source hub pages **have** been committed and deployed, and two of them
(`/duas/source/other.html`, `/duas/source/dua-dhikr.html`) were retired in the previous pass.

**4. Slug truncation (§7 S2) is narrower than it looks.** 32 `categorySlug` values hit the ~60-char
cap. Of those, **9 are cut mid-word** (11 pages). The rest break at a word boundary. The 9:

```
invocations-for-when-you-meet-an-adversary-or-a-powerful-rul   ("rul" → "ruler")
invocation-for-when-you-find-something-becoming-difficult-fo   ("fo" → "for")
invocation-for-when-something-you-dislike-happens-or-for-whe   ("whe" → "when")
invocation-for-someone-who-gives-you-drink-or-offers-it-to-y   ("y" → "you")
invocation-for-a-family-who-invites-you-to-break-your-fast-w   ("w" → "with")
what-to-say-to-the-disbeliever-if-he-sneezes-and-praises-all   ("all" → "allah")
invocation-upon-receipt-of-the-loan-for-someone-who-lends-yo   ("yo" → "you")
invocation-for-a-layover-stopping-along-the-way-on-the-journ   ("journ" → "journey")
what-to-say-if-something-happens-to-please-you-or-to-displea  ("displea" → "displease")
```

**5. §4's Hisn 104 entry differs slightly from the corpus.** §4 lists
"Invocation for a layover, stopping along the way on the journey (63)". The corpus label is
"Invocation for a layover (stopping along the way) on the journey" — parentheses, not commas, and
64 characters. The proposed new label is unaffected.

**6. Two proposals need a spelling ruling §6 does not give.** `Adhan` vs `Athan` vs `Azan`
(ch15), and `Durood` vs `Salawat` (ch23). Both change the target query materially, and §6 locks
Salah/Wudu/Adhkar/Dhikr but is silent on these.
