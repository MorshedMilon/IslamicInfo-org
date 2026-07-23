# Itqan Narrator Reliability — Owner Runbook

Everything code-side is built and shipped **flag OFF** (feature dark, 438 tests pass).
These are the steps only you can run (they need your Cloudflare account) to take it live.
Plan/decisions: `docs/superpowers/plans/2026-07-23-itqan-narrator-integration.md`, ADR-046/047.

## 1. Provision D1
```
cd worker
wrangler d1 create rijal
```
Copy the printed `database_id` into `worker/wrangler.toml` (uncomment the `[[d1_databases]]`
block — binding `DB_RIJAL` — and paste the id).

## 2. Ingest the Itqan data (runs on your machine — Node 18+)
```
node worker/scripts/ingest-itqan.mjs --dry     # verify it fetches + counts to 115,735
node worker/scripts/ingest-itqan.mjs           # writes worker/migrations/0002_narrators_data.sql
wrangler d1 execute rijal --file worker/migrations/0001_narrators.sql        # schema
wrangler d1 execute rijal --file worker/migrations/0002_narrators_data.sql   # data
```
Spot-check: `wrangler d1 execute rijal --command "SELECT full_name, grade_en FROM narrators WHERE id=106"`
→ should return Abu Hurairah / companion.

## 3. Expand the curated name map (the coverage lever)
`src/data/narrator/narrator-en-map.json` currently has only the verified Abu Hurairah=106.
Add the ~150–300 common narrators (mostly Companions): for each, find the Itqan id by its
Arabic name and add `"<normalized english>": <id>`. Query the ingested D1 to find ids, e.g.:
```
wrangler d1 execute rijal --command "SELECT id, full_name, kunya FROM narrators WHERE grade_en='companion' AND full_name LIKE '%عمر بن الخطاب%'"
```
Every entry must be verified against the real Arabic profile (never guessed). Keys are the
normalized English form (see `narrator-match-core.normalizeName`); add spelling variants as
separate keys → same id.

## 4. Deploy + review gate (before flipping the flag)
```
cd worker && wrangler deploy
```
Now `GET https://<worker>/api/narrator/106` should return the real Abu Hurairah profile.
**Review gate (ADR-047):** spot-check a sample of profiles against known classical gradings
to confirm the *dataset itself* is reliable (not just the wiring). Only then:

## 5. Wire the display + flip the flag ON
Two small remaining steps (deferred by design — need your call on placement + your review):
1. **Display trigger:** hadithapi gives no isnad chain — only the single `englishNarrator`
   (the Companion). Decide where the reliability shows (e.g. a "narrator reliability" chip on
   the deep-view for that narrator). Wire: `narrator-match-core.matchNarrator(englishNarrator,
   map)` → id → `api.fetchNarratorById(id)` → if `matched`, render
   `narratorPanel.itqanProfileHTML(res.narrator)`; else the existing "not yet verified" state.
2. **Flag:** set `ITQAN_NARRATOR_ENABLED = true` in `src/js/narrator-match-core.js`.

## Safety invariants (already enforced in code)
- No curated-map hit → **"not yet verified"** (never a fuzzy/guessed narrator verdict — ADR-047).
- D1 unbound / lookup fail → `matched:false` → same honest state.
- Displays real Itqan data verbatim with attribution (Itqan + the classical texts); the per-text
  `classical_sources` breakdown is shown so scholar disagreement isn't hidden.
- Feature stays dark until you complete steps 1–5.
