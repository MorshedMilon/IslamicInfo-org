# Gemini Provider Swap — Design

- **Date:** 2026-07-18
- **Status:** Approved (design), pending implementation plan
- **Scope:** Swap the AI provider for BOTH Worker AI endpoints from Anthropic (Claude) to Google Gemini (`gemini-2.5-flash`). Drop Anthropic entirely.
- **Related:** `doc/superpowers/specs/2026-07-17-quranlyai-ask-backend-design.md`, `doc/API-SPEC.md`, `doc/DECISIONS.md`

---

## 1. Purpose

The project will use Google Gemini instead of Anthropic Claude. Free tier now
(`gemini-2.5-flash`, rate-limited), paid later — **the same model**; going paid is a billing
toggle on the Google project, not a code change. This swap replaces the provider call and
the API key while leaving every provider-agnostic subsystem (quota, cache, grounding, the
no-fatwa safety filter, SSE streaming, the orchestrator) untouched.

Both endpoints switch: the new `POST /api/quranlyai/ask` and the legacy `POST /api/ask-claude`
(the live per-verse `.ai-card`). `ANTHROPIC_API_KEY` is removed from the project.

---

## 2. Locked decisions

1. **Provider:** Google Gemini via the classic REST `generateContent` endpoint.
2. **Model:** single `gemini-2.5-flash` for all actions. `chooseModel()` keeps its signature (the routing hook) but returns `gemini-2.5-flash` for everything now.
3. **Scope:** both endpoints; Anthropic fully removed. One key, `GEMINI_API_KEY`.
4. **Gemini safety filters:** set permissive (`BLOCK_NONE` on the four categories) so **our** no-fatwa filter remains the authority for religious content; handle Gemini blocks/truncation gracefully.
5. **Streaming unchanged:** keep "buffer → filter → stream out" — call Gemini non-streaming (`generateContent`), buffer, run the safety filter, then stream to the client via the existing `sse.js`.
6. **Path name unchanged:** keep `/api/ask-claude` (renaming breaks the live `src/js/api.js` client). It is an internal name now pointing at Gemini; user-facing attribution is already the provider-neutral "Powered by QuranlyAI".

---

## 3. Provider module — `worker/src/lib/gemini.js` (replaces `anthropic.js`)

`callGemini(env, { model, system, userContent, maxTokens })` → returns the **same
`{ text, refusal }` shape** `callAnthropic` returned, so `quranlyai.js` changes only by the
import name and the env-var guard.

- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Auth:** header `x-goog-api-key: env.GEMINI_API_KEY`
- **Timeout:** 15s `AbortController` (as before).

**Two pure, unit-tested helpers** (the real risk of a provider swap is the request/response
shape — test it):

- `buildGeminiBody({ system, userContent, maxTokens })` →
  ```jsonc
  {
    "system_instruction": { "parts": [{ "text": "<system>" }] },
    "contents": [{ "role": "user", "parts": [{ "text": "<userContent>" }] }],
    "generationConfig": { "maxOutputTokens": <maxTokens>, "temperature": 0.4 },
    "safetySettings": [
      { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
    ]
  }
  ```
- `parseGeminiResponse(data)` → `{ text, refusal }`:
  - `text` = concatenation of `data.candidates[0].content.parts[*].text` (trimmed).
  - `refusal = true` when there are no candidates (`data.promptFeedback.blockReason` present),
    or `candidates[0].finishReason === 'SAFETY'` / `'RECITATION'`, or no text was produced.
  - `MAX_TOKENS` finish is NOT a refusal — return whatever text came back (truncated is fine).

The `callGemini` wrapper does `fetch` + `buildGeminiBody` + `parseGeminiResponse`; on network
error / non-2xx it throws (the orchestrator maps that to a 502, unchanged).

**Blocked-response behavior:** a Gemini block yields `refusal: true`; the orchestrator already
does `if (!safe || result.refusal) safe = RULING_DEFLECTION`, so a blocked religious prompt
falls back to the safe scholar-redirect. Acceptable and safe.

---

## 4. `prompts.js`

- Replace `HAIKU`/`SONNET` with `GEMINI_FLASH = 'gemini-2.5-flash'`.
- `chooseModel(action, rulingAdjacent)` keeps its signature and returns `GEMINI_FLASH` for all
  actions (hook preserved for future differentiation). `maxTokensFor()` unchanged.

---

## 5. `quranlyai.js`

- Import `callGemini` from `./lib/gemini.js` instead of `callAnthropic`.
- Env guard: `if (!env || !env.GEMINI_API_KEY) return err('AI temporarily unavailable', origin, 503);`
- The call site `callGemini(env, { model, system: QURANLYAI_SYSTEM_PROMPT, userContent, maxTokens })`
  is otherwise identical. No other change.

---

## 6. Legacy `/api/ask-claude` in `index.js`

Rewrite the inline Anthropic `fetch` block to call the shared `callGemini`:
- Guard `env.GEMINI_API_KEY` (503 if missing).
- `const { text, refusal } = await callGemini(env, { model: GEMINI_FLASH, system: ASK_CLAUDE_SYSTEM_PROMPT, userContent, maxTokens: 500 });`
- Keep the rest: `if (!text || refusal) answer = SCHOLAR_REDIRECT;` then the existing
  `verdictLangDetected` filter, then the same `{ answer, attribution, sourcesCited }` JSON
  response. Behavior and contract identical to today, just Gemini underneath.
- Import `callGemini` and `GEMINI_FLASH` at the top of `index.js`.

---

## 7. Config / key

- Rename every `ANTHROPIC_API_KEY` reference to `GEMINI_API_KEY`:
  `worker/src/quranlyai.js`, `worker/src/index.js`, `worker/.env.example`, and root `.env.example`
  if it references it.
- Worker secret: `wrangler secret put GEMINI_API_KEY`. Key obtained from Google AI Studio
  (`aistudio.google.com/apikey`). Free tier works immediately; paid = enable billing, no redeploy.
- Delete `worker/src/lib/anthropic.js` (replaced by `gemini.js`).

---

## 8. Tests

- **New (`worker/test/gemini.test.js`, node:test):**
  - `buildGeminiBody` produces the correct nested shape, sets `maxOutputTokens`, includes the
    four `BLOCK_NONE` safety settings, and puts `system`/`userContent` in the right places.
  - `parseGeminiResponse`: normal candidate → `{text, refusal:false}`; blocked prompt
    (`promptFeedback.blockReason`, no candidates) → `refusal:true`; `finishReason:'SAFETY'` →
    `refusal:true`; `finishReason:'MAX_TOKENS'` with text → returns the text, `refusal:false`;
    empty/garbage → `refusal:true`.
- **Update:** `worker/test/prompts.test.js` (assert `chooseModel` returns `gemini-2.5-flash`;
  `GEMINI_FLASH` export); `worker/test/sse.test.js` (the `model` meta string → `gemini-2.5-flash`).
- **Full suites** stay green.
- **Local integration (no network):** drive `quranlyai.js` (or `callGemini` via a stubbed
  fetch / a tiny local Gemini-shaped mock) to confirm a real `generateContent`-shaped response
  parses and streams end-to-end — same "actually run it" discipline used for the frontend.
- **Live e2e** deferred with the rest of go-live.

---

## 9. Docs & the scheduled reminder

- `doc/API-SPEC.md`: change provider/model/secret notes to Gemini for both endpoints.
- `doc/DECISIONS.md`: ADR — "AI provider = Google Gemini (`gemini-2.5-flash`); dropped
  Anthropic; Gemini safety filters set permissive with our no-fatwa filter as the authority."
- **Update tomorrow's 9 AM reminder routine** so STEP 1 says
  `wrangler secret put GEMINI_API_KEY` (key from aistudio.google.com/apikey), not ANTHROPIC.

---

## 10. Out of scope (YAGNI)

Two-tier Gemini model routing (flash-lite), Gemini streaming (`streamGenerateContent`), the
newer Interactions API, renaming the `/api/ask-claude` path, and any frontend change (the
client contract is unchanged).

---

## 11. Follow-ups on approval

- The memory files `quranlyai-ask-backend-state` and the go-live steps mention `ANTHROPIC_API_KEY`
  — update to `GEMINI_API_KEY` after implementation.
- Generated output remains 🕌 human-review gated (CONTENT-POLICY §5).
