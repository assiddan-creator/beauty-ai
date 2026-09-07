type CustomRequestTryOnProps = {
  lang: 'he' | 'en'
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSubmit: () => void | Promise<void>
}

const COPY = {
  he: {
    kicker: 'Atelier',
    title: 'בקשה חופשית',
    description: 'תארו לוק או מוצר בשפה חופשית. הבקשה מיושמת כאיפור בלבד, בלי לשנות את תווי הפנים.',
    placeholder: 'לדוגמה: שפתון ניוד סאטן, או סומק רך ליום עבודה',
    button: 'שלחי בקשה',
  },
  en: {
    kicker: 'Atelier',
    title: 'Free Request',
    description: 'Describe a look or product in free language. It is applied as makeup only, without changing facial features.',
    placeholder: 'For example: satin nude lipstick, or a soft daytime blush',
    button: 'Send request',
  },
} as const

export default function CustomRequestTryOn({
  lang,
  value,
  disabled = false,
  onChange,
  onSubmit,
}: CustomRequestTryOnProps) {
  const copy = COPY[lang]
  const canSubmit = value.trim().length > 0 && !disabled

  return (
    <section id="free-request" className="mt-8 overflow-x-hidden border border-white/10 bg-carbon px-5 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <p className="text-[11px] font-medium tracking-[0.22em] text-lacquer uppercase">{copy.kicker}</p>
      <h2 className={`mt-2 text-[26px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>{copy.title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-silver">{copy.description}</p>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={copy.placeholder}
        rows={7}
        maxLength={240}
        className="mt-6 w-full resize-none border border-white/15 bg-onyx px-4 py-4 text-base leading-relaxed text-ivory placeholder:text-[#B7B7BC] focus:border-lacquer focus:outline-none"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`mt-5 flex min-h-12 w-full items-center justify-center px-4 text-sm font-semibold ${
          canSubmit
            ? 'bg-lacquer text-ivory hover:bg-deepRose'
            : 'cursor-not-allowed border border-white/10 bg-shadow text-silver'
        }`}
      >
        {copy.button}
      </button>
    </section>
  )
}
