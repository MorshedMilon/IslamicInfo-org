# Islamic Studies — Functional Document v1.0

> Maintained by: IslamicInfo founding team
> Created: 2026-05-17
> Applies to: `islamic-studies.html`
> Design system: CLAUDE.md v3.0
> Sister pages: Knowledge Hub (`knowledge-hub.html`) · Quran Explorer · Hadith Library

---

## 1. Product Purpose

Islamic Studies is the **structured curriculum** of IslamicInfo — a school, not a library. It gives users a sequential, level-gated learning path through Islamic knowledge: from foundational beliefs to classical scholarship. Every lesson has prerequisites, progress tracking, and a knowledge check quiz. Reading material lives in the Knowledge Hub; Islamic Studies provides the course schedule and learning sequence.

**Critical distinction from Knowledge Hub:**

| | Islamic Studies | Knowledge Hub |
|---|---|---|
| **Mental model** | School · Madrasa | Library · Encyclopedia |
| **User intent** | "Teach me Islam step by step" | "I want to read about X" |
| **Content** | Lesson sequences, prerequisites, quizzes, certificates | 2,000+ standalone articles, free browsing |
| **Order** | Sequential — must follow prerequisites | Free-form — any order |
| **Article grids** | ❌ Never | ✅ Yes |
| **Progress tracking** | ✅ Yes | ❌ No |
| **Cross-links** | Lessons link OUT to KH for reading material | KH links back to IS for structured learning |

> **Rule:** Islamic Studies must NEVER contain browsable article grids. Knowledge Hub must NEVER contain lesson prerequisites or progress tracking.

---

## 2. Primary User Goals

- Understand where to start learning Islam properly, at any level.
- Follow a sequential curriculum without guessing what comes next.
- Track personal progress through lessons and pathways.
- Pass knowledge checks to confirm understanding before advancing.
- Access the reading material for each lesson (hosted in Knowledge Hub).
- Earn a certificate upon completing a full track.

---

## 3. Page Architecture

The page is a single-scroll experience with these major sections, in order:

1. Global header (CLAUDE.md §4)
2. Hero — title, Quranic hadith, SEO architecture bar, stats strip
3. Three Learning Pathways — Beginner / Intermediate / Advanced
4. Curriculum Tracks — topic-based track cards with prerequisites and progress
5. Active Lesson Sequence — the current lesson list for the selected track
6. Knowledge Check / Quiz Band
7. Knowledge Hub Handoff — explains the IS–KH relationship
8. Daily Reflection — verse/hadith of the day with link to KH
9. Scholars Referenced — classical authority grid
10. CTA section
11. Global footer (CLAUDE.md §7)

---

## 4. Hero Section

### 4.1 Content (Frozen — Do Not Change Without Instruction)
- **Bismillah** with gold divider (CLAUDE.md §5 Islamic Studies variant)
- **Eyebrow:** "Structured Curriculum"
- **H1:** "Islamic Studies / *Curriculum*" (gradient-italic on second word)
- **Arabic hadith:** طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ with English translation and source (Ibn Majah · 224 · Hasan)
- **Subtitle:** Explains the school vs. library distinction
- **SEO Architecture Bar** — 2-panel bar showing: 🎓 Islamic Studies (active, Curriculum · Lessons · Quizzes) | 📚 Knowledge Hub (link, 2,000+ Articles · Browse freely)
- **Stats strip:** 10 Tracks · 152 Lessons · 3 Levels · 48h+ Curriculum

### 4.2 SEO Architecture Bar
The two-panel bar serves a dual purpose: it orients users and signals to Google that these are two distinct page types. The Islamic Studies panel is always shown active on this page. The Knowledge Hub panel links to `knowledge-hub.html`. This bar must appear on every load of the hero section.

---

## 5. Three Learning Pathways

Three pathway cards presented in a horizontal grid, each representing a full level of the curriculum.

### 5.1 Beginner — Foundations of Faith 🌱
**Tracks included:**
- Beliefs & Iman (Aqeedah)
- Purification (Taharah)
- Prayer (Salah)
- Introduction to Seerah
- Fasting & Zakat basics

**Metadata:** 12 lessons · ~8h reading time

**State:** Active — shows real user progress (3 / 12 lessons, 25% fill). CTA: "Continue Path"

### 5.2 Intermediate — Deepening Practice 🏛️
**Tracks included:**
- Islamic History (Caliphates)
- Scholars & Companions
- Fiqh Principles (Usul)
- Seerah — In Depth
- Family & Society (Adab)

**Metadata:** 24 lessons · ~16h reading time

**State:** Locked — requires Beginner completion. Progress bar empty. CTA: "Begin Path" (triggers locked toast). Unlock condition: all 12 Beginner lessons completed.

### 5.3 Advanced — Classical Scholarship 📜
**Tracks included:**
- Tafsir Methodology
- Hadith Sciences ('Ilm al-Hadith)
- Usul al-Fiqh (Principles of Jurisprudence)
- Islamic Theology (Kalam)
- Ethics & Adab (Classical Texts)

**Metadata:** 36 lessons · ~24h reading time

**State:** Locked — requires Intermediate completion. CTA: "Locked" state. Unlock condition: all 24 Intermediate lessons completed.

### 5.4 Pathway Card Anatomy
Each card contains, top to bottom:
- Level badge (🌱 Beginner / 🏛️ Intermediate / 📜 Advanced) — top-left
- Level emoji icon — large, centred
- Level title (Cormorant Garamond, 26px)
- Description (2–3 sentences)
- Track list — bullet rows with coloured dot indicators (green = done, teal = in progress, gold = locked)
- Metadata: lesson count + estimated reading time
- Progress section: label row ("Your progress · X / Y") + animated progress bar
- CTA button: "Continue Path" (active) or "Begin Path" (locked, with lock toast)

### 5.5 Progress Bar Behaviour
Progress bars animate in when the card enters the viewport (IntersectionObserver at threshold 0.25). The fill width is driven by `data-w` attribute. Locked pathway bars show 0% and are greyed out.

### 5.6 3D Tilt on Hover
Pathway cards have a 3D mouse-tracking tilt effect: `rotateX` and `rotateY` values update on mousemove inside the card, then reset on mouseleave with the standard ease transition.

---

## 6. Curriculum Tracks Grid

Below the pathways is a grid of individual topic-based track cards. These are the sub-units within each pathway.

### 6.1 Track Card Anatomy
Each track card (`.track-card`) contains:
- **Top row:** Track icon (52×52 rounded square, teal or gold variant) + Track badge (Start Here / Pillar / Featured / Locked)
- **Track title** (Cormorant Garamond, 20px) + Arabic name in Amiri
- **Description** (2–3 sentences explaining what this track covers)
- **Prerequisite chain:** Horizontal pill row showing prerequisite tracks with done/pending state. e.g. "Tawhid ✓ → Six Pillars ✓ → Taharah ▶"
- **Progress bar:** Label row (lesson count · percentage) + animated 5px bar
- **CTA row:** Left side: lesson count + time estimate + certificate badge. Right side: "Start Track" or "Continue" button

### 6.2 Track Badge Types
| Badge | Colour | When Used |
|---|---|---|
| Start Here | Green | Recommended first track for new users |
| Pillar | Teal | Core 5-pillars content |
| Featured | Gold gradient | Editor-recommended / highly rated |
| Locked | Grey | Prerequisites not yet met |

### 6.3 Initial Track Set (10 Tracks)

| Track | Arabic | Level | Lessons | Pre-req |
|---|---|---|---|---|
| Beliefs & Iman (Aqeedah) | العقيدة | Beginner | 12 | None |
| Purification (Taharah) | الطهارة | Beginner | 8 | Aqeedah |
| Prayer (Salah) | الصلاة | Beginner | 10 | Taharah |
| Fasting (Sawm) | الصيام | Beginner | 6 | Salah |
| Zakat & Hajj | الزكاة والحج | Beginner | 6 | Salah |
| Introduction to Seerah | السيرة النبوية | Beginner | 8 | None |
| Islamic History | التاريخ الإسلامي | Intermediate | 8 | Seerah |
| Scholars & Companions | العلماء والصحابة | Intermediate | 8 | Seerah |
| Fiqh Principles (Usul) | أصول الفقه | Intermediate | 10 | Salah + Zakat |
| Classical Scholarship | العلوم الإسلامية | Advanced | 18 | All Intermediate |

### 6.4 Prerequisites Rule
A track is locked if any prerequisite track has not been completed. The prerequisite chain always shows in the card so users know what to do next. Clicking a locked track shows a friendly toast: "Complete [prerequisite track] first to unlock this."

---

## 7. Active Lesson Sequence

A full lesson list for the currently selected track. The user picks a track via tab buttons above the list (`.lts-btn`). JavaScript (`setTrack()`) renders the list dynamically.

### 7.1 Lesson Item States

| State | Visual | Meaning |
|---|---|---|
| Done (✓) | Green checkmark badge, ticked dot, teal left border | Lesson completed |
| Current (▶) | Play triangle badge, highlighted background `rgba(0,105,110,.04)`, "Read →" button active | Lesson in progress |
| Next (number) | Number badge, subtle style, "Read →" button active | Available to start |
| Locked (🔒) | Lock emoji badge, greyed out, no Read button | Prerequisites not met |

### 7.2 Lesson Item Anatomy
Each lesson row shows:
- State badge (left): ✓ / ▶ / number / 🔒
- Lesson title (font-size 14.5px, ink-body)
- Meta row: reading time (e.g. "11 min") · topic tag (e.g. "Prayer") · "📚 Read in Knowledge Hub" badge (shown for non-locked lessons)
- "Read →" CTA link (right) → opens the linked Knowledge Hub article

### 7.3 Track Selector Tabs
Four default tabs above the list: Foundations · Seerah · Prayer · History. Clicking a tab calls `setTrack(btn, track)` which re-renders the lesson list from the `TRACKS` data object. The active tab gets a teal underline + teal text.

### 7.4 "Continue" Action
Below the lesson list: progress summary text ("3 of 12 lessons complete · 25% through Foundations") + primary "Continue Lesson X" button. Clicking it navigates to the current lesson's Knowledge Hub article.

---

## 8. Knowledge Check / Quiz Band

A prominent band section after the lesson list.

### 8.1 Band Layout
Two-column layout:
- **Left:** Quiz label · "Test What You've Learned" title · description · Prerequisite flow visualization · Quiz CTA button
- **Right:** Three stat items: Lessons done (3/12) · Quiz avg (87%) · Study streak (14d)

### 8.2 Prerequisite Flow Visualization
A horizontal pill chain showing the learning sequence with state indicators:
- ✓ Done pills (green background)
- ▶ Current pill (teal border, active)
- 🔒 Next/locked pills (grey)

Example: `✓ Tawhid → ✓ Six Pillars → ✓ Taharah → ▶ Wudu → 🔒 Salah`

### 8.3 Quiz Behaviour
Clicking "Take Quiz · Lesson X" opens the knowledge check for that lesson. Quiz format:
- 5 multiple-choice questions per lesson
- Questions drawn from the lesson content
- Score shown after submission
- If score ≥ 70%: lesson marked complete, next lesson unlocked
- If score < 70%: encourages re-reading the lesson before retrying
- Quiz results stored in localStorage and linked to the lesson reference

### 8.4 Certificates
Completing all lessons and passing all quizzes in a track earns a digital certificate. The certificate shows:
- Track name (English + Arabic)
- Scholar hadith about knowledge
- User's name (if signed in)
- Date of completion
- IslamicInfo seal
- Download as PDF button
- Share as image button (same share system as Quran and Hadith pages)

---

## 9. Knowledge Hub Handoff Section

A full-width section that clearly explains the IS–KH relationship and drives traffic to the Knowledge Hub.

### 9.1 Layout
Two-column layout:
- **Left column:** Eyebrow ("📚 Reading Material Lives in the Knowledge Hub") · title with gradient italic · explanation paragraph · two CTA buttons (Open Knowledge Hub · Browse 2,000+ Articles →)
- **Right column:** 8 Knowledge Hub cluster pills, each linking to a specific KH category anchor

### 9.2 Knowledge Hub Cluster Pills (8 clusters)
Each pill shows an icon, cluster name, and article count:

| Cluster | Icon | Articles |
|---|---|---|
| The Five Pillars | 🕋 | 342 |
| Faith & Theology | ✦ | 265 |
| Islamic History | 🏛️ | 311 |
| Prophets & Companions | 🌟 | 214 |
| Islamic Law · Fiqh | ⚖️ | 398 |
| Spirituality & Adab | 📿 | 189 |
| Qur'an & Revelation | 📖 | 287 |
| Islam in Modern Life | 🌍 | 224 |

Each pill links to `knowledge-hub.html#{cluster-anchor}`.

### 9.3 Rule
This section must never be removed. It is the primary cross-link between Islamic Studies and Knowledge Hub. Without it, users who come for curriculum and want free reading have no clear path forward.

---

## 10. Daily Reflection

A centred, bordered section with a rotating verse or hadith for the day.

### 10.1 Content
- Eyebrow: "Today's Reflection"
- Arabic text (Amiri, large, centred, RTL)
- Gold ornamental divider (✺)
- English translation (Cormorant Garamond, italic)
- Source reference (Surah name · verse · translation edition)
- CTA: "Read Tafsir in Knowledge Hub →" (teal outlined pill button → links to KH article)

### 10.2 Rotation
The reflection rotates daily. Content can be served from a static schedule or backend API. The rotation covers: Quranic verses on knowledge · hadiths on learning · verses on guidance · hadiths on teaching.

---

## 11. Scholars Referenced

A grid of classical scholar cards. Each card shows:
- Avatar initials in Arabic (teal or gold variant circle)
- Scholar name in English
- Era in AH (Islamic calendar)
- Primary fields (e.g. "Tafsir, History")

### 11.1 Initial Scholar Set

| Scholar | Arabic Initials | Era AH | Fields |
|---|---|---|---|
| Ibn Kathir | إك | 700–774 | Tafsir, History |
| Imam an-Nawawi | نو | 631–676 | Fiqh, Hadith |
| al-Qurtubi | قر | 600–671 | Tafsir, Fiqh |
| Ibn al-Qayyim | عق | 691–751 | Theology, Spirituality |
| Imam at-Tabari | طب | 224–310 | Tafsir, History |
| Ibn Hajar al-'Asqalani | حج | 773–852 | Hadith Sciences |

### 11.2 Rule
Every lesson must cite only scholars from this approved list (or an equivalent list of recognized classical authorities). No anonymous opinions. No contemporary internet personalities.

---

## 12. CTA Section

The standard IslamicInfo dark teal CTA section (CLAUDE.md §11).

### 12.1 Content
- Badge: "✦ Begin Your Journey Today"
- Title: "Knowledge is an *act of worship*" (gold italic gradient on emphasis)
- Subtitle: Knowledge hadith (Ibn Majah · 224 · Graded Ḥasan by al-Albānī)
- Two buttons:
  - **Start Curriculum** (gold btn-gold) → scrolls to / opens Beginner pathway
  - **Browse Knowledge Hub** (btn-white-ghost) → links to `knowledge-hub.html`

---

## 13. Progress Tracking System

### 13.1 What is Tracked
- Lessons read (boolean per lesson, stored by track + lesson index)
- Quiz scores (percentage per lesson)
- Track completion percentage (calculated)
- Pathway unlock state (derived from track completion)
- Study streak (days in a row with at least one lesson completed)
- Current lesson position (last viewed lesson per track)

### 13.2 Storage
- **Default:** localStorage (`islamicinfo-is-progress`)
- **Premium (account):** Synced to backend, accessible across devices

### 13.3 Progress Data Shape (localStorage)
```json
{
  "tracks": {
    "foundations": { "done": [0, 1, 2], "quizScores": [92, 88, 85] },
    "seerah": { "done": [], "quizScores": [] }
  },
  "streak": { "count": 14, "lastDate": "2026-05-17" },
  "certificates": ["foundations"]
}
```

### 13.4 Streak Logic
- Streak increments when the user completes at least one lesson in a calendar day
- Streak resets to 0 if a full day is skipped
- Streak is shown in the quiz band, pathway cards, and user profile

---

## 14. Navigation and URL Structure

### 14.1 Routing
| URL | Content |
|---|---|
| `/islamic-studies.html` | Main curriculum page (this page) |
| `/islamic-studies.html#track-aqeedah` | Scrolls to and opens the Aqeedah track |
| `/knowledge-hub.html` | Knowledge Hub (separate page — reading material) |
| `/knowledge-hub.html#pillars` | KH filtered to Five Pillars cluster |

### 14.2 Deep Links for Lessons
Each lesson that links to a Knowledge Hub article uses a URL like: `knowledge-hub.html?lesson=taharah-intro`. The KH page uses the query param to highlight and scroll to the relevant article.

### 14.3 "Read →" Link Behaviour
When a user clicks "Read →" on a lesson item:
1. Opens the linked Knowledge Hub article in the same tab
2. On return, the lesson is marked as "read" (not necessarily complete — quiz still needed)
3. If quiz is passed, lesson is marked as "done" with ✓

---

## 15. Multilingual Support

The curriculum follows the global site language selected in the header. UI text (button labels, section headers, progress labels) changes with the site language.

Lesson titles and Knowledge Hub article content may also be available in:
English · Bangla · Urdu · Hindi · Turkish · French · Indonesian · Malay

Arabic matn and scholar names remain in Arabic regardless of UI language.

---

## 16. Mobile Behaviour

- Pathway grid stacks to a single column below 640px
- Track cards stack to single column below 600px
- Lesson list remains full-width
- Prerequisite flow (pill chain) wraps to two rows on narrow screens
- Knowledge Hub cluster pills wrap naturally in flexbox
- CTA section buttons stack vertically below 480px
- Global mobile menu (hamburger → full-screen overlay) per CLAUDE.md §4.7

---

## 17. SEO Architecture Rules

These rules are absolute and must never be violated:

1. **Islamic Studies never contains article browse grids.** No "latest articles", no "browse by topic" grids with article listings. That is Knowledge Hub territory.
2. **The SEO architecture bar must always be visible in the hero.** It trains users and search engines on the IS vs. KH distinction.
3. **Lesson items always link OUT to KH** for reading material. Never host article content inline on the Islamic Studies page.
4. **Page title:** "Islamic Studies Curriculum — IslamicInfo.org"
5. **Meta description:** "Structured Islamic curriculum for every level. Sequential lessons on Aqeedah, Seerah, Prayer, Fasting, and more — with progress tracking, quizzes, and prerequisites. Start learning Islam properly."
6. **Target keywords:** "learn islam", "islamic curriculum", "islamic studies online", "how to learn quran sequentially", "islamic lessons for beginners"
7. **Knowledge Hub targets:** "what is tawhid", "five pillars of islam", "is music haram" (long-tail informational) — these must never bleed onto the IS page.

---

## 18. Design System Compliance

This page uses the CLAUDE.md v3.0 design system in full:

| Element | Token / Pattern |
|---|---|
| Global header | CLAUDE.md §4.3 — `.site-header`, `.brand`, `.nav`, `.header-tools` |
| Mobile menu | CLAUDE.md §4.7 — `.mobile-menu`, `.mm-link`, `openMM()` / `closeMM()` |
| Bismillah | CLAUDE.md §5 — Islamic Studies variant with divider lines |
| Hero | CLAUDE.md §6 — `.hero`, `.hero-bg`, `.geo`, `.hero-inner`, `.eyebrow` |
| Card hover | CLAUDE.md §27.4 — `translateY(-5px) scale(1.012)` + teal glow ring, NO shimmer |
| Dark card hover | CLAUDE.md §27.4 dark — `rgba(88,193,199,.18)` gradient glow |
| Buttons | CLAUDE.md §9 — `.btn-primary`, `.btn-ghost`, `.btn-gold`, `.btn-white-ghost` |
| CTA section | CLAUDE.md §11 — dark teal gradient, `.cta-section`, last section before footer |
| Footer | CLAUDE.md §7 — `.ft-top`, `.ft-brand`, `.ft-link`, `.ft-bot` |
| Reveal animation | CLAUDE.md §12 — `.reveal` + IntersectionObserver, `.rd1/rd2/rd3` stagger |
| Colors | CLAUDE.md §1 — all `--teal-*` and `--gold-*` tokens, no raw hex inline |
| Typography | Cormorant Garamond (display/serif) · Inter (body) · Amiri (Arabic) |

---

## 19. Gaps in Current Mockup (Build Priority Order)

### 🔴 High Priority — Functional Core
| # | Feature | Gap |
|---|---|---|
| 1 | **Real progress persistence** | Progress is static in mockup (3/12 hardcoded). Wire to localStorage. |
| 2 | **Quiz system** | Quiz button shows toast only. Build 5-question MC quiz flow per lesson. |
| 3 | **Lesson unlock logic** | Locked lessons don't enforce prerequisites in code. Add gate logic. |
| 4 | **Pathway unlock gating** | Intermediate/Advanced pathway buttons need real lock check vs. localStorage. |
| 5 | **Track selector — all 10 tracks** | Only 4 tracks (Foundations/Seerah/Prayer/History) are in JS. Add remaining 6. |
| 6 | **"Read →" link wiring** | Links go to `knowledge-hub.html` generically. Wire to specific article URLs. |

### 🟠 Medium Priority — Enhanced Experience
| # | Feature | Gap |
|---|---|---|
| 7 | **Certificate generation** | No certificate UI exists yet. Build PDF + share image flow. |
| 8 | **Daily reflection rotation** | Reflection is static. Wire to a schedule or API. |
| 9 | **Study streak tracker** | Streak shown as "14d" static. Wire to actual date-based logic. |
| 10 | **Multilingual UI** | All text is English only. Wire to global language preference. |
| 11 | **Account sync** | Progress is localStorage only. Add sync hook for premium accounts. |
| 12 | **KH article deep links** | Cluster pill hrefs are anchors only. Wire to actual KH category pages. |

### 🟢 Lower Priority — Polish
| # | Feature | Gap |
|---|---|---|
| 13 | **Quiz average calculation** | Quiz avg shown as "87%" static. Calculate from stored scores. |
| 14 | **Animated stats count-up** | Stats strip numbers are static. Add IntersectionObserver count-up. |
| 15 | **Prerequisite chain — interactive** | Pills are display-only. Make them tappable (scrolls to that track card). |
| 16 | **Scholar cards — expandable** | Scholar cards are display-only. Add click-to-expand with biography panel. |

---

## 20. Functional Rules Summary

1. **Islamic Studies = School. Knowledge Hub = Library.** Never blur this line.
2. **Sequential learning is enforced.** Locked lessons and pathways cannot be skipped.
3. **Every lesson links to KH.** No article content is hosted on the IS page itself.
4. **Every quiz citation is sourced.** No anonymous questions. Every correct answer cites a scholar or primary source.
5. **Certificates are honest.** A certificate is only issued when all lessons are read AND all quizzes passed at ≥70%.
6. **No shimmer effects.** Cards use CLAUDE.md §27.4 glow hover system only.
7. **Progress is private by default.** localStorage only. No upload without explicit user opt-in.
8. **Scholar authority is required.** Every lesson must cite from the approved scholar list (§11.1) or equivalent classical authorities.
9. **No fatwa.** Lessons explain, contextualize, and narrate. They do not issue legal rulings.
10. **Arabic is always in Amiri font, RTL.** No exceptions.

---

*End of Islamic Studies Functional Document v1.0*
