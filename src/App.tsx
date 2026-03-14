// AI Beauty Try-On — converted from Virtual Staging by Claude
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
  Palette,
  Heart,
  Sun,
  Moon,
  Star,
  Flower2,
  Droplets,
  Gem,
  ArrowLeftRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

// ─── Beauty Presets ──────────────────────────────────────────────────────────
const BEAUTY_PRESETS: Array<{
  id: string
  name: string
  nameHe: string
  category: 'lips' | 'blush' | 'liner' | 'full'
  image: string
  icon: LucideIcon
  tags: string[]
  prompt: string
}> = [
  {
    id: 'natural-everyday',
    name: 'Natural Everyday',
    nameHe: 'טבעי יומיומי',
    category: 'full',
    image: '/looks/Natural-Everyday.jpg',
    icon: Sun,
    tags: ['everyday', 'natural', 'fresh'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested makeup products.

LOOK:
Natural Everyday

APPLY THESE EXACT PRODUCTS:
1. MAC M·A·Cximal Silky Matte Lipstick in Velvet Teddy
Apply on the lips as a clearly visible warm nude matte lip color with soft clean edges and natural elegant color payoff.

2. MAC Lip Pencil in Spice
Apply lightly around the natural lip border to create soft warm nude definition. Keep it blended, polished, and noticeable but not harsh.

3. MAC Powder Blush in Melba
Apply on the cheeks with a clearly visible soft peachy flush, blended upward slightly for a fresh natural lift.

DESIRED RESULT:
Create a polished everyday makeup transformation that is clearly visible, flattering, soft, natural, and premium.
The makeup should be noticeable enough to read clearly as a preset, while still looking realistic and wearable.

PRESERVE EXACTLY:
Preserve the person's exact identity, facial structure, face shape, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.
Keep the original photo composition unchanged so the transformed image aligns exactly with the original photo.

DO NOT CHANGE:
Do not reshape the face, eyes, nose, lips, jaw, eyebrows, or skin.
Do not retouch or over-smooth the skin.
Do not change the hairstyle, clothing, background, lighting, composition, or camera perspective.
Do not add extra makeup products that were not requested.
Do not make the image look like a beauty filter or AI-generated face.

OUTPUT STYLE:
Photorealistic cosmetic edit. Premium beauty realism. Overlay-ready result. Clear, elegant, natural makeup visibility.`,
  },
  {
    id: 'clean-glow',
    name: 'Clean Glow',
    nameHe: 'זוהר נקי',
    category: 'blush',
    image: '/looks/Clean-Glow.jpg',
    icon: Droplets,
    tags: ['glow', 'dewy', 'fresh'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested makeup products.

LOOK:
Clean Glow

APPLY THESE EXACT PRODUCTS:
1. Dior Addict Lip Maximizer in 001 Pink
Apply on the lips as a clearly visible glossy pink finish with healthy reflective shine and hydrated freshness.

2. MAC Lip Pencil in Spice
Apply very softly around the natural lip border to create gentle warm nude definition under the gloss. Keep it blended, refined, and noticeable but not harsh.

3. MAC Powder Blush in Melba
Apply high on the cheeks with soft diffused edges for a clearly visible fresh peachy flush and a subtle lifted effect.

DESIRED RESULT:
Create a clean glow makeup transformation that is clearly visible, polished, fresh, luminous, and elegant.
The makeup effect should be visually readable as a preset transformation while remaining realistic, photorealistic, and believable.
Keep the glow refined and skin-like, not sweaty, greasy, metallic, glittery, or overdone.

PRESERVE EXACTLY:
Preserve the person's exact identity, facial structure, face shape, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.
Keep the original photo composition unchanged so the transformed image aligns exactly with the original photo.

DO NOT CHANGE:
Do not reshape the face, eyes, nose, lips, jaw, eyebrows, or skin.
Do not retouch or over-smooth the skin.
Do not change the hairstyle, clothing, background, lighting, composition, or camera perspective.
Do not add extra makeup products that were not requested.
Do not make the image look like a beauty filter or AI-generated face.

OUTPUT STYLE:
Photorealistic cosmetic edit. Premium beauty realism. Overlay-ready result. Clear but elegant glow visibility.`,
  },
  {
    id: 'office-polished',
    name: 'Office Polished',
    nameHe: 'מלוטשת למשרד',
    category: 'full',
    image: '/looks/Office-Polished.jpg',
    icon: Gem,
    tags: ['professional', 'polished', 'daytime'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested makeup products.

LOOK:
Office Polished

APPLY THESE EXACT PRODUCTS:
1. MAC M·A·Cximal Silky Matte Lipstick in Velvet Teddy
Apply on the lips as a refined warm nude matte lip with clearly visible but controlled color payoff.

2. MAC Lip Pencil in Whirl
Apply softly around the lips for polished rosy-brown definition with smooth blended edges and a professional clean shape.

3. MAC Powder Blush in Melba
Apply on the cheeks with a clearly visible soft peachy-beige flush, blended neatly upward for a structured polished finish.

DESIRED RESULT:
Create a professional, neat, polished makeup transformation that looks composed, elegant, wearable, and clearly enhanced.
The effect should feel office-appropriate, confident, modern, and visibly more put-together than bare skin.

PRESERVE EXACTLY:
Preserve the person's exact identity, facial structure, face shape, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.
Keep the original photo composition unchanged so the transformed image aligns exactly with the original photo.

DO NOT CHANGE:
Do not reshape the face, eyes, nose, lips, jaw, eyebrows, or skin.
Do not retouch or over-smooth the skin.
Do not change the hairstyle, clothing, background, lighting, composition, or camera perspective.
Do not add extra makeup products that were not requested.
Do not make the image look like a beauty filter or AI-generated face.

OUTPUT STYLE:
Photorealistic cosmetic edit. Premium beauty realism. Overlay-ready result. Clean, structured, polished makeup visibility.`,
  },
  {
    id: 'soft-glam',
    name: 'Soft Glam',
    nameHe: 'גלאם עדין',
    category: 'full',
    image: '/looks/Soft-Glam.jpg',
    icon: Star,
    tags: ['glam', 'evening', 'romantic'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested makeup products.

LOOK:
Soft Glam

APPLY THESE EXACT PRODUCTS:
1. Kiko Milano 3D Hydra Lipgloss in 19
Apply on the lips as a clearly visible fuller-looking glossy nude finish with smooth reflective shine and rich polished dimension.

2. MAC Lip Pencil in Whirl
Apply around the lips with softly sculpted rosy-brown definition, more noticeable than an everyday look, but still blended and elegant.

3. MAC Powder Blush in Melba
Apply on the cheeks with a lifted placement and a clearly visible soft peach flush, slightly richer than natural makeup while still refined.

DESIRED RESULT:
Create a soft glam makeup transformation that feels feminine, polished, sculpted, elevated, and evening-ready.
The makeup should be visibly more glamorous than everyday makeup, but still tasteful, believable, and premium.

PRESERVE EXACTLY:
Preserve the person's exact identity, facial structure, face shape, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.
Keep the original photo composition unchanged so the transformed image aligns exactly with the original photo.

DO NOT CHANGE:
Do not reshape the face, eyes, nose, lips, jaw, eyebrows, or skin.
Do not retouch or over-smooth the skin.
Do not change the hairstyle, clothing, background, lighting, composition, or camera perspective.
Do not add extra makeup products that were not requested.
Do not make the image look like a beauty filter or AI-generated face.

OUTPUT STYLE:
Photorealistic cosmetic edit. Premium beauty realism. Overlay-ready result. Clearly visible soft glam definition.`,
  },
  {
    id: 'classic-red-lip',
    name: 'Classic Red Lip',
    nameHe: 'שפתון אדום קלאסי',
    category: 'lips',
    image: '/looks/Classic-Red-Lip.jpg',
    icon: Heart,
    tags: ['bold', 'classic', 'evening', 'red'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested makeup products.

LOOK:
Classic Red Lip

APPLY THESE EXACT PRODUCTS:
1. NARS Powermatte Lipstick in Dragon Girl
Apply on the lips as a clearly visible vivid cool red matte lipstick with crisp elegant edges and confident saturated color payoff.

2. MAC Lip Pencil in Whirl
Apply very lightly and precisely to refine the lip shape under the red lipstick while keeping the final result clean and sophisticated.

3. MAC Powder Blush in Melba
Apply softly on the cheeks with a controlled peachy flush that supports the red lip without competing with it.

DESIRED RESULT:
Create a classic red lip makeup transformation with a strong, clear focal point on the lips.
The result should feel timeless, chic, elegant, powerful, and premium.
The red lip must be clearly readable and visually striking while still photorealistic and believable.

PRESERVE EXACTLY:
Preserve the person's exact identity, facial structure, face shape, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.
Keep the original photo composition unchanged so the transformed image aligns exactly with the original photo.

DO NOT CHANGE:
Do not reshape the face, eyes, nose, lips, jaw, eyebrows, or skin.
Do not retouch or over-smooth the skin.
Do not change the hairstyle, clothing, background, lighting, composition, or camera perspective.
Do not add extra makeup products that were not requested.
Do not make the image look like a beauty filter or AI-generated face.

OUTPUT STYLE:
Photorealistic cosmetic edit. Premium beauty realism. Overlay-ready result. Strong, elegant, clearly visible red lip effect.`,
  },
  {
    id: 'warm-bronze',
    name: 'Warm Bronze',
    nameHe: 'ברונז חם',
    category: 'blush',
    image: '/looks/Warm-Bronze.jpg',
    icon: Sun,
    tags: ['bronze', 'warm', 'summer', 'glow'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested makeup products.

LOOK:
Warm Bronze

APPLY THESE EXACT PRODUCTS:
1. MAC Lip Pencil in Spice
Apply around the lips to create warm nude-brown definition with a softly sculpted but clearly visible contour.

2. Kiko Milano 3D Hydra Lipgloss in 19
Apply over the lips for a warm glossy nude finish with visible reflective shine and sun-kissed polished richness.

3. NARS Powder Blush in Taj Mahal
Apply on the cheeks with a clearly visible warm terracotta-orange flush and soft golden radiance, blended upward for a lifted sun-warmed effect.

DESIRED RESULT:
Create a warm bronze makeup transformation with visible warmth, healthy radiance, and luxurious summer-like richness.
The look should feel sun-kissed, flattering, glowing, and premium.
Keep it elegant and cosmetic, not orange, muddy, glittery, or overdone.

PRESERVE EXACTLY:
Preserve the person's exact identity, facial structure, face shape, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.
Keep the original photo composition unchanged so the transformed image aligns exactly with the original photo.

DO NOT CHANGE:
Do not reshape the face, eyes, nose, lips, jaw, eyebrows, or skin.
Do not retouch or over-smooth the skin.
Do not change the hairstyle, clothing, background, lighting, composition, or camera perspective.
Do not add extra makeup products that were not requested.
Do not make the image look like a beauty filter or AI-generated face.

OUTPUT STYLE:
Photorealistic cosmetic edit. Premium beauty realism. Overlay-ready result. Clear warm bronze visibility with refined radiance.`,
  },
  {
    id: 'cool-chic',
    name: 'Cool Chic',
    nameHe: 'קול שיק',
    category: 'full',
    image: '/looks/Cool-Chic.jpg',
    icon: Moon,
    tags: ['cool', 'chic', 'editorial', 'berry'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested makeup products.

LOOK:
Cool Chic

APPLY THESE EXACT PRODUCTS:
1. MAC Lip Pencil in Whirl
Apply around the lips with clearly visible cool rosy-brown definition and softly sculpted elegance.

2. Dior Addict Lip Maximizer in 001 Pink
Apply on the lips over the liner as a polished cool pink glossy finish with noticeable reflective shine and modern freshness.

3. MAC Powder Blush in Melba
Apply very softly and neatly on the cheeks with a balanced refined flush, keeping the overall look controlled, chic, and cooler in feeling rather than warm and sun-kissed.

DESIRED RESULT:
Create a cool chic makeup transformation that feels sleek, modern, elegant, refined, and fashion-aware.
The result should be clearly visible and polished, with a cooler, cleaner, more sophisticated mood than warm or bronzed looks.

PRESERVE EXACTLY:
Preserve the person's exact identity, facial structure, face shape, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.
Keep the original photo composition unchanged so the transformed image aligns exactly with the original photo.

DO NOT CHANGE:
Do not reshape the face, eyes, nose, lips, jaw, eyebrows, or skin.
Do not retouch or over-smooth the skin.
Do not change the hairstyle, clothing, background, lighting, composition, or camera perspective.
Do not add extra makeup products that were not requested.
Do not make the image look like a beauty filter or AI-generated face.

OUTPUT STYLE:
Photorealistic cosmetic edit. Premium beauty realism. Overlay-ready result. Clearly visible cool-toned polished effect.`,
  },
  {
    id: 'minimal-grooming',
    name: 'Minimal Grooming',
    nameHe: 'גרומינג מינימלי',
    category: 'full',
    image: '/looks/Minimal-Grooming.jpg',
    icon: Flower2,
    tags: ['minimal', 'clean', 'groomed', 'unisex'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply only the requested makeup products.

LOOK:
Minimal Grooming

APPLY THESE EXACT PRODUCTS:
1. Dior Addict Lip Maximizer in 001 Pink
Apply very lightly on the lips as a subtle but visible healthy glossy finish with natural hydration.

2. MAC Lip Pencil in Spice
Apply extremely softly at the natural lip border only where needed for gentle structure and a cleaner lip shape. Keep it very blended and understated.

3. MAC Powder Blush in Melba
Apply very lightly and evenly on the cheeks for a subtle healthy flush that looks neat, fresh, and minimally enhanced.

DESIRED RESULT:
Create a minimal grooming makeup transformation that feels clean, fresh, healthy, understated, and slightly enhanced.
The result should be clearly cleaner and more groomed than the original photo, while still looking extremely natural and low-effort.

PRESERVE EXACTLY:
Preserve the person's exact identity, facial structure, face shape, facial proportions, skin texture, hair, clothing, background, framing, lighting, camera angle, and facial expression.
Keep the original photo composition unchanged so the transformed image aligns exactly with the original photo.

DO NOT CHANGE:
Do not reshape the face, eyes, nose, lips, jaw, eyebrows, or skin.
Do not retouch or over-smooth the skin.
Do not change the hairstyle, clothing, background, lighting, composition, or camera perspective.
Do not add extra makeup products that were not requested.
Do not make the image look like a beauty filter or AI-generated face.

OUTPUT STYLE:
Photorealistic cosmetic edit. Premium beauty realism. Overlay-ready result. Very clean, subtle, clearly groomed enhancement.`,
  },
]

// ─── i18n ────────────────────────────────────────────────────────────────────
const T = {
  he: {
    generateBtn: 'נסי את הלוק',
    generating: 'מייצר...',
    uploadTitle: 'העלי סלפי',
    uploadSub: 'גרור לכאן או לחץ לבחירת תמונה',
    uploadCta: 'נסי לוק על עצמך',
    categoryLabel: 'קטגוריית מוצר',
    optional: 'אופציונלי',
    popularLooks: 'לוקים פופולריים',
    customInstructions: 'הוראות מותאמות אישית',
    customPlaceholder: 'בקשות ספציפיות? (למשל: גוון אדום כהה יותר, שפתון מט)',
    refineOnly: 'עדן את הלוק',
    refineOnlySub: 'שפר צבעים ופרטים — ללא שינוי הלוק הבסיסי',
    recentLooks: 'לוקים אחרונים',
    downloadBtn: 'הורד תוצאה',
    originalPhoto: 'תמונה מקורית',
    analyzeBtn: 'נתח עם AI',
    aiBeautyAnalysis: 'ניתוח יופי AI',
    changeStyle: 'שנה לוק',
    highConfidence: 'ביטחון גבוה',
    medConfidence: 'ביטחון בינוני',
    lowConfidence: 'ביטחון נמוך',
    skinTone: 'גוון עור',
    undertone: 'אנדרטון',
    disclaimer: 'תצוגה משוערת · לא ייצוג מדויק · Visual preview only',
  },
  en: {
    generateBtn: 'Try This Look',
    generating: 'Generating...',
    uploadTitle: 'Upload a Selfie',
    uploadSub: 'Drag here or click to select a photo',
    uploadCta: 'Try a Look on Yourself',
    categoryLabel: 'Product Category',
    optional: 'Optional',
    popularLooks: 'Popular Looks',
    customInstructions: 'Custom Instructions',
    customPlaceholder: 'Any specific requests? (e.g., darker red shade, matte finish)',
    refineOnly: 'Refine Look',
    refineOnlySub: 'Enhance colors & details — no look change',
    recentLooks: 'Recent Looks',
    downloadBtn: 'Download Result',
    originalPhoto: 'Original Photo',
    analyzeBtn: 'Analyze with AI',
    aiBeautyAnalysis: 'AI Beauty Analysis',
    changeStyle: 'Change Look',
    highConfidence: 'High Confidence',
    medConfidence: 'Medium Confidence',
    lowConfidence: 'Low Confidence',
    skinTone: 'Skin Tone',
    undertone: 'Undertone',
    disclaimer: 'Approximate preview · Not a perfect match · Visual try-on only',
  },
} as const

// ─── Product Categories ───────────────────────────────────────────────────────
const PRODUCT_CATEGORIES = [
  'Full Look',
  'Lips',
  'Blush',
  'Liner',
] as const

const HISTORY_STORAGE_KEY = 'beauty-tryon-history-v1'
const MAX_HISTORY = 12

// ─── Types ───────────────────────────────────────────────────────────────────
type HistoryEntry = {
  id: string
  originalUrl: string | null
  generatedUrl: string
  lookName: string
  timestamp: number
}

type StoredEntry = Omit<HistoryEntry, 'originalUrl'>

type FaceAnalysis = {
  skinTone: string
  undertone: string
  recommendedPreset: string
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
  beautyTips: string[]
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
    version: undefined,
    input: {
      prompt,
      image_input: [imageDataUrl],
      aspect_ratio: 'match_input_image',
      output_format: 'jpg',
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

// ─── Claude Vision — Face / Beauty Analysis ──────────────────────────────────
async function analyzeFaceWithClaude(imageDataUrl: string, lang: 'he' | 'en'): Promise<FaceAnalysis> {
  const response = await fetch('/api/analyze-room', {  // reuse same endpoint
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageDataUrl,
      styleNames: BEAUTY_PRESETS.map(p => p.name).join(', '),
      roomTypes: PRODUCT_CATEGORIES.join(', '),
      lang,
      mode: 'beauty', // signal to the API route to use beauty prompt
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? `Analysis error: ${response.status}`)
  }

  const data = await response.json()
  const rawText = (data.content as Array<{ type: string; text?: string }>)
    .find(b => b.type === 'text')?.text ?? ''

  const clean = rawText.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean) as FaceAnalysis

  const validPreset = BEAUTY_PRESETS.find(p => p.name === parsed.recommendedPreset)
  if (!validPreset) {
    return { ...parsed, recommendedPreset: BEAUTY_PRESETS[0].name }
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

  const [lang, setLang] = useState<'he' | 'en'>('he')
  const t = T[lang]

  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [isUploaded, setIsUploaded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [makeupOpacity, setMakeupOpacity] = useState(100)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [customInstructions, setCustomInstructions] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistoryFromStorage)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set())

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysis | null>(null)
  const [analysisDismissed, setAnalysisDismissed] = useState(false)

  const markBroken = (key: string) =>
    setBrokenImgs((prev) => { const next = new Set(prev); next.add(key); return next })

  // ── File upload ──────────────────────────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (originalImage) URL.revokeObjectURL(originalImage)

    const blobUrl = URL.createObjectURL(file)
    setOriginalImage(blobUrl)
    setIsUploaded(true)
    setGeneratedImage(null)
    setActiveHistoryId(null)
    setError(null)
    setFaceAnalysis(null)
    setAnalysisDismissed(false)
  }

  // ── Claude Vision trigger ────────────────────────────────────────────────────
  const handleAnalyzeWithAI = async () => {
    if (!originalImage) return

    setFaceAnalysis(null)
    setAnalysisDismissed(false)
    setIsAnalyzing(true)

    try {
      const dataUrl = await blobUrlToDataUrl(originalImage)
      const analysis = await analyzeFaceWithClaude(dataUrl, lang)
      setFaceAnalysis(analysis)
      setSelectedPreset(analysis.recommendedPreset)
      console.log('[Claude Vision] Beauty analysis complete:', analysis)
    } catch (err) {
      console.error('[Claude Vision] Beauty analysis failed:', err)
      // Silent failure — user can still select manually
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ── Clear ────────────────────────────────────────────────────────────────────
  const handleClear = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage)
      setOriginalImage(null)
    }
    setIsUploaded(false)
    setGeneratedImage(null)
    setIsGenerating(false)
    setMakeupOpacity(100)
    setSelectedPreset(null)
    setSelectedCategory(null)
    setCustomInstructions('')
    setActiveHistoryId(null)
    setError(null)
    setFaceAnalysis(null)
    setAnalysisDismissed(false)
    setIsAnalyzing(false)
  }

  // ── Download ─────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!generatedImage) return
    const name = `BeautyTryOn-${(selectedPreset ?? 'Look').replace(/\s+/g, '-')}.jpg`
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

  // ── Generate Look ────────────────────────────────────────────────────────────
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
      const presetName = selectedPreset ?? BEAUTY_PRESETS[0].name
      const customNote = customInstructions.trim()
      const activePreset = BEAUTY_PRESETS.find(p => p.name === presetName) ?? BEAUTY_PRESETS[0]

      // Optionally layer in category-specific instruction
      const categoryNote = selectedCategory && selectedCategory !== 'Full Look'
        ? ` Focus especially on ${selectedCategory.toLowerCase()} products.`
        : ''

      const prompt = [
        'STRICT EDITING RULE: Do not zoom in, crop, reframe, or change the field of view in any way. The face must appear at the exact same size and position as in the original photo. Output dimensions and framing must be identical to the input.',
        activePreset.prompt,
        categoryNote,
        customNote ? `Additional request: ${customNote}` : null,
      ].filter(Boolean).join('\n\n')

      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl)

      setGeneratedImage(outputUrl)
      setSliderPosition(50)

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        lookName: presetName,
        timestamp: Date.now(),
      }
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        saveHistoryToStorage(updated)
        return updated
      })
      setActiveHistoryId(entry.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beauty try-on failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Refine Only (no look change, just enhance) ───────────────────────────────
  const handleRefineOnly = async () => {
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
        'Beauty photo enhancement. Refine existing makeup colors — improve color vibrancy, blend edges, enhance skin glow.',
        'Do NOT change the makeup look or add new products. Preserve face shape, identity, and all existing features completely.',
        'Camera: Sony A7IV. Lighting: beauty ring light. Film: Kodak Portra 400. Photorealistic editorial quality.',
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
        lookName: 'Refined Look',
        timestamp: Date.now(),
      }
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        saveHistoryToStorage(updated)
        return updated
      })
      setActiveHistoryId(entry.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refinement failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Load history card ────────────────────────────────────────────────────────
  const handleLoadHistory = (entry: HistoryEntry) => {
    setOriginalImage(entry.originalUrl)
    setGeneratedImage(entry.generatedUrl)
    setSelectedPreset(entry.lookName)
    setIsUploaded(true)
    setSliderPosition(50)
    setActiveHistoryId(entry.id)
    setError(null)
  }

  // ── Delete history entry ─────────────────────────────────────────────────────
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id)
      saveHistoryToStorage(updated)
      return updated
    })
    if (activeHistoryId === id) setActiveHistoryId(null)
  }

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

  // ── History Gallery ──────────────────────────────────────────────────────────
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
                alt={entry.lookName}
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
              {entry.lookName}
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

  const activeBgPreset = (BEAUTY_PRESETS.find(p => p.name === selectedPreset) ?? BEAUTY_PRESETS[0])
  const activeBgImage = activeBgPreset.image

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'} className="relative min-h-screen overflow-x-hidden font-sans text-gray-100">

      {/* ── Cinematic dynamic background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          key={selectedPreset ?? 'default'}
          className="bg-cinematic absolute bg-cover bg-center"
          style={{ inset: '-8%', backgroundImage: `url(${activeBgImage})` }}
        />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/40" aria-hidden="true" />

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
                Beauty AI
              </p>
              <p className="mt-1 text-xs leading-none text-gray-500">
                Virtual Makeup Try-On
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">
                {lang === 'he' ? 'ברוכה הבאה 👋' : 'Welcome back 👋'}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {lang === 'he' ? 'סטודיו לאיפור וירטואלי' : 'Makeup Try-On Studio'}
              </p>
            </div>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B47] to-[#FF9D6E] text-base font-extrabold text-white"
              style={{ boxShadow: '0 0 25px rgba(255,107,71,0.5)' }}
            >
              <Heart className="h-5 w-5" />
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
                  aria-label="Upload selfie photo"
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
                        <p className="text-lg font-bold text-white">
                          {lang === 'he' ? 'ביוטי AI — נסי לוק על עצמך' : 'Beauty AI — Try a Look on Yourself'}
                        </p>
                        <p className="mt-1.5 text-sm text-gray-400">
                          {lang === 'he'
                            ? 'העלי סלפי — בחרי לוק — ראי את התוצאה בשניות'
                            : 'Upload a selfie · Choose a look · See the result in seconds'}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">PNG, JPG up to 10 MB</p>
                      </div>
                      <div
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 group-hover:scale-105"
                        style={{ boxShadow: '0 0 20px rgba(255,107,71,0.4)' }}
                      >
                        <Sparkles className="h-4 w-4" />
                        {t.uploadCta}
                      </div>
                      {/* Tips row */}
                      <div className="flex gap-4 text-[11px] text-gray-600">
                        <span>✦ {lang === 'he' ? 'אור טוב' : 'Good lighting'}</span>
                        <span>✦ {lang === 'he' ? 'פנים מלאות' : 'Face forward'}</span>
                        <span>✦ {lang === 'he' ? 'ללא משקפיים' : 'No glasses'}</span>
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
                    {lang === 'he' ? 'התחל מחדש' : 'Clear / Start Over'}
                  </button>
                  {generatedImage && (
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 focus:outline-none"
                      style={{ boxShadow: '0 0 25px rgba(255,107,71,0.5)' }}
                    >
                      <Download className="h-4 w-4" />
                      {t.downloadBtn}
                    </button>
                  )}
                </div>

                {/* ── Image Viewer ── */}
                <div className="overflow-hidden rounded-b-2xl border border-t-0 border-white/10 bg-white/5 backdrop-blur-3xl">
                  <div className="relative w-full overflow-hidden aspect-[3/4] max-h-[65vh]">

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
                          <p className="text-sm font-semibold text-white">
                            {lang === 'he' ? 'מייצר את הלוק שלך...' : 'Applying your look...'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {selectedPreset ?? BEAUTY_PRESETS[0].name} · {lang === 'he' ? 'בדרך כלל 30–60 שניות' : 'typically 30–60 sec'}
                          </p>
                        </div>
                        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full animate-pulse rounded-full bg-coral" style={{ width: '65%' }} />
                        </div>
                      </div>
                    )}

                    {generatedImage && !isGenerating ? (
                      <div className="relative w-full h-full">
                        <img src={originalImage!} alt="Original" className="absolute inset-0 h-full w-full object-cover object-top" />
                        <img
                          src={generatedImage}
                          alt="With makeup"
                          className="absolute inset-0 h-full w-full object-cover object-top"
                          style={{ opacity: makeupOpacity / 100 }}
                        />
                        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm">
                          <span className="text-[11px] font-semibold text-white/70">Intensity</span>
                          <input
                            type="range"
                            min={20}
                            max={100}
                            value={makeupOpacity}
                            onChange={(e) => setMakeupOpacity(Number(e.target.value))}
                            className="w-24 accent-[#FF6B47]"
                            aria-label="Makeup intensity"
                          />
                          <span className="text-[11px] font-semibold text-coral w-8 text-center">{makeupOpacity}%</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={originalImage!}
                        alt="Original selfie"
                        className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${isGenerating ? 'opacity-30' : 'opacity-100'}`}
                      />
                    )}
                  </div>

                  <p className="border-t border-white/5 px-4 py-2.5 text-center text-xs font-medium uppercase tracking-widest text-gray-500">
                    {isGenerating ? t.generating : t.originalPhoto}
                  </p>
                </div>

                {/* ── Disclaimer ── */}
                <p className="mt-3 text-center text-[11px] text-gray-600">
                  ✦ {t.disclaimer}
                </p>

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
                      {isAnalyzing ? t.generating : t.analyzeBtn}
                    </button>
                  </div>
                )}

                {/* ── Claude Vision Beauty Analysis Banner ── */}
                {(isAnalyzing || (faceAnalysis && !analysisDismissed)) && (
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
                      <div className="flex items-center gap-3 px-5 py-4">
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                          <div className="absolute inset-0 animate-ping rounded-full bg-coral/20" />
                          <Brain className="relative h-4 w-4 text-coral animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{t.aiBeautyAnalysis}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {lang === 'he'
                              ? 'מנתח גוון עור ומציע לוק מותאם אישית...'
                              : 'Analyzing skin tone · Recommending best look...'}
                          </p>
                        </div>
                      </div>
                    ) : faceAnalysis ? (
                      <div className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B47]/20 to-purple-500/20 ring-1 ring-coral/30">
                              <CheckCircle2 className="h-4 w-4 text-coral" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-white">{t.aiBeautyAnalysis}</p>
                                <span className="rounded-full border border-coral/30 bg-coral/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-coral">
                                  Claude Vision
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                    faceAnalysis.confidence === 'high'
                                      ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                                      : faceAnalysis.confidence === 'medium'
                                      ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                                      : 'bg-gray-500/15 text-gray-400 border border-gray-500/25'
                                  }`}
                                >
                                  {faceAnalysis.confidence === 'high'
                                    ? t.highConfidence
                                    : faceAnalysis.confidence === 'medium'
                                    ? t.medConfidence
                                    : t.lowConfidence}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-gray-500">{t.skinTone}:</span>
                                  <span className="rounded-lg bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-gray-200">
                                    {faceAnalysis.skinTone}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-gray-500">{t.undertone}:</span>
                                  <span className="rounded-lg bg-coral/15 px-2 py-0.5 text-[11px] font-semibold text-coral">
                                    {faceAnalysis.undertone}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                                {faceAnalysis.reasoning}
                              </p>
                              {faceAnalysis.beautyTips && faceAnalysis.beautyTips.length > 0 && (
                                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                    {lang === 'he' ? 'טיפים לך' : 'Beauty Tips'}
                                  </p>
                                  <ul className="space-y-1">
                                    {faceAnalysis.beautyTips.slice(0, 2).map((tip, i) => (
                                      <li key={i} className="flex gap-2 text-[11px] text-gray-300">
                                        <span className="text-coral mt-0.5">•</span>
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setAnalysisDismissed(true)
                                  document.getElementById('looks-carousel')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-xs font-semibold text-coral transition-colors hover:bg-coral/20 focus:outline-none"
                              >
                                {t.changeStyle}
                              </button>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAnalysisDismissed(true)}
                              className="flex items-center gap-1.5 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-xs font-semibold text-coral transition-colors hover:bg-coral/20 focus:outline-none"
                            >
                              {t.changeStyle}
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

                {/* ── Looks Carousel ── */}
                <section id="looks-carousel" className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">{t.popularLooks}</h2>
                    <span className="text-xs font-medium text-gray-500">
                      {selectedPreset ?? (lang === 'he' ? 'לא נבחר' : 'None selected')}
                    </span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {BEAUTY_PRESETS.map((preset) => {
                      const PresetIcon = preset.icon
                      const isSelected = selectedPreset === preset.name
                      const isRecommended = faceAnalysis && !analysisDismissed && faceAnalysis.recommendedPreset === preset.name
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedPreset(preset.name)}
                          className={`group relative flex shrink-0 w-44 md:w-52 h-56 md:h-64 snap-center flex-col overflow-hidden rounded-2xl text-left transition-all duration-200 hover:scale-[1.04] focus:outline-none ${
                            isSelected ? 'border-2 border-coral/80' : 'border border-white/10 hover:border-white/20'
                          }`}
                          style={{
                            boxShadow: isSelected
                              ? '0 0 25px rgba(255,107,71,0.5), inset 0 1px 0 rgba(255,107,71,0.2)'
                              : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                          }}
                        >
                          {brokenImgs.has(`preset-${preset.id}`) ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-surface/90">
                              <ImageIcon className="h-6 w-6 text-gray-600" />
                              <span className="text-[10px] text-gray-600">No preview</span>
                            </div>
                          ) : (
                            <img
                              src={preset.image}
                              alt={preset.name}
                              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                              onError={() => markBroken(`preset-${preset.id}`)}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-t from-coral/30 via-transparent to-transparent" />
                          )}
                          {/* Category badge */}
                          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{preset.category}</span>
                          </div>
                          {/* AI Recommended badge */}
                          {isRecommended && !isSelected && (
                            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-coral/90 px-2 py-0.5 backdrop-blur-sm">
                              <Brain className="h-2.5 w-2.5 text-white" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-white">AI Pick</span>
                            </div>
                          )}
                          {isRecommended && isSelected && (
                            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm">
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-white">AI Pick</span>
                            </div>
                          )}
                          <div className="relative z-10 mt-auto flex items-end justify-between p-3">
                            <div>
                              <span className="block max-w-[90%] text-xs font-bold leading-tight text-white drop-shadow">
                                {lang === 'he' ? preset.nameHe : preset.name}
                              </span>
                              {/* Tags */}
                              <div className="mt-1 flex gap-1 flex-wrap">
                                {preset.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] text-white/60">{tag}</span>
                                ))}
                              </div>
                            </div>
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

                {/* ── Product Category Filter ── */}
                <section className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">{t.categoryLabel}</h2>
                    <span className="text-xs font-medium text-coral">{t.optional}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {PRODUCT_CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat
                      const isAiDetected = faceAnalysis && !analysisDismissed && (
                        (cat === 'Lips' && ['Classic Red Lip', 'Soft Glam'].includes(faceAnalysis.recommendedPreset)) ||
                        (cat === 'Blush' && ['Clean Glow', 'Warm Bronze'].includes(faceAnalysis.recommendedPreset)) ||
                        (cat === 'Full Look' && ['Natural Everyday', 'Office Polished'].includes(faceAnalysis.recommendedPreset))
                      )
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(isActive ? null : cat)}
                          className={`shrink-0 min-h-[40px] rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 focus:outline-none ${
                            isActive
                              ? 'border-transparent bg-gradient-to-r from-[#FF6B47] to-[#FF9D6E] text-white'
                              : 'border-white/10 bg-white/5 text-gray-400 backdrop-blur-3xl hover:bg-white/[0.09] hover:text-gray-200'
                          }`}
                          style={isActive ? { boxShadow: '0 0 16px rgba(255,107,71,0.4)' } : undefined}
                        >
                          {cat}
                          {isAiDetected && !isActive && (
                            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-coral align-middle" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* ── Refine Only ── */}
                <section className="mt-5">
                  <button
                    type="button"
                    onClick={handleRefineOnly}
                    disabled={isGenerating}
                    className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur-3xl transition-all duration-300 hover:border-coral/25 hover:bg-white/[0.08] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,107,71,0.1) 0%, transparent 65%)' }}
                    />
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B47]/15 to-[#FF9D6E]/15 ring-1 ring-coral/20 transition-all duration-300 group-hover:from-[#FF6B47]/25 group-hover:to-[#FF9D6E]/25 group-hover:ring-coral/40">
                      <Palette className="h-4 w-4 text-coral" />
                    </div>
                    <div className="relative">
                      <p className="text-sm font-semibold text-white">{t.refineOnly}</p>
                      <p className="mt-0.5 text-[11px] text-gray-500">{t.refineOnlySub}</p>
                    </div>
                    <div className="relative ml-auto text-gray-600 transition-colors duration-200 group-hover:text-coral">
                      <Send className="h-4 w-4" />
                    </div>
                  </button>
                </section>

                {/* ── Custom Instructions ── */}
                <section className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">{t.customInstructions}</h2>
                    <span className="text-xs text-gray-600">{t.optional}</span>
                  </div>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder={t.customPlaceholder}
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
                        <h2 className="text-sm font-bold text-white">{t.recentLooks}</h2>
                      </div>
                      <span className="text-xs font-medium text-coral">
                        {history.length} look{history.length !== 1 ? 's' : ''}
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
                    <h2 className="text-sm font-bold text-white">
                      {lang === 'he' ? 'לוקים קודמים' : 'Previous Looks'}
                    </h2>
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
            <p className="text-center text-xs text-gray-600">{t.uploadTitle}</p>
          )}
          {isUploaded && !selectedPreset && !isGenerating && !error && (
            <p className="text-center text-xs text-gray-600">
              {lang === 'he'
                ? 'בחרי לוק מהקרוסלה, ואז לחצי על הכפתור'
                : 'Choose a look from the carousel, then click Generate'}
            </p>
          )}
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setLang(l => (l === 'he' ? 'en' : 'he'))}
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-300 backdrop-blur-3xl transition-all hover:border-coral/30 hover:text-white focus:outline-none"
              >
                {lang === 'he' ? 'EN' : 'עב'}
              </button>
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
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    {t.generateBtn}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
