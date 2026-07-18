/* Buffered Google Gemini generateContent call. Returns { text, refusal } — the same shape
   the old Anthropic call returned — so the caller runs the safety filter on `text` before
   anything reaches the client. The request/response shape mapping is isolated into two pure
   functions so it can be unit-tested without the network. */

const GEMINI_MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Gemini's own safety filters set permissive: our no-fatwa filter (safety.js) is the authority
// for religious content, and over-blocking legitimate Quran/Hadith text would break the feature.
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

export function buildGeminiBody({ system, userContent, maxTokens }) {
  return {
    system_instruction: { parts: [{ text: system || '' }] },
    contents: [{ role: 'user', parts: [{ text: userContent || '' }] }],
    // thinkingBudget 0 disables Gemini flash "thinking": reasoning tokens otherwise
    // consume maxOutputTokens and truncate the visible answer (finishReason MAX_TOKENS).
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 },
    },
    safetySettings: SAFETY_SETTINGS,
  };
}

export function parseGeminiResponse(data) {
  // No candidates => the prompt itself was blocked (data.promptFeedback.blockReason).
  if (!data || !Array.isArray(data.candidates) || !data.candidates.length) {
    return { text: '', refusal: true };
  }
  const cand = data.candidates[0];
  const reason = cand.finishReason;
  if (reason === 'SAFETY' || reason === 'RECITATION') return { text: '', refusal: true };
  const parts = (cand.content && Array.isArray(cand.content.parts)) ? cand.content.parts : [];
  const text = parts.map((p) => (p && typeof p.text === 'string' ? p.text : '')).join('').trim();
  if (!text) return { text: '', refusal: true };
  return { text, refusal: false }; // includes MAX_TOKENS-truncated text
}

export async function callGemini(env, { model, system, userContent, maxTokens }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${GEMINI_MODELS_URL}/${model}:generateContent`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY,
      },
      body: JSON.stringify(buildGeminiBody({ system, userContent, maxTokens })),
    });
    if (!res.ok) throw new Error('gemini HTTP ' + res.status);
    const data = await res.json();
    return parseGeminiResponse(data);
  } finally {
    clearTimeout(t);
  }
}
