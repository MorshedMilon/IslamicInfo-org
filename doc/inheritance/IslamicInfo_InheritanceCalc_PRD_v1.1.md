# Islamic Inheritance Calculator — Product Requirements Document
**`inheritance.html` · IslamicInfo.org · Faraid / Mīrāth Calculator**
*v1.1 · 2026-05-20*

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-05-20 | Initial PRD |
| v1.1 | 2026-05-20 | Removed madhab selector and all madhab framing. Fixed shares are Qur'anic — not madhab-dependent. Ḥijb rules cite Bukhari 6732 / Muslim 1615 directly. Updated disclaimer, eyebrow, FAQ, scope, and methodology section. |

---

## 1. Executive Summary

The Islamic Inheritance Calculator (`inheritance.html`) calculates estate distribution directly from:

- **Qur'an:** An-Nisa 4:11, 4:12, 4:176 — fixed shares (Fard)
- **Sahih Hadith:** Bukhari 6732, Muslim 1615 — Ḥijb (blocking) rules and Aṣabah (residue)

**The fixed shares (Fard) are explicitly stated in the Qur'an. They are not scholarly opinion or madhab interpretation.** Blocking rules (Ḥijb) are derived from authenticated Sunnah, not from any school of thought.

Madhab differences apply only to rare edge cases (Radd distribution, Mushtarakah, complex grandmother chains) — none covered in v1. There is therefore no madhab selector and no madhab framing on this page.

Every output cites its exact Qur'anic verse or hadith. The tool never issues a fatwa.

**Product Vision:** The most transparent Islamic inheritance calculator available — every number directly traceable to the Qur'an or an authenticated hadith, every share labelled with its classical Arabic term.

---

## 2. Page Anatomy

| Zone | Component | ID / Class |
|---|---|---|
| 1 | Global header | `.site-header` |
| 2 | Hero | `.hero` |
| 3 | Calculator form | `#calc-section` |
| 4 | Results panel | `#results-section` |
| 5 | Sources reference | `#methodology-section` |
| 6 | FAQ accordion | `#faq-section` |
| 7 | CTA + Footer | Standard |

**Route:** `/inheritance`  
**File:** `inheritance.html`  
**Linked from:** `tools.html` — Finance & Fiqh category  
**Nav active state:** Tools (not Inheritance — this is a sub-page)

---

## 3. Hero Section

```
Bismillah (.bismillah-hero-top)
Eyebrow: "Faraid Calculator · Qur'an 4:11–12, 4:176 · Sahih Bukhari & Muslim"
H1: Islamic <span class="grad-it">Inheritance</span> Calculator
Subtext: Calculate estate shares directly from the Qur'an (An-Nisa 4:11–12, 4:176)
         and Sahih hadith. Every share cites its primary source.
Arabic: وَلِكُلٍّ جَعَلْنَا مَوَٰلِىَ مِمَّا تَرَكَ ٱلْوَٰلِدَانِ وَٱلْأَقْرَبُونَ (An-Nisa 4:33)
CTAs:  [btn-primary] "Calculate Shares" → #calc-section
       [btn-ghost]   "View Sources"     → #methodology-section
```

---

## 4. Calculator Form (`#calc-section`)

### 4.1 Card 1 — Estate Details

| Field | Element | ID | Constraints |
|---|---|---|---|
| Total Estate Value | `input[type=number]` | `estateValue` | `min=1` |
| Currency | `select` | `currencySelect` | USD / GBP / EUR / SAR / PKR / BDT / Other |
| Outstanding Debts | `input[type=number]` | `debtAmount` | `min=0` |
| Funeral Expenses | `input[type=number]` | `funeralAmount` | `min=0` |
| Distributable Estate | display only | `distributableDisplay` | Live-updated; teal-700; Cormorant 24px |

**Formula:** `Distributable = max(0, Estate − Debts − Funeral)`  
Wire all three numeric inputs → `updateDistributableDisplay()` on `input` event.

### 4.2 Card 2 — Deceased Gender

```html
<fieldset>
  <input type="radio" name="deceasedGender" value="male" checked>  Male
  <input type="radio" name="deceasedGender" value="female">         Female
</fieldset>
```

The husband/wife checkbox display in Card 3 toggles based on this selection.

### 4.3 Card 3 — Surviving Heirs

Each heir row: checkbox + label + conditional count spinner (hidden by default; shows on checkbox tick via `toggleHeirSpinner()`).

#### Spouse
| Heir | Checkbox ID | Spinner ID | Range | Condition |
|---|---|---|---|---|
| Husband | `heirHusband` | — | — | Show only if deceased = Female |
| Wife / Wives | `heirWife` | `wifeCount` | 1–4 | Show only if deceased = Male |

#### Children
| Heir | Checkbox ID | Spinner ID | Range |
|---|---|---|---|
| Son(s) | `heirSon` | `sonCount` | 1–20 |
| Daughter(s) | `heirDaughter` | `daughterCount` | 1–20 |
| Son's Son(s) — Grandson | `heirGrandson` | `grandsonCount` | 1–20 |
| Son's Daughter(s) — Granddaughter | `heirGranddaughter` | `granddaughterCount` | 1–20 |

#### Parents
| Heir | Checkbox ID | Spinner |
|---|---|---|
| Father | `heirFather` | — |
| Mother | `heirMother` | — |
| Paternal Grandfather | `heirPatGrandfather` | — |
| Paternal Grandmother | `heirPatGrandmother` | — |
| Maternal Grandmother | `heirMatGrandmother` | — |

#### Siblings
| Heir | Checkbox ID | Spinner ID | Range |
|---|---|---|---|
| Full Brother(s) | `heirFullBrother` | `fullBrotherCount` | 1–20 |
| Full Sister(s) | `heirFullSister` | `fullSisterCount` | 1–20 |
| Paternal Half-Brother(s) | `heirPatHalfBrother` | `patHalfBrotherCount` | 1–20 |
| Paternal Half-Sister(s) | `heirPatHalfSister` | `patHalfSisterCount` | 1–20 |
| Maternal Half-Brother(s) | `heirMatHalfBrother` | `matHalfBrotherCount` | 1–20 |
| Maternal Half-Sister(s) | `heirMatHalfSister` | `matHalfSisterCount` | 1–20 |

### 4.4 Validation + Calculate Button

```html
<div id="calcError" class="calc-error" style="display:none"></div>
<button id="calcBtn" class="btn-primary" onclick="runCalculation()">Calculate Shares</button>
```

**Validation rules:**
- Estate value must be `> 0`
- Debts + Funeral must not exceed estate value
- At least one heir must be selected

---

## 5. Results Panel (`#results-section`)

Hidden on page load (`display:none`). Revealed after successful `runCalculation()`.

### 5.1 Estate Summary Strip

Three cells displayed horizontally:

| Cell | Label | Value |
|---|---|---|
| 1 | Total Estate | `$X` |
| 2 | Debts & Expenses | `−$Y` |
| 3 | Net Distributable | `$Z` |

### 5.2 Heir Results Table (`#heirsTableBody`)

Columns: **Heir · Share · Amount · Qur'anic Source · Note**

Source cells rendered as `.source-pill` with `data-verse` attribute. Click → `showVerseTooltip()`.

| Heir | Share | Source |
|---|---|---|
| Husband (no children) | 1/2 | An-Nisa 4:12 |
| Husband (with children) | 1/4 | An-Nisa 4:12 |
| Wife/wives (no children) | 1/4 total | An-Nisa 4:12 |
| Wife/wives (with children) | 1/8 total | An-Nisa 4:12 |
| 1 Daughter only | 1/2 | An-Nisa 4:11 |
| 2+ Daughters only | 2/3 | An-Nisa 4:11 |
| Son + Daughter together | 2:1 Residue | An-Nisa 4:11 + Bukhari 6732 |
| Father (with children) | 1/6 | An-Nisa 4:11 |
| Mother (with children / 2+ siblings) | 1/6 | An-Nisa 4:11 |
| Mother (alone, no children, <2 siblings) | 1/3 | An-Nisa 4:11 |
| Siblings — Kalala case | Various | An-Nisa 4:176 |
| Blocked heir (any) | — | Bukhari 6732 · Muslim 1615 |
| Aṣabah (residue) recipient | Remainder | Bukhari 6732 · Muslim 1615 |

Blocked heirs: displayed with `.blocked-row` class (muted styling) + reason text.

### 5.3 Distribution Chart (`#distribution-chart`)

CSS flex stacked bar — no canvas, no JS library.

- **Teal shades** for male-primary heirs: `#00696E`, `#2CA4AB`, `#5BC1C7`, `#0A3A3D`
- **Gold shades** for female-primary heirs: `#C5A059`, `#E8CE89`, `#9A7C3F`
- `#chart-legend`: flex-wrap legend items

### 5.4 Disclaimer (Hard-Coded — Never JS-Generated)

```
⚠️ Shares are calculated directly from the Qur'an (An-Nisa 4:11, 4:12, 4:176)
and Sahih hadith (Sahih al-Bukhari 6732, Sahih Muslim 1615).

The fixed shares (Fard) are stated explicitly in the Qur'an — they are not
scholarly opinion or madhab interpretation. Blocking rules (Ḥijb) are from
authenticated Sunnah, not from any school of thought.

Madhab differences apply only to rare edge cases not covered by this calculator.
IslamicInfo does not issue fatwas or legal rulings. For complex inheritance
situations — multiple grandmothers, bequests (Waṣiyyah), missing heirs, or
non-Muslim relatives — consult a qualified scholar or certified Faraid specialist.

Sources: An-Nisa 4:11, 4:12, 4:176 · Authenticated Sunnah
```

> **There is no madhab selector.** No dropdown, no "Hanafi default" note, no school-of-thought reference anywhere on the page.

### 5.5 Action Row

```
[🖨 Print / Save PDF]   [↗ Share Link]   [↺ Recalculate]
```

- **Print:** `window.print()` — @media print shows results only
- **Share:** `shareResult()` — encodes STATE to URLSearchParams, copies to clipboard + `showToast()`
- **Recalculate:** scrolls back to `#calc-section`

---

## 6. Sources Reference (`#methodology-section`)

**Section heading:** "Primary Sources"  
**Sub-heading:** *"Every share in this calculator is derived from one of three sources:"*

### Source Tier Cards (3 cards)

| Card | Source | Content |
|---|---|---|
| 1 | 📖 Qur'an | Fixed Shares (Fard) — An-Nisa 4:11, 4:12, 4:176 |
| 2 | 📚 Sahih al-Bukhari | Ḥijb + Aṣabah — Hadith 6732 |
| 3 | 📚 Sahih Muslim | Ḥijb + Aṣabah — Hadith 1615 |

### Shares Reference Grid (`.shares-grid`)

`repeat(auto-fill, minmax(220px, 1fr))` — 7 `.share-card` elements.

| Share | Classical Term | Arabic | Who Receives | Source |
|---|---|---|---|---|
| 1/2 | Niṣf | نِصْف | Sole daughter; sole full sister; husband (no children) | An-Nisa 4:11–12 |
| 1/4 | Rubʿ | رُبْع | Husband (with children); wife (no children) | An-Nisa 4:12 |
| 1/8 | Thumun | ثُمُن | Wife (with children) | An-Nisa 4:12 |
| 1/3 | Thulth | ثُلُث | Mother (no children, <2 siblings); 2+ maternal siblings | An-Nisa 4:11 |
| 2/3 | Thulthān | ثُلُثَان | 2+ daughters; 2+ full sisters | An-Nisa 4:11 |
| 1/6 | Sudus | سُدُس | Father/mother (with children); 1 maternal sibling | An-Nisa 4:11 |
| Residue | Aṣabah | عَصَبَة | Sons; father; brothers (after fixed shares paid) | Bukhari 6732 · Muslim 1615 |

Each card: fraction in Cormorant 28px teal + Arabic term + who + exact source.

---

## 7. FAQ Accordion (`#faq-section`)

5 questions — standard accordion, one open at a time via `toggleFaq()`.

**Q1: What is Faraid?**
The Qur'an dedicates more verses to inheritance than to any other single legal topic. An-Nisa 4:11–12 and 4:176 specify exact fractional shares for each heir category. These are direct divine instruction — not interpretations by scholars or jurists.

**Q2: Does this calculator cover all heirs?**
It covers the primary heirs specified in An-Nisa 4:11–12 and 4:176, plus blocking rules (Ḥijb) from Sahih Bukhari 6732 and Muslim 1615. Complex scenarios — multiple grandmothers, great-grandchildren chains, Radd distribution, Waṣiyyah (bequests) — require a qualified scholar.

**Q3: What is Aṣabah (residue)?**
After all Qur'anically specified fixed shares are distributed, the remainder goes to the nearest male relative (Aṣabah). The Prophet ﷺ said: *"Give the fixed shares to those entitled. What remains goes to the nearest male."* (Bukhari 6732, Muslim 1615). This is Sunnah, not madhab opinion.

**Q4: Why is there no madhab selector?**
Because the shares this calculator computes are from the Qur'an directly. An-Nisa 4:11 states the shares of children. An-Nisa 4:12 states the shares of spouses. These are not interpretations — they are Qur'anic text. Madhab differences apply only to rare edge cases not covered here.

**Q5: My situation is complex — what should I do?**
For situations involving bequests (Waṣiyyah), non-Muslim relatives, missing heirs, simultaneous deaths, or multiple generations of grandparents — consult a qualified Islamic scholar or a certified Faraid specialist. This calculator handles clear-cut cases directly stated in the Qur'an.

---

## 8. CTA Section

```
Background: deep teal gradient
H2: "Knowledge is the foundation of just distribution."
Arabic: إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا (An-Nisa 4:58)

[btn-gold]        → tools.html   "Back to All Tools"
[btn-white-ghost] → verify.html  "Verify a Claim"
[btn-white-ghost] → hadith.html  "Hadith Library"
```

---

## 9. Scope

### In Scope — v1

- Qur'anic fixed shares (Fard) for all primary heirs: An-Nisa 4:11, 4:12, 4:176
- Ḥijb (blocking) rules from Bukhari 6732 + Muslim 1615
- Aṣabah (residue) distribution from Bukhari 6732 + Muslim 1615
- Source citation on every result row (verse or hadith number)
- Verse tooltip (Arabic + English) on click
- Print/PDF + shareable URL
- Light + dark mode
- No madhab selector

### Out of Scope — v1 (require scholar consultation)

- Radd (return) distribution — minor madhab variance exists here
- Waṣiyyah (bequests) — max 1/3 rule
- Non-Muslim heirs, missing heirs, unborn children
- Multi-generation complex chains (great-grandchildren, etc.)
- Mushtarakah problem
- Simultaneous death scenarios

---

## 10. Source References (Verbatim — Hardcoded in HTML)

### Qur'anic Verses

**An-Nisa 4:11** (Children and Parents)

Arabic:
> يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ ۚ فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ ۖ وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ

English: *"Allah instructs you concerning your children: for the male, what is equal to the share of two females. But if there are [only] daughters, two or more, for them is two-thirds of what he left. And if there is only one, for her is half."*

---

**An-Nisa 4:12** (Spouses)

Arabic:
> وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ ۚ فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ

English: *"And for you is half of what your wives leave if they have no child. But if they have a child, for you is one-quarter of what they leave."*

---

**An-Nisa 4:176** (Kalala — siblings, no parents or children)

Arabic:
> يَسْتَفْتُونَكَ قُلِ اللَّهُ يُفْتِيكُمْ فِي الْكَلَالَةِ ۚ إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ

English: *"They request from you a ruling. Say: Allah gives you a ruling concerning the kalala. If a man dies, leaving no child but a sister, for her is half of what he left."*

---

### Sahih Hadith

**Sahih al-Bukhari 6732 · Sahih Muslim 1615** (Aṣabah and Ḥijb)

Arabic:
> أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا، فَمَا بَقِيَ فَهُوَ لأَوْلَى رَجُلٍ ذَكَرٍ

English: *"Give the fixed shares (Fard) to those entitled to them. Whatever remains goes to the nearest male relative (Asabah)."*

Narrator: Ibn Abbas (رضي الله عنه)  
Grade: **Sahih — Agreed upon (Bukhari and Muslim)**

---

*End of PRD v1.1*
