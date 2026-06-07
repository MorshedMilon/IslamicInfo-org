/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — knowledge-hub.js  (v1.0 · 2026-06)
   API integration for knowledge-hub.html (Knowledge Hub).

   Requires: api.js loaded first (window.II.api)

   Features:
     1. Email capture → POST /api/subscribe
        - Validates email format before sending
        - Shows inline success state (never redirects)
        - Shows inline error state on failure
     2. Search → routes to /search.html?q= (client-side; no API in v1)
     3. Article links → static HTML; no API calls

   Hard rule: no Islamic content is generated here by AI.
   All article content is static and human-reviewed.

   HTML IDs expected on knowledge-hub.html:
     #subscribeForm
     #subscribeEmail     ← email <input>
     #subscribeBtn       ← submit button
     #subscribeSuccess   ← success message element (hidden by default)
     #subscribeError     ← error message element  (hidden by default)

     #khSearchInput      ← search input (optional)
     #khSearchBtn        ← search button (optional)
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const api = window.II && window.II.api;
  if (!api) { console.error('[knowledge-hub.js] api.js not loaded'); return; }

  /* ─── Helpers ─────────────────────────────────────────────────── */

  function _show(id)  { const el = document.getElementById(id); if (el) el.hidden = false; }
  function _hide(id)  { const el = document.getElementById(id); if (el) el.hidden = true;  }
  function _text(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }

  function _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  /* ─── 1. Email subscribe ─────────────────────────────────────── */

  async function handleSubscribe(e) {
    if (e) e.preventDefault();

    const input = document.getElementById('subscribeEmail');
    const btn   = document.getElementById('subscribeBtn');
    const email = input ? input.value.trim() : '';

    _hide('subscribeSuccess');
    _hide('subscribeError');

    if (!email || !_isValidEmail(email)) {
      _show('subscribeError');
      _text('subscribeError', 'Please enter a valid email address.');
      if (input) input.focus();
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }

    const result = await api.postSubscribe(email, 'knowledge-hub');

    if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }

    if (result && result.ok) {
      _show('subscribeSuccess');
      _text('subscribeSuccess', 'You\'re subscribed! Jazakallah Khayran.');
      if (input) input.value = '';
    } else {
      _show('subscribeError');
      _text('subscribeError', 'Subscription failed. Please try again later.');
    }
  }


  /* ─── 2. In-page search → search.html ────────────────────────── */

  function initSearch() {
    const searchInput = document.getElementById('khSearchInput');
    const searchBtn   = document.getElementById('khSearchBtn');

    function doSearch() {
      const q = searchInput ? searchInput.value.trim() : '';
      if (q) window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
    }

    if (searchBtn)  searchBtn.addEventListener('click', doSearch);
    if (searchInput) {
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') doSearch();
      });
    }
  }


  /* ─── Wire subscribe form ─────────────────────────────────────── */

  function initSubscribeForm() {
    const form = document.getElementById('subscribeForm');
    const btn  = document.getElementById('subscribeBtn');

    /* Support both <form> submit and standalone button */
    if (form) {
      form.addEventListener('submit', handleSubscribe);
    } else if (btn) {
      btn.addEventListener('click', handleSubscribe);
    }
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    initSubscribeForm();
    initSearch();
  });

}());
