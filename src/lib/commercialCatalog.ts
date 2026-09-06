import {
  getCanonicalBeautyProduct,
  getLookCanonicalProducts,
  LOOK_PRODUCT_IDS,
  matchesCatalogProductInText,
  normalizeCatalogText,
} from './beautyCatalog'
import type {
  CommercialConfig,
  CommercialProductLink,
} from './commercialConfig'

export type ResolvedCommercialProduct = CommercialProductLink

function resolveProduct(config: CommercialConfig, productId: string): ResolvedCommercialProduct | null {
  const configured = config.products.find((product) => product.id === productId)
  if (configured?.availability === 'out_of_stock') return null

  const canonical = getCanonicalBeautyProduct(productId)
  const url = configured?.url ?? config.purchaseLinks[productId]
  if (!url) return null

  if (configured) return configured
  if (!canonical) return null

  return {
    id: canonical.id,
    brand: canonical.brand,
    productName: canonical.productName,
    shadeName: canonical.shadeName,
    url,
    priceLabel: '',
    retailerSku: '',
    availability: 'unknown',
  }
}

export function getConfiguredCommercialProducts(config: CommercialConfig): ResolvedCommercialProduct[] {
  const ids = new Set<string>([
    ...config.products.map((product) => product.id),
    ...Object.keys(config.purchaseLinks),
  ])

  return [...ids]
    .map((id) => resolveProduct(config, id))
    .filter((product): product is ResolvedCommercialProduct => Boolean(product))
}

export function findActiveLookName(pageText: string): string | null {
  if (!pageText) return null

  const normalized = normalizeCatalogText(pageText)
  const match = Object.keys(LOOK_PRODUCT_IDS).find((lookName) => {
    const normalizedLook = normalizeCatalogText(lookName)
    return normalizedLook.length > 0 && normalized.includes(normalizedLook)
  })

  return match ?? null
}

export function getActiveCommercialProducts(
  config: CommercialConfig,
  pageText: string,
  activeLookName: string | null,
  limit = 8,
): ResolvedCommercialProduct[] {
  if (!pageText) return []

  const configuredProducts = getConfiguredCommercialProducts(config)
  const visibleProducts = configuredProducts.filter((product) => matchesCatalogProductInText(pageText, product))

  if (!activeLookName) return visibleProducts.slice(0, limit)

  const lookProductIds = getLookCanonicalProducts(activeLookName).map((product) => product.id)
  const lookProducts = lookProductIds
    .map((id) => resolveProduct(config, id))
    .filter((product): product is ResolvedCommercialProduct => Boolean(product))

  const combined = [...lookProducts, ...visibleProducts]
  const seen = new Set<string>()

  return combined
    .filter((product) => {
      if (seen.has(product.id)) return false
      seen.add(product.id)
      return true
    })
    .slice(0, limit)
}
