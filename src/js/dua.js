/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — dua.js  (v1.0 · 2026-06)
   API integration for dua.html (Daily Duas).

   Requires: api.js loaded first (window.II.api)

   Features:
     1. AI Explain per dua card → POST /api/ask-claude (Stage 3 stub)
     2. Audio playback          → CDN direct (no proxy) keyed by dua ID
     3. Copy dua text           → Clipboard API
     4. Bookmark dua            → localStorage 'ii-bookmarks'
     5. Category filter         → client-side, no API

   Dua data is STATIC (HTML rendered at build time or from inline
   <template> tags).  This file only handles user interactions.

   Expected HTML structure per dua card:
     <article class="dua-card"
              data-id="dua-morning-001"
              data-audio="/audio/duas/morning-001.mp3"
              data-arabic="..."
              data-transliteration="..."
              data-translation="..."
              data-source="Sahih al-Bukhari 6311">

   Hard-coded disclaimer: never replaced by model output.
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
  if (!api) { console.error('[dua.js] api.js not loaded'); return; }

  /* Hard-coded disclaimer */
  const AI_DISCLAIMER =
    'AI-generated explanation for educational context only. ' +
    'Not a fatwa or religious ruling. Consult a qualified scholar.';

  const AI_CACHE_PREFIX = 'ii-dua-ai-';

  let currentAudio   = null;
  let currentAudioId = null;


  /* ─── Audio playback ──────────────────────────────────────────── */

  function playDua(duaId, audioSrc, btnEl) {
    if (!audioSrc) {
      if (window.showToast) window.showToast(tr('js.dua.noAudio','Audio not available for this dua.'));
      return;
    }

    if (currentAudioId === duaId && currentAudio) {
      currentAudio.pause();
      currentAudio    = null;
      currentAudioId  = null;
      if (btnEl) btnEl.textContent = '▶';
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      document.querySelectorAll('.btn-dua-audio').forEach(b => b.textContent = '▶');
    }

    currentAudio   = new Audio(audioSrc);
    currentAudioId = duaId;
    if (btnEl) btnEl.textContent = '⏸';

    currentAudio.play().catch(() => {
      if (window.showToast) window.showToast(tr('js.dua.audioError','Could not play audio.'));
      if (btnEl) btnEl.textContent = '▶';
      currentAudioId = null;
    });

    currentAudio.addEventListener('ended', () => {
      if (btnEl) btnEl.textContent = '▶';
      currentAudioId = null;
    });
  }


  /* ─── Copy dua ────────────────────────────────────────────────── */

  function copyDua(card) {
    const arabic          = card.dataset.arabic || '';
    const transliteration = card.dataset.transliteration || '';
    const translation     = card.dataset.translation || '';
    const source          = card.dataset.source || '';

    const text = [
      arabic,
      transliteration,
      translation,
      source ? `(Source: ${source})` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) window.showToast(tr('js.dua.copied','Dua copied!'));
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      if (window.showToast) window.showToast(tr('js.dua.copied','Dua copied!'));
    });
  }


  /* ─── Bookmark dua ────────────────────────────────────────────── */

  function toggleBookmark(duaId, btnEl) {
    let bm = {};
    try { bm = JSON.parse(localStorage.getItem('ii-bookmarks') || '{}'); } catch (_) {}

    if (bm[duaId]) {
      delete bm[duaId];
      if (btnEl) btnEl.textContent = '☆';
      if (window.showToast) window.showToast(tr('js.dua.bookmarkRemoved','Bookmark removed.'));
    } else {
      bm[duaId] = { ts: Date.now() };
      if (btnEl) btnEl.textContent = '★';
      if (window.showToast) window.showToast(tr('js.dua.bookmarked','Bookmarked!'));
    }
    localStorage.setItem('ii-bookmarks', JSON.stringify(bm));
  }


  /* ─── Restore bookmark state on load ─────────────────────────── */

  function restoreBookmarks() {
    let bm = {};
    try { bm = JSON.parse(localStorage.getItem('ii-bookmarks') || '{}'); } catch (_) {}

    document.querySelectorAll('.btn-bookmark[data-id]').forEach(btn => {
      if (bm[btn.dataset.id]) btn.textContent = '★';
    });
  }


  /* ─── AI Explain ──────────────────────────────────────────────── */

  async function openAIExplain(card) {
    const modal      = document.getElementById('duaAIModal');
    const content    = document.getElementById('duaAIContent');
    const disclaimer = document.getElementById('duaAIDisclaimer');

    if (!modal || !content) return;

    if (disclaimer) disclaimer.textContent = tr('js.dua.disclaimer', AI_DISCLAIMER);

    modal.hidden = false;
    modal.setAttribute('aria-modal', 'true');
    content.innerHTML = '<p class="loading-msg" aria-live="polite">' + tr('js.dua.loading','Generating explanation…') + '</p>';

    const duaId = card.dataset.id;
    const cacheKey = `${AI_CACHE_PREFIX}${duaId}`;
    const cached   = sessionStorage.getItem(cacheKey);
    if (cached) { content.innerHTML = _sanitize(cached); return; }

    const context = [
      card.dataset.arabic,
      card.dataset.transliteration,
      card.dataset.translation,
      card.dataset.source ? `Source: ${card.dataset.source}` : '',
    ].filter(Boolean).join('\n');

    const result = await api.postAskClaude(
      context,
      'Explain this dua: its meaning, occasion, and significance.',
      card.dataset.source || duaId
    );

    if (!result) {
      content.innerHTML = '<p class="info-msg">' + tr('js.dua.aiSoon','AI explanations are coming soon. Please refer to the source text for this dua.') + '</p>';
      return;
    }

    content.innerHTML = _sanitize(result.answer || '');
    try { sessionStorage.setItem(cacheKey, result.answer || ''); } catch (_) {}
  }


  /* ─── Category filter ─────────────────────────────────────────── */

  function initCategoryFilter() {
    const tabs = document.querySelectorAll('[data-category-filter]');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.categoryFilter;
        document.querySelectorAll('.dua-card[data-category]').forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.hidden = !match;
        });
      });
    });
  }


  /* ─── AI modal close ─────────────────────────────────────────── */

  function initAIModal() {
    const close = document.getElementById('duaAIClose');
    const modal = document.getElementById('duaAIModal');
    if (!close || !modal) return;
    close.addEventListener('click', () => { modal.hidden = true; });
    modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
    });
  }


  /* ─── Event delegation on dua grid ─────────────────────────────── */

  function initCardEvents() {
    const grid = document.getElementById('duaGrid') || document.body;

    grid.addEventListener('click', e => {
      const card      = e.target.closest('.dua-card');
      const audioBtn  = e.target.closest('.btn-dua-audio');
      const copyBtn   = e.target.closest('.btn-dua-copy');
      const bmBtn     = e.target.closest('.btn-bookmark');
      const aiBtn     = e.target.closest('.btn-ai-explain');

      if (audioBtn && card) {
        playDua(card.dataset.id, card.dataset.audio, audioBtn);
        return;
      }
      if (copyBtn && card)  { copyDua(card);                                    return; }
      if (bmBtn   && card)  { toggleBookmark(card.dataset.id, bmBtn);           return; }
      if (aiBtn   && card)  { openAIExplain(card); }
    });
  }


  /* ─── Sanitise AI output ─────────────────────────────────────── */

  function _sanitize(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return `<p>${div.innerHTML.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    initCardEvents();
    initCategoryFilter();
    initAIModal();
    restoreBookmarks();
  });

}());
