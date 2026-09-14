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
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(20rem,0.82fr)_minmax(0,1.35fr)]" dir="ltr">
        <div className="relative min-h-[42dvh] overflow-hidden bg-carbon md:order-2 md:min-h-0">
          <img
            src="/vesti-retail-hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[58%_center] md:object-[62%_center]"
          />
          <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-onyx to-transparent md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-32 md:bg-gradient-to-r" aria-hidden="true" />
        </div>

        <div className="flex min-h-0 flex-col justify-between px-6 py-7 sm:px-10 sm:py-10 md:order-1 lg:px-14 lg:py-14" dir={lang === 'he' ? 'rtl' : 'ltr'}>
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-[10px] font-medium tracking-[0.3em] text-silver uppercase">
              {lang === 'he' ? 'התנסות וירטואלית באיפור' : 'Virtual makeup try-on'}
            </p>
            <h1 className={`mt-5 max-w-[12ch] text-[38px] leading-[1.05] text-ivory sm:text-5xl lg:text-[58px] ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
              {lang === 'he' ? 'נסי את הגוון. לפני שאת בוחרת.' : 'Try the shade. Before you choose.'}
            </h1>
            <p className="mt-5 max-w-[28rem] text-sm leading-7 text-silver sm:text-base">
              {lang === 'he' ? 'צילום אחד, מוצר אמיתי ותוצאה ברורה על הפנים שלך.' : 'One photo, a real product and a clear result on your face.'}
            </p>
          </div>

          <div className="mt-8 max-w-md">
            <button
              type="button"
              onClick={onCapture}
              className="vesti-focus flex min-h-14 w-full items-center justify-center bg-lacquer px-6 text-sm font-semibold text-ivory transition-colors hover:bg-deepRose sm:min-h-16 sm:text-base"
            >
              {lang === 'he' ? 'התחילי עכשיו' : 'Start now'}
            </button>
            <button
              type="button"
              onClick={onUpload}
              className="vesti-focus mt-2 flex min-h-12 w-full items-center justify-center text-sm text-silver transition-colors hover:text-ivory"
            >
              {lang === 'he' ? 'או העלי תמונה' : 'Or upload a photo'}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-silver/70">
              {lang === 'he' ? 'הדמיית איפור · ללא שינוי מבנה הפנים' : 'Makeup preview · Your facial structure stays unchanged'}
            </p>
          </div>
        </div>
      </div>
    </CaptureShell>
  )
}
