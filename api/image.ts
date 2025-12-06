import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function - Image Generation Proxy
 * 保护 API Key 不暴露到前端
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check server-side env vars
    const endpoint = process.env.IMAGE_API_ENDPOINT;
    const apiKey = process.env.IMAGE_API_KEY;
    const model = process.env.IMAGE_MODEL;

    console.log('[IMAGE API] Config check:', {
        hasEndpoint: !!endpoint,
        hasApiKey: !!apiKey,
        hasModel: !!model,
        endpoint: endpoint?.substring(0, 50) + '...'
    });

    if (!endpoint || !apiKey || !model) {
        return res.status(500).json({ error: 'Server Image API not configured' });
    }

    try {
        const { prompt } = req.body;
        console.log('[IMAGE API] Prompt received:', prompt?.substring(0, 100) + '...');

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Detect if Gemini or OpenAI-compatible
        const isGemini = endpoint.includes('generativelanguage.googleapis.com');
        console.log('[IMAGE API] isGemini:', isGemini);

        if (isGemini) {
            // Gemini API format
            const geminiUrl = `${endpoint}/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini Image API error:', errorText);
                return res.status(response.status).json({ error: 'Gemini Image API error' });
            }

            const data = await response.json();
            const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

            if (imagePart?.inlineData) {
                return res.json({
                    data: [{
                        b64_json: imagePart.inlineData.data,
                        mimeType: imagePart.inlineData.mimeType
                    }]
                });
            }
            return res.status(500).json({ error: 'No image generated' });
        } else {
            // OpenAI-compatible API (SiliconFlow, etc.)
            // 智能处理 endpoint：如果已经包含 /images/generations 就不再添加
            let apiUrl = endpoint;
            if (!endpoint.endsWith('/images/generations')) {
                apiUrl = endpoint.replace(/\/$/, '') + '/images/generations';
            }

            console.log('[IMAGE API] Calling external API:', apiUrl);
            console.log('[IMAGE API] Model:', model);

            const requestBody = {
                model,
                prompt,
                image_size: '1024x1024',
                batch_size: 1
            };
            console.log('[IMAGE API] Request body:', JSON.stringify(requestBody));

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('[IMAGE API] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[IMAGE API] Error response:', errorText);
                return res.status(response.status).json({ error: 'Image API error', details: errorText });
            }

            const data = await response.json();
            console.log('[IMAGE API] Response data keys:', Object.keys(data));

            // SiliconFlow 返回格式可能是 { images: [{ url: "..." }] } 或 { data: [{ b64_json: "..." }] }
            if (data.images && data.images[0]?.url) {
                // SiliconFlow 返回 URL 格式
                console.log('[IMAGE API] Got image URL from SiliconFlow');
                return res.json({
                    data: [{
                        url: data.images[0].url
                    }]
                });
            }

            // 标准 OpenAI 格式
            return res.json(data);
        }
    } catch (error) {
        console.error('[IMAGE API] Proxy error:', error);
        return res.status(500).json({ error: 'Internal server error', message: String(error) });
    }
}
