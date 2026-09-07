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
    description: 'אפשר לתאר לוק או מוצר רצוי בשפה חופשית. ננסה ליישם את הבקשה כאיפור בלבד, בלי לשנות את תווי הפנים.',
    placeholder: 'תארו לוק, גוון, או מוצר שתרצו לראות על התמונה',
    button: 'שלחי בקשה',
    note: 'הבקשה נשמרת כטקסט חופשי ומועברת למנגנון הקיים.',
  },
  en: {
    kicker: 'Atelier',
    title: 'Free Request',
    description: 'Describe a look or a specific product in free language. The request is applied as makeup only, without changing facial features.',
    placeholder: 'Describe a look, shade, or product to see on the photo',
    button: 'Send request',
    note: 'The request stays as free text and uses the existing try-on path.',
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
    <section id="free-request" className="mt-10 border border-white/[0.07] bg-carbon px-5 py-8 sm:px-7">
      <p className="font-display text-[11px] tracking-[0.28em] text-lacquer uppercase">{copy.kicker}</p>
      <h2 className={`mt-2 text-[26px] leading-tight text-ivory ${lang === 'he' ? 'font-hebrew' : 'font-display'}`}>{copy.title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-silver">{copy.description}</p>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={copy.placeholder}
        rows={7}
        maxLength={240}
        className="mt-7 w-full resize-none border border-white/10 bg-onyx px-5 py-5 text-base leading-relaxed text-ivory placeholder:text-silver/40 focus:border-lacquer focus:outline-none"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-5 flex min-h-12 w-full items-center justify-center bg-lacquer px-4 text-sm font-semibold text-ivory transition-colors hover:bg-deepRose disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-silver/40"
      >
        {copy.button}
      </button>

      <p className="mt-3 text-[11px] leading-relaxed text-silver/60">{copy.note}</p>
    </section>
  )
}
