// api/analyze-room.ts
// Vercel Serverless Function — Claude-powered Beauty AI services
//
// Required server secret:
//   ANTHROPIC_API_KEY
//
// Optional model overrides:
//   CLAUDE_VISION_MODEL
//   CLAUDE_FAST_MODEL

import type { VercelRequest, VercelResponse } from '@vercel/node'

const CLAUDE_VISION_MODEL = process.env.CLAUDE_VISION_MODEL || 'claude-sonnet-5'
const CLAUDE_FAST_MODEL = process.env.CLAUDE_FAST_MODEL || 'claude-haiku-4-5-20251001'
const MAX_IMAGE_DATA_URL_CHARS = 5_500_000
const MAX_STYLE_NAMES_CHARS = 8_000
const MAX_CHAT_MESSAGES = 12

type ClaudeCallOptions = {
  model: string
  maxTokens: number
}

function firstHeader(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function requestHost(req: VercelRequest): string | null {
  return firstHeader(req.headers['x-forwarded-host']) || firstHeader(req.headers.host)
}

function sameSiteOrigin(req: VercelRequest): string | null {
  const host = requestHost(req)
  if (!host) return null

  const origin = firstHeader(req.headers.origin)
  if (origin) {
    try {
      const parsed = new URL(origin)
      return parsed.host === host ? parsed.origin : null
    } catch {
      return null
    }
  }

  const referer = firstHeader(req.headers.referer)
  if (referer) {
    try {
      const parsed = new URL(referer)
      return parsed.host === host ? parsed.origin : null
    } catch {
      return null
    }
  }

  return null
}

function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const allowedOrigin = sameSiteOrigin(req)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    return true
  }

  return false
}

async function parseClaudeError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null) as
    | { error?: { message?: string }; message?: string }
    | null

  return data?.error?.message || data?.message || `Claude request failed with status ${res.status}`
}

async function callClaude(
  systemPrompt: string,
  userContent: object[],
  options: ClaudeCallOptions,
) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      max_tokens: options.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!res.ok) throw new Error(await parseClaudeError(res))
  return res.json()
}

async function callClaudeChat(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: ClaudeCallOptions,
) {
  const apiMessages = messages.slice(-MAX_CHAT_MESSAGES).map((m) => ({
    role: m.role,
    content: [{ type: 'text' as const, text: m.content.slice(0, 1500) }],
  }))

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      max_tokens: options.maxTokens,
      system: systemPrompt,
      messages: apiMessages,
    }),
  })

  if (!res.ok) throw new Error(await parseClaudeError(res))
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
Your role is to look at the uploaded selfie and recommend makeup color directions from a fixed library.
You are NOT a skin analyzer, medical tool, attractiveness rater, or identity classifier.
Your tone is warm, human, concise, and premium-beauty-brand-like.

The app focuses on lipstick, lip gloss, lip liner, and blush.
Do NOT mention skin conditions, blemishes, acne, pores, age, weight, body shape, or any medical observations.
Do NOT criticize appearance or compare the person with beauty ideals.
Only discuss makeup color, finish, intensity, and styling direction.

Available looks (use ONLY these exact names — do not invent new ones):
${styleNames}

Analyze only the visible color information needed for makeup selection and return:
- skinTone: fair / light / medium / tan / deep / rich
- undertone: warm / cool / neutral / olive / neutral-warm / neutral-cool
- recommendedPreset: single best color-direction match from the list above
- alternatePresets: exactly 2 good alternatives from the list above
- saferOption: 1 more natural/subtle look from the list
- bolderOption: 1 higher-impact look from the list
- lipColorFamily: suitable lip color family (e.g. rosy nude / warm nude / peachy nude / cool pink / berry rose / classic red / soft mauve)
- blushColorFamily: suitable blush color family (e.g. soft peach / fresh apricot / rosy pink / warm coral / terracotta / soft rose)
- confidence: how clearly the relevant color information is visible — low / medium / high
- reasoning: 1 short sentence in ${lang === 'he' ? 'Hebrew' : 'English'} explaining the color/finish match. Max 15 words.
- beautyTips: exactly 2 short positive, practical tips in ${lang === 'he' ? 'Hebrew' : 'English'}, focused only on makeup shades and finish
- avoidPreset: optional exact look name that contrasts most with the recommended color direction; otherwise return an empty string

Important rules:
- ALL non-empty preset fields must be exact names from the available looks list above
- Do not invent look names
- Keep reasoning to 1 sentence maximum
- Keep beautyTips short and practical
- Sound like a beauty advisor, not an AI system

Return ONLY valid JSON, no markdown, no preamble:
{
  "skinTone": "light",
  "undertone": "neutral-warm",
  "recommendedPreset": "Clean Glow",
  "alternatePresets": ["Natural Everyday", "Soft Glam"],
  "saferOption": "Natural Everyday",
  "bolderOption": "Soft Glam",
  "confidence": "high",
  "lipColorFamily": "rosy nude",
  "blushColorFamily": "soft peach",
  "avoidPreset": "",
  "reasoning": "${lang === 'he' ? 'הגוונים והגימור יוצרים שילוב רך והרמוני עם התמונה.' : 'The shades and finish create a soft, harmonious color match.'}",
  "beautyTips": [
    "${lang === 'he' ? 'נסי שפתון ניודי-ורדרד בגימור סאטן.' : 'Try a rosy-nude lip with a satin finish.'}",
    "${lang === 'he' ? 'סומק אפרסקי רך ישמור על מראה טבעי ומאוזן.' : 'A soft peach blush keeps the look natural and balanced.'}"
  ]
}`
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsAllowed = setCors(req, res)

  if (req.method === 'OPTIONS') {
    return corsAllowed ? res.status(204).end() : res.status(403).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!corsAllowed) {
    return res.status(403).json({ error: { message: 'Cross-site Beauty AI requests are not allowed.' } })
  }

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY is not set on the server' } })
  }

  // ─── Prompt-builder mode (product try-on) ───────────────────────────────────
  const body = req.body as { mode?: string; product?: Record<string, unknown> }
  if (body.mode === 'prompt-builder' && body.product) {
    const productJson = JSON.stringify(body.product)
    if (productJson.length > 10_000) {
      return res.status(413).json({ error: { message: 'Product request is too large.' } })
    }

    const systemPrompt = `You are an expert makeup prompt engineer for a virtual try-on app powered by an AI image editing model called Nano Banana. Your job is to write precise, photorealistic editing prompts that apply makeup products to selfies with maximum product fidelity and minimum identity distortion.

You will receive product details and return ONLY a single editing prompt string. No explanation. No preamble. No markdown.

The prompt must:
- Start with: Beauty makeup virtual try-on.
- Name the exact brand, product name, and shade name
- Describe the shade color accurately based on shadeFamily and swatchColor
- Describe the finish (matte, satin, glossy, etc.)
- Describe precise application placement
- Describe the desired visible result
- End with: Photorealistic. Preserve exact face position, framing, identity, natural skin texture, hair, background, and camera angle completely.

For lip products: describe precise placement on the natural lip area with clean edges and realistic payoff.
For blush products: describe placement on the cheeks, blended upward, with realistic color payoff.

Keep the prompt under 80 words.`

    const userContent = [{ type: 'text' as const, text: productJson }]

    try {
      const data = await callClaude(systemPrompt, userContent, {
        model: CLAUDE_FAST_MODEL,
        maxTokens: 180,
      })
      const text = (data.content as Array<{ type: string; text?: string }>)
        .find((b) => b.type === 'text')?.text?.trim() ?? ''
      return res.status(200).json({ prompt: text })
    } catch (err) {
      console.error('[analyze-room] prompt-builder Error:', err)
      return res.status(500).json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } })
    }
  }

  // ─── Result-description mode (after try-on) ──────────────────────────────────
  const bodyDesc = req.body as { mode?: string; lookName?: string; imageUrl?: string; lang?: 'he' | 'en' }
  if (bodyDesc.mode === 'result-description' && bodyDesc.lookName) {
    const lookName = bodyDesc.lookName.slice(0, 180)
    const langDesc = bodyDesc.lang ?? 'en'
    const systemPrompt = `You are a warm, premium beauty advisor writing short descriptions for a virtual makeup try-on app. You will receive a look name. Write ONE short sentence (maximum 18 words) describing the makeup styling direction in a positive, neutral, beauty-native tone. Do not judge attractiveness or physical traits. Do not mention AI. Do not say 'the image shows'. Return only the sentence, no preamble. Respond in Hebrew if lang is 'he', in English if lang is 'en'.`
    const userMessage = `Look applied: ${lookName}. Lang: ${langDesc}. Describe the makeup styling direction.`
    const userContent = [{ type: 'text' as const, text: userMessage }]

    try {
      const data = await callClaude(systemPrompt, userContent, {
        model: CLAUDE_FAST_MODEL,
        maxTokens: 80,
      })
      const text = (data.content as Array<{ type: string; text?: string }>)
        .find((b) => b.type === 'text')?.text?.trim() ?? ''
      return res.status(200).json({ description: text })
    } catch (err) {
      console.error('[analyze-room] result-description Error:', err)
      return res.status(500).json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } })
    }
  }

  // ─── Beauty-chat mode (advisor chat on result screen) ───────────────────────
  const bodyChat = req.body as {
    mode?: string
    lookName?: string
    lang?: 'he' | 'en'
    products?: Array<{
      brand: string
      productName: string
      shadeName: string
      category: string
      shadeFamily: string
      finish: string
    }>
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>
  }

  if (bodyChat.mode === 'beauty-chat' && bodyChat.lookName && Array.isArray(bodyChat.messages)) {
    const products = Array.isArray(bodyChat.products) ? bodyChat.products.slice(0, 10) : []
    const productsContext = products.length > 0
      ? `\n\nThe products used in this look are:\n${products
          .map(
            (p) => `${p.category} — ${p.brand} ${p.productName} in ${p.shadeName}${p.shadeFamily || p.finish ? ` (${[p.shadeFamily, p.finish].filter(Boolean).join(', ')})` : ''}`,
          )
          .join('\n')}`
      : ''

    const systemPrompt = `You are a warm, expert beauty advisor inside a virtual makeup try-on app. The user has just tried a makeup look. Answer questions about the look, products, shades, finishes, and occasions in a concise, premium, beauty-native tone. Keep answers short — 2 to 3 sentences maximum. Do not judge attractiveness, body, age, health, or physical traits. Do not mention AI. Do not use technical language.

If lang is 'he': respond in Hebrew only. Use correct, natural Israeli Hebrew. Address the user in feminine form. Product and brand names may remain in English when needed, but keep surrounding Hebrew readable.

If lang is 'en': respond in English only.

The look currently applied is: ${bodyChat.lookName.slice(0, 180)}.${productsContext}`

    try {
      const data = await callClaudeChat(systemPrompt, bodyChat.messages, {
        model: CLAUDE_FAST_MODEL,
        maxTokens: 300,
      })
      const text = (data.content as Array<{ type: string; text?: string }>)
        .find((b) => b.type === 'text')?.text?.trim() ?? ''
      return res.status(200).json({ reply: text })
    } catch (err) {
      console.error('[analyze-room] beauty-chat Error:', err)
      return res.status(500).json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } })
    }
  }

  // ─── Selfie color-direction analysis ────────────────────────────────────────
  const { imageDataUrl, styleNames, lang = 'en' } = req.body as {
    imageDataUrl: string
    styleNames: string
    lang: 'he' | 'en'
  }

  if (!imageDataUrl || !styleNames) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_CHARS) {
    return res.status(413).json({ error: { message: 'Selfie payload is too large.' } })
  }

  if (styleNames.length > MAX_STYLE_NAMES_CHARS) {
    return res.status(413).json({ error: { message: 'Style list is too large.' } })
  }

  const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return res.status(400).json({ error: 'Invalid image data URL' })
  }

  const [, mediaType, base64Data] = match

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
        text: 'Analyze only the visible color information needed for makeup selection and return the requested JSON.',
      },
    ]

    const data = await callClaude(systemPrompt, userContent, {
      model: CLAUDE_VISION_MODEL,
      maxTokens: 700,
    })

    return res.status(200).json(data)
  } catch (err) {
    console.error('[analyze-room] vision Error:', err)
    return res.status(500).json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } })
  }
}
