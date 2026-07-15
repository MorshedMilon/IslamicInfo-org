/* IslamicInfo.org — quran-marks.js
   Bookmarks + Notes controller (Module 4). Overrides the locked inline demo
   globals; persists to localStorage; re-applies state on card re-render.
   Depends on: window.II.marksCore. */
(function () {
  'use strict';

  var core = window.II && window.II.marksCore;
  var BM_KEY = 'ii-quran-bookmarks', NOTE_KEY = 'ii-quran-notes';
  var bookmarks = readArr(BM_KEY), notes = readArr(NOTE_KEY);
  var activeCat = 'All';

  function readArr(k) { try { var r = localStorage.getItem(k); var a = r ? JSON.parse(r) : []; return Array.isArray(a) ? a : []; } catch (e) { try { localStorage.removeItem(k); } catch (_) {} return []; } }
  function saveArr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function toast(m) { if (window.showToast) window.showToast(m); }
  function keyId(vk) { return vk.replace(':', '-'); }
  function cardFor(vk) { return document.getElementById('a-' + keyId(vk)); }
  function currentSurahFromDom() { var c = document.querySelector('#versesCardList .ayah-card[data-key]'); return c ? Number(c.dataset.key.split(':')[0]) : null; }
  function surahNameFromDom() { var bc = document.getElementById('bcTitle'); return bc ? bc.textContent.split('·')[0].trim() : ''; }

  var BM_FILL = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';
  var BM_OUTLINE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';

  // ---- bookmarks ----
  window.toggleBookmark = function (btn, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    var card = btn && btn.closest ? btn.closest('.ayah-card') : null;
    if (!card || !card.dataset.key) return;
    var vk = card.dataset.key, parts = vk.split(':');
    var wasBm = core.isBookmarked(bookmarks, vk);
    var bm = {
      verseKey: vk, surahName: surahNameFromDom(), surahId: Number(parts[0]), ayahNo: Number(parts[1]),
      arabic: (card.querySelector('.ayah-arabic') || {}).textContent || '',
      translation: (card.querySelector('.ayah-translation') || {}).textContent || '',
      category: 'General', addedAt: Date.now()
    };
    bookmarks = core.toggleBookmark(bookmarks, bm);
    saveArr(BM_KEY, bookmarks);
    setBookmarkIcon(btn, !wasBm);
    toast(wasBm ? 'Bookmark removed' : 'Verse bookmarked');
    var panel = document.getElementById('bookmarksPanel');
    if (panel && panel.classList.contains('open')) renderPanel();
  };
  function setBookmarkIcon(btn, on) { btn.classList.toggle('bookmarked', on); btn.innerHTML = on ? BM_FILL : BM_OUTLINE; }

  // ---- panel ----
  window.toggleBookmarks = function () {
    var panel = document.getElementById('bookmarksPanel'); if (!panel) return;
    panel.classList.toggle('open');
    var settings = document.getElementById('settingsPanel'); if (settings) settings.classList.remove('open');
    if (panel.classList.contains('open')) renderPanel();
  };
  function renderPanel() {
    var listEl = document.querySelector('#bookmarksPanel .bp-list'); if (!listEl) return;
    listEl.innerHTML = '';
    var items = core.filterByCategory(bookmarks, activeCat).slice().sort(function (a, b) { return b.addedAt - a.addedAt; });
    if (!items.length) {
      var empty = document.createElement('div'); empty.className = 'bp-empty';
      empty.style.cssText = 'padding:24px 14px;font-size:13px;color:var(--ink-muted);';
      empty.textContent = 'No bookmarks yet — tap the bookmark icon on any verse.';
      listEl.appendChild(empty); return;
    }
    items.forEach(function (bm) {
      var it = document.createElement('div'); it.className = 'bp-item';
      var ar = document.createElement('div'); ar.className = 'bp-ar'; ar.textContent = bm.arabic;
      var en = document.createElement('div'); en.className = 'bp-en'; en.textContent = bm.translation;
      var meta = document.createElement('div'); meta.className = 'bp-meta';
      var ref = document.createElement('span'); ref.textContent = bm.surahName + ' ' + bm.verseKey;
      var tag = document.createElement('span'); tag.className = 'bp-tag'; tag.textContent = bm.category;
      meta.appendChild(ref); meta.appendChild(tag);
      it.appendChild(ar); it.appendChild(en); it.appendChild(meta);
      it.addEventListener('click', function () { jumpToVerse(bm); });
      listEl.appendChild(it);
    });
  }
  function wireChips() {
    Array.prototype.forEach.call(document.querySelectorAll('#bookmarksPanel .bp-cat'), function (chip) {
      chip.addEventListener('click', function () {
        var label = chip.textContent.trim();
        if (label.indexOf('New') !== -1) {
          // "+ New" deferred — undo any stray active-state and keep the current filter
          Array.prototype.forEach.call(document.querySelectorAll('#bookmarksPanel .bp-cat'), function (c) { c.classList.toggle('on', c.textContent.trim() === activeCat); });
          return;
        }
        activeCat = label;
        Array.prototype.forEach.call(document.querySelectorAll('#bookmarksPanel .bp-cat'), function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        renderPanel();
      });
    });
  }

  // ---- jump ----
  function scrollToCard(vk) {
    var card = cardFor(vk); if (!card) return false;
    try { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    card.classList.add('pulse-hl'); setTimeout(function () { card.classList.remove('pulse-hl'); }, 3800);
    return true;
  }
  function renderAllVerses() {
    if (window.II && window.II.quranVerses && window.II.quranVerses.renderAll) window.II.quranVerses.renderAll();
  }
  function jumpToVerse(bm) {
    var panel = document.getElementById('bookmarksPanel'); if (panel) panel.classList.remove('open');
    if (currentSurahFromDom() === bm.surahId) { renderAllVerses(); scrollToCard(bm.verseKey); return; }
    var row = document.querySelector('.surah-row[data-id="' + bm.surahId + '"]');
    if (row && window.selectSurah) { window.selectSurah(row); }
    else if (window.loadSurah) { window.loadSurah(bm.surahId); }
    var tries = 0, iv = setInterval(function () {
      tries++;
      if (currentSurahFromDom() === bm.surahId) { clearInterval(iv); renderAllVerses(); scrollToCard(bm.verseKey); }
      else if (tries > 60) { clearInterval(iv); }
    }, 50);
  }
  window.jumpTo = function (id) {
    var el = document.getElementById(id);
    if (el) { try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} el.classList.add('pulse-hl'); setTimeout(function () { el.classList.remove('pulse-hl'); }, 3800); }
    var p = document.getElementById('bookmarksPanel'); if (p) p.classList.remove('open');
  };

  // ---- notes ----
  window.toggleNote = function (id) {
    var ed = document.getElementById(id); if (!ed) return;
    var k = id.slice(2), vk = k.replace('-', ':');
    if (!ed.dataset.built) {
      var ta = document.createElement('textarea'); ta.className = 'note-input'; ta.setAttribute('maxlength', '2000'); ta.setAttribute('placeholder', 'Your reflection…');
      var acts = document.createElement('div'); acts.className = 'note-acts';
      var cancel = document.createElement('button'); cancel.className = 'note-cancel'; cancel.type = 'button'; cancel.textContent = 'Cancel';
      var save = document.createElement('button'); save.className = 'note-save'; save.type = 'button'; save.textContent = 'Save note';
      cancel.addEventListener('click', function () { ed.classList.remove('show'); });
      save.addEventListener('click', function () { window.saveNote(id, 'nbtn-' + k); });
      acts.appendChild(cancel); acts.appendChild(save);
      ed.appendChild(ta); ed.appendChild(acts);
      ed.dataset.built = '1';
    }
    var input = ed.querySelector('.note-input');
    if (input && !ed.classList.contains('show')) { var ex = core.findNote(notes, vk); input.value = ex ? ex.text : ''; }
    ed.classList.toggle('show');
    if (ed.classList.contains('show') && input) input.focus();
  };
  window.saveNote = function (editorId, btnId) {
    var ed = document.getElementById(editorId); if (!ed) return;
    var k = editorId.slice(2), vk = k.replace('-', ':');
    var input = ed.querySelector('.note-input');
    var text = core.capText(input ? input.value : '', 2000);
    var next = text ? core.upsertNote(notes, { verseKey: vk, text: text, updatedAt: Date.now() }) : core.removeNote(notes, vk);
    if (!saveArr(NOTE_KEY, next)) { toast('Storage full — couldn’t save'); return; } // keep editor open; no false success
    notes = next;
    ed.classList.remove('show');
    applyNoteState(vk, !!text);
    toast(text ? 'Note saved' : 'Note removed');
  };
  function applyNoteState(vk, hasNote) {
    var card = cardFor(vk); if (!card) return;
    var btn = document.getElementById('nbtn-' + keyId(vk));
    if (btn) btn.style.color = hasNote ? 'var(--gold-500)' : '';
    var badge = card.querySelector('.ayah-num-badge'); if (!badge) return;
    var dot = badge.querySelector('.ndot');
    if (hasNote && !dot) { var d = document.createElement('div'); d.className = 'ndot'; badge.appendChild(d); badge.style.position = 'relative'; }
    else if (!hasNote && dot) { dot.parentNode.removeChild(dot); }
  }

  // ---- re-apply on render ----
  function applyMarks(card) {
    if (!card || !card.dataset || !card.dataset.key) return;
    var vk = card.dataset.key;
    if (core.isBookmarked(bookmarks, vk)) {
      var btns = card.querySelectorAll('.ayah-actions .ayah-btn');
      if (btns[1]) setBookmarkIcon(btns[1], true);
    }
    if (core.findNote(notes, vk)) applyNoteState(vk, true);
  }
  function scanAll() { Array.prototype.forEach.call(document.querySelectorAll('#versesCardList .ayah-card'), applyMarks); }

  function init() {
    if (!core) return;
    wireChips();
    scanAll();
    var list = document.getElementById('versesCardList');
    if (list && window.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes || [], function (n) {
            if (n.nodeType !== 1) return;
            if (n.classList && n.classList.contains('ayah-card')) applyMarks(n);
            else if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll('.ayah-card'), applyMarks);
          });
        });
      });
      mo.observe(list, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.quranMarks = { _bookmarks: function () { return bookmarks; }, _notes: function () { return notes; }, renderPanel: renderPanel };
})();
