export type CanonicalBeautyProduct = {
  id: string
  brand: string
  productName: string
  shadeName: string
  category: 'lips' | 'blush'
  aliases?: string[]
}

// Canonical product identities are intentionally separate from retailer URLs.
// A retailer can map these stable IDs to its own SKU/URL without changing the
// display names used by legacy looks inside App.tsx.
export const CANONICAL_BEAUTY_PRODUCTS: CanonicalBeautyProduct[] = [
  {
    id: 'mac-velvet-teddy',
    brand: 'MAC',
    productName: 'MACximal Silky Matte Lipstick',
    shadeName: 'Velvet Teddy',
    category: 'lips',
    aliases: ['M·A·Cximal Silky Matte Lipstick'],
  },
  {
    id: 'mac-ruby-woo',
    brand: 'MAC',
    productName: 'MACximal Silky Matte Lipstick',
    shadeName: 'Ruby Woo',
    category: 'lips',
    aliases: ['M·A·Cximal Silky Matte Lipstick'],
  },
  {
    id: 'mac-mehr',
    brand: 'MAC',
    productName: 'MACximal Silky Matte Lipstick',
    shadeName: 'Mehr',
    category: 'lips',
    aliases: ['M·A·Cximal Silky Matte Lipstick'],
  },
  { id: 'mac-spice-liner', brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Spice', category: 'lips' },
  { id: 'mac-whirl-liner', brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
  { id: 'mac-blush-melba', brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', category: 'blush' },
  { id: 'mac-lustreglass-hug-me', brand: 'MAC', productName: 'Lustreglass Sheer-Shine Lipstick', shadeName: 'Hug Me', category: 'lips' },

  { id: 'dior-lip-maximizer-001', brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '001 Pink', category: 'lips' },
  { id: 'dior-lip-maximizer-018', brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '018 Intense Spice', category: 'lips' },
  { id: 'dior-backstage-rosy-glow-001', brand: 'Dior', productName: 'Backstage Rosy Glow', shadeName: '001 Pink', category: 'blush' },

  { id: 'nars-dragon-girl', brand: 'NARS', productName: 'Powermatte Lipstick', shadeName: 'Dragon Girl', category: 'lips' },
  { id: 'nars-blush-taj-mahal', brand: 'NARS', productName: 'Powder Blush', shadeName: 'Taj Mahal', category: 'blush', aliases: ['Blush'] },
  { id: 'nars-blush-dolce-vita', brand: 'NARS', productName: 'Powder Blush', shadeName: 'Dolce Vita', category: 'blush', aliases: ['Blush'] },
  { id: 'nars-liner-halong-bay', brand: 'NARS', productName: 'Precision Lip Liner', shadeName: 'Halong Bay', category: 'lips' },
  { id: 'nars-liner-vence', brand: 'NARS', productName: 'Precision Lip Liner', shadeName: 'Vence', category: 'lips' },

  { id: 'charlotte-pillow-talk', brand: 'Charlotte Tilbury', productName: 'Matte Revolution Lipstick', shadeName: 'Pillow Talk', category: 'lips' },
  { id: 'kiko-3d-hydra-19', brand: 'Kiko Milano', productName: '3D Hydra Lipgloss', shadeName: '19', category: 'lips' },
  { id: 'ysl-loveshine-44-nude-lavalliere', brand: 'YSL', productName: 'Loveshine Lip Oil Stick', shadeName: '44 Nude Lavalliere', category: 'lips' },
  { id: 'fenty-gloss-bomb-fenty-glow', brand: 'Fenty Beauty', productName: 'Gloss Bomb', shadeName: 'Fenty Glow', category: 'lips' },
  { id: 'rare-beauty-joy', brand: 'Rare Beauty', productName: 'Soft Pinch Liquid Blush', shadeName: 'Joy', category: 'blush' },

  { id: 'bobbi-crushed-lip-babe', brand: 'Bobbi Brown', productName: 'Crushed Lip Color', shadeName: 'Babe', category: 'lips' },
  { id: 'bobbi-blush-nude-peach', brand: 'Bobbi Brown', productName: 'Blush', shadeName: 'Nude Peach', category: 'blush' },

  { id: 'maybelline-superstay-15-lover', brand: 'Maybelline', productName: 'SuperStay Matte Ink', shadeName: '15 Lover', category: 'lips' },
  { id: 'maybelline-lifter-liner-big-lift', brand: 'Maybelline', productName: 'Lifter Liner', shadeName: 'Big Lift', category: 'lips' },

  { id: 'gade-idyllic-blush-46-pacific-pink', brand: 'Ga-De', productName: 'Idyllic Soft Satin Blush', shadeName: '46 Pacific Pink', category: 'blush' },
  { id: 'gade-crystal-lights-sunstone', brand: 'Ga-De', productName: 'Crystal Lights Lip Gloss', shadeName: 'Sunstone', category: 'lips' },
  { id: 'careline-everlast-703-pinkish-brown', brand: 'Careline', productName: 'Everlast Liquid Lipstick', shadeName: '703 Pinkish Brown', category: 'lips' },
]

export const LOOK_PRODUCT_IDS: Record<string, string[]> = {
  'Natural Everyday': ['mac-velvet-teddy', 'mac-spice-liner', 'mac-blush-melba'],
  'Clean Glow': ['dior-lip-maximizer-001', 'mac-spice-liner', 'mac-blush-melba'],
  'Office Polished': ['mac-velvet-teddy', 'mac-whirl-liner', 'mac-blush-melba'],
  'Soft Glam': ['kiko-3d-hydra-19', 'mac-whirl-liner', 'mac-blush-melba'],
  'Classic Red Lip': ['nars-dragon-girl', 'mac-whirl-liner', 'mac-blush-melba'],
  'Warm Bronze': ['mac-spice-liner', 'kiko-3d-hydra-19', 'nars-blush-taj-mahal'],
  'Cool Chic': ['mac-whirl-liner', 'dior-lip-maximizer-001', 'mac-blush-melba'],
  'Minimal Grooming': ['dior-lip-maximizer-001', 'mac-spice-liner', 'mac-blush-melba'],
  'Date Night Romantic': ['charlotte-pillow-talk', 'mac-whirl-liner', 'nars-blush-dolce-vita'],
  'Evening Luxury': ['ysl-loveshine-44-nude-lavalliere', 'nars-liner-halong-bay', 'dior-backstage-rosy-glow-001'],
  'Fresh Rosy': ['dior-lip-maximizer-001', 'mac-whirl-liner', 'dior-backstage-rosy-glow-001'],
  'Nude Sculpt': ['charlotte-pillow-talk', 'mac-whirl-liner', 'nars-blush-dolce-vita'],
  'Peach Pop': ['fenty-gloss-bomb-fenty-glow', 'mac-spice-liner', 'rare-beauty-joy'],
  'Rosewood Satin': ['bobbi-crushed-lip-babe', 'nars-liner-halong-bay', 'gade-idyllic-blush-46-pacific-pink'],
  'Berry Chic': ['maybelline-superstay-15-lover', 'mac-whirl-liner', 'dior-backstage-rosy-glow-001'],
  'Terracotta Nude': ['mac-velvet-teddy', 'nars-liner-vence', 'nars-blush-taj-mahal'],
  'Glass Nude': ['mac-lustreglass-hug-me', 'nars-liner-halong-bay', 'bobbi-blush-nude-peach'],
  'Coral Breeze': ['dior-lip-maximizer-018', 'mac-spice-liner', 'rare-beauty-joy'],
  'Power Nude': ['careline-everlast-703-pinkish-brown', 'mac-whirl-liner', 'gade-idyllic-blush-46-pacific-pink'],
  'Local Chic': ['gade-crystal-lights-sunstone', 'maybelline-lifter-liner-big-lift', 'gade-idyllic-blush-46-pacific-pink'],
}

const PRODUCT_BY_ID = new Map(CANONICAL_BEAUTY_PRODUCTS.map((product) => [product.id, product]))

export function normalizeCatalogText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[·•|]/g, ' ')
    .replace(/[™®©]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function textContains(pageText: string, value: string): boolean {
  const normalized = normalizeCatalogText(value)
  return normalized.length > 0 && pageText.includes(normalized)
}

export function getCanonicalBeautyProduct(productId: string): CanonicalBeautyProduct | null {
  return PRODUCT_BY_ID.get(productId) ?? null
}

export function getLookCanonicalProducts(lookName: string): CanonicalBeautyProduct[] {
  return (LOOK_PRODUCT_IDS[lookName] ?? [])
    .map((id) => PRODUCT_BY_ID.get(id))
    .filter((product): product is CanonicalBeautyProduct => Boolean(product))
}

export function matchesCatalogProductInText(
  pageText: string,
  product: { id: string; brand: string; productName: string; shadeName: string },
): boolean {
  const normalizedPage = normalizeCatalogText(pageText)
  const canonical = PRODUCT_BY_ID.get(product.id)

  if (!canonical) {
    return textContains(normalizedPage, product.brand)
      && textContains(normalizedPage, product.productName)
      && textContains(normalizedPage, product.shadeName)
  }

  const productNames = [canonical.productName, ...(canonical.aliases ?? [])]
  const hasProductName = productNames.some((candidate) => textContains(normalizedPage, candidate))

  return textContains(normalizedPage, canonical.brand)
    && hasProductName
    && textContains(normalizedPage, canonical.shadeName)
}
