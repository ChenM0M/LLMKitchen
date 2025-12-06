import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function - Text Generation Proxy
 * 保护 API Key 不暴露到前端
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check server-side env vars
    const endpoint = process.env.TEXT_API_ENDPOINT;
    const apiKey = process.env.TEXT_API_KEY;
    const model = process.env.TEXT_MODEL;

    if (!endpoint || !apiKey || !model) {
        return res.status(500).json({ error: 'Server API not configured' });
    }

    try {
        const { messages, temperature = 0.7, max_tokens = 2048 } = req.body;

        // Detect if Gemini or OpenAI-compatible
        const isGemini = endpoint.includes('generativelanguage.googleapis.com');

        if (isGemini) {
            // Gemini API format
            const geminiUrl = `${endpoint}/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: messages.map((m: any) => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API error:', errorText);
                return res.status(response.status).json({ error: 'Gemini API error' });
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Return in OpenAI-compatible format for frontend consistency
            return res.json({
                choices: [{ message: { content } }]
            });
        } else {
            // OpenAI-compatible API
            // 智能处理 endpoint：如果已经包含 /chat/completions 就不再添加
            let apiUrl = endpoint;
            if (!endpoint.endsWith('/chat/completions')) {
                apiUrl = endpoint.replace(/\/$/, '') + '/chat/completions';
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Text API error:', errorText);
                return res.status(response.status).json({ error: 'Text API error' });
            }

            const data = await response.json();
            return res.json(data);
        }
    } catch (error) {
        console.error('Text proxy error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
