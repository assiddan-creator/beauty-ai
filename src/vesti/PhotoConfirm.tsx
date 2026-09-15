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
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1.72fr)_minmax(17rem,0.58fr)]" dir="ltr">
        <div className="min-h-[52dvh] overflow-hidden bg-onyx md:min-h-0">
          <img
            src={imageSrc}
            alt={lang === 'he' ? 'התמונה שהעלית' : 'Uploaded photo'}
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div
          className="flex flex-col justify-between px-6 py-8 sm:px-10 md:px-12 md:py-16"
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        >
          <h1 className={`mt-4 text-[34px] leading-[1.08] text-ivory sm:text-4xl ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
            {lang === 'he' ? 'התמונה מוכנה' : 'Your photo is ready'}
          </h1>
          <div className="mt-10">
            <button
              type="button"
              onClick={onContinue}
              className="vesti-focus inline-flex min-h-14 min-w-[12.5rem] items-center justify-center bg-lacquer px-8 text-sm font-semibold text-ivory transition-colors hover:bg-deepRose"
            >
              {lang === 'he' ? 'המשיכי' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={onReplace}
              className="vesti-focus mt-3 flex min-h-12 items-center text-sm text-silver transition-colors hover:text-ivory"
            >
              {lang === 'he' ? 'החליפי תמונה' : 'Replace photo'}
            </button>
          </div>
        </div>
      </div>
    </CaptureShell>
  )
}
