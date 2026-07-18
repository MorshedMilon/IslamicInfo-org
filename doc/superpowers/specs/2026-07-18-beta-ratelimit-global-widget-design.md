# Beta Rate-Limit + Turnkey Global Widget — Design

- **Date:** 2026-07-18
- **Status:** Approved (design)
- **Scope:** (1) 30-day-beta rate limiting — IP safety cap, per-user unlimited, UI text. (2) One-tag self-initializing global widget loader + grounding-only graceful no-source handling.
- **Related:** `doc/superpowers/specs/2026-07-17-quranlyai-{ask-backend,frontend-integration}-design.md`; live Worker `islamicinfo-api.islamicinfo.workers.dev`.

---

## Context / reality corrections

- Backend is a Cloudflare **Worker** (not Pages Functions).
- Quota is **per-fingerprint** (client `localStorage` UUID `userIdOrFingerprint`), `GUEST_DAILY_LIMIT = 3`. **No IP limiting exists.** A bot can rotate the UUID → per-fingerprint caps don't stop bots.
- The "chat widget" is **already a reusable global floating module** (`window.QuranlyAI`, `src/js/quranly-ai-*.js` + `src/css/quranly-ai.css`): self-injecting bottom-right button, Shadow-DOM overlay panel, works on any page. Task 2 is therefore *turnkey packaging*, not extraction.
- Backend is **grounding-only** (answers only from provided source text; forbidden from using model memory — the no-hallucination invariant). Free-text with no source currently 400s.

## Locked decisions

1. **Rate limit:** IP-based safety cap **100/day** (the abuse backstop) + **per-user unlimited** for the beta. IP is hashed (SHA-256) before use — no raw IPs stored (zero-PII).
2. **Grounding:** keep grounding-only. No-source free-text → graceful canned message, not a 400.
3. Keep existing filenames (don't rename to `quranlyai-widget.*` at the module level); add a thin one-tag loader `quranlyai-widget.js`.
4. Beta config is reversible via a `betaUnlimited` flag; **revisit after the 30-day beta**.

---

## 1. Rate limiting (`worker/src/lib/quota.js` + `worker/src/quranlyai.js`)

`quota.js` additions (KV injected, unit-tested like existing quota fns):
- `IP_DAILY_LIMIT = 100`.
- `ipKey(ipHash, date)` → `ip:{ipHash}:{date}`.
- `getIpQuota(kv, ipHash, date)` → `{ count, limit, blocked }` (blocked when `count >= IP_DAILY_LIMIT`).
- `incrementIpQuota(kv, ipHash, date)` → read-modify-write with TTL `secondsUntilUTCMidnight()`.

`quranlyai.js` changes:
- Derive client IP: `request.headers.get('CF-Connecting-IP') || 'unknown'`, hash via existing SHA-256 helper (reuse `hash-context` primitive or `crypto.subtle`) → `ipHash`.
- Replace the per-fingerprint **block** with the IP block: `getIpQuota` → if blocked, `429 { remaining: 0 }`. (Keep `fingerprint` for the cache key; stop enforcing the 3/day per-user cap during the beta.)
- On a real generation (cache miss), `incrementIpQuota` (via `ctx.waitUntil`). Cache hits do not increment.
- `remaining` in the `done` event: send IP-based remaining (UI ignores it during beta).

## 2. Grounding-only graceful no-source (`worker/src/quranlyai.js`)

- Current: `if (!GROUNDED_ACTIONS.has(action) && rawText.length < 3) return err(..., 400)`.
- New: if there is **no usable source** (no `rawText` for a non-grounded action), **stream a canned guidance message** instead of erroring — no Gemini call, no cost:
  > "I can explain a specific verse, hadith, or dua you're viewing — open one and tap ✨ Ask QuranlyAI, or highlight a passage to ask about it."
  Delivered via the existing `streamSafeText` (so the client renders it like any answer, with the standard footer). Message text lives as a core/const so it's testable.

## 3. Frontend UI (`src/js/quranly-ai-panel.js`; config flows through `quranly-ai.js` `init`)

- `init({ betaUnlimited: true })` (already merged into `state.config`; panel reads `getState().config`).
- Quota line: `cfg.betaUnlimited ? 'Beta Testing: Unlimited Questions' : core.quotaText(...)` — at both set-points (initial render + `_finalize`).
- 429 message reworded: `'You’ve reached today’s limit — please try again later.'` (drops the "3"; only appears if the 100/day IP cap trips).

## 4. Turnkey one-tag loader (`src/js/quranlyai-widget.js` — NEW)

- Single `<script src=".../quranlyai-widget.js">` on any page:
  1. Derive own dir from `document.currentScript.src`.
  2. Inject `quranly-ai-core.js` then `quranly-ai.js` (ordered).
  3. After load, `QuranlyAI.init({ apiBase, betaUnlimited: true })`.
- Default `apiBase = 'https://islamicinfo-api.islamicinfo.workers.dev'`, overridable via `data-api-base` on the script tag.
- Floating button self-mounts; panel + CSS lazy-load on first open. Existing filenames unchanged (so `quran.html` wiring stays valid).
- **CORS:** only origins in the Worker `ALLOWED_ORIGINS` work (islamicinfo.org, www, morshedmilon.github.io, localhost:3000). Other domains need allowlisting — out of scope.

## 5. Tests & verification

- **Unit (worker):** `getIpQuota`/`incrementIpQuota` (count, boundary at 100, TTL) with a fake KV; the no-source canned-message constant/path.
- **Unit (frontend core):** unchanged; `quotaText` retained for post-beta revert.
- **Live:** redeploy; verify (a) normal grounded answer still works, (b) no-source `custom` returns the canned guidance (not 400/red), (c) panel shows "Beta Testing: Unlimited Questions", (d) IP-cap 429 path. Browser-drive the one-tag loader on a page.

## Out of scope / post-beta

- After the 30-day beta: set `betaUnlimited: false`, restore a sane per-user cap, reconsider the IP number. (Recorded in memory + code comment.)
- Not adding other domains (QuranlyAI.com/TravellyAI.com) to CORS. Not enabling open-Q&A-from-memory. Not renaming the module files. The separate `feat/wire-quranlyai-quran-page` branch (manual quran.html wiring) is independent; the one-tag loader supersedes the need for manual per-page wiring.
