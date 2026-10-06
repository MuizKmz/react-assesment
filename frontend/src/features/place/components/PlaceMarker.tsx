import { AdvancedMarker } from '@vis.gl/react-google-maps'
import type { PlaceDetails } from '@/types/place'

/**
 * The selected place: a black-and-gold pin that drops in with a little bounce,
 * then sends out a soft ripple. The parent keys it by placeId so every new place replays it.
 */
export function PlaceMarker({ place }: { place: PlaceDetails }) {
  return (
    <AdvancedMarker position={place.location} title={place.name} zIndex={10}>
      <span className="pf-pin">
        <span className="pf-pin-halo" />
        <svg viewBox="0 0 36 46" width="36" height="46" aria-hidden className="relative">
          <defs>
            <linearGradient id="pf-pin-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3A3A3A" />
              <stop offset="1" stopColor="#111111" />
            </linearGradient>
          </defs>
          <path
            d="M18 1C8.6 1 1 8.4 1 17.6 1 29.8 18 45 18 45s17-15.2 17-27.4C35 8.4 27.4 1 18 1Z"
            fill="url(#pf-pin-fill)"
            stroke="#000000"
            strokeWidth="1.5"
          />
          <circle cx="18" cy="17.5" r="6.5" fill="#FFC72C" />
          <circle cx="18" cy="17.5" r="3" fill="#111111" />
        </svg>
      </span>
    </AdvancedMarker>
  )
}
