# SKILL: islamicinfo-brand
**Read this file before writing any code, content, or documentation for any IslamicInfo product.**
*Version 1.0 · 2026-05-20 · Applies to all 10 IslamicInfo.org pages + all sub-brand products*

---

## What This Skill Does

This skill gives Claude the complete IslamicInfo brand, design system, and platform architecture in a single read. It replaces the need to re-upload CLAUDE.md, PRDs, or brand docs in new sessions.

**Source documents this skill is derived from:**
- `CLAUDE.md v3.0` — locked design system (held in project memory)
- `ISLAMICINFO_BRAND_IDENTITY.md v1.0` — umbrella brand rules
- PRDs v1.1 for all 10 pages: Home, Quran Explorer, Hadith Library, Islamic Studies, Knowledge Hub, Daily Duas, Tools, Habit Tracker, Verify, About
- Technical Specification Docs for: Tools, Habit Tracker, Verify, About pages

---

## 1. Platform Overview

**IslamicInfo.org** is a 10-page Islamic knowledge platform. It is the parent brand in an umbrella of Islamic digital products.

**The three pillars — every decision is checked against these:**
1. **Authentic** — every claim traces to a primary source; grades always shown
2. **Accessible** — free, no ads, no paywalls, works on every device
3. **Honest** — we show weakness; we never issue fatwas; we correct errors publicly

**Hard constraints that never change:**
- No fatwas. No rulings. No halal/haram verdicts. Ever.
- No advertising anywhere, on any product
- Disclaimer text is hard-coded — never replaced by API output
- `hello@islamicinfo.org` must reach a monitored inbox
- Design system is **locked** — no new colors, no new fonts, no raw hex inline

---

## 2. The 10-Page Navigation — Exact Order, Exact hrefs

This nav is identical across all 10 pages. Never reorder. Never omit.

| # | Label | href | File |
|---|---|---|---|
| 1 | Home | `index.html` | `index.html` |
| 2 | Quran Explorer | `quran.html` | `quran.html` |
| 3 | Hadith Library | `hadith.html` | `hadith.html` |
| 4 | Islamic Studies | `islamic-studies.html` | `islamic-studies.html` |
| 5 | Knowledge Hub | `knowledge-hub.html` | `knowledge-hub.html` |
| 6 | Daily Duas | `dua.html` | `dua.html` |
| 7 | Tools | `tools.html` | `tools.html` |
| 8 | Habit Tracker | `habits.html` | `habits.html` |
| 9 | Verify | `verify.html` | `verify.html` |
| 10 | About | `about.html` | `about.html` |

**Active page** → `class="nav-link active"` — teal-700 text, weight 500, 2px teal→gold gradient underline via `::after`.

**⚠️ Critical href rules — violations are bugs:**

| Rule | Correct | BANNED |
|---|---|---|
| Islamic Studies | `islamic-studies.html` | `learn.html` |
| Knowledge Hub | Always at nav position 5 | Omitting it |
| QuranlyAI domain | `quranlyai.com` | `quranlya.com` (missing `i`) |
| LearnSpeakAI casing | `LearnSpeakAI` | `LearnSpeakAi` / `Learnspeakai` |
| Footer CSS | `ft-` class system | `ii-footer-*` (legacy) |
| Methodology link | `about.html#methodology` | `about.html` (bare) |

---

## 3. Global Header — Identical on Every Page

```
[Logo] | [10 nav links, 12.5px Inter] | [Search] [EN] [Theme] [Admin] [Hamburger≤760px]
```

- Height: `60px`. `position:sticky; top:0; z-index:100`
- Light: `rgba(250,251,251,.92); backdrop-filter:blur(24px) saturate(1.6)`
- Dark: `rgba(10,19,20,.92); border-bottom:rgba(0,105,110,.2)`
- `.scrolled` class at `scrollY > 16px` → `box-shadow: 0 1px 0 rgba(0,105,110,.10), var(--elev-1)`
- **Hamburger** — visible only ≤ 760px — `onclick="openMM()"` — 3 `<span>` bars
- **Search popup** — `id="searchPopup"`, 340px, `top:44px; right:0` — auto-focus input after 50ms, close on Escape/outside
- **Theme toggle** — `id="themeBtn"` — persists to `localStorage` key `islamicinfo-theme`

---

## 4. Mobile Menu — `#mobileMenu`

Placed immediately after `</header>`. Full-screen overlay.

```js
function openMM()  { document.getElementById('mobileMenu').classList.add('open'); }
function closeMM() { document.getElementById('mobileMenu').classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMM(); });
```

- Background: `rgba(6,38,40,.97); backdrop-filter:blur(20px)`
- `mmFade` animation on open: `opacity 0→1 + translateX(20px)→0`, 0.3s
- All 10 nav links, correct hrefs, active page = `.mm-link.active`

---

## 5. Design System Tokens — Core (CLAUDE.md v3.0)

Never use raw hex inline. Always use these tokens. Dark mode is a **sibling** `[data-theme="dark"]` block — never merged with `:root`.

### Colors
```css
--teal-50:  #F0FAFA    --teal-100: #DCEFF0
--teal-300: #5BC1C7    --teal-500: #2CA4AB
--teal-700: #00696E    --teal-900: #0A3A3D

--gold-300: #E8CE89    --gold-500: #C5A059
--gold-700: #9A7C3F

--grade-sahih: #0F6E56  /* content pages only */
--grade-hasan: #5D8A3A  /* content pages only */
--grade-daif:  #A86932  /* content pages only */
--grade-mawdu: #B33A3A  /* content pages only */

--ink-primary: #0F2A2C  --ink-muted:  #6D797A
--ink-subtle:  #9DA8A9  --ink-faint:  #C4CCCC

--white:        #FFFFFF   --surface-card: #FAFBFB
--surface-alt:  #F3F5F5
```

### Typography
```css
--font-display: 'Cormorant Garamond'  /* H1, stats, logo */
--font-body:    'Inter'               /* nav, buttons, labels, UI */
--font-arabic:  'Amiri'              /* ALL Arabic text */
--font-serif:   'Cormorant Garamond' /* prose, summaries, translations */
```

**Font import (required, this exact order):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

### Easing
```css
--ease-reverent: cubic-bezier(.22,1,.36,1)   /* card hover, entrance */
--ease-premium:  cubic-bezier(.25,.46,.45,.94) /* nav, buttons */
```

### Elevation
```css
--elev-1: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)
--elev-2: 0 4px 6px rgba(0,0,0,.05), 0 2px 4px rgba(0,0,0,.06)
--elev-3: 0 10px 15px rgba(0,0,0,.04), 0 4px 6px rgba(0,0,0,.05)
```

### Border Radii
```css
--r-sm: 8px   --r-md: 12px   --r-lg: 16px
--r-xl: 20px  --r-2xl: 24px  --r-full: 9999px
```

---

## 6. Hero Section — Universal Structure

Every page hero follows this exact order inside `.hero-inner`:

```html
<!-- 1. Bismillah — ALWAYS first -->
<div class="bismillah-hero-top">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

<!-- 2. Eyebrow badge -->
<div class="hero-badge"><span class="badge-dot"></span> Page Eyebrow Text</div>

<!-- 3. H1 — Cormorant, clamp(44px–82px), with gradient italic span -->
<h1 class="hero-title">Plain text <span class="grad-it">italic gradient</span></h1>

<!-- 4. Sub-text -->
<p class="hero-sub">...</p>

<!-- 5. CTA row — btn-primary + btn-ghost -->
<div class="hero-btns">
  <a href="..." class="btn-primary">Primary CTA</a>
  <a href="..." class="btn-ghost">Secondary CTA</a>
</div>

<!-- 6. Arabic verse (some pages) -->
<div class="hero-arabic" style="direction:rtl">...</div>
```

**Bismillah colors — non-negotiable:**
- Light: `linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%)` clip-text, opacity 0.92
- Dark: `linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%)` + `filter:drop-shadow(0 0 14px rgba(217,179,88,.55))`

**Floating geo decorators:** 4 `.geo` SVGs with `floatG` animation (`translateY(0→-14px)`, 24s). Colors: `#00696E` and `#C5A059`.

---

## 7. Card System — Universal Rules

```css
/* Card hover — IDENTICAL on every page, every product */
.card:hover {
  transform: translateY(-5px) scale(1.012);
  box-shadow: 0 16px 40px rgba(0,105,110,.13),
              0 4px 12px rgba(0,105,110,.08),
              0 0 0 1px rgba(0,105,110,.07);
  border-color: rgba(0,105,110,.2);
  transition: all 0.38s var(--ease-reverent);
}
```

**⚠️ BANNED — no exceptions anywhere:**
```css
/* NEVER — violates CLAUDE.md §27.4 */
.card::after { animation: shimmer ...; left: -100%; }
.card:hover::after { left: 150%; }
```

---

## 8. Button System

```css
.btn-primary     /* teal gradient, white text, primary CTA */
.btn-ghost       /* teal-tinted transparent, teal border */
.btn-white-ghost /* white transparent, white border — on dark backgrounds */
.btn-gold        /* gold gradient — CTA sections */
.btn-side        /* transparent, faint border — action bar secondary */
```

All buttons: hover `translateY(-2px) scale(1.04)`, `transition: 0.3s var(--ease-premium)`.

---

## 9. Scroll Reveal System

```js
// General reveal — threshold 0.08 — fires on all .reveal elements
const _ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); _ro.unobserve(e.target); }
  });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => _ro.observe(el));
```

**Stagger delay classes:**
- `.reveal-d1` +0.12s · `.reveal-d2` +0.22s · `.reveal-d3` +0.32s · `.reveal-d4` +0.42s · `.reveal-d5` +0.52s

Base state: `opacity:0; transform:translateY(28px)`. `.in` state: `opacity:1; transform:none`.

---

## 10. Theme System

```js
// Run INLINE in <head> before first paint — prevents FOUC
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('islamicinfo-theme', t); } catch(e) {}
  document.getElementById('themeBtn').innerHTML = t === 'dark' ? sunSVG : moonSVG;
}
applyTheme(localStorage.getItem('islamicinfo-theme') || 'light');
```

---

## 11. Footer System — `ft-` CSS Classes

**5-column grid:** `2fr 1fr 1fr 1fr 1fr`. Responsive: 3-col ≤1100px · 2-col ≤700px (brand full-width) · 1-col ≤440px.

| Col | Class | Content |
|---|---|---|
| 1 (2fr) | `ft-brand` | Logo + tagline + Arabic verse (Hud 11:88) |
| 2 | `ft-col` | **Page-specific links** (heading = page name) |
| 3 | `ft-col` | **Quick Access** — all 8 nav destinations |
| 4 | `ft-col` | **Our Ecosystem** — 4 external products |
| 5 | `ft-col` | **Company / Legal** |

**Quick Access (col 3) — all 8 always required:**
```
Quran Explorer → quran.html
Hadith Library → hadith.html
Islamic Studies → islamic-studies.html
Knowledge Hub → knowledge-hub.html   ← NEVER omit
Daily Duas → dua.html
Islamic Tools → tools.html
Habit Tracker → habits.html
Verify a Claim → verify.html
```

**Ecosystem (col 4) — exact format:**
```html
<a href="https://quranlyai.com"     target="_blank" rel="noopener">QuranlyAI ↗</a>
<a href="https://mosquefinder.net"  target="_blank" rel="noopener">MosqueFinder ↗</a>
<a href="https://travellyai.com"    target="_blank" rel="noopener">TravellyAI ↗</a>
<a href="https://learnspeakai.com"  target="_blank" rel="noopener">LearnSpeakAI ↗</a>
```

**Bottom bar:**
- Left: `© 2026 Islamicinfo.org — No ads. No fatwas. No fabricated sources.`
- Right (italic): `All content source-verified · Privacy-first · Built with sincerity`

**Footer link hover:** `translateX(4px)` + `border-left-color: var(--teal-500)`.

---

## 12. Arabic Text Rules — Universal

```css
/* Always applied to any Arabic text element */
font-family: var(--font-arabic);  /* Amiri — no substitution */
direction: rtl;
text-align: right;
/* Minimum size: 18px. Display size: clamp(18px, 3vw, 28px) */
```

Arabic numerals for ordered lists/steps: `١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ١٠`

---

## 13. localStorage Key Registry — All Pages

All keys are prefixed to avoid collisions across products.

| Key | Type | Set by | Purpose |
|---|---|---|---|
| `islamicinfo-theme` | `'light'\|'dark'` | All pages | Theme — shared across entire domain |
| `islamicinfo-lang` | string | Global selector | Language preference (future) |
| `islamicinfo-prayer-{city}-{date}` | JSON | Tools | Cached prayer times |
| `islamicinfo-prayer-city` | string | Tools | Last used prayer city |
| `islamicinfo-prayer-method` | string | Tools | Last calculation method |
| `islamicinfo-nisab-{date}` | JSON | Tools | Cached nisab/gold price |
| `islamicinfo-qibla-city` | string | Tools | Last Qibla city |
| `islamicinfo-is-progress` | JSON | Islamic Studies | Full curriculum progress, streaks, quiz scores, certificates |
| `islamicinfo-is-visit` | JSON | Islamic Studies | Return-detection: `{trackSlug, lessonIndex, departedAt}` |
| `ii-habits` | JSON | Habit Tracker | Full habit state — prayers, Qur'an, fasting, Sunnah, streak, history |
| `ii-quran-translation` | string | Quran Explorer | Last selected translation edition |
| `ii-quran-reading-mode` | boolean | Quran Explorer | Reading mode active state |
| `islamicinfo-hadith-last-read` | JSON | Hadith Library | `{collectionSlug, bookNum, hadithNum}` |
| `islamicinfo-hadith-bookmarks` | JSON array | Hadith Library | Saved hadith bookmarks |
| `islamicinfo-hadith-notes` | JSON array | Hadith Library | User notes on hadith |
| `tasbeeh-session-{date}` | JSON | Tools/Tasbeeh | Daily dhikr totals |
| `fasting-{month-year}` | JSON | Tools/Fasting | Fasted days for month |
| `sadaqah-ledger` | JSON array | Tools/Sadaqah | Sadaqah log entries |
| `sadaqah-goal` | number | Tools/Sadaqah | Monthly sadaqah goal |

---

## 14. Page Directory — Blueprints, Active Nav, Footer Col 2

| Page | File | Blueprint | Nav active | Footer col 2 heading | Unique page sections |
|---|---|---|---|---|---|
| Home | `index.html` | `home_fixed.html` | `Home` | `Featured` | Daily verse widget, prayer times strip, feature cards, live search |
| Quran Explorer | `quran.html` | `quran_v5.html` | `Quran Explorer` | `Quran` | Surah reader, word-by-word, AI explain panel, audio player, bookmarks, share modal, study mode |
| Hadith Library | `hadith.html` | `hadith_module_enhanced__1_.html` | `Hadith Library` | `Hadith` | 3-tier nav (collections → books → hadith), trace layout, grade filters, AI explanation, audio, bookmarks |
| Islamic Studies | `islamic-studies.html` | `islamic_studies_optionB.html` | `Islamic Studies` | `Curriculum` | Learning pathways, lesson sequence, quiz panel, progress bars, return-detection, IS↔KH handoff |
| Knowledge Hub | `knowledge-hub.html` | `knowledge-hub.html` | `Knowledge Hub` | `Knowledge Hub` | 8-cluster grid, trending ticker, scholar spotlight, email capture, sub-pages: `/search.html`, `/articles/{slug}.html`, `/cluster/{slug}.html` |
| Daily Duas | `dua.html` | `dua.html` | `Daily Duas` | `Daily Duas` | Dua cards with Arabic/translation/source, category filters, audio |
| Tools | `tools.html` | `tools.html` | `Tools` | `Tools` | 12 tools across 4 categories, prayer widget, Qibla compass, Hijri calendar, Zakat calc, Tasbeeh, fasting tracker, name finder, age calc, sadaqah tracker |
| Habit Tracker | `habits.html` | `habits.html` | `Habit Tracker` | `Habit Tracker` | 5 tabs (Prayers/Quran/Adhkar/Fasting/Sunnah), Sunnah Score ring, 28-day heatmap, week strip, streak counter |
| Verify | `verify.html` | `verify__1_.html` | `Verify` | `Verify` | Verify box (4 modes), confidence dial SVG, narration chain, 4 evidence cards, scholar consensus bars |
| About | `about.html` | `about_v3.html` | `About` | `About` | Stats counter animation, methodology timeline, scholars grid, source pills, mission quote card |

---

## 15. Page-Specific localStorage Patterns

### Habit Tracker (`ii-habits`) — complete shape:
```json
{
  "dateKey": "YYYY-MM-DD",
  "prayers": [false, false, false, false, false],
  "sunnahPrayers": { "Qiyam": false, "Duha": false, "Witr": false, "Tahajjud": false },
  "quranPages": 0, "quranGoal": 5,
  "duaChecked": [false, false, false, false, false, false],
  "fastingDays": { "YYYY-MM-DD": true },
  "sunnahItems": [false, false, false, false, false, false],
  "streak": 0, "longestStreak": 0,
  "history": { "YYYY-MM-DD": { "prayers": 5, "score": 88, "quranPages": 3 } }
}
```
Daily-reset fields: `prayers, sunnahPrayers, duaChecked, sunnahItems, quranPages, dateKey`.
Persistent: `quranGoal, fastingDays, streak, longestStreak, history`.

### Islamic Studies (`islamicinfo-is-progress`) — complete shape:
```json
{
  "[trackSlug]": { "done": [0, 1, 2], "quizScores": [92, 88, 85] },
  "streak": { "count": 14, "lastDate": "YYYY-MM-DD", "longestStreak": 21 },
  "certificates": ["aqeedah", "taharah"]
}
```

### Return-detection (`islamicinfo-is-visit`):
```json
{ "trackSlug": "aqeedah", "lessonIndex": 2, "departedAt": 1716120000000 }
```
Cleared when `visibilitychange` fires and `departedAt` < 30 min ago.

---

## 16. Critical Component Specs

### Confidence Dial (Verify page — `#dialArc`)
```js
// stroke-dasharray: 478; offset = 478 - (478 * pct/100)
// 80% → offset 96; 0% → offset 478; 100% → offset 0
function animateDial(targetPct) {
  const arc = document.getElementById('dialArc');
  arc.style.strokeDashoffset = 478 - (478 * targetPct / 100);
  // rAF counter for displayed %
}
// Fires: 600ms after page load (animateDial(80)) + on each verification
```

### Stat Counter (About, Home, others)
```js
function animateCount(el, target, suffix, useComma, duration) {
  if (target === 0) { el.textContent = '0'; return; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  // rAF loop, 2800ms, toLocaleString when useComma=true, final snap
}
// One-time guard: statsAnimated boolean + statsObserver.disconnect()
```

### Sunnah Score Formula (Habit Tracker)
```js
function calcScore(s) {
  return Math.round(
    (s.prayers.filter(Boolean).length / 5)           * 50 +
    Math.min(s.quranPages / (s.quranGoal || 5), 1)   * 20 +
    (s.duaChecked.filter(Boolean).length / 6)         * 15 +
    (s.sunnahItems.filter(Boolean).length / 6)        * 15
  );
}
```

### FAQ Accordion (About, Verify, Knowledge Hub, Islamic Studies)
```js
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});
// .faq-a: max-height 0→300px, 0.4s ease-reverent
// .faq-chevron: rotate(0→180deg), 0.3s ease-reverent
```

### Verify `runVerify()` — production swap point
```js
// v1: setTimeout(2200) simulation
// Production: replace with:
fetch('/api/verify', { method:'POST', body: JSON.stringify({query, mode}) })
  .then(r => r.json())
  .then(data => populateResults(data))
  .catch(err => showErrorBanner(err));
// Guard: if (ta.value.trim() === '') return;
// Guard: if (btn.classList.contains('loading')) return; // add in production
```

### Islamic Studies — Quiz panel
```js
// Pass: score >= 70% (≥4/5 correct)
// Fail: score < 70% — retry immediately, no cooldown
// localStorage update on pass: progress[trackSlug].done.push(lessonIndex)
// Pathway unlock: all lessons in ALL beginner tracks done + quizScores >= 70%
```

---

## 17. APIs Reference

| Page | API | Endpoint | Cache key | Fallback |
|---|---|---|---|---|
| Tools (prayer) | AlAdhan | `GET https://api.aladhan.com/v1/timingsByCity` | `islamicinfo-prayer-{city}-{date}` | Show cached times or dashes |
| Tools (nisab) | Gold price (metals-api.com) | Proxied `/api/nisab` | `islamicinfo-nisab-{date}` | Hardcoded `$6,180` |
| Tools (geocode) | BigDataCloud | `GET https://api.bigdatacloud.net/data/reverse-geocode-client` | None (free, keyless) | `'Near your location'` |
| Verify | IslamicInfo corpus | `POST /api/verify` | None | 2200ms simulation in v1 |
| Quran Explorer | api.quran.com | `/v4/verses/by_chapter/{id}` | Per surah + translation | Static fallback content |
| Hadith Library | Sunnah.com API | `/v1/collections/{c}/books/{b}/hadiths` | 24h per request | Cached last response |
| Home (verse of day) | api.quran.com | Random verse endpoint | `localStorage` daily | Static hardcoded verse |
| Knowledge Hub (email) | `/api/subscribe` | POST `{email}` | None | Show error state inline |
| Islamic Studies (AI) | Anthropic API | `POST /api/ask-claude` | None (conversational) | "AI unavailable" state |

**All external API keys live server-side in env vars. Never in client-side JS.**

---

## 18. Sub-Brand Products

| Product | Domain | Type | Design relation | Accent color |
|---|---|---|---|---|
| **IslamicInfo** | `islamicinfo.org` | Parent | — | Pure teal/gold |
| **QuranlyAI** | `quranlyai.com` | Core | Inherits full system | Teal (no addition) |
| **MosqueFinder** | `mosquefinder.net` | Adjacent | Inherits, adds accent | `--mosque-blue: #1A6B9E` |
| **TravellyAI** | `travellyai.com` | Adjacent | Inherits, adds accent | `--travel-sand: #B8935A` |
| **LearnSpeakAI** | `learnspeakai.com` | Extended | Inherits typography | `--learn-violet: #5B4BAF` |

**Grade colors** (`--grade-sahih/hasan/daif/mawdu`) are **only used** on IslamicInfo.org and QuranlyAI. Never on MosqueFinder, TravellyAI, or LearnSpeakAI.

---

## 19. The Forbidden List — Instant Fail

If any of these appear in code or content, they are bugs. No exceptions.

| Forbidden | Reason |
|---|---|
| `href="learn.html"` | Wrong href — always `islamic-studies.html` |
| `quranlya.com` | Missing `i` — always `quranlyai.com` |
| `LearnSpeakAi` / `Learnspeakai` | Wrong casing — always `LearnSpeakAI` |
| `ii-footer-*` CSS classes | Legacy — always `ft-` system |
| `.card::after { animation: shimmer }` | CLAUDE.md §27.4 — absolutely banned |
| Raw hex inline (not in SVG `<defs>`) | Breaks dark mode — use tokens |
| `[data-theme="dark"]` inside `:root` | Breaks dark mode — must be sibling |
| Omitting `knowledge-hub.html` from nav | Required at position 5 |
| Fatwa language | No rulings, no permissible/forbidden |
| Grade colors on non-content products | `--grade-*` for IslamicInfo/QuranlyAI only |
| AI-issued ruling in Verify or any AI panel | Hard editorial constraint |
| Replacing the disclaimer with API output | Disclaimer is always hard-coded HTML |
| `href="about.html"` for methodology link | Must be `about.html#methodology` |
| New font families | 3 fonts only: Cormorant Garamond, Inter, Amiri |
| `contact.html` before it's built | 404 risk — use `mailto:` until page exists |

---

## 20. Pre-Build Checklist — Any New Page or Product

Run before writing any code:

- [ ] CLAUDE.md v3.0 tokens imported — no modifications
- [ ] Three fonts preconnected and loaded in exact order
- [ ] `applyTheme()` runs inline in `<head>` before first paint
- [ ] `[data-theme="dark"]` is a sibling to `:root` — never merged
- [ ] 10 nav links in exact order; correct page has `.active`
- [ ] Hamburger button present; `#mobileMenu` overlay with all links
- [ ] Bismillah is first element inside `.hero-inner`
- [ ] No shimmer `::after` on any card
- [ ] All card hover uses `translateY(-5px) scale(1.012)` + teal glow
- [ ] Footer uses `ft-` classes; all 8 Quick Access links; Ecosystem 4 correct domains
- [ ] `islamicinfo-theme` is the localStorage theme key
- [ ] Arabic text: Amiri font, `direction:rtl`, `text-align:right`
- [ ] No fatwa language anywhere
- [ ] No raw hex inline (except SVG `<defs>`)
- [ ] `knowledge-hub.html` never omitted from nav or footer
- [ ] `islamic-studies.html` never written as `learn.html`
- [ ] `quranlyai.com` spelled with both `i` letters
- [ ] `LearnSpeakAI` in exact casing

---

*End of SKILL: islamicinfo-brand v1.0*
*Source: CLAUDE.md v3.0 + Brand Identity Doc v1.0 + PRDs v1.1 (all 10 pages) + Tech Specs (Tools, Habits, Verify, About)*
*Next update: when a new page PRD is approved or sub-brand is added*
