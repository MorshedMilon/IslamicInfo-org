/* Module 5B — AI Explain controller. Overrides inline toggleAI. */
(function () {
  'use strict';
  var core = (window.II && window.II.aiCore);
  if (!core) { console.warn('[quran-ai] aiCore missing'); return; }

  var inflight = {}; // ai-card element id -> true

  function stripQuotes(s) { return String(s || '').replace(/^\s*["“]|["”]\s*$/g, '').trim(); }

  function cardFor(id) { return document.getElementById(id.replace(/^ai-/, 'a-')); }

  function readVerse(card) {
    var vk = card.dataset.key || '';
    var arabic = (card.querySelector('.ayah-arabic') || {}).textContent || '';
    var translation = stripQuotes((card.querySelector('.ayah-translation') || {}).textContent || '');
    var attr = (card.querySelector('.ayah-trans-attr') || {}).textContent || '';
    var edition = core.editionFromAttr(attr);
    // ref = the text after the middle dot in attr, else fall back to verse key
    var dot = attr.indexOf('·');
    var ref = dot === -1 ? vk : attr.slice(dot + 1).trim();
    return { vk: vk, arabic: arabic, translation: translation, edition: edition, ref: ref };
  }

  function ensureStructure(aiEl, ref) {
    if (aiEl.dataset.built) return;
    aiEl.dataset.built = '1';
    var head = document.createElement('div'); head.className = 'ai-head';
    var title = document.createElement('div'); title.className = 'ai-title'; title.textContent = 'AI Explanation';
    var close = document.createElement('button'); close.className = 'ai-close'; close.type = 'button'; close.textContent = '✕';
    close.addEventListener('click', function (e) { e.stopPropagation(); aiEl.classList.remove('show'); });
    head.appendChild(title); head.appendChild(close);
    var text = document.createElement('div'); text.className = 'ai-text';
    var foot = document.createElement('div'); foot.className = 'ai-foot';
    aiEl.appendChild(head); aiEl.appendChild(text); aiEl.appendChild(foot);
  }

  function setFoot(aiEl, ref) {
    var foot = aiEl.querySelector('.ai-foot');
    if (!foot) return;
    // Brand-mandated attribution (CONTENT-POLICY §3/§8) + no-ruling framing (§4).
    foot.textContent = '';
    foot.appendChild(document.createTextNode('✦ Powered by '));
    var a = document.createElement('a');
    a.href = 'https://quranlyai.com'; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'QuranlyAI ↗';
    foot.appendChild(a);
    foot.appendChild(document.createTextNode(' · Not a religious ruling' + (ref ? ' · ' + ref : '')));
  }

  function renderAnswer(aiEl, answer, ref) {
    var text = aiEl.querySelector('.ai-text');
    var ans = core.containsVerdictLanguage(answer) ? core.SCHOLAR_REDIRECT : answer;
    text.textContent = ans;
    text.dataset.rendered = '1';
    setFoot(aiEl, ref);
  }

  function renderLoading(aiEl) {
    var text = aiEl.querySelector('.ai-text');
    text.textContent = 'Generating a simple explanation…';
    text.removeAttribute('data-rendered');
    var foot = aiEl.querySelector('.ai-foot'); if (foot) foot.textContent = '';
  }

  function renderFallback(aiEl, v) {
    var text = aiEl.querySelector('.ai-text');
    text.textContent = 'AI explanation unavailable — please try again.';
    text.removeAttribute('data-rendered');
    text.style.cursor = 'pointer';
    text.onclick = function () { text.onclick = null; text.style.cursor = ''; fetchAndRender(aiEl, v); };
    setFoot(aiEl, v.ref);
  }

  function fetchAndRender(aiEl, v) {
    var fk = aiEl.id;
    if (inflight[fk]) return;
    inflight[fk] = true;
    renderLoading(aiEl);
    var payload = core.buildAskPayload({ arabic: v.arabic, translation: v.translation, ref: v.ref, edition: v.edition });
    var api = window.II && window.II.api;
    var p = (api && api.postAskClaude) ? api.postAskClaude(payload.context, payload.question, payload.sourceRef) : Promise.resolve(null);
    Promise.resolve(p).then(function (res) {
      inflight[fk] = false;
      if (res && res.answer) {
        var safe = core.containsVerdictLanguage(res.answer) ? core.SCHOLAR_REDIRECT : res.answer;
        renderAnswer(aiEl, safe, v.ref);
        try {
          localStorage.setItem(core.aiCacheKey(v.vk, v.edition), JSON.stringify({ answer: safe, ts: Date.now() }));
        } catch (_) { /* quota — still shown */ }
      } else {
        renderFallback(aiEl, v);
      }
    }, function () { inflight[fk] = false; renderFallback(aiEl, v); });
  }

  window.toggleAI = function (id) {
    var aiEl = document.getElementById(id);
    if (!aiEl) return;
    var card = cardFor(id);
    if (!card) { aiEl.classList.toggle('show'); return; }
    var v = readVerse(card);
    ensureStructure(aiEl, v.ref);
    aiEl.classList.toggle('show');
    if (!aiEl.classList.contains('show')) return;

    var text = aiEl.querySelector('.ai-text');
    if (text && text.dataset.rendered) return; // already have an answer visible

    // empty verse — nothing to explain; don't bill the API
    if (!(v.arabic && v.arabic.trim()) && !(v.translation && v.translation.trim())) {
      var t = aiEl.querySelector('.ai-text'); if (t) { t.textContent = 'Explanation unavailable for this verse.'; t.removeAttribute('data-rendered'); }
      setFoot(aiEl, v.ref); return;
    }

    // cache-first
    try {
      var raw = localStorage.getItem(core.aiCacheKey(v.vk, v.edition));
      if (raw) {
        var obj = JSON.parse(raw);
        if (obj && obj.answer && core.isFresh(obj.ts, Date.now()) && !core.containsVerdictLanguage(obj.answer)) {
          renderAnswer(aiEl, obj.answer, v.ref);
          return;
        }
      }
    } catch (_) { /* corrupt cache — fall through to fetch */ }

    fetchAndRender(aiEl, v);
  };

  window.II = window.II || {};
  window.II.quranAI = { _readVerse: readVerse, _fetch: fetchAndRender };
})();
