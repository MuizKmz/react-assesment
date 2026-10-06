import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps'
import type { PlaceDetails } from '@/types/place'

/** The teal pin for the selected place. */
export function PlaceMarker({ place }: { place: PlaceDetails }) {
  return (
    <AdvancedMarker position={place.location} title={place.name} zIndex={10}>
      <Pin background="#0F766E" borderColor="#134E4A" glyphColor="#FFFFFF" />
    </AdvancedMarker>
  )
}
