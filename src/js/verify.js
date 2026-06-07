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
      btn.textContent  = loading ? 'Verifying…' : 'Verify Claim';
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
        <span class="verify-verdict ${verdictCls}">${item.verdict || 'Unverified'}</span>
        <h3 class="verify-result-title">${_escapeHtml(item.title || 'Result')}</h3>
      </header>

      <p class="verify-result-explanation">${_escapeHtml(item.explanation || '')}</p>

      ${item.source ? `
        <footer class="verify-result-source">
          Source:
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
      container.innerHTML = `
        <div class="verify-empty" role="status">
          <p>No results found for this claim.</p>
          <p class="verify-empty-hint">Try rephrasing, or check our
          <a href="hadith.html">Hadith Library</a> and
          <a href="quran.html">Quran Explorer</a>.</p>
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
      if (window.showToast) window.showToast('Please enter a claim to verify.');
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
      _text('verifyError', 'Verification service is currently unavailable. Please try again later.');
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


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', initForm);

  /* Expose for future production wiring (e.g. real-time streaming swap) */
  window.II = window.II || {};
  window.II.verify = { populateResults, runVerify };

}());
