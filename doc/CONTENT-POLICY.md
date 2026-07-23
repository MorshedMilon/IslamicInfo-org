# CONTENT-POLICY.md — Islamic Content Governance
**Project-level content rules and review gate · v1.1 · 2026-07-23**
*(v1.1 — §5 approver changed to project owner Morshed Milon; ADR-044. Authenticity / no-fabrication rules unchanged.)*

> This is the *governance layer*. It states project-wide content rules, the
> separation of authenticated vs. speculative content, and the human review gate.
> The detailed citation templates, grade labels, and mandatory notices live in
> `skills/islamic-authenticity/islamic-authenticity.md` and
> `skills/islamic-authenticity/labels-and-notices.md` — this document does **not**
> duplicate them; it points to them and governs when they apply.
>
> **Priority:** Accuracy over speed. When in doubt, warn; never guess.
> Silence is always preferable to fabrication.

---

## 1. Scope

Applies to all Islamic *content* surfaced anywhere in the platform: page copy,
daily verse/hadith/dua rotation, Knowledge Hub articles, Islamic Studies lessons,
Verify results, Tools outputs (e.g. inheritance calculator), and any AI-generated
explanation. It does **not** govern code style or visual design — those are in
`DESIGN-SYSTEM.md`.

## 2. The Non-Negotiables (summary — full rules in the authenticity files)

1. **No fatwas, no rulings, no halal/haram verdicts.** Redirect to a qualified scholar.
2. **Source-or-withhold.** Every verse, hadith, or claim carries a reference, or it is not shown.
3. **Never invent** Quranic text, hadith, Arabic, transliteration, or citations.
4. **Hadith pass the verifier skill before output.** Memory alone is never sufficient.
5. **Grade every hadith, every time** — Sahih / Hasan / Da'if / etc., with the grading scholar named.
6. **Weak and fabricated narrations carry their mandatory notices** verbatim (see `labels-and-notices.md`).
7. **No claimed consensus without a documented source.** Name scholars; note dissent.
8. **Inheritance calculations cite the primary ayat** (an-Nisa' 4:11, 4:12, 4:176) and disclose the fiqh school applied.

Detailed templates and notice text: `skills/islamic-authenticity/islamic-authenticity.md`.

## 3. Authenticated vs. Speculative — Hard Separation

The brand rule "do not mix speculative content with authenticated content" is
enforceable, not aspirational.

| Tier | Examples | Requirement |
|---|---|---|
| **Authenticated** | Quran verses, verified hadith, sourced scholarly opinions | Primary-source citation visible; grade shown for hadith |
| **Speculative / AI** | AI explanations, summaries, "in simple terms" rewrites | Must be **visually distinct** and **labeled as AI-generated**; carries the QuranlyAI attribution |

Rules:
- AI-generated explanation must **never** be visually indistinguishable from a sourced primary text. Different container, label, and attribution are required.
- AI explanation may contextualize a primary source but must not *replace* it or restate it as if it were the source.
- Hard-coded disclaimer and methodology strings are part of the authenticated tier and are **never** generated or overwritten by the model/API.

## 4. AI Output Safety (applies to `/api/ask-claude` and any model output)

The following are hard-coded in the server-side system prompt and are **not overridable** by user input (see `API-SPEC.md §AI` and `ARCHITECTURE §5.2`):

- AI never issues a fatwa or religious ruling.
- AI always cites the hadith collection, book, and number, and shows the grade.
- If the user asks for a ruling: respond *"For personal religious guidance, consult a qualified scholar."*
- Server-side post-filter: if a response contains fatwa-adjacent verdict language, the server strips it, returns the scholar-redirect line, keeps the attribution, and logs the event.

## 5. Human Review Gate — The Primary Safeguard

This is the single most important protection against a confident-but-wrong ruling
reaching a user. It does not depend on the model getting it right.

**Approver — updated 2026-07-23 (ADR-044).** The sole human approver before any Islamic
content goes live is **Morshed Milon (project owner)**. A separate external-scholar
sign-off is **no longer required**. This is safe *only because* the authenticity rules
below are unchanged and non-negotiable: content is **sourced and cited, never generated**,
so the owner is approving real, traceable material — not the AI's opinion. The AI never
approves its own output, and the owner's approval does not license fabrication.

**Authenticity rules — UNCHANGED and non-negotiable (this is what makes owner-only approval safe):**

- Never invent Qur'an verses or hadith text.
- Never invent, guess, or paraphrase a hadith grading (*sahih / hasan / da'if / mawdu'*)
  from model memory. **Every grading must trace to a named source** (sunnah.com,
  al-Albani, Ibn Hajar, or another cited scholar/database) via the **hadith-verifier**
  data layer — never generated freehand by the AI.
- Never invent narrator chains (isnad) or scholarly commentary.
- If a grading or source cannot be found in the verified database, the system shows
  **"not yet verified" / "not documented in available sources"** — never a fabricated,
  plausible-sounding answer.
- Weak or fabricated narrations stay clearly labeled as such.
- (Full rules, also unchanged: `skills/islamic-authenticity/islamic-authenticity.md`.)

**Workflow:**

1. Content is pulled **only** from cited sources (sunnah.com API, hadith-verifier skill,
   named-scholar gradings).
2. Every claim displays its citation inline (collection, hadith number, grader).
3. **Morshed reviews and approves each batch/item before it goes live** — no separate
   scholar sign-off required.
4. If sourcing is missing or ambiguous, **flag for Morshed's decision** rather than
   generating content to fill the gap.

- AI is a **drafting and verification aid**, not the authority. It never approves its own output.
- Review order for any content task: **draft (from cited sources) → hadith-verifier skill → Morshed's approval → publish.**
- The approval is recorded (approver = **Morshed Milon**, date, source(s) checked) alongside the content.
- Corrections are made publicly and promptly — this is part of the "Honest" pillar.

## 6. Escalation & Ambiguity Rule

When a task touches any of the following, **stop and ask / route to human review** —
do not pick a position:

- A religious ruling or anything that reads as halal/haram guidance.
- A point of difference between madhhabs or between Sunni/Shia sources.
- A hadith with a disputed grade → use `[GRADE DISPUTED]`, list both scholars and grades, do not resolve it.
- Any Arabic text or citation that cannot be verified → withhold and show the Warning Block.

## 7. Neutrality

- Present scholarly differences fairly; name the schools/scholars; do not present one
  view as the only view unless a sourced consensus exists.
- The platform reports what sources say; it does not adjudicate between them.

## 8. Per-Content-Type Quick Reference

| Content type | Minimum requirement before it can ship |
|---|---|
| Quran verse | Surah name + number + ayah; translation labeled with translator; Arabic only from authoritative Mushaf |
| Hadith | Full citation template + grade + grading scholar; verifier skill run; notices if weak/fabricated |
| Scholarly opinion | Named scholar, work/fatwa cited, dissent noted; never framed as consensus |
| Inheritance result | Cites 4:11 / 4:12 / 4:176; fiqh school disclosed; assumptions listed; "consult a scholar/court" note |
| AI explanation | Distinct container + AI label + QuranlyAI attribution; cites any source it relies on; no ruling |
| Disclaimer / methodology | Hard-coded string; never model-generated; matches About methodology |

## 9. Compliance Checklist (run before publishing any Islamic content)

- [ ] No verse, hadith, Arabic, or citation invented
- [ ] Every hadith: collection, book, number, narrator, isnad summary, grade, grading scholar
- [ ] Verifier skill run; weak/fabricated notices applied verbatim where needed
- [ ] No fatwa/ruling generated; ruling requests redirected
- [ ] No consensus claimed without a documented source; dissent noted
- [ ] AI/speculative content visually distinct, labeled, attributed
- [ ] Disclaimer/methodology strings hard-coded and unaltered
- [ ] Disputed grades and madhhab differences surfaced, not resolved
- [ ] Owner (Morshed Milon) approved before publish (approver + date + sources recorded) — ADR-044

---
*Non-compliance risks spreading misinformation about the Deen and is treated as a
serious issue, not a style nitpick. Review cycle: annual or upon scholarly feedback.*
