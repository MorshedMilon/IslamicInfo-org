# Trusted Hadith Sources — Verification Guide

**Source architecture (permanent — set 2026-07-23, ADR-045).** The primary sources are
free, no-key, machine-readable datasets/APIs. Sunnah.com is an **optional future
cross-check** (its key process runs through a GitHub issue with no SLA) — treat it as a
bonus confidence layer if a key is ever granted, **never a blocker**. Rule unchanged:
every narrator grading, hadith grading, and commentary line must trace to one of these
**named** sources with the source shown inline. If a narrator / hadith / ayah is not
found in any dataset → show **"not yet verified"** / "not documented in available
sources" — never fill the gap from model memory.

---

## 0. Structured datasets — PRIMARY (free, no key, machine-readable)

### 0a. Itqan Rijal Database — narrator reliability (jarh wa ta'dil)
**Repo:** https://github.com/R3GENESI5/Itqan (MIT-licensed code; classical texts public domain)
**What:** 115,735 narrator profiles from 22 classical rijal texts (Ibn Hajar's *Taqrib
al-Tahdhib*, al-Dhahabi's *Mizan/Kashif*, al-Mizzi's *Tahdhib al-Kamal*, Ibn Abi Hatim,
Ibn Hibban, Ibn 'Adi, …). ~72.6% graded. Fields per profile: full name + variants,
kunya/laqab/nasab/nisba, **Ibn Hajar's grade from Taqrib**, al-Dhahabi's assessment, jarh
wa ta'dil opinions, classical source cross-refs (entry IDs), death/birth year, tabaqat.
**Use for:** "is narrator X reliable?" — **cite the specific classical text/scholar** the
verdict comes from (e.g. "Thiqah — Ibn Hajar, *Taqrib al-Tahdhib*"). **Never** state a
narrator verdict without a matching Itqan record.
**Data files:** `app/data/narrator_unified.json` (118 MB — needs a backend to query),
`app/data/narrator_index.json` (0.6 MB — name→profile index). Lookup is by name (fuzzy;
217k name variants) — on no confident match → "not yet verified".

### 0b. fawazahmed0/hadith-api — hadith text + gradings (PRIMARY hadith source)
**URL:** https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ (free, no key)
**What:** Multiple collections + languages as flat JSON editions (e.g. `eng-nawawi`,
`ara-nawawi`); grades where the edition provides them. Already the app's direct-source
provider for nawawi40 etc.

### 0c. UmmahAPI — hadith + Qur'an tafsir (SECONDARY / cross-check)
**URL:** https://ummahapi.com (free; anonymous rate-limit 5000/15min, optional key for more)
**Hadith:** `GET /api/hadith/{collection}/{n}` — 36,000+ hadith, 7 major collections.
**Tafsir (commentary):** `GET /api/tafsir/{work}/surah/{s}/ayah/{a}` — named works: **Ibn
Kathir**, Ma'arif al-Qur'an, Muyassar. ⚠ This is **Qur'an tafsir (per ayah)**, NOT
per-hadith scholar commentary — use it for Qur'an verse commentary, not for hadith
commentary panels.

### 0d. LK-Hadith-Corpus — hadith commentary (deeper, Arabic–English parallel)
**Source:** Leeds / King Saud University; GitHub topic "hadith". For per-hadith
Arabic–English parallel + commentary data when UmmahAPI's Qur'an tafsir doesn't apply.
Verify structure/license before wiring.

### Interim app runtime source
The live app serves the six canonical collections via **hadithapi.com** (proxied by the
Worker at `/api/hadith`) — keep it as the primary runtime feed/grade source; add
fawazahmed0 + UmmahAPI as fallback/cross-check. Do **not** rip out hadithapi.com (it
supplies per-hadith sittah grades the flat editions may lack).

---

## 1. Sunnah.com (OPTIONAL cross-reference — key pending, NOT a blocker)

> Historically listed as primary, but access requires a key via a GitHub issue with no
> guaranteed timeline. **Do not block on it.** If a key is granted later, add sunnah.com
> as an *additional* cross-check (extra confidence), not a replacement — plug it in
> alongside the sources above; do not rebuild the pipeline around it.

**URL:** https://sunnah.com
**Best for:** All major collections, side-by-side Arabic/English, direct hadith numbers, grades in English

### Collections available:
- Sahih al-Bukhari → `sunnah.com/bukhari`
- Sahih Muslim → `sunnah.com/muslim`
- Sunan Abu Dawud → `sunnah.com/abudawud`
- Jami' al-Tirmidhi → `sunnah.com/tirmidhi`
- Sunan al-Nasa'i → `sunnah.com/nasai`
- Sunan Ibn Majah → `sunnah.com/ibnmajah`
- Muwatta Malik → `sunnah.com/malik`
- Musnad Ahmad → `sunnah.com/ahmad`
- Riyad al-Salihin → `sunnah.com/riyadussalihin`
- Bulugh al-Maram → `sunnah.com/bulugh`
- Al-Adab al-Mufrad → `sunnah.com/adab`

### How to read grading on sunnah.com:
- Grade appears below the hadith text in English
- Shows multiple graders when available (e.g., "Sahih (Al-Albani)")
- USC-MSA numbering may differ from Arabic editions — note which system

### Search query patterns:
```
# English input — collection + number:
"site:sunnah.com bukhari 1"

# English input — topic/keyword:
"sunnah.com hadith intentions actions"

# Arabic input — paste Arabic text directly:
"sunnah.com [Arabic text keywords]"

# Both English and Arabic — use English keywords first,
# fall back to Arabic if English returns no result
```

---

## 2. ihadis.com (Cross-Collection Search — English)

**URL:** https://ihadis.com
**Best for:** Searching across all 6 major collections simultaneously when collection is unknown; clean English output; fast number + grade lookup

### Features:
- Single search returns matches across all major collections at once
- Fully English interface — ideal when user inputs English hadith text
- Returns collection name, hadith number, and grade clearly
- Shows variant wordings across collections side by side
- Useful when the user provides partial text with no collection specified

### Search query patterns:
```
# English keyword search:
"ihadis.com [English keywords]"
e.g., "ihadis.com actions judged by intentions"

# When collection is unknown:
"ihadis.com [topic]" — returns all matching collections
```

---

## 3. IslamQA.info (Scholar-Verified Authenticity — English + Arabic)

**URL:** https://islamqa.info
**Best for:** Confirming authenticity, catching fabricated or misattributed narrations, scholar-verified explanations in plain English

### Features:
- Reviewed by Sheikh Muhammad Salih al-Munajjid's scholarly team
- Explains *why* a hadith is weak, fabricated, or authentic in plain language
- Handles both English and Arabic search queries
- Strongest resource for commonly circulated fabricated narrations
- Covers authenticity disputes between scholars with clear explanations
- Trusted by mainstream Muslim audiences globally

### How to use for verification:
- Use after sunnah.com + ihadis.com to confirm or flag authenticity
- Best for: "Is this hadith authentic?" type checks
- Best for: Narrations that circulate widely on social media (often fabricated)
- Do NOT use as primary source for hadith numbers or isnad chains

### Search query patterns:
```
# English query:
"islamqa.info hadith [topic or keywords]"
e.g., "islamqa.info hadith cleanliness half of faith"

# Arabic query:
"islamqa.info [Arabic keywords]"

# Checking fabrication:
"islamqa.info fabricated hadith [keywords]"
```

---

## Input Language Handling

| User inputs | Primary action |
|-------------|---------------|
| English text | Search sunnah.com + ihadis.com with English keywords |
| Arabic text | Search sunnah.com (supports Arabic search) + islamqa.info |
| Both | Use English for ihadis.com, Arabic for sunnah.com Arabic search |
| No collection given | Use ihadis.com cross-collection search first |
| Suspiciously viral narration | Check islamqa.info for fabrication first |

---

## Numbering System Differences

⚠️ Hadith numbers differ between editions. Always specify which numbering:

| Collection | Common Issue |
|------------|-------------|
| Sahih al-Bukhari | Arabic edition vs. USC-MSA numbering differ |
| Sahih Muslim | Book+number vs. continuous numbering |
| Sunan Abu Dawud | Some editions skip numbers |
| Musnad Ahmad | Varies widely by edition |

**Best practice:** Cite the sunnah.com number AND note "Sunnah.com numbering" to avoid confusion.

---

## Grading Scholars — Key Names to Recognize

| Scholar | Era | Known for |
|---------|-----|-----------|
| Imam al-Bukhari | Classical | Compiled Sahih al-Bukhari |
| Imam Muslim | Classical | Compiled Sahih Muslim |
| al-Tirmidhi | Classical | Graded hadith in his Sunan |
| Ibn Hajar al-'Asqalani | Medieval | Fath al-Bari; rijal expertise |
| al-Dhahabi | Medieval | Mizan al-I'tidal; narrator criticism |
| Nasir al-Din al-Albani | Modern | Silsilah Sahihah/Da'ifah; prolific grader |
| Shu'ayb al-Arna'ut | Modern | Re-graded Musnad Ahmad; often differs from al-Albani |
| Ibn al-Jawzi | Medieval | Classified many mawdu' narrations |
| al-Suyuti | Medieval | Al-La'ali al-Masnu'ah (fabrications) |

When grades conflict between al-Albani and al-Arna'ut, flag as 🟠 GRADE DISPUTED.
