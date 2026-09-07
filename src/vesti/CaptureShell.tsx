import type { ReactNode } from 'react'
import type { VestiLang } from './types'

type CaptureShellProps = {
  lang: VestiLang
  onToggleLang: () => void
  children: ReactNode
}

export default function CaptureShell({ lang, onToggleLang, children }: CaptureShellProps) {
  return (
    <div className="fixed inset-0 z-[120] flex min-h-0 flex-col overflow-hidden bg-onyx font-vesti text-ivory">
      <header className="relative z-10 flex shrink-0 items-center justify-end px-4 pt-[max(1.1rem,env(safe-area-inset-top))] sm:px-8">
        <button
          type="button"
          onClick={onToggleLang}
          className="vesti-focus min-h-11 text-[11px] tracking-wide text-silver hover:text-ivory"
        >
          {lang === 'he' ? 'EN' : 'עב'}
        </button>
      </header>
      {children}
    </div>
  )
}
