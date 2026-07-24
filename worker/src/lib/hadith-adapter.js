/* Normalizes hadithapi.com payloads into the internal safe schema.
   Rules: never fabricate; unconfirmed fields => explicit status; the grade
   badge is NEVER omitted (missing status => 'unknown'/'Grade Unknown').
   NOTE: field reads VERIFIED 2026-07-19 against a live hadithapi.com response
   (books/chapters/hadiths). The API provides no Arabic collection name, so
   collectionArabicName is honestly null. */

const GRADE_MAP = {
  'sahih': 'sahih', 'hasan': 'hasan', "da'eef": 'daif', 'daif': 'daif',
  "da'if": 'daif', 'zaeef': 'daif', 'maudu': 'mawdu', 'mawdu': 'mawdu',
};

// slug → full display name, for the collections this Worker serves (hadithapi).
// Mirror of nameEnglish in src/data/hadith/collections.json — the SAME names
// the sidebar/collection header render, so a hadith card's citation matches the
// rest of the page rather than whatever raw string the upstream API happens to
// return. Browser paths (direct-source collections) use the parallel table in
// src/js/hadith-citation-core.js; keep both in sync with collections.json.
const COLLECTION_NAMES = {
  'sahih-bukhari': 'Sahih al-Bukhari',
  'sahih-muslim': 'Sahih Muslim',
  'abu-dawood': 'Sunan Abu Dawud',
  'al-tirmidhi': "Jami' at-Tirmidhi",
  'sunan-nasai': "Sunan an-Nasa'i",
  'ibn-e-majah': 'Sunan Ibn Majah',
  'musnad-ahmad': 'Musnad Ahmad',
  'mishkat': 'Mishkat al-Masabih',
  'al-silsila-sahiha': 'Al-Silsilah al-Sahihah',
};

function toInt(v) {
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

// Small, dependency-free stable hash (FNV-1a → hex) for audit/dedup.
function contentHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function normalizeGrade(status) {
  const key = String(status ?? '').trim().toLowerCase();
  const value = GRADE_MAP[key] || 'unknown';
  const label = value === 'unknown' ? 'Grade Unknown'
    : { sahih: 'Sahih', hasan: 'Hasan', daif: "Da'if", mawdu: "Mawdu'" }[value];
  return { value, label, grader: null, sourceCitation: null, disputed: false, alternateGradings: [] };
}

export function normalizeBook(raw = {}) {
  raw = raw || {};
  return {
    collectionSlug: raw.bookSlug || raw.bookslug || null,   // VERIFIED 2026-07-19
    collectionName: raw.bookName || null,                   // VERIFIED 2026-07-19
    collectionArabicName: raw.bookNameArabic || null,       // VERIFIED 2026-07-19 (may be absent)
    compiler: raw.writerName || null,                       // VERIFIED 2026-07-19
    hadithCount: toInt(raw.hadiths_count),                  // VERIFIED 2026-07-19
    chaptersCount: toInt(raw.chapters_count),               // VERIFIED 2026-07-19
  };
}

export function normalizeChapter(raw = {}) {
  raw = raw || {};
  return {
    collectionSlug: raw.bookSlug || null,                   // VERIFIED 2026-07-19
    bookNumber: toInt(raw.chapterNumber),                   // VERIFIED 2026-07-19
    bookName: raw.chapterEnglish || null,                   // VERIFIED 2026-07-19
    bookArabicName: raw.chapterArabic || null,              // VERIFIED 2026-07-19
    hadithCount: toInt(raw.hadiths_count),                  // VERIFIED 2026-07-19 (may be absent)
  };
}

export function normalizeHadith(raw = {}, { language = 'en' } = {}) {
  raw = raw || {};
  const book = raw.book || {};                              // VERIFIED 2026-07-19 nested object
  const chapter = raw.chapter || {};                        // VERIFIED 2026-07-19 nested object
  const arabicMatn = raw.hadithArabic || '';                // VERIFIED 2026-07-19
  const text = raw.hadithEnglish || '';                     // VERIFIED 2026-07-19
  const slug = book.bookSlug || raw.bookSlug || null;
  const hadithNumber = toInt(raw.hadithNumber);
  // Canonical display name: prefer the shared table (matches the sidebar/header),
  // then the upstream book name, then null.
  const collectionName = COLLECTION_NAMES[slug] || book.bookName || null;
  // Scholarly citation "[Collection] [Number]" — hadith number ONLY (rationale in
  // src/js/hadith-citation-core.js). No backend vendor name, no book/chapter number.
  const reference = collectionName && hadithNumber ? `${collectionName} ${hadithNumber}` : null;

  return {
    id: slug && hadithNumber ? `${slug}:${toInt(chapter.chapterNumber) ?? 0}:${hadithNumber}` : null,
    source: 'hadithapi',
    sourceId: raw.id ?? null,
    collectionSlug: slug,
    collectionName,
    collectionArabicName: book.bookNameArabic || null,
    bookNumber: toInt(chapter.chapterNumber),
    bookName: chapter.chapterEnglish || null,
    bookArabicName: chapter.chapterArabic || null,
    hadithNumber,
    reference,
    arabicMatn,
    // `edition` intentionally null: it previously carried the backend vendor
    // ('hadithapi.com'), which must never surface as a user-facing "source".
    // Provenance lives in `source` above + sourceMetadata below (internal/admin).
    translation: { text, language, edition: null, translator: null },
    narrator: { id: null, name: raw.englishNarrator || null, arabicName: null },
    grade: normalizeGrade(raw.status),
    isnad: { status: 'unavailable', narrators: [] },
    topics: [],
    audio: { status: 'unavailable', url: null, reciter: null },
    sourceMetadata: {
      fetchedAt: new Date().toISOString(),
      sourceUrlOrId: raw.id != null ? `hadithapi:${raw.id}` : null,
      contentHash: contentHash(arabicMatn + '|' + text + '|' + (reference || '')),
      verificationStatus: 'source-only',
    },
  };
}
