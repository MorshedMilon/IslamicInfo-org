# Tafsir As-Sa'di (English) — OCR ingest

Generates `src/data/tafsir-saadi/{surah}.json` — the English **Tafseer as-Sa'di**
commentary the Quran Explorer's 4th Tafsir tab loads.

## Why this exists
As-Sa'di has **no free structured/per-ayah English dataset** anywhere (verified against
quran.com, spa5k, quranenc, QUL/Tarteel, HuggingFace, GitHub — all Arabic/Russian/Urdu
only). The only free English is the scanned 10-volume PDF set. So we OCR-ingest it.

## Source & attribution
- **Work:** *Tafseer as-Sa'di* by Sheikh Abdur-Rahman Nasir as-Sa'di, English translation
  (Nasiruddin al-Khattab), International Islamic Publishing House (IIPH), 10 volumes.
- **Digitized from:** Internet Archive item
  `https://archive.org/details/Tafseer-As-Sadi-Juz-1-30` — the per-volume `_djvu.xml`
  (DjVu OCR with word coordinates).

## Method (`parse.js`)
Layout-aware parse using the OCR **word coordinates**:
1. Per page, drop the running **header** (top ~12%), **page number / footer** (bottom),
   and **footnotes** (small font low on the page) by geometry; drop Arabic-script words.
2. Reconstruct correct reading order from `<LINE>`/`<WORD>`.
3. Segment into blocks: the per-page **"(N-M)" range headers** give the authoritative
   verse-range where present; **"X:N." verse-key runs** give the surah and a fallback
   range for short surahs / pages whose header OCR'd badly.
4. Clean residual OCR quote-bracket artifacts; write per-surah block arrays
   `[{ from, to, text }]` (As-Sa'di comments on verse *ranges*).

## Regenerate
```
node tools/saadi-ingest/run.mjs
```
Downloads the 10 `_djvu.xml` files (~83 MB, cached in the OS temp dir) and rewrites
`src/data/tafsir-saadi/`.

## Known limitations (⚠️ pending 🕌 human review — CONTENT-POLICY §5)
- **Coverage:** 113/114 surahs. **Surah 105 (Al-Fil) is missing** (OCR structure gap) —
  to be filled during review.
- Ayahs that fall between exact block ranges are served the **nearest preceding block in
  the same surah** (`tafsirCore.findBlock`), so every ayah shows its section's commentary.
- OCR is machine-generated: occasional residual artifacts (a stray footnote number, a
  clipped block-opening sentence, minor typos) remain. The English prose is otherwise
  clean and faithful. **This tab ships pending scholarly review**, which is the quality
  gate for the residual OCR noise.
