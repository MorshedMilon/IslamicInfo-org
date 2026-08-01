/* Tiny static server for local review. Port 3000 ONLY — the Worker's CORS
   allowlist accepts localhost:3000, so any other port makes every /api call
   fail and the page renders "unavailable" for reasons that have nothing to do
   with the page.  Run:  node serve.mjs   Stop: Ctrl-C  */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const PORT = 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  // resolve inside ROOT — never serve outside the repo
  const file = path.resolve(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  fs.stat(file, (err, st) => {
    const target = (!err && st.isDirectory()) ? path.join(file, 'index.html') : file;
    fs.readFile(target, (e, buf) => {
      if (e) { res.writeHead(404, { 'content-type': 'text/plain' }).end('404 ' + p); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream' });
      res.end(buf);
    });
  });
}).listen(PORT, () => console.log('serving ' + ROOT + '  ->  http://localhost:' + PORT));
