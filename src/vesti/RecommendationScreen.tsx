import type { BeautyAnalysisView, LookCardModel, LookNavigationMap, VestiLang } from './types'
import {
  alternativeLabel,
  buildLookAlternatives,
  colorDirectionLabel,
  finishLabel,
  intensityLabel,
  lookCardTreatment,
} from './lookDirection'

type RecommendationScreenProps = {
  open: boolean
  lang: VestiLang
  analysis: BeautyAnalysisView | null
  looks: LookCardModel[]
  navigation: LookNavigationMap
  onClose: () => void
  onSelectLook: (lookName: string) => void
}

const COPY = {
  he: {
    kicker: 'Vesti Beauty',
    title: 'כיוון להתחיל ממנו',
    intro: 'לפי הגוונים שנראים בתמונה, הנה שילוב שאפשר לנסות.',
    color: 'כיוון צבע',
    finish: 'גימור',
    intensity: 'עוצמה',
    recommended: 'לוק מומלץ',
    alternatives: 'שתי חלופות',
    tryLook: 'נסי את הכיוון הזה',
    chooseMyself: 'אעדיף לבחור בעצמי',
    close: 'סגירה',
  },
  en: {
    kicker: 'Vesti Beauty',
    title: 'A direction to begin with',
    intro: 'From the tones visible in the photo, here is a combination worth trying.',
    color: 'Color direction',
    finish: 'Finish',
    intensity: 'Intensity',
    recommended: 'Recommended look',
    alternatives: 'Two alternatives',
    tryLook: 'Try this direction',
    chooseMyself: 'I will choose myself',
    close: 'Close',
  },
} as const

export default function RecommendationScreen({
  open,
  lang,
  analysis,
  looks,
  navigation,
  onClose,
  onSelectLook,
}: RecommendationScreenProps) {
  if (!open || !analysis) return null

  const copy = COPY[lang]
  const recommended = looks.find((look) => look.name === analysis.recommendedPreset)
  const alternatives = buildLookAlternatives(analysis, looks, navigation)

  const treatment = recommended ? lookCardTreatment(recommended) : null

  return (
    <div className="fixed inset-0 z-[400] flex flex-col overflow-hidden" style={{ background: '#050505' }}>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.28em] text-lacquer uppercase">
              {copy.kicker}
            </p>
            <h1 className={`mt-3 text-[28px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
              {copy.title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-silver">
              {copy.intro}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/15 text-silver hover:text-ivory"
            aria-label={copy.close}
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <dl className="mb-5 grid grid-cols-3 border border-white/10">
          <div className="border-e border-white/10 px-2.5 py-2.5">
            <dt className="text-[10px] font-medium tracking-wide text-silver">{copy.color}</dt>
            <dd className="mt-1 text-[11px] font-medium leading-snug text-ivory">{colorDirectionLabel(analysis, lang)}</dd>
          </div>
          <div className="border-e border-white/10 px-2.5 py-2.5">
            <dt className="text-[10px] font-medium tracking-wide text-silver">{copy.finish}</dt>
            <dd className="mt-1 text-[11px] font-medium leading-snug text-ivory">{finishLabel(recommended?.vibe, lang)}</dd>
          </div>
          <div className="px-2.5 py-2.5">
            <dt className="text-[10px] font-medium tracking-wide text-silver">{copy.intensity}</dt>
            <dd className="mt-1 text-[11px] font-medium leading-snug text-ivory">{intensityLabel(recommended?.presenceLevel, lang)}</dd>
          </div>
        </dl>

        {recommended && treatment && (
          <article
            className="relative mb-5 overflow-hidden border border-white/10 px-5 py-8"
            style={{ background: treatment.wash }}
          >
            <span className="absolute inset-y-0 start-0 w-[3px]" style={{ background: treatment.rule }} />
            <p className="text-[10px] font-medium tracking-wide text-silver">{copy.recommended}</p>
            <h2 className="mt-3 font-display text-[36px] leading-[0.92] text-ivory">
              {recommended.name}
            </h2>
            <p className={`mt-3 text-lg text-ivory ${lang === 'he' ? 'font-hebrew' : ''}`}>
              {recommended.nameHe}
            </p>
            <p className="mt-4 text-sm text-silver">
              {finishLabel(recommended.vibe, lang)} · {intensityLabel(recommended.presenceLevel, lang)}
            </p>
          </article>
        )}

        {alternatives.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-medium tracking-wide text-silver">{copy.alternatives}</p>
            <div className="grid grid-cols-2 gap-2">
              {alternatives.map(({ kind, look }) => (
                <button
                  key={`${kind}-${look.id}`}
                  type="button"
                  onClick={() => onSelectLook(look.name)}
                  className="border border-white/10 bg-carbon px-3 py-3 text-start hover:border-white/25"
                >
                  <span className="block text-[10px] text-silver">{alternativeLabel(kind, lang)}</span>
                  <span className="mt-1 block text-[13px] font-medium leading-snug text-ivory">{look.name}</span>
                  <span className="mt-0.5 block text-[11px] text-silver">{look.nameHe}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]" style={{ background: '#050505' }}>
        {recommended && (
          <button
            type="button"
            onClick={() => onSelectLook(recommended.name)}
            className="flex min-h-12 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory hover:bg-deepRose"
          >
            {copy.tryLook}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-3 flex w-full items-center justify-center py-2 text-sm text-silver hover:text-ivory"
        >
          {copy.chooseMyself}
        </button>
      </div>
    </div>
  )
}
