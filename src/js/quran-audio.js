/* IslamicInfo.org — quran-audio.js
   Real <audio> engine (Module 3): per-ayah streaming, reciter picker, word-sync.
   Depends on: window.II.audioCore (quran-audio-core.js). Overrides the locked
   inline SYNC_DATA simulation globals. Data via pluggable AudioSource. */
(function () {
  'use strict';

  var core = window.II && window.II.audioCore;
  var RECITERS_URL = 'https://api.quran.com/api/v4/resources/recitations?language=en';
  var VERSES_URL   = 'https://api.quran.com/api/v4/verses/by_chapter/';
  var SEED_RECITERS = 'src/data/reciters.json';
  var SPEEDS = [1, 1.25, 1.5, 2];

  // ---- cache ----
  function readCache(k) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { try { localStorage.removeItem(k); } catch (_) {} return null; } }
  function writeCache(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---- pluggable source: Quran.com ----
  function QuranComAudioSource() {}
  QuranComAudioSource.prototype.listReciters = function () {
    var key = core.recitersCacheKey();
    var c = readCache(key);
    if (c && Array.isArray(c.data) && core.isFresh(c.fetchedAt, Date.now())) return Promise.resolve(c.data);
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(RECITERS_URL, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var list = (j.recitations || []).map(function (x) { return { id: x.id, name: x.reciter_name, style: x.style || '' }; });
        if (!list.length) throw new Error('empty');
        writeCache(key, { fetchedAt: Date.now(), data: list });
        return list;
      })
      .catch(function (e) {
        console.warn('[quran] reciters API failed, using seed:', e && e.message);
        return fetch(SEED_RECITERS).then(function (r) { return r.json(); });
      })
      .finally(function () { clearTimeout(t); });
  };
  QuranComAudioSource.prototype.getSurahAudio = function (reciterId, surahId) {
    var key = core.audioCacheKey(surahId, reciterId);
    var c = readCache(key);
    if (c && Array.isArray(c.ayahs) && core.isFresh(c.fetchedAt, Date.now())) return Promise.resolve(c.ayahs);
    return fetchPage(reciterId, surahId, 1).then(function (first) {
      var total = (first.pagination && first.pagination.total_pages) || 1;
      var verses = (first.verses || []).slice();
      if (total <= 1) return finish(key, verses);
      var rest = []; for (var p = 2; p <= total; p++) rest.push(fetchPage(reciterId, surahId, p));
      return Promise.all(rest).then(function (pages) { pages.forEach(function (pg) { verses = verses.concat(pg.verses || []); }); return finish(key, verses); });
    });
  };
  function fetchPage(reciterId, surahId, page) {
    var url = VERSES_URL + surahId + '?audio=' + reciterId + '&fields=text_uthmani&words=false&per_page=50&page=' + page;
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }
  function finish(key, verses) {
    var ayahs = verses.filter(function (v) { return v.audio; }).map(function (v) {
      return { verse_key: v.verse_key, url: core.normalizeAudioUrl(v.audio.url), segments: core.normalizeSegments(v.audio.segments) };
    });
    writeCache(key, { fetchedAt: Date.now(), ayahs: ayahs });
    return ayahs;
  }

  // ---- pluggable source: QUL (static-hosted timing JSON) ----
  var QUL_BASE = 'src/data/qul/';
  var qulCore = window.II && window.II.qulCore;
  var WEEK = 7 * 24 * 3600 * 1000;
  function QulAudioSource() {}
  QulAudioSource.prototype.listReciters = function () {
    var key = 'ii-qul-reciters';
    var c = readCache(key);
    if (c && Array.isArray(c.data) && core.isFresh(c.fetchedAt, Date.now(), WEEK)) return Promise.resolve(c.data);
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(QUL_BASE + 'reciters.json', { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (list) { list = Array.isArray(list) ? list : []; writeCache(key, { fetchedAt: Date.now(), data: list }); return list; })
      .catch(function () { return []; })
      .finally(function () { clearTimeout(t); });
  };
  QulAudioSource.prototype.getSurahAudio = function (reciterId, surahId) {
    var key = 'ii-qul-audio-' + reciterId + '-' + surahId;
    var c = readCache(key);
    if (c && Array.isArray(c.ayahs) && core.isFresh(c.fetchedAt, Date.now(), WEEK)) return Promise.resolve(c.ayahs);
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(QUL_BASE + reciterId + '/' + surahId + '.json', { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (ayahs) { ayahs = Array.isArray(ayahs) ? ayahs : []; writeCache(key, { fetchedAt: Date.now(), ayahs: ayahs }); return ayahs; })
      .catch(function () { return []; })
      .finally(function () { clearTimeout(t); });
  };

  // ---- composite: Quran.com + QUL ----
  function CompositeAudioSource(primary, qul) { this.primary = primary; this.qul = qul; }
  CompositeAudioSource.prototype.listReciters = function () {
    var p = this.primary.listReciters().catch(function () { return []; });
    var q = this.qul.listReciters().catch(function () { return []; });
    return Promise.all([p, q]).then(function (r) { return (r[0] || []).concat(r[1] || []); });
  };
  CompositeAudioSource.prototype.getSurahAudio = function (reciterId, surahId) {
    if (qulCore && qulCore.isQulId(reciterId)) return this.qul.getSurahAudio(reciterId, surahId);
    return this.primary.getSurahAudio(reciterId, surahId);
  };

  // ---- state ----
  var source = new CompositeAudioSource(new QuranComAudioSource(), new QulAudioSource());
  var audio = null, reciters = [], reciterId = 7;
  var loadedSurah = null, loadedReciter = null, ayahs = [], idx = 0;
  var repeat = false, autoplay = true, speedIdx = 0;
  var gen = 0;               // request generation — guards stale reciter/surah switches

  function $(s) { return document.querySelector(s); }
  function setText(sel, txt) { var el = $(sel); if (el) el.textContent = txt; }
  function toast(m) { if (window.showToast) window.showToast(m); }
  function reciterFull(id) { var r = reciters.filter(function (x) { return x.id === id; })[0]; return r ? r.name : ('Reciter ' + id); }
  function reciterStyled(id) { var r = reciters.filter(function (x) { return x.id === id; })[0]; return r ? (r.name + (r.style ? ' (' + r.style + ')' : '')) : ('Reciter ' + id); }
  function shortLabel(id) { var n = reciterFull(id); return n.length > 16 ? n.slice(0, 15) + '…' : n; }
  function cardFor(vk) { return document.getElementById('a-' + vk.replace(':', '-')); }
  function currentSurahFromDom() { var c = $('#versesCardList .ayah-card[data-key]'); return c ? Number(c.dataset.key.split(':')[0]) : null; }

  function getAudio() {
    if (!audio) {
      audio = document.createElement('audio'); audio.preload = 'none'; audio.style.display = 'none';
      document.body.appendChild(audio);
      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('loadedmetadata', onMeta);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      audio.addEventListener('play', function () { reflect(true); });
      audio.addEventListener('pause', function () { reflect(false); });
    }
    return audio;
  }

  function fetchSurah(surahId, ed) {
    if (loadedSurah === surahId && loadedReciter === ed && ayahs.length) return Promise.resolve(ayahs);
    return source.getSurahAudio(ed, surahId);
  }
  function applyFetched(surahId, ed, a) { ayahs = a; loadedSurah = surahId; loadedReciter = ed; }
  function playAt(i) {
    if (i < 0 || i >= ayahs.length) return;
    idx = i; var a = getAudio();
    a.src = ayahs[i].url; a.playbackRate = SPEEDS[speedIdx];
    var pr = a.play(); if (pr && pr.catch) pr.catch(function () {});
    markPlaying();
  }
  function playFromDom(start) {
    var s = currentSurahFromDom();
    if (!s) { toast('Loading surah…'); return; }
    var myGen = ++gen, ed = reciterId;
    fetchSurah(s, ed).then(function (a) {
      if (myGen !== gen) return;
      applyFetched(s, ed, a);
      if (ayahs.length) playAt(start || 0);
    }).catch(function (e) { if (myGen !== gen) return; console.warn('[quran] audio fetch failed:', e && e.message); toast('Audio unavailable — try again'); });
  }

  function clearHighlights() {
    Array.prototype.forEach.call(document.querySelectorAll('.ayah-card.ayah-playing'), function (c) { c.classList.remove('ayah-playing'); });
    Array.prototype.forEach.call(document.querySelectorAll('.wbw-word.word-active'), function (w) { w.classList.remove('word-active'); });
  }
  function markPlaying() {
    clearHighlights();
    var ay = ayahs[idx]; if (!ay) return;
    var card = cardFor(ay.verse_key);
    if (card) {
      card.classList.add('ayah-playing');
      var r = card.getBoundingClientRect();
      if (r.top < 80 || r.bottom > (window.innerHeight || 800)) { try { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }
    }
    var bc = document.getElementById('bcTitle'); if (bc) setText('#apSurah', bc.textContent);
    setText('#apReciterName', reciterStyled(reciterId));
    var badge = document.getElementById('nowPlayingBadge'); if (badge) badge.classList.add('show');
    setText('#nowPlayingText', 'Ayah ' + ay.verse_key.split(':')[1]);
  }
  function onTime() {
    if (!audio) return;
    if (audio.duration) { var f = document.getElementById('apFill'); if (f) f.style.width = ((audio.currentTime / audio.duration) * 100).toFixed(1) + '%'; }
    setText('#apTime', core.formatTime(audio.currentTime));
    var ay = ayahs[idx]; if (!ay || !ay.segments || !ay.segments.length) return;
    var w = core.activeWordAt(ay.segments, audio.currentTime * 1000);
    var card = cardFor(ay.verse_key); if (!card) return;
    var words = card.querySelectorAll('.wbw-row .wbw-word');
    Array.prototype.forEach.call(words, function (el, i) { el.classList.toggle('word-active', i === (w - 1)); });
  }
  function onMeta() { setText('#apDuration', core.formatTime(audio.duration)); }
  function onEnded() {
    if (repeat) { playAt(idx); return; }
    if (autoplay && idx < ayahs.length - 1) { playAt(idx + 1); return; }
    stop(); toast('End of Surah');
  }
  function onError() { toast('Audio unavailable for this ayah'); if (autoplay && idx < ayahs.length - 1) playAt(idx + 1); }
  function reflect(playing) {
    var ic = document.getElementById('apPlayIcon');
    if (ic) ic.innerHTML = playing ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>' : '<polygon points="5 3 19 12 5 21 5 3"/>';
    var lbl = document.getElementById('playLabel'); if (lbl) lbl.textContent = playing ? 'Pause' : 'Play Surah';
    var pb = document.getElementById('apPlayBtn'); if (pb) pb.classList.toggle('syncing', playing);
  }
  function stop() {
    if (audio) { audio.pause(); try { audio.removeAttribute('src'); audio.load(); } catch (e) {} }
    clearHighlights(); reflect(false);
    var badge = document.getElementById('nowPlayingBadge'); if (badge) badge.classList.remove('show');
    var f = document.getElementById('apFill'); if (f) f.style.width = '0%';
    setText('#apTime', '0:00');
  }

  // ---- overrides of locked inline globals ----
  window.masterPlayPause = function () {
    if (audio && !audio.paused) { audio.pause(); return; }
    if (audio && audio.src) { var pr = audio.play(); if (pr && pr.catch) pr.catch(function () {}); return; }
    playFromDom(0);
  };
  window.masterPlay = window.masterPlayPause;
  window.masterPause = function () { if (audio) audio.pause(); };
  window.masterStop = function () { gen++; loadedSurah = null; ayahs = []; idx = 0; stop(); };
  window.toggleAyahPlay = function (btn, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    var card = btn && btn.closest ? btn.closest('.ayah-card') : null;
    if (!card || !card.dataset.key) { playFromDom(0); return; }
    var vk = card.dataset.key, s = Number(vk.split(':')[0]);
    // same ayah already loaded → resume/pause in place (no src reset, no refetch)
    if (audio && audio.src && loadedSurah === s && ayahs[idx] && ayahs[idx].verse_key === vk) {
      if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); } else { audio.pause(); }
      return;
    }
    var myGen = ++gen, ed = reciterId;
    fetchSurah(s, ed).then(function (a) {
      if (myGen !== gen) return;
      applyFetched(s, ed, a);
      var i = ayahs.map(function (x) { return x.verse_key; }).indexOf(vk);
      if (i < 0) return;
      playAt(i);
    }).catch(function () { if (myGen !== gen) return; toast('Audio unavailable — try again'); });
  };
  window.skipAyah = function (dir) {
    if (!ayahs.length) { playFromDom(0); return; }
    playAt(Math.max(0, Math.min(ayahs.length - 1, idx + dir)));
  };
  window.scrubAudio = function (e, bar) {
    if (!audio || !audio.duration) return;
    var r = bar.getBoundingClientRect(); var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    audio.currentTime = p * audio.duration;
  };
  window.cycleSpeed = function () {
    speedIdx = (speedIdx + 1) % SPEEDS.length; if (audio) audio.playbackRate = SPEEDS[speedIdx];
    var b = document.getElementById('speedBtn'); if (b) b.textContent = SPEEDS[speedIdx] + '×';
  };
  window.toggleRepeat = function (btn) {
    repeat = !repeat; var b = btn || document.getElementById('repeatBtn'); if (b) b.classList.toggle('repeat-on', repeat);
    toast(repeat ? 'Repeat ayah on' : 'Repeat off');
  };
  window.selectReciter = function (id, el) {
    var rid = Number(id);
    if (!(rid > 0)) return;                       // ignore stale/invalid callers (e.g. old inline onclick)
    reciterId = rid;
    try { localStorage.setItem('ii-quran-reciter', String(reciterId)); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll('#reciterPicker .reciter-opt'), function (o) { o.classList.remove('on'); });
    if (el && el.classList) el.classList.add('on');
    setText('#reciterLabel', shortLabel(reciterId));
    setText('#apReciterName', reciterStyled(reciterId));
    var picker = document.getElementById('reciterPicker'); if (picker) picker.classList.remove('open');
    var wasPlaying = audio && !audio.paused, resumeIdx = idx, s = loadedSurah || currentSurahFromDom();
    var myGen = ++gen, ed = reciterId;
    loadedSurah = null; ayahs = [];
    if (s) fetchSurah(s, ed).then(function (a) {
      if (myGen !== gen) return;
      applyFetched(s, ed, a);
      if (wasPlaying && ayahs.length) playAt(Math.min(resumeIdx, ayahs.length - 1));
    }).catch(function () {});
    toast('Reciter: ' + shortLabel(reciterId));
  };
  if (typeof window.toggleReciterPicker !== 'function') {
    window.toggleReciterPicker = function () { var p = document.getElementById('reciterPicker'); if (p) p.classList.toggle('open'); };
  }

  // ---- reciter picker ----
  function populatePicker() {
    var picker = document.getElementById('reciterPicker'); if (!picker) return;
    picker.innerHTML = '';
    reciters.forEach(function (r) {
      var opt = document.createElement('div'); opt.className = 'reciter-opt' + (r.id === reciterId ? ' on' : '');
      var dot = document.createElement('div'); dot.className = 'reciter-opt-dot'; opt.appendChild(dot);
      opt.appendChild(document.createTextNode(r.name + (r.style ? ' (' + r.style + ')' : '')));
      opt.addEventListener('click', function () { window.selectReciter(r.id, opt); });
      picker.appendChild(opt);
    });
    setText('#reciterLabel', shortLabel(reciterId));
    setText('#apReciterName', reciterStyled(reciterId));
  }

  function init() {
    if (!core) return;
    try { var saved = Number(localStorage.getItem('ii-quran-reciter')); if (saved) reciterId = saved; } catch (e) {}
    source.listReciters().then(function (list) {
      reciters = list || [];
      if (!reciters.some(function (r) { return r.id === reciterId; }) && reciters[0]) reciterId = reciters[0].id;
      populatePicker();
    }).catch(function (e) { console.warn('[quran] reciters load failed:', e && e.message); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.quranAudio = {
    init: init, source: source,
    _audio: function () { return audio; },
    _state: function () { return { reciterId: reciterId, idx: idx, ayahs: ayahs, repeat: repeat, loadedSurah: loadedSurah }; },
    _setReciters: function (l) { reciters = l; populatePicker(); }
  };
})();
