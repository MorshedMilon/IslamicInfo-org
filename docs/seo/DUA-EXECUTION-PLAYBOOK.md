# IslamicInfo.org `/duas/` — Execution Playbook v1.0

How to run the v2 documents through Claude Code. Seven sessions, in order, one session each.
Do not merge sessions. Do not run waves in parallel — the whole point of the wave structure is
that Search Console data from wave N decides whether wave N+1 happens.

---

## Repo placement (do this by hand, before Session 0)

```
docs/seo/
├── DUA-SEO-STRATEGY-v2.md              ← the strategy
├── CLAUDE-CODE-DUA-BUILD-BRIEF-v2.md   ← the build spec
├── famous_named_duas_v2.csv            ← 50 rows, 13 cols
├── hub_pages_keywords_v2.csv           ← 30 rows, 13 cols
├── chapter_keywords_v2.csv             ← 132 rows, 16 cols
├── DUA-URL-SCHEME.md                   ← already yours, unchanged
└── _archive/                           ← move all 9 v1 files here
    ├── DUA_KEYWORD_STRATEGY.md
    ├── DUA_KEYWORD_STRATEGY (2).md
    ├── CLAUDE_CODE_TOP20_BUILD_BRIEF.md
    ├── CLAUDE_CODE_TOP50_BUILD_BRIEF.md
    ├── famous_named_duas_priority_list.csv
    ├── famous_named_duas_priority_list (1).csv
    ├── famous_named_duas_priority_list.xlsx
    ├── hub_pages_keywords.csv / .xlsx
    └── individual_dua_keywords_by_chapter*.csv / .xlsx
```

**Do not leave the v1 files where a glob can find them.** You currently have a 20-row and a
50-row file both named `famous_named_duas_priority_list*`. A glob picks one at random and you
find out which by counting pages three days later.

---

## Decisions (only D-B is still open)

**D-A — Translation sourcing. RESOLVED, non-blocking.** Ship attributed translations now.
Retranslate the top 50 named duas opportunistically for editorial control. Editorial budget goes
to Block A commentary, not to retranslating the long tail. Nothing here delays Session 0. See
`DUA-SEO-STRATEGY-v2.md` §7.

**D-B — Who owns `ayatul kursi`.** Qur'an Explorer verse page, or `/duas/` page? My
recommendation, encoded in `famous_named_duas_v2.csv`, is the Qur'an page for the six
transliterated verse-name terms and the dua page for everything phrased `dua for X`. If you
disagree, change the `canonical_owner` column before Session 1 and the rest follows automatically.

---

## Plugins: what to use and what to skip

**superpowers — yes, narrowly.** Use it in Session 1 only, for the validator script. Its TDD
and verification discipline is exactly right for "write a script that must fail the build on 11
specific assertions." Also useful in Sessions 6–7 for subagent-parallelised batch page generation
across 300+ Tier C duas. Do not let it run brainstorming skills on the strategy — that work is
done and re-opening it costs you a week.

**andrej-karpathy-skills — skip for this project.** Those skills are about code taste and prose
minimalism. The dua pages need Islamic content accuracy, source citation discipline, and your
brand voice — none of which that plugin knows about, and its prose-style opinions will fight your
`islamicinfo-brand` skill. Adding it here is a net negative.

**What to add instead — a project skill of your own.** Session 2 below builds
`islamicinfo-dua-page` v1.0, encoding the §5 on-page template and the §8 assertions. This is the
highest-leverage addition, because you will reuse it verbatim when you build the Qur'an verse
pages and the Hadith Library pages, which have the same template shape and the same duplication
risks. It follows the pattern you already have with `islamicinfo-brand` v1.0.

---

# The prompts

## Session 0 — Audit and archive

**Attach:** `DUA-SEO-STRATEGY-v2.md`, `CLAUDE-CODE-DUA-BUILD-BRIEF-v2.md`, all three v2 CSVs,
your existing `CLAUDE.md`, `DUA-URL-SCHEME.md`

```
Read docs/seo/DUA-SEO-STRATEGY-v2.md in full. Do not write any page code this session.

1. Move every v1 SEO file listed in the playbook to docs/seo/_archive/. Do not delete — we keep
   the audit trail. Confirm nothing outside _archive/ still matches the glob
   famous_named_duas_priority_list*.

2. Verify the three v2 CSVs parse with Python's csv module and every row's field count equals its
   header's field count: famous_named_duas_v2.csv (13 cols, 50 rows), hub_pages_keywords_v2.csv
   (13 cols, 30 rows), chapter_keywords_v2.csv (16 cols, 132 rows). Report any mismatch and stop.

3. Reconciliation report — this is the real work of this session. For every row in
   famous_named_duas_v2.csv, attempt to locate the matching entry in
   src/data/dua/search-corpus.json (by verseRef for content_type=quran_verse, by chapter label +
   hadithCitation for hadith_dua). Output a table: rank, dua_name, matched (yes/no/ambiguous),
   corpus stableId, corpus chapter slug. Do NOT guess on ambiguous matches — flag them.

4. Report the current state: how many /duas/ pages exist today, how many are in the sitemap, and
   what the current title tag pattern is on the 30 hub pages.

Output all four as a written report. Make no other changes.
```

**What you're checking:** the reconciliation table. If more than a handful of the 50 come back
unmatched or ambiguous, the corpus and the keyword list have drifted and that must be fixed before
anything is built.

---

## Session 1 — Guardrails and decisions

**Attach:** same as Session 0, plus your `DECISIONS-*.md` log

```
Read docs/seo/DUA-SEO-STRATEGY-v2.md §7 and §8.

1. Add `translation_source` and `translation_license` fields to every entry in
   src/data/dua/search-corpus.json. Licence values: original | public-domain | attributed |
   unresolved. Default existing entries to "attributed" and record where the text came from.
   These are audit labels, NOT index blockers. Use surgical str_replace edits.

2. Write scripts/validate-seo.mjs implementing every assertion in DUA-SEO-STRATEGY-v2.md §8,
   Do NOT add any assertion that blocks indexing on translation licence status.
   Each assertion is a separate named check with its own failure message naming the offending
   file(s). Exit non-zero on any failure. Write tests for the validator itself before writing the
   validator — I want to see a failing test for each of the 12 assertions, then the implementation.

3. Wire validate-seo.mjs into the build so it runs before deploy and blocks on failure.

4. Run it against the site as it stands today and give me the full output. I expect failures on
   the existing hub pages — that is the point, Session 3 fixes them.

5. Append these DECISION entries to the append-only log, with the resolutions I give you below:
   D-A  Ship attributed translations now; retranslate top 50 named duas only
   D-B  Canonical owner for transliterated verse-name head terms: [Qur'an section / duas section]
   D-C  Block A + Block B original-content gate before any page enters a sitemap
   D-D  "Benefits"-intent queries answered with sourced fada'il only; unauthenticated popular
        claims explicitly labelled as such. No fatwa language.
```

Replace the D-B bracketed placeholder with your answer before pasting.

---

## Session 2 — Build the reusable page skill

**Attach:** `DUA-SEO-STRATEGY-v2.md`, `SKILL.md` (islamicinfo-brand v1.0),
`ISLAMICINFO_BRAND_IDENTITY.md`

```
Create a project skill at .claude/skills/islamicinfo-dua-page/SKILL.md, v1.0, following the same
structure and conventions as our existing islamicinfo-brand skill.

It must encode:
- The on-page template from DUA-SEO-STRATEGY-v2.md §5 exactly: URL, title (with the three-step
  degradation to stay ≤60), H1 uniqueness rule, meta ≤155, the seven-part body order, the schema
  block (WebPage + BreadcrumbList; explicitly forbid the string "CreationalWork", which was a typo
  in the v1 strategy and is not a real schema.org type).
- The Arabic markup requirement: lang="ar" dir="rtl", real Arabic webfont, transliteration as
  text and never as an image.
- The Block A + Block B content gate from §1, as a checklist the skill runs before
  emitting a page.
- The canonical rule from §3: one head term, one owner; how to read canonical_owner from
  famous_named_duas_v2.csv and emit rel=canonical.
- Our existing governance: 3 fonts only (Cormorant Garamond, Inter, Amiri), no shimmer, no fatwa
  language, no urgency copy, islamicinfo-theme localStorage key, dark mode default.
- A worked example: one complete dua page, using rank 17 (dua for istikhara) from
  famous_named_duas_v2.csv.

Write it so it will also apply, with minimal edits, to Qur'an verse pages and Hadith Library
pages later — those have the same template shape and the same duplication risks.
```

---

## Session 3 — Wave 0: the 30 hub pages

**Attach:** `hub_pages_keywords_v2.csv`, `DUA-SEO-STRATEGY-v2.md`

```
Re-title the 30 existing hub pages from docs/seo/hub_pages_keywords_v2.csv.

- Use the title_tag and meta_description columns verbatim. They are pre-validated ≤60 and ≤155.
- The two rows where index_decision starts with "noindex" (source/dua-dhikr and source/other) get
  <meta name="robots" content="noindex,follow"> and come out of the sitemap. Their duas still
  surface through their occasion hubs.
- Every hub owns its primary_keyword exclusively. Record the 30 owned terms somewhere the
  validator reads, so no individual dua page can later reuse one as its own primary keyword or H1.

Run scripts/validate-seo.mjs. It must pass before commit.
```

---

## Session 4 — Wave 1: famous duas ranks 1–20

**Attach:** `famous_named_duas_v2.csv`, `DUA-SEO-STRATEGY-v2.md`,
`CLAUDE-CODE-DUA-BUILD-BRIEF-v2.md`

Paste the Session 3 block from `CLAUDE-CODE-DUA-BUILD-BRIEF-v2.md` (the one headed "Wave 1").
It is written to be used as-is.

**Then, before you let it commit:** read the "when to recite it" prose on all 20 pages yourself.
That prose is the thing standing between you and a scaled-content-abuse problem, and it is the one
part of this build that cannot be validated by a script. If any of the 20 reads like a
rephrased chapter label, send it back.

**Then stop for 21 days.** Submit `sitemap-duas-wave1.xml`. Watch Search Console. You are looking
for ≥80% indexed and rising impressions. If index rate is below that, Wave 2 does not start —
Sessions 5 onward get replaced with a session that deepens the existing 20.

---

## Session 5 — Wave 2: famous duas ranks 21–50

Same as Session 4, filtered to `build_wave = 2`. Separate sitemap
(`sitemap-duas-wave2.xml`). Same 21-day gate afterwards.

Note ranks 22, 23, 48, 49 (Talbiyah, Day of Arafat, Safa & Marwah, Tawaf) carry Hajj-season
spikes. If you are within eight weeks of Dhul Hijjah when you reach this session, build those four
first inside the wave.

---

## Sessions 6–7 — Waves 3 and 4

**Attach:** `chapter_keywords_v2.csv`, `DUA-SEO-STRATEGY-v2.md`

Wave 3 is tier A and B chapters (~150 duas). Wave 4 is tier C (~305), in blocks of 50 with an
index-rate check per block.

The thing to watch: 9 chapters have `keyword_rule = derive_per_entry_from_translation` and an
empty `primary_keyword`. Those cover 300+ duas, including the 99 Qur'anic supplications. Claude
Code must derive a keyword per dua from that dua's own English text and must never fall back to
the chapter label. The validator's "no two pages share a primary_keyword" assertion is what
catches it if it drifts — which is why Session 1 comes before any of this.

Six chapters carry a non-empty `cannibalization_flag`. Those need your call before their chapter
page is built.

---

## What "done" looks like

- 30 hub pages, correct titles, 28 indexed and 2 noindexed
- 50 famous dua pages with hand-reviewed original context prose
- ~455 remaining dua pages, each with a distinct primary keyword and H1
- One validator that fails the build on any regression
- One `islamicinfo-dua-page` skill you reuse for the Qur'an and Hadith sections
- A DECISIONS log entry for every judgement call above

The Qur'an and Hadith SEO work is the same shape. Do not start it until `/duas/` Wave 1 has
21 days of Search Console data — that data tells you whether this template earns indexation on
your domain, and it is cheaper to learn that on 20 pages than on 1,500.
