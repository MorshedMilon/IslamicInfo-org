# IslamicInfo — Home Page Technical Specification
**Page:** `index.html` · **Route:** `/`
**Blueprint:** `home_fixed.html` · **Design System:** `CLAUDE_v3.md v3.0` · **PRD:** v1.1 · **Status:** Implementation-Ready

---

## 1. Purpose

The home page is the primary entry point for IslamicInfo.org. It serves six functions:

1. **Brand establishment** — Scholarly authenticity via Arabic typography, design tokens, and Bismillah
2. **Content discovery** — 8-card Feature Grid linking to all platform sections
3. **Daily value delivery** — Rotating Qur'anic verse, Hadith, and Dua of the day (Daily Trio)
4. **Contextual utility** — Live 5-prayer schedule for the user's detected location
5. **Trust signalling** — Verify Preview (static), Trusted Sources, and no-fabrication commitment
6. **Conversion** — Primary CTAs: "Start Learning" → `/islamic-studies`, "Explore Qur'an" → `/quran`

**KPIs:** Bounce rate < 40%, session depth > 3 pages, feature card CTR > 8%, prayer widget daily engagement > 60% of returning visitors, Lighthouse ≥ 90.

---

## 2. UI Components

Sections render top-to-bottom. All carry `data-screen-label` for analytics event attribution.

| # | Section | `data-screen-label` | Key Elements |
|---|---|---|---|
| 1 | Header / Nav | `Header` | Logo, 10-item nav, search popup, language `EN`, theme toggle, admin icon, hamburger |
| 2 | Hero | `Hero` | Bismillah bar, eyebrow badge, `<h1>`, subtitle, Hijri pill, 2 CTAs, 4 geo SVGs, animated bg |
| 3 | Daily Trio | `Daily Trio` | 3 cards: Verse · Hadith · Dua; action bar on each (Copy, Bookmark, Audio, AI) |
| 4 | Prayer Times | `Prayer Times` | Location pill, 5–6 prayer cards, next/past states, Hijri date, "View Full Calendar" |
| 5 | Feature Grid | `Feature Grid` | 8 `.feat-card` — staggered reveal, icon, title, description, CTA |
| 6 | Reflection | `Reflection` | Full-width dark banner — Arabic verse, English translation, attribution pill |
| 7 | Verify Preview | `Verify Preview` | Static: claim, grade badge, confidence dial, isnad chain, 2 evidence cards |
| 8 | Trusted Sources | `Trusted Sources` | 6 `.source-pill` items, methodology bar (3 promise statements) |
| 9 | About / Mission | `About` | Dark teal section, mission copy, 4-stat row (6236 / 12000+ / 300+ / 0) |
| 10 | CTA | *(before footer)* | Dark teal gradient, eyebrow badge, heading, 2 buttons, QuranlyAI ecosystem promo |
| 11 | Footer | `Footer` | 5-column grid (brand / Featured / Quick Access / Our Ecosystem / Company+Legal) |

### 2.1 Feature Grid Card Manifest

| # | Title | CTA | Route |
|---|---|---|---|
| 1 | Qur'an Explorer | Explore Qur'an | `/quran` |
| 2 | Hadith Library | Discover Hadith | `/hadith` |
| 3 | Daily Duas | Daily Duas | `/dua` |
| 4 | **Habit Tracker** *(featured)* | Track Habits | `/habits` |
| 5 | Islamic Tools | Islamic Tools | `/tools` |
| 6 | AI Study Assistant | Ask AI | `/islamic-studies?mode=ai` |
| 7 | Islamic Studies | Start Learning | `/islamic-studies` |
| 8 | Verify a Claim | Verify Now | `/verify` |

Card #4 uses `class="feat-card card-featured"` (stronger border + `elev-2`). Card #6 is distinct from Card #7; route includes `?mode=ai` query param.

---

## 3. Frontend Logic

### 3.1 Theme Toggle
- On load: read `localStorage.getItem('islamicinfo-theme')` → default `'light'`; apply to `<html data-theme>` **before first paint** (inline script in `<head>`)
- Toggle click: flip attribute + persist to `localStorage`
- Dark mode: Bismillah switches from teal gradient to gold gradient + `filter: drop-shadow(0 0 14px rgba(217,179,88,.55))`

### 3.2 Language Selector
- On load: read `localStorage.getItem('islamicinfo-lang')` → fallback to `navigator.language` → fallback to `'en'`
- Switching: `i18next.changeLanguage(code)` → re-render all `data-i18n` keys without page reload
- Arabic / Urdu: set `document.documentElement.dir = 'rtl'` globally
- Qur'anic Arabic text: never translated, always RTL regardless of UI language
- Persist choice: `localStorage.setItem('islamicinfo-lang', code)`

### 3.3 Search Popup
- Trigger: `#searchTrigger` click → toggle `.open` class on `#searchPopup` + focus `#searchPopupInput` after 50ms
- Close: Escape keydown or click outside popup bounds
- Submit: `Enter` key or `.search-popup-btn` click → dispatch search query

### 3.4 Mobile Menu
- `openMM()` / `closeMM()` toggle `.open` on `#mobileMenu`
- **Focus trap** (WCAG 2.1 AA 2.1.2): When open, `Tab`/`Shift+Tab` cycles only through `.mm-link` items and `.mm-close`; focus returns to `.hamburger` on close
- `Escape` key triggers `closeMM()`

### 3.5 Header Scroll State
- `window.scroll` (passive): toggle `.scrolled` class on `#siteHeader` at `scrollY > 16` → adds `elev-1` shadow

### 3.6 Scroll Reveal
- `IntersectionObserver` at `threshold: 0.12` on all `.reveal` elements → add `.in` class once, then `unobserve`
- Stagger: `.reveal-d1` (0.1s), `.reveal-d2` (0.2s), `.reveal-d3` (0.3s) on card grids

### 3.7 Hijri Date Pill
- Calculate using a Hijri conversion library (e.g., `hijri-js` or `luxon` with Islamic calendar)
- Render into `.hijri-pill` on hero
- Error handling: `try/catch` → on failure, hide pill (`display: none`) and show Gregorian date in hero subtitle

### 3.8 Prayer Times Strip
- Geolocation: `navigator.geolocation.getCurrentPosition()` → fetch from Aladhan API
- Highlight next prayer: compare current time vs. prayer times → apply `class="prayer next"` + `prayer-pulse-border` animation (1.5s, fires once on load)
- Past prayers: `class="prayer past"` → `opacity: 0.55`
- Optional Jumu'ah card on Fridays
- Cache: keyed by `[lat, lng, date]` in `localStorage` with TTL = midnight

### 3.9 Daily Trio Content Rotation
- Fetch today's verse, hadith, and dua from CDN/backend (keyed by `YYYY-MM-DD`)
- `stale-while-revalidate`: serve from `localStorage` cache while background-fetching fresh content

### 3.10 Global Content Actions (Daily Trio cards)

| Action | Trigger | MVP |
|---|---|---|
| Copy | Copy icon | ✅ `navigator.clipboard.writeText(text + attribution)` → "Copied!" toast |
| Bookmark | Bookmark icon toggle | ✅ toggle filled/unfilled; write `{type, id, content}` to `islamicinfo-bookmarks` array in `localStorage` |
| Audio | Play icon | ✅ Inline `<audio>` player — speed 0.75×/1×/1.5×/2×, reciter selector, timeline |
| AI Explanation | AI icon | Phase 2 — Claude API call; result cached 24h under `islamicinfo-ai-{contentId}` |
| Share Image | Share icon | Phase 2 — canvas-based PNG generation |
| Notes | Notes icon | Phase 2 — modal with free-form text, auto-linked to content ID |

### 3.11 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .geo, .hero-bg, .badge-dot, .brand-mark .star,
  .brand-mark .halo { animation: none !important; }
  .reveal { transition: opacity 0.3s ease !important;
            transform: none !important; }
}
```

---

## 4. Backend Logic

The home page is **static/CDN-served for MVP**. No server-side rendering required.

### 4.1 Daily Content Rotation (Phase 1 Extended)
- Pre-generate daily content bundles server-side: `{ date, verse: {ar, en, ref}, hadith: {ar, en, ref, grade}, dua: {ar, transliteration, en, ref} }`
- Deploy as immutable CDN files: `/api/daily/{YYYY-MM-DD}.json`
- Cache-Control: `max-age=86400, immutable`
- Client fetches by today's date; falls back to `localStorage` cache, then to hardcoded default

### 4.2 Prayer Times (Phase 1 Extended)
- Client calls [Aladhan API](https://aladhan.com/prayer-times-api): `GET https://api.aladhan.com/v1/timings/{timestamp}?latitude={lat}&longitude={lng}&method=3`
- Response normalised to `{ fajr, sunrise, dhuhr, asr, maghrib, isha }` in user local timezone
- No server proxy needed for MVP

### 4.3 Search (Phase 1 Extended)
- Backend: Full-text search endpoint or Algolia/Typesense index over Qur'an, Hadith, Duas, KH articles
- Request: `GET /api/search?q={query}&lang={lang}&limit=10`
- Response: `{ results: [{ type, id, title, excerpt, url }] }`

### 4.4 AI Explanation (Phase 2)
- Backend proxy to Anthropic API (`claude-sonnet-4-6`) — do not expose API key to client
- Endpoint: `POST /api/explain` `{ type, id, content, language }`
- Server validates content type and rate-limits per IP/session
- Response cached by backend with 24h TTL, keyed by `{type}:{id}:{lang}`

---

## 5. APIs

| API | Endpoint | Method | Auth | Notes |
|---|---|---|---|---|
| Daily Content | `/api/daily/{YYYY-MM-DD}.json` | GET | None | CDN-served; immutable |
| Prayer Times | `https://api.aladhan.com/v1/timings/{ts}` | GET | None | External; client-direct for MVP |
| Search | `/api/search?q=&lang=&limit=` | GET | None | Phase 1 Extended |
| AI Explain | `/api/explain` | POST | Session | Phase 2; server proxies to Claude |
| Bookmark Sync | `/api/bookmarks` | GET/POST/DELETE | JWT | Phase 2; syncs localStorage to account |

### 5.1 Prayer Times Error Contract
- `AbortController` timeout: 5s
- On error or timeout → load static fallback JSON (London MWL times)
- On malformed response: show `---` per slot; `console.warn` with raw payload
- Report actual failures to Sentry

### 5.2 Search Error Contract
- On fetch failure → render "Search is temporarily unavailable" inside `.search-popup`
- Popup remains functional (can still be closed normally)

---

## 6. Database

The home page consumes read-only data. No writes originate here except user-preference `localStorage`. Full schema lives in the shared data layer.

### 6.1 Relevant Collections / Tables

**`daily_content`**
```
date         DATE PK
verse_ar     TEXT NOT NULL   -- Arabic text
verse_en     TEXT NOT NULL   -- English translation
verse_ref    TEXT NOT NULL   -- e.g. "Al-Baqarah 2:255"
hadith_ar    TEXT
hadith_en    TEXT NOT NULL
hadith_ref   TEXT NOT NULL   -- e.g. "Sahih al-Bukhari 1"
hadith_grade ENUM('sahih','hasan','daif','mawdu')
dua_ar       TEXT NOT NULL
dua_translit TEXT
dua_en       TEXT NOT NULL
dua_ref      TEXT
```

**`prayer_times_cache`** *(optional server-side cache)*
```
cache_key    TEXT PK   -- "{lat_rounded}_{lng_rounded}_{date}"
payload      JSONB
expires_at   TIMESTAMP
```

**`bookmarks`** *(Phase 2 — account sync)*
```
user_id      UUID FK
content_type ENUM('verse','hadith','dua')
content_id   TEXT
saved_at     TIMESTAMP
```

**`notes`** *(Phase 2)*
```
user_id      UUID FK
content_id   TEXT
body         TEXT
updated_at   TIMESTAMP
```

---

## 7. Validation

### 7.1 Daily Content Response
- Required fields: `verse_ar`, `verse_en`, `verse_ref`, `hadith_en`, `hadith_ref`, `hadith_grade`, `dua_ar`, `dua_en`
- `hadith_grade` must be one of `['sahih', 'hasan', 'daif', 'mawdu']`
- On schema failure: fall back to `localStorage` cache → then to hardcoded default (Ayat al-Kursi)

### 7.2 Prayer Times Response
- Validate each of `fajr, dhuhr, asr, maghrib, isha` is a parseable time string
- If ≥ 1 valid time exists, render partial result with `---` for missing slots
- If 0 valid times, load static fallback

### 7.3 Hijri Date
- Wrap conversion in `try/catch`
- Only render `.hijri-pill` on success

### 7.4 Clipboard / Storage
- Wrap `navigator.clipboard.writeText()` in `try/catch`; show error toast on failure
- Wrap all `localStorage.setItem()` calls — catch `QuotaExceededError` → show "Storage full — please clear some bookmarks" toast; never silently discard

### 7.5 Search Input
- Debounce: 300ms before dispatching query
- Trim whitespace; minimum 2 characters before firing API call

### 7.6 Language Selector
- Validate selected code is in allowed set: `['en','ar','bn','hi','ur','es','fr','tr','ms','id']`
- Reject unknown codes; default to `'en'`

---

## 8. Error Handling

| Scenario | User-Facing Behaviour | Technical Handling |
|---|---|---|
| Geolocation denied | Static London MWL times + inline "Enable location" prompt (12px teal link) | `getCurrentPosition` error callback → load static JSON |
| Prayer API timeout (5s) | Static London MWL times; no visible error | `fetch` + `AbortController(5000)`; catch → static fallback; report to Sentry |
| Prayer API malformed | `---` per missing slot; no crash | Schema validation; partial render if ≥ 1 valid time |
| Daily content API failure | Last-known `localStorage` cache; if none, hardcoded default verse | `stale-while-revalidate`; catch → `localStorage`; catch → hardcoded |
| Hijri calculation failure | Hide pill; show Gregorian date in subtitle | `try/catch`; conditional render |
| AI Explanation timeout (10s) | "Explanation temporarily unavailable. Try again." in modal with retry button | `AbortController(10000)`; modal stays open |
| AI Explanation cache corrupt | Silent: delete key, make fresh API call | `JSON.parse` in `try/catch`; `localStorage.removeItem(key)` on error |
| Search API unavailable | "Search is temporarily unavailable" below input; popup stays open | Catch in search handler; render inline message |
| Bookmark/Notes `localStorage` quota exceeded | Toast: "Storage full — please clear some bookmarks" | Catch `QuotaExceededError`; toast component; existing data preserved |
| Clipboard write failure | Toast: "Could not copy — try manually" | `try/catch` on `clipboard.writeText()` |

---

## 9. RBAC

The home page is **publicly accessible** with no authentication gate.

| Role | Access | Notes |
|---|---|---|
| Guest (unauthenticated) | Full page view; Copy/Bookmark/Audio (localStorage only) | Default state |
| Authenticated User | All guest features + cloud sync for Bookmarks/Notes | Phase 2; JWT from auth service |
| Admin | All user features + admin icon in header activates CMS panel | Header admin icon is placeholder in MVP |

**Auth guard:** The admin icon in the header toolbar is a non-functional placeholder in MVP. Phase 2 wires it to the auth/session flow. No routes on the home page require auth.

**localStorage keys are unscoped** (guest). On login, merge guest `localStorage` data into the user's account bookmarks/notes (Phase 2 sync logic).

---

## 10. Edge Cases

| Case | Handling |
|---|---|
| User denies geolocation on first visit | Show static times immediately; no blocking prompt; show inline re-enable hint |
| User crosses midnight mid-session | Next prayer highlight re-calculates on `setInterval(60s)` or on next page focus event |
| Friday — Jumu'ah card | Check `new Date().getDay() === 5`; if true, insert 6th prayer card between Dhuhr and Asr |
| RTL language selected | `document.documentElement.dir = 'rtl'`; Arabic content (`.arabic` class) always RTL regardless |
| `prefers-reduced-motion` | All continuous animations disabled; `.reveal` transitions collapse to opacity-only fade |
| Feature Grid Card #6 vs #7 routing | Card #6 `href="/islamic-studies?mode=ai"`, Card #7 `href="/islamic-studies"` — never duplicate |
| Locale file fails to load | i18next fallback chain: requested locale → `'en'` → hardcoded key strings |
| Very small viewport (< 320px) | `clamp()` values on hero font prevent overflow; prayer grid stacks to single column |
| Verify Preview section (static) | All content is hardcoded in HTML; no API call on home page; live verification is Phase 2 |
| Daily content same-day cache hit | `stale-while-revalidate`: serve cached immediately, revalidate in background, update if changed |

---

## 11. Performance

**Targets:** FCP < 1.5s (4G), LCP < 2.5s, CLS < 0.1, JS bundle < 50KB gzipped, Lighthouse ≥ 90.

| Technique | Implementation |
|---|---|
| Theme flash prevention | Inline `<script>` in `<head>` reads `localStorage` and sets `data-theme` before CSS loads |
| Font preconnect | `<link rel="preconnect" href="https://fonts.googleapis.com">` + `fonts.gstatic.com crossorigin` in exact order (Cormorant Garamond → Inter → Amiri) |
| Image lazy loading | `loading="lazy"` on all below-the-fold images |
| Static CDN content | `Cache-Control: max-age=604800` on Qur'an/Hadith/Dua assets |
| Locale JSON caching | Served from CDN; `Cache-Control: max-age=86400`; i18next uses in-memory cache after first load |
| Prayer times cache | `localStorage` keyed by `[lat_rounded, lng_rounded, date]`; expires at midnight |
| AI explanation cache | `localStorage` key `islamicinfo-ai-{contentId}`; 24h TTL checked before every API call |
| Web Workers | Heavy AI explanation response processing off main thread (Phase 2) |
| Scroll reveal | `IntersectionObserver` (native, no polyfill needed for target browsers); `unobserve` after trigger |
| No framework | Vanilla JS for MVP home page; no React/Vue overhead |
| Animations | `will-change: transform, box-shadow` on `.feat-card`, `.card` only; no blanket `will-change` |

---

## 12. File Structure

```
project-root/
├── index.html                        # Home page (blueprint: home_fixed.html)
├── src/
│   ├── css/
│   │   ├── tokens.css                # :root + [data-theme="dark"] (CLAUDE_v3.md §1)
│   │   ├── base.css                  # Reset, body, .shell, .container (§3)
│   │   ├── header.css                # .site-header, .nav, .search-popup (§4)
│   │   ├── hero.css                  # .hero, .hero-bg, .geo, .hero-inner (§6)
│   │   ├── daily-trio.css            # .trio-card, action bar
│   │   ├── prayer-strip.css          # .prayer-strip, .prayer, states
│   │   ├── feature-grid.css          # .feat-card, .tool-icon (§10, §16)
│   │   ├── reflection.css            # Reflection section styles
│   │   ├── verify-preview.css        # .verify-box, .dial-card, .ev-card (§17)
│   │   ├── trusted-sources.css       # .source-pill, methodology bar
│   │   ├── about.css                 # .about-section, .stats-banner (§14)
│   │   ├── cta.css                   # .cta-section (§11)
│   │   ├── footer.css                # #ii-footer, .ft-* (§7)
│   │   ├── buttons.css               # .btn-primary/ghost/glass/white-ghost (§9)
│   │   ├── cards.css                 # Base .card hover system (§10)
│   │   ├── chips.css                 # .chip variants (§19)
│   │   ├── reveal.css                # .reveal, .reveal-d1/d2/d3 (§12)
│   │   ├── toast.css                 # .toast component (§18.7)
│   │   └── responsive.css            # All breakpoints: 1100/900/760/700/440px (§23)
│   ├── js/
│   │   ├── theme.js                  # Theme toggle (inline in <head> for no-flash)
│   │   ├── header.js                 # Search popup, mobile menu, scroll state
│   │   ├── focus-trap.js             # Mobile menu focus trap (WCAG 2.1.2)
│   │   ├── reveal.js                 # IntersectionObserver scroll reveal
│   │   ├── hijri.js                  # Hijri date calculation + pill render
│   │   ├── prayer-times.js           # Geolocation, Aladhan API, fallback, highlight
│   │   ├── daily-content.js          # Fetch/cache verse + hadith + dua
│   │   ├── content-actions.js        # Copy, Bookmark, Audio player, Toast
│   │   ├── language.js               # i18next init, locale loading, RTL toggle
│   │   └── analytics.js              # GA4 custom events (prayer_strip_viewed, etc.)
│   └── locales/
│       ├── en.json
│       ├── ar.json
│       ├── bn.json
│       ├── hi.json
│       ├── ur.json
│       ├── es.json
│       ├── fr.json
│       ├── tr.json
│       ├── ms.json
│       └── id.json
├── public/
│   ├── audio/                        # Qur'an recitation audio files
│   ├── static/
│   │   ├── prayer-fallback.json      # London MWL static prayer times
│   │   └── daily-default.json        # Hardcoded fallback daily content (Ayat al-Kursi)
│   └── api/daily/                    # Pre-generated daily bundles (CDN)
│       └── {YYYY-MM-DD}.json
└── tests/
    ├── unit/
    │   ├── hijri.test.ts
    │   ├── prayer-times.test.ts
    │   ├── daily-content.test.ts
    │   └── content-actions.test.ts
    └── e2e/
        ├── home.spec.ts
        ├── theme.spec.ts
        └── accessibility.spec.ts
```

---

## 13. TypeScript Interfaces

```typescript
// ── Daily Content ──────────────────────────────────────────────
interface DailyContent {
  date: string;          // "YYYY-MM-DD"
  verse: {
    ar: string;
    en: string;
    ref: string;         // "Al-Baqarah 2:255"
  };
  hadith: {
    ar: string;
    en: string;
    ref: string;         // "Sahih al-Bukhari 1"
    grade: HadithGrade;
  };
  dua: {
    ar: string;
    transliteration: string;
    en: string;
    ref: string;
  };
}

type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu';

// ── Prayer Times ────────────────────────────────────────────────
interface PrayerTimes {
  fajr:    string;       // "05:12"
  sunrise: string;
  dhuhr:   string;
  asr:     string;
  maghrib: string;
  isha:    string;
  jumuah?: string;       // Only present on Fridays
  location: string;      // City name for display
  hijriDate: string;     // "15 Dhul-Qi'dah 1447"
}

type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
type PrayerState = 'next' | 'past' | 'upcoming';

interface PrayerCardState {
  name: PrayerName;
  time: string;
  state: PrayerState;
}

// ── Bookmarks & Notes ───────────────────────────────────────────
type ContentType = 'verse' | 'hadith' | 'dua';

interface Bookmark {
  type: ContentType;
  id: string;
  content: string;
  savedAt: number;       // Unix timestamp
}

interface Note {
  contentId: string;
  body: string;
  updatedAt: number;
}

// ── Content Actions ─────────────────────────────────────────────
interface ActionBarConfig {
  contentType: ContentType;
  contentId: string;
  arabicText: string;
  translationText: string;
  attribution: string;
  audioUrl?: string;
}

interface ToastOptions {
  message: string;
  duration?: number;     // ms; default 2500
  type?: 'success' | 'error' | 'info';
}

// ── AI Explanation Cache ─────────────────────────────────────────
interface AICacheEntry {
  explanation: string;
  sources: string[];
  cachedAt: number;      // Unix timestamp
  expiresAt: number;     // cachedAt + 86400000 (24h)
}

// ── Language / i18n ─────────────────────────────────────────────
type SupportedLocale = 'en' | 'ar' | 'bn' | 'hi' | 'ur' | 'es' | 'fr' | 'tr' | 'ms' | 'id';
type TextDirection = 'ltr' | 'rtl';
const RTL_LOCALES: SupportedLocale[] = ['ar', 'ur'];

// ── Theme ────────────────────────────────────────────────────────
type Theme = 'light' | 'dark';

// ── Search ───────────────────────────────────────────────────────
interface SearchResult {
  type: ContentType | 'article';
  id: string;
  title: string;
  excerpt: string;
  url: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}

// ── Verify Preview (static — no API on home page) ────────────────
interface VerifyPreviewData {
  claim: string;
  grade: HadithGrade;
  confidence: number;    // 0–100
  isnadChain: string[];  // Narrator names
  evidence: Array<{
    ar: string;
    en: string;
    ref: string;
  }>;
}
```

---

## 14. Testing

### 14.1 Unit Tests

| Module | Test Cases |
|---|---|
| `hijri.js` | Correct Hijri date for known Gregorian dates; failure returns null without throwing |
| `prayer-times.js` | API response normalised correctly; partial response renders `---` for missing slots; static fallback loads on timeout; Friday includes Jumu'ah |
| `daily-content.js` | Valid response stored in `localStorage`; stale cache served on failure; corrupt cache triggers re-fetch |
| `content-actions.js` | Copy writes to clipboard + shows toast; duplicate bookmark toggle removes entry; `QuotaExceededError` triggers storage-full toast; AI cache hit skips API call |
| `theme.js` | Correct `data-theme` set from `localStorage`; default `'light'` when no key present |
| `language.js` | RTL direction set for `'ar'` and `'ur'`; LTR for all others; invalid locale falls back to `'en'` |

### 14.2 Integration Tests

- Prayer strip renders with correct next/past states relative to mocked current time
- Daily Trio cards render Arabic RTL, translation, reference, and action bar icons
- Feature Grid 8 cards each render with correct CTA routes — Card #6 `/islamic-studies?mode=ai`, Card #7 `/islamic-studies`
- Search popup: opens on icon click, auto-focuses input, closes on Escape, closes on outside click
- Mobile menu focus trap: Tab does not leave menu while open; Escape returns focus to hamburger

### 14.3 E2E Tests (Playwright)

| Scenario | Assertions |
|---|---|
| Page load — light mode | Bismillah teal gradient visible; hero H1 renders; `data-theme="light"` on `<html>` |
| Page load — dark mode (localStorage pre-set) | `data-theme="dark"` applied before paint; Bismillah gold gradient; no theme flash |
| Theme toggle | Click `#themeBtn` → `data-theme` flips; `localStorage['islamicinfo-theme']` updates |
| Hero CTAs | "Start Learning" → navigates to `/islamic-studies`; "Explore Qur'an" → `/quran` |
| Feature Grid Card #4 | Renders with `.card-featured`; "Track Habits" CTA → `/habits` |
| Feature Grid Card #6 | "Ask AI" CTA → `/islamic-studies?mode=ai` |
| Feature Grid Card #7 | "Start Learning" CTA → `/islamic-studies` (no query param) |
| Copy action | Click copy icon on Trio card → clipboard contains Arabic + attribution; toast "Copied!" appears |
| Bookmark toggle | Click bookmark → icon fills; click again → unfills; `localStorage['islamicinfo-bookmarks']` reflects state |
| Prayer times — location denied | Static London times rendered; "Enable location" link visible |
| Responsive — 760px | Nav hidden; hamburger visible; mobile menu opens on click |
| Mobile menu focus trap | Tab stays within menu items; Escape closes and returns focus to hamburger |
| Reduced motion | With `prefers-reduced-motion: reduce`, `.geo` elements have `animation: none` |
| Verify Preview | Static claim, grade badge, confidence dial, 2 evidence cards visible; "Verify a Claim" routes to `/verify` |
| Footer Ecosystem column | QuranlyAI, MosqueFinder, TravellyAI, LearnSpeakAI in exact order |

### 14.4 Accessibility Audit (axe-core, automated)

- Run on every CI deploy
- Zero violations at WCAG 2.1 AA level
- Specific checks: contrast ratios in light and dark mode; all icon buttons have `aria-label`; `role="search"` on search popup; `aria-expanded` on `#searchTrigger`; `aria-live` region for toast messages

### 14.5 Performance Budget (Lighthouse CI)

```json
{
  "performance": 90,
  "accessibility": 95,
  "best-practices": 90,
  "seo": 90,
  "budgets": [
    { "resourceType": "script", "budget": 51200 },
    { "resourceType": "total", "budget": 500000 }
  ]
}
```

---

*End of IslamicInfo Home Page Technical Specification*
*Ref: `home_fixed.html` · `CLAUDE_v3.md v3.0` · PRD v1.1 · Functional Spec v1.0*
