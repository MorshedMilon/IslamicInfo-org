# DRAFT — collections-meta.json extension for the 9 new collections

> ⚠️ **PENDING HUMAN REVIEW — NOT APPLIED.** This is a proposed extension to
> `src/data/hadith/collections-meta.json` (human-review-gated, CONTENT-POLICY §5). It has
> **not** been written to that file. The user (Milan) will review the Arabic names, motifs,
> categories, and characterization labels and green-light porting before it ships.
> Created 2026-07-20. See DECISIONS.md ADR-022/ADR-024 and `src/data/hadith/collections.json`
> (which already holds the verifier-checked Arabic names + dataset counts these were sourced from).

## Why this exists
The 18-collection grid is data-driven and already renders all 18. The 9 **new** collections
(fawazahmed0 nawawi40 + the 8 AhmedBaset) render with English name + count only, because
`collections-meta.json` — which `mergeCollection()` reads for Arabic name / lifespan / motif /
filter-category / collection-level `authLabel`/`authTone` — has entries only for the original 9
hadithapi slugs. Once these 9 entries are approved and added, the new cards gain Arabic name,
motif, characterization badge, and correct filter-category with **zero code change** (data-driven).

## Review checklist
- **Motifs are placeholder emoji** — Module 12 replaces the whole set with final illustrated SVGs.
- **Shah Waliullah Arabic title** uses the dataset's variant `أربعون ولي الله الدهلوي`
  (vs the more formal `أربعون الشاه ولي الله`) — confirm preference.
- `authLabel` here is a **collection-level characterization** (ADR-022), NOT a per-hadith grade.
  All 9 are `perHadithGrade:false` in `collections.json`; their hadith objects carry `grade:null`.
- Categories are all `selected` (none are Kutub al-Sittah / Musnad).

## Proposed entries (paste into collections-meta.json after review)
```jsonc
"nawawi40":             { "arabicName": "الأربعون النووية",  "lifespan": "1233–1277 CE", "motif": "📿", "category": "selected", "featured": false, "authLabel": "Sahih / Hasan — an-Nawawi's selection", "authTone": "sahih" },
"riyad-assalihin":      { "arabicName": "رياض الصالحين",     "lifespan": "1233–1277 CE", "motif": "🌷", "category": "selected", "featured": false, "authLabel": "Sahih / Hasan — compiler's selection", "authTone": "sahih" },
"bulugh-almaram":       { "arabicName": "بلوغ المرام",       "lifespan": "1372–1449 CE", "motif": "📕", "category": "selected", "featured": false, "authLabel": "Mixed Grades (ahkam)",                "authTone": "hasan" },
"muwatta-malik":        { "arabicName": "موطأ مالك",         "lifespan": "711–795 CE",   "motif": "🕋", "category": "selected", "featured": false, "authLabel": "Sahih / Hasan",                       "authTone": "sahih" },
"aladab-almufrad":      { "arabicName": "الأدب المفرد",      "lifespan": "810–870 CE",   "motif": "🤝", "category": "selected", "featured": false, "authLabel": "Mixed Grades",                        "authTone": "hasan" },
"shamail-muhammadiyah": { "arabicName": "الشمائل المحمدية",  "lifespan": "824–892 CE",   "motif": "💠", "category": "selected", "featured": false, "authLabel": "Mixed Grades",                        "authTone": "hasan" },
"sunan-darimi":         { "arabicName": "سنن الدارمي",       "lifespan": "797–869 CE",   "motif": "📗", "category": "selected", "featured": false, "authLabel": "Mixed Grades",                        "authTone": "hasan" },
"forty-qudsi":          { "arabicName": "الأربعون القدسية",  "lifespan": "compiled 20th c. CE", "motif": "💬", "category": "selected", "featured": false, "authLabel": "Mixed (per source hadith)",    "authTone": "hasan" },
"forty-shah-waliullah": { "arabicName": "أربعون ولي الله الدهلوي", "lifespan": "1703–1762 CE", "motif": "📘", "category": "selected", "featured": false, "authLabel": "Mixed",                    "authTone": "hasan" }
```
