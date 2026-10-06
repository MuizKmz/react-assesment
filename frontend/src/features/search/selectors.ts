import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/rootReducer'

export const selectSearch = (state: RootState) => state.search
export const selectQuery = (state: RootState) => state.search.query
export const selectSuggestions = (state: RootState) => state.search.suggestions
export const selectSearchStatus = (state: RootState) => state.search.status
export const selectSearchError = (state: RootState) => state.search.error
export const selectActiveIndex = (state: RootState) => state.search.activeIndex

/** The highlighted suggestion, or null. */
export const selectActiveSuggestion = createSelector(
  [selectSuggestions, selectActiveIndex],
  (suggestions, index) => suggestions[index] ?? null,
)
