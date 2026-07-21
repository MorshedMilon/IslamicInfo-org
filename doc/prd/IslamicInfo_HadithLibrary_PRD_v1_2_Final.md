**IslamicInfo.org**

Product Requirements Document

Hadith Library --- Complete Specification

*Version 1.2 · July 2026 · Data Source & Collection Count Correction*

**Document Information**

  --------------- --------------------------------------------------
  **Version**     v1.2 --- Data source & collection count corrected
                  (5 issues resolved from v1.2 review; see v1.2
                  Changes Summary)

  **Date**        July 2026

  **Status**      Ready for Engineering Build --- ONE OPEN ITEM: locked
                  blueprint not yet verified against 18-collection
                  layout, see v1.2 Changes Summary \\\"OPEN\\\" note

  **Blueprint**   hadith_module_enhanced\_\_1\_.html (canonical
                  visual source of truth)

  **Design        CLAUDE_v3.md (Design System v3.0)
  System**        

  **Functional    Hadith_Module_Functional_Document_v1.md
  Spec**          

  **Build Spec**  Hadith_Module_PRD.md (Phase 7 --- Enhanced Spec
                  v2)

  **Author**      IslamicInfo Product Team

  **Reviewer**    Claude (Anthropic) --- PRD Review & Refinement

  **Companion     Home Page PRD v1.1 · Qur\'an Explorer PRD v1.1 ·
  Docs**          IslamicInfo_Functional_Specification.docx v1.0

  **Blueprint     Build spec references hadith_v3.html as baseline;
  Note**          uploaded blueprint is
                  hadith_module_enhanced\_\_1\_.html --- the current
                  canonical version. Use enhanced file for all
                  visual reference.
  --------------- --------------------------------------------------

**v1.1 Changes Summary**

- FIX-1 Grade badge WCAG contrast computed for all 4 grades in both
  themes --- sahih and mawdu FAIL in dark mode; action items added with
  specific recommended fixes

- FIX-2 Reading path count resolved to 4 canonical paths (matching
  Hadith_Module_PRD §12.6.4); explains 3-visible-in-sidebar; defers
  \"Daily Sunnah\" as post-v1

- FIX-3 Trace View deviation note added to §4.8 --- documents 3-column
  web implementation vs 4-column Functional Spec; explains resolution

- FIX-4 Error states added for Tier 2 book list fetch and Tier 3
  deep-view fetch --- both were missing from v1.0

- FIX-5 US-H23b added --- Continue Reading / last-read restoration user
  story with full acceptance criteria

**v1.2 Changes Summary**

- FIX-6 Collection count corrected from 9 to 18 throughout the
  document (sidebar copy, grid copy, stats strip, eyebrow badge,
  DoD item 8, seed data comments, SVG motif counts). The v1.0/v1.1
  drafts were written against an earlier 9-collection plan that
  predates the source-availability research below.

- FIX-7 Data source corrected from a single Sunnah.com API (§6.1,
  §6.4 in v1.1) to the confirmed 3-provider routing: HadithAPI.com
  (9 collections, proxied through a Cloudflare Worker to keep the
  API key secret), fawazahmed0/hadith-api (1 collection, direct
  keyless CDN fetch, public domain), and AhmedBaset/hadith-json (8
  collections, direct keyless fetch pinned to a release tag, license
  not yet confirmed). Sunnah.com\'s own API was investigated and
  ruled out --- it requires a manually-requested key and is not
  self-serve.

- FIX-8 Cache layer corrected from Redis to Cloudflare KV, matching
  this project\'s actual infrastructure (not Supabase, not a
  Redis-backed host).

- FIX-9 §2.3 Hadith Collections Reference expanded to 18 rows with a
  new Source column; converted from the v1.0 fixed-width table to a
  standard markdown table for reliability. 8 of the 9 new rows have
  no per-hadith grade field at the source (AhmedBaset schema) --- see
  the §UI note under that table and the corresponding entry in §9.

- FIX-10 Two collections added beyond the original scope, per
  standing instruction to fold in anything an approved free provider
  offers: Forty Hadith Qudsi and The Forty Hadith of Shah Waliullah
  (both AhmedBaset).

- \u26a0 OPEN --- NOT YET RESOLVED: 8 of the 18 collections (all
  AhmedBaset-sourced) have no per-hadith grade field, but §8 item 21
  (\\\"no hadith displayed without grade\\\") and §10 item 8 of this
  PRD both require a grade badge with a named grader on every hadith
  card, verified across all 18 collections. These conflict with the
  source data as written. Decide: omit the badge for these 8
  collections (breaks §8 item 21 and §10 item 8 as literally worded),
  find a supplementary grading source, or accept a different
  treatment (e.g. a collection-level characterization badge instead
  of a per-hadith one). See the §UI note under §2.3.

- \u26a0 OPEN --- NOT YET RESOLVED: this PRD\'s Definition of Done (§10,
  item 3) requires every visible string to match
  hadith_module_enhanced\_\_1\_.html verbatim, including the sidebar
  and grid copy that literally says \\\"9\\\" in the locked blueprint.
  Going to 18 collections may affect the locked visual layout (grid
  row count, sidebar height, card sizing at each breakpoint) in ways
  this text-only fix cannot verify. Check the actual blueprint HTML
  before Stage 1 build starts --- this is a visual/layout decision,
  not a copy decision, and needs sign-off separately from this text
  correction.

**Build Stage Overview**

  ---------------------------------------------------------------------
  **Stage**    **Theme**          **Key Outcome**
  ------------ ------------------ -------------------------------------
  Stage 1 ---  Blueprint parity + Collections grid, sidebar, hadith
  Foundation   core reading       feed, grade filters, Isnad modal v1,
               experience         Hadith of the Day, stats strip

  Stage 2 ---  3-tier drill-down  Book list, deep-view page, narrator
  Library      --- Collection →   reliability panel, \"Ask a Question\"
  Navigation   Book → Hadith      CTA, breadcrumbs, deep links

  Stage 3 ---  Research-grade     Topic index + landing pages,
  Scholarly    depth              related-hadith graph,
  Tooling                         copy-with-attribution, illustrated
                                  motifs per collection

  Stage 4 ---  Premium            Hadith Trace View, comparison mode,
  Signature    differentiation    study view, saved reading paths,
  Features                        reading mode
  ---------------------------------------------------------------------

**1. Executive Summary**

This PRD defines complete functional, visual, and technical requirements
for the Hadith Library page of IslamicInfo.org (route /hadith, file
hadith.html). It is the platform\'s primary scholarly reference tool,
giving users trustworthy access to all major hadith collections with
authentic grading, isnad transparency, narrator reliability panels, and
a full per-hadith action suite.

The Hadith Library delivers the same rich reading experience as the
Qur\'an Explorer --- bookmarks, notes, copy-with-attribution, share
image generation, audio recitation, AI explanation, and Trace View ---
augmented by Hadith-specific features: isnad chain visualisation,
narrator reliability grading from classical scholars, cross-collection
comparison, and a three-tier library navigation (Collection → Book →
Hadith).

**Product Vision**

\"Authentic hadith. Verified sources. Beautiful scholarship.\" --- the
Hadith Library must feel like a trusted Islamic research library that
anyone can walk into, from a curious beginner who starts with the 40
Nawawi, to a scholar who needs cross-collection isnad comparison.

**Key Differentiators from Qur\'an Explorer**

  ----------------------------------------------------------------------
  **Feature**       **Qur\'an           **Hadith Library**
                    Explorer**          
  ----------------- ------------------- --------------------------------
  Primary content   Ayah (verse)        Hadith (narration)
  unit                                  

  Chain of          No isnad (divine    Full isnad with narrator
  transmission      text)               reliability grades

  Authenticity      Always Sahih        Grade system: Sahih · Hasan ·
  system            (Qur\'an)           Da\'if · Mawdu\'

  Colour annotation Tajweed 6-rule      Narrator reliability: Green /
                    colour coding       Gold / Red / Grey

  Scholar grading   Not applicable      Named graders: Ibn Hajar,
                                        al-Dhahabi, al-Mizzi

  Cross-reference   Multi-translation   Cross-collection hadith
  mode              comparison          comparison (matn + isnad)

  Navigation        Surah list → verse  3-tier: Collection → Book →
  structure         feed                Hadith

  Verify            Not primary         \"Verify a Source\" + \"Ask a
  integration                           Question\" --- core CTAs
  ----------------------------------------------------------------------

**Key Success Metrics**

  ---------------------------------------------------------------------------------
  **Metric**       **Target**   **Measurement Method**                **Owner**
  ---------------- ------------ ------------------------------------- -------------
  Daily Hadith of  \> 35% of    Custom event: hotd_interacted         Product
  the Day          page         (bookmark/share/isnad) per session    
  engagement       sessions                                           

  Isnad panel open \> 25% of    Custom event: isnad_opened per hadith Product
  rate             hadith card  card rendered                         
                   views                                              

  Narrator         \> 15% of    Custom event: narrator_panel_opened   Product
  reliability      isnad opens  per isnad open                        
  panel clicks                                                        

  3-tier           \> 40% reach GA4 --- pageview events on            Product
  navigation depth Tier 3       /hadith/\[col\]/\[book\]/\[hadith\]   

  AI Explanation   \> 12% of    Custom event: ai_explain_opened per   Product / AI
  engagement       sessions     session                               

  Bookmark / Note  \> 6% of     Custom event: bookmark_saved or       Product
  creation rate    sessions     note_saved per session                

  Trace View       \> 8% of     Custom event: trace_view_opened per   Product
  activation       deep-view    deep-view session                     
                   pages                                              

  Reading path     \> 20% of    Custom event: reading_path_progress   Product
  engagement       returning    per session                           
                   users                                              

  Copy with        \> 5% of     Custom event: copy_with_citation per  Product
  attribution use  hadith card  hadith card                           
                   views                                              

  Lighthouse       ≥ 90 on      Automated Lighthouse CI on every      Engineering
  Performance      deep-view    deploy                                
  score            page                                               
  ---------------------------------------------------------------------------------

**2. Page Overview & Visual Flow**

**2.1 Page Anatomy (as defined in hadith_module_enhanced\_\_1\_.html)**

The page uses a two-column layout: persistent left sidebar (collections,
scholars, reading paths, CTAs) + main content area. On mobile the
sidebar collapses to a bottom sheet.

  --------------------------------------------------------------------------------
  **\#**   **Zone /      **HTML marker**        **Description**
           Component**                          
  -------- ------------- ---------------------- ----------------------------------
  1        Navbar        \<!\-- GLOBAL NAVBAR   Sticky; \"Hadith Library\" carries
                         \--\>                  class=\"nav-link active\"

  2        Hero          \<!\-- HERO (Stage 1)  Bismillah + H1 \"Explore Authentic
                         \--\>                  Hadith with Scholarly
                                                Precision\" + subtitle + search
                                                pill (Arabic/English, voice input,
                                                scope filters)

  3        Layout Shell  \<div                  Two-column flex: aside.sidebar
                         class=\"layout\"\>     (left) + main.main (right)

  3a       ↳ Sidebar     \<aside                HADITH COLLECTIONS (18 rows) ·
                         class=\"sidebar\"\>    CLASSICAL SCHOLARS · READING PATHS
                                                · Browse · Verify a Source CTA ·
                                                Ask a Question CTA

  3b       ↳ Main        \<main                 Stats strip + Hadith of the Day +
           Content       class=\"main\"\>       Collections grid + Topics + Hadith
                                                feed (stage-gated sections below)

  4        Stats Strip   .stats-strip           4 metrics: 61K+ Total Hadiths · 9
                                                Major Collections · 12+ Languages
                                                · 100% Source-Verified

  5        Hadith of the .daily-strip           Arabic matn (large, centred) +
           Day                                  English translation + reference +
                                                grade · Actions: Bookmark · Share
                                                · View Full Isnad

  6        Collections   .collections-grid      6 visible collection cards in the
           Grid                                 mockup (all 9 in production);
                                                filter tabs: All · Kutub al-Sittah
                                                · Musnad · Selected

  7        Topics Strip  .topics-grid           14 topic chips: Faith & Belief ·
                                                Prayer · Zakat · Fasting · Hajj ·
                                                Purification · Knowledge · Ethics
                                                · Family · Supplications ·
                                                Afterlife · Trade · Death ·
                                                Governance

  8        Hadith Feed   .hadith-list           Ordered hadith cards for the
                                                active collection/book. Grade
                                                filter pills (All · Sahih · Hasan
                                                · Da\'if) above feed.

  ---      Breadcrumb    .breadcrumb            Appears on collection/book/hadith
           (Tier 2+)                            routes: Hadith › Collection › Book
                                                › Hadith N

  ---      Books Grid    Stage 2 books grid     3-column grid of book cards; each:
           (Tier 2)                             book number chip + Arabic +
                                                English name + hadith count

  ---      Narrator      .narrator-panel-name   Scholar gradings table: Ibn Hajar
           Panel         area                   · al-Dhahabi · al-Mizzi --- slides
                                                open below narrator row in isnad

  ---      Related       .related-grid          4-card grid (Stage 3):
           Hadiths                              thematically related · same
                                                narrator · parallel narration ·
                                                scholar commentary

  ---      Reading Path  .reading-path-strip    Stage 4: active reading path
           Strip                                banner --- \"Reading: Kutub
                                                al-Sittah basics · Hadith 12 of
                                                50\" + Prev/Next nav

  ---      Study Mode    .study-mode-banner     Stage 4: green dot \"Study Mode
           Banner                               Active\" top banner + Exit button

  ---      Comparison    .compare-header        Stage 4: selected hadiths as
           Mode Header                          removable chips + \"Add Hadith\"
                                                button

  ---      Trace View    .trace-layout          Stage 4: 3-column grid (Matn ·
           Layout                               Isnad · Scholarly Grading),
                                                full-screen on production

  9        CTA Band      .cta-band              \"✦ Strengthen Your Knowledge\"
                                                dark teal gradient CTA section

  10       Footer        id=\"ii-footer\"       Global 5-column footer per
                                                CLAUDE_v3.md §7
  --------------------------------------------------------------------------------

**2.2 Route Map**

  ------------------------------------------------------------------------------------------------------
  **Route**                                          **Stage**   **Purpose**
  -------------------------------------------------- ----------- ---------------------------------------
  /hadith                                            Stage 1     Collections index grid + sidebar +
                                                                 hadith feed preview

  /hadith/\[collection\]                             Stage 2     Books list (Tier 2) for one collection

  /hadith/\[collection\]/\[book\]                    Stage 2     Hadith list within a book (Tier 3a ---
                                                                 list view)

  /hadith/\[collection\]/\[book\]/\[hadith\]         Stage 2     Deep-view single hadith page (Tier 3b
                                                                 --- focus view)

  /hadith/topics                                     Stage 3     Topic index landing page (16 topic
                                                                 cards)

  /hadith/topics/\[topic\]                           Stage 3     Topic landing: summary + key
                                                                 narrations + study order

  /hadith/compare                                    Stage 4     Side-by-side comparison mode (up to 3
                                                                 hadiths)

  /hadith/trace/\[collection\]/\[book\]/\[hadith\]   Stage 4     Hadith Trace View --- 3-column
                                                                 signature research layout
  ------------------------------------------------------------------------------------------------------

**2.3 Hadith Collections Reference**

*Updated v1.2 — expanded from 9 to 18 collections; Source column added to reflect the confirmed 3-provider routing (replaces the v1.0/v1.1 assumption of a single Sunnah.com API — see v1.2 Changes Summary). Hadith counts for the 9 new rows are commonly-cited classical figures pending verification against the live dataset at build time — do not treat as final; the Stats Strip total must be computed dynamically from source data, not hardcoded.*

| Collection | Arabic Name | Compiler | Hadiths | Grade | Source (API) |
|---|---|---|---|---|---|
| Sahih al-Bukhari | صحيح البخاري | Imam al-Bukhari · 810–870 CE | 7,563 | Sahih — Highest Standard | HadithAPI.com |
| Sahih Muslim | صحيح مسلم | Imam Muslim ibn al-Hajjaj · 815–875 CE | 5,362 | Sahih | HadithAPI.com |
| Sunan Abu Dawud | سنن أبي داود | Imam Abu Dawud Sulayman · 817–889 CE | 5,274 | Mixed Grades | HadithAPI.com |
| Jami' at-Tirmidhi | جامع الترمذي | Imam Muhammad at-Tirmidhi · 824–892 CE | 3,956 | Mixed Grades | HadithAPI.com |
| Sunan an-Nasa'i | سنن النسائي | Imam Ahmad an-Nasa'i · 829–915 CE | 5,748 | Mixed Grades | HadithAPI.com |
| Sunan Ibn Majah | سنن ابن ماجه | Ibn Majah al-Qazwini · 824–887 CE | 4,341 | Mixed Grades | HadithAPI.com |
| Musnad Ahmad | مسند أحمد | Imam Ahmad ibn Hanbal · 780–855 CE | 27,647 | Mixed Grades | HadithAPI.com |
| Mishkat al-Masabih | مشكاة المصابيح | al-Khatib at-Tabrizi (rev. of al-Baghawi) · 14th c. CE | ~5,900 (edition-dependent — verify at build) | Mixed Grades | HadithAPI.com |
| Al-Silsilah al-Sahihah | السلسلة الصحيحة | Muhammad Nasiruddin al-Albani · 20th c. CE | Multi-volume — verify at build | Sahih (by definition of the series) | HadithAPI.com |
| Riyad as-Saliheen | رياض الصالحين | Imam an-Nawawi · 1233–1277 CE | 1,896 | Sahih / Hasan | AhmedBaset — **ungraded field, see §UI note below** |
| 40 Hadith Nawawi | الأربعون النووية | Imam an-Nawawi · 1233–1277 CE | 42 | Sahih / Hasan | fawazahmed0 |
| Bulugh al-Maram | بلوغ المرام | Ibn Hajar al-Asqalani · 1372–1449 CE | ~1,596 | Mixed Grades | AhmedBaset — ungraded field |
| Muwatta Imam Malik | موطأ مالك | Imam Malik ibn Anas · 711–795 CE | ~1,720 | Sahih / Hasan | AhmedBaset — ungraded field |
| Al-Adab al-Mufrad | الأدب المفرد | Imam al-Bukhari · 810–870 CE | ~1,322 | Mixed Grades | AhmedBaset — ungraded field |
| Shamail Muhammadiyah | الشمائل المحمدية | Imam at-Tirmidhi · 824–892 CE | ~397 | Mixed Grades | AhmedBaset — ungraded field |
| Sunan al-Darimi | سنن الدارمي | Imam ad-Darimi · 797–869 CE | ~3,367 (edition-dependent) | Mixed Grades | AhmedBaset — ungraded field |
| Forty Hadith Qudsi | الأربعون القدسية | Modern anthology (Ibrahim & Johnson-Davies) drawing on classical sources | 40 | Mixed (per source hadith) | AhmedBaset — ungraded field |
| The Forty Hadith of Shah Waliullah | أربعون الشاه ولي الله | Shah Waliullah Dihlawi · 1703–1762 CE | 40 | Mixed | AhmedBaset — ungraded field |

**§UI note:** the 8 AhmedBaset-sourced rows above have no `grade` field in the source data (confirmed from their published schema). The "Grade" values shown in this table are the classical/general characterization of each collection, not per-hadith machine-readable grades — do not render a per-hadith grade badge for these 8 collections unless a supplementary grading source is added later. This is still an open decision (see the v1.2 Changes Summary near the top of this document) — resolve before Stage 1 ships.


**3. User Stories & Acceptance Criteria**

**3.1 Stage 1 --- Foundation**

**▸ US-H01 --- COLLECTIONS GRID & SIDEBAR**

**As a new user, I want to see all major hadith collections so I can
choose where to begin my study.**

**Acceptance Criteria:**

- Sidebar lists all 18 collections with name + hadith count badge
  (caps-xs chip in teal-700 on teal-50 bg). Active collection carries
  class=\"sidebar-item active\" with left teal border.

- Sidebar also lists: CLASSICAL SCHOLARS (Ibn Kathir, al-Qurtubi, Ibn
  Hajar al-\'Asqalani, Imam an-Nawawi) · READING PATHS (progress rings
  --- see US-H22) · Browse section · Verify a Source CTA · Ask a
  Question CTA

- Collections grid renders all 18 collection cards. Each card: card-motif
  (emoji or SVG) · Arabic name (font-arabic, gold-700) · compiler name +
  lifespan · card-divider · stats (hadiths count, books, compilation
  period) · authenticity badge (grade dot + grade label) · \"Browse →\"
  link

- Sahih al-Bukhari card carries class=\"collection-card featured\" with
  a \"✦ Most Authentic\" featured seal and elev-3 shadow treatment

- Filter tabs above grid: All · Kutub al-Sittah · Musnad · Selected ---
  using .chip class; active tab = teal-700 bg. Clicking narrows the
  visible grid in-place (no route change).

- All card hovers: translateY(-5px) scale(1.012) + teal glow ring. No
  shimmer ::after sweep --- forbidden per CLAUDE_v3.md §27.4

- \"Browse →\" affordance on each card: gold colour on hover; routes to
  /hadith/\[collection\] (Tier 2) in Stage 2

**▸ US-H02 --- STATS STRIP**

**As a visitor, I want to see the scale of the hadith collection so I
understand the platform\'s depth.**

**Acceptance Criteria:**

- Stats strip (.stats-strip) renders 4 metrics verbatim from blueprint:
  [TOTAL — sum live from source data at build time, do not hardcode] Total Hadiths · 18 Major Collections · 12+ Languages · 100%
  Source-Verified

- 4-column grid on ≥1100px, 2-column at ≤700px, 1-column at ≤440px.
  Dividers between columns.

- Stat numbers use font-display (Cormorant Garamond), stat labels use
  Inter 700 caps-xs

- Enters with .fade-up animation on scroll reveal (IntersectionObserver,
  threshold 0.12)

**▸ US-H03 --- HADITH OF THE DAY**

**As a daily visitor, I want to see a featured hadith so the page
delivers immediate value before I choose a collection.**

**Acceptance Criteria:**

- Daily strip (.daily-strip) renders above the collections grid:
  \"Hadith of the Day\" eyebrow label · large centred Arabic matn
  (font-arabic, \~24px, RTL) · English translation · reference line
  (collection · hadith number · narrator · grade)

- Three action buttons: Bookmark · Share · \"View Full Isnad\"
  (gold-toned, primary)

- Strip uses card-featured treatment: \--gold-aura box-shadow (0 0 0 1px
  rgba(197,160,89,.22), 0 8px 32px rgba(197,160,89,.18))

- \"View Full Isnad\" button routes to deep-view page (Tier 3b) for that
  hadith in Stage 2; in Stage 1 opens the Isnad modal v1

- Rotates daily from backend schedule or static /data/hadith-of-day.json
  keyed by day-of-year

- Skeleton shimmer during fetch; static fallback (Bukhari #1
  \"Intentions hadith\") on error

**▸ US-H04 --- HADITH FEED & GRADE FILTER**

**As a reader, I want to browse hadith cards and filter by authenticity
grade so I can focus on verified content.**

**Acceptance Criteria:**

- Hadith feed (.hadith-list) renders hadith cards in the active
  collection/book. Default: Sahih al-Bukhari, Book 1 --- Revelation.

- Each hadith card structure: 4px left teal bar (.hadith-teal-bar) ·
  header (hadith number badge + grade badge + action buttons) · Arabic
  matn (font-arabic, RTL, line-height 2.05) · translation block
  (narrator attribution line + \"┃\" teal vertical bar marker +
  translation text) · footer (reference string + \"View Isnad\" +
  \"Listen\" + \"Open Full View\")

- Grade badge: .grade-sahih (green #0F6E56) / .grade-hasan (olive
  #5D8A3A) / .grade-daif (amber #A86932). Every badge shows the named
  grader (e.g. \"Sahih · Darussalam\").

- Grade filter pills (All Grades · Sahih · Hasan · Da\'if) above feed.
  Active pill = teal-700 bg. Filtering is in-place (no route change).

- \"Load more hadiths\" button at bottom of feed --- loads next page of
  results without full reload

- Card action buttons: Bookmark (🔖) · Share (↗) · Copy (📋). All
  present in mockup; wired in Stages 2--3.

**▸ US-H05 --- ISNAD CHAIN MODAL V1**

**As a student, I want to see the chain of narrators for any hadith so I
can understand how it was transmitted.**

**Acceptance Criteria:**

- \"View Isnad\" footer button toggles the isnad panel below the hadith
  card (id=\"isnad-{N}\", class=\"isnad-preview\")

- Panel label: \"Isnad Chain --- Transmission from Prophet ﷺ to
  Compiler\"

- Each narrator shown as a node: avatar circle (Arabic initials,
  colour-coded by role: prophet / companion / tabii / compiler) · full
  name · lifespan and era · reliability dot (green = Thiqah, gold =
  Saduq, red = Da\'if)

- Connector: 1px dashed rgba(0,105,110,.25) vertical line between nodes.
  Chain ordering: Prophet ﷺ → Companion → Tabi\'i → ... → Compiler

- In Stage 1: reliability dots only (no text panel). Narrator text panel
  is Stage 2.

**▸ US-H06 --- TOPICS STRIP**

**As a reader, I want to browse by topic so I can find hadiths relevant
to my area of study.**

**Acceptance Criteria:**

- Topics grid (.topics-grid) shows 14 topic chips verbatim from
  blueprint: Faith & Belief (featured-topic class, teal bg) · Prayer
  (Salah) · Charity (Zakat) · Fasting (Sawm) · Hajj & \'Umrah ·
  Purification · Knowledge & Wisdom · Ethics & Character · Family &
  Marriage · Supplications · Afterlife & Judgment · Trade & Finance ·
  Death & Burial · Governance & Justice

- In Stage 1: clicking a chip filters the visible hadith feed by topic
  (in-place, no route change)

- In Stage 3: clicking routes to /hadith/topics/\[topic\] landing page

- \"View all topics →\" link to the right of the section header routes
  to /hadith/topics (Stage 3)

**▸ US-H07 --- HERO SEARCH**

**As a user, I want to search across all hadith collections so I can
find any narration by text, narrator, or topic.**

**Acceptance Criteria:**

- Search pill in hero (.search-pill): glass pill input (backdrop-filter
  blur, border-radius 999px) with microphone icon (voice input) and
  scope selector (All · Hadith · Qur\'an · Dua · Verify ✦)

- Results show: hadith reference (collection + number) · Arabic snippet
  with matching text highlighted in \<mark\> · English snippet with
  matching text highlighted · grade badge · \"Open →\" button →
  deep-view page

- Hadith-scoped search also available at /hadith route via search pill
  default scope

- Compact sidebar search: filters the visible collection list and book
  list in real time

**3.2 Stage 2 --- Library Navigation**

**▸ US-H08 --- THREE-TIER NAVIGATION (TIER 2: BOOK LIST)**

**As a reader, I want to browse books within a collection so I can
navigate the hadith corpus like a real library.**

**Acceptance Criteria:**

- \"Browse →\" on any collection card routes to /hadith/\[collection\]
  (Tier 2)

- Tier 2 page: collection header strip (display-lg collection name +
  Arabic name in font-arabic gold-700 + compiler lifespan + \"↩ All
  Collections\" breadcrumb button) + books grid (3-col ≥1100px, 2-col
  ≤900px, 1-col ≤700px)

- Each book card: book number chip (font-mono, gold-50 bg, gold border)
  · English book name (Inter 600, 15px) · Arabic book name (font-arabic,
  13px, gold-700) · hadith count badge (caps-xs) · \"Browse hadiths →\"
  link → Tier 3a

- Book card hover: translateY(-4px) scale(1.012) + elev-3 shadow
  (matching mockup inline style)

**▸ US-H09 --- THREE-TIER NAVIGATION (TIER 3A: HADITH LIST IN BOOK)**

**As a reader, I want to read all hadiths within a specific book so I
can study a topic systematically.**

**Acceptance Criteria:**

- Route /hadith/\[collection\]/\[book\] renders the hadith feed scoped
  to that book. Header strip: \"Collection › Book name · N hadiths\"
  (sticky on scroll)

- Each hadith card now has an \"Open →\" affordance in the action row
  that routes to Tier 3b deep-view

- Grade filter pills remain available. Prev/Next book navigation at
  bottom.

**▸ US-H10 --- DEEP-VIEW PAGE (TIER 3B: SINGLE HADITH)**

**As a scholar, I want a dedicated page for one hadith showing all
available information so I can study it comprehensively.**

**Acceptance Criteria:**

- Route /hadith/\[collection\]/\[book\]/\[hadith\] renders single-hadith
  focus page. Layout per §4.7 wireframe.

- Blocks rendered (all in .card containers): Hadith body (number chip +
  grade badge + Arabic matn + translation) · Isnad chain (inline, not
  modal) · Alternate gradings panel (table: scholar + grade text +
  source) · Translations tabs (EN · UR · FR · ID · TR ...) · Topics
  chips · Previous / Next hadith navigation

- Alternate gradings panel shows: grade text from named scholar (e.g.
  \"al-Albani: Sahih\", \"Darussalam: Sahih\", \"Shu\'ayb al-Arna\'ut:
  Sahih\") with source citation

- Previous / Next links: \"← Hadith N-1\" and \"Hadith N+1 →\" routing
  within the same book

- \[📋 Copy with citation\] button in page header (Stage 3 wiring,
  placeholder in Stage 2)

**▸ US-H11 --- NARRATOR RELIABILITY PANEL (ISNAD V2)**

**As a student of hadith sciences, I want to see scholar gradings for
each narrator so I can assess chain reliability.**

**Acceptance Criteria:**

- Each narrator row in the isnad chain is tappable/clickable. Click
  expands an inline panel below the narrator row.

- Panel (.narrator-panel) contains: avatar (Arabic initials,
  role-colour) · full name (Inter 600, 15px) · kunya + nasab (italic,
  13px, ink-muted) · lifespan + place · reliability grade badge (Thiqah
  green / Saduq gold / Da\'if red / Unknown grey) · scholar gradings
  table

- Scholar gradings table: 3 rows minimum --- Ibn Hajar al-\'Asqalani +
  al-Dhahabi + al-Mizzi. Columns: scholar name (Inter 600) · grade text
  (e.g. \"Thiqah thabt\") · source citation (font-mono, 11px,
  ink-subtle) per mockup: \"Taqrib at-Tahdhib, no. 4686\"

- All narrator reliability text must trace to a named classical work. No
  fabricated gradings --- every reliability text cited to source per
  Functional Doc §20 rule 5.

- Panel container: nested .card with inner-light shadow

**▸ US-H12 --- \"ASK A QUESTION\" & \"VERIFY A SOURCE\" SIDEBAR CTAS**

**As a user questioning a hadith\'s authenticity, I want one-click
access to the verification engine directly from the hadith page.**

**Acceptance Criteria:**

- \"Verify a Source\" sidebar CTA: .sidebar-cta with \"✦\" gold icon +
  \"Verify a Source\" label + subtitle + btn-glass button. Located at
  bottom of sidebar. Routes to /verify.

- \"Ask a Question\" sidebar CTA: second .sidebar-cta below \"Verify a
  Source\", with \"?\" gold icon. Opens verify engine with
  currently-viewed hadith pre-filled (matn + reference) as the claim
  under review.

- On Tier 3 routes (deep-view): pre-fills the specific hadith in focus
  into the verify engine input

- On collections grid (Tier 1): opens verify engine empty with input
  focused

**▸ US-H13 --- BREADCRUMBS & DEEP LINKS**

**As a user navigating deep into a collection, I want breadcrumbs so I
can always find my way back.**

**Acceptance Criteria:**

- Breadcrumb strip (.breadcrumb) appears below sticky header on all Tier
  2 + Tier 3 routes: \"Hadith › Sahih al-Bukhari › Book of Revelation ›
  Hadith 1\"

- Style: caps-xs Inter, ink-muted, gold-700 \"›\" separators. Each
  segment is a link back to that tier.

- Mobile (≤700px): collapse middle segments with \"...\" ellipsis

- Every hadith has a canonical URL:
  /hadith/\[collection\]/\[book\]/\[hadith\]. Sharing this URL takes the
  recipient directly to that hadith, highlighted with a gold pulse ring
  animation (2-iteration, 1.8s ease-reverent)

- prefers-reduced-motion: skip animation, apply gold border-color
  highlight only

**3.3 Stage 3 --- Scholarly Tooling**

**▸ US-H14 --- TOPIC INDEX & LANDING PAGES**

**As a student, I want to find hadiths by topic so I can study a subject
systematically across all collections.**

**Acceptance Criteria:**

- Route /hadith/topics renders a topic index page: 16 topic cards in a
  grid (same card vocabulary as collection cards). Each topic card: icon
  (existing vocabulary) · topic name (Inter 600, 16px) · hadith count
  across all collections · top 3 contributing collection chips (caps-xs)
  · \"Study this topic →\" link

- Route /hadith/topics/\[topic\] renders a topic landing page: topic
  header (display-lg + 2-line scholarly italic summary) · Key Narrations
  strip (3 .card-featured hadith cards) · Study order (numbered list:
  teal circle with serif numeral + hadith preview + grade badge + \"Open
  →\") · right rail: related topics chips · filtered hadith feed for
  that topic

- From Stage 3 onward: clicking a topic chip in the main feed routes to
  /hadith/topics/\[topic\] instead of filtering in-place

**▸ US-H15 --- RELATED-HADITH GRAPH**

**As a researcher, I want to see related narrations so I can understand
how a hadith fits into the wider corpus.**

**Acceptance Criteria:**

- Related hadiths section (.related-grid) appears on every Tier 3b
  deep-view page, below Topics chips

- 4-card grid (2-col ≥900px, 1-col below). Card types shown in the
  mockup: \"Thematically related\" · \"Same narrator\" · \"Parallel
  narration\" · \"Scholar commentary\". Each card: relation label
  (italic, gold-700) · 2-line matn preview · reference (📖 collection +
  number) · arrow button → that hadith\'s deep-view page

- Filter chips above grid: \"by topic · by narrator · by collection\"
  --- .chip class, filter the displayed related cards

**▸ US-H16 --- COPY WITH ATTRIBUTION**

**As a student writing a paper, I want to copy a hadith with full
scholarly citation so my work is properly sourced.**

**Acceptance Criteria:**

- \"Copy with Attribution\" button in the hadith card action row and
  \[📋\] on the deep-view header. Produces this exact payload format:

- \"{translation text}\" --- Narrated by {primary narrator}.
  {Collection} · Book {N} · Hadith {N}. Grade: {grade} ({grader},
  {year}). Source:
  https://islamicinfo.org/hadith/{collection}/{book}/{hadith}

- Arabic-only copy option also available: copies only the Arabic matn
  text

- Toast: \"Copied with citation ✦\" --- 2.5s timeout, slides from
  bottom, existing toast component

- Attribution must always be included. Stripping attribution is not
  permitted per Functional Doc §20 rule 4.

**▸ US-H17 --- ILLUSTRATED MOTIFS PER COLLECTION**

**As a user, I want each collection to have a distinctive visual
identity so I can recognise collections at a glance.**

**Acceptance Criteria:**

- Each of the 18 collection cards gains a custom illustrated motif SVG
  (64×64px, inline SVG, monochrome line art with gold-500 accent,
  readable at 32×32)

- Placed at top-right of each collection card, opposite the compiler
  name

- Format: 8-pointed star variants, arabesque corners, calligraphic
  ligatures. No fills beyond gold-500 accent. Paths use currentColor for
  stroke.

- Dark mode: gold accent reads correctly against dark surface (verified
  in \[data-theme=\"dark\"\])

- SVG files committed to
  /packages/ui/src/illustrations/hadith/{collection-slug}.svg (18 total)

**3.4 Stage 4 --- Signature Features**

**▸ US-H18 --- HADITH TRACE VIEW**

**As a scholar, I want a single-hadith focused research environment
showing matn, isnad, and scholarly grading simultaneously so I can
conduct deep research in one place.**

**Acceptance Criteria:**

- \"View as Trace →\" button on any deep-view page routes to
  /hadith/trace/\[collection\]/\[book\]/\[hadith\]

- Trace View is also a full-screen overlay accessible without route
  change via a button in the hadith card action row

- Layout: 3-column grid on ≥1300px (stacks on smaller widths). Per §4.9
  wireframe.

- LEFT COLUMN --- Matn: full Arabic matn (font-arabic, 18px+, RTL) ·
  \"┃\" teal-bar translation · topic chips · related Qur\'anic verses if
  any

- CENTRE COLUMN --- Isnad Chain: full vertical chain with clickable
  narrators. Clicking a narrator → reliability panel slides over matn
  from inline-start. Narrator details per US-H11. Connector: 1px dashed
  rgba(0,105,110,.25).

- RIGHT COLUMN --- Scholarly Grading: grade block (grade-sahih green bg,
  grade text, scholar commentary citation) · Ibn Hajar al-\'Asqalani
  commentary box · Imam an-Nawawi commentary box · related narrations (2
  links)

- Persistent top bar: \"Collection › Book › Hadith N\" breadcrumb \|
  \[🔖 Bookmark\] \[↗ Share\] \[📋 Copy with citation\] \| \"Exit Trace
  View →\" teal button

- Tapping a related hadith in the right column soft-routes within Trace
  View (matn fades + replaces)

- Tapping a topic chip opens the topic landing page in a side drawer
  (right rail expands)

- \"Exit Trace View →\" returns to the hadith deep-view page at the same
  hadith

**▸ US-H19 --- COMPARISON MODE**

**As a researcher, I want to compare two or three hadiths side by side
so I can identify textual and chain differences.**

**Acceptance Criteria:**

- Entry: from any hadith card action menu → \"Add to comparison\" →
  comparison drawer appears at bottom of page

- When 2+ items added, \"Compare →\" button activates, routing to
  /hadith/compare

- Comparison header (.compare-header): \"Comparing\" label + selected
  hadiths as removable chips (× button) + \"+ Add Hadith\" button

- Layout: 2 or 3 equal-width columns. Each column: collection + number
  label (caps-xs) · Arabic matn · \"┃\" teal-bar translation. Mobile
  (≤900px): tabs instead of columns

- Matn variation highlighting: words differing between narrations get
  .diff-highlight (gold-50 background, gold border-radius 3px)

- Chain divergence markers: narrators differing between isnads marked
  with ◆ glyph in gold-500 (.chain-diverge class) + explanatory note
  below

**▸ US-H20 --- STUDY MODE**

**As a student, I want a 4-quadrant focused layout for one hadith so I
can read matn, isnad, grading, and topics simultaneously without
scrolling.**

**Acceptance Criteria:**

- \"Study mode\" toggle on any deep-view page. Activating shows
  .study-mode-banner (dark green bar with pulsing green dot + \"Study
  Mode Active\" + \"4-quadrant focused layout\" subtitle + \"Exit Study
  Mode ×\" button)

- 4-quadrant layout at ≥1440px: top-left = Matn (large Arabic +
  translation) · top-right = Isnad chain (vertical) · bottom-left =
  Grading panel · bottom-right = Topic chips + related

- All 4 quadrants visible without scrolling on a 1440×900 display.
  Sidebar collapses. Distractions (prev/next, load more, collections
  grid) hidden.

- \"Exit Study Mode ×\" button (top-right, .exit-study) or Escape key
  exits. Focus returns to the deep-view page.

**▸ US-H21 --- READING MODE**

**As a reader on a long study session, I want to hide all chrome and
read in a distraction-free column so I can focus entirely on the hadith
text.**

**Acceptance Criteria:**

- \"Reading mode\" toggle in the header on Tier 3 routes. Hides:
  sidebar, hero, footer, action rails, collections grid

- Single column, max-width 720px, centered. Arabic +2 font size steps,
  translation +1 step

- Background: light mode → \--surface becomes #FAF6EC (gold-50 tint);
  dark mode unchanged

- Exit: \"×\" button (fixed, top-right) or Escape key. URL updates to
  append ?mode=reading; restored on reload.

- \@media (prefers-reduced-motion: reduce): all reading-mode transitions
  instant

**▸ US-H22 --- SAVED READING PATHS**

**As a daily reader, I want pre-built study sequences so I have a
structured path through the hadith corpus.**

**Acceptance Criteria:**

- Sidebar section \"READING PATHS\" (below CLASSICAL SCHOLARS): the
  mockup (hadith_module_enhanced\_\_1\_.html) shows 3 visible
  .reading-path-row items. The canonical set is 4 built-in paths per
  Hadith_Module_PRD §12.6.4 --- the sidebar shows the first 3 with a
  \"View all →\" link to expand. Each row: path name + circular progress
  ring (teal-700 stroke, grey track, % complete) + \"N of M read\"
  count.

- 4 canonical built-in paths (seed data) --- per Hadith_Module_PRD
  §12.6.4: \[FIX-2\] Start with 40 Nawawi (42 hadiths) · Kutub al-Sittah
  basics (50 hadiths) · Faith foundations (30 hadiths) · Prophetic
  Character (25 hadiths). Note: Functional Document §12 lists a 5th path
  \"Daily Sunnah (20)\" --- this is deferred post-v1 pending editorial
  review. The canonical MVP count is 4.

- On any hadith deep-view: if the hadith is part of an active path, a
  reading path strip (.reading-path-strip) appears: \"Reading: \[Path
  Name\] · Hadith N of M\" + \[← Previous\] \[Next →\] navigation
  buttons

- Path progress stored in localStorage \"islamicinfo-hadith-paths\":
  {slug, progress: Set\<hadithRef\>}

- \"Continue\" button on each sidebar path row: opens the next unread
  hadith in that path

**▸ US-H23 --- PER-HADITH ACTION SUITE (GLOBAL)**

**As a user engaging with any hadith, I want the same rich set of
actions as on the Qur\'an page so the experience is consistent.**

**Acceptance Criteria:**

  ---------------------------------------------------------------------------
  **Action**    **Trigger**   **Behaviour**                       **Stage**
  ------------- ------------- ----------------------------------- -----------
  Bookmark      Bookmark icon Toggles filled/unfilled. Category   Stage 2
                (header       tooltip (\"Saved to: General ▾\").  
                action)       Default categories: General · For   
                              Memorisation · Reflection · To      
                              Verify · + New. localStorage        
                              \"islamicinfo-hadith-bookmarks\".   
                              Gold dot on hadith number badge.    

  Notes         Note icon     Inline .note-editor below card.     Stage 2
                (header       Textarea (min 72px, resize          
                action)       vertical). Save/Cancel. Gold dot on 
                              hadith number badge. localStorage   
                              \"islamicinfo-hadith-notes\"        
                              Array\<{hadithRef, text,            
                              updatedAt}\>.                       

  Copy with     📋 Copy       Full attribution payload per        Stage 3
  citation      button        US-H16. Toast \"Copied with         
                              citation ✦\" 2.5s.                  

  Share image   Share icon    Canvas-based share modal. Square    Stage 3
                (header       1:1 + Story 9:16 format selector    
                action)       chips. Preview canvas: IslamicInfo  
                              logo + Arabic matn + gold divider + 
                              translation + reference             
                              attribution + geometric bg.         
                              Download PNG + native share sheet.  

  Listen /      \"Listen\"    Mini player below hadith card:      Stage 2
  Audio         footer button play/pause + progress bar + speed   
                              (0.75×/1×/1.25×/1.5×). Reciter name 
                              attributed (e.g. Sheikh             
                              al-Hussary). Waveform animation     
                              during playback. Auto-advance       
                              option.                             

  AI            ✦ AI button   .ai-card slides up below card       Stage 3
  Explanation   (header       (0.38s ease-reverent). Structure:   
                action)       plain-language summary · key        
                              vocabulary terms · scholarly        
                              context · practical lesson. \"✦     
                              Powered by QuranlyAI\" footer link. 
                              No fatwa. No fabrication.           
                              Lazy-loaded.                        

  Translation   Compare       Panel showing hadith in: English    Stage 3
  Compare       button        (Darussalam) · English (USC-MSA) ·  
                              English (Siddiqui) + multilingual   
                              when available. Up to 4 stacked     
                              translations. Primary highlighted.  
                              Language preference saved.          

  Trace View    \"View as     Full-screen or /hadith/trace route. Stage 4
                Trace →\"     3-column: Matn · Isnad · Grading.   
                deep-view btn See US-H18.                         
  ---------------------------------------------------------------------------

**▸ US-H23B --- CONTINUE READING / LAST-READ RESTORATION \[FIX-5\]**

**As a returning reader, I want the page to remember where I stopped so
I can continue my hadith study without losing my place.**

**Acceptance Criteria:**

*FIX-5 applied: localStorage key \"islamicinfo-hadith-last-read\" was
defined in §6.3 but had no user story or acceptance criteria. This story
closes that gap.*

- IntersectionObserver (throttled 1s) tracks the topmost visible
  .hadith-card in the feed. When a hadith is in view, stores to
  localStorage \"islamicinfo-hadith-last-read\": {collectionSlug,
  bookNum, hadithNum, timestamp}

- On page load with no explicit collection/book/hadith in the URL: the
  sidebar pre-selects the last-read collection, and the main feed
  scrolls smoothly to the last-read hadith position

- \"Continue Reading\" affordance: a subtle prompt appears in the hero
  section (\"Continue where you left off → Sahih al-Bukhari, Hadith
  47\") linking directly to the last-read deep-view page. Only shown
  when last-read data exists in localStorage.

- Navigating to the last-read hadith via \"Continue Reading\" fires a
  2-iteration gold pulse ring animation on the hadith card (same
  keyframe as the deep-link pulse: 1.8s, ease-reverent).
  prefers-reduced-motion: border-color highlight only.

- The continue prompt does not appear if the user arrives on the page
  from a shared deep-link URL (explicit URL overrides last-read
  restoration)

- A hadith is counted as \"read\" for tracking purposes when its
  .hadith-card or deep-view page has been visible in the viewport for ≥
  3 continuous seconds (IntersectionObserver + setTimeout --- same
  threshold as Qur\'an Explorer reading progress)

Hard rules for all actions (per Functional Document §20):

- Grade transparency mandatory: every hadith shows a grade badge with a
  named grader. Never display a hadith without its grade.

- No fatwa, no ruling: AI explanation provides context and meaning only
  --- no legal rulings, no permissibility answers, no fatwa-style
  answers.

- Attribution on all copies: every copy action includes full scholarly
  reference. Stripping attribution not permitted.

- Narrator reliability must be sourced: every reliability grade cites
  the original classical work

- Audio attribution: reciter name always shown next to audio player

- Translation source: every translation shows edition name and
  translator

**4. Wireframe & Visual Flow Descriptions**

All wireframe descriptions reference hadith_module_enhanced\_\_1\_.html
as the canonical visual blueprint. Token values from CLAUDE_v3.md v3.0.
No visual redesign without explicit product sign-off.

**4.1 Hero Section**

Same hero shell as all IslamicInfo pages. Bismillah is first child of
.hero-inner. H1 uses var(\--font-display) with .gradient-italic span.
Floating .geo SVG decorators and animated .hero-bg radial gradient.

- EYEBROW BADGE: \"✦ 18 Collections · [TOTAL — recompute, see v1.2 note] Hadiths · Fully
  Source-Verified\"

- H1: \"Explore Authentic Hadith / with Scholarly Precision\" ---
  \"Scholarly Precision\" in gradient-italic

- SUBTITLE: 15--18px, ink-muted, max 2 lines, describes isnad
  transparency and grade verification

- SEARCH PILL: glass pill input (blur, 999px radius), microphone icon
  (voice), scope selector (All · Hadith · Qur\'an · Dua · Verify ✦),
  Submit button

**4.2 Page Layout --- Two-Column Shell**

Full-width .layout flex container (direction: row). Two panes:

  -------------------------------------------------------------------------------
  **Pane**     **Width**         **Contents**                     **Collapse
                                                                  behaviour**
  ------------ ----------------- -------------------------------- ---------------
  Sidebar      240px             HADITH COLLECTIONS (18           Collapses to
  (.sidebar)   flex-shrink-0     sidebar-items with count badges) bottom sheet on
                                 · CLASSICAL SCHOLARS (4 items) · mobile (≤760px)
                                 READING PATHS (3 rows with       
                                 progress rings) · Browse section 
                                 · Verify a Source CTA · Ask a    
                                 Question CTA                     

  Main (.main) flex:1,           Stats strip → Hadith of the Day  Full width on
               overflow-y:auto   → Collections grid → Topics      mobile when
                                 strip → Hadith feed → Stage 2+   sidebar
                                 sections                         collapsed
  -------------------------------------------------------------------------------

**4.3 Sidebar Anatomy**

- SECTION LABELS: .sidebar-section-label (caps-xs, ink-subtle).
  Sections: Hadith Collections · Classical Scholars · Reading Paths ·
  Browse

- SIDEBAR ITEMS: .sidebar-item rows. Active item: left border
  var(\--teal-700), class=\"active\". Count badges: .count-badge
  (caps-xs chip).

- READING PATH ROWS: .reading-path-row. Each row has: circular progress
  ring SVG (small, teal-700 stroke, grey track, % complete) + path
  name + \"N of M read\" label + \"Continue →\" button

- VERIFY CTA: .sidebar-cta with gold \"✦\" icon + \"Verify a Source\"
  heading + supporting copy + .btn-glass button

- ASK CTA: second .sidebar-cta directly below, with gold \"?\" icon +
  \"Ask a Question\" heading

- SIDEBAR DIVIDERS: .sidebar-divider (1px rgba(0,105,110,.08))

**4.4 Hadith Card Anatomy (Study Mode)**

Each .hadith-card in the feed has this exact structure (per blueprint
and mockup):

- TEAL BAR: .hadith-teal-bar --- 4px left border, full card height,
  var(\--teal-700)

- HEADER (.hadith-header): left zone (.hadith-meta) with hadith number
  badge (.hadith-num \"Hadith #N\") + grade badge (.grade-badge
  .grade-sahih, with .grade-dot + grade text + .grader-label \"·
  Darussalam\") \| right zone (.hadith-actions) with icon buttons:
  Bookmark · Share · Copy

- ARABIC MATN (.hadith-arabic): font-arabic, RTL, line-height 2.05,
  ink-body. Amiri font.

- TRANSLATION BLOCK (.hadith-translation): .hadith-narrator line
  (\"Narrated by \[Name\] (رضي الله عنه):\") + .hadith-text with Prophet
  ﷺ salawat span

- FOOTER (.hadith-footer): left = .hadith-ref (\"📖 Collection · Book ·
  Hadith N\") \| right = .hadith-footer-actions: \"View Isnad\" button +
  \"Listen\" button + \"Open Full View\" primary button

- ISNAD PREVIEW (.isnad-preview, id=\"isnad-N\"): hidden by default,
  toggles open on \"View Isnad\". Chain of .isnad-link nodes:
  .isnad-avatar + .isnad-name + .isnad-lifespan. Connector: dashed
  vertical line.

AI Card (.ai-card) and note editor (.note-editor) are injected below the
hadith footer when activated --- same pattern as Qur\'an Explorer.

**4.5 Grade Badge System**

  ------------------------------------------------------------------------------------
  **Grade**   **CSS Class**  **Dot Colour     **Text**   **Example**
                             Token**                     
  ----------- -------------- ---------------- ---------- -----------------------------
  Sahih       .grade-sahih   \--grade-sahih   ● Sahih    \"Sahih · Darussalam\" or
                             (#0F6E56 green)             \"Sahih · Imam al-Bukhari\"

  Hasan       .grade-hasan   \--grade-hasan   ● Hasan    \"Hasan · al-Albani\"
                             (#5D8A3A olive)             

  Da\'if      .grade-daif    \--grade-daif    ● Da\'if   \"Da\'if · al-Albani\"
                             (#A86932 amber)             

  Mawdu\'     .grade-mawdu   \--grade-mawdu   ● Mawdu\'  (fabricated --- displayed
                             (#B33A3A red)               with red warning)
  ------------------------------------------------------------------------------------

Every grade badge includes the named grader in .grader-label. Grader
tooltip on hover (full grader name + citation). Grade filter pills use
the same colour tokens.

**4.6 Narrator Reliability Colour System**

  -------------------------------------------------------------------------------------
  **Grade**   **Colour**   **Arabic**   **CSS          **Meaning**
                                        indicator      
                                        class**        
  ----------- ------------ ------------ -------------- --------------------------------
  Thiqah      Green        ثقة          .rel-thiqah    Trustworthy --- highest
                                                       reliability

  Thiqah      Green+       ثقة ثبت      .rel-thiqah    Trustworthy and firm ---
  Thabt                                                superior

  Saduq       Gold         صدوق         .rel-saduq     Honest --- acceptable

  Da\'if      Red-orange   ضعيف         .rel-daif      Weak --- caution required

  Matruk      Red          متروك        .rel-matruk    Abandoned --- rejected

  Unknown     Grey         مجهول        .rel-unknown   Unknown status
  -------------------------------------------------------------------------------------

**4.7 Deep-View Page Layout (Tier 3b)**

Route /hadith/\[collection\]/\[book\]/\[hadith\]. Single-hadith focus.
Sidebar: icon rail ≤1100px, full sidebar ≥1100px.

- PAGE HEADER: \"Collection › Book › Hadith N\" breadcrumb \| \[🔖\]
  \[↗\] \[📋\] action buttons \| \"Exit\" if reached from Trace View

- HADITH BODY CARD: full hadith card (number + grade + Arabic +
  translation) with enlarged Arabic (font-arabic, 24px+) and expanded
  translation block

- ISNAD CHAIN SECTION: inline (not modal). \"── ISNAD CHAIN ──\" caps-xs
  divider. Full narrator chain with reliability dots; each narrator
  tappable to reveal reliability panel (Stage 2).

- ALTERNATE GRADINGS SECTION: \"── ALTERNATE GRADINGS ──\" divider.
  Table of named scholar grades: scholar name · grade text · source
  citation. Min 2 scholars shown.

- TRANSLATIONS SECTION: \"── TRANSLATIONS ──\" divider. Tabs: EN · UR ·
  FR · ID · TR. Switching tab swaps the translation text. Selected tab
  preference stored in localStorage.

- TOPICS SECTION: \"── TOPICS ──\" divider. Relevant topic chips (links
  to topic landing pages in Stage 3).

- RELATED NARRATIONS SECTION: \"── RELATED NARRATIONS ──\" divider
  (Stage 3). Related-hadith graph per US-H15.

- PREVIOUS / NEXT: \"── PREVIOUS / NEXT ──\" divider. \"← Hadith N-1\"
  and \"Hadith N+1 →\" within same book.

**4.8 Hadith Trace View (Stage 4, Signature) \[FIX-3\]**

*FIX-3 applied: Functional Document §7.8 specifies a 4-column Trace View
(Matn · Isnad · Scholarly Commentary · Related Narrations). The HTML
blueprint (hadith_module_enhanced\_\_1\_.html .trace-layout) implements
3 columns (Matn · Isnad · Scholarly Grading). This PRD adopts the
3-column blueprint layout as canonical for the web build. \"Related
Narrations\" are surfaced in the right column\'s lower section rather
than as a separate 4th column. The 4-column layout from the Functional
Spec is noted here for mobile app planning where screen real estate
permits a deeper layout.*

Full-screen .trace-layout (3-column grid, 1fr : 1.2fr : 1fr at ≥1300px;
stacks at ≤900px). Persistent top bar above columns.

- TOP BAR: \"Collection › Book › Hadith N\" breadcrumb (font-display
  16px, ink-muted) \| \[🔖 Bookmark\] \[↗ Share\] \[📋 Copy with
  citation\] (.trace-act buttons) \| \"Exit Trace View →\" teal button
  (.trace-exit button style)

- LEFT COLUMN (Matn): .trace-col-label \"Matn (Text)\" → Arabic matn
  (font-arabic, 18px, RTL, teal-tinted bg, border-radius 12px) → \"┃\"
  teal-bar translation (CG italic 17px) → topic chips → related
  Qur\'anic verses if any

- CENTRE COLUMN (Isnad): .trace-col-label \"Isnad Chain (Click narrators
  for reliability)\" → vertical chain of narrator rows (flex, gap 12px).
  Each row: avatar circle + name + era + reliability dot. Dashed
  connector line. Clicking narrator → reliability panel slides over matn
  from inline-start. Chain divergence points marked ◆ gold.

- RIGHT COLUMN (Grading): .trace-col-label \"Scholarly Grading\" → grade
  block (grade-sahih green bg, primary grade + commentary) → Ibn Hajar
  commentary card → Imam an-Nawawi commentary card → related narrations
  (2 links: \"Muslim #1907\" \"Abu Dawud #2201\")

- Column borders: 0.5px rgba(0,105,110,.09) vertical separators. Each
  column scrolls independently.

**4.9 Comparison Mode Layout (Stage 4)**

Route /hadith/compare. Header (.compare-header) + 2--3 equal-width
columns.

- HEADER: \"Comparing\" label + selected hadiths as removable
  .compare-item chips (text + \"×\" remove button) + \"+ Add Hadith\"
  footer-action-btn at right

- COLUMN (per hadith): caps-xs collection + number label (10px,
  letter-spacing, ink-subtle) → Arabic matn (font-arabic, 16px, RTL)
  with .diff-highlight spans on differing words (gold-50 bg) +
  .chain-diverge markers (◆ glyph, gold-500) → \"┃\" teal-bar
  translation with differing phrases in .diff-highlight → grade badge +
  reference

- Mobile ≤900px: tabs (collection name as tab label) instead of columns;
  selected column fills width

**4.10 CTA Band & Footer**

CTA band (.cta-band): dark teal gradient background
(linear-gradient(135deg, var(\--teal-900), var(\--teal-700),
var(\--teal-950))). Content: \"✦ Strengthen Your Knowledge\" eyebrow
badge + H2 \"Explore the Prophet\'s Teachings\" (gold-it italic span) +
subtitle + two CTA buttons + links to companion apps. Per CLAUDE_v3.md
§11.

Footer: id=\"ii-footer\", global 5-column per CLAUDE_v3.md §7. Hadith
Library page col 1: \"Hadith Library\" heading with links: Six Books ·
By Scholar · Grading Guide · Topic Index · Compare.

**5. Feature Matrix**

**5.1 Stage-by-Stage Feature Classification**

  ---------------------------------------------------------------------------------------
  **Feature**                  **Stage**   **Priority**   **Gap Status    **User
                                                          (from Func. Doc Persona**
                                                          §21)**          
  ---------------------------- ----------- -------------- --------------- ---------------
  9-collection sidebar with    Stage 1     P0             Present in      All
  count badges                                            mockup --- wire 
                                                          to data         

  Classical Scholars sidebar   Stage 1     P0             Present in      Scholars
  section                                                 mockup ---      
                                                          static          

  Collections grid (18 cards,  Stage 1     P0             Present in      All
  filter tabs)                                            mockup --- wire 
                                                          to data         

  Sahih al-Bukhari featured    Stage 1     P0             Present in      All
  card treatment                                          mockup          

  Stats strip (4 metrics)      Stage 1     P0             Present in      All
                                                          mockup ---      
                                                          static          

  Hadith of the Day featured   Stage 1     P0             Present in      Daily visitors
  strip                                                   mockup --- wire 
                                                          to rotation     
                                                          data            

  Hadith feed with cards       Stage 1     P0             Present in      All
                                                          mockup --- wire 
                                                          to API          

  Grade badge system (4        Stage 1     P0             Present in      All
  grades + named grader)                                  mockup          

  Grade filter pills           Stage 1     P0             🟢 Low priority All
  (in-place)                                              gap --- wire    
                                                          logic           

  Isnad chain modal v1 (dots   Stage 1     P0             Present in      Students
  only)                                                   mockup ---      
                                                          toggle working  

  Topics strip (14 chips,      Stage 1     P1             Present in      Students
  in-place filter)                                        mockup ---      
                                                          in-place only   

  Hero search pill (voice +    Stage 1     P0             🟢 Low priority All
  scope)                                                  --- wire search 

  Bookmark toggle + category   Stage 2     P1             🔴 High         All
  tooltip                                                 priority ---    
                                                          button present, 
                                                          not wired       

  Note editor (inline          Stage 2     P1             🔴 High         Students
  textarea)                                               priority ---    
                                                          not present     

  Audio mini player (Listen)   Stage 2     P1             🔴 High         Listeners
                                                          priority ---    
                                                          button present, 
                                                          not wired       

  Bookmarks panel (slide-in)   Stage 2     P1             🟠 Medium ---   Returning
                                                          not present     readers

  3-tier navigation            Stage 2     P0             🟠 Medium ---   All
  (Collection → Book)                                     Browse goes     
                                                          nowhere         

  3-tier navigation (Book →    Stage 2     P0             🟠 Medium ---   All
  Hadith deep-view)                                       Browse goes     
                                                          nowhere         

  Narrator reliability panel   Stage 2     P1             🟠 Medium ---   Students /
  (text, scholars)                                        dots only, no   Scholars
                                                          text            

  Breadcrumbs (Tier 2 + Tier   Stage 2     P1             🟠 Medium ---   All
  3)                                                      not wired       

  Deep links (canonical URLs + Stage 2     P1             🟠 Medium ---   Link receivers
  gold pulse ring)                                        no URL routing  

  \"Ask a Question\" sidebar   Stage 2     P1             Present in      All
  CTA                                                     mockup --- wire 
                                                          to verify       
                                                          engine          

  Translation language         Stage 2     P1             🟠 Medium ---   Non-English
  selector                                                not present     readers

  Copy with attribution (full  Stage 3     P1             🔴 High         Students /
  payload)                                                priority ---    Writers
                                                          button not      
                                                          wired           

  Share image modal (canvas,   Stage 3     P2             🔴 High         Social media
  square + story)                                         priority ---    users
                                                          not present     

  AI Explanation card          Stage 3     P1             🔴 High         All
  (QuranlyAI)                                             priority ---    
                                                          not present     

  Translation comparison panel Stage 3     P2             🔴 High         Scholars
  (multi-edition)                                         priority ---    
                                                          not present     

  Topic index page             Stage 3     P1             🟠 Medium ---   Students
  (/hadith/topics)                                        chips route     
                                                          nowhere         

  Topic landing pages          Stage 3     P1             🟠 Medium       Students
  (/hadith/topics/\[topic\])                                              

  Related-hadith graph         Stage 3     P1             🟠 Medium ---   Researchers
  (deep-view block)                                       not present     
                                                          (deep-view)     

  Illustrated motifs per       Stage 3     P2             Design asset    All (visual)
  collection (18 SVGs)                                    --- not yet     
                                                          authored        

  Hadith Trace View (3-column, Stage 4     P1             🟠 Medium ---   Scholars
  full-screen)                                            layout present, 
                                                          not wired       

  Comparison mode (up to 3     Stage 4     P1             Layout present  Researchers
  hadiths)                                                in mockup, not  
                                                          wired           

  Study mode (4-quadrant       Stage 4     P2             Banner present  Students
  focused layout)                                         in mockup       

  Reading paths (sidebar +     Stage 4     P1             Sidebar rows    Goal-oriented
  progress ring)                                          present,        readers
                                                          progress not    
                                                          wired           

  Reading mode                 Stage 4     P2             Not present     Long-session
  (distraction-free single                                                readers
  column)                                                                 

  Audio auto-advance           Stage 4     P3             🟢 Low --- not  Listeners
                                                          implemented     
  ---------------------------------------------------------------------------------------

**5.2 Accessibility Matrix**

+-----------------+--------------+-----------------------------+------------+
| **Requirement** | **Standard** | **Implementation**          | **Status** |
+=================+==============+=============================+============+
| Semantic HTML   | WCAG 2.1 AA  | \<header\>, \<nav\>,        | Stage 1    |
|                 |              | \<main\>, \<aside\>,        |            |
|                 |              | \<section\> --- blueprint   |            |
|                 |              | structure preserved         |            |
|                 |              | verbatim                    |            |
+-----------------+--------------+-----------------------------+------------+
| Arabic text     | i18n         | All Arabic elements:        | Stage 1    |
| direction       |              | direction:rtl;              |            |
|                 |              | text-align:right;           |            |
|                 |              | font-family:Amiri. Never    |            |
|                 |              | through i18n layer.         |            |
+-----------------+--------------+-----------------------------+------------+
| ARIA labels on  | WCAG 2.1 AA  | aria-label on all           | Stage 1    |
| controls        |              | .hadith-action-btn,         |            |
|                 |              | .footer-action-btn;         |            |
|                 |              | role=\"search\" on search   |            |
|                 |              | pill                        |            |
+-----------------+--------------+-----------------------------+------------+
| Color contrast  | WCAG 2.1 AA  | ink-primary #0F2A2C on      | Stage 1    |
| --- UI text     | (4.5:1)      | surface #F4F7F7 = 14.8:1    |            |
|                 |              | ✅. Grade badge text on     |            |
|                 |              | badge bg verified per       |            |
|                 |              | token.                      |            |
+-----------------+--------------+-----------------------------+------------+
| Grade badge     | WCAG 2.1 AA  | grade-sahih #0F6E56 on      | Stage 1    |
| contrast ---    |              | #DDE9E6 (blended bg):       | audit ---  |
| light mode      |              | 4.98:1 ✅ AA                | FIX-1      |
| \[FIX-1\]       |              |                             |            |
|                 |              | grade-hasan #5D8A3A on      |            |
|                 |              | #E4ECE4 (blended bg):       |            |
|                 |              | 3.37:1 ⚠️ AA-large/UI only  |            |
|                 |              | --- consider darkening to   |            |
|                 |              | #4A7030 (4.8:1) for Stage 3 |            |
|                 |              |                             |            |
|                 |              | grade-daif #A86932 on       |            |
|                 |              | #ECE8E3 (blended bg):       |            |
|                 |              | 3.64:1 ⚠️ AA-large/UI only  |            |
|                 |              | --- consider darkening to   |            |
|                 |              | #8A5228 (4.5:1) for Stage 3 |            |
|                 |              |                             |            |
|                 |              | grade-mawdu #B33A3A on      |            |
|                 |              | #EDE4E4 (blended bg):       |            |
|                 |              | 4.69:1 ✅ AA                |            |
+-----------------+--------------+-----------------------------+------------+
| Grade badge     | WCAG 2.1 AA  | grade-sahih #0F6E56 on      | Stage 1    |
| contrast ---    |              | #0A201D (blended bg):       | ---        |
| dark mode       |              | 2.74:1 ❌ FAIL --- must use | REQUIRED   |
| \[FIX-1\]       |              | brighter dark-mode variant  |            |
|                 |              | e.g. #1FA882 (5.2:1)        |            |
|                 |              |                             |            |
|                 |              | grade-hasan #5D8A3A on      |            |
|                 |              | #162419: 3.97:1 ⚠️          |            |
|                 |              | AA-large/UI --- recommend   |            |
|                 |              | #7AB84E (5.1:1)             |            |
|                 |              |                             |            |
|                 |              | grade-daif #A86932 on       |            |
|                 |              | #211F18: 3.71:1 ⚠️          |            |
|                 |              | AA-large/UI --- recommend   |            |
|                 |              | #D4884A (4.9:1)             |            |
|                 |              |                             |            |
|                 |              | grade-mawdu #B33A3A on      |            |
|                 |              | #231819: 2.95:1 ❌ FAIL --- |            |
|                 |              | must use brighter dark-mode |            |
|                 |              | variant e.g. #E05555        |            |
|                 |              | (5.3:1)                     |            |
|                 |              |                             |            |
|                 |              | ACTION REQUIRED: Add        |            |
|                 |              | \[data-theme=\"dark\"\]     |            |
|                 |              | overrides for all 4 grade   |            |
|                 |              | badge text colours before   |            |
|                 |              | Stage 1 ships               |            |
+-----------------+--------------+-----------------------------+------------+
| Narrator        | WCAG 2.1     | Dots are decorative (6px    | Stage 2    |
| reliability     | (decorative) | circles supplemented by     | audit      |
| dots            |              | text label in Stage 2).     |            |
|                 |              | Dots alone: grade-sahih on  |            |
|                 |              | light surface = 5.76:1 ✅.  |            |
|                 |              | All 6 dot colours verified  |            |
|                 |              | at Stage 2 alongside        |            |
|                 |              | narrator panel text.        |            |
+-----------------+--------------+-----------------------------+------------+
| Keyboard        | WCAG 2.1 AA  | All .hadith-action-btn,     | Stage 2    |
| navigation      |              | .sidebar-item,              |            |
|                 |              | .footer-action-btn          |            |
|                 |              | focusable via Tab. Escape   |            |
|                 |              | closes isnad panel,         |            |
|                 |              | narrator panel, reading     |            |
|                 |              | mode.                       |            |
+-----------------+--------------+-----------------------------+------------+
| Focus trap ---  | WCAG 2.1 AA  | Tab cycles within: Trace    | Stage 4    |
| overlays        | 2.1.2        | View overlay, Share Modal,  |            |
|                 |              | Narrator Panel (when        |            |
|                 |              | full-screen). Verified with |            |
|                 |              | VoiceOver + NVDA.           |            |
+-----------------+--------------+-----------------------------+------------+
| Reduced motion  | WCAG 2.1 AA  | \@media                     | Stage 1    |
|                 | 2.3.3        | (prefers-reduced-motion:    |            |
|                 |              | reduce): disables geoFloat, |            |
|                 |              | bgD, fade-up, pulse-dot,    |            |
|                 |              | reading-mode transitions.   |            |
+-----------------+--------------+-----------------------------+------------+
| Screen reader   | WCAG 2.1 AA  | aria-live for grade filter  | Stage 2    |
|                 |              | updates; aria-label on      |            |
|                 |              | audio controls; meaningful  |            |
|                 |              | alt/aria on all SVGs;       |            |
|                 |              | role=\"list\" on isnad      |            |
|                 |              | chain.                      |            |
+-----------------+--------------+-----------------------------+------------+
| Mobile          | WCAG 2.1 AA  | Sidebar bottom sheet on     | Stage 1    |
| accessibility   |              | mobile has full keyboard    |            |
|                 |              | nav and focus management.   |            |
|                 |              | Touch targets ≥ 44px.       |            |
+-----------------+--------------+-----------------------------+------------+

**6. Technical Architecture & Requirements**

**6.1 Frontend Stack**

  ---------------- -----------------------------------------------------
  **HTML**         HTML5 semantic per hadith_module_enhanced\_\_1\_.html
                   blueprint. Single file, no framework.

  **CSS**          CSS3 custom properties from CLAUDE_v3.md §1. No
                   CSS-in-JS. Dark-mode sibling block unmerged. No new
                   colour tokens.

  **JavaScript**   Vanilla JS. Single \<script\> at end of \<body\>. Web
                   Workers for AI explanation fetch.

  **Fonts**        Cormorant Garamond + Inter + Amiri --- Google Fonts,
                   preconnected in this order

  **Audio**        Single global \<audio\> element per page.
                   AbortController for timeouts. Reciter name always
                   attributed.

  **Canvas**       HTML5 Canvas for share image generator. One canvas at
                   a time; disposed after download.

  **API ---        HadithAPI.com (9 collections, proxied through a
  Hadith**         Cloudflare Worker \-\-- key never exposed
                   client-side) + fawazahmed0 hadith-api (1 collection,
                   direct jsDelivr CDN fetch, keyless, public domain) +
                   AhmedBaset/hadith-json (8 collections, direct GitHub
                   fetch pinned to a release tag, keyless \-\-- license
                   not yet confirmed, see \\\"9. Decisions\\\") +
                   self-hosted JSON (fallback + Meili search index).
                   v1.2 \-\-- replaces v1.0/v1.1\'s single-source
                   Sunnah.com API assumption; see v1.2 Changes Summary.

  **API --- AI**   api.anthropic.com/v1/messages ---
                   claude-sonnet-4-20250514, max_tokens 1000

  **Narrator       Seeded from al-Mizzi\'s Tahdhib al-Kamal + Ibn
  data**           Hajar\'s Taqrib at-Tahdhib (open scholarly editions)

  **Cache**        Cloudflare KV --- 24h hadith text, 7d narrator data,
                   1h daily hadith rotation, long TTL for HadithAPI.com
                   responses to stay under rate limits (v1.2 --- replaces
                   v1.1\'s Redis assumption; this project runs on
                   Cloudflare, not a Redis-backed host)
  ---------------- -----------------------------------------------------

**6.2 Design System Rules (CLAUDE_v3.md + Hadith_Module_PRD §12.0)**

- All CSS tokens from CLAUDE_v3.md §1. No new colours, radii, or easing
  curves.

- Reuse existing classes: .card, .chip, .grade, .btn-primary,
  .btn-ghost, .btn-glass, .arabic,
  .grade-sahih/.grade-hasan/.grade-daif/.grade-mawdu

- Card hover: translateY(-5px) scale(1.012), 0.38s ease-reverent. Button
  hover: translateY(-2px) scale(1.04), 0.28s ease-premium.

- NO shimmer ::after sweep --- forbidden per CLAUDE_v3.md §27.4

- All frozen copy from blueprint preserved verbatim: collection names,
  grade labels, \"View Isnad\", \"Listen\", \"Verify a Source\", \"Ask a
  Question\", \"Browse →\", ┃ translation bar marker

- Grade badge colour tokens defined in CLAUDE_v3.md §1 \"Hadith grade
  badges\" block --- use verbatim

**6.3 Data & Storage Reference**

  -----------------------------------------------------------------------------------------
  **localStorage Key**                  **Data Type**             **Purpose**     **Set in
                                                                                  Stage**
  ------------------------------------- ------------------------- --------------- ---------
  \"islamicinfo-hadith-bookmarks\"      JSON                      Saved hadith    Stage 2
                                        Array\<{collectionSlug,   bookmarks with  
                                        bookNum, hadithNum,       category        
                                        arabicSnippet,                            
                                        englishSnippet, category,                 
                                        addedAt}\>                                

  \"islamicinfo-hadith-notes\"          JSON Array\<{hadithRef,   Personal notes  Stage 2
                                        text, updatedAt}\>        linked to       
                                                                  hadith          
                                                                  reference       

  \"islamicinfo-hadith-last-read\"      JSON {collectionSlug,     Continue        Stage 2
                                        bookNum, hadithNum,       reading         
                                        timestamp}                restoration     

  \"islamicinfo-hadith-paths\"          JSON Array\<{slug,        Reading path    Stage 4
                                        readHadiths:              progress        
                                        \[hadithRef\]}\>          tracking        

  \"islamicinfo-hadith-translation\"    String (edition slug)     Selected        Stage 2
                                                                  translation     
                                                                  edition         

  \"islamicinfo-hadith-reading-mode\"   \"1\" or absent           Restores        Stage 4
                                                                  reading mode on 
                                                                  reload          

  \"islamicinfo-theme\"                 \"light\" \| \"dark\"     Global site     Stage 1
                                                                  theme (shared   
                                                                  with all pages) 

  \"islamicinfo-lang\"                  ISO 639-1 code            Global UI       Stage 1
                                                                  language        
                                                                  (shared with    
                                                                  all pages)      
  -----------------------------------------------------------------------------------------

**6.4 API Integration Map**

  ---------------------------------------------------------------------------------------------------------
  **API / Source**           **Endpoint / Pattern**                              **Purpose**      **Cache
                                                                                                  TTL**
  -------------------------- --------------------------------------------------- ---------------- ---------
  HadithAPI.com (via         /api/hadith/search?q={query}&lang=en&limit=20       Hadith full-text 1h
  Cloudflare Worker)                                                             search (9         
                                                                                 HadithAPI          
                                                                                 collections)       

  HadithAPI.com (via         /api/hadith/{collection}/{hadithId}?lang=en         Single hadith    24h
  Cloudflare Worker)                                                             text +           
                                                                                 translation +    
                                                                                 grade (9         
                                                                                 collections)      

  HadithAPI.com (via         /api/hadith/{collection}/books                     Books list for   7d
  Cloudflare Worker)                                                             Tier 2 (9        
                                                                                 collections)      

  HadithAPI.com (via         /api/hadith/{collection}/books/{book}/hadiths      Hadith list for  24h
  Cloudflare Worker)                                                             Tier 3a (9       
                                                                                 collections)      

  fawazahmed0                cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/      40 Hadith Nawawi  Bundled
  (direct, keyless)          editions/{eng\|ara}-nawawi.json                    text \+ Arabic    (static)
                                                                                 isnad             

  AhmedBaset                 raw.githubusercontent.com/AhmedBaset/hadith-json/  Riyad as-Saliheen,Bundled
  (direct, keyless,          {tag}/db/by_book/the_9_books/ ... \+               Bulugh al-Maram,  (static)
  pinned release tag)        other_books/ paths per collection                  Muwatta Malik,    
                                                                                 Adab al-Mufrad,   
                                                                                 Shamail, Darimi,  
                                                                                 both Forty        
                                                                                 collections (8    
                                                                                 collections, no   
                                                                                 grade field)       

  /data/narrator/{id}.json   Self-hosted JSON, narrator-id keyed                 Narrator         7d
                                                                                 reliability      
                                                                                 data + scholar   
                                                                                 gradings         

  /data/hotd.json            Static, day-of-year keyed                           Hadith of the    24h
                                                                                 Day rotation     

  /data/narrator/{id}.json   Self-hosted JSON, narrator-id keyed                 Narrator         7d
                                                                                 reliability      
                                                                                 data + scholar   
                                                                                 gradings         

  /data/hotd.json            Static, day-of-year keyed                           Hadith of the    24h
                                                                                 Day rotation     

  /data/reading-paths.json   Static bundled seed                                 Built-in reading Bundled
                                                                                 path definitions 

  api.anthropic.com          /v1/messages (claude-sonnet-4-20250514, max_tokens  AI Explanation   No cache
                             1000)                                               (QuranlyAI)      
  ---------------------------------------------------------------------------------------------------------

**6.5 Performance Requirements**

- LCP \< 2.5s on representative hadith list page (Bukhari, Book 1, first
  10 hadiths visible)

- FCP \< 1.5s (page shell visible; skeleton shimmer shown immediately
  for collections grid and hadith feed)

- CLS \< 0.1 (skeleton shimmer reserves card heights; isnad panel
  expansion uses CSS max-height transition not layout shift)

- Lighthouse Performance ≥ 90 on representative deep-view page

- Narrator reliability data: lazy-fetched on narrator panel open. Never
  fetched on page load.

- AI Explanation: max 10s AbortController timeout. Web Worker handles
  fetch.

- Isnad toggle: CSS max-height transition ≤ 0.38s (ease-reverent). No
  layout reflow.

**6.6 Error States & Fallback Behaviours**

  ---------------------------------------------------------------------------------------------------------
  **Feature**    **Failure Scenario**                         **User-Facing Fallback** **Technical
                                                                                       Handling**
  -------------- -------------------------------------------- ------------------------ --------------------
  Collections    API timeout or 5xx                           Renders from             fetch catch → seed
  grid fetch                                                  /data/collections.json   JSON; log to
                                                              seed (always present).   monitoring
                                                              No user-visible error.   

  Book list      API failure for /hadith/\[collection\] books \"Books temporarily      fetch catch → empty
  fetch (Tier 2) endpoint                                     unavailable --- try      state card in
  \[FIX-4\]                                                   again\" empty state with .books-grid; retry
                                                              retry button in the      re-triggers fetch;
                                                              books grid area.         breadcrumb state
                                                              Breadcrumb and \"↩ All   preserved
                                                              Collections\" link       
                                                              remain functional.       

  Deep-view      API failure for                              \"Hadith temporarily     fetch catch →
  fetch (Tier 3) /hadith/\[collection\]/\[book\]/\[hadith\]   unavailable --- try      partial empty state
  \[FIX-4\]                                                   again\" message in the   per block; each
                                                              hadith body card. Isnad, block renders
                                                              grading, and             independently; no
                                                              translations sections    full-page crash
                                                              show \"---\". Previous / 
                                                              Next navigation remains  
                                                              functional.              

  Hadith feed    API failure for selected collection/book     \"Hadiths temporarily    fetch catch → empty
  fetch                                                       unavailable --- try      state component;
                                                              again\" empty state with retry re-triggers
                                                              retry button.            fetch

  Hadith of the  API failure                                  Renders Bukhari #1       fetch catch →
  Day fetch                                                   (Intentions hadith) from bundled static
                                                              /data/hotd.json static   fallback
                                                              fallback.                

  Narrator       API / self-hosted JSON failure               \"Reliability data       catch per narrator;
  reliability                                                 unavailable for this     graceful partial
  fetch                                                       narrator\" in panel      render
                                                              body. Grade dot retained 
                                                              (Stage 1 data).          

  AI Explanation Timeout (10s) or error                       \"Explanation            AbortController 10s;
  API                                                         unavailable --- please   catch → error state;
                                                              try again\" in .ai-card. no auto-close
                                                              Retry button. ✕ close    
                                                              always works.            

  AI Explanation Response contains fatwa or ruling            Response stripped before Post-process: detect
  content                                                     display. Fallback:       fatwa-pattern; strip
                                                              \"Unable to generate     or reject; log
                                                              explanation for this     
                                                              hadith.\"                

  Audio CDN      404 or CDN unavailable                       \"Audio unavailable for  audio.onerror →
                                                              this hadith\" shown      per-hadith error
                                                              below Listen button.     message; do not
                                                              Player controls remain   crash player
                                                              visible.                 

  Share image    document.fonts.ready timeout                 Falls back to system     Promise.race 3s;
  canvas                                                      serif for canvas text;   proceed with
                                                              image still generates.   fallback font stack

  localStorage   Notes or bookmarks storage full              Toast: \"Storage full    QuotaExceededError
  quota exceeded                                              --- clear some bookmarks catch on setItem;
                                                              or notes\". New save     toast; preserve
                                                              blocked gracefully.      existing data
  ---------------------------------------------------------------------------------------------------------

**7. Implementation Roadmap**

Staged approach per Hadith_Module_PRD.md §12.2. Stages 3 and 4 can be
parallelised once Stage 2 is signed off. Do not start Stage N+1 until
Stage N acceptance criteria are verified.

**Stage 1 --- Foundation (Weeks 1--3)**

Goal: pixel-perfect replica of hadith_module_enhanced\_\_1\_.html with
live data in both themes.

1.  Read hadith_module_enhanced\_\_1\_.html + CLAUDE_v3.md in full
    before writing any code

2.  Implement all CSS token system; dark-mode sibling block unmerged;
    all grade badge tokens

3.  Wire sidebar: all 18 collections with count badges, classical
    scholars, reading path rows (static for now), Verify + Ask CTAs

4.  Wire collections grid: live data for all 18 collections, filter tabs
    (in-place), \"✦ Most Authentic\" Bukhari featured treatment

5.  Wire stats strip: 4 static metrics from blueprint

6.  Wire Hadith of the Day: rotation from /data/hotd.json; skeleton +
    error fallback

7.  Wire hadith feed: live data for Bukhari Book 1; hadith card markup
    per §4.4; grade badges with named graders

8.  Wire grade filter pills: in-place filter logic (no route change)

9.  Wire topics strip: 14 chips verbatim from blueprint; in-place filter
    (Stage 1 only)

10. Wire Isnad modal v1: toggle open/close; narrator chain with dots
    only (no text panel)

11. Wire hero search pill: text input + scope selector + results overlay

12. Implement \@media (prefers-reduced-motion: reduce) for all fade-up
    and dot animations

13. Verify Stage 1 acceptance criteria (§12.3.11) before advancing

**Stage 2 --- Library Navigation (Weeks 4--6)**

Goal: full 3-tier navigation, per-hadith persistence, narrator text
panels, deep links.

14. Wire 3-tier navigation: /hadith/\[collection\] book list (Tier 2) +
    /hadith/\[collection\]/\[book\] hadith list (Tier 3a)

15. Build deep-view page: /hadith/\[collection\]/\[book\]/\[hadith\]
    with all blocks per §4.7

16. Upgrade isnad to v2: narrator reliability panel with scholar text
    (Ibn Hajar, al-Dhahabi, al-Mizzi)

17. Wire \"Ask a Question\" CTA: pre-fills verify engine with active
    hadith on Tier 3 routes

18. Wire breadcrumbs on Tier 2 + Tier 3 routes; mobile collapse to
    ellipsis

19. Implement deep links: canonical URLs + gold pulse ring animation
    (2-iteration, 1.8s)

20. Implement bookmark toggle: category tooltip, localStorage, gold dot
    on hadith badge

21. Build bookmarks slide-in panel (right): chip filter row + bookmark
    cards

22. Build inline note editor: textarea + Save/Cancel + localStorage +
    gold dot on badge

23. Wire audio mini player: play/pause + scrub + speed control; reciter
    attribution always shown

24. Wire translation language selector dropdown above hadith feed

25. Implement focus-trap for narrator panel (full-screen), future
    overlays

26. Verify Stage 2 acceptance criteria (§12.4.7) before advancing

**Stage 3 --- Scholarly Tooling (Weeks 7--9) --- can parallelise with
Stage 4**

27. Build /hadith/topics topic index page: 16 topic cards

28. Build /hadith/topics/\[topic\] landing pages: summary + key
    narrations + study order + right rail

29. Route topic chips from Stage 1 to /hadith/topics/\[topic\] (replaces
    in-place filter)

30. Build related-hadith graph block on all deep-view pages: 4-card
    grid + filter chips

31. Wire copy-with-attribution: full scholarly citation payload +
    \"Copied with citation ✦\" toast

32. Build share image modal: canvas generator, square + story formats,
    font preload, download + share sheet

33. Build AI Explanation card: Anthropic API call, skeleton shimmer,
    QuranlyAI attribution, fatwa strip, error state

34. Build translation comparison panel: 4 stacked editions, primary
    highlighted, language preference stored

35. Author and commit 18 collection illustrated motifs (SVG, 64×64,
    gold-500 accent)

36. Verify Stage 3 acceptance criteria (§12.5.6) before advancing

**Stage 4 --- Signature Features (Weeks 7--9 --- parallel with Stage
3)**

37. Build Hadith Trace View: 3-column full-screen layout; persistent top
    bar; all sub-components per §4.8

38. Wire narrator tap → reliability panel slides over matn from
    inline-start in Trace View

39. Wire related hadith tap → soft-route within Trace View (matn fade +
    replace)

40. /hadith/trace/\[collection\]/\[book\]/\[hadith\] route + deep-link
    support

41. Build comparison mode: /hadith/compare route; up to 3 columns;
    .diff-highlight spans; ◆ chain divergence markers

42. Build study mode: 4-quadrant layout; sidebar collapse; green study
    banner; Escape/Exit

43. Wire reading paths: 4 canonical built-in paths (40 Nawawi · Kutub
    al-Sittah basics · Faith foundations · Prophetic Character) in
    sidebar with progress rings; reading-path-strip on deep-view;
    localStorage \[FIX-2\]

44. Build reading mode: single-column distraction-free; gold-50 bg tint;
    × exit; URL ?mode=reading

45. Verify Stage 4 acceptance criteria (§12.6.6) before advancing

**Testing & Launch (Weeks 10--11)**

46. Cross-browser: Chrome, Firefox, Safari, Edge (desktop + mobile
    Safari)

47. Device testing: iPhone SE, iPhone 15 Pro, Samsung Galaxy S24, iPad
    Pro 12.9\"

48. RTL testing: Arabic matn and isnad chain layout on all breakpoints
    (1100/900/760/700/440px)

49. Narrator reliability grading audit: verify all cited classical works
    are real, no fabricated gradings

50. AI Explain testing: system prompt enforcement, fatwa/ruling
    detection strip, timeout, retry

51. Audio testing: player controls, speed cycling, reciter attribution
    visible, page unload cleanup

52. WCAG 2.1 AA audit: axe-core automated + manual keyboard +
    VoiceOver + NVDA

53. Grade badge contrast verification: all 4 grades in both light and
    dark themes

54. Lighthouse CI: Performance ≥ 90 on /hadith/bukhari/1/1 (deep-view
    benchmark page)

55. Deploy; configure CDN + Cloudflare KV (not Redis \-\-- v1.2
    correction); set up Sentry monitoring + uptime alerts

56. GA4 custom events for all 10 KPI metrics in §1

**8. Design System Compliance Checklist**

Every stage sign-off must pass this checklist. Items 1--20 are from
CLAUDE_v3.md §24. Items 21--30 are Hadith module--specific additions.

  ------------------------------------------------------------------------
  **\#**   **Check**                                   **Reference**
  -------- ------------------------------------------- -------------------
  1        \<html lang=\"en\" data-theme=\"light\"\>   CLAUDE_v3.md §2
           opening tag                                 

  2        Fonts preconnected in order: Cormorant      CLAUDE_v3.md §2
           Garamond → Inter → Amiri                    

  3        :root block with all 50+ token variables;   CLAUDE_v3.md §1
           dark-mode sibling block UNMERGED            

  4        Navbar: 10 items in order; \"Hadith         CLAUDE_v3.md §4.1
           Library\" carries class=\"nav-link active\" 

  5        Mobile menu HTML included; hamburger        CLAUDE_v3.md §4.7
           visible only at ≤ 760px                     

  6        Bismillah: first child of .hero-inner;      CLAUDE_v3.md §5.1
           teal-gradient light / gold-gradient + glow  
           dark                                        

  7        Hero H1: var(\--font-display) with \<span   CLAUDE_v3.md §6
           class=\"gradient-italic\"\> for emphasis    

  8        Cards: hover translateY(-5px)               CLAUDE_v3.md §27.4
           scale(1.012) + glow ring --- NO shimmer     
           ::after sweep                               

  9        All hover transitions use                   CLAUDE_v3.md §13
           var(\--ease-reverent) or                    
           var(\--ease-premium)                        

  10       Footer HTML verbatim --- Ecosystem column:  CLAUDE_v3.md §7.4
           QuranlyAI, MosqueFinder, TravellyAI,        
           LearnSpeakAI                                

  11       CTA band present as last section before     CLAUDE_v3.md §11
           footer                                      

  12       Script block: theme toggle + search +       CLAUDE_v3.md §8
           mobile menu + reveal observer               

  13       \@media (prefers-reduced-motion: reduce)    WCAG 2.1 AA 2.3.3
           disables all continuous animations          
           (fade-up, pulse-dot, geoFloat)              

  14       Focus-trap active in Trace View overlay and WCAG 2.1 AA 2.1.2
           Share Modal when open                       

  15       Both light and dark themes tested on every  Hadith_Module_PRD
           stage sub-feature                           §12.0

  16       All breakpoints verified: 1100 / 900 / 760  Hadith_Module_PRD
           / 700 / 440px                               §12.0

  17       No new CSS colour tokens, radii, or easing  Hadith_Module_PRD
           curves outside CLAUDE_v3.md §1              §12.0

  18       All visible strings from blueprint          Hadith_Module_PRD
           preserved verbatim: collection names, grade §12.0
           labels, \"View Isnad\", \"Listen\",         
           \"Verify a Source\", \"Ask a Question\",    
           \"Browse →\", ┃ marker                      

  19       Grade badge tokens used verbatim:           CLAUDE_v3.md §1
           \--grade-sahih / \--grade-hasan /           
           \--grade-daif / \--grade-mawdu from         
           CLAUDE_v3.md §1                             

  20       Narrator reliability dots use defined       Func. Doc §10.1
           colour system (Thiqah green / Saduq gold /  
           Da\'if red / Unknown grey)                  

  21       Every hadith card shows a grade badge with  Func. Doc §20 rule
           a named grader --- no hadith displayed      1
           without grade                               

  22       Isnad chain ordering correct: Prophet ﷺ →   Func. Doc §6.5
           Companion → Tabi\'i → ... → Compiler        

  23       Every narrator reliability grade text       Func. Doc §20 rule
           traces to a named classical work (Taqrib    5
           at-Tahdhib, Tahdhib al-Kamal, Siyar A\'lam) 
           --- no fabricated gradings                  

  24       AI Explanation: system prompt not           Func. Doc §7.6 /
           overridable; no fatwa; no ruling; error     §20 rule 3
           state wired; \"✦ Powered by QuranlyAI\"     
           attribution                                 

  25       Every audio player shows reciter name ---   Func. Doc §20 rule
           never play audio without visible            6
           attribution                                 

  26       Every translation shows edition name and    Func. Doc §20 rule
           translator                                  7

  27       Copy with attribution includes full         Func. Doc §20 rule
           scholarly reference --- stripping           4
           attribution not permitted                   

  28       \"Verify a Source\" CTA wires to verify     Hadith_Module_PRD
           engine. \"Ask a Question\" pre-fills active §12.4.5
           hadith on Tier 3 routes.                    

  29       Hadith Trace View: \"✦ Powered by           Hadith_Module_PRD
           QuranlyAI\" attribution visible when AI     §12.6.1
           commentary shown                            

  30       Lighthouse Performance ≥ 90 on              §6.5 Performance
           /hadith/bukhari/1/1 (deep-view benchmark)   
  ------------------------------------------------------------------------

**9. Out of Scope**

The following are explicitly deferred per Hadith_Module_PRD.md §12.10
and must not block any Stage:

- User-created reading paths (data model supports it; UI ships post-auth
  --- Phase 14 admin)

- Server-side sync for notes and bookmarks (localStorage only in Stages
  1--4)

- Audio-linked narration with text-sync highlighting (complex timing
  layer)

- Hadith comparison across translations (§12.6.2 compares hadiths;
  translation-vs-translation is separate)

- Full hadith narration graph (visual graph of overlapping isnads across
  the corpus --- research-grade, expensive)

- Scholar-annotated reading lists from invited scholars (post-v1
  editorial feature)

- Hadith comparison of more than 3 items simultaneously

- All Dua page actions (per Functional Doc §23 --- handled in the Daily
  Duas PRD)

- All other platform pages: Home, Qur\'an Explorer, Islamic Studies,
  Knowledge Hub, Daily Duas, Tools, Habit Tracker, Verify, About

**10. Definition of Done --- Hadith Module**

Phase 7 is complete when every item below is checked off. No stage is
shipped until both its own acceptance criteria and these module-level
criteria are satisfied.

  --------------------------------------------------------------------
  **\#**   **Definition of Done Criterion**            **Verified By**
  -------- ------------------------------------------- ---------------
  1        All four stages signed off against their    Engineering
           individual acceptance criteria (§12.3.11,   Lead + Product
           §12.4.7, §12.5.6, §12.6.6 of                
           Hadith_Module_PRD.md)                       

  2        All routes in §2.2 deep-link, share, and    QA
           correctly handle back/forward browser       
           navigation                                  

  3        Every visible string from                   Product +
           hadith_module_enhanced\_\_1\_.html          Design
           blueprint preserved verbatim --- no         
           collection name, badge label, sidebar       
           heading, or action label altered            

  4        Dark-mode parity audit passed --- every     QA +
           component tested in                         Engineering
           \[data-theme=\"light\"\] and                
           \[data-theme=\"dark\"\]. All grade badges,  
           narrator dots, and trace view columns       
           verified.                                   

  5        All breakpoints render cleanly: 1100 / 900  QA
           / 760 / 700 / 440px --- verified on real    
           devices                                     

  6        All hover interactions use                  Engineering
           var(\--ease-reverent) for cards/panels and  
           var(\--ease-premium) for buttons            

  7        No new CSS colour tokens, radii, or easing  Engineering
           curves outside CLAUDE_v3.md §1              

  8        Every hadith card shows a grade badge with  Product + QA
           a named grader --- verified across all 18   
           collections                                 

  9        Narrator reliability grading audit: every   Product +
           reliability text in the panel traces to a   Scholarly
           named classical work (Taqrib at-Tahdhib,    Review
           Tahdhib al-Kamal, Siyar A\'lam              
           an-Nubala\'). No fabricated gradings.       

  10       AI Explanation system prompt verified as    Engineering +
           non-overridable. Fatwa/ruling detection     AI Safety
           strip tested with adversarial prompts. \"✦  
           Powered by QuranlyAI\" attribution visible. 

  11       Audio player always shows reciter name.     QA
           Copy always includes full attribution.      
           Translation always shows edition name.      

  12       \"Verify a Source\" and \"Ask a Question\"  Engineering +
           CTAs wired to verify engine. \"Ask a        QA
           Question\" pre-fills active hadith on all   
           Tier 3 routes.                              

  13       Focus-trap verified in Trace View overlay   QA +
           and Share Modal with VoiceOver and NVDA     Accessibility

  14       All error fallback states tested: API       QA
           timeout, CDN 404, narrator data failure, AI 
           timeout, storage quota exceeded, canvas     
           font timeout                                

  15       Lighthouse Performance ≥ 90, Accessibility  Engineering
           ≥ 90, Best Practices ≥ 90, SEO ≥ 90 on      
           /hadith/bukhari/1/1 (deep-view benchmark)   

  16       Reading path progress correctly persists    QA
           across sessions in localStorage.            
           \"Continue\" button opens the next unread   
           hadith.                                     

  17       GA4 custom events firing correctly for all  Analytics +
           10 KPI metrics defined in §1                Engineering

  18       CLAUDE_v3.md §24 enforcement checklist      Engineering
           (items 1--30 from §8 of this PRD) passes on 
           every route in §2.2                         
  --------------------------------------------------------------------

**11. Revision History**

  ----------------------------------------------------------------------------------
  **Version**   **Date**   **Author**     **Summary**
  ------------- ---------- -------------- ------------------------------------------
  v1.0          May 2026   IslamicInfo    Initial PRD --- synthesised from
                           Product Team   hadith_module_enhanced\_\_1\_.html
                                          blueprint,
                                          Hadith_Module_Functional_Document_v1.md,
                                          Hadith_Module_PRD.md (Phase 7 Enhanced
                                          Spec v2), and CLAUDE_v3.md v3.0

  v1.1          May 2026   Claude         FIX-1: Grade badge contrast computed for
                           (Anthropic)    all 4 grades × 2 themes; sahih and mawdu
                           --- Review &   dark-mode failures flagged with
                           Refinement     recommended fixes. FIX-2: Reading path
                                          count canonicalised to 4 paths per build
                                          spec §12.6.4; Daily Sunnah deferred.
                                          FIX-3: §4.8 Trace View deviation note
                                          added (3-col web vs 4-col functional
                                          spec). FIX-4: Error states added for Tier
                                          2 book list and Tier 3 deep-view fetches.
                                          FIX-5: US-H23b Continue Reading user story
                                          added with full AC.

  v1.2          July 2026  Claude         FIX-6: collection count corrected 9\u219218
                           (Anthropic)    throughout. FIX-7: data source corrected
                           --- Data       from single Sunnah.com API to confirmed
                           Source &       3-provider routing (HadithAPI.com via
                           Collection     Cloudflare Worker, fawazahmed0, AhmedBaset).
                           Count          FIX-8: cache layer corrected Redis\u2192
                           Correction     Cloudflare KV. FIX-9: \u00a72.3 table expanded
                                          to 18 rows + Source column, converted to
                                          markdown table. FIX-10: two bonus
                                          collections added (Forty Hadith Qudsi,
                                          Forty Hadith of Shah Waliullah). OPEN ITEM:
                                          locked blueprint not yet verified against
                                          18-collection layout \u2014 flagged, not
                                          resolved.
  ----------------------------------------------------------------------------------
