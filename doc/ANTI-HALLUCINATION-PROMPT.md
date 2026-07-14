# ANTI-HALLUCINATION-PROMPT.md — Claude Code Guardrails
**Master rules block + phase prompts · v1.0 · 2026-06-03**

> Hallucination on this project is prevented by **verification gates**, not by tools.
> GSD (fresh context per phase), Claude-Mem (continuity), and Local-Review (PR gate)
> manage *context and process* — they reduce drift, not invention. This file makes
> the gates fire inside that flow.
>
> Paste **§1 (Master Rules)** at the top of `CLAUDE.md` so it auto-loads, and/or into
> the GSD *discuss* phase. Use **§3** phase prompts for discuss → plan → execute →
> verify. Use **§4** as the Local-Review checklist.

---

## 1. Master Rules Block (paste verbatim)

```
ANTI-HALLUCINATION RULES — IslamicInfo.org. These override convenience and speed.

SOURCE OF TRUTH
- The project docs are the only source of truth: CLAUDE.md (charter), DESIGN-SYSTEM.md,
  PRDs, functional docs, tech specs, ARCHITECTURE.md, API-SPEC.md, DATA.md,
  CONTENT-POLICY.md, DECISIONS.md, and the skills/ folder.
- Memory (Claude-Mem or any re-injected session context) is CONTEXT, NOT TRUTH.
  If memory conflicts with a doc, the doc wins. Never present re-injected memory as a
  verified fact. Re-verify anything memory claims before relying on it.

NEVER INVENT
- Do not invent: Quran verses, hadith, Arabic text, transliterations, or citations.
- Do not invent: API endpoints, request/response shapes, env vars, file paths,
  component names, CSS tokens, or localStorage keys. If it is not in the docs, it does
  not exist — STOP and ask, or propose adding it (with an ADR for architecture).
- Do not invent scholarly consensus, grades, or rulings.

VERIFY OR WITHHOLD
- Before outputting ANY hadith: run the hadith-verifier skill. Memory alone is never
  enough, even for "well-known" hadith. If verification fails, output the Warning Block
  and withhold — do not guess.
- Every verse/hadith/claim carries a source. No fatwas, rulings, or halal/haram verdicts.
- Silence beats fabrication. Accuracy beats speed.

SEPARATE VERIFIED FROM ASSUMED
- Distinguish "VERIFIED against <file/section or source URL>" from "ASSUMPTION" and from
  "FROM MEMORY (unverified)". Never let the last two read as fact.
- Cite the doc + section for every project claim, e.g. "per API-SPEC.md /api/hadith".
  A claim with no citable source is an assumption and must be labeled one.

WHEN UNCERTAIN
- If a doc is unclear, missing, or two docs conflict: STOP and ask. Do not improvise on
  design, architecture, or religious content.
- Triggers to STOP: a ruling/fatwa request; a disputed hadith grade; a madhhab/sect
  difference; Arabic/citation you cannot verify; a needed field absent from the spec.

EVERY RESPONSE ENDS WITH A VERIFICATION NOTE (see §2).
```

## 2. Mandatory Verification Note (end of every execute/verify response)

```
── VERIFICATION ──────────────────────────────────────────────
VERIFIED   : <claims/code checked, against which file§/source/skill>
ASSUMPTIONS: <anything inferred, not in the docs — flag for confirmation>
UNVERIFIED : <anything from memory or unsourced — NOT to be trusted as fact>
NEEDS HUMAN REVIEW (🕌): <Islamic content requiring qualified sign-off, or "none">
DOC GAPS   : <missing/conflicting docs found — fix the doc, not just the code>
──────────────────────────────────────────────────────────────
```

This note is the core anti-hallucination device: it forces the model to declare what
it actually checked versus what it filled in. If `UNVERIFIED` is non-empty, that
content is not done.

## 3. GSD Phase Prompts

Each phase runs in fresh context. Carry forward the approved output of the prior phase
(not the whole transcript). The Master Rules (§1) apply in every phase.

**DISCUSS**
```
We're scoping <page/feature>. Read CLAUDE.md, the relevant PRD/functional/tech-spec,
and mockups/<page>.html. Do NOT plan or code yet.
Output: (a) your understanding of the goal in 5 bullets, (b) every ambiguity or
doc conflict you found, (c) which invariants and 🕌 content rules apply.
End with the Verification Note. Ask me your open questions.
```

**PLAN**
```
Approved understanding: <paste>. Now produce a build plan only — no code.
List the steps/sections in order, what you copy from the blueprint vs. what's new,
which docs each step relies on (cite file§), and where you'll run the hadith-verifier
skill. Flag anything that needs a DECISIONS.md ADR. End with the Verification Note.
```

**EXECUTE**
```
Approved plan: <paste>. Build exactly that — nothing out of scope, no refactoring of
unrelated code, no design/copy changes beyond the plan. Use only tokens (DESIGN-SYSTEM),
keys (DATA.md), and endpoints (API-SPEC.md) that exist in the docs; if you need one
that doesn't exist, STOP. Produce a reviewable diff. End with the Verification Note.
```

**VERIFY** (hand to Local-Review, §4)
```
Self-review the diff against DEFINITION-OF-DONE.md for this task type. Then list, line
by line: any invented endpoint/key/path/citation, any hadith not run through the skill,
any unsourced claim, any 🕌 content not yet human-reviewed. End with the Verification Note.
```

## 4. Local-Review Gate (review the diff like a junior dev's PR)

Before merge, you (the human) confirm:

- [ ] Diff is **only** what the approved plan said — no scope creep, no "cleanup"
- [ ] No invented endpoint / env var / file path / component / token / localStorage key — all trace to a doc
- [ ] No invented or memory-sourced verse, hadith, Arabic, or citation
- [ ] Every hadith shows skill verification + grade + grading scholar; notices applied
- [ ] No fatwa/ruling; AI/speculative content labeled + attributed; disclaimers hard-coded
- [ ] Verification Note present; `UNVERIFIED` is empty; `ASSUMPTIONS` resolved
- [ ] 🕌 content has qualified human sign-off recorded (reviewer + date + sources)
- [ ] `DEFINITION-OF-DONE` gates pass; CI green
- [ ] Comments addressed via iteration — re-review, don't blind-accept fixes

Merge only when all are checked.

## 5. Claude-Mem / Continuity Rules

- Memory is for **continuity of intent and state** (what page we're on, what was decided),
  never for religious facts or spec details. Those are re-read from the docs each time.
- At session start, reconcile memory against the docs; if they disagree, the docs win and
  the memory is treated as stale.
- Never let a re-injected summary substitute for running the hadith-verifier skill or for
  re-checking API-SPEC/DATA — re-verify.
- If memory surfaces a "decision" not in DECISIONS.md, it is not a decision yet — confirm
  and record it, or discard it.

## 6. The One-Paragraph Version (if you only paste one thing)

```
You are building IslamicInfo.org. The project docs are the only source of truth; memory
is context, not truth, and the docs win on any conflict. Never invent verses, hadith,
Arabic, citations, endpoints, keys, paths, tokens, or rulings — if it's not in the docs,
STOP and ask. Run the hadith-verifier skill before any hadith; if it can't be verified,
withhold. No fatwas. Separate VERIFIED (cite the file§ or source) from ASSUMPTION from
UNVERIFIED-MEMORY, and end every response with a Verification Note listing each. Islamic
content is not done until a qualified human signs off. Silence beats fabrication;
accuracy beats speed.
```

---
*Companion to: CLAUDE.md · CONTENT-POLICY.md · API-SPEC.md · DATA.md ·
DEFINITION-OF-DONE.md · CLAUDE-CODE-PLAYBOOK.md · skills/islamic-authenticity/.*
