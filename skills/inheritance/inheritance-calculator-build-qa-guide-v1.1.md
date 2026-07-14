# Inheritance Calculator — Build & QA Prompt Guide
**Step 4.5 · IslamicInfo.org · `inheritance.html`**
*v1.1 · 2026-05-20*

---

## Overview

This guide covers everything needed to build and verify the Inheritance Calculator feature. Execute steps in order. Each section is a self-contained prompt or checklist ready to paste.

| Step | Action | Output |
|---|---|---|
| 4.5A | Patch `tools.html` | 2 tool card changes |
| 4.5B | Build `inheritance.html` | 3 new files |
| 4.5C | QA `inheritance.html` | PASS / FAIL report |
| 4.5D | QA `tools.html` patch | PASS / FAIL report |
| 4.5E | Git commit | Pushed to `main` |

---

## Step 4.5A — Patch `tools.html`

Apply these two card patches when building `src/tools.html`. Do not build old "Coming Soon" cards.

### Patch 1 — AI Claim Verifier Card (fix existing)

```html
<a href="verify.html" class="tool-card reveal reveal-d2" data-cat="discovery">
  <span class="tool-status ts-live">● Live</span>
  <div class="tc-icon ti-teal">
    <!-- existing icon SVG -->
  </div>
  <h3 class="tc-title">AI Claim Verifier</h3>
  <p class="tc-desc"><!-- existing description --></p>
  <div class="tc-tags">
    <span>AI-Powered</span><span>61K+ Hadith</span><span>Grades</span>
  </div>
  <span class="tc-cta">Verify a Claim →</span>
</a>
```

**Requirements:**
- Element is `<a>` (not `<div>`) with `href="verify.html"`
- Status badge: `.ts-live` — text "● Live"
- CTA: "Verify a Claim →" (not "Launching 2026")
- No `opacity:0.75`, no `cursor:default`, no onclick modal handler

### Patch 2 — Inheritance Calculator Card (add new)

```html
<a href="inheritance.html" class="tool-card reveal" data-cat="finance">
  <span class="tool-status ts-new">● New</span>
  <div class="tc-icon ti-gold">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 3v18M3 6l9-3 9 3M6 10l-3 8h6l-3-8zM18 10l-3 8h6l-3-8z"/>
    </svg>
  </div>
  <h3 class="tc-title">Inheritance Calculator</h3>
  <p class="tc-desc">
    Calculate estate shares according to Qur'anic Faraid law.
    Every share cites An-Nisa 4:11–12, 4:176. Authentic. Scholar-verified.
  </p>
  <div class="tc-tags">
    <span>Faraid</span><span>Qur'an</span><span>Miras</span>
  </div>
  <span class="tc-cta">Calculate Shares →</span>
</a>
```

**Placement:** Finance & Fiqh category — after Sadaqah Tracker card.  
**Total tool cards after patch:** 13 (was 12).

---

## Step 4.5B — Build Prompt: `inheritance.html`

Run this after Step 4 (`tools.html`) is built and QA'd.

```
Read these files in full before writing any code:
1. .claude/CLAUDE.md
2. docs/skill/SKILL.md
3. docs/prd/IslamicInfo_InheritanceCalc_PRD_v1_0.md
4. docs/tech-specs/inheritance-calculator-technical-doc.md

Build: src/inheritance.html + src/css/inheritance.css + src/js/inheritance.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHELL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Import: tokens.css → global.css → inheritance.css
- Import JS at end of body: global.js → inheritance.js
- applyTheme() inline script in <head> before CSS
- <html lang="en" data-theme="light">
- Font preconnect: Cormorant Garamond + Inter + Amiri (exact order)
- All 10 nav links in exact order; Tools = .active
  (This is a Tools sub-page — NOT a standalone nav page)
- #mobileMenu overlay with all 10 nav links; Tools = .mm-link.active
- Footer: ft- system, col 2 heading = "Tools",
  all 8 Quick Access links, 4 Ecosystem links

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Bismillah first inside .hero-inner
- Eyebrow: "Faraid Calculator · Qur'an 4:11–12, 4:176 · Sahih Bukhari & Muslim"
- H1: Islamic <span class="grad-it">Inheritance</span> Calculator
- Subtext: explanation with verse refs
- Arabic: وَلِكُلٍّ جَعَلْنَا مَوَٰلِىَ مِمَّا تَرَكَ (An-Nisa 4:33)
- btn-primary → #calc-section
- btn-ghost   → #methodology-section

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALCULATOR FORM (#calc-section)
3 .calc-card elements, max-width 760px, centered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Card 1 — Estate Details:
- #estateValue: type=number, min=1
- #currencySelect: USD/GBP/EUR/SAR/PKR/BDT/Other
- #debtAmount: type=number, min=0
- #funeralAmount: type=number, min=0
- #distributableDisplay: live-updated, teal-700, Cormorant 24px
- Wire all three inputs → updateDistributableDisplay() on 'input'

Card 2 — Deceased Gender:
- 2 radio buttons name="deceasedGender" value="male"|"female"
- Male checked by default

Card 3 — Surviving Heirs:
- Fieldset groups: Spouse, Children, Parents, Siblings
- Each heir: .heir-checkbox + label + conditional .heir-count spinner
- Spinner hidden by default; shows/hides via toggleHeirSpinner()
- husband row: show only when deceased = female
- wife row: show only when deceased = male
- Wife spinner: id="wifeCount", range 1–4
- All other spinners: range 1–20

Validation + button:
- <div id="calcError" class="calc-error" style="display:none"></div>
- <button id="calcBtn" class="btn-primary" onclick="runCalculation()">
    Calculate Shares
  </button>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULTS SECTION (#results-section, display:none on load)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- .estate-summary-strip: 3 cells
    id="rsTotalEstate" | id="rsDeductions" | id="rsDistributable"
- Table with #heirsTableBody
    Columns: Heir | Share | Amount | Source | Note
    Blocked rows: class="blocked-row" + muted styling
    Source cells: <span class="source-pill" data-source="...">
- #distribution-chart: CSS flex stacked bar (no library)
    Teal shades: #00696E #2CA4AB #5BC1C7 #0A3A3D
    Gold shades: #C5A059 #E8CE89 #9A7C3F
- #chart-legend: flex-wrap legend items
- .disclaimer: HARD-CODED HTML — never JS-generated:
    Content must include:
    • "directly from the Qur'an (An-Nisa 4:11, 4:12, 4:176)"
    • "Sahih al-Bukhari 6732, Sahih Muslim 1615"
    • "not scholarly opinion or madhab interpretation"
    • "does not issue fatwas or legal rulings"
- NO #madhabSelect anywhere on the page
- .result-actions: Print (window.print()), Share (shareResult()), Recalculate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALCULATION ENGINE (inheritance.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use the exact implementations in the Technical Spec:

STATE object (§3.1 of tech spec)
VERSE_DATA const (§3.2) — hardcoded, never fetched
HADITH_DATA const (§3.2) — Bukhari 6732 / Muslim 1615

readForm()              — syncs inputs to STATE
getDistributable()      — Math.max(0, estate - debt - funeral)
validateForm()          — returns errors array
applyHijb(heirs)        — returns blocked{} object with source citations
calculateShares()       — Steps 1–4; guard: Math.max(0, 1 - assigned)
runCalculation()        — orchestrates full flow
renderResults()         — DOM append (not innerHTML templates)
renderChart()           — CSS flex, no canvas
showSourceTooltip()     — single reused DOM node; handles VERSE_DATA + HADITH_DATA
shareResult()           — encodes STATE to URLSearchParams + clipboard
restoreFromURL()        — parses params, pre-fills form, auto-runs

Fixed share logic (source on every row):
  Husband:  1/2 no-children | 1/4 with-children  → An-Nisa 4:12
  Wife(s):  1/4 no-children | 1/8 with-children  → An-Nisa 4:12
  Father:   1/6 with-children; Asabah otherwise  → An-Nisa 4:11 / Bukhari 6732
  Mother:   1/6 or 1/3 per conditions            → An-Nisa 4:11
  Daughters only: 1 = 1/2; 2+ = 2/3             → An-Nisa 4:11
  Sons + daughters: 2:1 residue                  → An-Nisa 4:11 · Bukhari 6732
  Asabah (residue): sons or father               → Bukhari 6732 · Muslim 1615
  Blocked heirs:                                 → Bukhari 6732 · Muslim 1615

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOURCES SECTION (#methodology-section)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Heading: "Primary Sources"
3 source tier cards: Qur'an | Bukhari 6732 | Muslim 1615
.shares-grid: repeat(auto-fill, minmax(220px,1fr))
7 .share-card elements: Nisf | Rub' | Thumun | Thulth | Thulthan | Sudus | Asabah
Each card: fraction (Cormorant 28px teal) + Arabic term + who + verse/hadith ref

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FAQ (#faq-section)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5 items. Standard toggleFaq() — one open at a time.
Q1: What is Faraid?
Q2: Does this cover all heirs?
Q3: What is Asabah?
Q4: Why is there no madhab selector?
Q5: My situation is complex — what should I do?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CTA SECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: deep teal gradient
H2: "Knowledge is the foundation of just distribution."
Arabic: إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا (An-Nisa 4:58)
btn-gold        → tools.html   "Back to All Tools"
btn-white-ghost → verify.html  "Verify a Claim"
btn-white-ghost → hadith.html  "Hadith Library"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRINT STYLES (@media print)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hide: header, nav, form inputs, footer, CTA, hero
Show: results section only
Page title: "Islamic Inheritance Calculation — IslamicInfo.org"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSIVE BREAKPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1100px | 820px | 760px | 600px | 440px
Light + dark mode complete.

Output: src/inheritance.html + src/css/inheritance.css + src/js/inheritance.js
```

---

## Step 4.5C — QA Checklist: `inheritance.html`

Review `src/inheritance.html` + `src/css/inheritance.css` + `src/js/inheritance.js`.

### Sources — Must verify before shipping

- [ ] NO "Hanafi school" text anywhere on the page
- [ ] NO `#madhabSelect` element in HTML
- [ ] NO `onMadhabChange` function in `inheritance.js`
- [ ] Eyebrow: "Faraid Calculator · Qur'an 4:11–12, 4:176 · Sahih Bukhari & Muslim"
- [ ] Disclaimer contains: "directly from the Qur'an (An-Nisa 4:11, 4:12, 4:176)"
- [ ] Disclaimer contains: "Sahih al-Bukhari 6732, Sahih Muslim 1615"
- [ ] Disclaimer contains: "not scholarly opinion or madhab interpretation"
- [ ] Disclaimer contains: "does not issue fatwas or legal rulings"
- [ ] Disclaimer is hard-coded HTML — not JS-generated
- [ ] Blocked heir rows show source: "Bukhari 6732 · Muslim 1615"
- [ ] Aṣabah rows show source: "Bukhari 6732 · Muslim 1615"
- [ ] Bukhari 6732 tooltip: Arabic hadith + narrator + Sahih grade
- [ ] `HADITH_DATA` const in `inheritance.js` with correct Arabic + English
- [ ] `VERSE_DATA` has full extended Arabic text for 4:11 (not abbreviated)
- [ ] FAQ Q4 explains why no madhab selector

### Design System

- [ ] `<html lang="en" data-theme="light">`
- [ ] Font preconnect: Cormorant Garamond + Inter + Amiri (exact order)
- [ ] `:root` and `[data-theme="dark"]` are separate sibling blocks
- [ ] `applyTheme()` inline in `<head>` before CSS
- [ ] 10 nav links in correct order; Tools = `.active`
- [ ] Bismillah first in `.hero-inner`
- [ ] No shimmer on any card
- [ ] Footer: `ft-` system, col 2 = "Tools", 8 Quick Access, 4 Ecosystem

### Calculation Accuracy

- [ ] Husband: 1/2 (no children) — source: An-Nisa 4:12
- [ ] Husband: 1/4 (with children) — source: An-Nisa 4:12
- [ ] Wife: 1/4 (no children) — source: An-Nisa 4:12
- [ ] Wife: 1/8 (with children) — source: An-Nisa 4:12
- [ ] 4 wives: total 1/8, per-wife = 1/32
- [ ] 1 daughter only: exactly 0.5 — source: An-Nisa 4:11
- [ ] 2+ daughters only: exactly 0.6667 (2/3) — source: An-Nisa 4:11
- [ ] Son + daughter: 2:1 residue — source: An-Nisa 4:11 · Bukhari 6732
- [ ] Father + children: 1/6 fixed — source: An-Nisa 4:11
- [ ] Mother + children: 1/6 fixed — source: An-Nisa 4:11
- [ ] Mother alone (no children, <2 siblings): 1/3
- [ ] All share values sum to ≤ 1.0 (never exceed)
- [ ] Distributable never negative: `Math.max(0,...)` present

### Ḥijb (Blocking) Rules

- [ ] Grandfather blocked when father present
- [ ] Paternal grandmother blocked by father or mother
- [ ] Grandsons/granddaughters blocked when sons present
- [ ] Full siblings blocked when sons present
- [ ] Full siblings blocked when father present
- [ ] Paternal half-siblings blocked by full siblings (when father absent)
- [ ] Maternal half-siblings blocked by children or father

### Verse Tooltips

- [ ] An-Nisa 4:11 tooltip: correct Arabic text present
- [ ] An-Nisa 4:12 tooltip: correct Arabic text present
- [ ] An-Nisa 4:176 tooltip: correct Arabic text present
- [ ] Bukhari 6732 tooltip: Arabic hadith + narrator + grade
- [ ] Arabic in all tooltips: `font-family: Amiri; direction: rtl`

### UI Behaviour

- [ ] Heir spinners hidden on load; show on checkbox tick
- [ ] Husband row hides when deceased = male
- [ ] Wife row hides when deceased = female
- [ ] Distribution chart segments sum to 100% width
- [ ] Blocked heirs: `.blocked-row` with muted styling + reason text
- [ ] Print: results section only visible in `@media print`
- [ ] Share button: copies URL + `showToast()`
- [ ] `#distributableDisplay` updates live on estate/debt/funeral input

### Edge Cases

- [ ] Estate = 0 → error shown, no results
- [ ] No heirs → error shown, no results
- [ ] Deductions > estate → error shown, no results
- [ ] Share URL round-trip: encode → paste URL → restore → same result

### Responsive

- [ ] 820px: form cards stack correctly
- [ ] 760px: hamburger visible
- [ ] 600px: shares grid collapses
- [ ] 440px: table scrollable horizontally

**Report:** PASS or FAIL for each item. For FAILs, state the exact fix required.

---

## Step 4.5D — QA Checklist: `tools.html` Patch

### AI Claim Verifier Card

- [ ] Element is `<a>` (not `<div>`)
- [ ] `href="verify.html"`
- [ ] `class` includes `"tool-card"` and `"reveal"`
- [ ] `data-cat="discovery"`
- [ ] Status badge: `.ts-live` with text "● Live"
- [ ] Title: "AI Claim Verifier" (exact)
- [ ] CTA: "Verify a Claim →" (not "Launching 2026")
- [ ] No `opacity:0.75` inline style
- [ ] No `cursor:default` inline style
- [ ] No `onclick` modal handler
- [ ] Tags: AI-Powered · 61K+ Hadith · Grades

### Inheritance Calculator Card

- [ ] Element is `<a href="inheritance.html">`
- [ ] `data-cat="finance"`
- [ ] Status badge: `.ts-new` with text "● New"
- [ ] Title: "Inheritance Calculator" (exact)
- [ ] CTA: "Calculate Shares →"
- [ ] Tags: Faraid · Qur'an · Miras
- [ ] Icon: `.ti-gold` with balance scales SVG
- [ ] Description mentions An-Nisa 4:11–12, 4:176

### Filter Behaviour

- [ ] `filterTools('finance')` shows Inheritance Calculator card
- [ ] `filterTools('discovery')` shows AI Claim Verifier card
- [ ] `filterTools('all')` shows both (+ all other 11 = 13 total)
- [ ] Total tool cards = 13

**Report:** PASS or FAIL.

---

## Step 4.5E — Git Commit

```bash
git add src/tools.html src/inheritance.html src/css/inheritance.css src/js/inheritance.js
git add docs/prd/IslamicInfo_InheritanceCalc_PRD_v1_0.md
git add docs/tech-specs/inheritance-calculator-technical-doc.md

git commit -m "feat(tools+inheritance): add inheritance calculator, fix AI verifier card

tools.html patches:
- AI Claim Verifier: ungreyed, now <a href=verify.html>, ts-live badge
- Inheritance Calculator: new card added, Finance & Fiqh, ts-new badge
- Total tool cards: 13 (was 12)

inheritance.html (new page):
- Faraid calculator: Qur'an + Sahih Hadith — no madhab framing
- Hijb (blocking) rules: son blocks siblings/grandchildren, father blocks grandfather
  Source: Bukhari 6732 · Muslim 1615 on every blocked row
- Fixed shares (Fard): spouse 1/8–1/2, parents 1/6–1/3, daughters 1/2–2/3
  Source: An-Nisa 4:11–12 on every fard row
- Asabah (residue): sons+daughters 2:1 ratio
  Source: Bukhari 6732 · Muslim 1615 on every asabah row
- Verse + hadith tooltips: Arabic + English on click
- Distribution chart: CSS flex, no library
- Disclaimer: hard-coded HTML, fatwa-free, no madhab reference
- Share URL: URLSearchParams encode/restore
- Print styles: results-only @media print
- Light + dark mode complete
- Tools nav item stays .active"

git push origin main
```

---

## Quick Reference — Share Mapping

| Heir | Condition | Share | Source |
|---|---|---|---|
| Husband | No children | 1/2 | An-Nisa 4:12 |
| Husband | With children | 1/4 | An-Nisa 4:12 |
| Wife/wives | No children | 1/4 total | An-Nisa 4:12 |
| Wife/wives | With children | 1/8 total | An-Nisa 4:12 |
| 1 Daughter only | No sons | 1/2 | An-Nisa 4:11 |
| 2+ Daughters only | No sons | 2/3 | An-Nisa 4:11 |
| Sons + Daughters | Together | 2:1 residue | An-Nisa 4:11 · Bukhari 6732 |
| Father | With children | 1/6 | An-Nisa 4:11 |
| Father | No children | Full residue (Asabah) | Bukhari 6732 |
| Mother | With children or 2+ siblings | 1/6 | An-Nisa 4:11 |
| Mother | Alone (no children, <2 siblings) | 1/3 | An-Nisa 4:11 |
| Full siblings | Kalala case | Various | An-Nisa 4:176 |
| Any blocked heir | — | Excluded | Bukhari 6732 · Muslim 1615 |

---

*End of Build & QA Prompt Guide — Step 4.5*
*Add to PROMPT_TEMPLATES.md between Step 4 and Step 5*
