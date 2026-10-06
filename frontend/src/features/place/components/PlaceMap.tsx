import { Map } from '@vis.gl/react-google-maps'
import { useAppSelector } from '@/app/hooks'
import { env } from '@/config/env'
import { withGoogleMaps } from '@/shared/hoc/withGoogleMaps'
import { FavouriteMarker } from '@/features/favourites/components/FavouriteMarker'
import { selectAllFavourites } from '@/features/favourites/selectors'
import { useMapFocus } from '../hooks/useMapFocus'
import { selectSelectedPlace } from '../selectors'
import { PlaceMarker } from './PlaceMarker'

function PlaceMap() {
  const selected = useAppSelector(selectSelectedPlace)
  const favourites = useAppSelector(selectAllFavourites)
  useMapFocus()

  return (
    <Map
      mapId={env.mapId}
      defaultCenter={env.defaultCenter}
      defaultZoom={env.defaultZoom}
      gestureHandling="greedy"
      clickableIcons={false}
      mapTypeControl={false}
      streetViewControl={false}
      className="h-full w-full"
    >
      {favourites
        .filter((favourite) => favourite.placeId !== selected?.placeId)
        .map((favourite) => (
          <FavouriteMarker key={favourite.placeId} favourite={favourite} />
        ))}
      {selected && <PlaceMarker place={selected} />}
    </Map>
  )
}

function MapSkeleton() {
  return <div aria-hidden className="h-full w-full animate-pulse bg-line/60" />
}

export const GooglePlaceMap = withGoogleMaps(PlaceMap, {
  skeleton: <MapSkeleton />,
  layout: 'fill',
})
