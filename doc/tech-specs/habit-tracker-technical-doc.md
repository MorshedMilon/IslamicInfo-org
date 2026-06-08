# Habit Tracker Page — Technical Document
**`habits.html` · IslamicInfo.org · Islamic Habit Tracker & Streak Board**
*v1.0 · 2026-05-20 · Based on PRD v1.1 + Functional Doc v1.0 + CLAUDE.md v3.0*

---

## 1. Purpose

`habits.html` is IslamicInfo's daily worship tracking dashboard — nav position 8, between Tools and Verify. It is the platform's primary interactive tool and the only page with persistent user state.

**What it does:**
- Tracks all 5 daily prayers with single-tap circles and keyboard shortcuts
- Logs Qur'an pages read against a user-defined daily goal
- Provides a morning/evening Adhkar checklist with authentic Arabic text
- Tracks voluntary fasting days across a 30-day calendar
- Tracks 6 Sunnah routine habits with hadith-sourced reward text
- Computes a composite **Sunnah Score** (0–100%) across all categories
- Maintains a **Day Streak** counter and 28-day prayer heatmap
- Showcases Premium/Futuristic features (display-only in v1)

**Constraints:**
- No account required — all state lives in `localStorage` key `'ii-habits'`
- No fatwas or religious verdicts issued anywhere
- All Sunnah references must cite authentic hadith with grade
- Design system locked to CLAUDE.md v3.0 — no deviations

---

## 2. UI Components

Design system is locked. All tokens, card hover rules, and animation curves from CLAUDE.md v3.0 apply verbatim.

### 2.1 Global Shell
| Component | Class/ID | Notes |
|---|---|---|
| Ambient glow | `.ambient` | Fixed, z-index 0, teal + gold radials |
| Shell wrapper | `.shell` | z-index 1, min-height 100vh |
| Header | `.site-header` | Sticky, 60px, blur(24px), `id="themeBtn"` + `id="searchTrigger"` |
| Mobile menu | `#mobileMenu` | Full-screen overlay, z-index 300, `mmFade` keyframe 0.3s |

### 2.2 Hero Section
**Element order inside `.hero-inner`:**
1. Bismillah — `.bismillah-hero-top` — teal gradient (light) / gold + drop-shadow (dark)
2. Eyebrow badge — `.eyebrow` + `.eyebrow-dot` pulse — *"Build Lasting Worship Habits"*
3. `<h1>` — `var(--font-display)` — plain *"Islamic Habit"* + `<span class="grad">` italic *"Tracker & Streak Board"*
4. Arabic hadith — `.hero-arabic` — Amiri, `أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ` + English + *"Bukhari · Sahih"*
5. Sub-text — `.hero-sub`
6. CTA row — `.btn-primary` (scroll to `#tracker-app`) + `.btn-ghost` ("Family Challenge" — Premium placeholder)
7. **Tracker Preview App** — `#tracker-app` (see §2.3)

**Floating decorators:** `.geo.g1` (28s), `.geo.g3` (32s, delay -14s), `.geo.g4` (20s, delay -7s) — `geoRot` animation.

### 2.3 Tracker Preview App (`#tracker-app`)
Glass morphism container: `rgba(255,255,255,.88)` + `backdrop-filter:blur(20px)`, `border-radius:24px`, `max-width:700px`. Dark: `rgba(21,37,39,.92)`, `border rgba(0,105,110,.28)`. Entry via `.reveal`.

**Fixed internal layout:**

| Zone | Component | ID/Class |
|---|---|---|
| Top | Stats strip | `.stats-strip` — 4 metrics, vertical dividers |
| Top | Date row | `.tracker-date` — `#today-date` (dynamic) + `.streak-badge` (`#streak-count`) |
| Middle | Tab bar | `.tabs` — 5 tabs, Prayers active by default |
| Middle | Week strip | `#weekStrip` — 7 day-pills, JS-built |
| Body | Tab panels | `#tab-prayers`, `#tab-quran`, `#tab-dua`, `#tab-fasting`, `#tab-sunnah` |

**Stats strip metrics:**
| Metric | ID | Color | Updates |
|---|---|---|---|
| Day Streak | (static) | `--teal-700` | On day boundary |
| Today % | `#todayPct` | `--teal-700` | Every habit toggle |
| Weekly Score | `#weeklyPct` | `--gold-700` | Every habit toggle |
| Best Streak | (static) | `--teal-700` | On day boundary |

### 2.4 Tab: Prayers (`#tab-prayers`) — Default
- `#prayer-countdown` — injected by `initCountdown()`, updates every 60s
- 5 prayer circles `.prayers-row` (`#p0`–`#p4`) — 52×52px circles, `.done` = teal gradient fill
- `#fajrBadge` — consecutive Fajr streak, shown below `#p0`
- 4 sunnah pills (`.sunnah-pill`) — Qiyam/Duha/Witr/Tahajjud
- 3 progress bars: `#quran-bar` (teal), `#dua-bar` (gold), `#score-bar` (rainbow)
- Score ring — 56×56px SVG, `#scoreRing` arc + `#scoreRingNum` gradient text
- 28-day heatmap — `#heatmap`, 5 heat levels
- Tracker footer — `#quranGoal` input + "Reset day" link

### 2.5 Tab: Qur'an (`#tab-quran`)
- `#quranSlider` — range input, `min=0`, `max=quranGoal`, custom teal thumb, gradient bg tracks position
- `#quranPagesDisplay` ("3 / 5") + `#quranMax` ("5 pages") labels
- Juz progress — `#juzBar` (teal) + `#juzPct` label
- 30-day heatmap — `#quranHeatmap` — lazy-built on first tab open

### 2.6 Tab: Adhkar (`#tab-dua`)
- `#duaList` — 6 `.dua-item` elements, Arabic text + `.dua-cb` checkbox (teal fill when `.checked`)
- Default: items 0–3 checked, 4–5 unchecked
- `#duaProgressBar` (gold fill) + `#duaProgress` ("N / 6") label

### 2.7 Tab: Fasting (`#tab-fasting`)
- Month summary row — count ("3 of 6") + static Suhoor/Iftar times
- `#fastGrid30` — `repeat(7,1fr)` CSS grid, 30 cells, `.fasted` (teal), `.today-fast` (dashed border)
- Stats row — Fasted / Remaining / Streak counts
- "Mark Today as Fasted" button — `toggleFastToday(this)`, turns green when active

### 2.8 Tab: Sunnah Routines (`#tab-sunnah`)
- `#sunnahList` — 6 `.sunnah-routine-item` — `.sri-cb` + `.sri-name` + `.sri-time` + `.sri-reward`
- Default checked: items 0 (Fajr Sunnah), 1 (Duha), 3 (Witr)
- `#sunnahProgressBar` (rainbow fill) + `#sunnahProgress` ("3 / 6") label

### 2.9 Marketing Sections
- **Pain Points** — `.pain-grid` (`auto-fill minmax(260px,1fr)`) — 8 `.pain-card` elements; cards 3 and 6 carry `.gold-glow`
- **Free Features** — `.feat-grid` (`auto-fill minmax(280px,1fr)`) — 6 `.feat-card` elements; `.feat-icon.teal` or `.feat-icon.gold`
- **Premium & Futuristic** — `.prem-grid` (3-col → 2 at ≤1024px → 1 at ≤600px) — 9 cards total; `#sunnahOrb` (`.orb-sm`, 100×100px conic-gradient sphere)

### 2.10 CTA + Footer
CTA: deep teal gradient, 3 buttons — `.btn-gold` → `#tracker-app`, `.btn-white-ghost` → `quran.html`, `.btn-white-ghost` → `dua.html`.

Footer: `ft-` CSS system, 5 columns. Col 2 heading: *"Habit Tracker"*, 5 habit-specific links (all → `habits.html`). Col 3: Quick Access (all 8). Col 4: Ecosystem (4 locked URLs). Col 5: Company + Legal.

---

## 3. Frontend Logic

All JS is a single `<script>` block at end of `<body>`. No framework. No bundler.

### 3.1 Init Sequence (`DOMContentLoaded`)
```js
applyTheme(localStorage.getItem('islamicinfo-theme') || 'light');
STATE = loadState();                   // detects new day, archives, resets
document.getElementById('today-date').textContent =
  new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
document.getElementById('streak-count').textContent = STATE.streak;
renderPrayers();
updateScore();
buildWeekStrip();
buildHeatmap('heatmap', 28);
buildFastGrid();
initCountdown();
initReveal();
initKeyboardShortcuts();
```

### 3.2 Theme System
```js
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('islamicinfo-theme', t);
  themeBtn.innerHTML = t === 'dark' ? sunSVG : moonSVG;
}
```
Applied before first render to prevent FOUC. Theme stored separately from habit state.

### 3.3 State Load / Daily Reset — `loadState()`
```js
function loadState() {
  let s;
  try { s = JSON.parse(localStorage.getItem('ii-habits')); } catch { }
  if (!s) return getDefaultState();

  const today = new Date().toISOString().split('T')[0];
  if (s.dateKey !== today) {
    // 1. Archive previous day
    s.history[s.dateKey] = {
      prayers: s.prayers.filter(Boolean).length,
      score: calcScore(s),
      quranPages: s.quranPages
    };
    // 2. Update streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (s.dateKey === yesterday && s.history[yesterday].prayers === 5) {
      s.streak++;
    } else {
      s.streak = 0;
    }
    s.longestStreak = Math.max(s.longestStreak, s.streak);
    // 3. Reset daily fields, preserve persistent fields
    Object.assign(s, {
      dateKey: today,
      prayers: [false,false,false,false,false],
      sunnahPrayers: { Qiyam:false, Duha:false, Witr:false, Tahajjud:false },
      duaChecked: [false,false,false,false,false,false],
      sunnahItems: [false,false,false,false,false,false],
      quranPages: 0,
    });
    localStorage.setItem('ii-habits', JSON.stringify(s));
  }
  return s;
}
```

### 3.4 Sunnah Score — `calcScore(state)` (pure function)
```js
function calcScore(s) {
  return Math.round(
    (s.prayers.filter(Boolean).length / 5)              * 50 +
    Math.min(s.quranPages / (s.quranGoal || 5), 1)      * 20 +
    (s.duaChecked.filter(Boolean).length / 6)            * 15 +
    (s.sunnahItems.filter(Boolean).length / 6)           * 15
  );
}
```

### 3.5 `updateScore()` — atomic DOM update
Updates all 5 connected elements in one call:
```js
function updateScore() {
  const score = calcScore(STATE);
  document.getElementById('todayPct').textContent   = score + '%';
  document.getElementById('weeklyPct').textContent  = score + '%';
  document.getElementById('score-pct').textContent  = score + '%';
  document.getElementById('score-bar').style.width  = score + '%';
  document.getElementById('scoreRingNum').textContent = score + '%';
  // SVG arc: stroke-dasharray = 144.5
  document.getElementById('scoreRing').style.strokeDashoffset =
    (144.5 - (144.5 * score / 100)).toFixed(2);
  // Also sync Quran and Dua bars
  const qPct = Math.min(Math.round(STATE.quranPages / (STATE.quranGoal||5) * 100), 100);
  document.getElementById('quran-bar').style.width = qPct + '%';
  document.getElementById('quran-lbl').textContent = STATE.quranPages + ' / ' + STATE.quranGoal + ' pages';
  const dPct = Math.round(STATE.duaChecked.filter(Boolean).length / 6 * 100);
  document.getElementById('dua-bar').style.width = dPct + '%';
  document.getElementById('dua-lbl').textContent =
    STATE.duaChecked.filter(Boolean).length + ' / 6 duas';
}
```

### 3.6 Prayer Toggle — `togglePrayer(i)`
```js
function togglePrayer(i) {
  STATE.prayers[i] = !STATE.prayers[i];
  saveState();
  renderPrayers();
  updateScore();
  const el = document.getElementById('p' + i);
  el.classList.add('ripple');
  setTimeout(() => el.classList.remove('ripple'), 500);
  const names = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
  showToast(STATE.prayers[i]
    ? names[i] + ' ✓ — Alhamdulillah!'
    : names[i] + ' unmarked');
}
```

### 3.7 Fajr Streak Computation
```js
function getFajrStreak() {
  let streak = 0;
  const today = new Date();
  if (STATE.prayers[0]) streak = 1;
  let d = new Date(today);
  d.setDate(d.getDate() - 1);
  while (true) {
    const key = d.toISOString().split('T')[0];
    const entry = STATE.history[key];
    if (!entry || entry.prayers < 1) break; // prayers[0] not specifically tracked in history; use prayers > 0 as proxy
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
```
> **Note for production:** `STATE.history` currently stores `prayers` as a total count (0–5), not per-prayer booleans. To track Fajr specifically, extend the history schema: `{ prayers: count, fajr: bool, score: N }`.

### 3.8 Keyboard Shortcuts
```js
document.addEventListener('keydown', e => {
  if (document.activeElement.tagName === 'INPUT') return;
  if (e.key >= '1' && e.key <= '5') togglePrayer(parseInt(e.key) - 1);
});
```

### 3.9 Week Strip — `buildWeekStrip()`
```js
function buildWeekStrip() {
  const today = new Date();
  const todayIdx = today.getDay();
  const strip = document.getElementById('weekStrip');
  strip.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - todayIdx + i);
    const key = d.toISOString().split('T')[0];
    const isToday = i === todayIdx;
    const histEntry = STATE.history[key];
    const prayerCount = isToday
      ? STATE.prayers.filter(Boolean).length
      : (histEntry ? histEntry.prayers : 0);
    // Build pill with 5 dots
    const pill = document.createElement('div');
    pill.className = 'day-pill' + (isToday ? ' today' : '') +
      (!isToday && prayerCount === 5 ? ' done-full' : '');
    // populate day-name, day-num, day-dots
    strip.appendChild(pill);
  }
}
```

### 3.10 Heatmap — `buildHeatmap(containerId, days)`
```js
function buildHeatmap(containerId, days) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const count = isToday
      ? STATE.prayers.filter(Boolean).length
      : (STATE.history[key]?.prayers || 0);
    const cell = document.createElement('div');
    cell.className = 'heat-cell' + (count > 0 ? ' h' + count : '');
    cell.title = key + ' · ' + count + '/5 prayers';
    container.appendChild(cell);
  }
}
```
Quran heatmap uses `STATE.history[key]?.quranPages > 0` → maps to heat levels.

### 3.11 Fast Grid — `buildFastGrid()`
Clears `#fastGrid30`, generates cells 1–N (days in current month), applies `.fasted` from `STATE.fastingDays[dateKey]`, `.today-fast` on today. Each cell: `onclick` toggles `STATE.fastingDays[key]`, calls `saveState()`, rebuilds grid, updates stats row, fires toast.

### 3.12 Qur'an Slider — `updateQuranSlider(v)`
```js
function updateQuranSlider(v) {
  STATE.quranPages = parseInt(v);
  saveState();
  const pct = Math.min(Math.round(v / STATE.quranGoal * 100), 100);
  // Update display
  document.getElementById('quranPagesDisplay').textContent = v + ' / ' + STATE.quranGoal;
  // Update slider gradient
  const slider = document.getElementById('quranSlider');
  slider.style.background = `linear-gradient(90deg, var(--teal-500) ${pct}%, rgba(0,105,110,.15) ${pct}%)`;
  // Update Juz bar
  const juzPct = Math.min(Math.round(v / STATE.quranGoal * 22 + 2), 100);
  document.getElementById('juzBar').style.width = juzPct + '%';
  document.getElementById('juzPct').textContent = juzPct + '%';
  updateScore();
}
```

### 3.13 Toast — `showToast(msg)`
```js
let toastTimer;
function showToast(msg) {
  const toast = document.querySelector('.toast');
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
```
Fixed, `bottom:24px; right:24px`, z-index 999. `teal-900` bg, teal dot, white text.

### 3.14 Prayer Countdown — `initCountdown()`
Injects `#prayer-countdown` div as first child of `#tab-prayers`. Sets `setInterval` every 60 000ms. Logic:
- Compute current minutes from midnight
- Check each prayer window (`[start, end]` pairs)
- Inside window: `"🕌 [Prayer] — N min window remaining"` (orange if < 15)
- Between windows: `"⏱ Next: [Prayer] in Xh Ym"`
- Post-Isha: `"🌙 Isha time — don't forget Witr"`

In production: replace static minute-from-midnight windows with Prayer Times API response.

### 3.15 Sunnah Orb Click
```js
document.getElementById('sunnahOrb').addEventListener('click', () => {
  const orb = document.getElementById('sunnahOrb');
  orb.style.animationDuration = '1.5s';
  const score = calcScore(STATE);
  showToast(score >= 80
    ? 'MashaAllah! Sunnah Score: ' + score + '% 🌟'
    : 'Sunnah Score: ' + score + '% — Keep going! 🌿');
  setTimeout(() => { orb.style.animationDuration = '8s'; }, 2000);
});
```

### 3.16 `saveState()`
```js
function saveState() {
  try {
    localStorage.setItem('ii-habits', JSON.stringify(STATE));
  } catch (e) {
    console.error('Habit state save failed:', e);
  }
}
```
Called after every user interaction. Wrapped in try/catch (storage quota).

### 3.17 `resetDay()`
Clears: `prayers[5]`, `sunnahPrayers`, `duaChecked[6]`, `sunnahItems[6]`, `quranPages`. Preserves: `quranGoal`, `fastingDays`, `streak`, `longestStreak`, `history`. Calls `saveState()`, re-renders all UI, fires toast *"Day reset — Bismillah, start fresh! 🌅"*.

---

## 4. Backend Logic

`habits.html` is a fully static page with no server-side rendering. All persistence is client-side.

**In v1:** No backend. `localStorage` is the entire data layer.

**In production (future):**
- `/api/prayer-times?lat=X&lng=Y&method=Z` — proxied AlAdhan call (same as `tools.html` prayer widget)
- `/api/sync` (Premium) — POST habits state for cross-device sync
- `/api/export/pdf` (Premium) — generate weekly/monthly report PDF

---

## 5. APIs

### 5.1 Prayer Times (Production replacement for countdown)
Same spec as `tools.html` §5.1. Endpoint: `GET https://api.aladhan.com/v1/timingsByCity`. Replace static minute-from-midnight windows in `initCountdown()` with live response.

**Injection point:** `initCountdown()` function — replace the `PRAYER_WINDOWS` constant with API-derived times.

### 5.2 Suhoor / Iftar Times (Fasting tab)
Pulled from the same AlAdhan response as prayer times. Fajr time = Suhoor; Maghrib time = Iftar. Replace static `"4:28 AM"` / `"8:42 PM"` strings in the Fasting tab.

### 5.3 No Other APIs in v1
All other data (streak, scores, habit state, history) is computed client-side. No external API calls required.

---

## 6. Database

No database in v1. All persistence via `localStorage`.

| Key | Type | Purpose | Cleared by |
|---|---|---|---|
| `ii-habits` | JSON (full STATE) | All habit tracking data | Never (only reset day clears daily fields) |
| `islamicinfo-theme` | `'light'|'dark'` | Theme preference, shared across all pages | Never |

**STATE object schema:**
```json
{
  "dateKey":       "YYYY-MM-DD",
  "prayers":       [false, false, false, false, false],
  "sunnahPrayers": { "Qiyam": false, "Duha": false, "Witr": false, "Tahajjud": false },
  "quranPages":    0,
  "quranGoal":     5,
  "duaChecked":    [false, false, false, false, false, false],
  "fastingDays":   { "2026-05-01": true },
  "sunnahItems":   [false, false, false, false, false, false],
  "streak":        14,
  "longestStreak": 21,
  "history": {
    "2026-05-16": { "prayers": 5, "score": 88, "quranPages": 3 },
    "2026-05-15": { "prayers": 4, "score": 72, "quranPages": 0 }
  }
}
```

**Persistent vs. daily-reset fields:**
- **Persistent (never reset by new day):** `quranGoal`, `fastingDays`, `streak`, `longestStreak`, `history`
- **Daily reset:** `prayers`, `sunnahPrayers`, `duaChecked`, `sunnahItems`, `quranPages`, `dateKey`

---

## 7. Validation

### 7.1 `quranGoal` Input
- `type="number"`, `min="1"`, `max="50"`, browser enforces range
- `updateQuranGoal()`: clamp `newGoal = Math.max(1, Math.min(50, parseInt(val) || 5))`
- Slider `max` updated to clamped value; re-run `refreshSliderUI()`

### 7.2 `quranPages` (Slider)
- Range input — browser enforces `min=0`, `max=quranGoal`
- `calcScore`: `Math.min(quranPages / quranGoal, 1)` — score never exceeds 100% from this component

### 7.3 Sunnah Score Formula
- All inputs are arrays of booleans → `.filter(Boolean).length` never NaN
- Guard: `quranGoal || 5` prevents division by zero if goal is somehow 0
- `Math.round(...)` — always integer 0–100

### 7.4 Fasting Stats Row
- `Remaining = Math.max(0, target - fasted)` — never negative
- `target` defaults to 6 (Shawwāl fasts); configurable in future

### 7.5 Daily Reset Date Check
- `STATE.dateKey !== TODAY` — string comparison of `YYYY-MM-DD`; no timezone ambiguity if consistent use of `.toISOString().split('T')[0]`
- Parse error in `loadState()`: `try/catch` returns `getDefaultState()` — never crashes on corrupt data

### 7.6 `fastingDays` Schema
- Sparse object keyed by `YYYY-MM-DD` → boolean
- Cells toggle `STATE.fastingDays[key] = !STATE.fastingDays[key]`; falsy values treated as unfasted
- Stats row computes count via `Object.values(STATE.fastingDays).filter(Boolean).length`

---

## 8. Error Handling

### 8.1 `localStorage` Full / Write Failure
```js
function saveState() {
  try {
    localStorage.setItem('ii-habits', JSON.stringify(STATE));
  } catch (e) {
    console.error('ii-habits save failed:', e);
    // Non-blocking — state lives in memory for session; user sees no error
  }
}
```

### 8.2 `localStorage` Parse Error
```js
try {
  s = JSON.parse(localStorage.getItem('ii-habits'));
} catch {
  s = null;
}
if (!s) return getDefaultState(); // clean slate, never throws
```

### 8.3 Vibrate API (Sunnah pills — future)
Not used in Habit Tracker. Only in Tools page Tasbeeh counter.

### 8.4 Prayer Countdown Window Edge Cases
- Post-Isha / Pre-Fajr (e.g. midnight to 4:30 AM): show Witr reminder
- Interval runs while page is open — no persistent background; clears on tab close
- On tab re-open after >60s: `initCountdown()` re-runs on DOMContentLoaded, recalculates immediately

### 8.5 Missing `STATE.history` Entries (Fajr Streak)
- If `STATE.history[dateKey]` is undefined → streak lookback stops
- Fajr streak shows 0 for first-time user or after history gap

### 8.6 Orb Animation (CSS)
- `orb-spin` and `orb-ring` are CSS animations — run continuously from load
- Click handler sets `style.animationDuration` inline; reverts after `setTimeout(2000)`
- If user clicks multiple times rapidly: each click resets the 2s timeout and re-applies 1.5s speed

---

## 9. RBAC

No authentication in v1. All features are public and anonymous.

| Tier | Access | Status |
|---|---|---|
| Free (anonymous) | Full tracker: prayers, Qur'an, Adhkar, Fasting, Sunnah, heatmap, streak, score | ✓ Live |
| Premium | Ramadan/Hifz templates, Family challenges, PDF/WhatsApp export | Display-only cards in v1 |
| Futuristic | AI prediction, Voice check-in, Community leaderboard, Smart habit stacking | Display-only cards in v1 |

**Future auth scope:** When accounts are added, `localStorage` `'ii-habits'` migrates to server-side store with same JSON schema. RBAC check on `/api/sync` and `/api/export` endpoints. Premium features gate behind subscription check.

---

## 10. Edge Cases

| Component | Scenario | Behaviour |
|---|---|---|
| Daily reset | Day changes while page is open (midnight) | Handled on next user interaction that calls `saveState()` or next page load; `loadState()` re-detects new day |
| Daily reset | User skips multiple days (e.g. 3 days no visit) | `streak = 0` — streak resets regardless of gap length; `history` has gap entries |
| Streak | All 5 prayers archived but `dateKey` was not yesterday | `streak = 0` — skipped-day detection |
| `quranGoal` | Changed mid-day to value lower than current `quranPages` | Score uses `Math.min(pages/goal, 1)` → capped at 100% for this component; slider shows at max |
| Fasting grid | Current month has 29 days (Hijri context) | `buildFastGrid()` uses JS `new Date(year, month+1, 0).getDate()` → correct days-in-month |
| Fasting `toggleFastToday` | Tapped twice quickly | Second tap un-fasts; button restores original HTML; stats decrement |
| Adhkar | All 6 checked | `duaProgress` = "6 / 6"; bar 100%; score component = 15/15 |
| Score ring | Score = 0% | `strokeDashoffset = 144.5` (full offset = no arc drawn) |
| Score ring | Score = 100% | `strokeDashoffset = 0` (full arc visible) |
| Week strip | Sunday (today is first day of week) | `todayIdx = 0`; loop starts at today correctly |
| Heatmap | `STATE.history` empty (first-time user) | All cells render at level 0 (lightest shade) |
| Keyboard shortcuts | Input focused (e.g. `#quranGoal`) | `if (activeElement.tagName === 'INPUT') return` guard prevents accidental prayer toggle |
| Orb click | Rapid multiple clicks | Each resets 2s timeout; orb stays at 1.5s; reverts after last click |
| Dark mode | Applied after first render | `applyTheme()` runs before DOM is painted via inline script before `<body>`; prevents FOUC |
| Reset day | Called with no history yet | Resets to `getDefaultState()` daily fields; `history: {}` remains untouched |

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
- Glass morphism tracker card uses `backdrop-filter: blur(20px)` — GPU-composited, paint-only on first render

**DOM manipulation:**
- `buildWeekStrip()`, `buildHeatmap()`, `buildFastGrid()` run once on load; only `buildFastGrid()` re-runs on toggle (cheap: 30 cells)
- `#quranHeatmap` is **lazy** — built only on first Qur'an tab open (`quranHeatmapBuilt` boolean flag)
- `updateScore()` updates 5 DOM elements per call — all text/width/stroke changes; no layout thrash

**Animations:**
- All transitions on `transform` and `opacity` (compositor-only; no reflow)
- `will-change: transform, box-shadow` on `.card` — hoisted to own layer before hover
- `prayerRipple` keyframe: ring expand + fade, 0.5s — GPU-only
- Orb: `conic-gradient` sphere + `orb-spin` (8s), `orb-ring` (4s) — CSS-only, no JS per frame
- Progress bars: `width` transition `1s ease-reverent` — layout but contained to bar; no parent reflow
- Score ring `stroke-dashoffset` CSS transition — SVG attribute change, paint-only

**State:**
- `saveState()` is synchronous `localStorage.setItem` — ~1ms; acceptable per interaction
- `calcScore(STATE)` is a pure O(1) function — no loops over history

**API (production):**
- Prayer times cached in `localStorage` per city+date — max 1 API call per user per day
- Countdown interval: `setInterval(60000)` — 1 call per minute, minimal CPU

---

## 12. File Structure

```
islamicinfo.org/
├── habits.html                   ← this page (all CSS + JS inline in v1)
│
├── /api/                         ← server-side proxies (future)
│   └── prayer-times.js           ← proxies AlAdhan; injects key from env
│
├── /js/
│   └── habits.js                 ← (P2 refactor: extract from inline)
│
└── /assets/
    └── fonts/                    ← Google Fonts via CDN preconnect
```

Cross-page links from `habits.html`:
- `quran.html` — CTA "Explore Qur'an"
- `dua.html` — CTA "Daily Duas"
- `#tracker-app` — internal anchor scroll (hero + CTA primary)

---

## 13. TypeScript Interfaces

```typescript
// Core daily state
interface HabitState {
  dateKey:        string;                          // 'YYYY-MM-DD'
  prayers:        [boolean,boolean,boolean,boolean,boolean]; // [Fajr,Dhuhr,Asr,Maghrib,Isha]
  sunnahPrayers:  SunnahPrayers;
  quranPages:     number;                          // 0 to quranGoal
  quranGoal:      number;                          // 1 to 50, persists across days
  duaChecked:     [boolean,boolean,boolean,boolean,boolean,boolean];
  fastingDays:    Record<string, boolean>;         // sparse: { 'YYYY-MM-DD': true }
  sunnahItems:    [boolean,boolean,boolean,boolean,boolean,boolean];
  streak:         number;                          // consecutive 5/5 prayer days
  longestStreak:  number;                          // all-time best
  history:        Record<string, DayHistory>;
}

interface SunnahPrayers {
  Qiyam:    boolean;
  Duha:     boolean;
  Witr:     boolean;
  Tahajjud: boolean;
}

interface DayHistory {
  prayers:    number;    // 0–5 total count
  score:      number;    // 0–100 Sunnah Score
  quranPages: number;
}

// Sunnah Score weights
interface ScoreWeights {
  prayers:  50;          // (prayers / 5) * 50
  quran:    20;          // min(pages / goal, 1) * 20
  adhkar:   15;          // (duaCount / 6) * 15
  sunnah:   15;          // (sunnahCount / 6) * 15
  total:    100;
}

// Prayer countdown display
interface PrayerWindow {
  name:  'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  start: number;         // minutes from midnight
  end:   number;         // minutes from midnight
}

interface CountdownState {
  status:    'in-window' | 'between' | 'post-isha';
  prayer?:   string;
  minutesLeft?: number;
  urgent:    boolean;    // true if < 15 min remaining
}

// Tool card (shared with tools.html — reuse type)
interface FeatureCard {
  icon:        string;          // emoji
  iconTheme:   'teal' | 'gold';
  badge?:      'premium' | 'future';
  title:       string;
  description: string;
}

interface SunnahRoutineItem {
  index:   number;
  emoji:   string;
  name:    string;
  time:    string;
  reward:  string;               // hadith-sourced reward text
  default: boolean;              // default checked state
}

interface DuaItem {
  index:    number;
  arabic:   string;
  label:    string;
  default:  boolean;
}

// Week strip day pill
interface DayPill {
  date:        Date;
  label:       string;    // 'Mon'
  num:         number;    // day of month
  isToday:     boolean;
  isDoneFull:  boolean;   // 5/5 prayers
  dotCount:    number;    // 0–5 filled dots
}

// Heatmap cell
interface HeatCell {
  date:      string;      // 'YYYY-MM-DD'
  level:     0 | 1 | 2 | 3 | 4 | 5;
  tooltip:   string;      // 'YYYY-MM-DD · N/5 prayers'
}

// localStorage schema
interface LocalStorageSchema {
  'ii-habits':           HabitState;
  'islamicinfo-theme':   'light' | 'dark';
}
```

---

## 14. Testing

### 14.1 Unit Tests (Jest / Vitest)

| Function | Test cases |
|---|---|
| `calcScore()` | 0 prayers + 0 pages + 0 dua + 0 sunnah → 0; 5 prayers + goal pages + 6 dua + 6 sunnah → 100; partial values → correct weighted sum; quranGoal=0 → no crash |
| `loadState()` | Corrupt JSON → returns `getDefaultState()`; null entry → clean state; same-day load → no reset; next-day load → archives, resets daily fields, increments streak if 5/5; skipped day → streak = 0 |
| Streak logic | 5/5 yesterday → streak++; 4/5 yesterday → streak = 0; 2-day gap → streak = 0; longestStreak = max(current, previous) |
| `getFajrStreak()` | 7 consecutive Fajr days → 7; gap at day 3 → count stops at 2; today Fajr true → +1 |
| `buildFastGrid()` | February (28 days) → 28 cells; month with fasted days → correct `.fasted` cells; today unfasted → `.today-fast` |
| `toggleFastToday()` | First tap → fasted = true, button green; second tap → fasted = false, button restored |
| `resetDay()` | Prayers cleared; quranGoal preserved; fastingDays preserved; streak preserved; history preserved |
| `updateQuranGoal()` | Goal < 1 → clamp to 1; goal > 50 → clamp to 50; slider max updates; toast fires |
| Keyboard shortcuts | Key '1' → `togglePrayer(0)`; key '5' → `togglePrayer(4)`; key '3' with input focused → no-op |

### 14.2 Integration Tests

| Scenario | Expected |
|---|---|
| Toggle Fajr ON → score updates | `#todayPct` = 10%, `#scoreRingNum` = 10%, `scoreRing` offset correct |
| Toggle all 5 prayers → score | 50% (prayers only); score ring half full |
| Log 5 Qur'an pages with goal=5 → score | Prayers(0) + Quran(20) = 20% if no other habits |
| Full day (5+5+6+6) → score | 100% |
| Slider at goal → Juz bar | `juzPct = min(round(goal/goal × 22 + 2), 100) = 24%` |
| Day boundary on reload | Previous day archived; prayers reset to all false; streak reflects correctly |
| Dark mode toggle | `[data-theme="dark"]` on `<html>`, Bismillah switches to gold gradient |
| `saveState` storage quota full | No crash; console.error; state survives in memory for session |

### 14.3 E2E Tests (Playwright / Cypress)

| Flow | Steps | Pass condition |
|---|---|---|
| Prayer logging | Load → tap Fajr → tap Dhuhr → observe score | `#todayPct` = 20%; circles have `.done`; toast appears |
| Streak persistence | Log all 5 prayers → close → reopen next day | Streak = 1; prayers reset to unchecked |
| Qur'an tab | Open Qur'an tab → drag slider to 3 → observe bars | `quranPagesDisplay` = "3 / 5"; `quran-bar` = 60%; score updated |
| Adhkar tab | Open Adhkar → uncheck item 0 → check item 4 | `duaProgress` = "4 / 6"; `dua-bar` updates |
| Fasting tab | Open Fasting → tap cell 5 → tap "Mark Today" | Cell 5 = teal; button = green; stats: Fasted = 2 |
| Sunnah tab | Open Sunnah → uncheck item 1 (Duha) | `sunnahProgress` = "2 / 6"; score drops |
| Reset day | Log prayers/quran → click Reset day | All circles unchecked; score = 0; quranGoal preserved |
| Keyboard | Press '2' → Dhuhr toggles | `#p1` has `.done` |
| Dark mode | Toggle theme → reload | `[data-theme="dark"]` persists; Bismillah gold gradient |
| Mobile 375px | Load at 375px | No horizontal scroll; prayers 3-col; tabs legible |

### 14.4 Pre-Launch QA Checklist

**Design (CLAUDE.md enforcement):**
- [ ] No shimmer `::after` on any card — teal glow shadow only (light + dark)
- [ ] All hover transitions use `--ease-reverent` / `--ease-premium`
- [ ] Bismillah: teal gradient (light) / gold + `drop-shadow(0 0 14px rgba(217,179,88,.55))` (dark)
- [ ] Dark card hover uses `rgba(88,193,199,.18)` glow
- [ ] Orb `orb-spin` + `orb-ring` running from page load
- [ ] Prayer ripple `prayerRipple` keyframe fires on toggle

**State:**
- [ ] `localStorage` key `'ii-habits'` stores full STATE; parse error returns clean default
- [ ] New day detected → archives previous day → resets daily fields → preserves persistent fields
- [ ] Streak increments only on 5/5 yesterday; resets on skip
- [ ] `fastingDays` and `quranGoal` survive day reset

**Functionality:**
- [ ] All 5 prayer circles toggle correctly; keyboard shortcuts 1–5 work (not in input)
- [ ] Score ring `stroke-dashoffset` animates correctly; `scoreRingNum` gradient text visible
- [ ] 28-day heatmap: today's cell reflects live state; past cells from history
- [ ] Qur'an slider: gradient tracks thumb; all bars update; Juz formula correct
- [ ] Fasting grid: all cells clickable; Mark Today toggles correctly; stats row updates
- [ ] Sunnah items: reward text present; default checked items 0, 1, 3

**Navigation:**
- [ ] All 10 nav items in order; `Habit Tracker` = `.active`; `islamic-studies.html` (never `learn.html`)
- [ ] `knowledge-hub.html` at position 5 — never omitted
- [ ] Footer: `ft-` CSS only; Quick Access 8 links; Ecosystem 4 exact URLs
- [ ] `quranlyai.com` (not `quranlya.com`); `LearnSpeakAI` (exact casing)

**Responsive (all breakpoints):**
- [ ] 1100px, 1024px, 900px, 760px, 700px, 600px, 480px, 440px — all verified in light + dark

---

*End of Habit Tracker Technical Document v1.0*
*IslamicInfo.org · `habits.html` · Design system: CLAUDE.md v3.0 · PRD: v1.1 · Func doc: v1.0*
