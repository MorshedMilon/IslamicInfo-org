# DATA.md — Client Storage & Data Schemas
**Single source of truth for all stored data · v1.0 · 2026-06-03**

> v1 has **no user accounts and no database**. All personalization is client-side
> in `localStorage`. This file is the *one place* keys and schemas are defined — if
> a key is not here, it should not exist. Server-side cache keys (Stage 2+) are in
> §5; the future account/DB schema is sketched in §6 but **not built in v1**.
>
> Rules: all keys are prefixed `islamicinfo-` or `ii-`. Sub-brand products use their
> own prefix and must never collide. Every write is wrapped in try/catch (quota +
> availability). Reads tolerate missing/old keys and fall back to defaults.

---

## 1. localStorage Key Registry

| Key | Shape | Owner page | Persists |
|---|---|---|---|
| `islamicinfo-theme` | `'light' \| 'dark'` | All pages | Until user changes |
| `islamicinfo-lang` | string (locale id) | Future i18n (Stage 3) | Until user changes |
| `islamicinfo-prayer-{city}-{date}` | `PrayerData` (JSON) | Tools, Home | 1 day |
| `islamicinfo-prayer-city` | string | Tools, Home | Until user changes |
| `islamicinfo-prayer-method` | string (calc method id) | Tools | Until user changes |
| `islamicinfo-nisab-{date}` | `NisabData` (JSON) | Tools | 1 day |
| `islamicinfo-qibla-city` | string | Tools | Until user changes |
| `islamicinfo-hadith-last-read` | `{ collectionSlug, bookNum, hadithNum }` | Hadith Library | Until overwritten |
| `islamicinfo-hadith-lang` | string — preferred hadith translation language code (`en`/`ur`/`fr`/`id`/`tr`) for Tier 3b deep-view translation tabs; written on tab switch, read on deep-view render; defaults to `en` when unset or when the stored language is not present in the payload | Hadith Library (Module 7 — Tier 3b) | Until user changes |
| `islamicinfo-hadith-bookmarks` | `HadithBookmark[]` | Hadith Library | Permanent |
| `islamicinfo-hadith-notes` | `HadithNote[]` | Hadith Library | Permanent |
| `islamicinfo-hadith-reading-mode` | `'1'` when Reading Mode (US-H21, Module 16) is active, else the key is absent. Mirror of the `?mode=reading` URL param (the primary source of truth); written on entering Reading Mode, `removeItem`'d on exit. On deep-view load, Reading restores if **either** this key is `'1'` **or** the URL carries `?mode=reading` (`initialMode`). Study Mode (US-H20) intentionally has **no** storage key — it is session-only (ADR-041). | Hadith Library (Module 16 — Tier 3b) | Until user exits Reading Mode |
| `islamicinfo-hadith-translation-pref` | string — preferred translation **edition** id for the Tier-1 feed-card compare row (US-H23, Module 12); written on `.dv-tab` edition click, read on card render to restore the active tab. Distinct from `islamicinfo-hadith-lang` (that is the Tier-3b deep-view *language* selector). Dormant until provider data exposes >1 edition per hadith — today the adapter returns a single edition, so no compare tabs render. | Hadith Library (Module 12) | Until user changes |
| `islamicinfo-hadith-{collection}-{book}-{date}` | cached API response (JSON) | Hadith Library | 1 day |
| `islamicinfo-hadith-collections` | merged 18-collection index seed (JSON) — ADR-024 | Hadith Library | 7 days |
| `islamicinfo-hadith-fawaz-{edition}` | fawazahmed0 edition file, e.g. `eng-nawawi` / `ara-nawawi` (JSON), keyless direct fetch — ADR-024 | Hadith Library | 7 days |
| `islamicinfo-hadith-ab-{path}` | AhmedBaset v1.2.0 collection file (JSON), keyless direct fetch pinned to release tag — ADR-024 | Hadith Library | 7 days |
| `islamicinfo-is-progress` | `ISProgress` (see §3) | Islamic Studies | Permanent |
| `islamicinfo-is-visit` | `{ trackSlug, lessonIndex, departedAt }` | Islamic Studies | Cleared on return |
| `ii-habits` | `HabitState` (see §4) | Habit Tracker | Permanent |
| `ii-quran-translation` | string (edition id) | Quran Explorer | Until user changes |
| `ii-quran-translations-list` | `{ fetchedAt:number, data:Translation[] }` (JSON; `Translation = {id,name,language,languageLabel,dir}`) | Quran Explorer (translation picker) | 7 days (quran.com `/resources/translations` catalog; seeds from `src/data/translations.json` on failure) |
| `ii-quran-reading-mode` | boolean | Quran Explorer | Until user changes |
| `ii-quran-mushaf-page` | string (integer 1–604) | Quran Explorer (Mushaf Mode) | Until user changes (last-viewed QCF page) |
| `ii-quran-tafsir-expanded` | `'0' \| '1'` | Quran Explorer (Tafsir panel) | Until user changes (Normal vs Expanded width, desktop chevron) |
| `ii-quran-tafsir-hidden` | `'0' \| '1'` | Quran Explorer (Tafsir panel) | Until user changes (panel hidden/shown; remembers layout across visits) |
| `ii-tafsir-{verseKey}-{src}` | `{ paras:string[], ts:number }` (JSON) | Quran Explorer (Tafsir panel) | 30 days (per-ayah, per-source tafsir cache; src ∈ ik/ma/ja) |
| `ii-refl-verse` | `{ day:number, data:Verse }` (JSON) | Home + Quran (Daily Reflection) | 1 day (daily verse-of-the-day cache) |
| `ii-refl-bookmarks` | `SavedReflection[]` — `{ id, type, ref, arabic, text, grade, savedAt }` (JSON) | Home + Quran (Daily Reflection cards) | Permanent (id = `type\|ref`; newest-first; bookmark icon on the trio cards) |
| `ii-refl-notes` | `ReflNote[]` — `{ id, text, updatedAt }` (JSON) | Home + Quran (Daily Reflection cards) | Permanent (id = `type\|ref`; personal reflection per card) |
| `ii-quran-chapters` | `{ fetchedAt:number, data:Chapter[] }` (JSON) | Quran Explorer | 1 day (24h revalidate) |
| `ii-verses-{surah}-{edition}` | `{ fetchedAt:number, verses:Verse[] }` (JSON) | Quran Explorer | 1 day (24h revalidate) |
| `ii-quran-reciter` | string (reciter id) | Quran Explorer | Until user changes |
| `ii-reciters` | `{ fetchedAt:number, data:Reciter[] }` (JSON) | Quran Explorer | 7 days |
| `ii-audio-{surah}-{reciter}` | `{ fetchedAt:number, ayahs:AyahAudio[] }` (JSON) | Quran Explorer | 7 days |
| `ii-quran-bookmarks` | `Bookmark[]` (JSON) | Quran Explorer | Permanent |
| `ii-quran-notes` | `Note[]` (JSON) | Quran Explorer | Permanent |
| `ii-quran-ai-{verseKey}-{editionSlug}` | `{ answer:string, ts:number }` (JSON) | Quran Explorer | 30 days (per-verse AI explanation cache; `answer` is the post-filtered/displayed text; no PII) |
| `ii-saved-selections` | `{ text, type, sourceRef, ts }[]` (JSON) | Select & Ask (QuranlyAI, all pages) | Permanent (highlighted snippets saved from the selection menu; de-duped by text+type) |
| `ii-qul-reciters` | `{ fetchedAt:number, data:Reciter[] }` (JSON) | Quran Explorer | 7 days (Module 6 — QUL reciter list, empty until an operator ingests reciters) |
| `ii-qul-audio-{reciter}-{surah}` | `{ fetchedAt:number, ayahs:AyahAudio[] }` (JSON) | Quran Explorer | 7 days (Module 6 — QUL per-surah timing JSON) |
| `islamicinfo-verse-{date}` | `/api/verse` response (JSON) | Home | 1 day (UTC midnight bust) |
| `islamicinfo-hadith-daily-{date}` | `/api/hadith` response (JSON) | Home | 1 day (UTC midnight bust) |
| `islamicinfo-dua-{date}` | `/api/dua` response (JSON) | Home | 1 day (UTC midnight bust) |
| `tasbeeh-session-{YYYY-MM-DD}` | `{ dhikr: string, count: number }[]` | Tools | 30 days |
| `fasting-{month-year}` | `{ fastedDays: number[] }` | Tools | Permanent |
| `sadaqah-ledger` | `{ date, amount, cause }[]` | Tools | Permanent |
| `sadaqah-goal` | number | Tools | Until user changes |

> **Adding a key?** Add the row here first, then implement. A key not in this table
> is a bug. Date-suffixed keys (`{date}`, `{YYYY-MM-DD}`, `{month-year}`) are how we
> expire data without a TTL mechanism — old keys are swept lazily on next access.

> **Module 15 (Comparison Mode).** Uses NO localStorage/sessionStorage key. The selected
> comparison set (up to 3 hadith refs) is held in memory for the session and encoded in
> the URL (`/hadith/compare?refs=slug:book:num,…`); deep-links and shares work via a
> fresh per-ref fetch on load, not stored state — see ADR-039.

> **Module 6 — QUL static file layout.** In addition to the `ii-qul-*`
> `localStorage` caches above, QUL reciter data itself is static JSON on Pages
> (no binding): `src/data/qul/reciters.json` → `Reciter[]` (ships `[]`) and
> `src/data/qul/{offsetId}/{surahId}.json` → `AyahAudio[]`. QUL reciter ids are
> offset by **+1,000,000** (`offsetId = 1000000 + qulReciterId`) so they never
> collide with Quran.com's numeric ids; `CompositeAudioSource` in
> `quran-audio.js` routes `getSurahAudio` by `id >= 1,000,000`. See
> `src/data/qul/README.md` for the operator ingest workflow.

> **Related Verses static index (Quran Explorer knowledge index, slice 1).**
> Static JSON on Pages, no binding, no `/api/` route: `src/data/related-verses/topics.json`
> → `{ [topicSlug]: { label, verses: [{ key, ref, score, translation, translator, sourceCitation }] } }`
> and `src/data/related-verses/verse-index.json` → `{ [verseKey]: topicSlug[] }`. Both files
> are **generated** by `tools/related-verses-build.mjs` from the hand-authored curation
> source `tools/related-verses/topics.source.json` — do **not** hand-edit the generated
> files; regenerate via the build script. Every tagged verse row carries a build-time-baked
> Saheeh International translation (`translation`/`translator`) plus a `sourceCitation`;
> the build is fail-closed and aborts if any row is missing one. Loaded client-side by
> `src/js/quran-related.js` (pure lookup logic in `src/js/quran-related-core.js`) to render
> the per-verse "Related Verses" panel in `quran.html`.

> **Related Hadith static index (Quran Explorer knowledge index, slice 2).**
> Static JSON on Pages, no binding, no `/api/` route: `src/data/related-hadith/topics.json`
> → `{ [slug]: { label, hadith: [{ collection, number, ref, book, arabic, english, narrator,
> isnadSummary, grade, gradedBy, url, score }] } }`. **Generated** by
> `tools/related-hadith-build.mjs` from the hand-authored curation source
> `tools/related-hadith/topics.source.json` — do **not** hand-edit the generated file;
> regenerate via the build script. The build emits **only `reviewed:true`** rows. Operator
> 🕌 sign-off completed 2026-07-17 — `topics.json` now ships **6 hadith across 4 topics**
> (patience, mercy, gratitude, truthfulness).
> Every row is verifier-confirmed: `collection`+`number`, `grade` (Sahih/Hasan only),
> `gradedBy`, and a verified `isnadSummary`, plus Arabic + English text. Reuses the slice-1
> `src/data/related-verses/verse-index.json` (a verse's topic tags drive both the Related
> Verses and Related Hadith panels — no separate verse index). Loaded client-side by
> `src/js/quran-related-hadith.js` (pure lookup logic in `src/js/quran-related-hadith-core.js`)
> to render the per-verse "Related Hadith" panel in `quran.html`.

> **Vocabulary static index (Quran Explorer knowledge index, slice 3 — Knowledge Index now
> COMPLETE).** Static JSON on Pages, no binding, no `/api/` route: `src/data/vocab/terms.json`
> → `{ [termSlug]: { arabic, translit, shortDef, longDef, source, topics } }` and
> `src/data/vocab/topic-terms.json` → `{ [topicSlug]: termSlug[] }` (reverse map). Both files
> are **generated** by `tools/vocab-build.mjs` from the hand-authored curation source
> `tools/vocab/terms.source.json` — do **not** hand-edit the generated files; regenerate via the
> build script. Every term record carries a `source` field — definitions are grounded in **Lane's
> Arabic-English Lexicon** — and the build fails closed if a term is missing one, has a blank
> field, or maps to a `topics[]` slug outside the shared `related-verses` taxonomy. **16 terms**
> ship live. `topics[]` reuses the slice-1/2 taxonomy: a term's cross-referenced verses and
> hadith are looked up on demand from `src/data/related-verses/topics.json` and
> `src/data/related-hadith/topics.json` (no separate vocab-specific cross-ref data; no database).
> Loaded client-side by `src/js/quran-vocab.js` (pure lookup logic in
> `src/js/quran-vocab-core.js`) to render the per-verse "Key Terms" panel in `quran.html`.

## 2. Small Value Shapes

```ts
PrayerData = {
  city: string; date: string; method: string;
  timings: { Fajr; Dhuhr; Asr; Maghrib; Isha; Sunrise };
  source: 'aladhan' | 'cache' | 'fallback';
}
NisabData      = { currency: string; goldPricePerGram: number; nisabValue: number; asOf: string; source: string }
HadithBookmark = { ref: string /* "collectionSlug:bookNum:hadithNum" */; collectionSlug: string; bookNum: string|null; hadithNum: string; category: string /* default 'General'; 4 built-ins + ≤5 custom categories derived from bookmarks in use */; createdAt: number /* ms epoch */ }  // Module 10 (per-hadith action suite)
HadithNote     = { hadithRef: string /* "collectionSlug:bookNum:hadithNum" */; text: string /* ≤2000 chars, client-enforced */; updatedAt: number /* ms epoch */ }  // Module 10
Hadith         = { id: string; collectionSlug: string; bookNum: number; hadithNum: number; arabic: string; translation: string; translator: string; narrator: string; grade: 'sahih'|'hasan'|'daif'|'mawdu'|null; grader: string|null }  // grade/grader null for the 9 characterization-only collections (40 Nawawi + 8 AhmedBaset) — ADR-022
Chapter        = { id: number; name_simple: string; name_arabic: string; revelation_place: 'makkah' | 'madinah'; verses_count: number; slug: string }
Verse          = { verse_key: string; verse_number: number; text_uthmani: string; translation: string; words: { ar: string; en: string }[] }
Reciter        = { id: number; name: string; style: string }
AyahAudio      = { verse_key: string; url: string; segments: { word: number; start: number; end: number }[] }
Bookmark       = { verseKey: string; surahName: string; surahId: number; ayahNo: number; arabic: string; translation: string; edition: string; category: string; addedAt: number }
Note           = { verseKey: string; text: string; updatedAt: number }
```

## 3. Islamic Studies Progress Schema (`islamicinfo-is-progress`)

```json
{
  "[trackSlug]": {
    "done": [0, 1, 2],
    "quizScores": [92, 88, 85]
  },
  "streak": { "count": 14, "lastDate": "YYYY-MM-DD", "longestStreak": 21 },
  "certificates": ["aqeedah", "taharah"]
}
```

**Logic (mirror exactly in code):**
- Beginner → Intermediate unlock: ALL beginner tracks complete (every lesson `done` + every `quizScore ≥ 70`).
- Quiz pass threshold: **70%** (≥ 4/5). Fail → retry immediately, no cooldown.
- Return-detection: on `visibilitychange`, if `islamicinfo-is-visit.departedAt` < 30 min ago → mark lesson `ln-read`, then clear `islamicinfo-is-visit`.
- `certificates[]` is a Stage 4 hook (certificate generation) — written now, consumed later.

## 4. Habit Tracker State Schema (`ii-habits`)

```json
{
  "dateKey": "YYYY-MM-DD",
  "prayers": [false, false, false, false, false],
  "sunnahPrayers": { "Qiyam": false, "Duha": false, "Witr": false, "Tahajjud": false },
  "quranPages": 0,
  "quranGoal": 5,
  "duaChecked": [false, false, false, false, false, false],
  "fastingDays": { "YYYY-MM-DD": true },
  "sunnahItems": [false, false, false, false, false, false],
  "streak": 0,
  "longestStreak": 0,
  "history": { "YYYY-MM-DD": { "prayers": 5, "score": 88, "quranPages": 3 } }
}
```

**Sunnah Score formula (canonical — do not alter weights without an ADR):**
```js
score = Math.round(
  (prayers.filter(Boolean).length / 5)            * 50 +
  Math.min(quranPages / (quranGoal || 5), 1)      * 20 +
  (duaChecked.filter(Boolean).length / 6)         * 15 +
  (sunnahItems.filter(Boolean).length / 6)        * 15
);
```

**Day boundary:** when `dateKey !== today` → archive previous day into `history`, recompute `streak`/`longestStreak`, reset daily fields.

## 5. Server-Side Cache Keys (Stage 2+)

Redis / Vercel KV / Cloudflare KV. TTLs match `API-SPEC.md`.

```
prayer:{city}:{date}              → AlAdhan response        TTL 24h
nisab:{date}                      → gold price              TTL 24h
verse:{date}                      → daily verse             TTL 24h (bust midnight UTC)
hadith:{date}                     → daily hadith            TTL 24h
quran:{surah}                     → surah verses            TTL 7 days
hadith:{collection}:{book}:{date} → book hadiths            TTL 24h
```

### Hadith Library KV cache (Module 0 — namespace `QURANLYAI_KV`, `hadith:` prefix)
| Key | TTL |
|---|---|
| `hadith:collections` | 7d |
| `hadith:chapters:{slug}` | 7d |
| `hadith:list:{slug}:{book}:{page}` | 24h |
| `hadith:one:{slug}:{book}:{num}` | 24h |
| `hadith:daily:{YYYY-MM-DD}` | to UTC midnight |
| `hadith:search:{lang}:{page}:{q}` | 1h |

> **Provider scope (ADR-024, 2026-07-20).** These `hadith:*` KV keys apply **only to the 9 HadithAPI.com collections** (proxied through the Worker, key server-side). The 1 fawazahmed0 (40 Nawawi) + 8 AhmedBaset collections are **keyless direct client fetches** — no Worker, no KV — cached client-side under `islamicinfo-hadith-collections` / `islamicinfo-hadith-fawaz-*` / `islamicinfo-hadith-ab-*` (see §2 localStorage table), with AhmedBaset pinned to release tag `v1.2.0`.

> **Grade/grader canonical shape (ADR-022 + 2026-07-20 refinement).** `grade` and `grader` are populated
> only for the **9 graded collections (9 HadithAPI.com)**. For the **9 characterization-only collections**
> (40 Hadith Nawawi + Riyad as-Saliheen, Bulugh al-Maram, Muwatta Malik, Al-Adab al-Mufrad, Shamail
> Muhammadiyah, Sunan al-Darimi, Forty Hadith Qudsi, Forty Hadith of Shah Waliullah) there is **no
> per-hadith grade at source**: `grade` and `grader` are `null`, and the UI shows a **collection-level
> characterization badge only** — no per-hadith grade badge, and **not** a "Grade Unknown" badge. All
> consumers (feed renderer, copy-with-attribution, share image, deep-view alternate-gradings table)
> must read `null` as "not individually graded". US-H16 copy fallback for these 8: replace
> `Grade: {grade} ({grader}, {year}).` with `Grade: Not individually graded — see collection note`.
> See DECISIONS.md ADR-022.

## 6. Future: Accounts & Sync (Stage 4 — NOT in v1)

When optional accounts arrive, `localStorage` migrates to server-side and syncs via
`/api/sync`. The migration must be **non-destructive** (local data is the source of
truth at first sync). Anticipated tables — *do not build until Stage 4*:

```
users        (id, created_at, email?, locale, theme)
progress     (user_id, track_slug, done[], quiz_scores[], streak, certificates[])
habits       (user_id, date_key, payload jsonb)              -- mirrors §4
bookmarks    (user_id, type, source_ref, saved_at)
notes        (user_id, type, source_ref, text, updated_at)
verifications(user_id, query, result_ref, saved_at)          -- "saved verifications"
```

Privacy: opt-in only; no PII beyond email; analytics carry no PII. Any of this becoming
real is an architectural decision → record it in `docs/DECISIONS.md`.

---
*Promoted from ARCHITECTURE §6. ARCHITECTURE should now link here rather than
restate keys, so there is exactly one definition of each key.*
