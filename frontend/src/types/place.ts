/**
 * Plain, serializable DTOs shared across the app.
 * Google objects are converted into these before anything reaches Redux.
 */

export interface LatLng {
  lat: number
  lng: number
}

export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

export interface TextMatch {
  start: number
  end: number
}

export interface PlaceSuggestion {
  placeId: string
  /** e.g. "Pavilion Kuala Lumpur" */
  primaryText: string
  /** e.g. "Jalan Bukit Bintang, Kuala Lumpur" */
  secondaryText: string
  /** Ranges of primaryText that match the query, for bold highlight */
  primaryMatches: TextMatch[]
  /** Google place types, e.g. ["shopping_mall"]; drives the category icon */
  types: string[]
  /** Straight-line distance from the search origin, when Google returns it */
  distanceMeters: number | null
}

export interface PhotoAttribution {
  name: string
  uri: string | null
}

/** First photo of a place. Google requires the author attribution to be shown with it. */
export interface PlacePhoto {
  url: string
  attributions: PhotoAttribution[]
}

export interface PlaceDetails {
  placeId: string
  name: string
  address: string
  location: LatLng
  viewport: Bounds | null
  googleMapsUri: string | null
  types: string[]
  photo: PlacePhoto | null
}

export type SearchStatus = 'found' | 'no-results' | 'error'

export interface SearchEntry {
  /** crypto.randomUUID() */
  id: string
  /** What the user typed */
  query: string
  status: SearchStatus
  place: PlaceDetails | null
  /** ISO string, never a Date object */
  searchedAt: string
}

export interface Favourite {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
  createdAt: string
}

/** What the client sends to save a favourite; the server adds createdAt. */
export type FavouriteDraft = Omit<Favourite, 'createdAt'>
