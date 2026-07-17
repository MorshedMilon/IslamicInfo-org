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

  // ---- two-level floating picker (appended to <body> so no ancestor clip affects it) ----
  // Level 1: search box + language list (English first). Hover/tap a language →
  // Level 2: a submenu (separate float) listing that language's translators.
  // When search is non-empty, level 1 becomes a flat filtered translator list.
  var floatPicker = null, searchInput = null, listWrap = null;
  var subPicker = null, subList = null, closeTimer = null, openLang = null;

  function makeOpt(tr) {
    var opt = document.createElement('div');
    opt.className = 'reciter-opt' + (tr.id === editionId ? ' on' : '');
    if (tr.dir === 'rtl') opt.setAttribute('dir', 'rtl');
    var dot = document.createElement('div'); dot.className = 'reciter-opt-dot'; opt.appendChild(dot);
    opt.appendChild(document.createTextNode(tr.name));
    opt.addEventListener('click', function (e) { if (e && e.stopPropagation) e.stopPropagation(); window.selectTranslation(tr.id); });
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
  function getSubPicker() {
    if (!subPicker) {
      subPicker = document.createElement('div');
      subPicker.className = 'reciter-picker translation-picker translation-subpicker';
      subPicker.id = 'translationSubPicker';
      subPicker.style.cssText = 'position:fixed;bottom:auto;right:auto;z-index:10000;display:none;';
      subList = document.createElement('div'); subList.className = 'tp-list';
      subPicker.appendChild(subList);
      subPicker.addEventListener('mouseenter', cancelClose);
      subPicker.addEventListener('mouseleave', scheduleClose);
      (document.body || document.documentElement).appendChild(subPicker);
    }
    return subPicker;
  }
  function hideSub() { if (subPicker) { subPicker.style.display = 'none'; openLang = null; } }
  function cancelClose() { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } }
  function scheduleClose() { cancelClose(); closeTimer = setTimeout(hideSub, 180); }
  function hideFloatPicker() { hideSub(); if (floatPicker) { floatPicker.style.display = 'none'; floatPicker._anchor = null; } }

  function openSub(group, rowEl) {
    cancelClose();
    getSubPicker();
    if (openLang === group.language && subPicker.style.display === 'block') return;
    openLang = group.language;
    subList.innerHTML = '';
    // order by curated popularity then the rest, so the submenu reads best-first
    var ordered = core.pickCompareSet(group.items, group.language, group.items.length);
    ordered.forEach(function (tr) { subList.appendChild(makeOpt(tr)); });
    subPicker.style.display = 'block';
    positionSub(rowEl);
  }
  function positionSub(rowEl) {
    var vw = window.innerWidth || 360, vh = window.innerHeight || 640;
    var fr = floatPicker.getBoundingClientRect();
    var rr = rowEl.getBoundingClientRect();
    var sw = subPicker.offsetWidth || 240, sh = subPicker.offsetHeight || 300;
    var left = fr.right + 4;
    if (left + sw > vw - 8) left = Math.max(8, fr.left - sw - 4); // flip left if no room
    var top = Math.max(8, Math.min(rr.top, vh - sh - 8));
    subPicker.style.left = left + 'px';
    subPicker.style.top = top + 'px';
  }

  function renderList() {
    getFloatPicker();
    hideSub();
    listWrap.innerHTML = '';
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
    // language list (level 1)
    var groups = core.groupTranslationsByLanguage(translations);
    groups.forEach(function (g) {
      var hasCurrent = g.items.some(function (t) { return t.id === editionId; });
      var row = document.createElement('div');
      row.className = 'tp-lang' + (hasCurrent ? ' on' : '');
      row.setAttribute('data-lang', g.language);
      var name = document.createElement('span'); name.className = 'tp-lang-name'; name.textContent = g.languageLabel;
      var count = document.createElement('span'); count.className = 'tp-lang-count'; count.textContent = String(g.items.length);
      var chev = document.createElement('span'); chev.className = 'tp-lang-chev'; chev.textContent = '›';
      row.appendChild(name); row.appendChild(count); row.appendChild(chev);
      row.addEventListener('mouseenter', function () { openSub(g, row); });
      row.addEventListener('mouseleave', scheduleClose);
      row.addEventListener('click', function (e) {
        e.stopPropagation();
        if (openLang === g.language && subPicker && subPicker.style.display === 'block') hideSub();
        else openSub(g, row);
      });
      listWrap.appendChild(row);
    });
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
    syncLabel();
    hideFloatPicker();
    toast('Translation: ' + shortLabel(tid));
    if (window.loadSurah) window.loadSurah(window.currentSurahId || 1);   // re-fetch verses in the chosen edition
  };

  function syncLabel() {
    var el = document.getElementById('translationLabelTop');
    if (el) el.textContent = shortLabel(editionId);
  }

  // Close on outside click. Trigger button re-toggles itself; search stops propagation.
  document.addEventListener('click', function (e) {
    if (!floatPicker || floatPicker.style.display !== 'block') return;
    if (e.target && e.target.closest && (e.target.closest('#translationFloatPicker') ||
        e.target.closest('#translationSubPicker') || e.target.closest('#translationBtnTop'))) return;
    hideFloatPicker();
  });

  function init() {
    if (!core) return;
    try { var saved = Number(localStorage.getItem('ii-quran-translation')); if (saved > 0) editionId = saved; } catch (e) {}
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
