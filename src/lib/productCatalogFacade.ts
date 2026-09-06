import {
  CANONICAL_BEAUTY_PRODUCTS,
  getCanonicalBeautyProduct,
  getLookCanonicalProducts,
  type CanonicalBeautyProduct,
} from './beautyCatalog'
import {
  getProductTryOnItem,
  type ProductTryOnItem,
} from './productTryOnCatalog'

export type BeautyProductView = CanonicalBeautyProduct & {
  productType?: ProductTryOnItem['productType']
  shadeFamily?: string
  finish?: string
  swatchColor?: string
  tryOnPrompt: string
}

function fallbackTryOnPrompt(product: CanonicalBeautyProduct): string {
  const target = product.category === 'blush' ? 'cheeks' : 'lips'
  return [
    'Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested cosmetic product.',
    `Apply ${product.brand} ${product.productName} in shade ${product.shadeName} to the ${target}.`,
    'Match the requested product and shade as closely as a visual AI preview can, with realistic cosmetic placement and natural edges.',
    'Preserve the person’s exact identity, facial structure, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.',
    'Do not reshape the face, retouch the skin, add unrelated makeup, crop, zoom, reframe, or change the scene.',
    'Photorealistic cosmetic edit. Visual try-on preview only.',
  ].join(' ')
}

export function getBeautyProductView(productId: string): BeautyProductView | null {
  const canonical = getCanonicalBeautyProduct(productId)
  if (!canonical) return null

  const rich = getProductTryOnItem(productId)
  if (rich) return { ...rich }

  return {
    ...canonical,
    tryOnPrompt: fallbackTryOnPrompt(canonical),
  }
}

export function getAllBeautyProductViews(): BeautyProductView[] {
  return CANONICAL_BEAUTY_PRODUCTS
    .map((product) => getBeautyProductView(product.id))
    .filter((product): product is BeautyProductView => Boolean(product))
}

export function getLookProductViews(lookName: string): BeautyProductView[] {
  return getLookCanonicalProducts(lookName)
    .map((product) => getBeautyProductView(product.id))
    .filter((product): product is BeautyProductView => Boolean(product))
}

export function getBeautyProductCategories(): CanonicalBeautyProduct['category'][] {
  return ['lips', 'blush']
}

export function getBeautyProductBrands(category: CanonicalBeautyProduct['category']): string[] {
  return [...new Set(
    getAllBeautyProductViews()
      .filter((product) => product.category === category)
      .map((product) => product.brand),
  )]
}

export function getBeautyProductsByBrand(
  category: CanonicalBeautyProduct['category'],
  brand: string,
): BeautyProductView[] {
  return getAllBeautyProductViews().filter(
    (product) => product.category === category && product.brand === brand,
  )
}

export function getBeautyProductNames(
  category: CanonicalBeautyProduct['category'],
  brand: string,
): string[] {
  return [...new Set(
    getBeautyProductsByBrand(category, brand).map((product) => product.productName),
  )]
}

export function getBeautyProductShades(
  category: CanonicalBeautyProduct['category'],
  brand: string,
  productName: string,
): BeautyProductView[] {
  return getBeautyProductsByBrand(category, brand)
    .filter((product) => product.productName === productName)
}
