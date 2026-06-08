# IslamicInfo — Daily Duas Technical Specification

**Page:** `dua.html` · **Route:** `/dua`
**Blueprint:** `dua__1_.html` · **Design System:** `CLAUDE_v3.md v3.0` · **PRD:** v1.1 · **Status:** Implementation-Ready

---

## 1. Purpose

The Daily Duas page is IslamicInfo's Islamic supplication library — position 6 in global nav, between Knowledge Hub and Tools. It provides 1,240+ verified duas with Arabic text, transliteration, English translation, and authenticated source citations.

**Five core functions:**
1. **Library browsing** — 12 category cards + 14 sidebar occasion links + live search + filter chips
2. **Daily habit** — Dua of the Day (featured card) + 7-day streak tracker
3. **Full interaction suite** — Copy · Share (image generation) · Save (bookmark) · Notes · AI Explain · Audio playback
4. **Content authenticity** — every dua sourced from Qur'an or authenticated Sunnah; source grade displayed; no fatwa issued
5. **Platform gateway** — CTA section and footer push users to Quran Explorer, Hadith Library, and IS

**KPIs (90-day targets):** ≥ 3.5 duas interacted per session, ≥ 22% search usage rate, ≥ 90 bookmark actions/1K UVs, ≥ 50 share actions/1K UVs, ≥ 28% 7-day retention, ≤ 38% bounce rate.

---

## 2. UI Components

### 2.1 Page Section Order (frozen)

| # | Section | CSS / ID | Priority |
|---|---|---|---|
| 1 | Global Header | `.site-header` | P0 |
| 2 | Mobile Menu Overlay | `#mobileMenu` | P0 |
| 3 | Hero | `.hero` | P0 |
| 4 | Stats Strip | `.stats-strip` | P0 |
| 5 | Dua of the Day | `.featured-dua` | P0 |
| 6 | Arabesque Divider | `.aq-divider` | P0 |
| 7 | Category Grid | `#categories .cat-grid` | P0 |
| 8 | Dua Library | `#duas-section .dua-layout` | P0 |
| 8a | Sidebar | `.dua-sidebar` | P0 |
| 8b | Search Bar | `.dua-search-wrap` | P0 |
| 8c | Filter Chips | `.cat-filter` | P0 |
| 8d | Dua Card Grid | `.dua-grid` | P0 |
| 8e | Load More | `.load-more-wrap` | P1 |
| 9 | CTA Section | `.cta-section` | P0 |
| 10 | Global Footer | `#ii-footer` | P0 |

### 2.2 Hero (Frozen content)

- **Bismillah:** first child of `.hero-inner`; Amiri; teal-gradient clip-text (light) / gold-gradient + `drop-shadow(0 0 14px rgba(217,179,88,.55))` (dark)
- **Badge:** "Dua Library" — `.hero-badge` with gold pulse dot
- **H1:** "The Complete / *Dua Library*" — `<span class="gradient-italic">Dua Library</span>`
- **Arabic verse:** ادْعُونِي أَسْتَجِبْ لَكُمْ (Qur'an 40:60) — teal-700, 60% opacity, RTL
- **CTAs:** `btn-primary` "Browse Duas" → smooth-scroll `#duas-section` | `btn-ghost` "By Occasion" → smooth-scroll `#categories`
- **4 floating `.geo` SVG decorators** (`.g1`–`.g4`) with `geoFloat` keyframe — do not remove

### 2.3 Stats Strip

4 stat cells; `margin-top: -20px` overlaps hero. At ≤ 700px: 2×2 grid, dividers hidden.

| Stat | Value |
|---|---|
| Verified Duas | 1,240+ |
| Occasions | 18+ |
| Source-Cited | 100% |
| Languages | 3+ |

### 2.4 Featured Dua Card (`.featured-dua`)

Dark gradient bg (`var(--teal-900) → var(--teal-800) → #062628`). Two radial glows: gold top-right (`::before`), teal bottom-left (`::after`).

**Anatomy (top → bottom):**
- `.fd-badge` — occasion pill (gold bg, "✦ Morning Remembrance")
- `.fd-actions` — 3 icon buttons: Copy · Share · Save
- `.fd-arabic` — Amiri, `clamp(22px,3.5vw,36px)`, RTL, white, `line-height: 2.0`
- `.fd-transliteration` — 13px, italic, `rgba(197,160,89,.8)`
- `.fd-trans` — `var(--font-serif)`, `clamp(15px,2vw,18px)`, italic, `rgba(255,255,255,.72)`
- `.fd-footer` — source (gold uppercase) + `.fd-nav-btn` Previous/Next pills

### 2.5 Category Grid

12 `.cat-card` as `<a>` elements with `?cat={slug}` hrefs. Auto-fill grid `minmax(160px,1fr)`, 14px gap. Hover: `translateY(-4px) scale(1.02)` + teal glow. **No shimmer.**

| Slug | Label | Count |
|---|---|---|
| `morning-evening` | Morning & Evening | 42 |
| `prayer` | Prayer | 38 |
| `food-drink` | Food & Drink | 18 |
| `sleep` | Sleep & Waking | 24 |
| `forgiveness` | Forgiveness | 31 |
| `illness` | Illness | 15 |
| `travel` | Travel | 19 |
| `family` | Family & Children | 22 |
| `knowledge` | Knowledge | 12 |
| `anxiety` | Anxiety & Hardship | 27 |
| `ramadan` | Ramadan | 35 |
| `hajj-umrah` | Hajj & Umrah | 29 |

### 2.6 Dua Library Layout

Two-column flex: `.dua-sidebar` (240px, sticky `top:80px`) + `.dua-main` (flex:1, `padding-left:28px`). Sidebar hidden at ≤ 900px; `.dua-main` takes full width.

**Sidebar sections:**
1. `BY OCCASION` label + 14 `.dsb-item` occasion links + counts
2. Horizontal divider
3. `.dsb-streak` — "✦ N-day streak" label + 7 day squares

**14 sidebar occasion slugs:** `all` · `morning-evening` · `prayer` · `sleep` · `protection` · `forgiveness` · `knowledge` · `illness` · `food-drink` · `travel` · `family` · `anxiety` · `ramadan` · `hajj-umrah`

Active state: `.dsb-item.active` — `bg: var(--teal-50)`, `color: var(--teal-700)`, `border-left: 2px solid var(--teal-700)`.

**Filter chips (6):** All · Morning · Prayer · Qur'anic · Protection · + (More). Active: `.cat-chip.active` — teal-700 bg, white text.

**Dua grid:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px`. Single column at ≤ 640px.

### 2.7 Dua Card Anatomy

Each `.card.dua-card` carries a unique `data-dua-id` attribute.

| Slot | Element | Style |
|---|---|---|
| Header | `.dua-tag` + `.dua-icon-btn` (save) | teal pill (10px uppercase) + icon button |
| Body | `.dua-arabic` | Amiri 22px, RTL, `rgba(0,105,110,.03)` tinted bg, `border-radius:10px`, `line-height:2.0`. Dark: `var(--teal-300)` |
| Body | `.dua-transliteration` | 12.5px, italic, `var(--gold-700)` |
| Body | `.dua-translation` | `var(--font-serif)`, 15px, teal left border (`┃`) |
| Footer | `.dua-source` | Green dot + "BOOK · REFERENCE" uppercase |
| Footer | `.dua-btn` × 6 | Copy · Share · Save · Notes · AI Explain · Play |

**Card hover:** `translateY(-5px) scale(1.012)` + teal glow ring — **absolutely no shimmer `::after` sweep**.
**Dark mode hover:** `box-shadow: 0 16px 48px rgba(88,193,199,.18)`.

### 2.8 AI Explain Panel

Slide-over from right on desktop; bottom sheet on mobile. **Panel header always reads: "AI-Assisted Explanation — Quranly AI"** (hard-coded, never AI-generated).

Sections: Meaning · Context · Source · Related · **Disclaimer** (always hard-coded: *"This explanation is AI-assisted. For religious rulings, always consult a qualified scholar."*).

States: Loading (skeleton rows) · Loaded · Error ("Unable to load explanation. Please try again." + Retry button).

### 2.9 Audio Player (inline, per card)

Expands below card on Play click. Controls: Play/Pause · progress `<input type="range">` · current/total time (mm:ss) · speed selector (0.75× · 1× · 1.25× · 1.5×).

Disabled state (no `audio_url`): opacity 0.4, `cursor: not-allowed`, tooltip "Audio coming soon".

### 2.10 Share Drawer

6 options: Share as Image · Copy Link · WhatsApp · Telegram · X · Native Share. Bottom sheet on mobile (focus-trapped). Generated image ≥ 1080×1080px with `islamicinfo.org` watermark (bottom-right, 11px — mandatory, never omittable).

### 2.11 Streak Tracker (`.dsb-streak`)

7 day squares. States:
- `.done` — `var(--teal-700)` bg, white checkmark
- `.today` — dashed `var(--teal-500)` border, "T" label
- default — faint teal bg, day label

Label: "✦ N-day streak" in teal-600, uppercase 10px.

---

## 3. Frontend Logic

### 3.1 Theme No-Flash

```html
<!-- In <head> before any CSS — prevents flash of wrong theme -->
<script>
  (function() {
    const t = localStorage.getItem('islamicinfo-theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

### 3.2 Hero CTA Scroll

```js
document.getElementById('browseDuasBtn')
  .addEventListener('click', () =>
    document.getElementById('duas-section')
      .scrollIntoView({ behavior: 'smooth' }));

document.getElementById('byOccasionBtn')
  .addEventListener('click', () =>
    document.getElementById('categories')
      .scrollIntoView({ behavior: 'smooth' }));
```

### 3.3 URL Parameter Handling

On page load, read `?cat={slug}` and pre-activate the matching sidebar item and filter chip:

```js
const params = new URLSearchParams(location.search);
const cat = params.get('cat');
if (cat) applyFilter(cat);
```

### 3.4 Sidebar + Filter Chip Sync

`applyFilter(slug)` is the single function for all filter triggers:
1. Remove `.active` from all `.dsb-item`; add to matching item (by `data-cat`)
2. Remove `.active` from all `.cat-chip`; add to matching chip (by `data-cat`)
3. Hide all `.dua-card` where `data-occasion !== slug` (or show all if `slug === 'all'`)
4. Fire GA4 `kh_dua_filter` with `{ occasion: slug }`

Both sidebar clicks and chip clicks call the same `applyFilter(slug)`.

### 3.5 Live Search

```js
document.getElementById('duaSearch').addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  const cards = document.querySelectorAll('.dua-card');
  let visibleCount = 0;
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const matches = !q || text.includes(q);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });
  // No-results state
  document.getElementById('noResults').style.display = visibleCount === 0 && q ? '' : 'none';
  if (q) gtag('event', 'kh_dua_search', { query: q });
});
```

Placeholder: "Search duas by occasion, keyword, or Arabic..."
Focus state: `border: var(--teal-500)`, `box-shadow: 0 0 0 4px rgba(44,164,171,.12)`.

### 3.6 Copy Action

```js
function copyDua(btn, arabicText) {
  const id = btn.closest('[data-dua-id]').dataset.duaId;
  const write = () => navigator.clipboard.writeText(arabicText).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = arabicText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
  write().then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
    gtag('event', 'kh_dua_copy', { dua_id: id });
  });
}
```

Works on both dua cards and featured card. Never opens modal or alert.

### 3.7 Save / Bookmark

```js
function toggleSave(duaId, btn) {
  const key = `dua-saved-${duaId}`;
  const saved = localStorage.getItem(key) === 'true';
  if (saved) {
    localStorage.removeItem(key);
    btn.classList.remove('saved'); // reverts gold colour
    gtag('event', 'kh_dua_save', { dua_id: duaId, action: 'unsave' });
  } else {
    localStorage.setItem(key, 'true');
    btn.classList.add('saved'); // applies var(--gold-500)
    gtag('event', 'kh_dua_save', { dua_id: duaId, action: 'save' });
  }
}
```

On page load: `document.querySelectorAll('[data-dua-id]')` → for each, check `localStorage.getItem('dua-saved-' + id)` → apply `.saved` class if present.

### 3.8 Notes Inline Editor

```js
function toggleNotes(duaId) {
  const editor = document.getElementById(`notes-editor-${duaId}`);
  editor.classList.toggle('show');
  if (editor.classList.contains('show')) {
    const saved = localStorage.getItem(`dua-note-${duaId}`) || '';
    editor.querySelector('textarea').value = saved;
    updateCharCount(editor);
  }
}

function saveNote(duaId) {
  const editor = document.getElementById(`notes-editor-${duaId}`);
  const text = editor.querySelector('textarea').value;
  try {
    localStorage.setItem(`dua-note-${duaId}`, text);
    toggleNotes(duaId);
    updateNoteIndicator(duaId, !!text);
  } catch {
    showInlineError(editor, 'Could not save note. Try again.');
  }
}
```

Max 500 chars enforced client-side (`maxlength="500"`). Character counter updates on `input`. Note dot indicator: small filled circle on card header when note exists.

### 3.9 AI Explain Panel

```js
async function openAIExplain(duaId, arabicText, translation, source) {
  const panel = document.getElementById('aiPanel');
  panel.classList.add('open');
  panel.querySelector('.ai-content').innerHTML = skeletonHTML();
  gtag('event', 'kh_dua_ai_explain', { dua_id: duaId });

  try {
    const res = await fetch('/api/dua-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duaId, arabicText, translation, source })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderAIContent(panel, data);
  } catch {
    panel.querySelector('.ai-content').innerHTML = errorHTML();
  }
  // Disclaimer always rendered from template — never from AI response
}
```

Panel close: click outside, Escape key, close icon. Focus trap: Tab/Shift+Tab cycle within panel only.

### 3.10 Audio Player

```js
function initAudioPlayer(card) {
  const duaId = card.dataset.duaId;
  const audioUrl = card.dataset.audioUrl;
  if (!audioUrl) { showDisabledPlayer(card); return; }

  const audio = new Audio(audioUrl);
  const player = card.querySelector('.audio-player');
  player.classList.add('active');

  // Controls wiring
  player.querySelector('.play-btn').addEventListener('click', () =>
    audio.paused ? audio.play() : audio.pause());
  audio.addEventListener('timeupdate', () => updateScrubber(player, audio));
  player.querySelector('.speed-btn').addEventListener('click', () =>
    cycleSpeed(audio, player));

  // Keyboard
  player.querySelector('.play-btn').addEventListener('keydown', e => {
    if (e.key === ' ') { e.preventDefault(); audio.paused ? audio.play() : audio.pause(); }
  });
  player.querySelector('.scrubber').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') audio.currentTime -= 5;
    if (e.key === 'ArrowRight') audio.currentTime += 5;
  });
  gtag('event', 'kh_dua_audio_play', { dua_id: duaId, speed: 1 });
}
```

Speed cycles: `[0.75, 1, 1.25, 1.5]`, wrapping. ARIA labels: play button `aria-label="Play dua recitation"`, scrubber `aria-label="Audio progress"`.

### 3.11 Share Drawer + Image Generation

```js
async function generateShareImage(dua) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // Layer 1: teal gradient background
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#0A3A3D'); grad.addColorStop(1, '#062628');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1080);

  // Layer 2: geometric motif (4% opacity)
  // ... SVG star polygon at low opacity

  // Layer 3–6: Arabic, transliteration, translation, source
  await document.fonts.ready; // MUST await before drawText
  ctx.font = '52px Amiri'; ctx.fillStyle = 'white';
  ctx.textAlign = 'center'; ctx.direction = 'rtl';
  // ... wrapText(ctx, dua.arabic, 540, 300, 900, 70)

  // Layer 7: Watermark — MANDATORY, always present
  ctx.font = '22px Inter'; ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.textAlign = 'right'; ctx.direction = 'ltr';
  ctx.fillText('islamicinfo.org', 1060, 1060);

  return canvas.toDataURL('image/png');
}
```

Canvas font: `await document.fonts.ready` with `Promise.race` 3s timeout before any `ctx.fillText`. Watermark is last drawn — never skippable.

### 3.12 Streak Tracker

```js
function loadStreak() {
  const raw = localStorage.getItem('islamicinfo-dua-streak');
  return raw ? JSON.parse(raw) : { count: 0, lastDate: null, completedDates: [] };
}

function markTodayDone() {
  const streak = loadStreak();
  const today = new Date().toISOString().slice(0, 10);
  if (streak.completedDates.includes(today)) return;

  streak.completedDates.push(today);
  const yesterday = getPreviousDate(today);
  streak.count = (streak.lastDate === yesterday) ? streak.count + 1 : 1;
  streak.lastDate = today;
  localStorage.setItem('islamicinfo-dua-streak', JSON.stringify(streak));
  renderStreak(streak);
}
```

Streak increments when user performs any dua action (Copy/Save/AI Explain). `lastDate` compared to yesterday to detect gaps. If `lastDate < yesterday`, streak resets to 1 (today).

On page load: render 7-day squares from `completedDates`; mark today as `.today` if not in `completedDates`, `.done` if present.

### 3.13 Featured Dua Previous/Next

```js
let featuredPool = []; // loaded from /data/duas-featured.json or API
let featuredIndex = 0;

function cycleFeaturedDua(direction) {
  featuredIndex = (featuredIndex + direction + featuredPool.length) % featuredPool.length;
  renderFeaturedDua(featuredPool[featuredIndex]);
}
```

### 3.14 Load More

```js
let currentPage = 1;
let currentFilter = 'all';

async function loadMoreDuas() {
  const btn = document.getElementById('loadMoreBtn');
  btn.classList.add('loading');
  try {
    const res = await fetch(`/api/duas?page=${currentPage + 1}&cat=${currentFilter}&limit=20`);
    const { duas, hasMore } = await res.json();
    currentPage++;
    appendDuaCards(duas);
    if (!hasMore) btn.style.display = 'none';
  } catch {
    showToast('Could not load more duas. Please try again.');
  } finally {
    btn.classList.remove('loading');
  }
}
```

---

## 4. Backend Logic

### 4.1 AI Explain Proxy (`POST /api/dua-explain`)

- Receives: `{ duaId, arabicText, translation, source }`
- Validates `duaId` is a known slug (whitelist check)
- Calls `api.anthropic.com/v1/messages`:
  - Model: `claude-sonnet-4-20250514`
  - `max_tokens: 1000`
  - System prompt (hardcoded, non-overridable):
    > *"You are an Islamic knowledge assistant for IslamicInfo.org. Explain the following dua in simple language. State its meaning, when to recite it, and its source. Cite authentic Quran or hadith references. Acknowledge uncertainty. Avoid issuing religious verdicts."*
- Post-process: strip any fatwa/ruling language before returning
- Rate-limit: 20 requests/IP/hour; return 429 with `Retry-After`
- Response cache: Redis key `dua-explain:{duaId}`, TTL 24h (AI responses are stable for common duas)
- Returns: `{ meaning, context, source, related, disclaimer }` — disclaimer is ignored from AI; the frontend always uses its hardcoded template version

### 4.2 Duas API (`GET /api/duas`)

```
Query params:
  page     integer  default 1
  cat      string   occasion slug; 'all' returns all
  limit    integer  default 20, max 50
  q        string   optional text search

Response:
  { duas: Dua[], total: number, hasMore: boolean, page: number }
```

Pagination strategy: offset-based for MVP (OQ-06 pending). Cursor-based preferred for Phase 2.

### 4.3 Featured Dua (`GET /api/duas/featured`)

Returns today's featured dua. Selection strategy (OQ-02 pending): date-based seed `(dayOfYear * prime) % featuredPoolSize`. Pool = duas where `featured: true`. Updates daily at midnight UTC.

Response: `Dua & { prev: string, next: string }` (IDs for Previous/Next).

### 4.4 Email Subscribe (`POST /api/subscribe`)

Not on Dua page directly; referenced via CTA links to IS/Quran pages.

---

## 5. APIs

| Endpoint | Method | Auth | Cache | Notes |
|---|---|---|---|---|
| `/api/duas` | GET | None | 1h CDN | Paginated dua list; supports `cat`, `q`, `page`, `limit` |
| `/api/duas/{id}` | GET | None | 24h | Single dua detail |
| `/api/duas/featured` | GET | None | 1h | Today's featured dua + pool IDs |
| `/api/dua-explain` | POST | None (rate-limited) | 24h Redis | AI proxy → Anthropic; `{duaId, arabicText, translation, source}` |
| `/data/duas-featured.json` | GET | None | Bundled | Static fallback for featured pool |
| Audio CDN | GET | None | CDN-native | `{CDN_BASE}/audio/duas/{duaId}.mp3` (OQ-03 pending) |

### 5.1 Dua Source Deep-Links

| Source type | Link pattern |
|---|---|
| Qur'anic | `quran.html?surah={n}&ayah={n}` |
| Hadith | `hadith.html?ref={reference}` |

### 5.2 GA4 Events

| Event | Trigger | Parameters |
|---|---|---|
| `kh_dua_search` | Search input fired | `{ query: string }` |
| `kh_dua_filter` | Sidebar or chip filter applied | `{ occasion: string }` |
| `kh_dua_copy` | Copy button clicked | `{ dua_id: string }` |
| `kh_dua_share` | Share drawer action | `{ method: string, dua_id: string }` |
| `kh_dua_save` | Save toggled | `{ dua_id: string, action: 'save'|'unsave' }` |
| `kh_dua_ai_explain` | AI panel opened | `{ dua_id: string }` |
| `kh_dua_audio_play` | Audio play started | `{ dua_id: string, speed: number }` |
| `kh_dua_featured_view` | Page load | — |

---

## 6. Database

### 6.1 `localStorage` Keys

| Key | Type | Purpose | Stage |
|---|---|---|---|
| `islamicinfo-theme` | `'light'│'dark'` | Global theme (shared all pages) | P0 |
| `dua-saved-{id}` | `'true'` | Saved state per dua ID | P0 |
| `dua-note-{id}` | `string` (max 500 chars) | Personal note per dua ID | P1 |
| `islamicinfo-dua-streak` | JSON `StreakData` | Daily streak tracker | P1 |

### 6.2 Dua Data Model

```
Required fields (every dua):
  id              string    Slug; stable, slugified, unique (e.g. "rabbana-atina-fid-dunya")
  arabic          string    Full Arabic with diacritics; UTF-8; RTL
  transliteration string    Latin romanisation; no special chars
  translation     string    Complete English meaning
  source          DuaSource
  occasion        string    Must match one of 14 sidebar slugs
  category        string    Must match one of 12 category card slugs
  date_added      string    ISO "YYYY-MM-DD"

Optional fields:
  audio_url       string    CDN URL; absent = disabled player
  featured        boolean   Eligible for Dua of the Day rotation
  featured_date   string    ISO date override for explicit scheduling
  tags            string[]  Additional search keywords
  related_ids     string[]  2-3 related dua IDs for AI panel
```

### 6.3 Source Object

```
  book        string   "Qur'an" | "Sahih al-Bukhari" | etc.
  ref         string   "2:201" (Quran) or "6306" (hadith number)
  collection  string   Full collection name
  grade       string   "sahih" | "hasan" | "daif" | "mawdu"
  quran_link  string?  "quran.html?surah=2&ayah=201"
  hadith_link string?  "hadith.html?ref=6306"
```

### 6.4 Server-Side Cache (Redis)

| Key | TTL | Content |
|---|---|---|
| `dua-explain:{duaId}` | 86400s (24h) | AI explanation JSON |
| `duas-list:{cat}:{page}` | 3600s (1h) | Paginated list response |
| `duas-featured:{date}` | 3600s (1h) | Today's featured dua |

---

## 7. Validation

### 7.1 Search Input

- Client: search on every `input` event; no minimum char length (real-time filter)
- No-results state: "No duas found for "{query}"" with a clear (✕) button

### 7.2 Copy API

- `navigator.clipboard.writeText` in `try/catch`; `execCommand('copy')` fallback
- Never fail silently — always show "Copied!" or an error state

### 7.3 Notes Editor

| Check | Rule |
|---|---|
| Max length | 500 chars enforced via `maxlength` attribute + `input` event counter |
| Empty save | Allowed — saves empty string, removes note indicator dot |
| `localStorage` failure | Catch `QuotaExceededError` → show "Could not save note. Try again." |

### 7.4 AI Explain Request

| Field | Rule |
|---|---|
| `duaId` | Must match pattern `^[a-z0-9-]+$`; must exist in dua whitelist |
| `arabicText` | Non-empty string; max 2000 chars |
| `translation` | Non-empty string; max 2000 chars |

### 7.5 Share Image

- `document.fonts.ready` must resolve (or timeout after 3s) before any `canvas.fillText`
- Watermark draw call is last; never conditional; fail-safe: if main content fails, still draw watermark
- Canvas size: exactly 1080×1080

### 7.6 Dua Data Editorial

- Every dua must have `source.grade` set; default `'hasan'` if uncertain — never empty
- `source.grade` maps to `.grade-*` CSS class (`.grade-sahih`, `.grade-hasan`, `.grade-daif`)
- Anonymous sources, social media, or unauthenticated sites are rejected at editorial intake

### 7.7 Streak Data

- Wrap all `JSON.parse(localStorage.getItem('islamicinfo-dua-streak'))` in `try/catch`; on failure return `defaultStreak()`
- Wrap all `localStorage.setItem` in `try/catch`; catch `QuotaExceededError` → toast

---

## 8. Error Handling

| Scenario | User-Facing Behaviour | Technical Handling |
|---|---|---|
| Dua list API failure | Show cached data if available; "Could not load duas. Retry?" message | `catch` → try `localStorage` cache key → empty state + retry button |
| Featured dua API failure | Render from `/data/duas-featured.json` static fallback | `catch` → static JSON; log to Sentry |
| AI Explain timeout / error | "Unable to load explanation. Please try again." + Retry button; disclaimer always shows | `AbortController(10s)`; `catch` → error state in panel; panel stays open |
| AI response contains fatwa/ruling | Stripped server-side before returning; fallback "Unable to generate safe explanation." | Post-process regex; log occurrence |
| Audio CDN 404 / unreachable | Play button disabled; tooltip "Audio coming soon" | `audio.onerror` → disabled state; no crash |
| Canvas font timeout (> 3s) | Falls back to system serif; watermark always drawn | `Promise.race([document.fonts.ready, timeout(3000)])` |
| `localStorage` unavailable | Bookmarks/notes/streak non-functional; silent graceful degrade | `try/catch` on all `localStorage` access; page fully usable without it |
| `localStorage` quota exceeded | Toast: "Storage full — could not save." | `QuotaExceededError` catch; existing data preserved |
| Copy clipboard unavailable | `execCommand('copy')` fallback; "Copied!" still shown if success | `try/catch` on clipboard API; fallback on fail |
| Load More API failure | Toast: "Could not load more duas. Please try again." | `catch` → toast; Load More button re-enabled |
| Search: no results | "No duas found for '{query}'" inline message + clear button | Check `visibleCount === 0` after filter loop |
| Share: `navigator.share` unavailable | Falls back to download-only + clipboard copy | Feature detect `'share' in navigator` |

---

## 9. RBAC

The Daily Duas page is **fully public** — no authentication gate.

| Role | Access | Notes |
|---|---|---|
| Guest | Full page; bookmarks/notes/streak in `localStorage` only | Default for all users |
| Authenticated User | All guest features + future cloud-sync | Phase 2+; localStorage merge on login |
| Admin | All user features + header admin icon (placeholder) | MVP: placeholder only |

**AI rate-limit:** 20 requests/IP/hour regardless of auth. Server enforces via IP-based Redis counter.

**Privacy:** `localStorage` data never uploaded without explicit user opt-in. No personal data sent to server except dua ID on AI Explain.

---

## 10. Edge Cases

| Case | Handling |
|---|---|
| `?cat={slug}` on page load → auto-activate filter | `applyFilter(slug)` called in `DOMContentLoaded`; sidebar + chip both updated |
| Filter + search active simultaneously | Both applied: `display:none` only if BOTH conditions fail |
| Same dua bookmarked in featured card AND grid card | Both share `data-dua-id`; on page load, all elements with matching ID get `.saved` class from single `localStorage` check |
| Streak: user visits twice in same day | `completedDates.includes(today)` guard; no duplicate increment |
| Streak: user skips 2+ days | `lastDate < yesterday` → `count = 1` (not 0); today starts new streak |
| Streak: first-ever visit | `localStorage` returns null → `defaultStreak()` → 0-day streak, all squares default state |
| Audio: two players open simultaneously | Opening a new player pauses and collapses the previous one |
| AI panel opened for dua without `related_ids` | "Related" section renders with generic KH link instead of dua-specific links |
| Share image: Amiri font not loaded | `Promise.race` timeout fires; system serif used; watermark always drawn last |
| Mobile: share drawer + AI panel both open | Only one overlay open at a time; opening second closes first |
| `prefers-reduced-motion` | All animations disabled or instant: `geoFloat`, progress bars, 3D tilt (P2), reveal transitions, streak square animations; `transition: none !important` |
| 3D tilt (P2): touch device | Disable via `'ontouchstart' in window` check — tilt is `mousemove`-only |
| Load More: `hasMore: false` | Hide Load More button permanently; do not re-fetch |
| `href="learn.html"` anywhere | CI linter fails build; correct target is always `islamic-studies.html` |
| Dua with no `audio_url` field | Play button renders disabled at initial render — no JS needed to disable, CSS `data-has-audio="false"` attribute controls opacity and cursor |

---

## 11. Performance

**Targets:** LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms, Lighthouse ≥ 90.

| Technique | Implementation |
|---|---|
| Theme no-flash | Inline `<script>` in `<head>` sets `data-theme` synchronously before CSS loads |
| Font preconnect | `<link rel="preconnect" href="https://fonts.googleapis.com">` + `fonts.gstatic.com crossorigin` in order: Cormorant Garamond → Inter → Amiri |
| Stats strip no-CLS | Fixed min-height on stat cells; values set after load without layout change |
| Featured dua no-CLS | Fixed card height in CSS; content swaps in-place on Previous/Next |
| Dua cards no-CLS | `auto-fill minmax(300px,1fr)` grid; card heights fixed via consistent content structure |
| AI Explain lazy | Anthropic API only called when panel opens; never on page load |
| Audio lazy | `Audio()` object created only when Play clicked; no preloading on grid render |
| Canvas: font await | `await document.fonts.ready` (3s race) before any `ctx.fillText` |
| Search: client-side | No API call on search — CSS `display:none` toggling only; instant response |
| Load More: 20/page | Initial render: 20 cards; subsequent loads: 20 each; CDN-cached responses |
| `IntersectionObserver` | Single instance per observer type; `unobserve` after `.in` applied |
| `will-change` | Applied to `.dua-card`, `.cat-card` during hover only; removed on `mouseleave` |
| No framework | Vanilla JS; no React/Vue; no build step in v1 |
| Quiz JSON lazy | N/A — no quiz on Dua page |

---

## 12. File Structure

```
project-root/
├── dua.html                          # Daily Duas page (blueprint: dua__1_.html)
├── src/
│   ├── css/
│   │   ├── tokens.css                # :root + [data-theme="dark"] (CLAUDE_v3.md §1)
│   │   ├── base.css                  # Reset, body, .shell, .container (shared)
│   │   ├── header.css                # Navbar, search popup, mobile menu (shared)
│   │   ├── hero-dua.css              # .hero, .hero-bg, .geo, Bismillah, CTAs
│   │   ├── stats-strip.css           # 4-cell stats, dividers, margin-top overlap
│   │   ├── featured-dua.css          # .featured-dua, dark gradient, glow overlays
│   │   ├── aq-divider.css            # .aq-divider arabesque ornament
│   │   ├── category-grid.css         # .cat-grid, .cat-card, hover spec, 12-card layout
│   │   ├── dua-layout.css            # .dua-layout flex, .dua-sidebar, .dua-main
│   │   ├── dua-sidebar.css           # .dsb-item, active state, streak tracker
│   │   ├── dua-search.css            # .dua-search-wrap, focus state, no-results
│   │   ├── filter-chips.css          # .cat-filter, .cat-chip, active state
│   │   ├── dua-card.css              # .dua-card anatomy, hover, all 6 action buttons
│   │   ├── dua-card-dark.css         # Dark mode overrides: arabic teal-300, hover glow
│   │   ├── note-editor.css           # .note-editor inline expansion, char counter
│   │   ├── audio-player.css          # Inline audio player, scrubber, speed selector
│   │   ├── ai-panel.css              # Slide-over panel, skeleton, error state, disclaimer
│   │   ├── share-drawer.css          # 6-option drawer, bottom sheet (mobile)
│   │   ├── load-more.css             # .load-more-wrap, spinner state
│   │   ├── cta-section.css           # .cta-section dark teal gradient (shared)
│   │   ├── footer.css                # #ii-footer ft-* system (shared)
│   │   ├── buttons.css               # .btn-primary/ghost/white-ghost (shared)
│   │   ├── cards.css                 # Base .card hover: glow ring, no shimmer (shared)
│   │   ├── chips.css                 # .chip variants (shared)
│   │   ├── reveal.css                # .reveal, .reveal-d1/d2/d3 (shared)
│   │   ├── toast.css                 # .toast component (shared)
│   │   └── responsive.css            # Breakpoints: 1100/900/760/700/640/440px
│   ├── js/
│   │   ├── theme.js                  # Inline <head> no-flash theme script (shared)
│   │   ├── header.js                 # Search popup, mobile menu, scroll state (shared)
│   │   ├── hero-scroll.js            # Browse Duas + By Occasion smooth-scroll wiring
│   │   ├── url-params.js             # ?cat= query param handling on page load
│   │   ├── filter.js                 # applyFilter(), sidebar+chip sync, active states
│   │   ├── search.js                 # Live search: input event, show/hide cards
│   │   ├── copy.js                   # copyDua(): clipboard API + execCommand fallback
│   │   ├── save.js                   # toggleSave(): localStorage + gold icon state
│   │   ├── notes.js                  # toggleNotes(), saveNote(), charCounter, dot indicator
│   │   ├── ai-explain.js             # openAIExplain(), POST /api/dua-explain, skeleton/error
│   │   ├── audio-player.js           # initAudioPlayer(), speed cycle, ARIA, keyboard nav
│   │   ├── share-drawer.js           # openShareDrawer(), 6 share methods, focus trap
│   │   ├── share-image.js            # generateShareImage(): canvas 7-layer composition
│   │   ├── featured-dua.js           # Prev/Next cycling, renderFeaturedDua()
│   │   ├── streak.js                 # loadStreak(), markTodayDone(), renderStreak()
│   │   ├── load-more.js              # loadMoreDuas(): fetch, append, hide on exhaustion
│   │   ├── save-on-load.js           # On DOMContentLoaded: apply saved/note states
│   │   ├── reveal.js                 # IntersectionObserver scroll reveal (shared)
│   │   ├── toast.js                  # showToast() utility (shared)
│   │   └── analytics.js              # GA4 event wrappers (all 8 kh_dua_* events)
│   └── locales/                      # i18n (future multilingual; English only v1)
├── public/
│   └── data/
│       └── duas-featured.json        # Static fallback featured dua pool
└── tests/
    ├── unit/
    │   ├── filter.test.ts
    │   ├── search.test.ts
    │   ├── copy.test.ts
    │   ├── save.test.ts
    │   ├── notes.test.ts
    │   ├── streak.test.ts
    │   ├── share-image.test.ts
    │   └── ai-explain.test.ts
    └── e2e/
        ├── dua-browse.spec.ts
        ├── dua-search-filter.spec.ts
        ├── dua-card-actions.spec.ts
        ├── dua-audio.spec.ts
        ├── dua-share.spec.ts
        ├── dua-streak.spec.ts
        ├── dua-dark-mode.spec.ts
        └── dua-accessibility.spec.ts
```

---

## 13. TypeScript Interfaces

```typescript
// ── Dua Data Model ────────────────────────────────────────────────
type OccasionSlug =
  | 'all' | 'morning-evening' | 'prayer' | 'sleep'
  | 'protection' | 'forgiveness' | 'knowledge' | 'illness'
  | 'food-drink' | 'travel' | 'family' | 'anxiety'
  | 'ramadan' | 'hajj-umrah' | 'general';

type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu';

interface DuaSource {
  book: string;           // "Qur'an" | "Sahih al-Bukhari" | …
  ref: string;            // "2:201" | "6306"
  collection: string;
  grade: HadithGrade;
  quran_link?: string;    // "quran.html?surah=2&ayah=201"
  hadith_link?: string;   // "hadith.html?ref=6306"
}

interface Dua {
  id: string;             // Stable slug e.g. "rabbana-atina-fid-dunya"
  arabic: string;         // Full text with diacritics; UTF-8; RTL
  transliteration: string;
  translation: string;
  source: DuaSource;
  occasion: OccasionSlug;
  category: OccasionSlug; // Maps to one of 12 category card slugs
  date_added: string;     // ISO "YYYY-MM-DD"
  audio_url?: string;     // CDN URL; absent = disabled player
  featured?: boolean;
  featured_date?: string;
  tags?: string[];
  related_ids?: string[];
}

// ── API Responses ─────────────────────────────────────────────────
interface DuaListResponse {
  duas: Dua[];
  total: number;
  hasMore: boolean;
  page: number;
}

interface FeaturedDuaResponse extends Dua {
  prevId: string;
  nextId: string;
}

// ── AI Explain ────────────────────────────────────────────────────
interface AIExplainRequest {
  duaId: string;
  arabicText: string;
  translation: string;
  source: string;          // Human-readable source string
}

interface AIExplainResponse {
  meaning: string;
  context: string;
  source: string;
  related: string;
  // disclaimer is NEVER from API — always hard-coded in template
}

// ── localStorage State ────────────────────────────────────────────
interface StreakData {
  count: number;
  lastDate: string | null;   // ISO "YYYY-MM-DD" of last completed day
  completedDates: string[];  // Array of ISO dates marked done
}

// ── Share Image ───────────────────────────────────────────────────
interface ShareImageData {
  arabic: string;
  transliteration: string;
  translation: string;
  sourceLabel: string;   // e.g. "Bukhari · 6306"
  duaId: string;
}

type ShareMethod = 'image' | 'copy-link' | 'whatsapp' | 'telegram' | 'x' | 'native';

// ── Filter / Search State ─────────────────────────────────────────
interface DuaFilterState {
  activeOccasion: OccasionSlug;
  searchQuery: string;
}

// ── Audio Player State ────────────────────────────────────────────
type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5;

interface AudioPlayerState {
  duaId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed;
}

// ── Notes ─────────────────────────────────────────────────────────
interface NoteState {
  duaId: string;
  text: string;          // Max 500 chars
  savedAt: number;       // Unix timestamp
}

// ── Category Card ─────────────────────────────────────────────────
interface CategoryCard {
  slug: OccasionSlug;
  label: string;
  icon: string;          // Emoji
  count: number;
  href: string;          // "dua.html?cat={slug}"
}
```

---

## 14. Testing

### 14.1 Unit Tests

| Module | Key Test Cases |
|---|---|
| `filter.js` | `applyFilter('morning-evening')` hides non-matching cards; sidebar + chip both get `.active`; `applyFilter('all')` shows all cards |
| `search.js` | Case-insensitive match; clearing input restores all cards; Arabic text matched in search; no-results state shows at 0 visible |
| `copy.js` | `navigator.clipboard.writeText` called with Arabic text; "Copied!" shown for 1500ms then reverts; `execCommand` fallback triggers when clipboard API unavailable |
| `save.js` | Toggle adds `.saved` + `localStorage.setItem`; toggle again removes both; on page load, pre-applies saved state to all matching cards |
| `notes.js` | Max 500 chars enforced; `QuotaExceededError` → error message; note dot appears when note exists; cancel does not persist |
| `streak.js` | First visit → 0-day streak; same-day interaction → no double-increment; skipped day → streak resets; `lastDate < yesterday` detection; `longestStreak` not in MVP (simple count) |
| `share-image.js` | Canvas size exactly 1080×1080; watermark always drawn last; `document.fonts.ready` awaited; fallback font used on timeout |
| `ai-explain.js` | Panel header always "AI-Assisted Explanation — Quranly AI"; disclaimer present regardless of API response; error state on 10s timeout; retry button re-fires fetch |

### 14.2 Integration Tests

- `?cat=morning-evening` URL on load → sidebar `Morning & Evening` active + matching filter chip active + grid filtered
- Featured dua Previous/Next cycling: index wraps correctly at pool boundaries
- Streak: view dua page → today `.today` square; perform Copy action → today `.done` square
- AI panel focus trap: Tab 15× → focus never leaves panel; Escape → closes; focus returns to "AI Explain" button
- Save + page reload: bookmark persists; icon pre-applied gold on next load
- Search + filter active simultaneously: only cards matching BOTH conditions visible

### 14.3 E2E Tests (Playwright)

| Scenario | Assertions |
|---|---|
| Hero CTAs scroll | "Browse Duas" → `#duas-section` in viewport; "By Occasion" → `#categories` in viewport |
| Category card click | Click "Morning & Evening" → navigates to `dua.html?cat=morning-evening`; grid shows only morning-evening duas |
| Sidebar occasion click | Click "Prayer" sidebar item → `.dsb-item` has `.active`; matching chip has `.active`; non-prayer cards hidden |
| Filter chip + sidebar sync | Click "Morning" chip → sidebar "Morning & Evening" item becomes active |
| Live search | Type "forgiveness" → non-matching cards `display:none`; matching visible; clear → all restored |
| Copy action | Click Copy on card → button shows "Copied!" 1500ms → reverts; clipboard contains Arabic text |
| Save bookmark | Click Save → icon gold; reload → icon still gold (localStorage persisted) |
| Unsave | Click gold Save again → icon default; `localStorage.getItem('dua-saved-{id}')` → null |
| Note editor | Click Notes → editor expands; type text → click Save → editor closes; note dot visible on card; reload → dot still present |
| AI Explain panel | Click AI Explain → panel slides in; header = "AI-Assisted Explanation — Quranly AI"; disclaimer visible; Escape → closes |
| Audio disabled | Dua without audio_url → Play button disabled (opacity 0.4); tooltip "Audio coming soon" on hover |
| Share drawer | Click Share → drawer opens with 6 options; Share as Image → canvas preview shown; Download → PNG downloaded |
| Watermark | Generated image contains "islamicinfo.org" text at bottom-right |
| Dark mode | Toggle → `data-theme="dark"` on `<html>`; Bismillah → gold gradient + glow; card hover → `rgba(88,193,199,.18)` |
| Mobile 640px | Dua grid single column; sidebar hidden; share drawer = bottom sheet |
| No-results state | Type "zzznomatch" → "No duas found for" message visible with clear button |
| Featured dua Previous/Next | Click Next → Arabic text changes; Previous → cycles back correctly |
| `?cat=` URL param | Navigate to `dua.html?cat=travel` → Travel filter pre-activated; only travel duas visible |

### 14.4 Accessibility Audit (axe-core, CI)

- Zero WCAG 2.1 AA violations
- `aria-label="Search duas"` on search input
- All `.dua-btn` and `.dua-icon-btn` have non-empty `aria-label`
- Arabic text elements have `lang="ar"` attribute
- Audio player: `aria-label="Play dua recitation"` (play btn), `aria-label="Audio progress"` (scrubber), `aria-label="Pause"` (pause btn)
- Bismillah element: `aria-label="Bismillah — In the name of Allah, the Most Gracious, the Most Merciful"`
- Share drawer + AI panel: focus trap verified with VoiceOver + NVDA
- Colour contrast: all body text ≥ 4.5:1 in both light and dark themes

### 14.5 Responsive Breakpoint Tests

| Breakpoint | Assertions |
|---|---|
| 1100px | Nav-link font 11.5px; footer 3-column |
| 900px | Sidebar hidden; `.dua-main` full width; `padding-left: 0` |
| 760px | Nav hidden; hamburger visible; only theme+search+hamburger in header |
| 700px | Stats strip 2×2; footer 2-column |
| 640px | Dua grid single column |
| 440px | Footer 1-column; all cards stack |
| 320px | No horizontal scroll; featured dua card readable; Arabic text at clamp minimum |

### 14.6 CI Automated Checks

| Check | Failure Condition |
|---|---|
| `href="learn.html"` linter | Any `href="learn.html"` present in codebase |
| `href="#"` linter | Any navigation/action `href="#"` in production code |
| No-shimmer check | Any `::after` sweep animation on card elements |
| Watermark guard | `generateShareImage()` output missing "islamicinfo.org" text |

### 14.7 Lighthouse CI Budget

```json
{
  "performance": 90,
  "accessibility": 90,
  "best-practices": 90,
  "seo": 90,
  "budgets": [
    { "resourceType": "script", "budget": 51200 },
    { "resourceType": "total", "budget": 600000 }
  ]
}
```

Run against `dua.html` on default load (all duas visible, light mode, no active filter).

---

*End of IslamicInfo Daily Duas Technical Specification*
*Ref: `dua__1_.html` · `CLAUDE_v3.md v3.0` · PRD v1.1 · Functional Document v1.0*
