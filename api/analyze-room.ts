import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { imageDataUrl, styleNames, roomTypes, lang } = req.body as {
    imageDataUrl: string
    styleNames: string
    roomTypes: string
    lang?: 'he' | 'en'
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 600,
      system: 'You are an expert interior designer and real estate photographer. Respond ONLY with valid JSON, no markdown, no code fences.',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageDataUrl.split(';')[0].replace('data:', ''),
              data: imageDataUrl.split(',')[1],
            },
          },
          {
            type: 'text',
            text: `Available room types: ${roomTypes}\nAvailable staging styles: ${styleNames}\n\n${
              lang === 'he'
                ? 'Respond in Hebrew. The reasoning field and all notes must be in Hebrew.\n'
                : ''
            }Analyze this room photo and respond with ONLY this JSON (no markdown):\n{\n  "roomType": "<pick from room types>",\n  "recommendedStyle": "<pick from staging styles>",\n  "confidence": "<high|medium|low>",\n  "reasoning": "<1-2 sentences why this style fits>",\n  "roomAnalysis": {\n    "lightingScore": <1-10 integer>,\n    "lightingNote": "<short note about natural/artificial light>",\n    "spaceScore": <1-10 integer>,\n    "spaceNote": "<short note about layout and flow>",\n    "conditionNote": "<brief note on condition, any wear or strengths>",\n    "strongPoints": ["<strength 1>", "<strength 2>", "<strength 3>"],\n    "stagingTips": ["<actionable tip 1>", "<actionable tip 2>"]\n  }\n}`,
          },
        ],
      }],
    }),
  })

  const data = await response.json()
  res.status(response.status).json(data)
}
