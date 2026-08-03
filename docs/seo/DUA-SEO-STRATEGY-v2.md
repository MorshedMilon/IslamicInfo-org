# Dua / Qur'an / Hadith SEO Strategy — IslamicInfo.org — v2.0

Supersedes: `DUA_KEYWORD_STRATEGY.md`, `DUA_KEYWORD_STRATEGY (2).md`,
`CLAUDE_CODE_TOP20_BUILD_BRIEF.md`, `CLAUDE_CODE_TOP50_BUILD_BRIEF.md`.
Those four files must be deleted or moved to `docs/seo/_archive/` before Claude Code runs, or it
will follow contradictory instructions.

Accompanying data files (all regenerated, all RFC-4180 valid):
`famous_named_duas_v2.csv`, `hub_pages_keywords_v2.csv`, `chapter_keywords_v2.csv`.

---

## 0. What changed from v1 and why

| # | v1 said | Status | v2 says |
| --- | --- | --- | --- |
| 1 | Title template `{KW} – Arabic, Transliteration & English Meaning \| IslamicInfo`, keep under 60 chars | **Impossible** | The suffix alone is 57 chars. New template with graceful degradation, hard-validated ≤60. |
| 2 | 3 CSVs ready for Claude Code | **Broken** | 14/30 hub rows, 19/50 famous rows had unquoted commas causing column shift. Regenerated with proper quoting. |
| 3 | "Watch for keyword cannibalization" | **Self-contradicted** | v1's own CSVs contained 7 exact-duplicate head terms across files. Now flagged and resolved. |
| 4 | `priority_tier` column to sort the build by | **Not machine-readable** | 17 distinct free-text values. Split into `tier` (A/B/C) + `tier_reason`. |
| 5 | Keyword = chapter label with "dua for" prefixed | **~56 broken** | e.g. "dua for you are afraid to go to sleep or feel lonely and depressed". Hand-corrected. |
| 6 | Build 505 pages fast, Tier A→B→C | **Highest-risk item** | Google scaled-content-abuse exposure. New §2 indexing gate. |
| 7 | Schema: `Article/CreationalWork` | **Invalid type** | `CreationalWork` does not exist in schema.org. Corrected in §5. |
| 8 | (not mentioned) | **Missing** | Qur'an ↔ Dua ↔ Hadith internal duplication. New §3. |
| 9 | (not mentioned) | **Missing** | Translation sourcing. New §7 — non-blocking; retranslate the top 50 only. |
| 10 | (not mentioned) | **Missing** | E-E-A-T / reviewer attribution for religious content. New §6. |

**What v1 got right and should be kept:** every one of the 50 Qur'an verse references in the
famous-dua list is correct (2:255, 2:201, 2:286, 21:87, 20:25-28, 20:114, 25:74, 37:100, 3:38,
28:24, 2:250, 3:173, 71:28, 60:5, 27:19, 17:24, 14:35, 2:127, 21:83, 11:47, 7:23, 12:101, 3:8,
3:147, 66:8, 3:194 — all verified). The core insight in its §2 — that chapter size is unrelated
to search volume, so a 1-dua chapter like Istikharah still deserves an early, deep page — is
correct and is the single most useful thing in the whole deliverable. The occasion/source hub
split and the "≥3 duas gets a chapter page" rule are sound. Keep all of that.

---

## 1. The real bottleneck is not keywords

You have 506 corpus entries. Competitors (Sunnah.com, IslamicFinder, MyIslam, Duas.org) already
publish the same Arabic text, the same transliteration, and often the same English translation.
If your 506 pages contain only `Arabic + transliteration + translation + citation`, they are —
by Google's own definition — unoriginal content republished at scale, and the fact that a human
approved the template does not change that.

Google's scaled content abuse policy targets <cite index="8-1">large amounts of unoriginal
content that provides little to no value to users, regardless of how it was created</cite>, and
explicitly includes <cite index="8-1">stitching or combining content from different web pages
without adding value</cite>. Enforcement has been the most aggressively policed spam category
since 2024, with <cite index="10-1">the March 2026 spam update representing stronger enforcement
of the existing rules rather than a new policy</cite>. The pattern that gets hit hardest is
<cite index="10-1">template-with-variable-substitution: pages where only a few variables change
between them</cite>.

That is exactly the shape of a 505-page templated dua build. **This is the risk Perplexity's
strategy does not mention once, and it is the one that can cost you the whole `/duas/` section.**

### The fix: a unique-value gate, not a slower build

The differentiator is **not** the translation. Scripture sites all quote the same text and rank
fine — duplicate quoted passages inside a differentiated page are normal and expected. Rewriting
one to three sentences on a page that is otherwise identical to myislam.org changes roughly 5% of
it. The other 95% is the lever.

**Block A — mandatory on every indexed page.** Original commentary, written for that specific dua:

- **"When and why to recite it"** — 80–150 words, situational, specific to this dua. Not a
  rephrasing of the chapter label. This is the single component that decides whether the page is
  differentiated or not.
- **Authentication note** — grade, who graded it, which other collections carry it.

**Block B — at least one of these, in addition:**

- Audio recitation, reciter named
- Word-by-word breakdown or a short grammar/vocabulary note
- Common-mistake note — the mispronunciation or misattribution people actually make
- FAQ block answering 2–4 real long-tail queries from the keyword map for this dua
- Sourced fadā'il where authentic narrations exist, with unauthenticated popular claims
  explicitly labelled as such (see D-D)

**Own English rendering is not on either list.** It is worth doing for the top 50 named duas —
those are the pages anyone would notice and where you want full editorial control anyway — but it
is an editorial-control decision, not a ranking one, and it must not gate the build. See §7.

Pages missing Block A or Block B go out as `noindex, follow`. They still exist, still pass
internal links, still serve users arriving from a hub — they just are not submitted for indexing
until they earn it. This costs nothing in traffic (thin pages were never going to rank) and
removes the site-wide risk.

**Note on the two mechanisms, because they get conflated.** *Duplicate content* is not a penalty;
Google picks one URL to represent a near-duplicate cluster and filters the rest. *Scaled content
abuse* is a separate spam policy with manual actions attached. A 505-page templated build is
exposed to the second, not the first. Both are fixed by original per-page commentary, so the
prescription is the same — but "duplicate content isn't a penalty" does not mean "mass templated
pages are fine."

---

## 2. Revised build sequence

| Wave | Scope | Pages | Gate before next wave |
| --- | --- | ---: | --- |
| **0** | Fix the 30 hub pages (they already exist — re-title from `hub_pages_keywords_v2.csv`) | 30 | Ship |
| **1** | Famous named duas ranks 1–20, full unique-value treatment, hand-reviewed | 20 | Wait 21 days. Confirm in Search Console: ≥80% indexed, impressions rising. |
| **2** | Famous named duas ranks 21–50 | 30 | Wait 21 days, same check. |
| **3** | Tier A + Tier B chapters' individual duas | ~150 | Wait 30 days. If index rate drops below 70%, stop and improve depth. |
| **4** | Tier C long-tail | ~305 | Batch in blocks of 50, monitoring index rate per block. |

If index rate falls between waves, that is Google telling you the pages are not worth indexing —
respond by deepening content, never by publishing more.

---

## 3. Qur'an ↔ Dua ↔ Hadith duplication (the gap in v1)

26 of the 50 "famous duas" are Qur'an verses. Your Qur'an Explorer will also have a page for
2:255. Perplexity's plan therefore ships **two IslamicInfo URLs competing for "ayatul kursi."**
Same problem on the hadith side: a dua sourced from Bukhari will appear on the Hadith Library
page for that hadith and on the `/duas/` page.

**Rule — one head term, one owner.** Recorded per-row in `canonical_owner` in
`famous_named_duas_v2.csv`:

- **Transliterated verse-name queries** (`ayatul kursi`, `rabbi zidni ilma`, `hasbunallahu wa
  ni'mal wakeel`, `rabbana atina`, `rabbana la tu'akhidhna`, `rabbi ishrah li sadri`) →
  **Qur'an section owns it.** Intent is verse + recitation + tafsir. The `/duas/` entry gets
  `rel=canonical` to the verse page.
- **`dua for X` queries** (`dua for istikhara`, `dua for travelling`, `dua for parents
  forgiveness`) → **Dua section owns it.** Intent is situational. The Qur'an/Hadith page links
  across but does not target the phrase.
- **Never** let two of your own pages carry the same H1 or the same primary keyword. Enforce with
  a build-time check (§8).

The Hadith Library page and the Dua page for the same hadith are genuinely different intents
(scholarly lookup vs. practical recitation) so both may index — but their title tags and H1s must
be visibly different, and each must link to the other.

---

## 4. Keyword corrections

`chapter_keywords_v2.csv` rewrites 56 of 132 chapter keywords. The failure mode in v1 was
mechanically prefixing "dua for" onto a hadith book's internal chapter heading, producing strings
nobody types into Google:

| v1 keyword | v2 keyword |
| --- | --- |
| dua for you are afraid to go to sleep or feel lonely and depressed | dua for fear and loneliness at night |
| dua for chapters on supplication | *(none — derive per entry)* |
| dua for ruki | dua for ruku |
| dua for vocation for someone who says: may allah forgive you | reply to may allah forgive you |
| dua for the setting of a debt | dua for debt relief |
| dua for allahs protection from the false messiah | dua for protection from dajjal |
| dua for announcement of his arrival for hajj or umrah | talbiyah |
| dua for what to do if you have a bad dream or nightmare | dua for bad dreams |

Nine chapters (the seven mega-chapters plus `invocations-kitab-al-daawat` and
`the-book-on-al-witr-kitab-al-witr`) get **no chapter-level keyword at all** — `keyword_rule` is
`derive_per_entry_from_translation`. Those 300+ duas each need their own keyword derived from
their own text or matched against the famous-dua table. Perplexity flagged this correctly; v2
enforces it by leaving the field empty so a build script cannot silently reuse it.

Six cannibalization collisions are flagged in the `cannibalization_flag` column.

---

## 5. Corrected on-page template

```
URL:        /duas/{chapter-words}-{stable-id}.html   (Format D — unchanged)

Title:      {Primary keyword} – Arabic, Transliteration & Meaning       ≤60 chars
            degrade to  "{KW} – Arabic & English Meaning"  then  "{KW}"  if it overflows
            Drop "| IslamicInfo" on individual dua pages — it costs 14 chars and adds nothing
            on long-tail. Keep it on the 30 hub pages only.

H1:         Primary keyword, natural language. MUST differ from every other H1 on the site.

Meta:       {KW} in Arabic with transliteration and English translation, with the source
            reference from {collection} and when to recite it.          ≤155 chars

Body order: 1. Arabic  <div lang="ar" dir="rtl">  — required, and use a real Arabic webfont
            2. Transliteration  (this is what people actually search — mark it up as text,
               never as an image)
            3. English meaning
            4. Source citation + grade + grader
            5. "When to recite it" — ORIGINAL prose, 80-150 words, unique per dua
            6. Unique-value block (audio / word-by-word / common mistake) — see §1
            7. Related duas: occasion hub + source hub + 2-3 same-occasion duas

Schema:     WebPage  (NOT "CreationalWork" — that type does not exist)
            + BreadcrumbList
            Do NOT emit FAQPage. Google deprecated FAQ rich results for most sites in 2023
            (they now show only for authoritative government and health sources). Write the FAQ
            block as visible content — it answers real long-tail queries — but skip the schema.
            Do NOT emit Article schema on a page that is primarily a reproduced text.
            Do NOT emit aggregateRating, ReviewAction, or anything implying endorsement.

Never:      no "benefits of reciting X 100 times" claims without an authenticated source
            no fatwa language, no urgency copy, no shimmer  (per CLAUDE.md governance)
```

**Governance conflict to resolve before building:** v1 lists `ayatul kursi benefits` and
`ayatul kursi pdf` as secondary keywords. "Benefits" queries pull toward unauthenticated fadā'il
claims, which collides directly with your no-fatwa-language rule. Recommendation: target the
query, but answer it with *sourced* virtues only (Bukhari/Muslim narrations, cited), and state
plainly where popular claims are unauthenticated. That is both compliant with your governance
*and* better content than the competitors ranking for it today. Log as a DECISION entry.

---

## 6. E-E-A-T — missing entirely from v1

Religious guidance is treated as a high-stakes topic by quality raters. A 505-page section with
no named human behind it is a weak signal. Minimum viable:

- A named reviewer or reviewing body on every dua page, with a real `/about/editorial-policy`
  page describing the authentication process.
- `dateModified` in schema and visible on-page.
- A "Sources & methodology" page: which corpus, which translation, which grading authority, how
  disputes are handled.
- An organisational `About` with real contact details.

This is cheap, it is a one-time build, and it is the difference between "another dua scraper" and
a site Google can justify ranking.

---

## 7. Translation sourcing — not a blocker

The English translation of Hisn al-Muslim that circulates online is the Darussalam edition, and it
is copyrighted. The same applies to the Darussalam-lineage hadith translations (Muhsin Khan for
Bukhari, Siddiqui for Muslim, Ahmad Hasan for Abu Dawud, and the USC-MSA-derived Tirmidhi /
an-Nasa'i / Ibn Majah texts) — roughly 247 of your 505 duas.

**This does not block anything.** Non-commercial use is not an exemption in law, but the practical
risk is low: every site in this niche does the same, enforcement is essentially nonexistent, and
the realistic worst case is a DMCA notice you resolve by swapping the affected text. That is an
afternoon, not a catastrophe.

**Policy:**

- **Ship now** with existing translations, clearly attributed on-page. Do not delay any wave.
- **Retranslate opportunistically** — the top 50 named duas only. Those are your highest-value
  pages, the ones anyone would actually notice, and the ones where you want editorial control
  regardless. That covers the real exposure at roughly a quarter of the effort. The long tail
  stays attributed.
- **Editorial budget goes to Block A commentary (§1), not to retranslating 187 short passages.**
  Same cost, several times the ranking effect.
- Record per-entry translation source and licence status in the corpus so a swap is a data edit,
  not an archaeology project. `unresolved` is a label, **not** an index blocker.

**Qur'an translations — the one place to be careful.** Pickthall (d. 1936) and Yusuf Ali
(d. 1953, original editions only, not the King Fahd revision) are public domain in life+70
jurisdictions. **Do not use Shakir** — its status is contested and there are longstanding claims
it is an unattributed derivative of Muhammad Ali's translation. **Sahih International is
copyrighted** and is what most scraped datasets hand you. Since you pull quran.com API v4, read
the licence metadata per `resource_id` and pin the cleared ones in config, with the IDs recorded
in the DECISIONS log.

---

## 8. Build-time validation (add to `scripts/`)

Claude Code should not be trusted to hold these rules in its head across 505 pages. Make them a
script that fails the build:

```
assert every title_tag length <= 60
assert every meta_description length <= 155
assert no two pages share a primary_keyword
assert no two pages share an H1
assert every Arabic block has lang="ar" dir="rtl"
assert every page emits valid BreadcrumbList JSON-LD
assert no page contains the literal string "CreationalWork"
assert every indexed page has >= 2 unique-value components (§1)
assert every page has >= 3 internal links (occasion hub, source hub, 1+ related)
assert every quran-owned head term appears as rel=canonical on its /duas/ twin (§3)
assert sitemap excludes every page whose index_decision != "index"
```

Split sitemaps by wave (`sitemap-duas-wave1.xml` …) so Search Console shows you index rate per
wave and you find out which wave is failing.

---

## 9. On the numbers

v1's §7 caveat is honest and correct: no volume data was used. Before Wave 1, spend 30 minutes
in Google Keyword Planner or Search Console on the ~50 famous terms and the 30 hub terms. You do
not need paid tools for this — Search Console's Performance report on your existing pages plus
Keyword Planner's free tier will confirm or reorder the top 50. The relative ranking in the
famous-dua list is plausible; the one I would personally verify first is whether `ayatul kursi`
should be a Qur'an-section page rather than a dua page (§3), because that single decision
determines the architecture of your highest-value URL.
