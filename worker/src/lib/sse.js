/* Build an SSE Response that progressively renders already-safe text, then a
   terminal `done` event with metadata. The text is fully generated + filtered
   BEFORE this is called, so no unsafe token can ever be emitted. */
import { corsHeaders } from './cors.js';

const CHUNK_SIZE = 48;

function chunk(text) {
  const out = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) out.push(text.slice(i, i + CHUNK_SIZE));
  return out;
}

export function streamSafeText(text, meta, origin) {
  const enc = new TextEncoder();
  const chunks = chunk(String(text || ''));
  const stream = new ReadableStream({
    start(controller) {
      for (const c of chunks) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ delta: c })}\n\n`));
      }
      controller.enqueue(enc.encode(`event: done\ndata: ${JSON.stringify(meta)}\n\n`));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Cache': meta && meta.cached ? 'HIT' : 'MISS',
      ...corsHeaders(origin),
    },
  });
}
