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

    if (!endpoint || !apiKey || !model) {
        return res.status(500).json({ error: 'Server Image API not configured' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Detect if Gemini or OpenAI-compatible
        const isGemini = endpoint.includes('generativelanguage.googleapis.com');

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
            // OpenAI-compatible API
            const response = await fetch(`${endpoint}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    prompt,
                    n: 1,
                    size: '1024x1024',
                    response_format: 'b64_json'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Image API error:', errorText);
                return res.status(response.status).json({ error: 'Image API error' });
            }

            const data = await response.json();
            return res.json(data);
        }
    } catch (error) {
        console.error('Image proxy error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
