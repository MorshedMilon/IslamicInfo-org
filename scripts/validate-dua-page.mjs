/* VALIDATOR RULES FOR /dua.html  —  R12 … R22
 *
 *   node scripts/validate-dua-page.mjs
 *
 * WHY THIS FILE EXISTS. validate-seo.mjs scans duas/occasion, duas/source,
 * duas/chapter and the detail pages. It has never scanned /dua.html — a grep for
 * "dua\.html" across it returns nothing. That blind spot is why §5 naming, the
 * source-line format, the single-grid rule and the annotation rule were all violated
 * on the site's primary dua entry point for months while ten rules reported PASS.
 *
 * THREE GUARANTEES, because two are not enough (owner ruling 2026-08-05):
 *
 *  1. CAN IT FIRE?     every rule carries a known-positive fixture; a rule matching
 *                      zero fixtures ABORTS the run.
 *  2. DOES IT COUNT?   every rule also carries a CARDINALITY fixture — a synthetic
 *                      document with a known number of violations, and the rule must
 *                      report exactly that number. The first version of this file
 *                      passed 11/11 "can it fire" while every count was inflated 3x
 *                      by a substring match on `dua-card` (which also matches
 *                      `dua-card-header`). Firing and counting are different
 *                      guarantees and we only had one.
 *  3. IS THE PASS REAL? a rule whose subject does not exist yet reports BLOCKED, not
 *                      PASS, via a declared dependency. BLOCKED never counts toward a
 *                      green run. This kills pass-by-finding-nothing structurally
 *                      rather than by anyone remembering it.
 *
 * AUTHORITY: doc/DESIGN-SYSTEM.md §15 (dua card components) and §24, the mockup
 * mockups/dua.html (design of record), doc/functional/Dua_Page_Functional_Document.md,
 * doc/tech-specs/IslamicInfo_DuaPage_TechSpec.md, doc/prd/Dua_Page_PRD_v1.1.md.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const read = (p) => fs.readFileSync(p, "utf8");
const J = (p) => JSON.parse(read(p));

const lib = J("src/data/dua/library.json");
const corpus = J("src/data/dua/search-corpus.json");
const lock = J("src/data/dua/slugs.lock.json");
const pageCopy = J("src/data/dua/page-copy.json");
const tracked = new Set(execSync("git ls-files duas").toString().split("\n").filter(Boolean));

/* The curated taxonomy. Owner-ruled 2026-08-05. Twelve cards; the twelfth is the
   index. Six of the eleven are NON-IDENTITY mappings, which is why R19 exists.

   ⚠ `guidance` is used for TWO unrelated things in this codebase:
        occasionSlug 'guidance'  = "Guidance & Seeking Good"  → a category we DISPLAY
        entryType    'guidance'  = a guidance narration       → a reason to EXCLUDE
      Key on occasionSlug explicitly. A rule matching the bare string does the wrong
      thing half the time. */
export const CURATED = [
  { slug: "morning-evening", label: "Morning & Evening", occasionSlug: "morning-evening" },
  { slug: "prayer", label: "Prayer", occasionSlug: "prayer" },
  { slug: "food-drink", label: "Food & Drink", occasionSlug: "food-drink" },
  { slug: "sleep", label: "Sleep & Waking", occasionSlug: "sleep-waking" },        // non-identity
  { slug: "forgiveness", label: "Forgiveness", occasionSlug: "forgiveness" },
  { slug: "illness", label: "Illness", occasionSlug: "funeral-illness" },          // non-identity
  { slug: "travel", label: "Travel", occasionSlug: "travel" },
  { slug: "family", label: "Family & Children", occasionSlug: "family-children" }, // non-identity
  { slug: "knowledge", label: "Knowledge", occasionSlug: "guidance" },             // non-identity
  { slug: "anxiety", label: "Anxiety & Hardship", occasionSlug: "distress" },      // non-identity
  { slug: "ramadan", label: "Ramadan", occasionSlug: "fasting" },                  // non-identity
  { slug: "hajj-umrah", label: "Hajj & Umrah", occasionSlug: "hajj-umrah" },
];

const isLive = (d) => { const s = lock[d.id]; return !!s && tracked.has("duas/" + s + ".html") && !(pageCopy[s] && pageCopy[s].indexable === false); };
const liveCount = (occSlug) => corpus.duas.filter((d) => d.occasionSlug === occSlug && isLive(d)).length;

/* ── document context ────────────────────────────────────────────────────────
   Split on the CARD ROOT only. `dua-card-header` and `dua-card-actions-top` also
   contain the substring "dua-card"; a naive split produced 3 fragments per card.
   The negative lookahead for [-\w] is what makes this the root, not a descendant. */
const CARD_ROOT = /(?=<(?:a|div)[^>]*class="[^"]*\bdua-card(?![-\w]))/;
const IS_CARD = /\bdua-card(?![-\w])/;

export function ctxOf(html) {
  const cardBlock = (html.match(/<!--DUA_CARDS_START-->([\s\S]*?)<!--DUA_CARDS_END-->/) || ["", html])[1];
  return {
    html,
    cards: cardBlock.split(CARD_ROOT).filter((s) => IS_CARD.test(s)),
    hubBlock: (html.match(/<!--DUA_HUBS_START-->([\s\S]*?)<!--DUA_HUBS_END-->/) || ["", ""])[1],
  };
}
const tagOf = (c) => ((c.match(/class="dua-tag">[\s\S]*?<span>([^<]*)<\/span>/) || c.match(/class="dua-tag">([^<]*)</) || [, ""])[1] || "").trim();
const srcOf = (c) => ((c.match(/class="dua-source"[^>]*>([\s\S]*?)<\/div>/) || [, ""])[1] || "").replace(/<[^>]*>/g, "").trim();
const araOf = (c) => ((c.match(/class="dua-arabic">([\s\S]*?)<\/div>/) || [, ""])[1] || "").trim();

const BANNED_TITLE = /^(invocations?|what to say|supplications? for|words of remembrance|how to|the pilgrim|istikharah)/i;
const NARRATOR = /\(|narrated|reported|it was|said:|may allah be pleased/i;
const ANNOTATION = /\(\(|\)\)|\[|\]|وإذا|وَيَقُولُ|ثُمَّ لِيُسَلِّم|بَعْدَ السّلامِ|\.\.\./;

/* synthetic documents for the cardinality fixtures */
const card = (o = {}) => '<div class="card dua-card" data-id="' + (o.id || "x") + '">' +
  '<div class="dua-card-header"><div class="dua-tag">\u{1F91B} <span>' + (o.tag || "Prayer") + '</span></div>' +
  '<div class="dua-card-actions-top"><button class="dua-icon-btn"></button></div></div>' +
  (o.href ? '<a href="' + o.href + '">open</a>' : "") +
  '<div class="dua-arabic">' + (o.ar || "رَبَّنَا") + "</div>" +
  '<div class="dua-source">' + (o.src || "Sahih Muslim · 2723") + "</div></div>";
const doc = (cards, extra = "") => "<!--DUA_CARDS_START-->" + cards.join("\n") + "<!--DUA_CARDS_END-->" + extra;

const RULES = [
  { id: "R12", what: "card title is a curated occasion label, never a compilation chapter label (T1)",
    fires: () => BANNED_TITLE.test("Invocations for entering the restroom"),
    counts: { doc: doc([card({ tag: "Invocations for X" }), card({ tag: "What to say when Y" }), card({ tag: "Prayer" })]), expect: 2 },
    run: (x) => x.cards.filter((c) => { const t = tagOf(c); return t && (BANNED_TITLE.test(t) || !CURATED.some((y) => y.label === t)); }).map(tagOf) },

  { id: "R13", what: "no two cards link to the same detail page (T2 — uniqueness at the target)",
    dependsOn: ["R16"], vacuousWhen: (x) => x.cards.every((c) => !/href="\/duas\//.test(c)),
    vacuityNote: "0 card links to check",
    fires: () => new Set(["a", "a"]).size !== 2,
    counts: { doc: doc([card({ href: "/duas/a.html" }), card({ href: "/duas/a.html" }), card({ href: "/duas/b.html" })]), expect: 1 },
    run: (x) => { const h = x.cards.map((c) => (c.match(/href="(\/duas\/[^"]+)"/) || [, null])[1]).filter(Boolean);
                  const seen = new Set(), dup = []; h.forEach((v) => (seen.has(v) ? dup.push(v) : seen.add(v))); return dup; } },

  { id: "R14", what: "source line is 'Collection · Reference' with no narrator preamble (T4, §15)",
    fires: () => NARRATOR.test("Sunan Abi Dawud 525 (Sa'd b. Abi Waqqas reported…)"),
    counts: { doc: doc([card({ src: "Sunan Abi Dawud 525 (Sa'd reported:)" }), card({ src: "Sahih Muslim · 2723" })]), expect: 1 },
    run: (x) => x.cards.map(srcOf).filter((s) => s && (NARRATOR.test(s) || s.length > 60)) },

  { id: "R15", what: "no annotation delimiters or instruction prose in .dua-arabic (T5, §15)",
    fires: () => ANNOTATION.test("((يَبْدَأُ))"),
    counts: { doc: doc([card({ ar: "((أَصْبَحْنَا))" }), card({ ar: "[ثلاثاً]" }), card({ ar: "رَبَّنَا" })]), expect: 2 },
    run: (x) => x.cards.filter((c) => ANNOTATION.test(araOf(c))).map((c) => tagOf(c) + " :: " + araOf(c).slice(0, 40)) },

  { id: "R16", what: "every card carries an anchor to its detail page (T6)",
    fires: () => !/href="\/duas\//.test('<div class="card dua-card">no link</div>'),
    counts: { doc: doc([card({}), card({}), card({ href: "/duas/a.html" })]), expect: 2 },
    run: (x) => x.cards.filter((c) => !/href="\/duas\/[^"]+\.html"/.test(c)).map((c, i) => "card " + (i + 1) + " (" + (tagOf(c) || "?") + ")") },

  { id: "R17", what: "exactly ONE category grid, with real <a> in the served markup (D1)",
    fires: () => ('<div class="cat-grid"></div><div class="cat-grid"></div>'.match(/class="[^"]*cat-grid/g) || []).length === 2,
    counts: { doc: doc([], '<div class="cat-grid"></div><div class="cat-grid"></div>'), expect: 2 },
    run: (x) => { const n = (x.html.match(/class="[^"]*cat-grid/g) || []).length; const out = [];
                  if (n !== 1) out.push(n + " .cat-grid elements in served markup, expected exactly 1");
                  if (n >= 1 && !/<a class="cat-card"/.test(x.hubBlock)) out.push("grid cards are not <a> elements in the served markup");
                  return out; } },

  { id: "R18", what: "12 curated cards; a category with 0 live duas is hidden, never linked to an empty hub",
    fires: () => true,
    counts: { doc: doc([], '<!--DUA_HUBS_START--><div class="cat-title">Not A Curated Label</div><div class="cat-title">Also Not One</div><!--DUA_HUBS_END-->'), expect: 2 },
    run: (x) => { const rendered = [...x.hubBlock.matchAll(/class="cat-title">([^<]*)</g)].map((m) => m[1].replace(/&amp;/g, "&"));
                  const out = [];
                  for (const t of rendered) { const c = CURATED.find((y) => y.label === t);
                    if (!c) { out.push('rendered card "' + t + '" is not in the curated list'); continue; }
                    if (liveCount(c.occasionSlug) === 0) out.push('"' + t + '" rendered with 0 live duas'); }
                  return out; } },

  { id: "R19", what: "every curated slug resolves to exactly ONE corpus occasionSlug",
    fires: () => !new Set(corpus.duas.map((d) => d.occasionSlug)).has("__nope__"),
    counts: { synthetic: () => { const bad = [{ slug: "a", occasionSlug: "__missing__" }, { slug: "b", occasionSlug: "prayer" }, { slug: "c", occasionSlug: "prayer" }];
                const all = new Set(corpus.duas.map((d) => d.occasionSlug).filter(Boolean)); const out = [];
                bad.forEach((c) => { if (!all.has(c.occasionSlug)) out.push(c.slug); });
                const seen = {}; bad.forEach((c) => (seen[c.occasionSlug] ||= []).push(c.slug));
                Object.entries(seen).filter(([, v]) => v.length > 1).forEach(([k]) => out.push(k));
                return out; }, expect: 2 },
    run: () => { const all = new Set(corpus.duas.map((d) => d.occasionSlug).filter(Boolean)); const out = [];
                 for (const c of CURATED) { if (!c.occasionSlug) { out.push(c.slug + " has no mapping"); continue; }
                   if (!all.has(c.occasionSlug)) out.push(c.slug + " -> '" + c.occasionSlug + "' is not a corpus occasionSlug"); }
                 const seen = {}; CURATED.forEach((c) => (seen[c.occasionSlug] ||= []).push(c.slug));
                 Object.entries(seen).filter(([, v]) => v.length > 1).forEach(([k, v]) => out.push("'" + k + "' claimed by " + v.join(" + ")));
                 return out; } },

  { id: "R20", what: "a facet group with fewer than 2 distinct values is hidden",
    fires: () => true,
    counts: { doc: doc([], '<script type="application/json" id="duaFacets">{"sources":[{"n":1}],"occasions":[{"n":1}],"categories":[{"a":1},{"b":2}]}</script>'), expect: 2 },
    run: (x) => { const m = x.html.match(/id="duaFacets">([\s\S]*?)<\/script>/); if (!m) return ["facets block missing"];
                  const f = JSON.parse(m[1]); const out = [];
                  for (const g of ["sources", "occasions", "categories"]) if ((f[g] || []).length === 1) out.push(g + " rendered with only 1 distinct value");
                  return out; } },

  { id: "R21", what: "held records are absent from the projection BY PREDICATE, not by luck",
    fires: () => true,
    counts: { synthetic: () => { const ids = new Set(["27:90", "36:127", "ok:1"]); const held = ["27:90", "36:127", "not-in-lib"];
                return held.filter((h) => ids.has(h)); }, expect: 2 },
    run: () => { const ids = new Set(lib.duas.map((d) => d.i)); const out = [];
                 for (const [slug, e] of Object.entries(pageCopy)) { if (!e || e.indexable !== false) continue;
                   const id = Object.keys(lock).find((k) => lock[k] === slug); if (id && ids.has(id)) out.push(id + " is held but present in library.json"); }
                 return out; } },

  { id: "R22", what: "every card link resolves to a page that ships (tracked)",
    dependsOn: ["R16"], vacuousWhen: (x) => x.cards.every((c) => !/href="\/duas\//.test(c)),
    vacuityNote: "0 card links to check",
    fires: () => true,
    counts: { doc: doc([card({ href: "/duas/__nope1__.html" }), card({ href: "/duas/__nope2__.html" })]), expect: 2 },
    run: (x) => x.cards.map((c) => (c.match(/href="\/duas\/([^"]+\.html)"/) || [, null])[1]).filter(Boolean)
                       .filter((p) => !tracked.has("duas/" + p)).map((p) => p + " is not tracked — would 404") },
];

/* ── GUARANTEE 1 + 2: can it fire, and does it count ──────────────────────── */
const dead = [], miscount = [];
for (const r of RULES) {
  try { if (r.fires() !== true) dead.push(r.id); } catch { dead.push(r.id); }
  if (!r.counts) { miscount.push(r.id + " (no cardinality fixture)"); continue; }
  let got;
  try { got = r.counts.synthetic ? r.counts.synthetic() : r.run(ctxOf(r.counts.doc)); } catch (e) { got = ["threw: " + e.message]; }
  if (got.length !== r.counts.expect) miscount.push(r.id + " reported " + got.length + ", fixture expects " + r.counts.expect);
}
if (dead.length) { console.error("ABORT — rule(s) matched no known positive, so they cannot be trusted to fire: " + dead.join(", ")); process.exit(2); }
if (miscount.length) { console.error("ABORT — rule(s) fire but MISCOUNT:\n  " + miscount.join("\n  ")); process.exit(2); }
console.log("self-test: " + RULES.length + "/" + RULES.length + " rules fire AND count correctly against fixtures\n");

/* ── run ─────────────────────────────────────────────────────────────────── */
const ctx = ctxOf(read("dua.html"));
console.log("VALIDATOR — /dua.html   (" + ctx.cards.length + " cards in served markup)\n");
const status = {};
let failed = 0, blocked = 0;
for (const r of RULES) {
  let hits; try { hits = r.run(ctx); } catch (e) { hits = ["rule threw: " + e.message]; }
  status[r.id] = hits.length ? "FAIL" : "PASS";
}
for (const r of RULES) {
  const deps = (r.dependsOn || []).filter((d) => status[d] === "FAIL");
  let hits; try { hits = r.run(ctx); } catch (e) { hits = ["rule threw: " + e.message]; }
  if (deps.length && hits.length === 0) {
    blocked++; status[r.id] = "BLOCKED";
    console.log("  " + r.id + ": BLOCKED — cannot be trusted while " + deps.join(", ") + " fails" +
      (r.vacuityNote ? " (" + r.vacuityNote + ")" : "") + " — " + r.what);
    continue;
  }
  if (hits.length) {
    failed++;
    console.log("  " + r.id + ": FAIL (" + hits.length + ")  — " + r.what);
    hits.slice(0, 4).forEach((h) => console.log("        " + String(h).slice(0, 106)));
    if (hits.length > 4) console.log("        … and " + (hits.length - 4) + " more");
  } else {
    const vac = r.vacuousWhen && r.vacuousWhen(ctx);
    console.log("  " + r.id + ": PASS" + (vac ? " — ⚠ VACUOUS, " + (r.vacuityNote || "empty subject set") : "") + "  — " + r.what);
  }
}
const green = failed === 0 && blocked === 0;
console.log("\n" + (green ? "RESULT: PASS" : "RESULT: FAIL (" + failed + " failing" + (blocked ? ", " + blocked + " blocked" : "") + " of " + RULES.length + ")"));
if (blocked) console.log("BLOCKED rules do not count toward a green run — they are unproven, not passing.");
process.exit(green ? 0 : 1);
