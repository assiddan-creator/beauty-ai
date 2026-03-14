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

// ─── Types ───────────────────────────────────────────────────────────────────
type FaceAnalysis = {
  skinTone: string
  undertone: string
  recommendedPreset: string
  alternatePresets: string[]
  confidence: 'high' | 'medium' | 'low'
  lipColorFamily: string
  blushColorFamily: string
  avoidPreset: string
  reasoning: string
  beautyTips: string[]
}

// ─── Beauty system prompt ─────────────────────────────────────────────────────
function buildBeautySystemPrompt(styleNames: string, lang: 'he' | 'en'): string {
  return `You are an expert beauty AI consultant for a makeup virtual try-on app.
Your role is not to give general beauty commentary.
Your role is to analyze the uploaded selfie and select the most flattering makeup preset from a fixed preset library for this person.
The app is focused on:
- lipstick
- lip gloss
- lip liner
- blush
Do not focus on skincare, medical issues, skin conditions, blemishes, acne, or dermatological observations.
Do not use negative language about appearance.
Only focus on flattering makeup direction, color harmony, and preset suitability.
Available presets (choose from these exact names only):
${styleNames}
Analyze the selfie and infer:
- skin tone: fair / light / medium / tan / deep / rich
- undertone: warm / cool / neutral / olive / neutral-warm / neutral-cool
- the single best preset from the list
- the next 2 best alternate presets from the list
- lip color family that would be most flattering
- blush color family that would be most flattering
- 1 preset to avoid if it seems less suitable
- confidence: low / medium / high
Important behavior rules:
- Prefer commercially useful, wearable, flattering recommendations
- Think in terms of the preset library, not unlimited beauty creativity
- Base the recommendation on visible color harmony, contrast level, softness vs definition
- Do not overclaim certainty
- If the image is unclear, lower confidence rather than guessing too strongly
beautyTips rules:
- return exactly 2 short, positive, actionable beauty tips
- tips must be in ${lang === 'he' ? 'Hebrew' : 'English'}
- keep them practical and flattering
- focus only on makeup shades / finish / vibe
reasoning rules:
- 1-2 short sentences
- in ${lang === 'he' ? 'Hebrew' : 'English'}
- explain why the recommended preset fits this person
- keep it product-friendly and flattering
Return ONLY valid JSON, no markdown, no preamble:
{
  "skinTone": "light",
  "undertone": "neutral-warm",
  "recommendedPreset": "Clean Glow",
  "alternatePresets": ["Natural Everyday", "Office Polished"],
  "confidence": "high",
  "lipColorFamily": "rosy pink nude",
  "blushColorFamily": "soft peach",
  "avoidPreset": "Classic Red Lip",
  "reasoning": "הלוק הזה יתאים לך כי הוא שומר על רכות טבעית ומוסיף זוהר נקי ומחמיא בלי להכביד.",
  "beautyTips": [
    "גווני שפתיים ורדרדים-ניודיים יחמיאו לך במיוחד.",
    "סומק אפרסקי רך ייתן לך מראה רענן וטבעי."
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
