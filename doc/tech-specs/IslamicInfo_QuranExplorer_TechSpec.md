# IslamicInfo — Qur'an Explorer Technical Specification
**Page:** `quran.html` · **Route:** `/quran`
**Blueprint:** `quran_v5.html` · **Design System:** `CLAUDE_v3.md v3.0` · **PRD:** v1.1 · **Status:** Implementation-Ready

---

## 1. Purpose

The Qur'an Explorer is the primary scholarly tool on IslamicInfo.org. It delivers a full-featured reading experience in two layouts — **Study Mode** (verse-card) and **Mushaf Mode** (traditional page view) — with live audio recitation, three Tafsir sources, multilingual translations, word-by-word grammar analysis, Tajweed colour-coding, AI-powered explanations (QuranlyAI), and a Verse Trace research environment.

Six functions:
1. **Full Qur'an access** — All 114 Surahs, 6,236 verses; live via `api.quran.com`
2. **Listening** — Per-ayah audio, 50+ reciters, EveryAyah CDN, word-sync highlighting
3. **Scholarly study** — 3-source Tafsir (Ibn Kathir / al-Tabari / al-Qurtubi), WBW grammar, Tajweed, Verse Trace
4. **Personalisation** — Bookmarks, notes, reading progress, font preferences, streaks
5. **AI study companion** — Verse explanation via Anthropic API, QuranlyAI attribution; no fatwa
6. **Conversion** — Routes to `/islamic-studies`, `/hadith`, `/dua`, and `quranlyai.com`

**KPIs:** Average session > 10 min, audio play rate > 45%, Tafsir open rate > 20%, WBW usage > 30%, AI explanation open rate > 15%, Lighthouse ≥ 90.

---

## 2. UI Components

### 2.1 Page Zones

| # | Zone | ID / Class | Description |
|---|---|---|---|
| 1 | Navbar | `#siteHeader` | Sticky; `"Quran Explorer"` carries `.nav-link.active` |
| 2 | Hero | `section.hero` | Bismillah → eyebrow badge → H1 → subtitle → 2 CTAs |
| 3 | Reader Shell | `#readerShell` | Flex-row: Sidebar \| Reader Main \| Tafsir Panel |
| 3a | Sidebar | `#sidebar` | 114 surah rows, streak strip, search, filter chips, progress bar |
| 3b | Reader Main | `#readerMain` | Topbar rows 1+2 + Tajweed legend + Verses Area |
| 3c | Tafsir Panel | `#tafsirPanel` | 278px collapsible; 3-source tabs; lazy-loaded commentary |
| 3d | Audio Player | `.audio-player` | Dark-teal bar pinned to bottom of reader shell |
| 4 | Today's Reflection | `.trio-section` | 3 cards: Verse · Hadith · Dua of the Day |
| 5 | Features | `.feat-section` | WBW · Tajweed · AI Explain · Compare · Offline · Mobile App |
| 6 | CTA Band | `.cta-band` | "Begin Your Qur'an Journey" — dark teal gradient |
| 7 | Footer | `#ii-footer` | Global 5-column (CLAUDE_v3.md §7) |
| — | Settings Panel | `#settingsPanel` | Fixed right, 288px; font controls + toggles |
| — | Bookmarks Panel | `.bookmarks-panel` | Fixed left, 300px; category browser |
| — | Share Modal | `#shareModal` / `.share-modal` | Full-screen; canvas preview + download |
| — | Verse Trace View | `.trace-overlay` | Fixed full-screen; 3-column research layout |

### 2.2 Hero
- Layers: `.hero-bg` (3-ellipse radial, bgD 18s) → 4 `.geo` SVG decorators → `.hero-inner`
- Content: Bismillah (first child) → eyebrow badge "Sacred Scripture · 114 Surahs · 6,236 Ayahs" → H1 "Read, Listen & Understand / the Holy Qur'an" (`<span class="gradient-italic">Holy Qur'an</span>`) → subtitle → `btn-primary` "Continue Reading" → `btn-ghost` "Start with Al-Fatihah"

### 2.3 Reader Shell — Three-Pane Layout

| Pane | Width | Collapses When |
|---|---|---|
| Sidebar | 260px, flex-shrink-0 | Reading Mode (auto-collapse), Esc to restore |
| Reader Main | flex:1, overflow-y:auto | — expands when sidebar collapses |
| Tafsir Panel | 278px, flex-shrink-0 | `class="closed"` = `width:0`; transition `.38s ease-reverent` |

### 2.4 Sidebar Anatomy (top → bottom)
1. **Search input** — glass pill (`backdrop-filter blur(14px)`, `border-radius 999px`); real-time filter
2. **Filter chips** — `[Makki]` `[Madani]` (`.chip` class); combinable with search
3. **Streak strip** (`.sb-streak`) — "✦ N-day streak" + 7 day-cells (28×28px) + "Habit Tracker →" gold link
4. **Surah rows** (`.surah-row`) — numbered chip · English name · Makki/Madani chip · ayah count · Arabic name (RTL). Active row: left border `var(--teal-700)`. Read dot: 4px teal right edge
5. **Reading progress bar** — "Reading Progress — N%" label + fill bar, `transition: width 0.6s var(--ease-reverent)`
6. **Offline badge** — 6px teal dot + "Available offline" (service worker only)

### 2.5 Reader Topbar

**ROW 1 (`.rtb-row1`):** Breadcrumb (`.surah-bc`) | Reading Mode toggle (`#readModeBtn`) | Study↔Mushaf toggle (mutually exclusive)

**ROW 2 (`.rtb-row2`) — locked order, append-only:**

| Position | Element | Stage |
|---|---|---|
| 1 | Reciter dropdown (50+ reciters) | Stage 1 |
| 2 | Separator | Stage 1 |
| 3 | Translation dropdown (7+ editions) | Stage 1 |
| 4 | Separator | Stage 1 |
| 5 | WBW toggle (`.ctrl-btn`) | Stage 1 |
| 6 | Tajweed toggle (`.ctrl-btn`) | Stage 3 — append after WBW |
| 7 | Compare toggle (`#compareBtn`, `.compare-active` when on) | Stage 3 — append after Tajweed |
| 8 | Tafsir toggle | Stage 1 |
| 9 | Reading Mode toggle | Stage 2 |
| 10 | Separator | — |
| 11 | Settings (`#settingsBtn`) | Stage 2 |
| 12 | Bookmarks (`.bookmarks-panel` trigger) | Stage 2 — append last |

**Tajweed Legend Row** — strip below row 2, visible only when Tajweed active. "● Ghunna ● Ikhfa ● Idgham ● Qalqalah ● Madd ● Laam sh." Dismissable (✕). Preference in `localStorage`.

### 2.6 Ayah Card Anatomy (Study Mode)

Each `.ayah-card` (`.active-verse` on focused card):

| Slot | Element | Detail |
|---|---|---|
| Header | `.ayah-num-badge` | 32px circle, teal gradient; gold 3px dot if note saved |
| Header | `.ayah-actions` (6 buttons, locked order) | Play · Bookmark · Copy · Share · Notes · Explain |
| Body | `.ayah-arabic` | Amiri, `var(--ayah-ar-size, 32px)`, RTL. Tajweed: `<span class="tj-*">` per rule |
| Body | `.wbw-row` (RTL) | Per `.wbw-word`: `.wbw-ar` + `.wbw-en` + `.wbw-pos` (Stage 3). `.hl` class on word during audio sync |
| Body | `.ayah-translation` | `var(--ayah-tr-size, 16px)`, Cormorant Garamond italic. Compare mode: 3 stacked blocks |
| Body | `.ayah-trans-attr` | 11px, ink-subtle — "Sahih International · Surah:Ayah" |
| Inline | `.ai-card` (id `ai{N}`) | Slides up; gold border; `.ai-text` + "✦ Powered by QuranlyAI" footer |
| Inline | `.note-editor` (id `n{N}`) | Gold-50 bg; textarea; Cancel + Save Note |
| Footer | `.ayah-footer` | `.ayah-ref` + `.tafsir-btn` "Ibn Kathir Tafsir" + `.trace-btn` "Trace View →" (gold pill) |

### 2.7 Audio Player Bar
Dark-teal gradient bar pinned to bottom of reader shell. Hidden in Reading Mode.
- **Left:** waveform SVG animation + Surah:Ayah reference
- **Centre:** Prev ⏮ · Rewind 10s · Play/Pause · Forward 10s · Next ⏭ · Speed badge (1.0→1.25→1.5→2.0, cycles)
- **Scrub bar:** `<input type="range">` bound to `audio.currentTime`; `mm:ss / mm:ss`
- **Right:** Reciter name + dropdown icon

### 2.8 Tafsir Panel
278px, border-left 0.5px. Tab strip: **Ibn Kathir** (default, EN, ID 169) · **al-Tabari** (AR, ID 91) · **al-Qurtubi** (AR, ID 90). Body: ayah reference → Arabic verse block → commentary paragraphs → attribution (font-mono 11px). Empty state: "No commentary available from {source}" — never blank, never fabricated.

### 2.9 Settings Panel
Fixed 288px right (`#settingsPanel`). `translateX(100%) → translateX(0)` on `.open`.
- Arabic font: S(24px) / **M(32px)** / L(40px) / XL(50px) — pill track, active: teal-700 bg white text
- Translation font: S(14px) / **M(16px)** / L(18px)
- Toggles: ☑ Word-by-word · ☑ Show grammar tags · ☑ Auto-advance audio · ☑ Show transliteration
- Reset to defaults button

### 2.10 Bookmarks Panel
Fixed 300px left. Filter chips: All · General · Memorization · Reflection · Favourite Duas · Important · [+ custom]. Bookmark cards: Surah ref + category + Arabic snippet + translation + timestamp + Jump (→) button.

### 2.11 Verse Trace View
Fixed full-screen `.trace-overlay` (z-index 300). 3-column grid (`1fr : 1.4fr : 1fr` at ≥ 1300px; stacks ≤ 900px).
- **Left:** Tafsir (3-source tabs, same sources as panel)
- **Centre:** Arabic large (Amiri 26px, RTL) → translation (CG italic, 2.5px teal left bar) → grade badge → attribution (font-mono)
- **Right:** Topic chips → Related verses (2–3 with jump links) → Grammar summary (`.trace-wbw-grid`, RTL flexwrap)
- Top bar: breadcrumb + bookmark/share/copy actions + "Exit Trace View →" teal button

### 2.12 Share Modal
Fixed full-screen `.share-modal` (z-index 400). Format tabs: Square 1080×1080 / Story 1080×1920. Canvas preview + Download PNG + Share... + ✕ Close.

---

## 3. Frontend Logic

### 3.1 Surah Loading
- On sidebar row click: fire `loadSurah(id)` → fetch verses → clear `.versesCardList` → render cards → update breadcrumb → reset audio
- No full page reload — SPA-style DOM replacement
- Surah 9 (At-Tawbah): skip `.bismillah-banner`; all others render it above verse 1
- "Next: {SurahName} ({N} ayahs)" soft-load button after final verse

### 3.2 Verse Rendering
- Template: for each verse object, clone `.ayah-card` template, populate `data-key="{surah}:{ayah}"`, inject Arabic text, WBW row, translation, attribution, actions
- WBW default: `.wbw-row` visible on initial render. WBW toggle button shows/hides all `.wbw-row` elements
- Audio play icon in `.ayah-actions`: click sets active surah/ayah on `<audio>`, plays, applies `.active-verse` ring to card

### 3.3 Audio Player
- Single global `<audio>` element
- URL pattern: `https://everyayah.com/data/{reciter_path}/{surah_padded}{ayah_padded}.mp3`
- `audio.ended` → if auto-advance on → load next ayah URL → play → scroll next card into view
- Preload: set `audio.src` for next ayah when `audio.currentTime / audio.duration ≥ 0.8`; never preload more than 1 ahead
- Speed cycling: click badge → `[1.0, 1.25, 1.5, 2.0]` array, index wraps; set `audio.playbackRate`
- WBW sync: `audio.timeupdate` → compare current time against word-level timestamps → add/remove `.hl` class on matching `.wbw-word`
- `AbortController` on audio fetch; cleanup on surah nav and `beforeunload`

### 3.4 Translation Dropdown
- On select: re-fetch current surah with new `translations={id}` param → re-render translation slots only (not full card rebuild)
- Persist: `localStorage.setItem('ii-quran-translation', editionId)`
- On load: read `localStorage` → pre-select dropdown → include in first verse fetch

### 3.5 Tafsir Panel
- Lazy: fetch only on first open per `{tafsirId}:{verseKey}` pair
- `api.quran.com/api/v4/tafsirs/{id}/by_ayah/{verse_key}`; cache 7 days
- Tab click: load that source's entry, render; empty state text if no entry

### 3.6 Reading Mode
- `#readModeBtn` click → toggle `class="reading-mode"` on `<html>`
- CSS hides: `.hero`, `.trio-section`, `.feat-section`, `.cta-band`, `footer`, `.audio-player`, `.site-header`
- Sidebar auto-collapses; Tafsir panel auto-closes; reader shell → `height: 100vh`
- `reader-main` bg → `var(--gold-50)` in light mode
- `.rtb-row2` → `opacity: 0.25`; hover on topbar → `opacity: 1` (`transition: 0.25s`)
- Floating "Exit Reading Mode" button: fixed top-right, `z-index: 500`, teal bg
- Escape key exits; URL `?mode=reading`; `localStorage.setItem('ii-quran-reading-mode', '1')`

### 3.7 Reading Progress Tracking
- `IntersectionObserver` (threshold 0.5, throttled 1s) on all `.ayah-card` elements
- A verse is "read" when visible ≥ 3 continuous seconds (`setTimeout` + `IntersectionObserver` combo)
- On read: add `verseKey` to `Set`; persist `Array.from(readSet)` to `localStorage['ii-quran-read-ayahs']`
- Top-most visible card tracked for `ii-quran-last-read` (verseKey, surahId, ayahNo, surahName, timestamp)
- Progress bar: `(readAyahs.size / 6236) * 100`%

### 3.8 Bookmarks
- Bookmark icon click → toggle `class="bookmarked"` + fill icon gold → slide-in category tooltip (2.5s auto-dismiss)
- Tooltip category selection updates `category` field in bookmark object
- Storage: `Array<Bookmark>` in `localStorage['ii-quran-bookmarks']`
- Bookmarks panel: filter chip click filters rendered cards; Jump button → `loadSurah(surahId)` + scroll to `data-key` + pulse-ring

### 3.9 Notes (Inline Editor)
- Notes icon → toggle `class="show"` on `.note-editor` below the card
- Save: upsert `{verseKey, text, updatedAt}` in `localStorage['ii-quran-notes']`; max 2000 chars enforced on `input`
- Visual: note icon → gold fill; `.ayah-num-badge` → gold 3px dot (top-right, `var(--gold-500)`)
- Cancel: collapse editor; no save

### 3.10 Deep-link Pulse-Ring (Stage 2)
- Parse `/quran/{N}/{M}` or `?surah=N&ayah=M` on load
- `loadSurah(N)` → wait for cards to render → `scrollTo(card[data-key="N:M"])` → add `.pulse-ring` class
- Pulse keyframe: `0% box-shadow 0 0 0 0 rgba(0,105,110,.5) → 50% 0 0 0 16px rgba(0,105,110,0) → 100% 0`, 1.8s, 2 iterations
- After animation: remove class; set `border-color: rgba(0,105,110,.35)`
- `prefers-reduced-motion`: skip animation, apply border-color only

### 3.11 Tajweed Toggle (Stage 3)
- On toggle: for each `.ayah-card`, replace plain Arabic text node with `<span class="tj-*">` wrapped version from Tajweed data
- Applied ≤ 0.5s of click; lazy-fetch Tajweed data per surah on first toggle
- 6 rule classes (see §7 Validation for colour values)
- Tajweed legend strip shown; localStorage `'ii-quran-tajweed-legend'` === `'dismissed'` → skip legend

### 3.12 Compare Mode (Stage 3)
- Toggle: add `class="compare-active"` on `#compareBtn`; render 3 stacked translation blocks per `.ayah-card`
- Single API call: `?translations=131,85,95` (Sahih Intl + Pickthall + Yusuf Ali)
- Left bar indicator: active selection → 3px teal-700; others → 3px teal-200
- Persist: `localStorage.setItem('ii-quran-compare-mode', '1')`

### 3.13 AI Explanation (Stage 4)
- Explain icon (6th in `.ayah-actions`) → show `.ai-card` with skeleton shimmer → `fetch('/api/explain', {body: {type:'verse', id: verseKey, language}})` via Web Worker
- `AbortController` timeout: 10s
- Post-process response: detect/strip fatwa keywords and fabricated source patterns before rendering
- Render plain paragraphs in `.ai-text`; footer: "✦ Powered by QuranlyAI" → `quranlyai.com`
- System prompt: hardcoded server-side, non-overridable

### 3.14 Settings Panel
- Font size chip click → `document.documentElement.style.setProperty('--ayah-ar-size', size)` + persist `localStorage`
- Toggles: each checkbox change fires the relevant DOM show/hide (`.wbw-row`, `.wbw-pos`, auto-advance flag, transliteration rows)
- "Reset to defaults": `removeItem` all `ii-quran-*` localStorage keys; reset CSS properties; re-render defaults

### 3.15 Focus Traps (Stage 2)
All four overlays (Trace View, Share Modal, Settings Panel, Bookmarks Panel) implement focus trapping when open:
- On open: capture `firstFocusable`, `lastFocusable` within container
- Intercept `Tab`/`Shift+Tab` keydown; wrap focus at boundaries
- On close: return focus to triggering element
- `Escape` key: close frontmost overlay, do not propagate

### 3.16 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .geo, .hero-bg, .badge-dot, .brand-mark .star,
  .brand-mark .halo, .audio-player .waveform { animation: none !important; }
  .pulse-ring { animation: none !important; border-color: rgba(0,105,110,.35); }
  .reading-mode .reader-shell,
  #tafsirPanel, .settings-panel,
  .bookmarks-panel { transition: none !important; }
}
```

---

## 4. Backend Logic

### 4.1 AI Explanation Proxy (`POST /api/explain`)
- Receives: `{ type: 'verse', id: verseKey, content: string, language: string }`
- Validates `id` matches `^\d{1,3}:\d{1,3}$`; rejects unknown `type`
- Appends hardcoded system prompt (not exposed to client):
  > "You are a Qur'anic study assistant. Provide a plain-language 2–3 sentence contextual explanation of this verse. Cite classical Tafsir where relevant. Never issue a fatwa or religious ruling. Never fabricate sources. If you cannot explain this verse safely, say so."
- Calls `api.anthropic.com/v1/messages` (`claude-sonnet-4-20250514`, `max_tokens: 1000`)
- Post-process: regex-strip known fatwa/ruling patterns before returning
- Rate-limit: 20 requests/IP/hour; 429 with `Retry-After` header
- Response cached by backend: key `verse:{verseKey}:{lang}`, TTL 24h

### 4.2 Daily Content API (`GET /api/daily/{YYYY-MM-DD}.json`)
- Used by `.trio-section` — shared with Home page
- Verse-of-Day sourced from `api.quran.com/api/v4/verses/random?language=en&translations=131`
- Deployed as immutable CDN files; `Cache-Control: max-age=86400, immutable`

### 4.3 Qur'an Search (`GET /api/quran/search`)
- Params: `q`, `lang`, `scope` (arabic|translation|topic), `limit` (default 20)
- For Stage 2 MVP: proxies to `api.quran.com/api/v4/search?q={q}&size=20&language={lang}`
- Response normalised to `Array<SearchResult>` with matching text ranges for `<mark>` injection

### 4.4 Tafsir Cache (Server-side, optional)
- Redis cache keyed `tafsir:{id}:{verseKey}`, TTL 7 days
- Reduces load on `api.quran.com` for high-traffic verses (Al-Fatiha, Ayat al-Kursi)

### 4.5 Content Safety Layer
All AI responses pass through a server-side filter before returning to client. Blocked patterns: "is permissible", "is forbidden", "is haram", "is halal" as rulings, fabricated hadith citations. On match: return `{ safe: false, fallback: "Unable to generate explanation for this verse" }`.

---

## 5. APIs

| API | Endpoint | Method | Auth | Cache TTL | Notes |
|---|---|---|---|---|---|
| Chapters list | `api.quran.com/api/v4/chapters?language=en` | GET | None | Permanent | Sidebar data; seed JSON fallback |
| Verses by chapter | `api.quran.com/api/v4/verses/by_chapter/{id}?language=en&translations={id}&fields=text_uthmani,verse_key&words=true&word_fields=text_uthmani,translation` | GET | None | 24h / surah / lang | Also fetches WBW base |
| WBW + grammar | `...&word_fields=text_uthmani,transliteration,translation,part_of_speech` | GET | None | 7d / surah | Stage 3; grammar fields only |
| Tafsir | `api.quran.com/api/v4/tafsirs/{id}/by_ayah/{verse_key}` | GET | None | 7d / (tafsir + verse) | Lazy — never on page load |
| Reciter list | `api.quran.com/api/v4/resources/recitations` | GET | None | 7d | Fallback: `/data/reciters.json` |
| Random verse | `api.quran.com/api/v4/verses/random?language=en&translations=131` | GET | None | 24h | Trio section |
| Audio CDN | `everyayah.com/data/{path}/{SSSAAA}.mp3` | GET | None | CDN-native | Stream; no offline unless explicit |
| Tajweed annotations | `tajweed.quran.com` or self-hosted | GET | None | 7d / surah | Lazy on first Tajweed toggle |
| Compare translations | `...?translations=131,85,95` | GET | None | 24h / surah | Single call for 3 editions |
| Quran search | `/api/quran/search?q=&scope=&lang=&limit=` | GET | None | None | Proxies to `api.quran.com/api/v4/search` |
| AI Explanation | `/api/explain` | POST | Session | 24h (server) | Proxies to Anthropic; rate-limited |
| Daily content | `/api/daily/{YYYY-MM-DD}.json` | GET | None | 24h | CDN-served; shared with Home |

### 5.1 Audio URL Construction
```javascript
const surahPad  = String(surahId).padStart(3, '0');   // "001"
const ayahPad   = String(ayahNo).padStart(3, '0');    // "001"
const audioUrl  = `https://everyayah.com/data/${reciterPath}/${surahPad}${ayahPad}.mp3`;
```

### 5.2 Error Contracts
- All `fetch()` calls: `AbortController` timeout (verse/chapters: 8s; Tafsir: 10s; AI: 10s)
- Verse fetch failure: empty state component + retry button; never blank screen
- Audio 404/error: per-ayah inline "Audio unavailable for this ayah"; player controls stay visible
- Tafsir failure: render "No commentary available from {source}"; never fabricate

---

## 6. Database

Read-only data consumed from APIs + `localStorage`. Server-side stores only for AI proxy cache and optional auth sync.

### 6.1 Server-Side Cache (Redis)

**`tafsir:{tafsirId}:{verseKey}`**
```
value     JSON string (Tafsir API response)
TTL       604800s (7 days)
```

**`ai_explain:{verseKey}:{lang}`**
```
value     JSON { explanation: string, sources: string[] }
TTL       86400s (24h)
```

### 6.2 `localStorage` Keys (full reference)

| Key | Type | Purpose | Stage |
|---|---|---|---|
| `ii-quran-translation` | `string` (edition ID) | Active translation edition | Stage 1 |
| `ii-quran-ar-size` | `'S'│'M'│'L'│'XL'` | Arabic font size | Stage 2 |
| `ii-quran-tr-size` | `'S'│'M'│'L'` | Translation font size | Stage 2 |
| `ii-quran-reading-mode` | `'1'│absent` | Restores Reading Mode on reload | Stage 2 |
| `ii-quran-last-read` | JSON `LastRead` | Continue Reading position | Stage 2 |
| `ii-quran-read-ayahs` | JSON `string[]` | All read verse keys for progress | Stage 2 |
| `ii-quran-bookmarks` | JSON `Bookmark[]` | Bookmark collection | Stage 2 |
| `ii-quran-notes` | JSON `Note[]` | Verse annotations | Stage 2 |
| `ii-quran-tajweed-legend` | `'dismissed'│absent` | Tajweed legend dismissed state | Stage 3 |
| `ii-quran-compare-mode` | `'1'│absent` | Compare mode state | Stage 3 |
| `ii-quran-streak` | JSON `ReadingStreak` | Streak data | Stage 4 |
| `islamicinfo-theme` | `'light'│'dark'` | Global site theme (shared) | Stage 1 |
| `islamicinfo-lang` | ISO 639-1 | Global UI language (shared) | Stage 1 |

### 6.3 Server-Side User Data (Phase 2+ — account-gated)
```
bookmarks    { userId, verseKey, surahName, surahId, ayahNo, category, addedAt }
notes        { userId, verseKey, body, updatedAt }
streak       { userId, lastReadDate, currentStreak, longestStreak, readDays[] }
```

---

## 7. Validation

### 7.1 API Response Schemas

**Chapter object (required fields):**
`id`, `name_simple`, `name_arabic`, `revelation_place` (`'makkah'|'madinah'`), `verses_count`

**Verse object (required fields):**
`id`, `verse_key` (pattern `^\d{1,3}:\d{1,3}$`), `text_uthmani`, `translations[0].text`

**WBW word (required fields per Stage 1):**
`text_uthmani`, `translation.text`

On schema failure: log `console.warn` with raw payload; render fallback or skip the malformed item.

### 7.2 Tajweed Colours (exact values — never deviate)

| Rule | Class | Light mode | Dark mode |
|---|---|---|---|
| Ghunna | `.tj-ghunna` | `#2E7D32` (4.76:1 ✅) | `#66BB6A` (7.96:1 ✅) |
| Ikhfa | `.tj-ikhfa` | `#8B6000` (recommended; original `#B07D00` = 3.37:1 ⚠️) | `#FFD54F` (13.33:1 ✅) |
| Idgham | `.tj-idgham` | `#1565C0` (5.33:1 ✅) | `#64B5F6` (8.50:1 ✅) |
| Qalqalah | `.tj-qalqalah` | `#880E4F` (8.77:1 ✅) | `#F48FB1` (8.43:1 ✅) |
| Madd | `.tj-madd` | `var(--teal-700)` `#00696E` (3.65:1 — AA-large only ⚠️) | `#5BC1C7` (8.87:1 ✅) |
| Laam sh. | `.tj-laam-sh` | `#4A148C` (11.01:1 ✅) | `#CE93D8` (7.87:1 ✅) |

Note: `tj-ikhfa` and `tj-madd` light-mode values require product sign-off before Stage 3 ship (PRD FIX-2).

### 7.3 Input Validation

| Input | Rule |
|---|---|
| AI explain request `id` | Must match `^\d{1,3}:\d{1,3}$`; reject otherwise |
| Note text | Max 2000 chars enforced client (`maxlength`) + server |
| Bookmark categories | Max 15 custom; validate non-empty string, max 40 chars |
| Search query | Trim whitespace; min 2 chars before firing; debounce 300ms |
| Verse deep-link `{N}/{M}` | `N` 1–114; `M` 1–286; 404 if invalid surah/ayah combo |
| Translation edition ID | Must be in allowed edition list; reject unknown IDs |

### 7.4 `localStorage` Integrity
- Wrap all `JSON.parse` in `try/catch`; on failure: `removeItem(key)` + use default
- Wrap all `localStorage.setItem` in `try/catch`; catch `QuotaExceededError` → toast + block new save
- Read-ayahs array deduplication: use `Set` before persisting to prevent unbounded growth

---

## 8. Error Handling

| Scenario | User-Facing Fallback | Technical Handling |
|---|---|---|
| Chapters fetch fails | Renders from `/data/chapters.json` seed; no user error | `catch` → seed JSON; log to monitoring |
| Verse fetch fails | "Verses temporarily unavailable — try again" + retry button in verses area | `catch` → empty state component; retry re-triggers `loadSurah()` |
| Tafsir fetch fails / no entry | "No commentary available from {source}" — never blank, never fabricated | `catch` per source → render fallback string |
| Audio CDN 404 / error | "Audio unavailable for this ayah" inline below verse; player controls stay | `audio.onerror` → per-ayah error msg; no crash |
| Reciter list fetch fails | Falls back to `/data/reciters.json` (minimum 5 reciters) | `catch` → bundled JSON |
| AI Explanation timeout (10s) | "Explanation unavailable — please try again" in `.ai-text`; retry button; ✕ always present | `AbortController(10000)` + `catch`; modal stays open; no auto-close |
| AI response contains fatwa/ruling | "Unable to generate explanation for this verse" | Server-side filter strips/rejects before responding |
| Tajweed data unavailable | Plain Arabic text (no colour-coding); Tajweed button tooltip "unavailable" | `catch` → plain text fallback; `console.warn` |
| Canvas font load timeout (3s) | Falls back to system serif; image still generates | `Promise.race([document.fonts.ready, timeout(3000)])`; proceed with fallback stack |
| Service worker unsupported | Full functionality without offline; no indicator, no error | `'serviceWorker' in navigator` guard before registration |
| `localStorage` quota exceeded | Toast: "Storage full — clear some bookmarks or notes"; new save blocked gracefully | `QuotaExceededError` catch on `setItem`; existing data preserved |
| Deep-link invalid surah/ayah | Load Surah 1 (Al-Fatihah); no error shown | Bounds check `N` 1–114, `M` 1–`surah.verses_count`; fall back to Surah 1 on invalid |
| Compare API multi-edition failure | Render available editions only; skip failed ones | Per-edition `catch`; partial render acceptable |

---

## 9. RBAC

The Qur'an Explorer is **fully public** — no authentication gate at any stage.

| Role | Access | Notes |
|---|---|---|
| Guest | Full read, audio, WBW, Tafsir, AI Explain, Copy, Bookmark/Notes (localStorage) | Default state |
| Authenticated User | All guest features + cloud sync for Bookmarks/Notes/Streak | Phase 2+; JWT from auth service |
| Admin | All user features + admin panel access from header icon | Placeholder in MVP |

**localStorage-only scope (Stages 1–4):** Bookmarks, notes, reading progress, and streaks are unscoped, client-side only. On user login (Phase 2+), merge `localStorage` data into account via `POST /api/sync`.

**AI Explain rate-limit:** 20 requests/IP/hour regardless of auth state. Authenticated users get higher limit (Phase 2+).

---

## 10. Edge Cases

| Case | Handling |
|---|---|
| Surah 9 (At-Tawbah) | Skip `.bismillah-banner`; all other 113 Surahs render it |
| Surah 1 (Al-Fatihah) verse 1 | `text_uthmani` includes Bismillah as part of the verse text — do not double-render |
| Audio auto-advance at last ayah of last Surah (114:6) | Stop playback; no wrap-around; show "End of Surah" toast |
| Midnight crossing during active session | Streak `lastReadDate` evaluated on next verse read, not on session start |
| User edits same note twice before saving | Textarea retains last typed value; Save always overwrites `updatedAt` |
| Compare mode + Reading Mode both active | Compare mode remains active (translation blocks visible); Reading Mode hides chrome only |
| Mushaf Mode + WBW active | WBW rendered within Mushaf page lines; audio sync highlights individual words |
| Translation dropdown change during Tafsir panel open | Re-fetch verses with new translation; Tafsir panel stays open on current verse |
| Deep-link to verse within currently loaded Surah | Skip re-fetch; just scroll + pulse-ring |
| Very long Surah (Al-Baqarah, 286 verses) | Render all cards; `IntersectionObserver` handles scroll tracking; no virtual scroll in MVP |
| `prefers-reduced-motion` active | All continuous animations disabled; pulse-ring = border-color only; panel transitions instant |
| RTL language (Arabic/Urdu UI) selected | Arabic Qur'anic text always RTL regardless; UI chrome flips globally; WBW row already RTL |
| Share modal on mobile (no `navigator.share`) | "Share..." button falls back to clipboard copy; toast confirms |
| Tajweed toggle applied to very long surah | Process in `requestIdleCallback` chunks to avoid blocking main thread |
| localStorage read-ayahs array exceeds 6,236 entries | `Set` deduplication on write; `splice` to cap at 6,236 on load |
| Focus trap + Escape on nested overlays | Trace View (z-300) can open Share Modal (z-400); Escape closes Share Modal first, then Trace View on next press |

---

## 11. Performance

**Targets:** FCP < 1.5s, LCP < 2.5s (Al-Fatihah loaded, 7 verses visible), CLS < 0.1, Lighthouse ≥ 90.

| Technique | Implementation |
|---|---|
| Theme no-flash | Inline `<script>` in `<head>` sets `data-theme` before CSS loads |
| Skeleton shimmer | Card height reserved before data arrives (prevents CLS); shimmer on `.ayah-card`, `.surah-row` during fetch |
| Sidebar chapters: permanent cache | `Cache-Control: max-age=604800` on CDN; immutable seed JSON fallback |
| Verse data cache | `localStorage` keyed `ii-verses-{surahId}-{translationId}`, TTL 24h; stale-while-revalidate |
| Tafsir: lazy-load | Fetched only on panel open; never on page load |
| WBW grammar data: lazy per-surah | Fetched on first toggle; cached 7 days |
| Audio preload | Only current ayah URL; next URL preloaded at ≥ 80% completion |
| AI: Web Worker | `fetch('/api/explain', ...)` runs in worker; main thread never blocked |
| Tajweed: `requestIdleCallback` | Span injection chunked per 20 verses to prevent jank on long Surahs |
| Canvas font preload | `await Promise.race([document.fonts.ready, timeout(3000)])` before any canvas draw |
| `will-change` scoped | Applied only to `.ayah-card`, `.feat-card` during hover; removed on `mouseleave` |
| Service worker (Stage 2) | Cache-first: static shell, current + last-3 surahs verse data; background revalidate |
| Reduced-motion guard | All `@keyframes` animations guarded; transitions set to `0s` |

---

## 12. File Structure

```
project-root/
├── quran.html                          # Quran Explorer (blueprint: quran_v5.html)
├── src/
│   ├── css/
│   │   ├── tokens.css                  # :root + [data-theme="dark"] (CLAUDE_v3.md §1)
│   │   ├── base.css                    # Shared reset, body, .shell, .container
│   │   ├── header.css                  # Navbar, search popup, mobile menu
│   │   ├── hero.css                    # .hero, .hero-bg, .geo, Bismillah
│   │   ├── reader-shell.css            # #readerShell, 3-pane flex layout
│   │   ├── sidebar.css                 # #sidebar, .surah-row, .sb-streak, progress bar
│   │   ├── reader-topbar.css           # .rtb-row1, .rtb-row2, dropdowns, .ctrl-btn
│   │   ├── ayah-card.css               # .ayah-card, .ayah-actions, .wbw-row, .ai-card, .note-editor
│   │   ├── audio-player.css            # .audio-player, waveform, scrub bar
│   │   ├── tafsir-panel.css            # #tafsirPanel, tabs, commentary
│   │   ├── settings-panel.css          # #settingsPanel, font size pills, toggles
│   │   ├── bookmarks-panel.css         # .bookmarks-panel, bookmark cards
│   │   ├── trace-overlay.css           # .trace-overlay, 3-column grid, top bar
│   │   ├── share-modal.css             # .share-modal, canvas preview
│   │   ├── mushaf-view.css             # #mushafPageView, .mushaf-page-header, .mushaf-page-footer
│   │   ├── tajweed.css                 # .tj-* colour rules, dark-mode overrides, legend strip
│   │   ├── reading-mode.css            # html.reading-mode overrides
│   │   ├── trio-section.css            # .trio-section, .trio-card
│   │   ├── feat-section.css            # .feat-section cards
│   │   ├── cta-band.css                # .cta-band
│   │   ├── footer.css                  # #ii-footer (shared)
│   │   ├── buttons.css                 # .btn-primary/ghost (shared)
│   │   ├── cards.css                   # Base .card hover (shared)
│   │   ├── chips.css                   # .chip variants (shared)
│   │   ├── reveal.css                  # .reveal, .reveal-d1/d2/d3 (shared)
│   │   ├── toast.css                   # .toast component (shared)
│   │   └── responsive.css              # Breakpoints: 1280/1100/820/700/420px
│   ├── js/
│   │   ├── theme.js                    # Inline <head> theme no-flash
│   │   ├── header.js                   # Search popup, mobile menu, scroll state
│   │   ├── surah-loader.js             # loadSurah(), verse card renderer, Bismillah logic
│   │   ├── wbw.js                      # WBW row render, toggle, audio sync (.hl)
│   │   ├── audio-player.js             # <audio> wiring, controls, preload, auto-advance, cleanup
│   │   ├── tafsir.js                   # Panel open/close, lazy-fetch, 3-source tabs, cache
│   │   ├── translation.js              # Dropdown, fetch + re-render, localStorage persist
│   │   ├── reading-mode.js             # Toggle, sidebar collapse, URL update, Escape key
│   │   ├── reading-progress.js         # IntersectionObserver, read-ayahs, progress bar, last-read
│   │   ├── bookmarks.js                # Toggle, category tooltip, panel, jump-to-verse
│   │   ├── notes.js                    # Inline editor, save/cancel, gold dot signal
│   │   ├── deep-link.js                # URL parsing, pulse-ring animation
│   │   ├── settings.js                 # Font size pills, toggles, reset, CSS property update
│   │   ├── focus-trap.js               # Shared focus-trap utility (4 overlays)
│   │   ├── share-image.js              # Canvas draw, font preload, download, navigator.share
│   │   ├── copy.js                     # Copy with attribution payload, toast
│   │   ├── search.js                   # /quran/search route handler, <mark> injection
│   │   ├── tajweed.js                  # Stage 3: toggle, span injection, legend, requestIdleCallback
│   │   ├── compare.js                  # Stage 3: toggle, 3-edition fetch, stacked blocks
│   │   ├── ai-explain.js               # Stage 4: .ai-card show/hide, Web Worker fetch, skeleton, error
│   │   ├── ai-explain.worker.js        # Web Worker: fetch /api/explain, abort controller
│   │   ├── trace-view.js               # Stage 4: .trace-overlay open/close, 3-column render
│   │   ├── streak.js                   # Stage 4: .sb-streak render, daily threshold, localStorage
│   │   ├── mushaf.js                   # Stage 4: #mushafPageView render, page nav
│   │   ├── service-worker-reg.js       # SW registration guard
│   │   ├── trio-section.js             # Today's Reflection: live verse/hadith/dua fetch
│   │   ├── reveal.js                   # IntersectionObserver scroll reveal (shared)
│   │   └── analytics.js                # GA4 custom events (9 KPI metrics)
│   ├── workers/
│   │   └── quran-sw.js                 # Service worker: cache strategies
│   └── locales/                        # i18n (shared with Home)
├── public/
│   └── data/
│       ├── chapters.json               # Seed: 114 chapter metadata
│       ├── reciters.json               # Seed: slug→CDN path map (min 5)
│       └── duas.json                   # Day-of-year indexed dua data
├── manifest.json                       # PWA manifest (192px + 512px icons)
└── tests/
    ├── unit/
    │   ├── surah-loader.test.ts
    │   ├── audio-player.test.ts
    │   ├── reading-progress.test.ts
    │   ├── bookmarks.test.ts
    │   ├── notes.test.ts
    │   ├── streak.test.ts
    │   ├── ai-explain.test.ts
    │   └── tajweed-colours.test.ts
    └── e2e/
        ├── quran-reader.spec.ts
        ├── audio.spec.ts
        ├── tafsir.spec.ts
        ├── reading-mode.spec.ts
        ├── trace-view.spec.ts
        ├── focus-trap.spec.ts
        └── accessibility.spec.ts
```

---

## 13. TypeScript Interfaces

```typescript
// ── Surah / Chapter ─────────────────────────────────────────────
interface Chapter {
  id: number;                        // 1–114
  name_simple: string;               // "Al-Fatihah"
  name_arabic: string;               // "الفاتحة"
  revelation_place: 'makkah' | 'madinah';
  verses_count: number;
  juz_number?: number;
}

// ── Verse / Ayah ─────────────────────────────────────────────────
interface Verse {
  id: number;
  verse_key: string;                 // "1:1"
  text_uthmani: string;              // Arabic text
  translations: Translation[];
  words?: Word[];                    // WBW data (when words=true)
}

interface Translation {
  id: number;
  text: string;
  resource_name: string;             // "Sahih International"
}

// ── Word-by-Word ─────────────────────────────────────────────────
interface Word {
  id: number;
  text_uthmani: string;              // Arabic word
  translation: { text: string };    // English gloss
  transliteration?: { text: string };
  char_type_name: 'word' | 'end' | 'sajdah';
  pos?: PartOfSpeech;               // Stage 3 only
  audio?: WordAudioTimestamp;       // For WBW audio sync
}

type PartOfSpeech = 'noun' | 'verb' | 'particle' | 'pronoun' | 'preposition';

interface WordAudioTimestamp {
  timestampFrom: number;            // ms
  timestampTo: number;              // ms
}

// ── Tafsir ───────────────────────────────────────────────────────
interface TafsirEntry {
  id: number;
  tafsir_id: number;
  verse_key: string;
  text: string;
  resource_name: string;
}

type TafsirSourceId = 169 | 91 | 90;  // Ibn Kathir | al-Tabari | al-Qurtubi

// ── Audio ────────────────────────────────────────────────────────
interface Reciter {
  id: number;
  name: string;
  reciter_name: string;
  style?: string;
  slug: string;
  cdnPath: string;                   // e.g. "Abdul_Basit_Murattal_192kbps"
}

interface AudioState {
  surahId: number;
  ayahNo: number;
  reciterId: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: 1.0 | 1.25 | 1.5 | 2.0;
  autoAdvance: boolean;
}

// ── Reading State ─────────────────────────────────────────────────
interface LastRead {
  verseKey: string;
  surahId: number;
  ayahNo: number;
  surahName: string;
  timestamp: number;
}

// ── Bookmarks ─────────────────────────────────────────────────────
type BookmarkCategory =
  'General' | 'Memorization' | 'Reflection' | 'Favourite Duas' | 'Important' | string;

interface Bookmark {
  verseKey: string;
  surahName: string;
  surahId: number;
  ayahNo: number;
  category: BookmarkCategory;
  addedAt: number;
}

// ── Notes ─────────────────────────────────────────────────────────
interface Note {
  verseKey: string;
  text: string;                      // max 2000 chars
  updatedAt: number;
}

// ── Reading Streak ────────────────────────────────────────────────
interface ReadingStreak {
  lastReadDate: string;              // "YYYY-MM-DD"
  currentStreak: number;
  longestStreak: number;
  readDays: string[];                // Array of "YYYY-MM-DD"
}

// ── Settings / Preferences ────────────────────────────────────────
type ArabicFontSize = 'S' | 'M' | 'L' | 'XL';  // 24/32/40/50 px
type TranslationFontSize = 'S' | 'M' | 'L';      // 14/16/18 px

interface ReaderPreferences {
  arabicFontSize: ArabicFontSize;
  translationFontSize: TranslationFontSize;
  wbwVisible: boolean;
  showGrammarTags: boolean;
  autoAdvanceAudio: boolean;
  showTransliteration: boolean;
  translationEditionId: number;
  readingMode: boolean;
  compareMode: boolean;
}

// ── Tajweed ───────────────────────────────────────────────────────
type TajweedRule = 'ghunna' | 'ikhfa' | 'idgham' | 'qalqalah' | 'madd' | 'laam_sh';

interface TajweedSpan {
  start: number;                     // char index in text_uthmani
  end: number;
  rule: TajweedRule;
}

// ── AI Explanation ────────────────────────────────────────────────
interface AIExplainRequest {
  type: 'verse';
  id: string;                        // verseKey "N:M"
  content: string;                   // Arabic + translation text
  language: string;                  // ISO 639-1
}

interface AIExplainResponse {
  safe: boolean;
  explanation?: string;
  sources?: string[];
  fallback?: string;                 // populated when safe: false
}

// ── Search ────────────────────────────────────────────────────────
type SearchScope = 'arabic' | 'translation' | 'topic';

interface QuranSearchResult {
  verse_key: string;
  surah_name: string;
  text_uthmani: string;
  translation: string;
  matchRanges: Array<{ start: number; end: number }>;
}

// ── Share Image ───────────────────────────────────────────────────
type ShareFormat = 'square' | 'story';  // 1080×1080 | 1080×1920

interface ShareImageConfig {
  verseKey: string;
  arabicText: string;
  translationText: string;
  surahName: string;
  translationEdition: string;
  format: ShareFormat;
}
```

---

## 14. Testing

### 14.1 Unit Tests

| Module | Key Test Cases |
|---|---|
| `surah-loader.js` | Surah 9 skips Bismillah; all others render it; chapter 1 no double-Bismillah; fallback seed renders on API failure |
| `audio-player.js` | URL construction (`padStart(3,'0')`); speed cycle wraps 2.0→1.0; auto-advance triggers on `ended`; preload fires at 80%; `AbortController` cancels on nav |
| `reading-progress.js` | Verse counted read after 3s; not counted at 2s; `longestStreak` persists after current streak breaks; midnight boundary correct |
| `bookmarks.js` | Toggle adds/removes correctly; max 15 custom categories enforced; jump navigates to correct verse |
| `notes.js` | Max 2000 chars enforced; note icon turns gold on save; cancel does not persist |
| `streak.js` | Same-day read does not increment streak twice; streak resets if `lastReadDate` > 1 day ago; `longestStreak` never decreases |
| `ai-explain.js` | Fatwa keywords stripped from response; 10s timeout triggers error state; retry re-fires fetch; system prompt not overridable |
| `tajweed-colours.test.ts` | All 6 `.tj-*` classes have correct hex values; dark-mode overrides all present |
| `reading-progress.js` | `Set` deduplication prevents > 6,236 entries |

### 14.2 Integration Tests

- Surah load: API response → 286 ayah cards rendered (Al-Baqarah); breadcrumb updates; audio resets
- Translation change: only translation slots re-render; Arabic text unchanged
- Tafsir panel: not fetched on page load; fetches on open; tab switch loads different source; "no commentary" fallback renders
- WBW toggle: all `.wbw-row` elements show/hide; audio sync `.hl` moves with `timeupdate`
- Compare mode: single API call with `?translations=131,85,95`; 3 stacked blocks per card
- Settings reset: all CSS properties restored; `localStorage` keys cleared; UI reflects defaults
- Focus trap: Tab stays within Settings Panel; Shift+Tab wraps; Escape returns focus to `#settingsBtn`
- Deep-link `/quran/2/255`: loads Surah 2, scrolls to Ayat al-Kursi, pulse-ring fires 2 iterations
- Streak: 3 verses read for 3s each → streak increments; partial (2 verses) → no increment

### 14.3 E2E Tests (Playwright)

| Scenario | Assertions |
|---|---|
| Default load | Al-Fatihah loaded; 7 cards rendered; Bismillah banner visible; `data-theme="light"` on `<html>` |
| Dark mode | `data-theme="dark"` pre-set in `localStorage`; no theme flash; Bismillah gold gradient |
| Sidebar Surah 9 | Click At-Tawbah → no `.bismillah-banner` rendered |
| Audio play/pause | Click Play on ayah 1 → `.active-verse` ring appears; pause → ring removed |
| Audio auto-advance | Mock `audio.ended` → next ayah URL loaded; scroll fires |
| Reading Mode | Click `#readModeBtn` → `.hero`, `footer`, `site-header` have `display:none !important`; "Exit Reading Mode" button visible; Escape exits |
| Tafsir panel lazy load | Network tab: no Tafsir request on page load; request fires on panel open |
| Bookmark and jump | Bookmark verse 2:255 → bookmark icon gold → open panel → click Jump → reader scrolls to 2:255 |
| Note save | Type 50 chars → Save → gold dot on `.ayah-num-badge`; reload → note still present |
| Share modal | Click Share on verse → modal opens; Square/Story chips switch canvas size; Download fires |
| Copy attribution | Click Copy on verse 1:1 → clipboard contains Arabic + translation + attribution + URL |
| Focus trap (Settings) | Open Settings → Tab 20× → focus never leaves panel; Escape → focus returns to `#settingsBtn` |
| Focus trap (Trace View) | Open Trace View → Tab cycles within; Escape closes; focus returns to `.trace-btn` |
| Verse deep-link | Navigate to `/quran/2/255` → Surah 2 loads → card 2:255 in view → pulse-ring fires |
| Mobile 420px | Sidebar hidden; hamburger shows; swipe/tap surah opens reader; reader full-width |
| Reduced motion | `prefers-reduced-motion: reduce` → no pulse-ring animation; border-color only |
| Offline (SW) | Simulate offline → cached surah renders; uncached surah shows error + retry |
| `localStorage` quota | Mock `QuotaExceededError` on `setItem` → toast "Storage full" appears; no crash |

### 14.4 Accessibility Audit (axe-core, CI)

- Zero violations at WCAG 2.1 AA on every route in §2.3
- Specific checks: `aria-label` on all `.ayah-btn` and `.ctrl-btn`; `role="search"` on search overlay; `aria-live` region for verse navigation; `aria-expanded` on Tafsir/Settings panel triggers; all inline SVGs have `aria-hidden` or `aria-label`
- VoiceOver + NVDA manual verification: focus trap in all 4 overlays; screen reader virtual cursor constrained

### 14.5 Lighthouse CI Budget

```json
{
  "performance": 90,
  "accessibility": 90,
  "best-practices": 90,
  "seo": 90,
  "budgets": [
    { "resourceType": "script", "budget": 102400 },
    { "resourceType": "total", "budget": 800000 }
  ]
}
```

Run against `/quran` with Al-Fatihah loaded and first 7 verses visible (representative reader state).

---

*End of IslamicInfo Qur'an Explorer Technical Specification*
*Ref: `quran_v5.html` · `CLAUDE_v3.md v3.0` · PRD v1.1 · Functional Document v2.0*
