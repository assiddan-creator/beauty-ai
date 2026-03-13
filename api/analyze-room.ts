import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { imageDataUrl, styleNames, roomTypes } = req.body as {
    imageDataUrl: string
    styleNames: string
    roomTypes: string
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
      max_tokens: 300,
      system: 'You are an expert interior designer. Respond ONLY with valid JSON, no markdown.',
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
            text: `Available room types: ${roomTypes}\nAvailable staging styles: ${styleNames}\n\nRespond with ONLY this JSON:\n{\n  "roomType": "<pick from room types>",\n  "recommendedStyle": "<pick from staging styles>",\n  "confidence": "<high|medium|low>",\n  "reasoning": "<1-2 sentences>"\n}`,
          },
        ],
      }],
    }),
  })

  const data = await response.json()
  res.status(response.status).json(data)
}
