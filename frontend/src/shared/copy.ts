/** All user-facing text from CLAUDE.md section 6.3, kept in one place. */
export const copy = {
  searchPlaceholder: 'Search for a place, address or landmark',
  noSuggestions: (query: string) =>
    `No places match "${query}". Check the spelling or try a nearby landmark.`,
  googleRequestFailed: "Couldn't reach Google Places. Check your connection and try again.",
  placeDetailsFailed: "Couldn't load that place. Try again.",
  missingKey:
    'Google Maps key missing. Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env.local, then restart npm run dev.',
  keyRejected:
    'Google rejected the API key. Check that Maps JavaScript API and Places API (New) are enabled and the key allows http://localhost:5173.',
  mapsLoadFailed: "Google Maps couldn't load. Check your connection and refresh the page.",
  historyEmpty: 'Your searches will show here.',
  favouritesEmpty: 'Star a place to keep it here.',
  backendDown: 'Favourites are offline right now. Search still works.',
  favouriteToggleFailed: "Couldn't update favourites. Try again.",
  addFavourite: 'Add to favourites',
  removeFavourite: 'Remove from favourites',
  openInGoogleMaps: 'Open in Google Maps',
  retry: 'Retry',
} as const
