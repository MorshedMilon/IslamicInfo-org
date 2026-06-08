# About Page — Technical Document
**`about.html` · IslamicInfo.org · Identity, Mission & Trust Engine**
*v1.0 · 2026-05-20 · Based on PRD v1.1 + Functional Doc v1.0 + CLAUDE.md v3.0*

---

## 1. Purpose

`about.html` is IslamicInfo's editorial trust page — nav position 10 (final item). It answers the question *"Can I trust this platform?"* for every new visitor.

**What it does:**
- States the founding mission across four paragraphs of editorial prose
- Lists six non-negotiable editorial rules enforced platform-wide
- Shows a 4-step content verification methodology with a vertical timeline
- Grounds authority in four named classical scholars with biographies
- Lists all eight primary hadith source collections
- Answers five common trust questions via a collapsible FAQ accordion
- Provides a direct `mailto:` contact for corrections

**What it is not:** A product feature page. No interactive tools, no live data, no user authentication, no `localStorage` state (except the shared `islamicinfo-theme` key).

**Core constraints:**
- "We do not issue fatwas" must appear in both Rule Card 3 and FAQ Q2 — verbatim
- Stat numbers (`6236 / 12000 / 300 / 0`) must be verified accurate at build time
- `hello@islamicinfo.org` must reach a monitored inbox in production
- Design system locked to CLAUDE.md v3.0 — no deviations

**Known gaps in `about_v3.html` (required before production):**
1. 🔴 Hamburger button + `#mobileMenu` overlay missing
2. 🔴 Footer uses legacy `ii-footer-*` CSS classes — must migrate to `ft-` system
3. 🟠 Footer "Methodology" link uses bare `about.html` — must be `about.html#methodology`
4. 🟠 `contact.html` and `team.html` don't exist yet

---

## 2. UI Components

Design system locked to CLAUDE.md v3.0. All tokens, card hover rules, no-shimmer rule apply verbatim.

### 2.1 Global Shell
Standard across all pages: `.ambient` glow, `.shell` wrapper, `.site-header` (60px sticky), `#mobileMenu` overlay (gap — must be added).

### 2.2 Hero Section
`min-height:72vh`. `.hero-inner` max-width `800px`, centered.

**Element order inside `.hero-inner`:**
1. Bismillah — `.bismillah-hero-top` — teal gradient (light) / gold + drop-shadow (dark)
2. Eyebrow — `.hero-badge` + `.badge-dot` pulse — *"Our Mission"*
3. `<h1 class="hero-title">` — Cormorant `clamp(46px,8.5vw,82px)`:
   ```html
   Knowledge Without<br><span class="gradient-italic">Compromise</span>
   ```
   `<br>` is required. Each word wrapped in `.hero-title-word.hwN` (`.hw1`–`.hw6`) for `heroWordIn` stagger.
4. Sub-text — `.hero-sub`
5. CTA row — `.btn-primary` → `#methodology` · `.btn-ghost` → `#sources`
6. Arabic verse — `.hero-arabic` — `وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ` — Amiri, RTL, teal-700, opacity 0.6, `fadeUp 0.7s delay 0.15s`

**Four floating decorators:**

| Class | Position | Shape | Color | Size | Opacity |
|---|---|---|---|---|---|
| `.g1` | top:8%; left:4% | Star + circle | `#00696E` | 80×80px | 0.05 |
| `.g2` | top:60%; left:3% | Rotated square | `#C5A059` | 44×44px | 0.04 |
| `.g3` | top:10%; right:6% | Star | `#00696E` | 60×60px | 0.05 |
| `.g4` | bottom:10%; right:10% | Rotated star | `#8A7036` | 38×38px | 0.04 |

All use `floatG` animation (`translateY(0 → -14px)`, 24s ease-in-out infinite).

### 2.3 Stats Banner (`.stats-banner`)
Full-width, no container constraint. `grid-template-columns:repeat(4,1fr)`, gap 24px. Background: `linear-gradient(135deg,var(--teal-900),#062628)`. `::before` pulsing teal orb (`orbPulse`, 6s alternate). Collapses to 2×2 at ≤ 700px.

| # | `data-target` | `data-suffix` | `data-comma` | Label |
|---|---|---|---|---|
| 1 | `6236` | `""` | `"true"` | `Qur'an Verses` |
| 2 | `12000` | `"+"` | `"true"` | `Hadith Records` |
| 3 | `300` | `"+"` | `"false"` | `Verified Duas` |
| 4 | `0` | `""` | `"false"` | `Ads. Fatwas. Opinions.` |

`.stat-num`: `var(--font-display)`, `clamp(32px,5vw,52px)`, white. `.stat-label`: 11px uppercase, `rgba(255,255,255,.4)`.
Stat items have stagger reveal classes: `reveal` / `reveal-d1` / `reveal-d2` / `reveal-d3`.

### 2.4 Mission Section (`.section.mission-section`)
`.mission-grid`: `1.2fr 1fr`, collapses to 1-col at ≤ 820px.

**Left — four paragraphs with `.reveal`:**
- `.mission-lead`: Cormorant `clamp(20px,2.8vw,26px)`, weight 500, `var(--ink-primary)`
- `.mission-body` ×3: 15px, 1.78 line-height, `var(--ink-muted)`

**Right — mission quote card:**
```html
<div class="reveal reveal-d1">         <!-- outer: gets reveal -->
  <div class="mission-quote-card">     <!-- inner: gets style -->
    <div class="mqc-arabic">...</div>
    <p class="mqc-quote">English translation</p>
    <div class="mqc-ref">Hud · 11:88</div>
    <div class="mqc-divider">
      <div class="mqc-line"></div>
      <span class="mqc-star">✦</span>
      <div class="mqc-line"></div>
    </div>
    <p class="mqc-quote">Platform north-star statement</p>
  </div>
</div>
```
Card bg: `linear-gradient(135deg,rgba(0,105,110,.08),rgba(197,160,89,.06))`. Border: `0.5px solid rgba(0,105,110,.15)`. `border-radius:20px`. Padding: `28px`.

### 2.5 Non-Negotiable Rules Section (`background:var(--surface-card)`)
`.principles-grid`: `repeat(auto-fill,minmax(280px,1fr))`, gap 20px. Stagger resets at row 2:

| # | Classes | Icon | Icon class | Title |
|---|---|---|---|---|
| 1 | `.reveal` | 📚 | `.rr-teal` | Every Hadith Must Have a Source |
| 2 | `.reveal.reveal-d1` | ⭐ | `.rr-gold` | Authenticity Grades Are Shown |
| 3 | `.reveal.reveal-d2` | 🚫 | `.rr-red` | No Fatwas. Ever. |
| 4 | `.reveal` (reset) | 🔒 | `.rr-teal` | No Ads. No Sponsors. |
| 5 | `.reveal.reveal-d1` | 🤝 | `.rr-gold` | No Sectarian Bias |
| 6 | `.reveal.reveal-d2` | 🌐 | `.rr-teal` | Always Free |

Icon container: `.rr-icon` 44×44px, `border-radius:14px`. Colors: `.rr-teal` `rgba(0,105,110,.10)`, `.rr-gold` `rgba(197,160,89,.10)`, `.rr-red` `rgba(179,58,58,.08)`.

Each card has `.rule-row` (flex, gap 16px) → `.rr-icon` + content (`.rr-title` + `.rr-desc`). Entrance via `ruleIn` keyframe, `ruleObs` per card.

### 2.6 Methodology Section (`id="methodology"`)
`.method-steps`: flex column, gap 0. Four `.method-step.reveal` with stagger (none/d1/d2/d3).

Each step: `grid-template-columns:56px 1fr; gap:24px; padding:28px 0`. Bottom border `0.5px solid rgba(0,105,110,.1)` — **last step has no border**.

**Left `.ms-left`:** `.ms-num` (44×44px teal circle, Arabic numeral `١٢٣٤`) + `.ms-line` (1.5px gradient connector).

**Right `.ms-content`:** `.ms-title` (Cormorant 18px) + `.ms-desc` (13.5px, `var(--ink-muted)`).

**Dual-observer pattern:** each step participates in both `_ro` (`.in` via `.reveal`) and `methodObs` (`.in-view` via `stepSlideIn`). Both must fire.

### 2.7 Scholars Section (`background:var(--surface-card)`)
`.scholars-grid`: `repeat(auto-fill,minmax(220px,1fr))`, gap 20px. Four `.card.scholar-card.reveal` with stagger (none/d1/d2/d3).

Card anatomy: `.scholar-avatar` (72×72px teal circle, Arabic initial) → `.scholar-name` (Cormorant 17px) → `.scholar-era` (11px, gold-700) → `.scholar-desc` (12.5px) → `.scholar-badge`.

| # | Initial | Name | Era | Badge |
|---|---|---|---|---|
| 1 | `خ` | Imam al-Bukhārī | 194–256 AH | `.sb-hadith` |
| 2 | `م` | Imam Muslim | 204–261 AH | `.sb-hadith` |
| 3 | `ن` | Imam al-Nawawī | 631–676 AH | `.sb-classical` |
| 4 | `ا` | Sheikh al-Albānī | 1914–1999 | `.sb-hadith` |

`.sb-hadith`: teal-700 text, `rgba(0,105,110,.08)` bg. `.sb-classical`: gold-700 text, `rgba(197,160,89,.08)` bg.

### 2.8 Trusted Sources Section (`id="sources"`)
`.sources-grid.reveal`: flex, flex-wrap, gap 10px. Eight `.source-pill` elements.

| # | Icon | Name | Type |
|---|---|---|---|
| 1 | 📗 | Ṣaḥīḥ al-Bukhārī | Primary hadith |
| 2 | 📘 | Ṣaḥīḥ Muslim | Primary hadith |
| 3 | 📙 | Sunan Abu Dawud | Sunan |
| 4 | 📕 | Jāmiʿ al-Tirmidhī | Sunan + Grading |
| 5 | 📔 | Sunan al-Nasāʾī | Sunan |
| 6 | 📓 | Sunan Ibn Mājah | Sunan |
| 7 | ⭐ | Silsilat al-Ṣaḥīḥah | al-Albānī grading |
| 8 | 🌙 | Riyāḍ al-Ṣāliḥīn | al-Nawawī compilation |

Pill anatomy: `display:inline-flex`, `padding:12px 18px`, `border-radius:14px`. `.sp-icon` (18px) + `.sp-name` (13px, weight 600) + `.sp-type` (11px, `var(--ink-muted)`).

### 2.9 FAQ Accordion Section (`background:var(--surface-card)`)
`.faq-grid`: grid, gap 12px, max-width 760px, centered. Five `.faq-item.reveal` with stagger (none/d1/d2/d3/d4).

**Dual-observer pattern** (same as Methodology): each item participates in `_ro` (`.in`) and `faqObs` (`.in-view`).

Each item: `.faq-q` (click handler) → `.faq-chevron` (rotates 180° on `.open`) + `.faq-a` (max-height 0→300px, 0.4s).

### 2.10 Contact Section (`.contact-section`)
**Not** `.cta-section`. Dark teal gradient (`linear-gradient(135deg,var(--teal-900),#062628)`). No `::before`/`::after` glow pseudo-elements.

Content: `.cs-badge` eyebrow → `.cs-title` (Cormorant serif `clamp(32px,6vw,56px)`) → `.cs-sub` → `.cs-actions` row.

Buttons: `.btn-primary` → `mailto:hello@islamicinfo.org` (mail SVG icon) · `.btn-white-ghost` → `index.html`.

### 2.11 Footer
Currently uses `ii-footer-*` CSS classes — **must migrate to `ft-` system** (CLAUDE.md §7.1) before production. Col 2 heading: "About" with 4 links including `about.html#methodology` fragment. Standard Quick Access (8 links), Ecosystem (4 URLs), Company + Legal.

---

## 3. Frontend Logic

All JS in a single `<script>` block at end of `<body>`. No framework.

### 3.1 Init Sequence
```js
// Inline in <head> — before first paint
applyTheme(localStorage.getItem('islamicinfo-theme') || 'light');

// DOMContentLoaded
initHeaderScroll();     // .scrolled at scrollY > 16
initSearchPopup();      // #searchTrigger / #searchPopup
initReveal();           // _ro IntersectionObserver, threshold:0.08
initStatsCounter();     // statsObserver, threshold:0.35
initMethodology();      // methodObs per .method-step, threshold:0.12
initScholars();         // scholarObs per .scholar-card, threshold:0.15
initRuleCards();        // ruleObs per .rule-card, threshold:0.10
initSourcePills();      // pillObs on .sources-grid, threshold:0.15
initFaqAccordion();     // faqObs on .faq-grid + click handlers
// Gaps to add:
initMobileMenu();       // openMM() / closeMM() + Escape listener
```

### 3.2 Theme System
```js
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('islamicinfo-theme', t);
  themeBtn.innerHTML = t === 'dark' ? sunSVG : moonSVG;
}
themeBtn.addEventListener('click', () =>
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
```
Applied before first render to prevent FOUC. `islamicinfo-theme` is shared across all 10 pages.

### 3.3 Stat Counter — `animateCount(el, target, suffix, useComma, duration)`
```js
function animateCount(el, target, suffix, useComma, duration) {
  // Guard: immediate display for target === 0
  if (target === 0) { el.textContent = '0'; return; }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  const parent = el.closest('.stat-item');
  parent.classList.add('counting');  // → teal-500 color during animation

  const start = performance.now();
  function tick(now) {
    const elapsed = Math.min(now - start, duration);
    const progress = easeOutCubic(elapsed / duration);
    const current = Math.round(progress * target);
    el.textContent = (useComma ? current.toLocaleString('en-US') : current) + suffix;
    if (elapsed < duration) requestAnimationFrame(tick);
    else {
      el.textContent = (useComma ? target.toLocaleString('en-US') : target) + suffix;
      parent.classList.remove('counting');
    }
  }
  requestAnimationFrame(tick);
}
```

**One-time guard:**
```js
let statsAnimated = false;
const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !statsAnimated) {
    statsAnimated = true;
    statsObserver.disconnect();
    document.querySelectorAll('.stat-num').forEach((el, i) => {
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const useComma = el.dataset.comma === 'true';
      setTimeout(() => animateCount(el, target, suffix, useComma, 2800), i * 220);
    });
  }
}, { threshold: 0.35 });
statsObserver.observe(document.querySelector('.stats-banner'));
```

### 3.4 IntersectionObserver Pattern

**General reveal (`_ro`):**
```js
const _ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); _ro.unobserve(e.target); }
  });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => _ro.observe(el));
```

**Per-element observers (same pattern, different thresholds):**

| Observer | Target | Threshold | Class added | Stagger |
|---|---|---|---|---|
| `_ro` | All `.reveal` | 0.08 | `.in` | CSS `transition-delay` via `.reveal-d1`–`.reveal-d5` |
| `statsObserver` | `.stats-banner` | 0.35 | — (fires `animateCount`) | `i * 220ms` via `setTimeout` |
| `methodObs` | Per `.method-step` | 0.12 | `.in-view` | CSS nth-child: 0s/0.18s/0.36s/0.54s |
| `scholarObs` | Per `.scholar-card` | 0.15 | `.in-view` | CSS nth-child: 0s/0.14s/0.28s/0.42s |
| `ruleObs` | Per `.rule-card` | 0.10 | `.in-view` | — (individual per-card observer) |
| `pillObs` | `.sources-grid` | 0.15 | `.in-view` on children | `setTimeout(i * 80)` |
| `faqObs` | `.faq-grid` | 0.08 | `.in-view` on children | `setTimeout(i * 100)` |

**Source pills observer:**
```js
const pillObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    pillObs.disconnect();
    document.querySelectorAll('.source-pill').forEach((pill, i) => {
      setTimeout(() => pill.classList.add('in-view'), i * 80);
    });
  }
}, { threshold: 0.15 });
pillObs.observe(document.querySelector('.sources-grid'));
```

**FAQ observer (same pattern, 100ms stagger).**

### 3.5 FAQ Accordion
```js
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});
```
Net behaviour: click open → closes. Click closed → opens it, closes others. No animation JS needed — CSS handles `max-height` and chevron rotation via `.faq-item.open` selector.

### 3.6 Mobile Menu (Gap — Add These)
```js
function openMM()  { document.getElementById('mobileMenu').classList.add('open'); }
function closeMM() { document.getElementById('mobileMenu').classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMM(); });
```
HTML to add immediately after `</header>`:
```html
<div class="mobile-menu" id="mobileMenu">
  <div class="mm-header">...</div>
  <!-- All 10 nav links; About = .mm-link.active -->
</div>
```
Hamburger `<button class="hamburger icon-btn" onclick="openMM()">` — 3 `<span>` bars, visible only ≤ 760px.

### 3.7 Hero Word Animation
Each word in the H1 must be wrapped:
```html
<h1 class="hero-title">
  <span class="hero-title-word hw1">Knowledge</span>
  <span class="hero-title-word hw2">Without</span><br>
  <span class="hero-title-word hw3 gradient-italic">
    <span class="hero-title-word hw4">Compromise</span>
  </span>
</h1>
```
`heroWordIn` keyframe: `opacity:0; translateY(18px); skewY(.8deg); blur(3px)` → visible. Each `.hwN` has `animation-delay: N * 0.11s`.

---

## 4. Backend Logic

`about.html` is a fully static HTML page. No server-side rendering, no backend calls, no dynamic data fetching.

**The only "backend" considerations:**
- `hello@islamicinfo.org` `mailto:` must reach a monitored inbox — confirm with ops before launch
- Stat numbers (`data-target` attributes) are hardcoded — update manually at build time or wire to a config endpoint (see §16)
- Search popup fires `console.log('Search:', q)` in v1 — wire to site search in production

---

## 5. APIs

**None in v1.** The About page makes no external API calls.

**Future (out of scope v1):**

| API | Purpose | Trigger |
|---|---|---|
| `/api/stats` | Return current platform stat counts (hadith count, duas count) as JSON | Replace hardcoded `data-target` attributes |
| Site search API | Handle search popup queries | Replace `console.log` stub in `.search-popup-btn` click handler |

---

## 6. Database

No database reads or writes from `about.html` in v1.

**Client-side storage (read/write):**

| Key | Type | Purpose |
|---|---|---|
| `islamicinfo-theme` | `'light' \| 'dark'` | Theme preference, shared across all pages |

**No other `localStorage` keys.** This page has no user state — no trackers, no counters, no history.

---

## 7. Validation

The About page has no form inputs except the search popup (which passes queries to the site search layer). Only these client-side guards apply:

### 7.1 Stat Counter Guard
```js
if (target === 0) { el.textContent = '0'; return; }  // prevents NaN/divide-by-zero
```
Also: `parseInt(el.dataset.target)` — if `data-target` is missing, `parseInt(undefined)` returns `NaN`; guard with `|| 0`.

### 7.2 Search Popup
- Empty query: `const q = sInput.value.trim(); if (q) { /* fire search */ }` — no-op on empty string
- No max-length enforced on the search input in v1; add `maxlength="200"` in production

### 7.3 `statsAnimated` Boolean
Prevents re-triggering counter animation on scroll-back. Set to `true` + `disconnect()` on first fire.

### 7.4 `data-target` Accuracy (Build-Time Validation)
Before each production deploy, verify:
- Qur'an verses: 6,236 (constant — never changes)
- Hadith records: must equal actual DB count (currently 12,000+)
- Verified duas: must equal actual verified duas count (currently 300+)
- Ads/fatwas/opinions: always 0 — no validation needed

---

## 8. Error Handling

### 8.1 `animateCount()` — Missing `data-target`
```js
const target = parseInt(el.dataset.target) || 0;
// If attribute is missing, defaults to 0 — instant display, no crash
```

### 8.2 `localStorage` Unavailable (Private Browsing)
```js
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try {
    localStorage.setItem('islamicinfo-theme', t);
  } catch (e) {
    // Private browsing blocks localStorage writes; silently skip
  }
}
```
Theme still applies for the session; it just won't persist.

### 8.3 Search Popup — Clipboard/Focus Errors
Search popup auto-focus: `setTimeout(() => sInput.focus(), 50)` — safe, no error possible.

### 8.4 `mailto:` Link
No error handling needed — browser handles `mailto:` natively. If no mail client is configured, the browser shows its own error. No fallback needed.

### 8.5 IntersectionObserver Not Supported
All modern browsers support IntersectionObserver. No polyfill needed. If unavailable, `.reveal` elements stay at `opacity:0` — content is invisible. **Fallback:** add `if (!('IntersectionObserver' in window))` guard that adds `.in` to all `.reveal` elements immediately.

### 8.6 Dark Mode FOUC
`applyTheme()` runs in an inline `<script>` in `<head>` — before any CSS paint. No flash possible as long as the inline script runs before `<body>`.

---

## 9. RBAC

No authentication. The About page is fully public and anonymous.

| Tier | Access | Status |
|---|---|---|
| All users (anonymous) | Full page — all sections, all content | ✓ v1 |

**Future:** No premium content planned for the About page. It is an editorial commitment page — all of it must remain unconditionally public.

---

## 10. Edge Cases

| Component | Scenario | Behaviour |
|---|---|---|
| Stats counter | User scrolls past banner, scrolls back | `statsAnimated=true` → no re-trigger; counters stay at final values |
| Stats counter | Stat 4 `data-target="0"` | `if (target===0)` guard → instant `"0"`, no rAF loop |
| Stats counter | `data-target` attribute missing | `parseInt(undefined) = NaN`; guard with `|| 0` → shows 0 |
| Stats counter | `data-comma="true"` on 12,000 | `toLocaleString('en-US')` → `"12,000"` → correctly rendered |
| FAQ accordion | Click open item again | `wasOpen=true` → all `.open` removed, target not re-added → closes |
| FAQ accordion | Click while another is open | All `.open` removed → target added → previous collapses, new opens |
| Hero CTA `#methodology` | User is already at methodology section | Smooth-scroll is a no-op; browser stays in place |
| `mission-quote-card` | Outer `div.reveal.reveal-d1` only — inner has no reveal class | Only the outer div is observed by `_ro`; inner card gets no direct observer; correct |
| Source pills | 8 pills, 80ms stagger = 560ms to last pill | Last pill may appear 0.56s after first; acceptable; do not reduce stagger |
| Method step 4 | Last `.method-step` — no bottom border | Implemented via CSS `:last-child { border-bottom: none }` — never add border in JS |
| Dark mode stats `--teal-500` | In dark mode resolves to `#5BC1C7` on dark teal banner | Run visual QA; contrast should be acceptable; monitor |
| `.hw1`–`.hw6` missing in HTML | Word-by-word animation silently skipped | Whole H1 still renders; only the stagger is lost; non-breaking |
| Mobile (≤ 760px, gap unfixed) | No hamburger, no `#mobileMenu` | User cannot navigate away from About page on mobile — **blocking UX bug** |
| Smooth scroll | CTA `href="#methodology"` with `scroll-behavior:smooth` | Works natively; no JS override needed |
| `contact.html` missing | Footer + Contact CTA link to it | 404 in production; must create or change href to `mailto:` until page exists |

---

## 11. Performance

### 11.1 Targets
- LCP ≤ 2.5s
- CLS ≤ 0.1
- INP ≤ 200ms

### 11.2 Strategies

**Loading:**
- Font preconnect (`fonts.googleapis.com` + `fonts.gstatic.com`) in `<head>` before link
- Single `<script>` block at end of `<body>` — no render-blocking JS
- `applyTheme()` inline in `<head>` (1 line) to prevent FOUC — does not block render
- No external API calls — page is fully static; LCP is paint-only

**Animations:**
- All card hover transitions on `transform` + `opacity` — compositor-only, no reflow
- `floatG` geo decorators: CSS animation on `transform` only — GPU layer
- `bgD` hero-bg: CSS animation on `opacity` + `transform` — compositor-only
- `orbPulse` stats banner: CSS animation on `transform` + `opacity` — compositor-only
- `heroWordIn`: CSS animation with `blur()` — GPU (filter layer)
- `animateCount()`: rAF loop updating `textContent` — text paint only, no layout

**IntersectionObservers:**
- All observers call `unobserve()` / `disconnect()` after firing — no ongoing observation cost
- `statsObserver` uses `disconnect()` + boolean guard — 0 CPU after first fire
- Multiple separate observers (7 total) is intentional — each has a different threshold tuned to its component

**Static content:**
- No images, no media, no iframe embeds — fastest possible About page
- All 8 source pills and 4 scholar cards are static HTML — no JS population on load
- Scholar avatars are CSS circles with Arabic text — no image requests

**Source pills stagger:**
- 8 pills × 80ms = max 560ms from first to last — acceptable for decorative entrance

---

## 12. File Structure

```
islamicinfo.org/
├── about.html                     ← this page (all CSS + JS inline in v1)
│
├── contact.html                   ← (GAP — must create; currently linked but 404s)
├── team.html                      ← (GAP — must create; footer links to it)
├── privacy.html                   ← footer link
├── terms.html                     ← footer link
├── index.html                     ← contact CTA "Back to Home" target
│
└── /assets/
    └── fonts/                     ← Google Fonts via CDN preconnect
```

**Cross-page links from `about.html`:**
- `index.html` — Contact "Back to Home"
- `mailto:hello@islamicinfo.org` — Contact primary CTA
- `#methodology` — Hero primary CTA (internal anchor)
- `#sources` — Hero ghost CTA (internal anchor)
- All 10 nav items (standard global nav)

---

## 13. TypeScript Interfaces

```typescript
// Stat counter element config (read from HTML data- attributes)
interface StatConfig {
  target:   number;    // data-target — e.g. 6236
  suffix:   string;    // data-suffix — '' or '+'
  useComma: boolean;   // data-comma === 'true'
  label:    string;    // visible .stat-label text
}

// Rule card data
interface RuleCard {
  id:          number;
  icon:        string;         // emoji
  iconClass:   'rr-teal' | 'rr-gold' | 'rr-red';
  title:       string;
  description: string;
  revealClass: string;         // 'reveal' | 'reveal reveal-d1' | 'reveal reveal-d2'
}

// Methodology step
interface MethodStep {
  number:    '١' | '٢' | '٣' | '٤';    // Arabic numeral
  title:     string;
  desc:      string;
  hasBorder: boolean;                    // false for last step
}

// Scholar card
interface Scholar {
  initial:     string;          // Arabic letter for avatar
  name:        string;
  era:         string;          // '194–256 AH' or '1914–1999'
  description: string;
  badge:       'sb-hadith' | 'sb-classical';
  badgeLabel:  'Hadith Master' | 'Classical';
}

// Source pill
interface SourcePill {
  icon:  string;    // emoji
  name:  string;
  type:  string;
}

// FAQ item
interface FaqItem {
  question: string;
  answer:   string;
}

// Contact section config
interface ContactSection {
  email:       string;    // 'hello@islamicinfo.org'
  emailLabel:  string;    // 'hello@islamicinfo.org'
  homeLabel:   string;    // 'Back to Home'
  homeHref:    string;    // 'index.html'
}

// Page-level JS state (all module-scoped)
interface AboutPageState {
  statsAnimated: boolean;    // one-time counter guard
  currentTheme:  'light' | 'dark';
}

// Mission quote card content
interface MissionQuoteCard {
  arabic:      string;    // Full verse text (Hud 11:88)
  translation: string;    // English translation
  reference:   string;    // 'Hud · 11:88'
  northStar:   string;    // Platform statement
}

// localStorage (About page contributes only theme)
interface LocalStorageSchema {
  'islamicinfo-theme': 'light' | 'dark';
}

// animateCount function signature
type AnimateCountFn = (
  el:       HTMLElement,
  target:   number,
  suffix:   string,
  useComma: boolean,
  duration: number
) => void;
```

---

## 14. Testing

### 14.1 Unit Tests (Jest / Vitest)

| Function | Test cases |
|---|---|
| `animateCount()` | `target=0` → immediate `'0'`, no rAF; `target=6236, useComma=true` → final `'6,236'`; `target=300, suffix='+'` → final `'300+'`; missing `data-target` → `target=NaN` → guard returns `'0'` |
| `easeOutCubic(t)` | `t=0` → 0; `t=1` → 1; `t=0.5` → ~0.875 (accelerated midpoint) |
| FAQ `toggleFaq()` | Click closed item → adds `.open`; click open item → removes `.open`; open item1 then item2 → item1 closed, item2 open |
| `applyTheme('dark')` | `<html>` `data-theme="dark"` set; `localStorage` `islamicinfo-theme='dark'` written; themeBtn innerHTML updated |
| `applyTheme('light')` | Inverse of above |
| Stats stagger | 4 counters start at 0ms/220ms/440ms/660ms delays respectively |

### 14.2 Integration Tests

| Scenario | Expected |
|---|---|
| Page load — light mode | `[data-theme="light"]` on `<html>`; Bismillah teal gradient; hero renders before first paint |
| Page load — dark mode (stored) | `[data-theme="dark"]` applied before paint; Bismillah gold + drop-shadow |
| Stats banner enters viewport | All 4 counters start counting; stat 4 shows `0` instantly; stats 1–3 count up with easeOutCubic |
| Stats banner scroll-back | Counters stay at final values; `statsAnimated=true` blocks re-trigger |
| Click "Our Methodology" CTA | Smooth-scroll to `#methodology` section |
| Click "Trusted Sources" CTA | Smooth-scroll to `#sources` section |
| FAQ Q2 click | Opens with chevron 180°; answer shows `"No. Never."` |
| FAQ Q2 click again | Closes |
| FAQ Q2 open then click Q4 | Q2 closes; Q4 opens |
| Theme toggle | `data-theme` flips; `localStorage` updated; themeBtn SVG swaps |
| Responsive 820px | `.mission-grid` → 1 column; quote card below text |
| Responsive 700px | Stats banner → 2×2 grid |

### 14.3 E2E Tests (Playwright / Cypress)

| Flow | Steps | Pass condition |
|---|---|---|
| Trust flow | Load → scroll → stats animate → scroll to methodology → scroll to scholars → FAQ Q2 | All sections visible; no horizontal scroll; counters reached final values |
| Hero CTAs | Click "Our Methodology" | Smooth-scrolls to `#methodology`; `١` circle visible |
| Hero CTAs | Click "Trusted Sources" | Smooth-scrolls to `#sources`; "Ṣaḥīḥ al-Bukhārī" pill visible |
| FAQ | Open Q1 → open Q3 → click Q3 again | Q1 closes when Q3 opens; Q3 closes on second click |
| Dark mode | Toggle → reload | `[data-theme="dark"]` persists; Bismillah gold gradient |
| Mobile 375px | Load at 375px | No horizontal scroll; stats 2×2; mission stacked; contact buttons wrap |
| Contact email | Click `mailto:` button | Browser mail client opens (or equivalent system action) |
| Anchor deep link | Load `about.html#methodology` | Page scrolls to methodology section on load |

### 14.4 Pre-Launch QA Checklist

**Gaps (must fix before production):**
- [ ] Hamburger button added and visible only ≤ 760px
- [ ] `#mobileMenu` added with all 10 nav links; `About` = `.mm-link.active`
- [ ] `openMM()` / `closeMM()` / Escape listener present
- [ ] Footer migrated from `ii-footer-*` to `ft-` CSS class system
- [ ] Footer col 2 "Methodology" link → `about.html#methodology` (not bare `about.html`)
- [ ] `contact.html` exists or footer/CTA href updated to `mailto:`

**Content accuracy:**
- [ ] `data-target="6236"` — confirmed correct (Qur'an verses)
- [ ] `data-target="12000"` — confirmed against actual hadith DB count at build time
- [ ] `data-target="300"` — confirmed against actual verified duas count
- [ ] `hello@islamicinfo.org` is a live, monitored inbox
- [ ] "No Fatwas. Ever." present in Rule Card 3
- [ ] "No. Never. This is a hard constraint" present in FAQ Q2

**Design:**
- [ ] No shimmer `::after` on any card (light + dark)
- [ ] All hover transitions use `--ease-reverent` / `--ease-premium`
- [ ] Bismillah: teal gradient (light) / gold + drop-shadow (dark)
- [ ] `.mission-quote-card` outer wrapper has `.reveal.reveal-d1`; inner card has no reveal class
- [ ] Rule card stagger resets at row 2 (cards 4–6 start from `reveal` again, not continuing to `reveal-d3`)
- [ ] Method step 4 has no bottom border

**Animations:**
- [ ] `heroWordIn` stagger: `.hw1`–`.hw6` classes present on H1 words
- [ ] `bgD` hero-bg continuous
- [ ] `floatG` geo decorators continuous
- [ ] `orbPulse` stats banner continuous
- [ ] Stats counter fires once; second scroll-past does not re-trigger
- [ ] Dual-observer pattern: both `_ro` (`.in`) and specific observer (`.in-view`) fire on method steps and FAQ items

**Navigation:**
- [ ] All 10 nav items in order; `About` = `.active`; `islamic-studies.html` (never `learn.html`)
- [ ] `knowledge-hub.html` at position 5 — never omitted
- [ ] Footer: `quranlyai.com` (not `quranlya.com`); `LearnSpeakAI` (exact casing)
- [ ] All ecosystem links: `target="_blank" rel="noopener"` + ` ↗` suffix

**Responsive (all breakpoints):**
- [ ] 1100px, 900px, 820px (mission grid), 760px (nav/hamburger), 700px (stats 2×2), 440px — verified in light + dark

---

*End of About Page Technical Document v1.0*
*IslamicInfo.org · `about.html` · Design system: CLAUDE.md v3.0 · PRD: v1.1 · Func doc: v1.0*
