# Dua Page — Functional Document
**IslamicInfo.org · `dua.html` · Daily Duas**
*Version 1.0 — Production Ready*
*Derived from: `dua_enhanced.html` mockup + CLAUDE.md v3.0 Design System*
*Date: 2026-05-17*

---

## Table of Contents

1. [Page Purpose & Role](#1-page-purpose--role)
2. [Page Architecture — Section Map](#2-page-architecture--section-map)
3. [Global Navigation (Header)](#3-global-navigation-header)
4. [Mobile Menu](#4-mobile-menu)
5. [Hero Section](#5-hero-section)
6. [Stats Strip](#6-stats-strip)
7. [Dua of the Day — Featured Dua](#7-dua-of-the-day--featured-dua)
8. [Category Grid](#8-category-grid)
9. [Dua Library — Main Section](#9-dua-library--main-section)
   - 9.1 [Sidebar — Occasion Navigator](#91-sidebar--occasion-navigator)
   - 9.2 [Search Bar](#92-search-bar)
   - 9.3 [Filter Chips](#93-filter-chips)
   - 9.4 [Dua Cards](#94-dua-cards)
   - 9.5 [Load More](#95-load-more)
10. [Dua Card Actions — Full Spec](#10-dua-card-actions--full-spec)
    - 10.1 [Copy](#101-copy)
    - 10.2 [Share & Image Generation](#102-share--image-generation)
    - 10.3 [Bookmark / Save](#103-bookmark--save)
    - 10.4 [Add Notes](#104-add-notes)
    - 10.5 [AI Explain (Quranly AI)](#105-ai-explain-quranly-ai)
    - 10.6 [Play Audio](#106-play-audio)
11. [CTA Section](#11-cta-section)
12. [Global Footer](#12-global-footer)
13. [Design System Tokens & Rules](#13-design-system-tokens--rules)
14. [Interactions & Animations](#14-interactions--animations)
15. [Responsive Breakpoints](#15-responsive-breakpoints)
16. [Routing & Linking Rules](#16-routing--linking-rules)
17. [User Flows](#17-user-flows)
18. [Acceptance Criteria Checklist](#18-acceptance-criteria-checklist)

---

## 1. Page Purpose & Role

The **Daily Duas** page (`dua.html`) is the Islamic supplication library within IslamicInfo.org. It occupies **position 6** in the global navigation — between Knowledge Hub and Tools.

Its purpose is to:
- Give users a single authoritative destination for browsing and reading duas
- Display each dua with Arabic text, transliteration, English translation, and source reference
- Enable full interaction: audio playback, copying, bookmarking, notes, AI explanation, and image sharing
- Support daily spiritual habit via the Dua of the Day feature and streak tracker
- Surface duas by occasion, keyword search, and category filter

The page must feel visually and structurally continuous with the rest of IslamicInfo.org. All layout, typography, color, card hover behavior, and animation must follow **CLAUDE.md v3.0** exactly. The surrounding design is frozen — only content and functionality are added.

---

## 2. Page Architecture — Section Map

Top-to-bottom order is fixed. No sections may be reordered, removed, or renamed without explicit instruction.

```
┌─────────────────────────────────────────┐
│  GLOBAL HEADER  (sticky, §3)            │
├─────────────────────────────────────────┤
│  MOBILE MENU  (overlay, §4)             │
├─────────────────────────────────────────┤
│  HERO  (§5)                             │
│  — Bismillah                            │
│  — Eyebrow badge                        │
│  — H1 title                             │
│  — Arabic verse                         │
│  — Sub-text                             │
│  — CTAs (Browse Duas / By Occasion)     │
├─────────────────────────────────────────┤
│  STATS STRIP  (§6)                      │
│  — 1,240+ Duas · 18+ Occasions          │
│  — 100% Source-Cited · 3+ Languages     │
├─────────────────────────────────────────┤
│  DUA OF THE DAY  (§7)                   │
│  — Section header                       │
│  — Featured Dua card (dark gradient)    │
│  — Arabesque divider                    │
├─────────────────────────────────────────┤
│  CATEGORY GRID  (§8)  #categories       │
│  — 12 category cards                   │
├─────────────────────────────────────────┤
│  DUA LIBRARY  (§9)  #duas-section       │
│  — Sidebar (occasion list + streak)     │
│  — Search bar                           │
│  — Filter chips                         │
│  — Dua card grid                        │
│  — Load More button                     │
├─────────────────────────────────────────┤
│  CTA SECTION  (§11) — last before footer│
├─────────────────────────────────────────┤
│  GLOBAL FOOTER  (§12)                   │
└─────────────────────────────────────────┘
```

---

## 3. Global Navigation (Header)

### 3.1 Layout

Three-zone layout: **Logo (far-left) | Nav (center, flex:1) | Tools (far-right)**

The header is **sticky** (`position: sticky; top: 0; z-index: 100`). On scroll past 16px it adds the `.scrolled` class which applies a subtle bottom shadow.

### 3.2 Nav Items — Exact Order, Exact Labels, Exact hrefs

All 10 items must be present on every page. **Never reorder, rename, or omit any item.**

| # | Label | href | Note |
|---|---|---|---|
| 1 | Home | `index.html` | |
| 2 | Quran Explorer | `quran.html` | |
| 3 | Hadith Library | `hadith.html` | |
| 4 | Islamic Studies | `islamic-studies.html` | ⚠️ Never `learn.html` |
| 5 | Knowledge Hub | `knowledge-hub.html` | ⚠️ Never omit |
| 6 | Daily Duas | `dua.html` | **`.active`** on this page |
| 7 | Tools | `tools.html` | |
| 8 | Habit Tracker | `habits.html` | |
| 9 | Verify | `verify.html` | |
| 10 | About | `about.html` | |

Active page link uses `class="nav-link active"`. All others use `class="nav-link"`.

Active indicator: 2px gradient underline (`teal-700 → gold-500`) via `::after` pseudo-element.

### 3.3 Header Tools (Right Side) — Exact Order

1. **Search icon** → opens search popup (floating dropdown below the icon)
2. **Language (EN)** → text button, placeholder for future locale switching
3. **Theme toggle** → sun ↔ moon icon; `id="themeBtn"`; persists to `localStorage` key `islamicinfo-theme`
4. **Admin (user icon)** → placeholder for future account system
5. **Hamburger** → visible only at ≤ 760px; triggers mobile menu overlay

### 3.4 Search Popup Behavior

- Triggered by clicking the search icon button (`id="searchTrigger"`)
- Popup appears at `top: 44px; right: 0` relative to the icon wrapper
- On open: focus moves to the text input automatically (50ms delay)
- Closes on: click outside · `Escape` key · clicking Search button
- Search button action: logs query to console in development; wired to backend search endpoint in production
- Dark mode: popup background `rgba(15,27,29,.97)`, border teal

### 3.5 Header CSS Rules (from CLAUDE.md §4.4)

- Background: `rgba(250,251,251,.92)` with `backdrop-filter: blur(24px) saturate(1.6)`
- Dark: `rgba(10,19,20,.92)`
- Scrolled state: adds `box-shadow: 0 1px 0 rgba(0,105,110,.10), var(--elev-1)`
- Height: `60px`
- All nav hover transitions use `var(--ease-premium)` at `0.25s`

---

## 4. Mobile Menu

Placed immediately after the closing `</header>` tag. `id="mobileMenu"`. Fixed full-screen overlay.

### 4.1 Contents

Header row: IslamicInfo wordmark (left) + Close button (right).

All **10 nav links** in the same order as desktop nav. `Daily Duas` link carries `class="mm-link active"` on this page.

```
Home
Quran Explorer
Hadith Library
Islamic Studies      ← href="islamic-studies.html"
Knowledge Hub        ← href="knowledge-hub.html" (must not be omitted)
Daily Duas           ← active
Tools
Habit Tracker
Verify
About
```

### 4.2 Open / Close Behavior

- Hamburger (`onclick="openMM()"`) adds `.open` class to `#mobileMenu`
- Close button (`onclick="closeMM()"`) removes `.open`
- `Escape` key also closes
- On open: fade + slide-in animation from right (`mmFade` keyframe, 0.3s)

### 4.3 Visual

- Background: `rgba(6,38,40,.97)` + `backdrop-filter: blur(20px)`
- Links: `font-size: 18px`, `color: rgba(255,255,255,.7)`
- Link hover: color `#5BC1C7`, `padding-left: 8px` shift
- Visible only at ≤ 760px

---

## 5. Hero Section

Follows **CLAUDE.md §6** exactly. Internal element order is fixed.

### 5.1 Element Order (top → bottom inside `.hero-inner`)

1. **Bismillah** — class `bismillah-hero-top`
2. **Eyebrow badge** — class `hero-badge` with `.badge-dot` pulse
3. **H1 title** — class `hero-title`, font-display
4. **Arabic verse** — class `hero-arabic` (decorative Quranic quotation)
5. **Sub-text paragraph** — class `hero-sub`
6. **CTA buttons row** — class `hero-btns`

### 5.2 Content Values

| Element | Content |
|---|---|
| Bismillah | `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ` |
| Eyebrow | `Dua Library` |
| H1 — plain | `The Complete` |
| H1 — italic gradient | `Dua Library` (inside `<span class="gradient-italic">`) |
| Arabic verse | `ادْعُونِي أَسْتَجِبْ لَكُمْ` — Qur'an 40:60 ("Call upon Me, I will respond to you") |
| Sub-text | "Every dua verified from Qur'an and authentic Sunnah. Arabic text, transliteration, meaning, and occasion — all in one place." |
| Primary CTA | "Browse Duas" → smooth-scroll to `#duas-section` |
| Ghost CTA | "By Occasion" → anchor scroll to `#categories` |

### 5.3 Bismillah Color Rules (must not deviate)

- **Light mode:** teal-only gradient `linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%)` clipped to text
- **Dark mode:** gold gradient `linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%)` + `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))`

### 5.4 Floating Geometry Decorators

Four `.geo` SVGs float in the hero background (`position: absolute; pointer-events: none`):

| Class | Position | Shape | Color | Animation |
|---|---|---|---|---|
| `.g1` | top 8%, left 4% | Star polygon + circle | `#00696E` | `geoRot` 28s linear |
| `.g2` | top 20%, right 6% | Rotated rectangle | `#C5A059` | `geoFloat` 11s reverse |
| `.g3` | bottom 16%, right 8% | Star polygon | `#C5A059` | `geoRot` 32s, delay -14s |
| `.g4` | bottom 22%, left 6% | Star polygon | `#00696E` | `geoFloat` 13s reverse |

### 5.5 Hero Background

`.hero-bg` — three radial gradients (`teal-10%, gold-8%, teal-7%`) with `bgD` keyframe animation (18s, infinite alternate, scale 1 → 1.04).

### 5.6 Hero Typography & Animation

- `hero-title`: `var(--font-display)`, `clamp(46px, 8.5vw, 82px)`, weight 500, `fadeUp` animation 0.7s delay 0.1s
- `hero-sub`: `clamp(15px, 2vw, 18px)`, `var(--ink-muted)`, `fadeUp` animation 0.7s delay 0.2s
- `hero-btns`: `fadeUp` animation 0.7s delay 0.3s
- `hero-arabic`: `var(--font-arabic)`, `clamp(20px, 3vw, 28px)`, color `var(--teal-700)`, `opacity: 0.6`, RTL, centered

---

## 6. Stats Strip

Displayed immediately below the hero with `margin-top: -20px; z-index: 2` — visually overlapping the hero's bottom edge.

### 6.1 Four Stats

| Label | Value |
|---|---|
| Verified Duas | `1,240+` |
| Occasions | `18+` |
| Source-Cited | `100%` |
| Languages | `3+` |

### 6.2 Layout

`.stats-strip` — horizontal flex row inside a card. Dividers between items. Each `.stat-item` is equal-width (`flex: 1`).

- `.stat-num-lg`: `var(--font-display)`, `clamp(22px, 3.5vw, 30px)`, weight 600. The suffix (`+`, `%`) inside a `<span>` renders at 0.75em in `var(--teal-700)`.
- `.stat-label-sm`: `10.5px`, uppercase, letter-spaced, `var(--ink-muted)`
- `.stat-divider`: `0.5px` vertical line `rgba(0,105,110,.12)`

Entry animation: `.fade-up .fade-up-d1` (delay 0.1s).

At ≤ 700px: wraps to 2×2 grid, dividers hidden.

---

## 7. Dua of the Day — Featured Dua

### 7.1 Section Header

- Eyebrow: `✦ Dua of the Day`
- Title: `Today's ` + `<span class="gold-it">Featured Dua</span>`
- No sub-text

### 7.2 Featured Dua Card Visual

`.featured-dua` — dark gradient card (`teal-900 → teal-800 → #062628`), `border-radius: 28px`, `box-shadow: var(--elev-4)`. Two decorative radial glows via `::before` (gold, top-right) and `::after` (teal, bottom-left).

All inner content sits inside `.fd-inner` at `position: relative; z-index: 1` to layer above the glows.

### 7.3 Card Anatomy — Top to Bottom

**Meta row** (`.fd-meta-row`) — flex row, space-between:
- **Left:** `.fd-badge` — occasion label pill (e.g. "✦ Morning Remembrance")
- **Right:** `.fd-actions` — three icon buttons (Copy, Share, Save)

**Arabic text** (`.fd-arabic`):
- `var(--font-arabic)`, `clamp(22px, 3.5vw, 36px)`, RTL, `text-align: right`, white, `line-height: 2.0`

**Transliteration** (`.fd-transliteration`):
- `13px`, italic, `color: rgba(197,160,89,.8)`

**Translation** (`.fd-trans`):
- `var(--font-serif)`, `clamp(15px, 2vw, 18px)`, italic, `color: rgba(255,255,255,.72)`

**Footer row** (`.fd-footer`) — flex, space-between, top border:
- **Left:** `.fd-source` — source reference (book name, hadith number, authentication)
- **Right:** `.fd-nav` — Previous and Next buttons to cycle the daily pool

### 7.4 Featured Dua Actions

| Button | Icon | Action |
|---|---|---|
| Copy | Rectangle-on-rectangle copy icon | Copies Arabic text to clipboard. Shows browser confirmation. |
| Share | Three-circle share icon | Opens Share Drawer (see §10.2) |
| Save | Bookmark ribbon icon | Toggles saved state; icon changes color to gold; persists to `localStorage` |

Action buttons (`.fd-action-btn`): `32px` circular, semi-transparent white border and background. On hover: `scale(1.1)`, brighter background.

### 7.5 Navigation (Previous / Next)

`.fd-nav-btn` pills — "← Previous" and "Next →". In production these cycle through a curated pool of featured duas (backend-driven, date-based). Button styling: semi-transparent white, `border-radius: 20px`, hover brightens background.

### 7.6 Arabesque Divider

After the featured dua card, a decorative `.aq-divider` — horizontal lines with a gold star (`✦`) centered. Used as visual breath between sections.

---

## 8. Category Grid

Section `id="categories"`. Anchored from the Hero ghost CTA.

### 8.1 Section Header

- Eyebrow: `Browse by Occasion`
- Title: `Duas for ` + `<span class="gold-it">Every Moment</span>`
- Sub-text: "300+ duas organized by occasion — every one verified from Qur'an or authenticated Sunnah."

### 8.2 Categories — Complete List

| # | Icon | Label | Count | href (production) |
|---|---|---|---|---|
| 1 | 🌅 | Morning & Evening | 42 duas | `dua.html?cat=morning-evening` |
| 2 | 🕌 | Prayer | 38 duas | `dua.html?cat=prayer` |
| 3 | 🍽️ | Food & Drink | 18 duas | `dua.html?cat=food-drink` |
| 4 | 🛌 | Sleep & Waking | 24 duas | `dua.html?cat=sleep` |
| 5 | 🤲 | Forgiveness | 31 duas | `dua.html?cat=forgiveness` |
| 6 | 💊 | Illness | 15 duas | `dua.html?cat=illness` |
| 7 | 🧳 | Travel | 19 duas | `dua.html?cat=travel` |
| 8 | 👶 | Family & Children | 22 duas | `dua.html?cat=family` |
| 9 | 📖 | Knowledge | 12 duas | `dua.html?cat=knowledge` |
| 10 | ⚡ | Anxiety & Hardship | 27 duas | `dua.html?cat=anxiety` |
| 11 | 🌙 | Ramadan | 35 duas | `dua.html?cat=ramadan` |
| 12 | 🕋 | Hajj & Umrah | 29 duas | `dua.html?cat=hajj-umrah` |

### 8.3 Category Card Behavior

Each `.cat-card` is an `<a>` element. Clicking routes to the filtered dua view (URL with `?cat=` param or same-page filter update).

- **Hover:** `translateY(-4px) scale(1.02)` + teal glow shadow + teal border accent
- **Dark hover:** teal glow swaps to `rgba(88,193,199,…)` per CLAUDE.md §27.4
- **No shimmer `::after` sweep** — banned per CLAUDE.md §27.4

Layout: `auto-fill` grid, `minmax(160px, 1fr)`, 14px gap.

Card anatomy: emoji icon (28px) → title (13px, weight 600) → count (11px, `var(--ink-subtle)`)

---

## 9. Dua Library — Main Section

Section `id="duas-section"`. Background: `var(--surface-card)` (slightly off-white / dark card). Anchored from the Hero primary CTA.

The section uses a **two-column layout** (`.dua-layout`):
- **Left:** Sidebar — 240px wide, sticky at 80px from top (`.dua-sidebar`)
- **Right:** Main content area — flexible width (`.dua-main`)

At ≤ 900px, the sidebar hides and the main area takes full width.

---

### 9.1 Sidebar — Occasion Navigator

`.dua-sidebar` — sticky scrollable panel. Max-height: `calc(100vh - 100px)`, with custom slim scrollbar.

**Section: "By Occasion"** (label: `dsb-label`)

14 occasion links. Each `.dsb-item` contains: icon emoji → label text → count badge.

| Link | Icon | Label | Count |
|---|---|---|---|
| All Duas | 🤲 | All Duas | 300+ |
| morning-evening | 🌅 | Morning & Evening | 42 |
| prayer | 🕌 | Prayer | 38 |
| sleep | 😴 | Sleep & Waking | 24 |
| protection | 🛡️ | Protection | 19 |
| forgiveness | 🙏 | Forgiveness | 31 |
| knowledge | 📖 | Knowledge | 12 |
| illness | 💊 | Illness | 15 |
| food-drink | 🍽️ | Food & Drink | 18 |
| travel | 🧳 | Travel | 19 |
| family | 👶 | Family | 22 |
| anxiety | ⚡ | Anxiety | 27 |
| ramadan | 🌙 | Ramadan | 35 |
| hajj-umrah | 🕋 | Hajj & Umrah | 29 |

**Active item behavior:**
- Gains `class="dsb-item active"`
- Background: `rgba(0,105,110,.08)`, text color `var(--teal-700)`, weight 500
- Left border: `2.5px solid var(--teal-700)`

**Click behavior:** removes `.active` from all siblings, adds to clicked item. Applies category filter to the dua grid.

**Count badge (`.dsb-count`):** small pill — teal-600 text on teal-50 background, `border: 0.5px solid var(--teal-100)`.

---

**Section: "Daily Streak"** (below a `.dsb-divider` line)

`.dsb-streak` panel — gradient background (`teal + gold`), bordered.

Streak label: e.g. `✦ 3-day streak` in teal-600, uppercase 10px.

7-day tracker row (`.dsb-streak-days`): seven `.dsb-day` squares (20×20px, 5px radius):
- `.done` — completed: teal-700 background, white checkmark
- `.today` — current day: dashed teal-500 border, teal-600 text "T"
- Default — upcoming: faint teal background, subtle text label

In production: days are computed from the user's engagement history in `localStorage` or backend.

---

### 9.2 Search Bar

`.dua-search-wrap` — full-width relative container above the dua grid.

- Input `id="duaSearch"`: pill-shaped (`border-radius: 999px`), left-padded for icon
- Placeholder: `Search duas by occasion, keyword, or Arabic…`
- Search icon SVG: absolutely positioned at `left: 15px`, vertically centered
- Focus state: `border-color: var(--teal-500)` + `box-shadow: 0 0 0 4px rgba(44,164,171,.10)`

**Live filter behavior:** On every `input` event, iterate all `.dua-card` elements. Check if card's `.textContent` (lowercased) includes the query. Cards that do not match: `display: none`. Cards that match remain visible. No debounce required at this scale; add 150ms debounce for production API calls.

---

### 9.3 Filter Chips

`.cat-filter` — horizontal flex row of `.cat-chip` pills above the dua grid (below search bar).

Default chips in mockup:

| Chip | `data-cat` |
|---|---|
| All | `all` |
| Morning | `morning` |
| Prayer | `prayer` |
| Qur'anic | `quran` |
| Protection | `protection` |
| Forgiveness | `forgiveness` |

**Active chip behavior:** clicking removes `.active` from all chips, adds `.active` to clicked chip. Active chip: `background: var(--teal-700)`, `color: white`, no border, glow shadow, `scale(1.04)`.

**Filter effect:** In production, filtering by chip applies the same category filter as the sidebar, narrowing the visible dua cards. Both sidebar and chips should remain in sync — selecting a chip updates the active sidebar item and vice versa.

---

### 9.4 Dua Cards

`.dua-grid` — responsive grid, `auto-fill`, `minmax(300px, 1fr)`, 20px gap. Below 640px: single column.

Each dua entry is a `.card.dua-card`. The card has 3D tilt-on-hover effect (mouse-tracking rotateX/Y via JS).

#### Dua Card Anatomy (top to bottom)

**1. Card Header Row (`.dua-card-header`)**
- Left: `.dua-tag` — category label pill with icon (e.g. "🤲 General")
  - Style: `10px`, uppercase, letter-spaced, teal-700 text, teal-tinted background, border
- Right: `.dua-card-actions-top` — top-right quick-save icon button (`.dua-icon-btn`)

**2. Arabic Text (`.dua-arabic`)**
- `var(--font-arabic)`, `22px`, RTL (`direction: rtl; text-align: right`)
- `line-height: 2.0` for readability
- Background: `rgba(0,105,110,.03)`, light teal tint, `border-radius: 10px`, subtle border
- Dark mode: text becomes `var(--teal-300)`, background slightly deeper teal

**3. Transliteration (`.dua-transliteration`)**
- `12.5px`, italic, `color: var(--gold-700)`, `line-height: 1.6`
- Small left padding for visual offset from Arabic

**4. Translation (`.dua-translation`)**
- `var(--font-serif)`, `15px`, `var(--ink-muted)`, `line-height: 1.68`
- Left border accent: `2.5px solid var(--teal-300)` (dark: `var(--teal-700)`)
- Left padding: 12px

**5. Card Footer Row (`.dua-footer`)**
- Top border: `0.5px solid rgba(0,105,110,.08)`
- Left: `.dua-source` — source reference display
  - `.dua-source-dot` — 5px circle in `var(--grade-sahih)` green
  - Text: Book name · Reference number (e.g. "Qur'an · Al-Baqarah 2:201" or "Bukhari · 5743")
- Right: `.dua-actions` — row of action buttons (`.dua-btn`)

#### Dua Action Buttons (`.dua-btn`)

`11.5px`, weight 500, pill shape (`border-radius: 16px`), transparent background, teal-tinted border.

Hover: `background: rgba(0,105,110,.08)`, text `var(--teal-700)`, border darker, `scale(1.04)`.

Full button set — all must be present on every card:

| Button | Label | Action | Full spec |
|---|---|---|---|
| Copy | Copy | Copy Arabic text | §10.1 |
| Share | Share | Open share drawer | §10.2 |
| Save | Save | Toggle bookmark | §10.3 |
| Notes | Notes | Open note editor | §10.4 |
| AI Explain | AI Explain | Open Quranly AI panel | §10.5 |
| Play | ▶ Play | Start audio playback | §10.6 |

---

### 9.5 Load More

`.load-more-wrap` — centered container, `margin-top: 32px`.

`.load-more-btn` — rounded pill, `border-radius: 28px`, teal-tinted background, teal-700 text, download icon.

**Behavior:** In production, clicking fetches the next batch of 20 dua cards from the API and appends them to the grid. Shows a loading spinner inside the button during fetch. If no more results, button is hidden or shows "All duas loaded".

---

## 10. Dua Card Actions — Full Spec

Every action must be functional. No decorative buttons in production.

---

### 10.1 Copy

**Trigger:** "Copy" button on any dua card or the Copy icon on the featured dua.

**Default behavior:** Copies the Arabic text of that specific dua to the clipboard via `navigator.clipboard.writeText()`.

**Confirmation:** Button text changes to `"Copied!"` for 1,500ms then reverts to original label.

**Extended behavior (production):** A sub-menu can optionally appear offering:
- Copy Arabic only
- Copy transliteration only
- Copy translation only
- Copy all (Arabic + transliteration + translation + source)

**Error handling:** If clipboard API is unavailable (non-HTTPS, old browser), fall back to `document.execCommand('copy')` on a temporary `<textarea>`.

---

### 10.2 Share & Image Generation

**Trigger:** "Share" button on any dua card, or the Share icon on the featured dua.

**Share Drawer UI:**
A bottom sheet or side drawer opens offering these options:

| Option | Behavior |
|---|---|
| Share as Image | Generates a watermarked PNG (see below) |
| Copy Link | Copies a deep-link URL for this dua (e.g. `islamicinfo.org/dua/id/123`) |
| WhatsApp | Opens `https://wa.me/?text=` with Arabic + translation |
| Telegram | Opens Telegram share URL |
| X (Twitter) | Opens Twitter intent with dua text |
| Native Share | Invokes `navigator.share()` where supported (mobile) |

**Watermarked Image Generation (Canvas API or server-side):**

The generated image contains these layers, in order:

| Layer | Content | Style |
|---|---|---|
| Background | Teal gradient (`teal-900 → teal-800`) | Matches brand palette |
| Geometric motif | Faint Islamic star polygon | Opacity ~4%, decorative |
| Arabic text | Dua Arabic | Large, centered, `font-arabic`, white |
| Transliteration | Romanised form | Smaller, italic, gold-tinted |
| Translation | English meaning | Serif, italic, semi-transparent white |
| Source reference | Book + hadith number | Small, uppercase, gold |
| Watermark | `islamicinfo.org` | Bottom-right, 11px, semi-transparent — **must always be present** |

Output: downloadable PNG at minimum 1080×1080px for social sharing.

**Rule:** The `islamicinfo.org` watermark must appear on all generated images. It must be visible but not overpower the content.

---

### 10.3 Bookmark / Save

**Trigger:** Save button (`.dua-icon-btn`) in the dua card header top-right, or the "Save" button in `.dua-actions`, or the Save icon on the featured dua.

**Saved state:**
- Icon fills gold (`color: var(--gold-500)`)
- Optional: card shows a subtle gold left-border accent
- Button reflects saved state on all interaction points for the same dua

**Persistence:** Saved state is stored in `localStorage` keyed by dua ID (e.g. `dua-saved-123: true`). On page load, iterate all rendered dua cards and pre-apply saved state from `localStorage`.

**In production:** Syncs to user account if logged in. Anonymous users use `localStorage`.

**Saved Items page:** Users can access all bookmarked duas at a dedicated `/saved` page or "My Duas" panel. Link is surfaced in the site nav or user account menu.

---

### 10.4 Add Notes

**Trigger:** "Notes" button on any dua card.

**UI:** An inline editor expands below the card content (or opens as a small modal/side panel). It contains:
- A `<textarea>` with placeholder: "Add a personal note, reflection, or reminder…"
- A character counter (max 500 characters)
- A Save button (teal primary) and Cancel button (ghost)

**Saved state:**
- Note text persists to `localStorage` keyed by dua ID (e.g. `dua-note-123: "My reflection..."`).
- When a note exists, the card's Notes button shows a small filled indicator dot.
- On page load, notes are loaded and indicator dots applied automatically.

**In production:** Syncs to user account. Supports short reflections, memorization reminders, or occasion-specific context.

---

### 10.5 AI Explain (Quranly AI)

**Trigger:** "AI Explain" button on any dua card.

**UI Component:** A **slide-over panel** from the right (or bottom sheet on mobile). Never a bare tooltip.

**Panel Header:** Must always display `"AI-Assisted Explanation — Quranly AI"`. This label is non-negotiable — AI-generated content must never be presented without clear attribution.

**Panel Content Sections:**

| Section | Content |
|---|---|
| Meaning | Plain-language explanation of the dua's meaning — what it says and what it asks |
| Context | When and why to recite it — occasion, recommended times, situational use |
| Source | Quranic verse or hadith reference establishing its authenticity (where available) |
| Related | 2–3 related duas or Quran verses the user may also want |
| Disclaimer | *(required)* "This explanation is AI-assisted. For religious rulings, always consult a qualified scholar." |

**API Call:**

Calls Anthropic API (`claude-sonnet-4-20250514`, `max_tokens: 1000`) with:
- System prompt: "You are an Islamic knowledge assistant for IslamicInfo.org. Explain the following dua in simple language. State its Arabic text, transliteration, meaning, when to recite it, and its source. Always cite authentic Quran or hadith references where available. Acknowledge uncertainty clearly. Avoid issuing religious verdicts."
- User content: Arabic text + transliteration + translation + source reference of the selected dua

**Loading state:** Animated spinner or skeleton rows inside the panel while the API responds.

**Error state:** "Unable to load explanation. Please try again." with a retry button.

**Disclaimer rule:** The panel must always render the disclaimer line regardless of what the API returns. Hard-coded in the panel template, not generated by AI.

---

### 10.6 Play Audio

**Trigger:** "▶ Play" button on any dua card.

**UI:** An inline audio player expands within the card, or a persistent mini-player appears at the bottom of the page.

Player controls:
- Play / Pause toggle
- Progress bar (scrubber)
- Current time / total duration
- Playback speed selector: `0.75×` · `1×` · `1.25×` · `1.5×`

**Source:** Pre-recorded recitation audio hosted via CDN. Audio file URL keyed by dua ID.

**Unavailable state:** If no audio file exists for a dua, the Play button is visually disabled (lower opacity, `cursor: not-allowed`) with a tooltip: "Audio coming soon".

**Accessibility:** The audio player must be keyboard-navigable and include appropriate ARIA labels.

---

## 11. CTA Section

The last section before the footer. Uses **CLAUDE.md §11 template verbatim**.

| Element | Value |
|---|---|
| Eyebrow | `✦ 300+ Duas · Fully Verified` |
| H2 title | `Every Supplication.` |
| H2 italic sub | `Source-Cited.` (inside `<em>`) |
| Sub-text | "Arabic, transliteration, translation, and hadith reference — for every dua in our library." |
| Primary CTA | "Explore Qur'an" → `quran.html` |
| Secondary CTA | "Hadith Library" → `hadith.html` |

Background: `linear-gradient(135deg, #0A3A3D, #00696E, #062628)`.

Two decorative radial glows via `::before` (gold, top-left) and `::after` (teal, bottom-right).

All text and buttons inside a `.container` at `z-index: 1` to layer above the glows.

`.reveal` class on all CTA child elements for scroll-triggered entrance.

---

## 12. Global Footer

Uses the **global `ft-` CSS class system** from **CLAUDE.md §7.1–7.4 verbatim**. Every page uses identical footer CSS and HTML structure.

### 12.1 Footer Layout

Five-column grid (`2fr 1fr 1fr 1fr 1fr`). At ≤ 1100px: 3 columns. At ≤ 700px: 2 columns, brand spans full width. At ≤ 440px: 1 column.

### 12.2 Brand Column (`.ft-brand`)

- Logo: IslamicInfo wordmark (`Islamic` in `#5BC1C7`, `Info` in `#C5A059`)
- Tagline: "A digital sanctuary for authentic Islamic knowledge — Qur'an, Hadith, Dua, and verified scholarship. Source-cited. Always free."
- Arabic verse: `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ — Hud · 11:88`

### 12.3 Column 1 — Page-Specific: Duas

Heading: `Duas`

| Link | href |
|---|---|
| Morning & Evening | `dua.html?cat=morning-evening` |
| Prayer Duas | `dua.html?cat=prayer` |
| For Travel | `dua.html?cat=travel` |
| For Forgiveness | `dua.html?cat=forgiveness` |
| Hajj & Umrah | `dua.html?cat=hajj-umrah` |

### 12.4 Column 2 — Quick Access (identical on every page)

Heading: `Quick Access`

| Link | href |
|---|---|
| Quran Explorer | `quran.html` |
| Hadith Library | `hadith.html` |
| Islamic Studies | `islamic-studies.html` |
| Knowledge Hub | `knowledge-hub.html` |
| Daily Duas | `dua.html` |
| Islamic Tools | `tools.html` |
| Habit Tracker | `habits.html` |
| Verify a Claim | `verify.html` |

⚠️ All 8 links must be present. `knowledge-hub.html` must never be omitted.

### 12.5 Column 3 — Our Ecosystem (§7.4 verbatim, exact URLs)

Heading: `Our Ecosystem`

| Display Name | URL | rel |
|---|---|---|
| QuranlyAI ↗ | `https://quranlyai.com` | `noopener` |
| MosqueFinder ↗ | `https://mosquefinder.net` | `noopener` |
| TravellyAI ↗ | `https://travellyai.com` | `noopener` |
| LearnSpeakAI ↗ | `https://learnspeakai.com` | `noopener` |

⚠️ These URLs are locked. Never write from memory. Always copy from §7.4.

### 12.6 Column 4 — Company + Legal

Heading: `Company`
- About → `about.html`
- Contact → `contact.html`

Heading: `Legal`
- Privacy Policy → `privacy.html`
- Terms of Use → `terms.html`

### 12.7 Footer Bottom Bar

Left: `© 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources.`
Right (italic, muted): `All content source-verified · Privacy-first · Built with sincerity`

---

## 13. Design System Tokens & Rules

All styling must use **CLAUDE.md §1 CSS variables**. No raw hex values inline (SVG gradients excepted).

### Key Token Reference

| Category | Key Tokens |
|---|---|
| Primary brand teal | `--teal-700: #00696E` |
| Primary brand gold | `--gold-500: #C5A059` |
| Body text | `--ink-body: #243738` |
| Muted text | `--ink-muted: #6D797A` |
| Surface | `--surface: #F4F7F7` |
| Card surface | `--surface-card: #FAFBFB` |
| Display font | `var(--font-display)` — Cormorant Garamond |
| Body font | `var(--font-body)` — Inter |
| Arabic font | `var(--font-arabic)` — Amiri |
| Easing | `var(--ease-reverent)` — `cubic-bezier(.22,1,.36,1)` |

### Color Rules

- Never invent new colors. Use the closest token.
- Never use raw hex inline in CSS — only in SVG gradient definitions.
- Dark mode tokens override light counterparts via cascade. The dark block is a **sibling** to `:root`, never merged.

### Forbidden Pattern — No Shimmer

```css
/* ✗ NEVER USE on any card */
.card::after {
  content: '';
  background: linear-gradient(105deg, transparent, rgba(255,255,255,.4), transparent);
  animation: shimmer ...;
}
```

---

## 14. Interactions & Animations

All hover and transition timings follow **CLAUDE.md §13**.

| Element | Duration | Transform | Shadow/Glow |
|---|---|---|---|
| Dua cards | 0.38s `ease-reverent` | `translateY(-5px) scale(1.012)` | `0 16px 40px rgba(0,105,110,.13), 0 4px 12px rgba(0,105,110,.08), 0 0 0 1px rgba(0,105,110,.07)` |
| Category cards | 0.35s `ease-reverent` | `translateY(-4px) scale(1.02)` | `0 14px 36px rgba(0,105,110,.12), 0 0 0 1px rgba(0,105,110,.08)` |
| Buttons (primary/ghost) | 0.30s `ease-premium` | `translateY(-2px) scale(1.04)` | `0 8px 28px rgba(0,105,110,.42)` |
| Nav links | 0.25s `ease-premium` | `scale(1.05)` | `0 0 0 1px rgba(0,105,110,.12), 0 4px 12px rgba(0,105,110,.1)` |
| Icon buttons | 0.25s `ease-premium` | `scale(1.05)` | `0 0 12px rgba(0,105,110,.2)` |
| Filter chips | 0.22s `ease-premium` | `scale(1.04)` | `0 4px 12px rgba(0,105,110,.22)` |
| Footer links | 0.18s | `translateX(4px)` | left border color `rgba(88,193,199,.4)` |
| Dua card icon buttons | 0.18s | none | background tint + color shift |
| Featured dua action btns | 0.20s | `scale(1.1)` | brighter background |

**Dark mode glow override:** all teal glows swap `rgba(0,105,110,…)` → `rgba(88,193,199,…)` at ~1.25× opacity.

**3D Tilt (Dua Cards):** On `mousemove`, compute cursor position relative to card center. Apply `rotateX` (max ±4°) and `rotateY` (max ±6°) on top of the hover lift. On `mouseleave`, reset transform with 0.38s ease-reverent transition.

**Reveal on scroll:** All section headings, cards, and content blocks carry the `.reveal` class. An `IntersectionObserver` at `threshold: 0.12` adds `.in` when the element enters the viewport, triggering:
- `opacity: 0 → 1`
- `transform: translateY(28px) → none`
- Transition: `0.65s var(--ease-reverent)`

Stagger variants: `.reveal-d1` (+0.10s), `.reveal-d2` (+0.20s), `.reveal-d3` (+0.30s)

**Page background pattern:** Subtle Islamic star geometric SVG at `opacity: 0.04`, tiled across `body` via `background-image`. Must not be removed.

**Brand mark on hover:** Star element rotates 45° and scales 1.15× (`star-spin` keyframe, 0.8s). Halo rings pulse opacity (`halo-pulse`, 0.9s infinite).

---

## 15. Responsive Breakpoints

Follows **CLAUDE.md §23** global ladder exactly.

| Breakpoint | Changes |
|---|---|
| `≤ 1100px` | Nav-link font 11.5px; footer collapses to 3-column |
| `≤ 900px` | Nav-link font 10.5px; brand 16px, brand-mark 28×28px; dua sidebar hides; `.dua-main` takes full width |
| `≤ 760px` | Nav hidden; hamburger shown; all header tool icons except theme toggle, search, and hamburger hide |
| `≤ 700px` | Footer 2-column; stats strip wraps to 2×2; brand col spans full width |
| `≤ 640px` | Dua grid collapses to single column |
| `≤ 440px` | Footer 1-column; all cards stack |

---

## 16. Routing & Linking Rules

**No placeholder `href="#"` links in production.** Every interactive element must route to a real destination or trigger a real action.

| Element | Route or Action |
|---|---|
| Hero "Browse Duas" button | `scrollIntoView({behavior:'smooth'})` → `#duas-section` |
| Hero "By Occasion" link | Anchor scroll → `#categories` |
| Category cards | `dua.html?cat={slug}` |
| Sidebar occasion items | Apply in-page filter + update active state |
| Filter chips | Apply in-page filter + sync with sidebar |
| Dua card source reference | `hadith.html?ref={reference}` or `quran.html?surah={n}&ayah={n}` |
| Featured dua source | Same as above — links to source page |
| Featured dua Previous / Next | Cycle featured dua pool (backend-driven) |
| Load More button | Fetch next 20 cards from API |
| CTA "Explore Qur'an" | `quran.html` |
| CTA "Hadith Library" | `hadith.html` |
| Footer Quick Access links | Exact hrefs per §12.4 |
| Footer Ecosystem links | External URLs in new tab per §12.5 |

---

## 17. User Flows

### Flow 1 — Browse by Category

1. User lands on Dua page → hero with Browse Duas CTA
2. User clicks "Browse Duas" → smooth-scrolls to `#duas-section`
3. User clicks a sidebar occasion link (e.g. "Morning & Evening") → grid filters to that category, sidebar item becomes active
4. User reads Arabic text, transliteration, translation

### Flow 2 — Search and Interact

1. User types "forgiveness" in the search bar → matching duas remain, others hide in real time
2. User clicks "Copy" on a dua → Arabic copied to clipboard, button confirms "Copied!"
3. User clicks the bookmark icon → dua saved, icon turns gold
4. User clicks "AI Explain" → Quranly AI panel slides in with meaning, context, and source

### Flow 3 — Share a Dua

1. User finds a dua they want to post
2. User clicks "Share" → share drawer opens
3. User selects "Share as Image" → watermarked PNG generates
4. User downloads the PNG or taps WhatsApp / Telegram shortcut

### Flow 4 — Audio and Notes

1. User clicks "▶ Play" → inline audio player appears, recitation begins at 1× speed
2. User adjusts playback speed to 0.75×
3. User clicks "Notes" → inline note editor opens below card
4. User types a personal reflection → saves to `localStorage`
5. On next visit, note dot is visible on the card header

### Flow 5 — Daily Habit (Dua of the Day)

1. User opens the page → Featured Dua of the Day is the first major section
2. User reads the dua → saves it to bookmarks
3. Streak tracker in sidebar increments today's day to `.done`
4. User returns tomorrow → a new featured dua appears; yesterday's day still shows `.done`

### Flow 6 — Dark Mode

1. User clicks theme toggle in the header
2. `data-theme="dark"` applied to `<html>`; stored in `localStorage`
3. Bismillah transitions from teal gradient → gold gradient with glow
4. Cards darken; text and accents adjust; all teal glows shift to light-teal (`#5BC1C7`)
5. On next page load, dark mode is pre-applied from `localStorage` before render

---

## 18. Acceptance Criteria Checklist

Run this checklist before shipping.

### Global Structure
- [ ] `<html lang="en" data-theme="light">` opening tag present
- [ ] Fonts: Cormorant Garamond, Inter, Amiri — preconnected and imported in this exact order
- [ ] `:root` block contains all 50+ CSS variable tokens exactly as CLAUDE.md §1
- [ ] Dark mode sibling `[data-theme="dark"]` block present and unmerged from `:root`
- [ ] Body has Islamic geometric `background-image` pattern (opacity 0.04)
- [ ] `.ambient` radial glow div is first child of `<body>`
- [ ] Page shell uses `.shell` wrapper

### Header
- [ ] All **10** nav items present in exact order
- [ ] `Daily Duas` has `class="nav-link active"` with teal/gold underline indicator
- [ ] `knowledge-hub.html` present at position 5 — never omitted
- [ ] `islamic-studies.html` used — never `learn.html`
- [ ] Logo, nav (center), tools (right) three-zone layout correct
- [ ] All 4 tool items present: search, language, theme, admin
- [ ] Hamburger visible only at ≤ 760px
- [ ] Theme toggle persists to `localStorage` key `islamicinfo-theme`
- [ ] Search popup: opens on click, focuses input, closes on Escape / outside click

### Mobile Menu
- [ ] Includes all **10** nav links with correct hrefs
- [ ] `Daily Duas` marked `.active` / `.mm-link active`
- [ ] `knowledge-hub.html` link present
- [ ] `islamic-studies.html` used (not `learn.html`)
- [ ] Opens / closes correctly; Escape key closes
- [ ] Fade + slide-in animation on open

### Hero
- [ ] Bismillah is first child of `.hero-inner`
- [ ] Light: teal gradient clip-text; Dark: gold gradient + drop-shadow
- [ ] Hero H1 uses `var(--font-display)` with `<span class="gradient-italic">`
- [ ] Arabic verse (`ادْعُونِي أَسْتَجِبْ لَكُمْ`) present below H1
- [ ] 4 floating `.geo` decorators with correct animations
- [ ] Hero-bg radial gradient with `bgD` animation
- [ ] "Browse Duas" smooth-scrolls to `#duas-section`
- [ ] "By Occasion" scrolls to `#categories`

### Stats Strip
- [ ] 4 stats present: 1,240+ · 18+ · 100% · 3+
- [ ] Overlaps hero bottom by `margin-top: -20px`
- [ ] `.fade-up` entry animation applied

### Featured Dua
- [ ] Dark gradient card with gold and teal glow overlays
- [ ] Arabic text, transliteration, translation, source all present
- [ ] Copy, Share, Save action buttons all functional
- [ ] Previous / Next navigation buttons present
- [ ] Arabesque divider below card

### Category Grid
- [ ] All 12 category cards present with icons, labels, counts
- [ ] All cards are `<a>` elements with real `?cat=` hrefs
- [ ] Hover: `translateY(-4px) scale(1.02)` + teal glow — no shimmer
- [ ] Section id `categories` present for anchor

### Dua Library
- [ ] Section id `duas-section` present for anchor
- [ ] Sidebar: all 14 occasion links with real hrefs, active state works
- [ ] Streak tracker: 7-day row with `.done`, `.today`, default states
- [ ] Sidebar hides at ≤ 900px
- [ ] Search bar: live-filters dua cards on `input` event
- [ ] Filter chips: active state toggles correctly, filters grid
- [ ] Dua grid: `auto-fill`, `minmax(300px, 1fr)`, 20px gap
- [ ] Single column at ≤ 640px

### Dua Cards (every card)
- [ ] Arabic text (`.dua-arabic`) — RTL, teal-tinted background
- [ ] Transliteration (`.dua-transliteration`) — italic, gold-700
- [ ] Translation (`.dua-translation`) — serif, teal left border
- [ ] Source (`.dua-source`) — with green dot indicator
- [ ] All 6 action buttons present: Copy · Share · Save · Notes · AI Explain · Play
- [ ] Copy button works and shows "Copied!" confirmation
- [ ] Save toggles gold icon state, persists to localStorage
- [ ] Notes expands editor, persists to localStorage
- [ ] AI Explain opens labeled panel with disclaimer
- [ ] Play opens audio player (or disabled state if no audio)
- [ ] Share opens drawer with watermarked image option
- [ ] 3D tilt on mousemove; reset on mouseleave
- [ ] Hover: `translateY(-5px) scale(1.012)` + teal glow — **no shimmer**

### Share
- [ ] Watermarked image includes `islamicinfo.org` watermark
- [ ] Watermark is visible but does not overpower content
- [ ] Image is downloadable PNG at ≥ 1080×1080px
- [ ] Share drawer offers: Image · Copy Link · WhatsApp · Telegram · X · Native Share

### AI Explain Panel
- [ ] Panel header always shows "AI-Assisted Explanation — Quranly AI"
- [ ] Panel content: Meaning · Context · Source · Related · Disclaimer
- [ ] Disclaimer is hard-coded in panel template, not AI-generated
- [ ] Loading state shown while API responds
- [ ] Error state with retry on API failure

### Load More
- [ ] Load More button present, functional (or hidden if no more results)
- [ ] Loading spinner shown during fetch

### CTA Section
- [ ] Present as last section before footer
- [ ] Correct eyebrow, title, sub-text
- [ ] "Explore Qur'an" → `quran.html` correct
- [ ] "Hadith Library" → `hadith.html` correct
- [ ] `.reveal` on all child elements

### Footer
- [ ] Uses `ft-` CSS class system (not custom `ii-footer-` classes)
- [ ] Col 1 heading: "Duas" with 5 dua-specific links
- [ ] Col 2: Quick Access — all 8 destinations including Knowledge Hub
- [ ] Col 3: Our Ecosystem — exact URLs from §7.4
- [ ] `quranlyai.com` (not `quranlya.com`) ← common typo
- [ ] `learnspeakai.com` (not `learnspeakAI.com`)
- [ ] Col 4: Company + Legal links
- [ ] Footer bottom: exact copyright string
- [ ] All footer links hover: `translateX(4px)` + left border accent

### Animations & Reveal
- [ ] `.reveal` applied to all section content; `.reveal-d1/d2/d3` for stagger
- [ ] IntersectionObserver fires at `threshold: 0.12`
- [ ] All hover transitions use `var(--ease-reverent)` or `var(--ease-premium)`
- [ ] No shimmer `::after` sweep on any card — banned

### Theme & Script
- [ ] Script block includes: scroll state · theme toggle · search popup · mobile menu · reveal observer · fade-up observer
- [ ] Theme persists across pages and reloads
- [ ] Tested in both light and dark mode
- [ ] All 6 responsive breakpoints verified: 1100 / 900 / 760 / 700 / 640 / 440

---

*End of Dua Page Functional Document v1.0*
*IslamicInfo.org · CLAUDE.md v3.0 · Blueprint: `dua_enhanced.html`*
