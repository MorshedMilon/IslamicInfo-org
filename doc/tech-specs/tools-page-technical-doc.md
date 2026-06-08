# Tools Page — Technical Document
**`tools.html` · IslamicInfo.org · Islamic Tools Suite**
*v1.0 · 2026-05-20 · Based on PRD v1.1 + Functional Doc v1.0 + CLAUDE.md v3.0*

---

## 1. Purpose

`tools.html` is the utility dashboard of IslamicInfo.org — nav position 7, between Daily Duas and Habit Tracker. It aggregates all practical Islamic tools into a single interactive page that behaves as a working app rather than a content page.

**What it does:**
- Delivers 12 tools across 4 categories: Prayer & Worship, Finance & Fiqh, Trackers, Discovery
- Fetches live data (prayer times, gold price/nisab) via proxied API calls
- Persists user state (fasting log, tasbeeh totals, sadaqah ledger) to `localStorage`
- Operates offline for computation-only tools (Qibla, Zakat, Age Calc, Tasbeeh)

**What it is not:** A content page, a fatwa source, or an authenticated experience. All state in v1 is client-only.

---

## 2. UI Components

Design system is locked to **CLAUDE.md v3.0**. All tokens, hover rules, and animation curves apply as-is. No new colors or shimmer effects.

### 2.1 Global Shell
| Component | Class/ID | Notes |
|---|---|---|
| Ambient glow | `.ambient` | Fixed, z-index 0, radial teal + gold gradients |
| Shell wrapper | `.shell` | z-index 1, min-height 100vh |
| Header | `.site-header` | Sticky, 60px, `backdrop-filter: blur(24px)` |
| Mobile menu | `#mobileMenu` | Full-screen overlay, z-index 300, visible ≤ 760px |

### 2.2 Hero
Contains three embedded sub-components:

**Hero structure (`.hero-inner`):**
1. Bismillah — `.bismillah-hero-top` — teal gradient (light) / gold + drop-shadow (dark)
2. Eyebrow badge — `.hero-badge` with `.badge-dot` pulse animation
3. `<h1 class="hero-title">` — `var(--font-display)`, `clamp(44px,8vw,80px)`, with `<span class="grad-it">` for italic gradient
4. Arabic verse — `.hero-arabic` — Qur'an 2:238, Amiri, RTL, 60% opacity
5. Sub-text — `.hero-sub`
6. CTA row — `.hero-btns` with `.btn-primary` + `.btn-ghost`
7. Stats strip — `.stats-strip` (4 cells, flex row)
8. Prayer widget — `#prayer-widget` (dark gradient card)

**Floating decorators:** `.geo.g1`, `.geo.g3`, `.geo.g4` — continuous `geoRot` animation.

### 2.3 Stats Strip
`.stats-strip` — horizontal flex, card border, `border-radius: var(--r-xl)`. Wraps 2×2 at ≤ 560px.

| ID | Value | Label |
|---|---|---|
| `sc1` | `12+` | Tools |
| — | `5` | Prayers Daily |
| `sc2` | `195+` | Countries |
| — | `100%` | Free Forever |

### 2.4 Prayer Widget (`#prayer-widget`)
Dark gradient card. 6-prayer grid (`repeat(6,1fr)` → `repeat(3,1fr)` at ≤ 600px). Key state classes: `.pw-prayer.next` (gold tint + `breathGold` animation), `.pw-prayer.past` (44% opacity).

Controls: Change/My Location → `getPrayerLocation()` · Adhan → settings dropdown · Method → method selector.

### 2.5 All Tools Grid (`#tools-section`)
5 filter tabs (`.tool-tabs`) + 12 `.tool-card` elements in `repeat(auto-fill, minmax(280px,1fr))` grid.

**Tool card anatomy (top → bottom):**
- `.tool-card-top`: `.tool-icon` (`.ti-teal` / `.ti-gold` / `.ti-emerald`) + status badge (`.ts-live` / `.ts-new` / `.ts-beta` / `.ts-soon`)
- `.tool-title` — serif, 20px
- `.tool-desc` — 13.5px, ink-muted
- `.tool-tags` — 2–3 `.tool-tag` pills
- `.tool-link` — CTA text with animated arrow gap

**Coming Soon (`#tool-ai-verifier`):** `<div>` not `<a>`, `cursor:default`, `opacity:0.75`, no hover lift.

### 2.6 Qibla + Hijri Calendar (`#qibla-section`)
Two-column `.two-col` grid (stacks at ≤ 820px).

**Left — `.qibla-card`:** 196×196px compass with animated dashed SVG ring (22s spin) + rotatable needle (`#compassNeedle`) + `#qDeg`, `#qDist`, `#qBearing`, `#qCity` outputs.

**Right — `.hijri-card`:** 7-column day grid, `.hc-day.today` (teal bg), `.hc-day.event` (gold), `.hc-day.faded` (30% opacity), month nav buttons `‹`/`›`, events list (`.hc-events`).

### 2.7 Zakat Calculator (`#zakat-section`)
`.zakat-grid` — `1.1fr 1fr` (collapses at ≤ 820px).

**Left — `.zakat-form-card`:** 5 `type="number"` inputs with `$` prefix. **Right — `.zakat-result-card`:** `#zkResult` (large display), `#zkTotal`, `#zkPayable`, `#zkResultLabel`, breakdown table, mandatory disclaimer.

### 2.8 Tasbeeh + Fasting (`#tasbeeh-section`)
Two-column.

**Left — `.tasbeeh-card`:** 4 dhikr chips (`.dhikr-chips`), Arabic/English display, 152px circle counter button, 3 control pills (reset/undo/vibrate), session stats strip.

**Right — `.fast-card`:** 30-cell `.fast-grid`, stats strip (`#fsFasted`, `#fsLeft`, `#fsStreak`), suhoor/iftar times, Mark Today button (`#fastTodayBtn`).

### 2.9 Name + Age + Sadaqah (`#name-section`)
Two-column. Left: `.name-card` with search input, `.name-result` panel (hidden by default), 8 suggestion chips. Right stack (top): `#age-section` with 2-col date inputs + 2×2 result grid + Hijri birthday box. Right stack (bottom): Sadaqah mini-card with SVG progress ring + log button.

### 2.10 CTA Section + Footer
CTA: dark teal gradient, 3 buttons: `.btn-gold` → `habits.html`, `.btn-white-ghost` → `dua.html`, `.btn-white-ghost` → `verify.html`.

Footer: `ft-` CSS system per CLAUDE.md §7. Col 1: Tools deep-links. Col 2: Quick Access (all 8). Col 3: Ecosystem (4 locked URLs). Col 4: Company + Legal.

---

## 3. Frontend Logic

All JS lives in a single `<script>` block at end of `<body>`. No framework. No bundler.

### 3.1 Init on `DOMContentLoaded`
```js
applyTheme(localStorage.getItem('islamicinfo-theme') || 'light');
document.getElementById('pwDate').textContent = new Date()
  .toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
document.getElementById('ageToday').value = new Date().toISOString().split('T')[0];
buildFastGrid();
initReveal();
```

### 3.2 Theme System
`applyTheme(t)`: sets `document.documentElement.setAttribute('data-theme', t)`, saves to `localStorage('islamicinfo-theme')`, swaps themeBtn SVG (sun ↔ moon). Applied before first paint to prevent FOUC.

### 3.3 Prayer Widget — `getPrayerLocation()`
```
navigator.geolocation.getCurrentPosition(
  success: fetch AlAdhan API → update 6 prayer slots + badge + sun strip
  error: show inline error by geolocation error code (see §8)
)
```
Prayer slot state logic: compare each prayer time to `new Date()` → assign `.past` / `.next` / upcoming class. Identify next prayer → update `.pw-next-badge`.

### 3.4 Qibla — `getQibla()`
```
navigator.geolocation.getCurrentPosition(
  success:
    1. Reverse geocode → update #qCity
    2. Haversine → qibla_bearing (degrees from North to Mecca 21.4225°N, 39.8262°E)
    3. compassNeedle.style.transform = `rotate(${bearing - 180}deg)`  // 0.9s ease-reverent
    4. Update #qDeg, #qDist, #qBearing
  error: alert 'Location access denied.'
)
```

**Haversine formula (client-side, no API):**
```js
const dLon = (meccaLng - userLng) * Math.PI / 180;
const lat1 = userLat * Math.PI / 180;
const lat2 = meccaLat * Math.PI / 180;
const y = Math.sin(dLon) * Math.cos(lat2);
const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
let bearing = Math.atan2(y, x) * 180 / Math.PI;
bearing = (bearing + 360) % 360;
```

### 3.5 Hijri Calendar Navigation
`renderHijriCalendar(hijriYear, hijriMonth)`: clears `.hc-grid` body, builds 7-col grid with correct offsets. `‹` → decrement month (wrap year at 0), `›` → increment (wrap at 12). On render: mark today cell with `.today`, Islamic events with `.event`.

### 3.6 Zakat — `calcZakat()`
```js
const total = Math.max(0,
  +zkCash.value + +zkGold.value + +zkBiz.value + +zkInv.value - +zkDebt.value
);
const nisab = getNisab(); // 6180 default, live in P1
const zakat = total >= nisab ? total * 0.025 : 0;
// Update DOM + return {total, nisab, zakat, aboveNisab}
```
Never produces negative result (clamped at 0). Fires on every `oninput` and on Calculate button.

### 3.7 Tasbeeh Counter
State: `tbCount`, `tbTotal`, `tbRounds`, `tbGoal`, `tbVib`. All module-scoped `let` vars.

- `incrementTasbeeh()`: `tbCount++; tbTotal++; if (tbCount >= tbGoal) { tbCount = 0; tbRounds++; }` → update DOM → vibrate 28ms if `tbVib`
- `resetTasbeeh()`: `tbCount = tbRounds = 0`
- `undoTasbeeh()`: `if (tbCount > 0) { tbCount--; tbTotal--; }`
- `setDhikr(btn, ar, en, goal)`: swap `.on` class, update Arabic/English labels, set `tbGoal`, reset count
- `toggleVibrate()`: toggle `tbVib`, update button label

### 3.8 Fasting Tracker
State: array `fastedDays` (day numbers 1–30).

- `buildFastGrid()`: renders 30 `.fd` cells; marks `.today-fd` on today's Hijri day; marks `.fasted` from `localStorage` key `fasting-{month-year}`
- `updateFastStats()`: counts `.fasted` cells → `fsFasted`, computes `fsLeft = Math.max(0, target - count)`, computes `fsStreak` (consecutive days back from today)
- `toggleFastToday()`: toggles today's cell, calls `updateFastStats()`, updates `#fastTodayBtn` label
- Persistence: `localStorage.setItem('fasting-{month-year}', JSON.stringify(fastedDays))`

### 3.9 Name Finder
Local `NAMES` dict (8 entries for v1 mockup, 2000+ via API in production).

- `searchName()`: lowercase + strip non-alpha → dict lookup → `showName(data)` or hide `#nameResult`
- `showName(data)`: populates `#nrAr`, `#nrTitle`, `#nrMeaning`, `#nrGender`, `#nrOrigin`, `#nrQuran`; animates panel in with `slideUp` (0.3s)
- `quickName(key)`: fills `#nameSearch.value`, calls `showName(NAMES[key])` directly

### 3.10 Age Calculator — `calcAge()`
```js
const days = (new Date(ageToday.value) - new Date(ageDob.value)) / 86400000;
if (days <= 0) { showAgeError(); return; }
aHijriY.textContent = Math.floor(days / 354.37);
aHijriM.textContent = Math.floor((days % 354.37) / 29.53);
aGregY.textContent  = Math.floor(days / 365.25);
aDays.textContent   = Math.round(days);
// Approximate Hijri birthday year
const hijriBirthYear = Math.round((ageDob.getFullYear() - 622) * 1.0307 + 1);
```
All outputs labelled `(approximate)`.

### 3.11 Sadaqah Tracker
- `logSadaqah()`: button text → `✓ Logged! JazakAllahu Khayran`; revert after 2s; in P1: opens log form → saves `{date, amount, cause}` to `sadaqah-ledger`
- Ring: `stroke-dashoffset = 226.2 * (1 - pct)` where `pct = thisMonth / goal`

### 3.12 Tool Grid Filter — `filterTools(cat, btn)`
```js
document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
btn.classList.add('active');
document.querySelectorAll('.tool-card').forEach(card => {
  card.style.display =
    (cat === 'all' || card.dataset.cat.includes(cat)) ? '' : 'none';
});
```

### 3.13 Reveal Observer
```js
const ro = new IntersectionObserver(entries =>
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }}),
  { threshold: 0.06 }
);
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
```

---

## 4. Backend Logic

`tools.html` is a static HTML page. No server-side rendering. The "backend" is:

1. **API proxy** — a lightweight server-side route (e.g. `/api/prayer`, `/api/nisab`) that holds API keys in env vars and proxies external calls. Client-side JS never holds keys.
2. **`localStorage`** — all user state in v1.
3. No database writes from `tools.html` in v1.

---

## 5. APIs

### 5.1 Prayer Times — AlAdhan
| Field | Value |
|---|---|
| Endpoint | `GET https://api.aladhan.com/v1/timingsByCity` |
| Params | `city`, `country`, `method` (2=ISNA, 3=MWL, 4=Umm Al-Qura…), optional `school=1` (Hanafi Asr) |
| Response | `data.timings` — object with Fajr/Sunrise/Dhuhr/Asr/Sunset/Maghrib/Isha |
| Caching | `localStorage` key `islamicinfo-prayer-{city}-{date}`, refreshed daily |
| Proxied | Yes — `/api/prayer?city=X&country=Y&method=Z` |

### 5.2 Nisab — Gold Price (P1)
| Field | Value |
|---|---|
| Source | metals-api.com or gold-api.com |
| Formula | `nisab_usd = (price_per_troy_oz / 31.1035) * 85` |
| Caching | `localStorage` key `islamicinfo-nisab-{date}` |
| Proxied | Yes — API key in env var |
| Fallback | Use `$6,180` hardcoded if API fails, display `Using cached nisab from {date}` |

### 5.3 Reverse Geocoding — City Name
| Field | Value |
|---|---|
| Endpoint | `GET https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lng}&localityLanguage=en` |
| Auth | None — free, key-free, safe to call client-side |
| Response | `city + principalSubdivision` |
| Fallback | `'Near your location'` |

### 5.4 Qibla Bearing
No API. Pure client-side Haversine (see §3.4). Works offline.

### 5.5 Islamic Name API (Production)
Not in v1. Backend endpoint `/api/names?q={query}` returning full name object. Replaces local `NAMES` dict.

---

## 6. Database

No database in v1. All persistence is `localStorage`.

| Key | Type | Purpose |
|---|---|---|
| `islamicinfo-theme` | `'light'|'dark'` | Theme — shared across all pages |
| `islamicinfo-prayer-city` | string | Last used city |
| `islamicinfo-prayer-method` | string | Last calculation method |
| `islamicinfo-prayer-{city}-{date}` | JSON | Cached prayer times |
| `islamicinfo-nisab-{date}` | JSON | Cached nisab value |
| `islamicinfo-qibla-city` | string | Last Qibla city |
| `tasbeeh-session-{YYYY-MM-DD}` | JSON | Daily totals per dhikr type |
| `tasbeeh-week` | JSON | Rolling weekly totals |
| `fasting-{month-year}` | JSON array | Fasted day numbers for month (e.g. `[3,7,11]`) |
| `sadaqah-ledger` | JSON array | `[{date, amount, cause}]` entries |
| `sadaqah-goal` | number | Monthly sadaqah goal |

**Production note:** When user accounts are added (out of scope v1), these keys migrate to server-side storage with the same shape.

---

## 7. Validation

### 7.1 Zakat Inputs
- `type="number"` on all 5 fields — browser rejects non-numeric
- `oninput`: reject negative values → border-red + inline error `'Enter a positive amount'`
- `calcZakat()`: `Math.max(0, total)` clamp — result never negative
- Very large values (e.g. $1B): format with `toLocaleString('en-US', {style:'currency', currency:'USD', minimumFractionDigits:2})`

### 7.2 Age Calculator
- DOB in future: `if (days <= 0)` → show `'Date of birth must be in the past'`, zero all outputs
- DOB = today: all results 0, valid state
- `ageToday` cleared: fall back to `new Date()`, never crash on null

### 7.3 Name Finder
- Empty submit: `if (!query.trim()) return` — no error shown
- Strip non-alpha: `query.replace(/[^a-zA-Z]/g, '').toLowerCase()`
- Truncate >50 chars: `query.substring(0, 50)`
- Not found: hide `#nameResult`, show inline `'Name not found. Try a common spelling (e.g. Maryam, Ibrahim).'`

### 7.4 Fasting Tracker
- `fsLeft = Math.max(0, target - fasted)` — never negative remaining
- `fsStreak`: count consecutive fasted days backwards from today, stop at gap
- All 30 days fasted: valid state, no overflow

### 7.5 Sadaqah Ring
- `goal === 0`: default to 200, never divide by zero
- Log button: debounce 2s — `btn.disabled = true` during confirmation timeout

---

## 8. Error Handling

### 8.1 Geolocation Errors (Prayer Widget + Qibla)
| Code | Condition | Message | Fallback |
|---|---|---|---|
| `PERMISSION_DENIED` | User clicks Block | `'Location access denied — enter city manually.'` | Show manual city input |
| `POSITION_UNAVAILABLE` | GPS hardware fail | `'Could not detect location. Try again or enter city manually.'` | Manual input |
| `TIMEOUT` | >10s | `'Location timed out. Check your connection.'` | Manual input + retry |
| HTTPS required | HTTP context | `'Location requires HTTPS.'` | Manual input |

### 8.2 Prayer API Failures
- HTTP 4xx/5xx → show cached `localStorage` times if available; else show dashes
- `navigator.onLine === false` → `'No internet connection. Showing last known times.'`

### 8.3 Nisab API Failure
- Use `$6,180` hardcoded; display `'Using cached nisab from {date}'`; log error to console

### 8.4 localStorage Write Failure (Sadaqah)
```js
try {
  localStorage.setItem(key, value);
} catch (e) {
  console.error('Storage write failed:', e);
  showInlineNote('Save failed — data may not persist');
}
```

### 8.5 Vibrate API Not Supported
```js
if (tbVib && navigator.vibrate) navigator.vibrate(28);
// else silently skip
```
Vibrate button label: `'Vibrate (not supported)'` if `!navigator.vibrate`.

### 8.6 Tasbeeh Undo at 0
`if (tbCount > 0 && tbTotal > 0) { tbCount--; tbTotal--; }` — otherwise no-op.

---

## 9. RBAC

No authentication in v1. All tools are fully public — no account required.

**Future (out of scope v1):**
- Authenticated users: cloud-sync for Tasbeeh, Fasting, Sadaqah data replacing `localStorage`
- Admin role: manage `NAMES` dict, update nisab fallback value, toggle Coming Soon cards

---

## 10. Edge Cases

| Tool | Scenario | Behaviour |
|---|---|---|
| Zakat | Debts > all assets | `Math.max(0, total)` → $0.00, label `'Net assets below zero — no Zakat due'` |
| Zakat | All inputs empty | $0.00, label `'Enter your wealth details above'` |
| Tasbeeh | `tbGoal` set to 0 | Default to 33; never divide by zero |
| Tasbeeh | >5 taps/sec rapid | All taps registered; animation may drop frames; count accurate |
| Fasting | Unfasting a fasted day | Toggle removes `.fasted`, streak recalculates |
| Fasting | Suhoor/Iftar unavailable | Show `'---'`, no error state |
| Name | Arabic typed in search | v1: `'Search in English (e.g. Maryam)'` |
| Name | Numbers/symbols in input | Strip non-alpha, proceed with lookup |
| Age | Very old DOB (pre-1900) | Calculate correctly; `(approximate)` label applies more strongly |
| Sadaqah | Goal = $0 | Default $200; ring shows 0% |
| Prayer | Page load > midnight | Date re-evaluates; prayer states update correctly |
| Hijri Cal | Month 12 + `›` | Wrap to month 1, year++ |
| Hijri Cal | Month 1 + `‹` | Wrap to month 12, year-- |
| AI Verifier | Card click | Show Coming 2026 modal; no navigation |
| Geolocation | HTTPS required in dev | Inline note; manual city input shown |

---

## 11. Performance

### 11.1 Core Web Vitals Targets
- LCP ≤ 2.5s
- CLS ≤ 0.1
- INP ≤ 200ms

### 11.2 Strategies
- **Font preconnect** — `fonts.googleapis.com` + `fonts.gstatic.com` in `<head>` before stylesheet link
- **No render-blocking JS** — single `<script>` at end of `<body>`
- **Incremental tool load** — prayer widget and Qibla/Hijri calendar fetch data lazily (on user interaction or IntersectionObserver entry), not on page load
- **localStorage cache** — prayer times cached per city+date; nisab cached per date — reduces API calls to 1 per day per user
- **CSS animations** — all on `transform` and `opacity` (compositor-only); no `width`/`height`/`top` animations
- **`will-change: transform, box-shadow`** on `.card` — promotes to own layer ahead of hover
- **IntersectionObserver at `threshold: 0.06`** — tools load early enough; `unobserve` after first trigger
- **Tool card grid** — `repeat(auto-fill, minmax(280px, 1fr))` — no JS layout, pure CSS
- **Compass spin** — SVG element, CSS animation only (`rotate(360deg)` 22s linear); no JS per frame
- **Tasbeeh button** — `transform: scale(0.92)` snap (120ms) triggered by class, not JS style mutation

### 11.3 API Call Budget (per page load)
| Call | Condition | Max calls |
|---|---|---|
| AlAdhan prayer times | On geolocation or city change | 1/load, cached daily |
| Reverse geocode | On geolocation success | 1/load |
| Nisab gold price (P1) | On page load | 1/load, cached daily |

---

## 12. File Structure

```
islamicinfo.org/
├── tools.html                    ← this page
├── inheritance.html              ← routed from Inheritance Calculator card
├── habits.html                   ← CTA link
├── dua.html                      ← CTA link
├── verify.html                   ← CTA link
│
├── /api/                         ← server-side proxy (not in tools.html)
│   ├── prayer.js                 ← proxies AlAdhan API, injects key
│   └── nisab.js                  ← proxies gold price API, injects key
│
├── /js/
│   └── tools.js                  ← (optional extraction; currently inline)
│
└── /assets/
    └── fonts/                    ← Google Fonts loaded via CDN preconnect
```

**Single-file build:** In v1, all CSS and JS are inline in `tools.html`. Extraction to `/js/tools.js` is a P2 refactor.

---

## 13. TypeScript Interfaces

These types define the data shapes used across all tools. Used when extracting to TypeScript or when building the production API layer.

```typescript
// Tool card data model
interface ToolCard {
  id: string;                         // e.g. 'prayer-times'
  title: string;
  description: string;
  status: 'live' | 'new' | 'beta' | 'coming-soon';
  icon_theme: 'ti-teal' | 'ti-gold' | 'ti-emerald';
  icon_svg: string;
  categories: string[];               // e.g. ['prayer', 'tracker']
  tags: string[];                     // max 3
  href?: string;                      // absent for coming-soon
  href_external?: boolean;
  cta_label: string;
}

// Prayer times
interface PrayerSlot {
  name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  time: string;                       // '5:28 PM'
  status: 'past' | 'next' | 'upcoming';
}

interface PrayerData {
  city: string;
  date: string;                       // ISO date string
  prayers: PrayerSlot[];
  sunrise: string;
  sunset: string;
  daylight: string;                   // '14h 4m'
  method: string;                     // 'ISNA' | 'MWL' | 'Hanafi' | ...
}

// Qibla
interface QiblaData {
  lat: number;
  lng: number;
  qibla_bearing: number;              // 0–360, degrees from North
  distance_km: number;
  bearing_label: string;              // '54° NE'
  city: string;
}

// Zakat calculation
interface ZakatInputs {
  cash: number;
  gold: number;
  biz: number;
  investments: number;
  debts: number;
}

interface ZakatResult {
  total: number;                      // Math.max(0, sum - debts)
  nisab: number;                      // default 6180
  zakat: number;                      // total * 0.025 or 0
  aboveNisab: boolean;
}

// Name finder
interface IslamicName {
  key: string;                        // lookup key e.g. 'maryam'
  arabic: string;                     // 'مَرْيَم'
  english: string;                    // 'Maryam'
  transliteration: string;
  meaning: string;
  gender: 'male' | 'female' | 'unisex';
  origin: string;
  quranic: boolean;
  quran_ref?: string;                 // e.g. 'Surah Maryam 19:16'
}

// Age calculator
interface AgeResult {
  hijriYears: number;
  hijriMonths: number;
  gregorianYears: number;
  totalDays: number;
  hijriBirthYear: number;
  hijriBirthMonthEn: string;
  hijriBirthArabic: string;
  approximate: true;                  // always true in v1
}

// Sadaqah ledger entry
interface SadaqahEntry {
  date: string;                       // ISO date
  amount: number;
  cause?: string;
}

// Fasting state
interface FastingState {
  monthYear: string;                  // e.g. 'shawwal-1447'
  fastedDays: number[];               // e.g. [3, 7, 11]
  target: number;                     // 6 for Shawwal, 29/30 for Ramadan
  type: 'ramadan' | 'shawwal' | 'voluntary' | 'custom';
}

// Tasbeeh session
interface TasbeehSession {
  date: string;
  counts: Record<string, number>;     // { subhanallah: 99, alhamdulillah: 33 }
  totalTaps: number;
}

// localStorage schema (all keys)
interface LocalStorageSchema {
  'islamicinfo-theme': 'light' | 'dark';
  'islamicinfo-prayer-city': string;
  'islamicinfo-prayer-method': string;
  [`islamicinfo-prayer-${string}-${string}`]: PrayerData;
  [`islamicinfo-nisab-${string}`]: { nisab: number; date: string };
  'islamicinfo-qibla-city': string;
  [`tasbeeh-session-${string}`]: TasbeehSession;
  'tasbeeh-week': { total: number; weekStart: string };
  [`fasting-${string}`]: FastingState;
  'sadaqah-ledger': SadaqahEntry[];
  'sadaqah-goal': number;
}
```

---

## 14. Testing

### 14.1 Unit Tests (Jest / Vitest)

| Function | Test cases |
|---|---|
| `calcZakat()` | All zero → $0; below nisab → $0 + correct label; above nisab → `total * 0.025`; debts > assets → clamp to $0; negative input rejected |
| `calcAge()` | Future DOB → 0 outputs; valid DOB → correct Hijri/Greg years; today = DOB → 0 |
| `searchName('ibrahim')` | Returns correct `IslamicName` object |
| `searchName('unknown')` | Returns `null`, hides `#nameResult` |
| `searchName('Ibr4him')` | Strips non-alpha, finds `ibrahim` |
| `incrementTasbeeh()` | Count increments; rounds++ at goal; count resets to 0 at goal |
| `undoTasbeeh()` | Decrements at count > 0; no-op at count = 0 |
| `filterTools('finance')` | Hides non-finance cards; shows Zakat, Inheritance, Sadaqah |
| `filterTools('all')` | Shows all 12 cards |
| Qibla Haversine | Toronto (43.65°N, 79.38°W) → bearing ≈ 54°; London → ~119°; Jakarta → ~294° |
| Nisab formula | `(price / 31.1035) * 85` for various gold prices |

### 14.2 Integration Tests

| Scenario | Expected |
|---|---|
| `getPrayerLocation()` succeeds | 6 slots populated, `.next` class on correct prayer, badge updated |
| `getPrayerLocation()` denied | Inline error shown, manual input visible |
| AlAdhan API 500 | Cached times shown (or dashes), error message displayed |
| `getQibla()` succeeds | Needle rotated, `#qDeg`/`#qDist`/`#qBearing` updated |
| Hijri prev/next nav | Grid re-renders with correct month; today cell absent on non-current months |
| Zakat live input | `#zkResult` updates on every keystroke without lag |
| Fasting `localStorage` | Toggle day → save; reload → state restored |
| Sadaqah log debounce | Double-click within 2s → single log entry |

### 14.3 E2E Tests (Playwright / Cypress)

| Flow | Steps | Pass condition |
|---|---|---|
| Prayer Times flow | Load → see 6 slots → click "My Location" → allow → times refresh | City updated, `.next` class present |
| Zakat flow | Scroll to #zakat → enter $50k cash, $0 debt → read result | $1,250.00 (50000 × 0.025) |
| Tasbeeh flow | Select Alhamdulillah → tap 33× → rounds = 1 | Rounds increments, count resets |
| Category filter | Click "Finance & Fiqh" → count visible cards | Exactly 3 cards visible |
| Name finder | Type "maryam" → press Enter → see Arabic مَرْيَم | `#nrAr` contains Arabic text |
| Dark mode | Click theme toggle → reload → theme persists | `[data-theme="dark"]` on `<html>` |
| Mobile 375px | Load at 375px → no horizontal scroll → prayer grid 3-col | No overflow; grid 3-col |
| Coming Soon card | Click AI Verifier card | Modal appears; no navigation |

### 14.4 QA Checklist (pre-launch)

**Design:**
- [ ] No shimmer `::after` on any card (light + dark)
- [ ] All hover transitions use `--ease-reverent` / `--ease-premium`
- [ ] Bismillah: teal gradient (light) / gold + drop-shadow (dark)
- [ ] Dark card hover uses `rgba(88,193,199,.18)` glow, not light-mode teal
- [ ] All 10 nav items present; `Tools` = `.active`; `islamic-studies.html` used (never `learn.html`)

**Function:**
- [ ] Prayer widget: 6 slots + correct `.next` / `.past` states on load
- [ ] Qibla needle rotates after geolocation
- [ ] Hijri `‹` / `›` re-renders grid
- [ ] Zakat: result updates live; disclaimer present; below-nisab message correct
- [ ] Tasbeeh: all 4 chips work; counter increments; reset/undo/vibrate work
- [ ] Fasting: grid cells toggle; Mark Today works; stats update
- [ ] Name chips: all 8 chips populate result
- [ ] Age calc: outputs appear after DOB entry
- [ ] Sadaqah: Log button shows confirmation 2s; reverts

**Responsive:**
- [ ] 1100px, 900px, 820px, 760px, 700px, 600px, 560px, 460px, 440px, 320px — all verified

**Accessibility:**
- [ ] Tab order logical throughout page
- [ ] All inputs have `aria-label` or visible label
- [ ] Tasbeeh button: `aria-label="Count dhikr, current count: N"` (dynamic)
- [ ] WCAG AA contrast in light + dark

**Links:**
- [ ] All 49 P0 link items from PRD §11 verified (hero CTAs, tool cards, filter tabs, tool functions, footer)

---

*End of Tools Page Technical Document v1.0*
*IslamicInfo.org · `tools.html` · Design system: CLAUDE.md v3.0 · PRD: v1.1 · Func doc: v1.0*
