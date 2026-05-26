
const fetch = require('node-fetch');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

module.exports = async (req, res) => {
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
          { role: 'system', content: 'Reply with exactly: "Groq is working!"' }
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    res.json({ success: true, message: data.choices[0].message.content.trim() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
