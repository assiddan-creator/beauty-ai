import type { VestiLang } from './types'
import CaptureShell from './CaptureShell'

type CaptureChoiceProps = {
  lang: VestiLang
  onToggleLang: () => void
  onCapture: () => void
  onUpload: () => void
  onBack: () => void
}

export default function CaptureChoice({ lang, onToggleLang, onCapture, onUpload, onBack }: CaptureChoiceProps) {
  return (
    <CaptureShell lang={lang} onToggleLang={onToggleLang}>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-[11px] font-medium tracking-[0.28em] text-ivory uppercase">Vesti Beauty</p>
          <h1 className={`mt-4 text-[28px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
            {lang === 'he' ? 'איך להמשיך' : 'How to continue'}
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onCapture}
            className="vesti-focus flex min-h-12 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory hover:bg-deepRose"
          >
            {lang === 'he' ? 'צלמי עכשיו' : 'Take a photo'}
          </button>
          <button
            type="button"
            onClick={onUpload}
            className="vesti-focus flex min-h-12 w-full items-center justify-center border border-white/15 px-5 text-sm text-ivory hover:border-white/30"
          >
            {lang === 'he' ? 'העלי תמונה' : 'Upload a photo'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="vesti-focus flex min-h-11 w-full items-center justify-center text-sm text-silver hover:text-ivory"
          >
            {lang === 'he' ? 'חזרה' : 'Back'}
          </button>
        </div>
      </div>
    </CaptureShell>
  )
}
