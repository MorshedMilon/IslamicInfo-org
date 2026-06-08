# Habit Tracker Page — Functional Document
**IslamicInfo.org · `habits.html` · Islamic Habit Tracker & Streak Board**
*Version 1.0 — Production Ready*
*Derived from: `habits__1_.html` mockup + CLAUDE.md v3.0*
*Date: 2026-05-17*

---

## Table of Contents

1. [Page Purpose & Role](#1-page-purpose--role)
2. [Page Architecture — Section Map](#2-page-architecture--section-map)
3. [Global Navigation (Header)](#3-global-navigation-header)
4. [Mobile Menu](#4-mobile-menu)
5. [Hero Section](#5-hero-section)
6. [Tracker Preview App](#6-tracker-preview-app)
   - 6.1 [Stats Strip](#61-stats-strip)
   - 6.2 [Date Row & Streak Badge](#62-date-row--streak-badge)
   - 6.3 [Tab Bar](#63-tab-bar)
   - 6.4 [Week Strip](#64-week-strip)
   - 6.5 [Tab: Prayers](#65-tab-prayers)
   - 6.6 [Tab: Qur'an](#66-tab-quran)
   - 6.7 [Tab: Adhkar (Dua Checklist)](#67-tab-adhkar-dua-checklist)
   - 6.8 [Tab: Fasting](#68-tab-fasting)
   - 6.9 [Tab: Sunnah Routines](#69-tab-sunnah-routines)
7. [Pain Points Section](#7-pain-points-section)
8. [Free Features Section](#8-free-features-section)
9. [Premium & Futuristic Section](#9-premium--futuristic-section)
10. [CTA Section](#10-cta-section)
11. [Global Footer](#11-global-footer)
12. [State Management & Persistence](#12-state-management--persistence)
13. [Design System Tokens & Rules](#13-design-system-tokens--rules)
14. [Interactions & Animations](#14-interactions--animations)
15. [Responsive Breakpoints](#15-responsive-breakpoints)
16. [Routing & Linking Rules](#16-routing--linking-rules)
17. [User Flows](#17-user-flows)
18. [Acceptance Criteria Checklist](#18-acceptance-criteria-checklist)

---

## 1. Page Purpose & Role

The **Habit Tracker** page (`habits.html`) is IslamicInfo's daily worship tracking tool. It sits at **position 8** in the global navigation — between Tools and Verify.

Its purpose is to:
- Let users track all 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) with a single tap per prayer
- Track Qur'an reading pages daily with a goal-based slider
- Provide a morning/evening Adhkar checklist with Arabic text
- Log voluntary fasting days (Shawwāl, Mondays/Thursdays, etc.)
- Track Sunnah prayer and routine habits (Duha, Witr, Qiyam, Tahajjud)
- Display a **Sunnah Score** (0–100%) combining all tracked categories
- Show a **Day Streak** counter — consecutive days with all 5 prayers logged
- Present a 28-day **heatmap** of prayer completion history
- Showcase premium and futuristic features to drive upgrade interest

**Core editorial rule:** No religious verdicts or fatwas issued. All feature descriptions cite authentic hadith for the Sunnah actions referenced. The page is entirely usable without an account — all core tracking is free and saved in `localStorage`.

All visual implementation must follow **CLAUDE.md v3.0** exactly.

---

## 2. Page Architecture — Section Map

Top-to-bottom order is fixed.

```
┌──────────────────────────────────────────────────┐
│  GLOBAL HEADER  (sticky, §3)                     │
├──────────────────────────────────────────────────┤
│  MOBILE MENU  (overlay, §4)                      │
├──────────────────────────────────────────────────┤
│  HERO  (§5)                                      │
│  — Bismillah                                     │
│  — Eyebrow badge                                 │
│  — H1 title                                      │
│  — Arabic hadith quote                           │
│  — Sub-text                                      │
│  — CTA row (2 buttons)                           │
│  ┌───────────────────────────────────────────┐   │
│  │  TRACKER PREVIEW APP  (§6)                │   │
│  │  — Stats strip (4 metrics)                │   │
│  │  — Date row + streak badge                │   │
│  │  — 5-tab bar                              │   │
│  │  — Week strip (7 day-pills)               │   │
│  │  — [Tab contents: Prayers / Qur'an /      │   │
│  │     Adhkar / Fasting / Sunnah]            │   │
│  └───────────────────────────────────────────┘   │
├──────────────────────────────────────────────────┤
│  PAIN POINTS SECTION  (§7)                       │
│  — 8-card grid                                   │
├──────────────────────────────────────────────────┤
│  FREE FEATURES SECTION  (§8)                     │
│  — 6-card grid                                   │
├──────────────────────────────────────────────────┤
│  PREMIUM & FUTURISTIC SECTION  (§9)              │
│  — 9-card grid (3 premium + 6 futuristic)        │
├──────────────────────────────────────────────────┤
│  CTA SECTION  (§10)                              │
├──────────────────────────────────────────────────┤
│  GLOBAL FOOTER  (§11)                            │
└──────────────────────────────────────────────────┘
```

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
| 7 | Tools | `tools.html` | |
| 8 | Habit Tracker | `habits.html` | **`.active`** on this page |
| 9 | Verify | `verify.html` | |
| 10 | About | `about.html` | |

Active page: `class="nav-link active"` — teal text, weight 500, 2px teal→gold gradient underline via `::after`.

### 3.3 Header Tools (Right Side) — Exact Order

1. **Search icon** (`id="searchTrigger"`) → opens search popup
2. **Language (EN)** → placeholder
3. **Theme toggle** (`id="themeBtn"`) → persists to `localStorage` key `islamicinfo-theme`
4. **Admin (user icon)** → placeholder
5. **Hamburger** → visible only at ≤ 760px, `onclick="openMM()"`

### 3.4 Search Popup

- Placeholder: `"Search verses, hadiths, topics…"`
- Position: `top: 44px; right: 0; width: 340px`
- Opens on search icon click, auto-focuses input after 50ms
- Closes on: click outside · `Escape` key · Search button click
- Dark mode: `rgba(15,27,29,.97)` background

### 3.5 Header CSS (CLAUDE.md §4.4)

- Light: `rgba(250,251,251,.92)`, `backdrop-filter: blur(24px) saturate(1.6)`
- Dark: `rgba(10,19,20,.92)`, border-bottom `rgba(0,105,110,.2)`
- Scrolled: `box-shadow: 0 1px 0 rgba(0,105,110,.10), var(--elev-1)`
- Height: `60px`

---

## 4. Mobile Menu

Placed immediately after `</header>`. Full-screen overlay. `id="mobileMenu"`.

### 4.1 All 10 Nav Links

```
Home                → index.html
Quran Explorer      → quran.html
Hadith Library      → hadith.html
Islamic Studies     → islamic-studies.html   ← never learn.html
Knowledge Hub       → knowledge-hub.html     ← never omit
Daily Duas          → dua.html
Tools               → tools.html
Habit Tracker       → habits.html            ← .mm-link active
Verify              → verify.html
About               → about.html
```

### 4.2 Open / Close

- Hamburger `onclick="openMM()"` adds `.open` class
- Close button `onclick="closeMM()"` removes `.open`
- `Escape` key closes
- Fade + slide-in from right (`mmFade` keyframe, 0.3s)

### 4.3 Visual

- Background: `rgba(6,38,40,.97)` + `backdrop-filter: blur(20px)`
- Links: `var(--font-display)`, `30px`, `rgba(255,255,255,.75)`
- Active / hover: `color: #88E0E5`, `padding-left: 10px`
- Close button: `36px` circle, `rgba(255,255,255,.2)` border

---

## 5. Hero Section

CLAUDE.md §6 structure. Full hero with embedded tracker app.

### 5.1 Element Order (inside `.hero-inner`)

1. Bismillah — `bismillah-hero-top`
2. Eyebrow badge — `.eyebrow` + `.eyebrow-dot` pulse
3. H1 title — with gradient italic span
4. Arabic hadith quote — `.hero-arabic`
5. Sub-text — `.hero-sub`
6. CTA row — `.cta-row`
7. **Tracker Preview App** — `.tracker-preview` (§6)

### 5.2 Content Values

| Element | Content |
|---|---|
| Bismillah | `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ` |
| Eyebrow | `Build Lasting Worship Habits` |
| H1 — plain | `Islamic Habit` |
| H1 — italic gradient | `Tracker & Streak Board` (inside `<span class="grad">`) |
| Arabic quote | `أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ` |
| Arabic source | `"The most beloved deeds to Allah are the most consistent, even if small." — Bukhari · Sahih` |
| Sub-text | "Track your 5 daily prayers, Qur'an reading, fasting, and sunnah routines. Build streaks, earn your Sunnah Score, and never lose momentum." |

### 5.3 Bismillah Color Rules

- **Light:** `linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%)` — teal clip-text, opacity 0.92
- **Dark:** `linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%)` — gold clip-text + `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))`

### 5.4 CTA Buttons

| Button | Class | onclick / href |
|---|---|---|
| Start Tracking Today | `.btn-primary` | `document.getElementById('tracker-app').scrollIntoView({behavior:'smooth'})` |
| Family Challenge | `.btn-ghost` | Placeholder — links to family challenge feature (Premium) |

### 5.5 Floating Geometry Decorators

Three `.geo` SVGs with `geoRot` animation:

| Position | Shape | Color | Size | Opacity | Animation |
|---|---|---|---|---|---|
| `top:7%; left:4%` | Star polygon + circle | `#00696E` | 180×180px | 0.07 | `geoRot` 28s linear |
| `top:10%; right:5%` | Star polygon | `#C5A059` | 120×120px | 0.055 | `geoRot` 32s, delay -14s |
| `bottom:12%; right:8%` | Circle | `#00696E` | 90×90px | 0.045 | `geoRot` 20s, delay -7s |

---

## 6. Tracker Preview App

`.tracker-preview` — `id="tracker-app"`. Embedded inside `.hero-inner`. This is the primary interactive element.

### Visual Style

- Background: `rgba(255,255,255,.88)` with `backdrop-filter: blur(20px)`
- Border: `1px solid rgba(0,105,110,.15)`
- Border-radius: `24px`
- Shadow: `0 20px 60px rgba(0,105,110,.12), 0 4px 20px rgba(0,105,110,.07), inset 0 1px 0 rgba(255,255,255,.7)`
- Dark mode: `rgba(21,37,39,.92)`, border `rgba(0,105,110,.28)`
- Max-width: `700px`, centered
- Entry animation: `.reveal` class

---

### 6.1 Stats Strip

Horizontal row of 4 metrics. Background: `rgba(0,105,110,.04)`, border: `0.5px solid rgba(0,105,110,.10)`, `border-radius: 16px`, `overflow: hidden`. Displayed above the date row.

| Metric | ID | Default value | Label | Color |
|---|---|---|---|---|
| Day Streak | (no id — static) | `14` | `Day Streak 🔥` | `var(--teal-700)` |
| Today % | `id="todayPct"` | `40%` | `Today` | `var(--teal-700)` |
| Weekly Score | `id="weeklyPct"` | `72%` | `Weekly Score` | `var(--gold-700)` |
| Best Streak | (no id — static) | `21` | `Best Streak` | `var(--teal-700)` |

**Row anatomy:**
- Each stat: `flex: 1`, `padding: 12px 10px`, `text-align: center`
- Number: `var(--font-display)`, `22px`, weight 600, color per table above
- Label: `9.5px`, weight 600, `letter-spacing: .08em`, uppercase, `var(--ink-muted)`
- Dividers between stats: `0.5px`, `rgba(0,105,110,.12)`, full height

**Live update rules:**
- `todayPct` updates whenever a prayer is toggled or any habit is checked — reflects current Sunnah Score for today
- `weeklyPct` updates at the same time (same score in current implementation)

---

### 6.2 Date Row & Streak Badge

`.tracker-date` — flex row, space-between, wraps at small sizes.

**Left:** `"📅 Today — [dynamically generated date]"` — weight 600, `var(--ink-primary)`. Date is populated by JS on load: `new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'})`. Element: `id="today-date"`.

**Right:** `.streak-badge` — inline-flex, gold gradient background, gold border.
- Text: `"🔥 [N] day streak"` where `N` = `id="streak-count"`
- Background: `linear-gradient(135deg, rgba(197,160,89,.15), rgba(197,160,89,.08))`
- Border: `0.5px solid rgba(197,160,89,.3)`, `border-radius: 20px`
- Color: `var(--gold-700)`

---

### 6.3 Tab Bar

`.tabs` — flex row, `gap: 4px`, teal-tinted background, `border-radius: 12px`, `padding: 4px`.

**Five tabs — exact order:**

| Tab | onclick | emoji |
|---|---|---|
| Prayers | `switchTab(this,'prayers')` | 🕌 |
| Qur'an | `switchTab(this,'quran')` | 📖 |
| Adhkar | `switchTab(this,'dua')` | 🙏 |
| Fasting | `switchTab(this,'fasting')` | 🌙 |
| Sunnah | `switchTab(this,'sunnah')` | ⭐ |

**Default active tab:** Prayers (`class="tab active"`).

**`switchTab(btn, tab)` behavior:**
1. Remove `.active` from all `.tab` buttons
2. Add `.active` to clicked `btn`
3. Hide all `#tab-prayers`, `#tab-quran`, `#tab-dua`, `#tab-fasting`, `#tab-sunnah` (set `display: none`)
4. Show the matching tab (`display: block`)

**Active tab style:** `background: var(--surface-card)`, `color: var(--teal-700)`, `box-shadow: 0 2px 8px rgba(0,105,110,.1)`, weight 600.

---

### 6.4 Week Strip

`.week-strip` — `id="weekStrip"`. Flex row, wraps. Built entirely by JavaScript on page load.

**JS behavior:**
1. Compute `todayIdx = new Date().getDay()` (0=Sun … 6=Sat)
2. Set `baseDate` = this week's Sunday (`today - todayIdx` days)
3. Loop `i = 0..6`, create one `.day-pill` per day

**Day pill anatomy:**
- `.day-name` — 3-letter day abbreviation (e.g. "Mon"), 10px uppercase
- `.day-num` — date number, `var(--font-display)`, 18px
- `.day-dots` — 5 dots (one per prayer), 5px circles

**Day pill states:**

| State | Class | Visual |
|---|---|---|
| Today | `.day-pill.today` | Teal gradient fill, white text |
| Past (5/5 prayers) | `.day-pill.done-full` | Teal border, subtle teal bg |
| Past (partial) | `.day-pill` (default) | Default — unfilled |
| Future | `.day-pill` (default) | Default — unfilled |

**Dot fill rules:**
- Today: filled dots = `STATE.prayers.filter(Boolean).length` (live from state)
- Past days: filled dots = `STATE.history[dateKey].prayers` (from archived history)
- Future: no dots filled

**Click behavior:** `showToast()` displays that day's prayer count and score.

---

### 6.5 Tab: Prayers

`id="tab-prayers"`. Displayed by default.

#### 6.5.1 Live Prayer Countdown

A dynamically injected `id="prayer-countdown"` `<div>` appears as the first child of `#tab-prayers`. Built by JS `initCountdown()`.

**Estimated prayer windows (minutes from midnight — generic):**

| Prayer | Window start | Window end |
|---|---|---|
| Fajr | 270 min (4:30 AM) | 360 min (6:00 AM) |
| Dhuhr | 750 min (12:30 PM) | 870 min (2:30 PM) |
| Asr | 930 min (3:30 PM) | 1020 min (5:00 PM) |
| Maghrib | 1110 min (6:30 PM) | 1140 min (7:00 PM) |
| Isha | 1200 min (8:00 PM) | 1380 min (11:00 PM) |

**Display logic (updates every 60 seconds):**
- Inside a prayer window → `"🕌 [Prayer] — [N] min window remaining"` in `var(--teal-700)`; turns orange (`var(--grade-daif)`) if < 15 min
- Between windows → `"⏱ Next: [Prayer] in [Xh Ym]"` in `var(--ink-muted)`
- After Isha → `"🌙 Isha time — don't forget Witr"` in `var(--teal-700)`

**Visual:** `font-size: 12px`, weight 600, `padding: 8px 12px`, `background: rgba(0,105,110,.06)`, `border-radius: 10px`, `margin-bottom: 18px`.

In production: replace estimated windows with real prayer times from the Prayer Times API (lat/lng + calculation method from user's location or settings).

#### 6.5.2 Section Label

`"5 Daily Prayers"` — `11px`, weight 600, `letter-spacing: .12em`, uppercase, `var(--ink-muted)`, `margin-bottom: 12px`.

#### 6.5.3 Prayers Row

`.prayers-row` — 5-column CSS grid. Collapses to 3 columns at ≤ 480px.

**Five prayer circles — exact order:**

| Index | Prayer | ID | Default state |
|---|---|---|---|
| 0 | Fajr | `id="p0"` | `.done` (checked) |
| 1 | Dhuhr | `id="p1"` | `.done` (checked) |
| 2 | Asr | `id="p2"` | Unchecked |
| 3 | Maghrib | `id="p3"` | Unchecked |
| 4 | Isha | `id="p4"` | Unchecked |

**`togglePrayer(i)` behavior:**
1. `STATE.prayers[i] = !STATE.prayers[i]`
2. `saveState()` — persists to `localStorage`
3. `renderPrayers()` — syncs `.done` class on all circles
4. `updateScore()` — recalculates Sunnah Score, updates all bars
5. Adds `.ripple` class (removes after 500ms) — triggers `prayerRipple` keyframe
6. `showToast("[Prayer] ✓ — Alhamdulillah!")` or `"[Prayer] unmarked"`

**Circle anatomy (`.prayer-check`):**
- `.p-name` — prayer name, 11px, weight 500, `var(--ink-muted)`
- `.p-circle` — 52×52px circle, `border: 2px solid rgba(0,105,110,.2)`, cursor pointer
  - Unchecked hover: `border-color: var(--teal-500)`, `scale(1.1)`, glow shadow
  - Checked (`.done`): `background: linear-gradient(135deg, var(--teal-700), var(--teal-500))`, `box-shadow: 0 4px 16px rgba(0,105,110,.35)`
  - `.p-check-icon` — white checkmark SVG, hidden when unchecked, shown when `.done`
  - `.p-empty-icon` — `"○"` text, shown when unchecked, hidden when `.done`

**Keyboard shortcut:** Pressing `1`–`5` toggles Fajr–Isha respectively (ignores when focus is in an input).

#### 6.5.4 Fajr Streak Badge

`id="fajrBadge"` — shown only below the Fajr prayer circle. `.fajr-streak` class.
- Text: `"⭐ [N]d Fajr"` where N = consecutive days Fajr was logged
- Computed by JS: counts back through `STATE.history` until a day with `prayers >= 1` is missing
- If `STATE.prayers[0]` is true today, adds 1 to streak
- Default display: `"⭐ 7d Fajr"`

#### 6.5.5 Sunnah Prayers Row

Section label: `"Sunnah Prayers"` — same label style as §6.5.2.

**Four sunnah pills — `.sunnah-pill`:**

| Label | Name value | Default state |
|---|---|---|
| 🌙 Qiyam | `'Qiyam'` | Off |
| ☀️ Duha | `'Duha'` | On (`.on`) |
| 🌟 Witr | `'Witr'` | On (`.on`) |
| 🌃 Tahajjud | `'Tahajjud'` | Off |

**`toggleSunnah(el, name)` behavior:**
1. Read current state: `el.getAttribute('data-done') === 'true'`
2. Toggle: `STATE.sunnahPrayers[name] = !current`
3. Update `data-done` attribute and `.on` class
4. `saveState()`
5. `showToast("✓ [Name] — BaarakAllahu feek!" or "[Name] unmarked")`

**Pill style:** `12px`, weight 500, border, rounded 18px. `.on` / hover state: teal fill, white text, teal shadow.

#### 6.5.6 Progress Bars (shown in Prayers tab)

Three summary progress bars at the bottom of the Prayers tab give a cross-category overview:

| Label | Bar ID | Label ID | Fill class | Default |
|---|---|---|---|---|
| 📖 Qur'an Pages Today | `id="quran-bar"` | `id="quran-lbl"` | `.prog-fill` (teal) | `"3 / 5 pages"`, 60% |
| 🙏 Dua Checklist | `id="dua-bar"` | `id="dua-lbl"` | `.prog-fill.gold` | `"4 / 6 duas"`, 67% |
| ⭐ Weekly Sunnah Score | `id="score-bar"` | `id="score-pct"` | `.prog-fill.rainbow` | `"72%"`, 72% |

**Bar anatomy:**
- `.prog-label` — flex row, space-between, `12px`, `var(--ink-muted)`. Right value: weight 600, `var(--teal-700)` (dark: `var(--teal-300)`)
- `.prog-bar` — `height: 7px`, `border-radius: 20px`, `background: rgba(0,105,110,.1)`
- `.prog-fill` — fills bar, `transition: width 1s var(--ease-reverent)`
  - Default: `linear-gradient(90deg, var(--teal-700), var(--teal-500))`
  - `.gold`: `linear-gradient(90deg, var(--gold-700), var(--gold-500))`
  - `.rainbow`: `linear-gradient(90deg, var(--teal-700), var(--teal-500), var(--gold-500))`

#### 6.5.7 Sunnah Score Ring

`.score-ring-wrap` — flex row, `gap: 16px`, shown below progress bars. Separated by a `0.5px solid rgba(0,105,110,.1)` top border.

**SVG ring:** 56×56px, viewBox `0 0 56 56`.
- Background circle: `r=23`, `stroke: rgba(0,105,110,.1)`, `stroke-width: 6`
- Progress arc: `id="scoreRing"`, same radius, `stroke: url(#ringGrad)`, `stroke-dasharray: 144.5`
- Gradient: `#ringGrad` — `#00696E` → `#C5A059` (left to right)
- `stroke-dashoffset`: `144.5 - (144.5 × score/100)` — e.g. 72% → offset `40.46`
- Rotated: `transform="rotate(-90 28 28)"` so arc starts from top

**Score number:** `id="scoreRingNum"` — `var(--font-display)`, `22px`, weight 600, gradient text (`teal-700` → `gold-500` via `-webkit-background-clip: text`).

**Score text:** `id="scoreRingText"` — `11px`, `var(--ink-muted)` — `"Weekly Sunnah Score\nKeep your streak going!"`

**`updateScore()` function updates:**
- `score-pct` textContent
- `score-bar` width
- `scoreRingNum` textContent
- `todayPct` textContent
- `scoreRing` stroke-dashoffset
- Quran bar + label
- Dua bar + label

#### 6.5.8 Heatmap (Prayers tab)

`.heatmap` — `id="heatmap"`. 28-day grid (4 rows × 7 cols).

**`buildHeatmap(containerId, days)` behavior:**
1. Clear `innerHTML`
2. Loop from `days-1` down to `0` (chronological left→right)
3. For each cell: look up `STATE.history[dateKey].prayers` for past days; use live `STATE.prayers` for today
4. Map prayer count to heat level: 0 prayers = no class, 1=h1, 2=h2, 3=h3, 4=h4, 5=h5

**Heat level styles:**

| Class | Background |
|---|---|
| (none) | `rgba(0,105,110,.07)` |
| `.h1` | `rgba(0,105,110,.15)` |
| `.h2` | `rgba(0,105,110,.32)` |
| `.h3` | `rgba(0,105,110,.52)` |
| `.h4` | `var(--teal-700)` |
| `.h5` | `var(--teal-500)` + glow shadow |

**Cell hover:** `scale(1.25)`, `z-index: 1` — shows tooltip via `title` attribute (`"YYYY-MM-DD · N/5 prayers"`).

#### 6.5.9 Tracker Footer (Settings)

`.tracker-footer` — flex row, space-between, `margin-top: 20px`, `padding-top: 16px`, top border.

**Left:** `.goal-input` — `"Daily Qur'an goal:"` + `<input type="number" id="quranGoal">` + `"pages"`.
- Input: `width: 46px`, centered, teal border on focus
- Default: `value="5"`, `min="1"`, `max="50"`, `onchange="updateQuranGoal()"`

**Right:** Reset link — `"Reset day"` — small text, underline, `onclick="resetDay()"`.

**`resetDay()` behavior:**
1. `STATE.prayers = [false×5]`
2. `STATE.sunnahPrayers = all false`
3. `STATE.duaChecked = [false×6]`
4. `STATE.sunnahItems = [false×6]`
5. `STATE.quranPages = 0`
6. `saveState()`
7. Re-render all UI elements
8. `showToast("Day reset — Bismillah, start fresh! 🌅")`

---

### 6.6 Tab: Qur'an

`id="tab-quran"`. Hidden by default.

#### 6.6.1 Pages Read Today

Header: `"Today's Qur'an Reading"` — `13px`, weight 500.

Display row: `"Pages read today"` label + `id="quranPagesDisplay"` value (`"3 / 5"` default).

**Range slider:** `id="quranSlider"`, `type="range"`, `min="0"`, `oninput="updateQuranSlider(this.value)"`.
- Style: custom teal thumb, `height: 6px`, `border-radius: 3px`
- Background gradient tracks progress: `linear-gradient(90deg, var(--teal-500) [pct]%, rgba(0,105,110,.15) [pct]%)`
- `max` = `STATE.quranGoal`; `value` = `STATE.quranPages`

**Below slider:** `"0"` on left · `id="quranMax"` on right (`"5 pages"` default).

**`updateQuranSlider(v)` behavior:**
1. `STATE.quranPages = parseInt(v)`
2. `saveState()`
3. Compute `pct = Math.min(Math.round(v/goal*100), 100)`
4. Update `quranPagesDisplay`, `quranMax`, slider gradient, `quran-bar`, `quran-lbl`
5. Update Juz progress bar
6. `updateScore()`

**`updateQuranGoal()` behavior:**
1. Read new goal from `#quranGoal` input
2. `STATE.quranGoal = newGoal`; `saveState()`
3. Update `#quranSlider` max, re-run `refreshSliderUI()`
4. `showToast("Daily goal: [N] pages")`

#### 6.6.2 Juz Progress

`"Juz Progress (Current Khatm)"` — progress bar section.
- `id="juzPct"` — percentage label on right
- `id="juzBar"` — teal fill bar
- Formula: `juzPct = Math.min(Math.round(pages/goal * 22 + 2), 100)`

#### 6.6.3 Qur'an Heatmap

`id="quranHeatmap"` — 30-day reading heatmap. Built by `buildHeatmap('quranHeatmap', 30)` when the Qur'an tab is opened.

---

### 6.7 Tab: Adhkar (Dua Checklist)

`id="tab-dua"`. Hidden by default.

#### 6.7.1 Header

`"Morning & Evening Adhkar"` — `13px`, weight 500, `margin-bottom: 16px`.

#### 6.7.2 Dua List

`.dua-list` — `id="duaList"`. Six `.dua-item` elements (default: items 1–4 checked, 5–6 unchecked).

**Six dua items — exact content:**

| Index | Arabic / Label | Default |
|---|---|---|
| 0 | `أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ — Morning remembrance` | Checked |
| 1 | `Ayat al-Kursi (morning)` | Checked |
| 2 | `سُبْحَانَ اللَّهِ × 33 (SubhanAllah)` | Checked |
| 3 | `الْحَمْدُ لِلَّهِ × 33 (Alhamdulillah)` | Checked |
| 4 | `اللَّهُ أَكْبَرُ × 34 (Allahu Akbar)` | Unchecked |
| 5 | `Dua before sleep (Ayat al-Kursi + last 2 verses Al-Baqarah)` | Unchecked |

**`toggleDua(item)` behavior:**
1. Find item index in `Array.from(document.querySelectorAll('.dua-item'))`
2. `STATE.duaChecked[idx] = !STATE.duaChecked[idx]`
3. Toggle `.checked` class on item
4. `saveState()`
5. `syncDuaProgress()` — updates all dua progress bars and labels
6. `updateScore()`
7. `showToast("✓ Adhkar completed — Jazak Allahu khayran!" or "Adhkar unchecked")`

**Dua item anatomy:**
- `.dua-cb` — 18×18px checkbox: empty border when unchecked, teal fill + checkmark SVG when `.checked`
- `.dua-label` — `13px`, `var(--ink-muted)`; when `.checked`: `text-decoration: line-through`, `var(--ink-subtle)`
- Separator: `border-bottom: 0.5px solid rgba(0,105,110,.07)` (last item: no border)

#### 6.7.3 Dua Progress Bar

`.progress-section` at bottom of tab.
- Label: `"Adhkar completed"` / `id="duaProgress"` (e.g. `"4 / 6"`)
- Bar: `id="duaProgressBar"` — gold fill (`var(--gold-500)`)

---

### 6.8 Tab: Fasting

`id="tab-fasting"`. Hidden by default.

#### 6.8.1 Header

`"Fasting Tracker"` — `13px`, weight 500.

#### 6.8.2 Month Summary Row

Two columns:

**Left column:**
- Month label: `"This Month (Shawwāl)"` — 11px, uppercase, `var(--ink-muted)`
- Count: `var(--font-display)`, `32px`, weight 600, `var(--teal-700)` — e.g. `"3"` + `" of 6"` in 16px muted
- Sub-label: `"Shawwāl voluntary fasts"`

**Right column (text-align: right):**
- `"Today's Suhoor"` label + `"4:28 AM"` value — `15px`, weight 600
- `"Iftar (Maghrib)"` label + `"8:42 PM"` value

In production: replace Suhoor/Iftar times with live Prayer Times API data.

#### 6.8.3 30-Day Fast Grid

`id="fastGrid30"` — CSS grid, `grid-template-columns: repeat(7, 1fr)`, `gap: 3px`. Built by `buildFastGrid()`.

**`buildFastGrid()` behavior:**
1. Clear `innerHTML`
2. Compute current month and year
3. Loop `d = 1` to `daysInMonth`
4. Create `.fast-day-cell` per day
5. Apply `.fasted` if `STATE.fastingDays[dateKey] === true`
6. Apply `.today-fast` if `d === today's date` and not yet fasted

**Cell onclick:** `STATE.fastingDays[dateKey] = !STATE.fastingDays[dateKey]` → toggle `.fasted` class → `saveState()` → `showToast()`.

**Cell styles:**

| State | Class | Background | Text color |
|---|---|---|---|
| Default | `.fast-day-cell` | `rgba(0,105,110,.04)` | `var(--ink-subtle)` |
| Fasted | `.fasted` | `var(--teal-700)` | white |
| Today (unfasted) | `.today-fast` | transparent | `var(--teal-700)` with dashed border |

#### 6.8.4 Stats Row

Three-column flex row (equal width, teal-tinted borders):

| Stat | Value | Label |
|---|---|---|
| Fasted | `3` | `Fasted` |
| Remaining | `3` | `Remaining` |
| Streak | `2` | `Streak` |

**Anatomy:** Each `flex: 1`, centered, `padding: 12px 6px`. Number: `var(--font-display)`, `20px`, weight 600, `var(--teal-700)`. Label: `9.5px`, uppercase, `var(--ink-subtle)`.

#### 6.8.5 Mark Today Button

Full-width button below the stats row.

- Default: `"Mark Today as Fasted"` with checkmark-circle icon
- Background: `linear-gradient(135deg, var(--teal-700), var(--teal-500))`
- `onclick="toggleFastToday(this)"`
- Border-radius: `13px`

**`toggleFastToday(btn)` behavior:**
1. Toggle `STATE.fastingDays[TODAY_KEY]`
2. `saveState()`
3. If now fasted: button text → `"✓ Today Fasted — Alhamdulillah!"`, background → green gradient `#0F6E56 → #2CAB87`
4. If unfasted: restore original button HTML and style
5. `buildFastGrid()` — rebuild grid to reflect change
6. `showToast("MashaAllah! Fasting logged 🌙" or "Fast removed for today")`

---

### 6.9 Tab: Sunnah Routines

`id="tab-sunnah"`. Hidden by default.

#### 6.9.1 Header

`"Daily Sunnah Routine"` — `13px`, weight 500, `margin-bottom: 14px`.

#### 6.9.2 Sunnah Routine List

`id="sunnahList"`. Six `.sunnah-routine-item` elements.

**Six items — exact content:**

| Index | Name | Time | Reward | Default |
|---|---|---|---|---|
| 0 | 🌅 Fajr Sunnah (2 rakʿah) before Fajr | Before Fajr adhan | Light in this world & the next | Checked |
| 1 | ☀️ Duha Prayer (2–8 rakʿah) | After sunrise, before Dhuhr | Equivalent to full body charity | Checked |
| 2 | 📖 Read Surah Al-Kahf | Every Friday | Light between two Fridays | Unchecked |
| 3 | 🌟 Witr prayer (minimum 1) | After Isha | Allah is Witr and loves Witr | Checked |
| 4 | 🌙 Qiyam al-Layl (optional) | Last third of the night | Allah descends & responds | Unchecked |
| 5 | 💊 Voluntary fast (Mon/Thu) | All day | Prophet's ﷺ weekly practice | Unchecked |

**`toggleRoutineItem(item)` behavior:**
1. Find item index via `Array.from(querySelectorAll('.sunnah-routine-item'))`
2. `STATE.sunnahItems[idx] = !STATE.sunnahItems[idx]`
3. Toggle `.checked` class
4. `saveState()`
5. `syncSunnahProgress()` — updates bar and label
6. `updateScore()`
7. `showToast("✓ [name] — BaarakAllahu feek! 🌟" or "[name] unchecked")`

**Item anatomy (`.sunnah-routine-item`):**
- `.sri-cb` — 20×20px checkbox: teal fill + checkmark SVG when `.checked`
- `.sri-content`:
  - `.sri-name` — `13px`, weight 500, `var(--ink-body)`; `.checked`: `text-decoration: line-through`, `var(--ink-subtle)`
  - `.sri-time` — `10.5px`, `var(--ink-subtle)`, `margin-top: 2px`
- `.sri-reward` — `10.5px`, `var(--teal-700)`, `text-align: right`, max-width `110px`
- Hover: `background: rgba(0,105,110,.03)`, `padding-left: 4px`

#### 6.9.3 Sunnah Progress Bar

`.progress-section` at bottom of tab.
- Label: `"Sunnah completed today"` / `id="sunnahProgress"` (e.g. `"3 / 6"`)
- Bar: `id="sunnahProgressBar"` — rainbow fill gradient

---

## 7. Pain Points Section

`.section` — standard CLAUDE.md section padding. Located after the hero/tracker app.

### 7.1 Section Header

- Eyebrow: `Why Muslims Struggle`
- Title: `The Problems We ` + `<span class="grad">Solve Together</span>`

### 7.2 Pain Cards Grid

`.pain-grid` — `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`, `gap: 16px`.

Eight `.pain-card` elements with `.reveal` + stagger classes:

| # | Emoji | Title | Description |
|---|---|---|---|
| 1 | ⏰ | Fajr Snooze Culture | Missing Fajr is the first domino. Our gentle alarm system and Fajr streak makes waking up feel like a victory. |
| 2 | 👨‍👩‍👧 | No Family Accountability | Doing ibadah in isolation is hard. Share progress with family and build collective momentum together. |
| 3 | 🌙 | Ramadan Goals Abandoned | Pre-made Ramadan, 30-day Hifz, and weekly Sunnah templates give you structure from day one. *(gold-glow variant)* |
| 4 | 💔 | Prayer Guilt Spiral | Missing one prayer leads to missing them all. Our "restart without shame" system lets you recover without judgment. |
| 5 | 🌌 | Nighttime Ibadah Stays Aspirational | Tahajjud and late-night Quran reading remain wishes. Pre-set night routines and first-step reminders make it happen. |
| 6 | 🏆 | Long Goals Feel Endless | Hifz and full Quran completion feel infinite. Visible 10%, 25%, 50% milestones keep motivation alive. *(gold-glow variant)* |
| 7 | 🗺️ | No Clear Learning Path | Too many surahs and duas — no sequence. AI-suggested progression tells you exactly what to memorize next. |
| 8 | 🕌 | Adhan ≠ Prayer Deadline | Most users don't know the prayer window length. We show the full window, countdown, and gentle nudge before time runs out. |

**Pain card hover (CLAUDE.md §27.4 — NO shimmer):**
- `translateY(-5px) scale(1.012)`
- `box-shadow: 0 16px 40px rgba(0,105,110,.13), 0 4px 12px rgba(0,105,110,.08), 0 0 0 1px rgba(0,105,110,.12)`
- `border-color: rgba(0,105,110,.25)`
- `.gold-glow` variant: gold-tinted shadow and border on hover

**Emoji hover:** `scale(1.15) rotate(-4deg)`, `transition: 0.38s ease-reverent`.

---

## 8. Free Features Section

`.section` — `background: var(--surface-card)`. Standard section.

### 8.1 Section Header

- Eyebrow: `Core Features · Free`
- Title: `Everything You Need to ` + `<span class="grad">Build Consistency</span>`
- Sub-text: `"No account required for basic tracking. All core features are and will remain free."`

### 8.2 Feature Cards Grid

`.feat-grid` — `repeat(auto-fill, minmax(280px, 1fr))`, `gap: 20px`.

Six `.feat-card` elements with `.reveal` + stagger classes:

| # | Icon | Badge | Title | Description |
|---|---|---|---|---|
| 1 | 🕌 | `.feat-icon.teal` | Prayer Streak Counter | Track all 5 daily prayers with a tap. See current streak, longest streak, and weekly completion rate. |
| 2 | 📖 | `.feat-icon.teal` | Qur'an Page Tracker | Set a daily page goal and mark progress. Visualize your way through the Mushaf with a completion bar. |
| 3 | 🙏 | `.feat-icon.gold` | Daily Dua Checklist | Morning and evening adhkar checklist with Arabic, transliteration, and meaning. |
| 4 | ☀️ | `.feat-icon.gold` | Fajr Wake-Up Challenge | Special Fajr streak — the hardest prayer to pray on time. A dedicated streak counter for the most important morning habit. |
| 5 | 📈 | `.feat-icon.teal` | Progress Heatmap | 28-day visual heatmap shows prayer consistency by day and prayer. Instantly see which days need attention. |
| 6 | ⭐ | `.feat-icon.gold` | Sunnah Score | A weekly score (0–100) combining prayer completion, Qur'an reading, dua checklist, and fasting. |

**Feature card hover:** `translateY(-5px) scale(1.012)`, `var(--elev-4)`, teal glow border. Icon: `scale(1.12) rotate(-5deg)`.

---

## 9. Premium & Futuristic Section

`.section` — standard section.

### 9.1 Section Header

- Eyebrow: `Premium & Futuristic`
- Title: `The Future of ` + `<span class="grad">Spiritual Growth</span>`
- Sub-text: `"Premium features for serious seekers. Futuristic tools that make worship data-driven and community-powered."`

### 9.2 Premium & Futuristic Grid

`.prem-grid` — `repeat(3, 1fr)`, `gap: 22px`. Collapses to 2 columns at ≤ 1024px, 1 column at ≤ 600px. All cards are full `height: 100%` with flex column layout.

**Row 1 — Premium cards (`.feat-badge.badge-premium` = `"✦ Premium"`):**

| # | Icon | Title | Description |
|---|---|---|---|
| 1 | 📋 `.feat-icon.gold` | Ramadan & Hifz Templates | Pre-built 30-day Ramadan challenge, 30-day Hifz program, and family Sunnah templates. Start structured worship journeys instantly. |
| 2 | 👨‍👩‍👧 `.feat-icon.teal` | Family & Group Challenges | Invite family members, see collective prayer rates, and run household ibadah challenges. |
| 3 | 📤 `.feat-icon.gold` | PDF & WhatsApp Export | Export your weekly or monthly report as a beautiful PDF or share directly to WhatsApp. |

**Row 2 — Futuristic cards (`.feat-badge.badge-future` = `"🔮 Futuristic"`):**

| # | Content element | Title | Description |
|---|---|---|---|
| 4 | `.orb-container-sm` with `#sunnahOrb` | 3D Habit Orb | A living, breathing 3D orb that pulses and glows brighter as your weekly Sunnah Score rises. |
| 5 | 🤖 `.feat-icon.teal` | AI Habit Prediction | AI analyzes your prayer patterns and predicts when you're likely to miss — then sends a gentle nudge 10 minutes before the window closes. Includes embedded "AI Insight · Today" preview card. |
| 6 | 🎙️ `.feat-icon.gold` | Voice Check-In | "Hey, I just prayed Fajr" — voice-activated habit logging. Log prayers hands-free. |

**Row 3 — More futuristic:**

| # | Content element | Title | Description |
|---|---|---|---|
| 7 | 📜 `.feat-icon.gold` | Prophet's ﷺ Daily Schedule | Overlay your routine with the Prophet's ﷺ hourly schedule — from Fajr to Tahajjud. Includes a mini timeline visualization. |
| 8 | 🌍 `.feat-icon.teal` | Community Leaderboard | Anonymous global leaderboard showing top Sunnah Scores in your city and worldwide. Includes preview of 3 leaderboard positions. |
| 9 | 🔔 `.feat-icon.gold` | Smart Habit Stacking | Auto-chain habits: Fajr → Morning adhkar → Qur'an. Sacred routines built from micro-habits. Includes preview of 3 stacked habits. |

### 9.3 Sunnah Score Orb

`id="sunnahOrb"` — `.orb-sm` class. 100×100px spinning gradient sphere.

**Visual:**
- Background: `conic-gradient(from 0deg, var(--teal-700), var(--teal-500), var(--gold-500), var(--teal-700))`
- Animation: `orb-spin` — full rotation, `8s linear infinite`
- Shadow: `0 0 60px rgba(0,105,110,.45), 0 0 100px rgba(0,105,110,.15)`
- `::before` pseudo: inner radial gradient for 3D depth
- `::after` pseudo: outer ring, `animation: orb-ring 4s ease-in-out infinite`

**Click behavior (`id="sunnahOrb"` addEventListener):**
1. Speed up animation: `animationDuration = '1.5s'`
2. Compute score: `calcScore(STATE)`
3. `showToast(score >= 80 ? "MashaAllah! Sunnah Score: [N]% 🌟" : "Sunnah Score: [N]% — Keep going! 🌿")`
4. After 2000ms: restore animation to `8s`

---

## 10. CTA Section

Last section before the footer. CLAUDE.md §11 template.

### 10.1 Content

| Element | Value |
|---|---|
| Eyebrow | `✦ Start Your Streak Today` |
| H2 title | `Build Habits That` |
| H2 italic | `Allah Loves Most` (gold gradient inside `<span class="gold-it">`) |
| Sub-text | `"The most beloved deeds are the consistent ones. Start tracking today and build a worship routine that lasts a lifetime."` |

### 10.2 Three CTA Buttons

| Button | Class | href |
|---|---|---|
| Start Tracking Free (with checkmark icon) | `.btn-gold` | `#tracker-app` |
| Explore Qur'an | `.btn-white-ghost` | `quran.html` |
| Daily Duas | `.btn-white-ghost` | `dua.html` |

### 10.3 Visual

Background: `linear-gradient(135deg, var(--teal-800), var(--teal-700), var(--teal-900))`. Gold glow `::before` top-left, teal glow `::after` bottom-right.

---

## 11. Global Footer

**Uses `ft-` CSS class system from CLAUDE.md §7.1–7.4 verbatim.**

### 11.1 Layout

Five-column grid (`2fr 1fr 1fr 1fr 1fr`). ≤ 1100px: 3 columns. ≤ 700px: 2 cols, brand spans full. ≤ 440px: 1 column.

### 11.2 Brand Column

- Logo: `Islamic` in `#5BC1C7`, `Info` in `#C5A059` (`.ti` + `.fo` classes)
- Tagline: `"A digital sanctuary for authentic Islamic knowledge — Qur'an, Hadith, Dua, and verified scholarship. Source-cited. Always free."`
- Arabic verse: `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ — Hud · 11:88`

### 11.3 Column 1 — Page-Specific: Habit Tracker

Heading: `Habit Tracker`

| Link | href |
|---|---|
| Prayer Tracker | `habits.html` |
| Fasting Log | `habits.html` |
| Sunnah Routines | `habits.html` |
| Streak Board | `habits.html` |
| Sunnah Score | `habits.html` |

### 11.4 Column 2 — Quick Access (identical every page, 8 links)

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

⚠️ All 8 required. `knowledge-hub.html` must never be omitted.

### 11.5 Column 3 — Our Ecosystem (§7.4 verbatim)

Heading: `Our Ecosystem`

| Display | URL |
|---|---|
| QuranlyAI ↗ | `https://quranlyai.com` |
| MosqueFinder ↗ | `https://mosquefinder.net` |
| TravellyAI ↗ | `https://travellyai.com` |
| LearnSpeakAI ↗ | `https://learnspeakai.com` |

⚠️ Common errors: `quranlya.com` (wrong — missing `i`). All use `target="_blank" rel="noopener"`.

### 11.6 Column 4 — Company + Legal

- About → `about.html`
- Contact → `contact.html`
- *(margin-top: 16px divider)*
- Privacy Policy → `privacy.html`
- Terms of Use → `terms.html`

### 11.7 Footer Bottom Bar

Left: `© 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources.`
Right (italic, muted): `All content source-verified · Privacy-first · Built with sincerity`

---

## 12. State Management & Persistence

All tracker state is stored in `localStorage` under the key `"ii-habits"`. The state resets daily (prayers, adhkar, sunnah items, quran pages) while accumulating historical data and streaks across days.

### 12.1 State Object Schema

```json
{
  "dateKey": "YYYY-MM-DD",
  "prayers": [false, false, false, false, false],
  "sunnahPrayers": {
    "Qiyam": false,
    "Duha": false,
    "Witr": false,
    "Tahajjud": false
  },
  "quranPages": 0,
  "quranGoal": 5,
  "duaChecked": [false, false, false, false, false, false],
  "fastingDays": {
    "2026-05-01": true,
    "2026-05-05": true
  },
  "sunnahItems": [false, false, false, false, false, false],
  "streak": 14,
  "longestStreak": 21,
  "history": {
    "2026-05-16": { "prayers": 5, "score": 88 },
    "2026-05-15": { "prayers": 4, "score": 72 }
  }
}
```

### 12.2 Daily Reset Logic

On page load, `loadState()` checks `STATE.dateKey !== TODAY_KEY`:
1. Archive today's data into `STATE.history[s.dateKey]` = `{ prayers: count, score: calcScore(s) }`
2. Update streak:
   - If yesterday = `s.dateKey` AND yesterday had 5/5 prayers → `streak++`
   - If yesterday ≠ `s.dateKey` → `streak = 0` (missed a day)
3. Update `longestStreak = Math.max(longestStreak, streak)`
4. Reset daily fields: `prayers`, `sunnahPrayers`, `duaChecked`, `sunnahItems`, `quranPages`, `dateKey`
5. Keep persistent fields: `quranGoal`, `fastingDays`, `streak`, `longestStreak`, `history`

### 12.3 Sunnah Score Formula

```
score = Math.round(
  (prayers.filter(Boolean).length / 5) * 50 +   // Prayers  → 50 pts max
  Math.min(quranPages / quranGoal, 1)       * 20 +   // Qur'an   → 20 pts max
  (duaChecked.filter(Boolean).length / 6)   * 15 +   // Adhkar   → 15 pts max
  (sunnahItems.filter(Boolean).length / 6)  * 15     // Sunnah   → 15 pts max
)
```

Range: 0–100. Displayed as a percentage in all progress indicators.

### 12.4 Theme Persistence

- Key: `islamicinfo-theme`
- Values: `"light"` | `"dark"`
- Default: `"light"`
- Set on `<html data-theme="...">` — never on `<body>`
- Applies at first JS execution (before render) to avoid flash

### 12.5 `saveState()` and `loadState()`

- `saveState()`: `localStorage.setItem('ii-habits', JSON.stringify(STATE))` — wrapped in try/catch
- `loadState()`: `JSON.parse(localStorage.getItem('ii-habits'))` — returns safe default object on parse error or first load

---

## 13. Design System Tokens & Rules

All styling must use CLAUDE.md §1 CSS variables. No raw hex inline (SVG gradient `defs` excepted).

### Key Tokens

| Token | Value | Usage |
|---|---|---|
| `--teal-700` | `#00696E` | Primary brand, active states, prayer circles |
| `--teal-500` | `#2CA4AB` | Gradient ends, progress bars |
| `--gold-500` | `#C5A059` | Accent, streak badge, gold variant |
| `--gold-700` | `#9A7C3F` | Gold text color |
| `--ink-primary` | `#0F2A2C` | Primary text |
| `--ink-muted` | `#6D797A` | Secondary text, labels |
| `--surface-card` | `#FAFBFB` | Card backgrounds |
| `--font-display` | Cormorant Garamond | Headings, stats numbers |
| `--font-arabic` | Amiri | All Arabic text |
| `--font-body` | Inter | UI labels, tabs, buttons |
| `--ease-reverent` | `cubic-bezier(.22,1,.36,1)` | All card hover transitions |
| `--ease-premium` | `cubic-bezier(.25,.46,.45,.94)` | Buttons, pill interactions |

### Color Rules

- Never use raw hex inline — use tokens
- Dark mode is a **sibling** `[data-theme="dark"]` block — never merged with `:root`
- No new colors invented outside the token set

### Forbidden: No Shimmer

```css
/* ✗ BANNED per CLAUDE.md §27.4 */
.card::after { animation: shimmer ...; left: -100%; }
.card:hover::after { left: 150%; }
```

Use glow shadow rings instead for hover state indication.

---

## 14. Interactions & Animations

| Element | Transform | Duration | Effect |
|---|---|---|---|
| Pain cards | `translateY(-5px) scale(1.012)` | 0.38s ease-reverent | Teal glow shadow |
| Pain card emoji | `scale(1.15) rotate(-4deg)` | 0.38s ease-reverent | Pop on card hover |
| Feature cards | `translateY(-5px) scale(1.012)` | 0.38s ease-reverent | Elev-4 shadow |
| Feature icon | `scale(1.12) rotate(-5deg)` | 0.35s ease-reverent | Icon bounce |
| Prayer circles (unchecked hover) | `scale(1.1)` | 0.35s ease-reverent | Teal border glow |
| Prayer circles (check) | `.done` state | 0.35s | Teal fill + glow |
| Prayer ripple | `prayerRipple` keyframe | 0.5s ease-out | Ring expand + fade |
| Day pills | `translateY(-3px)` | 0.38s ease-reverent | Shadow lift |
| Heat cells (hover) | `scale(1.25)` | 0.2s ease-reverent | Pop to show tooltip |
| Sunnah pills | color + bg shift | 0.22s ease-premium | Teal fill |
| Dua items (check) | color + strikethrough | 0.25s | Text changes |
| Sunnah routine items | padding-left + bg | 0.18s | Indent on hover |
| Progress bars | `width` | 1.0s ease-reverent | Fill animation on update |
| Score ring arc | `stroke-dashoffset` | — (CSS transition) | Arc draws on update |
| Orb spin | `rotate(0→360deg)` | 8s linear infinite | Continuous spin |
| Orb ring | `scale(1→1.08)` | 4s ease-in-out infinite | Pulse |
| Orb click | `animationDuration: 1.5s` | 2s then back to 8s | Speed burst |
| Tab switch | `display: none/block` | Instant | No transition |
| Streak badge | — | Static | Gold gradient bg |
| Week strip pills | Day dots fill | — | Reflects live state |
| Footer links | `translateX(4px)` | 0.18s | Left border teal |
| Nav links | `scale(1.05)` | 0.25s ease-premium | Glow ring |
| CTA buttons | `translateY(-2px) scale(1.04)` | 0.25s | Shadow enhance |

**Reveal on scroll:**
- Class `.reveal` → `opacity: 0; transform: translateY(28px)`
- `IntersectionObserver` at `threshold: 0.08` adds `.in`
- Stagger: `.reveal-d1` (+0.08s), `.reveal-d2` (+0.16s), `.reveal-d3` (+0.24s)

**Toast:**
- `.toast` — fixed, `bottom: 24px; right: 24px`, `z-index: 999`
- Shows via `.show` class: `opacity: 1`, `translateY(0)`
- Auto-hides after 2800ms via `clearTimeout` + `setTimeout`
- Background: `var(--teal-900)`, white text, teal dot

---

## 15. Responsive Breakpoints

CLAUDE.md §23:

| Breakpoint | Changes |
|---|---|
| ≤ 1100px | Nav-link 11.5px; footer 3-column |
| ≤ 1024px | Premium grid collapses to 2 columns |
| ≤ 900px | Nav-link 10.5px; brand 16px, brand-mark 28×28 |
| ≤ 760px | Nav hidden; hamburger shown; icon buttons hidden except theme + search |
| ≤ 700px | Footer 2-column; brand spans full |
| ≤ 600px | Premium grid collapses to 1 column |
| ≤ 480px | Prayers row: `repeat(3, 1fr)` instead of 5 columns |
| ≤ 440px | Footer 1-column |

---

## 16. Routing & Linking Rules

**No `href="#"` in production.** Every interactive element triggers a real action or routes to a real destination.

| Element | Route / Action |
|---|---|
| Prayer circles (p0–p4) | `togglePrayer(i)` — toggles prayer state |
| Sunnah pills | `toggleSunnah(el, name)` — toggles sunnah prayer |
| Tab buttons | `switchTab(btn, tab)` — switches active tab |
| Week strip day pills | `showToast()` — shows that day's stats |
| Qur'an slider | `updateQuranSlider(v)` — updates quran pages |
| Qur'an goal input | `updateQuranGoal()` — updates daily goal |
| Dua items | `toggleDua(item)` — toggles dua checked state |
| Fasting grid cells | inline `onclick` — toggles fasted state for that day |
| Mark Today as Fasted | `toggleFastToday(this)` — toggles today's fast |
| Sunnah routine items | `toggleRoutineItem(item)` — toggles routine item |
| Sunnah Score orb | `click` event → `showToast()` with score |
| Reset day | `resetDay()` — clears all daily counters |
| Start Tracking Today (hero) | Smooth scroll to `#tracker-app` |
| CTA "Start Tracking Free" | `href="#tracker-app"` |
| CTA "Explore Qur'an" | `quran.html` |
| CTA "Daily Duas" | `dua.html` |
| Footer Quick Access | Correct page hrefs |
| Footer Ecosystem | External URLs `target="_blank" rel="noopener"` |

---

## 17. User Flows

### Flow 1 — First-Time Tracker Use

1. User lands on Habit Tracker page → hero loads with tracker preview visible
2. All prayers show unchecked (fresh state from `localStorage`)
3. User taps Fajr circle → turns teal, checkmark appears, toast: `"Fajr ✓ — Alhamdulillah!"`
4. User taps Dhuhr, Asr, Maghrib → all turn teal
5. Stats strip updates: `todayPct` now shows `80%` (4/5 prayers)
6. User opens Qur'an tab → adjusts slider to `3` pages → `"📖 3 pages read today — MashaAllah!"`
7. User opens Adhkar tab → checks remaining duas
8. Sunnah Score rises to ~72% across all progress bars
9. User returns next day → daily reset fires → prayers unchecked, history saved, streak increments

### Flow 2 — Returning Daily User

1. User opens page → sees yesterday's filled week strip dot
2. Streak badge shows `"🔥 14 day streak"`
3. User logs today's prayers one by one
4. Live countdown shows `"⏱ Next: Asr in 42 min"` — user knows when to pray
5. User opens Fasting tab → taps today in the grid → day turns teal
6. "Mark Today as Fasted" button turns green
7. User scrolls down → sees streak progress

### Flow 3 — Explore Features

1. User scrolls past tracker to Pain Points section
2. Reads how the platform solves their specific struggles
3. Scrolls to Free Features — understands what's included at no cost
4. Scrolls to Premium & Futuristic — taps the 3D orb → spin accelerates → toast shows score
5. Reads AI Prediction and Community Leaderboard cards
6. Clicks CTA "Start Tracking Free" → scrolls back to tracker

### Flow 4 — Family Challenge

1. User clicks "Family Challenge" button in hero
2. (In production) navigates to Premium upgrade page with family challenge onboarding
3. User can share their daily Sunnah Score via PDF export or WhatsApp

### Flow 5 — Dark Mode

1. User toggles theme button → `[data-theme="dark"]` applied to `<html>`
2. Tracker preview changes: dark glass card, teal-300 accents
3. Progress bars remain fully visible
4. Bismillah changes from teal gradient to gold gradient with drop-shadow
5. Theme persists across all page navigations via `localStorage`

---

## 18. Acceptance Criteria Checklist

### Global Structure
- [ ] `<html lang="en" data-theme="light">` present
- [ ] Fonts: Cormorant Garamond, Inter, Amiri — preconnected and imported in order
- [ ] All 50+ CSS tokens in `:root` exactly as CLAUDE.md §1
- [ ] Dark mode `[data-theme="dark"]` sibling block — unmerged
- [ ] Body: Islamic geometric `background-image` at opacity 0.04
- [ ] `.ambient` radial glow div present, `.shell` wrapper present

### Header
- [ ] All **10** nav items in exact order
- [ ] `Habit Tracker` has `class="nav-link active"` with teal/gold underline indicator
- [ ] `knowledge-hub.html` at position 5 — never omitted
- [ ] `islamic-studies.html` used — never `learn.html`
- [ ] 4 header tools in order: search, EN, theme, admin
- [ ] Hamburger button present — visible only ≤ 760px — `onclick="openMM()"`
- [ ] Search popup `id="searchTrigger"` and `id="searchPopup"`: open, focus, close on Escape/outside
- [ ] Theme toggle `id="themeBtn"`, persists to `islamicinfo-theme` localStorage

### Mobile Menu
- [ ] All **10** nav links in correct order with correct hrefs
- [ ] `Habit Tracker` marked active (`.mm-link active`)
- [ ] `knowledge-hub.html` present — never omitted
- [ ] `islamic-studies.html` — never `learn.html`
- [ ] `openMM()` / `closeMM()` functions defined and working
- [ ] `Escape` key closes menu
- [ ] Fade + slide-in animation on open

### Hero
- [ ] Bismillah is first child of `.hero-inner`
- [ ] Light: teal gradient clip-text; Dark: gold gradient + drop-shadow
- [ ] H1 uses `var(--font-display)` with `<span class="grad">`
- [ ] Arabic hadith quote present with English translation and source
- [ ] 3 floating `.geo` SVGs with `geoRot` animation
- [ ] Hero-bg radial gradient with `bgDrift` animation
- [ ] Two CTA buttons: "Start Tracking Today" + "Family Challenge"

### Tracker Preview App
- [ ] `id="tracker-app"` with `.reveal` class
- [ ] Glass morphism background: `rgba(255,255,255,.88)` + `backdrop-filter: blur(20px)`
- [ ] Stats strip: 4 metrics — Day Streak, Today %, Weekly Score, Best Streak
- [ ] Date row: `id="today-date"` dynamically set + streak badge `id="streak-count"`
- [ ] 5 tabs: Prayers / Qur'an / Adhkar / Fasting / Sunnah — "Prayers" active by default
- [ ] `switchTab()` correctly hides/shows all 5 tab panels
- [ ] Week strip built dynamically by JS — 7 day-pills with correct states
- [ ] Day-pills: today = teal fill, done-full = teal border, future = default

### Prayers Tab
- [ ] Live prayer countdown div injected as first child of `#tab-prayers`
- [ ] Countdown updates every 60 seconds
- [ ] 5 prayer circles (`id="p0"` to `id="p4"`) with correct default states
- [ ] `togglePrayer(i)` toggles `.done` class, saves state, updates score, fires toast, triggers ripple
- [ ] Keyboard shortcut: keys `1`–`5` toggle prayers (not when input focused)
- [ ] Fajr streak badge `id="fajrBadge"` updates from history
- [ ] 4 sunnah pills: Qiyam, Duha (on), Witr (on), Tahajjud — toggle via `toggleSunnah()`
- [ ] 3 progress bars: Qur'an pages, Dua checklist, Sunnah Score
- [ ] Score ring SVG `id="scoreRing"` with `stroke-dashoffset` animation
- [ ] Score ring number `id="scoreRingNum"` — gradient text
- [ ] 28-day heatmap `id="heatmap"` built on load from STATE.history
- [ ] Tracker footer: `id="quranGoal"` input + `resetDay()` link

### Qur'an Tab
- [ ] Range slider `id="quranSlider"`: min=0, max=`quranGoal`, value=`quranPages`
- [ ] Slider background gradient tracks position
- [ ] `updateQuranSlider()` updates display, Juz bar, quran-bar, and score
- [ ] `updateQuranGoal()` updates slider max and saves state
- [ ] Juz progress bar `id="juzBar"` + label `id="juzPct"`
- [ ] 30-day Qur'an heatmap `id="quranHeatmap"` built when tab opens

### Adhkar Tab
- [ ] 6 dua items with correct Arabic content and default checked states (4 checked, 2 unchecked)
- [ ] `toggleDua(item)` toggles state, saves, updates progress, fires toast
- [ ] Progress bar `id="duaProgressBar"` + label `id="duaProgress"`

### Fasting Tab
- [ ] Month summary: count of fasted days + Suhoor/Iftar times
- [ ] 30-day grid built by `buildFastGrid()` — cells clickable
- [ ] `.fasted` cells: teal fill; `.today-fast`: dashed teal border
- [ ] Stats row: Fasted / Remaining / Streak counts
- [ ] Mark Today button: `toggleFastToday(this)` — turns green when fasted, restores on un-tap

### Sunnah Tab
- [ ] 6 sunnah routine items with correct name/time/reward content
- [ ] Default checked: items 0, 1, 3 (Fajr Sunnah, Duha, Witr)
- [ ] `toggleRoutineItem(item)` toggles, saves, updates progress, fires toast
- [ ] Progress bar `id="sunnahProgressBar"` + label `id="sunnahProgress"`

### State Persistence
- [ ] `localStorage` key `"ii-habits"` stores full state object
- [ ] New day triggers archive of previous day's data into `STATE.history`
- [ ] Streak increments when yesterday had 5/5 prayers; resets otherwise
- [ ] All tab states render from `STATE` on page load (not just defaults)
- [ ] `saveState()` called on every toggle/change
- [ ] `loadState()` handles missing keys with safe defaults
- [ ] Parse error in `loadState()` returns clean default object

### Sunnah Score
- [ ] Formula: Prayers 50% + Qur'an 20% + Adhkar 15% + Sunnah 15%
- [ ] Score updates whenever any component changes
- [ ] All connected elements update: `score-pct`, `score-bar`, `scoreRingNum`, `scoreRing` arc, `todayPct`

### Toast
- [ ] `showToast(msg)` shows message, auto-hides after 2800ms
- [ ] Toast has `.toast-dot` teal indicator circle
- [ ] Multiple quick actions reset the timer correctly

### Pain Points Section
- [ ] 8 pain cards in correct order with correct content
- [ ] Cards 3 and 6 have `.gold-glow` class
- [ ] All cards have `.reveal` class for scroll animation

### Free Features Section
- [ ] `background: var(--surface-card)` applied to section
- [ ] 6 feature cards with correct icons, titles, and descriptions
- [ ] `.feat-icon.teal` and `.feat-icon.gold` variants as specified

### Premium & Futuristic Section
- [ ] `.prem-grid` 3-column layout with correct breakpoints
- [ ] 3 Premium badge cards (rows 1)
- [ ] 6 Futuristic badge cards (rows 2+3)
- [ ] `#sunnahOrb` click: speeds up spin, shows score toast, reverts after 2s

### CTA Section
- [ ] Last section before footer
- [ ] 3 buttons: Start Tracking Free (`#tracker-app`) · Explore Qur'an (`quran.html`) · Daily Duas (`dua.html`)
- [ ] Correct eyebrow, title, sub-text content
- [ ] `.reveal` on all child elements

### Footer
- [ ] Uses **`ft-`** CSS class system — NOT `ii-footer-*`
- [ ] Col 1 heading: `"Habit Tracker"` with 5 habit-specific links
- [ ] Col 2: Quick Access — all 8 destinations including `knowledge-hub.html`
- [ ] Col 3: Ecosystem — `quranlyai.com` · `mosquefinder.net` · `travellyai.com` · `learnspeakai.com`
- [ ] `quranlyai.com` — not `quranlya.com` (missing `i`)
- [ ] `LearnSpeakAI` — correct casing
- [ ] Col 4: Company + Legal with all 4 links, `margin-top: 16px` between sections
- [ ] Bottom bar: exact copyright string
- [ ] Footer link hover: `translateX(4px)` + left teal border

### Animations & Theme
- [ ] `.reveal` on all section content; stagger delays applied
- [ ] `IntersectionObserver` at `threshold: 0.08`
- [ ] All hover transitions use `var(--ease-reverent)` or `var(--ease-premium)`
- [ ] No shimmer `::after` sweep on any card
- [ ] Theme toggles correctly; persists across pages via `islamicinfo-theme` key
- [ ] Prayer ripple keyframe triggers on check/uncheck
- [ ] Orb `orb-spin` + `orb-ring` animations run continuously
- [ ] Tested in both light and dark mode
- [ ] All responsive breakpoints verified

---

*End of Habit Tracker Functional Document v1.0*
*IslamicInfo.org · CLAUDE.md v3.0 · Blueprint: `habits__1_.html`*
