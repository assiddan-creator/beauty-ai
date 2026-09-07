import type { BeautyAnalysisView, LookCardModel, LookNavigationMap, VestiLang } from './types'
import {
  alternativeLabel,
  buildLookAlternatives,
  colorDirectionLabel,
  finishLabel,
  intensityLabel,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-onyx/90"
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section
        className="flex h-[min(92vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border-t border-white/[0.06] bg-carbon"
        aria-label={copy.title}
      >
        <div className="flex justify-center pt-3.5">
          <div className="h-[2px] w-10 rounded-full bg-ivory/15" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[11px] tracking-[0.28em] text-lacquer uppercase">
                {copy.kicker}
              </p>
              <h2 className={`mt-2 text-[26px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
                {copy.title}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-silver">
                {copy.intro}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-silver transition-colors hover:text-ivory"
              aria-label={copy.close}
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          <dl className="mb-5 grid grid-cols-3 gap-px overflow-hidden border border-white/[0.06] bg-white/[0.04]">
            <div className="bg-shadow px-4 py-3">
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-silver/70">{copy.color}</dt>
              <dd className="mt-2 text-sm font-medium leading-snug text-ivory">{colorDirectionLabel(analysis, lang)}</dd>
            </div>
            <div className="bg-shadow px-4 py-4">
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-silver/70">{copy.finish}</dt>
              <dd className="mt-2 text-sm font-medium leading-snug text-ivory">{finishLabel(recommended?.vibe, lang)}</dd>
            </div>
            <div className="bg-shadow px-4 py-4">
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-silver/70">{copy.intensity}</dt>
              <dd className="mt-2 text-sm font-medium leading-snug text-ivory">{intensityLabel(recommended?.presenceLevel, lang)}</dd>
            </div>
          </dl>

          {recommended && (
            <article className="mb-5 border border-white/[0.07] bg-shadow px-5 py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-silver/70">
                {copy.recommended}
              </p>
              <h3 className="mt-2 font-display text-[30px] leading-none text-ivory">
                {recommended.name}
              </h3>
              <p className="mt-2 font-hebrew text-base text-ivory/80">
                {recommended.nameHe}
              </p>
              {recommended.vibe && (
                <p className="mt-2 text-sm text-silver">{recommended.vibe}</p>
              )}
            </article>
          )}

          {alternatives.length > 0 && (
            <div className="mb-5">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-silver/70">
                {copy.alternatives}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {alternatives.map(({ kind, look }) => (
                  <button
                    key={`${kind}-${look.id}`}
                    type="button"
                    onClick={() => onSelectLook(look.name)}
                    className="border border-white/[0.07] bg-shadow px-4 py-4 text-start transition-colors hover:border-lacquer/50"
                  >
                    <span className="text-[10px] uppercase tracking-[0.14em] text-silver/70">
                      {alternativeLabel(kind, lang)}
                    </span>
                    <span className="mt-2 block font-display text-lg leading-tight text-ivory">
                      {look.name}
                    </span>
                    <span className="mt-1 block text-[11px] text-silver">
                      {look.nameHe}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {recommended && (
            <button
              type="button"
              onClick={() => onSelectLook(recommended.name)}
              className="flex min-h-12 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory transition-colors hover:bg-deepRose"
            >
              {copy.tryLook}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 flex w-full items-center justify-center py-3 text-xs tracking-[0.12em] text-silver/70 transition-colors hover:text-ivory"
          >
            {copy.chooseMyself}
          </button>
        </div>
      </section>
    </div>
  )
}
