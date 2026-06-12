/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith.js  (v1.0 · 2026-06)
   API integration for hadith.html (Hadith Library).

   Requires: api.js loaded first (window.II.api)

   Features:
     1. Hadith of the Day     → GET /api/hadith (no params)
     2. Browse by collection  → GET /api/hadith?collection=&book=
     3. AI Explain per hadith → POST /api/ask-claude (Stage 3 stub)
     4. Grade badge rendering → always displayed per content policy
     5. Bookmark + Copy actions

   Content-policy invariants enforced here:
     - grade  + gradedBy are ALWAYS rendered — never hidden
     - AI disclaimer is hard-coded, never API-supplied
     - No fatwas or rulings are displayed

   HTML IDs / classes expected on hadith.html:
     #hadithOfDay           ← featured card element
     #collectionSelect      ← <select> for collection
     #bookSelect            ← <select> for book number
     #hadithFeed            ← container for browsed hadiths
     #aiModal, #aiContent, #aiClose, #aiDisclaimer
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  function tr(key, fallback, params) {
    if (window.II && window.II.t) return window.II.t(key, fallback, params);
    let s = fallback !== undefined ? fallback : key;
    if (params) Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }

  const api = window.II && window.II.api;
  if (!api) { console.error('[hadith.js] api.js not loaded'); return; }

  /* Hard-coded disclaimer — never replaced by API */
  const AI_DISCLAIMER =
    'AI-generated explanation for educational context only. ' +
    'Not a fatwa or religious ruling. Consult a qualified scholar.';

  const AI_CACHE_PREFIX = 'ii-hadith-ai-';


  /* ─── Grade badge HTML ────────────────────────────────────────── */

  function _gradeBadge(grade, gradedBy) {
    const cls = grade && grade.toLowerCase().startsWith('sahih')
      ? 'grade-sahih'
      : grade && grade.toLowerCase().startsWith('hasan')
        ? 'grade-hasan'
        : 'grade-other';

    return `<span class="hadith-grade ${cls}" title="${tr('js.hadith.gradedByTitle','Graded by {g}',{g: gradedBy || tr('js.hadith.unknownGrader','unknown')})}">${grade || tr('js.hadith.gradeUnknown','Grade unknown')}</span>
            <span class="hadith-grader">— ${gradedBy || tr('js.hadith.graderUnknown','Grader unknown')}</span>`;
  }


  /* ─── Build hadith card HTML ──────────────────────────────────── */

  function _buildCard(h, idPrefix) {
    const cardId = `${idPrefix}-${h.collection}-${h.book}-${h.number}`.replace(/\s+/g, '-');
    return `
    <article class="hadith-card reveal" id="${cardId}" role="article">

      <header class="hadith-card-header">
        <span class="hadith-ref">${h.collection} · ${tr('js.hadith.book','Book')} ${h.book} · ${tr('js.hadith.hadithNo','Hadith')} ${h.number}</span>
        <div class="hadith-grade-block">${_gradeBadge(h.grade, h.gradedBy)}</div>
      </header>

      ${h.arabic ? `<p class="hadith-arabic" dir="rtl" lang="ar">${h.arabic}</p>` : ''}

      <blockquote class="hadith-translation">${h.translation}</blockquote>

      ${h.narrator ? `<p class="hadith-narrator">${tr('js.narrated','Narrated by: {n}',{n:'<em>'+h.narrator+'</em>'})}</p>` : ''}

      <footer class="hadith-card-footer">
        ${h.sourceUrl ? `<a class="hadith-source-link" href="${h.sourceUrl}" target="_blank" rel="noopener">${tr('js.viewSunnah','View on Sunnah.com')}</a>` : ''}

        <div class="hadith-actions" role="toolbar" aria-label="${tr('js.hadith.actionsAria','Hadith actions')}">

          <button class="btn-icon btn-copy"
                  data-text="${encodeURIComponent((h.arabic || '') + '\n' + h.translation + '\n(' + h.collection + ' ' + h.book + ':' + h.number + ')')}"
                  title="${tr('js.hadith.copyTitle','Copy hadith')}" aria-label="${tr('js.hadith.copyTitle','Copy hadith')}">⎘</button>

          <button class="btn-icon btn-bookmark"
                  data-id="hadith-${h.collection}-${h.book}-${h.number}"
                  title="${tr('js.hadith.bookmarkTitle','Bookmark')}" aria-label="${tr('js.hadith.bookmarkAria','Bookmark hadith')}">☆</button>

          <button class="btn-icon btn-ai-explain"
                  data-collection="${encodeURIComponent(h.collection)}"
                  data-book="${h.book}"
                  data-number="${h.number}"
                  data-text="${encodeURIComponent(h.translation)}"
                  title="${tr('js.hadith.aiTitle','AI Explanation (Stage 3)')}"
                  aria-label="${tr('js.hadith.aiAria','AI explanation for this hadith')}">✦</button>

        </div>
      </footer>
    </article>`.trim();
  }


  /* ─── 1. Hadith of the Day ───────────────────────────────────── */

  async function loadHadithOfDay() {
    const container = document.getElementById('hadithOfDay');
    if (!container) return;

    const h = await api.fetchHadith();
    if (!h) {
      container.innerHTML = '<p class="error-msg" role="alert">' + tr('js.hadith.loadError','Could not load Hadith of the Day.') + '</p>';
      return;
    }
    container.innerHTML = _buildCard(h, 'hod');
    _bindCardActions(container);
  }


  /* ─── 2. Browse feed ──────────────────────────────────────────── */

  async function loadFeed(collection, book) {
    const feed = document.getElementById('hadithFeed');
    if (!feed) return;

    feed.innerHTML = '<p class="loading-msg" aria-live="polite">' + tr('js.hadith.loading','Loading hadiths…') + '</p>';

    const h = await api.fetchHadith(collection, book);

    if (!h) {
      feed.innerHTML =
        '<p class="error-msg" role="alert">' + tr('js.hadith.feedError','Could not load hadiths. Check your connection and try again.') + '</p>';
      return;
    }

    /* API may return single object or array; normalise to array */
    const list = Array.isArray(h) ? h : [h];
    feed.innerHTML = list.map(item => _buildCard(item, 'feed')).join('\n');
    _bindCardActions(feed);

    if (window.initReveal) window.initReveal();
  }


  /* ─── 3. AI Explain ──────────────────────────────────────────── */

  async function openAIExplain(collection, book, number, text) {
    const modal      = document.getElementById('aiModal');
    const content    = document.getElementById('aiContent');
    const disclaimer = document.getElementById('aiDisclaimer');

    if (!modal || !content) return;

    if (disclaimer) disclaimer.textContent = tr('js.hadith.disclaimer', AI_DISCLAIMER);

    modal.hidden = false;
    modal.setAttribute('aria-modal', 'true');
    content.innerHTML = '<p class="loading-msg" aria-live="polite">' + tr('js.hadith.explaining','Generating explanation…') + '</p>';

    const cacheKey = `${AI_CACHE_PREFIX}${collection}-${book}-${number}`;
    const cached   = sessionStorage.getItem(cacheKey);
    if (cached) {
      content.innerHTML = _sanitize(cached);
      return;
    }

    const result = await api.postAskClaude(
      decodeURIComponent(text),
      'Explain this hadith with scholarly context.',
      `${decodeURIComponent(collection)} ${book}:${number}`
    );

    if (!result) {
      content.innerHTML =
        '<p class="info-msg">' + tr('js.hadith.aiSoon','AI explanations are coming soon. Refer to a trusted hadith commentary in the meantime.') + '</p>';
      return;
    }

    content.innerHTML = _sanitize(result.answer || '');
    try { sessionStorage.setItem(cacheKey, result.answer || ''); } catch (_) {}
  }


  /* ─── Copy & Bookmark helpers ────────────────────────────────── */

  function _copyText(encoded) {
    const text = decodeURIComponent(encoded);
    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) window.showToast(tr('js.hadith.copied','Hadith copied!'));
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      if (window.showToast) window.showToast(tr('js.hadith.copied','Hadith copied!'));
    });
  }

  function _toggleBookmark(id, btn) {
    let bm = {};
    try { bm = JSON.parse(localStorage.getItem('ii-bookmarks') || '{}'); } catch (_) {}
    if (bm[id]) {
      delete bm[id];
      if (btn) btn.textContent = '☆';
      if (window.showToast) window.showToast(tr('js.hadith.bookmarkRemoved','Bookmark removed.'));
    } else {
      bm[id] = { ts: Date.now() };
      if (btn) btn.textContent = '★';
      if (window.showToast) window.showToast(tr('js.hadith.bookmarked','Bookmarked!'));
    }
    localStorage.setItem('ii-bookmarks', JSON.stringify(bm));
  }


  /* ─── Event delegation ───────────────────────────────────────── */

  function _bindCardActions(root) {
    root.addEventListener('click', e => {
      const copyBtn  = e.target.closest('.btn-copy');
      const bmBtn    = e.target.closest('.btn-bookmark');
      const aiBtn    = e.target.closest('.btn-ai-explain');

      if (copyBtn)  { _copyText(copyBtn.dataset.text); return; }
      if (bmBtn)    { _toggleBookmark(bmBtn.dataset.id, bmBtn); return; }
      if (aiBtn)    {
        const { collection, book, number, text } = aiBtn.dataset;
        openAIExplain(collection, book, number, text);
      }
    });
  }


  /* ─── AI modal close ─────────────────────────────────────────── */

  function initAIModal() {
    const close = document.getElementById('aiClose');
    const modal = document.getElementById('aiModal');
    if (!close || !modal) return;
    close.addEventListener('click',  () => { modal.hidden = true; });
    modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
    });
  }


  /* ─── Collection / book selectors ───────────────────────────── */

  function initSelectors() {
    const colSel  = document.getElementById('collectionSelect');
    const bookSel = document.getElementById('bookSelect');

    function doLoad() {
      const col  = colSel  ? colSel.value  : '';
      const book = bookSel ? bookSel.value : '';
      loadFeed(col, book);
    }

    if (colSel)  colSel.addEventListener('change', doLoad);
    if (bookSel) bookSel.addEventListener('change', doLoad);

    doLoad();
  }


  /* ─── Sanitise AI output ──────────────────────────────────────── */

  function _sanitize(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return `<p>${div.innerHTML.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    loadHadithOfDay();
    initSelectors();
    initAIModal();
    document.addEventListener('ii:langchange', () => {
      loadHadithOfDay();
      const colSel  = document.getElementById('collectionSelect');
      const bookSel = document.getElementById('bookSelect');
      loadFeed(colSel ? colSel.value : '', bookSel ? bookSel.value : '');
    });
  });

}());
