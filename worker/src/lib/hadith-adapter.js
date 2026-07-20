/* Normalizes hadithapi.com payloads into the internal safe schema.
   Rules: never fabricate; unconfirmed fields => explicit status; the grade
   badge is NEVER omitted (missing status => 'unknown'/'Grade Unknown').
   NOTE: source field reads marked ASSUMPTION need one live-response check. */

const GRADE_MAP = {
  'sahih': 'sahih', 'hasan': 'hasan', "da'eef": 'daif', 'daif': 'daif',
  "da'if": 'daif', 'zaeef': 'daif', 'maudu': 'mawdu', 'mawdu': 'mawdu',
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
  return {
    collectionSlug: raw.bookSlug || raw.bookslug || null,   // ASSUMPTION
    collectionName: raw.bookName || null,                   // ASSUMPTION
    collectionArabicName: raw.bookNameArabic || null,       // ASSUMPTION (may be absent)
    compiler: raw.writerName || null,                       // ASSUMPTION
    hadithCount: toInt(raw.hadiths_count),                  // ASSUMPTION
    chaptersCount: toInt(raw.chapters_count),               // ASSUMPTION
  };
}

export function normalizeChapter(raw = {}) {
  return {
    collectionSlug: raw.bookSlug || null,                   // ASSUMPTION
    bookNumber: toInt(raw.chapterNumber),                   // ASSUMPTION
    bookName: raw.chapterEnglish || null,                   // ASSUMPTION
    bookArabicName: raw.chapterArabic || null,              // ASSUMPTION
    hadithCount: toInt(raw.hadiths_count),                  // ASSUMPTION (may be absent)
  };
}

export function normalizeHadith(raw = {}, { language = 'en' } = {}) {
  const book = raw.book || {};                              // ASSUMPTION nested object
  const chapter = raw.chapter || {};                        // ASSUMPTION nested object
  const arabicMatn = raw.hadithArabic || '';                // ASSUMPTION
  const text = raw.hadithEnglish || '';                     // ASSUMPTION
  const slug = book.bookSlug || raw.bookSlug || null;
  const hadithNumber = toInt(raw.hadithNumber);
  const reference = slug && hadithNumber ? `${book.bookName || slug} · Hadith ${hadithNumber}` : null;

  return {
    id: slug && hadithNumber ? `${slug}:${toInt(chapter.chapterNumber) ?? 0}:${hadithNumber}` : null,
    source: 'hadithapi',
    sourceId: raw.id ?? null,
    collectionSlug: slug,
    collectionName: book.bookName || null,
    collectionArabicName: book.bookNameArabic || null,
    bookNumber: toInt(chapter.chapterNumber),
    bookName: chapter.chapterEnglish || null,
    bookArabicName: chapter.chapterArabic || null,
    hadithNumber,
    reference,
    arabicMatn,
    translation: { text, language, edition: 'hadithapi.com', translator: null },
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
