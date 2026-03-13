// api/analyze-room.ts
// Vercel Serverless Function — Claude Vision Beauty Analysis
//
// משתנה סביבה נדרש:
//   ANTHROPIC_API_KEY=sk-ant-xxxx  (ב-.env וב-Vercel dashboard)

import type { VercelRequest, VercelResponse } from '@vercel/node'

// ─── Anthropic call ───────────────────────────────────────────────────────────
async function callClaude(systemPrompt: string, userContent: object[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }

  return res.json()
}

// ─── Beauty system prompt ─────────────────────────────────────────────────────
function buildBeautySystemPrompt(styleNames: string, lang: 'he' | 'en'): string {
  return `You are an expert beauty AI consultant specializing in makeup color theory and personalized look recommendations.

Your task: analyze the selfie provided and return a JSON object with makeup recommendations.

Available looks to recommend from (pick EXACTLY one name from this list):
${styleNames}

Rules:
- Analyze skin tone: fair / light / medium / tan / deep / rich
- Analyze undertone: warm / cool / neutral / olive
- Recommend the single best look from the list above for this person
- Confidence should reflect how clearly you can see the face and skin
- beautyTips: 2 short, positive, actionable tips for this person (in ${lang === 'he' ? 'Hebrew' : 'English'})
- reasoning: 1-2 sentences explaining why this look suits them (in ${lang === 'he' ? 'Hebrew' : 'English'})
- NEVER comment on skin conditions, blemishes, acne, or any medical/dermatological observations
- NEVER use negative language about appearance
- Focus only on what makeup shades and styles will be flattering

Return ONLY valid JSON, no markdown fences, no preamble:
{
  "skinTone": "medium",
  "undertone": "warm",
  "recommendedPreset": "Warm Bronze",
  "confidence": "high",
  "reasoning": "Your warm medium skin tone with golden undertones will look stunning with bronze and terracotta tones.",
  "beautyTips": [
    "Coral and peach blush shades will complement your warm undertones beautifully.",
    "Gold and copper highlighters will make your skin glow."
  ]
}`
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { imageDataUrl, styleNames, lang = 'en' } = req.body as {
    imageDataUrl: string
    styleNames: string
    lang: 'he' | 'en'
  }

  if (!imageDataUrl || !styleNames) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return res.status(400).json({ error: 'Invalid image data URL' })
  }
  const [, mediaType, base64Data] = match

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY is not set on the server' } })
  }

  try {
    const systemPrompt = buildBeautySystemPrompt(styleNames, lang as 'he' | 'en')

    const userContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
          data: base64Data,
        },
      },
      {
        type: 'text',
        text: 'Please analyze this selfie and return the beauty recommendation JSON.',
      },
    ]

    const data = await callClaude(systemPrompt, userContent)
    return res.status(200).json(data)
  } catch (err) {
    console.error('[analyze-room] Error:', err)
    return res.status(500).json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } })
  }
}
