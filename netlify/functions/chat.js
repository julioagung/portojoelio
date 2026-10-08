/* ===== /api/chat — proxy ke Gemini =====
   API key disimpan di environment variable Netlify (GEMINI_API_KEY),
   tidak pernah dikirim ke browser.
   ======================================== */

const KB = require('../../js/knowledge.js');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_TURNS = 12;
const MAX_CHARS = 800;

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method not allowed' });
  if (!process.env.GEMINI_API_KEY) return json(503, { error: 'ai offline' });

  let messages;
  try {
    ({ messages } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { error: 'bad json' });
  }
  if (!Array.isArray(messages) || !messages.length) return json(400, { error: 'no messages' });

  const contents = messages
    .slice(-MAX_TURNS)
    .filter(m => m && typeof m.text === 'string' && m.text.trim())
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text.slice(0, MAX_CHARS) }],
    }));
  // Gemini requires the conversation to start with a user turn
  while (contents.length && contents[0].role !== 'user') contents.shift();
  if (!contents.length) return json(400, { error: 'no user message' });

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: KB.systemPrompt() }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
      }),
    });
    if (!res.ok) return json(502, { error: 'upstream ' + res.status });
    const data = await res.json();
    const reply = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!reply) return json(502, { error: 'empty reply' });
    return json(200, { reply });
  } catch {
    return json(502, { error: 'upstream failed' });
  }
};
