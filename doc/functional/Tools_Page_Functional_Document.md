# Tools Page — Functional Document
**IslamicInfo.org · `tools.html` · Islamic Tools Suite**
*Version 1.0 — Production Ready*
*Derived from: `tools_enhanced.html` mockup + CLAUDE.md v3.0 + Tools Page Functional Doc v0*
*Date: 2026-05-17*

---

## Table of Contents

1. [Page Purpose & Role](#1-page-purpose--role)
2. [Page Architecture — Section Map](#2-page-architecture--section-map)
3. [Global Navigation (Header)](#3-global-navigation-header)
4. [Mobile Menu](#4-mobile-menu)
5. [Hero Section](#5-hero-section)
6. [Stats Strip](#6-stats-strip)
7. [Prayer Widget](#7-prayer-widget)
8. [All Tools Grid](#8-all-tools-grid)
   - 8.1 [Tool Tabs (Category Filter)](#81-tool-tabs-category-filter)
   - 8.2 [Tool Card Anatomy](#82-tool-card-anatomy)
   - 8.3 [Complete Tool Card Index](#83-complete-tool-card-index)
9. [Qibla Compass](#9-qibla-compass)
10. [Hijri Calendar](#10-hijri-calendar)
11. [Zakat Calculator](#11-zakat-calculator)
12. [Tasbeeh Counter](#12-tasbeeh-counter)
13. [Fasting Tracker](#13-fasting-tracker)
14. [Islamic Name Finder](#14-islamic-name-finder)
15. [Islamic Age Calculator](#15-islamic-age-calculator)
16. [Sadaqah Tracker](#16-sadaqah-tracker)
17. [Inheritance Calculator](#17-inheritance-calculator)
18. [Mosque Finder](#18-mosque-finder)
19. [AI Claim Verifier (Coming Soon)](#19-ai-claim-verifier-coming-soon)
20. [CTA Section](#20-cta-section)
21. [Global Footer](#21-global-footer)
22. [Design System Tokens & Rules](#22-design-system-tokens--rules)
23. [Interactions & Animations](#23-interactions--animations)
24. [Responsive Breakpoints](#24-responsive-breakpoints)
25. [Routing & Linking Rules](#25-routing--linking-rules)
26. [User Flows](#26-user-flows)
27. [Acceptance Criteria Checklist](#27-acceptance-criteria-checklist)

---

## 1. Page Purpose & Role

The **Islamic Tools** page (`tools.html`) is the utility dashboard of IslamicInfo.org. It occupies **position 7** in the global navigation — between Daily Duas and Habit Tracker.

Its purpose is to:
- Group every practical Islamic tool in one discoverable, functional page
- Operate as a working dashboard, not a content page — each card launches, scrolls to, or opens a real tool
- Cover the full spectrum of Muslim daily needs: prayer, worship tracking, financial fiqh, discovery, and future AI tools
- Be completely free, no account required, mobile-first, and connected to the broader IslamicInfo ecosystem

**Critical design rule:** This page feels like a working app dashboard, not a brochure. Every button, card, and tab must trigger a real, visible action. No decorative elements in production.

All visual implementation must follow **CLAUDE.md v3.0** exactly — tokens, hover system, card styles, navbar, footer.

---

## 2. Page Architecture — Section Map

Top-to-bottom order is fixed. Sections may not be reordered without explicit instruction.

```
┌─────────────────────────────────────────────┐
│  GLOBAL HEADER  (sticky, §3)                │
├─────────────────────────────────────────────┤
│  MOBILE MENU  (overlay, §4)                 │
├─────────────────────────────────────────────┤
│  HERO  (§5)                                 │
│  — Bismillah                                │
│  — Eyebrow badge                            │
│  — H1 title                                 │
│  — Arabic verse                             │
│  — Sub-text                                 │
│  — CTAs (Prayer Times / All Tools)          │
│  — Stats Strip  (§6)                        │
│  — Prayer Widget  (§7)  ← embedded in hero  │
├─────────────────────────────────────────────┤
│  ALL TOOLS GRID  (§8)  #tools-section       │
│  — Category tabs                            │
│  — Tool cards (12 tools)                   │
├─────────────────────────────────────────────┤
│  QIBLA + HIJRI CALENDAR  (§9–10) #qibla-section │
│  — Two-column layout                        │
├─────────────────────────────────────────────┤
│  ZAKAT CALCULATOR  (§11)  #zakat-section    │
├─────────────────────────────────────────────┤
│  TASBEEH + FASTING TRACKER  (§12–13)        │
│    #tasbeeh-section                         │
│  — Two-column layout                        │
├─────────────────────────────────────────────┤
│  NAME FINDER + AGE CALC + SADAQAH  (§14–16) │
│    #name-section                            │
│  — Two-column layout                        │
├─────────────────────────────────────────────┤
│  CTA SECTION  (§20)  — last before footer   │
├─────────────────────────────────────────────┤
│  GLOBAL FOOTER  (§21)                       │
└─────────────────────────────────────────────┘
```

**Section IDs (anchors):**

| Section | id |
|---|---|
| All Tools Grid | `tools-section` |
| Qibla + Hijri Calendar | `qibla-section` |
| Zakat Calculator | `zakat-section` |
| Tasbeeh + Fasting | `tasbeeh-section` |
| Name Finder + Age + Sadaqah | `name-section` |
| Age Calculator | `age-section` (nested inside `name-section`) |

---

## 3. Global Navigation (Header)

### 3.1 Layout

Three-zone: **Logo (far-left) | Nav (center, flex:1) | Tools (far-right)**

Sticky at top (`position: sticky; top: 0; z-index: 100`). On scroll past 16px: `.scrolled` class adds bottom shadow.

### 3.2 Nav Items — All 10, Exact Order, Exact hrefs

| # | Label | href | Note |
|---|---|---|---|
| 1 | Home | `index.html` | |
| 2 | Quran Explorer | `quran.html` | |
| 3 | Hadith Library | `hadith.html` | |
| 4 | Islamic Studies | `islamic-studies.html` | ⚠️ Never `learn.html` |
| 5 | Knowledge Hub | `knowledge-hub.html` | ⚠️ Never omit |
| 6 | Daily Duas | `dua.html` | |
| 7 | Tools | `tools.html` | **`.active`** on this page |
| 8 | Habit Tracker | `habits.html` | |
| 9 | Verify | `verify.html` | |
| 10 | About | `about.html` | |

Active page: `class="nav-link active"` with 2px teal-to-gold gradient underline via `::after`.

### 3.3 Header Tools (Right Side) — Exact Order

1. **Search icon** → opens search popup
2. **Language (EN)** → placeholder
3. **Theme toggle** → `id="themeBtn"` → persists to `localStorage` key `islamicinfo-theme`
4. **Admin (user icon)** → placeholder
5. **Hamburger** → visible ≤ 760px, opens mobile menu

### 3.4 Search Popup

- Trigger: search icon (`id="searchTrigger"`)
- Placeholder: `"Search tools, duas, verses…"`
- Popup: `top: 44px; right: 0; width: 340px`
- Opens on click, auto-focuses input after 50ms
- Closes on: outside click · `Escape` · Search button click
- Dark mode: `rgba(15,27,29,.97)` background

### 3.5 Header CSS Values (CLAUDE.md §4.4)

- Light: `rgba(250,251,251,.92)`, `backdrop-filter: blur(24px) saturate(1.6)`
- Dark: `rgba(10,19,20,.92)`
- Border-bottom: `0.5px solid rgba(0,105,110,.10)`
- Height: `60px`

---

## 4. Mobile Menu

Placed immediately after `</header>`. Full-screen overlay. `id="mobileMenu"`.

### 4.1 All 10 Nav Links — Exact Order & hrefs

```
Home                → index.html
Quran Explorer      → quran.html
Hadith Library      → hadith.html
Islamic Studies     → islamic-studies.html  ← never learn.html
Knowledge Hub       → knowledge-hub.html    ← must not be omitted
Daily Duas          → dua.html
Tools               → tools.html            ← .mm-link active
Habit Tracker       → habits.html
Verify              → verify.html
About               → about.html
```

### 4.2 Open / Close

- Hamburger `onclick="openMM()"` adds `.open`
- Close button `onclick="closeMM()"` removes `.open`
- `Escape` key closes
- Fade + slide-in from right (`mmFade` keyframe, 0.3s)

### 4.3 Visual

- Background: `rgba(6,38,40,.97)` + `backdrop-filter: blur(20px)`
- Link size: `18px`, `rgba(255,255,255,.7)`
- Hover: color `#5BC1C7`, `padding-left: 8px`

---

## 5. Hero Section

CLAUDE.md §6 structure exactly. Stats strip and Prayer Widget are embedded inside the hero.

### 5.1 Element Order (inside `.hero-inner`)

1. Bismillah — `bismillah-hero-top`
2. Eyebrow badge — `hero-badge` with `.badge-dot` pulse
3. H1 title — `hero-title`, `var(--font-display)`
4. Arabic verse — `hero-arabic`
5. Sub-text — `hero-sub`
6. CTA buttons — `hero-btns`
7. Stats strip — (immediately below CTAs, inside hero)
8. Prayer widget — (below stats strip, inside hero)

### 5.2 Content Values

| Element | Content |
|---|---|
| Bismillah | `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ` |
| Eyebrow | `Islamic Tools Suite` |
| H1 — plain | `Every Tool a Muslim` |
| H1 — italic gradient | `Needs Daily` (inside `<span class="grad-it">`) |
| Arabic verse | `حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ` (Qur'an 2:238) |
| Sub-text | "Prayer times, Qibla, Zakat, Inheritance, Hijri Calendar, Tasbeeh, Name Finder, Age Calculator and more — all free, verified, and beautifully designed." |
| Primary CTA | "Prayer Times" → smooth-scroll to prayer widget (`#prayer-widget`) |
| Ghost CTA | "All Tools ↓" → smooth-scroll to `#tools-section` |

### 5.3 Bismillah Color Rules

- **Light:** teal gradient clip-text `linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%)`
- **Dark:** gold gradient + drop-shadow `linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%)`

### 5.4 Floating Geometry Decorators

Three `.geo` SVGs (`.g1`, `.g3`, `.g4`) with `geoRot` animation (continuous 360° rotation + Y translation):

| Class | Position | Shape | Color | Animation |
|---|---|---|---|---|
| `.g1` | top 7%, left 4% | Star polygon + circle | `#00696E` | `geoRot` 28s |
| `.g3` | top 10%, right 5% | Star polygon | `#C5A059` | `geoRot` 32s, delay -14s |
| `.g4` | bottom 12%, right 8% | Circle | `#00696E` | `geoRot` 20s, delay -7s |

Opacity: `.g1` = 7%, `.g3` = 5.5%, `.g4` = 4.5% (dark: 12%, 9%, 8%).

---

## 6. Stats Strip

Embedded inside the hero, below the CTA buttons. Class `.stats-strip`, `margin-top: 36px`.

### 6.1 Four Stats

| id | Value | Label |
|---|---|---|
| `sc1` | `12+` | Tools |
| — | `5` | Prayers Daily |
| `sc2` | `195+` | Countries |
| — | `100%` | Free Forever |

### 6.2 Layout

Horizontal flex row, card-style, `border-radius: var(--r-xl)`, `overflow: hidden`. Stats separated by CSS `::before` pseudo-element dividers (0.5px vertical, `rgba(0,105,110,.12)`).

- `.stat-num-lg`: `var(--font-display)`, `clamp(22px, 3vw, 30px)`, weight 600, `var(--teal-700)` color
- `.stat-label-sm`: `10.5px`, uppercase, letter-spaced

At ≤ 560px: wraps to 2×2, dividers hidden.

**Entry animation:** `.reveal` class → IntersectionObserver fires entrance.

---

## 7. Prayer Widget

A live, interactive dark-gradient card embedded in the hero section. `id="prayer-widget"` (anchor target from hero CTA). Max-width: 740px, centered.

### 7.1 Visual Structure

Dark gradient card: `linear-gradient(135deg, teal-900, teal-800, #062628)`, `border-radius: 24px`, `box-shadow: var(--elev-4)`.

Two decorative radial glows: `::before` (gold, top-right), `::after` (teal, bottom-left).

### 7.2 Header Row (`.pw-header`)

**Left side:**
- Location row (`.pw-loc-row`): pin icon + city name + **"Change" button** (`onclick="getPrayerLocation()"`)
- Date line (`.pw-date`, `id="pwDate"`): populated from `new Date()` on page load with `toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'})`

**Right side:**
- Next prayer badge (`.pw-next-badge`): animated dot + "Next: [Prayer] · [Time]" — highlighted in gold

### 7.3 Prayer Times Grid (`.pw-prayers`)

6-column grid (3-column at ≤ 600px). One `.pw-prayer` cell per time slot:

| Slot | Classes | State |
|---|---|---|
| Fajr | `.pw-prayer.past` | Already passed — opacity 44% |
| Sunrise | `.pw-prayer.past` | Already passed |
| Dhuhr | `.pw-prayer.past` | Already passed |
| Asr | `.pw-prayer.next` | Next prayer — gold tint + `breathGold` animation |
| Maghrib | `.pw-prayer` | Upcoming |
| Isha | `.pw-prayer` | Upcoming |

Each cell contains:
- `.pw-name`: prayer name, 9.5px uppercase
- `.pw-time`: time display, `var(--font-serif)`, 19px
- `.pw-adhan-dot`: 5px dot (animated gold pulse on `.next`)

**Click behavior:** In production, each prayer cell shows countdown or opens adhan settings for that prayer.

### 7.4 Footer Row (`.pw-footer`)

**Left — Sun data (`.pw-sun-strip`):**
- 🌅 Sunrise: time value
- 🌇 Sunset: time value
- Daylight: duration (e.g. "14h 30m")

**Right — Extra controls (`.pw-extra`):**

| Button | Label | Action |
|---|---|---|
| `.pw-extra-btn` | 🔔 Adhan | Opens adhan settings dropdown — choose audio alert, mute individual prayers |
| `.pw-extra-btn` | ⚙️ Method | Opens calculation method selector (Hanafi, ISNA, MWL, etc.) |
| `.pw-extra-btn` | 📍 My Location | `onclick="getPrayerLocation()"` — triggers `navigator.geolocation.getCurrentPosition()` to refresh times |

### 7.5 Location Detection (`getPrayerLocation`)

Calls `navigator.geolocation.getCurrentPosition()`. On success: updates location label, recalculates prayer times via API (AlAdhan API or Aladhan.com). On denial: shows inline error message "Location access denied — enter city manually."

In production: prayer times fetched from **AlAdhan API** (`https://api.aladhan.com/v1/timingsByCity`) with user's city and chosen calculation method.

---

## 8. All Tools Grid

Section `id="tools-section"`. Background: `var(--surface)`.

### 8.1 Tool Tabs (Category Filter)

`.tool-tabs` row — five filter tabs above the grid.

| Tab Label | `data-cat` filter | Tools shown |
|---|---|---|
| All Tools | `all` | All 12 cards |
| Prayer & Worship | `prayer` | Prayer Times, Qibla, Hijri Calendar, Tasbeeh Counter |
| Finance & Fiqh | `finance` | Zakat Calculator, Inheritance Calculator, Sadaqah Tracker |
| Trackers | `tracker` | Tasbeeh Counter, Fasting Tracker, Sadaqah Tracker |
| Discovery | `discovery` | Islamic Name Finder, Age Calculator, Mosque Finder, AI Claim Verifier |

**Behavior:** Click → removes `.active` from all tabs, adds to clicked, then iterates all `.tool-card` elements: if `data-cat` includes the filter string (or filter = `all`), show card; else `display: none`.

**Active tab style:** `background: var(--teal-700)`, `color: white`, `border-color: transparent`, glow shadow, `scale(1.04)`.

### 8.2 Tool Card Anatomy

Each tool is a `.card.tool-card` (anchor `<a>` if it routes, `<div>` if decorative/coming-soon).

**Card structure (top to bottom):**

**1. Top row (`.tool-card-top`)**
- Left: `.tool-icon` — 50×50px rounded square icon with themed background
  - `.ti-teal` — teal-tinted bg; icon `color: var(--teal-700)`
  - `.ti-gold` — gold-tinted bg; icon `color: var(--gold-700)`
  - `.ti-emerald` — emerald-tinted bg; icon `color: var(--grade-sahih)`
- Right: Status badge
  - `.ts-live` — "● Live" — green badge; tool is fully functional
  - `.ts-new` — "✦ NEW" — gold gradient badge; recently launched
  - `.ts-beta` — "Beta" — teal outline badge; functional but in testing
  - `.ts-soon` — "Coming Soon" — muted badge; not yet available

**2. Title (`.tool-title`)** — `var(--font-serif)`, 20px, weight 500

**3. Description (`.tool-desc`)** — 13.5px, `var(--ink-muted)`, line-height 1.65

**4. Tags row (`.tool-tags`)** — 2–3 keyword pills (`.tool-tag`)

**5. CTA link (`.tool-link`)** — "Open Tool →" or "Open [Name] ↗" for external tools; teal text, border-top separator. Arrow-gap animates on hover (`gap: 6px → 10px`).

**Hover behavior:** `translateY(-5px) scale(1.012)` + teal glow. Tool icon: `scale(1.1) rotate(-5deg)` + glow. **No shimmer sweep.** 3D tilt on mousemove (see §23).

**Coming Soon behavior:** Card uses `<div>` (not `<a>`), `cursor: default`, `opacity: 0.75`. CTA link shows "Launching 2026" with `opacity: 0.45; cursor: default`. No hover lift. No route.

### 8.3 Complete Tool Card Index

All 12 tool cards in grid order, with their full spec:

---

**1. Prayer Times**
- Status: `● Live`
- Icon: `.ti-teal` — clock/circle icon
- Categories: `prayer`
- Description: "Accurate salah times for any city worldwide. Auto-detect your location or search manually. All 5 prayers + Sunrise with adhan alerts."
- Tags: `Auto-detect` · `195+ Cities` · `All Methods`
- Link text: "Open Tool"
- href: `#prayer-widget` (smooth-scroll to prayer widget in hero)

---

**2. Qibla Compass**
- Status: `● Live`
- Icon: `.ti-teal` — compass/radial icon
- Categories: `prayer`
- Description: "Precise Qibla direction from any point on Earth. GPS detection or manual city search with animated compass and distance to Mecca."
- Tags: `GPS` · `Distance` · `Animated`
- Link text: "Open Tool"
- href: `#qibla-section`

---

**3. Hijri Calendar**
- Status: `● Live`
- Icon: `.ti-teal` — calendar icon
- Categories: `prayer`
- Description: "Full Islamic calendar with Gregorian conversion. Highlights Ramadan, Eid, Ashura, and all major Islamic dates with event countdowns."
- Tags: `1447 AH` · `Auto-sync` · `Events`
- Link text: "Open Tool"
- href: `#qibla-section` (calendar is in same section as Qibla)

---

**4. Tasbeeh Counter**
- Status: `✦ NEW`
- Icon: `.ti-teal` — bead/circle icon
- Categories: `prayer tracker`
- Description: "Digital dhikr counter with SubhanAllah, Alhamdulillah, Allahu Akbar, and custom dhikr. Tracks daily & weekly totals with vibration."
- Tags: `Dhikr` · `Sessions` · `Vibrate`
- Link text: "Open Tool"
- href: `#tasbeeh-section`

---

**5. Fasting Tracker**
- Status: `✦ NEW`
- Icon: `.ti-gold` — moon/clock icon
- Categories: `tracker`
- Description: "Track Ramadan, voluntary Mondays & Thursdays, and Shawwal fasts. Visual calendar with suhoor/iftar times and streak counter."
- Tags: `Ramadan` · `Voluntary` · `Streaks`
- Link text: "Open Tool"
- href: `#tasbeeh-section` (fasting is in same section as Tasbeeh)

---

**6. Zakat Calculator**
- Status: `● Live`
- Icon: `.ti-emerald` — recycle/finance icon
- Categories: `finance`
- Description: "Calculate annual Zakat on savings, gold, silver, investments, and business assets. Live nisab from current gold price. Fiqh-verified."
- Tags: `Live Nisab` · `Gold & Silver` · `Fiqh-verified`
- Link text: "Open Tool"
- href: `#zakat-section`

---

**7. Inheritance Calculator**
- Status: `● Live`
- Icon: `.ti-emerald` — people/network icon
- Categories: `finance`
- Description: "Divide an estate according to Islamic farāʾiḍ law. Supports all 8 heir types — spouse, children, parents, siblings — with detailed breakdown."
- Tags: `Farā'iḍ` · `All Heirs` · `PDF Report`
- Link text: "Open Tool"
- href: `inheritance.html` (dedicated page) — *opens dedicated Inheritance Calculator page*

---

**8. Sadaqah Tracker**
- Status: `✦ NEW`
- Icon: `.ti-gold` — heart icon
- Categories: `tracker finance`
- Description: "Log voluntary charity, set monthly goals, and see your annual impact. Ramadan-specific prompts and progress rings to keep you motivated."
- Tags: `Goals` · `Monthly` · `Ramadan`
- Link text: "Open Tool"
- href: `#name-section` (Sadaqah widget is in the Name/Age section)

---

**9. Islamic Name Finder**
- Status: `Beta`
- Icon: `.ti-teal` — book/open icon
- Categories: `discovery`
- Description: "Search 2,000+ Islamic names with Arabic script, meaning, gender, origin, and Qur'anic reference. Filter by letter, origin, or gender."
- Tags: `2,000+ Names` · `Arabic` · `Qur'anic`
- Link text: "Open Tool"
- href: `#name-section`

---

**10. Islamic Age Calculator**
- Status: `Beta`
- Icon: `.ti-teal` — calendar/dot icon
- Categories: `discovery`
- Description: "Convert your Gregorian birthdate to Hijri. Know your exact age in Islamic calendar years, months, and days — instantly."
- Tags: `Gregorian→Hijri` · `Exact Days` · `Birthday`
- Link text: "Open Tool"
- href: `#age-section`

---

**11. Mosque Finder**
- Status: `● Live`
- Icon: `.ti-teal` — location pin icon
- Categories: `discovery`
- Description: "Find the nearest masjid, prayer room, or Islamic center globally. Powered by MosqueFinder.net with ratings and Jumu'ah times."
- Tags: `GPS` · `Maps` · `Jumu'ah`
- Link text: "Open MosqueFinder ↗"
- href: `https://mosquefinder.net` (external, `target="_blank" rel="noopener"`)

---

**12. AI Claim Verifier** *(Coming Soon)*
- Status: `Coming Soon`
- Icon: `.ti-gold` — brain/AI icon
- Categories: `discovery`
- Description: "Paste any Islamic quote or hadith. AI cross-references 61,000+ hadith and Qur'an to verify authenticity with scholar grading."
- Tags: `AI-Powered` · `61K+ Hadith` (muted, opacity 50%)
- Link text: "Launching 2026" (opacity 45%, no hover, no route)
- Card: `<div>` not `<a>`. `cursor: default`, `opacity: 0.75`.
- On click: show info modal or tooltip — "AI Claim Verifier is coming in 2026. Join the waitlist to be notified."

---

## 9. Qibla Compass

Section `id="qibla-section"`, background: `var(--surface-card)`. Left column of a two-column grid.

### 9.1 Section Header

- Eyebrow: `Live Tools`
- Title: `Qibla & ` + `<span class="gold-it">Hijri Calendar</span>`

### 9.2 Card Layout (`.qibla-card`)

**Top info row:**
- City label (`id="qCity"`): displays detected or default city (e.g. "Toronto, Ontario")
- Degree display (`id="qDeg"`): large serif number + `°` symbol (e.g. "54°")

**Compass widget (`.compass-wrap`, 196×196px):**
- Outer ring: `border-radius: 50%`, teal-tinted border
- Animated dashed ring: SVG circle rotating 360° continuously (`spin` keyframe, 22s linear)
- Cardinal direction labels: N / S / E / W positioned absolutely
- Center assembly:
  - `.needle-n`: 70px tall, gold gradient, `transform-origin: bottom center` — rotates to Qibla angle
  - `.compass-dot`: 8px gold dot with glow
  - `.needle-s`: 28px, teal-tinted, counterpart to north needle

**Kaʿbah label:** `🕋 Kaʿbah · Mecca` in gold-700, uppercase

**Info row:**
- Distance: `id="qDist"` — e.g. "7,234 km"
- Bearing: `id="qBearing"` — e.g. "54° NE"

**Detect button:** `.btn-ghost` full-width — "📍 Detect My Location" → `onclick="getQibla()"`

### 9.3 `getQibla()` Function

1. Calls `navigator.geolocation.getCurrentPosition()`
2. Computes Qibla angle using spherical trigonometry (Haversine formula with Mecca coordinates: 21.4225°N, 39.8262°E)
3. Rotates `#compassNeedle` via `style.transform = 'rotate(' + (deg - 180) + 'deg)'` with 0.9s `ease-reverent` transition
4. Updates `#qDeg`, `#qDist`, `#qBearing`
5. On geolocation error: shows alert "Location access denied."

---

## 10. Hijri Calendar

Right column of the Qibla section's two-column grid. Card class: `.hijri-card`.

### 10.1 Card Header (`.hc-header`)

- Left: month name in serif English + Arabic script with year (e.g. "Shawwāl" + `شَوَّال ١٤٤٧`)
- Right: navigation arrows (`.hc-nav-btn` × 2) — `‹` previous month, `›` next month

**Navigation behavior:** Clicking `‹` or `›` decrements/increments the displayed Hijri month and re-renders the calendar grid and events list. In production: computes from `toHijri()` conversion library.

### 10.2 Calendar Grid (`.hc-grid`)

7-column grid (Sun–Sat). Row 1: day name headers. Rows 2+: numbered day cells.

Day cell classes:

| Class | Visual | Meaning |
|---|---|---|
| `.hc-day` | Default | Normal day |
| `.hc-day.today` | Teal-700 bg, white text | Current Hijri date |
| `.hc-day.event` | Gold-700 text, weight 600 + dot indicator | Islamic event day |
| `.hc-day.faded` | 30% opacity | Previous month overflow days |

**Click behavior:** Clicking a day cell scrolls to or displays event details for that date if it is an event day.

### 10.3 Events List (`.hc-events`)

Below the grid, separated by a top border. Lists upcoming Islamic events for the visible month.

Each `.hc-event` row:
- Colored dot (`.hc-dot`) — gold for Sunnah events, teal for month transitions
- Event name (`.hc-event-name`), weight 500
- Date label (`.hc-event-date`) — relative ("Tomorrow", "+15 days") or absolute ("Jun 6")

**Initial events (Shawwāl 1447):**
1. Gold dot — "Shawwāl 6 Fasts begin" — "Tomorrow"
2. Teal dot — "Dhū al-Qaʿdah begins" — "+15 days"
3. Gold dot — "Eid al-Adha" — "Jun 6"

---

## 11. Zakat Calculator

Section `id="zakat-section"`. Background: `var(--surface)`.

### 11.1 Section Header

- Eyebrow: `Financial Fiqh`
- Title: `Zakat ` + `<span class="gold-it">Calculator</span>`
- Sub-text: "Calculate your annual Zakat obligation with live nisab values. Fiqh-verified 2.5% formula."

### 11.2 Layout

`.zakat-grid`: two-column grid (`1.1fr 1fr`, 28px gap). Collapses to single column at ≤ 820px.

### 11.3 Left Card — Input Form (`.zakat-form-card`)

Five labeled currency input fields. Each uses `.zk-wrap` with a `$` symbol prefix and `type="number"` input. All call `calcZakat()` on `oninput`.

| Field label | id |
|---|---|
| Cash & Bank Savings | `zkCash` |
| Gold & Silver Value | `zkGold` |
| Business Assets / Inventory | `zkBiz` |
| Investments (Stocks, Funds) | `zkInv` |
| Outstanding Debts (Deduct) | `zkDebt` |

Below the inputs: nisab info line — "ℹ Current Nisab (85g gold): **$6,180 USD**" — updated in production from live gold price API.

**Calculate button (`.zk-btn`):** "Calculate My Zakat" — teal gradient, full-width, also calls `calcZakat()`.

### 11.4 Right Card — Result Display (`.zakat-result-card`)

Gradient tinted card (`rgba(0,105,110,.04) → rgba(197,160,89,.02)`).

- Eyebrow: "Your Zakat Due"
- Large amount (`id="zkResult"`): `clamp(34px, 5vw, 52px)`, `var(--font-display)`, teal-700
- Sub-label (`id="zkResultLabel"`): changes dynamically (see below)
- Breakdown table (`.zk-breakdown`):
  - Total Zakatable Wealth (`id="zkTotal"`)
  - Nisab Threshold: `$6,180`
  - Zakat Rate: `2.5%`
  - **Zakat Payable** (`id="zkPayable"`) — bold, larger, teal

- Disclaimer note: "⚠️ This provides an estimate. Zakat is a personal obligation — consult a qualified scholar for your situation. Calculations follow Hanafi methodology."

### 11.5 `calcZakat()` Calculation Logic

```
total = cash + gold + biz + investments - debts
nisab = 6180 (updated to live value in production)
zakat = (total >= nisab) ? total * 0.025 : 0
```

`zkResultLabel` text:
- If `total >= nisab`: "Based on 2.5% of zakatable wealth"
- If `total < nisab`: "Wealth below nisab — no Zakat due"

All amounts formatted with 2 decimal places and thousands separator (`$6,180.00`).

---

## 12. Tasbeeh Counter

Section `id="tasbeeh-section"`, background: `var(--surface-card)`. Left column of two-column grid.

### 12.1 Section Header

- Eyebrow: `Worship Trackers`
- Title: `Tasbeeh & ` + `<span class="gold-it">Fasting</span>`

### 12.2 Card Layout (`.tasbeeh-card`)

Center-aligned layout. Title: "Digital Tasbeeh" in `var(--font-serif)`.

### 12.3 Dhikr Preset Chips (`.dhikr-chips`)

Four pill buttons. Active chip: `.on` class → teal-700 background, white text, glow.

| Chip label | Arabic | English | Goal count |
|---|---|---|---|
| SubhanAllah | `سُبْحَانَ اللَّهِ` | "Glory be to Allah" | 33 |
| Alhamdulillah | `الْحَمْدُ لِلَّهِ` | "All praise is to Allah" | 33 |
| Allahu Akbar | `اللَّهُ أَكْبَرُ` | "Allah is the Greatest" | 34 |
| La Ilaha Illallah | `لَا إِلَٰهَ إِلَّا اللَّهُ` | "There is no god but Allah" | 100 |

**`setDhikr(btn, ar, en, goal)` behavior:**
- Removes `.on` from all chips, adds to clicked
- Updates `#dhikrAr` and `#dhikrEn` text
- Sets `tbGoal` and updates `#tbGoal` display
- Resets `tbCount` to 0, updates counter display

### 12.4 Arabic & English Display

- `#dhikrAr`: `var(--font-arabic)`, 21px, RTL, `var(--teal-700)` (dark: `teal-300`)
- `#dhikrEn`: `var(--font-serif)`, 13.5px, italic, `var(--ink-muted)`

### 12.5 Counter Button (`.tasbeeh-btn`)

152px diameter circle button. Teal gradient background. Gold glow ring on hover (`box-shadow` expands from 5px to 7px ring).

Shows:
- `.tb-count` (`id="tbCount"`): large `var(--font-display)` number, 52px, white
- `.tb-goal` (`id="tbGoal"`): "of 33" — small, `rgba(255,255,255,.55)`

**Click effect:** `transform: scale(0.92)` for 120ms, then snaps back.

**`incrementTasbeeh()` logic:**
```
tbCount++
tbTotal++
if (tbCount >= tbGoal):
  tbCount = 0
  tbRounds++
Update: #tbCount, #tsRounds, #tsTotal, #tsWeek
If vibrate ON: navigator.vibrate(28)
```

### 12.6 Control Buttons (`.tasbeeh-ctrls`)

Three `.tb-ctrl` pills:

| Button | Label | Action |
|---|---|---|
| Reset | `↺ Reset` | `resetTasbeeh()` → sets `tbCount = 0`, `tbRounds = 0`, updates display |
| Undo | `← Undo` | `undoTasbeeh()` → decrements `tbCount` and `tbTotal` by 1 (if > 0) |
| Vibrate | `📳 Vibrate ON/OFF` | `toggleVibrate()` → toggles `tbVib` boolean, updates button label |

### 12.7 Session Stats (`.tasbeeh-session`)

Three-column strip (`.tsess-item` × 3):
- `id="tsRounds"`: Rounds completed
- `id="tsTotal"`: Today's total taps
- `id="tsWeek"`: This week's total (in production: persisted from localStorage)

---

## 13. Fasting Tracker

Right column of the Tasbeeh section. Card class: `.fast-card`.

### 13.1 Card Header (`.fast-header`)

- Left: title "Fasting Tracker" + sub "Shawwāl 1447 — Voluntary Fasts"
- Right: large count (`id="fastCountBig"`) + label "of 6 Shawwāl" — shows fasted days of target

### 13.2 Monthly Calendar Grid (`.fast-grid`, `id="fastGrid"`)

Dynamically built by `buildFastGrid()` — 30 cells for the month.

Day cell classes:

| Class | Visual | Meaning |
|---|---|---|
| `.fd` | Default, faint teal bg | Not yet fasted |
| `.fd.fasted` | Teal-700 bg, white text | Day marked as fasted |
| `.fd.today-fd` | Dashed teal-500 border | Today's date |

**Click behavior:** Toggle `.fasted` class on the cell. Calls `updateFastStats()` to refresh counters.

### 13.3 Fasting Stats Strip (`.fast-stats`)

Three-section horizontal bar:
- `id="fsFasted"`: Days Fasted (count)
- `id="fsLeft"`: Days Remaining (= max(0, 6 − fasted))
- `id="fsStreak"`: Current Streak (consecutive fasted days)

### 13.4 Suhoor / Iftar Times (`.fast-times`)

Two rows:
- Today's Suhoor: e.g. `4:28 AM`
- Iftar (Maghrib): e.g. `8:42 PM`

In production: pulled from same prayer times API as the prayer widget.

### 13.5 Mark Today Button

`.btn-primary` full-width — `id="fastTodayBtn"`, `onclick="toggleFastToday()"`.

**Default label:** "✓ Mark Today as Fasted"

**After clicking:**
- Label changes to "✓ Today Fasted — Alhamdulillah"
- Day 15 in grid gains `.fasted` class
- `updateFastStats()` fires

**Second click:** Reverts to default label, removes fasted state from today.

---

## 14. Islamic Name Finder

Section `id="name-section"`. Left column of three-panel layout. Card class: `.name-card`.

### 14.1 Card Header

Title: "Islamic Name Finder" in `var(--font-serif)`, 20px
Sub-text: "Search 2,000+ names with Arabic script, meaning, and origin"

### 14.2 Search Input Row (`.name-input-row`)

- Text input (`id="nameSearch"`, `.name-input`): placeholder `"e.g. Maryam, Ibrahim, Aisha…"`
- Search button (`onclick="searchName()"`): teal gradient, magnifier icon + "Search"
- `Enter` key on input also triggers `searchName()`

### 14.3 `searchName()` Logic

1. Gets value from `#nameSearch`, lowercases, strips non-alpha characters
2. Looks up result in local `NAMES` dictionary
3. If found: calls `showName(data)` to populate and show `#nameResult`
4. If not found: hides `#nameResult`

In production: queries a backend API of 2,000+ names with full data.

### 14.4 Name Result Panel (`#nameResult`, `.name-result`)

Hidden by default (`display: none`). Revealed with `slideUp` animation (0.3s) on result.

Contents:
- `#nrAr` (`.nr-ar`): Arabic name, `var(--font-arabic)`, 28px, RTL, `var(--teal-700)`
- `#nrTitle` (`.nr-title`): English name + transliteration, serif, 20px
- `#nrMeaning` (`.nr-meaning`): Detailed meaning and Islamic context, 13.5px
- Tags row (`.nr-tags`):
  - `#nrGender` — gender badge: `.tag-m` (blue) or `.tag-f` (rose)
  - `#nrOrigin` — origin badge: `.tag-ori` (teal)
  - `#nrQuran` — Qur'anic reference: `.tag-quran` (gold) if from Qur'an; "From Sunnah" if not

### 14.5 Built-in Name Database (8 names for mockup)

| Key | Arabic | Gender | Qur'anic |
|---|---|---|---|
| `maryam` | مَرْيَم | Female | ✓ |
| `ibrahim` | إِبْرَاهِيم | Male | ✓ |
| `yusuf` | يُوسُف | Male | ✓ |
| `aisha` | عَائِشَة | Female | — |
| `khadijah` | خَدِيجَة | Female | — |
| `umar` | عُمَر | Male | — |
| `zaynab` | زَيْنَب | Female | — |
| `nuh` | نُوح | Male | ✓ |

### 14.6 Suggestion Chips (`.name-sugg`)

Label: "Popular Names"

8 Arabic-script chips, each `onclick="quickName('[key]')"`. Clicking: auto-fills the search input with the name key (capitalized) and immediately calls `showName()` to display the result.

| Arabic chip | Key |
|---|---|
| مريم | maryam |
| إبراهيم | ibrahim |
| يوسف | yusuf |
| عائشة | aisha |
| خديجة | khadijah |
| عمر | umar |
| زينب | zaynab |
| نوح | nuh |

---

## 15. Islamic Age Calculator

Nested inside `#name-section`, in the right column stack. Card `id="age-section"`.

### 15.1 Card Header

Title: "Islamic Age Calculator" in `var(--font-serif)`, 20px
Sub-text: "Convert your birthday to the Hijri calendar"

### 15.2 Input Grid (`.age-inputs`)

Two-column, collapses to single at ≤ 460px.

| Label | id | Type | Default |
|---|---|---|---|
| Date of Birth | `ageDob` | `date` | Empty |
| Today | `ageToday` | `date` | `new Date().toISOString().split('T')[0]` (auto-set on load) |

Both trigger `calcAge()` on `onchange`.

### 15.3 Result Grid (`.age-result`)

2×2 grid of result items:

| id | Label |
|---|---|
| `aHijriY` | Hijri Years |
| `aHijriM` | Hijri Months |
| `aGregY` | Gregorian Years |
| `aDays` | Total Days |

Default: all show `—` until inputs provided.

### 15.4 Hijri Birthday Box (`.age-hijri-box`)

- Label: "Your Hijri Birthday"
- `id="aHijriAr"` — Arabic Hijri date (approximate)
- `id="aHijriEn"` — English Hijri month and year (e.g. "Ramaḍān 1411 AH (approximate)")

Default: `aHijriAr` = `أَدْخِلْ تَارِيخَ مِيلَادِكَ`, `aHijriEn` = "Enter your date of birth above"

### 15.5 `calcAge()` Calculation Logic

```
days = (today - dob) in milliseconds / 86400000
gregY = floor(days / 365.25)
hijriY = floor(days / 354.37)
hijriM = floor((days % 354.37) / 29.53)
hijriBirthYear ≈ (dob.getFullYear() - 622) * 1.0307 + 1
```

Result labeled "(approximate)" — exact Hijri conversion requires a lookup table in production.

---

## 16. Sadaqah Tracker

Below the Age Calculator in the right column of `#name-section`. Mini-card with ring progress visualization.

### 16.1 Card Header

Title: "Sadaqah Tracker" in `var(--font-serif)`, 18px

### 16.2 Progress Ring (`.sad-ring`)

SVG circle 90×90px. Two concentric circles:
- Background ring: `rgba(0,105,110,.12)`, stroke-width 7
- Progress ring: gradient `#00696E → #C5A059`, `stroke-dasharray: 226.2`, `stroke-dashoffset: 141` (= 37.5% progress)
- Center text: percentage (`id` = `.sad-pct`, 38%) + "of goal" label

### 16.3 Stats Column (`.sad-stats`)

Three rows:
- This Month: `$76`
- Monthly Goal: `$200`
- This Year: `$440`

In production: all values pulled from localStorage or user account.

### 16.4 Log Sadaqah Button (`.sad-add`)

"Log Sadaqah" with plus icon.

**Click behavior:**
1. Button text changes to "✓ Logged! JazakAllahu Khayran" immediately
2. After 2 seconds: reverts to original button with plus icon
3. In production: opens a donation log form (amount + cause) and saves to user's ledger

---

## 17. Inheritance Calculator

Standalone tool reached via the tool card in the grid (href: `inheritance.html`). Not a section on this page — it is a **dedicated page**.

**Tool card behavior:** Clicking opens `inheritance.html`. The card description explains it handles all 8 heir types (spouse, children, parents, siblings) under Islamic farāʾiḍ law with PDF report export.

In production, the Inheritance Calculator page (`inheritance.html`) includes:
- Estate value input
- Heir type selector (checkboxes for all 8 types with sub-fields)
- Distribution output showing each heir's share (fraction + monetary value)
- Downloadable PDF report of the distribution

---

## 18. Mosque Finder

External tool — opens `https://mosquefinder.net` in a new tab.

**Tool card behavior:** The card `<a>` element has `href="https://mosquefinder.net"`, `target="_blank"`, `rel="noopener"`.

**Link label:** "Open MosqueFinder ↗" — arrow denotes external destination.

In production the tool card links directly to MosqueFinder.net. No embedding on the Tools page.

---

## 19. AI Claim Verifier (Coming Soon)

A preview card in the tool grid. Not yet functional.

### 19.1 Card Behavior

- Card element: `<div>` (not `<a>`) — no routing
- `cursor: default; opacity: 0.75`
- Status badge: `.ts-soon` — "Coming Soon"
- All tags at 50% opacity
- CTA: "Launching 2026" at 45% opacity, `cursor: default`

### 19.2 Click Behavior

Clicking anywhere on the card (or the text "Launching 2026") shows a modal or tooltip:
- Title: "AI Claim Verifier — Coming 2026"
- Body: "Paste any Islamic quote or hadith. Our AI will cross-reference 61,000+ hadith and the full Qur'an to verify authenticity with scholar grading — no more fabricated quotes spreading unchecked."
- Optional: email input + "Join Waitlist" button

### 19.3 Future Functionality (when live)

- User pastes Islamic quote or hadith text
- AI model queries the `verify.html` backend
- Returns: authenticity grade, source reference, confidence score
- Links to the Verify page for detailed analysis (`verify.html`)

---

## 20. CTA Section

Last section before the footer. CLAUDE.md §11 template.

### 20.1 Content

| Element | Value |
|---|---|
| Eyebrow | `✦ Free · No Account · No Ads · Always` |
| H2 title | `All the Tools.` |
| H2 italic | `Always Free.` (gold gradient text) |
| Sub-text | "Prayer times, Qibla, Zakat, Tasbeeh, Fasting Tracker, Name Finder — everything a Muslim needs, built with sincerity and verified accuracy." |

### 20.2 CTA Actions (three buttons)

| Button | Class | href |
|---|---|---|
| Track Your Ibadah | `.btn-gold` | `habits.html` |
| Dua Library | `.btn-white-ghost` | `dua.html` |
| Verify a Hadith | `.btn-white-ghost` | `verify.html` |

### 20.3 Visual

Background: `linear-gradient(135deg, #0A3A3D, #00696E, #062628)`. Gold glow `::before` top-left, teal glow `::after` bottom-right.

---

## 21. Global Footer

**Uses `ft-` CSS class system from CLAUDE.md §7.1–7.4 verbatim.** The existing `ii-footer-*` classes in the mockup must be replaced.

### 21.1 Layout

Five-column grid (`2fr 1fr 1fr 1fr 1fr`). ≤ 1100px: 3 columns. ≤ 700px: 2 cols, brand spans full. ≤ 440px: 1 column.

### 21.2 Brand Column (`.ft-brand`)

- Logo: `Islamic` in `#5BC1C7`, `Info` in `#C5A059`
- Tagline: "A digital sanctuary for authentic Islamic knowledge — Qur'an, Hadith, Dua, and verified scholarship. Source-cited. Always free."
- Arabic verse: `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ — Hud · 11:88`

### 21.3 Column 1 — Page-Specific: Tools

Heading: `Tools`

| Link | href |
|---|---|
| Prayer Times | `tools.html#prayer-widget` |
| Qibla Compass | `tools.html#qibla-section` |
| Zakat Calculator | `tools.html#zakat-section` |
| Hijri Calendar | `tools.html#qibla-section` |
| Inheritance Calculator | `inheritance.html` |

### 21.4 Column 2 — Quick Access (identical every page)

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

⚠️ All 8 links required. `knowledge-hub.html` must never be omitted.

### 21.5 Column 3 — Our Ecosystem (§7.4 verbatim)

Heading: `Our Ecosystem`

| Display | URL |
|---|---|
| QuranlyAI ↗ | `https://quranlyai.com` |
| MosqueFinder ↗ | `https://mosquefinder.net` |
| TravellyAI ↗ | `https://travellyai.com` |
| LearnSpeakAI ↗ | `https://learnspeakai.com` |

⚠️ URLs are locked. Copy from §7.4. Common errors: `quranlya.com` (missing `i`) and missing `LearnSpeakAI`.

### 21.6 Column 4 — Company + Legal

- Company: About → `about.html` · Contact → `contact.html`
- Legal: Privacy Policy → `privacy.html` · Terms of Use → `terms.html`

### 21.7 Footer Bottom Bar

Left: `© 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources.`
Right (italic, muted): `All content source-verified · Privacy-first · Built with sincerity`

---

## 22. Design System Tokens & Rules

### Key Tokens

| Category | Token | Value |
|---|---|---|
| Primary teal | `--teal-700` | `#00696E` |
| Primary gold | `--gold-500` | `#C5A059` |
| Body text | `--ink-body` | `#243738` |
| Muted text | `--ink-muted` | `#6D797A` |
| Surface | `--surface` | `#F4F7F7` |
| Card surface | `--surface-card` | `#FAFBFB` |
| Display font | `--font-display` | Cormorant Garamond |
| Body font | `--font-body` | Inter |
| Arabic font | `--font-arabic` | Amiri |
| Easing | `--ease-reverent` | `cubic-bezier(.22,1,.36,1)` |
| Easing fast | `--ease-premium` | `cubic-bezier(0.25,0.46,0.45,0.94)` |

### Color Rules

- Never use raw hex inline in CSS (SVG gradient `defs` excepted)
- Dark mode is a **sibling** `[data-theme="dark"]` block — never merged with `:root`
- No new colors — use the nearest token

### Forbidden: No Shimmer

```css
/* ✗ NEVER USE — banned per CLAUDE.md §27.4 */
.card::after {
  animation: shimmer ...;
}
```

---

## 23. Interactions & Animations

All transitions use `var(--ease-reverent)` or `var(--ease-premium)`.

| Element | Transform | Duration | Glow |
|---|---|---|---|
| Tool cards | `translateY(-5px) scale(1.012)` | 0.38s | `0 16px 40px rgba(0,105,110,.13)` |
| Tool icon (inside card) | `scale(1.1) rotate(-5deg)` | 0.30s | `0 6px 20px rgba(0,105,110,.18)` |
| Buttons (primary) | `translateY(-3px) scale(1.03)` | 0.28s | `0 10px 32px rgba(0,105,110,.38)` |
| Buttons (ghost) | `translateY(-3px) scale(1.03)` | 0.28s | border-color shifts to teal-500 |
| Nav links | `scale(1.05)` | 0.25s | `0 0 0 1px rgba(0,105,110,.12)` |
| Filter chips / tabs | `scale(1.04)` | 0.22s | `0 4px 12px rgba(0,105,110,.25)` |
| Footer links | `translateX(4px)` | 0.18s | left border teal |
| Prayer rows | `translateY(-3px)` | 0.28s | border-color to `rgba(255,255,255,.15)` |
| Tasbeeh button | `scale(0.92)` on active | 0.12s snap | ring expands |
| Compass needle | `rotate(Xdeg)` | 0.9s ease-reverent | — |
| Calendar spin ring | `rotate(360deg)` | 22s linear infinite | — |

**3D Tilt on Tool Cards:**
- `mousemove` → compute cursor position relative to card center
- Apply `rotateX` (max ±5°) and `rotateY` (max ±7°) on top of hover lift
- Transition `0.08s` on move, `0.38s ease-reverent` on `mouseleave` reset

**Reveal on scroll:**
- `.reveal` class: `opacity: 0; transform: translateY(28px)` → `.in`: opacity 1, transform none
- `IntersectionObserver` at `threshold: 0.06`
- Stagger: `.reveal-d1` (0.1s), `.reveal-d2` (0.2s), `.reveal-d3` (0.3s), `.reveal-d4` (0.4s)

**Hero background animation:**
- `.hero-bg` — `bgD` keyframe: `opacity 0.8 → 1`, `scale 1 → 1.04`, 18s alternate infinite

---

## 24. Responsive Breakpoints

CLAUDE.md §23 global ladder:

| Breakpoint | Changes |
|---|---|
| ≤ 1100px | Nav-link 11.5px; footer 3-column |
| ≤ 900px | Nav-link 10.5px; brand 16px, brand-mark 28×28px |
| ≤ 820px | Zakat grid collapses to 1 column; two-col layouts stack |
| ≤ 760px | Nav hides; hamburger shown; non-essential header icons hide |
| ≤ 700px | Footer 2-column; stats strip 2×2; brand col spans both |
| ≤ 600px | Prayer widget prayer grid: 6-col → 3-col |
| ≤ 560px | Stats strip wraps to 2×2 grid |
| ≤ 460px | Age inputs: 2-col → 1-col |
| ≤ 440px | Footer 1-column |

---

## 25. Routing & Linking Rules

**No `href="#"` in production.** Every interactive element routes to a real destination or triggers a real JS action.

| Element | Route / Action |
|---|---|
| Hero "Prayer Times" button | `scrollIntoView({behavior:'smooth'})` → `#prayer-widget` |
| Hero "All Tools ↓" | Anchor scroll → `#tools-section` |
| Prayer widget "Change" | `getPrayerLocation()` → geolocation → refresh times |
| Prayer widget "📍 My Location" | `getPrayerLocation()` |
| Prayer widget "🔔 Adhan" | Open adhan settings dropdown |
| Prayer widget "⚙️ Method" | Open calculation method selector |
| Tool tab clicks | `filterTools(cat, btn)` → filter grid |
| Tool cards (live/new/beta) | Route to section anchor or dedicated page |
| Qibla "Detect My Location" | `getQibla()` → geolocation |
| Hijri `‹` / `›` nav | Decrement/increment displayed month |
| Zakat form inputs | `calcZakat()` — update result panel |
| Zakat "Calculate" button | `calcZakat()` |
| Tasbeeh counter button | `incrementTasbeeh()` |
| Tasbeeh "Reset" | `resetTasbeeh()` |
| Tasbeeh "Undo" | `undoTasbeeh()` |
| Tasbeeh "Vibrate" | `toggleVibrate()` |
| Dhikr chips | `setDhikr(btn, ar, en, goal)` |
| Fasting calendar cells | Toggle `.fasted`, call `updateFastStats()` |
| Fasting "Mark Today" | `toggleFastToday()` |
| Name search input (Enter) | `searchName()` |
| Name search button | `searchName()` |
| Name suggestion chips | `quickName('[key]')` |
| Age date inputs | `calcAge()` |
| Sadaqah "Log Sadaqah" | Shows confirmation, in production saves to ledger |
| AI Verifier card | Shows "Coming 2026" modal/tooltip |
| CTA "Track Your Ibadah" | `habits.html` |
| CTA "Dua Library" | `dua.html` |
| CTA "Verify a Hadith" | `verify.html` |
| Footer Quick Access | Correct page hrefs |
| Footer Ecosystem | External URLs, `target="_blank" rel="noopener"` |

---

## 26. User Flows

### Flow 1 — Check Prayer Times

1. User lands → hero shows prayer widget with today's times
2. Sees "Next: Asr · 5:28 PM" in the gold badge
3. Clicks "📍 My Location" → geolocation fires → times refresh for user's city
4. Clicks "🔔 Adhan" to configure audio alerts

### Flow 2 — Find Qibla Direction

1. User clicks "Qibla Compass" tool card → smooth-scrolls to `#qibla-section`
2. Sees compass with default Toronto Qibla (54°)
3. Clicks "Detect My Location" → `getQibla()` → compass needle rotates to their Qibla
4. Sees updated distance to Mecca and bearing label

### Flow 3 — Calculate Zakat

1. User clicks "Zakat Calculator" tool card → scrolls to `#zakat-section`
2. Enters cash savings, gold, investments, debts
3. Result panel updates live — shows `$0.00 → $X,XXX.XX`
4. Reads disclaimer, clicks to consult further

### Flow 4 — Use Tasbeeh Counter

1. User clicks "Tasbeeh Counter" card → scrolls to `#tasbeeh-section`
2. Selects "Alhamdulillah" chip → Arabic and goal update
3. Taps counter button repeatedly → count increments, vibration fires
4. Completes 33 → count resets to 0, rounds increment to 1

### Flow 5 — Track Fasting

1. User clicks "Fasting Tracker" card → scrolls to `#tasbeeh-section` right column
2. Sees calendar grid with previous fasted days marked
3. Clicks "Mark Today as Fasted" → today's cell fills teal, stats update
4. Stats show: 4 Fasted, 2 Remaining, streak count

### Flow 6 — Search an Islamic Name

1. User clicks "Islamic Name Finder" card → scrolls to `#name-section`
2. Types "Ibrahim" in the search input, clicks Search (or presses Enter)
3. Result panel animates in with Arabic script, meaning, Qur'anic tag
4. Or clicks the Arabic chip `إبراهيم` → same result, auto-fills input

### Flow 7 — Calculate Hijri Age

1. User clicks "Islamic Age Calculator" card → scrolls to `#age-section`
2. Enters date of birth and today's date
3. Result grid fills: Hijri Years, Hijri Months, Gregorian Years, Total Days
4. Hijri Birthday box shows approximate Hijri birth month and year

### Flow 8 — Browse All Tools by Category

1. User arrives on page, scrolls to Tools Grid
2. Clicks "Finance & Fiqh" tab → grid filters to Zakat, Inheritance, Sadaqah
3. Clicks "Prayer & Worship" tab → grid shows Prayer Times, Qibla, Hijri, Tasbeeh
4. Resets to "All Tools" to see everything

### Flow 9 — Log Sadaqah

1. User scrolls to Sadaqah Tracker mini-card
2. Ring shows 38% of monthly goal
3. Clicks "Log Sadaqah" → button confirms "✓ Logged! JazakAllahu Khayran"
4. In production: prompts for amount and cause, saves to annual ledger

---

## 27. Acceptance Criteria Checklist

### Global Structure
- [ ] `<html lang="en" data-theme="light">` present
- [ ] All 3 fonts (Cormorant Garamond, Inter, Amiri) preconnected and imported in order
- [ ] All 50+ CSS tokens in `:root` exactly as CLAUDE.md §1
- [ ] Dark mode `[data-theme="dark"]` sibling block — unmerged
- [ ] Body: Islamic geometric `background-image` at opacity 0.04
- [ ] `.ambient` radial glow div present
- [ ] `.shell` wrapper present

### Header
- [ ] All **10** nav items in exact order
- [ ] `Tools` has `class="nav-link active"` with underline indicator
- [ ] `knowledge-hub.html` at position 5 — never omitted
- [ ] `islamic-studies.html` used — never `learn.html`
- [ ] 4 header tools: search, EN, theme, admin
- [ ] Hamburger visible only ≤ 760px
- [ ] Theme toggle: `id="themeBtn"`, persists to `islamicinfo-theme` localStorage
- [ ] Search popup: opens, focuses input, closes on Escape / outside click

### Mobile Menu
- [ ] All **10** nav links with correct hrefs
- [ ] `Tools` marked active
- [ ] `knowledge-hub.html` present
- [ ] `islamic-studies.html` — never `learn.html`
- [ ] Open/close via `openMM()` / `closeMM()`; Escape closes
- [ ] Fade + slide-in animation

### Hero
- [ ] Bismillah is first child of `.hero-inner`
- [ ] Light: teal gradient clip-text; Dark: gold gradient + drop-shadow
- [ ] H1 uses `var(--font-display)` with `<span class="grad-it">`
- [ ] Arabic verse present below H1
- [ ] 3 floating `.geo` SVGs with `geoRot` animation
- [ ] "Prayer Times" → smooth-scrolls to `#prayer-widget`
- [ ] "All Tools ↓" → smooth-scrolls to `#tools-section`

### Stats Strip
- [ ] 4 stats: 12+ · 5 · 195+ · 100%
- [ ] Embedded in hero below CTAs
- [ ] `.reveal` entry animation

### Prayer Widget
- [ ] Located in hero; `id="prayer-widget"` anchor target
- [ ] Dark gradient card with gold/teal glow overlays
- [ ] Today's date populates `#pwDate` on load
- [ ] 6 prayer slots: Fajr, Sunrise, Dhuhr, Asr (`.next` + gold), Maghrib, Isha
- [ ] Next prayer badge visible
- [ ] `.past` slots at 44% opacity
- [ ] `.next` slot has `breathGold` animation
- [ ] "Change" and "📍 My Location" both call `getPrayerLocation()`
- [ ] "🔔 Adhan" and "⚙️ Method" buttons open settings (not decorative)
- [ ] Sun data strip (sunrise, sunset, daylight) present

### All Tools Grid
- [ ] Section `id="tools-section"`
- [ ] 5 filter tabs present; "All Tools" active by default
- [ ] `filterTools()` shows/hides cards correctly for each category
- [ ] All **12** tool cards present in correct order
- [ ] Each live/new/beta card is `<a>` with correct href
- [ ] Coming Soon card is `<div>`, `cursor: default`, no hover lift
- [ ] Status badges correct (Live, New, Beta, Coming Soon)
- [ ] Tool icon animates on card hover
- [ ] 3D tilt on mousemove; resets on mouseleave
- [ ] No shimmer sweep on any card

### Qibla Compass
- [ ] Section `id="qibla-section"`
- [ ] Compass ring spins continuously (`spin` animation)
- [ ] Needle element `id="compassNeedle"` present
- [ ] `getQibla()` computes bearing from Haversine, updates needle + `#qDeg`, `#qDist`, `#qBearing`
- [ ] N/S/E/W cardinal labels visible
- [ ] "Detect My Location" button calls `getQibla()`

### Hijri Calendar
- [ ] Month name (English + Arabic) in header
- [ ] `‹` and `›` nav buttons change the displayed month
- [ ] Today's cell has `.today` class (teal bg)
- [ ] Event days have `.event` class + dot indicator
- [ ] Events list shows 3 upcoming events with colored dots + relative dates
- [ ] Event cells clickable → show event details

### Zakat Calculator
- [ ] Section `id="zakat-section"`
- [ ] 5 currency inputs present with correct ids
- [ ] `calcZakat()` fires on input and on button click
- [ ] Result updates `#zkResult`, `#zkTotal`, `#zkPayable`, `#zkResultLabel`
- [ ] Nisab threshold displayed (`$6,180`)
- [ ] Disclaimer note present
- [ ] Below-nisab message shown correctly

### Tasbeeh Counter
- [ ] Section `id="tasbeeh-section"`, background `var(--surface-card)`
- [ ] 4 dhikr chips; default "SubhanAllah" active (`.on`)
- [ ] `setDhikr()` updates Arabic, English, goal, resets count
- [ ] Counter button 152px circle, teal gradient
- [ ] `incrementTasbeeh()`: count++, rounds on goal-hit, vibrate if enabled
- [ ] `resetTasbeeh()`: count=0, rounds=0
- [ ] `undoTasbeeh()`: count--, total-- (if > 0)
- [ ] `toggleVibrate()`: updates button label
- [ ] Session stats panel shows Rounds, Today, This Week

### Fasting Tracker
- [ ] 30-day grid built by `buildFastGrid()`
- [ ] Day cells toggle `.fasted` on click → `updateFastStats()` fires
- [ ] Today's cell has `.today-fd` class
- [ ] Stats: Fasted, Remaining, Streak counts update
- [ ] Suhoor and Iftar times displayed
- [ ] "Mark Today as Fasted" button: toggles state, changes label

### Islamic Name Finder
- [ ] Section `id="name-section"`
- [ ] Search input `id="nameSearch"` with placeholder
- [ ] Search fires on button click and on Enter key
- [ ] Result panel hidden by default, slides in on result
- [ ] Shows Arabic, title, meaning, gender/origin/Quranic tags
- [ ] 8 suggestion chips — clicking auto-fills and shows result

### Islamic Age Calculator
- [ ] Age section `id="age-section"` within `#name-section`
- [ ] DOB and today date inputs
- [ ] Today auto-set on load
- [ ] `calcAge()` computes Hijri years, Hijri months, Gregorian years, total days
- [ ] Hijri Birthday box shows approximate birth month and year

### Sadaqah Tracker
- [ ] Ring progress SVG shows correct `stroke-dashoffset`
- [ ] Stats show: This Month, Monthly Goal, This Year
- [ ] "Log Sadaqah" button shows confirmation for 2s, then reverts

### Inheritance Calculator
- [ ] Tool card routes to `inheritance.html` (dedicated page)
- [ ] Card is `<a>` element, not broken

### Mosque Finder
- [ ] Tool card routes to `https://mosquefinder.net`
- [ ] `target="_blank" rel="noopener"` present
- [ ] Link text: "Open MosqueFinder ↗"

### AI Claim Verifier
- [ ] Card is `<div>` — not `<a>`
- [ ] `cursor: default; opacity: 0.75`
- [ ] Status badge shows "Coming Soon"
- [ ] Click shows info modal or tooltip
- [ ] No hover lift, no route

### CTA Section
- [ ] Last section before footer
- [ ] 3 action buttons: habits.html, dua.html, verify.html
- [ ] Correct eyebrow, title, sub-text
- [ ] `.reveal` on all child elements

### Footer
- [ ] Uses **`ft-`** CSS class system (NOT `ii-footer-*`)
- [ ] Col 1 "Tools" heading with 5 tool-specific links
- [ ] Col 2: Quick Access — all 8 including Knowledge Hub
- [ ] Col 3: Ecosystem — `quranlyai.com`, `mosquefinder.net`, `travellyai.com`, `learnspeakai.com`
- [ ] `quranlyai.com` — not `quranlya.com`
- [ ] `learnspeakai.com` — not missing
- [ ] Col 4: Company + Legal
- [ ] Bottom bar: exact copyright string
- [ ] Footer links hover: `translateX(4px)` + left border teal

### Animations & Accessibility
- [ ] `.reveal` + stagger delays on all section content
- [ ] IntersectionObserver at `threshold: 0.06`
- [ ] All hovers use `var(--ease-reverent)` or `var(--ease-premium)`
- [ ] No shimmer sweep on any card
- [ ] Theme persists across pages and reloads
- [ ] Compass and calendar are keyboard-accessible in production
- [ ] All form inputs have labels (visible or `aria-label`)
- [ ] Tested in both light and dark mode
- [ ] All responsive breakpoints verified

---

*End of Tools Page Functional Document v1.0*
*IslamicInfo.org · CLAUDE.md v3.0 · Blueprint: `tools_enhanced.html`*
