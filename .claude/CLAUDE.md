# Claude Code — IslamicInfo.org Entry Point

The **project charter** is at the root: `../CLAUDE.md`
The **design system v3.0** is at: `../docs/DESIGN-SYSTEM.md`
Claude Code reads this file first, then the root `CLAUDE.md` automatically.

## Context Reading Order

When starting any task, read these files in this priority order:

1. `CLAUDE.md` (root) ← Project charter: invariants, what must never happen, document map
2. `docs/DESIGN-SYSTEM.md` ← Full design system v3.0: tokens, components, nav rules, §24 enforcement
3. `skills/main/SKILL.md` ← Brand skill: condensed platform overview + hard constraints
4. `docs/CONTENT-POLICY.md` ← Islamic content rules, human review gate, authenticated vs AI separation
5. `docs/API-SPEC.md` ← All /api/ route contracts: endpoints, shapes, cache, fallbacks
6. `docs/DATA.md` ← localStorage key registry + schemas (ii-habits, is-progress, etc.)
7. `docs/architecture/ARCHITECTURE.md` ← System architecture, build stages, fallback table
8. `docs/brand/ISLAMICINFO_BRAND_IDENTITY.md` ← Brand identity rules

Then, for the specific page being worked on:

9.  `docs/prd/[page]_PRD*.md` ← Requirements
10. `docs/functional/[page]_Functional_Document*.md` ← Behaviour and states
11. `docs/tech-specs/[page]-technical-doc.md` ← Implementation spec
12. `mockups/[page].html` ← Visual blueprint (canonical — do not deviate)

## Reference docs (read when relevant to the task)

- `docs/DECISIONS.md` ← Why things are the way they are (ADR log)
- `docs/ANTI-HALLUCINATION-PROMPT.md` ← Verification rules + phase prompts
- `docs/CLAUDE-CODE-PLAYBOOK.md` ← Session workflow + task templates
- `Islamic-Prompt-Template/PAGE-BUILD-TEMPLATE.md` ← Master build prompt + per-page parameter sheet
- `TASKS.md` ← Live task board (backlog → in progress → done)
- `DEFINITION-OF-DONE.md` ← Per-task ship checklist

## Skill Library

- `skills/main/SKILL.md` ← Brand skill (always read)
- `skills/islamic-authenticity/` ← Hadith verifier + labels + trusted sources (read for all 🕌 content)
- `skills/qa/SKILL.md` ← QA and testing patterns
- `skills/inheritance/` ← Inheritance calculator spec + QA guide

## Non-Negotiable Invariants (summary — full list in root CLAUDE.md §3)

- No fatwas. No rulings. No halal/haram verdicts. Ever.
- Every Quran verse, hadith, or claim carries a source — or it is not shown.
- Never invent Arabic, hadith, citations, endpoints, tokens, or localStorage keys.
- Run the hadith-verifier skill before any hadith output.
- Design system is locked. No new colors/fonts. No raw hex inline.
- Root CLAUDE.md (charter) wins on any conflict with this file.
