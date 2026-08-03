# Claude Code build brief — `/duas/` section — v2.0

**Replaces `CLAUDE_CODE_TOP20_BUILD_BRIEF.md` and `CLAUDE_CODE_TOP50_BUILD_BRIEF.md`.**
Those two contradict each other (the "TOP50" file's prompt body still says "build these 20 pages
first" and its closing section is still headed "Why these 20 first"). Archive both before
running this.

---

## Paste into Claude Code — Session 1: setup and guardrails

```
Read docs/seo/DUA-SEO-STRATEGY-v2.md in full before writing any code. Then do ONLY this session's
work — do not start generating dua pages yet.

1. Move these to docs/seo/_archive/ (do not delete, we keep the audit trail):
   DUA_KEYWORD_STRATEGY.md, DUA_KEYWORD_STRATEGY (2).md,
   CLAUDE_CODE_TOP20_BUILD_BRIEF.md, CLAUDE_CODE_TOP50_BUILD_BRIEF.md,
   famous_named_duas_priority_list.csv, individual_dua_keywords_by_chapter.csv,
   hub_pages_keywords.csv
   The v1 CSVs are malformed (unquoted commas cause column shift on 14/30 hub rows and 19/50
   famous rows) — nothing may read from them.

2. Confirm the v2 CSVs parse cleanly with Python's csv module at their declared column counts:
   docs/seo/famous_named_duas_v2.csv     (13 cols, 50 rows)
   docs/seo/hub_pages_keywords_v2.csv    (13 cols, 30 rows)
   docs/seo/chapter_keywords_v2.csv      (16 cols, 132 rows)
   Fail loudly if any row's field count != header field count.

3. Write scripts/validate-seo.mjs implementing every assertion in DUA-SEO-STRATEGY-v2.md §8.
   It must exit non-zero on any failure and must run in CI before deploy.

4. Add `translation_source` and `translation_license` fields to the dua corpus schema in
   src/data/dua/search-corpus.json (licence values: original | public-domain | attributed |
   unresolved). Default existing entries to "attributed" and record the source they came from.
   These are LABELS for auditability, not index blockers — do NOT make the validator refuse to
   index on licence status. See DUA-SEO-STRATEGY-v2.md §7.

5. Append DECISION entries to the append-only DECISION/ADR log for:
   D-xxx  Qur'an section owns transliterated verse-name head terms; /duas/ twins use rel=canonical
   D-xxx  Block A + Block B original-content gate required before any page enters a sitemap (§1)
   D-xxx  Ship attributed translations now; retranslate top 50 named duas only (§7)
   D-xxx  "Benefits" queries answered with sourced fada'il only, unauthenticated claims labelled

Report back with the validator's output on the current site. Do not proceed to Session 2 until
Milan approves the DECISION entries.
```

---

## Paste into Claude Code — Session 2: Wave 0 (hub pages)

```
Re-title the 30 existing hub pages from docs/seo/hub_pages_keywords_v2.csv.

- Use the title_tag and meta_description columns verbatim. They are pre-validated ≤60 and ≤155.
- Rows where index_decision starts with "noindex" (source/dua-dhikr and source/other) must get
  <meta name="robots" content="noindex,follow"> and must be removed from the sitemap. Their duas
  still surface through their occasion hubs.
- Every hub page owns its head term exclusively. No individual dua page may use a hub's exact
  primary_keyword as its own primary keyword or H1.

Run scripts/validate-seo.mjs. It must pass before commit.
```

---

## Paste into Claude Code — Session 3: Wave 1 (famous duas 1–20)

```
Build the 20 individual dua pages where build_wave = 1 in docs/seo/famous_named_duas_v2.csv,
in rank order.

For each row:
  - Find the corpus entry in src/data/dua/search-corpus.json: match by verseRef for
    content_type = quran_verse, or by chapter label + hadithCitation for hadith_dua.
    If no confident match, STOP and report the row rather than guessing.
  - Generate the slug per Format D in docs/seo/DUA-URL-SCHEME.md §3.3.
  - Use title_tag and meta_description from the CSV verbatim.
  - H1 = primary_keyword in natural language, unique site-wide.
  - Body order per DUA-SEO-STRATEGY-v2.md §5.
  - Arabic block MUST have lang="ar" dir="rtl".
  - Schema: WebPage + BreadcrumbList. NOT "CreationalWork" — that type does not exist in
    schema.org and v1 of the strategy contained that typo.

CANONICAL RULE (DUA-SEO-STRATEGY-v2.md §3): for the 6 rows where canonical_owner = "quran",
the Qur'an Explorer verse page owns the head term. The /duas/ page must emit
<link rel="canonical" href="{quran verse page URL}"> and must NOT use the transliterated verse
name as its H1. Rows where canonical_owner = "duas" own their term outright.

CONTENT GATE: each of these 20 pages needs all of Block A plus at least one Block B component
from DUA-SEO-STRATEGY-v2.md §1. Write the "when to recite it" prose yourself, 80-150 words, specific
to that dua — do not paraphrase the chapter label. Any page that cannot meet the gate ships as
noindex,follow and is excluded from sitemap-duas-wave1.xml.

Generate sitemap-duas-wave1.xml containing only the pages that passed the gate.
Run scripts/validate-seo.mjs. Do not start Wave 2 for 21 days — we need Search Console index-rate
data on Wave 1 first.
```

---

## Waves 2–4

Same pattern. Wave 2 = `build_wave` 2 in the famous list (ranks 21–50). Wave 3 = individual duas
in chapters where `tier` is A or B in `chapter_keywords_v2.csv`. Wave 4 = tier C, in blocks of 50.

**For any chapter where `keyword_rule` = `derive_per_entry_from_translation`** (the 9 mega-chapters,
covering 300+ duas), `primary_keyword` is deliberately empty. Claude Code must derive a keyword per
dua from that dua's own English text — first 4–6 meaningful words, stopwords stripped, cross-checked
against the famous-dua table and against every keyword already assigned. It must never fall back to
the chapter label. The validator's "no two pages share a primary_keyword" assertion is what catches
this if it drifts.

**Rows with a non-empty `cannibalization_flag`** need Milan's decision before their chapter page is
built. Six chapters currently target a head term already owned by a famous-dua page or a hub.
