# Knowledge Hub — Functional Document v2.0

> Maintained by: IslamicInfo founding team
> Version: 2.0 — merged and improved from v1.0 + external review
> Created: 2026-05-17
> Applies to: `knowledge-hub.html` and all child pages:
>   `/articles/{slug}.html` · `/cluster/{slug}.html` · `/search.html` · `/trending.html` · `/scholars/{slug}.html` · `/start-here.html`
> Design system: CLAUDE.md v3.0
> Sister pages: Islamic Studies (`islamic-studies.html`) · Quran Explorer · Hadith Library · Verify

---

## 1. Product Overview

The Knowledge Hub is IslamicInfo's **free Islamic encyclopedia** — a premium, trust-focused discovery layer sitting at the centre of the IslamicInfo platform. It gives users 2,400+ source-verified articles across every domain of Islamic knowledge: Qur'an, Hadith, Fiqh, History, Theology, Spirituality, and modern Muslim life.

The tone is educational, premium, and trust-first. Every article cites a recognized scholar or primary source. No fatwas. No anonymous opinions. No ads. The repeated emphasis on source verification, scholarly references, and free access is a deliberate brand promise — not just a style choice.

The page also functions as the **central discovery gateway** to the entire IslamicInfo platform. It pushes users into the Quran Explorer, Hadith Library, Islamic Studies, Daily Duas, Tools, Verify, and the Habit Tracker through editorial links, cross-link portal cards, footer navigation, and contextual article CTAs.

**Critical distinction from Islamic Studies:**

| | Knowledge Hub | Islamic Studies |
|---|---|---|
| **Mental model** | Library · Encyclopedia | School · Madrasa |
| **User intent** | "I want to read about X right now" | "Teach me Islam step by step" |
| **Navigation** | Free-form — any article, any order | Sequential — prerequisites enforced |
| **Content type** | 2,400+ standalone articles, FAQs, clusters | 152 lessons that link OUT to KH |
| **Article grids** | ✅ Yes — core feature | ❌ Never — belongs only in KH |
| **Progress tracking** | ❌ No | ✅ Yes — per lesson and pathway |
| **Cross-link direction** | Links back to IS for structured learning | Lessons link OUT to KH for reading |

> **Absolute rule:** Knowledge Hub must NEVER contain lesson prerequisites, progress bars, or lock/unlock mechanics. Islamic Studies must NEVER contain article browse grids. These are two distinct products sharing a design system.

---

## 2. Primary User Goals

1. **Search any Islamic question** and get a sourced, scholarly answer immediately — from the hero bar or header popup.
2. **Browse freely** by topic cluster (Five Pillars, Fiqh, History, etc.) without any fixed reading sequence.
3. **Read a full article** with Arabic text, English translation, inline scholar citations, and a source list.
4. **Discover trending content** — the most-searched Islamic questions globally, ranked by monthly search volume.
5. **Find quick answers** in the FAQ block without reading a full article.
6. **Share or bookmark** an article for later reading or social sharing.
7. **Enter the platform** through the featured, latest, or trending sections as an entry point to deeper tools.
8. **Begin a guided path** if new to Islam — email capture + beginner reading sequence.

---

## 3. Target Users

| Audience | What they need | Where they enter |
|---|---|---|
| Muslims seeking reliable answers | Source-cited answers to fiqh, aqidah, and practice questions | Search bar, trending section, FAQ |
| Students of Islamic studies | Deep explainers and scholarly references | Cluster grid, featured articles |
| Converts and new Muslims | Welcoming, jargon-free starting points | "New to Islam?" section, Start Here path |
| General readers / curious non-Muslims | Neutral, well-sourced introductions to Islam | Hero tags, FAQ, trending |
| Global Muslim communities | Content calibrated to regional madhabs and practices | Regions section, multilingual articles |
| Islamic educators and researchers | Scholar-sourced articles with full bibliography | Article detail pages, scholar spotlight |

---

## 4. Page Architecture — Full Section Order

The page is a single long-scroll experience. Sections appear in this exact order:

| # | Section | Purpose |
|---|---|---|
| 1 | Global header | Sticky nav, search, theme toggle, mobile menu |
| 2 | Hero | Primary message, search bar, trending tags |
| 3 | Live ticker | Real-time trending signal, brand energy |
| 4 | Stats strip | Trust signal — article count, scholars, countries, no ads |
| 5 | Featured Articles | Editorial picks — 1 main + 4 side cards |
| 6 | 8 Cluster Grid | Primary topic navigation — entry points to all content |
| 7 | Trending Now | 8 highest-traffic articles with search volumes |
| 8 | FAQ Block | People Also Ask / Featured Snippet targets |
| 9 | Latest Articles | 6 newest publications |
| 10 | Scholar Spotlight | Credibility signal — classical authority references |
| 11 | Cross-Link Portals | Platform gateway — Quran · Hadith · Verify |
| 12 | Global Regions | Trust + reach signal — 180+ countries |
| 13 | New to Islam | Onboarding + email capture for new visitors |
| 14 | CTA section | Final conversion — "Explore the Hub" + IS link |
| 15 | Global footer | Navigation, ecosystem, legal |

---

## 5. Global Header

### 5.1 Layout
Logo (far-left) · Navigation (centre, all 10 items) · Tools (far-right: search · EN · theme toggle · hamburger)

All 10 nav items per CLAUDE.md §4.1:
Home · Quran Explorer · Hadith Library · Islamic Studies · **Knowledge Hub** (active) · Daily Duas · Tools · Habit Tracker · Verify · About

### 5.2 Header Search Popup
- Opens on search icon click
- Placeholder: "Search articles, topics, questions…"
- Input `id="searchPopupInput"` · search button below
- Clicking Search → `/search.html?q={encoded-query}`
- Closes on: clicking outside · pressing Escape · clicking search button
- Dark mode: dark glass background, teal border

### 5.3 Scroll Behaviour
- Header becomes sticky immediately (position: sticky; top: 0)
- After 16px scroll: `.scrolled` class added → box-shadow intensifies
- On scroll back to top: `.scrolled` removed

### 5.4 Theme Toggle
- Button `id="themeBtn"` — sun icon (dark mode) / moon icon (light mode)
- Reads and writes to `localStorage` key `islamicinfo-theme`
- Applies `data-theme="dark"` or `data-theme="light"` on `<html>`
- Default: light

### 5.5 Mobile Menu
- Hamburger button visible at ≤ 760px
- Opens full-screen dark overlay (`.mobile-menu.open`)
- All 10 nav links in Cormorant Garamond 18px
- `openMM()` / `closeMM()` JS functions
- Closes on: link click · Escape key · close button

---

## 6. Hero Section

### 6.1 Content (Frozen — Do Not Change Without Instruction)
- **Bismillah** `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ` — teal gradient (light) / gold gradient + glow (dark), per CLAUDE.md §5
- **Badge:** "Islamic Knowledge Hub · Est. 2026" with gold pulse dot
- **H1:** "Every Question. / *Every Answer. Verified.*" — gradient-italic on second line
- **Subtitle:** "The world's most comprehensive source-verified Islamic knowledge base. Explore thousands of articles across Qur'an, Hadith, Fiqh, History, and modern Muslim life — all referenced, ranked by scholars, free forever."
- **Hero search bar** — full-width pill
- **7 trending tags** — clickable chips

### 6.2 Hero Search Behaviour
- **Pill layout:** search icon · `<input>` · "Search Hub" button
- Input focus: border turns teal, 4px teal glow ring
- Pressing Enter or clicking "Search Hub" → `/search.html?q={encoded-query}`
- Topic chips below can populate the search input (clicking chip = sets input value and submits)

### 6.3 Trending Tags — Complete Route Table

| Tag | Target URL |
|---|---|
| What is Zakat? | `/articles/what-is-zakat.html` |
| 99 Names of Allah | `/articles/99-names-of-allah.html` |
| Pillars of Islam | `/articles/five-pillars-of-islam.html` |
| Is music haram? | `/articles/is-music-haram-islam.html` |
| Prophet Muhammad ﷺ | `/articles/prophet-muhammad-biography.html` |
| Day of Judgment | `/articles/day-of-judgment-signs.html` |
| Ramadan guide | `/articles/ramadan-complete-guide.html` |

**Behaviour on click:** navigates directly to the article. Does not pass through search.

### 6.4 Floating Geo Decorators
Four floating SVG shapes (`.geo.g1` through `.g4`) animate with `geoFloat` keyframe. Light teal and gold stroke, 50% opacity. Do not remove.

---

## 7. Live Ticker

### 7.1 Purpose
A dark teal scrolling strip below the hero. Communicates "this is a living, active knowledge base" to new visitors and signals editorial activity to search engines.

### 7.2 Behaviour
- Scrolls right-to-left continuously (`tickerScroll` keyframe, 40s, linear, infinite)
- **Pauses on hover** (`animation-play-state: paused`)
- Content is duplicated (first and second half identical) for seamless infinite loop

### 7.3 Ticker Items — Initial Set (Update Weekly)
Each item links to its article. Items currently display-only — must be wired as links.

| Item | Target URL |
|---|---|
| What are the 99 Names of Allah? | `/articles/99-names-of-allah.html` |
| How many times is prayer mentioned in the Quran? | `/articles/how-many-times-prayer-in-quran.html` |
| The Four Schools of Islamic Law — Compared | `/articles/four-schools-of-islamic-law.html` |
| What did Ibn Khaldun say about civilization? | `/articles/ibn-khaldun-civilization.html` |
| Zakat al-Fitr vs Zakat al-Mal — Key Differences | `/articles/zakat-al-fitr-vs-zakat-al-mal.html` |
| The Night of Qadr: What Scholars Agree On | `/articles/night-of-qadr.html` |
| Understanding Tawakkul: Complete Guide | `/articles/tawakkul-trusting-allah.html` |
| Islamic Finance — Halal Investment Principles | `/articles/islamic-finance-halal-transaction.html` |

---

## 8. Stats Strip

Five stat cells. Each shows a number that counts up when it enters the viewport (IntersectionObserver + count-up animation). Numbers are currently static — wire count-up on build.

| Stat | Display Value | Type |
|---|---|---|
| Articles | 2,400+ | Count-up from 0 |
| Topic Clusters | 8 | Count-up from 0 |
| Scholar Sources | 47+ | Count-up from 0 |
| Countries Reached | 180+ | Count-up from 0 |
| Ads. Fatwas. Bias. | 0 | Fixed — always 0, brand statement |

The fifth stat ("0 Ads. Fatwas. Bias.") is a permanent brand statement. It never changes and is not a real metric.

Each stat cell has a subtle hover background. No link targets — display only.

---

## 9. Featured Articles Section

### 9.1 Section Header
- Eyebrow: "✦ Editor's Picks"
- Title: "Featured This Week"
- Sub: "Our most thoroughly researched and widely read articles, selected by the editorial team."

### 9.2 Layout
- 1.5fr left column: **main feature card**
- 1fr right column: **4 side cards** stacked

### 9.3 Main Feature Card — "99 Names of Allah"
- Background: dark teal gradient + Islamic geometric ornament overlay + Arabic "الأسماء الحسنى" as ghost text
- Top-left: reading time badge ("12 min read")
- Top-right: category badge ("Faith & Theology" — gold)
- Title: "The 99 Names of Allah: A Complete Guide with Arabic, Meaning & Scholarly Commentary"
- Excerpt: 2-line scholarly description
- Footer: author attribution ("IslamicInfo Editorial · 3 sources cited") + **"Read full article →"** link
- **"Read full article →" → `/articles/99-names-of-allah.html`**
- Hover: `translateY(-5px) scale(1.008)` + teal glow

### 9.4 Side Card Stack — Complete Route Table

| Title | Category | Reading Time | Sources | Target URL |
|---|---|---|---|---|
| The Golden Age of Islam: A Chronological Overview | Islamic History | 9 min | 5 | `/articles/golden-age-of-islam.html` |
| Halal & Haram: The Complete Framework Explained | Islamic Law · Fiqh | 14 min | 7 | `/articles/halal-haram-framework.html` |
| Tawakkul: The Art of Trusting Allah Completely | Spirituality | 7 min | 4 | `/articles/tawakkul-trusting-allah.html` |
| The Complete Ramadan Guide: Fasting, Prayer & Purpose | Worship & Practice | 18 min | 8 | `/articles/ramadan-complete-guide.html` |

**Clicking anywhere on a side card navigates to the article URL.** The icon animates (scale + rotate) on hover.

---

## 10. 8 Cluster Grid

The cluster grid is the **primary navigation architecture** of the Knowledge Hub. Each card represents one of the eight knowledge pillars. Clicking a card takes the user to a full cluster landing page with all articles in that topic.

### 10.1 Functional Requirement (Critical)
**Every cluster card must navigate to its cluster landing page.** The current `onclick="filterCluster('pillars')"` is a placeholder and must be replaced with `location.href='/cluster/{slug}.html'`.

The article count shown on each card (e.g. "342 articles") is not decorative — it means that cluster landing page contains exactly that many articles. The count must stay in sync as articles are published.

### 10.2 Cluster Cards — Complete Spec

| Cluster Name | Icon | Description | Count | Slug | Target URL |
|---|---|---|---|---|---|
| The Five Pillars | 🕋 | Deep explainers on Shahada, Salah, Zakat, Sawm, and Hajj — foundations of Islamic practice | 342 | `five-pillars` | `/cluster/five-pillars.html` |
| Qur'an & Revelation | 📖 | How the Quran was compiled, its structure, names, linguistic miracles, and science of Tafsir | 287 | `quran-revelation` | `/cluster/quran-revelation.html` |
| Prophets & Companions | 🌟 | Biographical accounts, character studies, and scholarly-sourced stories of the prophets and sahabah | 214 | `prophets-companions` | `/cluster/prophets-companions.html` |
| Islamic Law · Fiqh | ⚖️ | Halal & haram, financial ethics, marriage, the four madhabs, and practical rulings explained clearly | 398 | `islamic-law-fiqh` | `/cluster/islamic-law-fiqh.html` |
| Faith & Theology | ✦ | What Muslims believe about Allah, angels, revelation, the prophets, the afterlife, and divine decree | 265 | `faith-theology` | `/cluster/faith-theology.html` |
| Islamic History | 🏛️ | Early Islam, the caliphates, the golden age of scholarship, and the civilizations Islam built | 311 | `islamic-history` | `/cluster/islamic-history.html` |
| Spirituality & Character | 📿 | Akhlaq, ihsan, zuhd, and the inner dimensions of worship — how Islam shapes character | 189 | `spirituality-character` | `/cluster/spirituality-character.html` |
| Islam in Modern Life | 🌍 | Converts, science and Islam, ethical AI, interfaith dialogue, Muslim communities, and contemporary issues | 247 | `islam-modern-life` | `/cluster/islam-modern-life.html` |

### 10.3 Cluster Card Hover Behaviour
- `translateY(-5px) scale(1.012)` + teal glow ring
- `::before` gradient overlay fades in (opacity 0 → 1)
- Icon: `scale(1.12) rotate(-5deg)`
- Arrow (→): slides in from left and becomes visible
- Dark mode: teal glow variant per CLAUDE.md §27.4

### 10.4 Cluster Landing Page Structure (`/cluster/{slug}.html`)

Each cluster page uses the same template:

```
/cluster/{slug}.html
```

**Sections (top to bottom):**
1. Global header — Knowledge Hub active
2. Breadcrumb: Knowledge Hub › {Cluster Name}
3. Cluster hero: large icon · cluster name · Arabic name (Amiri, RTL) · description · article count badge · search bar (pre-filtered to this cluster)
4. Sub-topic filter chips — narrow within cluster (see §10.5)
5. Sort controls: Most Popular · Most Recent · Shortest Read · Longest Read
6. Article grid — 12 cards per page, paginated
7. Load More button or page number pagination
8. Related clusters — 3 cluster cards
9. "Study this systematically →" CTA → Islamic Studies page
10. Global footer

### 10.5 Sub-Topics per Cluster

| Cluster | Sub-Topics |
|---|---|
| Five Pillars | Shahada · Salah · Zakat · Sawm · Hajj |
| Qur'an & Revelation | Compilation history · Tafsir methodology · Linguistic miracles · Structure & Juz' · Quranic sciences |
| Prophets & Companions | Prophet Muhammad ﷺ · Pre-Islamic Prophets · Companions (Sahabah) · Family of the Prophet |
| Islamic Law · Fiqh | Marriage & Family · Islamic Finance · Food & Drink · Prayer rulings · Inheritance · Contemporary issues |
| Faith & Theology | Tawhid (Oneness of Allah) · Angels · Afterlife & Judgment · Divine Decree (Qadar) · 99 Names · Pillars of Iman |
| Islamic History | Early Islam · Rightly-Guided Caliphs · Umayyad & Abbasid era · Golden Age · Crusades · Modern era |
| Spirituality & Character | Ihsan · Tawakkul · Sabr · Tawbah (repentance) · Adab (manners) · Dhikr · Zuhd (asceticism) |
| Islam in Modern Life | Converts & new Muslims · Science & Islam · Interfaith · Muslim communities · Ethical finance · Contemporary fiqh |

---

## 11. Trending Now Section

### 11.1 Purpose
The Trending Now section shows the 8 highest-traffic Islamic articles based on global monthly search volume. The search volumes (142K, 88K, etc.) are real SEO data — they tell users which articles other Muslims and seekers are reading most. This is an editorial credibility and discovery signal.

### 11.2 Complete Trending Route Table

| Rank | Category | Title | Monthly Searches | Target URL |
|---|---|---|---|---|
| 01 | Theology | What are the 99 Names of Allah and what do they mean? | 142K | `/articles/99-names-of-allah.html` |
| 02 | Fiqh | Is music haram in Islam? What do the four schools say? | 88K | `/articles/is-music-haram-islam.html` |
| 03 | Five Pillars | How to calculate Zakat on savings, gold, and investments | 74K | `/articles/how-to-calculate-zakat.html` |
| 04 | Quran | How many surahs and verses are in the Quran? | 61K | `/articles/how-many-surahs-in-quran.html` |
| 05 | Comparisons | Sunni vs Shia: key theological differences explained neutrally | 58K | `/articles/sunni-vs-shia-differences.html` |
| 06 | Worship | How to perform Salah step by step — complete guide | 52K | `/articles/how-to-perform-salah.html` |
| 07 | Modern Life | Islamic mortgage — is it truly halal? Scholars compared | 47K | `/articles/islamic-mortgage-halal.html` |
| 08 | History | Who was Ibn Battuta and why does his journey still matter? | 39K | `/articles/who-was-ibn-battuta.html` |

### 11.3 "See all trending" Link
→ `/trending.html` — a dedicated page showing all trending articles, sortable by: Global · By Region · By Cluster · This Week / This Month

### 11.4 Trend Card Behaviour
- Clicking anywhere on a trend card → its article URL
- Hover: `translateY(-3px)` + teal glow + border-color intensifies
- Large number (01–08) in Cormorant Garamond, very low opacity — visual texture, not navigation

---

## 12. FAQ Block — People Also Ask

### 12.1 Purpose
The FAQ block targets **Google Featured Snippets** and **People Also Ask** boxes. Each question is a high-volume search query. Schema markup (JSON-LD FAQ schema) must be present on this section — without it, the entire SEO purpose of this section fails.

### 12.2 Accordion Behaviour
- `toggleFAQ(this)` called on question click
- `.faq-item.open` class added to open item
- Answer panel: `max-height` transitions 0 → 300px (`.faq-a` block)
- Chevron rotates 180° on open
- Multiple FAQs can be open simultaneously (or configure to close others — either is acceptable)

### 12.3 Complete FAQ Table with Sources and Article Links

| Question | Key Answer | Source | Full Article URL |
|---|---|---|---|
| What are the Five Pillars of Islam? | Shahada, Salah, Zakat, Sawm, Hajj — structural backbone of Muslim life | Sahih al-Bukhari #8 · Hadith of Jibril | `/articles/five-pillars-of-islam.html` |
| How many surahs and verses are in the Quran? | 114 surahs, 6,236 verses (Medinan count), 30 juz' | Al-Itqan fi 'Ulum al-Quran · Imam al-Suyuti | `/articles/how-many-surahs-in-quran.html` |
| What is the difference between Sunni and Shia Islam? | Political succession after Prophet ﷺ — Abu Bakr (Sunni) vs Ali (Shia) | Al-Farq Bayn al-Firaq · al-Baghdadi | `/articles/sunni-vs-shia-differences.html` |
| What does Bismillah mean? | "In the name of Allah, the Most Gracious, the Most Merciful" — opens 113/114 surahs | Tafsir Ibn Kathir · Al-Fatihah commentary | `/articles/what-does-bismillah-mean.html` |
| How is Zakat calculated? What is the nisab? | 2.5% of qualifying wealth above nisab (85g gold or 595g silver) held for one lunar year | Fiqh al-Zakat · Dr. Yusuf al-Qaradawi | `/articles/how-to-calculate-zakat.html` |
| What are the four schools of Islamic law? | Hanafi · Maliki · Shafi'i · Hanbali — all valid, differ in methodology | Al-Fiqh 'ala al-Madhahib al-Arba'ah · al-Jaziri | `/articles/four-schools-of-islamic-law.html` |
| Who was Prophet Muhammad ﷺ and when did he live? | Born 570 CE Makkah, passed 632 CE Madinah — final prophet of Allah | Al-Rahiq al-Makhtum · al-Mubarakpuri | `/articles/prophet-muhammad-biography.html` |
| Is music haram in Islam? | Scholarly disagreement (ikhtilaf) — three distinct positions across madhabs | Ibn al-Qayyim · al-Qaradawi · Combined sources | `/articles/is-music-haram-islam.html` |

### 12.4 Required Addition — "Read Full Article" in Each FAQ Answer
Each FAQ answer must end with: `<a href="{article-url}">Read the full article →</a>`

This drives users from a quick answer into the deep article, increasing page depth and reducing bounce rate.

### 12.5 JSON-LD FAQ Schema (Add to `<head>`)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are the Five Pillars of Islam?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Five Pillars of Islam are: Shahada, Salah, Zakat, Sawm, and Hajj..."
      }
    }
    // ... repeat for all 8 questions
  ]
}
```

---

## 13. Latest Articles Section

### 13.1 Section Header
- Eyebrow: "Fresh Knowledge"
- Title: "Latest Articles"
- Sub: "New additions to the Knowledge Hub — published weekly, source-verified before publication."

### 13.2 Article Card Anatomy
Each card contains:
- **Visual area** — gradient background with Arabic keyword in Amiri font as decoration (e.g. الخلافة, الصبر)
- **Category + date row** — category label · dot separator · publish date
- **Title** (Cormorant Garamond, 16px)
- **Excerpt** — 2–3 sentences
- **Footer** — "Read article →" link (with animated arrow) + reading time

### 13.3 Latest Articles — Complete Route Table

| Title | Category | Arabic Decoration | Date | Reading Time | Target URL |
|---|---|---|---|---|---|
| The Rightly-Guided Caliphs: Abu Bakr to Ali | Islamic History | الخلافة | May 10, 2026 | 11 min | `/articles/rightly-guided-caliphs.html` |
| Sabr: The Quran's Most Repeated Instruction | Spirituality | الصبر | May 8, 2026 | 8 min | `/articles/sabr-patience-in-quran.html` |
| Islamic Finance: What Makes a Transaction Halal? | Fiqh | الفقه | May 6, 2026 | 13 min | `/articles/islamic-finance-halal-transaction.html` |
| How to Take Shahada: A Guide for New Muslims | Modern Life | الدعوة | May 4, 2026 | 9 min | `/articles/how-to-take-shahada.html` |
| Sunnah in Practice: Obligatory vs Recommended | Prophets | السنة | May 2, 2026 | 10 min | `/articles/sunnah-obligatory-vs-recommended.html` |
| Day of Judgment: The Signs and What Islam Teaches | Faith | القيامة | Apr 30, 2026 | 14 min | `/articles/day-of-judgment-signs.html` |

### 13.4 "Read article →" Behaviour
Clicking "Read article →" or anywhere on the card body → article detail page at the target URL. The arrow icon gap widens on hover (transition: gap .2s).

---

## 14. Scholar Spotlight Section

### 14.1 Purpose
The Scholar Spotlight is a **trust and credibility signal** — it shows users that IslamicInfo relies on recognized classical authorities, not anonymous internet opinions. It also signals to Google (E-E-A-T) that the content is authored by qualified experts.

### 14.2 Scholar Cards — Complete Route Table

| Scholar | Arabic Initials | Era | Location | Key Work | Badge | Target URL |
|---|---|---|---|---|---|---|
| Ibn Kathir | إك | 1300–1373 CE | Damascus | Tafsir al-Qur'an al-'Azim | Tafsir | `/scholars/ibn-kathir.html` |
| Imam al-Bukhari | بخ | 810–870 CE | Bukhara | Sahih al-Bukhari | Hadith | `/scholars/al-bukhari.html` |
| Ibn Khaldun | خل | 1332–1406 CE | Tunisia | Muqaddimah | Historian | `/scholars/ibn-khaldun.html` |
| Imam al-Ghazali | غز | 1058–1111 CE | Tus | Ihya' 'Ulum al-Din | Spirituality | `/scholars/al-ghazali.html` |

### 14.3 Scholar Profile Page Structure (`/scholars/{slug}.html`)

```
/scholars/{slug}.html
```

1. Scholar avatar (Arabic initials), full name, dates, location, primary field badge
2. Short biography (3–5 paragraphs, sourced)
3. Major works (title · year · brief description · reading difficulty)
4. Famous quotes or principles (Arabic + English translation + source)
5. Articles on IslamicInfo that cite this scholar (linked list — dynamic)
6. "Study topics in Islamic Studies →" link

---

## 15. Cross-Link Portals

Three large dark cards routing users to the deepest tools on the platform.

| Portal | Icon | Description | Link | Status |
|---|---|---|---|---|
| Quran Explorer | 📖 | 114 surahs, Tafsir, WBW, 50+ reciters, AI explanations | `quran.html` | ✅ Wired |
| Hadith Library | 📜 | 12,000+ hadiths, 9 collections, isnad chains, grade badges | `hadith.html` | ✅ Wired |
| Verify a Source | ✓ | Paste any Islamic claim → instant authenticity rating | `verify.html` | ✅ Wired |

**Portal card hover:** `translateY(-4px)` + colour-matched glow (teal / gold / dark). Entire card is clickable.

**Missing portal — add in next version:** Daily Duas (`dua.html`) and Tools (`tools.html`) should also be represented here as the platform grows.

---

## 16. Global Regions Section

### 16.1 Purpose
Six region cards communicate worldwide reach and multi-community relevance. Tells users "this content is for all Muslims, everywhere" and tells Google that IslamicInfo serves global search intent.

### 16.2 Region Data

| Region | Flag | Content Focus | Monthly Readers |
|---|---|---|---|
| Arabian Peninsula | 🇸🇦 | Fiqh, Hadith, Aqidah | 380K |
| South Asia | 🇵🇦 | Hanafi Fiqh, Sunnah, Urdu content | 510K |
| Southeast Asia | 🇮🇩 | Shafi'i Fiqh, Ramadan, Hajj | 440K |
| North America | 🇺🇸 | Converts, modern life, interfaith | 290K |
| United Kingdom | 🇬🇧 | Islamic finance, ethics, community | 195K |
| Sub-Saharan Africa | 🌍 | Basics of faith, pillars, history | 267K |

Display-only in v1. Future: clicking a region → `/region/{slug}.html` filtered article pages.

---

## 17. New to Islam Section

### 17.1 Purpose
This section onboards first-time visitors — converts, curious neighbours, students, or anyone encountering Islam for the first time. It serves two functions: email list capture and platform orientation.

### 17.2 Layout
Two columns:
- **Left:** Text + email capture form
- **Right:** 3 feature icons with descriptions

### 17.3 Email Capture Form
- Input: `type="email"`, placeholder "Your email address"
- Button: "Get the Guide" → submits to email provider (Mailchimp / ConvertKit / Brevo)
- Success state: input replaced with "✓ Check your inbox! Your first email is on its way."
- Small print: "Free. No spam. Unsubscribe anytime. Your first email arrives in under a minute."
- What the email delivers: 5 beginner articles + link to `/start-here.html`

### 17.4 Three Feature Cards — Route Table

| Feature | Icon | Description | Link |
|---|---|---|---|
| Start with the Foundations | 🕋 | 5 curated beginner articles — who Allah is, what Islam teaches | `/start-here.html#foundations` |
| Common Questions Answered | 📿 | The 20 questions people most commonly ask | `/start-here.html#faq` |
| Source-Verified from Day One | ✓ | Every claim traceable to a recognized classical scholar | `/start-here.html#about` |

### 17.5 Start Here Page (`/start-here.html`)
A dedicated beginner reading path page:
1. Welcome section — warm, jargon-free
2. 5 beginner articles in recommended reading order (sequenced, not locked)
3. 20 common questions (FAQ accordion, same format as hub page)
4. "Ready for more?" → Islamic Studies Beginner pathway link
5. "Browse freely" → Knowledge Hub main page

---

## 18. Search System

### 18.1 Two Search Entry Points
1. **Hero search bar** — primary, large, full-width pill in the hero section
2. **Header popup** — compact, triggered by search icon in top nav

Both route to the same search results page: `/search.html?q={encoded-query}`

### 18.2 Search Results Page (`/search.html`)

**Structure:**
- Search bar (pre-populated with the query, editable)
- Result count: "Showing {N} results for '{query}'"
- Filter chips: All · Five Pillars · Qur'an · Fiqh · History · Theology · Spirituality · Modern Life
- Article results: same card anatomy as Latest Articles (category · title · excerpt · reading time)
- FAQ results: matching FAQ answers shown collapsed (expandable)
- Scholar results: if query matches a scholar name
- **No results state:** "We don't have an article on '{query}' yet. Try browsing [related cluster] or submit your question to [Verify →]."

### 18.3 Hero Search + Topic Chips Interaction
Clicking a topic chip (e.g. "What is Zakat?"):
- Option A (current intent): navigates directly to the article for that chip
- Option B (alternative): populates the search input with the chip text and submits
- **Recommended: Option A** — chips are pre-selected answers, not search queries

---

## 19. Article Detail Pages

Every "Read full article →", "Read article →", trending card, and FAQ "Read full article →" link opens a dedicated article page.

### 19.1 URL Structure
```
/articles/{article-slug}.html
```

### 19.2 Article Detail Page Full Structure

**Document head:**
- Title: `{Article Title} — Knowledge Hub · IslamicInfo`
- Meta description: first 2 sentences of the article
- Article schema (JSON-LD)
- BreadcrumbList schema
- Open Graph tags (for social sharing previews)

**Page layout (desktop: 2-column with sidebar):**

**LEFT MAIN COLUMN (70% width):**
- Breadcrumb: Knowledge Hub › {Cluster Name} › {Article Title}
- Category badge + reading time + publish date + "Updated: {date}" if applicable
- H1 article title (Cormorant Garamond, large)
- Arabic heading or key verse (Amiri, RTL) where relevant, with English translation below
- Author line: "IslamicInfo Editorial · {N} scholar sources cited · Source-verified"
- Share buttons: Copy link · Share image · WhatsApp · X (Twitter)
- **Article body:**
  - Full text in Inter, 16px, line-height 1.75
  - Arabic quotations in Amiri, RTL, with English translation immediately below each
  - Inline citations: `[📚 Source: Scholar name · Book name · Reference]`
  - H2 and H3 section headings (teal left border)
  - Pull quotes in Cormorant Garamond italic, gold left border
  - Definition boxes: teal-tinted background for key Islamic terms
  - Scholarly disagreement boxes: gold-tinted for contested opinions (ikhtilaf)
- Full source bibliography (numbered, at bottom of article)
- Topic chips (clickable → cluster sub-topic filter)
- "Was this article helpful?" thumbs up / thumbs down + comment
- Share strip (repeat of header share row)
- Related articles (3 cards, same cluster)
- "Continue learning" CTA: next recommended article OR matching IS lesson

**RIGHT SIDEBAR (30% width, sticky on scroll):**
- "In this article" — 3–5 bullet summary of key points
- Table of contents — auto-generated from H2/H3 headings, active link highlights on scroll
- Related articles (4 compact cards)
- "Study this topic in Islamic Studies →" link
- "Verify a claim →" link

### 19.3 Article Actions
| Action | Behaviour |
|---|---|
| Copy link | Copies article URL to clipboard → "Link copied ✦" toast |
| Share image | Opens share image modal (same canvas system as Quran and Hadith pages) — square 1:1 + story 9:16, download PNG |
| WhatsApp | `https://wa.me/?text={encoded-title + URL}` |
| X (Twitter) | `https://twitter.com/intent/tweet?text={title}&url={url}` |
| Bookmark | Saves to localStorage under `islamicinfo-kh-bookmarks` |

---

## 20. CTA Section

The standard IslamicInfo dark teal CTA section (CLAUDE.md §11) — always the last section before the footer.

- Badge: "✦ The World's Islamic Knowledge Hub"
- Title: "Every answer you seek. / *Source-verified. Forever free.*"
- Subtitle: Quranic verse (Al-Zumar 39:9) — "Say: Are those who know equal to those who do not know?"
- Two buttons:
  - **Explore the Hub** (`href="#hero"` — scrolls to top) → `.btn-primary`
  - **Islamic Studies →** (`href="islamic-studies.html"`) → `.btn-white-ghost`

> **Fix needed:** Current markup uses `href="learn.html"` — must be changed to `href="islamic-studies.html"` to match the correct file name per CLAUDE.md §27.2.

---

## 21. Complete Navigation and Links Audit

This section lists **every clickable element** on the Knowledge Hub hub page, its current state, and its correct target.

### 21.1 All Links That Must Be Fixed or Built

| Element | Location | Current State | Correct Target | Status |
|---|---|---|---|---|
| All 8 cluster cards | Cluster grid | `filterCluster()` placeholder | `/cluster/{slug}.html` | 🔴 Fix |
| Featured "Read full article →" | Featured section | Unwired | `/articles/99-names-of-allah.html` | 🔴 Fix |
| Side card — Golden Age | Featured side | Unwired | `/articles/golden-age-of-islam.html` | 🔴 Fix |
| Side card — Halal & Haram | Featured side | Unwired | `/articles/halal-haram-framework.html` | 🔴 Fix |
| Side card — Tawakkul | Featured side | Unwired | `/articles/tawakkul-trusting-allah.html` | 🔴 Fix |
| Side card — Ramadan Guide | Featured side | Unwired | `/articles/ramadan-complete-guide.html` | 🔴 Fix |
| Trending card 01 | Trending grid | Unwired | `/articles/99-names-of-allah.html` | 🔴 Fix |
| Trending card 02 | Trending grid | Unwired | `/articles/is-music-haram-islam.html` | 🔴 Fix |
| Trending card 03 | Trending grid | Unwired | `/articles/how-to-calculate-zakat.html` | 🔴 Fix |
| Trending card 04 | Trending grid | Unwired | `/articles/how-many-surahs-in-quran.html` | 🔴 Fix |
| Trending card 05 | Trending grid | Unwired | `/articles/sunni-vs-shia-differences.html` | 🔴 Fix |
| Trending card 06 | Trending grid | Unwired | `/articles/how-to-perform-salah.html` | 🔴 Fix |
| Trending card 07 | Trending grid | Unwired | `/articles/islamic-mortgage-halal.html` | 🔴 Fix |
| Trending card 08 | Trending grid | Unwired | `/articles/who-was-ibn-battuta.html` | 🔴 Fix |
| All 6 latest article cards | Latest section | "Read article" link unwired | `/articles/{slug}.html` | 🔴 Fix |
| Hero tag — What is Zakat? | Hero | Unwired | `/articles/what-is-zakat.html` | 🔴 Fix |
| Hero tag — 99 Names | Hero | Unwired | `/articles/99-names-of-allah.html` | 🔴 Fix |
| Hero tag — Pillars of Islam | Hero | Unwired | `/articles/five-pillars-of-islam.html` | 🔴 Fix |
| Hero tag — Is music haram? | Hero | Unwired | `/articles/is-music-haram-islam.html` | 🔴 Fix |
| Hero tag — Prophet Muhammad ﷺ | Hero | Unwired | `/articles/prophet-muhammad-biography.html` | 🔴 Fix |
| Hero tag — Day of Judgment | Hero | Unwired | `/articles/day-of-judgment-signs.html` | 🔴 Fix |
| Hero tag — Ramadan guide | Hero | Unwired | `/articles/ramadan-complete-guide.html` | 🔴 Fix |
| "See all trending" link | Trending section | `href="#"` | `/trending.html` | 🔴 Fix |
| "Islamic Studies" CTA button | CTA section | `href="learn.html"` | `islamic-studies.html` | 🔴 Fix |
| "Islamic Studies →" footer link | Footer | `href="learn.html"` | `islamic-studies.html` | 🔴 Fix |
| FAQ answer — add "Read full article" | All 8 FAQs | Missing | `/articles/{slug}.html` | 🟠 Add |
| Ticker items | Live ticker | Display only | `/articles/{slug}.html` | 🟠 Add |
| Scholar cards | Scholar section | Display only | `/scholars/{slug}.html` | 🟠 Add |
| Region cards | Regions section | Display only | Future `/region/{slug}.html` | 🟢 Future |
| Email capture "Get the Guide" | New to Islam | No backend | Mailchimp / ConvertKit | 🟠 Wire |
| Hero search submit | Hero | No action | `/search.html?q={query}` | 🔴 Fix |
| Header search submit | Header popup | No action | `/search.html?q={query}` | 🔴 Fix |

---

## 22. New Pages to Build

| Page | URL | Template | Priority |
|---|---|---|---|
| 8 × Cluster landing pages | `/cluster/{slug}.html` | 1 shared template | 🔴 High |
| Article detail pages (initial 20) | `/articles/{slug}.html` | 1 shared template | 🔴 High |
| Search results page | `/search.html` | New | 🔴 High |
| Start Here (beginner path) | `/start-here.html` | New | 🟠 Medium |
| Trending page | `/trending.html` | New | 🟠 Medium |
| Scholar profile pages (4) | `/scholars/{slug}.html` | 1 shared template | 🟠 Medium |
| Region filtered article pages | `/region/{slug}.html` | Cluster template | 🟢 Low/Future |

---

## 23. Technical Notes

### 23.1 Current Implementation
- Static HTML with embedded CSS and JavaScript
- No visible backend framework
- Custom CSS variables (CLAUDE.md §1 token system)
- Responsive grid layouts (CSS Grid + Flexbox)
- Scroll animations via `IntersectionObserver` (`.reveal` class system)
- Client-side JS for: theme toggle, search popup, mobile menu, FAQ accordion, cluster click

### 23.2 Cluster Click Handler — Current vs Required
```javascript
// CURRENT (placeholder — goes nowhere):
onclick="filterCluster('pillars')"

// REQUIRED (navigates to cluster page):
onclick="location.href='/cluster/five-pillars.html'"

// OR better — use an <a> tag instead of onclick:
<a href="/cluster/five-pillars.html" class="cluster-card">...</a>
```

### 23.3 Stats Count-Up Animation (Not Yet Implemented)
```javascript
// Add to IntersectionObserver for .stat-num elements:
function countUp(el, target, duration) {
  const start = 0;
  const step = target / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { el.textContent = target + '+'; clearInterval(timer); }
    else { el.textContent = Math.floor(current); }
  }, 16);
}
```

### 23.4 SEO Schema Markup Required
- **FAQPage schema** on the FAQ block → enables Google People Also Ask
- **Article schema** on each article detail page → enables rich results
- **BreadcrumbList schema** on cluster and article pages → sitelinks
- **Organization schema** on the hub page → brand knowledge panel

---

## 24. Design System Compliance

All components follow CLAUDE.md v3.0:

| Element | Rule |
|---|---|
| Card hover | `translateY(-5px) scale(1.012)` + teal glow ring — NO shimmer sweep |
| Dark mode card hover | `rgba(88,193,199,.18)` teal glow — per CLAUDE.md §27.4 |
| Buttons | `.btn-primary` / `.btn-ghost` / `.btn-white-ghost` — per CLAUDE.md §9 |
| CTA section | Last before footer, dark teal gradient — per CLAUDE.md §11 |
| Footer | `ft-top` / `ft-brand` / `ft-link` / `ft-bot` — per CLAUDE.md §7 |
| Header | `site-header` / `brand` / `nav` / `header-tools` — per CLAUDE.md §4 |
| Reveal animation | `.reveal` + IntersectionObserver, `.reveal-d1` through `.reveal-d4` stagger |
| Colors | All `--teal-*` and `--gold-*` tokens — no raw hex inline |
| Arabic text | Always `font-family: var(--font-arabic)` (Amiri), `direction: rtl` |
| Bismillah | CLAUDE.md §5 standard variant — teal gradient (light) / gold + glow (dark) |

---

## 25. Functional Rules

1. **Every number implying content must link to that content.** "342 articles" means a cluster page with 342 articles exists. No decorative counts.
2. **Every "Read full article" and "Read article →" opens a dedicated article page.** No in-page anchors substituting for article pages.
3. **Hero tags are direct article shortcuts** — not search queries. They navigate to the single best article for that topic.
4. **No fatwa or legal rulings in articles.** Articles explain, contextualize, and present scholarly positions. They do not issue rulings.
5. **Every article must cite a named scholar or primary source.** Anonymous claims are not published.
6. **Cluster article counts must stay in sync.** When new articles are published, the hub page count and cluster page count update together. They are not decorative.
7. **FAQ schema markup is mandatory** — without it the section has no SEO purpose.
8. **No shimmer sweep on any card.** Hover uses CLAUDE.md §27.4 glow ring system only.
9. **Dark mode hover uses teal glow.** `rgba(88,193,199,.18)` — not the light-mode box-shadow.
10. **Knowledge Hub and Islamic Studies must never merge** — they are distinct products with distinct URLs, layouts, and purposes.
11. **`learn.html` is the wrong href.** The correct file for Islamic Studies is `islamic-studies.html` throughout this page and footer.
12. **The ticker must pause on hover.** Users should be able to read a ticker item without it scrolling away.

---

*End of Knowledge Hub Functional Document v2.0*
