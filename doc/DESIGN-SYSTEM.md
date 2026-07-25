# CLAUDE.md — IslamicInfo Design System v3.0
**Master blueprint specification. Self-contained. Single source of truth.**

> Maintained by: IslamicInfo founding team
> Blueprint pages (treat as canonical): `index.html` (Home), `quran.html` (Quran Explorer), `hadith.html` (Hadith Library), `islamic-studies.html` (Islamic Studies Curriculum), `knowledge-hub.html` (Knowledge Hub — articles), `dua.html` (Daily Duas), `tools.html` (Tools), `habits.html` (Habit Tracker), `verify.html` (Verify), `about.html` (About)
> Last verified against: enhanced pages (habit_enhanced, verify_enhanced, islamic_studies_optionB, dua_enhanced, tools_enhanced) — 2026-05-15

---

## 0. THE PRIME DIRECTIVE — BLUEPRINT FIDELITY

**Read this section every time before touching code.**

The blueprint HTML pages above are the visual, structural, and content source of truth. They are not drafts. They are not "starting points." They are the spec.

When generating new pages, components, PRDs, or technical plans:

1. **Preserve exactly** — design, layout, spacing, animations, hover effects, colors, button styles, card styles, menu structure, typography, copy, card titles, descriptions, button labels, menu items, section headings, and footer content.
2. **Do not rename or rewrite** any visible text unless explicitly instructed.
3. **Use the blueprint HTML files as source of truth** for visual structure. Match `font-size`, `padding`, `border-radius`, `box-shadow`, `transition` curves, and color values exactly.
4. **Only change what is explicitly requested** — typically live data integration. The surrounding design stays frozen.
5. **Static blueprint content is preserved verbatim.**
6. **Live data is injected without changing surrounding design or wording.**

**When the user says "use blueprint X" or attaches a blueprint file, that file overrides any rule below if they conflict.**

**When unsure, ask. Never improvise on visual design.**

---

## 1. CSS VARIABLES — GLOBAL TOKENS (copy verbatim into every page)

Every page begins with `<html lang="en" data-theme="light">` and this exact `:root` block. Dark mode is a sibling block — do not merge them.

```css
:root {
  /* ── Teal scale ── */
  --teal-50:  #F0FAFB;
  --teal-100: #C8EEF1;
  --teal-200: #8DD8DE;
  --teal-300: #6AD7DE;
  --teal-400: #3FBFC7;
  --teal-500: #2CA4AB;
  --teal-600: #0297A1;
  --teal-650: #028890;
  --teal-700: #00696E;   /* PRIMARY brand teal */
  --teal-750: #005A5F;
  --teal-800: #004E55;
  --teal-900: #0A3A3D;

  /* ── Gold scale ── */
  --gold-50:  #FDF8EC;
  --gold-100: #F7E9C2;
  --gold-200: #EFD48A;
  --gold-300: #E5C570;
  --gold-400: #D9B358;
  --gold-500: #C5A059;   /* PRIMARY brand gold */
  --gold-700: #9A7C3F;
  --gold-900: #5A4420;

  /* ── Ink (text) ── light values updated 2026-07-25 (owner-authorized override) ── */
  --ink-primary: #0F2A2C;
  --ink-body:    #111111;   /* was #243738 → near-black for stronger body contrast (≈17-19:1) */
  --ink-muted:   #3A4A4B;   /* was #6D797A → darker so nav/labels/captions read clearly */
  --ink-subtle:  #9DA8A9;
  --ink-faint:   #BCC9C9;
  --ink-100:     #F5F8F8;
  --ink-900:     #0A1314;

  /* ── Surfaces ── */
  --surface:      #F4F7F7;
  --surface-card: #FAFBFB;
  --white:        #FFFFFF;

  /* ── Elevation ── */
  --elev-1: 0 1px 3px rgba(15,42,44,.06);
  --elev-2: 0 4px 14px rgba(15,42,44,.08), 0 1px 3px rgba(15,42,44,.04);
  --elev-3: 0 12px 32px rgba(0,105,110,.10), 0 4px 10px rgba(0,105,110,.06);
  --elev-4: 0 24px 56px rgba(0,105,110,.13), 0 8px 18px rgba(0,105,110,.07);
  --inner-light: inset 0 1px 0 rgba(255,255,255,.7);
  --gold-aura: 0 0 0 1px rgba(197,160,89,.22), 0 8px 32px rgba(197,160,89,.18);

  /* ── Hadith grade badges (light) — WCAG AA corrected 2026-07-20, see DECISIONS.md ADR-025 ── */
  --grade-sahih: #0F6E56;   /* 5.19:1 ✅ */
  --grade-hasan: #4A7030;   /* was #5D8A3A (3.51:1 ✗ AA) → 4.85:1 ✅ */
  --grade-daif:  #8A5228;   /* was #A86932 (3.79:1 ✗ AA) → 5.30:1 ✅ */
  --grade-mawdu: #B33A3A;   /* 4.89:1 ✅ */
  /* Dark-theme grade overrides — REQUIRED on any page that renders a grade badge; add inside
     [data-theme="dark"]:  --grade-sahih:#1FA882; --grade-hasan:#7AB84E; --grade-daif:#D4884A; --grade-mawdu:#E05555; */

  /* ── Typography ── three-font system, updated 2026-07-25 (owner-authorized override).
     Roles: serif=headings/titles/wordmark/em; sans=body/nav/buttons/labels/inputs/tables
     (base 16.5px / 400); mono=numbers & machine text (KPIs, counts, timestamps, pills,
     chips, code). Note: --font-sans and --font-mono are role labels — both are serifs;
     Shippori Mincho is not monospaced (add font-variant-numeric:tabular-nums for columns). */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-serif:   'Cormorant Garamond', Georgia, serif;
  --font-body:    'Libre Baskerville', Georgia, serif;   /* was 'Inter' */
  --font-sans:    'Libre Baskerville', Georgia, serif;   /* body/UI role */
  --font-arabic:  'Amiri', 'Cormorant Garamond', serif;  /* Arabic script — unchanged */
  --font-mono:    'Shippori Mincho', ui-monospace, 'SF Mono', monospace;  /* was ui-monospace */

  /* ── Easing ── PREMIUM CURVE for all hovers/transitions */
  --ease-reverent: cubic-bezier(.22,1,.36,1);
  --ease:          cubic-bezier(.22,1,.36,1);
  --ease-premium:  cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* ── Radii ── */
  --r-sm:  10px; --r-md: 14px; --r-lg: 18px; --r-xl: 24px; --r-2xl: 32px;
}

/* ── Dark mode — SIBLING block, do not merge ── */
[data-theme="dark"] {
  --surface:      #0A1314;
  --surface-card: #0F1B1D;
  --white:        #152527;
  --ink-primary:  #F5F8F8;
  --ink-body:     #D4DCDD;
  --ink-muted:    #9AAAAB;
  --ink-subtle:   #6E7E80;
  --ink-faint:    #2A3638;
  --teal-700:     #1A8A91;   /* brighter in dark to stay readable */
  --teal-500:     #5BC1C7;
  --teal-300:     #88E0E5;
  --teal-50:      rgba(0,105,110,.15);
  --teal-100:     rgba(0,105,110,.25);
  --gold-50:      rgba(197,160,89,.10);
}
```

**Rules:**
- Never invent new colors. If you need a shade, pick the closest token above.
- Never use raw hex inline except inside SVG gradients defined in the blueprints.
- Dark mode tokens override their light counterparts via cascade.

---

## 2. PAGE SHELL — DOCUMENT STRUCTURE

Every page follows this skeleton exactly:

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{Page Title} — IslamicInfo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Shippori+Mincho:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    /* :root + dark mode block from Section 1 */
    /* base reset + body background pattern (Section 3) */
    /* component CSS — header / bismillah / hero / cards / buttons / footer */
  </style>
</head>
<body>
  <div class="ambient"></div>        <!-- ambient radial glow -->
  <div class="shell">
    <header class="site-header" id="siteHeader">…</header>   <!-- Section 4 -->

    <!-- Mobile menu (Section 4.7) — include on every page -->
    <div class="mobile-menu" id="mobileMenu">…</div>

    <main>
      <section class="hero">…</section>      <!-- Section 6 -->
      <!-- page sections -->
      <section class="cta-section">…</section>  <!-- Section 11 — always last before footer -->
    </main>
    <footer id="ii-footer">…</footer>        <!-- Section 7 -->
  </div>
  <script>/* Section 8 — theme + search + mobile menu + reveal observer */</script>
</body>
</html>
```

---

## 3. BASE STYLES & BACKGROUND PATTERN

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html {
  font-family: var(--font-body);
  font-size: 16.5px;   /* updated 2026-07-25 (was 15px) */
  line-height: 1.65;
  background: var(--surface);
  color: var(--ink-body);
  scroll-behavior: smooth;
  transition: background .4s ease, color .4s ease;
}
body {
  background-color: var(--surface);
  /* Subtle Islamic geometric pattern — DO NOT REMOVE */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%2300696E' stroke-width='0.4' opacity='0.04'%3E%3Cpolygon points='60,6 72,32 100,32 78,50 86,76 60,60 34,76 42,50 20,32 48,32'/%3E%3Ccircle cx='60' cy='60' r='52'/%3E%3C/g%3E%3C/svg%3E");
  overflow-x: hidden;
}
a { text-decoration: none; color: inherit; }
img { max-width: 100%; }

.ambient {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 10%, rgba(0,105,110,.07), transparent 55%),
    radial-gradient(ellipse 60% 50% at 85% 15%, rgba(197,160,89,.06), transparent 50%);
}
.shell { position: relative; z-index: 1; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px); }

/* Shared section layout */
.section { padding: clamp(64px,8vw,96px) 0; }
.section-head, .section-hdr { text-align: center; margin-bottom: clamp(36px,5vw,56px); }
.section-title {
  font-family: var(--font-display);
  font-size: clamp(30px,5vw,50px);
  font-weight: 500; line-height: 1.1; letter-spacing: -.02em;
  color: var(--ink-primary); margin-bottom: 14px;
}
[data-theme="dark"] .section-title { color: #F5F8F8; }
.section-sub {
  font-size: 16px; color: var(--ink-muted);
  line-height: 1.72; max-width: 560px; margin: 0 auto;
}
.section-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: var(--teal-700); background: rgba(0,105,110,.08);
  border: 0.5px solid rgba(0,105,110,.18);
  padding: 6px 14px; border-radius: 20px; margin-bottom: 18px;
}
[data-theme="dark"] .section-eyebrow { color: var(--teal-300); }
```

---

## 4. GLOBAL NAVBAR — exact spec

**Layout: Logo (far-left) | Nav menu (center, `flex:1`) | Tools (far-right)**

### 4.1 Nav items — exact order, exact labels, exact hrefs

> **Knowledge Hub** added at position 5 (between Islamic Studies and Daily Duas). This is the global standard. Every page must have all 10 items.

| Position | Label | href |
|---|---|---|
| 1 | Home | `index.html` |
| 2 | Quran Explorer | `quran.html` |
| 3 | Hadith Library | `hadith.html` |
| 4 | Islamic Studies | `islamic-studies.html` |
| 5 | **Knowledge Hub** | `knowledge-hub.html` |
| 6 | Daily Duas | `dua.html` |
| 7 | Tools | `tools.html` |
| 8 | Habit Tracker | `habits.html` |
| 9 | Verify | `verify.html` |
| 10 | About | `about.html` |

> ⚠️ NEVER use `islamic-studies.html` — the correct href is `islamic-studies.html`.

**Never reorder. Never rename. Never add or remove items without explicit instruction.** The active page gets `class="nav-link active"`; all others are `class="nav-link"`.

### 4.2 Tools (right side) — exact order

1. Search icon → opens search popup (Section 4.5)
2. Language (`EN`) — text button, placeholder
3. Theme toggle (sun ↔ moon icon, id=`themeBtn`)
4. Admin (user icon) — placeholder

### 4.3 Navbar HTML — paste verbatim into every page

```html
<header class="site-header" id="siteHeader" data-screen-label="Header">
  <div class="container">
    <div class="header-inner">
      <!-- Logo (Left) -->
      <a href="index.html" class="brand" aria-label="IslamicInfo home">
        <svg class="brand-mark" viewBox="0 0 72 72" fill="none">
          <defs>
            <linearGradient id="lp" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#00696e"/><stop offset="100%" stop-color="#1A8A91"/></linearGradient>
            <linearGradient id="rp" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#1A8A91"/><stop offset="100%" stop-color="#00696e"/></linearGradient>
            <linearGradient id="gl" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#E5C893" stop-opacity=".6"/><stop offset="100%" stop-color="#C5A059" stop-opacity="0"/></linearGradient>
          </defs>
          <path d="M36 18 Q36 18, 22 22 Q14 24, 12 28 L12 50 Q14 46, 22 44 Q30 42, 36 44 Z" fill="url(#lp)"/>
          <path d="M36 18 Q36 18, 50 22 Q58 24, 60 28 L60 50 Q58 46, 50 44 Q42 42, 36 44 Z" fill="url(#rp)"/>
          <path d="M36 18 L36 44" stroke="#C5A059" stroke-width=".8" stroke-linecap="round"/>
          <path d="M22 28 L30 28 M20 32 L32 32 M22 36 L30 36" stroke="rgba(255,255,255,.4)" stroke-width=".6"/>
          <path d="M42 28 L50 28 M40 32 L52 32 M42 36 L50 36" stroke="rgba(255,255,255,.4)" stroke-width=".6"/>
          <path d="M30 18 Q33 8, 36 4 Q39 8, 42 18 Z" fill="url(#gl)" opacity=".7"/>
          <g class="star" transform="translate(36 14)">
            <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#C5A059"/>
            <circle cx="0" cy="0" r="1.5" fill="white"/>
          </g>
          <circle class="halo" cx="36" cy="14" r="11" stroke="rgba(197,160,89,.25)" stroke-width=".5" fill="none"/>
          <circle class="halo" cx="36" cy="14" r="14" stroke="rgba(197,160,89,.12)" stroke-width=".5" fill="none"/>
        </svg>
        <span class="brand-text"><span>Islamic</span><span class="info">Info</span></span>
      </a>

      <!-- Menu (Center) — set .active on the current page -->
      <nav class="nav" aria-label="Primary navigation">
        <a class="nav-link active" href="index.html">Home</a>
        <a class="nav-link" href="quran.html">Quran Explorer</a>
        <a class="nav-link" href="hadith.html">Hadith Library</a>
        <a class="nav-link" href="islamic-studies.html">Islamic Studies</a>
      <a class="nav-link" href="knowledge-hub.html">Knowledge Hub</a>
        <a class="nav-link" href="dua.html">Daily Duas</a>
        <a class="nav-link" href="tools.html">Tools</a>
        <a class="nav-link" href="habits.html">Habit Tracker</a>
        <a class="nav-link" href="verify.html">Verify</a>
        <a class="nav-link" href="about.html">About</a>
      </nav>

      <!-- Icons (Right) -->
      <div class="header-tools">
        <div class="search-popup-wrapper">
          <button class="icon-btn search-trigger" aria-label="Search" id="searchTrigger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
          <div class="search-popup" id="searchPopup" role="search">
            <input type="text" placeholder="Search verses, hadiths, topics…" aria-label="Site search" id="searchPopupInput" />
            <button class="search-popup-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              Search
            </button>
          </div>
        </div>
        <button class="icon-btn" aria-label="Language">
          <span style="font-size:11px;font-weight:600;letter-spacing:.06em;">EN</span>
        </button>
        <button class="icon-btn theme-toggle" aria-label="Toggle theme" id="themeBtn"></button>
        <button class="icon-btn" aria-label="Admin">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>
        </button>
        <!-- Hamburger — visible on mobile only -->
        <button class="hamburger icon-btn" aria-label="Open menu" onclick="openMM()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </div>
</header>
```

### 4.4 Navbar CSS — paste verbatim

```css
.site-header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(250,251,251,.92);
  backdrop-filter: blur(24px) saturate(1.6);
  border-bottom: 0.5px solid rgba(0,105,110,.10);
  transition: background .3s, box-shadow .3s;
}
[data-theme="dark"] .site-header { background: rgba(10,19,20,.92); border-bottom-color: rgba(0,105,110,.2); }
.site-header.scrolled { box-shadow: 0 1px 0 rgba(0,105,110,.10), var(--elev-1); }
.site-header .container { padding-left: clamp(16px,4vw,48px); padding-right: clamp(16px,4vw,48px); max-width: 100%; }

.header-inner { display: flex; align-items: center; height: 60px; width: 100%; gap: 0; }

.brand {
  display: flex; align-items: center; gap: 8px;
  flex-shrink: 0; font-family: var(--font-display);
  font-size: 20px; font-weight: 600; letter-spacing: -.02em;
  color: var(--ink-primary); white-space: nowrap;
}
.brand-mark { width: 34px; height: 34px; transition: transform .5s var(--ease-reverent); }
.brand:hover .brand-mark { transform: scale(1.06); }
.brand:hover .star { animation: star-spin .8s var(--ease-reverent) forwards; }
.brand:hover .halo { animation: halo-pulse .9s ease infinite; }
@keyframes star-spin { 0%{transform:rotate(0);}100%{transform:rotate(45deg) scale(1.15);} }
@keyframes halo-pulse { 0%,100%{opacity:.25;} 50%{opacity:.7;} }
.brand-text .info { color: var(--gold-500); }
[data-theme="dark"] .brand-text .info { color: #C5A059; }
[data-theme="dark"] .brand-text { color: #5BC1C7; }

/* Nav — center, tight 2px gap */
.nav { flex: 1; display: flex; align-items: center; flex-wrap: nowrap; justify-content: center; gap: 2px; overflow: hidden; }
.nav-link {
  font-size: 12.5px; color: var(--ink-muted);
  padding: 5px 8px; border-radius: 8px;
  white-space: nowrap; flex-shrink: 0;
  transition: all .25s var(--ease-premium); position: relative;
}
.nav-link:hover {
  color: var(--teal-700);
  background: linear-gradient(135deg, rgba(0,105,110,.08), rgba(0,105,110,.04));
  transform: scale(1.05);
  box-shadow: 0 0 0 1px rgba(0,105,110,.12), 0 4px 12px rgba(0,105,110,.1);
}
[data-theme="dark"] .nav-link:hover {
  color: var(--teal-300);
  background: linear-gradient(135deg, rgba(0,105,110,.18), rgba(0,105,110,.08));
  box-shadow: 0 0 12px rgba(88,193,199,.2), 0 0 0 1px rgba(0,105,110,.25);
}
.nav-link.active { color: var(--teal-700); font-weight: 500; }
.nav-link.active::after {
  content: ''; position: absolute; bottom: -1px; left: 6px; right: 6px;
  height: 2px; background: linear-gradient(90deg, var(--teal-700), var(--gold-500));
  border-radius: 2px;
}

/* Tools (right) */
.header-tools { display: flex; gap: 6px; align-items: center; margin-left: auto; flex-shrink: 0; }
.icon-btn {
  width: 34px; height: 34px; border-radius: 50%;
  border: none; background: transparent; cursor: pointer;
  color: var(--ink-muted);
  display: flex; align-items: center; justify-content: center;
  transition: all .25s var(--ease-premium);
}
.icon-btn:hover {
  background: rgba(0,105,110,.08); color: var(--teal-700);
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(0,105,110,.2);
}
[data-theme="dark"] .icon-btn { color: #6E7E80; }
[data-theme="dark"] .icon-btn:hover { background: rgba(0,105,110,.15); color: var(--teal-300); box-shadow: 0 0 12px rgba(88,193,199,.25); }
```

### 4.5 Search popup CSS

```css
.search-popup-wrapper { position: relative; }
.search-popup {
  position: absolute; top: 44px; right: 0;
  width: 340px; z-index: 200;
  background: var(--surface-card);
  border: 0.5px solid rgba(0,105,110,.18);
  border-radius: var(--r-lg);
  box-shadow: var(--elev-4);
  backdrop-filter: blur(20px);
  padding: 12px;
  opacity: 0; pointer-events: none;
  transform: translateY(-8px) scale(.97);
  transition: opacity .3s var(--ease-premium), transform .3s var(--ease-premium);
}
.search-popup.open { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }
[data-theme="dark"] .search-popup { background: rgba(15,27,29,.97); border-color: rgba(0,105,110,.3); }
.search-popup input {
  width: 100%; border: 1px solid rgba(0,105,110,.2); outline: none;
  background: transparent; font: inherit; font-size: 14px;
  color: var(--ink-primary); padding: 10px 14px; border-radius: 10px;
  transition: border-color .2s, box-shadow .2s;
}
.search-popup input:focus { border-color: var(--teal-500); box-shadow: 0 0 0 4px rgba(44,164,171,.15); }
.search-popup input::placeholder { color: var(--ink-subtle); }
.search-popup-btn {
  display: flex; align-items: center; justify-content: center;
  margin-top: 8px; width: 100%; padding: 10px;
  background: linear-gradient(135deg, var(--teal-600), var(--teal-500));
  color: white; border: none; border-radius: 10px; cursor: pointer;
  font-size: 13px; font-weight: 600; gap: 6px; font-family: var(--font-body);
  transition: all .25s var(--ease-premium);
}
.search-popup-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,105,110,.35); }
```

### 4.6 Mobile responsive — exact breakpoints

```css
@media (max-width: 1100px) {
  .nav-link { font-size: 11.5px; padding: 5px 5px; }
}
@media (max-width: 900px) {
  .nav-link { font-size: 10.5px; padding: 5px 3px; }
  .brand { font-size: 16px; gap: 6px; }
  .brand-mark { width: 28px; height: 28px; }
}
@media (max-width: 760px) {
  .nav { display: none; }
  .header-tools .icon-btn:not(.theme-toggle):not(.search-trigger):not(.hamburger) { display: none; }
  .hamburger { display: flex; }
}
```

### 4.7 Mobile menu — HTML & CSS (include on every page)

```html
<!-- Mobile menu overlay — place right after <header> closing tag -->
<div class="mobile-menu" id="mobileMenu">
  <div class="mm-header">
    <span style="font-family:var(--font-display);font-size:18px;color:#5BC1C7;">Islamic<span style="color:#C5A059;">Info</span></span>
    <button class="icon-btn mm-close" onclick="closeMM()" aria-label="Close menu" style="color:rgba(255,255,255,.6);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <a class="mm-link" href="index.html">Home</a>
  <a class="mm-link" href="quran.html">Quran Explorer</a>
  <a class="mm-link" href="hadith.html">Hadith Library</a>
  <a class="mm-link" href="islamic-studies.html">Islamic Studies</a>
  <a class="mm-link" href="dua.html">Daily Duas</a>
  <a class="mm-link" href="tools.html">Tools</a>
  <a class="mm-link" href="habits.html">Habit Tracker</a>
  <a class="mm-link" href="verify.html">Verify</a>
  <a class="mm-link" href="about.html">About</a>
</div>
```

```css
/* Mobile menu */
.mobile-menu {
  display: none; position: fixed; inset: 0; z-index: 300;
  background: rgba(6,38,40,.97); backdrop-filter: blur(20px);
  flex-direction: column; padding: 24px 28px; gap: 4px;
}
.mobile-menu.open { display: flex; animation: mmFade .3s var(--ease) both; }
@keyframes mmFade { from{opacity:0;transform:translateX(20px);} to{opacity:1;transform:none;} }
.mm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.mm-link {
  font-size: 18px; color: rgba(255,255,255,.7);
  padding: 12px 0; border-bottom: 0.5px solid rgba(255,255,255,.06);
  transition: color .2s, padding-left .2s;
}
.mm-link:hover { color: #5BC1C7; padding-left: 8px; }

/* Hamburger button */
.hamburger {
  display: none; flex-direction: column; gap: 5px;
  width: 34px; height: 34px; border-radius: 8px;
  border: 0.5px solid var(--ink-faint); background: transparent;
  cursor: pointer; align-items: center; justify-content: center;
}
.hamburger span { width: 16px; height: 1.5px; background: var(--ink-muted); border-radius: 2px; display: block; }
@media (max-width: 760px) { .hamburger { display: flex; } }
```

---

## 5. BISMILLAH — exact placement & style

The Bismillah (`بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`) sits **inside the hero, as the first child of `.hero-inner`**, immediately under the navbar.

### 5.1 Color rules (DO NOT DEVIATE)

- **Light mode** → teal-only gradient: `linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%)` (clip-text)
- **Dark mode** → gold gradient: `linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%)` with `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))`

### 5.2 Bismillah CSS — paste verbatim

```css
.bismillah-hero,
.bismillah-hero-top,
.bismillah-bar,
.bismillah-section {
  font-family: var(--font-arabic);
  font-size: 15px; direction: rtl; text-align: center;
  margin-top: 8px; margin-bottom: 16px;
  letter-spacing: .06em; line-height: 1.6;
  background: linear-gradient(100deg, #00696E 0%, #2CA4AB 50%, #00696E 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent; opacity: .92;
}
[data-theme="dark"] .bismillah-hero,
[data-theme="dark"] .bismillah-hero-top,
[data-theme="dark"] .bismillah-bar,
[data-theme="dark"] .bismillah-section {
  background: linear-gradient(100deg, #D9B358 0%, #F0D080 50%, #D9B358 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  opacity: 1; filter: drop-shadow(0 0 14px rgba(217,179,88,.55));
}

/* Islamic Studies decorative variant */
.bismillah-wrap { text-align: center; padding: 0 0 4px; position: relative; z-index: 1; }
.bismillah-text {
  font-family: 'Amiri', serif; font-size: clamp(22px, 3.5vw, 30px);
  color: #00696E; direction: rtl; letter-spacing: .04em; line-height: 1.8;
  display: block; transition: color .4s ease;
}
[data-theme="dark"] .bismillah-text { color: #D9B358; filter: drop-shadow(0 0 12px rgba(217,179,88,.45)); }
.bismillah-divider { display: flex; align-items: center; gap: 14px; justify-content: center; margin-top: 10px; }
.bismillah-line { width: 64px; height: 0.5px; background: linear-gradient(90deg, transparent, rgba(197,160,89,.45)); }
.bismillah-line.r { background: linear-gradient(90deg, rgba(197,160,89,.45), transparent); }
.bismillah-star { color: var(--gold-500); font-size: 11px; }
```

### 5.3 Bismillah HTML snippets

```html
<!-- Standard (Home, Quran, Hadith, Dua, Tools, Habits, Verify, About) -->
<div class="bismillah-hero-top">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

<!-- Islamic Studies (Learn) only -->
<div class="bismillah-wrap" style="margin-bottom:8px;">
  <span class="bismillah-text" style="font-size:clamp(16px,2.2vw,22px);">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
  <div class="bismillah-divider" style="margin-top:6px;">
    <div class="bismillah-line" style="width:40px;"></div>
    <span class="bismillah-star" style="font-size:9px;">✦</span>
    <div class="bismillah-line r" style="width:40px;"></div>
  </div>
</div>
```

---

## 6. HERO STRUCTURE — every page

**Universal order (top → bottom):**
1. `.hero` wrapper
2. `.hero-bg` (radial gradient layer)
3. Four floating `.geo` SVGs
4. `.hero-inner` (z:1, max-width 800px, text-center)
5. **Bismillah** (Section 5)
6. **Eyebrow / badge** pill
7. **`<h1>` hero title** — `var(--font-display)`, `clamp(46px,8.5vw,82px)`, weight 500, with `<span class="gradient-italic">` for emphasized half
8. **`<p>` description** — 15-18px, `var(--ink-muted)`, max-width ~640px
9. **CTA row** — `.btn-primary` + optional `.btn-ghost`

### 6.1 Hero CSS

```css
.hero {
  position: relative; overflow: hidden;
  padding: clamp(20px,3vw,36px) clamp(20px,5vw,56px) clamp(44px,7vw,80px);
  min-height: 74vh; display: flex; align-items: center;
}
.hero-bg {
  position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse 80% 60% at 18% 28%, rgba(0,105,110,.10), transparent 60%),
    radial-gradient(ellipse 60% 50% at 82% 20%, rgba(197,160,89,.08), transparent 55%),
    radial-gradient(ellipse 55% 65% at 55% 88%, rgba(0,105,110,.07), transparent 55%);
  animation: bgD 18s ease-in-out infinite alternate;
}
@keyframes bgD { 0%{opacity:.8;transform:scale(1);} 100%{opacity:1;transform:scale(1.04);} }
[data-theme="dark"] .hero-bg { opacity: .7; }

.hero-inner, .hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; text-align: center; width: 100%; }

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(46px, 8.5vw, 82px);
  font-weight: 500; line-height: 1.04; letter-spacing: -.03em;
  color: var(--ink-primary); margin-bottom: 18px;
  animation: fadeUp .7s var(--ease-reverent) .1s both;
}
[data-theme="dark"] .hero-title { color: #F5F8F8 !important; }

.gradient-italic, .grad-it, .gold-it {
  font-style: italic;
  background: linear-gradient(90deg, var(--teal-700) 0%, var(--teal-500) 55%, var(--gold-500) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

.hero-sub, .hero-mission {
  font-size: clamp(15px, 2vw, 18px); color: var(--ink-muted);
  line-height: 1.72; max-width: 640px; margin: 0 auto 32px;
  animation: fadeUp .7s var(--ease-reverent) .2s both;
}

.hero-badge, .eyebrow, .hero-eyebrow, .page-eyebrow {
  display: inline-flex; align-items: center; gap: 9px;
  font-size: 10.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: var(--teal-700); background: rgba(0,105,110,.08);
  border: 0.5px solid rgba(0,105,110,.18);
  padding: 7px 16px; border-radius: 24px; margin-bottom: 24px;
  animation: fadeUp .6s var(--ease-reverent) both;
}
.badge-dot, .eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold-500); animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.5;transform:scale(1.4);} }
@keyframes fadeUp { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }

[data-theme="dark"] .hero-badge,
[data-theme="dark"] .eyebrow,
[data-theme="dark"] .hero-eyebrow,
[data-theme="dark"] .page-eyebrow { color: #5BC1C7 !important; }

/* Floating geometry decorators */
.geo { position: absolute; opacity: .5; pointer-events: none; }
.g1 { top: 8%; left: 4%; animation: geoFloat 14s ease-in-out infinite; }
.g2 { top: 20%; right: 6%; animation: geoFloat 11s ease-in-out infinite reverse; }
.g3 { bottom: 16%; right: 8%; animation: geoFloat 16s ease-in-out infinite; }
.g4 { bottom: 22%; left: 6%; animation: geoFloat 13s ease-in-out infinite reverse; }
@keyframes geoFloat { 0%,100%{transform:translateY(0) rotate(0);} 50%{transform:translateY(-12px) rotate(8deg);} }
```

### 6.2 Hero block — copy-paste skeleton

```html
<section class="hero">
  <div class="hero-bg"></div>
  <div class="geo g1"><svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="#00696E" stroke-width=".5"><polygon points="36,3 44,22 63,22 48,33 53,53 36,41 19,53 24,33 9,22 28,22"/><circle cx="36" cy="36" r="31"/></svg></div>
  <div class="geo g2"><svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#C5A059" stroke-width=".5"><rect x="4" y="4" width="36" height="36" rx="3" transform="rotate(15 22 22)"/></svg></div>
  <div class="geo g3"><svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#00696E" stroke-width=".5"><polygon points="30,2 37,18 54,18 41,28 45,44 30,34 15,44 19,28 6,18 23,18"/></svg></div>
  <div class="geo g4"><svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="#8A7036" stroke-width=".5"><polygon points="19,2 22,12 32,12 24,18 27,28 19,22 11,28 14,18 6,12 16,12" transform="rotate(22 19 19)"/></svg></div>

  <div class="hero-inner">
    <div class="bismillah-hero-top">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <div class="hero-badge"><div class="badge-dot"></div>{Eyebrow Text}</div>
    <h1 class="hero-title">{Plain heading}<br><span class="gradient-italic">{Italic emphasis}</span></h1>
    <p class="hero-sub">{Description ≤ 2 lines}</p>
    <div class="hero-btns">
      <a class="btn-primary" href="#">{Primary CTA}</a>
      <a class="btn-ghost" href="#">{Secondary CTA}</a>
    </div>
  </div>
</section>
```

---

## 7. GLOBAL FOOTER — copy verbatim across all pages

> **Source of truth:** `islamic_studies_optionB.html` footer (ft- CSS class system).  
> Every page uses **identical** footer CSS and HTML. Only `ft-col-h` column 1 heading and its links are page-specific.

### 7.1 Footer CSS — paste verbatim (add to every page `<style>`)

```css
/* ═══ GLOBAL FOOTER ═══ */
#ii-footer{background:#062628;color:rgba(255,255,255,.62);font-family:'Inter',sans-serif;}
.ft-top{padding:clamp(52px,7vw,80px) clamp(20px,5vw,64px) clamp(32px,4vw,48px);display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:clamp(24px,3vw,52px);border-bottom:0.5px solid rgba(255,255,255,.07);}
@media(max-width:1100px){.ft-top{grid-template-columns:1.4fr 1fr 1fr;}}
@media(max-width:700px){.ft-top{grid-template-columns:1fr 1fr;}.ft-brand{grid-column:1/-1;}}
@media(max-width:440px){.ft-top{grid-template-columns:1fr;}}
.ft-logo{display:flex;align-items:center;gap:10px;text-decoration:none;margin-bottom:16px;font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;letter-spacing:-.02em;}
.ft-logo .ti{color:#5BC1C7;}.ft-logo .fo{color:#C5A059;}
.ft-tag{font-size:13px;line-height:1.72;color:rgba(255,255,255,.38);max-width:240px;margin-bottom:20px;}
.ft-verse{font-size:11px;color:rgba(255,255,255,.22);font-style:italic;font-family:'Cormorant Garamond',serif;}
.ft-col-h{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:16px;}
.ft-link{display:block;font-size:13px;color:rgba(255,255,255,.5);text-decoration:none;padding:4px 0;margin-bottom:2px;border-left:2px solid transparent;padding-left:0;transition:color .18s,transform .18s,border-color .18s,padding-left .18s;}
.ft-link:hover{color:#88E0E5;transform:translateX(4px);border-left-color:rgba(88,193,199,.4);padding-left:6px;}
.ft-bot{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:20px clamp(20px,5vw,64px);}
.ft-copy{font-size:12px;color:rgba(255,255,255,.24);}
.ft-copy a{color:#C5A059;text-decoration:none;}
.ft-note{font-size:11.5px;color:rgba(255,255,255,.18);font-style:italic;font-family:'Cormorant Garamond',serif;}
```

### 7.2 Footer HTML — paste verbatim. Replace `[PAGE_COL]` block for each page.

```html
<!-- ══ GLOBAL FOOTER ══ -->
<footer id="ii-footer">
  <div class="ft-top">
    <div class="ft-brand">
      <a class="ft-logo" href="index.html">
        <svg width="28" height="28" viewBox="0 0 72 72" fill="none">
          <defs><linearGradient id="ft-gl" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#004E55"/><stop offset="100%" stop-color="#2CA4AB"/></linearGradient></defs>
          <path d="M36 20 Q22 24 12 30 L12 52 Q22 46 36 46 Z" fill="url(#ft-gl)"/>
          <path d="M36 20 Q50 24 60 30 L60 52 Q50 46 36 46 Z" fill="url(#ft-gl)" opacity=".8"/>
          <path d="M36 20 L36 46" stroke="#C5A059" stroke-width="1" stroke-linecap="round"/>
          <g transform="translate(36 16)"><path d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill="#C5A059"/><circle r="2" fill="white" opacity=".9"/></g>
        </svg>
        <span><span class="ti">Islamic</span><span class="fo">Info</span></span>
      </a>
      <p class="ft-tag">A digital sanctuary for authentic Islamic knowledge — Qur'an, Hadith, Dua, and verified scholarship. Source-cited. Always free.</p>
      <p class="ft-verse">وَمَا تَوۡفِيقِي إِلَّا بِاللَّهِ — Hud · 11:88</p>
    </div>
    <!-- [PAGE_COL]: page-specific col 1 — heading + 3–5 links relevant to this page -->
    <div>
      <div class="ft-col-h">[Page Section Name]</div>
      <a class="ft-link" href="#">[Link 1]</a>
      <a class="ft-link" href="#">[Link 2]</a>
    </div>
    <div>
      <div class="ft-col-h">Quick Access</div>
      <a class="ft-link" href="quran.html">Quran Explorer</a>
      <a class="ft-link" href="hadith.html">Hadith Library</a>
      <a class="ft-link" href="islamic-studies.html">Islamic Studies</a>
      <a class="ft-link" href="knowledge-hub.html">Knowledge Hub</a>
      <a class="ft-link" href="dua.html">Daily Duas</a>
      <a class="ft-link" href="tools.html">Islamic Tools</a>
      <a class="ft-link" href="habits.html">Habit Tracker</a>
      <a class="ft-link" href="verify.html">Verify a Claim</a>
    </div>
    <div>
      <div class="ft-col-h">Our Ecosystem</div>
      <a class="ft-link" href="https://quranlyai.com" target="_blank" rel="noopener">QuranlyAI ↗</a>
      <a class="ft-link" href="https://islamickids.org" target="_blank" rel="noopener">QuranlyAI ↗</a>
      <a class="ft-link" href="https://mosquefinder.net" target="_blank" rel="noopener">MosqueFinder ↗</a>
      <a class="ft-link" href="https://travellyai.com" target="_blank" rel="noopener">TravellyAI ↗</a>
      <a class="ft-link" href="https://learnspeakai.com" target="_blank" rel="noopener">LearnSpeakAI ↗</a>
    </div>
    <div>
      <div class="ft-col-h">Company</div>
      <a class="ft-link" href="about.html">About</a>
      <a class="ft-link" href="contact.html">Contact</a>
      <div class="ft-col-h" style="margin-top:16px;">Legal</div>
      <a class="ft-link" href="privacy.html">Privacy Policy</a>
      <a class="ft-link" href="terms.html">Terms of Use</a>
    </div>
  </div>
  <div class="ft-bot">
    <div class="ft-copy">© 2026 <a href="index.html">Islamicinfo.org</a> — No ads. No fatwas. No fabricated sources.</div>
    <div class="ft-note">All content source-verified · Privacy-first · Built with sincerity</div>
  </div>
</footer>
```

### 7.3 Per-page column 1 reference

| Page | Col 1 Heading | Links |
|---|---|---|
| Home | Featured | Hero tools, Daily trio, Verify |
| Quran Explorer | Quran | Surahs, WBW, Tafsir, Audio |
| Hadith Library | Hadith | Six Books, By Scholar, Grading |
| Islamic Studies | Curriculum | Foundations, Deepening, Classical |
| Knowledge Hub | Articles | Browse Clusters, FAQ, Latest |
| Daily Duas | Duas | Morning, Evening, Prayer, Travel |
| Tools | Tools | Prayer Times, Qibla, Zakat, Calendar |
| Habit Tracker | Habit Tracker | Prayer Tracker, Fasting, Sunnah |
| Verify | Verify | Verify Hadith, Browse Hadith, Quran |
| About | About | Mission, Team, Contact |


### 7.4 Ecosystem column — global spec (use verbatim in every PRD and page)

The **"Our Ecosystem"** footer column is identical on every page of IslamicInfo.org.  
Display names and URLs are locked — do not add `.com` / `.net` suffixes to the display text.

| Display Name | URL | `rel` |
|---|---|---|
| QuranlyAI | https://quranlyai.com | `noopener` |
| MosqueFinder | https://mosquefinder.net | `noopener` |
| TravellyAI | https://travellyai.com | `noopener` |
| LearnSpeakAI | https://learnspeakai.com | `noopener` |

**HTML (copy verbatim):**
```html
<div class="ft-col-h">Our Ecosystem</div>
<a class="ft-link" href="https://quranlyai.com" target="_blank" rel="noopener">QuranlyAI ↗</a>
<a class="ft-link" href="https://mosquefinder.net" target="_blank" rel="noopener">MosqueFinder ↗</a>
<a class="ft-link" href="https://travellyai.com" target="_blank" rel="noopener">TravellyAI ↗</a>
<a class="ft-link" href="https://learnspeakai.com" target="_blank" rel="noopener">LearnSpeakAI ↗</a>
```

> ⚠️ **PRD rule:** When writing a PRD for any new page on IslamicInfo.org, the footer spec must reference Section 7.4 and use the ecosystem HTML verbatim. Never write the ecosystem URLs or display names from memory.

> **Rule:** The Quick Access column (col 3) is **identical on every page** and always includes all 8 nav destinations including Knowledge Hub.


## 8. THEME TOGGLE + SEARCH + MOBILE MENU — JS (paste at end of `<body>`)

```html
<script>
  /* ── Header scroll state ── */
  const _hdr = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => _hdr.classList.toggle('scrolled', window.scrollY > 16), { passive: true });

  /* ── Theme toggle (localStorage: islamicinfo-theme) ── */
  const themeBtn = document.getElementById('themeBtn');
  const root = document.documentElement;
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    localStorage.setItem('islamicinfo-theme', t);
    themeBtn.innerHTML = t === 'dark'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
  applyTheme(localStorage.getItem('islamicinfo-theme') || 'light');
  themeBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  /* ── Search popup ── */
  const sTrigger = document.getElementById('searchTrigger');
  const sPopup   = document.getElementById('searchPopup');
  const sInput   = document.getElementById('searchPopupInput');
  sTrigger.addEventListener('click', e => { e.stopPropagation(); const o = sPopup.classList.toggle('open'); if (o) setTimeout(() => sInput.focus(), 50); });
  document.addEventListener('click', e => { if (!sPopup.contains(e.target) && e.target !== sTrigger) sPopup.classList.remove('open'); });
  sPopup.addEventListener('keydown', e => { if (e.key === 'Escape') sPopup.classList.remove('open'); });
  sPopup.querySelector('.search-popup-btn').addEventListener('click', () => {
    const q = sInput.value.trim(); if (q) console.log('Search:', q); // wire to backend
    sPopup.classList.remove('open');
  });

  /* ── Mobile menu ── */
  function openMM()  { document.getElementById('mobileMenu').classList.add('open'); }
  function closeMM() { document.getElementById('mobileMenu').classList.remove('open'); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMM(); });

  /* ── Reveal on scroll ── */
  const _ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); _ro.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => _ro.observe(el));
</script>
```

**Rules:**
- localStorage key is `islamicinfo-theme` — never change it.
- Default theme is `light`. Theme attribute lives on `<html>`, not `<body>`.

---

## 9. BUTTONS — four variants

| Class | When to use | Visual |
|---|---|---|
| `.btn-primary` | Main page CTA (one per hero) | Teal gradient, white text, pill 28px radius |
| `.btn-ghost` | Secondary action next to `.btn-primary` | Translucent teal bg, teal text |
| `.btn-glass` | Floating actions on dark/image backgrounds | Frosted white |
| `.btn-white-ghost` | Inside CTA dark sections | Semi-transparent white border |
| `.btn-gold` | Habit tracker premium actions | Gold solid, white text |

### 9.1 Button CSS — paste verbatim

```css
/* ── Primary ── */
.btn-primary {
  background: linear-gradient(135deg, var(--teal-700), var(--teal-500));
  color: white; border: none; border-radius: 28px;
  padding: 13px 28px; font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: 'Inter', sans-serif;
  display: inline-flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 18px rgba(0,105,110,.28);
  text-decoration: none; transition: all .3s var(--ease-premium);
}
.btn-primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 10px 32px rgba(0,105,110,.38);
}

/* ── Ghost ── */
.btn-ghost {
  background: rgba(0,105,110,.07); color: var(--teal-700);
  border: 0.5px solid rgba(0,105,110,.22); border-radius: 28px;
  padding: 13px 28px; font-size: 14px; font-weight: 500; cursor: pointer;
  font-family: 'Inter', sans-serif;
  display: inline-flex; align-items: center; gap: 8px;
  text-decoration: none; backdrop-filter: blur(8px);
  transition: all .3s var(--ease-premium);
}
.btn-ghost:hover {
  background: rgba(0,105,110,.14); color: var(--teal-800);
  border-color: var(--teal-500); transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 28px rgba(0,105,110,.2), 0 0 0 1px rgba(0,105,110,.12);
}

/* ── Glass ── */
.btn-glass {
  background: rgba(255,255,255,.7); backdrop-filter: blur(14px);
  color: var(--ink-primary); border: 0.5px solid rgba(0,105,110,.2);
  box-shadow: var(--elev-1), var(--inner-light);
  border-radius: 28px; padding: 13px 28px; font-size: 14px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
  transition: all .3s var(--ease-premium);
}
.btn-glass:hover { background: rgba(255,255,255,.9); transform: translateY(-2px) scale(1.04); box-shadow: var(--elev-2), 0 0 20px rgba(0,105,110,.12); }
[data-theme="dark"] .btn-glass { background: rgba(21,37,39,.7); color: var(--ink-primary); border-color: rgba(0,105,110,.3); }
[data-theme="dark"] .btn-glass:hover { box-shadow: var(--elev-2), 0 0 20px rgba(88,193,199,.15); }

/* ── White ghost (inside dark CTA sections) ── */
.btn-white-ghost {
  background: rgba(255,255,255,.10); color: rgba(255,255,255,.85);
  border: 0.5px solid rgba(255,255,255,.24); border-radius: 28px;
  padding: 13px 28px; font-size: 14px; font-weight: 500; cursor: pointer;
  font-family: 'Inter', sans-serif;
  display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
  transition: all .25s var(--ease-premium);
}
.btn-white-ghost:hover { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.45); transform: translateY(-2px) scale(1.04); }

/* ── Gold (Habit Tracker) ── */
.btn-gold {
  background: var(--gold-500); color: white; border: none; border-radius: 28px;
  padding: 14px 30px; font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: var(--font-body); display: inline-flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 20px rgba(197,160,89,.38); text-decoration: none;
  transition: all .25s var(--ease-premium);
}
.btn-gold:hover { background: #b8953f; transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 32px rgba(197,160,89,.5); }
```

---

## 10. CARDS

```css
/* ── Base card (all cards inherit this hover system) ── */
.card, .feat-card, .source-pill, .tool-card, .dua-card,
.ev-card, .result-card, .scholar-card, .value-card, .cat-card,
.hijri-card, .qibla-card, .dial-card, .tracker-preview {
  background: var(--surface-card);
  border: 0.5px solid rgba(0,42,44,.08);
  border-radius: var(--r-lg);
  box-shadow: var(--elev-1);
  transition: transform .38s var(--ease-reverent), box-shadow .38s var(--ease-reverent), border-color .38s var(--ease-reverent);
  will-change: transform, box-shadow;
}
[data-theme="dark"] .card,
[data-theme="dark"] .feat-card,
[data-theme="dark"] .tool-card,
[data-theme="dark"] .dua-card { background: #152527; border-color: rgba(0,105,110,.18); }

/* Standard hover lift + teal glow ring */
.card:hover, .feat-card:hover, .tool-card:hover,
.dua-card:hover, .ev-card:hover, .scholar-card:hover {
  transform: translateY(-5px) scale(1.012);
  box-shadow: 0 16px 40px rgba(0,105,110,.13), 0 4px 12px rgba(0,105,110,.08), 0 0 0 1px rgba(0,105,110,.07);
  border-color: rgba(0,105,110,.2);
}
[data-theme="dark"] .card:hover,
[data-theme="dark"] .feat-card:hover,
[data-theme="dark"] .tool-card:hover {
  box-shadow: 0 16px 48px rgba(88,193,199,.18), 0 4px 16px rgba(88,193,199,.1), 0 0 0 1px rgba(88,193,199,.14);
}

/* ── NO shimmer — cards must NOT use ::after sweep animations on hover ── */

/* ── Featured / prominent card ── */
.card-featured { border-color: rgba(0,105,110,.2); box-shadow: var(--elev-2); }

/* ── Mission quote card (About) ── */
.mission-quote-card {
  background: linear-gradient(135deg, rgba(0,105,110,.08), rgba(197,160,89,.06));
  border: 0.5px solid rgba(0,105,110,.15); border-radius: 20px; padding: 28px;
}
[data-theme="dark"] .mission-quote-card { background: linear-gradient(135deg, rgba(0,105,110,.15), rgba(197,160,89,.08)); border-color: rgba(0,105,110,.25); }

/* ── Tool icon ── */
.tool-icon {
  width: 52px; height: 52px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(0,105,110,.12), rgba(0,105,110,.06));
  display: flex; align-items: center; justify-content: center; margin-bottom: 18px;
  transition: transform .3s var(--ease-reverent), box-shadow .3s var(--ease-reverent);
}
.tool-card:hover .tool-icon { transform: scale(1.08) rotate(-3deg); box-shadow: 0 8px 24px rgba(0,105,110,.2); }
```

---

## 11. CTA SECTION — paste verbatim on every page (last section before footer)

### 11.1 CTA HTML

```html
<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <div class="cta-badge reveal"><span style="color:#D9B358;">✦</span> {Eyebrow}</div>
    <h2 class="cta-title reveal">{Heading}<br><em style="font-style:italic;">{Sub-heading}</em></h2>
    <p class="cta-sub reveal">{Supporting text ~1 line}</p>
    <div class="cta-actions reveal">
      <a class="btn-primary" href="#">{Primary CTA}</a>
      <a class="btn-white-ghost" href="#">{Secondary CTA}</a>
    </div>
  </div>
</section>
```

### 11.2 CTA CSS

```css
.cta-section {
  background: linear-gradient(135deg, #0A3A3D, #00696E, #062628);
  padding: clamp(64px,10vw,112px) clamp(20px,5vw,56px);
  text-align: center; position: relative; overflow: hidden;
}
.cta-section::before {
  content: ''; position: absolute; left: -60px; top: -60px;
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(197,160,89,.15), transparent 70%);
  pointer-events: none;
}
.cta-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(32px,6vw,60px); font-weight: 500; color: white;
  letter-spacing: -.025em; line-height: 1.06; margin-bottom: 16px;
  position: relative; z-index: 1;
}
.cta-sub {
  font-size: 16px; color: rgba(255,255,255,.65);
  max-width: 500px; margin: 0 auto 32px; line-height: 1.65;
  position: relative; z-index: 1;
}
.cta-badge {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 9.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: #E2C896; background: rgba(197,160,89,.12); border: 0.5px solid rgba(197,160,89,.25);
  padding: 7px 16px; border-radius: 20px; margin-bottom: 22px;
  position: relative; z-index: 1;
}
.cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
```

---

## 12. REVEAL ANIMATION SYSTEM

All content sections use scroll-triggered reveal. Apply classes to any element.

```css
/* Base reveal state — invisible and shifted down */
.reveal {
  opacity: 0; transform: translateY(28px);
  transition: opacity .65s var(--ease-reverent), transform .65s var(--ease-reverent);
}
.reveal.in { opacity: 1; transform: none; }

/* Delay variants — stagger child elements */
.reveal-d1 { transition-delay: .10s; }
.reveal-d2 { transition-delay: .20s; }
.reveal-d3 { transition-delay: .30s; }
.reveal-d4 { transition-delay: .40s; }
.reveal-d5 { transition-delay: .50s; }
```

**JS** (already included in Section 8 script block):
```js
const _ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); _ro.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => _ro.observe(el));
```

**Usage pattern** — stagger a grid of cards:
```html
<div class="card reveal">…</div>
<div class="card reveal reveal-d1">…</div>
<div class="card reveal reveal-d2">…</div>
```

---

## 13. INTERACTIONS — universal hover system

All hovers use `cubic-bezier(0.22, 1, 0.36, 1)` (`var(--ease-reverent)`).

| Element | Duration | Transform | Glow |
|---|---|---|---|
| Cards | 0.38s | `translateY(-5px) scale(1.012)` | `0 16px 40px rgba(0,105,110,.13)` |
| Buttons (primary/ghost) | 0.28s | `translateY(-2px) scale(1.04)` | `0 8px 28px rgba(0,105,110,.42)` + `0 0 20px rgba(44,164,171,.3)` |
| Nav links / icon buttons | 0.25s | `scale(1.05)` | `0 0 12px rgba(0,105,110,.2)` |
| Footer links | 0.18s | `translateX(4px)` | `border-left-color rgba(88,193,199,.4)` |
| Chips | 0.22s | `scale(1.05)` | `0 4px 12px rgba(0,105,110,.25)` |
| Tool icons (inside cards) | 0.30s | `scale(1.08) rotate(-3deg)` | `0 8px 24px rgba(0,105,110,.2)` |
| Brand mark | 0.50s | `scale(1.06)` | `halo-pulse animation` |

**Dark mode glow overrides:** swap `rgba(0,105,110,…)` → `rgba(88,193,199,…)` at ~1.25× opacity.

---

## 14. STATS BANNER

Used on About page. Dark teal background, 4-column grid.

```html
<div class="stats-banner">
  <div class="stat-item reveal"><div class="stat-num">6,236</div><div class="stat-label">Qur'an Verses</div></div>
  <div class="stat-item reveal reveal-d1"><div class="stat-num">12,000+</div><div class="stat-label">Hadith Records</div></div>
  <div class="stat-item reveal reveal-d2"><div class="stat-num">300+</div><div class="stat-label">Verified Duas</div></div>
  <div class="stat-item reveal reveal-d3"><div class="stat-num">0</div><div class="stat-label">Ads. Fatwas. Opinions.</div></div>
</div>
```

```css
.stats-banner {
  display: grid; grid-template-columns: repeat(4,1fr);
  background: linear-gradient(135deg, var(--teal-900), #062628);
  padding: clamp(36px,5vw,56px) clamp(20px,5vw,64px);
  gap: 24px; border-bottom: 0.5px solid rgba(255,255,255,.07);
}
@media(max-width:700px){ .stats-banner{ grid-template-columns:repeat(2,1fr); } }
.stat-item { text-align: center; }
.stat-num { font-family: var(--font-serif); font-size: clamp(32px,5vw,52px); font-weight: 500; color: white; line-height: 1; margin-bottom: 8px; }
.stat-label { font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.4); }
```

---

## 15. DUA PAGE COMPONENTS

### 15.1 Dua card CSS

```css
.dua-card { padding: 28px; }
.dua-arabic { font-family: var(--font-arabic); font-size: 20px; direction: rtl; text-align: right; color: var(--ink-primary); line-height: 1.9; margin-bottom: 14px; }
[data-theme="dark"] .dua-arabic { color: var(--teal-300); }
.dua-translation { font-family: var(--font-serif); font-size: 14.5px; color: var(--ink-muted); line-height: 1.65; margin-bottom: 16px; }
.dua-transliteration { font-size: 12.5px; font-style: italic; color: var(--gold-700); margin-bottom: 10px; line-height: 1.6; }
.dua-source { font-size: 10.5px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-subtle); padding-top: 12px; border-top: 0.5px solid rgba(0,105,110,.1); }
.dua-btn { font-size: 11.5px; font-weight: 500; padding: 6px 14px; border-radius: 16px; border: 0.5px solid rgba(0,105,110,.18); color: var(--ink-muted); background: transparent; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all .2s var(--ease-premium); }
.dua-btn:hover { background: rgba(0,105,110,.08); color: var(--teal-700); border-color: rgba(0,105,110,.3); }

/* Category grid */
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 14px; }
.cat-card { background: var(--surface-card); border: 0.5px solid rgba(0,42,44,.08); border-radius: 16px; padding: 22px 18px; text-align: center; cursor: pointer; transition: all .35s var(--ease-reverent); text-decoration: none; display: block; }
[data-theme="dark"] .cat-card { background: var(--white); border-color: rgba(0,105,110,.15); }
.cat-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 32px rgba(0,105,110,.12), 0 0 0 1px rgba(0,105,110,.1); }
.cat-icon { font-size: 28px; margin-bottom: 10px; display: block; }
.cat-filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }

/* Featured Dua */
.featured-dua { background: linear-gradient(135deg, var(--teal-900), var(--teal-800), #062628); border-radius: 28px; padding: clamp(36px,5vw,56px); position: relative; overflow: hidden; }
.featured-dua::before { content: ''; position: absolute; right: -60px; top: -60px; width: 260px; height: 260px; background: radial-gradient(circle, rgba(197,160,89,.12), transparent 65%); pointer-events: none; }

/* Search bar */
.dua-search { max-width: 560px; margin: 0 auto 36px; position: relative; }
.dua-search input { width: 100%; padding: 14px 20px 14px 46px; border: 1px solid rgba(0,105,110,.18); border-radius: 999px; background: var(--surface-card); font-family: var(--font-body); font-size: 14px; color: var(--ink-primary); outline: none; transition: border-color .2s, box-shadow .2s; }
.dua-search input:focus { border-color: var(--teal-500); box-shadow: 0 0 0 4px rgba(44,164,171,.12); }
.dua-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 20px; }
```

---

## 16. TOOLS PAGE COMPONENTS

### 16.1 Tool card grid

```css
.tools-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 20px; }
.tool-card { padding: 28px; cursor: pointer; text-decoration: none; display: block; }
.tool-title { font-size: 17px; font-weight: 600; color: var(--ink-primary); margin-bottom: 8px; }
.tool-desc { font-size: 13.5px; color: var(--ink-muted); line-height: 1.6; }
.tool-link { font-size: 12px; font-weight: 600; color: var(--teal-700); letter-spacing: .06em; text-transform: uppercase; margin-top: 16px; display: inline-flex; align-items: center; gap: 5px; }
```

### 16.2 Prayer widget

```css
.prayer-widget { background: linear-gradient(135deg, var(--teal-900), var(--teal-800)); border-radius: 24px; padding: clamp(24px,3vw,36px); color: white; position: relative; overflow: hidden; }
.prayer-widget::before { content: ''; position: absolute; right: -40px; top: -40px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(197,160,89,.15), transparent 65%); }
.pw-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.pw-location { font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.5); }
.pw-date { font-size: 13px; color: rgba(255,255,255,.65); }
.pw-prayers { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; margin-top: 16px; }
@media(max-width:600px){ .pw-prayers{ grid-template-columns: repeat(3,1fr); } }
.pw-name { font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.45); margin-bottom: 4px; }
.pw-time { font-family: var(--font-serif); font-size: 18px; font-weight: 500; color: white; }
.pw-next-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #E2C896; background: rgba(197,160,89,.15); border: 0.5px solid rgba(197,160,89,.3); padding: 5px 12px; border-radius: 16px; }
```

### 16.3 Qibla compass

```css
.qibla-card { padding: 36px; text-align: center; }
.compass-wrap { width: 200px; height: 200px; margin: 24px auto; position: relative; }
.compass-ring { width: 100%; height: 100%; border-radius: 50%; border: 1px solid rgba(0,105,110,.2); display: flex; align-items: center; justify-content: center; position: relative; }
.compass-center { width: 12px; height: 12px; border-radius: 50%; background: var(--teal-700); position: absolute; }
.compass-needle { width: 3px; height: 80px; background: linear-gradient(to bottom, var(--gold-500) 50%, rgba(0,105,110,.4) 50%); border-radius: 2px; transform-origin: bottom center; transform: rotate(-35deg); transition: transform .8s var(--ease-reverent); }
.compass-ka { position: absolute; top: 10px; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--gold-700); }
.qibla-deg { font-family: var(--font-serif); font-size: 36px; font-weight: 500; color: var(--teal-700); }
.qibla-city { font-size: 11px; color: var(--ink-muted); letter-spacing: .08em; text-transform: uppercase; }
```

### 16.4 Hijri calendar

```css
.hijri-card { padding: 28px; }
.hc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.hc-month { font-family: var(--font-serif); font-size: 22px; font-weight: 500; color: var(--ink-primary); }
.hc-month-ar { font-family: var(--font-arabic); font-size: 14px; direction: rtl; color: var(--ink-muted); }
.hc-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; text-align: center; }
.hc-day-name { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-subtle); padding: 4px 0; }
.hc-day { font-size: 13px; padding: 8px 4px; border-radius: 8px; cursor: pointer; transition: all .2s; color: var(--ink-body); }
.hc-day:hover { background: rgba(0,105,110,.08); color: var(--teal-700); }
.hc-day.today { background: var(--teal-700); color: white; border-radius: 8px; }
.hc-event { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 0.5px solid rgba(0,105,110,.08); }
.hc-event-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-500); flex-shrink: 0; }
.hc-event-name { font-size: 13.5px; font-weight: 500; color: var(--ink-primary); }
.hc-event-date { font-size: 12px; color: var(--ink-muted); margin-left: auto; }
```

---

## 17. VERIFY PAGE COMPONENTS

```css
/* Main verify input box */
.verify-box {
  max-width: 980px; margin: 0 auto 48px;
  background: rgba(255,255,255,.88); backdrop-filter: blur(20px);
  border: 1px solid rgba(0,105,110,.18); border-radius: 28px;
  padding: 40px 44px 32px;
  box-shadow: var(--elev-3), 0 0 0 1px rgba(0,105,110,.04), inset 0 1px 0 rgba(255,255,255,.7);
}
[data-theme="dark"] .verify-box { background: rgba(21,37,39,.90); border-color: rgba(0,105,110,.30); }
.verify-box-label { font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 10px; }
.verify-box-hint { font-size: 11px; color: var(--ink-subtle); margin-top: 8px; }

/* Result pill badges */
.result-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(15,110,86,.1); border: 1px solid rgba(15,110,86,.3); border-radius: 999px; font-size: 11px; letter-spacing: .14em; font-weight: 700; text-transform: uppercase; color: var(--grade-sahih); margin-bottom: 20px; }
.result-pill .rdot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 8px currentColor; animation: pulse 2s ease infinite; }

/* Authenticity dial */
.dial-card { padding: 32px; text-align: center; background: radial-gradient(70% 100% at 50% 0%, rgba(197,160,89,.12), transparent 60%), var(--surface-card); border-color: rgba(197,160,89,.25) !important; }
[data-theme="dark"] .dial-card { background: radial-gradient(70% 100% at 50% 0%, rgba(197,160,89,.08), transparent 60%), var(--white); }
.big-dial { width: 180px; height: 180px; margin: 0 auto 16px; position: relative; }
.big-dial svg { width: 100%; height: 100%; transform: rotate(-90deg); }

/* Evidence grid */
.evidence-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; margin-bottom: 32px; }
@media(max-width:680px){ .evidence-grid{ grid-template-columns: 1fr; } }
.ev-arabic { font-family: var(--font-arabic); font-size: 16px; direction: rtl; text-align: right; color: var(--teal-700); line-height: 1.9; margin-bottom: 10px; }
.ev-trans { font-size: 13.5px; color: var(--ink-muted); line-height: 1.6; font-style: italic; }
.ev-ref { font-size: 10.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-subtle); margin-top: 10px; }

/* Chip color variants */
.chip-teal { background: rgba(0,105,110,.10); color: var(--teal-700); border-color: rgba(0,105,110,.2); }
[data-theme="dark"] .chip-teal { color: var(--teal-300); }
.chip-gold { background: rgba(197,160,89,.1); color: var(--gold-700); border-color: rgba(197,160,89,.25); }
```

---

## 18. HABIT TRACKER COMPONENTS

### 18.1 Sunnah Score Orb (hero centerpiece)

```css
/* 3D orb */
.orb-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
.orb {
  width: 140px; height: 140px; border-radius: 50%;
  background: conic-gradient(from 0deg, var(--teal-700), var(--teal-500), var(--gold-500), var(--teal-700));
  animation: orb-spin 8s linear infinite;
  box-shadow: 0 0 60px rgba(0,105,110,.4), inset 0 0 40px rgba(197,160,89,.1);
  position: relative; cursor: pointer;
}
.orb::after { content: ''; position: absolute; inset: 8px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.25), transparent 60%); pointer-events: none; }
@keyframes orb-spin { 0%{filter:hue-rotate(0);} 100%{filter:hue-rotate(30deg);} }
.orb-label { font-family: var(--font-serif); font-size: 18px; font-weight: 500; color: var(--ink-primary); margin-top: 12px; text-align: center; }
.orb-sub { font-size: 12px; color: var(--ink-muted); letter-spacing: .08em; text-transform: uppercase; text-align: center; }

/* Compact orb variant */
.orb-container-sm { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 18px 0 10px; }
.orb-sm { width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(from 0deg, var(--teal-700), var(--teal-500), var(--gold-500), var(--teal-700)); animation: orb-spin 8s linear infinite; box-shadow: 0 0 32px rgba(0,105,110,.35); }
```

### 18.2 Score ring SVG

```css
.score-ring-wrap { display: flex; align-items: center; gap: 16px; padding: 14px 0 0; border-top: 0.5px solid rgba(0,105,110,.1); }
.score-ring-svg { flex-shrink: 0; }
.score-ring-num { font-family: var(--font-serif); font-size: 28px; font-weight: 500; color: var(--teal-700); line-height: 1; }
.score-ring-text { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }
```

### 18.3 Week strip & day pills

```css
.week-strip { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin: 28px 0; }
.day-pill { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 16px; border-radius: 14px; border: 0.5px solid rgba(0,105,110,.15); background: var(--surface-card); cursor: pointer; min-width: 52px; transition: transform .38s var(--ease-reverent), box-shadow .38s var(--ease-reverent); }
.day-pill.today { border-color: var(--teal-700); background: rgba(0,105,110,.06); }
.day-pill.done { border-color: var(--gold-500); background: rgba(197,160,89,.06); }
.day-name { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-muted); }
.day-num { font-family: var(--font-serif); font-size: 18px; font-weight: 500; color: var(--ink-primary); }
.day-dots { display: flex; gap: 3px; }
.day-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(0,105,110,.15); }
.day-dot.filled { background: var(--teal-700); }
```

### 18.4 Heatmap

```css
.heatmap { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; margin-top: 16px; }
.heatmap-label { font-size: 10px; color: var(--ink-muted); margin-bottom: 6px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
.heat-cell { aspect-ratio: 1; border-radius: 4px; background: rgba(0,105,110,.07); cursor: pointer; transition: transform .2s var(--ease-reverent), box-shadow .2s; }
[data-theme="dark"] .heat-cell { background: rgba(0,105,110,.12); }
.heat-cell:hover { transform: scale(1.15); box-shadow: 0 0 10px rgba(0,105,110,.3); }
.heat-cell[data-level="1"] { background: rgba(0,105,110,.2); }
.heat-cell[data-level="2"] { background: rgba(0,105,110,.4); }
.heat-cell[data-level="3"] { background: rgba(0,105,110,.65); }
.heat-cell[data-level="4"] { background: var(--teal-700); }
```

### 18.5 Prayer check circles

```css
.prayers-row { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; margin-bottom: 24px; }
@media(max-width:480px){ .prayers-row{ grid-template-columns: repeat(3,1fr); } }
.prayer-check { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.p-name { font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-muted); }
.p-circle { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid rgba(0,105,110,.2); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .25s var(--ease-premium); }
.p-circle:hover { border-color: var(--teal-700); box-shadow: 0 0 14px rgba(0,105,110,.2); }
.p-circle.checked { background: var(--teal-700); border-color: var(--teal-700); box-shadow: 0 0 18px rgba(0,105,110,.35); }
.p-check-icon { color: white; opacity: 0; transform: scale(.5); transition: all .2s; }
.p-circle.checked .p-check-icon { opacity: 1; transform: scale(1); }
```

### 18.6 Progress bars & tabs

```css
.progress-section { margin-bottom: 20px; }
.prog-label { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--ink-muted); margin-bottom: 6px; }
.prog-bar { height: 7px; border-radius: 20px; background: rgba(0,105,110,.1); overflow: hidden; }
[data-theme="dark"] .prog-bar { background: rgba(0,105,110,.2); }
.prog-fill { height: 100%; border-radius: 20px; background: linear-gradient(90deg, var(--teal-700), var(--teal-500)); transition: width .8s var(--ease-reverent); }

.tabs { display: flex; gap: 4px; background: rgba(0,105,110,.06); border-radius: 12px; padding: 4px; margin-bottom: 24px; }
[data-theme="dark"] .tabs { background: rgba(0,105,110,.12); }
.tab { flex: 1; padding: 8px 12px; border-radius: 9px; border: none; background: transparent; font-family: var(--font-body); font-size: 12.5px; font-weight: 500; color: var(--ink-muted); cursor: pointer; transition: all .2s var(--ease-premium); }
.tab.active { background: var(--surface-card); color: var(--teal-700); box-shadow: var(--elev-1); font-weight: 600; }
[data-theme="dark"] .tab.active { background: var(--white); }
```

### 18.7 Streak badge & toast

```css
.streak-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 11.5px; font-weight: 700; background: linear-gradient(135deg, rgba(197,160,89,.15), rgba(197,160,89,.08)); border: 0.5px solid rgba(197,160,89,.3); color: var(--gold-700); }
[data-theme="dark"] .streak-badge { color: #E2C896; }

.toast { position: fixed; bottom: 28px; right: 28px; z-index: 400; display: flex; align-items: center; gap: 10px; background: #0F1B1D; color: white; border: 0.5px solid rgba(0,105,110,.3); border-radius: 16px; padding: 14px 20px; box-shadow: var(--elev-4); opacity: 0; pointer-events: none; transform: translateY(8px); transition: all .3s var(--ease-premium); font-size: 14px; }
.toast.show { opacity: 1; pointer-events: all; transform: translateY(0); }
.toast-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--teal-500); box-shadow: 0 0 8px rgba(44,164,171,.5); }
```

---

## 19. CHIPS & SCOPE FILTERS

```css
.chip {
  font-size: 12px; font-weight: 500; padding: 6px 15px; border-radius: 20px;
  border: 0.5px solid rgba(0,105,110,.18); color: var(--ink-muted);
  background: rgba(0,105,110,.05); cursor: pointer;
  transition: all .25s var(--ease-premium);
}
.chip:hover, .chip.active {
  background: var(--teal-700); color: white; border-color: transparent;
  box-shadow: 0 4px 12px rgba(0,105,110,.25); transform: scale(1.05);
}
.chip-teal { background: rgba(0,105,110,.10); color: var(--teal-700); border-color: rgba(0,105,110,.2); }
.chip-gold { background: rgba(197,160,89,.1); color: var(--gold-700); border-color: rgba(197,160,89,.25); }
```

---

## 20. TYPOGRAPHY UTILITIES

```css
.t-display-2xl { font-family: var(--font-display); font-size: clamp(44px, 8vw, 78px); font-weight: 600; line-height: 1.04; letter-spacing: -.025em; color: var(--ink-primary); }
.t-display-lg  { font-family: var(--font-display); font-size: clamp(30px,5vw,50px); font-weight: 500; line-height: 1.1; letter-spacing: -.02em; color: var(--ink-primary); }
[data-theme="dark"] .t-display-2xl, [data-theme="dark"] .t-display-lg { color: var(--ink-primary); }
.arabic { font-family: var(--font-arabic); direction: rtl; text-align: right; }

/* Gradient text variants */
.gradient-italic, .grad-it {
  font-style: italic;
  background: linear-gradient(90deg, var(--teal-700) 0%, var(--teal-500) 55%, var(--gold-500) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.gold-it {
  font-style: italic;
  background: linear-gradient(90deg, var(--gold-700), var(--gold-500));
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

/* Hijri pill */
.hijri-pill { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--teal-700); background: rgba(0,105,110,.08); border: 0.5px solid rgba(0,105,110,.18); padding: 7px 16px; border-radius: 20px; }
.hijri-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal-500); animation: pulse-dot 2.5s ease infinite; }
.hijri-pill .sep { width: 1px; height: 12px; background: rgba(0,105,110,.25); }
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.7);} }

/* Hadith grade badges */
.grade { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; }
.grade-sahih { color: var(--grade-sahih); background: rgba(15,110,86,.1); border: 0.5px solid rgba(15,110,86,.25); }
.grade-hasan { color: var(--grade-hasan); background: rgba(93,138,58,.1); border: 0.5px solid rgba(93,138,58,.25); }
.grade-daif  { color: var(--grade-daif);  background: rgba(168,105,50,.1); border: 0.5px solid rgba(168,105,50,.25); }
```

---

## 21. FAQ ACCORDION (About page)

```html
<div class="faq-grid">
  <div class="faq-item">
    <div class="faq-q" onclick="this.parentElement.classList.toggle('open')">
      {Question}
      <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </div>
    <div class="faq-a" style="padding:0 22px;"><p style="padding-bottom:18px;font-size:14.5px;color:var(--ink-muted);line-height:1.7;">{Answer}</p></div>
  </div>
</div>
```

```css
.faq-grid { display: flex; flex-direction: column; gap: 10px; max-width: 740px; margin: 0 auto; }
.faq-item { border: 0.5px solid rgba(0,105,110,.12); border-radius: 16px; overflow: hidden; transition: border-color .25s; }
.faq-item.open { border-color: rgba(0,105,110,.25); }
.faq-q { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; cursor: pointer; font-size: 15px; font-weight: 500; color: var(--ink-primary); }
[data-theme="dark"] .faq-q { color: var(--ink-primary); }
.faq-a { max-height: 0; overflow: hidden; transition: max-height .4s var(--ease-reverent), padding .3s; }
.faq-item.open .faq-a { max-height: 300px; }
.faq-chevron { color: var(--teal-700); transition: transform .3s var(--ease-reverent); flex-shrink: 0; }
.faq-item.open .faq-chevron { transform: rotate(180deg); }
```

---

## 22. ABOUT PAGE — LAYOUT COMPONENTS

```css
/* Scholars grid */
.scholars-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap: 20px; }
.scholar-card { padding: 28px; text-align: center; }
.scholar-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(0,105,110,.15), rgba(197,160,89,.1)); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 28px; }
.scholar-name { font-family: var(--font-serif); font-size: 18px; font-weight: 500; color: var(--ink-primary); margin-bottom: 4px; }
.scholar-era { font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--gold-700); margin-bottom: 10px; }
.scholar-desc { font-size: 13px; color: var(--ink-muted); line-height: 1.6; }
.scholar-badge { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; background: rgba(0,105,110,.08); color: var(--teal-700); border: 0.5px solid rgba(0,105,110,.15); margin-top: 10px; }

/* Values grid */
.values-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap: 16px; }
.value-card { padding: 24px; }
.vc-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; font-size: 20px; }
.vc-teal { background: rgba(0,105,110,.1); }
.vc-gold { background: rgba(197,160,89,.12); }
.vc-title { font-size: 16px; font-weight: 600; color: var(--ink-primary); margin-bottom: 8px; }
.vc-desc { font-size: 13.5px; color: var(--ink-muted); line-height: 1.65; }

/* Source pills */
.sources-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.source-pill { display: inline-flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 14px; cursor: pointer; }
.sp-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(0,105,110,.1); display: flex; align-items: center; justify-content: center; }
.sp-name { font-size: 13.5px; font-weight: 600; color: var(--ink-primary); }
.sp-type { font-size: 11px; color: var(--ink-muted); }

/* Mission grid */
.mission-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(32px,5vw,64px); align-items: start; }
@media(max-width:820px){ .mission-grid{ grid-template-columns: 1fr; } }
.mission-lead { font-family: var(--font-serif); font-size: clamp(18px,2.5vw,22px); color: var(--ink-primary); line-height: 1.55; margin-bottom: 20px; font-style: italic; }
.mission-body { font-size: 15px; color: var(--ink-muted); line-height: 1.75; }
```

---

## 23. RESPONSIVE BREAKPOINTS — global ladder

| Breakpoint | What changes |
|---|---|
| `≤ 1100px` | Footer 3-column; nav-link font 11.5px |
| `≤ 900px`  | Nav-link 10.5px; brand 16px; brand-mark 28×28 |
| `≤ 760px`  | Nav hidden; hamburger shown; only theme + search in tools |
| `≤ 700px`  | Footer 2-column; stats-banner 2-column; brand col spans both |
| `≤ 440px`  | Footer 1-column; cards stack |

---

## 24. ENFORCEMENT CHECKLIST (run before shipping any new page)

- [ ] `<html lang="en" data-theme="light">` opening tag
- [ ] Fonts: `Cormorant Garamond + Inter + Amiri` preconnected and imported in this exact order
- [ ] CSS `:root` block exactly as Section 1 — all 50+ tokens present
- [ ] Dark-mode sibling block present and **unmerged**
- [ ] Navbar HTML matches Section 4.3 — logo far-left, nav centered, tools far-right
- [ ] All **10** nav items present, in order (Section 4.1): Home → Quran Explorer → Hadith Library → Islamic Studies → **Knowledge Hub** → Daily Duas → Tools → Habit Tracker → Verify → About. Correct `.active` class on current page.
- [ ] Mobile menu HTML (Section 4.7) included on every page
- [ ] Hamburger button visible only on `≤ 760px`
- [ ] Bismillah is first child of `.hero-inner` (Section 5)
- [ ] Bismillah is teal-gradient in light, gold-gradient + glow in dark (Section 5.1 colors)
- [ ] Hero `<h1>` uses `var(--font-display)`, has `<span class="gradient-italic">` for emphasis
- [ ] Hero has `.btn-primary` CTA + optional `.btn-ghost`
- [ ] Floating `.geo` SVGs present in hero (4 decorators)
- [ ] All hover transitions use `var(--ease-reverent)` / `var(--ease-premium)`
- [ ] Cards use canonical hover spec (translateY(-5px) scale(1.012) + glow ring, NO shimmer ::after sweep)
- [ ] CTA section present and is last section before footer (Section 11)
- [ ] Footer HTML matches Section 7.1 verbatim — including locked strings and Ecosystem order
- [ ] LearnSpeakAI is 4th item in **Ecosystem** column (not bottom bar)
- [ ] Script block (Section 8) includes: theme toggle + search popup + mobile menu + reveal observer
- [ ] `.reveal` class added to all section content; `.reveal-d1/d2/d3` used for stagger
- [ ] Tested in both light and dark mode
- [ ] Mobile breakpoints 1100/900/760/700/440 all correct

---

## 25. WHEN IN DOUBT

1. Open the blueprint HTML files side-by-side.
2. Find a similar component.
3. Copy exact CSS, exact HTML structure.
4. Adapt only page-specific copy.
5. **Do not** clean up, modernize, restructure, or refactor anything visible.

If a change feels necessary, **stop and ask.** The blueprints have already been approved.

---

## 26. MULTI-SITE NOTES

This system underlies QuranlyAI (quranlyai.com), MosqueFinder (mosquefinder.net), TravellyAI (travellyai.com), LearnSpeakAI (learnspeakai.com). When building a sibling site, keep teal + gold palette, easing curves, typography stack, theme toggle pattern, hover system, and card/button vocabulary identical. Swap brand text only. Adjust nav items for that site's IA.

---

*End of CLAUDE.md — IslamicInfo Design System v2.0*

## 27. PAGE ARCHITECTURE & OVERLAP RULES (v3.0 addition)

### 27.1 Page Architecture — Islamic Studies vs Knowledge Hub

These two pages serve different SEO and UX purposes. **Never blend their content.**

| | Islamic Studies (`islamic-studies.html`) | Knowledge Hub (`knowledge-hub.html`) |
|---|---|---|
| **Purpose** | Structured curriculum — school | Encyclopedia — library |
| **SEO keywords** | "learn islam", "islamic curriculum", "how to study islam" | "what is tawhid", "five pillars", "is music haram" (long-tail) |
| **Content** | Pathways, lesson sequences, prerequisites, quizzes, progress | 2,000+ standalone articles, clusters, FAQ, search |
| **Order** | Sequential — must follow prerequisites | Free-form — read anything in any order |
| **Article listings** | ❌ NO article browsing grids | ✅ Yes — full article library |
| **Lesson sequences** | ✅ Yes | ❌ No |
| **Cross-links** | Lessons link OUT to KH for reading material | KH links back to IS for structured learning |

> **Rule:** Islamic Studies must NEVER contain a browsable article grid. That belongs in Knowledge Hub.  
> **Rule:** Knowledge Hub must NEVER contain lesson prerequisites or progress tracking. That belongs in Islamic Studies.

### 27.2 Navigation — global order locked

```
Home | Quran Explorer | Hadith Library | Islamic Studies | Knowledge Hub | Daily Duas | Tools | Habit Tracker | Verify | About
```

- Knowledge Hub is at position 5, immediately after Islamic Studies.
- Never place Knowledge Hub elsewhere.
- Never use `islamic-studies.html` — always `islamic-studies.html`.

### 27.3 Footer — global column 3 locked

The "Quick Access" column (col 3) of the footer **always** contains:
```
Quran Explorer · Hadith Library · Islamic Studies · Knowledge Hub · Daily Duas · Islamic Tools · Habit Tracker · Verify a Claim
```
Knowledge Hub is always listed in Quick Access. Do not remove it.

### 27.4 NO-SHIMMER RULE (absolute)

```css
/* ✗ NEVER USE — shimmer sweep on ::after */
.card::after {
  content: '';
  background: linear-gradient(105deg, transparent, rgba(255,255,255,.4), transparent);
  animation: shimmer ...;   /* BANNED */
  left: -100%;              /* BANNED */
}
.card:hover::after { left: 150%; } /* BANNED */
```

**Reason:** The white light sweep across cards is visually jarring and inconsistent with the site's premium aesthetic. Use glow shadows instead.

**Approved card hover (use this always):**
```css
.card:hover {
  transform: translateY(-5px) scale(1.012);
  box-shadow:
    0 16px 40px rgba(0,105,110,.13),
    0 4px 12px rgba(0,105,110,.08),
    0 0 0 1px rgba(0,105,110,.07);
  border-color: rgba(0,105,110,.2);
}
[data-theme="dark"] .card:hover {
  box-shadow:
    0 16px 48px rgba(88,193,199,.18),
    0 4px 16px rgba(88,193,199,.1),
    0 0 0 1px rgba(88,193,199,.14);
}
```

