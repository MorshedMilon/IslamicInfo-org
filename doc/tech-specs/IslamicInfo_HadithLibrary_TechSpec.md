# IslamicInfo — Hadith Library Technical Specification
**Page:** `hadith.html` · **Route:** `/hadith`
**Blueprint:** `hadith_module_enhanced__1_.html` · **Design System:** `CLAUDE_v3.md v3.0` · **PRD:** v1.1 · **Status:** Implementation-Ready

---

## 1. Purpose

The Hadith Library is the platform's primary scholarly reference tool. It delivers trustworthy access to 9 major hadith collections — 61,000+ hadiths — with authentic grading, isnad transparency, narrator reliability panels, and a full per-hadith action suite mirroring the Qur'an Explorer.

Six functions:
1. **Library navigation** — 3-tier drill-down: Collection → Book → Hadith (61K+ narrations across 9 collections)
2. **Authenticity transparency** — Grade badges (Sahih/Hasan/Da'if/Mawdu') with named graders on every hadith; no hadith displayed without a grade
3. **Isnad research** — Visual chain of narrators with reliability grades sourced from classical works (Taqrib at-Tahdhib, Tahdhib al-Kamal)
4. **Scholar tooling** — Trace View (3-column: Matn · Isnad · Grading), comparison mode, topic index, related-hadith graph
5. **Reader tools** — Bookmarks, notes, copy-with-attribution, share image, audio, AI explanation (QuranlyAI), reading paths with progress rings
6. **Verify integration** — "Verify a Source" and "Ask a Question" CTAs feed directly into the Verify engine; "Ask a Question" pre-fills the active hadith on Tier 3 routes

**KPIs:** HotD engagement > 35%, Isnad panel open rate > 25%, 3-tier navigation depth > 40% reach Tier 3, AI explanation rate > 12%, Lighthouse ≥ 90.

---

## 2. UI Components

### 2.1 Page Zones

| # | Zone | HTML marker | Description |
|---|---|---|---|
| 1 | Navbar | Global header | Sticky; "Hadith Library" carries `.nav-link.active` |
| 2 | Hero | `<!-- HERO -->` | Bismillah → H1 → subtitle → search pill (voice + scope selector) |
| 3 | Layout Shell | `.layout` (flex-row) | Two panes: `aside.sidebar` (240px) + `main.main` (flex:1) |
| 3a | Sidebar | `aside.sidebar` | Collections (9 rows) · Classical Scholars · Reading Paths · Browse · Verify CTA · Ask CTA |
| 3b | Main Content | `main.main` | Stats strip → HotD → Collections grid → Topics strip → Hadith feed → Stage 2+ sections |
| 4 | Stats Strip | `.stats-strip` | 61K+ Hadiths · 9 Collections · 12+ Languages · 100% Source-Verified |
| 5 | Hadith of the Day | `.daily-strip` | Arabic matn + translation + reference + grade · Bookmark · Share · View Full Isnad |
| 6 | Collections Grid | `.collections-grid` | 9 collection cards; filter tabs: All · Kutub al-Sittah · Musnad · Selected |
| 7 | Topics Strip | `.topics-grid` | 14 topic chips; in-place filter (Stage 1) → routes (Stage 3) |
| 8 | Hadith Feed | `.hadith-list` | Ordered hadith cards; grade filter pills above |
| — | Books Grid (Tier 2) | `.books-grid` | 3-col book cards; on `/hadith/[collection]` route |
| — | Deep-View (Tier 3b) | — | Single-hadith focus page; all blocks per §2.7 |
| — | Trace View | `.trace-layout` | Full-screen 3-column: Matn · Isnad · Scholarly Grading |
| — | Comparison Mode | `.compare-header` + columns | 2–3 equal columns; `/hadith/compare` route |
| — | Bookmarks Panel | `.bookmarks-panel` | Fixed right, slide-in; chip filter row + bookmark cards |
| — | Share Modal | `.share-modal` | Full-screen; canvas preview + download |
| 9 | CTA Band | `.cta-band` | "✦ Strengthen Your Knowledge" — dark teal gradient |
| 10 | Footer | `#ii-footer` | Global 5-column per CLAUDE_v3.md §7; col 1: "Hadith Library" |

### 2.2 Hero
- Same shell as all pages: `.hero-bg` (3-ellipse radial, bgD 18s) → 4 `.geo` SVG decorators → `.hero-inner`
- Content: Bismillah (first child) → eyebrow badge "✦ 9 Collections · 61,000+ Hadiths · Fully Source-Verified" → H1 "Explore Authentic Hadith / with `<span class="gradient-italic">Scholarly Precision</span>`" → subtitle → search pill
- **Search pill:** glass-pill input (`backdrop-filter blur`, `border-radius 999px`), microphone icon, scope selector chips (All · Hadith · Qur'an · Dua · Verify ✦), submit button
- Hero "Continue Reading" affordance: visible only when `localStorage['islamicinfo-hadith-last-read']` exists; renders inline link "Continue where you left off → [Collection], Hadith [N]"

### 2.3 Layout Shell — Two-Pane

| Pane | Width | Mobile behaviour |
|---|---|---|
| `aside.sidebar` | 240px, flex-shrink-0 | Collapses to bottom sheet at ≤ 760px |
| `main.main` | flex:1, overflow-y:auto | Full-width when sidebar collapsed |

### 2.4 Sidebar Anatomy (top → bottom)
1. **Section labels** (`.sidebar-section-label`, caps-xs, ink-subtle): HADITH COLLECTIONS · CLASSICAL SCHOLARS · READING PATHS · BROWSE
2. **Collection rows** (`.sidebar-item`): name + count badge (`.count-badge`, teal-700/teal-50). Active: left border `var(--teal-700)`, `class="active"`
3. **Classical Scholars** (4 static rows): Ibn Kathir · al-Qurtubi · Ibn Hajar al-'Asqalani · Imam an-Nawawi
4. **Reading Path rows** (`.reading-path-row`): SVG progress ring (teal-700 stroke, grey track) + path name + "N of M read" + "Continue →" button
5. **Browse section** with sidebar search input (real-time filter)
6. **Verify CTA** (`.sidebar-cta`): gold "✦" icon + "Verify a Source" heading + `.btn-glass` → `/verify`
7. **Ask CTA** (second `.sidebar-cta`): gold "?" icon + "Ask a Question" heading; pre-fills active hadith on Tier 3 routes

### 2.5 Hadith Card Anatomy (every card in the feed)

| Slot | Element | Detail |
|---|---|---|
| Left accent | `.hadith-teal-bar` | 4px left border, full card height, `var(--teal-700)` |
| Header left | `.hadith-num` badge + `.grade-badge` | Hadith number; grade dot + grade text + `.grader-label` "· Darussalam" |
| Header right | `.hadith-actions` (3 buttons) | Bookmark 🔖 · Share ↗ · Copy 📋 |
| Body | `.hadith-arabic` | Amiri font, RTL, `line-height: 2.05` |
| Body | `.hadith-translation` | `.hadith-narrator` line + `┃` teal bar marker + translation text |
| Footer left | `.hadith-ref` | "📖 Collection · Book · Hadith N" |
| Footer right | `.hadith-footer-actions` | "View Isnad" · "Listen" · "Open Full View" (primary) |
| Inline | `.isnad-preview` (id `isnad-N`) | Toggles open; narrator chain with dots (Stage 1) → reliability panel (Stage 2) |
| Inline | `.ai-card` | Slides up on open; gold border; `.ai-text` + "✦ Powered by QuranlyAI" footer |
| Inline | `.note-editor` | Gold-50 bg; textarea; Save + Cancel |

### 2.6 Grade Badge System

| Grade | Class | Dot token | Light mode | Dark mode (REQUIRED override) |
|---|---|---|---|---|
| Sahih | `.grade-sahih` | `--grade-sahih` | `#0F6E56` (4.98:1 ✅) | `#1FA882` (5.2:1 ✅) |
| Hasan | `.grade-hasan` | `--grade-hasan` | `#4A7030` recommended (was `#5D8A3A` 3.37:1 ⚠️) | `#7AB84E` (5.1:1 ✅) |
| Da'if | `.grade-daif` | `--grade-daif` | `#8A5228` recommended (was `#A86932` 3.64:1 ⚠️) | `#D4884A` (4.9:1 ✅) |
| Mawdu' | `.grade-mawdu` | `--grade-mawdu` | `#B33A3A` (4.69:1 ✅) | `#E05555` (5.3:1 ✅) |

Dark-mode overrides for grade-sahih and grade-mawdu are **mandatory before Stage 1 ships** (PRD FIX-1 — both FAIL WCAG AA in dark mode without override).

### 2.7 Deep-View Page (Tier 3b) Block Order
Page header → Hadith body card (enlarged Arabic, 24px+) → Isnad chain (inline, not modal) → Alternate gradings table (min 2 scholars) → Translations tabs (EN · UR · FR · ID · TR) → Topics chips → Related narrations (Stage 3) → Previous / Next hadith navigation (within same book).

### 2.8 Trace View Layout (Stage 4)
Full-screen `.trace-layout` (z-index 300). 3-column grid `1fr : 1.2fr : 1fr` at ≥ 1300px; stacks at ≤ 900px. Each column scrolls independently.
- **Left (Matn):** Arabic matn (Amiri 18px+, RTL, teal-tinted bg) → `┃` teal-bar translation (CG italic 17px) → topic chips → related Qur'anic verses
- **Centre (Isnad):** Vertical narrator chain; dashed connector lines; each narrator tappable → reliability panel slides from `inline-start`; chain divergence markers ◆ gold-500
- **Right (Scholarly Grading):** Grade block (grade-sahih green bg) → Ibn Hajar commentary card → Imam an-Nawawi commentary card → 2 related narration links
- **Top bar:** Breadcrumb | 🔖 Share 📋 Copy buttons | "Exit Trace View →" teal button

---

## 3. Frontend Logic

### 3.1 Collections Load
- On page load: fetch all 9 collections → render `.collections-grid` cards with live hadith counts
- Filter tabs (All · Kutub al-Sittah · Musnad · Selected): in-place DOM show/hide, no route change
- Active sidebar item: add `class="active"` + left teal border to clicked `.sidebar-item`
- Sahih al-Bukhari card: always renders with `class="collection-card featured"` + `--gold-aura` shadow + "✦ Most Authentic" seal

### 3.2 Hadith Feed
- Default: load Sahih al-Bukhari, Book 1 (Revelation) on first visit (no `localStorage` last-read)
- On collection/book select: `loadHadithFeed(collectionSlug, bookNum)` → fetch → clear `.hadith-list` → render cards
- Grade filter pills: in-place DOM filter; `aria-live` region announces result count
- "Load more hadiths" button: pagination via `?page=N` param; appends to `.hadith-list`
- Topic chips: Stage 1 — in-place filter by `data-topic` on hadith cards; Stage 3 — route to `/hadith/topics/[topic]`

### 3.3 Isnad Toggle
- "View Isnad" click: toggle `class="open"` on `.isnad-preview` below card
- CSS `max-height` transition (0 → content height), `0.38s ease-reverent` — no layout reflow
- Stage 1: render narrator nodes with dots only (avatar + name + lifespan + reliability dot)
- Stage 2: narrator row click → fetch `/data/narrator/{id}.json` → render `.narrator-panel` inline below row; click away or second click closes

### 3.4 Continue Reading / Last-Read (FIX-5)
- `IntersectionObserver` (threshold 0.5, throttled 1s) on `.hadith-card` elements
- Hadith counted "read" after ≥ 3 continuous seconds visible (`setTimeout` + IO combo)
- On read: persist `{collectionSlug, bookNum, hadithNum, timestamp}` → `localStorage['islamicinfo-hadith-last-read']`
- On page load (no explicit URL): pre-select last-read collection in sidebar; scroll feed to last-read card
- Hero "Continue Reading" prompt: shown only when `last-read` key exists AND user did not arrive via a shared deep-link URL
- Navigate via prompt: `loadHadithFeed()` + scroll to card + fire 2-iteration gold pulse-ring animation

### 3.5 Deep-Link Pulse-Ring
- Parse `/hadith/[collection]/[book]/[hadith]` or `?collection=X&book=Y&hadith=Z`
- After card render: scroll to `.hadith-card[data-ref="collection:book:hadith"]` → add `.pulse-gold` class
- Pulse keyframe: `0% box-shadow 0 0 0 0 rgba(197,160,89,.5) → 50% 0 0 0 16px rgba(197,160,89,0) → 100% 0`, 1.8s, `ease-reverent`, 2 iterations
- `prefers-reduced-motion`: skip animation; apply `border-color: rgba(197,160,89,.5)` only

### 3.6 Bookmarks
- Bookmark icon click → toggle `class="bookmarked"` + fill gold + category tooltip (2.5s auto-dismiss)
- Category tooltip lists: General · For Memorisation · Reflection · To Verify · + New; selection updates `category` field
- Storage: `Array<HadithBookmark>` in `localStorage['islamicinfo-hadith-bookmarks']`
- Gold dot on `.hadith-num` badge on bookmarked cards
- Bookmarks panel: slide from right; chip filter row; bookmark cards with Jump (→) button → `loadHadithFeed()` + scroll + pulse-ring

### 3.7 Notes (Inline Editor)
- Note icon → toggle `.show` on `.note-editor` below card
- Save: upsert `{hadithRef, text, updatedAt}` in `localStorage['islamicinfo-hadith-notes']`; max 2000 chars
- Visual: note icon fills gold; `.hadith-num` badge gets 3px gold dot
- Cancel: collapse editor; no save

### 3.8 Audio Mini Player
- "Listen" click → inject `.audio-mini-player` below card
- Controls: play/pause + progress bar (`<input type="range">`) + speed selector (0.75×/1×/1.25×/1.5×) + reciter name (always visible)
- Waveform animation during playback
- Auto-advance option in settings: on `audio.ended`, load next hadith in feed
- Single global `<audio>` element; cleanup on surah/book nav and `beforeunload`

### 3.9 Verify / Ask CTA Wiring
- "Verify a Source" → navigate to `/verify`
- "Ask a Question" on Tier 3 routes: encode active hadith `{matn, collection, book, hadithNum}` as query param → `/verify?claim=[encoded]`; opens verify engine with input pre-filled
- "Ask a Question" on Tier 1 → `/verify` with empty input focused

### 3.10 AI Explanation (Stage 3)
- ✦ AI button (appended last in `.hadith-actions`) → show `.ai-card` with skeleton shimmer → fetch via Web Worker → `POST /api/explain` `{type:'hadith', id: hadithRef, content: arabicMatn + translation, language}`
- `AbortController` 10s timeout
- Post-process: strip fatwa/ruling patterns server-side before responding
- Render: plain paragraphs in `.ai-text` (summary + vocabulary + context + practical lesson)
- Footer: "✦ Powered by QuranlyAI" → `quranlyai.com`; ✕ close always present

### 3.11 Copy with Attribution
- Copy button: produce exact payload:
  ```
  "{translation text}" — Narrated by {narrator}.
  {Collection} · Book {N} · Hadith {N}. Grade: {grade} ({grader}, {year}).
  Source: https://islamicinfo.org/hadith/{collection}/{book}/{hadith}
  ```
- Arabic-only option: copy `.hadith-arabic` text only
- Toast: "Copied with citation ✦" — 2.5s, slides from bottom, existing toast component
- Attribution stripping is not permitted (Functional Doc §20 rule 4)

### 3.12 Reading Paths (Stage 4)
- 4 built-in paths from `/data/reading-paths.json`: 40 Nawawi (42) · Kutub al-Sittah basics (50) · Faith foundations (30) · Prophetic Character (25)
- Sidebar shows first 3 rows + "View all →" link; each row: SVG progress ring (% complete) + path name + "N of M read" + "Continue →"
- Reading-path strip on deep-view page (if hadith is in active path): "Reading: [Path] · Hadith N of M" + Prev/Next buttons
- Progress stored: `{slug, readHadiths: string[]}` in `localStorage['islamicinfo-hadith-paths']`
- Progress ring SVG: teal-700 stroke for filled arc, grey track; `stroke-dashoffset` calculated from % complete

### 3.13 Comparison Mode (Stage 4)
- "Add to comparison" in hadith card action menu → add to comparison Set (max 3)
- Comparison drawer at bottom: shows chips + "Compare →" button (active when ≥ 2)
- Route to `/hadith/compare`; render 2–3 equal columns
- `.diff-highlight`: `background: rgba(197,160,89,.12)`, `border-radius: 3px` on differing words
- `.chain-diverge`: ◆ glyph in `var(--gold-500)` at divergence points + explanatory note
- Mobile ≤ 900px: tab switcher instead of columns

### 3.14 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .geo, .hero-bg, .badge-dot, .stats-strip .fade-up { animation: none !important; }
  .pulse-gold { animation: none !important;
                border-color: rgba(197,160,89,.5); }
  .isnad-preview, .narrator-panel,
  .bookmarks-panel, .trace-layout { transition: none !important; }
}
```

---

## 4. Backend Logic

### 4.1 AI Explanation Proxy (`POST /api/explain`)
- Validates `type === 'hadith'`; validates `id` pattern `^[a-z-]+:\d+:\d+$` (collection:book:hadith)
- Hardcoded system prompt (server-side, non-overridable):
  > "You are a Hadith study assistant. Provide a plain-language explanation of this hadith's meaning, key vocabulary, scholarly context, and practical lesson for a Muslim reader. Never issue a fatwa or religious ruling. Never fabricate narrators, sources, or chains. Cite named classical scholars only when you can do so accurately."
- Calls `api.anthropic.com/v1/messages` (`claude-sonnet-4-20250514`, `max_tokens: 1000`)
- Post-process: regex-strip fatwa patterns ("is permissible", "is forbidden", "is halal/haram" as rulings) before returning
- Rate-limit: 20 requests/IP/hour; `429` with `Retry-After`
- Server-side cache: Redis key `hadith_explain:{hadithRef}:{lang}`, TTL 24h (no client-side AI cache on hadith page — server caches)

### 4.2 Hadith of the Day Rotation
- `/data/hotd.json` — static file, day-of-year keyed (1–366 entries). Fallback: Bukhari #1 (Intentions hadith)
- Alternatively: backend cron sets a daily key in Redis `hotd:{YYYY-MM-DD}` pointing to a `hadithRef`
- Client fetches `/api/daily/hadith` → 24h CDN cache → returns `{hadithRef, arabicMatn, translation, grade, grader, narratorName}`

### 4.3 Narrator Data Service
- Self-hosted `/data/narrator/{id}.json` files seeded from al-Mizzi's Tahdhib al-Kamal + Ibn Hajar's Taqrib at-Tahdhib
- Every entry includes `graderCitations[]` with named classical work + folio/number
- Zero fabricated gradings permitted; missing data renders "Reliability data unavailable for this narrator" rather than a placeholder

### 4.4 Hadith Search Proxy
- `GET /api/hadith/search?q=&lang=&collection=&grade=&limit=20` → proxies to Sunnah.com API or self-hosted Meilisearch index
- Returns: `{results: HadithSearchResult[], total: number, took: number}`
- Match text ranges returned for `<mark>` injection on Arabic and translation fields

### 4.5 Content Safety Layer
All AI responses pass through server-side filter before returning. Blocked patterns: fatwa language, fabricated narrator names (heuristic cross-check against narrator DB), permissibility rulings. On match: return `{safe: false, fallback: "Unable to generate explanation for this hadith."}`.

---

## 5. APIs

| API | Endpoint | Method | Cache TTL | Notes |
|---|---|---|---|---|
| Collections list | `sunnah.com/api/v1/collections` | GET | 7d | Fallback: `/data/collections.json` |
| Books by collection | `sunnah.com/api/v1/collections/{slug}/books` | GET | 7d | Tier 2 navigation |
| Hadiths by book | `sunnah.com/api/v1/collections/{slug}/books/{book}/hadiths` | GET | 24h / (slug+book) | Tier 3a list |
| Single hadith | `sunnah.com/api/v1/hadiths/{id}` | GET | 24h | Tier 3b deep-view |
| Related hadiths | `sunnah.com/api/v1/hadiths/{id}/similar` | GET | 7d | Stage 3 related section |
| Hadith search | `/api/hadith/search` | GET | 1h | Server proxy → Sunnah.com or Meilisearch |
| Narrator data | `/data/narrator/{id}.json` | GET | 7d | Self-hosted; lazy on narrator panel open |
| Hadith of the Day | `/api/daily/hadith` or `/data/hotd.json` | GET | 24h | day-of-year keyed |
| Reading paths | `/data/reading-paths.json` | GET | Bundled | Static seed; 4 built-in paths |
| AI Explanation | `/api/explain` | POST | 24h (server) | Proxies to Anthropic; rate-limited |
| Audio CDN | `[cdn-host]/audio/hadith/{collection}/{id}.mp3` | GET | CDN-native | Stream; reciter name always attributed |

### 5.1 Grade Filter URL Pattern
Grade filter is in-place (no route change); URL param `?grade=sahih|hasan|daif|all` for deep-linkability and back/forward support.

### 5.2 API Error Contracts
- All `fetch()` calls: `AbortController` timeout (collections/books: 8s; hadiths: 8s; narrator: 10s; AI: 10s)
- Collections failure → seed JSON; no user-visible error
- Book list failure (Tier 2) → empty state card + retry button; breadcrumb and "↩ All Collections" stay functional
- Deep-view failure (Tier 3) → per-block partial empty states; Previous/Next navigation remains functional
- Narrator failure → "Reliability data unavailable for this narrator" in panel; grade dot retained

---

## 6. Database

### 6.1 Server-Side Cache (Redis)

| Key | Value | TTL |
|---|---|---|
| `hadith_explain:{hadithRef}:{lang}` | JSON `{explanation, sources[]}` | 86400s (24h) |
| `hotd:{YYYY-MM-DD}` | `hadithRef` string | 86400s |
| `narrator:{id}` | JSON narrator object | 604800s (7d) |
| `hadith:{collection}:{book}:{num}` | JSON hadith object | 86400s (24h) |
| `books:{collectionSlug}` | JSON books array | 604800s (7d) |

### 6.2 `localStorage` Keys

| Key | Type | Purpose | Stage |
|---|---|---|---|
| `islamicinfo-hadith-bookmarks` | `HadithBookmark[]` | Saved bookmarks with categories | Stage 2 |
| `islamicinfo-hadith-notes` | `HadithNote[]` | Per-hadith annotations (max 2000 chars) | Stage 2 |
| `islamicinfo-hadith-last-read` | `LastReadHadith` | Continue reading restoration | Stage 2 |
| `islamicinfo-hadith-paths` | `ReadingPathProgress[]` | Reading path progress tracking | Stage 4 |
| `islamicinfo-hadith-translation` | `string` (edition slug) | Active translation edition | Stage 2 |
| `islamicinfo-hadith-reading-mode` | `'1'│absent` | Restores reading mode on reload | Stage 4 |
| `islamicinfo-theme` | `'light'│'dark'` | Global site theme (shared) | Stage 1 |
| `islamicinfo-lang` | ISO 639-1 | Global UI language (shared) | Stage 1 |

### 6.3 Server-Side User Data (Phase 2+ — account-gated)
```
bookmarks  { userId, collectionSlug, bookNum, hadithNum, arabicSnippet, englishSnippet, category, addedAt }
notes      { userId, hadithRef, body, updatedAt }
paths      { userId, slug, readHadiths: string[], updatedAt }
```

---

## 7. Validation

### 7.1 API Response Schema

**Hadith object (required fields):**
`id`, `hadithNumber`, `collection` (slug), `book` (number), `arabicText`, `translation.text`, `translation.edition`, `grade` (one of `sahih|hasan|daif|mawdu`), `grader` (named person/institution)

No hadith may be rendered without `grade` + `grader` populated. On missing grade: render hadith with grade badge showing "Grade Unknown" in grey — never silently omit the badge.

**Narrator object (required fields):**
`id`, `fullName`, `arabicName`, `lifespan`, `era`, `reliabilityGrade`, `graderCitations[]` (each with `scholar`, `gradeText`, `source`, `sourceRef`)

If `graderCitations` is empty: render panel with "No scholar citations available for this narrator" — never fabricate.

### 7.2 Grade Colour Enforcement
Grade badge CSS classes (`--grade-sahih`, `--grade-hasan`, `--grade-daif`, `--grade-mawdu`) must match exact token values from CLAUDE_v3.md §1. Dark-mode overrides for all 4 grades must be present in `[data-theme="dark"]` block before Stage 1 ships.

### 7.3 Input Validation

| Input | Rule |
|---|---|
| AI explain `id` | Must match `^[a-z-]+:\d+:\d+$`; reject unknown collections |
| Note text | Max 2000 chars; `maxlength` on `<textarea>` + server-side check |
| Bookmark category name | Non-empty string; max 40 chars; max 5 custom categories per user (localStorage) |
| Search query | Trim; min 2 chars before firing; debounce 300ms |
| Comparison set | Max 3 hadiths; UI "Add to comparison" disabled when Set size === 3 |
| Deep-link `[collection]/[book]/[hadith]` | Collection must be in allowed slug list; book and hadith must be positive integers; 404 redirect on invalid |

### 7.4 `localStorage` Integrity
- Wrap all `JSON.parse` in `try/catch`; on failure: `removeItem(key)` + use empty default
- Wrap all `localStorage.setItem` in `try/catch`; catch `QuotaExceededError` → toast "Storage full — clear some bookmarks or notes"; never silently lose existing data
- Reading path `readHadiths[]` array: deduplicate with `Set` before persisting

### 7.5 Content Safety Rules (Functional Doc §20)
1. Every hadith shows grade badge with named grader — enforced in render function; no render without grade
2. Isnad chains are real data from Sunnah.com API — never fabricated
3. Narrator reliability text always cites a named classical work — validated at data-authoring time; display "unavailable" if citation missing
4. Copy always includes full attribution — no "copy text only" option that strips scholarly reference (only Arabic-matn-only copy is the separate option)
5. Audio player always shows reciter name — enforced in player component; never renders `undefined`

---

## 8. Error Handling

| Scenario | User-Facing Fallback | Technical Handling |
|---|---|---|
| Collections grid fetch fails | Renders from `/data/collections.json` seed; no user error | `catch` → seed JSON; log to Sentry |
| Book list fetch fails (Tier 2) | "Books temporarily unavailable — try again" empty state; "↩ All Collections" link stays functional | `catch` → empty state card + retry; breadcrumb preserved |
| Deep-view fetch fails (Tier 3) | Per-block "---" fallbacks; "Hadith temporarily unavailable" in hadith body; Prev/Next navigation stays | `catch` per block; partial render; no full-page crash |
| Hadith feed fetch fails | "Hadiths temporarily unavailable — try again" empty state + retry in `.hadith-list` | `catch` → empty state component; retry re-triggers load |
| HotD fetch fails | Renders Bukhari #1 (Intentions hadith) from bundled `/data/hotd.json` static fallback | `catch` → bundled static |
| Narrator reliability fetch fails | "Reliability data unavailable for this narrator" in panel; grade dot retained | `catch` per narrator; partial render |
| AI Explanation timeout (10s) | "Explanation unavailable — please try again" in `.ai-card`; retry button; ✕ always works | `AbortController(10000)`; `catch` → error state; no auto-close |
| AI response contains fatwa/ruling | "Unable to generate explanation for this hadith." | Server-side filter strips/rejects before responding |
| Audio CDN 404 / error | "Audio unavailable for this hadith" inline below Listen button; player controls stay | `audio.onerror` → per-hadith error msg; no crash |
| Share canvas font timeout (3s) | Falls back to system serif; image still generates | `Promise.race([document.fonts.ready, timeout(3000)])`; proceed with fallback |
| `localStorage` quota exceeded | Toast: "Storage full — clear some bookmarks or notes"; new save blocked | `QuotaExceededError` catch; existing data preserved |
| Deep-link to invalid collection/book/hadith | Load collections grid (Tier 1); no error shown | Bounds check in route handler; redirect to `/hadith` on invalid |

---

## 9. RBAC

The Hadith Library is **fully public** — no authentication gate at any stage.

| Role | Access | Notes |
|---|---|---|
| Guest | Full read, isnad view, AI explain, audio, Bookmark/Notes (localStorage), Copy, Share | Default state |
| Authenticated User | All guest features + cloud sync for Bookmarks/Notes/Reading paths | Phase 2+; JWT from auth service |
| Admin | All user features + admin panel from header icon | Placeholder in MVP |

**Content safety rules are server-enforced** regardless of auth state — the AI proxy system prompt is never exposed or overridable by any user role.

**AI rate-limit:** 20 requests/IP/hour regardless of auth. Authenticated users get higher limit (Phase 2+).

---

## 10. Edge Cases

| Case | Handling |
|---|---|
| Musnad Ahmad (27,647 hadiths, no fixed book structure) | Handle missing `book` field gracefully; render in flat feed; breadcrumb shows "Musnad Ahmad › Hadith N" without book segment |
| Riyad as-Saliheen / 40 Nawawi (no `bookNum` in Tier 2) | Tier 2 skipped for these collections; "Browse →" goes directly to Tier 3a hadith list |
| Grade missing from API response | Render `.grade-badge` with "Grade Unknown" in grey rather than omitting badge entirely |
| Narrator in chain not in narrator DB | Render dot as grey (`.rel-unknown`) with tooltip "Unknown narrator"; never fabricate reliability grade |
| "Ask a Question" on collections grid (Tier 1, no active hadith) | Navigate to `/verify` with empty input focused; no pre-fill |
| Same hadith bookmarked twice | Idempotent: second click removes bookmark; Set deduplication in storage |
| Comparison mode with hadiths from same collection | `.diff-highlight` spans still computed; chain divergence markers may not appear (same chain) — gracefully show no ◆ markers with note "Same chain" |
| Reading path "Continue" when all hadiths read | Button changes to "Path complete ✓" (gold, no action); progress ring shows 100% |
| `localStorage` last-read + explicit URL deep-link on same page load | Explicit URL takes precedence; Continue Reading prompt suppressed |
| Dark mode grade badge contrast (sahih + mawdu) | **Must** use dark-mode overrides before Stage 1 ships per PRD FIX-1; failing WCAG AA without override |
| Focus trap + Escape on nested overlays (Trace View + Share Modal) | Escape closes Share Modal first, then Trace View on next press; focus returns correctly to trigger element each time |
| Mobile sidebar bottom sheet + Reading Mode both active | Reading Mode takes full-screen; sidebar bottom sheet handle hidden; Exit Reading Mode button always accessible |
| Very long isnad chain (7+ narrators, e.g. Musnad Ahmad) | Chain scrolls independently within `.isnad-preview`; max-height set per card; no collapse of narrator list |

---

## 11. Performance

**Targets:** FCP < 1.5s, LCP < 2.5s (Bukhari Book 1, first 10 hadiths visible), CLS < 0.1, Lighthouse ≥ 90.

| Technique | Implementation |
|---|---|
| Theme no-flash | Inline `<script>` in `<head>` reads `localStorage['islamicinfo-theme']`; sets `data-theme` before CSS loads |
| Skeleton shimmer | `.collections-grid` and `.hadith-list` cards: heights reserved before data; shimmer on `.hadith-card` skeletons (prevents CLS) |
| Collections: 7d CDN cache | `Cache-Control: max-age=604800` on static collections data; seed JSON always bundled |
| Hadith data cache | Redis 24h; client `localStorage` keyed `ii-hadiths-{slug}-{book}-{page}`, TTL 24h; stale-while-revalidate |
| Narrator data: lazy per-narrator | Fetch `/data/narrator/{id}.json` only on panel open; 7d browser cache |
| Isnad toggle: CSS only | `max-height` transition — no JS layout measurement; no reflow |
| AI: Web Worker | `fetch('/api/explain', ...)` off main thread; main thread never blocked during AI call |
| Share canvas: font preload | `await Promise.race([document.fonts.ready, timeout(3000)])` before any `canvas.drawText` |
| `will-change` scoped | Applied only to `.hadith-card`, `.collection-card` during hover; removed on `mouseleave` |
| "Load more hadiths" | Pagination (not infinite scroll); appends to existing DOM; no full re-render |
| Reduced-motion guard | All `@keyframes` animations guarded; transitions set to `0s` under `prefers-reduced-motion: reduce` |

---

## 12. File Structure

```
project-root/
├── hadith.html                          # Hadith Library (blueprint: hadith_module_enhanced__1_.html)
├── src/
│   ├── css/
│   │   ├── tokens.css                   # :root + [data-theme="dark"] (CLAUDE_v3.md §1)
│   │   ├── base.css                     # Reset, body, .shell, .container (shared)
│   │   ├── header.css                   # Navbar, search popup, mobile menu (shared)
│   │   ├── hero.css                     # .hero, .hero-bg, .geo, Bismillah, search pill
│   │   ├── layout-shell.css             # .layout flex, .sidebar, .main
│   │   ├── sidebar.css                  # .sidebar-item, .sidebar-section-label, .reading-path-row, .sidebar-cta
│   │   ├── collections-grid.css         # .collections-grid, .collection-card, filter tabs
│   │   ├── stats-strip.css              # .stats-strip, stat numbers, dividers
│   │   ├── daily-strip.css              # .daily-strip, gold-aura shadow, HotD layout
│   │   ├── hadith-card.css              # .hadith-card, .hadith-teal-bar, .hadith-header, .hadith-arabic, .hadith-translation, .hadith-footer
│   │   ├── grade-badges.css             # .grade-sahih/.grade-hasan/.grade-daif/.grade-mawdu + dark-mode overrides
│   │   ├── isnad-panel.css              # .isnad-preview, .isnad-link, .isnad-avatar, narrator dots
│   │   ├── narrator-panel.css           # .narrator-panel, reliability table, scholar citations
│   │   ├── topics-grid.css              # .topics-grid, topic chips
│   │   ├── books-grid.css               # Tier 2 .books-grid, book cards
│   │   ├── deep-view.css                # Tier 3b page header, all section blocks
│   │   ├── trace-layout.css             # .trace-layout, 3-column grid, top bar, column separators
│   │   ├── compare-mode.css             # .compare-header, .compare-item chips, .diff-highlight, .chain-diverge
│   │   ├── study-mode.css               # .study-mode-banner, 4-quadrant layout
│   │   ├── reading-mode.css             # html.reading-mode-hadith overrides, single-column, gold-50 bg
│   │   ├── reading-paths.css            # .reading-path-row, SVG progress ring, .reading-path-strip
│   │   ├── ai-card.css                  # .ai-card (shared pattern; Hadith-specific prompt structure)
│   │   ├── note-editor.css              # .note-editor (shared)
│   │   ├── bookmarks-panel.css          # .bookmarks-panel (Hadith-specific)
│   │   ├── share-modal.css              # .share-modal (shared)
│   │   ├── audio-player.css             # .audio-mini-player, waveform
│   │   ├── breadcrumb.css               # .breadcrumb, gold › separators
│   │   ├── related-grid.css             # .related-grid, relation type labels (Stage 3)
│   │   ├── cta-band.css                 # .cta-band (shared)
│   │   ├── footer.css                   # #ii-footer (shared)
│   │   ├── buttons.css                  # .btn-primary/ghost/glass (shared)
│   │   ├── cards.css                    # Base .card hover (shared)
│   │   ├── chips.css                    # .chip variants (shared)
│   │   ├── reveal.css                   # .reveal, .fade-up (shared)
│   │   ├── toast.css                    # .toast component (shared)
│   │   └── responsive.css               # Breakpoints: 1100/900/760/700/440px
│   ├── js/
│   │   ├── theme.js                     # Inline <head> theme no-flash (shared)
│   │   ├── header.js                    # Search popup, mobile menu, scroll state (shared)
│   │   ├── collections-loader.js        # loadCollections(), filter tabs, sidebar item activation
│   │   ├── hadith-feed.js               # loadHadithFeed(), card renderer, grade filter, pagination
│   │   ├── hadith-of-day.js             # HotD fetch, skeleton, fallback
│   │   ├── isnad.js                     # Isnad toggle (max-height CSS), narrator chain render
│   │   ├── narrator-panel.js            # Fetch /data/narrator/{id}.json, panel render, click handling
│   │   ├── reading-progress.js          # IntersectionObserver, 3s threshold, last-read persist
│   │   ├── bookmarks.js                 # Toggle, category tooltip, panel, localStorage, jump
│   │   ├── notes.js                     # Inline editor, save/cancel, gold dot signal
│   │   ├── audio-player.js              # Mini player, speed control, waveform, reciter attribution
│   │   ├── copy.js                      # Full attribution payload, Arabic-only option, toast
│   │   ├── ai-explain.js                # .ai-card, Web Worker fetch, skeleton, error, QuranlyAI attribution
│   │   ├── ai-explain.worker.js         # Web Worker: POST /api/explain, AbortController
│   │   ├── share-image.js               # Canvas generator, square/story, font preload, download/share
│   │   ├── deep-link.js                 # URL parsing, gold pulse-ring animation
│   │   ├── breadcrumb.js                # Dynamic breadcrumb for Tier 2/3 routes; mobile ellipsis
│   │   ├── tier2-books.js               # Tier 2 book list: fetch, books-grid render, error state
│   │   ├── tier3-deep-view.js           # Deep-view page: all blocks, translations tabs, prev/next
│   │   ├── narrator-panel-trace.js      # Trace View specific: narrator click → slide-in panel from inline-start
│   │   ├── trace-view.js                # Stage 4: .trace-layout open/close, 3-column render, focus trap
│   │   ├── compare-mode.js              # Stage 4: comparison Set, /hadith/compare route, diff-highlight
│   │   ├── study-mode.js                # Stage 4: 4-quadrant toggle, banner, Escape/exit
│   │   ├── reading-mode.js              # Stage 4: single-column toggle, URL ?mode=reading, Escape
│   │   ├── reading-paths.js             # Stage 4: path rows, SVG ring, strip on deep-view, progress tracking
│   │   ├── topics.js                    # Stage 1 in-place filter → Stage 3 route to /hadith/topics/[topic]
│   │   ├── search.js                    # Search pill wiring, results overlay, <mark> injection
│   │   ├── verify-cta.js                # Ask a Question pre-fill wiring on Tier 3 routes
│   │   ├── focus-trap.js                # Shared focus-trap utility (Trace View, Share Modal, Narrator panel)
│   │   ├── reveal.js                    # IntersectionObserver scroll reveal (shared)
│   │   └── analytics.js                 # GA4 custom events (10 KPI metrics)
│   └── locales/                         # i18n (shared with other pages)
├── public/
│   └── data/
│       ├── collections.json             # Seed: 9 collection metadata
│       ├── hotd.json                    # Static: day-of-year indexed HotD (Bukhari #1 as fallback)
│       ├── reading-paths.json           # Static: 4 built-in path definitions
│       ├── narrator/                    # Self-hosted narrator reliability JSON files
│       │   └── {id}.json               # e.g. 4686.json → Ibn Hajar Taqrib data
│       └── illustrations/hadith/       # Stage 3: 9 collection SVG motifs
│           └── {collection-slug}.svg   # e.g. bukhari.svg, muslim.svg …
└── tests/
    ├── unit/
    │   ├── hadith-feed.test.ts
    │   ├── isnad.test.ts
    │   ├── reading-progress.test.ts
    │   ├── bookmarks.test.ts
    │   ├── notes.test.ts
    │   ├── reading-paths.test.ts
    │   ├── copy-attribution.test.ts
    │   ├── grade-badge-contrast.test.ts
    │   └── ai-explain.test.ts
    └── e2e/
        ├── hadith-library.spec.ts
        ├── tier-navigation.spec.ts
        ├── isnad-narrator.spec.ts
        ├── trace-view.spec.ts
        ├── compare-mode.spec.ts
        ├── focus-trap.spec.ts
        └── accessibility.spec.ts
```

---

## 13. TypeScript Interfaces

```typescript
// ── Collections ──────────────────────────────────────────────────
interface HadithCollection {
  slug: string;                    // "bukhari"
  nameEnglish: string;             // "Sahih al-Bukhari"
  nameArabic: string;              // "صحيح البخاري"
  compiler: string;
  compiledPeriod: string;
  hadithCount: number;
  booksCount: number;
  gradeLabel: 'Sahih' | 'Mixed' | 'Sahih/Hasan';
  isFeatured?: boolean;            // Bukhari only
}

// ── Books ────────────────────────────────────────────────────────
interface HadithBook {
  collectionSlug: string;
  bookNumber: number;
  nameEnglish: string;
  nameArabic: string;
  hadithCount: number;
}

// ── Hadiths ───────────────────────────────────────────────────────
type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown';

interface Hadith {
  id: string;                      // "{collection}:{book}:{num}"
  collection: string;              // slug
  bookNumber: number;
  hadithNumber: number;
  arabicText: string;
  translation: HadithTranslation;
  grade: HadithGrade;
  grader: string;                  // "Darussalam" | "al-Albani" | ...
  graderYear?: string;
  narrator: string;                // Primary narrator name
  narratorArabic?: string;
  isnad?: IsnadNode[];
  topics?: string[];
}

interface HadithTranslation {
  text: string;
  edition: string;                 // "Darussalam (English)"
  translator: string;
  language: string;                // ISO 639-1
}

// ── Isnad ─────────────────────────────────────────────────────────
type NarratorRole = 'prophet' | 'companion' | 'tabii' | 'compiler' | 'other';
type NarratorReliability = 'thiqah' | 'thiqah-thabt' | 'saduq' | 'daif' | 'matruk' | 'unknown';

interface IsnadNode {
  narratorId: string;
  fullName: string;
  arabicName: string;
  lifespan: string;                // "d. 256 AH"
  era: string;                     // "Tabi' al-Tabi'in"
  role: NarratorRole;
  reliability: NarratorReliability;
}

interface NarratorDetail extends IsnadNode {
  kunya: string;
  nasab: string;
  location: string;
  graderCitations: NarratorGraderCitation[];
  narrationCount?: number;
}

interface NarratorGraderCitation {
  scholar: string;                 // "Ibn Hajar al-'Asqalani"
  gradeText: string;               // "Thiqah thabt"
  source: string;                  // "Taqrib at-Tahdhib"
  sourceRef: string;               // "no. 4686"
}

// ── Hadith of the Day ─────────────────────────────────────────────
interface HadithOfTheDay {
  hadithRef: string;               // "{collection}:{book}:{num}"
  arabicMatn: string;
  translation: string;
  translationEdition: string;
  narratorName: string;
  grade: HadithGrade;
  grader: string;
  collection: string;
}

// ── Bookmarks ─────────────────────────────────────────────────────
type HadithBookmarkCategory =
  'General' | 'For Memorisation' | 'Reflection' | 'To Verify' | string;

interface HadithBookmark {
  collectionSlug: string;
  bookNum: number;
  hadithNum: number;
  arabicSnippet: string;
  englishSnippet: string;
  category: HadithBookmarkCategory;
  addedAt: number;
}

// ── Notes ─────────────────────────────────────────────────────────
interface HadithNote {
  hadithRef: string;               // "{collection}:{book}:{num}"
  text: string;                    // max 2000 chars
  updatedAt: number;
}

// ── Last Read ─────────────────────────────────────────────────────
interface LastReadHadith {
  collectionSlug: string;
  bookNum: number;
  hadithNum: number;
  timestamp: number;
}

// ── Reading Paths ─────────────────────────────────────────────────
interface ReadingPath {
  slug: string;                    // "40-nawawi"
  name: string;                    // "Start with 40 Nawawi"
  totalCount: number;              // 42
  hadiths: string[];               // Array of hadithRefs in study order
  description: string;
}

interface ReadingPathProgress {
  slug: string;
  readHadiths: string[];           // Array of completed hadithRefs
}

// ── Comparison Mode ───────────────────────────────────────────────
interface ComparisonSet {
  items: ComparisonItem[];         // max 3
}

interface ComparisonItem {
  hadithRef: string;
  collectionLabel: string;
  arabicText: string;
  translation: string;
  grade: HadithGrade;
  grader: string;
  isnad?: IsnadNode[];
}

interface DiffHighlight {
  field: 'arabic' | 'translation';
  ranges: Array<{ start: number; end: number }>;
}

// ── AI Explanation ────────────────────────────────────────────────
interface HadithAIExplainRequest {
  type: 'hadith';
  id: string;                      // "{collection}:{book}:{num}"
  content: string;                 // arabicText + translation
  language: string;
}

interface HadithAIExplainResponse {
  safe: boolean;
  explanation?: {
    summary: string;
    vocabulary: Array<{ arabic: string; meaning: string }>;
    scholarlyContext: string;
    practicalLesson: string;
  };
  fallback?: string;
}

// ── Search ────────────────────────────────────────────────────────
interface HadithSearchResult {
  hadithRef: string;
  collectionLabel: string;
  arabicSnippet: string;
  translationSnippet: string;
  grade: HadithGrade;
  grader: string;
  arabicMatchRanges: Array<{ start: number; end: number }>;
  translationMatchRanges: Array<{ start: number; end: number }>;
}

// ── Share Image ───────────────────────────────────────────────────
type ShareFormat = 'square' | 'story';  // 1080×1080 | 1080×1920

interface HadithShareImageConfig {
  hadithRef: string;
  arabicText: string;
  translationText: string;
  collectionLabel: string;
  narratorName: string;
  grade: HadithGrade;
  grader: string;
  format: ShareFormat;
}
```

---

## 14. Testing

### 14.1 Unit Tests

| Module | Key Test Cases |
|---|---|
| `hadith-feed.js` | Grade filter shows/hides correct cards; all 4 grades filtered correctly; "Load more" appends without re-rendering existing cards |
| `isnad.js` | Toggle open/close correctly; second click on same ID closes; CSS max-height transition applied (no reflow) |
| `reading-progress.js` | Hadith counted read after 3s continuous visibility; not at 2s; last-read updated on topmost visible card; `last-read` key set correctly |
| `bookmarks.js` | Idempotent toggle (add/remove); max custom categories (5) enforced; QuotaExceededError toast fires |
| `notes.js` | Max 2000 chars enforced; gold dot appears on save; cancel does not persist; note linked to correct `hadithRef` |
| `reading-paths.js` | Progress ring `stroke-dashoffset` correct at 0%, 50%, 100%; path "Complete" state shows at 100%; `longestStreak` not reset on path completion edge case |
| `copy-attribution.js` | Full payload format matches spec exactly; Arabic-only option copies only Arabic; toast "Copied with citation ✦" fires |
| `grade-badge-contrast.test.ts` | All 4 grade colours in light AND dark mode pass WCAG AA (4.5:1); dark-mode overrides present for sahih + mawdu |
| `ai-explain.js` | 10s timeout triggers error state; fatwa pattern stripped; retry re-fires fetch; "✦ Powered by QuranlyAI" present in rendered output |

### 14.2 Integration Tests

- Collections grid: API response → 9 cards rendered; Bukhari card has `class="featured"` + gold-aura shadow; filter tabs show/hide correct cards
- Isnad v1 → v2 upgrade: Stage 1 dots-only renders; Stage 2 narrator panel opens on row click with correct citations
- 3-tier navigation: "Browse →" on Bukhari → Tier 2 books grid (97 books); click Book 1 → Tier 3a hadith list; click hadith → Tier 3b deep-view; breadcrumb reflects full path
- Deep-link gold pulse-ring: navigate to `/hadith/bukhari/1/1` → card in view → pulse fires 2 iterations
- "Ask a Question" pre-fill: on Tier 3 page, click → verify engine opens with current hadith matn + ref pre-filled
- Translation tabs: switching EN → UR on deep-view swaps translation text; preference persists in `localStorage`
- Reading path progress: mark 5 hadiths read → progress ring updates correctly; "Continue →" points to hadith #6 in path

### 14.3 E2E Tests (Playwright)

| Scenario | Assertions |
|---|---|
| Default load | Collections grid renders; Bukhari card has "✦ Most Authentic" seal; stats strip shows 61K+ |
| Dark mode | `data-theme="dark"` pre-set; no theme flash; grade badge dark-mode colours applied; Bismillah gold gradient |
| Grade filter | Click "Sahih" pill → only `.grade-sahih` cards visible; `aria-live` region announces count |
| Isnad toggle | Click "View Isnad" on hadith #1 → narrator chain expands; click again → collapses |
| Narrator panel (Stage 2) | Click narrator row → panel slides in with Ibn Hajar citation; click away → closes |
| 3-tier navigation | Bukhari "Browse →" → books grid (97 books); click "Book of Revelation" → hadith list; click "Open Full View" → deep-view page |
| Breadcrumb | Deep-view page shows "Hadith › Sahih al-Bukhari › Book 1 · Revelation › Hadith 1"; clicking "Sahih al-Bukhari" → Tier 2 |
| Continue Reading | Set `localStorage['islamicinfo-hadith-last-read']` to Bukhari:1:5 → page load → hero shows "Continue where you left off → Sahih al-Bukhari, Hadith 5" |
| Copy with attribution | Click 📋 on hadith card → clipboard matches exact attribution format → toast "Copied with citation ✦" |
| Bookmark + panel | Bookmark hadith → gold dot on badge → open bookmarks panel → card visible; click Jump → scroll to hadith |
| Trace View open/close | Click "View as Trace →" → `.trace-layout` full-screen; Exit → returns to deep-view at same hadith |
| Focus trap (Trace View) | Tab 20× → focus stays within trace layout; Escape → closes; focus returns to trigger element |
| Comparison mode | Add 3 hadiths → "Compare →" active → `/hadith/compare` renders 3 columns; `.diff-highlight` on differing words |
| Reading Mode | Toggle reading mode → sidebar hidden, footer hidden, single column max-720px; Escape exits |
| Error: book list failure | Simulate 500 on books endpoint → "Books temporarily unavailable" + retry; breadcrumb stays |
| Error: AI timeout | Mock 11s AI response → "Explanation unavailable — please try again" in `.ai-card`; ✕ closes; retry re-fires |
| `localStorage` quota | Mock `QuotaExceededError` on `setItem` → toast "Storage full" → existing bookmarks preserved |
| Mobile 440px | Sidebar hidden (bottom sheet); hadith cards full-width; isnad chain reflows to vertical list |
| Reduced motion | `prefers-reduced-motion: reduce` → pulse-ring animation absent; gold border-color applied instead |

### 14.4 Accessibility Audit (axe-core, CI)

- Zero violations WCAG 2.1 AA on every route in §2.2
- Specific checks: `aria-label` on all `.hadith-action-btn` and `.footer-action-btn`; `role="list"` on isnad chain; `role="search"` on search pill; `aria-live` for grade filter result count; all narrator dot SVGs have `aria-hidden` (decorative) or `aria-label`
- Grade badge contrast: all 4 grades × both themes verified in automated contrast checks
- VoiceOver + NVDA manual verification: Trace View focus trap; narrator panel expansion; screen reader announces grade on each hadith card

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

Run against `/hadith/bukhari/1/1` (deep-view benchmark page — representative of production load).

---

*End of IslamicInfo Hadith Library Technical Specification*
*Ref: `hadith_module_enhanced__1_.html` · `CLAUDE_v3.md v3.0` · PRD v1.1 · Functional Document v1.0*
