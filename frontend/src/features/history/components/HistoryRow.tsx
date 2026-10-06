import { memo } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { IconButton } from '@/shared/components/IconButton'
import { StatusChip } from '@/shared/components/StatusChip'
import { formatDateTime } from '@/shared/utils/formatDateTime'
import { StarButton } from '@/features/favourites/components/StarButton'
import { toFavouriteDraft } from '@/features/favourites/hooks/useFavourite'
import { queryChanged } from '@/features/search/slice'
import type { HistoryItem } from '../selectors'
import { entryRemoved, entrySelected } from '../slice'

/**
 * One past search. Click: show the stored place again (no Google call).
 * For a "no results" / "error" row, click puts the text back in the search box to try again.
 */
export const HistoryRow = memo(function HistoryRow({ item }: { item: HistoryItem }) {
  const dispatch = useAppDispatch()
  const { place } = item

  const select = () => {
    if (place) dispatch(entrySelected({ id: item.id, place }))
    else dispatch(queryChanged(item.query))
  }

  return (
    <li
      className={clsx(
        'group relative border-b border-line transition-colors last:border-b-0',
        item.isSelected ? 'bg-app-light' : 'hover:bg-page',
      )}
    >
      <button
        type="button"
        onClick={select}
        aria-current={item.isSelected || undefined}
        aria-label={place ? `Show ${place.name} on the map` : `Search again for "${item.query}"`}
        className="block w-full px-4 py-3 pr-20 text-left focus-visible:-outline-offset-2"
      >
        <span className="block truncate font-semibold">
          {place ? place.name : `"${item.query}"`}
        </span>
        <span className="mt-0.5 block truncate text-label text-muted">
          {place && `"${item.query}" · `}
          <time dateTime={item.searchedAt}>{formatDateTime(item.searchedAt)}</time>
        </span>
        <span className="mt-1.5 block">
          <StatusChip status={item.status} />
        </span>
      </button>

      <div className="absolute top-2.5 right-3 flex items-center gap-0.5">
        {/* Remove is shown on hover, or when anything in the row has keyboard focus. */}
        <IconButton
          label={`Remove "${item.title}" from history`}
          size="sm"
          icon={<X className="size-4" />}
          onClick={() => dispatch(entryRemoved(item.id))}
          className="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
        />
        {place && <StarButton place={toFavouriteDraft(place)} />}
      </div>
    </li>
  )
})
