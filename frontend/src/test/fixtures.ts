import type { Favourite, PlaceDetails, PlaceSuggestion, SearchEntry } from '@/types/place'

export const pavilionSuggestion: PlaceSuggestion = {
  placeId: 'place-pavilion',
  primaryText: 'Pavilion Kuala Lumpur',
  secondaryText: 'Jalan Bukit Bintang, Kuala Lumpur',
  primaryMatches: [{ start: 0, end: 4 }],
  types: ['shopping_mall', 'point_of_interest'],
  distanceMeters: 2400,
}

export const klccSuggestion: PlaceSuggestion = {
  placeId: 'place-klcc',
  primaryText: 'Petronas Twin Towers',
  secondaryText: 'Kuala Lumpur City Centre',
  primaryMatches: [{ start: 0, end: 3 }],
  types: ['tourist_attraction'],
  distanceMeters: null,
}

export const pavilionPlace: PlaceDetails = {
  placeId: 'place-pavilion',
  name: 'Pavilion Kuala Lumpur',
  address: '168 Jalan Bukit Bintang, 55100 Kuala Lumpur',
  location: { lat: 3.149, lng: 101.7133 },
  viewport: { north: 3.151, south: 3.147, east: 101.715, west: 101.711 },
  googleMapsUri: 'https://maps.google.com/?cid=1',
  types: ['shopping_mall'],
  photo: null,
}

export const pavilionFavourite: Favourite = {
  placeId: 'place-pavilion',
  name: 'Pavilion Kuala Lumpur',
  address: '168 Jalan Bukit Bintang, 55100 Kuala Lumpur',
  latitude: 3.149,
  longitude: 101.7133,
  createdAt: '2026-10-06T02:05:00.000Z',
}

export function makeEntry(overrides: Partial<SearchEntry> = {}): SearchEntry {
  return {
    id: overrides.id ?? `entry-${Math.random().toString(36).slice(2)}`,
    query: 'pavi',
    status: 'found',
    place: pavilionPlace,
    searchedAt: '2026-10-06T02:05:00.000Z',
    ...overrides,
  }
}

/** A promise you resolve or reject yourself, to control timing in tests. */
export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
