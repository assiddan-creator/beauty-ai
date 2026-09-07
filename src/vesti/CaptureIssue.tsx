import type { CaptureStep, VestiLang } from './types'
import CaptureShell from './CaptureShell'

type CaptureIssueProps = {
  lang: VestiLang
  step: Extract<CaptureStep, 'preparing' | 'camera-permission' | 'camera-unavailable' | 'upload-error'>
  onToggleLang: () => void
  onRetry: () => void
  onUpload: () => void
  onBack: () => void
}

const COPY = {
  preparing: {
    he: { title: 'מכינים את התמונה', body: 'רגע קצר לפני שנמשיך.', action: null },
    en: { title: 'Preparing the photo', body: 'A moment before we continue.', action: null },
  },
  'camera-permission': {
    he: { title: 'אין גישה למצלמה', body: 'אפשר גישה בהגדרות המכשיר, או העלי תמונה.', action: 'נסי שוב' },
    en: { title: 'Camera access is off', body: 'Allow camera access in device settings, or upload a photo.', action: 'Try again' },
  },
  'camera-unavailable': {
    he: { title: 'המצלמה לא זמינה', body: 'אפשר להעלות תמונה ולהמשיך מכאן.', action: 'נסי שוב' },
    en: { title: 'Camera unavailable', body: 'Upload a photo to continue from here.', action: 'Try again' },
  },
  'upload-error': {
    he: { title: 'לא ניתן להשתמש בתמונה', body: 'נסי קובץ JPG או PNG, עד 10MB.', action: 'נסי קובץ אחר' },
    en: { title: 'This photo cannot be used', body: 'Try a JPG or PNG file, up to 10MB.', action: 'Try another file' },
  },
} as const

export default function CaptureIssue({ lang, step, onToggleLang, onRetry, onUpload, onBack }: CaptureIssueProps) {
  const copy = COPY[step][lang]

  return (
    <CaptureShell lang={lang} onToggleLang={onToggleLang}>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-[11px] font-medium tracking-[0.28em] text-ivory uppercase">Vesti Beauty</p>
          <h1 className={`mt-4 text-[28px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
            {copy.title}
          </h1>
          <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-silver">{copy.body}</p>
        </div>

        {step !== 'preparing' && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="vesti-focus flex min-h-12 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory hover:bg-deepRose"
            >
              {copy.action}
            </button>
            <button
              type="button"
              onClick={onUpload}
              className="vesti-focus flex min-h-12 w-full items-center justify-center text-sm text-silver hover:text-ivory"
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
        )}
      </div>
    </CaptureShell>
  )
}
