import type { Bounds, LatLng } from '@/types/place'

const EARTH_RADIUS_METERS = 6_371_000
const toRadians = (deg: number) => (deg * Math.PI) / 180

/** Great-circle distance (haversine). Good to a few metres, which is plenty for a label. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h))
}

/** "850 m", "3.2 km", "42 km" */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`
  const km = meters / 1000
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`
}

export function boundsCenter(bounds: Bounds): LatLng {
  const east = bounds.east < bounds.west ? bounds.east + 360 : bounds.east // crosses 180°
  let lng = (bounds.west + east) / 2
  if (lng > 180) lng -= 360
  return { lat: (bounds.north + bounds.south) / 2, lng }
}
