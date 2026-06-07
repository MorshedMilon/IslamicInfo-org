/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — quran.js  (v1.0 · 2026-06)
   API integration for quran.html (Quran Explorer).

   Requires: api.js loaded first (window.II.api)

   Features:
     1. Load surah verse list  → GET /api/quran/[surah]
     2. Reciter audio playback → EveryAyah CDN (no proxy needed)
     3. AI verse explanation   → POST /api/ask-claude  (Stage 3; stub in v1)
     4. Translation selection  → localStorage key 'ii-quran-translation'
     5. Surah navigation       → updates URL hash #surah-N

   EveryAyah CDN pattern:
     https://everyayah.com/data/{reciterPath}/{SSSS}{AAA}.mp3
     Default reciter: Alafasy_128kbps

   HTML element IDs / classes expected on quran.html:
     #surahSelect, #surahContainer, #verseList
     .verse-card[data-surah][data-ayah]
     .verse-arabic, .verse-translation, .verse-ref
     .btn-audio, .btn-ai-explain
     #aiExplainModal, #aiExplainContent, #aiExplainClose
     #aiExplainDisclaimer  ← hard-coded text, never replaced by API
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const api = window.II && window.II.api;
  if (!api) { console.error('[quran.js] api.js not loaded'); return; }

  /* ─── Constants ──────────────────────────────────────────────── */

  const RECITER_PATHS = {
    'Alafasy':   'Alafasy_128kbps',
    'AbdurRahman': 'abdurrahmaan_as_sudais_64kbps',
    'Minshawi':  'Minshawy_Murattal_128kbps',
  };

  const DEFAULT_RECITER    = 'Alafasy';
  const EVERYAYAH_BASE     = 'https://everyayah.com/data';
  const AI_CACHE_KEY_PREFIX = 'ii-quran-ai-';

  /* Hard-coded disclaimer — NEVER replaced by API output */
  const AI_DISCLAIMER =
    'AI-generated explanation. Not a fatwa or religious ruling. ' +
    'Consult a qualified scholar for guidance.';

  /* ─── State ──────────────────────────────────────────────────── */

  let currentSurah   = 1;
  let currentReciter = localStorage.getItem('ii-quran-reciter') || DEFAULT_RECITER;
  let audioPlayer    = null;
  let playingAyah    = null;

  /* ─── 1. Audio URL builder ───────────────────────────────────── */

  function buildAudioUrl(surah, ayah) {
    const path   = RECITER_PATHS[currentReciter] || RECITER_PATHS[DEFAULT_RECITER];
    const s      = String(surah).padStart(3, '0');
    const a      = String(ayah).padStart(3, '0');
    return `${EVERYAYAH_BASE}/${path}/${s}${a}.mp3`;
  }


  /* ─── 2. Render verse list ───────────────────────────────────── */

  function renderVerses(surahData) {
    const container = document.getElementById('verseList');
    if (!container) return;

    const savedTranslation = localStorage.getItem('ii-quran-translation') || 'Saheeh International';

    container.innerHTML = surahData.verses.map(v => {
      /* Pick the stored translation edition from the array */
      const transObj = Array.isArray(v.translations)
        ? (v.translations.find(t => t.translator === savedTranslation) || v.translations[0])
        : { text: v.translation || '', translator: savedTranslation };

      return `
      <article class="verse-card reveal"
               data-surah="${surahData.surahNumber}"
               data-ayah="${v.ayah}"
               role="article"
               aria-label="Verse ${v.ayah}">

        <div class="verse-number" aria-hidden="true">${v.ayah}</div>

        <p class="verse-arabic" dir="rtl" lang="ar">${v.arabic}</p>

        <p class="verse-translation">${transObj.text}</p>

        <footer class="verse-footer">
          <span class="verse-ref">
            ${surahData.surahNumber}:${v.ayah}
            ${transObj.translator ? '— ' + transObj.translator : ''}
          </span>

          <div class="verse-actions" role="toolbar" aria-label="Verse actions">

            <button class="btn-icon btn-audio"
                    data-surah="${surahData.surahNumber}"
                    data-ayah="${v.ayah}"
                    title="Play recitation"
                    aria-label="Play recitation for verse ${v.ayah}">
              ▶
            </button>

            <button class="btn-icon btn-copy"
                    data-text="${encodeURIComponent(v.arabic + '\n' + transObj.text + '\n(Quran ' + surahData.surahNumber + ':' + v.ayah + ')')}"
                    title="Copy verse"
                    aria-label="Copy verse ${v.ayah}">
              ⎘
            </button>

            <button class="btn-icon btn-bookmark"
                    data-id="quran-${surahData.surahNumber}-${v.ayah}"
                    title="Bookmark"
                    aria-label="Bookmark verse ${v.ayah}">
              ☆
            </button>

            <button class="btn-icon btn-ai-explain"
                    data-surah="${surahData.surahNumber}"
                    data-ayah="${v.ayah}"
                    data-arabic="${encodeURIComponent(v.arabic)}"
                    data-translation="${encodeURIComponent(transObj.text)}"
                    title="AI Explanation (Stage 3)"
                    aria-label="AI explanation for verse ${v.ayah}">
              ✦
            </button>

          </div>
        </footer>
      </article>`.trim();
    }).join('\n');

    /* Re-attach event delegation */
    _bindVerseActions(container);

    /* Kick IntersectionObserver for .reveal if global.js is loaded */
    if (window.initReveal) window.initReveal();
  }


  /* ─── 3. Load surah ──────────────────────────────────────────── */

  async function loadSurah(surahNumber) {
    currentSurah = surahNumber;
    localStorage.setItem('ii-quran-last-surah', surahNumber);

    const container = document.getElementById('verseList');
    if (container) container.innerHTML = '<p class="loading-msg" aria-live="polite">Loading verses…</p>';

    const data = await api.fetchQuranSurah(surahNumber);

    if (!data) {
      if (container) {
        container.innerHTML =
          '<p class="error-msg" role="alert">Could not load surah. Please check your connection and try again.</p>';
      }
      return;
    }

    /* Update surah heading */
    const heading = document.getElementById('surahHeading');
    if (heading) heading.textContent = data.surahName || `Surah ${surahNumber}`;

    renderVerses(data);

    /* Update URL hash without pushing a new history entry */
    history.replaceState(null, '', `#surah-${surahNumber}`);
  }


  /* ─── 4. Audio playback ──────────────────────────────────────── */

  function playAyah(surah, ayah, btnEl) {
    const url = buildAudioUrl(surah, ayah);

    /* Stop current track if same ayah clicked again */
    if (playingAyah === `${surah}-${ayah}` && audioPlayer) {
      audioPlayer.pause();
      audioPlayer = null;
      playingAyah = null;
      if (btnEl) btnEl.textContent = '▶';
      return;
    }

    /* Stop any other playing track */
    if (audioPlayer) {
      audioPlayer.pause();
      document.querySelectorAll('.btn-audio').forEach(b => b.textContent = '▶');
    }

    audioPlayer           = new Audio(url);
    playingAyah           = `${surah}-${ayah}`;
    if (btnEl) btnEl.textContent = '⏸';

    audioPlayer.play().catch(() => {
      if (window.showToast) window.showToast('Audio unavailable for this verse.');
      if (btnEl) btnEl.textContent = '▶';
      playingAyah = null;
    });

    audioPlayer.addEventListener('ended', () => {
      if (btnEl) btnEl.textContent = '▶';
      playingAyah = null;
    });
  }


  /* ─── 5. AI Explain panel ─────────────────────────────────────── */

  async function openAIExplain(surah, ayah, arabic, translation) {
    const modal      = document.getElementById('aiExplainModal');
    const content    = document.getElementById('aiExplainContent');
    const disclaimer = document.getElementById('aiExplainDisclaimer');

    if (!modal || !content) return;

    /* Always show hard-coded disclaimer */
    if (disclaimer) disclaimer.textContent = AI_DISCLAIMER;

    modal.hidden  = false;
    modal.setAttribute('aria-modal', 'true');
    content.innerHTML = '<p class="loading-msg" aria-live="polite">Generating explanation…</p>';

    /* Check session cache first */
    const cacheKey = `${AI_CACHE_KEY_PREFIX}${surah}-${ayah}`;
    const cached   = sessionStorage.getItem(cacheKey);
    if (cached) {
      content.innerHTML = _sanitize(cached);
      return;
    }

    /* Stage 3 gate: return graceful stub if endpoint not available */
    const ref    = `Quran ${surah}:${ayah}`;
    const result = await api.postAskClaude(
      `${decodeURIComponent(arabic)}\n\n${decodeURIComponent(translation)}`,
      'Explain this verse with tafsir context.',
      ref
    );

    if (!result) {
      content.innerHTML =
        '<p class="info-msg">AI explanations are coming soon. ' +
        'In the meantime, please refer to a trusted tafsir.</p>';
      return;
    }

    const html = _sanitize(result.answer || '');
    content.innerHTML = html;

    /* Cache for the session */
    try { sessionStorage.setItem(cacheKey, result.answer || ''); } catch (_) {}
  }


  /* ─── 6. Copy ────────────────────────────────────────────────── */

  function copyVerse(encodedText) {
    const text = decodeURIComponent(encodedText);
    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) window.showToast('Verse copied!');
    }).catch(() => {
      /* Fallback for older browsers */
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (window.showToast) window.showToast('Verse copied!');
    });
  }


  /* ─── 7. Bookmark ────────────────────────────────────────────── */

  function toggleBookmark(id, btnEl) {
    const key       = 'ii-bookmarks';
    let bookmarks   = {};
    try { bookmarks = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) {}

    if (bookmarks[id]) {
      delete bookmarks[id];
      if (btnEl) btnEl.textContent = '☆';
      if (window.showToast) window.showToast('Bookmark removed.');
    } else {
      bookmarks[id] = { ts: Date.now() };
      if (btnEl) btnEl.textContent = '★';
      if (window.showToast) window.showToast('Bookmarked!');
    }
    localStorage.setItem(key, JSON.stringify(bookmarks));
  }


  /* ─── Event delegation on verse list ────────────────────────── */

  function _bindVerseActions(container) {
    container.addEventListener('click', e => {
      const audioBtn    = e.target.closest('.btn-audio');
      const copyBtn     = e.target.closest('.btn-copy');
      const bookmarkBtn = e.target.closest('.btn-bookmark');
      const aiBtn       = e.target.closest('.btn-ai-explain');

      if (audioBtn) {
        const { surah, ayah } = audioBtn.dataset;
        playAyah(Number(surah), Number(ayah), audioBtn);
        return;
      }
      if (copyBtn) {
        copyVerse(copyBtn.dataset.text);
        return;
      }
      if (bookmarkBtn) {
        toggleBookmark(bookmarkBtn.dataset.id, bookmarkBtn);
        return;
      }
      if (aiBtn) {
        const { surah, ayah, arabic, translation } = aiBtn.dataset;
        openAIExplain(Number(surah), Number(ayah), arabic, translation);
      }
    });
  }


  /* ─── Close AI modal ──────────────────────────────────────────── */

  function initAIModal() {
    const closeBtn = document.getElementById('aiExplainClose');
    const modal    = document.getElementById('aiExplainModal');
    if (!closeBtn || !modal) return;

    closeBtn.addEventListener('click', () => { modal.hidden = true; });
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.hidden = true;
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
    });
  }


  /* ─── Surah selector ─────────────────────────────────────────── */

  function initSurahSelector() {
    const sel = document.getElementById('surahSelect');
    if (!sel) return;
    sel.addEventListener('change', () => {
      const n = Number(sel.value);
      if (n >= 1 && n <= 114) loadSurah(n);
    });
  }


  /* ─── Reciter selector ───────────────────────────────────────── */

  function initReciterSelector() {
    const sel = document.getElementById('reciterSelect');
    if (!sel) return;
    sel.value = currentReciter;
    sel.addEventListener('change', () => {
      currentReciter = sel.value;
      localStorage.setItem('ii-quran-reciter', currentReciter);
    });
  }


  /* ─── Simple HTML sanitiser (strips tags, keeps text safe) ───── */

  function _sanitize(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return `<p>${div.innerHTML.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  }


  /* ─── Restore saved translation preference ─────────────────────── */

  function initTranslationSelector() {
    const sel = document.getElementById('translationSelect');
    if (!sel) return;
    const saved = localStorage.getItem('ii-quran-translation');
    if (saved) sel.value = saved;

    sel.addEventListener('change', () => {
      localStorage.setItem('ii-quran-translation', sel.value);
      /* Reload current surah to re-render with new translation */
      loadSurah(currentSurah);
    });
  }


  /* ─── Boot ────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    initSurahSelector();
    initReciterSelector();
    initTranslationSelector();
    initAIModal();

    /* Restore last surah or default to Al-Fatiha (1) */
    const hashMatch = location.hash.match(/surah-(\d+)/);
    const lastSurah = hashMatch
      ? Number(hashMatch[1])
      : Number(localStorage.getItem('ii-quran-last-surah') || 1);

    loadSurah(Math.min(Math.max(lastSurah, 1), 114));
  });

}());
