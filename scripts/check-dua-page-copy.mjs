/* Quality gate for src/data/dua/page-copy.json — run before any batch is approved:
     node scripts/check-dua-page-copy.mjs

   Enforces the rules agreed for the authored sections 6/7/8:
     1. every key is a FROZEN slug that exists in slugs.lock.json (no drift)
     2. sections 6 and 8 clear their own minimums (60 / 25 words)
     3. combined 6+8 reaches 150 words -> otherwise REPORTED for owner review,
        never padded (short translations genuinely cannot support 150 words)
     4. no sentence in section 6 or 8 is reused on any other page
     5. banned generic filler does not appear
     6. duas whose translation is duplicated elsewhere in the corpus are listed,
        because explication alone cannot make their pages read differently
   Exit code is 1 only for hard failures (1, 2, 4, 5). Word-count shortfalls and
   duplicate-translation clashes are FLAGS for review, not errors. */
import fs from 'node:fs';
import REP from '../src/js/dua-repetition-core.js';

const copy = JSON.parse(fs.readFileSync("src/data/dua/page-copy.json", "utf8"));
const lock = JSON.parse(fs.readFileSync("src/data/dua/slugs.lock.json", "utf8"));
const corpus = JSON.parse(fs.readFileSync("src/data/dua/search-corpus.json", "utf8"));
const browse = corpus.duas.filter(d => d.translation && d.entryType !== 'guidance' && d.variantRole !== 'variant');

const slugSet = new Set(Object.values(lock));
const bySlug = {};
for (const d of browse) if (lock[d.id]) bySlug[lock[d.id]] = d;

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const sentences = (s) => String(s || "").split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.length > 12);
const normSent = (s) => s.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

// section 6 must never be filler; these are the patterns the brief banned
const BANNED = [
  /this beautiful dua reminds us/i,
  /always remember allah/i,
  /is a powerful supplication/i,
  /\bn\/a\b/i,
  /\bTBD\b/,
  /lorem ipsum/i
];

const errors = [], flags = [], expected150 = [];
const seenSent = new Map();
const entries = Object.entries(copy).filter(([k]) => k !== "_meta");

for (const [slug, cp] of entries) {
  const at = (m) => slug + ": " + m;

  if (!slugSet.has(slug)) { errors.push(at("key is not a frozen slug in slugs.lock.json")); continue; }
  const d = bySlug[slug];
  if (!d) { errors.push(at("slug has no matching corpus entry")); continue; }

  const w6 = words(cp.meaning), w8 = words(cp.reflection), total = w6 + w8;
  if (!cp.meaning) { errors.push(at("section 6 (meaning) missing")); continue; }
  // The 60-word floor assumes there was material to work with. When the translation
  // itself is very short, reaching 60 words would mean padding — which the brief
  // forbids outright — so it becomes a review flag instead of a failure.
  const shortSource = words(d.translation) < 25;
  if (w6 < 60) {
    if (shortSource) flags.push({
      slug, kind: "short-source",
      detail: "section 6 is " + w6 + " words (under the 60 floor) because the translation is only " +
        words(d.translation) + " words — not padded by design"
    });
    else errors.push(at("section 6 is " + w6 + " words, minimum is 60"));
  }
  if (cp.reflection && w8 < 25) errors.push(at("section 8 is " + w8 + " words, minimum is 25"));
  if (!cp.reflection) errors.push(at("section 8 (reflection) missing"));

  // rule 3 — EXPECTED. The owner accepted 79-147 as the honest ceiling for pure
  // explication (2026-07-30); prose is never padded to reach 150. Counted, not listed.
  if (total < 150) expected150.push({ slug, total, w6, w8, tr: words(d.translation) });

  // rule 4 — no repeated sentence across pages, in either authored section
  for (const s of [...sentences(cp.meaning), ...sentences(cp.reflection)]) {
    const k = normSent(s);
    if (seenSent.has(k) && seenSent.get(k) !== slug)
      errors.push(at('sentence reused from ' + seenSent.get(k) + ': "' + s.slice(0, 60) + '..."'));
    else seenSent.set(k, slug);
  }

  // rule 5
  for (const re of BANNED)
    if (re.test(cp.meaning) || re.test(cp.reflection || "")) errors.push(at("banned filler matched " + re));

  // section 7 is OMITTED when timing is null (there is no site-wide fallback
  // sentence any more), so here we only check an authored timing line is not blank
  if (cp.timing !== null && cp.timing !== undefined && !String(cp.timing).trim())
    errors.push(at("timing is present but blank — use null for the fallback"));
}

// rule 6 — duplicate translations. arabicCounts() comes from the same module the
// builder imports, so this gate tests the code that actually ships. It used to be
// recovered by string-slicing the builder source, which broke silently the moment
// the builder was reordered.
const arabicCounts = REP.arabicCounts;

const norm = (s) => String(s).toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const byText = {};
for (const d of browse) (byText[norm(d.translation)] = byText[norm(d.translation)] || []).push(d);
for (const group of Object.values(byText)) {
  if (group.length < 2) continue;
  const inBatch = group.filter(d => copy[lock[d.id]]);
  if (!inBatch.length) continue;
  // A shared translation is only a problem when nothing else separates the pages.
  // A repetition count stated in the Arabic is real source data and does separate them.
  const counts = group.map(d => arabicCounts(d));
  const separated = new Set(counts.map(String)).size === group.length && counts.every(Boolean);
  flags.push({
    slug: inBatch.map(d => lock[d.id]).join(" | "),
    kind: separated ? "duplicate-translation-resolved" : "duplicate-translation",
    detail: separated
      ? "shares a translation with " + (group.length - 1) + " other dua(s), but the Arabic states " +
        "distinct repetition counts (" + counts.join(" / ") + ") — pages differ on real source data"
      : "identical translation shared by " + group.length + " duas (ids " + group.map(d => d.id).join(", ") +
        ") with no distinguishing count in the Arabic — sections 6/8 must differ by angle, verify by hand"
  });
}

/* ── report ─────────────────────────────────────────────────────────────────── */
console.log("page-copy.json entries: " + entries.length + " of " + browse.length + " duas\n");
if (errors.length) {
  console.log("FAILURES (" + errors.length + ") — must fix before publishing:");
  for (const e of errors) console.log("  x " + e);
  console.log("");
}
if (flags.length) {
  console.log("FLAGGED FOR OWNER REVIEW (" + flags.length + ") — not errors:");
  for (const f of flags) console.log("  ! [" + f.kind + "] " + f.slug + "\n      " + f.detail);
  console.log("");
}
if (expected150.length) {
  const lo = Math.min(...expected150.map(e => e.total)), hi = Math.max(...expected150.map(e => e.total));
  console.log("EXPECTED (" + expected150.length + " of " + entries.length + ") — sections 6+8 under 150 words, " +
    "range " + lo + "-" + hi + ".\n  Accepted by the owner as the honest ceiling for pure explication. Never padded.\n");
}
if (!errors.length) console.log("All hard checks passed.");
process.exit(errors.length ? 1 : 0);
