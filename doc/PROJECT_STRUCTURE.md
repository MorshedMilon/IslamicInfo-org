# IslamicInfo.org — VSCode Project Structure
**For Claude Code + VSCode · v1.0 · 2026-05-20**

---

## Current vs. Recommended

Your current Downloads folder is a **documentation workspace** — great for building docs,
but Claude Code needs a specific layout to read context files automatically and build the site.

Move everything into one root project folder. Here's exactly what to create.

---

## Final Folder Structure

```
IslamicInfo.org/                          ← Root project folder (open THIS in VSCode)
│
├── .claude/                              ← Claude Code reads this automatically
│   ├── CLAUDE.md                         ← Design system v3.0 (move from Downloads)
│   └── commands/                         ← Optional: custom slash commands later
│
├── docs/                                 ← All your documentation
│   ├── brand/
│   │   └── ISLAMICINFO_BRAND_IDENTITY.md
│   ├── architecture/
│   │   └── ARCHITECTURE.md
│   ├── skill/
│   │   └── SKILL.md                      ← islamicinfo-brand skill
│   ├── prd/                              ← Move your PRD folder contents here
│   │   ├── IslamicInfo_Home_PRD_v1_1_Final.md
│   │   ├── IslamicInfo_QuranExplorer_PRD_v1_1_Final.md
│   │   ├── IslamicInfo_HadithLibrary_PRD_v1_1_Final.md
│   │   ├── IslamicInfo_IslamicStudies_PRD_v1_1_Final.md
│   │   ├── Knowledge_Hub_PRD_v1_1.md
│   │   ├── IslamicInfo_HabitTracker_PRD_v1_1_Final.md
│   │   ├── IslamicInfo_Verify_PRD_v1_1_Final.md
│   │   └── IslamicInfo_About_PRD_v1_1_Final.md
│   ├── functional/                       ← Move your Functional_Documents folder here
│   │   ├── Tools_Page_Functional_Document.md
│   │   ├── Habit_Tracker_Functional_Document.md
│   │   ├── Verify_Page_Functional_Document.md
│   │   └── About_Page_Functional_Document_v1.md
│   └── tech-specs/                       ← Move your Tech Specification folder here
│       ├── tools-page-technical-doc.md
│       ├── habit-tracker-technical-doc.md
│       ├── verify-page-technical-doc.md
│       └── about-page-technical-doc.md
│
├── mockups/                              ← Move your Mockups HTML folder here
│   ├── home_fixed.html
│   ├── quran_v5.html
│   ├── hadith_module_enhanced__1_.html
│   ├── islamic_studies_optionB.html
│   ├── knowledge-hub.html
│   ├── tools.html
│   ├── habits.html
│   ├── verify__1_.html
│   ├── about_v3.html
│   └── dua.html
│
├── src/                                  ← ALL website source code lives here
│   ├── index.html                        ← Home page
│   ├── quran.html                        ← Quran Explorer
│   ├── hadith.html                       ← Hadith Library
│   ├── islamic-studies.html              ← Islamic Studies
│   ├── knowledge-hub.html                ← Knowledge Hub
│   ├── dua.html                          ← Daily Duas
│   ├── tools.html                        ← Tools
│   ├── habits.html                       ← Habit Tracker
│   ├── verify.html                       ← Verify
│   ├── about.html                        ← About
│   │
│   ├── search.html                       ← Knowledge Hub sub-page
│   ├── start-here.html                   ← Knowledge Hub sub-page
│   ├── trending.html                     ← Knowledge Hub sub-page (P1)
│   │
│   ├── css/
│   │   ├── tokens.css                    ← All CSS custom properties (from CLAUDE.md)
│   │   ├── global.css                    ← Header, footer, buttons, cards, reveal
│   │   ├── home.css
│   │   ├── quran.css
│   │   ├── hadith.css
│   │   ├── islamic-studies.css
│   │   ├── knowledge-hub.css
│   │   ├── dua.css
│   │   ├── tools.css
│   │   ├── habits.css
│   │   ├── verify.css
│   │   └── about.css
│   │
│   ├── js/
│   │   ├── global.js                     ← applyTheme, header scroll, mobile menu,
│   │   │                                    search popup, reveal observer — shared
│   │   ├── home.js
│   │   ├── quran.js
│   │   ├── hadith.js
│   │   ├── islamic-studies.js
│   │   ├── knowledge-hub.js
│   │   ├── dua.js
│   │   ├── tools.js
│   │   ├── habits.js
│   │   ├── verify.js
│   │   └── about.js
│   │
│   ├── api/                              ← Server-side proxy endpoints
│   │   ├── prayer.js                     ← Proxies AlAdhan API
│   │   ├── nisab.js                      ← Proxies gold price API
│   │   ├── verify.js                     ← Corpus search + verification
│   │   ├── subscribe.js                  ← Email capture (Knowledge Hub)
│   │   └── ask-claude.js                 ← AI panel proxy (Islamic Studies)
│   │
│   ├── assets/
│   │   ├── icons/
│   │   │   ├── brand-mark.svg            ← Open book logo mark
│   │   │   ├── favicon.ico
│   │   │   └── apple-touch-icon.png
│   │   ├── og/
│   │   │   └── og-image.png              ← 1200×630 Open Graph image
│   │   └── fonts/                        ← (empty — loaded via Google Fonts CDN)
│   │
│   └── components/                       ← Reusable HTML partials (optional v2)
│       ├── header.html
│       ├── footer.html
│       └── mobile-menu.html
│
├── sub-brands/                           ← Future: separate project per sub-brand
│   ├── quranlyai/                        ← QuranlyAI.com project root
│   ├── mosquefinder/                     ← MosqueFinder.net project root
│   ├── travellyai/                       ← TravellyAI.com project root
│   └── learnspeakai/                     ← LearnSpeakAI.com project root
│
└── .vscode/
    └── settings.json                     ← VSCode workspace settings
```

---

## The Most Important File: `.claude/CLAUDE.md`

This is what makes Claude Code work correctly. Claude Code **automatically reads**
any file named `CLAUDE.md` in the `.claude/` folder at the project root.

**Move your existing `CLAUDE_v3.md` here and rename it to `CLAUDE.md`.**

At the top of the file, add this context block so Claude Code knows what it's reading:

```markdown
# CLAUDE.md — IslamicInfo.org Design System v3.0
# This file is read automatically by Claude Code on every session.
# DO NOT MODIFY without team approval.
# Brand skill: see docs/skill/SKILL.md
# Architecture: see docs/architecture/ARCHITECTURE.md
```

---

## `.vscode/settings.json` — Recommended Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.html": "html",
    "*.md": "markdown"
  },
  "emmet.includeLanguages": {
    "html": "html"
  },
  "editor.rulers": [100],
  "search.exclude": {
    "**/mockups/**": true,
    "**/node_modules/**": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true
  },
  "markdown.preview.breaks": true,
  "css.customData": [".vscode/css-custom-data.json"]
}
```

---

## How Claude Code Reads Your Project

When you open `IslamicInfo.org/` in VSCode and use Claude Code, it reads in this order:

```
1. .claude/CLAUDE.md          ← Auto-read: full design system (tokens, rules, components)
2. docs/skill/SKILL.md        ← Reference: brand + architecture summary
3. src/[page].html            ← The file you're actively working on
4. src/css/tokens.css         ← If working on styles
5. mockups/[page].html        ← Reference mockup (you point Claude to it)
```

**How to instruct Claude Code per task:**

```
"Build src/quran.html following:
- .claude/CLAUDE.md (design system)
- docs/prd/IslamicInfo_QuranExplorer_PRD_v1_1_Final.md (requirements)
- docs/tech-specs/quran-technical-doc.md (spec)
- mockups/quran_v5.html (visual reference — canonical blueprint)"
```

---

## Migration Steps — Do This Now

**Step 1 — Create the root project folder**
```
Right-click Desktop → New Folder → Name it "IslamicInfo.org"
Open it in VSCode: File → Open Folder → IslamicInfo.org
```

**Step 2 — Create the folder skeleton**
```
In VSCode terminal (Ctrl+`):

mkdir -p .claude docs/brand docs/architecture docs/skill docs/prd docs/functional docs/tech-specs mockups src/css src/js src/api src/assets/icons src/assets/og src/components sub-brands .vscode
```

**Step 3 — Move your existing files**

| From (your Downloads/IslamicInfo.org/) | To (new project) |
|---|---|
| `CLAUDE_v3.md` | `.claude/CLAUDE.md` |
| `ISLAMICINFO_BRAND_IDENTITY.md` | `docs/brand/ISLAMICINFO_BRAND_IDENTITY.md` |
| `ARCHITECTURE.md` | `docs/architecture/ARCHITECTURE.md` |
| `SKILL.md` | `docs/skill/SKILL.md` |
| `Tech Specification/` (all files) | `docs/tech-specs/` |
| `PRD/` (all files) | `docs/prd/` |
| `Functional_Documents/` (all files) | `docs/functional/` |
| `Mockups HTML/` (all files) | `mockups/` |

**Step 4 — Create `src/css/tokens.css`**
Extract all CSS custom properties from `.claude/CLAUDE.md` into this file.
Every page's CSS imports this first: `@import '../css/tokens.css';`

**Step 5 — Create `.vscode/settings.json`**
Paste the settings block above.

---

## Build Order — Which Pages to Build First

Based on complexity and dependencies:

| Priority | Page | Why |
|---|---|---|
| 1 | `src/css/tokens.css` + `src/js/global.js` | Everything depends on this |
| 2 | `src/index.html` | Simplest full-page, establishes the pattern |
| 3 | `src/about.html` | No APIs, no tools — validates the shell |
| 4 | `src/verify.html` | One interactive tool, no external API in v1 |
| 5 | `src/habits.html` | Rich localStorage interactions, no API |
| 6 | `src/tools.html` | Multiple tools, one external API |
| 7 | `src/knowledge-hub.html` | Email capture, sub-pages |
| 8 | `src/dua.html` | Content page |
| 9 | `src/islamic-studies.html` | Most complex: quiz, gating, progress |
| 10 | `src/hadith.html` | 3-tier nav, external API |
| 11 | `src/quran.html` | Most feature-rich: audio, AI, bookmarks |

---

## What Each Sub-Brand Folder Gets

When you're ready to start a sub-brand, each gets its own structure:

```
sub-brands/quranlyai/
├── .claude/
│   └── CLAUDE.md             ← Inherits tokens.css + adds --brand-accent
├── docs/
│   ├── prd/
│   ├── tech-specs/
│   └── skill/
│       └── SKILL.md          ← Same islamicinfo-brand skill
├── src/
│   ├── index.html
│   ├── css/
│   │   ├── tokens.css        ← Copy from parent + add sub-brand accent
│   │   └── global.css
│   └── js/
│       └── global.js
└── .vscode/
    └── settings.json
```

---

## Quick Reference: Key File Relationships

```
.claude/CLAUDE.md
    └── defines all tokens used by
        src/css/tokens.css
            └── imported by all
                src/css/[page].css
                    └── linked in all
                        src/[page].html

docs/skill/SKILL.md
    └── summarises CLAUDE.md + brand rules
        → used as Claude Code context prompt

mockups/[page].html
    └── canonical visual reference
        → Claude Code reads for visual fidelity check

docs/prd/[page].md
    └── requirements
        → Claude Code reads for feature completeness

docs/tech-specs/[page].md
    └── implementation spec
        → Claude Code reads for JS/API/data model details
```

---

*IslamicInfo.org Project Structure v1.0 · 2026-05-20*
*Open `IslamicInfo.org/` as the VSCode workspace root — never a subfolder*
