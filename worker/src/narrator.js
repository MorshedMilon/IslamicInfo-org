/* GET /api/narrator/:id — narrator reliability profile from the Itqan D1 (ADR-046/047).
   Client matches an English narrator name → Itqan id (curated map, narrator-match-core),
   then fetches the profile by id here. Graceful: if the D1 binding (env.DB_RIJAL) is not
   provisioned yet, or the id is absent, returns { ok:true, matched:false } — the client
   then shows "not yet verified". Serves REAL data verbatim; never fabricates. */
import { corsHeaders } from './lib/cors.js';

function json(body, origin, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',   // profiles are static
      ...corsHeaders(origin),
    },
  });
}

export async function handleNarrator(path, env, origin) {
  const m = path.match(/^\/api\/narrator\/(\d+)$/);
  if (!m) return json({ ok: false, error: 'bad_request' }, origin, 400);
  const id = Number(m[1]);

  if (!env || !env.DB_RIJAL) {
    // D1 not provisioned yet — feature is dark; never guess.
    return json({ ok: true, matched: false, disabled: true }, origin);
  }
  try {
    const row = await env.DB_RIJAL
      .prepare('SELECT id, full_name, kunya, grade_en, grade_ar, dhahabi, death, tabaqat, city, classical_sources, namings FROM narrators WHERE id = ?')
      .bind(id)
      .first();
    if (!row) return json({ ok: true, matched: false }, origin);
    // classical_sources / namings are stored as JSON strings.
    let sources = {}, namings = [];
    try { sources = JSON.parse(row.classical_sources || '{}'); } catch (_) {}
    try { namings = JSON.parse(row.namings || '[]'); } catch (_) {}
    return json({
      ok: true, matched: true,
      narrator: {
        id: row.id, full_name: row.full_name, kunya: row.kunya,
        grade_en: row.grade_en, grade_ar: row.grade_ar,
        dhahabi: row.dhahabi, death: row.death, tabaqat: row.tabaqat, city: row.city,
        classical_sources: sources, namings: namings,
      },
      source: 'Itqan Rijal Database',
    }, origin);
  } catch (e) {
    return json({ ok: true, matched: false, error: 'lookup_failed' }, origin);
  }
}
