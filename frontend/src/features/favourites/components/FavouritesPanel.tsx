import { memo } from 'react'
import { Star } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { AsyncView } from '@/shared/components/AsyncView'
import { EmptyState } from '@/shared/components/EmptyState'
import { copy } from '@/shared/copy'
import { formatCoordinates } from '@/shared/utils/formatDateTime'
import { selectSelectedPlace } from '@/features/place/selectors'
import type { Favourite } from '@/types/place'
import clsx from 'clsx'
import { selectAllFavourites, selectFavouritesError, selectFavouritesStatus } from '../selectors'
import { favouriteFocused, favouritesLoadRequested } from '../slice'
import { StarButton } from './StarButton'

const FavouriteRow = memo(function FavouriteRow({
  favourite,
  isSelected,
}: {
  favourite: Favourite
  isSelected: boolean
}) {
  const dispatch = useAppDispatch()
  return (
    <li
      className={clsx(
        'relative border-b border-line transition-colors last:border-b-0',
        isSelected ? 'bg-app-light' : 'hover:bg-page',
      )}
    >
      <button
        type="button"
        onClick={() => dispatch(favouriteFocused(favourite))}
        aria-current={isSelected || undefined}
        aria-label={`Show ${favourite.name} on the map`}
        className="block w-full px-4 py-3 pr-14 text-left focus-visible:-outline-offset-2"
      >
        <span className="block truncate font-semibold">{favourite.name}</span>
        {favourite.address && (
          <span className="mt-0.5 block truncate text-label text-muted">{favourite.address}</span>
        )}
        <span className="mt-0.5 block font-mono text-label text-muted">
          {formatCoordinates(favourite.latitude, favourite.longitude)}
        </span>
      </button>
      <div className="absolute top-2.5 right-3">
        <StarButton place={favourite} />
      </div>
    </li>
  )
})

/** Starred places, loaded from the Spring Boot API. */
export function FavouritesPanel() {
  const dispatch = useAppDispatch()
  const favourites = useAppSelector(selectAllFavourites)
  const status = useAppSelector(selectFavouritesStatus)
  const error = useAppSelector(selectFavouritesError)
  const selectedId = useAppSelector(selectSelectedPlace)?.placeId

  return (
    <AsyncView
      status={status}
      data={favourites}
      error={error}
      onRetry={() => dispatch(favouritesLoadRequested())}
      renderEmpty={() => (
        <EmptyState icon={<Star className="size-5" />} message={copy.favouritesEmpty} />
      )}
    >
      {(rows) => (
        <ul aria-label="Favourite places" className="min-h-0 flex-1 overflow-y-auto">
          {rows.map((favourite) => (
            <FavouriteRow
              key={favourite.placeId}
              favourite={favourite}
              isSelected={favourite.placeId === selectedId}
            />
          ))}
        </ul>
      )}
    </AsyncView>
  )
}
