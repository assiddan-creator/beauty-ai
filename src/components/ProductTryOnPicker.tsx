import { useMemo, useState } from 'react'
import { ChevronLeft, Sparkles } from 'lucide-react'
import {
  getBeautyProductBrands,
  getBeautyProductCategories,
  getBeautyProductNames,
  getBeautyProductShades,
  type BeautyProductView,
} from '../lib/productCatalogFacade'

type UiLanguage = 'he' | 'en'
type ProductCategory = ReturnType<typeof getBeautyProductCategories>[number]
type Step = 'category' | 'brand' | 'product' | 'shade'

type ProductTryOnPickerProps = {
  lang: UiLanguage
  disabled?: boolean
  onTryOn: (product: BeautyProductView) => void | Promise<void>
}

const COPY = {
  he: {
    category: 'בחרי קטגוריה',
    brand: 'בחרי מותג',
    product: 'בחרי מוצר',
    shade: 'בחרי גוון',
    back: 'חזרה',
    lips: 'שפתיים',
    blush: 'סומק',
    previewOnly: 'תצוגה וירטואלית משוערת',
    tryOn: 'נסי עליי',
  },
  en: {
    category: 'Choose a category',
    brand: 'Choose a brand',
    product: 'Choose a product',
    shade: 'Choose a shade',
    back: 'Back',
    lips: 'Lips',
    blush: 'Blush',
    previewOnly: 'Approximate virtual preview',
    tryOn: 'Try on me',
  },
} as const

const CATEGORY_ICON: Record<ProductCategory, string> = {
  lips: '💋',
  blush: '🌸',
}

export default function ProductTryOnPicker({ lang, disabled = false, onTryOn }: ProductTryOnPickerProps) {
  const copy = COPY[lang]
  const [step, setStep] = useState<Step>('category')
  const [category, setCategory] = useState<ProductCategory | null>(null)
  const [brand, setBrand] = useState<string | null>(null)
  const [productName, setProductName] = useState<string | null>(null)

  const brands = useMemo(() => category ? getBeautyProductBrands(category) : [], [category])
  const productNames = useMemo(() => category && brand ? getBeautyProductNames(category, brand) : [], [category, brand])
  const shades = useMemo(() => category && brand && productName ? getBeautyProductShades(category, brand, productName) : [], [category, brand, productName])

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
    <section className="mt-6" aria-label={lang === 'he' ? 'בחירת מוצר לאיפור וירטואלי' : 'Virtual try-on product selection'}>
      {step !== 'category' && (
        <button type="button" onClick={goBack} className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-coral/80 transition-opacity hover:opacity-80 focus:outline-none">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {copy.back}
        </button>
      )}

      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
        {step === 'category' && copy.category}
        {step === 'brand' && copy.brand}
        {step === 'product' && copy.product}
        {step === 'shade' && copy.shade}
      </p>

      {step === 'category' && (
        <div className="grid grid-cols-2 gap-3">
          {getBeautyProductCategories().map((item) => (
            <button key={item} type="button" onClick={() => { setCategory(item); setStep('brand') }} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-6 transition-all hover:border-coral/25 hover:bg-coral/[0.06] active:scale-[0.98] focus:outline-none">
              <span className="text-3xl" aria-hidden="true">{CATEGORY_ICON[item]}</span>
              <span className="text-sm font-bold text-white">{item === 'lips' ? copy.lips : copy.blush}</span>
            </button>
          ))}
        </div>
      )}

      {step === 'brand' && (
        <div className="flex flex-col gap-2">
          {brands.map((item) => (
            <button key={item} type="button" onClick={() => { setBrand(item); setStep('product') }} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-start transition-all hover:border-white/15 hover:bg-white/[0.06] focus:outline-none">
              <span className="text-sm font-semibold text-white">{item}</span>
              <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-white/30" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {step === 'product' && (
        <div className="flex flex-col gap-2">
          {productNames.map((item) => (
            <button key={item} type="button" onClick={() => { setProductName(item); setStep('shade') }} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-start transition-all hover:border-white/15 hover:bg-white/[0.06] focus:outline-none">
              <span className="text-sm font-semibold text-white">{item}</span>
              <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-white/30" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {step === 'shade' && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {shades.map((item) => (
            <button key={item.id} type="button" disabled={disabled} onClick={() => onTryOn(item)} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-start transition-all hover:border-coral/25 hover:bg-coral/[0.05] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none">
              <span className="h-11 w-11 shrink-0 rounded-xl border border-white/15 shadow-inner" style={{ background: item.swatchColor ?? 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-xs font-bold text-white">{item.shadeName}</strong>
                {(item.shadeFamily || item.finish) && <small className="mt-0.5 block truncate text-[10px] text-white/40">{[item.shadeFamily, item.finish].filter(Boolean).join(' · ')}</small>}
                <small className="mt-1 block text-[9px] text-white/25">{copy.previewOnly}</small>
              </span>
              <span className="flex shrink-0 items-center gap-1 rounded-lg border border-coral/20 bg-coral/10 px-2.5 py-2 text-[10px] font-bold text-coral">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {copy.tryOn}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
