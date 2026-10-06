import { memo } from 'react'
import clsx from 'clsx'
import { Star } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { AsyncView } from '@/shared/components/AsyncView'
import { EmptyState } from '@/shared/components/EmptyState'
import { copy } from '@/shared/copy'
import { formatCoordinates } from '@/shared/utils/formatDateTime'
import { distanceMeters, formatDistance } from '@/shared/utils/geo'
import { selectUserPosition } from '@/features/location/selectors'
import { selectSelectedPlace } from '@/features/place/selectors'
import type { Favourite } from '@/types/place'
import { selectAllFavourites, selectFavouritesError, selectFavouritesStatus } from '../selectors'
import { favouriteFocused, favouritesLoadRequested } from '../slice'
import { StarButton } from './StarButton'

const FavouriteRow = memo(function FavouriteRow({
  favourite,
  isSelected,
  distance,
  index,
}: {
  favourite: Favourite
  isSelected: boolean
  /** "3.2 km" from the user, when their location is known */
  distance: string | null
  index: number
}) {
  const dispatch = useAppDispatch()
  return (
    <li
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
      className={clsx(
        'pf-enter-up relative mx-2 my-1 rounded-xl transition-colors',
        isSelected ? 'bg-app-light ring-1 ring-app-light-border' : 'hover:bg-page',
      )}
    >
      <button
        type="button"
        onClick={() => dispatch(favouriteFocused(favourite))}
        aria-current={isSelected || undefined}
        aria-label={`Show ${favourite.name} on the map`}
        className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 pr-14 text-left"
      >
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-dark text-app-primary shadow-sm"
        >
          <Star className="size-4 fill-app-primary" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{favourite.name}</span>
          {favourite.address && (
            <span className="mt-0.5 block truncate text-label text-muted">{favourite.address}</span>
          )}
          <span className="mt-1 flex items-center gap-2 text-label text-muted">
            <span className="font-mono">
              {formatCoordinates(favourite.latitude, favourite.longitude)}
            </span>
            {distance && (
              <span className="rounded-full bg-[#E8F0FE] px-1.5 font-medium text-[#1A56B8]">
                {distance}
              </span>
            )}
          </span>
        </span>
      </button>
      <div className="absolute top-2 right-2">
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
  const userPosition = useAppSelector(selectUserPosition)

  return (
    <AsyncView
      status={status}
      data={favourites}
      error={error}
      onRetry={() => dispatch(favouritesLoadRequested())}
      renderEmpty={() => (
        <EmptyState icon={<Star className="size-6" />} message={copy.favouritesEmpty} />
      )}
    >
      {(rows) => (
        <ul aria-label="Favourite places" className="min-h-0 flex-1 overflow-y-auto py-1">
          {rows.map((favourite, index) => (
            <FavouriteRow
              key={favourite.placeId}
              favourite={favourite}
              index={index}
              isSelected={favourite.placeId === selectedId}
              distance={
                userPosition
                  ? formatDistance(
                      distanceMeters(userPosition, {
                        lat: favourite.latitude,
                        lng: favourite.longitude,
                      }),
                    )
                  : null
              }
            />
          ))}
        </ul>
      )}
    </AsyncView>
  )
}
