import type { BeautyProductView } from './productCatalogFacade'

export type ProductPromptBuilderInput = {
  brand: string
  productName: string
  shadeName: string
  category: BeautyProductView['category']
  productType?: BeautyProductView['productType']
  shadeFamily?: string
  finish?: string
  swatchColor?: string
}

const STRICT_EDIT_RULE = [
  'STRICT EDITING RULE: Do not zoom in, crop, reframe, or change the field of view in any way.',
  'The face must remain at the exact same size and position as in the original photo.',
  'Preserve identity, facial proportions, skin texture, hair, clothing, background, lighting, camera angle, and expression.',
].join(' ')

export function toProductPromptBuilderInput(product: BeautyProductView): ProductPromptBuilderInput {
  return {
    brand: product.brand,
    productName: product.productName,
    shadeName: product.shadeName,
    category: product.category,
    ...(product.productType ? { productType: product.productType } : {}),
    ...(product.shadeFamily ? { shadeFamily: product.shadeFamily } : {}),
    ...(product.finish ? { finish: product.finish } : {}),
    ...(product.swatchColor ? { swatchColor: product.swatchColor } : {}),
  }
}

export function composeProductTryOnPrompt(
  product: BeautyProductView,
  aiPrompt?: string | null,
): string {
  const selectedPrompt = aiPrompt?.trim() || product.tryOnPrompt

  return [
    STRICT_EDIT_RULE,
    selectedPrompt,
    'Apply only the requested cosmetic product. Do not add unrelated makeup or beautification.',
    'Output a photorealistic cosmetic edit suitable for visual comparison with the original photo.',
  ].join('\n\n')
}

export function getProductTryOnResultLabel(product: BeautyProductView): string {
  return `${product.brand} ${product.shadeName}`
}

export function hasVerifiedTryOnMetadata(product: BeautyProductView): boolean {
  return Boolean(
    product.productType
    && product.shadeFamily
    && product.finish
    && product.swatchColor,
  )
}
