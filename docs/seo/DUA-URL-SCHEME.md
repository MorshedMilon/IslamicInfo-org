# Dua URL Scheme — proposal for review

Status: **APPROVED by the owner 2026-07-29** (D1–D8 as recommended). The scheme in §3 is
the agreed target; the individual-dua and chapter pages are not built yet.
Done since approval: §2 deploy blocker fixed, §4.1/§4.2 occasion facet fixed.
Date: 2026-07-29
Scope: SEO task 1 — audit the dua corpus + routing, design the URL scheme, list every
category/occasion for review.

> **Three separate SEO surfaces.** Occasion, source and chapter are three independent
> facets and stay that way in every future SEO task — one URL family each, never merged.

---

## 1. What exists today

### 1.1 The corpus

`src/data/dua/search-corpus.json` — one file, schema 2, 556 entries.

| Set | Count | Definition |
| --- | ---: | --- |
| All entries | 556 | everything in the corpus |
| Shown | 536 | has a translation and `entryType !== 'guidance'` |
| **Browse (page candidates)** | **506** | shown, minus `variantRole === 'variant'` |
| Variants | 30 | further narrations, rendered inside their group's lead card |
| Guidance narrations | 18 | narrations *about* practice — contain no supplication |
| No translation | 2 | held back |
| Contextual | 1 | quoted in the Qur'an as an example, carries a warning note |

Per-entry fields actually available for URL building:

`id`, `category` + `categorySlug`, `occasion` + `occasionSlug` + `occasionIcon`,
`sourceKey` + `sourceLabel`, `arabic`, `transliteration`, `translation`,
`translationSource`, `verseRef`, `hadithCitation {book, number, chapter, narrator}`,
`variantGroup/variantRole/variantLead`, `edition/editionNote`, `contextLabel/contextNote`.

> **There is no English title/name field.** No `title`, `name`, or `slug` exists on any
> entry. This is the single most important constraint on the slug design (§3): a
> per-dua slug must be *derived* from existing fields, and we must not invent names for
> supplications.

`id` is stable and unique (0 duplicates across 556) in three shapes:

| Shape | Example | Count | Meaning |
| --- | --- | ---: | --- |
| `N:M` | `27:75` | 267 | Hisn al-Muslim chapter N, entry M |
| `quran:S:A` | `quran:2:126` | 99 | Qur'an surah:ayah |
| `<collection>:<num>` | `nasai:5485` | 190 | hadith collection + hadith number |

### 1.2 The three facets (this is the part that needs your review)

The data has **three** independent grouping fields. Your prompt says "category/occasion"
as if it were one thing; in this corpus they are three, and they need three different
decisions:

| Facet | Field | Distinct values | What it is | Static pages today |
| --- | --- | ---: | --- | --- |
| **Occasion** | `occasionSlug` | 20 | *Derived* navigation bucket (Travel, Protection…) | ✅ 20 pages |
| **Source** | `sourceKey` | 10 | Which collection the text comes from | ✅ 10 pages |
| **Chapter** | `categorySlug` | 132 | The compilation's *own, unmodified* chapter label | ❌ JS filter only |

Occasion is the facet with real search demand ("dua for travel"). Chapter is the
factual, source-faithful label. Source is provenance.

### 1.3 Routing today

| URL | Exists | Rendered by |
| --- | --- | --- |
| `/dua.html` | yes | app shell + `src/js/dua-library.js` (client-side) |
| `/dua.html?occasion=<slug>` | yes | JS filter, `history.pushState` |
| `/dua.html?source=<slug>` | yes | JS filter |
| `/dua.html?category=<slug>` (alias `?cat=`) | yes | JS filter, all 132 chapters reachable |
| `/duas/occasion/<slug>.html` | yes (20) | `scripts/build-dua-landing-pages.mjs`, server-rendered |
| `/duas/source/<slug>.html` | yes (10) | same generator |
| **individual dua** | **no** | — no per-dua URL of any kind exists |

The generator already does the right things: real HTML content (not JS-rendered),
`<title>`, meta description, canonical, OG/Twitter, `CollectionPage` + `BreadcrumbList`
+ `ItemList` JSON-LD, sibling-facet internal links, and it rewrites `sitemap.xml`.
The per-dua layer should reuse it rather than start a second generator.

---

## 2. ✅ FIXED — the deploy blocker (was: none of the SEO work was live)

`.github/workflows/deploy.yml` now copies `robots.txt`, `sitemap.xml` and the whole
`duas/` tree, and a **"Verify the crawlable surface shipped"** step fails the deploy if
either file is missing or if any `<loc>` in the sitemap has no matching file in the
artifact — so a stale sitemap or an unpublished directory can never ship 404s again.
Verified locally against the real repo: 44 sitemap URLs all resolve, 30 dua pages ship.
`duas/` is copied as a tree, so the coming `duas/chapter/` and per-dua pages need no
further workflow change.

The original finding, for the record — checked against the live site on 2026-07-29:

```
https://islamicinfo.org/dua.html                      200
https://islamicinfo.org/robots.txt                    404   <- serves the SPA 404 shim
https://islamicinfo.org/sitemap.xml                   404   <- serves the SPA 404 shim
https://islamicinfo.org/duas/occasion/travel.html     404
```

Cause — `.github/workflows/deploy.yml` builds the artifact with:

```
cp *.html _site/
cp -r src/* _site/src/
cp CNAME .nojekyll _site/
```

Only **root-level** `*.html` plus `src/` ship. So `robots.txt`, `sitemap.xml` and the
whole `duas/` directory are committed to `main` but never published. The 30 landing
pages from commit `95e5768` and the sitemap are invisible to Google, and `robots.txt`
returning a 404 HTML page means the sitemap is not discoverable at all.

Nothing else in this plan could rank until that was fixed, so it was fixed first.

---

## 3. Proposed URL scheme

### 3.1 Namespace: keep `/duas/`, not `/dua/`

Your prompt proposes `/dua/{slug}`. Recommend **`/duas/…`** instead:

- 30 URLs are already committed under `/duas/` and the sitemap already references them.
- `/dua.html` exists, and GitHub Pages resolves the extensionless `/dua` to it
  (verified: `https://islamicinfo.org/dua` → 200). A sibling `/dua/` *directory* would
  put `/dua` and `/dua/` one slash apart with different meanings — an avoidable
  duplicate-content and internal-linking trap.
- GitHub Pages has no server-side redirects, so a later rename costs us the URLs.

### 3.2 The scheme

| Purpose | URL | Count | Priority |
| --- | --- | ---: | ---: |
| Library hub | `/dua.html` | 1 | 0.9 |
| **Individual dua** | `/duas/{dua-slug}.html` | **506** | 0.6 |
| Occasion landing | `/duas/occasion/{slug}.html` | 20 | 0.7 |
| Source landing | `/duas/source/{slug}.html` | 10 | 0.6 |
| **Chapter landing** | `/duas/chapter/{slug}.html` | **27** (see §5) | 0.5 |

Total indexable dua URLs: **564** (506 + 20 + 10 + 27 + hub).

Notes on the shape:

- **`.html` extension, canonical.** The whole site uses it and Pages also serves the
  extensionless form, so canonical must be pinned to exactly one — recommend `.html`,
  matching the 30 pages already published.
- **Flat file per dua, faceted subdirectories.** `occasion/`, `source/` and `chapter/`
  are reserved directory names; a dua slug can never collide with them because every
  dua slug ends in its id (§3.3).
- **Variants get no URL of their own.** The 30 `variantRole:'variant'` entries render
  inside their lead's page under an anchor `#n-{id}`, keeping their own full text and
  citation. Giving them separate pages would publish 30 near-duplicate pages of the same
  supplication — the exact thing the browse grid already collapses.
- **Guidance narrations and untranslated entries get no page** (20 entries). They are not
  supplications to recite; a page for each would be thin and misleading.

### 3.3 Slug format for individual duas

Recommended: **`{chapter-words}-{stable-id}`** — up to 6 words from the entry's own
chapter label, then the id with `:` → `-` (`27:75` → `hisn-27-75`).

```js
slug = kebab(category).split('-').slice(0,6).join('-') + '-' + idSlug(id)
// 27:75      -> hisn-27-75
// quran:2:126-> quran-2-126
// bukhari:6114 -> bukhari-6114
```

Real output from the corpus:

```
/duas/what-to-say-before-sleeping-hisn-28-100.html
/duas/invocations-for-anguish-hisn-35-122.html
/duas/words-of-remembrance-for-morning-and-hisn-27-75.html
/duas/invocation-for-riding-in-a-vehicle-hisn-95-206.html
/duas/quranic-supplications-quran-2-126.html
/duas/invocations-kitab-al-daawat-bukhari-6114.html
```

Measured over all 506 candidates:

| Format | Example | Unique | Collisions | Max len | Verdict |
| --- | --- | ---: | ---: | ---: | --- |
| A. id only | `hisn-27-75` | 506/506 | 0 | 13 | Stable but zero keywords |
| B. chapter + id tail | `what-to-say-before-sleeping-28-100` | 506/506 | 0 | 49 | Ambiguous tail across sources |
| C. chapter + transliteration | `what-to-say-before-sleeping-bismika-allahumma` | 417/506 | **32** | 83 | ❌ collides; mangles diacritics |
| **D. chapter + id (recommended)** | `what-to-say-before-sleeping-hisn-28-100` | **506/506** | **0** | 59 | ✅ |
| E. occasion + text + id | `sleep-and-waking-bismika-…-hisn-28-100` | 506/506 | 0 | 84 | ❌ depends on the buggy occasion facet (§4) |

Why D:

- **Uniqueness is guaranteed structurally**, not by luck — the id suffix is unique by
  construction, so a corpus rebuild can never produce a collision or a silent URL change.
- **The keyword stem comes from a real, sourced field.** No supplication is given an
  invented English name; the chapter label is the compilation's own wording.
- **Traceable.** `-hisn-28-100`, `-quran-2-126`, `-bukhari-6114` tell a human (and us, in
  a bug report) exactly which entry the page is.
- Format C — the "prettiest" option — actually **collides 32 times** (e.g. two entries
  both produce `words-of-remembrance-for-morning-la-ilaha-illa-allah-wahdahu`) and turns
  `aʿūdhu` into `aaaoothu` once diacritics are stripped. Rejected.

**Slug immutability policy.** Once a slug is published it is frozen in a
`src/data/dua/slugs.lock.json` map (`id → slug`). The generator reads the lock first and
only mints slugs for ids it has never seen. Editing a chapter label must never move a
published URL, because GitHub Pages cannot 301.

### 3.4 Facet slugs

Occasion and source slugs already exist in the data and are already published — keep them
exactly as they are (`travel`, `protection`, `hisn`, `bukhari`, …).

For chapter pages, **do not reuse `categorySlug` verbatim**: 25 of the 132 are truncated
at ~60 characters mid-word, e.g.

```
invocations-after-the-final-tash-ahhud-and-before-ending-the   (…"the prayer")
invocation-for-when-you-find-something-becoming-difficult-fo   (…"for you")
what-to-say-if-you-are-afraid-to-go-to-sleep-or-feel-lonely-
```

Recommend chapter page slugs be re-cut at a word boundary (≤ 8 words). That creates a
mismatch with the existing `?category=` filter values, so the page generator must emit
both and the JS filter must accept either — noted as decision D4 in §6.

---

## 4. Data issues found before URLs freeze

URLs are permanent; the data feeding them was not yet clean.

**4.1 ✅ FIXED — the `occasion` facet was mis-bucketed.** Of the 140 browse entries whose
chapter label names an occasion outright, **24 sat in a different bucket**. The
`food-drink` page (31 entries, in the sitemap) was the worst: at least 13 of its entries
had nothing to do with food or drink. It now holds 8, all of them food or drink duas.

```
27:75   Words of remembrance for morning and evening  -> food-drink   (Ayat al-Kursi)
28:100  What to say before sleeping                   -> food-drink
16:29   Invocations for the beginning of the prayer   -> food-drink
19:46   Invocations during Sujood                     -> food-drink
25:70   What to say after completing the prayer       -> food-drink
1:4     supplications for when you wake up            -> home-clothing
57:162  Invocation for the bereaved                   -> home-clothing
60:165  Invocation for visiting the graves            -> provision
```

(A handful of the 24 are genuine judgment calls — the corpus states the facet is derived
from each dua's *text* when its chapter is a book chapter such as "Kitab al-Witr". The
eight above are not judgment calls.)

**4.2 ✅ FIXED — there was no checked-in generator for the occasion facet.** The values
existed only baked inside `search-corpus.json`, so 4.1 could not be fixed by re-running
anything. The rules now live in `src/js/dua-occasion-core.js` (pure, UMD, no DOM/network)
and are applied by `scripts/build-dua-occasions.mjs`:

| Layer | Source | Entries |
| --- | --- | ---: |
| 1. chapter | the entry's own chapter label, when it names an occasion | 237 |
| 2. text | the supplication's own English meaning | 200 |
| 3. fallback | `general` — never forced into a bucket to pad it | 99 |

A book chapter ("Kitab al-Da'awat", "Kitab al-Witr") names a place in a collection, not an
occasion, so layer 1 skips it — as the corpus facet note already said it should. Within a
layer the first matching rule wins, so the tables are ordered most-specific-first
("Funeral prayer" is read as a funeral, not a prayer). `assign()` returns the rule that
fired, so any bucket a reader disagrees with traces to one line of one table.

`worker/test/dua-occasion-core.test.js` (12 tests) locks it in: the corpus must be
reproducible by re-running the rules, labels and icons must come from the bucket table,
`meta.facets.occasion.buckets` must match the table, and no chapter that names an occasion
may sit in a contradicting bucket. Re-run after any corpus change:

```
node scripts/build-dua-occasions.mjs      # then build-dua-library, build-dua-page,
                                          # build-dua-landing-pages
```

**4.3 One chapter label has a typo** that would become a URL: *"vocation for someone who
says: May Allah forgive you"* (missing "In"). n=1, so under the §5 threshold it gets no
page of its own — but it is displayed on cards and would appear in a dua slug.

**4.4 Near-duplicate chapter labels across collections** will compete with each other if
all are given pages: "Chapters on Supplication (Kitab al-Da'awat)" (53, Tirmidhi) vs
"Invocations (Kitab al-Da'awat)" (7, Bukhari); "Supplications in the Witr Prayer
(Kitab al-Witr)" (21, Abu Dawud) vs "The Book on Al-Witr (Kitab al-Witr)" (1, Tirmidhi).
They are factually distinct — each is that collection's own chapter name — so they should
not be merged. Suggest chapter pages state the collection in the `<title>` to
differentiate them ("Kitab al-Da'awat — Duas from Jami at-Tirmidhi").

---

## 5. Chapter pages: which of the 132 get a URL

87 of the 132 chapters contain exactly **one** dua, and 18 contain two. A page for a
single dua is a duplicate of that dua's own page — thin content, and it competes with the
page we actually want to rank.

| Chapter size | Chapters | Recommendation |
| --- | ---: | --- |
| ≥ 5 duas | 15 | ✅ static page |
| 3–4 duas | 12 | ✅ static page |
| 2 duas | 18 | ❌ no page — the two dua pages + the occasion page cover it |
| 1 dua | 87 | ❌ no page — the dua page *is* the chapter |

→ **27 chapter pages.** All 132 stay browseable via `/dua.html?category=…` exactly as
today (the JS filter is unchanged); they simply do not each get an indexable URL. For the
105 without a page, the chapter name still appears on every dua page, and the dua page
links to its occasion page — so nothing becomes unreachable.

---

## 6. Decisions I need from you

All eight were approved as recommended on 2026-07-29. D1 and D7 are done; the rest are
the standing contract for the remaining SEO tasks.

| # | Decision | Outcome |
| --- | --- | --- |
| D1 | Fix `deploy.yml` first (§2)? | **Yes** — ✅ done |
| D2 | `/duas/…` namespace, not `/dua/…` | **Keep `/duas/`** (30 URLs already committed there) |
| D3 | Slug format for individual duas | **Format D**, `{chapter-words}-{stable-id}`, frozen in a lockfile |
| D4 | Chapter facet URL word | **`/duas/chapter/…`** — "category" is ambiguous with "occasion" in this codebase |
| D5 | Chapter page threshold | **≥ 3 duas → 27 pages**; the other 105 stay JS-filter only |
| D6 | Variants get their own URL? | **No** — anchor inside the lead dua's page |
| D7 | Fix the occasion buckets before publishing? | **Yes** — ✅ done, 109 entries moved |
| D8 | Guidance / untranslated entries | **No pages** (20 entries) |

---

## Appendix A — all 20 occasions

Counts are browse entries (506 total), **after** the §4.1/§4.2 correction — 109 of the
536 shown entries changed bucket. All 20 are live as `/duas/occasion/<slug>.html`.

| Count | Slug | Label | Was |
| ---: | --- | --- | ---: |
| 109 | `protection` | Protection & Refuge | 108 |
| 99 | `general` | General Supplications | 81 |
| 60 | `prayer` | Prayer (Salah) | 60 |
| 41 | `forgiveness` | Forgiveness & Repentance | 34 |
| 26 | `morning-evening` | Morning & Evening | 24 |
| 20 | `sleep-waking` | Sleep & Waking | 18 |
| 20 | `distress` | Distress & Anxiety | 15 |
| 20 | `funeral-illness` | Illness, Death & Funeral | 16 |
| 19 | `travel` | Travel | 14 |
| 17 | `family-children` | Family & Children | 15 |
| 16 | `praise-dhikr` | Praise & Remembrance | 15 |
| 12 | `weather-nature` | Weather & Nature | 15 |
| 11 | `social` | Greetings & Social | 9 |
| 10 | `home-clothing` | Home & Clothing | 25 |
| 8 | `food-drink` | Food & Drink | 31 |
| 5 | `guidance` | Guidance & Seeking Good | 6 |
| 5 | `hajj-umrah` | Hajj & Umrah | 9 |
| 4 | `fasting` | Fasting & Ramadan | 4 |
| 2 | `quran-recitation` | Qur'an & Recitation | 2 |
| 2 | `provision` | Provision & Wellbeing | 5 |

`food-drink` (−23) and `home-clothing` (−15) shed entries that were never theirs.
`hajj-umrah` (−4) lost four duas that name a *journey*, not the pilgrimage — they are
travel duas and moved there. `general` (+18) grew because the rules refuse to force an
entry into a bucket on a weak keyword; the corpus already states that is the intended
behaviour of the fallback.

**Open, not a blocker:** `provision` and `quran-recitation` now have 2 duas each and
`fasting` 4. Those landing pages are thin. Worth deciding later whether to `noindex` them,
fold them into a parent, or leave them — flagging rather than acting.

## Appendix B — all 10 sources

| Count | Slug | Label |
| ---: | --- | --- |
| 187 | `hisn` | Hisn al-Muslim |
| 99 | `quran` | The Qur'an |
| 54 | `tirmidhi` | Jami at-Tirmidhi |
| 45 | `dua-dhikr` | dua-dhikr collection |
| 36 | `nasai` | Sunan an-Nasa'i |
| 22 | `muslim` | Sahih Muslim |
| 21 | `abudawud` | Sunan Abi Dawud |
| 20 | `ibnmajah` | Sunan Ibn Majah |
| 15 | `other` | Other source |
| 7 | `bukhari` | Sahih al-Bukhari |

## Appendix C — all 132 chapters

`page?` = would get a static URL under the §5 threshold (≥ 3 duas).

| Count | page? | Slug (as stored) | Label | Collection(s) |
| ---: | :---: | --- | --- | --- |
| 99 | ✅ | `quranic-supplications` | Qur'anic supplications | The Qur'an |
| 53 | ✅ | `chapters-on-supplication-kitab-al-daawat` | Chapters on Supplication (Kitab al-Da'awat) | Jami at-Tirmidhi |
| 36 | ✅ | `seeking-refuge-with-allah-kitab-al-istiadha` | Seeking Refuge with Allah (Kitab al-Isti'adha) | Sunan an-Nasa'i |
| 24 | ✅ | `words-of-remembrance-for-morning-and-evening` | Words of remembrance for morning and evening | Other source, Hisn al-Muslim, dua-dhikr collection |
| 22 | ✅ | `remembrance-supplication-kitab-al-dhikr-wal-dua` | Remembrance & Supplication (Kitab al-Dhikr wa'l-Du'a) | Sahih Muslim |
| 21 | ✅ | `supplications-in-the-witr-prayer-kitab-al-witr` | Supplications in the Witr Prayer (Kitab al-Witr) | Sunan Abi Dawud |
| 20 | ✅ | `supplication-kitab-al-dua` | Supplication (Kitab al-Du'a) | Sunan Ibn Majah |
| 12 | ✅ | `the-excellence-of-remembering-allah` | The excellence of remembering Allah | Hisn al-Muslim, Other source |
| 11 | ✅ | `invocations-after-the-final-tash-ahhud-and-before-ending-the` ⚠ | Invocations after the final Tash-ahhud and before ending the prayer | Hisn al-Muslim, Other source |
| 11 | ✅ | `what-to-say-before-sleeping` | What to say before sleeping | Other source, Hisn al-Muslim, dua-dhikr collection |
| 8 | ✅ | `what-to-say-after-completing-the-prayer` | What to say after completing the prayer | Hisn al-Muslim, dua-dhikr collection, Other source |
| 7 | ✅ | `invocations-during-sujood` | Invocations during Sujood | Hisn al-Muslim, Other source |
| 7 | ✅ | `invocations-kitab-al-daawat` | Invocations (Kitab al-Da'awat) | Sahih al-Bukhari |
| 6 | ✅ | `invocations-for-the-beginning-of-the-prayer` | Invocations for the beginning of the prayer | Hisn al-Muslim |
| 5 | ✅ | `invocations-during-ruki-bowing-in-prayer` | Invocations during Ruki' (bowing in prayer) | Hisn al-Muslim |
| 4 | ✅ | `invocations-for-anguish` | Invocations for anguish | Hisn al-Muslim |
| 4 | ✅ | `invocations-for-the-dead-in-the-funeral-prayer` | Invocations for the dead in the Funeral prayer | Hisn al-Muslim, Other source |
| 4 | ✅ | `repentance-and-seeking-forgiveness` | Repentance and seeking forgiveness | Hisn al-Muslim |
| 4 | ✅ | `supplications-for-when-you-wake-up` | supplications for when you wake up | dua-dhikr collection, Hisn al-Muslim, Other source |
| 4 | ✅ | `what-to-say-upon-hearing-the-athan-call-to-prayer` | What to say upon hearing the Athan (call to prayer) | Hisn al-Muslim |
| 3 | ✅ | `invocations-against-the-devil-and-his-promptings` | Invocations against the Devil and his promptings | Hisn al-Muslim |
| 3 | ✅ | `invocations-for-qunut-in-the-witr-prayer` | Invocations for Qunut in the Witr prayer | Hisn al-Muslim |
| 3 | ✅ | `invocations-for-rising-from-the-ruki` | Invocations for rising from the Ruki' | Hisn al-Muslim |
| 3 | ✅ | `invocations-for-when-you-meet-an-adversary-or-a-powerful-rul` ⚠ | Invocations for when you meet an adversary or a powerful ruler. | Hisn al-Muslim |
| 3 | ✅ | `invocations-of-the-terminal-ill` | Invocations of the terminal ill | Hisn al-Muslim |
| 3 | ✅ | `some-invocations-for-rain` | Some invocations for rain | Hisn al-Muslim |
| 3 | ✅ | `what-to-say-upon-completing-ablution` | What to say upon completing ablution | Hisn al-Muslim |
| 2 | — | `how-to-recite-blessings-on-the-prophet-after-the-tashahhud` ⚠ | How to recite blessings on the Prophet after the Tashahhud | Hisn al-Muslim |
| 2 | — | `invocations-after-eating` | Invocations after eating | dua-dhikr collection, Hisn al-Muslim |
| 2 | — | `invocations-against-the-oppression-of-rulers` | Invocations against the oppression of rulers | Hisn al-Muslim |
| 2 | — | `invocations-before-eating` | Invocations before eating | Hisn al-Muslim |
| 2 | — | `invocations-for-a-child-in-the-funeral-prayer` | Invocations for a child in the Funeral prayer | Hisn al-Muslim |
| 2 | — | `invocations-for-breaking-the-fast` | Invocations for breaking the fast | dua-dhikr collection, Hisn al-Muslim |
| 2 | — | `invocations-for-if-you-are-stricken-by-in-your-faith` | Invocations for if you are stricken by in your faith | Hisn al-Muslim |
| 2 | — | `invocations-for-sitting-between-two-prostrations` | Invocations for sitting between two prostrations | Hisn al-Muslim |
| 2 | — | `invocations-for-someone-who-has-put-on-new-clothes` | Invocations for someone who has put on new clothes | Hisn al-Muslim |
| 2 | — | `invocations-for-the-setting-of-a-debt` | Invocations for the setting of a debt | dua-dhikr collection, Hisn al-Muslim |
| 2 | — | `invocations-for-visiting-the-sick` | Invocations for visiting the sick | Hisn al-Muslim |
| 2 | — | `invocations-for-when-the-wind-blows` | Invocations for when the wind blows | dua-dhikr collection, Other source |
| 2 | — | `invocations-in-times-of-worry-and-grief` | Invocations in times of worry and grief | Hisn al-Muslim |
| 2 | — | `supplications-for-prostrating-due-to-recitation-of-the-quran` ⚠ | Supplications for prostrating due to recitation of the Qur'an | Hisn al-Muslim |
| 2 | — | `the-residents-invocations-for-the-traveler` | The resident's invocations for the traveler | dua-dhikr collection |
| 2 | — | `what-to-do-if-you-have-a-bad-dream-or-nightmare` | What to do if you have a bad dream or nightmare | Hisn al-Muslim |
| 2 | — | `what-to-say-when-leaving-the-home` | What to say when leaving the home | dua-dhikr collection |
| 2 | — | `what-to-say-when-surprised-or-startled` | What to say when surprised or startled | dua-dhikr collection |
| 1 | — | `a-dinner-guests-invocation-for-his-host` | A dinner guest's invocation for his host | Hisn al-Muslim |
| 1 | — | `congratulations-for-new-parents-and-how-they-should-respond` ⚠ | Congratulations for new parents and how they should respond | Hisn al-Muslim |
| 1 | — | `glorifying-and-magnifying-allah-on-the-journey` | Glorifying and magnifying Allah on the journey | Hisn al-Muslim |
| 1 | — | `how-a-muslim-should-praise-another-muslim` | How a Muslim should praise another Muslim | Hisn al-Muslim |
| 1 | — | `how-to-reply-to-a-disbeliever-if-he-says-salam-to-you` | How to reply to a disbeliever if he says Salam to you | Hisn al-Muslim |
| 1 | — | `how-to-seek-allahs-protection-for-children` | How to seek Allah's protection for children | Hisn al-Muslim |
| 1 | — | `invocation-against-an-enemy` | Invocation against an enemy | Hisn al-Muslim |
| 1 | — | `invocation-against-evil-portent` | Invocation against evil portent | Hisn al-Muslim |
| 1 | — | `invocation-for-a-family-who-invites-you-to-break-your-fast-w` ⚠ | Invocation for a family who invites you to break your fast with them | Hisn al-Muslim |
| 1 | — | `invocation-for-a-layover-stopping-along-the-way-on-the-journ` ⚠ | Invocation for a layover (stopping along the way) on the journey | dua-dhikr collection |
| 1 | — | `invocation-for-allahs-protection-from-the-false-messiah` | Invocation for Allah's protection from the False Messiah | Hisn al-Muslim |
| 1 | — | `invocation-for-anger` | Invocation for anger | Hisn al-Muslim |
| 1 | — | `invocation-for-at-tashahhud-sitting-in-prayer` | Invocation for At-Tashahhud (sitting in prayer) | Other source |
| 1 | — | `invocation-for-closing-the-eyes-of-the-dead` | Invocation for closing the eyes of the dead | Hisn al-Muslim |
| 1 | — | `invocation-for-entering-a-market` | Invocation for entering a market | Hisn al-Muslim |
| 1 | — | `invocation-for-entering-a-town-or-city` | Invocation for entering a town or city | Hisn al-Muslim |
| 1 | — | `invocation-for-entering-the-mosque` | Invocation for entering the mosque | Hisn al-Muslim |
| 1 | — | `invocation-for-entering-the-restroom` | Invocation for entering the restroom | Hisn al-Muslim |
| 1 | — | `invocation-for-fear-of-shirk` | Invocation for fear of Shirk | Hisn al-Muslim |
| 1 | — | `invocation-for-going-to-the-mosque` | Invocation for going to the mosque | Hisn al-Muslim |
| 1 | — | `invocation-for-leaving-the-mosque` | Invocation for leaving the mosque | Hisn al-Muslim |
| 1 | — | `invocation-for-leaving-the-restroom` | Invocation for leaving the restroom | dua-dhikr collection |
| 1 | — | `invocation-for-riding-in-a-vehicle-or-on-an-animal` | Invocation for riding in a vehicle or on an animal | Hisn al-Muslim |
| 1 | — | `invocation-for-sighting-the-new-moon` | Invocation for sighting the new moon | Hisn al-Muslim |
| 1 | — | `invocation-for-sneezing` | Invocation for sneezing | Hisn al-Muslim |
| 1 | — | `invocation-for-someone-who-does-good-to-you` | Invocation for someone who does good to you | Hisn al-Muslim |
| 1 | — | `invocation-for-someone-who-gives-you-drink-or-offers-it-to-y` ⚠ | Invocation for someone who gives you drink or offers it to you | Hisn al-Muslim |
| 1 | — | `invocation-for-someone-who-offers-you-a-share-of-his-wealth` ⚠ | Invocation for someone who offers you a share of his wealth | Hisn al-Muslim |
| 1 | — | `invocation-for-someone-who-tells-you-i-love-you-for-the-sake` ⚠ | Invocation for someone who tells you I love you for the sake of Allah | Hisn al-Muslim |
| 1 | — | `invocation-for-someone-who-tells-you-may-allah-bless-you` | Invocation for someone who tells you: May Allah bless you | Hisn al-Muslim |
| 1 | — | `invocation-for-someone-you-have-spoken-ill-to` | Invocation for someone you have spoken ill to | Hisn al-Muslim |
| 1 | — | `invocation-for-the-bereaved` | Invocation for the bereaved | Hisn al-Muslim |
| 1 | — | `invocation-for-the-groom` | Invocation for the groom | Hisn al-Muslim |
| 1 | — | `invocation-for-the-withholding-of-the-rain` | Invocation for the withholding of the rain | dua-dhikr collection |
| 1 | — | `invocation-for-traveling` | Invocation for traveling | Hisn al-Muslim |
| 1 | — | `invocation-for-visiting-the-graves` | Invocation for visiting the graves | Hisn al-Muslim |
| 1 | — | `invocation-for-when-it-rains` | Invocation for when it rains | dua-dhikr collection |
| 1 | — | `invocation-for-when-it-thunder` | Invocation for when it thunder | Hisn al-Muslim |
| 1 | — | `invocation-for-when-something-you-dislike-happens-or-for-whe` ⚠ | Invocation for when something you dislike happens, or for when you fail to achieve what you attempt to do | Hisn al-Muslim |
| 1 | — | `invocation-for-when-tragedy-strikes` | Invocation for when tragedy strikes | dua-dhikr collection |
| 1 | — | `invocation-for-when-you-find-something-becoming-difficult-fo` ⚠ | Invocation for when you find something becoming difficult for you | dua-dhikr collection |
| 1 | — | `invocation-for-when-you-see-the-first-dates-of-the-season` ⚠ | Invocation for when you see the first dates of the season | Hisn al-Muslim |
| 1 | — | `invocation-for-when-your-vehicle-or-mount-begins-to-fail` | Invocation for when your vehicle or mount begins to fail | dua-dhikr collection |
| 1 | — | `invocation-to-be-recited-after-burying-the-dead` | Invocation to be recited after burying the dead | Hisn al-Muslim |
| 1 | — | `invocation-to-be-recited-before-intercourse` | Invocation to be recited before intercourse | Hisn al-Muslim |
| 1 | — | `invocation-to-be-recited-between-the-yemenite-corner-and-the` ⚠ | Invocation to be recited between the Yemenite Corner and the Black Stone | dua-dhikr collection |
| 1 | — | `invocation-to-be-recited-on-the-day-of-arafat` | Invocation to be recited on the Day of Arafat | Hisn al-Muslim |
| 1 | — | `invocation-to-be-recited-when-placing-the-dead-in-his-grave` ⚠ | Invocation to be recited when placing the dead in his grave | Hisn al-Muslim |
| 1 | — | `invocation-to-be-recited-while-standing-at-safa-and-marwah` ⚠ | Invocation to be recited while standing at Safa and Marwah | Hisn al-Muslim |
| 1 | — | `invocation-to-say-if-you-stir-in-the-night` | Invocation to say if you stir in the night | Hisn al-Muslim |
| 1 | — | `invocation-upon-hearing-a-dog-barking-in-the-night` | Invocation upon hearing a dog barking in the night | Hisn al-Muslim |
| 1 | — | `invocation-upon-hearing-the-cocks-crow-or-the-bray-of-a-donk` ⚠ | Invocation upon hearing the cock's crow or the bray of a donkey | Hisn al-Muslim |
| 1 | — | `invocation-upon-receipt-of-the-loan-for-someone-who-lends-yo` ⚠ | Invocation (upon receipt of the loan) for someone who lends you money | Hisn al-Muslim |
| 1 | — | `invocation-when-getting-dressed` | Invocation when getting dressed | dua-dhikr collection |
| 1 | — | `invocation-when-putting-on-new-clothes` | Invocation when putting on new clothes | dua-dhikr collection |
| 1 | — | `istikharah-seeking-allahs-counsel` | Istikharah (seeking Allah's Counsel) | Hisn al-Muslim |
| 1 | — | `saying-allahu-akbar-when-passing-the-black-stone` | Saying Allahu Akbar when passing the Black Stone | Hisn al-Muslim |
| 1 | — | `spreading-the-greetings-of-salam-peace` | spreading the greetings of Salam (Peace) | Hisn al-Muslim |
| 1 | — | `supplication-after-it-rains` | Supplication after it rains | dua-dhikr collection |
| 1 | — | `the-book-on-al-witr-kitab-al-witr` | The Book on Al-Witr (Kitab al-Witr) | Jami at-Tirmidhi |
| 1 | — | `the-expiation-of-assembly-kaffaratul-majlis` | The Expiation of Assembly - Kaffaratul-Majlis | Hisn al-Muslim |
| 1 | — | `the-grooms-supplication-on-the-wedding-night-or-when-buying-` ⚠ | The groom’s supplication on the wedding night or when buying an animal | Hisn al-Muslim |
| 1 | — | `the-pilgrims-announcement-of-his-arrival-for-hajj-or-umrah` ⚠ | The pilgrim's announcement of his arrival for Hajj or Umrah | Other source |
| 1 | — | `the-travelers-invocation-at-dawn` | The traveler's invocation at dawn | Hisn al-Muslim |
| 1 | — | `the-travelers-invocation-for-the-one-he-leaves-behind` | The traveler's invocation for the one he leaves behind | Hisn al-Muslim |
| 1 | — | `types-of-goodness-and-good-etiquette-for-community-life` | Types of goodness and good etiquette for community life | Hisn al-Muslim |
| 1 | — | `vocation-for-someone-who-says-may-allah-forgive-you` | vocation for someone who says: May Allah forgive you | Hisn al-Muslim |
| 1 | — | `what-a-muslim-should-say-when-he-is-praised` | What a Muslim should say when he is praised | Hisn al-Muslim |
| 1 | — | `what-to-encourage-the-dying-person-to-say` | What to encourage the dying person to say | Hisn al-Muslim |
| 1 | — | `what-to-say-and-do-if-you-commit-a-sin` | What to say and do if you commit a sin | Hisn al-Muslim |
| 1 | — | `what-to-say-before-performing-ablution` | What to say before performing ablution | dua-dhikr collection |
| 1 | — | `what-to-say-if-something-happens-to-please-you-or-to-displea` ⚠ | What to say if something happens to please you or to displease you | Hisn al-Muslim |
| 1 | — | `what-to-say-if-you-are-afraid-to-go-to-sleep-or-feel-lonely-` ⚠ | What to say if you are afraid to go to sleep or feel lonely and depressed | Hisn al-Muslim |
| 1 | — | `what-to-say-if-you-fear-people-may-harm-you` | What to say if you fear people may harm you | Hisn al-Muslim |
| 1 | — | `what-to-say-if-you-see-someone-afflicted-by-misfortune` | What to say if you see someone afflicted by misfortune | Hisn al-Muslim |
| 1 | — | `what-to-say-immediately-following-the-witr-prayer` | What to say immediately following the Witr prayer | Hisn al-Muslim |
| 1 | — | `what-to-say-to-foil-the-devils-plots` | What to say to foil the devil's plots | Hisn al-Muslim |
| 1 | — | `what-to-say-to-the-disbeliever-if-he-sneezes-and-praises-all` ⚠ | What to say to the disbeliever if he sneezes and praises Allah | dua-dhikr collection |
| 1 | — | `what-to-say-upon-returning-from-a-journey` | What to say upon returning from a Journey | Hisn al-Muslim |
| 1 | — | `what-to-say-when-entering-the-home` | What to say when entering the home | Hisn al-Muslim |
| 1 | — | `what-to-say-when-slaughtering-or-sacrificing-an-animal` | What to say when slaughtering or sacrificing an animal | Hisn al-Muslim |
| 1 | — | `what-to-say-when-undressing` | What to say when undressing | dua-dhikr collection |
| 1 | — | `what-to-say-when-you-are-fasting-and-someone-is-rude-to-you` ⚠ | What to say when you are fasting and someone is rude to you | Hisn al-Muslim |
| 1 | — | `what-to-say-when-you-fear-you-may-afflict-something-with-the` ⚠ | What to say when you fear you may afflict something with the evil eye | Hisn al-Muslim |
| 1 | — | `what-to-say-when-you-feel-a-pain-in-your-body` | What to say when you feel a pain in your body | Hisn al-Muslim |
| 1 | — | `what-to-say-when-you-feel-frightened` | What to say when you feel frightened | Hisn al-Muslim |
| 1 | — | `what-to-say-while-sitting-in-an-assembly` | What to say while sitting in an assembly | Hisn al-Muslim |

⚠ = slug is truncated mid-word at ~60 chars (§3.4).

Totals: 132 chapters, 27 would get a page, 105 stay JS-filter only.
