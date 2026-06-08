**IslamicInfo.org**

Product Requirements Document

Home Page --- Complete Specification

*Version 1.1 · May 2026 · Refined Issue*

**Document Information**

  --------------- --------------------------------------------------
  **Version**     v1.1 --- Refined (6 issues resolved from v1.0
                  review)

  **Date**        May 2026

  **Status**      Ready for Engineering Review

  **Blueprint     home_fixed.html
  Ref.**          

  **Design        CLAUDE_v3.md (Design System v3.0)
  System**        

  **Functional    IslamicInfo_Functional_Specification.docx v1.0
  Spec**          

  **Author**      IslamicInfo Product Team

  **Reviewer**    Claude (Anthropic) --- PRD Review & Refinement
  --------------- --------------------------------------------------

**v1.1 Changes Summary**

- FIX-1 Feature Grid routing conflict resolved --- Cards #6 & #7
  disambiguated

- FIX-2 Wireframes added for Verify Preview and Trusted Sources sections

- FIX-3 Success metrics expanded with measurement method and owner
  columns

- FIX-4 Phase 2 / P1 priority conflict reconciled across roadmap and
  feature matrix

- FIX-5 Error states and fallback behaviours added for all live-data
  features

- FIX-6 Accessibility checklist expanded with prefers-reduced-motion and
  focus-trap

**1. Executive Summary**

This Product Requirements Document (PRD) defines the complete
functional, visual, and technical requirements for the Home Page of
IslamicInfo.org --- a multi-language digital platform dedicated to
authentic Islamic knowledge.

The home page is the primary entry point for all users, establishing
brand identity, enabling discovery of the platform\'s eight core
offerings, and delivering immediate value through daily Islamic content
(verse of the day, hadith, dua) and live prayer times.

**Product Vision**

\"A Digital Sanctuary for Authentic Islamic Knowledge\" --- the home
page must communicate trustworthiness, depth, and accessibility within
the first scroll, guiding users to the right section without friction.

**Key Success Metrics**

*Each metric includes a baseline assumption, measurement method, and
responsible owner. \[FIX-3\]*

  --------------------------------------------------------------------------------------
  **Metric**   **Target**            **Baseline      **Measurement         **Owner**
                                     Assumption**    Method**              
  ------------ --------------------- --------------- --------------------- -------------
  Bounce rate  \< 40% within 90 days No prior home   Google Analytics 4    Product /
                                     page data;      --- Engagement rate   Analytics
                                     industry avg    metric (inverse of    
                                     for Islamic     bounce)               
                                     content sites                         
                                     \~58%                                 

  Session      \> 3 pages per        Users currently GA4 --- Pages per     Product
  depth        session               landing on      session, segmented by 
                                     single-page     landing page = /      
                                     static site                           

  Feature card \> 8% per card        No prior card   Click event tracking  Engineering /
  CTR                                interaction     on each .feat-card    Analytics
                                     data            CTA; measured per     
                                                     card individually     

  Prayer       \> 60% of returning   Assumed 0% on   Custom event:         Product
  widget       visitors interact     current static  prayer_strip_viewed   
  engagement   daily                 site            per user per day;     
                                                     returning visitor     
                                                     segment only          

  Language     \> 25% of             Browser         Custom event:         Product /
  selector     non-English-browser   language data   language_changed;     i18n
  usage        users                 from GA4        denominator =         
                                     acquisition     sessions where        
                                     reports         navigator.language ≠  
                                                     en                    

  Dark mode    \> 30% within 60 days No prior theme  Custom event:         Engineering
  adoption                           data; general   theme_toggled;        
                                     web avg \~22%   persisted theme =     
                                                     dark in localStorage  
                                                     as a session flag     

  Lighthouse   ≥ 90 (Performance)    Current site    Automated Lighthouse  Engineering
  score                              unscored        CI on every deploy;   
                                                     performance budget    
                                                     enforced              
  --------------------------------------------------------------------------------------

**2. Product Overview**

**2.1 Page Purpose**

The home page of IslamicInfo.org (mapped to / and index.html) serves six
primary functions:

1.  Brand establishment --- conveys scholarly authenticity through
    visual design, Arabic typography, and curated content

2.  Content discovery --- surfaces all 8 platform sections through a
    structured feature grid

3.  Daily value delivery --- provides Qur\'anic verse, Hadith, and Dua
    of the day in the Daily Trio section

4.  Contextual utility --- displays live prayer times for the user\'s
    detected location

5.  Trust signalling --- showcases source methodology, trusted
    references, and a Verify section preview

6.  Conversion --- drives users toward the core CTAs: Start Learning,
    Explore Qur\'an, and Discover Hadith

**2.2 Page Layout Architecture**

The home page follows a top-to-bottom, section-based responsive
architecture, as defined in home_fixed.html. The visual flow from top to
bottom:

  -----------------------------------------------------------------------------------
  **\#**   **Section**    **data-screen-label**   **Primary Purpose**
  -------- -------------- ----------------------- -----------------------------------
  1        Header / Nav   Header                  Global navigation, search,
                                                  language, theme toggle

  2        Bismillah Bar  (inside Hero)           Islamic invocation --- sets
                                                  spiritual tone

  3        Hero           Hero                    Primary CTA, brand statement, Hijri
                                                  date pill

  4        Daily Trio     Daily Trio              Qur\'an verse + Hadith + Dua of the
                                                  day

  5        Prayer Times   Prayer Times            Live 5-prayer schedule for user
           Strip                                  location

  6        Feature Grid   Feature Grid            Navigation to all 8 platform
           (8 Cards)                              sections

  7        Reflection     Reflection              Inspirational Qur\'anic quote ---
                                                  visual pause

  8        Verify Preview Verify Preview          Trust signal --- demonstrates
                                                  fact-checking capability

  9        Trusted        Trusted Sources         Source credibility indicators
           Sources                                

  10       About /        About                   Platform ethos and key statistics
           Mission                                

  11       CTA Section    (before footer)         Final conversion prompt with
                                                  ecosystem promo

  12       Footer         Footer                  Site map, ecosystem links, legal
  -----------------------------------------------------------------------------------

**3. User Stories & Acceptance Criteria**

**3.1 Global Navigation & Header**

**▸ US-001 --- LANGUAGE SELECTION**

**As a non-English-speaking Muslim, I want to switch the interface to my
language so I can navigate and read content comfortably.**

**Acceptance Criteria:**

- A language selector button (displaying current language code, e.g.,
  \"EN\") is permanently visible in the header top-right area

- Clicking the button reveals a dropdown listing all 10 supported
  languages: English, Bangla, Arabic, Hindi, Urdu, Spanish, French,
  Turkish, Malay, Indonesian --- each shown with flag icon + native
  script label

- Selecting a language immediately updates all UI text (nav labels,
  button text, card titles, footer links) without a full page reload

- Qur\'anic Arabic text remains in Arabic regardless of the selected
  language

- The chosen language persists across page reloads via localStorage
  (key: \"islamicinfo-lang\")

- Arabic and Urdu selections trigger RTL layout direction (dir=\"rtl\")
  globally

- Default language is the browser\'s detected language if supported;
  otherwise English

**▸ US-002 --- DARK / LIGHT MODE TOGGLE**

**As a user browsing at night, I want to switch to dark mode so the
interface is comfortable for my eyes.**

**Acceptance Criteria:**

- A theme toggle button (sun icon in dark mode, moon icon in light mode)
  is visible in the header tools area, identified by id=\"themeBtn\"

- Clicking the button toggles between light and dark mode instantly
  using the data-theme attribute on \<html\>

- The preference is saved to localStorage under key
  \"islamicinfo-theme\"

- On page load, the saved preference is applied before first render (no
  flash of wrong theme)

- Default is light mode when no preference is stored

- In dark mode: Bismillah switches from teal gradient to gold gradient
  with drop-shadow glow (filter: drop-shadow(0 0 14px
  rgba(217,179,88,.55)))

- WCAG 2.1 AA contrast ratios are maintained in both modes

**▸ US-003 --- SEARCH**

**As a user, I want to quickly search for a verse, hadith, or topic from
any page so I can find content without navigating manually.**

**Acceptance Criteria:**

- A search icon button is visible in the header. Clicking it opens a
  search popup overlay with blur backdrop

- The input field auto-focuses when the popup opens

- Pressing Escape or clicking outside the popup closes it

- Search scope covers: Qur\'an verses (Surah name, verse number,
  keyword), Hadith collections, Duas, and Knowledge Hub articles

- Results appear in real-time or on Enter key press

- Search is language-aware: UI responses in the user\'s selected
  language; Qur\'an text always in Arabic

**▸ US-004 --- PRIMARY NAVIGATION**

**As a user, I want to navigate to any section of the site from the
header so I can reach my destination in one click.**

**Acceptance Criteria:**

- The header nav contains exactly 10 items in this order: Home \| Quran
  Explorer \| Hadith Library \| Islamic Studies \| Knowledge Hub \|
  Daily Duas \| Tools \| Habit Tracker \| Verify \| About

- The active page (Home) displays a teal-to-gold gradient underline on
  its nav link (class=\"nav-link active\")

- On screens ≤ 760px, the nav is hidden and replaced by a hamburger menu
  icon

- The hamburger opens a fullscreen mobile menu overlay
  (class=\"mobile-menu\") with all 10 nav items

**3.2 Hero Section**

**▸ US-005 --- HERO VALUE PROPOSITION**

**As a first-time visitor, I want to immediately understand what
IslamicInfo offers so I can decide whether to explore further.**

**Acceptance Criteria:**

- The hero section is the first full-width section below the header,
  with min-height: 74vh

- The Bismillah (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ) appears as the first element
  inside .hero-inner, in Arabic Amiri font

- A pulsing eyebrow pill badge (with animated gold dot) appears above
  the \<h1\>

- The \<h1\> hero title uses Cormorant Garamond at clamp(46px, 8.5vw,
  82px) with an italic gradient-text emphasis span

- A subtitle paragraph (max 2 lines) in var(\--ink-muted) appears below
  the title

- A Hijri date pill (class=\"hijri-pill\") is displayed showing the
  current Islamic calendar date

- Two CTA buttons appear: btn-primary (\"Start Learning\" →
  /islamic-studies) and btn-ghost (\"Explore Qur\'an\" → /quran)

- Four floating geometric SVG decorators (.geo .g1/.g2/.g3/.g4) animate
  continuously with geoFloat keyframe

- Animated radial gradient background (.hero-bg) breathes with bgD
  keyframe (18s, infinite)

**▸ US-006 --- HERO CTA NAVIGATION**

**As a returning user, I want the hero CTAs to take me directly to the
core learning sections so I can dive in immediately.**

**Acceptance Criteria:**

- \"Start Learning\" button routes to /islamic-studies
  (islamic-studies.html)

- \"Explore Qur\'an\" button routes to /quran (quran.html)

- Both buttons use hover transition: translateY(-3px) scale(1.03) with
  teal glow shadow

- btn-primary uses linear-gradient(135deg, var(\--teal-700),
  var(\--teal-500)) background

- btn-ghost uses translucent teal background with 0.5px teal border

**3.3 Daily Trio Section**

**▸ US-007 --- DAILY CONTENT CARDS (VERSE · HADITH · DUA)**

**As a practising Muslim, I want to see a Qur\'anic verse, hadith, and
dua each day so I can engage with Islamic content on every visit.**

**Acceptance Criteria:**

- The Daily Trio section (data-screen-label=\"Daily Trio\") contains
  exactly 3 trio-cards in a responsive grid

- Card 1 (Verse): Arabic text in Amiri font (class=\"arabic\"), English
  translation in Cormorant Garamond italic, Surah:Ayah reference in
  footer; \"Read More →\" routes to /quran

- Card 2 (Hadith): Arabic text + English translation + collector
  reference; \"Read Hadith →\" routes to /hadith

- Card 3 (Dua): Arabic + transliteration + translation; \"More Duas →\"
  routes to /dua

- Arabic text renders RTL (direction: rtl), font-size: 22px,
  line-height: 1.9

- Section eyebrow reads \"Daily Reflections\" or equivalent

- Cards display hover lift: translateY(-5px) scale(1.012) + teal glow
  ring --- NO shimmer sweep animation

**▸ US-008 --- GLOBAL CONTENT ACTIONS ON TRIO CARDS**

**As a user engaging with daily content, I want to share, bookmark,
copy, or hear the content so I can engage with it in my preferred way.**

**Acceptance Criteria:**

  ----------------------------------------------------------------------
  **Action**    **Trigger**   **Behaviour**               **Storage**
  ------------- ------------- --------------------------- --------------
  Share with    Share icon    Generates PNG with          N/A
  Image         button        content + Islamic           
                              decoration + source         
                              attribution; offers         
                              download and social share   

  Take Notes    Notes icon    Opens modal with free-form  localStorage /
                button        text input; auto-links note account
                              to content ID               

  Bookmark      Bookmark icon Toggles filled/unfilled     localStorage /
                toggle        state; note count badge     account
                              appears next to icon        

  Copy          Copy icon     Copies text + optional      Clipboard
                button        source attribution to       
                              clipboard; shows            
                              \"Copied!\" toast           
                              confirmation                

  Play (Audio)  Play icon     Inline audio player with    N/A (stream)
                button        timeline, speed control     
                              (0.75x/1x/1.5x/2x),         
                              multiple reciter options    

  AI            AI icon       Calls Claude API; displays  localStorage
  Explanation   button        explanation in modal with   cache
                              source citations; results   
                              cached to localStorage for  
                              24h                         
  ----------------------------------------------------------------------

**3.4 Prayer Times Section**

**▸ US-009 --- LIVE PRAYER TIMES DISPLAY**

**As a Muslim user, I want to see today\'s prayer times for my location
so I can plan my day around salah.**

**Acceptance Criteria:**

- The prayer strip section (data-screen-label=\"Prayer Times\") appears
  directly below the Daily Trio, with padding-top: 0

- A Bismillah Arabic inscription appears above the prayer cards
  (class=\"prayer-strip-bismillah\")

- The prayer strip header shows: detected city name + Hijri date on the
  left; \"View Full Calendar →\" link on the right

- Five prayer cards are displayed: Fajr, Dhuhr, Asr, Maghrib, Isha ---
  plus optionally Jumu\'ah on Fridays

- The grid is 6 columns on desktop, 3 columns at ≤ 768px, stacked on
  mobile

- The next upcoming prayer is highlighted with class=\"prayer next\",
  golden name text, pulsing border animation (prayer-pulse-border
  keyframe, 1.5s, fires once)

- Past prayers are displayed with opacity: 0.55 (class=\"prayer past\")

- Prayer times are shown in the user\'s local timezone

- Hovering a prayer card triggers: lift 8px + teal glow border (0 8px
  28px rgba(88,193,199,.2) in dark mode)

**3.5 Feature Grid Section**

**▸ US-010 --- PLATFORM SECTION DISCOVERY**

**As a new user, I want to see all platform sections at a glance so I
can choose where to begin my learning journey.**

**Acceptance Criteria:**

- The Feature Grid (data-screen-label=\"Feature Grid\") contains exactly
  8 feature cards in a responsive auto-fill grid

- Each card includes: section icon (SVG), section title, brief
  description, and a CTA button

- Cards are revealed with staggered .reveal / .reveal-d1 / .reveal-d2
  scroll animations (IntersectionObserver, threshold 0.12)

- Hover effect: translateY(-5px) scale(1.012) + teal glow ring; NO
  shimmer ::after sweep animation

*FIX-1 applied: Cards #6 and #7 previously both routed to
/islamic-studies. Card #6 (\"Learn with AI\") is a distinct AI-powered
study assistant entry point and routes to /islamic-studies with a
dedicated query param; Card #7 is merged into the Islamic Studies card.
The 8-card grid is corrected below.*

  -----------------------------------------------------------------------------------------------
  **Card   **Section   **Icon Theme**   **Card              **CTA      **Route**
  \#**     Title**                      Description**       Label**    
  -------- ----------- ---------------- ------------------- ---------- --------------------------
  1        Qur\'an     Open book        Browse all 114      Explore    /quran
           Explorer                     Surahs with         Qur\'an    
                                        word-by-word                   
                                        translation,                   
                                        tafsir, and audio              

  2        Hadith      Scroll           Search 12,000+      Discover   /hadith
           Library                      authenticated       Hadith     
                                        hadiths across the             
                                        six canonical                  
                                        collections                    

  3        Daily Duas  Praying hands    300+ verified       Daily Duas /dua
                                        supplications for              
                                        morning, evening,              
                                        travel, and every              
                                        occasion                       

  4        Habit       Calendar-check   Track your five     Track      /habits
           Tracker                      daily prayers,      Habits     
                                        fasting, and sunnah            
                                        practices with                 
                                        streak insights                

  5        Islamic     Gear / Compass   Prayer times, Qibla Islamic    /tools
           Tools                        compass, Hijri      Tools      
                                        calendar, and Zakat            
                                        calculator                     

  6        AI Study    Brain / Sparkle  Ask questions about Ask AI     /islamic-studies?mode=ai
           Assistant                    Qur\'an, Hadith,               
                                        and fiqh ---                   
                                        answered with                  
                                        source citations               

  7        Islamic     Graduation /     Structured learning Start      /islamic-studies
           Studies     Book             pathways from       Learning   
                                        Foundations to                 
                                        Classical                      
                                        scholarship                    

  8        Verify a    Shield / Check   Submit any Islamic  Verify Now /verify
           Claim                        claim and receive a            
                                        sourced                        
                                        authenticity                   
                                        assessment                     
  -----------------------------------------------------------------------------------------------

**▸ US-011 --- HABIT TRACKER CARD (FLAGSHIP)**

**As a user wanting to build Islamic habits, I want the Habit Tracker
card to stand out so I know it\'s a core feature.**

**Acceptance Criteria:**

- Card #4 (Habit Tracker) carries elevated styling: class=\"card
  card-featured\" with stronger border-color rgba(0,105,110,.2) and
  elev-2 box-shadow

- \"Track Habits\" button routes to /habits (habits.html)

- Card description explicitly references: daily prayers, fasting, and
  sunnah practices

**3.6 Reflection Section**

**▸ US-012 --- QUR\'ANIC REFLECTION QUOTE**

**As a user scrolling through the page, I want a moment of visual pause
with an inspirational Qur\'anic quote so I feel spiritually engaged.**

**Acceptance Criteria:**

- The Reflection section (data-screen-label=\"Reflection\") is a
  full-width, dark teal gradient banner

- Displays a single Qur\'anic verse in Arabic (Amiri font, RTL) with
  English translation below

- Source attribution (Surah name and verse number) is shown in small
  uppercase tracking

- No interactive buttons --- purely decorative and inspirational

- Section uses .reveal animation for elegant entrance on scroll

**3.7 Verify Preview Section**

**▸ US-013 --- TRUST SIGNAL VIA VERIFY PREVIEW**

**As a sceptical user, I want to see evidence of the platform\'s
fact-checking capability so I can trust the content before diving
deeper.**

**Acceptance Criteria:**

- The Verify Preview section (data-screen-label=\"Verify Preview\")
  shows a sample pre-rendered verification result embedded in the home
  page

- Displays a claim text, its authenticity grade (Sahih / Hasan / Da\'if
  badge), and a confidence dial or score

- Shows trust indicators: isnad chain (narrator names), primary evidence
  with Arabic text + English translation, and at least one
  cross-reference

- A \"Verify a Claim\" CTA button links to /verify

- The narration chain (isnad) is displayed in mini-format below the main
  result

- The section is static/pre-rendered for MVP --- no live API call on the
  home page

**3.8 Trusted Sources Section**

**▸ US-014 --- SOURCE CREDIBILITY DISPLAY**

**As a scholar or researcher, I want to see which authoritative sources
the platform references so I can assess its credibility.**

**Acceptance Criteria:**

- The Trusted Sources section (data-screen-label=\"Trusted Sources\")
  displays a grid of source pills (class=\"source-pill\")

- Each source pill shows: an icon, source name, and type label (e.g.,
  \"Sahih al-Bukhari --- Primary Hadith Collection\")

- A methodology promise bar below the grid states the no-fabrication
  commitment

- Sources displayed include canonical collections: Sahih al-Bukhari,
  Sahih Muslim, Sunan Abu Dawud, Jami\' at-Tirmidhi, Sunan an-Nasa\'i,
  Sunan Ibn Majah

**3.9 About / Mission Section**

**▸ US-015 --- PLATFORM MISSION VISIBILITY**

**As a curious user, I want to understand the platform\'s mission and
team so I can feel confident in its intentions.**

**Acceptance Criteria:**

- The About section (data-screen-label=\"About\",
  class=\"about-section\") is a dark teal gradient section

- Contains: a circular icon element, heading, 2--3 body paragraphs on
  mission, and a stats row

- Stats row: 6,236 Qur\'an Verses · 12,000+ Hadith Records · 300+
  Verified Duas · 0 Ads. Fatwas. Opinions.

- A \"Learn More About Us\" text-link CTA routes to /about

**3.10 CTA Section (Final Conversion)**

**▸ US-016 --- FINAL PAGE CTA**

**As a user who has scrolled to the bottom, I want a clear invitation to
begin so the page closes with purpose.**

**Acceptance Criteria:**

- The CTA section is the last section before the footer, using a dark
  teal gradient background (linear-gradient(135deg, #0A3A3D, #00696E,
  #062628))

- Contains: gold eyebrow badge, Cormorant Garamond heading with italic
  sub-line, supporting paragraph, and two action buttons

- btn-primary routes to /islamic-studies (\"Start Your Journey\")

- btn-white-ghost routes to /quran (\"Explore the Qur\'an\")

- A soft QuranlyAI ecosystem promo appears below, with secondary visual
  weight --- does not compete with primary CTAs

**4. Wireframe & Visual Flow Descriptions**

All wireframe descriptions below reference home_fixed.html as the
canonical visual blueprint. Token values reference CLAUDE_v3.md v3.0. Do
not deviate from the blueprint without explicit product approval.

**4.1 Header (Sticky, 60px height)**

The header is a sticky, frosted-glass bar with backdrop-filter:
blur(24px) saturate(1.6). Three-zone flex row:

- LEFT ZONE --- Brand: IslamicInfo SVG mark (34×34px, teal gradient
  paths + gold star) + wordmark. Hover: star-spin + halo-pulse
  animations.

- CENTER ZONE --- Navigation: 10 links at 12.5px Inter, 8px padding, 2px
  gap. Active link: teal-to-gold gradient underline. Hover:
  scale(1.05) + teal glow.

- RIGHT ZONE --- Tools: Search icon → Language \"EN\" → Theme toggle
  (id=\"themeBtn\") → Admin user icon → Hamburger (≤760px only)

- Search popup: 340px wide, top-right anchor, opacity 0→1 +
  translateY(-8px)→0 on .open. Contains: text input + teal Search
  button.

- Scrolled state: class=\"scrolled\" added at window.scrollY \> 16px,
  adding elev-1 box-shadow.

**4.2 Hero Section (min-height: 74vh)**

Full-width section. Visual layers back to front:

- LAYER 0 --- .hero-bg: 3 overlapping teal/gold radial ellipses,
  breathing with bgD keyframe (18s, infinite alternate)

- LAYER 1 --- Four .geo SVG decorators: g1 (72px star polygon,
  top-left), g2 (44px rotated square, top-right), g3 (60px star,
  bottom-right), g4 (38px star, bottom-left). All geoFloat keyframe,
  11--16s intervals.

- LAYER 2 --- .hero-inner (max-width 800px, centered): Bismillah →
  eyebrow badge (pulsing gold dot) → H1 → subtitle → Hijri pill → CTA
  row

H1 Typography: Cormorant Garamond, clamp(46px, 8.5vw, 82px), weight 500,
line-height 1.04, letter-spacing -0.03em. Emphasis span:
class=\"gradient-italic\" --- teal-to-gold gradient clip-text.

CTA row: btn-primary (\"Start Learning\") + btn-ghost (\"Explore
Qur\'an\"), 12px gap, centered. Both animated with fadeUp at load.

**4.3 Daily Trio Section**

80px vertical padding. 3-column card grid (auto-fill, min 280px). Each
.trio-card structure:

- HEAD: Section badge (e.g., \"Qur\'an · Surah Al-Baqarah 2:255\") +
  global action icon buttons (right-aligned, tooltip on hover)

- BODY: Arabic text (Amiri 22px, RTL) above italic English translation
  (Cormorant Garamond, 18px)

- FOOT: Border-top separator · Reference text (left) · \"Read More →\"
  teal link (right)

**4.4 Prayer Times Strip**

padding-top: 0 (visually merges with Daily Trio). .prayer-strip is a
rounded container (border-radius: 20px) with soft teal gradient and
0.5px teal border:

- HEADER ROW: Location pill (pin icon + city name) \| Hijri date \|
  \"View Full Calendar →\" link

- PRAYER GRID: 6 columns desktop / 3 at ≤768px. Each .prayer card:
  Prayer name (10px uppercase, gold if next), time (Cormorant Garamond
  22px), checkmark icon (top-right)

- NEXT PRAYER: class=\"prayer next\" --- gold name, teal glow border,
  prayer-pulse-border animation (1.5s ease-in-out, fires once on load)

- DARK MODE: card backgrounds rgba(255,255,255,.09), white border, hover
  glows cyan rgba(88,193,199,.2)

**4.5 Feature Grid (8 Cards)**

Section eyebrow + H2 + subtitle + auto-fill grid (minmax(260px, 1fr),
20px gap). Each .feat-card:

- TOP: 52×52px icon container (teal gradient, border-radius: 16px) ---
  icon scales + rotates -3deg on card hover

- MIDDLE: Card title (17px bold, ink-primary) + description (13.5px,
  ink-muted, 2--3 lines)

- BOTTOM: CTA button (btn-primary for flagship Card #4; btn-ghost for
  others)

Staggered reveal: .reveal-d1/.reveal-d2/.reveal-d3. Hover:
translateY(-5px) scale(1.012) + teal glow ring. Dark mode: cyan glow
rgba(88,193,199,.18).

**4.6 Reflection Section**

Full-width dark teal gradient banner. Centered content, no interactive
elements:

- Arabic verse: Amiri, 24px+, RTL, gold gradient or teal colour,
  text-align center

- English translation: Cormorant Garamond italic, 18px, muted white,
  centered

- Attribution: 11px uppercase, gold pill showing Surah name · Verse
  number

Enters on scroll via .reveal animation.

**4.7 Verify Preview Section \[FIX-2\]**

*FIX-2 applied: This wireframe was missing from v1.0. Added below.*

Two-column layout (approx. 60/40 split) inside a card container with
elev-3 shadow and teal border:

- LEFT COLUMN --- Claim + Result: Claim text in 16px body type →
  Authenticity grade badge (color-coded: .grade-sahih green /
  .grade-hasan olive / .grade-daif amber) → Confidence dial (SVG circle
  arc, percentage score) → Isnad chain displayed as a horizontal
  breadcrumb of narrator names in 12px muted text

- RIGHT COLUMN --- Evidence: Two .ev-card items each showing Arabic text
  (RTL, Amiri, 16px, teal) + italic English translation (13.5px,
  ink-muted) + reference label (10px uppercase, ink-subtle)

- BELOW RESULT: \"Verify a Claim\" btn-primary → /verify, centered

- LAYOUT NOTE: At ≤768px, columns stack vertically; evidence cards
  become full-width

The section is static/pre-rendered for the home page MVP. No API call is
made; sample data is hardcoded in index.html.

**4.8 Trusted Sources Section \[FIX-2\]**

*FIX-2 applied: This wireframe was missing from v1.0. Added below.*

Light surface background (var(\--surface)). Section head (eyebrow + H2 +
subtitle) followed by:

- SOURCES GRID: flex-wrap row of .source-pill elements (border-radius:
  14px, 12px×18px padding). Each pill: 32×32px icon container (teal
  bg) + source name (13.5px bold) + source type (11px muted)

- METHODOLOGY BAR: Full-width tinted block (rgba(0,105,110,.04) bg,
  0.5px teal border) containing 3 promise statements: \"Source-cited
  always\", \"No invented hadiths\", \"No anonymous fatwas\"

- HOVER: .source-pill lifts translateY(-4px) scale(1.02) with teal glow
  ring --- same card hover system, no shimmer

- Canonical sources displayed: Sahih al-Bukhari · Sahih Muslim · Sunan
  Abu Dawud · Jami\' at-Tirmidhi · Sunan an-Nasa\'i · Sunan Ibn Majah

**4.9 Footer Layout**

id=\"ii-footer\", background #062628. Two zones:

- TOP GRID (.ii-footer-top): 5-column (2fr 1fr 1fr 1fr 1fr). Col 1:
  brand + tagline + Hud 11:88 Arabic verse. Col 2: \"Featured\"
  (page-specific links). Col 3: \"Quick Access\" (all 8 nav
  destinations). Col 4: \"Our Ecosystem\" --- QuranlyAI ↗, MosqueFinder
  ↗, TravellyAI ↗, LearnSpeakAI ↗. Col 5: \"Company\" + \"Legal\"

- BOTTOM BAR: © 2026 Islamicinfo.org (left) \| \"All content
  source-verified · Privacy-first · Built with sincerity\" (right)

- RESPONSIVE: 3-col at ≤1100px · 2-col at ≤700px (brand full-width) ·
  1-col at ≤440px

**5. Feature Matrix**

*FIX-4 applied: Audio playback player is promoted to MVP (P1) in both
the matrix and the roadmap (was Phase 2 in roadmap but P1 in matrix ---
now reconciled as MVP Phase 1, Week 3--4).*

**5.1 MVP vs. Phase 2 Feature Classification**

  --------------------------------------------------------------------------
  **Feature**         **Section**   **MVP      **Phase 2**    **Priority**
                                    (Ph.1)**                  
  ------------------- ------------- ---------- -------------- --------------
  Sticky header with  Header        ✅         ---            P0
  brand + nav + tools                                         

  10-item primary     Header        ✅         ---            P0
  navigation                                                  

  Mobile hamburger    Header        ✅         ---            P0
  menu overlay                                                

  Search popup with   Header        ✅         ---            P0
  blur overlay                                                

  Dark / Light mode   Header        ✅         ---            P0
  toggle                                                      

  Language selector   Header        ✅         More languages P0
  (10 languages)                                              

  RTL layout for      Header        ✅         ---            P0
  Arabic / Urdu                                               

  Hero with           Hero          ✅         ---            P0
  Bismillah + H1 +                                            
  CTAs                                                        

  Hijri date pill     Hero          ✅ static  Live API       P1
  (static → live)                                             

  Floating geo SVG    Hero          ✅         ---            P2
  decorators                                                  

  Animated hero       Hero          ✅         ---            P2
  background                                                  

  Daily Qur\'an verse Daily Trio    ✅         Daily rotation P0
  card                                         API            

  Daily Hadith card   Daily Trio    ✅         Daily rotation P0
                                               API            

  Daily Dua card      Daily Trio    ✅         Daily rotation P0
                                               API            

  Copy action on      Global        ✅         ---            P1
  content cards       Actions                                 

  Bookmark action     Global        ✅         Account sync   P1
                      Actions                                 

  Audio playback      Global        ✅ MVP     ---            P1
  player \[FIX-4\]    Actions                                 

  Share with image    Global        ---        ✅             P2
  generation          Actions                                 

  Take Notes modal    Global        ---        ✅             P2
                      Actions                                 

  AI Explanation      Global        ---        ✅             P2
  (Claude API)        Actions                                 

  Prayer times strip  Prayer Times  ✅         ---            P0
  (static)                                                    

  Prayer times (live, Prayer Times  ---        ✅             P1
  location-aware)                                             

  8-card feature grid Feature Grid  ✅         ---            P0

  Staggered scroll    Feature Grid  ✅         ---            P2
  reveal animations                                           

  Reflection quote    Reflection    ✅         Rotating       P2
  section                                      quotes         

  Verify preview      Verify        ✅         Live           P1
  section (static)    Preview                  verification   

  Trusted sources     Sources       ✅         ---            P1
  section                                                     

  About / mission     About         ✅         Live user      P2
  section with stats                           stats          

  Final CTA section   CTA           ✅         ---            P0

  Ecosystem promo     CTA           ✅         ---            P1
  (QuranlyAI)                                                 

  Global footer       Footer        ✅         ---            P0
  (5-column)                                                  
  --------------------------------------------------------------------------

**5.2 Accessibility Feature Matrix**

*FIX-6 applied: Added prefers-reduced-motion and focus-trap requirements
missing from v1.0.*

  ------------------------------------------------------------------------
  **Requirement**   **Standard**   **Implementation**         **Status**
  ----------------- -------------- -------------------------- ------------
  Semantic HTML     WCAG 2.1 AA    \<header\>, \<nav\>,       MVP
  structure                        \<main\>, \<section\>,     
                                   \<footer\> elements        

  ARIA labels on    WCAG 2.1 AA    aria-label on all icon     MVP
  interactive                      buttons;                   
  elements                         aria-label=\"Primary       
                                   navigation\" on \<nav\>;   
                                   role=\"search\" on search  
                                   popup                      

  Color contrast    WCAG 2.1 AA    ink-primary #0F2A2C on     MVP
  --- light mode    (4.5:1)        surface #F4F7F7 = 14.8:1   
                                   ✅                         

  Color contrast    WCAG 2.1 AA    ink-primary #F5F8F8 on     MVP
  --- dark mode     (4.5:1)        surface #0A1314 = 15.3:1   
                                   ✅                         

  Keyboard          WCAG 2.1 AA    All interactive elements   MVP
  navigation                       focusable via Tab; Escape  
                                   closes search popup and    
                                   mobile menu; Enter         
                                   activates buttons          

  Screen reader     WCAG 2.1 AA    Meaningful alt text on all MVP
  optimization                     images; aria-live region   
                                   for \"Copied!\" toast;     
                                   aria-expanded on search    
                                   trigger                    

  Focus visible     WCAG 2.1 AA    Browser-default            MVP
  indicators        2.4.7          :focus-visible ring        
                                   preserved; outline not set 
                                   to none anywhere           

  RTL language      i18n           dir=\"rtl\" applied        MVP
  support                          globally for Arabic/Urdu;  
                                   Arabic content always RTL  
                                   regardless of UI language  

  Reduced motion    WCAG 2.1 AA    \@media                    MVP
  \[FIX-6\]         2.3.3          (prefers-reduced-motion:   
                                   reduce): geoFloat, bgD,    
                                   pulse, halo-pulse          
                                   animations all disabled or 
                                   reduced to opacity-only    
                                   fade                       

  Focus trap on     WCAG 2.1 AA    When .mobile-menu is open, MVP
  mobile menu       2.1.2          Tab/Shift+Tab cycle only   
  overlay \[FIX-6\]                through menu items; focus  
                                   returns to hamburger on    
                                   close                      
  ------------------------------------------------------------------------

**6. Technical Architecture & Requirements**

**6.1 Frontend Stack**

  ---------------- ---------------------------------------------------
  **HTML**         HTML5 semantic markup per home_fixed.html blueprint

  **CSS**          CSS3 custom properties (tokens from CLAUDE_v3.md
                   §1). No CSS-in-JS.

  **JavaScript**   Vanilla JS. No framework required for MVP home
                   page.

  **Fonts**        Cormorant Garamond + Inter + Amiri --- Google
                   Fonts, preconnected

  **Icons**        Font Awesome 6.5.0 via cdnjs.cloudflare.com

  **i18n**         i18next; JSON locale files: src/locales/en.json,
                   ar.json, bn.json, etc.

  **Build**        Mobile-first. No framework dependency for MVP.
  ---------------- ---------------------------------------------------

**6.2 CSS Design Token System**

All styling derives from CLAUDE_v3.md §1. Enforcement rules:

- Never use raw hex colors inline except inside SVG gradients defined in
  the blueprint

- All teal shades use \--teal-\* tokens; all gold shades use \--gold-\*
  tokens

- Dark mode tokens in separate \[data-theme=\"dark\"\] sibling block ---
  never merged with :root

- All hover transitions use var(\--ease-reverent):
  cubic-bezier(.22,1,.36,1) or var(\--ease-premium)

- NO shimmer ::after sweep animation --- forbidden per CLAUDE_v3.md
  §27.4

- \@media (prefers-reduced-motion: reduce) must disable all continuous
  animations \[FIX-6\]

**6.3 Data & Storage Requirements**

  ------------------------------------ ----------------------------------------------
  **\"islamicinfo-theme\"**            localStorage --- \"light\" \| \"dark\".
                                       Applied on \<html data-theme\> before first
                                       paint.

  **\"islamicinfo-lang\"**             localStorage --- ISO 639-1 code. Falls back to
                                       navigator.language, then \"en\".

  **\"islamicinfo-bookmarks\"**        localStorage --- JSON array of {type, id,
                                       content}. Account sync if authenticated.

  **\"islamicinfo-notes\"**            localStorage --- JSON keyed by content ID.
                                       Account sync if authenticated.

  **\"islamicinfo-ai-{contentId}\"**   localStorage --- Claude API response cache.
                                       TTL: 24h. Checked before every API call.

  **Static content (Qur\'an etc.)**    CDN --- immutable assets; Cache-Control:
                                       max-age=604800

  **Prayer times**                     Aladhan API or equivalent --- lat/lng via
                                       Geolocation API; cached per calendar day
  ------------------------------------ ----------------------------------------------

**6.4 Performance Requirements**

- First Contentful Paint (FCP) \< 1.5s on 4G

- Largest Contentful Paint (LCP) \< 2.5s (Core Web Vitals pass)

- Cumulative Layout Shift (CLS) \< 0.1

- Images lazy-loaded below the fold

- Locale JSON files cached and CDN-served after first load

- Web Workers for heavy AI explanation processing

- JavaScript bundle \< 50KB gzipped for home page

**6.5 Error States & Fallback Behaviours \[FIX-5\]**

*FIX-5 applied: The following failure scenarios were unspecified in
v1.0. Each live-data feature must implement the fallback defined below.*

  ------------------------------------------------------------------------------------------------
  **Feature**    **Failure          **User-Facing       **Technical Handling**
                 Scenario**         Fallback**          
  -------------- ------------------ ------------------- ------------------------------------------
  Prayer Times   Geolocation        Show static London  navigator.geolocation.getCurrentPosition
  API            permission denied  MWL times with a    error callback → load static default data
                 by user            \"Enable location   
                                    for accurate        
                                    times\" inline      
                                    prompt (12px, teal  
                                    link)               

  Prayer Times   API request times  Show static London  fetch() with AbortController (5s timeout);
  API            out or returns 5xx MWL times; no error catch → load static JSON fallback; report
                                    visible to user;    to Sentry
                                    silently log to     
                                    monitoring          

  Prayer Times   API returns        Show \"---\" in     Schema validation on response; partial
  API            malformed or       each prayer time    render if ≥ 1 valid prayer time exists
                 missing prayer     slot; no crash;     
                 data               console.warn with   
                                    payload             

  Hijri Date     Hijri date         Hide pill           try/catch around Hijri conversion; pill
  Pill           calculation        gracefully          element only rendered on success
                 library fails      (display:none);     
                                    Gregorian date      
                                    shown in hero       
                                    subtitle instead    

  AI Explanation Claude API call    Show \"Explanation  fetch() with 10s AbortController; show
                 fails or times out temporarily         error state in modal; do not close modal
                 (10s)              unavailable. Try    automatically
                                    again.\" inside     
                                    modal; retry button 
                                    visible             

  AI Explanation AI Explanation     Silently discard    try/catch around JSON.parse; on error:
                 cache is corrupt   cached entry; make  localStorage.removeItem(key) + refetch
                 or unparseable     a fresh API call    

  Daily Content  Fails to fetch     Show last-known     localStorage read on failure;
  Rotation API   today\'s           content from        stale-while-revalidate pattern; default
                 verse/hadith/dua   localStorage cache; static content as last resort
                                    if no cache, show a 
                                    hardcoded default   
                                    verse               

  Search         Search API         Show \"Search is    Catch fetch error in search handler;
                 unavailable        temporarily         render error message in popup results area
                                    unavailable\" below 
                                    the input; do not   
                                    prevent popup from  
                                    closing normally    

  Bookmark /     localStorage quota Show toast:         QuotaExceededError catch on
  Notes          exceeded           \"Storage full ---  localStorage.setItem; alert via toast
  localStorage                      please clear some   component
                                    bookmarks\"; do not 
                                    lose existing data  
                                    silently            
  ------------------------------------------------------------------------------------------------

**6.6 Navigation Routing Reference**

  -----------------------------------------------------------------------------------
  **Nav       **URL / Route**    **HTML File**          **Active Class Applied On**
  Label**                                               
  ----------- ------------------ ---------------------- -----------------------------
  Home        /                  index.html             index.html

  Quran       /quran             quran.html             quran.html
  Explorer                                              

  Hadith      /hadith            hadith.html            hadith.html
  Library                                               

  Islamic     /islamic-studies   islamic-studies.html   islamic-studies.html
  Studies                                               

  Knowledge   /knowledge-hub     knowledge-hub.html     knowledge-hub.html
  Hub                                                   

  Daily Duas  /dua               dua.html               dua.html

  Tools       /tools             tools.html             tools.html

  Habit       /habits            habits.html            habits.html
  Tracker                                               

  Verify      /verify            verify.html            verify.html

  About       /about             about.html             about.html
  -----------------------------------------------------------------------------------

**7. Implementation Roadmap**

*FIX-4 applied: Audio playback player moved from Phase 2 to Phase 1
(Weeks 3--4) to reconcile with its P1 priority in the Feature Matrix.*

**Phase 1 --- Foundation (Weeks 1--2)**

Goal: Fully functional, pixel-perfect home page matching home_fixed.html
in both light and dark modes.

7.  Set up project structure, build tooling, and asset pipeline

8.  Implement complete CSS token system from CLAUDE_v3.md §1 --- both
    :root and \[data-theme=\"dark\"\] blocks, and prefers-reduced-motion
    overrides \[FIX-6\]

9.  Build header: nav, search popup, language placeholder, theme toggle
    (all functional)

10. Build hero section: static Bismillah, H1 with gradient-italic,
    subtitle, Hijri pill (static), CTAs

11. Build Daily Trio: static verse, hadith, and dua cards with action
    bar (Copy + Bookmark for MVP)

12. Build Prayer Times strip: static London MWL times with correct CSS;
    error fallback implemented \[FIX-5\]

13. Build Feature Grid: 8 disambiguated cards linking to correct routes
    \[FIX-1\]

14. Build Reflection, Verify Preview (static), Trusted Sources, About,
    and CTA sections

15. Build footer verbatim from CLAUDE_v3.md §7 with correct Ecosystem
    column order

16. Implement scroll reveal (IntersectionObserver) and all staggered
    animations

17. Implement mobile menu focus-trap \[FIX-6\]

18. WCAG 2.1 AA audit including contrast, keyboard nav, reduced-motion,
    and focus-trap

**Phase 1 Extended --- Live Data & Audio (Weeks 3--4) \[FIX-4\]**

Goal: All P1 features live; home page delivering real-time content.

19. Wire language selector to i18next with all 10 locale JSON files

20. Integrate Geolocation API + Aladhan Prayer Times API; implement all
    error fallbacks \[FIX-5\]

21. Implement daily content rotation (verse, hadith, dua) from CDN or
    backend

22. Build audio player component with speed control (0.75x/1x/1.5x/2x)
    and reciter options \[FIX-4\]

23. Implement live Hijri date calculation for hero pill

24. Analytics instrumentation: GA4 events for all tracked metrics
    \[FIX-3\]

**Phase 2 --- Advanced Features (Weeks 5--6)**

25. Build Notes modal linked to content IDs

26. Integrate AI Explanation via Claude API with caching layer and error
    states \[FIX-5\]

27. Implement Share with Image generation (canvas-based PNG)

28. Daily content rotation system (scheduled API or CDN cache-bust)

29. Live verification integration for Verify Preview section

**Phase 3 --- Testing & Launch (Weeks 7--8)**

30. Cross-browser testing: Chrome, Firefox, Safari, Edge (desktop +
    mobile)

31. Device testing: iPhone SE, iPhone 15 Pro, Samsung Galaxy S24, iPad
    Pro

32. WCAG 2.1 AA audit with automated (axe-core) + manual testing

33. Performance profiling: Core Web Vitals, Lighthouse score ≥ 90

34. RTL layout testing for Arabic and Urdu with native speakers

35. All error fallback scenarios tested: API timeout, location denied,
    storage quota \[FIX-5\]

36. Deploy to production; configure CDN caching and monitoring

37. Set up GA4 custom events for all KPI metrics \[FIX-3\]

**8. Design System Compliance Checklist**

Every build must pass this checklist before shipping, per CLAUDE_v3.md
§24. v1.1 adds two items for reduced-motion and focus-trap \[FIX-6\].

  ------------------------------------------------------------------------
  **\#**   **Check**                                 **Reference**
  -------- ----------------------------------------- ---------------------
  1        \<html lang=\"en\" data-theme=\"light\"\> CLAUDE_v3.md §2
           opening tag                               

  2        Fonts preconnected and imported:          CLAUDE_v3.md §2
           Cormorant Garamond + Inter + Amiri (in    
           this exact order)                         

  3        CSS :root block with all 50+ token        CLAUDE_v3.md §1
           variables present                         

  4        Dark mode \[data-theme=\"dark\"\] sibling CLAUDE_v3.md §1
           block present and UNMERGED from :root     

  5        Navbar HTML: logo far-left, nav centered, CLAUDE_v3.md §4.3
           tools far-right                           

  6        All 10 nav items present in exact order;  CLAUDE_v3.md §4.1
           correct .active class on Home             

  7        Mobile menu HTML included; hamburger      CLAUDE_v3.md §4.7
           visible only at ≤ 760px                   

  8        Bismillah is first child of .hero-inner   CLAUDE_v3.md §5

  9        Bismillah: teal-gradient in light mode,   CLAUDE_v3.md §5.1
           gold-gradient + drop-shadow glow in dark  
           mode                                      

  10       Hero \<h1\> uses var(\--font-display)     CLAUDE_v3.md §6
           with \<span class=\"gradient-italic\"\>   
           for emphasis                              

  11       Hero has btn-primary CTA + btn-ghost      CLAUDE_v3.md §9
           secondary                                 

  12       Four floating .geo SVG decorators present CLAUDE_v3.md §6.2
           in hero (g1/g2/g3/g4)                     

  13       All hover transitions use                 CLAUDE_v3.md §13
           var(\--ease-reverent) or                  
           var(\--ease-premium)                      

  14       Cards use canonical hover:                CLAUDE_v3.md §27.4
           translateY(-5px) scale(1.012) + glow ring 
           --- NO shimmer ::after sweep              

  15       CTA section present as last section       CLAUDE_v3.md §11
           before footer                             

  16       Footer Ecosystem column order: QuranlyAI, CLAUDE_v3.md §7.4
           MosqueFinder, TravellyAI, LearnSpeakAI    

  17       Script block includes: theme toggle +     CLAUDE_v3.md §8
           search popup + mobile menu + reveal       
           observer                                  

  18       .reveal class on all section content;     CLAUDE_v3.md §12
           .reveal-d1/d2/d3 used for staggered cards 

  19       Tested in both light and dark modes ---   Func. Spec §4
           all sections, all interactive states      

  20       Mobile breakpoints verified: 1100 / 900 / CLAUDE_v3.md §23
           760 / 700 / 440px                         

  21       \@media (prefers-reduced-motion: reduce)  WCAG 2.1 AA 2.3.3
           disables geoFloat, bgD, pulse, halo-pulse 
           \[FIX-6\]                                 

  22       Focus-trap active on .mobile-menu overlay WCAG 2.1 AA 2.1.2
           when open; Tab cycles within menu only    
           \[FIX-6\]                                 
  ------------------------------------------------------------------------

**9. Out of Scope**

The following are explicitly excluded from this PRD and will be covered
in separate documents:

- Qur\'an Explorer page (quran.html) --- separate PRD

- Hadith Library page (hadith.html) --- separate PRD

- Islamic Studies page (islamic-studies.html) --- separate PRD

- Knowledge Hub page (knowledge-hub.html) --- separate PRD

- Daily Duas page (dua.html) --- separate PRD

- Islamic Tools page (tools.html) --- separate PRD

- Habit Tracker page (habits.html) --- separate PRD

- Verify page (verify.html) --- separate PRD

- User authentication and account management system

- Backend API design for content delivery

- SEO configuration and XML sitemap

- Analytics dashboard setup and reporting cadence

**10. Revision History**

  -------------------------------------------------------------------------------
  **Version**   **Date**   **Author**      **Summary of Changes**
  ------------- ---------- --------------- --------------------------------------
  v1.0          May 2026   IslamicInfo     Initial PRD --- based on
                           Product Team    home_fixed.html, Functional Spec v1.0,
                                           CLAUDE_v3.md v3.0

  v1.1          May 2026   Claude          FIX-1: Feature Grid routing
                           (Anthropic) --- disambiguated. FIX-2: Wireframes for
                           Review &        Verify Preview + Trusted Sources
                           Refinement      added. FIX-3: KPI metrics expanded
                                           with measurement methods and owners.
                                           FIX-4: Audio player priority
                                           reconciled to MVP P1. FIX-5: Error
                                           states added for all live-data
                                           features. FIX-6: Accessibility
                                           expanded with prefers-reduced-motion
                                           and focus-trap.
  -------------------------------------------------------------------------------
