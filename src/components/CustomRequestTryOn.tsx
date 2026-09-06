import { Sparkles } from 'lucide-react'

type CustomRequestTryOnProps = {
  lang: 'he' | 'en'
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSubmit: () => void | Promise<void>
}

const COPY = {
  he: {
    title: 'בקשה חופשית',
    description: 'כתבי בדיוק מה תרצי לנסות על התמונה.',
    placeholder: 'לדוגמה: שפתון שחור מט',
    button: 'צרי לפי הבקשה',
    note: 'הבקשה תיושם כאיפור בלבד, בלי לשנות את תווי הפנים.',
    examples: ['שפתון שחור מט', 'גלוס ורוד עדין', 'סומק אפרסקי'],
  },
  en: {
    title: 'Free request',
    description: 'Describe exactly what makeup you want to try on the photo.',
    placeholder: 'For example: matte black lipstick',
    button: 'Create from my request',
    note: 'The request is applied as makeup only, without changing facial features.',
    examples: ['Matte black lipstick', 'Soft pink gloss', 'Peach blush'],
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
    <section className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-white">{copy.title}</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-white/40">{copy.description}</p>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={copy.placeholder}
        rows={3}
        maxLength={240}
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white placeholder:text-white/25 transition-all duration-200 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/20"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {copy.examples.map((example) => (
          <button
            key={example}
            type="button"
            disabled={disabled}
            onClick={() => onChange(example)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold text-white/55 transition-all hover:border-coral/25 hover:text-white/80 disabled:opacity-40"
          >
            {example}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] px-4 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {copy.button}
      </button>

      <p className="mt-2 text-center text-[10px] leading-relaxed text-white/25">{copy.note}</p>
    </section>
  )
}
