// Updated AI Presets and Camera Setup
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
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

// ─── Replicate ──────────────────────────────────────────────────────────────
const NANO_BANANA_PRO_VERSION =
  '99256cc418d9ac41854575e2f1c8846ce2defd0c0fb6ff2d5cbc3c826be75bc8'

// ─── Style Presets ───────────────────────────────────────────────────────────
const STYLES: Array<{
  id: string
  name: string
  image: string
  icon: LucideIcon
  prompt: string
}> = [
  {
    id: 'coastal-mediterranean',
    name: 'Coastal Mediterranean',
    image: '/Coastal-Mediterranean.jpg',
    icon: Waves,
    prompt: 'Virtual staging. Low-level curved sofas, terracotta decor accents, indoor plants, natural sunlight. Movie Look: Call Me By Your Name. Camera: Sony Venice. Lens: Prime 35mm. Film: Kodak Portra. Elements: Preserve original architecture, photorealistic.',
  },
  {
    id: 'modern-farmhouse',
    name: 'Modern Farmhouse',
    image: '/Modern-Farmhouse.jpg',
    icon: Leaf,
    prompt: 'Virtual staging. Oversized cozy linen sofas, reclaimed natural wood furniture, farmhouse decor, rustic lighting fixtures. Movie Look: Little Women. Camera: ARRI Alexa 65. Lens: Prime 24mm. Film: Kodak Portra. Elements: Warm inviting lighting, preserve structural integrity.',
  },
  {
    id: 'mid-century',
    name: 'Mid-Century Modern',
    image: '/Century-Modern.jpg',
    icon: Palette,
    prompt: 'Virtual staging. Mid-Century Modern furniture, dark walnut wood tables, retro leather lounge chair, geometric rug. Movie Look: Mad Men. Camera: Sony Venice. Lens: Prime 35mm. Film: Kodak Portra. Elements: Cinematic shadows, preserve room layout perfectly.',
  },
  {
    id: 'quiet-luxury',
    name: 'Quiet Luxury Hotel',
    image: '/Quiet-Luxury-Hotel.jpg',
    icon: Crown,
    prompt: 'Virtual staging. Matte velvet sofa, elegant dark wood furniture, minimal premium decor, ambient cove lighting. Movie Look: Succession. Camera: ARRI Alexa 65. Lens: Prime 85mm. Film: Cinestill 800T. Elements: Sophisticated, premium materials, untouched architecture.',
  },
  {
    id: 'wabi-sabi',
    name: 'Wabi-Sabi Japandi',
    image: '/Wabi-Sabi-Japandi.jpg',
    icon: Snowflake,
    prompt: 'Virtual staging. Low wooden furniture, soft neutral rugs, perfectly imperfect ceramic decor, diffused lighting. Movie Look: Dune. Camera: Sony Venice. Lens: Prime 35mm. Film: Kodak Portra. Elements: Peaceful atmosphere, preserve original room.',
  },
  {
    id: 'boho-chic',
    name: 'Boho-Chic',
    image: '/Boho-Chic.jpg',
    icon: Leaf,
    prompt: 'Virtual staging. Rattan furniture, macrame wall decor, lush indoor plants, colorful layered rugs. Movie Look: Euphoria. Camera: ARRI Alexa 65. Lens: Prime 24mm. Film: Kodak Portra. Elements: Bright natural light, highly photogenic, preserve original walls.',
  },
  {
    id: 'urban-industrial',
    name: 'Urban Industrial',
    image: '/Urban-Industrial.jpg',
    icon: Building2,
    prompt: 'Virtual staging. Dark metallic furniture, distressed leather couch, sleek glass tables, subtle warm Edison bulb lamps. Movie Look: The Batman. Camera: Sony Venice. Lens: Anamorphic. Film: Cinestill 800T. Elements: Moody cinematic depth, preserve architecture.',
  },
  {
    id: 'rustic-cabin',
    name: 'Biophilic Rustic',
    image: '/Biophilic-Rustic.jpg',
    icon: Leaf,
    prompt: 'Virtual staging. Raw natural wood edge coffee table, deep green velvet sofa, cozy woven throw blankets. Movie Look: The Revenant. Camera: ARRI Alexa 65. Lens: Prime 35mm. Film: Kodak Portra. Elements: Deep depth of field, natural vibe, preserve layout.',
  },
  {
    id: 'clean-modern',
    name: 'Clean Modern',
    image: '/Clean-Modern.jpg',
    icon: Sparkles,
    prompt: 'Virtual staging. Low-profile linen sofa, uncluttered modern furniture, light oak wood decor. Movie Look: Her. Camera: ARRI Alexa 65. Lens: Prime 24mm. Film: Kodak Portra. Elements: Maximum light and space, preserve original architecture exactly.',
  },
  {
    id: 'nordic-scandinavian',
    name: 'Nordic Scandinavian',
    image: '/Nordic-Scandinavian.jpg',
    icon: Snowflake,
    prompt: 'Virtual staging. Birch wood furniture, cozy wool textiles, potted plants, minimalistic decor. Movie Look: Force Majeure. Camera: Sony Venice. Lens: Prime 35mm. Film: Kodak Portra. Elements: Calm bright atmosphere, preserve room structure completely.',
  },
  {
    id: 'hamptons-coastal',
    name: 'Hamptons Coastal',
    image: '/Hamptons-Coastal.jpg',
    icon: Waves,
    prompt: 'Virtual staging. Navy and sand palette furniture, linen sofas, natural fiber rugs, elegant decor. Movie Look: The Talented Mr. Ripley. Camera: ARRI Alexa 65. Lens: Prime 35mm. Film: Kodak Portra. Elements: Aspirational lifestyle, preserve all structural elements.',
  },
  {
    id: 'timeless-classic',
    name: 'Timeless Classic',
    image: '/Timeless-Classic.jpg',
    icon: Crown,
    prompt: 'Virtual staging. Refined upholstered furniture, classic art pieces, symmetrical furniture layout, muted tone rugs. Movie Look: The Crown. Camera: ARRI Alexa 65. Lens: Prime 50mm. Film: Cinestill 800T. Elements: Sophisticated and calm, preserve architecture perfectly.',
  },
  {
    id: 'small-space-modern',
    name: 'Small Space Modern',
    image: '/Small-Space-Modern.jpg',
    icon: ArrowLeftRight,
    prompt: 'Virtual staging. Space-saving modular furniture, area rugs for zoning, modern floor lamps. Movie Look: Lost in Translation. Camera: Sony Venice. Lens: Prime 24mm. Film: Kodak Portra. Elements: Maximum sense of space, preserve all walls and windows exactly.',
  },
  {
    id: 'art-deco-glamour',
    name: 'Art Deco Glamour',
    image: '/Art-Deco-Glamour.jpg',
    icon: Crown,
    prompt: 'Virtual staging. Velvet furniture, gold accents, geometric pattern rugs, mirrored decor surfaces. Movie Look: The Great Gatsby. Camera: ARRI Alexa 65. Lens: Prime 35mm. Film: Cinestill 800T. Elements: Glamorous and bold, preserve original room layout.',
  },
  {
    id: 'french-country',
    name: 'French Country',
    image: '/French-Country.jpg',
    icon: Leaf,
    prompt: 'Virtual staging. Distressed wood furniture, soft linen upholstery, lavender accents, warm candlelight decor. Movie Look: Amelie. Camera: Sony Venice. Lens: Prime 35mm. Film: Kodak Portra. Elements: Romantic and warm, preserve room architecture.',
  },
  {
    id: 'tokyo-minimal',
    name: 'Tokyo Minimal',
    image: '/Tokyo-Minimal.jpg',
    icon: Snowflake,
    prompt: 'Virtual staging. Tatami-inspired low furniture, bonsai plant, minimal stone decor pieces. Movie Look: Lost in Translation. Camera: Sony Venice. Lens: Prime 50mm. Film: Kodak Portra. Elements: Serene and precise, preserve all architecture.',
  },
  {
    id: 'hollywood-regency',
    name: 'Hollywood Regency',
    image: '/Hollywood-Regency.jpg',
    icon: Crown,
    prompt: 'Virtual staging. Lacquered furniture, plush velvet seating, brass accents, dramatic floor lamps. Movie Look: Feud. Camera: ARRI Alexa 65. Lens: Prime 35mm. Film: Cinestill 800T. Elements: Dramatic and luxurious, preserve room structure.',
  },
  {
    id: 'new-york-loft',
    name: 'New York Loft',
    image: '/New-York-Loft.jpg',
    icon: Building2,
    prompt: 'Virtual staging. Distressed leather couch, black steel frame furniture, reclaimed wood tables, urban decor. Movie Look: Friends. Camera: Sony Venice. Lens: Anamorphic. Film: Kodak Portra. Elements: Urban and lived-in, preserve architecture.',
  },
  {
    id: 'resort-bali',
    name: 'Bali Resort',
    image: '/Bali-Resort.jpg',
    icon: Waves,
    prompt: 'Virtual staging. Teak wood furniture, tropical indoor plants, rattan accents, warm lantern lamps. Movie Look: Eat Pray Love. Camera: ARRI Alexa 65. Lens: Prime 35mm. Film: Kodak Portra. Elements: Tropical and serene, preserve room layout exactly.',
  },
  {
    id: 'dark-moody',
    name: 'Dark Moody',
    image: '/Dark-Moody.jpg',
    icon: Palette,
    prompt: 'Virtual staging. Dark velvet sofa, brass lighting fixtures, deep forest green decor accents, layered rugs. Movie Look: Peaky Blinders. Camera: Sony Venice. Lens: Prime 35mm. Film: Cinestill 800T. Elements: Rich and atmospheric, preserve architecture.',
  },
  {
    id: 'mediterranean-villa',
    name: 'Mediterranean Villa',
    image: '/Mediterranean-Villa.jpg',
    icon: Waves,
    prompt: 'Virtual staging. Rustic wood furniture, mosaic decor accents, wrought iron lamps, terracotta vases. Movie Look: Under the Tuscan Sun. Camera: ARRI Alexa 65. Lens: Prime 24mm. Film: Kodak Portra. Elements: Sun-drenched and authentic, preserve architecture.',
  },
  {
    id: 'zen-spa',
    name: 'Zen Spa',
    image: '/Zen-Spa.jpg',
    icon: Snowflake,
    prompt: 'Virtual staging. Bamboo furniture accents, white linen towels, indoor tabletop water feature, pebble decor. Movie Look: Crazy Rich Asians. Camera: Sony Venice. Lens: Prime 50mm. Film: Kodak Portra. Elements: Healing and calm, preserve room structure.',
  },
  {
    id: 'parisian-chic',
    name: 'Parisian Chic',
    image: '/Parisian-Chic.jpg',
    icon: Crown,
    prompt: 'Virtual staging. Velvet armchairs, vintage gold framed mirrors, soft grey area rugs, chic elegant furniture. Movie Look: Midnight in Paris. Camera: ARRI Alexa 65. Lens: Prime 35mm. Film: Kodak Portra. Elements: Effortlessly elegant, preserve all architecture.',
  },
  {
    id: 'desert-southwest',
    name: 'Desert Southwest',
    image: '/Desert-Southwest.jpg',
    icon: Leaf,
    prompt: 'Virtual staging. Navajo-pattern rugs, terracotta pots, cacti plants, warm sienna furniture accents. Movie Look: Breaking Bad. Camera: Sony Venice. Lens: Prime 35mm. Film: Kodak Portra. Elements: Earthy and warm, preserve architecture.',
  },
  {
    id: 'maximalist-eclectic',
    name: 'Maximalist Eclectic',
    image: '/Maximalist-Eclectic.jpg',
    icon: Palette,
    prompt: 'Virtual staging. Layered pattern rugs, global art objects, mixed era furniture, curated decorative clutter. Movie Look: The Royal Tenenbaums. Camera: ARRI Alexa 65. Lens: Prime 24mm. Film: Kodak Portra. Elements: Curated and personal, preserve room layout.',
  },
  {
    id: 'organic-modern',
    name: 'Organic Modern',
    image: '/Organic-Modern.jpg',
    icon: Leaf,
    prompt: 'Virtual staging. Curved furniture, natural stone coffee table, bouclé fabrics, dried pampas grass vases. Movie Look: Marriage Story. Camera: Sony Venice. Lens: Prime 35mm. Film: Kodak Portra. Elements: Soft and natural, preserve original architecture.',
  },
  {
    id: 'miami-modern',
    name: 'Miami Modern',
    image: '/Miami-Modern.jpg',
    icon: Waves,
    prompt: 'Virtual staging. White lacquer furniture, tropical art pieces, coral and turquoise decor pillows. Movie Look: Bloodline. Camera: ARRI Alexa 65. Lens: Prime 24mm. Film: Kodak Portra. Elements: Bright and luxurious, preserve architecture.',
  },
  {
    id: 'brutalist-chic',
    name: 'Brutalist Chic',
    image: '/Brutalist-Chic.jpg',
    icon: Building2,
    prompt: 'Virtual staging. Statement sculptural furniture, dark minimalist decor, architectural floor lamps. Movie Look: Ex Machina. Camera: Sony Venice. Lens: Prime 50mm. Film: Cinestill 800T. Elements: Bold and architectural, preserve all structural surfaces.',
  },
  {
    id: 'cottagecore',
    name: 'Cottagecore',
    image: '/Cottagecore.jpg',
    icon: Leaf,
    prompt: 'Virtual staging. Vintage wood furniture, floral fabric cushions, dried flower vases, cozy layered textiles. Movie Look: Midsommar. Camera: ARRI Alexa 65. Lens: Prime 35mm. Film: Kodak Portra. Elements: Whimsical and cozy, preserve room architecture.',
  },
  {
    id: 'luxury-penthouse',
    name: 'Luxury Penthouse',
    image: '/Luxury-Penthouse.jpg',
    icon: Crown,
    prompt: 'Virtual staging. Ultra-luxury bespoke modern furniture, statement chandelier, marble surface tables, monochromatic luxury rugs. Movie Look: Call Me By Your Name. Camera: Sony Venice. Lens: Prime 35mm. Film: Kodak Portra. Elements: Preserve original architecture, photorealistic.',
  },
]

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
  originalUrl: string | null
  generatedUrl: string
  styleName: string
  timestamp: number
}

type StoredEntry = Omit<HistoryEntry, 'originalUrl'>

// ─── NEW: Claude Vision analysis result ──────────────────────────────────────
type RoomAnalysis = {
  roomType: string
  recommendedStyle: string
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
  roomAnalysis?: {
    lightingScore: number
    lightingNote: string
    spaceScore: number
    spaceNote: string
    conditionNote: string
    strongPoints: string[]
    stagingTips: string[]
  }
}

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

type ReplicatePrediction = {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled' | string
  output?: string | string[]
  error?: string
  urls?: { get?: string }
}

async function runReplicatePrediction(
  prompt: string,
  imageDataUrl: string,
): Promise<string> {
  const token = import.meta.env.VITE_REPLICATE_API_TOKEN as string

  const payload = {
    version: NANO_BANANA_PRO_VERSION,
    input: {
      prompt,
      image_input: [imageDataUrl],
      aspect_ratio: 'match_input_image',
      resolution: '2K',
      output_format: 'jpg',
      allow_fallback_model: false,
    },
  }

  const submitRes = await fetch('/api/replicate/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',
    },
    body: JSON.stringify(payload),
  })

  if (!submitRes.ok) {
    const errBody = await submitRes.json().catch(() => ({}))
    throw new Error(
      (errBody as { detail?: string })?.detail ?? `Submit failed: ${submitRes.status}`
    )
  }

  let prediction: ReplicatePrediction = await submitRes.json()

  while (prediction.status === 'starting' || prediction.status === 'processing') {
    await new Promise<void>(r => setTimeout(r, 3000))
    const pollPath = prediction.urls?.get?.replace('https://api.replicate.com', '/api/replicate')
    if (!pollPath) throw new Error('No polling URL returned by Replicate')
    const pollRes = await fetch(pollPath, {
      headers: { Authorization: `Token ${token}` },
    })
    if (!pollRes.ok) throw new Error(`Poll failed: ${pollRes.status}`)
    prediction = await pollRes.json()
  }

  if (prediction.status === 'failed' || prediction.status === 'canceled') {
    throw new Error(prediction.error ?? `Prediction ${prediction.status}`)
  }
  if (prediction.status !== 'succeeded') {
    throw new Error(`Unexpected status: ${prediction.status}`)
  }

  const rawOutput = prediction.output
  const url = Array.isArray(rawOutput) ? rawOutput[0] : rawOutput

  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error(`No valid output URL received. Raw output: ${JSON.stringify(rawOutput)}`)
  }

  return url
}

// ─── NEW: Claude Vision room analysis ────────────────────────────────────────
async function analyzeRoomWithClaude(imageDataUrl: string): Promise<RoomAnalysis> {
  const response = await fetch('/api/analyze-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageDataUrl,
      styleNames: STYLES.map(s => s.name).join(', '),
      roomTypes: ROOM_TYPES.join(', '),
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? `Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const rawText = (data.content as Array<{ type: string; text?: string }>)
    .find(b => b.type === 'text')?.text ?? ''

  // Strip any accidental markdown fences
  const clean = rawText.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean) as RoomAnalysis

  // Validate recommendedStyle is actually in our list
  const validStyle = STYLES.find(s => s.name === parsed.recommendedStyle)
  if (!validStyle) {
    // Fallback: pick first style but keep the room type
    return { ...parsed, recommendedStyle: STYLES[0].name }
  }

  return parsed
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
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set())

  // ── NEW: Claude Vision state ─────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [roomAnalysis, setRoomAnalysis] = useState<RoomAnalysis | null>(null)
  const [analysisDismissed, setAnalysisDismissed] = useState(false)

  const markBroken = (key: string) =>
    setBrokenImgs((prev) => { const next = new Set(prev); next.add(key); return next })

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (originalImage) URL.revokeObjectURL(originalImage)

    const blobUrl = URL.createObjectURL(file)
    setOriginalImage(blobUrl)
    setIsUploaded(true)
    setGeneratedImage(null)
    setActiveHistoryId(null)
    setError(null)
    setRoomAnalysis(null)
    setAnalysisDismissed(false)
  }

  // ── Manual Claude Vision trigger ────────────────────────────────────────────
  const handleAnalyzeWithAI = async () => {
    if (!originalImage) return

    setRoomAnalysis(null)
    setAnalysisDismissed(false)
    setIsAnalyzing(true)

    try {
      const dataUrl = await blobUrlToDataUrl(originalImage)
      const analysis = await analyzeRoomWithClaude(dataUrl)
      setRoomAnalysis(analysis)
      // Auto-select only the recommended style; room type stays user-controlled
      setSelectedPreset(analysis.recommendedStyle)
      console.log('[Claude Vision] Analysis complete:', analysis)
    } catch (err) {
      console.error('[Claude Vision] Analysis failed:', err)
      // Silent failure — user can still select manually
    } finally {
      setIsAnalyzing(false)
    }
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
    setRoomAnalysis(null)
    setAnalysisDismissed(false)
    setIsAnalyzing(false)
  }

  // ── Download ────────────────────────────────────────────────────────────────
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
      const presetName  = selectedPreset ?? STYLES[0].name
      const customNote  = customInstructions.trim()
      const activeStyle = STYLES.find(s => s.name === presetName) ?? STYLES[0]
      const roomLabel   = selectedRoomType ?? 'room'

      const styledPrompt = selectedRoomType
        ? activeStyle.prompt.replace(/^(Virtual staging)[^.]*\./, `$1, ${selectedRoomType}.`)
        : activeStyle.prompt

      const prompt = [
        `Edit this photo: virtually stage this empty ${roomLabel} by adding furniture and decor.`,
        styledPrompt,
        'Only ADD furniture and decor. Do NOT alter walls, floors, ceiling, windows, doors, or perspective.',
        customNote ? `Additional request: ${customNote}` : null,
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

  // ── Pro Touch-Up ────────────────────────────────────────────────────────────
  const handleProTouchUp = async () => {
    if (!originalImage) return

    const token = import.meta.env.VITE_REPLICATE_API_TOKEN
    if (!token || typeof token !== 'string' || token.trim() === '') {
      setError('Replicate API token not found. Add VITE_REPLICATE_API_TOKEN to your .env file.')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const customNote = customInstructions.trim()

      const prompt = [
        'Edit this photo: enhance the visual quality for professional real estate photography.',
        'Perfect lighting, clean up space, improve contrast and colors.',
        'Movie Look: Architectural Digest. Camera: ARRI Alexa 65. Lens: Prime 24mm. Film: Kodak Portra.',
        'Elements: Preserve structural integrity and existing furniture completely, highly detailed, photorealistic, just enhance visual quality.',
        customNote ? `Additional request: ${customNote}` : null,
      ].filter(Boolean).join(' ')

      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl)

      setGeneratedImage(outputUrl)
      setSliderPosition(50)

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        styleName: 'Pro Touch-Up',
        timestamp: Date.now(),
      }
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        saveHistoryToStorage(updated)
        return updated
      })
      setActiveHistoryId(entry.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enhancement failed.')
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

  // ── Timestamp label — now shows date when not today ─────────────────────────
  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // ── Shared history gallery component ────────────────────────────────────────
  const HistoryGallery = ({ activeStyle }: { activeStyle: boolean }) => (
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
            activeStyle && activeHistoryId === entry.id
              ? 'border-coral/70'
              : 'border-white/10 hover:border-coral/30'
          }`}
          style={activeStyle && activeHistoryId === entry.id ? {
            boxShadow: '0 0 25px rgba(255,107,71,0.5), inset 0 1px 0 rgba(255,107,71,0.15)',
          } : undefined}
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
            {activeStyle && activeHistoryId === entry.id && !brokenImgs.has(entry.id) && (
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
  )

  const activeBgImage = (STYLES.find(s => s.name === selectedPreset) ?? STYLES[0]).image

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-gray-100">

      {/* ── Cinematic dynamic background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          key={selectedPreset ?? 'default'}
          className="bg-cinematic absolute bg-cover bg-center"
          style={{ inset: '-8%', backgroundImage: `url(${activeBgImage})` }}
        />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/35" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="relative z-20 border-b border-white/10" style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(64px)', WebkitBackdropFilter: 'blur(64px)' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-8">
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-12 backdrop-blur-3xl transition-all duration-300 group-hover:bg-white/[0.09]">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-coral/20 blur-3xl transition-all duration-500 group-hover:bg-coral/30" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
                    <div className="relative flex flex-col items-center gap-5">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-coral/15 text-coral ring-1 ring-coral/20 transition-all duration-300 group-hover:bg-coral/25 group-hover:ring-coral/40">
                        <ImageIcon className="h-9 w-9" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">AI Space Designer Pro</p>
                        <p className="mt-1.5 text-sm text-gray-400">Drop your room photo or click to upload</p>
                        <p className="mt-1 text-xs text-gray-600">PNG, JPG up to 10 MB</p>
                      </div>
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
                            {selectedPreset ?? STYLES[0].name} style · typically 30–60 sec
                          </p>
                        </div>
                        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full animate-pulse rounded-full bg-coral" style={{ width: '65%' }} />
                        </div>
                      </div>
                    )}

                    {/* Before / After Slider */}
                    {generatedImage && originalImage && !isGenerating ? (
                      <>
                        <img src={originalImage} alt="Before" className="absolute inset-0 h-full w-full object-cover" />
                        <img
                          src={generatedImage}
                          alt="After"
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                        />
                        <div
                          className="pointer-events-none absolute inset-y-0 w-0.5 bg-coral"
                          style={{ left: `${sliderPosition}%`, boxShadow: '0 0 12px rgba(255,107,71,0.9)' }}
                        />
                        <div
                          className="pointer-events-none absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-coral bg-black/70 shadow-xl backdrop-blur-sm"
                          style={{ left: `${sliderPosition}%` }}
                        >
                          <ArrowLeftRight className="h-4 w-4 text-coral" />
                        </div>
                        <span className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">Before</span>
                        <span className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">After</span>
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
                      <img src={generatedImage} alt="Generated result" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <img
                        src={originalImage!}
                        alt="Original room"
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isGenerating ? 'opacity-30' : 'opacity-100'}`}
                      />
                    )}
                  </div>

                  <p className="border-t border-white/5 px-4 py-2.5 text-center text-xs font-medium uppercase tracking-widest text-gray-500">
                    {isGenerating ? 'Processing…' : generatedImage ? 'Before ← Drag → After' : 'Original Room'}
                  </p>
                </div>

                {/* ── Manual Claude Vision trigger ── */}
                {originalImage && !isGenerating && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAnalyzeWithAI}
                      disabled={isAnalyzing}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] px-4 py-2 text-xs font-semibold text-white shadow-coral-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none"
                    >
                      <Brain className="h-4 w-4" />
                      {isAnalyzing ? 'Analyzing…' : 'Analyze with AI'}
                    </button>
                  </div>
                )}

                {/* ── NEW: Claude Vision Analysis Banner ────────────────────── */}
                {(isAnalyzing || (roomAnalysis && !analysisDismissed)) && (
                  <div
                    className="mt-4 overflow-hidden rounded-2xl border border-white/10 backdrop-blur-3xl transition-all duration-500"
                    style={{
                      background: isAnalyzing
                        ? 'rgba(255,107,71,0.05)'
                        : 'linear-gradient(135deg, rgba(255,107,71,0.08) 0%, rgba(139,92,246,0.06) 100%)',
                      borderColor: isAnalyzing ? 'rgba(255,107,71,0.2)' : 'rgba(255,107,71,0.25)',
                    }}
                  >
                    {isAnalyzing ? (
                      /* ── Analyzing state ── */
                      <div className="flex items-center gap-3 px-5 py-4">
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                          <div className="absolute inset-0 animate-ping rounded-full bg-coral/20" />
                          <Brain className="relative h-4 w-4 text-coral animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Claude is analyzing your room…</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Detecting room type · Recommending best style</p>
                        </div>
                      </div>
                    ) : roomAnalysis ? (
                      /* ── Analysis result ── */
                      <div className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B47]/20 to-purple-500/20 ring-1 ring-coral/30"
                            >
                              <CheckCircle2 className="h-4 w-4 text-coral" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-white">AI Room Analysis</p>
                                <span className="rounded-full border border-coral/30 bg-coral/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-coral">
                                  Claude Vision
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  roomAnalysis.confidence === 'high'
                                    ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                                    : roomAnalysis.confidence === 'medium'
                                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                                    : 'bg-gray-500/15 text-gray-400 border border-gray-500/25'
                                }`}>
                                  {roomAnalysis.confidence} confidence
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-gray-500">Room:</span>
                                  <span className="rounded-lg bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-gray-200">
                                    {roomAnalysis.roomType}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-gray-500">Style:</span>
                                  <span className="rounded-lg bg-coral/15 px-2 py-0.5 text-[11px] font-semibold text-coral">
                                    {roomAnalysis.recommendedStyle}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                                {roomAnalysis.reasoning}
                              </p>
                              {roomAnalysis.roomAnalysis && (
                                <div className="mt-4 space-y-4">
                                  {/* Score bars: Natural Light & Space & Flow */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Natural Light</p>
                                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] transition-all duration-700"
                                          style={{ width: `${Math.min(10, Math.max(0, roomAnalysis.roomAnalysis.lightingScore)) * 10}%` }}
                                        />
                                      </div>
                                      <p className="mt-1 text-[10px] text-gray-400">{roomAnalysis.roomAnalysis.lightingScore}/10 · {roomAnalysis.roomAnalysis.lightingNote}</p>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Space & Flow</p>
                                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] transition-all duration-700"
                                          style={{ width: `${Math.min(10, Math.max(0, roomAnalysis.roomAnalysis.spaceScore)) * 10}%` }}
                                        />
                                      </div>
                                      <p className="mt-1 text-[10px] text-gray-400">{roomAnalysis.roomAnalysis.spaceScore}/10 · {roomAnalysis.roomAnalysis.spaceNote}</p>
                                    </div>
                                  </div>
                                  {/* Strong points — max 3 green check badges */}
                                  {roomAnalysis.roomAnalysis.strongPoints?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {(roomAnalysis.roomAnalysis.strongPoints.slice(0, 3)).map((point, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/25 bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-400"
                                        >
                                          <Check className="h-3 w-3 shrink-0" />
                                          {point}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {/* Staging tips — 2 bullets in darker box */}
                                  {roomAnalysis.roomAnalysis.stagingTips?.length > 0 && (
                                    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Staging Tips</p>
                                      <ul className="space-y-1">
                                        {(roomAnalysis.roomAnalysis.stagingTips.slice(0, 2)).map((tip, i) => (
                                          <li key={i} className="flex gap-2 text-[11px] text-gray-300">
                                            <span className="text-coral mt-0.5">•</span>
                                            <span>{tip}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setAnalysisDismissed(true)
                                  document.getElementById('popular-styles-carousel')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-xs font-semibold text-coral transition-colors hover:bg-coral/20 focus:outline-none"
                              >
                                Change Style
                              </button>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAnalysisDismissed(true)}
                              className="flex items-center gap-1.5 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-xs font-semibold text-coral transition-colors hover:bg-coral/20 focus:outline-none"
                            >
                              Change Style
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnalysisDismissed(true)}
                              className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-white/10 hover:text-gray-300 focus:outline-none"
                              aria-label="Dismiss analysis"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {generatedImage && !isGenerating && (
                  <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-3xl">
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 ring-1 ring-green-500/30">
                          <Sparkles className="h-4 w-4 text-green-400" />
                        </div>
                        <h2 className="text-sm font-bold text-white">Your Staging ROI Estimate</h2>
                        <span className="rounded-full bg-green-500/15 border border-green-500/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-400">Based on 2025 Data</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
                          <p className="text-lg font-extrabold text-white">6–10%</p>
                          <p className="mt-0.5 text-[11px] text-gray-500">Price uplift</p>
                        </div>
                        <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
                          <p className="text-lg font-extrabold text-white">58%</p>
                          <p className="mt-0.5 text-[11px] text-gray-500">Faster sale</p>
                        </div>
                        <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
                          <p className="text-lg font-extrabold text-coral">500–3,600%</p>
                          <p className="mt-0.5 text-[11px] text-gray-500">Avg ROI</p>
                        </div>
                        <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
                          <p className="text-lg font-extrabold text-white">83%</p>
                          <p className="mt-0.5 text-[11px] text-gray-500">Buyers visualize better</p>
                        </div>
                      </div>
                      <p className="mt-3 text-[11px] text-gray-600 text-center">Based on NAR 2025 · 10,000+ listings studied · Traditional staging costs $4,500–$11,500 vs AI staging ~$50</p>
                    </div>
                  </section>
                )}

                {/* ── Style Presets carousel ── */}
                <section id="popular-styles-carousel" className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Popular Styles</h2>
                    <span className="text-xs font-medium text-gray-500">
                      {selectedPreset ?? 'None selected'}
                    </span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {STYLES.map((style) => {
                      const PresetIcon = style.icon
                      const isSelected = selectedPreset === style.name
                      const isRecommended = roomAnalysis && !analysisDismissed && roomAnalysis.recommendedStyle === style.name
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedPreset(style.name)}
                          className={`group relative flex shrink-0 w-56 md:w-64 h-36 md:h-44 snap-center flex-col overflow-hidden rounded-2xl text-left transition-all duration-200 hover:scale-[1.04] focus:outline-none ${
                            isSelected ? 'border-2 border-coral/80' : 'border border-white/10 hover:border-white/20'
                          }`}
                          style={{
                            boxShadow: isSelected
                              ? '0 0 25px rgba(255,107,71,0.5), inset 0 1px 0 rgba(255,107,71,0.2)'
                              : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                          }}
                        >
                          {brokenImgs.has(`preset-${style.id}`) ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-surface/90">
                              <ImageIcon className="h-6 w-6 text-gray-600" />
                              <span className="text-[10px] text-gray-600">No preview</span>
                            </div>
                          ) : (
                            <img
                              src={style.image}
                              alt={style.name}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={() => markBroken(`preset-${style.id}`)}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-t from-coral/30 via-transparent to-transparent" />
                          )}
                          {/* ── NEW: AI Recommended badge ── */}
                          {isRecommended && !isSelected && (
                            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-coral/90 px-2 py-0.5 backdrop-blur-sm">
                              <Brain className="h-2.5 w-2.5 text-white" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-white">AI Pick</span>
                            </div>
                          )}
                          {isRecommended && isSelected && (
                            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm">
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-white">AI Pick</span>
                            </div>
                          )}
                          <div className="relative z-10 mt-auto flex items-end justify-between p-3">
                            <span className="max-w-[80%] text-xs font-bold leading-tight text-white drop-shadow">
                              {style.name}
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

                {/* ── Room Type ── */}
                <section className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Room Type</h2>
                    <span className="text-xs font-medium text-coral">Optional</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {ROOM_TYPES.map((room) => {
                      const isActive = selectedRoomType === room
                      const isAiDetected = roomAnalysis && !analysisDismissed && roomAnalysis.roomType === room
                      return (
                        <button
                          key={room}
                          type="button"
                          onClick={() => setSelectedRoomType(isActive ? null : room)}
                          className={`shrink-0 min-h-[40px] rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 focus:outline-none ${
                            isActive
                              ? 'border-transparent bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] text-white'
                              : 'border-white/10 bg-white/5 text-gray-400 backdrop-blur-3xl hover:bg-white/[0.09] hover:text-gray-200'
                          }`}
                          style={isActive ? { boxShadow: '0 0 16px rgba(255,107,71,0.4)' } : undefined}
                        >
                          {room}
                          {/* ── NEW: small dot indicator for AI-detected room ── */}
                          {isAiDetected && !isActive && (
                            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-coral align-middle" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* ── Pro Touch-Up ── */}
                <section className="mt-5">
                  <button
                    type="button"
                    onClick={handleProTouchUp}
                    disabled={isGenerating}
                    className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur-3xl transition-all duration-300 hover:border-coral/25 hover:bg-white/[0.08] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,107,71,0.1) 0%, transparent 65%)' }}
                    />
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B47]/15 to-[#FF9D6E]/15 ring-1 ring-coral/20 transition-all duration-300 group-hover:from-[#FF6B47]/25 group-hover:to-[#FF9D6E]/25 group-hover:ring-coral/40">
                      <Sparkles className="h-4 w-4 text-coral" />
                    </div>
                    <div className="relative">
                      <p className="text-sm font-semibold text-white">Pro Touch-Up</p>
                      <p className="mt-0.5 text-[11px] text-gray-500">Enhance lighting & colors — no furniture changes</p>
                    </div>
                    <div className="relative ml-auto text-gray-600 transition-colors duration-200 group-hover:text-coral">
                      <Send className="h-4 w-4" />
                    </div>
                  </button>
                </section>

                {/* ── Custom Instructions ── */}
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

                {/* ── History Gallery (post-upload) ── */}
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
                    <HistoryGallery activeStyle={true} />
                  </section>
                )}

              </div>
            )}

            {/* ── History gallery on upload screen ── */}
            {!isUploaded && history.length > 0 && (
              <section className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <h2 className="text-sm font-bold text-white">Previous Renders</h2>
                  </div>
                  <span className="text-xs font-medium text-coral">{history.length} saved</span>
                </div>
                <HistoryGallery activeStyle={false} />
              </section>
            )}

          </div>
        </div>
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
            <p className="text-center text-xs text-gray-600">Upload a room photo to get started</p>
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