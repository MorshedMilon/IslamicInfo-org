**IslamicInfo.org**

Product Requirements Document

Qur\'an Explorer --- Complete Specification

*Version 1.1 · May 2026 · Refined Issue*

**Document Information**

  --------------- --------------------------------------------------
  **Version**     v1.1 --- Refined (5 issues resolved from v1.0
                  review)

  **Date**        May 2026

  **Status**      Ready for Engineering Review

  **Blueprint**   quran_v5.html (canonical visual source of truth
                  --- see §2.4 for version note)

  **Design        CLAUDE_v3.md (Design System v3.0)
  System**        

  **Functional    Quran_Module_Functional_Document_v2.md
  Spec**          

  **Build Spec**  Quran_Module_PRD.md (Phase 6 --- Enhanced Spec v2)

  **Author**      IslamicInfo Product Team

  **Reviewer**    Claude (Anthropic) --- PRD Review & Refinement

  **Companion     Home Page PRD v1.1 ·
  Docs**          IslamicInfo_Functional_Specification.docx v1.0
  --------------- --------------------------------------------------

**v1.1 Changes Summary**

- FIX-1 Added US-Q01b: Stage 1 WBW base toggle user story --- missing
  from v1.0

- FIX-2 Tajweed colour contrast: actual WCAG ratios computed and cited;
  tj-ikhfa and tj-madd flagged as AA-large-only in light mode;
  recommended fixes noted

- FIX-3 Added US-Q16b: Focus-trap user story with full acceptance
  criteria

- FIX-4 Added §2.4: Blueprint version note (quran_v3.html →
  quran_v5.html progression)

- FIX-5 Added §11: Definition of Done --- full module sign-off checklist
  from Quran_Module_PRD §11.11

**Build Stage Overview**

  --------------------------------------------------------------------------
  **Stage**    **Theme**         **Gap IDs**  **Key Outcome**
  ------------ ----------------- ------------ ------------------------------
  Stage 1 ---  Blueprint         Q-G1--3,     114 Surahs live, translation
  Foundation   parity + live     Q-G5--8,     dropdown, audio player,
               data              Q-G18        3-source tafsir, Today\'s
                                              Reflection

  Stage 2 ---  Daily-user        Q-G9--17,    Reading Mode, font controls,
  Reader       reliability layer Q-G19--21    bookmarks, notes, deep-link,
  Comfort                                     search, share image, offline /
                                              PWA

  Stage 3 ---  Scholarly         Q-G4,        WBW grammar tags, Tajweed
  Learning     richness          Q-G22--23    colour-coding, translation
  Depth                                       comparison mode

  Stage 4 ---  Premium           Q-G24 + new  AI Explain (QuranlyAI), Verse
  Signature    differentiation                Trace View, reading streaks,
  Features                                    Study Mode
  --------------------------------------------------------------------------

**1. Executive Summary**

This PRD defines complete functional, visual, and technical requirements
for the Qur\'an Explorer page of IslamicInfo.org (route /quran, file
quran.html). It is the most feature-rich page on the platform and its
primary scholarly tool.

The Qur\'an Explorer delivers a full-featured reading experience across
two layouts --- Study Mode and Mushaf Mode --- with live audio
recitation, three Tafsir sources, multilingual translations,
word-by-word grammar analysis, Tajweed colour-coding, and AI-powered
explanations. Ten futuristic features (§16 of the Functional Document)
define the platform\'s competitive differentiation.

**Product Vision**

\"Read, Listen & Understand the Holy Qur\'an\" --- the Explorer must
feel simultaneously like a traditional Mushaf, a scholarly workbook, and
an intelligent study companion, serving the casual reader, the student
of Arabic, and the serious researcher in a single interface.

**Key Success Metrics**

  ----------------------------------------------------------------------
  **Metric**     **Target**       **Measurement Method**   **Owner**
  -------------- ---------------- ------------------------ -------------
  Daily active   \> 10 min        GA4 --- session          Product
  reader         average session  duration, segment: page  
  sessions                        = /quran                 

  Audio          \> 45% of        Custom event:            Engineering
  recitation     sessions trigger audio_play_started per   
  engagement     playback         session                  

  Tafsir         \> 20% of reader Custom event:            Product
  engagement     sessions         tafsir_panel_opened per  
  rate                            session                  

  Word-by-word   \> 30% of        Custom event:            Product
  mode usage     sessions enable  wbw_toggled state=on per 
                 WBW              session                  

  AI Explanation \> 15% of reader Custom event:            Product / AI
  engagement     sessions         ai_explain_opened per    
                                  verse per session        

  Bookmark /     \> 8% of         Custom event:            Product
  Note creation  sessions create  bookmark_saved or        
  rate           ≥ 1 item         note_saved per session   

  7-day reading  \> 25% of        localStorage streak data Product
  streak         returning users  surfaced via optional    
                                  anonymous analytics      
                                  event                    

  Reading Mode   \> 10% of        Custom event:            Product
  activation     sessions         reading_mode_toggled     
                                  state=on                 

  Lighthouse     ≥ 90 on          Automated Lighthouse CI  Engineering
  Performance    representative   on every deploy          
  score          reader page                               
  ----------------------------------------------------------------------

**2. Page Overview & Visual Flow**

**2.1 Page Anatomy (as defined in quran_v5.html)**

The page follows a vertical stack of distinct zones, each with its own
data-screen-label. The reader shell (sidebar + reader main + tafsir
panel + audio player) is the dominant zone occupying the majority of
viewport height.

  --------------------------------------------------------------------------------
  **\#**   **Zone**     **data-screen-label /  **Description**
                        ID**                   
  -------- ------------ ---------------------- -----------------------------------
  1        Navbar       Header /               Sticky; Quran Explorer carries
                        id=\"siteHeader\"      class=\"nav-link active\"

  2        Hero         (section.hero)         Bismillah + eyebrow badge + H1
                                               \"Read, Listen & Understand the
                                               Holy Qur\'an\" + subtitle + hero
                                               buttons (Continue Reading, Start
                                               with Al-Fatihah)

  3        Reader Shell id=\"readerShell\"     Full-width container: Sidebar \|
                                               Reader Main \| Tafsir Panel stacked
                                               horizontally

  3a       ↳ Sidebar    id=\"sidebar\"         Surah list (114 rows), search
                                               input, reading progress bar, streak
                                               strip, offline badge

  3b       ↳ Reader     id=\"readerMain\"      Reader Topbar (rows 1 & 2) + Verses
           Main                                Area (Study Mode card list or
                                               Mushaf Page View)

  3c       ↳ Tafsir     id=\"tafsirPanel\"     Collapsible 278px panel: 3-source
           Panel                               tab strip + lazy-loaded commentary
                                               text

  3d       ↳ Audio      .audio-player          Dark teal bar pinned to bottom of
           Player                              reader: waveform, controls,
                                               reciter, scrub bar

  4        Today\'s     .trio-section          3 cards: Verse of the Day · Hadith
           Reflection                          of the Day · Dua of the Day

  5        Features     .feat-section          Feature cards: WBW · Tajweed · AI
                                               Explain · Compare · Offline ·
                                               Mobile App

  6        CTA Band     .cta-band              Dark teal gradient; \"Begin Your
                                               Qur\'an Journey\" primary CTA

  7        Footer       id=\"ii-footer\"       Global 5-column footer per
                                               CLAUDE_v3.md §7

  ---      Settings     id=\"settingsPanel\"   Fixed; slides from right: font
           Panel        .settings-panel        controls + toggles

  ---      Bookmarks    .bookmarks-panel       Fixed; slides from left:
           Panel                               categorised bookmark browser

  ---      Share Modal  id=\"shareModal\"      Full-screen centred overlay: share
                        .share-modal           link + canvas image generator

  ---      Verse Trace  .trace-overlay         Fixed full-screen: 3-column
           View                                research layout

  ---      Search       (search overlay)       Global search popup + Quran-scoped
           Overlay                             dedicated search page /quran/search
  --------------------------------------------------------------------------------

**2.2 Reading Mode Visual Override**

When Reading Mode is active (class=\"reading-mode\" on \<html\>), the
following zones are hidden via display:none !important: .hero ·
.trio-section · .feat-section · .cta-band · footer · .audio-player ·
.site-header. The reader-shell expands to height:100vh. The reader-main
background shifts to var(\--gold-50) in light mode. The rtb-row2 fades
to opacity 0.25 and reappears on topbar hover.

**2.3 Route Map**

  ----------------------------------------------------------------------------------------
  **Route**                         **Stage**   **Purpose**
  --------------------------------- ----------- ------------------------------------------
  /quran                            Stage 1     Default: loads Al-Fatihah (Surah 1) in
                                                Study Mode

  /quran/\[surah\]                  Stage 1     Reader --- live verse cards for any of the
                                                114 Surahs

  /quran/\[surah\]/\[ayah\]         Stage 2     Deep-link: loads surah, scrolls to ayah,
                                                fires pulse-ring animation

  /quran/search                     Stage 2     Dedicated Qur\'an-only search (Arabic ·
                                                Translation · Topic filter chips)

  /quran/compare                    Stage 3     Translation comparison mode ---
                                                multi-edition side-by-side

  /quran/trace/\[surah\]/\[ayah\]   Stage 4     Verse Trace View --- 3-column research
                                                environment
  ----------------------------------------------------------------------------------------

**2.4 Blueprint Version Note \[FIX-4\]**

*FIX-4 applied: Quran_Module_PRD.md repeatedly references
\"quran_v3.html\" as the baseline blueprint. The file uploaded for this
PRD is quran_v5.html --- the current canonical version. This note
documents the progression.*

  ---------------------------------------------------------------------
  **Blueprint     **Status**   **Notes**
  Version**                    
  --------------- ------------ ----------------------------------------
  quran_v3.html   Superseded   Original baseline referenced in
                               Quran_Module_PRD.md §11.0. Do not use
                               for visual reference.

  quran_v4.html   Superseded   Intermediate iteration. Superseded by
                               v5.

  quran_v5.html   CANONICAL    Active blueprint as of May 2026. All
                  --- current  visual, structural, and content
                               decisions derive from this file. This
                               PRD v1.1 is aligned to quran_v5.html
                               verbatim.
  ---------------------------------------------------------------------

Engineering rule: always open quran_v5.html when checking visual
fidelity. Never use v3 or v4 as reference. If a future quran_v6.html is
produced, this PRD must be updated before any new development begins.

**3. User Stories & Acceptance Criteria**

**3.1 Stage 1 --- Foundation (Blueprint Parity + Live Data)**

**▸ US-Q01 --- FULL SURAH INDEX**

**As a reader, I want to see all 114 Surahs in the sidebar so I can
choose any Surah to read.**

**Acceptance Criteria:**

- All 114 Surah rows render in the sidebar, fetched from
  api.quran.com/api/v4/chapters

- Each row shows: numbered teal/gold square chip → English name →
  Makki/Madani chip → \"· N ayahs\" count → RTL Arabic name
  (right-aligned)

- Skeleton shimmer animation shows during fetch; fallback to
  /data/chapters.json on error

- Sidebar search input filters surah list case-insensitively in
  real-time

- Filter chips \"Makki\" / \"Madani\" (above search) narrow the list;
  combinable with search text

- Currently active surah row carries class=\"surah-row active\" with
  left teal border

- A 4px reading-progress dot (var(\--teal-500)) appears on the right
  edge of rows where user has any read verses

**▸ US-Q02 --- LIVE VERSE ENGINE**

**As a reader, I want clicking a Surah to instantly load its verses so I
can begin reading without page reload.**

**Acceptance Criteria:**

- Selecting a surah fetches verses from
  api.quran.com/api/v4/verses/by_chapter/{id} with translation,
  text_uthmani, and verse_key fields

- Each verse renders as an .ayah-card with: ayah-num-badge, action
  buttons row, Arabic text (Amiri font, RTL), WBW row, translation text,
  translation attribution, ayah footer (reference + Tafsir button +
  Trace View button)

- Bismillah banner (.bismillah-banner) renders above verse 1 for all
  Surahs except At-Tawbah (Surah 9)

- Reader topbar (row 1) updates: Surah name + type badge + verse count +
  Juz info

- A \"Next: {SurahName} ({N} ayahs)\" soft-load button appears after the
  final verse

- Verse data cached 24h per surah per language

- On fetch failure: fallback to seed JSON; never blank screen

**▸ US-Q02B --- WORD-BY-WORD BASE DISPLAY \[FIX-1\]**

**As a reader, I want to see word-by-word meaning below the Arabic text
so I can follow the translation word for word from the first visit.**

**Acceptance Criteria:**

*FIX-1 applied: quran_v5.html shows .wbw-row active by default in all
rendered ayah-cards. The base WBW display was unspecced in v1.0 Stage 1.
Grammar tag POS chips are Stage 3 only.*

- Each .ayah-card renders a .wbw-row (direction:rtl) by default,
  containing one .wbw-word per Arabic word

- Each .wbw-word contains: .wbw-ar (Arabic word, Amiri font, RTL) and
  .wbw-en (English gloss, Inter 11px, ink-muted). The third row .wbw-pos
  (POS chip) is Stage 3 only --- not rendered in Stage 1.

- The WBW toggle button in .rtb-row2 (pre-existing .ctrl-btn, labelled
  \"WBW\") shows/hides all .wbw-row elements across the verses area

- Default state: WBW visible (active). User preference (\"WBW on/off\")
  persists via the Settings panel toggle wired in Stage 2.

- During audio playback: the .wbw-word matching the current audio
  timestamp receives class=\"hl\" (highlighted). This sync is wired in
  Stage 1 alongside the audio player.

- WBW word data fetched alongside verse text in the same api.quran.com
  call, using word_fields=text_uthmani,translation. Grammar fields
  (part_of_speech) are NOT fetched until Stage 3.

**▸ US-Q03 --- MULTILINGUAL TRANSLATION DROPDOWN**

**As a non-English speaker, I want to select my language so I can read
translations I understand.**

**Acceptance Criteria:**

- The translation dropdown (existing in .rtb-row2, default \"Sahih
  Intl.\") lists ≥ 7 English editions plus multilingual editions
  covering the 10 supported languages: English, Bangla, Hindi, Urdu,
  Arabic, Spanish, French, Turkish, Malay, Indonesian

- Selecting a translation re-renders the verses area only (not sidebar).
  Preference stored in localStorage key \"ii-quran-translation\"

- Dropdown panel uses the glass popup pattern: background
  rgba(255,255,255,.85), backdrop-filter blur(20px), border-radius
  var(\--r-lg), box-shadow var(\--elev-3)

- Arabic Qur\'anic text never passes through the translation layer ---
  always rendered in original Arabic

**▸ US-Q04 --- AUDIO RECITATION PLAYER**

**As a listener, I want to play verse-by-verse recitation with a choice
of reciter so I can listen and follow the text simultaneously.**

**Acceptance Criteria:**

- Single global \<audio\> element wired to all player controls:
  Play/Pause, scrub bar, current time / duration (mm:ss), speed cycling
  (1.0→1.25→1.5→2.0→1.0), Rewind 10s, Forward 10s, Prev/Next ayah

- Reciter dropdown lists 50+ reciters sourced from
  api.quran.com/api/v4/resources/recitations. Selection rebuilds audio
  URL from EveryAyah CDN pattern:
  everyayah.com/data/{reciter_path}/{surah_padded}{ayah_padded}.mp3

- Auto-advance: on audio.ended, loads next ayah audio and plays; scrolls
  next ayah into view if outside viewport. Toggle in Settings panel.

- Active ayah highlighted (.active-verse ring border + card accent)
  while playing

- Waveform animation visible in audio player dark bar during playback

- Preload: current ayah only; begin preloading next URL when ≥ 80% of
  current is played. Never preload more than 1 ahead.

- Player pauses and resets on surah navigation or page unload

**▸ US-Q05 --- THREE-SOURCE TAFSIR PANEL**

**As a student, I want to read classical commentary on any verse so I
can understand its depth.**

**Acceptance Criteria:**

- Tafsir panel (278px, id=\"tafsirPanel\") slides from the right of
  reader-main. Default state: closed (class=\"closed\", width:0)

- Three source tabs: Ibn Kathir (default, English, ID 169) · al-Tabari
  (Arabic, ID 91) · al-Qurtubi (Arabic, ID 90)

- Tafsir is lazy-loaded --- fetched only when panel opens, not on page
  load. API: api.quran.com/api/v4/tafsirs/{id}/by_ayah/{verse_key}

- Panel renders: ayah reference header, Arabic verse block, commentary
  paragraphs, attribution line

- If no entry exists: renders \"No commentary available from {source}\"
  --- never fabricate

- Tafsir data cached 7 days per tafsir + verse_key (immutable)

**▸ US-Q06 --- TODAY\'S REFLECTION TRIO**

**As a daily visitor, I want to see a verse, hadith, and dua on the
Qur\'an page so it delivers value even before I open the reader.**

**Acceptance Criteria:**

- Three .trio-card elements in .trio-section: Verse of the Day
  (api.quran.com random verse + Sahih Intl. translation) · Hadith of the
  Day (random-hadith CDN, always SAHIH badge) · Dua of the Day
  (/data/duas.json keyed by day-of-year mod size)

- Skeleton shimmer during fetch; fallback to static seed content on any
  failure

- Live data populates into existing markup wrappers --- zero structural
  changes

- \"Read More\" / \"View Tafsir\" / \"More Duas\" CTAs route to /quran,
  /hadith, and /dua respectively

**3.2 Stage 2 --- Reader Comfort**

**▸ US-Q07 --- READING MODE**

**As a focused reader, I want to hide all page chrome so I can read
without distraction.**

**Acceptance Criteria:**

- #readModeBtn in rtb-row1 toggles class=\"reading-mode\" on \<html\>.
  Hides: .hero, .trio-section, .feat-section, .cta-band, footer,
  .audio-player, .site-header

- Sidebar auto-collapses. Tafsir panel auto-closes. Reader-shell expands
  to 100vh.

- reader-main background shifts to var(\--gold-50) in light mode;
  unchanged in dark mode

- rtb-row2 fades to opacity 0.25; reappears on topbar hover (transition
  .25s)

- Floating \"Exit Reading Mode\" button (fixed, top-right, z-index 500,
  teal bg) visible only in reading-mode

- Escape key exits. URL updates to ?mode=reading. localStorage key
  \"ii-quran-reading-mode\" restores on reload

- \@media (prefers-reduced-motion: reduce): all reading-mode transitions
  instant

**▸ US-Q08 --- SETTINGS PANEL --- FONT CONTROLS**

**As a reader with visual preferences, I want to control Arabic and
translation font sizes so my reading is comfortable.**

**Acceptance Criteria:**

- #settingsBtn toggles settings panel: slides from right
  (translateX(100%) → translateX(0)), 288px wide, border-left 0.5px
  rgba(0,105,110,.18)

- Arabic font size: 4 steps --- S (24px) · M (32px, default) · L (40px)
  · XL (50px). Pill track using .chip class; active step: teal-700 bg,
  white text

- Translation font size: 3 steps --- S (14px) · M (16px, default) · L
  (18px)

- Font sizes update live via CSS custom property \--ayah-ar-size and
  \--ayah-tr-size on documentElement

- Preferences stored in localStorage: \"ii-quran-ar-size\" and
  \"ii-quran-tr-size\"; restored on page load

- Settings panel also contains toggles: Word-by-word · Show grammar tags
  · Auto-advance audio · Show transliteration

- \"Reset to defaults\" button restores all settings and clears
  localStorage keys

**▸ US-Q09 --- VERSE NOTES**

**As a student, I want to add personal reflections to any verse so I can
build my own commentary.**

**Acceptance Criteria:**

- Note icon button is 5th in .ayah-actions order: Play · Bookmark · Copy
  · Share · Notes (appended --- never reorder prior buttons)

- Click opens .note-editor inline below the verse (class=\"show\"):
  gold-50 background, 0.5px gold border, textarea (min-height 72px,
  resize vertical), Cancel + Save Note buttons

- Save: stores note to localStorage \"ii-quran-notes\" as
  Array\<{verseKey, text, updatedAt}\>. Max 2000 chars.

- Visual signal: note icon turns gold-filled; .ayah-num-badge gains a
  3px gold dot (top-right, var(\--gold-500)) on verses with saved notes

- Textarea focus state: border-color var(\--teal-500), box-shadow 0 0 0
  3px rgba(44,164,171,.12)

- Dark mode: note editor background rgba(197,160,89,.08)

**▸ US-Q10 --- BOOKMARKS WITH CATEGORIES**

**As a returning reader, I want to bookmark verses and organise them
into categories so I can find my saved content quickly.**

**Acceptance Criteria:**

- Bookmark icon (2nd in .ayah-actions) toggles: on save, icon fills
  gold + class=\"bookmarked\"; a category tooltip slides in from top
  (\"Saved to: General ▾\")

- Tooltip lists default categories: General · Memorization · Reflection
  · Favourite Duas · Important. User can add up to 15 custom categories.

- Tooltip auto-dismisses after 2.5s if not interacted with. Style: .card
  glass variant, var(\--r-sm), var(\--elev-2)

- Bookmarks panel (slides from left, 300px, id via .bookmarks-panel):
  chip filter row (All · General · Memorization · ...) + bookmark cards

- Each bookmark card shows: Surah name + ayah ref + category tag ·
  Arabic snippet · translation snippet · \"N days ago\" timestamp · Jump
  button (→)

- Clicking a bookmark card loads the surah and scrolls to +
  pulse-highlights the saved ayah

- Storage: localStorage \"ii-quran-bookmarks\" as Array\<{verseKey,
  surahName, surahId, ayahNo, category, addedAt}\>

**▸ US-Q11 --- READING PROGRESS & CONTINUE READING**

**As a reader who leaves mid-Surah, I want the page to remember where I
stopped so I can continue seamlessly.**

**Acceptance Criteria:**

- IntersectionObserver (throttled 1s) tracks topmost visible .ayah-card.
  Stores to localStorage \"ii-quran-last-read\": {verseKey, surahId,
  ayahNo, surahName, timestamp}

- On page load with no explicit surah in URL: restores last-read surah
  and scrolls to last-read ayah (smooth)

- \"Continue Reading\" hero button: loads last-read surah,
  smooth-scrolls to ayah, fires single-pulse of .active-verse ring

- Sidebar reading progress bar animates to (ayahsRead.size / 6236 ×
  100)% --- transition: width 0.6s var(\--ease-reverent)

- An ayah is counted \"read\" when visible in viewport ≥ 3 continuous
  seconds (IntersectionObserver + setTimeout)

- Surah rows in sidebar show a 4px teal dot on right edge if user has
  any read verse in that surah

**▸ US-Q12 --- DEEP-LINK PULSE-RING**

**As a user following a shared verse link, I want the linked verse to be
highlighted so I immediately see what was shared.**

**Acceptance Criteria:**

- URLs /quran/{N}/{M} or ?surah=N&ayah=M: loads surah N, scrolls to
  .ayah-card\[data-key=\"{N}:{M}\"\], fires 2-iteration pulse-ring
  animation

- Pulse keyframe: 0% box-shadow 0 0 0 0 rgba(0,105,110,.5) → 50% 0 0 0
  16px rgba(0,105,110,0) → 100% 0 (1.8s, ease-reverent, 2 iterations)

- After animation: class removed; card settles to active border-color
  rgba(0,105,110,.35)

- prefers-reduced-motion: skip animation, apply border-color only

**▸ US-Q13 --- QUR\'AN-SCOPED SEARCH**

**As a researcher, I want to search across all Qur\'an text and
translations so I can find any verse by content.**

**Acceptance Criteria:**

- Route /quran/search renders a dedicated search page with a glass-pill
  search input (same pattern as home page search bar:
  rgba(255,255,255,.7), blur(14px), border-radius 999px)

- Search targets: Arabic text (exact string on text_uthmani),
  translation text (case-insensitive substring), topic tag

- Filter chips above results: Arabic · Translation · Topic --- using
  existing .chip class

- Results render as .ayah-card elements with matching text wrapped in
  \<mark\> (background rgba(0,105,110,.12), border-radius 3px)

- Global search popup scope chip \"Quran\" routes to /quran/search

**▸ US-Q14 --- SHARE IMAGE GENERATOR**

**As a user who wants to share a verse, I want to generate a beautiful
shareable image so I can post it to social media.**

**Acceptance Criteria:**

- Share button (4th in .ayah-actions) opens a popover with two options:
  \"Share link\" and \"Generate share image\"

- Share image modal (.share-modal, fixed full-screen, z-index 400):
  format selector chips (Square 1080×1080 · Story 1080×1920), canvas
  preview, Download PNG button, Share... button

- Canvas composition: hero-bg 3-radial gradient background · 4% opacity
  geometric star pattern overlay · IslamicInfo wordmark (teal+gold) ·
  Arabic text (Amiri, large, centered, RTL) · thin gold divider line ·
  translation text (Cormorant Garamond italic) · \"Surah Name · N:M ·
  Translation Edition\" attribution · goldleaf corner ornament

- Document fonts loaded via Promise.all(\[document.fonts.load(\...)\])
  before canvas draw

- Generated filename: IslamicInfo\_{SurahName}\_{N}-{M}.png

- \"Share...\" uses navigator.share({files:\[blob\]}) on mobile;
  clipboard copy on desktop

**▸ US-Q15 --- COPY WITH ATTRIBUTION**

**As a user sharing a verse in conversation, I want copy to include full
attribution so the source is always clear.**

**Acceptance Criteria:**

- Copy button (3rd in .ayah-actions) produces attribution payload:
  translation text → newline → Arabic text → blank line → \"--- Surah
  {Name} {N}:{M} · {Translation Edition}\" → \"Read at
  islamicinfo.org/quran/{N}/{M}\"

- Toast: \"Copied with attribution\" --- slides from bottom, 2.5s
  timeout, existing toast component

**▸ US-Q16 --- OFFLINE / PWA CACHE**

**As a user with intermittent connectivity, I want to read cached Surahs
offline so my reading is never interrupted.**

**Acceptance Criteria:**

- Service worker quran-sw.js registered. Cache strategies: static shell
  → cache-first; current surah + last 3 viewed verse data → cache-first
  with background revalidate; audio → stream only (no offline unless
  explicit)

- \"Available offline\" 6px teal dot (.teal-500, same as hijri-pill dot
  animation) appears in sidebar when surah is cached from service worker

- manifest.json linked from \<head\>: icons 192×192 + 512×512 SVG
  variants of IslamicInfo logo mark

- \"Download for offline\" sidebar button: user selects individual
  Surahs, by Juz, or all 114. Caches Arabic text + current translation +
  WBW data.

**▸ US-Q16B --- FOCUS TRAP ON ALL OVERLAYS \[FIX-3\]**

**As a keyboard user, I want Tab navigation to stay within open panels
and modals so I do not accidentally interact with content behind them.**

**Acceptance Criteria:**

*FIX-3 applied: Focus-trap was referenced in §8 checklist and §7 roadmap
but had no user story or AC in v1.0. This user story corrects that gap.*

- When any of the following is open, Tab and Shift+Tab cycle only
  through focusable elements within that overlay: Verse Trace View
  (.trace-overlay) · Share Modal (.share-modal) · Settings Panel
  (.settings-panel) · Bookmarks Panel (.bookmarks-panel)

- Focus-trap implementation: on overlay open, capture first and last
  focusable elements; intercept Tab/Shift+Tab keydown; wrap focus at
  boundaries

- On overlay close (via ✕ button, Escape key, or overlay click-outside
  where applicable): focus returns to the element that triggered the
  overlay open

- Escape key closes the frontmost overlay in all cases; does not
  propagate to parent overlays

- prefers-reduced-motion has no effect on focus-trap behaviour --- it is
  always active when the overlay is open

- Verified with VoiceOver (macOS/iOS) and NVDA (Windows) that screen
  reader virtual cursor is also constrained within the overlay

**3.3 Stage 3 --- Learning Depth**

**▸ US-Q17 --- WORD-BY-WORD GRAMMAR TAGS**

**As an Arabic learner, I want to see the part of speech for every word
so I understand the grammar as I read.**

**Acceptance Criteria:**

- Each .wbw-word has 3 rows: .wbw-ar (Arabic) · .wbw-en (English gloss)
  · .wbw-pos (POS chip --- appended, Stage 3)

- POS chips colour-coded: NOUN (teal-700, rgba(0,105,110,.08) bg) · VERB
  (gold-700, rgba(197,160,89,.12) bg) · PARTICLE (ink-muted,
  rgba(109,121,122,.08) bg) · PRONOUN (teal-500, rgba(44,164,171,.1) bg)
  · PREP (ink-muted, same as PARTICLE)

- POS chip: 9px, font-weight 700, letter-spacing .1em, uppercase,
  padding 2px 7px, border-radius 999px

- Root tooltip on word hover (.wbw-word:hover): .card glass variant,
  shows 3-letter root consonants + English meaning

- \"Show grammar tags\" toggle in Settings panel shows/hides all
  .wbw-pos elements

- WBW grammar data from api.quran.com with
  word_fields=text_uthmani,transliteration,translation,part_of_speech.
  Cached 7 days (immutable).

**▸ US-Q18 --- TAJWEED COLOUR-CODING**

**As a Tajweed student, I want Arabic verse text colour-coded by
recitation rule so I can practise correct pronunciation.**

**Acceptance Criteria:**

- \"Tajweed\" toggle button appended to .rtb-row2 after the WBW button
  (never reorder prior buttons). Label: \"Tajweed\". Style: .ctrl-btn.
  Active state: teal bg.

- When active, Arabic text replaces plain text with \<span
  class=\"tj-\*\"\> wrappers per rule: tj-ghunna (green #2E7D32) ·
  tj-ikhfa (amber #B07D00) · tj-idgham (blue #1565C0) · tj-qalqalah
  (deep rose #880E4F) · tj-madd (var(\--teal-600)) · tj-laam-sh (purple
  #4A148C)

- Dark-mode overrides: lighter variants for all 6 colours (defined in
  \[data-theme=\"dark\"\] block)

- Tajweed legend strip appears immediately above verses area when
  Tajweed is on: \"● Ghunna ● Ikhfa ● Idgham ● Qalqalah ● Madd ● Laam
  sh.\" --- dismissable; preference in localStorage
  \"ii-quran-tajweed-legend\"

- Tajweed data fetched lazily on first toggle per surah. Fallback: plain
  Arabic text if unavailable.

- Applied within ≤ 0.5s of toggle click

**▸ US-Q19 --- TRANSLATION COMPARISON MODE**

**As a scholar, I want to compare multiple translations side-by-side so
I can understand nuances in interpretation.**

**Acceptance Criteria:**

- \"Compare\" toggle button appended to .rtb-row2 after the translation
  dropdown separator. Style: .ctrl-btn; active: class=\"compare-active\"
  (teal bg, teal border --- as shown in quran_v5.html CSS)

- When Compare mode is on, each .ayah-card shows 3 stacked translation
  blocks under Arabic text: user\'s active selection (full teal-700 left
  bar) + next 2 in fixed order (Sahih Intl. → Pickthall → Yusuf Ali,
  lighter teal-200 bar)

- Each translation block: translator name (Inter 700, 10px, uppercase,
  ink-muted) above translation text with border-inline-start 3px solid

- All 3 editions fetched in one API call: ?translations=131,85,95. No
  extra round trips.

- Compare mode preference stored in localStorage
  \"ii-quran-compare-mode\"

- /quran/compare route: persistent comparison mode with URL-addressable
  state

**3.4 Stage 4 --- Signature Features**

**▸ US-Q20 --- AI EXPLANATION (QURANLYAI)**

**As a reader encountering an unfamiliar verse, I want a plain-language
explanation so I can understand it without needing a library.**

**Acceptance Criteria:**

- AI sparkle icon button is 6th (last) in .ayah-actions: Play · Bookmark
  · Copy · Share · Notes · Explain (appended)

- Click opens .ai-card (slides up from below verse, translateY(12px)→0,
  opacity 0→1, 0.38s ease-reverent): gradient bg rgba(197,160,89,.06) +
  rgba(0,105,110,.03), gold border 0.5px, border-radius 14px

- Loading state: single-line skeleton shimmer in .ai-text area

- Calls Anthropic API (claude-sonnet-4-20250514, max_tokens 1000) with
  Quran-specific system prompt: plain-language 2-3 sentence contextual
  explanation, no fatwa, no fabrication, cite Tafsir where relevant

- Response rendered as plain paragraphs in .ai-text. Attribution footer:
  \"✦ Powered by QuranlyAI\" (teal-700, Inter 700, 11px, caps, links to
  quranlyai.com)

- API failure: \"Explanation unavailable --- please try again\" in
  .ai-text; ✕ close button always present

- System prompt is NOT overridable by any user input. Strip any fatwa or
  fabricated source from response before rendering.

**▸ US-Q21 --- VERSE TRACE VIEW**

**As a researcher, I want a single-verse focused research environment so
I can study one ayah deeply without distraction.**

**Acceptance Criteria:**

- \"Trace View →\" button (.trace-btn) in .ayah-footer: gold-toned pill
  (gold-700 color, rgba(197,160,89,.06) bg, .5px gold border). Click
  opens .trace-overlay (fixed full-screen, z-index 300)

- Accessible also via route /quran/trace/{surah}/{ayah}

- Trace View layout: persistent top bar (breadcrumb: Collection › Surah
  › Verse N \| action buttons: 🔖 ↗ 📋 \| \"Exit Trace View →\" teal
  button) + 3-column body (1fr : 1.4fr : 1fr grid at ≥ 1300px; stacks at
  ≤ 900px)

- LEFT COLUMN: Tafsir inline (3-source tab strip, same sources as main
  panel)

- CENTER COLUMN: Arabic verse large (Amiri 26px, RTL, teal-tinted bg,
  border-radius 12px) · translation (Cormorant Garamond italic 17px,
  teal left bar) · source badge · attribution in font-mono

- RIGHT COLUMN: Topic chips → Related verses (2-3 thematically linked
  ayahs with surah + ayah ref + \"Jump\" link) → Grammar summary of
  notable words (.trace-wbw-grid, RTL flexwrap, direction:rtl)

- \"Exit Trace View →\" returns to surah reader at same verse

**▸ US-Q22 --- READING STREAKS**

**As a daily reader, I want to track my reading streak so I stay
motivated to read every day.**

**Acceptance Criteria:**

- Streak strip (.sb-streak) is first element in sidebar below search
  input: \"✦ N-day streak\" label (teal-600, Inter 700, 10px
  uppercase) + \"Habit Tracker →\" link (gold-700, links to
  habits.html?source=quran)

- 7-day strip (.sb-streak-days): 7 day-cells, 28×28px, var(\--r-sm).
  States: read day (teal-700 bg, white checkmark) · today not yet read
  (dashed teal-500 border) · future (ink-faint bg) · 0-day: shows
  \"Start your streak today\" in ink-muted

- Streak data in localStorage \"ii-quran-streak\": {lastReadDate,
  currentStreak, longestStreak, readDays\[\]}. A day is counted \"read\"
  after user views ≥ 3 verses (3s each --- same threshold as reading
  progress counter)

- On mobile (≤ 760px): streak strip also appears below reader breadcrumb
  bar

- longestStreak persists correctly and is not reset when current streak
  breaks

**▸ US-Q23 --- MUSHAF MODE**

**As a traditional reader, I want a page-by-page book layout so I
experience the Qur\'an as a physical Mushaf.**

**Acceptance Criteria:**

- Study/Mushaf toggle in .rtb-row1 is mutually exclusive. \"Mushaf
  Mode\" label per Functional Document §5.2 naming decision (never
  \"Arabic Only\")

- When Mushaf Mode active (class=\"mushaf-mode-active\" on
  reader-shell): #versesCardList hidden; #mushafPageView shown

- Mushaf page renders: .mushaf-page-header (Surah name RTL Arabic +
  \"Page N · Juz N · Surah Name\") · .mushaf-bismillah (teal in light,
  cyan in dark) · grouped verse lines in Uthmani font ·
  .mushaf-page-footer with page navigation (← Previous Page · Next Page
  →)

- In Mushaf Mode: .bismillah-banner hidden (Bismillah shown inside page
  itself)

- WBW, translation, Compare, and Tafsir remain accessible from Mushaf
  mode (sidebar + tafsir panel unchanged)

**▸ US-Q24 --- FUTURISTIC FEATURES (PHASE 2+ ROAD MAP)**

**As a product stakeholder, I need visibility on the full feature road
map so I can plan ahead.**

**Acceptance Criteria --- Functional Requirements Defined
(Implementation deferred):**

- Hifz Mode (§16.1): words hidden progressively per ayah; user taps to
  reveal or types to test; score + streak + milestone badges. Toolbar
  button in Study Mode.

- Reading Pace Timer (§16.2): optional per-ayah minimum timer; next-ayah
  button locks during countdown; gold ring visual indicator; reflection
  prompt at session end.

- Daily Verse Journey (§16.3): goal selection on first visit (Complete
  Quran · Juz/month · Al-Fatihah deep · Theme); today\'s reading
  recommendation in sidebar; 7-day and 30-day streak arcs.

- Root Word Explorer (§16.4): tapping any WBW word shows root tooltip:
  3-letter root · English meaning · count of occurrences across Quran +
  links.

- Verse Emotion Tags (§16.5): anonymous per-verse tags (🤲 Grateful · 💭
  Reflecting · 💛 Comforting · 🌟 Inspiring · 🙏 Seeking); dominant tag
  shown in verse footer. No accounts required; no individual data
  stored.

- Surah Thematic Map (§16.6): visual grid of all 114 Surahs colour-coded
  by theme; filter by theme / Juz / Makki/Madani; 2-line summary tooltip
  on hover/tap.

- Side-by-Side Language Reading (§16.7): 2-column Study Mode card ---
  Arabic right, translation left; both columns scroll in sync. Available
  Study Mode only.

- Verse of the Moment (§16.8): \"I need a verse for...\" AI input below
  hero; surfaces 2-3 contextually relevant verses. Ephemeral --- no data
  stored.

- Offline Reading Package (§16.9): sidebar \"Download for offline\" with
  Surah / Juz / all-114 selection; offline indicator teal dot in
  sidebar.

- Reading Analytics (§16.10): private \"My Quran Stats\" --- Surahs
  read, verses read, most-visited Surah, session length, streaks,
  languages. Local by default; optional account sync.

**4. Wireframe & Visual Flow Descriptions**

All descriptions reference quran_v5.html as the canonical visual
blueprint. Token values from CLAUDE_v3.md v3.0. Blueprint fidelity is
non-negotiable --- no visual redesign without explicit instruction.

**4.1 Hero Section**

Section.hero with min-height matching page design. Visual layers (back
to front):

- LAYER 0 --- .hero-bg: 3-ellipse teal/gold radial gradient, bgD
  animation 18s infinite

- LAYER 1 --- 4 floating .geo SVG decorators: 72px star polygon
  (top-left, teal) · 44px rotated rect (top-right, gold) · 60px star
  (bottom-right, teal) · 38px star (bottom-left, gold)

- LAYER 2 --- .hero-inner (max-width 800px, centered): Bismillah (first
  child) → eyebrow badge \"Sacred Scripture · 114 Surahs · 6,236 Ayahs\"
  → H1 \"Read, Listen & Understand / the Holy Qur\'an\" (gradient-italic
  on \"Holy Qur\'an\") → subtitle paragraph → 2 hero buttons

Hero button row: btn-primary \"Continue Reading\" → loads last-read
position; btn-ghost \"Start with Al-Fatihah\" → loads Surah 1. Both
animate with fadeUp at load (0.7s ease-reverent).

**4.2 Reader Shell --- Three-Pane Layout**

Full-width .reader-shell (id=\"readerShell\"): flex-row at desktop,
collapses on mobile. The three panes:

  -----------------------------------------------------------------------------
  **Pane**   **Width**         **Contents**                  **Collapse
                                                             behaviour**
  ---------- ----------------- ----------------------------- ------------------
  Sidebar    260px             Surah list (114 rows) ·       Collapses to 0 in
             flex-shrink-0     streak strip · search input · Reading Mode and
                               Makki/Madani filter chips ·   Study Mode (Esc
                               progress bar · offline badge  restores)

  Reader     flex:1            Reader Topbar (rows 1 + 2 +   Expands to full
  Main       overflow-y:auto   Tajweed legend) + Verses Area width when sidebar
                               (card list or Mushaf Page     collapses
                               view)                         

  Tafsir     278px             3-source tab strip + lazy     class=\"closed\" =
  Panel      flex-shrink-0     commentary text + ayah        width:0.
                               reference header              Transition: width
                                                             .38s ease-reverent
  -----------------------------------------------------------------------------

**4.3 Sidebar Anatomy**

- STREAK STRIP (.sb-streak): top of sidebar, below search. Linear
  gradient bg (teal + gold tints). \"✦ N-day streak\" label + 7
  day-cells (28×28px each, 3px gap). \"Habit Tracker →\" gold link at
  right.

- SEARCH INPUT: glass pill input (backdrop-filter blur(14px),
  border-radius 999px). Filters surah list in real-time.

- FILTER CHIPS: \[Makki\] \[Madani\] chips using .chip class. Active
  state: teal-700 bg.

- SURAH ROWS (.surah-row): number chip (teal/gold square, 32px) +
  English name + Makki/Madani chip + ayah count + Arabic name
  (right-aligned). Active row: left border var(\--teal-700). Reading
  dot: 4px teal right-edge indicator.

- PROGRESS BAR: \"Reading Progress --- N%\" label + filled bar
  (transition: width 0.6s ease-reverent). Total: 6,236 ayahs.

- OFFLINE BADGE: 6px teal dot + \"Available offline\" label (appears
  only when service worker reports cache active)

**4.4 Reader Topbar --- Two Rows**

ROW 1 (.rtb-row1): Breadcrumb (.surah-bc --- Surah name, type badge,
verse count, Juz info) \| Reading Mode toggle (#readModeBtn) \|
Study↔Mushaf toggle (mutually exclusive, same row)

ROW 2 (.rtb-row2) --- exact button order per Quran_Module_PRD.md §11.12:

- Reciter dropdown (50+ reciters)

- Separator

- Translation dropdown (7+ editions, multilingual)

- Separator

- WBW toggle button (.ctrl-btn)

- Tajweed toggle button (.ctrl-btn) \[Stage 3 --- appended after WBW\]

- Compare toggle button (.ctrl-btn, #compareBtn,
  class=\"compare-active\" when on) \[Stage 3 --- appended after
  Tajweed\]

- Tafsir toggle button (opens/closes tafsir panel)

- Reading Mode toggle

- Separator

- Settings button (#settingsBtn)

- Bookmarks button (opens bookmarks panel) \[Stage 2 --- appended last\]

TAJWEED LEGEND ROW: strip immediately below row 2, visible only when
Tajweed is on. \"● Ghunna ● Ikhfa ● Idgham ● Qalqalah ● Madd ● Laam
sh.\" Dismissable (✕). Preference in localStorage.

**4.5 Ayah Card Anatomy (Study Mode)**

Each .ayah-card (class=\"active-verse\" on the focused card, ring border
animation):

- HEADER (.ayah-header): .ayah-num-badge (32px circle, teal gradient,
  verse number; gold 3px dot if has note) + .ayah-actions (6 icon
  buttons: Play · Bookmark · Copy · Share · Notes · Explain)

- ARABIC TEXT (.ayah-arabic): Amiri font, var(\--ayah-ar-size, 32px),
  direction:rtl, text-align:right. When Tajweed on: \<span
  class=\"tj-\*\"\> wrappers per rule.

- WBW ROW (.wbw-row, direction:rtl): per .wbw-word --- .wbw-ar (Arabic)
  · .wbw-en (English gloss) · .wbw-pos (POS chip, Stage 3). Active word
  in .hl class during audio playback.

- TRANSLATION (.ayah-translation): var(\--ayah-tr-size, 16px), Cormorant
  Garamond italic. In Compare mode: 3 stacked translation blocks with
  left-bar indicator.

- ATTRIBUTION (.ayah-trans-attr): \"Sahih International · Al-Fatihah
  1:1\" --- 11px, ink-subtle

- AI CARD (.ai-card, id=\"ai{N}\"): gradient bg (gold+teal tints), gold
  border, slides up on show. Contains: title \"✦ AI Explanation\" + ✕
  close + .ai-text + footer (\"✦ Powered by QuranlyAI\" → quranlyai.com)

- NOTE EDITOR (.note-editor, id=\"n{N}\"): gold-50 bg, textarea
  (min-height 72px), Cancel + Save Note buttons

- FOOTER (.ayah-footer): .ayah-ref (e.g., \"1:2\") + .tafsir-btn (\"Ibn
  Kathir Tafsir\") + .trace-btn (\"Trace View →\" gold pill)

**4.6 Audio Player Bar**

Dark teal gradient bar (.audio-player, background
linear-gradient(135deg, rgba(10,58,61,.97), rgba(6,38,40,.97))), pinned
to bottom of reader-shell. Gold radial aura pseudo-element top-left.
Hidden in Reading Mode.

- LEFT: Now-playing indicator (waveform SVG animation when playing) +
  Surah:Ayah reference

- CENTER: Prev (⏮) · Rewind 10s (⏪) · Play/Pause (▶/⏸) · Forward 10s
  (⏩) · Next (⏭) · Speed badge (cycles 1.0→1.25→1.5→2.0)

- SCRUB BAR: input\[type=range\] bound to audio.currentTime. Current
  time / duration displayed \"mm:ss / mm:ss\"

- RIGHT: Reciter name label + dropdown icon

**4.7 Tafsir Panel**

278px fixed-width panel to the right of reader-main (flex-shrink:0).
border-left 0.5px rgba(0,105,110,.10). Dark mode: rgba(15,27,29,.98) bg.

- TAB STRIP: \"Ibn Kathir\" · \"al-Tabari\" · \"al-Qurtubi\" --- active
  tab: teal underline. Tab click fetches lazily.

- PANEL BODY: ayah reference heading → Arabic verse block → commentary
  paragraphs (Inter 14px, line-height 1.72) → attribution line
  (font-mono 11px, ink-subtle)

- Empty state: \"No commentary available from {source}\" --- never
  blank, never fabricated

**4.8 Verse Trace View (Full-Screen Overlay)**

Fixed full-screen .trace-overlay (display:none → display:flex on .open).
z-index: 300. Background: var(\--surface).

- TOP BAR (.trace-top): frosted glass (rgba(255,255,255,.96),
  backdrop-filter blur(16px), border-bottom). Breadcrumb: \"{Collection}
  › {Surah} › Verse {N}\" (Cormorant Garamond 16px, ink-muted). Action
  row: bookmark · share · copy (.trace-act buttons) + \"Exit Trace View
  →\" teal button (.trace-exit).

- BODY (.trace-body): 3-column grid (1fr : 1.4fr : 1fr at ≥1300px;
  stacks at ≤900px). Each column scrolls independently.

- LEFT (.trace-col): \"Tafsir\" column label → 3-source tabs →
  commentary text (Ibn Kathir default)

- CENTER (.trace-col): Arabic verse large (.trace-ar: Amiri 26px, RTL,
  rgba(0,105,110,.03) bg, border-radius 12px) → translation
  (.trace-trans: CG italic 17px, 2.5px teal left bar) → grade badge
  (.trace-grade: SAHIH green pill) → source attribution (.trace-src:
  font-mono 11px)

- RIGHT (.trace-col): Topic chips (.trace-topic-chips flex-wrap) →
  \"Related Verses\" heading → .trace-related list (2-3 verse refs with
  surah name + jump link) → Grammar summary (.trace-wbw-grid: RTL
  flexwrap, each .trace-word has Arabic + gloss + POS, hover: teal bg)

**4.9 Settings Panel**

Fixed 288px panel from right (id=\"settingsPanel\", .settings-panel,
z-index 250). border-left 0.5px rgba(0,105,110,.18). Slides:
translateX(100%) → translateX(0) on .open.

- Arabic Font Size: pill track with S / M / L / XL chips (default M).
  Active: teal-700 bg, white text.

- Translation Font Size: S / M / L pill track (default M).

- Separator line

- Toggle checkboxes: ☑ Word-by-word · ☑ Show grammar tags · ☑
  Auto-advance audio · ☑ Show transliteration

- \[Reset to defaults\] button --- clears all localStorage reading
  preferences

**4.10 Bookmarks Panel**

Fixed 300px panel from left (.bookmarks-panel, z-index 250).
border-right 0.5px rgba(0,105,110,.15). Slides: translateX(-100%) →
translateX(0) on .open.

- Filter chips row: \[All\] \[General\] \[Memorization\] \[Reflection\]
  \[Favourite Duas\] \[Important\] \[+ custom...\]

- Separator

- Bookmark cards (.card): Surah name + ayah ref + category chip · Arabic
  snippet (Amiri 16px RTL) · Translation snippet (CG italic) · Relative
  timestamp (\"N days ago\") · Jump arrow button (→)

- Empty state: \"No bookmarks yet --- tap the bookmark icon on any
  verse\"

**4.11 Share Modal**

Fixed full-screen .share-modal (z-index 400). Centered .card container
with backdrop blur overlay.

- FORMAT TABS: Square (1080×1080) · Story (1080×1920) --- .chip tabs

- CANVAS PREVIEW: live preview updates on format change

- ACTIONS: \"Download PNG\" → \<a download\> from canvas.toDataURL ·
  \"Share...\" → navigator.share on mobile, clipboard on desktop · \"✕
  Close\"

- Canvas composition: hero-bg radial gradient → geometric pattern
  overlay (4% opacity) → IslamicInfo logo SVG → Arabic text (Amiri,
  large, centered, RTL) → gold horizontal divider → translation (CG
  italic, white) → attribution line → goldleaf corner ornament

**5. Feature Matrix**

**5.1 Stage-by-Stage Feature Classification**

  -----------------------------------------------------------------------------------------
  **Feature**                   **Stage**   **Gap    **Priority**   **User Persona**
                                            ID**                    
  ----------------------------- ----------- -------- -------------- -----------------------
  114-surah live sidebar index  Stage 1     Q-G1     P0             All

  Sidebar search + Makki/Madani Stage 1     Q-G1     P0             All
  filter                                                            

  Live verse engine             Stage 1     Q-G2     P0             All
  (api.quran.com)                                                   

  Bismillah banner (absent for  Stage 1     Q-G2     P0             All
  Surah 9)                                                          

  Surah soft-load (no full      Stage 1     Q-G2     P1             All
  reload)                                                           

  Multilingual translation      Stage 1     Q-G3     P0             Non-English speakers
  dropdown 7+ editions                                              

  Audio player --- all controls Stage 1     Q-G5     P0             Listeners
  wired                                                             

  Auto-advance on audio.ended   Stage 1     Q-G6     P1             Listeners

  50+ reciters dropdown         Stage 1     Q-G7     P1             Listeners

  3-source Tafsir panel (lazy   Stage 1     Q-G8     P0             Students / Scholars
  load)                                                             

  Today\'s Reflection trio      Stage 1     Q-G18    P1             Daily visitors
  (live data)                                                       

  Skeleton shimmer + error      Stage 1     ---      P0             All
  fallbacks                                                         

  Reading Mode                  Stage 2     Q-G9     P1             Focused readers
  (distraction-free)                                                

  Settings panel --- font size  Stage 2     Q-G10    P1             Accessibility
  controls                                                          

  Verse notes --- inline editor Stage 2     Q-G11    P1             Students

  Reading progress + last-read  Stage 2     Q-G12    P1             Daily readers
  tracking                                                          

  Continue Reading hero button  Stage 2     Q-G12    P1             Returning users

  Bookmark categories +         Stage 2     Q-G13    P1             Scholars / Students
  bookmark panel                                                    

  Deep-link pulse-ring          Stage 2     Q-G14    P2             Shared-link receivers
  animation                                                         

  Qur\'an-scoped search         Stage 2     Q-G15    P1             Researchers
  (/quran/search)                                                   

  Share image generator         Stage 2     Q-G16    P2             Social media users
  (canvas)                                                          

  Copy with full attribution    Stage 2     Q-G17    P1             All

  Offline PWA / service worker  Stage 2     Q-G21    P2             Low-connectivity users

  WBW grammar tags (POS chips)  Stage 3     Q-G4     P1             Arabic learners

  Root word tooltip on hover    Stage 3     Q-G4     P2             Arabic learners

  Tajweed colour-coding (6      Stage 3     Q-G22    P1             Tajweed students
  rules)                                                            

  Tajweed legend strip          Stage 3     Q-G22    P2             Tajweed students

  Translation comparison mode   Stage 3     Q-G23    P1             Scholars

  /quran/compare route          Stage 3     Q-G23    P2             Scholars

  AI Explanation (QuranlyAI /   Stage 4     Q-G24    P1             All
  Anthropic API)                                                    

  Verse Trace View (3-column    Stage 4     new      P1             Scholars / Researchers
  research)                                                         

  /quran/trace/{surah}/{ayah}   Stage 4     new      P2             Scholars
  route                                                             

  Reading streaks (sidebar +    Stage 4     new      P1             Daily readers
  mobile)                                                           

  Mushaf Mode (traditional page Stage 4     ---      P1             Traditional readers
  view)                                                             

  Hifz Mode (memorisation       Phase 2+    §16.1    P2             Memorisers
  assistant)                                                        

  Reading Pace Timer            Phase 2+    §16.2    P3             Reflective readers

  Daily Verse Journey           Phase 2+    §16.3    P2             Goal-oriented users

  Root Word Explorer tooltip    Phase 2+    §16.4    P2             Arabic learners

  Verse Emotion Tags            Phase 2+    §16.5    P3             Community / All
  (anonymous)                                                       

  Surah Thematic Map (visual    Phase 2+    §16.6    P2             Discovery users
  grid)                                                             

  Side-by-Side Language Reading Phase 2+    §16.7    P2             Bilingual readers

  Verse of the Moment (AI       Phase 2+    §16.8    P2             Emotional seekers
  contextual)                                                       

  Offline Reading Package       Phase 2+    §16.9    P2             Low-connectivity users
  (Download)                                                        

  Reading Analytics (private    Phase 2+    §16.10   P2             Self-tracking readers
  stats)                                                            
  -----------------------------------------------------------------------------------------

**5.2 Accessibility Matrix**

+-----------------+--------------+-----------------------------+------------+
| **Requirement** | **Standard** | **Implementation**          | **Status** |
+=================+==============+=============================+============+
| Semantic HTML   | WCAG 2.1 AA  | \<header\>, \<nav\>,        | Stage 1    |
|                 |              | \<main\>, \<section\>,      |            |
|                 |              | \<article\> ---             |            |
|                 |              | quran_v5.html structure     |            |
|                 |              | preserved verbatim          |            |
+-----------------+--------------+-----------------------------+------------+
| Arabic text     | i18n         | All Arabic elements:        | Stage 1    |
| direction       |              | direction:rtl;              |            |
|                 |              | text-align:right;           |            |
|                 |              | font-family:Amiri. Never    |            |
|                 |              | passed through i18n         |            |
|                 |              | translation layer.          |            |
+-----------------+--------------+-----------------------------+------------+
| ARIA labels on  | WCAG 2.1 AA  | aria-label on all           | Stage 1    |
| controls        |              | .ayah-btn, .ctrl-btn,       |            |
|                 |              | icon-only buttons;          |            |
|                 |              | role=\"search\" on search   |            |
|                 |              | overlay                     |            |
+-----------------+--------------+-----------------------------+------------+
| Color contrast  | WCAG 2.1 AA  | ink-primary #0F2A2C on      | Stage 1    |
| --- UI text     | (4.5:1)      | surface #F4F7F7 = 14.8:1    |            |
|                 |              | ✅. Translation text        |            |
|                 |              | #243738 on white = 12.1:1   |            |
|                 |              | ✅.                         |            |
+-----------------+--------------+-----------------------------+------------+
| Tajweed colours | WCAG 2.1 AA  | tj-ghunna #2E7D32 on        | Stage 3    |
| --- light mode  | --- see      | #F4F7F7: 4.76:1 ✅ AA       | audit      |
| \[FIX-2\]       | notes        |                             |            |
|                 |              | tj-ikhfa #B07D00 on         |            |
|                 |              | #F4F7F7: 3.37:1 ⚠️ AA       |            |
|                 |              | large/UI only --- consider  |            |
|                 |              | darkening to #8B6000        |            |
|                 |              | (5.1:1) for Stage 3         |            |
|                 |              |                             |            |
|                 |              | tj-idgham #1565C0 on        |            |
|                 |              | #F4F7F7: 5.33:1 ✅ AA       |            |
|                 |              |                             |            |
|                 |              | tj-qalqalah #880E4F on      |            |
|                 |              | #F4F7F7: 8.77:1 ✅ AA       |            |
|                 |              |                             |            |
|                 |              | tj-madd #0297A1 on #F4F7F7: |            |
|                 |              | 3.28:1 ⚠️ AA large/UI only  |            |
|                 |              | --- inherits \--teal-600;   |            |
|                 |              | consider \--teal-700        |            |
|                 |              | #00696E (3.65:1)            |            |
|                 |              |                             |            |
|                 |              | tj-laam-sh #4A148C on       |            |
|                 |              | #F4F7F7: 11.01:1 ✅ AA      |            |
+-----------------+--------------+-----------------------------+------------+
| Tajweed colours | WCAG 2.1 AA  | tj-ghunna #66BB6A on        | Stage 3    |
| --- dark mode   | (4.5:1)      | #0A1314: 7.96:1 ✅          | audit      |
| \[FIX-2\]       |              |                             |            |
|                 |              | tj-ikhfa #FFD54F on         |            |
|                 |              | #0A1314: 13.33:1 ✅         |            |
|                 |              |                             |            |
|                 |              | tj-idgham #64B5F6 on        |            |
|                 |              | #0A1314: 8.50:1 ✅          |            |
|                 |              |                             |            |
|                 |              | tj-qalqalah #F48FB1 on      |            |
|                 |              | #0A1314: 8.43:1 ✅          |            |
|                 |              |                             |            |
|                 |              | tj-madd #5BC1C7 on #0A1314: |            |
|                 |              | 8.87:1 ✅                   |            |
|                 |              |                             |            |
|                 |              | tj-laam-sh #CE93D8 on       |            |
|                 |              | #0A1314: 7.87:1 ✅          |            |
+-----------------+--------------+-----------------------------+------------+
| Keyboard        | WCAG 2.1 AA  | All .ayah-btn, .ctrl-btn,   | Stage 2    |
| navigation      |              | sidebar rows focusable via  |            |
|                 |              | Tab. Escape: closes Trace   |            |
|                 |              | View, Settings, Bookmarks,  |            |
|                 |              | Reading Mode.               |            |
+-----------------+--------------+-----------------------------+------------+
| Reduced motion  | WCAG 2.1 AA  | \@media                     | Stage 2    |
|                 | 2.3.3        | (prefers-reduced-motion:    |            |
|                 |              | reduce): disables geoFloat, |            |
|                 |              | bgD, pulse-ring (border     |            |
|                 |              | only), waveform animation,  |            |
|                 |              | reading-mode transitions.   |            |
+-----------------+--------------+-----------------------------+------------+
| Focus trap ---  | WCAG 2.1 AA  | Tab cycles within: Trace    | Stage 2    |
| modals          | 2.1.2        | View overlay, Share Modal,  |            |
|                 |              | Settings Panel, Bookmarks   |            |
|                 |              | Panel when open.            |            |
+-----------------+--------------+-----------------------------+------------+
| Screen reader   | WCAG 2.1 AA  | aria-live region for verse  | Stage 1    |
|                 |              | navigation; aria-label on   |            |
|                 |              | audio controls; meaningful  |            |
|                 |              | alt on all inline SVGs.     |            |
+-----------------+--------------+-----------------------------+------------+
| Font scaling    | User         | Arabic and translation font | Stage 2    |
|                 | preference   | sizes independently         |            |
|                 |              | controllable (4 + 3         |            |
|                 |              | levels). Persists across    |            |
|                 |              | sessions.                   |            |
+-----------------+--------------+-----------------------------+------------+

**6. Technical Architecture & Requirements**

**6.1 Frontend Stack**

  ---------------- -----------------------------------------------------
  **HTML**         HTML5 semantic per quran_v5.html blueprint. Single
                   file, no framework.

  **CSS**          CSS3 custom properties from CLAUDE_v3.md §1. No
                   CSS-in-JS. Dark-mode sibling block unmerged.

  **JavaScript**   Vanilla JS. Single \<script\> at end of \<body\>. Web
                   Workers for AI explanation fetch.

  **Fonts**        Cormorant Garamond + Inter + Amiri --- Google Fonts,
                   preconnected in this order

  **Audio**        Single global \<audio\> element. EveryAyah CDN.
                   AbortController for timeout.

  **Canvas**       HTML5 Canvas for share image. One canvas at a time;
                   disposed after download.

  **Service        quran-sw.js (Stage 2). Cache-first static shell;
  Worker**         background-revalidate verse data.

  **PWA**          manifest.json: 192px + 512px SVG icons. name:
                   \"IslamicInfo Qur\'an Explorer\".

  **API**          api.quran.com/api/v4 (verses, chapters, tafsir,
                   translations, recitations)

  **AI**           api.anthropic.com/v1/messages ---
                   claude-sonnet-4-20250514, max_tokens 1000
  ---------------- -----------------------------------------------------

**6.2 Design System Rules (from CLAUDE_v3.md + Quran_Module_PRD.md
§11.0)**

- All CSS tokens from CLAUDE_v3.md §1: 50+ variables. No new colors,
  radii, or easing curves.

- Reuse existing classes (.card, .chip, .btn-primary, .btn-ghost,
  .arabic, .grade) before creating new ones

- Card hover: translateY(-5px) scale(1.012), 0.38s ease-reverent. Button
  hover: translateY(-2px) scale(1.04), 0.28s ease-premium. Chips: 0.22s.

- NO shimmer ::after sweep on any card --- forbidden per CLAUDE_v3.md
  §27.4

- BUTTON APPEND RULE (critical): new buttons in .ayah-actions or
  .rtb-row2 are ALWAYS appended last. Never reorder, rename, or remove
  existing buttons.

- Final .ayah-actions order: Play · Bookmark · Copy · Share · Notes ·
  Explain (Stage 4)

- Final .rtb-row2 order: Reciter · sep · Translation · sep · WBW ·
  Tajweed · Compare · Tafsir · Reading Mode · sep · Settings · Bookmarks

**6.3 Data & Storage Reference**

  ----------------------------------------------------------------------------------
  **localStorage Key**          **Data Type**       **Purpose**            **Set in
                                                                           Stage**
  ----------------------------- ------------------- ---------------------- ---------
  \"ii-quran-translation\"      String (edition ID) Persists selected      Stage 1
                                                    translation edition    

  \"ii-quran-ar-size\"          String (S/M/L/XL)   Persists Arabic font   Stage 2
                                                    size selection         

  \"ii-quran-tr-size\"          String (S/M/L)      Persists translation   Stage 2
                                                    font size selection    

  \"ii-quran-reading-mode\"     \"1\" or absent     Restores reading mode  Stage 2
                                                    on reload              

  \"ii-quran-last-read\"        JSON {verseKey,     Continue Reading       Stage 2
                                surahId, ayahNo,    restoration            
                                surahName,                                 
                                timestamp}                                 

  \"ii-quran-read-ayahs\"       JSON                Reading progress       Stage 2
                                Array\<verseKey\>   tracking (6,236 ayahs  
                                                    total)                 

  \"ii-quran-bookmarks\"        JSON                Bookmark collection    Stage 2
                                Array\<{verseKey,                          
                                surahName, surahId,                        
                                ayahNo, category,                          
                                addedAt}\>                                 

  \"ii-quran-notes\"            JSON                Personal verse         Stage 2
                                Array\<{verseKey,   annotations (max 2000  
                                text, updatedAt}\>  chars each)            

  \"ii-quran-tajweed-legend\"   \"dismissed\" or    Hides Tajweed legend   Stage 3
                                absent              after user dismissal   

  \"ii-quran-compare-mode\"     \"1\" or absent     Restores comparison    Stage 3
                                                    mode state on reload   

  \"ii-quran-streak\"           JSON {lastReadDate, Reading streak data    Stage 4
                                currentStreak,                             
                                longestStreak,                             
                                readDays\[\]}                              

  \"islamicinfo-theme\"         \"light\" \|        Global site theme      Stage 1
                                \"dark\"            (shared with all       
                                                    pages)                 

  \"islamicinfo-lang\"          ISO 639-1 code      Global UI language     Stage 1
                                                    (shared with all       
                                                    pages)                 
  ----------------------------------------------------------------------------------

**6.4 API Integration Map**

  -------------------------------------------------------------------------------------------------------------------------------------------
  **API / Source**       **Endpoint / Pattern**                                                                **Purpose**      **Cache TTL**
  ---------------------- ------------------------------------------------------------------------------------- ---------------- -------------
  api.quran.com/api/v4   /chapters?language=en                                                                 114 chapter      Permanent
                                                                                                               metadata for     (static)
                                                                                                               sidebar          

  api.quran.com/api/v4   /verses/by_chapter/{id}?language=en&translations={id}&fields=text_uthmani,verse_key   Verse text +     24h per surah
                                                                                                               translation per  per language
                                                                                                               surah            

  api.quran.com/api/v4   /tafsirs/{id}/by_ayah/{verse_key}                                                     3-source Tafsir  7d per
                                                                                                               text (lazy)      tafsir +
                                                                                                                                verse_key

  api.quran.com/api/v4   /resources/recitations                                                                50+ reciter list 7d (stable)
                                                                                                               for dropdown     

  api.quran.com/api/v4   /verses/by_chapter/{id}?words=true&word_fields=\...                                   WBW + grammar    7d per surah
                                                                                                               data             (immutable)

  api.quran.com/api/v4   /verses/random?language=en&translations=131                                           Verse of the Day 24h
                                                                                                               (trio section)   

  everyayah.com CDN      /data/{reciter_path}/{surah_padded}{ayah_padded}.mp3                                  Per-ayah audio   CDN-native
                                                                                                               recitation       (client
                                                                                                                                cache)

  Tajweed source         tajweed.quran.com or self-hosted JSON                                                 Tajweed          7d
                                                                                                               annotation spans (immutable)
                                                                                                               per surah        

  api.anthropic.com      /v1/messages (claude-sonnet-4-20250514)                                               AI Explanation   No cache
                                                                                                               (QuranlyAI)      (real-time)

  /data/chapters.json    Static bundled seed                                                                   Sidebar fallback Bundled
                                                                                                               if API fails     (static)

  /data/duas.json        Static bundled, day-of-year index                                                     Dua of the Day   Bundled
                                                                                                               (trio section)   (static)

  /data/reciters.json    Static bundled slug→CDN path map                                                      Audio URL        Bundled
                                                                                                               construction     (static)
  -------------------------------------------------------------------------------------------------------------------------------------------

**6.5 Performance Requirements**

- LCP \< 2.5s on representative reader page (Al-Fatihah loaded, first 7
  verses visible)

- FCP \< 1.5s (reader shell visible; skeleton shimmer shown immediately)

- CLS \< 0.1 (skeleton shimmer reserves card heights before data
  arrives)

- Lighthouse Performance ≥ 90 on representative reader page

- Tafsir: lazy-fetch on panel open. Never fetched on page load.

- WBW grammar data: lazy-fetch per surah on first WBW toggle. Cached 7d.

- AI Explanation: max 10s AbortController timeout. Web Worker handles
  fetch.

- Audio preload: current ayah URL only. Begin preloading next at 80%
  completion.

- Canvas draw: await document.fonts.ready before any canvas.drawText
  call

**6.6 Error States & Fallback Behaviours**

  ---------------------------------------------------------------------------------
  **Feature**    **Failure**            **User-Facing         **Technical
                                        Fallback**            Handling**
  -------------- ---------------------- --------------------- ---------------------
  114 Surah list API timeout or 5xx     Renders from          fetch catch → seed
  fetch                                 /data/chapters.json   JSON; log to
                                        seed (always          monitoring
                                        present); no          
                                        user-visible error    

  Verse fetch    API failure for        Shows \"Verses        fetch catch → empty
                 selected surah         temporarily           state component;
                                        unavailable --- try   retry button
                                        again\" empty state   re-triggers fetch
                                        with retry button in  
                                        verses area           

  Tafsir fetch   API failure or no      \"No commentary       catch per source;
                 entry                  available from        graceful empty string
                                        {source}\" rendered   → render fallback
                                        verbatim; never       message
                                        blank; never          
                                        fabricated            

  Audio URL      CDN unreachable / 404  Inline error below    audio.onerror → show
                                        verse: \"Audio        per-ayah error msg;
                                        unavailable for this  do not crash player
                                        ayah\"; player        
                                        controls remain       
                                        visible               

  Reciter list   API failure            Falls back to         fetch catch → bundled
  fetch                                 /data/reciters.json   JSON
                                        bundled list (minimum 
                                        5 reciters)           

  AI Explanation Timeout (10s) or error \"Explanation         AbortController 10s
  API                                   unavailable ---       timeout; catch →
                                        please try again\" in error state; no
                                        .ai-text; retry       auto-close
                                        button; ✕ close       
                                        always works          

  AI Explanation Response contains      Response stripped     Post-process
  system prompt  fatwa or fabricated    before display;       response: detect
                 source                 fallback: \"Unable to forbidden patterns;
                                        generate explanation  strip or reject
                                        for this verse\"      

  Tajweed data   API unavailable        Plain Arabic text     catch → plain text
  fetch                                 rendered (no colour   fallback;
                                        coding); Tajweed      console.warn
                                        button shows          
                                        \"unavailable\"       
                                        tooltip               

  Canvas font    document.fonts.ready   Falls back to system  Promise.race with 3s
  load           times out              serif for canvas      timeout; proceed with
                                        text; image still     fallback font stack
                                        generates             

  Service Worker Browser doesn\'t       Page works fully      Feature detection: if
  registration   support SW             without offline       (\'serviceWorker\' in
                                        capability; no        navigator) before
                                        indicator shown; no   registration
                                        error                 

  localStorage   Notes or bookmarks     Toast: \"Storage full QuotaExceededError
  quota exceeded storage full           --- clear some        catch on setItem;
                                        bookmarks or notes\". notify via toast; do
                                        New save blocked      not silently lose
                                        gracefully.           data
  ---------------------------------------------------------------------------------

**7. Implementation Roadmap**

Staged approach per Quran_Module_PRD.md §11.2. Stages 3 and 4 have no
mutual dependency --- can be parallelised after Stage 2 is signed off.

**Stage 1 --- Foundation (Weeks 1--3)**

Goal: Pixel-perfect replica of quran_v5.html with live data in both
themes. All 114 Surahs navigable.

1.  Read quran_v5.html + CLAUDE_v3.md in full before writing any code

2.  Implement all CSS token system; dark-mode sibling block unmerged

3.  Wire sidebar: live 114-surah fetch, skeleton shimmer, search filter,
    Makki/Madani chips, fallback seed

4.  Wire verse engine: live fetch per surah, ayah-card template,
    Bismillah banner (absent Surah 9), soft-load next surah

5.  Wire translation dropdown: 7+ editions + multilingual; localStorage
    persistence

6.  Wire audio player: all controls, auto-advance, 50+ reciters,
    EveryAyah CDN URL pattern, preload strategy

7.  Wire Tafsir panel: 3-source tabs, lazy fetch, \"no commentary\"
    fallback, 7d cache

8.  Wire Today\'s Reflection trio: live verse + hadith + dua; skeleton +
    error fallback

9.  Verify Stage 1 acceptance criteria (§11.3.8 of Quran_Module_PRD.md)
    before advancing

**Stage 2 --- Reader Comfort (Weeks 4--6)**

Goal: All P1 reader-comfort features live; localStorage persistence
layer complete.

10. Reading Mode: all CSS overrides, floating exit button, Escape key,
    URL update, localStorage restore

11. Settings panel: font size controls (4+3 levels), live update,
    toggles, Reset, localStorage persist

12. Verse notes: inline editor, localStorage store, gold dot visual
    signal, dark mode

13. Reading progress: IntersectionObserver tracking, progress bar
    animation, sidebar row dots, last-read

14. Continue Reading hero button: load + scroll + pulse highlight

15. Bookmarks: category tooltip, bookmark panel (slides left),
    categorised browser, jump-to-verse

16. Deep-link pulse-ring: URL parsing, 2-iteration animation,
    prefers-reduced-motion fallback

17. Qur\'an search: /quran/search route, glass-pill input, 3 filter
    chips, \<mark\> highlighting

18. Share image: canvas generator, 2 formats, font preload, download +
    share, modal preview

19. Copy with attribution: full payload, \"Copied with attribution\"
    toast

20. Offline PWA: service worker, manifest.json, offline indicator,
    download-for-offline sidebar button

21. Implement focus-trap for Trace View, Settings, Bookmarks, Share
    Modal

22. Verify Stage 2 acceptance criteria (§11.4.12) before advancing

**Stage 3 --- Learning Depth (Weeks 7--8) --- can parallelise with Stage
4**

23. WBW grammar tags: 3-row .wbw-word, POS chips (5 classes, correct
    colours), root tooltip on hover

24. \"Show grammar tags\" setting toggle wired to Settings panel
    checkbox

25. Tajweed toggle button: appended to rtb-row2 after WBW (never reorder
    prior buttons)

26. Tajweed span rendering: 6 rule classes + dark-mode overrides; ≤ 0.5s
    application time

27. Tajweed legend strip: dismissable, localStorage preference

28. Compare mode button: appended after Tajweed; 3-translation stacked
    view; single API call; localStorage

29. /quran/compare route with URL-addressable state

30. Verify Stage 3 acceptance criteria (§11.5.4) before sign-off

**Stage 4 --- Signature Features (Weeks 7--8 --- parallel with Stage
3)**

31. AI Explain button: appended last in .ayah-actions; .ai-card
    slide-up; Anthropic API call; skeleton shimmer

32. System prompt hardcoded --- not overridable; fatwa/fabrication
    detection + strip

33. Error state: \"Explanation unavailable\" + retry; 10s
    AbortController timeout

34. Verse Trace View: .trace-overlay fixed full-screen; 3-column grid;
    all sub-components per §4.8

35. /quran/trace/{surah}/{ayah} route deep-link support

36. Reading streaks: sb-streak strip in sidebar + mobile breadcrumb
    area; localStorage data model; daily threshold logic

37. Link streaks to habits.html?source=quran

38. Mushaf Mode: toggle in rtb-row1; .mushaf-mode-active class; mushaf
    page view rendering; page navigation

39. Verify Stage 4 acceptance criteria (§11.6.5) before sign-off

**Phase 2+ --- Futuristic Features (Post-Launch)**

40. Hifz Mode (§16.1) --- progressive word hiding, recall testing,
    streak + badges

41. Reading Pace Timer (§16.2) --- per-ayah minimum timer, gold ring
    countdown

42. Daily Verse Journey (§16.3) --- goal selection, recommended reading
    sidebar arc

43. Root Word Explorer (§16.4) --- enhanced WBW root tooltip with
    cross-Quran occurrence links

44. Verse Emotion Tags (§16.5) --- anonymous per-verse tag strip;
    aggregated dominant tag

45. Surah Thematic Map (§16.6) --- 114-tile visual grid, colour-coded by
    theme, filter controls

46. Side-by-Side Language Reading (§16.7) --- 2-column card in Study
    Mode

47. Verse of the Moment (§16.8) --- AI contextual verse suggestion input
    below hero

48. Reading Analytics (§16.10) --- private stats view; optional account
    sync

**Testing & Launch (Weeks 9--10)**

49. Cross-browser: Chrome, Firefox, Safari, Edge (desktop + mobile
    Safari)

50. Device testing: iPhone SE, iPhone 15 Pro, Samsung Galaxy S24, iPad
    Pro 12.9\"

51. RTL testing: Arabic and Urdu interface + Mushaf layout on all
    breakpoints (1280/1100/820/700/420px)

52. Audio testing: all 5 default reciters, speed cycling, auto-advance,
    page unload cleanup

53. WCAG 2.1 AA audit: axe-core automated + manual keyboard + screen
    reader (VoiceOver / NVDA)

54. Offline testing: cache all states, intermittent network,
    quota-exceeded scenario

55. AI Explain testing: verify system prompt enforcement, timeout
    handling, fatwa-detection strip

56. Lighthouse CI: Performance ≥ 90 on /quran (Al-Fatihah loaded)

57. Deploy; configure CDN + Redis caching; set up monitoring (Sentry +
    uptime)

58. GA4 custom events for all 9 KPI metrics in §1

**8. Design System Compliance Checklist**

Every stage sign-off must pass this checklist. Items 1--20 are from
CLAUDE_v3.md §24. Items 21--28 are Qur\'an module--specific additions.

  ------------------------------------------------------------------------
  **\#**   **Check**                                   **Reference**
  -------- ------------------------------------------- -------------------
  1        \<html lang=\"en\" data-theme=\"light\"\>   CLAUDE_v3.md §2
           opening tag                                 

  2        Fonts preconnected in order: Cormorant      CLAUDE_v3.md §2
           Garamond → Inter → Amiri                    

  3        :root block with all 50+ token variables;   CLAUDE_v3.md §1
           dark-mode sibling block UNMERGED            

  4        Navbar: 10 items in order; \"Quran          CLAUDE_v3.md §4.1
           Explorer\" carries class=\"nav-link         
           active\"                                    

  5        Mobile menu HTML included; hamburger        CLAUDE_v3.md §4.7
           visible only at ≤ 760px                     

  6        Bismillah: first child of .hero-inner;      CLAUDE_v3.md §5.1
           teal-gradient light / gold-gradient + glow  
           dark                                        

  7        Hero H1: var(\--font-display) with \<span   CLAUDE_v3.md §6
           class=\"grad-it\"\> for emphasis            

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

  14       Focus-trap in Trace View, Share Modal,      WCAG 2.1 AA 2.1.2
           Settings, Bookmarks Panel when open         

  15       Both light and dark themes tested on every  Func. Doc §18.8
           stage sub-feature                           

  16       All breakpoints verified: 1280 / 1100 / 820 Quran_Module_PRD
           / 700 / 420px                               §11.0

  17       No new CSS color tokens, radii, or easing   Quran_Module_PRD
           curves outside CLAUDE_v3.md §1              §11.0

  18       .ayah-actions order: Play · Bookmark · Copy Quran_Module_PRD
           · Share · Notes · Explain (never reordered) §11.12

  19       .rtb-row2 order: Reciter · sep ·            Quran_Module_PRD
           Translation · sep · WBW · Tajweed · Compare §11.12
           · Tafsir · Reading Mode · sep · Settings ·  
           Bookmarks                                   

  20       Tafsir: lazy-loaded only (never fetched on  Quran_Module_PRD
           page load)                                  §11.3.6

  21       Bismillah banner absent for Surah 9         Func. Doc §2 rule
           (At-Tawbah)                                 

  22       Mode name: \"Mushaf Mode\" (never \"Arabic  Func. Doc §18 rule
           Only\")                                     1

  23       AI Explain: system prompt not overridable;  Func. Doc §18 rule
           no fatwa; no fabrication; error state wired 4

  24       \"✦ Powered by QuranlyAI\" attribution      Quran_Module_PRD
           visible on every AI Explain card, linked to §11.6.1
           quranlyai.com                               

  25       Tajweed colours: 6 rules, correct hex       Quran_Module_PRD
           values, dark-mode overrides all present     §11.5.2

  26       Compare mode: 3 translations in one API     Quran_Module_PRD
           call (?translations=131,85,95)              §11.5.3

  27       Reading streak: linked to                   Quran_Module_PRD
           habits.html?source=quran                    §11.6.3

  28       Lighthouse Performance ≥ 90 on /quran       §6.5 Performance
           (Al-Fatihah, first 7 verses)                
  ------------------------------------------------------------------------

**9. Out of Scope**

The following are explicitly deferred per Quran_Module_PRD.md §11.10 and
must not block any Stage:

- User-created bookmark categories beyond 5 defaults + 15 custom
  (auth-gated, needs account system)

- Server-side sync for notes and bookmarks (localStorage only in Stages
  1--4)

- Surah-level Tajweed recitation highlighting (audio-synced text ---
  complex timing layer)

- Side-by-side Tafsir source comparison (§11.5.3 covers translation
  comparison, not Tafsir-vs-Tafsir)

- Full offline corpus (all 114 Surahs cached) --- Stage 2 caches
  current + last 3 viewed only

- RTL UI chrome (Arabic-language interface) --- Stage 2 covers RTL
  content, not RTL navigation

- Mobile app features (push notifications, haptic feedback, full audio
  download) --- documented in Func. Doc §17

- Subscription / paywall implementation for premium features

- Server-side search index for Qur\'an full-text (Stage 2 search is
  client-side or lite API)

- All other platform pages: Home, Hadith Library, Islamic Studies,
  Knowledge Hub, Daily Duas, Tools, Habit Tracker, Verify, About

**10. Revision History**

  ---------------------------------------------------------------------------------
  **Version**   **Date**   **Author**     **Summary**
  ------------- ---------- -------------- -----------------------------------------
  v1.0          May 2026   IslamicInfo    Initial PRD --- synthesised from
                           Product Team   quran_v5.html blueprint,
                                          Quran_Module_Functional_Document_v2.md,
                                          Quran_Module_PRD.md (Phase 6 Enhanced
                                          Spec v2), and CLAUDE_v3.md v3.0

  v1.1          May 2026   Claude         FIX-1: US-Q01b WBW base toggle user story
                           (Anthropic)    added. FIX-2: Tajweed contrast ratios
                           --- Review &   computed and cited with actionable fix
                           Refinement     recommendations. FIX-3: US-Q16b
                                          focus-trap user story added. FIX-4: §2.4
                                          blueprint version note added. FIX-5: §11
                                          Definition of Done added from
                                          Quran_Module_PRD §11.11.
  ---------------------------------------------------------------------------------

**11. Definition of Done --- Qur\'an Module \[FIX-5\]**

*FIX-5 applied: Quran_Module_PRD.md §11.11 defines a formal Definition
of Done for the entire Qur\'an module. It was absent from v1.0.
Reproduced and expanded below as the authoritative sign-off gate.*

Phase 6 (all four build stages) is complete when every item below is
checked off. No stage is considered shipped until both its own
acceptance criteria (§11.3.8, §11.4.12, §11.5.4, §11.6.5 of
Quran_Module_PRD.md) and these module-level criteria are satisfied.

  -------------------------------------------------------------------
  **\#**   **Definition of Done Criterion**           **Verified By**
  -------- ------------------------------------------ ---------------
  1        All four stages signed off against their   Engineering
           individual acceptance criteria (§11.3.8,   Lead + Product
           §11.4.12, §11.5.4, §11.6.5)                

  2        All routes in §2.3 deep-link, share, and   QA
           correctly handle back/forward browser      
           navigation                                 

  3        Every frozen content string from           Product +
           quran_v5.html blueprint is preserved       Design
           verbatim --- no label, heading, button     
           copy, surah name, or footer string altered 

  4        Dark-mode parity audit passed --- every    QA +
           component, panel, and overlay tested in    Engineering
           both \[data-theme=\"light\"\] and          
           \[data-theme=\"dark\"\]                    

  5        All breakpoints render cleanly: 1280 /     QA
           1100 / 820 / 700 / 420px --- verified on   
           real devices and DevTools                  

  6        All hover interactions use                 Engineering
           var(\--ease-reverent) for cards/panels and 
           var(\--ease-premium) for buttons --- no    
           ad-hoc easing                              

  7        No new design tokens, colors, or radii     Engineering
           introduced outside CLAUDE_v3.md §1 ---     
           verified with a CSS diff against the token 
           list                                       

  8        \"✦ Powered by QuranlyAI\" attribution     Product + QA
           visible on every AI Explain card, with     
           working link to quranlyai.com              

  9        No fabricated Tafsir, no fabricated verse, Product + AI
           no AI-issued fatwa or ruling in any        Safety
           response --- tested with adversarial       
           prompts                                    

  10       tj-ikhfa and tj-madd light-mode contrast   Engineering +
           investigated and either darkened to        Accessibility
           AA-compliant values or documented as a     
           known accessibility trade-off with product 
           sign-off                                   

  11       Focus-trap verified in all four overlays   QA +
           (Trace View, Share Modal, Settings,        Accessibility
           Bookmarks) with VoiceOver and NVDA         

  12       Lighthouse Performance ≥ 90, Accessibility Engineering
           ≥ 90, Best Practices ≥ 90, SEO ≥ 90 on a   
           representative reader page (/quran,        
           Al-Fatihah loaded)                         

  13       quran_v5.html §16 enforcement checklist    Engineering
           (CLAUDE_v3.md §24) passes on every route   
           in §2.3                                    

  14       Reading streak correctly linked to         QA
           habits.html?source=quran; streak data      
           verified to persist across sessions        

  15       Service worker registered; offline         Engineering +
           indicator dot appears; cached surah reads  QA
           correctly without network                  

  16       AI Explain system prompt verified as       Engineering +
           non-overridable via all tested input       AI Safety
           vectors                                    

  17       All error fallback states tested: API      QA
           timeout, CDN 404, Geolocation denied,      
           localStorage quota exceeded, canvas font   
           timeout                                    

  18       GA4 custom events firing correctly for all Analytics +
           9 KPI metrics defined in §1                Engineering
  -------------------------------------------------------------------
