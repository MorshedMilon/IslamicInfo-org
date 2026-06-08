**PRODUCT REQUIREMENTS DOCUMENT**

**Daily Duas Page**

dua.html

**IslamicInfo.org**

  -----------------------------------------------------------------------
  **Field**             **Value**
  --------------------- -------------------------------------------------
  Version               1.0 --- Final

  Date                  2026-05-18

  Status                Approved for Development

  Page                  dua.html --- Daily Duas

  Mockup                dua\_\_1\_.html (canonical source of truth)

  Design System         CLAUDE_v3.md (v3.0)

  Functional Spec       Dua_Page_Functional_Document.md (v1.0)

  Author                IslamicInfo Product Team
  -----------------------------------------------------------------------

**Table of Contents**

1\. Product Overview

2\. Goals & Success Metrics

3\. Target Users

4\. Feature Matrix

5\. Page Architecture

6\. User Stories & Acceptance Criteria

US-001 Browse Dua Library

US-002 Search Duas

US-003 Filter by Category / Occasion

US-004 Copy a Dua

US-005 Share & Image Generation

US-006 Bookmark / Save a Dua

US-007 Add Personal Notes

US-008 AI Explain (Quranly AI)

US-009 Play Audio Recitation

US-010 Dua of the Day

US-011 Daily Streak Tracker

US-012 Dark Mode Fidelity

US-013 Mobile Responsiveness

US-014 Accessibility

US-015 Navigation & Footer

7\. Wireframe Descriptions

§7.1 Global Header

§7.2 Hero Section

§7.3 Stats Strip

§7.4 Dua of the Day (Featured Dua)

§7.5 Category Grid

§7.6 Dua Library (Sidebar + Main)

§7.7 Dua Card Anatomy

§7.8 CTA Section

8\. Design System Compliance

9\. Interaction & Animation Spec

10\. Navigation & Link Audit

11\. Technical Notes

12\. Out of Scope

13\. Open Questions

14\. Content Data Model

15\. Target User Journeys

16\. Sprint Planning Summary

17\. QA & Testing Checklist

18\. Content Editorial Standards

Changelog

**1. Product Overview**

The Daily Duas page (dua.html) is IslamicInfo\'s Islamic supplication
library. It occupies position 6 in the global navigation --- between
Knowledge Hub and Tools --- and serves as the premier destination for
browsing, reading, interacting with, and sharing duas on the platform.

The page is derived from the canonical mockup dua\_\_1\_.html and must
match its design exactly. All layout, typography, colour, card hover
behaviour, and animation follow CLAUDE_v3.md v3.0. The surrounding
design is frozen --- only content and functionality are added.

**1.1 Core Purpose**

- Give users a single authoritative destination for 1,240+ verified duas

- Display each dua with Arabic text, transliteration, English
  translation, and source reference

- Enable full interaction: audio playback, copying, bookmarking, notes,
  AI explanation, and image sharing

- Support daily spiritual habit via the Dua of the Day feature and 7-day
  streak tracker

- Surface duas by occasion, keyword search, and category filter

**1.2 Platform Position**

  -----------------------------------------------------------------------
  **Attribute**          **Value**
  ---------------------- ------------------------------------------------
  Page file              dua.html

  Nav position           6 of 10 --- between Knowledge Hub and Tools

  Nav label              Daily Duas

  Design system          CLAUDE_v3.md v3.0

  Canonical mockup       dua\_\_1\_.html

  Functional spec        Dua_Page_Functional_Document.md v1.0
  -----------------------------------------------------------------------

**2. Goals & Success Metrics**

**2.1 Primary Goals**

*All metrics are new baselines --- this is a net-new page with no prior
data. Baseline = 0 for all metrics at launch.*

  ----------------------------------------------------------------------
  **Goal**      **Metric**      **Baseline**   **30-Day     **90-Day
                                               Target**     Target**
  ------------- --------------- -------------- ------------ ------------
  Dua           Duas interacted 0 (new page)   ≥ 2          ≥ 3.5
  engagement    with per                                    
                session                                     

  Search usage  Search bar      0 (new page)   ≥ 14%        ≥ 22%
                usage rate                                  

  Bookmarks     Save/bookmark   0 (new page)   ≥ 45         ≥ 90
                actions per                                 
                1,000 UVs                                   

  Share         Image / link    0 (new page)   ≥ 20         ≥ 50
                share actions                               

  AI Explain    AI Explain      0 (new page)   ≥ 30         ≥ 80
                panel opens per                             
                1,000 UVs                                   

  Daily return  7-day retention 0 (new page)   ≥ 18%        ≥ 28%
                rate                                        

  Bounce rate   Single-page     Industry avg   ≤ 50%        ≤ 38%
                sessions        \~55%                       
  ----------------------------------------------------------------------

**2.2 SEO Goals**

- Rank on page 1 for at least 4 dua-related queries (e.g. \'morning dua
  Islam\', \'dua for forgiveness\') within 6 months

- All dua source references include correct schema markup (Islamic text
  schema or Article type) to enable rich results

- Core Web Vitals: LCP ≤ 2.5s · CLS ≤ 0.1 · INP ≤ 200ms

**2.3 Review Cadence**

  -----------------------------------------------------------------------
  **Cadence**   **Meeting**            **Key Metrics**
  ------------- ---------------------- ----------------------------------
  Weekly        Dua Weekly Pulse       Session depth, bookmark rate,
                                       search usage, broken actions

  Bi-weekly     Engagement Review      AI Explain opens, share actions,
                                       audio plays, streak completions

  Monthly       Full Dua Review        All metrics vs 90-day targets,
                                       open questions, content backlog
  -----------------------------------------------------------------------

**3. Target Users**

  -----------------------------------------------------------------------
  **Audience**       **Primary Need**             **Primary Entry Point**
  ------------------ ---------------------------- -----------------------
  Daily Muslim       Morning/evening adhkar and   Hero CTA, Dua of the
  practitioners      prayer duas on demand        Day, Morning & Evening
                                                  category

  New Muslims /      Learning foundational duas   Category grid, search
  converts           with correct Arabic and      bar, Start Here path
                     transliteration              

  Students of        Verified duas with scholarly Source dots, AI
  Islamic knowledge  source references            Explain, sidebar by
                                                  occasion

  Arabic learners    Arabic text with romanised   Dua cards, audio
                     transliteration side-by-side playback at slow speed

  Social media       Beautiful dua images for     Share → Image
  sharers            Instagram / WhatsApp         generation feature

  Habit-focused      Daily dua completion         Sidebar streak tracker,
  practitioners      tracking and streak          Dua of the Day
                     motivation                   

  Global Muslim      Duas relevant to their       12 category grid,
  communities        occasion and madhab context  sidebar occasion
                                                  navigator
  -----------------------------------------------------------------------

**4. Feature Matrix**

**4.1 Priority Legend**

  ---------------------------------------------------------------------------
  **Priority**   **Meaning**                           **Deadline**
  -------------- ------------------------------------- ----------------------
  🔴 P0          Launch blocker. Must ship before      Before launch
                 go-live.                              

  🟠 P1          High. Ship in first sprint after      ≤ 2 weeks post-launch
                 launch.                               

  🟡 P2          Medium. Ship within 60 days of        ≤ 60 days
                 launch.                               

  🟢 P3          Low / Future. No committed date.      Backlog
  ---------------------------------------------------------------------------

**4.2 Hub Page Features**

  ---------------------------------------------------------------------------------------
  **Feature**           **Description**                     **Priority**   **Build
                                                                           Status**
  --------------------- ----------------------------------- -------------- --------------
  Global header ---     10-item nav, search popup, theme    🔴 P0          ✅ Built
  sticky nav            toggle, hamburger                                  

  Hero section          Bismillah, badge, H1, Arabic verse, 🔴 P0          ✅ Built
                        sub-text, 2 CTAs                                   

  Hero CTAs functional  Browse Duas scrolls to              🔴 P0          🔴 Not wired
                        #duas-section; By Occasion scrolls                 
                        to #categories                                     

  Stats strip           4 animated stat cells: 1,240+ · 18+ 🔴 P0          ✅ Built
                        · 100% · 3+                                        

  Dua of the Day card   Dark gradient featured dua with     🔴 P0          ✅ Built ---
                        Copy, Share, Save actions                          actions
                                                                           unwired

  Featured dua actions  Copy, Share, Save all functional on 🔴 P0          🔴 Not wired
                        featured card                                      

  Arabesque divider     Decorative .aq-divider after        🔴 P0          ✅ Built
                        featured dua card                                  

  Category grid --- 12  All 12 cat cards as \<a\> links     🔴 P0          ✅ Built ---
  cards                 with ?cat= params                                  links check
                                                                           needed

  Dua library section   id=duas-section anchor, sidebar +   🔴 P0          ✅ Built
                        main layout                                        

  Sidebar --- 14        Active state + click filter on all  🔴 P0          🟠 Partial
  occasion links        14 occasions                                       

  Sidebar --- streak    7-day visual tracker with           🟠 P1          ✅ Built ---
  tracker               done/today/default states                          logic unwired

  Search bar --- live   Real-time filter of .dua-card on    🔴 P0          🟠 Partial
  filter                input event                                        

  Filter chips --- 6    Active state toggles, syncs with    🔴 P0          🟠 Partial
  chips                 sidebar                                            

  Dua cards --- full    Arabic, transliteration,            🔴 P0          ✅ Built ---
  anatomy               translation, source, all 6 actions                 actions
                                                                           unwired

  Copy action           Copies Arabic text; shows Copied!   🔴 P0          🔴 Not
                        for 1,500ms                                        implemented

  Share action          Opens share drawer with 6 options   🔴 P0          🔴 Not
                        incl. image generation                             implemented

  Save/Bookmark action  Toggles gold icon; persists to      🔴 P0          🔴 Not
                        localStorage                                       implemented

  Notes action          Inline editor with 500-char limit;  🟠 P1          🔴 Not
                        persists to localStorage                           implemented

  AI Explain panel      Slide-over with                     🟠 P1          🔴 Not
                        meaning/context/source/disclaimer                  implemented
                        via API                                            

  Audio playback        Inline player with speed controls;  🟠 P1          🔴 Not
                        disabled state if no audio                         implemented

  Watermarked image     Canvas PNG ≥ 1080×1080 with         🟠 P1          🔴 Not
  generation            islamicinfo.org watermark                          implemented

  Load More --- button  Pill button, spinner state, All     🔴 P0          ✅ Built
  UI                    loaded state, CSS complete                         

  Load More --- backend POST to API, append 20 cards, hide  🟠 P1          🔴 Not wired
  wiring                button when exhausted                              

  CTA section           Dark teal gradient, Explore         🔴 P0          ✅ Built
                        Qur\'an + Hadith Library buttons                   

  Global footer         ft- CSS system, Duas column, Quick  🔴 P0          ✅ Built
                        Access, Ecosystem                                  

  Dark mode             All sections correct in             🔴 P0          ✅ Built
                        \[data-theme=dark\]                                

  Mobile responsive     All 6 breakpoints:                  🔴 P0          ✅ Built
                        1100/900/760/700/640/440                           

  3D tilt on dua cards  rotateX/Y on mousemove; reset on    🟡 P2          🔴 Not
                        mouseleave                                         implemented

  Streak persistence    Daily habit state read/write on     🟠 P1          🔴 Not
  via localStorage      page load                                          implemented

  Saved duas --- /saved Dedicated page for all bookmarked   🟡 P2          🔴 Not built
  page                  duas                                               
  ---------------------------------------------------------------------------------------

**5. Page Architecture**

Sections appear in this exact top-to-bottom order in dua\_\_1\_.html.
This order is frozen --- no section may be moved, removed, or renamed
without explicit instruction.

  -------------------------------------------------------------------------------
  **\#**   **Section**      **CSS Class / ID** **Purpose**
  -------- ---------------- ------------------ ----------------------------------
  1        Global Header    .site-header       Sticky nav, search popup, theme
                                               toggle, mobile menu

  2        Mobile Menu      #mobileMenu        Full-screen nav overlay for ≤
           Overlay                             760px

  3        Hero             .hero              Bismillah, H1, Arabic verse,
                                               sub-text, 2 CTAs

  4        Stats Strip      .stats-strip       Trust signal: 1,240+ · 18+ · 100%
                                               · 3+

  5        Dua of the Day   .featured-dua      Dark gradient featured card with
                                               prev/next cycling

  6        Arabesque        .aq-divider        Decorative visual break between
           Divider                             sections

  7        Category Grid    #categories        12 occasion category cards as
                                               navigation entry points

  8        Dua Library      #duas-section      Sidebar (240px) + main content
                                               area (flex:1)

  8a       Sidebar          .dua-sidebar       14 occasion links + daily streak
                                               tracker

  8b       Search Bar       .dua-search-wrap   Live-filter input for dua cards

  8c       Filter Chips     .cat-filter        6 active-state chips synced with
                                               sidebar

  8d       Dua Card Grid    .dua-grid          auto-fill minmax(300px,1fr)
                                               responsive grid

  8e       Load More        .load-more-wrap    Fetches next 20 cards; hides when
                                               exhausted

  9        CTA Section      .cta-section       Dark teal conversion --- Explore
                                               Qur\'an + Hadith Library

  10       Global Footer    #ii-footer         ft- system, Duas column, Quick
                                               Access, Ecosystem
  -------------------------------------------------------------------------------

**6. User Stories & Acceptance Criteria**

**Epic 1: Core Browsing**

**US-001 · Browse Dua Library**

As a **Muslim seeking duas for daily practice**, I want to **browse the
full dua library and navigate to duas by occasion** so that I can find
the right dua without knowing its name or exact Arabic text

**Acceptance Criteria**

- Page loads with the hero visible above the fold on all devices ≥ 320px
  wide.

- Clicking \'Browse Duas\' smooth-scrolls to #duas-section.

- Clicking \'By Occasion\' smooth-scrolls to #categories.

- All 12 category cards are visible without horizontal scroll on any
  breakpoint.

- Clicking a category card navigates to dua.html?cat={slug}.

- All 14 sidebar occasion links are visible in the sidebar at ≥ 900px.

- Sidebar is hidden at ≤ 900px --- .dua-main takes full width.

**US-002 · Search Duas**

As a **user who wants to find a specific dua by keyword**, I want to
**type a keyword into the search bar and see matching duas instantly**
so that I don\'t waste time scrolling through unrelated cards

**Acceptance Criteria**

- Search input (#duaSearch) is visible above the dua grid at all times.

- Placeholder reads: \'Search duas by occasion, keyword, or Arabic...\'

- On every input event, dua cards with no matching text are set to
  display:none.

- Cards that match the query remain visible.

- Search is case-insensitive.

- Clearing the input restores all dua cards.

- Focus state: border becomes var(\--teal-500) with 4px glow ring.

- GA4 event kh_dua_search fires on input with {query: string}.

- No-results state: shows message \'No duas found for \"{query}\"\' with
  a clear button.

**US-003 · Filter by Category / Occasion**

As a **user browsing duas**, I want to **filter the dua grid by occasion
using the sidebar or filter chips** so that I only see duas relevant to
my current moment (e.g. morning, travel)

**Acceptance Criteria**

- Clicking a sidebar occasion item applies the category filter to the
  grid.

- The clicked item gains class dsb-item active (bg teal-50, text
  teal-700, left border teal-700).

- Clicking a filter chip applies the same filter and gains class
  cat-chip active (teal-700 bg, white text).

- Sidebar and filter chips remain in sync --- selecting one updates the
  other\'s active state.

- Selecting \'All Duas\' clears the filter and shows all cards.

- Filter works alongside search --- both may be active simultaneously.

- GA4 event kh_dua_filter fires with {occasion: string} on every filter
  apply.

**Epic 2: Dua Card Interactions**

**US-004 · Copy a Dua**

As a **user who wants to copy a dua to paste elsewhere**, I want to
**click the Copy button and have the Arabic text copied to my
clipboard** so that I can share the dua text directly in messages or
notes

**Acceptance Criteria**

- Clicking Copy calls navigator.clipboard.writeText() with the Arabic
  text of that specific card.

- Button label changes to \'Copied!\' for 1,500ms then reverts to
  \'Copy\'.

- Fallback: if clipboard API unavailable, uses
  document.execCommand(\'copy\') on a temp textarea.

- Works on both dua cards (.dua-btn Copy) and the featured dua
  (.fd-action-btn copy icon).

- GA4 event kh_dua_copy fires with {dua_id: string}.

- Copying never opens a modal, alert(), or new tab.

**US-005 · Share & Image Generation**

As a **Muslim who wants to post a dua on social media**, I want to
**generate a beautiful branded image of a dua and download it** so that
I can share authentic Islamic content that looks professional and
credits the source

**Acceptance Criteria**

- Clicking Share opens a share drawer with 6 options: Share as Image ·
  Copy Link · WhatsApp · Telegram · X · Native Share.

- Share as Image generates a PNG using the Canvas API (or server-side
  equivalent).

- Generated image is at minimum 1080×1080px.

- Image layers (top to bottom): teal gradient background → faint
  geometric motif (4% opacity) → Arabic text → transliteration →
  translation → source reference → islamicinfo.org watermark.

- Watermark \'islamicinfo.org\' is always visible in the bottom-right
  corner at 11px --- non-negotiable.

- User can download the PNG via a \'Download\' button in the share
  drawer.

- WhatsApp link: https://wa.me/?text={encoded arabic + translation +
  URL} --- opens new tab.

- X link: https://twitter.com/intent/tweet?text={title}&url={url} ---
  opens new tab.

- Native Share: invokes navigator.share() where supported (mobile
  browsers).

- Copy Link: copies the deep-link URL (islamicinfo.org/dua/id/{id}) to
  clipboard.

- GA4 event kh_dua_share fires with {method: string, dua_id: string}.

**US-006 · Bookmark / Save a Dua**

As a **user who wants to revisit a dua later**, I want to **bookmark a
dua so I can find it quickly on future visits** so that I don\'t have to
search for it again

**Acceptance Criteria**

- Clicking Save icon (.dua-icon-btn) or \'Save\' button (.dua-btn Save)
  toggles the saved state.

- Saved state: icon/button fills gold (color: var(\--gold-500)).

- Saved state persists to localStorage key dua-saved-{id}: \'true\'.

- On page load, all rendered cards check localStorage and pre-apply
  saved state.

- Unsaving (clicking again) removes the localStorage key and reverts
  icon to default.

- All interaction points for the same dua (card icon + card button +
  featured card) stay in sync.

- GA4 event kh_dua_save fires with {dua_id: string, action:
  \'save\'\|\'unsave\'}.

**US-007 · Add Personal Notes**

As a **user memorising or reflecting on a dua**, I want to **add a
personal note to a dua card** so that I can record my reflections and
come back to them

**Acceptance Criteria**

- Clicking Notes expands an inline editor below the card content.

- Editor contains: textarea (placeholder \'Add a personal note,
  reflection, or reminder...\'), character counter (max 500), Save
  button (teal primary), Cancel button (ghost).

- Saving persists note to localStorage key dua-note-{id}: \'{text}\'.

- When a note exists, the Notes button shows a small filled dot
  indicator.

- On page load, notes are read from localStorage and indicator dots
  applied.

- Cancelling closes the editor without saving.

- Error state: if localStorage write fails, shows \'Could not save note.
  Try again.\'

**Epic 3: AI & Audio**

**US-008 · AI Explain (Quranly AI)**

As a **user who wants to understand the meaning and context of a dua**,
I want to **open the AI Explain panel and read a plain-language
explanation** so that I understand what I am reciting and when to recite
it

**Acceptance Criteria**

- Clicking AI Explain opens a slide-over panel from the right (bottom
  sheet on mobile).

- Panel header always reads \'AI-Assisted Explanation --- Quranly AI\'
  --- this label is hard-coded, never AI-generated.

- Panel sections: Meaning · Context · Source · Related · Disclaimer.

- Disclaimer is hard-coded in the panel template: \'This explanation is
  AI-assisted. For religious rulings, always consult a qualified
  scholar.\' It must appear regardless of API response.

- API call: POST to Anthropic /v1/messages, model
  claude-sonnet-4-20250514, max_tokens 1000.

- System prompt: \'You are an Islamic knowledge assistant for
  IslamicInfo.org. Explain the following dua in simple language. State
  its meaning, when to recite it, and its source. Cite authentic Quran
  or hadith references. Acknowledge uncertainty. Avoid issuing religious
  verdicts.\'

- Loading state: animated skeleton rows inside the panel while API
  responds.

- Error state: \'Unable to load explanation. Please try again.\' with a
  Retry button --- no blank panel.

- Panel closes on: clicking outside, pressing Escape, clicking the close
  icon.

- GA4 event kh_dua_ai_explain fires with {dua_id: string}.

**US-009 · Play Audio Recitation**

As a **user who wants to hear a dua recited correctly**, I want to
**play an audio recording of the dua directly in the card** so that I
can learn proper pronunciation without leaving the page

**Acceptance Criteria**

- Clicking Play expands an inline audio player within the card.

- Player controls: Play/Pause toggle · Progress scrubber · Current time
  / total duration · Speed selector (0.75× · 1× · 1.25× · 1.5×).

- Default playback speed is 1×.

- Audio source is a CDN-hosted file keyed by dua ID.

- Unavailable state: Play button is visually disabled (opacity: 0.4,
  cursor: not-allowed) with tooltip \'Audio coming soon\'.

- Player is keyboard-navigable: Space = play/pause, Arrow keys = scrub.

- ARIA labels: play button aria-label=\'Play dua recitation\', scrubber
  aria-label=\'Audio progress\'.

- GA4 event kh_dua_audio_play fires with {dua_id: string, speed:
  number}.

**Epic 4: Daily Habit**

**US-010 · Dua of the Day**

As a **user opening the Dua page for the first time today**, I want to
**see a featured Dua of the Day prominently displayed** so that I have
an immediate daily spiritual touchpoint without browsing

**Acceptance Criteria**

- The featured dua card (.featured-dua) is the first major section after
  the stats strip.

- Card uses dark gradient background (var(\--teal-900) →
  var(\--teal-800) → #062628).

- Two decorative radial glows: gold top-right (::before), teal
  bottom-left (::after).

- Card anatomy (top to bottom): occasion badge · action row
  (Copy/Share/Save) · Arabic text · transliteration · translation ·
  footer (source + prev/next).

- Arabic text uses var(\--font-arabic) Amiri, clamp(22px,3.5vw,36px),
  RTL, white.

- Transliteration: 13px, italic, rgba(197,160,89,.8).

- Translation: var(\--font-serif), clamp(15px,2vw,18px), italic,
  rgba(255,255,255,.72).

- Previous and Next buttons cycle through the featured dua pool
  (backend-driven, date-based).

- In production: featured dua is selected server-side by date, updated
  daily at midnight UTC.

- GA4 event kh_dua_featured_view fires on page load.

**US-011 · Daily Streak Tracker**

As a **user building a daily dua reading habit**, I want to **see my
7-day streak tracker in the sidebar** so that I stay motivated to return
each day

**Acceptance Criteria**

- Sidebar streak panel (.dsb-streak) shows 7 day squares.

- Square states: .done (completed, teal-700 bg, white checkmark), .today
  (dashed teal-500 border, \'T\' label), default (faint teal bg).

- Streak label shows current streak count: \'✦ N-day streak\' in
  teal-600, uppercase 10px.

- On page load, streak data is read from localStorage key
  islamicinfo-dua-streak.

- Opening the page and viewing the Dua of the Day marks today as
  in-progress.

- Interacting with any dua (Copy/Save/AI Explain) marks today as .done
  in the streak.

- Streak counter increments automatically when today transitions from
  in-progress to .done.

- If user has not visited in \> 1 day, streak resets to 0 (missed days
  shown as empty).

**Epic 5: Presentation & Platform**

**US-012 · Dark Mode Fidelity**

As a **user who prefers dark mode**, I want to **see every section
render correctly with dark theme tokens** so that my reading experience
is consistent and premium in dark mode

**Acceptance Criteria**

- data-theme=\'dark\' applied to \<html\> --- not \<body\>.

- Theme preference persists via localStorage key islamicinfo-theme.

- Dark mode applied before render --- no flash of light mode.

- Bismillah: gold gradient + filter:drop-shadow(0 0 14px
  rgba(217,179,88,.55)).

- Hero title: color #F5F8F8.

- Dua cards: background #152527, border rgba(0,105,110,.18).

- Card hover glow: rgba(88,193,199,.18) --- not the light-mode teal.

- Arabic text in dua cards: var(\--teal-300) #88E0E5.

- Sidebar: background var(\--white) = #152527 in dark.

- Stats strip: background var(\--white) in dark.

- Sun icon shown in dark mode (toggle to light); moon icon in light
  mode.

- Hero Arabic verse: color rgba(88,224,229,.5).

**US-013 · Mobile Responsiveness**

As a **user on a mobile phone (320px--767px wide)**, I want to **use
every section of the Dua page without horizontal overflow** so that I
can find and read duas on the go

**Acceptance Criteria**

- No horizontal scroll at any breakpoint from 320px upward.

- ≤ 900px: sidebar hidden, .dua-main takes full width, padding-left
  reset to 0.

- ≤ 760px: nav hidden, hamburger visible, only theme toggle + search +
  hamburger in header-tools.

- ≤ 700px: stats strip wraps to 2×2 grid, dividers hidden.

- ≤ 640px: dua grid collapses to single column.

- ≤ 440px: footer goes to 1 column, all cards stack.

- Featured dua card readable at 320px: Arabic text at minimum clamp
  size, no overflow.

- Share drawer opens as bottom sheet on mobile (not side panel).

- AI Explain panel opens as bottom sheet on mobile.

**US-014 · Accessibility**

As a **user relying on a keyboard or screen reader**, I want to
**navigate and interact with all core dua features without a mouse** so
that Islamic knowledge is accessible regardless of ability

**Acceptance Criteria**

- All interactive elements reachable via Tab in logical reading order.

- FAQ-style expandable elements operable via Enter / Space.

- Search input has aria-label=\'Search duas\'.

- Hamburger: aria-label=\'Open menu\'. Close button: aria-label=\'Close
  menu\'.

- Bismillah element has aria-label=\'Bismillah --- In the name of Allah,
  the Most Gracious, the Most Merciful\'.

- Arabic text elements have lang=\'ar\' attribute.

- Audio player is keyboard-navigable: Space = play/pause, Left/Right
  arrows = scrub 5 seconds.

- Audio Play button aria-label=\'Play dua recitation\'; Pause
  aria-label=\'Pause\'; scrubber aria-label=\'Audio progress\'.

- Colour contrast: all body text meets WCAG AA (4.5:1) in both light and
  dark modes.

- Share drawer and AI panel have focus trap --- Tab cannot escape the
  overlay while open.

- All icon-only buttons have visible aria-label.

**US-015 · Navigation & Footer**

As a **user anywhere on the page**, I want to **use consistent global
navigation and find all platform tools** so that I can move between any
IslamicInfo page in one click

**Acceptance Criteria**

- All 10 nav items present in exact order: Home · Quran Explorer ·
  Hadith Library · Islamic Studies · Knowledge Hub · Daily Duas · Tools
  · Habit Tracker · Verify · About.

- \'Daily Duas\' has class=\'nav-link active\' with teal/gold underline
  gradient.

- Islamic Studies href is always islamic-studies.html --- never
  learn.html.

- Knowledge Hub appears at position 5 --- never omitted.

- Footer column 1 heading: \'Duas\' with 5 dua-category links.

- Footer Quick Access (col 2): all 8 destinations including Knowledge
  Hub.

- Footer Ecosystem (col 3): QuranlyAI · MosqueFinder · TravellyAI ·
  LearnSpeakAI --- exact URLs.

- Copyright: \'© 2026 Islamicinfo.org --- No ads. No fatwas. No
  fabricated sources.\'

**7. Wireframe Descriptions**

All wireframes reference the canonical mockup file dua\_\_1\_.html.
ASCII diagrams below describe the exact visual layout and flow of each
section as rendered in that file.

**§7.1 Global Header**

**dua\_\_1\_.html --- \<header class=\'site-header\'\>**

> ┌─────────────────────────────────────────────────────────────────────────────────┐
>
> │ \[IslamicInfo ✦\] Home · Quran · Hadith · IS · KH · Daily Duas ·
> Tools · ... \[🔍 EN ☾ 👤\]│
>
> │ ──────────── ← teal/gold underline │
>
> └─────────────────────────────────────────────────────────────────────────────────┘
>
> ← sticky, z-index 100, 60px tall
>
> ← \'Daily Duas\' has .nav-link.active with gradient underline
>
> ← mobile ≤760px: nav hidden, hamburger shown

**§7.2 Hero Section**

**dua\_\_1\_.html --- \<section class=\'hero\'\>**

> ░░░░ radial glow: teal upper-left, gold upper-right ░░░░
>
> ◆ geo g1 (teal star) ▪ geo g2 (gold square) ◆
>
> بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ← Amiri, teal gradient clip-text
>
> ┌──────────────────────────────┐
>
> │ ● Dua Library │ ← hero-badge pill
>
> └──────────────────────────────┘
>
> The Complete
>
> Dua Library ← gradient-italic (teal→gold), clamp(46--82px)
>
> ادْعُونِي أَسْتَجِبْ لَكُمْ ← Qur\'an 40:60, teal-700, 60% opacity, RTL
>
> Every dua verified from Qur\'an and authentic Sunnah\...
>
> \[Browse Duas\] \[By Occasion\] ← .btn-primary + .btn-ghost
>
> ◆ geo g3 (teal) ▪ geo g4 (gold) ◆
>
> ← min-height 72vh

**§7.3 Stats Strip**

**dua\_\_1\_.html --- .stats-strip**

> ┌────────────────────────────────────────────────────────────────────┐
>
> │ 1,240+ │ 18+ │ 100% │ 3+ │
>
> │ Verified │ Occasions │ Source- │ Languages │
>
> │ Duas │ │ Cited │ │
>
> └────────────────────────────────────────────────────────────────────┘
>
> ← .surface-card bg, 0.5px teal border, border-radius r-xl
>
> ← margin-top: -20px overlaps hero bottom edge
>
> ← .stat-divider 0.5px lines between cells
>
> ← at ≤700px: wraps to 2x2, dividers hidden

**§7.4 Dua of the Day (Featured Dua)**

**dua\_\_1\_.html --- .featured-dua**

> ████████████████████████ dark teal gradient bg
> ████████████████████████
>
> ░ gold radial glow (top-right, ::before) ░ teal glow (bottom-left,
> ::after)
>
> ┌────────────────────────────────────────────────────────────────┐
>
> │.fd-inner (z-index:1) │
>
> │ │
>
> │ \[✦ Morning Remembrance\] \[Copy\] \[Share\] \[Save\] │
>
> │ ← fd-badge (gold pill) ← fd-actions (3 icon btns) │
>
> │ │
>
> │ اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا │
>
> │ ← fd-arabic: Amiri, clamp(22--36px), RTL, white, line-h 2.0 │
>
> │ │
>
> │ Allahumma bika asbahna wa bika amsayna\... │
>
> │ ← fd-transliteration: 13px, italic, gold-tinted │
>
> │ │
>
> │ \'O Allah, by You we enter the morning\...\' │
>
> │ ← fd-trans: font-serif, italic, rgba(255,255,255,.72) │
>
> │ │
>
> │ ──────────────────────────────────────────────────── │
>
> │ BUKHARI · 6306 \[← Previous\] \[Next →\] │
>
> │ ← fd-source (gold, uppercase) ← fd-nav-btn pills │
>
> └────────────────────────────────────────────────────────────────┘
>
> ──────────── ✦ ──────────── ← .aq-divider (gold star, fade lines)

**§7.5 Category Grid**

**dua\_\_1\_.html --- #categories .cat-grid**

> BROWSE BY OCCASION ← section-eyebrow
>
> Duas for Every Moment ← section-title (.gold-it)
>
> 300+ duas organized by occasion\... ← section-sub
>
> ┌──────────┬──────────┬──────────┬──────────┐
>
> │ 🌅 │ 🕌 │ 🍽️ │ 🛌 │
>
> │ Morning │ Prayer │ Food & │ Sleep & │
>
> │ & Evening │ │ Drink │ Waking │
>
> │ 42 duas │ 38 duas │ 18 duas │ 24 duas │
>
> ├──────────┼──────────┼──────────┼──────────┤
>
> │ 🤲 │ 💊 │ 🧳 │ 👶 │
>
> │ Forgive- │ Illness │ Travel │ Family & │
>
> │ ness │ │ │ Children │
>
> │ 31 duas │ 15 duas │ 19 duas │ 22 duas │
>
> ├──────────┼──────────┼──────────┼──────────┤
>
> │ 📖 │ ⚡ │ 🌙 │ 🕋 │
>
> │ Knowledge │ Anxiety │ Ramadan │ Hajj & │
>
> │ │ & Hard. │ │ Umrah │
>
> │ 12 duas │ 27 duas │ 35 duas │ 29 duas │
>
> └──────────┴──────────┴──────────┴──────────┘
>
> ← auto-fill grid, minmax(160px,1fr), 14px gap
>
> ← all cards are \<a\> elements with ?cat= hrefs
>
> ← hover: translateY(-4px) scale(1.02) + teal glow --- no shimmer

**§7.6 Dua Library --- Two-Column Layout**

**dua\_\_1\_.html --- #duas-section .dua-layout**

> ┌──────────────────────┬───────────────────────────────────────────────────┐
>
> │ .dua-sidebar (240px) │ .dua-main (flex:1, padding-left:28px) │
>
> │ sticky top:80px │ │
>
> │ │ \[🔍 Search duas by occasion, keyword, Arabic...\] │
>
> │ BY OCCASION ←label │ │
>
> │ ● All Duas 300+ │
> \[All\]\[Morning\]\[Prayer\]\[Qur\'anic\]\[Protection\]\[+\] │
>
> │ Morning 42 │ ← .cat-filter chips, active = teal bg │
>
> │ Prayer 38 │ │
>
> │ Sleep 24 │ ┌─────────────────┬─────────────────┐ │
>
> │ Protection 19 │ │ Dua Card │ Dua Card │ │
>
> │ Forgiveness 31 │ ├─────────────────┼─────────────────┤ │
>
> │ ... ... │ │ Dua Card │ Dua Card │ │
>
> │ │ └─────────────────┴─────────────────┘ │
>
> │ ────────────────── │ ← .dua-grid: auto-fill minmax(300px,1fr) 20px │
>
> │ DAILY STREAK │ │
>
> │ ✦ 3-day streak │ \[⬇ Load More Duas\] │
>
> │ \[M\]\[T\]\[W\]\[T✓\]\[F✓\]\[S✓\]\[T\]←7 squares │ │
>
> └──────────────────────┴───────────────────────────────────────────────────┘
>
> ← sidebar hidden at ≤900px; .dua-main takes full width

**§7.7 Dua Card Anatomy**

**dua\_\_1\_.html --- .card.dua-card**

> ┌────────────────────────────────────────────────────────────┐
>
> │ \[🤲 General\] \[⬡ save icon\] │
>
> │ ← .dua-tag (teal pill, 10px uppercase) ← .dua-icon-btn │
>
> │ │
>
> │ ┌──────────────────────────────────────────────────────┐ │
>
> │ │ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً │ │
>
> │ │ ← .dua-arabic: Amiri, 22px, RTL, line-h 2.0 │ │
>
> │ │ ← bg: rgba(0,105,110,.03), border-radius:10px │ │
>
> │ └──────────────────────────────────────────────────────┘ │
>
> │ │
>
> │ Rabbana atina fid-dunya hasanatan\... │
>
> │ ← .dua-transliteration: 12.5px, italic, gold-700 │
>
> │ │
>
> │ \| \'Our Lord, grant us good in this world\...\' │
>
> │ ← .dua-translation: font-serif, 15px, teal left border │
>
> │ │
>
> │ ──────────────────────────────────────────────────────── │
>
> │ ● QUR\'AN · AL-BAQARAH 2:201 \[Copy\]\[Share\]\[Save\]\[Notes\] │
>
> │ \[AI Explain\]\[▶ Play\] │
>
> │ ← .dua-source-dot green ← .dua-btn pills (6 total) │
>
> └────────────────────────────────────────────────────────────┘
>
> ← hover: translateY(-5px) scale(1.012) + teal glow --- NO shimmer
>
> ← 3D tilt on mousemove (P2): rotateX ±4°, rotateY ±6°
>
> ← dark mode: dua-arabic text = var(\--teal-300)

**§7.8 CTA Section**

**dua\_\_1\_.html --- .cta-section**

> ████████████████ linear-gradient(135deg, #0A3A3D, #00696E, #062628)
> ████
>
> ░ gold radial glow top-left (::before) ░ teal glow bottom-right
> (::after)
>
> \[✦ 300+ Duas · Fully Verified\] ← .cta-badge
>
> Every Supplication.
>
> Source-Cited. ← \<em\> italic
>
> Arabic, transliteration, translation, and hadith reference
>
> --- for every dua in our library.
>
> \[Explore Qur\'an\] \[Hadith Library\]
>
> → quran.html → hadith.html
>
> .btn-primary .btn-white-ghost
>
> ████████████████████████████████████████████████████████████████████
>
> ← .reveal on all child elements for scroll-triggered entrance

**8. Design System Compliance**

All components follow CLAUDE_v3.md v3.0. The rules below are
non-negotiable. Deviations require explicit approval and an update to
the design system document.

  ------------------------------------------------------------------------
  **Rule**           **Requirement**                   **Reference**
  ------------------ --------------------------------- -------------------
  Card hover         translateY(-5px) scale(1.012) +   CLAUDE_v3.md §27.4
                     teal glow ring                    

  NO SHIMMER         ::after sweep/shimmer animations  CLAUDE_v3.md §27.4
                     banned on ALL cards forever       

  Dark hover glow    rgba(88,193,199,.18) --- NOT the  CLAUDE_v3.md §27.4
                     light-mode teal value             

  Buttons            .btn-primary / .btn-ghost /       CLAUDE_v3.md §9
                     .btn-white-ghost exact spec       

  CTA section        Last before footer; dark teal     CLAUDE_v3.md §11
                     gradient; .reveal on children     

  Footer CSS         ft-top / ft-brand / ft-link /     CLAUDE_v3.md §7
                     ft-bot class system               

  Header structure   site-header / brand / nav /       CLAUDE_v3.md §4
                     header-tools three-zone layout    

  Reveal animation   .reveal + IntersectionObserver    CLAUDE_v3.md §12
                     threshold 0.12                    

  Colors             All \--teal-\* and \--gold-\*     CLAUDE_v3.md §1
                     tokens only; no raw hex inline    

  Arabic text        font-family: var(\--font-arabic)  CLAUDE_v3.md §20
                     (Amiri), direction: rtl           

  Bismillah          Teal gradient (light) / gold      CLAUDE_v3.md §5
                     gradient + drop-shadow (dark)     

  Easing             All transitions:                  CLAUDE_v3.md §13
                     var(\--ease-reverent) or          
                     var(\--ease-premium)              

  Font imports       Cormorant Garamond + Inter +      CLAUDE_v3.md §2
                     Amiri --- in this exact order     

  Dark mode block    \[data-theme=\'dark\'\] is a      CLAUDE_v3.md §1
                     SIBLING to :root --- never merged 

  Watermark on       islamicinfo.org watermark on ALL  Func. Doc §10.2
  images             generated share images            
  ------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **🚫 BANNED**                                                         |
|                                                                       |
| The No-Shimmer rule is absolute. No card on any page of               |
| IslamicInfo.org may use an ::after sweep animation. This applies to   |
| .dua-card, .cat-card, .feat-main, and every future card. Violation is |
| a blocking issue.                                                     |
+-----------------------------------------------------------------------+

**9. Interaction & Animation Spec**

  -------------------------------------------------------------------------------
  **Element**        **Duration**    **Transform**       **Glow / Shadow**
  ------------------ --------------- ------------------- ------------------------
  Dua cards          0.38s           translateY(-5px)    0 16px 40px
  (.dua-card)        ease-reverent   scale(1.012)        rgba(0,105,110,.13), 0
                                                         4px 12px
                                                         rgba(0,105,110,.08), 0 0
                                                         0 1px
                                                         rgba(0,105,110,.07)

  Category cards     0.35s           translateY(-4px)    0 14px 36px
  (.cat-card)        ease-reverent   scale(1.02)         rgba(0,105,110,.12), 0 0
                                                         0 1px
                                                         rgba(0,105,110,.08)

  Buttons            0.30s           translateY(-2px)    0 8px 28px
  (primary/ghost)    ease-premium    scale(1.04)         rgba(0,105,110,.42)

  Nav links          0.25s           scale(1.05)         0 0 0 1px
                     ease-premium                        rgba(0,105,110,.12), 0
                                                         4px 12px
                                                         rgba(0,105,110,.1)

  Icon buttons       0.18s           none                background tint + color
  (.dua-icon-btn)                                        shift

  Featured dua       0.20s           scale(1.1)          brighter background
  action btns                                            

  Filter chips       0.22s           scale(1.04)         0 4px 12px
                     ease-premium                        rgba(0,105,110,.22)

  Footer links       0.18s           translateX(4px)     border-left
                                                         rgba(88,193,199,.4)

  Featured dua area  0.30s           none                Subtle border-color
  (.fd-inner)        ease-reverent                       brightening:
                                                         rgba(255,255,255,.15) →
                                                         rgba(255,255,255,.30);
                                                         ::before gold glow
                                                         opacity +20%

  Featured action    0.20s           scale(1.1)          background
  buttons                                                rgba(255,255,255,.08) →
  (.fd-action-btn)                                       rgba(255,255,255,.22);
                                                         color
                                                         rgba(255,255,255,.7) →
                                                         white
  -------------------------------------------------------------------------------

**3D Tilt Effect (P2 --- Dua Cards)**

- On mousemove: compute cursor position relative to card centre.

- Apply rotateX(max ±4°) and rotateY(max ±6°) on top of hover lift
  transform.

- On mouseleave: reset all transforms with 0.38s ease-reverent
  transition.

**Reveal on Scroll (All Sections)**

- Add .reveal class to all section headings, cards, and content blocks.

- IntersectionObserver at threshold: 0.12 adds .in class on viewport
  entry.

- .in triggers: opacity 0→1, transform translateY(28px)→none, transition
  0.65s ease-reverent.

- Stagger variants: .reveal-d1 (+0.10s), .reveal-d2 (+0.20s), .reveal-d3
  (+0.30s).

**Streak Day Squares**

- .done: teal-700 bg, white checkmark --- completed day.

- .today: dashed teal-500 border --- current day (in-progress).

- Default: faint teal bg, subtle text label --- upcoming / missed.

**10. Navigation & Link Audit**

All links requiring fixes before go-live (🔴 P0) or first post-launch
sprint (🟠 P1). Every href is spelled out explicitly --- no
cross-references.

  -------------------------------------------------------------------------------------------------------------------
  **\#**   **Element**         **Location**   **Current    **Correct Target**                          **Priority**
                                              State**                                                  
  -------- ------------------- -------------- ------------ ------------------------------------------- --------------
  1        Hero \'Browse       Hero           No scroll    scrollIntoView #duas-section                🔴
           Duas\' CTA                         action                                                   

  2        Hero \'By           Hero           No scroll    scrollIntoView #categories                  🔴
           Occasion\' CTA                     action                                                   

  3        Cat card: Morning & Category grid  Check href   dua.html?cat=morning-evening                🔴
           Evening                                                                                     

  4        Cat card: Prayer    Category grid  Check href   dua.html?cat=prayer                         🔴

  5        Cat card: Food &    Category grid  Check href   dua.html?cat=food-drink                     🔴
           Drink                                                                                       

  6        Cat card: Sleep &   Category grid  Check href   dua.html?cat=sleep                          🔴
           Waking                                                                                      

  7        Cat card:           Category grid  Check href   dua.html?cat=forgiveness                    🔴
           Forgiveness                                                                                 

  8        Cat card: Illness   Category grid  Check href   dua.html?cat=illness                        🔴

  9        Cat card: Travel    Category grid  Check href   dua.html?cat=travel                         🔴

  10       Cat card: Family &  Category grid  Check href   dua.html?cat=family                         🔴
           Children                                                                                    

  11       Cat card: Knowledge Category grid  Check href   dua.html?cat=knowledge                      🔴

  12       Cat card: Anxiety & Category grid  Check href   dua.html?cat=anxiety                        🔴
           Hardship                                                                                    

  13       Cat card: Ramadan   Category grid  Check href   dua.html?cat=ramadan                        🔴

  14       Cat card: Hajj &    Category grid  Check href   dua.html?cat=hajj-umrah                     🔴
           Umrah                                                                                       

  15       Featured dua Copy   Featured card  Unwired      navigator.clipboard.writeText(arabicText)   🔴
           button                                                                                      

  16       Featured dua Share  Featured card  Unwired      Opens share drawer                          🔴
           button                                                                                      

  17       Featured dua Save   Featured card  Unwired      Toggle localStorage dua-saved-{id}          🔴
           button                                                                                      

  18       Featured dua        Featured card  Unwired      Cycle featured dua pool (backend)           🔴
           Previous button                                                                             

  19       Featured dua Next   Featured card  Unwired      Cycle featured dua pool (backend)           🔴
           button                                                                                      

  20       All dua card Copy   Dua grid       Unwired      navigator.clipboard.writeText(arabicText)   🔴
           buttons                                                                                     

  21       All dua card Share  Dua grid       Unwired      Opens share drawer                          🔴
           buttons                                                                                     

  22       All dua card Save   Dua grid       Unwired      Toggle localStorage dua-saved-{id}          🔴
           buttons                                                                                     

  23       All dua card Notes  Dua grid       Unwired      Expand inline editor                        🟠
           buttons                                                                                     

  24       All dua card AI     Dua grid       Unwired      Open AI slide-over panel                    🟠
           Explain buttons                                                                             

  25       All dua card Play   Dua grid       Unwired      Expand inline audio player                  🟠
           buttons                                                                                     

  26       Dua source dot /    Card footer    Display only hadith.html?ref={ref} or                    🟠
           reference                                       quran.html?surah=...                        

  27       Load More button    Grid bottom    No backend   Fetch next 20 duas from API                 🟠

  28       Sidebar --- filter  Sidebar        No action    Apply category filter + update active state 🔴
           click                                                                                       

  29       Filter chips ---    Chips row      No sync      Apply filter + sync sidebar active state    🔴
           click                                                                                       

  30       Search bar input    Search         Partial      Live filter .dua-card elements              🔴
           event                                                                                       

  31       CTA \'Explore       CTA section    Check href   quran.html                                  🔴
           Qur\'an\'                                                                                   

  32       CTA \'Hadith        CTA section    Check href   hadith.html                                 🔴
           Library\'                                                                                   

  33       Footer IS link      Footer         Check href   islamic-studies.html (never learn.html)     🔴

  34       Footer Morning &    Footer Duas    Check href   dua.html?cat=morning-evening                🔴
           Evening             col                                                                     

  35       Footer Prayer Duas  Footer Duas    Check href   dua.html?cat=prayer                         🔴
                               col                                                                     

  36       Footer For Travel   Footer Duas    Check href   dua.html?cat=travel                         🔴
                               col                                                                     

  37       Footer For          Footer Duas    Check href   dua.html?cat=forgiveness                    🔴
           Forgiveness         col                                                                     

  38       Footer Hajj & Umrah Footer Duas    Check href   dua.html?cat=hajj-umrah                     🔴
                               col                                                                     
  -------------------------------------------------------------------------------------------------------------------

**Total P0 links to fix before launch: 28 \| Total P1 links to wire in
sprint 1: 10**

**11. Technical Notes**

**11.1 Current Implementation Stack**

- Static HTML with embedded CSS and JavaScript --- no build tool, no
  framework.

- CSS custom properties: CLAUDE_v3.md token system (all \--teal-\*,
  \--gold-\*, \--ink-\*, \--surface-\*).

- Layout: CSS Grid + Flexbox.

- Scroll animations: IntersectionObserver with threshold 0.12, adds .in
  class to .reveal elements.

- Client-side JS: theme toggle · search popup · mobile menu · reveal
  observer.

**11.2 LocalStorage Keys**

  --------------------------------------------------------------------------------
  **Key**                  **Type**                **Purpose**
  ------------------------ ----------------------- -------------------------------
  islamicinfo-theme        string                  Theme preference --- shared
                           (\'light\'\|\'dark\')   across all pages

  dua-saved-{id}           \'true\' (string)       Saved/bookmarked state per dua
                                                   ID

  dua-note-{id}            string (max 500 chars)  Personal note text per dua ID

  islamicinfo-dua-streak   JSON object             Streak tracker --- dates of
                                                   completed sessions
  --------------------------------------------------------------------------------

**11.3 AI Explain API Call**

Model: claude-sonnet-4-20250514 · max_tokens: 1000 · No API key passed
from client (handled server-side or via Anthropic proxy).

System prompt (verbatim):

> You are an Islamic knowledge assistant for IslamicInfo.org. Explain
> the following dua in simple language. State its meaning, when to
> recite it, and its source. Cite authentic Quran or hadith references.
> Acknowledge uncertainty. Avoid issuing religious verdicts.

+-----------------------------------------------------------------------+
| **⚠️ RULE**                                                           |
|                                                                       |
| The Disclaimer in the AI Explain panel is ALWAYS hard-coded in the    |
| HTML template --- never generated by AI. The panel must render the    |
| disclaimer even if the API call fails or is not yet made.             |
+-----------------------------------------------------------------------+

**11.4 Share Image Canvas Layers**

  ----------------------------------------------------------------------------
  **Layer**         **Content**           **Style**
  ----------------- --------------------- ------------------------------------
  1 --- Background  Teal gradient         linear-gradient(135deg, teal-900 →
                                          teal-800)

  2 --- Geometric   Faint star polygon    opacity \~4%, decorative, brand
                    SVG                   palette

  3 --- Arabic      Dua Arabic text       Large, centered, Amiri, white

  4 ---             Romanised form        Smaller, italic, gold-tinted
  Transliteration                         

  5 --- Translation English meaning       Serif, italic, rgba(255,255,255,.72)

  6 --- Source      Book + reference      Small, uppercase, gold
                    number                

  7 --- Watermark   islamicinfo.org       Bottom-right, 11px, semi-transparent
                                          --- ALWAYS present
  ----------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **🚫 BANNED**                                                         |
|                                                                       |
| The islamicinfo.org watermark MUST appear on all generated share      |
| images. It must be visible but not overpower the content. Omitting or |
| hiding the watermark is a P0 blocking issue.                          |
+-----------------------------------------------------------------------+

**11.5 Sidebar + Chip Sync Pattern**

When user clicks a sidebar item: (1) Remove .active from all .dsb-item,
(2) Add .active to clicked item, (3) Find matching .cat-chip by data-cat
attribute, (4) Remove .active from all chips, (5) Add .active to
matching chip, (6) Apply filter to dua grid. The reverse applies when a
chip is clicked --- update the sidebar active state.

**11.6 Dua Card Action Pattern**

Each dua card must carry a unique data-dua-id attribute. All 6 action
buttons read this ID to target the correct dua in localStorage and in
API calls. IDs should be stable, slugified strings (e.g.
data-dua-id=\'rabbana-atina-fid-dunya\').

**12. Out of Scope**

The following items are explicitly excluded from this PRD. They must not
be built or implied without a separate approved specification:

- User accounts, login, or registration --- bookmark/note persistence is
  localStorage-only in v1.

- Fatwa issuance or any religious verdict in article or AI-generated
  content.

- Comment system or user-generated content on any dua.

- Advertising, sponsored content, or paid placement of any kind.

- AI-generated dua text --- all duas are pre-verified from Qur\'an or
  authenticated Sunnah.

- Real-time prayer time integration in this page (belongs to
  tools.html).

- Push notifications or service workers.

- Payment processing, donations, or premium tiers.

- Multilingual content in v1 --- infrastructure may be prepared but no
  non-English duas are in scope.

- Progress locking, prerequisites, or lesson sequences --- these belong
  to islamic-studies.html.

**13. Open Questions**

  -----------------------------------------------------------------------------------
  **\#**   **Question**                        **Owner**     **Due**     **Status**
  -------- ----------------------------------- ------------- ----------- ------------
  OQ-01    What is the backend API endpoint    Engineering   Before P0   ❓ Open
           for fetching dua card data? Is it a               sprint      
           CMS endpoint, static JSON, or a                               
           database query?                                               

  OQ-02    How is the Dua of the Day selected  Product       Before P0   ❓ Open
           --- hardcoded rotation, date-based                sprint      
           random seed, or editorial schedule?                           

  OQ-03    Audio CDN: which provider hosts the Engineering   Before P1   ❓ Open
           recitation files? What is the file                sprint      
           naming convention (by dua ID or                               
           slug)?                                                        

  OQ-04    Should the share image be generated Engineering   Before P1   ❓ Open
           client-side (Canvas API) or                       sprint      
           server-side (e.g.                                             
           Puppeteer/headless)?                                          

  OQ-05    Is the AI Explain API call proxied  Engineering   Before P1   ❓ Open
           through an IslamicInfo backend, or                sprint      
           called directly from the browser?                             

  OQ-06    What is the pagination strategy for Engineering   Before P1   ❓ Open
           Load More --- cursor-based,                       sprint      
           offset-based, or infinite scroll?                             

  OQ-07    When user is on                     Product       Before      ❓ Open
           dua.html?cat={slug}, should the                   launch      
           category filter in the sidebar and                            
           chips auto-activate on page load?                             

  OQ-08    Should the 3D tilt effect (Feature  Design        Before P2   ❓ Open
           Matrix: \"3D tilt on dua cards\",                 sprint      
           P2) be disabled on touch devices                              
           and for prefers-reduced-motion                                
           users?                                                        

  OQ-09    Is there an editorial queue / CMS   Editorial     Before      ❓ Open
           for publishing new duas, or is this               launch      
           a manual static HTML update?                                  
  -----------------------------------------------------------------------------------

**14. Content Data Model**

Every dua in the library must conform to this object schema. This is the
contract between the editorial team, the API/CMS, and the front-end
renderer.

**14.1 Dua Object --- Required Fields**

  -----------------------------------------------------------------------------------
  **Field**         **Type**   **Example**               **Notes**
  ----------------- ---------- ------------------------- ----------------------------
  id                string     rabbana-atina-fid-dunya   Stable, unique, slugified.
                    (slug)                               Never changes after publish.

  arabic            string     رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً  Full Arabic text. UTF-8.
                    (Arabic)                             RTL. No diacritics stripped.

  transliteration   string     Rabbana atina fid-dunya   Latin romanisation. No
                               hasanatan                 special characters.

  translation       string     Our Lord, grant us good   English translation.
                               in this world\...         Complete sentence.

  source            object     { book: \'Qur\\\'an\',    See source object spec
                               ref: \'2:201\' }          below.

  occasion          string     general                   Must match a slug from the
                    (slug)                               14-item sidebar list.

  category          string     general                   Maps to one of the 12
                    (slug)                               category grid slugs.

  date_added        ISO date   2026-05-01                YYYY-MM-DD. Used to sort
                    string                               Latest sections.
  -----------------------------------------------------------------------------------

**14.2 Source Object**

  --------------------------------------------------------------------------------------
  **Field**     **Type**   **Example**                   **Notes**
  ------------- ---------- ----------------------------- -------------------------------
  book          string     Qur\'an                       Human-readable book name.
                                                         Displayed in .dua-source.

  ref           string     2:201                         Chapter:verse for Qur\'an, or
                                                         hadith number for collections.

  collection    string     Sahih al-Bukhari              Full collection name. Used in
                                                         AI Explain context.

  grade         string     sahih                         sahih \| hasan \| daif \| mawdu
                                                         --- maps to .grade-\* CSS
                                                         class.

  quran_link    string     quran.html?surah=2&ayah=201   Optional. Wires source dot to
                                                         Quran Explorer.

  hadith_link   string     hadith.html?ref=5743          Optional. Wires source dot to
                                                         Hadith Library.
  --------------------------------------------------------------------------------------

**14.3 Optional Fields**

  -----------------------------------------------------------------------------------------------------------------------
  **Field**       **Type**     **Example**                                                **Notes**
  --------------- ------------ ---------------------------------------------------------- -------------------------------
  audio_url       string (URL) https://cdn.islamicinfo.org/audio/duas/rabbana-atina.mp3   If absent, Play button is
                                                                                          disabled with \'Audio coming
                                                                                          soon\'.

  featured        boolean      true                                                       If true, eligible for Dua of
                                                                                          the Day rotation.

  featured_date   ISO date     2026-05-18                                                 Explicit date override for Dua
                                                                                          of the Day scheduling.

  tags            string\[\]   \[\'morning\',\'dhikr\'\]                                  Additional tags for search
                                                                                          indexing.

  related_ids     string\[\]   \[\'subhan-allah\',\'alhamdulillah\'\]                     IDs of 2-3 related duas for AI
                                                                                          Explain panel.
  -----------------------------------------------------------------------------------------------------------------------

**14.4 Occasion Slug → Category Mapping**

  ------------------------------------------------------------------------------
  **Occasion Slug** **Sidebar     **Category Grid   **Category Grid Label**
                    Label**       Slug**            
  ----------------- ------------- ----------------- ----------------------------
  morning-evening   Morning &     morning-evening   Morning & Evening
                    Evening                         

  prayer            Prayer        prayer            Prayer

  sleep             Sleep &       sleep             Sleep & Waking
                    Waking                          

  protection        Protection    protection        (sidebar only --- no
                                                    category card)

  forgiveness       Forgiveness   forgiveness       Forgiveness

  knowledge         Knowledge     knowledge         Knowledge

  illness           Illness       illness           Illness

  food-drink        Food & Drink  food-drink        Food & Drink

  travel            Travel        travel            Travel

  family            Family        family            Family & Children

  anxiety           Anxiety       anxiety           Anxiety & Hardship

  ramadan           Ramadan       ramadan           Ramadan

  hajj-umrah        Hajj & Umrah  hajj-umrah        Hajj & Umrah

  general           All Duas      (none)            General --- no specific
                                                    category card
  ------------------------------------------------------------------------------

**15. Target User Journeys**

Each audience from Section 3 has a primary journey through the page.
These journeys inform information architecture decisions and CTA
placement.

**Journey 1 --- Daily Muslim Practitioner**

  -------------------------------------------------------------------------------
  **Step**   **Action**          **Page Element** **Success Signal**
  ---------- ------------------- ---------------- -------------------------------
  1          Opens dua.html for  Hero section     Page loads quickly; Dua of the
             morning adhkar                       Day visible above fold

  2          Reads the featured  .featured-dua    Arabic + transliteration fully
             morning dua                          visible without scroll

  3          Copies Arabic to    .fd-action-btn   Clipboard filled; \'Copied!\'
             send in WhatsApp    Copy             confirmation shown

  4          Scrolls to sidebar, .dua-sidebar     Grid filters to morning duas;
             clicks \'Morning &                   active state correct
             Evening\'                            

  5          Bookmarks 3 duas    .dua-icon-btn    Gold icon state; persists on
             for tomorrow        save             page reload

  6          Streak tracker      .dsb-streak      .today square has dashed border
             shows today as                       
             in-progress                          

  7          Saves a dua; streak Any dua action   .today square fills teal-700
             marks today as                       
             .done                                
  -------------------------------------------------------------------------------

**Journey 2 --- New Muslim / Convert**

  -------------------------------------------------------------------------------
  **Step**   **Action**          **Page Element** **Success Signal**
  ---------- ------------------- ---------------- -------------------------------
  1          Searches \'how to   Hero or header   Search routes to /search.html
             pray dua\'          search           or filters grid

  2          Clicks \'Prayer\'   .cat-grid        Grid filtered to prayer duas
             category card                        

  3          Reads Arabic,       .dua-card        All 3 text layers visible and
             transliteration,                     legible at 320px+
             and translation                      

  4          Confused by Arabic  .dua-btn AI      Slide-over panel opens with
             word --- opens AI   Explain          plain-English meaning
             Explain                              

  5          Plays audio to hear .dua-btn Play    Audio plays at 1x speed; player
             pronunciation                        controls visible

  6          Adjusts to 0.75x    Speed selector   Playback slows; speed badge
             speed for learning                   updates to 0.75x

  7          Saves dua for       .dua-icon-btn    Gold save icon; dua accessible
             practice            save             in /saved
  -------------------------------------------------------------------------------

**Journey 3 --- Social Media Sharer**

  -------------------------------------------------------------------------------
  **Step**   **Action**          **Page Element** **Success Signal**
  ---------- ------------------- ---------------- -------------------------------
  1          Finds a beautiful   .dua-grid        Card renders with legible
             dua card                             Arabic and gold accents

  2          Clicks Share        .dua-btn Share   Share drawer opens

  3          Selects \'Share as  Share drawer     Canvas generates; preview shown
             Image\'             option           in drawer

  4          Downloads PNG       Download button  1080x1080 PNG downloads;
                                                  watermark visible

  5          Posts to Instagram  (outside         Watermark drives traffic back
             / WhatsApp          platform)        to islamicinfo.org
  -------------------------------------------------------------------------------

**Journey 4 --- Researcher / Educator**

  --------------------------------------------------------------------------------
  **Step**   **Action**          **Page Element**  **Success Signal**
  ---------- ------------------- ----------------- -------------------------------
  1          Looks for duas with .dua-source-dot   Green dot signals sahih grade
             Sahih source                          

  2          Clicks source       .dua-source text  Routes to hadith.html or
             reference                             quran.html with correct ref

  3          Opens AI Explain to .dua-btn AI       Source section in panel cites
             verify context      Explain           the same hadith ref

  4          Adds a note with    .dua-btn Notes    Inline editor opens; note saved
             class context                         to localStorage

  5          Returns next        Page load         Note dot indicator visible on
             session --- note is                   card header
             present                               
  --------------------------------------------------------------------------------

**16. Sprint Planning Summary**

Based on the Feature Matrix (Section 4) and Link Audit (Section 10),
work is divided into two sprints. Sprint 0 is pre-launch; Sprint 1 is
the first post-launch sprint.

**Sprint 0 --- Launch Blockers (P0)**

Target: All P0 items complete before go-live. Estimated effort: 5--7
engineering days.

  ------------------------------------------------------------------
  **\#**   **Work Item**                         **Type**   **Est.
                                                            Days**
  -------- ------------------------------------- ---------- --------
  S0-01    Wire hero CTAs --- Browse Duas        JS         0.25
           scrolls to #duas-section, By Occasion            
           to #categories                                   

  S0-02    Fix all 12 category card hrefs to     HTML       0.25
           ?cat= params                                     

  S0-03    Wire sidebar occasion link clicks --- JS         0.5
           apply filter + active state                      

  S0-04    Wire filter chips --- active state    JS         0.5
           toggle + sync with sidebar                       

  S0-05    Complete search bar live filter ---   JS         0.5
           all .dua-card elements respond to                
           input                                            

  S0-06    Implement Copy action --- clipboard   JS         0.5
           API + Copied! state on all cards and             
           featured                                         

  S0-07    Implement Save/Bookmark --- gold icon JS         0.75
           toggle + localStorage persistence                

  S0-08    Wire featured dua Previous/Next ---   JS         0.5
           cycle from a static pool for v1                  

  S0-09    Fix all footer hrefs --- IS link =    HTML       0.25
           islamic-studies.html; dua category               
           links                                            

  S0-10    Fix CTA button hrefs --- quran.html   HTML       0.25
           and hadith.html                                  

  S0-11    Add Share action --- drawer UI with 6 JS + HTML  1.5
           options (WhatsApp, X, Copy Link,                 
           Native)                                          

  S0-12    QA all 6 responsive breakpoints       QA         1.0
           (1100/900/760/700/640/440)                       
  ------------------------------------------------------------------

**Sprint 1 --- Post-Launch High Priority (P1)**

Target: All P1 items complete within 2 weeks of launch. Estimated
effort: 8--10 engineering days.

  ------------------------------------------------------------------
  **\#**   **Work Item**                         **Type**   **Est.
                                                            Days**
  -------- ------------------------------------- ---------- --------
  S1-01    Notes action --- inline editor,       JS + HTML  1.0
           500-char limit, localStorage                     
           persistence + dot indicator                      

  S1-02    AI Explain panel --- slide-over UI +  JS + HTML  2.0
           Anthropic API integration +                      
           disclaimer                                       

  S1-03    Audio playback --- inline player,     JS + HTML  1.5
           speed selector, disabled state, CDN              
           integration                                      

  S1-04    Watermarked image generation ---      JS         2.0
           Canvas API, 1080x1080, watermark                 
           enforcement                                      

  S1-05    Load More backend wiring --- API      JS + API   1.0
           call, append cards, hide on                      
           exhaustion                                       

  S1-06    Streak persistence --- localStorage   JS         0.75
           read/write, .done on dua interaction             

  S1-07    Wire dua source references to         JS         0.5
           hadith.html and quran.html                       

  S1-08    Stats count-up animation on scroll    JS         0.5
           entry                                            
  ------------------------------------------------------------------

**Sprint 2+ --- Medium Priority (P2) and Future (P3)**

  -----------------------------------------------------------------------------
  **Priority**   **Work Item**                     **Notes**
  -------------- --------------------------------- ----------------------------
  🟡 P2          3D tilt effect on dua cards       Disable for touch devices +
                                                   prefers-reduced-motion

  🟡 P2          /saved page --- bookmarked duas   Simple filtered view of
                                                   localStorage-saved duas

  🟢 P3          Multilingual content support      Infrastructure only; no
                                                   translated duas in scope

  🟢 P3          User account sync for             Depends on auth system being
                 bookmarks/notes                   built

  🟢 P3          Region-filtered dua collections   Arabic-locale versions;
                                                   different recitations
  -----------------------------------------------------------------------------

**17. QA & Testing Checklist**

Run this checklist before shipping Sprint 0 and again before Sprint 1.
Items are grouped by category. Each item must be checked in both light
and dark mode unless noted.

**17.1 Global Structure**

  ----------------------------------------------------------------------------------
  **Check**   **Item**                                        **Light**   **Dark**
  ----------- ----------------------------------------------- ----------- ----------
  \[ \]       \<html lang=\'en\' data-theme=\'light\'\>       --          --
              opening tag present                                         

  \[ \]       Fonts: Cormorant Garamond + Inter + Amiri       --          --
              preconnected and imported in this order                     

  \[ \]       :root block contains all 50+ CSS variable       --          --
              tokens per CLAUDE_v3.md §1                                  

  \[ \]       \[data-theme=\'dark\'\] sibling block present   --          --
              and unmerged from :root                                     

  \[ \]       Body has Islamic geometric background-image     --          --
              (opacity 0.04)                                              

  \[ \]       .ambient radial glow div is first child of      --          --
              \<body\>                                                    
  ----------------------------------------------------------------------------------

**17.2 Header & Navigation**

  ----------------------------------------------------------------------------------
  **Check**   **Item**                                        **Light**   **Dark**
  ----------- ----------------------------------------------- ----------- ----------
  \[ \]       All 10 nav items present in exact order         \[ \]       \[ \]

  \[ \]       \'Daily Duas\' has class=\'nav-link active\'    \[ \]       \[ \]
              with teal/gold underline                                    

  \[ \]       islamic-studies.html used --- never learn.html  \[ \]       \[ \]

  \[ \]       Search popup opens, focuses input, closes on    \[ \]       \[ \]
              Escape                                                      

  \[ \]       Theme toggle persists to localStorage key       \[ \]       \[ \]
              islamicinfo-theme                                           

  \[ \]       Hamburger visible only at ≤ 760px; mobile menu  \[ \]       \[ \]
              opens/closes correctly                                      
  ----------------------------------------------------------------------------------

**17.3 Hero & Stats**

  ----------------------------------------------------------------------------------
  **Check**   **Item**                                        **Light**   **Dark**
  ----------- ----------------------------------------------- ----------- ----------
  \[ \]       Bismillah teal gradient (light) / gold +        \[ \]       \[ \]
              drop-shadow (dark)                                          

  \[ \]       Arabic verse (Qur\'an 40:60) visible, RTL, 60%  \[ \]       \[ \]
              opacity                                                     

  \[ \]       \'Browse Duas\' scrolls to #duas-section        \[ \]       \[ \]

  \[ \]       \'By Occasion\' scrolls to #categories          \[ \]       \[ \]

  \[ \]       Stats strip: 4 cells, overlaps hero by          \[ \]       \[ \]
              margin-top: -20px                                           

  \[ \]       4 floating .geo decorators present and          \[ \]       \[ \]
              animating                                                   
  ----------------------------------------------------------------------------------

**17.4 Featured Dua Card**

  ----------------------------------------------------------------------------------
  **Check**   **Item**                                        **Light**   **Dark**
  ----------- ----------------------------------------------- ----------- ----------
  \[ \]       Dark gradient bg with gold (::before) and teal  \[ \]       \[ \]
              (::after) glows                                             

  \[ \]       Arabic text white, Amiri, RTL, line-height 2.0  \[ \]       \[ \]

  \[ \]       Transliteration italic, gold-tinted             \[ \]       \[ \]

  \[ \]       Copy --- clipboard API fires; button shows      \[ \]       --
              \'Copied!\' 1,500ms                                         

  \[ \]       Share --- drawer opens with all 6 options       \[ \]       \[ \]

  \[ \]       Save --- icon turns gold; state persists on     \[ \]       \[ \]
              reload                                                      

  \[ \]       Previous/Next cycle the dua content             \[ \]       --

  \[ \]       Arabesque divider (.aq-divider) visible below   \[ \]       \[ \]
              card                                                        
  ----------------------------------------------------------------------------------

**17.5 Category Grid & Dua Library**

  ----------------------------------------------------------------------------------
  **Check**   **Item**                                        **Light**   **Dark**
  ----------- ----------------------------------------------- ----------- ----------
  \[ \]       All 12 category cards as \<a\> with ?cat= hrefs \[ \]       \[ \]

  \[ \]       Category card hover: translateY(-4px)           \[ \]       \[ \]
              scale(1.02) --- NO shimmer                                  

  \[ \]       Sidebar visible at ≥ 900px; hidden at ≤ 900px   \[ \]       \[ \]

  \[ \]       Sidebar occasion click filters grid + sets      \[ \]       \[ \]
              active state                                                

  \[ \]       Filter chip click filters grid + syncs sidebar  \[ \]       \[ \]

  \[ \]       Search bar live-filters cards on input event    \[ \]       \[ \]

  \[ \]       Dua grid: auto-fill minmax(300px,1fr); single   \[ \]       \[ \]
              col at ≤ 640px                                              
  ----------------------------------------------------------------------------------

**17.6 Dua Cards --- Every Card**

  ----------------------------------------------------------------------------------
  **Check**   **Item**                                        **Light**   **Dark**
  ----------- ----------------------------------------------- ----------- ----------
  \[ \]       Arabic text RTL, teal-tinted bg, 22px Amiri     \[ \]       \[ \]

  \[ \]       Arabic text = var(\--teal-300) in dark          --          \[ \]

  \[ \]       Transliteration italic, gold-700                \[ \]       \[ \]

  \[ \]       Translation serif, teal left border             \[ \]       \[ \]

  \[ \]       Source green dot + reference text               \[ \]       \[ \]

  \[ \]       All 6 action buttons present: Copy Share Save   \[ \]       \[ \]
              Notes AI Explain Play                                       

  \[ \]       Card hover: translateY(-5px) scale(1.012) +     \[ \]       \[ \]
              teal glow --- NO shimmer                                    

  \[ \]       Dark mode card hover uses rgba(88,193,199,.18)  --          \[ \]
  ----------------------------------------------------------------------------------

**17.7 Share Image**

  ---------------------------------------------------------------------------------
  **Check**   **Item**                                        **Pass**   **Fail**
  ----------- ----------------------------------------------- ---------- ----------
  \[ \]       Generated image is ≥ 1080x1080px                \[ \]      \[ \]

  \[ \]       islamicinfo.org watermark visible in            \[ \]      \[ \]
              bottom-right corner                                        

  \[ \]       All 7 canvas layers present (bg, pattern,       \[ \]      \[ \]
              arabic, translit, trans, source, watermark)                

  \[ \]       Image downloadable as PNG                       \[ \]      \[ \]

  \[ \]       WhatsApp share link opens correctly on mobile   \[ \]      \[ \]
  ---------------------------------------------------------------------------------

**17.8 Responsive Breakpoints**

  ---------------------------------------------------------------------------------
  **Breakpoint**   **Expected Behaviour**                     **Pass**   **Fail**
  ---------------- ------------------------------------------ ---------- ----------
  1100px           Nav font 11.5px; footer 3-column           \[ \]      \[ \]

  900px            Sidebar hidden; nav font 10.5px; brand     \[ \]      \[ \]
                   16px                                                  

  760px            Nav hidden; hamburger shown; only          \[ \]      \[ \]
                   theme+search+hamburger in header                      

  700px            Stats strip 2x2; footer 2-column           \[ \]      \[ \]

  640px            Dua grid single column                     \[ \]      \[ \]

  440px            Footer 1-column; all cards stack           \[ \]      \[ \]

  320px            No horizontal scroll; featured dua card    \[ \]      \[ \]
                   readable                                              
  ---------------------------------------------------------------------------------

**18. Content Editorial Standards**

These standards apply to all duas published on dua.html and any child
pages. Every editorial team member and content contributor must follow
them before publishing.

**18.1 Source Citation Requirements**

- Every dua must cite a named Quranic verse or authenticated hadith
  collection.

- Anonymous internet sources, social media, and unauthenticated websites
  are not acceptable.

- Displayed format: BOOK NAME · REFERENCE (e.g. \'Qur\'an · Al-Baqarah
  2:201\' or \'Bukhari · 6306\').

- Grade indicator: sahih \| hasan \| daif --- must be set in
  source.grade field. No grade = not published.

- Source dot colour: green (sahih) --- var(\--grade-sahih: #0F6E56).

**18.2 Arabic Text Policy**

- All Arabic text uses font-family: var(\--font-arabic) (Amiri),
  direction: rtl, text-align: right.

- Diacritics (harakat) must be included in the Arabic text --- they aid
  pronunciation for learners.

- Every Arabic text block is followed immediately by its
  transliteration, then its translation.

- Transliteration uses standard academic romanisation --- no informal
  spellings.

- Arabic decorative ghost text in card backgrounds uses
  rgba(255,255,255,.15) and pointer-events:none.

**18.3 Translation Standards**

- Translations must be from recognised scholarly sources --- not
  AI-generated.

- Translation style: clear, modern English --- not archaic (\'thee\',
  \'thou\').

- Where a dua has multiple accepted translations, use the most commonly
  cited scholarly version.

- Translator credit is stored in source.collection; display is optional.

**18.4 No-Fatwa Rule**

+-----------------------------------------------------------------------+
| **⚠️ RULE**                                                           |
|                                                                       |
| Articles and dua descriptions explain, contextualise, and present the |
| dua --- they never issue rulings. The phrase \'IslamicInfo            |
| recommends\...\' or \'You must\...\' must never appear in any dua     |
| description or AI Explain output.                                     |
+-----------------------------------------------------------------------+

**18.5 Minimum Content per Dua**

  -----------------------------------------------------------------------
  **Field**          **Minimum Requirement**
  ------------------ ----------------------------------------------------
  arabic             Full text with diacritics --- no truncation

  transliteration    Complete romanisation --- no truncation

  translation        Complete English meaning --- no truncation

  source.book        Named book or Quranic surah

  source.ref         Chapter:verse or hadith number

  source.grade       Must be set --- defaults to \'hasan\' if uncertain,
                     never empty

  occasion           At least one occasion slug from the 14-item list
  -----------------------------------------------------------------------

**Changelog**

  ----------------------------------------------------------------------------------
  **Version**   **Date**     **Author**         **Changes**
  ------------- ------------ ------------------ ------------------------------------
  1.0           2026-05-18   IslamicInfo        Initial PRD --- derived from
                             Product Team       dua\_\_1\_.html mockup,
                                                Dua_Page_Functional_Document.md
                                                v1.0, and CLAUDE_v3.md v3.0

  1.1           2026-05-18   IslamicInfo        v1.1 refinements: Fixed wireframe
                             Product Team       rendering (proper code boxes). Added
                                                Baseline column to §2 goals. Split
                                                Load More feature row into
                                                UI/backend. Fixed US-014 audio ARIA
                                                (no forward ref). Added Featured Dua
                                                hover to §9 interaction spec. Fixed
                                                OQ-08 wrong US reference. Cleaned
                                                §11.3 AI prompt formatting. Added
                                                §14 Content Data Model, §15 User
                                                Journeys, §16 Sprint Planning, §17
                                                QA Checklist, §18 Editorial
                                                Standards.
  ----------------------------------------------------------------------------------
