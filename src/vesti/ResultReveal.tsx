import { useEffect, useState } from 'react'
import { getLookPurchaseUrl, getPurchaseUrl } from '../lib/commercialConfig'
import type { VestiLang } from './types'

export type RevealProduct = {
  id: string
  brand: string
  productName: string
  shadeName: string
  finish?: string
}

type ResultRevealProps = {
  lang: VestiLang
  originalImage: string | null
  generatedImage: string | null
  title: string
  lookPurchaseKey?: string | null
  fromRecommendation?: boolean
  products: RevealProduct[]
  sliderPosition: number
  generating?: boolean
  error?: string | null
  previewPurchaseUrl?: string | null
  onSliderChange: (value: number) => void
  onDownload: () => void
  onTryLook: () => void
  onTryShade: () => void
  onStartOver?: () => void
  onRetry?: () => void
}

const COPY = {
  he: {
    trust: 'הדמיית איפור',
    before: 'לפני',
    after: 'אחרי',
    compare: 'השוואת לפני ואחרי',
    direction: 'כיוון להתחיל ממנו',
    viewProduct: 'לצפייה במוצר',
    viewLook: 'לצפייה בלוק',
    tryLook: 'נסי לוק אחר',
    tryShade: 'נסי גוון אחר',
    startOver: 'התחילי מחדש',
    download: 'הורדה',
    retry: 'נסי שוב',
    errorTitle: 'לא ניתן להציג תוצאה',
    generating: 'מכינים את התוצאה',
  },
  en: {
    trust: 'Virtual try-on',
    before: 'Before',
    after: 'After',
    compare: 'Compare before and after',
    direction: 'A direction to begin with',
    viewProduct: 'View product',
    viewLook: 'View look',
    tryLook: 'Try another look',
    tryShade: 'Try another shade',
    startOver: 'Start over',
    download: 'Download',
    retry: 'Try again',
    errorTitle: 'The result cannot be shown',
    generating: 'Preparing the result',
  },
} as const

function isRealUrl(value: string | null | undefined): value is string {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export default function ResultReveal({
  lang,
  originalImage,
  generatedImage,
  title,
  lookPurchaseKey = null,
  fromRecommendation = false,
  products,
  sliderPosition,
  generating = false,
  error = null,
  previewPurchaseUrl = null,
  onSliderChange,
  onDownload,
  onTryLook,
  onTryShade,
  onStartOver,
  onRetry,
}: ResultRevealProps) {
  const copy = COPY[lang]
  const [productUrls, setProductUrls] = useState<Record<string, string>>({})
  const [lookUrl, setLookUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const next: Record<string, string> = {}
      await Promise.all(products.map(async (product) => {
        const url = await getPurchaseUrl(product.id)
        if (url) next[product.id] = url
      }))
      const resolvedLook = lookPurchaseKey ? await getLookPurchaseUrl(lookPurchaseKey) : null
      if (cancelled) return
      setProductUrls(next)
      setLookUrl(resolvedLook)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [products, lookPurchaseKey])

  if (error && !generatedImage) {
    return (
      <section className="overflow-x-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h1 className={`text-[28px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
          {copy.errorTitle}
        </h1>
        <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-silver">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="vesti-focus mt-8 flex min-h-12 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory hover:bg-deepRose"
          >
            {copy.retry}
          </button>
        )}
      </section>
    )
  }

  if (!generatedImage) return null

  const previewUrl = isRealUrl(previewPurchaseUrl) ? previewPurchaseUrl : null
  const firstProductUrl = products.map((product) => productUrls[product.id]).find(isRealUrl) ?? null
  const commercialUrl = previewUrl ?? (isRealUrl(lookUrl) ? lookUrl : null) ?? firstProductUrl
  const commercialLabel = isRealUrl(lookUrl) && !previewUrl ? copy.viewLook : copy.viewProduct

  return (
    <section className="overflow-x-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="relative -mx-4 overflow-hidden bg-carbon sm:-mx-8">
        <div className="relative aspect-[3/4] max-h-[68vh] min-h-[20rem] w-full">
          {originalImage && (
            <img src={originalImage} alt={copy.before} className="absolute inset-0 h-full w-full object-contain object-center" />
          )}
          <img
            src={generatedImage}
            alt={copy.after}
            className="absolute inset-0 h-full w-full object-contain object-center"
            style={originalImage ? { clipPath: `inset(0 0 0 ${sliderPosition}%)` } : undefined}
          />
          {originalImage && (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 z-10 w-px bg-ivory/75"
                style={{ left: `${sliderPosition}%` }}
              />
              <div
                className="pointer-events-none absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ivory bg-onyx"
                style={{ left: `${sliderPosition}%`, top: '50%' }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPosition}
                onChange={(event) => onSliderChange(Number(event.target.value))}
                className="absolute inset-0 z-20 h-full w-full cursor-col-resize opacity-0"
                style={{ direction: 'ltr' }}
                aria-label={copy.compare}
              />
              <span className="pointer-events-none absolute bottom-3 left-3 z-10 text-[11px] tracking-wide text-ivory/85">
                {copy.before}
              </span>
              <span className="pointer-events-none absolute bottom-3 right-3 z-10 text-[11px] tracking-wide text-ivory/85">
                {copy.after}
              </span>
            </>
          )}
          {generating && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-onyx/70">
              <p className="text-sm text-ivory">{copy.generating}</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-silver">{copy.trust}</p>
      {fromRecommendation && (
        <p className="mt-2 text-[11px] text-silver">{copy.direction}</p>
      )}
      <h1 className={`mt-2 max-w-[22ch] break-words text-[28px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
        {title}
      </h1>

      {products.length > 0 && (
        <ul className="mt-6">
          {products.map((product) => {
            const url = productUrls[product.id]
            return (
              <li key={product.id} className="border-b border-white/10 py-3">
                <p className="text-sm text-ivory">{product.brand}</p>
                <p className="mt-1 break-words text-sm text-silver">{product.productName}</p>
                <p className="mt-1 break-words text-sm text-silver">{product.shadeName}</p>
                {product.finish && (
                  <p className="mt-1 text-[12px] text-silver">{product.finish}</p>
                )}
                {isRealUrl(url) && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="vesti-focus mt-3 inline-flex min-h-11 items-center text-sm text-ivory underline decoration-white/25 underline-offset-4 hover:decoration-ivory"
                  >
                    {copy.viewProduct}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {isRealUrl(commercialUrl) && (
        <a
          href={commercialUrl}
          target="_blank"
          rel="noreferrer"
          className="vesti-focus mt-6 flex min-h-12 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory hover:bg-deepRose"
        >
          {commercialLabel}
        </a>
      )}

      {error && (
        <p className="mt-5 text-sm text-silver">{error}</p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={onTryLook}
          className={`vesti-focus flex min-h-12 w-full items-center justify-center px-5 text-sm font-semibold ${
            commercialUrl
              ? 'border border-white/15 text-ivory hover:border-white/30'
              : 'bg-lacquer text-ivory hover:bg-deepRose'
          }`}
        >
          {copy.tryLook}
        </button>
        <button
          type="button"
          onClick={onTryShade}
          className="vesti-focus flex min-h-12 w-full items-center justify-center border border-white/15 px-5 text-sm text-ivory hover:border-white/30"
        >
          {copy.tryShade}
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="vesti-focus flex min-h-11 w-full items-center justify-center text-sm text-silver hover:text-ivory"
        >
          {copy.download}
        </button>
        {onStartOver && (
          <button
            type="button"
            onClick={onStartOver}
            className="vesti-focus flex min-h-11 w-full items-center justify-center text-sm text-silver hover:text-ivory"
          >
            {copy.startOver}
          </button>
        )}
        {error && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="vesti-focus flex min-h-11 w-full items-center justify-center text-sm text-silver hover:text-ivory"
          >
            {copy.retry}
          </button>
        )}
      </div>
    </section>
  )
}
