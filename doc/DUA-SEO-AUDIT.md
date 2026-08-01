# DUA-SEO-AUDIT.md

**Read-only.** 2026-07-31. Audited against the local build served at `http://localhost:3000`,
branch `feat/dua-hubs-s17`. **Nothing was fixed.** Every figure is measured from the built files.

| Type | Path audited | Bytes |
|---|---|---:|
| detail | `duas/words-of-remembrance-for-morning-and-evening-hisn-27-78.html` | 12,349 |
| chapter | `duas/chapter/words-of-remembrance-for-morning-and-evening.html` | 37,549 |
| hub | `duas/source/hisn.html` | 117,751 |
| dua.html | `dua.html` | 94,915 |

---

## 0. The finding that outranks everything else

**All 505 detail pages, 28 hubs and 27 chapter pages are unreachable from the site root.**

A breadth-first crawl from `index.html` over real files on disk reaches `dua.html` at depth 1 and
stops. **`dua.html` contains zero links to any page under `/duas/`** — measured, not inferred — and
no page outside `duas/` references `duas/occasion/`, `duas/source/` or `duas/chapter/` either.

```
clicks from index.html      detail pages
  UNREACHABLE                      505
  within 3 clicks                0 / 505
```

Inside the subtree the §17 rewrite genuinely worked: median **8** inbound links per detail page and
**0** pages with none. But the whole tree is an island. §17 requires every detail page within 3
clicks of root; the graph breaks at the first hop. The fix belongs in `dua.html`, not in `/duas/`.

| Inbound links | Detail pages |
|---|---|
| 0 | **0** |
| 3–6 | 14 |
| 7 | 105 |
| 8 | 355 |
| 9–20 | 31 |

---

## 1. Head per page type

### 1.1 Detail — verbatim (CSS block elided, marked)

```html
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Words of remembrance for morning and evening (O Allah, by your leave we have…)</title>
<meta name="description" content="Arabic, transliteration and English meaning of Words of remembrance for morning and…, a dua for morning &amp; evening. “O Allah, by…” Source: Hisn al-Muslim 27."/>
<meta name="robots" content="noindex,follow"/>
<link rel="canonical" href="https://islamicinfo.org/duas/words-of-remembrance-for-morning-and-evening-hisn-27-78.html"/>
<meta property="og:type" content="article"/><meta property="og:site_name" content="IslamicInfo.org"/>
<meta property="og:title" content="Words of remembrance for morning and evening (O Allah, by your leave we have…)"/>
<meta property="og:description" content="Arabic, transliteration and English meaning of Words of remembrance for morning and…, a dua for morning &amp; evening. “O Allah, by…” Source: Hisn al-Muslim 27."/>
<meta property="og:url" content="https://islamicinfo.org/duas/words-of-remembrance-for-morning-and-evening-hisn-27-78.html"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="Words of remembrance for morning and evening (O Allah, by your leave we have…)"/>
<meta name="twitter:description" content="Arabic, transliteration and English meaning of Words of remembrance for morning and…, a dua for morning &amp; evening. “O Allah, by…” Source: Hisn al-Muslim 27."/>
  <link rel="preload" as="font" type="font/woff2" href="/src/fonts/libre-baskerville-400-normal-latin.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/src/fonts/cormorant-garamond-500-normal-latin.woff2" crossorigin>
  <link rel="stylesheet" href="/src/css/tokens.css?v=20260730">
  <link rel="stylesheet" href="/src/css/fonts.css?v=20260730">
<style> … 33 lines of inline CSS elided … </style>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Words of remembrance for morning and evening — “O Allah, by your leave we have reached the…”","name":"…","description":"…","mainEntityOfPage":"https://islamicinfo.org/duas/words-of-remembrance-for-morning-and-evening-hisn-27-78.html","url":"…","inLanguage":"en","citation":"Hisn al-Muslim 27","isPartOf":[{"@type":"CollectionPage","name":"Morning & Evening","url":"https://islamicinfo.org/duas/occasion/morning-evening.html"},{"@type":"CollectionPage","name":"Hisn al-Muslim","url":"https://islamicinfo.org/duas/source/hisn.html"}],"dateModified":"2026-07-31"}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","@id":"…","url":"…","name":"…","description":"…","inLanguage":"en","isPartOf":{"@type":"WebSite","name":"IslamicInfo.org","url":"https://islamicinfo.org/"},"dateModified":"2026-07-31"}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://islamicinfo.org/"},{"@type":"ListItem","position":2,"name":"Duas","item":"https://islamicinfo.org/dua.html"},{"@type":"ListItem","position":3,"name":"Morning & Evening","item":"https://islamicinfo.org/duas/occasion/morning-evening.html"},{"@type":"ListItem","position":4,"name":"…","item":"…"}]}</script>
```

### 1.2 Chapter — verbatim (meta block)

```html
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Words of remembrance for morning and evening — Duas with Sources | IslamicInfo.org</title>
<meta name="description" content="24 supplications recorded under Words of remembrance for morning and evening in Hisn al-Muslim, each with its Arabic text, English meaning and source…"/>
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/>
<link rel="canonical" href="https://islamicinfo.org/duas/chapter/words-of-remembrance-for-morning-and-evening.html"/>
<meta property="og:type" content="website"/><meta property="og:site_name" content="IslamicInfo.org"/>
<meta property="og:title" content="Words of remembrance for morning and evening — Duas with Sources | IslamicInfo.org"/>
<meta property="og:description" content="24 supplications recorded under Words of remembrance for morning and evening in Hisn al-Muslim, each with its Arabic text, English meaning and source…"/>
<meta property="og:url" content="https://islamicinfo.org/duas/chapter/words-of-remembrance-for-morning-and-evening.html"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="Words of remembrance for morning and evening — Duas with Sources | IslamicInfo.org"/>
<meta name="twitter:description" content="24 supplications recorded under Words of remembrance for morning and evening in Hisn al-Muslim, each with its Arabic text, English meaning and source…"/>
```

### 1.3 Hub — verbatim (meta block)

```html
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Duas from Hisn al-Muslim — Arabic, Meaning and Reference | IslamicInfo.org</title>
<meta name="description" content="247 supplications drawn from Hisn al-Muslim, each linked to its own page with the Arabic text, English meaning and full reference."/>
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/>
<link rel="canonical" href="https://islamicinfo.org/duas/source/hisn.html"/>
<meta property="og:type" content="website"/><meta property="og:site_name" content="IslamicInfo.org"/>
<meta property="og:title" content="Duas from Hisn al-Muslim — Arabic, Meaning and Reference | IslamicInfo.org"/>
<meta property="og:description" content="247 supplications drawn from Hisn al-Muslim, each linked to its own page with the Arabic text, English meaning and full reference."/>
<meta property="og:url" content="https://islamicinfo.org/duas/source/hisn.html"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="Duas from Hisn al-Muslim — Arabic, Meaning and Reference | IslamicInfo.org"/>
<meta name="twitter:description" content="247 supplications drawn from Hisn al-Muslim, each linked to its own page with the Arabic text, English meaning and full reference."/>
```

### 1.4 `dua.html` — verbatim (meta block)

```html
<meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title data-i18n="dua.title">Daily Duas — IslamicInfo</title>  <link rel="icon" href="/src/img/favicon.svg" type="image/svg+xml">

  <meta name="description" content="536 supplications from the Qur'an and hadith, each shown with its Arabic, meaning and source. Browse by occasion or search the whole library."/>
  <link rel="canonical" href="https://islamicinfo.org/dua.html"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="IslamicInfo.org"/>
  <meta property="og:title" content="Daily Duas — 536 Source-Cited Supplications — IslamicInfo"/>
  <meta property="og:description" content="536 supplications from the Qur'an and hadith, each shown with its Arabic, meaning and source. Browse by occasion or search the whole library."/>
  <meta property="og:url" content="https://islamicinfo.org/dua.html"/>
```

### 1.5 Head findings

| Item | detail | chapter | hub | dua.html |
|---|---|---|---|---|
| title length | 78 | 82 | 74 | 24 |
| description length | 160 | 150 | 130 | 154 |
| robots | `noindex,follow` | `index,follow,…` | `index,follow,…` | **absent** |
| canonical | ✅ | ✅ | ✅ | ✅ |
| OG title/desc/url | ✅ | ✅ | ✅ | ✅ |
| **og:image** | **missing** | **missing** | **missing** | present |
| twitter:card | `summary` | `summary` | `summary` | present |
| **favicon** | **missing** | **missing** | **missing** | present |

**Across all 505 detail pages:** 0 missing canonical, 0 missing OG title, 0 missing JSON-LD,
0 duplicate titles. **130 titles exceed 60 chars** and **174 descriptions exceed 160 chars**.
**6 descriptions are duplicated**, the worst shared by 5 pages
(`"Arabic, transliteration and English meaning of Invocations during Ruki…"`).

`dua.html` has **no robots meta at all**. That defaults to indexable, which is probably intended,
but it is the only one of the four where the directive is implicit rather than stated.

The `dua.html` `<title>` carries `data-i18n="dua.title"` — my first extraction pass reported its
length as 0 because the regex assumed `<title>` had no attributes. That was a tool artifact, not a
page defect; the title is present and 24 characters.

---

## 2. Structured data — what exists

**JSON-LD is present on every page type.** This is stronger than expected and nothing is missing.

| Page type | Blocks | Types |
|---|---:|---|
| detail | **3** | `Article`, `WebPage`, `BreadcrumbList` |
| chapter | 2 | `CollectionPage`, `BreadcrumbList` |
| hub | 2 | `CollectionPage`, `BreadcrumbList` |
| dua.html | 1 | `WebSite` |
| **all 505 detail pages** | — | **0 pages missing JSON-LD** |

The detail-page `Article` block carries `citation: "Hisn al-Muslim 27"` and an `isPartOf` array
pointing at both the occasion hub and the source hub. The `BreadcrumbList` is a full 4-level trail
(Home → Duas → Morning & Evening → the dua). **The breadcrumb asserts a path that does not exist as
links** — position 2 is `dua.html`, which does not link onward to position 3. The structured data
describes the site graph §17 intended; section 0 shows the HTML does not implement it.

---

## 3. Heading structure

**Exactly one `<h1>` on all 505 detail pages — 0 with none, 0 with more than one.**

| Page type | H1 | H2 | H3 |
|---|---:|---:|---:|
| detail | 1 | 5 | 0 |
| chapter | 1 | 1 | 0 |
| hub | 1 | 1 | 0 |
| dua.html | 1 | 4 | 0 |

Nesting is flat but not skipped — H1 → H2 with no H3+ anywhere, so no level is jumped. On the hub
and chapter pages a single H2 covers a list of 247 and 24 items respectively; the per-item titles
are links, not headings, which is defensible for a link index but means the page offers one
sub-heading for the whole body.

---

## 4. Internal links

Covered in section 0. Summary: median **8** inbound per detail page, **0** orphans inside the
subtree, **0 of 505** reachable from root.

---

## 5. Favicon and og:image

Both gaps confirmed, and they are confined to the generated pages:

- **`og:image`: absent on all 505 detail pages, all 28 hubs, all 27 chapter pages.** Present on
  `dua.html`. Every generated page declares `twitter:card = summary`, which renders without an
  image, so the cards are valid but imageless.
- **favicon: absent on all 560 generated pages.** Present on `dua.html`
  (`/src/img/favicon.svg`). Browser tabs for every dua page will show a default glyph.

Both are single-line additions to the two builders, and neither blocks indexing.

---

## 6. Page weight and render-blocking

| Page type | Bytes | Stylesheets | Inline `<style>` | Sync `<script src>` | Async/defer |
|---|---:|---:|---:|---:|---:|
| detail | 12.3 KB | 2 | 1 | **0** | 0 |
| chapter | 37.5 KB | 2 | 1 | **0** | 0 |
| hub | **117.8 KB** | 2 | 1 | **0** | 0 |
| dua.html | 94.9 KB | 2 | 1 | **6** | 1 |

The generated pages carry **zero JavaScript** — no sync scripts, no async, nothing to hydrate.
Render-blocking is limited to two stylesheets (`tokens.css`, `fonts.css`, both `?v=` versioned)
plus two preloaded woff2 fonts. For a static content page this is close to ideal.

`dua.html` is the outlier with **6 synchronous `<script src>` tags** in the head region — that is
the app page, not a generated one, but it is the entry point every dua page's breadcrumb points at.

**`duas/source/hisn.html` at 117.8 KB is the one weight concern.** It lists 247 entries on a single
page with no pagination. It is 10× the size of a detail page and 3× the chapter page. This is much
better than the 193 KB text dump it replaced, but a 247-item unpaginated index is still a large
document for a hub.

---

## 7. Things not asked about

1. **The `<title>` and `<h1>` disagree on every detail page.** Title: *"Words of remembrance for
   morning and evening (O Allah, by your leave we have…)"*. H1: *"Words of remembrance for morning
   and evening — "O Allah, by your leave we have reached the…""*. Different truncation points and
   different punctuation for the same string. Not wrong, but the SERP title and the page heading
   won't match, which reads as inconsistency to a user who clicks through.

2. **Truncation with `…` is doing heavy lifting in the metadata.** The description reads
   *"…meaning of Words of remembrance for morning and…, a dua for morning & evening. "O Allah,
   by…""* — two ellipses in one sentence, one of them mid-phrase before a comma. It is honest, but
   it reads as machine output.

3. **`robots: noindex,follow` on all 505 detail pages** is correct today (no batch approved), but
   the hubs and chapters are `index,follow` — so search engines are invited to index 55 index pages
   whose every target is noindex. That is a crawl pattern worth deciding deliberately before launch.

4. **The hub's H1 says "Duas from Hisn al-Muslim" and the count says 247**, but per ADR-060 the
   `Hisn al-Muslim` label is a class-level attribution, and 81 of those records carry a
   `hadithCitation` naming a different collection. The hub is accurate about provenance-via-
   compilation and could be misread as a claim about original source.

5. **`dua.html` describes "536 supplications"** in its meta description while `library.json` now
   holds 481 after the exclusion set. The number is stale by 55.

6. **No `hreflang`**, though the site ships an i18n layer (`data-i18n` attributes are present in
   `dua.html`). Generated pages are English-only with no alternate declared.

7. **`dateModified` is `2026-07-31` on every generated page** — the build date, not a content date.
   Uniform freshness signals across 560 pages are a weak signal at best.

---

## Method

Head, heading and link figures are parsed from the built HTML on disk. The click-depth crawl
resolves `href` values against real files, following only same-site `.html` links, so it measures
the graph as a crawler would walk it. Rendered text was extracted by stripping tags; a handful of
named HTML entities (`&rsaquo;`, `&rarr;`, `&middot;`) survive in the text dumps below as literals —
that is an artifact of the extractor, not of the pages.

---

## Appendix A — complete rendered text of one detail page

`duas/words-of-remembrance-for-morning-and-evening-hisn-27-78.html` — full text, verbatim:

```text
Words of remembrance for morning and evening (O Allah, by your leave we have…)
IslamicInfo
Duas
Qur’an
Hadith
Home
&rsaquo;
Duas
&rsaquo;
Morning & Evening
&rsaquo; Words of remembrance for morning and evening — “O Allah, by your leave we have reached the…”
Words of remembrance for morning and evening — “O Allah, by your leave we have reached the…”
Words of remembrance for morning and evening is recorded in Hisn al-Muslim, chapter 27, and is listed under morning & evening in this library. This page gives the Arabic text, a transliteration, an English translation and the full source reference. It begins: “O Allah, by your leave we have reached the morning and by Your leave we have reached the…”
Hisn al-Muslim 27
((اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا ، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ)). [وإذا أمسى قال: اللَّهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير.]
(Allahumma bika asbahna wabika amsayna, wabika nahya ,wabika namootu wa-ilaykan-nushoor.)[In the evening:] (Allahumma bika amsayna, wabika asbahna, wabika nahya wabika namootu wa-ilaykal-maseer.)
(O Allah, by your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.)[In the evening:](O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.)
Hisn al-Muslim 27 ·
Hisn al-Muslim
Context & meaning
One phrase carries the whole supplication: by Your leave. It is repeated across every clause — reaching the morning, reaching the evening, living and dying all happen by His leave, and the sentence ends by naming resurrection as the return. The voice is plural throughout, saying we rather than I. A second form is given for the evening, in which morning and evening exchange places and the closing word becomes return instead of resurrection.
When & how to recite
The chapter this belongs to places these words in the morning and in the evening. The text itself supplies a separate evening wording.
Reflection
Nothing is requested anywhere in these words. Each clause simply attributes an event to His permission, and the list runs the full span from one morning through death without ever breaking that pattern.
About these notes
The notes above explain the wording of the supplication as it is translated on this page. They add no commentary, history or ruling beyond it.
Source & authenticity
Source: Hisn al-Muslim · Reference: Hisn al-Muslim 27
Translation: Hisn al-Muslim (Fortress of the Muslim), Sa'id al-Qahtani — see site-wide attribution
IslamicInfo presents the source information available in its current verified database and does not issue religious rulings.
Browse every dua for morning & evening &rarr;
Related duas
Words of remembrance for morning and… — (O Allah, verily I have reached the…
Words of remembrance for morning and… — (O Allah, what blessing I or any of Your…
Words of remembrance for morning and… — O Allah, protect my body (from illness and…
Words of remembrance for morning and… — Allah is Sufficient for me, none has the…
Words of remembrance for morning and… — O Allah, indeed I ask You for well-being…
Morning & Evening
Hisn al-Muslim
Words of remembrance for morning and evening
This supplication is shown with the source it comes from. IslamicInfo publishes no rulings.
Back to the dua library```

## Appendix B — rendered text of one hub, first 100 lines

`duas/source/hisn.html` — 516 lines total, first 100 verbatim:

```text
Duas from Hisn al-Muslim — Arabic, Meaning and Reference | IslamicInfo.org
IslamicInfo
Duas
Qur’an
Hadith
Home
&rsaquo;
Duas
&rsaquo; Hisn al-Muslim
Duas from Hisn al-Muslim
Supplications in this library that come from Hisn al-Muslim. Each links to its own page, where the Arabic text, its meaning in English and its reference are shown together.
247 supplications &middot; every one with its source
Words of remembrance for morning and evening — Allāh - there is no deity except Him, the… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — Say, "He is Allāh, [who is] One, Allāh, the Eternal… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — ‘We have reached the morning and at this very time… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Allah, by your leave we have reached the morning… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Allah, You are my Lord. There is no deity worthy… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Allah, verily I have reached the morning and call… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Allah, what blessing I or any of Your creation… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Allah, protect my body (from illness and from what… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — Allah is Sufficient for me, none has the right to be… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Allah, indeed I ask You for well-being and safety… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Allah, Knower of the unseen and the seen, Creator… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — In the name of Allah, with whose name nothing in the… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — I am pleased with Allah as my Lord, Islam as my… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Ever-Living, O Self-Sustaining, by Your mercy I… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — We have reached the morning and at this very time… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — In the evening we are upon the fitrah of Islam, the… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — Glory be to Allah, and praise be to Him. &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — There is no deity worthy of worship except Allah… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — There is no deity worthy of worship except Allah… · Hisn al-Muslim 27 &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — Glory be to Allah, as many as His creations, Glory… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — O Allah, I ask You for beneficial knowledge, good… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — I seek forgiveness from Allah and repent to Him. &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — I seek refuge in the perfect words of Allah from the… &rarr;
Hisn al-Muslim 27
Words of remembrance for morning and evening — ‘O Allaah, send prayers and peace upon our Prophet… &rarr;
Hisn al-Muslim 27
What to say before sleeping — Allāh - there is no deity except Him, the… &rarr;
Hisn al-Muslim 28
What to say before sleeping — The Messenger has believed in what was revealed to… &rarr;
Hisn al-Muslim 28
What to say before sleeping — In Your name my Lord, I lie down and in Your name I… &rarr;
Hisn al-Muslim 28
What to say before sleeping — O Allah, verily You have created my soul and You… &rarr;
Hisn al-Muslim 28
What to say before sleeping — O Allah, protect me from Your punishment on the day… &rarr;
Hisn al-Muslim 28
What to say before sleeping — In Your name, O Allah, I die and I live. &rarr;
Hisn al-Muslim 28
What to say before sleeping — How Perfect Allah is. (thirty-three times) All… &rarr;
Hisn al-Muslim 28
What to say before sleeping — O Allah, Lord of the seven heavens and the exalted… &rarr;
Hisn al-Muslim 28
What to say before sleeping — All praise is for Allah, Who fed us and gave us… &rarr;
Hisn al-Muslim 28
What to say before sleeping — O Allah, Knower of the unseen and the seen, Creator… &rarr;
Hisn al-Muslim 28
What to say before sleeping — O Allah, I submit my soul unto You, and I entrust my… &rarr;
Hisn al-Muslim 28
Supplications for when you wake up — All praise is for Allah who gives us life after He… &rarr;
Hisn al-Muslim 1
Supplications for when you wake up — None has the right to be worshipped except Allah… &rarr;
Hisn al-Muslim 1
Supplications for when you wake up — All praise is for Allah who restored to me my health… &rarr;
Hisn al-Muslim 1
Supplications for when you wake up — Indeed, in the creation of the heavens and the earth… &rarr;
Hisn al-Muslim 1
Invocation for entering the restroom &rarr;
Hisn al-Muslim 6
Invocation for leaving the restroom &rarr;
Hisn al-Muslim 7
What to say before performing ablution &rarr;
Hisn al-Muslim 8
What to say upon completing ablution — I bear witness that none has the right to be… &rarr;
Hisn al-Muslim 9
What to say upon completing ablution — O Allah, make me of those who return to You often in… &rarr;
Hisn al-Muslim 9
```
