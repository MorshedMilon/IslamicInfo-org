/* IslamicInfo.org — quran-tajweed-core.js
   Pure map from quran.com text_uthmani_tajweed classes to the site's 5 tj-* families. UMD. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.tajweedCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAP = {
    madda_normal: 'tj-madd', madda_permissible: 'tj-madd',
    madda_necessary: 'tj-madd', madda_necesary: 'tj-madd', madda_obligatory: 'tj-madd',
    ghunnah: 'tj-ghunna',
    ikhafa: 'tj-ikhfa', ikhafa_shafawi: 'tj-ikhfa',
    idgham_ghunnah: 'tj-idgham', idgham_wo_ghunnah: 'tj-idgham', idgham_shafawi: 'tj-idgham',
    idgham_mutajanisayn: 'tj-idgham', idgham_mutaqaribayn: 'tj-idgham', iqlab: 'tj-idgham',
    qalqalah: 'tj-qalqalah'
    /* ham_wasl, slnt, laam_shamsiyah, unknown -> '' (neutral) */
  };
  function mapClass(cls) { return MAP[String(cls || '').trim()] || ''; }

  // Rewrite tajweed markup -> <span class="tj-*">...</span> (or plain text if neutral).
  // Quran.com uses <tajweed class="X">…</tajweed> at verse level and <rule class=X>…</rule>
  // at word level (word_fields=text_uthmani_tajweed) — handle both, matching close via \1.
  function colorize(html) {
    return String(html == null ? '' : html).replace(
      /<(tajweed|rule)\s+class=(?:"([^"]*)"|'([^']*)'|([^\s>]+))\s*>([\s\S]*?)<\/\1>/gi,
      function (_, tag, a, b, c, inner) {
        var fam = mapClass(a || b || c);
        return fam ? '<span class="' + fam + '">' + inner + '</span>' : inner;
      });
  }

  return { mapClass: mapClass, colorize: colorize };
});
