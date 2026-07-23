/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — verify.js  (v1.0 · 2026-06)
   API integration for verify.html (Verify a Claim).

   Requires: api.js loaded first (window.II.api)

   Behaviour:
     - User types a claim → clicks "Verify Claim" button
     - POST /api/verify  body: { query, mode? }
     - v1: 2200 ms simulation; populateResults() is the swap point
     - Results rendered in #resultsContainer
     - Empty result array → empty state message
     - API failure → error banner
     - Disclaimer text is HARD-CODED in HTML — never from API output

   HTML IDs expected on verify.html:
     #verifyInput           ← claim text input
     #verifyMode            ← optional mode <select>
     #verifyBtn             ← submit button
     #resultsContainer      ← results injection target
     #verifyDisclaimer      ← hard-coded disclaimer (never touched by JS)
     #verifyLoading         ← loading state element
     #verifyError           ← error state element
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* i18n helper (i18n.js loads first; safe fallback if it didn't) */
  function tr(key, fallback, params) {
    if (window.II && window.II.t) return window.II.t(key, fallback, params);
    let s = fallback !== undefined ? fallback : key;
    if (params) Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }

  const api = window.II && window.II.api;
  if (!api) { console.error('[verify.js] api.js not loaded'); return; }


  /* ─── State ──────────────────────────────────────────────────── */

  let isVerifying = false;


  /* ─── UI helpers ─────────────────────────────────────────────── */

  function _show(id)  { const el = document.getElementById(id); if (el) el.hidden = false; }
  function _hide(id)  { const el = document.getElementById(id); if (el) el.hidden = true;  }
  function _text(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }

  function _setLoadingState(loading) {
    const btn = document.getElementById('verifyBtn');
    if (btn) {
      btn.disabled     = loading;
      btn.textContent  = loading ? tr('js.verify.verifying','Verifying…') : tr('js.verify.btnText','Verify Claim');
      btn.setAttribute('aria-busy', String(loading));
    }
    loading ? _show('verifyLoading') : _hide('verifyLoading');
  }


  /* ─── Result card HTML ────────────────────────────────────────── */

  function _resultCard(item) {
    /* item shape: { title, verdict, explanation, source, sourceUrl, grade? } */
    const verdictCls = {
      'authentic':    'verdict-authentic',
      'inauthentic':  'verdict-inauthentic',
      'weak':         'verdict-weak',
      'unverified':   'verdict-unverified',
      'context':      'verdict-context',
    }[String(item.verdict || '').toLowerCase()] || 'verdict-unverified';

    return `
    <article class="verify-result-card reveal" role="article">
      <header class="verify-result-header">
        <span class="verify-verdict ${verdictCls}">${item.verdict || tr('js.verify.unverified','Unverified')}</span>
        <h3 class="verify-result-title">${_escapeHtml(item.title || tr('js.verify.resultTitle','Result'))}</h3>
      </header>

      <p class="verify-result-explanation">${_escapeHtml(item.explanation || '')}</p>

      ${item.source ? `
        <footer class="verify-result-source">
          ${tr('js.verify.source','Source:')}
          ${item.sourceUrl
            ? `<a href="${item.sourceUrl}" target="_blank" rel="noopener">${_escapeHtml(item.source)}</a>`
            : _escapeHtml(item.source)}
          ${item.grade ? ` · <span class="hadith-grade">${_escapeHtml(item.grade)}</span>` : ''}
        </footer>` : ''}
    </article>`.trim();
  }


  /* ─── populateResults(data) — PRODUCTION SWAP POINT ─────────── */
  /*
   * In v1: called with the simulated response object.
   * In production: called identically with the real API response.
   * Shape: { query, results: Array, disclaimer }
   * NOTE: data.disclaimer is IGNORED — the HTML hard-coded value is used.
   */

  function populateResults(data) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;

    const results = data && Array.isArray(data.results) ? data.results : [];

    if (results.length === 0) {
      const hadithLink = tr('chrome.nav.hadith','Hadith Library');
      const quranLink  = tr('chrome.nav.quran','Quran Explorer');
      container.innerHTML = `
        <div class="verify-empty" role="status">
          <p>${tr('js.verify.noResults','No results found for this claim.')}</p>
          <p class="verify-empty-hint">${tr('js.verify.tryRephrase','Try rephrasing, or check our')}
          <a href="hadith.html">${hadithLink}</a> ${tr('js.verify.and','and')}
          <a href="quran.html">${quranLink}</a>.</p>
        </div>`;
      return;
    }

    container.innerHTML = results.map(_resultCard).join('\n');
    if (window.initReveal) window.initReveal();
  }


  /* ─── Main verify flow ───────────────────────────────────────── */

  async function runVerify() {
    if (isVerifying) return;

    const input  = document.getElementById('verifyInput');
    const modeSel = document.getElementById('verifyMode');
    const query  = input ? input.value.trim() : '';

    if (!query) {
      if (window.showToast) window.showToast(tr('js.verify.noQuery','Please enter a claim to verify.'));
      if (input) input.focus();
      return;
    }

    isVerifying = true;
    _setLoadingState(true);
    _hide('verifyError');

    const container = document.getElementById('resultsContainer');
    if (container) container.innerHTML = '';

    const mode = modeSel ? modeSel.value : undefined;
    const data = await api.postVerify(query, mode);

    _setLoadingState(false);
    isVerifying = false;

    if (!data) {
      _show('verifyError');
      _text('verifyError', tr('js.verify.serviceError','Verification service is currently unavailable. Please try again later.'));
      return;
    }

    populateResults(data);
  }


  /* ─── Wire form ──────────────────────────────────────────────── */

  function initForm() {
    const btn   = document.getElementById('verifyBtn');
    const input = document.getElementById('verifyInput');

    if (btn)   btn.addEventListener('click', runVerify);

    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runVerify(); }
      });

      /* Clear error on new input */
      input.addEventListener('input', () => _hide('verifyError'));
    }

    document.addEventListener('ii:langchange', () => {
      const btn = document.getElementById('verifyBtn');
      if (btn && !isVerifying) btn.textContent = tr('js.verify.btnText','Verify Claim');
    });
  }


  /* ─── HTML escape utility ──────────────────────────────────────── */

  function _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  /* ─── Prefill from query string (homepage Verify tab handoff) ──── */
  /* Reads ?claim= (preferred) or ?q= (fallback) and prefills the claim
   * input. Does NOT auto-submit — the user must click Verify. */

  function prefillFromQuery() {
    var claim = null;
    try {
      var p = new URLSearchParams(location.search);
      claim = p.get('claim') || p.get('q');
    } catch (_) { claim = null; }
    if (!claim) return;
    var input = document.getElementById('verifyInput');
    if (input) { input.value = claim; input.focus(); }
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    initForm();
    prefillFromQuery();
  });

  /* Expose for future production wiring (e.g. real-time streaming swap) */
  window.II = window.II || {};
  window.II.verify = { populateResults, runVerify };

}());
