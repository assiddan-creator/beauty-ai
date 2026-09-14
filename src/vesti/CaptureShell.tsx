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
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-end px-5 pt-[env(safe-area-inset-top)] sm:h-[4.5rem] sm:px-8 lg:px-10">
        <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-[0.34em] text-ivory uppercase sm:text-xs">
          Vesti Beauty
        </p>
        <button
          type="button"
          onClick={onToggleLang}
          className="vesti-focus min-h-11 min-w-11 text-[11px] tracking-wide text-silver transition-colors hover:text-ivory"
        >
          {lang === 'he' ? 'EN' : 'עב'}
        </button>
      </header>
      {children}
    </div>
  )
}
