/* Local mock of POST /api/quranlyai/ask for the demo harness. Streams SSE like the
   Worker. Run: node tools/quranly-ai-mock.mjs  (listens on http://localhost:8788) */
import http from 'node:http';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  if (req.method !== 'POST' || !req.url.endsWith('/api/quranlyai/ask')) {
    res.writeHead(404, CORS); return res.end('not found');
  }
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    let payload = {}; try { payload = JSON.parse(body); } catch (_) {}
    if (payload.userIdOrFingerprint === 'over-quota') {
      res.writeHead(429, { ...CORS, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ remaining: 0 }));
    }
    res.writeHead(200, { ...CORS, 'Content-Type': 'text/event-stream; charset=utf-8', 'X-Cache': 'MISS' });
    const chunks = [
      '**Answer**\nThis verse teaches reliance on Allah and patience. ',
      'It reminds the believer that help comes through steadfastness.\n\n',
      '**Key Lessons**\n- Trust in Allah\n- Patience in hardship\n\n',
      '**Sources**\n- Quran 2:255\n\n**Confidence**: High\n\n',
      '**Note**: Educational explanation only. Not a fatwa.'
    ];
    let i = 0;
    const tick = setInterval(() => {
      if (i < chunks.length) {
        res.write(`data: ${JSON.stringify({ delta: chunks[i++] })}\n\n`);
      } else {
        clearInterval(tick);
        res.write(`event: done\ndata: ${JSON.stringify({ sources: ['Quran 2:255'], confidence: 'High', model: 'mock', cached: false, remaining: 2 })}\n\n`);
        res.end();
      }
    }, 120);
  });
});
server.listen(8788, () => console.log('QuranlyAI mock on http://localhost:8788'));
