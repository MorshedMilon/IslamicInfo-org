'use strict';
/* As-Sa'di layout-aware ingest (v5): geometry cleaning + COMBINED segmentation.
   Emits an ordered stream of {range} (from per-page "(N-M)" headers) and {text}
   (clean body lines). Header ranges drive block boundaries where present (correct
   ranges); verse-key runs ("X:N.") provide the surah and a fallback range for short
   surahs / pages whose header OCR'd badly (full coverage). */
const fs = require('fs');

function hasArabic(t) { return /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(t); }
function median(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
function unesc(t) { return t.replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'); }

function parsePage(chunk) {
  const hm = chunk.match(/height="(\d+)"/); const H = hm ? +hm[1] : 2743;
  const lines = [];
  const lineRe = /<LINE\b[^>]*>([\s\S]*?)<\/LINE>/g; let lm;
  while ((lm = lineRe.exec(chunk))) {
    const words = [];
    const wRe = /<WORD coords="([^"]*)"[^>]*>([\s\S]*?)<\/WORD>/g; let wm;
    while ((wm = wRe.exec(lm[1]))) {
      const c = wm[1].split(',').map(Number); const txt = unesc(wm[2]); if (!txt.trim()) continue;
      words.push({ xL: c[0], yT: c[3], yB: c[1], h: Math.abs(c[1] - c[3]), text: txt });
    }
    if (!words.length) continue;
    words.sort((a, b) => a.xL - b.xL);
    const yc = words.reduce((s, w) => s + (w.yT + w.yB) / 2, 0) / words.length;
    lines.push({ yc, rel: yc / H, h: median(words.map(w => w.h)), words });
  }
  lines.sort((a, b) => a.yc - b.yc);
  const bodyH = median(lines.filter(l => l.rel > 0.15 && l.rel < 0.80).map(l => l.h)) || 30;
  return { H, lines, bodyH };
}
function parseRange(s) {
  const m = s.match(/\((\d{1,3})\s*[-–]\s*(\d{1,3})\)|\((\d{1,3})\)/);
  if (!m) return null;
  const r = m[1] ? { from: +m[1], to: +m[2] } : { from: +m[3], to: +m[3] };
  return (r.from >= 1 && r.to >= r.from && r.to <= 286) ? r : null;
}
function isFooterText(t) {
  return /sunniconnect|kalamullah|iiph|international islamic|riyadh|isbn|www\.|deposit/i.test(t)
    || /tafseer\s*as-?sa.?di/i.test(t) && /\|\s*\d|juz/i.test(t)
    || /^\s*\d+\s*[|iI]\s*tafseer/i.test(t)
    || /^\s*(juz|soorat|contents)\b/i.test(t)
    || /\(\s*(editor|translator)\s*\)/i.test(t)
    || /^\s*\d{1,2}\s+(In|The|This|A |An |See|Al-|as-|Reported|Narrated|That|It |For |Here|These|One|Some|Many|According|Bukhari|Muslim|Ibn|Abu|The word|i\.e|Saheeh|At-|An-)/.test(t);
}
function cleanText(t) {
  return t.replace(/[\^\{\}†‡«»■□♦▪●◆°~]/g, ' ')
    .replace(/\)[*?]+/g, ')').replace(/[|]j\b/g, '')
    .replace(/\btf(?=[a-z])/g, '').replace(/\bff(?=[a-z])/g, '').replace(/\b6j(?=[A-Z])/g, '')  // OCR quote-bracket artifacts
    .replace(/\(\s*[^a-zA-Z0-9)]{0,3}\s*\)/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
    .replace(/\s+/g, ' ').trim();
}
// A body line must read as English prose (not Arabic-OCR'd-as-Latin gibberish).
function isEnglishProse(t) {
  const toks = t.split(/\s+/).filter(Boolean);
  if (toks.length < 3) return true;                        // keep short lines (e.g. sentence tails)
  const normal = toks.filter(w => /^[A-Za-z’'"(]?[A-Za-z’']{2,}[.,;:!?)”’]{0,2}$/.test(w)).length;
  return normal / toks.length >= 0.45;
}

function stream(xmlFile) {
  const xml = fs.readFileSync(xmlFile, 'utf8');
  const pages = xml.split(/<OBJECT\b/).slice(1);
  const items = [];
  pages.forEach(chunk => {
    const { H, lines, bodyH } = parsePage(chunk);
    if (!lines.length) return;
    const header = lines.filter(l => l.rel < 0.13).map(l => l.words.map(w => w.text).join(' ')).join('  ');
    const r = parseRange(header);
    if (r) items.push({ range: r });
    for (const l of lines) {
      if (l.rel < 0.13 || l.rel > 0.945) continue;
      if (l.rel > 0.70 && l.h < 0.82 * bodyH) continue;
      const eng = l.words.filter(w => !hasArabic(w.text)).map(w => w.text);
      if (!eng.length) continue;
      const t = eng.join(' ');
      if (t.replace(/\s/g, '').length < l.words.map(w => w.text).join('').length * 0.35) continue;
      if (!isEnglishProse(t)) continue;                    // drop Arabic-as-Latin gibberish
      items.push({ text: t });
    }
  });
  return items;
}

const VK = /^\s*(\d{1,3})\s*:\s*(\d{1,3})\s*\.\s*/;
function segment(items) {
  const blocks = [];
  let surah = null, run = [], buf = [], mode = 'seek', headRange = null;
  function flush() {
    const range = headRange || (run.length ? { from: Math.min.apply(null, run), to: Math.max.apply(null, run) } : null);
    if (surah && range && buf.length) {
      const text = cleanText(buf.join(' '));
      if (text.length > 60) blocks.push({ surah, from: range.from, to: range.to, text });
    }
    buf = []; run = []; headRange = null;
  }
  for (const it of items) {
    if (it.range) {
      if (headRange && (it.range.from !== headRange.from || it.range.to !== headRange.to)) flush();
      headRange = it.range;
      continue;
    }
    const m = it.text.match(VK);
    if (m) {
      const s = +m[1], a = +m[2];
      if (surah !== null && s !== surah) { flush(); surah = s; }
      else surah = s;
      // no header ranges (short surahs): break block on verse-run discontinuity in prose
      if (!headRange && mode === 'prose' && run.length && a > Math.max.apply(null, run) + 1) flush();
      run.push(a); mode = 'listing';
      continue;
    }
    if (mode === 'seek') continue;
    if (isFooterText(it.text)) continue;
    buf.push(it.text); mode = 'prose';
  }
  flush();
  return blocks;
}
function ingest(xmlFile) { return segment(stream(xmlFile)); }
module.exports = { ingest, stream, segment };
