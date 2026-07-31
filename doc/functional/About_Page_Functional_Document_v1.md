# About Page — Functional Document v1.0

> Maintained by: IslamicInfo founding team
> Created: 2026-05-17
> Applies to: `about.html` · About — Our Mission page
> Design system: doc/DESIGN-SYSTEM.md v3.0
> Blueprint: `about_v3.html`

---

## 1. Product Purpose

The About page (`about.html`) is IslamicInfo's identity, mission, and trust document. It sits at **position 10** in the global navigation — the final item — and serves as the platform's statement of principles to users who want to understand *who* is behind the platform and *why* it exists.

Its purpose is to:
- Clearly state the founding mission: authentic Islamic knowledge, source-cited, free of opinion and advertising
- Enumerate the non-negotiable editorial rules that govern all content across the platform
- Show the 4-step methodology used to verify and publish every piece of content
- Ground the platform in classical Islamic scholarship by citing the specific scholars and hadith masters whose works form the reference library
- List every trusted primary source that the platform draws from
- Answer the most common trust questions via a FAQ accordion
- Provide a contact CTA for feedback, corrections, and collaboration

The About page is an editorial page, not a product feature page. It contains no interactive tools, no live data, and no user authentication. All interaction is limited to the FAQ accordion, search popup, and theme toggle.

**Core editorial rule:** Every statement on this page is a commitment, not marketing copy. The non-negotiable rules listed are enforced across the entire platform. The methodology described here governs how every hadith, verse, and dua is processed before publication.

All visual implementation must follow **doc/DESIGN-SYSTEM.md v3.0** exactly.

---

## 2. Primary User Goals

- Understand who built IslamicInfo and why it exists
- Confirm that the platform does not issue fatwas or religious rulings
- Verify which collections and scholars the platform draws from
- Read the editorial methodology to assess trustworthiness
- Find contact information for reporting errors or submitting feedback
- Assess whether the platform is free and will remain free

---

## 3. Page Layout — Section Map

Top-to-bottom order is fixed. No sidebars. Single-column layout with a centred container (`max-width: 1200px`).

```
┌──────────────────────────────────────────────────────┐
│  GLOBAL HEADER  (sticky, §4)                         │
├──────────────────────────────────────────────────────┤
│  HERO  (§5)                                          │
│  — Bismillah                                         │
│  — Eyebrow badge                                     │
│  — H1 title                                          │
│  — Sub-text                                          │
│  — CTA row (2 buttons)                               │
│  — Arabic verse                                      │
├──────────────────────────────────────────────────────┤
│  STATS BANNER  (§6)                                  │
│  — 4 animated counters                               │
├──────────────────────────────────────────────────────┤
│  MISSION SECTION  (§7)                               │
│  — 2-column: mission text (left) + quote card (right)│
├──────────────────────────────────────────────────────┤
│  NON-NEGOTIABLE RULES  (§8)                          │
│  — 6-card grid (surface-card background)             │
├──────────────────────────────────────────────────────┤
│  METHODOLOGY  (§9)                                   │
│  — 4-step vertical timeline                          │
├──────────────────────────────────────────────────────┤
│  SCHOLARS  (§10)                                     │
│  — 4-card grid (surface-card background)             │
├──────────────────────────────────────────────────────┤
│  TRUSTED SOURCES  (§11)                              │
│  — 8-pill flex grid                                  │
├──────────────────────────────────────────────────────┤
│  FAQ  (§12)                                          │
│  — 5-item accordion (surface-card background)        │
├──────────────────────────────────────────────────────┤
│  CONTACT / CTA  (§13)                                │
│  — Dark teal gradient section                        │
├──────────────────────────────────────────────────────┤
│  GLOBAL FOOTER  (§14)                                │
└──────────────────────────────────────────────────────┘
```

---

## 4. Global Navigation (Header)

### 4.1 Layout

Three-zone: **Logo (far-left) | Nav (center, flex:1) | Tools (far-right)**

Sticky at top (`position: sticky; top: 0; z-index: 100`). On scroll past 16px: `.scrolled` class adds bottom shadow (`box-shadow: 0 1px 0 rgba(0,105,110,.10), var(--elev-1)`).

### 4.2 Nav Items — All 10, Exact Order, Exact hrefs

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
| 9 | Verify | `verify.html` | |
| 10 | About | `about.html` | **`.active`** on this page |

Active page: `class="nav-link active"` — teal text (`var(--teal-700)`), weight 500, 2px teal→gold gradient underline via `::after` pseudo-element.

### 4.3 Header Tools (Right Side) — Exact Order

1. **Search icon** (`id="searchTrigger"`) → opens search popup overlay
2. **Language (EN)** → placeholder button, `11px`, weight 600
3. **Theme toggle** (`id="themeBtn"`) → sun/moon SVG, persists to `localStorage` key `islamicinfo-theme`
4. **Admin (user icon)** → placeholder circle/path SVG

No hamburger button in the current `about_v3.html` mockup — however per doc/DESIGN-SYSTEM.md §4.3, a hamburger button must be present and visible only at ≤ 760px with `onclick="openMM()"`. This is a **gap to fix** (see §15).

### 4.4 Search Popup

- `id="searchPopup"` — `position: absolute; top: 44px; right: 0; width: 340px`
- Placeholder: `"Search verses, hadiths, topics…"`, `aria-label="Site search"`, `id="searchPopupInput"`
- Opens on search icon click via `classList.toggle('open')`; auto-focuses input after 50ms
- Closes on: click outside · `Escape` key · Search button click
- Search button fires `console.log('Search:', q)` in mockup — wire to real search in production
- Dark mode: `background: rgba(15,27,29,.97); border-color: rgba(0,105,110,.3)`

### 4.5 Header CSS (doc/DESIGN-SYSTEM.md §4.4)

- Light: `background: rgba(250,251,251,.92); backdrop-filter: blur(24px) saturate(1.6)`
- Dark: `background: rgba(10,19,20,.92); border-bottom-color: rgba(0,105,110,.2)`
- Scrolled state: `box-shadow: 0 1px 0 rgba(0,105,110,.10), var(--elev-1)`
- Height: `60px` via `.header-inner` flex alignment

---

## 5. Hero Section

doc/DESIGN-SYSTEM.md §6 structure. `min-height: 72vh`, centered content.

### 5.1 Element Order (inside `.hero-inner`)

1. Bismillah — `class="bismillah-hero-top"`
2. Eyebrow badge — `class="hero-badge"` + `.badge-dot` (pulse animation)
3. H1 title — with gradient italic span
4. Sub-text — `class="hero-sub"`
5. CTA row — `class="hero-btns"`
6. Arabic verse — `class="hero-arabic"`

### 5.2 Content Values

| Element | Content |
|---|---|
| Bismillah | `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ` |
| Eyebrow | `Our Mission` |
| H1 — plain | `Knowledge Without` |
| H1 — italic gradient | `Compromise` (inside `<span class="gradient-italic">`) |
| Sub-text | "We build IslamicInfo because authentic Islamic knowledge should be free, source-cited, and free of opinion. This is who we are and why we exist." |
| Arabic verse | `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ` |

### 5.3 Bismillah Color Rules (doc/DESIGN-SYSTEM.md §5.1)

- **Light mode:** `linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%)` — teal clip-text, `opacity: .92`
- **Dark mode:** `linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%)` — gold clip-text, `opacity: 1`, `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))`

### 5.4 CTA Row Buttons

| Button | Class | href | Role |
|---|---|---|---|
| Our Methodology | `.btn-primary` | `#methodology` | Smooth-scrolls to methodology section |
| Trusted Sources | `.btn-ghost` | `#sources` | Smooth-scrolls to trusted sources section |

### 5.5 Arabic Verse Style

`.hero-arabic` — `font-family: var(--font-arabic)`, `font-size: clamp(20px, 3vw, 28px)`, `direction: rtl`, `text-align: center`, `color: var(--teal-700)`, `opacity: .6`, `margin-top: 28px`.

Dark mode: `color: rgba(88,224,229,.5)`.

This is the verse **Hud 11:88** — `"وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ"` — presented without English translation in the hero (translation appears in the mission quote card in §7).

### 5.6 Floating Geometry Decorators

Four `.geo` SVG elements with `floatG` animation (`translateY(0) → translateY(-14px)`, 24s ease-in-out infinite):

| Class | Position | Shape | Stroke | Size | Opacity |
|---|---|---|---|---|---|
| `.g1` | `top:8%; left:4%` | Star polygon + circle | `#00696E` | 80×80px | 0.05 |
| `.g2` | `top:60%; left:3%` | Rotated square | `#C5A059` | 44×44px | 0.04 |
| `.g3` | `top:10%; right:6%` | Star polygon | `#00696E` | 60×60px | 0.05 |
| `.g4` | `bottom:10%; right:10%` | Rotated star polygon | `#8A7036` | 38×38px | 0.04 |

Hero background: `.hero-bg` — three radial gradients, `animation: bgD 18s ease-in-out infinite alternate` (opacity 0.8 → 1, scale 1 → 1.04).

---

## 6. Stats Banner

Immediately below the hero. Dark teal gradient background, full-width.

### 6.1 Layout

`.stats-banner` — CSS grid, `repeat(4, 1fr)`, `gap: 24px`. Background: `linear-gradient(135deg, var(--teal-900), #062628)`. Has `::before` pseudo-element with pulsing radial teal glow (`orbPulse` keyframe, 6s alternate).

At ≤ 700px: `grid-template-columns: repeat(2, 1fr)`.

### 6.2 Four Stats — Exact Content

| Stat | `data-target` | `data-suffix` | `data-comma` | Label |
|---|---|---|---|---|
| 1 | `6236` | `""` | `true` | `Qur'an Verses` |
| 2 | `12000` | `"+"` | `true` | `Hadith Records` |
| 3 | `300` | `"+"` | `false` | `Verified Duas` |
| 4 | `0` | `""` | `false` | `Ads. Fatwas. Opinions.` |

### 6.3 Counter Animation — `animateCount()` Function

Fires once when the stats banner enters the viewport (`IntersectionObserver`, `threshold: 0.35`). Fires only once (`statsAnimated` boolean guard).

**Sequence:**
1. Each counter fires with a staggered delay: `i * 220ms` (0ms, 220ms, 440ms, 660ms)
2. Each counter adds `.counting` class to its `.stat-item` parent — temporarily changes `stat-num` color to `var(--teal-500)` during animation
3. `animateCount(el, target, suffix, useComma, 2800)`:
   - Uses `requestAnimationFrame`
   - Easing: `easeOutCubic(t) = 1 - Math.pow(1 - t, 3)` — starts fast, slows near target
   - Duration: `2800ms` — deliberately slow so every digit is readable
   - Formats number with `toLocaleString('en-US')` when `useComma === true`
   - Appends `suffix` to every rendered value
   - Final snap: sets exact target value after animation completes
4. **Special case:** `data-target="0"` — sets `textContent = '0'` immediately, no animation

**Stat 4 behaviour:** Intentionally stays at `0` — the label "Ads. Fatwas. Opinions." communicates that zero of these exist on the platform. The zero is the statement.

### 6.4 Stat Item Anatomy

- `.stat-num` — `font-family: var(--font-serif)`, `font-size: clamp(32px, 5vw, 52px)`, weight 500, `color: white`, `line-height: 1`
- `.stat-label` — `11px`, weight 600, `letter-spacing: .16em`, uppercase, `color: rgba(255,255,255,.4)`
- `.reveal` + stagger classes on each `.stat-item`

---

## 7. Mission Section

`.section.mission-section`. Standard section padding.

### 7.1 Section Header

- Eyebrow only: `Why We Exist` (no H2 title in this section — the mission text is the content)
- `class="section-head reveal"`, eyebrow: `class="section-eyebrow"`

### 7.2 Mission Grid Layout

`.mission-grid` — `grid-template-columns: 1.2fr 1fr; gap: clamp(32px, 5vw, 64px); align-items: start`.

At ≤ 820px: `grid-template-columns: 1fr` (single column, quote card moves below mission text).

### 7.3 Left Column — Mission Text

Four paragraphs, each with `.mission-body.reveal` class. The first paragraph uses `.mission-lead.reveal` for larger display sizing.

**Exact paragraph content:**

| Element | Content |
|---|---|
| `.mission-lead` | "The internet is full of Islamic content. Very little of it tells you where it comes from." |
| `.mission-body` (1) | "We built IslamicInfo because we were frustrated — frustrated by websites that quote hadith without references, by apps that mix authentic and fabricated narrations, by 'Islamic' content that is really just opinion dressed as scripture." |
| `.mission-body` (2) | "Every single piece of content on this platform has a source. Every hadith carries its collection, book, and narrator chain grade. Every Qur'anic reference includes the surah and verse. Every dua links to its primary source." |
| `.mission-body` (3) | "This is not a religious authority. We do not issue fatwas. We do not tell you what is halal or haram. We show you the primary sources and let you read for yourself." |

**Typography:**
- `.mission-lead`: `font-family: var(--font-serif)`, `font-size: clamp(20px, 2.8vw, 26px)`, weight 500, `line-height: 1.5`, `color: var(--ink-primary)`, `margin-bottom: 24px`
- `.mission-body`: `font-size: 15px`, `line-height: 1.78`, `color: var(--ink-muted)`, `margin-bottom: 20px`

### 7.4 Right Column — Mission Quote Card

`.mission-quote-card.reveal.reveal-d1` — gradient background card with the platform's north star verse.

**Card style:**
- Background: `linear-gradient(135deg, rgba(0,105,110,.08), rgba(197,160,89,.06))`
- Border: `0.5px solid rgba(0,105,110,.15)`, `border-radius: 20px`
- Padding: `28px`
- Dark mode: `linear-gradient(135deg, rgba(0,105,110,.15), rgba(197,160,89,.08)); border-color: rgba(0,105,110,.25)`

**Card anatomy (top to bottom):**

| Element | Content | Style |
|---|---|---|
| `.mqc-arabic` | `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيۡهِ تَوَكَّلۡتُ وَإِلَيۡهِ أُنِيبُ` | `var(--font-arabic)`, `clamp(18px,2.5vw,24px)`, RTL, `color: var(--teal-700)` |
| `.mqc-quote` (1) | `"My success is not but through Allah. Upon Him I have relied, and to Him I return."` | `var(--font-serif)`, `15px`, italic, `var(--ink-muted)` |
| `.mqc-ref` | `Hud · 11:88` | `11px`, weight 600, `letter-spacing: .12em`, uppercase, `var(--ink-subtle)` |
| `.mqc-divider` | Gold lines + `✦` star | Flex row, decorative divider |
| `.mqc-quote` (2) | `"This verse is our north star — a reminder that sincerity of purpose, not scale of output, is what matters."` | Same as `.mqc-quote` (1) |

**Divider anatomy:** `.mqc-divider` — `display: flex; align-items: center; gap: 10px; margin: 16px 0; opacity: .5`. Two `.mqc-line` elements (flex:1, 0.5px gold) flanking `.mqc-star` (`color: var(--gold-500); font-size: 10px`).

---

## 8. Non-Negotiable Rules Section

`.section` with `background: var(--surface-card)`. Contains the six hard editorial constraints enforced across the entire platform.

### 8.1 Section Header

- Eyebrow: `Our Commitments`
- Title: `Non-Negotiable ` + `<span class="gold-it">Rules</span>`
- Sub-text: `"These are not guidelines — they are hard constraints enforced throughout the platform."`

### 8.2 Principles Grid

`.principles-grid` — `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px`.

Six `.card.rule-card.reveal` elements with stagger delays (first 3: no delay, d1, d2; next 3: no delay, d1, d2).

### 8.3 Six Rules — Exact Content

Each rule card uses `.rule-row` (flex, `gap: 16px`, `align-items: flex-start`) containing `.rr-icon` + a div with `.rr-title` + `.rr-desc`.

| # | Icon | Icon class | Title | Description |
|---|---|---|---|---|
| 1 | 📚 | `.rr-teal` | Every Hadith Must Have a Source | Collection name, book number, and hadith number. If we cannot source it, we do not publish it. |
| 2 | ⭐ | `.rr-gold` | Authenticity Grades Are Shown | Ṣaḥīḥ, Ḥasan, Ḍaʿīf — shown prominently, not hidden in fine print. |
| 3 | 🚫 | `.rr-red` | No Fatwas. Ever. | We do not issue religious rulings. We present authenticated scholarship — you draw conclusions. |
| 4 | 🔒 | `.rr-teal` | No Ads. No Sponsors. | Advertising creates incentive misalignment with authentic knowledge. We reject it categorically. |
| 5 | 🤝 | `.rr-gold` | No Sectarian Bias | We draw from across the major Sunni madhhabs and present multiple scholarly views where they exist. |
| 6 | 🌐 | `.rr-teal` | Always Free | Access to authentic Islamic knowledge should not require a subscription. It never will on this platform. |

**Icon container styles:**
- `.rr-icon` — `44×44px`, `border-radius: 14px`, flex center
- `.rr-teal` — `background: rgba(0,105,110,.10)`
- `.rr-gold` — `background: rgba(197,160,89,.10)`
- `.rr-red` — `background: rgba(179,58,58,.08)`

**Rule card entrance animation:** `.rule-card.in-view` — `ruleIn` keyframe (`opacity: 0; translateY(20px)` → visible). Triggered by `ruleObs` IntersectionObserver (`threshold: 0.10`).

**Hover behaviour (standard card system):** `translateY(-5px) scale(1.012)`, teal glow shadow, `border-color: rgba(0,105,110,.2)`. No shimmer `::after` (doc/DESIGN-SYSTEM.md §27.4).

---

## 9. Methodology Section

`.section` with `id="methodology"` (target of the hero CTA link). Standard white background.

### 9.1 Section Header

- Eyebrow: `How We Work`
- Title: `Our ` + `<span class="gold-it">Methodology</span>`
- No sub-text

### 9.2 Method Steps Layout

`.method-steps` — `flex-direction: column; gap: 0`. Four `.method-step.reveal` elements with stagger delays (no delay, d1, d2, d3).

**Each step uses a 2-column grid:** `grid-template-columns: 56px 1fr; gap: 24px`. Separated by a `0.5px solid rgba(0,105,110,.1)` bottom border (last step has no border).

### 9.3 Step Anatomy

**Left column (`.ms-left`):**
- `.ms-num` — `44×44px` teal gradient circle, `border-radius: 50%`, white text, `var(--font-serif)`, Arabic numerals (١ ٢ ٣ ٤), `font-size: 18px`
- `.ms-line` — `width: 1.5px`, `background: linear-gradient(to bottom, rgba(0,105,110,.3), transparent)`, fills remaining height below the number circle

**Right column (`.ms-content`):**
- `.ms-title` — `var(--font-serif)`, `18px`, weight 500, `color: var(--ink-primary)`, `margin-bottom: 8px`
- `.ms-desc` — `13.5px`, `color: var(--ink-muted)`, `line-height: 1.65`

### 9.4 Four Methodology Steps — Exact Content

| # | Arabic numeral | Title | Description |
|---|---|---|---|
| 1 | `١` | Primary Source First | Every piece of content begins with the primary text — Qur'anic verse, hadith collection, or classical scholarly work. We never begin with a conclusion and find sources afterward. |
| 2 | `٢` | Cross-Reference Authentication | Hadith are verified against authenticated collections: Bukhārī, Muslim, Abu Dawud, Tirmidhī, Nasāʾī, Ibn Mājah, and corroborated with grading from al-Albānī, Ibn Ḥajar, and al-Nawawī. |
| 3 | `٣` | Grade Display — Never Hidden | Authenticity grades (Ṣaḥīḥ, Ḥasan, Ḍaʿīf, Mawḍūʿ) are shown on every hadith card. Weak narrations are published with prominent warnings — not removed, which would hide the knowledge that a narration is weak. |
| 4 | `٤` | No Editorial Opinion | We do not add commentary, interpretation, or guidance beyond what classical scholars have established. The text speaks; we present it accurately. |

### 9.5 Method Step Entrance Animation

`.method-step.in-view` — `stepSlideIn` keyframe (`opacity: 0; translateX(-24px)` → visible). Triggered by `methodObs` IntersectionObserver (`threshold: 0.12`). Staggered delays: child 1 = 0s, child 2 = 0.18s, child 3 = 0.36s, child 4 = 0.54s.

---

## 10. Scholars Section

`.section` with `background: var(--surface-card)`. Presents the four primary scholarly authorities whose grading and works underpin the platform.

### 10.1 Section Header

- Eyebrow: `Scholarly Foundation`
- Title: `Built on Classical ` + `<span class="gold-it">Scholarship</span>`
- Sub-text: `"Our content is grounded in the authenticated works of the classical hadith masters and jurists."`

### 10.2 Scholars Grid

`.scholars-grid` — `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px`.

Four `.card.scholar-card.reveal` elements with stagger delays (no delay, d1, d2, d3).

### 10.3 Four Scholars — Exact Content

| # | Avatar initial | Name | Era | Description | Badge |
|---|---|---|---|---|---|
| 1 | `خ` | Imam al-Bukhārī | `194–256 AH` | Author of Ṣaḥīḥ al-Bukhārī — the most authenticated collection of hadith. | `.sb-hadith` — Hadith Master |
| 2 | `م` | Imam Muslim | `204–261 AH` | Author of Ṣaḥīḥ Muslim — second in authority only to al-Bukhārī. | `.sb-hadith` — Hadith Master |
| 3 | `ن` | Imam al-Nawawī | `631–676 AH` | Shāfiʿī jurist and compiler of Riyāḍ al-Ṣāliḥīn and Arbaʿīn al-Nawawiyyah. | `.sb-classical` — Classical |
| 4 | `ا` | Sheikh al-Albānī | `1914–1999` | Foremost hadith grader of the modern era — Silsilat al-Ṣaḥīḥah and Ḍaʿīfah. | `.sb-hadith` — Hadith Master |

### 10.4 Scholar Card Anatomy

- `.scholar-avatar` — `72×72px`, `border-radius: 50%`, `background: linear-gradient(135deg, var(--teal-700), var(--teal-900))`, `margin: 0 auto 16px`, `font-family: var(--font-arabic)`, `font-size: 24px`, `color: white`
- `.scholar-name` — `var(--font-serif)`, `17px`, weight 500, `color: var(--ink-primary)`, `margin-bottom: 4px`
- `.scholar-era` — `11px`, weight 600, `letter-spacing: .12em`, uppercase, `color: var(--gold-700)`, `margin-bottom: 8px`
- `.scholar-desc` — `12.5px`, `color: var(--ink-muted)`, `line-height: 1.6`
- `.scholar-badge` — inline-flex, 9.5px, uppercase, `letter-spacing: .12em`, `border-radius: 12px`, `padding: 3px 10px`, `margin-top: 10px`
  - `.sb-hadith` — `color: var(--teal-700); background: rgba(0,105,110,.08); border: 0.5px solid rgba(0,105,110,.18)` (dark: `color: var(--teal-300)`)
  - `.sb-classical` — `color: var(--gold-700); background: rgba(197,160,89,.08); border: 0.5px solid rgba(197,160,89,.2)`

### 10.5 Scholar Card Entrance Animation

`.scholar-card.in-view` — `scholarIn` keyframe (`opacity: 0; translateY(32px) scale(.97)` → visible), `1s var(--ease-reverent)`. Triggered by `scholarObs` IntersectionObserver (`threshold: 0.15`). Staggered delays: child 1 = 0s, child 2 = 0.14s, child 3 = 0.28s, child 4 = 0.42s.

---

## 11. Trusted Sources Section

`.section` with `id="sources"` (target of the hero "Trusted Sources" ghost button). White background.

### 11.1 Section Header

- Eyebrow: `Reference Library`
- Title: `Trusted ` + `<span class="gold-it">Sources</span>`
- Sub-text: `"Every claim on this platform traces back to one of these authenticated works."`

### 11.2 Sources Grid

`.sources-grid.reveal` — `display: flex; flex-wrap: wrap; gap: 10px`. Eight `.source-pill` elements that pop in staggered via `pillIn` animation.

### 11.3 Eight Sources — Exact Content

| # | Icon | Source name | Type |
|---|---|---|---|
| 1 | 📗 | Ṣaḥīḥ al-Bukhārī | Primary hadith |
| 2 | 📘 | Ṣaḥīḥ Muslim | Primary hadith |
| 3 | 📙 | Sunan Abu Dawud | Sunan |
| 4 | 📕 | Jāmiʿ al-Tirmidhī | Sunan + Grading |
| 5 | 📔 | Sunan al-Nasāʾī | Sunan |
| 6 | 📓 | Sunan Ibn Mājah | Sunan |
| 7 | ⭐ | Silsilat al-Ṣaḥīḥah | al-Albānī grading |
| 8 | 🌙 | Riyāḍ al-Ṣāliḥīn | al-Nawawī compilation |

### 11.4 Source Pill Anatomy

`.source-pill` — `display: inline-flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 14px`.
- Background: `var(--surface-card)`, border: `0.5px solid rgba(0,42,44,.08)`
- Dark mode: `background: var(--white); border-color: rgba(0,105,110,.15)`
- `.sp-icon` — `font-size: 18px`
- `.sp-name` — `13px`, weight 600, `color: var(--ink-primary)`
- `.sp-type` — `11px`, `color: var(--ink-muted)`

**Hover:** `translateY(-3px) scale(1.02)`, `box-shadow: 0 10px 28px rgba(0,105,110,.1)`, `border-color: rgba(0,105,110,.18)`. Transition: `0.35s var(--ease-reverent)`.

### 11.5 Source Pill Entrance Animation

`pillIn` keyframe — `opacity: 0; scale(.92); translateY(10px)` → visible, `0.7s var(--ease-reverent)`. Triggered by `pillObs` IntersectionObserver (`threshold: 0.15`) watching the `.sources-grid` container. Each pill gets a `setTimeout` delay of `i * 80ms` for a cascading pop effect.

---

## 12. FAQ Accordion Section

`.section` with `background: var(--surface-card)`.

### 12.1 Section Header

- Eyebrow: `Questions`
- Title: `Frequently ` + `<span class="gold-it">Asked</span>`
- No sub-text

### 12.2 FAQ Grid Layout

`.faq-grid` — `display: grid; gap: 12px; max-width: 760px; margin: 0 auto`. Five `.faq-item` elements, each with `.reveal` + stagger classes.

### 12.3 Accordion Behavior — `toggleFaq()`

Each `.faq-item > .faq-q` has a `click` event listener (wired in `querySelectorAll('.faq-item')` loop):
1. Store `wasOpen = item.classList.contains('open')`
2. Remove `.open` from **all** `.faq-item` elements (closes any currently open item)
3. If `!wasOpen`, add `.open` to clicked item (open it)
4. Net effect: clicking an open item closes it; clicking a closed item opens it and closes any other

**Open state changes:**
- `.faq-a`: `max-height` transitions from `0` → `300px` (`transition: max-height .4s var(--ease-reverent), padding .3s`)
- `.faq-chevron`: rotates 180° (`transition: transform .3s var(--ease-reverent)`)
- `.faq-item`: `border-color` changes to `rgba(0,105,110,.25)`

### 12.4 Five FAQ Items — Exact Content

**Q1:** Who is behind IslamicInfo?
> IslamicInfo is built by a small team of Muslim developers and researchers who believe that authentic Islamic knowledge should be universally accessible. We are not a religious institution and do not issue scholarly opinions.

---

**Q2:** Do you issue fatwas or religious rulings?
> No. Never. This is a hard constraint, not a policy. We present authenticated sources from classical scholarship. We do not tell you what is permissible or forbidden. For personal religious guidance, consult a qualified scholar in your community.

---

**Q3:** How do you verify hadith authenticity?
> We cross-reference against the six major hadith collections (Kutub al-Sittah) and apply grading from recognized authorities including al-Albānī, Ibn Ḥajar al-ʿAsqalānī, and al-Nawawī. Grades are shown on every hadith — Ṣaḥīḥ, Ḥasan, Ḍaʿīf, or Mawḍūʿ.

---

**Q4:** Is IslamicInfo free? Will it stay free?
> Yes and yes. Access to authentic Islamic knowledge is not something we will monetize. The platform has no ads, no premium tiers, and no paywalls. This is a founding commitment — not a promotional promise.

---

**Q5:** Can I suggest content or report an error?
> Absolutely. If you find an error, a missing source, or a misattributed narration, please contact us. Accuracy is the mission — corrections are welcomed, not resented.

### 12.5 FAQ Item Anatomy

- `.faq-q` — flex row, space-between, `padding: 18px 22px`, `cursor: pointer`, `font-size: 15px`, weight 500, `color: var(--ink-primary)`
- `.faq-chevron` — teal chevron SVG icon (18px), `transition: transform .3s var(--ease-reverent)`, rotates 180° when `.open`
- `.faq-a` — `max-height: 0; overflow: hidden`, child `<p>` with `padding: 0 22px 20px; font-size: 14px; color: var(--ink-muted); line-height: 1.7`
- `.faq-item` container — `border: 0.5px solid rgba(0,105,110,.12); border-radius: 16px; overflow: hidden`
- Dark mode: `.faq-item { background: var(--white) }`

### 12.6 FAQ Entrance Animation

`.faq-item.in-view` — CSS `opacity: 1; transform: none` (base state is `opacity: 0; translateY(16px)`). Triggered by `faqObs` IntersectionObserver (`threshold: 0.08`) watching `.faq-grid`. Each item gets `setTimeout` delay of `i * 100ms`. Staggered `transition-delay` also set via CSS nth-child rules (0s, 0.10s, 0.20s, 0.30s, 0.40s).

---

## 13. Contact / CTA Section

`.contact-section` — not the standard `.cta-section` class, but visually identical in spirit. Dark teal gradient. No `::before` / `::after` glow pseudo-elements (unlike the standard CTA section). Full-width, `text-align: center`.

### 13.1 Style

- Background: `linear-gradient(135deg, var(--teal-900), #062628)`
- Padding: `clamp(64px, 10vw, 112px) clamp(20px, 5vw, 56px)`
- `position: relative; overflow: hidden`

### 13.2 Content Values

| Element | Class | Content |
|---|---|---|
| Eyebrow badge | `.cs-badge` | `✦ We'd Love to Hear From You` |
| Title | `.cs-title` | `Get in ` + `<em>Touch</em>` (italic) |
| Sub-text | `.cs-sub` | "Questions, corrections, collaboration ideas — reach out. We read everything." |

**`.cs-badge`:** `font-size: 9.5px`, weight 700, `letter-spacing: .18em`, uppercase, `color: #E2C896`, gold tinted background, `border-radius: 20px`, `padding: 7px 16px`.

**`.cs-title`:** `var(--font-serif)`, `clamp(32px, 6vw, 56px)`, weight 500, `color: white`, `line-height: 1.06`.

**`.cs-sub`:** `16px`, `color: rgba(255,255,255,.55)`, `max-width: 440px`, `margin: 0 auto 36px`.

### 13.3 Action Buttons

`.cs-actions` — `display: flex; gap: 12px; justify-content: center; flex-wrap: wrap`.

| Button | Class | href | Label |
|---|---|---|---|
| Email | `.btn-primary` | `mailto:hello@islamicinfo.org` | ✉ hello@islamicinfo.org |
| Back to Home | `.btn-white-ghost` | `index.html` | Back to Home |

The email button includes a mail SVG icon (14px, `viewBox="0 0 24 24"`).

---

## 14. Global Footer

### 14.1 Layout

`.ii-footer-top` — CSS grid, `grid-template-columns: 1.9fr 1fr 1fr 1fr 0.8fr; gap: clamp(24px, 3vw, 52px)`. Five columns.

Responsive:
- ≤ 1100px: `grid-template-columns: 1.4fr 1fr 1fr` (cols 4 and 5 wrap)
- ≤ 700px: `grid-template-columns: 1fr 1fr; .ii-footer-brand-col { grid-column: 1/-1 }`
- ≤ 440px: `grid-template-columns: 1fr`

> **Note:** The current `about_v3.html` uses the `ii-footer-*` CSS class system, not the newer `ft-` class system from doc/DESIGN-SYSTEM.md §7.1. Per doc/DESIGN-SYSTEM.md §7, all pages should use `ft-` classes. This is a **gap to fix** in the next build pass (see §15).

### 14.2 Brand Column (`.ii-footer-brand-col`)

- Logo: `Islamic` in `#5BC1C7`, `Info` in `#C5A059`
- Tagline: `"A digital sanctuary for authentic Islamic knowledge — Qur'an, Hadith, Dua, and verified scholarship. Source-cited. Always free."`
- Arabic verse: `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ — Hud · 11:88`

### 14.3 Column 1 — Page-Specific: About

Heading: `About`

| Link | href |
|---|---|
| Our Mission | `about.html` |
| Meet the Team | `about.html` |
| Contact Us | `contact.html` |
| Methodology | `about.html` |

### 14.4 Column 2 — Quick Access (identical every page — 8 links required)

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

⚠️ All 8 required. `knowledge-hub.html` must never be omitted. `islamic-studies.html` — never `learn.html`.

### 14.5 Column 3 — Our Ecosystem (doc/DESIGN-SYSTEM.md §7.4 verbatim)

Heading: `Our Ecosystem`

| Display | URL | rel |
|---|---|---|
| QuranlyAI ↗ | `https://quranlyai.com` | `noopener` |
| MosqueFinder ↗ | `https://mosquefinder.net` | `noopener` |
| TravellyAI ↗ | `https://travellyai.com` | `noopener` |
| LearnSpeakAI ↗ | `https://learnspeakai.com` | `noopener` |

⚠️ Common error: `quranlya.com` (wrong — missing `i`). All links use `target="_blank" rel="noopener"`.

### 14.6 Column 4 — Company + Legal

Heading: `Company`

| Link | href |
|---|---|
| About | `about.html` |
| Contact | `contact.html` |
| *(margin-top: 16px)* | |
| Privacy Policy | `privacy.html` |
| Terms of Use | `terms.html` |

### 14.7 Footer Bottom Bar

- Left (`.ii-footer-copy`): `© 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources.`
- Right (`.ii-footer-note`, italic): `All content source-verified · Privacy-first · Built with sincerity`

---

## 15. Design System Tokens & Rules

All styling uses doc/DESIGN-SYSTEM.md §1 CSS variables. No raw hex inline except in SVG gradient `<defs>` blocks.

### 15.1 Key Tokens Used on This Page

| Token | Value | Primary usage |
|---|---|---|
| `--teal-700` | `#00696E` | Active nav, eyebrows, teal icons, scholar avatar |
| `--teal-500` | `#2CA4AB` | Gradient midpoints, number circle gradient |
| `--gold-500` | `#C5A059` | Accent star, badge-dot, source star |
| `--gold-700` | `#9A7C3F` | Scholar era labels, `.sb-classical` text |
| `--teal-900` | `#0A3A3D` | Stats banner gradient, method number circle |
| `--ink-primary` | `#0F2A2C` | Mission lead, rule titles, scholar names |
| `--ink-muted` | `#6D797A` | Body text, descriptions, FAQ answers |
| `--ink-subtle` | `#9DA8A9` | Source types, `.mqc-ref` |
| `--surface-card` | `#FAFBFB` | Alternating section backgrounds, source pills |
| `--font-display` | Cormorant Garamond | Stat numbers |
| `--font-serif` | Cormorant Garamond | Mission lead, method titles, scholar names, contact title |
| `--font-arabic` | Amiri | Bismillah, Arabic verse, scholar initials, method step numbers |
| `--ease-reverent` | `cubic-bezier(.22,1,.36,1)` | All card hover + entrance animations |
| `--ease-premium` | `cubic-bezier(.25,.46,.45,.94)` | Nav links, buttons |

### 15.2 Color Rules

- Never use raw hex inline — use tokens (except SVG gradient `defs`)
- Dark mode is a **sibling** `[data-theme="dark"]` block — never merged with `:root`
- No new colors invented outside the token set

### 15.3 Forbidden: No Shimmer (doc/DESIGN-SYSTEM.md §27.4)

```css
/* ✗ BANNED — shimmer sweep on ::after */
.card::after { animation: shimmer ...; left: -100%; }
.card:hover::after { left: 150%; }
```

All card hover states use glow shadow system only.

---

## 16. Interactions & Animations

| Element | Trigger | Animation | Duration |
|---|---|---|---|
| Hero title words | Page load | `heroWordIn` — `translateY(18px) skewY(.8deg) blur(3px)` → visible | 1.1s, staggered by 0.11s per word (`.hw1`–`.hw6`) |
| Hero badge, sub-text, buttons | Page load | `fadeUp` — `opacity:0; translateY(24px)` → visible | 0.6–0.7s with delays |
| Hero background | Continuous | `bgD` — `opacity .8→1; scale 1→1.04` | 18s alternate |
| Geo decorators | Continuous | `floatG` — `translateY(0 → -14px)` | 24s ease-in-out |
| Stats banner orb | Continuous | `orbPulse` — `scale 1→1.08; opacity .5→1` | 6s alternate |
| Stat counters | Viewport enter | `animateCount()` — easeOutCubic, staggered | 2800ms each |
| Stat counters | During count | `.counting` class — `color: var(--teal-500)` on `.stat-num` | Instant |
| `.reveal` elements | Viewport enter | `opacity 0→1; translateY(28px)→0` | 0.65s ease-reverent |
| Stagger delays | On `.reveal` class | `.reveal-d1` (+0.12s), `.reveal-d2` (+0.22s), `.reveal-d3` (+0.32s), `.reveal-d4` (+0.42s), `.reveal-d5` (+0.52s) | — |
| Rule cards | Viewport enter | `ruleIn` — `opacity:0; translateY(20px)` → visible | 0.9s ease-reverent |
| Method steps | Viewport enter | `stepSlideIn` — `opacity:0; translateX(-24px)` → visible, staggered | 1.0s per step, 0.18s apart |
| Scholar cards | Viewport enter | `scholarIn` — `opacity:0; translateY(32px) scale(.97)` → visible, staggered | 1.0s per card, 0.14s apart |
| Source pills | Viewport enter | `pillIn` — `opacity:0; scale(.92); translateY(10px)` → visible, staggered | 0.7s per pill, 80ms apart |
| FAQ items | Viewport enter | CSS transition `opacity + translateY`, staggered 100ms each | 0.7s ease-reverent |
| FAQ accordion | Click on `.faq-q` | `.faq-a` max-height 0→300px; `.faq-chevron` rotate 180° | 0.4s + 0.3s ease-reverent |
| Cards (all) | Hover | `translateY(-5px) scale(1.012)` + teal glow shadow | 0.38s ease-reverent |
| Source pills | Hover | `translateY(-3px) scale(1.02)` + shadow | 0.35s ease-reverent |
| Nav links | Hover | `scale(1.05)` + teal background + glow ring | 0.25s ease-premium |
| Buttons primary | Hover | `translateY(-2px) scale(1.04)` + deeper shadow | 0.3s ease-premium |
| Footer links | Hover | `translateX(4px)` + left `border-left-color` teal | 0.18s |
| Brand mark | Hover | `scale(1.06)` | 0.5s ease-reverent |
| Brand star | Hover | `star-spin` — `rotate(0→45deg) scale(1.15)` | 0.8s |
| Brand halos | Hover | `halo-pulse` — `opacity .25→.7` | 0.9s infinite |

---

## 17. Responsive Breakpoints

doc/DESIGN-SYSTEM.md §23 global ladder applies:

| Breakpoint | Changes on About page |
|---|---|
| ≤ 1100px | Nav-link 11.5px, 5px padding; footer wraps to 3 columns |
| ≤ 900px | Nav-link 10.5px; brand 16px; brand-mark 28×28 |
| ≤ 820px | Mission grid → 1 column (quote card stacks below text) |
| ≤ 760px | Nav hidden; header tools reduced; hamburger must appear (see §15 Gaps) |
| ≤ 700px | Stats banner → 2×2 grid; footer → 2 columns; brand col spans full width |
| ≤ 440px | Footer → 1 column |

---

## 18. JavaScript Functions & Events

All JS lives in a single `<script>` block at the bottom of `<body>`.

| Function / Event | Description |
|---|---|
| `applyTheme(t)` | Sets `data-theme` attribute on `<html>`, saves to `localStorage`, swaps themeBtn SVG |
| Header scroll listener | `window.addEventListener('scroll')` — toggles `.scrolled` on `#siteHeader` at `scrollY > 16px` |
| Search popup listeners | Click on `#searchTrigger`, click-outside on `document`, `Escape` key on `#searchPopup`, click on `.search-popup-btn` |
| General `_ro` IntersectionObserver | `threshold: .08` — adds `.in` to all `.reveal` elements as they enter viewport |
| `animateCount(el, target, suffix, useComma, duration)` | Animates stat numbers with easeOutCubic over `duration`ms |
| `statsObserver` IntersectionObserver | `threshold: 0.35` on `.stats-banner` — fires once, triggers all 4 counter animations |
| `scholarObs` IntersectionObserver | `threshold: 0.15` — adds `.in-view` to `.scholar-card` elements |
| `methodObs` IntersectionObserver | `threshold: 0.12` — adds `.in-view` to `.method-step` elements |
| `ruleObs` IntersectionObserver | `threshold: 0.10` — adds `.in-view` to `.rule-card` elements |
| `pillObs` IntersectionObserver | `threshold: 0.15` on `.sources-grid` — staggered `setTimeout` adds `.in-view` to each `.source-pill` |
| `faqObs` IntersectionObserver | `threshold: 0.08` on `.faq-grid` — staggered `setTimeout` adds `.in-view` to each `.faq-item` |
| FAQ click handler | `querySelectorAll('.faq-item')` loop — each `.faq-q` click toggles `.open` on its parent `.faq-item`, closing all others |

---

## 19. User Flows

### Flow 1 — First-Time Visitor Evaluating Trust

1. User lands on About page from a link in another IslamicInfo page
2. Hero loads: "Knowledge Without *Compromise*" — reads sub-text confirming no ads and no opinions
3. Hero CTA: clicks "Our Methodology" → smooth-scrolls to methodology section
4. Reads all 4 methodology steps: primary source first, cross-reference, grade display, no editorial opinion
5. Scrolls to Scholars section: recognises Imam al-Bukhārī, Imam Muslim, al-Albānī
6. Scrolls to Sources: sees the complete reference library — all 8 hadith collections listed
7. Scrolls to FAQ: opens Q2 "Do you issue fatwas?" → confirmed: no
8. Scrolls to Contact: sees `hello@islamicinfo.org` for errors or questions
9. Decides to trust the platform — returns to Hadith Library or Quran Explorer

### Flow 2 — Researcher Checking Methodology

1. User reaches About page via `about.html#methodology` deep link from a shared URL
2. Page loads, smooth-scrolled directly to Methodology section
3. Reads 4 steps in detail
4. Scrolls back up to see the Stats Banner — notes 12,000+ hadith records and 0 ads
5. Clicks "Trusted Sources" in hero via scroll-down → sees all 8 source collections
6. Satisfied — returns to their research

### Flow 3 — Reporting an Error

1. User found a misattributed hadith elsewhere on the platform
2. Comes to About page to find contact info
3. Scrolls to Contact section at bottom
4. Clicks `hello@islamicinfo.org` → opens mail client with pre-filled address
5. Sends correction

### Flow 4 — Mobile User Quick Read

1. User opens About page on mobile
2. Nav is hidden — hamburger must be available (gap in current mockup — see §20)
3. Stats banner shows in 2×2 layout — counter animation fires correctly
4. Mission section stacks: quote card below mission text
5. Scholars grid flows to 2 columns auto-fill
6. Source pills wrap naturally
7. FAQ accordion is touch-friendly (tap `.faq-q` to expand)
8. Contact CTA buttons wrap to single column

---

## 20. Gaps in Current Mockup (Build Priority Order)

The following features are defined in doc/DESIGN-SYSTEM.md or required by the global standard but are missing or incorrect in `about_v3.html`. Build in this order:

### 🔴 High Priority — Fix These First

| # | Gap | Current state | Required fix |
|---|---|---|---|
| 1 | **Mobile menu missing** | No hamburger button or `#mobileMenu` overlay | Add hamburger `.icon-btn` to `.header-tools`, add `<div class="mobile-menu" id="mobileMenu">` after `</header>`, wire `openMM()` / `closeMM()`, add `Escape` key listener |
| 2 | **Mobile menu nav links** | Not present | Add all 10 nav links in correct order; `About` gets `.active` class |
| 3 | **Footer CSS class system** | Uses `ii-footer-*` classes | Migrate to `ft-` class system per doc/DESIGN-SYSTEM.md §7.1 (`ft-top`, `ft-brand`, `ft-col-h`, `ft-link`, `ft-bot`, `ft-copy`, `ft-note`) |

### 🟠 Medium Priority

| # | Gap | Current state | Required fix |
|---|---|---|---|
| 4 | **Footer Quick Access links** | Present but missing `Knowledge Hub` | Add `<a class="ft-link" href="knowledge-hub.html">Knowledge Hub</a>` as 4th link |
| 5 | **Search popup — production wiring** | `console.log('Search:', q)` only | Wire to site search API or page — replace console.log with actual search action |
| 6 | **`mailto:` link** | Plain `href="mailto:hello@islamicinfo.org"` | Correct — verify email address is live in production |
| 7 | **Smooth scroll behaviour** | CTA buttons use `href="#methodology"` and `href="#sources"` | `scroll-behavior: smooth` is on `html` — verify it works in all target browsers |

### 🟢 Lower Priority

| # | Gap | Current state | Required fix |
|---|---|---|---|
| 8 | **Stats animation — dark mode colour shift** | `.counting` class changes to `var(--teal-500)` | In dark mode `--teal-500` is `#5BC1C7` — verify it reads correctly on dark background |
| 9 | **Hero word-by-word animation** | CSS classes `.hw1`–`.hw6` and `heroWordIn` keyframe defined | Ensure each word in the H1 has `.hero-title-word.hwN` class applied in HTML |
| 10 | **Missing `Meet the Team` page** | Footer links to `about.html` for "Meet the Team" | Create dedicated `team.html` page or add `#team` anchor section |
| 11 | **`contact.html`** | Footer and CTA link to `contact.html` | Create dedicated contact page or redirect to `mailto:` |

---

## 21. Functional Rules

1. **Source-cited only.** Every statement made on the About page itself — particularly those referencing scholars, hadith counts, or methodology — must be accurate and verifiable.
2. **No fatwa language.** The About page reaffirms this constraint. The wording "We do not issue fatwas" must appear in both the FAQ and the Non-Negotiable Rules.
3. **Stat numbers must be current.** The 4 stats (6,236 Qur'an verses, 12,000+ hadith, 300+ duas, 0 ads) must reflect actual platform content at build time.
4. **Email address must be live.** The `mailto:hello@islamicinfo.org` in the Contact CTA must reach a monitored inbox.
5. **No shimmer on cards.** All card hover states use the glow system only. (doc/DESIGN-SYSTEM.md §27.4)
6. **Design system strict.** No raw hex values inline, no new fonts, no new colour tokens.
7. **Counter animation fires once only.** The `statsAnimated` boolean prevents re-triggering if the user scrolls past the banner multiple times.
8. **FAQ closes on second click.** Clicking an already-open FAQ item should close it — not re-open another.
9. **Smooth scroll for anchor links.** `scroll-behavior: smooth` on `html` handles all `href="#anchor"` CTA buttons — no JS override needed.
10. **Mobile menu Escape key.** Per doc/DESIGN-SYSTEM.md §8, `document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMM(); })` must be present once the hamburger and mobile menu are added.

---

## 22. Acceptance Criteria Checklist

### Global Structure
- [ ] `<html lang="en" data-theme="light">` present
- [ ] Fonts: Cormorant Garamond, Inter, Amiri — preconnected and imported in exact order
- [ ] All 50+ CSS tokens in `:root` exactly as doc/DESIGN-SYSTEM.md §1
- [ ] Dark mode `[data-theme="dark"]` sibling block — unmerged with `:root`
- [ ] Body: Islamic geometric `background-image` at opacity 0.04
- [ ] `.ambient` radial glow div present, `.shell` wrapper present

### Header
- [ ] All **10** nav items in exact order, correct hrefs
- [ ] `About` has `class="nav-link active"` with teal text and teal→gold underline `::after`
- [ ] `knowledge-hub.html` at position 5 — never omitted
- [ ] `islamic-studies.html` used — never `learn.html`
- [ ] 4 header tools in order: search icon, EN, theme toggle, admin icon
- [ ] **Hamburger button added** — visible only ≤ 760px — `onclick="openMM()"` *(Gap — fix required)*
- [ ] Search popup `id="searchTrigger"` / `id="searchPopup"`: opens on click, auto-focuses, closes on Escape/outside
- [ ] Theme toggle `id="themeBtn"` — persists to `islamicinfo-theme` localStorage key, swaps sun↔moon SVG

### Mobile Menu *(Gap — add this)*
- [ ] `<div class="mobile-menu" id="mobileMenu">` placed immediately after `</header>`
- [ ] All **10** nav links in correct order with correct hrefs
- [ ] `About` marked active (`.mm-link.active`)
- [ ] `knowledge-hub.html` and `islamic-studies.html` present with correct hrefs
- [ ] `openMM()` / `closeMM()` functions defined
- [ ] `Escape` key closes menu via `document.addEventListener`
- [ ] Fade + slide-in `mmFade` animation on open

### Hero
- [ ] Bismillah is first child of `.hero-inner`
- [ ] Light: teal gradient clip-text, opacity 0.92; Dark: gold gradient + drop-shadow
- [ ] H1 uses `var(--font-display)` with `<span class="gradient-italic">` for "Compromise"
- [ ] Sub-text, Arabic verse correct content
- [ ] Two CTA buttons: "Our Methodology" → `#methodology`; "Trusted Sources" → `#sources`
- [ ] 4 floating `.geo` SVGs with `floatG` animation
- [ ] Hero-bg `.hero-bg` with `bgD` radial gradient animation

### Stats Banner
- [ ] 4 stats in exact order: 6,236 Qur'an Verses · 12,000+ Hadith Records · 300+ Verified Duas · 0 Ads. Fatwas. Opinions.
- [ ] `data-target`, `data-suffix`, `data-comma` attributes on each `.stat-num`
- [ ] `animateCount()` fires once via `statsObserver` (guarded by `statsAnimated` boolean)
- [ ] Counter uses `easeOutCubic` easing, 2800ms duration
- [ ] Counters stagger at 220ms intervals
- [ ] Stat 4 (`target=0`) displays "0" immediately without animation
- [ ] `.counting` class temporarily tints counter to `var(--teal-500)` during animation
- [ ] At ≤ 700px: grid collapses to `repeat(2, 1fr)`

### Mission Section
- [ ] `section-eyebrow` text: "Why We Exist"
- [ ] `.mission-grid` 2-column layout collapses to 1 column at ≤ 820px
- [ ] 4 correct paragraphs: `.mission-lead` + 3 × `.mission-body`
- [ ] Mission quote card: correct Arabic, English translation, reference `Hud · 11:88`
- [ ] Both `.mqc-quote` paragraphs present
- [ ] `.mqc-divider` with two gold lines and `✦` star
- [ ] All mission elements have `.reveal` class; quote card has `.reveal-d1`

### Non-Negotiable Rules
- [ ] 6 rule cards in exact order with correct icons, icon colour classes, titles, and descriptions
- [ ] Rule 3 explicitly states: "No Fatwas. Ever."
- [ ] `.principles-grid` auto-fill, `minmax(280px, 1fr)`
- [ ] `ruleObs` observer triggers `ruleIn` animation at `threshold: 0.10`
- [ ] Section `background: var(--surface-card)` applied

### Methodology Section
- [ ] `id="methodology"` on the section element
- [ ] 4 method steps with correct Arabic numerals (١ ٢ ٣ ٤) in `.ms-num` circles
- [ ] `.ms-line` gradient connector between steps
- [ ] Last step has no bottom border
- [ ] `methodObs` observer triggers `stepSlideIn` animation, staggered 0.18s
- [ ] Step titles and descriptions match exactly as specified in §9.4

### Scholars Section
- [ ] 4 scholar cards in correct order: al-Bukhārī · Muslim · al-Nawawī · al-Albānī
- [ ] Correct Arabic initial in each `.scholar-avatar`: خ · م · ن · ا
- [ ] Correct eras, names, descriptions, and badge classes
- [ ] `scholarObs` triggers `scholarIn` animation, staggered 0.14s
- [ ] `.sb-hadith` and `.sb-classical` badge variants used correctly
- [ ] Section `background: var(--surface-card)` applied

### Trusted Sources Section
- [ ] `id="sources"` on the section element
- [ ] 8 source pills in correct order with correct icons, names, and types
- [ ] `pillObs` triggers `pillIn` animation, staggered 80ms per pill
- [ ] Source pill hover: `translateY(-3px) scale(1.02)`, shadow, border-color change

### FAQ Accordion
- [ ] 5 FAQ items in correct order with exact question and answer content
- [ ] FAQ accordion JS: click toggles `.open`, closes all others first
- [ ] `.faq-chevron` rotates 180° on `.open`
- [ ] `.faq-a` `max-height` transitions 0 → 300px
- [ ] `faqObs` triggers `.in-view` staggered entrance at `threshold: 0.08`
- [ ] Section `background: var(--surface-card)` applied

### Contact / CTA Section
- [ ] `.contact-section` class (not `.cta-section`)
- [ ] Correct eyebrow, title (`Get in Touch`), sub-text
- [ ] Primary button: `href="mailto:hello@islamicinfo.org"` with mail SVG icon
- [ ] Ghost button: `href="index.html"` — "Back to Home"
- [ ] Background: `linear-gradient(135deg, var(--teal-900), #062628)`

### Footer
- [ ] **Migrate to `ft-` CSS class system** — not `ii-footer-*` *(Gap — fix required)*
- [ ] Col 1 heading: "About" with 4 about-specific links
- [ ] **Col 2 Quick Access: all 8 destinations** including `knowledge-hub.html` *(verify Knowledge Hub is present)*
- [ ] Col 3 Ecosystem: `quranlyai.com` · `mosquefinder.net` · `travellyai.com` · `learnspeakai.com`
- [ ] `quranlyai.com` — NOT `quranlya.com` (missing `i`)
- [ ] All ecosystem links: `target="_blank" rel="noopener"` + ` ↗` suffix
- [ ] Col 4 Company + Legal: About, Contact, Privacy Policy, Terms of Use — with `margin-top: 16px` before Legal
- [ ] Bottom bar: exact copyright string · italic note
- [ ] Footer link hover: `translateX(4px)` + left border teal + `color: #88E0E5`

### Animations & Theme
- [ ] `.reveal` IntersectionObserver (`_ro`, `threshold: .08`) fires `in` class on scroll
- [ ] Stagger delays `.reveal-d1` through `.reveal-d5` applied to appropriate elements
- [ ] No shimmer `::after` sweep on any card (doc/DESIGN-SYSTEM.md §27.4)
- [ ] All hover transitions use `var(--ease-reverent)` or `var(--ease-premium)`
- [ ] `floatG` geo animation continuous
- [ ] `bgD` hero-bg animation continuous
- [ ] `orbPulse` stats banner glow animation continuous
- [ ] Theme toggle: sun/moon SVG swaps correctly; dark mode persists via `islamicinfo-theme` key
- [ ] Tested in both light and dark mode
- [ ] All responsive breakpoints verified (820px mission, 700px stats, 760px nav)

---

*End of About Page Functional Document v1.0*
*IslamicInfo.org · doc/DESIGN-SYSTEM.md v3.0 · Blueprint: `about_v3.html`*
