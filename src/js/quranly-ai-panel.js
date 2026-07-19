/* QuranlyAI — lazy-loaded panel. Defines <quranly-panel> (Shadow DOM). Streams the
   SSE response from /api/quranlyai/ask, rendering deltas live; correctness (SSE
   parsing, verdict backstop, quota text) comes from window.II.quranlyCore. */
(function () {
  'use strict';
  var core = (window.II && window.II.quranlyCore) || {};

  // Translate targets (matches the word-by-word reader's language set).
  var TR_LANGS = [
    { code: 'en', name: 'English' }, { code: 'ar', name: 'Arabic' }, { code: 'bn', name: 'Bangla' },
    { code: 'hi', name: 'Hindi' }, { code: 'ur', name: 'Urdu' }
  ];
  function detectLangName() {
    var code = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2).toLowerCase();
    for (var i = 0; i < TR_LANGS.length; i++) { if (TR_LANGS[i].code === code) return TR_LANGS[i].name; }
    return 'English';
  }

  function QuranlyPanel() { return Reflect.construct(HTMLElement, [], QuranlyPanel); }
  QuranlyPanel.prototype = Object.create(HTMLElement.prototype);
  QuranlyPanel.prototype.constructor = QuranlyPanel;

  QuranlyPanel.prototype.connectedCallback = function () {
    if (this._built) return;
    this._built = true;
    var sh = this.attachShadow({ mode: 'open' });
    sh.innerHTML =
      '<div class="qa-drawer" part="drawer">' +
      '  <div class="qa-head"><span><span class="qa-star">✨</span> QuranlyAI</span>' +
      '    <button class="qa-close" aria-label="Close">✕</button></div>' +
      '  <div class="qa-thread"></div>' +
      '  <div class="qa-chips"></div>' +
      '  <div class="qa-inputrow"><input class="qa-input" type="text" placeholder="Ask a question…">' +
      '    <button class="qa-send">Send</button></div>' +
      '  <div class="qa-quota"></div>' +
      '  <div class="qa-foot">Powered by QuranlyAI · Educational purposes only · No Fatwas</div>' +
      '</div>';
    this._els = {
      drawer: sh.querySelector('.qa-drawer'),
      thread: sh.querySelector('.qa-thread'),
      chips: sh.querySelector('.qa-chips'),
      input: sh.querySelector('.qa-input'),
      send: sh.querySelector('.qa-send'),
      quota: sh.querySelector('.qa-quota')
    };
    var self = this;
    sh.querySelector('.qa-close').addEventListener('click', function () { self.closePanel(); });
    this._els.send.addEventListener('click', function () { self._sendFree(); });
    this._els.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') self._sendFree(); });
    this._loadStyles(sh);
    var cfg = (window.QuranlyAI.getState && window.QuranlyAI.getState().config) || {};
    this._els.quota.textContent = cfg.betaUnlimited ? 'Beta Testing: Unlimited Questions' : core.quotaText(null, cfg.maxPerDay || 3);
  };

  QuranlyPanel.prototype._loadStyles = function (sh) {
    var cfg = (window.QuranlyAI.getState && window.QuranlyAI.getState().config) || {};
    var url = cfg.cssUrl;
    if (!url) return;
    fetch(url).then(function (r) { return r.text(); }).then(function (css) {
      var st = document.createElement('style'); st.textContent = css; sh.appendChild(st);
    }).catch(function () { /* unstyled but functional */ });
  };

  QuranlyPanel.prototype.openPanel = function (context, prefilledAction) {
    this._context = context || {};
    this._renderChips();
    var self = this; requestAnimationFrame(function () { self._els.drawer.classList.add('qa-open'); });
    if (prefilledAction) this.runAsk(prefilledAction, '');
  };
  QuranlyPanel.prototype.closePanel = function () { this._els.drawer.classList.remove('qa-open'); };

  QuranlyPanel.prototype._renderChips = function () {
    var self = this;
    this._els.chips.innerHTML = '';
    core.chipsFor(this._context && this._context.type).forEach(function (chip) {
      var b = document.createElement('button');
      b.className = 'qa-chip'; b.type = 'button'; b.textContent = chip.label;
      b.addEventListener('click', function () {
        var kind = core.routeKind ? core.routeKind(chip.action) : 'ai';
        if (kind === 'ai') { self.runAsk(chip.action, ''); }
        else if (window.QuranlyAI && window.QuranlyAI.route) { window.QuranlyAI.route(chip.action, self._context); }
      });
      self._els.chips.appendChild(b);
    });
  };

  QuranlyPanel.prototype._sendFree = function () {
    var q = this._els.input.value.trim();
    if (!q) return;
    this._els.input.value = '';
    this.runAsk('custom', q);
  };

  QuranlyPanel.prototype._bubble = function (cls, text) {
    var d = document.createElement('div');
    d.className = 'qa-msg ' + cls; d.textContent = text || '';
    this._els.thread.appendChild(d);
    this._els.thread.scrollTop = this._els.thread.scrollHeight;
    return d;
  };

  QuranlyPanel.prototype.runAsk = function (action, customQuestion) {
    var self = this;
    var st = window.QuranlyAI.getState();
    var cfg = st.config;
    if (action === 'translate') {
      if (!this._translateLang) this._translateLang = detectLangName();
      st.context.targetLang = this._translateLang;
    } else if (st.context) {
      delete st.context.targetLang; // keep non-translate cache keys stable
    }
    var userLabel = (action === 'translate') ? ('Translate → ' + this._translateLang)
      : (customQuestion || action.replace(/_/g, ' '));
    this._bubble('qa-user', userLabel);
    var ai = this._bubble('qa-ai', '');
    ai._action = action;
    this._els.send.disabled = true;
    var payload = core.buildAskPayload(st.context, action, customQuestion, st.anonId);

    fetch(cfg.apiBase + '/api/quranlyai/ask', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(function (res) {
      if (res.status === 429) { self._fail(ai, 'You’ve reached today’s limit — please try again later.'); return null; }
      if (res.status === 403) { self._fail(ai, 'QuranlyAI isn’t available on this site.'); return null; }
      if (!res.ok || !res.body) { self._fail(ai, 'QuranlyAI is temporarily unavailable — please try again.'); return null; }
      return self._stream(res.body, ai);
    }).catch(function () {
      self._fail(ai, 'QuranlyAI is temporarily unavailable — please try again.');
    });
  };

  QuranlyPanel.prototype._stream = function (body, ai) {
    var self = this;
    var reader = body.pipeThrough(new TextDecoderStream()).getReader();
    var buffer = '', full = '';
    function pump() {
      return reader.read().then(function (res) {
        if (res.done) { self._finalize(ai, full, null); return; }
        buffer += res.value;
        var parsed = core.parseSSE(buffer);
        buffer = parsed.rest;
        parsed.events.forEach(function (ev) {
          if (ev.event === 'done') { self._finalize(ai, full, ev.data); }
          else if (ev.data && typeof ev.data.delta === 'string') { full += ev.data.delta; ai.textContent = full; self._els.thread.scrollTop = self._els.thread.scrollHeight; }
        });
        return pump();
      });
    }
    return pump();
  };

  QuranlyPanel.prototype._finalize = function (ai, full, meta) {
    // Skip the verdict backstop for translations — they reproduce already-sourced content.
    if (ai._action !== 'translate' && core.containsVerdictLanguage(full)) { ai.textContent = core.SCHOLAR_REDIRECT; }
    if (meta) {
      // A translation is plain text — no Sources/Confidence scaffolding.
      if (ai._action !== 'translate') {
        if (meta.sources && meta.sources.length) {
          var s = document.createElement('div'); s.className = 'qa-sources';
          s.textContent = 'Sources: ' + meta.sources.join(' · '); ai.appendChild(s);
        }
        if (meta.confidence) {
          var c = document.createElement('span'); c.className = 'qa-confidence';
          c.textContent = 'Confidence: ' + meta.confidence; ai.appendChild(c);
        }
      }
      var cfg = window.QuranlyAI.getState().config;
      this._els.quota.textContent = cfg.betaUnlimited ? 'Beta Testing: Unlimited Questions' : core.quotaText(meta.remaining, cfg.maxPerDay || 3);
    }
    if (ai._action === 'translate') this._appendLangSelector(ai);
    this._els.send.disabled = false;
  };

  // A row of language chips under a translation; picking a different one re-translates.
  QuranlyPanel.prototype._appendLangSelector = function (ai) {
    var self = this;
    var row = document.createElement('div');
    row.className = 'qa-langs';
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center;';
    var label = document.createElement('span');
    label.textContent = 'Translate to:';
    label.style.cssText = 'font-size:.78em;opacity:.7;';
    row.appendChild(label);
    TR_LANGS.forEach(function (l) {
      var active = (l.name === self._translateLang);
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = l.name;
      b.style.cssText = 'cursor:pointer;border:.5px solid var(--gold-500,#C5A059);border-radius:999px;' +
        'padding:2px 9px;font:inherit;font-size:.78em;background:' +
        (active ? 'var(--gold-500,#C5A059)' : 'transparent') + ';color:' + (active ? '#1a1204' : 'inherit') + ';';
      b.addEventListener('click', function () {
        if (self._els.send.disabled) return; // a request is already in flight
        if (l.name === self._translateLang) return;
        self._translateLang = l.name;
        self.runAsk('translate', '');
      });
      row.appendChild(b);
    });
    ai.appendChild(row);
  };

  QuranlyPanel.prototype._fail = function (ai, msg) {
    ai.className = 'qa-msg qa-error'; ai.textContent = msg;
    this._els.send.disabled = false;
  };

  if (!customElements.get('quranly-panel')) customElements.define('quranly-panel', QuranlyPanel);
})();
