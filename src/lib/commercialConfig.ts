import { getCanonicalBeautyProduct } from './beautyCatalog'

export type CommercialAvailability = 'in_stock' | 'out_of_stock' | 'unknown'

export type CommercialProductLink = {
  id: string
  brand: string
  productName: string
  shadeName: string
  url: string
  priceLabel: string
  retailerSku: string
  availability: CommercialAvailability
}

export type CommercialConfig = {
  operatorName: string
  retailerName: string
  retailerUrl: string
  privacyContact: string
  purchaseLinks: Record<string, string>
  products: CommercialProductLink[]
  lookLinks: Record<string, string>
}

const EMPTY_CONFIG: CommercialConfig = {
  operatorName: '',
  retailerName: '',
  retailerUrl: '',
  privacyContact: '',
  purchaseLinks: {},
  products: [],
  lookLinks: {},
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

function safeAvailability(value: unknown): CommercialAvailability {
  if (value === 'in_stock' || value === 'out_of_stock') return value
  return 'unknown'
}

function normalizeUrlMap(value: unknown, maxEntries = 500): Record<string, string> {
  const output: Record<string, string> = {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) return output

  Object.entries(value as Record<string, unknown>)
    .slice(0, maxEntries)
    .forEach(([rawKey, candidate]) => {
      const key = safeString(rawKey, 160)
      const url = safeHttpUrl(candidate)
      if (key && url) output[key] = url
    })

  return output
}

function normalizeProducts(value: unknown): CommercialProductLink[] {
  if (!Array.isArray(value)) return []

  return value
    .slice(0, 500)
    .map((item): CommercialProductLink | null => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null
      const record = item as Record<string, unknown>

      const id = safeString(record.id, 120)
      const url = safeHttpUrl(record.url)
      const priceLabel = safeString(record.priceLabel, 80)
      const retailerSku = safeString(record.retailerSku, 120)
      const availability = safeAvailability(record.availability)

      if (!id || !url) return null

      const canonical = getCanonicalBeautyProduct(id)

      // For known Beauty AI product IDs, the canonical catalog owns the display
      // identity. Retailer config only needs the stable ID plus its own URL and
      // optional commercial metadata. This prevents a retailer feed typo from
      // changing the visible product/shade identity.
      const brand = canonical?.brand ?? safeString(record.brand, 120)
      const productName = canonical?.productName ?? safeString(record.productName, 180)
      const shadeName = canonical?.shadeName ?? safeString(record.shadeName, 140)

      // Unknown retailer-specific IDs are still allowed, but they must carry
      // their own complete visible identity so exact-product matching is safe.
      if (!brand || !productName || !shadeName) return null

      return {
        id,
        brand,
        productName,
        shadeName,
        url,
        priceLabel,
        retailerSku,
        availability,
      }
    })
    .filter((item): item is CommercialProductLink => Boolean(item))
}

function normalizeConfig(raw: unknown): CommercialConfig {
  if (!raw || typeof raw !== 'object') return EMPTY_CONFIG

  const record = raw as Record<string, unknown>
  const retailerUrl = safeHttpUrl(record.retailerUrl) ?? ''

  return {
    operatorName: safeString(record.operatorName),
    retailerName: safeString(record.retailerName),
    retailerUrl,
    privacyContact: safeString(record.privacyContact, 254),
    purchaseLinks: normalizeUrlMap(record.purchaseLinks),
    products: normalizeProducts(record.products),
    lookLinks: normalizeUrlMap(record.lookLinks, 200),
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
  const product = config.products.find((item) => item.id === productId)

  if (product?.availability === 'out_of_stock') return null

  return product?.url
    ?? config.purchaseLinks[productId]
    ?? null
}

export async function getLookPurchaseUrl(lookName: string): Promise<string | null> {
  const config = await loadCommercialConfig()
  return config.lookLinks[lookName] ?? null
}
