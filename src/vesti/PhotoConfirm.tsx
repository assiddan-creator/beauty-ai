import type { VestiLang } from './types'
import CaptureShell from './CaptureShell'

type PhotoConfirmProps = {
  lang: VestiLang
  imageSrc: string
  onToggleLang: () => void
  onContinue: () => void
  onReplace: () => void
}

export default function PhotoConfirm({ lang, imageSrc, onToggleLang, onContinue, onReplace }: PhotoConfirmProps) {
  return (
    <CaptureShell lang={lang} onToggleLang={onToggleLang}>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
        <p className="mb-4 text-[11px] font-medium tracking-[0.28em] text-ivory uppercase">Vesti Beauty</p>
        <h1 className={`mb-4 text-[26px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
          {lang === 'he' ? 'התמונה מוכנה' : 'Photo ready'}
        </h1>

        <div className="min-h-0 flex-1 overflow-hidden bg-carbon">
          <img src={imageSrc} alt={lang === 'he' ? 'התמונה שהעלית' : 'Uploaded photo'} className="h-full w-full object-cover object-center" />
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="vesti-focus mt-5 flex min-h-12 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory hover:bg-deepRose"
        >
          {lang === 'he' ? 'המשיכי' : 'Continue'}
        </button>
        <button
          type="button"
          onClick={onReplace}
          className="vesti-focus mt-2 flex min-h-11 w-full items-center justify-center text-sm text-silver hover:text-ivory"
        >
          {lang === 'he' ? 'החליפי תמונה' : 'Replace photo'}
        </button>
      </div>
    </CaptureShell>
  )
}
