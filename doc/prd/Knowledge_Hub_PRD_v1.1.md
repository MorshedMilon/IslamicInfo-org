# Product Requirements Document
## Knowledge Hub — IslamicInfo.org

**Version:** 1.1 — Final  
**Date:** 2026-05-18  
**Page:** `knowledge-hub.html`  
**Status:** ✅ Approved for Development  
**References:** `knowledge-hub.html` (mockup · source of truth), `CLAUDE_v3.md` (design system v3.0), `Knowledge_Hub_Functional_Document_v2.0.md` (functional spec)

---

## Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-05-18 | IslamicInfo Team | Initial PRD generated from functional spec + mockup |
| 1.1 | 2026-05-18 | IslamicInfo Team | **§2** Added baselines, measurement methods, review cadence · **§6** Added US-023 dark mode story, error/loading/404 ACs to US-010 · **§7** Full ASCII wireframes for portals and regions sections · **§9** Added Twitter card tags, og:image spec, sitemap requirements · **§10** All article slugs spelled out explicitly — no cross-references · **§12** Added ticker duplication logic, reveal pattern, email error handling · **§15** New Content Editorial Standards section added · Contradictions fixed (§4 P-level conflict) · OQ-06 closed (answerable from functional spec) |

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target Users](#3-target-users)
4. [Feature Matrix](#4-feature-matrix)
5. [Page Architecture](#5-page-architecture)
6. [User Stories & Acceptance Criteria](#6-user-stories--acceptance-criteria)
7. [Wireframe Descriptions](#7-wireframe-descriptions)
8. [Design System Compliance](#8-design-system-compliance)
9. [SEO & Schema Requirements](#9-seo--schema-requirements)
10. [Navigation & Link Audit](#10-navigation--link-audit)
11. [New Pages to Build](#11-new-pages-to-build)
12. [Technical Notes](#12-technical-notes)
13. [Content Editorial Standards](#13-content-editorial-standards)
14. [Out of Scope](#14-out-of-scope)
15. [Open Questions](#15-open-questions)

---

## 1. Product Overview

The **Knowledge Hub** (`knowledge-hub.html`) is IslamicInfo's free Islamic encyclopedia — a premium, trust-first discovery layer at the centre of the IslamicInfo platform. It provides 2,400+ source-verified articles across every domain of Islamic knowledge: Qur'an, Hadith, Fiqh, History, Theology, Spirituality, and modern Muslim life.

The page serves two simultaneous roles:

1. **Content destination** — users search, browse, and read standalone Islamic articles in any order, at any depth.
2. **Platform gateway** — editorial links, cross-link portals, and footer navigation push users into the Quran Explorer, Hadith Library, Islamic Studies, Daily Duas, Tools, Verify, and the Habit Tracker.

### 1.1 Critical Distinction: Knowledge Hub vs Islamic Studies

These pages serve different UX and SEO purposes and must never have their content blended.

| Dimension | Knowledge Hub (`knowledge-hub.html`) | Islamic Studies (`islamic-studies.html`) |
|---|---|---|
| Mental model | Library · Encyclopedia | School · Madrasa |
| User intent | "I want to read about X right now" | "Teach me Islam step by step" |
| Navigation | Free-form — any article, any order | Sequential — prerequisites enforced |
| Content type | 2,400+ standalone articles, FAQs, topic clusters | 152 lessons that link OUT to Knowledge Hub |
| Article browse grids | ✅ Core feature | ❌ Never — belongs only here |
| Progress tracking | ❌ No | ✅ Yes — per lesson and pathway |
| Cross-link direction | Links back to IS for structured learning | Lessons link OUT to KH for reading |

**Absolute rules:**
- Knowledge Hub must NEVER contain lesson prerequisites, progress bars, or lock/unlock mechanics.
- Islamic Studies must NEVER contain article browse grids.
- The correct href for Islamic Studies is always `islamic-studies.html` — never `learn.html`.

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

> **Measurement method:** All engagement metrics via Google Analytics 4 (GA4) custom events. SEO metrics via Google Search Console. Email metrics via email provider dashboard. Targets are for 90 days post-launch unless otherwise noted. Baseline is "0 / not yet established" for all metrics — this is a net-new page.

| Goal | Metric | Measurement Method | 30-Day Target | 90-Day Target | Review Cadence |
|---|---|---|---|---|---|
| Article discovery | Articles viewed per session | GA4 · Pages per session, segment: landing page = `/knowledge-hub.html` | ≥ 1.8 | ≥ 2.5 | Weekly |
| Search engagement | Hero search bar click → submit rate | GA4 · Custom event `kh_search_submit` | ≥ 12% | ≥ 18% | Weekly |
| Platform depth | Cross-page nav rate (KH → any other tool) | GA4 · Outbound link events from KH | ≥ 22% | ≥ 30% | Bi-weekly |
| FAQ Featured Snippets | Google SERP FAQ appearances | Google Search Console · Rich Results report | ≥ 2 of 8 | ≥ 4 of 8 | Monthly |
| Email capture | New to Islam sign-ups per 1,000 UVs | Email provider dashboard | ≥ 8 | ≥ 15 | Weekly |
| Bounce rate | Single-page sessions (no interaction) | GA4 · Engagement rate (inverse of bounce) | ≤ 55% | ≤ 42% | Weekly |
| Cluster navigation | Cluster card click-through rate | GA4 · Custom event `kh_cluster_click` | ≥ 8% | ≥ 14% | Bi-weekly |

### 2.2 SEO Goals

| Goal | Measurement Method | 6-Month Target |
|---|---|---|
| Page-1 rankings for trending queries | Google Search Console · Position tracking | ≥ 5 of 8 trending article URLs on page 1 |
| FAQ schema firing | GSC Rich Results Test + Rich Results report | All 8 questions returning 0 errors |
| Article schema richness | Google Rich Results Test per article URL | Average score ≥ 80 |
| Core Web Vitals | PageSpeed Insights · LCP / CLS / INP | LCP ≤ 2.5s · CLS ≤ 0.1 · INP ≤ 200ms |
| Sitemap indexing | GSC · Coverage report | All article, cluster, and hub URLs submitted and indexed |

### 2.3 Review & Reporting Cadence

| Cadence | Meeting | Reviewers | Agenda |
|---|---|---|---|
| Weekly | KH Weekly Pulse | Product + Engineering | Traffic, search events, email signups, any broken links flagged |
| Bi-weekly | SEO Review | Product + Marketing | Ranking movement, schema health, crawl errors |
| Monthly | Full KH Review | All stakeholders | All metrics vs targets, open questions resolution, next sprint planning |
| Quarterly | OKR Check-in | Leadership | 90-day targets vs actuals, adjust targets if needed |

---

## 3. Target Users

| Audience | Primary Need | Frustration Without KH | Primary Entry Point |
|---|---|---|---|
| Muslims seeking reliable answers | Source-cited answers to fiqh, aqidah, and practice questions | Anonymous Reddit answers, unreliable YouTube sources | Search bar, trending section, FAQ |
| Students of Islamic studies | Deep explainers and scholarly references | Scattered PDFs, paywalled academic journals | Cluster grid, featured articles |
| Converts and new Muslims | Welcoming, jargon-free starting points | Overwhelming or exclusionary introductions | "New to Islam?" section, Start Here path |
| General readers / curious non-Muslims | Neutral, well-sourced introductions to Islam | Biased or surface-level Wikipedia articles | Hero tags, FAQ, trending |
| Global Muslim communities | Content calibrated to regional madhabs and practices | One-size-fits-all rulings that ignore local scholarly tradition | Regions section |
| Islamic educators and researchers | Scholar-sourced articles with full bibliography | No trusted single source for classroom-quality references | Scholar Spotlight, article detail pages |

---

## 4. Feature Matrix

### 4.1 Feature Priority Legend
- 🔴 **P0 — Launch blocker.** Must ship before go-live.
- 🟠 **P1 — High.** Ship in first sprint after launch (≤ 2 weeks post-launch).
- 🟡 **P2 — Medium.** Ship within 60 days of launch.
- 🟢 **P3 — Low / Future.** No committed date.

### 4.2 Hub Page Features

| Feature | Description | Priority | Build Status |
|---|---|---|---|
| Global header with sticky nav | 10-item nav, search popup, theme toggle, hamburger | 🔴 P0 | ✅ Built — needs link fixes |
| Hero section with search | Bismillah, badge, H1, subtitle, search pill, trending tags | 🔴 P0 | ✅ Built — search unwired |
| Hero search → `/search.html` | Submitting hero search navigates to `/search.html?q={}` | 🔴 P0 | 🔴 Not wired |
| Trending tags → articles | 7 topic chips navigate directly to article pages | 🔴 P0 | 🔴 Not wired |
| Live ticker | Scrolling strip of trending article titles, pauses on hover | 🔴 P0 | ✅ Built — links display-only |
| Ticker items → articles | Each ticker item links to its article | 🔴 P0 | 🔴 Not wired |
| Stats strip | 5 stat cells with correct values | 🔴 P0 | ✅ Built |
| Stats count-up animation | Counters animate from 0 on scroll entry | 🟠 P1 | 🔴 Not implemented |
| Featured articles section | 1 main card + 4 side cards, all linked | 🔴 P0 | ✅ Built — links not wired |
| 8 Cluster grid | 4×2 grid, each card → `/cluster/{slug}.html` | 🔴 P0 | ✅ Built — onclick placeholder |
| Trending Now section | 8 ranked articles with search volume indicators | 🔴 P0 | ✅ Built — cards not linked |
| "See all trending" link | → `/trending.html` | 🔴 P0 | 🔴 Using `href="#"` |
| FAQ accordion | 8 expandable questions with sources | 🔴 P0 | ✅ Built |
| FAQ → article links | Each FAQ answer ends with "Read full article →" | 🔴 P0 | 🔴 Missing |
| FAQ JSON-LD schema | FAQPage schema in `<head>` | 🔴 P0 | 🔴 Missing |
| Latest articles grid | 3-column grid of 6 newest articles | 🟠 P1 | ✅ Built — cards not linked |
| Scholar Spotlight | 4 scholar cards → `/scholars/{slug}.html` | 🟡 P2 | ✅ Built — display-only |
| Cross-link portals | Quran, Hadith, Verify deep links | 🔴 P0 | ✅ Built — wired |
| Global Regions section | 6 regional audience cards (display-only v1) | 🟡 P2 | ✅ Built |
| New to Islam section | Email capture + 3 feature cards + Start Here CTA | 🟠 P1 | ✅ Built — email not wired |
| Email capture backend | Mailchimp / ConvertKit / Brevo integration | 🟠 P1 | 🔴 Not wired |
| CTA section | Dark teal section with Explore + IS buttons | 🔴 P0 | ✅ Built — wrong IS href |
| Global footer | ft- CSS system, ecosystem column, Quick Access | 🔴 P0 | ✅ Built |
| Dark mode | All sections correct in `[data-theme="dark"]` | 🔴 P0 | ✅ Built |
| Mobile responsive | All breakpoints: 1100 / 900 / 760 / 700 / 440 | 🔴 P0 | ✅ Built |
| Organization JSON-LD schema | IslamicInfo brand schema in `<head>` | 🟠 P1 | 🔴 Missing |
| Twitter / X card meta tags | `twitter:card`, `twitter:title`, `twitter:image` | 🔴 P0 | 🔴 Missing |
| Open Graph meta tags | `og:title`, `og:description`, `og:image`, `og:url` | 🔴 P0 | 🔴 Missing |
| XML Sitemap entry | Hub page + all child pages included in sitemap | 🔴 P0 | 🔴 Missing |

### 4.3 Child Page Features

| Page | Key Features | Priority |
|---|---|---|
| `/search.html` | Pre-populated search bar, result count, 8 filter chips, article cards, scholar results, FAQ results, empty state with Verify CTA | 🔴 P0 |
| `/cluster/{slug}.html` (×8) | Breadcrumb, cluster hero, sub-topic filter chips, sort controls, 12-card paginated grid, related clusters, IS CTA | 🔴 P0 |
| `/articles/{slug}.html` (×20 initial) | Breadcrumb, H1, Arabic text + translation, inline citations, bibliography, share buttons, sticky sidebar TOC, related articles, Article + Breadcrumb JSON-LD | 🔴 P0 |
| `/start-here.html` | Welcome section, 5 sequenced articles, 20-item FAQ accordion, IS pathway CTA | 🟠 P1 |
| `/trending.html` | All trending articles, sortable by Global / By Region / By Cluster / This Week / This Month | 🟠 P1 |
| `/scholars/{slug}.html` (×4) | Biography, major works, famous quotes + Arabic, articles that cite this scholar, IS cross-link | 🟡 P2 |
| `/region/{slug}.html` (×6) | Region-filtered article listings using cluster template | 🟢 P3 |

---

## 5. Page Architecture

Sections appear in this exact order in `knowledge-hub.html`:

| # | Section | Component Class | Purpose |
|---|---|---|---|
| 1 | Global Header | `.site-header` | Sticky nav, search popup, theme toggle, mobile menu |
| 2 | Hero | `.hero` | Primary message, search bar, 7 trending tags |
| 3 | Live Ticker | `.ticker` | Real-time trending signal, brand energy |
| 4 | Stats Strip | `.stats-strip` | Trust signal — article count, scholars, countries |
| 5 | Featured Articles | `.featured-grid` | 1 main + 4 side editorial picks |
| 6 | Cluster Grid | `.cluster-grid` | 8 topic navigation cards |
| 7 | Trending Now | `.trending-section` | 8 highest-traffic articles |
| 8 | FAQ Block | `.faq-grid` | People Also Ask / Featured Snippet targets |
| 9 | Latest Articles | `.articles-grid` | 6 newest publications |
| 10 | Scholar Spotlight | `.scholars-section` | Credibility / E-E-A-T signal |
| 11 | Cross-Link Portals | `.portals-grid` | Platform gateway to Quran · Hadith · Verify |
| 12 | Global Regions | `.regions-grid` | Reach signal — 180+ countries |
| 13 | New to Islam | `.new-to-islam` | Onboarding + email list capture |
| 14 | CTA Section | `.cta-section` | Final conversion — "Explore the Hub" + IS link |
| 15 | Global Footer | `#ii-footer` | Navigation, ecosystem, legal |

---

## 6. User Stories & Acceptance Criteria

---

### Epic 1: Search & Discovery

---

#### US-001 · Hero Search

**As a** Muslim with a specific question,  
**I want to** type my question into the large search bar in the hero  
**so that** I reach relevant, source-verified articles immediately.

**Acceptance Criteria:**

- [ ] Hero search bar is visible on page load without scrolling on any device ≥ 320px wide.
- [ ] The input pill (`#heroSearch`) is full-width up to 640px within `.hero-inner`.
- [ ] Placeholder text reads: "Search 2,400+ articles on Islam…"
- [ ] Focus state: border changes to `var(--teal-500)`, box-shadow adds `0 0 0 4px rgba(44,164,171,.12)`.
- [ ] Pressing `Enter` navigates to `/search.html?q={encoded-query}`.
- [ ] Clicking "Search Hub" button navigates to `/search.html?q={encoded-query}`.
- [ ] Empty query submission is blocked — button is disabled until at least 2 characters are entered.
- [ ] GA4 event `kh_search_submit` fires on every successful search submission with `{query: string}` parameter.
- [ ] In dark mode, the search pill uses `rgba(21,37,39,.88)` background and `rgba(0,105,110,.3)` border.

---

#### US-002 · Header Search Popup

**As a** user already scrolled past the hero,  
**I want to** trigger a compact search popup from the header  
**so that** I can search without scrolling back to the top.

**Acceptance Criteria:**

- [ ] Search icon in `.header-tools` opens `.search-popup` on click.
- [ ] Popup animates in: `opacity 0→1`, `translateY(-8px)→0`, `scale(.97)→1`, duration 300ms.
- [ ] Focus is moved to the popup input within 50ms of open.
- [ ] Popup closes on: click outside · `Escape` key · clicking "Search" button.
- [ ] Submitting the popup search navigates to `/search.html?q={encoded-query}`.
- [ ] Popup is 340px wide, positioned `top: 44px; right: 0` relative to the search icon.
- [ ] Dark mode: `background: rgba(15,27,29,.97)`, `border-color: rgba(0,105,110,.3)`.

---

#### US-003 · Trending Tag Navigation

**As a** visitor who sees a topic chip in the hero,  
**I want to** click it and go directly to the best article on that topic  
**so that** I don't have to type or filter — I get immediate value.

**Acceptance Criteria:**

- [ ] All 7 trending tags navigate directly to their article URL (not through search).
- [ ] Exact route table: "What is Zakat?" → `/articles/what-is-zakat.html` · "99 Names of Allah" → `/articles/99-names-of-allah.html` · "Pillars of Islam" → `/articles/five-pillars-of-islam.html` · "Is music haram?" → `/articles/is-music-haram-islam.html` · "Prophet Muhammad ﷺ" → `/articles/prophet-muhammad-biography.html` · "Day of Judgment" → `/articles/day-of-judgment-signs.html` · "Ramadan guide" → `/articles/ramadan-complete-guide.html`.
- [ ] Hover state: `background: var(--teal-700)`, `color: white`, `border-color: transparent`, `transform: scale(1.05)`.
- [ ] Tags wrap onto two lines on mobile without overflowing `.hero-inner`.
- [ ] No tag opens in a new tab — navigation is same-window.

---

#### US-004 · Search Results Page

**As a** user who submitted a search query,  
**I want to** see relevant article results with filters  
**so that** I can narrow down to the exact content I need.

**Acceptance Criteria:**

- [ ] Page at `/search.html?q={query}` loads and pre-populates the search bar with the query.
- [ ] Result count displays: "Showing {N} results for '{query}'".
- [ ] Filter chips: All · Five Pillars · Qur'an · Fiqh · History · Theology · Spirituality · Modern Life.
- [ ] Active filter chip uses `.chip.active` state (teal background, white text).
- [ ] Article results use the same card anatomy as the Latest Articles grid.
- [ ] No-results state shows: "We don't have an article on '{query}' yet. Try browsing [related cluster] or submit your question to [Verify →]."
- [ ] No-results "Verify →" links to `verify.html`.
- [ ] Minimum 10 results displayed before "Load More" trigger.
- [ ] **Loading state:** skeleton cards shown while results fetch (3 placeholder cards with pulse animation).
- [ ] **Error state:** if search fails, display "Something went wrong. Please try your search again." with a retry button — no blank page, no console error exposed to user.

---

### Epic 2: Browse by Topic Cluster

---

#### US-005 · Cluster Grid Navigation

**As a** user exploring Islamic knowledge by topic,  
**I want to** click a cluster card and see all articles in that topic  
**so that** I can browse freely within a domain I care about.

**Acceptance Criteria:**

- [ ] All 8 cluster cards navigate to their correct `/cluster/{slug}.html` URL on click.
- [ ] Exact slug mapping: Five Pillars → `/cluster/five-pillars.html` · Qur'an & Revelation → `/cluster/quran-revelation.html` · Prophets & Companions → `/cluster/prophets-companions.html` · Islamic Law · Fiqh → `/cluster/islamic-law-fiqh.html` · Faith & Theology → `/cluster/faith-theology.html` · Islamic History → `/cluster/islamic-history.html` · Spirituality & Character → `/cluster/spirituality-character.html` · Islam in Modern Life → `/cluster/islam-modern-life.html`.
- [ ] Cards implemented as `<a>` elements — no `onclick` placeholder functions.
- [ ] Hover: `translateY(-5px) scale(1.012)` + teal glow ring + `::before` gradient overlay fades in + icon `scale(1.12) rotate(-5deg)` + arrow slides in.
- [ ] No shimmer sweep `::after` animation on hover (CLAUDE.md §27.4 absolute ban).
- [ ] Dark mode hover uses `rgba(88,193,199,.18)` glow (not light-mode teal).
- [ ] Article count displayed on each card matches actual cluster page article count.
- [ ] Grid: 4-column at ≥ 900px, 2-column at 480–900px, 1-column at < 480px.
- [ ] GA4 event `kh_cluster_click` fires with `{cluster: string}` on every cluster card click.

---

#### US-006 · Cluster Landing Page

**As a** user who navigated to a cluster (e.g. Islamic Law · Fiqh),  
**I want to** filter articles by sub-topic and sort them  
**so that** I find the exact type of article I'm looking for.

**Acceptance Criteria:**

- [ ] Breadcrumb visible: "Knowledge Hub › {Cluster Name}".
- [ ] Cluster hero shows: large icon, cluster name, Arabic cluster name (Amiri RTL), description, article count badge.
- [ ] Sub-topic filter chips present per §10.5 of Functional Doc for each cluster.
- [ ] Sort controls: Most Popular · Most Recent · Shortest Read · Longest Read.
- [ ] Article grid shows 12 cards per page.
- [ ] Pagination or "Load More" present.
- [ ] "Related clusters" section shows 3 other cluster cards.
- [ ] "Study this systematically →" CTA links to `islamic-studies.html`.
- [ ] Global header has "Knowledge Hub" as the active nav item.

---

### Epic 3: Trending Content

---

#### US-007 · Trending Now Cards

**As a** user curious about what Muslims are reading most,  
**I want to** see the top trending articles with their search volumes  
**so that** I can join the global conversation on Islamic topics.

**Acceptance Criteria:**

- [ ] All 8 trending cards link to their correct article URLs.
- [ ] Exact route table: Rank 01 → `/articles/99-names-of-allah.html` · Rank 02 → `/articles/is-music-haram-islam.html` · Rank 03 → `/articles/how-to-calculate-zakat.html` · Rank 04 → `/articles/how-many-surahs-in-quran.html` · Rank 05 → `/articles/sunni-vs-shia-differences.html` · Rank 06 → `/articles/how-to-perform-salah.html` · Rank 07 → `/articles/islamic-mortgage-halal.html` · Rank 08 → `/articles/who-was-ibn-battuta.html`.
- [ ] Clicking anywhere on a trend card navigates to the article.
- [ ] Monthly search volume displayed (e.g. "142K / month").
- [ ] Rank numbers 01–08 in Cormorant Garamond, `rgba(0,105,110,.15)` — decorative only, not interactive.
- [ ] Hover: `translateY(-3px)` + `var(--elev-3)` + border-color intensifies.
- [ ] "See all trending →" link navigates to `/trending.html` — not `#`.
- [ ] Grid: 4-column at ≥ 860px, 2-column at 480–860px, 1-column below.

---

#### US-008 · Live Ticker Engagement

**As a** user who sees the dark scrolling strip below the hero,  
**I want to** read and click ticker items  
**so that** I discover articles I didn't know to search for.

**Acceptance Criteria:**

- [ ] Ticker scrolls right-to-left continuously at 40s per cycle (`tickerScroll` keyframe, `linear`, `infinite`).
- [ ] Content is duplicated inside `.ticker-inner` so the second half is a pixel-perfect repeat of the first — enabling seamless infinite looping without a visual jump.
- [ ] Ticker pauses immediately on hover (`animation-play-state: paused`).
- [ ] All 8 ticker items are clickable links to their article URLs.
- [ ] Exact route table: "99 Names of Allah" → `/articles/99-names-of-allah.html` · "How many times is prayer mentioned" → `/articles/how-many-times-prayer-in-quran.html` · "Four Schools of Islamic Law" → `/articles/four-schools-of-islamic-law.html` · "Ibn Khaldun civilization" → `/articles/ibn-khaldun-civilization.html` · "Zakat al-Fitr vs Zakat al-Mal" → `/articles/zakat-al-fitr-vs-zakat-al-mal.html` · "Night of Qadr" → `/articles/night-of-qadr.html` · "Tawakkul" → `/articles/tawakkul-trusting-allah.html` · "Islamic Finance" → `/articles/islamic-finance-halal-transaction.html`.
- [ ] Touch devices: ticker item is tappable and navigates correctly.

---

### Epic 4: Article Reading

---

#### US-009 · Featured Article Navigation

**As a** user drawn to the main featured article,  
**I want to** click it and reach the full article  
**so that** I get the depth I'm looking for.

**Acceptance Criteria:**

- [ ] "Read full article →" in the featured main card navigates to `/articles/99-names-of-allah.html`.
- [ ] Clicking anywhere on the main card body also navigates to the same URL.
- [ ] All 4 side cards navigate to correct URLs: Golden Age → `/articles/golden-age-of-islam.html` · Halal & Haram → `/articles/halal-haram-framework.html` · Tawakkul → `/articles/tawakkul-trusting-allah.html` · Ramadan Guide → `/articles/ramadan-complete-guide.html`.
- [ ] Hover on main card: `translateY(-5px) scale(1.008)` + teal glow.
- [ ] Hover on side card: icon animates `scale(1.1) rotate(-4deg)`.
- [ ] Featured section: 1.5fr / 1fr grid at ≥ 860px; stacks vertically at < 860px.

---

#### US-010 · Article Detail Page

**As a** reader who clicked into an article,  
**I want to** read a well-structured, scholar-sourced article with Arabic text and citations  
**so that** I can trust and act on the information I'm learning.

**Acceptance Criteria:**

- [ ] URL structure: `/articles/{article-slug}.html`.
- [ ] Page `<title>`: `{Article Title} — Knowledge Hub · IslamicInfo`.
- [ ] Breadcrumb: "Knowledge Hub › {Cluster Name} › {Article Title}".
- [ ] H1 in Cormorant Garamond, large.
- [ ] Article body in Inter, 16px, line-height 1.75.
- [ ] Arabic quotations: `font-family: var(--font-arabic)` (Amiri), `direction: rtl`, English translation immediately below.
- [ ] Inline citations formatted as: `[📚 Source: Scholar name · Book name · Reference]`.
- [ ] Full source bibliography present at bottom of article.
- [ ] Share buttons present: Copy link · Share image · WhatsApp · X.
- [ ] Right sidebar (sticky on scroll, desktop only): In this article summary · Table of contents · Related articles · IS link · Verify link.
- [ ] Sidebar stacks below article body on mobile (< 900px).
- [ ] Article JSON-LD schema in `<head>`.
- [ ] "Was this article helpful?" thumbs up/down present at article bottom.
- [ ] Related articles section (3 cards, same cluster) below the article.
- [ ] **Loading state:** article content area shows skeleton loader (pulsing grey bars) while content loads — never a blank white page.
- [ ] **404 state:** if article slug does not exist, render a branded 404 page with: "This article doesn't exist yet" message + search bar pre-focused + 3 suggested articles from the most relevant cluster + link back to `knowledge-hub.html`. Does NOT show a default browser 404.
- [ ] **Slow network state:** if content has not loaded within 3s, display "Taking longer than usual… still loading" inline message — no spinner-only blank state.

---

#### US-011 · Article Sharing

**As a** reader who found a valuable article,  
**I want to** share it via WhatsApp, copy link, or as an image  
**so that** I can spread authentic Islamic knowledge with my community.

**Acceptance Criteria:**

- [ ] "Copy link" copies the article URL to clipboard and shows a `"Link copied ✦"` toast.
- [ ] Toast: `position: fixed; bottom: 28px; right: 28px; z-index: 400`. Fades in on show, auto-dismisses after 3s.
- [ ] "Share image" opens a canvas modal with 1:1 square and 9:16 story options; download PNG button present.
- [ ] WhatsApp link: `https://wa.me/?text={encoded-title + URL}` — opens in new tab.
- [ ] X (Twitter) link: `https://twitter.com/intent/tweet?text={title}&url={url}` — opens in new tab.
- [ ] Bookmark saves to `localStorage` under key `islamicinfo-kh-bookmarks` as a JSON array of article slugs.

---

### Epic 5: FAQ & Quick Answers

---

#### US-012 · FAQ Accordion Interaction

**As a** user who wants a quick answer to a common Islamic question,  
**I want to** expand an FAQ item and read a concise, sourced answer  
**so that** I get value without reading a full article.

**Acceptance Criteria:**

- [ ] All 8 FAQ items present with correct questions and answers.
- [ ] Exact question list: "What are the Five Pillars of Islam?" · "How many surahs and verses are in the Quran?" · "What is the difference between Sunni and Shia Islam?" · "What does Bismillah mean?" · "How is Zakat calculated?" · "What are the four schools of Islamic law?" · "Who was Prophet Muhammad ﷺ and when did he live?" · "Is music haram in Islam?"
- [ ] Clicking a question toggles `.faq-item.open`.
- [ ] Open state: `max-height` transitions 0 → 300px over 400ms using `var(--ease)`.
- [ ] Chevron rotates 180° when open; transitions back on close.
- [ ] **Multiple FAQs may be open simultaneously** — no auto-close behaviour.
- [ ] Each answer ends with a "Read the full article →" link to the correct article URL.
- [ ] `.faq-source` chip present in each answer showing the classical reference.
- [ ] Dark mode: `.faq-item` background `var(--white)` (#152527 in dark), border `rgba(0,105,110,.18)`.

---

#### US-013 · FAQ Schema for Google Featured Snippets

**As** the product team,  
**I want** FAQ schema markup present on the page  
**so that** all 8 questions are eligible for Google People Also Ask boxes.

**Acceptance Criteria:**

- [ ] `<script type="application/ld+json">` block with `@type: "FAQPage"` in `<head>`.
- [ ] All 8 questions and plain-text answers in the `mainEntity` array.
- [ ] Answer text is plain text — no HTML inside the JSON-LD `text` value.
- [ ] Google Rich Results Test passes with 0 errors and 0 warnings.
- [ ] Schema answer text matches visible on-page answer text exactly — no discrepancy.

---

### Epic 6: Onboarding New Visitors

---

#### US-014 · New to Islam Email Capture

**As a** convert or curious non-Muslim visiting the page,  
**I want to** enter my email and receive a beginner reading guide  
**so that** I have a curated, non-overwhelming entry point into Islamic knowledge.

**Acceptance Criteria:**

- [ ] Email input: `type="email"`, placeholder "Your email address".
- [ ] "Get the Guide" button submits to configured email provider.
- [ ] **Success state:** input row replaced with "✓ Check your inbox! Your first email is on its way." in teal, with a gold ✦ icon.
- [ ] **Error state (server):** inline message below input reads "Something went wrong — please try again." No alert(), no page reload.
- [ ] **Error state (invalid email):** inline message reads "Please enter a valid email address." on blur or submit attempt.
- [ ] Fine print visible below form: "Free. No spam. Unsubscribe anytime."
- [ ] GDPR: no pre-checked checkbox; form submission constitutes consent. Privacy Policy link in fine print.
- [ ] The 3 feature card links route correctly: "Start with Foundations" → `/start-here.html#foundations` · "Common Questions" → `/start-here.html#faq` · "Source-Verified" → `/start-here.html#about`.
- [ ] GA4 event `kh_email_signup` fires on successful submission.

---

#### US-015 · Start Here Beginner Path

**As a** new Muslim or curious reader who clicked "Start Here",  
**I want to** see a warm, sequenced set of 5 beginner articles  
**so that** I have a clear, non-overwhelming path into Islamic knowledge.

**Acceptance Criteria:**

- [ ] Page exists at `/start-here.html`.
- [ ] Welcome section is jargon-free with no assumed prior knowledge.
- [ ] 5 articles in recommended reading order — all are clickable immediately (no locking).
- [ ] 20 common questions in FAQ accordion format.
- [ ] "Ready for more?" CTA links to `islamic-studies.html`.
- [ ] "Browse freely" links to `knowledge-hub.html`.
- [ ] Global header has "Knowledge Hub" as the active nav item.

---

### Epic 7: Scholar Credibility

---

#### US-016 · Scholar Spotlight Cards

**As a** reader wanting to understand the scholarly authority behind articles,  
**I want to** see which classical scholars IslamicInfo relies on  
**so that** I can trust that the content is grounded in established scholarship.

**Acceptance Criteria:**

- [ ] 4 scholar cards present: Ibn Kathir (إك, 1300–1373 CE, Tafsir badge) · Imam al-Bukhari (بخ, 810–870 CE, Hadith badge) · Ibn Khaldun (خل, 1332–1406 CE, Historian badge) · Imam al-Ghazali (غز, 1058–1111 CE, Spirituality badge).
- [ ] Each card: Arabic initials avatar (72×72 circle, teal/gold gradient bg) · name · era dates · location · key work · field badge.
- [ ] Scholar section background: `linear-gradient(135deg, var(--teal-900), #062628)`.
- [ ] Gold radial glow `::before` and teal `::after` pseudo-elements present.
- [ ] Cards link to `/scholars/{slug}.html` (P2 — currently display-only is acceptable for launch).
- [ ] Cards are legible in both light and dark mode (light text on dark section bg).

---

### Epic 8: Platform & Navigation

---

#### US-017 · Global Header & Navigation

**As a** user on any IslamicInfo page,  
**I want** consistent navigation with all 10 items  
**so that** I can move anywhere on the platform in one click.

**Acceptance Criteria:**

- [ ] Header: `position: sticky; top: 0; z-index: 100`.
- [ ] All 10 nav items in correct order: Home · Quran Explorer · Hadith Library · Islamic Studies · Knowledge Hub · Daily Duas · Tools · Habit Tracker · Verify · About.
- [ ] "Knowledge Hub" has `class="nav-link active"` with teal/gold underline bar.
- [ ] After 16px scroll: `.scrolled` class added, box-shadow intensifies.
- [ ] Mobile (≤ 760px): nav hidden, hamburger visible, full-screen overlay opens via `openMM()`.
- [ ] Mobile menu closes on: link click · Escape key · close button.
- [ ] Theme toggle reads/writes `localStorage` key `islamicinfo-theme`; default is `light`.
- [ ] `data-theme` attribute on `<html>` element — not `<body>`.

---

#### US-018 · Cross-Link Portals

**As a** user who found an article about a Quranic topic,  
**I want to** be directed into the Quran Explorer  
**so that** I can deepen my reading with the actual Quranic text.

**Acceptance Criteria:**

- [ ] Three portal cards present: Quran Explorer → `quran.html` · Hadith Library → `hadith.html` · Verify a Source → `verify.html`.
- [ ] Entire card is clickable — not only a button within it.
- [ ] Hover: `translateY(-4px)` + colour-matched glow per card.

---

#### US-019 · CTA Section & Islamic Studies Link

**As a** user who has browsed the Knowledge Hub,  
**I want to** be offered a path to structured Islamic Studies  
**so that** I can move from free reading to systematic learning.

**Acceptance Criteria:**

- [ ] CTA section is the last section before the footer.
- [ ] Background: `linear-gradient(135deg, #0A3A3D, #00696E, #062628)`.
- [ ] "Explore the Hub" button (`href="#hero"`) scrolls to page top — `.btn-primary`.
- [ ] "Islamic Studies →" button links to `islamic-studies.html` — `.btn-white-ghost`.
- [ ] Neither button uses `href="learn.html"` anywhere on this page.
- [ ] Quranic verse (Al-Zumar 39:9) present as subtitle.

---

#### US-020 · Footer Compliance

**As a** user reaching the bottom of the page,  
**I want to** find complete site navigation and ecosystem links  
**so that** I can explore the full IslamicInfo platform.

**Acceptance Criteria:**

- [ ] Footer uses `ft-top / ft-brand / ft-link / ft-bot` CSS class system per CLAUDE.md §7.
- [ ] Column 1 (KH-specific): "Articles" heading → Browse Clusters · FAQ · Latest.
- [ ] Column 3 (Quick Access — identical on every page): all 8 destinations including Knowledge Hub.
- [ ] Ecosystem column: exactly 4 items in order: QuranlyAI (`quranlyai.com`) · MosqueFinder (`mosquefinder.net`) · TravellyAI (`travellyai.com`) · LearnSpeakAI (`learnspeakai.com`).
- [ ] "Islamic Studies" footer link: `href="islamic-studies.html"` — not `learn.html`.
- [ ] Copyright line: "© 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources."

---

### Epic 9: Accessibility & Performance

---

#### US-021 · Keyboard & Screen Reader Accessibility

**As a** user relying on a keyboard or screen reader,  
**I want to** navigate and use all core features without a mouse  
**so that** I can access Islamic knowledge regardless of ability.

**Acceptance Criteria:**

- [ ] All interactive elements reachable via `Tab` in logical reading order.
- [ ] FAQ accordion operable via `Enter` / `Space` keys.
- [ ] Search inputs have `aria-label` attributes.
- [ ] Hamburger: `aria-label="Open menu"`. Close button: `aria-label="Close menu"`.
- [ ] Bismillah uses `aria-label="Bismillah"` — clip-text is invisible to some screen readers.
- [ ] Colour contrast: all body text meets WCAG AA (4.5:1 minimum) in both light and dark modes.
- [ ] No keyboard trap in the mobile menu overlay.

---

#### US-022 · Mobile Responsiveness

**As a** user on a phone (320px–767px wide),  
**I want** every section to be readable and all interactions to work  
**so that** I can use the Knowledge Hub on the go.

**Acceptance Criteria:**

- [ ] Hero search bar usable on 320px screen without horizontal scroll.
- [ ] Cluster grid: 1-column at < 480px.
- [ ] Trending grid: 1-column at < 480px.
- [ ] Articles grid: 1-column at < 560px.
- [ ] Featured grid: stacked at < 860px.
- [ ] Footer: 2-column at ≤ 700px, 1-column at ≤ 440px.
- [ ] Live ticker readable and tappable without accidental navigation.
- [ ] No horizontal overflow (`overflow-x: hidden` on `body`).

---

#### US-023 · Dark Mode Fidelity

**As a** user who prefers dark mode,  
**I want** every section of the page to render correctly in `[data-theme="dark"]`  
**so that** the experience is complete and premium regardless of my system preference.

**Acceptance Criteria:**

- [ ] Theme preference persists across page loads via `localStorage` key `islamicinfo-theme`.
- [ ] `data-theme` attribute applied to `<html>` within 0ms of page load — no flash of wrong theme.
- [ ] Bismillah: gold gradient + `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))` in dark mode.
- [ ] Hero title: `color: #F5F8F8` in dark mode.
- [ ] All cards: `background: var(--white)` (#152527) in dark, `border-color: rgba(0,105,110,.18)`.
- [ ] All card hovers: `box-shadow` uses `rgba(88,193,199,.18)` teal — not the light-mode value.
- [ ] Live ticker: unchanged (already dark by design).
- [ ] Scholar section: unchanged (already dark by design).
- [ ] CTA section: unchanged (already dark by design).
- [ ] Hero badge, eyebrow pills, section eyebrows: `color: #5BC1C7` (teal-300) in dark.
- [ ] No raw-white text or backgrounds appearing against dark surfaces.
- [ ] Sun icon shown in dark mode (toggle to light); moon icon shown in light mode (toggle to dark).

---

## 7. Wireframe Descriptions

Descriptions reference the visual layout rendered in `knowledge-hub.html` (canonical mockup). Section numbers align with §5 Page Architecture.

---

### 7.1 Global Header

**Visual layout:** Three-zone horizontal strip, 60px tall, sticky.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [IslamicInfo ✦]  [Home·Quran·Hadith·IS·Knowledge Hub·Duas·Tools·Habits·Verify·About]  [🔍 EN ☾ 👤] │
│                                              ‾‾‾‾‾‾‾‾‾‾‾‾‾ ← teal/gold underline │
└──────────────────────────────────────────────────────────────────────────────────┘
```
- Left: SVG brand mark (34×34) + "Islamic**Info**" — "Info" in `var(--gold-500)`.
- Centre: 10 nav links, Inter 12.5px, 2px gap. "Knowledge Hub" has 2px teal→gold gradient underline.
- Right: 4 circular icon buttons (34×34). Search + EN + theme + user.
- Mobile (≤ 760px): centre nav hidden; hamburger (≡) shown; only search + theme toggle remain.

---

### 7.2 Hero Section

```
        ░░░░ ambient radial glow — teal upper-left, gold upper-right ░░░░
   ◆ [geo: teal star polygon, floating]         ▪ [geo: gold square, floating] ◆

              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ      ← Amiri, teal gradient
          ┌───────────────────────────────────────────┐
          │ ● Islamic Knowledge Hub · Est. 2026       │  ← badge pill
          └───────────────────────────────────────────┘

          Every Question.
          Every Answer. Verified.      ← line 2: gradient-italic (teal→gold)

     The world's most comprehensive source-verified Islamic knowledge base.
     Explore thousands of articles — referenced, ranked by scholars, free forever.

     ┌────────────────────────────────────────────────────────────┐
     │ 🔍  Search 2,400+ articles on Islam…        [Search Hub]  │
     └────────────────────────────────────────────────────────────┘
             ← frosted glass pill, max-width 640px

     [What is Zakat?] [99 Names of Allah] [Pillars of Islam]
     [Is music haram?] [Prophet ﷺ] [Day of Judgment] [Ramadan guide]
                             ← 7 chip tags, wrap on mobile

   ◆ [geo: teal star, bottom-right]         ▪ [geo: gold rotated star, bottom-left] ◆
```

---

### 7.3 Live Ticker

```
████████████████████████████████████████████████████████████████████████████
█ ● NEW  What are the 99 Names of Allah?  ✦  TRENDING  How many times… ✦  █
████████████████████████████████████████████████████████████████████████████
  ← background: linear-gradient(90deg, teal-900, #062628)
  ← scrolls right-to-left, 40s, pauses on hover
```

---

### 7.4 Stats Strip

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   2,400+     │      8       │    47+       │    180+      │      0       │
│   Articles   │Topic Clusters│Scholar Sources│  Countries  │Ads.Fatwas.Bias│
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
  ← 5-column grid, bottom border only, numbers animate up on scroll entry
```

---

### 7.5 Featured Articles

```
┌──────────────────────────────────┬───────────────────────────────┐
│  [dark teal bg + ornament SVG]   │ ┌──────────────────────────┐  │
│  ⏱ 12 min read  [Faith & Theo.] │ │ 🏛 Islamic History        │  │
│                                  │ │ Golden Age of Islam…      │  │
│        الأسماء الحسنى             │ │ 9 min · 5 sources         │  │
│  (Amiri ghost text, 18% opacity) │ └──────────────────────────┘  │
├──────────────────────────────────┤ ┌──────────────────────────┐  │
│ Faith & Theology · May 2026      │ │ ⚖️ Fiqh                   │  │
│ The 99 Names of Allah:           │ │ Halal & Haram Framework…  │  │
│ A Complete Guide with Arabic,    │ │ 14 min · 7 sources        │  │
│ Meaning & Scholarly Commentary   │ └──────────────────────────┘  │
│                                  │ ┌──────────────────────────┐  │
│ Two-line excerpt paragraph…      │ │ 📿 Spirituality           │  │
│                                  │ │ Tawakkul: Trusting Allah  │  │
│ ─────────────────────────────── │ │ 7 min · 4 sources         │  │
│ [● Editorial · 3 sources] [Read→]│ └──────────────────────────┘  │
│                                  │ ┌──────────────────────────┐  │
│   1.5fr                          │ │ 🌙 Worship & Practice     │  │  1fr
│                                  │ │ Complete Ramadan Guide…   │  │
│                                  │ │ 18 min · 8 sources        │  │
└──────────────────────────────────┘ └──────────────────────────┘  │
                                                                    │
  ← stacks vertically at < 860px
```

---

### 7.6 Cluster Grid

```
┌────────────┬────────────┬────────────┬────────────┐
│ 🕋          │ 📖          │ 🌟          │ ⚖️          │
│ Five        │ Qur'an &   │ Prophets & │ Islamic    │
│ Pillars    │ Revelation  │ Companions │ Law · Fiqh │
│            │            │            │            │
│ Deep exp…  │ How the    │ Biograph…  │ Halal &    │
│            │ Quran was… │            │ haram…     │
│ ■■ 342 [→] │ ■■ 287 [→] │ ■■ 214 [→] │ ■■ 398 [→] │
├────────────┼────────────┼────────────┼────────────┤
│ ✦          │ 🏛️          │ 📿          │ 🌍          │
│ Faith &    │ Islamic    │ Spiritu-   │ Islam in   │
│ Theology   │ History    │ ality &    │ Modern     │
│            │            │ Character  │ Life       │
│ What Mus…  │ Early      │ Akhlaq,    │ Converts,  │
│            │ Islam…     │ ihsan…     │ science…   │
│ ■■ 265 [→] │ ■■ 311 [→] │ ■■ 189 [→] │ ■■ 247 [→] │
└────────────┴────────────┴────────────┴────────────┘
  [→] arrow hidden at rest, slides in on hover
  Icon scales + rotates on hover; ::before gradient overlay fades in
  4-col desktop · 2-col tablet · 1-col mobile
```

---

### 7.7 Trending Now

```
  ● TRENDING NOW                               See all trending →
┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐
│01  THEOLOGY        │02  FIQH            │03  FIVE PILLARS    │04  QURAN           │
│ What are the      │ Is music haram     │ How to calculate   │ How many surahs    │
│ 99 Names of       │ in Islam? What     │ Zakat on savings   │ and verses in      │
│ Allah?            │ do 4 schools say?  │ gold, investments  │ the Quran?         │
│ 142K / month      │ 88K / month        │ 74K / month        │ 61K / month        │
├───────────────────┼───────────────────┼───────────────────┼───────────────────┤
│05  COMPARISONS     │06  WORSHIP         │07  MODERN LIFE     │08  HISTORY         │
│ Sunni vs Shia:    │ How to perform     │ Islamic mortgage   │ Who was Ibn        │
│ key theological   │ Salah step by      │ — is it truly      │ Battuta and why    │
│ differences       │ step — complete    │ halal? Scholars    │ his journey still  │
│ 58K / month       │ 52K / month        │ 47K / month        │ 39K / month        │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┘
  Large rank numbers in Cormorant Garamond, ~15% opacity — decorative
  4-col desktop · 2-col tablet · 1-col mobile
```

---

### 7.8 FAQ Block

```
  📋 Structured for Google People Also Ask               ← schema note pill

┌──────────────────────────────────────────────────────────────── max-w 800px ──┐
│ What are the Five Pillars of Islam?                              [▾]           │
│ ─────────────────────────────────────────────────────────────────────────── │
│ What does Bismillah mean?                                        [▾]           │
│ ─────────────────────────────────────────────────────────────────────────── │
│ How is Zakat calculated?                                         [▾]           │ ← open
│   The Five Pillars are Shahada, Salah, Zakat, Sawm, and Hajj…                 │
│   [📚 Sahih al-Bukhari #8]                                                     │
│   Read the full article →                                                     │
│ ─────────────────────────────────────────────────────────────────────────── │
│   … 5 more items …                                                            │
└───────────────────────────────────────────────────────────────────────────────┘
  Chevron rotates 180° on open · max-height 0→300px transition
```

---

### 7.9 Latest Articles Grid

```
┌──────────────────┬──────────────────┬──────────────────┐
│ [dark teal bg]   │ [teal/gold bg]   │ [deep blue bg]   │
│    الخلافة        │     الصبر         │     الفقه         │  ← Amiri ghost text
├──────────────────┼──────────────────┼──────────────────┤
│ Islamic History  │ Spirituality     │ Fiqh             │
│ May 10, 2026     │ May 8, 2026      │ May 6, 2026      │
│ Rightly-Guided   │ Sabr: The        │ Islamic Finance: │
│ Caliphs: Abu     │ Quran's Most     │ What Makes a     │
│ Bakr to Ali      │ Repeated…        │ Transaction…     │
│ Two-line excerpt │ Two-line excerpt │ Two-line excerpt │
│ ──────────────── │ ──────────────── │ ──────────────── │
│ Read article → ⏱│ Read article → ⏱│ Read article → ⏱│
│ 11 min           │ 8 min            │ 13 min           │
└──────────────────┴──────────────────┴──────────────────┘
  Row 2: How to Take Shahada · Sunnah in Practice · Day of Judgment
  3-col desktop · 2-col tablet · 1-col mobile
```

---

### 7.10 Scholar Spotlight

```
████████████████████████████████ dark teal gradient bg ████████████████████████████
  ✦ CLASSICAL SCHOLARSHIP                    ← gold eyebrow pill

  ┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
  │    ╭────────╮    │    ╭────────╮    │    ╭────────╮    │    ╭────────╮    │
  │    │   إك   │    │    │   بخ   │    │    │   خل   │    │    │   غز   │    │
  │    ╰────────╯    │    ╰────────╯    │    ╰────────╯    │    ╰────────╯    │
  │   Ibn Kathir    │  Imam al-Bukhari  │   Ibn Khaldun   │  Imam al-Ghazali │
  │  1300–1373 CE   │   810–870 CE      │  1332–1406 CE   │  1058–1111 CE   │
  │    Damascus     │    Bukhara        │    Tunisia      │      Tus        │
  │ Tafsir al-Qur…  │ Sahih al-Bukhari  │  Muqaddimah     │  Ihya' Ulum…    │
  │  [Tafsir]       │  [Hadith]         │  [Historian]    │  [Spirituality] │
  └──────────────────┴──────────────────┴──────────────────┴──────────────────┘
    Arabic initials in 72×72 circle avatar, teal/gold gradient background
    All text white on dark section — P2: cards link to /scholars/{slug}.html
████████████████████████████████████████████████████████████████████████████████
```

---

### 7.11 Cross-Link Portals

```
  ⬡ EXPLORE THE PLATFORM DEEPER              ← section eyebrow

┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
│    ████████████████████  │    ████████████████████  │    ████████████████████  │
│    ████ 📖 (large) ████  │    ████ 📜 (large) ████  │    ████  ✓ (large) ████  │
│    ████████████████████  │    ████████████████████  │    ████████████████████  │
│                          │                          │                          │
│  Quran Explorer          │  Hadith Library          │  Verify a Source         │
│                          │                          │                          │
│  114 surahs, Tafsir,     │  12,000+ hadiths, 9      │  Paste any Islamic       │
│  WBW, 50+ reciters,      │  collections, isnad      │  claim → instant         │
│  AI explanations         │  chains, grade badges    │  authenticity rating     │
│                          │                          │                          │
│  [Explore Quran →]       │  [Browse Hadiths →]      │  [Verify Now →]          │
│                          │                          │                          │
│  → quran.html            │  → hadith.html           │  → verify.html           │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘
  Each card: distinct dark gradient background
  Entire card clickable; hover: translateY(-4px) + colour-matched glow
  3-col desktop → 1-col mobile (stacks)
```

---

### 7.12 Global Regions

```
  🌍 180+ COUNTRIES REACHED                  ← eyebrow

┌────────────┬────────────┬────────────┬────────────┬────────────┬────────────┐
│ 🇸🇦          │ 🇵🇰          │ 🇮🇩          │ 🇺🇸          │ 🇬🇧          │ 🌍          │
│ Arabian    │ South      │ Southeast  │ North      │ United     │ Sub-       │
│ Peninsula  │ Asia       │ Asia       │ America    │ Kingdom    │ Saharan    │
│            │            │            │            │            │ Africa     │
│ Fiqh,      │ Hanafi     │ Shafi'i    │ Converts,  │ Islamic    │ Basics of  │
│ Hadith,    │ Fiqh,      │ Fiqh,      │ modern     │ finance,   │ faith,     │
│ Aqidah     │ Sunnah     │ Ramadan    │ life       │ ethics     │ pillars    │
│            │            │            │            │            │            │
│ 380K/mo    │ 510K/mo    │ 440K/mo    │ 290K/mo    │ 195K/mo    │ 267K/mo   │
└────────────┴────────────┴────────────┴────────────┴────────────┴────────────┘
  6-col desktop → 3-col tablet → 2-col mobile
  Display-only in v1. Future (P3): cards link to /region/{slug}.html
  Light page-surface background — contrast with dark scholars section above
```

---

### 7.13 New to Islam Section

```
┌──────────────────────────────────────┬───────────────────────────────────────┐
│  NEW TO ISLAM?                       │  ┌──────────────────────────────────┐ │
│  Start Your Journey                  │  │ 🕋 Start with the Foundations   │ │
│                                      │  │ 5 curated beginner articles…    │ │
│  Get your free beginner's guide →    │  └──────────────────────────────────┘ │
│ ┌────────────────────────────────┐   │  ┌──────────────────────────────────┐ │
│ │ your@email.com   [Get Guide]   │   │  │ 📿 Common Questions Answered    │ │
│ └────────────────────────────────┘   │  │ The 20 most-asked questions…    │ │
│  Free. No spam. Unsubscribe anytime. │  └──────────────────────────────────┘ │
│                                      │  ┌──────────────────────────────────┐ │
│   Left column: text + email form     │  │ ✓ Source-Verified from Day One  │ │
│                                      │  │ Every claim traceable to a…     │ │
│                                      │  └──────────────────────────────────┘ │
└──────────────────────────────────────┴───────────────────────────────────────┘
  2-col desktop → stacks at < 820px
  Success state: email row replaced with "✓ Check your inbox!"
  Error state: inline message below input
```

---

### 7.14 CTA Section

```
████████████████████ linear-gradient(135deg, #0A3A3D, #00696E, #062628) █████████
  ░ gold radial glow top-left (::before)

              ┌─────────────────────────────────────────────┐
              │  ✦ The World's Islamic Knowledge Hub        │  ← gold badge pill
              └─────────────────────────────────────────────┘

              Every answer you seek.
              Source-verified. Forever free.        ← italic

              "Say: Are those who know equal to those who do not know?"
                              — Al-Zumar 39:9

          ┌──────────────────────┐  ┌────────────────────────┐
          │   Explore the Hub    │  │   Islamic Studies →    │
          └──────────────────────┘  └────────────────────────┘
             .btn-primary               .btn-white-ghost
             href="#hero"               href="islamic-studies.html"
████████████████████████████████████████████████████████████████████████████████
```

---

## 8. Design System Compliance

All components must strictly adhere to CLAUDE.md v3.0. The following rules are non-negotiable:

| Rule | Requirement | Reference |
|---|---|---|
| Card hover | `translateY(-5px) scale(1.012)` + teal glow ring | CLAUDE.md §27.4 |
| NO shimmer | `::after` sweep/shimmer animations are permanently banned on all cards | CLAUDE.md §27.4 |
| Dark card hover | `rgba(88,193,199,.18)` teal glow — NOT the light-mode value | CLAUDE.md §27.4 |
| Buttons | `.btn-primary` / `.btn-ghost` / `.btn-white-ghost` specs | CLAUDE.md §9 |
| CTA section | Last before footer; dark teal gradient | CLAUDE.md §11 |
| Footer CSS | `ft-top / ft-brand / ft-link / ft-bot` system | CLAUDE.md §7 |
| Header | `site-header / brand / nav / header-tools` structure | CLAUDE.md §4 |
| Reveal animation | `.reveal` + IntersectionObserver threshold 0.12; stagger via `.reveal-d1` through `.reveal-d4` | CLAUDE.md §12 |
| Colors | All `--teal-*` and `--gold-*` tokens only; no raw hex inline | CLAUDE.md §1 |
| Arabic text | Always `font-family: var(--font-arabic)` (Amiri), `direction: rtl` | CLAUDE.md §20 |
| Bismillah | Teal gradient (light) / gold gradient + drop-shadow (dark) | CLAUDE.md §5 |
| Easing | All transitions: `var(--ease-reverent)` or `var(--ease-premium)` | CLAUDE.md §13 |
| Page shell | `<html lang="en" data-theme="light">` · Cormorant Garamond + Inter + Amiri fonts | CLAUDE.md §2 |

---

## 9. SEO & Schema Requirements

### 9.1 Hub Page Meta Tags (`knowledge-hub.html`)

```html
<!-- Primary SEO -->
<title>Knowledge Hub — Islamic Articles, Fiqh, History & More · IslamicInfo</title>
<meta name="description" content="2,400+ source-verified Islamic articles on Qur'an, Hadith, Fiqh, History, and modern Muslim life. Scholar-cited. Free forever. No ads.">
<link rel="canonical" href="https://islamicinfo.org/knowledge-hub.html">

<!-- Open Graph -->
<meta property="og:type"        content="website">
<meta property="og:title"       content="Knowledge Hub · IslamicInfo">
<meta property="og:description" content="The world's most comprehensive source-verified Islamic encyclopedia. 2,400+ articles, free forever.">
<meta property="og:url"         content="https://islamicinfo.org/knowledge-hub.html">
<meta property="og:image"       content="https://islamicinfo.org/assets/og/knowledge-hub-og.jpg">
<meta property="og:image:width"  content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt"   content="IslamicInfo Knowledge Hub — Islamic articles, sourced and verified">

<!-- Twitter / X Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:site"        content="@IslamicInfo">
<meta name="twitter:title"       content="Knowledge Hub · IslamicInfo">
<meta name="twitter:description" content="2,400+ source-verified Islamic articles. Free, no ads, no fatwas.">
<meta name="twitter:image"       content="https://islamicinfo.org/assets/og/knowledge-hub-og.jpg">
<meta name="twitter:image:alt"   content="IslamicInfo Knowledge Hub">
```

**og:image spec:** 1200×630px JPEG, max 300KB. Content: IslamicInfo logo + "Knowledge Hub" in Cormorant Garamond over teal gradient background + Bismillah in gold Arabic text. Must render legibly at 600×315 (half-size Twitter preview).

### 9.2 Schema Markup

| Schema Type | Page | Priority | Notes |
|---|---|---|---|
| `FAQPage` | `knowledge-hub.html` `<head>` | 🔴 P0 | All 8 questions; plain-text answers |
| `WebSite` + `SearchAction` | `knowledge-hub.html` `<head>` | 🔴 P0 | Enables sitelinks search box in Google |
| `Organization` | `knowledge-hub.html` `<head>` | 🟠 P1 | Brand knowledge panel |
| `Article` | Each `/articles/{slug}.html` | 🔴 P0 | `headline`, `author`, `datePublished`, `citation` |
| `BreadcrumbList` | Cluster + article pages | 🔴 P0 | Full path: IslamicInfo > Knowledge Hub > Cluster > Article |
| `Person` | `/scholars/{slug}.html` | 🟡 P2 | `name`, `birthDate`, `deathDate`, `knowsAbout` |

### 9.3 Sitemap Requirements

- All pages listed in this PRD must be in `sitemap.xml` before launch.
- Format: `<loc>` + `<lastmod>` + `<changefreq>` + `<priority>`.
- Priority values: hub page `1.0` · cluster pages `0.8` · article pages `0.7` · other child pages `0.6`.
- Submit sitemap to Google Search Console and Bing Webmaster Tools on launch day.
- Sitemap must update automatically when new articles are published (if CMS is used).

### 9.4 Core Web Vitals Targets

| Metric | Target | Measurement |
|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | PageSpeed Insights · field data |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | PageSpeed Insights · field data |
| INP (Interaction to Next Paint) | ≤ 200ms | PageSpeed Insights · field data |
| TTFB (Time to First Byte) | ≤ 800ms | PageSpeed Insights · lab data |

---

## 10. Navigation & Link Audit

All links requiring fixes before go-live (🔴) or first post-launch sprint (🟠). Article slugs spelled out explicitly.

| # | Element | Location | Current State | Correct Target | Priority |
|---|---|---|---|---|---|
| 1 | Hero search submit | Hero | No action | `/search.html?q={query}` | 🔴 |
| 2 | Header search submit | Header popup | No action | `/search.html?q={query}` | 🔴 |
| 3 | Tag: "What is Zakat?" | Hero chips | Unwired | `/articles/what-is-zakat.html` | 🔴 |
| 4 | Tag: "99 Names of Allah" | Hero chips | Unwired | `/articles/99-names-of-allah.html` | 🔴 |
| 5 | Tag: "Pillars of Islam" | Hero chips | Unwired | `/articles/five-pillars-of-islam.html` | 🔴 |
| 6 | Tag: "Is music haram?" | Hero chips | Unwired | `/articles/is-music-haram-islam.html` | 🔴 |
| 7 | Tag: "Prophet Muhammad ﷺ" | Hero chips | Unwired | `/articles/prophet-muhammad-biography.html` | 🔴 |
| 8 | Tag: "Day of Judgment" | Hero chips | Unwired | `/articles/day-of-judgment-signs.html` | 🔴 |
| 9 | Tag: "Ramadan guide" | Hero chips | Unwired | `/articles/ramadan-complete-guide.html` | 🔴 |
| 10 | Cluster: Five Pillars | Cluster grid | `filterCluster()` | `/cluster/five-pillars.html` | 🔴 |
| 11 | Cluster: Qur'an & Revelation | Cluster grid | `filterCluster()` | `/cluster/quran-revelation.html` | 🔴 |
| 12 | Cluster: Prophets & Companions | Cluster grid | `filterCluster()` | `/cluster/prophets-companions.html` | 🔴 |
| 13 | Cluster: Islamic Law · Fiqh | Cluster grid | `filterCluster()` | `/cluster/islamic-law-fiqh.html` | 🔴 |
| 14 | Cluster: Faith & Theology | Cluster grid | `filterCluster()` | `/cluster/faith-theology.html` | 🔴 |
| 15 | Cluster: Islamic History | Cluster grid | `filterCluster()` | `/cluster/islamic-history.html` | 🔴 |
| 16 | Cluster: Spirituality & Character | Cluster grid | `filterCluster()` | `/cluster/spirituality-character.html` | 🔴 |
| 17 | Cluster: Islam in Modern Life | Cluster grid | `filterCluster()` | `/cluster/islam-modern-life.html` | 🔴 |
| 18 | Featured: "Read full article →" | Featured main card | Unwired | `/articles/99-names-of-allah.html` | 🔴 |
| 19 | Featured side: Golden Age | Featured side | Unwired | `/articles/golden-age-of-islam.html` | 🔴 |
| 20 | Featured side: Halal & Haram | Featured side | Unwired | `/articles/halal-haram-framework.html` | 🔴 |
| 21 | Featured side: Tawakkul | Featured side | Unwired | `/articles/tawakkul-trusting-allah.html` | 🔴 |
| 22 | Featured side: Ramadan Guide | Featured side | Unwired | `/articles/ramadan-complete-guide.html` | 🔴 |
| 23 | Trending #01 | Trending grid | Unwired | `/articles/99-names-of-allah.html` | 🔴 |
| 24 | Trending #02 | Trending grid | Unwired | `/articles/is-music-haram-islam.html` | 🔴 |
| 25 | Trending #03 | Trending grid | Unwired | `/articles/how-to-calculate-zakat.html` | 🔴 |
| 26 | Trending #04 | Trending grid | Unwired | `/articles/how-many-surahs-in-quran.html` | 🔴 |
| 27 | Trending #05 | Trending grid | Unwired | `/articles/sunni-vs-shia-differences.html` | 🔴 |
| 28 | Trending #06 | Trending grid | Unwired | `/articles/how-to-perform-salah.html` | 🔴 |
| 29 | Trending #07 | Trending grid | Unwired | `/articles/islamic-mortgage-halal.html` | 🔴 |
| 30 | Trending #08 | Trending grid | Unwired | `/articles/who-was-ibn-battuta.html` | 🔴 |
| 31 | "See all trending →" | Trending section | `href="#"` | `/trending.html` | 🔴 |
| 32 | Latest: Rightly-Guided Caliphs | Latest grid | Unwired | `/articles/rightly-guided-caliphs.html` | 🔴 |
| 33 | Latest: Sabr | Latest grid | Unwired | `/articles/sabr-patience-in-quran.html` | 🔴 |
| 34 | Latest: Islamic Finance | Latest grid | Unwired | `/articles/islamic-finance-halal-transaction.html` | 🔴 |
| 35 | Latest: How to Take Shahada | Latest grid | Unwired | `/articles/how-to-take-shahada.html` | 🔴 |
| 36 | Latest: Sunnah in Practice | Latest grid | Unwired | `/articles/sunnah-obligatory-vs-recommended.html` | 🔴 |
| 37 | Latest: Day of Judgment | Latest grid | Unwired | `/articles/day-of-judgment-signs.html` | 🔴 |
| 38 | CTA "Islamic Studies →" | CTA section | `href="learn.html"` | `islamic-studies.html` | 🔴 |
| 39 | Footer IS link | Footer | `href="learn.html"` | `islamic-studies.html` | 🔴 |
| 40 | FAQ "Read full article" × 8 | All FAQ items | Missing entirely | `/articles/{slug}.html` per FAQ | 🔴 |
| 41 | FAQ JSON-LD schema | `<head>` | Missing | Add FAQPage JSON-LD | 🔴 |
| 42 | OG + Twitter meta tags | `<head>` | Missing | Add per §9.1 spec | 🔴 |
| 43 | Sitemap entry | `sitemap.xml` | Missing | Add all KH URLs | 🔴 |
| 44 | Ticker item: 99 Names | Ticker | Display-only | `/articles/99-names-of-allah.html` | 🟠 |
| 45 | Ticker item: Prayer in Quran | Ticker | Display-only | `/articles/how-many-times-prayer-in-quran.html` | 🟠 |
| 46 | Ticker item: Four Schools | Ticker | Display-only | `/articles/four-schools-of-islamic-law.html` | 🟠 |
| 47 | Ticker item: Ibn Khaldun | Ticker | Display-only | `/articles/ibn-khaldun-civilization.html` | 🟠 |
| 48 | Ticker item: Zakat al-Fitr | Ticker | Display-only | `/articles/zakat-al-fitr-vs-zakat-al-mal.html` | 🟠 |
| 49 | Ticker item: Night of Qadr | Ticker | Display-only | `/articles/night-of-qadr.html` | 🟠 |
| 50 | Ticker item: Tawakkul | Ticker | Display-only | `/articles/tawakkul-trusting-allah.html` | 🟠 |
| 51 | Ticker item: Islamic Finance | Ticker | Display-only | `/articles/islamic-finance-halal-transaction.html` | 🟠 |
| 52 | Scholar: Ibn Kathir | Scholar section | Display-only | `/scholars/ibn-kathir.html` | 🟠 |
| 53 | Scholar: al-Bukhari | Scholar section | Display-only | `/scholars/al-bukhari.html` | 🟠 |
| 54 | Scholar: Ibn Khaldun | Scholar section | Display-only | `/scholars/ibn-khaldun.html` | 🟠 |
| 55 | Scholar: al-Ghazali | Scholar section | Display-only | `/scholars/al-ghazali.html` | 🟠 |
| 56 | Email "Get the Guide" | New to Islam | No backend | Mailchimp / ConvertKit / Brevo | 🟠 |
| 57 | Region: Arabian Peninsula | Regions | Display-only | Future `/region/arabian-peninsula.html` | 🟢 |
| 58 | Region: South Asia | Regions | Display-only | Future `/region/south-asia.html` | 🟢 |
| 59 | Region: Southeast Asia | Regions | Display-only | Future `/region/southeast-asia.html` | 🟢 |
| 60 | Region: North America | Regions | Display-only | Future `/region/north-america.html` | 🟢 |
| 61 | Region: United Kingdom | Regions | Display-only | Future `/region/united-kingdom.html` | 🟢 |
| 62 | Region: Sub-Saharan Africa | Regions | Display-only | Future `/region/sub-saharan-africa.html` | 🟢 |

**Total P0 links to fix before launch: 43**  
**Total P1 links to wire in sprint 1: 13**  
**Total P3 (future, no date): 6**

---

## 11. New Pages to Build

| Page | URL | Template | Est. Effort | Priority |
|---|---|---|---|---|
| Search results | `/search.html` | New design | M | 🔴 P0 |
| Cluster landing (×8) | `/cluster/{slug}.html` | 1 shared template | L | 🔴 P0 |
| Article detail (×20 initial) | `/articles/{slug}.html` | 1 shared template | L | 🔴 P0 |
| Start Here | `/start-here.html` | New design | S | 🟠 P1 |
| Trending page | `/trending.html` | New design | S | 🟠 P1 |
| Scholar profile (×4) | `/scholars/{slug}.html` | 1 shared template | M | 🟡 P2 |
| Region filtered articles (×6) | `/region/{slug}.html` | Cluster template | S | 🟢 P3 |

_Effort: S = < 1 day · M = 1–2 days · L = 3–5 days_

---

## 12. Technical Notes

### 12.1 Current Implementation Stack

- Static HTML with embedded CSS and JavaScript — no build tool, no framework.
- CSS custom properties: CLAUDE.md v3.0 token system (all `--teal-*`, `--gold-*`, `--ink-*`, `--surface-*`).
- Layout: CSS Grid + Flexbox.
- Scroll animations: `IntersectionObserver` with threshold `0.12`, adds `.in` class to `.reveal` elements.
- Client-side JS: theme toggle · search popup · mobile menu · FAQ accordion · reveal observer.

### 12.2 Cluster Click Fix

```javascript
// ❌ CURRENT — placeholder, does nothing:
onclick="filterCluster('pillars')"

// ✅ REQUIRED — convert cluster cards to <a> tags:
<a href="/cluster/five-pillars.html" class="cluster-card">
  <!-- card contents unchanged -->
</a>
// This is semantically correct, keyboard-accessible, and right-clickable.
```

### 12.3 Ticker Duplication Pattern (Seamless Loop)

```html
<!-- The inner div must contain the items TWICE — first half scrolls,
     second half is a pixel-perfect copy that creates the seamless loop.
     translateX(-50%) at 100% keyframe = exactly one full width. -->
<div class="ticker-inner">
  <!-- FIRST HALF -->
  <a class="ticker-item" href="/articles/99-names-of-allah.html">
    <span class="ticker-dot"></span>
    <span class="ticker-label">NEW</span>
    What are the 99 Names of Allah?
  </a>
  <!-- … 7 more items … -->

  <!-- SECOND HALF — identical copy of first half -->
  <a class="ticker-item" href="/articles/99-names-of-allah.html">
    <span class="ticker-dot"></span>
    <span class="ticker-label">NEW</span>
    What are the 99 Names of Allah?
  </a>
  <!-- … 7 more identical items … -->
</div>
```

```css
@keyframes tickerScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }  /* -50% = width of ONE set of items */
}
.ticker-inner:hover { animation-play-state: paused; }
```

### 12.4 Stats Count-Up Animation

```javascript
// Wire to IntersectionObserver so it fires once when .stats-strip enters viewport
function countUp(el, target, suffix, duration = 1800) {
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + (suffix && current > target * 0.95 ? suffix : '');
    }
  }, 16);
}

// Example usage:
// countUp(document.querySelector('.stat-articles'), 2400, '+');
// countUp(document.querySelector('.stat-clusters'), 8, '');
// The "0 Ads" stat is fixed — never animate it.
```

### 12.5 Search Routing

```javascript
// Wire to both hero form and header popup form
function initSearch(formId, inputId) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  if (!form || !input) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const q = input.value.trim();
    if (q.length >= 2) {
      window.location.href = '/search.html?q=' + encodeURIComponent(q);
    }
  });
}
initSearch('heroSearchForm', 'heroSearch');
initSearch('headerSearchForm', 'searchPopupInput');
```

### 12.6 Email Form Error Handling

```javascript
async function submitEmailForm(email) {
  const btn = document.getElementById('emailSubmitBtn');
  const input = document.getElementById('emailInput');
  const feedback = document.getElementById('emailFeedback');

  // Client-side validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    feedback.textContent = 'Please enter a valid email address.';
    feedback.className = 'email-feedback error';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Server error');
    // Success state
    input.closest('.email-form-row').innerHTML =
      '<p class="email-success">✓ Check your inbox! Your first email is on its way.</p>';
    // GA4 event
    gtag('event', 'kh_email_signup', { email_provider: 'configured' });
  } catch {
    feedback.textContent = 'Something went wrong — please try again.';
    feedback.className = 'email-feedback error';
    btn.disabled = false;
    btn.textContent = 'Get the Guide';
  }
}
```

### 12.7 Reveal Animation Pattern (Reference)

The reveal system is already implemented in `knowledge-hub.html`. This is how it works for reference when building child pages:

```css
/* Base state — invisible, shifted down */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .65s var(--ease-reverent), transform .65s var(--ease-reverent);
}
.reveal.in { opacity: 1; transform: none; }

/* Stagger delays for card grids */
.reveal-d1 { transition-delay: .10s; }
.reveal-d2 { transition-delay: .20s; }
.reveal-d3 { transition-delay: .30s; }
.reveal-d4 { transition-delay: .40s; }
```

```javascript
// IntersectionObserver — already in site-wide script block
const _ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); _ro.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => _ro.observe(el));
```

Usage: add `class="reveal"` to any element. Add `reveal-d1` through `reveal-d4` to stagger child elements.

### 12.8 LocalStorage Keys

| Key | Type | Purpose | Set By |
|---|---|---|---|
| `islamicinfo-theme` | `string` (`"light"` / `"dark"`) | Theme preference | Theme toggle JS |
| `islamicinfo-kh-bookmarks` | `JSON array` of article slugs | Article bookmarks | Article page bookmark button |

---

## 13. Content Editorial Standards

These standards apply to all articles published under `/articles/`, all FAQ answers on the hub page, and all cluster descriptions.

### 13.1 Scholar Citation Format

Every factual claim requires attribution. The standard inline citation format is:

```
[📚 Source: {Scholar Name} · {Book Title} · {Reference Number or Chapter}]
```

Examples:
- `[📚 Source: Imam al-Bukhari · Sahih al-Bukhari · Hadith #8]`
- `[📚 Source: Ibn Kathir · Tafsir al-Qur'an al-'Azim · Surah Al-Fatihah commentary]`
- `[📚 Source: Imam al-Nawawi · Riyadh al-Salihin · Chapter on Sincerity]`

A minimum of 2 scholar citations is required per article. Anonymous internet sources, social media, and non-scholarly websites are not acceptable citation sources.

### 13.2 Arabic Text Policy

- All Arabic text uses `font-family: var(--font-arabic)` (Amiri), `direction: rtl`, `text-align: right`.
- Every Arabic quotation is followed immediately by its English translation.
- Transliteration (romanised Arabic) is permitted as a third layer but is not a substitute for the Arabic text.
- Arabic decorative ghost text in card backgrounds and article headers uses `color: rgba(255,255,255,.15)` and is `pointer-events: none`.

### 13.3 Article Word Count

| Article Type | Word Count Range |
|---|---|
| FAQ answer (hub page) | 60–120 words |
| Short article (explainer) | 600–900 words |
| Standard article | 900–2,000 words |
| Deep-dive article | 2,000–4,500 words |

Articles below 600 words (excluding FAQs) must not be published as standalone article pages — they belong in FAQ format.

### 13.4 No-Fatwa Rule

- Articles explain, contextualise, and present scholarly positions — they do not issue rulings.
- When scholarly disagreement (ikhtilaf) exists, all major positions must be presented neutrally with their sources.
- Articles must never conclude with "therefore X is permissible/forbidden."
- The phrase "IslamicInfo recommends…" must never appear in article content.

### 13.5 Reading Time Calculation

Reading time displayed on cards = `Math.ceil(wordCount / 238)` minutes, where 238 is the average adult reading speed for educational content (lower than general 250–300 wpm to account for Arabic text and pausing on citations).

### 13.6 Category & Cluster Assignment

Every article belongs to exactly one cluster and may optionally have one or two sub-topic tags. An article cannot be assigned to "Uncategorised" — if it doesn't fit any cluster, it is not ready for publication.

### 13.7 Scholarly Disagreement Boxes

When an article covers a topic where recognized scholars hold differing positions, a visually distinct "Scholarly Positions" box must be included:

```html
<div class="ikhtilaf-box">
  <div class="ikhtilaf-label">Scholarly Disagreement (Ikhtilaf)</div>
  <p>This topic has more than one recognized scholarly position…</p>
</div>
```

CSS: gold-tinted background (`rgba(197,160,89,.08)`), gold left border (`border-left: 3px solid var(--gold-500)`).

---

## 14. Out of Scope

The following are explicitly excluded from this PRD. They must not be built or implied without a separate approved specification:

- User accounts, login, registration, or personalisation beyond `localStorage`.
- Progress tracking, lesson prerequisites, or lock/unlock mechanics — these belong to `islamic-studies.html`.
- Fatwa issuance or editorial legal rulings in any article content.
- Anonymous claims published without named scholar attribution.
- Advertising, sponsored content, or paid placement of any kind.
- AI-generated article content published without human editorial review and source verification.
- User comment system or any user-generated content on article pages.
- Multilingual content in v1 — infrastructure may be prepared, but no non-English pages are in scope.
- Payment processing, donations, or premium tiers.
- Push notifications or service workers.

---

## 15. Open Questions

| # | Question | Owner | Due | Status |
|---|---|---|---|---|
| OQ-01 | Which email provider — Mailchimp, ConvertKit, or Brevo — for New to Islam capture? | Marketing | Before P1 sprint | ❓ Open |
| OQ-02 | Are article detail pages built statically (HTML files) or via a CMS (e.g. Sanity, Contentlayer)? | Engineering | Before P0 sprint | ❓ Open |
| OQ-03 | What is the source of truth for article counts per cluster — live CMS counts or manually updated? | Editorial | Before launch | ❓ Open |
| OQ-04 | Should Trending Now search volumes be live-updated via SEO API (Ahrefs/SEMrush) or updated manually on a monthly schedule? | Product | Before P1 sprint | ❓ Open |
| OQ-05 | Does the Share Image modal need the same `<canvas>` system used on Quran and Hadith pages, or a simpler static image approach? | Design | Before P0 sprint | ❓ Open |
| OQ-07 | Is there a CMS or editorial dashboard planned for publishing to `/articles/` — or is this a git-based static workflow? | Engineering | Before P0 sprint | ❓ Open |
| OQ-08 | Should the Regions section be wired to `/region/{slug}.html` filtered article pages in v1, or confirmed as display-only? | Product | Before launch | ❓ Open |

> **Note:** OQ-06 (FAQ open simultaneously) has been **resolved and closed.** Per Functional Doc §12.2: "Multiple FAQs can be open simultaneously (or configure to close others — either is acceptable)." Decision: multiple open simultaneously is the accepted behaviour. No auto-close. See US-012 AC.

---

*End of PRD — Knowledge Hub v1.1 (Final)*  
*Reference files: `knowledge-hub.html` · `CLAUDE_v3.md` · `Knowledge_Hub_Functional_Document_v2.0.md`*
