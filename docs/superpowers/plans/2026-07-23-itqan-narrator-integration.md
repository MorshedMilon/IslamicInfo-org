# Itqan Narrator-Reliability Integration — Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]` tracking. **DO NOT start building until the owner approves this plan** (plan-first, per the request) — especially the matching approach (§Decision).

**Goal:** Populate the Module-8 narrator reliability panel with real *jarh wa ta'dil* gradings from the Itqan Rijal Database — sourced, cited (per classical text), confidence-gated, behind a default-OFF flag, owner-reviewed before go-live.

**Data (verified):** Public static CORS-friendly JSON — manifest `https://r3genesi5.github.io/Itqan/app/data/rijal/manifest.json` → 7 grade-tier chunks, 115,735 profiles. Schema per id: `full_name`, `kunya`, `grade_en`/`grade_ar`, `namings[]`, `classical_sources{text:{entry_id,grade_en,grade_ar}}`, `teachers[]`/`students[]`, `dhahabi`, `death`, `tabaqat`, `city`. License: MIT code / public-domain classical texts (attribution required). ADR-045/046.

---

## THE decision to lock first (matching approach)

**Problem:** Itqan names are **Arabic-script only**; hadithapi gives the narrator as an **English** string (`englishNarrator`). No direct join key.

**Proposed (v1): curated English→id map + confidence gate.**
- Author a **curated `narrator-en-map.json`** (~150–300 most-common narrators: `english_normalized → itqan_id`), each verified by matching the known Arabic name to the Itqan profile. Covers the small set of narrators (mostly Companions) that appear in the large majority of hadith.
- Match: normalize `englishNarrator` → look up in the curated map → **exact hit = confident**; **no hit = "not yet verified"** (never a guess).
- **Transliteration fuzzy-matching = deferred to v2** (higher coverage, but false-match risk — do it only after v1 proves the pipeline and the owner has reviewed data quality).
- This is precise + honest: only verified matches shown, everything else "not yet verified." Coverage is **partial by design** — that's the safe trade.

*(Curating the name map is factual name-equivalence, owner-approved, not fabrication.)*

**Alternative (v1-broad):** algorithmic Arabic↔Latin transliteration + fuzzy match now — broader coverage but real mislabel risk. **Not recommended for v1.**

→ **Owner: approve "v1 curated + confidence gate" (recommended) or "v1-broad transliteration"?**

---

## Division of labor
- **I build (all code):** D1 schema, ingestion script, matching core (pure, tested), `/api/narrator` Worker endpoint, `api.js` wiring, narrator-panel display, the starter curated name map, feature flag, tests. Flag **default OFF**.
- **Owner runs (needs your Cloudflare account):** `wrangler d1 create`, execute the ingestion (fetch chunks → insert 115k rows), review a data sample, flip the flag on. I provide exact commands.

---

## Tasks

### Task 1: D1 schema + wrangler binding
**Files:** Create `worker/migrations/0001_narrators.sql`; modify `worker/wrangler.toml` (D1 binding, commented until owner creates the DB).
- [ ] `narrators` table: `id INTEGER PRIMARY KEY, full_name TEXT, kunya TEXT, grade_en TEXT, grade_ar TEXT, dhahabi TEXT, death TEXT, tabaqat TEXT, city TEXT, classical_sources TEXT (JSON), namings TEXT (JSON)`.
- [ ] Index on `grade_en`. (Lookup is by `id` via the curated map, so no name index needed in v1.)
- [ ] wrangler.toml: `[[d1_databases]]` binding `DB_RIJAL` (commented placeholder + instructions for the owner to fill `database_id` after `wrangler d1 create`).
- [ ] Commit.

### Task 2: Ingestion script (fetch → transform → D1)
**Files:** Create `worker/scripts/ingest-itqan.mjs`.
- [ ] Node script: fetch manifest → fetch the 7 chunks → for each profile, emit an INSERT (batched) with the fields above (`classical_sources`/`namings` JSON-stringified). Idempotent (INSERT OR REPLACE).
- [ ] Output a `.sql` file (or use `wrangler d1 execute --file`) so the owner runs one command. Include exact run instructions in a comment + the plan.
- [ ] Dry-run mode that prints counts per grade tier (must total 115,735) without writing — for verification.
- [ ] Commit.

### Task 3: Matching core (pure, TDD)
**Files:** Create `src/js/narrator-match-core.js`; Create `worker/test/narrator-match-core.test.js`; Create `src/data/narrator/narrator-en-map.json` (starter curated map).
- [ ] `normalizeName(s)` — lowercase, strip honorifics/punctuation/diacritics, collapse spaces, unify "ibn/bin/b.", "abu/abi", etc.
- [ ] `matchNarrator(englishName, enMap)` → `{ id, confidence:'high' } | null`. v1: exact normalized hit in the curated map = high; else null.
- [ ] Tests: exact hit, honorific/spelling variants normalize to a hit, unknown → null, empty/garbage → null.
- [ ] Starter `narrator-en-map.json`: ~30–50 of the most common narrators to prove the pipeline (Abu Hurairah, Umar, Aisha, Ibn Abbas, Anas, Ibn Umar, Jabir, Abu Sa'id, …), each `{ "abu hurairah": 106, ... }` with the Itqan id **verified against the profile's Arabic name**. Expand later.
- [ ] Commit.

### Task 4: `/api/narrator` Worker endpoint
**Files:** Modify `worker/src/` (router + a `narrator.js` handler).
- [ ] `GET /api/narrator?name=<englishNarrator>`: load curated map → `matchNarrator` → if match, `SELECT` the profile from D1 by id → return `{ ok:true, matched:true, confidence, narrator:{ id, full_name, kunya, grade_en, grade_ar, classical_sources, dhahabi, death, tabaqat, city } }`. No match → `{ ok:true, matched:false }`. Behind the flag (Task 7): flag off → always `{ ok:true, matched:false, disabled:true }`.
- [ ] CORS + cache headers (profiles are static → long cache).
- [ ] Commit.

### Task 5: `api.js` fetchNarrator wiring
**Files:** Modify `src/js/api.js`.
- [ ] Point `fetchNarrator` at `/api/narrator?name=` (currently `/data/narrator/{id}.json`). Keep the old path as fallback for any existing callers; gate behind the flag.
- [ ] Commit.

### Task 6: Narrator-panel display (consolidated + per-text breakdown)
**Files:** Modify `src/js/narrator-panel-core.js` (+ its tests), `src/js/narrator-panel.js`, `hadith.html` (CSS if needed).
- [ ] Headline: consolidated `grade_en`/`grade_ar` (e.g. "Reliable — Thiqah (ثقة)").
- [ ] **Breakdown:** render `classical_sources` — one row per text (Taqrib, Mizan, Thiqat, Siyar, …): text name + its `grade_en`/`grade_ar` + entry_id. **Surface disagreement** (don't flatten). This satisfies "always show which text/scholar the grading comes from."
- [ ] Attribution: "Itqan Rijal Database · classical sources" (link) + the named texts.
- [ ] **No match / flag off → existing honest "not yet verified" / "Reliability data unavailable" state** (already built, `.dv-empty--compact role=note`).
- [ ] Escape all fields (XSS); Arabic fields `dir="rtl"`. Update narrator-panel-core tests.
- [ ] Commit.

### Task 7: Feature flag (default OFF) + review gate
**Files:** Modify the flag location (mirror Module-13 `HADITH_AI_EXPLAIN_ENABLED`).
- [ ] `ITQAN_NARRATOR_ENABLED = false` (default). Endpoint + panel both respect it: off → "not yet verified"/unavailable everywhere, no Itqan calls.
- [ ] Document the go-live review gate: owner ingests, spot-checks a sample of profiles against known classical gradings (dataset reliability, not just wiring), approves, then flips the flag.
- [ ] Commit.

### Task 8: Full regression + owner runbook
- [ ] `cd worker && npm test` green.
- [ ] Write a short **owner runbook** (in the plan or a RUNME.md): `wrangler d1 create rijal` → paste id into wrangler.toml → `node worker/scripts/ingest-itqan.mjs` → `wrangler d1 execute … --file` → verify counts → sample-review → flip flag → deploy.

---

## Definition of done
- Code builds + tests pass; flag default OFF (feature dark).
- With flag ON + D1 populated: a hadith whose `englishNarrator` is in the curated map shows the real consolidated grade + per-text `classical_sources` breakdown, cited to Itqan + the classical texts; unknown narrators show "not yet verified".
- No fabrication: every displayed grade comes from a real Itqan record; no match → "not yet verified". No wrong-verdict path (confidence gate).
- Owner review gate documented; D1 provisioning/import + flag-flip are the owner's steps.

## Out of scope (v1)
- Transliteration fuzzy-matching (v2 — broader coverage).
- Isnad-chain reconstruction from `teachers`/`students` (future).
- Curating the *full* long-tail name map (starter set now; expand iteratively).
