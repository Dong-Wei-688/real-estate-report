// Vercel Serverless Function - AI Analysis API
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { model, apiKey, prompt } = req.body;
    
    if (!model || !apiKey || !prompt) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    let result;
    
    if (model === 'deepseek') {
      result = await callDeepSeek(apiKey, prompt);
    } else if (model === 'openai') {
      result = await callOpenAI(apiKey, prompt);
    } else if (model === 'claude') {
      result = await callClaude(apiKey, prompt);
    } else {
      return res.status(400).json({ error: 'Unsupported model' });
    }
    
    return res.status(200).json({ content: result });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
}

async function callDeepSeek(apiKey, prompt) {
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: '你是一位专业的房地产行业分析师，擅长撰写深度行业分析报告。请用中文回答。' },
        { role: 'user', content: prompt }
      ]
    })
  });
  
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`DeepSeek API Error: ${resp.status} - ${errText}`);
  }
  
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function callOpenAI(apiKey, prompt) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: '你是一位专业的房地产行业分析师，擅长撰写深度行业分析报告。请用中文回答。' },
        { role: 'user', content: prompt }
      ]
    })
  });
  
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI API Error: ${resp.status} - ${errText}`);
  }
  
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function callClaude(apiKey, prompt) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: '你是一位专业的房地产行业分析师，擅长撰写深度行业分析报告。请用中文回答。',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Claude API Error: ${resp.status} - ${errText}`);
  }
  
  const data = await resp.json();
  return data.content[0].text;
}
