# Validator rules carried into Session 1

> **STATUS 2026-08-03 — R1–R6 are now ENFORCED.** Every rule in this document is implemented in
> `scripts/validate-seo.mjs` and each was put through a negative control before being trusted:
> `node scripts/test/negative-control-validator-rules.mjs` mutates a real input per rule, asserts
> the rule flips to FAIL, and restores every file byte-identically. **10 of 10 cases behave as
> specified.** Read the luck-vs-design table below before assuming the green result means much.
>
> ### Which rules were already satisfied by luck, and which by design
>
> | Rule | Verdict | Why |
> |---|---|---|
> | **R1** | **luck — vacuous today** | 85 claimants, 0 collisions. Only one `dropped` row parks a keyword (`dua for waswasa`) and nothing else claims it, so the exclusion changes no outcome. A positive control confirms the exclusion *works* — a dropped row may park a contested term without failing the build — but it is not currently load-bearing. |
> | **R2** | **luck, with real drift underneath** | 0 collisions, but **16 chapters are flagged `gets_static_chapter_page=yes` while only 10 chapter pages exist**. Claimancy is now derived from what is BUILT, not from the flag, so the CSV can no longer grant a claim to a page that does not exist. The drift is reported, not failed. |
> | **R3 / R3a** | **luck — pure set composition** | **189 Class B + 109 `quran:` records exist and not one is indexed.** R3 passes because the published set happens to exclude them, not because anything enforced it. R3a is fully vacuous: no record carries `dua_clause_verified`, so nothing can violate it. **Wave 2 is exactly what changes this.** |
> | **R4** | **luck** | 10 records carry `build_gate: awaiting-original-rendering`; none is in the sitemap — but none is approved either, so the gate is not what is holding them. It would hold them if a batch approved them, which is the point. |
> | **R5** | **design** | 5 rows carry "Authentic Duas" in `title_tag` and **none** carries a count. The counts were genuinely removed and titles now render the count from the corpus; the rule guards the regression. |
> | **R6** | **design** | **6 clusters are indexed together right now and pass only because they were adjudicated onto the allowlist** on 2026-08-03. Before that ruling this rule would have failed the build. The seed-pair normalisation check is asserted every run, so an orthography regression cannot silently turn the rule into a no-op. |
>
> **Four of six were vacuous.** They are implemented before Wave 2 authoring rather than after
> precisely because Wave 2 changes the set that makes them vacuous.

Rules discovered during Sessions 0–0.7 that `scripts/validate-seo.mjs` must implement.
They are recorded here because each was found by hitting the failure, not by reading a spec —
none of them appears in `DUA-SEO-STRATEGY-v2.md` §8, and all of them would be re-discovered the
expensive way if they were lost.

These are **additions** to the §8 assertion list, not a replacement for it.

---

## R1 — `dropped` rows are excluded from the keyword claim set

A famous-dua row with `build_status = dropped` keeps its `primary_keyword` in the CSV so the term
stays parked and nobody silently reassigns it. It builds no page, so it must not count as a
claimant.

Currently affects ranks 26 (`dua for waswasa`) and 36 (`dua for bad dreams`).

```
claimants = famous rows WHERE build_status != 'dropped'
          + hub rows WHERE primary_keyword != ''
          + chapter rows WHERE gets_static_chapter_page = 'yes' AND primary_keyword != ''
```

Without this, the first page that legitimately targets a parked term fails the build against a
row that does not exist as a page.

## R2 — a chapter row claims its keyword only when it gets a static page

`gets_static_chapter_page = no` means the chapter has no URL, so it cannot cannibalise anything.
104 of 132 chapter rows are in that state and carry keywords that duplicate a hub or famous term
by design.

**Re-check on every build, not once.** Flipping a chapter to `yes` is a one-character edit that
silently creates a collision — that is exactly how `some-invocations-for-rain` and
`invocations-against-the-devil-and-his-promptings` became live collisions between sessions.

Current state: 26 live chapter pages, 96 distinct keywords, 0 collisions.

## R3 — no Arabic block from an unverified Class B or full-āyah record

Two record shapes store more than the supplication in `arabic`:

- **Class B** (154 active) — hadith-collection records holding the full narration including isnad.
  Detect: no `((` delimiter **and** `حدثنا|أخبرنا|حدثني|أخبرني` present after diacritic stripping.
- **Full āyah** (all `quran:` records) — the supplication is often one clause of a longer verse.

A page must not render an Arabic block from either until a reviewer-verified clause field exists
on the record. The validator fails the build if a page in the sitemap resolves to such a record
without that field.

```
assert no indexed page's source record is (Class B or quran:*)
       unless record.dua_clause_arabic is present AND record.dua_clause_verified === true
```

Neither field exists yet — Parts 4 and 5 of `doc/DUA-REVIEWER-PACKAGE.md` are what populate them.
Until then the assertion is what keeps those pages out of a sitemap.

## R3a — an extracted clause must be presented as an extract

Companion to R3, from `DUA-PAGE-CONTENT-SPEC.md` §1.1. R3 stops an unverified clause rendering at
all; R3a governs how a **verified** one is allowed to appear.

Where zone 1 renders `dua_clause_arabic` rather than the record's whole `arabic`, the page must
carry all three of:

```
assert page labels the clause as the recitable portion (not as the whole ayah/narration)
assert page shows or links the full source text it was extracted from
assert the A2 authentication note names the extraction shape and the confirming reviewer
```

Fail the build if a page renders a clause without all three. The failure mode this prevents is a
page that silently redraws the boundary of an āyah — a reader memorising from it learns the wrong
boundary, and nothing on the page tells them so.

## R4 — `build_gate` blocks indexing regardless of batch approval

The 10 Qur'anic records added by `scripts/ingest-dua-quran-gaps.mjs` carry
`build_gate: "awaiting-original-rendering"`. Their English is Pickthall, held as a corpus base
only; the published text will be an original rendering. Any record carrying a non-empty
`build_gate` is excluded from every sitemap, whatever `page-copy.json` `_meta.batches[].approved`
says.

## R5 — hub dua counts are rendered, never asserted from the CSV

`hub_pages_keywords_v2.csv` `duas_covered` is documentation, not truth. Counts move whenever the
occasion facet or the Gate 1 exclusion set changes — 7 of 30 hub rows drifted between Sessions 0
and 0.6 alone. Titles no longer hardcode a count; the build renders it from the corpus.

The validator should assert the reverse of what you would expect: **fail if any `title_tag`
contains a digit followed by "Authentic Duas"**, since that means a count was baked back in.

## R6 — identical scripture across two indexed pages fails unless the pair is allowlisted

Two indexed pages must not render the same Arabic. Where they legitimately do — the same words
narrated for two different occasions, with two different search intents and no canonical version
— the cluster must be registered in `src/data/dua/duplicate-scripture-allowlist.json` with a
**stated reason** and a named adjudicator.

```
clusters = group every corpus record by normalisedArabic(record.arabic)   // corpus-wide
fail if  any cluster has 2+ members simultaneously in the sitemap
         AND that cluster is not in allowlist.allowed
```

Cluster **membership** is computed corpus-wide so a pair is registered before either member is
approved; the **failure** triggers only when two members index at once. That ordering matters —
it lets the allowlist be populated during review rather than during a broken build.

### Normalisation — this is the rule, not a detail

**Do not compare raw strings, and do not reuse the corpus's ordinary diacritic strip.** The pair
this rule was created for is not byte-identical and is *not* equal under either:

```
117:235       ((﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً…﴾)).      →  ربنا اتنا في الدنيا…
quran:2:201   رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً…            →  ربنا ءاتنا في ٱلدنيا…
                                                                        ↑ not equal
```

The two records store the same āyah in **different orthographies** — the Hisn record in
simplified script, the quran.com record in Uthmani. A rule written on "identical arabic" is a
**no-op against the exact pair it was seeded with**, and would have shipped looking correct
while catching nothing. The normalisation must fold Uthmani orthography as well as diacritics:

| Fold | Why |
|---|---|
| strip `U+064B–U+0652`, `U+0670`, `U+0653–U+0655`, `U+06D6–U+06ED` | harakat, superscript alef, Qur'anic recitation marks |
| strip `U+0640` tatweel | decorative elongation |
| `U+0671` → `U+0627` | **alef wasla → alef** — Uthmani `ٱل` vs simplified `ال` |
| `U+0621 U+0627` and `U+0622` → `U+0627` | **hamza+alef and alef madda → alef** — Uthmani `ءاتنا` vs simplified `آتنا` |
| `أ إ ا` → `ا`, `ى ي` → `ي`, `ة` → `ه` | ordinary orthographic variance |
| strip `( ) [ ] { } ﴿ ﴾ « » " ' ’ ‘ . ، , ؛ ; : ! ?` | the `((…))` recitation delimiters, ornate āyah brackets, punctuation |
| collapse whitespace | — |

With those folds the seed pair compares equal. Verified 2026-08-02.

### What the rule actually costs — 9 clusters, not 1

Run corpus-wide, this finds **9 clusters with 2+ slugged members, covering 19 records** — not
the single pair it was commissioned for. All 9 are in the allowlist file: 1 in `allowed`, 8 in
`pendingAdjudication`, which **does not permit them**. Each of the 8 becomes a live failure the
moment two of its members are approved for indexing.

Two of the 8 need more than a rubber stamp:

- **`8:12` / `5:9` / `99:210`** — three pages whose entire Arabic is `Bismillah`. An incidental
  collision on a very short text, not a cross-listing. Thin content and cannibalisation risk
  independent of R6.
- **`34:121` / `41:137`** — the only cluster whose members sit in the **same occasion bucket**
  (`distress`), so these two compete for the same queries directly.

**None of the 9 blocks Wave 1a.** The one that touches it (`9:15` / `85:196`) involves a record
already dropped for an unrelated reason.

### Why the rule is worth having even though nothing indexes yet

Neither seed member is in the sitemap today: `page-copy.json` `_meta.batches[].approved` is
`false` on both batches, and R3 independently blocks every `quran:` record. R6 is a forward
guard, and registering the clusters now is what makes it cheap — the adjudication happens
during a review pass that is already scheduled, not during a build failure later.

### SUPERSEDED 2026-08-03 — R6 is no longer forward-looking, it is live

The paragraph above is kept for the reasoning, but its premise expired the moment batches 1–7
were approved. `_meta.batches[].approved` is now `true` on all 7 and **107 pages index**.

Recomputed against the authored set (not the whole corpus), **6 clusters have 2+ authored
members** and would index together if every authored page were released:

| cluster | members (batch) | status |
|---|---|---|
| A | `27:85`(b1) `28:109`(b2) | pendingAdjudication |
| B | `17:34`(b4) `19:42`(b3 — **already indexed**) | pendingAdjudication |
| C | `17:35`(b4) `19:43`(b4) | pendingAdjudication |
| D | `17:37`(b4) `19:45`(b4) | pendingAdjudication |
| E | `32:117`(b4) `19:47`(b3 — **already indexed**) | pendingAdjudication |
| F | `34:121`(b4) `41:137`(b4) | pendingAdjudication — **same occasion bucket** (`distress`) |

All 6 sit in `pendingAdjudication`, which does not permit them. **10 pages are therefore held
at `indexable:false` with `indexReason: r6-duplicate-scripture-pending-adjudication`**, inside
batches whose prose the owner did approve. Both members are held wherever neither is live,
because choosing which of the two owns the query *is* the adjudication and the allowlist states
that ruling is a reviewer's, "never a code change". Where one member was already live (B, E) only
the newcomer is held, which preserves the existing state without anyone making a choice.

**R6 is still not enforced by any script.** `validate-seo.mjs` does not implement R1–R6; the 10
holds above were applied by hand from an audit. Until it is implemented, approving a batch can
re-introduce a collision silently.

---

## R7 — the B4 FAQ overlap window excludes verbatim quoted spans, and nothing else

Owner-approved 2026-08-02, implemented in `scripts/check-dua-a1-overlap.mjs`.

The FAQ answers quote the record's own wording: `qMeaning` pastes `translation` verbatim,
`qTranslit` pastes `transliteration` verbatim, and `qWhen` / the `extra` sentences paste A1
(page-copy `meaning` / `timing` / `reflection`). Four pages shared the 12-gram
*"there is no deity worthy of worship except allah alone he has"* because four records carry that
translation. That is not a templating leak — it is the dua's own words, and varying it to satisfy
a checker would mean misquoting the supplication. Same reasoning as the §6.4 A2 carve-out and the
`<h3>` question carve-out.

```
window = normalised FAQ answer text
for each span in {translation, transliteration, meaning, timing, reflection} (and their sentences):
    if the span appears VERBATIM in the window (word-boundary aligned):
        replace it with a BARRIER, never delete it
generate 12-grams per barrier-separated segment
```

Two properties are the rule, not implementation detail:

- **Barrier, not deletion.** Dropping the tokens would let the words before a quote butt against
  the words after it and mint a 12-gram that appears on no page.
- **Verbatim only.** The connective that introduces the quote (`"In English it reads:"`) belongs to
  no corpus field, so it stays inside the window. A connector spreading across pages is still
  caught — which is the entire point of the check.

The A1 text subtracted here is not unchecked: §6.4 scans the same prose library-wide on its own.
This removes a double count, it does not create a blind spot.

**Verified by negative control, not by the number going to zero.** An identical connective sentence
was injected into 3 real pages' FAQ answers; the checker still reported the leak (3 twelve-grams on
3 pages), and the pages were restored. A carve-out that reports 0 because it swallowed the window
is indistinguishable from a correct one until you plant something in it.

Result after the carve-out: 539 quoted spans subtracted across 117 pages, **FAQ leaks 0**.

---

## R8 — no published page may link to a page that does not ship

Owner instruction 2026-08-03. **Implemented and enforced** in `scripts/validate-seo.mjs` — the
first of R1–R8 that actually runs in a script rather than sitting in this document.

Only **indexable** detail pages are committed and copied into the deploy artifact. Held pages are
built on disk and never published, so *"the file exists locally"* proves nothing about production.

```
shipped = duas/occasion/*.html + duas/source/*.html + duas/chapter/*.html
        + duas/<slug>.html WHERE page-copy[slug].indexable === true

for every href="/duas/…" on a shipped page:
    assert the target file exists                              (in the build artifact)
    assert, if it is a detail page, page-copy[slug].indexable   (the deploy copies it)
```

**Both limbs, because either alone is a false pass.** Every held page satisfies the first and
fails the second — that is the entire failure class. Same reasoning as the earlier hub-count fix:
enforce it so it cannot silently drift back on the next batch approval.

### What it found immediately — 18 stale chapter pages

`build-dua-pages.mjs` only ever *wrote* chapter pages, never removed them. With the D5 `>=3`
threshold now computed on **published** children, chapter pages fell 27 → 9, and the 18 files that
dropped out stayed on disk carrying their old unfiltered link lists. R8 caught **306 links to held
pages** through them. The builder now prunes them (and their `page-state.json` rows).

A stale generated file is worse than a missing one: it is invisible to every check that iterates
the *current* set, and it ships if anything copies the directory.

### Builder changes this rule forced

- hubs list only published children, and their counts — including the sibling chips — are
  published counts (a chip reading "(45)" pointing at a hub listing 3 is the R5 untruth arrived
  at from the other direction)
- `related()` never surfaces a held dua; the §15 "same wording also listed under" cross-link
  filters on published
- chapter pages list published children only; `byCatPub` drives both the page and the threshold
- the `children linked` / orphan build stats count published pages, not slugged records — they
  reported "515 linked / 0 orphans" while the hubs emitted 107 links

Current state: **144 published pages, 1809 internal links, 0 held, 0 missing — R8 PASS.**

---

## R9 — hub card text must be the linked page's §5 name

Owner instruction 2026-08-03. **Implemented and enforced** in `scripts/validate-seo.mjs`.

The occasion/source hubs are a **second render path for a page's name**, and the §5 fixtures never
covered it — they only ever opened detail pages. `anchorLabels()` built each card as
`chapterLabel — translationExcerpt` straight off the corpus record, bypassing the keyword rule
entirely.

### The audit that produced this rule

| | |
|---|---|
| hub pages | 28 |
| cards | 234 |
| **cards disagreeing with the linked page's H1** | **234 (100%)** |
| collision groups (2+ cards sharing one visible label) | **30, covering 154 cards** |
| worst | **24 cards** all reading "Words of remembrance for morning and evening" |

The detail pages were **correct the whole time** — `Dua after wudu (Sunan Abi Dawud 525)` and
`Dua after wudu (Riyad as-Salihin 353)` are distinct, keyword-led and source-disambiguated. Only
the hub text was wrong, which is exactly why nothing caught it: every existing assertion passed.
Same class of gap as the dropped lede and the FAQ connectives.

### The rule

```
for every href="/duas/<slug>.html" card on a hub page:
    assert cardText === the linked page's rendered <h1>      // the two paths agree
    assert cardText === expectedH1(record)  where derivable  // and they agree with §5
assert no two cards on one hub share a label
```

The second limb is what ties the rule to the CSV rather than to itself. `expectedH1` is null for
`derive_per_entry` chapters, where §5 fixes no keyword; those fall back to the first limb, which
`checkPage()` has already tied to the CSV independently.

### The fix, and why it is not a third copy of the rule

The name is now resolved **once**, in `build-dua-pages.mjs`, and written to
`src/data/dua/page-names.json`; the hub builder reads it and uses it verbatim. Re-deriving the §5
rule inside the hub builder would just have created a third path to drift. A missing or stale
entry is a **hard build failure**, never a fallback to the chapter label — falling back is how
this defect would return, and it would return invisibly.

This forced two supporting changes:

- **Build order reversed** to `build-dua-pages.mjs` → `build-dua-landing-pages.mjs`. The old order
  existed only because the hub builder stripped *every* `/duas/` sitemap entry and the detail
  builder put them back; both now replace only their own.
- **Sitemap regexes made line-ending agnostic** (`<\/url>\r?\n`). See below — this was a live bug.

### R9 was too narrow on its first pass — a third naming path survived it

**Scoping R9 to `duas/occasion` + `duas/source` was the bug's next hiding place.** It reported
PASS while the **"Related duas" rail on every detail page** was still emitting
`chapterLabel — excerpt`, because `relLabels()` in `build-dua-pages.mjs` was a *third*
implementation of page naming with its own collision-escalation ladder. Found by an owner
screenshot, not by the rule.

Widened the same day to scan **every published page** — hubs, chapter pages, and the 117 detail
pages. Re-run against the un-rebuilt output, it reported **585 link-vs-H1 and 388 link-vs-CSV
failures across 819 links**, then 0 after the rebuild. `relLabels()` is deleted; the rail reads
`h1Of()` like everything else.

Two link shapes are **exempt by name**, so the exemption is a decision rather than a gap:

- `"Open this dua →"` on chapter pages — generic, and the dua is rendered directly above it.
- the ADDENDUM §15 prose link (`<p class="ed">`, *"also listed in this library under
  &lt;chapter&gt;"*) — a sentence *about the chapter*, where the chapter label is the correct
  text. Naming the page there would break the sentence.

**The lesson, which generalises past this rule:** a rule that names one directory tests one
directory. R9 v1 was written from the defect that was in front of it (hub cards) rather than from
the invariant it was actually protecting (*any* link to a detail page carries that page's §5
name). Prefer the invariant.

### Verified by negative control

Three injections into a real hub, each reverted, each expected to trip a different limb:

| injection | result |
|---|---|
| one card reverted to `chapterLabel — excerpt` | caught (H1 + CSV limbs) |
| two cards on one hub given the same label | caught (duplicate limb) |
| plausible but non-§5 name ("Powerful dua for success") | caught (H1 + CSV limbs) |

Hub restored byte-identical; post-restore PASS. Current state: **28 hubs, 234 cards, 0
mismatches, 0 duplicate labels — R9 PASS.**

---

## The sitemap CRLF bug — root cause of the "duplicate hub URLs"

Found 2026-08-03 while reordering the builders. Both builders rebuilt their sitemap entries with

```js
xml.replace(/ {2}<url>\s*<loc>…<\/loc>[\s\S]*?<\/url>\n/g, …)   // ← bare \n
```

`sitemap.xml` is **checked in**, and git restores it with **CRLF** on Windows. A bare `\n`
terminator cannot match `</url>\r\n`, so the strip silently matched **zero** entries and every URL
was appended a second time — 169 `<loc>` became 296, then 324.

This is self-hiding: it fires only when the file has just come from git, and the first successful
build rewrites the file with LF, after which everything looks fine. That is almost certainly the
"28 duplicate hub URLs" recorded on 2026-08-01 and never explained.

Fixed by `\r?\n` in both builders. Verified idempotent: three consecutive full rebuilds hold at
169 `<loc>`, 169 unique.

---

## Test-count assertions that must be re-derived, never copied

`worker/test/dua-source-core.test.js` asserted 219/20/199 transliteration counts for months after
commit `2a7b68b` nulled 37 contaminated transliterations, because the numbers were copied into the
test rather than derived. Corrected to 182/0/182 on 2026-08-02.

Any test asserting a corpus count should state which commit last moved it.
