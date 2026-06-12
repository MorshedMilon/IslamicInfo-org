/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — i18n.js  (v1.0 · 2026-06)
   Vanilla multilingual engine + header language dropdown.

   MUST be loaded BEFORE global.js and all page scripts.

   Exposes:
     window.II.i18n = { lang, bcp47, t, setLang, apply, langs }
     window.II.t    = t   (convenience alias)

   How it works:
     - HTML is authored in English. For lang === 'en' nothing is
       fetched or rewritten (zero cost).
     - For any other language, en.json + {lang}.json are fetched and
       merged (English fills any missing keys), then every element
       carrying data-i18n / data-i18n-attr is updated in place.
     - Page scripts translate runtime strings via II.t(key, fallback,
       params) and re-render on the 'ii:langchange' document event.

   Markup contract:
     data-i18n="key"                  → textContent (innerHTML if the
                                        data-i18n-html flag is present)
     data-i18n-attr="attr:key;…"      → sets each listed attribute

   Persistence: localStorage 'islamicinfo-lang' (default 'en').
   RTL: ar + ur set <html dir="rtl">; everything else restores ltr.
   URL override for testing: ?lang=ar  (persists).
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var LS_LANG = 'islamicinfo-lang';
  var VERSION = '1';                       /* bump to bust locale cache */

  var LANGS = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية', rtl: true },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ur', name: 'اردو', rtl: true },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ms', name: 'Bahasa Melayu' }
  ];

  /* Western digits everywhere (design lock on time/number cards) */
  var BCP47 = {
    en: 'en-US', ar: 'ar-u-nu-latn', bn: 'bn-BD-u-nu-latn',
    ur: 'ur-PK-u-nu-latn', fr: 'fr-FR', es: 'es-ES', tr: 'tr-TR',
    id: 'id-ID', hi: 'hi-IN-u-nu-latn', ms: 'ms-MY'
  };

  function isValid(code) {
    return LANGS.some(function (l) { return l.code === code; });
  }

  var qp = null;
  try { qp = new URLSearchParams(location.search).get('lang'); } catch (_) {}
  var lang = qp || localStorage.getItem(LS_LANG) || 'en';
  if (!isValid(lang)) lang = 'en';

  var dict = {};


  /* ─── Locale loading (fetch + localStorage cache) ─────────────── */

  function loadLocale(code) {
    var key = 'islamicinfo-locale:' + code + ':' + VERSION;
    try {
      var cached = localStorage.getItem(key);
      if (cached) return Promise.resolve(JSON.parse(cached));
    } catch (_) {}
    return fetch('src/locales/' + code + '.json').then(function (r) {
      if (!r.ok) throw new Error('locale ' + code + ' HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
      return data;
    });
  }


  /* ─── Translate ───────────────────────────────────────────────── */

  function t(key, fallback, params) {
    var s = dict[key];
    if (s === undefined) s = (fallback !== undefined ? fallback : key);
    if (params) {
      Object.keys(params).forEach(function (k) {
        s = s.split('{' + k + '}').join(params[k]);
      });
    }
    return s;
  }

  function apply(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var v = dict[el.getAttribute('data-i18n')];
      if (v === undefined) continue;
      if (el.hasAttribute('data-i18n-html')) el.innerHTML = v;
      else el.textContent = v;
    }
    var attrNodes = root.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrNodes.length; j++) {
      var ael = attrNodes[j];
      var pairs = ael.getAttribute('data-i18n-attr').split(';');
      for (var k = 0; k < pairs.length; k++) {
        var idx = pairs[k].indexOf(':');
        if (idx < 0) continue;
        var av = dict[pairs[k].slice(idx + 1).trim()];
        if (av !== undefined) ael.setAttribute(pairs[k].slice(0, idx).trim(), av);
      }
    }
  }

  function applyDir(code) {
    var meta = LANGS.filter(function (l) { return l.code === code; })[0];
    document.documentElement.setAttribute('lang', code);
    document.documentElement.setAttribute('dir', meta && meta.rtl ? 'rtl' : 'ltr');
  }


  /* ─── Switch language ─────────────────────────────────────────── */

  function setLang(code) {
    if (!isValid(code)) return;
    var loads = (code === 'en')
      ? [loadLocale('en')]
      : [loadLocale('en'), loadLocale(code)];
    Promise.all(loads).then(function (dicts) {
      dict = Object.assign({}, dicts[0], dicts[1] || {});
      lang = code;
      try { localStorage.setItem(LS_LANG, code); } catch (_) {}
      applyDir(code);
      apply(document);
      window.II.i18n.lang = code;
      window.II.i18n.bcp47 = BCP47[code];
      renderLangUi();
      document.dispatchEvent(new CustomEvent('ii:langchange', { detail: { lang: code } }));
    }).catch(function (e) {
      console.warn('[i18n] ' + e.message);
      if (window.showToast) window.showToast('Could not load language — check your connection');
    });
  }


  /* ─── Header dropdown (#langBtn + #langMenu) ──────────────────── */

  function renderLangUi() {
    var codeEl = document.getElementById('langBtnCode');
    if (codeEl) codeEl.textContent = lang.toUpperCase();
    var menu = document.getElementById('langMenu');
    if (!menu) return;
    var items = menu.querySelectorAll('.lang-item');
    for (var i = 0; i < items.length; i++) {
      var on = items[i].getAttribute('data-lang') === lang;
      items[i].classList.toggle('on', on);
      items[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  function buildDropdown() {
    var btn = document.getElementById('langBtn');
    var menu = document.getElementById('langMenu');
    if (!btn || !menu) return;

    var html = '';
    for (var i = 0; i < LANGS.length; i++) {
      var l = LANGS[i];
      html += '<button class="lang-item" type="button" role="option" data-lang="' + l.code + '">' +
                '<span class="lang-code">' + l.code.toUpperCase() + '</span>' +
                '<span>' + l.name + '</span>' +
              '</button>';
    }
    menu.innerHTML = html;

    function close() {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.addEventListener('click', function (e) {
      var item = e.target.closest('.lang-item');
      if (!item) return;
      e.stopPropagation();
      close();
      setLang(item.getAttribute('data-lang'));
    });

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && e.target !== btn) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    renderLangUi();
  }


  /* ─── Public API + boot ───────────────────────────────────────── */

  window.II = window.II || {};
  window.II.i18n = {
    lang: lang,
    bcp47: BCP47[lang],
    t: t,
    setLang: setLang,
    apply: apply,
    langs: LANGS
  };
  window.II.t = t;

  document.addEventListener('DOMContentLoaded', function () {
    buildDropdown();
    if (lang !== 'en') setLang(lang);
  });

}());
