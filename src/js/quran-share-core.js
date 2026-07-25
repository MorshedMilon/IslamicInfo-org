/* Module 5A — Share PNG pure core (DOM-free, UMD). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).shareCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function dims(fmt) { return fmt === 'story' ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 }; }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function slugFilename(surahName, verseKey) {
    return 'islamicinfo-' + slug(surahName) + '-' + String(verseKey || '').replace(/:/g, '-') + '.png';
  }
  function stripQuotes(s) { return String(s || '').replace(/^\s*["“”]+|["“”]+\s*$/g, '').trim(); }
  function editionFromAttr(attr) {
    var s = String(attr || ''); var i = s.indexOf('·');
    return (i === -1 ? s : s.slice(0, i)).trim();
  }
  function wrapText(text, maxWidth, measure) {
    var words = String(text == null ? '' : text).split(/\s+/).filter(Boolean);
    if (!words.length) return [''];
    var lines = [], line = words[0];
    for (var i = 1; i < words.length; i++) {
      var test = line + ' ' + words[i];
      if (measure(test) <= maxWidth) line = test;
      else { lines.push(line); line = words[i]; }
    }
    lines.push(line);
    return lines;
  }

  var TOKENS = {
    bgTop: '#004E55', bgBot: '#062628',
    glowTeal: 'rgba(0,105,110,0.30)', glowTeal0: 'rgba(0,105,110,0)',
    glowGold: 'rgba(197,160,89,0.20)', glowGold0: 'rgba(197,160,89,0)',
    gold: '#C5A059',
    white95: 'rgba(255,255,255,0.95)', white80: 'rgba(255,255,255,0.80)', white40: 'rgba(255,255,255,0.40)',
    fontDisplay: "'Cormorant Garamond', Georgia, serif",
    fontArabic: "'Amiri', serif",
    fontMono: "'JetBrains Mono', monospace"
  };

  function buildShareText(m, url) {
    m = m || {};
    var lines = [];
    if (m.ar) lines.push(String(m.ar));
    if (m.en) lines.push('"' + String(m.en) + '"');
    var attr = String(m.ref || '') + (m.edition ? ' (' + m.edition + ')' : '');
    if (attr.trim()) lines.push('— ' + attr);
    if (url) lines.push(String(url));
    return lines.join('\n');
  }
  function waHref(text) { return 'https://wa.me/?text=' + encodeURIComponent(String(text || '')); }
  function smsHref(text) { return 'sms:?&body=' + encodeURIComponent(String(text || '')); }

  // Facebook/Messenger share endpoints carry a LINK only (no image, no custom text):
  // Facebook scrapes its own preview from the linked page's Open Graph tags; Messenger's
  // web Send dialog needs a registered App ID we don't have, so only the mobile app deep
  // link is usable. The image + text are delivered by the caller (download PNG + copy text).
  function fbSharerHref(url) {
    return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(String(url || ''));
  }
  // mobile → open the Messenger app with the link; desktop → land on messenger.com (no
  // pre-fill possible), where the user picks a chat/group and pastes the copied text.
  function messengerHref(url, mobile) {
    return mobile
      ? 'fb-messenger://share?link=' + encodeURIComponent(String(url || ''))
      : 'https://www.messenger.com/';
  }

  return { dims: dims, slug: slug, slugFilename: slugFilename, stripQuotes: stripQuotes,
           editionFromAttr: editionFromAttr, wrapText: wrapText, TOKENS: TOKENS,
           buildShareText: buildShareText, waHref: waHref, smsHref: smsHref,
           fbSharerHref: fbSharerHref, messengerHref: messengerHref };
});
