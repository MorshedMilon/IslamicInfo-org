# Design — Universal "Select & Ask QuranlyAI"

- **Date:** 2026-07-19
- **Status:** Approved design (pending written-spec review)
- **Owner area:** QuranlyAI widget + global content pages
- **Related:** `src/js/quranly-ai*.js`, `worker/src/lib/prompts.js`, `worker/src/quranlyai.js`, `verify.html`

## 1. Problem

Today, QuranlyAI is only reachable two ways: the floating widget (which opens with default/verse-selected context) and, on `quran.html`, the verse-click flow that seeds a Quran context. There is **no way to select an arbitrary piece of content on any page** — a hadith text block, a dua, a tafsir paragraph, an article excerpt — and send *that* to QuranlyAI. We want a **site-wide, reusable "select text → floating action menu → existing QuranlyAI widget"** behavior on any marked content block.

## 2. Goal

One drop-in module that, on any page, turns a text selection inside a marked container into a small floating action menu, and routes the chosen action (with the selected text + source metadata) into the **existing** QuranlyAI widget — no second chat UI, no per-page hardcoding.

## 3. Non-goals (YAGNI)

- No second chat interface. Reuse `window.QuranlyAI`.
- No new AI actions beyond one generic `summarize`. (Explain, Related Verses, Related Hadith already exist.)
- No "Translate" action (dropped).
- No AI verdicts for Verify Hadith — it routes to the existing verify flow.
- No rich "saved selections" management UI in this pass (just persist + toast).

## 4. Confirmed decisions

- **Menu = always 4 buttons:** `Summarize · Explain · [contextual 4th] · Save`. Contextual 4th **swaps, never hides**: **Verify Hadith** on hadith, **Related Verses** on ayah/dua/tafsir.
- **A — generic `summarize` action** operating on provided `rawText`, with a context-aware prompt prefix per type. No per-type summarize functions.
- **B —** accept `"not documented in available sources"` as the honest fallback when `data-ai-key` is missing (e.g. dua). Never invent a related verse/hadith.
- **C — this pass** marks `data-ai-selectable` containers on **Hadith, Dua, Knowledge Hub/Tafsir, Islamic Studies, and the existing Quran page**. The `select-to-ask.js` `<script>` tag ships on **all** pages now; remaining pages get marked containers after live review.
- **Widget chip row becomes content-type aware** (Section 9), driven by the same selection metadata.

## 5. Architecture

```
[marked container: data-ai-selectable="hadith" ...]
        │  user highlights text
        ▼
select-to-ask.js  ── reads selection + container data-attrs ──▶ builds { type, rawText, sourceRef, surah, ayah }
        │  renders Shadow-DOM floating menu at selection rect
        ▼  on click →  QuranlyAI.route(action, meta)
                         ├─ ai actions (summarize/explain/related_verses)
                         │     → QuranlyAI.setContext(meta); QuranlyAI.ask(action)   [existing widget + SSE]
                         ├─ verify   → navigate to verify.html?q=…&ref=…             [existing verify flow]
                         └─ save     → persist to ii-saved-selections + toast        [local, no request]
```

- **`src/js/select-to-ask-core.js`** — pure, DOM-free logic (UMD, mirrors `quranly-ai-core.js`): resolve content type → menu model; map menu action → route kind; build the metadata payload; sanitize/trim selected text; decide "is this selection eligible" (min length, inside eligible container, not inside the menu itself). Unit-tested.
- **`src/js/select-to-ask.js`** — the DOM controller: selection listeners, Shadow-DOM menu render + positioning, dismissal, and the click→`QuranlyAI.route` handoff. Depends only on the public `window.QuranlyAI` API + `select-to-ask-core`.
- Loaded via a single `<script src="src/js/select-to-ask.js?v=…"></script>` tag (cache-bust query propagated to the core, same pattern as `quranlyai-widget.js`).

## 6. Metadata contract (container declares, module reads)

| Attribute | Values / example | Meaning |
|---|---|---|
| `data-ai-selectable` | `hadith` \| `dua` \| `tafsir` \| `ayah` \| `article` | content type (required to be eligible) |
| `data-ai-ref` | `Bukhari:1`, `Muslim:2564` | source reference (hadith) |
| `data-ai-key` | `1:1` | Quran `surah:ayah` (ayah/tafsir); enables grounded Related Verses |

Selection payload handed to the widget/route:
```js
{ type,            // mapped: ayah→'quran', tafsir/article→'article', hadith→'hadith', dua→'dua'
  rawText,         // the highlighted text, trimmed, capped at the backend's 4000-char limit
  sourceRef,       // data-ai-ref if present
  surah, ayah }    // parsed from data-ai-key if present
```
`type` maps to the existing `QuranlyAI.setContext({ type, surah, ayah, rawText })` shape so grounding + chips work unchanged.

## 7. Selection detection & menu behavior

- Listen on `document` for `mouseup` and `selectionchange` (debounced ~120ms). On settle: if the selection is non-empty, ≥ N chars (e.g. 8), and both anchor+focus are inside the **same** `[data-ai-selectable]` container → show the menu; else hide it.
- **Positioning:** `getSelection().getRangeAt(0).getBoundingClientRect()`; place the menu above the rect (flip below if it would clip the top), clamped to the viewport. Fixed positioning; reposition on scroll/resize while open.
- **Shadow DOM** host appended to `<body>` (CSS isolation, matches widget/panel pattern). Brand tokens via CSS custom props with hard fallbacks.
- **Dismissal:** click outside, `Escape`, scroll-away, or selection collapse. Clicking a menu item does the action then hides.
- **Mobile / native selection toolbar:** the OS selection handles/toolbar still appear; our menu sits above the selection and is finger-sized. We do **not** try to suppress the native toolbar in v1. (Noted as a live-review item.)
- **Coexistence with `quran.html` verse-click:** the existing `setActiveVerse` → context flow stays. On the Quran page, ayah cards can *also* be marked `data-ai-selectable="ayah"` so highlighting a phrase works; a plain verse click keeps its current behavior. The two don't conflict — selection sets context on action-click; verse-click sets it on click.

## 8. Menu → route mapping

| Button | hadith | ayah / dua / tafsir | Route kind | Target |
|---|---|---|---|---|
| Summarize | ✅ | ✅ | ai | `summarize` |
| Explain | ✅ | ✅ | ai | `explain` |
| **Contextual 4th** | **Verify Hadith** | **Related Verses** | verify / ai | verify flow / `related_verses` |
| Save | ✅ | ✅ | save | `ii-saved-selections` |

Routing kind is decided in `select-to-ask-core` (`routeKind(action)` → `'ai' | 'verify' | 'save'`) and executed by a single `QuranlyAI.route(action, meta)` entry added to the controller, so the **widget chips and the selection menu share one router**.

## 9. Widget chip-row, content-type aware

Update `CHIPS` in `quranly-ai-core.js`. Universal middle two on every type: **Explain Simply** (`simple`), **Key Lessons** (`key_lessons`).

| `type` | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| `quran` | Explain this Ayah (`explain`) | Explain Simply | Key Lessons | Related Verses (`related_verses`) | Related Hadith (`related_hadith`) |
| `hadith` | Explain this Hadith (`explain`) | Explain Simply | Key Lessons | Related Verses (`related_verses`) | **Verify Hadith (`verify`)** |
| `article` (tafsir) | Explain this Passage (`explain`) | Explain Simply | Key Lessons | Related Verses (`related_verses`) | Related Hadith (`related_hadith`) |
| `dua` | Explain this Dua (`explain`) | Explain Simply | Key Lessons | Related Verses (`related_verses`) | Related Hadith (`related_hadith`) |

- `verify` is a pseudo-action: `QuranlyAI.route` sends it to the verify flow instead of the SSE endpoint. The panel's chip handler calls `QuranlyAI.route`, so chip #5 "Verify Hadith" behaves exactly like the menu's.
- Labels stay English defaults (matching current hardcoded `CHIPS`); i18n keys are a follow-up (Section 14).

## 10. Verify Hadith routing (new query contract on `verify.html`)

`verify.html` currently only accepts free text via `#verifyInput`. Add a **prefill contract on our own page**:
- `verify.html?q=<url-encoded selected text>` (optionally `&ref=<hadith ref>`) → on load, populate `#verifyInput` with `q` (prepend/annotate `ref` if present) and auto-trigger the existing verify action.
- `QuranlyAI.route('verify', meta)` navigates to that URL. No new backend endpoint; no verdict is generated by QuranlyAI.

## 11. Save behavior

New unified store **`ii-saved-selections`** (array of `{ text, type, sourceRef, ts }`), because a selection is a text snippet, not necessarily a whole item — this avoids colliding with the existing per-item stores (`ii-bookmarks`, `ii-quran-bookmarks`). Save = append + de-dupe + toast; no network, no quota impact. Existing per-item bookmark buttons are untouched. *(Open item — see Section 15.)*

## 12. Backend — generic `summarize` action

Files: `worker/src/quranlyai.js` (VALID_ACTIONS), `worker/src/lib/prompts.js` (instruction + tokens), `worker/test/prompts.test.js`.

- Add `'summarize'` to `VALID_ACTIONS`.
- **Context-aware prefix in `buildUserPrompt`:** for `action === 'summarize'`, the TASK line reads `Summarize the provided <label> in at most 5 bullet points. Do not exceed 5 bullets.` where `<label>` derives from `context.type` (`hadith`→"hadith", `dua`→"dua", `article`→"passage", `quran`→"ayah", else "text"). One action, per-type wording — no separate functions.
- `maxTokensFor('summarize')` → 400 (same as `summarize_tafsir`).
- **Not grounded** (operates on provided `rawText`); not added to `GROUNDED_ACTIONS`.
- "Summarize" is reached only from the **selection menu** (→ `summarize`); the `article` chip set is redefined to the 5-chip row (Section 9) and no longer carries a summarize chip. The legacy `summarize_tafsir` action stays in the backend (harmless, unused by chips) unless a remaining reference is found during implementation.
- System prompt (`QURANLYAI_SYSTEM_PROMPT`) is unchanged: §0 grounding still applies; summarizing provided text is grounded-on-provided.

## 13. No-hallucination guardrails

- Selected text → `rawText` → `explain`/`summarize` operate on provided text (grounded-on-provided). ✅
- `related_verses`/`related_hadith` stay grounded via the verified index; missing `data-ai-key` → `"not documented in available sources"`, never invented. ✅
- `verify` routes out to the verify flow; `save` is local. ✅
- Existing beta-unlimited / per-IP cap is unchanged — AI routes flow through the same `QuranlyAI.ask` → `/api/quranlyai/ask` path.

## 14. Edge cases & interactions

- **Empty/whitespace/too-short selection:** no menu.
- **Selection spanning multiple containers or partially outside:** require same eligible container for anchor+focus; else no menu.
- **Selection inside the menu/panel/FAB:** ignored (guard by Shadow host + `data-qai` markers).
- **RTL / Arabic text:** rect-based positioning is direction-agnostic; verified on an Arabic hadith/ayah selection.
- **`rawText` length:** trim + cap at 4000 (backend rejects longer).
- **i18n:** menu + chip labels ship as English defaults now; add `select.*` / chip i18n keys as a fast-follow so the 10-language build can localize.
- **Quota/beta:** unchanged.

## 15. Open items to confirm at spec review

1. **Save store** — OK to introduce `ii-saved-selections` (unified snippet store) rather than routing into the fragmented per-item stores? (Recommended.)
2. **Verify prefill** — OK to add the `verify.html?q=&ref=` prefill+auto-run contract to `verify.html`?
3. **Exact page file list** for marking containers this pass: `hadith.html`, `dua.html`, `knowledge-hub.html`, `islamic-studies.html`, `quran.html`. (Confirm these five.)

## 16. Testing

- **Unit (`select-to-ask-core`):** type→menu-model resolution; `routeKind` mapping; metadata builder (data-attr parsing, `data-ai-key`→surah/ayah, ref passthrough); eligibility (min length, same-container); text trim/cap.
- **Unit (backend `prompts.test.js`):** `summarize` in VALID_ACTIONS; `buildUserPrompt('summarize', {type:'hadith'})` contains "Summarize the provided hadith"; `maxTokensFor('summarize') <= 400`.
- **Manual (live):** on each of the five pages — highlight → menu appears at selection; each button routes correctly; Verify navigates to verify.html prefilled; Save persists + toast; widget opens with the correct content-type chip row; grounded actions return real sources or the honest fallback; mobile + Arabic/RTL sanity.

## 17. Files touched

**New:** `src/js/select-to-ask.js`, `src/js/select-to-ask-core.js`, `src/css/select-to-ask.css` (or inline Shadow styles), test for core.
**Modified:** `src/js/quranly-ai-core.js` (CHIPS per type), `src/js/quranly-ai.js` (`QuranlyAI.route` + `verify`/`save` helpers), `src/js/quranly-ai-panel.js` (chip handler → `route`), `worker/src/quranlyai.js` (VALID_ACTIONS), `worker/src/lib/prompts.js` (+`summarize`), `worker/test/prompts.test.js`, `verify.html` (query prefill), and the five content pages (script tag on all pages + `data-ai-selectable` markup on the five).
