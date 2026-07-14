---
name: islamicinfo-qa
description: >
  Use this skill immediately after every page build, HTML change, or CSS update
  for islamicinfo.org. Triggers on any of: "check the page", "QA this", "test it",
  "run QA", "verify the page", "check responsiveness", "done building", "page is ready",
  "check on mobile", "check desktop", "run the checklist", "open in browser",
  "give me the localhost link", or any variation of finishing a page and wanting
  to verify it. Also triggers automatically after every page build command without
  being asked. Never skip this skill after a build — always run the full QA sequence.
compatibility:
  tools:
    - bash_tool
    - Claude in Chrome (browser automation)
---

# IslamicInfo QA Skill

Automated QA pipeline for islamicinfo.org. Runs after every page build.
Starts the dev server, runs browser checks via Chrome automation, verifies
responsiveness, catches console errors, and gives you the localhost link.

---

## What This Skill Does

1. Starts (or confirms) local dev server
2. Opens the page in Chrome via `/chrome`
3. Runs the full QA checklist automatically
4. Reports pass/fail per check with screenshots
5. Outputs the localhost link for manual review
6. Logs results to `qa-log.md`

---

## Step 1 — Start the Dev Server

Run this first. If already running, skip to Step 2.

```bash
# Detect project type and start correct server
if [ -f "package.json" ]; then
  # Node/npm project
  if grep -q '"dev"' package.json; then
    npm run dev &
  elif grep -q '"start"' package.json; then
    npm run start &
  else
    npx serve . -p 3000 &
  fi
elif [ -f "index.html" ]; then
  # Static HTML project (islamicinfo.org is static HTML)
  npx serve . -p 3000 &
else
  python3 -m http.server 3000 &
fi

sleep 2
echo "Server started. Access at: http://localhost:3000"
```

### IslamicInfo.org Default
Since islamicinfo.org is **static HTML**, the default server command is:
```bash
npx serve . -p 3000 &
```
**Your localhost link: `http://localhost:3000`**

To open a specific page:
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

---

## Step 2 — Chrome Automation Sequence

After server is running, use Claude in Chrome to automate checks.

### How to invoke Chrome tools

```
/chrome navigate http://localhost:3000/[page].html
```

Then run the full check sequence below.

---

## Step 3 — Full QA Checklist (Run Every Time)

Execute in this exact order. Log each result.

### 3.1 — Page Load Check
```
Action : Navigate to http://localhost:3000/[page].html
Check  : Page loads without blank screen or redirect loop
Pass   : Page content visible within 3 seconds
Fail   : White screen, 404, redirect, or timeout
```

### 3.2 — Console Error Check
```
Action : Read browser console messages after page load
Tool   : Claude in Chrome → read_console_messages
Check  : Zero red errors in console
Pass   : No errors (warnings acceptable, log them)
Fail   : Any red console error → must fix before proceeding
```
```javascript
// What to look for — flag these immediately:
// ❌ Uncaught ReferenceError
// ❌ Uncaught TypeError
// ❌ Failed to load resource (404 on CSS/JS/font/image)
// ❌ CORS errors
// ⚠️  Deprecation warnings (log but don't block)
```

### 3.3 — Blueprint Fidelity Check (CLAUDE.md Rule §0)
```
Action : Take screenshot at 1440px width
Check  : Visual matches the canonical blueprint HTML
Items  :
  [ ] Teal + Gold palette correct (no rogue colors)
  [ ] Font stack correct (Inter/system-ui)
  [ ] Nav has exactly 10 items in locked order
  [ ] Header logo renders (Islamic + Info spans)
  [ ] Hero section present and styled correctly
  [ ] Footer 3-column layout intact
  [ ] Dark/light mode toggle visible in nav
  [ ] No broken images or missing icons
Pass   : All items checked
Fail   : Any visual drift from blueprint → fix before next page
```

### 3.4 — Desktop Responsiveness (1440px + 1280px)
```
Action : Resize browser window
Tool   : Claude in Chrome → resize_window

Breakpoint 1: 1440 × 900
  [ ] Nav fully visible, no overflow
  [ ] Hero text not truncated
  [ ] Cards in correct grid columns
  [ ] No horizontal scrollbar
  [ ] Footer columns side by side

Breakpoint 2: 1280 × 800
  [ ] Same checks as 1440
  [ ] No layout collapse at this width
```

### 3.5 — Tablet Responsiveness (768px)
```
Action : resize_window to 768 × 1024
  [ ] Nav collapses to hamburger OR remains visible (per blueprint)
  [ ] Cards reflow to 2-column grid
  [ ] Hero text wraps cleanly
  [ ] No text overflow outside containers
  [ ] Footer reflows correctly
  [ ] Touch targets minimum 44×44px
```

### 3.6 — Mobile Responsiveness (375px + 390px)
```
Action : resize_window to 375 × 812 (iPhone SE)
         resize_window to 390 × 844 (iPhone 14)

  [ ] Hamburger menu visible and functional
  [ ] Single column layout
  [ ] No horizontal scroll (zero overflow-x)
  [ ] Hero headline readable (not tiny)
  [ ] CTA buttons full-width or properly sized
  [ ] Cards stack vertically
  [ ] Footer stacks vertically
  [ ] Font sizes readable (min 16px body)
  [ ] No content cut off at edges

Critical mobile test:
  [ ] Open hamburger → nav menu opens
  [ ] Close hamburger → nav menu closes
  [ ] No ghost tap areas
```

### 3.7 — Dark Mode Check
```
Action : Click dark mode toggle in nav
  [ ] Background switches to dark surface (#0f172a range)
  [ ] Text remains readable (not invisible)
  [ ] Teal and gold accents remain visible
  [ ] No white flash on toggle
  [ ] Toggle icon changes (sun ↔ moon)
  [ ] localStorage saves preference (reload page, check mode persists)
```

### 3.8 — Navigation Check
```
Action : Click each nav item
  [ ] All 10 nav links present in correct order:
      Home → Quran → Hadith → Islamic Studies →
      Knowledge Hub → Duas → Tools → Habits → Verify → About
  [ ] Active page highlighted correctly
  [ ] No 404 on any nav link (pages may not exist yet — note but don't fail)
  [ ] Logo click returns to index.html
```

### 3.9 — Performance Snapshot
```
Action : read_network_requests after page load
  [ ] No failed network requests (red entries)
  [ ] CSS file(s) loaded successfully
  [ ] JS file(s) loaded successfully
  [ ] Fonts loaded (no FOUT after 3 seconds)
  [ ] Total page weight noted (log it)
  [ ] No requests to undefined/null URLs
```

### 3.10 — Islamic Content Rules Check
*(Only for pages with Qur'an/hadith content)*
```
  [ ] All hadith show collection + number + grade label
  [ ] No hadith without ✅/⚠️/🚫 authenticity label
  [ ] No Qur'anic verse without surah + ayah reference
  [ ] Weak hadith show warning notice
  [ ] No fatwa content present
  Ref: islamic-authenticity.md
```

---

## Step 4 — QA Report Output

After running all checks, output this report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QA REPORT — islamicinfo.org
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page          : [page name].html
Date/Time     : [timestamp]
Server        : http://localhost:3000/[page].html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHECK RESULTS:
  3.1  Page Load          : ✅ PASS / ❌ FAIL
  3.2  Console Errors     : ✅ PASS / ❌ FAIL — [error count + details]
  3.3  Blueprint Fidelity : ✅ PASS / ❌ FAIL — [items failed]
  3.4  Desktop 1440/1280  : ✅ PASS / ❌ FAIL
  3.5  Tablet 768px       : ✅ PASS / ❌ FAIL
  3.6  Mobile 375/390px   : ✅ PASS / ❌ FAIL — [specific issues]
  3.7  Dark Mode          : ✅ PASS / ❌ FAIL
  3.8  Navigation         : ✅ PASS / ❌ FAIL
  3.9  Performance        : ✅ PASS / ❌ FAIL — [page weight]
  3.10 Islamic Content    : ✅ PASS / ❌ N/A

OVERALL STATUS : ✅ READY TO PROCEED / ❌ NEEDS FIXES

ISSUES FOUND:
  [List each issue with severity: BLOCKER / WARNING / NOTE]

YOUR LOCALHOST LINK:
  👉 http://localhost:3000/[page].html

NEXT PAGE:
  When ready: build [next page in sequence] then run QA again.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 5 — Append to QA Log

Always append results to `docs/qa-log.md`:

```bash
cat >> docs/qa-log.md << EOF

## $(date '+%Y-%m-%d %H:%M') — [page].html
- Overall: [PASS/FAIL]
- Console errors: [count]
- Mobile: [PASS/FAIL]
- Desktop: [PASS/FAIL]
- Issues: [summary or "none"]
- Page weight: [size]
EOF
```

---

## Severity Definitions

| Level | Meaning | Action |
|-------|---------|--------|
| `BLOCKER` | Broken layout, JS error, 404 on asset | Fix immediately, do not proceed |
| `WARNING` | Minor visual drift, slow asset load | Fix before site launch |
| `NOTE` | Deprecation warning, future page 404 | Log and monitor |

---

## Reference Files

- `references/breakpoints.md` — Full breakpoint spec for islamicinfo.org
- `references/chrome-commands.md` — All Claude in Chrome commands with examples
