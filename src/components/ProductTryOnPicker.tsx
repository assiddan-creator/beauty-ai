import { useMemo, useState } from 'react'
import {
  getAllBeautyBrands,
  getBeautyProductNamesForBrand,
  getBeautyProductShadesForBrand,
  type BeautyProductView,
} from '../lib/productCatalogFacade'
import { recordCommercialFunnelEvent } from '../lib/commercialAnalytics'

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
    <section className="mt-6" aria-label={lang === 'he' ? 'בחירת מוצר לאיפור וירטואלי' : 'Virtual try-on product selection'}>
      <div className="mb-6">
        <p className="font-display text-[11px] tracking-[0.28em] text-lacquer uppercase">{copy.kicker}</p>
        <h2 className={`mt-2 text-[26px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>{copy.title}</h2>
      </div>

      <ol className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em]">
        {STEPS.map((item, index) => {
          const currentIndex = STEPS.indexOf(step)
          const reached = index <= currentIndex
          return (
            <li key={item} className={reached ? 'text-ivory' : 'text-silver/40'}>
              {index > 0 && <span className="me-3 text-silver/30">/</span>}
              {copy[item]}
            </li>
          )
        })}
      </ol>

      {step !== 'brand' && (
        <button
          type="button"
          onClick={goBack}
          className="mb-5 text-[11px] tracking-[0.14em] uppercase text-silver transition-colors hover:text-ivory"
        >
          {copy.back}
        </button>
      )}

      {step === 'brand' && (
        <div className="flex flex-col">
          {brands.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                recordCommercialFunnelEvent('product_brand_selected', { brand: item })
                setBrand(item)
                setStep('product')
              }}
              className="flex items-center justify-between border-b border-white/[0.06] py-5 text-start transition-colors hover:text-lacquer"
            >
              <span className="font-display text-2xl text-ivory">{item}</span>
              <span className="text-[10px] tracking-[0.16em] uppercase text-silver">{copy.brand}</span>
            </button>
          ))}
        </div>
      )}

      {step === 'product' && (
        <div className="flex flex-col">
          {productNames.map((item) => {
            const productSample = getBeautyProductShadesForBrand(brand ?? '', item)[0]
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
                className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-5 text-start"
              >
                <span className="min-w-0">
                  <span className="block font-display text-xl leading-tight text-ivory">{item}</span>
                  {productSample && (
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-silver">
                      {productSample.category === 'blush' ? copy.blush : copy.lips}
                    </span>
                  )}
                </span>
                <span className="text-[10px] tracking-[0.16em] uppercase text-silver">{copy.product}</span>
              </button>
            )
          })}
        </div>
      )}

      {step === 'shade' && (
        <div className="grid grid-cols-1 gap-3">
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
              className="flex items-center gap-4 border border-white/[0.07] bg-shadow p-4 text-start transition-colors hover:border-lacquer/60 disabled:opacity-45"
            >
              <span
                className="h-14 w-14 shrink-0 rounded-full border border-white/15"
                style={{ background: item.swatchColor ?? '#2a2a2e' }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <strong className="block font-display text-lg text-ivory">{item.shadeName}</strong>
                {(item.shadeFamily || item.finish) && (
                  <small className="mt-1 block text-[11px] text-silver">
                    {[item.shadeFamily, item.finish].filter(Boolean).join(' · ')}
                  </small>
                )}
                <small className="mt-2 block text-[10px] text-silver/60">{copy.previewOnly}</small>
              </span>
              <span className="shrink-0 bg-lacquer px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ivory">
                {copy.tryOn}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
