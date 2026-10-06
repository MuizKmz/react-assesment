import { useMemo, type ReactNode } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Card } from '@/shared/components/Card'
import { IconButton } from '@/shared/components/IconButton'
import { Spinner } from '@/shared/components/Spinner'
import { copy } from '@/shared/copy'
import { formatCoordinates } from '@/shared/utils/formatDateTime'
import { buildGoogleMapsUrl } from '@/shared/utils/googleMapsUrl'
import { StarButton } from '@/features/favourites/components/StarButton'
import { toFavouriteDraft } from '@/features/favourites/hooks/useFavourite'
import { selectPlaceError, selectPlaceStatus, selectSelectedPlace } from '../selectors'
import { selectionCleared } from '../slice'

/** Card over the map (bottom-left on desktop, bottom sheet on small screens). */
export function PlaceCard() {
  const dispatch = useAppDispatch()
  const place = useAppSelector(selectSelectedPlace)
  const status = useAppSelector(selectPlaceStatus)
  const error = useAppSelector(selectPlaceError)
  const draft = useMemo(() => (place ? toFavouriteDraft(place) : null), [place])

  if (status === 'loading') {
    return (
      <PlaceCardFrame>
        <div className="flex items-center gap-2 text-muted">
          <Spinner label={null} />
          Loading place…
        </div>
      </PlaceCardFrame>
    )
  }
  if (status === 'failed' && !place) {
    return (
      <PlaceCardFrame>
        <p role="alert" className="text-danger-text">
          {error}
        </p>
      </PlaceCardFrame>
    )
  }
  if (!place || !draft) return null

  return (
    <PlaceCardFrame>
      <article aria-labelledby="place-card-title">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 id="place-card-title" className="text-[15px] leading-snug font-semibold">
              {place.name}
            </h2>
            {place.address && <p className="mt-0.5 text-muted">{place.address}</p>}
          </div>
          <StarButton place={draft} />
          <IconButton
            label="Close place details"
            icon={<X className="size-4" />}
            onClick={() => dispatch(selectionCleared())}
          />
        </div>
        <p className="mt-2 font-mono text-label text-muted">
          {formatCoordinates(place.location.lat, place.location.lng)}
        </p>
        <a
          href={place.googleMapsUri ?? buildGoogleMapsUrl(place.placeId, place.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-button items-center gap-1.5 rounded-control bg-app-primary px-4 font-semibold text-white transition-colors hover:bg-app-hover"
        >
          {copy.openInGoogleMaps}
          <ExternalLink aria-hidden className="size-3.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </article>
    </PlaceCardFrame>
  )
}

function PlaceCardFrame({ children }: { children: ReactNode }) {
  return (
    <Card
      className={
        'absolute inset-x-0 bottom-0 z-10 rounded-b-none p-4 shadow-lg ' +
        'lg:inset-x-auto lg:bottom-6 lg:left-6 lg:w-90 lg:rounded-card'
      }
    >
      {children}
    </Card>
  )
}
