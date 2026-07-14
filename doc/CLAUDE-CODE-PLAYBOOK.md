# CLAUDE-CODE-PLAYBOOK.md — How We Build With Claude Code
**Session workflow + reusable prompt templates · v1.0 · 2026-06-03**

> The goal is not "zero errors" — that is not achievable with an LLM. The goal is a
> process that **catches errors before they ship**: small scoped tasks, a plan you
> approve before any code is written, building against the blueprint, the
> `DEFINITION-OF-DONE` gate, green CI, and human review for content.
>
> **Core principle: thin prompt, heavy docs.** Your prompt should be short. It works
> because `CLAUDE.md` (the charter) auto-loads every session and carries the
> invariants, and your prompt just points Claude Code at the specific PRD, tech
> spec, and blueprint for the task. Do not paste rules into the prompt that already
> live in the docs — point to the file instead.

---

## 1. The Seven Session Rules

1. **One page or one feature per session.** Never batch unrelated work — it is the #1 cause of drift and half-finished changes.
2. **Charter is always loaded.** Keep `CLAUDE.md` at the repo root so Claude Code reads it automatically. Never rely on memory of it.
3. **Plan before code.** Ask for a written plan first; approve it; *then* let it build. (See §3.)
4. **Build against the blueprint.** If `mockups/<page>.html` exists, it is the spec. Match it; change only what you asked for.
5. **Review the diff.** Never blind-accept. Read what changed before you keep it.
6. **Gate before done.** Run the applicable `DEFINITION-OF-DONE` gates. 🕌 content is not done until human review sign-off.
7. **When a rule gets missed, fix the doc, not just the code.** If Claude Code breaks a rule that wasn't written down clearly, add it to the right doc so it can't recur.

## 2. Build Order

Follow `TASKS.md` / `PROJECT_STRUCTURE` order: `tokens.css` + `global.js` first (everything depends on it), then `index.html`, then the simpler pages (`about`, `verify`, `habits`), up to the most complex (`hadith`, `quran`). Each page lands fully — both themes, gates passed — before the next begins.

## 3. Plan-Before-Code (the biggest error-reducer)

Before any page or feature, send the build prompt but **ask for a plan, not code**:

```
Before writing any code, give me a short build plan for <page/feature>:
1. Which sections/components you'll build, in order
2. Which blueprint elements you're copying vs. what's new
3. Any place the PRD/tech-spec/blueprint conflict or are unclear — STOP and ask, don't guess
4. Which invariants from CLAUDE.md apply here
Do not write code yet. Wait for my approval.
```

You read the plan, correct misunderstandings, then reply "approved — build it." This catches wrong assumptions while they're cheap to fix (a sentence) instead of expensive (a full regenerate).

## 4. Prompt Templates

### 4.1 Build a page

```
Build src/<page>.html for IslamicInfo.org.

Follow, in priority order:
- CLAUDE.md (charter — invariants; auto-loaded)
- docs/DESIGN-SYSTEM.md (locked tokens, components, §24 enforcement)
- docs/prd/<page>_PRD_*.md (requirements — feature scope)
- docs/functional/<page>_Functional_Document*.md (behavior, states, edge cases)
- docs/tech-specs/<page>_TechSpec*.md (implementation detail)
- mockups/<page>.html (CANONICAL visual blueprint — match exactly)

Rules for this task:
- Static-first: renders without JS. Both light and dark themes.
- Change only what this task requires; preserve blueprint design/copy verbatim.
- localStorage keys only from DATA.md. No /api/ calls in Stage 1 (use static/fallback values).
- Any Islamic content 🕌 must follow CONTENT-POLICY; run the hadith-verifier skill for any hadith.
- If anything is unclear or docs conflict: STOP and ask. Do not improvise on design or content.

First give me a plan (§3). Don't write code until I approve.
```

### 4.2 Wire live data / an API route (Stage 2+)

```
Wire <feature> on src/<page>.html to <endpoint> per docs/API-SPEC.md.

- Use the cache-first + fallback-on-error pattern (ARCHITECTURE §14.1).
- No API key in client code — the call goes through /api/<route>.
- Match the response shape and fallback in API-SPEC.md exactly. If the spec is missing
  a field you need, STOP and ask — then update API-SPEC.md, don't invent the shape.
- Do not change any surrounding design or copy. Live data is injected only.
- localStorage cache key must match DATA.md.

Plan first. Wait for approval.
```

### 4.3 Add / edit Islamic content 🕌

```
<Add/Fix> <content> on src/<page>.html.

This is a content task — CONTENT-POLICY governs.
- Run the hadith-verifier skill before outputting ANY hadith. Memory alone is not enough.
- Every verse/hadith/claim carries a source; grade + grading scholar for hadith.
- Apply weak/fabricated/disputed notices verbatim from labels-and-notices.md.
- No fatwa/ruling. AI/speculative content must be visually distinct + labeled + attributed.
- Disclaimer/methodology strings are hard-coded — do not generate or alter them.

Output the content + its citations. Flag it for human review — do NOT consider this
done until a qualified reviewer signs off.
```

### 4.4 Fix a bug / iterate

```
On src/<page>.html, <describe the exact problem and where it appears>.

- Change ONLY what's needed to fix this. Do not refactor or "clean up" unrelated code.
- Don't alter design, copy, nav order, or any invariant from CLAUDE.md.
- Show me the diff and explain what you changed and why.
```

### 4.5 New architectural choice

```
This task needs a decision: <describe>. 
Before implementing, propose options with trade-offs and recommend one.
If we proceed, add an ADR to docs/DECISIONS.md. Don't implement until I choose.
```

## 5. Before You Mark It Done

Run the relevant gates from `DEFINITION-OF-DONE.md` (it self-selects by task type):
Universal always; Design for visual changes; Content for 🕌; Data for storage; API for
routes; A11y/Perf for full pages. Confirm CI is green. For 🕌 tasks, record the
reviewer + date + sources. Then move the task to Done in `TASKS.md`.

## 6. When It Goes Wrong

- **Wrong direction?** Stop, revert the change, narrow the scope, re-prompt. Don't pile fixes on a bad base.
- **It broke an invariant?** That usually means the rule wasn't explicit enough. Add it to CLAUDE.md / DESIGN-SYSTEM / CONTENT-POLICY so the next session can't repeat it.
- **It's guessing?** Your prompt gave it room to. Point it at the exact file/section, or add "STOP and ask if unclear."
- **Context getting noisy?** Start a fresh session. One page per session keeps context clean and accuracy high.

## 7. What NOT To Do

- Don't paste the whole doc set into one prompt — point to files; the charter is already loaded.
- Don't ask for multiple pages in one session.
- Don't accept code you haven't read the diff of.
- Don't let CI green stand in for content review — CI can't check whether a hadith grade is correct.
- Don't skip the verifier skill because a hadith is "well known."

---
*Companion to: CLAUDE.md (charter) · DEFINITION-OF-DONE.md (gates) · TASKS.md (board)
· CONTENT-POLICY.md · API-SPEC.md · DATA.md · DECISIONS.md · DESIGN-SYSTEM.md.*
