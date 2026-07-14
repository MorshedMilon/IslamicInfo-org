---
name: hadith-verifier
description: >
  Use this skill whenever a task involves citing, verifying, grading, or appending
  hadith citations for Islamic content — especially for islamicinfo.org or any Islamic
  web project. Triggers when the user mentions hadith, narrations, hadith citations,
  sunnah references, isnad verification, or asks to "check", "verify", "confirm",
  "cross-reference", or "look up" any hadith. Also triggers when generating Islamic
  content that may require hadith evidence, when a draft citation needs confirmation,
  or when appending sourced religious content to output text. Always use this skill
  before outputting any hadith — never rely on memory alone.
---

# Hadith Verifier Skill

Cross-references draft hadith citations against trusted databases, confirms metadata
(collection, book, number, grade, narrator), and appends a fully formatted citation
block to output. Enforces the rules in `islamic-authenticity.md`.

---

## When This Skill Triggers

- User provides a draft hadith citation to verify
- User asks Claude to find/cite a hadith on a topic
- Claude is about to output Islamic content that requires hadith evidence
- User asks to "check", "confirm", or "cross-reference" a narration
- Any hadith is quoted or paraphrased in the output

---

## Verification Workflow

Follow these steps **in order** for every hadith:

### Step 1 — Parse the Draft Input

Extract whatever is available from the draft:
```
draft_text       → the narration text (Arabic or English)
draft_collection → e.g., "Bukhari", "Muslim", "Abu Dawud"
draft_number     → hadith number if provided
draft_topic      → topic/keyword if no number given
draft_grade      → grade if claimed (may need verification)
```

If none of these are available, treat the entire user query as `draft_topic`.

---

### Step 2 — Search Trusted Databases

Search in this priority order. Use web search with targeted queries.

**Primary sources (prefer these):**

| Source | URL | Best for |
|--------|-----|----------|
| Sunnah.com | `sunnah.com` | All major collections, English + Arabic, grades in English |
| ihadis.com | `ihadis.com` | Cross-collection search, fully English, fast lookup |
| IslamQA.info | `islamqa.info` | Authenticity confirmation, fabrication flagging, English + Arabic |

**Search query patterns to use:**

```
# If collection + number known (English input):
"site:sunnah.com bukhari 1"

# If topic only (English input):
"sunnah.com hadith [topic keywords]"
e.g., "sunnah.com hadith intentions actions"

# If collection unknown (English input):
"ihadis.com [English keywords]"
e.g., "ihadis.com actions judged by intentions"

# If input is Arabic:
"sunnah.com [Arabic text keywords]"

# To confirm authenticity or check for fabrication:
"islamqa.info hadith [keywords]"
"islamqa.info fabricated hadith [keywords]"
```

Run **2–3 searches** minimum. Cross-reference results across at least 2 sources before confirming.

---

### Step 3 — Confirm or Flag Each Field

For every field, mark as ✅ CONFIRMED, ⚠️ UNCERTAIN, or 🚫 NOT FOUND:

```
collection    → Does the search result match the claimed collection?
book/kitab    → Is the book/chapter name confirmed?
hadith number → Does the number match across sources?
narrator      → Is the primary narrator confirmed?
isnad chain   → Are key chain narrators listed?
grade         → Is the grade from a named scholar confirmed?
Arabic text   → Does Arabic text match an authoritative source?
translation   → Is the English translation sourced (not paraphrased)?
```

**If any critical field is 🚫 NOT FOUND or ⚠️ UNCERTAIN:**
→ Do NOT output the citation as confirmed
→ Proceed to Step 5 (Warning Output)

---

### Step 4 — Build the Verified Citation Block

Use this exact template when all critical fields are confirmed:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VERIFIED HADITH CITATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collection    : [Full name, e.g., Sahih al-Bukhari]
Book/Kitab    : [e.g., Book of Revelation / Kitab Bad' al-Wahy]
Hadith No.    : [e.g., No. 1]
Narrator      : [e.g., Narrated by 'Umar ibn al-Khattab (RA)]
Isnad Chain   : [Key narrators, e.g., A → B → C → Prophet ﷺ]

Grade         : [SAHIH / HASAN / DA'IF / MAWDU' / etc.]
Graded by     : [Scholar name, e.g., Imam al-Bukhari / al-Albani]

Arabic Text   :
[Arabic — only if confirmed from authoritative source]

Translation   :
"[English translation]"
(Translation: [Translator/source, e.g., Sunnah.com / USC-MSA])

Source URL    : [Direct link to sunnah.com or ihadis.com entry]
Verified via  : [List sources checked, e.g., sunnah.com + ihadis.com + islamqa.info]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Authenticity label** — prepend to any inline use:
- ✅ `[SAHIH]` — Authentic
- 🟡 `[HASAN]` — Good
- ⚠️ `[DA'IF — WEAK]` — Weak, see notice
- 🔴 `[DA'IF JIDDAN — VERY WEAK]`
- 🚫 `[FABRICATED — NOT A HADITH]`
- 🟠 `[GRADE DISPUTED]`

For DA'IF, append the mandatory weak hadith notice (see `references/labels-and-notices.md`).
For MAWDU', append the mandatory fabrication notice.

---

### Step 5 — Warning Output (Unverified / Not Found)

If verification fails, output this block instead of a citation:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️  HADITH UNVERIFIED — CITATION WITHHELD                   │
├──────────────────────────────────────────────────────────────┤
│  Draft input    : "[user's draft text or query]"             │
│  Sources checked: sunnah.com, ihadis.com, islamqa.info    │
│  Result         : [Not found / Conflicting results /         │
│                    Grade unconfirmed / Number mismatch]      │
│                                                              │
│  This narration was NOT appended to the output.              │
│                                                              │
│  Recommended actions:                                        │
│  • Search manually: sunnah.com | ihadis.com                  │
│  • Consult a qualified Islamic scholar or 'alim              │
│  • Check: islamqa.info | SeekersGuidance.org                 │
└──────────────────────────────────────────────────────────────┘
```

---

### Step 6 — Append to Final Output

Once verified, append the citation block directly after the relevant passage in the output text. Format:

```markdown
[Content text referencing the hadith...]

---
**Hadith Source**
[Full verified citation block from Step 4]
---
```

For inline references in running text, use short-form:
```
(Sahih al-Bukhari, No. 1 — ✅ Sahih)
```
Always link `No. X` to the sunnah.com URL when outputting for the web.

---

## Special Cases

### Topic-Based Search (No Draft Citation)
User asks: *"Find a hadith about honesty"*
→ Search sunnah.com for the topic
→ Select the most well-known, highest-grade result
→ Run full verification on that result
→ Present citation block + note that this was selected from search results

### Multiple Hadith in One Request
→ Verify each hadith independently — do not batch
→ Each gets its own citation block
→ Flag if any one fails verification

### Disputed Grades
Some hadith are graded differently by different scholars (e.g., al-Albani grades sahih, al-Arna'ut grades da'if).
→ List both grades with both scholars' names
→ Use label: 🟠 `[GRADE DISPUTED]`
→ Note: *"Grading differs among scholars — consult a qualified 'alim"*

### Fabricated Narrations (Mawdu')
If a search confirms fabrication:
→ Do NOT present the text as a hadith
→ Output the FABRICATED notice (see `references/labels-and-notices.md`)
→ Cite the scholar(s) who classified it as mawdu'

---

## What This Skill Does NOT Do

- ❌ Does not generate fatwas based on verified hadith
- ❌ Does not derive rulings from hadith — present the text only
- ❌ Does not invent Arabic text if not found in search
- ❌ Does not use memory alone — always searches before confirming
- ❌ Does not skip verification even for "well-known" hadith

---

## Reference Files

Read these when needed:

- `references/labels-and-notices.md` — Full text of all mandatory notices (weak, fabricated, disputed)
- `references/trusted-sources.md` — Detailed guide to each trusted database, search patterns, and how to read their grading systems
- `references/collections-index.md` — Canonical names, numbering systems, and abbreviations for all major hadith collections
