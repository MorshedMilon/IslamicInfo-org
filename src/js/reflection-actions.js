/* IslamicInfo.org — reflection-actions.js
   Daily Reflection card actions: Bookmark · Note · Share (branded PNG).
   Self-contained (injects its own CSS + share modal) so it runs on BOTH the
   home page and the Quran page despite their different card markup.
   Depends on: window.II.reflActionsCore, window.II.shareCore. */
(function () {
  'use strict';

  var core = window.II && window.II.reflActionsCore;
  var shareCore = window.II && window.II.shareCore;
  if (!core || !shareCore) return;

  var BM_KEY = 'ii-refl-bookmarks', NOTE_KEY = 'ii-refl-notes';
  var SITE = 'https://islamicinfo.org';

  function read(k) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : []; } catch (e) { return []; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function now() { try { return Date.now(); } catch (e) { return 0; } }
  function toast(m) { if (window.showToast) window.showToast(m); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function todayStr() {
    try { return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return ''; }
  }

  var SVG = {
    book: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
    share: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    note: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
  };

  // ---- read a card's current content from its data-refl hooks ----
  function cardData(card) {
    var type = card.getAttribute('data-refl-card');
    function q(sel) { var e = card.querySelector(sel); return e ? (e.textContent || '').trim() : ''; }
    var ref = q('[data-refl="ref"]');
    return { type: type, arabic: q('[data-refl="arabic"]'), text: q('[data-refl="text"]'),
             ref: ref, grade: q('[data-refl="grade"]'), id: core.reflId(type, ref) };
  }

  // ═══ CSS ═══
  function injectCSS() {
    if (document.getElementById('ii-refl-actions-css')) return;
    var s = document.createElement('style'); s.id = 'ii-refl-actions-css';
    s.textContent = [
      '.refl-actions{display:flex;gap:6px;justify-content:flex-end;align-items:center;margin-top:14px;padding-top:11px;border-top:.5px solid rgba(0,105,110,.09);}',
      '[data-refl-card] .head .icon-btn{display:none;}',   // hide the home page placeholder icons
      '.refl-act-btn{width:33px;height:33px;border-radius:9px;border:.5px solid var(--ink-faint,rgba(0,0,0,.12));background:transparent;color:var(--ink-muted);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background .15s,color .15s,border-color .15s;}',
      '.refl-act-btn:hover{border-color:var(--teal-400);color:var(--teal-700);background:var(--teal-50,rgba(0,105,110,.06));}',
      '.refl-act-btn.on{color:var(--gold-600,#a9812f);border-color:var(--gold-300,rgba(197,160,89,.5));background:var(--gold-50,rgba(197,160,89,.10));}',
      '.refl-act-btn.on svg{fill:currentColor;}',
      '.refl-act-note.has-note{color:var(--teal-700);border-color:var(--teal-300,rgba(0,105,110,.4));background:var(--teal-50,rgba(0,105,110,.06));}',
      '.refl-note-editor{display:none;margin-top:11px;}',
      '.refl-note-editor.open{display:block;}',
      '.refl-note-editor textarea{width:100%;box-sizing:border-box;min-height:66px;resize:vertical;border:.5px solid var(--teal-200,rgba(0,105,110,.25));border-radius:10px;padding:9px 11px;font-family:var(--font-body);font-size:13px;line-height:1.5;color:var(--ink-primary);background:rgba(0,105,110,.03);outline:none;}',
      '.refl-note-editor textarea:focus{border-color:var(--teal-500);}',
      '.refl-note-row{display:flex;justify-content:flex-end;gap:8px;margin-top:7px;}',
      '.refl-note-save{font-family:var(--font-body);font-size:12px;font-weight:600;color:#fff;background:var(--teal-700);border:none;border-radius:9px;padding:6px 15px;cursor:pointer;}',
      '.refl-note-save:hover{background:var(--teal-800);}',
      // share modal
      '.refl-share-modal{position:fixed;inset:0;z-index:3000;display:none;align-items:center;justify-content:center;background:rgba(6,20,21,.62);padding:16px;}',
      '.refl-share-modal.open{display:flex;}',
      '.refl-share-box{background:var(--surface,#fff);border-radius:18px;max-width:440px;width:100%;max-height:92vh;overflow-y:auto;padding:16px;box-shadow:0 24px 64px rgba(0,0,0,.42);}',
      '[data-theme="dark"] .refl-share-box{background:#0f1b1d;}',
      '.refl-share-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px;font-family:var(--font-display);font-size:17px;font-weight:500;color:var(--ink-primary);}',
      '.refl-share-close{border:none;background:transparent;font-size:19px;line-height:1;color:var(--ink-muted);cursor:pointer;}',
      '.refl-share-fmt{display:flex;gap:8px;margin-bottom:13px;}',
      '.refl-share-fmt button{flex:1;font-family:var(--font-body);font-size:12.5px;font-weight:600;padding:8px;border-radius:10px;border:.5px solid var(--teal-200,rgba(0,105,110,.25));background:transparent;color:var(--teal-700);cursor:pointer;}',
      '.refl-share-fmt button.on{background:var(--teal-700);color:#fff;border-color:var(--teal-700);}',
      '.refl-share-preview{display:flex;justify-content:center;align-items:center;min-height:180px;margin-bottom:14px;}',
      '.refl-share-preview canvas{max-width:100%;max-height:54vh;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.30);}',
      '.refl-share-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;}',
      '.refl-share-acts button{font-family:var(--font-body);font-size:12.5px;font-weight:600;padding:11px;border-radius:10px;border:.5px solid var(--teal-200,rgba(0,105,110,.25));background:transparent;color:var(--teal-700);cursor:pointer;}',
      '.refl-share-acts .refl-dl{background:var(--teal-700);color:#fff;border-color:var(--teal-700);grid-column:1/-1;}',
      '.refl-share-acts button:hover{border-color:var(--teal-500);}',
      // dated heading + Saved button
      '.refl-date{color:var(--gold-600,#a9812f);font-weight:500;}',
      '.refl-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:1200px;margin:0 auto 16px;padding:0 4px;flex-wrap:wrap;}',
      '.refl-bar-date{font-family:var(--font-body);font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--teal-700);}',
      '.refl-saved-btn{font-family:var(--font-body);font-size:12px;font-weight:600;color:var(--teal-700);background:transparent;border:.5px solid var(--teal-200,rgba(0,105,110,.25));border-radius:20px;padding:6px 14px;cursor:pointer;transition:all .15s;white-space:nowrap;}',
      '.refl-saved-btn:hover{background:var(--teal-50,rgba(0,105,110,.06));border-color:var(--teal-400);}',
      '.trio-hdr .refl-saved-btn{margin-left:12px;}',
      // saved modal
      '.refl-saved-modal{position:fixed;inset:0;z-index:2900;display:none;align-items:center;justify-content:center;background:rgba(6,20,21,.62);padding:16px;}',
      '.refl-saved-modal.open{display:flex;}',
      '.refl-saved-box{background:var(--surface,#fff);border-radius:18px;max-width:460px;width:100%;max-height:88vh;display:flex;flex-direction:column;padding:16px;box-shadow:0 24px 64px rgba(0,0,0,.42);}',
      '[data-theme="dark"] .refl-saved-box{background:#0f1b1d;}',
      '.refl-saved-close{border:none;background:transparent;font-size:19px;line-height:1;color:var(--ink-muted);cursor:pointer;}',
      '.refl-saved-list{overflow-y:auto;margin-top:6px;}',
      '.refl-saved-empty{padding:30px 12px;text-align:center;color:var(--ink-subtle);font-size:13px;font-family:var(--font-body);line-height:1.6;}',
      '.refl-saved-item{padding:13px 0;border-top:.5px solid rgba(0,105,110,.10);}',
      '.refl-saved-item:first-child{border-top:none;}',
      '.refl-saved-type{font-family:var(--font-body);font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--gold-700,#8a6a2f);margin-bottom:6px;}',
      '.refl-saved-ar{font-family:var(--font-arabic);font-size:16px;color:var(--ink-primary);text-align:right;line-height:1.8;margin-bottom:5px;}',
      '.refl-saved-text{font-family:var(--font-display);font-style:italic;font-size:14px;color:var(--ink-muted);line-height:1.5;margin-bottom:5px;}',
      '.refl-saved-ref{font-family:var(--font-mono);font-size:11px;color:var(--ink-subtle);}',
      '.refl-saved-note{margin-top:7px;padding:8px 10px;background:rgba(0,105,110,.05);border-radius:9px;font-family:var(--font-body);font-size:12px;color:var(--ink-muted);line-height:1.5;}',
      '.refl-saved-acts{display:flex;gap:8px;margin-top:9px;}',
      '.refl-saved-acts button{font-family:var(--font-body);font-size:12px;font-weight:600;padding:6px 14px;border-radius:9px;border:.5px solid var(--teal-200,rgba(0,105,110,.25));background:transparent;color:var(--teal-700);cursor:pointer;}',
      '.refl-saved-acts .refl-saved-share{background:var(--teal-700);color:#fff;border-color:var(--teal-700);}',
      '.refl-saved-acts .refl-saved-remove:hover{border-color:var(--gold-500,#c5a059);color:var(--gold-700,#8a6a2f);}'
    ].join('');
    document.head.appendChild(s);
  }

  // ═══ Actions row + note editor ═══
  function buildActions(card) {
    if (card._reflWired) return; card._reflWired = true;
    var row = el('div', 'refl-actions');
    var bBook = el('button', 'refl-act-btn refl-act-book', SVG.book); bBook.type = 'button'; bBook.title = 'Save reflection'; bBook.setAttribute('aria-label', 'Save reflection');
    var bShare = el('button', 'refl-act-btn refl-act-share', SVG.share); bShare.type = 'button'; bShare.title = 'Share as image'; bShare.setAttribute('aria-label', 'Share reflection');
    var bNote = el('button', 'refl-act-btn refl-act-note', SVG.note); bNote.type = 'button'; bNote.title = 'Add a personal note'; bNote.setAttribute('aria-label', 'Add note');
    row.appendChild(bBook); row.appendChild(bShare); row.appendChild(bNote);

    var editor = el('div', 'refl-note-editor');
    var ta = el('textarea'); ta.setAttribute('placeholder', 'Write your reflection…'); ta.setAttribute('rownum', '3');
    var erow = el('div', 'refl-note-row');
    var save = el('button', 'refl-note-save', 'Save note'); save.type = 'button';
    erow.appendChild(save); editor.appendChild(ta); editor.appendChild(erow);

    card.appendChild(row); card.appendChild(editor);

    bBook.addEventListener('click', function () { toggleBookmark(card, bBook); });
    bShare.addEventListener('click', function () { openShare(card); });
    bNote.addEventListener('click', function () {
      var open = editor.classList.toggle('open');
      if (open) { var n = core.findNote(read(NOTE_KEY), cardData(card).id); ta.value = n ? n.text : ''; ta.focus(); }
    });
    save.addEventListener('click', function () { saveNote(card, ta, editor, bNote); });
  }

  function toggleBookmark(card, btnEl) {
    var d = cardData(card);
    var item = { id: d.id, type: d.type, ref: d.ref, arabic: d.arabic, text: d.text, grade: d.grade, savedAt: now() };
    var list = core.toggleSaved(read(BM_KEY), item);
    write(BM_KEY, list);
    var saved = core.isSaved(list, d.id);
    btnEl.classList.toggle('on', saved);
    updateSavedCounts();
    toast(saved ? 'Saved to your reflections ✦' : 'Removed from saved');
  }

  function saveNote(card, ta, editor, noteBtn) {
    var d = cardData(card);
    var list = core.upsertNote(read(NOTE_KEY), d.id, ta.value, now());
    write(NOTE_KEY, list);
    var has = !!core.findNote(list, d.id);
    noteBtn.classList.toggle('has-note', has);
    editor.classList.remove('open');
    toast(has ? 'Note saved ✦' : 'Note cleared');
  }

  function sync(card) {
    var d = cardData(card);
    var b = card.querySelector('.refl-act-book'); if (b) b.classList.toggle('on', core.isSaved(read(BM_KEY), d.id));
    var n = card.querySelector('.refl-act-note'); if (n) n.classList.toggle('has-note', !!core.findNote(read(NOTE_KEY), d.id));
  }

  // ═══ Branded PNG ═══
  // Mixed-case, two-tone brand wordmark centered at (W/2, y). Mixed case + no letter-spacing
  // keeps the word silhouette readable; the colour break falls on the word break (Islamic|Info)
  // to reinforce the two-word read and draw the eye to the brand.
  function drawWordmark(ctx, T, W, y, size) {
    var segs = [
      { t: 'Islamic', c: T.white95 },
      { t: 'Info',    c: T.gold },
      { t: '.org',    c: T.white80 }
    ];
    ctx.font = '700 ' + Math.round(size || W * 0.033) + 'px ' + T.fontDisplay;
    ctx.direction = 'ltr';
    var total = 0, i;
    for (i = 0; i < segs.length; i++) total += ctx.measureText(segs[i].t).width;
    var prevAlign = ctx.textAlign;
    ctx.textAlign = 'left';
    var x = W / 2 - total / 2;
    for (i = 0; i < segs.length; i++) {
      ctx.fillStyle = segs[i].c;
      ctx.fillText(segs[i].t, x, y);
      x += ctx.measureText(segs[i].t).width;
    }
    ctx.textAlign = prevAlign;
  }
  function drawCard(ctx, m, d) {
    var T = shareCore.TOKENS, W = d.w, H = d.h, cx = W / 2, pad = W * 0.11, maxW = W - pad * 2;
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, T.bgTop); g.addColorStop(1, T.bgBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var r1 = ctx.createRadialGradient(W * 0.2, H * 0.28, 0, W * 0.2, H * 0.28, W * 0.85);
    r1.addColorStop(0, T.glowTeal); r1.addColorStop(1, T.glowTeal0); ctx.fillStyle = r1; ctx.fillRect(0, 0, W, H);
    var r2 = ctx.createRadialGradient(W * 0.82, H * 0.18, 0, W * 0.82, H * 0.18, W * 0.7);
    r2.addColorStop(0, T.glowGold); r2.addColorStop(1, T.glowGold0); ctx.fillStyle = r2; ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center'; ctx.direction = 'ltr';

    // ── One vertically-centered stack, auto-fit to the canvas ──────────────────
    // wordmark → eyebrow → label → Arabic → divider → translation → reference are
    // laid out as ONE group centered in the card. On the tall Story card this fills
    // the former empty bands and pulls the brand wordmark + citation toward the
    // middle (so both survive a social preview's center-crop); the wordmark is still
    // drawn first / on top. If the group is taller than the canvas (long text on the
    // square card), every measure is scaled down by one factor so nothing overflows
    // or overlaps and the citation is never cut off.
    var arMult = 1.92, enMult = 1.62;
    var wmSize = W * 0.049, hdrSize = W * 0.023, lblSize = W * 0.037, refSize = W * 0.026;
    var arSize = W * 0.058, enSize = W * 0.036, divGap = W * 0.045;
    var gWM = W * 0.040, gHdr = W * 0.044, gLbl = W * 0.066, gEn = W * 0.066;

    ctx.font = Math.round(arSize) + 'px ' + T.fontArabic;
    var arLines = shareCore.wrapText(m.arabic, maxW, function (s) { return ctx.measureText(s).width; });
    ctx.font = 'italic ' + Math.round(enSize) + 'px ' + T.fontDisplay;
    var enText = '“' + shareCore.stripQuotes(m.text) + '”';
    var enLines = shareCore.wrapText(enText, maxW, function (s) { return ctx.measureText(s).width; });
    var refLine = m.ref + (m.grade ? '  ·  ' + String(m.grade).replace(/^✓\s*/, '') : '');

    function groupHeight() {
      return wmSize + gWM + hdrSize + gHdr + lblSize + gLbl + arSize
        + arLines.length * arSize * arMult + divGap * 2 + enSize
        + enLines.length * enSize * enMult + gEn + refSize;
    }
    var fit = (H * 0.90) / groupHeight();
    if (fit < 1) {   // scale the whole stack down uniformly so it fits (long text)
      wmSize *= fit; hdrSize *= fit; lblSize *= fit; refSize *= fit;
      arSize *= fit; enSize *= fit; divGap *= fit;
      gWM *= fit; gHdr *= fit; gLbl *= fit; gEn *= fit;
    }
    wmSize = Math.round(wmSize); hdrSize = Math.round(hdrSize); lblSize = Math.round(lblSize);
    refSize = Math.round(refSize); arSize = Math.round(arSize); enSize = Math.round(enSize);
    var arLH = arSize * arMult, enLH = enSize * enMult;

    var y = Math.max(H * 0.05, (H - groupHeight()) / 2);
    // brand wordmark (first / top of the group)
    y += wmSize;
    drawWordmark(ctx, T, W, y, wmSize);
    // eyebrow: TODAY'S REFLECTION · date
    y += gWM + hdrSize;
    ctx.fillStyle = T.white40; ctx.font = '600 ' + hdrSize + 'px ' + T.fontMono; ctx.direction = 'ltr';
    ctx.fillText(('TODAY’S REFLECTION' + (m.dateStr ? '  ·  ' + m.dateStr : '')).toUpperCase(), cx, y);
    // type label (gold)
    y += gHdr + lblSize;
    ctx.fillStyle = T.gold; ctx.font = '600 ' + lblSize + 'px ' + T.fontDisplay;
    ctx.fillText(m.label, cx, y);
    // arabic
    y += gLbl + arSize;
    ctx.direction = 'rtl'; ctx.fillStyle = T.white95; ctx.font = arSize + 'px ' + T.fontArabic;
    arLines.forEach(function (ln, i) { ctx.fillText(ln, cx, y); if (i < arLines.length - 1) y += arLH; });
    // divider
    y += arLH + divGap; ctx.strokeStyle = T.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - W * 0.028, y); ctx.lineTo(cx + W * 0.028, y); ctx.stroke();
    // translation
    y += divGap + enSize;
    ctx.direction = 'ltr'; ctx.fillStyle = T.white80; ctx.font = 'italic ' + enSize + 'px ' + T.fontDisplay;
    enLines.forEach(function (ln, i) { ctx.fillText(ln, cx, y); if (i < enLines.length - 1) y += enLH; });
    // reference (+ grade for hadith)
    y += enLH + gEn + refSize;
    ctx.fillStyle = T.white80; ctx.font = refSize + 'px ' + T.fontMono; ctx.direction = 'ltr';
    ctx.fillText(refLine, cx, y);
  }

  function ensureFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var fams = ['20px Amiri', 'italic 20px "Cormorant Garamond"', '600 20px "Cormorant Garamond"', '700 20px "Cormorant Garamond"', '20px "JetBrains Mono"'];
    return Promise.all(fams.map(function (f) { try { return document.fonts.load(f); } catch (_) { return Promise.resolve(); } })).catch(function () {});
  }

  // ═══ Share modal ═══
  var modal, canvas, shareState = { model: null, fmt: 'square' };
  function injectModal() {
    if (modal) return;
    modal = el('div', 'refl-share-modal'); modal.id = 'reflShareModal';
    modal.innerHTML =
      '<div class="refl-share-box" role="dialog" aria-label="Share reflection">' +
      '<div class="refl-share-topbar"><span>Share Reflection</span><button class="refl-share-close" type="button" aria-label="Close">✕</button></div>' +
      '<div class="refl-share-fmt"><button type="button" data-fmt="square" class="on">Square</button><button type="button" data-fmt="story">Story</button></div>' +
      '<div class="refl-share-preview"><canvas id="reflShareCanvas"></canvas></div>' +
      '<div class="refl-share-acts">' +
        '<button class="refl-dl" type="button">⤓ Download PNG</button>' +
        '<button class="refl-native" type="button">Share</button>' +
        '<button class="refl-copy" type="button">Copy text</button>' +
        '<button class="refl-wa" type="button">WhatsApp</button>' +
        '<button class="refl-fb" type="button">Facebook</button>' +
        '<button class="refl-msgr" type="button">Messenger</button>' +
      '</div></div>';
    document.body.appendChild(modal);
    canvas = modal.querySelector('#reflShareCanvas');
    modal.addEventListener('click', function (e) { if (e.target === modal) closeShare(); });
    modal.querySelector('.refl-share-close').addEventListener('click', closeShare);
    modal.querySelectorAll('.refl-share-fmt button').forEach(function (b) {
      b.addEventListener('click', function () {
        modal.querySelectorAll('.refl-share-fmt button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on'); shareState.fmt = b.getAttribute('data-fmt'); render();
      });
    });
    modal.querySelector('.refl-dl').addEventListener('click', downloadPNG);
    modal.querySelector('.refl-native').addEventListener('click', shareNative);
    modal.querySelector('.refl-copy').addEventListener('click', copyText);
    modal.querySelector('.refl-wa').addEventListener('click', function () {
      window.open(shareCore.waHref(core.buildShareText(shareState.model, SITE)), '_blank');
    });
    modal.querySelector('.refl-fb').addEventListener('click', shareFacebook);
    modal.querySelector('.refl-msgr').addEventListener('click', shareMessenger);
  }

  // Facebook/Messenger can't carry the PNG or custom text through a share link — so we
  // copy the text (already contains the site link) + download the PNG (attach-ready) +
  // open the platform dialog with the link. Ordering matters: copy while the document
  // still has focus, then open the window synchronously (an async gap first would let the
  // popup blocker kill it), then run the async PNG download.
  function isMobileUA() {
    try {
      var uad = navigator.userAgentData;
      if (uad && typeof uad.mobile === 'boolean') return uad.mobile;
      return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    } catch (e) { return false; }
  }
  function copyShareText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).catch(function () {}); return; }
      var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t);
    } catch (e) {}
  }
  function shareToPlatform(href) {
    if (!shareState.model) return;
    var text = core.buildShareText(shareState.model, SITE);
    copyShareText(text);                       // 1. copy (with link) while focused
    window.open(href, '_blank', 'noopener');   // 2. open dialog in-gesture (no popup block)
    downloadPNG();                             // 3. save attach-ready image (async)
    toast('Image saved & text copied — attach the image in your post ✦');
  }
  function shareFacebook() { shareToPlatform(shareCore.fbSharerHref(SITE)); }
  function shareMessenger() { shareToPlatform(shareCore.messengerHref(SITE, isMobileUA())); }

  function render() {
    if (!shareState.model) return;
    var d = shareCore.dims(shareState.fmt);
    canvas.width = d.w; canvas.height = d.h;
    var ctx = canvas.getContext && canvas.getContext('2d'); if (!ctx) return;
    ensureFonts().then(function () { drawCard(ctx, shareState.model, d); });
  }

  function modelFor(src) {
    return { type: src.type, label: core.typeMeta(src.type).label, arabic: src.arabic,
             text: src.text, ref: src.ref, grade: src.grade, dateStr: todayStr() };
  }
  function openShareModel(model) {
    injectModal();
    shareState.model = model; shareState.fmt = 'square';
    modal.querySelectorAll('.refl-share-fmt button').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-fmt') === 'square'); });
    modal.classList.add('open');
    render();
  }
  function openShare(card) { openShareModel(modelFor(cardData(card))); }
  function closeShare() { if (modal) modal.classList.remove('open'); }

  function withBlob(cb) {
    if (!shareState.model) return;
    ensureFonts().then(function () {
      var d = shareCore.dims(shareState.fmt);
      var cv = document.createElement('canvas'); cv.width = d.w; cv.height = d.h;
      var ctx = cv.getContext && cv.getContext('2d');
      if (!ctx || !cv.toBlob) { toast('Image export not supported'); return; }
      drawCard(ctx, shareState.model, d);
      cv.toBlob(function (blob) { if (!blob) { toast('Could not create image'); return; } cb(blob); }, 'image/png');
    }).catch(function () { toast('Could not create image'); });
  }
  function filename() { return core.shareFilename(shareState.model.type, shareState.model.ref); }
  function downloadPNG() {
    withBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = filename();
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (_) {} }, 1000);
      toast('Image saved ✦');
    });
  }
  function shareNative() {
    var text = core.buildShareText(shareState.model, SITE);
    withBlob(function (blob) {
      var file = null;
      try { file = new File([blob], filename(), { type: 'image/png' }); } catch (_) {}
      if (navigator.share && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: text }).catch(function () {});
      } else if (navigator.share) {
        navigator.share({ text: text, url: SITE }).catch(function () {});
      } else { downloadPNG(); }
    });
  }
  function copyText() {
    var text = core.buildShareText(shareState.model, SITE);
    var done = function () { toast('Copied ✦'); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
      else { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(t); done(); }
    } catch (e) { done(); }
  }

  // ═══ Saved Reflections view ═══
  function cap(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var savedModal, savedListEl, savedBtns = [];
  function updateSavedCounts() {
    var n = read(BM_KEY).length;
    savedBtns.forEach(function (b) { b.textContent = '★ Saved' + (n ? ' (' + n + ')' : ''); });
  }
  function injectSavedModal() {
    if (savedModal) return;
    savedModal = el('div', 'refl-saved-modal'); savedModal.id = 'reflSavedModal';
    savedModal.innerHTML = '<div class="refl-saved-box" role="dialog" aria-label="Saved reflections">' +
      '<div class="refl-share-topbar"><span>Saved Reflections</span><button class="refl-saved-close" type="button" aria-label="Close">✕</button></div>' +
      '<div class="refl-saved-list"></div></div>';
    document.body.appendChild(savedModal);
    savedListEl = savedModal.querySelector('.refl-saved-list');
    savedModal.addEventListener('click', function (e) { if (e.target === savedModal) savedModal.classList.remove('open'); });
    savedModal.querySelector('.refl-saved-close').addEventListener('click', function () { savedModal.classList.remove('open'); });
  }
  function renderSaved() {
    var list = read(BM_KEY), notes = read(NOTE_KEY);
    savedListEl.innerHTML = '';
    if (!list.length) {
      savedListEl.appendChild(el('div', 'refl-saved-empty', 'No saved reflections yet.<br>Tap the bookmark on a card to save it here.'));
      return;
    }
    list.forEach(function (item) {
      var note = core.findNote(notes, item.id), m = core.typeMeta(item.type);
      var row = el('div', 'refl-saved-item',
        '<div class="refl-saved-type">' + m.emoji + ' ' + esc(m.label) + '</div>' +
        (item.arabic ? '<div class="refl-saved-ar" dir="rtl">' + esc(cap(item.arabic, 96)) + '</div>' : '') +
        '<div class="refl-saved-text">' + esc(cap(item.text, 170)) + '</div>' +
        '<div class="refl-saved-ref">' + esc(item.ref || '') + (item.grade ? ' · ' + esc(String(item.grade).replace(/^✓\s*/, '')) : '') + '</div>' +
        (note ? '<div class="refl-saved-note">📝 ' + esc(note.text) + '</div>' : ''));
      var acts = el('div', 'refl-saved-acts');
      var sh = el('button', 'refl-saved-share', 'Share'); sh.type = 'button';
      var rm = el('button', 'refl-saved-remove', 'Remove'); rm.type = 'button';
      sh.addEventListener('click', function () { openShareModel(modelFor(item)); });
      rm.addEventListener('click', function () { removeSaved(item.id); });
      acts.appendChild(sh); acts.appendChild(rm); row.appendChild(acts);
      savedListEl.appendChild(row);
    });
  }
  function removeSaved(id) {
    write(BM_KEY, read(BM_KEY).filter(function (x) { return x.id !== id; }));
    renderSaved();
    Array.prototype.forEach.call(document.querySelectorAll('[data-refl-card]'), sync);
    updateSavedCounts();
    toast('Removed from saved');
  }
  function openSaved() { injectSavedModal(); renderSaved(); savedModal.classList.add('open'); }

  // Dated heading ("Today's Reflection · <date>") + a Saved button, placed to suit
  // each page's markup (quran has a .trio-hdr/.trio-title; home does not).
  function injectSectionBar() {
    var grid = document.querySelector('.trio-grid'); if (!grid) return;
    var dateStr = todayStr();
    var title = document.querySelector('.trio-title');
    if (title && !title.querySelector('.refl-date')) title.appendChild(el('span', 'refl-date', ' · ' + dateStr));
    var savedBtn = el('button', 'refl-saved-btn'); savedBtn.type = 'button';
    savedBtn.addEventListener('click', openSaved); savedBtns.push(savedBtn);
    var hdr = document.querySelector('.trio-hdr');
    if (hdr) { hdr.appendChild(savedBtn); }
    else {
      var bar = el('div', 'refl-bar');
      bar.appendChild(el('span', 'refl-bar-date', 'Today’s Reflection · ' + dateStr));
      bar.appendChild(savedBtn);
      grid.parentNode.insertBefore(bar, grid);
    }
    updateSavedCounts();
  }

  // Per-card action link: page-appropriate label + real destination (no fabricated audio).
  var ACTION_LABEL = { verse: 'Read in context →', hadith: 'Read full hadith →', dua: 'Listen & reflect →' };
  function refineActionLabels() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-refl-card]'), function (card) {
      var t = card.getAttribute('data-refl-card'), a = card.querySelector('[data-refl="action"]');
      if (a && ACTION_LABEL[t]) { a.textContent = ACTION_LABEL[t]; a.removeAttribute('data-i18n'); }
    });
  }

  // ═══ init ═══
  function init() {
    injectCSS();
    injectSectionBar();
    refineActionLabels();
    var cards = document.querySelectorAll('[data-refl-card]');
    Array.prototype.forEach.call(cards, function (card) {
      buildActions(card); sync(card);
      if (window.MutationObserver) {
        new MutationObserver(function () { sync(card); }).observe(card, { subtree: true, childList: true, characterData: true });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.reflActions = { _draw: drawCard, _open: openShare, _sync: sync, _openSaved: openSaved };
})();
