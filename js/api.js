async function callGemini(prompt) {
  const key = localStorage.getItem('gemini_api_key');
  if (!key) throw new Error('No Gemini API key configured.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'API request failed.');
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  }
}

window.callGemini = callGemini;
