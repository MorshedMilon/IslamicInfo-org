# ADDENDUM — IslamicInfo.org Dua Detail Page Engine
# Sections 13–22
# Status: PROPOSED — append after Section 12 of MASTER SPEC
# All Section 1 non-negotiable rules (locked design system, content authenticity,
# no fabrication, build safety) apply unchanged to everything below.

--------------------------------------------------
13. ALTERNATE NAMES AND TRANSLITERATION VARIANTS
--------------------------------------------------

Islamic content has extreme transliteration variance in real search queries.
A single dua may be searched as "Ayat al-Kursi", "Ayatul Kursi", "Ayat ul Kursi",
"Ayatul Kursy", or "Aytul kursi". Serving only one spelling loses a large share of
qualifying traffic. This is a data problem, not a copywriting problem.

Add to the data model:

src/data/dua/alternate-names.json

{
  "{frozen-slug}": {
    "primaryName": "Ayat al-Kursi",
    "alternateNames": ["Ayatul Kursi", "Ayat ul Kursi", "Ayatul Kursy"],
    "arabicName": "آية الكرسي",
    "openingWords": "Allahu la ilaha illa huwa",
    "verified": true
  }
}

Rules:
- alternateNames must be genuine romanisation variants of the SAME dua.
  Never add unrelated keywords, English descriptors, or invented titles.
- Never create an alternate name for a dua that has no established popular name.
  Most of the 506 entries will have NO alternate names. That is expected and correct.
- Populate this file manually or from verified reference works. Do not AI-generate it.
- Variants must be rendered naturally in visible content, not stuffed:
  acceptable pattern is a single factual sentence in the lede,
  e.g. "Also written as Ayatul Kursi or Ayat ul Kursi."
- Never repeat variants in H1, title, meta description, and body simultaneously.
- openingWords supports the common query pattern where users search the first
  transliterated words rather than the dua's name. Render it once in the lede
  when present and verified.

Schema mapping:
- Emit alternateNames as schema.org `alternateName` (array permitted).
- Emit arabicName as `name` on an Arabic-language node where appropriate.

Validation gate:
[ ] no alternate name duplicates another dua's primaryName
[ ] no alternate name appears on more than one frozen slug
[ ] alternateNames omitted entirely when the array is empty (no empty markup)

--------------------------------------------------
14. KEYWORD AND SEARCH-INTENT MAP
--------------------------------------------------

The current title formula derives from catalog labels (chapterLabel, occasionLabel).
Catalog labels are not query labels. At 506 pages this will produce cannibalisation
between structurally similar occasions and will mistarget high-intent pages.

Create a manually maintained file:

src/data/dua/keyword-map.json

{
  "{frozen-slug}": {
    "primaryQuery": "dua for travelling",
    "secondaryQueries": ["travel dua", "safar ki dua", "dua before journey"],
    "intent": "informational | navigational | practical",
    "titleOverride": null,
    "descriptionOverride": null,
    "targetingConfidence": "researched | inferred | none",
    "reviewedOn": "2026-07-31"
  }
}

Rules:
- The builder uses titleOverride/descriptionOverride when present, otherwise
  falls back to the Section 5 default formulas. Overrides are the exception.
- targetingConfidence must default to "none". Only set "researched" when real
  keyword data exists. Never guess and label it researched.
- primaryQuery must be unique across the corpus. Two frozen slugs may not target
  the same primaryQuery. If they do, that is a consolidation signal — see Section 15.
- Do not add secondaryQueries to page copy. They inform targeting only. Body prose
  remains governed by Section 8 authoring rules.
- Never write a query into visible content if the dua's verified data does not
  actually support that use case.

Cannibalisation gate (must run before every batch):
[ ] no duplicate primaryQuery across frozen slugs
[ ] no title tag byte-identical to another page
[ ] no meta description byte-identical to another page
[ ] flag any two pages whose primaryQuery differs only by stopwords

--------------------------------------------------
15. NEAR-DUPLICATE DETECTION AND CONSOLIDATION POLICY
--------------------------------------------------

The corpus will contain genuine duplication. Hisn al-Muslim entries frequently
reproduce narrations already present in Sahih al-Bukhari, Sahih Muslim, and the
Sunan collections. Publishing the same Arabic text and the same translation on
three URLs is the most likely cause of sitewide quality suppression in a build
of this size.

Section 8 requires "different, text-supported angles" but sets no threshold and
no decision path. Add both.

A. MEASUREMENT
- Compute 5-gram Jaccard similarity across:
  (a) arabicText normalised (diacritics stripped, whitespace collapsed)
  (b) translation normalised (lowercased, punctuation stripped)
  (c) full rendered body prose
- Store all three scores per pair in the QA output.

B. THRESHOLDS AND ACTIONS

Arabic similarity >= 0.95 AND translation similarity >= 0.90:
  → SAME DUA. Do not publish both.
    Select one canonical frozen slug (prefer the most complete source mapping).
    Emit the other as a 301 redirect entry in redirects.json.
    Do NOT cross-canonical two live pages as a substitute for consolidation
    unless both must remain reachable for navigational reasons.

Arabic similarity 0.80–0.95:
  → VARIANT NARRATION. Both may publish, but each page MUST visibly state the
    distinction using verified source data only, e.g. differing source, differing
    wording, differing reported occasion. If no verified distinction exists,
    flag needs-review and hold from the batch.

Body prose similarity >= 0.70 between any two pages:
  → BOILERPLATE FAILURE. Reject the batch. This indicates the authoring step is
    producing template prose, which Section 1(C) forbids.

C. REDIRECT REGISTRY
Create src/data/dua/redirects.json:

{
  "{retired-slug}": {
    "target": "{canonical-slug}",
    "status": 301,
    "reason": "duplicate-narration",
    "approvedOn": "2026-07-31"
  }
}

Rules:
- Retired slugs stay in slugs.lock.json permanently. Never delete a frozen slug.
- Retired slugs are excluded from the sitemap.
- Retired slugs must never appear in Related Duas.
- Redirects require explicit approval before commit, per Section 1(D).

--------------------------------------------------
16. INDEXABILITY GATE
--------------------------------------------------

Section 9 currently allows a page failing quality checks to be published and
indexed provided identity fields exist. At 506 pages, a meaningful proportion of
thin pages entering the index will drag the whole directory.

Add an explicit, data-driven index decision. Do not hard-code it in the template.

Field in page-copy.json:

"indexable": true | false,
"indexReason": "passed | short-source-unreviewed | no-source-mapping | duplicate-pending-review | held-for-editorial"

Builder behaviour:
- indexable true  → no robots meta restriction; include in sitemap.
- indexable false → emit <meta name="robots" content="noindex,follow">;
                    EXCLUDE from sitemap; keep internal links intact so the page
                    remains crawlable and can pass through to hub pages.

Default policy (override by explicit approval only):
- contentBasis "translation-only" AND reviewStatus "generated" AND word count
  below the short-source threshold → indexable false until reviewed.
- Source mapping unavailable → still indexable if translation and Arabic are
  verified. Missing source is a transparency issue, not a thinness issue.

Rules:
- noindex is a staging state, not a permanent one. Every noindexed page must
  appear in content-review-report with a named next action.
- Never noindex a page merely because it is short. Short duas are legitimate.
  Noindex only when short AND unreviewed AND lacking distinct prose.
- Do not use nofollow on internal links. Ever.

--------------------------------------------------
17. INTERNAL LINK ARCHITECTURE AND HUB PAGES
--------------------------------------------------

Four to five related links per detail page is insufficient crawl structure for
506 URLs. Detail pages must not be the only node type.

Required hub layer (reuse existing components only; if a hub layout does not
exist, STOP and ask before building one):

/duas/                            — root index
/duas/occasion/{occasionSlug}.html
/duas/source/{sourceSlug}.html
/duas/category/{categorySlug}.html

Requirements:
- Every dua detail page must be reachable within 3 clicks of the site root.
- Every dua must be linked from at least ONE hub page. Zero orphans permitted.
- Hub pages list every child dua with descriptive anchor text derived from
  chapterLabel. No "click here", no truncated anchors.
- Hub pagination, if needed, must use real crawlable <a href> elements.
  Never JavaScript-only pagination. Never infinite scroll without paginated URLs.
- Hub pages carry their own unique title, meta description, and BreadcrumbList.
- Hub pages must contain a short, factual, unique introduction. Do not generate
  a shared paragraph across hubs — that reproduces the doorway pattern Section
  1(C) forbids.
- Hubs with fewer than 3 child duas should not be generated. Fold those duas into
  a parent hub instead of creating a near-empty index page.

Related Duas selection (refining Section 4):
- Prefer: same occasionSlug → same categorySlug → same sourceSlug → same chapter.
- Enforce link reciprocity where sensible so no page becomes a sink.
- Cap inbound related-links per target at roughly 15 to avoid a small set of
  pages absorbing the entire internal link graph.
- Never link to a page where indexable is false.

Validation gate:
[ ] orphan count = 0
[ ] maximum crawl depth from root <= 3
[ ] every hub page linked from /duas/
[ ] no related link points to a noindexed or retired slug

--------------------------------------------------
18. LANGUAGE ANNOTATION AND ARABIC RENDERING
--------------------------------------------------

Correct language annotation is both an accessibility requirement and a signal
Google uses to interpret mixed-script pages. It is currently unspecified.

Required:
- <html lang="en"> on all pages (pages are English-language pages containing
  Arabic quotations, not Arabic-language pages).
- Arabic blocks: lang="ar" dir="rtl" on the existing Arabic element.
  Use only existing classes — this adds attributes, not styling.
- Transliteration blocks: lang="ar-Latn".
- Do not set dir="rtl" on any container beyond the Arabic text element itself.

Schema:
- inLanguage: "en" on the Article node.
- Where the dua text is modelled separately, inLanguage "ar" on that node.

Do NOT add hreflang unless translated versions of these pages actually exist.
Self-referencing hreflang on a monolingual site adds risk and no benefit.
If Urdu/Indonesian/Turkish versions are built later, add hreflang as a
bidirectional cluster with x-default, and only when every counterpart URL is live.

--------------------------------------------------
19. FONT LOADING AND CORE WEB VITALS
--------------------------------------------------

Arabic webfonts (Amiri, Uthmani-style faces) are the most likely performance and
layout-stability problem on this page type. These are constraints on delivery,
not changes to the locked design system — no font, size, weight, colour, or
spacing may change.

Required:
- font-display: swap (or optional) on all webfaces.
- Preload only the fonts used above the fold. Do not preload every weight.
- Subset Latin faces to the Latin range. Subset Arabic faces to the ranges
  actually used by the corpus. Ship WOFF2 only.
- Declare size-adjust / ascent-override on fallback faces where needed to prevent
  layout shift on font swap. Verify CLS < 0.1 on a representative dua page.
- Self-host fonts. No third-party font CDN request on the critical path.

Also required:
- Zero render-blocking JavaScript on detail pages. These are static documents.
- Inline critical CSS only if the existing build already supports it. If not,
  do not introduce it — ask first.
- width=device-width viewport meta present.
- Verify no horizontal overflow at 320px, with long Arabic strings and long
  transliterations both present. This is already in Section 9; add 320px
  explicitly as the test width.

Measure LCP, CLS, INP on:
- one long dua page
- one short-source page
- one hub page with the maximum child count

--------------------------------------------------
20. STRUCTURED DATA EXTENSIONS
--------------------------------------------------

Additions to Section 6. All Section 6 rules still apply: match visible content
exactly, absolute URLs, valid JSON, remove anything that cannot be truthful.

A. TRANSLATION RELATIONSHIP
Where the Arabic text and its English translation are both present, the
schema.org pair `translationOfWork` / `workTranslation` models this accurately
and is more honest than describing the page as original authored content.
Use only if it can be emitted cleanly alongside the required Article node.

B. ORGANIZATION AND ENTITY LINKING
- Emit a single Organization node (site-level) with name, url, and logo,
  only if approved logo data exists per Section 6(B).
- sameAs is permitted ONLY for accounts the project actually controls.
  Never add sameAs links to Wikipedia or Wikidata entries for hadith
  collections as though they were the publisher's identifiers.
- citation may reference the source collection where sourceLabel is verified.

C. ROBOTS META
On indexable pages emit:
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">

D. WHAT NOT TO ADD
- No speakable schema. It requires editorial suitability the corpus does not have.
- No aggregateRating, no Review. There is nothing being rated.
- No HowTo. A dua is not a procedure, and marking it as one misrepresents it.
- No Person/author node until a real documented reviewer exists, per Section 7.

E. VALIDATION
- Extend the existing JSON validity test to a schema-shape test: required
  properties present, all URLs absolute and resolving, no null or empty values
  emitted, no property whose value does not appear in the rendered HTML.

--------------------------------------------------
21. FEATURED SNIPPET AND LEDE FORMAT
--------------------------------------------------

The lede in Section 4 (item 3) is the highest-leverage element on the page for
"dua for {occasion}" queries, which are strongly snippet-driven. Specify its shape.

The lede must:
- Be the first paragraph after H1, before any card or Arabic block.
- Run approximately 40–55 words in 1–2 sentences.
- Directly answer the implied question in plain declarative English.
- Contain: what the dua is for, its source when mapped, and whether Arabic,
  transliteration, and English are provided on the page.
- Be assembled from verified fields only. It is a factual summary, not prose.

Recommended construction:
"{chapterLabel} is a dua recorded in {sourceLabel} for {occasionLabel}. This page
provides the Arabic text{, transliteration}, and English translation with the
source reference."

If source is unmapped:
"{chapterLabel} is a dua listed for {occasionLabel}. This page provides the
Arabic text{, transliteration}, and English translation."

Rules:
- The lede must NOT duplicate the meta description verbatim.
- The lede must NOT be identical across pages sharing an occasion — the
  chapterLabel and source substitutions must produce genuine variation. If they
  do not, that pair is a consolidation candidate under Section 15.
- Never open with "This beautiful dua", "In Islam,", or any devotional flourish.
  Section 8's stock-phrase ban applies here in full.

--------------------------------------------------
22. LAUNCH SEQUENCING AND MEASUREMENT
--------------------------------------------------

Publishing 506 near-simultaneous pages from a directory with limited history is
itself a quality risk, independent of page quality.

A. STAGED PUBLICATION
- Publish in approved batches per Section 12, but also cap live publication rate.
  Recommended: no more than 40–60 new indexable URLs per week.
- Sequence priority-pages.json entries FIRST, then breadth. High-quality,
  well-sourced pages establish the directory's pattern before the long tail.
- Hub pages ship BEFORE their child detail pages, never after.

B. SITEMAP
- Sitemap index at /sitemap.xml referencing child sitemaps.
- Separate child sitemaps for detail pages and hub pages.
- Maximum 50,000 URLs and 50MB uncompressed per child sitemap.
- lastmod must reflect genuine content modification, not build time. A rebuild
  that changes nothing must not bump lastmod. This is a build-determinism
  requirement as much as an SEO one.
- Excluded from sitemap: noindexed pages, retired slugs, redirect sources.
- robots.txt must reference the sitemap index.

C. KILL SWITCH
Monitor Search Console coverage weekly during rollout. Halt publication and
return to editorial review if any of the following occur:
- "Crawled — currently not indexed" exceeds 20% of submitted dua URLs after
  four weeks.
- "Duplicate without user-selected canonical" appears on any dua URL.
- Indexed count plateaus while submitted count continues rising.

Do not respond to these by publishing more pages.

D. ECOSYSTEM CANNIBALISATION CHECK
Before launch, confirm that dua content on other properties in the ecosystem
(QuranlyAI.com in particular) does not reproduce the same Arabic text and
translation at a different domain. Cross-domain duplication of identical
source text is materially harder to recover from than internal duplication.
Where overlap exists, decide the owning property BEFORE either version is
indexed, and cross-link rather than duplicate.

E. REPORTING
Extend the Section 9 reports with:

5. internal-link-report.json/csv:
   slug, inbound internal links, outbound internal links, crawl depth from root,
   orphan flag, hub membership.
6. index-decision-report.json/csv:
   slug, indexable, indexReason, in-sitemap, robots meta emitted, next action.
7. duplication-report.json/csv:
   slug pair, arabic similarity, translation similarity, body similarity,
   threshold band, action taken, approval status.

--------------------------------------------------
OPEN QUESTIONS REQUIRING DECISION BEFORE IMPLEMENTATION
--------------------------------------------------

1. Does a hub page layout already exist in the locked design system, or does
   Section 17 require new UI approval under Section 1(A)?
2. Is the .html extension in the canonical route fixed by hosting constraints?
   It is not an SEO problem, but the decision should be recorded in the ADR log
   since it is now frozen across 506 URLs.
3. Who owns dua content across the ecosystem — IslamicInfo.org or QuranlyAI.com?
   Section 22(D) cannot be resolved at the engine level.
4. Is there budget/approval for verified audio recitation? Audio is a strong
   intent match for this content type but every file must be licensed and
   attributed, and it is out of scope for this engine as written.
