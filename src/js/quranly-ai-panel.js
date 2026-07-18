/* QuranlyAI — lazy-loaded panel. Defines <quranly-panel> (Shadow DOM). Streams the
   SSE response from /api/quranlyai/ask, rendering deltas live; correctness (SSE
   parsing, verdict backstop, quota text) comes from window.II.quranlyCore. */
(function () {
  'use strict';
  var core = (window.II && window.II.quranlyCore) || {};

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
      b.addEventListener('click', function () { self.runAsk(chip.action, ''); });
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
    this._bubble('qa-user', customQuestion || action.replace(/_/g, ' '));
    var ai = this._bubble('qa-ai', '');
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
    if (core.containsVerdictLanguage(full)) { ai.textContent = core.SCHOLAR_REDIRECT; }
    if (meta) {
      if (meta.sources && meta.sources.length) {
        var s = document.createElement('div'); s.className = 'qa-sources';
        s.textContent = 'Sources: ' + meta.sources.join(' · '); ai.appendChild(s);
      }
      if (meta.confidence) {
        var c = document.createElement('span'); c.className = 'qa-confidence';
        c.textContent = 'Confidence: ' + meta.confidence; ai.appendChild(c);
      }
      var cfg = window.QuranlyAI.getState().config;
      this._els.quota.textContent = cfg.betaUnlimited ? 'Beta Testing: Unlimited Questions' : core.quotaText(meta.remaining, cfg.maxPerDay || 3);
    }
    this._els.send.disabled = false;
  };

  QuranlyPanel.prototype._fail = function (ai, msg) {
    ai.className = 'qa-msg qa-error'; ai.textContent = msg;
    this._els.send.disabled = false;
  };

  if (!customElements.get('quranly-panel')) customElements.define('quranly-panel', QuranlyPanel);
})();
