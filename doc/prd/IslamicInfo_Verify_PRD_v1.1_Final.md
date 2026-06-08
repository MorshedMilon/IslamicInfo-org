**PRODUCT REQUIREMENTS DOCUMENT**

IslamicInfo Verify Page --- verify.html

*Claim Verification Engine*

Version 1.1 · IslamicInfo.org · May 2026 · Final

  ---------------- -------------------------------------------------
  **Document       Product Requirements Document (PRD)
  Type**           

  **Product**      IslamicInfo Claim Verification Engine

  **Page File**    verify.html (verify\_\_1\_.html mockup ---
                   canonical blueprint)

  **Design         CLAUDE.md v3.0 --- IslamicInfo Design System
  System**         

  **Functional     Verify_Page_Functional_Document.md v1.0
  Spec**           

  **Visual         verify\_\_1\_.html --- uploaded blueprint (source
  Mockup**         of truth)

  **Version**      1.1 --- Final (20 gaps resolved from v1.0 review)

  **Date**         May 2026

  **v1.1 Changes** SAMPLES array documented · Verify button SVG
                   specified · .reveal stagger classes per results
                   card · .geo opacity values · brand hover
                   animation · default summary content · animateDial
                   initial state · error flows · key constants
                   appendix · all medium/low gaps resolved

  **Status**       APPROVED --- Ready for Engineering Handoff
  ---------------- -------------------------------------------------

**Table of Contents**

1\. Executive Summary

2\. Product Overview & Context

3\. Page Architecture & Visual Layout

4\. Wireframe Descriptions --- Section by Section

4.1 Global Header

4.2 Hero Section

4.3 Trust Strip

4.4 Verify Box --- Input Interface

4.5 Loading State

4.6 Results Section (all sub-components)

4.7 How It Works Section

4.8 FAQ Accordion

4.9 CTA Section

4.10 Global Footer

5\. User Stories (US-001 -- US-018)

6\. Acceptance Criteria

7\. Feature Matrix

8\. Verification Logic & Verdict States

9\. Interactions & Animations

10\. Responsive Breakpoints

11\. Design System Constraints

12\. Routing & Action Map

13\. User Flows

14\. Out-of-Scope / Future Work

15\. Appendix --- JavaScript Function & CSS Class Inventory

**1. Executive Summary**

The IslamicInfo Verify page (verify.html) is the platform\'s claim
verification engine. It sits at position 9 in the global navigation ---
between Habit Tracker and About --- and is the primary tool for
cross-referencing Islamic claims, hadith, and social media quotes
against 61,000+ authenticated hadith and the full Qur\'an.

The page is entirely free, requires no account, and never issues fatwas
or personal rulings. It presents scholarly grades, narration chains
(Isnād), evidence cards, and scholar consensus --- then stops. This
editorial boundary is the product\'s core trust proposition.

**Core Capabilities**

- Accept input in four modes: Hadith, Quote, Claim, and Arabic text
  (RTL)

- Return one of four verdict grades: Ṣaḥīḥ (authentic), Ḥasan (sound),
  Ḍaʿīf (weak), Mawḍūʿ (fabricated)

- Display animated confidence dial (0--100%), narration chain, 4
  evidence cards, scholar consensus bar chart

- Load sample claims, paste from clipboard (Voice button), use
  quick-example chips

- Explain methodology via 3-step How It Works cards and 5-item FAQ
  accordion

- Showcase corpus depth in hero Trust Strip: 61K+ hadith · 6,236 verses
  · 6 collections · 100% source-cited

**Source Files Referenced**

> Visual Mockup: verify\_\_1\_.html --- canonical blueprint (source of
> truth for all layout, color, spacing, copy, component structure, and
> JavaScript logic)
>
> Functional Spec: Verify_Page_Functional_Document.md v1.0 --- complete
> interaction, state, and content specification
>
> Design System: CLAUDE_v3.md (CLAUDE.md v3.0) --- global tokens,
> typography, component rules, enforcement checklist

**Core Editorial Rules**

- Never issue a fatwa, personal ruling, or religious opinion --- cite
  authenticated sources only

- Disclaimer text is hard-coded and never replaced or modified by
  verification output

- Confidence score reflects scholarly consensus, not divine authority

- All hadith grades come from classical scholar verdicts --- not AI
  inference

- \'Not Found\' is a valid and clearly reported result

**2. Product Overview & Context**

**2.1 Platform Position --- Full Navigation**

IslamicInfo.org is a 10-page Islamic information platform. The Verify
page shares the global header, footer, design tokens, font stack, and
interaction behaviors defined in CLAUDE.md v3.0 with all other pages.

  ---------------------------------------------------------------------------------
  **\#**   **Page**     **File**               **Relationship to Verify Page**
  -------- ------------ ---------------------- ------------------------------------
  1        Home         index.html             Primary landing; top-level entry
                                               point

  2        Quran        quran.html             Linked from Verify CTA \'Explore
           Explorer                            Qur\'an\'

  3        Hadith       hadith.html            Closely related --- linked in footer
           Library                             col 2 and CTA

  4        Islamic      islamic-studies.html   NEVER learn.html --- shares design
           Studies                             system only

  5        Knowledge    knowledge-hub.html     NEVER omit --- must appear in all
           Hub                                 navs and footer

  6        Daily Duas   dua.html               Linked from Verify CTA \'Dua
                                               Library\'

  7        Tools        tools.html             Shares global header/footer

  8        Habit        habits.html            Adjacent nav item (position 8)
           Tracker                             

  9        Verify       verify.html            THIS PAGE --- active. Claim
                                               verification engine.

  10       About        about.html             Adjacent nav item (position 10)
  ---------------------------------------------------------------------------------

**2.2 Unique Design Characteristics**

The Verify page contains several components absent from all other
IslamicInfo pages: the Verify Box with mode selector, live
character/word counter, and four action buttons; the full Results
Section (verdict banner, confidence dial SVG, narration chain node flow,
4-card evidence grid, scholar consensus bar chart); and the FAQ
accordion. These components are page-specific and must not appear
elsewhere.

**2.3 Core Constraints**

- No account required --- fully anonymous and free

- No fatwas, personal rulings, or religious opinions issued anywhere on
  the page

- Disclaimer text is hard-coded --- never replaced by AI-generated
  content or API output

- All three fonts must be loaded: Cormorant Garamond · Inter · Amiri

- Dark mode fully supported via \[data-theme=\'dark\'\] CSS token
  overrides

- \'EN\' language button and \'Admin\' icon in header are UI
  placeholders --- no functionality in v1.0

- In v1.0: verification uses a 2200ms simulated delay; production
  requires a real backend API

**3. Page Architecture & Visual Layout**

Fixed top-to-bottom section order per functional spec §2. The Results
Section is nested inside .page-container alongside the Verify Box ---
not a separate top-level section. Sections may not be reordered.

  ---------------------------------------------------------------------------------------
  **Order**   **Section**   **Container /     **Type**          **Description**
                            ID**                                
  ----------- ------------- ----------------- ----------------- -------------------------
  1           Global Header .site-header      Sticky / Global   60px frosted glass. 10
                                                                nav links. Active: Verify
                                                                (pos 9).

  2           Mobile Menu   #mobileMenu       Overlay / Global  Full-screen nav. All 10
                                                                links. mmFade slide-in
                                                                animation.

  3           Hero Section  .hero             Page-specific     Bismillah · Eyebrow · H1
                                                                \'Trust. Verify.
                                                                Understand.\' · Sub-text

  4           Trust Strip   .trust-strip      Inside            4 stats: 61K+ Hadith ·
                                              .hero-inner       6,236 Verses · 6
                                                                Collections · 100%
                                                                Source-Cited

  5           Verify Box    .verify-box       Inside            Mode selector · Textarea
                                              .page-container   · Char counter · Action
                                                                bar · Quick chips

  6           Loading State #loadingState     Inside            3 animated bounce dots +
                                              .page-container   italic text. Hidden by
                                                                default.

  7           Results       #resultsSection   Inside            Verdict banner →
              Section                         .page-container   summary/dial → chain →
                                                                evidence → consensus →
                                                                disclaimer → try-another

  8           How It Works  .section          After             3 methodology cards + FAQ
                            (surface-card bg) .page-container   accordion. Background:
                                                                var(\--surface-card).

  9           CTA Section   .cta-section      Conversion        Deep teal gradient bg. 3
                                                                buttons. Always last
                                                                section before footer.

  10          Global Footer ft- CSS classes   Global            5-column footer. ft-
                                                                class prefix exclusively.
  ---------------------------------------------------------------------------------------

**4. Wireframe Descriptions --- Section by Section**

All descriptions reference the canonical visual mockup:
verify\_\_1\_.html. The mockup defines exact layout, spacing, color
values, copy, component structure, and all JavaScript behavior.
Descriptions below map visual zones to functional requirements.

**4.1 Global Header**

> Blueprint ref: verify\_\_1\_.html header --- CLAUDE.md §4.3--4.4.
> Height: 60px. position:sticky, top:0, z-index:100. Frosted glass
> background.

Three-zone layout. Left: IslamicInfo SVG brand logo + text. Center: 10
nav links (12.5px Inter, flex-centered, flex-shrink:0 per link, nowrap).
Right: 4 icon buttons + hamburger.

  -----------------------------------------------------------------------
  **Zone**   **Element**   **Behavior**
  ---------- ------------- ----------------------------------------------
  Left       Brand logo    SVG open-book mark + \'Islamic\'(teal-300) +
                           \'Info\'(gold-500). Hover: star rotates 45°
                           (star-spin 0.8s ease-reverent).

  Center     10 nav links  12.5px. Active \'Verify\': teal-700, weight
                           500, 2px teal→gold gradient underline via
                           ::after pseudo-element.

  Right      Search icon   id=\'searchTrigger\'. Opens #searchPopup
                           (340px). Auto-focus input after 50ms. Close:
                           Escape key or click outside.

  Right      EN button     UI placeholder only --- no i18n in v1.0.
                           Renders as icon-btn; no onclick action.

  Right      Theme toggle  id=\'themeBtn\'. Toggles
                           \[data-theme=\'dark\'\] on \<html\>. Persists
                           to localStorage \'islamicinfo-theme\'.

  Right      Admin icon    UI placeholder --- no auth flow in v1.0.

  Right      Hamburger     display:none until ≤760px.
                           onclick=\'openMM()\'. Hidden at wider
                           viewports.
  -----------------------------------------------------------------------

**4.2 Hero Section**

> Blueprint ref: verify\_\_1\_.html .hero --- CLAUDE.md §6. min-height:
> 60vh.

Full-width hero. Background: 3 overlapping radial gradients with bgD
animation (18s ease-in-out infinite alternate). 3 floating .geo SVG
decorators with geoRot animation (translateY+rotate). Content column:
max-width 780px, centered, text-align:center.

Top-to-bottom content order inside .hero-inner:

  ------------------------------------------------------------------------------------
  **Class**   **Position**   **Shape**    **Stroke   **Opacity**    **Animation**
                                          Color**                   
  ----------- -------------- ------------ ---------- -------------- ------------------
  .g1         top:7%,        Star         #00696E    opacity:.07    geoRot 28s linear
              left:4%        polygon +                              infinite
                             circle                                 

  .g3         top:10%,       Star polygon #C5A059    opacity:.055   geoRot 32s linear,
              right:5%                                              delay:-14s

  .g4         bottom:12%,    Circle       #00696E    opacity:.04    geoRot 20s linear,
              right:8%                                              delay:-7s
  ------------------------------------------------------------------------------------

1.  Bismillah (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ) --- Amiri font, teal gradient
    clip-text (light mode, opacity .92), gold gradient + drop-shadow
    (dark mode)

2.  Eyebrow badge (.hero-badge): \'Claim Verification Engine\' ---
    teal-tinted pill, gold .badge-dot pulse animation, fadeUp 0.6s

3.  H1 (.hero-title): \'Trust. \' (plain) + \'Verify.\' (\<span
    class=\'grad-it\'\> italic teal→gold gradient) + \' Understand.\'
    --- Cormorant 44--78px clamp

4.  Sub-text (.hero-sub): \'Paste any Islamic claim, hadith, or social
    media quote...\' --- fadeUp 0.7s delay 0.2s

5.  Trust Strip (§4.3) --- embedded as last child of .hero-inner ---
    fadeUp 0.7s delay 0.35s

**4.3 Trust Strip**

> Blueprint ref: verify\_\_1\_.html .trust-strip --- Functional Spec §6.
> Embedded inside hero below sub-text.

Horizontal flex row. Background: var(\--surface-card). Border: 0.5px
rgba(0,105,110,.10). Border-radius: var(\--r-xl). Overflow: hidden.
Box-shadow: var(\--elev-1). ::before pseudo-elements create 0.5px
vertical dividers.

  ---------------------------------------------------------------------------------------
  **Stat**   **Icon**   **Number**   **Label**      **CSS for Number**
  ---------- ---------- ------------ -------------- -------------------------------------
  1          📚         61K+         Hadith         var(\--font-display),
                                                    clamp(18--24px), teal-700, weight 600

  2          📖         6,236        Verses         var(\--font-display),
                                                    clamp(18--24px), teal-700, weight 600

  3          ⚖️         6            Collections    var(\--font-display),
                                                    clamp(18--24px), teal-700, weight 600

  4          🛡️         100%         Source-Cited   var(\--font-display),
                                                    clamp(18--24px), teal-700, weight 600
  ---------------------------------------------------------------------------------------

At ≤560px: wraps to 2×2; ::before dividers set to display:none. Dark
mode: background var(\--white), border-color rgba(0,105,110,.2).

**4.4 Verify Box --- Input Interface**

> Blueprint ref: verify\_\_1\_.html .verify-box --- Functional Spec §7.
> Primary interaction element of the page.

Inside .page-container (max-width:1060px, centered, padding-top:48px).
Glass morphism: rgba(255,255,255,.90), backdrop-filter:blur(24px),
border:1px rgba(0,105,110,.18), border-radius:28px. Decorative ::before
radial glow top-right. Dark mode: rgba(21,37,39,.92), border
rgba(0,105,110,.30). Entry: .reveal class.

**4.4.1 Label + Mode Selector (.verify-box-top)**

Flex row, space-between, wraps (gap:10px). Left: .verify-box-label ---
11px uppercase teal-700 with 18px teal line ::before prefix. Right: 4
.vmode buttons.

  ---------------------------------------------------------------------------------------------
  **Button**   **Mode**   **Default**   **onclick**                **Production Behavior**
  ------------ ---------- ------------- -------------------------- ----------------------------
  Hadith       hadith     Active (.on)  setMode(this,\'hadith\')   Strict hadith matching
                                                                   against Kutub al-Sittah

  Quote        quote      Inactive      setMode(this,\'quote\')    Semantic matching for
                                                                   paraphrased quotes

  Claim        claim      Inactive      setMode(this,\'claim\')    Broadest semantic search for
                                                                   general claims

  Arabic       arabic     Inactive      setMode(this,\'arabic\')   Exact Arabic text match →
                                                                   variant transmission search;
                                                                   textarea becomes RTL + Amiri
                                                                   font
  ---------------------------------------------------------------------------------------------

**4.4.2 Textarea (id=\'verifyInput\')**

min-height:140px, max-height:440px, resize:vertical. Font:
var(\--font-serif) 18px italic. Transparent background, no
border/outline. Default value on load: \'Did the Prophet say that
seeking knowledge is a duty upon every Muslim?\'

Placeholder (16.5px, ink-subtle): \"e.g., \'Did the Prophet ﷺ say that
seeking knowledge is mandatory for every Muslim?\' --- paste a full
hadith, a social media quote, or any Islamic claim...\"

Arabic mode overrides: direction:rtl; text-align:right;
font-family:var(\--font-arabic). Placeholder changes to: أدخل النص
العربي للحديث هنا...

**4.4.3 Character Counter (.char-counter)**

Right-aligned, 11px, var(\--ink-subtle). Format: \'\[N\] characters ·
\[W\] words\'. id=\'charCount\' (ta.value.length) and id=\'wordCount\'
(split /\\s+/ filter Boolean). Updates on every \'input\' event without
debounce. Returns 0 for empty string.

**4.4.4 Action Bar (.verify-actions)**

Flex row, wraps, top border separator 0.5px rgba(0,105,110,.10). 3 side
buttons left-aligned, Verify button right (margin-left:auto).

  -------------------------------------------------------------------------------
  **Button**   **Class**     **onclick**        **Behavior**
  ------------ ------------- ------------------ ---------------------------------
  Voice        .btn-side     pasteClipboard()   navigator.clipboard.readText() →
                                                ta.value → updateCounter. Alert
                                                \'Clipboard access denied\' on
                                                failure. Production: also
                                                SpeechRecognition API.

  Sample       .btn-side     loadSample()       ta.value =
                                                SAMPLES\[sampleIdx%5\];
                                                sampleIdx++; updateCounter();
                                                ta.focus(). Cycles 5 samples in
                                                order.

  Clear        .btn-side     clearInput()       ta.value=\'\'; updateCounter();
                                                ta.focus()

  Verify Claim #verifyBtn    runVerify()        Guard empty → .loading state →
               .btn-verify                      fade results → loading dots →
                                                2200ms → animate dial + bars +
                                                scroll. Button icon SVG (required
                                                for btn.innerHTML restore):
                                                viewBox=\'0 0 24 24\' path
                                                d=\'M12 22s8-4 8-10V5l-8-3-8
                                                3v7c0 6 8 10 8 10z\' + path
                                                d=\'M9 12l2 2 4-4\'.
                                                stroke-width:2.4, fill:none,
                                                stroke:currentColor.
  -------------------------------------------------------------------------------

**4.4.5 Quick Example Chips (.quick-examples)**

Flex row, wraps, margin-top:16px. Label \'Try:\' (.qex-label, 10.5px
uppercase). 5 .example-chip pills (12px, surface-card bg, teal border).
Hover: teal-700 fill, white text, translateY(-1px), glow shadow.

useChip(el): strip leading/trailing quotes via
replace(/\^\"\|\"\$/g,\'\').trim() → ta.value → updateCounter() →
ta.focus() → window.scrollTo({ top:
ta.closest(\'.verify-box\').offsetTop − 80, behavior: \'smooth\' }).
Uses ta.closest(\'.verify-box\') --- NOT a direct verify-box variable.

  -----------------------------------------------------------------
  **Chip Text (exact from verify\_\_1\_.html)**
  -----------------------------------------------------------------
  \"Cleanliness is half of faith\"

  \"The best of people are most beneficial to others\"

  \"Actions are by intentions\"

  \"Smile at your brother is sadaqah\"

  \"Seek knowledge even unto China\"
  -----------------------------------------------------------------

**4.5 Loading State (#loadingState)**

> Blueprint ref: verify\_\_1\_.html .analysis-loading --- Functional
> Spec §8. display:none by default.

Max-width:700px, centered, padding:28px, text-align:center. Shown during
runVerify() 2200ms window.

Visual: 3 .ld circles (10px, teal-500) with ldBounce keyframe (scale
0→1→0, 1.2s). Stagger delays: .ld:nth-child(2) +0.2s, :nth-child(3)
+0.4s. Loading text: Cormorant 16px italic ink-muted:
\'Cross-referencing authenticated collections...\'

**SAMPLES Array --- Exact Content (const SAMPLES, 5 items, 0-indexed)**

> GAP-03 FIX: SAMPLES must be declared as a const array in the JS.
> sampleIdx starts at 0 and is never reset --- it simply increments.
> SAMPLES\[sampleIdx % 5\] wraps around indefinitely.

  -------------------------------------------------------------------------
  **Index**   **Exact Sample String**                   **Notes**
  ----------- ----------------------------------------- -------------------
  0           Did the Prophet ﷺ say that seeking        Default pre-filled
              knowledge is a duty upon every Muslim?    textarea value on
                                                        page load. Also
                                                        SAMPLES\[0\].

  1           The Prophet said: \"Cleanliness is half   Loaded on first
              of faith.\" Is this authentic?            \'Sample\' click

  2           \"Actions are judged by intentions, and   Loaded on second
              each person will get what they            \'Sample\' click
              intended.\" --- Is this a hadith?         

  3           Is it true the Prophet said smiling at    Loaded on third
              your brother is an act of charity?        \'Sample\' click

  4           \"The best of people are those who are    Loaded on fourth
              most beneficial to others.\" --- Where    \'Sample\' click;
              does this come from?                      fifth click wraps
                                                        to index 0
  -------------------------------------------------------------------------

Note: the default textarea value on page load (\'Did the Prophet say
that seeking knowledge is a duty upon every Muslim?\') matches
SAMPLES\[0\] exactly. This is intentional --- the page loads
pre-verified. The sampleIdx variable starts at 0, so the first
\'Sample\' click loads SAMPLES\[0\] again, then increments to 1.

**runVerify() Full Sequence**

6.  Guard: if ta.value.trim() === \'\' → return immediately, no action

7.  Add .loading to #verifyBtn; btn.textContent = \'Verifying...\'

8.  resultsSection.style.opacity=\'0\';
    resultsSection.style.transition=\'opacity .3s\'

9.  loadingState.style.display=\'block\'

10. setTimeout(2200ms) → loadingState.style.display=\'none\'

11. resultsSection.style.opacity=\'1\'

12. Remove .loading from btn; restore full button HTML: btn.innerHTML =
    \'\<svg width=14 height=14 viewBox=0 0 24 24 fill=none
    stroke=currentColor stroke-width=2.4\>\<path d=M12 22s8-4
    8-10V5l-8-3-8 3v7c0 6 8 10 8 10z /\>\<path d=M9 12l2 2 4-4
    /\>\</svg\> Verify Claim\'

13. Call animateDial(80) --- note: before this call, dialArc
    stroke-dashoffset should be at 478 (0%, fully empty arc).
    animateDial sets it to the target offset with transition.

14. Reset all .cs-bar width:0 → after 100ms setTimeout restore target
    widths (CSS 1s ease-reverent fills bars)

15. resultsSection.scrollIntoView({behavior:\'smooth\',
    block:\'start\'})

**4.6 Results Section (#resultsSection)**

> Blueprint ref: verify\_\_1\_.html #resultsSection --- Functional Spec
> §9. Visible on page load (pre-filled demo result). Not hidden
> initially --- opacity transitions during verify cycle.

All sub-components carry .reveal (animated by IntersectionObserver
threshold:0.06). Evidence cards additionally carry stagger delay
classes. Full .reveal inventory for this section:

  ------------------------------------------------------------------------
  **Element**          **Full CSS Classes**        **Stagger Delay**
  -------------------- --------------------------- -----------------------
  .divider-label       class=\'divider-label       none
                       reveal\'                    

  .verdict-banner      class=\'verdict-banner      none (grade class swaps
                       hasan reveal\'              per result)

  .result-card         class=\'card result-card    none
                       reveal\'                    

  .dial-card           class=\'card dial-card      +0.1s
                       reveal reveal-d1\'          

  .chain-section       class=\'chain-section       none
                       reveal\'                    

  Evidence card 1      class=\'card ev-card        none
                       reveal\'                    

  Evidence card 2      class=\'card ev-card reveal +0.1s
                       reveal-d1\'                 

  Evidence card 3      class=\'card ev-card reveal +0.2s
                       reveal-d2\'                 

  Evidence card 4      class=\'card ev-card reveal +0.3s
                       reveal-d3\'                 

  .consensus-section   class=\'consensus-section   none
                       reveal\'                    

  .disclaimer          class=\'disclaimer reveal\' none
  ------------------------------------------------------------------------

**4.6.1 Divider Label + Verdict Banner**

Divider (.divider-label): max-width 820px centered. Gold gradient
horizontal lines (flex:1 ::before and ::after) frame \'✦ Analysis
Complete\' text in gold-700, 10.5px uppercase letter-spaced.

Verdict banner (.verdict-banner): max-width 820px, centered,
border-radius 20px, padding 20px 28px, flex row. Three grade CSS class
variants:

  -----------------------------------------------------------------------------------------------------------------------
  **Grade**   **CSS     **Background Gradient**    **Border**             **Icon Bg**            **Icon**   **Badge
              Class**                                                                                       Text**
  ----------- --------- -------------------------- ---------------------- ---------------------- ---------- -------------
  Ṣaḥīḥ       .sahih    rgba(15,110,86,.08→.04)    rgba(15,110,86,.25)    rgba(15,110,86,.12)    🛡️         Ṣaḥīḥ ·
                                                                                                            Authentic

  Ḥasan       .hasan    rgba(93,138,58,.08→.04)    rgba(93,138,58,.25)    rgba(93,138,58,.12)    🛡️         Ḥasan ·
                                                                                                            Reliable

  Ḍaʿīf       .daif     rgba(168,105,50,.08→.04)   rgba(168,105,50,.25)   rgba(168,105,50,.12)   ⚠️         Ḍaʿīf · Weak

  Mawḍūʿ      (add)     rgba(179,58,58,.08→.04)    rgba(179,58,58,.25)    rgba(179,58,58,.12)    **✗**      Mawḍūʿ ·
                                                                                                            Fabricated
  -----------------------------------------------------------------------------------------------------------------------

Banner anatomy (left→right): .vb-icon (48×48px, 14px radius) +
.vb-content (.vb-verdict 10px + .vb-title 18px Cormorant) + .vb-badge
(right-aligned grade pill, flex-shrink:0).

**4.6.2 Summary Card + Confidence Dial (.result-grid)**

CSS grid: grid-template-columns 1.4fr 1fr, gap 20px, max-width 820px
centered. Collapses to 1 column at ≤860px.

**Left --- Summary Card (.result-card):**

- .summary --- Cormorant Garamond 15.5px, line-height 1.68. Scholarly
  prose with \<em\> inline for grade name.

- Default summary text (exact from verify\_\_1\_.html): \"Ibn Mājah
  (224), al-Bayhaqī, and others record this narration with multiple
  chains. Al-Albānī graded it \[em\]Ḥasan\[/em\] in Ṣaḥīḥ Ibn Mājah. The
  obligation concerns foundational religious knowledge --- not every
  branch of worldly learning. Ibn al-Qayyim clarifies the scope covers
  ʿaqīdah and the fiqh of one\'s personal worship.\" Production API must
  replace this with dynamic result.

- .topic-chips --- border-top 0.5px teal. .chip-teal (teal-tinted) and
  .chip-gold (gold-tinted) chips. Default: Knowledge (ʿIlm) · Obligation
  (Farḍ) · Ibn Mājah · 224 · al-Albānī Graded · Multiple Chains

**Right --- Confidence Dial Card (.dial-card):**

- Gold-tinted radial gradient background + gold border accent
  rgba(197,160,89,.22).

- .big-dial (164×164px): SVG viewBox 0 0 180 180. Background circle r=76
  stroke rgba(0,105,110,.08) width 14. Progress arc id=\'dialArc\'
  stroke=\'url(#dg)\' (gold-500→teal-700), stroke-linecap round,
  stroke-dasharray 478.

- Initial state of dialArc on page load: stroke-dashoffset = 478 (0% ---
  arc fully empty). animateDial fires after 600ms and transitions it to
  the target offset. On each new verify, runVerify() does NOT manually
  reset the offset to 478 before calling animateDial --- the transition
  animates from whatever the current offset is.

- stroke-dashoffset = 478 − (478 × pct/100). Example: 80% → offset 96.

- .core overlay: id=\'dialPct\' (Cormorant 42px) + \'Confidence\' label
  (9px uppercase).

- .dial-grade-pill: animated .dial-grade-dot (6px pulse 2s infinite) +
  grade text. Default: Ḥasan · Graded Reliable.

- .dial-stats: 3 .dial-stat metrics --- Sources: 4 · Grade: Ḥasan ·
  Primary: Ibn Mājah.

**4.6.3 Narration Chain (.chain-section)**

max-width 820px, centered, padding 22px 26px. Background:
linear-gradient(135deg, rgba(0,105,110,.04), rgba(197,160,89,.02)).
Border: 0.5px rgba(0,105,110,.12). Border-radius: 18px.

Chain label: 10px uppercase var(\--ink-subtle) + horizontal line
extending via ::after. 5 nodes connected by .chain-arrow (→, ink-faint,
16px, padding-bottom:14px):

  ---------------------------------------------------------------------------------
  **Node**   **Text**       **CSS Class**      **Visual**             **Role
                                                                      Label**
  ---------- -------------- ------------------ ---------------------- -------------
  1          Prophet ﷺ      .cn-bubble.start   Teal bg + teal         Originator
                                               border + teal-700      
                                               text, weight 600       

  2          Anas ibn Mālik .cn-bubble         surface-card bg + teal Companion
                                               border + ink-body text 

  3          Hishām ibn     .cn-bubble         surface-card bg + teal Tābiʿī
             ʿUmārah                           border + ink-body text 

  4          Ḥafṣ ibn       .cn-bubble         surface-card bg + teal Narrator
             Sulaymān                          border + ink-body text 

  5          Ibn Mājah ·    .cn-bubble.end     Gold bg + gold         Collector
             224                               border + gold-700      
                                               text, weight 600       
  ---------------------------------------------------------------------------------

**4.6.4 Evidence Cards (.evidence-grid)**

2×2 CSS grid, gap 16px, max-width 820px centered. Collapses to 1 column
at ≤680px.

  -----------------------------------------------------------------------------------------------------------------
  **Card**     **Eyebrow Color** **Left Border**       **Arabic**   **Translation**   **Source Ref** **Grade**
  ------------ ----------------- --------------------- ------------ ----------------- -------------- --------------
  1 ---        .ev-eye-primary   3px var(\--gold-500)  طَلَبُ الْعِلْمِ    \"Seeking         Ibn Mājah ·    .grade-hasan
  Primary      (gold-700)                              فَرِيضَةٌ        knowledge is an   224            
  Source                                                            obligation upon                  
                                                                    every Muslim.\"                  

  2 ---        .ev-eye-support   3px var(\--teal-400)  اطْلُبُوا الْعِلْمَ \"Seek knowledge, al-Bayhaqī     .grade-daif
  Supporting   (teal-600)                                           even unto                        
                                                                    China.\" ---                     
                                                                    graded Ḍaʿīf, not                
                                                                    primary evidence                 

  3 ---        .ev-eye-context   None                  (none ---    Al-Nawawī and Ibn Minhāj         (none)
  Scholarly    (ink-subtle)                            prose only)  al-Qayyim:        al-Ṭālibīn ·   
  Context                                                           obligation covers al-Nawawī      
                                                                    ʿibādāt and                      
                                                                    ʿaqīdah only                     

  4 ---        .ev-eye-quran     3px                   يَرْفَعِ         \"Allah will      Qur\'an ·      .grade-sahih
  Qur\'anic    (grade-hasan)     var(\--grade-hasan)   اللَّهُ\...     raise those who   Al-Mujādilah   
  Basis                                                             believe and those 58:11          
                                                                    given knowledge,                 
                                                                    in degrees.\"                    
  -----------------------------------------------------------------------------------------------------------------

Card anatomy: .ev-eyebrow (label: .ev-dot 5px + category text) +
.ev-arabic (Amiri 18px, RTL, teal-tinted bg, teal-700 / teal-300 dark) +
.ev-trans (Cormorant 14px italic) + .ev-footer (.ev-ref uppercase +
.ev-grade pill).

**4.6.5 Scholar Consensus Panel (.consensus-section)**

max-width 820px, centered. .consensus-card (.card) with label \'Scholar
Consensus on Authenticity\' (10px uppercase) and 4 .cs-row elements.

  ----------------------------------------------------------------------------
  **Scholar**      **Bar Class**   **Target   **Grade Label**    **Grade CSS**
                                   Width**                       
  ---------------- --------------- ---------- ------------------ -------------
  Al-Albānī        .cs-bar.hasan   80%        Ḥasan              .cs-grade.h

  Ibn al-Qayyim    .cs-bar.hasan   78%        Acceptable         .cs-grade.h

  Ibn Ḥajar        .cs-bar.hasan   75%        Ḥasan li-Ghayrihi  .cs-grade.h
  al-ʿAsqalānī                                                   

  Al-Suyūṭī        .cs-bar.sahih   82%        Ṣaḥīḥ              .cs-grade.s
  ----------------------------------------------------------------------------

Bar colors: .hasan = linear-gradient(90deg, var(\--grade-hasan),
#8BBF5A). .sahih = linear-gradient(90deg, var(\--grade-sahih), #2CAB87).
Animation on verify: all bars set to width:0 → setTimeout 100ms →
restore target widths → CSS transition:width 1s ease-reverent fills
them.

**4.6.6 Disclaimer + Try Another Row**

> HARD-CODED DISCLAIMER --- never replaced by verification output: \'⚠️
> IslamicInfo does not issue fatwas or legal rulings. This analysis
> cites authenticated sources only and is for educational reference. For
> personal religious guidance, consult a qualified scholar. Confidence
> scores reflect scholarly consensus, not divine authority.\'

Disclaimer CSS: 12.5px, ink-muted, line-height 1.65. Background:
rgba(0,105,110,.04). Border-radius: 12px. Border-left: 3px solid
rgba(0,105,110,.2). Always visible in every result state.

Try Another Row: serif heading \'Try another claim:\' (18px, weight 500,
ink-muted). 5 .example-chip pills with useChip() --- different content
from the input-area chips:

  -----------------------------------------------------------------
  **Try Another Chip Text**
  -----------------------------------------------------------------
  \"The best among you are those who learn the Quran\"

  \"Actions are by intentions\"

  \"Make things easy, not difficult\"

  \"A smile at your brother is sadaqah\"

  \"Whoever believes in Allah should speak good or be silent\"
  -----------------------------------------------------------------

**4.7 How It Works Section**

> Blueprint ref: verify\_\_1\_.html .section (surface-card) ---
> Functional Spec §10. Background: var(\--surface-card).

Section header: eyebrow \'Our Methodology\' + H2 \'How Verification
Works\' (.gold-it span for gradient) + sub-text \'A transparent,
source-first process rooted in classical hadith sciences...\'

.how-grid --- 3-column grid, gap 20px. Collapses to 1 column at ≤720px.
Each .how-card (.card) has .how-step-num (52px decorative, absolute
top-right, rgba(0,105,110,.08)) + .how-icon (46×46px teal gradient,
SVG) + .how-title (Cormorant 18px) + .how-desc (13.5px ink-muted).

  -----------------------------------------------------------------------------
  **Step**   **Title**       **Icon**          **Description Summary**
  ---------- --------------- ----------------- --------------------------------
  01         Parse & Match   Magnifier SVG     Tokenises input; matches against
                                               61,000+ hadith in Kutub
                                               al-Sittah + Qur\'an + classical
                                               commentaries.

  02         Apply Hadith    People/scholars   Cross-references matches with
             Grading         SVG               al-Albānī, Ibn Ḥajar, al-Nawawī
                                               to surface established grade
                                               (Ṣaḥīḥ/Ḥasan/Ḍaʿīf/Mawḍūʿ).

  03         Cite, Never     Shield/check SVG  Presents sources, grades,
             Rule                              chains, context --- then stops.
                                               Never issues fatwa or ruling.
  -----------------------------------------------------------------------------

Card hover: .how-icon scale(1.1) rotate(-5deg), 0.3s ease-reverent. 3D
tilt: mousemove → rotateX(±5°)+rotateY(±7°), transition 0.08s.
mouseleave → clear transform, 0.38s ease-reverent reset.

**4.8 FAQ Accordion**

> Blueprint ref: verify\_\_1\_.html .faq-section --- Functional Spec
> §11. Located inside How It Works section, margin-top:40px.

Heading: \'Frequently Asked Questions\' --- Cormorant 22px, centered,
margin-bottom 20px. Stacked .faq-item elements with border-top (first
item) + border-bottom dividers (0.5px rgba(0,105,110,.09)).

toggleFaq(el): el.closest(\'.faq-item\') → close all .faq-item.open →
toggle .open on target. Open state: .faq-a max-height 0→200px (0.38s
ease-reverent) + padding-bottom:16px. .faq-icon rotate(45deg) + teal bg.

  ------------------------------------------------------------------------
  **\#**   **Question**         **Answer Summary**
  -------- -------------------- ------------------------------------------
  1        What does \"Ḥasan\"  Second-highest grade. Chain slightly
           mean?                weaker than Ṣaḥīḥ but acceptable as
                                evidence. Most scholars act upon Ḥasan for
                                rulings.

  2        Why don\'t you give  Rulings require knowledge of questioner\'s
           fatwas?              context, local custom (ʿurf), and
                                circumstance. Role: surface sources, not
                                apply them.

  3        What collections do  Six canonical collections + Musnad Aḥmad,
           you reference?       al-Bayhaqī, classical tafsir works.

  4        Can I verify a quote Yes --- switch to Arabic mode. Exact text
           in Arabic?           match first, then variant transmission
                                search.

  5        What if a claim is   Reports clearly --- may be fabricated,
           not found?           apocryphal, or unrecorded. Absence of
                                evidence is useful information.
  ------------------------------------------------------------------------

**4.9 CTA Section**

> Blueprint ref: verify\_\_1\_.html .cta-section --- CLAUDE.md §11. MUST
> be last section before footer.

Background: linear-gradient(135deg, #0A3A3D, #00696E, #062628). Gold
glow ::before top-left (280×280px radial). Teal glow ::after
bottom-right (240×240px radial). All content centered.

Eyebrow: \'✦ IslamicInfo · Free · Always · No Account\'. H2: \'Every
Claim. / Verified.\' (Verified in gold gradient \<em\>). Sub-text
references 61,000+ hadith. Buttons: .btn-primary (Explore Qur\'an →
quran.html) + 2× .btn-white-ghost (Hadith Library · Dua Library).

**4.10 Global Footer**

> Blueprint ref: verify\_\_1\_.html footer --- CLAUDE.md §7. CRITICAL:
> ft- CSS class prefix exclusively. The mockup also contains legacy
> ii-footer-\* classes --- production must use ft- only.

Background: #062628. 5-column grid (2fr 1fr 1fr 1fr 1fr). Collapses:
3-col at ≤1100px · 2-col brand-spans at ≤700px · 1-col at ≤440px.

  --------------------------------------------------------------------------
  **Column**   **Heading**   **Content**
  ------------ ------------- -----------------------------------------------
  Col 1 (2fr)  IslamicInfo   Logo (.ti teal + .fo gold) + tagline + Arabic
               brand         verse (Hud 11:88)

  Col 2        \'Verify\'    Verify a Hadith · Browse Hadith Library ·
                             Explore Qur\'an · Hadith Grading Guide
                             (hadith.html#grading) · Our Methodology
                             (verify.html#methodology)

  Col 3        \'Quick       8 links (knowledge-hub.html never omit): Quran
               Access\'      Explorer · Hadith Library · Islamic Studies ·
                             Knowledge Hub · Daily Duas · Islamic Tools ·
                             Habit Tracker · Verify a Claim

  Col 4        \'Our         QuranlyAI → quranlyai.com · MosqueFinder ·
               Ecosystem\'   TravellyAI · LearnSpeakAI. target=\_blank
                             rel=noopener.

  Col 5        \'Company /   About · Contact · (margin-top:16px divider) ·
               Legal\'       Privacy Policy · Terms of Use
  --------------------------------------------------------------------------

Bottom bar: left \'© 2026 Islamicinfo.org --- No ads. No fatwas. No
fabricated sources.\' · right (italic muted) \'All content
source-verified · Privacy-first · Built with sincerity\'. Link hover:
translateX(4px) + left teal border.

**5. User Stories**

18 stories across 5 categories. P0 = must-have for launch. P1 = high
priority.

**5.1 Core Verification**

**US-001 --- Verify a Known Hadith**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        Muslim user who heard or read a hadith and wants to
              confirm its authenticity

  I want to   paste the hadith text and click \'Verify Claim\'

  So that     I receive the scholarly grade, source references,
              narration chain, and scholar consensus in one view

  Priority    P0 --- Core

  Notes       Default pre-filled claim on load. runVerify() 2200ms
              simulated delay (v1.0); real API in production. Guard:
              empty textarea returns immediately.
  -------------------------------------------------------------------

**US-002 --- Use a Quick Example Chip**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        new user who wants to explore the tool without typing

  I want to   click a quick example chip to fill the textarea
              automatically

  So that     I can see how the verification works with a well-known
              claim without typing anything

  Priority    P0 --- Core

  Notes       useChip(el): strip quotes → ta.value → updateCounter →
              focus → scrollTo verify-box.offsetTop−80, smooth.
  -------------------------------------------------------------------

**US-003 --- Load a Sample Claim**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user exploring the tool\'s capabilities

  I want to   click \'Sample\' to cycle through 5 pre-set example
              claims

  So that     I can see how the system handles different claim types
              without typing

  Priority    P1 --- High

  Notes       SAMPLES\[5\] cycled via sampleIdx++. Each click fills
              textarea, updates counter, focuses input.
  -------------------------------------------------------------------

**US-004 --- Paste from Clipboard**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who copied a suspicious quote from WhatsApp or
              social media

  I want to   click the \'Voice\' button to paste clipboard contents
              into the textarea

  So that     I don\'t have to type out a long quote manually

  Priority    P1 --- High

  Notes       pasteClipboard(): navigator.clipboard.readText(). On
              failure: alert \'Clipboard access denied\'. Production:
              SpeechRecognition API for true voice input.
  -------------------------------------------------------------------

**US-005 --- Clear the Input**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who wants to start a new verification

  I want to   click \'Clear\' to empty the textarea instantly

  So that     I can start fresh without manually selecting and
              deleting text

  Priority    P1 --- High

  Notes       clearInput(): ta.value=\'\'; updateCounter();
              ta.focus(). No confirmation dialog.
  -------------------------------------------------------------------

**5.2 Input Modes**

**US-006 --- Switch to Arabic Input Mode**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who has the original Arabic text of a hadith

  I want to   click the \'Arabic\' mode button so the textarea
              becomes RTL with Arabic font

  So that     I can paste Arabic text naturally and have the system
              perform exact text matching

  Priority    P0 --- Core

  Notes       setMode(): adds .on to Arabic btn. Textarea:
              direction:rtl; text-align:right;
              font-family:var(\--font-arabic). Placeholder → Arabic.
              Production: exact match first, variant search second.
  -------------------------------------------------------------------

**US-007 --- Switch Between Claim Types (Quote/Claim)**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user with a paraphrased quote or broad Islamic claim
              (not a verbatim hadith)

  I want to   select Quote or Claim mode to signal my input type

  So that     the search algorithm applies the appropriate matching
              strategy

  Priority    P1 --- High

  Notes       v1.0: setMode() toggles .on class only (visual).
              Production: each mode triggers different backend search
              strategy.
  -------------------------------------------------------------------

**5.3 Reading Results**

**US-008 --- Understand the Verdict Grade**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who receives a result

  I want to   see a clear verdict banner color-coded by grade with
              the grade name and a brief title

  So that     I immediately understand the scholarly assessment at a
              glance before reading details

  Priority    P0 --- Core

  Notes       Banner uses .sahih/.hasan/.daif CSS class variant. Icon
              (🛡️ or ⚠️ or ✗) + .vb-verdict label + .vb-title +
              .vb-badge all required.
  -------------------------------------------------------------------

**US-009 --- Read the Confidence Score**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who wants a quantitative measure of scholarly
              consensus

  I want to   watch the confidence dial animate to a percentage score

  So that     I can gauge the degree of scholarly agreement on this
              hadith\'s authenticity

  Priority    P0 --- Core

  Notes       animateDial(targetPct): stroke-dashoffset 1.2s
              ease-reverent + rAF counter +2%/frame. Fires on page
              load (600ms delay) AND on each runVerify() completion.
  -------------------------------------------------------------------

**US-010 --- Read the Narration Chain**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user with knowledge of hadith sciences

  I want to   see the Isnād as a visual node-by-node flow from the
              Prophet ﷺ to the collector

  So that     I can assess the chain of transmission at each level

  Priority    P1 --- High

  Notes       5 nodes: .cn-bubble.start (teal) → 3 intermediate →
              .cn-bubble.end (gold). .chain-arrow → between each.
              .cn-role labels below each bubble.
  -------------------------------------------------------------------

**US-011 --- Read the Evidence Cards**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who wants full textual evidence around a claim

  I want to   read all 4 evidence cards: Primary Source, Supporting
              Narration, Scholarly Context, and Qur\'anic Basis

  So that     I have a complete, multi-perspective view of the
              evidence

  Priority    P0 --- Core

  Notes       2×2 grid. Cards 1, 2, 4: Arabic text + translation +
              source + grade badge. Card 3: prose only (no Arabic).
              Grade badges must use correct CSS class for each grade.
  -------------------------------------------------------------------

**US-012 --- Read Scholar Consensus**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who wants to understand multiple scholarly
              opinions

  I want to   see the scholar consensus bar chart with each
              scholar\'s grade and bar width

  So that     I know the verdict reflects multiple independent
              opinions, not a single source

  Priority    P1 --- High

  Notes       4 scholars. Bars animate on each verify (reset width:0
              → 100ms delay → restore). Bar gradient color differs
              per grade.
  -------------------------------------------------------------------

**US-013 --- See the Disclaimer**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who might act on the result

  I want to   always see the disclaimer reminding me this is
              educational reference, not a fatwa

  So that     I understand the tool\'s limits and know to consult a
              qualified scholar for personal rulings

  Priority    P0 --- Core

  Notes       Hard-coded text. NEVER replaced. Always visible in
              every result state including Not Found.
  -------------------------------------------------------------------

**US-014 --- Try Another Claim from Results**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who finished reading a result and wants to explore
              another

  I want to   click a chip in the \'Try another claim\' row to fill
              the textarea without scrolling up

  So that     I can continue exploring seamlessly

  Priority    P1 --- High

  Notes       5 different chips from the input-area chips. Same
              useChip() behavior.
  -------------------------------------------------------------------

**5.4 Understanding the System**

**US-015 --- Read the Verification Methodology**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who wants to understand the system before using it

  I want to   read the 3-step methodology: Parse & Match → Apply
              Hadith Grading → Cite, Never Rule

  So that     I understand the corpus, the grading process, and the
              no-fatwa boundary

  Priority    P1 --- High

  Notes       3 .how-card elements with 3D tilt interaction. Icon
              hover: scale+rotate. Step numbers (01/02/03) as
              decorative absolute text.
  -------------------------------------------------------------------

**US-016 --- Get Answers via FAQ**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user with questions about hadith grades, fatwas, or
              Arabic mode

  I want to   click a FAQ question to expand its answer

  So that     I can resolve my understanding before or after
              verifying a claim

  Priority    P1 --- High

  Notes       toggleFaq(): close all others → toggle target.
              .faq-icon rotates 45°. .faq-a max-height 0→200px, 0.38s
              ease-reverent.
  -------------------------------------------------------------------

**5.5 Edge Cases**

**US-017 --- Receive a Not Found Result**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who submits a claim not in the authenticated
              corpus

  I want to   receive a clear \'No authenticated match found\' result
              with an explanation

  So that     I understand the claim may be fabricated, apocryphal,
              or unrecorded

  Priority    P0 --- Core

  Notes       Grey verdict banner, ❓ icon, clear \'No authenticated
              match found\' text. Summary explains 3 possible
              reasons. Single Not Found evidence card. Disclaimer
              always shown.
  -------------------------------------------------------------------

**US-018 --- Verify in Dark Mode**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who prefers low-light interfaces

  I want to   toggle dark mode and have all result components remain
              fully legible

  So that     I can use the verification engine comfortably at night

  Priority    P1 --- High

  Notes       All result components use dark mode token overrides.
              Bismillah: teal → gold gradient. Trust strip: white bg.
              Arabic text in evidence cards: teal-300 in dark.
  -------------------------------------------------------------------

**6. Acceptance Criteria**

All criteria required for production sign-off. ★ = precision detail
beyond the original functional spec checklist.

**6.1 Global Structure**

- [ ] \<html lang=\'en\' data-theme=\'light\'\> present

- [ ] Fonts: Cormorant Garamond · Inter · Amiri --- preconnected and
  imported in this order

- [ ] All 50+ CSS tokens in :root exactly as CLAUDE.md §1

- [ ] \[data-theme=\'dark\'\] sibling block --- unmerged from :root

- [ ] Body: Islamic geometric background-image SVG at opacity 0.04

- [ ] .ambient radial glow div and .shell wrapper present

**6.2 Header & Navigation**

- [ ] All 10 nav items in exact order: Home → Quran Explorer → Hadith
  Library → Islamic Studies → Knowledge Hub → Daily Duas → Tools → Habit
  Tracker → Verify → About

- [ ] \'Verify\' carries class=\'nav-link active\' --- teal-700, weight
  500, 2px teal→gold gradient underline ::after

- [ ] knowledge-hub.html at position 5 --- NEVER omitted

- [ ] islamic-studies.html used --- NEVER learn.html

- [ ] 4 header tools in order: search · EN placeholder · theme · admin
  placeholder

- [ ] EN language button renders but triggers no action --- no i18n in
  v1.0 **★**

- [ ] Hamburger visible ONLY at ≤760px --- onclick=\'openMM()\'

- [ ] Search popup id=\'searchPopup\': opens on click, auto-focus after
  50ms, closes on Escape or outside click

- [ ] Theme toggle id=\'themeBtn\': persists to localStorage
  \'islamicinfo-theme\'; applied to \<html\> before first render

**6.3 Mobile Menu**

- [ ] All 10 nav links in correct order with correct hrefs

- [ ] \'Verify\' marked active (.mm-link active)

- [ ] openMM() / closeMM() functions defined and working. Escape key
  closes menu.

- [ ] mmFade keyframe animation 0.3s ease-reverent on open

**6.4 Hero**

- [ ] Bismillah is first child of .hero-inner

- [ ] Light: teal gradient clip-text (opacity .92). Dark: gold
  gradient + drop-shadow(0 0 14px rgba(217,179,88,.55))

- [ ] H1 uses var(\--font-display) with \<span class=\'grad-it\'\> for
  \'Verify.\'

- [ ] 3 .geo SVGs with geoRot animation (g1: 28s, g3: 32s delay-14s, g4:
  20s delay-7s)

- [ ] Hero background with bgD animation (18s ease-in-out infinite
  alternate)

**6.5 Trust Strip**

- [ ] 4 items exactly: 📚 61K+ Hadith · 📖 6,236 Verses · ⚖️ 6
  Collections · 🛡️ 100% Source-Cited

- [ ] Embedded inside .hero-inner below sub-text; fadeUp 0.7s
  ease-reverent delay 0.35s

- [ ] At ≤560px: wraps to 2×2 grid; ::before dividers set to
  display:none

**6.6 Verify Box**

- [ ] Inside .page-container (max-width:1060px, padding-top:48px).
  .reveal entry animation.

- [ ] Glass morphism background; teal border + glow; dark mode:
  rgba(21,37,39,.92)

- [ ] 4 mode buttons in order: Hadith (.on default) · Quote · Claim ·
  Arabic

- [ ] setMode(): removes .on from all .vmode, adds .on to clicked btn

- [ ] Arabic mode: direction:rtl; text-align:right;
  font-family:var(\--font-arabic); placeholder changes to Arabic **★**

- [ ] Textarea id=\'verifyInput\': Cormorant 18px italic, transparent
  bg, min-height:140px

- [ ] Default textarea value on load: \'Did the Prophet say that seeking
  knowledge is a duty upon every Muslim?\' **★**

- [ ] Char counter: #charCount (length) · #wordCount (split /\\s+/
  filter Boolean). Updates on every input event.

- [ ] wordCount returns 0 for empty string, not 1 **★**

- [ ] Voice (pasteClipboard()): reads clipboard; alert on permission
  failure

- [ ] Sample (loadSample()): cycles SAMPLES\[5\] in order via
  sampleIdx%; exact content: \[0\] seeking knowledge duty · \[1\]
  cleanliness half of faith · \[2\] actions judged by intentions · \[3\]
  smiling at brother charity · \[4\] best of people most beneficial
  **★**

- [ ] Clear (clearInput()): ta.value=\'\'; updateCounter(); ta.focus()

- [ ] #verifyBtn (runVerify()): does nothing if textarea is empty

- [ ] Loading state: .loading on btn → opacity 0.8, cursor:wait, text
  changes to \'Verifying...\' via btn.textContent (not innerHTML ---
  icon lost during loading is OK)

- [ ] After 2200ms: btn.innerHTML restored with full shield+check SVG
  (viewBox 0 0 24 24, path M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z +
  path M9 12l2 2 4-4, stroke-width:2.4) + \' Verify Claim\' text **★**

- [ ] 5 quick chips: useChip() --- strip quotes via
  replace(/\^\"\|\"\$/g,\'\') → ta.value → updateCounter → focus →
  window.scrollTo({ top: ta.closest(\'.verify-box\').offsetTop − 80,
  behavior:\'smooth\' }). Uses closest(), not a direct DOM variable.
  **★**

**6.7 Loading State**

- [ ] #loadingState: display:none by default; display:block during
  runVerify() 2200ms window

- [ ] 3 .ld dots with ldBounce (scale 0→1→0, 1.2s); stagger +0.2s /
  +0.4s

- [ ] Loading text: Cormorant 16px italic: \'Cross-referencing
  authenticated collections...\'

**6.8 Verdict Banner**

- [ ] Divider: gold gradient lines + \'✦ Analysis Complete\' in gold-700
  uppercase

- [ ] Verdict banner: correct .sahih/.hasan/.daif class per grade; all 3
  visual variants implemented

- [ ] Mawḍūʿ (fabricated) red variant: rgba(179,58,58) colors + ✗ icon
  **★**

- [ ] Not Found state: muted grey banner, ❓ icon, \'No authenticated
  match found\' **★**

- [ ] Banner anatomy: .vb-icon + .vb-content (.vb-verdict + .vb-title) +
  .vb-badge --- all present

**6.9 Summary Card + Confidence Dial**

- [ ] result-grid: 1.4fr 1fr; collapses to 1 column at ≤860px

- [ ] Summary card: Cormorant 15.5px prose with \<em\> for grade names
  inline

- [ ] .topic-chips: .chip-teal and .chip-gold variants; border-top
  separator

- [ ] Dial card: gold-tinted radial bg; gold border accent

- [ ] #dialArc: stroke-dasharray 478; stroke-dashoffset = 478 − (478 ×
  pct/100); transition 1.2s ease-reverent

- [ ] #dialPct: rAF counter from 0 to targetPct at +2% per frame

- [ ] animateDial(80) fires on page load after 600ms AND after each
  runVerify() completion

- [ ] Initial dialArc stroke-dashoffset in HTML: 96 (pre-set to 80% for
  the demo state visible on load). After runVerify() completes,
  animateDial re-runs from current offset to new target. **★**

- [ ] .dial-grade-pill: animated .dial-grade-dot (pulse 2s) + grade text

- [ ] .dial-stats: 3 metrics --- Sources · Grade · Primary --- all
  populated

**6.10 Narration Chain**

- [ ] 5 nodes: .cn-bubble.start (Prophet ﷺ, teal-tinted) → 3 default →
  .cn-bubble.end (Ibn Mājah, gold-tinted)

- [ ] .chain-arrow → between each node; padding-bottom:14px for vertical
  alignment

- [ ] .cn-role labels present: Originator · Companion · Tābiʿī ·
  Narrator · Collector

- [ ] Bubble hover: border darkens + shadow 0 2px 8px rgba(0,105,110,.1)

**6.11 Evidence Cards**

- [ ] 2×2 grid; collapses to 1 column at ≤680px

- [ ] Card 1 (Primary): gold left border + .ev-eye-primary + Arabic +
  translation + Ibn Mājah + .grade-hasan

- [ ] Card 2 (Supporting): teal-400 left border + .ev-eye-support +
  Arabic with Ḍaʿīf note + al-Bayhaqī + .grade-daif

- [ ] Card 3 (Scholarly Context): no left border + .ev-eye-context +
  prose only (no Arabic text element) **★**

- [ ] Card 4 (Qur\'anic): grade-hasan left border + .ev-eye-quran +
  Arabic + 58:11 + .grade-sahih (\'Qur\'anic\' badge)

- [ ] Evidence card stagger: card1=.reveal, card2=.reveal.reveal-d1
  (+0.1s), card3=.reveal.reveal-d2 (+0.2s), card4=.reveal.reveal-d3
  (+0.3s) **★**

- [ ] .ev-arabic: Amiri 18px, RTL, teal-tinted bg; teal-700 in light /
  teal-300 in dark **★**

**6.12 Scholar Consensus**

- [ ] 4 scholars: Al-Albānī 80% · Ibn al-Qayyim 78% · Ibn Ḥajar 75% ·
  Al-Suyūṭī 82%

- [ ] Bar gradient: .cs-bar.hasan (grade-hasan→#8BBF5A) / .cs-bar.sahih
  (grade-sahih→#2CAB87)

- [ ] On runVerify(): all bars width:0 → setTimeout(100ms) → restore
  targets → CSS 1s ease-reverent fills

- [ ] .cs-grade.h (grade-hasan color) and .cs-grade.s (grade-sahih
  color) correctly applied

**6.13 Disclaimer + Try Another**

- [ ] Disclaimer hard-coded text always visible --- NEVER replaced,
  hidden, or modified by output

- [ ] Disclaimer CSS: teal-tinted bg, border-left 3px teal, 12.5px,
  ink-muted, line-height 1.65

- [ ] \'Try another claim\' row: serif heading + 5 .example-chip pills
  with useChip()

- [ ] Try Another chips have different content from Verify Box chips (5
  different claims) **★**

**6.14 How It Works**

- [ ] Section background: var(\--surface-card)

- [ ] 3 .how-card elements with correct step numbers 01/02/03, icons,
  titles, descriptions

- [ ] .how-step-num: 52px decorative, absolute top-right,
  rgba(0,105,110,.08)

- [ ] .how-icon: scale(1.1) rotate(-5deg) on card hover, 0.3s
  ease-reverent

- [ ] 3D tilt: mousemove rotateX(±5°)+rotateY(±7°); mouseleave resets,
  0.38s ease-reverent

**6.15 FAQ Accordion**

- [ ] 5 FAQ items with correct Q&A content per functional spec §11.1

- [ ] toggleFaq(el): closes all other .faq-item.open first, then toggles
  target

- [ ] .faq-icon rotates 45° on open + gains teal-tinted bg

- [ ] .faq-a: max-height 0→200px, 0.38s ease-reverent on open

**6.16 CTA Section**

- [ ] CTA is LAST section before footer

- [ ] 3 buttons: .btn-primary → quran.html · .btn-white-ghost →
  hadith.html · .btn-white-ghost → dua.html

- [ ] Correct locked copy: \'✦ IslamicInfo · Free · Always · No
  Account\' + \'Every Claim. Verified.\'

**6.17 Footer**

- [ ] ft- class prefix exclusively --- NEVER ii-footer-\* classes

- [ ] Col 2 heading: \'Verify\' with 5 verify-specific links including
  verify.html#methodology **★**

- [ ] Quick Access: all 8 links including knowledge-hub.html --- never
  omit

- [ ] Ecosystem: quranlyai.com (NOT quranlya.com) · mosquefinder.net ·
  travellyai.com · learnspeakai.com (exact casing)

- [ ] Company/Legal: margin-top:16px divider between sections; all 4
  links present

- [ ] Bottom bar: exact locked copyright + note strings

**6.18 Animations & Theme**

- [ ] IntersectionObserver threshold:0.06; .reveal elements get .in
  class on scroll

- [ ] Stagger: -d1 +0.1s · -d2 +0.2s · -d3 +0.3s · -d4 +0.4s

- [ ] All hover transitions: var(\--ease-reverent) or
  var(\--ease-premium) --- no linear/ease-in-out

- [ ] NO shimmer ::after sweep on any card (CLAUDE.md §27.4 ---
  absolute)

- [ ] Dial animates on page load (600ms delay) AND on each verify
  completion

- [ ] Consensus bars animate (width:0 → target) on each runVerify()
  completion

- [ ] All responsive breakpoints verified:
  1100/900/860/760/720/700/680/560/440px

**7. Feature Matrix**

All current features are Free and require no account. ✓ = implemented in
verify\_\_1\_.html · 🔮 = designed, not yet built.

  ----------------------------------------------------------------------------
  **Feature**                 **Category**   **Tier**    **Status**  **US**
  --------------------------- -------------- ---------- ------------ ---------
  Hadith mode (strict         Input          Free          **✓**     US-006
  matching)                                                          

  Quote mode (semantic        Input          Free          **✓**     US-007
  matching)                                                          

  Claim mode (broadest        Input          Free          **✓**     US-007
  semantic)                                                          

  Arabic RTL mode + Amiri     Input          Free          **✓**     US-006
  font                                                               

  Live character + word       Input          Free          **✓**     US-001
  counter                                                            

  Voice / Clipboard paste     Input          Free          **✓**     US-004
  button                                                             

  Sample claim cycling (5     Input          Free          **✓**     US-003
  samples)                                                           

  Clear textarea button       Input          Free          **✓**     US-005

  Quick example chips (5 ---  Input          Free          **✓**     US-002
  input)                                                             

  Try Another chips (5 ---    Input          Free          **✓**     US-014
  results)                                                           

  Verdict banner (4 grade     Results        Free          **✓**     US-008
  variants)                                                          

  Not Found state (grey/❓    Results        Free          **✓**     US-017
  banner)                                                            

  Confidence dial SVG         Results        Free          **✓**     US-009
  (animated)                                                         

  Dial rAF counter animation  Results        Free          **✓**     US-009

  Dial grade pill (animated   Results        Free          **✓**     US-009
  dot)                                                               

  Dial stats row              Results        Free          **✓**     US-009
  (Sources/Grade/Primary)                                            

  Summary card with topic     Results        Free          **✓**     US-011
  chips                                                              

  Topic chips --- teal + gold Results        Free          **✓**     US-011
  variants                                                           

  Narration chain (Isnād) --- Results        Free          **✓**     US-010
  5 nodes                                                            

  Chain node role labels (9   Results        Free          **✓**     US-010
  types)                                                             

  Evidence grid (4 cards)     Results        Free          **✓**     US-011

  Arabic text in evidence     Results        Free          **✓**     US-011
  cards (Amiri)                                                      

  Grade badges                Results        Free          **✓**     US-011
  (.grade-sahih/hasan/daif)                                          

  Scholar consensus bar chart Results        Free          **✓**     US-012
  (4)                                                                

  Consensus bar animation on  Results        Free          **✓**     US-012
  verify                                                             

  Hard-coded disclaimer       Results        Free          **✓**     US-013
  (always shown)                                                     

  Trust Strip (4 stats in     Trust          Free          **✓**     US-001
  hero)                                                              

  3-step How It Works cards   Education      Free          **✓**     US-015

  3D tilt on methodology      Education      Free          **✓**     US-015
  cards                                                              

  FAQ accordion (5 items)     Education      Free          **✓**     US-016

  Loading state (3 animated   UX             Free          **✓**     US-001
  dots)                                                              

  Results opacity fade on     UX             Free          **✓**     US-001
  verify                                                             

  Dark mode                   UX             Free          **✓**     US-018
  (\[data-theme=\'dark\'\])                                          

  EN language placeholder (no UX             Free          **✓**     **---**
  action)                                                            

  SAMPLES\[5\] pre-loaded     Content        Free          **✓**     US-003
  claim content                                                      

  Default pre-filled textarea UX             Free          **✓**     US-001
  (SAMPLES\[0\])                                                     

  Voice input                 Input          Free          **🔮**    US-004
  (SpeechRecognition API)                                            

  Real backend verification   Core           Free          **🔮**    US-001
  API                                                                

  Per-mode backend search     Core           Free          **🔮**    US-007
  algorithms                                                         

  Share result link / URL     Social         Free          **🔮**    US-001

  Dynamic API-populated       Core           Free          **🔮**    US-001
  results                                                            

  Mawḍūʿ red banner variant   Results        Free          **🔮**    US-008
  (built)                                                            

  Ḍaʿīf/Mawḍūʿ scholar        Results        Free          **🔮**    US-012
  consensus                                                          

  Saved / bookmarked          Premium        Prem          **🔮**    **---**
  verifications                                                      

  Bulk CSV verification       Premium        Prem          **🔮**    **---**

  Citation export (PDF /      Premium        Prem          **🔮**    **---**
  WhatsApp)                                                          
  ----------------------------------------------------------------------------

Legend: ✓ = in verify\_\_1\_.html mockup · 🔮 = designed not built ·
Prem = premium tier future

**8. Verification Logic & Verdict States**

**8.1 Four Verdict Grades**

  ---------------------------------------------------------------------------------------
  **Grade**   **Arabic**   **English**   **Icon**   **Color Token**  **Hex**
  ----------- ------------ ------------- ---------- ---------------- --------------------
  Ṣaḥīḥ       صحيح         Authentic     🛡️         \--grade-sahih   #0F6E56

  Ḥasan       حسن          Good / Sound  🛡️         \--grade-hasan   #5D8A3A

  Ḍaʿīf       ضعيف         Weak          ⚠️         \--grade-daif    #A86932

  Mawḍūʿ      موضوع        Fabricated    **✗**      \--grade-mawdu   #B33A3A
  ---------------------------------------------------------------------------------------

**8.2 Confidence Score Mapping**

  --------------------------------------------------------------------------
  **Grade**   **Dial %   **Dominant       **Meaning**
              Range**    Color**          
  ----------- ---------- ---------------- ----------------------------------
  Ṣaḥīḥ       85--100%   Green-dominant   Very high consensus --- acceptable
                                          as primary legal evidence

  Ḥasan       60--84%    Gold-dominant    Acceptable consensus --- most
                                          scholars act upon this for rulings

  Ḍaʿīf       25--59%    Orange           Weak chain --- not for legal
                                          rulings; may be cited for
                                          encouragement only

  Mawḍūʿ      0--24%     Red              Fabricated --- must not be
                                          attributed to the Prophet ﷺ
  --------------------------------------------------------------------------

**8.3 Result Components by Verdict**

  ---------------------------------------------------------------------------------
  **Component**   **Ṣaḥīḥ**   **Ḥasan**      **Ḍaʿīf**    **Mawḍūʿ**    **Not
                                                                        Found**
  --------------- ----------- -------------- ------------ ------------- -----------
  Verdict Banner  Green       Yellow-green   Orange       Red           Grey / ❓

  Confidence Dial 85--100%    60--84%        25--59%      0--24%        0%

  Narration Chain Shows       Shows          Shows        Shown only if Not shown
                                             (weakness    chain data    
                                             noted)       exists;       
                                                          omitted       
                                                          entirely if   
                                                          no isnād      
                                                          available for 
                                                          that          
                                                          narration     

  Evidence Cards  All 4       All 4          Weak chain   Fabrication   Not Found
                                             notes        note card     card only

  Scholar         Shows       Shows          Shows        Shows         Not shown
  Consensus                                  objections   fabrication   
                                                          rulings       

  Disclaimer      Always      Always         Always       Always        Always
  ---------------------------------------------------------------------------------

**8.4 Not Found State Requirements**

- Verdict banner: muted grey, ❓ icon, \'No authenticated match found
  for this claim\'

- Summary: \'This claim could not be matched to any authenticated
  source. It may be fabricated (mawḍūʿ), apocryphal, or simply not
  recorded in the collections we reference.\'

- Evidence cards: single Not Found card only (no Arabic text)

- Scholar consensus: not shown --- no scholars to cite

- Disclaimer: always shown --- same hard-coded text

**8.5 Arabic Mode --- Specific Behavior**

- Textarea: direction:rtl; text-align:right;
  font-family:var(\--font-arabic)

- Placeholder: أدخل النص العربي للحديث هنا...

- Production search: exact Arabic wording first → variant transmission
  search second

- Results: Arabic primary source card displayed prominently

**9. Interactions & Animations**

  -------------------------------------------------------------------------------------------
  **Interaction**   **Trigger**            **Behavior**                       **Duration /
                                                                              Easing**
  ----------------- ---------------------- ---------------------------------- ---------------
  Mode Button       Click .vmode           Remove .on all → add .on clicked.  0.20s
  Toggle                                   Arabic: RTL + font-arabic on       
                                           textarea.                          

  Brand Logo Hover  Hover .brand           SVG .star element: star-spin       0.8s / 0.9s
                                           keyframe 45° (0.8s ease-reverent,  
                                           forwards). .halo element:          
                                           halo-pulse keyframe opacity        
                                           .25→.7→.25 (0.9s ease, infinite).  
                                           Triggered by CSS .brand:hover      
                                           selector.                          

  Chip Click        Click .example-chip    useChip(): strip quotes → ta.value scroll:smooth
  (input)           (input area)           → updateCounter → focus → scrollTo 
                                           offsetTop-80, smooth               

  Chip Click        Click .example-chip    Same useChip() --- fills textarea, scroll:smooth
  (results)         (try-another)          scrolls to verify box              

  Sample Button     Click .btn-side        ta.value=SAMPLES\[sampleIdx%5\];   Instant
                    (loadSample)           sampleIdx++; updateCounter;        
                                           ta.focus                           

  Clear Button      Click .btn-side        ta.value=\'\'; updateCounter();    Instant
                    (clearInput)           ta.focus()                         

  Voice Button      Click .btn-side        clipboard.readText() → fill +      Async
                    (pasteClipboard)       counter. alert on failure.         

  Verify Button     Click #verifyBtn       Empty guard → .loading → fade      2200ms total
                                           results → loading dots → 2200ms →  
                                           dial + bars + scroll               

  Confidence Dial   animateDial(pct)       stroke-dashoffset 1.2s             1.2s
                                           ease-reverent + rAF counter        ease-reverent
                                           +2%/frame                          

  Consensus Bars    runVerify() completion All .cs-bar → width:0 → setTimeout 1.0s
                                           100ms → restore → CSS fill         ease-reverent

  FAQ Toggle        Click .faq-q           Close all open → toggle target.    0.38s
                    (toggleFaq)            .faq-icon rotate 45°. .faq-a       ease-reverent
                                           max-height 0→200px.                

  How Card Hover    Hover .how-card        .how-icon scale(1.1) rotate(-5deg) 0.30s
                                                                              ease-reverent

  How Card 3D Tilt  mousemove on .how-card rotateX(±5°) + rotateY(±7°);       0.08s during
                                           style.transition=\'0.08s\'         move

  How Card Reset    mouseleave .how-card   style.transform=\'\'; transition   0.38s
                                           0.38s ease-reverent                ease-reverent

  Evidence Card     Hover .ev-card         translateY(-5px) scale(1.012) +    0.38s
  Hover                                    teal glow shadow. NO shimmer.      ease-reverent

  Chain Bubble      Hover .cn-bubble       border-color darkens + shadow 0    0.20s
  Hover                                    2px 8px rgba(0,105,110,.1)         

  Verify Button     Hover #verifyBtn       translateY(-2px) scale(1.04) +     0.25s
  Hover                                    stronger shadow                    ease-reverent

  Side Button Hover Hover .btn-side        border-color teal-500 + color      0.22s
                                           teal-700 + bg rgba(0,105,110,.04)  ease-premium

  Chip Hover        Hover .example-chip    bg teal-700 + white text + border  0.20s
                                           transparent + translateY(-1px) +   ease-premium
                                           glow                               

  Nav Link Hover    Hover .nav-link        scale(1.05) + teal glow bg + color 0.25s
                                           teal-700                           ease-premium

  Footer Link Hover Hover .ft-link         translateX(4px) + border-left      0.18s
                                           teal + color #88E0E5               

  Scroll Reveal     IntersectionObserver   Add .in to .reveal; stagger via    0.65s
                    0.06                   -d1/d2/d3/d4                       ease-reverent

  Loading Dots      During runVerify()     ldBounce 1.2s; 3 dots staggered 0s 1.2s, loop
                                           / +0.2s / +0.4s                    

  Theme Toggle      Click #themeBtn        Toggle \[data-theme=\'dark\'\] on  0.4s CSS ease
                                           \<html\>; persist                  
                                           \'islamicinfo-theme\'              

  Dial on Page Load setTimeout 600ms       animateDial(80) auto-fires 600ms   1.2s
                                           after page load                    ease-reverent
  -------------------------------------------------------------------------------------------

**10. Responsive Breakpoints**

  -------------------------------------------------------------------------
  **Breakpoint**   **Affected         **Changes Applied**
                   Components**       
  ---------------- ------------------ -------------------------------------
  ≤ 1100px         Footer, Nav        Footer: 3-column. nav-link: 11.5px,
                                      padding 5px.

  ≤ 900px          Nav, Brand         nav-link: 10.5px, padding 5px 3px.
                                      Brand text: 16px. brand-mark:
                                      28×28px.

  ≤ 860px          .result-grid       Summary + dial: 2-column → 1 column.

  ≤ 760px          Nav, Hamburger     Nav links hidden. Hamburger shown.
                                      Header tools: theme + search only.

  ≤ 720px          .how-grid          How It Works: 3-column → 1 column.

  ≤ 700px          Footer             2-column; brand spans full width
                                      (grid-column:1/-1).

  ≤ 680px          .evidence-grid     Evidence cards: 2×2 → 1 column.

  ≤ 560px          .trust-strip,      Trust strip: 2×2 wrap, dividers
                   .verify-modes      hidden. Mode buttons: may wrap.

  ≤ 440px          Footer, Cards      Footer: 1-column. Cards stack
                                      full-width.
  -------------------------------------------------------------------------

**11. Design System Constraints (CLAUDE.md v3.0)**

**11.1 Color Tokens**

- Never use raw hex inline --- use CSS var() tokens (SVG gradient
  \<defs\> excepted)

- Never invent new colors --- pick closest existing token

- \[data-theme=\'dark\'\] is a SIBLING to :root --- NEVER merge

- Grade colors use dedicated tokens: \--grade-sahih / \--grade-hasan /
  \--grade-daif / \--grade-mawdu

**11.2 Typography Stack**

  ----------------------------------------------------------------------
  **CSS Variable**  **Font**           **Use On This Page**
  ----------------- ------------------ ---------------------------------
  \--font-display   Cormorant Garamond H1, section titles, dial
                                       percentage, stats

  \--font-serif     Cormorant Garamond Summary prose, evidence
                                       translations, textarea, loading
                                       text, FAQ

  \--font-body      Inter              Mode buttons, action bar, char
                                       counter, chip labels

  \--font-arabic    Amiri              Bismillah, textarea Arabic mode,
                                       all .ev-arabic text, all hadith
                                       quotes
  ----------------------------------------------------------------------

**11.3 Card Hover --- Canonical Spec**

> transform: translateY(-5px) scale(1.012); box-shadow: 0 16px 40px
> rgba(0,105,110,.13), 0 4px 12px rgba(0,105,110,.08), 0 0 0 1px
> rgba(0,105,110,.07); border-color: rgba(0,105,110,.2); transition: all
> 0.38s var(\--ease-reverent);
>
> BANNED: Any .card::after { animation:shimmer } or left:-100%/150%
> sweep. No-Shimmer Rule §27.4. No exceptions.

**11.4 Easing Curves**

  ----------------------------------------------------------------------------
  **Variable**       **Value**                       **Use For**
  ------------------ ------------------------------- -------------------------
  \--ease-reverent   cubic-bezier(.22,1,.36,1)       Card hovers, dial arc,
                                                     consensus bars, FAQ
                                                     accordion, how-card 3D
                                                     reset

  \--ease-premium    cubic-bezier(.25,.46,.45,.94)   Mode buttons, chips, side
                                                     buttons, search popup,
                                                     nav links
  ----------------------------------------------------------------------------

**11.5 Blueprint Fidelity Rule**

> verify\_\_1\_.html is the visual source of truth. Match font-size,
> padding, border-radius, box-shadow, transition curves, and color
> values exactly. Only change what is explicitly requested.

- Do NOT clean up, modernize, restructure, or refactor visible elements

- The footer\'s ii-footer-\* classes in the mockup are legacy ---
  production uses ft- classes only

- Hard-coded disclaimer text is part of the design --- never an output
  placeholder

**12. Routing & Action Map**

No href=\'#\' in production. Every element routes to a real destination
or triggers a named function.

  ----------------------------------------------------------------------------
  **Element**      **Route / Function**      **Notes**
  ---------------- ------------------------- ---------------------------------
  Mode buttons (4) setMode(btn, mode)        Toggles .on class; production
                                             changes search algorithm

  Voice button     pasteClipboard()          clipboard.readText(); production:
                                             SpeechRecognition API

  Sample button    loadSample()              Cycles SAMPLES\[5\] via
                                             sampleIdx++

  Clear button     clearInput()              Clears textarea value and counter

  Verify Claim     runVerify()               Full verify sequence; guard on
  button                                     empty textarea

  Quick chips (5)  useChip(el)               Fills textarea; scrolls verify
                                             box to viewport-top minus 80px

  Try Another      useChip(el)               Same useChip() behavior
  chips (5)                                  

  FAQ question     toggleFaq(el)             Close all open → toggle clicked
  rows (5)                                   item

  CTA \'Explore    quran.html                .btn-primary
  Qur\'an\'                                  

  CTA \'Hadith     hadith.html               .btn-white-ghost
  Library\'                                  

  CTA \'Dua        dua.html                  .btn-white-ghost
  Library\'                                  

  Footer \'Verify  verify.html               ft-link
  a Hadith\'                                 

  Footer \'Hadith  hadith.html#grading       ft-link with fragment
  Grading Guide\'                            

  Footer \'Our     verify.html#methodology   ft-link with fragment
  Methodology\'                              

  Footer Ecosystem External URLs             target=\'\_blank\'
  (4)                                        rel=\'noopener\'

  Footer Quick     Correct page hrefs        All 8 required;
  Access (8)                                 knowledge-hub.html never omit
  ----------------------------------------------------------------------------

**12.1 Critical href Rules**

  ------------------------------------------------------------------
  **Rule**          **Correct**            **Forbidden**
  ----------------- ---------------------- -------------------------
  Islamic Studies   islamic-studies.html   learn.html
  href                                     

  Knowledge Hub     All navs + footer      Omitting it
  presence          Quick Access ---       
                    always                 

  quranlyai.com     quranlyai.com          quranlya.com (missing
  domain                                   \'i\')

  LearnSpeakAI      LearnSpeakAI           LearnSpeakAi /
  casing                                   Learnspeakai

  Footer col 2      \'Verify\'             Any generic heading
  heading                                  

  Ecosystem target  target=\'\_blank\'     Missing rel=noopener
  attr              rel=\'noopener\'       

  Footer class      ft- prefix exclusively ii-footer-\* (legacy
  system                                   mockup classes)
  ------------------------------------------------------------------

**13. User Flows**

**Flow 1 --- Verify a Known Hadith (Primary Flow)**

16. Land on Verify page → hero + verify box with default pre-filled
    claim visible

17. Read or replace the default claim in the textarea

18. Click \'Verify Claim\' → \'Verifying...\', loading dots, results
    fade to opacity:0

19. After 2200ms → results in: Ḥasan verdict banner + dial counts to 80%

20. Read: summary card → confidence dial → narration chain → 4 evidence
    cards → scholar consensus

21. Read hard-coded disclaimer

22. Click \'Try another claim\' chip → textarea fills → click Verify
    again

**Flow 2 --- Paste from Social Media (Anti-Misinformation)**

23. User copies suspicious quote from WhatsApp/social media

24. Clicks \'Voice\' → clipboard text fills textarea

25. Clicks \'Verify Claim\' → Mawḍūʿ result: red banner, 0--24% dial,
    fabrication note

26. User reads disclaimer; production: shares result link with sender

**Flow 3 --- Arabic Text Verification**

27. Click \'Arabic\' mode → textarea becomes RTL, placeholder changes to
    Arabic

28. Paste original Arabic hadith text

29. Click \'Verify Claim\' → exact text match → results with Arabic
    primary source card

**Flow 4 --- Explore via Samples**

30. Click \'Sample\' → sample #1 fills textarea → verify → read results

31. Click \'Sample\' again → sample #2 loads → verify

32. Repeat for all 5 samples to understand capability range

**Flow 5 --- Read Methodology Before Verifying**

33. Scroll past Verify Box to How It Works section

34. Read all 3 methodology cards

35. Expand FAQ items about hadith grades and no-fatwa policy

36. Understanding established → scroll back to verify a claim

**Flow 6 --- Empty Submit Guard (Edge Case)**

37. User clicks \'Verify Claim\' with empty textarea (or whitespace
    only)

38. runVerify() hits guard: if ta.value.trim() === \'\' → return
    immediately

39. Nothing happens --- no loading state, no spinner, no visual change

40. No toast or error message shown in v1.0. Production: consider inline
    validation hint.

**Flow 7 --- Verify While Already Verifying (Edge Case)**

41. User clicks \'Verify Claim\' while a verify is already in progress

42. Button has .loading class and cursor:wait --- visual signals that a
    request is running

43. In v1.0: no explicit guard against re-clicking during the 2200ms
    window

44. Production: add guard in runVerify() to check if .loading is
    present; if so, return early

**14. Out-of-Scope / Future Work**

  -----------------------------------------------------------------------
  **Item**             **Tier**   **Notes**
  -------------------- ---------- ---------------------------------------
  Real backend         Free       v1.0 uses 2200ms simulated delay.
  verification API                Production: NLP + hadith database API.
                                  runVerify() structure ready for swap.

  Voice input          Free       pasteClipboard() marked for upgrade.
  (SpeechRecognition              Web Speech API not in v1.0.
  API)                            

  Per-mode search      Free       setMode() visual only in v1.0.
  algorithms                      Production: each mode changes backend
                                  search strategy.

  Dynamic              Free       v1.0 shows fixed demo data. Production
  API-populated                   API must hydrate all result components
  results                         dynamically.

  Share result link    Free       Referenced in Flow 2. No URL-based
                                  result sharing in v1.0.

  User accounts /      **---**    Anonymous only in v1.0.
  authentication                  

  EN language button / **---**    UI placeholder. No internationalization
  i18n                            in v1.0.

  Admin icon           **---**    UI placeholder. No auth flow in v1.0.

  Mawḍūʿ red banner    Free       CSS pattern exists (.daif); Mawḍūʿ red
  variant                         variant must be explicitly built.

  Ḍaʿīf/Mawḍūʿ scholar Free       v1.0 shows Ḥasan demo. Production must
  consensus                       render objections and fabrication
                                  rulings.

  Saved / bookmarked   Premium    No session persistence in v1.0.
  verifications                   

  Bulk CSV             Premium    Not designed. For power users.
  verification                    

  Citation export (PDF Premium    Not implemented. Formatted source
  / WhatsApp)                     citation download.

  Multi-language UI /  **---**    English-only UI in v1.0.
  Arabic interface                

  Push notifications   Free       No push API in v1.0.
  -----------------------------------------------------------------------

**15. Appendix --- JavaScript Function & CSS Class Inventory**

Complete reference of all JavaScript functions, key DOM IDs, and
page-specific CSS classes defined in verify\_\_1\_.html.

**A. JavaScript Functions**

  ------------------------------------------------------------------------------------------------------------------
  **Function**             **Signature**            **Description**
  ------------------------ ------------------------ ----------------------------------------------------------------
  applyTheme               applyTheme(t)            Sets data-theme=t on \<html\>; saves to localStorage
                                                    \'islamicinfo-theme\'; updates themeBtn SVG icon.

  openMM                   openMM()                 Adds .open to #mobileMenu.

  closeMM                  closeMM()                Removes .open from #mobileMenu.

  updateCounter            updateCounter()          #charCount = ta.value.length; #wordCount = split /\\s+/ filter
                                                    Boolean length (0 if empty).

  setMode                  setMode(btn, mode)       Removes .on from all .vmode; adds .on to btn. Production: also
                                                    changes algorithm + textarea direction.

  loadSample               loadSample()             ta.value=SAMPLES\[sampleIdx%5\]; sampleIdx++; updateCounter();
                                                    ta.focus().

  clearInput               clearInput()             ta.value=\'\'; updateCounter(); ta.focus().

  pasteClipboard           pasteClipboard()         navigator.clipboard.readText().then(fill+update).catch(alert).
                                                    Production: SpeechRecognition too.

  useChip                  useChip(el)              Strip quotes from el.textContent → ta.value → updateCounter →
                                                    focus → scrollTo offsetTop-80.

  runVerify                runVerify()              Empty guard → .loading → opacity:0 → loadingState show →
                                                    setTimeout(2200ms) → dial + bars + scroll.

  animateDial              animateDial(targetPct)   offset=478-(478×pct/100); set dialArc strokeDashoffset; rAF
                                                    counter 0→target +2%/frame.

  toggleFaq                toggleFaq(el)            el.closest(\'.faq-item\') → close all .faq-item.open →
                                                    item.classList.toggle(\'open\').

  (scroll handler)         window \'scroll\'        Toggles .scrolled on #siteHeader when scrollY\>16.

  (IntersectionObserver)   \_ro                     threshold:0.06; adds .in to .reveal on intersection; unobserves
                                                    after.

  (3D tilt)                mousemove/mouseleave     rotateX+rotateY on move (0.08s); clear on leave (0.38s
                           .how-card                ease-reverent).

  (init dial)              setTimeout(600ms)        Calls animateDial(80) on page load.
  ------------------------------------------------------------------------------------------------------------------

**B. Key DOM Element IDs**

  ------------------------------------------------------------------------
  **ID**             **Type**   **Purpose**
  ------------------ ---------- ------------------------------------------
  siteHeader         header     Site header --- .scrolled class on scroll
                                \> 16px

  searchTrigger      button     Opens #searchPopup on click

  searchPopup        div        340px popup --- .open toggles visibility

  searchPopupInput   input      Auto-focused after 50ms on popup open

  themeBtn           button     Theme toggle --- icon updates + persists
                                to localStorage

  mobileMenu         div        Full-screen overlay --- .open triggers
                                mmFade 0.3s

  verifyInput        textarea   Primary input --- Cormorant 18px italic;
                                Arabic mode: RTL + Amiri

  charCount          span       Live character count --- updated by
                                updateCounter()

  wordCount          span       Live word count --- 0 for empty string

  verifyBtn          button     Verify Claim --- onclick=runVerify();
                                .loading class during verify

  loadingState       div        display:none default; block during verify
                                2200ms

  resultsSection     div        Full results --- opacity:0→1 on verify
                                complete; scrolled into view

  dialArc            circle     SVG arc --- stroke-dashoffset set by
                                animateDial()

  dialPct            div        Confidence % text --- rAF counter in
                                animateDial()
  ------------------------------------------------------------------------

**C. Page-Specific CSS Classes**

  ------------------------------------------------------------------------------------
  **Class**                               **Purpose**
  --------------------------------------- --------------------------------------------
  .verify-box                             Main input container --- glass morphism,
                                          border-radius:28px

  .verify-modes                           Mode button row (Hadith/Quote/Claim/Arabic)

  .vmode / .vmode.on                      Mode button --- .on = active, teal-tinted

  .btn-side                               Voice/Sample/Clear --- transparent, faint
                                          border

  .btn-verify / .btn-verify.loading       Verify button --- teal gradient; loading:
                                          opacity 0.8, cursor:wait

  .example-chip                           Quick example pill --- teal fill + white on
                                          hover

  .trust-strip / .trust-item              Hero trust stats bar (4 items with ::before
                                          dividers)

  .verdict-banner (.sahih/.hasan/.daif)   Verdict display --- color variant per grade

  .vb-icon / .vb-content / .vb-badge      Banner sub-elements: icon, text, grade pill

  .result-grid                            1.4fr 1fr grid for summary + dial; 1 col at
                                          ≤860px

  .dial-card / .big-dial                  Confidence dial container + SVG wrapper

  .chain-section / .chain-nodes           Isnād chain container + node row

  .cn-bubble / .cn-bubble.start /         Chain nodes --- teal (.start) / default /
  .cn-bubble.end                          gold (.end)

  .evidence-grid / .ev-card               2×2 grid; individual evidence card

  .ev-arabic / .ev-trans / .ev-footer     Arabic text / translation / source+grade
                                          footer

  .ev-eye-primary/support/context/quran   Evidence card eyebrow color variants

  .grade-sahih / .grade-hasan /           Grade badge pills --- green / yellow-green /
  .grade-daif                             orange

  .consensus-section / .cs-bar            Scholar bar chart container / animated bar
                                          fill

  .disclaimer                             Hard-coded disclaimer --- always visible

  .how-card / .how-step-num / .how-icon   Methodology card, decorative number, icon
                                          box

  .faq-item / .faq-q / .faq-a / .faq-icon FAQ accordion item, question row, answer
                                          panel, +/× icon

  .analysis-loading / .ld                 Loading overlay / individual bounce dot

  .divider-label                          Gold horizontal divider with \'✦ Analysis
                                          Complete\'
  ------------------------------------------------------------------------------------

**D. Key Constants**

Critical JavaScript constants defined in verify\_\_1\_.html that are
product decisions, not just implementation details.

  ---------------------------------------------------------------------
  **Constant**     **Value / Structure**           **Purpose**
  ---------------- ------------------------------- --------------------
  SAMPLES          const SAMPLES = \[5 strings\]   Pre-loaded example
                   (see §4.5 for exact content)    claims. Cycled by
                                                   loadSample() via
                                                   sampleIdx. Index 0 =
                                                   default textarea
                                                   value on load.

  sampleIdx        let sampleIdx = 0 (starts at 0, Tracks which sample
                   never resets)                   loads next.
                                                   SAMPLES\[sampleIdx %
                                                   5\] wraps around.

  (dial init)      setTimeout(() =\>               Fires confidence
                   animateDial(80), 600)           dial animation 600ms
                                                   after page load.
                                                   Hard-coded 80% for
                                                   demo.

  (verify delay)   setTimeout(\..., 2200)          Simulated API
                                                   response time.
                                                   Replace with real
                                                   Promise in
                                                   production.

  (consensus reset setTimeout(\..., 100)           100ms after results
  delay)                                           appear; triggers
                                                   .cs-bar width
                                                   restore for
                                                   animation.
  ---------------------------------------------------------------------

*End of Document --- IslamicInfo Verify Page PRD v1.1 (Final)*

Source files: verify\_\_1\_.html · Verify_Page_Functional_Document.md ·
CLAUDE_v3.md

v1.1: 20 gaps resolved · 18 user stories · 90+ ACs · 44-row feature
matrix · 7 user flows · SAMPLES array documented · key constants ·
complete JS + CSS inventory
