# IslamicInfo.org — SEO Content Playbook v1.0

**Written 2026-08-01, after the Dua Library build.**
Purpose: record what went wrong on the dua project so the Qur'an and Hadith
builds do not repeat it, and define the order of operations for any future
content module.

---

## Part 1 — What went wrong on the Dua Library

Nine failures, each with the rule it produces. These are not criticisms of the
work; every one was found and fixed. They are recorded so they are not rediscovered.

### 1.1 The project was scoped as a titling exercise; it was a content problem

Phase 1 ran keyword naming and topic assignment across 506 pages. Only when an
audit ran did it emerge that the corpus contained condemned speech published as
supplication, an inverted narration teaching the opposite of its source, and
text-integrity defects in the Arabic and translation fields.

**Rule: content integrity is a gate above SEO. No naming, topic assignment or
indexing work begins until the content is verified.** (ADR-054)

### 1.2 Every bounded number turned out to be a sample

- 6 text defects found in a 259-page sample → became 46 across 556
- 5 hub pages under review → were actually 30
- "12 build-time cards are clean" → true for one question, false for the next
- Chapter 130 looked like one bad ingest pass → was three separate causes

**Rule: when a count appears in a report, ask what it is a count *of* before
acting on it. Assume any number found incidentally is a floor.**

### 1.3 `noindex` was used three times as if it were access control

Gate 1 route-outs, detail pages, and hub pages were all "closed" with `noindex`
while remaining fully served. `noindex` is a request to search engines. It does
not stop a human, an on-site search, or a direct fetch.

**Rule: to make something unavailable, stop serving the bytes. `git rm --cached`
plus a `.gitignore` entry. `noindex` governs indexing only.**

### 1.4 On-site search bypassed every page-level control

The Worker read the corpus directly. Page-level exclusions, `noindex`, and build
filters did nothing to it. All 25 excluded records were reachable by a query
drawn from their own text.

**Rule: any exclusion must be applied where the data is produced, not at each
consumer. One stamp, read by all consumers, or the next consumer added forgets.**

### 1.5 Four mechanisms were written, referenced, and never wired

| Mechanism | Failure |
|---|---|
| Root `CLAUDE.md` charter | Referenced in ~14 places; never existed in git history |
| `ingest-dua-corpus.mjs` | Documented generator; running it would destroy 289 records |
| `meta.reviewQueue` | Keyed on a field present on zero records |
| CI deploy step | Assumed `duas/` existed; broke when it didn't |

**Rule: schedule one bounded sweep per module for "references that resolve to
nothing" before the module ships.**

### 1.6 Verification was carried forward instead of re-run

"Pushed and verified" was asserted in a prompt, inherited as fact, and reported
against for two full turns while production served stale content.

**Rule: verify against production, by URL, after every deploy. Never inherit a
verification from a previous message.**

### 1.7 Attribution defaulted instead of reading the record

Every dua search card was stamped `Hisn al-Muslim` as a literal string while the
corpus recorded four distinct translation sources. Found by accident during an
unrelated audit.

**Rule: attribution is read from the record or omitted. Never a default, never a
placeholder. `Other source` and `dua-dhikr collection` name nothing and render as
nothing.**

### 1.8 The site graph was built inside the subtree but never connected to root

The §17 rewrite produced a median 8 inbound links per detail page and zero
orphans — and all 505 pages remained unreachable from the homepage, because
`dua.html` linked to none of them. The breadcrumb JSON-LD asserted a path the
HTML did not implement.

**Rule: crawl-depth from `index.html` is the acceptance test, not inbound-link
counts within the subtree.**

### 1.10 Four chapters shipped with empty slugs, including the launch chapter

The chapter list showed blank slug cells for four chapters — one of which was
"What to say before sleeping", the 11/11 complete chapter chosen as the launch
set. A chapter with no slug has no chapter-page URL. Found only when the full
list was exported for keyword research.

**Rule: before any module ships, assert that every category has a non-empty
slug, every slug is unique, and every slug resolves to a real page. Make it a
build-time failure, not a review-time discovery.**

Related, from the same list: one chapter label read `vocation for someone who
says: May Allah forgive you` — a truncated "Invocation". Label integrity is part
of the Step 3 scan, not a cosmetic pass.

### 1.9 Keyword research happened after the pages were built

505 titles were composed from Hisn chapter names — "Invocations for anguish",
"Invocations during Ruki'" — before anyone checked what people search. The word
"dua" appears in none of them. The correct term for the highest-demand chapter
("dua for anxiety", not "invocations for anguish") was found only after the
build.

**Rule: keyword research is step 2, before any page is generated. See Part 2.**

---

## Part 2 — The order of operations for any content module

Do these in order. Do not start a step until the previous one is closed.

### Step 1 — Source and licence

- Identify every upstream dataset. Record the licence, the exact URL, and the
  pinned commit or version.
- If the source has published terms, quote them in an evidence file.
- Record the owner determination in an ADR: who decided, on what grounds,
  against which evidence.
- **Gate: no ingest until this ADR exists.**

### Step 2 — Keyword research, before any page exists

- Export the module's full category or chapter list.
- **Research the category, not the page.** One head term covers every page in
  a chapter. 505 pages needed 34 lookups (20 facets + the 14 chapters with 3+
  pages), not 505.
- For each, look up the head term and 3–5 variants in a keyword tool.
- Record: head term, volume, KD, and **the top 10 SERP**.
- Identify which categories share a SERP — those merge into one page.
- Identify which categories have no demand — those become reference pages,
  not SEO targets.
- Produce a `KEYWORD-MAP.md`: category → searchable label → head term → volume
  → SERP type.
- **Gate: no page generation until every category has a searchable label.**

#### 2.1 SERP composition matters more than volume

Volume tells you how many people search. The SERP tells you whether you can win,
and whether they even want a page.

| SERP looks like | Verdict |
|---|---|
| Articles and content sites | Winnable |
| Reddit / forum threads ranking | **Easily winnable** — the SERP is starved |
| YouTube-dominated | **Deprioritise** — video intent, wrong format |
| Apps, products, celebrities intruding | Polluted intent — discount the volume |

Measured example: `morning dua` at 40,500 had four YouTube results in the top
seven, plus a scented candle and Dua Lipa. `dua after salah` at 22,200 had
Reddit and content sites. The *smaller* term was worth more.

Rank by **volume × winnability**, never volume alone.

#### 2.2 Never take search volumes from an AI model

Measured on this project: an AI-generated keyword table gave `dua before sleep`
= 165,000. The real measured figure for `dua before sleeping` was 27,100 — six
times off. Every number in that table was a Google Keyword Planner bucket value
(165,000 / 135,000 / 110,000 / 90,500 / 74,000 / 60,500 / 49,500 / 40,500 /
33,100 / 27,100 / 22,200 / 18,100 / 14,800 / 12,100 / 9,900) walked down in
strict descending order across five separate categories with no repeats and no
gaps. Real data never looks like that.

**Rule: AI models are useful for candidate *phrasings*, never for volumes,
difficulty, or ranking.** Phrasings are corroborable — two independent models
agreeing on a phrase, plus Google autocomplete suggesting it, is real evidence.
Numbers are not corroborable and must come from a keyword tool.

Cheapest free check available: type the phrase into Google. If autocomplete
suggests it, people search it.

#### 2.3 The vocabulary findings (dua module — likely to generalise)

- The searchable word is **"dua"**. Not "invocations", not "supplications".
  Exception: morning/evening, where **"adhkar"** and **"azkar"** also carry real
  demand.
- Search structure is `dua for [need]` or `dua before/after [action]`.
  Source chapter names are `Invocations for [occasion]` — same shape, wrong
  vocabulary. This is a title-formula change, not a restructure.
- The recurring modifiers are **in arabic · in english · transliteration ·
  meaning**. If the page has all four, the title should say so. A competitor
  ranking #3 for a 22,200 term did exactly that: *"Dua After Prayer in English
  With Transliteration"*.
- **Never "best dua for X"**, "powerful dua", "miracle dua". Real demand exists;
  it is efficacy language, forbidden by CONTENT-POLICY, and unnecessary — a
  plain descriptive title ranks for those queries anyway.

#### 2.4 Source taxonomy vs. search taxonomy

The source book is organised by **occasion** (before sleeping, after prayer,
entering the mosque). High-demand search is organised by **need** (anxiety,
marriage, exams, rizq, forgiveness). These overlap only partially.

Where they diverge, the content usually already exists under a name nobody
searches. The dua corpus contained the Bukhari 6363 anxiety supplication filed
under "Invocations in times of worry and grief" — real content, invisible
vocabulary.

**Rule: run an intent-coverage audit before building.** Search the *translation
text*, not the chapter names, for each demand cluster. The intent layer (hubs)
is what closes the gap; the source chapter names stay untouched.

### Step 3 — Content integrity scan

- Scan every record, not the slugged subset. Include variants, guidance
  entries, and anything the page build excludes — they still reach search.
- Build a control set of known-clean and known-defective records. Report
  precision and recall per detector. Any detector that misses a seeded case is
  unmeasured, not merely weak.
- Report `meta`-versus-data conformance: every structural claim the metadata
  makes, checked against the records.
- **Gate: no naming or indexing work until defect classes are bounded.**

### Step 4 — Taxonomy and intent layer

- The source's own chapter names are provenance, not navigation. Keep them;
  do not rename them.
- Build an intent layer above them (the occasion-hub pattern) whose labels come
  from Step 2's keyword map.
- A hub needs ≥3 shippable children. Fewer than 3 is not a hub.
- **Gate: every detail page belongs to at least one hub.**

### Step 5 — Build

- Titles lead with the searchable label; chapter name and source follow.
- Title ≤60 chars, description ≤160 chars, enforced in the builder.
- One H1. JSON-LD on every page type, with item names from the item, not the
  parent.
- Favicon, `og:image`, canonical, robots — in the template, never patched into
  output.
- Zero JavaScript on generated pages.

### Step 6 — Graph

- The root page links to the intent layer.
- Acceptance test: breadth-first crawl from `index.html` reaches 100% of detail
  pages within 3 clicks. Measure it; do not assume it.

### Step 7 — Index policy

- Only pages that deliver what their title promises are `index,follow`.
- A hub with fewer than 3 indexable children is `noindex,follow`.
- Source/provenance pages are metadata: `noindex,follow` always.

### Step 8 — Ship and verify

- Deploy, then verify each check against the production URL.
- Submit the sitemap; watch Search Console for what you are actually found for.
- Search Console data beats every pre-launch estimate. Revisit Step 2 with it
  after 60 days.

---

## Part 3 — Qur'an module plan

### The scale decision, first

The Qur'an has 6,236 ayat. **Do not build 6,236 SEO pages.**

- Demand is extremely concentrated. A few hundred verses carry nearly all
  search volume: Ayat al-Kursi (2:255), the last two ayat of al-Baqarah,
  2:286, 94:5–6, Surah Yasin, al-Kahf, al-Mulk, al-Waqi'ah, the three Quls.
- The remaining ~5,800 have effectively zero individual demand and would be
  6,000 near-identical pages competing against quran.com — the exact thin-content
  and doorway-page pattern to avoid.

**Two tiers:**

| Tier | Scope | Treatment |
|---|---|---|
| **A — SEO pages** | ~200–400 verses with measured demand | Full treatment: dedicated page, keyword-led title, tafsir-grounded context, `index,follow` |
| **B — Reference** | Everything else | Browsable, readable, useful — but surah-level pages, not verse-level. `noindex,follow` or bundled into surah pages |

### Suggested unit of page

- **Surah pages (114)** — real demand exists at surah level ("surah yasin",
  "surah mulk", "surah kahf"). These are strong SEO targets and there are only 114.
- **Verse pages (Tier A only)** — for the famous ayat.
- **Theme pages** — "verses about patience", "verses about parents". These
  aggregate across surahs and often outrank verse pages.

### Step 2 output for this module

Run keyword research on: all 114 surah names (both spellings — "surah" and
"sura", "yasin"/"yaseen"), the ~40 famous verse names, and 20–30 candidate themes.
That is ~200 lookups and it determines the entire build.

Expect the same vocabulary pattern as the dua module: people search
`surah [name]`, `[name] full`, `[name] with transliteration`,
`ayat al kursi meaning` — the source's own naming ("Chapter 36, Ya-Sin") is not
what anyone types. Check the SERP for each: Qur'an queries are heavily
YouTube-recitation-intent, so §2.1's rule will disqualify more terms here than
it did for duas.

Theme pages (`verses about patience`, `quran verses about parents`) are likely
the highest-value tier — they are need-shaped rather than book-shaped, which is
exactly the §2.4 gap.

### Licence note

Saheeh International via quran.com is the current translation source. Before
building, complete Step 1 for it — including quran.com's published terms — and
record the owner determination. Tanzil and public-domain translations are
alternatives if a change is ever wanted.

---

## Part 4 — Hadith module plan

### The scale decision

Five major books hold roughly 30,000 hadith (Bukhari ~7,500, Muslim ~7,500,
Abu Dawud ~5,300, Tirmidhi ~4,000, Nasa'i ~5,800 — verify these counts against
the actual dataset). **Do not build 30,000 SEO pages.**

Demand concentrates even harder than the Qur'an:

| Tier | Scope | Treatment |
|---|---|---|
| **A** | Famous individual hadith — the 40 Nawawi, "actions are by intentions", the hadith of Jibril, etc. Perhaps 200–500 | Full SEO pages |
| **B** | Topic pages — "hadith about kindness to parents", "hadith about seeking knowledge" | Strong SEO targets, aggregate across books |
| **C** | The remaining ~29,000 | Browsable reference, book/chapter pages, `noindex,follow` |

### The grading problem, from the Hadith Library work

The AhmedBaset dataset has no per-hadith grade field for several collections.
**A hadith page without a grade is a page that cannot say what it needs to say.**
Decide before building:

- Which collections have grades in the data
- What a page displays when the grade is unknown (an honest "grade not recorded
  in this dataset" beats silence, and beats a guess)
- Whether ungraded hadith are Tier C only

This is the hadith equivalent of the transliteration gate — a content gate above
SEO, and it should be an ADR before Step 5.

### Licence note

Complete Step 1 for AhmedBaset/hadith-json, including its README statement that
it was scraped from Sunnah.com, and Sunnah.com's own terms.

---

## Part 5 — Immediate next actions (Dua Library)

1. **P0** — link block in `dua.html` to the 20 occasion hubs. Nothing else
   matters until the tree is reachable.
2. Keyword research for all 132 chapters, per Step 2. Produce the keyword map.
3. Title formula change, driven by the map. Do this before fixing the 129
   over-length titles.
4. Favicon, `og:image`, the `536 → 481` stale count, the ItemList JSON-LD fix.
5. Ship the 11/11 "before sleeping" chapter first — highest demand (27,100),
   zero gaps.
6. Source the 65 transliterations. One dataset, one source.
7. External: qualified reviewer for the 19 narrative + 6 UNCLEAR entries;
   print copy of Hisn for the ch40 label.

### Timing

Search volume for this category roughly doubles during Ramadan (02/26 showed
49,500 against a 22,200 baseline). **Pages need to be indexed before Ramadan
begins, not during it.** Work back from that date.

---

## Part 6 — Standing rules

1. Content integrity outranks SEO. Always.
2. Keyword research before generation, never after. Research the category,
   not the page.
3. Verify against production, by URL, every time.
4. A count is a sample until proven otherwise.
5. `noindex` is not access control.
6. Attribution is read from the record or omitted.
7. Crawl depth from root is the acceptance test.
8. The source's chapter names are provenance; the intent layer is navigation.
9. No "best dua", no efficacy claims, no fatwa language, no urgency copy —
   in titles, descriptions, or body.
10. Every decision gets an ADR: who decided, on what grounds, against what
    evidence.
11. Never take a search volume from an AI model. Phrasings yes, numbers no.
12. Rank keywords by volume × winnability. Read the SERP, not just the number.
13. Every category has a non-empty, unique, resolving slug — asserted at build
    time.
14. Reading code is not observing behaviour. Run the page.
15. Ship the smallest complete unit first. One chapter, verified, then expand.
