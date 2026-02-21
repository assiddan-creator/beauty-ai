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
  Home,
  Waves,
  Palette,
  Crown,
  Layers,
  ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react'

// ─── Replicate ──────────────────────────────────────────────────────────────
// google/nano-banana – pinned version hash
const NANO_BANANA_VERSION =
  'f0a9d34b12ad1c1cd76269a844b218ff4e64e128ddaba93e15891f47368958a0'

const STYLE_PRESETS = [
  'Urban Industrial',
  'Scandinavian Minimalist',
  'Boho-Chic',
  'Modern Farmhouse',
  'Coastal Mediterranean',
  'Eclectic Airbnb',
  'Modern Luxury',
  'Mid-Century Modern',
  'Transitional',
] as const

const PRESET_GRADIENTS = [
  'linear-gradient(145deg, #1f1412 0%, #3b2418 60%, #141414 100%)', // Urban Industrial – rust/iron
  'linear-gradient(145deg, #131620 0%, #1e2540 60%, #141414 100%)', // Scandinavian – icy blue
  'linear-gradient(145deg, #1f1a0e 0%, #3a2e12 60%, #141414 100%)', // Boho-Chic – warm ochre
  'linear-gradient(145deg, #1c1a14 0%, #342e20 60%, #141414 100%)', // Modern Farmhouse – linen
  'linear-gradient(145deg, #0c1a22 0%, #123040 60%, #141414 100%)', // Coastal – deep teal
  'linear-gradient(145deg, #1a0f22 0%, #32183e 60%, #141414 100%)', // Eclectic – violet
  'linear-gradient(145deg, #161510 0%, #2c2810 60%, #141414 100%)', // Modern Luxury – dark gold
  'linear-gradient(145deg, #1e1710 0%, #362c18 60%, #141414 100%)', // Mid-Century – amber
  'linear-gradient(145deg, #161618 0%, #282830 60%, #141414 100%)', // Transitional – neutral
]

const PRESET_ICONS: LucideIcon[] = [
  Building2,      // Urban Industrial
  Snowflake,      // Scandinavian Minimalist
  Leaf,           // Boho-Chic
  Home,           // Modern Farmhouse
  Waves,          // Coastal Mediterranean
  Palette,        // Eclectic Airbnb
  Crown,          // Modern Luxury
  Layers,         // Mid-Century Modern
  ArrowLeftRight, // Transitional
]

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

const NEGATIVE_PROMPT =
  'text, watermark, blurry, distorted geometry, unrealistic, cartoon, bad proportions, cluttered, messy, melting furniture, missing walls'

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
  negativePrompt: string = NEGATIVE_PROMPT
): Promise<string> {
  console.log('Sending request with token length:', import.meta.env.VITE_REPLICATE_API_TOKEN?.length)

  const res = await fetch('/api/replicate/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',
    },
    body: JSON.stringify({
      version: NANO_BANANA_VERSION,
      input: { prompt, negative_prompt: negativePrompt, image_input: [imageDataUrl] },
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
        `A high-resolution photograph of a ${roomType}.`,
        formula,
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface font-sans text-gray-100">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral text-white shadow-[0_0_16px_rgba(255,107,71,0.4)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none tracking-tight text-white">
                Magic Snap Booth
              </p>
              <p className="mt-0.5 text-[11px] leading-none text-gray-500">
                Real Estate AI
              </p>
            </div>
          </div>
          {/* Welcome */}
          <div className="text-right">
            <p className="text-sm font-semibold text-white">Welcome back, Assi 👋</p>
            <p className="mt-0.5 text-[11px] text-gray-500">Virtual Staging Studio</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 sm:px-6">

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
              className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-card py-24 transition-all hover:border-coral/50 hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:ring-offset-2 focus:ring-offset-surface"
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface text-gray-500 transition-all group-hover:bg-coral/15 group-hover:text-coral">
                <ImageIcon className="h-9 w-9" />
              </div>
              <p className="text-base font-semibold text-gray-200">
                Drop your room photo or click to upload
              </p>
              <p className="mt-2 text-sm text-gray-500">PNG, JPG up to 10 MB</p>
            </div>
          </section>
        )}

        {/* ── Main Editor (uploaded) ── */}
        {isUploaded && (
          <div className="mt-8">

            {/* Control Bar */}
            <div className="flex items-center justify-between rounded-t-2xl bg-card px-5 py-3.5">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none"
              >
                <Trash2 className="h-4 w-4" />
                Clear / Start Over
              </button>
              {generatedImage && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-coral/90 active:scale-95 focus:outline-none"
                >
                  <Download className="h-4 w-4" />
                  Download Result
                </button>
              )}
            </div>

            {/* Image Viewer */}
            <div className="flex flex-col rounded-b-2xl bg-card">
              <div
                className="relative flex w-full items-center justify-center overflow-hidden px-4 py-6"
                style={{ maxHeight: '55vh', minHeight: '260px' }}
              >
                {/* Generating Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-b-2xl bg-card/90 backdrop-blur-sm">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <div className="absolute inset-0 animate-ping rounded-full bg-coral/20" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-coral/15">
                        <Loader2 className="h-6 w-6 animate-spin text-coral" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">
                        AI is staging your room
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedPreset ?? 'Modern Luxury'} style · typically 30–60 sec
                      </p>
                    </div>
                    <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full animate-pulse rounded-full bg-coral" style={{ width: '65%' }} />
                    </div>
                  </div>
                )}

                {/* Before/After Slider */}
                {generatedImage && originalImage && !isGenerating ? (
                  <div className="relative inline-block overflow-hidden rounded-2xl">
                    <img
                      src={originalImage}
                      alt="Before"
                      className="block max-h-[55vh] w-auto object-contain"
                      style={{ maxHeight: '55vh', objectFit: 'contain' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={generatedImage}
                        alt="After"
                        className="max-h-[55vh] w-auto object-contain"
                        style={{
                          maxHeight: '55vh',
                          objectFit: 'contain',
                          clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                        }}
                      />
                    </div>
                    {/* Divider */}
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-coral"
                      style={{ left: `${sliderPosition}%`, boxShadow: '0 0 10px rgba(255,107,71,0.8)' }}
                    />
                    {/* Handle */}
                    <div
                      className="pointer-events-none absolute top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-coral bg-surface shadow-xl"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <span className="select-none text-[9px] font-bold tracking-wider text-coral">⟷</span>
                    </div>
                    {/* Labels */}
                    <span className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                      Before
                    </span>
                    <span className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                      After
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 z-20 h-full w-full cursor-col-resize opacity-0"
                      aria-label="Compare before and after"
                    />
                  </div>
                ) : generatedImage && !originalImage && !isGenerating ? (
                  <div className="flex w-full items-center justify-center overflow-hidden rounded-2xl" style={{ maxHeight: '55vh' }}>
                    <img
                      src={generatedImage}
                      alt="Generated result"
                      className="max-h-[55vh] w-auto object-contain"
                      style={{ maxHeight: '55vh', objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-center overflow-hidden rounded-2xl" style={{ maxHeight: '55vh' }}>
                    <img
                      src={originalImage!}
                      alt="Original room"
                      className={`max-h-[55vh] w-auto object-contain transition-opacity duration-300 ${isGenerating ? 'opacity-30' : 'opacity-100'}`}
                      style={{ maxHeight: '55vh', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>

              <p className="border-t border-white/5 px-4 py-2.5 text-center text-xs font-medium uppercase tracking-widest text-gray-600">
                {isGenerating
                  ? 'Processing...'
                  : generatedImage
                  ? 'Before ← Drag → After'
                  : 'Original Room'}
              </p>
            </div>

            {/* Pro Touch-Up */}
            <section className="mt-5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-coral/30 bg-coral/10 py-4 text-sm font-semibold text-coral transition-all hover:border-coral/60 hover:bg-coral/20 active:scale-[0.99] focus:outline-none"
              >
                <Sparkles className="h-4 w-4" />
                Pro Touch-Up (Enhance Only)
              </button>
            </section>

            {/* Room Type */}
            <section className="mt-7">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Room Type
              </h2>
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
                      className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none ${
                        isActive
                          ? 'bg-coral text-white'
                          : 'bg-card text-gray-400 hover:bg-white/10 hover:text-gray-200'
                      }`}
                      style={
                        isActive
                          ? { boxShadow: '0 0 14px rgba(255,107,71,0.35)' }
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
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Style Presets
              </h2>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {STYLE_PRESETS.map((style, i) => {
                  const PresetIcon = PRESET_ICONS[i]
                  const isSelected = selectedPreset === style
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setSelectedPreset(style)}
                      className={`group relative flex min-h-[88px] flex-col gap-2 overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200 hover:scale-[1.03] focus:outline-none ${
                        isSelected
                          ? 'border-coral/60 bg-card'
                          : 'border-white/5 bg-card hover:border-white/15'
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? '0 0 0 1px rgba(255,107,71,0.3), 0 0 20px rgba(255,107,71,0.15)'
                          : '0 2px 8px rgba(0,0,0,0.35)',
                      }}
                    >
                      {isSelected && (
                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-coral/[0.07]" />
                      )}
                      <PresetIcon
                        className={`relative z-10 h-4 w-4 transition-colors duration-200 ${
                          isSelected
                            ? 'text-coral'
                            : 'text-gray-500 group-hover:text-gray-300'
                        }`}
                      />
                      <span
                        className={`relative z-10 text-xs font-semibold leading-tight transition-colors duration-200 ${
                          isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`}
                      >
                        {style}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Custom Instructions */}
            <section className="mt-7">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Custom Instructions
              </h2>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Any specific requests? (e.g., 'Add a large TV over the fireplace', 'Keep the flooring')"
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/8 bg-card px-4 py-3.5 text-sm text-gray-300 placeholder-gray-600 transition-all duration-200 focus:border-coral/40 focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </section>

            {/* History Gallery */}
            {history.length > 0 && (
              <section className="mt-10">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Session History
                  </h2>
                  <span className="ml-auto text-xs text-gray-600">
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
                      className={`group relative shrink-0 w-40 overflow-hidden rounded-2xl border transition-all focus:outline-none ${
                        activeHistoryId === entry.id
                          ? 'border-coral/60'
                          : 'border-white/5 hover:border-coral/30'
                      }`}
                      style={
                        activeHistoryId === entry.id
                          ? { boxShadow: '0 0 14px rgba(255,107,71,0.2)' }
                          : undefined
                      }
                    >
                      <div className="relative h-28 overflow-hidden bg-card">
                        <img
                          src={entry.generatedUrl}
                          alt={entry.styleName}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="bg-card px-3 py-2">
                        <p className="truncate text-xs font-semibold text-gray-300 group-hover:text-white">
                          {entry.styleName}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-600">
                          {formatTime(entry.timestamp)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistory(entry.id, e)}
                        aria-label="Remove from history"
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-gray-400 opacity-0 transition-opacity hover:bg-red-500/80 hover:text-white group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* History gallery on the upload screen */}
        {!isUploaded && history.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Previous Renders
              </h2>
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
                  className="group relative shrink-0 w-40 overflow-hidden rounded-2xl border border-white/5 transition-all hover:border-coral/30 focus:outline-none"
                >
                  <div className="h-28 overflow-hidden bg-card">
                    <img
                      src={entry.generatedUrl}
                      alt={entry.styleName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="bg-card px-3 py-2">
                    <p className="truncate text-xs font-semibold text-gray-300 group-hover:text-white">
                      {entry.styleName}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      {formatTime(entry.timestamp)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHistory(entry.id, e)}
                    aria-label="Remove from history"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-gray-400 opacity-0 transition-opacity hover:bg-red-500/80 hover:text-white group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Fixed Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-card/98 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
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
              className="flex min-w-[200px] items-center justify-center gap-2.5 rounded-2xl bg-coral px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-coral/90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-card disabled:cursor-not-allowed disabled:opacity-40"
              style={{ boxShadow: '0 4px 20px rgba(255,107,71,0.35)' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
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
