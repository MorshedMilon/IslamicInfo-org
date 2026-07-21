# Module 8 — Narrator Reliability Panel / Isnad v2 (US-H11)

**Date:** 2026-07-21
**Branch:** `feat/hadith-module-8-narrator-panel` (off `main`)
**Covers:** PRD §3.2 US-H11, §4.6 · TechSpec §3.3, §4.3, §7.1 (narrator schema), §7.5 rule 3, §10 (edge cases)
**Status:** Approved 2026-07-21 — ready for implementation plan.

---

## 1. Guiding principle (highest religious-accuracy-risk module)

This component renders **named scholarly judgments about named historical narrators**. The single
overriding constraint: **I author ZERO narrator citation data.** Producing folio/entry numbers
(e.g. "Taqrib at-Tahdhib, no. 4686") that I cannot trace to the actual classical works would be
fabrication — violating the charter invariant ("never invent citations"), **PRD DoD-9** ("no
fabricated gradings"), the module's Religious Accuracy Gate, and TechSpec §7.5 rule 3. TechSpec
itself frames the citations as "validated at **data-authoring** time" — human content, not
engineering output.

**Therefore Module 8 = engineering + schema + honest states only.** The populated-table render path
is proven with **synthetic unit-test fixtures** (never shipped), exactly as Modules 2/7 tested the
disputed-grade dead-code path with mocked data. The real dataset is a separate scholar-verified
content task (CONTENT-POLICY human-review gate).

Data reality that makes this build-ahead: hadithapi returns `narrators: []`, so live isnad chains
have **no narrator rows to click**. Panels become reachable only once (a) a curated isnad dataset
supplies narrator rows AND (b) narrator reliability JSON exists — both human content.

## 2. File structure (ADR-027)

- **Create `src/js/narrator-panel-core.js`** — pure UMD (`window.II.narratorPanel` / `module.exports`),
  no DOM/network. `reliabilityParts(grade)`, `graderRowsHTML(citations)`, `buildNarratorPanelHTML(n)`,
  honest-state strings. Unit-tested (mirrors `hadith-feed-core.js` / `tier3-deep-view-core.js`).
- **Create `src/js/narrator-panel.js`** — DOM/data (`window.II.narratorPanelDom`): `init(host)`,
  `loadNarrator(id)` (lazy, cache-first), `toggleNarratorPanel(row, id)`, delegated click wiring.
  Host injected by `hadith.js` (like `II.tier3`).
- **Modify `src/js/api.js`** — add `fetchNarrator(id)` → cache-first `/data/narrator/{id}.json` (7d TTL).
  Static asset path (not `/api/`), so `_apiUrl`/`API_BASE` correctly leave it untouched (ADR-028).
- **Modify both isnad node renderers** — `hadith.js` `isnadNodeHTML` and `tier3-deep-view-core.js`
  `isnadInlineHTML`: emit `data-narrator-id="{n.id}"` (and a clickable affordance) on each node so
  rows become panel triggers *when narrators exist*. No live behavior change (chains still empty).
- **Modify `hadith.html`** — reuse existing `.narrator-panel` / `.rel-*` shells; add any missing inline
  CSS. Panel = nested `.card` with `--inner-light` shadow (NO new shadow token — DoD).
- **Docs**: TASKS.md (dataset content task), DECISIONS.md (ADR — engineering-only, data deferred).

**Load order in `hadith.html`:** `narrator-panel-core.js` → `narrator-panel.js` → `hadith.js`
(core before dom before the wiring host).

## 3. Narrator schema (TechSpec §7.1 — canonical, do not invent fields)

`/data/narrator/{id}.json`:
```json
{
  "id": "string",
  "fullName": "string",
  "arabicName": "string",
  "lifespan": "string",
  "era": "string",
  "reliabilityGrade": "thiqah | saduq | daif | unknown",
  "graderCitations": [
    { "scholar": "string", "gradeText": "string", "source": "string", "sourceRef": "string" }
  ]
}
```
Optional display fields rendered only when present (module spec asks for kunya/nasab, place):
`kunya`, `nasab`, `place`. These are optional — absence renders nothing, never a placeholder.

## 4. Panel content (module spec §SCOPE-IN)

Nested `.card` (`.narrator-panel`) injected below the clicked isnad row (inline, NOT a modal):
avatar · `fullName` + `arabicName` · kunya/nasab (italic 13px, optional) · `lifespan` + place ·
**reliability badge** · **gradings table**.

- **`reliabilityParts(grade)`** → `{ className, label, dotClass }`:
  - `thiqah` → green (reuse `--grade-sahih`), `.rel-thiqah`, label "Thiqah"
  - `saduq` → gold (reuse `--gold-*`), `.rel-saduq`, label "Saduq"
  - `daif` → red (reuse `--grade-mawdu`), `.rel-daif`, label "Da'if"
  - anything else / missing → grey (reuse `--ink-*`), `.rel-unknown`, label "Unknown"
  (No new color tokens; reuse existing grade/gold/ink tokens per the locked design system.)
- **Gradings table** — one row per `graderCitations[]` entry, columns: scholar name / `gradeText`
  (e.g. "Thiqah thabt") / citation `source, sourceRef` rendered `font-mono 11px` (e.g. "Taqrib
  at-Tahdhib, no. 4686"). The module's "minimum 3 rows (Ibn Hajar, al-Dhahabi, al-Mizzi)" is a
  **target for well-documented narrators, not a mandate** — render exactly what's present, never pad.

## 5. Honest states (all built + unit-tested)

| Condition | Render |
|---|---|
| `graderCitations: []` | "No scholar citations available for this narrator" (never fabricate rows) |
| Narrator not in DB (404 / no `id`) | grey `.rel-unknown` dot + tooltip "Unknown narrator"; panel shows unavailable |
| Fetch failure | "Reliability data unavailable for this narrator" (per-narrator `catch`, dot retained) |

## 6. Shipped data

**No `/data/narrator/*.json` containing citations.** Ship ONE clearly-marked structural template
`data/narrator/_schema.example.json` with **empty `graderCitations`** and a `_note` field declaring it
a schema template (renders the honest "no citations" state; contains no gradings). Everything else is
honest-unavailable live.

## 7. Side-artifacts

- **TASKS.md**: 🕌🚧 "Narrator reliability dataset — scholar-verified" — seed `/data/narrator/*.json`
  from Taqrib at-Tahdhib / Tahdhib al-Kamal / Siyar A'lam an-Nubala'; every `graderCitations` entry
  through the islamic-authenticity/hadith-verifier skill; DoD-9 + CONTENT-POLICY §5 human-review gate.
  Explicitly a Product + Scholarly Review task, not engineering.
- **DECISIONS.md**: short ADR — Module 8 ships engineering-only; narrator reliability data deferred to
  a human-curated, scholar-verified dataset; never fabricate citations to fill the "min 3 rows" target.

## 8. Definition of Done

- [ ] Zero fabricated gradings — no citation data authored; shipped template has empty `graderCitations`.
- [ ] Missing-citation and unknown-narrator states both handled per spec (§5), unit-tested.
- [ ] Panel is a nested `.card` with `--inner-light` shadow — no new shadow token.
- [ ] `reliabilityParts` reuses existing grade/gold/ink tokens (no new colors); dark-mode legible.
- [ ] Panel is inline (not a modal); lazy-fetch on first open; per-narrator fetch `catch`.
- [ ] Isnad nodes emit `data-narrator-id`; wiring reachable when narrators exist (build-ahead).
- [ ] Unit tests (`worker/test/narrator-panel-core.test.js`) cover reliabilityParts, gradings rows,
      empty-citations state, and buildNarratorPanelHTML shape — with synthetic fixtures only.
- [ ] TASKS.md + DECISIONS.md entries added.
- [ ] Full worker suite green.

## 9. Out of scope (confirmed)

- The actual narrator reliability dataset (human-scholar content task).
- The upstream curated-isnad dataset (still `narrators: []` live).
- Any Trace View (§2.8) / Stage-4 work.

## 10. Verification note (required at session end)

Because I author no narrator data, the note will state: **zero narrator entries authored**; every
narrator renders an honest-unavailable state; populated rendering exercised via **synthetic test
fixtures only**; the reliability dataset is **pending human scholarly review** per CONTENT-POLICY §5 —
NOT presented as ship-ready.
