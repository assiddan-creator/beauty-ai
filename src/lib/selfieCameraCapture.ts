function uiLanguage(): 'he' | 'en' {
  return document.documentElement.lang.toLowerCase().startsWith('he') ? 'he' : 'en'
}

function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop())
}

async function preferredSelfieStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { exact: 'user' },
        width: { ideal: 1600 },
        height: { ideal: 1600 },
      },
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1600 },
        height: { ideal: 1600 },
      },
    })
  }
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Could not capture selfie')),
      'image/jpeg',
      0.92,
    )
  })
}

async function openSelfieCamera(input: HTMLInputElement) {
  const stream = await preferredSelfieStream()
  const lang = uiLanguage()

  const overlay = document.createElement('div')
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:10000',
    'display:flex',
    'flex-direction:column',
    'background:#050205',
    'color:#fff',
  ].join(';')

  const header = document.createElement('div')
  header.style.cssText = [
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'padding:calc(14px + env(safe-area-inset-top)) 16px 14px',
    'background:rgba(0,0,0,.35)',
    'backdrop-filter:blur(20px)',
    '-webkit-backdrop-filter:blur(20px)',
    'border-bottom:1px solid rgba(255,255,255,.08)',
  ].join(';')

  const title = document.createElement('div')
  title.textContent = lang === 'he' ? 'מצלמת סלפי' : 'Selfie camera'
  title.style.cssText = 'font:700 15px system-ui,-apple-system,sans-serif'

  const close = document.createElement('button')
  close.type = 'button'
  close.textContent = lang === 'he' ? 'ביטול' : 'Cancel'
  close.style.cssText = [
    'appearance:none',
    'border:0',
    'border-radius:999px',
    'padding:9px 13px',
    'background:rgba(255,255,255,.08)',
    'color:rgba(255,255,255,.8)',
    'font:600 13px system-ui,-apple-system,sans-serif',
  ].join(';')

  header.append(title, close)

  const stage = document.createElement('div')
  stage.style.cssText = 'position:relative;flex:1;min-height:0;overflow:hidden;background:#000'

  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.playsInline = true
  video.srcObject = stream
  video.style.cssText = [
    'position:absolute',
    'inset:0',
    'width:100%',
    'height:100%',
    'object-fit:cover',
    'transform:scaleX(-1)',
  ].join(';')

  const hint = document.createElement('div')
  hint.textContent = lang === 'he' ? 'מקמי את הפנים במרכז הפריים' : 'Center your face in the frame'
  hint.style.cssText = [
    'position:absolute',
    'left:50%',
    'bottom:18px',
    'transform:translateX(-50%)',
    'white-space:nowrap',
    'border-radius:999px',
    'padding:8px 12px',
    'background:rgba(0,0,0,.48)',
    'backdrop-filter:blur(12px)',
    '-webkit-backdrop-filter:blur(12px)',
    'font:600 12px system-ui,-apple-system,sans-serif',
    'color:rgba(255,255,255,.82)',
  ].join(';')

  stage.append(video, hint)

  const footer = document.createElement('div')
  footer.style.cssText = [
    'display:flex',
    'justify-content:center',
    'padding:18px 16px calc(18px + env(safe-area-inset-bottom))',
    'background:rgba(0,0,0,.35)',
    'border-top:1px solid rgba(255,255,255,.08)',
  ].join(';')

  const capture = document.createElement('button')
  capture.type = 'button'
  capture.setAttribute('aria-label', lang === 'he' ? 'צלמי סלפי' : 'Take selfie')
  capture.style.cssText = [
    'width:76px',
    'height:76px',
    'border-radius:50%',
    'border:5px solid rgba(255,255,255,.95)',
    'background:linear-gradient(135deg,#FF6B47,#FF9D6E)',
    'box-shadow:0 0 0 3px rgba(255,107,71,.25),0 0 28px rgba(255,107,71,.35)',
  ].join(';')

  footer.append(capture)
  overlay.append(header, stage, footer)
  document.body.append(overlay)

  const cleanup = () => {
    stopStream(stream)
    overlay.remove()
  }

  close.addEventListener('click', cleanup, { once: true })

  capture.addEventListener('click', async () => {
    capture.disabled = true
    try {
      const width = video.videoWidth
      const height = video.videoHeight
      if (!width || !height) throw new Error('Camera is not ready')

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d', { alpha: false })
      if (!context) throw new Error('Could not create capture canvas')

      // Preview is mirrored like a normal selfie camera, but save the photo in
      // the camera's natural orientation so AI analysis receives a true image.
      context.drawImage(video, 0, 0, width, height)
      const blob = await canvasBlob(canvas)
      const file = new File([blob], `beauty-selfie-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const transfer = new DataTransfer()
      transfer.items.add(file)
      input.files = transfer.files
      cleanup()
      input.dispatchEvent(new Event('change', { bubbles: true }))
    } catch (error) {
      console.warn('[selfie camera] capture failed', error)
      capture.disabled = false
    }
  })

  await video.play()
}

export function installSelfieCameraCapture() {
  if (!navigator.mediaDevices?.getUserMedia) return () => {}

  const nativeFallback = new WeakSet<HTMLInputElement>()

  const onFileInputClick = (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement)) return
    if (target.type !== 'file' || target.getAttribute('capture') !== 'user') return

    if (nativeFallback.has(target)) {
      nativeFallback.delete(target)
      return
    }

    event.preventDefault()
    event.stopPropagation()

    void openSelfieCamera(target).catch((error) => {
      console.warn('[selfie camera] preferred front camera unavailable; using native capture', error)
      nativeFallback.add(target)
      target.click()
    })
  }

  document.addEventListener('click', onFileInputClick, true)
  return () => document.removeEventListener('click', onFileInputClick, true)
}
