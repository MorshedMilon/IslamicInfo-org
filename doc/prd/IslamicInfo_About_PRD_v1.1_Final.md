# Product Requirements Document
## IslamicInfo — About Page (`about.html`)
### Identity, Mission & Trust Engine

---

| Field | Value |
|---|---|
| **Document Type** | Product Requirements Document (PRD) |
| **Product** | IslamicInfo About Page |
| **Page File** | `about.html` (blueprint: `about_v3.html`) |
| **Design System** | CLAUDE.md v3.0 |
| **Functional Spec** | About_Page_Functional_Document_v1.md |
| **Visual Mockup** | `about_v3.html` — canonical source of truth |
| **Version** | 1.1 — Final (all review refinements applied) |
| **Date** | May 2026 |
| **Nav Position** | 10 of 10 — final item in global navigation |
| **v1.1 Changes** | H1 `<br>` tag documented · `.stat-item` reveal classes added · dual-observer pattern clarified (methodology + FAQ) · `.hero-inner` max-width added · mission quote card DOM structure corrected · rule-card stagger pattern clarified · FAQ stagger corrected (d1–d4) · hero-arabic fadeUp added to interactions · `easeOutCubic` documented in JS table · `openMM`/`closeMM` gap entries added · feature matrix `knowledge-hub.html` corrected to ✓ · US-009 escalated to P0 · all breakpoints in AC 6.14 · Methodology footer deep-link fixed · 31 total issues resolved |
| **Status** | APPROVED — Ready for Engineering Handoff |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview & Context](#2-product-overview--context)
3. [Page Architecture](#3-page-architecture)
4. [Wireframe Descriptions — Section by Section](#4-wireframe-descriptions)
   - 4.1 Global Header
   - 4.2 Hero Section
   - 4.3 Stats Banner
   - 4.4 Mission Section
   - 4.5 Non-Negotiable Rules
   - 4.6 Methodology Section
   - 4.7 Scholars Section
   - 4.8 Trusted Sources Section
   - 4.9 FAQ Accordion
   - 4.10 Contact / CTA Section
   - 4.11 Global Footer
5. [User Stories](#5-user-stories)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Feature Matrix](#7-feature-matrix)
8. [Interactions & Animations](#8-interactions--animations)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Design System Constraints](#10-design-system-constraints)
11. [JavaScript Functions & Events](#11-javascript-functions--events)
12. [Routing & Link Map](#12-routing--link-map)
13. [User Flows](#13-user-flows)
14. [Known Gaps & Build Priority](#14-known-gaps--build-priority)
15. [Functional Rules](#15-functional-rules)
16. [Out-of-Scope / Future Work](#16-out-of-scope--future-work)

---

## 1. Executive Summary

The About page (`about.html`) is IslamicInfo's identity, mission, and trust document. It is an **editorial page** — not a product feature page. It contains no interactive tools, no live data, and no user authentication. Its only interactive elements are the FAQ accordion, search popup, and theme toggle.

The page exists to answer one question for every new visitor: *"Can I trust this platform?"* It does so by:

- Stating the founding mission in plain language across four paragraphs
- Listing six non-negotiable editorial rules, enforced platform-wide
- Showing a 4-step content verification methodology with a vertical timeline
- Grounding authority in four named classical scholars with biographies
- Displaying all eight primary hadith sources by name
- Answering the five most common trust questions via a collapsible FAQ
- Providing a direct email contact for errors and corrections

**Core editorial rule:** Every statement on this page is a commitment, not marketing copy. The non-negotiable rules listed here govern every piece of content across the entire platform.

### Source Files

| File | Role |
|---|---|
| `about_v3.html` | Canonical visual blueprint — layout, color, spacing, copy, all JS logic |
| `About_Page_Functional_Document_v1.md` | Complete interaction and content specification |
| CLAUDE.md v3.0 | Global design tokens, component rules, enforcement checklist (held in memory) |

---

## 2. Product Overview & Context

### 2.1 Platform Position

IslamicInfo is a 10-page Islamic knowledge platform. The About page is position 10 — the final nav item.

| # | Label | File | Relationship to About Page |
|---|---|---|---|
| 1 | Home | `index.html` | Primary landing page |
| 2 | Quran Explorer | `quran.html` | Footer Quick Access link |
| 3 | Hadith Library | `hadith.html` | Footer Quick Access link |
| 4 | Islamic Studies | `islamic-studies.html` | ⚠️ NEVER `learn.html` |
| 5 | Knowledge Hub | `knowledge-hub.html` | ⚠️ NEVER omit — footer Quick Access |
| 6 | Daily Duas | `dua.html` | Footer Quick Access link |
| 7 | Tools | `tools.html` | Footer Quick Access link |
| 8 | Habit Tracker | `habits.html` | Footer Quick Access link |
| 9 | Verify | `verify.html` | Footer Quick Access link |
| **10** | **About** | **`about.html`** | **THIS PAGE — active** |

### 2.2 Page Nature

This is an **editorial trust page**, not a feature page. Key distinctions:

- No interactive tools (no tracker, no verification engine)
- No live data (all content is static editorial copy)
- No user authentication required
- No user state stored in localStorage (except theme preference via `islamicinfo-theme` key)
- `animateCount()` is the only data-driven element — reads HTML `data-target` attributes, not an API
- **Stat numbers (6,236 / 12,000+ / 300+ / 0) must be verified accurate at build time** — see §15 Rule 3

### 2.3 Core Constraints

- No fatwas or religious rulings issued anywhere — stated explicitly in Rule Card 3 and FAQ Q2
- `mailto:hello@islamicinfo.org` must reach a monitored inbox in production
- Dark mode fully supported via `[data-theme="dark"]` token overrides
- All three fonts must load: Cormorant Garamond · Inter · Amiri

---

## 3. Page Architecture

Top-to-bottom section order is **fixed**. No sidebars. Single-column layout, centred container (`max-width: 1200px`).

| Order | Section | Container / ID | Type | Description |
|---|---|---|---|---|
| 1 | Global Header | `.site-header` | Sticky / Global | 60px frosted glass. 10 nav links. Active: About (pos 10). |
| 2 | **Mobile Menu** ⚠️ | `#mobileMenu` | Overlay / Global | **Required addition** — missing from `about_v3.html`. Full-screen nav overlay. All 10 links. |
| 3 | Hero | `.hero` | Page-specific | Bismillah · Eyebrow · H1 · Sub-text · CTA buttons · Arabic verse. `min-height: 72vh`. |
| 4 | Stats Banner | `.stats-banner` | Full-width | 4 animated counters on dark teal gradient. No container constraint. |
| 5 | Mission | `.section.mission-section` | Content | 2-col grid: mission text (left) + north-star quote card (right). |
| 6 | Non-Negotiable Rules | `.section` (surface-card bg) | Content | 6-card editorial commitment grid. |
| 7 | Methodology | `.section` `id="methodology"` | Content | 4-step vertical timeline. Hero CTA anchor target. |
| 8 | Scholars | `.section` (surface-card bg) | Content | 4 scholar cards with avatar, biography, badge. |
| 9 | Trusted Sources | `.section` `id="sources"` | Content | 8 source pills with staggered entrance. Hero CTA anchor target. |
| 10 | FAQ | `.section` (surface-card bg) | Content | 5-item accordion. Dual observer pattern. |
| 11 | Contact / CTA | `.contact-section` | Conversion | Dark teal gradient. Email + back-to-home buttons. NOT `.cta-section`. |
| 12 | Global Footer | `#ii-footer` | Global | 5-col footer. ⚠️ **GAP**: uses `ii-footer-*` classes — must migrate to `ft-` system. |

---

## 4. Wireframe Descriptions

> All descriptions reference the canonical visual mockup: `about_v3.html`. The mockup defines the exact layout, color values, copy, component structure, and all JavaScript behavior. Where the mockup and functional spec differ, the mockup takes precedence.

---

### 4.1 Global Header

**Blueprint ref:** `about_v3.html` header — CLAUDE.md §4.3–4.4. Height: 60px. `position: sticky; top: 0; z-index: 100`.

**Three-zone layout:**

- **Left:** IslamicInfo SVG brand logo (`brand-mark` 34×34px) + text (`Islamic` in teal, `Info` in gold-500). `font-family: var(--font-display)`, 20px, weight 600.
- **Center:** 10 nav links. `About` is active. 12.5px Inter, `flex: 1`, `justify-content: center`, `flex-wrap: nowrap`, `overflow: hidden`.
- **Right:** 4 icon buttons. No hamburger in `about_v3.html` — **required addition** (see §14 Gap 1).

| Zone | Element | Detail |
|---|---|---|
| Left | Brand logo | Hover: `.star` element `star-spin` keyframe → `rotate(45deg) scale(1.15)`, 0.8s ease-reverent. `.halo` element `halo-pulse` → `opacity .25→.7`, 0.9s ease infinite. |
| Center | Active nav link | `About`: `color: var(--teal-700)`, `font-weight: 500`, 2px teal→gold gradient underline via `::after` pseudo-element (`bottom: -1px; left: 6px; right: 6px; height: 2px`). |
| Right | Search `id="searchTrigger"` | Opens `#searchPopup` (340px, `top: 44px; right: 0`). `e.stopPropagation()` → `classList.toggle('open')` → `setTimeout(() => sInput.focus(), 50)`. Closes: click outside, Escape. |
| Right | EN button | UI placeholder. 11px, weight 600. No i18n in v1.0. No action. |
| Right | Theme toggle `id="themeBtn"` | Toggles `[data-theme="dark"]` on `<html>`. Persists to `localStorage` key `islamicinfo-theme`. SVG swaps: moon (light mode) ↔ sun (dark mode). |
| Right | Admin icon | UI placeholder. No auth flow in v1.0. |
| Right | Hamburger ⚠️ | **Missing — must add.** `.icon-btn` visible ONLY at ≤ 760px. `onclick="openMM()"`. Hidden at wider viewports via `display:none` media query. |

**Header CSS:**
- Light: `background: rgba(250,251,251,.92); backdrop-filter: blur(24px) saturate(1.6)`
- Dark: `background: rgba(10,19,20,.92); border-bottom-color: rgba(0,105,110,.2)`
- Scrolled (`.scrolled` class at `scrollY > 16px`): `box-shadow: 0 1px 0 rgba(0,105,110,.10), var(--elev-1)`

---

### 4.2 Hero Section

**Blueprint ref:** `about_v3.html` `.hero` — CLAUDE.md §6. `min-height: 72vh`. `.hero-inner` max-width: `800px`, centered.

**Background:** `.hero-bg` — three radial gradients with `bgD` animation: `opacity 0.8→1, scale 1→1.04`, 18s ease-in-out infinite alternate.

**Four floating `.geo` SVG decorators** with `floatG` animation (`translateY(0 → -14px)`, 24s ease-in-out infinite):

| Class | Position | Shape | Stroke | Size | Opacity |
|---|---|---|---|---|---|
| `.g1` | `top:8%; left:4%` | Star polygon + circle | `#00696E` | 80×80px | 0.05 |
| `.g2` | `top:60%; left:3%` (inline style) | Rotated square | `#C5A059` | 44×44px | 0.04 |
| `.g3` | `top:10%; right:6%` | Star polygon | `#00696E` | 60×60px | 0.05 |
| `.g4` | `bottom:10%; right:10%` | Rotated star polygon | `#8A7036` | 38×38px | 0.04 |

**Content order inside `.hero-inner` (all centered, `text-align: center`):**

1. **Bismillah** — `class="bismillah-hero-top"`. Content: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`
   - Light: `linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%)` clip-text, opacity 0.92
   - Dark: `linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%)` + `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))`

2. **Eyebrow badge** — `class="hero-badge"` + `.badge-dot` (gold, pulse 2s). Text: `Our Mission`

3. **H1** — `class="hero-title"` — `var(--font-display)`, `clamp(46px,8.5vw,82px)`, weight 500:
   ```html
   Knowledge Without<br><span class="gradient-italic">Compromise</span>
   ```
   - ⚠️ The `<br>` tag is required — forces "Compromise" to a second line
   - `.gradient-italic` (also `.grad`): italic, `linear-gradient(90deg, var(--teal-700) 0%, var(--teal-500) 55%, var(--gold-500) 100%)` clip-text
   - Each word should be wrapped in `.hero-title-word.hwN` for `heroWordIn` stagger animation (`.hw1`–`.hw6`)

4. **Sub-text** — `class="hero-sub"`: *"We build IslamicInfo because authentic Islamic knowledge should be free, source-cited, and free of opinion. This is who we are and why we exist."*

5. **CTA row** — `class="hero-btns"` (flex, centered, gap 12px, wrap):

   | Button | Class | `href` |
   |---|---|---|
   | Our Methodology | `.btn-primary` | `#methodology` |
   | Trusted Sources | `.btn-ghost` | `#sources` |

6. **Arabic verse** — `class="hero-arabic"` with `style="margin-top:28px;"` inline:
   - Content: `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ` (partial — Hud 11:88. Full verse in Mission quote card)
   - `font-family: var(--font-arabic)`, `clamp(20px,3vw,28px)`, `direction: rtl`, `color: var(--teal-700)`, `opacity: .6`
   - Animation: `fadeUp .7s var(--ease-reverent) .15s both` (page load)
   - Dark: `color: rgba(88,224,229,.5)`

---

### 4.3 Stats Banner

**Blueprint ref:** `about_v3.html` `.stats-banner`. Immediately below hero. Full-width, no `.container` constraint.

**Layout:** CSS grid `repeat(4, 1fr)`, gap 24px. Background: `linear-gradient(135deg, var(--teal-900), #062628)`. `position: relative` (for `::before` orb). `::before`: pulsing radial teal glow, `orbPulse` keyframe (scale 1→1.08, opacity 0.5→1, 6s alternate, `inset: -40px`).

**At ≤ 700px:** `grid-template-columns: repeat(2, 1fr)`.

**`.stat-item` reveal classes (from mockup HTML):**

| # | `.stat-item` classes |
|---|---|
| 1 | `class="stat-item reveal"` |
| 2 | `class="stat-item reveal reveal-d1"` |
| 3 | `class="stat-item reveal reveal-d2"` |
| 4 | `class="stat-item reveal reveal-d3"` |

These are picked up by the general `_ro` IntersectionObserver (`threshold: 0.08`) AND by `statsObserver` (`threshold: 0.35`). The reveal class handles the fade-in; the stats observer triggers the count animation.

**Four stats — exact HTML `data-` attributes:**

| # | `data-target` | `data-suffix` | `data-comma` | Label | Behaviour |
|---|---|---|---|---|---|
| 1 | `6236` | `""` | `"true"` | `Qur'an Verses` | Counts 0 → 6,236 |
| 2 | `12000` | `"+"` | `"true"` | `Hadith Records` | Counts 0 → 12,000+ |
| 3 | `300` | `"+"` | `"false"` | `Verified Duas` | Counts 0 → 300+ |
| 4 | `0` | `""` | `"false"` | `Ads. Fatwas. Opinions.` | Displays `0` immediately — **no animation** |

> **Stat 4 semantic intent:** The zero is the statement — zero ads, zero fatwas, zero opinions exist on this platform. The label is what makes the stat meaningful.

**`animateCount(el, target, suffix, useComma, duration)` — exact logic:**

```js
// Guard — target === 0: set immediately, return
if (target === 0) { el.textContent = '0'; return; }

// Easing inner function
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// rAF loop: elapsed/duration → eased → current → formatted
// toLocaleString('en-US') when useComma = true
// suffix appended on every frame
// Final snap to exact target value with correct format
```

- Duration: `2800ms` — deliberately slow so every digit is readable
- Stagger: `i * 220ms` (0 / 220 / 440 / 660ms)
- `.counting` class added to `.stat-item` parent during animation → `color: var(--teal-500)` on `.stat-num`
- **One-time guard:** `statsAnimated` boolean + `statsObserver.disconnect()` — fires exactly once per page load

**Stat item anatomy:**
- `.stat-num` — `var(--font-serif)`, `clamp(32px,5vw,52px)`, weight 500, `color: white`, `line-height: 1`
- `.stat-label` — 11px, weight 600, `letter-spacing: .16em`, uppercase, `color: rgba(255,255,255,.4)`

---

### 4.4 Mission Section

**Blueprint ref:** `about_v3.html` `.section.mission-section`.

**Section header** (`.section-head.reveal`): eyebrow only — `"Why We Exist"`. No H2 title.

**`.mission-grid`:** `grid-template-columns: 1.2fr 1fr; gap: clamp(32px,5vw,64px); align-items: start`. Collapses to `grid-template-columns: 1fr` at ≤ 820px.

#### Left Column — Mission Text

Four paragraphs, each with `.reveal` class (no stagger on left column):

| Class | Exact Content |
|---|---|
| `.mission-lead.reveal` | "The internet is full of Islamic content. Very little of it tells you where it comes from." |
| `.mission-body.reveal` | "We built IslamicInfo because we were frustrated — frustrated by websites that quote hadith without references, by apps that mix authentic and fabricated narrations, by 'Islamic' content that is really just opinion dressed as scripture." |
| `.mission-body.reveal` | "Every single piece of content on this platform has a source. Every hadith carries its collection, book, and narrator chain grade. Every Qur'anic reference includes the surah and verse. Every dua links to its primary source." |
| `.mission-body.reveal` | "This is not a religious authority. We do not issue fatwas. We do not tell you what is halal or haram. We show you the primary sources and let you read for yourself." |

**Typography:**
- `.mission-lead`: `var(--font-serif)`, `clamp(20px,2.8vw,26px)`, weight 500, `color: var(--ink-primary)`, `line-height: 1.5`, `margin-bottom: 24px`
- `.mission-body`: `font-size: 15px`, `line-height: 1.78`, `color: var(--ink-muted)`, `margin-bottom: 20px`

#### Right Column — Mission Quote Card

**DOM structure (important — two nested levels):**

```html
<div class="reveal reveal-d1">          <!-- outer column div — gets the reveal -->
  <div class="mission-quote-card">      <!-- inner card — gets the style -->
    ...
  </div>
</div>
```

The **outer `<div>`** carries `class="reveal reveal-d1"` — this is what the `_ro` IntersectionObserver targets. The **inner `.mission-quote-card`** is purely a styled container with no reveal class of its own.

**`.mission-quote-card` style:**
- Background: `linear-gradient(135deg, rgba(0,105,110,.08), rgba(197,160,89,.06))`
- Border: `0.5px solid rgba(0,105,110,.15)`, `border-radius: 20px`, `padding: 28px`
- Dark: bg `rgba(0,105,110,.15)→rgba(197,160,89,.08)`, border `rgba(0,105,110,.25)`

**Card content (top to bottom):**

| Element | Exact Content | Style |
|---|---|---|
| `.mqc-arabic` | `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيۡهِ تَوَكَّلۡتُ وَإِلَيۡهِ أُنِيبُ` | `var(--font-arabic)`, `clamp(18px,2.5vw,24px)`, `direction: rtl`, `text-align: right`, `color: var(--teal-700)`, `line-height: 1.9` |
| `.mqc-quote` (1) | `"My success is not but through Allah. Upon Him I have relied, and to Him I return."` | `var(--font-serif)`, 15px, italic, `var(--ink-muted)`, `line-height: 1.68` |
| `.mqc-ref` | `Hud · 11:88` | 11px, weight 600, `letter-spacing: .12em`, uppercase, `var(--ink-subtle)` |
| `.mqc-divider` | Gold lines + `✦` star | `display: flex; align-items: center; gap: 10px; margin: 16px 0; opacity: .5` |
| `.mqc-quote` (2) | `"This verse is our north star — a reminder that sincerity of purpose, not scale of output, is what matters."` | Same as `.mqc-quote` (1) |

**`.mqc-divider` anatomy:** Two `.mqc-line` elements (`flex: 1; height: 0.5px; background: rgba(197,160,89,.4)`) flanking `.mqc-star` (`color: var(--gold-500); font-size: 10px`).

---

### 4.5 Non-Negotiable Rules Section

**Blueprint ref:** `about_v3.html` `.section` with `background: var(--surface-card)`.

**Section header:** eyebrow `Our Commitments` · H2: `Non-Negotiable <span class="gold-it">Rules</span>` · sub-text: *"These are not guidelines — they are hard constraints enforced throughout the platform."*

**`.principles-grid`:** `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px`.

**Six rule cards** — `.card.rule-card.reveal` with stagger. The stagger pattern **resets for row 2** — it does not continue to d3/d4/d5:

| # | Card classes | Icon | Icon class | Title | Description |
|---|---|---|---|---|---|
| 1 | `.card.rule-card.reveal` | 📚 | `.rr-teal` | Every Hadith Must Have a Source | Collection name, book number, and hadith number. If we cannot source it, we do not publish it. |
| 2 | `.card.rule-card.reveal.reveal-d1` | ⭐ | `.rr-gold` | Authenticity Grades Are Shown | Ṣaḥīḥ, Ḥasan, Ḍaʿīf — shown prominently, not hidden in fine print. |
| 3 | `.card.rule-card.reveal.reveal-d2` | 🚫 | `.rr-red` | No Fatwas. Ever. | We do not issue religious rulings. We present authenticated scholarship — you draw conclusions. |
| 4 | `.card.rule-card.reveal` | 🔒 | `.rr-teal` | No Ads. No Sponsors. | Advertising creates incentive misalignment with authentic knowledge. We reject it categorically. |
| 5 | `.card.rule-card.reveal.reveal-d1` | 🤝 | `.rr-gold` | No Sectarian Bias | We draw from across the major Sunni madhhabs and present multiple scholarly views where they exist. |
| 6 | `.card.rule-card.reveal.reveal-d2` | 🌐 | `.rr-teal` | Always Free | Access to authentic Islamic knowledge should not require a subscription. It never will on this platform. |

**Icon container styles:**
- `.rr-icon` — 44×44px, `border-radius: 14px`, `display: flex; align-items: center; justify-content: center`, `flex-shrink: 0`, `font-size: 20px`
- `.rr-teal` — `background: rgba(0,105,110,.10)`
- `.rr-gold` — `background: rgba(197,160,89,.10)`
- `.rr-red` — `background: rgba(179,58,58,.08)`

**Card entrance:** `ruleIn` keyframe (`opacity: 0; translateY(20px)` → visible), 0.9s ease-reverent. Triggered by `ruleObs` IntersectionObserver per card, `threshold: 0.10`.

**Card hover (CLAUDE.md §10 — no shimmer):** `translateY(-5px) scale(1.012)` + teal glow shadow + `border-color: rgba(0,105,110,.2)`.

---

### 4.6 Methodology Section

**Blueprint ref:** `about_v3.html` `.section` with `id="methodology"` — hero CTA anchor target.

**Section header:** eyebrow `How We Work` · H2: `Our <span class="gold-it">Methodology</span>`. No sub-text.

**`.method-steps`:** `display: flex; flex-direction: column; gap: 0`.

**Dual-observer animation pattern (important):** Each `.method-step` participates in **two** separate observers:
1. **`_ro` (general reveal)** — adds `.in` class. Each step has `.reveal` with stagger (`none / reveal-d1 / reveal-d2 / reveal-d3`).
2. **`methodObs`** — adds `.in-view` class. Triggers `stepSlideIn` keyframe (`translateX(-24px)` → visible). CSS nth-child stagger: 0s / 0.18s / 0.36s / 0.54s.

Both observers must fire for full entrance effect. The `.in-view` stagger via CSS nth-child takes precedence visually.

**Step grid:** `grid-template-columns: 56px 1fr; gap: 24px; padding: 28px 0`. Bottom border `0.5px solid rgba(0,105,110,.1)` separates steps — **last step (step 4) has no border**.

**Left column `.ms-left`:**
- `.ms-num` — 44×44px, `border-radius: 50%`, `background: linear-gradient(135deg, var(--teal-700), var(--teal-500))`, white text, `var(--font-serif)`, 18px, weight 500. Contains Arabic numeral.
- `.ms-line` — `width: 1.5px; background: linear-gradient(to bottom, rgba(0,105,110,.3), transparent); margin-top: 8px; flex: 1`. Gradient connector between steps.

**Right column `.ms-content`:**
- `.ms-title` — `var(--font-serif)`, 18px, weight 500, `color: var(--ink-primary)`, `margin-bottom: 8px`
- `.ms-desc` — 13.5px, `color: var(--ink-muted)`, `line-height: 1.65`

**Four methodology steps — exact content:**

| # | Arabic numeral | Title | Description |
|---|---|---|---|
| 1 | `١` | Primary Source First | Every piece of content begins with the primary text — Qur'anic verse, hadith collection, or classical scholarly work. We never begin with a conclusion and find sources afterward. |
| 2 | `٢` | Cross-Reference Authentication | Hadith are verified against authenticated collections: Bukhārī, Muslim, Abu Dawud, Tirmidhī, Nasāʾī, Ibn Mājah, and corroborated with grading from al-Albānī, Ibn Ḥajar, and al-Nawawī. |
| 3 | `٣` | Grade Display — Never Hidden | Authenticity grades (Ṣaḥīḥ, Ḥasan, Ḍaʿīf, Mawḍūʿ) are shown on every hadith card. Weak narrations are published with prominent warnings — not removed, which would hide the knowledge that a narration is weak. |
| 4 | `٤` | No Editorial Opinion | We do not add commentary, interpretation, or guidance beyond what classical scholars have established. The text speaks; we present it accurately. |

---

### 4.7 Scholars Section

**Blueprint ref:** `about_v3.html` `.section` with `background: var(--surface-card)`.

**Section header:** eyebrow `Scholarly Foundation` · H2: `Built on Classical <span class="gold-it">Scholarship</span>` · sub-text: *"Our content is grounded in the authenticated works of the classical hadith masters and jurists."*

**`.scholars-grid`:** `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px`.

**Four scholar cards** — `.card.scholar-card.reveal` with stagger (none / reveal-d1 / reveal-d2 / reveal-d3):

| # | Avatar | Name | Era | Description | Badge class | Badge label |
|---|---|---|---|---|---|---|
| 1 | `خ` | Imam al-Bukhārī | 194–256 AH | Author of Ṣaḥīḥ al-Bukhārī — the most authenticated collection of hadith. | `.sb-hadith` | Hadith Master |
| 2 | `م` | Imam Muslim | 204–261 AH | Author of Ṣaḥīḥ Muslim — second in authority only to al-Bukhārī. | `.sb-hadith` | Hadith Master |
| 3 | `ن` | Imam al-Nawawī | 631–676 AH | Shāfiʿī jurist and compiler of Riyāḍ al-Ṣāliḥīn and Arbaʿīn al-Nawawiyyah. | `.sb-classical` | Classical |
| 4 | `ا` | Sheikh al-Albānī | 1914–1999 | Foremost hadith grader of the modern era — Silsilat al-Ṣaḥīḥah and Ḍaʿīfah. | `.sb-hadith` | Hadith Master |

**Scholar card anatomy:**
- `.scholar-avatar` — 72×72px, `border-radius: 50%`, `background: linear-gradient(135deg, var(--teal-700), var(--teal-900))`, `margin: 0 auto 16px`, `var(--font-arabic)`, 24px, white
- `.scholar-name` — `var(--font-serif)`, 17px, weight 500, `color: var(--ink-primary)`
- `.scholar-era` — 11px, weight 600, `letter-spacing: .12em`, uppercase, `color: var(--gold-700)`, `margin-bottom: 8px`
- `.scholar-desc` — 12.5px, `color: var(--ink-muted)`, `line-height: 1.6`
- `.scholar-badge` — `display: inline-flex`, 9.5px, weight 700, uppercase, `letter-spacing: .12em`, `border-radius: 12px`, `padding: 3px 10px`, `margin-top: 10px`
  - `.sb-hadith` — `color: var(--teal-700); background: rgba(0,105,110,.08); border: 0.5px solid rgba(0,105,110,.18)` (dark: `color: var(--teal-300)`)
  - `.sb-classical` — `color: var(--gold-700); background: rgba(197,160,89,.08); border: 0.5px solid rgba(197,160,89,.2)`

**Card entrance:** `scholarIn` keyframe (`opacity: 0; translateY(32px) scale(.97)` → visible), 1.0s ease-reverent. `scholarObs` per card, `threshold: 0.15`. CSS nth-child stagger: 0s / 0.14s / 0.28s / 0.42s.

---

### 4.8 Trusted Sources Section

**Blueprint ref:** `about_v3.html` `.section` with `id="sources"` — hero ghost CTA anchor target.

**Section header:** eyebrow `Reference Library` · H2: `Trusted <span class="gold-it">Sources</span>` · sub-text: *"Every claim on this platform traces back to one of these authenticated works."*

**`.sources-grid.reveal`:** `display: flex; flex-wrap: wrap; gap: 10px`.
- The `.reveal` class is on the container only — picked up by `_ro` observer for container fade-in.
- Individual `.source-pill` elements get `.in-view` via `pillObs` with `i * 80ms` stagger (separate mechanism).

**Eight source pills:**

| # | Icon | Name | Type |
|---|---|---|---|
| 1 | 📗 | Ṣaḥīḥ al-Bukhārī | Primary hadith |
| 2 | 📘 | Ṣaḥīḥ Muslim | Primary hadith |
| 3 | 📙 | Sunan Abu Dawud | Sunan |
| 4 | 📕 | Jāmiʿ al-Tirmidhī | Sunan + Grading |
| 5 | 📔 | Sunan al-Nasāʾī | Sunan |
| 6 | 📓 | Sunan Ibn Mājah | Sunan |
| 7 | ⭐ | Silsilat al-Ṣaḥīḥah | al-Albānī grading |
| 8 | 🌙 | Riyāḍ al-Ṣāliḥīn | al-Nawawī compilation |

**Source pill anatomy:** `display: inline-flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 14px`.
- Background: `var(--surface-card)`, border: `0.5px solid rgba(0,42,44,.08)`
- Dark: `background: var(--white); border-color: rgba(0,105,110,.15)`
- `.sp-icon` — 18px emoji; `.sp-name` — 13px, weight 600, `var(--ink-primary)`; `.sp-type` — 11px, `var(--ink-muted)`

**Pill hover:** `translateY(-3px) scale(1.02)` + `box-shadow: 0 10px 28px rgba(0,105,110,.1)` + `border-color: rgba(0,105,110,.18)`. 0.35s ease-reverent.

**Pill entrance:** `pillIn` keyframe (`opacity: 0; scale(.92); translateY(10px)` → visible), 0.7s ease-reverent. `pillObs` watches `.sources-grid` container, `threshold: 0.15`. Each `.source-pill` gets `setTimeout(i * 80)` → `.in-view`.

---

### 4.9 FAQ Accordion

**Blueprint ref:** `about_v3.html` `.section` with `background: var(--surface-card)`.

**Section header:** eyebrow `Questions` · H2: `Frequently <span class="gold-it">Asked</span>`. No sub-text.

**`.faq-grid`:** `display: grid; gap: 12px; max-width: 760px; margin: 0 auto`.

**Dual-observer pattern (same as Methodology):** Each `.faq-item` participates in two observers:
1. **`_ro` (general reveal)** — adds `.in` class. Each item has `.reveal` with stagger.
2. **`faqObs`** — adds `.in-view` class, which overrides the opacity via CSS. Stagger via `setTimeout(i * 100ms)` + CSS nth-child `transition-delay`.

**Exact `.faq-item` classes from mockup HTML:**

| # | Classes |
|---|---|
| 1 | `class="faq-item reveal"` |
| 2 | `class="faq-item reveal reveal-d1"` |
| 3 | `class="faq-item reveal reveal-d2"` |
| 4 | `class="faq-item reveal reveal-d3"` |
| 5 | `class="faq-item reveal reveal-d4"` |

> Note: item 5 uses `reveal-d4` (not `reveal-d5`). The `.faq-item` base CSS sets `opacity: 0; transform: translateY(16px)` — the `.in-view` class overrides to `opacity: 1; transform: none`.

**Accordion behavior — exact JS logic:**

```js
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});
```

Net behavior: click open item → closes it. Click closed item → opens it, closes any other open.

**Open state changes:**
- `.faq-a` — `max-height` transitions `0 → 300px` (0.4s ease-reverent)
- `.faq-chevron` — `transform: rotate(180deg)` (0.3s ease-reverent)
- `.faq-item` — `border-color` → `rgba(0,105,110,.25)`

**Five FAQ items — exact questions and answers:**

| Q | Answer |
|---|---|
| Who is behind IslamicInfo? | IslamicInfo is built by a small team of Muslim developers and researchers who believe that authentic Islamic knowledge should be universally accessible. We are not a religious institution and do not issue scholarly opinions. |
| Do you issue fatwas or religious rulings? | No. Never. This is a hard constraint, not a policy. We present authenticated sources from classical scholarship. We do not tell you what is permissible or forbidden. For personal religious guidance, consult a qualified scholar in your community. |
| How do you verify hadith authenticity? | We cross-reference against the six major hadith collections (Kutub al-Sittah) and apply grading from recognized authorities including al-Albānī, Ibn Ḥajar al-ʿAsqalānī, and al-Nawawī. Grades are shown on every hadith — Ṣaḥīḥ, Ḥasan, Ḍaʿīf, or Mawḍūʿ. |
| Is IslamicInfo free? Will it stay free? | Yes and yes. Access to authentic Islamic knowledge is not something we will monetize. The platform has no ads, no premium tiers, and no paywalls. This is a founding commitment — not a promotional promise. |
| Can I suggest content or report an error? | Absolutely. If you find an error, a missing source, or a misattributed narration, please contact us. Accuracy is the mission — corrections are welcomed, not resented. |

**FAQ item anatomy:**
- `.faq-item` — `border: 0.5px solid rgba(0,105,110,.12); border-radius: 16px; overflow: hidden`. Base CSS: `opacity: 0; transform: translateY(16px)`.
- `.faq-q` — `display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; cursor: pointer; font-size: 15px; font-weight: 500; color: var(--ink-primary)`
- `.faq-chevron` — teal chevron SVG (18px), `path d="m6 9 6 6 6-6"`, `stroke-width: 2`. Rotates 180° when `.open`.
- `.faq-a` — `max-height: 0; overflow: hidden`. Child `<p>`: `padding: 0 22px 20px; font-size: 14px; color: var(--ink-muted); line-height: 1.7`
- Dark mode: `.faq-item { background: var(--white) }`

---

### 4.10 Contact / CTA Section

**Blueprint ref:** `about_v3.html` `.contact-section`. Class is **`.contact-section`** — NOT `.cta-section`. No `::before`/`::after` glow pseudo-elements (unlike the shared `.cta-section` pattern).

**Style:** `background: linear-gradient(135deg, var(--teal-900), #062628); padding: clamp(64px,10vw,112px) clamp(20px,5vw,56px); text-align: center; position: relative; overflow: hidden`.

| Element | Class | Exact Content |
|---|---|---|
| Eyebrow | `.cs-badge` | `✦ We'd Love to Hear From You` |
| Title | `.cs-title` | `Get in <em>Touch</em>` |
| Sub-text | `.cs-sub` | "Questions, corrections, collaboration ideas — reach out. We read everything." |

**`.cs-badge`:** 9.5px, weight 700, `letter-spacing: .18em`, uppercase, `color: #E2C896`, `background: rgba(197,160,89,.12)`, `border: 0.5px solid rgba(197,160,89,.25)`, `border-radius: 20px`, `padding: 7px 16px`, `margin-bottom: 22px`.

**`.cs-title`:** `var(--font-serif)`, `clamp(32px,6vw,56px)`, weight 500, `color: white`, `line-height: 1.06`. The `<em>` tag makes "Touch" italic.

**`.cs-sub`:** 16px, `color: rgba(255,255,255,.55)`, `max-width: 440px`, `margin: 0 auto 36px`.

**`.cs-actions`:** `display: flex; gap: 12px; justify-content: center; flex-wrap: wrap`.

| Button | Class | `href` | Icon |
|---|---|---|---|
| hello@islamicinfo.org | `.btn-primary` | `mailto:hello@islamicinfo.org` | Mail SVG 14px (`path d="M4 4h16c1.1 0 2 .9 2 2v12..."` + `polyline points="22,6 12,13 2,6"`) |
| Back to Home | `.btn-white-ghost` | `index.html` | None |

---

### 4.11 Global Footer

**Blueprint ref:** `about_v3.html` `#ii-footer`. ⚠️ **Current mockup uses `ii-footer-*` classes throughout. Production must migrate to `ft-` class system per CLAUDE.md §7.1.**

**Layout:** `grid-template-columns: 1.9fr 1fr 1fr 1fr 0.8fr; gap: clamp(24px,3vw,52px)`. Background: `#062628`.

Responsive: ≤1100px → 3-col · ≤700px → 2-col, brand column spans full width (`grid-column: 1/-1`) · ≤440px → 1-col.

**Col 1 — Brand (`ft-brand`):**
- Logo: `Islamic` in `#5BC1C7`, `Info` in `#C5A059`
- Tagline: *"A digital sanctuary for authentic Islamic knowledge — Qur'an, Hadith, Dua, and verified scholarship. Source-cited. Always free."*
- Arabic verse: `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ — Hud · 11:88`

**Col 2 — Page-specific About:**

Heading (`ft-col-h`): `About`

| Link (`ft-link`) | `href` | Note |
|---|---|---|
| Our Mission | `about.html` | |
| Meet the Team | `about.html` | ⚠️ GAP — no `team.html` yet. Update to `team.html` when created. |
| Contact Us | `contact.html` | ⚠️ GAP — `contact.html` must be created. |
| Methodology | `about.html#methodology` | ⚠️ Currently `about.html` in mockup — must add fragment. |

**Col 3 — Quick Access (8 links, identical every page — `knowledge-hub.html` confirmed present in `about_v3.html`):**

| Link | `href` |
|---|---|
| Quran Explorer | `quran.html` |
| Hadith Library | `hadith.html` |
| Islamic Studies | `islamic-studies.html` |
| Knowledge Hub | `knowledge-hub.html` |
| Daily Duas | `dua.html` |
| Islamic Tools | `tools.html` |
| Habit Tracker | `habits.html` |
| Verify a Claim | `verify.html` |

⚠️ All 8 required. `knowledge-hub.html` must never be omitted. `islamic-studies.html` — never `learn.html`.

**Col 4 — Our Ecosystem:**

| Display | URL |
|---|---|
| QuranlyAI ↗ | `https://quranlyai.com` |
| MosqueFinder ↗ | `https://mosquefinder.net` |
| TravellyAI ↗ | `https://travellyai.com` |
| LearnSpeakAI ↗ | `https://learnspeakai.com` |

⚠️ `quranlyai.com` — NOT `quranlya.com` (missing `i`). All: `target="_blank" rel="noopener"`. Display suffix: ` ↗`.

**Col 5 — Company / Legal:**

| Link | `href` |
|---|---|
| About | `about.html` |
| Contact | `contact.html` |
| *(margin-top: 16px divider before Legal)* | |
| Privacy Policy | `privacy.html` |
| Terms of Use | `terms.html` |

**Footer bottom bar:**
- Left (`ft-copy`): `© 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources.`
- Right (`ft-note`, italic Cormorant): `All content source-verified · Privacy-first · Built with sincerity`

**Footer link hover (`ft-link`):** `translateX(4px)` + `border-left-color: rgba(88,193,199,.4)` + `color: #88E0E5`. 0.18s.

---

## 5. User Stories

### 5.1 Trust Evaluation

**US-001 — Evaluate Platform Trust** `P0`

| Field | Detail |
|---|---|
| As a | Muslim user who discovered IslamicInfo and wants to assess whether to trust the content |
| I want to | Read who built the platform, what rules they follow, and what sources they use |
| So that | I can decide whether to rely on IslamicInfo for authentic Islamic knowledge |
| Notes | Primary flow: Hero → Stats → Mission → Methodology → Scholars → Sources → FAQ. All content must be factually accurate. No marketing embellishment. |

**US-002 — Confirm No Fatwas Issued** `P0`

| Field | Detail |
|---|---|
| As a | User who knows that issuing fatwas requires qualified scholarship |
| I want to | Find a clear, unambiguous statement that IslamicInfo does not issue fatwas |
| So that | I can use the platform as a research tool without confusing its content for scholarly rulings |
| Notes | Must appear explicitly in: Rule Card 3 ("No Fatwas. Ever.") AND FAQ Q2 ("No. Never. This is a hard constraint, not a policy."). Both must use direct language. |

**US-003 — Verify Free Forever Commitment** `P0`

| Field | Detail |
|---|---|
| As a | User concerned about monetization and paywalls |
| I want to | Read a clear statement that the platform has no ads, no premium tiers, and will always be free |
| So that | I can bookmark and share the platform without worrying about access being gated later |
| Notes | Addressed in: Stat 4 (0 Ads), Rule Card 4 (No Ads. No Sponsors.), Rule Card 6 (Always Free), FAQ Q4. |

### 5.2 Methodology Understanding

**US-004 — Understand Verification Methodology** `P1`

| Field | Detail |
|---|---|
| As a | Researcher or educator who wants to understand how IslamicInfo authenticates content |
| I want to | Click "Our Methodology" in the hero and be taken directly to the 4-step methodology section |
| So that | I can assess the scholarly rigor without reading the full page |
| Notes | Hero CTA `.btn-primary` `href="#methodology"` → smooth scroll via `scroll-behavior: smooth` on `html`. Section `id="methodology"` must be present. |

**US-005 — Identify the Primary Scholarly Sources** `P1`

| Field | Detail |
|---|---|
| As a | User with knowledge of Islamic scholarship |
| I want to | See which hadith collections and grading authorities IslamicInfo uses |
| So that | I can verify that the platform draws from the six canonical collections and recognized grading scholars |
| Notes | Addressed in three places: Methodology Step 2 (scholars named), Scholars Section (4 cards), Trusted Sources (8 pills with collection names). |

### 5.3 Contact & Reporting

**US-006 — Report a Content Error** `P1`

| Field | Detail |
|---|---|
| As a | User who found a misattributed hadith or sourcing error elsewhere on the platform |
| I want to | Find a contact email easily without hunting |
| So that | I can report the error without friction |
| Notes | Contact CTA is the last substantive section before the footer. `mailto:hello@islamicinfo.org` must open the user's mail client. Must reach a monitored inbox in production. |

### 5.4 Accessibility & Interaction

**US-007 — Toggle Dark Mode** `P1`

| Field | Detail |
|---|---|
| As a | User who reads late at night or in a dark environment |
| I want to | Toggle dark mode from the header |
| So that | All sections — stats banner, scholar cards, mission quote, FAQ — remain fully legible in dark mode |
| Notes | `id="themeBtn"` — persists to `localStorage` key `islamicinfo-theme`. Applied to `<html>` before first render to prevent flash of wrong theme. |

**US-008 — Use FAQ Accordion** `P1`

| Field | Detail |
|---|---|
| As a | User with a specific trust question about the platform |
| I want to | Click a FAQ question to expand its answer, and have all other items close automatically |
| So that | I can read the relevant answer without the page becoming cluttered with multiple open panels |
| Notes | `toggleFaq()` closes all others before opening target. Clicking an already-open item closes it (does not re-open). |

**US-009 — Navigate on Mobile** `P0`

| Field | Detail |
|---|---|
| As a | Mobile user on any device ≤ 760px wide |
| I want to | Access the full navigation menu via a hamburger button |
| So that | I can navigate to other platform pages without being stranded on the About page |
| Notes | **Currently broken** — hamburger and `#mobileMenu` are missing from `about_v3.html`. This is a P0 gap: without it, mobile users cannot navigate away from the page. Must be added before production launch. |

---

## 6. Acceptance Criteria

### 6.1 Global Structure

- [ ] `<html lang="en" data-theme="light">` present
- [ ] Fonts: Cormorant Garamond, Inter, Amiri — preconnected and imported in this exact order
- [ ] All 50+ CSS tokens in `:root` exactly as CLAUDE.md §1 — no omissions, no substitutions
- [ ] `[data-theme="dark"]` sibling block — **never merged** with `:root`
- [ ] Body: Islamic geometric `background-image` SVG at `opacity: 0.04`
- [ ] `.ambient` radial glow div present; `.shell` wrapper present
- [ ] Canonical token aliases (`--t7`, `--t9`, `--g5` etc.) stripped from production CSS — use full token names only

### 6.2 Header & Navigation

- [ ] All **10** nav items in exact order: Home → Quran Explorer → Hadith Library → Islamic Studies → Knowledge Hub → Daily Duas → Tools → Habit Tracker → Verify → About
- [ ] `About` carries `class="nav-link active"` — `color: var(--teal-700)`, weight 500, 2px teal→gold gradient `::after` underline
- [ ] `knowledge-hub.html` at position 5 — **never omitted**
- [ ] `islamic-studies.html` — **never `learn.html`**
- [ ] 4 header tools in order: search, EN, theme, admin
- [ ] **★ GAP: Hamburger button added** — `.icon-btn` visible ONLY at ≤ 760px — `onclick="openMM()"`
- [ ] Search popup `id="searchPopup"` (340px, `top:44px right:0`): opens on trigger click, auto-focuses after 50ms, closes on Escape/outside click/search button
- [ ] Theme toggle `id="themeBtn"`: persists to `islamicinfo-theme` key, swaps sun↔moon SVG, applied to `<html>` before render

### 6.3 Mobile Menu *(Gap — must be added)*

- [ ] `<div class="mobile-menu" id="mobileMenu">` placed immediately after `</header>`
- [ ] All **10** nav links in correct order with correct hrefs
- [ ] `About` marked active (`.mm-link.active`)
- [ ] `knowledge-hub.html` and `islamic-studies.html` present with correct hrefs
- [ ] `openMM()` adds `.open` to `#mobileMenu`; `closeMM()` removes `.open`
- [ ] Escape key closes menu: `document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMM(); })`
- [ ] `mmFade` keyframe animation (fade + slide-in from right, 0.3s) on open

### 6.4 Hero

- [ ] Bismillah is **first child** of `.hero-inner`
- [ ] Light mode: teal gradient clip-text, `opacity: .92`. Dark: gold gradient + `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))`
- [ ] H1 uses `var(--font-display)` with `<br>` tag between "Knowledge Without" and `<span class="gradient-italic">Compromise</span>`
- [ ] `.gradient-italic` span: italic, teal→gold gradient clip-text
- [ ] Each H1 word wrapped in `.hero-title-word.hwN` for `heroWordIn` stagger (`.hw1`–`.hw6`)
- [ ] Sub-text exact content matches §4.2
- [ ] Hero CTA: `.btn-primary` `href="#methodology"` and `.btn-ghost` `href="#sources"`
- [ ] Arabic verse: `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ` — Amiri, RTL, `opacity: .6`, `margin-top: 28px` (inline style); dark: `rgba(88,224,229,.5)`; animation: `fadeUp .7s .15s both`
- [ ] 4 `.geo` SVGs with `floatG` animation — correct positions, sizes, opacities per §4.2 table
- [ ] `.hero-bg` with `bgD` animation (18s ease-in-out infinite alternate)
- [ ] `.hero-inner` max-width: `800px`

### 6.5 Stats Banner

- [ ] 4 stat items in exact order with correct `data-target`, `data-suffix`, `data-comma` attributes
- [ ] Each `.stat-item` has `.reveal` class; stagger: item1=reveal, item2=reveal+d1, item3=reveal+d2, item4=reveal+d3
- [ ] Stat 4: `data-target="0"` — displays `0` immediately via guard, **no animation**
- [ ] `animateCount()` uses `easeOutCubic(t) = 1 - Math.pow(1 - t, 3)`, duration 2800ms
- [ ] Counters stagger at 220ms intervals per item index
- [ ] `statsAnimated` boolean guard + `statsObserver.disconnect()` — fires **once only**, even on repeated scroll
- [ ] `statsObserver` threshold: `0.35` on `.stats-banner`
- [ ] `.counting` class on `.stat-item` during animation → `color: var(--teal-500)` on `.stat-num`
- [ ] At ≤ 700px: grid → `repeat(2, 1fr)`
- [ ] `orbPulse` `::before` animation present and running on page load

### 6.6 Mission Section

- [ ] Section eyebrow only: `"Why We Exist"` — no H2 title element
- [ ] `.mission-grid` 2-col collapses to 1-col at ≤ 820px
- [ ] `.mission-lead` and 3 × `.mission-body` — exact content per §4.4 table, all with `.reveal` class
- [ ] Quote card: **outer column `<div>` has `class="reveal reveal-d1"`**; inner `.mission-quote-card` has the card styling
- [ ] Quote card: full Arabic verse (longer form including `ۚ عَلَيۡهِ تَوَكَّلۡتُ وَإِلَيۡهِ أُنِيبُ`), English translation, `Hud · 11:88` ref
- [ ] Both `.mqc-quote` paragraphs present
- [ ] `.mqc-divider` with two `.mqc-line` gold bars and `.mqc-star` `✦`, `opacity: .5`
- [ ] `.hero-arabic` has `margin-top: 28px` inline style

### 6.7 Non-Negotiable Rules

- [ ] Section background: `var(--surface-card)`
- [ ] Eyebrow: `Our Commitments`; H2: `Non-Negotiable Rules` with `.gold-it` on "Rules"
- [ ] 6 rule cards in correct order — icon, icon class, title, description per §4.5 table
- [ ] Stagger resets for row 2: cards 1/2/3 = reveal/d1/d2; cards 4/5/6 = reveal/d1/d2 (does **not** continue to d3/d4/d5)
- [ ] Rule 3 reads exactly: **"No Fatwas. Ever."**
- [ ] `.principles-grid` auto-fill, `minmax(280px, 1fr)`
- [ ] `ruleObs` per card at `threshold: 0.10` — triggers `ruleIn` entrance (0.9s ease-reverent)
- [ ] No shimmer `::after` on any card

### 6.8 Methodology Section

- [ ] Section has `id="methodology"` — hero "Our Methodology" CTA anchor target
- [ ] Eyebrow: `How We Work`; H2: `Our Methodology` with `.gold-it` on "Methodology"
- [ ] 4 method steps with Arabic numerals `١ ٢ ٣ ٤` in `.ms-num` circles
- [ ] `.ms-line` gradient connector below each number; **last step (٤) has no bottom border**
- [ ] Each step has `.reveal` with stagger (none/d1/d2/d3) for `_ro` observer
- [ ] `methodObs` per step at `threshold: 0.12` — adds `.in-view` for `stepSlideIn` animation
- [ ] **Both** `_ro` (`.reveal`) **and** `methodObs` (`.in-view`) observers fire on each step — dual-observer pattern
- [ ] CSS nth-child stagger on `.method-step.in-view`: 0s / 0.18s / 0.36s / 0.54s

### 6.9 Scholars Section

- [ ] Section background: `var(--surface-card)`
- [ ] 4 scholar cards in correct order: al-Bukhārī · Muslim · al-Nawawī · al-Albānī
- [ ] Correct Arabic initials in `.scholar-avatar`: `خ · م · ن · ا`
- [ ] Correct eras, descriptions, badge classes per §4.7 table
- [ ] `.sb-hadith` applied to cards 1, 2, 4; `.sb-classical` to card 3
- [ ] `scholarObs` per card at `threshold: 0.15` — `scholarIn` animation with CSS nth-child stagger 0s/0.14s/0.28s/0.42s

### 6.10 Trusted Sources

- [ ] Section has `id="sources"` — hero "Trusted Sources" CTA anchor target
- [ ] 8 source pills in correct order — icon, name, type per §4.8 table
- [ ] `.sources-grid` has `.reveal` class (container fade-in via `_ro`)
- [ ] `pillObs` at `threshold: 0.15` on `.sources-grid` — `setTimeout(i * 80)` adds `.in-view` to each pill
- [ ] Pill hover: `translateY(-3px) scale(1.02)` + shadow + `border-color: rgba(0,105,110,.18)`

### 6.11 FAQ Accordion

- [ ] 5 FAQ items with exact Q&A content per §4.9 table
- [ ] Exact `.faq-item` classes: item1=reveal, item2=reveal+d1, item3=reveal+d2, item4=reveal+d3, item5=reveal+d4
- [ ] **Both** `_ro` (`.reveal`) **and** `faqObs` (`.in-view`) observers fire on each item
- [ ] `toggleFaq()` closes all others before toggling target; clicking open item closes it
- [ ] `.faq-chevron` rotates 180° on `.open`; `.faq-a` max-height transitions 0→300px
- [ ] `faqObs` at `threshold: 0.08` on `.faq-grid` — `setTimeout(i * 100)` adds `.in-view`
- [ ] Section background: `var(--surface-card)`

### 6.12 Contact Section

- [ ] Class is `.contact-section` — **not** `.cta-section`
- [ ] **No** `::before`/`::after` glow pseudo-elements
- [ ] Eyebrow: `✦ We'd Love to Hear From You`
- [ ] Title: `Get in <em>Touch</em>` (`<em>` for italic "Touch")
- [ ] Sub-text exact match per §4.10
- [ ] Primary button: `href="mailto:hello@islamicinfo.org"` with mail SVG icon
- [ ] Ghost button: `href="index.html"` — "Back to Home" using `.btn-white-ghost`
- [ ] Background: `linear-gradient(135deg, var(--teal-900), #062628)`

### 6.13 Footer

- [ ] **★ GAP: Migrate all `ii-footer-*` classes to `ft-` system** per CLAUDE.md §7.1 (`ft-top`, `ft-brand`, `ft-col-h`, `ft-link`, `ft-bot`, `ft-copy`, `ft-note`)
- [ ] Col 2 heading: `About` with 4 links; "Methodology" link uses `about.html#methodology` (not bare `about.html`)
- [ ] Quick Access: all **8** destinations confirmed present — `knowledge-hub.html` verified in mockup ✓
- [ ] Ecosystem: `quranlyai.com` (NOT `quranlya.com`) · `mosquefinder.net` · `travellyai.com` · `learnspeakai.com`
- [ ] All ecosystem links: `target="_blank" rel="noopener"` + ` ↗` display suffix
- [ ] Col 5 Company/Legal: `margin-top: 16px` divider before Legal section
- [ ] Bottom bar: exact copyright string (left) + exact italic note (right)

### 6.14 Animations & Theme

- [ ] `_ro` IntersectionObserver (`threshold: .08`) fires `.in` on all `.reveal` elements — unobserves after firing
- [ ] Stagger delays: `.reveal-d1` (+0.12s) · `.reveal-d2` (+0.22s) · `.reveal-d3` (+0.32s) · `.reveal-d4` (+0.42s) · `.reveal-d5` (+0.52s)
- [ ] All hover transitions use `var(--ease-reverent)` or `var(--ease-premium)` — never raw `linear` or `ease-in-out`
- [ ] **No shimmer `::after` sweep on any card** (CLAUDE.md §27.4 — absolute)
- [ ] `floatG` geo animation running continuously on page load
- [ ] `bgD` hero-bg animation running continuously
- [ ] `orbPulse` stats banner glow animation running continuously
- [ ] `heroWordIn` H1 word animation fires on load (.hw1–.hw6, stagger 0.11s per word)
- [ ] Tested in both light and dark mode — all sections legible
- [ ] All breakpoints verified: **1100px** · **900px** · 820px · **760px** · 700px · 440px

---

## 7. Feature Matrix

| Feature | Section | Priority | Status | US |
|---|---|---|---|---|
| Bismillah (light: teal gradient / dark: gold + glow) | Hero | P0 | ✓ In mockup | US-001 |
| Word-by-word H1 animation (`heroWordIn`, `.hw1`–`.hw6`) | Hero | P1 | ✓ In mockup | — |
| 4 floating geo SVG decorators (`floatG`, 24s) | Hero | P1 | ✓ In mockup | — |
| Hero background radial animation (`bgD`, 18s) | Hero | P1 | ✓ In mockup | — |
| Smooth-scroll CTA → `#methodology` | Hero | P1 | ✓ In mockup | US-004 |
| Smooth-scroll CTA → `#sources` | Hero | P1 | ✓ In mockup | US-005 |
| Hero Arabic verse with `fadeUp` animation | Hero | P1 | ✓ In mockup | — |
| 4 animated stat counters with easeOutCubic | Stats | P0 | ✓ In mockup | US-001, US-003 |
| `animateCount()` — 2800ms, stagger 220ms | Stats | P0 | ✓ In mockup | — |
| Stat 4 = 0 immediate (no animation) | Stats | P0 | ✓ In mockup | US-003 |
| `statsAnimated` one-time guard | Stats | P0 | ✓ In mockup | — |
| `.stat-item` reveal classes (reveal, d1, d2, d3) | Stats | P1 | ✓ In mockup | — |
| Stats banner `orbPulse` glow (`::before`) | Stats | P1 | ✓ In mockup | — |
| 2-col mission grid (collapses at 820px) | Mission | P1 | ✓ In mockup | US-001 |
| North-star quote card (Hud 11:88, full verse) | Mission | P0 | ✓ In mockup | US-001 |
| `.mqc-divider` gold lines + `✦` star | Mission | P1 | ✓ In mockup | — |
| 6 non-negotiable rule cards (rule-stagger reset pattern) | Rules | P0 | ✓ In mockup | US-002, US-003 |
| `ruleIn` entrance animation per card | Rules | P1 | ✓ In mockup | — |
| 4-step methodology vertical timeline | Methodology | P1 | ✓ In mockup | US-004, US-005 |
| Arabic numeral step circles (١ ٢ ٣ ٤) | Methodology | P1 | ✓ In mockup | — |
| Dual-observer: `.reveal` + `stepSlideIn` | Methodology | P1 | ✓ In mockup | — |
| 4 scholar cards (avatars, eras, badges) | Scholars | P1 | ✓ In mockup | US-005 |
| `scholarIn` entrance (stagger 0.14s) | Scholars | P1 | ✓ In mockup | — |
| 8 trusted source pills | Sources | P1 | ✓ In mockup | US-005 |
| `pillIn` staggered entrance (80ms per pill) | Sources | P1 | ✓ In mockup | — |
| 5-item FAQ accordion | FAQ | P0 | ✓ In mockup | US-002, US-008 |
| FAQ closes-all-others + close-on-reclick | FAQ | P0 | ✓ In mockup | US-008 |
| Dual-observer: `.reveal` + `faqObs` `.in-view` | FAQ | P1 | ✓ In mockup | — |
| Contact email CTA (`mailto:`) | Contact | P1 | ✓ In mockup | US-006 |
| Dark mode (all sections) | Global | P1 | ✓ In mockup | US-007 |
| Theme persistence (`islamicinfo-theme`) | Global | P1 | ✓ In mockup | US-007 |
| Search popup (`#searchPopup`, 340px) | Header | P1 | ✓ In mockup | — |
| **Hamburger button** | Header | **P0** | ⚠️ **GAP** | US-009 |
| **Mobile menu (`#mobileMenu`, all 10 links)** | Header | **P0** | ⚠️ **GAP** | US-009 |
| **Footer `ft-` class migration** | Footer | P0 | ⚠️ **GAP** | — |
| `knowledge-hub.html` in Quick Access | Footer | P0 | ✓ In mockup | — |
| Footer "Methodology" deep-link (`#methodology`) | Footer | P1 | ⚠️ Fix required | — |
| `team.html` dedicated team page | Footer | P2 | 🔮 Future | — |
| `contact.html` dedicated contact page | Footer | P2 | 🔮 Future | — |
| Real site search (replacing `console.log` stub) | Header | P1 | 🔮 Future | — |

---

## 8. Interactions & Animations

| Element | Trigger | Animation | Duration / Easing |
|---|---|---|---|
| H1 words `.hw1`–`.hw6` | Page load | `heroWordIn` — `translateY(18px) skewY(.8deg) blur(3px)` → visible | 1.1s ease-reverent, stagger 0.11s per word |
| Hero badge, sub-text | Page load | `fadeUp` — `opacity:0; translateY(24px)` → visible | 0.6s / 0.7s ease-reverent with delays |
| Hero CTA buttons | Page load | `fadeUp` — delay 0.3s | 0.7s ease-reverent |
| **`.hero-arabic`** | **Page load** | **`fadeUp .7s var(--ease-reverent) .15s both`** | **0.7s ease-reverent, delay 0.15s** |
| Hero background `.hero-bg` | Continuous | `bgD` — `opacity 0.8→1; scale 1→1.04` | 18s ease-in-out infinite alternate |
| Geo decorators `.geo` | Continuous | `floatG` — `translateY(0 → -14px)` | 24s ease-in-out infinite |
| Stats banner `::before` orb | Continuous | `orbPulse` — `scale 1→1.08; opacity .5→1` | 6s ease-in-out infinite alternate |
| Stat counters (items 1–3) | Viewport enter (0.35) | `animateCount()` — easeOutCubic, stagger 220ms | 2800ms each |
| **Stat counter item 4** | **Viewport enter (0.35)** | **Guard: `target===0` → `textContent='0'` immediately. No rAF.** | **Instant** |
| Stat counter colour | During count | `.counting` class → `.stat-num` `color: var(--teal-500)` | Instant toggle |
| `.reveal` elements | Viewport enter (0.08) | `opacity 0→1; translateY(28px)→0` | 0.65s ease-reverent |
| `.reveal-d1`–`.reveal-d5` | On `.reveal` in | Stagger: +0.12s / +0.22s / +0.32s / +0.42s / +0.52s | Added to `transition-delay` |
| Rule cards | Viewport enter per card (0.10) | `ruleIn` — `opacity:0; translateY(20px)` → visible | 0.9s ease-reverent |
| Method steps (dual) | Viewport enter (0.12) | `stepSlideIn` — `opacity:0; translateX(-24px)` → visible | 1.0s ease-reverent, nth-child stagger 0/0.18/0.36/0.54s |
| Scholar cards | Viewport enter per card (0.15) | `scholarIn` — `opacity:0; translateY(32px) scale(.97)` → visible | 1.0s ease-reverent, nth-child stagger 0/0.14/0.28/0.42s |
| Source pills | Viewport enter on container (0.15) | `pillIn` — `opacity:0; scale(.92); translateY(10px)` → visible | 0.7s ease-reverent, `setTimeout` stagger 80ms each |
| FAQ items (dual) | Viewport enter on container (0.08) | CSS `opacity+translateY` via `.in-view`, nth-child stagger 0/0.1/0.2/0.3/0.4s | 0.7s ease-reverent, `setTimeout` 100ms each |
| FAQ accordion `.faq-a` | Click `.faq-q` | `max-height: 0 → 300px` | 0.4s ease-reverent |
| FAQ chevron | Click `.faq-q` | `rotate(0 → 180deg)` | 0.3s ease-reverent |
| Cards (all `.card`) | Hover | `translateY(-5px) scale(1.012)` + teal glow shadow + `border-color` | 0.38s ease-reverent |
| Source pills | Hover | `translateY(-3px) scale(1.02)` + `box-shadow: 0 10px 28px rgba(0,105,110,.1)` | 0.35s ease-reverent |
| Nav links | Hover | `scale(1.05)` + teal bg + glow ring | 0.25s ease-premium |
| `.btn-primary` | Hover | `translateY(-2px) scale(1.04)` + deeper shadow | 0.3s ease-premium |
| `.btn-ghost` | Hover | `translateY(-2px) scale(1.04)` + teal shadow | 0.3s ease-premium |
| Footer links | Hover | `translateX(4px)` + left `border-left-color` teal | 0.18s |
| Brand mark | Hover | `scale(1.06)` | 0.5s ease-reverent |
| Brand `.star` | Hover | `star-spin` → `rotate(45deg) scale(1.15)` | 0.8s ease-reverent, forwards |
| Brand `.halo` | Hover | `halo-pulse` → `opacity .25→.7` | 0.9s ease, infinite |

---

## 9. Responsive Breakpoints

| Breakpoint | Affected Components | Changes Applied |
|---|---|---|
| ≤ 1100px | Footer, Nav | Footer → 3-column. `nav-link` font-size 11.5px, padding 5px. |
| ≤ 900px | Nav, Brand | `nav-link` 10.5px, padding 5px 3px. Brand text 16px. `brand-mark` 28×28px. |
| ≤ 820px | Mission grid | `mission-grid` → `grid-template-columns: 1fr`. Quote card stacks below mission text. |
| ≤ 760px | Nav, Header | Nav hidden (`display:none`). Hamburger must appear (gap). Header tools reduced. |
| ≤ 700px | Stats banner, Footer | Stats → `repeat(2, 1fr)`. Footer → 2-col; brand column spans full width. |
| ≤ 440px | Footer | Footer → 1-column. |

---

## 10. Design System Constraints

### 10.1 Color Tokens (CLAUDE.md §1)

All styling uses CSS `var()` tokens. **No raw hex inline** (except in SVG gradient `<defs>` blocks).

| Token | Value | Usage on this page |
|---|---|---|
| `--teal-700` | `#00696E` | Active nav, eyebrows, `.ms-num` bg, `.scholar-avatar` bg, `.hero-arabic`, methodology lines |
| `--teal-500` | `#2CA4AB` | Gradient midpoints, `.counting` state color |
| `--teal-900` | `#0A3A3D` | Stats banner bg, `.contact-section` gradient start |
| `--gold-500` | `#C5A059` | `.badge-dot`, `.mqc-star`, `.rr-gold` icon bg accent |
| `--gold-700` | `#9A7C3F` | Scholar era labels, `.sb-classical` text, `.mqc-ref` |
| `--ink-primary` | `#0F2A2C` | Mission lead, rule titles, scholar names, method titles |
| `--ink-muted` | `#6D797A` | Mission body, descriptions, FAQ answers, source types |
| `--ink-subtle` | `#9DA8A9` | Source pill `.sp-type`, `.mqc-ref` |
| `--surface-card` | `#FAFBFB` | Rules/Scholars/FAQ section backgrounds, source pills |
| `--font-display` | Cormorant Garamond | Stat numbers (`.stat-num`) |
| `--font-serif` | Cormorant Garamond | Mission lead, method titles, scholar names, contact title, `.cs-title` |
| `--font-arabic` | Amiri | Bismillah, `.hero-arabic`, `.mqc-arabic`, scholar `.scholar-avatar` initials, `١٢٣٤` step numerals |
| `--ease-reverent` | `cubic-bezier(.22,1,.36,1)` | All card hover, entrance animations, FAQ transitions |
| `--ease-premium` | `cubic-bezier(.25,.46,.45,.94)` | Nav links, buttons, search popup |

### 10.2 Dark Mode Rule

`[data-theme="dark"]` block is a **sibling** to `:root` — **never merged**. Applied to `<html>` before first render to prevent flash of wrong theme.

```css
/* ✓ Correct */
:root { ... }
[data-theme="dark"] { ... }  /* sibling — never inside :root */
```

### 10.3 No-Shimmer Rule (CLAUDE.md §27.4)

```css
/* ✗ BANNED — absolutely forbidden on all cards */
.card::after { animation: shimmer ...; left: -100%; }
.card:hover::after { left: 150%; }
```

All card hover states use the glow shadow system only:
```css
.card:hover {
  transform: translateY(-5px) scale(1.012);
  box-shadow: 0 16px 40px rgba(0,105,110,.13),
              0 4px 12px rgba(0,105,110,.08),
              0 0 0 1px rgba(0,105,110,.07);
  border-color: rgba(0,105,110,.2);
  transition: all 0.38s var(--ease-reverent);
}
```

### 10.4 Blueprint Fidelity Rule

`about_v3.html` is the visual source of truth. Match font-size, padding, border-radius, box-shadow, transition curves, and exact color values. Do **not** clean up, modernize, restructure, or refactor visible elements. Static editorial copy is preserved verbatim.

---

## 11. JavaScript Functions & Events

All JS lives in a single `<script>` block at the bottom of `<body>` in `about_v3.html`.

| Function / Observer | Trigger / Signature | Description |
|---|---|---|
| `applyTheme(t)` | Called on load + `#themeBtn` click | Sets `data-theme` on `<html>`, saves to `localStorage`, swaps themeBtn SVG (moon in light / sun in dark). |
| Header scroll | `window 'scroll'` (passive) | Toggles `.scrolled` on `#siteHeader` when `scrollY > 16px`. |
| Search popup open | `#searchTrigger 'click'` | `e.stopPropagation()` → `classList.toggle('open')` → `setTimeout(() => sInput.focus(), 50)`. |
| Search popup close | `document 'click'` | Removes `.open` if click target is outside popup and not the trigger. |
| Search Escape | `sPopup 'keydown'` | `e.key === 'Escape'` → removes `.open`. |
| Search button | `.search-popup-btn 'click'` | `console.log('Search:', q)` *(dev stub — wire to real search in production)* → closes popup. |
| `_ro` IntersectionObserver | `threshold: .08`, all `.reveal` elements | Adds `.in` class on viewport intersection. Unobserves after firing. |
| `animateCount(el, target, suffix, useComma, duration)` | Called per stat on `statsObserver` fire | Inner `easeOutCubic(t) = 1 - Math.pow(1-t, 3)`. Guard: `target===0` → instant `'0'`. `toLocaleString('en-US')` when `useComma=true`. Appends suffix each frame. Final snap to exact formatted target. |
| `statsObserver` | `threshold: 0.35` on `.stats-banner` | Fires `animateCount()` for all 4 stats with `i * 220ms` stagger. **One-time**: `statsAnimated` boolean + `.disconnect()`. |
| `scholarObs` | `threshold: 0.15`, per `.scholar-card` | Adds `.in-view` to each scholar card. Unobserves after. |
| `methodObs` | `threshold: 0.12`, per `.method-step` | Adds `.in-view` to each method step. CSS nth-child handles stagger timing. |
| `ruleObs` | `threshold: 0.10`, per `.rule-card` | Adds `.in-view` to each rule card. |
| `pillObs` | `threshold: 0.15` on `.sources-grid` container | On container entry: `querySelectorAll('.source-pill').forEach((pill, i) => setTimeout(() => pill.classList.add('in-view'), i * 80))`. Unobserves container after. |
| `faqObs` | `threshold: 0.08` on `.faq-grid` container | On container entry: `querySelectorAll('.faq-item').forEach((item, i) => setTimeout(() => item.classList.add('in-view'), i * 100))`. Unobserves container after. |
| FAQ click handler | `querySelectorAll('.faq-item')` loop | Each `.faq-q` click: `wasOpen` check → `classList.remove('open')` from all → `if (!wasOpen) item.classList.add('open')`. |
| `openMM()` ⚠️ | `onclick` on hamburger button | **GAP — to add.** Adds `.open` to `#mobileMenu`. |
| `closeMM()` ⚠️ | Close button + Escape listener | **GAP — to add.** Removes `.open` from `#mobileMenu`. Escape key: `document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMM(); })`. |

---

## 12. Routing & Link Map

| Element | Route / Action | Notes |
|---|---|---|
| Hero "Our Methodology" | `#methodology` | Smooth-scroll via `scroll-behavior: smooth` on `html` |
| Hero "Trusted Sources" | `#sources` | Smooth-scroll |
| Header search trigger | `#searchPopup` toggle | `id="searchTrigger"` |
| Header theme toggle | `applyTheme()` | `id="themeBtn"` |
| Contact "hello@islamicinfo.org" | `mailto:hello@islamicinfo.org` | Must reach monitored inbox in production |
| Contact "Back to Home" | `index.html` | `.btn-white-ghost` |
| Footer col 2 "Our Mission" | `about.html` | |
| Footer col 2 "Meet the Team" | `about.html` → **`team.html`** | ⚠️ GAP — update when `team.html` is created |
| Footer col 2 "Contact Us" | `contact.html` | ⚠️ GAP — `contact.html` must be created |
| Footer col 2 "Methodology" | **`about.html#methodology`** | ⚠️ Currently `about.html` — fragment must be added |
| Footer Quick Access (8 links) | See §4.11 | All 8 required, confirmed present in mockup |
| Footer Ecosystem (4 links) | External URLs | `target="_blank" rel="noopener"` |

### Critical href Rules

| Rule | Correct | Forbidden |
|---|---|---|
| Islamic Studies | `islamic-studies.html` | `learn.html` |
| Knowledge Hub | Always present in nav (pos 5) + all footer Quick Access cols | Omitting it |
| QuranlyAI domain | `quranlyai.com` | `quranlya.com` (missing `i`) |
| LearnSpeakAI casing | `LearnSpeakAI` | `LearnSpeakAi` / `Learnspeakai` |
| Footer class system | `ft-` prefix after migration | `ii-footer-*` (legacy, current state) |
| Footer col 2 heading | `About` | Any generic heading |
| Methodology footer link | `about.html#methodology` | `about.html` (bare, without fragment) |

---

## 13. User Flows

### Flow 1 — First-Time Visitor Evaluating Trust

1. User lands from another IslamicInfo page, search engine, or external link
2. Hero: reads "Knowledge Without *Compromise*" + sub-text confirming no ads, no opinions
3. Stats banner enters viewport — counters animate: 6,236 · 12,000+ · 300+ · **0** (Ads. Fatwas. Opinions.)
4. Clicks "Our Methodology" CTA → smooth-scrolls to `#methodology`
5. Reads all 4 steps: Primary Source First → Cross-Reference → Grade Display → No Editorial Opinion
6. Scrolls to Scholars: recognises al-Bukhārī, Muslim, al-Nawawī, al-Albānī
7. Scrolls to Trusted Sources: sees all 8 collections named with icons
8. Scrolls to FAQ: expands Q2 "Do you issue fatwas?" → reads "No. Never."
9. Scrolls to Contact: sees `hello@islamicinfo.org`
10. Returns to platform with trust established

### Flow 2 — Researcher Verifying Methodology via Deep Link

1. User reaches `about.html#methodology` via a shared URL
2. Page loads and smooth-scrolls to Methodology section
3. Reads 4 methodology steps in detail
4. **Scrolls back up** to Stats Banner — notes 12,000+ hadith records and **0 ads**
5. Clicks "Trusted Sources" ghost button in hero → page smooth-scrolls to `#sources`
6. Reads all 8 source collections
7. Satisfied — returns to research

### Flow 3 — Reporting a Content Error

1. User found a misattributed hadith or sourcing error elsewhere on the platform
2. Opens About page to find contact information
3. Scrolls to bottom of page — Contact section is the last substantive section before the footer
4. Clicks `mailto:hello@islamicinfo.org` → mail client opens with pre-filled address
5. Sends correction to the team

### Flow 4 — Mobile User Quick Read *(Gap affects this flow)*

1. User opens About page on mobile (≤ 760px)
2. **Currently broken:** no hamburger button, no `#mobileMenu` — user cannot navigate away from the page
3. **After gap fix:** hamburger visible → tap → `#mobileMenu` slides in with all 10 nav links → user navigates
4. Stats banner shows in 2×2 grid layout — counter animation fires correctly
5. Mission grid: quote card stacks below mission text (820px breakpoint)
6. Rule cards: auto-fill grid flows to 1-column
7. Methodology: steps full-width
8. FAQ accordion: touch-friendly (tap `.faq-q` to expand; tap again to close)
9. Contact CTA buttons: flex wraps to single column at small widths

---

## 14. Known Gaps & Build Priority

Features defined in CLAUDE.md or the global standard that are **missing or incorrect** in `about_v3.html`. Build in this order:

### 🔴 High Priority — Required Before Production Launch

| # | Gap | Current State in `about_v3.html` | Required Fix |
|---|---|---|---|
| 1 | **Mobile menu missing** | No hamburger `.icon-btn`, no `#mobileMenu` overlay | Add `<button class="hamburger icon-btn" onclick="openMM()">` (3 `<span>` bars) to `.header-tools`; display only at ≤ 760px. Add `<div class="mobile-menu" id="mobileMenu">` immediately after `</header>` with all 10 nav links (`About` = `.mm-link.active`). Add `openMM()` / `closeMM()` JS functions. Add Escape listener. |
| 2 | **Mobile menu nav links** | Not present | All 10 links in correct order. `knowledge-hub.html` and `islamic-studies.html` with correct hrefs. `mmFade` animation (opacity 0→1 + translateX(20px)→0, 0.3s). |
| 3 | **Footer CSS class migration** | Uses `ii-footer-top`, `ii-footer-link`, `ii-footer-copy`, `ii-footer-note`, `ii-footer-brand-col`, `ii-footer-col-heading` throughout | Migrate to `ft-top`, `ft-link`, `ft-copy`, `ft-note`, `ft-brand`, `ft-col-h`, `ft-bot` per CLAUDE.md §7.1. |

### 🟠 Medium Priority — Fix Before v1.0 Stabilisation

| # | Gap | Required Fix |
|---|---|---|
| 4 | Footer "Meet the Team" links to `about.html` | Create `team.html` or add `id="team"` anchor section, then update link |
| 5 | Footer "Contact Us" links to `contact.html` | Create `contact.html` form page; verify it exists before launch |
| 6 | Footer "Methodology" uses bare `about.html` | Change to `about.html#methodology` |
| 7 | Search popup fires `console.log()` | Wire `.search-popup-btn` click to real site search in production |

### 🟢 Lower Priority — Polish Before v1.1

| # | Gap | Required Fix |
|---|---|---|
| 8 | Stats animation colour in dark mode | Verify `var(--teal-500)` (`#5BC1C7` in dark mode) is readable on the dark stats banner background |
| 9 | H1 word-by-word animation class assignment | Confirm each word in `<h1>` has `.hero-title-word.hwN` class in HTML; mockup CSS defines keyframes but HTML may lack the class assignment |
| 10 | `about_v3.html` shorthand CSS aliases | Mockup defines `--t7`, `--t9`, `--g5`, `--ink4` etc. as shorthand aliases. Strip from production CSS — use canonical CLAUDE.md §1 token names only |
| 11 | `data-final="0"` attribute on stat 4 | Attribute exists on stat 4 in mockup but `animateCount()` only reads `data-target`. `data-final` has no effect on current code — can be removed to reduce noise |

---

## 15. Functional Rules

1. **Source-cited only.** Every statement on this page — particularly stat figures, scholar references, and methodology claims — must be accurate and independently verifiable before publication.
2. **"No Fatwas" stated twice.** The phrase "We do not issue fatwas" or equivalent must appear in Rule Card 3 ("No Fatwas. Ever.") AND in FAQ Q2 ("No. Never. This is a hard constraint, not a policy."). Both must use direct, unambiguous language.
3. **Stat numbers must be accurate at build time.** 6,236 Qur'an verses, 12,000+ hadith, 300+ duas, 0 ads — must reflect actual platform content. Update `data-target` values before launch if numbers differ.
4. **Email address must be live.** `hello@islamicinfo.org` must reach a monitored inbox with a defined response SLA for corrections.
5. **No shimmer on cards.** CLAUDE.md §27.4 — absolute. All card hover states use the glow shadow system only.
6. **Design system strict.** No raw hex values inline (except SVG `<defs>`). No new font families. No invented colour tokens outside CLAUDE.md §1.
7. **Counter animation fires once only.** `statsAnimated` boolean + `statsObserver.disconnect()` prevents re-triggering when the user scrolls past the banner multiple times.
8. **FAQ toggle closes on second click.** Clicking an already-open FAQ item must close it. Confirmed by the `wasOpen` check before `classList.remove('open')` from all items.
9. **Smooth scroll via CSS.** `scroll-behavior: smooth` on `html` handles all `href="#anchor"` navigations. No JS `scrollIntoView()` override needed.
10. **Mobile menu Escape key.** `document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMM(); })` must be present once the hamburger gap is resolved.

---

## 16. Out-of-Scope / Future Work

| Item | Notes |
|---|---|
| `team.html` — dedicated Team page | Footer "Meet the Team" currently links to `about.html`. Requires authored team content, photos, and bios. |
| `contact.html` — dedicated Contact page | Contact CTA and footer link target `contact.html`. Create a form-based page or confirm `mailto:` is sufficient for the team's workflow. |
| Real site search | Current search popup fires `console.log('Search:', q)` only. Requires integration with a site search API or index. |
| Stats API integration | Stat counts (12,000+ hadith, 300+ duas) are hardcoded `data-target` attributes. At scale, wire to a CMS config or a JSON endpoint so numbers stay accurate without a code deploy. |
| Analytics — FAQ + CTA | No event tracking on FAQ opens or CTA clicks. Add to understand which questions users ask most and which CTAs convert. |
| Production email monitoring | Confirm `hello@islamicinfo.org` is actively monitored with an SLA for correction reports. |
| Cross-page theme persistence | `islamicinfo-theme` is read via `localStorage` on every page before render. Verify consistent implementation across all 10 pages to prevent theme flash. |
| Dark mode counter colour QA | `var(--teal-500)` resolves to `#5BC1C7` in dark mode. Run visual QA of the counting animation against the dark stats banner background to confirm readability. |

---

*End of Document — IslamicInfo About Page PRD v1.1 (Final)*

*Source files: `about_v3.html` · `About_Page_Functional_Document_v1.md` · CLAUDE.md v3.0*

*Nav position 10 · Editorial trust page · 9 user stories · 14 acceptance criteria groups · 3 high-priority gaps · 4 user flows · 31 review issues resolved*
