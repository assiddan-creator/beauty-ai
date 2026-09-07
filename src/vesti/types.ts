export type VestiLang = 'he' | 'en'

export type LookPresence = 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high'

export type LookEditorialFilter = 'all' | 'natural' | 'evening' | 'statement'

export type LookCardModel = {
  id: string
  name: string
  nameHe: string
  category: string
  vibe: string
  salesLine: string
  presenceLevel: LookPresence
}

export type LookNavigationMap = Record<string, {
  moreNatural: string
  moreGlam: string
  moreWarm: string
  moreCool: string
  saferOption: string
  bolderOption: string
}>

export type BeautyAnalysisView = {
  skinTone: string
  undertone: string
  recommendedPreset: string
  alternatePresets: string[]
  saferOption: string
  bolderOption: string
  lipColorFamily: string
  blushColorFamily: string
  reasoning: string
}

export type LookAlternativeKind = 'soft' | 'bold' | 'evening'

export type CaptureStep =
  | 'entry'
  | 'choice'
  | 'camera'
  | 'confirm'
  | 'preparing'
  | 'camera-permission'
  | 'camera-unavailable'
  | 'upload-error'
