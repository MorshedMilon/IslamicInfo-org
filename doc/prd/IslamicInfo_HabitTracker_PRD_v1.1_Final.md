**PRODUCT REQUIREMENTS DOCUMENT**

IslamicInfo Habit Tracker --- habits.html

Version 1.1 · IslamicInfo.org · May 2026

**Final --- All Refinements Applied**

  ---------------- -------------------------------------------------
  **Document       Product Requirements Document (PRD)
  Type**           

  **Product**      IslamicInfo Habit Tracker

  **Page File**    habits.html (habits\_\_1\_.html mockup ---
                   canonical blueprint)

  **Design         CLAUDE.md v3.0 --- IslamicInfo Design System
  System**         

  **Functional     Habit_Tracker_Functional_Document.md v1.0
  Spec**           

  **Visual         habits.html --- uploaded blueprint (source of
  Mockup**         truth)

  **Version**      1.1 --- Final (all review refinements applied)

  **Date**         May 2026

  **Changes in     Full platform nav table · 4 new user stories ·
  v1.1**           Fajr streak AC logic · Tab wireframes
                   (Qur\'an/Adhkar/Fasting/Sunnah) · Feature matrix
                   fasting items · EN placeholder + fastingDays
                   schema notes

  **Status**       APPROVED --- Ready for Engineering Handoff
  ---------------- -------------------------------------------------

**Table of Contents**

1\. Executive Summary

2\. Product Overview & Context

3\. Page Architecture & Visual Layout

4\. Wireframe Descriptions --- Section by Section

4.1 Global Header

4.2 Hero Section

4.3 Tracker Preview App

4.4 Tab: Prayers

**4.5 Tab: Qur\'an ★ NEW**

**4.6 Tab: Adhkar ★ NEW**

**4.7 Tab: Fasting ★ NEW**

**4.8 Tab: Sunnah Routines ★ NEW**

4.9 Pain Points Section

4.10 Free Features Section

4.11 Premium & Futuristic Section

4.12 CTA Section

4.13 Global Footer

5\. User Stories

6\. Acceptance Criteria

7\. Feature Matrix

8\. State Management & Persistence

9\. Interactions & Animations

10\. Responsive Breakpoints

11\. Design System Constraints

12\. Routing & Navigation Rules

13\. Out-of-Scope / Future Work

14\. Appendix --- Component Inventory

**1. Executive Summary**

The IslamicInfo Habit Tracker (habits.html) is the primary interactive
worship tool on IslamicInfo.org. It occupies position 8 in the global
navigation --- between Tools and Verify --- and functions as the user\'s
daily worship dashboard. All core functionality is free,
localStorage-based, and requires no account. Premium and futuristic
features are showcased to drive upgrade intent.

**Purpose**

- Enable users to track all 5 daily Salah (Fajr, Dhuhr, Asr, Maghrib,
  Isha) with a single tap

- Track Qur\'an reading pages against a user-defined daily goal (1--50
  pages)

- Provide morning/evening Adhkar checklist with authentic Arabic text

- Log voluntary fasting days with Suhoor/Iftar time display

- Track Sunnah prayer and routine habits (Duha, Witr, Qiyam, Tahajjud,
  Kahf, Fasting Mon/Thu)

- Compute and display a composite Sunnah Score (0--100%) aggregating all
  categories

- Show Day Streak counter, 28-day prayer heatmap, and 7-day week strip

- Showcase Premium and Futuristic features to surface upgrade value

**Source Files Referenced**

> Visual Mockup: habits.html --- IslamicInfo blueprint (canonical source
> of truth for layout, color, spacing, copy, and all component
> structure)
>
> Functional Spec: Habit_Tracker_Functional_Document.md v1.0 --- Full
> interaction, data, and state specification
>
> Design System: CLAUDE_v3.md (CLAUDE.md v3.0) --- Global tokens,
> typography, component rules, enforcement checklist

**Key Editorial Rules**

- No religious verdicts or fatwas issued anywhere on the page

- All Sunnah action descriptions must cite an authentic hadith with
  grade (Sahih/Hasan)

- Page is fully usable without an account --- core tracking is free and
  anonymous

- Blueprint HTML is the source of truth --- only live data integration
  may alter the design

**2. Product Overview & Context**

**2.1 Platform Context --- Full Navigation**

IslamicInfo.org is a 10-page Islamic information platform. The Habit
Tracker shares the exact header, footer, design tokens, font stack, and
interactive behaviors defined in CLAUDE.md v3.0 with all other pages.
The table below shows all 10 pages and their relationship to the Habit
Tracker.

  ---------------------------------------------------------------------------------
  **\#**   **Page       **File**               **Nav Role / Relationship to Habit
           Label**                             Tracker**
  -------- ------------ ---------------------- ------------------------------------
  1        Home         index.html             Primary landing page --- top-level
                                               entry point to the platform

  2        Quran        quran.html             Linked from tracker CTA \'Explore
           Explorer                            Qur\'an\'

  3        Hadith       hadith.html            Shares global header/footer design
           Library                             system

  4        Islamic      islamic-studies.html   NEVER learn.html --- structured
           Studies                             curriculum, not article grid

  5        Knowledge    knowledge-hub.html     NEVER omit --- article library, must
           Hub                                 appear in all navs + footer

  6        Daily Duas   dua.html               Linked from tracker CTA \'Daily
                                               Duas\'

  7        Tools        tools.html             Adjacent nav item (position 7)

  8        Habit        habits.html            THIS PAGE --- active state. Primary
           Tracker                             interactive tool.

  9        Verify       verify.html            Adjacent nav item (position 9)

  10       About        about.html             Global footer Company column link
  ---------------------------------------------------------------------------------

**2.2 Design System Compliance**

All visual implementation uses CLAUDE.md v3.0 CSS tokens exclusively. No
raw hex values inline (except SVG gradient defs). No new colors
invented. All hover transitions use var(\--ease-reverent) or
var(\--ease-premium). The No-Shimmer Rule (§27.4) is absolute --- no
::after sweep animations on any card anywhere.

**2.3 Core Constraints**

- No account required --- all tracking uses localStorage key:
  \'ii-habits\'

- No religious verdicts or fatwas issued anywhere on the page

- Hadith references must be authentic and cited with grade (Sahih/Hasan)

- Three font families must all be loaded: Cormorant Garamond · Inter ·
  Amiri

- Dark mode fully supported via \[data-theme=\'dark\'\] token overrides

- Theme persists via separate localStorage key: \'islamicinfo-theme\'

- Keyboard shortcuts 1--5 toggle Fajr--Isha (when no input element is
  focused)

- \'EN\' language button in header is a UI placeholder --- no i18n
  implemented in v1.0

**3. Page Architecture & Visual Layout**

The page follows a fixed top-to-bottom section order as defined in
functional spec §2. Sections may not be reordered. Each section\'s
ID/class, type, and purpose is listed below.

  ----------------------------------------------------------------------------------
  **Order**   **Section**   **ID / Class** **Type**        **Description**
  ----------- ------------- -------------- --------------- -------------------------
  1           Global Header .site-header   Sticky / Global 60px frosted glass. 10
                                                           nav links. Active: Habit
                                                           Tracker.

  2           Mobile Menu   #mobileMenu    Overlay /       Full-screen mobile nav.
                                           Global          All 10 links. Slide-in
                                                           from right.

  3           Hero Section  .hero          Page-specific   Bismillah · H1 · Hadith ·
                                                           2 CTAs · Tracker app
                                                           embedded

  4           Tracker       #tracker-app   Interactive App 5-tab tracking app. Core
              Preview App                                  page feature. Scroll
                                                           target from CTAs.

  5           Pain Points   .pain-grid     Marketing       8 cards addressing
              Section                                      specific user worship
                                                           struggles

  6           Free Features .feat-grid     Marketing       6 feature cards --- free
              Section                                      tier value proposition

  7           Premium &     .prem-grid     Marketing       9 cards: 3 premium + 6
              Futuristic                                   futuristic --- upgrade
                                                           discovery

  8           CTA Section   .cta-section   Conversion      Final CTA. 3 buttons.
                                                           Always last section
                                                           before footer.

  9           Global Footer ft- CSS        Global          5-column footer with
                            classes                        ecosystem links. ft-
                                                           class system only.
  ----------------------------------------------------------------------------------

**4. Wireframe Descriptions --- Section by Section**

All descriptions reference the canonical visual mockup: habits.html. The
mockup defines the exact layout, spacing, color values, copy, and
component structure. The descriptions below map each visual zone to its
functional requirements.

**4.1 Global Header**

> Blueprint ref: habits.html §4 --- CLAUDE.md §4.4. Height: 60px. Sticky
> (position:sticky, top:0, z-index:100). Frosted glass.

Three-zone layout at 60px height. Left zone: IslamicInfo brand logo (SVG
eight-pointed star + \'Islamic\' in teal-300 + \'Info\' in gold-500).
Center: 10 nav links (12.5px Inter, flex-centered, nowrap, flex:1).
Right zone: 4 icon buttons + hamburger.

Active page indicator on \'Habit Tracker\': color var(\--teal-700),
font-weight 500, and a 2px teal→gold gradient underline via ::after
pseudo-element. On scroll past 16px, .scrolled class adds bottom shadow.

  -----------------------------------------------------------------------
  **Zone**   **Element**   **Behavior / Detail**
  ---------- ------------- ----------------------------------------------
  Left       Brand logo    SVG star + \'IslamicInfo\' text. Hover: star
                           rotates 45° (star-spin keyframe 0.8s).

  Center     10 nav links  All links 12.5px. Active link: teal + weight
                           500 + gradient underline.

  Right      Search (icon  id=\'searchTrigger\'. Opens 340px search popup
             btn)          on click. Auto-focus after 50ms.

  Right      EN (language  UI placeholder only --- no i18n in v1.0.
             btn)          Renders as icon button, no action.

  Right      Theme toggle  id=\'themeBtn\'. Toggles
                           \[data-theme=\'dark\'\] on \<html\>. Persists
                           to \'islamicinfo-theme\'.

  Right      Admin (user   UI placeholder --- no auth flow in v1.0.
             icon)         

  Right      Hamburger     Visible only at ≤760px. onclick=\'openMM()\'.
                           Hidden at wider viewports.
  -----------------------------------------------------------------------

**4.2 Hero Section**

> Blueprint ref: habits.html hero block --- CLAUDE.md §6. Contains
> embedded Tracker App as its last child.

Full-width hero. Background: radial gradient with bgDrift animation (20s
ease-in-out infinite). 3 floating .geo SVG decorators (geoRot animation:
28s / 32s / 20s). Content column centered, max-width 700px.

Top-to-bottom content order inside .hero-inner:

1.  Bismillah in Arabic --- teal gradient clip-text (light) / gold
    gradient + drop-shadow (dark mode)

2.  Eyebrow badge: \'Build Lasting Worship Habits\' --- teal-tinted pill
    with .eyebrow-dot pulse

3.  H1: \'Islamic Habit\' (plain, Cormorant Garamond) + \'Tracker &
    Streak Board\' (italic gradient \<span class=\'grad\'\>)

4.  Arabic hadith: أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ --- Amiri font

5.  English translation: \'The most beloved deeds to Allah are the most
    consistent, even if small.\' --- Bukhari · Sahih

6.  Sub-text: explains the 4 tracked categories (prayers, Qur\'an,
    fasting, sunnah)

7.  CTA row: \'Start Tracking Today\' (.btn-primary, scrolls to
    #tracker-app) + \'Family Challenge\' (.btn-ghost, premium
    placeholder)

8.  Tracker Preview App (§4.3--4.8) --- embedded as last child of
    hero-inner

**4.3 Tracker Preview App --- Outer Shell (#tracker-app)**

> Blueprint ref: habits.html #tracker-app --- Functional Spec §6.
> Primary interactive component of the page.

Glass morphism container: rgba(255,255,255,.88) background,
backdrop-filter:blur(20px), border-radius:24px, max-width:700px,
centered. Dark mode: rgba(21,37,39,.92), border rgba(0,105,110,.28).
Entry animation via .reveal class.

Fixed internal layout (top to bottom, never reordered):

  ------------------------------------------------------------------------------
  **Zone**   **Component**   **ID / Class**  **Description**
  ---------- --------------- --------------- -----------------------------------
  Top        Stats Strip     .stats-strip    4 metrics in horizontal row with
                                             vertical dividers. Teal-tinted
                                             background.

             Date Row        .tracker-date   Dynamic date (left) + gold streak
                                             badge with fire emoji (right).

  Middle     Tab Bar         .tabs           5 tabs: Prayers / Qur\'an / Adhkar
                                             / Fasting / Sunnah. Prayers active
                                             by default.

             Week Strip      #weekStrip      7 day-pills for current week. Built
                                             dynamically by JS on load.

  Body       Tab Panel       #tab-\*         5 panels, only one visible at a
                                             time (display:none/block via
                                             switchTab()).
  ------------------------------------------------------------------------------

**Stats Strip Detail**

  -----------------------------------------------------------------------------
  **Metric**      **ID**    **Default**   **Color**   **Updates When**
  ------------ ------------ ------------- ----------- -------------------------
  Day Streak       ---      14            teal-700    Day boundary detected;
                                                      streak recalculated on
                                                      load

  Today %       #todayPct   40%           teal-700    Any habit toggled ---
                                                      reflects live Sunnah
                                                      Score

  Weekly Score  #weeklyPct  72%           gold-700    Any habit toggled

  Best Streak      ---      21            teal-700    Day boundary;
                                                      longestStreak field in
                                                      STATE
  -----------------------------------------------------------------------------

**Week Strip Detail**

Built by buildWeekStrip(): 7 .day-pill elements for Sun--Sat of current
week. Each pill shows 3-letter day name (10px uppercase), date number
(Cormorant Garamond 18px), and 5 prayer dots (5px circles).

  ----------------------------------------------------------------------
  **State**      **Class**             **Visual Rule**
  -------------- --------------------- ---------------------------------
  Today          .day-pill.today       Teal gradient fill, white text
                                       --- highest emphasis

  Past --- 5/5   .day-pill.done-full   Teal border, subtle teal
  prayers                              background

  Past ---       .day-pill (default)   Default style; dot fill count =
  partial                              prayers logged that day

  Future         .day-pill (default)   Default style; no dots filled
  ----------------------------------------------------------------------

**4.4 Tab: Prayers (Default Active Tab)**

> Blueprint ref: habits.html #tab-prayers --- Functional Spec §6.5.

Displayed by default when the page loads. Contains the most complex
sub-components.

  -----------------------------------------------------------------------
  **Sub-component**     **Details**
  --------------------- -------------------------------------------------
  Prayer Countdown      Injected as first child by initCountdown().
  (#prayer-countdown)   Updates every 60s. Shows: current window
                        remaining (orange if \<15 min) OR next prayer
                        countdown OR night Witr reminder.

  Prayer Circles        5-column grid (3 cols at ≤480px). Each: prayer
  (.prayers-row)        name label (11px) + 52×52px circle + optional
                        Fajr streak badge below Fajr. Unchecked: hollow
                        border. Checked (.done): teal gradient fill +
                        white checkmark + glow shadow + prayerRipple
                        keyframe.

  Sunnah Prayer Pills   4 pills: Qiyam (off) / Duha (on) / Witr (on) /
                        Tahajjud (off). Toggle via toggleSunnah(). .on
                        state: teal fill + white text.

  Progress Bars (3)     Qur\'an Pages Today (#quran-bar, teal) · Dua
                        Checklist (#dua-bar, gold) · Weekly Sunnah Score
                        (#score-bar, rainbow gradient). All update on
                        every habit change.

  Sunnah Score Ring     56×56px SVG. Background circle + progress arc
                        with teal→gold gradient stroke. stroke-dashoffset
                        = 144.5 × (1 − score/100). Score number
                        (#scoreRingNum) in Cormorant Garamond 22px
                        gradient text. Rotated −90° so arc starts from
                        top.

  28-Day Heatmap        4×7 grid. 5 heat levels: none → rgba opacity
  (#heatmap)            bands → teal-700 → teal-500 + glow. Cell hover:
                        scale(1.25) + title tooltip (\'YYYY-MM-DD · N/5
                        prayers\'). Reads STATE.history for past days;
                        live STATE.prayers for today.

  Tracker Footer        Daily Qur\'an goal input (#quranGoal, default 5,
                        range 1--50, onchange=updateQuranGoal()) on left.
                        \'Reset day\' link (onclick=resetDay()) on right.
  -----------------------------------------------------------------------

**4.5 Tab: Qur\'an**

> ★ NEW in v1.1 --- Previously missing from wireframe descriptions.
>
> Blueprint ref: habits.html #tab-quran --- Functional Spec §6.6.

Hidden by default. Activated when user clicks the Qur\'an tab (📖).
Receives focus of buildHeatmap(\'quranHeatmap\', 30) on first open.

  ---------------------------------------------------------------------
  **Sub-component**   **Details**
  ------------------- -------------------------------------------------
  Header label        \'Today\'s Qur\'an Reading\' --- 13px weight 500.
                      Below: \'Pages read today\' + #quranPagesDisplay
                      (\'3 / 5\' default).

  Range slider        type=range, min=0, max=STATE.quranGoal,
  (#quranSlider)      value=STATE.quranPages. Custom teal thumb, 6px
                      height. Background gradient tracks progress:
                      linear-gradient(90deg, teal-500 \[pct\]%,
                      rgba(0,105,110,.15) \[pct\]%). oninput calls
                      updateQuranSlider(this.value).

  Slider labels       \'0\' pinned left · #quranMax (\'5 pages\'
                      default) pinned right. Max label updates when
                      goal changes.

  Juz Progress Bar    Section label \'Juz Progress (Current Khatm)\'.
                      #juzBar (teal fill) + #juzPct (percentage right).
                      Formula: min(round(pages/goal × 22 + 2), 100).
                      Gives contextual Qur\'an completion sense.

  30-Day Qur\'an      Same visual pattern as prayer heatmap --- 30
  Heatmap             cells (not 28). Built when tab is first opened
  (#quranHeatmap)     (lazy init). Each cell maps to a day\'s
                      quranPages entry in STATE.history.
  ---------------------------------------------------------------------

**4.6 Tab: Adhkar (Morning & Evening Remembrance)**

> ★ NEW in v1.1 --- Previously missing from wireframe descriptions.
>
> Blueprint ref: habits.html #tab-dua --- Functional Spec §6.7.

Hidden by default. Activated by Adhkar tab (🙏). Focuses on structured
dhikr checklist with Arabic text.

  ---------------------------------------------------------------------
  **Sub-component**   **Details**
  ------------------- -------------------------------------------------
  Header label        \'Morning & Evening Adhkar\' --- 13px weight 500,
                      margin-bottom 16px.

  Dua List (#duaList) 6 .dua-item elements. Items 0--3 checked by
                      default; 4--5 unchecked. Each item: 18×18px
                      checkbox (.dua-cb --- teal fill + checkmark when
                      .checked) + label text (.dua-label, 13px).
                      Checked: text-decoration:line-through +
                      var(\--ink-subtle). Separator between items:
                      0.5px border (none on last item).

  6 Adhkar Items      0: أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ (Morning remembrance) ·
  (exact content)     1: Ayat al-Kursi (morning) · 2: سُبْحَانَ اللَّهِ × 33 ·
                      3: الْحَمْدُ لِلَّهِ × 33 · 4: اللَّهُ أَكْبَرُ × 34 · 5: Dua
                      before sleep (Ayat al-Kursi + last 2 verses
                      Al-Baqarah)

  Adhkar Progress Bar Label \'Adhkar completed\' left + #duaProgress
                      (e.g. \'4 / 6\') right. Bar: #duaProgressBar with
                      gold gradient fill (var(\--gold-500)). Updates
                      via syncDuaProgress() on every toggleDua() call.
  ---------------------------------------------------------------------

**4.7 Tab: Fasting**

> ★ NEW in v1.1 --- Previously missing from wireframe descriptions.
>
> Blueprint ref: habits.html #tab-fasting --- Functional Spec §6.8.

Hidden by default. Activated by Fasting tab (🌙). Tracks voluntary fasts
(Shawwāl, Mon/Thu) across the current month.

  ---------------------------------------------------------------------
  **Sub-component**   **Details**
  ------------------- -------------------------------------------------
  Month Summary Row   Two columns. Left: month label (\'This Month
                      (Shawwāl)\' 11px uppercase muted) + count in
                      Cormorant Garamond 32px teal (\'3 of 6\') +
                      sub-label \'Shawwāl voluntary fasts\'. Right
                      (text-right): Suhoor time (\'4:28 AM\') +
                      Iftar/Maghrib time (\'8:42 PM\') --- static
                      placeholders; live Prayer Times API in
                      production.

  30-Day Fast Grid    CSS grid, repeat(7, 1fr), gap 3px. Built by
  (#fastGrid30)       buildFastGrid() on tab open. Each .fast-day-cell:
                      number + state class. Cells are clickable ---
                      toggle STATE.fastingDays\[dateKey\] → rebuild
                      grid → toast.

  Cell States         Default: rgba(0,105,110,.04) bg,
                      var(\--ink-subtle) text · .fasted: teal-700 bg,
                      white text · .today-fast: transparent bg,
                      teal-700 text, dashed teal border.

  Stats Row (3        Equal-width flex row with teal-tinted borders:
  metrics)            Fasted (count) · Remaining (6 minus fasted) ·
                      Streak (consecutive fasted days). Numbers in
                      Cormorant Garamond 20px teal-700. Labels 9.5px
                      uppercase muted. Updates on every grid cell tap.

  Mark Today Button   Full-width button. Default: teal gradient fill +
                      \'Mark Today as Fasted\'.
                      onclick=toggleFastToday(this). When fasted: green
                      gradient (#0F6E56→#2CAB87) + \'✓ Today Fasted ---
                      Alhamdulillah!\' Second tap: un-fasts and
                      restores original button.
  ---------------------------------------------------------------------

**4.8 Tab: Sunnah Routines**

> ★ NEW in v1.1 --- Previously missing from wireframe descriptions.
>
> Blueprint ref: habits.html #tab-sunnah --- Functional Spec §6.9.

Hidden by default. Activated by Sunnah tab (⭐). Tracks 6 specific
prophetic practices beyond obligatory prayers. Each item includes a
hadith-sourced reward text to provide spiritual motivation.

  --------------------------------------------------------------------------
  **Sub-component**        **Details**
  ------------------------ -------------------------------------------------
  Header label             \'Daily Sunnah Routine\' --- 13px weight 500,
                           margin-bottom 14px.

  Sunnah Routine List      6 .sunnah-routine-item elements. Default checked:
  (#sunnahList)            items 0, 1, 3.

  6 Routine Items          0: 🌅 Fajr Sunnah (2 rakʿah) --- Before Fajr
                           adhan --- \'Light in this world & the next\'
                           \[CHECKED\] · 1: ☀️ Duha Prayer (2--8 rakʿah) ---
                           After sunrise --- \'Equivalent to full body
                           charity\' \[CHECKED\] · 2: 📖 Read Surah Al-Kahf
                           --- Every Friday --- \'Light between two
                           Fridays\' \[unchecked\] · 3: 🌟 Witr prayer
                           (min 1) --- After Isha --- \'Allah is Witr and
                           loves Witr\' \[CHECKED\] · 4: 🌙 Qiyam al-Layl
                           --- Last third of night --- \'Allah descends &
                           responds\' \[unchecked\] · 5: 💊 Voluntary fast
                           Mon/Thu --- All day --- \'Prophet\'s ﷺ weekly
                           practice\' \[unchecked\]

  Item Anatomy             .sri-cb (20×20px checkbox, teal when checked) +
  (.sunnah-routine-item)   .sri-content (.sri-name 13px weight 500 +
                           .sri-time 10.5px muted) + .sri-reward (10.5px
                           teal-700, text-right, max-width 110px). Hover:
                           rgba(0,105,110,.03) bg + padding-left shift
                           0.18s.

  Sunnah Progress Bar      Label \'Sunnah completed today\' left +
                           #sunnahProgress (\'3 / 6\') right. Bar:
                           #sunnahProgressBar with rainbow gradient fill
                           (teal-700 → teal-500 → gold-500). Updates via
                           syncSunnahProgress() on each toggleRoutineItem()
                           call.
  --------------------------------------------------------------------------

**4.9 Pain Points Section**

> Blueprint ref: habits.html .pain-grid --- Functional Spec §7.

Standard section padding. Eyebrow: \'Why Muslims Struggle\'. H2: \'The
Problems We Solve Together\' (gradient span on last two words).
Auto-fill grid, minmax 260px, gap 16px.

8 cards total. Each: 48px emoji icon (hover: scale(1.15) rotate(−4deg)),
bold title, description paragraph. Cards 3 and 6 carry .gold-glow class
(gold-tinted shadow + border on hover). NO shimmer ::after animation on
any card --- teal glow shadow only.

**4.10 Free Features Section**

> Blueprint ref: habits.html .feat-grid --- Functional Spec §8.

Visually distinguished by background: var(\--surface-card). H2:
\'Everything You Need to Build Consistency\'. Subtitle confirms free
tier. Auto-fill grid, minmax 280px, gap 20px. Two icon variants:
.feat-icon.teal (teal-tinted bg) and .feat-icon.gold (gold-tinted bg).
Icon hover: scale(1.12) rotate(−5deg).

**4.11 Premium & Futuristic Section**

> Blueprint ref: habits.html .prem-grid --- Functional Spec §9.

H2: \'The Future of Spiritual Growth\'. Fixed 3-column grid (2 at
≤1024px, 1 at ≤600px). Row 1: 3 cards with \'Premium\' gold badge. Rows
2--3: 6 cards with \'Futuristic\' badge. All cards height:100%
flex-column.

3D Habit Orb (#sunnahOrb): 100×100px conic-gradient sphere. orb-spin 8s
linear infinite + orb-ring 4s ease-in-out infinite. Click: speed to
1.5s + toast Sunnah Score + revert after 2000ms.

**4.12 CTA Section**

> Blueprint ref: habits.html .cta-section --- CLAUDE.md §11. MUST be
> last section before footer.

Deep teal gradient background: linear-gradient(135deg, teal-800,
teal-700, teal-900). Gold glow pseudo-element top-left (::before), teal
glow bottom-right (::after). Centered content column.

Eyebrow: \'✦ Start Your Streak Today\'. H2: \'Build Habits That Allah
Loves Most\' (gold italic span via \<span class=\'gold-it\'\>). Three
buttons: .btn-gold scrolls to #tracker-app · two .btn-white-ghost link
to quran.html and dua.html.

**4.13 Global Footer**

> Blueprint ref: habits.html footer --- CLAUDE.md §7. Uses ft- CSS class
> prefix EXCLUSIVELY --- never ii-footer-\* classes.

5-column grid (2fr 1fr 1fr 1fr 1fr). Collapses: 3-col at ≤1100px · 2-col
brand-spans at ≤700px · 1-col at ≤440px.

  --------------------------------------------------------------------------
  **Column**   **Heading**   **Content**
  ------------ ------------- -----------------------------------------------
  Col 1 (2fr)  IslamicInfo   Logo + tagline + Arabic verse (Hud 11:88) +
               brand         social links

  Col 2        \'Habit       5 links: Prayer Tracker · Fasting Log · Sunnah
               Tracker\'     Routines · Streak Board · Sunnah Score --- all
                             → habits.html

  Col 3        \'Quick       8 links (all required, never omit
               Access\'      knowledge-hub.html): Quran Explorer · Hadith
                             Library · Islamic Studies · Knowledge Hub ·
                             Daily Duas · Islamic Tools · Habit Tracker ·
                             Verify a Claim

  Col 4        \'Our         QuranlyAI → quranlyai.com · MosqueFinder ·
               Ecosystem\'   TravellyAI · LearnSpeakAI (exact casing).
                             target=\_blank rel=noopener.

  Col 5        \'Company /   About · Contact · (margin-top:16px) · Privacy
               Legal\'       Policy · Terms of Use
  --------------------------------------------------------------------------

Footer bottom bar --- exact locked strings: Left: \'© 2026
Islamicinfo.org --- No ads. No fatwas. No fabricated sources.\' Right
(italic, muted): \'All content source-verified · Privacy-first · Built
with sincerity\'

Footer link hover: translateX(4px) + left teal border --- 0.18s
transition.

**5. User Stories**

Stories are tagged P0 (must-have for launch) or P1 (high priority). NEW
stories added in v1.1 are marked with ★.

**5.1 Prayer Tracking**

**US-001 --- Log Daily Prayer**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        Muslim user visiting the Habit Tracker page

  I want to   tap a prayer circle to mark that prayer as completed

  So that     I can track all 5 daily prayers and see my consistency
              grow over time

  Priority    P0 --- Core

  Notes       Keyboard shortcuts 1--5 toggle Fajr--Isha respectively.
              State persists to localStorage immediately. Ripple
              animation fires on toggle.
  -------------------------------------------------------------------

**US-002 --- View Prayer Streak**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        returning user

  I want to   see my current Day Streak and Best Streak in the stats
              strip at a glance

  So that     I feel motivated to maintain consecutive days of all 5
              prayers without breaking the chain

  Priority    P0 --- Core

  Notes       Streak increments only when all 5 prayers logged for a
              day. Resets to 0 if any day has \< 5. Best Streak
              (longestStreak) persists indefinitely.
  -------------------------------------------------------------------

**US-003 --- See Next Prayer Countdown**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user during the day who is busy and may lose track of
              time

  I want to   see a live countdown to the next prayer window, or time
              remaining in the current window

  So that     I never miss a prayer due to not knowing when the
              window closes

  Priority    P1 --- High

  Notes       Updates every 60 seconds via setInterval. Turns orange
              when \< 15 min remaining. In production: replace static
              estimated windows with Prayer Times API using user\'s
              lat/lng.
  -------------------------------------------------------------------

**US-004 --- Reset Day**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who made an error or wants to start the day\'s
              tracking fresh

  I want to   click \'Reset day\' to clear all of today\'s prayer and
              habit data

  So that     I can begin again without carrying incorrect entries
              forward

  Priority    P1 --- High

  Notes       Clears: prayers\[5\], sunnahPrayers, duaChecked\[6\],
              sunnahItems\[6\], quranPages. Does NOT clear:
              quranGoal, fastingDays, streak, history. Fires toast
              \'Day reset --- Bismillah, start fresh! 🌅\'.
  -------------------------------------------------------------------

**5.2 Qur\'an Tracking**

**US-005 --- Log Qur\'an Pages**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user with a daily Qur\'an reading goal

  I want to   drag a slider to log how many pages of Qur\'an I\'ve
              read today

  So that     my Qur\'an progress contributes to my Sunnah Score and
              is reflected in my 30-day heatmap

  Priority    P0 --- Core

  Notes       Slider max = STATE.quranGoal. Background gradient
              tracks position. Updates: #quranPagesDisplay, #juzBar,
              #juzPct, #quran-bar, #quran-lbl, and updateScore().
  -------------------------------------------------------------------

**US-006 --- Set Custom Page Goal**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user with a specific recitation pace

  I want to   set my own daily Qur\'an page goal between 1 and 50
              pages

  So that     the tracker matches my personal schedule rather than a
              fixed default

  Priority    P1 --- High

  Notes       #quranGoal input in tracker footer.
              onchange=updateQuranGoal(). Updates slider max and
              persists to STATE.quranGoal in localStorage.
  -------------------------------------------------------------------

**5.3 Adhkar & Dua**

**US-007 --- Complete Morning/Evening Adhkar**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user performing structured morning or evening
              remembrance

  I want to   check off individual adhkar items from an Arabic text
              checklist

  So that     I have a guided, trackable dhikr practice that
              contributes to my Sunnah Score

  Priority    P0 --- Core

  Notes       6 items with Arabic text. Items 0--3 checked by
              default. Checked items show strikethrough. Progress bar
              and Sunnah Score update on every toggle.
  -------------------------------------------------------------------

**5.4 Fasting**

**US-008 --- Log a Voluntary Fasting Day**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user observing voluntary fasts (Shawwāl, Mondays,
              Thursdays, or other Sunnah fasts)

  I want to   tap \'Mark Today as Fasted\' or tap a calendar cell to
              log fasting days this month

  So that     I have a visual record of my voluntary fasts and can
              track my monthly consistency

  Priority    P1 --- High

  Notes       30-day grid built by buildFastGrid(). Fasted cells turn
              teal. Stats row (Fasted / Remaining / Streak) updates
              on every tap.
  -------------------------------------------------------------------

**US-008b --- View Monthly Fasting Summary \[NEW\]**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user tracking Shawwāl or other month-long fasting
              challenges

  I want to   see at a glance how many days I have fasted this month
              and how many remain

  So that     I stay motivated and on track to complete my monthly
              fasting goal

  Priority    P1 --- High

  Notes       Month summary row shows: month name + fasted count (\'3
              of 6\') + sub-label. Stats row (Fasted / Remaining /
              Streak) shows derived metrics. Suhoor/Iftar times
              displayed (static in v1.0; live API in production).
  -------------------------------------------------------------------

**5.5 Sunnah Routines**

**US-009 --- Track Sunnah Routines**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user following the Prophet\'s ﷺ daily practices

  I want to   check off Sunnah routine items (Fajr Sunnah, Duha,
              Witr, Qiyam, Kahf, Mon/Thu fast)

  So that     I can build a comprehensive prophetic lifestyle and see
              it reflected in my Sunnah Score

  Priority    P1 --- High

  Notes       6 items. Default checked: 0 (Fajr Sunnah), 1 (Duha), 3
              (Witr). Each item shows time-of-day and a
              hadith-sourced reward text for motivation.
  -------------------------------------------------------------------

**US-009b --- See Hadith-Based Reward for Each Routine \[NEW\]**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who wants spiritual motivation beyond habit
              tracking

  I want to   see the Islamic reward or virtue associated with each
              Sunnah routine item

  So that     I understand the spiritual significance of what I\'m
              tracking and feel encouraged to maintain it

  Priority    P1 --- Content

  Notes       Each .sunnah-routine-item has a .sri-reward span
              (10.5px, teal-700, right-aligned, max-width 110px).
              Content per item must match exact values in Functional
              Spec §6.9.2. No fabricated hadith rewards.
  -------------------------------------------------------------------

**5.6 Sunnah Score**

**US-010 --- View Composite Sunnah Score**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who wants a holistic measure of their daily
              worship consistency

  I want to   see a single Sunnah Score (0--100%) that aggregates
              prayers, Qur\'an, adhkar, and sunnah routines

  So that     I can understand my overall worship health and know
              which categories need attention

  Priority    P0 --- Core

  Notes       Formula: Prayers 50% + Qur\'an 20% + Adhkar 15% +
              Sunnah 15%. Reflected simultaneously in: SVG ring arc,
              #scoreRingNum, #score-bar, #score-pct, #todayPct. All
              elements update atomically in updateScore().
  -------------------------------------------------------------------

**5.7 History & Heatmap**

**US-011 --- View 28-Day Prayer History**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user reviewing their consistency over the past month

  I want to   see a visual heatmap of my prayer completion over the
              past 28 days

  So that     I can immediately identify patterns, streaks, and weeks
              where I struggled

  Priority    P1 --- High

  Notes       5 heat levels (0--5 prayers) mapped to opacity bands.
              Cell hover shows tooltip: date + N/5 prayers. Past days
              from STATE.history; today from live STATE.prayers.
  -------------------------------------------------------------------

**US-011b --- Track Fajr Streak Separately \[NEW\]**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who finds Fajr the most challenging prayer to
              maintain consistently

  I want to   see a dedicated Fajr streak counter below the Fajr
              prayer circle

  So that     I have special recognition and motivation for the most
              difficult obligatory prayer

  Priority    P1 --- High

  Notes       id=\'fajrBadge\'. Computed by counting backward through
              STATE.history until a day where prayers\[0\] === false
              (or missing). If STATE.prayers\[0\] is true today, adds
              1 to computed count. Display: \'⭐ Nd Fajr\'.
  -------------------------------------------------------------------

**5.8 Dark Mode & Persistence**

**US-012 --- Toggle Dark Mode**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        user who prefers low-light interfaces, especially for
              night worship

  I want to   toggle between light and dark mode

  So that     I can use the tracker comfortably at night or in
              low-light conditions without eye strain

  Priority    P1 --- High

  Notes       Theme persists via localStorage \'islamicinfo-theme\'.
              Applied to \<html data-theme=\'\...\'\> before first
              render to avoid flash. Bismillah: teal gradient (light)
              → gold gradient + glow (dark).
  -------------------------------------------------------------------

**US-013 --- State Persists Across Sessions**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        returning user opening the page after closing or
              refreshing the browser

  I want to   find my prayer and habit data exactly as I left it

  So that     I don\'t have to re-enter my daily progress --- the
              tracker remembers my day

  Priority    P0 --- Core

  Notes       All state in localStorage \'ii-habits\'. New day
              triggers archive of previous day\'s data into
              STATE.history\[dateKey\] with { prayers: count, score
              }. loadState() uses safe defaults on parse error.
  -------------------------------------------------------------------

**5.9 Premium Discovery**

**US-014 --- Discover Premium Features**

  -------------------------------------------------------------------
  **Field**   **Detail**
  ----------- -------------------------------------------------------
  As a        free user who finds daily tracking valuable and wants
              more

  I want to   see clear previews of premium (Ramadan templates,
              Family Challenges, PDF export) and futuristic features

  So that     I understand the full product vision and have a reason
              to upgrade

  Priority    P1 --- Marketing

  Notes       9-card grid with Premium / Futuristic badges. 3D orb
              click fires Sunnah Score toast. All premium/futuristic
              content is display-only in v1.0 --- no actual premium
              functionality.
  -------------------------------------------------------------------

**6. Acceptance Criteria**

All criteria are required for production sign-off. Items marked ★ NEW
were absent from v1.0. Items marked ⚠ were vague in v1.0 and are now
precisely specified.

**6.1 Global Structure**

- [ ] HTML opens with \<html lang=\'en\' data-theme=\'light\'\>

- [ ] Fonts Cormorant Garamond · Inter · Amiri --- preconnected and
  imported in this exact order

- [ ] All 50+ CSS tokens in :root exactly as CLAUDE.md §1 --- no
  omissions, no substitutions

- [ ] \[data-theme=\'dark\'\] block is a SIBLING to :root --- never
  merged

- [ ] Body has Islamic geometric background-image SVG at opacity 0.04

- [ ] .ambient radial glow div present; .shell wrapper present

**6.2 Header & Navigation**

- [ ] All 10 nav items present in exact order: Home → Quran Explorer →
  Hadith Library → Islamic Studies → Knowledge Hub → Daily Duas → Tools
  → Habit Tracker → Verify → About

- [ ] \'Habit Tracker\' carries class=\'nav-link active\' with
  teal-to-gold 2px gradient underline (::after)

- [ ] knowledge-hub.html at position 5 --- NEVER omitted

- [ ] islamic-studies.html used exclusively --- NEVER learn.html

- [ ] 4 header tool icons in order: search, EN (placeholder), theme,
  admin (placeholder)

- [ ] EN language button renders as icon btn but triggers NO action ---
  no i18n in v1.0 **★ NEW**

- [ ] Hamburger: visible ONLY at ≤760px --- onclick=\'openMM()\' ---
  hidden at wider viewports

- [ ] Search popup (id=\'searchPopup\'): opens on click, auto-focuses
  input after 50ms, closes on Escape or outside click

- [ ] Theme toggle (id=\'themeBtn\'): persists via localStorage key
  \'islamicinfo-theme\' --- applied to \<html\>, not \<body\>

- [ ] Theme applied before first render to prevent flash of unstyled
  content

**6.3 Mobile Menu**

- [ ] All 10 nav links in correct order with correct hrefs

- [ ] \'Habit Tracker\' marked active (.mm-link active)

- [ ] openMM() / closeMM() functions defined and working

- [ ] Escape key closes menu

- [ ] Fade + slide-in animation (mmFade keyframe, 0.3s) on open

**6.4 Hero Section**

- [ ] Bismillah is first child of .hero-inner

- [ ] Light mode: teal gradient clip-text. Dark mode: gold gradient +
  drop-shadow(0 0 14px rgba(217,179,88,.55))

- [ ] H1 uses var(\--font-display) with \<span class=\'grad\'\> for
  italic gradient portion

- [ ] Arabic hadith present in Amiri font with English translation and
  \'Bukhari · Sahih\' attribution

- [ ] 3 .geo SVGs with geoRot animation (durations: 28s / 32s / 20s)

- [ ] Hero bg radial gradient with bgDrift animation (20s ease-in-out
  infinite)

- [ ] Two CTAs: \'Start Tracking Today\' (scrolls to #tracker-app) +
  \'Family Challenge\' (premium placeholder ghost btn)

**6.5 Tracker Preview App --- Outer Shell**

- [ ] id=\'tracker-app\' present with .reveal class

- [ ] Glass morphism: rgba(255,255,255,.88) + backdrop-filter:blur(20px)
  in light; rgba(21,37,39,.92) + teal border in dark

- [ ] Stats strip: 4 metrics --- Day Streak / #todayPct / #weeklyPct /
  Best Streak

- [ ] Date row: #today-date dynamically set; .streak-badge #streak-count
  shows current streak

- [ ] 5 tabs in order: Prayers / Qur\'an / Adhkar / Fasting / Sunnah ---
  \'Prayers\' active by default

- [ ] switchTab() hides ALL 5 panels (display:none) and shows only the
  target (display:block)

- [ ] Week strip #weekStrip: 7 day-pills built dynamically; today = teal
  fill, done-full = teal border

**6.6 Prayers Tab**

- [ ] #prayer-countdown injected as first child; updates every 60s;
  orange color when \<15 min remaining

- [ ] 5 prayer circles #p0--#p4: default states --- p0 (Fajr) and p1
  (Dhuhr) done; p2--p4 unchecked

- [ ] togglePrayer(i): toggles STATE.prayers\[i\] → saveState() →
  renderPrayers() → updateScore() → ripple (.ripple class, removed after
  500ms) → showToast()

- [ ] Keys 1--5 trigger togglePrayer() for Fajr--Isha; NOT fired when an
  input element has focus

- [ ] Fajr streak badge (#fajrBadge): counts consecutive days with
  STATE.history\[date\].prayers \>= 1 backward from yesterday; adds +1
  if STATE.prayers\[0\] is true today **⚠**

- [ ] Fajr streak resets when any history entry has prayers count === 0
  OR date key is missing from STATE.history **★ NEW**

- [ ] 4 sunnah pills: Qiyam (off) / Duha (on) / Witr (on) / Tahajjud
  (off) by default

- [ ] toggleSunnah(el, name): reads data-done attribute → toggles
  STATE.sunnahPrayers\[name\] → saves → updates .on class and data-done
  → toast

- [ ] 3 progress bars: #quran-bar (teal) · #dua-bar (gold) · #score-bar
  (rainbow) --- all update in updateScore()

- [ ] Score ring: #scoreRing stroke-dashoffset = 144.5 × (1 −
  score/100); transition animates at 1s ease-reverent

- [ ] #scoreRingNum: Cormorant Garamond 22px gradient text (teal-700 →
  gold-500)

- [ ] 28-day heatmap #heatmap: 5 heat levels; hover shows
  title=\'YYYY-MM-DD · N/5 prayers\'; today cell uses live STATE.prayers

- [ ] #quranGoal input: default 5, range 1--50,
  onchange=updateQuranGoal()

- [ ] \'Reset day\' link: resets
  prayers/sunnah/dua/sunnah-items/quranPages; PRESERVES
  quranGoal/fastingDays/streak/history

**6.7 Qur\'an Tab**

- [ ] #quranSlider: min=0, max=STATE.quranGoal, value=STATE.quranPages

- [ ] Slider background gradient updated in real-time on oninput ---
  tracks thumb position

- [ ] updateQuranSlider(v): updates STATE.quranPages → saveState →
  updates #quranPagesDisplay, #quranMax, slider gradient, #quran-bar,
  #quran-lbl → updateJuzBar() → updateScore()

- [ ] #juzBar and #juzPct: formula = min(round(pages/goal × 22 + 2),
  100)

- [ ] 30-day Qur\'an heatmap #quranHeatmap: built on first Qur\'an tab
  open (lazy init)

**6.8 Adhkar Tab**

- [ ] 6 dua items with exact Arabic content per Functional Spec §6.7.2;
  items 0--3 checked by default, 4--5 unchecked

- [ ] toggleDua(item): toggles STATE.duaChecked\[idx\] → saves → toggles
  .checked class → strikethrough on label → syncDuaProgress() →
  updateScore() → toast

- [ ] #duaProgressBar: gold gradient fill --- updates width via
  syncDuaProgress()

- [ ] #duaProgress: displays \'N / 6\' count **★ NEW**

**6.9 Fasting Tab**

- [ ] Month summary: correct month name + fasted count (\'N of 6\') +
  Suhoor/Iftar static times

- [ ] #fastGrid30 built by buildFastGrid(): 7-column grid; .fasted =
  teal fill; .today-fast = dashed teal border

- [ ] Grid cells are clickable: toggles STATE.fastingDays\[dateKey\] →
  rebuilds grid → saveState → toast

- [ ] Stats row updates after every grid tap: Fasted count / Remaining
  count / Streak count **★ NEW**

- [ ] \'Mark Today as Fasted\' button: default teal gradient. When
  fasted: green gradient + \'✓ Today Fasted --- Alhamdulillah!\'. Second
  tap: un-fasts, restores original button **★ NEW**

**6.10 Sunnah Routines Tab**

- [ ] 6 sunnah items with exact name/time/reward content per Functional
  Spec §6.9.2

- [ ] Default checked: items 0 (Fajr Sunnah), 1 (Duha), 3 (Witr) ---
  items 2, 4, 5 unchecked

- [ ] toggleRoutineItem(item): toggles STATE.sunnahItems\[idx\] → saves
  → toggles .checked class → syncSunnahProgress() → updateScore() →
  toast \'BaarakAllahu feek! 🌟\'

- [ ] .sri-reward text present and matches spec for all 6 items --- no
  fabricated rewards **★ NEW**

**6.11 State Persistence**

- [ ] localStorage key \'ii-habits\' stores full STATE object;
  saveState() called on every user interaction

- [ ] loadState(): parse error OR null returns clean getDefaultState()
  object --- never throws

- [ ] New day detected when STATE.dateKey !== today\'s YYYY-MM-DD string

- [ ] On new day: archive { prayers:count, score:calcScore(s) } into
  STATE.history\[prevDateKey\] → update streak → update longestStreak →
  reset daily fields → update dateKey → save

- [ ] Streak increments ONLY when yesterday was STATE.dateKey AND
  archived prayers count === 5 **⚠**

- [ ] Streak resets to 0 if STATE.dateKey is NOT yesterday (skipped day
  detected) **★ NEW**

- [ ] longestStreak = Math.max(longestStreak, streak) evaluated on each
  new day **★ NEW**

- [ ] fastingDays and quranGoal persist across day resets --- never
  cleared by new-day logic

**6.12 Sunnah Score**

- [ ] Formula: round((prayers/5)×50 + min(quranPages/quranGoal,1)×20 +
  (duaCount/6)×15 + (sunnahCount/6)×15) --- clamped 0--100

- [ ] All 5 connected elements update atomically: #score-pct ·
  #score-bar · #scoreRingNum · #todayPct · #scoreRing stroke-dashoffset

- [ ] Score recalculates after EVERY category change (prayer, quran
  slider, dua, sunnah routine)

**6.13 Toast Notifications**

- [ ] showToast(msg): visible for 2800ms then auto-hides

- [ ] Toast contains .toast-dot teal indicator circle

- [ ] Calling showToast() a second time while toast is visible resets
  the 2800ms timer (no stale overlap)

**6.14 Pain Points & Feature Sections**

- [ ] 8 pain cards: correct order, emoji, title, description. Cards 3
  and 6 have .gold-glow class

- [ ] 6 free feature cards: correct .feat-icon.teal and .feat-icon.gold
  variants per spec

- [ ] All cards: .reveal class + NO shimmer ::after animation --- teal
  glow shadow only (CLAUDE.md §27.4)

**6.15 Premium & Futuristic**

- [ ] .prem-grid: 3-column → 2 at ≤1024px → 1 at ≤600px

- [ ] 3 Premium badge cards (Row 1); 6 Futuristic badge cards (Rows
  2--3)

- [ ] #sunnahOrb: animationDuration speeds to 1.5s on click → Sunnah
  Score toast → reverts to 8s after 2000ms

**6.16 CTA Section**

- [ ] CTA section is the LAST section before the footer --- nothing may
  follow it except footer

- [ ] 3 buttons: \'Start Tracking Free\' (#tracker-app) · \'Explore
  Qur\'an\' (quran.html) · \'Daily Duas\' (dua.html)

- [ ] Correct locked copy: eyebrow \'✦ Start Your Streak Today\' + H2
  \'Build Habits That Allah Loves Most\'

**6.17 Footer**

- [ ] ft- CSS class prefix used exclusively --- NEVER ii-footer-\*
  classes

- [ ] Col 2 heading reads \'Habit Tracker\' with 5 habit-specific links

- [ ] Quick Access col: all 8 links including knowledge-hub.html ---
  never omit

- [ ] Ecosystem col: quranlyai.com (NOT quranlya.com) · mosquefinder.net
  · travellyai.com · learnspeakai.com (exact casing: LearnSpeakAI)

- [ ] Company col: margin-top:16px divider between Company and Legal
  sub-sections

- [ ] Bottom bar: exact locked copyright string --- left + right
  segments as specified

- [ ] Footer link hover: translateX(4px) + left teal border --- 0.18s
  transition

**6.18 Animations & Theme**

- [ ] IntersectionObserver threshold:0.08 --- .reveal elements animate
  in on scroll

- [ ] All hover transitions use var(\--ease-reverent) or
  var(\--ease-premium) --- no linear/ease-in-out

- [ ] NO shimmer ::after sweep on ANY card (CLAUDE.md §27.4 ---
  absolute, no exceptions)

- [ ] Prayer ripple: .ripple class added on togglePrayer → prayerRipple
  keyframe fires → class removed after 500ms

- [ ] Orb animations: orb-spin (8s linear infinite) + orb-ring (4s
  ease-in-out infinite) running from page load

- [ ] Light and dark mode: all tokens, gradients, borders verified
  correct in both themes

- [ ] All 8 responsive breakpoints verified: 1100 / 1024 / 900 / 760 /
  700 / 600 / 480 / 440px

**7. Feature Matrix**

Maps every feature to its tier (Free / Premium / Futuristic),
implementation status (✓ = in habits.html mockup MVP / 🔮 = designed not
yet built), and relevant user story. ★ NEW rows added in v1.1.

  -------------------------------------------------------------------------------
  **Feature**                  **Category**   **Tier**      **Status**  **US**
  ---------------------------- -------------- ------------ ------------ ---------
  5 Daily Prayer Tracking (tap Prayer         Free            **✓**     US-001
  circles)                                                              

  Keyboard shortcuts 1--5      Prayer         Free            **✓**     US-001
  (Fajr--Isha)                                                          

  Prayer Ripple Animation      Prayer         Free            **✓**     US-001
  (.ripple)                                                             

  Prayer Streak Counter (Day   Prayer         Free            **✓**     US-002
  Streak)                                                               

  Best Streak Counter          Prayer         Free            **✓**     US-002
  (longestStreak)                                                       

  Fajr Streak Badge            Prayer         Free            **✓**     US-011b
  (#fajrBadge)                                                          

  Live Prayer Countdown        Prayer         Free            **✓**     US-003
  (#prayer-countdown)                                                   

  Qur\'an Page Tracker (range  Qur\'an        Free            **✓**     US-005
  slider)                                                               

  Custom Daily Page Goal       Qur\'an        Free            **✓**     US-006
  (1--50)                                                               

  Juz Progress Bar (#juzBar)   Qur\'an        Free            **✓**     US-005

  30-Day Qur\'an Heatmap       Qur\'an        Free            **✓**     US-005
  (#quranHeatmap)                                                       

  Morning/Evening Adhkar       Adhkar         Free            **✓**     US-007
  Checklist (6)                                                         

  Arabic Text on Adhkar Items  Adhkar         Free            **✓**     US-007

  Adhkar Progress Bar (gold)   Adhkar         Free            **✓**     US-007

  Fasting Day Logger ---       Fasting        Free            **✓**     US-008
  30-Day Grid                                                           

  Mark Today as Fasted Button  Fasting        Free            **✓**     US-008
  ★                                                                     

  Fasting Stats Row            Fasting        Free            **✓**     US-008b
  (Fasted/Remaining/Streak) ★                                           

  Monthly Fasting Count        Fasting        Free            **✓**     US-008b
  Display ★                                                             

  Suhoor/Iftar Time Display    Fasting        Free            **✓**     US-008b
  (static) ★                                                            

  Live Suhoor/Iftar via Prayer Fasting        Free              🔮      US-008b
  Times API ★                                                           

  Sunnah Routine Checklist (6  Sunnah         Free            **✓**     US-009
  items)                                                                

  Hadith Reward Text per       Sunnah         Free            **✓**     US-009b
  Routine Item ★                                                        

  Sunnah Prayer Pills          Sunnah         Free            **✓**     US-009
  (Qiyam/Duha/Witr/Tahajjud)                                            

  Sunnah Progress Bar          Sunnah         Free            **✓**     US-009
  (rainbow)                                                             

  Sunnah Score SVG Ring        Score          Free            **✓**     US-010

  Score Progress Bars (3:      Score          Free            **✓**     US-010
  Qur\'an/Dua/Score)                                                    

  Stats Strip (4 metrics)      Score          Free            **✓**     US-010

  28-Day Prayer Heatmap (5     History        Free            **✓**     US-011
  heat levels)                                                          

  7-Day Week Strip with Prayer History        Free            **✓**     US-011
  Dots                                                                  

  Reset Day (preserves         Utility        Free            **✓**     US-004
  goal/history/fasts)                                                   

  localStorage Persistence     Data           Free            **✓**     US-013
  (\'ii-habits\')                                                       

  New-Day Auto-Archive to      Data           Free            **✓**     US-013
  STATE.history                                                         

  Streak Gap Detection         Data           Free            **✓**     US-013
  (skipped day) ★                                                       

  Dark Mode                    UX             Free            **✓**     US-012
  (\[data-theme=\'dark\'\])                                             

  Toast Notifications (2800ms) UX             Free            **✓**     US-001

  EN Language Button           UX             Free            **✓**     ---
  (placeholder) ★                                                       

  Ramadan & Hifz Templates     Content        Premium           🔮      US-014

  Family & Group Challenges    Social         Premium           🔮      US-014

  PDF & WhatsApp Export        Export         Premium           🔮      US-014

  3D Habit Orb (CSS conic      Visual         Futuristic      **✓**     US-014
  gradient)                                                             

  AI Habit Prediction Engine   AI             Futuristic        🔮      US-014

  Voice Check-In (\'Hey, I     Input          Futuristic        🔮      US-014
  prayed Fajr\')                                                        

  Prophet\'s ﷺ Daily Schedule  Content        Futuristic        🔮      US-014
  Overlay                                                               

  Community Leaderboard        Social         Futuristic        🔮      US-014
  (anonymous)                                                           

  Smart Habit Stacking         AI             Futuristic        🔮      US-014
  (Fajr→Adhkar→Qur\'an)                                                 
  -------------------------------------------------------------------------------

Legend: ✓ = Implemented in habits.html mockup (MVP) · 🔮 = Designed, not
yet built · ★ = New in v1.1 feature matrix

**8. State Management & Persistence**

All tracker state is managed through a single localStorage key. The
state is a flat JSON object loaded on page init (loadState()) and
written on every user interaction (saveState()).

**8.1 localStorage Keys**

  --------------------------------------------------------------------------
  **Key**                 **Purpose**                   **Values**
  ----------------------- ----------------------------- --------------------
  \'ii-habits\'           Complete tracker state object JSON string --- full
                          (see §8.2 schema)             STATE object

  \'islamicinfo-theme\'   User\'s theme preference ---  \'light\' \|
                          applied globally across all   \'dark\' (default:
                          IslamicInfo pages             \'light\')
  --------------------------------------------------------------------------

**8.2 Full State Object Schema**

> Canonical schema from Functional Spec §12.1. Missing keys handled by
> getDefaultState() --- never assume a key exists.

  ------------------------------------------------------------------------------------------------
  **Key**         **Type**       **Default Value** **Persists Across **Description**
                                                   Day Reset?**      
  --------------- -------------- ----------------- ----------------- -----------------------------
  dateKey         string         \'YYYY-MM-DD\'    Replaced (→ new   Current date --- used to
                                                   date)             detect new day on load

  prayers         boolean\[5\]   \[f,f,f,f,f\]     Cleared →         Fajr/Dhuhr/Asr/Maghrib/Isha
                                                   \[f,f,f,f,f\]     completion for today

  sunnahPrayers   object         all false         Cleared → all     { Qiyam, Duha, Witr, Tahajjud
                                                   false             } --- optional night prayers

  quranPages      number         0                 Cleared → 0       Pages read today

  quranGoal       number         5                 ✓ Preserved       User\'s daily page target
                                                                     (1--50)

  duaChecked      boolean\[6\]   \[t,t,t,t,f,f\]   Cleared →         Adhkar checklist per-item
                                                   \[t,t,t,t,f,f\]   state for today

  sunnahItems     boolean\[6\]   \[t,t,f,t,f,f\]   Cleared →         Sunnah routine items for
                                                   \[t,t,f,t,f,f\]   today

  fastingDays     object         {}                ✓ Preserved       { \'YYYY-MM-DD\': true } ---
                                                                     missing key = NOT fasted.
                                                                     Keys accumulate indefinitely.

  streak          number         0                 ✓ Updated (±1 or  Current consecutive
                                                   reset)            5/5-prayer days

  longestStreak   number         0                 ✓ Updated         All-time best streak (max of
                                                                     all streak values)

  history         object         {}                ✓ Grows           { \'YYYY-MM-DD\': {
                                                                     prayers:N, score:N } } ---
                                                                     one entry per past day
  ------------------------------------------------------------------------------------------------

**8.3 fastingDays Schema --- Important Notes**

> fastingDays is a sparse object. A missing key means NOT fasted --- do
> not infer false. Only dates with value === true are stored.
> buildFastGrid() must handle missing keys safely with:
> STATE.fastingDays\[dateKey\] === true

Example: { \'2026-05-01\': true, \'2026-05-05\': true } --- all other
days of May are not fasted.

fastingDays persists across day resets and is NEVER cleared by new-day
logic. It accumulates month over month.

**8.4 Daily Reset Logic**

> Triggered on loadState() when STATE.dateKey !== today\'s YYYY-MM-DD

9.  Archive: STATE.history\[STATE.dateKey\] = { prayers:
    prayers.filter(Boolean).length, score: calcScore(STATE) }

10. Streak update: IF STATE.dateKey === yesterday AND archived prayers
    === 5 THEN streak++ ELSE if dateKey !== yesterday THEN streak = 0

11. longestStreak = Math.max(STATE.longestStreak, STATE.streak)

12. Reset daily fields:
    prayers/sunnahPrayers/duaChecked/sunnahItems/quranPages → defaults

13. STATE.dateKey = today\'s YYYY-MM-DD string

14. saveState()

**8.5 Sunnah Score Formula**

> score = Math.round( (prayers.filter(Boolean).length / 5) × 50 +
> Math.min(quranPages / quranGoal, 1) × 20 +
> (duaChecked.filter(Boolean).length / 6) × 15 +
> (sunnahItems.filter(Boolean).length / 6) × 15 ) --- Range: 0--100

  ----------------------------------------------------------------------------------------
  **Category**   **Max      **Calculation**                      **Connected Elements
                 Points**                                        Updated**
  -------------- ---------- ------------------------------------ -------------------------
  Prayers        50 pts     prayers.filter(Boolean).length / 5 × #score-pct, #score-bar,
                            50                                   #scoreRingNum, #todayPct,
                                                                 #scoreRing arc

  Qur\'an        20 pts     min(quranPages / quranGoal, 1) × 20  #quran-bar, #quran-lbl

  Adhkar         15 pts     duaChecked.filter(Boolean).length /  #dua-bar, #dua-lbl
                            6 × 15                               

  Sunnah         15 pts     sunnahItems.filter(Boolean).length / indirect --- via
                            6 × 15                               updateScore() total
  ----------------------------------------------------------------------------------------

**9. Interactions & Animations**

  -------------------------------------------------------------------------------------
  **Interaction**   **Trigger**             **Behavior**                **Duration /
                                                                        Easing**
  ----------------- ----------------------- --------------------------- ---------------
  Prayer Toggle     Click .p-circle or keys Toggle .done class →        Ripple: 500ms
                    1--5                    prayerRipple → saveState →  ease-out
                                            updateScore → toast         
                                            \'Alhamdulillah!\' or       
                                            \'unmarked\'                

  Sunnah Pill       Click .sunnah-pill      Toggle .on + data-done →    0.22s
  Toggle                                    STATE.sunnahPrayers →       ease-premium
                                            saveState → toast           
                                            \'BaarakAllahu feek!\'      

  Tab Switch        Click .tab              Remove .active from all;    Instant (no
                                            add .active to target;      transition)
                                            display:none all panels;    
                                            display:block target panel  

  Day Pill Click    Click .day-pill         showToast with that day\'s  2800ms toast
                                            prayer count + score from   
                                            STATE.history               

  Qur\'an Slider    #quranSlider oninput    STATE.quranPages=v →        Continuous;
  Drag                                      gradient update →           bars: 1s
                                            updateQuranSlider:          ease-reverent
                                            display/juz/bars/score      

  Dua Check         Click .dua-item         Toggle .checked →           0.25s
                                            strikethrough →             
                                            syncDuaProgress →           
                                            updateScore → toast         

  Fast Grid Cell    Click .fast-day-cell    Toggle                      Instant
                                            STATE.fastingDays\[date\] → 
                                            toggle .fasted → saveState  
                                            → update stats row → toast  

  Mark Fasted       Click Mark Today button toggleFastToday: green      Instant
  Button                                    gradient + \'✓ Today        
                                            Fasted\'; second tap        
                                            un-fasts and restores       
                                            button                      

  Sunnah Routine    Click                   Toggle .checked →           0.18s
  Check             .sunnah-routine-item    syncSunnahProgress →        
                                            updateScore → toast         
                                            \'BaarakAllahu feek! 🌟\'   

  Orb Click         Click #sunnahOrb        animationDuration → 1.5s →  2000ms total
                                            showToast(score) → after    
                                            2000ms: revert to 8s        

  Reset Day         Click \'Reset day\'     Clear daily state (keep     Instant
                                            goal/fasts/history) →       
                                            saveState → re-render all   
                                            UI → toast                  

  Theme Toggle      Click #themeBtn         Toggle                      0.4s ease
                                            \[data-theme=\'dark\'\] on  
                                            \<html\> → persist          
                                            \'islamicinfo-theme\' → CSS 
                                            transitions fire            

  Scroll Reveal     IntersectionObserver    Add .visible to .reveal;    0.6s ease;
                    0.08                    stagger via                 stagger
                                            .reveal-d1/d2/d3 classes    0.1/0.2/0.3s

  Keyboard 1--5     keydown (no input       togglePrayer(key−1) ---     Same as Prayer
                    focus)                  identical behavior to       Toggle
                                            circle click                

  Search Popup      Click #searchTrigger    Add .open to #searchPopup → 0.3s
                                            focus input after 50ms;     ease-premium
                                            close on Escape or outside  
                                            click                       

  Nav Link Hover    Hover .nav-link         scale(1.05) + teal glow     0.25s
                                            bg + color teal-700         ease-premium

  Card Hover        Hover                   translateY(-5px)            0.35--0.38s
                    .pain-card/.feat-card   scale(1.012) + elev-4       ease-reverent
                                            shadow + teal glow ring     
                                            1px. NO shimmer ::after     

  Progress Bar Fill updateScore() call      width transition for all    1.0s
                                            .prog-fill elements         ease-reverent

  Score Ring Arc    updateScore() call      stroke-dashoffset CSS       1.0s
                                            transition on #scoreRing    ease-reverent
  -------------------------------------------------------------------------------------

**10. Responsive Breakpoints**

  -------------------------------------------------------------------------
  **Breakpoint**   **Affected         **Changes Applied**
                   Components**       
  ---------------- ------------------ -------------------------------------
  ≤ 1100px         Footer, Nav        Footer: 3-column. nav-link font:
                                      11.5px

  ≤ 1024px         .prem-grid         Premium/Futuristic grid: 3 → 2
                                      columns

  ≤ 900px          Nav, Brand         Nav-link: 10.5px. Brand text: 16px.
                                      brand-mark: 28×28px

  ≤ 760px          Nav, Hamburger,    Nav links hidden. Hamburger shown.
                   Header             Only theme + search in header tools.

  ≤ 700px          Footer, Stats      Footer: 2-col (brand spans full
                   banner             width). stats-banner: 2-col.

  ≤ 600px          .prem-grid         Premium/Futuristic grid: 2 → 1 column

  ≤ 480px          .prayers-row       Prayer circles grid: 5-col → 3-col

  ≤ 440px          Footer, Cards      Footer: 1-col. Cards stack
                                      full-width.
  -------------------------------------------------------------------------

**11. Design System Constraints (CLAUDE.md v3.0)**

Non-negotiable rules that take precedence over any implementation-time
decisions. Derived from CLAUDE.md v3.0.

**11.1 Color Tokens --- Absolute Rules**

- Never use raw hex values inline --- use CSS var() tokens exclusively

- Exception: SVG gradient \<defs\> blocks defined in the blueprint may
  use raw hex

- Never invent new colors --- pick the closest existing token

- \[data-theme=\'dark\'\] block is a SIBLING to :root --- NEVER merge
  them

**11.2 Typography Stack**

  ----------------------------------------------------------------------
  **CSS Variable**  **Font**           **Use For**
  ----------------- ------------------ ---------------------------------
  \--font-display   Cormorant Garamond Page headings, stat numbers
                                       (streak, score, fasting count),
                                       H1

  \--font-body      Inter              All UI labels, button text, tab
                                       names, body copy, progress labels

  \--font-arabic    Amiri              All Arabic text --- Bismillah,
                                       hadith quotes, adhkar items
  ----------------------------------------------------------------------

**11.3 Card Hover --- Canonical Spec (Only Approved Version)**

> transform: translateY(-5px) scale(1.012); box-shadow: 0 16px 40px
> rgba(0,105,110,.13), 0 4px 12px rgba(0,105,110,.08), 0 0 0 1px
> rgba(0,105,110,.07); border-color: rgba(0,105,110,.2); transition: all
> 0.35s var(\--ease-reverent);
>
> FORBIDDEN: Any ::after { animation: shimmer } or left: -100% / left:
> 150% sweep on any card. This is the No-Shimmer Rule (CLAUDE.md §27.4).
> No exceptions.

**11.4 Approved Easing Curves**

  ----------------------------------------------------------------------------
  **Variable**       **Value**                       **Use For**
  ------------------ ------------------------------- -------------------------
  \--ease-reverent   cubic-bezier(.22,1,.36,1)       Primary card hovers,
                                                     progress bar fills, score
                                                     ring arc, all main
                                                     transitions

  \--ease-premium    cubic-bezier(.25,.46,.45,.94)   Buttons, pill toggles,
                                                     search popup, secondary
                                                     UI transitions
  ----------------------------------------------------------------------------

**11.5 Blueprint Fidelity Rule**

> The blueprint (habits.html) is the visual source of truth. Only change
> what is explicitly requested --- typically live data integration.
> Surrounding design stays frozen.

- Match font-size, padding, border-radius, box-shadow, transition
  curves, and color values exactly from the mockup

- Do NOT clean up, modernize, restructure, or refactor any visible
  elements

- Do NOT rename or rewrite any visible text unless explicitly instructed

- Static blueprint content is preserved verbatim --- live data is
  injected without disrupting design

**12. Routing & Navigation Rules**

  ----------------------------------------------------------------------------------------
  **Rule   **Rule**        **Correct Value**                       **Forbidden Value**
  ID**                                                             
  -------- --------------- --------------------------------------- -----------------------
  R-01     Islamic Studies islamic-studies.html                    learn.html (wrong)
           href                                                    

  R-02     Knowledge Hub   Always at nav position 5 in header,     Omitting it --- ever
           presence        mobile menu, AND footer Quick Access    

  R-03     quranlyai.com   quranlyai.com                           quranlya.com (missing
           domain                                                  \'i\')

  R-04     LearnSpeakAI    LearnSpeakAI                            LearnSpeakAi /
           casing                                                  Learnspeakai

  R-05     Ecosystem       QuranlyAI → MosqueFinder → TravellyAI → Any other order
           column order    LearnSpeakAI                            

  R-06     Footer col 2    \'Habit Tracker\'                       \'Pages\' / \'Quick
           heading                                                 Links\' (generic)

  R-07     CTA primary     #tracker-app via                        Hard-coded pixel offset
           scroll target   scrollIntoView({behavior:\'smooth\'})   

  R-08     Qur\'an CTA     quran.html                              Any other file
           link                                                    

  R-09     Daily Duas CTA  dua.html                                Any other file
           link                                                    

  R-10     Ecosystem link  target=\'\_blank\' rel=\'noopener\'     Missing rel=noopener
           attributes                                              (security)
  ----------------------------------------------------------------------------------------

**13. Out-of-Scope / Future Work**

  -----------------------------------------------------------------------
  **Item**              **Tier**   **Notes**
  ------------------- ------------ --------------------------------------
  User Authentication     ---      No login/signup in v1.0. Free tier is
  / Accounts                       anonymous localStorage only.

  Live Prayer Times       Free     Production: replace static windows
  API                              with real API (lat/lng + method). Spec
                                   §6.5.1 marks the injection point.

  Live Suhoor/Iftar       Free     Production: replace static \'4:28 AM /
  Times                            8:42 PM\' in Fasting tab with Prayer
                                   Times API. Spec §6.8.2.

  EN Language Button      ---      EN button is a UI placeholder in v1.0.
  / i18n                           No internationalization. Arabic
                                   content is static text only.

  Admin / User Icon       ---      Header admin icon is a UI placeholder
  Button                           in v1.0. No auth flow.

  Ramadan & Hifz        Premium    Designed as Premium card only. No ETA
  Templates                        for implementation.

  Family & Group        Premium    \'Family Challenge\' CTA is a
  Challenges                       placeholder. Premium onboarding not
                                   yet designed.

  PDF & WhatsApp        Premium    Not implemented in v1.0. Requires
  Export                           auth/identity to generate personalized
                                   PDFs.

  AI Habit Prediction  Futuristic  No AI backend in v1.0. Card is
                                   discovery/marketing only.

  Voice Check-In       Futuristic  No Web Speech API integration in v1.0.

  Community            Futuristic  Requires backend + anonymous user
  Leaderboard                      identity. Not in v1.0.

  Smart Habit          Futuristic  Algorithm not yet designed. Card is
  Stacking                         illustrative only.

  Prophet\'s ﷺ Daily   Futuristic  Content not yet authored. Card is
  Schedule                         illustrative only.

  Cloud Sync /          Premium+   localStorage is single-device.
  Cross-Device                     Cross-device sync requires auth +
                                   backend.

  Push Notifications   Free/Prem   Browser push API not implemented in
  / Reminders                      v1.0.

  Multi-language UI /     ---      English-only UI in v1.0. No RTL layout
  RTL                              support planned.
  -----------------------------------------------------------------------

**14. Appendix --- Component Inventory**

Complete engineering reference. All JavaScript functions and DOM element
IDs defined in habits.html.

**A. JavaScript Functions**

  ------------------------------------------------------------------------------------------
  **Function**         **Signature**             **Description**
  -------------------- ------------------------- -------------------------------------------
  loadState            loadState()               Load STATE from localStorage; detect new
                                                 day; archive → reset → return. Returns
                                                 getDefaultState() on parse error.

  saveState            saveState()               JSON.stringify STATE →
                                                 localStorage.setItem(\'ii-habits\', \...)
                                                 --- wrapped in try/catch.

  getDefaultState      getDefaultState()         Return clean default STATE object with all
                                                 keys and correct types.

  calcScore            calcScore(state)          Pure function: compute 0--100 Sunnah Score
                                                 from a given state object. Used by
                                                 updateScore() and new-day archive.

  updateScore          updateScore()             Call calcScore(STATE) → update all 5
                                                 connected DOM elements atomically.

  renderPrayers        renderPrayers()           Sync .done class on #p0--#p4 from
                                                 STATE.prayers.

  togglePrayer         togglePrayer(i)           Toggle STATE.prayers\[i\] → save → render →
                                                 score → ripple (.ripple, 500ms) → toast.

  toggleSunnah         toggleSunnah(el, name)    Toggle STATE.sunnahPrayers\[name\] via
                                                 data-done attribute → save → toast.

  switchTab            switchTab(btn, tab)       Activate tab button; hide all 5 panels;
                                                 show target panel (display:block).

  buildWeekStrip       buildWeekStrip()          Build 7 .day-pill elements for current week
                                                 with prayer dot fill from STATE.history.

  buildHeatmap         buildHeatmap(id, days)    Build N-day heatmap grid in container
                                                 \[id\]. Used for prayers (28) and Qur\'an
                                                 (30).

  buildFastGrid        buildFastGrid()           Build 30-day fast calendar in #fastGrid30.
                                                 Uses STATE.fastingDays sparse object.

  toggleFastToday      toggleFastToday(btn)      Toggle today\'s fast:
                                                 STATE.fastingDays\[TODAY\] → button style
                                                 change → grid rebuild → toast.

  updateQuranSlider    updateQuranSlider(v)      STATE.quranPages=v → save → update
                                                 display/gradient/juz/bars/score.

  updateQuranGoal      updateQuranGoal()         Read #quranGoal input → STATE.quranGoal →
                                                 save → update slider max → toast.

  toggleDua            toggleDua(item)           Toggle STATE.duaChecked\[idx\] → save →
                                                 .checked class → strikethrough →
                                                 syncDuaProgress → score → toast.

  syncDuaProgress      syncDuaProgress()         Update #duaProgressBar width and
                                                 #duaProgress label from STATE.duaChecked.

  toggleRoutineItem    toggleRoutineItem(item)   Toggle STATE.sunnahItems\[idx\] → save →
                                                 .checked → syncSunnahProgress → score →
                                                 toast \'BaarakAllahu feek! 🌟\'.

  syncSunnahProgress   syncSunnahProgress()      Update #sunnahProgressBar width and
                                                 #sunnahProgress label from
                                                 STATE.sunnahItems.

  initCountdown        initCountdown()           Inject #prayer-countdown into #tab-prayers;
                                                 set 60s interval to update display.

  showToast            showToast(msg)            Show toast; auto-hide after 2800ms; calling
                                                 again resets timer (clearTimeout/setTimeout
                                                 pattern).

  resetDay             resetDay()                Clear
                                                 prayers/sunnah/dua/sunnahItems/quranPages →
                                                 save → re-render → toast \'Day reset ---
                                                 Bismillah! 🌅\'.

  openMM               openMM()                  Add .open class to #mobileMenu.

  closeMM              closeMM()                 Remove .open class from #mobileMenu.
  ------------------------------------------------------------------------------------------

**B. Key DOM Element IDs**

  ------------------------------------------------------------------------
  **ID**              **Type**   **Purpose**
  ------------------- ---------- -----------------------------------------
  tracker-app         div        Tracker container --- scroll-to anchor
                                 from hero CTA and final CTA section

  today-date          span       Dynamically populated: new
                                 Date().toLocaleDateString(\'en-US\',
                                 {weekday,month,day})

  streak-count        span       Current day streak number (STATE.streak)

  todayPct            span       Today\'s Sunnah Score % --- updates on
                                 every habit toggle

  weeklyPct           span       Weekly Sunnah Score % --- updates on
                                 every habit toggle

  weekStrip           div        Container for 7 dynamically built
                                 day-pill elements

  p0--p4              div ×5     Prayer circles: Fajr (p0) · Dhuhr (p1) ·
                                 Asr (p2) · Maghrib (p3) · Isha (p4)

  prayer-countdown    div        Injected by initCountdown(); shows
                                 current/next prayer window status

  fajrBadge           span       Consecutive Fajr streak badge below p0.
                                 Computed from STATE.history lookback.

  score-bar           div        Score progress bar fill
                                 (.prog-fill.rainbow) --- width updated by
                                 updateScore()

  score-pct           span       Score percentage label --- text updated
                                 by updateScore()

  scoreRing           circle     SVG arc element --- stroke-dashoffset
                                 updated by updateScore()

  scoreRingNum        text       SVG center score number --- gradient
                                 clip-text (teal-700 → gold-500)

  heatmap             div        28-day prayer heatmap grid --- built by
                                 buildHeatmap(\'heatmap\', 28)

  quranGoal           input      Daily Qur\'an goal input (default 5,
                                 range 1--50) ---
                                 onchange=updateQuranGoal()

  quranSlider         input      Qur\'an pages range slider ---
                                 oninput=updateQuranSlider(this.value)

  quranPagesDisplay   span       \'N / M\' pages display in Qur\'an tab
                                 header

  quranMax            span       Max pages label below slider --- updated
                                 when goal changes

  quran-bar           div        Qur\'an pages bar fill in Prayers tab ---
                                 updated by updateScore()

  quran-lbl           span       Qur\'an bar label in Prayers tab ---
                                 updated by updateScore()

  juzBar              div        Juz completion bar fill in Qur\'an tab

  juzPct              span       Juz percentage label in Qur\'an tab

  quranHeatmap        div        30-day Qur\'an reading heatmap --- built
                                 by buildHeatmap(\'quranHeatmap\', 30) on
                                 first open

  duaList             div        Container for 6 .dua-item elements

  duaProgressBar      div        Adhkar progress bar fill (gold gradient)
                                 --- updated by syncDuaProgress()

  duaProgress         span       \'N / 6\' adhkar count label --- updated
                                 by syncDuaProgress()

  dua-bar             div        Dua progress bar fill in Prayers tab ---
                                 updated by updateScore()

  dua-lbl             span       Dua bar label in Prayers tab --- updated
                                 by updateScore()

  fastGrid30          div        30-day fasting calendar grid --- built by
                                 buildFastGrid()

  sunnahList          div        Container for 6 .sunnah-routine-item
                                 elements

  sunnahProgressBar   div        Sunnah routines bar fill (rainbow
                                 gradient) --- updated by
                                 syncSunnahProgress()

  sunnahProgress      span       \'N / 6\' sunnah label --- updated by
                                 syncSunnahProgress()

  sunnahOrb           div        3D CSS orb --- orb-spin 8s + orb-ring 4s.
                                 Click: speed + toast + revert.

  themeBtn            button     Theme toggle icon --- persists
                                 \'islamicinfo-theme\' to localStorage

  searchTrigger       button     Search icon button --- opens #searchPopup

  searchPopup         div        340px search popup --- .open class
                                 toggles visibility + transition

  mobileMenu          div        Full-screen mobile nav overlay --- .open
                                 class triggers mmFade keyframe
  ------------------------------------------------------------------------

*End of Document --- IslamicInfo Habit Tracker PRD v1.1 (Final)*

Source files: habits.html · Habit_Tracker_Functional_Document.md ·
CLAUDE_v3.md

All refinements applied: full platform nav · 4 new user stories · Fajr
streak AC logic · 4 new tab wireframes · expanded feature matrix · EN
placeholder + fastingDays schema
