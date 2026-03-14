// api/replicate.ts
// Vercel Serverless Function — Replicate API Proxy
//
// מה הקובץ הזה עושה:
// ה-App שולח בקשות ל-/api/replicate/v1/predictions (ול-polling URLs)
// הקובץ הזה מקבל אותן ומעביר אותן ל-Replicate API האמיתי
// כך ה-REPLICATE_API_TOKEN נשמר בצד השרת ולא חשוף בדפדפן
//
// משתנה סביבה נדרש:
//   REPLICATE_API_TOKEN=r8_xxxxxxxxxxxx   (ב-.env וב-Vercel dashboard)
//
// שים לב: בפרויקט Vite+Vercel, המשתנה בשרת הוא REPLICATE_API_TOKEN (ללא VITE_)
// ה-VITE_ prefix הוא רק למשתנים שחשופים ל-browser

import type { VercelRequest, VercelResponse } from '@vercel/node'

const REPLICATE_BASE = 'https://api.replicate.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── CORS headers (for local dev) ──────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Prefer')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // ── Get token from server env ─────────────────────────────────────────────
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return res.status(500).json({
      detail: 'REPLICATE_API_TOKEN is not set on the server. Add it to your .env file and Vercel dashboard.',
    })
  }

  // ── Build the upstream URL ────────────────────────────────────────────────
  // req.url will be something like: /api/replicate/v1/predictions
  // or:                             /api/replicate/v1/predictions/abc123
  // We strip the /api/replicate prefix and forward the rest to Replicate
  const upstreamPath = (req.url ?? '').replace(/^\/api\/replicate/, '')
  const upstreamUrl = upstreamPath.includes('/predictions/')
    ? `${REPLICATE_BASE}${upstreamPath}`
    : `${REPLICATE_BASE}/v1/models/google/nano-banana-2/predictions`

  // ── Forward the request ───────────────────────────────────────────────────
  try {
    const headers: Record<string, string> = {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    }

    // Forward the Prefer header if present (used for wait=60 sync mode)
    if (req.headers['prefer']) {
      headers['Prefer'] = req.headers['prefer'] as string
    }

    const fetchOptions: RequestInit = {
      method: req.method ?? 'GET',
      headers,
    }

    // Only attach body for POST/PATCH requests
    if (req.method === 'POST' || req.method === 'PATCH') {
      fetchOptions.body = JSON.stringify(req.body)
    }

    const upstream = await fetch(upstreamUrl, fetchOptions)

    const data = await upstream.json()

    return res.status(upstream.status).json(data)
  } catch (err) {
    console.error('[replicate proxy] Error:', err)
    return res.status(500).json({
      detail: err instanceof Error ? err.message : 'Proxy error',
    })
  }
}
