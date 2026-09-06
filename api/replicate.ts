// api/replicate.ts
// Vercel Serverless Function — Replicate API Proxy
//
// Security rules:
// - The Replicate token exists only on the server as REPLICATE_API_TOKEN.
// - The browser never needs (or receives) the secret token.
// - Upstream Replicate errors are normalized so the UI gets the real reason
//   instead of a generic 4xx message.

import type { VercelRequest, VercelResponse } from '@vercel/node'

const REPLICATE_BASE = 'https://api.replicate.com'

function normalizeUpstreamError(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim()) return data

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>

    if (typeof record.detail === 'string' && record.detail.trim()) return record.detail
    if (typeof record.error === 'string' && record.error.trim()) return record.error
    if (typeof record.message === 'string' && record.message.trim()) return record.message

    if (Array.isArray(record.detail)) {
      const parts = record.detail
        .map((item) => {
          if (typeof item === 'string') return item
          if (!item || typeof item !== 'object') return null
          const detail = item as Record<string, unknown>
          const msg = typeof detail.msg === 'string' ? detail.msg : null
          const loc = Array.isArray(detail.loc) ? detail.loc.join('.') : null
          return [loc, msg].filter(Boolean).join(': ')
        })
        .filter(Boolean)

      if (parts.length) return parts.join(' | ')
    }
  }

  try {
    const json = JSON.stringify(data)
    if (json && json !== '{}') return json
  } catch {
    // Ignore serialization failures and use the fallback below.
  }

  return `Replicate request failed with status ${status}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Prefer')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return res.status(500).json({
      detail: 'REPLICATE_API_TOKEN is not configured on the server.',
    })
  }

  // req.url is expected to contain the original nested path because vercel.json
  // rewrites /api/replicate/* to this function.
  const upstreamPath = (req.url ?? '').replace(/^\/api\/replicate/, '')

  const upstreamUrl =
    upstreamPath.startsWith('/v1/')
      ? `${REPLICATE_BASE}${upstreamPath}`
      : `${REPLICATE_BASE}/v1/models/google/nano-banana-2/predictions`

  try {
    const headers: Record<string, string> = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    }

    if (req.headers.prefer) {
      headers.Prefer = String(req.headers.prefer)
    }

    const fetchOptions: RequestInit = {
      method: req.method ?? 'GET',
      headers,
    }

    if (req.method === 'POST' || req.method === 'PATCH') {
      fetchOptions.body = JSON.stringify(req.body)
    }

    const upstream = await fetch(upstreamUrl, fetchOptions)
    const responseText = await upstream.text()

    let data: unknown = {}
    if (responseText) {
      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }
    }

    if (!upstream.ok) {
      const detail = normalizeUpstreamError(data, upstream.status)
      console.error('[replicate proxy] upstream error', {
        status: upstream.status,
        path: upstreamPath || '/v1/models/google/nano-banana-2/predictions',
        detail,
      })
      return res.status(upstream.status).json({ detail })
    }

    return res.status(upstream.status).json(data)
  } catch (err) {
    console.error('[replicate proxy] proxy error', err)
    return res.status(500).json({
      detail: err instanceof Error ? err.message : 'Replicate proxy error',
    })
  }
}
