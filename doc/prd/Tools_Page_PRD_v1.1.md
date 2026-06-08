**PRODUCT REQUIREMENTS DOCUMENT**

**Islamic Tools Page**

tools.html

**IslamicInfo.org**

  -----------------------------------------------------------------------
  **Field**             **Value**
  --------------------- -------------------------------------------------
  Version               1.0 --- Final

  Date                  2026-05-18

  Status                Approved for Development

  Page                  tools.html --- Islamic Tools Suite

  Mockup                tools.html (canonical source of truth)

  Design System         CLAUDE_v3.md (v3.0)

  Functional Spec       Tools_Page_Functional_Document.md (v1.0)

  Author                IslamicInfo Product Team
  -----------------------------------------------------------------------

**Table of Contents**

1\. Product Overview

2\. Goals & Success Metrics

3\. Target Users & Journeys

4\. Feature Matrix

5\. Page Architecture

6\. Tool Inventory & Card Index

7\. User Stories & Acceptance Criteria

US-001 Prayer Times Widget

US-002 Qibla Compass

US-003 Hijri Calendar

US-004 Tasbeeh Counter

US-005 Fasting Tracker

US-006 Zakat Calculator

US-007 Inheritance Calculator

US-008 Sadaqah Tracker

US-009 Islamic Name Finder

US-010 Islamic Age Calculator

US-011 Mosque Finder

US-012 AI Claim Verifier (Coming Soon)

US-013 Tool Grid Category Filter

US-014 Dark Mode Fidelity

US-015 Mobile Responsiveness

US-016 Accessibility

US-017 Navigation & Footer

8\. Wireframe Descriptions

9\. Design System Compliance

10\. Interaction & Animation Spec

11\. Navigation & Link Audit

12\. Tool Data Model

13\. Sprint Planning Summary

14\. QA & Testing Checklist

15\. Out of Scope

16\. Open Questions

17\. Error & Edge Case Catalogue

18\. Fiqh & Content Standards

19\. Complete Tool Tag List

20\. API Integration Specs

Changelog

**1. Product Overview**

The Islamic Tools page (tools.html) is the utility dashboard of
IslamicInfo.org. It occupies position 7 in the global navigation ---
between Daily Duas and Habit Tracker --- and serves as the single
destination for all practical Islamic tools on the platform.

Unlike the content pages (Quran, Hadith, Knowledge Hub), this page feels
and operates like a working app dashboard. Every button, card, and tab
triggers a real, visible action. No decorative elements in production.

**1.1 Core Purpose**

- Group every practical Islamic tool in one discoverable, functional
  page

- Operate as a working dashboard --- each card launches, scrolls to, or
  opens a real tool

- Cover the full spectrum of Muslim daily needs: prayer, worship
  tracking, financial fiqh, discovery, and AI tools

- Be completely free, no account required, mobile-first, and connected
  to the broader IslamicInfo ecosystem

**1.2 What Makes This Page Unique**

  ------------------------------------------------------------------------
  **Attribute**      **Tools Page**             **Content Pages (KH, Dua,
                                                Hadith)**
  ------------------ -------------------------- --------------------------
  Primary mode       App dashboard --- tools    Content library ---
                     that do things             articles to read

  User action        Interact with live         Browse, search, read,
                     calculators, detectors,    share
                     counters                   

  Data               Live (prayer times,        Static (article text,
                     geolocation, gold price)   hadith text)

  State              Client-side JS state per   Stateless browsing
                     tool session               

  Offline            Tasbeeh, Zakat, Age Calc   Requires content fetch
                     work offline               
  ------------------------------------------------------------------------

**1.3 Platform Position**

  -----------------------------------------------------------------------
  **Attribute**         **Value**
  --------------------- -------------------------------------------------
  Page file             tools.html

  Nav position          7 of 10 --- between Daily Duas and Habit Tracker

  Nav label             Tools

  Design system         CLAUDE_v3.md v3.0

  Canonical mockup      tools.html (source of truth)

  Functional spec       Tools_Page_Functional_Document.md v1.0

  Total tools           12 (10 live/beta/new + 1 external + 1 coming
                        soon)
  -----------------------------------------------------------------------

**2. Goals & Success Metrics**

*All metrics are net-new baselines --- this is a freshly launched page
with no prior data.*

**2.1 Primary Engagement Goals**

  --------------------------------------------------------------------------------------------------------------------------
  **Goal**     **Metric**             **GA4 Event / Method**   **Fires When**       **Baseline**   **30-Day**   **90-Day**
  ------------ ---------------------- ------------------------ -------------------- -------------- ------------ ------------
  Tool         Tools used per session tool_open                User clicks a tool   0              ≥ 1.8        ≥ 2.6
  engagement                                                   card or hero CTA                                 
                                                               scrolls to a tool                                

  Prayer       Interactions/session   prayer_widget_interact   Any prayer slot or   0              ≥ 35%        ≥ 50%
  widget                                                       control button                                   
                                                               clicked                                          

  Qibla        Detections / 1K UVs    qibla_detect             Successful           0              ≥ 120        ≥ 200
  compass                                                      geolocation in                                   
                                                               getQibla()                                       

  Zakat        Calcs completed / 1K   zakat_calculated         calcZakat() runs     0              ≥ 80         ≥ 150
  calculator   UVs                                             with at least one                                
                                                               non-zero input                                   

  Tasbeeh      Sessions \> 10 taps    tasbeeh_session          10th                 0              ≥ 90         ≥ 180
  counter                                                      incrementTasbeeh()                               
                                                               tap in same session                              

  Tab filter   Category tab click     tool_filter              filterTools() called 0              ≥ 20%        ≥ 32%
  usage        rate                                            with non-all                                     
                                                               category                                         

  Bounce rate  Single-page sessions   GA4 engagement rate      User leaves without  Ind. \~55%     ≤ 48%        ≤ 36%
                                      (inverse)                interacting                                      
  --------------------------------------------------------------------------------------------------------------------------

**2.2 SEO Goals**

- Rank on page 1 for: \'prayer times \[city\]\', \'qibla direction\',
  \'zakat calculator\', \'Islamic name meanings\' within 6 months

- Prayer widget structured data (Event/Schedule schema) for prayer time
  rich results

- Core Web Vitals: LCP ≤ 2.5s · CLS ≤ 0.1 · INP ≤ 200ms --- tools load
  incrementally, not blocking

**2.3 Review Cadence**

  --------------------------------------------------------------------------
  **Cadence**   **Meeting**         **Key Metrics**
  ------------- ------------------- ----------------------------------------
  Weekly        Tools Weekly Pulse  Tool opens, prayer widget usage, zakat
                                    completions, broken actions

  Bi-weekly     Engagement Review   Compass detections, name searches, age
                                    calculations, tab filter rate

  Monthly       Full Tools Review   All metrics vs targets, open questions,
                                    new tool readiness
  --------------------------------------------------------------------------

**3. Target Users & Journeys**

  ------------------------------------------------------------------------
  **Audience**     **Primary Need**   **Key Tools**    **Entry Point**
  ---------------- ------------------ ---------------- -------------------
  Daily prayer     Prayer times on    Prayer widget,   Hero, prayer widget
  observer         demand for their   Qibla            
                   city                                

  Zakat payer      Fiqh-verified      Zakat calculator Zakat tool card
                   annual zakat                        
                   calculation                         

  Ramadan          Fasting tracking + Fasting tracker, Fasting tool card
  practitioner     suhoor/iftar times Prayer widget    

  Dhikr            Digital tasbeeh    Tasbeeh counter  Tasbeeh tool card
  practitioner     with daily totals                   

  New parent       Islamic name       Name Finder      Name Finder card
                   search for newborn                  

  Convert /        Learn own Islamic  Age calculator,  Discovery tab
  student          age, find Qibla    Qibla            

  Estate planner   Islamic            Inheritance      Finance tab
                   inheritance        calculator       
                   distribution                        

  General Muslim   Quick tool access  All 12 tools     Tools Grid
                   for any need                        
  ------------------------------------------------------------------------

**3.1 Key User Journeys**

**Journey A --- Daily Prayer Check**

  -------------------------------------------------------------------------------
  **Step**   **Action**       **Element**      **Success Signal**
  ---------- ---------------- ---------------- ----------------------------------
  1          Opens tools.html Hero             Prayer widget visible above fold
             before Asr                        
             prayer                            

  2          Sees \'Next: Asr Prayer widget    Correct next prayer highlighted
             · 5:28 PM\' in                    
             gold badge                        

  3          Clicks My        pw-extra-btn     Times update for user city
             Location to                       
             refresh                           

  4          Clicks Adhan to  pw-extra-btn     Alert settings dropdown opens
             set alert                         
  -------------------------------------------------------------------------------

**Journey B --- Zakat Calculation**

  --------------------------------------------------------------------------------
  **Step**   **Action**            **Element**   **Success Signal**
  ---------- --------------------- ------------- ---------------------------------
  1          Clicks Zakat          tool-card     Smooth scroll to #zakat-section
             Calculator card                     

  2          Enters savings:       zkCash,       Result updates live
             \$50,000; gold:       zkGold        
             \$10,000                            

  3          Enters debts: \$5,000 zkDebt        Result decreases correctly

  4          Reads result:         zkResult      Calculation correct (55000 x
             \$1,375.00 due                      0.025)

  5          Reads disclaimer,     Disclaimer    Trust signal seen
             books scholar         note          
             consultation                        
  --------------------------------------------------------------------------------

**Journey C --- Tasbeeh + Fasting Combo**

  ---------------------------------------------------------------------------------
  **Step**   **Action**            **Element**    **Success Signal**
  ---------- --------------------- -------------- ---------------------------------
  1          Clicks Tasbeeh        tool-card      Scrolls to #tasbeeh-section
             Counter card                         

  2          Selects Alhamdulillah dhikr-chips    Arabic and goal update to 33
             chip                                 

  3          Taps counter 33 times tasbeeh-btn    Rounds = 1, count resets to 0

  4          Looks right at        fast-card      Calendar visible without
             Fasting Tracker                      scrolling

  5          Clicks Mark Today as  fastTodayBtn   Today cell fills, streak
             Fasted                               increments
  ---------------------------------------------------------------------------------

**Journey D --- Islamic Name Discovery**

  ---------------------------------------------------------------------------------
  **Step**   **Action**         **Element**    **Success Signal**
  ---------- ------------------ -------------- ------------------------------------
  1          Clicks             tool-tabs      Grid filters to 4 discovery tools
             \'Discovery\' tab                 
             in tools grid                     

  2          Clicks Name Finder tool-card      Smooth-scrolls to #name-section
             card                              

  3          Types \'Maryam\'   #nameSearch    Input populated
             in search input                   

  4          Presses Enter      searchName()   Result panel slides in with Arabic +
                                               meaning

  5          Reads Arabic مَرْيَم, #nameResult    All fields populated correctly
             meaning, Qur\'anic                
             tag                               

  6          Clicks Age         #age-section   Visible without scrolling (right
             Calculator in                     stack)
             right column                      

  7          Enters DOB, reads  calcAge()      Hijri Years + birthday box populated
             Hijri age                         
  ---------------------------------------------------------------------------------

**Journey E --- Filter by Category + Finance**

  --------------------------------------------------------------------------------
  **Step**   **Action**         **Element**   **Success Signal**
  ---------- ------------------ ------------- ------------------------------------
  1          Lands on tools     Tool grid     All Tools tab active by default
             page, all 12 cards               
             visible                          

  2          Clicks \'Finance & tool-tabs     Grid shows only 3 cards: Zakat,
             Fiqh\' tab                       Inheritance, Sadaqah

  3          Notices Sadaqah    fast-card     Card visible after filter
             Tracker for first                
             time                             

  4          Clicks Sadaqah     tool-card     Scrolls to #name-section right
             Tracker card                     column

  5          Clicks Log Sadaqah sad-add       Confirmation \'JazakAllahu Khayran\'
                                button        shown

  6          Clicks \'All       tool-tabs     All 12 cards re-appear
             Tools\' to return                
             to full grid                     

  7          Clicks \'Prayer &  tool-tabs     4 cards: Prayer Times, Qibla, Hijri,
             Worship\' tab                    Tasbeeh
  --------------------------------------------------------------------------------

**4. Feature Matrix**

**4.1 Priority Legend**

  -----------------------------------------------------------------------------
  **Priority**   **Meaning**                             **Deadline**
  -------------- --------------------------------------- ----------------------
  P0             Launch blocker --- must ship before     Before launch
                 go-live                                 

  P1             High --- ship in first sprint after     ≤ 2 weeks post-launch
                 launch (≤2 weeks)                       

  P2             Medium --- ship within 60 days          ≤ 60 days

  P3             Low / Future --- no committed date      Backlog
  -----------------------------------------------------------------------------

**4.2 Page-Level Features**

  ------------------------------------------------------------------------------------------------
  **Feature**           **Description**                        **Priority**   **Build Status**
  --------------------- -------------------------------------- -------------- --------------------
  Global header ---     10-item nav, search popup, theme       P0             Built
  sticky nav            toggle, hamburger                                     

  Hero section          Bismillah, badge, H1, Arabic verse,    P0             Built
                        sub-text, 2 CTAs                                      

  Hero CTAs functional  Prayer Times scrolls to                P0             Not wired
                        #prayer-widget; All Tools to                          
                        #tools-section                                        

  Stats strip (4 cells) 12+ Tools · 5 Prayers · 195+ Countries P0             Built
                        · 100% Free Forever                                   

  Prayer widget         Live times card with 6 slots, next     P0             Built --- API not
                        badge, sun data, controls                             wired

  Prayer times API      AlAdhan API fetch on geolocation       P0             Not implemented
                        success                                               

  Geolocation (prayer)  navigator.geolocation → refresh prayer P0             Not implemented
                        times                                                 

  Adhan settings        Open/close dropdown from Adhan button  P1             Not implemented
  dropdown                                                                    

  Method selector       Calculation method selector (Hanafi,   P1             Not implemented
  dropdown              ISNA, MWL...)                                         

  Tool grid --- 12      All 12 cards, tabs, correct hrefs,     P0             Built --- links
  cards                 status badges                                         check needed

  Tool category filter  5 tabs filter grid via data-cat        P0             Built --- JS needs
  tabs                                                                        wiring

  Tool card 3D tilt     rotateX/Y on mousemove                 P2             Not implemented

  Qibla compass card    Animated compass, needle rotation,     P0             Built ---
                        Haversine calculation                                 geolocation not
                                                                              wired

  Qibla geolocation     navigator.geolocation → compute        P0             Not implemented
                        bearing, update needle                                

  Hijri calendar card   Month grid, event dots, prev/next      P0             Built --- nav not
                        navigation                                            wired

  Hijri calendar nav    Left/right arrows change displayed     P0             Not implemented
                        month                                                 

  Zakat calculator      5 inputs + calcZakat() + result        P0             Built --- calc logic
                        panel + disclaimer                                    check needed

  Live nisab from API   Fetch gold price → update nisab        P1             Not implemented
                        threshold                                             

  Tasbeeh counter       Dhikr chips, counter button,           P0             Built --- needs JS
                        reset/undo/vibrate, session stats                     wiring

  Fasting tracker       30-day grid, toggle fasted, Mark       P0             Built --- needs JS
                        Today, stats, suhoor/iftar                            wiring

  Name finder           Search input, local NAMES dict, result P0             Built ---
                        panel, 8 chips                                        searchName() check

  Age calculator        DOB + today inputs, calcAge()          P0             Built --- calcAge()
                        Hijri/Gregorian output                                check

  Sadaqah tracker       Ring SVG, stats, Log Sadaqah           P0             Built ---
                        confirmation                                          localStorage not
                                                                              wired

  Inheritance calc card Routes to inheritance.html             P0             href check needed

  Mosque Finder card    Routes to mosquefinder.net,            P0             href check needed
                        target=\_blank                                        

  AI Claim Verifier     Coming Soon div, tooltip on click, no  P0             Built --- tooltip
  card                  route                                                 not implemented

  CTA section           3 buttons: habits.html, dua.html,      P0             Built --- hrefs
                        verify.html                                           check

  Global footer --- ft- 5-col grid, Tools col, Quick Access,   P0             Built
  CSS                   Ecosystem, Legal                                      

  Dark mode             All sections in \[data-theme=dark\]    P0             Built

  Mobile responsive     All breakpoints:                       P0             Built
                        1100/900/820/760/700/600/560/460/440                  

  Streak persistence    Tasbeeh/Fasting weekly totals from     P1             Not implemented
                        localStorage                                          

  Adhan audio alerts    Browser notification + audio on prayer P2             Not implemented
                        time                                                  

  /saved page for tools User saved tools quick-access          P3             Not built
  ------------------------------------------------------------------------------------------------

**5. Page Architecture**

Section order is frozen per tools.html (canonical mockup). No section
may be moved, removed, or renamed without explicit instruction.

  ------------------------------------------------------------------------------
  **\#**   **Section**      **CSS Class / ID** **Purpose**
  -------- ---------------- ------------------ ---------------------------------
  1        Global Header    .site-header       Sticky nav, search, theme toggle,
                                               hamburger

  2        Mobile Menu      #mobileMenu        Full-screen nav overlay for ≤
           Overlay                             760px

  3        Hero             .hero              Bismillah, H1, Arabic verse, CTAs

  3a       Stats Strip      .stats-strip       12+ · 5 · 195+ · 100% ---
                                               embedded in hero

  3b       Prayer Widget    #prayer-widget     Live prayer times card ---
                                               embedded in hero

  4        All Tools Grid   #tools-section     5 filter tabs + 12 tool cards

  5        Qibla + Hijri    #qibla-section     Two-column: compass (left) +
           Calendar                            calendar (right)

  6        Zakat Calculator #zakat-section     Two-column: form (left) + result
                                               (right)

  7        Tasbeeh +        #tasbeeh-section   Two-column: tasbeeh (left) +
           Fasting                             fasting (right)

  8        Name + Age +     #name-section      Left: Name Finder \| Right stack:
           Sadaqah                             Age Calc + Sadaqah

  9        CTA Section      .cta-section       3 action buttons --- last before
                                               footer

  10       Global Footer    #ii-footer         ft- system, Tools col, Quick
                                               Access, Ecosystem
  ------------------------------------------------------------------------------

**6. Tool Inventory & Card Index**

All 12 tool cards in grid order with their complete specification.

  -----------------------------------------------------------------------------------------------------
  **\#**   **Tool Name**    **Status**   **Icon       **Section Anchor** **External?**   **data-cat**
                                         Theme**                                         
  -------- ---------------- ------------ ------------ ------------------ --------------- --------------
  1        Prayer Times     Live         ti-teal      #prayer-widget     No              prayer

  2        Qibla Compass    Live         ti-teal      #qibla-section     No              prayer

  3        Hijri Calendar   Live         ti-teal      #qibla-section     No              prayer

  4        Tasbeeh Counter  NEW          ti-teal      #tasbeeh-section   No              prayer tracker

  5        Fasting Tracker  NEW          ti-gold      #tasbeeh-section   No              tracker

  6        Zakat Calculator Live         ti-emerald   #zakat-section     No              finance

  7        Inheritance      Live         ti-emerald   inheritance.html   Yes (same site) finance
           Calculator                                                                    

  8        Sadaqah Tracker  NEW          ti-gold      #name-section      No              tracker
                                                                                         finance

  9        Islamic Name     Beta         ti-teal      #name-section      No              discovery
           Finder                                                                        

  10       Islamic Age      Beta         ti-teal      #age-section       No              discovery
           Calculator                                                                    

  11       Mosque Finder    Live         ti-teal      mosquefinder.net   Yes (external)  discovery

  12       AI Claim         Coming Soon  ti-gold      No route           N/A             discovery
           Verifier                                                                      
  -----------------------------------------------------------------------------------------------------

**6.1 Status Badge Spec**

  ---------------------------------------------------------------------------
  **Badge**   **CSS        **Visual**            **Meaning**
              Class**                            
  ----------- ------------ --------------------- ----------------------------
  Live        ts-live      Green dot + \'Live\'  Fully functional,
                           text                  production-ready

  NEW         ts-new       Gold gradient badge   Recently launched, fully
                                                 functional

  Beta        ts-beta      Teal outline badge    Functional but still being
                                                 refined

  Coming Soon ts-soon      Muted grey badge      Not yet available --- no
                                                 route, div card
  ---------------------------------------------------------------------------

**6.2 Category Filter → Tool Mapping**

  ---------------------------------------------------------------------------
  **Tab Label** **data-cat**   **Tools Shown**
  ------------- -------------- ----------------------------------------------
  All Tools     all            All 12 cards

  Prayer &      prayer         Prayer Times, Qibla Compass, Hijri Calendar,
  Worship                      Tasbeeh Counter

  Finance &     finance        Zakat Calculator, Inheritance Calculator,
  Fiqh                         Sadaqah Tracker

  Trackers      tracker        Tasbeeh Counter, Fasting Tracker, Sadaqah
                               Tracker

  Discovery     discovery      Islamic Name Finder, Age Calculator, Mosque
                               Finder, AI Claim Verifier
  ---------------------------------------------------------------------------

**7. User Stories & Acceptance Criteria**

**Epic 1: Prayer Tools**

**US-001 · Prayer Times Widget**

As a **Muslim who needs to know prayer times for today**, I want to
**access live prayer times for my location via the hero section** so
that I can check if it\'s time for prayer at a glance

**Acceptance Criteria**

- Prayer widget (#prayer-widget) is accessible via the hero \'Prayer
  Times\' CTA button --- smooth-scroll brings it into view.

- Widget shows 6 prayer slots: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha.

- Today\'s date populates #pwDate on load via new
  Date().toLocaleDateString(\'en-US\',\...).

- Next prayer slot carries class .pw-prayer.next with gold background
  tint + breathGold animation.

- Past prayer slots carry class .pw-prayer.past with opacity 0.44.

- Next prayer badge shows: animated gold dot + \'Next: \[Prayer Name\] ·
  \[Time\]\'.

- Sun data strip shows: Sunrise time, Sunset time, and Daylight
  duration.

- Clicking \'Change\' or \'My Location\' button calls
  getPrayerLocation().

- getPrayerLocation() calls navigator.geolocation.getCurrentPosition().

- On geolocation success: city label updates, times refresh via AlAdhan
  API.

- On geolocation denial: inline message \'Location access denied ---
  enter city manually.\'

- Adhan button opens adhan settings dropdown (not decorative).

- Method button opens calculation method selector (Hanafi, ISNA, MWL,
  etc.).

- Widget is readable at 320px width --- prayer names and times do not
  overflow.

- At ≤ 600px: prayer grid switches from 6-col to 3-col.

- GA4 event prayer_widget_interact fires on any prayer slot click.

**US-002 · Qibla Compass**

As a **Muslim who needs to find the Qibla direction**, I want to **tap
Detect My Location and see the compass needle point toward Mecca** so
that I can orient myself for prayer anywhere in the world

**Acceptance Criteria**

- Compass section at #qibla-section; accessible from Qibla Compass tool
  card.

- Dashed SVG ring rotates continuously (spin animation, 22s linear
  infinite).

- Compass needle (#compassNeedle) points to default bearing (e.g. 54°
  for Toronto) on load.

- Cardinal direction labels N/S/E/W are positioned correctly around the
  compass ring.

- Clicking \'Detect My Location\' calls getQibla().

- getQibla() calls navigator.geolocation.getCurrentPosition().

- On success: Haversine formula computes bearing using Mecca (21.4225°N,
  39.8262°E).

- Needle rotates via style.transform = \'rotate(\' + (deg-180) +
  \'deg)\' with 0.9s ease-reverent transition.

- #qDeg updates with bearing in degrees (e.g. \'54°\').

- #qDist updates with distance to Mecca in km.

- #qBearing updates with compass label (e.g. \'54° NE\').

- City label (#qCity) updates with detected city name.

- On geolocation denial: alert \'Location access denied.\'

- GA4 event qibla_detect fires on successful geolocation.

**US-003 · Hijri Calendar**

As a **Muslim planning around the Islamic calendar**, I want to **view
the current Hijri month with event highlights and navigate to adjacent
months** so that I can plan for Ramadan, Eid, and other Islamic dates

**Acceptance Criteria**

- Calendar is in the right column of #qibla-section.

- Header shows current Hijri month in English serif + Arabic script +
  year (e.g. \'Shawwal · شَوَّال 1447\').

- 7-column grid (Sun-Sat) with day name headers.

- Today\'s Hijri date cell has class .hc-day.today (teal-700 bg, white
  text).

- Islamic event days have class .hc-day.event (gold-700 text + dot
  indicator).

- Previous-month overflow days have .hc-day.faded (30% opacity).

- Clicking \'‹\' decrements displayed month and re-renders grid.

- Clicking \'›\' increments displayed month and re-renders grid.

- Events list shows ≥ 3 upcoming events for the visible month with
  colored dots and relative dates.

- Clicking an event day cell scrolls to or displays event details.

- In production: Hijri conversion uses a validated toHijri() library
  (not manual formula).

**Epic 2: Worship Trackers**

**US-004 · Tasbeeh Counter**

As a **Muslim performing post-prayer dhikr**, I want to **use the
digital tasbeeh to count SubhanAllah, Alhamdulillah, and Allahu Akbar**
so that I can complete the 33-33-34 sunnah dhikr sequence accurately

**Acceptance Criteria**

- Tasbeeh section at #tasbeeh-section.

- 4 dhikr chips present: SubhanAllah (goal 33), Alhamdulillah (goal 33),
  Allahu Akbar (goal 34), La Ilaha Illallah (goal 100).

- Default active chip is SubhanAllah (.on class, teal-700 bg, white
  text).

- setDhikr(btn, ar, en, goal): removes .on from all chips, adds to
  clicked, updates #dhikrAr/#dhikrEn, sets goal, resets count to 0.

- Counter button is 152px circle, teal gradient background.

- Clicking counter calls incrementTasbeeh(): tbCount++, tbTotal++.

- When tbCount \>= tbGoal: tbCount resets to 0, tbRounds++.

- Click animation: transform scale(0.92) for 120ms, then snaps back.

- #tbCount, #tsRounds, #tsTotal, #tsWeek all update on each tap.

- Reset button (resetTasbeeh()): tbCount=0, tbRounds=0, updates display.

- Undo button (undoTasbeeh()): decrements tbCount and tbTotal by 1 if \>
  0.

- Vibrate toggle (toggleVibrate()): toggles tbVib boolean, updates
  button label.

- When vibrate ON: navigator.vibrate(28) called on each tap.

- Session stats show: Rounds completed, Today total, This Week total.

- GA4 event tasbeeh_session fires after 10+ consecutive taps.

**US-005 · Fasting Tracker**

As a **Muslim tracking voluntary or Ramadan fasts**, I want to **mark
days as fasted in a monthly calendar grid and see my progress and
streak** so that I stay motivated and keep an accurate record of all my
fasting commitments

**Acceptance Criteria**

- Fasting tracker is in right column of #tasbeeh-section.

- In v1 (mockup state): header shows \'Fasting Tracker\' + sub-text
  \'Shawwal 1447 --- Voluntary Fasts\' with target of 6 days.

- In production: fast type (Ramadan, Shawwal 6, Mon/Thu voluntary, or
  custom) is configurable --- header text and target update accordingly.

- Large count (#fastCountBig) shows fasted days vs target (e.g. \'3 of 6
  Shawwal\' or \'14 of 29 Ramadan\').

- buildFastGrid() renders day cells for the current fasting month (30
  cells for most months; 29 or 30 for Hijri months).

- Clicking a day cell toggles .fasted class and calls updateFastStats().

- .fasted cells: teal-700 bg, white text.

- Today\'s cell has .today-fd class (dashed teal-500 border).

- Stats strip shows: Days Fasted (#fsFasted), Days Remaining (#fsLeft =
  max(0, target - fasted)), Streak (#fsStreak = consecutive days).

- Suhoor and Iftar times displayed below stats (from prayer widget API
  data in production).

- Mark Today button (fastTodayBtn) calls toggleFastToday(): toggles
  today\'s cell, updates stats, changes label.

- Label after click: \'Today Fasted --- Alhamdulillah\'.

- Second click: reverts label and removes fasted state from today.

- Fasting state persists to localStorage key fasting-{month-year} (array
  of fasted day numbers).

- GA4 event fast_day_marked fires on each day cell toggle with {day:
  number, action: \'fasted\'\|\'unfasted\'}.

**Epic 3: Financial Tools**

**US-006 · Zakat Calculator**

As a **Muslim calculating their annual Zakat obligation**, I want to
**enter my wealth details and get an accurate Zakat amount with
fiqh-verified methodology** so that I fulfill my religious obligation
correctly and consult a scholar if needed

**Acceptance Criteria**

- Zakat section at #zakat-section.

- 5 currency inputs present with correct IDs: zkCash, zkGold, zkBiz,
  zkInv, zkDebt.

- Each input has type=\'number\', \$-prefix symbol, and calls
  calcZakat() on oninput.

- Calculate button also calls calcZakat().

- calcZakat() logic: total = cash+gold+biz+investments-debts; zakat =
  total \>= nisab ? total\*0.025 : 0.

- Nisab default: \$6,180 (displayed as \'Current Nisab (85g gold):
  \$6,180 USD\').

- #zkResult updates with formatted Zakat amount (\$X,XXX.XX).

- #zkTotal updates with total zakatable wealth.

- #zkPayable updates with zakat amount (bold, teal).

- #zkResultLabel: \'Based on 2.5% of zakatable wealth\' if above nisab;
  \'Wealth below nisab --- no Zakat due\' if below.

- Amounts formatted with 2 decimal places and thousands separator.

- Disclaimer note present: calculation is an estimate, consult a
  qualified scholar, Hanafi methodology.

- In production: live nisab fetched from gold price API and displayed.

- GA4 event zakat_calculated fires on each calcZakat() call with
  non-zero inputs.

**US-007 · Inheritance Calculator**

As a **Muslim distributing an estate according to Islamic law**, I want
to **navigate to the dedicated Inheritance Calculator page** so that I
can enter heir details and get a fiqh-compliant distribution breakdown

**Acceptance Criteria**

- Inheritance Calculator tool card is an \<a\> element (not div).

- href is \'inheritance.html\' --- routes to the dedicated page.

- Card status badge shows \'Live\'.

- Card description mentions: all 8 heir types, faraidh law, PDF report.

- inheritance.html exists as a separate page (in scope for this sprint
  if not yet built).

- On inheritance.html: estate value input, heir type checkboxes (all 8
  types), distribution output.

- distribution output shows each heir\'s fractional share + monetary
  value.

- PDF report download available on inheritance.html.

**US-008 · Sadaqah Tracker**

As a **Muslim tracking their voluntary charity giving**, I want to **log
a sadaqah donation and see my progress toward my monthly goal** so that
I stay accountable to my charitable giving commitments

**Acceptance Criteria**

- Sadaqah tracker is in the right column stack of #name-section, below
  the Age Calculator.

- SVG ring (90×90px) shows progress: stroke-dashoffset computed from
  (this-month / goal).

- Two concentric circles: bg ring (rgba(0,105,110,.12)) and progress
  ring (teal→gold gradient).

- Center text shows percentage and \'of goal\' label.

- Stats show: This Month (\$76), Monthly Goal (\$200), This Year
  (\$440).

- Log Sadaqah button: on click, text changes to \'✓ Logged! JazakAllahu
  Khayran\'.

- After 2 seconds: button reverts to original label + plus icon.

- In production: opens donation form (amount + cause), saves to
  localStorage ledger.

- Monthly stats persist to localStorage key sadaqah-ledger.

- GA4 event sadaqah_logged fires on each log action.

**Epic 4: Discovery Tools**

**US-009 · Islamic Name Finder**

As a **Muslim parent or student searching for an Islamic name**, I want
to **search a name and see its Arabic script, meaning, gender, origin,
and Quranic reference** so that I can make an informed naming decision
based on Islamic scholarship

**Acceptance Criteria**

- Name section at #name-section.

- Search input (#nameSearch) has placeholder \'e.g. Maryam, Ibrahim,
  Aisha\...\'

- searchName() fires on button click and on Enter keypress in input.

- searchName(): lowercase input, strip non-alpha, look up in NAMES dict.

- If found: calls showName(data) --- reveals #nameResult with slideUp
  animation (0.3s).

- If not found: hides #nameResult.

- #nrAr shows Arabic name (Amiri, 28px, RTL, teal-700).

- #nrTitle shows English name + transliteration (serif, 20px).

- #nrMeaning shows detailed meaning and Islamic context.

- Tags row shows: gender badge (.tag-m blue or .tag-f rose), origin
  badge (.tag-ori teal), Quranic ref (.tag-quran gold) or \'From
  Sunnah\'.

- 8 suggestion chips present with Arabic script labels.

- Clicking a chip calls quickName(\'\[key\]\'): fills input and
  immediately shows result.

- All 8 names in local dict: maryam, ibrahim, yusuf, aisha, khadijah,
  umar, zaynab, nuh.

- In production: API query returns 2,000+ names.

- GA4 event name_searched fires on each successful result.

**US-010 · Islamic Age Calculator**

As a **Muslim who wants to know their age in the Hijri calendar**, I
want to **enter my date of birth and see my Hijri age with my
approximate Hijri birthday** so that I understand my age in the Islamic
calendar system

**Acceptance Criteria**

- Age calculator card at #age-section, nested inside #name-section
  (right column).

- DOB input (#ageDob): type=\'date\', triggers calcAge() on onchange.

- Today input (#ageToday): type=\'date\', auto-set on load to new
  Date().toISOString().split(\'T\')\[0\].

- calcAge() computes: days since DOB, gregY, hijriY, hijriM,
  hijriBirthYear.

- Result grid shows: Hijri Years (#aHijriY), Hijri Months (#aHijriM),
  Gregorian Years (#aGregY), Total Days (#aDays).

- Default state: all results show \'---\' until DOB is entered.

- Hijri Birthday box shows: Arabic Hijri date (#aHijriAr), English Hijri
  month+year (#aHijriEn).

- Default Hijri box: Arabic prompt \'Enter your birthdate\'; English
  \'Enter your date of birth above\'.

- Results labelled \'(approximate)\' --- exact conversion requires
  lookup table in production.

- At ≤ 460px: inputs stack to single column.

**US-011 · Mosque Finder**

As a **Muslim who needs to find the nearest masjid**, I want to **click
the Mosque Finder card and reach the MosqueFinder.net platform** so that
I can find Jumu\'ah times and prayer facilities near me

**Acceptance Criteria**

- Mosque Finder card is an \<a\> element.

- href=\'https://mosquefinder.net\', target=\'\_blank\',
  rel=\'noopener\'.

- Link text in card CTA: \'Open MosqueFinder ↗\' --- arrow denotes
  external link.

- Status badge: \'Live\'.

- Card icon theme: ti-teal.

- No embedding of mosque finder on the tools page --- external
  navigation only.

**US-012 · AI Claim Verifier --- Coming Soon**

As a **product team managing the tools page**, I want to **show the AI
Claim Verifier card as a preview without routing anywhere** so that
users know it is coming and can join the waitlist

**Acceptance Criteria**

- Card element is \<div\> --- NOT \<a\>.

- card has cursor:default and opacity:0.75.

- Status badge shows \'Coming Soon\' (.ts-soon).

- All tag chips at 50% opacity.

- CTA text \'Launching 2026\' at 45% opacity, cursor:default.

- No hover lift --- translateY(0), no glow.

- Clicking anywhere on the card (or CTA text) shows a modal or tooltip.

- Modal content: \'AI Claim Verifier --- Coming 2026\' + description +
  optional email waitlist input.

- Modal does not navigate away from the page.

**Epic 5: Navigation & Platform**

**US-013 · Tool Grid Category Filter**

As a **user exploring tools by category**, I want to **click a category
tab and see only tools relevant to that category** so that I can quickly
find the right tool without scrolling past unrelated cards

**Acceptance Criteria**

- 5 filter tabs present: All Tools, Prayer & Worship, Finance & Fiqh,
  Trackers, Discovery.

- \'All Tools\' is active by default (.tool-tab.active).

- Clicking a tab: removes .active from all tabs, adds to clicked.

- filterTools(cat, btn) iterates all .tool-card elements.

- Cards whose data-cat includes the filter string remain visible; others
  get display:none.

- filter=\'all\' shows all 12 cards.

- Cards with data-cat=\'prayer tracker\' appear in both Prayer & Worship
  AND Trackers tabs.

- Tab transition is immediate (no animation delay).

- GA4 event tool_filter fires with {category: string} on each tab click.

- Active tab: background var(\--teal-700), color white, border
  transparent, scale(1.04) glow.

**US-014 · Dark Mode Fidelity**

As a **user who prefers dark mode**, I want to **see every section
render correctly with dark theme tokens** so that my experience is
premium and consistent in dark mode

**Acceptance Criteria**

- data-theme=\'dark\' applied to \<html\> --- not \<body\>.

- Theme persists via localStorage key islamicinfo-theme.

- Dark mode applied before render --- no flash of light mode on load.

- Bismillah: gold gradient + filter:drop-shadow(0 0 14px
  rgba(217,179,88,.55)).

- Hero title: color #F5F8F8.

- Tool cards: background #152527, border rgba(0,105,110,.18).

- Card hover glow: rgba(88,193,199,.18) --- NOT light-mode teal.

- Stats strip: background var(\--white) = #152527 in dark.

- Prayer widget unchanged (already dark by design).

- Tasbeeh Arabic text: var(\--teal-300).

- Section eyebrows: color var(\--teal-300).

- Sun icon shown in dark mode (toggle to light); moon in light (toggle
  to dark).

**US-015 · Mobile Responsiveness**

As a **user on a mobile phone (320px--767px)**, I want to **use every
tool on the page without horizontal overflow** so that I have full
access to Islamic tools on the go

**Acceptance Criteria**

- No horizontal scroll at any breakpoint from 320px upward.

- ≤ 900px: nav font 10.5px, brand 16px.

- ≤ 820px: two-column layouts (.two-col) stack to single column.

- ≤ 760px: nav hidden, hamburger visible, only theme+search+hamburger in
  header-tools.

- ≤ 700px: stats strip wraps 2×2; footer 2-column.

- ≤ 600px: prayer widget prayer grid: 6-col → 3-col.

- ≤ 560px: stats strip wraps to 2×2.

- ≤ 460px: age calculator inputs stack to single column.

- ≤ 440px: footer 1-column.

- Tasbeeh counter button (152px) remains usable at 320px.

- Prayer widget readable without overflow at 320px.

- Tool cards auto-fill grid collapses gracefully to 1-col on narrow
  screens.

**US-016 · Accessibility**

As a **user relying on a keyboard or screen reader**, I want to
**navigate and interact with all tools without a mouse** so that Islamic
tools are accessible regardless of ability

**Acceptance Criteria**

- All interactive elements reachable via Tab in logical reading order.

- Prayer slot buttons have aria-label=\'\[Prayer name\] prayer at
  \[time\]\'.

- Tasbeeh counter button: aria-label=\'Count dhikr, current count: N\'.

- Compass Detect button: aria-label=\'Detect my location for Qibla\'.

- All form inputs have visible labels or aria-label.

- Search input: aria-label=\'Search Islamic names\'.

- Date inputs: aria-label=\'Date of birth\' and aria-label=\'Today\'s
  date\'.

- Bismillah: aria-label=\'Bismillah --- In the name of Allah, the Most
  Gracious, the Most Merciful\'.

- Coming Soon card: aria-label=\'AI Claim Verifier --- launching in
  2026\'.

- Colour contrast: all body text meets WCAG AA (4.5:1) in light and dark
  modes.

- No keyboard trap in mobile menu --- Tab exits menu cleanly.

- Tool grid tab filter is keyboard-navigable (focus + Enter activates
  tab).

**US-017 · Navigation & Footer**

As a **user anywhere on the page**, I want to **use consistent global
navigation and access all platform tools** so that I can move between
any IslamicInfo page in one click

**Acceptance Criteria**

- All 10 nav items in exact order: Home · Quran Explorer · Hadith
  Library · Islamic Studies · Knowledge Hub · Daily Duas · Tools · Habit
  Tracker · Verify · About.

- \'Tools\' has class=\'nav-link active\' with teal/gold underline
  gradient.

- Islamic Studies href: islamic-studies.html --- NEVER learn.html.

- Knowledge Hub at position 5 --- never omitted.

- Footer uses ft- CSS class system (NOT ii-footer-\* classes).

- Footer column 1 heading: \'Tools\' with 5 tool-specific deep-links.

- Footer Quick Access (col 2): all 8 destinations including Knowledge
  Hub.

- Footer Ecosystem (col 3): QuranlyAI · MosqueFinder · TravellyAI ·
  LearnSpeakAI --- exact URLs.

- quranlyai.com --- not quranlya.com.

- learnspeakai.com --- never missing.

- Copyright: \'© 2026 Islamicinfo.org --- No ads. No fatwas. No
  fabricated sources.\'

- CTA buttons: Track Your Ibadah → habits.html; Dua Library → dua.html;
  Verify a Hadith → verify.html.

**8. Wireframe Descriptions**

All wireframes reference tools.html (canonical mockup file). ASCII
diagrams describe exact visual layout and flow of each section as
rendered in that file.

**§8.1 Global Header**

**tools.html --- \<header class=\'site-header\'\>**

> ┌───────────────────────────────────────────────────────────────────────────────┐
>
> │ \[IslamicInfo ✦\]
> Home·Quran·Hadith·IS·KH·Duas·Tools·Habits·Verify·About \[🔍 EN ☾ 👤\]│
>
> │ ────── ← teal/gold underline on Tools │
>
> └───────────────────────────────────────────────────────────────────────────────┘
>
> ← sticky, z-index 100, 60px tall, backdrop-filter blur(24px)
>
> ← \'Tools\' has .nav-link.active; mobile ≤760px: nav hidden, hamburger
> shown

**§8.2 Hero Section**

**tools.html --- .hero (contains stats strip + prayer widget)**

> ░░ radial glow: teal upper-left, gold upper-right ░░
>
> ◆ .g1 (teal star) ◆ .g3 (gold star) ○ .g4 (teal circle)
>
> بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ← Amiri, teal gradient clip-text
>
> ┌──────────────────────────────────────┐
>
> │ ● Islamic Tools Suite │ ← hero-badge pill
>
> └──────────────────────────────────────┘
>
> Every Tool a Muslim
>
> Needs Daily ← .grad-it gradient italic teal→gold
>
> حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ ← Qur\'an 2:238, RTL
>
> Prayer times, Qibla, Zakat, Inheritance, Hijri Calendar...
>
> \[Prayer Times\] \[All Tools ↓\] ← .btn-primary + .btn-ghost
>
> ┌────────────────────────────────────────────────────────────┐
>
> │ 12+ │ 5 │ 195+ │ 100% │
>
> │ Tools│Prayers │Countries│ Free Forever │
>
> └────────────────────────────────────────────────────────────┘
>
> ← .stats-strip: flex row inside hero, margin-top: 36px
>
> ┌──────────────────────────────────────────────────────────┐
>
> │ ████ dark teal gradient bg ████ id=prayer-widget │
>
> │ Toronto, Ontario \[Next: Asr · 5:28 PM ●\] │
>
> │ Monday, May 18 │
>
> │ ┌───────┬───────┬───────┬───────┬───────┬───────┐ │
>
> │ │ Fajr │Sunrise│ Dhuhr │ Asr │Maghrib│ Isha │ │
>
> │ │ 4:12 │ 5:52 │ 1:28 │ 5:28 │ 8:56 │10:22 │ │
>
> │ │ (past)│(past) │(past) │(NEXT◉)│ │ │ │
>
> │ └───────┴───────┴───────┴───────┴───────┴───────┘ │
>
> │ 🌅 5:52 🌇 8:56 ☀14h4m \[🔔 Adhan\]\[⚙Method\]\[📍Loc\]│
>
> └──────────────────────────────────────────────────────────┘
>
> ← prayer-widget: dark teal gradient, ::before gold glow, ::after teal
> glow

**§8.3 All Tools Grid**

**tools.html --- #tools-section**

> ┌─────────────────────────────────────────────────────────────────┐
>
> │ \[All Tools\] \[Prayer & Worship\] \[Finance & Fiqh\] \[Trackers\]
> \[Discovery\] │
>
> └─────────────────────────────────────────────────────────────────┘
>
> ← .tool-tabs: active tab = teal-700 bg, white text, scale(1.04)
>
> ┌──────────────┬──────────────┬──────────────┬──────────────┐
>
> │ \[⏰ ti-teal\] │ \[🧭 ti-teal\] │ \[📅 ti-teal\] │ \[📿 ti-teal\] │
>
> │ ● Live │ ● Live │ ● Live │ ✦ NEW │
>
> │ Prayer Times │Qibla Compass │Hijri Calendar │ Tasbeeh │
>
> │ Accurate salah│ Precise dir. │ Full Islamic │ Digital dhikr│
>
> │ \[Auto\]\[195+\] │ \[GPS\]\[Dist\] │ \[1447\]\[Auto\] │
> \[Dhikr\]\[Sess\]│
>
> │ Open Tool → │ Open Tool → │ Open Tool → │ Open Tool → │
>
> ├──────────────┼──────────────┼──────────────┼──────────────┤
>
> │ \[🌙 ti-gold\] │ \[♻ ti-emerald\]│ \[👥 ti-emrld\] │ \[❤ ti-gold\] │
>
> │ ✦ NEW │ ● Live │ ● Live │ ✦ NEW │
>
> │ Fasting Track.│Zakat Calc. │ Inheritance │ Sadaqah │
>
> │ Track Ramadan │ Calculate │ Islamic faraid│ Log charity │
>
> │ \[Ramadan\]\[Str\]│ \[Nisab\]\[Fiqh\] │ \[All Heirs\] │
> \[Goals\]\[Mo\] │
>
> │ Open Tool → │ Open Tool → │ Open Tool → │ Open Tool → │
>
> ├──────────────┼──────────────┼──────────────┼──────────────┤
>
> │ \[📖 ti-teal\] │ \[📅 ti-teal\] │ \[📍 ti-teal\] │ \[🧠 ti-gold\] │
>
> │ Beta │ Beta │ ● Live │ Coming Soon │
>
> │ Name Finder │ Age Calc. │ Mosque Finder │ AI Verifier │
>
> │ 2,000+ names │ Gregorian→ │ Nearest masjid│ Paste hadith │
>
> │ \[2K+\]\[Arabic\] │ \[Hijri\]\[Days\] │ \[GPS\]\[Maps\] │
> \[AI\]\[61K+\] │
>
> │ Open Tool → │ Open Tool → │ Open MFinder ↗│ Launching 2026│
>
> └──────────────┴──────────────┴──────────────┴──────────────┘
>
> ← auto-fill grid minmax(280px,1fr) · tool cards are \<a\> except
> Coming Soon (\<div\>)
>
> ← hover: translateY(-5px) scale(1.012) + teal glow --- NO shimmer

**§8.4 Qibla Compass + Hijri Calendar**

**tools.html --- #qibla-section .two-col**

> ┌───────────────────────────────┬───────────────────────────────────┐
>
> │ LEFT: .qibla-card │ RIGHT: .hijri-card │
>
> │ │ │
>
> │ Toronto, Ontario 54° │ Shawwal · شَوَّال 1447 \[‹\] \[›\] │
>
> │ │ │
>
> │ ╔═══════════════╗ │ Sun Mon Tue Wed Thu Fri Sat │
>
> │ ║ N ║ │ 1 2 3 4 5 6 7 │
>
> │ ║ ↑ needle ║ │ 8 9 10 11 12 13 14 │
>
> │ ║ ✦ dot ║ │ 15 16 17 18 19 20 21 │
>
> │ ║ ║ │ 22 23 24 25 26 27 28 │
>
> │ W ═╣ ╠═ E │ 29 30 1\* 2\* 3\* │
>
> │ ║ ║ │ ← today = teal; event = gold │
>
> │ ║ S ║ │ │
>
> │ ╚═══════════════╝ │ ● Shawwal 6 Fasts begin Tmw │
>
> │ 🕋 Kaabah · Mecca │ ● Dhu al-Qadah begins +15d │
>
> │ 7,234 km 54° NE │ ● Eid al-Adha Jun 6 │
>
> │ │ │
>
> │ \[📍 Detect My Location\] │ │
>
> └───────────────────────────────┴───────────────────────────────────┘
>
> ← SVG dashed ring rotates 360° continuously (22s linear infinite)
>
> ← needle rotates to bearing with 0.9s ease-reverent transition
>
> ← .two-col stacks to 1-col at ≤820px

**§8.5 Zakat Calculator**

**tools.html --- #zakat-section .zakat-grid**

> ┌────────────────────────────────┬──────────────────────────────────┐
>
> │ LEFT: .zakat-form-card │ RIGHT: .zakat-result-card │
>
> │ │ ░ gold+teal gradient tint ░ │
>
> │ \[\$ Cash & Bank Savings \] │ │
>
> │ \[\$ Gold & Silver Value \] │ YOUR ZAKAT DUE │
>
> │ \[\$ Business Assets \] │ │
>
> │ \[\$ Investments \] │ \$ 1,375.00 │
>
> │ \[\$ Outstanding Debts (-) \] │ Based on 2.5% of zakatable │
>
> │ │ wealth │
>
> │ ℹ Nisab: \$6,180 (85g gold) │ │
>
> │ │ Total Wealth \$55,000.00 │
>
> │ \[Calculate My Zakat\] │ Nisab \$6,180.00 │
>
> │ ← .zk-btn full-width teal │ Zakat Rate 2.5% │
>
> │ │ Zakat Payable \$1,375.00 │
>
> │ │ │
>
> │ │ ⚠ Estimate only. Consult a │
>
> │ │ qualified scholar. │
>
> └────────────────────────────────┴──────────────────────────────────┘
>
> ← 1.1fr/1fr grid; stacks at ≤820px
>
> ← result updates live on every input event

**§8.6 Tasbeeh Counter + Fasting Tracker**

**tools.html --- #tasbeeh-section .two-col**

> ┌───────────────────────────────────┬──────────────────────────────────┐
>
> │ LEFT: .tasbeeh-card │ RIGHT: .fast-card │
>
> │ │ │
>
> │ \[SubhanAllah\]\[Alhamdulillah\] │ Fasting Tracker 3 of 6 │
>
> │ \[Allahu Akbar\]\[La Ilaha...\] │ Shawwal 1447 │
>
> │ ← active chip: teal-700 bg │ │
>
> │ │ 1 2 3 4 5 6 7 │
>
> │ سُبْحَانَ اللَّهِ ← Amiri RTL │ 8 9 10 11 12 13 14 │
>
> │ Glory be to Allah ← font-serif │ 15 16 17\[T\]19 20 21 ← .today-fd│
>
> │ │ 22\[✓\]24 25 26 27 28 ← .fasted │
>
> │ ┌─────────────────┐ │ 29 30 │
>
> │ │ 0 │ │ │
>
> │ │ of 33 │ │ Fasted Remaining Streak │
>
> │ │ 152px circle │ │ 3 3 2 │
>
> │ └─────────────────┘ │ │
>
> │ ← teal gradient, gold ring hover │ 🌙 Suhoor: 4:28 AM │
>
> │ │ 🌅 Iftar: 8:42 PM │
>
> │ \[↺ Reset\]\[← Undo\]\[📳 Vibrate\] │ │
>
> │ │ \[✓ Mark Today as Fasted\] │
>
> │ Rounds:0 Today:0 This Week:0 │ ← .btn-primary full-width │
>
> └───────────────────────────────────┴──────────────────────────────────┘

**§8.7 Name Finder + Age Calc + Sadaqah**

**tools.html --- #name-section (left + right stack)**

> ┌────────────────────────────────────┬────────────────────────────────┐
>
> │ LEFT: .name-card │ RIGHT STACK: top card │
>
> │ │ id=age-section │
>
> │ Islamic Name Finder │ Islamic Age Calculator │
>
> │ Search 2,000+ names │ Convert birthday to Hijri │
>
> │ │ │
>
> │ \[e.g. Maryam, Ibrahim...\] \[🔍\] │ DOB: \[date input\] │
>
> │ │ Today: \[date input\] (auto) │
>
> │ Popular Names: │ │
>
> │ \[مريم\]\[إبراهيم\]\[يوسف\]\[عائشة\] │ Hijri Years \| Hijri Months │
>
> │ \[خديجة\]\[عمر\]\[زينب\]\[نوح\] │ Gregorian Yr \| Total Days │
>
> │ │ │
>
> │ ┌───────────────────────────────┐ │ Your Hijri Birthday: │
>
> │ │ إِبْرَاهِيم (Amiri, 28px RTL)│ │ أَدْخِلْ تَارِيخَ مِيلَادِكَ │
>
> │ │ Ibrahim --- Father of Nations │ │ (Enter your date of birth) │
>
> │ │ The name of a prophet... │ │ │
>
> │ │ \[Male\]\[Arabic\]\[Qur\'anic ✦\] │ │ ────────────────────────────
> │
>
> │ └───────────────────────────────┘ │ Sadaqah Tracker │
>
> │ ← slides in with 0.3s animation │ ┌──────┐ This Month: \$76 │
>
> │ │ │ 38% │ Goal: \$200 │
>
> │ │ │ ring │ This Year: \$440 │
>
> │ │ └──────┘ \[Log Sadaqah ＋\] │
>
> └────────────────────────────────────┴────────────────────────────────┘

**§8.8 CTA Section**

**tools.html --- .cta-section**

> ████████████ linear-gradient(135deg, #0A3A3D, #00696E, #062628)
> ████████
>
> ░ gold radial glow (::before, top-left) ░ teal glow (::after,
> btm-right)
>
> \[✦ Free · No Account · No Ads · Always\] ← .cta-badge gold pill
>
> All the Tools.
>
> Always Free. ← gold italic gradient text
>
> Prayer times, Qibla, Zakat, Tasbeeh, Fasting Tracker, Name Finder
>
> --- everything a Muslim needs, built with sincerity and verified
> accuracy.
>
> \[Track Your Ibadah\] \[Dua Library\] \[Verify a Hadith\]
>
> ← .btn-gold ← .btn-white-ghost ← .btn-white-ghost
>
> → habits.html → dua.html → verify.html
>
> ████████████████████████████████████████████████████████████████████████
>
> NOTE: 3 CTA buttons --- unique to tools.html (not 2 buttons like other
> pages)

**9. Design System Compliance**

All components must follow CLAUDE_v3.md v3.0 exactly. Rules below are
non-negotiable.

  -------------------------------------------------------------------------
  **Rule**           **Requirement**                 **Reference**
  ------------------ ------------------------------- ----------------------
  Card hover         translateY(-5px) scale(1.012) + CLAUDE_v3.md §27.4
                     teal glow ring                  

  NO SHIMMER         ::after sweep animations banned CLAUDE_v3.md §27.4
                     on ALL cards forever            

  Dark card hover    rgba(88,193,199,.18) --- NOT    CLAUDE_v3.md §27.4
                     light-mode teal                 

  Buttons            .btn-primary / .btn-ghost /     CLAUDE_v3.md §9
                     .btn-gold / .btn-white-ghost    
                     exact spec                      

  .btn-gold          background: var(\--gold-500)    CLAUDE_v3.md §9
  (tools-specific)   #C5A059; color: white;          
                     border-radius: 28px; padding:   
                     13px 28px; box-shadow: 0 4px    
                     20px rgba(197,160,89,.38).      
                     Hover: background #b8953f,      
                     translateY(-3px) scale(1.03),   
                     box-shadow 0 10px 36px          
                     rgba(197,160,89,.52). Used for  
                     Track Your Ibadah in CTA.       

  CTA section        Last before footer; dark teal   CLAUDE_v3.md §11
                     gradient; .reveal on children   

  Footer CSS         ft-top / ft-brand / ft-link /   CLAUDE_v3.md §7
                     ft-bot --- NOT ii-footer-\*     
                     classes                         

  Header             site-header / brand / nav /     CLAUDE_v3.md §4
                     header-tools three-zone layout  

  Reveal             IntersectionObserver threshold  CLAUDE_v3.md §12
                     0.06; .reveal-d1 through        
                     .reveal-d4                      

  Colors             All \--teal-\* and \--gold-\*   CLAUDE_v3.md §1
                     tokens; no raw hex inline       

  Arabic             font-family:                    CLAUDE_v3.md §20
                     var(\--font-arabic) (Amiri);    
                     direction: rtl                  

  Bismillah          Teal gradient (light) / gold    CLAUDE_v3.md §5
                     gradient + drop-shadow (dark)   

  Easing             var(\--ease-reverent) or        CLAUDE_v3.md §13
                     var(\--ease-premium) on all     
                     transitions                     

  Font imports       Cormorant Garamond + Inter +    CLAUDE_v3.md §2
                     Amiri --- in this exact order   

  Dark mode block    \[data-theme=\'dark\'\] is      CLAUDE_v3.md §1
                     SIBLING to :root --- never      
                     merged                          

  Tool icons         .ti-teal / .ti-gold /           Func. Doc §8.2
                     .ti-emerald icon bg themes only 

  Coming Soon card   \<div\> not \<a\>;              Func. Doc §8.2
                     cursor:default; opacity:0.75;   
                     no hover lift                   
  -------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **BANNED**                                                            |
|                                                                       |
| The No-Shimmer rule is absolute and applies to every card on          |
| IslamicInfo.org --- tool cards, category cards, result cards. No      |
| ::after sweep animation. Violation is a launch blocker.               |
+-----------------------------------------------------------------------+

**10. Interaction & Animation Spec**

  -----------------------------------------------------------------------------
  **Element**        **Duration**    **Transform**      **Glow / Shadow**
  ------------------ --------------- ------------------ -----------------------
  Tool cards         0.38s           translateY(-5px)   0 16px 40px
  (.tool-card)       ease-reverent   scale(1.012)       rgba(0,105,110,.13), 0
                                                        4px 12px
                                                        rgba(0,105,110,.08), 0
                                                        0 0 1px
                                                        rgba(0,105,110,.07)

  Tool icon (inside  0.30s           scale(1.1)         0 6px 20px
  card)              ease-reverent   rotate(-5deg)      rgba(0,105,110,.18)

  Dark mode card     0.38s           translateY(-5px)   0 16px 48px
  hover              ease-reverent   scale(1.012)       rgba(88,193,199,.18), 0
                                                        4px 16px
                                                        rgba(88,193,199,.1), 0
                                                        0 0 1px
                                                        rgba(88,193,199,.14)

  Buttons            0.28s           translateY(-3px)   0 10px 32px
  (primary/gold)     ease-premium    scale(1.03)        rgba(0,105,110,.38)

  Buttons (ghost)    0.28s           translateY(-3px)   border-color → teal-500
                     ease-premium    scale(1.03)        

  Nav links          0.25s           scale(1.05)        0 0 0 1px
                     ease-premium                       rgba(0,105,110,.12), 0
                                                        4px 12px
                                                        rgba(0,105,110,.1)

  Filter tabs        0.22s           scale(1.04)        0 4px 12px
                     ease-premium                       rgba(0,105,110,.25)

  Footer links       0.18s           translateX(4px)    border-left
                                                        rgba(88,193,199,.4)

  Prayer time slots  0.28s           translateY(-3px)   border-color →
                     ease-premium                       rgba(255,255,255,.15)

  Tasbeeh button     0.12s snap      scale(0.92) on     gold ring expands
  (active)                           press              5px→7px

  Compass needle     0.9s            rotate(Xdeg)       none
                     ease-reverent                      

  Compass dashed     22s linear      rotate(360deg)     none
  ring               infinite                           

  Qibla Detect       0.28s           translateY(-3px)   teal glow
  button             ease-premium    scale(1.03)        

  Coming Soon card   none            none --- no hover  opacity stays 0.75
                                     lift               
  -----------------------------------------------------------------------------

**3D Tilt on Tool Cards (P2)**

- On mousemove: compute cursor position relative to card centre.

- Apply rotateX (max ±5°) and rotateY (max ±7°) on top of hover lift.

- Transition 0.08s on move; 0.38s ease-reverent on mouseleave reset.

- Disable for touch devices (pointer: coarse) and
  prefers-reduced-motion.

**Reveal on Scroll**

- Add .reveal to all section headings, tool cards, calculator panels.

- IntersectionObserver at threshold: 0.06 --- lower than other pages for
  early reveal.

- Stagger: .reveal-d1 (+0.1s), .reveal-d2 (+0.2s), .reveal-d3 (+0.3s),
  .reveal-d4 (+0.4s).

- .in triggers: opacity 0→1, transform translateY(28px)→none, transition
  0.65s.

**11. Navigation & Link Audit**

All links requiring fixes before go-live (P0) or first sprint (P1).
Every href spelled out explicitly.

  ---------------------------------------------------------------------------------------------------
  **\#**   **Element**        **Location**   **Current    **Correct Target**           **Priority**
                                             State**                                   
  -------- ------------------ -------------- ------------ ---------------------------- --------------
  1        Hero \'Prayer      Hero           No scroll    scrollIntoView               P0
           Times\' CTA                                    #prayer-widget               

  2        Hero \'All Tools\' Hero           No scroll    scrollIntoView               P0
           CTA                                            #tools-section               

  3        Prayer widget ---  Widget         Unwired      getPrayerLocation() +        P0
           My Location                                    AlAdhan API                  

  4        Prayer widget ---  Widget         Unwired      getPrayerLocation()          P0
           Change btn                                                                  

  5        Prayer widget ---  Widget         Decorative   Open adhan settings dropdown P1
           Adhan btn                                                                   

  6        Prayer widget ---  Widget         Decorative   Open calculation method      P1
           Method btn                                     selector                     

  7        Tool tab: Prayer & Tool grid      JS unwired   filterTools(\'prayer\', btn) P0
           Worship                                                                     

  8        Tool tab: Finance  Tool grid      JS unwired   filterTools(\'finance\',     P0
           & Fiqh                                         btn)                         

  9        Tool tab: Trackers Tool grid      JS unwired   filterTools(\'tracker\',     P0
                                                          btn)                         

  10       Tool tab:          Tool grid      JS unwired   filterTools(\'discovery\',   P0
           Discovery                                      btn)                         

  11       Card: Prayer Times Tool grid      Check href   #prayer-widget (smooth       P0
                                                          scroll)                      

  12       Card: Qibla        Tool grid      Check href   #qibla-section (smooth       P0
           Compass                                        scroll)                      

  13       Card: Hijri        Tool grid      Check href   #qibla-section (smooth       P0
           Calendar                                       scroll)                      

  14       Card: Tasbeeh      Tool grid      Check href   #tasbeeh-section (smooth     P0
           Counter                                        scroll)                      

  15       Card: Fasting      Tool grid      Check href   #tasbeeh-section (smooth     P0
           Tracker                                        scroll)                      

  16       Card: Zakat        Tool grid      Check href   #zakat-section (smooth       P0
           Calculator                                     scroll)                      

  17       Card: Inheritance  Tool grid      Check href   inheritance.html             P0
           Calculator                                                                  

  18       Card: Sadaqah      Tool grid      Check href   #name-section (smooth        P0
           Tracker                                        scroll)                      

  19       Card: Name Finder  Tool grid      Check href   #name-section (smooth        P0
                                                          scroll)                      

  20       Card: Age          Tool grid      Check href   #age-section (smooth scroll) P0
           Calculator                                                                  

  21       Card: Mosque       Tool grid      Check href   https://mosquefinder.net     P0
           Finder                                         (target=\_blank)             

  22       Qibla Detect       Qibla card     Unwired      getQibla() + geolocation     P0
           button                                                                      

  23       Hijri prev month   Hijri card     Unwired      Decrement month, re-render   P0
           btn                                            grid                         

  24       Hijri next month   Hijri card     Unwired      Increment month, re-render   P0
           btn                                            grid                         

  25       Zakat oninput      Zakat form     Check wiring calcZakat() on every input   P0
           handlers                                                                    

  26       Zakat calculate    Zakat form     Check href   calcZakat()                  P0
           button                                                                      

  27       Tasbeeh counter    Tasbeeh        Unwired      incrementTasbeeh()           P0
           button                                                                      

  28       Tasbeeh Reset      Tasbeeh        Unwired      resetTasbeeh()               P0
           button                                                                      

  29       Tasbeeh Undo       Tasbeeh        Unwired      undoTasbeeh()                P0
           button                                                                      

  30       Tasbeeh Vibrate    Tasbeeh        Unwired      toggleVibrate()              P0
           button                                                                      

  31       Tasbeeh dhikr      Tasbeeh        Check        setDhikr(btn, ar, en, goal)  P0
           chips (x4)                                                                  

  32       Fasting day cells  Fasting grid   Unwired      toggle .fasted,              P0
           (x30)                                          updateFastStats()            

  33       Fasting Mark Today Fasting        Unwired      toggleFastToday()            P0
           btn                                                                         

  34       Name search button Name finder    Check        searchName()                 P0

  35       Name Enter         Name finder    Check        searchName() on Enter        P0
           keypress                                                                    

  36       Name suggestion    Name finder    Check        quickName(\'\[key\]\')       P0
           chips (x8)                                                                  

  37       Age DOB input      Age calc       Check        calcAge() on onchange        P0

  38       Age today input    Age calc       Check        calcAge(); auto-set on load  P0

  39       Sadaqah Log button Sadaqah        Partial      Confirmation text,           P1
                                                          localStorage                 

  40       AI Verifier card   Tool grid      No tooltip   Show \'Coming 2026\' modal   P0
           click                                                                       

  41       CTA: Track Your    CTA            Check href   habits.html                  P0
           Ibadah                                                                      

  42       CTA: Dua Library   CTA            Check href   dua.html                     P0

  43       CTA: Verify a      CTA            Check href   verify.html                  P0
           Hadith                                                                      

  44       Footer IS link     Footer         Check href   islamic-studies.html (never  P0
                                                          learn.html)                  

  45       Footer Prayer      Footer Tools   Check href   tools.html#prayer-widget     P0
           Times                                                                       

  46       Footer Qibla       Footer Tools   Check href   tools.html#qibla-section     P0
           Compass                                                                     

  47       Footer Zakat Calc  Footer Tools   Check href   tools.html#zakat-section     P0

  48       Footer Hijri       Footer Tools   Check href   tools.html#qibla-section     P0
           Calendar                                                                    

  49       Footer Inheritance Footer Tools   Check href   inheritance.html             P0
           Calc                                                                        
  ---------------------------------------------------------------------------------------------------

**P0 actions to complete before launch: 47 \| P1 in first sprint: 2**

*Note: Items 3 and 4 both resolve to getPrayerLocation() --- they are
distinct UI entry points (My Location button vs Change button) for the
same underlying function. Both must be wired.*

**12. Tool Data Model**

The data model defines the fields required to render and operate each
tool card and its associated functional section.

**12.1 Tool Card Object**

  -------------------------------------------------------------------------------------
  **Field**       **Type**     **Example**                  **Notes**
  --------------- ------------ ---------------------------- ---------------------------
  id              string       prayer-times                 Stable unique ID. Used for
                  (slug)                                    GA4 events and localStorage
                                                            keys.

  title           string       Prayer Times                 Displayed in .tool-title.

  description     string       Accurate salah times\...     13.5px body text in
                                                            .tool-desc.

  status          enum         live \| new \| beta \|       Determines badge class and
                               coming-soon                  card element type (\<a\> vs
                                                            \<div\>).

  icon_theme      enum         ti-teal \| ti-gold \|        CSS class for .tool-icon
                               ti-emerald                   background.

  icon_svg        string (SVG) \<svg\>\...\</svg\>          SVG string for the tool
                                                            icon.

  categories      string\[\]   \[\'prayer\',\'tracker\'\]   Each value maps to a
                                                            .tool-tab data-cat.

  tags            string\[\]   \[\'Auto-detect\',\'195+     2-3 keyword pills in
                               Cities\'\]                   .tool-tags.

  href            string       #prayer-widget               Target anchor or URL.
                                                            Absent for coming-soon.

  href_external   boolean      true                         If true: target=\_blank,
                                                            rel=noopener, arrow in link
                                                            text.

  cta_label       string       Open Tool                    Text of .tool-link CTA.
  -------------------------------------------------------------------------------------

**12.2 Prayer Times Data Structure**

  -----------------------------------------------------------------------------
  **Field**   **Type**     **Source**      **Notes**
  ----------- ------------ --------------- ------------------------------------
  city        string       Geolocation API Displayed in .pw-loc-row.
                           / user input    

  date        Date object  new Date()      Formatted via toLocaleDateString().

  prayers     object\[\]   AlAdhan API     Array of {name, time, status:
                                           \'past\'\|\'next\'\|\'upcoming\'}.

  sunrise     string       AlAdhan API     Time string e.g. \'5:52 AM\'.

  sunset      string       AlAdhan API     Time string e.g. \'8:56 PM\'.

  daylight    string       computed        Duration string e.g. \'14h 4m\'.

  method      string       User setting    Calculation method ID (e.g.
                                           \'ISNA\', \'Hanafi\').
  -----------------------------------------------------------------------------

**12.3 Qibla Data**

  ------------------------------------------------------------------------------------
  **Field**       **Type**   **Source**              **Notes**
  --------------- ---------- ----------------------- ---------------------------------
  lat             number     navigator.geolocation   User latitude.

  lng             number     navigator.geolocation   User longitude.

  qibla_bearing   number     Haversine formula       Degrees from North. Mecca:
                                                     21.4225, 39.8262.

  distance_km     number     Haversine formula       Great-circle distance to Mecca.

  bearing_label   string     computed                e.g. \'54° NE\'.

  city            string     Reverse geocode or user Displayed in #qCity.
                             label                   
  ------------------------------------------------------------------------------------

**12.4 Zakat Calculation Inputs**

  ------------------------------------------------------------------------
  **Input    **Label**           **Formula Role**   **Validation**
  ID**                                              
  ---------- ------------------- ------------------ ----------------------
  zkCash     Cash & Bank Savings \+ to total        ≥ 0, numbers only

  zkGold     Gold & Silver Value \+ to total        ≥ 0

  zkBiz      Business Assets /   \+ to total        ≥ 0
             Inventory                              

  zkInv      Investments         \+ to total        ≥ 0
             (Stocks, Funds)                        

  zkDebt     Outstanding Debts   --- from total     ≥ 0
                                 (subtracted)       
  ------------------------------------------------------------------------

**Formula: total = cash + gold + biz + investments - debts. zakat =
total \>= nisab ? total \* 0.025 : 0.**

**12.5 Zakat Result Output Schema**

calcZakat() must update these DOM elements and return this result object
for unit testing:

  --------------------------------------------------------------------------------
  **Output ID**   **DOM Element**  **Value Type**     **Example**
  --------------- ---------------- ------------------ ----------------------------
  zkResult        #zkResult        Formatted currency \$1,375.00
                                   string             

  zkTotal         #zkTotal         Formatted currency \$55,000.00
                                   string             

  zkPayable       #zkPayable       Formatted currency \$1,375.00
                                   string (bold teal) 

  zkResultLabel   #zkResultLabel   Status string      Based on 2.5% of zakatable
                                                      wealth

  Return value    function return  { total, nisab,    { total:55000, nisab:6180,
                                   zakat, aboveNisab  zakat:1375, aboveNisab:true
                                   }                  }
  --------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **RULE**                                                              |
|                                                                       |
| calcZakat() must never produce a negative result. If debts \>         |
| (cash+gold+biz+investments), clamp total to 0 before applying the     |
| nisab check. Never display negative Zakat.                            |
+-----------------------------------------------------------------------+

**12.5 LocalStorage Keys**

  ----------------------------------------------------------------------------------------
  **Key**                     **Type**                **Purpose**
  --------------------------- ----------------------- ------------------------------------
  islamicinfo-theme           string                  Theme preference --- shared across
                              (\'light\'\|\'dark\')   all pages

  islamicinfo-prayer-city     string                  Last used city for prayer times

  islamicinfo-prayer-method   string                  Last used calculation method

  islamicinfo-qibla-city      string                  Last used city for Qibla

  tasbeeh-session-{date}      JSON                    Daily tasbeeh totals by dhikr type

  tasbeeh-week                JSON                    Weekly totals for #tsWeek display

  fasting-{month-year}        JSON                    Array of fasted day numbers for
                                                      month

  sadaqah-ledger              JSON                    Array of {date, amount, cause}
                                                      entries

  sadaqah-goal                number                  Monthly sadaqah goal amount
  ----------------------------------------------------------------------------------------

**13. Sprint Planning Summary**

Based on Feature Matrix (§4) and Link Audit (§11), work is divided into
three sprints.

**Sprint 0 --- Launch Blockers (P0) · Est. 7--9 engineering days**

  ----------------------------------------------------------------------
  **\#**   **Work Item**                       **Type**         **Est.
                                                                Days**
  -------- ----------------------------------- ---------------- --------
  S0-01    Wire hero CTAs: Prayer Times →      JS               0.25
           #prayer-widget; All Tools →                          
           #tools-section                                       

  S0-02    Wire all 5 tool category filter     JS               0.5
           tabs (filterTools function)                          

  S0-03    Verify all 12 tool card hrefs are   HTML             0.5
           correct (see §11 items 11-21)                        

  S0-04    Wire geolocation for prayer times:  JS+API           1.5
           getPrayerLocation() + AlAdhan API                    

  S0-05    Wire getQibla(): geolocation +      JS               1.0
           Haversine + needle rotation                          

  S0-06    Wire Hijri calendar prev/next       JS               0.75
           navigation (re-render grid on month                  
           change)                                              

  S0-07    Wire Zakat: calcZakat() on all      JS               0.5
           inputs + button + result display                     

  S0-08    Wire Tasbeeh: incrementTasbeeh,     JS               1.0
           resetTasbeeh, undoTasbeeh,                           
           toggleVibrate, dhikr chips                           

  S0-09    Wire Fasting: buildFastGrid, cell   JS               0.75
           toggles, updateFastStats,                            
           toggleFastToday                                      

  S0-10    Wire Name Finder: searchName,       JS               0.5
           showName, quickName chips, Enter                     
           keypress                                             

  S0-11    Wire Age Calculator: calcAge on DOB JS               0.5
           change + auto-set today date on                      
           load                                                 

  S0-12    AI Verifier card: show Coming 2026  JS               0.25
           modal/tooltip on click                               

  S0-13    Verify all footer hrefs (IS link,   HTML             0.25
           CTA buttons, Tools column                            
           deep-links)                                          

  S0-14    QA all 9 responsive breakpoints     QA               1.0

  S0-15    DECISION GATE: Resolve OQ-05 ---    PM/Engineering   0
           inheritance.html in Sprint 0 or                      
           deferred? If deferred, downgrade                     
           Inheritance Calculator card status                   
           from Live to Beta.                                   
  ----------------------------------------------------------------------

**Sprint 1 --- Post-Launch High Priority (P1) · Est. 4--5 engineering
days**

  ----------------------------------------------------------------
  **\#**   **Work Item**                       **Type**   **Est.
                                                          Days**
  -------- ----------------------------------- ---------- --------
  S1-01    Adhan settings dropdown: open/close JS+HTML    1.0
           from Adhan button in prayer widget             

  S1-02    Prayer calculation method selector: JS+HTML    0.75
           dropdown with Hanafi, ISNA, MWL,               
           etc.                                           

  S1-03    Live nisab from gold price API:     JS+API     0.5
           fetch on load, update nisab display            

  S1-04    Tasbeeh/Fasting weekly stats from   JS         0.75
           localStorage: persist and read on              
           load                                           

  S1-05    Sadaqah log form: amount + cause    JS+HTML    0.75
           input, save to localStorage ledger             

  S1-06    Stats count-up animation on scroll  JS         0.25
           entry for stats strip                          
  ----------------------------------------------------------------

**Sprint 2+ --- Medium/Future Priority**

  -----------------------------------------------------------------------------
  **Priority**   **Work Item**                     **Notes**
  -------------- --------------------------------- ----------------------------
  P2             3D tilt on tool cards             Disable for touch +
                                                   prefers-reduced-motion

  P2             Adhan browser audio alerts        Requires Notification API +
                                                   audio files CDN

  P2             inheritance.html dedicated page   Full faraidh calculator with
                                                   PDF export

  P3             AI Claim Verifier (full feature)  Depends on AI backend per
                                                   verify.html

  P3             User saved tools quick-access     /saved page; depends on auth
                                                   system

  P3             Multilingual prayer times         Arabic, Urdu ---
                                                   infrastructure only
  -----------------------------------------------------------------------------

**14. QA & Testing Checklist**

Run before each sprint release. Check in both light and dark mode unless
noted.

**14.1 Global Structure**

  ---------------------------------------------------------------------------
  **Check**   **Item**                                        **L**   **D**
  ----------- ----------------------------------------------- ------- -------
  \[ \]       \<html lang=\'en\' data-theme=\'light\'\>       --      --
              opening tag                                             

  \[ \]       Fonts: Cormorant Garamond + Inter + Amiri       --      --
              preconnected and imported in order                      

  \[ \]       :root has all 50+ CSS variable tokens per       --      --
              CLAUDE_v3.md §1                                         

  \[ \]       \[data-theme=\'dark\'\] sibling block present   --      --
              and unmerged                                            

  \[ \]       Body: Islamic geometric background-image at     \[ \]   \[ \]
              opacity 0.04                                            

  \[ \]       .ambient radial glow div is first child of      \[ \]   \[ \]
              \<body\>                                                
  ---------------------------------------------------------------------------

**14.2 Header, Mobile Menu & Hero**

  ---------------------------------------------------------------------------
  **Check**   **Item**                                        **L**   **D**
  ----------- ----------------------------------------------- ------- -------
  \[ \]       All 10 nav items in exact order; Tools =        \[ \]   \[ \]
              .nav-link.active                                        

  \[ \]       islamic-studies.html used --- never learn.html  \[ \]   --

  \[ \]       knowledge-hub.html at position 5 --- never      \[ \]   --
              omitted                                                 

  \[ \]       Mobile menu: all 10 links, Tools active,        \[ \]   \[ \]
              opens/closes correctly                                  

  \[ \]       Bismillah teal gradient (light) / gold +        \[ \]   \[ \]
              drop-shadow (dark)                                      

  \[ \]       Arabic verse (Qur\'an 2:238) visible, RTL, 60%  \[ \]   \[ \]
              opacity                                                 

  \[ \]       Hero \'Prayer Times\' → smooth scrolls to       \[ \]   --
              #prayer-widget                                          

  \[ \]       Hero \'All Tools\' → smooth scrolls to          \[ \]   --
              #tools-section                                          

  \[ \]       3 floating .geo decorators with geoRot          \[ \]   \[ \]
              animation                                               
  ---------------------------------------------------------------------------

**14.3 Stats Strip & Prayer Widget**

  ---------------------------------------------------------------------------
  **Check**   **Item**                                        **L**   **D**
  ----------- ----------------------------------------------- ------- -------
  \[ \]       Stats strip: 4 cells (12+ · 5 · 195+ · 100%)    \[ \]   \[ \]
              embedded in hero                                        

  \[ \]       Prayer widget: 6 prayer slots visible, dates    \[ \]   \[ \]
              and times populate                                      

  \[ \]       Asr slot (or current next prayer) has .next     \[ \]   \[ \]
              class + breathGold animation                            

  \[ \]       Past slots have .past class at opacity 0.44     \[ \]   --

  \[ \]       Next prayer badge shows animated gold dot +     \[ \]   \[ \]
              prayer name + time                                      

  \[ \]       My Location button calls getPrayerLocation()    \[ \]   --

  \[ \]       Sun data strip (sunrise, sunset, daylight)      \[ \]   \[ \]
              present                                                 

  \[ \]       At ≤600px: prayer grid switches from 6-col to   \[ \]   --
              3-col                                                   
  ---------------------------------------------------------------------------

**14.4 Tool Grid**

  ---------------------------------------------------------------------------
  **Check**   **Item**                                        **L**   **D**
  ----------- ----------------------------------------------- ------- -------
  \[ \]       All 12 tool cards present in correct order      \[ \]   \[ \]

  \[ \]       Each live/new/beta card is \<a\> with correct   \[ \]   --
              href                                                    

  \[ \]       Mosque Finder: target=\_blank rel=noopener on   \[ \]   --
              mosquefinder.net                                        

  \[ \]       Coming Soon card is \<div\>; cursor:default;    \[ \]   \[ \]
              opacity:0.75                                            

  \[ \]       All 5 tabs filter correctly; filterTools()      \[ \]   --
              wired                                                   

  \[ \]       Card hover: translateY(-5px) scale(1.012) +     \[ \]   \[ \]
              teal glow --- NO shimmer                                

  \[ \]       Tool icon scale(1.1) rotate(-5deg) on card      \[ \]   \[ \]
              hover                                                   

  \[ \]       Dark mode card hover uses rgba(88,193,199,.18)  --      \[ \]
              glow                                                    
  ---------------------------------------------------------------------------

**14.5 Tools Functionality**

  ---------------------------------------------------------------------------------
  **Check**   **Item**                                        **Pass**   **Fail**
  ----------- ----------------------------------------------- ---------- ----------
  \[ \]       Qibla: needle rotates to correct bearing after  \[ \]      \[ \]
              geolocation                                                

  \[ \]       Qibla: #qDeg, #qDist, #qBearing all update      \[ \]      \[ \]

  \[ \]       Hijri calendar: prev/next buttons change        \[ \]      \[ \]
              displayed month                                            

  \[ \]       Hijri calendar: .today class on current Hijri   \[ \]      \[ \]
              date cell                                                  

  \[ \]       Zakat: result updates on every input event;     \[ \]      \[ \]
              below-nisab message correct                                

  \[ \]       Zakat: disclaimer note present                  \[ \]      \[ \]

  \[ \]       Tasbeeh: dhikr chips switch Arabic text and     \[ \]      \[ \]
              goal                                                       

  \[ \]       Tasbeeh: count increments; resets at goal;      \[ \]      \[ \]
              rounds++                                                   

  \[ \]       Tasbeeh: reset, undo, vibrate all work          \[ \]      \[ \]

  \[ \]       Fasting: day cells toggle .fasted; stats update \[ \]      \[ \]

  \[ \]       Fasting: Mark Today button changes label;       \[ \]      \[ \]
              reverts on second click                                    

  \[ \]       Name Finder: searchName returns result; chips   \[ \]      \[ \]
              work                                                       

  \[ \]       Age Calc: calcAge() returns Hijri years,        \[ \]      \[ \]
              months, days, birthday                                     

  \[ \]       Sadaqah: Log button shows confirmation for 2s   \[ \]      \[ \]
  ---------------------------------------------------------------------------------

**14.6 Responsive Breakpoints**

  ---------------------------------------------------------------------------------
  **Breakpoint**   **Expected Behaviour**                     **Pass**   **Fail**
  ---------------- ------------------------------------------ ---------- ----------
  1100px           Footer 3-column; nav font 11.5px           \[ \]      \[ \]

  900px            Nav font 10.5px; brand 16px; brand-mark    \[ \]      \[ \]
                   28px                                                  

  820px            Two-column layouts stack to 1-col; Zakat   \[ \]      \[ \]
                   stacks                                                

  760px            Nav hidden; hamburger shown; only          \[ \]      \[ \]
                   theme+search+hamburger                                

  700px            Stats strip 2×2; footer 2-column           \[ \]      \[ \]

  600px            Prayer grid 6-col → 3-col                  \[ \]      \[ \]

  560px            Stats strip wraps 2×2                      \[ \]      \[ \]

  460px            Age inputs stack to single column          \[ \]      \[ \]

  440px            Footer 1-column                            \[ \]      \[ \]

  320px            No horizontal scroll; tasbeeh button       \[ \]      \[ \]
                   usable; prayer widget readable                        
  ---------------------------------------------------------------------------------

**15. Out of Scope**

Explicitly excluded. Must not be built without a separate approved
specification:

- User accounts, login, or registration --- all state is
  localStorage-only in v1.

- Fatwa issuance or religious verdicts in any tool output or
  description.

- Advertising, sponsored content, or paid placement of any kind.

- Real-time cryptocurrency zakat calculations --- gold/silver only in
  v1.

- Mosque Finder embedded map on tools.html --- external link to
  mosquefinder.net only.

- Adhan audio alerts (P2 --- backend + Notification API --- separate
  spec required).

- inheritance.html page body --- referenced by tool card but built
  separately.

- AI Claim Verifier functionality --- placeholder card only until
  backend is ready.

- Push notifications or service workers.

- Multilingual content in v1 --- infrastructure may be prepared but no
  translations in scope.

- Progress locking or lesson sequences --- those belong to
  islamic-studies.html.

**16. Open Questions**

  -------------------------------------------------------------------------------------------------------
  **\#**   **Question**                        **Owner**             **Due**    **Status**
  -------- ----------------------------------- --------------------- ---------- -------------------------
  OQ-01    Which AlAdhan API endpoint is used  Engineering           Before P0  Open
           for prayer times? timingsByCity or                                   
           timingsByAddress? What is the API                                    
           key strategy?                                                        

  OQ-02    Is the live nisab gold price        Engineering/Product   Before P1  Open
           fetched from a third-party API                                       
           (e.g. metals-api.com) or manually                                    
           updated periodically?                                                

  OQ-03    Does the Hijri calendar use a JS    Engineering           Before P0  Open
           library (e.g. HijriCalendar.js) or                                   
           a server-side conversion endpoint?                                   

  OQ-04    Should Tasbeeh/Fasting weekly stats Product               Before P1  Open
           be keyed by ISO week or by rolling                                   
           7 days?                                                              

  OQ-05    When is inheritance.html targeted   Product/Engineering   Before P0  Open
           for completion? Is it in Sprint 0                                    
           scope or a separate sprint?                                          

  OQ-06    Should the Sadaqah tracker log form Product               Before P1  Open
           ask for currency amount only, or                                     
           also cause/charity name?                                             

  OQ-07    Is the AI Claim Verifier waitlist   Engineering           Before P1  Open
           email collected via an email                                         
           provider (Mailchimp/Brevo) or                                        
           simply logged to a database?                                         

  OQ-08    Should the Mosque Finder card open  Product               Before P0  Open
           in a new tab (current spec) or                                       
           attempt an in-page iframe on                                         
           desktop?                                                             

  OQ-09    Should the 3D tilt effect on tool   Design                Before P2  CLOSED --- Yes by
           cards (P2) respect                                                   default. US-016 AC
           prefers-reduced-motion and be                                        explicitly states:
           disabled on touch devices?                                           Disable for touch devices
                                                                                (pointer: coarse) and
                                                                                prefers-reduced-motion.
                                                                                WCAG 2.1 SC 2.3.3 (Level
                                                                                AAA) also requires this.
                                                                                No further discussion
                                                                                needed.
  -------------------------------------------------------------------------------------------------------

**17. Error & Edge Case Catalogue**

Every tool that depends on external data, user input, or browser APIs
must handle these failure states. No blank states, no unhandled
exceptions visible to users.

**17.1 Geolocation Errors (Prayer Widget + Qibla)**

  ----------------------------------------------------------------------------------
  **Error**     **Condition**          **User-Facing       **Fallback Behaviour**
                                       Message**           
  ------------- ---------------------- ------------------- -------------------------
  Permission    User clicks \'Block\'  Inline: \'Location  Show manual city input
  denied        on browser prompt      access denied ---   field below widget
                                       enter city          
                                       manually.\'         

  Position      GPS hardware           Inline: \'Could not Show manual city input
  unavailable   unavailable or timeout detect location.    
                                       Try again or enter  
                                       city manually.\'    

  Timeout       getCurrentPosition()   Inline: \'Location  Show manual city input
                exceeds 10s            timed out. Check    with retry button
                                       your connection.\'  

  HTTPS         Page served over HTTP  Inline: \'Location  Show manual city input;
  required      (dev environment)      requires HTTPS.\'   note in dev environments

  API failure   AlAdhan API returns    Inline: \'Prayer    Show last cached times if
                non-200                times unavailable   available; else show
                                       right now. Try      dashes
                                       refreshing.\'       

  Network       navigator.onLine =     Inline: \'No        Show localStorage cached
  offline       false on request       internet            times from
                                       connection. Showing islamicinfo-prayer-city
                                       last known times.\' 
  ----------------------------------------------------------------------------------

**17.2 Zakat Calculator Edge Cases**

  -----------------------------------------------------------------------
  **Input Scenario**       **Expected Behaviour**
  ------------------------ ----------------------------------------------
  All inputs empty or zero zkResult = \$0.00; label = \'Enter your wealth
                           details above\'

  Debts \> total assets    Clamp total to 0; show \$0.00; label = \'Net
  (negative net)           assets below zero --- no Zakat due\'

  Total below nisab        zakat = 0; label = \'Wealth below nisab --- no
  (\$6,180)                Zakat due\'

  Non-numeric input typed  Input validation: reject non-numeric on
                           oninput; show border-red + \'Numbers only\'

  Negative value entered   Reject; show \'Enter a positive amount\'

  Very large value (e.g.   Calculate correctly; format with commas
  \$1 billion)             (\$1,375,000.00); no overflow
  -----------------------------------------------------------------------

**17.3 Tasbeeh Counter Edge Cases**

  -----------------------------------------------------------------------
  **Scenario**          **Expected Behaviour**
  --------------------- -------------------------------------------------
  Undo at count 0       undoTasbeeh() does nothing; no negative count; no
                        visual change

  Vibrate API not       navigator.vibrate is undefined; silently skip
  supported             vibration; Vibrate button shows \'Vibrate (not
                        supported)\'

  Rapid tapping (\>5    All taps registered accurately; no missed
  taps/sec)             increments; animation may drop frames but count
                        is correct

  Page refresh          In v1: count resets to 0 (no persistence). In P1:
  mid-session           reads from localStorage key
                        tasbeeh-session-{date}

  Goal set to 0 or      Default to 33; never divide by zero in round
  undefined             calculation
  -----------------------------------------------------------------------

**17.4 Name Finder Edge Cases**

  -----------------------------------------------------------------------
  **Input Scenario**    **Expected Behaviour**
  --------------------- -------------------------------------------------
  Empty search          searchName() returns early; #nameResult hidden;
  submitted             no error shown

  Name not in local     #nameResult hides; show inline: \'Name not found.
  dict                  Try a common spelling (e.g. Maryam, Ibrahim).\'

  Numbers or symbols    Strip non-alpha before lookup; \'Ibr4him\' →
  entered               \'ibrahim\' → found

  Very long input (\>50 Strip to first 50 characters; proceed with lookup
  chars)                

  Arabic text typed in  In v1: not supported (Latin only); show: \'Search
  search                in English (e.g. Maryam)\'. In production: Arabic
                        search supported via API.
  -----------------------------------------------------------------------

**17.5 Age Calculator Edge Cases**

  -----------------------------------------------------------------------
  **Scenario**          **Expected Behaviour**
  --------------------- -------------------------------------------------
  DOB in the future     calcAge() shows 0 for all fields; label \'Date of
                        birth must be in the past\'

  DOB = Today           All results = 0; Hijri birthday = today\'s Hijri
                        date

  Very old date         Calculate correctly; note approximate flag
  (pre-1900)            applies more strongly

  Today field cleared   Use new Date() as fallback; never crash on null
                        today

  Invalid date format   Browser date input rejects invalid dates
                        natively; calcAge() only fires on valid onchange
  -----------------------------------------------------------------------

**17.6 Fasting Tracker Edge Cases**

  -----------------------------------------------------------------------
  **Scenario**          **Expected Behaviour**
  --------------------- -------------------------------------------------
  All 30 days marked as fsFasted = 30; fsLeft = max(0, target - 30); no
  fasted                overflow in UI

  Clicking fasted day   Toggle removes .fasted; updateFastStats()
  again (unfasting)     recalculates; streak may break

  Streak breaks (gap in fsStreak resets to consecutive-from-today count;
  fasted days)          no negative streak

  Mark Today on a day   toggleFastToday() removes .fasted; label reverts;
  already marked        stats decrement

  Suhoor/Iftar data     Show placeholder dashes \'---\' rather than
  unavailable           blank; no error state
  -----------------------------------------------------------------------

**17.7 Sadaqah Tracker Edge Cases**

  -----------------------------------------------------------------------
  **Scenario**          **Expected Behaviour**
  --------------------- -------------------------------------------------
  Monthly goal = \$0 or Ring shows 0%; use \$200 default; never divide by
  not set               zero in ring %

  Log Sadaqah clicked   Debounce at 2s: button disabled during
  multiple times        confirmation timeout; prevent double-logging
  quickly               

  Year total overflows  Display as number (\$2,440); ring only shows
  ring display          monthly %

  LocalStorage write    Silently log to console; show logged amount but
  fails                 note \'Save failed --- data may not persist\'
  -----------------------------------------------------------------------

**18. Fiqh & Content Standards**

These standards govern what makes a tool \'fiqh-verified\' and how
Islamic scholarly standards are applied across all tools. Every tool
description, disclaimer, and calculated output must comply.

**18.1 What \'Fiqh-Verified\' Means on This Page**

  ------------------------------------------------------------------------
  **Tool**        **Fiqh Standard Applied** **Scholarly Basis**
  --------------- ------------------------- ------------------------------
  Zakat           2.5% on zakatable wealth  Based on: Fiqh al-Zakat by Dr.
  Calculator      above nisab (85g gold).   Yusuf al-Qaradawi; endorsed by
                  Hanafi methodology        AAOIFI standards
                  (stricter nisab           
                  threshold). Does NOT      
                  include property used for 
                  personal residence.       

  Zakat --- Nisab 85g gold equivalent in    Majority contemporary
                  local currency (not       scholarly position for modern
                  silver nisab, which is    assets
                  lower). This is the more  
                  conservative Hanafi       
                  position.                 

  Inheritance     Islamic faraidh law per   Qur\'an 4:11-12, 4:176;
  Calculator      Qur\'an 4:11-12, 4:176.   Al-Fiqh ala al-Madhahib
                  Supports all 8 asabah     al-Arbaa
                  heir types. Does not      
                  handle dhawil arham       
                  (extended family) in v1.  

  Prayer Times    Calculation follows       AlAdhan API implements
                  user-selected method      standard methods from ISNA,
                  (Hanafi, ISNA, MWL,       MWL, Egypt, etc.
                  etc.). Fajr and Isha      
                  angles differ by method.  
                  Default: ISNA for North   
                  America, MWL for          
                  Europe/Asia.              

  Fasting Tracker Shawwal 6 fasts: Sunnah   Hadith references cited per
                  confirmed in Muslim 1164. tool context
                  Ramadan: obligatory       
                  (Qur\'an 2:183). Mon/Thu: 
                  Sunnah in Abu Dawud 2436. 
  ------------------------------------------------------------------------

**18.2 Mandatory Disclaimer Rules**

+-----------------------------------------------------------------------+
| **BANNED**                                                            |
|                                                                       |
| Every financial tool (Zakat, Inheritance) MUST display a disclaimer.  |
| The disclaimer is hardcoded in the template --- never generated by AI |
| or removed by a developer. Removing the disclaimer is a P0 blocking   |
| issue.                                                                |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------
  **Tool**           **Required Disclaimer Text**
  ------------------ ----------------------------------------------------
  Zakat Calculator   \'This provides an estimate. Zakat is a personal
                     obligation --- consult a qualified scholar for your
                     situation. Calculations follow Hanafi methodology.\'

  Inheritance        \'This calculator provides an indicative
  Calculator         distribution under Islamic faraidh law. Estate
                     planning involves complex personal and legal
                     factors. Consult a qualified Islamic scholar and
                     legal advisor before making distribution
                     decisions.\'

  Prayer Times       \'Prayer times are calculated estimates. For
                     confirmation in your local community, consult your
                     local mosque or Islamic organization.\'

  AI Claim Verifier  \'This explanation is AI-assisted. For religious
  (future)           rulings, always consult a qualified scholar.\'
  -----------------------------------------------------------------------

**18.3 Scholar Citation Standards for Tool Descriptions**

- Every tool that references Islamic practice must cite at least one
  recognized classical source in its tool card description or help text.

- Anonymous internet sources are not acceptable citations. Sources must
  be named scholars or recognized collections.

- Where scholarly disagreement (ikhtilaf) exists (e.g. nisab calculation
  method), the tool must acknowledge this and explain which position was
  chosen and why.

- No fatwa issuance --- tools calculate and present; they never issue
  rulings. The phrase \'IslamicInfo says this is permissible/forbidden\'
  must never appear.

**18.4 Acceptable and Unacceptable Tool Outputs**

  -----------------------------------------------------------------------
  **Acceptable**                      **Unacceptable**
  ----------------------------------- -----------------------------------
  \'Your Zakat estimate is \$1,375.00 \'You must pay \$1,375.00 in
  (Hanafi methodology)\'              Zakat\'

  \'Calculation is an estimate ---    Removing the disclaimer or making
  consult a scholar\'                 it dismissible

  \'Based on 85g gold nisab (AAOIFI   \'This is the only correct nisab
  standard)\'                         calculation\'

  Presenting multiple scholarly       Declaring one position correct and
  positions on moon sighting          others wrong

  \'Prayer times may vary ±2          Presenting computed prayer times as
  minutes\'                           definitively exact
  -----------------------------------------------------------------------

**19. Complete Tool Tag List**

Each tool card shows 2-3 keyword pills (.tool-tag) from this canonical
list. Tags are frozen --- do not change without updating the tool card
HTML.

  ------------------------------------------------------------------------
  **Tool**              **Tag 1**      **Tag 2**      **Tag 3**
  --------------------- -------------- -------------- --------------------
  Prayer Times          Auto-detect    195+ Cities    All Methods

  Qibla Compass         GPS            Distance to    Animated
                                       Mecca          

  Hijri Calendar        1447 AH        Auto-sync      Islamic Events

  Tasbeeh Counter       Dhikr          Session Stats  Vibration

  Fasting Tracker       Ramadan        Voluntary      Streaks
                                       Fasts          

  Zakat Calculator      Live Nisab     Gold & Silver  Fiqh-verified

  Inheritance           Faraid Law     All 8 Heirs    PDF Report
  Calculator                                          

  Sadaqah Tracker       Monthly Goal   Annual Impact  Ramadan Prompts

  Islamic Name Finder   2,000+ Names   Arabic Script  Qur\'anic Refs

  Islamic Age           Gregorian to   Exact Days     Hijri Birthday
  Calculator            Hijri                         

  Mosque Finder         GPS            Maps           Jumu\'ah Times
                                       Integration    

  AI Claim Verifier     AI-Powered     61K+ Hadith    Scholar Grading
  (future)                                            
  ------------------------------------------------------------------------

**19.1 Tag Rendering Rules**

- Each tag renders as a .tool-tag pill: font-size 10px, uppercase,
  letter-spaced, teal-tinted background, teal border, teal-700 text.

- Maximum 3 tags per card --- never add a 4th without removing one.

- Tags for Coming Soon tools render at 50% opacity (opacity: 0.5 on
  .tool-tag within .ts-soon cards).

- Tags are not clickable in v1 --- they are informational only. In a
  future version, clicking a tag may filter the grid.

**20. API Integration Specs**

Specifications for every external API call required by the Tools page.
All API calls must be made server-side or proxied --- never expose API
keys in client-side code.

**20.1 Prayer Times --- AlAdhan API**

  -----------------------------------------------------------------------
  **Field**             **Value**
  --------------------- -------------------------------------------------
  Endpoint              https://api.aladhan.com/v1/timingsByCity

  Method                GET

  Required params       city={city}&country={country}&method={methodId}

  Optional params       school=1 (Hanafi Asr time); tune={offsets} for
                        manual correction

  Method IDs            2=ISNA (North America), 3=MWL (Europe/Asia),
                        4=Umm Al-Qura, 1=Egypt, 0=Karachi

  Response path         data.timings --- object with keys: Fajr, Sunrise,
                        Dhuhr, Asr, Sunset, Maghrib, Isha, Imsak,
                        Midnight

  Sunrise path          data.timings.Sunrise (separate from prayer times
                        --- used for sun strip)

  Error handling        On 4xx/5xx: show last cached times from
                        localStorage; display inline error message

  Caching               Cache response in localStorage key
                        islamicinfo-prayer-{city}-{date}; refresh daily

  Rate limit            Free tier: no stated limit; recommended max 1
                        call per user per page load

  HTTPS                 API is HTTPS-only; geolocation also requires
                        HTTPS --- consistent
  -----------------------------------------------------------------------

**20.2 Gold Price --- Nisab Calculation**

  -----------------------------------------------------------------------------------------------
  **Field**             **Value**
  --------------------- -------------------------------------------------------------------------
  Recommended source    metals-api.com (free tier: 50 calls/month) or gold-api.com

  Endpoint              https://metals-api.com/api/latest?access_key={key}&base=USD&symbols=XAU

  Response path         rates.XAU (troy ounces per USD) → invert to get \$/oz → multiply by
                        (85/31.1) for nisab

  Nisab formula         nisab_usd = (price_per_troy_oz / 31.1035) \* 85

  Fallback              If API fails: use last cached nisab from localStorage; display \'Using
                        cached nisab from {date}\'

  Update frequency      Fetch once per page load; cache with date in localStorage key
                        islamicinfo-nisab-{date}

  Display               Show as: \'Current Nisab (85g gold): \${nisab} USD --- Updated {date}\'
  -----------------------------------------------------------------------------------------------

**20.3 Reverse Geocoding --- City Name from Coordinates**

  -----------------------------------------------------------------------------------------------------------------------------------
  **Field**             **Value**
  --------------------- -------------------------------------------------------------------------------------------------------------
  Purpose               After geolocation succeeds, show city name (e.g. \'Toronto, Ontario\') not raw coordinates

  Recommended source    api.bigdatacloud.net/data/reverse-geocode-client (free, no key required)

  Endpoint              https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lng}&localityLanguage=en

  Response path         city + principalSubdivision (e.g. \'Toronto\' + \'Ontario\')

  Fallback              If API fails: display \'Near your location\' instead of coordinates

  No API key required   This endpoint is free and key-free --- safe to call from client side
  -----------------------------------------------------------------------------------------------------------------------------------

**20.4 Qibla Bearing --- Client-Side Haversine (No API)**

The Qibla bearing is computed entirely client-side using the Haversine
formula --- no API call required. This works offline after page load.

  -----------------------------------------------------------------------
  **Field**             **Value**
  --------------------- -------------------------------------------------
  Mecca coordinates     Latitude: 21.4225°N, Longitude: 39.8262°E

  Formula               See functional spec §9.3 --- standard spherical
                        trigonometry bearing calculation

  Output                qibla_bearing (degrees from North, 0-360),
                        distance_km, bearing_label (e.g. \'54° NE\')

  Accuracy              ±1-2 degrees --- sufficient for prayer
                        orientation; exact compass calibration depends on
                        device

  Offline               Works fully offline --- all computation is local
  -----------------------------------------------------------------------

**20.5 API Key Management**

+-----------------------------------------------------------------------+
| **BANNED**                                                            |
|                                                                       |
| API keys for AlAdhan, metals-api, and any other services must NEVER   |
| be exposed in client-side JavaScript. All keyed API calls must go     |
| through an IslamicInfo server-side proxy endpoint or environment      |
| variable-injected backend. Exposing an API key in tools.html is a P0  |
| security issue.                                                       |
+-----------------------------------------------------------------------+

**Changelog**

  ----------------------------------------------------------------------------------
  **Version**   **Date**     **Author**         **Changes**
  ------------- ------------ ------------------ ------------------------------------
  1.0           2026-05-18   IslamicInfo        Initial PRD --- derived from
                             Product Team       tools.html mockup,
                                                Tools_Page_Functional_Document.md
                                                v1.0, and CLAUDE_v3.md v3.0

  1.1           2026-05-18   IslamicInfo        9 fixes: §2 GA4 event detail column;
                             Product Team       §3 added Journey D (Discovery) + E
                                                (Filter); §7 US-001 viewport AC
                                                corrected; §7 US-005 Fasting
                                                generalised beyond Shawwal; §9
                                                .btn-gold spec added; §11 link audit
                                                clarification note; §12 Zakat output
                                                schema added; §13 Sprint 0
                                                inheritance.html decision gate;
                                                OQ-09 closed. 4 new sections: §17
                                                Error & Edge Cases, §18 Fiqh &
                                                Content Standards, §19 Tool Tag
                                                List, §20 API Integration Specs.
  ----------------------------------------------------------------------------------
