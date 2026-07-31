# DUA-CONTENT-INTEGRITY-v1_0.md

**Status:** Supersedes `DUA-KEYWORD-NAMING-v1_1-AMENDMENT.md` §A1. Sits **above** both naming specs.
**Trigger:** Phase 1.5 audit, 2026-07-31.
**Principle:** Naming is downstream of integrity. No page is named, indexed, or shipped until it
passes all three gates below.

This project began as a titling exercise. The audit has established it is a content integrity
remediation with a titling component. Documents and effort should reflect that order.

---

## Gate 1 — Not-a-dua

**45 pages currently render as duas that are not supplications a Muslim recites.**

| Class | Count | Nature |
|---|---|---|
| Condemned speech | 25 | Speech the Qur'an quotes in order to report or condemn it |
| Inverted narration | 1 | Ibn Majah 3590 |
| Narrative statements | 19 | Statements or questions rather than petitions |

### 1.1 The 25

Speech of Iblis (15:36, 15:39), the pleas of the damned (23:107, 32:12, 40:11, 33:68, 63:10 and 17
others), and Satan's companion disowning him (50:27). The corpus applies `entryType: "contextual"`
to only two of these (2:200, 34:19). **The other 23 render as ordinary duas today.**

### 1.2 Ibn Majah 3590 — treat as the most urgent single page

The narration quotes "O Allah, forgive me if You will" as the wording one must **not** use, and
continues *"Let him be definite in his asking."* The page currently teaches the opposite of its own
source. This is the one item where a defect is not merely a gap but an inversion, and it should be
pulled from the corpus today, ahead of any other work in this document.

### 1.3 The 19 narrative entries

Correctly flagged at lower confidence. **These are not Claude Code's call and they are not mine.**
Identifying a speaker and determining whether a Qur'anic passage constitutes a supplication is
tafsir-level adjudication. 11:45 in particular — Nuh's appeal, rebuked in the following verse — is
exactly the case where a plausible-looking reading produces a badly wrong page.

**Route:** qualified scholarly review. See §5.

### 1.4 Ruling — route out, do not warn-and-keep

`entryType: "contextual"` with an on-page notice is the right *identification* mechanism and the
wrong *mitigation*. A warning corrects the on-page experience and has no effect on the search
result, because the SERP displays the title. A page titled as a dua is received as a dua by
everyone who never opens it.

| Treatment | Applies to | Detail |
|---|---|---|
| **Remove from `/duas/` entirely** | all 45 | The word `Dua`, `Duas`, or `Adhkar` must not appear in the title, H1, meta description, or slug of any of them. |
| **Do not delete the data** | all 45 | The records are sound; the framing was wrong. Deleting loses recoverable work. |
| **Park as `noindex`** | default | Until and unless a home is built for them. |
| **Optional future section** | the 25 | Legitimate Qur'anic educational content if honestly titled — e.g. *Speech of Iblis Recorded in the Qur'an (15:36–39)*. Real demand exists for this. Not now; not in `/duas/`. |
| **Optional teaching page** | Ibn Majah 3590 | *Why Not to Say "O Allah, Forgive Me If You Will"* is strong, honest content that matches the site's purpose. As a hadith-guidance page, never a dua page. |

### 1.5 Verification requirement

The 25 were identified by reading the content. Before any of them is routed out permanently,
confirm the classification against a **second independent signal** — speaker attribution in the
Arabic, or the surrounding ayat — rather than a single reading. This cuts both ways: a page wrongly
classified as condemned speech is removed for no reason.

---

## Gate 2 — Transliteration

Restates and supersedes v1.1 §A1 with measured numbers. The gap maps almost perfectly onto the
track split, which changes the plan materially.

| | Pages | Lacking transliteration |
|---|---|---|
| Track A — occasion chapters | 247 | **48** (80.6% already covered) |
| Track B — book-name chapters | 259 | **259** (0% covered) |

All 48 Track A gaps are Hisn al-Muslim — one source, one dataset. Twenty of the 48 are the English
prose entries that overlap the A8 route-out list, so they may need no sourcing at all.

**Track A's real transliteration requirement is approximately 28 pages.**

Rules from v1.1 §A1 stand unchanged: sourced or reviewed, never machine-generated and shipped
unread; no page ships without it.

Track B's 259 split into roughly 74 Qur'anic (after Gate 1 removals), which quran.com API v4 can
supply from a published transliteration you already trust and have integrated, and roughly 160
hadith-collection pages, which remain genuine sourcing work with no shortcut.

---

## Gate 3 — Text integrity

Six Track B entries carry defects that are not naming problems:

- `Nasa'i 5464` — narration leaked into the translation field, ending *"...until I had memorized it"*
- `Nasa'i 5539` — reads *"O Allah,)' and he mentioned the supplication..."* — **the dua itself is missing**
- `Tirmidhi 3597` — truncated, with raw transliteration bled into the translation
- `132:267` — no Arabic at all; English narration about bringing children indoors at dusk
- Two further entries in the same class

**These six were found incidentally, while doing topic assignment.** That is the concerning part.
A defect class discovered by accident during unrelated work has not been bounded, and the sample
that surfaced it was 259 pages, not 506.

**Requirement:** a deliberate integrity scan of all 506 translation and Arabic fields before any
naming work proceeds. Patterns to detect: narration leakage (`he said`, `he mentioned`, `until I`,
`then the Prophet`), unbalanced quotes and parentheses, transliteration bleed into translation,
truncation, empty or whitespace-only fields, and records with Arabic but no translation or the
reverse.

---

## 4. Corrections to v1.1

| Ref | Correction | Status |
|---|---|---|
| A9 #11 | **v1.1 was wrong and so was the finding it accepted.** There are 12 full duplicates and 1 near-duplicate; zero partial overlaps. 27:76 / 25:70 are both the Three Quls in full — 25:70 is longer only because an editorial recitation schedule is prefixed into its translation field. 9:15 / 85:196 are the same Kaffaratul Majlis text differing in punctuation. | Corrected |
| A9 #11 principle | Never auto-merge on similarity. **Survives, and is better evidenced than before** — the reason pairs match varies: deliberate cross-listing, separation by a repetition count stated in the Arabic, or incidental collision on a short text. Each cluster still needs individual adjudication. | Stands |
| Cluster references | Cluster IDs were unstable across runs. **Cite clusters by member id, never by DUP number**, in every document and prompt from here. | New convention |
| A7 ch45/ch128 | Collision dissolves. Hisn 45 is a list of remedies with no text to recite → A8 route-out. Hisn 128 is a genuine dua → `Dua for Protection from All Evil`. | Accepted |
| A7 waswasa | The waswasa reading belongs to ch40, not ch45/128. | Accepted |
| A9 #8 ch40 | Intended label almost certainly *"Invocations for if you are stricken by [doubt/whisperings] in your faith"*. **Do not repair from inference — verify against a print copy.** | Open |
| A9 corruption scan | ch40 is the only genuine hit across all 132. Contained. | Closed |

---

## 5. Decisions required

- [ ] **Approve Gate 1 route-out** for the 25 and Ibn Majah 3590. My recommendation is unambiguous on these 26.
- [ ] **Identify a qualified reviewer** for the 19 narrative entries. This is now a real dependency with no internal substitute. It also covers verification of the 25 under §1.5 and the ch40 print-copy check.
- [ ] **Approve Track A as a separate release.** The 28-transliteration figure makes this clearly correct.
- [ ] **Decide the future home of the 45**, or approve parking them `noindex` indefinitely. Parking is the right default; the optional sections in §1.4 are a later question.
- [ ] Approve the corrections in §4.

### Housekeeping (do now, low effort)

- [ ] `CLAUDE.md` points to `docs/DECISIONS.md`, which does not exist. The real log is `doc/DECISIONS.md`. **Fix this first** — a broken pointer to the ADR log means governance references silently fail.
- [ ] Move the five Phase 1 artifacts from repo root into `doc/` alongside the specs.
- [ ] Sanity-check the count: the build reports 533 generated pages against a 506-page corpus. Probably index and category pages, but confirm rather than assume.

---

## 6. Track A shipping scope

Provisional, pending the scan in Gate 3:

```
247   Track A pages
 −20  English prose entries (A8 route-out, mostly)
 −~7  non-dua chapters (A8)
 −3   Hisn 45 entries (remedies, not supplications)
 −1   132:267 (no Arabic)
─────
~215  shippable
  28  transliterations required
```

Roughly 215 pages, one source, one bounded content task. That is a release you can ship in weeks
rather than months, and it validates the naming system against real search behaviour before the
259-page Track B effort is committed.

---

## 7. Message for Claude Code

```
Read DUA-CONTENT-INTEGRITY-v1_0.md. It sits above both naming specs.
Naming work is paused until Gates 1-3 clear.

Your Phase 1.5 report was correct on every count and found a problem no
naming rule would have caught. Findings 4, 5, 6 accepted. Your correction
of your own finding 11 — and of my A9 #11 which endorsed it — is accepted:
12 full duplicates, 1 near-duplicate, zero partial overlaps. The cluster-ID
instability fix and the cite-by-member-id convention are adopted.

Housekeeping first, then read-only work.

HOUSEKEEPING (write access, these only):
1. Fix CLAUDE.md — it points to docs/DECISIONS.md; the real log is
   doc/DECISIONS.md.
2. Move the five Phase 1 artifacts into doc/.
3. Confirm why the build reports 533 pages against a 506-page corpus.
4. Set Ibn Majah 3590 to noindex and remove it from any build output.
   It publishes as a dua the exact wording its own narration prohibits.
   This one page, today, ahead of everything else.

THEN READ-ONLY:
5. Full integrity scan of all 506 records — Arabic and translation fields.
   Detect: narration leakage, transliteration bleed, truncation, unbalanced
   quotes or parens, empty fields, Arabic-without-translation and the
   reverse. Your six were found incidentally; I need the bounded set.
   Report by track and by collection.

6. For the 25 condemned-speech pages: confirm each against a second
   independent signal — speaker attribution in the Arabic, or surrounding
   ayat — not the single reading that surfaced them. Report confidence per
   page. Flag any that fail confirmation; I would rather re-examine one
   than remove it wrongly.

7. Produce TRACK-A-SCOPE.md: the exact shippable page list after all A8
   and Gate 1 removals, with the transliteration gap enumerated per page.
   I expect roughly 215 pages and 28 gaps — tell me if that is wrong.

8. List the 19 narrative entries with their text and your reasoning, in a
   form I can hand to a reviewer who is not working from this repo.

Do not touch page-copy.json, slugs.lock.json, or sitemap.xml beyond item 4.
Do not act on the 19. Log this document as an ADR before starting.
```
