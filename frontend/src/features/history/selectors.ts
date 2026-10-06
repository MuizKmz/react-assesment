import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/rootReducer'
import { selectSelectedPlace } from '@/features/place/selectors'
import type { SearchEntry } from '@/types/place'

export const selectHistoryEntries = (state: RootState) => state.history.entries
export const selectHistoryCount = (state: RootState) => state.history.entries.length
export const selectSelectedHistoryId = (state: RootState) => state.history.selectedId

export interface HistoryItem extends SearchEntry {
  /** Place name when found, otherwise the text the user typed */
  title: string
  /** This row's place is the one on the map */
  isSelected: boolean
}

/**
 * Rows ready for display. Memoized: recomputed only when entries, the selected row
 * or the place on the map change, so the list does not re-render on every keystroke.
 */
export const selectHistoryItems = createSelector(
  [selectHistoryEntries, selectSelectedHistoryId, selectSelectedPlace],
  (entries, selectedId, selectedPlace): HistoryItem[] =>
    entries.map((entry) => ({
      ...entry,
      title: entry.place?.name ?? entry.query,
      isSelected:
        entry.id === selectedId &&
        entry.place !== null &&
        entry.place.placeId === selectedPlace?.placeId,
    })),
)
