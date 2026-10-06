import { Map, RenderingType } from '@vis.gl/react-google-maps'
import { useAppSelector } from '@/app/hooks'
import { env } from '@/config/env'
import { withGoogleMaps } from '@/shared/hoc/withGoogleMaps'
import { FavouriteMarker } from '@/features/favourites/components/FavouriteMarker'
import { selectAllFavourites } from '@/features/favourites/selectors'
import { LocateButton } from '@/features/location/components/LocateButton'
import { UserLocationMarker } from '@/features/location/components/UserLocationMarker'
import { selectUserPosition } from '@/features/location/selectors'
import { useMapFocus } from '../hooks/useMapFocus'
import { selectSelectedPlace } from '../selectors'
import { PlaceMarker } from './PlaceMarker'

function PlaceMap() {
  const selected = useAppSelector(selectSelectedPlace)
  const favourites = useAppSelector(selectAllFavourites)
  const userPosition = useAppSelector(selectUserPosition)
  useMapFocus(userPosition)

  return (
    <Map
      mapId={env.mapId}
      defaultCenter={env.defaultCenter}
      defaultZoom={env.defaultZoom}
      // Smooth camera: vector tiles + in-between zoom levels (12.4, 12.5…) instead of jumps.
      renderingType={RenderingType.VECTOR}
      isFractionalZoomEnabled
      // Soft grey instead of white behind tiles that are still loading.
      backgroundColor="#EEF0F2"
      gestureHandling="greedy"
      clickableIcons={false}
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl={false}
      className="h-full w-full"
    >
      {favourites
        .filter((favourite) => favourite.placeId !== selected?.placeId)
        .map((favourite) => (
          <FavouriteMarker key={favourite.placeId} favourite={favourite} />
        ))}
      <UserLocationMarker />
      {selected && <PlaceMarker key={selected.placeId} place={selected} />}
      <LocateButton />
    </Map>
  )
}

function MapSkeleton() {
  return <div aria-hidden className="pf-shimmer h-full w-full" />
}

export const GooglePlaceMap = withGoogleMaps(PlaceMap, {
  skeleton: <MapSkeleton />,
  layout: 'fill',
})
