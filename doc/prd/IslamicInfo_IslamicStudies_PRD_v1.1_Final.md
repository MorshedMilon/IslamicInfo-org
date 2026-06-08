# IslamicInfo.org — Product Requirements Document
## Islamic Studies — Complete Specification
### Version 1.1 · May 2026 · Refined Issue

---

> **Header:** IslamicInfo.org — Islamic Studies PRD · v1.1 Final — CONFIDENTIAL — FOR INTERNAL USE
> **Footer:** © 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources.

---

## Document Information

| Field | Value |
|---|---|
| **Version** | v1.1 — Refined (5 issues resolved from v1.0 review) |
| **Date** | May 2026 |
| **Status** | Ready for Engineering Review |
| **Blueprint** | `islamic_studies_optionB.html` (canonical visual source of truth) |
| **Design System** | `CLAUDE_v3.md` (Design System v3.0) |
| **Functional Spec** | `Islamic_Studies_Functional_Document_v1.md` |
| **Author** | IslamicInfo Product Team |
| **Reviewer** | Claude (Anthropic) — PRD Review & Refinement |
| **Route** | `/islamic-studies` (`islamic-studies.html`) |
| **Sister Pages** | Knowledge Hub (`knowledge-hub.html`) · Qur'an Explorer · Hadith Library |
| **Companion PRDs** | Home Page PRD v1.1 · Qur'an Explorer PRD v1.1 · Hadith Library PRD v1.1 |

## v1.1 Changes Summary

- **FIX-1** — Pathway lesson counts clarified: "12 lessons" refers to the Aqeedah *track*, not the full Beginner *pathway*. Track-level vs. pathway-level counts distinguished everywhere.
- **FIX-2** — Return-detection mechanism specified: `visibilitychange` + localStorage timestamp approach chosen. "Two options" ambiguity removed.
- **FIX-3** — Advanced pathway lesson count corrected: 18 lessons (1 track, MVP) with note that 36-lesson total is a post-v1 goal requiring 4 more tracks.
- **FIX-4** — Quiz modal UX fully specified: inline expansion below quiz band, focus-trap, close mechanism, mobile layout, wireframe added as §4.9.
- **FIX-5** — "More tracks ▾" dropdown fully specified with wireframe, mobile behaviour, and empty state.

## Build Stage Overview

| Stage | Theme | Key Outcome |
|---|---|---|
| Stage 1 — Foundation | Blueprint parity + page shell | All 11 sections rendered, pathways grid, static lesson list, quiz band, KH handoff, daily reflection, scholar grid, footer |
| Stage 2 — Live Progress | localStorage wiring + gating logic | Real progress persistence, lesson unlock logic, pathway gating, 10-track selector, "Read →" URL wiring, streak tracker |
| Stage 3 — Quiz & Certificates | Knowledge check system | 5-question MC quiz per lesson, score ≥70% unlock gate, certificate PDF + share image generation |
| Stage 4 — Polish & Sync | Enhancement + premium hooks | Animated stats count-up, interactive prereq pills, scholar expand panels, multilingual UI, account sync hook |

---

## 1. Executive Summary

This PRD defines complete functional, visual, and technical requirements for the Islamic Studies page of IslamicInfo.org (route `/islamic-studies`, file `islamic-studies.html`). Islamic Studies is the platform's structured curriculum — a sequential, level-gated **school** for learning Islam from foundations to classical scholarship.

It is architecturally distinct from the Knowledge Hub and this distinction must never be blurred. Islamic Studies is a school; the Knowledge Hub is a library. Every lesson links **OUT** to the Knowledge Hub for reading material, but no article grids or free-browse content live on this page.

### Critical IS vs. Knowledge Hub Distinction (Absolute Rule)

| Dimension | Islamic Studies (this page) | Knowledge Hub (sister page) |
|---|---|---|
| Mental model | School · Madrasa — "Teach me step by step" | Library · Encyclopedia — "I want to read about X" |
| Content type | Lesson sequences, prerequisites, quizzes, certificates | 2,000+ standalone articles, free browsing |
| Order enforced? | ✅ Yes — sequential, prerequisite-gated | ❌ No — any order, free-form |
| Article grids | ❌ **NEVER** — absolute rule | ✅ Yes — core feature |
| Progress tracking | ✅ Yes — per lesson, per track, per pathway | ❌ No |
| Quizzes | ✅ Yes — per lesson, unlock-gated | ❌ No |
| Certificates | ✅ Yes — on track completion | ❌ No |
| Cross-links | Lessons link **OUT** to KH for reading material | KH links **BACK** to IS for structured learning |

### Key Success Metrics

| Metric | Target | Measurement Method | Owner |
|---|---|---|---|
| Curriculum entry rate | > 40% of page sessions start a lesson | Custom event: `lesson_read_started` per session | Product |
| Track completion rate | > 15% of started tracks completed | Custom event: `track_completed` per user | Product |
| Quiz attempt rate | > 50% of lesson completions trigger quiz | Custom event: `quiz_started` per `lesson_completed` | Product / Learning |
| Quiz pass rate (≥70%) | > 70% of attempts pass first try | Custom event: `quiz_passed` vs `quiz_failed` | Product / Learning |
| 7-day study streak | > 30% of returning users maintain | localStorage streak data via optional anonymous event | Product |
| Pathway progression | > 20% of Beginner completers start Intermediate | GA4 pathway progression events | Product |
| KH handoff click rate | > 15% of sessions click KH cluster pills | Custom event: `kh_pill_clicked` per session | Product |
| Certificate generation | > 5% of track completions generate cert | Custom event: `certificate_generated` per `track_completed` | Product |
| Continue Lesson CTA rate | > 45% of returning sessions use Continue | Custom event: `continue_lesson_clicked` per returning session | Product |
| Lighthouse Performance | ≥ 90 on page load | Automated Lighthouse CI on every deploy | Engineering |

---

## 2. Page Overview & Visual Flow

### 2.1 Page Anatomy (as defined in `islamic_studies_optionB.html`)

The page is a single-scroll experience. All sections stack vertically. There is no sidebar — the full width is content.

| # | Section | HTML marker | Description |
|---|---|---|---|
| 1 | Global Navbar | `id="siteHeader"` | Sticky; "Islamic Studies" carries `class="nav-link active"` |
| 2 | Hero | `<!-- ══ HERO ══ -->` | Bismillah + eyebrow "Structured Curriculum" + H1 + Arabic hadith + subtitle + SEO Architecture Bar + stats strip |
| 3 | Learning Pathways | `<!-- ══ LEARNING PATHWAYS ══ -->` | 3-card horizontal grid: Beginner / Intermediate / Advanced — each with 3D tilt hover, track list, animated progress bar, CTA |
| 4 | Lesson Sequence | `<!-- ══ LESSON SEQUENCE ══ -->` | Track selector tabs (`.lts-btn`) + dynamic lesson list (`setTrack()`) + Continue button |
| 5 | Quiz / Progress Band | `<!-- ══ QUIZ / PROGRESS BAND ══ -->` | Two-column `.quiz-band`: prereq flow visualization + quiz CTA (left) · 3 stats items (right) |
| 6 | KH Handoff | `<!-- ══ HANDOFF TO KNOWLEDGE HUB ══ -->` | Two-column: IS–KH explanation + 8 cluster pills linking to KH categories |
| 7 | Daily Reflection | `<!-- ══ DAILY REFLECTION ══ -->` | Centred Arabic text + gold ornamental divider + English translation + "Read Tafsir in KH →" |
| 8 | Scholars Referenced | `<!-- ══ SCHOLARS REFERENCED ══ -->` | 6-card grid: avatar initials + name + era (AH) + fields |
| 9 | CTA Section | `<!-- ══ CTA ══ -->` | "Begin Your Journey Today" — `btn-gold` (Start Curriculum) + `btn-white-ghost` (Browse KH) |
| 10 | Footer | `id="ii-footer"` | Global 5-column footer per `CLAUDE_v3.md §7` |
| — | Toast | `id="toast"` | Slide-up toast notification for locked pathway, Continue Lesson, quiz initiation |

### 2.2 Route Map

| URL | Purpose |
|---|---|
| `/islamic-studies.html` | Main curriculum page (single-scroll) |
| `/islamic-studies.html#pathways` | Jumps to Learning Pathways section |
| `/islamic-studies.html#track-aqeedah` | Scrolls to and opens the Aqeedah track in the lesson sequence |
| `/knowledge-hub.html` | Knowledge Hub — reading material (separate page) |
| `/knowledge-hub.html?lesson=taharah-intro` | KH page with query param to highlight and scroll to specific lesson article |
| `/knowledge-hub.html#pillars` | KH filtered to Five Pillars cluster (from KH handoff pills) |

### 2.3 Hero Content (Frozen — Do Not Change Without Instruction)

Per Functional Document §4.1, the following content is frozen:

- **Bismillah:** بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — first child of `.hero-inner`, Amiri font, teal-gradient in light / gold-gradient + glow in dark (per `CLAUDE_v3.md §5`)
- **Eyebrow:** "Structured Curriculum" — `.eyebrow` with gold pulsing dot
- **H1:** "Islamic Studies / *Curriculum*" — `.hero-title` with `<span class="grad-it">` on "Curriculum"
- **Arabic hadith:** طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
- **Hadith English:** "Seeking knowledge is an obligation upon every Muslim."
- **Hadith source:** "Sunan Ibn Majah · 224 · Graded Ḥasan by al-Albānī"
- **Subtitle:** "A structured school — not a library. Sequential lessons with prerequisites, progress tracking, and knowledge checks. Study Islam the way it was meant to be learned: step by step, from foundations upward."
- **SEO Architecture Bar:** 2-panel bar — 🎓 Islamic Studies (active) | 📚 Knowledge Hub (link)
- **Stats strip:** 10 Tracks · 152 Lessons · 3 Levels · 48h+ Curriculum

### 2.4 SEO Architecture Bar (Mandatory Component)

The `.seo-arch-bar` is a two-panel bar in the hero. It **must appear on every page load**. Dual purpose: user orientation + Google signals.

- **LEFT PANEL** (active state): 🎓 Islamic Studies — bold label + "Curriculum · Lessons · Quizzes" subtitle. Active = teal border, teal-50 bg, teal text. Not a link.
- **RIGHT PANEL** (link): 📚 Knowledge Hub — label + "2,000+ Articles · Browse freely" subtitle. Links to `knowledge-hub.html`. Hover: teal glow.
- This bar must **NEVER be removed**. It is the primary signal of IS vs. KH distinction per Functional Doc §17 rule 2.

---

## 3. User Stories & Acceptance Criteria

### 3.1 Stage 1 — Foundation (Blueprint Parity)

---

#### US-IS01 — Learning Pathways Grid
**As a new user, I want to see the three learning levels so I can understand the curriculum structure and choose where to start.**

**Acceptance Criteria:**

> **FIX-1 note:** "12 lessons" in the Beginner pathway card refers specifically to the **Aqeedah track** (the first and default track shown). The full Beginner *pathway* spans 6 tracks and ~50 lessons total. The pathway card shows the stats for the *first active track* in that pathway, not the total across all tracks. This distinction is enforced in US-IS08 (progress persistence) and §5. [FIX-1]

- Three `.pathway-card` elements render in `.pathways-grid`: Beginner (Foundations of Faith) · Intermediate (Deepening Practice) · Advanced (Classical Scholarship)
- Each card contains: level badge (top-left: 🌱/🏛️/📜) · level emoji icon (large, centred: 🌿/🏛️/📜) · level title (Cormorant Garamond, 26px) · description (2–3 sentences) · track list with coloured dots · metadata (lesson count + reading time for the first active track) · progress section + animated bar · CTA button
- Progress bars animate in when the card enters the viewport (IntersectionObserver, threshold 0.25). Fill driven by `data-w` attribute. Locked bars show 0% greyed.
- 3D mouse-tracking tilt on hover: `rotateX` + `rotateY` update on mousemove (±4–6deg), reset on mouseleave with ease transition (`transition: transform .38s var(--ease-reverent)`)
- **Beginner card:** `pw-fill-b` class, 25% fill (`data-w="25"`), "Continue Path" CTA (active teal). Metadata: **"12 lessons · ~8h reading"** — this refers to the Aqeedah track specifically.
- **Intermediate card:** `pw-fill-i` class, 0% fill (`data-w="0"`), "Begin Path" CTA → locked toast: "🔒 Complete Beginner Path first to unlock this level."
- **Advanced card:** `pw-fill-a` class, 0% fill (`data-w="0"`), "Begin Path" CTA → locked toast
- Track dot colours: green = done · teal = in progress · gold = locked. Classes: `.pw-track-dot.green` / `.teal` / `.gold`

---

#### US-IS02 — Lesson Sequence & Track Selector
**As a student, I want to see the ordered lesson list for my current track so I know exactly what to study next.**

**Acceptance Criteria:**

- Track selector (`.lesson-track-select`): 4 `.lts-btn` tabs — Foundations · Seerah · Prayer · History. Active tab: teal-700 bg, white text, box-shadow. Click calls `setTrack(btn, track)`.
- Lesson list (`#lessonList`) renders dynamically from `TRACKS` JS object. Default: Foundations track (12 lessons).
- Each `.lesson-item` shows: state badge (left) · lesson title · meta row (reading time + topic tag + "📚 Read in Knowledge Hub" badge for unlocked lessons) · "Read →" CTA link (right, links to `knowledge-hub.html` in mockup — specific URLs wired in Stage 2)
- Lesson state classes and badges: `.ln-done "✓"` (green) · `.ln-current "▶"` (teal) + highlighted bg `rgba(0,105,110,.04)` · `.ln-next "{N}"` (number) · `.ln-locked "🔒"` (greyed, no Read button, no KH badge)
- Below list: "3 of 12 lessons complete · 25% through Foundations" progress text + "Continue Lesson 4" `btn-primary` button (with play icon, triggers toast in mockup — wired to KH URL in Stage 2)
- All 10 tracks wired in `TRACKS` object in Stage 2 (only 4 in Stage 1 mockup)

---

#### US-IS03 — Quiz / Progress Band
**As a student, I want to take a knowledge check after each lesson so I can confirm my understanding before advancing.**

**Acceptance Criteria:**

- Quiz band (`.quiz-band`) is a two-column container: left (`.quiz-left`) + right (`.quiz-stats`)
- **LEFT:** `.quiz-ey` eyebrow "Knowledge Check" + `.quiz-title` "Test What You've Learned" + `.quiz-desc` + prerequisite flow visualization (`.prereq-flow`) + `.quiz-btn` "Take Quiz · Lesson N"
- **Prerequisite flow** (`.prereq-flow`): horizontal pill chain — `.pf-done` (green bg "✓ Tawhid") · `.pf-current` (teal border "▶ Wudu") · `.pf-next` (grey "🔒 Salah") · `.pf-arrow` "→" separators
- **RIGHT** (`.quiz-stats`): 3 stat items — `.qs-num` "3/12" Lessons done · "87%" Quiz avg · "14d" Study streak. Static in Stage 1; wired to localStorage in Stage 2.
- Quiz CTA in Stage 1: shows toast "📝 Quiz: Lesson 3 · Purification — 5 questions". Full quiz flow in Stage 3.

---

#### US-IS04 — Knowledge Hub Handoff Section
**As a user who wants to read freely, I want a clear path to the Knowledge Hub so I can browse without the structured curriculum.**

**Acceptance Criteria:**

- Handoff section (`.handoff-section`) is a two-column layout: `.handoff-text` (left) + `.handoff-clusters` (right)
- **LEFT:** `.handoff-ey` "📚 Reading Material Lives in the Knowledge Hub" + `.handoff-title` with gradient italic + `.handoff-desc` explaining IS–KH distinction + `.handoff-cta-row`: `btn-primary` "Open Knowledge Hub" (→ `knowledge-hub.html`) + `btn-ghost` "Browse 2,000+ Articles →"
- **RIGHT:** 8 `.hc-pill` elements, each: icon + name + article count. Exact links and counts verbatim:

| Pill | Icon | Articles | href anchor |
|---|---|---|---|
| The Five Pillars | 🕋 | 342 articles | `#pillars` |
| Faith & Theology | ✦ | 265 articles | `#aqidah` |
| Islamic History | 🏛️ | 311 articles | `#history` |
| Prophets & Companions | 🌟 | 214 articles | `#prophets` |
| Islamic Law · Fiqh | ⚖️ | 398 articles | `#fiqh` |
| Spirituality & Adab | 📿 | 189 articles | `#spirituality` |
| Qur'an & Revelation | 📖 | 287 articles | `#quran` |
| Islam in Modern Life | 🌍 | 224 articles | `#modern` |

- This section must **NEVER be removed** per Functional Document §9.3.

---

#### US-IS05 — Daily Reflection
**As a daily visitor, I want a rotating verse or hadith so the page delivers spiritual value beyond the curriculum.**

**Acceptance Criteria:**

- Reflection section (`.reflection-section`): centred layout with border. Eyebrow "Today's Reflection" (caps-xs, teal-700)
- `.reflection-arabic`: Arabic verse text (Amiri, large, centred, RTL, teal-700 light / gold gradient dark)
- Gold ornamental divider: two 64px gradient lines flanking "✺" (gold-500, 11px)
- `.reflection-quote`: English translation (Cormorant Garamond italic, blockquote)
- `.reflection-ref`: source reference (Surah name · verse · translation edition), ink-muted
- "Read Tafsir in Knowledge Hub →" `.ref-btn` pill (teal outlined) → links to relevant KH article
- Static content in Stage 1; wired to daily rotation in Stage 4

---

#### US-IS06 — Scholars Referenced Grid
**As a student, I want to see which classical scholars are cited so I know the curriculum rests on authoritative sources.**

**Acceptance Criteria:**

- Scholars grid (`.scholars-grid`): 6 `.scholar-card` elements with staggered reveal (`.reveal` / `.rd1` / `.rd2` / `.rd3`)
- Each card: `.scholar-avatar` (56×56px circle, alternating `.av-teal` and `.av-gold` bg with Arabic initials) + `.scholar-name` + `.scholar-era` (AH dates) + `.scholar-topic`
- 6 scholars verbatim from blueprint (in order):

| Scholar | Avatar | Era AH | Fields |
|---|---|---|---|
| Ibn Kathir | إك | 700–774 AH | Tafsir, History |
| Imam an-Nawawi | نو | 631–676 AH | Fiqh, Hadith |
| al-Qurtubi | قر | 600–671 AH | Tafsir, Fiqh |
| Ibn al-Qayyim | عق | 691–751 AH | Theology, Spirituality |
| Imam at-Tabari | طب | 224–310 AH | Tafsir, History |
| Ibn Hajar al-'Asqalani | حج | 773–852 AH | Hadith Sciences |

- Section header: `.section-eyebrow` "Classical Authorities" + `.section-title` "Scholars Referenced" + `.section-sub` "Every lesson cites recognized classical and contemporary scholarship. No anonymous opinions."
- In Stage 4: clicking a scholar card opens an expandable biography panel (see US-IS18)

---

#### US-IS07 — Hero SEO Architecture Bar
**As a user landing on Islamic Studies, I want the SEO architecture bar to immediately show me the IS vs. KH distinction so I understand what this page is for.**

**Acceptance Criteria:**

- The `.seo-arch-bar` renders in the hero section, below the subtitle and above the stats strip
- Two panels side by side: Islamic Studies (active, non-link) | Knowledge Hub (link to `knowledge-hub.html`)
- Active panel: teal-700 border, `rgba(0,105,110,.06)` bg, teal-700 label text, "Curriculum · Lessons · Quizzes" muted subtitle
- KH panel: subdued border, grey label, "2,000+ Articles · Browse freely" subtitle. Hover: teal glow border transition
- The bar renders on every page load. It cannot be toggled off or hidden.

---

### 3.2 Stage 2 — Live Progress (localStorage + Gating)

---

#### US-IS08 — Progress Persistence
**As a returning student, I want my lesson progress saved so I never have to remember where I left off.**

> **FIX-1 applied:** Progress tracking distinguishes between *track-level* progress (lessons within one track) and *pathway-level* progress (total across all tracks in a pathway). The pathway card progress bar reflects the *current active track's* completion, not the full pathway total. [FIX-1]

**Acceptance Criteria:**

- All progress stored in localStorage `"islamicinfo-is-progress"` with this exact shape:
  ```json
  {
    "tracks": {
      "[trackSlug]": { "done": [lessonIndexes], "quizScores": [percentages] }
    },
    "streak": { "count": N, "lastDate": "YYYY-MM-DD", "longestStreak": N },
    "certificates": ["trackSlug"]
  }
  ```
- **Track-level:** `tracks.[slug].done.length / total` drives the lesson list states and the progress text ("3 of 12 lessons complete")
- **Pathway-level:** The pathway card progress bar fills to `(doneLessons / activeTrackTotal) × 100` for the currently-active track in that pathway. A pathway is "complete" when all its constituent tracks are complete (all lessons done + all quizzes passed ≥70%).
- On page load, progress data is read and applied: pathway bars update, lesson states reflect real done[] data, stats band numbers update
- "Continue Lesson N" button text and destination update dynamically from stored current lesson index
- Progress is private by default — never uploaded without explicit user opt-in (account sync deferred to Stage 4)

---

#### US-IS09 — Lesson Unlock Gating
**As a student, I want lesson unlocking to be enforced so the sequential curriculum stays intact.**

**Acceptance Criteria:**

- A lesson is unlocked only when the lesson immediately before it is in `done[]` for that track
- Locked lessons (`.lesson-item.locked`): `ln-locked "🔒"` badge, greyed text, no "Read →" link, no KH badge
- Clicking a locked lesson shows toast: "🔒 Complete Lesson [N-1] first to continue." No navigation occurs.
- The current lesson (`.lesson-item.current`) is always the first unlocked-but-not-done lesson
- Lessons more than one step ahead remain locked (only the immediate next lesson is available-next)

---

#### US-IS10 — Pathway Unlock Gating
**As a student, I want the Intermediate and Advanced pathways locked until I complete the prerequisites.**

**Acceptance Criteria:**

- **Intermediate** unlocks when all Beginner tracks are complete (all lessons in done[] + all quizScores ≥70%). Until then: "Begin Path" CTA fires locked toast.
- **Advanced** unlocks when all Intermediate tracks are complete. Until then: locked toast.
- On unlock: progress bar animates from 0% to actual progress. CTA label changes from "Begin Path" to "Continue Path" if progress > 0%.
- Locked pathway cards show reduced opacity (not hidden) — users can read ahead to understand what's coming

---

#### US-IS11 — Full 10-Track Selector with "More Tracks" Dropdown
**As a student, I want to switch between all 10 curriculum tracks so I can review any track I'm enrolled in.**

> **FIX-5 applied:** The "More tracks ▾" dropdown is a new component not present in the mockup. Full spec below. [FIX-5]

**Acceptance Criteria:**

- Track selector shows 4 primary `.lts-btn` tabs: Foundations · Seerah · Prayer · History (matching mockup exactly)
- A **"More ▾" `.lts-btn` button** appears as the 5th tab. Clicking it opens an inline dropdown panel (`.lts-more-panel`) directly below the tab row
- `.lts-more-panel` contains the remaining 6 tracks as `.lts-more-item` rows: Purification (Taharah) · Fasting (Sawm) · Zakat & Hajj · Scholars & Companions · Fiqh Principles · Classical Scholarship
- Each `.lts-more-item` row: track name (Inter 600, 13px) + lesson count badge (caps-xs, teal-50 bg) + lock icon (grey, if prerequisites not met)
- Clicking a `.lts-more-item`: closes the panel, sets that track as active (same as clicking a primary tab), calls `setTrack()`
- The "More ▾" button label changes to the selected track name if a non-primary track is active: e.g. "Fasting ▾"
- **Panel close:** clicking outside the panel, pressing Escape, or clicking the active "More ▾" button again closes the panel
- **Mobile (≤640px):** `.lts-more-panel` is full-width, bottom-anchored (translates up from below the tab row). Background: `var(--surface-base)`, `border-radius var(--r-lg) var(--r-lg) 0 0`, `box-shadow var(--elev-3)`. Closes on outside tap.
- **Empty state:** if a track has 0 lessons (future tracks not yet authored): show "Coming soon" in muted text; clicking shows toast "This track is coming soon."
- **Accessibility:** `.lts-more-panel` has `role="listbox"`, each item has `role="option"`. Focus moves to first item on panel open. Escape key closes and returns focus to "More ▾" button.

**All 10 tracks in TRACKS object:**

| Track slug | Track name | Lessons |
|---|---|---|
| `foundations` | Beliefs & Iman (Aqeedah) | 12 |
| `seerah` | Introduction to Seerah | 8 |
| `prayer` | Prayer (Salah) | 8 |
| `history` | Islamic History (Caliphates) | 8 |
| `taharah` | Purification (Taharah) | 8 |
| `fasting` | Fasting (Sawm) | 6 |
| `zakat` | Zakat & Hajj | 6 |
| `scholars` | Scholars & Companions | 8 |
| `fiqh` | Fiqh Principles (Usul) | 10 |
| `classical` | Classical Scholarship | 18 |

---

#### US-IS12 — "Read →" Deep Link Wiring with Return Detection
**As a student clicking Read, I want to be taken to the exact Knowledge Hub article for that lesson, and have my return automatically noted.**

> **FIX-2 applied:** v1.0 listed two return-detection options ("localStorage timestamp or URL back-navigation"). A single approach is specified here. The chosen mechanism is `visibilitychange` + localStorage timestamp, as it is more reliable than `popstate` across browsers and works correctly when users navigate via browser back, mobile swipe back, or tab switching. [FIX-2]

**Acceptance Criteria:**

- Each `.lesson-kh-cta` "Read →" link resolves to: `knowledge-hub.html?lesson={track-slug}-{lesson-index}`
- The KH page uses the query param to highlight and scroll to the relevant article (see KH PRD)
- **Return-detection mechanism:** On "Read →" click, store to localStorage: `islamicinfo-is-visit: { trackSlug, lessonIndex, departedAt: Date.now() }`. On the IS page, listen for `document.addEventListener('visibilitychange', ...)` — when the page becomes visible again and `islamicinfo-is-visit` exists with a `departedAt` less than 30 minutes ago: mark that lesson as `ln-read` (intermediate state) and clear the visit record.
- `ln-read` state visual: same as `ln-next` number badge but with a subtle teal-50 background tint and "Take Quiz →" CTA replacing "Read →". State is between `ln-current` and `ln-done`.
- Full `ln-done` state requires quiz pass ≥70% (Stage 3 wiring)
- If the user spends less than 60 seconds on the KH article before returning (detected via `departedAt` delta), the lesson is not marked as read — a minimum engagement threshold

---

#### US-IS13 — Study Streak Tracker
**As a daily student, I want my study streak tracked so I stay motivated.**

**Acceptance Criteria:**

- Streak data in `localStorage "islamicinfo-is-progress".streak`: `{ count: N, lastDate: "YYYY-MM-DD", longestStreak: N }`
- Streak increments when user completes at least one lesson in a calendar day (reads-only in Stage 2; reads + passes quiz in Stage 3)
- Streak resets to 0 if a full calendar day is skipped. `lastDate` updated on every lesson completion.
- Displayed in 3 places: quiz band stats, pathway card (below progress bar), and user profile (future)
- `longestStreak` tracked separately and never reset on break

---

### 3.3 Stage 3 — Quiz & Certificates

---

#### US-IS14 — Knowledge Check Quiz System
**As a student, I want to take a 5-question multiple-choice quiz after each lesson so I earn the lesson completion.**

**Acceptance Criteria:**

- Clicking "Take Quiz · Lesson N" expands the **inline quiz panel** (see §4.9 for full wireframe)
- Quiz format: 5 multiple-choice questions per lesson, loaded lazily from `/data/quizzes/{track-slug}.json`
- Each question: question text + 4 answer options (radio buttons). One correct answer. No partial credit.
- Score = (correct / 5) × 100. Displayed after final question submit.
- **Pass (≥70%, 4–5 correct):** lesson added to `done[]`, `ln-done` state applied, next lesson unlocked. Toast: "🎉 Lesson complete! Next lesson unlocked."
- **Fail (<70%, 0–3 correct):** "Good effort — re-read the lesson and try again." message. Lesson remains `ln-current`. Immediate retry allowed.
- Quiz results stored in `progress.tracks[trackSlug].quizScores[lessonIndex]`. Only the highest score is stored.
- Quiz average (quiz band right stat) calculated dynamically from all stored quiz scores.
- Hard rule: every quiz question must include a `citation` field in the JSON (scholar name or primary source). No anonymous questions.

---

#### US-IS15 — Digital Certificate Generation
**As a student who completed a track, I want to generate a certificate as a record of my achievement.**

**Acceptance Criteria:**

- Certificate generated **only** when ALL lessons in a track are in `done[]` AND all `quizScores` for that track are ≥70%. No partial certificates.
- Canvas composition: IslamicInfo branding (top) · Track name English + Arabic (Amiri, large) · Scholar hadith about knowledge · User name (if signed in, else "Learner") · Completion date · IslamicInfo seal (SVG) · Gold ornamental border
- "Download as PDF": `canvas.toDataURL → jsPDF`. Filename: `IslamicInfo_{TrackName}_Certificate.pdf`
- "Share as image": `navigator.share({files: [blob]})` on mobile, clipboard on desktop — same system as Qur'an and Hadith pages
- Track slug added to `localStorage progress.certificates[]` on generation
- Completed track cards show "🏆 Certificate earned" badge

---

### 3.4 Stage 4 — Polish & Sync

---

#### US-IS16 — Animated Stats Count-Up
**As a user scrolling into the hero stats strip, I want numbers to count up so the page feels dynamic.**

**Acceptance Criteria:**

- Stats strip numbers (10, 152, 3, 48) count up from 0 when the strip enters the viewport (IntersectionObserver)
- Linear count-up over 1.2s. "48h+" counts 0→48 then appends "h+"
- `@media (prefers-reduced-motion: reduce)`: values set immediately, no animation

---

#### US-IS17 — Interactive Prerequisite Pills
**As a student seeing a locked track, I want to click the prerequisite pill to jump directly to it.**

**Acceptance Criteria:**

- Prerequisite pills in track cards are clickable in Stage 4 (display-only in Stages 1–3)
- Clicking a prereq pill: smooth-scrolls to the relevant track card + opens that track in the lesson sequence selector via `setTrack()`
- Done pills (green): tooltip "[Track name] — Completed ✓"
- Pending pills (grey): tooltip "[Track name] — Required for this track"

---

#### US-IS18 — Scholar Biography Expand
**As a curious student, I want to click a scholar card and read a brief biography.**

**Acceptance Criteria:**

- Clicking a `.scholar-card` toggles an expansion panel below the card (`max-height` transition, `ease-reverent`)
- Panel contains: full Arabic name · birth/death (CE + AH) · origin city · key works (2–3 titles) · 2-sentence scholarly significance note
- Only one card expanded at a time (opening new card collapses previous)
- Expansion panel is a nested `.card` with `inner-light` shadow, same hover system as parent

---

#### US-IS19 — Multilingual UI
**As a non-English-speaking Muslim, I want the curriculum UI in my language.**

**Acceptance Criteria:**

- All UI text changes with global site language selector (`localStorage "islamicinfo-lang"`)
- Arabic matn (verses, scholar initials in Arabic) always in Amiri RTL — never through i18n layer
- Supported UI languages: English · Bangla · Urdu · Hindi · Turkish · French · Indonesian · Malay
- Lesson titles use translated versions where available; English fallback otherwise

---

## 4. Wireframe & Visual Flow Descriptions

All descriptions reference `islamic_studies_optionB.html` as the canonical blueprint. Token values from `CLAUDE_v3.md` v3.0.

### 4.1 Hero Section

Section `.hero` — same shell as all IslamicInfo pages. Layers back to front:

- **LAYER 0** — `.hero-bg`: animated radial gradient background (`bgD` keyframe, 18s infinite)
- **LAYER 1** — 3 floating `.geo` SVG decorators: `geo-1` (10-point star + circle, teal, top-left, 180×180px, `geoRot` 28s) · `geo-2` (10-point star, gold, top-right, 120×120px, `geoRot` 32s) · `geo-3` (circle, teal, bottom-right, 90×90px, `geoRot` 20s). Dark mode: higher opacity.
- **LAYER 2** — `.hero-inner` (max-width 680px, centred): Bismillah → eyebrow badge → H1 → Arabic hadith block (`.hero-arabic`) → subtitle (`.hero-sub`) → SEO architecture bar (`.seo-arch-bar`) → stats strip (`.stats-strip`)

**H1:** "Islamic Studies / *Curriculum*" — `<span class="grad-it">` on "Curriculum" (teal-to-gold gradient clip-text, italic). Font: Cormorant Garamond, display size.

**Stats strip:** 4 items with dividers — 10 Tracks · 152 Lessons · 3 Levels · 48h+ Curriculum. Numbers in Cormorant Garamond, labels in Inter 700 caps-xs.

### 4.2 Learning Pathways Grid

`.pathways-grid`: 3-column flex row on ≥900px, single column below 640px. Each `.card.pathway-card`:

- **TOP:** `.pw-badge` (level badge, top-left, teal/gold bg) + `.pw-icon` (large emoji, centred, 44px)
- **MIDDLE:** `.pw-title` (CG, 26px) + `.pw-desc` (Inter 14px, ink-muted) + `.pw-tracks-list` (5 items with `.pw-track-dot` colour indicators)
- **META:** `.pw-meta` (lesson count + reading time for active track, 12px, ink-muted)
- **PROGRESS:** `.pw-prog-wrap` (label row + `.pw-bar` with animated `.pw-fill`)
- **CTA:** `.pw-cta` button (full width, teal for active, muted+lock for locked)

**3D tilt:** `mousemove` → `rotateX/rotateY` (±4–6deg), `transition: .08s` on move, `.38s ease-reverent` on leave.

### 4.3 Lesson Sequence Section

`.lesson-section-wrap`. Header: `.section-eyebrow` "Current Track" + `.section-title` + `.lesson-track-select` tab row.

- **TRACK SELECTOR:** flex row of `.lts-btn` elements + "More ▾" button (see §4.10 [FIX-5]). Active: teal-700 bg, white text, box-shadow.
- **LESSON LIST** (`#lessonList`): vertical stack of `.lesson-item` rows:
  - **LEFT** — `.lesson-num` badge (32px circle): `.ln-done "✓"` · `.ln-current "▶"` · `.ln-read "{N}"` (teal-50 tint) · `.ln-next "{N}"` · `.ln-locked "🔒"`
  - **CENTRE** — `.lesson-body`: `.lesson-title` (14.5px, 500 weight) + `.lesson-meta-row` (`.lesson-time` + `.lesson-tag` chip + `.kh-link` "📚 Read in Knowledge Hub")
  - **RIGHT** — `.lesson-kh-cta` "Read →" link (ln-current gets `rgba(0,105,110,.12)` bg; ln-read gets "Take Quiz →"; locked: no link)
- **CURRENT item** extra styling: `background rgba(0,105,110,.04)`, `border-radius 10px`, `padding 14px 10px`, `margin 2px 0`
- **PROGRESS FOOTER:** progress text (13px, ink-muted) + "Continue Lesson N" `btn-primary` (play icon SVG)

### 4.4 Quiz / Progress Band

`.quiz-band`: teal-tinted card (`border-left 3px teal-700`, `border-radius var(--r-xl)`). Two-column `.quiz-inner`:

- **LEFT** (`.quiz-left`): `.quiz-ey` "Knowledge Check" + `.quiz-title` (Inter 600, 20px) + `.quiz-desc` + `.prereq-flow` pill chain + `.quiz-btn` (teal-to-gold gradient, play icon)
- **PREREQ FLOW:** flex-wrap pills: `.pf-done` (green bg) · `.pf-current` (teal border, teal-50 bg) · `.pf-next` (grey bg) · `.pf-arrow` "→"
- **RIGHT** (`.quiz-stats`): 3 `.qs-item` cards (CG 32px number + Inter 10px label)

### 4.5 Knowledge Hub Handoff Section

`.handoff-section`: two-column (`1fr 1fr`) on ≥900px, stacked below.

- **LEFT** (`.handoff-text`): eyebrow + `.handoff-title` (CG 28px, gradient italic span) + `.handoff-desc` (Inter 15px, line-height 1.72) + `.handoff-cta-row`
- **RIGHT** (`.handoff-clusters`): 8 `.hc-pill` elements in 2-column flex-wrap. Each: `.hc-pill-icon` (emoji 24px) + `.hc-pill-body`. Hover: `translateY(-3px)` + teal glow border.

### 4.6 Daily Reflection Section

`.reflection-section`: centred, `0.5px teal border`, `border-radius var(--r-xl)`. Max-width 640px.

- **EYEBROW:** caps-xs "Today's Reflection", teal-700, 18px margin-bottom
- `.reflection-arabic`: Amiri 24px+, centred, RTL, teal-700 (light) / gold gradient (dark)
- **ORNAMENTAL DIVIDER:** 64px gradient line + "✺" (gold-500, 11px) + 64px gradient line
- `.reflection-quote`: CG italic 18px, blockquote centred
- `.ref-btn`: teal outlined pill button

### 4.7 Scholars Grid

`.scholars-grid`: auto-fill grid (`minmax 140px, 1fr`), gap 14px. Background: `var(--surface-card)`.

- `.scholar-card`: `.card` hover system (translateY(-5px) scale(1.012) + teal glow — no shimmer)
- `.scholar-avatar`: 56×56px circle. `.av-teal`: teal-700 bg white text. `.av-gold`: gold-500 bg dark text. Arabic initials in Amiri 18px.
- `.scholar-name` Inter 600 14px · `.scholar-era` Inter 400 11px ink-muted · `.scholar-topic` Inter 400 11px teal-700 caps-xs
- Stagger: `.rd1`/`.rd2`/`.rd3` reveal delays

### 4.8 CTA Section & Footer

`.cta-section`: dark teal gradient (per `CLAUDE_v3.md §11`). Last section before footer.

"✦ Begin Your Journey Today" badge + H2 "Knowledge is an *act of worship*" (gold gradient `em italic`) + subtitle (Ibn Majah hadith) + `.cta-actions`: `btn-gold` "Start Curriculum" (scroll to pathways) + `btn-white-ghost` "Browse Knowledge Hub" (→ `knowledge-hub.html`).

**Footer** (`id="ii-footer"`): 5-column per `CLAUDE_v3.md §7`. IS page col 2 "Curriculum": Foundations of Faith · Deepening Practice · Classical Scholarship · → Knowledge Hub Articles.

### 4.9 Quiz Modal — Inline Expansion  *(FIX-4)*

> **FIX-4 applied:** The quiz modal was unspecified in v1.0. Full wireframe below. [FIX-4]

The quiz renders as an **inline expansion panel** (`.quiz-panel`) that appears directly below the `.quiz-band`, not as a floating modal overlay. This avoids focus-trap complexity, works natively on mobile, and keeps the user in context.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│  ✕ Close                                             │
│  Lesson 3 — Purification (Taharah)    Q 2 of 5      │
│  ──────────────────────────────────────────────      │
│  What is the minimum obligatory act of Wudu?         │
│                                                      │
│  ○  Washing the face once                            │
│  ○  Washing each limb three times                    │
│  ○  Washing the feet twice                           │
│  ○  Rinsing the mouth                                │
│                                                      │
│  ──────────────────────────────────────────────      │
│  [Previous]                          [Next →]        │
└──────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- `.quiz-panel` slides open below `.quiz-band` (`max-height: 0 → auto`, `opacity: 0→1`, `0.38s ease-reverent`). **Not a modal overlay.**
- Panel header: "✕ Close" button (right-aligned, focusable, Escape key also closes) + lesson title + "Q N of 5" counter
- Question area: question text (Inter 600, 15px) + 4 `<label>` + `<input type="radio">` answer options
- Selection state: selected option gets teal-50 bg + teal border + teal radio dot
- After selecting, "Next →" button activates (disabled until selection made)
- After 5th question: "Submit Answers" button appears. Shows score screen on submit.
- **Score screen:** "You scored N/5 · N%" + pass/fail message + "Continue" button (closes panel, applies state)
- **Closing:** ✕ button, Escape key, or clicking outside the panel on desktop. Focus returns to `.quiz-btn` on close.
- **Mobile:** panel is full-width, stacks below the quiz band, scrollable independently. No overlay. Bottom "Next →" button stays visible above the keyboard.
- **Accessibility:** `.quiz-panel` has `role="region"` and `aria-label="Knowledge Check Quiz"`. Answer options use native `<fieldset>` + `<legend>`. Focus moves to first question on open. `aria-live="polite"` region announces score on submit.
- **prefers-reduced-motion:** panel appears instantly (no slide animation), no transition.

### 4.10 "More Tracks ▾" Dropdown  *(FIX-5)*

> **FIX-5 applied:** The dropdown is a new component not present in the mockup. Full wireframe below. [FIX-5]

```
[Foundations] [Seerah] [Prayer] [History] [More ▾]
                                              │
                                    ┌─────────▼──────────┐
                                    │ Purification    8 →│
                                    │ Fasting         6 →│
                                    │ Zakat & Hajj    6 →│
                                    │ Scholars        8 →│
                                    │ Fiqh Principles 10→│
                                    │ 🔒 Classical    18 │
                                    └────────────────────┘
```

**Anatomy:**

- `.lts-more-panel`: `position: absolute`, anchored below the "More ▾" button. `background: var(--surface-base)`, `border: 0.5px solid rgba(0,105,110,.15)`, `border-radius: var(--r-lg)`, `box-shadow: var(--elev-3)`, `min-width: 200px`, `z-index: 50`
- Each `.lts-more-item`: flex row — track name (Inter 600, 13px, ink-primary) + lesson count badge (teal-50 bg, teal-700 text, 10px, right-aligned) + lock icon (grey SVG, shown if prerequisites not met)
- Locked items: muted text, lock icon right-aligned, click shows toast "🔒 Complete [prerequisite track] first"
- Active item (if a non-primary track is selected): teal-50 bg + left teal border indicator

---

## 5. Curriculum Reference

### 5.1 10-Track Curriculum Map  *(FIX-1, FIX-3)*

> **FIX-1 & FIX-3 applied:** The table below is the authoritative track-level reference. Pathway cards show stats for the *first active track* in that pathway, not the total across all tracks. The Advanced pathway shows 18 lessons (1 track, MVP). The 36-lesson total from Functional Doc §5.3 is a **post-v1 goal** requiring 4 additional Advanced tracks not yet authored — see footnote. [FIX-1] [FIX-3]

| Track | Arabic Name | Pathway Level | Lessons | Prerequisite | Badge |
|---|---|---|---|---|---|
| Beliefs & Iman (Aqeedah) | العقيدة | Beginner | 12 | None | Start Here (green) |
| Introduction to Seerah | السيرة النبوية | Beginner | 8 | None | Featured (gold gradient) |
| Purification (Taharah) | الطهارة | Beginner | 8 | Aqeedah | Pillar (teal) |
| Prayer (Salah) | الصلاة | Beginner | 10 | Taharah | Pillar (teal) |
| Fasting (Sawm) | الصيام | Beginner | 6 | Salah | Pillar (teal) |
| Zakat & Hajj | الزكاة والحج | Beginner | 6 | Salah | Pillar (teal) |
| Islamic History (Caliphates) | التاريخ الإسلامي | Intermediate | 8 | Seerah | Featured (gold) |
| Scholars & Companions | العلماء والصحابة | Intermediate | 8 | Seerah | Featured (gold) |
| Fiqh Principles (Usul) | أصول الفقه | Intermediate | 10 | Salah + Zakat | Featured (gold) |
| Classical Scholarship *(MVP)* | العلوم الإسلامية | Advanced | 18 | All Intermediate | Locked until prereqs met |

> **Post-v1 note (FIX-3):** Functional Document §5.3 states the Advanced pathway will eventually contain 36 lessons across 5 tracks: Tafsir Methodology · Hadith Sciences · Usul al-Fiqh · Islamic Theology (Kalam) · Ethics & Adab. MVP ships with only "Classical Scholarship" (18 lessons) as a single Advanced track. The 36-lesson total requires 4 additional tracks to be authored as a future milestone. The pathway card should display "18 lessons · ~12h" for Advanced in MVP, not "36 lessons."

### 5.2 Lesson State Reference

| State | CSS Class | Badge | Visual | CTA |
|---|---|---|---|---|
| Done | `.lesson-item` + `.ln-done` | "✓" | Green circle badge, standard bg | "Read →" active |
| Current | `.lesson-item.current` + `.ln-current` | "▶" | Teal circle badge, `rgba(0,105,110,.04)` bg highlight | "Read →" active, `rgba(0,105,110,.12)` bg |
| Read | `.lesson-item.read` + `.ln-read` | Number | Number badge, teal-50 tint bg | "Take Quiz →" active (Stage 3) |
| Next | `.lesson-item` + `.ln-next` | Number | Number badge, subtle style, no bg | "Read →" active |
| Locked | `.lesson-item.locked` + `.ln-locked` | "🔒" | Grey circle badge, greyed-out text | No CTA, no KH badge |

### 5.3 Three Pathways Reference  *(FIX-1, FIX-3)*

| Pathway | Tracks (MVP) | Track count | Total lessons (MVP) | Reading time (MVP) | Unlock Condition | CTA |
|---|---|---|---|---|---|---|
| 🌱 Beginner — Foundations of Faith | Aqeedah · Taharah · Prayer · Seerah · Fasting · Zakat | 6 | 50 across all 6 tracks (Aqeedah track alone: 12) | ~34h total | Always unlocked | "Continue Path" |
| 🏛️ Intermediate — Deepening Practice | Islamic History · Scholars & Companions · Fiqh Principles | 3 | 26 across 3 tracks | ~18h total | All Beginner tracks complete + quizzes ≥70% | "Begin Path" / "Continue Path" |
| 📜 Advanced — Classical Scholarship *(MVP: 1 track)* | Classical Scholarship | 1 (MVP) | 18 (MVP); 36 when 5 tracks authored (post-v1) | ~12h (MVP) | All Intermediate complete + quizzes ≥70% | "Begin Path" / "Continue Path" |

---

## 6. Feature Matrix

### 6.1 Stage-by-Stage Classification

| Feature | Stage | Priority | Gap Status (Func. Doc §19) | Persona |
|---|---|---|---|---|
| Global navbar — Islamic Studies active | Stage 1 | P0 | Present in mockup | All |
| Hero: Bismillah + H1 + Arabic hadith (frozen) | Stage 1 | P0 | Present in mockup | All |
| SEO architecture bar (2-panel, mandatory) | Stage 1 | P0 | Present in mockup — never remove | All |
| Stats strip (4 static metrics) | Stage 1 | P0 | Present in mockup — static | All |
| 3 pathway cards + 3D tilt hover | Stage 1 | P0 | Present in mockup — static progress | All |
| Animated progress bars (IntersectionObserver) | Stage 1 | P0 | Present in mockup | All |
| Lesson sequence + 4-track selector | Stage 1 | P0 | Present in mockup — 4 tracks | Students |
| Lesson item states (done/current/next/locked) | Stage 1 | P0 | Present in mockup — static | Students |
| Quiz band + prereq flow + 3 static stats | Stage 1 | P0 | Present in mockup — toast only | Students |
| KH handoff section + 8 cluster pills (mandatory) | Stage 1 | P0 | Present in mockup — never remove | All |
| Daily reflection (static) | Stage 1 | P1 | Present in mockup — static | Daily visitors |
| Scholars grid (6 cards) | Stage 1 | P0 | Present in mockup — static | Students / Scholars |
| CTA section (btn-gold + btn-white-ghost) | Stage 1 | P0 | Present in mockup | All |
| Global footer (5-column, verify Ecosystem) | Stage 1 | P0 | Present in mockup | All |
| Toast notification system (showToast()) | Stage 1 | P0 | Present in mockup | All |
| Progress persistence (localStorage) | Stage 2 | P0 | 🔴 High — static hardcoded | Returning students |
| Lesson unlock gating (sequential) | Stage 2 | P0 | 🔴 High — unenforced in code | All |
| Pathway unlock gating | Stage 2 | P0 | 🔴 High — toast only, no real check | All |
| Full 10-track selector + "More ▾" dropdown | Stage 2 | P0 | 🔴 High — only 4 tracks in JS | Students |
| "Read →" specific KH URL wiring | Stage 2 | P1 | 🔴 High — generic KH link | Students |
| Return-detection (visibilitychange hook) [FIX-2] | Stage 2 | P1 | 🔴 High — not implemented | Students |
| Study streak tracker (date-based) | Stage 2 | P1 | 🟠 Medium — static "14d" | Daily learners |
| Continue Lesson button (live destination) | Stage 2 | P1 | 🟠 Medium — toast only | Returning students |
| Quiz band stats from localStorage | Stage 2 | P1 | 🟢 Low — calculated from scores | Students |
| 5-question MC quiz (inline panel) [FIX-4] | Stage 3 | P0 | 🔴 High — no quiz system | Students |
| Score ≥70% lesson unlock gate | Stage 3 | P0 | 🔴 High — no quiz system | Students |
| Certificate PDF + share image | Stage 3 | P1 | 🟠 Medium — no certificate UI | Completers |
| Animated stats count-up | Stage 4 | P2 | 🟢 Low — numbers static | All |
| Interactive prerequisite pills | Stage 4 | P2 | 🟢 Low — display-only | Students |
| Scholar card biography expand | Stage 4 | P2 | 🟢 Low — display-only | Students / Scholars |
| Multilingual UI (8 languages) | Stage 4 | P1 | 🟠 Medium — English only | Non-English speakers |
| Daily reflection rotation (schedule/API) | Stage 4 | P1 | 🟠 Medium — static content | Daily visitors |
| Account sync hook (premium) | Stage 4 | P2 | 🟠 Medium — localStorage only | Premium users |

### 6.2 Accessibility Matrix

| Requirement | Standard | Implementation | Status |
|---|---|---|---|
| Semantic HTML | WCAG 2.1 AA | `<header>`, `<nav>`, `<main>`, `<section>` — blueprint structure preserved verbatim | Stage 1 |
| Arabic text direction | i18n | All Arabic elements: `direction:rtl`, `font-family:Amiri`. Never through i18n layer. | Stage 1 |
| ARIA labels | WCAG 2.1 AA | `aria-label` on `.lts-btn` tabs; `role="list"` on lesson list; `aria-expanded` on scholar panels (Stage 4); `role="listbox"` on "More ▾" panel [FIX-5] | Stage 1 |
| Color contrast | WCAG 2.1 AA (4.5:1) | ink-primary `#0F2A2C` on surface `#F4F7F7` = 14.8:1 ✅. pw-badge colours verified at Stage 1 audit. | Stage 1 audit |
| Keyboard navigation | WCAG 2.1 AA | All `.lts-btn`, `.pw-cta`, `.lesson-kh-cta`, `.hc-pill`, `.quiz-btn` focusable via Tab. Escape closes toast and quiz panel. [FIX-4] | Stage 2 |
| Reduced motion | WCAG 2.1 AA 2.3.3 | `@media (prefers-reduced-motion: reduce)`: disables `geoRot`, progress bar animation, `fadeUp`, 3D tilt, stats count-up, quiz panel slide | Stage 1 |
| Touch targets | WCAG 2.1 AA | All interactive elements ≥44px. `.lts-btn`: add `min-height: 44px` on mobile. `.lts-more-item`: `padding: 12px 16px` minimum. | Stage 1 |
| Quiz accessibility | WCAG 2.1 AA | Quiz panel uses `<fieldset>` + `<legend>` per question. `aria-live` region for score. Focus returns to `.quiz-btn` on close. [FIX-4] | Stage 3 |
| Screen reader | WCAG 2.1 AA | `aria-live` for progress updates; `aria-label` on lesson state badges; `role="status"` on toast | Stage 2 |
| Focus management | WCAG 2.1 AA | Focus moves to first question on quiz panel open; returns to `.quiz-btn` on close. "More ▾" panel: focus moves to first item on open, returns to "More ▾" on Escape. [FIX-4] [FIX-5] | Stage 3 |

---

## 7. Technical Architecture & Requirements

### 7.1 Frontend Stack

| Technology | Spec |
|---|---|
| HTML | HTML5 semantic per `islamic_studies_optionB.html` blueprint. Single file, no framework. |
| CSS | CSS3 custom properties from `CLAUDE_v3.md §1`. No CSS-in-JS. Dark-mode sibling block unmerged. No new colour tokens. |
| JavaScript | Vanilla JS. Single `<script>` at end of `<body>`. `TRACKS` / `TAGS` / `TIMES` data objects define curriculum content. |
| Fonts | Cormorant Garamond + Inter + Amiri — Google Fonts, preconnected in this order per `CLAUDE_v3.md §2` |
| Canvas | HTML5 Canvas for certificate PDF and share image (Stage 3). jsPDF for PDF export. |
| Quiz data | Static JSON per track: `/data/quizzes/{track-slug}.json`. Loaded lazily on quiz open. Required field: `citation` on every question. |
| Reflection | Static schedule `/data/reflections.json` (day-of-year keyed) — Stage 1. Optional API in Stage 4. |

### 7.2 Design System Rules

- All CSS tokens from `CLAUDE_v3.md §1`. No new colours, radii, or easing curves.
- Reuse existing classes: `.card`, `.chip`, `.btn-primary`, `.btn-ghost`, `.btn-gold`, `.btn-white-ghost`, `.arabic`, `.eyebrow`, `.section-eyebrow`, `.reveal`, `.rd1`, `.rd2`, `.rd3`
- Card hover: `translateY(-5px) scale(1.012)` + glow ring, `0.38s ease-reverent`. Pathway cards additionally apply 3D tilt on `mousemove`.
- **NO shimmer `::after` sweep** — forbidden per `CLAUDE_v3.md §27.4`
- ALL frozen copy from blueprint preserved verbatim: H1 text, Arabic hadith + source, subtitle, SEO bar labels, KH handoff body, stats, CTA hadith citation, scholar names and eras.
- Islamic Studies = School. **Never add article browse grids or free-reading content to this page.** Absolute rule per Functional Doc §17.

### 7.3 Progress Data Model (localStorage)

**Key:** `"islamicinfo-is-progress"`

```json
{
  "tracks": {
    "[trackSlug]": { "done": [0, 1, 2], "quizScores": [92, 88, 85] }
  },
  "streak": { "count": 14, "lastDate": "2026-05-17", "longestStreak": 21 },
  "certificates": ["foundations"]
}
```

| localStorage Key | Type | Purpose | Stage |
|---|---|---|---|
| `"islamicinfo-is-progress"` | JSON object (full shape above) | All progress, streak, certificates | Stage 2 |
| `"islamicinfo-is-visit"` | `{trackSlug, lessonIndex, departedAt: timestamp}` | Return-detection for "Read →" link [FIX-2] | Stage 2 |
| `"islamicinfo-is-current-track"` | String (track slug) | Last selected track tab restoration | Stage 2 |
| `"islamicinfo-lang"` | ISO 639-1 code | Global UI language (shared with all pages) | Stage 4 |
| `"islamicinfo-theme"` | `"light"` \| `"dark"` | Global site theme (shared with all pages) | Stage 1 |

### 7.4 Functional Rules (Non-Negotiable)

1. **IS = School, KH = Library.** Never add browsable article grids to the IS page.
2. **Sequential learning is enforced.** Locked lessons and pathways cannot be skipped. Gate logic in code, not just UI.
3. **Every lesson links OUT to KH.** No article content hosted inline on the IS page.
4. **Quiz citations sourced.** Every quiz JSON question must have a `citation` field. No anonymous questions.
5. **Certificates are honest.** Only issued when ALL lessons done AND all quizScores ≥70%. No partial certificates.
6. **Progress is private.** localStorage only. No upload without explicit user opt-in.
7. **Scholar authority required.** Every lesson cites from the approved scholar list (Functional Doc §11.1). No anonymous opinions, no internet personalities.
8. **No fatwa.** Lessons explain, contextualise, and narrate. They do not issue legal rulings.
9. **Arabic always in Amiri, RTL.** No exceptions.
10. **No shimmer.** Cards use `CLAUDE_v3.md §27.4` glow hover only.

### 7.5 Performance Requirements

- FCP < 1.5s — hero shell visible immediately; progress bars render after localStorage read (<50ms)
- LCP < 2.5s — above-the-fold pathway cards visible
- CLS < 0.1 — progress bars use `transition: width`; quiz panel uses `max-height` transition (no reflow)
- Quiz data: lazy-loaded per track on quiz open. Never fetched on page load.
- Certificate canvas: `await document.fonts.ready` before any `canvas.drawText` call
- Lighthouse Performance ≥ 90

### 7.6 Error States & Fallback Behaviours

| Feature | Failure Scenario | User-Facing Fallback | Technical Handling |
|---|---|---|---|
| Progress localStorage read | localStorage unavailable (private browsing, quota) | Page renders with default 0% progress. No error shown. | `try/catch` on all localStorage access; graceful degrade |
| Quiz data fetch | Network failure loading `/data/quizzes/{slug}.json` | "Quiz temporarily unavailable — please try again." Retry button inside quiz panel. | `fetch catch` → error state in panel; retry re-triggers fetch |
| Reflection rotation | Static JSON missing or network failure | Hardcoded default (Surah 93:7–8 from mockup) always renders | `fetch catch` → render hardcoded HTML default |
| Certificate canvas fonts | `document.fonts.ready` timeout (>3s) | Falls back to system serif. Certificate still generates. | `Promise.race` with 3s; proceed with fallback font stack |
| KH cluster pill navigation | Missing KH anchors | Links to `knowledge-hub.html` base URL. No broken links. | Validate all KH anchor targets before Stage 2 deploy |
| localStorage quota exceeded | Progress or quiz scores storage full | Toast: "Storage full — your progress may not be saved." No silent data loss. | `QuotaExceededError` catch on `setItem`; toast; preserve existing data |
| "More ▾" dropdown — empty track | Future track not yet authored | "This track is coming soon." toast. Disabled state on item. | Check `TRACKS[slug].lessons.length === 0` before rendering item |

---

## 8. Implementation Roadmap

### Stage 1 — Foundation (Weeks 1–2)
**Goal:** pixel-perfect replica of `islamic_studies_optionB.html` in both themes, all sections rendered.

1. Read `islamic_studies_optionB.html` + `CLAUDE_v3.md` in full before writing any code
2. Implement all CSS tokens; dark-mode sibling block unmerged; `geoRot` animation with reduced-motion override
3. Build hero: Bismillah (frozen), eyebrow, H1 (frozen), Arabic hadith (frozen), subtitle (frozen), SEO architecture bar, stats strip (4 static values)
4. Build 3 pathway cards: level badges, 3D tilt hover, track lists with coloured dots, progress bars (`data-w`, IntersectionObserver, threshold 0.25), CTAs (with locked toasts)
5. Build lesson sequence section: 4-track selector tabs, static lesson list from `TRACKS` object, lesson state badges, Continue button (toast only)
6. Build quiz band: 2-column layout, prereq-flow pills, 3 static stats, quiz CTA (toast only)
7. Build KH handoff section: 2-column, 8 cluster pills with correct hrefs and frozen copy
8. Build daily reflection: static Surah 93:7–8 content from mockup
9. Build scholars grid: 6 cards with correct avatars/names/eras verbatim from blueprint
10. Build CTA section: `btn-gold` (toast + scroll to pathways) + `btn-white-ghost`
11. Build footer: 5-column, Curriculum column verbatim, Ecosystem column correct
12. Implement toast system (`showToast()`), theme toggle, mobile menu, reveal observer
13. Implement `@media (prefers-reduced-motion: reduce)` for all animations
14. Verify Stage 1 acceptance criteria before advancing

### Stage 2 — Live Progress (Weeks 3–4)
**Goal:** localStorage wiring, full gating logic, all 10 tracks, return-detection.

1. Wire localStorage progress read/write: `"islamicinfo-is-progress"` with full shape
2. Apply progress on load: pathway bars update (track-level fill), lesson states reflect real `done[]`, stats band updates
3. Implement lesson unlock gating in `setTrack()`: only lessons with `done[i-1]` are unlocked; locked click → toast
4. Implement pathway unlock gating: real check against all constituent tracks' `done[]` counts
5. Build "More ▾" dropdown (`.lts-more-panel`) per §4.10 spec; wire all 6 remaining tracks  [FIX-5]
6. Wire "Read →" links to specific KH URLs: `knowledge-hub.html?lesson={track-slug}-{lessonIndex}`
7. Implement `visibilitychange` return-detection hook + `"islamicinfo-is-visit"` localStorage key  [FIX-2]
8. Add `ln-read` intermediate lesson state; wire "Take Quiz →" CTA for read-but-not-done lessons
9. Wire Continue Lesson button to current lesson's KH URL from localStorage
10. Implement streak tracker: date-based, increments on lesson read, resets on skipped day, `longestStreak` preserved
11. Wire quiz band stats to localStorage data
12. Verify Stage 2 acceptance criteria before advancing

### Stage 3 — Quiz & Certificates (Weeks 5–6)
**Goal:** full quiz flow, inline panel, certificate generation.

1. Build `.quiz-panel` inline expansion per §4.9 spec: `max-height` transition, focus management, `<fieldset>` + `<legend>` per question  [FIX-4]
2. Wire quiz data from `/data/quizzes/{slug}.json`; validate `citation` field exists on every question
3. Implement score calculation and pass/fail logic (≥70% = pass)
4. On pass: add to `done[]`, `ln-done` state, check track completion, fire 🎉 toast
5. On fail: message; no unlock; immediate retry
6. Implement quiz average calculation from stored `quizScores[]`
7. Build certificate canvas: all composition elements per US-IS15
8. "Download as PDF" and "Share as image" wired; slug added to `progress.certificates[]`
9. Completed track cards show 🏆 badge
10. Verify Stage 3 acceptance criteria before advancing

### Stage 4 — Polish & Sync (Weeks 7–8)

1. Animated stats count-up (IntersectionObserver + RAF counter, reduced-motion override)
2. Interactive prerequisite pills: smooth scroll + `setTrack()` call; tooltips
3. Scholar biography expand panels: single-open accordion, `max-height` transition
4. Multilingual UI (i18next, 8 locale files). Arabic content always Amiri RTL.
5. Daily reflection rotation from `/data/reflections.json`
6. Account sync hook for premium: export/import progress JSON, merge strategy
7. Verify Stage 4 acceptance criteria

### Testing & Launch (Weeks 9–10)

1. Cross-browser: Chrome, Firefox, Safari, Edge (desktop + mobile Safari)
2. Device testing: iPhone SE, iPhone 15 Pro, Samsung Galaxy S24, iPad
3. RTL: Arabic hadith, reflection text, scholar avatars on all breakpoints (900/640/480px)
4. Progress persistence: reload, browser close, private browsing graceful degrade
5. Return-detection: test `visibilitychange` on mobile (swipe back) and desktop (back button)  [FIX-2]
6. Quiz integrity: all `/data/quizzes/*.json` questions have `citation` field; no anonymous questions
7. Pathway gating: test full Beginner completion → Intermediate unlock
8. Certificate: partial completion (should not issue) + full completion (should issue)
9. "More ▾" dropdown: verify all 6 tracks load correctly; test locked track toast; test Escape close  [FIX-5]
10. KH handoff: all 8 cluster pill hrefs resolve to correct KH anchors
11. WCAG 2.1 AA audit: axe-core + manual keyboard + VoiceOver
12. Lighthouse CI: Performance ≥90, Accessibility ≥90
13. GA4 custom events for all 10 KPI metrics in §1

---

## 9. Design System & SEO Compliance Checklist

Every stage sign-off must pass this checklist. Items 1–20 from `CLAUDE_v3.md §24`. Items 21–32 Islamic Studies–specific.

| # | Check | Reference |
|---|---|---|
| 1 | `<html lang="en" data-theme="light">` opening tag | `CLAUDE_v3.md §2` |
| 2 | Fonts preconnected in order: Cormorant Garamond → Inter → Amiri | `CLAUDE_v3.md §2` |
| 3 | `:root` CSS tokens block present; dark-mode sibling block **UNMERGED** | `CLAUDE_v3.md §1` |
| 4 | Navbar: 10 items in order; "Islamic Studies" carries `class="nav-link active"` | `CLAUDE_v3.md §4.1` |
| 5 | Mobile menu HTML included; hamburger visible only at ≤760px | `CLAUDE_v3.md §4.7` |
| 6 | Bismillah: first child of `.hero-inner`; teal-gradient light / gold-gradient + glow dark | `CLAUDE_v3.md §5` |
| 7 | Hero H1: `var(--font-display)` with `<span class="grad-it">` on "Curriculum" | `CLAUDE_v3.md §6` |
| 8 | Cards: hover `translateY(-5px) scale(1.012)` + glow ring — **NO shimmer `::after` sweep** | `CLAUDE_v3.md §27.4` |
| 9 | All hover transitions use `var(--ease-reverent)` or `var(--ease-premium)` | `CLAUDE_v3.md §13` |
| 10 | Footer HTML verbatim — Ecosystem column: QuranlyAI, MosqueFinder, TravellyAI, LearnSpeakAI | `CLAUDE_v3.md §7.4` |
| 11 | CTA section present as last section before footer | `CLAUDE_v3.md §11` |
| 12 | Script block: theme toggle + mobile menu + reveal observer | `CLAUDE_v3.md §8` |
| 13 | `@media (prefers-reduced-motion: reduce)`: disables `geoRot`, progress bar anim, `fadeUp`, 3D tilt, stats count-up, quiz panel slide | `WCAG 2.1 AA 2.3.3` |
| 14 | Both light and dark themes tested — all sections, all states | Func. Doc §18 |
| 15 | All breakpoints verified: 900 / 640 / 480px | Func. Doc §16 |
| 16 | No new CSS colour tokens, radii, or easing curves outside `CLAUDE_v3.md §1` | Func. Doc §18 |
| 17 | All frozen copy preserved verbatim: H1, Arabic hadith + source, subtitle, SEO bar labels, KH handoff body, stats, CTA citation, scholar names + eras | Func. Doc §4.1, §20 |
| 18 | `.reveal` class on all section content; `.rd1`/`.rd2`/`.rd3` stagger on grid items | `CLAUDE_v3.md §12` |
| 19 | Touch targets ≥44px on mobile for `.lts-btn`, `.pw-cta`, `.lts-more-item` | WCAG 2.1 AA |
| 20 | Toast system uses existing `showToast()` vocabulary — no new notification component | `islamic_studies_optionB.html` |
| 21 | SEO architecture bar (`.seo-arch-bar`) visible in hero on every page load — **NEVER removed** | Func. Doc §4.2, §17 rule 2 |
| 22 | KH handoff section is present — **NEVER removed** | Func. Doc §9.3 |
| 23 | No article browse grids on this page — Islamic Studies is a School, not a Library | Func. Doc §1, §17 rule 1 |
| 24 | Every lesson links OUT to KH — no article content hosted inline on IS page | Func. Doc §17 rule 3 |
| 25 | Locked lessons cannot be accessed — gate logic enforced in code, not just UI | Func. Doc §6.4, §20 rule 2 |
| 26 | Certificates only issued when ALL lessons done AND all `quizScores` ≥70% — no partial certs | Func. Doc §8.4, §20 rule 5 |
| 27 | Quiz JSON questions have `citation` field — no anonymous questions | Func. Doc §20 rule 4 |
| 28 | Scholars referenced only from approved list (Func. Doc §11.1) | Func. Doc §20 rule 8 |
| 29 | No fatwa issued on this page — lessons explain and narrate only | Func. Doc §20 rule 9 |
| 30 | Progress is localStorage-only by default — no upload without explicit user opt-in | Func. Doc §13.2, §20 rule 7 |
| 31 | Page title: `"Islamic Studies Curriculum — IslamicInfo.org"` | Func. Doc §17 rule 4 |
| 32 | Meta description: `"Structured Islamic curriculum for every level. Sequential lessons on Aqeedah, Seerah, Prayer, Fasting, and more — with progress tracking, quizzes, and prerequisites."` | Func. Doc §17 rule 5 |

---

## 10. Out of Scope

The following are explicitly deferred and must not block any Stage:

- Knowledge Hub page content, article grid, or browse features (separate PRD)
- Server-side progress sync — localStorage only in Stages 1–4; account hook in Stage 4 is a preparation hook only
- Lesson content authoring CMS — lesson titles and KH URLs are developer-managed data objects
- User accounts, authentication, or profile management
- Payments or premium subscription gating (certificate generation is free in v1)
- Push notifications for streak reminders (mobile app feature)
- Community features (discussion per lesson, comments, peer learning)
- AI-powered lesson recommendations or personalised learning paths
- The 4 additional Advanced tracks (Tafsir Methodology · Hadith Sciences · Usul al-Fiqh · Kalam) — post-v1 milestone
- All other platform pages: Home, Qur'an Explorer, Hadith Library, Knowledge Hub, Daily Duas, Tools, Habit Tracker, Verify, About

---

## 11. Definition of Done — Islamic Studies Module

The Islamic Studies page is complete when every item below is checked off. No stage is shipped until both its stage acceptance criteria and these module-level criteria are satisfied.

| # | Criterion | Verified By |
|---|---|---|
| 1 | All four stages signed off against their acceptance criteria | Engineering Lead + Product |
| 2 | All routes in §2.2 resolve correctly and handle back/forward navigation | QA |
| 3 | Every frozen content string from `islamic_studies_optionB.html` preserved verbatim — H1, Arabic hadith, source, subtitle, KH handoff body, stats, CTA citation, scholar names and eras | Product + Design |
| 4 | Dark-mode parity: every section, card, badge, and button tested in `[data-theme="dark"]` | QA + Engineering |
| 5 | All breakpoints verified on real devices: 900 / 640 / 480px | QA |
| 6 | SEO architecture bar visible in hero on every page load — verified in PageSpeed Insights and manual check | Product + Engineering |
| 7 | KH handoff section present; all 8 cluster pill hrefs resolve to correct KH anchors | QA + Product |
| 8 | No article browse grids or free-reading content on the IS page | Product |
| 9 | Lesson unlock gating verified: locked lessons cannot be bypassed by manipulating localStorage | QA + Engineering |
| 10 | Pathway unlock gating verified: Intermediate stays locked until all Beginner tracks complete | QA |
| 11 | Advanced pathway correctly shows 18 lessons (MVP) — not 36 [FIX-3] | Product + QA |
| 12 | Certificates only generated on 100% completion + all quiz scores ≥70% | QA |
| 13 | Quiz data audit: all `/data/quizzes/*.json` questions have a `citation` field | Product + Content Review |
| 14 | Scholar references audit: all 6 scholars match Functional Document §11.1 | Product + Scholarly Review |
| 15 | Progress persistence: survives page reload, browser close; returns user to correct current lesson | QA |
| 16 | Return-detection: `visibilitychange` hook marks lesson as `ln-read` on return from KH [FIX-2] | QA + Engineering |
| 17 | Study streak: increments on completion, resets on skipped day, `longestStreak` preserved | QA |
| 18 | "More ▾" dropdown: all 6 tracks load; locked items show toast; Escape closes; `role="listbox"` present [FIX-5] | QA + Accessibility |
| 19 | Quiz panel: inline expansion (not modal overlay); focus-trap; Escape closes; `<fieldset>` per question [FIX-4] | QA + Accessibility |
| 20 | All hover interactions use `var(--ease-reverent)` for cards, `var(--ease-premium)` for buttons | Engineering |
| 21 | `prefers-reduced-motion`: all animations disabled or instant — verified with OS-level setting | QA + Accessibility |
| 22 | WCAG 2.1 AA: axe-core automated + manual keyboard + VoiceOver | QA + Accessibility |
| 23 | Lighthouse: Performance ≥90, Accessibility ≥90 | Engineering |
| 24 | GA4 custom events firing for all 10 KPI metrics in §1 | Analytics + Engineering |
| 25 | Page title and meta description match Func. Doc §17 exactly | Engineering + SEO |

---

## 12. Revision History

| Version | Date | Author | Summary |
|---|---|---|---|
| v1.0 | May 2026 | IslamicInfo Product Team | Initial PRD — synthesised from `islamic_studies_optionB.html`, `Islamic_Studies_Functional_Document_v1.md`, and `CLAUDE_v3.md` v3.0 |
| v1.1 | May 2026 | Claude (Anthropic) — Review & Refinement | FIX-1: Pathway vs. track lesson counts disambiguated throughout. FIX-2: Return-detection mechanism specified as `visibilitychange` + localStorage timestamp. FIX-3: Advanced pathway lesson count corrected to 18 (MVP); 36-lesson post-v1 goal documented. FIX-4: Quiz modal fully specified as inline expansion panel with wireframe, focus-trap, accessibility spec. FIX-5: "More tracks ▾" dropdown fully specified with wireframe, mobile behaviour, empty state, and accessibility. |
