# Upstream source licence evidence — captured 2026-07-31

**Read-only record.** Captured so it can be shown to someone outside the project.
Every item below is a direct observation, with the endpoint or command that produced it.
**No interpretation, characterisation, or legal conclusion is offered or intended.**

Three upstream sources supply the dua corpus. All three are recorded here.

---

## 1. Hisn al-Muslim — `github.com/wafaaelmaandy/Hisn-Muslim-Json`

Supplies **188 of 556** corpus records (Track A only; Track B carries none).

**Repository metadata** — `GET https://api.github.com/repos/wafaaelmaandy/Hisn-Muslim-Json`

```
default_branch : master
license        : null
fork           : false
created_at     : 2019-01-26T16:56:01Z
description    : "hisn AlMuslim book at english and Arabic as Json File"
```

**Licence endpoint** — `GET /repos/wafaaelmaandy/Hisn-Muslim-Json/license`

```
Not Found
```

**Complete recursive tree** — `GET /git/trees/master?recursive=1`. The repository contains exactly one file:

```
blob  husn_en.json  (284245 bytes)
```

**Candidate licence / usage paths — all HTTP 404** on `raw.githubusercontent.com/.../master/`:

```
LICENSE   LICENSE.md  LICENSE.txt  LICENCE  LICENCE.md  COPYING  COPYRIGHT
NOTICE    README      README.md    README.txt  readme.md  USAGE.md  TERMS.md
```

**Pinned commit SHA:** none exists in this project. `worker/scripts/ingest-dua-corpus.mjs`
fetches `.../master/husn_en.json` — a moving branch reference, not a tag or SHA.

**Licence text inside the dataset file:** none. The only occurrences of the word
"permission" are within the translation of Ayat al-Kursi ("except by His permission").

**Observed correspondence with the shipped corpus:** of the 205 records attributed to
"Hisn al-Muslim compilation English", **179 are byte-identical** to this dataset and 4 more
match after stripping wrapping parentheses. 22 differ; **none is empty**; 19 of those carry
the note `"supplication extracted from the narration in the source compilation"`.

---

## 2. quran.com API v4 — Saheeh International, edition id 20

Supplies **106** corpus records.

**Edition metadata** — `GET https://api.quran.com/api/v4/resources/translations`, id 20.
Complete record exactly as returned:

```json
{ "id": 20, "name": "Saheeh International", "author_name": "Saheeh International",
  "slug": "en-sahih-international", "language_name": "english",
  "translated_name": { "name": "Saheeh International", "language_name": "english" } }
```

**No licence, copyright, permission, or usage field is present in that record.**

**quran.com Terms and Conditions** — `https://quran.com/terms-and-conditions` (HTTP 200),
quoted verbatim:

> 1.2 The Mobile Application, is licensed, not sold, to you by Quran.com.

> 1.4 As part of the Service, we use a diverse range of proprietary and authorized third party information, listings, directories, text, advertisements, User Generated Content (as defined herein), photographs, designs, graphics, images, sound and video recordings, animation and other material and effects (which we collectively call the "Content") available by means of the Service FOR YOUR PERSONAL, NON-COMMERCIAL USE ONLY. Accordingly, you may view, use, copy, and distribute the Content obtained by means of the Service for individual, noncommercial, informational purposes only and in compliance with this Agreement and all applicable laws.

> By using the Service, you agree you will not copy, reproduce, alter, modify, create derivative works from, rent, lease, loan, sell, distribute or publicly display any of the Content (except for your own personal, non commercial use) accessed by the Service without the prior written consent of Quran.com. In addition, you will not use the Content for any unauthorized non-commercial marketing and promotional campaigns, target or mass solicitation campaigns or political campaigning.

> 2.3 You agree that you will not use the Service for any revenue generating endeavor, commercial enterprise, or other purpose for which it is not designed or intended (except that Quran.com and its affiliates and their respective employees are expressly permitted to use the Service for the internal business purposes of Quran.com and its affiliates).

---

## 3. `AhmedBaset/hadith-json`

Supplies **198** corpus records (the cited hadith supplications, 9 books).

**Repository metadata** — `GET https://api.github.com/repos/AhmedBaset/hadith-json`

```
full_name      : AhmedBaset/hadith-json
default_branch : main
license        : null
stars / forks  : 295 / 82
description    : "Database of Prophet hadiths include 50,884 hadiths from 17 book,
                  among of them the nine books"
```

**Licence endpoint** — `GET /repos/AhmedBaset/hadith-json/license`

```
Not Found
```

**Candidate licence paths on `main`:** `LICENSE`, `LICENSE.md`, `LICENCE`, `COPYING`,
`NOTICE` — **all HTTP 404**. `README.md` — **HTTP 200** (3535 bytes).

**The README contains no licence, permission, or usage-terms statement.** A full-text
search for licen[cs]e / copyright / permission / "free to" / "you may" / attribution /
credit / terms returned exactly two matches, neither of which is a grant:

> - **Musnad Ahmad**: Chapters 8–30 are missing from the source data on Sunnah.com. If you know of a better source, please open an issue.

> Contributions are welcome! Feel free to open an issue or pull request for data corrections, new formats, or code improvements.

**The README states the data's own origin, verbatim:**

> A comprehensive JSON database of **50,884 hadiths** — the sayings and actions of Prophet Muhammad ﷺ — in both Arabic and English, scraped from [Sunnah.com](https://sunnah.com/) and covering 17 canonical books.

It also carries this instruction, verbatim:

> Pin to a specific tag when fetching files directly from GitHub — the data format may change on `main`.

---

## Summary of observations

| Source | Records | LICENSE file | GitHub `license` | README | Usage statement found |
|---|---:|---|---|---|---|
| `Hisn-Muslim-Json` | 188 | none — 14 paths 404 | `null` | none | none |
| quran.com v4 / Saheeh Intl | 106 | n/a | n/a | n/a | Terms present, quoted above |
| `AhmedBaset/hadith-json` | 198 | none — 5 paths 404 | `null` | present | none |

## What the project recorded as its clearance basis

Quoted from `doc/DECISIONS.md`:

- **ADR-051 (Hisn).** Recorded: *"The dataset carries **no explicit license** … the provenance
  is the compilation itself."* Cleared 2026-07-25 as: *"Project owner … reviewed and approved
  the Hisn al-Muslim source + attribution. … Gate CLOSED."*
- **ADR-049 (quran.com).** Records only that verse text *"must come from an established dataset
  with attribution — never model-generated"*, and that *"Attribution ('Saheeh International',
  quran.com) [is] surfaced in the `/api/quran/search` response"*. **No licence review is recorded.**
- **AhmedBaset/hadith-json.** **No ADR records a licence review of this source.**
