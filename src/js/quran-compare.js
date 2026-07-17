/* IslamicInfo.org — quran-compare.js
   Compare mode (Task 7b): overrides the inline window.toggleCompare stub to show
   the top-3 popular translations in the current translation's language, side by
   side per ayah. Depends on: window.II.versesCore + window.II.translations. */
(function () {
  'use strict';

  var core = window.II && window.II.versesCore;
  var API = 'https://api.quran.com/api/v4/verses/by_chapter/';

  var compareOn = false;
  var gen = 0;                    // guards stale fetches
  var compareSurah = null;
  var applying = false;          // suppress the MutationObserver during our own DOM writes
  var cache = {};                // surah|ids -> verses (session)

  function tr() { return window.II && window.II.translations; }
  function toast(m) { if (window.showToast) window.showToast(m); }
  function compareBtn() { return document.getElementById('compareBtn'); }

  function fetchPage(surah, idStr, page) {
    var url = API + surah + '?language=en&translations=' + idStr + '&fields=text_uthmani&per_page=50&page=' + page;
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }
  function fetchCompare(surah, ids) {
    var key = surah + '|' + ids.join(',');
    if (cache[key]) return Promise.resolve(cache[key]);
    var idStr = ids.join(',');
    return fetchPage(surah, idStr, 1).then(function (first) {
      var total = (first.pagination && first.pagination.total_pages) || 1;
      var verses = (first.verses || []).slice();
      if (total <= 1) { cache[key] = verses; return verses; }
      var rest = []; for (var p = 2; p <= total; p++) rest.push(fetchPage(surah, idStr, p));
      return Promise.all(rest).then(function (pages) {
        pages.forEach(function (pg) { verses = verses.concat(pg.verses || []); });
        cache[key] = verses; return verses;
      });
    });
  }

  // Resolve the compare set (up to 3) for the current edition's language.
  function currentSet() {
    var T = tr();
    var edition = T ? T.current() : 20;
    var catalog = (T && T._list()) || [];
    var rec = catalog.filter(function (t) { return t.id === edition; })[0];
    var lang = rec ? rec.language : 'english';
    var set = core.pickCompareSet(catalog, lang, 3);
    if (!set.length) set = rec ? [rec] : [{ id: edition, name: (T ? T.name(edition) : 'Translation'), dir: (T ? T.dir(edition) : 'ltr') }];
    return set;
  }

  function populate(verses, set) {
    var ids = set.map(function (s) { return s.id; });
    var byKey = {};
    verses.forEach(function (v) { byKey[v.verse_key] = core.orderCompareTexts(v.translations, ids); });
    var blocks = document.querySelectorAll('#versesCardList .cmp-block');
    Array.prototype.forEach.call(blocks, function (block) {
      var vk = block.id.replace('cmp-', '').replace('-', ':');
      var texts = byKey[vk] || core.orderCompareTexts([], ids);
      block.innerHTML = '';
      set.forEach(function (rec, i) {
        var item = document.createElement('div');
        item.className = 'cmp-item' + (i === 0 ? ' pri' : '') + (rec.dir === 'rtl' ? ' rtl' : '');
        var name = document.createElement('div'); name.className = 'cmp-name';
        name.textContent = rec.name + (rec.languageLabel ? ' · ' + rec.languageLabel : '');
        var txt = document.createElement('div'); txt.className = 'cmp-text';
        var t = texts[i] && texts[i].text;
        txt.textContent = t ? '"' + t + '"' : '—';
        if (rec.dir === 'rtl') txt.setAttribute('dir', 'rtl');
        item.appendChild(name); item.appendChild(txt);
        block.appendChild(item);
      });
      if (set.length < 2) {
        var note = document.createElement('div'); note.className = 'cmp-note';
        note.textContent = 'Only ' + set.length + ' translation available in this language.';
        block.appendChild(note);
      }
    });
  }

  function showCompare() {
    Array.prototype.forEach.call(document.querySelectorAll('.cmp-block'), function (b) { b.classList.add('show'); });
    Array.prototype.forEach.call(document.querySelectorAll('.ayah-translation,.ayah-trans-attr'), function (t) { t.style.display = 'none'; });
  }
  function hideCompare() {
    Array.prototype.forEach.call(document.querySelectorAll('.cmp-block'), function (b) { b.classList.remove('show'); });
    Array.prototype.forEach.call(document.querySelectorAll('.ayah-translation,.ayah-trans-attr'), function (t) { t.style.display = ''; });
  }

  function refresh(btn) {
    var surah = window.currentSurahId || 1;
    var set = currentSet();
    var ids = set.map(function (s) { return s.id; });
    var myGen = ++gen;
    toast('Loading comparison…');
    fetchCompare(surah, ids).then(function (verses) {
      if (myGen !== gen || !compareOn) return;
      applying = true;
      compareSurah = surah;
      populate(verses, set);
      showCompare();
      applying = false;
      toast(set.length > 1 ? 'Comparing ' + set.length + ' translations' : 'Only 1 translation in this language');
    }).catch(function (e) {
      if (myGen !== gen) return;
      console.warn('[quran] compare fetch failed:', e && e.message);
      toast('Comparison unavailable — try again');
      compareOn = false;
      if (btn) btn.classList.remove('compare-active');
      hideCompare();
    });
  }

  window.toggleCompare = function (btn) {
    btn = btn || compareBtn();
    compareOn = !compareOn;
    if (btn) btn.classList.toggle('compare-active', compareOn);
    if (!compareOn) { applying = true; hideCompare(); applying = false; toast('Comparison mode off'); return; }
    refresh(btn);
  };

  // Re-apply compare after the verse list re-renders (surah change / cache revalidate).
  function initObserver() {
    var listEl = document.getElementById('versesCardList');
    if (!listEl || !window.MutationObserver) return;
    var timer = null;
    var mo = new MutationObserver(function () {
      if (!compareOn || applying) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        if (!compareOn) return;
        var first = listEl.querySelector('.cmp-block');
        // cards were rebuilt (empty compare blocks) → repopulate (cache avoids refetch on same surah)
        if (first && first.children.length === 0) refresh(compareBtn());
      }, 200);
    });
    mo.observe(listEl, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initObserver); else initObserver();

  window.II = window.II || {};
  window.II.quranCompare = {
    _state: function () { return { compareOn: compareOn, compareSurah: compareSurah }; },
    _set: currentSet
  };
})();
