import { splitByMatches } from '@/shared/utils/highlight'
import type { TextMatch } from '@/types/place'

/** Shows text with the parts that matched the query in bold. */
export function HighlightedText({ text, matches }: { text: string; matches: TextMatch[] }) {
  return (
    <>
      {splitByMatches(text, matches).map((part, index) =>
        part.match ? (
          <strong key={index} className="font-bold">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  )
}
