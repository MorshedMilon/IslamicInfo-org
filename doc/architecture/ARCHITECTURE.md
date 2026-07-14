# IslamicInfo — Platform Architecture Document
**`ARCHITECTURE.md` · IslamicInfo.org + Sub-Brand Umbrella**
*v1.0 · 2026-05-20 · Source: PRDs v1.1 (all 10 pages) + Tech Specs + Brand Identity Doc v1.0*

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Full URL & File Map](#2-full-url--file-map)
3. [Build Stage Roadmap](#3-build-stage-roadmap)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend & API Layer](#5-backend--api-layer)
6. [Data & Storage Layer](#6-data--storage-layer)
7. [SEO & Metadata Architecture](#7-seo--metadata-architecture)
8. [Performance Targets](#8-performance-targets)
9. [PWA & Offline Architecture](#9-pwa--offline-architecture)
10. [Analytics Architecture](#10-analytics-architecture)
11. [Sub-Brand Architecture](#11-sub-brand-architecture)
12. [Inter-Page Relationships](#12-inter-page-relationships)
13. [Shared Component Inventory](#13-shared-component-inventory)
14. [Error Handling & Fallback Strategy](#14-error-handling--fallback-strategy)
15. [Deployment Topology](#15-deployment-topology)
16. [Future Architecture Hooks](#16-future-architecture-hooks)

---

## 1. Platform Overview

IslamicInfo.org is a **static-first, progressively enhanced** Islamic knowledge platform. No framework dependency for MVP. All pages are single HTML files with inline CSS and JS. Feature complexity is gated behind build stages.

### Core Architecture Principles

1. **Static shell first** — every page renders its structure without JS. JS enhances but never gates core content.
2. **localStorage as the data layer** — no user accounts in v1. All personalisation is client-side.
3. **Server-side proxy for secrets** — no API keys in client JS. All external API calls go through `/api/` endpoints.
4. **CDN-cached API responses** — all external data (prayer times, hadith, Qur'an) is cached. Pages degrade gracefully on API failure.
5. **Design system locked** — CLAUDE.md v3.0 tokens, no framework, no bundler in v1. P2: introduce Vite or esbuild.
6. **No ads, no accounts, no paywalls** — architectural decisions that simplify the stack significantly.

### Tech Stack (v1)

| Layer | Technology | Notes |
|---|---|---|
| Markup | HTML5 semantic | Single-file pages in v1 |
| Styling | CSS custom properties (CLAUDE.md v3.0) | No CSS framework |
| Scripting | Vanilla JS (ES2022) | No framework — Web Workers for heavy tasks |
| Fonts | Google Fonts CDN | Cormorant Garamond, Inter, Amiri — preconnected |
| Audio | `<audio>` element | EveryAyah CDN for Qur'an recitation |
| AI | Anthropic Claude API | Server-proxied — `claude-sonnet-4-20250514` |
| External APIs | AlAdhan, api.quran.com, Sunnah.com, BigDataCloud | All server-proxied |
| Storage | `localStorage` | See §6 for full key registry |
| Analytics | Google Analytics 4 | Custom events per page |
| Hosting | CDN-fronted static host | Cloudflare / Vercel / Netlify compatible |

---

## 2. Full URL & File Map

### 2.1 IslamicInfo.org — All Pages

| Route | File | Stage | Status | Description |
|---|---|---|---|---|
| `/` | `index.html` | 1 | ✅ Core | Home — daily verse/hadith/dua, prayer strip, feature grid |
| `/quran` | `quran.html` | 1 | ✅ Core | Qur'an Explorer — surah reader, word-by-word, audio, tafsir |
| `/hadith` | `hadith.html` | 1 | ✅ Core | Hadith Library — collections index, trace layout, grade filter |
| `/islamic-studies` | `islamic-studies.html` | 1 | ✅ Core | Curriculum — pathways, lessons, quizzes, progress |
| `/knowledge-hub` | `knowledge-hub.html` | 1 | ✅ Core | Encyclopedia — 2,400+ articles, clusters, trending |
| `/dua` | `dua.html` | 1 | ✅ Core | Daily Duas — categorised dua library with audio |
| `/tools` | `tools.html` | 1 | ✅ Core | Tools suite — 12 Islamic utility tools |
| `/habits` | `habits.html` | 1 | ✅ Core | Habit Tracker — prayers, Qur'an, Adhkar, fasting, Sunnah |
| `/verify` | `verify.html` | 1 | ✅ Core | Claim verification engine |
| `/about` | `about.html` | 1 | ✅ Core | Mission, methodology, scholars, FAQ |

### 2.2 Qur'an Explorer — Sub-Routes

| Route | File | Stage | Description |
|---|---|---|---|
| `/quran` | `quran.html` | 1 | Default — loads Surah 1 (Al-Fatihah) |
| `/quran/[surah]/[ayah]` | `quran.html` | 2 | Deep-link — loads surah, scrolls to ayah, triggers gold pulse ring |
| `/quran/search` | `quran/search.html` | 2 | Dedicated Qur'an search (Arabic + English + topic) |
| `/quran/compare` | `quran/compare.html` | 3 | Side-by-side multi-translation comparison |
| `/quran/trace/[surah]/[ayah]` | `quran/trace.html` | 4 | Ayah trace / isnād research mode |

### 2.3 Hadith Library — Sub-Routes (3-Tier Navigation)

| Route | File | Stage | Description |
|---|---|---|---|
| `/hadith` | `hadith.html` | 1 | Tier 1 — Collections index (9 cards) + sidebar |
| `/hadith/[collection]` | `hadith/[collection].html` | 2 | Tier 2 — Books list for one collection |
| `/hadith/[collection]/[book]/[hadith]` | `hadith/[c]/[b]/[h].html` | 2 | Tier 3b — Single hadith deep view |
| `/hadith/[collection]/[book]` | `hadith/[c]/[b].html` | 2 | Tier 3a — Hadith list for one book |
| `/hadith/topics` | `hadith/topics.html` | 3 | Topic index (16 topic cards) |
| `/hadith/topics/[topic]` | `hadith/topics/[topic].html` | 3 | Topic landing — key hadiths + summary |
| `/hadith/compare` | `hadith/compare.html` | 4 | Side-by-side comparison (up to 3 hadith) |

**9 Hadith Collections:**
`bukhari` · `muslim` · `abu-dawud` · `tirmidhi` · `nasai` · `ibn-majah` · `malik` · `ahmad` · `nawawi-40`

### 2.4 Knowledge Hub — Sub-Pages

| Route | File | Stage | Priority | Description |
|---|---|---|---|---|
| `/knowledge-hub` | `knowledge-hub.html` | 1 | P0 | Hub homepage — clusters, trending, scholars, email capture |
| `/search` | `search.html` | 1 | P0 | Sitewide search — pre-populated from hero query param `?q={}` |
| `/articles/[slug]` | `articles/[slug].html` | 1 | P0 | Individual article — 20 articles at launch |
| `/cluster/[slug]` | `cluster/[slug].html` | 1 | P0 | 8 cluster landing pages |
| `/start-here` | `start-here.html` | 1 | P1 | New to Islam onboarding — 5 articles + FAQ |
| `/trending` | `trending.html` | 1 | P1 | All trending articles, sortable |
| `/scholars/[slug]` | `scholars/[slug].html` | 2 | P2 | Scholar biography pages (4 at launch) |
| `/region/[slug]` | `region/[slug].html` | 3 | P3 | Region-filtered article listings |

**8 Clusters:** `five-pillars` · `quran-revelation` · `prayer-salah` · `fiqh-jurisprudence` · `seerah` · `aqeedah` · `ethics-character` · `modern-muslim-life`

**20 Initial Articles (exact slugs):**
`what-is-zakat` · `99-names-of-allah` · `five-pillars-of-islam` · `is-music-haram-islam` · `prophet-muhammad-biography` · `day-of-judgment-signs` · `ramadan-complete-guide` + 13 others per editorial calendar

### 2.5 Islamic Studies — Routes

| Route | Description |
|---|---|
| `/islamic-studies` | Main curriculum page (single-scroll) |
| `/islamic-studies#pathways` | Jumps to Learning Pathways section |
| `/islamic-studies#track-aqeedah` | Scrolls to + opens Aqeedah track |
| `/islamic-studies?mode=ai` | Launches AI study assistant directly |
| `/knowledge-hub?lesson=[track-slug]-[lesson-index]` | IS → KH article handoff |
| `/knowledge-hub#[cluster-slug]` | IS → KH cluster filter |

### 2.6 Utility & Legal Pages

| Route | File | Stage | Notes |
|---|---|---|---|
| `/contact` | `contact.html` | 1 | **GAP** — linked from About/footer; must be created |
| `/team` | `team.html` | 2 | **GAP** — footer "Meet the Team" links here |
| `/privacy` | `privacy.html` | 1 | Footer legal link |
| `/terms` | `terms.html` | 1 | Footer legal link |
| `/sitemap.xml` | auto-generated | 1 | All production routes; required before launch |
| `/robots.txt` | static | 1 | Disallow staging; allow all on production |

---

## 3. Build Stage Roadmap

### Stage 1 — Static Foundation (Current)
**Goal:** pixel-perfect replica of all 10 canonical blueprints. Both themes. All sections rendered. Static content only. No real API calls.

| Page | Blueprint file | Stage 1 outcome |
|---|---|---|
| Home | `home_fixed.html` | Static verse/hadith/dua, prayer strip with hardcoded times, feature grid, footer |
| Quran Explorer | `quran_v5.html` | Surah reader loads Surah 1, word-by-word active by default, audio controls, 3-source tafsir panel |
| Hadith Library | `hadith_module_enhanced__1_.html` | 9-collection sidebar, trace layout, grade filter chips, static hadith display |
| Islamic Studies | `islamic_studies_optionB.html` | All pathway cards, lesson sequence display, quiz band (static stats), IS↔KH handoff |
| Knowledge Hub | `knowledge-hub.html` | All clusters, trending ticker, scholar spotlight, email capture form, search routes |
| Daily Duas | `dua.html` | Full dua library, category filters |
| Tools | `tools.html` | All 12 tools, hardcoded prayer times, static Nisab `$6,180` |
| Habit Tracker | `habits.html` | Full 5-tab tracker, `localStorage` state fully wired |
| Verify | `verify.html` | 2200ms simulation, static demo result |
| About | `about.html` | Counter animation, FAQ, methodology timeline |

**Stage 1 completion criteria:**
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 90 on all 10 pages
- [ ] Both light and dark themes verified on all pages
- [ ] All `localStorage` keys wired (Habit Tracker, Islamic Studies progress)
- [ ] All nav links, footer links, CTA hrefs correct — no `href="#"` in production
- [ ] `sitemap.xml` and `robots.txt` deployed
- [ ] `contact.html` and `privacy.html` and `terms.html` exist

---

### Stage 2 — Live Data & Deep Links
**Goal:** Real API data flowing. Deep-link routes live. Audio working. Bookmarks/notes persisted.

| Feature | Pages | APIs |
|---|---|---|
| Live prayer times | Home, Tools | AlAdhan API (proxied) |
| Live Qur'an verse/hadith/dua rotation | Home | api.quran.com, Sunnah.com |
| Qur'an full reader with live API | Quran Explorer | api.quran.com `/v4` |
| 50+ reciters dropdown + audio | Quran Explorer | EveryAyah CDN |
| Hadith Tier 2 + Tier 3 routes | Hadith Library | Sunnah.com API |
| Deep-link `/quran/[surah]/[ayah]` | Quran Explorer | api.quran.com |
| Bookmarks + notes | Quran Explorer, Hadith Library | `localStorage` |
| `islamicinfo-is-progress` wiring | Islamic Studies | `localStorage` |
| Return-detection (`visibilitychange`) | Islamic Studies | `localStorage` |
| Quiz full flow + gating | Islamic Studies | `localStorage` |
| Live Nisab (gold price) | Tools/Zakat | Metals API (proxied) |
| Email capture | Knowledge Hub | `/api/subscribe` |
| Service worker + PWA | Quran Explorer | `quran-sw.js` |
| Sentry + uptime monitoring | All | Sentry SDK |
| GA4 custom events | All | Google Analytics 4 |

---

### Stage 3 — AI, Topics & Advanced Features
**Goal:** AI explanation integrated. Topic navigation live. Advanced search.

| Feature | Pages | Dependencies |
|---|---|---|
| AI explanation panel (`/api/ask-claude`) | Quran Explorer, Hadith Library | Anthropic API (proxied) |
| QuranlyAI attribution on AI panels | Quran Explorer, Hadith Library | — |
| Hadith topics route (`/hadith/topics`) | Hadith Library | Sunnah.com |
| Qur'an compare mode (`/quran/compare`) | Quran Explorer | api.quran.com |
| Scholar page (`/scholars/[slug]`) | Knowledge Hub | Static pages |
| Related-hadith graph | Hadith Library | Graph data (Stage 3 data model) |
| Hadith narrator grades | Hadith Library | Grade database |
| `islamicinfo-lang` i18n selector | All | Locale JSON files (CDN) |
| Web Workers for AI fetch | Quran Explorer, Hadith Library | Browser Worker API |

---

### Stage 4 — Accounts, PWA Full, Advanced Tools
**Goal:** Optional user accounts. Cross-device sync. Advanced Qur'an research.

| Feature | Pages | Notes |
|---|---|---|
| User accounts (optional) | All | Auth hook — `localStorage` migrates to server-side |
| Cross-device sync | Habit Tracker, Islamic Studies | `/api/sync` endpoint |
| PDF/WhatsApp citation export | Verify, Hadith Library | `/api/export/pdf` |
| Qur'an trace view (`/quran/trace`) | Quran Explorer | Research mode |
| Hadith compare (`/hadith/compare`) | Hadith Library | 3-pane layout |
| Saved verifications | Verify | Requires accounts |
| Certificate generation | Islamic Studies | Canvas API + localStorage |
| Private reading analytics | Knowledge Hub | Opt-in only |
| Region pages (`/region/[slug]`) | Knowledge Hub | 6 region cluster pages |

---

## 4. Frontend Architecture

### 4.1 File Structure

```
islamicinfo.org/
│
├── index.html                      # Home
├── quran.html                      # Quran Explorer
├── hadith.html                     # Hadith Library
├── islamic-studies.html            # Islamic Studies
├── knowledge-hub.html              # Knowledge Hub
├── dua.html                        # Daily Duas
├── tools.html                      # Tools
├── habits.html                     # Habit Tracker
├── verify.html                     # Verify
├── about.html                      # About
│
├── contact.html                    # GAP — must create
├── privacy.html                    # Legal
├── terms.html                      # Legal
├── search.html                     # Sitewide search
├── start-here.html                 # New to Islam (KH sub-page)
├── trending.html                   # Trending articles (KH sub-page)
│
├── /quran/
│   ├── search.html                 # Stage 2
│   ├── compare.html                # Stage 3
│   └── trace.html                  # Stage 4
│
├── /hadith/
│   ├── [collection].html           # Stage 2 (×9)
│   ├── topics.html                 # Stage 3
│   └── compare.html                # Stage 4
│
├── /articles/
│   └── [slug].html                 # Stage 1 (×20 initial)
│
├── /cluster/
│   └── [slug].html                 # Stage 1 (×8)
│
├── /scholars/
│   └── [slug].html                 # Stage 2 (×4)
│
├── /api/                           # Server-side proxy routes
│   ├── prayer.js                   # AlAdhan proxy
│   ├── nisab.js                    # Gold price proxy
│   ├── verse.js                    # Daily verse rotation
│   ├── hadith.js                   # Sunnah.com proxy
│   ├── verify.js                   # Hadith corpus search
│   ├── ask-claude.js               # Anthropic API proxy (Stage 3)
│   └── subscribe.js                # Email capture (KH)
│
├── /data/
│   └── reciters.json               # Bundled slug→CDN path map (Quran audio)
│
├── /assets/
│   ├── /og/                        # Open Graph images (1200×630px JPEG)
│   │   ├── home-og.jpg
│   │   ├── quran-og.jpg
│   │   ├── hadith-og.jpg
│   │   ├── knowledge-hub-og.jpg
│   │   └── [page]-og.jpg           # One per page
│   ├── /icons/
│   │   ├── icon-192.svg            # PWA manifest icon
│   │   └── icon-512.svg            # PWA manifest icon
│   └── /illustrations/
│       └── /hadith/                # 9 collection SVG illustrations
│
├── /js/                            # P2 extraction (currently inline)
│   ├── theme.js                    # applyTheme() — loaded inline in <head>
│   ├── habits.js                   # Habit tracker state
│   ├── islamic-studies.js          # IS progress + quiz
│   └── quran.js                    # Quran reader
│
├── manifest.json                   # PWA manifest (Stage 2)
├── quran-sw.js                     # Quran service worker (Stage 2)
├── sitemap.xml                     # All production routes
└── robots.txt                      # Disallow /api/, /data/
```

### 4.2 JS Architecture

**v1 pattern:** All JS inline in single `<script>` block at end of `<body>`. `applyTheme()` inline in `<head>` to prevent FOUC.

**Stage 2+:** Extract to `/js/` modules. Web Workers for AI explanation fetch (Quran Explorer, Hadith Library).

**Module-scoped state pattern:**
```js
// Each page's JS is self-contained. No global namespace pollution.
// State lives in module-scoped lets; persisted to localStorage.
// Pattern: init() → loadState() → renderAll() → bind events
```

**Shared functions (identical across all pages):**
- `applyTheme(t)` — theme toggle + localStorage persist
- `openMM()` / `closeMM()` — mobile menu
- IntersectionObserver `_ro` — `.reveal` scroll animation
- `toggleFaq(el)` — FAQ accordion (close-all-then-open pattern)

### 4.3 CSS Architecture

**v1:** Inline `<style>` block in each page. CLAUDE.md v3.0 tokens in `:root`. Dark mode in separate `[data-theme="dark"]` sibling block — never merged.

**Stage 2+:** Extract to shared `styles/global.css` (tokens + components) + page-specific overrides.

**Critical CSS rules enforced on every build:**
- No shimmer `::after` sweep on any card
- `[data-theme="dark"]` is always a sibling to `:root`
- No raw hex inline (except SVG `<defs>`)
- `@media (prefers-reduced-motion: reduce)` — disable all `transform` animations, keep opacity only

---

## 5. Backend & API Layer

All server-side routes live under `/api/`. API keys are **never** in client-side code — always in server env vars.

### 5.1 API Proxy Endpoints

| Endpoint | Method | External API | Cache TTL | Fallback |
|---|---|---|---|---|
| `/api/prayer` | GET | AlAdhan `timingsByCity` | 24h per city+date | Hardcoded London MWL times |
| `/api/nisab` | GET | Metals API gold price | 24h | `$6,180` hardcoded |
| `/api/verse` | GET | api.quran.com random verse | 24h (cache-bust daily) | Static hardcoded verse |
| `/api/hadith` | GET | Sunnah.com `/v1/collections/...` | 24h | Last cached response |
| `/api/geocode` | GET | BigDataCloud reverse geocode | Session | `'Near your location'` |
| `/api/quran/[surah]` | GET | api.quran.com `/v4/verses/by_chapter/{id}` | 7 days | Static seed data |
| `/api/verify` | POST | IslamicInfo corpus search | None | 2200ms simulation in v1 |
| `/api/ask-claude` | POST | Anthropic API | None (conversational) | "AI unavailable" inline state |
| `/api/subscribe` | POST | Email provider | None | Inline error state |

### 5.2 Anthropic API Usage (Stage 3+)

```js
// Model: claude-sonnet-4-20250514
// max_tokens: 1000
// System prompt enforces: no fatwas, source-cited only, cite grade
// AI Safety: non-overridable system prompt blocks fatwa/ruling output
// Attribution: "Powered by QuranlyAI" shown on every AI response card
```

**AI Safety rules (hard-coded in system prompt):**
- AI never issues a fatwa or religious ruling
- AI always cites the hadith collection, book, and number
- AI always shows the authenticity grade
- If user asks for a ruling: "For personal religious guidance, consult a qualified scholar"

### 5.3 Sunnah.com API — Hadith Library

```
Base: https://api.sunnah.com/v1/
Collections: /collections
Books: /collections/{collection}/books
Hadiths: /collections/{collection}/books/{book}/hadiths
```

Cache: 24h per collection+book combination. `localStorage` key: `islamicinfo-hadith-{collection}-{book}-{date}`.

### 5.4 api.quran.com — Quran Explorer

```
Base: https://api.quran.com/api/v4/
Verses: /verses/by_chapter/{chapter_number}
Translations: ?translations=131,85,95 (Sahih Int'l + 2 others)
Audio: ?audio={reciter_id}
Tafsir: /tafsirs/{tafsir_id}/by_chapter/{chapter}
```

Audio CDN pattern (EveryAyah):
```
https://everyayah.com/data/{reciter_path}/{surah_padded}{ayah_padded}.mp3
```

### 5.5 Daily Content Rotation (Home Page)

```
Verse of the Day:  api.quran.com random verse — cached 24h, cache-bust daily at midnight UTC
Hadith of the Day: Sunnah.com — SAHIH badge always shown — cached 24h
Dua of the Day:    Static rotation from dua library — keyed by day-of-year
```

---

## 6. Data & Storage Layer

### 6.1 Complete localStorage Key Registry

All keys prefixed `islamicinfo-` or `ii-`. No collisions with sub-brand products (which use their own prefix).

| Key | Shape | Owner page | Persists |
|---|---|---|---|
| `islamicinfo-theme` | `'light'\|'dark'` | All pages | Until user changes |
| `islamicinfo-lang` | string | Future (i18n) | Until user changes |
| `islamicinfo-prayer-{city}-{date}` | JSON PrayerData | Tools, Home | 1 day |
| `islamicinfo-prayer-city` | string | Tools, Home | Until user changes |
| `islamicinfo-prayer-method` | string | Tools | Until user changes |
| `islamicinfo-nisab-{date}` | JSON | Tools | 1 day |
| `islamicinfo-qibla-city` | string | Tools | Until user changes |
| `islamicinfo-hadith-last-read` | `{collectionSlug, bookNum, hadithNum}` | Hadith Library | Until overwritten |
| `islamicinfo-hadith-bookmarks` | `HadithBookmark[]` | Hadith Library | Permanent |
| `islamicinfo-hadith-notes` | `HadithNote[]` | Hadith Library | Permanent |
| `islamicinfo-is-progress` | IS progress schema (see §6.2) | Islamic Studies | Permanent |
| `islamicinfo-is-visit` | `{trackSlug, lessonIndex, departedAt}` | Islamic Studies | Cleared on return |
| `ii-habits` | Habit state schema (see §6.3) | Habit Tracker | Permanent |
| `ii-quran-translation` | string (translation edition ID) | Quran Explorer | Until user changes |
| `ii-quran-reading-mode` | boolean | Quran Explorer | Until user changes |
| `tasbeeh-session-{YYYY-MM-DD}` | `{dhikr: string, count: number}[]` | Tools | 30 days |
| `fasting-{month-year}` | `{fastedDays: number[]}` | Tools | Permanent |
| `sadaqah-ledger` | `{date, amount, cause}[]` | Tools | Permanent |
| `sadaqah-goal` | number | Tools | Until user changes |

### 6.2 Islamic Studies Progress Schema

```json
{
  "[trackSlug]": {
    "done": [0, 1, 2],
    "quizScores": [92, 88, 85]
  },
  "streak": {
    "count": 14,
    "lastDate": "YYYY-MM-DD",
    "longestStreak": 21
  },
  "certificates": ["aqeedah", "taharah"]
}
```

**Unlock logic:**
- **Beginner → Intermediate:** ALL beginner tracks complete (all lessons done + all `quizScores ≥ 70%`)
- **Quiz pass threshold:** 70% (≥ 4/5 correct)
- **Quiz fail:** retry immediately, no cooldown
- **Return-detection:** `visibilitychange` + `islamicinfo-is-visit.departedAt` < 30 min → mark lesson `ln-read`

### 6.3 Habit Tracker State Schema

```json
{
  "dateKey": "YYYY-MM-DD",
  "prayers": [false, false, false, false, false],
  "sunnahPrayers": { "Qiyam": false, "Duha": false, "Witr": false, "Tahajjud": false },
  "quranPages": 0,
  "quranGoal": 5,
  "duaChecked": [false, false, false, false, false, false],
  "fastingDays": { "YYYY-MM-DD": true },
  "sunnahItems": [false, false, false, false, false, false],
  "streak": 0,
  "longestStreak": 0,
  "history": {
    "YYYY-MM-DD": { "prayers": 5, "score": 88, "quranPages": 3 }
  }
}
```

**Sunnah Score formula:**
```js
score = Math.round(
  (prayers.filter(Boolean).length / 5) * 50 +
  Math.min(quranPages / (quranGoal || 5), 1) * 20 +
  (duaChecked.filter(Boolean).length / 6) * 15 +
  (sunnahItems.filter(Boolean).length / 6) * 15
);
```

**Day boundary:** On `dateKey !== today`, archive previous day → history, recompute streak, reset daily fields.

### 6.4 Server-Side Cache Layer (Stage 2+)

```
Redis (or Vercel KV / Cloudflare KV):
  prayer:{city}:{date}     → AlAdhan response   TTL: 24h
  nisab:{date}             → Gold price          TTL: 24h
  verse:{date}             → Daily verse         TTL: 24h
  hadith:{date}            → Daily hadith         TTL: 24h
  quran:{surah}            → Verses for surah    TTL: 7 days
  hadith:{collection}:{book}:{date} → Book hadiths  TTL: 24h
```

---

## 7. SEO & Metadata Architecture

### 7.1 Required `<head>` on Every Page

```html
<html lang="en" data-theme="light">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[Page Title] — IslamicInfo</title>
<meta name="description" content="[Page-specific description, 150-160 chars]">

<!-- Canonical -->
<link rel="canonical" href="https://islamicinfo.org/[page].html">

<!-- Open Graph -->
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://islamicinfo.org/[page].html">
<meta property="og:title"       content="[Page Title] — IslamicInfo">
<meta property="og:description" content="[Same as meta description]">
<meta property="og:image"       content="https://islamicinfo.org/assets/og/[page]-og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt"   content="[Descriptive alt text]">

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="[Page Title] — IslamicInfo">
<meta name="twitter:description" content="[Same as meta description]">
<meta name="twitter:image"       content="https://islamicinfo.org/assets/og/[page]-og.jpg">

<!-- Fonts (preconnect before stylesheet) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond..." rel="stylesheet">

<!-- PWA (Stage 2) -->
<link rel="manifest" href="/manifest.json">
```

### 7.2 Open Graph Image Spec

- **Size:** 1200×630px JPEG, max 300KB
- **Content:** IslamicInfo logo + page title in Cormorant Garamond over teal gradient + Bismillah in gold Arabic
- **Must render legibly at 600×315** (half-size Twitter preview)
- One image per page — stored at `/assets/og/[page]-og.jpg`

### 7.3 JSON-LD Structured Data

| Page | Schema type | Priority |
|---|---|---|
| All pages | `WebSite` + `Organization` | P0 |
| Home | `WebSite` with `SearchAction` | P0 |
| Article pages (`/articles/[slug]`) | `Article` + `BreadcrumbList` | P0 |
| Cluster pages | `CollectionPage` + `BreadcrumbList` | P1 |
| Hadith pages (Tier 3) | `Article` + `BreadcrumbList` | P1 |
| Scholar pages | `Person` | P2 |

**Article JSON-LD example:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "What is Zakat?",
  "author": { "@type": "Organization", "name": "IslamicInfo" },
  "publisher": { "@type": "Organization", "name": "IslamicInfo" },
  "datePublished": "2026-05-20",
  "description": "...",
  "mainEntityOfPage": "https://islamicinfo.org/articles/what-is-zakat.html"
}
```

### 7.4 Sitemap

`/sitemap.xml` must include all production routes before launch:
- All 10 core pages
- All article slugs (`/articles/[slug]`)
- All 8 cluster pages
- `/search.html`, `/start-here.html`, `/trending.html`
- `/about.html#methodology` as a separate entry
- Exclude: `/api/`, `/data/`, staging environments

### 7.5 robots.txt

```
User-agent: *
Disallow: /api/
Disallow: /data/
Allow: /

Sitemap: https://islamicinfo.org/sitemap.xml
```

---

## 8. Performance Targets

### 8.1 Core Web Vitals — All Pages

| Metric | Target | Measurement |
|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Lighthouse, real user monitoring |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Lighthouse |
| INP (Interaction to Next Paint) | ≤ 200ms | Lighthouse |
| FCP (First Contentful Paint) | ≤ 1.5s | Lighthouse |
| Lighthouse Performance | ≥ 90 | CI on every deploy |
| Lighthouse Accessibility | ≥ 90 | CI on every deploy |
| Lighthouse SEO | ≥ 90 | CI on every deploy |
| Lighthouse Best Practices | ≥ 90 | CI on every deploy |

### 8.2 Page-Specific Benchmarks

| Page | Benchmark route | Key constraint |
|---|---|---|
| Quran Explorer | `/quran` (representative reader) | Surah list sidebar loads immediately; verse content lazy |
| Hadith Library | `/hadith/bukhari/1/1` (deep-view benchmark) | Trace layout renders in <1.5s |
| Islamic Studies | `/islamic-studies` | Progress bars render after localStorage read <50ms |
| Knowledge Hub | `/knowledge-hub` | Ticker runs without blocking render |

### 8.3 Performance Budget Rules

- **No external JS frameworks** — adds zero framework overhead
- **Font preconnect** before `<link>` stylesheet — prevents font-blocking render
- **`applyTheme()` inline in `<head>`** — 1 line, prevents FOUC, zero blocking
- **All card hovers on `transform` + `opacity`** — compositor-only, never layout
- **`floatG`, `bgD`, `orbPulse` animations** — disabled on `prefers-reduced-motion: reduce`
- **Mobile battery** — continuous CSS animations disabled on mobile
- **`backdrop-filter:blur()`** — solid fallback on Android WebView
- **IntersectionObserver** — all observers call `unobserve()` after firing; zero ongoing cost

### 8.4 `prefers-reduced-motion` Rule

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  /* Keep opacity transitions — disable only transform/blur/scale */
}
```

---

## 9. PWA & Offline Architecture

### 9.1 Stage 2 — Quran Explorer PWA

**manifest.json:**
```json
{
  "name": "IslamicInfo — Qur'an & Islamic Knowledge",
  "short_name": "IslamicInfo",
  "start_url": "/quran",
  "display": "standalone",
  "background_color": "#0A3A3D",
  "theme_color": "#00696E",
  "icons": [
    { "src": "/assets/icons/icon-192.svg", "sizes": "192x192", "type": "image/svg+xml" },
    { "src": "/assets/icons/icon-512.svg", "sizes": "512x512", "type": "image/svg+xml" }
  ]
}
```

**`quran-sw.js` — Cache strategy:**
```
Cache-first: static shell (HTML, CSS, fonts)
Network-first: verse API responses
Cache-then-network: audio files (large — only cache on explicit "Download" action)
```

**Offline indicator:** Dashed teal-500 border + "Offline — showing cached content" banner. Visible only when `navigator.onLine === false` AND service worker reports cache active.

**Offline download sidebar button:** User can explicitly cache a surah for offline reading. Cache status shown in sidebar.

### 9.2 Stage 2+ — Habit Tracker

Habit Tracker works fully offline already (pure `localStorage`). No service worker needed — no network requests.

---

## 10. Analytics Architecture

### 10.1 GA4 — All Pages

All events use GA4 custom events. No PII collected.

```js
// Standard pattern — fire on user interaction
gtag('event', 'event_name', { param_key: 'param_value' });
```

### 10.2 Key Events Per Page

| Page | Key events |
|---|---|
| Home | `home_verse_read`, `home_prayer_times_view`, `home_feature_card_click`, `home_search_submit` |
| Quran Explorer | `quran_surah_open`, `quran_audio_play`, `quran_tafsir_open`, `quran_bookmark_save`, `quran_share`, `quran_ai_explain` |
| Hadith Library | `hadith_collection_open`, `hadith_deepview`, `hadith_audio_play`, `hadith_bookmark_save`, `hadith_ai_explain` |
| Islamic Studies | `is_track_open`, `is_lesson_read`, `is_quiz_start`, `is_quiz_pass`, `is_quiz_fail`, `is_pathway_unlock` |
| Knowledge Hub | `kh_search_submit`, `kh_cluster_click`, `kh_article_open`, `kh_email_signup` |
| Verify | `verify_claim_submit`, `verify_mode_change`, `verify_chip_click`, `verify_try_another` |
| Habit Tracker | `habit_prayer_toggle`, `habit_score_update`, `habit_streak_milestone` |

### 10.3 KPI Targets (90 days post-launch)

| KPI | Target | Measurement |
|---|---|---|
| Bounce rate (Home) | < 40% | GA4 |
| Pages per session (Knowledge Hub) | ≥ 1.8 | GA4 |
| Qur'an session depth | ≥ 25% read ≥ 10 verses | GA4 |
| Hadith daily active users | Baseline → 10% MoM growth | GA4 |
| IS quiz completion rate | ≥ 60% of starters | GA4 |
| KH email signups | 500 in 90 days | Email provider |
| Verify monthly claims | 1,000 in 90 days | GA4 |

---

## 11. Sub-Brand Architecture

### 11.1 Umbrella Overview

```
islamicinfo.org          ← Parent hub (10 pages, full platform)
├── quranlyai.com        ← Core product (inherits full design system)
├── mosquefinder.net     ← Adjacent (teal/gold + --mosque-blue accent)
├── travellyai.com       ← Adjacent (teal/gold + --travel-sand accent)
└── learnspeakai.com     ← Extended (typography only + --learn-violet)
```

### 11.2 Cross-Product Integration Points

| Integration | Direction | Implementation |
|---|---|---|
| `islamicinfo-theme` localStorage | Shared key — theme syncs if user visits multiple products | All products read/write same key |
| Footer ecosystem column | Every product links to all others | `target="_blank" rel="noopener"` + ` ↗` |
| "Part of IslamicInfo Family" | Sub-brand footer → islamicinfo.org | 11px `var(--ink-subtle)` in footer bottom bar |
| QuranlyAI attribution | Quran Explorer + Hadith Library AI panels | "Powered by QuranlyAI ↗" on every AI card |
| IS → KH handoff | `knowledge-hub.html?lesson=[slug]` | Query param highlights specific article |

### 11.3 Sub-Brand Token Extension Pattern

```css
/* Each sub-brand adds ONE accent color on top of the shared system */
/* Never replace core teal/gold tokens */

/* mosquefinder.net */
:root { --mosque-blue: #1A6B9E; --mosque-blue-light: rgba(26,107,158,.10); }

/* travellyai.com */
:root { --travel-sand: #B8935A; --travel-sand-light: rgba(184,147,90,.10); }

/* learnspeakai.com */
:root { --learn-violet: #5B4BAF; --learn-violet-light: rgba(91,75,175,.10); }
```

**Grade colors (`--grade-sahih/hasan/daif/mawdu`) are restricted to IslamicInfo.org and QuranlyAI only.**

### 11.4 Shared Static Assets

```
cdn.islamicinfo.org/shared/     ← (Stage 3: move to shared CDN)
├── fonts/                       # Hosted locally to avoid Google Fonts dependency
├── icons/brand/                 # IslamicInfo logo SVG variants
└── og-template/                 # Base OG image template
```

---

## 12. Inter-Page Relationships

### 12.1 Primary Navigation Flow

```
Home (index.html)
├── → Quran Explorer (quran.html)
├── → Hadith Library (hadith.html)
├── → Islamic Studies (islamic-studies.html)
│       ↕ bidirectional handoff
│   → Knowledge Hub (knowledge-hub.html)
├── → Daily Duas (dua.html)
├── → Tools (tools.html)
├── → Habit Tracker (habits.html)
├── → Verify (verify.html)
└── → About (about.html)
```

### 12.2 Islamic Studies ↔ Knowledge Hub Handoff (Critical)

This is the most architecturally important inter-page relationship on the platform.

```
IS → KH:
  "Read →" lesson CTA → knowledge-hub.html?lesson={trackSlug}-{lessonIndex}
  KH handoff pills → knowledge-hub.html#[cluster-slug]
  "Browse 2,000+ Articles" → knowledge-hub.html

KH → IS:
  "Start Curriculum" → islamic-studies.html
  "Open Islamic Studies" → islamic-studies.html

Return detection:
  IS stores: islamicinfo-is-visit = { trackSlug, lessonIndex, departedAt }
  On visibilitychange: if departedAt < 30min → mark lesson ln-read → clear key
```

### 12.3 Cross-Page CTAs Map

| From page | CTA button | Destination |
|---|---|---|
| Home hero | "Start Your Journey" | `islamic-studies.html` |
| Home hero | "Explore the Qur'an" | `quran.html` |
| Home footer CTA | "Track Habits" | `habits.html` |
| Quran Explorer CTA | "Start Habit Tracker" | `habits.html?source=quran` |
| Hadith Library CTA | "Verify a Claim" | `verify.html` |
| Tools CTA | "Explore Qur'an" | `quran.html` |
| Tools CTA | "Daily Duas" | `dua.html` |
| Habit Tracker CTA | "Explore Qur'an" | `quran.html` |
| Verify CTA | "Explore Qur'an" | `quran.html` |
| Verify CTA | "Hadith Library" | `hadith.html` |
| About "Back to Home" | — | `index.html` |
| About "Our Methodology" | — | `about.html#methodology` |
| IS bottom CTA | "Browse Knowledge Hub" | `knowledge-hub.html` |
| IS bottom CTA | "Start Curriculum" | scroll to `#pathways` |
| KH email capture | Success state | no redirect |
| KH scholar cards | (P2) | `/scholars/[slug].html` |

---

## 13. Shared Component Inventory

Components that are **identical** across all pages. Any change must propagate everywhere.

| Component | File location (v1) | Key IDs/classes | Shared functions |
|---|---|---|---|
| Global header | Inline each page | `#siteHeader`, `.nav-link`, `#searchTrigger`, `#searchPopup`, `#themeBtn` | `applyTheme()`, scroll `.scrolled` |
| Mobile menu | Inline each page | `#mobileMenu`, `.mm-link` | `openMM()`, `closeMM()` |
| Footer | Inline each page | `#ii-footer`, `ft-` classes | Link hover `translateX(4px)` |
| Scroll reveal | Inline each page | `.reveal`, `.reveal-d1`–`.reveal-d5` | `_ro` IntersectionObserver |
| Theme toggle | Inline `<head>` | `#themeBtn` | `applyTheme()` |
| FAQ accordion | About, Verify, IS, KH | `.faq-item`, `.faq-q`, `.faq-a`, `.faq-chevron` | `toggleFaq()` |
| Card hover system | CSS, all pages | `.card` | No JS — pure CSS |
| Button system | CSS, all pages | `.btn-primary`, `.btn-ghost`, `.btn-white-ghost`, `.btn-gold` | No JS |
| Hero structure | HTML, all pages | `.hero-inner`, `.bismillah-hero-top`, `.hero-badge`, `.hero-title` | `floatG` CSS animation |
| Ambient glow | HTML, all pages | `.ambient`, `.shell` | Pure CSS |
| Toast notification | JS, feature pages | `.toast` | `showToast(msg)` |

---

## 14. Error Handling & Fallback Strategy

### 14.1 Universal Pattern

```js
// All API calls follow this pattern
try {
  const cached = localStorage.getItem(cacheKey);
  if (cached && !isExpired(cached)) return JSON.parse(cached);

  const res = await fetch('/api/[endpoint]');
  if (!res.ok) throw new Error('Server error ' + res.status);

  const data = await res.json();
  localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
} catch (err) {
  console.error('[endpoint] failed:', err);
  return getFallback('[endpoint]');  // hardcoded safe default
}
```

### 14.2 Fallback Table

| Failure scenario | Fallback | User sees |
|---|---|---|
| AlAdhan API down | Cached times or hardcoded London MWL | Stale data with date shown |
| api.quran.com timeout | Static seed verse (Surah 1 hardcoded) | Last-known verse |
| Sunnah.com API down | Last cached hadith | Cached content |
| Gold price API (Nisab) | `$6,180` hardcoded | "Using cached nisab from [date]" |
| Anthropic API down | "AI explanation unavailable — please try again" inline | Error state in AI card |
| Geolocation denied | Manual city input shown | Inline prompt |
| `localStorage` quota exceeded | `QuotaExceededError` catch | Toast: "Storage full — please clear some space" |
| `localStorage` unavailable | Silent catch in `applyTheme()` | Theme works for session only |
| Audio CDN 404 | `audio.onerror` → "Audio unavailable for this ayah" | Inline error, player controls remain |
| Verify API 503 | Error banner below verify box | "Verification service unavailable" |
| Search 404 | Empty state with "Try a different search" + Verify CTA | Empty state |
| IntersectionObserver unsupported | Add `.in` to all `.reveal` immediately | Page renders without animation |

### 14.3 AI Safety Fallback (Stage 3+)

If Anthropic API response contains fatwa-adjacent language (detected server-side):
1. Server strips the response
2. Returns: "For personal religious guidance, consult a qualified scholar."
3. "Powered by QuranlyAI" attribution still shown
4. Error logged to Sentry

---

## 15. Deployment Topology

### 15.1 v1 (Static Hosting)

```
Developer → Git push
         → CI: Lighthouse ≥ 90 (all pages), no broken hrefs, no shimmer CSS
         → Deploy to CDN (Cloudflare Pages / Vercel / Netlify)
         → /api/ routes via Edge Functions (same platform)
         → Domain: islamicinfo.org (Cloudflare DNS)
```

### 15.2 Stage 2+ (Full Stack)

```
islamicinfo.org static assets → CDN (global edge)
/api/* proxy routes           → Edge Functions (no cold start)
Redis/KV cache layer          → Cloudflare KV or Vercel KV
Sentry error monitoring       → sentry.io
Uptime monitoring             → UptimeRobot or Better Uptime
Analytics                     → GA4 (client-side, no PII)
```

### 15.3 CI Checks (Required on Every Deploy)

- [ ] Lighthouse Performance ≥ 90 on all 10 core pages
- [ ] No `href="learn.html"` anywhere
- [ ] No `href="#"` in production (except intentional in-progress features)
- [ ] No `quranlya.com` (wrong domain)
- [ ] No shimmer `::after` CSS
- [ ] `knowledge-hub.html` present in all nav and footer Quick Access lists
- [ ] All 10 pages present in `sitemap.xml`
- [ ] Dark mode CSS `[data-theme="dark"]` is sibling to `:root` — not merged

---

## 16. Future Architecture Hooks

These are preparation hooks in v1 — code that anticipates but does not yet implement future features.

| Hook | Location | What it prepares for |
|---|---|---|
| `islamicinfo-is-progress.certificates[]` | Islamic Studies localStorage | Certificate generation (Stage 4) |
| `islamicinfo-lang` key | localStorage | i18n selector (Stage 3) |
| `habits.html?source=quran` query param | Habit Tracker URL | Source tracking from Quran Explorer |
| `/api/sync` endpoint stub | `/api/sync.js` (Stage 4) | Cross-device sync when accounts added |
| `openMM()` / `closeMM()` scoped functions | All pages | Ready for account drawer expansion |
| `currentMode` var in Verify | `verify.html` | Per-mode backend search algorithms |
| `populateResults(data)` function stub | Verify | Production API swap point |
| QuranlyAI attribution on AI cards | Quran/Hadith pages | Sub-brand cross-promotion |
| `/api/export/pdf` stub | Verify, Hadith | Citation export (Stage 4) |
| `gtag('event', ...)` calls | All feature pages | Metrics wiring before GA4 full setup |

---

*End of Platform Architecture Document v1.0*
*IslamicInfo.org · All 10 pages + sub-brand umbrella · May 2026*
*Source: PRDs v1.1 (Home, Quran Explorer, Hadith Library, Islamic Studies, Knowledge Hub, Tools, Habit Tracker, Verify, About) + Tech Specs (Tools, Habits, Verify, About) + CLAUDE.md v3.0 + Brand Identity Doc v1.0*
