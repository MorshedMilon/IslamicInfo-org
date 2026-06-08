# IslamicInfo — Knowledge Hub Technical Specification

**Page:** `knowledge-hub.html` · **Route:** `/knowledge-hub`
**Blueprint:** `knowledge-hub.html` · **Design System:** `CLAUDE_v3.md v3.0` · **PRD:** v1.1 · **Status:** Implementation-Ready

---

## 1. Purpose

The Knowledge Hub is IslamicInfo's **free Islamic encyclopedia** — a premium trust-first discovery layer and platform gateway. It serves 2,400+ source-verified articles across every domain of Islamic knowledge and simultaneously pushes users into all other platform tools.

**Critical KH vs IS distinction (never violate):**

| Dimension | Knowledge Hub | Islamic Studies |
|---|---|---|
| Mental model | Library · Encyclopedia | School · Madrasa |
| Navigation | Free-form, any order | Sequential, prerequisite-gated |
| Article grids | ✅ Core feature | ❌ Never — absolute rule |
| Progress tracking | ❌ No | ✅ Yes |
| Correct `href` | `knowledge-hub.html` | `islamic-studies.html` (never `learn.html`) |

**Five core functions:**
1. **Search & discovery** — hero search + header popup both route to `/search.html?q=`
2. **Topic browsing** — 8 cluster cards, each navigating to `/cluster/{slug}.html`
3. **Content surfacing** — featured, trending, latest article grids all link to `/articles/{slug}.html`
4. **Platform gateway** — cross-link portals + footer push users into Quran, Hadith, Verify, IS
5. **Onboarding** — email capture + Start Here path for new Muslims

**KPIs (90-day targets):** Articles/session ≥ 2.5, search-submit rate ≥ 18%, cross-page nav ≥ 30%, email signups ≥ 15/1K UVs, bounce rate ≤ 42%, cluster CTR ≥ 14%.

---

## 2. UI Components

### 2.1 Page Section Order (immutable)

| # | Section | Class / ID | Priority |
|---|---|---|---|
| 1 | Global Header | `.site-header` | P0 |
| 2 | Hero | `.hero` | P0 |
| 3 | Live Ticker | `.ticker` | P0 |
| 4 | Stats Strip | `.stats-strip` | P0 |
| 5 | Featured Articles | `.featured-grid` | P0 |
| 6 | Cluster Grid | `.cluster-grid` | P0 |
| 7 | Trending Now | `.trending-section` | P0 |
| 8 | FAQ Block | `.faq-grid` | P0 |
| 9 | Latest Articles | `.articles-grid` | P1 |
| 10 | Scholar Spotlight | `.scholars-section` | P2 |
| 11 | Cross-Link Portals | `.portals-grid` | P0 |
| 12 | Global Regions | `.regions-grid` | P2 |
| 13 | New to Islam | `.new-to-islam` | P1 |
| 14 | CTA Section | `.cta-section` | P0 |
| 15 | Global Footer | `#ii-footer` | P0 |

### 2.2 Hero (Frozen content — never alter)

- **Bismillah:** first child of `.hero-inner`; Amiri; teal-gradient light / gold-gradient + glow dark
- **Badge:** "Islamic Knowledge Hub · Est. 2026" — pulsing gold dot
- **H1:** "Every Question. / *Every Answer. Verified.*" — `<span class="gradient-italic">` on line 2
- **Search pill** (`#heroSearch` inside `#heroSearchForm`): `max-width 640px`, placeholder "Search 2,400+ articles on Islam…"
- **7 trending tags** — `<a>` chips with direct article `href`s (see §5.1)
- **4 floating `.geo` SVG decorators** (`.g1`–`.g4`) with `geoFloat` keyframe — do not remove

### 2.3 Live Ticker

`.ticker-inner` contains items **duplicated** (first + second half identical) for seamless CSS loop.
- Animation: `tickerScroll` keyframe; `translateX(0 → -50%)`, 40s linear infinite
- Hover: `animation-play-state: paused`
- Each `.ticker-item` is an `<a>` tag (not a `<span>`) — all 8 wired to `/articles/{slug}.html`

### 2.4 Stats Strip

Five `.stat-cell` items. Values static until count-up is wired (P1):

| Stat | Value | Behaviour |
|---|---|---|
| Articles | 2,400+ | Count-up 0→2400, suffix `+` |
| Topic Clusters | 8 | Count-up 0→8 |
| Scholar Sources | 47+ | Count-up 0→47, suffix `+` |
| Countries Reached | 180+ | Count-up 0→180, suffix `+` |
| Ads. Fatwas. Bias. | 0 | Fixed — never animate, brand statement |

### 2.5 Featured Articles Grid

Layout: `1.5fr / 1fr` at ≥ 860px; stacks vertically below.
- **Main card** → `/articles/99-names-of-allah.html` (full card + "Read full article →" both linked)
- **4 side cards** → see §5.2 for exact URLs
- Side card icon: `scale(1.1) rotate(-4deg)` on hover

### 2.6 Cluster Grid

8 `.cluster-card` elements converted to `<a>` tags (replacing `onclick="filterCluster()"` placeholder).

| Cluster | Slug | Articles |
|---|---|---|
| Five Pillars | `five-pillars` | 342 |
| Qur'an & Revelation | `quran-revelation` | 287 |
| Prophets & Companions | `prophets-companions` | 214 |
| Islamic Law · Fiqh | `islamic-law-fiqh` | 398 |
| Faith & Theology | `faith-theology` | 265 |
| Islamic History | `islamic-history` | 311 |
| Spirituality & Character | `spirituality-character` | 189 |
| Islam in Modern Life | `islam-modern-life` | 247 |

Hover: `translateY(-5px) scale(1.012)` + teal glow ring + `::before` gradient overlay + icon `scale(1.12) rotate(-5deg)` + arrow slides in. **No shimmer `::after` sweep** (CLAUDE_v3.md §27.4 absolute ban).

### 2.7 Trending Now

8 `.trend-card` → `<a>` elements. See §5.3 for exact URLs. "See all trending →" → `/trending.html` (not `#`). Grid: 4-col ≥ 860px, 2-col 480–860px, 1-col below.

### 2.8 FAQ Block

8 `.faq-item` accordion items. Multiple may be open simultaneously (no auto-close). Each answer ends with "Read the full article →" `<a>` link. `.faq-source` chip per answer cites classical reference.

Toggle mechanism: click `.faq-q` → toggle `.faq-item.open` → `max-height: 0 → 300px` (400ms `var(--ease)`); chevron rotates 180°.

### 2.9 Latest Articles Grid

6 `.article-card` → `<a>` elements. 3-col ≥ 860px, 2-col 560–860px, 1-col below. See §5.4 for exact URLs.

### 2.10 Scholar Spotlight

4 scholar cards on dark teal gradient bg. Each: 72×72px avatar circle (teal/gold gradient) + Arabic initials (Amiri) + name + era + location + key work + field badge.

| Scholar | Initials | Era | Slug (P2) |
|---|---|---|---|
| Ibn Kathir | إك | 1300–1373 CE | `ibn-kathir` |
| Imam al-Bukhari | بخ | 810–870 CE | `al-bukhari` |
| Ibn Khaldun | خل | 1332–1406 CE | `ibn-khaldun` |
| Imam al-Ghazali | غز | 1058–1111 CE | `al-ghazali` |

Cards display-only at launch; link to `/scholars/{slug}.html` at P2.

### 2.11 Cross-Link Portals

3 `.portal-card` → full-card `<a>` elements:

| Portal | href | Hover glow |
|---|---|---|
| Quran Explorer | `quran.html` | teal |
| Hadith Library | `hadith.html` | gold |
| Verify a Source | `verify.html` | teal |

Hover: `translateY(-4px)` + colour-matched glow.

### 2.12 New to Islam

2-column (stacks ≤ 820px). Email form + 3 feature cards. Cards route: "Start with Foundations" → `/start-here.html#foundations` · "Common Questions" → `/start-here.html#faq` · "Source-Verified" → `/start-here.html#about`.

### 2.13 CTA Section

Dark teal gradient (`linear-gradient(135deg, #0A3A3D, #00696E, #062628)`). Last section before footer.
- `btn-primary` "Explore the Hub" → `href="#hero"` (scroll to top)
- `btn-white-ghost` "Islamic Studies →" → `href="islamic-studies.html"` (**never** `learn.html`)

---

## 3. Frontend Logic

### 3.1 Search Wiring

```js
function initSearch(formId, inputId) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  if (!form || !input) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (q.length >= 2) {
      window.location.href = '/search.html?q=' + encodeURIComponent(q);
    }
  });
  // Disable submit button until 2+ chars
  input.addEventListener('input', () => {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = input.value.trim().length < 2;
  });
}
initSearch('heroSearchForm', 'heroSearch');
initSearch('headerSearchForm', 'searchPopupInput');
```

Both entry points route to `/search.html?q={encoded-query}`. Empty / < 2-char submissions blocked.

### 3.2 Ticker Seamless Loop

```html
<div class="ticker-inner">
  <!-- HALF 1: 8 <a> items -->
  <!-- HALF 2: identical copy of HALF 1 -->
</div>
```

```css
@keyframes tickerScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ticker-inner { animation: tickerScroll 40s linear infinite; }
.ticker-inner:hover { animation-play-state: paused; }
```

`-50%` = width of one full set of items (half of duplicated content).

### 3.3 Cluster Grid Navigation

Replace all `onclick="filterCluster()"` placeholders:
```html
<!-- ❌ Current -->
<div class="cluster-card" onclick="filterCluster('pillars')">

<!-- ✅ Required -->
<a href="/cluster/five-pillars.html" class="cluster-card">
```

GA4 event fires on click:
```js
document.querySelectorAll('.cluster-card').forEach(card => {
  card.addEventListener('click', () => {
    gtag('event', 'kh_cluster_click', { cluster: card.dataset.cluster });
  });
});
```

### 3.4 Stats Count-Up (P1)

```js
function countUp(el, target, suffix = '', duration = 1800) {
  // Skip animation if prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target + suffix; return;
  }
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + suffix; clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + (current > target * 0.95 ? suffix : '');
    }
  }, 16);
}

// Wire to IntersectionObserver on .stats-strip entry
const statsIO = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  countUp(document.querySelector('[data-stat="articles"]'), 2400, '+');
  countUp(document.querySelector('[data-stat="clusters"]'), 8);
  countUp(document.querySelector('[data-stat="scholars"]'), 47, '+');
  countUp(document.querySelector('[data-stat="countries"]'), 180, '+');
  // "0 Ads" stat: never animate
  statsIO.disconnect();
}, { threshold: 0.5 });
statsIO.observe(document.querySelector('.stats-strip'));
```

### 3.5 FAQ Accordion

```js
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    q.closest('.faq-item').classList.toggle('open');
  });
});
// Keyboard: Enter / Space
q.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); q.click(); }
});
```

Multiple items open simultaneously — no auto-close logic.

### 3.6 Email Form

```js
async function submitEmail(email) {
  const feedback = document.getElementById('emailFeedback');
  const btn = document.getElementById('emailSubmitBtn');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    feedback.textContent = 'Please enter a valid email address.';
    feedback.className = 'email-feedback error'; return;
  }
  btn.disabled = true; btn.textContent = 'Sending…';

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, list: 'new-to-islam' })
    });
    if (!res.ok) throw new Error();
    document.getElementById('emailFormRow').innerHTML =
      '<p class="email-success">✓ Check your inbox! Your first email is on its way.</p>';
    gtag('event', 'kh_email_signup');
  } catch {
    feedback.textContent = 'Something went wrong — please try again.';
    feedback.className = 'email-feedback error';
    btn.disabled = false; btn.textContent = 'Get the Guide';
  }
}
```

### 3.7 Theme Toggle & No-Flash

```html
<!-- In <head> before any CSS link — prevents flash of wrong theme -->
<script>
  (function() {
    const t = localStorage.getItem('islamicinfo-theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

### 3.8 Bookmark (Article Page)

```js
function toggleBookmark(slug) {
  const key = 'islamicinfo-kh-bookmarks';
  const bookmarks = JSON.parse(localStorage.getItem(key) || '[]');
  const idx = bookmarks.indexOf(slug);
  if (idx === -1) bookmarks.push(slug); else bookmarks.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(bookmarks));
  showToast('Link copied ✦'); // reuse existing toast component
}
```

### 3.9 GA4 Event Tracking

| Event | Trigger | Parameters |
|---|---|---|
| `kh_search_submit` | Hero or header search submit | `{ query: string }` |
| `kh_cluster_click` | Cluster card click | `{ cluster: string }` |
| `kh_email_signup` | Successful email form submission | — |

---

## 4. Backend Logic

### 4.1 Email Subscription (`POST /api/subscribe`)

```
Body:  { email: string, list: 'new-to-islam' }
Response 200: { success: true }
Response 4xx: { error: string }
```

Proxy to configured email provider (Mailchimp / ConvertKit / Brevo — OQ-01 open). Validates email server-side before forwarding. No double-opt-in assumed at MVP; provider handles confirmation email.

### 4.2 Search (`GET /search.html?q=`)

Static page with client-side search for MVP. Search against a pre-built JSON index (`/data/search-index.json`) at page load.

```
Index entry: { slug, title, cluster, excerpt, tags[], readTime }
```

For Phase 2: replace with server-side Meilisearch / Algolia endpoint (`GET /api/search?q=&cluster=&page=`).

### 4.3 Article / Cluster / Scholar Pages

Static HTML files for v1 (one file per article/cluster/scholar). If CMS is used (OQ-02, OQ-07), templating generates these from a data source. No backend rendering required at launch.

### 4.4 SEO Schema Injection

`FAQPage` and `WebSite` JSON-LD schemas are hardcoded in `<head>` on `knowledge-hub.html`. `Article` and `BreadcrumbList` schemas are hardcoded per article page. No server-side generation required for static build.

---

## 5. APIs

### 5.1 Hero Tag Route Map (all P0)

| Tag | href |
|---|---|
| What is Zakat? | `/articles/what-is-zakat.html` |
| 99 Names of Allah | `/articles/99-names-of-allah.html` |
| Pillars of Islam | `/articles/five-pillars-of-islam.html` |
| Is music haram? | `/articles/is-music-haram-islam.html` |
| Prophet Muhammad ﷺ | `/articles/prophet-muhammad-biography.html` |
| Day of Judgment | `/articles/day-of-judgment-signs.html` |
| Ramadan guide | `/articles/ramadan-complete-guide.html` |

### 5.2 Featured Article URLs (all P0)

| Card | href |
|---|---|
| Main: 99 Names of Allah | `/articles/99-names-of-allah.html` |
| Golden Age of Islam | `/articles/golden-age-of-islam.html` |
| Halal & Haram Framework | `/articles/halal-haram-framework.html` |
| Tawakkul | `/articles/tawakkul-trusting-allah.html` |
| Ramadan Complete Guide | `/articles/ramadan-complete-guide.html` |

### 5.3 Trending Card URLs (all P0)

| Rank | href |
|---|---|
| 01 | `/articles/99-names-of-allah.html` |
| 02 | `/articles/is-music-haram-islam.html` |
| 03 | `/articles/how-to-calculate-zakat.html` |
| 04 | `/articles/how-many-surahs-in-quran.html` |
| 05 | `/articles/sunni-vs-shia-differences.html` |
| 06 | `/articles/how-to-perform-salah.html` |
| 07 | `/articles/islamic-mortgage-halal.html` |
| 08 | `/articles/who-was-ibn-battuta.html` |

### 5.4 Latest Article URLs (all P0)

| Card | href |
|---|---|
| Rightly-Guided Caliphs | `/articles/rightly-guided-caliphs.html` |
| Sabr | `/articles/sabr-patience-in-quran.html` |
| Islamic Finance | `/articles/islamic-finance-halal-transaction.html` |
| How to Take Shahada | `/articles/how-to-take-shahada.html` |
| Sunnah in Practice | `/articles/sunnah-obligatory-vs-recommended.html` |
| Day of Judgment | `/articles/day-of-judgment-signs.html` |

### 5.5 Ticker URLs (P1)

| Item | href |
|---|---|
| 99 Names of Allah | `/articles/99-names-of-allah.html` |
| How many times prayer in Quran | `/articles/how-many-times-prayer-in-quran.html` |
| Four Schools of Islamic Law | `/articles/four-schools-of-islamic-law.html` |
| Ibn Khaldun on civilization | `/articles/ibn-khaldun-civilization.html` |
| Zakat al-Fitr vs Zakat al-Mal | `/articles/zakat-al-fitr-vs-zakat-al-mal.html` |
| Night of Qadr | `/articles/night-of-qadr.html` |
| Tawakkul | `/articles/tawakkul-trusting-allah.html` |
| Islamic Finance | `/articles/islamic-finance-halal-transaction.html` |

### 5.6 FAQ Article Links (P0)

| Question | Article href |
|---|---|
| Five Pillars of Islam? | `/articles/five-pillars-of-islam.html` |
| How many surahs and verses? | `/articles/how-many-surahs-in-quran.html` |
| Sunni vs Shia? | `/articles/sunni-vs-shia-differences.html` |
| What does Bismillah mean? | `/articles/what-does-bismillah-mean.html` |
| How is Zakat calculated? | `/articles/how-to-calculate-zakat.html` |
| Four schools of Islamic law? | `/articles/four-schools-of-islamic-law.html` |
| Who was Prophet Muhammad ﷺ? | `/articles/prophet-muhammad-biography.html` |
| Is music haram? | `/articles/is-music-haram-islam.html` |

### 5.7 Email API

| Field | Value |
|---|---|
| Endpoint | `POST /api/subscribe` |
| Auth | API key (server-side env var — never exposed to client) |
| Timeout | 8s `AbortController` |
| Rate-limit | 5 submissions per IP per hour (server-enforced) |

---

## 6. Database

### 6.1 `localStorage` Keys

| Key | Type | Purpose |
|---|---|---|
| `islamicinfo-theme` | `'light' \| 'dark'` | Theme preference (shared with all pages) |
| `islamicinfo-kh-bookmarks` | `string[]` (article slugs) | Saved article bookmarks |

No server-side user database for KH in v1. All state is localStorage.

### 6.2 Search Index (`/data/search-index.json`)

```json
[
  {
    "slug": "99-names-of-allah",
    "title": "The 99 Names of Allah",
    "cluster": "faith-theology",
    "excerpt": "A complete guide to the Asma ul-Husna…",
    "tags": ["theology", "aqidah", "names"],
    "readTime": 12,
    "publishDate": "2026-05-01"
  }
]
```

Built at deploy time; updated when new articles are published.

### 6.3 FAQ Schema Data (in `<head>`)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are the Five Pillars of Islam?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Five Pillars are Shahada, Salah, Zakat, Sawm, and Hajj…"
      }
    }
    // 7 more entries — all 8 questions
  ]
}
```

Answer text is **plain text** (no HTML). Matches visible on-page text exactly.

---

## 7. Validation

### 7.1 Search Input

- Minimum 2 characters before submit is enabled
- Empty-string submissions blocked client-side (button disabled) and server-side (search API returns error if `q` is empty or < 2 chars)
- Query encoded via `encodeURIComponent()` before URL append

### 7.2 Email Input

| Check | Rule |
|---|---|
| Format (client) | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)` on blur and on submit |
| Format (server) | Re-validate before forwarding to email provider |
| Empty (client) | "Please enter a valid email address." shown; submit blocked |
| Server error | "Something went wrong — please try again." shown inline; no alert(), no reload |
| Rate-limit | 429 from server → same error message shown to user; no technical detail exposed |

### 7.3 FAQ Schema Integrity

Before deploy, run `Google Rich Results Test` against `knowledge-hub.html`:
- 0 errors, 0 warnings required
- Schema answer text matches visible on-page text exactly (automated diff check in CI)

### 7.4 Article Count Consistency

Cluster card article counts must match actual article count on the linked cluster page. Validation: CI script counts HTML files in each cluster directory and compares to displayed counts. Drift fails the build.

### 7.5 Link Audit

Pre-deploy automated check: every `href` in the 43 P0 link fixes (§5 above) resolves to an existing file. `href="#"` is blocked by linter rule in CI.

---

## 8. Error Handling

| Scenario | User-Facing Behaviour | Technical Handling |
|---|---|---|
| Search results page: fetch fails | "Something went wrong. Please try your search again." + retry button. No blank page, no console error exposed. | `catch` → error state component; retry re-triggers fetch |
| Search results: no results | "We don't have an article on '{query}' yet. Try browsing [cluster] or [Verify →]." | Empty array check after search; render no-results state |
| Search: `q` param missing on `/search.html` | Search bar rendered empty + focused; no error state | `new URLSearchParams(location.search).get('q')` null check → empty state |
| Article page 404 (slug not found) | Branded 404: "This article doesn't exist yet" + focused search bar + 3 suggested articles + link back to `knowledge-hub.html`. **Not** browser default 404. | Server or build-time: custom 404.html; never expose raw 404 |
| Article page slow network (> 3s) | "Taking longer than usual… still loading" inline message. No spinner-only blank state. | `setTimeout(3000)` → show slow-network message; clear on load |
| Email form: server error | "Something went wrong — please try again." inline below input. Button re-enabled. | `catch` → error state; `btn.disabled = false` |
| Email form: invalid format | "Please enter a valid email address." inline below input | Regex check on blur and submit |
| Email form: rate-limited (429) | Same "Something went wrong" message (no technical detail exposed) | `res.status === 429` → same error state |
| `localStorage` unavailable | Theme defaults to `'light'`; bookmarks silently non-functional | `try/catch` on all `localStorage` access |
| `localStorage` quota exceeded | Bookmark save fails silently (no user-visible error for bookmarks) | `QuotaExceededError` catch; no toast needed for bookmarks |
| Ticker: any JS error | Ticker degrades to static strip (non-breaking) | `try/catch` around ticker init; ticker is enhancement only |

---

## 9. RBAC

The Knowledge Hub is **fully public** — no authentication gate at any level.

| Role | Access | Notes |
|---|---|---|
| Guest | Full page; bookmarks in `localStorage` only | Default for all users |
| Authenticated User | All guest features + future cloud-sync for bookmarks | Out of scope for v1 |
| Admin | All user features + header admin icon | Placeholder in MVP |

No AI calls on the KH hub page. No rate-limiting except email endpoint (5/IP/hour).

**Privacy:** `localStorage` bookmarks are client-only. No personal data sent to server except email address on form submission (GDPR: form submission = consent, privacy policy linked in fine print).

---

## 10. Edge Cases

| Case | Handling |
|---|---|
| `href="learn.html"` still present in CTA or footer | CI linter fails build; correct target is `islamic-studies.html` |
| Ticker: user disables JS | Ticker strip renders statically (CSS only, no scroll); no broken layout |
| `prefers-reduced-motion` | All animations (geoFloat, tickerScroll, count-up, progress-bar, fadeUp, reveal) disabled or instant. `animation-play-state: paused !important` + `transition: none !important` |
| Cluster article count drift (displayed count ≠ actual) | CI diff check fails build; editorial must update count before merging new articles |
| FAQ schema text ≠ visible text | Automated diff check in CI; mismatch fails build (prevents Rich Results errors) |
| Search query with special characters (e.g. `?`, `&`, Arabic script) | `encodeURIComponent()` handles; search page decodes with `decodeURIComponent()` |
| Mobile: ticker tappable without accidental navigation | Ticker item tap targets ≥ 44px height; links are full-width |
| Dark mode applied before CSS loads | Inline `<script>` in `<head>` sets `data-theme` from `localStorage` synchronously — 0ms flash |
| Bookmark on article page when slug contains special chars | Slug is URL-safe ASCII only (validated at article creation) |
| Email already subscribed (provider returns 400) | Same success message shown (idempotent from user perspective); provider handles deduplication |
| Scholar cards at P2 (display-only at launch) | No broken `href`; cards render without `<a>` wrapper until P2 ships |
| Regions section at P3 (display-only) | Region cards are `<div>` not `<a>`; no broken links |
| Article page: Arabic text in `<title>` | `<title>` uses English article title only; Arabic preserved in `og:title` and H1 |

---

## 11. Performance

**Targets:** LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms, TTFB ≤ 800ms, Lighthouse ≥ 90.

| Technique | Implementation |
|---|---|
| Theme no-flash | Inline `<script>` in `<head>` reads `localStorage` and sets `data-theme` synchronously |
| Font preconnect | `<link rel="preconnect" href="https://fonts.googleapis.com">` + `fonts.gstatic.com crossorigin` in order: Cormorant Garamond → Inter → Amiri |
| Hero above-fold priority | Hero H1 text is inline; no deferred render; no font FOUT (fonts preconnected) |
| Ticker no-CLS | `.ticker` has fixed `height` in CSS; no layout shift when JS initialises |
| Stats strip no-CLS | Stat numbers have fixed min-height; count-up replaces text (no height change) |
| Count-up: `requestAnimationFrame` | `setInterval(16ms)` approximates rAF for count-up; no jank on scroll entry |
| Cluster grid images | Cluster icons are inline SVG or emoji — no image requests |
| Reveal animations | `.reveal` + single `IntersectionObserver` instance; `unobserve` after trigger; threshold 0.12 |
| FAQ `max-height` transition | No layout reflow; `overflow: hidden` prevents CLS on expand |
| Search index | `/data/search-index.json` fetched once on `/search.html` load; cached by CDN; ~15KB gzipped |
| Article page sidebar TOC | Generated from existing H2/H3 DOM nodes; no additional requests |
| Share image canvas | `await document.fonts.ready` (with `Promise.race` 3s timeout) before `canvas.drawText` |
| `will-change` | Applied only to cluster and portal cards during hover; removed on `mouseleave` |
| No JS framework | Vanilla JS; no React/Vue overhead; no build step required for v1 |

---

## 12. File Structure

```
project-root/
├── knowledge-hub.html                    # Hub page (source of truth: knowledge-hub.html mockup)
├── search.html                           # Search results page (P0)
├── trending.html                         # All trending articles (P1)
├── start-here.html                       # Beginner reading path (P1)
├── cluster/
│   ├── five-pillars.html                 # (P0)
│   ├── quran-revelation.html             # (P0)
│   ├── prophets-companions.html          # (P0)
│   ├── islamic-law-fiqh.html             # (P0)
│   ├── faith-theology.html               # (P0)
│   ├── islamic-history.html              # (P0)
│   ├── spirituality-character.html       # (P0)
│   └── islam-modern-life.html            # (P0)
├── articles/
│   ├── 99-names-of-allah.html            # (P0)
│   ├── what-is-zakat.html                # (P0)
│   ├── five-pillars-of-islam.html        # (P0)
│   ├── is-music-haram-islam.html         # (P0)
│   ├── prophet-muhammad-biography.html   # (P0)
│   ├── day-of-judgment-signs.html        # (P0)
│   ├── ramadan-complete-guide.html       # (P0)
│   ├── golden-age-of-islam.html          # (P0)
│   ├── halal-haram-framework.html        # (P0)
│   ├── tawakkul-trusting-allah.html      # (P0)
│   ├── how-to-calculate-zakat.html       # (P0)
│   ├── how-many-surahs-in-quran.html     # (P0)
│   ├── sunni-vs-shia-differences.html    # (P0)
│   ├── how-to-perform-salah.html         # (P0)
│   ├── islamic-mortgage-halal.html       # (P0)
│   ├── who-was-ibn-battuta.html          # (P0)
│   ├── rightly-guided-caliphs.html       # (P0)
│   ├── sabr-patience-in-quran.html       # (P0)
│   ├── islamic-finance-halal-transaction.html # (P0)
│   ├── how-to-take-shahada.html          # (P0)
│   ├── sunnah-obligatory-vs-recommended.html  # (P0)
│   ├── how-many-times-prayer-in-quran.html    # (P1)
│   ├── four-schools-of-islamic-law.html       # (P1)
│   ├── ibn-khaldun-civilization.html          # (P1)
│   ├── zakat-al-fitr-vs-zakat-al-mal.html     # (P1)
│   ├── night-of-qadr.html                     # (P1)
│   ├── what-does-bismillah-mean.html          # (P1)
│   └── [additional articles…]
├── scholars/
│   ├── ibn-kathir.html                   # (P2)
│   ├── al-bukhari.html                   # (P2)
│   ├── ibn-khaldun.html                  # (P2)
│   └── al-ghazali.html                   # (P2)
├── region/                               # (P3 — future)
│   └── {slug}.html
├── src/
│   ├── css/
│   │   ├── tokens.css                    # :root + [data-theme="dark"] (CLAUDE_v3.md §1)
│   │   ├── base.css                      # Reset, body, .shell, .container (shared)
│   │   ├── header.css                    # Navbar, search popup, mobile menu (shared)
│   │   ├── hero-kh.css                   # Hero, Bismillah, geo decorators, search pill, tags
│   │   ├── ticker.css                    # .ticker, tickerScroll keyframe, duplicate loop
│   │   ├── stats-strip.css               # 5-cell stat strip, count-up state
│   │   ├── featured-grid.css             # 1.5fr/1fr grid, main card, side cards
│   │   ├── cluster-grid.css              # 4-col grid, ::before overlay, arrow slide, hover
│   │   ├── trending-section.css          # 4-col grid, rank numbers, search volume badges
│   │   ├── faq-block.css                 # Accordion, chevron rotate, max-height transition
│   │   ├── articles-grid.css             # 3-col grid, article card anatomy
│   │   ├── scholars-section.css          # Dark teal bg, avatar circles, field badges
│   │   ├── portals-grid.css              # 3-col portal cards, colour-matched hover glows
│   │   ├── regions-grid.css              # 6-col grid, region cards (display-only v1)
│   │   ├── new-to-islam.css              # 2-col layout, email form, feature cards
│   │   ├── cta-section.css               # Dark teal gradient CTA (shared)
│   │   ├── footer.css                    # ft-* CSS system (shared)
│   │   ├── article-page.css              # /articles/{slug}.html: 2-col, sidebar, TOC
│   │   ├── cluster-page.css              # /cluster/{slug}.html: hero, filter chips, grid
│   │   ├── search-page.css               # /search.html: result cards, filter chips, no-results
│   │   ├── ikhtilaf-box.css              # Scholarly disagreement box (gold border/bg)
│   │   ├── buttons.css                   # .btn-primary/ghost/white-ghost (shared)
│   │   ├── cards.css                     # Base .card hover — glow ring (shared)
│   │   ├── chips.css                     # .chip, filter chips (shared)
│   │   ├── reveal.css                    # .reveal, .reveal-d1/d2/d3/d4 (shared)
│   │   ├── toast.css                     # .toast component (shared)
│   │   └── responsive.css                # Breakpoints: 1100/900/760/700/440px
│   ├── js/
│   │   ├── theme.js                      # Inline <head> no-flash theme (shared)
│   │   ├── header.js                     # Search popup, mobile menu, scroll state (shared)
│   │   ├── search.js                     # initSearch(), both form entry points
│   │   ├── ticker.js                     # Ticker init, duplicate check, hover pause
│   │   ├── stats-countup.js              # countUp(), IntersectionObserver on .stats-strip
│   │   ├── cluster-nav.js                # Replace onclick placeholders; GA4 event
│   │   ├── faq-accordion.js              # Toggle .open, keyboard (Enter/Space)
│   │   ├── email-form.js                 # submitEmail(), validation, success/error states
│   │   ├── bookmark.js                   # toggleBookmark(), localStorage read/write
│   │   ├── share-image.js                # Canvas modal, square/story formats (shared)
│   │   ├── search-page.js                # /search.html: URL param, index query, filter chips
│   │   ├── article-page.js               # TOC generation, sticky sidebar, share actions
│   │   ├── schema-inject.js              # Runtime FAQ schema check (dev mode only)
│   │   ├── reveal.js                     # IntersectionObserver scroll reveal (shared)
│   │   ├── toast.js                      # showToast() utility (shared)
│   │   └── analytics.js                  # GA4 event wrappers (kh_search_submit, kh_cluster_click, kh_email_signup)
│   └── locales/                          # i18n JSON (future multilingual; English only in v1)
├── data/
│   ├── search-index.json                 # Pre-built article index for client-side search
│   └── og/
│       └── knowledge-hub-og.jpg          # 1200×630px OG image (≤ 300KB)
├── sitemap.xml                           # All KH URLs, hub priority 1.0
└── tests/
    ├── unit/
    │   ├── search.test.ts
    │   ├── email-form.test.ts
    │   ├── stats-countup.test.ts
    │   ├── faq-accordion.test.ts
    │   └── bookmark.test.ts
    ├── e2e/
    │   ├── kh-hub.spec.ts
    │   ├── kh-search.spec.ts
    │   ├── kh-cluster.spec.ts
    │   ├── kh-article.spec.ts
    │   ├── kh-dark-mode.spec.ts
    │   └── kh-accessibility.spec.ts
    └── ci/
        ├── link-audit.ts                 # Verify all 43 P0 hrefs resolve
        ├── faq-schema-diff.ts            # Schema text == visible text
        └── article-count-sync.ts         # Cluster counts == actual file counts
```

---

## 13. TypeScript Interfaces

```typescript
// ── Articles ─────────────────────────────────────────────────────
type ClusterSlug =
  | 'five-pillars' | 'quran-revelation' | 'prophets-companions'
  | 'islamic-law-fiqh' | 'faith-theology' | 'islamic-history'
  | 'spirituality-character' | 'islam-modern-life';

interface ArticleCard {
  slug: string;
  title: string;
  cluster: ClusterSlug;
  excerpt: string;
  readTime: number;       // minutes; ceil(wordCount / 238)
  publishDate: string;    // ISO "YYYY-MM-DD"
  arabicGhost?: string;   // optional Arabic ghost text for card bg
  sourceCount: number;
}

interface ArticleDetail extends ArticleCard {
  h1: string;
  body: string;           // HTML string
  arabicQuotes: ArabicQuote[];
  citations: Citation[];
  bibliography: BibliographyEntry[];
  topics: string[];
  relatedSlugs: string[];
  updatedDate?: string;
}

interface ArabicQuote {
  arabic: string;
  translation: string;
  transliteration?: string;
}

interface Citation {
  scholar: string;
  book: string;
  reference: string;
  format: string;         // "[📚 Source: {scholar} · {book} · {ref}]"
}

interface BibliographyEntry {
  index: number;
  scholar: string;
  work: string;
  reference: string;
}

// ── Clusters ─────────────────────────────────────────────────────
interface ClusterCard {
  slug: ClusterSlug;
  name: string;
  arabicName: string;
  icon: string;           // emoji or SVG path
  description: string;
  articleCount: number;
  href: string;           // `/cluster/{slug}.html`
}

// ── Trending ──────────────────────────────────────────────────────
interface TrendingArticle extends ArticleCard {
  rank: number;           // 01–08
  monthlySearches: string; // e.g. "142K"
  clusterLabel: string;
}

// ── FAQ ───────────────────────────────────────────────────────────
interface FaqItem {
  question: string;
  answer: string;         // Plain text for schema; HTML allowed for rendered version
  sourceChip: string;     // e.g. "Sahih al-Bukhari #8"
  articleSlug: string;    // "Read full article →" destination
}

// ── Scholars ──────────────────────────────────────────────────────
interface ScholarCard {
  slug: string;
  name: string;
  arabicInitials: string;
  eraCE: string;          // "1300–1373 CE"
  location: string;
  keyWork: string;
  fieldBadge: string;
  avatarVariant: 'teal' | 'gold';
}

// ── Search ────────────────────────────────────────────────────────
interface SearchIndexEntry {
  slug: string;
  title: string;
  cluster: ClusterSlug;
  excerpt: string;
  tags: string[];
  readTime: number;
  publishDate: string;
}

interface SearchResult extends SearchIndexEntry {
  matchRanges?: { field: 'title' | 'excerpt'; start: number; end: number }[];
}

interface SearchPageState {
  query: string;
  activeFilter: ClusterSlug | 'all';
  results: SearchResult[];
  isLoading: boolean;
  hasError: boolean;
}

// ── Email Form ────────────────────────────────────────────────────
interface EmailFormState {
  value: string;
  status: 'idle' | 'loading' | 'success' | 'error' | 'invalid';
  errorMessage?: string;
}

interface SubscribeRequest {
  email: string;
  list: 'new-to-islam';
}

// ── Bookmarks ─────────────────────────────────────────────────────
type KhBookmarks = string[];  // Array of article slugs
// localStorage key: 'islamicinfo-kh-bookmarks'

// ── SEO / Schema ─────────────────────────────────────────────────
interface FaqSchemaQuestion {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;         // plain text — no HTML
  };
}

interface FaqPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: FaqSchemaQuestion[];
}

interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  author: { '@type': 'Organization'; name: 'IslamicInfo' };
  datePublished: string;
  dateModified?: string;
  citation?: string[];
}

// ── Portals ───────────────────────────────────────────────────────
interface PortalCard {
  id: 'quran' | 'hadith' | 'verify';
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  hoverGlowColour: string;
}

// ── Regions (display-only v1) ─────────────────────────────────────
interface RegionCard {
  slug: string;
  name: string;
  flag: string;
  contentFocus: string;
  monthlyReaders: string; // "380K"
  futureHref: string;     // `/region/{slug}.html` — P3
}

// ── Cross-page navigation ─────────────────────────────────────────
interface KhDeepLink {
  // From Islamic Studies lesson "Read →" clicks
  lessonParam?: string;   // `?lesson={track-slug}-{lessonIndex}`
  // From IS KH handoff pills
  anchor?: string;        // `#pillars`, `#aqidah`, etc.
}
```

---

## 14. Testing

### 14.1 Unit Tests

| Module | Key Test Cases |
|---|---|
| `search.js` | Empty query blocked (< 2 chars); `encodeURIComponent` applied; correct URL generated; Arabic query encoded correctly |
| `email-form.js` | Invalid format shows error; empty submission blocked; server error → inline message (no alert/reload); success → input replaced; 429 → error message (no technical detail) |
| `stats-countup.js` | Count reaches target exactly; `+` suffix applied; "0 Ads" stat never animated; `prefers-reduced-motion` → value set immediately without animation |
| `faq-accordion.js` | Toggle open/close; multiple items open simultaneously; Escape does not close FAQ (only closes search popup / mobile menu); keyboard Enter/Space toggles correctly |
| `bookmark.js` | Add and remove article slug; deduplication (adding same slug twice = one entry); `QuotaExceededError` caught silently |

### 14.2 CI Automated Checks

| Check | Failure Condition |
|---|---|
| `link-audit.ts` | Any of the 43 P0 `href` values does not resolve to an existing file |
| `href="learn.html"` linter | Any `href="learn.html"` present anywhere in the codebase |
| `href="#"` linter | Any `href="#"` on navigation elements (except internal scroll anchors) |
| `faq-schema-diff.ts` | FAQ schema `text` does not match visible on-page answer text (normalised whitespace) |
| `article-count-sync.ts` | Cluster card article count ≠ number of HTML files in `/articles/` matching that cluster |
| `onclick="filterCluster` linter | Any `onclick="filterCluster(` present — must be replaced with `<a>` tags |
| Schema validation | `FAQPage` JSON-LD passes `Google Rich Results Test` with 0 errors |

### 14.3 E2E Tests (Playwright)

| Scenario | Assertions |
|---|---|
| Hero search submit | Type "zakat" → click "Search Hub" → navigates to `/search.html?q=zakat` |
| Hero search: < 2 chars | Type "z" → "Search Hub" button is `disabled` |
| Hero tag click | Click "99 Names of Allah" chip → navigates to `/articles/99-names-of-allah.html` |
| Cluster card click | Click "Five Pillars" card → navigates to `/cluster/five-pillars.html`; GA4 event `kh_cluster_click` fired |
| Trending #01 card | Click → navigates to `/articles/99-names-of-allah.html` |
| "See all trending →" | Click → navigates to `/trending.html` (not `#`) |
| FAQ accordion | Click question 1 → `.faq-item` has class `open`; chevron rotated 180°; clicking question 2 does NOT close question 1 |
| FAQ "Read full article" | Click link in FAQ 1 answer → navigates to correct article URL |
| CTA "Islamic Studies →" | Click → navigates to `islamic-studies.html` (not `learn.html`) |
| Ticker pause | Hover `.ticker-inner` → `animation-play-state: paused` |
| Email form: valid submission | Type valid email → click "Get the Guide" → success message shown; input row replaced |
| Email form: invalid email | Type "notanemail" → click → error message "Please enter a valid email address." |
| Dark mode | Set `localStorage['islamicinfo-theme'] = 'dark'` → reload → `data-theme="dark"` on `<html>` with 0 flash |
| Dark mode: card hover glow | Hover cluster card in dark mode → `box-shadow` contains `rgba(88,193,199,.18)` |
| No shimmer | Hover any card → no `::after` sweep animation present (computed style check) |
| Search page: pre-populated | Navigate to `/search.html?q=prayer` → input value = "prayer"; result count visible |
| Search page: no results | Navigate to `/search.html?q=zzzzunknown` → no-results state shows with Verify link |
| Article page: 404 | Navigate to `/articles/does-not-exist.html` → branded 404; search bar focused; 3 suggested articles visible |
| Article page: copy link | Click "Copy link" → clipboard contains article URL → toast "Link copied ✦" visible |
| Mobile 440px | Cluster grid 1-col; trending grid 1-col; footer 1-col; no horizontal overflow |
| Keyboard navigation | Tab through all interactive elements in logical order; Enter activates FAQ items |
| `prefers-reduced-motion` | All animations computed as `none` or `0s` under OS reduced-motion setting |

### 14.4 Accessibility Audit (axe-core, CI)

- Zero WCAG 2.1 AA violations on `knowledge-hub.html` and all child page templates
- Manual checks: `aria-label` on search inputs; Bismillah `aria-label="Bismillah"`; all `<a>` elements have non-empty accessible text; colour contrast all body text ≥ 4.5:1 in both themes
- Mobile menu: no keyboard trap (Escape closes; all links reachable via Tab)

### 14.5 SEO Validation (pre-launch)

- Google Rich Results Test: `FAQPage` schema → 0 errors, 0 warnings
- `og:image` renders correctly at 1200×630 and 600×315 (half-size preview)
- `twitter:card: summary_large_image` displays in Twitter card validator
- All cluster and article pages in `sitemap.xml` with correct priorities
- No `href="learn.html"` or `href="#"` on navigational elements (CI linter)

### 14.6 Lighthouse CI Budget

```json
{
  "performance": 90,
  "accessibility": 90,
  "best-practices": 90,
  "seo": 90,
  "budgets": [
    { "resourceType": "script", "budget": 51200 },
    { "resourceType": "total",  "budget": 600000 }
  ]
}
```

Run against `knowledge-hub.html` and `/articles/99-names-of-allah.html` (representative article benchmark).

---

*End of IslamicInfo Knowledge Hub Technical Specification*
*Ref: `knowledge-hub.html` · `CLAUDE_v3.md v3.0` · PRD v1.1 · Functional Document v2.0*
