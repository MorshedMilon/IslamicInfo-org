# src/data/qul/ — QUL reciter ingest (operator workflow)

Static-hosted timing JSON for word-segmented reciters sourced from **QUL**
(qul.tarteel.ai). QUL has no live API and per-resource licensing, so QUL
reciters are added to the picker via a **build-time ingest** step, not a
runtime integration. This directory ships with **zero data** — an operator
must clear licensing and run the CLI to populate it.

## ID offset scheme

QUL reciter ids are offset by **+1,000,000** in our manifest and file paths
so they never collide with Quran.com's numeric reciter ids. `isQulId(id)` in
`src/js/quran-qul-core.js` treats any id `>= 1,000,000` as QUL;
`CompositeAudioSource` (in `src/js/quran-audio.js`) routes `getSurahAudio`
by that check. Ids stay numeric, so persisted `localStorage['ii-quran-reciter']`
values keep working unchanged.

## Expected QUL export shape

The ingest CLI reads a QUL ayah-by-ayah export: either a bare JSON array, or
an object wrapper (`{ ayahs: [...] }` / `{ data: [...] }` / `{ segments: [...] }`).
Each record is one ayah's timing data. Field names are tolerated across QUL's
variants:

- surah number: `surah` / `sura_number` / `chapter` / `chapter_id`
- ayah number: `ayah` / `ayah_number` / `verse_number` / `verse`
- audio URL: `audio_url` / `audio` (string) / `url` / `audio.url`
- word segments: `segments` / `audio.segments` — each segment is a
  `[wordIndex, startMs, endMs]` triple, or a `[_, wordIndex, startMs, endMs]`
  4-tuple (QUL/Quran.com share this convention), or an object
  `{ word, start, end }`. Malformed segments are dropped, not fabricated.

## File layout (output)

```
src/data/qul/reciters.json          → [{ id, name, style }]   (ships [])
src/data/qul/{offsetId}/{surahId}.json → [{ verse_key, url, segments:[{word,start,end}] }]
```

Only the small timing JSON is hosted here. Audio itself streams from the
`url` in each record — the export's own CDN. We do not mirror or host audio
files.

## CLI usage

```
node tools/qul-ingest.mjs --in <export.json> --id <qulReciterId> --name "<name>" [--style "<style>"]
```

- `--in` — path to the QUL export JSON for one reciter.
- `--id` — the reciter's **QUL** id (pre-offset; the tool adds +1,000,000).
- `--name` — display name shown in the picker.
- `--style` — optional style label (e.g. "Murattal"), shown next to the name.

The tool groups the export by surah, writes
`src/data/qul/{offsetId}/{surahId}.json` per surah, and upserts
`{ id: offsetId, name, style }` into `reciters.json` (sorted by id,
replacing any existing entry for that id). It prints a summary and a
licensing/hotlink reminder; it does not commit anything.

## Operator gate — before committing an ingested reciter

1. **License.** Confirm the specific reciter's QUL resource permits
   redistribution of this timing data (QUL licensing is per-resource —
   some are restricted or require attribution). Do not ingest a reciter
   whose license is unclear.
2. **Hotlinking.** Confirm the audio URLs in the export are stable and
   hotlinkable from a browser (we do not host the audio). If a reciter's
   export uses non-hotlinkable URLs, do not ship it until that's resolved.
3. **Scripture-audio review.** Per CONTENT-POLICY, any recited Quran audio
   needs attribution and a 🕌 review before being treated as production-live
   — same gate Module 3 (Quran.com reciters) already carries. Note the
   reciter's attribution and review status when you commit.

Only after all three are satisfied should the generated
`src/data/qul/{offsetId}/` directory and updated `reciters.json` be
committed and pushed.
