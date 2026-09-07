import { useMemo, useState } from 'react'
import {
  getAllBeautyBrands,
  getBeautyProductNamesForBrand,
  getBeautyProductShadesForBrand,
  type BeautyProductView,
} from '../lib/productCatalogFacade'
import { recordCommercialFunnelEvent } from '../lib/commercialAnalytics'
import { shadeMetaLabel } from '../vesti/lookDirection'

type UiLanguage = 'he' | 'en'
type Step = 'brand' | 'product' | 'shade'

type ProductTryOnPickerProps = {
  lang: UiLanguage
  disabled?: boolean
  onTryOn: (product: BeautyProductView) => void | Promise<void>
}

const COPY = {
  he: {
    kicker: 'Atelier',
    title: 'מוצר ספציפי',
    brand: 'מותג',
    product: 'מוצר',
    shade: 'גוון',
    back: 'חזרה',
    lips: 'שפתיים',
    blush: 'סומק',
    previewOnly: 'תצוגה וירטואלית משוערת',
    tryOn: 'נסי עליי',
    selectBrand: 'בחרי מותג',
  },
  en: {
    kicker: 'Atelier',
    title: 'Specific Product',
    brand: 'Brand',
    product: 'Product',
    shade: 'Shade',
    back: 'Back',
    lips: 'Lips',
    blush: 'Blush',
    previewOnly: 'Approximate virtual preview',
    tryOn: 'Try on me',
    selectBrand: 'Choose a brand',
  },
} as const

const STEPS: Step[] = ['brand', 'product', 'shade']

export default function ProductTryOnPicker({ lang, disabled = false, onTryOn }: ProductTryOnPickerProps) {
  const copy = COPY[lang]
  const [step, setStep] = useState<Step>('brand')
  const [brand, setBrand] = useState<string | null>(null)
  const [productName, setProductName] = useState<string | null>(null)

  const brands = useMemo(() => getAllBeautyBrands(), [])
  const productNames = useMemo(() => brand ? getBeautyProductNamesForBrand(brand) : [], [brand])
  const shades = useMemo(
    () => brand && productName ? getBeautyProductShadesForBrand(brand, productName) : [],
    [brand, productName],
  )

  const goBack = () => {
    if (step === 'shade') {
      setProductName(null)
      setStep('product')
      return
    }
    if (step === 'product') {
      setBrand(null)
      setStep('brand')
    }
  }

  return (
    <section id="vesti-product" className="mt-6 overflow-x-hidden pb-8" aria-labelledby="vesti-product-title">
      <div className="mb-5">
        <p className="text-[11px] font-medium tracking-[0.22em] text-ivory uppercase">{copy.kicker}</p>
        <h1 id="vesti-product-title" className={`mt-2 text-[26px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>{copy.title}</h1>
      </div>

      <ol className="mb-6 grid grid-cols-3 text-center">
        {STEPS.map((item, index) => {
          const active = step === item
          const reached = STEPS.indexOf(step) >= index
          return (
            <li
              key={item}
              className={`min-h-11 border-b-2 py-2.5 ${
                active
                  ? 'border-lacquer text-ivory'
                  : reached
                    ? 'border-white/25 text-silver'
                    : 'border-white/10 text-silver'
              }`}
            >
              <span className="block text-[10px] font-medium tracking-[0.16em] text-silver">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="mt-1 block text-[11px] font-medium">{copy[item]}</span>
            </li>
          )
        })}
      </ol>

      {step !== 'brand' && (
        <button
          type="button"
          onClick={goBack}
          className="vesti-focus mb-4 inline-flex min-h-11 min-w-11 items-center px-2 text-sm text-silver hover:text-ivory"
        >
          {copy.back}
        </button>
      )}

      {step === 'brand' && (
        <div className="flex flex-col">
          {brands.map((item) => {
            const count = getBeautyProductNamesForBrand(item).length
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  recordCommercialFunnelEvent('product_brand_selected', { brand: item })
                  setBrand(item)
                  setStep('product')
                }}
                className="vesti-focus group flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-white/10 px-3 py-4 text-start transition-colors hover:bg-shadow"
              >
                <span className="min-w-0">
                  <span className="block font-display text-[22px] leading-tight text-ivory group-hover:text-ivory">{item}</span>
                  <span className="mt-1 block text-[11px] font-medium text-silver">
                    {copy.selectBrand} · {count}
                  </span>
                </span>
                <span className="text-lg leading-none text-silver group-hover:text-lacquer" aria-hidden="true">›</span>
              </button>
            )
          })}
        </div>
      )}

      {step === 'product' && (
        <div className="flex flex-col">
          {brand && (
            <div className="mb-4 border border-white/10 bg-shadow px-4 py-4">
              <p className="text-[10px] font-medium tracking-[0.16em] text-silver uppercase">{copy.brand}</p>
              <p className="mt-1 font-display text-2xl text-ivory">{brand}</p>
            </div>
          )}
          {productNames.map((item) => {
            const productSample = getBeautyProductShadesForBrand(brand ?? '', item)[0]
            const shadeCount = getBeautyProductShadesForBrand(brand ?? '', item).length
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  recordCommercialFunnelEvent('product_selected', {
                    category: productSample?.category ?? '',
                    brand: brand ?? '',
                    productName: item,
                  })
                  setProductName(item)
                  setStep('shade')
                }}
                className="vesti-focus group flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-white/10 px-3 py-4 text-start hover:bg-shadow"
              >
                <span className="min-w-0">
                  <span className="block text-base font-medium leading-snug text-ivory">{item}</span>
                  {productSample && (
                    <span className="mt-1 block text-[11px] font-medium text-silver">
                      {productSample.category === 'blush' ? copy.blush : copy.lips} · {shadeCount}
                    </span>
                  )}
                </span>
                <span className="text-lg leading-none text-silver group-hover:text-lacquer" aria-hidden="true">›</span>
              </button>
            )
          })}
        </div>
      )}

      {step === 'shade' && (
        <div className="flex flex-col gap-2">
          {productName && (
            <div className="mb-3 border border-white/10 bg-shadow px-4 py-4">
              <p className="text-[10px] font-medium tracking-[0.16em] text-silver uppercase">{copy.product}</p>
              <p className="mt-1 text-sm font-medium text-ivory">{brand}</p>
              <p className="mt-1 font-display text-xl text-ivory">{productName}</p>
            </div>
          )}
          {shades.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                recordCommercialFunnelEvent('product_shade_selected', {
                  category: item.category,
                  brand: item.brand,
                  productId: item.id,
                  productName: item.productName,
                  shadeName: item.shadeName,
                })
                onTryOn(item)
              }}
              className="vesti-focus flex min-h-11 items-center gap-4 border border-white/10 bg-carbon p-3 text-start hover:border-white/25 disabled:opacity-45"
            >
              <span
                className="h-14 w-14 shrink-0 rounded-full border border-white/25"
                style={{ background: item.swatchColor ?? '#2a2a2e' }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <strong className="block text-base font-medium text-ivory">{item.shadeName}</strong>
                {(item.shadeFamily || item.finish) && (
                  <small className="mt-1 block text-[12px] text-silver">
                    {shadeMetaLabel(item.shadeFamily, item.finish, lang)}
                  </small>
                )}
              </span>
              <span className="flex min-h-11 shrink-0 items-center bg-lacquer px-3 text-[11px] font-semibold text-ivory">
                {copy.tryOn}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
