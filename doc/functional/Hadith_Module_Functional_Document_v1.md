# Hadith Module — Functional Document v1.0

> Maintained by: IslamicInfo founding team
> Created: 2026-05-17
> Applies to: `hadith.html` · Hadith Library page
> Sister document: Quran Module Functional Document v2.0
> Design system: CLAUDE.md v3.0

---

## 1. Product Purpose

The Hadith module is a full-featured Hadith reading, research, and study experience. It gives users access to all major hadith collections with authentic grading, isnad (chain of narration) transparency, narrator reliability panels, scholarly tools, and the same rich per-hadith actions available on the Quran page — bookmarks, notes, copy with attribution, share image, audio, AI explanation, translation comparison, and trace view.

The primary goal is to let users read, study, verify, and reflect on hadith in a trustworthy and beautiful environment — without ever guessing whether a hadith is authentic.

---

## 2. Primary User Goals

- Find a hadith quickly by collection, book, topic, narrator, or free-text search.
- Read the Arabic matn and English translation side by side.
- Understand the isnad — who narrated it and how reliable each narrator was.
- Verify the grade (Sahih, Hasan, Da'if) from named scholars with citations.
- Save bookmarks, write personal notes, copy with full attribution.
- Share a hadith as an image for social media or WhatsApp.
- Listen to the Arabic hadith being recited.
- Get an AI explanation of the hadith's meaning and scholarly context.
- Compare how the same topic appears across multiple collections.
- Study deeply via Hadith Trace View — matn + isnad + commentary + related narrations in one focused layout.

---

## 3. Page Layout

The page uses a two-column layout:

- **Left sidebar** — Collection list, classical scholar list, reading paths, progress tracker, "Ask a Question" CTA.
- **Main content area** — Hero, search, stats strip, Hadith of the Day, collections grid, topic chips, hadith feed, stage-by-stage tooling, CTA section.

The sidebar collapses on mobile. The main area becomes full-width.

---

## 4. Hadith Collections

### 4.1 Supported Collections (initial set)

| Collection | Arabic | Hadiths | Grade |
|---|---|---|---|
| Sahih al-Bukhari | صحيح البخاري | 7,563 | Highest Sahih |
| Sahih Muslim | صحيح مسلم | 5,362 | Sahih |
| Sunan Abu Dawud | سنن أبي داود | 5,274 | Mixed |
| Jami' at-Tirmidhi | جامع الترمذي | 3,956 | Mixed |
| Sunan an-Nasa'i | سنن النسائي | 5,748 | Mixed |
| Sunan Ibn Majah | سنن ابن ماجه | 4,341 | Mixed |
| Musnad Ahmad | مسند أحمد | 27,647 | Mixed |
| Riyad as-Saliheen | رياض الصالحين | 1,896 | Sahih/Hasan |
| 40 Hadith Nawawi | الأربعون النووية | 42 | Sahih/Hasan |

### 4.2 Collection Card Anatomy

Each collection in the grid shows:
- Motif icon (emoji or SVG illustration — unique per collection)
- Arabic name + English name
- Compiler name + dates
- Stats: hadith count · books · compilation period
- Authenticity badge with colour-coded grade dot
- Browse button → enters 3-tier navigation

---

## 5. Three-Tier Navigation (Collection → Book → Hadith)

### Tier 1 — Collections Grid
All collections shown as cards. User selects one.

### Tier 2 — Book List
After selecting a collection, the user sees a grid of books within that collection. Each book card shows: Book number · Arabic name · English name · Hadith count · grade summary.

### Tier 3 — Hadith List
After selecting a book, the user sees the hadith feed for that book. Each hadith is a full hadith card (see §6).

A breadcrumb shows the current path: All Collections › Sahih al-Bukhari › Book 1 · Revelation. Users can jump back to any tier.

---

## 6. Hadith Card — Full Anatomy

Every hadith in the feed is displayed as a card. Each card has the following structure:

### 6.1 Card Header
- Hadith number badge
- Grade badge (Sahih / Hasan / Da'if / Mawdu') with colour coding and named grader (e.g. "Sahih · Darussalam")
- Action buttons row (see §7 — Per-Hadith Actions)

### 6.2 Arabic Matn
The full Arabic text of the hadith, displayed in Amiri font, right-to-left, with appropriate line height and size. The beginning of the isnad (chain of narrators) is shown in the Arabic as the hadith opener.

### 6.3 Translation Block
- Narrator attribution line: "Narrated by [Companion name] (رضي الله عنه):"
- English translation of the hadith text in full
- Translation credit and edition label

### 6.4 Card Footer
- Reference string: Collection · Book · Hadith number
- Footer action buttons: View Isnad · Listen · Open Full View

### 6.5 Expandable Isnad Chain
When "View Isnad" is clicked, the isnad chain expands below the card. It shows each narrator as a node:
- Avatar initials (Arabic)
- Full name
- Lifespan and era
- Reliability indicator dot (green = Thiqah, gold = Saduq, red = Da'if)
- Chain connector lines between narrators

---

## 7. Per-Hadith Actions — Full Suite

Every hadith card and the full trace view support the complete action suite. This mirrors the Quran page action system.

### 7.1 Bookmark
- Tap the bookmark icon on any hadith card to save it.
- Bookmark stores: collection name, book, hadith number, Arabic snippet, English snippet, and timestamp.
- Bookmarks are organised into categories: General · For Memorisation · Reflection · To Verify · + New Category.
- A bookmarks panel (slide-in from right) shows all saved hadiths, filterable by category.
- Bookmark state persists in localStorage. Syncs to account when logged in (premium).

### 7.2 Notes
- Tap the note icon to open an inline note editor below the hadith card.
- The editor is a simple textarea with Save and Cancel actions.
- Saved notes appear as a small note indicator dot on the hadith number badge.
- Notes are stored locally and linked to the hadith reference (collection + number).
- Users can view all notes from the bookmarks panel.

### 7.3 Copy with Attribution
- One-click copy of the hadith text formatted as a scholarly citation:
  ```
  "[Hadith text]" — Ṣaḥīḥ al-Bukhārī, Book 1, Ḥadīth 1.
  Narrated by ʿUmar ibn al-Khaṭṭāb (رضي الله عنه).
  Graded Ṣaḥīḥ by Imam al-Bukhārī · Confirmed by Dār us-Salām.
  ```
- Arabic text copy option: copies only the Arabic matn.
- A "Copied ✦" toast confirms the action.

### 7.4 Share Image Generation
- Opens a share modal with two format options: Square (1:1) and Story (9:16).
- The share image preview shows:
  - IslamicInfo logo and branding at top
  - Arabic matn in large Amiri font
  - Gold divider line
  - English translation
  - Reference attribution at bottom
  - Subtle Islamic geometric background pattern
- Download PNG button exports the canvas image.
- Native Share button triggers the browser share sheet (Web Share API).
- Dark and light image themes available.

### 7.5 Audio / Listen
- Tapping Listen plays the Arabic hadith text as recited audio.
- A mini player appears below the hadith card: play/pause, progress bar, speed control (1× / 1.25× / 1.5× / 0.75×).
- The recitation source is clearly attributed (e.g. Sheikh al-Hussary).
- A waveform animation indicates active playback.
- Auto-advance option: plays the next hadith in the feed automatically.

### 7.6 AI Explanation (QuranlyAI-powered)
- Tapping the AI Explain button (✦ star icon) opens an AI explanation card below the hadith.
- The card shows a plain-language explanation of the hadith's meaning, scholarly context, and practical application.
- Structure of the explanation:
  - One-paragraph plain-language summary
  - Key vocabulary terms (Arabic word → meaning)
  - Scholarly context (which scholars commented on this hadith)
  - Practical lesson (what this teaches a Muslim today)
- Clearly labelled: "✦ Powered by QuranlyAI"
- Hard rules: No fabrication. No fatwa. No ruling. Explanation and context only.
- Dismissable with ✕. Lazy-loaded — only calls the AI when opened.

### 7.7 Translation Comparison
- Opens a comparison panel showing the same hadith in multiple translations:
  - English (Darussalam)
  - English (USC-MSA)
  - English (Siddiqui)
  - When available: Bangla · Urdu · Turkish · Indonesian · French
- Translations stack vertically, each labelled with translator/edition.
- The primary translation is highlighted at the top.
- Compare mode can show up to 4 translations simultaneously.
- Language preference is saved in user settings.

### 7.8 Hadith Trace View
The deepest research mode. Opens a full-screen focused layout with four columns:

**Column 1 — Matn (Text)**
- Full Arabic matn in large Amiri font
- English translation with left teal border
- Topic chips: relevant themes and keywords
- Related Quranic verses (if any)

**Column 2 — Isnad Chain**
- Full visual isnad with clickable narrators
- Each narrator opens a detail tooltip: name, kunya, era, city, reliability rating from major critics (Ibn Hajar, al-Dhahabi, al-Mizzi)
- Chain divergence points highlighted in gold
- Reliability colour system: Green (Thiqah), Gold (Saduq), Red (Da'if), Grey (Unknown)

**Column 3 — Scholarly Commentary**
- Tab selector: Ibn Hajar al-'Asqalani · Imam an-Nawawi · al-'Ayni · al-Qurtubi
- Commentary text loads per tab
- Citation reference shown below each commentary block
- Commentary loads lazily when the tab is activated

**Column 4 — Related Narrations**
- Parallel narrations of the same matn in other collections
- Thematically related hadiths
- Quranic verses on the same theme
- Each related item links directly to that hadith in the reader

Trace View also includes the full action suite: bookmark, copy, share, AI explain, notes.

A breadcrumb at the top shows context: Qur'an › Collection › Book › Hadith. An Exit Trace View button returns to the hadith feed.

---

## 8. Hadith of the Day

A featured strip at the top of the main content area shows today's Hadith of the Day:
- Arabic matn (large, centred, Amiri font)
- English translation
- Reference: collection · hadith number · narrator · grade
- Actions: Bookmark · Share · View Full Isnad
- Rotates daily (served from backend or static schedule)
- Tapping "View Full Isnad" opens the Trace View for that hadith

---

## 9. Topic System

### 9.1 Topic Chips
Topics are browsable labels: Faith & Belief · Prayer (Salah) · Charity (Zakat) · Fasting (Sawm) · Hajj & 'Umrah · Purification · Knowledge & Wisdom · Ethics & Character · Family & Marriage · Supplications · Afterlife & Judgment · Trade & Finance · Death & Burial · Governance & Justice.

Tapping a topic opens a Topic Landing Page.

### 9.2 Topic Landing Page
Each topic page shows:
- Topic name and description in scholarly tone
- Study order recommendation
- Count of key narrations
- Recommended starting hadith
- Related topic chips
- Filtered hadith feed for that topic

---

## 10. Narrator Reliability System

### 10.1 Reliability Grades
| Grade | Colour | Arabic | Meaning |
|---|---|---|---|
| Thiqah | Green | ثقة | Trustworthy — highest |
| Thiqah Thabt | Green+ | ثقة ثبت | Trustworthy, firm — superior |
| Saduq | Gold | صدوق | Honest — acceptable |
| Da'if | Red-orange | ضعيف | Weak — caution |
| Matruk | Red | متروك | Abandoned — rejected |
| Unknown | Grey | مجهول | Unknown status |

### 10.2 Narrator Detail Panel
When a narrator is clicked (in isnad chain or trace view), a panel slides in showing:
- Full name and kunya (honorific)
- Lifespan and location
- Era: Companion / Tabi'i / Tabi' al-Tabi'in / Later
- Reliability grade badge
- Scholar gradings table: Scholar name · Grade given · Source citation
- Count of narrations attributed to this narrator across collections
- Link: "View all hadiths narrated by [name]"

---

## 11. Comparison Mode

### 11.1 Cross-Collection Comparison
Users can compare up to 3 hadiths side by side:
- Select "Compare" from any hadith card action menu
- A comparison header shows the selected hadiths as removable chips
- Below: side-by-side panels with Arabic matn and translation
- Differing words are highlighted in gold (diff-highlight class)
- Chain divergence points marked with a ◆ symbol and explanatory note
- Available from the main hadith feed and from Trace View

### 11.2 Translation Comparison (within one hadith)
See §7.7 above.

---

## 12. Reading Paths

Pre-built guided study sequences visible in the sidebar:

| Path | Count | Description |
|---|---|---|
| Start with 40 Nawawi | 42 | Best entry point for beginners |
| Kutub al-Sittah Basics | 50 | Core hadiths from the six books |
| Faith Foundations | 30 | Hadiths on Iman, Tawhid, Ihsan |
| Prophetic Character | 25 | Hadiths on the Prophet's ﷺ manners |
| Daily Sunnah | 20 | Hadiths on morning/evening practices |

Each path shows:
- A circular progress ring with percentage
- Hadiths read out of total (e.g. "17 of 42 read")
- A "Continue" button that opens the next unread hadith in the path
- Previous/Next navigation strip inside the hadith feed while on a path

---

## 13. Search

### 13.1 Hero Search Bar
The main search bar at the top of the page supports:
- Free-text search (Arabic or English)
- Voice input (microphone icon)
- Scope filters: All · Hadith · Qur'an · Dua · Verify ✦

### 13.2 Search Results
Results show:
- Hadith reference (collection + number)
- Arabic snippet with matching text highlighted
- English snippet with matching text highlighted
- Grade badge
- "Open" button → goes directly to that hadith card

### 13.3 Sidebar Search
A compact search bar inside the sidebar filters the collection list and book list. Typing narrows results in real time.

---

## 14. Grading System

### 14.1 Grade Badges
Every hadith shows a grade badge in the card header:

| Grade | Colour token | Display |
|---|---|---|
| Sahih | `--grade-sahih` (green) | ● Sahih |
| Hasan | `--grade-hasan` (olive) | ● Hasan |
| Da'if | `--grade-daif` (amber) | ● Da'if |
| Mawdu' | `--grade-mawdu` (red) | ● Mawdu' |

### 14.2 Named Grader
Every grade badge includes the name of the grader: "Sahih · Darussalam" or "Hasan · al-Albani" or "Sahih · Imam al-Bukhari". This ensures source transparency.

### 14.3 Grade Filter Pills
Above the hadith feed: All Grades · Sahih · Hasan · Da'if. Clicking a filter narrows the feed in real time.

---

## 15. Study Mode

A distraction-free layout for deep reading:
- Sidebar collapses
- Hero section, topic chips, and collections grid are hidden
- Reader fills available width
- A green "Study Mode Active" banner appears at the top with an Exit button
- Trace View opens by default in Study Mode
- Preferences for Study Mode are saved per-session

---

## 16. Multilingual Translation

The translation shown below each Arabic matn is selectable. Supported languages (initial set):

English · Bangla · Urdu · Hindi · Turkish · French · Indonesian · Malay · Arabic (Classical commentary edition)

The language selector is a dropdown in the hadith feed header. The selected language applies globally across all hadith cards on the page. The selection is saved in localStorage.

---

## 17. Persistence and Preferences

The following preferences persist across sessions via localStorage:

- Selected collection and book (last viewed)
- Translation language
- Reading path and progress
- Bookmarks (all saved hadiths with categories)
- Notes (all saved notes linked to hadith references)
- Study Mode state (on/off)
- Last-read hadith position

Account sync (premium): bookmarks, notes, and reading path progress sync across devices when logged in.

---

## 18. Sharing and Community

### 18.1 Share Image
See §7.4. Available on every hadith card and in Trace View.

### 18.2 Deep Links
Every hadith has a unique URL: `islamicinfo.org/hadith/bukhari/1` or `islamicinfo.org/hadith/bukhari/book/1/hadith/1`. Sharing this URL takes the recipient directly to that hadith card, highlighted with a gold pulse ring.

### 18.3 Copy with Attribution
See §7.3.

---

## 19. Mobile Behaviour

- Sidebar collapses to a bottom sheet on mobile, triggered by a "Collections" tab button.
- Hadith cards stack full-width.
- Trace View opens as a full-screen overlay on mobile.
- Isnad chain reflows to a vertical list on narrow screens.
- Share modal is full-screen on mobile.
- Audio player pins to the bottom of the screen when active.

---

## 20. Functional Rules

1. **Grade transparency is mandatory.** Every hadith must show a grade badge with a named grader. Never display a hadith without its grade.
2. **Isnad accuracy.** The isnad chain shown must match the actual chain for that hadith. Static placeholder chains are acceptable for mockup only.
3. **No fatwa, no ruling.** AI explanation provides context and meaning only. It never issues legal rulings, answers permissibility questions, or gives fatwa-style answers.
4. **Attribution on all copies.** Every copy action must include the full scholarly reference. Stripping attribution is not permitted.
5. **Narrator reliability must be sourced.** Each reliability grade shown in the narrator panel must cite the original source (e.g. Taqrib at-Tahdhib, no. 4686).
6. **Audio attribution.** The reciter name must always be shown next to the audio player.
7. **Translation source.** Every translation must show its edition name and translator.
8. **No shimmer sweep.** Cards use the approved glow hover system from CLAUDE.md §27.4.
9. **Design system.** All components follow CLAUDE.md v3.0. No new colours, no new fonts, no shimmer effects.
10. **Privacy.** Bookmarks and notes are local by default. No personal data is sent to the server without explicit user opt-in.

---

## 21. Gaps in Current Mockup (Build Priority Order)

The following features are defined in this document but not yet wired in `hadith_module_enhanced.html`. Build in this order:

### 🔴 High Priority — Wire These First
| # | Feature | Gap |
|---|---|---|
| 1 | **Bookmark toggle** | Button present, not wired to localStorage |
| 2 | **Note editor** | Not present on hadith cards — add inline textarea + save |
| 3 | **Copy with attribution** | Button present, `navigator.clipboard` not wired |
| 4 | **Share image modal** | Not present — build canvas-based share image generator |
| 5 | **AI Explanation card** | Not present — add ✦ AI button + lazy-loaded card |
| 6 | **Translation comparison panel** | Not present — add language dropdown + stacked translations |
| 7 | **Listen / Audio player** | Button present, not wired — add mini player with progress bar |

### 🟠 Medium Priority
| # | Feature | Gap |
|---|---|---|
| 8 | **3-tier navigation** | "Browse →" on collection cards goes nowhere |
| 9 | **Hadith Trace View** | Layout present as mockup, not fully wired |
| 10 | **Narrator detail panel** | Reliability dots present, click tooltip not wired |
| 11 | **Translation language selector** | Not present — add dropdown above hadith feed |
| 12 | **Bookmarks panel** | Not present — add slide-in panel |
| 13 | **Deep links** | URL routing not implemented |

### 🟢 Lower Priority
| # | Feature | Gap |
|---|---|---|
| 14 | **Reading path navigation** | Strip present, Previous/Next not wired |
| 15 | **Hadith search wiring** | Search bar UI present, not wired to results |
| 16 | **Grade filter wiring** | Pills present, filtering logic not connected |
| 17 | **Audio auto-advance** | Not implemented |
| 18 | **Narrator comparison across hadiths** | No UI for this yet |

---

## 22. Consistency with Quran Page

The Hadith page shares the following patterns with the Quran page, implemented identically:

| Pattern | Quran Page | Hadith Page |
|---|---|---|
| Bookmark icon + toggle | ✅ | Target |
| Note editor (inline textarea) | ✅ | Target |
| Copy with attribution | ✅ | Target |
| Share image modal (square + story) | ✅ | Target |
| AI Explain card (✦ QuranlyAI) | ✅ | Target |
| Audio mini player | ✅ | Target |
| Translation comparison | ✅ (multi-language) | Target |
| Trace View (4-column deep research) | ✅ | ✅ Present (needs wiring) |
| Toast notifications | ✅ | Target |
| Bookmarks panel (slide-in) | ✅ | Target |
| Settings panel | ✅ | Target |
| Dark mode | ✅ | ✅ Present |
| Global header + footer | ✅ | Needs update to CLAUDE.md §4/§7 |

**Key difference from Quran page:**
- Hadith has Isnad chain (narrators) — Quran does not
- Hadith has cross-collection comparison — Quran has multi-translation comparison
- Hadith has narrator reliability grades — Quran has Tajweed colours
- Hadith has "Verify" integration — user can push a hadith to the Verify page for deeper authenticity checking

---

## 23. Apply to Dua Page

All per-hadith actions in §7 apply equally to the Dua page:

| Action | Dua Page Implementation |
|---|---|
| Bookmark | Save dua to personal dua collection |
| Notes | Add personal reflection to a dua |
| Copy with attribution | Copy dua + source (Quran verse or hadith reference) |
| Share image | Share dua as image card with Arabic + translation |
| Listen | Play audio of the dua (male/female reciter option) |
| AI Explanation | Explain the meaning and context of the dua |
| Translation comparison | Show dua translation in multiple languages |
| Trace View | Source trace — is this dua from Quran, hadith, or scholars? |

The Dua page does not need an isnad chain or narrator reliability system. Instead it needs a **Source Trace** — showing whether the dua is: From the Quran (with verse reference) · From a Hadith (with collection and grade) · From classical scholars (with attribution) · Common practice (with a note on its status).

---

*End of Hadith Module Functional Document v1.0*
