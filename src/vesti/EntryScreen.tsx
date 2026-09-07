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
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-[11px] font-medium tracking-[0.34em] text-ivory uppercase">Vesti Beauty</p>
          <h1 className={`mt-5 max-w-[14ch] text-[34px] leading-[1.12] text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
            {lang === 'he' ? 'איפור על התמונה שלך.' : 'Makeup on your photo.'}
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
            className="vesti-focus flex min-h-12 w-full items-center justify-center text-sm text-silver hover:text-ivory"
          >
            {lang === 'he' ? 'העלי תמונה' : 'Upload a photo'}
          </button>
        </div>
      </div>
    </CaptureShell>
  )
}
