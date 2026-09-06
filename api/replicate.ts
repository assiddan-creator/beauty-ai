// api/replicate.ts
// Vercel Serverless Function — restricted Replicate prediction proxy
//
// Security rules:
// - The Replicate token exists only on the server as REPLICATE_API_TOKEN.
// - The browser never receives the secret token.
// - Browser POST requests must be same-site.
// - The proxy exposes prediction creation/polling only, not the full Replicate API.
// - Large or unexpected payloads are rejected before upstream billing work begins.

import type { VercelRequest, VercelResponse } from '@vercel/node'

const REPLICATE_BASE = 'https://api.replicate.com'
const MAX_JSON_CHARS = 8_000_000

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

  // Same-origin GET polling may legitimately omit Origin/Referer.
  return req.method === 'GET' ? `https://${host}` : null
}

function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const allowedOrigin = sameSiteOrigin(req)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Prefer')
  res.setHeader('Cache-Control', 'no-store')

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    return true
  }

  return false
}

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

function validateProxyPath(method: string, path: string): boolean {
  if (method === 'POST') {
    return /^\/v1\/models\/[^/]+\/[^/]+\/predictions$/.test(path)
  }

  if (method === 'GET') {
    return /^\/v1\/predictions\/[A-Za-z0-9_-]+$/.test(path)
  }

  return false
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsAllowed = setCors(req, res)

  if (req.method === 'OPTIONS') {
    return corsAllowed ? res.status(204).end() : res.status(403).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  if (!corsAllowed && req.method === 'POST') {
    return res.status(403).json({ detail: 'Cross-site prediction requests are not allowed.' })
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

  if (!validateProxyPath(req.method, upstreamPath)) {
    return res.status(404).json({ detail: 'Unsupported Replicate proxy path.' })
  }

  let requestBody: string | undefined
  if (req.method === 'POST') {
    requestBody = JSON.stringify(req.body ?? {})
    if (requestBody.length > MAX_JSON_CHARS) {
      return res.status(413).json({ detail: 'Prediction request is too large.' })
    }
  }

  const upstreamUrl = `${REPLICATE_BASE}${upstreamPath}`

  try {
    const headers: Record<string, string> = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    }

    if (req.headers.prefer) {
      headers.Prefer = String(req.headers.prefer)
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      body: requestBody,
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
        path: upstreamPath,
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
