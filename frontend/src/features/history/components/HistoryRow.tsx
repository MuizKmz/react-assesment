import { memo } from 'react'
import clsx from 'clsx'
import { AlertTriangle, SearchX, X } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { CategoryIcon } from '@/shared/components/CategoryIcon'
import { IconButton } from '@/shared/components/IconButton'
import { StatusChip } from '@/shared/components/StatusChip'
import { formatDateTime } from '@/shared/utils/formatDateTime'
import { StarButton } from '@/features/favourites/components/StarButton'
import { toFavouriteDraft } from '@/features/favourites/hooks/useFavourite'
import { queryChanged } from '@/features/search/slice'
import type { HistoryItem } from '../selectors'
import { entryRemoved, entrySelected } from '../slice'

/** Rows animate in one after another, but never wait more than ~0.3 s. */
const staggerDelay = (index: number) => `${Math.min(index, 10) * 30}ms`

/**
 * One past search. Click: show the stored place again (no Google call).
 * For a "no results" / "error" row, click puts the text back in the search box to try again.
 */
export const HistoryRow = memo(function HistoryRow({
  item,
  index,
}: {
  item: HistoryItem
  index: number
}) {
  const dispatch = useAppDispatch()
  const { place } = item

  const select = () => {
    if (place) dispatch(entrySelected({ id: item.id, place }))
    else dispatch(queryChanged(item.query))
  }

  return (
    <li
      style={{ animationDelay: staggerDelay(index) }}
      className={clsx(
        'pf-enter-up group relative mx-2 my-1 rounded-xl transition-colors',
        item.isSelected ? 'bg-app-light ring-1 ring-app-light-border' : 'hover:bg-page',
      )}
    >
      <button
        type="button"
        onClick={select}
        aria-current={item.isSelected || undefined}
        aria-label={place ? `Show ${place.name} on the map` : `Search again for "${item.query}"`}
        className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 pr-20 text-left"
      >
        {place ? (
          <CategoryIcon types={place.types} variant={item.isSelected ? 'solid' : 'soft'} />
        ) : (
          <span
            aria-hidden
            className={clsx(
              'flex size-8 shrink-0 items-center justify-center rounded-lg',
              item.status === 'error' ? 'bg-error-bg text-error-text' : 'bg-none-bg text-none-text',
            )}
          >
            {item.status === 'error' ? (
              <AlertTriangle className="size-4" />
            ) : (
              <SearchX className="size-4" />
            )}
          </span>
        )}
        <span className="min-w-0 flex-1">
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
        </span>
      </button>

      <div className="absolute top-2 right-2 flex items-center gap-0.5">
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
