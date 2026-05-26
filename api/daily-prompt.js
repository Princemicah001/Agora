
const fetch = require('node-fetch');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const fallbacks = [
  "What belief have you outgrown that you still cling to?",
  "If silence had a voice, what would it ask you today?",
  "What would you create if no one would ever see it?",
  "Which truth are you currently avoiding?",
  "What does your future self wish you'd start doing now?"
];

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
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
          { role: 'system', content: 'You are Agora, a sanctuary for deep thought. Generate a short, profound daily question that inspires introspection. Return only the question.' }
        ],
        temperature: 0.95,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    const prompt = data.choices[0].message.content.trim();
    res.json({ prompt });
  } catch (e) {
    console.error('Daily prompt error:', e.message);
    const prompt = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json({ prompt });
  }
};
