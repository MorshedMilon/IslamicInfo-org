/* Buffered Anthropic Messages call. Returns { text, refusal } — the caller runs
   the safety filter on `text` before anything reaches the client. */

export async function callAnthropic(env, { model, system, userContent, maxTokens }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    if (!res.ok) throw new Error('anthropic HTTP ' + res.status);
    const data = await res.json();
    let text = '';
    if (data && Array.isArray(data.content)) {
      const tb = data.content.find((b) => b && b.type === 'text');
      if (tb) text = String(tb.text || '').trim();
    }
    return { text, refusal: data && data.stop_reason === 'refusal' };
  } finally {
    clearTimeout(t);
  }
}
