import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PlaceDetails, SearchEntry, SearchStatus } from '@/types/place'
import { createId } from '@/shared/utils/createId'

export const HISTORY_LIMIT = 100

export interface HistoryState {
  /** Newest first */
  entries: SearchEntry[]
  /** The row whose place is on the map */
  selectedId: string | null
}

export interface EntryInput {
  query: string
  status: SearchStatus
  place: PlaceDetails | null
}

export const initialState: HistoryState = { entries: [], selectedId: null }

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    entryAdded: {
      reducer(state, action: PayloadAction<SearchEntry>) {
        state.entries.unshift(action.payload)
        state.entries.length = Math.min(state.entries.length, HISTORY_LIMIT)
        if (action.payload.status === 'found') state.selectedId = action.payload.id
      },
      // Random id and time are made here, not in the reducer, so the reducer stays pure.
      prepare(input: EntryInput) {
        return {
          payload: { ...input, id: createId(), searchedAt: new Date().toISOString() },
        }
      },
    },
    entryRemoved(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter((entry) => entry.id !== action.payload)
      if (state.selectedId === action.payload) state.selectedId = null
    },
    historyCleared(state) {
      state.entries = []
      state.selectedId = null
    },
    /** Show a stored result again. The place slice reacts too; no Google call is made. */
    entrySelected(state, action: PayloadAction<{ id: string; place: PlaceDetails }>) {
      state.selectedId = action.payload.id
    },
  },
})

export const { entryAdded, entryRemoved, historyCleared, entrySelected } = historySlice.actions

export default historySlice.reducer
