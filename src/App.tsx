// AI Beauty Try-On — converted from Virtual Staging by Claude
import React, { useState, useRef } from 'react'
import {
  ImageIcon,
  Trash2,
  Download,
  Sparkles,
  Loader2,
  Send,
  X,
  Clock,
  Heart,
  Sun,
  Moon,
  Star,
  Flower2,
  Droplets,
  Gem,
  ArrowLeftRight,
  CheckCircle2,
  ChevronRight,
  Palette,
  Search,
  type LucideIcon,
} from 'lucide-react'
import { searchByIntent, type SearchResult, type LookMetadataRecord, type LookNavigationRecord } from './lib/beautyIntentSearch'
import ProductTryOnPicker from './components/ProductTryOnPicker'
import CustomRequestTryOn from './components/CustomRequestTryOn'
import RecommendationScreen from './vesti/RecommendationScreen'
import LookGallery from './vesti/LookGallery'
import EntryScreen from './vesti/EntryScreen'
import CaptureChoice from './vesti/CaptureChoice'
import CameraCapture from './vesti/CameraCapture'
import PhotoConfirm from './vesti/PhotoConfirm'
import DirectionScreen from './vesti/DirectionScreen'
import CaptureIssue from './vesti/CaptureIssue'
import ResultReveal, { type RevealProduct } from './vesti/ResultReveal'
import { VESTI_PREVIEW_ANALYSIS, VESTI_PREVIEW_IMAGE, VESTI_PREVIEW_PRODUCT, VESTI_PREVIEW_RESULT_IMAGE } from './vesti/preview'
import type { CaptureStep, LookCardModel } from './vesti/types'
import type { BeautyProductView } from './lib/productCatalogFacade'
import { getLookProductViews } from './lib/productCatalogFacade'
import { buildCustomTryOnPrompt } from './lib/customTryOnPrompt'

const ENGINES = [
  {
    id: 'nano-banana-2',
    name: 'Nano Banana 2',
    model: 'google/nano-banana-2',
    description: 'המנוע הנוכחי — עריכת תמונה קיימת',
    inputKey: 'image_input',
    isArray: true,
    supportsEdit: true,
    badge: 'פעיל',
  },
  {
    id: 'seedream-5-lite',
    name: 'Seedream 5 Lite',
    model: 'bytedance/seedream-5-lite',
    description: 'מנוע מתקדם של ByteDance — עריכה עם הבנת הוראות',
    inputKey: 'image_input',
    isArray: true,
    supportsEdit: true,
    badge: 'לניסיון',
  },
  {
    id: 'reve-edit',
    name: 'Reve Edit',
    model: 'reve/edit',
    description: 'מנוע עריכה ממוקד — שומר על פריים מקורי',
    inputKey: 'image',
    isArray: false,
    supportsEdit: true,
    badge: 'לניסיון',
  },
  {
    id: 'flux-2-pro',
    name: 'Flux 2 Pro',
    model: 'black-forest-labs/flux-2-pro',
    description: 'מנוע חזק של Black Forest Labs — עריכה ויצירה באיכות גבוהה',
    inputKey: 'input_images',
    isArray: true,
    supportsEdit: true,
    badge: 'לניסיון',
  },
  {
    id: 'seedream-4.5',
    name: 'Seedream 4.5',
    model: 'bytedance/seedream-4.5',
    description: 'מנוע ByteDance עם הבנה מרחבית חזקה',
    inputKey: 'image_input',
    isArray: true,
    supportsEdit: true,
    badge: 'לניסיון',
  },
] as const

type Engine = (typeof ENGINES)[number]

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
  {
    id: 'date-night-romantic',
    name: 'Date Night Romantic',
    nameHe: 'רומנטי ליל דייט',
    category: 'full',
    image: '/looks/Date-Night-Romantic.jpg',
    icon: Heart,
    tags: ['romantic', 'evening', 'rosy', 'soft'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a romantic date-night look: soft rosy lips, subtle blush, soft definition. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'evening-luxury',
    name: 'Evening Luxury',
    nameHe: 'יוקרה ערב',
    category: 'full',
    image: '/looks/Evening-Luxury.jpg',
    icon: Star,
    tags: ['luxury', 'evening', 'glossy', 'refined'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply an evening luxury look: glossy lips, refined blush, elegant definition. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'fresh-rosy',
    name: 'Fresh Rosy',
    nameHe: 'ורדרד רענן',
    category: 'full',
    image: '/looks/Fresh-Rosy.jpg',
    icon: Droplets,
    tags: ['fresh', 'rosy', 'youthful'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a fresh rosy look: rosy pink lips and cheeks, dewy finish. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'nude-sculpt',
    name: 'Nude Sculpt',
    nameHe: 'מפוסל ניוד',
    category: 'full',
    image: '/looks/Nude-Sculpt.jpg',
    icon: Gem,
    tags: ['nude', 'sculpted', 'elegant', 'premium'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a nude sculpted look: nude lips, sculpted blush placement, elegant definition. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'peach-pop',
    name: 'Peach Pop',
    nameHe: 'אפרסק פופ',
    category: 'full',
    image: '/looks/Peach-Pop.jpg',
    icon: Sun,
    tags: ['peach', 'cheerful', 'modern'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a peach pop look: peachy lips and blush, fresh and cheerful. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'rosewood-satin',
    name: 'Rosewood Satin',
    nameHe: 'סאטן וודרוז',
    category: 'full',
    image: '/looks/Rosewood-Satin.jpg',
    icon: Gem,
    tags: ['rosewood', 'satin', 'refined', 'luxurious'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a rosewood satin look: rosewood-toned lips and blush, satin finish. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'berry-chic',
    name: 'Berry Chic',
    nameHe: 'ברי שיק',
    category: 'lips',
    image: '/looks/Berry-Chic.jpg',
    icon: Moon,
    tags: ['berry', 'cool', 'chic', 'fashion'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a berry chic look: berry lip color, cool-toned blush. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'terracotta-nude',
    name: 'Terracotta Nude',
    nameHe: 'ניוד טרקוטה',
    category: 'blush',
    image: '/looks/Terracotta-Nude.jpg',
    icon: Sun,
    tags: ['terracotta', 'warm', 'earthy', 'rich'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a terracotta nude look: warm terracotta blush and nude lips. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'glass-nude',
    name: 'Glass Nude',
    nameHe: 'ניוד זכוכית',
    category: 'full',
    image: '/looks/Glass-Nude.jpg',
    icon: Droplets,
    tags: ['glass', 'sheer', 'glossy', 'soft'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a glass nude look: sheer glossy lips, soft glow. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'coral-breeze',
    name: 'Coral Breeze',
    nameHe: 'בריז קורל',
    category: 'full',
    image: '/looks/Coral-Breeze.jpg',
    icon: Sun,
    tags: ['coral', 'fresh', 'breezy'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a coral breeze look: coral lips and blush, fresh and breezy. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'power-nude',
    name: 'Power Nude',
    nameHe: 'ניוד עוצמה',
    category: 'full',
    image: '/looks/Power-Nude.jpg',
    icon: Star,
    tags: ['power', 'nude', 'confident', 'modern'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a power nude look: strong nude lips, defined blush, confident finish. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
  {
    id: 'local-chic',
    name: 'Local Chic',
    nameHe: 'שיק לוקל',
    category: 'full',
    image: '/looks/Local-Chic.jpg',
    icon: Flower2,
    tags: ['approachable', 'glossy', 'flattering'],
    prompt: `Beauty makeup virtual try-on. Edit the uploaded selfie and apply a local chic look: approachable glossy lips and soft blush. Preserve identity, face shape, skin texture, composition. Photorealistic, overlay-ready.`,
  },
]

const LOOK_METADATA: Record<string, {
  category: string
  vibe: string
  whenToChoose: string
  bestFor: string
  presenceLevel: 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high'
  beginnerSafety: 'very-high' | 'high' | 'medium' | 'low-medium' | 'low'
  adjacentLook: string
  salesLine: string
}> = {
  'Natural Everyday': { category: 'טבעי וקל', vibe: 'טבעי, רך, יומיומי', whenToChoose: 'כשאת רוצה משהו בטוח, מחמיא ולא מתאמץ', bestFor: 'מי שאוהבת מראה טבעי ונעים', presenceLevel: 'low', beginnerSafety: 'high', adjacentLook: 'Clean Glow', salesLine: 'מראה יומיומי רך שמחמיא כמעט תמיד' },
  'Clean Glow': { category: 'טבעי וקל', vibe: 'נקי, זוהר, רענן', whenToChoose: 'כשאת רוצה להיראות fresh, נקייה ומלוטשת', bestFor: 'מי שאוהבת glow עדין ולא כבד', presenceLevel: 'low-medium', beginnerSafety: 'high', adjacentLook: 'Fresh Rosy', salesLine: 'זוהר נקי ומחמיא שמרגיש יקר אבל קל' },
  'Office Polished': { category: 'מסודר ויוקרתי', vibe: 'מסודר, אלגנטי, מקצועי', whenToChoose: 'לעבודה, פגישות, ימים שאת רוצה להיראות מסודרת', bestFor: 'מי שרוצה לוק בטוח אבל יותר אסוף', presenceLevel: 'medium', beginnerSafety: 'high', adjacentLook: 'Power Nude', salesLine: 'לוק מסודר ואלגנטי שנראה מדויק בלי להיות כבד' },
  'Soft Glam': { category: 'ערב ודומיננטי', vibe: 'נשי, מלוטש, ערב רך', whenToChoose: 'לערב, יציאה, אירוע קליל', bestFor: 'מי שרוצה יותר נוכחות בלי full glam', presenceLevel: 'medium-high', beginnerSafety: 'medium', adjacentLook: 'Date Night Romantic', salesLine: 'גלאם רך שמרגיש נשי ומלוטש בלי להגזים' },
  'Classic Red Lip': { category: 'ערב ודומיננטי', vibe: 'קלאסי, חד, בטוח בעצמו', whenToChoose: 'כשאת רוצה statement ברור', bestFor: 'מי שאוהבת שפתיים דומיננטיות', presenceLevel: 'high', beginnerSafety: 'low-medium', adjacentLook: 'Berry Chic', salesLine: 'שפה אדומה קלאסית שעושה את כל הלוק' },
  'Warm Bronze': { category: 'חם וקייצי', vibe: 'חם, שזוף, קייצי', whenToChoose: 'לקיץ, חופשה, וייב שמשי', bestFor: 'מי שמחמיאים לה גוונים חמים', presenceLevel: 'medium-high', beginnerSafety: 'medium', adjacentLook: 'Terracotta Nude', salesLine: 'לוק חם ושזוף שמוסיף זוהר קיצי ומחמיא' },
  'Cool Chic': { category: 'מסודר ויוקרתי', vibe: 'קריר, חד, אופנתי', whenToChoose: 'כשאת רוצה מראה יותר sleek ומתוחכם', bestFor: 'מי שאוהבת גוונים קרירים ומלוטשים', presenceLevel: 'medium', beginnerSafety: 'medium', adjacentLook: 'Berry Chic', salesLine: 'לוק קריר ומתוחכם עם וייב אופנתי ונקי' },
  'Minimal Grooming': { category: 'טבעי וקל', vibe: 'נקי, מינימלי, מסודר', whenToChoose: 'כשאת רוצה כמעט בלי איפור אבל כן להיראות יותר מסודרת', bestFor: 'מי שמפחדת מאיפור מורגש', presenceLevel: 'low', beginnerSafety: 'very-high', adjacentLook: 'Glass Nude', salesLine: 'שדרוג עדין מאוד שנראה נקי ומסודר' },
  'Date Night Romantic': { category: 'ערב ודומיננטי', vibe: 'רומנטי, רך, נשי', whenToChoose: 'לדייט, ערב, או כשאת רוצה משהו מחמיא ורך', bestFor: 'מי שאוהבת ורוד-רוזי מחמיא', presenceLevel: 'medium', beginnerSafety: 'high', adjacentLook: 'Soft Glam', salesLine: 'לוק רומנטי ורך שמחמיא ונותן תחושת ערב יפה' },
  'Evening Luxury': { category: 'מסודר ויוקרתי', vibe: 'יוקרתי, מבריק, עשיר', whenToChoose: 'לאירוע, ערב, או כשאת רוצה להיראות expensive', bestFor: 'מי שאוהבת תחושת luxury gloss', presenceLevel: 'medium-high', beginnerSafety: 'medium', adjacentLook: 'Nude Sculpt', salesLine: 'לוק ערב יוקרתי ומלוטש עם תחושת מותג יוקרה' },
  'Fresh Rosy': { category: 'זוהר ורענן', vibe: 'רענן, ורוד, צעיר', whenToChoose: 'כשאת רוצה משהו חי, ורוד ומחמיא', bestFor: 'מי שנראית טוב בגוונים ורדרדים רכים', presenceLevel: 'medium', beginnerSafety: 'high', adjacentLook: 'Clean Glow', salesLine: 'ורוד רענן שמאיר את הפנים בלי להכביד' },
  'Nude Sculpt': { category: 'מסודר ויוקרתי', vibe: 'מפוסל, refined, expensive', whenToChoose: 'כשאת רוצה nude שנראה יקר ומדויק', bestFor: 'מי שאוהבת לוקים מסודרים ומחוטבים', presenceLevel: 'medium', beginnerSafety: 'medium', adjacentLook: 'Office Polished', salesLine: 'ניוד מפוסל שנראה יקר, נקי ומדויק' },
  'Peach Pop': { category: 'זוהר ורענן', vibe: 'אפרסקי, חי, שמח', whenToChoose: 'כשאת רוצה צבע חם, צעיר וקצת playful', bestFor: 'מי שאוהבת peach/coral מחמיא', presenceLevel: 'medium', beginnerSafety: 'high', adjacentLook: 'Coral Breeze', salesLine: 'לוק אפרסקי חי ושמח שנותן אנרגיה לפנים' },
  'Rosewood Satin': { category: 'זוהר ורענן', vibe: 'רך, בוגר, מאוזן', whenToChoose: 'כשאת רוצה משהו בין יום לערב', bestFor: 'מי שאוהבת ורד-חום אלגנטי', presenceLevel: 'medium', beginnerSafety: 'high', adjacentLook: 'Nude Sculpt', salesLine: 'לוק ורד-סאטן מאוזן שמרגיש שקט אבל יקר' },
  'Berry Chic': { category: 'ערב ודומיננטי', vibe: 'ברי, קריר, אופנתי', whenToChoose: 'כשאת רוצה משהו יותר חד ומודגש אבל לא אדום', bestFor: 'מי שאוהבת ורודים-ברי ותחושת fashion', presenceLevel: 'medium-high', beginnerSafety: 'medium', adjacentLook: 'Cool Chic', salesLine: 'לוק ברי קריר שמרגיש חד, שיקי ומעודכן' },
  'Terracotta Nude': { category: 'חם וקייצי', vibe: 'אדמתי, חם, עשיר', whenToChoose: 'כשאת רוצה nude חם עם עומק', bestFor: 'מי שמחמיאים לה גוונים טרקוטה וחום-חם', presenceLevel: 'medium-high', beginnerSafety: 'medium', adjacentLook: 'Warm Bronze', salesLine: 'ניוד חם ועשיר עם וייב שזוף ומתוחכם' },
  'Glass Nude': { category: 'טבעי וקל', vibe: 'מבריק, שקוף, יקר', whenToChoose: 'כשאת רוצה מראה נקי, glossy וקל', bestFor: 'מי שאוהבת לוקים מבריקים ולא כבדים', presenceLevel: 'low-medium', beginnerSafety: 'high', adjacentLook: 'Minimal Grooming', salesLine: 'ניוד מבריק ונקי שמרגיש יקר וקליל' },
  'Coral Breeze': { category: 'חם וקייצי', vibe: 'קורלי, חמים, חופשי', whenToChoose: 'לקיץ, יום שמש, או כשאת רוצה לוק מחייך', bestFor: 'מי שאוהבת גווני coral-peach', presenceLevel: 'medium', beginnerSafety: 'high', adjacentLook: 'Peach Pop', salesLine: 'לוק קורלי רענן וחם שמוסיף חיים לפנים' },
  'Power Nude': { category: 'מסודר ויוקרתי', vibe: 'חזק, בטוח, מסודר', whenToChoose: 'לעבודה, פגישות, או כשאת רוצה להיראות sharp בלי צבע בולט', bestFor: 'מי שאוהבת ניוד עם יותר נוכחות', presenceLevel: 'medium-high', beginnerSafety: 'medium', adjacentLook: 'Office Polished', salesLine: 'ניוד חזק ובטוח שנראה מסודר ומדויק' },
  'Local Chic': { category: 'מסודר ויוקרתי', vibe: 'נגיש, יפה, מסחרי', whenToChoose: 'כשאת רוצה לוק יפה, קל להבנה וקל לאהוב', bestFor: 'מי שאוהבת יופי יומיומי עם gloss וניקיון', presenceLevel: 'medium', beginnerSafety: 'high', adjacentLook: 'Glass Nude', salesLine: 'לוק מסחרי, נגיש ומחמיא שקל להתאהב בו' },
}

const LOOK_NAVIGATION: Record<string, {
  moreNatural: string
  moreGlam: string
  moreWarm: string
  moreCool: string
  saferOption: string
  bolderOption: string
}> = {
  'Natural Everyday': { moreNatural: 'Minimal Grooming', moreGlam: 'Office Polished', moreWarm: 'Peach Pop', moreCool: 'Fresh Rosy', saferOption: 'Minimal Grooming', bolderOption: 'Office Polished' },
  'Clean Glow': { moreNatural: 'Natural Everyday', moreGlam: 'Soft Glam', moreWarm: 'Peach Pop', moreCool: 'Fresh Rosy', saferOption: 'Natural Everyday', bolderOption: 'Soft Glam' },
  'Office Polished': { moreNatural: 'Natural Everyday', moreGlam: 'Power Nude', moreWarm: 'Rosewood Satin', moreCool: 'Cool Chic', saferOption: 'Natural Everyday', bolderOption: 'Power Nude' },
  'Soft Glam': { moreNatural: 'Clean Glow', moreGlam: 'Evening Luxury', moreWarm: 'Date Night Romantic', moreCool: 'Berry Chic', saferOption: 'Date Night Romantic', bolderOption: 'Evening Luxury' },
  'Classic Red Lip': { moreNatural: 'Berry Chic', moreGlam: 'Evening Luxury', moreWarm: 'Date Night Romantic', moreCool: 'Berry Chic', saferOption: 'Berry Chic', bolderOption: 'Evening Luxury' },
  'Warm Bronze': { moreNatural: 'Terracotta Nude', moreGlam: 'Evening Luxury', moreWarm: 'Coral Breeze', moreCool: 'Rosewood Satin', saferOption: 'Terracotta Nude', bolderOption: 'Evening Luxury' },
  'Cool Chic': { moreNatural: 'Office Polished', moreGlam: 'Berry Chic', moreWarm: 'Rosewood Satin', moreCool: 'Fresh Rosy', saferOption: 'Office Polished', bolderOption: 'Berry Chic' },
  'Minimal Grooming': { moreNatural: 'Glass Nude', moreGlam: 'Natural Everyday', moreWarm: 'Glass Nude', moreCool: 'Fresh Rosy', saferOption: 'Glass Nude', bolderOption: 'Natural Everyday' },
  'Date Night Romantic': { moreNatural: 'Fresh Rosy', moreGlam: 'Soft Glam', moreWarm: 'Rosewood Satin', moreCool: 'Berry Chic', saferOption: 'Fresh Rosy', bolderOption: 'Soft Glam' },
  'Evening Luxury': { moreNatural: 'Soft Glam', moreGlam: 'Classic Red Lip', moreWarm: 'Warm Bronze', moreCool: 'Cool Chic', saferOption: 'Soft Glam', bolderOption: 'Classic Red Lip' },
  'Fresh Rosy': { moreNatural: 'Clean Glow', moreGlam: 'Date Night Romantic', moreWarm: 'Peach Pop', moreCool: 'Cool Chic', saferOption: 'Clean Glow', bolderOption: 'Date Night Romantic' },
  'Nude Sculpt': { moreNatural: 'Office Polished', moreGlam: 'Evening Luxury', moreWarm: 'Rosewood Satin', moreCool: 'Cool Chic', saferOption: 'Office Polished', bolderOption: 'Evening Luxury' },
  'Peach Pop': { moreNatural: 'Clean Glow', moreGlam: 'Coral Breeze', moreWarm: 'Warm Bronze', moreCool: 'Fresh Rosy', saferOption: 'Clean Glow', bolderOption: 'Coral Breeze' },
  'Rosewood Satin': { moreNatural: 'Office Polished', moreGlam: 'Nude Sculpt', moreWarm: 'Terracotta Nude', moreCool: 'Cool Chic', saferOption: 'Office Polished', bolderOption: 'Nude Sculpt' },
  'Berry Chic': { moreNatural: 'Cool Chic', moreGlam: 'Classic Red Lip', moreWarm: 'Date Night Romantic', moreCool: 'Evening Luxury', saferOption: 'Cool Chic', bolderOption: 'Classic Red Lip' },
  'Terracotta Nude': { moreNatural: 'Warm Bronze', moreGlam: 'Power Nude', moreWarm: 'Coral Breeze', moreCool: 'Rosewood Satin', saferOption: 'Warm Bronze', bolderOption: 'Power Nude' },
  'Glass Nude': { moreNatural: 'Minimal Grooming', moreGlam: 'Clean Glow', moreWarm: 'Local Chic', moreCool: 'Fresh Rosy', saferOption: 'Minimal Grooming', bolderOption: 'Clean Glow' },
  'Coral Breeze': { moreNatural: 'Peach Pop', moreGlam: 'Warm Bronze', moreWarm: 'Terracotta Nude', moreCool: 'Fresh Rosy', saferOption: 'Peach Pop', bolderOption: 'Warm Bronze' },
  'Power Nude': { moreNatural: 'Office Polished', moreGlam: 'Nude Sculpt', moreWarm: 'Terracotta Nude', moreCool: 'Cool Chic', saferOption: 'Office Polished', bolderOption: 'Nude Sculpt' },
  'Local Chic': { moreNatural: 'Glass Nude', moreGlam: 'Power Nude', moreWarm: 'Peach Pop', moreCool: 'Office Polished', saferOption: 'Glass Nude', bolderOption: 'Power Nude' },
}

function vestiLookCards(): LookCardModel[] {
  return BEAUTY_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    nameHe: preset.nameHe,
    category: LOOK_METADATA[preset.name]?.category ?? '',
    vibe: LOOK_METADATA[preset.name]?.vibe ?? '',
    salesLine: LOOK_METADATA[preset.name]?.salesLine ?? '',
    presenceLevel: LOOK_METADATA[preset.name]?.presenceLevel ?? 'medium',
  }))
}

const LOOK_PRODUCTS: Record<string, Array<{ brand: string; productName: string; shadeName: string; category: string }>> = {
  'Natural Everyday': [
    { brand: 'MAC', productName: 'M·A·Cximal Silky Matte Lipstick', shadeName: 'Velvet Teddy', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Spice', category: 'lips' },
    { brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', category: 'blush' },
  ],
  'Clean Glow': [
    { brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '001 Pink', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Spice', category: 'lips' },
    { brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', category: 'blush' },
  ],
  'Office Polished': [
    { brand: 'MAC', productName: 'M·A·Cximal Silky Matte Lipstick', shadeName: 'Velvet Teddy', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', category: 'blush' },
  ],
  'Soft Glam': [
    { brand: 'Kiko Milano', productName: '3D Hydra Lipgloss', shadeName: '19', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', category: 'blush' },
  ],
  'Classic Red Lip': [
    { brand: 'NARS', productName: 'Powermatte Lipstick', shadeName: 'Dragon Girl', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', category: 'blush' },
  ],
  'Warm Bronze': [
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Spice', category: 'lips' },
    { brand: 'Kiko Milano', productName: '3D Hydra Lipgloss', shadeName: '19', category: 'lips' },
    { brand: 'NARS', productName: 'Powder Blush', shadeName: 'Taj Mahal', category: 'blush' },
  ],
  'Cool Chic': [
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '001 Pink', category: 'lips' },
    { brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', category: 'blush' },
  ],
  'Minimal Grooming': [
    { brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '001 Pink', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Spice', category: 'lips' },
    { brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', category: 'blush' },
  ],
  'Date Night Romantic': [
    { brand: 'Charlotte Tilbury', productName: 'Matte Revolution Lipstick', shadeName: 'Pillow Talk', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'NARS', productName: 'Blush', shadeName: 'Dolce Vita', category: 'blush' },
  ],
  'Evening Luxury': [
    { brand: 'YSL', productName: 'Loveshine Lip Oil Stick', shadeName: '44 Nude Lavalliere', category: 'lips' },
    { brand: 'NARS', productName: 'Precision Lip Liner', shadeName: 'Halong Bay', category: 'lips' },
    { brand: 'Dior', productName: 'Backstage Rosy Glow', shadeName: '001 Pink', category: 'blush' },
  ],
  'Fresh Rosy': [
    { brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '001 Pink', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'Dior', productName: 'Backstage Rosy Glow', shadeName: '001 Pink', category: 'blush' },
  ],
  'Nude Sculpt': [
    { brand: 'Charlotte Tilbury', productName: 'Matte Revolution Lipstick', shadeName: 'Pillow Talk', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'NARS', productName: 'Blush', shadeName: 'Dolce Vita', category: 'blush' },
  ],
  'Peach Pop': [
    { brand: 'Fenty Beauty', productName: 'Gloss Bomb', shadeName: 'Fenty Glow', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Spice', category: 'lips' },
    { brand: 'Rare Beauty', productName: 'Soft Pinch Liquid Blush', shadeName: 'Joy', category: 'blush' },
  ],
  'Rosewood Satin': [
    { brand: 'Bobbi Brown', productName: 'Crushed Lip Color', shadeName: 'Babe', category: 'lips' },
    { brand: 'NARS', productName: 'Precision Lip Liner', shadeName: 'Halong Bay', category: 'lips' },
    { brand: 'Ga-De', productName: 'Idyllic Soft Satin Blush', shadeName: '46 Pacific Pink', category: 'blush' },
  ],
  'Berry Chic': [
    { brand: 'Maybelline', productName: 'SuperStay Matte Ink', shadeName: '15 Lover', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'Dior', productName: 'Backstage Rosy Glow', shadeName: '001 Pink', category: 'blush' },
  ],
  'Terracotta Nude': [
    { brand: 'MAC', productName: 'M·A·Cximal Silky Matte Lipstick', shadeName: 'Velvet Teddy', category: 'lips' },
    { brand: 'NARS', productName: 'Precision Lip Liner', shadeName: 'Vence', category: 'lips' },
    { brand: 'NARS', productName: 'Powder Blush', shadeName: 'Taj Mahal', category: 'blush' },
  ],
  'Glass Nude': [
    { brand: 'MAC', productName: 'Lustreglass Sheer-Shine Lipstick', shadeName: 'Hug Me', category: 'lips' },
    { brand: 'NARS', productName: 'Precision Lip Liner', shadeName: 'Halong Bay', category: 'lips' },
    { brand: 'Bobbi Brown', productName: 'Blush', shadeName: 'Nude Peach', category: 'blush' },
  ],
  'Coral Breeze': [
    { brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '018 Intense Spice', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Spice', category: 'lips' },
    { brand: 'Rare Beauty', productName: 'Soft Pinch Liquid Blush', shadeName: 'Joy', category: 'blush' },
  ],
  'Power Nude': [
    { brand: 'Careline', productName: 'Everlast Liquid Lipstick', shadeName: '703 Pinkish Brown', category: 'lips' },
    { brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Whirl', category: 'lips' },
    { brand: 'Ga-De', productName: 'Idyllic Soft Satin Blush', shadeName: '46 Pacific Pink', category: 'blush' },
  ],
  'Local Chic': [
    { brand: 'Ga-De', productName: 'Crystal Lights Lip Gloss', shadeName: 'Sunstone', category: 'lips' },
    { brand: 'Maybelline', productName: 'Lifter Liner', shadeName: 'Big Lift', category: 'lips' },
    { brand: 'Ga-De', productName: 'Idyllic Soft Satin Blush', shadeName: '46 Pacific Pink', category: 'blush' },
  ],
}

const LOOK_USAGE_TIPS: Record<string, {
  overallTip: string
  products: Array<{
    category: 'lip' | 'blush' | 'gloss' | 'liner' | 'bronzer' | 'highlighter'
    tip: string
  }>
}> = {
  'Natural Everyday': {
    overallTip: 'השאירי את המראה נקי ונושם — פחות זה יותר.',
    products: [
      { category: 'lip', tip: 'מרחי שכבה דקה אחת לאפקט טבעי ורך' },
      { category: 'liner', tip: 'עקבי קלות על קו השפה ומזגי פנימה' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Clean Glow': {
    overallTip: 'שמרי על הזוהר עדין — בלי להכביד.',
    products: [
      { category: 'gloss', tip: 'מרחי קלות ותני לשפתיים מראה שמנמן ורענן' },
      { category: 'liner', tip: 'הגדרי בעדינות ומזגי עם הגלוס' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Office Polished': {
    overallTip: 'לוק מסודר ומדויק — מושלם ליום עבודה.',
    products: [
      { category: 'lip', tip: 'מרחי שכבה דקה אחת לאפקט טבעי ורך' },
      { category: 'liner', tip: 'עקבי בצורה מסודרת לקו שפה ברור' },
      { category: 'blush', tip: 'הנחי בגובה עצמות הלחיים למראה מוגבה ומסודר' },
    ],
  },
  'Soft Glam': {
    overallTip: 'בני את הלוק בהדרגה — גלאם רך ונשי.',
    products: [
      { category: 'lip', tip: 'בני שכבות בהדרגה לעומק צבע מלא' },
      { category: 'liner', tip: 'הגדרי ומזגי לעבר השפתון' },
      { category: 'blush', tip: 'בני את הסומק לאט עם מכחול גדול לאפקט מלא' },
    ],
  },
  'Classic Red Lip': {
    overallTip: 'שפתיים אדומות קלאסיות — ביטחון מלא.',
    products: [
      { category: 'lip', tip: 'מרחי בצורה מדויקת מהמרכז החוצה לנוכחות חזקה' },
      { category: 'liner', tip: 'עקבי קודם לקו מושלם ואז מלאי' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Warm Bronze': {
    overallTip: 'חום ושזוף — וייב קיצי מחמיא.',
    products: [
      { category: 'lip', tip: 'מרחי שכבה דקה אחת לאפקט טבעי ורך' },
      { category: 'liner', tip: 'מזגי עם השפתון לגוון חם אחיד' },
      { category: 'blush', tip: 'מרחי על עצמות הלחיים בתנועה עגולה לחום טבעי' },
    ],
  },
  'Cool Chic': {
    overallTip: 'לוק קריר ומתוחכם — נקי ואופנתי.',
    products: [
      { category: 'lip', tip: 'מרחי בצורה מסודרת לאפקט מלוטש' },
      { category: 'liner', tip: 'הגדרי בדיוק ומזגי ללא גבולות נוקשים' },
      { category: 'blush', tip: 'הנחי בגובה עצמות הלחיים למראה מוגבה ומסודר' },
    ],
  },
  'Minimal Grooming': {
    overallTip: 'מינימום איפור — מקסימום סדר ונקיון.',
    products: [
      { category: 'gloss', tip: 'מרחי שכבה דקה אחת לאפקט טבעי ורך' },
      { category: 'liner', tip: 'עקבי בעדינות רבה רק להגדרה קלה' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Date Night Romantic': {
    overallTip: 'רומנטי ורך — מושלם לערב מיוחד.',
    products: [
      { category: 'lip', tip: 'מרחי קלות ותני לשפתיים מראה שמנמן ורענן' },
      { category: 'liner', tip: 'מזגי היטב עם השפתון לרכות' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Evening Luxury': {
    overallTip: 'יוקרתי ומבריק — לילה של זוהר.',
    products: [
      { category: 'gloss', tip: 'בני שכבות בהדרגה לעומק צבע מלא' },
      { category: 'liner', tip: 'הגדרי ומזגי לעבר הגלוס המבריק' },
      { category: 'blush', tip: 'בני את הסומק לאט עם מכחול גדול לאפקט מלא' },
    ],
  },
  'Fresh Rosy': {
    overallTip: 'ורוד רענן — מאיר את הפנים בלי להכביד.',
    products: [
      { category: 'gloss', tip: 'מרחי קלות ותני לשפתיים מראה שמנמן ורענן' },
      { category: 'liner', tip: 'מזגי עם הגלוס לרכות טבעית' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Nude Sculpt': {
    overallTip: 'ניוד מפוסל — יקר, נקי ומדויק.',
    products: [
      { category: 'lip', tip: 'מרחי שכבה דקה אחת לאפקט טבעי ורך' },
      { category: 'liner', tip: 'עקבי בצורה מסודרת לקו שפה ברור' },
      { category: 'blush', tip: 'הנחי בגובה עצמות הלחיים למראה מוגבה ומסודר' },
    ],
  },
  'Peach Pop': {
    overallTip: 'אפרסקי חי — אנרגיה וצבע רך.',
    products: [
      { category: 'gloss', tip: 'מרחי קלות ותני לשפתיים מראה שמנמן ורענן' },
      { category: 'liner', tip: 'מזגי עם הגלוס לגוון חם אחיד' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Rosewood Satin': {
    overallTip: 'ורד-סאטן מאוזן — שקט ויקר.',
    products: [
      { category: 'lip', tip: 'מרחי קלות ותני לשפתיים מראה שמנמן ורענן' },
      { category: 'liner', tip: 'עקבי בעדינות ומזגי פנימה' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Berry Chic': {
    overallTip: 'ברי קריר — חד, שיקי ומעודכן.',
    products: [
      { category: 'lip', tip: 'מרחי בצורה מדויקת מהמרכז החוצה לנוכחות חזקה' },
      { category: 'liner', tip: 'הגדרי ומזגי לעבר השפתון' },
      { category: 'blush', tip: 'הנחי בגובה עצמות הלחיים למראה מוגבה ומסודר' },
    ],
  },
  'Terracotta Nude': {
    overallTip: 'ניוד חם ועשיר — וייב שזוף ומתוחכם.',
    products: [
      { category: 'lip', tip: 'מרחי שכבה דקה אחת לאפקט טבעי ורך' },
      { category: 'liner', tip: 'מזגי עם השפתון לגוון חם אחיד' },
      { category: 'blush', tip: 'מרחי על עצמות הלחיים בתנועה עגולה לחום טבעי' },
    ],
  },
  'Glass Nude': {
    overallTip: 'ניוד מבריק — קליל ויקר.',
    products: [
      { category: 'gloss', tip: 'מרחי שכבה דקה אחת לאפקט טבעי ורך' },
      { category: 'liner', tip: 'הגדרי בעדינות ומזגי עם הגלוס' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
  'Coral Breeze': {
    overallTip: 'קורלי רענן — חם ומחייך.',
    products: [
      { category: 'gloss', tip: 'מרחי קלות ותני לשפתיים מראה שמנמן ורענן' },
      { category: 'liner', tip: 'מזגי עם הגלוס לרכות' },
      { category: 'blush', tip: 'מרחי על עצמות הלחיים בתנועה עגולה לחום טבעי' },
    ],
  },
  'Power Nude': {
    overallTip: 'ניוד חזק — מסודר ובטוח.',
    products: [
      { category: 'lip', tip: 'מרחי בצורה מסודרת לאפקט מלוטש' },
      { category: 'liner', tip: 'עקבי בצורה מסודרת לקו שפה ברור' },
      { category: 'blush', tip: 'הנחי בגובה עצמות הלחיים למראה מוגבה ומסודר' },
    ],
  },
  'Local Chic': {
    overallTip: 'לוק מסחרי נגיש — יפה וקל לאהוב.',
    products: [
      { category: 'gloss', tip: 'מרחי שכבה דקה אחת לאפקט טבעי ורך' },
      { category: 'liner', tip: 'מזגי עם הגלוס לרכות טבעית' },
      { category: 'blush', tip: 'הנחי קלות על גבעות הלחיים ומזגי כלפי מעלה' },
    ],
  },
}

const PRODUCT_CATALOG = [
  { id: 'mac-velvet-teddy', category: 'lips', productType: 'lipstick', brand: 'MAC', productName: 'MACximal Silky Matte Lipstick', shadeName: 'Velvet Teddy', shadeFamily: 'warm nude', finish: 'matte', swatchColor: '#C4846A', tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC MACximal Silky Matte Lipstick in shade Velvet Teddy — a warm nude beige matte lipstick — precisely on the lips with clean edges and natural elegant payoff. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'mac-ruby-woo', category: 'lips', productType: 'lipstick', brand: 'MAC', productName: 'MACximal Silky Matte Lipstick', shadeName: 'Ruby Woo', shadeFamily: 'classic red', finish: 'matte', swatchColor: '#C0182A', tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC MACximal Silky Matte Lipstick in shade Ruby Woo — a vivid retro red matte lipstick — precisely on the lips with crisp clean edges and confident saturated payoff. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'mac-mehr', category: 'lips', productType: 'lipstick', brand: 'MAC', productName: 'MACximal Silky Matte Lipstick', shadeName: 'Mehr', shadeFamily: 'dusty rose', finish: 'matte', swatchColor: '#B5707A', tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC MACximal Silky Matte Lipstick in shade Mehr — a muted dusty rose matte lipstick — precisely on the lips with soft blended edges and feminine elegant payoff. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'dior-lip-maximizer-001', category: 'lips', productType: 'gloss', brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '001 Pink', shadeFamily: 'cool pink', finish: 'glossy', swatchColor: '#E8A0B0', tryOnPrompt: 'Beauty makeup virtual try-on. Apply Dior Addict Lip Maximizer in shade 001 Pink — a fresh cool pink glossy plumping lip gloss — on the lips with reflective shine and hydrated glossy finish. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'dior-lip-maximizer-018', category: 'lips', productType: 'gloss', brand: 'Dior', productName: 'Addict Lip Maximizer', shadeName: '018 Intense Spice', shadeFamily: 'warm coral', finish: 'glossy', swatchColor: '#C96A4A', tryOnPrompt: 'Beauty makeup virtual try-on. Apply Dior Addict Lip Maximizer in shade 018 Intense Spice — a warm spiced coral glossy lip plumper — on the lips with juicy reflective shine and warm rich dimension. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'nars-dragon-girl', category: 'lips', productType: 'lipstick', brand: 'NARS', productName: 'Powermatte Lipstick', shadeName: 'Dragon Girl', shadeFamily: 'classic red', finish: 'matte', swatchColor: '#B81C2E', tryOnPrompt: 'Beauty makeup virtual try-on. Apply NARS Powermatte Lipstick in Dragon Girl — a vivid cool red matte lipstick — precisely on the lips with crisp elegant edges and confident saturated color payoff. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'charlotte-pillow-talk', category: 'lips', productType: 'lipstick', brand: 'Charlotte Tilbury', productName: 'Matte Revolution Lipstick', shadeName: 'Pillow Talk', shadeFamily: 'rosy nude', finish: 'satin-matte', swatchColor: '#C48A8A', tryOnPrompt: 'Beauty makeup virtual try-on. Apply Charlotte Tilbury Matte Revolution Lipstick in Pillow Talk — a rosy nude satin-matte lipstick — on the lips with soft romantic color payoff and elegant blended edges. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'mac-spice-liner', category: 'lips', productType: 'liner', brand: 'MAC', productName: 'Lip Pencil', shadeName: 'Spice', shadeFamily: 'warm nude', finish: 'matte', swatchColor: '#A0614A', tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC Lip Pencil in Spice — a warm nude-brown lip liner — around the natural lip border with soft blended definition creating a flattering warm nude lip shape. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'nars-blush-taj-mahal', category: 'blush', productType: 'blush', brand: 'NARS', productName: 'Powder Blush', shadeName: 'Taj Mahal', shadeFamily: 'terracotta', finish: 'satin', swatchColor: '#C8724A', tryOnPrompt: 'Beauty makeup virtual try-on. Apply NARS Powder Blush in Taj Mahal — a warm terracotta-orange blush with golden satin finish — on the cheeks with soft diffused edges blended upward for a sun-warmed lifted effect. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'nars-blush-dolce-vita', category: 'blush', productType: 'blush', brand: 'NARS', productName: 'Powder Blush', shadeName: 'Dolce Vita', shadeFamily: 'dusty rose', finish: 'matte', swatchColor: '#C07880', tryOnPrompt: 'Beauty makeup virtual try-on. Apply NARS Powder Blush in Dolce Vita — a dusty muted rose blush — high on the cheeks with softly diffused edges for a romantic lifted flush. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'mac-blush-melba', category: 'blush', productType: 'blush', brand: 'MAC', productName: 'Powder Blush', shadeName: 'Melba', shadeFamily: 'peachy pink', finish: 'matte', swatchColor: '#E09880', tryOnPrompt: 'Beauty makeup virtual try-on. Apply MAC Powder Blush in Melba — a soft peachy-pink blush — on the cheeks with a clearly visible peachy flush, blended upward for a fresh natural lift. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
  { id: 'rare-beauty-joy', category: 'blush', productType: 'blush', brand: 'Rare Beauty', productName: 'Soft Pinch Liquid Blush', shadeName: 'Joy', shadeFamily: 'peach coral', finish: 'dewy', swatchColor: '#E8805A', tryOnPrompt: 'Beauty makeup virtual try-on. Apply Rare Beauty Soft Pinch Liquid Blush in Joy — a fresh peach-coral liquid blush — high on the cheeks with softly diffused lifted placement for a breezy warm flush. Photorealistic. Preserve exact face position, framing, identity, skin, hair, background, and camera angle completely.' },
]

type ProductItem = BeautyProductView

const BEAUTY_INTENT_ROLE_LABELS: Record<SearchResult['role'], string> = {
  best: 'הכי מתאים למה שחיפשת',
  softer: 'אם בא לך משהו עדין יותר',
  bolder: 'אם בא לך משהו נועז יותר',
  evening: 'אם בא לך משהו ערב יותר',
  alternate: 'כיוון נוסף שיכול להתאים',
}

function BeautyIntentSearchBar(props: {
  onSelectLook: (lookName: string) => void
  metadata: LookMetadataRecord
  navigation: LookNavigationRecord
}) {
  const { onSelectLook, metadata, navigation } = props
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = () => {
    setResults(searchByIntent(query, metadata, navigation))
  }

  return (
    <section className="mt-7">
      <h2 className="text-sm font-bold text-white mb-2">
        חפשי לפי מצב רוח או אירוע
      </h2>
      <p className="text-[11px] text-gray-500 mb-3">
        ספרי לאן את הולכת או איזה מראה את מחפשת — נציע לך לוקים מתאימים
      </p>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="ספרי לי לאן את הולכת או איזה מראה מחפשת..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 backdrop-blur-3xl transition-all focus:border-coral/40 focus:outline-none focus:ring-2 focus:ring-coral/20"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="shrink-0 flex items-center gap-2 rounded-2xl border border-coral/30 bg-coral/15 px-4 py-3 text-sm font-semibold text-coral transition-all hover:bg-coral/25 focus:outline-none"
        >
          <Search className="h-4 w-4" />
          חפשי
        </button>
      </div>
      {results.length > 0 && (
        <>
          <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            לפי מה שכתבת, הנה כמה כיוונים שיכולים להתאים לך
          </p>
          <div className="flex flex-wrap gap-3">
            {results.map((r) => (
              <div
                key={r.lookName}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-3xl transition-all hover:border-white/15 min-w-[200px] max-w-[260px]"
              >
                <p className="text-xs font-bold mb-0.5" style={{ color: 'rgba(255,107,71,0.9)' }}>
                  {BEAUTY_INTENT_ROLE_LABELS[r.role]}
                </p>
                <p className="text-sm font-bold text-white mb-1">{r.lookName}</p>
                <p className="text-[11px] mb-3 leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {r.reasonLine}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectLook(r.lookName)}
                  className="mt-auto rounded-xl border border-coral/30 bg-coral/10 py-2 px-3 text-xs font-semibold text-coral transition-all hover:bg-coral/20 focus:outline-none"
                >
                  נסי עליי
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

const USAGE_CATEGORY_ICON: Record<string, string> = {
  lip: '💋',
  liner: '✏️',
  gloss: '✨',
  blush: '🌸',
  bronzer: '🌟',
  highlighter: '✨',
}

function LookUsageTips({ lookName }: { lookName: string }) {
  const data = LOOK_USAGE_TIPS[lookName]
  if (!data) return null
  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
        איך ליצור את הלוק
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {data.products.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-base leading-none">{USAGE_CATEGORY_ICON[item.category] ?? '•'}</span>
            <p className="text-[11px] text-gray-300 leading-tight max-w-[200px]">{item.tip}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {data.overallTip}
      </p>
    </div>
  )
}

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
  alternatePresets: string[]
  saferOption: string
  bolderOption: string
  confidence: 'high' | 'medium' | 'low'
  lipColorFamily: string
  blushColorFamily: string
  avoidPreset: string
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
  engine: Engine,
): Promise<string> {
  const token = import.meta.env.VITE_REPLICATE_API_TOKEN as string

  const isFlux2Pro = engine.id === 'flux-2-pro'
  const isSeedream5 = engine.id === 'seedream-5-lite'
  const isSeedream45 = engine.id === 'seedream-4.5'

  const baseInput: Record<string, unknown> = { prompt }

  if (engine.isArray) {
    baseInput[engine.inputKey] = [imageDataUrl]
  } else {
    baseInput[engine.inputKey] = imageDataUrl
  }

  if (isFlux2Pro) {
    baseInput['aspect_ratio'] = 'match_input_image'
    baseInput['output_format'] = 'jpg'
  } else if (isSeedream5 || isSeedream45) {
    baseInput['aspect_ratio'] = 'match_input_image'
    baseInput['output_format'] = 'jpeg'
  } else {
    baseInput['aspect_ratio'] = 'match_input_image'
    baseInput['output_format'] = 'jpg'
  }

  const payload = { input: baseInput }

  const endpoint = engine.model.includes('/')
    ? `/api/replicate/v1/models/${engine.model}/predictions`
    : '/api/replicate/v1/predictions'

  const submitRes = await fetch(endpoint, {
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

// ─── Claude — Product try-on prompt builder ──────────────────────────────────
async function buildProductPromptWithClaude(product: ProductItem): Promise<string> {
  const response = await fetch('/api/analyze-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'prompt-builder',
      product: {
        brand: product.brand,
        productName: product.productName,
        shadeName: product.shadeName,
        shadeFamily: product.shadeFamily,
        finish: product.finish,
        category: product.category,
        productType: product.productType,
        swatchColor: product.swatchColor,
      },
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string | { message?: string } }
    const msg = typeof err?.error === 'string' ? err.error : err?.error?.message
    throw new Error(msg ?? `Prompt builder error: ${response.status}`)
  }
  const data = (await response.json()) as { prompt?: string }
  const prompt = data.prompt?.trim()
  if (!prompt) throw new Error('Empty prompt from Claude')
  return prompt
}

// ─── Claude — Result description (after try-on) ──────────────────────────────
async function generateResultDescription(lookName: string, imageUrl: string, lang: 'he' | 'en'): Promise<string> {
  const response = await fetch('/api/analyze-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'result-description',
      lookName,
      imageUrl,
      lang,
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(typeof err?.error === 'string' ? err.error : 'Result description failed')
  }
  const data = (await response.json()) as { description?: string }
  const description = data.description?.trim()
  return description ?? ''
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

// ─── Beauty Advisor Chat (result screen) ──────────────────────────────────────
type BeautyAdvisorChatProduct = {
  brand: string
  productName: string
  shadeName: string
  category: string
  shadeFamily: string
  finish: string
}
type BeautyAdvisorChatProps = {
  lookName: string
  lang: 'he' | 'en'
  products: BeautyAdvisorChatProduct[]
}

function BeautyAdvisorChat({ lookName, lang, products }: BeautyAdvisorChatProps) {
  const initialMessage =
    lang === 'he'
      ? 'שאלי אותי כל שאלה על הלוק הזה — מוצרים, איך להרכיב, מה מתאים לאיזה אירוע 💄'
      : 'Ask me anything about this look — products, how to wear it, what occasion it suits 💄'
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: initialMessage },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return
    const userMessage = { role: 'user' as const, content: trimmed }
    setInputValue('')
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    try {
      const response = await fetch('/api/analyze-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'beauty-chat',
          lookName,
          lang,
          products,
          messages: [...messages, userMessage],
        }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(typeof err?.error === 'string' ? err.error : 'Chat failed')
      }
      const data = (await response.json()) as { reply?: string }
      const reply = data.reply?.trim() ?? ''
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: lang === 'he' ? 'משהו השתבש — נסי שוב 💄' : 'Something went wrong — try again 💄',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (isExpanded) scrollToBottom()
  }, [messages, isExpanded])

  const toggleLabel = lang === 'he' ? 'שאלי את יועצת המאפר שלך ✨' : 'Ask your beauty advisor ✨'
  const placeholder = lang === 'he' ? 'שאלי שאלה על הלוק...' : 'Ask about this look...'

  return (
    <div className="mt-4 overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
      <button
        type="button"
        onClick={() => setIsExpanded((e) => !e)}
        className="flex w-full items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5 focus:outline-none"
      >
        <Sparkles className="h-4 w-4" style={{ color: 'rgba(255,107,71,0.9)' }} />
        {toggleLabel}
      </button>
      {isExpanded && (
        <>
          <div
            className="overflow-y-auto px-3 py-2 space-y-2"
            style={{ maxHeight: '220px', minHeight: '80px' }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-[13px] ${
                  m.role === 'assistant'
                    ? 'ml-0 mr-6 text-left'
                    : 'ml-6 mr-0 text-right'
                }`}
                style={
                  m.role === 'assistant'
                    ? { background: 'rgba(255,107,71,0.12)', color: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,107,71,0.2)' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-2 text-white/5">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'rgba(255,107,71,0.8)' }} />
                <span className="text-xs text-white/50">{lang === 'he' ? 'כותבת...' : 'Writing...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 p-3 border-t border-white/5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-coral/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="shrink-0 rounded-xl px-4 py-2.5 flex items-center justify-center transition-opacity disabled:opacity-40 focus:outline-none"
              style={{ background: 'linear-gradient(135deg, #FF6B47, #FF9D6E)', color: 'white' }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [lang, setLang] = useState<'he' | 'en'>('he')
  const t = T[lang]

  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [isUploaded, setIsUploaded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [resultDescription, setResultDescription] = useState<string | null>(null)
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
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [showPathScreen, setShowPathScreen] = useState(false)
  const [showAnalyzingScreen, setShowAnalyzingScreen] = useState(false)
  const [showLookProducts, setShowLookProducts] = useState(false)
  const [activeEngine, setActiveEngine] = useState<Engine>(ENGINES[0])
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const [appMode, setAppMode] = useState<'looks' | 'product'>('looks')
  const [vestiPreview, setVestiPreview] = useState<string | null>(null)
  const [captureStep, setCaptureStep] = useState<CaptureStep | null>('entry')
  const [focusRequest, setFocusRequest] = useState(false)
  const [revealProduct, setRevealProduct] = useState<RevealProduct | null>(null)
  const cameraBackStepRef = useRef<CaptureStep>('entry')

  React.useEffect(() => {
    if (!import.meta.env.DEV) return
    const preview = new URLSearchParams(window.location.search).get('vesti-preview')
    if (!preview) return
    setVestiPreview(preview)
    setShowPathScreen(false)

    const capturePreviews: Record<string, CaptureStep> = {
      entry: 'entry',
      'capture-choice': 'choice',
      camera: 'camera',
      'photo-confirm': 'confirm',
      direction: 'direction',
      preparing: 'preparing',
      'camera-error': 'camera-permission',
      'camera-unavailable': 'camera-unavailable',
      'upload-error': 'upload-error',
    }
    if (preview in capturePreviews) {
      setIsUploaded(false)
      setCaptureStep(capturePreviews[preview])
      if (preview === 'photo-confirm' || preview === 'direction') setOriginalImage(VESTI_PREVIEW_IMAGE)
      return
    }

    setCaptureStep(null)
    setIsUploaded(true)
    setOriginalImage(VESTI_PREVIEW_IMAGE)
    if (preview === 'result' || preview === 'result-buy') {
      setGeneratedImage(VESTI_PREVIEW_RESULT_IMAGE)
      setSelectedPreset('Natural Everyday')
      setFaceAnalysis(VESTI_PREVIEW_ANALYSIS)
      setAppMode('looks')
      return
    }
    if (preview === 'result-product') {
      setGeneratedImage(VESTI_PREVIEW_RESULT_IMAGE)
      setRevealProduct(VESTI_PREVIEW_PRODUCT)
      setSelectedPreset(`${VESTI_PREVIEW_PRODUCT.brand} ${VESTI_PREVIEW_PRODUCT.shadeName}`)
      setAppMode('product')
      return
    }
    if (preview === 'result-error') {
      setError(lang === 'he' ? 'לא ניתן לייצר את התוצאה.' : 'The result could not be created.')
      setSelectedPreset('Natural Everyday')
      setAppMode('looks')
      return
    }
    if (preview === 'recommendation') {
      setFaceAnalysis(VESTI_PREVIEW_ANALYSIS)
      setShowAnalysisPanel(true)
      setAppMode('looks')
      return
    }
    if (preview === 'product') {
      setAppMode('product')
      window.scrollTo(0, 0)
      return
    }
    setAppMode('looks')
    if (preview === 'request') {
      window.scrollTo(0, 0)
    }
  }, [])

  const markBroken = (key: string) =>
    setBrokenImgs((prev) => { const next = new Set(prev); next.add(key); return next })

  // ── File upload ──────────────────────────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    const withinSize = file.size > 0 && file.size <= 10 * 1024 * 1024
    if (!isImage || !withinSize) {
      setCaptureStep('upload-error')
      setShowPathScreen(false)
      return
    }
    setCaptureStep('preparing')
    if (originalImage) URL.revokeObjectURL(originalImage)

    const blobUrl = URL.createObjectURL(file)
    setOriginalImage(blobUrl)
    setGeneratedImage(null)
    setActiveHistoryId(null)
    setError(null)
    setFaceAnalysis(null)
    setAnalysisDismissed(false)
    setShowPathScreen(false)
    setCaptureStep('confirm')
  }

  const enterSelection = (mode: 'looks' | 'product', request = false) => {
    if (!originalImage) return
    setFocusRequest(request)
    setAppMode(mode)
    setIsUploaded(true)
    setCaptureStep(null)
    setShowPathScreen(false)
    if (mode === 'product' || request) window.scrollTo(0, 0)
  }

  const handleConfirmPhoto = () => {
    if (!originalImage) return
    setFocusRequest(false)
    setCaptureStep('direction')
    setShowPathScreen(false)
  }

  const handleReplacePhoto = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage)
      setOriginalImage(null)
    }
    setIsUploaded(false)
    setCaptureStep('choice')
  }

  // ── Claude Vision trigger ────────────────────────────────────────────────────
  const handleAnalyzeWithAI = async () => {
    if (!originalImage) return

    setFaceAnalysis(null)
    setAnalysisDismissed(false)
    setIsAnalyzing(true)
    setShowAnalyzingScreen(true)

    try {
      const dataUrl = await blobUrlToDataUrl(originalImage)
      const analysis = await analyzeFaceWithClaude(dataUrl, lang)
      setFaceAnalysis(analysis)
      setSelectedPreset(analysis.recommendedPreset)
      setShowAnalysisPanel(true)
      console.log('[Claude Vision] Beauty analysis complete:', analysis)
    } catch (err) {
      console.error('[Claude Vision] Beauty analysis failed:', err)
      setShowAnalyzingScreen(false)
      // Silent failure — user can still select manually
    } finally {
      setIsAnalyzing(false)
      setShowAnalyzingScreen(false)
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
    setSliderPosition(50)
    setSelectedPreset(null)
    setSelectedCategory(null)
    setCustomInstructions('')
    setActiveHistoryId(null)
    setError(null)
    setFaceAnalysis(null)
    setAnalysisDismissed(false)
    setShowAnalysisPanel(false)
    setIsAnalyzing(false)
    setShowAnalyzingScreen(false)
    setShowLookProducts(false)
    setShowPathScreen(false)
    setAppMode('looks')
    setFocusRequest(false)
    setRevealProduct(null)
    setCaptureStep('entry')
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
    setResultDescription(null)
    setRevealProduct(null)
    setIsGenerating(true)

    try {
      const presetName = selectedPreset ?? BEAUTY_PRESETS[0].name
      const activePreset = BEAUTY_PRESETS.find(p => p.name === presetName) ?? BEAUTY_PRESETS[0]

      // Optionally layer in category-specific instruction
      const categoryNote = selectedCategory && selectedCategory !== 'Full Look'
        ? ` Focus especially on ${selectedCategory.toLowerCase()} products.`
        : ''

      const prompt = [
        'STRICT EDITING RULE: Do not zoom in, crop, reframe, or change the field of view in any way. The face must appear at the exact same size and position as in the original photo. Output dimensions and framing must be identical to the input.',
        activePreset.prompt,
        categoryNote,
      ].filter(Boolean).join('\n\n')

      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl, activeEngine)

      setGeneratedImage(outputUrl)
      setSliderPosition(50)
      generateResultDescription(presetName, outputUrl, lang).then(setResultDescription).catch(() => {})

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
    setResultDescription(null)
    setRevealProduct(null)
    setIsGenerating(true)

    try {
      const prompt = [
        'STRICT EDITING RULE: Do not zoom in, crop, reframe, or change the field of view in any way. The face must appear at the exact same size and position as in the original photo. Output dimensions and framing must be identical to the input.',
        'Beauty makeup removal edit. Edit the uploaded selfie and remove existing visible makeup from the face while preserving the person exactly.',
        'TASK: Remove visible cosmetic makeup from the face only. Remove lipstick, lip gloss, lip liner, blush, contour, bronzer, highlighter, visible foundation effect, concealer effect, eyebrow makeup, eyeliner, eyeshadow, and mascara effect if present. Return the face to a clean, natural, makeup-free appearance.',
        'IMPORTANT: Preserve the person\'s exact identity, face shape, facial proportions, skin texture, natural features, hair, clothing, background, framing, lighting, camera angle, and facial expression. Keep the original photo composition unchanged so the edited image aligns exactly with the original photo.',
        'DO NOT CHANGE: Do not beautify the face. Do not retouch or over-smooth the skin. Do not remove natural skin texture. Do not reshape the eyes, lips, nose, jaw, eyebrows, or skin. Do not change hairstyle, clothing, background, lighting, composition, or camera perspective. Do not add new makeup. Do not make the result look airbrushed, filtered, or AI-generated.',
        'DESIRED RESULT: A photorealistic clean-face result with natural bare skin, natural lips, and natural cheeks, as if the makeup has been gently removed while preserving the real person exactly.',
      ].filter(Boolean).join('\n\n')

      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl, activeEngine)

      setGeneratedImage(outputUrl)
      setSliderPosition(50)
      const removalLookName = lang === 'he' ? 'הסרת איפור' : 'Makeup Removed'
      generateResultDescription(removalLookName, outputUrl, lang).then(setResultDescription).catch(() => {})

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        lookName: removalLookName,
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

  const handleCustomTryOn = async () => {
    if (!originalImage) return

    const request = customInstructions.trim()
    if (!request) {
      setError(lang === 'he' ? 'כתבי קודם מה תרצי לנסות.' : 'Describe the makeup you want to try first.')
      return
    }

    const token = import.meta.env.VITE_REPLICATE_API_TOKEN
    if (!token || typeof token !== 'string' || token.trim() === '') {
      setError('Replicate API token not found. Add VITE_REPLICATE_API_TOKEN to your .env file.')
      return
    }

    setError(null)
    setResultDescription(null)
    setSelectedPreset(null)
    setRevealProduct(null)
    setIsGenerating(true)

    try {
      const prompt = buildCustomTryOnPrompt(request)
      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl, activeEngine)

      setGeneratedImage(outputUrl)
      setSliderPosition(50)

      const customLookName = lang === 'he' ? 'בקשה חופשית' : 'Custom Request'
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        lookName: customLookName,
        timestamp: Date.now(),
      }
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        saveHistoryToStorage(updated)
        return updated
      })
      setActiveHistoryId(entry.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Custom makeup try-on failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleProductTryOn = async (product: ProductItem) => {
    console.log('[handleProductTryOn called]', product.brand, product.shadeName)
    if (!originalImage) return
    const token = import.meta.env.VITE_REPLICATE_API_TOKEN
    if (!token) { setError('Replicate API token not found.'); return }
    setError(null)
    setResultDescription(null)
    setRevealProduct({
      id: product.id,
      brand: product.brand,
      productName: product.productName,
      shadeName: product.shadeName,
      finish: product.finish,
    })
    setSelectedPreset(`${product.brand} ${product.shadeName}`)
    setIsGenerating(true)
    try {
      let tryOnPrompt: string
      try {
        tryOnPrompt = await buildProductPromptWithClaude(product)
        console.log('[Claude prompt]', tryOnPrompt)
      } catch {
        tryOnPrompt = product.tryOnPrompt
      }
      const prompt = [
        'STRICT EDITING RULE: Do not zoom in, crop, reframe, or change the field of view in any way. The face must appear at the exact same size and position as in the original photo.',
        tryOnPrompt,
      ].join('\n\n')
      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl, activeEngine)
      setGeneratedImage(outputUrl)
      setSliderPosition(50)
      const productLookName = `${product.brand} ${product.shadeName}`
      generateResultDescription(productLookName, outputUrl, lang).then(setResultDescription).catch(() => {})
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        lookName: productLookName,
        timestamp: Date.now(),
      }
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        saveHistoryToStorage(updated)
        return updated
      })
      setActiveHistoryId(entry.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product try-on failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Load history card ────────────────────────────────────────────────────────
  const handleLoadHistory = (entry: HistoryEntry) => {
    setOriginalImage(entry.originalUrl)
    setGeneratedImage(entry.generatedUrl)
    setSelectedPreset(entry.lookName)
    setRevealProduct(null)
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

  const ProductTryOnMode = () => (
    <ProductTryOnPicker
      lang={lang}
      disabled={isGenerating}
      onTryOn={handleProductTryOn}
    />
  )

  const LookProductsScreen = () => {
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }, [])

    if (!selectedPreset) return null

    const products = LOOK_PRODUCTS[selectedPreset] ?? []
    const preset = BEAUTY_PRESETS.find(p => p.name === selectedPreset)
    const meta = LOOK_METADATA[selectedPreset]

    const adjacentLookName = meta?.adjacentLook ?? null
    const adjacentPreset = adjacentLookName ? BEAUTY_PRESETS.find(p => p.name === adjacentLookName) : null
    const saferPreset = faceAnalysis?.saferOption ? BEAUTY_PRESETS.find(p => p.name === faceAnalysis.saferOption) : null
    const bolderPreset = faceAnalysis?.bolderOption ? BEAUTY_PRESETS.find(p => p.name === faceAnalysis.bolderOption) : null

    const lipProducts = products.filter(p => p.category === 'lips')
    const blushProducts = products.filter(p => p.category === 'blush')

    return (
      <div
        className="fixed inset-0 z-[80] flex flex-col overflow-y-auto"
        style={{
          background: 'linear-gradient(160deg, #0a0408 0%, #080408 60%, #060306 100%)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      >
        <div className="w-full max-w-3xl mx-auto px-5 pb-16 pt-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <button
              type="button"
              onClick={() => setShowLookProducts(false)}
              className="flex items-center gap-1.5 text-xs focus:outline-none transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,107,71,0.7)' }}
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              {lang === 'he' ? 'חזרה לתוצאה' : 'Back to result'}
            </button>
          </div>

          {/* Look title */}
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {lang === 'he' ? 'המוצרים שהרכיבו את הלוק שלך' : 'Products that made your look'}
            </p>
            <p className="text-2xl font-extrabold text-white leading-tight" style={{ letterSpacing: '-0.02em' }}>
              {lang === 'he' ? preset?.nameHe : preset?.name}
            </p>
            {meta?.salesLine && (
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {meta.salesLine}
              </p>
            )}
          </div>

          {/* Result preview */}
          {generatedImage && (
            <div
              className="relative mb-7 overflow-hidden rounded-2xl"
              style={{ border: '1px solid rgba(255,255,255,0.07)', maxHeight: 260 }}
            >
              <img
                src={generatedImage}
                alt="Your look"
                className="w-full object-contain"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />
              <div className="absolute bottom-3 left-4">
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  {lang === 'he' ? 'הלוק שלך' : 'Your look'}
                </span>
              </div>
            </div>
          )}

          {/* Lips products */}
          {lipProducts.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'rgba(255,107,71,0.5)' }}>
                💋 {lang === 'he' ? 'שפתיים' : 'Lips'}
              </p>
              <div className="flex flex-col gap-2">
                {lipProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-2xl p-4"
                    style={{ background: 'rgba(255,107,71,0.05)', border: '1px solid rgba(255,107,71,0.12)' }}
                  >
                    <div
                      className="h-11 w-11 shrink-0 rounded-full"
                      style={{
                        background: 'rgba(255,107,71,0.15)',
                        border: '1px solid rgba(255,107,71,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      💋
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{product.brand}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {product.productName}
                      </p>
                      <p
                        className="text-[10px] mt-0.5 font-semibold"
                        style={{ color: 'rgba(255,107,71,0.7)' }}
                      >
                        {product.shadeName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blush products */}
          {blushProducts.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'rgba(236,72,153,0.5)' }}>
                🌸 {lang === 'he' ? 'סומק' : 'Blush'}
              </p>
              <div className="flex flex-col gap-2">
                {blushProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-2xl p-4"
                    style={{ background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.12)' }}
                  >
                    <div
                      className="h-11 w-11 shrink-0 rounded-full"
                      style={{
                        background: 'rgba(236,72,153,0.1)',
                        border: '1px solid rgba(236,72,153,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      🌸
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{product.brand}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {product.productName}
                      </p>
                      <p
                        className="text-[10px] mt-0.5 font-semibold"
                        style={{ color: 'rgba(236,72,153,0.7)' }}
                      >
                        {product.shadeName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to create this look */}
          <LookUsageTips lookName={selectedPreset} />

          {/* Divider */}
          <div className="mb-7 h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

          {/* Also try section */}
          <div>
            <p className="text-base font-extrabold text-white mb-1" style={{ letterSpacing: '-0.01em' }}>
              {lang === 'he' ? 'רוצה לנסות גם —' : 'You might also love —'}
            </p>
            <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {lang === 'he'
                ? 'לוקים נוספים שיכולים לשבת עלייך יפה'
                : 'More looks that could suit you beautifully'}
            </p>

            <div className="flex flex-col gap-3">
              {[adjacentPreset, saferPreset, bolderPreset].filter(Boolean).filter((p, i, arr) =>
                p && p.name !== selectedPreset && arr.findIndex(x => x?.name === p?.name) === i
              ).slice(0, 3).map((p) => {
                if (!p) return null
                const pMeta = LOOK_METADATA[p.name]
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(p.name)
                      setGeneratedImage(null)
                      setShowLookProducts(false)
                      document.getElementById('looks-carousel')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:opacity-80 active:scale-[0.99] focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div
                      className="h-14 w-12 shrink-0 overflow-hidden rounded-xl flex items-center justify-center"
                      style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(160deg, rgba(255,107,71,0.12) 0%, rgba(20,10,20,0.9) 100%)' }}
                      aria-hidden
                    >
                      <span className="text-[10px] font-bold text-white/80 text-center leading-tight px-1 line-clamp-3">{lang === 'he' ? p.nameHe : p.name}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-white" style={{ letterSpacing: '-0.01em' }}>
                        {lang === 'he' ? p.nameHe : p.name}
                      </p>
                      {pMeta?.salesLine && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {pMeta.salesLine}
                        </p>
                      )}
                    </div>
                    <div
                      className="shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold"
                      style={{ background: 'rgba(255,107,71,0.1)', border: '1px solid rgba(255,107,71,0.18)', color: 'rgba(255,107,71,0.8)' }}
                    >
                      {lang === 'he' ? 'נסי' : 'Try'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    )
  }

  const AnalyzingScreen = () => {
    const [dots, setDots] = React.useState(1)
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }, [])

    React.useEffect(() => {
      const t = setInterval(() => setDots(d => d === 3 ? 1 : d + 1), 600)
      return () => clearInterval(t)
    }, [])

    return (
      <div
        className="fixed inset-0 z-[90] flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(160deg, #0a0408 0%, #0d0610 50%, #080410 100%)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute"
          style={{ top: '25%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,107,71,0.06)', filter: 'blur(100px)' }}
        />

        {/* Selfie preview */}
        {originalImage && (
          <div
            className="relative mb-8 overflow-hidden rounded-full"
            style={{
              width: 120,
              height: 120,
              border: '2px solid rgba(255,107,71,0.3)',
              boxShadow: '0 0 40px rgba(255,107,71,0.2)',
            }}
          >
            <img
              src={originalImage}
              alt="Your photo"
              className="h-full w-full object-cover object-center"
            />
            {/* Scanning overlay animation */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,107,71,0.15) 50%, transparent 100%)',
                animation: 'scan 2s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Pulsing ring around photo */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: '1px solid rgba(255,107,71,0.2)',
            animation: 'analyzingPing 1.5s ease-out infinite',
            top: '50%',
            left: '50%',
            transform: originalImage ? 'translate(-50%, calc(-50% - 68px))' : 'translate(-50%, -50%)',
          }}
        />

        {/* Text */}
        <div className="relative z-10 text-center px-8">
          <p
            className="text-2xl font-extrabold text-white mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            {lang === 'he' ? 'מנתחת את התמונה שלך' : 'Analyzing your photo'}
            <span style={{ color: 'rgba(255,107,71,0.8)' }}>{'·'.repeat(dots)}</span>
          </p>
          <p
            className="text-sm mb-10"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {lang === 'he'
              ? 'מזהה גוון עור, אנדרטון, ומוצאת לוקים מחמיאים'
              : 'Detecting skin tone, undertone, and finding flattering looks'}
          </p>

          {/* Steps indicator */}
          <div className="flex flex-col gap-2 text-right mb-10" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
            {[
              { textHe: 'מזהה גוון עור', textEn: 'Detecting skin tone', done: !isAnalyzing || true },
              { textHe: 'מנתחת אנדרטון', textEn: 'Analyzing undertone', done: !isAnalyzing || dots >= 2 },
              { textHe: 'מוצאת לוקים מחמיאים', textEn: 'Finding flattering looks', done: !isAnalyzing },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2" style={{ justifyContent: lang === 'he' ? 'flex-end' : 'flex-start' }}>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {lang === 'he' ? step.textHe : step.textEn}
                </span>
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: i < dots ? '#FF6B47' : 'rgba(255,255,255,0.15)',
                    boxShadow: i < dots ? '0 0 6px rgba(255,107,71,0.6)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Result button — shows when analysis is done */}
          {!isAnalyzing && faceAnalysis && (
            <button
              type="button"
              onClick={() => {
                setShowAnalyzingScreen(false)
                setShowAnalysisPanel(true)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] focus:outline-none"
              style={{
                background: 'linear-gradient(135deg, #FF6B47 0%, #FF9D6E 100%)',
                boxShadow: '0 0 30px rgba(255,107,71,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
                animation: 'fadeInUp 0.4s ease forwards',
              }}
            >
              <Sparkles className="h-4 w-4" />
              {lang === 'he' ? 'ראי את הניתוח שלך ✨' : 'See your analysis ✨'}
            </button>
          )}

          {/* Loading bar */}
          {isAnalyzing && (
            <div className="h-0.5 w-48 mx-auto overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: '70%',
                  background: 'linear-gradient(90deg, #FF6B47, #FF9D6E)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
          )}
        </div>

        <style>{`
          @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes analyzingPing {
            0% { opacity: 0.5; }
            100% { opacity: 0; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  const PathScreen = () => {
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
      const timer = setTimeout(() => setVisible(true), 50)
      return () => clearTimeout(timer)
    }, [])

    const paths = [
      {
        id: 'remove',
        emoji: '🧴',
        titleHe: 'התחילי עם פנים נקיות',
        titleEn: 'Start fresh',
        descHe: 'מסירים את האיפור הקיים ומתחילים מבסיס נקי',
        descEn: 'Remove existing makeup and start with a clean base',
        accentColor: 'rgba(100,160,200,0.08)',
        borderColor: 'rgba(100,160,200,0.15)',
        glowColor: 'rgba(100,160,200,0.05)',
        action: () => {
          setShowPathScreen(false)
          handleRefineOnly()
        },
      },
      {
        id: 'ai',
        emoji: '✨',
        titleHe: 'תמצאי לי לוק שמתאים לי',
        titleEn: 'Find a look for me',
        descHe: 'ניתוח קצר — ואנחנו מציעות לך מה שהכי יחמיא לך',
        descEn: 'Quick analysis — we suggest what flatters you most',
        accentColor: 'rgba(255,107,71,0.12)',
        borderColor: 'rgba(255,107,71,0.2)',
        glowColor: 'rgba(255,107,71,0.08)',
        action: () => {
          setShowPathScreen(false)
          handleAnalyzeWithAI()
        },
      },
      {
        id: 'looks',
        emoji: '💄',
        titleHe: 'אני רוצה לבחור בעצמי',
        titleEn: 'I want to choose myself',
        descHe: 'דפדפי בין לוקים לפי מצב רוח, סגנון, או הזדמנות',
        descEn: 'Browse looks by mood, style, or occasion',
        accentColor: 'rgba(180,100,200,0.08)',
        borderColor: 'rgba(180,100,200,0.15)',
        glowColor: 'rgba(180,100,200,0.05)',
        action: () => {
          setShowPathScreen(false)
          setAppMode('looks')
        },
      },
      {
        id: 'product',
        emoji: '🌸',
        titleHe: 'יש לי מוצר ספציפי שאני רוצה לנסות',
        titleEn: 'I want to try a specific product',
        descHe: 'בחרי מותג, מוצר וגוון — וראי אותו עלייך',
        descEn: 'Choose a brand, product and shade — and see it on you',
        accentColor: 'rgba(100,180,160,0.08)',
        borderColor: 'rgba(100,180,160,0.15)',
        glowColor: 'rgba(100,180,160,0.05)',
        action: () => {
          setShowPathScreen(false)
          setAppMode('product')
        },
      },
    ]

    return (
      <div
        className="fixed inset-0 z-40 flex items-end justify-center"
        style={{
          background: 'rgba(4,2,6,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      >
        <div
          className="w-full max-w-3xl overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #0e0810 0%, #080508 70%, #060306 100%)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '28px 28px 0 0',
            maxHeight: '88vh',
            boxShadow: '0 -30px 80px rgba(0,0,0,0.7)',
            transform: visible ? 'translateY(0)' : 'translateY(32px)',
            transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.35s ease',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3.5 pb-1">
            <div className="h-[3px] w-8 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>

          <div className="px-5 pb-12 pt-4">

            {/* Selfie thumbnail */}
            {originalImage && (
              <div className="mb-6 flex justify-center">
                <div
                  className="relative h-20 w-20 overflow-hidden rounded-full"
                  style={{
                    border: '2px solid rgba(255,107,71,0.3)',
                    boxShadow: '0 0 24px rgba(255,107,71,0.2)',
                  }}
                >
                  <img
                    src={originalImage}
                    alt="Your photo"
                    className="h-full w-full object-cover object-center"
                  />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%)' }}
                  />
                </div>
              </div>
            )}

            {/* Header */}
            <div className="mb-7 text-center">
              <p
                className="text-xl font-extrabold text-white"
                style={{ letterSpacing: '-0.02em' }}
              >
                {lang === 'he' ? 'מה בא לך לעשות?' : 'What would you like to do?'}
              </p>
              <p
                className="mt-1.5 text-xs"
                style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}
              >
                {lang === 'he' ? 'בחרי את הכיוון שמתאים לך עכשיו' : 'Choose the direction that suits you now'}
              </p>
            </div>

            {/* Beauty intent search */}
            <div className="mb-6">
              <BeautyIntentSearchBar
                onSelectLook={handleIntentSelectLook}
                metadata={LOOK_METADATA}
                navigation={LOOK_NAVIGATION}
              />
            </div>

            {/* Path cards */}
            <div className="flex flex-col gap-3 mb-6">
              {paths.map((path, i) => (
                <button
                  key={path.id}
                  type="button"
                  onClick={path.action}
                  className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
                  style={{
                    background: path.accentColor,
                    border: `1px solid ${path.borderColor}`,
                    boxShadow: `0 4px 24px ${path.glowColor}`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(12px)',
                    transition: `opacity 0.4s ease ${0.1 + i * 0.08}s, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1) ${0.1 + i * 0.08}s, background 0.2s ease, box-shadow 0.2s ease`,
                  }}
                >
                  {/* Emoji icon */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {path.emoji}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-extrabold text-white leading-tight"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {lang === 'he' ? path.titleHe : path.titleEn}
                    </p>
                    <p
                      className="mt-0.5 text-[11px] leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.38)' }}
                    >
                      {lang === 'he' ? path.descHe : path.descEn}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  />
                </button>
              ))}
            </div>

            {/* Skip link */}
            <button
              type="button"
              onClick={() => setShowPathScreen(false)}
              className="flex w-full items-center justify-center py-2 text-xs transition-all hover:opacity-60 focus:outline-none"
              style={{ color: 'rgba(255,255,255,0.18)' }}
            >
              {lang === 'he' ? 'סגרי וגלשי בעצמי' : 'Close and explore myself'}
            </button>

          </div>
        </div>
      </div>
    )
  }

  const AnalysisPanel = () => (
    <RecommendationScreen
      open={Boolean(faceAnalysis && showAnalysisPanel && !generatedImage)}
      lang={lang}
      analysis={faceAnalysis}
      looks={vestiLookCards()}
      navigation={LOOK_NAVIGATION}
      onClose={() => setShowAnalysisPanel(false)}
      onSelectLook={(lookName) => {
        setSelectedPreset(lookName)
        setShowAnalysisPanel(false)
        setAnalysisDismissed(true)
      }}
    />
  )

  const AdminPanel = () => {
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }, [])

    return (
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) setShowAdminPanel(false) }}
        style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          className="w-full max-w-3xl overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #0e0810 0%, #080508 100%)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px 24px 0 0',
            maxHeight: '80vh',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.7)',
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-[3px] w-8 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>

          <div className="px-5 pb-10 pt-3">

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-lg font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
                  ניהול מנוע
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  החלפת מנוע עריכת התמונה
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminPanel(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>

            {/* Current engine indicator */}
            <div
              className="mb-5 rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(255,107,71,0.08)', border: '1px solid rgba(255,107,71,0.15)' }}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: '#FF6B47', boxShadow: '0 0 6px rgba(255,107,71,0.8)' }} />
              <div>
                <p className="text-xs font-bold text-white">מנוע פעיל: {activeEngine.name}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{activeEngine.model}</p>
              </div>
            </div>

            {/* Engine buttons */}
            <div className="flex flex-col gap-3">
              {ENGINES.map(engine => {
                const isActive = activeEngine.id === engine.id
                return (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => {
                      setActiveEngine(engine)
                      setGeneratedImage(null)
                    }}
                    className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:opacity-80 active:scale-[0.99] focus:outline-none"
                    style={{
                      background: isActive ? 'rgba(255,107,71,0.1)' : 'rgba(255,255,255,0.03)',
                      border: isActive ? '1.5px solid rgba(255,107,71,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Status dot */}
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        background: isActive ? '#FF6B47' : 'rgba(255,255,255,0.15)',
                        boxShadow: isActive ? '0 0 8px rgba(255,107,71,0.6)' : 'none',
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-extrabold text-white">{engine.name}</p>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                          style={{
                            background: isActive ? 'rgba(255,107,71,0.2)' : 'rgba(255,255,255,0.07)',
                            color: isActive ? 'rgba(255,107,71,0.9)' : 'rgba(255,255,255,0.35)',
                          }}
                        >
                          {engine.badge}
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {engine.description}
                      </p>
                      <p className="text-[9px] mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {engine.model}
                      </p>
                    </div>

                    {isActive && (
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'rgba(255,107,71,0.8)' }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Warning */}
            <div
              className="mt-5 rounded-xl p-3"
              style={{ background: 'rgba(255,200,50,0.05)', border: '1px solid rgba(255,200,50,0.12)' }}
            >
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,200,50,0.6)' }}>
                ⚠️ החלפת מנוע תנקה את התמונה הנוכחית. כל מנוע עשוי להחזיר פריימינג שונה — תוצאות יכולות להשתנות.
              </p>
            </div>

          </div>
        </div>
      </div>
    )
  }

  const handleIntentSelectLook = (lookName: string) => {
    setSelectedPreset(lookName)
    setShowPathScreen(false)
    document.getElementById('looks-carousel')?.scrollIntoView({ behavior: 'smooth' })
  }

  const vestiSelectionActive = isUploaded && !generatedImage
  const vestiRevealActive = Boolean(generatedImage)
  const vestiEntryActive = captureStep !== null
  const hideLegacyChrome = showAnalysisPanel || vestiSelectionActive || vestiEntryActive || vestiRevealActive
  const revealLook = BEAUTY_PRESETS.find((preset) => preset.name === selectedPreset)
  const revealProducts: RevealProduct[] = React.useMemo(() => {
    if (revealProduct) return [revealProduct]
    if (!revealLook) return []
    return getLookProductViews(revealLook.name).map((product) => ({
      id: product.id,
      brand: product.brand,
      productName: product.productName,
      shadeName: product.shadeName,
      finish: product.finish,
    }))
  }, [revealProduct, revealLook])
  const revealTitle = revealProduct
    ? revealProduct.productName
    : lang === 'he'
      ? (revealLook?.nameHe ?? selectedPreset ?? '')
      : (selectedPreset ?? '')
  const revealFromRecommendation = Boolean(
    faceAnalysis && revealLook && faceAnalysis.recommendedPreset === revealLook.name,
  )
  const hideSelectionAfterResult = vestiRevealActive || (vestiPreview === 'result-error' && Boolean(error))

  React.useEffect(() => {
    document.body.classList.toggle('vesti-core-active', hideLegacyChrome)
    return () => document.body.classList.remove('vesti-core-active')
  }, [hideLegacyChrome])

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'} className={`relative min-h-screen text-gray-100 ${hideLegacyChrome ? 'font-vesti' : 'font-sans'}`}>
      {captureStep === 'entry' && (
        <EntryScreen
          lang={lang}
          onToggleLang={() => setLang((value) => (value === 'he' ? 'en' : 'he'))}
          onCapture={() => {
            cameraBackStepRef.current = 'entry'
            setCaptureStep('camera')
          }}
          onUpload={() => fileInputRef.current?.click()}
        />
      )}
      {captureStep === 'choice' && (
        <CaptureChoice
          lang={lang}
          onToggleLang={() => setLang((value) => (value === 'he' ? 'en' : 'he'))}
          onCapture={() => {
            cameraBackStepRef.current = 'choice'
            setCaptureStep('camera')
          }}
          onUpload={() => fileInputRef.current?.click()}
          onBack={() => setCaptureStep(originalImage && !isUploaded ? 'confirm' : 'entry')}
        />
      )}
      {captureStep === 'camera' && (
        <CameraCapture
          lang={lang}
          simulate={import.meta.env.DEV && vestiPreview === 'camera'}
          previewImage={VESTI_PREVIEW_IMAGE}
          onToggleLang={() => setLang((value) => (value === 'he' ? 'en' : 'he'))}
          onClose={() => setCaptureStep(cameraBackStepRef.current)}
          onCaptureFile={handleFileSelect}
          onPermissionDenied={() => setCaptureStep('camera-permission')}
          onUnavailable={() => setCaptureStep('camera-unavailable')}
          onNativeFallback={() => {
            if (import.meta.env.DEV && vestiPreview === 'camera') {
              setOriginalImage(VESTI_PREVIEW_IMAGE)
              setCaptureStep('confirm')
              return
            }
            cameraInputRef.current?.click()
          }}
        />
      )}
      {captureStep === 'confirm' && originalImage && (
        <PhotoConfirm
          lang={lang}
          imageSrc={originalImage}
          onToggleLang={() => setLang((value) => (value === 'he' ? 'en' : 'he'))}
          onContinue={handleConfirmPhoto}
          onReplace={handleReplacePhoto}
        />
      )}
      {captureStep === 'direction' && (
        <DirectionScreen
          lang={lang}
          onToggleLang={() => setLang((value) => (value === 'he' ? 'en' : 'he'))}
          onRecommendation={() => {
            enterSelection('looks')
            void handleAnalyzeWithAI()
          }}
          onLooks={() => enterSelection('looks')}
          onProduct={() => enterSelection('product')}
          onRequest={() => enterSelection('looks', true)}
          onBack={() => setCaptureStep('confirm')}
        />
      )}
      {(captureStep === 'preparing' || captureStep === 'camera-permission' || captureStep === 'camera-unavailable' || captureStep === 'upload-error') && (
        <CaptureIssue
          lang={lang}
          step={captureStep}
          onToggleLang={() => setLang((value) => (value === 'he' ? 'en' : 'he'))}
          onRetry={() => setCaptureStep(captureStep === 'upload-error' ? 'choice' : 'camera')}
          onUpload={() => fileInputRef.current?.click()}
          onBack={() => setCaptureStep('entry')}
        />
      )}
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
        tabIndex={-1}
        aria-hidden="true"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
          e.target.value = ''
        }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      {showAnalyzingScreen && <AnalyzingScreen />}
      {showLookProducts && <LookProductsScreen />}
      {showAdminPanel && <AdminPanel />}
      {showPathScreen && <PathScreen />}

      {/* ── Cinematic dynamic background (no /looks/ images to avoid 404) ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          key={selectedPreset ?? 'default'}
          className="absolute bg-cover bg-center"
          style={{
            inset: '-8%',
            background: vestiSelectionActive || vestiEntryActive || vestiRevealActive
              ? 'linear-gradient(180deg, #050505 0%, #0B0B0D 100%)'
              : 'linear-gradient(160deg, rgba(20,8,18,0.98) 0%, rgba(40,15,35,0.95) 50%, rgba(15,5,18,0.99) 100%)',
          }}
        />
      </div>
      {!vestiEntryActive && !vestiRevealActive && <div className="pointer-events-none fixed inset-0 z-0 bg-black/40" aria-hidden="true" />}

      {/* ── Header ── */}
      {!vestiEntryActive && (hideLegacyChrome ? (
        <header className="relative z-20 bg-onyx">
          <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-4 px-4 py-5 sm:px-8">
            <p className="text-[11px] font-medium tracking-[0.32em] text-ivory uppercase">Vesti Beauty</p>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setLang(l => (l === 'he' ? 'en' : 'he'))}
                className="vesti-focus min-h-11 text-[11px] tracking-wide text-silver hover:text-ivory"
              >
                {lang === 'he' ? 'EN' : 'עב'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="vesti-focus min-h-11 text-[11px] tracking-wide text-silver hover:text-ivory"
              >
                {lang === 'he' ? 'התחלי מחדש' : 'Start over'}
              </button>
            </div>
          </div>
        </header>
      ) : (
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
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 focus:outline-none mt-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
              >
                <Trash2 className="h-3 w-3" />
                {lang === 'he' ? 'התחל מחדש' : 'Start over'}
              </button>
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
      ))}

      {!vestiEntryActive && (
      <main className={`relative z-10 mx-auto max-w-3xl overflow-x-hidden px-4 sm:px-8 md:px-12 ${hideLegacyChrome ? 'pb-10 pt-4' : 'pb-36 pt-6 md:pt-10'}`}>

        {/* ── Glass Content Panel ── */}
        <div className={hideLegacyChrome ? '' : 'rounded-3xl border border-white/10 bg-black/5 shadow-2xl backdrop-blur-3xl'}>
          <div className={hideLegacyChrome ? 'px-0 py-2' : 'p-5 sm:p-6'}>

            {/* ── Upload Dropzone (legacy shell only) ── */}
            {!isUploaded && !vestiEntryActive && (
              <section className="mt-8">
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
              <div className={hideLegacyChrome ? '' : 'mt-8'}>

                {(vestiRevealActive || (vestiPreview === 'result-error' && error)) && (
                  <ResultReveal
                    lang={lang}
                    originalImage={originalImage}
                    generatedImage={generatedImage}
                    title={revealTitle || (lang === 'he' ? 'התוצאה' : 'Result')}
                    lookPurchaseKey={revealLook?.name ?? null}
                    fromRecommendation={revealFromRecommendation}
                    products={revealProducts}
                    sliderPosition={sliderPosition}
                    generating={isGenerating}
                    error={error}
                    previewPurchaseUrl={import.meta.env.DEV && vestiPreview === 'result-buy' ? 'https://example.com/' : null}
                    onSliderChange={setSliderPosition}
                    onDownload={handleDownload}
                    onStartOver={handleClear}
                    onTryLook={() => {
                      setGeneratedImage(null)
                      setRevealProduct(null)
                      setError(null)
                      setFocusRequest(false)
                      setAppMode('looks')
                    }}
                    onTryShade={() => {
                      setGeneratedImage(null)
                      setRevealProduct(null)
                      setError(null)
                      setFocusRequest(false)
                      setAppMode('product')
                    }}
                    onRetry={() => {
                      setError(null)
                      if (import.meta.env.DEV && vestiPreview === 'result-error') return
                      if (revealProduct) return
                      if (selectedPreset && revealLook) void handleApplyEdit()
                    }}
                  />
                )}

                {vestiSelectionActive && error && !generatedImage && vestiPreview !== 'result-error' && (
                  <div className="mb-6">
                    <p className="text-sm text-silver">{error}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null)
                        if (selectedPreset && revealLook) void handleApplyEdit()
                      }}
                      className="vesti-focus mt-3 min-h-11 text-sm text-ivory"
                    >
                      {lang === 'he' ? 'נסי שוב' : 'Try again'}
                    </button>
                  </div>
                )}

                {vestiSelectionActive && !isGenerating && vestiPreview !== 'request' && vestiPreview !== 'result-error' && (
                <div className="mb-6 flex items-center gap-3">
                  {originalImage && (
                    <img src={originalImage} alt="" className="h-8 w-8 object-cover opacity-80" />
                  )}
                  <p className="text-[11px] text-silver">
                    {lang === 'he' ? 'התמונה שלך מוכנה לבחירה' : 'Your photo is ready'}
                  </p>
                </div>
                )}
                {!hideLegacyChrome && (!vestiSelectionActive || isGenerating) && (
                <>
                {/* ── Image Viewer ── */}
                <div className="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-3xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="relative w-full overflow-hidden aspect-[3/4] max-h-[72vh]">

                    {/* Generating Overlay */}
                    {isGenerating && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
                        <div className="w-full max-w-xs px-6 text-center">

                          {/* Spinner */}
                          <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
                            <div className="absolute inset-0 animate-ping rounded-full" style={{ background: 'rgba(255,107,71,0.15)' }} />
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(255,107,71,0.12)' }}>
                              <Loader2 className="h-5 w-5 animate-spin text-coral" />
                            </div>
                          </div>

                          <p className="text-sm font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
                            {lang === 'he'
                              ? 'מיישמים את הלוק על התמונה שלך...'
                              : 'Applying the look to your photo...'}
                          </p>

                          {/* Look name */}
                          {selectedPreset && (
                            <p className="text-base font-extrabold text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                              {lang === 'he'
                                ? (BEAUTY_PRESETS.find(p => p.name === selectedPreset)?.nameHe ?? selectedPreset)
                                : selectedPreset}
                            </p>
                          )}

                          {/* Sales line */}
                          {selectedPreset && LOOK_METADATA[selectedPreset]?.salesLine && (
                            <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {LOOK_METADATA[selectedPreset].salesLine}
                            </p>
                          )}

                          {/* Products list */}
                          {selectedPreset && LOOK_PRODUCTS[selectedPreset] && (
                            <div
                              className="rounded-xl p-3 text-left mb-4"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                {lang === 'he' ? 'הלוק מורכב מ' : 'This look uses'}
                              </p>
                              <div className="space-y-1.5">
                                {LOOK_PRODUCTS[selectedPreset].map((p, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <div
                                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                                      style={{ background: p.category === 'lips' ? 'rgba(255,107,71,0.7)' : 'rgba(236,72,153,0.7)' }}
                                    />
                                    <span className="text-[10px] text-white font-medium">{p.brand}</span>
                                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.productName} · {p.shadeName}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Progress bar */}
                          <div className="h-0.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-full animate-pulse rounded-full" style={{ width: '65%', background: 'linear-gradient(90deg, #FF6B47, #FF9D6E)' }} />
                          </div>
                          <p className="mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {lang === 'he' ? 'בדרך כלל 30–60 שניות' : 'typically 30–60 sec'}
                          </p>

                        </div>
                      </div>
                    )}

                    {generatedImage && originalImage && !isGenerating ? (
                      <>
                        <img src={originalImage} alt="Before" className="absolute inset-0 h-full w-full object-contain" />
                        <img
                          src={generatedImage}
                          alt="After"
                          className="absolute inset-0 h-full w-full object-contain"
                          style={{
                            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                            opacity: makeupOpacity / 100,
                          }}
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
                        <span className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                          {lang === 'he' ? 'לפני' : 'Before'}
                        </span>
                        <span className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                          {lang === 'he' ? 'אחרי' : 'After'}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={sliderPosition}
                          onChange={(e) => setSliderPosition(Number(e.target.value))}
                          className="absolute inset-0 z-20 h-full w-full cursor-col-resize opacity-0"
                          style={{ direction: 'ltr' }}
                          aria-label="Compare before and after"
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
                      </>
                    ) : generatedImage && !originalImage && !isGenerating ? (
                      <img src={generatedImage} alt="Generated look" className="absolute inset-0 h-full w-full object-contain" />
                    ) : (
                      <img
                        src={originalImage!}
                        alt="Original selfie"
                        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${isGenerating ? 'opacity-30' : 'opacity-100'}`}
                      />
                    )}
                  </div>

                  <p className="border-t border-white/5 px-4 py-2.5 text-center text-xs font-medium uppercase tracking-widest text-gray-500">
                    {isGenerating
                      ? t.generating
                      : generatedImage
                      ? (lang === 'he' ? 'לפני ← גרור → אחרי' : 'Before ← Drag → After')
                      : t.originalPhoto}
                  </p>
                </div>
                </>
                )}

                {resultDescription && !vestiRevealActive && (
                  <p className="mt-3 text-center text-sm text-white/70 italic px-4">
                    {resultDescription}
                  </p>
                )}

                {/* ── Disclaimer ── */}
                {!vestiSelectionActive && !vestiRevealActive && (
                <p className="mt-3 text-center text-[11px] text-gray-600">
                  ✦ {t.disclaimer}
                </p>
                )}

                {generatedImage && !isGenerating && !vestiRevealActive && (() => {
                  const chatEntry = history.find(h => h.id === activeHistoryId)
                  if (!chatEntry) return null
                  const chatProducts = (LOOK_PRODUCTS[chatEntry.lookName] ?? []).map(p => {
                    const catalogMatch = PRODUCT_CATALOG.find(
                      c => c.brand === p.brand && c.productName.replace(/·/g, '').toLowerCase() === p.productName.replace(/·/g, '').toLowerCase() && c.shadeName === p.shadeName
                    )
                    return {
                      ...p,
                      shadeFamily: catalogMatch?.shadeFamily ?? '',
                      finish: catalogMatch?.finish ?? '',
                    }
                  })
                  return (
                    <BeautyAdvisorChat
                      lookName={chatEntry.lookName}
                      lang={lang}
                      products={chatProducts}
                    />
                  )
                })()}

                {generatedImage && !isGenerating && !vestiRevealActive && (() => {
                  const activeEntry = history.find(h => h.id === activeHistoryId)
                  const isRemoval = activeEntry?.lookName === 'הסרת איפור' || activeEntry?.lookName === 'Makeup Removed'
                  if (!isRemoval) return null
                  return (
                    <div
                      className="relative mt-4 mb-2 overflow-hidden rounded-2xl p-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,107,71,0.1) 0%, rgba(80,20,60,0.12) 100%)',
                        border: '1px solid rgba(255,107,71,0.2)',
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,71,0.4), transparent)' }} />
                      <p className="text-sm font-extrabold text-white mb-1" style={{ letterSpacing: '-0.01em' }}>
                        {lang === 'he' ? 'הפנים שלך נקיות ומוכנות ✨' : 'Your face is clean and ready ✨'}
                      </p>
                      <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {lang === 'he'
                          ? 'עכשיו אפשר לנסות לוק חדש על בסיס נקי — מה בא לך לעשות?'
                          : 'Now try a new look on your clean base — what would you like to do?'}
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAnalyzingScreen(true)
                            handleAnalyzeWithAI()
                          }}
                          className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:opacity-80 active:scale-[0.98] focus:outline-none"
                          style={{ background: 'rgba(255,107,71,0.1)', border: '1px solid rgba(255,107,71,0.2)' }}
                        >
                          <span className="text-lg">✨</span>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {lang === 'he' ? 'תמצאי לי לוק שמתאים לי' : 'Find a look for me'}
                            </p>
                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              {lang === 'he' ? 'ניתוח קצר עם המלצה אישית' : 'Quick analysis with a personal recommendation'}
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAppMode('looks')
                            document.getElementById('looks-carousel')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:opacity-80 active:scale-[0.98] focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <span className="text-lg">💄</span>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {lang === 'he' ? 'אני רוצה לבחור לוק בעצמי' : 'I want to choose a look myself'}
                            </p>
                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              {lang === 'he' ? 'דפדפי בין לוקים ובחרי מה שאת אוהבת' : 'Browse looks and choose what you love'}
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppMode('product')}
                          className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:opacity-80 active:scale-[0.98] focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <span className="text-lg">🌸</span>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {lang === 'he' ? 'אני רוצה לנסות מוצר ספציפי' : 'I want to try a specific product'}
                            </p>
                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              {lang === 'he' ? 'בחרי מותג, מוצר וגוון' : 'Choose brand, product and shade'}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )
                })()}
                {generatedImage && !isGenerating && !vestiRevealActive && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {/* Button 1 - Try another look */}
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedImage(null)
                        setSelectedPreset(null)
                        document.getElementById('looks-carousel')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="flex flex-col items-center gap-1.5 rounded-2xl py-3.5 px-2 transition-all hover:opacity-80 active:scale-[0.98] focus:outline-none"
                      style={{ background: 'rgba(255,107,71,0.08)', border: '1px solid rgba(255,107,71,0.18)' }}
                    >
                      <ArrowLeftRight className="h-4 w-4" style={{ color: 'rgba(255,107,71,0.8)' }} />
                      <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: 'rgba(255,107,71,0.7)' }}>
                        {lang === 'he' ? 'לוק אחר' : 'Try another'}
                      </span>
                    </button>

                    {/* Button 2 - Download */}
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex flex-col items-center gap-1.5 rounded-2xl py-3.5 px-2 transition-all hover:opacity-80 active:scale-[0.98] focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Download className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                      <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {lang === 'he' ? 'הורדי תמונה' : 'Download'}
                      </span>
                    </button>

                    {/* Button 3 - Shop look */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedPreset && LOOK_PRODUCTS[selectedPreset]) {
                          setShowLookProducts(true)
                        }
                      }}
                      className="flex flex-col items-center gap-1.5 rounded-2xl py-3.5 px-2 transition-all hover:opacity-80 active:scale-[0.98] focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Sparkles className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                      <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {lang === 'he' ? 'מוצרי הלוק' : 'Shop look'}
                      </span>
                    </button>
                  </div>
                )}

                {/* ── Mode: Looks | Product ── */}
                {vestiPreview !== 'request' && !hideSelectionAfterResult && (
                <nav className="mt-2 flex gap-8" aria-label={lang === 'he' ? 'מצב בחירה' : 'Selection mode'}>
                  <button
                    type="button"
                    onClick={() => {
                      setFocusRequest(false)
                      setAppMode('looks')
                    }}
                    className={`vesti-focus min-h-11 border-b text-[13px] tracking-wide transition-colors ${
                      appMode === 'looks' && !focusRequest
                        ? 'border-lacquer text-ivory'
                        : 'border-transparent text-silver hover:text-ivory'
                    }`}
                  >
                    {lang === 'he' ? 'לוקים' : 'Looks'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFocusRequest(false)
                      setAppMode('product')
                      window.scrollTo(0, 0)
                    }}
                    className={`vesti-focus min-h-11 border-b text-[13px] tracking-wide transition-colors ${
                      appMode === 'product'
                        ? 'border-lacquer text-ivory'
                        : 'border-transparent text-silver hover:text-ivory'
                    }`}
                  >
                    {lang === 'he' ? 'מוצר' : 'Product'}
                  </button>
                </nav>
                )}

                {appMode === 'looks' && !hideSelectionAfterResult && vestiPreview !== 'request' && vestiPreview !== 'recommendation' && !focusRequest && (
                <>
                {faceAnalysis && !showAnalysisPanel && (
                  <button
                    type="button"
                    onClick={() => setShowAnalysisPanel(true)}
                    className="vesti-focus mt-4 min-h-11 text-sm text-silver hover:text-ivory"
                  >
                    {lang === 'he' ? 'כיוון להתחיל ממנו' : 'A direction to begin with'}
                  </button>
                )}

                <LookGallery
                  lang={lang}
                  looks={vestiLookCards()}
                  selectedLookName={selectedPreset}
                  recommendedLookName={faceAnalysis && !analysisDismissed ? faceAnalysis.recommendedPreset : null}
                  applying={isGenerating}
                  onSelect={setSelectedPreset}
                  onApply={handleApplyEdit}
                />

                </>
                )}
                {appMode === 'product' && !hideSelectionAfterResult && <ProductTryOnMode />}

                {appMode === 'looks' && !hideSelectionAfterResult && vestiPreview !== 'looks' && vestiPreview !== 'recommendation' && (
                  <CustomRequestTryOn
                    lang={lang}
                    value={customInstructions}
                    disabled={isGenerating}
                    pageHeading={vestiPreview === 'request' || focusRequest}
                    onChange={setCustomInstructions}
                    onSubmit={handleCustomTryOn}
                  />
                )}

                {/* ── History Gallery (post-upload) ── */}
                {!vestiSelectionActive && !vestiRevealActive && history.length > 0 && (
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
            {!isUploaded && !vestiEntryActive && history.length > 0 && (
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
      )}

      {/* ── Fixed Bottom Bar (hidden on path selection and Vesti core screens) ── */}
      {!showPathScreen && !hideLegacyChrome && (
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
                onClick={() => setShowAdminPanel(true)}
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-gray-500 backdrop-blur-3xl transition-all hover:border-white/20 hover:text-gray-300 focus:outline-none"
                title="Admin"
              >
                <Palette className="h-4 w-4" />
              </button>
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
      )}
      <AnalysisPanel />
    </div>
  )
}

export default App
