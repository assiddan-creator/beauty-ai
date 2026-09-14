import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CircleDot, Sparkles } from 'lucide-react'
import {
  getBeautyProductBrands,
  getBeautyProductCategories,
  getBeautyProductNames,
  getBeautyProductShades,
  type BeautyProductView,
} from '../lib/productCatalogFacade'
import { recordCommercialFunnelEvent } from '../lib/commercialAnalytics'
import { shadeMetaLabel } from '../vesti/lookDirection'

type UiLanguage = 'he' | 'en'
type Category = 'lips' | 'blush'
type Step = 'category' | 'brand' | 'product' | 'shade'

type ProductTryOnPickerProps = {
  lang: UiLanguage
  disabled?: boolean
  onTryOn: (product: BeautyProductView) => void | Promise<void>
}

const COPY = {
  he: {
    kicker: 'COLLECTION',
    title: 'בחרי מוצר וגוון',
    subtitle: 'התחילי באזור שתרצי לנסות. אפשר להחליף גוון בכל שלב.',
    category: 'אזור',
    brand: 'מותג',
    product: 'מוצר',
    shade: 'גוון',
    back: 'חזרה',
    lips: 'שפתיים',
    blush: 'סומק',
    lipsDescription: 'שפתונים, גלוסים ותוחמים',
    blushDescription: 'גווני סומק במרקמים שונים',
    tryOn: 'נסי עליי',
    shades: 'גוונים',
  },
  en: {
    kicker: 'COLLECTION',
    title: 'Choose a product and shade',
    subtitle: 'Start with the area you want to try. You can change shades at any time.',
    category: 'Area',
    brand: 'Brand',
    product: 'Product',
    shade: 'Shade',
    back: 'Back',
    lips: 'Lips',
    blush: 'Blush',
    lipsDescription: 'Lipsticks, glosses and liners',
    blushDescription: 'Blush shades in different finishes',
    tryOn: 'Try on me',
    shades: 'shades',
  },
} as const

const STEPS: Step[] = ['category', 'brand', 'product', 'shade']

export default function ProductTryOnPicker({ lang, disabled = false, onTryOn }: ProductTryOnPickerProps) {
  const copy = COPY[lang]
  const [step, setStep] = useState<Step>('category')
  const [category, setCategory] = useState<Category | null>(null)
  const [brand, setBrand] = useState<string | null>(null)
  const [productName, setProductName] = useState<string | null>(null)
  const BackIcon = lang === 'he' ? ChevronRight : ChevronLeft

  const categories = useMemo(() => getBeautyProductCategories(), [])
  const brands = useMemo(() => category ? getBeautyProductBrands(category) : [], [category])
  const productNames = useMemo(
    () => category && brand ? getBeautyProductNames(category, brand) : [],
    [category, brand],
  )
  const shades = useMemo(
    () => category && brand && productName ? getBeautyProductShades(category, brand, productName) : [],
    [category, brand, productName],
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
      return
    }
    if (step === 'brand') {
      setCategory(null)
      setStep('category')
    }
  }

  return (
    <section id="vesti-product" className="flex min-h-full flex-col" aria-labelledby="vesti-product-title">
      <header className="border-b border-white/10 px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
        <p className="text-[10px] font-medium tracking-[0.28em] text-silver uppercase">{copy.kicker}</p>
        <h1 id="vesti-product-title" className={`mt-2 text-[30px] leading-tight text-ivory lg:text-[40px] ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
          {copy.title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-silver">{copy.subtitle}</p>
      </header>

      <ol className="grid grid-cols-4 border-b border-white/10 px-4 sm:px-8" aria-label={lang === 'he' ? 'שלבי בחירת מוצר' : 'Product selection steps'}>
        {STEPS.map((item, index) => {
          const active = step === item
          const reached = STEPS.indexOf(step) >= index
          return (
            <li key={item} className={`border-b-2 px-1 py-3 text-center text-[11px] transition-colors ${active ? 'border-lacquer text-ivory' : reached ? 'border-white/20 text-silver' : 'border-transparent text-silver/60'}`}>
              <span className="hidden sm:inline">{String(index + 1).padStart(2, '0')} · </span>{copy[item]}
            </li>
          )
        })}
      </ol>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
        {step !== 'category' && (
          <button type="button" onClick={goBack} className="vesti-focus mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-silver transition-colors hover:text-ivory">
            <BackIcon className="h-4 w-4" aria-hidden="true" />
            {copy.back}
          </button>
        )}

        {step === 'category' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((item) => {
              const isLips = item === 'lips'
              const Icon = isLips ? CircleDot : Sparkles
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item)
                    setStep('brand')
                  }}
                  className="vesti-focus group flex min-h-44 flex-col justify-between border border-white/10 bg-shadow p-5 text-start transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 sm:min-h-52 lg:p-7"
                >
                  <Icon className="h-7 w-7 text-lacquer" strokeWidth={1.25} aria-hidden="true" />
                  <span>
                    <strong className={`block text-[30px] font-normal text-ivory lg:text-4xl ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>{copy[item]}</strong>
                    <span className="mt-2 block text-sm text-silver">{isLips ? copy.lipsDescription : copy.blushDescription}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {step === 'brand' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {brands.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  recordCommercialFunnelEvent('product_brand_selected', { brand: item })
                  setBrand(item)
                  setStep('product')
                }}
                className="vesti-focus flex min-h-28 items-end border border-white/10 bg-carbon p-4 text-start transition-all duration-300 hover:border-lacquer/70 hover:bg-shadow lg:min-h-36 lg:p-5"
              >
                <span className="font-display text-[22px] leading-tight text-ivory lg:text-[28px]">{item}</span>
              </button>
            ))}
          </div>
        )}

        {step === 'product' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {productNames.map((item) => {
              const itemShades = category && brand ? getBeautyProductShades(category, brand, item) : []
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    recordCommercialFunnelEvent('product_selected', { category: category ?? '', brand: brand ?? '', productName: item })
                    setProductName(item)
                    setStep('shade')
                  }}
                  className="vesti-focus flex min-h-40 flex-col justify-between border border-white/10 bg-carbon p-5 text-start transition-all duration-300 hover:border-white/25 hover:bg-shadow"
                >
                  <span className="flex gap-2" aria-hidden="true">
                    {itemShades.slice(0, 5).map((shade) => (
                      <span key={shade.id} className="h-8 w-8 rounded-full border border-white/20" style={{ backgroundColor: shade.swatchColor ?? '#2a2a2e' }} />
                    ))}
                  </span>
                  <span>
                    <strong className="block text-base font-medium leading-snug text-ivory">{item}</strong>
                    <span className="mt-2 block text-xs text-silver">{itemShades.length} {copy.shades}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {step === 'shade' && (
          <div className="grid gap-3 sm:grid-cols-2">
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
                className="vesti-focus group flex min-h-36 items-center gap-5 border border-white/10 bg-carbon p-5 text-start transition-all duration-300 hover:border-white/25 disabled:opacity-45"
              >
                <span className="h-20 w-20 shrink-0 rounded-full border border-white/25 shadow-[0_12px_35px_rgba(0,0,0,0.35)]" style={{ backgroundColor: item.swatchColor ?? '#2a2a2e' }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-medium tracking-[0.16em] text-silver uppercase">{item.brand}</span>
                  <strong className="mt-2 block text-lg font-medium leading-tight text-ivory">{item.shadeName}</strong>
                  {(item.shadeFamily || item.finish) && <small className="mt-2 block text-xs leading-5 text-silver">{shadeMetaLabel(item.shadeFamily, item.finish, lang)}</small>}
                  <span className="mt-4 inline-flex min-h-11 items-center bg-lacquer px-5 text-xs font-semibold text-ivory transition-colors group-hover:bg-deepRose">{copy.tryOn}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
