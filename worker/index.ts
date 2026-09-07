interface Env {
  ANTHROPIC_API_KEY?: string
  REPLICATE_API_TOKEN?: string
  CLAUDE_VISION_MODEL?: string
  CLAUDE_FAST_MODEL?: string
  ASSETS: { fetch(request: Request): Promise<Response> }
}

const REPLICATE_BASE = 'https://api.replicate.com'
const MAX_JSON_CHARS = 8_000_000
const MAX_IMAGE_DATA_URL_CHARS = 5_500_000
const MAX_STYLE_NAMES_CHARS = 8_000
const MAX_CHAT_MESSAGES = 12

function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('cache-control', 'no-store')
  return new Response(JSON.stringify(data), { status, headers })
}

function sameSiteOrigin(request: Request, allowMissing = false): string | null {
  const requestUrl = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      const parsed = new URL(origin)
      return parsed.host === requestUrl.host ? parsed.origin : null
    } catch {
      return null
    }
  }

  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const parsed = new URL(referer)
      return parsed.host === requestUrl.host ? parsed.origin : null
    } catch {
      return null
    }
  }

  return allowMissing ? requestUrl.origin : null
}

function corsHeaders(request: Request, methods: string, allowMissing = false): { headers: Headers; allowed: boolean } {
  const allowedOrigin = sameSiteOrigin(request, allowMissing)
  const headers = new Headers({
    vary: 'Origin',
    'access-control-allow-methods': methods,
    'access-control-allow-headers': 'Content-Type, Prefer',
    'cache-control': 'no-store',
  })
  if (allowedOrigin) headers.set('access-control-allow-origin', allowedOrigin)
  return { headers, allowed: Boolean(allowedOrigin) }
}

async function readJsonBody(request: Request, maxChars: number): Promise<{ ok: true; value: any } | { ok: false; response: Response }> {
  const raw = await request.text()
  if (raw.length > maxChars) return { ok: false, response: json({ error: { message: 'Request is too large.' } }, 413) }
  try {
    return { ok: true, value: raw ? JSON.parse(raw) : {} }
  } catch {
    return { ok: false, response: json({ error: { message: 'Invalid JSON body.' } }, 400) }
  }
}

async function parseClaudeError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null) as { error?: { message?: string }; message?: string } | null
  return data?.error?.message || data?.message || `Claude request failed with status ${res.status}`
}

async function callClaude(
  env: Env,
  systemPrompt: string,
  userContent: object[],
  options: { model: string; maxTokens: number },
): Promise<any> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY ?? '',
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
  env: Env,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: { model: string; maxTokens: number },
): Promise<any> {
  const apiMessages = messages.slice(-MAX_CHAT_MESSAGES).map((m) => ({
    role: m.role,
    content: [{ type: 'text' as const, text: m.content.slice(0, 1500) }],
  }))

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY ?? '',
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
- lipColorFamily: suitable lip color family
- blushColorFamily: suitable blush color family
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

Return ONLY valid JSON, no markdown, no preamble.`
}

function extractClaudeText(data: any): string {
  return Array.isArray(data?.content)
    ? data.content.find((block: any) => block?.type === 'text')?.text?.trim() ?? ''
    : ''
}

async function handleAnalyzeRoom(request: Request, env: Env): Promise<Response> {
  const cors = corsHeaders(request, 'POST, OPTIONS')
  if (request.method === 'OPTIONS') return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors.headers)
  if (!cors.allowed) return json({ error: { message: 'Cross-site Beauty AI requests are not allowed.' } }, 403, cors.headers)
  if (!env.ANTHROPIC_API_KEY) return json({ error: { message: 'ANTHROPIC_API_KEY is not set on the server' } }, 500, cors.headers)

  const parsed = await readJsonBody(request, 8_000_000)
  if ('response' in parsed) return parsed.response
  const body = parsed.value as any
  const fastModel = env.CLAUDE_FAST_MODEL || 'claude-haiku-4-5-20251001'
  const visionModel = env.CLAUDE_VISION_MODEL || 'claude-sonnet-5'

  if (body.mode === 'prompt-builder' && body.product) {
    const productJson = JSON.stringify(body.product)
    if (productJson.length > 10_000) return json({ error: { message: 'Product request is too large.' } }, 413, cors.headers)

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

    try {
      const data = await callClaude(env, systemPrompt, [{ type: 'text', text: productJson }], { model: fastModel, maxTokens: 180 })
      return json({ prompt: extractClaudeText(data) }, 200, cors.headers)
    } catch (err) {
      console.error('[analyze-room] prompt-builder Error:', err)
      return json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } }, 500, cors.headers)
    }
  }

  if (body.mode === 'result-description' && body.lookName) {
    const lookName = String(body.lookName).slice(0, 180)
    const langDesc = body.lang ?? 'en'
    const systemPrompt = `You are a warm, premium beauty advisor writing short descriptions for a virtual makeup try-on app. You will receive a look name. Write ONE short sentence (maximum 18 words) describing the makeup styling direction in a positive, neutral, beauty-native tone. Do not judge attractiveness or physical traits. Do not mention AI. Do not say 'the image shows'. Return only the sentence, no preamble. Respond in Hebrew if lang is 'he', in English if lang is 'en'.`
    try {
      const data = await callClaude(env, systemPrompt, [{ type: 'text', text: `Look applied: ${lookName}. Lang: ${langDesc}. Describe the makeup styling direction.` }], { model: fastModel, maxTokens: 80 })
      return json({ description: extractClaudeText(data) }, 200, cors.headers)
    } catch (err) {
      console.error('[analyze-room] result-description Error:', err)
      return json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } }, 500, cors.headers)
    }
  }

  if (body.mode === 'beauty-chat' && body.lookName && Array.isArray(body.messages)) {
    const products = Array.isArray(body.products) ? body.products.slice(0, 10) : []
    const productsContext = products.length > 0
      ? `\n\nThe products used in this look are:\n${products.map((p: any) => `${p.category} — ${p.brand} ${p.productName} in ${p.shadeName}${p.shadeFamily || p.finish ? ` (${[p.shadeFamily, p.finish].filter(Boolean).join(', ')})` : ''}`).join('\n')}`
      : ''
    const systemPrompt = `You are a warm, expert beauty advisor inside a virtual makeup try-on app. The user has just tried a makeup look. Answer questions about the look, products, shades, finishes, and occasions in a concise, premium, beauty-native tone. Keep answers short — 2 to 3 sentences maximum. Do not judge attractiveness, body, age, health, or physical traits. Do not mention AI. Do not use technical language.

If lang is 'he': respond in Hebrew only. Use correct, natural Israeli Hebrew. Address the user in feminine form. Product and brand names may remain in English when needed, but keep surrounding Hebrew readable.

If lang is 'en': respond in English only.

The look currently applied is: ${String(body.lookName).slice(0, 180)}.${productsContext}`
    try {
      const data = await callClaudeChat(env, systemPrompt, body.messages, { model: fastModel, maxTokens: 300 })
      return json({ reply: extractClaudeText(data) }, 200, cors.headers)
    } catch (err) {
      console.error('[analyze-room] beauty-chat Error:', err)
      return json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } }, 500, cors.headers)
    }
  }

  const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : ''
  const styleNames = typeof body.styleNames === 'string' ? body.styleNames : ''
  const lang: 'he' | 'en' = body.lang === 'he' ? 'he' : 'en'

  if (!imageDataUrl || !styleNames) return json({ error: 'Missing required fields' }, 400, cors.headers)
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_CHARS) return json({ error: { message: 'Selfie payload is too large.' } }, 413, cors.headers)
  if (styleNames.length > MAX_STYLE_NAMES_CHARS) return json({ error: { message: 'Style list is too large.' } }, 413, cors.headers)

  const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return json({ error: 'Invalid image data URL' }, 400, cors.headers)
  const [, mediaType, base64Data] = match

  try {
    const data = await callClaude(env, buildBeautySystemPrompt(styleNames, lang), [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
      { type: 'text', text: 'Analyze only the visible color information needed for makeup selection and return the requested JSON.' },
    ], { model: visionModel, maxTokens: 700 })
    return json(data, 200, cors.headers)
  } catch (err) {
    console.error('[analyze-room] vision Error:', err)
    return json({ error: { message: err instanceof Error ? err.message : 'Unknown error' } }, 500, cors.headers)
  }
}

function normalizeUpstreamError(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.detail === 'string' && record.detail.trim()) return record.detail
    if (typeof record.error === 'string' && record.error.trim()) return record.error
    if (typeof record.message === 'string' && record.message.trim()) return record.message
    if (Array.isArray(record.detail)) {
      const parts = record.detail.map((item) => {
        if (typeof item === 'string') return item
        if (!item || typeof item !== 'object') return null
        const detail = item as Record<string, unknown>
        const msg = typeof detail.msg === 'string' ? detail.msg : null
        const loc = Array.isArray(detail.loc) ? detail.loc.join('.') : null
        return [loc, msg].filter(Boolean).join(': ')
      }).filter(Boolean)
      if (parts.length) return parts.join(' | ')
    }
  }
  try {
    const serialized = JSON.stringify(data)
    if (serialized && serialized !== '{}') return serialized
  } catch {}
  return `Replicate request failed with status ${status}`
}

function validateProxyPath(method: string, path: string): boolean {
  if (method === 'POST') return /^\/v1\/models\/[^/]+\/[^/]+\/predictions$/.test(path)
  if (method === 'GET') return /^\/v1\/predictions\/[A-Za-z0-9_-]+$/.test(path)
  return false
}

async function handleReplicate(request: Request, env: Env): Promise<Response> {
  const cors = corsHeaders(request, 'GET, POST, OPTIONS', request.method === 'GET')
  if (request.method === 'OPTIONS') return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers })
  if (request.method !== 'GET' && request.method !== 'POST') return json({ detail: 'Method not allowed' }, 405, cors.headers)
  if (!cors.allowed && request.method === 'POST') return json({ detail: 'Cross-site prediction requests are not allowed.' }, 403, cors.headers)
  if (!env.REPLICATE_API_TOKEN) return json({ detail: 'REPLICATE_API_TOKEN is not configured on the server.' }, 500, cors.headers)

  const url = new URL(request.url)
  const upstreamPath = url.pathname.replace(/^\/api\/replicate/, '')
  if (!validateProxyPath(request.method, upstreamPath)) return json({ detail: 'Unsupported Replicate proxy path.' }, 404, cors.headers)

  let requestBody: string | undefined
  if (request.method === 'POST') {
    requestBody = await request.text()
    if (requestBody.length > MAX_JSON_CHARS) return json({ detail: 'Prediction request is too large.' }, 413, cors.headers)
  }

  try {
    const headers = new Headers({
      authorization: `Token ${env.REPLICATE_API_TOKEN}`,
      'content-type': 'application/json',
    })
    const prefer = request.headers.get('prefer')
    if (prefer) headers.set('prefer', prefer)

    const upstream = await fetch(`${REPLICATE_BASE}${upstreamPath}`, {
      method: request.method,
      headers,
      body: requestBody,
    })
    const responseText = await upstream.text()
    let data: unknown = {}
    if (responseText) {
      try { data = JSON.parse(responseText) } catch { data = responseText }
    }
    if (!upstream.ok) {
      const detail = normalizeUpstreamError(data, upstream.status)
      console.error('[replicate proxy] upstream error', { status: upstream.status, path: upstreamPath, detail })
      return json({ detail }, upstream.status, cors.headers)
    }
    return json(data, upstream.status, cors.headers)
  } catch (err) {
    console.error('[replicate proxy] proxy error', err)
    return json({ detail: err instanceof Error ? err.message : 'Replicate proxy error' }, 500, cors.headers)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/analyze-room') return handleAnalyzeRoom(request, env)
    if (url.pathname.startsWith('/api/replicate/')) return handleReplicate(request, env)
    return env.ASSETS.fetch(request)
  },
}
