import { useMemo, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { Check, Copy, ExternalLink, Navigation, Ruler, Star, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { CategoryIcon } from '@/shared/components/CategoryIcon'
import { IconButton } from '@/shared/components/IconButton'
import { copy } from '@/shared/copy'
import { formatCoordinates, formatDateTime } from '@/shared/utils/formatDateTime'
import { distanceMeters, formatDistance } from '@/shared/utils/geo'
import { buildDirectionsUrl, buildGoogleMapsUrl } from '@/shared/utils/googleMapsUrl'
import { typeLabel } from '@/shared/utils/placeCategory'
import type { PlaceDetails, PlacePhoto } from '@/types/place'
import { StarButton } from '@/features/favourites/components/StarButton'
import { toFavouriteDraft } from '@/features/favourites/hooks/useFavourite'
import { selectFavouriteById } from '@/features/favourites/selectors'
import { selectUserPosition } from '@/features/location/selectors'
import { toastShown } from '@/features/ui/slice'
import { selectPlaceError, selectPlaceStatus, selectSelectedPlace } from '../selectors'
import { selectionCleared } from '../slice'

/**
 * Details of the selected place. Floats over the right of the map on desktop;
 * sits under the map on small screens so Google's attribution stays visible.
 */
export function PlaceCard() {
  const place = useAppSelector(selectSelectedPlace)
  const status = useAppSelector(selectPlaceStatus)
  const error = useAppSelector(selectPlaceError)

  if (status === 'loading') {
    return (
      <PlaceCardFrame>
        <div aria-busy="true" aria-label="Loading place">
          <div className="brand-gradient h-1.5" />
          <div className="flex gap-3 p-4">
            <div className="pf-shimmer size-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="pf-shimmer h-4 w-2/3 rounded" />
              <div className="pf-shimmer h-3 w-full rounded" />
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="pf-shimmer h-9 w-full rounded-lg" />
          </div>
        </div>
      </PlaceCardFrame>
    )
  }
  if (status === 'failed' && !place) {
    return (
      <PlaceCardFrame>
        <p role="alert" className="p-4 text-danger-text">
          {error}
        </p>
      </PlaceCardFrame>
    )
  }
  if (!place) return null

  // Keyed so local state (copied, image failed) and the entrance animation reset per place.
  return <PlaceDetailsCard key={place.placeId} place={place} />
}

function PlaceDetailsCard({ place }: { place: PlaceDetails }) {
  const dispatch = useAppDispatch()
  const userPosition = useAppSelector(selectUserPosition)
  const favourite = useAppSelector((state) => selectFavouriteById(state, place.placeId))
  const draft = useMemo(() => toFavouriteDraft(place), [place])
  const [copied, setCopied] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  // Many places (and some API keys) have no photo: then the card stays compact.
  const photo = imageFailed ? null : place.photo
  const label = typeLabel(place.types)
  const coordinates = formatCoordinates(place.location.lat, place.location.lng)
  const fromYou = userPosition ? formatDistance(distanceMeters(userPosition, place.location)) : null
  const close = () => dispatch(selectionCleared())

  const copyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(coordinates)
      setCopied(true)
      dispatch(toastShown({ kind: 'success', message: 'Coordinates copied' }))
    } catch {
      dispatch(toastShown({ kind: 'error', message: "Couldn't copy. Select the text instead." }))
    }
  }

  return (
    <PlaceCardFrame>
      <article aria-labelledby="place-card-title">
        {photo ? (
          <PhotoHero
            photo={photo}
            label={label}
            onClose={close}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div aria-hidden className="brand-gradient h-1.5" />
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {!photo && <CategoryIcon types={place.types} size="lg" variant="solid" />}
            <div className="min-w-0 flex-1">
              {!photo && label && (
                <p className="mb-0.5 text-section font-semibold tracking-[0.04em] text-app-ink uppercase">
                  {label}
                </p>
              )}
              <h2 id="place-card-title" className="text-[17px] leading-snug font-semibold">
                {place.name}
              </h2>
              {place.address && <p className="mt-1 text-muted">{place.address}</p>}
            </div>
            <div className="-mt-1 -mr-1 flex shrink-0 items-center">
              <StarButton place={draft} />
              {!photo && (
                <IconButton
                  label="Close place details"
                  icon={<X className="size-4" />}
                  onClick={close}
                />
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-label">
            {favourite && (
              <span className="inline-flex items-center gap-1 rounded-full bg-app-light px-2 py-0.5 font-medium text-app-ink">
                <Star aria-hidden className="size-3 fill-star text-star" />
                Saved {formatDateTime(favourite.createdAt)}
              </span>
            )}
            {fromYou && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F0FE] px-2 py-0.5 font-medium text-[#1A56B8]">
                <Ruler aria-hidden className="size-3" />
                {fromYou} from you
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-page py-0.5 pr-1 pl-2 font-mono text-muted">
              {coordinates}
              <button
                type="button"
                onClick={copyCoordinates}
                aria-label={copied ? 'Coordinates copied' : 'Copy coordinates'}
                title={copied ? 'Copied' : 'Copy coordinates'}
                className="rounded-full p-1 transition hover:bg-white hover:text-ink"
              >
                {copied ? (
                  <Check aria-hidden className="size-3 text-found-text" />
                ) : (
                  <Copy aria-hidden className="size-3" />
                )}
              </button>
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <a
              href={buildDirectionsUrl(place.placeId, place.location.lat, place.location.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-button shrink-0 items-center justify-center gap-1.5 rounded-control bg-app-primary px-4 font-semibold whitespace-nowrap text-app-on-primary shadow-sm shadow-app-primary/40 transition hover:bg-app-hover active:bg-app-active"
            >
              <Navigation aria-hidden className="size-3.5" />
              Directions
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a
              href={place.googleMapsUri ?? buildGoogleMapsUrl(place.placeId, place.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-button min-w-0 flex-1 items-center justify-center gap-1.5 rounded-control border border-input-line bg-white px-3 font-semibold whitespace-nowrap text-ink transition hover:bg-page"
            >
              {copy.openInGoogleMaps}
              <ExternalLink aria-hidden className="size-3.5 shrink-0" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </article>
    </PlaceCardFrame>
  )
}

/** Photo of the place with the author credit Google requires, category and close on top. */
function PhotoHero({
  photo,
  label,
  onClose,
  onError,
}: {
  photo: PlacePhoto
  label: string | null
  onClose: () => void
  onError: () => void
}) {
  return (
    <div className="relative h-32 overflow-hidden lg:h-40">
      <img src={photo.url} alt="" onError={onError} className="size-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-black/20" />

      {label && (
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-section font-semibold tracking-wide text-ink uppercase shadow-sm backdrop-blur">
          {label}
        </span>
      )}

      <IconButton
        label="Close place details"
        icon={<X className="size-4" />}
        onClick={onClose}
        className="absolute top-2.5 right-2.5 bg-white/90 text-ink shadow-sm backdrop-blur hover:bg-white"
      />

      {photo.attributions.length > 0 && (
        <p className="absolute right-3 bottom-2 left-3 truncate text-right text-section text-white/85">
          Photo:{' '}
          {photo.attributions.map((author, index) => (
            <span key={author.name + index}>
              {index > 0 && ', '}
              {author.uri ? (
                <a
                  href={author.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-white/40 underline-offset-2 hover:text-white"
                >
                  {author.name}
                </a>
              ) : (
                author.name
              )}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

function PlaceCardFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className={clsx(
        'pf-enter-right relative z-10 mx-3 mt-3 overflow-hidden rounded-2xl border border-line bg-white shadow-xl shadow-ink/10',
        'lg:absolute lg:top-4 lg:right-4 lg:m-0 lg:w-90 lg:max-h-[calc(100%-2rem)] lg:overflow-y-auto',
      )}
    >
      {children}
    </div>
  )
}
