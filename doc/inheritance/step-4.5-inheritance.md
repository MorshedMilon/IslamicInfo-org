# Step 4.5 — Inheritance Calculator + Tools Page Patch
**Add to `PROMPT_TEMPLATES.md` after Step 4 (Tools)**
*v1.0 · 2026-05-20*

---

## STEP 4.5A — Patch `tools.html` (Run When You Build Tools)

When building `src/tools.html`, add this instruction to your **Step 4 Build Prompt**
at the end of the page-specific requirements section:

```
TOOL CARD PATCHES (apply during initial build — do not build the old Coming Soon card):

1. AI CLAIM VERIFIER CARD — Build as LIVE (not Coming Soon):
   - Element: <a href="verify.html" class="tool-card reveal reveal-d2" data-cat="discovery">
   - Status badge: <span class="tool-status ts-live">● Live</span>
   - Title: "AI Claim Verifier"
   - CTA text: "Verify a Claim →"
   - Tags: AI-Powered · 61K+ Hadith · Grades
   - NO opacity:0.75, NO cursor:default, NO modal onclick, NO "Launching 2026"

2. INHERITANCE CALCULATOR CARD — Add as NEW card in Finance & Fiqh category:
   - Element: <a href="inheritance.html" class="tool-card reveal" data-cat="finance">
   - Icon: .ti-gold + balance scales SVG (path: M12 3v18M3 6l9-3 9 3M6 10l-3 8h6l-3-8zM18 10l-3 8h6l-3-8z)
   - Status badge: <span class="tool-status ts-new">● New</span>
   - Title: "Inheritance Calculator"
   - Description: "Calculate estate shares according to Qur'anic Faraid law.
     Every share cites An-Nisa 4:11–12, 4:176. Authentic. Scholar-verified."
   - Tags: Faraid · Qur'an · Miras
   - CTA text: "Calculate Shares →"
   - Total tool cards after patch: 13 (was 12)
   - Finance & Fiqh category now has: Zakat, Sadaqah Tracker, Inheritance Calculator
```

---

## STEP 4.5B — Build Prompt: `inheritance.html`

Run this AFTER Step 4 (tools.html) is built and QA'd.

```
Read these files in full before writing any code:
1. .claude/CLAUDE.md
2. docs/skill/SKILL.md
3. docs/prd/IslamicInfo_InheritanceCalc_PRD_v1_0.md
4. docs/tech-specs/inheritance-calculator-technical-doc.md

Build src/inheritance.html + src/css/inheritance.css + src/js/inheritance.js.

Shell requirements:
- Import src/css/tokens.css, src/css/global.css, src/css/inheritance.css
- Import src/js/global.js, src/js/inheritance.js at end of body
- applyTheme() inline script in <head> before CSS
- All 10 nav links in exact order
- IMPORTANT: Tools = .active (NOT a standalone nav page — this is a Tools sub-page)
- #mobileMenu overlay with all 10 nav links; Tools = .mm-link.active
- Footer: ft- system, col 2 heading = "Tools", all 8 Quick Access links, 4 Ecosystem links

HERO:
- Bismillah first inside .hero-inner
- Eyebrow: "Faraid Calculator · Qur'an 4:11–12, 4:176 · Sahih Bukhari & Muslim"
- H1: Islamic <span class="grad-it">Inheritance</span> Calculator
- Sub-text: explanation + verse refs
- Arabic: وَلِكُلٍّ جَعَلْنَا مَوَٰلِىَ مِمَّا تَرَكَ (An-Nisa 4:33)
- btn-primary → #calc-section · btn-ghost → #methodology-section

CALCULATOR FORM (#calc-section), 3 cards max-width 760px centered:

Card 1 — Estate Details:
- #estateValue: type=number, min=1
- #currencySelect: USD/GBP/EUR/SAR/PKR/BDT/Other
- #debtAmount: type=number, min=0
- #funeralAmount: type=number, min=0
- #distributableDisplay: live-updates on input, teal-700, Cormorant 24px
- Wire: ['estateValue','debtAmount','funeralAmount'] all → updateDistributableDisplay()

Card 2 — Deceased gender: 2 radio buttons name="deceasedGender" male/female

Card 3 — Heirs checklist:
- 6 fieldset groups: Spouse, Children, Parents, Siblings
- Each heir: .heir-checkbox + label + conditional .heir-count number spinner
- Spinner shows/hides via toggleHeirSpinner() when checkbox toggled
- husband/wife toggle based on deceased gender radio
- Wife spinner: 1–4 range (up to 4 wives)
- All other heir count spinners: 1–20

#calcError div (display:none by default) + #calcBtn .btn-primary

RESULTS SECTION (#results-section, display:none on load):
- .estate-summary-strip: 3 cells (Total / Deductions / Net Distributable)
- #heirsTableBody: table rows rendered by renderResults()
  Columns: Heir | Share | Amount | Qur'anic Source | Note
  Blocked heirs: .blocked-row class, muted styling
  Source cells: .source-pill span with data-verse attribute + click tooltip
- #distribution-chart: CSS flex stacked bar (no library)
  Teal shades for male-primary heirs, gold shades for female-primary heirs
- #chart-legend: flex-wrap legend items
- .disclaimer: HARD-CODED HTML — never JS-generated:
  "⚠️ This calculator presents shares according to the Hanafi school (default)
   and classical Faraid principles. Inheritance rulings vary between madhabs and
   depend on specific family circumstances. IslamicInfo does not issue fatwas or
   legal rulings. For a binding inheritance ruling, consult a qualified Islamic
   scholar or a certified Faraid specialist.
   Sources: An-Nisa 4:11, 4:12, 4:176 · Authenticated Sunnah"
- // NO #madhabSelect — removed entirely
- .result-actions: Print (window.print()), Share (shareResult()), Recalculate

CALCULATION ENGINE (in inheritance.js):

STATE object shape — see tech spec §3.1

readForm() — syncs all inputs to STATE

getDistributable() — Math.max(0, estate - debt - funeral)

validateForm() — returns errors array; estate > 0 + at least 1 heir

applyHijb(heirs) — returns blocked{} object:
  - Grandfather blocked by father
  - Grandsons/granddaughters blocked by sons
  - Full/paternal siblings blocked by son or father
  - Paternal half-siblings blocked by full siblings
  - Maternal half-siblings blocked by children or father

calculateShares(distributable, heirs, gender) — returns HeirResult[]:
  Step 1: Apply Hijb
  Step 2: Fixed shares (Fard):
    - Husband: 1/2 (no children) or 1/4 (with children) — An-Nisa 4:12
    - Wife(s): 1/4 (no children) or 1/8 (with children) — An-Nisa 4:12
    - Father with children: 1/6 — An-Nisa 4:11
    - Mother: 1/6 (children present or 2+ siblings) or 1/3 — An-Nisa 4:11
    - Daughters only (no sons): 1 daughter=1/2, 2+ daughters=2/3 — An-Nisa 4:11
  Step 3: Asabah (residue = 1 - assigned):
    - Sons + daughters together: 2:1 ratio (male:female) — An-Nisa 4:11
    - Sons only: split equally
    - Father alone (no children): takes full residue
  Step 4: Add blocked rows
  Guard: Math.max(0, 1 - assigned) for residue — never negative

runCalculation():
  1. readForm()
  2. validateForm() → show #calcError or proceed
  3. getDistributable()
  4. calculateShares()
  5. renderResults()
  6. showResults() + smooth scroll to #results-section

renderResults(results, distributable):
  - Update estate summary strip
  - Build table rows via DOM (not innerHTML template)
  - Call renderChart()
  - Wire .source-pill click → showVerseTooltip()

renderChart(results, distributable):
  CSS flex bar — no canvas, no library
  Teal shades: ['#00696E','#2CA4AB','#5BC1C7','#0A3A3D']
  Gold shades: ['#C5A059','#E8CE89','#9A7C3F']

VERSE_DATA const (hardcoded):
  'An-Nisa 4:11': arabic + english (see PRD §11 for exact text)
  'An-Nisa 4:12': arabic + english
  'An-Nisa 4:176': arabic + english

showVerseTooltip(verseRef, anchor):
  - Creates/repositions single #verse-tooltip div
  - Shows Arabic (Amiri, RTL) + English + reference
  - Closes on outside click

shareResult():
  - Encodes STATE to URLSearchParams
  - navigator.clipboard.writeText(url) + showToast()

restoreFromURL():
  - Parses ?estate=&debt=&gender=&heirs= params
  - Pre-fills form + auto-runs calculation

METHODOLOGY SECTION (#methodology-section):
- .shares-grid: repeat(auto-fill, minmax(220px,1fr))
- 7 .share-card elements: 1/2 (Nisf), 1/4 (Rub), 1/8 (Thumun),
  1/3 (Thulth), 2/3 (Thulthan), 1/6 (Sudus), Residue (Asabah)
- Each: fraction (Cormorant 28px teal) + Arabic term + who + verse ref

FAQ (#faq-section):
- 5 items, standard toggleFaq() — one open at a time
- Q1: What is Faraid?
- Q2: Does this cover all heirs?
- Q3: What is Asabah?
- Q4: My situation isn't covered
- Q5: Which madhab?

CTA:
- btn-gold → tools.html "Back to All Tools"
- btn-white-ghost → verify.html "Verify a Claim"
- btn-white-ghost → hadith.html "Hadith Library"

@media print styles:
- Hide: header, nav, form inputs, footer, CTA
- Show: results section only
- Page title: "Islamic Inheritance Calculation — IslamicInfo.org"

Light + dark mode complete.
Responsive: 1100px, 820px, 760px, 600px, 440px.

Output: src/inheritance.html + src/css/inheritance.css + src/js/inheritance.js
```

---

## STEP 4.5C — QA Prompt: `inheritance.html`

```
Review src/inheritance.html + src/css/inheritance.css + src/js/inheritance.js
against docs/skill/SKILL.md §19 and docs/tech-specs/inheritance-calculator-technical-doc.md §14.3.

DESIGN SYSTEM (standard checks):
[ ] <html lang="en" data-theme="light">
[ ] Font preconnect: Cormorant Garamond + Inter + Amiri exact order
[ ] :root and [data-theme="dark"] separate sibling blocks
[ ] applyTheme() inline in <head>
[ ] 10 nav links correct order; Tools = .active (NOT Inheritance)
[ ] Bismillah first in .hero-inner
[ ] No shimmer on any card
[ ] Footer: ft- system, col 2 = "Tools", 8 Quick Access, 4 Ecosystem correct

CALCULATION ACCURACY:
[ ] Husband: 1/2 (no children) verified
[ ] Husband: 1/4 (with children) verified
[ ] Wife: 1/4 (no children) verified
[ ] Wife: 1/8 (with children) verified
[ ] 4 wives: total 1/8, perPerson = total/4 verified
[ ] 1 daughter only: exactly 0.5 (not 2/3)
[ ] 2+ daughters only: exactly 0.6667 (2/3)
[ ] Son + daughter: 2:1 ratio, residue only
[ ] Father + children: 1/6 fixed
[ ] Mother + children: 1/6 fixed
[ ] Mother alone, no children, <2 siblings: 1/3
[ ] All share values sum to ≤ 1.0 (never exceed)
[ ] Distributable never negative: Math.max(0,...) present

HIJB (BLOCKING) RULES:
[ ] Grandfather blocked when father present
[ ] Grandsons/granddaughters blocked when sons present
[ ] Full siblings blocked when sons present
[ ] Full siblings blocked when father present
[ ] Paternal half-siblings blocked by full siblings
[ ] Maternal half-siblings blocked by children

DISCLAIMER:
[ ] Disclaimer text is HARD-CODED HTML — no JS injection
[ ] Contains "does not issue fatwas or legal rulings"
[ ] Contains all three verse references (4:11, 4:12, 4:176)

VERSE TOOLTIPS:
[ ] An-Nisa 4:11 tooltip: correct Arabic text
[ ] An-Nisa 4:12 tooltip: correct Arabic text
[ ] An-Nisa 4:176 tooltip: correct Arabic text
[ ] Arabic in tooltips: font-family Amiri, direction:rtl

EDGE CASES:
[ ] Estate = 0 → error shown, no results
[ ] No heirs → error shown, no results
[ ] Deductions > estate → distributable = 0 + warning
[ ] Non-Hanafi madhab → toast + reverts to Hanafi
[ ] Share URL round-trip: encode → paste URL → restore → same result

UI:
[ ] Heir spinners hidden on load, show on checkbox tick
[ ] Husband/wife shows based on deceased gender radio
[ ] Distribution chart: segments sum to 100% width
[ ] Blocked heirs: .blocked-row with muted styling + reason
[ ] Print: results only visible in @media print
[ ] Share button: copies URL + showToast()

RESPONSIVE:
[ ] 820px: form cards stack correctly
[ ] 760px: hamburger visible
[ ] 600px: shares grid collapses
[ ] 440px: table scrollable horizontally

Report: PASS or FAIL for each. FAILs with exact fix required.
```

---

## STEP 4.5D — QA Prompt: Tools Page Patch Verification

```
Verify the two tool card patches in src/tools.html:

AI CLAIM VERIFIER CARD:
[ ] Element is <a> (not <div>)
[ ] href="verify.html"
[ ] class includes "tool-card" and "reveal"
[ ] data-cat="discovery"
[ ] Status badge: .ts-live with text "● Live"
[ ] Title: "AI Claim Verifier" (exact)
[ ] CTA: "Verify a Claim →" (not "Launching 2026")
[ ] No opacity:0.75 inline style
[ ] No cursor:default inline style
[ ] No onclick modal handler
[ ] Tags: AI-Powered, 61K+ Hadith, Grades

INHERITANCE CALCULATOR CARD:
[ ] Element is <a href="inheritance.html">
[ ] data-cat="finance"
[ ] Status badge: .ts-new with text "● New"
[ ] Title: "Inheritance Calculator" (exact)
[ ] CTA: "Calculate Shares →"
[ ] Tags: Faraid, Qur'an, Miras
[ ] Icon: .ti-gold
[ ] Description mentions An-Nisa 4:11–12, 4:176

FILTER:
[ ] filterTools('finance') shows Inheritance Calculator card
[ ] filterTools('discovery') shows AI Claim Verifier card
[ ] filterTools('all') shows both (and all other 11 cards = 13 total)
[ ] Total tool cards = 13

Report: PASS or FAIL.
```

---

## STEP 4.5E — Git Prompt

```
git add src/tools.html src/inheritance.html src/css/inheritance.css src/js/inheritance.js
git add docs/prd/IslamicInfo_InheritanceCalc_PRD_v1_0.md
git add docs/tech-specs/inheritance-calculator-technical-doc.md

git commit -m "feat(tools+inheritance): add inheritance calculator, fix AI verifier card

tools.html patches:
- AI Claim Verifier: ungreyed, now <a href=verify.html>, ts-live badge
- Inheritance Calculator: new card added, Finance & Fiqh, ts-new badge
- Total tool cards: 13 (was 12)

inheritance.html (new page):
- Faraid calculator: Hanafi school, primary heirs
- Hijb (blocking) rules: son blocks siblings/grandchildren, father blocks grandfather
- Fixed shares (Fard): spouse 1/8-1/2, parents 1/6-1/3, daughters 1/2-2/3
- Asabah (residue): sons+daughters 2:1 ratio
- Verse tooltips: An-Nisa 4:11, 4:12, 4:176 with Arabic + English
- Distribution chart: CSS flex, no library
- Disclaimer: hard-coded, fatwa-free
- Share URL: URLSearchParams encode/restore
- Print styles: results-only @media print
- Light + dark mode complete
- Tools nav item stays .active"

git push origin main
```

---

*Add this file's content into PROMPT_TEMPLATES.md between Step 4 and Step 5*
*File: docs/prompts/step-4.5-inheritance.md*
