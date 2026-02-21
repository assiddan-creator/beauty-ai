import { useState, useRef } from 'react'
import {
  ImageIcon,
  Trash2,
  Download,
  Sparkles,
  Loader2,
  Send,
  X,
  Clock,
  Building2,
  Snowflake,
  Leaf,
  Waves,
  Palette,
  Crown,
  ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react'

// ─── Replicate ──────────────────────────────────────────────────────────────
// google/nano-banana-pro — Google DeepMind / Gemini 3 Pro image editing model
// Pinned to this version so deployments are deterministic.
const NANO_BANANA_PRO_VERSION =
  '99256cc418d9ac41854575e2f1c8846ce2defd0c0fb6ff2d5cbc3c826be75bc8'

// Only the 7 presets that have local reference photos in /public
const STYLE_PRESETS = [
  'Urban Industrial',
  'Scandinavian Minimalist',
  'Boho-Chic',
  'Coastal Mediterranean',
  'Eclectic Airbnb',
  'Modern Luxury',
  'Transitional',
] as const

const PRESET_ICONS: LucideIcon[] = [
  Building2,      // Urban Industrial
  Snowflake,      // Scandinavian Minimalist
  Leaf,           // Boho-Chic
  Waves,          // Coastal Mediterranean
  Palette,        // Eclectic Airbnb
  Crown,          // Modern Luxury
  ArrowLeftRight, // Transitional
]

// Local high-quality reference photos served from /public
const PRESET_IMAGES: Record<string, string> = {
  'Urban Industrial':        '/Urban-Industrial.jpg',
  'Scandinavian Minimalist': '/Scandinavian-Minimalist.jpg',
  'Boho-Chic':               '/Boho-Chic.jpg',
  'Coastal Mediterranean':   '/Coastal-Mediterranean.jpg',
  'Eclectic Airbnb':         '/Eclectic-Airbnb.jpg',
  'Modern Luxury':           '/Modern-Luxury.jpg',
  'Transitional':            '/Transitional.jpg',
}

// Cinematic prompt formulas — injected verbatim into the Replicate prompt per preset
const PRESET_FORMULAS: Record<string, string> = {
  'Urban Industrial':
    'Exposed red brick walls, polished concrete floor, distressed brown leather sofa, matte black metal fixtures. Warm Edison bulb lighting mixed with natural overcast light, volumetric shadows. Shot on Sony Venice, 35mm lens, f/1.8 aperture, realistic textures, cinematic lighting.',
  'Scandinavian Minimalist':
    'Matte white walls, light oak wood flooring, cozy neutral boucle furniture. Natural morning sunlight streaming through large windows, soft diffused lighting. Shot on ARRI Alexa 65, 24mm prime lens, architectural digest style, 8k resolution, highly detailed.',
  'Boho-Chic':
    'Warm earthy tones, rattan and macrame decor, lots of lush green indoor plants, vintage Moroccan rugs. Sun-drenched room, Kodak Portra film aesthetic, warm golden light. Shot on full-frame mirrorless, 35mm lens, cozy and inviting atmosphere.',
  'Modern Farmhouse':
    'White shiplap walls, reclaimed barn wood beams, matte black hardware, cozy linen slipcovered furniture. Bright natural daylight, soft shadows. Shot on Sony a7III, 24mm lens, crisp focus, magazine cover quality, photorealistic.',
  'Coastal Mediterranean':
    'White stucco walls, terracotta tile accents, breezy linen curtains, light weathered wood, shades of ocean blue. Bright midday Mediterranean sunlight, airy and fresh. 35mm prime lens, ultra-realistic, highly detailed architecture.',
  'Eclectic Airbnb':
    'Vibrant curated mix of vintage and modern furniture, bold colorful art pieces, unique statement lighting, patterned textiles. Dynamic studio lighting, rich colors. Shot on 24mm lens, f/2.8, deep depth of field, vibrant and welcoming.',
  'Modern Luxury':
    'Floor-to-ceiling windows, Calacatta gold marble finishes, sleek contemporary Italian furniture, dark wood accents. Golden hour lighting casting long beautiful shadows, ambient LED cove lighting. Shot on ARRI Alexa 65, 35mm, extreme photorealism, HDR.',
  'Mid-Century Modern':
    'Warm walnut wood paneling, iconic retro furniture with tapered legs, mustard yellow and teal accents, geometric patterns. Soft directional lighting, moody cinematic atmosphere. Shot with 85mm lens, f/1.8 aperture, cinematic color grading.',
  'Transitional':
    'Elegant balance of traditional lines and modern comfort, neutral color palette with sophisticated metallic accents, plush fabrics. Soft diffused natural light, balanced exposure. 35mm lens, incredibly realistic, architectural photography.',
}


const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Dining Room',
  'Home Office',
  'Bathroom',
  'Empty Space',
] as const

const HISTORY_STORAGE_KEY = 'vsa-history-v1'
const MAX_HISTORY = 12

// ─── Types ───────────────────────────────────────────────────────────────────
type HistoryEntry = {
  id: string
  originalUrl: string | null  // blob URL (session only; null when loaded from localStorage)
  generatedUrl: string        // Replicate delivery URL – persistent
  styleName: string
  timestamp: number
}

type StoredEntry = Omit<HistoryEntry, 'originalUrl'>

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  const res = await fetch(blobUrl)
  const blob = await res.blob()
  const mimeType = blob.type || 'image/jpeg'
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return `data:${mimeType};base64,${data}`
}

async function runReplicatePrediction(
  prompt: string,
  imageDataUrl: string,
): Promise<string> {
  const res = await fetch('/api/replicate/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      // Ask the API to wait up to 60 s and return the result synchronously
      Prefer: 'wait=60',
    },
    body: JSON.stringify({
      version: NANO_BANANA_PRO_VERSION,
      input: {
        prompt,
        // Pass the uploaded room photo as the base image for editing
        image_input: [imageDataUrl],
        // Preserve the original room's proportions exactly
        aspect_ratio: 'match_input_image',
        // Premium 2 K output for sharp architectural detail
        resolution: '2K',
        output_format: 'jpg',
        // Allow fallback to seedream-4.5 if the model is at capacity
        allow_fallback_model: true,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string })?.detail ?? `Request failed: ${res.status}`)
  }

  const prediction = (await res.json()) as {
    status: string
    output?: string
    urls?: { get?: string }
  }

  if (prediction.status !== 'succeeded') {
    throw new Error(
      prediction.status === 'failed' ? 'Generation failed' : `Unexpected status: ${prediction.status}`
    )
  }

  const url = prediction.output ?? prediction.urls?.get
  if (!url || typeof url !== 'string') throw new Error('No output URL in response')
  return url
}

function loadHistoryFromStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    return (JSON.parse(raw) as StoredEntry[]).map((e) => ({ ...e, originalUrl: null }))
  } catch {
    return []
  }
}

function saveHistoryToStorage(entries: HistoryEntry[]) {
  const stored: StoredEntry[] = entries.map(({ originalUrl: _, ...rest }) => rest)
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(stored))
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [isUploaded, setIsUploaded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null)
  const [customInstructions, setCustomInstructions] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistoryFromStorage)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  // Tracks history entry IDs and preset names whose remote images have expired / failed
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set())
  const markBroken = (key: string) =>
    setBrokenImgs((prev) => { const next = new Set(prev); next.add(key); return next })

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (originalImage) URL.revokeObjectURL(originalImage)
    setOriginalImage(URL.createObjectURL(file))
    setIsUploaded(true)
    setGeneratedImage(null)
    setActiveHistoryId(null)
    setError(null)
  }

  // ── Clear ───────────────────────────────────────────────────────────────────
  const handleClear = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage)
      setOriginalImage(null)
    }
    setIsUploaded(false)
    setGeneratedImage(null)
    setIsGenerating(false)
    setSelectedPreset(null)
    setSelectedRoomType(null)
    setCustomInstructions('')
    setActiveHistoryId(null)
    setError(null)
  }

  // ── Download (blob fetch to bypass CORS) ────────────────────────────────────
  const handleDownload = async () => {
    if (!generatedImage) return
    const name = `Virtual-Staging-${(selectedPreset ?? 'Result').replace(/\s+/g, '-')}.jpg`
    try {
      const res = await fetch(generatedImage)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = name
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(generatedImage, '_blank')
    }
  }

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleApplyEdit = async () => {
    if (!originalImage) return

    const token = import.meta.env.VITE_REPLICATE_API_TOKEN
    if (!token || typeof token !== 'string' || token.trim() === '') {
      setError('Replicate API token not found. Add VITE_REPLICATE_API_TOKEN to your .env file.')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const presetName = selectedPreset ?? 'Modern Luxury'
      const roomType = selectedRoomType ?? 'room'
      const customNote = customInstructions.trim()
      const formula = PRESET_FORMULAS[presetName] ?? `furnished in a ${presetName} style interior, photorealistic.`
      const prompt = [
        `A high-resolution photograph of a virtually staged ${roomType}.`,
        formula,
        // Surface preservation — absolute constraint
        'CRITICAL: Preserve the exact original color, material, and texture of all walls and floors without any alteration.',
        'Do NOT repaint walls, change wall color, re-tile floors, replace flooring, or resurface any architectural element.',
        // Allowed decorative additions
        'You MAY hang wall art, mirrors, framed prints, or clocks on the walls.',
        'You MAY add curtains, drapes, or blinds over windows.',
        'You MAY place area rugs on top of the existing floor.',
        // Furniture logic
        'Add or replace furniture, lighting, cushions, throws, plants, and decorative accessories that match the selected style.',
        'Respect the room\'s original architecture, ceiling height, and window placement.',
        // Custom user note (optional)
        customNote || null,
      ].filter(Boolean).join(' ')
      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl)

      setGeneratedImage(outputUrl)
      setSliderPosition(50)

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        styleName: presetName,
        timestamp: Date.now(),
      }
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        saveHistoryToStorage(updated)
        return updated
      })
      setActiveHistoryId(entry.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Virtual staging failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Load history card ───────────────────────────────────────────────────────
  const handleLoadHistory = (entry: HistoryEntry) => {
    setOriginalImage(entry.originalUrl)
    setGeneratedImage(entry.generatedUrl)
    setSelectedPreset(entry.styleName)
    setIsUploaded(true)
    setSliderPosition(50)
    setActiveHistoryId(entry.id)
    setError(null)
  }

  // ── Delete history entry ────────────────────────────────────────────────────
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id)
      saveHistoryToStorage(updated)
      return updated
    })
    if (activeHistoryId === id) setActiveHistoryId(null)
  }

  // ── Timestamp label ─────────────────────────────────────────────────────────
  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Always show a background — fall back to the first preset on initial load
  const activeBgImage = PRESET_IMAGES[selectedPreset ?? STYLE_PRESETS[0]]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-gray-100">

      {/* ── Cinematic dynamic background ── */}
      {/* Outer wrapper clips the Ken Burns overflow so edges never show */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* key forces remount → CSS fade-in fires on each preset change.
            The div is 16% larger than the viewport on every side so the
            Ken Burns scale/pan never reveals a white/black edge. */}
        <div
          key={selectedPreset ?? 'default'}
          className="bg-cinematic absolute bg-cover bg-center"
          style={{
            inset: '-8%',
            backgroundImage: `url(${activeBgImage})`,
          }}
        />
      </div>
      {/* Permanent dark scrim — keeps UI readable regardless of photo brightness */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/35" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="relative z-20 border-b border-white/10" style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(64px)', WebkitBackdropFilter: 'blur(64px)' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B47] to-[#FF9D6E] p-3 text-white"
              style={{ boxShadow: '0 0 25px rgba(255,107,71,0.5)' }}
            >
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none tracking-tight text-white">
                Magic Snap Booth
              </p>
              <p className="mt-1 text-xs leading-none text-gray-500">
                Real Estate AI · Virtual Staging
              </p>
            </div>
          </div>
          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">Welcome back, Assi 👋</p>
              <p className="mt-0.5 text-[11px] text-gray-500">Virtual Staging Studio</p>
            </div>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B47] to-[#FF9D6E] text-base font-extrabold text-white"
              style={{ boxShadow: '0 0 25px rgba(255,107,71,0.5)' }}
            >
              A
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-36 pt-6 sm:px-8 md:px-12 md:pt-10">

        {/* ── Glass Content Panel ── */}
        <div className="rounded-3xl border border-white/10 bg-black/5 shadow-2xl backdrop-blur-3xl">
          <div className="p-5 sm:p-6">

        {/* ── Upload Dropzone ── */}
        {!isUploaded && (
          <section className="mt-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
                e.target.value = ''
              }}
              className="sr-only"
              aria-label="Upload room photo"
            />
            {/* Feature card — styled like the reference "AI Space Designer Pro" card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0]
                if (file) handleFileSelect(file)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl focus:outline-none"
            >
              {/* Upload card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-12 backdrop-blur-3xl transition-all duration-300 group-hover:bg-white/[0.09]">
                {/* Decorative corner glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-coral/20 blur-3xl transition-all duration-500 group-hover:bg-coral/30" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative flex flex-col items-center gap-5">
                  {/* Icon container */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-coral/15 text-coral ring-1 ring-coral/20 transition-all duration-300 group-hover:bg-coral/25 group-hover:ring-coral/40">
                    <ImageIcon className="h-9 w-9" />
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      AI Space Designer Pro
                    </p>
                    <p className="mt-1.5 text-sm text-gray-400">
                      Drop your room photo or click to upload
                    </p>
                    <p className="mt-1 text-xs text-gray-600">PNG, JPG up to 10 MB</p>
                  </div>

                  {/* CTA chip */}
                  <div
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 group-hover:scale-105"
                    style={{ boxShadow: '0 0 20px rgba(255,107,71,0.4)' }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Stage My Room
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Main Editor (uploaded) ── */}
        {isUploaded && (
          <div className="mt-8">

            {/* Control Bar */}
            <div className="flex items-center justify-between rounded-t-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-3xl">
              <button
                type="button"
                onClick={handleClear}
                className="flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-white/8 hover:text-white focus:outline-none"
              >
                <Trash2 className="h-4 w-4" />
                Clear / Start Over
              </button>
              {generatedImage && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 focus:outline-none"
                  style={{ boxShadow: '0 0 25px rgba(255,107,71,0.5)' }}
                >
                  <Download className="h-4 w-4" />
                  Download Result
                </button>
              )}
            </div>

            {/* ── Image Viewer ── */}
            <div className="overflow-hidden rounded-b-2xl border border-t-0 border-white/10 bg-white/5 backdrop-blur-3xl">

              {/*
                Canvas: aspect-video (16:9) gives a natural cinematic shape at any
                width; max-h-[70vh] prevents it from ever overwhelming the controls
                on tall viewports. Children use absolute inset-0 to fill exactly this box.
              */}
              <div className="relative w-full overflow-hidden aspect-video max-h-[52vh]">

                {/* Generating Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-md">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <div className="absolute inset-0 animate-ping rounded-full bg-coral/20" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-coral/15">
                        <Loader2 className="h-6 w-6 animate-spin text-coral" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">AI is staging your room</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedPreset ?? 'Modern Luxury'} style · typically 30–60 sec
                      </p>
                    </div>
                    <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full animate-pulse rounded-full bg-coral" style={{ width: '65%' }} />
                    </div>
                  </div>
                )}

                {/* ── Before / After Slider ── */}
                {generatedImage && originalImage && !isGenerating ? (
                  <>
                    {/* Before layer */}
                    <img
                      src={originalImage}
                      alt="Before"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* After layer — clipped from the left by the slider */}
                    <img
                      src={generatedImage}
                      alt="After"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    />
                    {/* Divider line */}
                    <div
                      className="pointer-events-none absolute inset-y-0 w-0.5 bg-coral"
                      style={{ left: `${sliderPosition}%`, boxShadow: '0 0 12px rgba(255,107,71,0.9)' }}
                    />
                    {/* Handle */}
                    <div
                      className="pointer-events-none absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-coral bg-black/70 shadow-xl backdrop-blur-sm"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <ArrowLeftRight className="h-4 w-4 text-coral" />
                    </div>
                    {/* Labels */}
                    <span className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                      Before
                    </span>
                    <span className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                      After
                    </span>
                    {/* Invisible range input — captures drag across the full canvas */}
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 z-20 h-full w-full cursor-col-resize opacity-0"
                      aria-label="Compare before and after"
                    />
                  </>

                ) : generatedImage && !originalImage && !isGenerating ? (
                  /* Generated result only (no original) */
                  <img
                    src={generatedImage}
                    alt="Generated result"
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                ) : (
                  /* Original room (pre-generation or while generating) */
                  <img
                    src={originalImage!}
                    alt="Original room"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isGenerating ? 'opacity-30' : 'opacity-100'}`}
                  />
                )}
              </div>

              {/* Caption bar */}
              <p className="border-t border-white/5 px-4 py-2.5 text-center text-xs font-medium uppercase tracking-widest text-gray-500">
                {isGenerating
                  ? 'Processing…'
                  : generatedImage
                  ? 'Before ← Drag → After'
                  : 'Original Room'}
              </p>
            </div>

            {/* Pro Touch-Up */}
            <section className="mt-5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-5 text-sm font-semibold text-coral backdrop-blur-3xl transition-all hover:bg-coral/10 active:scale-[0.99] focus:outline-none"
              >
                <Sparkles className="h-4 w-4" />
                Pro Touch-Up (Enhance Only)
              </button>
            </section>

            {/* Room Type */}
            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Room Type</h2>
                <span className="text-xs font-medium text-coral">Select One</span>
              </div>
              <div
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {ROOM_TYPES.map((room) => {
                  const isActive = selectedRoomType === room
                  return (
                    <button
                      key={room}
                      type="button"
                      onClick={() => setSelectedRoomType(isActive ? null : room)}
                      className={`shrink-0 min-h-[44px] rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none ${
                        isActive
                          ? 'border-transparent bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 backdrop-blur-3xl hover:bg-white/[0.09] hover:text-gray-200'
                      }`}
                      style={
                        isActive
                          ? { boxShadow: '0 0 20px rgba(255,107,71,0.4)' }
                          : undefined
                      }
                    >
                      {room}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Style Presets */}
            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Popular Styles</h2>
                <span className="text-xs font-medium text-gray-500">
                  {selectedPreset ?? 'None selected'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {STYLE_PRESETS.map((style, i) => {
                  const PresetIcon = PRESET_ICONS[i]
                  const isSelected = selectedPreset === style
                  const imgUrl = PRESET_IMAGES[style]
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setSelectedPreset(style)}
                      className={`group relative flex min-h-[130px] flex-col overflow-hidden rounded-2xl text-left transition-all duration-200 hover:scale-[1.04] focus:outline-none ${
                        isSelected ? 'border-2 border-coral/80' : 'border border-white/10 hover:border-white/20'
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? '0 0 25px rgba(255,107,71,0.5), inset 0 1px 0 rgba(255,107,71,0.2)'
                          : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* Full-bleed photo or broken fallback */}
                      {brokenImgs.has(`preset-${style}`) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-surface/90">
                          <ImageIcon className="h-6 w-6 text-gray-600" />
                          <span className="text-[10px] text-gray-600">No preview</span>
                        </div>
                      ) : (
                        <img
                          src={imgUrl}
                          alt={style}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={() => markBroken(`preset-${style}`)}
                        />
                      )}

                      {/* Gradient scrim so text is always readable */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Selected coral wash */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-t from-coral/30 via-transparent to-transparent" />
                      )}

                      {/* Content pinned to bottom */}
                      <div className="relative z-10 mt-auto flex items-end justify-between p-3">
                        <span className="max-w-[80%] text-xs font-bold leading-tight text-white drop-shadow">
                          {style}
                        </span>
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg backdrop-blur-sm transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF6B47] to-[#FF9D6E]'
                              : 'bg-white/20 group-hover:bg-white/35'
                          }`}
                          style={isSelected ? { boxShadow: '0 0 10px rgba(255,107,71,0.6)' } : undefined}
                        >
                          <PresetIcon className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Custom Instructions */}
            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Custom Instructions</h2>
                <span className="text-xs text-gray-600">Optional</span>
              </div>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Any specific requests? (e.g., 'Add a large TV over the fireplace', 'Keep the flooring')"
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-300 placeholder-gray-500 backdrop-blur-3xl transition-all duration-200 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/25"
              />
            </section>

            {/* History Gallery */}
            {history.length > 0 && (
              <section className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <h2 className="text-sm font-bold text-white">Recent Renders</h2>
                  </div>
                  <span className="text-xs font-medium text-coral">
                    {history.length} render{history.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div
                  className="flex gap-3 overflow-x-auto pb-3"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleLoadHistory(entry)}
                      className={`group relative shrink-0 w-52 overflow-hidden rounded-2xl border bg-white/5 backdrop-blur-3xl transition-all duration-200 focus:outline-none hover:scale-[1.02] ${
                        activeHistoryId === entry.id ? 'border-coral/70' : 'border-white/10'
                      }`}
                      style={{
                        boxShadow: activeHistoryId === entry.id
                          ? '0 0 25px rgba(255,107,71,0.5), inset 0 1px 0 rgba(255,107,71,0.15)'
                          : undefined,
                      }}
                    >
                      <div className="relative h-36 overflow-hidden">
                        {brokenImgs.has(entry.id) ? (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface/80">
                            <ImageIcon className="h-7 w-7 text-gray-600" />
                            <p className="text-[11px] font-medium text-gray-600">Preview expired</p>
                          </div>
                        ) : (
                          <img
                            src={entry.generatedUrl}
                            alt={entry.styleName}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={() => markBroken(entry.id)}
                          />
                        )}
                        {activeHistoryId === entry.id && !brokenImgs.has(entry.id) && (
                          <div className="absolute inset-0 bg-coral/10" />
                        )}
                      </div>
                      <div className="px-3.5 py-3">
                        <p className="truncate text-xs font-semibold text-gray-300 group-hover:text-white">
                          {entry.styleName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-600">
                          {formatTime(entry.timestamp)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistory(entry.id, e)}
                        aria-label="Remove from history"
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-gray-400 opacity-0 transition-all hover:bg-red-500/80 hover:text-white group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* History gallery on the upload screen (inside glass panel) */}
        {!isUploaded && history.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-bold text-white">Previous Renders</h2>
              </div>
              <span className="text-xs font-medium text-coral">{history.length} saved</span>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-3"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {history.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleLoadHistory(entry)}
                  className="group relative shrink-0 w-52 overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:scale-[1.02] hover:border-coral/30 focus:outline-none"
                >
                  <div className="relative h-36 overflow-hidden">
                    {brokenImgs.has(entry.id) ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface/80">
                        <ImageIcon className="h-7 w-7 text-gray-600" />
                        <p className="text-[11px] font-medium text-gray-600">Preview expired</p>
                      </div>
                    ) : (
                      <img
                        src={entry.generatedUrl}
                        alt={entry.styleName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => markBroken(entry.id)}
                      />
                    )}
                  </div>
                  <div className="px-3.5 py-3">
                    <p className="truncate text-xs font-semibold text-gray-300 group-hover:text-white">
                      {entry.styleName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-600">
                      {formatTime(entry.timestamp)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHistory(entry.id, e)}
                    aria-label="Remove from history"
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-gray-400 opacity-0 transition-all hover:bg-red-500/80 hover:text-white group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </button>
              ))}
            </div>
          </section>
        )}

          </div>{/* end .p-5 inner padding */}
        </div>{/* end dark glass panel */}
      </main>

      {/* ── Fixed Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(64px)', WebkitBackdropFilter: 'blur(64px)', boxShadow: '0 -4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-4 sm:px-8">
          {error && (
            <p className="flex items-center justify-center gap-2 text-center text-sm text-red-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
              {error}
            </p>
          )}
          {!isUploaded && !error && (
            <p className="text-center text-xs text-gray-600">
              Upload a room photo to get started
            </p>
          )}
          {isUploaded && !selectedPreset && !isGenerating && !error && (
            <p className="text-center text-xs text-gray-600">
              Select a room type &amp; style preset, then click Generate
            </p>
          )}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleApplyEdit}
              disabled={isGenerating || !originalImage}
              className="group flex min-h-[56px] min-w-[240px] items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] px-10 py-4 text-base font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              style={{ boxShadow: '0 0 30px rgba(255,107,71,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  Generate Staging
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
