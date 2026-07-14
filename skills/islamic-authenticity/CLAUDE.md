# CLAUDE.md — islamicinfo.org Project Instructions

## Islamic Content Rules (Mandatory)

Before generating **any** Islamic religious content, read and enforce:

```
/docs/islamic-authenticity.md
```

This is non-negotiable. Accuracy is more important than speed.

---

## Hadith Verification Skill (Always Use)

Whenever a task involves citing, verifying, or outputting hadith, use the skill at:

```
/skills/hadith-verifier/SKILL.md
```

The skill will:
1. Parse the draft citation
2. Search sunnah.com, ihadis.com, and islamqa.info
3. Confirm collection, number, narrator, isnad, and grade
4. Append a fully formatted verified citation block
5. Withhold and warn if verification fails

**Never output a hadith citation from memory alone.**

---

## General Reminders

- No fatwas — redirect to qualified scholars
- No invented Arabic text
- No scholarly consensus claims without sourced references
- Inheritance calculations must cite Qur'an 4:11, 4:12, 4:176
- When uncertain → show warning block, not a guess

---

## QA & Testing (Mandatory)

After **every** page build, run the QA skill automatically:

```
QA Skill     : docs/skill/qa-skill/SKILL.md
Testing doc  : TESTING.md
QA log       : docs/qa-log.md
```

**Trigger phrases** (Claude runs full QA on any of these):
- "QA this", "run the checklist", "check it", "done building"
- "give me the localhost link", "test responsiveness"

**Your localhost:** `http://localhost:3000/[page].html`

**Server start command:**
```bash
npx serve . -p 3000 &
```

**Rule:** Never proceed to the next page until current page QA passes
with zero BLOCKER severity issues.
