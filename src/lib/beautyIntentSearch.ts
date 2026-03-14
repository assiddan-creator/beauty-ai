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

export type LookNavigationEntry = {
  moreNatural: string
  moreGlam: string
  moreWarm: string
  moreCool: string
  saferOption: string
  bolderOption: string
}

export type LookNavigationRecord = Record<string, LookNavigationEntry>

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

function findInRanked(entries: Array<{ lookName: string; entry: LookMetadataEntry; score: number }>, lookName: string) {
  return entries.find(e => e.lookName === lookName)
}

type QueryMode = 'bold' | 'evening' | 'date' | 'work' | 'soft' | 'default'

function getQueryMode(query: string): QueryMode {
  const q = query.toLowerCase()
  const softWords = ['natural', 'טבעי', 'soft', 'רך', 'everyday', 'יומיומי', 'light', 'קל', 'subtle', 'עדין', 'clean', 'נקי', 'not heavy', 'לא כבד']
  const eveningWords = ['party', 'מסיבה', 'night', 'ערב', 'glam', 'גלאם', 'dinner', 'ארוחה', 'event', 'אירוע', 'evening']
  const workWords = ['work', 'עבודה', 'office', 'משרד', 'polished', 'מסודר', 'elegant', 'אלגנטי', 'restaurant', 'מסעדה', 'chic', 'שיק']
  const dateWords = ['date', 'דייט', 'romantic', 'רומנטי', 'soft glam']
  const boldWords = ['bold', 'נועז', 'dramatic', 'דרמטי', 'statement', 'strong', 'חזק', 'noticeable', 'full glam']

  if (boldWords.some(w => q.includes(w))) return 'bold'
  if (eveningWords.some(w => q.includes(w))) return 'evening'
  if (dateWords.some(w => q.includes(w))) return 'date'
  if (workWords.some(w => q.includes(w))) return 'work'
  if (softWords.some(w => q.includes(w))) return 'soft'
  return 'default'
}

function isFromNavigation(
  lookName: string,
  nav: LookNavigationEntry | undefined
): boolean {
  if (!nav) return false
  return (
    nav.saferOption === lookName ||
    nav.bolderOption === lookName ||
    nav.moreNatural === lookName ||
    nav.moreGlam === lookName
  )
}

function hasMeaningfulDifference(
  anchorEntry: LookMetadataEntry,
  candidateEntry: LookMetadataEntry,
  candidateName: string,
  nav: LookNavigationEntry | undefined
): boolean {
  if (anchorEntry.presenceLevel !== candidateEntry.presenceLevel) return true
  if (isFromNavigation(candidateName, nav)) return true
  const a = (anchorEntry.vibe ?? '').trim().toLowerCase()
  const b = (candidateEntry.vibe ?? '').trim().toLowerCase()
  if (a !== b) return true
  return false
}

/**
 * Search looks by user intent. Uses scoring then slot assignment (softer, evening, bolder) via navigation.
 * Returns 2–4 results; never empty. Duplicate look names are never assigned to two slots.
 */
export function searchByIntent(
  query: string,
  metadata: LookMetadataRecord,
  navigation: LookNavigationRecord
): SearchResult[] {
  if (!query.trim()) return []

  const signals = extractSignals(query)
  const mode = getQueryMode(query)
  const prefs = {
    preferSofter: true,
    preferEvening: true,
    preferBolder: mode === 'bold' || mode === 'evening',
    suppressAggressiveBold: mode === 'soft' || mode === 'work',
    suppressWeakEvening: mode === 'soft',
  }

  const entries = Object.entries(metadata).map(([lookName, entry]) => ({
    lookName,
    entry,
    score: scoreLook(lookName, entry, signals),
  }))

  entries.sort((a, b) => b.score - a.score)
  if (entries.length === 0) return []

  const anchor = entries[0]
  const anchorName = anchor.lookName
  const anchorEntry = anchor.entry
  const anchorPlIdx = presenceIndex(anchorEntry.presenceLevel)
  const used = new Set<string>([anchorName])
  const nav = navigation[anchorName]

  const results: SearchResult[] = [
    {
      lookName: anchorName,
      score: anchor.score,
      matchReason: anchor.entry.salesLine,
      reasonLine: REASON_LINE_BY_ROLE.best,
      role: 'best',
    },
  ]

  // SOFTER slot
  let softerCandidate: string | null = null
  if (prefs.preferSofter) {
    if (nav?.saferOption && metadata[nav.saferOption] && nav.saferOption !== anchorName) {
      softerCandidate = nav.saferOption
    } else if (nav?.moreNatural && metadata[nav.moreNatural] && !used.has(nav.moreNatural) && nav.moreNatural !== anchorName) {
      softerCandidate = nav.moreNatural
    } else {
      const found = entries.find(
        e => e.lookName !== anchorName && !used.has(e.lookName) &&
          presenceIndex(e.entry.presenceLevel) < anchorPlIdx &&
          (e.entry.beginnerSafety === 'high' || e.entry.beginnerSafety === 'very-high')
      )
      softerCandidate = found ? found.lookName : null
    }
    if (softerCandidate) {
      const f = findInRanked(entries, softerCandidate)
      if (f && hasMeaningfulDifference(anchorEntry, f.entry, softerCandidate, nav)) {
        results.push({ lookName: softerCandidate, score: f.score, matchReason: f.entry.salesLine, reasonLine: REASON_LINE_BY_ROLE.softer, role: 'softer' })
        used.add(softerCandidate)
      }
    }
  }

  // EVENING slot
  let eveningCandidate: string | null = null
  if (prefs.preferEvening) {
    if (nav?.moreGlam && !used.has(nav.moreGlam) && metadata[nav.moreGlam]) {
      eveningCandidate = nav.moreGlam
    } else {
      const catMatch = entries.find(
        e => e.lookName !== anchorName && !used.has(e.lookName) &&
          (e.entry.presenceLevel === 'medium-high' || e.entry.presenceLevel === 'high') &&
          (e.entry.category.includes('ערב') || e.entry.category.includes('גלאם'))
      )
      if (catMatch) eveningCandidate = catMatch.lookName
      else {
        const higherPl = entries.find(
          e => e.lookName !== anchorName && !used.has(e.lookName) &&
            presenceIndex(e.entry.presenceLevel) > anchorPlIdx
        )
        eveningCandidate = higherPl ? higherPl.lookName : null
      }
    }
    if (eveningCandidate) {
      const f = findInRanked(entries, eveningCandidate)
      if (f && hasMeaningfulDifference(anchorEntry, f.entry, eveningCandidate, nav)) {
        const weakEvening = prefs.suppressWeakEvening && (f.entry.presenceLevel === 'low' || f.entry.presenceLevel === 'low-medium')
        if (!weakEvening) {
          results.push({ lookName: eveningCandidate, score: f.score, matchReason: f.entry.salesLine, reasonLine: REASON_LINE_BY_ROLE.evening, role: 'evening' })
          used.add(eveningCandidate)
        }
      }
    }
  }

  // BOLDER slot
  let bolderCandidate: string | null = null
  if (prefs.preferBolder) {
    if (nav?.bolderOption && !used.has(nav.bolderOption) && metadata[nav.bolderOption]) {
      bolderCandidate = nav.bolderOption
    } else {
      const found = entries.find(
        e => e.lookName !== anchorName && !used.has(e.lookName) &&
          (e.entry.presenceLevel === 'high' || e.entry.presenceLevel === 'medium-high')
      )
      bolderCandidate = found ? found.lookName : null
    }
    if (bolderCandidate) {
      const f = findInRanked(entries, bolderCandidate)
      if (f && hasMeaningfulDifference(anchorEntry, f.entry, bolderCandidate, nav)) {
        const tooAggressive = prefs.suppressAggressiveBold && f.entry.presenceLevel === 'high'
        if (!tooAggressive) {
          results.push({ lookName: bolderCandidate, score: f.score, matchReason: f.entry.salesLine, reasonLine: REASON_LINE_BY_ROLE.bolder, role: 'bolder' })
          used.add(bolderCandidate)
        }
      }
    }
  }

  return results
}
