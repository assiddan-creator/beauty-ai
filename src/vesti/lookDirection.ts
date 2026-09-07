import type {
  BeautyAnalysisView,
  LookAlternativeKind,
  LookCardModel,
  LookEditorialFilter,
  LookNavigationMap,
  LookPresence,
  VestiLang,
} from './types'

const NATURAL_CATEGORIES = new Set(['טבעי וקל', 'זוהר ורענן'])
const EVENING_CATEGORIES = new Set(['ערב ודומיננטי'])
const EVENING_NAMES = new Set(['Evening Luxury', 'Date Night Romantic', 'Soft Glam'])

export function lookMatchesFilter(look: LookCardModel, filter: LookEditorialFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'natural') {
    return NATURAL_CATEGORIES.has(look.category)
      || look.presenceLevel === 'low'
      || look.presenceLevel === 'low-medium'
  }
  if (filter === 'evening') {
    return EVENING_CATEGORIES.has(look.category) || EVENING_NAMES.has(look.name)
  }
  return look.presenceLevel === 'high'
    || look.presenceLevel === 'medium-high'
    || look.name === 'Classic Red Lip'
}

export function intensityLabel(presence: LookPresence | undefined, lang: VestiLang): string {
  if (presence === 'low' || presence === 'low-medium') return lang === 'he' ? 'רכה' : 'Soft'
  if (presence === 'high') return lang === 'he' ? 'נועזת' : 'Statement'
  if (presence === 'medium-high') return lang === 'he' ? 'נוכחת' : 'Present'
  return lang === 'he' ? 'מאוזנת' : 'Balanced'
}

export function finishLabel(vibe: string | undefined, lang: VestiLang): string {
  const text = (vibe ?? '').toLowerCase()
  if (text.includes('מבריק') || text.includes('gloss') || text.includes('זוהר')) {
    return lang === 'he' ? 'גימור מבריק' : 'Gloss finish'
  }
  if (text.includes('מט') || text.includes('matte')) {
    return lang === 'he' ? 'גימור מט' : 'Matte finish'
  }
  if (text.includes('סאטן') || text.includes('satin')) {
    return lang === 'he' ? 'גימור סאטן' : 'Satin finish'
  }
  return lang === 'he' ? 'גימור טבעי' : 'Natural finish'
}

export function colorDirectionLabel(analysis: BeautyAnalysisView, lang: VestiLang): string {
  const parts = [analysis.undertone, analysis.lipColorFamily, analysis.blushColorFamily]
    .map((part) => part?.trim())
    .filter(Boolean)
  if (parts.length === 0) {
    return lang === 'he' ? 'לפי הגוונים שנראים בתמונה' : 'From the tones visible in the photo'
  }
  return parts.join(' · ')
}

export function lookCardTreatment(look: LookCardModel): { wash: string; rule: string; swatches: string[] } {
  if (look.presenceLevel === 'high' || look.name === 'Classic Red Lip') {
    return {
      wash: 'linear-gradient(165deg, #1e0d12 0%, #0B0B0D 62%)',
      rule: '#B50E1C',
      swatches: ['#7A0B14', '#B50E1C', '#E43743'],
    }
  }
  if (look.category === 'ערב ודומיננטי' || EVENING_NAMES.has(look.name)) {
    return {
      wash: 'linear-gradient(165deg, #121018 0%, #0B0B0D 64%)',
      rule: '#A7A7AC',
      swatches: ['#1d1b24', '#6f6c78', '#F3F1EE'],
    }
  }
  if (look.name === 'Office Polished' || look.presenceLevel === 'medium-high') {
    return {
      wash: 'linear-gradient(165deg, #15120f 0%, #0B0B0D 62%)',
      rule: '#C5C5C9',
      swatches: ['#2a2420', '#8a7d72', '#E7DFD6'],
    }
  }
  if (NATURAL_CATEGORIES.has(look.category) || look.presenceLevel === 'low' || look.presenceLevel === 'low-medium') {
    return {
      wash: 'linear-gradient(165deg, #121614 0%, #0B0B0D 64%)',
      rule: '#F3F1EE',
      swatches: ['#2e322e', '#8f938c', '#F3F1EE'],
    }
  }
  return {
    wash: 'linear-gradient(165deg, #161310 0%, #0B0B0D 64%)',
    rule: '#C5C5C9',
    swatches: ['#3a322c', '#8a7a70', '#D8D0C8'],
  }
}

export function lookDisplayName(look: LookCardModel | undefined, lang: VestiLang): string {
  if (!look) return ''
  return lang === 'he' ? look.nameHe : look.name
}

export function alternativeLabel(kind: LookAlternativeKind, lang: VestiLang): string {
  if (kind === 'soft') return lang === 'he' ? 'כיוון רך יותר' : 'A softer direction'
  if (kind === 'bold') return lang === 'he' ? 'כיוון נועז יותר' : 'A bolder direction'
  return lang === 'he' ? 'כיוון לערב' : 'An evening direction'
}

export function buildLookAlternatives(
  analysis: BeautyAnalysisView,
  looks: LookCardModel[],
  navigation: LookNavigationMap,
): Array<{ kind: LookAlternativeKind; look: LookCardModel }> {
  const byName = new Map(looks.map((look) => [look.name, look]))
  const recommended = analysis.recommendedPreset
  const eveningName = navigation[recommended]?.moreGlam
  const candidates: Array<{ kind: LookAlternativeKind; name: string }> = [
    { kind: 'soft', name: analysis.saferOption },
    { kind: 'bold', name: analysis.bolderOption },
    { kind: 'evening', name: eveningName },
  ]

  const used = new Set<string>([recommended])
  const selected: Array<{ kind: LookAlternativeKind; look: LookCardModel }> = []

  for (const candidate of candidates) {
    const name = candidate.name?.trim()
    if (!name || used.has(name)) continue
    const look = byName.get(name)
    if (!look) continue
    used.add(name)
    selected.push({ kind: candidate.kind, look })
    if (selected.length === 2) break
  }

  if (selected.length < 2) {
    for (const name of analysis.alternatePresets ?? []) {
      if (!name || used.has(name)) continue
      const look = byName.get(name)
      if (!look) continue
      used.add(name)
      const kind: LookAlternativeKind = look.presenceLevel === 'high' || look.presenceLevel === 'medium-high'
        ? 'bold'
        : look.category === 'ערב ודומיננטי'
          ? 'evening'
          : 'soft'
      selected.push({ kind, look })
      if (selected.length === 2) break
    }
  }

  return selected
}
