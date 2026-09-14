import type { VestiLang } from './types'
import CaptureShell from './CaptureShell'

type EntryScreenProps = {
  lang: VestiLang
  onToggleLang: () => void
  onCapture: () => void
  onUpload: () => void
}

export default function EntryScreen({ lang, onToggleLang, onCapture, onUpload }: EntryScreenProps) {
  return (
    <CaptureShell lang={lang} onToggleLang={onToggleLang}>
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(19rem,0.68fr)_minmax(0,1.52fr)]" dir="ltr">
        <div className="relative min-h-[46dvh] overflow-hidden bg-onyx md:order-2 md:min-h-0">
          <img
            src="/vesti-retail-hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[58%_center] md:object-[64%_center]"
          />
        </div>

        <div
          className="flex min-h-0 flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 md:order-1 lg:px-14 lg:py-16"
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        >
          <div className="flex flex-1 flex-col justify-center">
            <h1 className={`max-w-[12ch] text-[38px] leading-[1.06] text-ivory sm:text-[44px] lg:text-[52px] ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
              {lang === 'he' ? 'נסי את הגוון. לפני שאת בוחרת.' : 'Try the shade. Before you choose.'}
            </h1>
          </div>

          <div className="mt-10">
            <button
              type="button"
              onClick={onCapture}
              className="vesti-focus inline-flex min-h-14 min-w-[12.5rem] items-center justify-center bg-lacquer px-8 text-sm font-semibold text-ivory transition-colors hover:bg-deepRose sm:min-h-16"
            >
              {lang === 'he' ? 'התחילי עכשיו' : 'Start now'}
            </button>
            <button
              type="button"
              onClick={onUpload}
              className="vesti-focus mt-3 flex min-h-12 items-center text-sm text-silver transition-colors hover:text-ivory"
            >
              {lang === 'he' ? 'או העלי תמונה' : 'Or upload a photo'}
            </button>
          </div>
        </div>
      </div>
    </CaptureShell>
  )
}
