/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-ai.js  (Module 13)
   DOM controller for the ✦ AI Explanation button on hadith cards.
   Gated by II.hadithAICore.HADITH_AI_EXPLAIN_ENABLED (default OFF).
   Mirrors src/js/quran-ai.js: builds a .ai-card, binds ✕ once, fetches
   via II.api.postExplain (10s timeout), renders four sections + the
   mandated "✦ Powered by QuranlyAI · Not a religious ruling" footer.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var II = window.II || {};
  var core = II.hadithAICore;
  var api = II.api;
  if (!core || !core.HADITH_AI_EXPLAIN_ENABLED) return; // dark until sign-off

  var inflight = {};

  // Read the hadith fields off a .hadith-card element. Selectors match the real feed
  // markup (src/js/hadith-feed-core.js buildCardHTML): .hadith-card carries data-ref,
  // .hadith-arabic holds the matn, .hadith-text holds the (first/active) translation —
  // same selectors already used by hadith.js's readCardContent() for copy-with-citation.
  function readCard(card) {
    if (!card) return { ref: '', arabic: '', translation: '', language: 'en' };
    var q = function (sel) { var el = card.querySelector(sel); return el ? (el.textContent || '').trim() : ''; };
    return {
      ref: card.getAttribute('data-ref') || '',
      arabic: q('.hadith-arabic'),
      translation: q('.hadith-text'),
      language: document.documentElement.getAttribute('lang') || 'en',
    };
  }

  function setFoot(foot, ref) {
    foot.textContent = '';
    foot.appendChild(document.createTextNode('✦ Powered by '));
    var a = document.createElement('a');
    a.href = 'https://quranlyai.com'; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'QuranlyAI ↗';
    foot.appendChild(a);
    foot.appendChild(document.createTextNode(' · Not a religious ruling' + (ref ? ' · ' + ref : '')));
  }

  // Build the .ai-card once; bind ✕ so it works during load AND during any error state.
  function ensureCard(card) {
    var existing = card.querySelector('.ai-card');
    if (existing) return existing;
    var el = document.createElement('div');
    el.className = 'ai-card';
    var head = document.createElement('div'); head.className = 'ai-head';
    var title = document.createElement('div'); title.className = 'ai-title'; title.textContent = 'AI Explanation';
    var close = document.createElement('button'); close.className = 'ai-close'; close.type = 'button'; close.textContent = '✕';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', function (e) { e.stopPropagation(); el.classList.remove('show'); });
    head.appendChild(title); head.appendChild(close);
    var body = document.createElement('div'); body.className = 'ai-body';
    var foot = document.createElement('div'); foot.className = 'ai-foot';
    el.appendChild(head); el.appendChild(body); el.appendChild(foot);
    card.appendChild(el);
    return el;
  }

  function renderLoading(el) {
    var body = el.querySelector('.ai-body');
    body.innerHTML = '<div class="ai-skeleton"></div><div class="ai-skeleton"></div><div class="ai-skeleton short"></div>';
    el.querySelector('.ai-foot').textContent = '';
  }

  function renderError(el, cardData, msg) {
    var body = el.querySelector('.ai-body');
    body.textContent = '';
    var p = document.createElement('p'); p.textContent = msg || 'Explanation unavailable — please try again';
    var retry = document.createElement('button'); retry.type = 'button'; retry.className = 'ai-retry'; retry.textContent = 'Retry';
    retry.addEventListener('click', function () { fetchAndRender(el, cardData); });
    body.appendChild(p); body.appendChild(retry);
    setFoot(el.querySelector('.ai-foot'), cardData.ref);
  }

  function section(label, value) {
    var wrap = document.createElement('div'); wrap.className = 'ai-section';
    var h = document.createElement('div'); h.className = 'ai-section-label'; h.textContent = label;
    var p = document.createElement('p'); p.textContent = value || '';
    wrap.appendChild(h); wrap.appendChild(p);
    return wrap;
  }

  function renderAnswer(el, data, cardData) {
    var body = el.querySelector('.ai-body');
    body.textContent = '';
    body.appendChild(section('Summary', data.summary));
    if (data.vocabulary) body.appendChild(section('Vocabulary', data.vocabulary));
    if (data.context) body.appendChild(section('Context', data.context));
    if (data.lesson) body.appendChild(section('Practical lesson', data.lesson));
    body.dataset.rendered = '1';
    setFoot(el.querySelector('.ai-foot'), cardData.ref);
  }

  function fetchAndRender(el, cardData) {
    var fk = cardData.ref || 'anon';
    if (inflight[fk]) return;
    inflight[fk] = true;
    renderLoading(el);
    var p = (api && api.postExplain) ? api.postExplain(core.buildExplainPayload(cardData)) : Promise.resolve({ _error: 'network' });
    Promise.resolve(p).then(function (res) {
      inflight[fk] = false;
      if (res && res.safe === true) {
        renderAnswer(el, res, cardData);
      } else if (res && res._status === 429) {
        renderError(el, cardData, 'Too many requests — please try again later');
      } else if (res && res.safe === false) {
        renderError(el, cardData, res.fallback || 'Unable to generate explanation for this hadith.');
      } else {
        renderError(el, cardData, 'Explanation unavailable — please try again');
      }
    }, function () {
      inflight[fk] = false;
      renderError(el, cardData, 'Explanation unavailable — please try again');
    });
  }

  function toggle(card) {
    var cardData = readCard(card);
    var el = ensureCard(card);
    el.classList.toggle('show');
    if (!el.classList.contains('show')) return;
    if (!core.hasText(cardData)) {
      var body = el.querySelector('.ai-body'); body.textContent = 'Explanation unavailable for this hadith.';
      setFoot(el.querySelector('.ai-foot'), cardData.ref); return;
    }
    var b = el.querySelector('.ai-body');
    if (b && b.dataset.rendered) return; // already have an answer
    fetchAndRender(el, cardData);
  }

  // Inject a ✦ button into a .hadith-actions row (idempotent).
  function injectButton(actions) {
    if (!actions || actions.querySelector('.hadith-action-btn.ai')) return;
    var card = actions.closest('.hadith-card');
    if (!card) return;
    var btn = document.createElement('button');
    btn.className = 'hadith-action-btn ai';
    btn.type = 'button';
    btn.title = 'AI Explanation';
    btn.setAttribute('aria-label', 'AI Explanation');
    btn.setAttribute('data-i18n-attr', 'title:hadith.card.titleAIExplain');
    btn.textContent = '✦';
    btn.addEventListener('click', function (e) { e.preventDefault(); toggle(card); });
    actions.appendChild(btn);
  }

  function injectAll(root) {
    var rows = (root || document).querySelectorAll('.hadith-actions');
    for (var i = 0; i < rows.length; i++) injectButton(rows[i]);
  }

  function start() {
    injectAll(document);
    // Observe .main so cards in BOTH the Tier-1 feed (#hadith-feed) and the async
    // Tier-3a book list (#ii-t3a-list, a sibling under .main) get the ✦ button,
    // matching how Modules 10/9 cover Tier-3a. Both render via feed.buildCardHTML.
    var feed = document.querySelector('.main') || document.getElementById('hadith-feed') || document.body;
    if (window.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].addedNodes && muts[i].addedNodes.length) injectAll(feed);
        }
      });
      mo.observe(feed, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
