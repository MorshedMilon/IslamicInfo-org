/* Pure parser: Dorar dorar_api.json HTML `result` fragment → normalized Silsila
   items. NO network, NO DOM API (runs in a Worker). Structure ported from the
   MIT-licensed github.com/AhmedElTabarani/dorar-hadith-api: each hadith text
   (`<div class="hadith">`) precedes a `<div class="hadith-info">` block whose
   `.info-subtitle` labels are the Arabic field names. We key by LABEL (order
   varies), not by position.

   Silsila entries carry خلاصة حكم المحدث (al-Albani's paragraph ruling), NOT a
   clean درجة الحديث grade (verified against live data 2026-07-23). We keep the
   ruling VERBATIM and never derive a one-word grade — reducing a nuanced ruling
   to a badge would misrepresent it. Fail-closed: a pair without an Arabic matn
   AND a ruling AND book === Silsila is DROPPED. */

const SILSILA_BOOK = 'السلسلة الصحيحة';
const L = {
  narrator: 'الراوي',
  grader: 'المحدث',
  book: 'المصدر',
  numberOrPage: 'الصفحة أو الرقم',
  ruling: 'خلاصة حكم المحدث',
  grade: 'درجة الحديث', // fallback ruling label (rare for Silsila)
};

function textOf(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

export function buildSilsilaReference(numberOrPage) {
  const ref = String(numberOrPage == null ? '' : numberOrPage).trim();
  return ref ? 'Al-Silsilah al-Sahihah — ' + ref : 'Al-Silsilah al-Sahihah';
}

function parseInfo(infoHtml) {
  const out = {};
  const parts = String(infoHtml).split(/<span[^>]*class="[^"]*info-subtitle[^"]*"[^>]*>/i);
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const close = chunk.indexOf('</span>');
    if (close === -1) continue;
    const label = textOf(chunk.slice(0, close)).replace(/:\s*$/, '').trim();
    if (label) out[label] = textOf(chunk.slice(close + '</span>'.length));
  }
  return out;
}

export function parseDorarResult(resultHtml) {
  const html = String(resultHtml || '');
  const re = /<div\s+class="hadith(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/div>\s*<div\s+class="hadith-info(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/div>/gi;
  const items = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const matn = textOf(m[1]).replace(/^\d+\s*-\s*/, '').trim();
    const info = parseInfo(m[2]);
    const book = info[L.book] || '';
    const ruling = info[L.ruling] || info[L.grade] || '';
    const numberOrPage = info[L.numberOrPage] || null;

    if (!matn) continue;
    if (!ruling) continue;
    if (book.indexOf(SILSILA_BOOK) === -1) continue;

    items.push({
      arabicMatn: matn,
      narrator: info[L.narrator] || null,
      ruling: ruling,
      grader: info[L.grader] || null,
      rulingSource: 'Dorar.net',
      collectionSlug: 'al-silsila-sahiha',
      collectionName: 'Al-Silsilah al-Sahihah',
      numberOrPage: numberOrPage,
      reference: buildSilsilaReference(numberOrPage),
    });
  }
  return items;
}
