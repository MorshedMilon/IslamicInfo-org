/* CORS + JSON response helpers (extracted from index.js — behavior identical). */
export const ALLOWED_ORIGINS = [
  'https://islamicinfo.org',
  'https://www.islamicinfo.org',
  'https://morshedmilon.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

export function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export function json(data, origin, { status = 200, maxAge = 0 } = {}) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders(origin),
  };
  if (maxAge > 0) headers['Cache-Control'] = `public, max-age=${maxAge}, s-maxage=${maxAge}`;
  return new Response(JSON.stringify(data), { status, headers });
}

export function err(message, origin, status = 502) {
  return json({ error: message }, origin, { status });
}
