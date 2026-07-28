/* IslamicInfo.org — quran-translations.js
   Translation picker (Task 7): live quran.com translations list, searchable
   language-grouped floating picker, persists ii-quran-translation, reloads verses.
   Mirrors quran-audio.js. Depends on: window.II.versesCore (quran-verses-core.js). */
(function () {
  'use strict';

  var core = window.II && window.II.versesCore;
  var LIST_URL = 'https://api.quran.com/api/v4/resources/translations';
  var SEED = 'src/data/translations.json';
  var WEEK = 7 * 24 * 60 * 60 * 1000;
  var DEFAULT_ID = 20;                                   // Saheeh International (English)
  var DEFAULT_TR = { id: 20, name: 'Saheeh International', language: 'english',
                     languageLabel: 'English', dir: 'ltr' };

  // ---- cache ----
  function readCache(k) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { try { localStorage.removeItem(k); } catch (_) {} return null; } }
  function writeCache(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---- state ----
  var translations = [DEFAULT_TR];    // normalized records; replaced by live/seed list
  var editionId = DEFAULT_ID;
  var transOff = false;               // "None" selected → hide translation text (Arabic only)

  // Toggle the Arabic-only ("None") translation state. Purely visual — html.trans-off
  // hides .ayah-translation/.ayah-trans-attr via CSS, so no verse re-fetch is needed.
  function applyTransOff(off, persist) {
    transOff = !!off;
    document.documentElement.classList.toggle('trans-off', transOff);
    if (persist) { try { localStorage.setItem('ii-quran-trans-off', transOff ? '1' : '0'); } catch (e) {} }
    syncLabel();
  }

  function toast(m) { if (window.showToast) window.showToast(m); }
  function record(id) {
    for (var i = 0; i < translations.length; i++) { if (translations[i].id === id) return translations[i]; }
    return null;
  }
  function fullName(id) { var r = record(id); return r ? r.name : (core ? core.editionName(id) : 'Translation'); }
  function shortLabel(id) { var n = fullName(id); return n.length > 16 ? n.slice(0, 15) + '…' : n; }
  function dirOf(id) { var r = record(id); return r ? r.dir : 'ltr'; }

  // ---- list: live → cache (7d) → seed json → inline default ----
  function loadList() {
    var key = core.translationsCacheKey();
    var c = readCache(key);
    if (c && Array.isArray(c.data) && c.data.length && core.isFresh(c.fetchedAt, Date.now(), WEEK)) {
      return Promise.resolve(c.data);
    }
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(LIST_URL, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var list = (j.translations || []).map(function (x) { return core.normalizeTranslation(x); })
          .filter(function (x) { return x.id > 0; });
        if (!list.length) throw new Error('empty');
        writeCache(key, { fetchedAt: Date.now(), data: list });
        return list;
      })
      .catch(function (e) {
        console.warn('[quran] translations list failed, using seed:', e && e.message);
        return fetch(SEED).then(function (r) { return r.json(); })
          .then(function (rows) { return (rows || []).map(function (x) { return core.normalizeTranslation(x); }); })
          .catch(function () { return [DEFAULT_TR]; });
      })
      .finally(function () { clearTimeout(t); });
  }

  // ---- floating picker (appended to <body> so no ancestor clip affects it) ----
  // Search box + a language list: a curated PRIMARY section (18 most-used in the
  // Muslim world) then a "More Languages" expander for the rest. Tapping a language
  // opens its translators inline (accordion) — no side-flyout, so it behaves the
  // same on desktop, tablet, and mobile. A non-empty search switches to a flat
  // filtered translator list across all languages.
  var floatPicker = null, searchInput = null, listWrap = null, openSub = null;

  function makeOpt(tr) {
    var opt = document.createElement('div');
    opt.className = 'reciter-opt' + ((!transOff && tr.id === editionId) ? ' on' : '');
    if (tr.dir === 'rtl') opt.setAttribute('dir', 'rtl');
    var dot = document.createElement('div'); dot.className = 'reciter-opt-dot'; opt.appendChild(dot);
    opt.appendChild(document.createTextNode(tr.name));
    opt.addEventListener('click', function (e) { if (e && e.stopPropagation) e.stopPropagation(); window.selectTranslation(tr.id); });
    return opt;
  }

  // "None (Arabic only)" — the first row of the picker. Selecting it hides all
  // translation text and returns to a pure Arabic, line-by-line reading view.
  function makeNoneOpt() {
    var opt = document.createElement('div');
    opt.className = 'reciter-opt tp-none-opt' + (transOff ? ' on' : '');
    var dot = document.createElement('div'); dot.className = 'reciter-opt-dot'; opt.appendChild(dot);
    opt.appendChild(document.createTextNode('None (Arabic only)'));
    opt.addEventListener('click', function (e) { if (e && e.stopPropagation) e.stopPropagation(); window.selectTranslationNone(); });
    return opt;
  }

  function getFloatPicker() {
    if (!floatPicker) {
      floatPicker = document.createElement('div');
      floatPicker.className = 'reciter-picker translation-picker';
      floatPicker.id = 'translationFloatPicker';
      floatPicker.style.cssText = 'position:fixed;bottom:auto;right:auto;z-index:9999;display:none;';
      searchInput = document.createElement('input');
      searchInput.type = 'text'; searchInput.className = 'tp-search';
      searchInput.setAttribute('placeholder', 'Search language or translator…');
      searchInput.setAttribute('aria-label', 'Search translations');
      searchInput.addEventListener('input', renderList);
      searchInput.addEventListener('click', function (e) { e.stopPropagation(); });
      listWrap = document.createElement('div'); listWrap.className = 'tp-list';
      floatPicker.appendChild(searchInput);
      floatPicker.appendChild(listWrap);
      (document.body || document.documentElement).appendChild(floatPicker);
    }
    return floatPicker;
  }
  function collapseSub() {
    if (openSub) { openSub.sub.classList.remove('open'); openSub.row.classList.remove('expanded'); openSub = null; }
  }
  function hideFloatPicker() { collapseSub(); if (floatPicker) { floatPicker.style.display = 'none'; floatPicker._anchor = null; } }

  // Accordion: open one language's translators inline; opening another closes it.
  function toggleLang(group, row, sub) {
    var wasOpen = openSub && openSub.sub === sub;
    collapseSub();
    if (wasOpen) return;
    if (!sub._filled) {
      var ordered = core.pickCompareSet(group.items, group.language, group.items.length); // popularity-ordered
      ordered.forEach(function (tr) { sub.appendChild(makeOpt(tr)); });
      sub._filled = true;
    }
    sub.classList.add('open'); row.classList.add('expanded');
    openSub = { row: row, sub: sub };
    try { row.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }

  function appendLangRow(container, group) {
    var hasCurrent = group.items.some(function (t) { return t.id === editionId; });
    var row = document.createElement('div');
    row.className = 'tp-lang' + (hasCurrent ? ' on' : '');
    row.setAttribute('data-lang', group.language);
    var name = document.createElement('span'); name.className = 'tp-lang-name'; name.textContent = group.languageLabel;
    var count = document.createElement('span'); count.className = 'tp-lang-count'; count.textContent = String(group.items.length);
    var chev = document.createElement('span'); chev.className = 'tp-lang-chev'; chev.textContent = '›';
    row.appendChild(name); row.appendChild(count); row.appendChild(chev);
    var sub = document.createElement('div'); sub.className = 'tp-sub'; sub.setAttribute('data-lang', group.language);
    row.addEventListener('click', function (e) { e.stopPropagation(); toggleLang(group, row, sub); });
    container.appendChild(row); container.appendChild(sub);
  }

  function renderList() {
    getFloatPicker();
    collapseSub();
    listWrap.innerHTML = '';
    listWrap.appendChild(makeNoneOpt());   // "None (Arabic only)" always first
    var q = (searchInput.value || '').trim();
    if (q) {
      // flat filtered translator list, "Name · Language"
      var hits = core.filterTranslations(translations, q);
      if (!hits.length) { var none = document.createElement('div'); none.className = 'tp-empty'; none.textContent = 'No matches'; listWrap.appendChild(none); return; }
      hits.slice(0, 60).forEach(function (tr) {
        var opt = makeOpt(tr);
        var tag = document.createElement('span'); tag.className = 'tp-opt-lang'; tag.textContent = tr.languageLabel;
        opt.appendChild(tag);
        listWrap.appendChild(opt);
      });
      return;
    }
    var part = core.partitionLanguages(core.groupTranslationsByLanguage(translations));
    if (part.primary.length) {
      var lbl = document.createElement('div'); lbl.className = 'tp-section-label'; lbl.textContent = 'Frequently used';
      listWrap.appendChild(lbl);
      part.primary.forEach(function (g) { appendLangRow(listWrap, g); });
    }
    if (part.more.length) {
      var moreToggle = document.createElement('div'); moreToggle.className = 'tp-more-toggle';
      var mlabel = document.createElement('span'); mlabel.className = 'tp-lang-name'; mlabel.textContent = 'More Languages';
      var mcount = document.createElement('span'); mcount.className = 'tp-lang-count'; mcount.textContent = String(part.more.length);
      var mchev = document.createElement('span'); mchev.className = 'tp-lang-chev'; mchev.textContent = '›';
      moreToggle.appendChild(mlabel); moreToggle.appendChild(mcount); moreToggle.appendChild(mchev);
      var moreWrap = document.createElement('div'); moreWrap.className = 'tp-more-wrap';
      moreToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var opened = moreWrap.classList.toggle('open');
        moreToggle.classList.toggle('expanded', opened);
        if (opened && !moreWrap._filled) { part.more.forEach(function (g) { appendLangRow(moreWrap, g); }); moreWrap._filled = true; }
      });
      listWrap.appendChild(moreToggle);
      listWrap.appendChild(moreWrap);
    }
  }

  window.toggleTranslationPicker = function (btn) {
    var fp = getFloatPicker();
    if (fp.style.display === 'block' && fp._anchor === btn) { hideFloatPicker(); return; }
    fp.style.display = 'block';           // display before measuring so offset* is valid
    searchInput.value = '';
    renderList();
    fp._anchor = btn || null;
    var vw = window.innerWidth || 360, vh = window.innerHeight || 640;
    var r = (btn && btn.getBoundingClientRect) ? btn.getBoundingClientRect() : { top: 60, bottom: 60, left: 20 };
    var pw = fp.offsetWidth || 260, ph = fp.offsetHeight || 360;
    var top = (r.top > vh / 2) ? Math.max(8, r.top - ph - 6) : (r.bottom + 6);
    var left = Math.max(8, Math.min(r.left, vw - pw - 8));
    fp.style.top = top + 'px';
    fp.style.left = left + 'px';
    try { searchInput.focus(); } catch (e) {}
  };

  window.selectTranslation = function (id) {
    var tid = Number(id);
    if (!(tid > 0)) return;
    editionId = tid;
    try { localStorage.setItem('ii-quran-translation', String(tid)); } catch (e) {}
    var wasOff = transOff;
    applyTransOff(false, true);        // choosing a translation turns "None" off
    hideFloatPicker();
    toast('Translation: ' + shortLabel(tid));
    // Re-fetch verses in the chosen edition. If we were showing None the verses may
    // already hold this edition's text (hidden by CSS), but re-loading guarantees it.
    if (window.loadSurah) window.loadSurah(window.currentSurahId || 1);
    return wasOff;
  };

  // "None" — Arabic-only. No re-fetch; html.trans-off just hides the text via CSS.
  window.selectTranslationNone = function () {
    applyTransOff(true, true);
    hideFloatPicker();
    toast('Translation: None');
  };

  function syncLabel() {
    var el = document.getElementById('translationLabelTop');
    if (el) el.textContent = transOff ? 'None' : shortLabel(editionId);
    var btn = document.getElementById('translationBtnTop');
    if (btn) btn.classList.toggle('on', !transOff);   // dim the toolbar button when None
    // Mobile compact toolbar: gold dot on the translation icon when a translation is active.
    var mIco = document.getElementById('mTransIco');
    if (mIco) {
      var dot = mIco.querySelector('.m-dot');
      if (transOff) { if (dot) dot.parentNode.removeChild(dot); }
      else if (!dot) { var d = document.createElement('span'); d.className = 'm-dot'; mIco.appendChild(d); }
    }
  }

  // Close on outside click. Trigger button re-toggles itself; search stops propagation.
  document.addEventListener('click', function (e) {
    if (!floatPicker || floatPicker.style.display !== 'block') return;
    if (e.target && e.target.closest && (e.target.closest('#translationFloatPicker') ||
        e.target.closest('#translationBtnTop') || e.target.closest('.js-trans-trigger'))) return;
    hideFloatPicker();
  });

  function init() {
    if (!core) return;
    try { var saved = Number(localStorage.getItem('ii-quran-translation')); if (saved > 0) editionId = saved; } catch (e) {}
    // Translation default: mobile (≤900px) opens Arabic-only (None) unless the user
    // has explicitly chosen before; desktop keeps a translation shown. A saved choice
    // (either direction) always wins. The mobile default is soft (not persisted).
    var savedOff = null; try { savedOff = localStorage.getItem('ii-quran-trans-off'); } catch (e) {}
    var mob = window.matchMedia('(max-width:900px)').matches;
    var off = savedOff === '1' ? true : savedOff === '0' ? false : mob;
    applyTransOff(off, false);
    syncLabel();
    loadList().then(function (list) {
      if (list && list.length) translations = list;
      syncLabel();
      if (floatPicker && floatPicker.style.display === 'block') renderList();
      // A restored non-default translation may have rendered its verses before the
      // catalog arrived (fallback name, no RTL). Re-render now that metadata is known.
      if (editionId !== DEFAULT_ID && window.currentSurahId && window.loadSurah) {
        window.loadSurah(window.currentSurahId);
      }
    }).catch(function (e) { console.warn('[quran] translations init failed:', e && e.message); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.translations = {
    init: init,
    name: fullName,
    dir: dirOf,
    isRtl: function (id) { return dirOf(id) === 'rtl'; },
    current: function () { return editionId; },
    _list: function () { return translations; },
    _setList: function (l) { translations = l; syncLabel(); }
  };
})();
