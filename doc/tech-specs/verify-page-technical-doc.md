# Verify Page — Technical Document
**`verify.html` · IslamicInfo.org · Claim Verification Engine**
*v1.0 · 2026-05-20 · Based on PRD v1.1 + Functional Doc v1.0 + CLAUDE.md v3.0*

---

## 1. Purpose

`verify.html` is IslamicInfo's Islamic claim verification engine — nav position 9, between Habit Tracker and About. It is the platform's anti-misinformation tool.

**What it does:**
- Accepts any Islamic claim, hadith text, or social media quote in four modes: Hadith, Quote, Claim, Arabic
- Cross-references input against 61,000+ authenticated hadith and the full Qur'an
- Returns one of four scholarly grades: Ṣaḥīḥ / Ḥasan / Ḍaʿīf / Mawḍūʿ
- Displays animated confidence dial (0–100%), narration chain (Isnād), 4 evidence cards, and scholar consensus bar chart
- Explains methodology via 3-step cards and a 5-item FAQ accordion

**Hard editorial constraints:**
- Never issues fatwas, personal rulings, or religious opinions — cites sources only
- Disclaimer text is hard-coded in the template; never replaced or modified by API output
- Confidence score reflects scholarly consensus, not divine authority
- All grades come from classical scholar verdicts, not AI inference
- "Not Found" is a valid and clearly reported result

**In v1.0:** Verification uses a 2200ms simulated delay with static demo data. The `runVerify()` function structure is built for drop-in API swap.

---

## 2. UI Components

Design system locked to CLAUDE.md v3.0. All tokens, hover rules, animation curves, and the no-shimmer rule apply verbatim.

### 2.1 Global Shell
Standard across all IslamicInfo pages. Sticky header (60px), `.ambient` radial glow, `.shell` wrapper, `#mobileMenu` overlay.

### 2.2 Hero Section
**Element order inside `.hero-inner`:**
1. Bismillah — `.bismillah-hero-top` — teal clip-text (light) / gold + drop-shadow (dark)
2. Eyebrow badge — `.hero-badge` + `.badge-dot` pulse — *"Claim Verification Engine"*
3. `<h1 class="hero-title">` — *"Trust. "* + `<span class="grad-it">Verify.</span>` + *" Understand."*
4. Sub-text — `.hero-sub`
5. **Trust Strip** — embedded as last child of `.hero-inner`, `fadeUp 0.7s delay 0.35s`

**Floating decorators:** `.geo.g1` (28s, opacity 0.07), `.geo.g3` (32s delay -14s, opacity 0.055), `.geo.g4` (20s delay -7s, opacity 0.04).

### 2.3 Trust Strip (`.trust-strip`)
Horizontal flex row inside hero. Card background, `border-radius: var(--r-xl)`, `overflow:hidden`. Four `.trust-item` cells with `::before` vertical dividers. Wraps to 2×2 at ≤ 560px.

| Icon | ID/Stat | Number | Label |
|---|---|---|---|
| 📚 | — | `61K+` | Hadith |
| 📖 | — | `6,236` | Verses |
| ⚖️ | — | `6` | Collections |
| 🛡️ | — | `100%` | Source-Cited |

`.trust-num`: `var(--font-display)`, `clamp(18px,2.5vw,24px)`, `var(--teal-700)`. `.trust-label`: `9.5px`, uppercase.

### 2.4 Verify Box (`.verify-box`)
Primary interaction element. Inside `.page-container` (`max-width:1060px`, `padding-top:48px`, centered).

**Visual:** `rgba(255,255,255,.90)` + `backdrop-filter:blur(24px)`, `border:1px rgba(0,105,110,.18)`, `border-radius:28px`. Decorative `::before` radial glow top-right. Dark: `rgba(21,37,39,.92)`, border `rgba(0,105,110,.30)`. Entry: `.reveal`.

**Internal layout (top → bottom):**

**Mode selector row (`.verify-box-top`):** flex, space-between.
- Left: `.verify-box-label` — 11px uppercase teal, `::before` teal line accent
- Right: `.verify-modes` — 4 `.vmode` buttons

| Button | Mode | Default | onclick |
|---|---|---|---|
| Hadith | `hadith` | `.on` active | `setMode(this,'hadith')` |
| Quote | `quote` | Inactive | `setMode(this,'quote')` |
| Claim | `claim` | Inactive | `setMode(this,'claim')` |
| Arabic | `arabic` | Inactive | `setMode(this,'arabic')` |

**Textarea (`#verifyInput`):** `min-height:140px`, `max-height:440px`, `resize:vertical`. Font: `var(--font-serif)`, `18px`, italic, transparent bg. Default value on load: `"Did the Prophet say that seeking knowledge is a duty upon every Muslim?"`. Arabic mode: `direction:rtl; text-align:right; font-family:var(--font-arabic)`, placeholder → Arabic.

**Character counter (`.char-counter`):** `#charCount` (`.value.length`) + `#wordCount` (`.split(/\s+/).filter(Boolean).length`). Updates on every `input` event, no debounce. Both show `0` for empty string.

**Action bar (`.verify-actions`):** flex, wraps, top border `0.5px rgba(0,105,110,.10)`.

| Button | Class | onclick | Behavior |
|---|---|---|---|
| Voice | `.btn-side` | `pasteClipboard()` | `navigator.clipboard.readText()` → fill textarea + `updateCounter()`. On fail: `alert('Clipboard access denied')` |
| Sample | `.btn-side` | `loadSample()` | `ta.value = SAMPLES[sampleIdx % 5]; sampleIdx++; updateCounter(); ta.focus()` |
| Clear | `.btn-side` | `clearInput()` | `ta.value=''; updateCounter(); ta.focus()` |
| Verify Claim | `#verifyBtn .btn-verify` | `runVerify()` | Full verify sequence (see §3.3) |

**Quick example chips (`.quick-examples`):** 5 `.example-chip` pills, `onclick="useChip(this)"`. Chips: `"Cleanliness is half of faith"` · `"The best of people are most beneficial to others"` · `"Actions are by intentions"` · `"Smile at your brother is sadaqah"` · `"Seek knowledge even unto China"`.

### 2.5 Loading State (`#loadingState`)
`display:none` by default. Three `.ld` circles (10px, `var(--teal-500)`), `ldBounce` keyframe (`scale 0→1→0`, 1.2s). Stagger: `nth-child(2)` +0.2s, `nth-child(3)` +0.4s. Loading text: Cormorant 16px italic `var(--ink-muted)`.

### 2.6 Results Section (`#resultsSection`)
Visible on page load (pre-filled demo). Opacity transitions to 0 during verify, then back to 1. All children carry `.reveal` (threshold 0.06).

**Sub-components in order:**

**Divider label (`.divider-label`):** max-width 820px, centered. Gold gradient horizontal lines flanking `"✦ Analysis Complete"` in gold-700.

**Verdict banner (`.verdict-banner`):** max-width 820px. Three CSS class variants:

| Grade | Class | Background | Border | Icon |
|---|---|---|---|---|
| Ṣaḥīḥ | `.sahih` | `rgba(15,110,86,.08→.04)` | `rgba(15,110,86,.25)` | 🛡️ |
| Ḥasan | `.hasan` | `rgba(93,138,58,.08→.04)` | `rgba(93,138,58,.25)` | 🛡️ |
| Ḍaʿīf | `.daif` | `rgba(168,105,50,.08→.04)` | `rgba(168,105,50,.25)` | ⚠️ |
| Mawḍūʿ | (add) | `rgba(179,58,58,.08→.04)` | `rgba(179,58,58,.25)` | ✗ |

Anatomy: `.vb-icon` (48×48px, 14px radius) + `.vb-content` (`.vb-verdict` 10px + `.vb-title` 18px serif) + `.vb-badge` (grade pill, right-aligned).

**Result grid (`.result-grid`):** `1.4fr 1fr`, gap 20px, max-width 820px. Collapses to 1-col at ≤ 860px.
- **Left — `.result-card`:** `.summary` (Cormorant 15.5px, 1.68 line-height, inline `<em>` for grade names) + `.topic-chips` (`.chip-teal` + `.chip-gold` pills, teal border-top separator)
- **Right — `.dial-card`:** gold-tinted radial bg + gold border. Contains confidence dial SVG + grade pill + dial stats row

**Confidence dial (`.big-dial`, 164×164px):** SVG viewBox `0 0 180 180`. Background circle `r=76`, `stroke:rgba(0,105,110,.08)`, `stroke-width:14`. Progress arc `id="dialArc"` with gradient (`gold-500 → teal-700`), `stroke-dasharray:478`. Center overlay: `id="dialPct"` (42px serif) + "Confidence" label (9px). Initial `stroke-dashoffset: 478` (0% arc). `animateDial(80)` fires 600ms after page load.

**Narration chain (`.chain-section`):** max-width 820px. Teal-gold gradient bg, `border-radius:18px`. 5 `.cn-bubble` nodes connected by `.chain-arrow` (→):

| # | Text | Class | Color |
|---|---|---|---|
| 1 | Prophet ﷺ | `.cn-bubble.start` | Teal bg, teal-700 text, weight 600 |
| 2 | Anas ibn Mālik | `.cn-bubble` | `surface-card` bg |
| 3 | Hishām ibn ʿUmārah | `.cn-bubble` | `surface-card` bg |
| 4 | Ḥafṣ ibn Sulaymān | `.cn-bubble` | `surface-card` bg |
| 5 | Ibn Mājah · 224 | `.cn-bubble.end` | Gold bg, gold-700 text, weight 600 |

Each bubble has `.cn-role` below (9px uppercase) — Originator / Companion / Tābiʿī / Narrator / Collector.

**Evidence grid (`.evidence-grid`):** 2×2, gap 16px, max-width 820px. Collapses to 1-col at ≤ 680px.

| Card | Eyebrow | Left Border | Arabic | Source | Grade |
|---|---|---|---|---|---|
| 1 Primary | `.ev-eye-primary` (gold-700) | `3px var(--gold-500)` | `طَلَبُ الْعِلْمِ فَرِيضَةٌ` | Ibn Mājah · 224 | `.grade-hasan` |
| 2 Supporting | `.ev-eye-support` (teal-600) | `3px var(--teal-400)` | `اطْلُبُوا الْعِلْمَ` | al-Bayhaqī | `.grade-daif` |
| 3 Context | `.ev-eye-context` (ink-subtle) | None | (prose only) | Minhāj al-Ṭālibīn | — |
| 4 Qur'anic | `.ev-eye-quran` (grade-hasan) | `3px var(--grade-hasan)` | `يَرْفَعِ اللَّهُ...` | Al-Mujādilah 58:11 | `.grade-sahih` |

Card anatomy: `.ev-eyebrow` (`.ev-dot` + label) → `.ev-arabic` (Amiri 18px, RTL, teal-tinted bg) → `.ev-trans` (Cormorant 14px italic) → `.ev-footer` (`.ev-ref` + `.ev-grade` pill).

**Scholar consensus panel (`.consensus-section`):** `.consensus-card` with 4 `.cs-row` bars.

| Scholar | Bar Class | Target Width | Grade Label | CSS |
|---|---|---|---|---|
| Al-Albānī | `.cs-bar.hasan` | 80% | Ḥasan | `.cs-grade.h` |
| Ibn al-Qayyim | `.cs-bar.hasan` | 78% | Acceptable | `.cs-grade.h` |
| Ibn Ḥajar al-ʿAsqalānī | `.cs-bar.hasan` | 75% | Ḥasan li-Ghayrihi | `.cs-grade.h` |
| Al-Suyūṭī | `.cs-bar.sahih` | 82% | Ṣaḥīḥ | `.cs-grade.s` |

Bar gradients: `.hasan` = `var(--grade-hasan) → #8BBF5A`; `.sahih` = `var(--grade-sahih) → #2CAB87`. Animation on verify: reset all to `width:0` → `setTimeout(100ms)` → restore target widths → `transition:width 1s ease-reverent`.

**Disclaimer (`.disclaimer`):** Hard-coded, always visible. `12.5px`, `var(--ink-muted)`. `background:rgba(0,105,110,.04)`, `border-left:3px solid rgba(0,105,110,.2)`, `border-radius:12px`. Fixed text: `"⚠️ IslamicInfo does not issue fatwas or legal rulings. This analysis cites authenticated sources only and is for educational reference. For personal religious guidance, consult a qualified scholar. Confidence scores reflect scholarly consensus, not divine authority."`

**Try Another row:** Serif heading + 5 `.example-chip` pills: `"The best among you are those who learn the Quran"` · `"Actions are by intentions"` · `"Make things easy, not difficult"` · `"A smile at your brother is sadaqah"` · `"Whoever believes in Allah should speak good or be silent"`.

### 2.7 How It Works Section
Background `var(--surface-card)`. `.how-grid` — 3-column (collapses to 1-col at ≤ 720px). Each `.how-card`: `.how-step-num` (52px decorative, absolute top-right, 8% opacity) + `.how-icon` (46×46px teal gradient) + `.how-title` (Cormorant 18px) + `.how-desc`.

Steps: **01 Parse & Match** (magnifier SVG) → **02 Apply Hadith Grading** (scholars SVG) → **03 Cite, Never Rule** (shield SVG).

Card hover: `.how-icon` `scale(1.1) rotate(-5deg)` 0.3s. 3D tilt on `mousemove` (±5°/±7°), resets on `mouseleave` 0.38s ease-reverent.

### 2.8 FAQ Accordion (`.faq-section`)
Inside How It Works, `margin-top:40px`. 5 `.faq-item` elements separated by `0.5px rgba(0,105,110,.09)` borders. Each: `.faq-q` row (onclick `toggleFaq(this)`) + `.faq-a` panel (max-height `0→200px`, 0.38s) + `.faq-icon` (`+` → rotates 45° on open + teal bg).

### 2.9 CTA + Footer
CTA: deep teal gradient, 3 buttons — `.btn-primary` → `quran.html`, `.btn-white-ghost` → `hadith.html`, `.btn-white-ghost` → `dua.html`.

Footer: `ft-` CSS system. Col 2 heading: "Verify", 5 verify-specific links. Col 3: Quick Access (all 8). Col 4: Ecosystem (4 locked URLs). Col 5: Company + Legal.

---

## 3. Frontend Logic

All JS is a single `<script>` block at end of `<body>`. No framework. Constants defined at top of script block.

### 3.1 Constants
```js
const SAMPLES = [
  "Did the Prophet say that seeking knowledge is a duty upon every Muslim?",
  "The Prophet said: \"Cleanliness is half of faith.\" Is this authentic?",
  "\"Actions are judged by intentions, and each person will get what they intended.\" — Is this a hadith?",
  "Is it true the Prophet said smiling at your brother is an act of charity?",
  "\"The best of people are those who are most beneficial to others.\" — Where does this come from?"
];
let sampleIdx = 0;  // never resets; SAMPLES[sampleIdx % 5] wraps indefinitely
```

Default textarea value on load = `SAMPLES[0]`. First "Sample" click also loads `SAMPLES[0]` then increments to 1.

### 3.2 Init Sequence
```js
// Before body renders (inline <script> in <head>)
applyTheme(localStorage.getItem('islamicinfo-theme') || 'light');

// DOMContentLoaded
initReveal();          // IntersectionObserver threshold:0.06
initHeaderScroll();    // .scrolled class at scrollY > 16
initSearchPopup();     // #searchTrigger / #searchPopup open/close/Escape
initMobileMenu();      // openMM() / closeMM() / Escape
init3DTilt();          // .how-card mousemove / mouseleave

// After 600ms
setTimeout(() => animateDial(80), 600);
```

### 3.3 `runVerify()` — Full Sequence
```js
function runVerify() {
  const ta = document.getElementById('verifyInput');
  if (ta.value.trim() === '') return;   // empty guard

  const btn = document.getElementById('verifyBtn');
  const results = document.getElementById('resultsSection');
  const loading = document.getElementById('loadingState');

  // 1. Loading state
  btn.classList.add('loading');
  btn.textContent = 'Verifying...';
  results.style.opacity = '0';
  results.style.transition = 'opacity .3s';
  loading.style.display = 'block';

  // 2. Simulated API delay (replace with real Promise in production)
  setTimeout(() => {
    loading.style.display = 'none';
    results.style.opacity = '1';

    // 3. Restore button with SVG icon
    btn.classList.remove('loading');
    btn.innerHTML = `<svg width=14 height=14 viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg> Verify Claim`;

    // 4. Animate dial (from current offset — no manual reset)
    animateDial(80);

    // 5. Animate consensus bars: reset → 100ms delay → restore
    document.querySelectorAll('.cs-bar').forEach(b => b.style.width = '0');
    setTimeout(() => {
      document.querySelector('.cs-bar:nth-child(1)').style.width = '80%';
      document.querySelector('.cs-bar:nth-child(2)').style.width = '78%';
      document.querySelector('.cs-bar:nth-child(3)').style.width = '75%';
      document.querySelector('.cs-bar:nth-child(4)').style.width = '82%';
    }, 100);

    // 6. Scroll to results
    document.getElementById('resultsSection').scrollIntoView({
      behavior: 'smooth', block: 'start'
    });
  }, 2200);
}
```

**Production swap:** Replace the `setTimeout(fn, 2200)` block with:
```js
fetch('/api/verify', { method:'POST', body: JSON.stringify({ query: ta.value, mode: currentMode }) })
  .then(r => r.json())
  .then(data => populateResults(data))  // hydrates all result DOM elements
  .catch(err => showError(err))
  .finally(() => { loading.style.display='none'; btn.classList.remove('loading'); });
```

### 3.4 `animateDial(targetPct)`
```js
function animateDial(targetPct) {
  const arc = document.getElementById('dialArc');
  const pctEl = document.getElementById('dialPct');
  const offset = 478 - (478 * targetPct / 100);

  // Arc transition (CSS handles the 1.2s ease-reverent animation)
  arc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)';
  arc.style.strokeDashoffset = offset;

  // Count-up number via rAF
  let current = 0;
  function tick() {
    current = Math.min(current + 2, targetPct);
    pctEl.textContent = current + '%';
    if (current < targetPct) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
```

Note: `dialArc` initial `stroke-dashoffset` = `478` on page load (0% arc). `runVerify()` does **not** reset to 478 before calling `animateDial` — transition animates from current offset.

### 3.5 `useChip(el)`
```js
function useChip(el) {
  const ta = document.getElementById('verifyInput');
  ta.value = el.textContent.replace(/^"|"$/g, '').trim();
  updateCounter();
  ta.focus();
  const box = ta.closest('.verify-box');
  window.scrollTo({ top: box.offsetTop - 80, behavior: 'smooth' });
}
```
Uses `ta.closest('.verify-box')` — not a direct variable reference.

### 3.6 `setMode(btn, mode)`
```js
function setMode(btn, mode) {
  document.querySelectorAll('.vmode').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  currentMode = mode;  // module-scoped var for production API call

  const ta = document.getElementById('verifyInput');
  if (mode === 'arabic') {
    ta.style.direction = 'rtl';
    ta.style.textAlign = 'right';
    ta.style.fontFamily = 'var(--font-arabic)';
    ta.placeholder = 'أدخل النص العربي للحديث هنا...';
  } else {
    ta.style.direction = '';
    ta.style.textAlign = '';
    ta.style.fontFamily = '';
    ta.placeholder = "e.g., 'Did the Prophet ﷺ say that seeking knowledge is mandatory...'";
  }
}
```

### 3.7 `updateCounter()`
```js
function updateCounter() {
  const val = document.getElementById('verifyInput').value;
  document.getElementById('charCount').textContent = val.length;
  document.getElementById('wordCount').textContent =
    val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
}
// Bound to verifyInput 'input' event on DOMContentLoaded
document.getElementById('verifyInput').addEventListener('input', updateCounter);
```

### 3.8 `toggleFaq(el)`
```js
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}
```

### 3.9 `loadSample()` / `clearInput()` / `pasteClipboard()`
```js
function loadSample() {
  document.getElementById('verifyInput').value = SAMPLES[sampleIdx % 5];
  sampleIdx++;
  updateCounter();
  document.getElementById('verifyInput').focus();
}

function clearInput() {
  document.getElementById('verifyInput').value = '';
  updateCounter();
  document.getElementById('verifyInput').focus();
}

function pasteClipboard() {
  navigator.clipboard.readText()
    .then(text => {
      document.getElementById('verifyInput').value = text;
      updateCounter();
    })
    .catch(() => alert('Clipboard access denied'));
}
```

### 3.10 3D Tilt on How-Cards
```js
document.querySelectorAll('.how-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transition = 'transform 0.08s';
    card.style.transform =
      `translateY(-5px) scale(1.012) rotateX(${-y * 10}deg) rotateY(${x * 14}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.38s var(--ease-reverent)';
    card.style.transform = '';
  });
});
```

---

## 4. Backend Logic

`verify.html` is a static HTML page in v1. All result components are pre-populated with static demo data. The verification "backend" is a `setTimeout(2200ms)` simulation.

**Production architecture:**

```
Browser → POST /api/verify → Verification Service
                           → NLP tokenisation
                           → Hadith corpus search (61K+ records)
                           → Grade lookup (classical scholar verdicts DB)
                           → Return VerificationResult JSON
Browser ← populateResults(data) ← hydrates all result DOM components
```

**API key management:** No API keys exposed client-side. All corpus queries go through a server-side proxy endpoint. See §5 for the contract.

**Disclaimer rule:** The disclaimer text is never part of the API response. It is hard-coded in the HTML template and always rendered regardless of result state.

---

## 5. APIs

### 5.1 Verification Endpoint (Production)
```
POST /api/verify
Content-Type: application/json

Request:
{
  "query":  string,         // raw textarea value
  "mode":   "hadith" | "quote" | "claim" | "arabic",
  "lang":   "en" | "ar"    // derived from mode
}

Response:
{
  "verdict":     "sahih" | "hasan" | "daif" | "mawdu" | "not_found",
  "confidence":  number,          // 0–100
  "summary":     string,          // scholarly prose, may contain <em> tags
  "topicChips":  { teal: string[], gold: string[] },
  "chain":       ChainNode[],     // 3–6 nodes
  "evidence":    EvidenceCard[],  // 1–4 cards
  "consensus":   ScholarBar[],    // 1–4 scholars
  "dialStats":   { sources: number, grade: string, primary: string }
}
```

**Error responses:** `400 Bad Request` (empty query), `429 Too Many Requests` (rate limit), `503 Service Unavailable` (corpus search timeout).

**Rate limiting:** API is proxied server-side. Free tier: 10 requests/minute per IP. No API keys in client-side code.

### 5.2 No Other External APIs in v1
All corpus data (hadith, chain, grades) lives in the server-side database. No third-party enrichment APIs at launch.

---

## 6. Database

No database writes from `verify.html` in v1. All persistence is read-only corpus lookup on the backend.

**Client-side storage:**

| Key | Type | Purpose |
|---|---|---|
| `islamicinfo-theme` | `'light'|'dark'` | Theme preference, shared across all pages |

No verification history is stored in v1. Future: `localStorage` key `'ii-verify-history'` for saved results.

**Backend corpus (read-only, production):**

| Collection | Records | Source |
|---|---|---|
| Hadith corpus | 61,000+ | Six canonical collections (Kutub al-Sittah) + Musnad Aḥmad + al-Bayhaqī |
| Qur'an text | 6,236 verses | Standard Arabic text + English translations |
| Scholar grades | ~50,000 | Classical verdicts from al-Albānī, Ibn Ḥajar, al-Nawawī, al-Suyūṭī |
| Chain data | Per narration | Narrator biographies for Isnād display |

---

## 7. Validation

### 7.1 Verify Button — Empty Guard
```js
if (ta.value.trim() === '') return;  // no-op, no error shown in v1
```
In production: show inline validation hint below textarea. Do not trigger loading state.

### 7.2 Concurrent Verify Guard (Production)
```js
if (btn.classList.contains('loading')) return;  // add at top of runVerify()
```
In v1: not implemented. Button shows `.loading` visual state but does not block re-click.

### 7.3 Character/Word Counter
- Empty string: both `charCount = 0`, `wordCount = 0` (never NaN)
- Whitespace-only: `val.trim() === ''` → `wordCount = 0`
- Updates synchronously on every `input` event — no debounce needed (counter is cheap)

### 7.4 `quranGoal` Input (N/A for this page)
Not applicable — no numeric inputs on the Verify page.

### 7.5 Arabic Mode
- Textarea `direction:rtl` applied via JS style attribute — overrides CSS cleanly
- Placeholder text swapped synchronously in `setMode()`
- Mode state (`currentMode`) persists for duration of page session only; not stored in `localStorage`

### 7.6 API Response Validation (Production)
```js
function populateResults(data) {
  if (!data || !data.verdict) { showError('Invalid response'); return; }
  if (!['sahih','hasan','daif','mawdu','not_found'].includes(data.verdict)) {
    showError('Unknown verdict grade'); return;
  }
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100) {
    data.confidence = 0;  // safe fallback
  }
  // ... populate DOM
}
```

---

## 8. Error Handling

### 8.1 Clipboard Access Denied
```js
navigator.clipboard.readText()
  .then(text => { ta.value = text; updateCounter(); })
  .catch(() => alert('Clipboard access denied'));
```
In production: replace `alert` with inline toast notification below the Voice button.

### 8.2 API Failure (Production)
```js
fetch('/api/verify', ...)
  .catch(err => {
    loading.style.display = 'none';
    btn.classList.remove('loading');
    btn.innerHTML = '...Verify Claim';  // restore
    showErrorBanner('Verification service unavailable. Please try again.');
  });
```
Error banner: teal-left-bordered div shown below verify box. Does not replace disclaimer or results.

### 8.3 API Timeout (Production)
Set `AbortController` with 15s timeout. On abort: same error banner as §8.2.
```js
const controller = new AbortController();
const tid = setTimeout(() => controller.abort(), 15000);
fetch('/api/verify', { signal: controller.signal, ... })
  .finally(() => clearTimeout(tid));
```

### 8.4 "Not Found" Verdict State
When API returns `verdict: "not_found"`:
- Verdict banner: muted grey, icon ❓
- Dial: 0%
- Summary: *"This claim could not be matched to any authenticated source in our corpus. It may be fabricated (mawḍūʿ), apocryphal, or simply not recorded in the collections we reference."*
- Evidence grid: single "Not Found" card only
- Disclaimer: always shown regardless

### 8.5 Dark Mode FOUC Prevention
`applyTheme()` runs in an inline `<script>` in `<head>` before any body paint. Reads `localStorage.getItem('islamicinfo-theme') || 'light'` and sets `document.documentElement.setAttribute('data-theme', t)` immediately.

### 8.6 Verify During Existing Verify (v1)
In v1: no guard. The `setTimeout(2200ms)` races. Two concurrent timers will both try to show results. **Production fix:** Add `if (btn.classList.contains('loading')) return;` as first line of `runVerify()`.

---

## 9. RBAC

No authentication in v1. The Verify page is fully public and anonymous.

| Tier | Access | Status |
|---|---|---|
| Free (anonymous) | Full verification: paste claim, select mode, see results, read FAQ | ✓ Live |
| Premium (future) | Saved verification history, bulk CSV verification, citation PDF/WhatsApp export | Not built |

**Future auth scope:** When accounts are added, saved verifications persisted server-side under user ID. RBAC check on `POST /api/verify/save` and `GET /api/verify/history`. Free tier rate-limited; Premium tier higher limits.

---

## 10. Edge Cases

| Component | Scenario | Behaviour |
|---|---|---|
| Verify button | Empty textarea | `runVerify()` returns immediately; no loading state, no spinner, no toast |
| Verify button | Whitespace-only input | `trim() === ''` guard catches it; same as empty |
| Verify button | Re-click during 2200ms window (v1) | Two concurrent `setTimeout` timers; both fire; results show twice (production fix: §8.6) |
| Sample cycling | After 5th click | `sampleIdx % 5 = 0`; wraps back to sample 0; never throws out-of-bounds |
| `useChip` | Chip text has surrounding quotes | `replace(/^"|"$/g,'').trim()` strips them; textarea gets clean text |
| Arabic mode | User switches back to Hadith after typing Arabic | `setMode()` restores `direction:''`, `textAlign:''`, `fontFamily:''`; existing text remains |
| Confidence dial | Already at 80% before re-verify | Arc animates from current offset to new offset; smooth transition (no flash to 0%) |
| Confidence dial | `targetPct = 0` (Not Found) | `offset = 478`; arc fully empty; rAF counter shows 0% |
| Consensus bars | Bars at 0% during loading flash | Reset to `width:0` then 100ms delay before restore; no jarring jump |
| FAQ accordion | Two items open simultaneously | `toggleFaq()` closes all `.open` before toggling target — only one can be open |
| Trust strip | ≤ 560px viewport | Wraps to 2×2; `::before` dividers `display:none` |
| Evidence grid card 3 | No Arabic text (scholarly context) | `.ev-arabic` div absent; card renders prose-only layout cleanly |
| Mawḍūʿ verdict | Red color variant (✗ icon) | CSS class pattern `.daif` exists; `.mawdu` variant must be explicitly added in production |
| Narration chain | Result has no chain (Not Found) | `.chain-section` hidden; chain label shows "No narration chain available" |
| `pasteClipboard` | HTTPS not available (dev) | `clipboard.readText()` throws `NotAllowedError`; `catch()` shows alert |
| Loading dots | User closes tab during verify | `setTimeout` cleared by browser; no memory leak |

---

## 11. Performance

### 11.1 Targets
- LCP ≤ 2.5s
- CLS ≤ 0.1
- INP ≤ 200ms

### 11.2 Strategies

**Loading:**
- Font preconnect (`fonts.googleapis.com` + `fonts.gstatic.com`) in `<head>` before stylesheet link
- Single `<script>` at end of `<body>` — no render-blocking JS
- `applyTheme()` inline in `<head>` to prevent FOUC (1 line, no blocking)
- Page loads with static pre-filled result; no waiting for API call on initial load

**Animations:**
- Confidence dial: `stroke-dashoffset` CSS transition — SVG property, compositor-only (no layout reflow)
- Consensus bars: `width` CSS transition — layout change but contained to bar track; `will-change:width` on `.cs-bar`
- All card hovers on `transform` + `opacity` — compositor-only
- No `will-change` on `.verify-box` (large element; compositing cost would exceed benefit)

**Character counter:**
- No debounce on `input` — `val.length` and `split` on every keystroke is O(n) but n is bounded by `max-height:440px` (~2000 chars max). Acceptable.

**Reveal observer:**
- `IntersectionObserver` at `threshold:0.06`, `unobserve` after first trigger — cells released from observation as soon as they animate in

**3D tilt:**
- `mousemove` on `.how-card` only (3 elements) — no global `mousemove` listener
- `transition:0.08s` during move (imperceptible lag); `0.38s ease-reverent` on reset

**Dial init:**
- `setTimeout(600ms)` — deferred until after page paint; dial starts at 0%, animates to 80%

**Production API:**
- Debounce `runVerify()` if Search-As-You-Type is added later; for current click-to-submit pattern, no debounce needed
- API response cached per `(query, mode)` pair in server-side layer; client always fetches fresh

---

## 12. File Structure

```
islamicinfo.org/
├── verify.html                   ← this page (all CSS + JS inline in v1)
│
├── /api/                         ← server-side (production)
│   └── verify.js                 ← NLP + corpus search, returns VerificationResult
│
├── /db/                          ← production backend
│   ├── hadith/                   ← 61K+ hadith records, indexed by text + chain
│   ├── quran/                    ← 6,236 verses, indexed
│   └── grades/                   ← scholar verdict lookup table
│
├── /js/
│   └── verify.js                 ← (P2 refactor: extract inline JS)
│
└── /assets/
    └── fonts/                    ← Google Fonts via CDN preconnect
```

**Cross-page links from `verify.html`:**
- `quran.html` — CTA "Explore Qur'an"
- `hadith.html` — CTA "Hadith Library" + footer col 2
- `dua.html` — CTA "Dua Library"
- `hadith.html#grading` — footer "Hadith Grading Guide"
- `verify.html#methodology` — footer "Our Methodology" (self-link fragment)

---

## 13. TypeScript Interfaces

```typescript
// Verification request
interface VerifyRequest {
  query: string;
  mode:  'hadith' | 'quote' | 'claim' | 'arabic';
  lang:  'en' | 'ar';
}

// Full verification result from API
interface VerificationResult {
  verdict:    'sahih' | 'hasan' | 'daif' | 'mawdu' | 'not_found';
  confidence: number;           // 0–100, maps to dial %
  summary:    string;           // prose HTML, may contain <em>
  topicChips: { teal: string[]; gold: string[] };
  chain:      ChainNode[];      // 1–6 nodes
  evidence:   EvidenceCard[];   // 1–4 cards
  consensus:  ScholarBar[];     // 1–4 scholars
  dialStats:  DialStats;
}

// Verdict grade (maps to CSS class + color)
type VerdictGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'not_found';

interface GradeDisplay {
  cssClass:    string;           // '.sahih' | '.hasan' | '.daif'
  icon:        '🛡️' | '⚠️' | '✗' | '❓';
  badgeLabel:  string;           // 'Ṣaḥīḥ · Authentic' etc.
  bgColor:     string;           // rgba color string
  borderColor: string;
}

// Narration chain node
interface ChainNode {
  text:   string;                // e.g. 'Prophet ﷺ', 'Anas ibn Mālik'
  role:   string;                // 'Originator' | 'Companion' | 'Tābiʿī' | 'Narrator' | 'Collector'
  type:   'start' | 'default' | 'end';
}

// Evidence card
interface EvidenceCard {
  category:    'primary' | 'supporting' | 'context' | 'quranic';
  arabic?:     string;           // Amiri RTL text; absent for 'context'
  translation: string;           // may include contextual note
  sourceRef:   string;           // 'Ibn Mājah · 224' etc.
  grade:       VerdictGrade | null;
}

// Scholar consensus bar
interface ScholarBar {
  scholar:    string;
  barClass:   'sahih' | 'hasan' | 'daif';
  targetWidth: number;           // percentage 0–100
  gradeLabel:  string;           // 'Ḥasan', 'Acceptable', etc.
  gradeCSS:    'h' | 's' | 'd'; // .cs-grade.h / .s / .d
}

// Dial stats (bottom 3 cells)
interface DialStats {
  sources: number;
  grade:   string;
  primary: string;
}

// Confidence dial state
interface DialState {
  targetPct:      number;        // 0–100
  currentOffset:  number;        // stroke-dashoffset = 478 - (478 × pct/100)
  dashArray:      478;           // constant
}

// Mode state
type VerifyMode = 'hadith' | 'quote' | 'claim' | 'arabic';

// Page-level JS state (module-scoped vars)
interface VerifyPageState {
  sampleIdx:   number;           // increments only, never resets; % 5 wraps
  currentMode: VerifyMode;       // set by setMode()
  isLoading:   boolean;          // production: guard against concurrent verify
}

// localStorage (verify page contributes only theme)
interface LocalStorageSchema {
  'islamicinfo-theme': 'light' | 'dark';
  // Future:
  'ii-verify-history': VerificationResult[];
}
```

---

## 14. Testing

### 14.1 Unit Tests (Jest / Vitest)

| Function | Test cases |
|---|---|
| `updateCounter()` | Empty string → `charCount=0, wordCount=0`; single word → `1`; whitespace-only → `wordCount=0`; multi-word sentence → correct count |
| `useChip(el)` | Chip with quotes → strips to clean text; chip without quotes → text unchanged; triggers `updateCounter` |
| `setMode(btn, 'arabic')` | Textarea `direction='rtl'`; `fontFamily` = Amiri; placeholder = Arabic text; `.vmode.on` on arabic button only |
| `setMode(btn, 'hadith')` | Restores textarea `direction=''`; `.vmode.on` on hadith button; placeholder = English |
| `loadSample()` | First call → `SAMPLES[0]`; second → `SAMPLES[1]`; 6th → `SAMPLES[0]` (wraps at 5) |
| `animateDial(80)` | `dialArc.strokeDashoffset` = `478 - (478 * 0.8) = 96`; counter reaches 80 via rAF |
| `animateDial(0)` | Offset = 478; `dialPct` shows `0%` |
| `animateDial(100)` | Offset = 0; `dialPct` shows `100%` |
| `toggleFaq()` | Open item 1 → item 1 `.open`; open item 2 → item 1 closed, item 2 `.open`; re-open item 1 → toggle |
| `runVerify()` | Empty textarea → immediate return, no loading state; valid text → `.loading` on btn; after 2200ms → loading hidden, results visible |
| `clearInput()` | `ta.value = ''`; `charCount = 0`; `wordCount = 0` |

### 14.2 Integration Tests

| Scenario | Expected |
|---|---|
| Verify click with default text | Loading state shows → 2200ms → results at `opacity:1`; dial animates to 80%; consensus bars fill |
| Chip click → verify | Textarea populated, chip text clean; clicking Verify → same flow |
| Arabic mode → type → verify | Textarea RTL; `currentMode='arabic'` passed to API in production |
| Concurrent verify click | v1: two timers fire (known gap); production: second click blocked by `.loading` guard |
| Trust strip at 560px | 2×2 wrap; dividers hidden |
| Evidence grid at 680px | Collapses to 1 column |
| Result grid at 860px | 1.4fr/1fr → 1-col |
| FAQ open second item | First item closes; second opens; arrow rotates |
| Dark mode | Bismillah: gold gradient + drop-shadow; dial card: dark bg; evidence Arabic: `teal-300` |

### 14.3 E2E Tests (Playwright / Cypress)

| Flow | Steps | Pass condition |
|---|---|---|
| Primary verify flow | Load → click Verify Claim → wait 2200ms → observe results | Verdict banner `.hasan` visible; `#dialPct` = `80%`; 4 evidence cards visible |
| Empty submit guard | Clear textarea → click Verify Claim | No loading state; no spinner; `#loadingState` stays `display:none` |
| Chip → verify | Click "Actions are by intentions" chip → click Verify | Textarea = `Actions are by intentions`; verify runs |
| Sample cycle | Click Sample × 6 | Order: `SAMPLES[0,1,2,3,4,0]`; wraps correctly |
| Clipboard paste | Mock clipboard → click Voice | Textarea filled with mock text |
| Arabic mode | Click Arabic → observe textarea | `dir="rtl"`, Arabic placeholder visible |
| FAQ toggle | Click Q2 → click Q1 → click Q1 again | Q2 open; then Q1 open + Q2 closed; then Q1 closed |
| Dark mode | Toggle theme → reload | `[data-theme="dark"]` persists; Bismillah gold gradient |
| Mobile 375px | Load at 375px | No horizontal scroll; trust strip 2×2; verify-modes may wrap |

### 14.4 Pre-Launch QA Checklist

**Content (never auto-generated):**
- [ ] Disclaimer text is hard-coded, verbatim: `"⚠️ IslamicInfo does not issue fatwas..."`
- [ ] No result state replaces or hides the disclaimer
- [ ] `SAMPLES[0]` = default textarea value = `"Did the Prophet say that seeking knowledge is a duty upon every Muslim?"`

**Design (CLAUDE.md enforcement):**
- [ ] No shimmer `::after` on any card (light + dark)
- [ ] All hover transitions use `--ease-reverent` / `--ease-premium`
- [ ] Bismillah: teal gradient (light) / gold + drop-shadow (dark)
- [ ] Dial initial state: `stroke-dashoffset=478` (0% arc on page load); animates to 80% after 600ms
- [ ] Consensus bars: all bars start at 0% on verify, fill after 100ms delay

**Functionality:**
- [ ] Empty textarea → no-op (no error, no loading state)
- [ ] 5 mode buttons: only one `.on` at a time; Arabic mode → RTL textarea
- [ ] `sampleIdx` cycles correctly through 5 → wraps to 0
- [ ] `useChip()` strips surrounding quotes and scrolls to verify-box `offsetTop - 80`
- [ ] `animateDial()` counts from 0 to `targetPct` via rAF + sets correct `stroke-dashoffset`
- [ ] FAQ: only one item open at a time; `.faq-icon` rotates 45° on open

**Navigation:**
- [ ] All 10 nav items in order; `Verify` = `.active`; `islamic-studies.html` (never `learn.html`)
- [ ] `knowledge-hub.html` at position 5 — never omitted
- [ ] Footer: `ft-` CSS only; `quranlyai.com` (not `quranlya.com`); `LearnSpeakAI` (exact casing)
- [ ] Footer col 2 links: `hadith.html#grading` and `verify.html#methodology` fragments correct

**Responsive (all breakpoints):**
- [ ] 1100px, 900px, 860px, 760px, 720px, 700px, 680px, 560px, 440px — all verified in light + dark

---

*End of Verify Page Technical Document v1.0*
*IslamicInfo.org · `verify.html` · Design system: CLAUDE.md v3.0 · PRD: v1.1 · Func doc: v1.0*
