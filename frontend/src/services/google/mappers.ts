import type { PlaceDetails, PlacePhoto, PlaceSuggestion } from '@/types/place'

/**
 * Google objects -> plain DTOs. This is the boundary that keeps
 * non-serializable Google classes out of Redux.
 */

/** Big enough for the card on a retina screen, small enough to load fast. */
const PHOTO_MAX_WIDTH = 720

export function toPlaceSuggestion(prediction: google.maps.places.PlacePrediction): PlaceSuggestion {
  const main = prediction.mainText ?? prediction.text
  return {
    placeId: prediction.placeId,
    primaryText: main.text,
    secondaryText: prediction.secondaryText?.text ?? '',
    primaryMatches: main.matches.map((m) => ({ start: m.startOffset, end: m.endOffset })),
    types: prediction.types ?? [],
    distanceMeters: prediction.distanceMeters ?? null,
  }
}

/** getURI() returns a plain string, so the photo can live in Redux and localStorage. */
function toPlacePhoto(photo: google.maps.places.Photo | undefined): PlacePhoto | null {
  if (!photo) return null
  try {
    return {
      url: photo.getURI({ maxWidth: PHOTO_MAX_WIDTH }),
      attributions: photo.authorAttributions.map((a) => ({ name: a.displayName, uri: a.uri })),
    }
  } catch {
    return null
  }
}

/** Returns null when Google did not give us a location, because we cannot map it. */
export function toPlaceDetails(place: google.maps.places.Place): PlaceDetails | null {
  if (!place.location) return null
  const viewport = place.viewport?.toJSON() ?? null
  return {
    placeId: place.id,
    name: place.displayName ?? place.formattedAddress ?? 'Unnamed place',
    address: place.formattedAddress ?? '',
    location: { lat: place.location.lat(), lng: place.location.lng() },
    viewport: viewport && {
      north: viewport.north,
      south: viewport.south,
      east: viewport.east,
      west: viewport.west,
    },
    googleMapsUri: place.googleMapsURI ?? null,
    types: place.types ?? [],
    photo: toPlacePhoto(place.photos?.[0]),
  }
}
