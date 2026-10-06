import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import { useAppSelector } from '@/app/hooks'
import { selectSelectedPlace } from '../selectors'

export const FOCUS_ZOOM = 15

/** Leave room for the place card that sits over the bottom-left of the map. */
const PADDING: google.maps.Padding = { top: 48, right: 48, bottom: 180, left: 48 }

/**
 * Moves the map whenever the selected place changes:
 * fit the place's viewport if Google gave one, otherwise pan and zoom in.
 */
export function useMapFocus() {
  const map = useMap()
  const place = useAppSelector(selectSelectedPlace)

  useEffect(() => {
    if (!map || !place) return
    if (place.viewport) {
      map.fitBounds(place.viewport, PADDING)
    } else {
      map.panTo(place.location)
      map.setZoom(FOCUS_ZOOM)
    }
  }, [map, place])
}
