import { env } from '@/config/env'
import { copy } from '@/shared/copy'
import type { LatLng, PlaceDetails, PlaceSuggestion } from '@/types/place'
import { ServiceError } from '../serviceError'
import { toPlaceDetails, toPlaceSuggestion } from './mappers'

/**
 * The ONLY file that talks to google.maps.places (Places API New).
 * It receives and returns plain DTOs; Google objects stay private in here.
 */

/** Only the fields we show. Every extra field costs more. */
const PLACE_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'viewport',
  'googleMapsURI',
  'types',
  'photos', // the card's hero image; only the first photo is used
]

/** Bias suggestions to ~50 km around the map focus. */
const BIAS_RADIUS_METERS = 50_000

/**
 * One session token per typing session. Google bills the suggestion requests and the
 * final fetchFields together as one session. The session ends at fetchFields.
 */
let sessionToken: google.maps.places.AutocompleteSessionToken | null = null

/** Latest predictions, so getPlaceDetails can reuse toPlace() and its session token. */
const predictions = new Map<string, google.maps.places.PlacePrediction>()

async function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (typeof google === 'undefined' || !google.maps?.importLibrary) {
    throw new ServiceError(copy.googleRequestFailed)
  }
  return (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary
}

export interface SuggestionOptions {
  /** Prefer places near this point */
  near?: LatLng | null
}

export async function fetchSuggestions(
  input: string,
  { near }: SuggestionOptions = {},
): Promise<PlaceSuggestion[]> {
  const { AutocompleteSuggestion, AutocompleteSessionToken } = await loadPlacesLibrary()
  sessionToken ??= new AutocompleteSessionToken()

  const request: google.maps.places.AutocompleteRequest = { input, sessionToken }
  if (env.regionCodes.length > 0) request.includedRegionCodes = env.regionCodes
  if (near) {
    request.locationBias = { center: near, radius: BIAS_RADIUS_METERS }
    // With an origin, each prediction also carries distanceMeters (no extra cost).
    request.origin = near
  }

  try {
    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
    // Merge, not replace: a late (cancelled) response must not wipe newer predictions.
    const result: PlaceSuggestion[] = []
    for (const { placePrediction } of suggestions) {
      if (!placePrediction) continue
      predictions.set(placePrediction.placeId, placePrediction)
      result.push(toPlaceSuggestion(placePrediction))
    }
    return result
  } catch (error) {
    throw new ServiceError(copy.googleRequestFailed, error)
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const { Place } = await loadPlacesLibrary()
  // Reuse the prediction so its session token is sent; otherwise (e.g. from history) start fresh.
  const prediction = predictions.get(placeId)
  const place = prediction ? prediction.toPlace() : new Place({ id: placeId })

  try {
    await place.fetchFields({ fields: PLACE_FIELDS })
  } catch (error) {
    throw new ServiceError(copy.placeDetailsFailed, error)
  } finally {
    // fetchFields ends the billing session: the next keystroke starts a new one.
    sessionToken = null
    predictions.clear()
  }

  const details = toPlaceDetails(place)
  if (!details) throw new ServiceError(copy.placeDetailsFailed)
  return details
}
