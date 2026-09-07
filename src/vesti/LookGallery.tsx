import { useMemo, useState } from 'react'
import type { LookCardModel, LookEditorialFilter, VestiLang } from './types'
import { finishLabel, intensityLabel, lookCardTreatment, lookMatchesFilter } from './lookDirection'

type LookGalleryProps = {
  lang: VestiLang
  looks: LookCardModel[]
  selectedLookName: string | null
  recommendedLookName?: string | null
  applying?: boolean
  onSelect: (lookName: string) => void
  onApply?: () => void
}

const FILTERS: Array<{ id: LookEditorialFilter; he: string; en: string }> = [
  { id: 'all', he: 'הכל', en: 'All' },
  { id: 'natural', he: 'Natural', en: 'Natural' },
  { id: 'evening', he: 'Evening', en: 'Evening' },
  { id: 'statement', he: 'Statement', en: 'Statement' },
]

export default function LookGallery({
  lang,
  looks,
  selectedLookName,
  recommendedLookName,
  applying = false,
  onSelect,
  onApply,
}: LookGalleryProps) {
  const [filter, setFilter] = useState<LookEditorialFilter>('all')
  const visibleLooks = useMemo(
    () => looks.filter((look) => lookMatchesFilter(look, filter)),
    [looks, filter],
  )

  return (
    <section id="looks-carousel" className="mt-6 pb-[max(2rem,env(safe-area-inset-bottom))]" aria-label={lang === 'he' ? 'בחירת לוק' : 'Choose a look'}>
      <div className="mb-5">
        <p className="text-[11px] font-medium tracking-[0.22em] text-lacquer uppercase">Maison</p>
        <h2 className={`mt-2 text-[26px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
          {lang === 'he' ? 'בחרי לוק' : 'Choose a Look'}
        </h2>
      </div>

      <div className="mb-6 overflow-x-auto overscroll-x-contain">
        <div className="flex w-max min-w-full gap-2 pb-1">
          {FILTERS.map((item) => {
            const active = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`h-10 shrink-0 px-4 text-[12px] font-medium tracking-wide transition-colors ${
                  active
                    ? 'bg-lacquer text-ivory'
                    : 'border border-white/15 bg-transparent text-silver hover:text-ivory'
                }`}
              >
                {lang === 'he' ? item.he : item.en}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {visibleLooks.map((look) => {
          const selected = selectedLookName === look.name
          const recommended = recommendedLookName === look.name
          const treatment = lookCardTreatment(look)
          return (
            <button
              key={look.id}
              type="button"
              onClick={() => onSelect(look.name)}
              className={`relative overflow-hidden border px-5 py-6 text-start ${
                selected ? 'border-lacquer' : 'border-white/10'
              }`}
              style={{ background: treatment.wash }}
            >
              <span className="absolute inset-y-0 start-0 w-[2px]" style={{ background: treatment.rule }} />
              {recommended && (
                <span className="mb-3 block text-[11px] font-medium text-lacquer">
                  {lang === 'he' ? 'כיוון להתחיל ממנו' : 'A place to begin'}
                </span>
              )}
              <p className="font-display text-[26px] leading-none text-ivory">{look.name}</p>
              <p className={`mt-2 text-base text-ivory ${lang === 'he' ? 'font-hebrew' : ''}`}>{look.nameHe}</p>
              {look.vibe && (
                <p className="mt-3 max-w-[20rem] text-sm leading-relaxed text-silver">{look.vibe}</p>
              )}
              <p className="mt-4 text-[12px] font-medium tracking-wide text-silver">
                {finishLabel(look.vibe, lang)} · {intensityLabel(look.presenceLevel, lang)}
              </p>
              <div className="mt-5 flex items-center gap-2">
                {treatment.swatches.map((color) => (
                  <span
                    key={color}
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                ))}
                {selected && (
                  <span className="ms-2 text-[11px] font-medium text-lacquer">
                    {lang === 'he' ? 'נבחר' : 'Selected'}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {onApply && (
        <button
          type="button"
          onClick={onApply}
          disabled={!selectedLookName || applying}
          className={`mt-6 flex min-h-12 w-full items-center justify-center px-5 text-sm font-semibold ${
            selectedLookName && !applying
              ? 'bg-lacquer text-ivory hover:bg-deepRose'
              : 'cursor-not-allowed border border-white/10 bg-shadow text-silver'
          }`}
        >
          {lang === 'he' ? 'נסי את הלוק' : 'Try this look'}
        </button>
      )}
    </section>
  )
}
