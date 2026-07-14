# Claude in Chrome — Commands Reference
## For islamicinfo.org QA Automation

---

## How to Activate

In Claude Code, prefix any browser task with `/chrome` or use the
Claude in Chrome tools directly in your session.

---

## Core Commands Used in QA

### Navigate to page
```
navigate("http://localhost:3000/[page].html")
```

### Take a screenshot
```
computer(action="screenshot")
```
Use after every resize to capture visual state.

### Resize window for breakpoint testing
```
resize_window(width=1440, height=900)   # Desktop L
resize_window(width=1280, height=800)   # Desktop
resize_window(width=1024, height=768)   # Tablet L
resize_window(width=768,  height=1024)  # Tablet P
resize_window(width=390,  height=844)   # Mobile L (iPhone 14)
resize_window(width=375,  height=812)   # Mobile S (iPhone SE)
```

### Read console errors
```
read_console_messages(tab_id=[current tab])
```
Returns all console.log, console.error, console.warn entries.
Filter for `level: "error"` — these are blockers.

### Read network requests
```
read_network_requests(tab_id=[current tab])
```
Look for status 404 or failed entries — these are asset load failures.

### Find element on page
```
find("hamburger menu button")
find("dark mode toggle")
find("nav links")
find("hero section")
find("footer")
```

### Read full page accessibility tree
```
read_page(tab_id=[current tab])
```
Returns all interactive elements. Use to verify nav item count.

### Get page text content
```
get_page_text(tab_id=[current tab])
```
Use to verify content rendered correctly (not blank).

### Click an element
```
find("dark mode toggle") → get ref_id
form_input(ref_id=[id], value="click")
```
Or use `computer` with mouse click coordinates.

### Execute JavaScript on page
```
javascript_tool(code="""
  // Check localStorage for theme
  return localStorage.getItem('theme');
""")

javascript_tool(code="""
  // Check for overflow
  return document.body.scrollWidth > window.innerWidth;
""")

javascript_tool(code="""
  // Get all nav links
  return Array.from(document.querySelectorAll('nav a'))
    .map(a => a.textContent.trim());
""")

javascript_tool(code="""
  // Check page weight estimate
  return performance.getEntriesByType('resource')
    .reduce((total, r) => total + (r.transferSize || 0), 0);
""")
```

---

## Full QA Automation Sequence (Copy-Paste Ready)

Run this sequence for any page after build:

```
Step 1: navigate("http://localhost:3000/[PAGE].html")
Step 2: computer(action="screenshot")                    → Page load visual
Step 3: read_console_messages()                          → Error check
Step 4: read_network_requests()                          → Asset check
Step 5: resize_window(width=1440, height=900)
        computer(action="screenshot")                    → Desktop L
Step 6: resize_window(width=1280, height=800)
        computer(action="screenshot")                    → Desktop
Step 7: resize_window(width=768, height=1024)
        computer(action="screenshot")                    → Tablet
Step 8: resize_window(width=390, height=844)
        computer(action="screenshot")                    → Mobile L
Step 9: resize_window(width=375, height=812)
        computer(action="screenshot")                    → Mobile S
Step 10: find("dark mode toggle") → click it
         computer(action="screenshot")                   → Dark mode
Step 11: javascript_tool(code="return document.body.scrollWidth > window.innerWidth")
                                                         → Overflow check
Step 12: javascript_tool(code="return Array.from(document.querySelectorAll('nav a')).map(a=>a.textContent.trim())")
                                                         → Nav count check
```

---

## Common Issues and How to Detect Them

| Issue | Detection Command | Fix |
|-------|------------------|-----|
| Horizontal scroll | `javascript_tool` overflow check | Add `overflow-x:hidden` to body |
| Missing CSS | `read_network_requests` → 404 on .css | Check file path in `<link>` tag |
| JS error | `read_console_messages` → error level | Check console for exact error |
| Nav wrong order | `javascript_tool` nav text check | Fix nav HTML order |
| Dark mode not saving | `javascript_tool` localStorage check | Fix toggle JS |
| Hamburger not working | `find` + click + screenshot | Check mobile JS |
| Font not loading | `read_network_requests` → font 404 | Fix font path or CDN link |
| Image broken | `read_network_requests` → img 404 | Fix image path |

---

## Localhost Link Reference

```
Base URL    : http://localhost:3000

All pages:
  http://localhost:3000/index.html          ← Home
  http://localhost:3000/quran.html          ← Quran Explorer
  http://localhost:3000/hadith.html         ← Hadith Library
  http://localhost:3000/islamic-studies.html ← Islamic Studies
  http://localhost:3000/knowledge-hub.html  ← Knowledge Hub
  http://localhost:3000/duas.html           ← Daily Duas
  http://localhost:3000/tools.html          ← Islamic Tools
  http://localhost:3000/habits.html         ← Habit Tracker
  http://localhost:3000/verify.html         ← Verify a Claim
  http://localhost:3000/about.html          ← About
```
