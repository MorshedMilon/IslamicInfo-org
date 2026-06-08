# Verify Page — Functional Document
**IslamicInfo.org · `verify.html` · Claim Verification Engine**
*Version 1.0 — Production Ready*
*Derived from: `verify_enhanced.html` mockup + CLAUDE.md v3.0*
*Date: 2026-05-17*

---

## Table of Contents

1. [Page Purpose & Role](#1-page-purpose--role)
2. [Page Architecture — Section Map](#2-page-architecture--section-map)
3. [Global Navigation (Header)](#3-global-navigation-header)
4. [Mobile Menu](#4-mobile-menu)
5. [Hero Section](#5-hero-section)
6. [Trust Strip](#6-trust-strip)
7. [Verify Box — Input Interface](#7-verify-box--input-interface)
   - 7.1 [Mode Selector](#71-mode-selector)
   - 7.2 [Textarea Input](#72-textarea-input)
   - 7.3 [Character Counter](#73-character-counter)
   - 7.4 [Action Bar Buttons](#74-action-bar-buttons)
   - 7.5 [Quick Example Chips](#75-quick-example-chips)
8. [Loading State](#8-loading-state)
9. [Results Section — Complete Spec](#9-results-section--complete-spec)
   - 9.1 [Divider Label](#91-divider-label)
   - 9.2 [Verdict Banner](#92-verdict-banner)
   - 9.3 [Summary Card](#93-summary-card)
   - 9.4 [Confidence Dial Card](#94-confidence-dial-card)
   - 9.5 [Narration Chain (Isnād)](#95-narration-chain-isnād)
   - 9.6 [Evidence Cards](#96-evidence-cards)
   - 9.7 [Scholar Consensus Panel](#97-scholar-consensus-panel)
   - 9.8 [Disclaimer](#98-disclaimer)
   - 9.9 [Try Another Row](#99-try-another-row)
10. [How It Works Section](#10-how-it-works-section)
11. [FAQ Accordion](#11-faq-accordion)
12. [CTA Section](#12-cta-section)
13. [Global Footer](#13-global-footer)
14. [Verification Logic & Verdict States](#14-verification-logic--verdict-states)
15. [Design System Tokens & Rules](#15-design-system-tokens--rules)
16. [Interactions & Animations](#16-interactions--animations)
17. [Responsive Breakpoints](#17-responsive-breakpoints)
18. [Routing & Linking Rules](#18-routing--linking-rules)
19. [User Flows](#19-user-flows)
20. [Acceptance Criteria Checklist](#20-acceptance-criteria-checklist)

---

## 1. Page Purpose & Role

The **Verify** page (`verify.html`) is IslamicInfo's claim verification engine. It sits at **position 9** in the global navigation — between Habit Tracker and About.

Its purpose is to:
- Let users paste any Islamic claim, hadith, or social media quote and cross-reference it against 61,000+ authenticated hadith and the full Qur'an
- Present the scholarly grade (Ṣaḥīḥ / Ḥasan / Ḍaʿīf / Mawḍūʿ), source references, narration chain, and scholar consensus clearly
- Explicitly never issue fatwas, personal rulings, or religious opinions — the page cites sources only
- Support four input modes: Hadith, Quote, Claim, and Arabic text
- Be completely free, no account required

**Core editorial rule:** This page cites authenticated sources and presents scholar verdicts. It never issues new rulings. Every result must include the disclaimer. The confidence score reflects scholarly consensus, not divine authority.

All visual implementation must follow **CLAUDE.md v3.0** exactly.

---

## 2. Page Architecture — Section Map

Top-to-bottom order is fixed.

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
│  — Sub-text                                 │
│  — Trust Strip  (§6)                        │
├─────────────────────────────────────────────┤
│  PAGE CONTAINER  (max-width 1060px)         │
│  ┌─────────────────────────────────────┐    │
│  │  VERIFY BOX  (§7)                   │    │
│  │  — Mode selector                    │    │
│  │  — Textarea                         │    │
│  │  — Character counter                │    │
│  │  — Action bar (Voice/Sample/Clear/  │    │
│  │    Verify)                          │    │
│  │  — Quick example chips              │    │
│  ├─────────────────────────────────────┤    │
│  │  LOADING STATE  (§8)                │    │
│  ├─────────────────────────────────────┤    │
│  │  RESULTS SECTION  (§9)              │    │
│  │  — Divider label                    │    │
│  │  — Verdict banner                   │    │
│  │  — Summary card + Confidence dial   │    │
│  │  — Narration chain (Isnād)          │    │
│  │  — Evidence cards (4 cards)         │    │
│  │  — Scholar consensus panel          │    │
│  │  — Disclaimer                       │    │
│  │  — Try Another row                  │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  HOW IT WORKS  (§10)                        │
│  — 3-step methodology cards                 │
│  — FAQ Accordion  (§11)                     │
├─────────────────────────────────────────────┤
│  CTA SECTION  (§12)                         │
├─────────────────────────────────────────────┤
│  GLOBAL FOOTER  (§13)                       │
└─────────────────────────────────────────────┘
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
| 8 | Habit Tracker | `habits.html` | |
| 9 | Verify | `verify.html` | **`.active`** on this page |
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
Habit Tracker       → habits.html
Verify              → verify.html            ← .mm-link active
About               → about.html
```

### 4.2 Open / Close

- Hamburger `onclick="openMM()"` adds `.open` class
- Close button `onclick="closeMM()"` removes `.open`
- `Escape` key closes
- Fade + slide-in from right (`mmFade` keyframe, 0.3s)

### 4.3 Visual

- Background: `rgba(6,38,40,.97)` + `backdrop-filter: blur(20px)`
- Link: `18px`, `rgba(255,255,255,.7)`
- Active / hover: `color: #5BC1C7`, `padding-left: 8px`

---

## 5. Hero Section

CLAUDE.md §6 structure. Hero `min-height: 60vh`.

### 5.1 Element Order (inside `.hero-inner`)

1. Bismillah — `bismillah-hero-top`
2. Eyebrow badge — `hero-badge` + `.badge-dot` pulse
3. H1 title
4. Sub-text — `hero-sub`
5. Trust strip — embedded inside hero-inner (§6)

### 5.2 Content Values

| Element | Content |
|---|---|
| Bismillah | `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ` |
| Eyebrow | `Claim Verification Engine` |
| H1 — plain | `Trust. ` |
| H1 — italic gradient | `Verify.` (inside `<span class="grad-it">`) |
| H1 — continued | ` Understand.` |
| Sub-text | "Paste any Islamic claim, hadith, or social media quote. We cross-reference 61,000+ authenticated hadith and the full Qur'an — we cite sources, never issue rulings." |

### 5.3 Bismillah Color Rules

- **Light:** `linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%)` — teal clip-text, opacity 0.92
- **Dark:** `linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%)` — gold clip-text + `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))`

### 5.4 Floating Geometry Decorators

Three `.geo` SVGs with `geoRot` animation:

| Class | Position | Shape | Color | Animation |
|---|---|---|---|---|
| `.g1` | top 7%, left 4% | Star polygon + circle | `#00696E` | `geoRot` 28s linear |
| `.g3` | top 10%, right 5% | Star polygon | `#C5A059` | `geoRot` 32s, delay -14s, 5.5% opacity |
| `.g4` | bottom 12%, right 8% | Circle | `#00696E` | `geoRot` 20s, delay -7s, 4% opacity |

---

## 6. Trust Strip

Embedded inside `.hero-inner`, directly below the sub-text. Animated in with `fadeUp 0.7s delay 0.35s`.

### 6.1 Four Trust Stats

| Icon | Number | Label |
|---|---|---|
| 📚 | `61K+` | Hadith |
| 📖 | `6,236` | Verses |
| ⚖️ | `6` | Collections |
| 🛡️ | `100%` | Source-Cited |

### 6.2 Layout

`.trust-strip` — horizontal flex row, card background, `border-radius: var(--r-xl)`, `overflow: hidden`.

- `.trust-item`: `flex: 1`, centered, padded
- Dividers: CSS `::before` pseudo-element between items (0.5px, `rgba(0,105,110,.12)`)
- `.trust-icon`: `18px` emoji, `margin-bottom: 5px`
- `.trust-num`: `var(--font-display)`, `clamp(18px, 2.5vw, 24px)`, `var(--teal-700)`
- `.trust-label`: `9.5px`, uppercase, letter-spaced, `var(--ink-muted)`

At ≤ 560px: wraps to 2×2 grid, dividers hidden.

---

## 7. Verify Box — Input Interface

`.verify-box` — the primary interaction element. Positioned inside `.page-container` (max-width: 1060px, centered, `padding-top: 48px`).

### 7.1 Visual Style

- Background: `rgba(255,255,255,.90)` with `backdrop-filter: blur(24px)`
- Border: `1px solid rgba(0,105,110,.18)`
- Border-radius: `28px`
- Shadow: `var(--elev-3)` + `0 0 0 1px rgba(0,105,110,.04)` + inner light
- Decorative radial glow: `::before` top-right, teal-tinted
- Dark mode: `rgba(21,37,39,.92)`, border `rgba(0,105,110,.30)`
- Entry animation: `.reveal` class

### 7.2 Mode Selector

`.verify-box-top` row — flex, space-between:

**Left:** `.verify-box-label` — "Paste your claim, hadith, or quote to verify" — with a 18px teal line prefix via `::before`.

**Right:** `.verify-modes` — four mode buttons.

| Button label | Mode value | Default state |
|---|---|---|
| Hadith | `hadith` | `.on` (active by default) |
| Quote | `quote` | Inactive |
| Claim | `claim` | Inactive |
| Arabic | `arabic` | Inactive |

**`setMode(btn, mode)` behavior:**
1. Removes `.on` from all `.vmode` buttons
2. Adds `.on` to clicked button
3. In production: changes textarea placeholder text to match the mode (e.g. Arabic mode shows RTL placeholder)
4. In production: adjusts the search algorithm — Arabic mode performs exact Arabic text matching; Claim mode is broader semantic search

**Active mode style (`.vmode.on`):** `background: rgba(0,105,110,.09)`, `color: var(--teal-700)`, border darkens.

### 7.3 Textarea Input

`id="verifyInput"`. `min-height: 140px`, `max-height: 440px`, resizable vertically.

- Font: `var(--font-serif)`, `18px`, italic, `line-height: 1.75`
- No border, no outline — fully transparent, blends into the verify-box background
- Placeholder: `"e.g., 'Did the Prophet ﷺ say that seeking knowledge is mandatory for every Muslim?' — paste a full hadith, a social media quote, or any Islamic claim you'd like cross-referenced…"` at `16.5px`, `var(--ink-subtle)`
- Default value (shown on load): `"Did the Prophet say that seeking knowledge is a duty upon every Muslim?"`

**In Arabic mode:** `direction: rtl; text-align: right; font-family: var(--font-arabic)` applied to textarea.

### 7.4 Character Counter

`.char-counter` — right-aligned, `11px`, `var(--ink-subtle)`:
- Format: `[N] characters · [W] words`
- `id="charCount"` — updates on every `input` event
- `id="wordCount"` — `text.split(/\s+/).length` (empty string returns 0)
- Updates live without debounce

### 7.5 Action Bar Buttons

`.verify-actions` row — flex, wraps, with a top border separator. Contains:

**Left-aligned side buttons (`.btn-side`):**

| Button | Icon | `onclick` | Action |
|---|---|---|---|
| Voice | Microphone icon | `pasteClipboard()` | Reads from clipboard via `navigator.clipboard.readText()`. On success: pastes text into textarea and updates counter. On failure: shows alert "Clipboard access denied". In production: also supports `SpeechRecognition` API for voice input. |
| Sample | Document icon | `loadSample()` | Cycles through `SAMPLES` array (5 sample claims). Each click advances to the next sample. Focuses textarea and updates counter. |
| Clear | Trash icon | `clearInput()` | Sets `ta.value = ''`, updates counter, focuses textarea. |

**Right-aligned (margin-left: auto):**

`.btn-verify` (`id="verifyBtn"`, `onclick="runVerify()"`):
- Label: "Verify Claim" with shield+checkmark icon
- Teal gradient, `border-radius: 22px`, `box-shadow: 0 4px 14px rgba(0,105,110,.28)`
- Hover: `translateY(-2px) scale(1.04)`, stronger shadow
- Loading state (`.loading`): `opacity: 0.8`, `cursor: wait`, button text changes to "Verifying…"

**Sample claims array (5 items, cycled in order):**
1. `"Did the Prophet ﷺ say that seeking knowledge is a duty upon every Muslim?"`
2. `"The Prophet said: 'Cleanliness is half of faith.' Is this authentic?"`
3. `'"Actions are judged by intentions, and each person will get what they intended." — Is this a hadith?'`
4. `"Is it true the Prophet said smiling at your brother is an act of charity?"`
5. `'"The best of people are those who are most beneficial to others." — Where does this come from?'`

### 7.6 Quick Example Chips

`.quick-examples` row — flex, wraps, `margin-top: 16px`.

Label: `qex-label` — "Try:" in small uppercase.

Five `.example-chip` pills:

| Chip text |
|---|
| `"Cleanliness is half of faith"` |
| `"The best of people are most beneficial to others"` |
| `"Actions are by intentions"` |
| `"Smile at your brother is sadaqah"` |
| `"Seek knowledge even unto China"` |

**`useChip(el)` behavior:**
1. Strips leading/trailing quotes from chip text
2. Sets `ta.value` to the cleaned text
3. Updates character counter
4. Focuses textarea
5. Smooth-scrolls so the verify box is 80px from the top of the viewport

**Chip hover:** `background: var(--teal-700)`, `color: white`, `border-color: transparent`, `translateY(-1px)`, glow shadow

---

## 8. Loading State

`id="loadingState"` — `display: none` by default. Shown during `runVerify()`.

### 8.1 Visual

- Max-width: 700px, centered, `padding: 28px`, `text-align: center`
- Three animated dots (`.ld` × 3) — teal-500 circles, `ldBounce` keyframe (scale 0→1→0, 1.2s, staggered by 0.2s)
- Loading text: `var(--font-serif)`, `16px`, italic, `var(--ink-muted)` — "Cross-referencing authenticated collections…"

### 8.2 `runVerify()` Sequence

1. Guard: if textarea is empty, do nothing and return
2. Add `.loading` to `#verifyBtn`, change button text to "Verifying…"
3. Fade results section to `opacity: 0` with 0.3s transition
4. Show `#loadingState` (`display: block`)
5. After **2200ms** (simulated; in production: real API response time):
   - Hide loading state
   - Restore results to `opacity: 1`
   - Remove `.loading`, restore button HTML with icon + "Verify Claim"
   - Call `animateDial(80)` to animate the confidence dial
   - Animate scholar consensus bars (reset to 0, then restore target widths after 100ms)
   - Smooth-scroll to `#resultsSection`

**In production:** Steps 1–4 fire immediately. The API call goes to the backend. On response, the result data populates all result components dynamically, then step 5 fires.

---

## 9. Results Section — Complete Spec

`id="resultsSection"`. Contains all analysis output components below the verify box.

### 9.1 Divider Label

`.divider-label` — centered decorative row. Horizontal gold gradient lines on either side with `✦ Analysis Complete` text in the center. Gold-700 color, uppercase, letter-spaced.

### 9.2 Verdict Banner

`.verdict-banner` — max-width 820px, centered. Three possible states based on verdict grade:

| Grade | Class | Background | Border | Icon bg |
|---|---|---|---|---|
| Ṣaḥīḥ | `.sahih` | `rgba(15,110,86,.08)` → `.04` | `rgba(15,110,86,.25)` | `rgba(15,110,86,.12)` |
| Ḥasan | `.hasan` | `rgba(93,138,58,.08)` → `.04` | `rgba(93,138,58,.25)` | `rgba(93,138,58,.12)` |
| Ḍaʿīf | `.daif` | `rgba(168,105,50,.08)` → `.04` | `rgba(168,105,50,.25)` | `rgba(168,105,50,.12)` |

**Anatomy (left to right):**
- `.vb-icon` (48×48px, `border-radius: 14px`): emoji icon — 🛡️ for authenticated; ⚠️ for weak/daif
- `.vb-content`:
  - `.vb-verdict`: 10px uppercase label — e.g. "Verdict · Authenticated (Ḥasan)" — colored per grade
  - `.vb-title`: `var(--font-serif)`, 18px — brief description of the finding
- `.vb-badge`: grade pill — e.g. "Ḥasan · Reliable" — colored per grade

**Default state shown (Ḥasan):**
- Icon: 🛡️
- Verdict: "Verdict · Authenticated (Ḥasan)"
- Title: "The claim is widely attested in the major hadith corpus across multiple chains of narration."
- Badge: "Ḥasan · Reliable"

### 9.3 Summary Card

Left card of the result grid (`.result-grid`, `1.4fr 1fr`, collapses to 1 column at ≤ 860px).

`.result-card` — standard `.card` with elevated border and shadow.

**Summary text (`.summary`):** `var(--font-serif)`, `15.5px`, `line-height: 1.68`. Contains the full textual analysis with inline `<em>` for grade names.

**Default content:** "Ibn Mājah (224), al-Bayhaqī, and others record this narration with multiple chains. Al-Albānī graded it *Ḥasan* in Ṣaḥīḥ Ibn Mājah. The obligation concerns foundational religious knowledge — not every branch of worldly learning. Ibn al-Qayyim clarifies the scope covers ʿaqīdah and the fiqh of one's personal worship."

**Topic chips row (`.topic-chips`):** Separated by a teal border-top. Two chip types:
- `.chip.chip-teal` — teal background/text — for topic tags
- `.chip.chip-gold` — gold background/text — for source references

**Default chips:** `Knowledge (ʿIlm)` · `Obligation (Farḍ)` · `Ibn Mājah · 224` · `al-Albānī Graded` · `Multiple Chains`

### 9.4 Confidence Dial Card

Right card of the result grid. `.dial-card` — special styling with gold-tinted radial gradient background, gold border accent.

**Big dial (`.big-dial`, 164×164px):**
- SVG viewBox `0 0 180 180`
- Background circle: `r=76`, `stroke: rgba(0,105,110,.08)`, `stroke-width: 14`
- Progress arc: `id="dialArc"`, same radius, gradient stroke (`gold-500 → teal-700`), `stroke-linecap: round`, `stroke-dasharray: 478`
- `stroke-dashoffset` = `478 - (478 × pct/100)` — e.g. 80% → offset `96`
- Center overlay (`.core`): percentage number + "Confidence" label

**`animateDial(targetPct)` function:**
1. Computes `offset = 478 - (478 × targetPct / 100)`
2. Sets `arc.style.strokeDashoffset = offset` with `transition: stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)`
3. Counts up percentage number via `requestAnimationFrame` at +2% per frame until `targetPct`
4. Called with `80` on page load (after 600ms delay) and again on each new verification

**Grade pill row (`.dial-grade-row`):**
`.dial-grade-pill` — animated dot + "Ḥasan · Graded Reliable" — green border, green text.

**Stats row (`.dial-stats`):**
Three `.dial-stat` items:
- Sources: `4`
- Grade: `Ḥasan`
- Primary: `Ibn Mājah`

### 9.5 Narration Chain (Isnād)

`.chain-section` — max-width 820px, centered. Teal-tinted gradient background, `border-radius: 18px`.

**Chain label:** "Narration Chain (Isnād)" in small uppercase, with a horizontal line extending to the right via `::after`.

**Chain nodes (`.chain-nodes`):** Horizontal flex row (wraps on small screens).

Node types:
- `.cn-bubble.start` — "Prophet ﷺ" — teal-tinted, bolder, teal text — Originator
- `.cn-bubble` (default) — intermediate narrators — surface-card background
- `.cn-bubble.end` — "Ibn Mājah · 224" — gold-tinted, bold, gold text — Collector

Between nodes: `.chain-arrow` — "→" in `var(--ink-faint)`, 16px, `padding-bottom: 14px`

Below each bubble: `.cn-role` — 9px, uppercase, `var(--ink-subtle)` — e.g. "Originator", "Companion", "Tābiʿī", "Narrator", "Collector"

**Default chain (5 nodes for the sample hadith):**
1. Prophet ﷺ → Originator
2. Anas ibn Mālik → Companion
3. Hishām ibn ʿUmārah → Tābiʿī
4. Ḥafṣ ibn Sulaymān → Narrator
5. Ibn Mājah · 224 → Collector

**Hover on bubbles:** border darkens, subtle shadow appears.

### 9.6 Evidence Cards

`.evidence-grid` — 2×2 grid, max-width 820px. Collapses to 1 column at ≤ 680px. Four evidence types:

---

**Card 1 — Primary Source**
- Left border: `3px solid var(--gold-500)`
- Eyebrow class: `.ev-eye-primary` (gold-700)
- Contains: Arabic text (`.ev-arabic`) + English translation (`.ev-trans`) + source reference + grade badge
- Default: `طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ` / "Seeking knowledge is an obligation upon every Muslim." / Ibn Mājah · 224 / **Ḥasan**

---

**Card 2 — Supporting Narration**
- Left border: `3px solid var(--teal-400)`
- Eyebrow class: `.ev-eye-support` (teal-600)
- Contains: Arabic text + English translation (with contextual note) + source + grade badge
- Default: `اطْلُبُوا الْعِلْمَ وَلَوْ بِالصِّينِ` / "Seek knowledge, even unto China." / al-Bayhaqī / **Ḍaʿīf** — note explaining it cannot be used as primary evidence

---

**Card 3 — Scholarly Context**
- No left border accent
- Eyebrow class: `.ev-eye-context` (ink-subtle)
- Contains: prose analysis only (no Arabic) + scholar reference
- Default: Al-Nawawī and Ibn al-Qayyim clarification on scope of the obligation / Minhāj al-Ṭālibīn · al-Nawawī

---

**Card 4 — Qur'anic Basis**
- Left border: `3px solid var(--grade-hasan)`
- Eyebrow class: `.ev-eye-quran` (grade-hasan green)
- Contains: Arabic text + translation + Quranic reference + **Qur'anic** badge (Ṣaḥīḥ style)
- Default: `يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ` / "Allah will raise those who believe and those given knowledge, in degrees." / Qur'an · Al-Mujādilah 58:11 / **Qur'anic**

---

**Evidence card anatomy:**

- `.ev-eyebrow` — label row: `.ev-dot` (5px circle, `currentColor`) + category label
- `.ev-arabic` — `var(--font-arabic)`, `18px`, RTL, teal-700 text, teal-tinted bg, `border-radius: 8px`
- `.ev-trans` — `var(--font-serif)`, `14px`, italic, `var(--ink-muted)`
- `.ev-footer` — flex, space-between:
  - `.ev-ref` — source reference, uppercase, `var(--ink-subtle)`
  - `.ev-grade` — grade pill: `.grade-sahih` / `.grade-hasan` / `.grade-daif`

**Grade pill colors:**
- `.grade-sahih` — `var(--grade-sahih)` `#0F6E56`, green bg/border
- `.grade-hasan` — `var(--grade-hasan)` `#5D8A3A`, green-yellow bg/border
- `.grade-daif` — `var(--grade-daif)` `#A86932`, orange bg/border

### 9.7 Scholar Consensus Panel

`.consensus-section` — max-width 820px, centered.

`.consensus-card` (`.card`) — standard card with label + bar chart rows.

**Label:** "Scholar Consensus on Authenticity" — 10px, uppercase, `var(--ink-subtle)`.

**Scholar rows (`.cs-row` × 4):**

| Scholar | Bar fill | Width | Grade label | Class |
|---|---|---|---|---|
| Al-Albānī | `.cs-bar.hasan` | 80% | Ḥasan | `.cs-grade.h` |
| Ibn al-Qayyim | `.cs-bar.hasan` | 78% | Acceptable | `.cs-grade.h` |
| Ibn Ḥajar al-ʿAsqalānī | `.cs-bar.hasan` | 75% | Ḥasan li-Ghayrihi | `.cs-grade.h` |
| Al-Suyūṭī | `.cs-bar.sahih` | 82% | Ṣaḥīḥ | `.cs-grade.s` |

**Row anatomy:**
- `.cs-scholar`: `13px`, weight 500, `min-width: 160px`
- `.cs-bar-wrap`: `flex: 1`, `height: 8px`, teal-tinted bg track, `border-radius: 4px`
- `.cs-bar`: fills the track, gradient per grade, `transition: width 1s var(--ease-reverent)`
- `.cs-grade`: `10px`, uppercase, grade color, `min-width: 56px`, right-aligned

**Bar colors:**
- `.cs-bar.sahih`: `linear-gradient(90deg, var(--grade-sahih), #2CAB87)`
- `.cs-bar.hasan`: `linear-gradient(90deg, var(--grade-hasan), #8BBF5A)`

**Animation on verify:** Bars reset to `width: 0`, then after 100ms delay, restore to their target widths. The CSS `transition: width 1s var(--ease-reverent)` creates the fill animation.

### 9.8 Disclaimer

`.disclaimer` — max-width 820px, centered. `font-size: 12.5px`, `var(--ink-muted)`, `line-height: 1.65`. Teal-tinted left border (`3px`) and background.

**Content (fixed, never generated by AI):**
"⚠️ IslamicInfo does not issue fatwas or legal rulings. This analysis cites authenticated sources only and is for educational reference. For personal religious guidance, consult a qualified scholar. Confidence scores reflect scholarly consensus, not divine authority."

This text is hard-coded in the page template. It is never replaced or modified by the verification output.

### 9.9 Try Another Row

Below the disclaimer. Serif heading "Try another claim:" in `var(--ink-muted)`.

Five `.example-chip` pills — same style and `onclick="useChip(this)"` behavior as in §7.6:

| Chip text |
|---|
| `"The best among you are those who learn the Quran"` |
| `"Actions are by intentions"` |
| `"Make things easy, not difficult"` |
| `"A smile at your brother is sadaqah"` |
| `"Whoever believes in Allah should speak good or be silent"` |

---

## 10. How It Works Section

Background: `var(--surface-card)`. Standard `.section` padding.

### 10.1 Section Header

- Eyebrow: `Our Methodology`
- Title: `How ` + `<span class="gold-it">Verification Works</span>`
- Sub-text: "A transparent, source-first process rooted in classical hadith sciences — no opinions, no fabrications."

### 10.2 Three-Step Cards (`.how-grid`)

Three-column grid (collapses to 1 column at ≤ 720px). Each `.how-card` (`.card`) has:

- `.how-step-num` — large decorative number (52px, `var(--font-display)`, `rgba(0,105,110,.08)`, absolute top-right)
- `.how-icon` — 46×46px rounded square with teal gradient bg + icon SVG
- `.how-title` — `var(--font-serif)`, `18px`
- `.how-desc` — `13.5px`, `var(--ink-muted)`

**Card hover:** `.how-icon` transforms `scale(1.1) rotate(-5deg)`. Full card 3D tilt on mousemove (±5°/±7°), resets on mouseleave.

---

**Step 01 — Parse & Match**
- Icon: magnifier/search SVG
- Title: "Parse & Match"
- Description: "Your input is tokenised and matched against 61,000+ hadith in the six canonical collections (Kutub al-Sittah), plus Qur'anic text and classical commentaries."

---

**Step 02 — Apply Hadith Grading**
- Icon: people/scholars SVG
- Title: "Apply Hadith Grading"
- Description: "Each match is cross-referenced with classical scholar verdicts — al-Albānī, Ibn Ḥajar, al-Nawawī — to surface the established grade: Ṣaḥīḥ, Ḥasan, Ḍaʿīf, or Mawḍūʿ."

---

**Step 03 — Cite, Never Rule**
- Icon: shield/checkmark SVG
- Title: "Cite, Never Rule"
- Description: "We present sources, grades, narration chains, and scholarly context — then stop. We never issue a fatwa, personal ruling, or religious opinion. That role belongs to qualified scholars."

---

## 11. FAQ Accordion

Located below the How It Works cards within the same section. `margin-top: 40px`.

**Section heading:** "Frequently Asked Questions" — `var(--font-serif)`, `22px`, centered.

`.faq-section` — stacked list of `.faq-item` elements. No card wrapper — uses border-top and border-bottom dividers.

### 11.1 Five FAQ Items

**`toggleFaq(el)` behavior:**
1. Finds closest `.faq-item`
2. Closes all other open items (removes `.open`)
3. Toggles `.open` on the clicked item

**Open state:** `.faq-a` max-height transitions from `0` to `200px` (0.38s `ease-reverent`). `.faq-icon` rotates 45° (turns `+` into `×`) and gains teal-tinted background.

---

**Q1: What does "Ḥasan" mean?**
A: Ḥasan (Good/Sound) is the second-highest hadith grade. It means the chain is slightly weaker than Ṣaḥīḥ but still acceptable as evidence in Islamic law. Most scholars act upon Ḥasan hadith for deriving rulings.

---

**Q2: Why don't you give fatwas?**
A: Issuing legal rulings requires deep personal knowledge of the questioner's context, local custom (ʿurf), and current circumstance — none of which we can assess. Our role is to surface authenticated sources and let qualified scholars apply them.

---

**Q3: What collections do you reference?**
A: We cross-reference the six canonical collections: Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Jāmiʿ al-Tirmidhī, Sunan al-Nasāʾī, and Sunan Ibn Mājah — plus Musnad Aḥmad, al-Bayhaqī, and classical tafsir works.

---

**Q4: Can I verify a quote in Arabic?**
A: Yes. Switch the mode button to "Arabic" above the input box and paste the original Arabic text. Our system will attempt to match the exact wording and also search variant transmissions.

---

**Q5: What if a claim is not found?**
A: If a claim cannot be matched to any authenticated source, we report that result clearly — it may be fabricated (mawḍūʿ), apocryphal, or simply unrecorded. Absence of evidence is itself useful information.

---

## 12. CTA Section

Last section before the footer. CLAUDE.md §11 template.

### 12.1 Content

| Element | Value |
|---|---|
| Eyebrow | `✦ IslamicInfo · Free · Always · No Account` |
| H2 title | `Every Claim.` |
| H2 italic | `Verified.` (gold gradient text, inside `<em>`) |
| Sub-text | "Cross-reference any Islamic claim against 61,000+ authenticated hadith — no fabrications, no opinions, no ads." |

### 12.2 Three CTA Buttons

| Button | Class | href |
|---|---|---|
| Explore Qur'an (with book icon) | `.btn-primary` | `quran.html` |
| Hadith Library | `.btn-white-ghost` | `hadith.html` |
| Dua Library | `.btn-white-ghost` | `dua.html` |

### 12.3 Visual

Background: `linear-gradient(135deg, #0A3A3D, #00696E, #062628)`. Gold glow `::before` top-left, teal glow `::after` bottom-right.

---

## 13. Global Footer

**Uses `ft-` CSS class system from CLAUDE.md §7.1–7.4 verbatim.** The existing `ii-footer-*` classes in the mockup must be replaced.

### 13.1 Layout

Five-column grid (`2fr 1fr 1fr 1fr 1fr`). ≤ 1100px: 3 columns. ≤ 700px: 2 cols, brand spans full. ≤ 440px: 1 column.

### 13.2 Brand Column

- Logo: `Islamic` in `#5BC1C7`, `Info` in `#C5A059`
- Tagline: "A digital sanctuary for authentic Islamic knowledge — Qur'an, Hadith, Dua, and verified scholarship. Source-cited. Always free."
- Arabic verse: `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ — Hud · 11:88`

### 13.3 Column 1 — Page-Specific: Verify

Heading: `Verify`

| Link | href |
|---|---|
| Verify a Hadith | `verify.html` |
| Browse Hadith Library | `hadith.html` |
| Explore Qur'an | `quran.html` |
| Hadith Grading Guide | `hadith.html#grading` |
| About Our Methodology | `verify.html#methodology` |

### 13.4 Column 2 — Quick Access (identical every page, 8 links)

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

### 13.5 Column 3 — Our Ecosystem (§7.4 verbatim)

Heading: `Our Ecosystem`

| Display | URL |
|---|---|
| QuranlyAI ↗ | `https://quranlyai.com` |
| MosqueFinder ↗ | `https://mosquefinder.net` |
| TravellyAI ↗ | `https://travellyai.com` |
| LearnSpeakAI ↗ | `https://learnspeakai.com` |

⚠️ Common errors: `quranlya.com` (wrong — missing `i`), wrong display name casing.

### 13.6 Column 4 — Company + Legal

- About → `about.html`
- Contact → `contact.html`
- Privacy Policy → `privacy.html`
- Terms of Use → `terms.html`

### 13.7 Footer Bottom Bar

Left: `© 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources.`
Right (italic, muted): `All content source-verified · Privacy-first · Built with sincerity`

---

## 14. Verification Logic & Verdict States

### 14.1 Four Verdict Grades

| Grade | Arabic | English | Visual treatment |
|---|---|---|---|
| Ṣaḥīḥ | صحيح | Authentic | Green (`#0F6E56`), shield icon 🛡️ |
| Ḥasan | حسن | Good/Sound | Green-yellow (`#5D8A3A`), shield icon 🛡️ |
| Ḍaʿīf | ضعيف | Weak | Orange (`#A86932`), warning icon ⚠️ |
| Mawḍūʿ | موضوع | Fabricated | Red (`#B33A3A`), X icon ✗ |

### 14.2 Confidence Score Mapping

| Grade | Dial % range | Dial color dominant |
|---|---|---|
| Ṣaḥīḥ | 85–100% | Green-dominant gradient |
| Ḥasan | 60–84% | Gold-dominant gradient |
| Ḍaʿīf | 25–59% | Orange gradient |
| Mawḍūʿ | 0–24% | Red gradient |

### 14.3 Result Components per Verdict

| Component | Ṣaḥīḥ | Ḥasan | Ḍaʿīf | Mawḍūʿ |
|---|---|---|---|---|
| Verdict Banner | Green | Yellow-green | Orange | Red |
| Confidence dial | 85–100% | 60–84% | 25–59% | 0–24% |
| Narration chain | Shows | Shows | Shows (with weakness noted) | May not show |
| Evidence cards | Primary + supporting + context + Quranic | Primary + supporting + context + Quranic | Shows weak chain notes | Shows fabrication note |
| Scholar consensus | Shows | Shows | Shows objections | Shows fabrication rulings |
| Disclaimer | Always shown | Always shown | Always shown | Always shown |

### 14.4 "Not Found" State

When no match is found in the corpus:
- Verdict banner: muted grey, icon ❓
- Text: "No authenticated match found for this claim"
- Summary: "This claim could not be matched to any authenticated source in our corpus. It may be fabricated (mawḍūʿ), apocryphal, or simply not recorded in the collections we reference."
- Evidence cards: show only a "Not Found" card
- Disclaimer: always shown

### 14.5 Arabic Mode Behavior

When mode = `arabic`:
- Textarea: `direction: rtl; text-align: right; font-family: var(--font-arabic)`
- Placeholder text changes to: `أدخل النص العربي للحديث هنا…`
- Search algorithm: exact Arabic text matching first, then variant transmission search

---

## 15. Design System Tokens & Rules

All styling must use CLAUDE.md §1 CSS variables. No raw hex inline (SVG gradient `defs` excepted).

### Key Tokens

| Token | Value | Usage |
|---|---|---|
| `--teal-700` | `#00696E` | Primary brand, active states |
| `--gold-500` | `#C5A059` | Accent, gold chip-text |
| `--grade-sahih` | `#0F6E56` | Authentic verdict color |
| `--grade-hasan` | `#5D8A3A` | Sound verdict color |
| `--grade-daif` | `#A86932` | Weak verdict color |
| `--grade-mawdu` | `#B33A3A` | Fabricated verdict color |
| `--font-display` | Cormorant Garamond | Display numbers, titles |
| `--font-arabic` | Amiri | All Arabic text |
| `--font-serif` | Cormorant Garamond | Summaries, translations |
| `--ease-reverent` | `cubic-bezier(.22,1,.36,1)` | All hover transitions |

### Color Rules

- Never use raw hex inline — use tokens
- Dark mode is a **sibling** `[data-theme="dark"]` block — never merged
- No new colors invented

### Forbidden: No Shimmer

```css
/* ✗ BANNED per CLAUDE.md §27.4 */
.card::after { animation: shimmer ...; }
```

---

## 16. Interactions & Animations

| Element | Transform | Duration | Effect |
|---|---|---|---|
| How-step cards | `translateY(-5px) scale(1.012)` | 0.38s ease-reverent | Teal glow shadow |
| How-step icon | `scale(1.1) rotate(-5deg)` | 0.30s ease-reverent | Icon bounce |
| Evidence cards | `translateY(-5px) scale(1.012)` | 0.38s ease-reverent | Teal glow |
| Verify button | `translateY(-2px) scale(1.04)` | 0.25s ease-reverent | Stronger shadow |
| Side buttons | color + border-color shift | 0.22s ease-premium | Teal accent |
| Example chips | `translateY(-1px)` | 0.20s ease-premium | Teal fill + glow |
| Mode buttons | color + background | 0.20s | Teal tint |
| FAQ question row | color to `teal-700` | 0.20s | On hover |
| FAQ icon | `rotate(45deg)` | 0.25s | On open |
| Chain bubbles | border-color + shadow | 0.20s | On hover |
| Footer links | `translateX(4px)` | 0.18s | Left border teal |
| Nav links | `scale(1.05)` | 0.25s ease-premium | Glow ring |
| Confidence dial arc | `stroke-dashoffset` | 1.2s ease-reverent | On verify |
| Consensus bars | `width: 0 → target` | 1.0s ease-reverent | On verify |
| Results section | `opacity: 0 → 1` | 0.3s | On verify complete |
| Loading dots | `scale(0→1→0)` | 1.2s, staggered | During verify |

**3D tilt on How-step cards:**
- `mousemove` → `rotateX(±5°)` + `rotateY(±7°)` + hover lift
- Transition `0.08s` during move; `0.38s ease-reverent` on `mouseleave` reset

**Reveal on scroll:**
- Class `.reveal` → `opacity: 0; transform: translateY(28px)`
- `IntersectionObserver` at `threshold: 0.06` adds `.in`
- Stagger: `.reveal-d1` (+0.1s), `.reveal-d2` (+0.2s), `.reveal-d3` (+0.3s), `.reveal-d4` (+0.4s)

---

## 17. Responsive Breakpoints

CLAUDE.md §23:

| Breakpoint | Changes |
|---|---|
| ≤ 1100px | Nav-link 11.5px; footer 3-column |
| ≤ 900px | Nav-link 10.5px; brand 16px, brand-mark 28×28 |
| ≤ 860px | Result grid collapses to 1 column |
| ≤ 760px | Nav hidden; hamburger shown |
| ≤ 720px | How-grid collapses to 1 column |
| ≤ 700px | Footer 2-column; brand spans full |
| ≤ 680px | Evidence grid collapses to 1 column |
| ≤ 560px | Trust strip wraps to 2×2; verify-modes may wrap |
| ≤ 440px | Footer 1-column |

---

## 18. Routing & Linking Rules

**No `href="#"` in production.** Every interactive element routes to a real destination or triggers a real action.

| Element | Route / Action |
|---|---|
| Mode buttons (Hadith/Quote/Claim/Arabic) | `setMode(btn, mode)` — changes mode state and textarea behavior |
| Voice button | `pasteClipboard()` — reads clipboard, in production also `SpeechRecognition` |
| Sample button | `loadSample()` — cycles through 5 sample claims |
| Clear button | `clearInput()` — empties textarea, updates counter |
| Verify button | `runVerify()` — triggers loading + result animation |
| Example chips (both sets) | `useChip(el)` — pastes text, scrolls to verify box |
| FAQ question rows | `toggleFaq(el)` — opens/closes accordion |
| CTA "Explore Qur'an" | `quran.html` |
| CTA "Hadith Library" | `hadith.html` |
| CTA "Dua Library" | `dua.html` |
| Footer Quick Access | Correct page hrefs |
| Footer Ecosystem | External URLs `target="_blank" rel="noopener"` |

---

## 19. User Flows

### Flow 1 — Verify a Known Hadith

1. User lands on Verify page → hero and verify box visible immediately
2. User reads the default pre-filled claim in the textarea
3. Clicks "Verify Claim" → button shows "Verifying…", loading dots appear
4. After ~2.2s → results animate in: verdict banner (Ḥasan), confidence dial counts up to 80%
5. User reads summary, narration chain, evidence cards, and scholar consensus
6. Reads disclaimer at bottom
7. Clicks a "Try another claim" chip → textarea fills, user clicks Verify again

### Flow 2 — Paste from Social Media

1. User sees a suspicious quote shared on WhatsApp
2. Copies the text on their device
3. Clicks "Voice" button → clipboard paste fills textarea
4. Clicks "Verify Claim" → results appear
5. Verdict: Mawḍūʿ (fabricated) → red banner, low confidence dial, note about no source found
6. User shares the result link (in production) with the person who sent the quote

### Flow 3 — Verify Arabic Text

1. User switches mode to "Arabic" → textarea becomes RTL
2. Pastes Arabic hadith text
3. Clicks "Verify Claim" → system performs exact Arabic text match
4. Results appear with Arabic primary source card prominently displayed

### Flow 4 — Use Sample Claims

1. User wants to explore the system → clicks "Sample"
2. Textarea fills with sample claim #1
3. User clicks "Verify Claim" → results appear
4. User clicks "Sample" again → next sample loads
5. User explores all 5 samples to understand the system's capabilities

### Flow 5 — Read Methodology

1. User wants to understand how verification works
2. Scrolls past results to "How Verification Works" section
3. Reads all 3 methodology cards
4. Clicks FAQ questions to expand answers about hadith grades and the no-fatwa policy
5. User understands the source-only approach before using the tool

---

## 20. Acceptance Criteria Checklist

### Global Structure
- [ ] `<html lang="en" data-theme="light">` present
- [ ] Fonts: Cormorant Garamond, Inter, Amiri — preconnected and imported in order
- [ ] All 50+ CSS tokens in `:root` exactly as CLAUDE.md §1
- [ ] Dark mode `[data-theme="dark"]` sibling block — unmerged
- [ ] Body: Islamic geometric `background-image` at opacity 0.04
- [ ] `.ambient` radial glow div present, `.shell` wrapper present

### Header
- [ ] All **10** nav items in exact order
- [ ] `Verify` has `class="nav-link active"` with teal/gold underline indicator
- [ ] `knowledge-hub.html` at position 5 — never omitted
- [ ] `islamic-studies.html` used — never `learn.html`
- [ ] 4 header tools in order: search, EN, theme, admin
- [ ] Hamburger button present — visible only ≤ 760px — `onclick="openMM()"`
- [ ] Search popup `id="searchTrigger"` and `id="searchPopup"`: open, focus, close on Escape/outside
- [ ] Theme toggle `id="themeBtn"`, persists to `islamicinfo-theme` localStorage

### Mobile Menu
- [ ] All **10** nav links in correct order with correct hrefs
- [ ] `Verify` marked active (`.mm-link active`)
- [ ] `knowledge-hub.html` present — never omitted
- [ ] `islamic-studies.html` — never `learn.html`
- [ ] `openMM()` / `closeMM()` functions defined and working
- [ ] `Escape` key closes menu
- [ ] Fade + slide-in animation on open

### Hero
- [ ] Bismillah is first child of `.hero-inner`
- [ ] Light: teal gradient clip-text; Dark: gold gradient + drop-shadow
- [ ] H1 uses `var(--font-display)` with `<span class="grad-it">`
- [ ] 3 floating `.geo` SVGs with `geoRot` animation
- [ ] Hero-bg radial gradient with `bgD` animation

### Trust Strip
- [ ] 4 items: 61K+ Hadith · 6,236 Verses · 6 Collections · 100% Source-Cited
- [ ] Embedded in hero below sub-text
- [ ] Animated in with `fadeUp 0.7s delay 0.35s`
- [ ] Collapses to 2×2 at ≤ 560px

### Verify Box
- [ ] Rendered inside `.page-container` (max-width 1060px)
- [ ] `.reveal` entry animation
- [ ] Dark glass background with teal border and glow
- [ ] 4 mode buttons — "Hadith" active by default
- [ ] `setMode()` toggles `.on` class correctly
- [ ] Arabic mode: textarea becomes RTL, `font-family: var(--font-arabic)`
- [ ] Textarea: serif italic, 18px, transparent bg, correct placeholder
- [ ] Char counter updates live on every input event
- [ ] Voice button: reads clipboard, shows error on denial
- [ ] Sample button: cycles through 5 samples in order
- [ ] Clear button: clears textarea, updates counter, focuses
- [ ] Verify button: triggers `runVerify()` sequence
- [ ] Verify button: does nothing if textarea is empty
- [ ] Verify button: loading state (opacity 0.8, cursor wait, text "Verifying…")
- [ ] 5 quick example chips — `useChip()` fills textarea and scrolls to verify box

### Loading State
- [ ] Hidden by default (`display: none`)
- [ ] 3 animated dots with staggered `ldBounce` animation
- [ ] Loading text visible during 2200ms wait
- [ ] Hidden again when results appear

### Results Section
- [ ] Divider label: gold lines + "✦ Analysis Complete"
- [ ] Verdict banner: correct color variant for grade (hasan/sahih/daif)
- [ ] Verdict banner: icon + verdict label + title + badge all present
- [ ] Result grid: summary card (1.4fr) + dial card (1fr)
- [ ] Summary text: serif font, italic grade references
- [ ] Topic chips: teal and gold variants present
- [ ] Confidence dial: SVG arc animates from current offset to target on verify
- [ ] Dial counter: counts up from 0 to target percentage via rAF
- [ ] Dial grade pill: animated dot + grade text
- [ ] Dial stats row: Sources, Grade, Primary all populated
- [ ] Narration chain: 5 nodes — start bubble (teal) + 3 default + end bubble (gold)
- [ ] Chain arrows between nodes
- [ ] Evidence grid: 4 cards — Primary · Supporting · Context · Quranic
- [ ] Evidence cards: Arabic text, translation, source ref, grade badge all present
- [ ] Grade badges: correct color for each grade
- [ ] Scholar consensus: 4 scholars with bar fills and grade labels
- [ ] Consensus bars animate on verify (reset to 0, fill to target)
- [ ] Disclaimer: hard-coded text, always visible — never replaced by output
- [ ] Try Another row: 5 chips with `useChip()` behavior

### How It Works
- [ ] Background `var(--surface-card)`
- [ ] 3 methodology cards: Parse & Match · Apply Hadith Grading · Cite Never Rule
- [ ] Step numbers (01/02/03) as decorative background text
- [ ] Icon animates on card hover
- [ ] 3D tilt on mousemove, reset on mouseleave

### FAQ Accordion
- [ ] 5 FAQ items present with correct questions and answers
- [ ] `toggleFaq()` opens clicked item, closes others
- [ ] `.faq-icon` rotates 45° on open
- [ ] `.faq-a` max-height transition (0 → 200px) with padding

### CTA Section
- [ ] Last section before footer
- [ ] 3 buttons: Explore Qur'an → `quran.html` · Hadith Library → `hadith.html` · Dua Library → `dua.html`
- [ ] Correct eyebrow, title, sub-text
- [ ] `.reveal` on all child elements

### Footer
- [ ] Uses **`ft-`** CSS class system — NOT `ii-footer-*`
- [ ] Col 1 heading: "Verify" with 5 verify-specific links
- [ ] Col 2: Quick Access — all 8 destinations including `knowledge-hub.html`
- [ ] Col 3: Ecosystem — `quranlyai.com` · `mosquefinder.net` · `travellyai.com` · `learnspeakai.com`
- [ ] `quranlyai.com` — not `quranlya.com` (missing `i`)
- [ ] `LearnSpeakAI` — not `LearnSpeakAi`
- [ ] Col 4: Company + Legal with all 4 links
- [ ] Bottom bar: exact copyright string
- [ ] Footer link hover: `translateX(4px)` + left border teal

### Animations & Theme
- [ ] `.reveal` on all section content; stagger delays applied
- [ ] `IntersectionObserver` at `threshold: 0.06`
- [ ] All hover transitions: `var(--ease-reverent)` or `var(--ease-premium)`
- [ ] No shimmer `::after` sweep on any card
- [ ] Theme toggles correctly; persists across pages
- [ ] Dial animates on page load (after 600ms) and on each verification
- [ ] Tested in both light and dark mode
- [ ] All responsive breakpoints verified

---

*End of Verify Page Functional Document v1.0*
*IslamicInfo.org · CLAUDE.md v3.0 · Blueprint: `verify_enhanced.html`*
