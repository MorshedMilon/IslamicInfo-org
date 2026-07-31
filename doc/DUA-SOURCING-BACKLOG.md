# DUA-SOURCING-BACKLOG.md

**Status:** open backlog · created 2026-07-31 · read-only record, no page or record is changed by this file.

Records whose attribution slot is filled by something that does not name a source. Per the owner ruling of 2026-07-31, these are a **transparency gap, not a defective record**: they are **not excluded** from search or browse, they keep their text and their page, and the card simply renders **no attribution element** rather than a placeholder that names nothing.

Resolving an entry means identifying the collection the text actually comes from and setting a real `sourceLabel`/`sourceKey` — never guessing one. Until then the honest state is silence.

See also ADR-058 (the corpus has no working generator, so these must be edited in place, not re-ingested).

---

## A. `sourceKey: "other"` — label present, names nothing (15 records)

The label reads **"Other source"**, which occupies the attribution slot while identifying no collection. Suppressed at render in both `src/js/search-results-core.js` (`duaSourceLabel`) and `scripts/build-dua-library.mjs` (`sourceLine`).

| id | category | translation (truncated) | state |
|---|---|---|---|
| `27:75` | Words of remembrance for morning and evening | Allāh - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in … | live |
| `27:76` | Words of remembrance for morning and evening | Say, "He is Allāh, [who is] One, Allāh, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent." Say, "I seek refuge in… | live |
| `28:100` | What to say before sleeping | Allāh - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in … | live |
| `28:101` | What to say before sleeping | The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allāh and His angels a… | live |
| `1:4` | supplications for when you wake up | Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding - Who remember … | live |
| `19:46` | Invocations during Sujood | O Allah! Forgive all my sins, the small and the great, first and the last, the open and the secret. | live |
| `22:52` | Invocation for At-Tashahhud (sitting in prayer) | Allah compliments, prayers and pure words are due to Allah. Peace be upon you, O Prophet, and the mercy of Allah (SWT) and his blessings. Peace be upo… | live |
| `24:60` | Invocations after the final Tash-ahhud and before ending the prayer | O Allah, I seek refuge with You from miserliness, and I seek refuge with You from cowardice, and I seek refuge with You from reaching the age of senil… | live |
| `25:70` | What to say after completing the prayer | Recited after the obligatory prayers — once after Zuhr, Asr, and Isha, and three times after Fajr and Maghrib: Say, "He is Allāh, [who is] One, Allāh,… | live |
| `25:71` | What to say after completing the prayer | Recited after each obligatory prayer: Allāh - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor… | live |
| `55:157` | Invocations for the dead in the Funeral prayer | O Allah, forgive our living and our dead, those who are present and those who are absent, our young and our old, our males and our females. O Allah, w… | live |
| `55:158` | Invocations for the dead in the Funeral prayer | O Allah, so-and-so the son of so-and-so is in Your case and under Your protection. Protect him from the trial of the grave and the torment of the Fire… | live |
| `61:167` | Invocations for when the wind blows | O Allah, I beg of You its good and the good of that which it contains and the good of the purpose for which it has been sent; and I seek Your Refuge f… | live |
| `115:233` | The pilgrim's announcement of his arrival for Hajj or Umrah | Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and blessings are Yours, and all sovereignty, You have no … | live |
| `130:263` | The excellence of remembering Allah | O Allah, grant me pardon, have mercy upon me, direct me to the path of righteousness, grant me protection and provide me sustenance. | live |

---

## B. No `sourceLabel` at all (20 records)

These carry no attribution field. **All 20 are already in the exclusion set** on other grounds (guidance narrations and the two untranslated records), so none of them currently renders anywhere — but the missing attribution is recorded here so that resolving the exclusion does not silently ship an unattributed record.

| id | category | translation (truncated) | state |
|---|---|---|---|
| `28:99` | What to say before sleeping | (When retiring to his bed every night, the Prophet would hold his palms together, spit (A form of spitting comprising mainly of air with little spittl… | excluded |
| `28:110` | What to say before sleeping | (The Prophet never used to sleep until he had recited Soorat As-Sajdah (chapter 32) and Soorat Al-Mulk (chapter 67).) | excluded |
| `15:24` | What to say upon hearing the Athan (call to prayer) | ‘One should then send prayers on the Prophet (sal-Allaahu 'alayhe wa sallam) after answering the call of the mu.adhdhin’. | excluded |
| `40:133` | Invocations for if you are stricken by in your faith | (none) | excluded |
| `42:138` | Invocation against the distractions of Satan during the prayer and recitation of the Quran | (othman Ibn Al-AAas narrated: I said ‘O Messenger of Allah, verily the devil comes between me and my prayer and recitation making me confused’ The Mes… | excluded |
| `50:149` | The reward for visiting the sick | (Ali Ibn Abee Talib related that he heard the Messenger of Allah say: ‘If a man calls on his sick Muslim brother, it is as if he walks reaping the fru… | excluded |
| `74:185` | Invocation for someone who offers you food when you are fasting, which you decline | (none) | excluded |
| `107:219` | The excellence of asking for Allah's blessings upon the Prophet pbuh | (The Prophet (PBUH) said: ‘Whoever sends a prayer upon me, Allah sends ten upon him.) | excluded |
| `107:220` | The excellence of asking for Allah's blessings upon the Prophet pbuh | (He (PBUH) also said: ‘Do not take my grave as a place of habitual ceremony. Send prayers upon me, for verily your prayers reach me wherever you are.) | excluded |
| `107:221` | The excellence of asking for Allah's blessings upon the Prophet pbuh | (He (PBUH) also said: ‘A miser is one whom when I am mentioned to him, fails to send prayers upon me.) | excluded |
| `107:222` | The excellence of asking for Allah's blessings upon the Prophet pbuh | The Prophet [PBUH] said:'Indeed Allah has angels who roam the earth and they convey to me the greetings (or prayers of peace) of my 'Ummah (nation). | excluded |
| `107:223` | The excellence of asking for Allah's blessings upon the Prophet pbuh | The Prophet [PBUH] said: 'No one sends greetings (or prayers of peace) upon me but Allah returns my soul to me so that I may return his greetings | excluded |
| `108:224` | spreading the greetings of Salam (Peace) | (The Messenger of Allah said: ‘You shall not enter paradise until you believe, and you shall not believe until you love one another. Shall I not infor… | excluded |
| `108:226` | spreading the greetings of Salam (Peace) | (Aabdullah Ibn Aamr reported that a man asked the Prophet : ‘Which Islam is the best?’. He replied: Feed (the poor), and greet those whom you know as … | excluded |
| `120:238` | Supplication to be recited at the sacred area of Muzdalifah | The Prophet rode his camel, Al-Qaswa, until he reached the sacred area (Al-Mash aril Haraam). Then he faced the Qiblah and invoked Allah, and repeated… | excluded |
| `121:239` | Saying Allahu Akbar while stoning the three pillars at Mina | The Prophet PBUH said Allaahu 'Akbar (Allah is the Most Great) with each pebble he threw at the three pillars. Then he went forward, stood facing the … | excluded |
| `123:242` | What to say when something that pleases you happens | (The Prophet PBUH would prostrate in gratitude to Allah upon receiving news which pleased him or which caused pleasure. ) | excluded |
| `129:248` | Repentance and seeking forgiveness | (The Messenger of Allah said: ‘By Allah, I seek forgiveness and repent to Allah, more than seventy times a day.) | excluded |
| `129:253` | Repentance and seeking forgiveness | (He also said: ‘verily my heart becomes preoccupied, and verily I seek Allah’s forgiveness a hundred times a day.)(preoccupied: i.e. in a state of ‘fo… | excluded |
| `131:266` | How the Prophet glorified Allah | (Tasbeeh, it means here, to say: (Subhanal-lah, alhamdu lillah, Allahu akbar.)) (AAabdullah Ibn AAamr said: ’I saw the prophet make tasbeeh with his r… | excluded |

---

## C. Related, not in this backlog

- **`sourceKey: "dua-dhikr"` (45 records)** names a *dataset* (the fitrahive dua-dhikr collection), not a source collection. It is a real, citable provenance for the translation, so it is left rendering as-is — but it answers "where did this English come from", not "which collection is this dua from". Flagged for a later decision, deliberately not actioned here.
