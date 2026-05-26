
const fetch = require('node-fetch');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ allowed: false, reason: 'No text provided' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a strict content moderator for Agora, a thoughtful text-only platform.
Evaluate the following text for:
- Hate speech, slurs, or discriminatory language
- Threats or incitement to violence
- Harassment or personal attacks
- Explicit or excessively graphic content
- Spam or nonsense

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{ "allowed": true } if the content is safe,
{ "allowed": false, "reason": "brief explanation" } if it violates guidelines.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    const result = data.choices[0].message.content.trim();
    const cleaned = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (e) {
    console.error('Moderation error:', e.message);
    res.json({ allowed: true, moderated: false, note: 'Moderation unavailable' });
  }
};
