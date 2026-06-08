# IslamicInfo — Islamic Studies Technical Specification

**Page:** `islamic-studies.html` · **Route:** `/islamic-studies`
**Blueprint:** `islamic_studies_optionB.html` · **Design System:** `CLAUDE_v3.md v3.0` · **PRD:** v1.1 · **Status:** Implementation-Ready

---

## 1. Purpose

Islamic Studies is the platform's **structured curriculum** — a school, not a library. It delivers a sequential, level-gated learning path from foundational beliefs to classical scholarship. Every lesson has prerequisites, a linked Knowledge Hub article, progress tracking, and a knowledge-check quiz.

**Absolute IS vs. KH distinction (never violate):**

| Dimension | Islamic Studies | Knowledge Hub |
|---|---|---|
| Mental model | School · Madrasa | Library · Encyclopedia |
| Content | Lesson sequences, prerequisites, quizzes, certificates | 2,000+ standalone articles, free browsing |
| Order | Sequential, prerequisite-gated | Free-form |
| Article grids | ❌ **NEVER** | ✅ Yes |
| Progress tracking | ✅ Yes | ❌ No |

**Five core functions:**
1. **Structured curriculum** — 10 tracks, 88 lessons, 3 level-gated pathways
2. **Progress persistence** — per-lesson, per-track, per-pathway tracking via `localStorage`
3. **Knowledge checks** — 5-question MC quiz per lesson; ≥70% required to unlock next lesson
4. **KH handoff** — every lesson links to Knowledge Hub; SEO architecture bar is mandatory
5. **Certificates** — PDF + shareable image on full track completion

**KPIs:** Lesson start rate > 40%, track completion > 15%, quiz attempt rate > 50%, quiz pass rate > 70%, 7-day streak > 30%, certificate generation > 5%, Lighthouse ≥ 90.

---

## 2. UI Components

### 2.1 Page Sections (top → bottom)

| # | Section | CSS / ID | Key content |
|---|---|---|---|
| 1 | Navbar | `#siteHeader` | Sticky; "Islamic Studies" carries `.nav-link.active` |
| 2 | Hero | `.hero` | Bismillah → eyebrow → H1 → Arabic hadith → subtitle → SEO Arch Bar → stats strip |
| 3 | Learning Pathways | `.pathways-grid` | 3 pathway cards: Beginner / Intermediate / Advanced |
| 4 | Lesson Sequence | `.lesson-section-wrap` | Track selector tabs + `#lessonList` + progress footer |
| 5 | Quiz / Progress Band | `.quiz-band` | Prereq flow + quiz CTA (left) · 3 stats (right) |
| 6 | KH Handoff | `.handoff-section` | IS–KH explanation + 8 cluster pills — **NEVER REMOVE** |
| 7 | Daily Reflection | `.reflection-section` | Arabic verse + ornamental divider + translation + KH link |
| 8 | Scholars Grid | `.scholars-grid` | 6 classical scholar cards |
| 9 | CTA Section | `.cta-section` | `btn-gold` Start Curriculum + `btn-white-ghost` Browse KH |
| 10 | Footer | `#ii-footer` | Global 5-column per CLAUDE_v3.md §7 |
| — | Quiz Panel | `.quiz-panel` | Inline expansion below `.quiz-band`; **not a modal overlay** |
| — | Toast | `#toast` | Slide-up notification (locked pathway, Continue, quiz) |
| — | More Tracks Panel | `.lts-more-panel` | Dropdown below "More ▾" track tab |

### 2.2 Hero (Frozen content — never alter without explicit instruction)

- **Bismillah:** بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — first child of `.hero-inner`; Amiri; teal-gradient light / gold-gradient + glow dark
- **Eyebrow:** "Structured Curriculum" — `.eyebrow` with gold pulsing dot
- **H1:** "Islamic Studies / *Curriculum*" — `<span class="grad-it">Curriculum</span>`
- **Arabic hadith:** طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ + "Seeking knowledge is an obligation upon every Muslim." + "Sunan Ibn Majah · 224 · Graded Ḥasan by al-Albānī"
- **Stats strip:** 10 Tracks · 152 Lessons · 3 Levels · 48h+ Curriculum (static in Stages 1–3; animated count-up in Stage 4)

### 2.3 SEO Architecture Bar (Mandatory — NEVER remove)

`.seo-arch-bar` renders in the hero below the subtitle. Two side-by-side panels:

| Panel | State | Content |
|---|---|---|
| 🎓 Islamic Studies | Active (non-link) | teal-700 border, teal-50 bg; "Curriculum · Lessons · Quizzes" subtitle |
| 📚 Knowledge Hub | Link → `knowledge-hub.html` | Subdued border; "2,000+ Articles · Browse freely" subtitle |

### 2.4 Pathway Cards

Three `.card.pathway-card` in `.pathways-grid` (3-col ≥ 900px, 1-col ≤ 640px). 3D mouse-tracking tilt on hover (±4–6deg `rotateX`/`rotateY`; resets `.38s ease-reverent` on `mouseleave`).

| Pathway | Level | Tracks (MVP) | Total Lessons (MVP) | Initial progress bar | CTA |
|---|---|---|---|---|---|
| 🌱 Beginner — Foundations of Faith | Foundations | 6 tracks | 50 across all; Aqeedah track: **12** | 25% (`data-w="25"`) | "Continue Path" |
| 🏛️ Intermediate — Deepening Practice | Intermediate | 3 tracks | 26 | 0% locked | "Begin Path" → locked toast |
| 📜 Advanced — Classical Scholarship | Advanced | 1 track (MVP) | **18** (post-v1: 36) | 0% locked | "Begin Path" → locked toast |

> FIX-1: Pathway card metadata shows stats for the **first active track**, not total across all tracks. Beginner displays "12 lessons · ~8h reading" = Aqeedah track only.
> FIX-3: Advanced MVP = 18 lessons (1 track). Post-v1 goal of 36 lessons requires 4 additional tracks not yet authored.

Track dot colours: `.pw-track-dot.green` = done · `.teal` = in progress · `.gold` = locked.
Progress bars animate on `IntersectionObserver` threshold 0.25; fill driven by `data-w`.

### 2.5 Lesson Sequence

`.lesson-section-wrap` structure:
- **Track selector:** 4 primary `.lts-btn` tabs (Foundations · Seerah · Prayer · History) + "More ▾" 5th tab (see §2.6)
- **`#lessonList`:** dynamic vertical stack of `.lesson-item` rows

Each `.lesson-item`:

| Slot | Element | Detail |
|---|---|---|
| Left | `.lesson-num` badge (32px circle) | State-coded — see §2.7 |
| Centre | `.lesson-body` | `.lesson-title` + `.lesson-meta-row` (time + topic tag + `📚 Read in KH` badge) |
| Right | `.lesson-kh-cta` | "Read →" (current/next); "Take Quiz →" (read state); none (locked) |

**Current item** extra: `background rgba(0,105,110,.04)`, `border-radius 10px`, "Read →" has `rgba(0,105,110,.12)` bg.

**Progress footer:** "3 of 12 lessons complete · 25% through Foundations" + `btn-primary` "Continue Lesson N" (play icon SVG).

### 2.6 "More Tracks ▾" Dropdown (FIX-5)

`.lts-more-panel`: `position: absolute` below "More ▾" tab. `border: 0.5px solid rgba(0,105,110,.15)`, `border-radius: var(--r-lg)`, `box-shadow: var(--elev-3)`, `min-width: 200px`, `z-index: 50`.

Each `.lts-more-item` row: track name + lesson count badge + lock icon (if prerequisites unmet).
- Active non-primary track: teal-50 bg + left teal border
- "More ▾" label updates to selected track name when a non-primary track is active
- Mobile ≤ 640px: panel is full-width, bottom-anchored, `border-radius var(--r-lg) var(--r-lg) 0 0`
- Empty/future track: "Coming soon" muted text; click → toast
- `role="listbox"`; each item `role="option"`; focus moves to first item on open; Escape → close + return focus to "More ▾"

### 2.7 Lesson State Reference

| State | CSS | Badge | BG | CTA |
|---|---|---|---|---|
| Done | `.ln-done` | "✓" green | — | "Read →" |
| Current | `.ln-current` | "▶" teal | `rgba(0,105,110,.04)` | "Read →" teal bg |
| Read | `.ln-read` | Number, teal-50 tint | teal-50 tint | "Take Quiz →" |
| Next | `.ln-next` | Number | — | "Read →" |
| Locked | `.ln-locked` | "🔒" grey | greyed text | No CTA, no KH badge |

### 2.8 Quiz / Progress Band

`.quiz-band`: teal-tinted card (`border-left 3px var(--teal-700)`, `border-radius var(--r-xl)`). Two-column `.quiz-inner`:

- **Left (`.quiz-left`):** eyebrow "Knowledge Check" → title → description → `.prereq-flow` pill chain → `.quiz-btn` "Take Quiz · Lesson N"
- **Prereq flow pills:** `.pf-done` (green bg "✓ Tawhid") · `.pf-current` (teal border "▶ Wudu") · `.pf-next` (grey "🔒 Salah") · `.pf-arrow` "→"
- **Right (`.quiz-stats`):** 3 `.qs-item` cards — "3/12" Lessons done · "87%" Quiz avg · "14d" Study streak (live from `localStorage` in Stage 2)

### 2.9 Quiz Panel (Inline Expansion — FIX-4)

`.quiz-panel` expands **below `.quiz-band`** via `max-height: 0 → auto` + `opacity: 0 → 1`, `0.38s ease-reverent`. **Not a floating modal.**

Structure: close button (✕, Escape) + lesson title + "Q N of 5" counter → question (`<fieldset>` + `<legend>`) + 4 `<label><input type="radio">` options → Previous / Next buttons → Submit (question 5 only) → score screen.

- Selected option: teal-50 bg + teal border
- "Next →" disabled until selection made
- Score screen: "N/5 · N%" + pass/fail message + "Continue" button
- `role="region"` + `aria-label="Knowledge Check Quiz"`; `aria-live="polite"` for score announcement
- Focus: first question on open; `.quiz-btn` on close

### 2.10 KH Handoff Section (NEVER REMOVE)

`.handoff-section`: 2-column (`1fr 1fr`) ≥ 900px, stacked below. **8 cluster pills verbatim (frozen):**

| Pill | Icon | Articles | href |
|---|---|---|---|
| The Five Pillars | 🕋 | 342 | `knowledge-hub.html#pillars` |
| Faith & Theology | ✦ | 265 | `knowledge-hub.html#aqidah` |
| Islamic History | 🏛️ | 311 | `knowledge-hub.html#history` |
| Prophets & Companions | 🌟 | 214 | `knowledge-hub.html#prophets` |
| Islamic Law · Fiqh | ⚖️ | 398 | `knowledge-hub.html#fiqh` |
| Spirituality & Adab | 📿 | 189 | `knowledge-hub.html#spirituality` |
| Qur'an & Revelation | 📖 | 287 | `knowledge-hub.html#quran` |
| Islam in Modern Life | 🌍 | 224 | `knowledge-hub.html#modern` |

Pills hover: `translateY(-3px)` + teal glow border.

### 2.11 Scholars Grid

`.scholars-grid`: auto-fill `minmax(140px, 1fr)`. 6 `.scholar-card` (staggered `.rd1/rd2/rd3` reveal). Each card: `.scholar-avatar` (56×56px circle, `.av-teal` or `.av-gold` alternating, Arabic initials in Amiri 18px) + `.scholar-name` + `.scholar-era` + `.scholar-topic`.

**Frozen scholar data:**

| Scholar | Initials | Era AH | Fields |
|---|---|---|---|
| Ibn Kathir | إك | 700–774 | Tafsir, History |
| Imam an-Nawawi | نو | 631–676 | Fiqh, Hadith |
| al-Qurtubi | قر | 600–671 | Tafsir, Fiqh |
| Ibn al-Qayyim | عق | 691–751 | Theology, Spirituality |
| Imam at-Tabari | طب | 224–310 | Tafsir, History |
| Ibn Hajar al-'Asqalani | حج | 773–852 | Hadith Sciences |

---

## 3. Frontend Logic

### 3.1 Curriculum Data Object (`TRACKS`)

Vanilla JS object at top of `<script>`. Each entry:

```js
const TRACKS = {
  foundations: {
    name: 'Beliefs & Iman (Aqeedah)',
    arabicName: 'العقيدة',
    pathway: 'beginner',
    prereqs: [],
    lessons: [
      { title: '...', time: '11 min', tag: 'Aqeedah',
        khUrl: 'knowledge-hub.html?lesson=foundations-0' }
      // ... 12 total
    ]
  },
  // ... all 10 tracks
};
```

All 10 track slugs: `foundations`, `seerah`, `prayer`, `history`, `taharah`, `fasting`, `zakat`, `scholars`, `fiqh`, `classical`.

### 3.2 `setTrack(btn, slug)`

Called on track tab click and "More ▾" item click:
1. Update `.lts-btn` active state; update "More ▾" label if non-primary track
2. Close `.lts-more-panel` if open
3. Read `progress.tracks[slug]` from localStorage
4. Render `#lessonList` from `TRACKS[slug].lessons`; apply state classes per `done[]` array
5. Update progress footer text and "Continue Lesson N" button URL
6. Store `localStorage['islamicinfo-is-current-track'] = slug`

### 3.3 Progress Read / Write

On every page load:
1. `let progress = JSON.parse(localStorage.getItem('islamicinfo-is-progress')) ?? defaultProgress`
2. Apply pathway bar fills (track-level: `done.length / totalLessons`)
3. Apply lesson states in active track
4. Update quiz band stats (lessons done count, quiz avg, streak)

On lesson completion (quiz pass):
1. `progress.tracks[slug].done.push(lessonIndex)` (deduplicated)
2. `progress.tracks[slug].quizScores[lessonIndex] = score` (highest score only)
3. Check streak logic (§3.5); update `progress.streak`
4. `localStorage.setItem('islamicinfo-is-progress', JSON.stringify(progress))`
5. Re-render lesson list; update pathway bar; check pathway unlock

### 3.4 Lesson Unlock Gating

```js
function getLessonState(slug, idx) {
  const done = progress.tracks[slug]?.done ?? [];
  if (done.includes(idx)) return 'done';
  // ln-read: returned from KH, not yet quizzed
  if (visitRecord?.trackSlug === slug && visitRecord?.lessonIndex === idx) return 'read';
  if (idx === 0 || done.includes(idx - 1)) return idx === firstUndone ? 'current' : 'next';
  return 'locked';
}
```

Clicking a locked lesson: `showToast('🔒 Complete Lesson ${idx} first to continue.')` — no navigation.

### 3.5 Pathway Unlock Gating

```js
function isPathwayUnlocked(pathway) {
  const required = PATHWAY_PREREQS[pathway]; // array of track slugs
  return required.every(slug => {
    const t = progress.tracks[slug];
    return t?.done.length >= TRACKS[slug].lessons.length &&
           t?.quizScores.every(s => s >= 70);
  });
}
```

`PATHWAY_PREREQS.intermediate` = all 6 Beginner track slugs. `PATHWAY_PREREQS.advanced` = all 3 Intermediate track slugs.

### 3.6 "Read →" Return Detection (FIX-2)

On "Read →" click:
```js
localStorage.setItem('islamicinfo-is-visit', JSON.stringify({
  trackSlug, lessonIndex, departedAt: Date.now()
}));
```

On `visibilitychange` (page becomes visible):
```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const rec = JSON.parse(localStorage.getItem('islamicinfo-is-visit'));
  if (!rec) return;
  const elapsed = (Date.now() - rec.departedAt) / 1000;
  localStorage.removeItem('islamicinfo-is-visit');
  if (elapsed < 30 * 60 && elapsed >= 60) { // 1–30 min window
    markLessonRead(rec.trackSlug, rec.lessonIndex);
  }
});
```

`markLessonRead` sets the lesson to `ln-read` state and changes its CTA to "Take Quiz →".

### 3.7 Study Streak Logic

```js
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const { count, lastDate, longestStreak } = progress.streak;
  if (lastDate === today) return; // already counted today
  const yesterday = getYesterday(); // date arithmetic
  progress.streak.count = lastDate === yesterday ? count + 1 : 1;
  progress.streak.lastDate = today;
  progress.streak.longestStreak = Math.max(longestStreak, progress.streak.count);
}
```

Called on each lesson read. `longestStreak` never decremented.

### 3.8 Progress Bar Animation

```js
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const bar = e.target.querySelector('.pw-fill');
    const w = e.target.dataset.w;
    bar.style.width = w + '%';
    io.unobserve(e.target);
  });
}, { threshold: 0.25 });
document.querySelectorAll('.pathway-card').forEach(c => io.observe(c));
```

### 3.9 3D Tilt Hover

```js
card.addEventListener('mousemove', e => {
  const { left, top, width, height } = card.getBoundingClientRect();
  const x = ((e.clientX - left) / width - 0.5) * 10;  // ±5deg
  const y = ((e.clientY - top) / height - 0.5) * -8;  // ±4deg
  card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
});
card.addEventListener('mouseleave', () => {
  card.style.transition = 'transform .38s var(--ease-reverent)';
  card.style.transform = '';
});
```

### 3.10 Quiz Flow

1. "Take Quiz · Lesson N" click → fetch `/data/quizzes/{slug}.json` (lazy) → open `.quiz-panel` (`max-height` transition)
2. Render question 1 of 5; focus first radio option
3. Radio select → enable "Next →"; apply teal-50 bg to selected label
4. Question 5 submit → calculate `score = (correct / 5) * 100`
5. **Pass (≥ 70%):** `markLessonDone(slug, idx)` → `showToast('🎉 Lesson complete! Next lesson unlocked.')` → update lesson list + pathway bar + check track completion
6. **Fail (< 70%):** show "Good effort — re-read the lesson and try again."; no state change; immediate retry available
7. Store highest score: `progress.tracks[slug].quizScores[idx] = Math.max(existing ?? 0, score)`
8. Close: ✕ / Escape / "Continue" button; focus returns to `.quiz-btn`

### 3.11 Certificate Generation (Stage 3)

Triggers only when `TRACKS[slug].lessons.length === progress.tracks[slug].done.length && progress.tracks[slug].quizScores.every(s => s >= 70)`.

Canvas composition: IslamicInfo branding → track name (EN + Arabic, Amiri) → knowledge hadith → "Learner" (or user name) → completion date → gold ornamental border.

`await document.fonts.ready` (with `Promise.race` 3s timeout) before any `canvas.drawText`.

`progress.certificates.push(slug)` on generation; completed track cards show "🏆 Certificate earned" badge.

### 3.12 `showToast(msg, duration = 3000)`

Existing system from blueprint. Sets `#toast` text, adds `.show`, removes after `duration` ms. `role="status"` on toast element.

### 3.13 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .geo { animation: none !important; }
  .hero-bg { animation: none !important; }
  .pw-fill { transition: none !important; }
  .pathway-card { transition: none !important; } /* disables 3D tilt */
  .quiz-panel { transition: none !important; }
  .lts-more-panel { transition: none !important; }
  .reveal, .rd1, .rd2, .rd3 { transition: none !important; animation: none !important; }
  /* Stage 4: stats count-up skipped — values set immediately */
}
```

---

## 4. Backend Logic

### 4.1 Static File Server (Stages 1–3)

No backend required. All data is:
- **Quiz data:** `/data/quizzes/{track-slug}.json` — served as static files
- **Reflection data:** `/data/reflections.json` — day-of-year keyed, static
- **Progress:** 100% localStorage; no server calls

### 4.2 Account Sync Hook (Stage 4 — Preparation Only)

Prepare but do not activate. Export: `exportProgress()` → JSON blob. Import: `importProgress(json)` → merge strategy (higher `quizScores`, union of `done[]`). No server endpoint until authentication is built.

### 4.3 Daily Reflection (Stage 4)

Optional backend endpoint: `GET /api/is/reflection` → returns `{arabicText, translation, surahRef, khUrl}`. Client falls back to hardcoded default (Surah 93:7–8) on failure or in Stage 1.

---

## 5. APIs

| Endpoint | Method | Stage | Cache | Notes |
|---|---|---|---|---|
| `/data/quizzes/{slug}.json` | GET | Stage 3 | CDN, 7d | Lazy — only on quiz open. Every question **must** have a `citation` field. |
| `/data/reflections.json` | GET | Stage 1 (static) / Stage 4 (rotation) | 24h | Day-of-year keyed. Fallback: hardcoded Surah 93:7–8. |
| `knowledge-hub.html?lesson={slug}-{idx}` | Navigation | Stage 2 | — | Not an API; outbound link to KH with query param |
| `/api/is/reflection` | GET | Stage 4 optional | 24h | Backend reflection rotation endpoint |

No external APIs. No Anthropic API calls on this page.

---

## 6. Database

### 6.1 `localStorage` Keys (complete reference)

| Key | Type | Purpose | Stage |
|---|---|---|---|
| `islamicinfo-is-progress` | `IsProgress` JSON | All progress, streak, certificates | Stage 2 |
| `islamicinfo-is-visit` | `IsVisitRecord` JSON | Return-detection for "Read →" (FIX-2) | Stage 2 |
| `islamicinfo-is-current-track` | `string` (track slug) | Last selected track tab restoration | Stage 2 |
| `islamicinfo-lang` | ISO 639-1 | Global UI language (shared) | Stage 4 |
| `islamicinfo-theme` | `'light' \| 'dark'` | Global site theme (shared) | Stage 1 |

### 6.2 Progress Data Shape

```json
{
  "tracks": {
    "[trackSlug]": {
      "done": [0, 1, 2],
      "quizScores": [92, 88, 85]
    }
  },
  "streak": {
    "count": 14,
    "lastDate": "2026-05-17",
    "longestStreak": 21
  },
  "certificates": ["foundations"]
}
```

- `done[]`: array of zero-based lesson indexes in that track
- `quizScores[]`: highest score (%) per lesson index; index-aligned with `done[]`
- `certificates[]`: slugs of tracks where full certificate has been generated

### 6.3 Quiz JSON Schema (`/data/quizzes/{slug}.json`)

```json
{
  "trackSlug": "foundations",
  "lessons": [
    {
      "lessonIndex": 0,
      "questions": [
        {
          "q": "What are the six pillars of Iman?",
          "options": ["A", "B", "C", "D"],
          "correct": 0,
          "citation": "Ibn Kathir, Tafsir al-Qur'an al-'Azim, Surah 2:285"
        }
      ]
    }
  ]
}
```

**`citation` field is mandatory** on every question. Validation rejects quiz data missing citations.

---

## 7. Validation

### 7.1 Progress Data Integrity

```js
function validateProgress(raw) {
  try {
    const p = JSON.parse(raw);
    if (typeof p !== 'object' || !p.tracks) throw new Error();
    // Ensure no locked lesson is in done[] (anti-tamper)
    Object.entries(p.tracks).forEach(([slug, data]) => {
      if (!TRACKS[slug]) return;
      data.done = data.done
        .filter(i => typeof i === 'number' && i >= 0 && i < TRACKS[slug].lessons.length)
        .filter((i, _, arr) => i === 0 || arr.includes(i - 1)); // sequential integrity
      data.quizScores = data.quizScores.filter(s => typeof s === 'number' && s >= 0 && s <= 100);
    });
    return p;
  } catch {
    return defaultProgress();
  }
}
```

- Sequential integrity enforced: lesson `i` in `done[]` requires lesson `i-1` to also be present
- `quizScores` clamped to 0–100
- Unknown track slugs ignored

### 7.2 Quiz Data Validation

Before rendering quiz, validate fetched JSON:
- Every question has: `q` (string), `options` (array of 4 strings), `correct` (0–3), `citation` (non-empty string)
- If validation fails: render "Quiz temporarily unavailable — please try again." in panel; do not render invalid questions

### 7.3 Pathway Gating (Server-Side Intent, Client-Enforced)

Progress data from localStorage is re-validated on every page load. Sequential integrity means a student cannot skip lessons by injecting arbitrary values.

### 7.4 Certificate Issuance Guard

```js
function canIssueCertificate(slug) {
  const t = progress.tracks[slug];
  const total = TRACKS[slug].lessons.length;
  return (
    t?.done.length === total &&
    t?.quizScores.length === total &&
    t?.quizScores.every(s => s >= 70)
  );
}
```

Never issues partial certificates. Logged with timestamp in `progress.certificates`.

### 7.5 Input Validation

| Input | Rule |
|---|---|
| Track slug from URL hash | Must exist in `TRACKS` object; fallback to `foundations` |
| Quiz answers | Only accept radio-button selection from rendered options (0–3); no free text |
| Lesson index from URL | Must be integer ≥ 0 and < track lesson count; clamp if OOB |
| `islamicinfo-is-visit.departedAt` | Must be a number; reject if > 30 min ago |

---

## 8. Error Handling

| Scenario | User-Facing Fallback | Technical Handling |
|---|---|---|
| `localStorage` unavailable (private browsing / quota) | Page renders with default 0% progress; no error shown | `try/catch` on all `localStorage` access; `defaultProgress()` fallback |
| `localStorage` quota exceeded | Toast: "Storage full — your progress may not be saved." | `QuotaExceededError` catch on `setItem`; preserve existing data |
| `localStorage` progress data corrupt | Silent: reset to `defaultProgress()` | `validateProgress()` returns default on parse failure |
| Quiz JSON fetch fails | "Quiz temporarily unavailable — please try again." + retry button in `.quiz-panel` | `fetch catch` → error state in panel; retry re-triggers fetch |
| Quiz JSON missing `citation` field | "Quiz temporarily unavailable — please try again." | Pre-render validation; reject and show error state |
| Reflection JSON fails | Renders hardcoded default (Surah 93:7–8 from blueprint) | `fetch catch` → hardcoded HTML default |
| Certificate canvas font timeout (> 3s) | Falls back to system serif; certificate still generates | `Promise.race([document.fonts.ready, timeout(3000)])` |
| KH cluster pill anchor missing on KH page | Links to `knowledge-hub.html` base URL (no broken links) | Validate all anchors before Stage 2 deploy |
| "More ▾" track with 0 lessons | "This track is coming soon." toast; item shown as disabled | `TRACKS[slug].lessons.length === 0` check before render |
| Track slug not found in `TRACKS` | Silently fall back to `foundations` track | Guard in `setTrack()` |

---

## 9. RBAC

Islamic Studies is **publicly accessible** — no authentication gate.

| Role | Access | Notes |
|---|---|---|
| Guest | Full page; progress in `localStorage` only | Default for all users |
| Authenticated User | All guest features + optional cloud sync for progress | Stage 4 prep only; sync hook not activated until auth is built |
| Admin | All user features + header admin icon | Placeholder in MVP |

**Progress is private by default.** `localStorage` only. No upload without explicit user opt-in per Functional Doc §20 rule 7.

No AI calls. No external API calls requiring auth. No rate-limiting needed on this page.

---

## 10. Edge Cases

| Case | Handling |
|---|---|
| Sequential integrity tampered (user manually edits localStorage) | `validateProgress()` re-enforces sequential gate: `done[i]` requires `done[i-1]` present; invalid entries removed |
| Intermediate pathway partially complete (some tracks done, others not) | Intermediate stays locked; pathway bar shows 0%; individual track progress preserved |
| Advanced pathway MVP (1 track, 18 lessons) | Card shows "18 lessons · ~12h" — **not** "36 lessons"; post-v1 tracks not rendered until authored (FIX-3) |
| User returns from KH in under 60 seconds | `elapsed < 60` → lesson NOT marked `ln-read`; minimum engagement threshold enforced (FIX-2) |
| User returns from KH after 30+ minutes | `elapsed > 30 * 60` → visit record discarded; lesson stays `ln-current` |
| Multiple browser tabs open | `storage` event listener syncs progress across tabs on `localStorage` change |
| "More ▾" dropdown open + user scrolls | Close dropdown on scroll (add `scroll` listener that calls `closeLtsPanel()`) |
| Quiz panel open during track switch | Close quiz panel before calling `setTrack()`; reset quiz state |
| Certificate already in `progress.certificates[]` | "🏆 Certificate earned" badge shown; no re-generation prompt (avoids duplicate canvas calls) |
| `prefers-reduced-motion` + stats count-up (Stage 4) | Values set immediately to final number; no RAF animation |
| Prerequisite pill click (Stage 4) on same track already selected | `setTrack()` is idempotent; no visual glitch |
| Reflection section: static `index = dayOfYear % reflections.length` | Handles year boundaries (366 % array length) correctly |
| Track with 0 quiz scores but all lessons in `done[]` | Only possible via localStorage manipulation; `canIssueCertificate()` returns false (no quizScores) |

---

## 11. Performance

**Targets:** FCP < 1.5s, LCP < 2.5s (pathway cards above fold), CLS < 0.1, Lighthouse ≥ 90.

| Technique | Implementation |
|---|---|
| Theme no-flash | Inline `<script>` in `<head>` reads `localStorage['islamicinfo-theme']`; sets `data-theme` before CSS loads |
| Progress bar no-CLS | Bars use `transition: width`; initial `width: 0` set in CSS before JS reads localStorage; no layout shift |
| Quiz panel no-CLS | `max-height` transition (no layout reflow); initial `max-height: 0; overflow: hidden` in CSS |
| "More ▾" panel | `position: absolute`; does not affect document flow |
| Quiz data: lazy | `/data/quizzes/{slug}.json` fetched **only on quiz button click**; never on page load |
| Reflection: lazy | `/data/reflections.json` fetched after `DOMContentLoaded`; static HTML default renders first |
| Font preconnect | `<link rel="preconnect" href="https://fonts.googleapis.com">` + `fonts.gstatic.com crossorigin` in order: Cormorant Garamond → Inter → Amiri |
| IntersectionObserver | Used for: pathway bar animation (threshold 0.25) + scroll reveal (threshold 0.12) + stats count-up (Stage 4). Single observer instance per type. |
| No framework | Vanilla JS; no React/Vue overhead; no build step |
| `will-change: transform` | Applied only to `.pathway-card` during 3D tilt; removed on `mouseleave` |
| Certificate canvas | `await Promise.race([document.fonts.ready, timeout(3000)])` before draw; canvas disposed after download |

---

## 12. File Structure

```
project-root/
├── islamic-studies.html                # Main page (blueprint: islamic_studies_optionB.html)
├── src/
│   ├── css/
│   │   ├── tokens.css                  # :root + [data-theme="dark"] (CLAUDE_v3.md §1)
│   │   ├── base.css                    # Reset, body, .shell, .container (shared)
│   │   ├── header.css                  # Navbar, search popup, mobile menu (shared)
│   │   ├── hero-is.css                 # Hero, .hero-bg, .geo, Bismillah (IS variant)
│   │   ├── seo-arch-bar.css            # .seo-arch-bar — 2-panel IS/KH bar
│   │   ├── stats-strip-is.css          # Stats strip (shared pattern, IS values)
│   │   ├── pathways.css                # .pathways-grid, .pathway-card, 3D tilt, progress bars
│   │   ├── lesson-sequence.css         # .lesson-section-wrap, #lessonList, .lesson-item states
│   │   ├── track-selector.css          # .lesson-track-select, .lts-btn, .lts-more-panel
│   │   ├── quiz-band.css               # .quiz-band, .quiz-inner, .prereq-flow pills, .quiz-stats
│   │   ├── quiz-panel.css              # .quiz-panel inline expansion, fieldset/radio styling
│   │   ├── handoff-section.css         # .handoff-section, .hc-pill cluster pills
│   │   ├── reflection-section.css      # .reflection-section, ornamental divider, .ref-btn
│   │   ├── scholars-grid.css           # .scholars-grid, .scholar-card, .scholar-avatar
│   │   ├── certificate.css             # Certificate modal / canvas container (Stage 3)
│   │   ├── cta-section.css             # .cta-section, btn-gold, btn-white-ghost (shared)
│   │   ├── footer.css                  # #ii-footer (shared)
│   │   ├── buttons.css                 # .btn-primary/ghost/gold/white-ghost (shared)
│   │   ├── cards.css                   # Base .card hover (shared)
│   │   ├── chips.css                   # .chip, .eyebrow variants (shared)
│   │   ├── reveal.css                  # .reveal, .rd1/rd2/rd3 (shared)
│   │   ├── toast.css                   # #toast component (shared)
│   │   └── responsive.css              # Breakpoints: 900 / 640 / 480px
│   ├── js/
│   │   ├── theme.js                    # Inline <head> theme no-flash (shared)
│   │   ├── header.js                   # Search popup, mobile menu, scroll state (shared)
│   │   ├── curriculum-data.js          # TRACKS object (all 10 tracks + lesson metadata)
│   │   ├── progress.js                 # Read/write localStorage, validateProgress(), defaultProgress()
│   │   ├── lesson-gating.js            # getLessonState(), isPathwayUnlocked(), PATHWAY_PREREQS
│   │   ├── lesson-renderer.js          # setTrack(), renderLessonList(), updateProgressFooter()
│   │   ├── track-selector.js           # Tab click handler, lts-more-panel open/close, a11y
│   │   ├── pathway-cards.js            # IntersectionObserver for progress bars, 3D tilt handlers
│   │   ├── return-detection.js         # visibilitychange hook, markLessonRead() (FIX-2)
│   │   ├── streak.js                   # updateStreak(), date arithmetic, longestStreak
│   │   ├── quiz-loader.js              # Fetch /data/quizzes/{slug}.json, validateQuizData()
│   │   ├── quiz-flow.js                # openQuizPanel(), renderQuestion(), handleSubmit(), closeQuizPanel()
│   │   ├── certificate.js              # canIssueCertificate(), generateCertificate(), canvas composition (Stage 3)
│   │   ├── handoff-pills.js            # GA4 event: kh_pill_clicked on .hc-pill click
│   │   ├── reflection.js               # Fetch /data/reflections.json, day-of-year index, fallback
│   │   ├── scholar-expand.js           # Stage 4: accordion expand panels on scholar card click
│   │   ├── stats-countup.js            # Stage 4: IntersectionObserver + RAF counter for stats strip
│   │   ├── prereq-pills.js             # Stage 4: interactive prereq pill scroll + setTrack() call
│   │   ├── reveal.js                   # IntersectionObserver scroll reveal (shared)
│   │   ├── toast.js                    # showToast(msg, duration) utility (shared)
│   │   └── analytics.js                # GA4 custom events (10 KPI metrics)
│   └── locales/                        # i18n JSON files (Stage 4; shared with other pages)
├── public/
│   └── data/
│       ├── reflections.json            # Day-of-year keyed reflections (static schedule)
│       └── quizzes/
│           ├── foundations.json        # 12 lessons × 5 questions (citation required per question)
│           ├── seerah.json             # 8 lessons × 5 questions
│           ├── prayer.json             # 10 lessons × 5 questions
│           ├── history.json            # 8 lessons × 5 questions
│           ├── taharah.json            # 8 lessons × 5 questions
│           ├── fasting.json            # 6 lessons × 5 questions
│           ├── zakat.json              # 6 lessons × 5 questions
│           ├── scholars.json           # 8 lessons × 5 questions
│           ├── fiqh.json               # 10 lessons × 5 questions
│           └── classical.json          # 18 lessons × 5 questions
└── tests/
    ├── unit/
    │   ├── progress.test.ts
    │   ├── lesson-gating.test.ts
    │   ├── streak.test.ts
    │   ├── quiz-flow.test.ts
    │   ├── certificate.test.ts
    │   └── quiz-data-validation.test.ts
    └── e2e/
        ├── is-curriculum.spec.ts
        ├── track-selector.spec.ts
        ├── quiz-panel.spec.ts
        ├── return-detection.spec.ts
        ├── pathway-gating.spec.ts
        └── accessibility.spec.ts
```

---

## 13. TypeScript Interfaces

```typescript
// ── Curriculum Data ──────────────────────────────────────────────
type TrackSlug =
  | 'foundations' | 'seerah' | 'prayer' | 'history'
  | 'taharah' | 'fasting' | 'zakat' | 'scholars'
  | 'fiqh' | 'classical';

type PathwayLevel = 'beginner' | 'intermediate' | 'advanced';

interface Lesson {
  title: string;
  time: string;          // e.g. "11 min"
  tag: string;           // e.g. "Aqeedah"
  khUrl: string;         // e.g. "knowledge-hub.html?lesson=foundations-0"
}

interface Track {
  name: string;
  arabicName: string;
  pathway: PathwayLevel;
  prereqs: TrackSlug[];  // empty array = no prerequisites
  lessons: Lesson[];
}

type TracksMap = Record<TrackSlug, Track>;

// ── Lesson States ────────────────────────────────────────────────
type LessonState = 'done' | 'current' | 'read' | 'next' | 'locked';

// ── Progress Persistence ─────────────────────────────────────────
interface TrackProgress {
  done: number[];        // zero-based lesson indexes; sequential integrity enforced
  quizScores: number[];  // 0–100; index-aligned with done[]; highest score only
}

interface StreakData {
  count: number;
  lastDate: string;        // "YYYY-MM-DD"
  longestStreak: number;   // never decremented
}

interface IsProgress {
  tracks: Partial<Record<TrackSlug, TrackProgress>>;
  streak: StreakData;
  certificates: TrackSlug[];
}

// ── Return Detection ─────────────────────────────────────────────
interface IsVisitRecord {
  trackSlug: TrackSlug;
  lessonIndex: number;
  departedAt: number;    // Unix timestamp (ms)
}

// ── Quiz Data ────────────────────────────────────────────────────
interface QuizQuestion {
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  citation: string;      // MANDATORY — non-empty string referencing a classical source
}

interface LessonQuiz {
  lessonIndex: number;
  questions: [QuizQuestion, QuizQuestion, QuizQuestion, QuizQuestion, QuizQuestion]; // exactly 5
}

interface TrackQuizData {
  trackSlug: TrackSlug;
  lessons: LessonQuiz[];
}

// ── Quiz State ───────────────────────────────────────────────────
interface QuizSessionState {
  trackSlug: TrackSlug;
  lessonIndex: number;
  currentQuestion: number;   // 0–4
  answers: (0 | 1 | 2 | 3 | null)[];
  submitted: boolean;
  score?: number;            // 0–100, set after submit
}

// ── Pathway Cards ────────────────────────────────────────────────
interface PathwayCardConfig {
  level: PathwayLevel;
  title: string;
  description: string;
  trackSlugs: TrackSlug[];
  activeTrackSlug: TrackSlug;  // track whose stats appear on the card
  progressPercent: number;     // 0–100; track-level (FIX-1)
  isUnlocked: boolean;
}

// ── KH Handoff Pills ─────────────────────────────────────────────
interface KhClusterPill {
  name: string;
  icon: string;
  articleCount: number;
  href: string;            // "knowledge-hub.html#{anchor}"
}

// ── Scholar Cards ────────────────────────────────────────────────
interface Scholar {
  nameEnglish: string;
  initialsArabic: string;
  eraAH: string;           // e.g. "700–774 AH"
  fields: string;          // e.g. "Tafsir, History"
  avatarVariant: 'teal' | 'gold';
}

// ── Stage 4: Scholar Biography ──────────────────────────────────
interface ScholarBiography extends Scholar {
  arabicFullName: string;
  birthDeathCE: string;
  originCity: string;
  keyWorks: string[];     // 2–3 titles
  significance: string;   // 2-sentence summary
}

// ── Reflection ───────────────────────────────────────────────────
interface DailyReflection {
  arabicText: string;
  translation: string;
  reference: string;       // e.g. "Surah Al-Duha · 93:7–8"
  khUrl: string;
}

// ── Certificate ──────────────────────────────────────────────────
interface CertificateConfig {
  trackSlug: TrackSlug;
  trackName: string;
  trackArabicName: string;
  completionDate: string;  // "DD Month YYYY"
  userName?: string;       // undefined = "Learner"
}
```

---

## 14. Testing

### 14.1 Unit Tests

| Module | Key Test Cases |
|---|---|
| `progress.js` | `validateProgress()` rejects non-sequential `done[]`; clamps `quizScores` to 0–100; returns `defaultProgress()` on corrupt JSON; unknown track slugs ignored |
| `lesson-gating.js` | `getLessonState()` returns correct state for each scenario; `isPathwayUnlocked()` false when any prereq track incomplete or quizScores < 70; true only when all conditions met |
| `streak.js` | Increments on new day; does not increment twice same day; resets to 1 on skipped day; `longestStreak` never decremented; year-boundary date arithmetic correct |
| `quiz-flow.js` | Pass (4/5 correct) marks lesson done + unlocks next; fail (3/5) does not unlock; only highest score stored; score = 0 treated as fail; `citation` field checked before render |
| `certificate.js` | `canIssueCertificate()` returns false if any quiz score < 70; false if `done.length < total`; false if already in `certificates[]`; true only on 100% + all ≥70% |
| `quiz-data-validation.ts` | Rejects questions missing `citation`; rejects options array length ≠ 4; rejects `correct` outside 0–3 |

### 14.2 Integration Tests

- `setTrack('foundations')` → lesson list renders 12 items with correct states per `progress.tracks.foundations.done`
- Track switch during open quiz panel → panel closes, quiz state resets, new track renders
- Progress bar fill: `IntersectionObserver` fires → `.pw-fill` width matches `data-w`; reduced-motion → instant set
- Return detection: set `islamicinfo-is-visit` with `departedAt = 60s ago` → `visibilitychange` → lesson state changes to `ln-read`; `departedAt = 30min ago` → no change
- Pathway unlock: set all Beginner tracks complete → Intermediate card CTA changes from "Begin Path" (locked) to "Begin Path" (active); locked toast no longer fires
- "More ▾" open → click Fasting track → panel closes → lesson list renders 6 Fasting lessons → "More ▾" label changes to "Fasting ▾"

### 14.3 E2E Tests (Playwright)

| Scenario | Assertions |
|---|---|
| Default page load | SEO arch bar visible; pathways grid shows 3 cards; Beginner card shows "Continue Path"; Intermediate/Advanced show locked state; `data-theme="light"` on `<html>` |
| Dark mode | `data-theme="dark"` pre-set in `localStorage`; Bismillah gold gradient; pathway cards correct dark tokens; no theme flash |
| Track selector | Click "Prayer" tab → lesson list renders 10 items; active tab has teal bg |
| "More ▾" open/close | Click "More ▾" → panel opens with 6 tracks; Escape closes; focus returns to "More ▾" button |
| Locked lesson click | Click locked lesson item → toast "🔒 Complete Lesson N first to continue." → no navigation |
| Locked pathway click | Click Intermediate "Begin Path" → toast "🔒 Complete Beginner Path first to unlock this level." |
| "Read →" click | Click "Read →" on current lesson → `islamicinfo-is-visit` written to localStorage → URL navigates to KH |
| Return detection | Set `islamicinfo-is-visit` (60s ago) → trigger `visibilitychange` → lesson state changes to `ln-read`, CTA = "Take Quiz →"; `islamicinfo-is-visit` cleared |
| Quiz panel open | Click "Take Quiz · Lesson 1" → `.quiz-panel` expands below `.quiz-band`; first radio receives focus; Escape closes → focus returns to `.quiz-btn` |
| Quiz pass | Answer 4/5 correctly → score screen "4/5 · 80%"; click Continue → lesson `ln-done`; next lesson `ln-current`; progress footer updates |
| Quiz fail | Answer 2/5 correctly → "Good effort — re-read the lesson and try again."; lesson stays `ln-current`; retry available |
| Progress persistence | Complete 3 lessons → reload → lesson states preserved; pathway bar at 25%; progress footer correct |
| Certificate gate | Set all 12 foundations lessons in `done[]` + `quizScores` all ≥70% → track card shows "🏆 Certificate earned" |
| KH cluster pill | Click "The Five Pillars" pill → navigate to `knowledge-hub.html#pillars`; GA4 event `kh_pill_clicked` fired |
| Mobile 640px | Pathway cards stack single column; "More ▾" panel is full-width bottom-anchored; touch targets ≥ 44px |
| Reduced motion | OS `prefers-reduced-motion: reduce` → progress bars have `transition: none`; 3D tilt disabled; quiz panel appears instantly |
| `localStorage` quota | Mock `QuotaExceededError` → toast "Storage full — your progress may not be saved." → existing progress preserved |

### 14.4 Content Audit Tests (Pre-Deploy)

- All 10 `/data/quizzes/{slug}.json` files: every question has non-empty `citation` field
- All 6 scholar cards match exactly the frozen list in §2.11
- All 8 KH cluster pills have correct `href` anchors; anchors validated against deployed KH page
- Advanced pathway card shows "18 lessons · ~12h" (not 36) in MVP
- Frozen hero copy unchanged: H1, Arabic hadith, source citation, subtitle, SEO bar labels, stats strip values

### 14.5 Accessibility Audit (axe-core, CI)

- Zero violations WCAG 2.1 AA on page load
- `.lts-more-panel` has `role="listbox"`; items have `role="option"`
- Quiz panel `<fieldset>` + `<legend>` per question; `aria-live="polite"` announces score
- `.lts-btn` have `aria-label` including track name
- `role="status"` on `#toast` element
- Manual keyboard: Tab through all interactive elements; Escape closes toast, quiz panel, "More ▾", mobile menu

### 14.6 Lighthouse CI Budget

```json
{
  "performance": 90,
  "accessibility": 90,
  "best-practices": 90,
  "seo": 90,
  "budgets": [
    { "resourceType": "script", "budget": 51200 },
    { "resourceType": "total", "budget": 500000 }
  ]
}
```

Run against `/islamic-studies.html` on default load (Foundations track, Beginner pathway 25% progress).

---

*End of IslamicInfo Islamic Studies Technical Specification*
*Ref: `islamic_studies_optionB.html` · `CLAUDE_v3.md v3.0` · PRD v1.1 · Functional Document v1.0*
