import { useEffect, useRef } from 'react'
import type { VestiLang } from './types'
import CaptureShell from './CaptureShell'

type CameraCaptureProps = {
  lang: VestiLang
  previewImage?: string | null
  simulate?: boolean
  onToggleLang: () => void
  onClose: () => void
  onCaptureFile: (file: File) => void
  onPermissionDenied: () => void
  onUnavailable: () => void
  onNativeFallback: () => void
}

const GUIDANCE = {
  he: ['פנים מול המצלמה', 'אור אחיד', 'שיער לא מסתיר אזורי איפור', 'בלי פילטר'],
  en: ['Face the camera', 'Even light', 'Hair off makeup areas', 'No filter'],
} as const

export default function CameraCapture({
  lang,
  previewImage = null,
  simulate = false,
  onToggleLang,
  onClose,
  onCaptureFile,
  onPermissionDenied,
  onUnavailable,
  onNativeFallback,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const onPermissionDeniedRef = useRef(onPermissionDenied)
  const onUnavailableRef = useRef(onUnavailable)
  onPermissionDeniedRef.current = onPermissionDenied
  onUnavailableRef.current = onUnavailable

  useEffect(() => {
    if (simulate) return undefined

    let cancelled = false
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        onUnavailableRef.current()
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1600 } },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
      } catch (error) {
        const name = error instanceof DOMException ? error.name : ''
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
          onPermissionDeniedRef.current()
          return
        }
        onUnavailableRef.current()
      }
    }

    void start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [simulate])

  const captureFromVideo = () => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || !video.videoWidth) {
      onNativeFallback()
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) {
      onNativeFallback()
      return
    }
    context.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) {
        onNativeFallback()
        return
      }
      onCaptureFile(new File([blob], 'vesti-capture.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  }

  return (
    <CaptureShell lang={lang} onToggleLang={onToggleLang}>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-[0.28em] text-ivory uppercase">Vesti Beauty</p>
          <button
            type="button"
            onClick={onClose}
            className="vesti-focus min-h-11 text-sm text-silver hover:text-ivory"
          >
            {lang === 'he' ? 'חזרה' : 'Back'}
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-carbon">
          {simulate && previewImage ? (
            <img src={previewImage} alt="" className="h-full w-full object-cover object-center opacity-80" />
          ) : (
            <video
              ref={videoRef}
              className="h-full w-full scale-x-[-1] object-cover"
              playsInline
              muted
              autoPlay
            />
          )}
          <div className="pointer-events-none absolute inset-5 border border-white/20" />
        </div>

        <ul className="mt-4 space-y-1 text-[12px] leading-relaxed text-silver">
          {GUIDANCE[lang].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <button
          type="button"
          onClick={simulate ? onNativeFallback : captureFromVideo}
          className="vesti-focus mt-5 flex min-h-12 w-full items-center justify-center bg-lacquer px-5 text-sm font-semibold text-ivory hover:bg-deepRose"
        >
          {lang === 'he' ? 'צלמי' : 'Capture'}
        </button>
      </div>
    </CaptureShell>
  )
}
