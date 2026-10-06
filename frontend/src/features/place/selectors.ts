import type { RootState } from '@/app/rootReducer'

export const selectSelectedPlace = (state: RootState) => state.place.selected
export const selectPlaceStatus = (state: RootState) => state.place.status
export const selectPlaceError = (state: RootState) => state.place.error

/**
 * Where to bias new suggestions (and measure their distance from):
 * the user's position if they shared it, otherwise the place on the map.
 */
export const selectBiasLocation = (state: RootState) =>
  state.location.position ?? state.place.selected?.location ?? null
