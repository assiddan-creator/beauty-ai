export type CommercialFunnelEventName =
  | 'app_loaded'
  | 'selfie_camera_opened'
  | 'selfie_captured'
  | 'selfie_retaken'
  | 'selfie_confirmed'
  | 'selfie_cancelled'
  | 'selfie_native_fallback'
  | 'beauty_analysis_requested'
  | 'beauty_analysis_succeeded'
  | 'beauty_analysis_failed'
  | 'product_category_selected'
  | 'product_brand_selected'
  | 'product_selected'
  | 'product_shade_selected'
  | 'tryon_requested'
  | 'tryon_succeeded'
  | 'tryon_failed'
  | 'commerce_opened'
  | 'commerce_clicked'

type SafeDetail = Record<string, string | number | boolean>

type CommercialFunnelEvent = {
  name: CommercialFunnelEventName
  at: number
  detail?: SafeDetail
}

export type CommercialFunnelSnapshot = {
  sessionStartedAt: number | null
  eventCount: number
  counts: Record<CommercialFunnelEventName, number>
  rates: {
    selfieConfirmation: number | null
    selfieRetake: number | null
    analysisCompletion: number | null
    productToShadeSelection: number | null
    tryOnCompletion: number | null
    shopClickThrough: number | null
  }
}

const STORAGE_KEY = 'beauty-commercial-funnel-v1'
const MAX_EVENTS = 120
const SAFE_DETAIL_KEYS = new Set([
  'mode',
  'status',
  'type',
  'category',
  'brand',
  'productId',
  'productName',
  'shadeName',
  'lookName',
  'engine',
  'visibleItems',
])

let installed = false

function readEvents(): CommercialFunnelEvent[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter((event): event is CommercialFunnelEvent => {
      if (!event || typeof event !== 'object' || Array.isArray(event)) return false
      const candidate = event as Partial<CommercialFunnelEvent>
      return typeof candidate.name === 'string' && typeof candidate.at === 'number'
    }).slice(-MAX_EVENTS)
  } catch {
    return []
  }
}

function writeEvents(events: CommercialFunnelEvent[]) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {
    // Metrics must never interfere with the product experience.
  }
}

function sanitizeDetail(detail: Record<string, unknown> | undefined): SafeDetail | undefined {
  if (!detail) return undefined

  const safe: SafeDetail = {}
  Object.entries(detail).forEach(([key, value]) => {
    if (!SAFE_DETAIL_KEYS.has(key)) return
    if (typeof value === 'string') safe[key] = value.slice(0, 120)
    else if (typeof value === 'number' && Number.isFinite(value)) safe[key] = value
    else if (typeof value === 'boolean') safe[key] = value
  })

  return Object.keys(safe).length > 0 ? safe : undefined
}

export function recordCommercialFunnelEvent(
  name: CommercialFunnelEventName,
  detail?: Record<string, unknown>,
) {
  const events = readEvents()
  const safeDetail = sanitizeDetail(detail)
  events.push({ name, at: Date.now(), ...(safeDetail ? { detail: safeDetail } : {}) })
  writeEvents(events)

  window.dispatchEvent(new CustomEvent('beauty:funnel-updated', { detail: { name } }))
}

function rate(successes: number, attempts: number): number | null {
  return attempts > 0 ? Math.round((successes / attempts) * 1000) / 10 : null
}

export function getCommercialFunnelSnapshot(): CommercialFunnelSnapshot {
  const events = readEvents()
  const counts: Record<CommercialFunnelEventName, number> = {
    app_loaded: 0,
    selfie_camera_opened: 0,
    selfie_captured: 0,
    selfie_retaken: 0,
    selfie_confirmed: 0,
    selfie_cancelled: 0,
    selfie_native_fallback: 0,
    beauty_analysis_requested: 0,
    beauty_analysis_succeeded: 0,
    beauty_analysis_failed: 0,
    product_category_selected: 0,
    product_brand_selected: 0,
    product_selected: 0,
    product_shade_selected: 0,
    tryon_requested: 0,
    tryon_succeeded: 0,
    tryon_failed: 0,
    commerce_opened: 0,
    commerce_clicked: 0,
  }

  events.forEach((event) => {
    if (event.name in counts) counts[event.name] += 1
  })

  return {
    sessionStartedAt: events[0]?.at ?? null,
    eventCount: events.length,
    counts,
    rates: {
      selfieConfirmation: rate(counts.selfie_confirmed, counts.selfie_captured),
      selfieRetake: rate(counts.selfie_retaken, counts.selfie_captured),
      analysisCompletion: rate(counts.beauty_analysis_succeeded, counts.beauty_analysis_requested),
      productToShadeSelection: rate(counts.product_shade_selected, counts.product_category_selected),
      tryOnCompletion: rate(counts.tryon_succeeded, counts.tryon_requested),
      shopClickThrough: rate(counts.commerce_clicked, counts.commerce_opened),
    },
  }
}

declare global {
  interface Window {
    beautyCommercialFunnel?: () => CommercialFunnelSnapshot
  }
}

export function installCommercialFunnelTracking() {
  if (installed) return
  installed = true

  recordCommercialFunnelEvent('app_loaded')

  window.addEventListener('beauty:commerce-open', (event) => {
    const detail = event instanceof CustomEvent ? event.detail as Record<string, unknown> | undefined : undefined
    recordCommercialFunnelEvent('commerce_opened', detail)
  })

  window.addEventListener('beauty:commerce-click', (event) => {
    const detail = event instanceof CustomEvent ? event.detail as Record<string, unknown> | undefined : undefined
    // URL and any unexpected fields are intentionally discarded by sanitizeDetail().
    recordCommercialFunnelEvent('commerce_clicked', detail)
  })

  // First-party QA hook only. Nothing is transmitted to an analytics vendor.
  window.beautyCommercialFunnel = getCommercialFunnelSnapshot
}
