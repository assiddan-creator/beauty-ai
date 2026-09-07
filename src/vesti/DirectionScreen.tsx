import type { VestiLang } from './types'
import CaptureShell from './CaptureShell'

type DirectionScreenProps = {
  lang: VestiLang
  onToggleLang: () => void
  onRecommendation: () => void
  onLooks: () => void
  onProduct: () => void
  onRequest: () => void
  onBack: () => void
}

const OPTIONS = {
  he: {
    title: 'בחרי כיוון',
    recommendation: 'כיוון להתחיל ממנו',
    looks: 'בחרי לוק',
    product: 'מוצר ספציפי',
    request: 'בקשה חופשית',
    back: 'חזרה',
  },
  en: {
    title: 'Choose a direction',
    recommendation: 'A direction to begin with',
    looks: 'Choose a look',
    product: 'Specific product',
    request: 'Free request',
    back: 'Back',
  },
} as const

export default function DirectionScreen({
  lang,
  onToggleLang,
  onRecommendation,
  onLooks,
  onProduct,
  onRequest,
  onBack,
}: DirectionScreenProps) {
  const copy = OPTIONS[lang]

  const actions = [
    { key: 'recommendation', label: copy.recommendation, onClick: onRecommendation },
    { key: 'looks', label: copy.looks, onClick: onLooks },
    { key: 'product', label: copy.product, onClick: onProduct },
    { key: 'request', label: copy.request, onClick: onRequest },
  ] as const

  return (
    <CaptureShell lang={lang} onToggleLang={onToggleLang}>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <p className="text-[11px] font-medium tracking-[0.28em] text-ivory uppercase">Vesti Beauty</p>
          <h1 className={`mt-4 text-[28px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
            {copy.title}
          </h1>

          <div className="mt-10">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={action.onClick}
                className="vesti-focus flex min-h-14 w-full items-center border-b border-white/10 text-start text-[17px] text-ivory hover:text-silver"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="vesti-focus mt-6 flex min-h-11 w-full items-center justify-center text-sm text-silver hover:text-ivory"
        >
          {copy.back}
        </button>
      </div>
    </CaptureShell>
  )
}
