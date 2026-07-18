# QuranlyAI Frontend Integration — Design

- **Date:** 2026-07-17
- **Status:** Approved (design), pending implementation plan
- **Scope:** Vanilla-JS frontend layer that connects IslamicInfo.org pages to the QuranlyAI backend (`POST /api/quranlyai/ask`)
- **Backend spec:** `doc/superpowers/specs/2026-07-17-quranlyai-ask-backend-design.md`
- **Related docs:** `doc/DESIGN-SYSTEM.md`, `doc/CONTENT-POLICY.md` (§3/§4/§8), `doc/API-SPEC.md`

---

## 1. Purpose

Add a single shared vanilla-JS module — loaded as a plain `<script>` on any page — that
lets a user ask QuranlyAI about whatever they are viewing (a verse, hadith, dua, article,
or search). It renders a floating button and a slide-out panel, streams the backend's SSE
response, and lets each page register its current context and embed inline "✨ Ask" buttons.
No React, no bundler, no build step.

This is the frontend counterpart to the already-built backend endpoint. The backend is
**not deployed yet** (KV namespace + `ANTHROPIC_API_KEY` deferred), so this layer is built
against the SSE contract and verified with a local mock; live e2e is deferred with the
backend.

---

## 2. Reconciliation with the task brief

| Brief said | Reality / decision |
|---|---|
| Deliverables list mentions "QuranlyAIProvider + context hook", "ContextButton component" | React leftovers — **ignored**. This is vanilla JS only. |
| Deliverables re-list the backend route + SQL cache/quota tables | Backend already built last session as **KV** (not SQL). **Out of scope** here. |
| `packages/quranly-ai-core` standalone package (§8) | **Deferred (YAGNI).** Pure logic lives in `quranly-ai-core.js`, portable enough for future QuranlyAI.com reuse without a `packages/` restructure now. |
| Streaming = "TextDecoderStream + append chunks" (raw text) | Backend emits **SSE** (`data: {"delta":…}` + terminal `event: done`). Renderer parses SSE frames, not raw text. |
| Pages fetch relative `/api/…` | Worker is a **different origin**; module calls an **absolute `apiBase`** (default `https://api.islamicinfo.org`, overridable via `init`). |
| FAB checks `id="audio-player"` | Repo has **`class="audio-player"`** only (on `quran.html`); FAB checks `#audio-player` then `.audio-player`. |
| Quota "7 of 10 remaining" | Guest limit is **3/day**; quota shown from each `done` event's `remaining`. |
| Load path `/js/…` | Repo convention is **`src/js/…`** (relative, no leading slash). |

---

## 3. Locked decisions

1. **Vanilla JS only.** Classic IIFE scripts, `window.QuranlyAI` global, no ES modules/bundler. Pure logic in a UMD `-core.js` for `node:test`.
2. **Coexist with the old panel.** The existing per-verse `.ai-card` (`quran-ai.js`, `/api/ask-claude`) is left untouched and working. This module is purely additive. No live page HTML is edited in this task.
3. **Web Components + Shadow DOM** for the panel (and the floating button), so styles/scripts don't leak into or out of the host page.
4. **Lazy-load the panel.** Only `quranly-ai-core.js` + `quranly-ai.js` load on every page. The panel component JS and its CSS load on first interaction.
5. **`apiBase` default** `https://api.islamicinfo.org`, overridable via `init({apiBase})`.
6. **Anonymous id** generated client-side: `crypto.randomUUID()` stored under `localStorage['ii-anon-id']` (not PII; consistent with the `ii-` key convention and ADR-002 "no accounts").
7. **AI accent = gold** (`--gold-500`), consuming design tokens through the shadow boundary; dark mode flips automatically via inherited `[data-theme="dark"]` vars.

---

## 4. File layout

```
src/js/quranly-ai-core.js    Pure UMD logic (no DOM) — unit-tested with node:test
src/js/quranly-ai.js         Always-loaded: window.QuranlyAI + <quranly-floating-button> + FAB
                             positioning + lazy panel loader
src/js/quranly-ai-panel.js   Lazy-loaded once: <quranly-panel> (Shadow DOM) + streaming render
src/css/quranly-ai.css       Panel styles (design tokens); adopted into the shadow root on open
tests/quran/quranly-ai-core.test.js   Unit tests
tools/quranly-ai-demo.html   Standalone manual harness (+ a tiny local Node SSE mock)
doc/quranly-ai-integration.md         Per-page copy-paste integration snippets
```

**Boundaries:** `quranly-ai-core.js` has one job — pure functions with no DOM/network, fully
testable. `quranly-ai.js` owns the always-present surface (global API + FAB) and knows how to
lazy-load the panel. `quranly-ai-panel.js` owns the panel UI + the streaming render loop. The
core is a dependency of both controllers; the controllers do not depend on each other beyond
`quranly-ai.js` dynamically injecting the panel script.

---

## 5. `quranly-ai-core.js` — pure logic (the testable heart)

Exports (UMD; `module.exports` for node, `window.II.quranlyCore` for browser):

- `getOrCreateAnonId(storage)` → reads/writes `ii-anon-id` in the given storage, returns the id.
- `chipsFor(type)` → array of `{action, label}` for the context type (see §7 chip table).
- `buildAskPayload(context, action, customQuestion, anonId)` → the exact request body:
  `{ context, action, customQuestion, userIdOrFingerprint }` (customQuestion omitted unless action==='custom').
- `parseSSE(bufferState, chunk)` → incremental SSE parser. Given accumulated buffer + a new
  text chunk, returns `{ events: [{event, data}], rest }` where complete `\n\n`-delimited
  frames are parsed (each frame's `data:` JSON-parsed; `event:` captured, default 'message'),
  and `rest` is the unterminated remainder to carry forward. Handles multi-line data and
  partial frames across chunks.
- `containsVerdictLanguage(text)` → the same two-regex verdict check as `quran-ai-core.js`
  (framing + terms); reused as a client-side defense-in-depth backstop.
- `SCHOLAR_REDIRECT` → the redirect string (identical to the existing one).
- `quotaText(remaining, max)` → e.g. `"2 of 3 questions remaining today"`.

No DOM, no fetch — everything the panel needs to be correct is here and unit-tested.

---

## 6. `window.QuranlyAI` API (`quranly-ai.js`)

- **`init(config)`** — call once per page. `config = { apiBase = 'https://api.islamicinfo.org', maxPerDay = 3 }`. Stores config, calls `getOrCreateAnonId(localStorage)`, mounts `<quranly-floating-button>` on `<body>`. Idempotent (a second call is a no-op).
- **`setContext(ctx)`** — stores the current context object (§8). Replaces any prior context.
- **`open(prefilledAction?)`** — ensures the panel script is loaded (lazy), mounts `<quranly-panel>` if absent, opens it, refreshes chips from the current context, and if `prefilledAction` is given, immediately runs `ask(prefilledAction)`.
- **`close()`** — closes the panel (keeps it in the DOM for reuse).
- **`ask(action, customQuestion?)`** — the request+stream entry point. Delegates to the panel's streaming method; if the panel isn't open, opens it first.
- **`renderContextButton(targetElementId, label, defaultAction)`** — finds the target element and injects a small inline ✨ button (a normal `<button>`, styled minimally, not a web component) whose click calls `open(defaultAction)` using the context already set via `setContext`. No-op (warns) if the target id is missing.

**FAB positioning:** on mount and on `window.resize` (debounced), query `#audio-player` then
`.audio-player`; if found and visible, set the FAB `bottom` to clear its top edge with a small
gap; otherwise use the default bottom offset. z-index below the header (`1000`).

---

## 7. `<quranly-panel>` (`quranly-ai-panel.js`, Shadow DOM)

Slide-out drawer matching the existing `.settings-panel`/`.bookmarks-panel` pattern
(`position:fixed; top:<below header>; right:0; bottom:0; transform:translateX(100%)→0;
transition ~.35s var(--ease-reverent); box-shadow var(--elev-4)`). Shadow root; CSS adopted
from `src/css/quranly-ai.css` (fetched once, cached, `adoptedStyleSheets` or an injected
`<style>`).

**Structure:**
- Header: "✨ QuranlyAI" + close ✕.
- Thread: message bubbles; user actions echoed as a chip label; assistant responses rendered
  incrementally; a **Sources** block + **Confidence** badge rendered from the `done` event.
- Suggested-action **chips** (rebuilt from `chipsFor(context.type)` each open):

  | context.type | chips (action → label) |
  |---|---|
  | quran | explain→"Explain this Ayah", simple→"Explain Simply", key_lessons→"Key Lessons", related_verses→"Related Verses", related_hadith→"Related Hadith" |
  | hadith | explain→"Explain this Hadith", related_verses→"Related Verses" |
  | dua | explain→"Explain this Dua" |
  | article | summarize_tafsir→"Summarize this Article" |
  | search | custom→"Explain these Results" |
  | (none/default) | explain→"Explain", custom→"Ask a question" |

- Free-text input "Ask a question…" + send → `ask('custom', inputValue)`.
- Footer: "Powered by QuranlyAI · Educational purposes only · No Fatwas" (satisfies
  CONTENT-POLICY §3/§8 attribution + §4 no-ruling framing).
- Quota line: "N questions remaining today", updated from each `done.remaining`; shows
  `maxPerDay` before the first response.

**Accent:** gold (`--gold-500`/`--gold-400`, `--gold-aura`), teal for secondary; all via
inherited design tokens so light/dark both work.

---

## 8. Context registration (per page — snippets are a deliverable, not wired here)

Each page calls `QuranlyAI.setContext({...})` with only the relevant fields:

- **Quran:** `{ type:'quran', surah, ayah, translationId, tafsirSource, language, rawText }`
- **Hadith:** `{ type:'hadith', hadithBook, hadithNumber, language, rawText }`
- **Dua:** `{ type:'dua', duaId, rawText }`
- **Article:** `{ type:'article', articleId, rawText }`
- **Search:** `{ type:'search', rawText: query }`

`rawText` is always the specific item text (never the whole page), matching the backend's
grounding contract. Inline buttons per brief §5 (e.g. per-ayah ✨ → `renderContextButton('ayah-255-ai-btn','✨','explain')`), documented in `doc/quranly-ai-integration.md`.

---

## 9. Streaming data flow (SSE)

```
QuranlyAI.ask(action, q)
  → payload = buildAskPayload(context, action, q, anonId)
  → fetch(`${apiBase}/api/quranlyai/ask`, {method:'POST',
           headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  → if !res.ok: map status → inline error (see §10); stop.
  → reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  → loop: {value} → parseSSE(state, value) → for each event:
        'message' (data.delta) → append delta to current assistant bubble
        'done'    (data)       → render Sources + Confidence badge; quotaText(data.remaining, maxPerDay)
  → on stream end with no 'done': finalize what was received.
  → defense-in-depth: if containsVerdictLanguage(finalAssembledText) → replace with SCHOLAR_REDIRECT.
```

The server already buffers + safety-filters before streaming, so the client verdict check is
a backstop, not the primary guard.

---

## 10. Error handling

| Condition | UI |
|---|---|
| HTTP 429 | Inline: "Daily limit reached — you've used all N of {maxPerDay} today." No stream. |
| HTTP 403 | Inline: "QuranlyAI isn't available on this site." (origin not allowlisted) |
| HTTP 502/503 | Inline: "QuranlyAI is temporarily unavailable — please try again." |
| Network / abort / malformed stream | Same "temporarily unavailable — try again" (retry button). |
| Missing context.rawText for an ungrounded action | Panel disables that chip / shows "Open a verse or hadith first." |

Errors never leave a half-rendered bubble; the send control re-enables after any terminal state.

---

## 11. Testing & verification

- **Unit (`tests/quran/quranly-ai-core.test.js`, node:test + require):**
  `parseSSE` (single frame, multiple deltas, partial frame across chunks, done event with JSON,
  ignore comments/blank lines); `chipsFor` per type incl. default; `buildAskPayload` shape
  (omits customQuestion unless custom); `getOrCreateAnonId` (creates once, stable on reread —
  with a fake storage); `containsVerdictLanguage` parity; `quotaText`.
- **Manual harness (`tools/quranly-ai-demo.html` + local Node SSE mock):** drives FAB → open →
  chip → streamed render → done/quota, plus a 429 and an error case, without the live backend.
- **Deferred:** live e2e against the deployed Worker (endpoint not live yet).

---

## 12. Performance

- Always-loaded bytes = `quranly-ai-core.js` + `quranly-ai.js` only (small: global API + FAB).
- Panel JS + CSS fetched on first open (dynamic `<script>` inject + one CSS `fetch`), cached
  thereafter. No dependency, no bundler, no npm.
- Shadow DOM isolates panel CSS from host pages (and reused sites) entirely.

---

## 13. Out of scope (YAGNI / deferred)

React provider/hooks; `packages/` restructure; any backend/DB change; editing the old
`.ai-card`/`quran-ai.js`; editing live page HTML (integration is delivered as snippets);
custom-domain/route setup for the Worker; live e2e.

---

## 14. Follow-ups to record on approval

- `doc/quranly-ai-integration.md` — per-page snippets (deliverable).
- Note in `doc/API-SPEC.md` that the SSE client for `/api/quranlyai/ask` is `quranly-ai.js`.
- Enabling `api.islamicinfo.org` → Worker route is an infra prerequisite for live use
  (tracked with the backend go-live steps).
- Generated output remains 🕌 human-review gated (CONTENT-POLICY §5).
