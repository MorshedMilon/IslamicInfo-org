# Gemini Provider Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swap both Worker AI endpoints (`/api/quranlyai/ask` and legacy `/api/ask-claude`) from Anthropic Claude to Google Gemini (`gemini-2.5-flash`), removing Anthropic entirely.

**Architecture:** Replace the single provider module `anthropic.js` with `gemini.js` that returns the identical `{ text, refusal }` shape, so the orchestrator and legacy handler change only at the call site + env-var name. The risky request/response shape mapping is isolated into two pure functions (`buildGeminiBody`, `parseGeminiResponse`) and unit-tested; the network `fetch` wrapper is covered with a stubbed `fetch`. Gemini's own safety filters are set permissive so the existing no-fatwa filter stays authoritative.

**Tech Stack:** Cloudflare Workers (ESM), Google Gemini `generateContent` REST API, Node built-in test runner (`node:test`).

**Reference:** `doc/superpowers/specs/2026-07-18-gemini-provider-swap-design.md`.

**Execution environment note:** Node v24 installed; **wrangler is NOT** (do not run `npx wrangler`). Unit tests run from `worker/`: `node --test "test/*.test.js"` (bare `node --test dir/` fails on Node 24/Windows — use the glob). Syntax-check browser/Worker files with `node --check`. Import-smoke a module with `node -e "import('./src/…').then(()=>console.log('OK'))"`. All commands via the **Bash** tool (Git Bash). Work on branch `feat/gemini-provider-swap` (already created; do NOT switch). Live e2e is deferred with go-live.

---

## File Structure

```
worker/src/lib/gemini.js       NEW  callGemini + pure buildGeminiBody/parseGeminiResponse (replaces anthropic.js)
worker/test/gemini.test.js     NEW  unit tests for the two pure helpers + stubbed-fetch wrapper test
worker/src/lib/anthropic.js    DELETE
worker/src/lib/prompts.js      MOD  HAIKU/SONNET -> GEMINI_FLASH; chooseModel returns GEMINI_FLASH
worker/test/prompts.test.js    MOD  model-routing assertions -> gemini-2.5-flash
worker/src/quranlyai.js        MOD  import callGemini; env guard GEMINI_API_KEY; call site
worker/src/index.js            MOD  legacy /api/ask-claude uses callGemini + GEMINI_FLASH; env guard
worker/test/sse.test.js        MOD  meta.model string -> gemini-2.5-flash
worker/.env.example            MOD  ANTHROPIC_API_KEY -> GEMINI_API_KEY
.env.example                   MOD  (root) same rename if present
doc/API-SPEC.md                MOD  provider/model/secret notes -> Gemini
doc/DECISIONS.md               MOD  ADR: provider = Gemini
```

---

### Task 1: Gemini provider module (`gemini.js`) with tested pure helpers

**Files:**
- Create: `worker/src/lib/gemini.js`
- Create: `worker/test/gemini.test.js`

- [ ] **Step 1: Write the failing test**

`worker/test/gemini.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert';
import { buildGeminiBody, parseGeminiResponse, callGemini } from '../src/lib/gemini.js';

test('buildGeminiBody nests system + user content and sets config', () => {
  const b = buildGeminiBody({ system: 'SYS', userContent: 'HI', maxTokens: 300 });
  assert.equal(b.system_instruction.parts[0].text, 'SYS');
  assert.equal(b.contents[0].role, 'user');
  assert.equal(b.contents[0].parts[0].text, 'HI');
  assert.equal(b.generationConfig.maxOutputTokens, 300);
  assert.equal(b.safetySettings.length, 4);
  assert.ok(b.safetySettings.every((s) => s.threshold === 'BLOCK_NONE'));
});

test('parseGeminiResponse extracts and joins candidate text parts', () => {
  const data = { candidates: [{ content: { parts: [{ text: 'Hello ' }, { text: 'world' }] }, finishReason: 'STOP' }] };
  assert.deepEqual(parseGeminiResponse(data), { text: 'Hello world', refusal: false });
});

test('parseGeminiResponse marks a blocked prompt (no candidates) as refusal', () => {
  assert.deepEqual(parseGeminiResponse({ promptFeedback: { blockReason: 'SAFETY' } }), { text: '', refusal: true });
});

test('parseGeminiResponse marks a SAFETY finishReason as refusal', () => {
  const data = { candidates: [{ content: { parts: [{ text: 'x' }] }, finishReason: 'SAFETY' }] };
  assert.deepEqual(parseGeminiResponse(data), { text: '', refusal: true });
});

test('parseGeminiResponse keeps truncated MAX_TOKENS text (not a refusal)', () => {
  const data = { candidates: [{ content: { parts: [{ text: 'partial' }] }, finishReason: 'MAX_TOKENS' }] };
  assert.deepEqual(parseGeminiResponse(data), { text: 'partial', refusal: false });
});

test('parseGeminiResponse treats empty/garbage as refusal', () => {
  assert.deepEqual(parseGeminiResponse({}), { text: '', refusal: true });
  assert.deepEqual(parseGeminiResponse({ candidates: [{ content: { parts: [] }, finishReason: 'STOP' }] }), { text: '', refusal: true });
});

test('callGemini wires fetch -> parse against a Gemini-shaped response (stubbed fetch)', async () => {
  const realFetch = globalThis.fetch;
  let capturedUrl = '', capturedHeaders = null;
  globalThis.fetch = async (url, opts) => {
    capturedUrl = url; capturedHeaders = opts.headers;
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'grounded answer' }] }, finishReason: 'STOP' }] }) };
  };
  try {
    const r = await callGemini({ GEMINI_API_KEY: 'k' }, { model: 'gemini-2.5-flash', system: 'S', userContent: 'U', maxTokens: 100 });
    assert.deepEqual(r, { text: 'grounded answer', refusal: false });
    assert.match(capturedUrl, /\/models\/gemini-2\.5-flash:generateContent$/);
    assert.equal(capturedHeaders['x-goog-api-key'], 'k');
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('callGemini throws on a non-2xx status (orchestrator maps to 502)', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 429 });
  try {
    await assert.rejects(
      () => callGemini({ GEMINI_API_KEY: 'k' }, { model: 'm', system: 'S', userContent: 'U', maxTokens: 10 }),
      /gemini HTTP 429/
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `worker/`): `node --test test/gemini.test.js`
Expected: FAIL — cannot find module `../src/lib/gemini.js`.

- [ ] **Step 3: Create `worker/src/lib/gemini.js`**

```js
/* Buffered Google Gemini generateContent call. Returns { text, refusal } — the same shape
   the old Anthropic call returned — so the caller runs the safety filter on `text` before
   anything reaches the client. The request/response shape mapping is isolated into two pure
   functions so it can be unit-tested without the network. */

const GEMINI_MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Gemini's own safety filters set permissive: our no-fatwa filter (safety.js) is the authority
// for religious content, and over-blocking legitimate Quran/Hadith text would break the feature.
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

export function buildGeminiBody({ system, userContent, maxTokens }) {
  return {
    system_instruction: { parts: [{ text: system || '' }] },
    contents: [{ role: 'user', parts: [{ text: userContent || '' }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
    safetySettings: SAFETY_SETTINGS,
  };
}

export function parseGeminiResponse(data) {
  // No candidates => the prompt itself was blocked (data.promptFeedback.blockReason).
  if (!data || !Array.isArray(data.candidates) || !data.candidates.length) {
    return { text: '', refusal: true };
  }
  const cand = data.candidates[0];
  const reason = cand.finishReason;
  if (reason === 'SAFETY' || reason === 'RECITATION') return { text: '', refusal: true };
  const parts = (cand.content && Array.isArray(cand.content.parts)) ? cand.content.parts : [];
  const text = parts.map((p) => (p && typeof p.text === 'string' ? p.text : '')).join('').trim();
  if (!text) return { text: '', refusal: true };
  return { text, refusal: false }; // includes MAX_TOKENS-truncated text
}

export async function callGemini(env, { model, system, userContent, maxTokens }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${GEMINI_MODELS_URL}/${model}:generateContent`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY,
      },
      body: JSON.stringify(buildGeminiBody({ system, userContent, maxTokens })),
    });
    if (!res.ok) throw new Error('gemini HTTP ' + res.status);
    const data = await res.json();
    return parseGeminiResponse(data);
  } finally {
    clearTimeout(t);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `worker/`): `node --test test/gemini.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/lib/gemini.js worker/test/gemini.test.js
git commit -m "feat(worker): Gemini provider module with tested shape mapping"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 2: Model constant + routing (`prompts.js`)

**Files:**
- Modify: `worker/src/lib/prompts.js`
- Modify: `worker/test/prompts.test.js`

- [ ] **Step 1: Update the test first**

In `worker/test/prompts.test.js`, change the import line to pull `GEMINI_FLASH` instead of `HAIKU, SONNET`:
```js
import { QURANLYAI_SYSTEM_PROMPT, buildUserPrompt, maxTokensFor, chooseModel, GEMINI_FLASH } from '../src/lib/prompts.js';
```
Then REPLACE the existing `chooseModel` test (the one asserting HAIKU/SONNET) with:
```js
test('chooseModel returns gemini-2.5-flash for all actions', () => {
  assert.equal(GEMINI_FLASH, 'gemini-2.5-flash');
  assert.equal(chooseModel('simple', false), GEMINI_FLASH);
  assert.equal(chooseModel('vocabulary', false), GEMINI_FLASH);
  assert.equal(chooseModel('custom', false), GEMINI_FLASH);
  assert.equal(chooseModel('explain', true), GEMINI_FLASH);
});
```
Leave all other tests in the file unchanged.

- [ ] **Step 2: Run test to verify it fails**

Run (from `worker/`): `node --test test/prompts.test.js`
Expected: FAIL — `GEMINI_FLASH` is undefined / import error.

- [ ] **Step 3: Update `worker/src/lib/prompts.js`**

Replace these two lines near the top:
```js
export const HAIKU = 'claude-haiku-4-5';
export const SONNET = 'claude-sonnet-5';
```
with:
```js
export const GEMINI_FLASH = 'gemini-2.5-flash';
```
And replace the whole `chooseModel` function with:
```js
export function chooseModel(action, rulingAdjacent) {
  // Single model for now. Signature kept as a hook so cheap/strong routing (e.g. a lite
  // model) can be reintroduced later without changing any call site.
  return GEMINI_FLASH;
}
```
Leave `QURANLYAI_SYSTEM_PROMPT`, `buildUserPrompt`, `maxTokensFor`, and `ACTION_INSTRUCTION` exactly as they are.

- [ ] **Step 4: Run test to verify it passes**

Run (from `worker/`): `node --test test/prompts.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add worker/src/lib/prompts.js worker/test/prompts.test.js
git commit -m "refactor(worker): route all actions to gemini-2.5-flash"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 3: Orchestrator wiring (`quranlyai.js`)

**Files:**
- Modify: `worker/src/quranlyai.js`

*(No new unit test — the orchestrator is integration-verified in Task 6; this is a mechanical wiring swap. Verified here by import-smoke.)*

- [ ] **Step 1: Swap the import**

In `worker/src/quranlyai.js`, change:
```js
import { callAnthropic } from './lib/anthropic.js';
```
to:
```js
import { callGemini } from './lib/gemini.js';
```

- [ ] **Step 2: Swap the env guard**

Change the line:
```js
  if (!env || !env.ANTHROPIC_API_KEY) return err('AI temporarily unavailable', origin, 503);
```
to:
```js
  if (!env || !env.GEMINI_API_KEY) return err('AI temporarily unavailable', origin, 503);
```

- [ ] **Step 3: Swap the call site**

Change:
```js
    result = await callAnthropic(env, { model, system: QURANLYAI_SYSTEM_PROMPT, userContent, maxTokens: maxTokensFor(action) });
```
to:
```js
    result = await callGemini(env, { model, system: QURANLYAI_SYSTEM_PROMPT, userContent, maxTokens: maxTokensFor(action) });
```
Nothing else changes — `result` still has `{ text, refusal }`, and the downstream safety filter / streaming is untouched.

- [ ] **Step 4: Import-smoke the module**

Run (from `worker/`): `node -e "import('./src/quranlyai.js').then(()=>console.log('quranlyai OK')).catch(e=>{console.error(e);process.exit(1)})"`
Expected: `quranlyai OK`.

- [ ] **Step 5: Commit**

```bash
git add worker/src/quranlyai.js
git commit -m "refactor(worker): /api/quranlyai/ask calls Gemini"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 4: Legacy `/api/ask-claude` handler (`index.js`)

**Files:**
- Modify: `worker/src/index.js`

*(Browser/Worker code — verified by `node --check` + import-smoke; behavior/contract identical, Gemini underneath.)*

- [ ] **Step 1: Add the imports**

At the top of `worker/src/index.js`, alongside the other `./lib/*` imports, add:
```js
import { callGemini } from './lib/gemini.js';
import { GEMINI_FLASH } from './lib/prompts.js';
```

- [ ] **Step 2: Rewrite the provider call inside `handleAskClaude`**

Replace everything from the env-key guard through the answer-extraction (the current block that starts with `if (!env || !env.ANTHROPIC_API_KEY) ...` and ends at `if (!answer || (data && data.stop_reason === 'refusal')) answer = SCHOLAR_REDIRECT;`) with:
```js
  if (!env || !env.GEMINI_API_KEY) return err('AI temporarily unavailable', origin, 503);

  const userContent = context + '\n\n' + (question || 'Explain the meaning of this verse in simple, easy language for a general reader.');

  let result;
  try {
    result = await callGemini(env, { model: GEMINI_FLASH, system: ASK_CLAUDE_SYSTEM_PROMPT, userContent, maxTokens: 500 });
  } catch (e) {
    return err('AI explanation unavailable — please try again', origin, 502);
  }

  let answer = (result.text || '').trim();
  if (!answer || result.refusal) answer = SCHOLAR_REDIRECT;
```
Leave the lines that follow unchanged:
```js
  if (verdictLangDetected(answer)) {
    console.log('[ask-claude] stripped verdict-language response for ref=' + sourceRef);
    answer = SCHOLAR_REDIRECT;
  }

  return json({ answer: answer, attribution: AI_ATTRIBUTION, sourcesCited: sourceRef ? [sourceRef] : [] }, origin);
```
This removes the inline `AbortController`/`setTimeout`/`fetch`/`data` block (now inside `callGemini`). Also update the section comment `/* ═══ POST /api/ask-claude — Anthropic proxy (Module 5B) ═══ */` to `/* ═══ POST /api/ask-claude — Gemini proxy (Module 5B) ═══ */`. Keep the function name `handleAskClaude` and the route path `/api/ask-claude` (renaming would break the live `src/js/api.js` client).

- [ ] **Step 3: Verify syntax + load**

Run (from `worker/`): `node --check src/index.js && node -e "import('./src/index.js').then(()=>console.log('index OK')).catch(e=>{console.error(e);process.exit(1)})"`
Expected: `index OK`, exit 0.

- [ ] **Step 4: Commit**

```bash
git add worker/src/index.js
git commit -m "refactor(worker): legacy /api/ask-claude calls Gemini (path name kept)"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 5: Remove Anthropic + config rename + sweep

**Files:**
- Delete: `worker/src/lib/anthropic.js`
- Modify: `worker/test/sse.test.js`
- Modify: `worker/.env.example`
- Modify: `.env.example` (root, if it references the key)

- [ ] **Step 1: Delete the Anthropic module**

Run: `git rm worker/src/lib/anthropic.js`

- [ ] **Step 2: Update the SSE test's cosmetic model string**

In `worker/test/sse.test.js`, change the meta object's model value from `'claude-haiku-4-5'` to `'gemini-2.5-flash'` (it is arbitrary test metadata, updated for consistency):
```js
    sources: ['Quran 2:255'], confidence: 'High', model: 'gemini-2.5-flash', cached: false, remaining: 2,
```

- [ ] **Step 3: Rename the env key in the example files**

In `worker/.env.example`, change:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```
to:
```
# Get a key from Google AI Studio: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```
If a root `.env.example` exists and references `ANTHROPIC_API_KEY`, make the same rename there (read it first; if it has no such line, leave it).

- [ ] **Step 4: Sweep for any lingering Anthropic references**

Run (from repo root): `grep -rn -i "ANTHROPIC_API_KEY\|api\.anthropic\.com\|claude-haiku\|claude-sonnet\|callAnthropic" worker/ || echo "CLEAN"`
Expected: `CLEAN`. (The route path `/api/ask-claude`, the function `handleAskClaude`, and the client `postAskClaude` are intentionally kept and won't match these patterns.)

- [ ] **Step 5: Run the full worker suite**

Run (from `worker/`): `node --test "test/*.test.js"`
Expected: all PASS (gemini + prompts + sse + existing).

- [ ] **Step 6: Commit**

```bash
git add -A worker/ .env.example
git commit -m "chore(worker): remove Anthropic module + rename key to GEMINI_API_KEY"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 6: Local integration check (no live key)

**Files:** none (verification only).

- [ ] **Step 1: Drive the orchestrator against a Gemini-shaped stubbed fetch**

Create a throwaway checker `worker/_gemcheck.mjs`:
```js
import { callGemini } from './src/lib/gemini.js';
const realFetch = globalThis.fetch;
// Simulate a normal Gemini answer that carries the mandated "Not a fatwa" footer.
globalThis.fetch = async () => ({
  ok: true,
  json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text:
    '**Answer**\nThis verse teaches patience.\n\n**Note**: Educational explanation only. Not a fatwa.' }] } }] }),
});
const { verdictLangDetected } = await import('./src/lib/safety.js');
const r = await callGemini({ GEMINI_API_KEY: 'x' }, { model: 'gemini-2.5-flash', system: 'S', userContent: 'U', maxTokens: 300 });
globalThis.fetch = realFetch;
const ok = r.text.includes('**Answer**') && !r.refusal && verdictLangDetected(r.text) === false;
console.log('text.len', r.text.length, 'refusal', r.refusal, 'verdictTrips', verdictLangDetected(r.text));
console.log(ok ? 'INTEGRATION OK' : 'INTEGRATION FAIL');
process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Run it**

Run (from `worker/`): `node _gemcheck.mjs`
Expected: prints `INTEGRATION OK` — confirms a real Gemini-shaped response parses to `{ text, refusal:false }` AND the earlier verdict-footer fix holds (the "Not a fatwa" footer does not trip the filter).

- [ ] **Step 3: Delete the throwaway**

Run (from `worker/`): `rm _gemcheck.mjs` and confirm `git status` shows it untracked/gone (do NOT commit it).

- [ ] **Step 4: No commit** (verification only). If it fails, fix the relevant module + its unit test and re-run.

---

### Task 7: Docs + finish the branch

**Files:**
- Modify: `doc/API-SPEC.md`
- Modify: `doc/DECISIONS.md`

- [ ] **Step 1: Update `doc/API-SPEC.md`**

In the `/api/ask-claude` and `/api/quranlyai/ask` sections, change any provider/model/secret notes to: provider **Google Gemini**, model **`gemini-2.5-flash`**, secret **`GEMINI_API_KEY`**. Keep the `/api/ask-claude` path name; add a note that it is an internal name now backed by Gemini.

- [ ] **Step 2: Add an ADR to `doc/DECISIONS.md`**

Record: "AI provider = Google Gemini (`gemini-2.5-flash`) via `generateContent`; Anthropic dropped, single `GEMINI_API_KEY`. Free tier now / paid later = billing toggle, no code change. Gemini's own safety filters set `BLOCK_NONE`; the server-side no-fatwa filter (`safety.js`) remains the content-safety authority. Path `/api/ask-claude` kept for client compatibility."

- [ ] **Step 3: Commit**

```bash
git add doc/API-SPEC.md doc/DECISIONS.md
git commit -m "docs(gemini): API-SPEC + ADR for Anthropic->Gemini swap"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

- [ ] **Step 4: Full sweep + finish**

Run (from `worker/`): `node --test "test/*.test.js"` → all PASS.
Run (from repo root): `node --test "tests/quran/*.test.js"` → no regression.
Then invoke `superpowers:finishing-a-development-branch` to choose merge/PR. Note for the human: go-live now needs `wrangler secret put GEMINI_API_KEY` (key from aistudio.google.com/apikey) instead of ANTHROPIC; live e2e deferred; output stays 🕌 review-gated.

---

## Self-Review

**Spec coverage:**
- §3 gemini.js + pure helpers + `{text,refusal}` → Task 1 ✓
- §3 safety settings BLOCK_NONE + blocked-response → refusal → Task 1 (`buildGeminiBody`, `parseGeminiResponse`) ✓
- §4 GEMINI_FLASH + chooseModel hook → Task 2 ✓
- §5 quranlyai.js import/guard/call → Task 3 ✓
- §6 legacy /api/ask-claude via callGemini, path kept → Task 4 ✓
- §7 key rename everywhere + delete anthropic.js → Tasks 3,4,5 ✓
- §8 tests (pure + stubbed fetch + prompts + sse) + local integration → Tasks 1,2,5,6 ✓
- §9 docs + ADR → Task 7 (the scheduled-reminder update is handled by the controller outside this plan) ✓

**Placeholder scan:** No TBD/TODO. Task 6's throwaway `_gemcheck.mjs` is explicitly created, run, and deleted (not committed). Task 5 Step 3 conditionally edits root `.env.example` ("if present / if it has the line") — read-first is specified, not a vague placeholder.

**Type/name consistency:** `callGemini(env, {model, system, userContent, maxTokens})` → `{text, refusal}` used identically in Tasks 1, 3, 4. `buildGeminiBody({system, userContent, maxTokens})` and `parseGeminiResponse(data)` consistent (Task 1). `GEMINI_FLASH = 'gemini-2.5-flash'` exported in Task 2, imported in Task 4. Env var `GEMINI_API_KEY` consistent across Tasks 3, 4, 5. Result field access `result.text`/`result.refusal` matches the return shape.
