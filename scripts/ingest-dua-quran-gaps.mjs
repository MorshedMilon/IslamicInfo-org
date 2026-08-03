/* ingest-dua-quran-gaps.mjs — SINGLE PURPOSE, TEN VERSES, NOTHING ELSE.
 *
 * Fills the ten Qur'anic verses that the famous-dua reconciliation found absent from
 * src/data/dua/search-corpus.json. It is deliberately NOT the general ingest: it has a
 * hardcoded allowlist of verse keys and will refuse to write any record outside it.
 *
 *   node scripts/ingest-dua-quran-gaps.mjs --resource-id=<id>              # dry run, prints a diff
 *   node scripts/ingest-dua-quran-gaps.mjs --resource-id=<id> --confirm    # writes the corpus
 *
 * --resource-id is mandatory and has no default. quran.com API v4 exposes NO licence
 * metadata on /resources/translations (fields are id, name, author_name, slug,
 * language_name, translated_name only) and /resources/translations/{id}/info returns an
 * empty string, so the script cannot verify a licence and does not pretend to. The
 * caller supplies an id that a human has cleared; the id and its author are written
 * verbatim into translationSource so the choice is auditable from the data.
 *
 * The corpus is stored MINIFIED on one line. This script re-serialises with
 * JSON.stringify(obj) and no indent argument. Do not pretty-print it.
 */
import fs from "node:fs";
import path from "node:path";

const CORPUS = path.resolve("src/data/dua/search-corpus.json");
const API = "https://api.quran.com/api/v4";

/* The allowlist. Key = corpus id suffix, value = the famous-dua rank that needs it.
   Nothing outside this map is ever fetched or written. */
const GAPS = {
  "21:87":  4,  "20:26": 5, "20:27": 5, "20:28": 5,
  "20:114": 6,  "3:173": 12, "71:28": 13, "17:24": 21,
  "21:83":  40, "3:194": 47,
};

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, "").split("=");
  return [k, v ?? true];
}));
const CONFIRM = args.confirm === true;
const RESOURCE_ID = args["resource-id"];

if (!RESOURCE_ID || RESOURCE_ID === true) {
  console.error("refusing to run: --resource-id=<id> is required and has no default.");
  console.error("quran.com exposes no licence metadata; a human must clear the edition first.");
  process.exit(2);
}

const j = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
  return r.json();
};
const stripTags = (s) => (s || "").replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const SURAH = {
  3: "Ali 'Imran", 17: "Al-Isra", 20: "Taha", 21: "Al-Anbya", 71: "Nuh",
};

const corpus = JSON.parse(fs.readFileSync(CORPUS, "utf8"));
const existing = new Set(corpus.duas.map((d) => String(d.id)));

/* Identify the edition once, from the resource list, so the attribution string is the
   API's own wording rather than ours. */
const resources = (await j(`${API}/resources/translations`)).translations;
const res = resources.find((r) => String(r.id) === String(RESOURCE_ID));
if (!res) { console.error(`resource_id ${RESOURCE_ID} not found in /resources/translations`); process.exit(2); }
console.log(`edition: id=${res.id}  name=${res.name}  author=${res.author_name}  slug=${res.slug}`);

const added = [];
for (const [key, rank] of Object.entries(GAPS)) {
  const id = `quran:${key}`;
  if (existing.has(id)) { console.log(`  skip ${id} — already present`); continue; }

  const [surah, ayah] = key.split(":").map(Number);
  const uthmani = (await j(`${API}/quran/verses/uthmani?verse_key=${key}`)).verses[0];
  const tr = (await j(`${API}/quran/translations/${RESOURCE_ID}?verse_key=${key}`)).translations[0];
  if (!uthmani?.text_uthmani || !tr?.text) throw new Error(`incomplete payload for ${key}`);

  added.push({
    id,
    category: "Qur'anic supplications",
    arabic: uthmani.text_uthmani,
    /* Left null on purpose. A transliteration is sourced or reviewed, never machine
       generated and shipped unread (DUA-CONTENT-INTEGRITY-v1_0 Gate 2). */
    transliteration: null,
    translation: stripTags(tr.text),
    translationSource: `${res.author_name} via quran.com API v4, edition ${res.id} (Qur'an ${key}, Surah ${SURAH[surah] || surah})`,
    /* Pickthall d. 1936 — public domain in life+70 jurisdictions since 2007. Recorded as
       a label for auditability; licence never gates indexing (D-A). */
    translation_license: "public-domain",
    /* Hard block. All ten are top-50 duas that will ship an original English rendering;
       the Pickthall text is the corpus base, not the published text. Any consumer that
       builds a sitemap must exclude records carrying this flag. */
    build_gate: "awaiting-original-rendering",
    verseRef: key,
    /* Deliberately unset: the occasion facet is derived, not authored. Run
       scripts/build-dua-occasions.mjs after this to assign it from the checked-in rules. */
    occasionSlug: null,
    occasion: null,
    categorySlug: "quranic-supplications",
    sourceKey: "quran",
    sourceLabel: "The Qur'an",
    _ingestNote: `famous_named_duas_v2 rank ${rank}; added by ingest-dua-quran-gaps.mjs`,
  });
  console.log(`  + ${id}  (rank ${rank})  ${stripTags(tr.text).slice(0, 72)}…`);
}

console.log(`\n${added.length} new record(s); corpus ${corpus.duas.length} -> ${corpus.duas.length + added.length}`);

if (!CONFIRM) {
  console.log("\nDRY RUN — nothing written. Re-run with --confirm to persist.");
  process.exit(0);
}

corpus.duas.push(...added);
corpus.meta.count = corpus.duas.length;
corpus.meta.translationSources = corpus.meta.translationSources || {};
const label = `${res.author_name} via quran.com API v4, edition ${res.id} (reconciliation gap fill)`;
corpus.meta.translationSources[label] = (corpus.meta.translationSources[label] || 0) + added.length;

fs.writeFileSync(CORPUS, JSON.stringify(corpus));   // minified, single line — see header
console.log(`written: ${CORPUS}`);
console.log("NEXT: node scripts/build-dua-occasions.mjs   (these records have no occasion yet)");
