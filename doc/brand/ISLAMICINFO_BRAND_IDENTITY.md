# IslamicInfo — Brand Identity Document
**Umbrella Brand System · All Products & Sub-Brands**
*v1.0 · 2026-05-20 · Maintained by: IslamicInfo founding team*

---

## Table of Contents

1. [Brand Foundation](#1-brand-foundation)
2. [Brand Architecture — The Family](#2-brand-architecture--the-family)
3. [Logo System](#3-logo-system)
4. [Color System](#4-color-system)
5. [Typography System](#5-typography-system)
6. [Tone of Voice](#6-tone-of-voice)
7. [Design Principles](#7-design-principles)
8. [Component Inheritance Rules](#8-component-inheritance-rules)
9. [Sub-Brand Token Override Rules](#9-sub-brand-token-override-rules)
10. [Mobile Design Deltas](#10-mobile-design-deltas)
11. [What Is Always Shared](#11-what-is-always-shared)
12. [What Can Adapt Per Product](#12-what-can-adapt-per-product)
13. [What Is Always Forbidden](#13-what-is-always-forbidden)
14. [Editorial Rules — Umbrella-Wide](#14-editorial-rules--umbrella-wide)
15. [Naming & Domain Conventions](#15-naming--domain-conventions)
16. [Brand Checklist — New Product Launch](#16-brand-checklist--new-product-launch)

---

## 1. Brand Foundation

### 1.1 The Mission Statement

> IslamicInfo exists because authentic Islamic knowledge should be universally accessible — free of opinion, free of advertising, and always traceable to its primary source.

Every product in the IslamicInfo family exists to extend this mission into a different domain of Muslim life. Each product solves a different problem. All share the same values.

### 1.2 The Three Pillars

These three words govern every product decision, design choice, and content decision across the entire brand family:

| Pillar | What it means in practice |
|---|---|
| **Authentic** | Every claim traces to a primary source. Grades are shown. Fabrications are labelled. Nothing is dressed as scripture that isn't. |
| **Accessible** | Free. No paywalls for core knowledge. No ads that compromise integrity. Works on every device. |
| **Honest** | We say what we don't know. We show weak narrations as weak. We never issue rulings. We correct errors publicly. |

### 1.3 What We Are Not

These are hard constraints, not stylistic preferences. They apply to every product without exception:

- **Not a religious authority.** No fatwas. No rulings. No halal/haram verdicts.
- **Not an opinion platform.** Editorial commentary stops where classical scholarship begins.
- **Not ad-supported.** Advertising creates incentive misalignment with authentic knowledge.
- **Not sectarian.** We draw from the major Sunni scholarly traditions and present multiple views where they exist.
- **Not a subscription gate.** Core knowledge is always free.

---

## 2. Brand Architecture — The Family

### 2.1 Structure

The IslamicInfo brand uses an **endorsed brand architecture** — each sub-product has its own identity, name, and focus, but carries a visible relationship to the parent.

```
IslamicInfo.org                   ← Parent brand / hub
├── QuranlyAI.com                 ← AI-powered Qur'an exploration
├── MosqueFinder.net              ← Global mosque discovery
├── TravellyAI.com                ← Halal-aware travel planning
├── LearnSpeakAI.com              ← Islamic language learning
└── [Future products]             ← Same architecture
```

### 2.2 Parent Brand Role

**IslamicInfo.org** is the knowledge hub and trust anchor. It is the most scholarly product in the family. When users discover any sub-brand and want to understand its values, IslamicInfo.org is the destination.

### 2.3 Sub-Brand Relationship Levels

Each product falls into one of three relationship levels:

| Level | Description | Visual treatment | Examples |
|---|---|---|---|
| **Core** | Directly extends IslamicInfo.org content | Shares teal/gold palette, same font stack, footer mentions IslamicInfo.org | QuranlyAI |
| **Adjacent** | Islamic lifestyle tool, not primarily a content site | Shares font stack and brand principles, may use a secondary palette accent | MosqueFinder, TravellyAI |
| **Extended** | Islamic adjacent but distinct audience or purpose | Shares typography only; unique palette within the brand token rules | LearnSpeakAI |

### 2.4 Product Family At a Glance

| Product | Domain | Level | Primary audience | Core function |
|---|---|---|---|---|
| IslamicInfo | islamicinfo.org | Parent | All Muslims | Knowledge hub — Qur'an, Hadith, Dua, Tools |
| QuranlyAI | quranlyai.com | Core | Qur'an learners | AI-powered Qur'an exploration and tafsir |
| MosqueFinder | mosquefinder.net | Adjacent | Travellers, local community | Global mosque discovery and directory |
| TravellyAI | travellyai.com | Adjacent | Muslim travellers | Halal-aware travel planning and recommendations |
| LearnSpeakAI | learnspeakai.com | Extended | Arabic and Islamic language learners | Language learning platform |

---

## 3. Logo System

### 3.1 IslamicInfo Primary Logo

**Construction:** SVG open-book brand mark (`brand-mark`, 34×34px) + wordmark.

**Wordmark:** `Islamic` in `var(--teal-300)` (light: `#5BC1C7`) · `Info` in `var(--gold-500)` (`#C5A059`). Font: `var(--font-display)` (Cormorant Garamond), 20px, weight 600.

**Brand mark:** Open book SVG with an embedded star element (`.star`) and halo rings (`.halo`).

**Hover animation:**
- `.star` → `star-spin` keyframe: `rotate(0→45deg) scale(1.15)`, 0.8s ease-reverent, forwards
- `.halo` → `halo-pulse` keyframe: `opacity 0.25→0.7`, 0.9s ease, infinite
- Outer mark → `scale(1.06)`, 0.5s ease-reverent

### 3.2 Sub-Brand Logo Construction Rules

Each sub-brand has its own logomark but must follow this system:

| Element | Rule |
|---|---|
| Wordmark font | Always `var(--font-display)` (Cormorant Garamond) — no exceptions |
| Primary word color | Product's primary teal variant (see §9) |
| Suffix / qualifier | May be in gold-500 or ink-muted |
| Mark size | 28–40px; never smaller than 24px in nav |
| Minimum clear space | Equal to the height of the cap `I` in the wordmark on all sides |

### 3.3 "Part of the IslamicInfo Family" Attribution

Every sub-brand footer must include the ecosystem link back to IslamicInfo.org. Exact format:

```
Part of the IslamicInfo Family  →  islamicinfo.org
```

Styling: 11px, `var(--ink-subtle)`, positioned in footer bottom bar or brand column.

### 3.4 What Is Never Allowed

- No raster logo files in production — SVG only
- No logo on a colored background that reduces contrast below WCAG AA
- No logo stretched, skewed, or recolored outside the token set
- No drop-shadow on the wordmark (only on the brand mark in specific dark contexts)

---

## 4. Color System

### 4.1 Core Palette — Shared Across All Products

These tokens are defined in CLAUDE.md v3.0 and are the authoritative source. They are **never overridden** at the parent level.

#### Teal Family (Primary Brand)
| Token | Light value | Dark value | Use |
|---|---|---|---|
| `--teal-50` | `#F0FAFA` | `#0A1F21` | Tinted backgrounds |
| `--teal-100` | `#DCEFF0` | `#0F2A2C` | Light tints |
| `--teal-300` | `#5BC1C7` | `#5BC1C7` | Logo, active nav |
| `--teal-500` | `#2CA4AB` | `#2CA4AB` | Gradients, accents |
| `--teal-700` | `#00696E` | `#00696E` | Primary interactive |
| `--teal-900` | `#0A3A3D` | `#0D2426` | Dark surfaces, CTAs |

#### Gold Family (Secondary Brand)
| Token | Light value | Dark value | Use |
|---|---|---|---|
| `--gold-300` | `#E8CE89` | `#E8CE89` | Light gold accents |
| `--gold-500` | `#C5A059` | `#C5A059` | Logo suffix, decorative |
| `--gold-700` | `#9A7C3F` | `#B8973D` | Scholar era labels, muted gold |

#### Semantic — Grade Colors (IslamicInfo.org and QuranlyAI only)
| Token | Value | Use |
|---|---|---|
| `--grade-sahih` | `#0F6E56` | Authentic hadith grade |
| `--grade-hasan` | `#5D8A3A` | Sound hadith grade |
| `--grade-daif` | `#A86932` | Weak hadith grade |
| `--grade-mawdu` | `#B33A3A` | Fabricated hadith |

Grade colors are **only used on content sites** (IslamicInfo.org, QuranlyAI). They never appear on MosqueFinder, TravellyAI, or LearnSpeakAI.

### 4.2 Ink (Text) Tokens — Universal
| Token | Light | Dark | Use |
|---|---|---|---|
| `--ink-primary` | `#0F2A2C` | `#E8F2F2` | Headings, primary text |
| `--ink-muted` | `#6D797A` | `#8FA8A9` | Body, descriptions |
| `--ink-subtle` | `#9DA8A9` | `#6D8A8B` | Labels, captions |
| `--ink-faint` | `#C4CCCC` | `#3A5254` | Dividers, placeholders |

### 4.3 Surface Tokens — Universal
| Token | Light | Dark | Use |
|---|---|---|---|
| `--white` | `#FFFFFF` | `#132224` | Card backgrounds |
| `--surface-card` | `#FAFBFB` | `#1A2F31` | Section alt backgrounds |
| `--surface-alt` | `#F3F5F5` | `#0F1E20` | Subtle alternating bg |

### 4.4 Sub-Brand Accent Colors
Each adjacent/extended sub-brand may add **one** accent color token on top of the shared teal/gold system. Rules:
- Must pass WCAG AA against `--white` and `--surface-card`
- Must not conflict visually with `--teal-700` or `--gold-500`
- Must be defined as a CSS custom property in the sub-brand's `:root` block
- Must be documented in the sub-brand's tech spec

| Product | Accent token | Value | Rationale |
|---|---|---|---|
| MosqueFinder | `--mosque-blue` | `#1A6B9E` | Maps / location / direction |
| TravellyAI | `--travel-sand` | `#B8935A` | Desert / journey / warmth |
| LearnSpeakAI | `--learn-violet` | `#5B4BAF` | Learning / cognition |
| QuranlyAI | (inherits teal) | — | Core product, no additional accent |

---

## 5. Typography System

### 5.1 Font Stack — Universal Across All Products

All three fonts must be loaded on every product. This is non-negotiable.

| CSS Variable | Font | Purpose | Load via |
|---|---|---|---|
| `--font-display` | Cormorant Garamond | Display titles, H1, stat numbers, logo wordmark | Google Fonts |
| `--font-body` | Inter | UI, nav, buttons, labels, body text | Google Fonts |
| `--font-arabic` | Amiri | All Arabic script — Qur'an, hadith, names, numerals | Google Fonts |

### 5.2 Import Order (Required)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

### 5.3 Type Scale — Shared
| Role | Size | Weight | Font | Variable |
|---|---|---|---|---|
| Display H1 | `clamp(44px,8vw,80px)` | 500 | `--font-display` | — |
| H2 section title | `clamp(28px,4vw,40px)` | 500 | `--font-display` | — |
| H3 card title | `18–20px` | 500 | `--font-serif` | — |
| Body lead | `clamp(20px,2.8vw,26px)` | 500 | `--font-serif` | — |
| Body text | `15px` | 400 | `--font-body` | — |
| Small / label | `11–13px` | 600 | `--font-body` | — |
| Arabic display | `clamp(18px,3vw,28px)` | 400 | `--font-arabic` | — |
| Stat number | `clamp(32px,5vw,52px)` | 500 | `--font-display` | — |

### 5.4 Typography Rules
- Arabic text is **always** `font-family: var(--font-arabic)` — never substituted
- `direction: rtl; text-align: right` is always applied to Arabic text blocks
- Cormorant Garamond italic is used for emphasis within English prose (grade names, key phrases)
- Inter is used for all UI chrome — never Cormorant in buttons, nav links, or labels
- Minimum body text size: `13px` — never smaller in any product

---

## 6. Tone of Voice

### 6.1 Brand Voice: Scholarly but Approachable

The IslamicInfo voice is the voice of a knowledgeable friend who happens to have studied Islamic sciences — not a professor lecturing, not a salesperson pitching.

| Attribute | What it sounds like | What it avoids |
|---|---|---|
| **Precise** | "Ibn Mājah (224) — graded Ḥasan by al-Albānī" | "A famous hadith says..." |
| **Honest** | "This narration is Ḍaʿīf — weak chain, not primary evidence" | Hiding grades or softening weakness |
| **Direct** | "We do not issue fatwas. Ever." | Hedging with "we try to avoid..." |
| **Humble** | "We show you the primary sources and let you read for yourself" | "Our experts have determined..." |
| **Warm** | "JazakAllahu Khayran" in micro-copy | Corporate coldness |
| **Calm** | Measured, unhurried prose | Urgency language ("Act now!") |

### 6.2 Voice by Product Context

| Product | Voice adjustment | Stays constant |
|---|---|---|
| IslamicInfo.org | Most scholarly — references classical Arabic terms | No fatwas, no opinions |
| QuranlyAI | Exploratory, inviting — "discover", "explore" | Source-cited, grade-displayed |
| MosqueFinder | Practical, community-oriented | Welcoming, not exclusive |
| TravellyAI | Helpful, experiential — "your journey" | Honest, no unverified claims |
| LearnSpeakAI | Encouraging, patient — learning takes time | Humble, no false promises |

### 6.3 Micro-Copy Standards

These phrases are used consistently across all products:

| Context | Standard copy | Never say |
|---|---|---|
| Empty search | "Search verses, hadiths, topics…" | "Try searching for something" |
| Footer copyright | "No ads. No fatwas. No fabricated sources." | Any variation of this |
| Free forever | "Always free. No account required." | "Free tier available" |
| Source attribution | "Ibn Mājah · 224 · Ḥasan" | "Source: Ibn Majah (see below)" |
| Error correction | "JazakAllahu Khayran for the correction" | "Thanks for the feedback!" |
| Contact | "We read everything." | "Our team will get back to you" |

### 6.4 What We Never Write
- Marketing superlatives: "the best", "leading", "world-class"
- Urgency: "limited time", "don't miss out", "act now"
- Hedged truth: "may be authentic", "possibly from the Prophet ﷺ"
- Opinion as fact: "scholars agree that…" without naming the scholars
- Fatwa-adjacent language: "permissible", "forbidden", "you should/must"

---

## 7. Design Principles

These seven principles govern every design decision across all products. When in conflict, earlier principles take precedence.

**1. Source before opinion.**
Every piece of content must trace to a primary source. If it can't be sourced, it isn't published.

**2. Grade everything.**
Ṣaḥīḥ, Ḥasan, Ḍaʿīf, Mawḍūʿ — shown prominently, never hidden in fine print. Applies to all content products.

**3. Clarity over decoration.**
Geometric decorators, gradients, and animations exist to orient and delight — never to obscure content or slow comprehension.

**4. Reverent motion.**
Animation is calm and deliberate. The easing curves `--ease-reverent` and `--ease-premium` encode this. No jarring bounces, no shimmer sweeps, no loading spinners that feel anxious.

**5. Arabic is first-class.**
The Arabic script is never an afterthought. It is sized generously, set in Amiri, given RTL layout, and treated as visually prominent — not a footnote to the English.

**6. Dark mode is not an afterthought.**
Every component is designed in both light and dark simultaneously. `[data-theme="dark"]` is a sibling block — never merged with `:root`.

**7. Free is a feature.**
The absence of ads, paywalls, and premium gates is a product decision, not just a business model. It shapes the design — no ad slots, no upgrade prompts, no "unlock premium" banners.

---

## 8. Component Inheritance Rules

### 8.1 Fully Inherited (Identical Across All Products)

These components are copied verbatim from IslamicInfo.org and must not be redesigned:

| Component | What is identical |
|---|---|
| Global header | Height (60px), frosted glass treatment, sticky behavior, `.scrolled` shadow, search popup (340px), theme toggle, hamburger at ≤ 760px |
| Mobile menu | Full-screen overlay, `mmFade` animation, Escape key close, all link styles |
| Footer structure | 5-column grid, brand column content (tagline + Hud 11:88 verse), Quick Access col, Ecosystem col, Company/Legal col, bottom bar copy |
| Theme toggle | `applyTheme()` function, `islamicinfo-theme` localStorage key, sun/moon SVG swap |
| Scroll reveal | `.reveal` + `_ro` IntersectionObserver (`threshold: 0.08`), stagger classes `.reveal-d1`–`.reveal-d5` |
| Button system | `.btn-primary`, `.btn-ghost`, `.btn-white-ghost`, `.btn-gold`, `.btn-side` — all styles identical |
| Card hover | `translateY(-5px) scale(1.012)` + teal glow shadow — never shimmer |
| Bismillah | `.bismillah-hero-top` — teal gradient (light) / gold + drop-shadow (dark) |
| Hero badge | `.hero-badge` + `.badge-dot` pulse — identical across all hero sections |
| Ambient glow | `.ambient` radial glow + `.shell` wrapper |

### 8.2 Inherited with Content Swap

These components keep their structure and styling but accept product-specific content:

| Component | What changes per product |
|---|---|
| Hero section | H1 copy, sub-text, CTA labels, Arabic verse selection |
| Stats banner | `data-target` values, labels |
| Footer col 1 | Heading and links (page-specific; col 2–5 are identical) |
| CTA section | Eyebrow, H2 copy, button labels/hrefs |
| Page `<title>` and `<meta description>` | Per page and per product |
| Nav active state | Which `.nav-link` has `.active` class |

### 8.3 Product-Specific Only

These components are built fresh per product and do not inherit from IslamicInfo.org:

- Interactive tools (prayer widget, zakat calculator, Qibla compass)
- AI chat interfaces (QuranlyAI)
- Map/location views (MosqueFinder)
- Travel recommendation flows (TravellyAI)
- Learning modules (LearnSpeakAI)

---

## 9. Sub-Brand Token Override Rules

### 9.1 The Override Contract

A sub-brand inherits ALL tokens from CLAUDE.md v3.0. It may **add** the following — it may never **replace** core tokens.

```css
/* Sub-brand override block — placed AFTER the main :root import */
:root {
  /* Accent color only — one per sub-brand */
  --brand-accent: var(--mosque-blue, #1A6B9E);

  /* Optional: hero gradient shift (teal family only) */
  --hero-gradient-start: var(--teal-700);
  --hero-gradient-end:   var(--teal-500);
}
```

### 9.2 What May Be Overridden Per Sub-Brand

| Token category | Can override? | Rules |
|---|---|---|
| One accent color | ✓ Yes | Must pass WCAG AA; documented in §4.4 |
| Hero gradient direction | ✓ Yes | Teal family only; no raw hex |
| Stats banner background | ✓ Yes | Must remain dark; teal-900 family |
| Font stack | ✗ Never | All three fonts always loaded |
| Ink tokens | ✗ Never | `--ink-primary`, `--ink-muted`, `--ink-subtle` are fixed |
| Teal family | ✗ Never | Core brand color — never replaced |
| Gold family | ✗ Never | Secondary brand color — never replaced |
| Grade colors | ✗ Never | Content-specific; never use outside IslamicInfo/QuranlyAI |
| Easing curves | ✗ Never | `--ease-reverent` and `--ease-premium` are fixed |
| Border radii | ✓ Minor (±2px) | Never go below `var(--r-md)` for cards |

### 9.3 Per-Product Token Extension Examples

```css
/* MosqueFinder.net */
:root {
  --mosque-blue:       #1A6B9E;
  --mosque-blue-light: rgba(26,107,158,.10);
  --map-pin-color:     var(--mosque-blue);
}

/* TravellyAI.com */
:root {
  --travel-sand:       #B8935A;
  --travel-sand-light: rgba(184,147,90,.10);
}

/* LearnSpeakAI.com */
:root {
  --learn-violet:       #5B4BAF;
  --learn-violet-light: rgba(91,75,175,.10);
}
```

---

## 10. Mobile Design Deltas

### 10.1 Shared Principles (Web + Native)

The same three fonts, same color tokens, same principles, same tone of voice. The brand is identical. Only the interaction patterns differ.

### 10.2 Touch Targets

All interactive elements: minimum `44×44px` touch target — even if the visual element is smaller (use padding to expand the tap area).

### 10.3 Navigation Pattern

| Web | Mobile app |
|---|---|
| Top sticky header | Bottom tab bar (5 items max) |
| Hamburger overlay at ≤ 760px | Native drawer or sheet |
| Hover states on cards | Long-press or tap for contextual actions |

### 10.4 Typography Adjustments

| Web value | Mobile native value | Reason |
|---|---|---|
| `clamp(44px,8vw,80px)` H1 | `32–40px` fixed | Viewport is smaller; clamp not needed |
| `15px` body | `16px` body | Better legibility on small screens |
| `11px` uppercase labels | `12px` labels | Minimum legible size on mobile |

### 10.5 Animation Rules for Mobile

- Reduce motion on `prefers-reduced-motion: reduce` — disable all `transform` animations, keep opacity only
- No `backdrop-filter: blur()` on Android WebView — use solid fallback background
- `floatG` and `bgD` continuous animations: disable on mobile to preserve battery

### 10.6 Dark Mode on Mobile

Same `[data-theme="dark"]` token system applies. On native apps, respect `prefers-color-scheme` automatically. On mobile web, use the same `islamicinfo-theme` localStorage key.

---

## 11. What Is Always Shared

No exceptions across any product in the family:

1. **Three-font stack** — Cormorant Garamond, Inter, Amiri
2. **Teal + gold color identity** — `--teal-700` and `--gold-500` always present
3. **No shimmer** — `::after` sweep animation never on any card, anywhere
4. **`--ease-reverent`** — all card hover and entrance animations
5. **Bismillah in hero** — every product hero begins with the Bismillah
6. **Footer ecosystem links** — all four ecosystem products always listed in every footer
7. **`islamicinfo-theme`** — shared localStorage key; theme syncs if user visits multiple products
8. **"No ads. No fatwas. No fabricated sources."** — appears in every footer bottom bar
9. **Copyright format** — `© 2026 [Domain] — [tagline]`
10. **RTL Arabic treatment** — Amiri, `direction:rtl`, `text-align:right`, generous sizing

---

## 12. What Can Adapt Per Product

Within the rules above, each product may:

- Choose its own hero H1 copy, sub-text, and CTA labels
- Use a single additional accent color (§9.2)
- Define its own page-specific sections (tools, maps, AI interfaces)
- Write its own footer col 1 (page-specific links)
- Set its own stats banner figures and labels
- Choose which Arabic verse to feature in the hero and mission sections
- Define its own eyebrow badge text
- Use product-specific icon sets as long as they are SVG and follow the size + stroke conventions

---

## 13. What Is Always Forbidden

Across every product, sub-brand, page, and component:

| Forbidden | Why |
|---|---|
| Shimmer `::after` sweep on cards | CLAUDE.md §27.4 — degrades the reverent aesthetic |
| Raw hex values inline (except SVG `<defs>`) | Tokens ensure dark mode consistency |
| New font families | Breaks typographic identity |
| Merged `:root` and `[data-theme="dark"]` blocks | Prevents dark mode from functioning correctly |
| `href="learn.html"` | Wrong href — always `islamic-studies.html` |
| Omitting `knowledge-hub.html` from nav | Required at position 5 — never omit |
| `quranlya.com` (missing `i`) | Wrong domain — always `quranlyai.com` |
| `LearnSpeakAi` or `Learnspeakai` | Wrong casing — always `LearnSpeakAI` |
| Fatwa language | No rulings, no permissible/forbidden verdicts |
| Urgency copy | "Act now", "Limited time", "Don't miss out" |
| `ii-footer-*` CSS classes | Legacy — always use `ft-` system |
| Grade colors outside content products | `--grade-sahih` etc. never on MosqueFinder/TravellyAI/LearnSpeakAI |
| Ad placements | Anywhere, on any product |
| Paywalls on core knowledge | Free access is a founding commitment |

---

## 14. Editorial Rules — Umbrella-Wide

These rules govern every piece of content on every product:

1. **Every claim must trace to a source.** If it cannot be sourced, it is not published.
2. **Hadith grades are always shown.** Ṣaḥīḥ / Ḥasan / Ḍaʿīf / Mawḍūʿ — prominently, never in fine print.
3. **No fatwas, no rulings, no religious opinions.** This is a hard constraint, not a policy.
4. **Weakness is disclosed.** Weak narrations are published *with* prominent weakness notices — not removed, which would hide the knowledge that the narration is weak.
5. **Corrections are welcomed publicly.** If an error is found and corrected, the correction is acknowledged, not hidden.
6. **No sectarian gate-keeping.** Content draws from major Sunni scholarly traditions. Multiple scholarly views are presented where they exist.
7. **The Disclaimer is never removed.** On all content tools: *"[Product] does not issue fatwas or legal rulings. This analysis cites authenticated sources only and is for educational reference."*

---

## 15. Naming & Domain Conventions

### 15.1 Brand Name Format

| Context | Format | Example |
|---|---|---|
| Full brand name | `IslamicInfo` (one word, camel case) | IslamicInfo.org |
| Domain display | lowercase | islamicinfo.org |
| In-app references | `IslamicInfo` | "Part of IslamicInfo" |
| Never | `Islamic Info` (two words) | — |

### 15.2 Sub-Brand Name Rules

| Rule | Example |
|---|---|
| AI suffix: capital `AI` always | `QuranlyAI`, `TravellyAI`, `LearnSpeakAI` — never `Ai` or `ai` |
| Net domains: spell out in display | `MosqueFinder.net` — not `MosqueFinder` |
| ↗ on external links | `QuranlyAI ↗` in footer ecosystem column |
| `target="_blank" rel="noopener"` | On all ecosystem links in footers |

### 15.3 Internal Reference Hierarchy

When one product links to another:

```
IslamicInfo.org → QuranlyAI.com  (parent endorses)
QuranlyAI.com → IslamicInfo.org  (child attributes)
QuranlyAI.com → MosqueFinder.net (sibling ecosystem link)
```

All cross-product links use the exact registered domain. No abbreviations.

---

## 16. Brand Checklist — New Product Launch

Run this before launching any new product in the family:

### Design System
- [ ] CLAUDE.md v3.0 tokens imported as-is — no modifications to core tokens
- [ ] Sub-brand accent color documented in §4.4 and added to `:root` only
- [ ] Three fonts loaded: Cormorant Garamond, Inter, Amiri — preconnected
- [ ] `[data-theme="dark"]` block is a sibling to `:root` — never merged
- [ ] No shimmer `::after` on any card

### Header & Navigation
- [ ] All 10 IslamicInfo nav items in correct order (if linking to IslamicInfo.org) OR product-specific nav with same design system
- [ ] Hamburger button present, visible only ≤ 760px
- [ ] `#mobileMenu` overlay with all nav links
- [ ] Theme toggle using `islamicinfo-theme` localStorage key
- [ ] Search popup: 340px, auto-focus, Escape closes

### Hero
- [ ] Bismillah is first element of `.hero-inner`
- [ ] Bismillah: teal gradient (light) / gold + drop-shadow (dark)
- [ ] Arabic verse present (product-appropriate selection)
- [ ] Floating `.geo` SVG decorators with `floatG` animation

### Footer
- [ ] `ft-` CSS class system — never `ii-footer-*`
- [ ] Ecosystem column: all 4 current products with `↗` and `target="_blank" rel="noopener"`
- [ ] `quranlyai.com` — never `quranlya.com`
- [ ] `LearnSpeakAI` — never `LearnSpeakAi`
- [ ] Quick Access: `knowledge-hub.html` never omitted
- [ ] `islamic-studies.html` — never `learn.html`
- [ ] Bottom bar: "No ads. No fatwas. No fabricated sources."
- [ ] "Part of the IslamicInfo Family → islamicinfo.org" attribution

### Editorial
- [ ] No fatwa language anywhere on the product
- [ ] Grade colors used only on content products (not MosqueFinder/TravellyAI/LearnSpeakAI)
- [ ] All hadith references include collection, book, and hadith number
- [ ] Disclaimer present on any tool that handles Islamic content classification
- [ ] Contact email established and monitored

### Technical
- [ ] `scroll-behavior: smooth` on `html`
- [ ] `applyTheme()` runs inline in `<head>` before first paint
- [ ] All `.reveal` elements observed by `_ro` IntersectionObserver
- [ ] `will-change: transform, box-shadow` on `.card`
- [ ] Arabic text: `font-family: var(--font-arabic); direction: rtl; text-align: right`

---

*End of Brand Identity Document v1.0*
*IslamicInfo.org Umbrella Brand · CLAUDE.md v3.0 · May 2026*
*Covers: IslamicInfo.org · QuranlyAI.com · MosqueFinder.net · TravellyAI.com · LearnSpeakAI.com*
