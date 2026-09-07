import type { BeautyAnalysisView } from './types'

export const VESTI_PREVIEW_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800" viewBox="0 0 640 800"><rect width="640" height="800" fill="#121214"/><rect x="180" y="160" width="280" height="360" rx="140" fill="#1c1c1e"/><circle cx="320" cy="290" r="70" fill="#2a2a2e"/><path d="M230 470c20-70 180-70 200 0v40H230z" fill="#2a2a2e"/></svg>',
  )

export const VESTI_PREVIEW_ANALYSIS: BeautyAnalysisView & {
  confidence: 'high' | 'medium' | 'low'
  avoidPreset: string
  beautyTips: string[]
} = {
  skinTone: 'Medium',
  undertone: 'Warm',
  recommendedPreset: 'Natural Everyday',
  alternatePresets: ['Clean Glow', 'Office Polished'],
  saferOption: 'Minimal Grooming',
  bolderOption: 'Office Polished',
  lipColorFamily: 'warm nude',
  blushColorFamily: 'soft peach',
  reasoning: 'The visible tones in the photo sit in a warm nude range, so a quiet everyday combination is a clear place to begin.',
  confidence: 'medium',
  avoidPreset: '',
  beautyTips: [],
}
