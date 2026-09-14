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
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.8fr)]" dir="ltr">
        <div className="min-h-[48dvh] overflow-hidden bg-carbon md:min-h-0">
          <img src={imageSrc} alt={lang === 'he' ? 'התמונה שהעלית' : 'Uploaded photo'} className="h-full w-full object-cover object-center" />
        </div>
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12" dir={lang === 'he' ? 'rtl' : 'ltr'}>
          <p className="text-[10px] font-medium tracking-[0.28em] text-silver uppercase">{lang === 'he' ? 'השלב הבא' : 'Next step'}</p>
          <h1 className={`mt-4 text-[32px] leading-tight text-ivory sm:text-4xl ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
            {lang === 'he' ? 'התמונה מוכנה' : 'Your photo is ready'}
          </h1>
          <p className="mt-4 text-sm leading-7 text-silver">{lang === 'he' ? 'עכשיו בחרי מוצר וגוון שתרצי לנסות.' : 'Now choose a product and shade to try.'}</p>
          <button type="button" onClick={onContinue} className="vesti-focus mt-9 flex min-h-14 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory transition-colors hover:bg-deepRose">
            {lang === 'he' ? 'לבחירת מוצרים' : 'Choose products'}
          </button>
          <button type="button" onClick={onReplace} className="vesti-focus mt-2 flex min-h-12 w-full items-center justify-center text-sm text-silver transition-colors hover:text-ivory">
            {lang === 'he' ? 'החליפי תמונה' : 'Replace photo'}
          </button>
        </div>
      </div>
    </CaptureShell>
  )
}
