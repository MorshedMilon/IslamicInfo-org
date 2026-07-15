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

    current = { ar: String(ar || ''), en: core.stripQuotes(en), ref: ref, edition: edition, vk: vk, surahName: surahName || ref };
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
    });
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

  function init() {
    var dl = document.querySelector('.share-dl');
    var nat = document.querySelector('.share-native');
    if (dl) dl.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); downloadPNG(); });
    if (nat) nat.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); shareNative(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.quranShare = { _draw: drawShareCard, _model: function () { return current; }, downloadPNG: downloadPNG, shareNative: shareNative, _fmt: currentFmt };
})();
