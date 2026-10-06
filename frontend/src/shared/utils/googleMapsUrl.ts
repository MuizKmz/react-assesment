/**
 * Google's documented Maps URL for a place, used when the Places API did not
 * return googleMapsURI (e.g. a favourite loaded from our backend).
 * https://developers.google.com/maps/documentation/urls/get-started#search-action
 */
export function buildGoogleMapsUrl(placeId: string, name: string): string {
  const params = new URLSearchParams({ api: '1', query: name, query_place_id: placeId })
  return `https://www.google.com/maps/search/?${params.toString()}`
}

/** Opens Google Maps directions to the place, from the user's current location. */
export function buildDirectionsUrl(placeId: string, lat: number, lng: number): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${lat},${lng}`,
    destination_place_id: placeId,
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
