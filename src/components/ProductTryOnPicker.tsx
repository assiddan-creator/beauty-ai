import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

export type ProductTryOnInitialSelection = {
  category: Category
  brand: string
  productName: string
}

type ProductTryOnPickerProps = {
  lang: UiLanguage
  disabled?: boolean
  onTryOn: (product: BeautyProductView) => void | Promise<void>
  initialSelection?: ProductTryOnInitialSelection | null
}

function shadeResumeSelection(selection: ProductTryOnInitialSelection | null | undefined) {
  if (!selection) return null
  const shades = getBeautyProductShades(selection.category, selection.brand, selection.productName)
  return shades.length > 0 ? selection : null
}

const COPY = {
  he: {
    title: 'מה לנסות',
    category: 'אזור',
    brand: 'מותג',
    product: 'מוצר',
    shade: 'גוון',
    back: 'חזרה',
    lips: 'שפתיים',
    blush: 'סומק',
    lipsDescription: 'שפתונים, גלוסים ותוחמים',
    blushDescription: 'סומק במרקמים שונים',
    tryOn: 'נסי עליי',
  },
  en: {
    title: 'What to try',
    category: 'Area',
    brand: 'Brand',
    product: 'Product',
    shade: 'Shade',
    back: 'Back',
    lips: 'Lips',
    blush: 'Blush',
    lipsDescription: 'Lipsticks, glosses and liners',
    blushDescription: 'Blush in different finishes',
    tryOn: 'Try on me',
  },
} as const

const STEPS: Step[] = ['category', 'brand', 'product', 'shade']

export default function ProductTryOnPicker({
  lang,
  disabled = false,
  onTryOn,
  initialSelection = null,
}: ProductTryOnPickerProps) {
  const copy = COPY[lang]
  const resume = shadeResumeSelection(initialSelection)
  const [step, setStep] = useState<Step>(resume ? 'shade' : 'category')
  const [category, setCategory] = useState<Category | null>(resume?.category ?? null)
  const [brand, setBrand] = useState<string | null>(resume?.brand ?? null)
  const [productName, setProductName] = useState<string | null>(resume?.productName ?? null)
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

  const heading = step === 'category'
    ? copy.title
    : step === 'brand'
      ? copy.brand
      : step === 'product'
        ? (brand ?? copy.product)
        : (productName ?? copy.shade)
  const headingIsDisplay = step === 'product' || (step === 'shade' && lang !== 'he')

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
    <section id="vesti-product" className="flex min-h-full flex-col bg-onyx" aria-labelledby="vesti-product-title">
      <header className="px-6 pb-4 pt-6 sm:px-8 lg:px-10 lg:pt-8">
        <ol className="flex gap-6 text-[11px] tracking-[0.16em] text-silver" aria-label={lang === 'he' ? 'שלבי בחירת מוצר' : 'Product selection steps'}>
          {STEPS.map((item) => {
            const active = step === item
            return (
              <li key={item} className={active ? 'text-ivory' : 'text-silver/55'}>
                {copy[item]}
                {active && <span className="mt-2 block h-px w-full bg-lacquer" aria-hidden="true" />}
              </li>
            )
          })}
        </ol>
        <h1
          id="vesti-product-title"
          className={`mt-6 text-[32px] leading-tight text-ivory lg:text-[40px] ${headingIsDisplay ? 'font-display' : lang === 'he' ? 'font-hebrew' : 'font-display'}`}
        >
          {heading}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 sm:px-8 lg:px-10">
        {step !== 'category' && (
          <button type="button" onClick={goBack} className="vesti-focus mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-silver transition-colors hover:text-ivory">
            <BackIcon className="h-4 w-4" aria-hidden="true" />
            {copy.back}
          </button>
        )}

        {step === 'category' && (
          <div className="grid sm:grid-cols-2">
            {categories.map((item, index) => {
              const isLips = item === 'lips'
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item)
                    setStep('brand')
                  }}
                  className={`vesti-focus flex min-h-40 flex-col justify-center py-8 text-start sm:min-h-64 sm:px-6 ${
                    index > 0 ? 'border-t border-white/10 sm:border-t-0 sm:border-s' : ''
                  }`}
                >
                  <strong className={`block text-[40px] font-normal leading-none text-ivory lg:text-5xl ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
                    {copy[item]}
                  </strong>
                  <span className="mt-4 block max-w-[16rem] text-sm leading-6 text-silver">
                    {isLips ? copy.lipsDescription : copy.blushDescription}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {step === 'brand' && (
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-8 lg:gap-x-10">
            {brands.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  recordCommercialFunnelEvent('product_brand_selected', { brand: item })
                  setBrand(item)
                  setStep('product')
                }}
                className="vesti-focus flex min-h-[4.5rem] min-w-0 w-full items-center border-b border-white/10 py-5 text-start"
              >
                <span className="block min-w-0 max-w-full text-pretty font-display text-[26px] leading-[1.08] text-ivory lg:text-[30px]">
                  {item}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 'product' && (
          <div>
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
                  className="vesti-focus flex min-h-[5.5rem] w-full items-center gap-5 border-b border-white/10 py-5 text-start"
                >
                  <span className="flex shrink-0 gap-2" aria-hidden="true">
                    {itemShades.slice(0, 4).map((shade) => (
                      <span
                        key={shade.id}
                        className="h-10 w-10 rounded-full border border-white/15"
                        style={{ backgroundColor: shade.swatchColor ?? '#2a2a2e' }}
                      />
                    ))}
                  </span>
                  <strong className="block text-[15px] font-medium leading-snug text-ivory">{item}</strong>
                </button>
              )
            })}
          </div>
        )}

        {step === 'shade' && (
          <div>
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
                className="vesti-focus group flex min-h-[6.5rem] w-full flex-col items-start gap-4 border-b border-white/10 py-5 text-start sm:flex-row sm:items-center sm:gap-5 disabled:opacity-45"
              >
                <span
                  className="h-24 w-24 shrink-0 rounded-full border border-white/15"
                  style={{ backgroundColor: item.swatchColor ?? '#2a2a2e' }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <strong className="block text-xl font-medium leading-tight text-ivory">{item.shadeName}</strong>
                  {(item.shadeFamily || item.finish) && (
                    <small className="mt-1 block text-sm text-silver">{shadeMetaLabel(item.shadeFamily, item.finish, lang)}</small>
                  )}
                </span>
                <span className="inline-flex min-h-12 shrink-0 items-center bg-lacquer px-5 text-sm font-semibold text-ivory transition-colors group-hover:bg-deepRose">
                  {copy.tryOn}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
