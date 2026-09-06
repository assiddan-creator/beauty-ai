import { getCanonicalBeautyProduct, type CanonicalBeautyProduct } from './beautyCatalog'

export type ProductTryOnDetail = {
  id: string
  productType: 'lipstick' | 'gloss' | 'liner' | 'blush'
  shadeFamily: string
  finish: string
  swatchColor: string
  tryOnPrompt: string
}

export type ProductTryOnItem = CanonicalBeautyProduct & ProductTryOnDetail

// These are the products currently exposed by the legacy "specific product"
// flow in App.tsx. Identity (brand/product/shade/category) stays owned by the
// canonical Beauty AI catalog; this file owns only try-on-specific metadata.
export const PRODUCT_TRYON_DETAILS: ProductTryOnDetail[] = [
  {
    id: 'mac-velvet-teddy',
    productType: 'lipstick',
    shadeFamily: 'warm nude',
    finish: 'matte',
    swatchColor: '#C4846A',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC MACximal Silky Matte Lipstick in shade Velvet Teddy — a warm nude beige matte lipstick — precisely on the lips with clean edges and natural elegant payoff. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'mac-ruby-woo',
    productType: 'lipstick',
    shadeFamily: 'classic red',
    finish: 'matte',
    swatchColor: '#C0182A',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC MACximal Silky Matte Lipstick in shade Ruby Woo — a vivid retro red matte lipstick — precisely on the lips with crisp clean edges and confident saturated payoff. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'mac-mehr',
    productType: 'lipstick',
    shadeFamily: 'dusty rose',
    finish: 'matte',
    swatchColor: '#B5707A',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC MACximal Silky Matte Lipstick in shade Mehr — a muted dusty rose matte lipstick — precisely on the lips with soft blended edges and feminine elegant payoff. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'dior-lip-maximizer-001',
    productType: 'gloss',
    shadeFamily: 'cool pink',
    finish: 'glossy',
    swatchColor: '#E8A0B0',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply Dior Addict Lip Maximizer in shade 001 Pink — a fresh cool pink glossy plumping lip gloss — on the lips with reflective shine and hydrated glossy finish. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'dior-lip-maximizer-018',
    productType: 'gloss',
    shadeFamily: 'warm coral',
    finish: 'glossy',
    swatchColor: '#C96A4A',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply Dior Addict Lip Maximizer in shade 018 Intense Spice — a warm spiced coral glossy lip plumper — on the lips with juicy reflective shine and warm rich dimension. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'nars-dragon-girl',
    productType: 'lipstick',
    shadeFamily: 'classic red',
    finish: 'matte',
    swatchColor: '#B81C2E',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply NARS Powermatte Lipstick in Dragon Girl — a vivid cool red matte lipstick — precisely on the lips with crisp elegant edges and confident saturated color payoff. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'charlotte-pillow-talk',
    productType: 'lipstick',
    shadeFamily: 'rosy nude',
    finish: 'satin-matte',
    swatchColor: '#C48A8A',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply Charlotte Tilbury Matte Revolution Lipstick in Pillow Talk — a rosy nude satin-matte lipstick — on the lips with soft romantic color payoff and elegant blended edges. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'mac-spice-liner',
    productType: 'liner',
    shadeFamily: 'warm nude',
    finish: 'matte',
    swatchColor: '#A0614A',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC Lip Pencil in Spice — a warm nude-brown lip liner — around the natural lip border with soft blended definition creating a flattering warm nude lip shape. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'nars-blush-taj-mahal',
    productType: 'blush',
    shadeFamily: 'terracotta',
    finish: 'satin',
    swatchColor: '#C8724A',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply NARS Powder Blush in Taj Mahal — a warm terracotta-orange blush with golden satin finish — on the cheeks with soft diffused edges blended upward for a sun-warmed lifted effect. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'nars-blush-dolce-vita',
    productType: 'blush',
    shadeFamily: 'dusty rose',
    finish: 'matte',
    swatchColor: '#C07880',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply NARS Powder Blush in Dolce Vita — a dusty muted rose blush — high on the cheeks with softly diffused edges for a romantic lifted flush. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'mac-blush-melba',
    productType: 'blush',
    shadeFamily: 'peachy pink',
    finish: 'matte',
    swatchColor: '#E09880',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC Powder Blush in Melba — a soft peachy-pink blush — on the cheeks with a clearly visible peachy flush, blended upward for a fresh natural lift. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
  {
    id: 'rare-beauty-joy',
    productType: 'blush',
    shadeFamily: 'peach coral',
    finish: 'dewy',
    swatchColor: '#E8805A',
    tryOnPrompt: 'Beauty makeup virtual try-on. Apply Rare Beauty Soft Pinch Liquid Blush in Joy — a fresh peach-coral liquid blush — high on the cheeks with softly diffused lifted placement for a breezy warm flush. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.',
  },
]

const DETAIL_BY_ID = new Map(PRODUCT_TRYON_DETAILS.map((detail) => [detail.id, detail]))

export function getProductTryOnItem(productId: string): ProductTryOnItem | null {
  const identity = getCanonicalBeautyProduct(productId)
  const detail = DETAIL_BY_ID.get(productId)
  if (!identity || !detail) return null
  return { ...identity, ...detail }
}

export function getProductTryOnCatalog(): ProductTryOnItem[] {
  return PRODUCT_TRYON_DETAILS
    .map((detail) => getProductTryOnItem(detail.id))
    .filter((product): product is ProductTryOnItem => Boolean(product))
}

export function getProductTryOnBrands(category: CanonicalBeautyProduct['category']): string[] {
  return [...new Set(
    getProductTryOnCatalog()
      .filter((product) => product.category === category)
      .map((product) => product.brand),
  )]
}

export function getProductTryOnProductsByBrand(
  category: CanonicalBeautyProduct['category'],
  brand: string,
): ProductTryOnItem[] {
  return getProductTryOnCatalog().filter(
    (product) => product.category === category && product.brand === brand,
  )
}
