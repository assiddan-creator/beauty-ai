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
  Brain,
  CheckCircle2,
  ChevronRight,
  Palette,
  type LucideIcon,
} from 'lucide-react'

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
    inputKey: 'image_input',
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

type ProductItem = (typeof PRODUCT_CATALOG)[0]

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

  const payload = engine.isArray
    ? {
        input: {
          prompt,
          [engine.inputKey]: [imageDataUrl],
          aspect_ratio: 'match_input_image',
          output_format: 'jpg',
        },
      }
    : {
        input: {
          prompt,
          [engine.inputKey]: imageDataUrl,
          output_format: 'jpg',
        },
      }

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

const LookNavigator = ({ currentLookName, onSelect, lang }: { currentLookName: string, onSelect: (name: string) => void, lang: 'he' | 'en' }) => {
  const nav = LOOK_NAVIGATION[currentLookName]
  if (!nav) return null

  const suggestions = [
    {
      lookName: nav.moreNatural,
      labelHe: 'יותר טבעי',
      labelEn: 'More natural',
    },
    {
      lookName: nav.moreGlam,
      labelHe: 'יותר ערב',
      labelEn: 'More evening',
    },
    {
      lookName: nav.moreWarm,
      labelHe: 'גוונים חמים',
      labelEn: 'Warmer tones',
    },
    {
      lookName: nav.moreCool,
      labelHe: 'גוונים קרירים',
      labelEn: 'Cooler tones',
    },
    {
      lookName: nav.saferOption,
      labelHe: 'בטוח יותר',
      labelEn: 'Safer option',
    },
    {
      lookName: nav.bolderOption,
      labelHe: 'יותר נוכח',
      labelEn: 'More statement',
    },
  ].filter((s, i, arr) =>
    s.lookName !== currentLookName &&
    arr.findIndex(x => x.lookName === s.lookName) === i
  )

  return (
    <div className="mt-5">
      <p
        className="mb-3 text-[10px] font-medium tracking-[0.12em] uppercase"
        style={{ color: 'rgba(255,255,255,0.22)' }}
      >
        {lang === 'he' ? 'רוצה לנסות כיוון אחר?' : 'Want to try a different direction?'}
      </p>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => {
          const preset = BEAUTY_PRESETS.find(p => p.name === s.lookName)
          if (!preset) return null
          const displayName = lang === 'he' ? preset.nameHe : preset.name
          const label = lang === 'he' ? s.labelHe : s.labelEn

          return (
            <button
              key={s.lookName}
              type="button"
              onClick={() => onSelect(s.lookName)}
              className="group flex flex-col items-start rounded-xl px-3 py-2 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                minWidth: 90,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = 'rgba(255,107,71,0.08)'
                el.style.borderColor = 'rgba(255,107,71,0.2)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'rgba(255,255,255,0.04)'
                el.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              <span
                className="text-[9px] font-medium tracking-wide"
                style={{ color: 'rgba(255,255,255,0.28)' }}
              >
                {label}
              </span>
              <span
                className="mt-0.5 text-[11px] font-bold leading-tight text-white"
                style={{ letterSpacing: '-0.01em' }}
              >
                {displayName}
              </span>
            </button>
          )
        })}
      </div>
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
  const [looksCarouselCategory, setLooksCarouselCategory] = useState('all')
  const [showPathScreen, setShowPathScreen] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [showUploadChoice, setShowUploadChoice] = useState(false)
  const [showAnalyzingScreen, setShowAnalyzingScreen] = useState(false)
  const [showLookProducts, setShowLookProducts] = useState(false)
  const [activeEngine, setActiveEngine] = useState<Engine>(ENGINES[0])
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const [appMode, setAppMode] = useState<'looks' | 'product'>('looks')
  const [productStep, setProductStep] = useState<'category' | 'brand' | 'product' | 'shade'>('category')
  const [selectedProductCategory, setSelectedProductCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null)
  const [, setSelectedProduct] = useState<ProductItem | null>(null)

  const markBroken = (key: string) =>
    setBrokenImgs((prev) => { const next = new Set(prev); next.add(key); return next })

  // ── File upload ──────────────────────────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (originalImage) URL.revokeObjectURL(originalImage)

    const blobUrl = URL.createObjectURL(file)
    setOriginalImage(blobUrl)
    setIsUploaded(true)
    setShowPathScreen(true)
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
    setShowAnalyzingScreen(true)

    try {
      const dataUrl = await blobUrlToDataUrl(originalImage)
      const analysis = await analyzeFaceWithClaude(dataUrl, lang)
      setFaceAnalysis(analysis)
      setSelectedPreset(analysis.recommendedPreset)
      console.log('[Claude Vision] Beauty analysis complete:', analysis)
    } catch (err) {
      console.error('[Claude Vision] Beauty analysis failed:', err)
      setShowAnalyzingScreen(false)
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
    setShowSplash(true)
    setShowUploadChoice(false)
    setShowAnalyzingScreen(false)
    setShowLookProducts(false)
    setShowPathScreen(false)
    setAppMode('looks')
    setProductStep('category')
    setSelectedProductCategory(null)
    setSelectedBrand(null)
    setSelectedProductName(null)
    setSelectedProduct(null)
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
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl, activeEngine)

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
        'STRICT EDITING RULE: Do not zoom in, crop, reframe, or change the field of view in any way. The face must appear at the exact same size and position as in the original photo. Output dimensions and framing must be identical to the input.',
        'Beauty makeup removal edit. Edit the uploaded selfie and remove existing visible makeup from the face while preserving the person exactly.',
        'TASK: Remove visible cosmetic makeup from the face only. Remove lipstick, lip gloss, lip liner, blush, contour, bronzer, highlighter, visible foundation effect, concealer effect, eyebrow makeup, eyeliner, eyeshadow, and mascara effect if present. Return the face to a clean, natural, makeup-free appearance.',
        'IMPORTANT: Preserve the person\'s exact identity, face shape, facial proportions, skin texture, natural features, hair, clothing, background, framing, lighting, camera angle, and facial expression. Keep the original photo composition unchanged so the edited image aligns exactly with the original photo.',
        'DO NOT CHANGE: Do not beautify the face. Do not retouch or over-smooth the skin. Do not remove natural skin texture. Do not reshape the eyes, lips, nose, jaw, eyebrows, or skin. Do not change hairstyle, clothing, background, lighting, composition, or camera perspective. Do not add new makeup. Do not make the result look airbrushed, filtered, or AI-generated.',
        'DESIRED RESULT: A photorealistic clean-face result with natural bare skin, natural lips, and natural cheeks, as if the makeup has been gently removed while preserving the real person exactly.',
        customNote ? `Additional request: ${customNote}` : null,
      ].filter(Boolean).join('\n\n')

      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl, activeEngine)

      setGeneratedImage(outputUrl)
      setSliderPosition(50)

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        lookName: lang === 'he' ? 'הסרת איפור' : 'Makeup Removed',
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

  const handleProductTryOn = async (product: ProductItem) => {
    if (!originalImage) return
    const token = import.meta.env.VITE_REPLICATE_API_TOKEN
    if (!token) { setError('Replicate API token not found.'); return }
    setError(null)
    setIsGenerating(true)
    try {
      const prompt = [
        'STRICT EDITING RULE: Do not zoom in, crop, reframe, or change the field of view in any way. The face must appear at the exact same size and position as in the original photo.',
        product.tryOnPrompt,
      ].join('\n\n')
      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl, activeEngine)
      setGeneratedImage(outputUrl)
      setSliderPosition(50)
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        lookName: `${product.brand} ${product.shadeName}`,
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

  const ProductTryOnMode = () => {
    const categories = [
      { id: 'lips', labelHe: 'שפתיים', labelEn: 'Lips', emoji: '💋' },
      { id: 'blush', labelHe: 'סומק', labelEn: 'Blush', emoji: '🌸' },
    ]
    const filteredByCategory = PRODUCT_CATALOG.filter(p => p.category === selectedProductCategory)
    const brands = [...new Set(filteredByCategory.map(p => p.brand))]
    const filteredByBrand = filteredByCategory.filter(p => p.brand === selectedBrand)
    const productNames = [...new Set(filteredByBrand.map(p => p.productName))]
    const filteredByProductName = selectedProductName
      ? filteredByBrand.filter(p => p.productName === selectedProductName)
      : []

    return (
      <div className="mt-6">
        {productStep === 'category' && (
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {lang === 'he' ? 'בחרי קטגוריה' : 'Choose a category'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setSelectedProductCategory(cat.id); setProductStep('brand') }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-8 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="text-sm font-bold text-white">{lang === 'he' ? cat.labelHe : cat.labelEn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {productStep === 'brand' && (
          <div>
            <button type="button" onClick={() => setProductStep('category')} className="mb-4 flex items-center gap-1.5 text-[11px] focus:outline-none" style={{ color: 'rgba(255,107,71,0.7)' }}>
              <ChevronRight className="h-3 w-3 rotate-180" />
              {lang === 'he' ? 'חזרה' : 'Back'}
            </button>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {lang === 'he' ? 'בחרי מותג' : 'Choose a brand'}
            </p>
            <div className="flex flex-col gap-2">
              {brands.map(brand => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => { setSelectedBrand(brand); setProductStep('product') }}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-left transition-all hover:opacity-80 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-sm font-semibold text-white">{brand}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {productStep === 'product' && (
          <div>
            <button type="button" onClick={() => { setSelectedBrand(null); setProductStep('brand') }} className="mb-4 flex items-center gap-1.5 text-[11px] focus:outline-none" style={{ color: 'rgba(255,107,71,0.7)' }}>
              <ChevronRight className="h-3 w-3 rotate-180" />
              {lang === 'he' ? 'חזרה' : 'Back'}
            </button>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {lang === 'he' ? 'בחרי מוצר' : 'Choose a product'}
            </p>
            <div className="flex flex-col gap-2">
              {productNames.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { setSelectedProductName(name); setProductStep('shade') }}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-left transition-all hover:opacity-80 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-sm font-semibold text-white">{name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {productStep === 'shade' && (
          <div>
            <button type="button" onClick={() => { setSelectedProductName(null); setProductStep('product') }} className="mb-4 flex items-center gap-1.5 text-[11px] focus:outline-none" style={{ color: 'rgba(255,107,71,0.7)' }}>
              <ChevronRight className="h-3 w-3 rotate-180" />
              {lang === 'he' ? 'חזרה' : 'Back'}
            </button>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {lang === 'he' ? 'בחרי גוון' : 'Choose a shade'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {filteredByProductName.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleProductTryOn(item)}
                  disabled={isGenerating}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg"
                    style={{ background: item.swatchColor, border: '1px solid rgba(255,255,255,0.15)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{item.shadeName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{item.shadeFamily} · {item.finish}</p>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-coral" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const SplashScreen = () => {
    const [pulse, setPulse] = React.useState(false)
    React.useEffect(() => {
      const t = setInterval(() => setPulse(p => !p), 2000)
      return () => clearInterval(t)
    }, [])

    const floatingItems = [
      { emoji: '💋', top: '8%', left: '6%', size: 44, delay: '0s', brand: 'MAC' },
      { emoji: '🌸', top: '12%', right: '8%', size: 38, delay: '0.4s', brand: 'NARS' },
      { emoji: '✨', top: '28%', left: '3%', size: 32, delay: '0.8s', brand: 'Dior' },
      { emoji: '💄', top: '22%', right: '5%', size: 42, delay: '0.3s', brand: 'Charlotte Tilbury' },
      { emoji: '🌹', top: '55%', left: '4%', size: 36, delay: '1s', brand: 'Fenty' },
      { emoji: '💅', top: '60%', right: '6%', size: 40, delay: '0.6s', brand: 'YSL' },
      { emoji: '✨', top: '75%', left: '8%', size: 28, delay: '1.2s', brand: 'Rare Beauty' },
      { emoji: '🌷', top: '78%', right: '9%', size: 34, delay: '0.9s', brand: 'Bobbi Brown' },
    ]

    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
        style={{ background: 'linear-gradient(160deg, #0a0408 0%, #0d0610 40%, #080410 100%)' }}
        onClick={() => setShowUploadChoice(true)}
      >
        <div className="pointer-events-none absolute" style={{ top: '15%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,107,71,0.06)', filter: 'blur(80px)' }} />
        <div className="pointer-events-none absolute" style={{ bottom: '20%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(180,80,180,0.05)', filter: 'blur(80px)' }} />

        {floatingItems.map((item, i) => (
          <div
            key={i}
            className="pointer-events-none absolute flex flex-col items-center gap-1"
            style={{
              top: item.top,
              left: (item as { left?: string }).left,
              right: (item as { right?: string }).right,
              animation: `float ${3 + i * 0.4}s ease-in-out infinite alternate`,
              animationDelay: item.delay,
            }}
          >
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: item.size, height: item.size, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: item.size * 0.5 }}
            >
              {item.emoji}
            </div>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {item.brand}
            </span>
          </div>
        ))}

        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #FF6B47, #FF9D6E)', boxShadow: '0 0 40px rgba(255,107,71,0.4), 0 0 80px rgba(255,107,71,0.15)' }}
          >
            <span style={{ fontSize: 36 }}>✨</span>
          </div>
          <p className="text-4xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>
            Beauty AI
          </p>
          <p className="text-sm mb-12" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>
            VIRTUAL MAKEUP TRY-ON
          </p>
          <div className="flex flex-col items-center gap-3" style={{ opacity: pulse ? 1 : 0.4, transition: 'opacity 0.8s ease' }}>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ border: '1.5px solid rgba(255,107,71,0.5)', boxShadow: '0 0 20px rgba(255,107,71,0.2)' }}
            >
              <span style={{ fontSize: 28 }}>👆</span>
            </div>
            <p className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
              {lang === 'he' ? 'לחצי להתחיל' : 'TAP TO BEGIN'}
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 flex items-center gap-6" style={{ opacity: 0.18 }}>
          {['MAC', 'Dior', 'NARS', 'Charlotte Tilbury', 'Fenty Beauty', 'YSL', 'Rare Beauty', 'Bobbi Brown'].map(b => (
            <span key={b} className="shrink-0 text-xs font-bold text-white tracking-widest uppercase">{b}</span>
          ))}
        </div>

        <style>{`
          @keyframes float {
            from { transform: translateY(0px) rotate(-2deg); }
            to { transform: translateY(-12px) rotate(2deg); }
          }
        `}</style>
      </div>
    )
  }

  const UploadChoiceModal = () => {
    const [visible, setVisible] = React.useState(false)
    React.useEffect(() => {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }, [])

    return (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center px-6"
        style={{
          background: 'rgba(4,2,6,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowUploadChoice(false) }}
      >
        <div
          className="w-full max-w-sm overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(180deg, #0e0810 0%, #080508 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
            transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
            transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <div className="px-6 pb-8 pt-6">
            <p className="mb-1.5 text-center text-xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
              {lang === 'he' ? 'איך תרצי להתחיל?' : 'How would you like to start?'}
            </p>
            <p className="mb-7 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'he' ? 'בחרי תמונה שלך להמשיך' : 'Choose your photo to continue'}
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:opacity-80 active:scale-[0.98] focus:outline-none"
                style={{ background: 'rgba(255,107,71,0.1)', border: '1px solid rgba(255,107,71,0.2)' }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: 'rgba(255,107,71,0.12)' }}>
                  📸
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">{lang === 'he' ? 'צלמי עכשיו' : 'Take a photo'}</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{lang === 'he' ? 'פתחי את המצלמה לסלפי' : 'Open camera for a selfie'}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:opacity-80 active:scale-[0.98] focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  🖼️
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">{lang === 'he' ? 'העלי תמונה' : 'Upload a photo'}</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{lang === 'he' ? 'בחרי תמונה מהגלריה' : 'Choose from your gallery'}</p>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowUploadChoice(false)}
              className="mt-4 flex w-full items-center justify-center py-2 text-xs focus:outline-none"
              style={{ color: 'rgba(255,255,255,0.18)' }}
            >
              {lang === 'he' ? 'ביטול' : 'Cancel'}
            </button>
          </div>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleFileSelect(file)
              setShowUploadChoice(false)
              setShowSplash(false)
            }
            e.target.value = ''
          }}
          className="sr-only"
        />
      </div>
    )
  }

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
            <div className="mb-8">
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
                      className="h-14 w-12 shrink-0 overflow-hidden rounded-xl"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover object-top"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
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

  const AnalysisPanel = () => {
    if (!faceAnalysis || !showAnalysisPanel) return null

    const recommendedPreset = BEAUTY_PRESETS.find(p => p.name === faceAnalysis.recommendedPreset)
    const alternatePresets = (faceAnalysis.alternatePresets ?? [])
      .map(name => BEAUTY_PRESETS.find(p => p.name === name))
      .filter(Boolean) as typeof BEAUTY_PRESETS

    return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) setShowAnalysisPanel(false) }}
      style={{ background: 'rgba(4,2,6,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
    >
      <div
        className="w-full max-w-3xl overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #0a0608 0%, #080408 60%, #060306 100%)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '28px 28px 0 0',
          maxHeight: '92vh',
          boxShadow: '0 -30px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Top glow line */}
        <div className="pointer-events-none" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,107,71,0.4), transparent)' }} />

        {/* Handle */}
        <div className="flex justify-center pt-3.5 pb-1">
          <div className="h-[3px] w-8 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div className="px-6 pb-16 pt-4">

          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowAnalysisPanel(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>

          {/* Personal greeting */}
          <div className="mb-8">
            <p
              className="text-2xl font-extrabold text-white mb-3 leading-snug"
              style={{ letterSpacing: '-0.02em' }}
            >
              {lang === 'he'
                ? 'מצאנו את הלוק שיכול להחמיא לך ✨'
                : 'We found a look that could flatter you ✨'}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {lang === 'he'
                ? 'לפי הגוונים הטבעיים שלך — הנה הכיוון שיכול לשבת עלייך הכי יפה:'
                : 'Based on your natural tones — here\'s the direction that could suit you best:'}
            </p>
          </div>

          {/* What we saw — personal cards */}
          <div
            className="mb-8 rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {lang === 'he' ? 'הגוונים שלך' : 'Your tones'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {faceAnalysis.skinTone && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[9px] uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
                    {lang === 'he' ? 'גוון עור' : 'Skin tone'}
                  </p>
                  <p className="text-sm font-bold text-white">{faceAnalysis.skinTone}</p>
                </div>
              )}
              {faceAnalysis.undertone && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,107,71,0.06)', border: '1px solid rgba(255,107,71,0.12)' }}>
                  <p className="text-[9px] uppercase tracking-wide mb-1" style={{ color: 'rgba(255,107,71,0.5)' }}>
                    {lang === 'he' ? 'אנדרטון' : 'Undertone'}
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'rgba(255,140,100,0.95)' }}>{faceAnalysis.undertone}</p>
                </div>
              )}
              {faceAnalysis.lipColorFamily && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.1)' }}>
                  <p className="text-[9px] uppercase tracking-wide mb-1" style={{ color: 'rgba(236,72,153,0.5)' }}>
                    {lang === 'he' ? 'גוני שפתיים' : 'Lip tones'}
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'rgba(240,150,190,0.95)' }}>{faceAnalysis.lipColorFamily}</p>
                </div>
              )}
              {faceAnalysis.blushColorFamily && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)' }}>
                  <p className="text-[9px] uppercase tracking-wide mb-1" style={{ color: 'rgba(249,115,22,0.5)' }}>
                    {lang === 'he' ? 'גוני סומק' : 'Blush tones'}
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'rgba(255,180,120,0.95)' }}>{faceAnalysis.blushColorFamily}</p>
                </div>
              )}
            </div>

            {/* Beauty tips */}
            {faceAnalysis.beautyTips && faceAnalysis.beautyTips.length > 0 && (
              <div className="space-y-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {faceAnalysis.beautyTips.map((tip, i) => (
                  <div key={i} className="flex gap-2.5 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    <span className="shrink-0 mt-0.5" style={{ color: 'rgba(255,107,71,0.4)' }}>✦</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* The recommendation — personal and warm */}
          {recommendedPreset && (
            <div className="mb-8">
              <p className="text-lg font-extrabold text-white mb-2 leading-snug" style={{ letterSpacing: '-0.02em' }}>
                {lang === 'he'
                  ? 'הלוק שהכי מתאים לך —'
                  : 'The look that suits you most —'}
              </p>

              {/* Look name — hero */}
              <div
                className="relative mb-4 overflow-hidden rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,107,71,0.1) 0%, rgba(80,20,60,0.15) 100%)',
                  border: '1px solid rgba(255,107,71,0.2)',
                  boxShadow: '0 0 40px rgba(255,107,71,0.06)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,71,0.4), transparent)' }} />

                <div className="flex items-start gap-4">
                  {/* Preset preview */}
                  <div
                    className="h-20 w-16 shrink-0 overflow-hidden rounded-xl"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <img
                      src={recommendedPreset.image}
                      alt={recommendedPreset.name}
                      className="h-full w-full object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.background = 'rgba(255,107,71,0.06)' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white mb-2"
                      style={{ background: 'linear-gradient(90deg, #FF6B47, #FF9D6E)', boxShadow: '0 0 10px rgba(255,107,71,0.4)' }}
                    >
                      <Brain className="h-2.5 w-2.5" />
                      {lang === 'he' ? 'הבחירה שלנו' : 'Our pick'}
                    </span>

                    <p
                      className="text-xl font-extrabold text-white leading-tight"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {lang === 'he' ? recommendedPreset.nameHe : recommendedPreset.name}
                    </p>

                    {LOOK_METADATA[recommendedPreset.name]?.salesLine && (
                      <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        {LOOK_METADATA[recommendedPreset.name].salesLine}
                      </p>
                    )}
                  </div>
                </div>

                {/* Personal reasoning */}
                {faceAnalysis.reasoning && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {faceAnalysis.reasoning.split('.')[0] + '.'}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {lang === 'he'
                        ? 'זה לוק שיכול לשבת עלייך בצורה טבעית וקלה.'
                        : 'This look can sit on you naturally and effortlessly.'}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPreset(recommendedPreset.name)
                    setShowAnalysisPanel(false)
                    setAnalysisDismissed(true)
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] focus:outline-none"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B47 0%, #FF9D6E 100%)',
                    boxShadow: '0 0 24px rgba(255,107,71,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {lang === 'he' ? 'נסי את הלוק הזה' : 'Try this look'}
                </button>
              </div>

              {/* Safer / Bolder */}
              {(faceAnalysis.saferOption || faceAnalysis.bolderOption) && (
                <div className="mb-2">
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {lang === 'he'
                      ? 'ואם תרצי, יש לנו גם עוד כיוונים שיכולים להתאים לך —'
                      : 'And if you want, we have more directions that could suit you —'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {faceAnalysis.saferOption && (() => {
                      const p = BEAUTY_PRESETS.find(x => x.name === faceAnalysis.saferOption)
                      if (!p) return null
                      return (
                        <button
                          type="button"
                          onClick={() => { setSelectedPreset(p.name); setShowAnalysisPanel(false); setAnalysisDismissed(true) }}
                          className="flex flex-col items-start rounded-xl p-3 text-left transition-all hover:opacity-80 focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <span className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>🕊️ {lang === 'he' ? 'רך יותר' : 'Softer'}</span>
                          <span className="text-xs font-bold text-white">{lang === 'he' ? p.nameHe : p.name}</span>
                          <span className="text-[9px] mt-0.5 line-clamp-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{LOOK_METADATA[p.name]?.salesLine ?? ''}</span>
                        </button>
                      )
                    })()}
                    {faceAnalysis.bolderOption && (() => {
                      const p = BEAUTY_PRESETS.find(x => x.name === faceAnalysis.bolderOption)
                      if (!p) return null
                      return (
                        <button
                          type="button"
                          onClick={() => { setSelectedPreset(p.name); setShowAnalysisPanel(false); setAnalysisDismissed(true) }}
                          className="flex flex-col items-start rounded-xl p-3 text-left transition-all hover:opacity-80 focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <span className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>🔥 {lang === 'he' ? 'יותר נוכח' : 'Bolder'}</span>
                          <span className="text-xs font-bold text-white">{lang === 'he' ? p.nameHe : p.name}</span>
                          <span className="text-[9px] mt-0.5 line-clamp-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{LOOK_METADATA[p.name]?.salesLine ?? ''}</span>
                        </button>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alternate looks */}
          {alternatePresets.length > 0 && (
            <div className="mb-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {lang === 'he' ? 'כיוונים נוספים לגלות' : 'More directions to explore'}
              </p>
              <div className="flex flex-col gap-2">
                {alternatePresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                    onClick={() => { setSelectedPreset(preset.name); setShowAnalysisPanel(false); setAnalysisDismissed(true) }}
                  >
                    <div className="h-11 w-9 shrink-0 overflow-hidden rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                      <img src={preset.image} alt={preset.name} className="h-full w-full object-cover object-top" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white">{lang === 'he' ? preset.nameHe : preset.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{LOOK_METADATA[preset.name]?.salesLine ?? ''}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <button
            type="button"
            onClick={() => setShowAnalysisPanel(false)}
            className="flex w-full items-center justify-center rounded-xl py-3 text-xs transition-all hover:opacity-60 focus:outline-none"
            style={{ color: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {lang === 'he' ? 'אני מעדיפה לבחור בעצמי' : 'I prefer to choose myself'}
          </button>

        </div>
      </div>
    </div>
  )
  }

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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'} className="relative min-h-screen overflow-x-hidden font-sans text-gray-100">
      {showSplash && <SplashScreen />}
      {showAnalyzingScreen && <AnalyzingScreen />}
      {showLookProducts && <LookProductsScreen />}
      {showAdminPanel && <AdminPanel />}
      {showUploadChoice && <UploadChoiceModal />}
      {showPathScreen && <PathScreen />}
      <AnalysisPanel />

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
                    if (file) {
                      handleFileSelect(file)
                      setShowSplash(false)
                      setShowUploadChoice(false)
                    }
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
                        <div className="hidden absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm">
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

                {/* ── Disclaimer ── */}
                <p className="mt-3 text-center text-[11px] text-gray-600">
                  ✦ {t.disclaimer}
                </p>

                {generatedImage && !isGenerating && (() => {
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
                {generatedImage && !isGenerating && (
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
                <div className="mt-4 flex gap-2 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    type="button"
                    onClick={() => setAppMode('looks')}
                    className="flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all focus:outline-none"
                    style={appMode === 'looks' ? { background: 'linear-gradient(135deg, #FF6B47, #FF9D6E)', color: 'white', boxShadow: '0 0 16px rgba(255,107,71,0.3)' } : { color: 'rgba(255,255,255,0.5)' }}
                  >
                    {lang === 'he' ? 'לוקים' : 'Looks'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppMode('product')}
                    className="flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all focus:outline-none"
                    style={appMode === 'product' ? { background: 'linear-gradient(135deg, #FF6B47, #FF9D6E)', color: 'white', boxShadow: '0 0 16px rgba(255,107,71,0.3)' } : { color: 'rgba(255,255,255,0.5)' }}
                  >
                    {lang === 'he' ? 'מוצר' : 'Product'}
                  </button>
                </div>

                {appMode === 'looks' && (
                <>
                {/* ── Manual Claude Vision trigger ── */}
                {originalImage && !isGenerating && (
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    {faceAnalysis && !showAnalysisPanel && (
                      <button
                        type="button"
                        onClick={() => setShowAnalysisPanel(true)}
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-2 text-xs font-semibold text-coral transition-all hover:bg-coral/20 focus:outline-none"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {lang === 'he' ? 'הניתוח שלי' : 'My Analysis'}
                      </button>
                    )}
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
                                {faceAnalysis.lipColorFamily && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-gray-500">Lips:</span>
                                    <span className="rounded-lg bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-gray-200">
                                      {faceAnalysis.lipColorFamily}
                                    </span>
                                  </div>
                                )}
                                {faceAnalysis.blushColorFamily && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-gray-500">Blush:</span>
                                    <span className="rounded-lg bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-gray-200">
                                      {faceAnalysis.blushColorFamily}
                                    </span>
                                  </div>
                                )}
                                {faceAnalysis.avoidPreset && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-gray-500">{lang === 'he' ? 'להמנע' : 'Avoid'}:</span>
                                    <span className="rounded-lg bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                                      {faceAnalysis.avoidPreset}
                                    </span>
                                  </div>
                                )}
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
                  {(() => {
                    const categories = [
                      { id: 'all', label: lang === 'he' ? 'הכל' : 'All' },
                      { id: 'טבעי וקל', label: lang === 'he' ? 'טבעי וקל' : 'Natural & Easy' },
                      { id: 'זוהר ורענן', label: lang === 'he' ? 'זוהר ורענן' : 'Glow & Fresh' },
                      { id: 'מסודר ויוקרתי', label: lang === 'he' ? 'מסודר ויוקרתי' : 'Polished & Luxury' },
                      { id: 'חם וקייצי', label: lang === 'he' ? 'חם וקייצי' : 'Warm & Sunny' },
                      { id: 'ערב ודומיננטי', label: lang === 'he' ? 'ערב ודומיננטי' : 'Evening & Bold' },
                    ]
                    const activeCategory = looksCarouselCategory
                    const setActiveCategory = setLooksCarouselCategory
                    const filteredPresets = activeCategory === 'all'
                      ? BEAUTY_PRESETS
                      : BEAUTY_PRESETS.filter(p => LOOK_METADATA[p.name]?.category === activeCategory)
                    const groupedPresets = activeCategory === 'all'
                      ? [
                          { id: 'טבעי וקל', label: lang === 'he' ? 'טבעי וקל' : 'Natural & Easy', sublabel: lang === 'he' ? 'מחמיא, קל ובטוח' : 'Flattering, easy and safe' },
                          { id: 'זוהר ורענן', label: lang === 'he' ? 'זוהר ורענן' : 'Glow & Fresh', sublabel: lang === 'he' ? 'רענן, זוהר ומחיה' : 'Fresh, glowing and alive' },
                          { id: 'מסודר ויוקרתי', label: lang === 'he' ? 'מסודר ויוקרתי' : 'Polished & Luxury', sublabel: lang === 'he' ? 'אלגנטי, מדויק ויקר' : 'Elegant, precise and expensive' },
                          { id: 'חם וקייצי', label: lang === 'he' ? 'חם וקייצי' : 'Warm & Sunny', sublabel: lang === 'he' ? 'חם, שזוף ומזהיר' : 'Warm, tanned and radiant' },
                          { id: 'ערב ודומיננטי', label: lang === 'he' ? 'ערב ודומיננטי' : 'Evening & Bold', sublabel: lang === 'he' ? 'נוכחות, עוצמה וסטייל' : 'Presence, power and style' },
                        ].map(group => ({
                          ...group,
                          presets: BEAUTY_PRESETS.filter(p => LOOK_METADATA[p.name]?.category === group.id)
                        })).filter(g => g.presets.length > 0)
                      : null
                    return (
                      <>
                        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          {categories.map(cat => {
                            const isActive = activeCategory === cat.id
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id)}
                                className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none"
                                style={isActive ? {
                                  background: 'linear-gradient(135deg, #FF6B47, #FF9D6E)',
                                  color: 'white',
                                  boxShadow: '0 0 16px rgba(255,107,71,0.4)',
                                  border: 'none',
                                } : {
                                  background: 'rgba(255,255,255,0.04)',
                                  color: 'rgba(255,255,255,0.45)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                }}
                              >
                                {cat.label}
                              </button>
                            )
                          })}
                        </div>
                        {groupedPresets ? (
                          <div className="space-y-8">
                            {groupedPresets.map(group => (
                              <div key={group.id}>
                                <div className="mb-3">
                                  <div className="flex items-baseline gap-2">
                                    <h3 className="text-sm font-extrabold text-white" style={{ letterSpacing: '-0.01em' }}>
                                      {group.label}
                                    </h3>
                                    <span className="text-[10px] text-gray-600">{group.sublabel}</span>
                                  </div>
                                  <div className="mt-1.5 h-px w-8" style={{ background: 'linear-gradient(90deg, rgba(255,107,71,0.5), transparent)' }} />
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                  {group.presets.map(preset => {
                                    const meta = LOOK_METADATA[preset.name]
                                    const isSelected = selectedPreset === preset.name
                                    const isRecommended = faceAnalysis && !analysisDismissed && faceAnalysis.recommendedPreset === preset.name
                                    return (
                                      <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => setSelectedPreset(preset.name)}
                                        className="group relative flex shrink-0 w-44 h-64 snap-center flex-col overflow-hidden rounded-2xl text-left transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] focus:outline-none"
                                        style={{
                                          border: isSelected ? '1.5px solid rgba(255,107,71,0.6)' : '1px solid rgba(255,255,255,0.07)',
                                          boxShadow: isSelected
                                            ? '0 0 30px rgba(255,107,71,0.35), 0 0 60px rgba(255,107,71,0.12), inset 0 1px 0 rgba(255,107,71,0.2)'
                                            : '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)',
                                        }}
                                      >
                                        {brokenImgs.has(`preset-${preset.id}`) ? (
                                          <div
                                            className="absolute inset-0"
                                            style={{ background: `linear-gradient(160deg, rgba(255,107,71,0.06) 0%, rgba(20,10,20,0.95) 100%)` }}
                                          >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <ImageIcon className="h-6 w-6 text-gray-800" />
                                            </div>
                                          </div>
                                        ) : (
                                          <img
                                            src={preset.image}
                                            alt={preset.name}
                                            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                            onError={() => markBroken(`preset-${preset.id}`)}
                                          />
                                        )}
                                        <div
                                          className="absolute inset-0"
                                          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.92) 100%)' }}
                                        />
                                        {isSelected && (
                                          <div
                                            className="absolute inset-0 transition-opacity duration-300"
                                            style={{ background: 'linear-gradient(180deg, rgba(255,107,71,0.1) 0%, transparent 60%)' }}
                                          />
                                        )}
                                        {isRecommended && (
                                          <div
                                            className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 backdrop-blur-sm"
                                            style={{
                                              background: 'linear-gradient(90deg, #FF6B47, #FF9D6E)',
                                              boxShadow: '0 0 12px rgba(255,107,71,0.6)',
                                            }}
                                          >
                                            <Brain className="h-2.5 w-2.5 text-white" />
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-white">AI Pick</span>
                                          </div>
                                        )}
                                        <div className="relative z-10 mt-auto flex flex-col p-3.5">
                                          {meta?.vibe && (
                                            <span
                                              className="mb-1 text-[9px] font-medium tracking-[0.08em] uppercase line-clamp-1"
                                              style={{ color: 'rgba(255,255,255,0.35)' }}
                                            >
                                              {meta.vibe.split(',')[0].trim()}
                                            </span>
                                          )}
                                          <p
                                            className="text-sm font-extrabold leading-tight text-white"
                                            style={{ letterSpacing: '-0.02em' }}
                                          >
                                            {lang === 'he' ? preset.nameHe : preset.name}
                                          </p>
                                          {meta?.salesLine && (
                                            <p
                                              className="mt-1 text-[10px] leading-relaxed line-clamp-2"
                                              style={{ color: 'rgba(255,255,255,0.45)' }}
                                            >
                                              {meta.salesLine}
                                            </p>
                                          )}
                                          {isSelected && (
                                            <div className="mt-2 flex items-center gap-1.5">
                                              <div
                                                className="h-1.5 w-1.5 rounded-full"
                                                style={{ background: '#FF6B47', boxShadow: '0 0 6px rgba(255,107,71,0.8)' }}
                                              />
                                              <span
                                                className="text-[9px] font-semibold tracking-wide"
                                                style={{ color: 'rgba(255,107,71,0.8)' }}
                                              >
                                                {lang === 'he' ? 'נבחר' : 'Selected'}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {filteredPresets.map(preset => {
                              const meta = LOOK_METADATA[preset.name]
                              const isSelected = selectedPreset === preset.name
                              const isRecommended = faceAnalysis && !analysisDismissed && faceAnalysis.recommendedPreset === preset.name
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => setSelectedPreset(preset.name)}
                                  className="group relative flex shrink-0 w-44 h-64 snap-center flex-col overflow-hidden rounded-2xl text-left transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] focus:outline-none"
                                  style={{
                                    border: isSelected ? '1.5px solid rgba(255,107,71,0.6)' : '1px solid rgba(255,255,255,0.07)',
                                    boxShadow: isSelected
                                      ? '0 0 30px rgba(255,107,71,0.35), 0 0 60px rgba(255,107,71,0.12), inset 0 1px 0 rgba(255,107,71,0.2)'
                                      : '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)',
                                  }}
                                >
                                  {brokenImgs.has(`preset-${preset.id}`) ? (
                                    <div
                                      className="absolute inset-0"
                                      style={{ background: `linear-gradient(160deg, rgba(255,107,71,0.06) 0%, rgba(20,10,20,0.95) 100%)` }}
                                    >
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-gray-800" />
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={preset.image}
                                      alt={preset.name}
                                      className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                      onError={() => markBroken(`preset-${preset.id}`)}
                                    />
                                  )}
                                  <div
                                    className="absolute inset-0"
                                    style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.92) 100%)' }}
                                  />
                                  {isSelected && (
                                    <div
                                      className="absolute inset-0 transition-opacity duration-300"
                                      style={{ background: 'linear-gradient(180deg, rgba(255,107,71,0.1) 0%, transparent 60%)' }}
                                    />
                                  )}
                                  {isRecommended && (
                                    <div
                                      className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 backdrop-blur-sm"
                                      style={{
                                        background: 'linear-gradient(90deg, #FF6B47, #FF9D6E)',
                                        boxShadow: '0 0 12px rgba(255,107,71,0.6)',
                                      }}
                                    >
                                      <Brain className="h-2.5 w-2.5 text-white" />
                                      <span className="text-[8px] font-bold uppercase tracking-wider text-white">AI Pick</span>
                                    </div>
                                  )}
                                  <div className="relative z-10 mt-auto flex flex-col p-3.5">
                                    {meta?.vibe && (
                                      <span
                                        className="mb-1 text-[9px] font-medium tracking-[0.08em] uppercase line-clamp-1"
                                        style={{ color: 'rgba(255,255,255,0.35)' }}
                                      >
                                        {meta.vibe.split(',')[0].trim()}
                                      </span>
                                    )}
                                    <p
                                      className="text-sm font-extrabold leading-tight text-white"
                                      style={{ letterSpacing: '-0.02em' }}
                                    >
                                      {lang === 'he' ? preset.nameHe : preset.name}
                                    </p>
                                    {meta?.salesLine && (
                                      <p
                                        className="mt-1 text-[10px] leading-relaxed line-clamp-2"
                                        style={{ color: 'rgba(255,255,255,0.45)' }}
                                      >
                                        {meta.salesLine}
                                      </p>
                                    )}
                                    {isSelected && (
                                      <div className="mt-2 flex items-center gap-1.5">
                                        <div
                                          className="h-1.5 w-1.5 rounded-full"
                                          style={{ background: '#FF6B47', boxShadow: '0 0 6px rgba(255,107,71,0.8)' }}
                                        />
                                        <span
                                          className="text-[9px] font-semibold tracking-wide"
                                          style={{ color: 'rgba(255,107,71,0.8)' }}
                                        >
                                          {lang === 'he' ? 'נבחר' : 'Selected'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </section>

                {selectedPreset && (
                  <LookNavigator
                    currentLookName={selectedPreset}
                    onSelect={(name) => setSelectedPreset(name)}
                    lang={lang}
                  />
                )}

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
                      <Trash2 className="h-4 w-4 text-coral" />
                    </div>
                    <div className="relative">
                      <p className="text-sm font-semibold text-white">{lang === 'he' ? 'הסרת איפור' : 'Remove Makeup'}</p>
                      <p className="mt-0.5 text-[11px] text-gray-500">{t.refineOnlySub}</p>
                    </div>
                    <div className="relative ml-auto text-gray-600 transition-colors duration-200 group-hover:text-coral">
                      <Send className="h-4 w-4" />
                    </div>
                  </button>
                </section>

                </>
                )}
                {appMode === 'product' && <ProductTryOnMode />}

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
    </div>
  )
}

export default App
