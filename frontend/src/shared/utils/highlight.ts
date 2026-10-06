import type { TextMatch } from '@/types/place'

export interface TextPart {
  text: string
  match: boolean
}

/**
 * Splits text into matched / unmatched parts so the UI can bold the matches.
 * Ranges are clamped, sorted and merged, so bad input never throws.
 */
export function splitByMatches(text: string, matches: TextMatch[]): TextPart[] {
  const ranges = matches
    .map(({ start, end }) => ({
      start: Math.max(0, Math.min(start, text.length)),
      end: Math.max(0, Math.min(end, text.length)),
    }))
    .filter(({ start, end }) => end > start)
    .sort((a, b) => a.start - b.start)

  const parts: TextPart[] = []
  let cursor = 0
  for (const { start, end } of ranges) {
    if (end <= cursor) continue
    const from = Math.max(start, cursor)
    if (from > cursor) parts.push({ text: text.slice(cursor, from), match: false })
    parts.push({ text: text.slice(from, end), match: true })
    cursor = end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
  return parts
}
