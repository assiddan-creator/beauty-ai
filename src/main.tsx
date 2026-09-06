import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import CommercialTrustLayer from './CommercialTrustLayer.tsx'
import CommercialPurchaseLayer from './CommercialPurchaseLayer.tsx'

const MAX_INLINE_IMAGE_CHARS = 320_000
const HISTORY_STORAGE_KEY = 'beauty-tryon-history-v1'
const LOCAL_RESULT_TTL_MS = 50 * 60 * 1000
const MAX_LOCAL_HISTORY = 12

type LocalHistoryCandidate = {
  timestamp?: unknown
}

function pruneExpiredLocalResultHistory() {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY)
      return
    }

    const now = Date.now()
    const freshEntries = parsed
      .filter((entry): entry is LocalHistoryCandidate & Record<string, unknown> => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false
        const timestamp = (entry as LocalHistoryCandidate).timestamp
        return typeof timestamp === 'number'
          && Number.isFinite(timestamp)
          && timestamp > 0
          && now - timestamp >= 0
          && now - timestamp < LOCAL_RESULT_TTL_MS
      })
      .slice(0, MAX_LOCAL_HISTORY)

    if (freshEntries.length === 0) {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY)
      return
    }

    if (freshEntries.length !== parsed.length) {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(freshEntries))
    }
  } catch (error) {
    console.warn('[result history] could not prune local history', error)
  }
}

// Replicate API output URLs are short-lived. Prune local references before the
// React tree reads them so users do not accumulate dead "Preview expired" cards.
pruneExpiredLocalResultHistory()

async function imageBitmapFromBlob(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    return createImageBitmap(blob)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not decode image'))
    }
    img.src = url
  })
}

function sourceDimensions(source: ImageBitmap | HTMLImageElement) {
  if ('naturalWidth' in source) {
    return { width: source.naturalWidth, height: source.naturalHeight }
  }
  return { width: source.width, height: source.height }
}

async function compressImageDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith('data:image/') || dataUrl.length <= MAX_INLINE_IMAGE_CHARS) {
    return dataUrl
  }

  try {
    const blob = await fetch(dataUrl).then((res) => res.blob())
    const source = await imageBitmapFromBlob(blob)
    const original = sourceDimensions(source)
    const maxDimensions = [1280, 1120, 960, 800]
    const qualities = [0.86, 0.78, 0.7, 0.62, 0.54]

    let best = dataUrl

    for (const maxDimension of maxDimensions) {
      const scale = Math.min(1, maxDimension / Math.max(original.width, original.height))
      const width = Math.max(1, Math.round(original.width * scale))
      const height = Math.max(1, Math.round(original.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) continue

      ctx.drawImage(source, 0, 0, width, height)

      for (const quality of qualities) {
        const candidate = canvas.toDataURL('image/jpeg', quality)
        if (candidate.length < best.length) best = candidate
        if (candidate.length <= MAX_INLINE_IMAGE_CHARS) {
          if ('close' in source && typeof source.close === 'function') source.close()
          return candidate
        }
      }
    }

    if ('close' in source && typeof source.close === 'function') source.close()
    return best
  } catch (error) {
    console.warn('[image transport] compression skipped', error)
    return dataUrl
  }
}

async function compactInlineImages(value: unknown): Promise<unknown> {
  if (typeof value === 'string') {
    return value.startsWith('data:image/') ? compressImageDataUrl(value) : value
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => compactInlineImages(item)))
  }

  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [key, await compactInlineImages(item)] as const),
    )
    return Object.fromEntries(entries)
  }

  return value
}

// Temporary stabilization layer for the legacy single-file app.
// It keeps revoked client-side Replicate tokens from being forwarded and makes
// large phone selfies small enough for the Vercel JSON transport. Once App.tsx
// is split into services, this logic can move into the dedicated image client.
const nativeFetch = window.fetch.bind(window)
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  const url = new URL(rawUrl, window.location.href)
  const isSameOrigin = url.origin === window.location.origin
  const isReplicateProxy = isSameOrigin && url.pathname.startsWith('/api/replicate')
  const isBeautyApi = isSameOrigin && url.pathname === '/api/analyze-room'

  let nextInit = init ? { ...init } : undefined

  if (isReplicateProxy) {
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined))
    headers.delete('Authorization')
    nextInit = { ...(nextInit ?? {}), headers }
  }

  if ((isReplicateProxy || isBeautyApi) && typeof init?.body === 'string') {
    try {
      const parsed = JSON.parse(init.body) as unknown
      const compacted = await compactInlineImages(parsed)
      nextInit = { ...(nextInit ?? {}), body: JSON.stringify(compacted) }
    } catch {
      // Not JSON — let the original request continue unchanged.
    }
  }

  return nativeFetch(input, nextInit)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <CommercialTrustLayer />
    <CommercialPurchaseLayer />
  </StrictMode>,
)
