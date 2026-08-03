# Claude Code — IslamicInfo.org Entry Point

The **project charter** is at the root: `../CLAUDE.md`
The **design system v3.0** is at: `../doc/DESIGN-SYSTEM.md`
Claude Code reads this file first, then the root `CLAUDE.md` automatically.

## Context Reading Order

When starting any task, read these files in this priority order:

1. `CLAUDE.md` (root) ← Project charter: invariants, what must never happen, document map
2. `doc/DESIGN-SYSTEM.md` ← Full design system v3.0: tokens, components, nav rules, §24 enforcement
3. `skills/main/SKILL.md` ← Brand skill: condensed platform overview + hard constraints
4. `doc/CONTENT-POLICY.md` ← Islamic content rules, human review gate, authenticated vs AI separation
5. `doc/API-SPEC.md` ← All /api/ route contracts: endpoints, shapes, cache, fallbacks
6. `doc/DATA.md` ← localStorage key registry + schemas (ii-habits, is-progress, etc.)
7. `doc/architecture/ARCHITECTURE.md` ← System architecture, build stages, fallback table
8. `doc/brand/ISLAMICINFO_BRAND_IDENTITY.md` ← Brand identity rules

Then, for the specific page being worked on:

9.  `doc/prd/[page]_PRD*.md` ← Requirements
10. `doc/functional/[page]_Functional_Document*.md` ← Behaviour and states
11. `doc/tech-specs/[page]-technical-doc.md` ← Implementation spec
12. `mockups/[page].html` ← Visual blueprint (canonical — do not deviate)

## Reference docs (read when relevant to the task)

- `doc/DECISIONS.md` ← Why things are the way they are (ADR log)
- `doc/ANTI-HALLUCINATION-PROMPT.md` ← Verification rules + phase prompts
- `doc/CLAUDE-CODE-PLAYBOOK.md` ← Session workflow + task templates
- `Islamic-Prompt-Template/PAGE-BUILD-TEMPLATE.md` ← Master build prompt + per-page parameter sheet
- `doc/TASKS.md` ← Live task board (backlog → in progress → done)
- `doc/DEFINITION-OF-DONE.md` ← Per-task ship checklist

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

Dua page naming is governed by `doc/DUA-KEYWORD-NAMING-v1_0.md` as amended by
`doc/DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md`. v1.1 wins on conflict. Read both
before touching /duas/ titles, slugs, H1s, or meta descriptions.

`doc/DUA-CONTENT-INTEGRITY-v1_0.md` sits **above both naming specs** and
supersedes v1.1 §A1 (ADR-054). Naming is downstream of integrity: naming,
topic-assignment and indexing work is paused until its Gates 1–3 clear.
Read it first.

## Repo trap — line endings (STANDING RULE, added 2026-08-03)

**This repo's tracked text files are restored by git with CRLF on Windows.** Any operation
that is line-ending sensitive — regex strip or insert, file splicing, anchor matching,
"replace everything between X and Y" — **must normalise first, or match `\r?\n` explicitly.**

This is a known trap, not a one-off. It silently defeated **three separate operations in a
single session on 2026-08-03**, and in every case the failure was invisible — the operation
reported success and did nothing:

1. **`sitemap.xml` strip-and-rebuild** in both dua builders. The regex ended ``<\/url>\n``,
   matched zero of the CRLF entries, so the strip became a no-op and every URL was appended a
   second time. This is the real cause of the "duplicate hub URLs" seen on 2026-08-01 — the
   bug appears on a fresh checkout and hides itself as soon as one build rewrites the file
   with LF. Fixed to ``<\/url>\r?\n``.
2. **`editorial-policy.html` splice** from `about.html`. The `<main>…</main>` anchor used
   ``\n``, matched nothing, and produced a page that was a byte-for-byte copy of about.html.
3. **Reviewer-package Part 7/8 insertion**. The anchor ``\n---\n\n## Sign-off`` matched
   nothing, so both document bodies were silently dropped.

**Verify against a string that only exists if the operation worked.** Incident 3 was reported
as successful because the check tested a substring that also appeared in a sign-off row added
by the *same* run — a self-confirming check. Assert on something unique to the payload, and
prefer asserting a count or a parse over asserting a substring.
