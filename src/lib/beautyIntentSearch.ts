/**
 * Beauty intent search — map free-text query to recommended looks from LOOK_METADATA.
 * Uses keyword groups (occasion, vibe, intensity, safety) and scores each look.
 */

export type SearchResult = {
  lookName: string
  score: number
  matchReason: string
  reasonLine: string
  role: 'best' | 'softer' | 'bolder' | 'evening' | 'alternate'
}

export type LookMetadataEntry = {
  category: string
  vibe: string
  whenToChoose: string
  bestFor: string
  presenceLevel: 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high'
  beginnerSafety: 'very-high' | 'high' | 'medium' | 'low-medium' | 'low'
  adjacentLook: string
  salesLine: string
}

export type LookMetadataRecord = Record<string, LookMetadataEntry>

const PRESENCE_ORDER: LookMetadataEntry['presenceLevel'][] = ['low', 'low-medium', 'medium', 'medium-high', 'high']

function presenceIndex(level: LookMetadataEntry['presenceLevel']): number {
  return PRESENCE_ORDER.indexOf(level)
}

// ─── Keyword groups → intent signals ─────────────────────────────────────────

const OCCASION_KEYWORDS: Record<string, string[]> = {
  party: ['party', 'מסיבה'],
  date: ['date', 'date night', 'דייט', 'ערב רומנטי'],
  work: ['work', 'office', 'עבודה', 'משרד'],
  wedding: ['wedding', 'חתונה'],
  dinner: ['dinner', 'ארוחת ערב'],
  everyday: ['everyday', 'יומיומי', 'יום יום'],
}

const VIBE_KEYWORDS: Record<string, string[]> = {
  natural: ['natural', 'טבעי', 'עדין'],
  glam: ['glam', 'glamour', 'גלאם'],
  bold: ['bold', 'נועז', 'חזק'],
  romantic: ['romantic', 'רומנטי'],
  polished: ['polished', 'מסודר'],
  soft: ['soft', 'רך'],
  evening: ['evening', 'ערב'],
}

const INTENSITY_KEYWORDS: Record<string, string[]> = {
  low: ['light', 'קל', 'עדין'],
  high: ['heavy', 'כבד', 'חזק'],
  medium: ['medium', 'בינוני'],
}

const SAFETY_KEYWORDS: Record<string, string[]> = {
  high: ['beginner', 'מתחילה', 'פשוט', 'קל'],
  low: ['bold', 'נועז'],
}

function extractSignals(query: string): {
  occasion?: string
  vibe?: string
  intensity?: string
  safety?: string
} {
  const q = query.trim().toLowerCase()
  const signals: { occasion?: string; vibe?: string; intensity?: string; safety?: string } = {}

  for (const [occasion, keywords] of Object.entries(OCCASION_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw.toLowerCase()))) {
      signals.occasion = occasion
      break
    }
  }
  for (const [vibe, keywords] of Object.entries(VIBE_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw.toLowerCase()))) {
      signals.vibe = vibe
      break
    }
  }
  for (const [intensity, keywords] of Object.entries(INTENSITY_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw.toLowerCase()))) {
      signals.intensity = intensity
      break
    }
  }
  for (const [safety, keywords] of Object.entries(SAFETY_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw.toLowerCase()))) {
      signals.safety = safety
      break
    }
  }

  return signals
}

function scoreLook(
  _lookName: string,
  entry: LookMetadataEntry,
  signals: ReturnType<typeof extractSignals>
): number {
  let score = 0
  const vibe = entry.vibe.toLowerCase()
  const category = entry.category.toLowerCase()
  const pl = entry.presenceLevel
  const safety = entry.beginnerSafety

  // Occasion → presenceLevel
  if (signals.occasion === 'party') {
    if (pl === 'medium-high' || pl === 'high') score += 3
  } else if (signals.occasion === 'date') {
    if (pl === 'medium' || pl === 'medium-high') score += 3
  } else if (signals.occasion === 'work') {
    if (pl === 'low-medium' || pl === 'medium') score += 3
  } else if (signals.occasion === 'wedding') {
    if (pl === 'medium-high' || pl === 'high') score += 2
  } else if (signals.occasion === 'dinner') {
    if (pl === 'medium-high') score += 3
  } else if (signals.occasion === 'everyday') {
    if (pl === 'low' || pl === 'low-medium') score += 3
  }

  // Vibe matching
  if (signals.vibe === 'natural' && (vibe.includes('טבעי') || vibe.includes('natural'))) score += 2
  if (signals.vibe === 'glam' && (vibe.includes('גלאם') || vibe.includes('glam'))) score += 2
  if (signals.vibe === 'bold' && pl === 'high') score += 2
  if (signals.vibe === 'romantic' && (vibe.includes('רומנטי') || vibe.includes('romantic'))) score += 2
  if (signals.vibe === 'polished' && (vibe.includes('מסודר') || vibe.includes('polished'))) score += 2
  if (signals.vibe === 'soft' && (vibe.includes('רך') || vibe.includes('soft'))) score += 2
  if (signals.vibe === 'evening' && (category.includes('ערב') || category.includes('evening'))) score += 2

  // Safety
  if (signals.safety === 'high' && (safety === 'very-high' || safety === 'high')) score += 2
  if (signals.safety === 'low' && (safety === 'low' || safety === 'low-medium')) score += 1

  return score
}

function assignRole(
  index: number,
  _lookName: string,
  entry: LookMetadataEntry,
  bestEntry: LookMetadataEntry,
  _bestLookName: string
): SearchResult['role'] {
  if (index === 0) return 'best'
  const bestPlIdx = presenceIndex(bestEntry.presenceLevel)
  const plIdx = presenceIndex(entry.presenceLevel)
  const category = entry.category.toLowerCase()

  if (index === 1) return plIdx < bestPlIdx ? 'softer' : 'alternate'
  if (index === 2) return plIdx > bestPlIdx ? 'bolder' : 'alternate'
  if (index === 3) return category.includes('ערב') || category.includes('evening') ? 'evening' : 'alternate'
  return 'alternate'
}

const REASON_LINE_BY_ROLE: Record<SearchResult['role'], string> = {
  best: 'זה כיוון שמרגיש נכון למה שתיארת',
  softer: 'אותה תחושה, אבל בצורה רכה יותר',
  evening: 'אותה משפחה, אבל עם יותר עומק לערב',
  bolder: 'כיוון עם יותר נוכחות ויותר ביטחון',
  alternate: 'כיוון שיכול לעבוד יפה למה שחיפשת',
}

/**
 * Search looks by user intent (occasion, vibe, intensity, safety).
 * Returns top 4 looks with role, matchReason (salesLine), and reasonLine.
 */
export function searchByIntent(query: string, metadata: LookMetadataRecord): SearchResult[] {
  if (!query.trim()) return []

  const signals = extractSignals(query)
  const entries = Object.entries(metadata).map(([lookName, entry]) => ({
    lookName,
    entry,
    score: scoreLook(lookName, entry, signals),
  }))

  entries.sort((a, b) => b.score - a.score)
  const top4 = entries.slice(0, 4)
  const bestEntry = top4[0]?.entry
  const bestLookName = top4[0]?.lookName ?? ''

  return top4.map(({ lookName, entry, score }, index) => {
    const role = assignRole(index, lookName, entry, bestEntry ?? entry, bestLookName)
    return {
      lookName,
      score,
      matchReason: entry.salesLine,
      reasonLine: REASON_LINE_BY_ROLE[role],
      role,
    }
  })
}
