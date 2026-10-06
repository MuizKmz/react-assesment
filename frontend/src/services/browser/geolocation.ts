import type { LatLng } from '@/types/place'
import { ServiceError } from '../serviceError'

export const LOCATION_DENIED =
  'Location is blocked. Allow it for this site in your browser, then try again.'
export const LOCATION_UNAVAILABLE = "Couldn't find your location. Try again in a moment."

/** The browser Geolocation API as a Promise with friendly errors. */
export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new ServiceError(LOCATION_UNAVAILABLE))
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error) =>
        reject(
          new ServiceError(
            error.code === error.PERMISSION_DENIED ? LOCATION_DENIED : LOCATION_UNAVAILABLE,
            error,
          ),
        ),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    )
  })
}
