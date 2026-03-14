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
  saferOption: string
  bolderOption: string
  confidence: 'high' | 'medium' | 'low'
  lipColorFamily: string
  blushColorFamily: string
  avoidPreset: string
  reasoning: string
  beautyTips: string[]
}

// ─── Beauty system prompt ─────────────────────────────────────────────────────
function buildBeautySystemPrompt(styleNames: string, lang: 'he' | 'en'): string {
  return `You are a warm, expert beauty advisor for a makeup virtual try-on app.
Your role is to look at the uploaded selfie and recommend the most flattering makeup looks from a fixed library.
You are NOT a skin analyzer or medical tool. You are a beauty advisor.
Your tone is: warm, flattering, human, confident, and beauty-brand-like.

The app focuses on: lipstick, lip gloss, lip liner, blush.
Do NOT mention skin conditions, blemishes, acne, pores, or any dermatological observations.
Do NOT use negative language about appearance.
Only speak about what will be flattering, beautiful, and enhancing.

Available looks (use ONLY these exact names — do not invent new ones):
${styleNames}

Analyze the selfie and return:
- skinTone: fair / light / medium / tan / deep / rich
- undertone: warm / cool / neutral / olive / neutral-warm / neutral-cool
- recommendedPreset: single best look from the list above
- alternatePresets: exactly 2 good alternative looks from the list above
- saferOption: 1 look from the list that is more natural/subtle — good if the person wants something easier to wear
- bolderOption: 1 look from the list that has more presence/impact — good if the person wants more effect
- lipColorFamily: most flattering lip color family (e.g. rosy nude / warm nude / peachy nude / cool pink / berry rose / classic red / soft mauve)
- blushColorFamily: most flattering blush color family (e.g. soft peach / fresh apricot / rosy pink / warm coral / terracotta / soft rose)
- confidence: how clearly you can see the face — low / medium / high
- reasoning: 1 short sentence in ${lang === 'he' ? 'Hebrew' : 'English'} — explain why the recommended look is flattering. Be warm and human. Max 15 words.
- beautyTips: exactly 2 short positive actionable tips in ${lang === 'he' ? 'Hebrew' : 'English'} — focused on makeup shades and finish only
- avoidPreset: 1 look from the list that would be less suitable (optional — only if clearly less suitable)

Important rules:
- ALL of recommendedPreset / alternatePresets / saferOption / bolderOption / avoidPreset must be exact names from the available looks list above
- Do not invent look names
- Keep reasoning to 1 sentence maximum
- Keep beautyTips short and practical
- Sound like a beauty advisor, not an AI system

Return ONLY valid JSON, no markdown, no preamble:
{
  "skinTone": "light",
  "undertone": "neutral-warm",
  "recommendedPreset": "Clean Glow",
  "alternatePresets": ["Natural Everyday", "Fresh Rosy"],
  "saferOption": "Natural Everyday",
  "bolderOption": "Soft Glam",
  "confidence": "high",
  "lipColorFamily": "rosy nude",
  "blushColorFamily": "soft peach",
  "avoidPreset": "Classic Red Lip",
  "reasoning": "${lang === 'he' ? 'הלוק הזה מחמיא לרכות הטבעית שלך ומוסיף זוהר נקי.' : 'This look enhances your natural softness with a clean glow.'}",
  "beautyTips": [
    "${lang === 'he' ? 'גווני שפתיים ורדרדים-ניודיים יחמיאו לך במיוחד.' : 'Rosy nude lip shades will be especially flattering on you.'}",
    "${lang === 'he' ? 'סומק אפרסקי רך ייתן לך מראה רענן וטבעי.' : 'A soft peachy blush will give you a fresh natural look.'}"
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

  // ─── Prompt-builder mode (product try-on) ───────────────────────────────────
  const body = req.body as { mode?: string; product?: Record<string, unknown> }
  if (body.mode === 'prompt-builder' && body.product) {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server' })
    }
    const systemPrompt = `You are an expert makeup prompt engineer for a virtual try-on app powered by an AI image editing model called Nano Banana. Your job is to write precise, photorealistic editing prompts that apply makeup products to selfies with maximum accuracy and minimum identity distortion.

You will receive product details and return ONLY a single editing prompt string. No explanation. No preamble. No markdown.

The prompt must:
- Start with: Beauty makeup virtual try-on.
- Name the exact brand, product name, shade name
- Describe the shade color accurately based on shadeFamily and swatchColor
- Describe the finish (matte, satin, glossy, etc.)
- Describe precise application placement
- Describe the desired visible result
- End with: Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.

For lips products: describe application from center outward, clean edges, natural payoff.
For blush products: describe placement on apples of cheeks, blended upward, natural flush.

Keep the prompt under 80 words.`
    const userContent = [{ type: 'text' as const, text: JSON.stringify(body.product) }]
    try {
      const data = await callClaude(systemPrompt, userContent)
      const text = (data.content as Array<{ type: string; text?: string }>)
        .find(b => b.type === 'text')?.text?.trim() ?? ''
      return res.status(200).json({ prompt: text })
    } catch (err) {
      console.error('[analyze-room] prompt-builder Error:', err)
      return res.status(500).json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } })
    }
  }

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
