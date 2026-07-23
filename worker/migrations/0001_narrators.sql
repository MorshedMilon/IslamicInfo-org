-- Itqan narrator-reliability D1 schema (ADR-046/047).
-- Apply:  wrangler d1 execute rijal --file worker/migrations/0001_narrators.sql
-- Then load data with the file produced by worker/scripts/ingest-itqan.mjs.

CREATE TABLE IF NOT EXISTS narrators (
  id                INTEGER PRIMARY KEY,   -- Itqan narrator id
  full_name         TEXT,                  -- Arabic
  kunya             TEXT,                  -- Arabic
  grade_en          TEXT,                  -- consolidated: companion|reliable|mostly_reliable|weak|abandoned|fabricator|unknown
  grade_ar          TEXT,                  -- Arabic consolidated grade
  dhahabi           TEXT,                  -- al-Dhahabi's assessment (Arabic), may be "-"
  death             TEXT,
  tabaqat           TEXT,
  city              TEXT,
  classical_sources TEXT,                  -- JSON: { text: { entry_id, grade_en, grade_ar } } — per-text, may disagree
  namings           TEXT                   -- JSON: string[] Arabic name variants
);

CREATE INDEX IF NOT EXISTS idx_narrators_grade ON narrators(grade_en);
