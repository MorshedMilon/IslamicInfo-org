/* Module 5A — Share PNG controller. Overrides inline openShareModal + wires Download/Share. */
(function () {
  'use strict';
  var core = (window.II && window.II.shareCore);
  if (!core) { console.warn('[quran-share] shareCore missing'); return; }
  var T = core.TOKENS;
  var current = null;

  function $(id) { return document.getElementById(id); }
  function toast(m) { if (typeof window.showToast === 'function') window.showToast(m); }

  function currentFmt() {
    var btns = document.querySelectorAll('.share-fmt button');
    for (var i = 0; i < btns.length; i++) { if (btns[i].classList.contains('on')) return i === 1 ? 'story' : 'square'; }
    return 'square';
  }

  // ---- override: attribution-correct open ----
  window.openShareModal = function (ar, en, ref) {
    ref = String(ref || '');
    var parts = ref.trim().split(/\s+/);
    var vk = parts[parts.length - 1] || '';
    var surahName = ref.replace(new RegExp('\\s*' + vk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$'), '').trim();
    var card = vk ? document.querySelector('.ayah-card[data-key="' + vk + '"]') : null;
    var attr = card ? ((card.querySelector('.ayah-trans-attr') || {}).textContent || '') : '';
    var edition = core.editionFromAttr(attr);

    if ($('shareAr')) $('shareAr').textContent = ar;
    if ($('shareEn')) $('shareEn').textContent = '"' + en + '"';
    if ($('shareRef')) $('shareRef').textContent = ref + (edition ? ' · ' + edition : '');

    current = { ar: String(ar || ''), en: String(en == null ? '' : en), ref: ref, edition: edition, vk: vk, surahName: surahName || ref };
    if ($('shareModal')) $('shareModal').classList.add('open');
  };

  // ---- canvas draw (recording-stub testable) ----
  function drawShareCard(ctx, m, d) {
    var W = d.w, H = d.h, cx = W / 2, pad = W * 0.11, maxW = W - pad * 2;

    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, T.bgTop); g.addColorStop(1, T.bgBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var r1 = ctx.createRadialGradient(W * 0.2, H * 0.3, 0, W * 0.2, H * 0.3, W * 0.8);
    r1.addColorStop(0, T.glowTeal); r1.addColorStop(1, T.glowTeal0);
    ctx.fillStyle = r1; ctx.fillRect(0, 0, W, H);
    var r2 = ctx.createRadialGradient(W * 0.8, H * 0.2, 0, W * 0.8, H * 0.2, W * 0.7);
    r2.addColorStop(0, T.glowGold); r2.addColorStop(1, T.glowGold0);
    ctx.fillStyle = r2; ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';

    // logo (top)
    ctx.direction = 'ltr'; ctx.fillStyle = T.white40;
    ctx.font = '600 ' + Math.round(W * 0.026) + 'px ' + T.fontDisplay;
    ctx.fillText('I S L A M I C I N F O . O R G', cx, H * 0.15);

    var arSize = Math.round(W * 0.062), arLH = arSize * 1.9;
    var enSize = Math.round(W * 0.038), enLH = enSize * 1.65;
    var divGap = W * 0.05, divH = 2;

    ctx.font = arSize + 'px ' + T.fontArabic;
    var arLines = core.wrapText(m.ar, maxW, function (s) { return ctx.measureText(s).width; });
    ctx.font = 'italic ' + enSize + 'px ' + T.fontDisplay;
    var enLines = core.wrapText('“' + m.en + '”', maxW, function (s) { return ctx.measureText(s).width; });

    var blockH = arLines.length * arLH + divGap * 2 + divH + enLines.length * enLH;
    var y = (H - blockH) / 2 + arSize;

    // arabic
    ctx.direction = 'rtl'; ctx.fillStyle = T.white95; ctx.font = arSize + 'px ' + T.fontArabic;
    for (var i = 0; i < arLines.length; i++) { ctx.fillText(arLines[i], cx, y); y += arLH; }

    // divider
    y += divGap;
    ctx.strokeStyle = T.gold; ctx.lineWidth = divH;
    ctx.beginPath(); ctx.moveTo(cx - W * 0.028, y); ctx.lineTo(cx + W * 0.028, y); ctx.stroke();
    y += divGap + enSize;

    // translation
    ctx.direction = 'ltr'; ctx.fillStyle = T.white80; ctx.font = 'italic ' + enSize + 'px ' + T.fontDisplay;
    for (var j = 0; j < enLines.length; j++) { ctx.fillText(enLines[j], cx, y); y += enLH; }

    // ref (bottom)
    ctx.fillStyle = T.white40; ctx.font = Math.round(W * 0.024) + 'px ' + T.fontMono;
    ctx.fillText(m.ref + (m.edition ? ' · ' + m.edition : ''), cx, H * 0.9);
  }

  function ensureFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var fams = ['20px Amiri', 'italic 20px "Cormorant Garamond"', '600 20px "Cormorant Garamond"', '20px "JetBrains Mono"'];
    return Promise.all(fams.map(function (f) { try { return document.fonts.load(f); } catch (_) { return Promise.resolve(); } })).catch(function () {});
  }

  function buildCanvas() {
    if (!current) return null;
    var d = core.dims(currentFmt());
    var cv = document.createElement('canvas'); cv.width = d.w; cv.height = d.h;
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return null;
    drawShareCard(ctx, current, d);
    return { cv: cv, filename: core.slugFilename(current.surahName, current.vk) };
  }

  function withBlob(cb) {
    if (!current) { toast('Open a verse to share'); return; }
    ensureFonts().then(function () {
      var built = buildCanvas();
      if (!built) { toast('Image export not supported on this browser'); return; }
      if (!built.cv.toBlob) { toast('Image export not supported on this browser'); return; }
      built.cv.toBlob(function (blob) {
        if (!blob) { toast('Could not create image'); return; }
        cb(blob, built.filename);
      }, 'image/png');
    }).catch(function () { toast('Could not create image'); });
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { try { URL.revokeObjectURL(url); } catch (_) {} }, 1000);
  }

  function downloadPNG() { withBlob(function (blob, filename) { downloadBlob(blob, filename); toast('Image saved'); }); }

  function shareNative() {
    withBlob(function (blob, filename) {
      try {
        var file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          navigator.share({ files: [file], title: 'IslamicInfo.org', text: current ? current.ref : '' })
            .catch(function (e) { if (!e || e.name !== 'AbortError') { downloadBlob(blob, filename); toast('Sharing not supported — image downloaded'); } });
          return;
        }
      } catch (_) {}
      downloadBlob(blob, filename); toast('Sharing not supported — image downloaded');
    });
  }

  // ---- inline monochrome icons (currentColor; NOT WhatsApp brand green) ----
  var SVG_WA = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3 5.3 5.3 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c2.3 1 2.3.7 2.7.6a2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.5-.4z"/></svg>';
  var SVG_SMS = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1-4.3A8.4 8.4 0 1 1 21 11.5z"/></svg>';
  var SVG_COPY = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  function shareUrl() {
    try {
      if (window.location.search && /[?&]surah=/.test(window.location.search)) return window.location.href;
      var sl = current ? core.slug(current.surahName || '') : '';
      return window.location.origin + window.location.pathname + (sl ? '?surah=' + sl : '');
    } catch (_) { return 'https://islamicinfo.org/quran.html'; }
  }

  function shareText() { return core.buildShareText(current, shareUrl()); }

  function openWA() { if (!current) { toast('Open a verse to share'); return; } window.open(core.waHref(shareText()), '_blank', 'noopener'); }
  function openSMS() { if (!current) { toast('Open a verse to share'); return; } window.open(core.smsHref(shareText()), '_blank'); }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea'); ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); toast('Copied');
    } catch (_) { toast('Could not copy'); }
  }
  function copyText() {
    if (!current) { toast('Open a verse to share'); return; }
    var text = shareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, function () { fallbackCopy(text); });
    } else { fallbackCopy(text); }
  }

  function mkQuickBtn(label, svg, handler) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sq-btn';
    b.innerHTML = svg + '<span>' + label + '</span>';
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); handler(); });
    return b;
  }
  function injectQuickRow() {
    var content = document.querySelector('.share-content');
    if (!content || document.querySelector('.share-quick')) return;
    var row = document.createElement('div'); row.className = 'share-fmt share-quick';
    row.appendChild(mkQuickBtn('WhatsApp', SVG_WA, openWA));
    row.appendChild(mkQuickBtn('SMS', SVG_SMS, openSMS));
    row.appendChild(mkQuickBtn('Copy', SVG_COPY, copyText));
    var acts = content.querySelector('.share-acts');
    if (acts && acts.nextSibling) content.insertBefore(row, acts.nextSibling);
    else content.appendChild(row);
  }

  function init() {
    var dl = document.querySelector('.share-dl');
    var nat = document.querySelector('.share-native');
    if (dl) { dl.removeAttribute('onclick'); dl.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); downloadPNG(); }); }
    if (nat) { nat.removeAttribute('onclick'); nat.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); shareNative(); }); }
    injectQuickRow();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.quranShare = { _draw: drawShareCard, _model: function () { return current; }, downloadPNG: downloadPNG, shareNative: shareNative, _fmt: currentFmt,
    openWA: openWA, openSMS: openSMS, copyText: copyText, _shareText: shareText };
})();
