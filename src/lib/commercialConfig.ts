export type CommercialConfig = {
  operatorName: string
  retailerName: string
  privacyContact: string
  purchaseLinks: Record<string, string>
}

const EMPTY_CONFIG: CommercialConfig = {
  operatorName: '',
  retailerName: '',
  privacyContact: '',
  purchaseLinks: {},
}

let configPromise: Promise<CommercialConfig> | null = null

function safeString(value: unknown, maxLength = 160): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url.toString()
  } catch {
    return null
  }
}

function normalizeConfig(raw: unknown): CommercialConfig {
  if (!raw || typeof raw !== 'object') return EMPTY_CONFIG

  const record = raw as Record<string, unknown>
  const purchaseLinks: Record<string, string> = {}
  const links = record.purchaseLinks

  if (links && typeof links === 'object' && !Array.isArray(links)) {
    Object.entries(links as Record<string, unknown>)
      .slice(0, 500)
      .forEach(([productId, candidate]) => {
        const cleanId = safeString(productId, 120)
        const cleanUrl = safeHttpUrl(candidate)
        if (cleanId && cleanUrl) purchaseLinks[cleanId] = cleanUrl
      })
  }

  return {
    operatorName: safeString(record.operatorName),
    retailerName: safeString(record.retailerName),
    privacyContact: safeString(record.privacyContact, 254),
    purchaseLinks,
  }
}

export function loadCommercialConfig(): Promise<CommercialConfig> {
  if (!configPromise) {
    configPromise = fetch('/commercial-config.json', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return EMPTY_CONFIG
        return normalizeConfig(await response.json().catch(() => null))
      })
      .catch(() => EMPTY_CONFIG)
  }

  return configPromise
}

export async function getPurchaseUrl(productId: string): Promise<string | null> {
  const config = await loadCommercialConfig()
  return config.purchaseLinks[productId] ?? null
}
