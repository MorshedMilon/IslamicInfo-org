# DEFINITION-OF-DONE.md — Per-Task Ship Checklist
**What "done" means before anything ships · v1.0 · 2026-06-03**

> A task is **not done** when the code works — it is done when it passes the gates
> below. Run the **Universal** gate on every task, then add whichever gates apply
> (design / content / data / API). The design gate defers to `DESIGN-SYSTEM §24`
> and the content gate to `CONTENT-POLICY §6` rather than re-listing them, so there
> is one source of truth for each and they cannot drift.
>
> The single hard rule: **🕌 content tasks are never done without human review
> sign-off** (CONTENT-POLICY §5). No exceptions, no "ship now, review later."
>
> A copy-paste block for a PR/task description is at the bottom.

---

## 0. Which gates apply?

| If the task… | Run these gates |
|---|---|
| Changes anything visual / markup | Universal + **Design** |
| Surfaces any Islamic content 🕌 | Universal + **Content** + (Design if it's a page) |
| Reads/writes `localStorage` | Universal + **Data** |
| Adds/changes an `/api/` route | Universal + **API** + **Content** if it returns Islamic content |
| Is a full page build | Universal + Design + Content + Data + Accessibility/Perf |

---

## 1. Universal Gate — every task, no exceptions

- [ ] Matches its **PRD** (feature complete — nothing in scope dropped, nothing out of scope added)
- [ ] Matches its **functional doc** (behavior, states, edge cases) and **tech spec** (implementation detail)
- [ ] Built against the **canonical blueprint** (`mockups/<page>.html`) where one exists; only requested changes made
- [ ] No new architectural choice introduced without an entry in `DECISIONS.md`
- [ ] No banned hrefs (`learn.html`, `quranlya.com`); correct internal links
- [ ] Works in **both light and dark** themes
- [ ] No console errors; degrades gracefully if JS disabled (static-first, ADR-001)
- [ ] Self-reviewed: re-read the diff against this checklist before requesting review

## 2. Design Gate — any visual / markup change

- [ ] **`DESIGN-SYSTEM §24` enforcement checklist passes in full** (tokens, shell, nav order + `.active`, mobile menu, hero, hover system, CTA, footer strings, reveal, breakpoints)
- [ ] No new colors/fonts; no raw hex inline (except SVG `<defs>`)
- [ ] No shimmer `::after` sweep; approved glow hover used
- [ ] `[data-theme="dark"]` is a **sibling** to `:root`, not merged
- [ ] `@media (prefers-reduced-motion: reduce)` disables transforms (keeps opacity)
- [ ] Responsive ladder correct at 1100 / 900 / 760 / 700 / 440 px

## 3. Content Gate — any 🕌 Islamic-content task

- [ ] **`CONTENT-POLICY §6` (§9) compliance checklist passes in full**
- [ ] No verse, hadith, Arabic, or citation invented; nothing surfaced without a source
- [ ] Every hadith ran through the **hadith-verifier skill**; full citation + grade + grading scholar present
- [ ] Weak / fabricated / disputed narrations carry their **verbatim notices** (`labels-and-notices.md`)
- [ ] No fatwa / ruling / halal-haram verdict anywhere; ruling requests redirected to a scholar
- [ ] No consensus claimed without a documented source; dissent and madhhab differences surfaced, not resolved
- [ ] AI/speculative content is visually distinct, **labeled**, and carries QuranlyAI attribution
- [ ] Disclaimer / methodology strings are **hard-coded** — not model-generated, not altered
- [ ] Inheritance output cites 4:11 / 4:12 / 4:176, discloses fiqh school + assumptions, includes the "consult a scholar/court" note
- [ ] **🕌 HUMAN REVIEW SIGNED OFF** — reviewer name + date + sources checked recorded with the content

## 4. Data Gate — any `localStorage` change

- [ ] Every key used is defined in **`DATA.md §1`** (no undeclared keys)
- [ ] Schemas match `DATA.md §3/§4` exactly (incl. Sunnah Score weights, IS unlock/quiz thresholds)
- [ ] Writes wrapped in try/catch (quota + availability); reads tolerate missing/old keys with sane defaults
- [ ] Date-suffixed keys expire/sweep correctly; day-boundary logic archives + recomputes streak
- [ ] No PII stored; no sub-brand prefix collision

## 5. API Gate — any `/api/` route change

- [ ] Route is documented in **`API-SPEC.md`** (method, params, response shape, cache TTL, fallback)
- [ ] **No API key in client code** — proxied through `/api/`, key in server env var only
- [ ] Cache-first + fallback-on-error pattern implemented (`ARCHITECTURE §14.1`); page degrades gracefully
- [ ] For `/api/ask-claude`: server safety system-prompt + post-filter active; attribution shown; ruling requests redirected
- [ ] `robots.txt` still disallows `/api/` and `/data/`

## 6. Accessibility & Performance Gate — full page builds

- [ ] Lighthouse Performance / Accessibility / SEO **≥ 90**
- [ ] WCAG 2.1 AA: semantic HTML, ARIA on interactive elements, keyboard navigation, focus management (mobile-menu focus trap), sufficient contrast in both themes
- [ ] Required `<head>` present: title, meta description (150–160 chars), canonical, OG image
- [ ] Page appears in `sitemap.xml`

## 7. CI must be green

The mechanical checks in `ARCHITECTURE §15.3` / `TASKS §CI` run on every deploy and
must pass: no banned hrefs, no `href="#"` in production, no shimmer CSS, dark-mode
sibling block, nav + footer Quick-Access completeness, all 10 pages in sitemap,
Lighthouse ≥ 90. **Green CI is necessary but not sufficient** — it does not check
content authenticity or the review gate. Those are §3 and stay human.

---

## Done means…

> The task matches its PRD/spec, passes every applicable gate above, CI is green,
> and — for any Islamic content — a qualified reviewer has signed off. Until then
> it is *in progress*, regardless of how finished the code looks.

## Copy-paste block (paste into the PR / task)

```
Definition of Done
[ ] Universal gate (PRD/functional/spec, blueprint, links, both themes, no console errors)
[ ] Design gate — DESIGN-SYSTEM §24 passes        (if visual change)
[ ] Content gate — CONTENT-POLICY §6 passes        (if 🕌 content)
    [ ] hadith-verifier run; notices applied
    [ ] no fatwa/ruling; AI labeled + attributed
    [ ] 🕌 HUMAN REVIEW signed off: __________ / date __________ / sources __________
[ ] Data gate — keys in DATA.md; schemas match     (if localStorage)
[ ] API gate — in API-SPEC.md; no client keys; fallback works  (if /api/)
[ ] A11y/Perf — Lighthouse ≥ 90; WCAG 2.1 AA; head meta  (if full page)
[ ] CI green
```

---
*Source: DESIGN-SYSTEM §24 (design) + CONTENT-POLICY §5/§6/§9 (content + review gate)
+ DATA.md (storage) + API-SPEC.md (routes) + ARCHITECTURE §7/§14/§15.3 (SEO/fallback/CI).
This file consolidates the gates; it does not redefine them.*
