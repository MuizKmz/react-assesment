import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import { useAppSelector } from '@/app/hooks'
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY, useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { boundsCenter } from '@/shared/utils/geo'
import type { LatLng } from '@/types/place'
import { selectSelectedPlace } from '../selectors'
import { offsetCenter, zoomForBounds } from '../utils/camera'
import { flyTo } from '../utils/flyTo'

export const FOCUS_ZOOM = 15

interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Parts of the map covered by floating UI. On desktop the panel sits on the left
 * and the place card on the right; on small screens nothing covers the map.
 */
const DESKTOP_INSETS: Insets = { top: 24, right: 400, bottom: 48, left: 420 }
const MOBILE_INSETS: Insets = { top: 24, right: 24, bottom: 24, left: 24 }

/**
 * Moves the map whenever the selected place changes. It flies there (zoom out, glide,
 * zoom in) and lands the place in the middle of the visible area. With reduced motion
 * turned on in the OS, it jumps instead.
 */
export function useMapFocus(target?: LatLng | null) {
  const map = useMap()
  const place = useAppSelector(selectSelectedPlace)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY)

  useEffect(() => {
    if (!map || !place) return
    const insets = isDesktop ? DESKTOP_INSETS : MOBILE_INSETS
    const div = map.getDiv()
    const visibleWidth = div.clientWidth - insets.left - insets.right
    const visibleHeight = div.clientHeight - insets.top - insets.bottom

    const focus = place.viewport ? boundsCenter(place.viewport) : place.location
    const zoom = place.viewport
      ? Math.min(zoomForBounds(place.viewport, visibleWidth, visibleHeight), 17)
      : FOCUS_ZOOM
    // Put the place in the middle of the uncovered area.
    const center = offsetCenter(
      focus,
      zoom,
      (insets.left - insets.right) / 2,
      (insets.top - insets.bottom) / 2,
    )

    if (reduceMotion) {
      map.moveCamera({ center, zoom })
      return
    }
    return flyTo(map, { ...center, zoom })
  }, [map, place, isDesktop, reduceMotion])

  // Also fly to an explicit target (e.g. the user's own location).
  useEffect(() => {
    if (!map || !target) return
    if (reduceMotion) {
      map.moveCamera({ center: target, zoom: 14 })
      return
    }
    return flyTo(map, { ...target, zoom: 14 })
  }, [map, target, reduceMotion])
}
