// api.js - helper for Gemini API calls used by the AI assistant modal

/**
 * Sends a prompt to the Gemini model using the stored API key.
 * @param {string} systemPrompt The full prompt including system instruction and user question.
 * @returns {Promise<string>} The AI response text or an error message.
 */
async function callGemini(systemPrompt) {
  const key = localStorage.getItem('gemini_api_key');
  if (!key) {
    throw new Error('No Gemini API key configured.');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.error?.message || response.statusText;
    throw new Error(`API Error: ${msg}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";
}

window.callGemini = callGemini;
