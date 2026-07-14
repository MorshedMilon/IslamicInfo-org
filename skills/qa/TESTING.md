# TESTING.md — islamicinfo.org
**QA Standard for Every Page. Non-negotiable.**

> Every page must pass this before moving to the next.
> Design system authority: `CLAUDE.md v3.0`
> QA automation: `docs/skill/qa-skill/SKILL.md`
> Islamic content rules: `docs/islamic-authenticity.md`

---

## The Rule

> **Build a page → Run QA → Fix blockers → Get localhost link → Move to next page.**
> Never skip QA. Never build two pages without QA between them.

---

## Quick Start — After Every Page Build

```bash
# 1. Start server (if not already running)
npx serve . -p 3000 &

# 2. Your page is live at:
http://localhost:3000/[page].html

# 3. In Claude Code, trigger QA:
"QA this page" or "run the checklist for [page].html"

# 4. Claude will automatically:
#    → Open Chrome → check console → test all breakpoints
#    → Dark mode → nav → performance → output report
```

---

## Page Build Order & QA Gate

Work through pages in this order. Each has a QA gate before proceeding.

| # | Page | File | QA Status |
|---|------|------|-----------|
| 1 | Home | `index.html` | [ ] |
| 2 | Quran Explorer | `quran.html` | [ ] |
| 3 | Hadith Library | `hadith.html` | [ ] |
| 4 | Islamic Studies | `islamic-studies.html` | [ ] |
| 5 | Knowledge Hub | `knowledge-hub.html` | [ ] |
| 6 | Daily Duas | `duas.html` | [ ] |
| 7 | Islamic Tools | `tools.html` | [ ] |
| 8 | Habit Tracker | `habits.html` | [ ] |
| 9 | Verify a Claim | `verify.html` | [ ] |
| 10 | About | `about.html` | [ ] |

Mark `[x]` only after full QA passes with zero blockers.

---

## Mandatory QA Checklist (Every Page)

### 🖥️ Server
- [ ] `npx serve . -p 3000` running without errors
- [ ] Page loads at `http://localhost:3000/[page].html`
- [ ] No redirect loops or 404 on the page itself

### 🔴 Console (Zero Tolerance)
- [ ] Zero red console errors
- [ ] No 404 on CSS files
- [ ] No 404 on JS files
- [ ] No 404 on fonts
- [ ] No 404 on images/icons
- [ ] Warnings logged but not blocking

### 🎨 Blueprint Fidelity (CLAUDE.md §0)
- [ ] Teal + Gold palette — no rogue colors
- [ ] Inter/system-ui font stack
- [ ] Nav: exactly 10 items, correct order
- [ ] Logo: `Islamic` + `Info` span structure
- [ ] Hero section matches blueprint
- [ ] Footer: 3-column layout
- [ ] Dark/light mode toggle in nav
- [ ] Card hover effects match approved pattern

### 📱 Mobile (375px — iPhone SE) — CRITICAL
- [ ] Hamburger menu visible
- [ ] Hamburger opens/closes correctly
- [ ] Single column layout
- [ ] Zero horizontal scroll
- [ ] Body text min 16px
- [ ] Buttons min 44px tap target
- [ ] No content clipped at edges
- [ ] Hero readable and not overcrowded
- [ ] Cards stack vertically

### 📱 Mobile (390px — iPhone 14)
- [ ] Same as 375px checks
- [ ] No new layout issues at this size

### 📟 Tablet (768px)
- [ ] Cards reflow to 2-column
- [ ] Nav correct (hamburger or compact)
- [ ] Footer 2-column
- [ ] No text overflow

### 🖥️ Desktop (1280px)
- [ ] Full nav visible, no overflow
- [ ] Cards in correct columns (3–4)
- [ ] No horizontal scroll
- [ ] Footer 3-column

### 🖥️ Desktop Large (1440px)
- [ ] Same as 1280px
- [ ] Content not stretched beyond max-width
- [ ] Centered container correct

### 🌙 Dark Mode
- [ ] Toggle switches correctly
- [ ] Dark background renders
- [ ] Text readable in dark mode
- [ ] Accents (teal/gold) visible
- [ ] Preference saved in localStorage
- [ ] Persists on page reload

### 🧭 Navigation
- [ ] All 10 nav items present
- [ ] Correct order: Home → Quran → Hadith → Islamic Studies → Knowledge Hub → Duas → Tools → Habits → Verify → About
- [ ] Active page highlighted
- [ ] Logo links to index.html
- [ ] No broken internal links on this page

### ⚡ Performance
- [ ] No failed network requests
- [ ] Page weight logged (target: under 500KB)
- [ ] No render-blocking errors
- [ ] Fonts load without long FOUT

### 📖 Islamic Content (Hadith/Qur'an pages only)
- [ ] All hadith have: collection + number + grade label
- [ ] Weak hadith show ⚠️ DA'IF warning
- [ ] No hadith without authenticity label
- [ ] All Qur'an verses cite surah + ayah
- [ ] No fatwa content
- [ ] Ref: `docs/islamic-authenticity.md`

---

## Localhost Links — All Pages

```
http://localhost:3000/index.html
http://localhost:3000/quran.html
http://localhost:3000/hadith.html
http://localhost:3000/islamic-studies.html
http://localhost:3000/knowledge-hub.html
http://localhost:3000/duas.html
http://localhost:3000/tools.html
http://localhost:3000/habits.html
http://localhost:3000/verify.html
http://localhost:3000/about.html
```

**Share with team for review:** Replace `localhost` with your machine's
local IP (e.g. `192.168.x.x`) for mobile device testing on same network.

---

## Blocker Definitions

| Severity | Definition | Action |
|----------|------------|--------|
| 🔴 BLOCKER | Console error, broken layout, 404 asset, horizontal scroll | Fix now. Do not proceed. |
| 🟡 WARNING | Minor visual drift, slow font load, missing hover | Fix before site launch |
| 🔵 NOTE | Future page 404 in nav, deprecation warning | Log in qa-log.md, monitor |

---

## QA Log

All QA results are appended to `docs/qa-log.md` automatically.
Format per entry:

```markdown
## YYYY-MM-DD HH:MM — [page].html
- Status    : PASS / FAIL
- Blockers  : [count and description or "none"]
- Warnings  : [count or "none"]
- Page size : [KB]
- Mobile    : PASS / FAIL
- Desktop   : PASS / FAIL
- Dark mode : PASS / FAIL
- Notes     : [any]
```

---

## How Claude Code Uses This File

When you say any of the following, Claude Code reads this file
and runs the full QA sequence automatically:

- `"QA this page"`
- `"Run the checklist"`
- `"Check it in the browser"`
- `"Give me the localhost link"`
- `"Test responsiveness"`
- `"Done building [page]"`
- `"Check for errors"`
- `"Verify the page"`

Claude will open Chrome, run all breakpoint tests, check the console,
and output the QA report with your localhost link.

---

## Project Folder Reference

```
IslamicInfo.org/
├── .claude/
│   └── CLAUDE.md                     ← Design system v3.0 (locked)
├── docs/
│   ├── brand/
│   │   └── ISLAMICINFO_BRAND_IDENTITY.md
│   ├── architecture/
│   │   └── ARCHITECTURE.md
│   ├── skill/
│   │   ├── SKILL.md                  ← islamicinfo-brand skill
│   │   └── qa-skill/
│   │       ├── SKILL.md              ← This QA skill
│   │       └── references/
│   │           ├── breakpoints.md
│   │           └── chrome-commands.md
│   ├── prd/                          ← All PRDs
│   ├── functional/                   ← All functional docs
│   ├── tech-specs/                   ← All tech specs
│   ├── islamic-authenticity.md       ← Hadith/Quran rules
│   ├── hadith-verifier/              ← Hadith verifier skill
│   │   ├── SKILL.md
│   │   └── references/
│   └── qa-log.md                     ← Auto-appended QA results
├── mockups/                          ← Blueprint HTML files
├── src/
│   ├── css/
│   │   └── tokens.css
│   ├── js/
│   ├── assets/
│   └── components/
├── TESTING.md                        ← This file
└── [page].html files
```

---

*Every page. Every time. No exceptions.*
