import { useMemo, useState } from 'react'
import type { LookCardModel, LookEditorialFilter, VestiLang } from './types'
import { lookMatchesFilter } from './lookDirection'

type LookGalleryProps = {
  lang: VestiLang
  looks: LookCardModel[]
  selectedLookName: string | null
  recommendedLookName?: string | null
  onSelect: (lookName: string) => void
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
  onSelect,
}: LookGalleryProps) {
  const [filter, setFilter] = useState<LookEditorialFilter>('all')
  const visibleLooks = useMemo(
    () => looks.filter((look) => lookMatchesFilter(look, filter)),
    [looks, filter],
  )

  return (
    <section id="looks-carousel" className="mt-6" aria-label={lang === 'he' ? 'בחירת לוק' : 'Choose a look'}>
      <div className="mb-6">
        <p className="font-display text-[11px] tracking-[0.28em] text-lacquer uppercase">
          Maison
        </p>
        <h2 className={`mt-2 text-[26px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>
          {lang === 'he' ? 'בחרי לוק' : 'Choose a Look'}
        </h2>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => {
          const active = filter === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`shrink-0 border px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition-colors ${
                active
                  ? 'border-lacquer bg-lacquer text-ivory'
                  : 'border-white/10 bg-transparent text-silver hover:border-white/25 hover:text-ivory'
              }`}
            >
              {lang === 'he' ? item.he : item.en}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleLooks.map((look) => {
          const selected = selectedLookName === look.name
          const recommended = recommendedLookName === look.name
          return (
            <button
              key={look.id}
              type="button"
              onClick={() => onSelect(look.name)}
              className={`relative min-h-[280px] overflow-hidden border px-6 py-7 text-start transition-colors ${
                selected
                  ? 'border-lacquer bg-shadow'
                  : 'border-white/[0.07] bg-carbon hover:border-white/20'
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
              {recommended && (
                <span className="mb-4 inline-block text-[10px] tracking-[0.18em] uppercase text-lacquer">
                  {lang === 'he' ? 'כיוון להתחיל ממנו' : 'A place to begin'}
                </span>
              )}
              <p className="font-display text-[28px] leading-none text-ivory">
                {look.name}
              </p>
              <p className="mt-3 font-hebrew text-lg text-ivory/80">
                {look.nameHe}
              </p>
              {look.vibe && (
                <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-silver">
                  {look.vibe}
                </p>
              )}
              {selected && (
                <p className="mt-6 text-[10px] tracking-[0.18em] uppercase text-lacquer">
                  {lang === 'he' ? 'נבחר' : 'Selected'}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
