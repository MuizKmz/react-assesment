import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AsyncStatus } from '@/types/async'
import type { PlaceSuggestion } from '@/types/place'
import { MIN_QUERY_LENGTH } from './constants'

export interface SearchState {
  query: string
  suggestions: PlaceSuggestion[]
  status: AsyncStatus
  error: string | null
  isOpen: boolean
  /** -1 means no suggestion is highlighted */
  activeIndex: number
}

export interface SuggestionChosenPayload {
  placeId: string
  /** What the user typed (stored in history) */
  query: string
  /** Text to put in the input after choosing */
  label: string
}

export const initialState: SearchState = {
  query: '',
  suggestions: [],
  status: 'idle',
  error: null,
  isOpen: false,
  activeIndex: -1,
}

const isSearchable = (query: string) => query.trim().length >= MIN_QUERY_LENGTH

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    /** Every keystroke. The saga debounces it. */
    queryChanged(state, action: PayloadAction<string>) {
      state.query = action.payload
      state.activeIndex = -1
      state.error = null
      if (isSearchable(action.payload)) {
        // Show the spinner straight away, during the debounce too.
        state.status = 'loading'
        state.isOpen = true
      } else {
        state.status = 'idle'
        state.suggestions = []
        state.isOpen = false
      }
    },
    suggestionsReceived(state, action: PayloadAction<PlaceSuggestion[]>) {
      state.suggestions = action.payload
      state.status = 'succeeded'
      state.activeIndex = -1
    },
    suggestionsFailed(state, action: PayloadAction<string>) {
      state.suggestions = []
      state.status = 'failed'
      state.error = action.payload
    },
    suggestionsCleared(state) {
      state.suggestions = []
      state.status = 'idle'
      state.error = null
      state.isOpen = false
      state.activeIndex = -1
    },
    activeIndexChanged(state, action: PayloadAction<number>) {
      state.activeIndex = action.payload
    },
    dropdownOpened(state) {
      if (isSearchable(state.query)) state.isOpen = true
    },
    dropdownClosed(state) {
      state.isOpen = false
      state.activeIndex = -1
    },
    /** User picked a suggestion (click or Enter on a highlighted row). */
    suggestionChosen(state, action: PayloadAction<SuggestionChosenPayload>) {
      state.query = action.payload.label
      state.isOpen = false
      state.activeIndex = -1
      // The old list belongs to the old text; drop it so Enter searches the new text.
      state.suggestions = []
      state.status = 'idle'
    },
    /** Enter with nothing highlighted. The saga decides what it means. */
    searchSubmitted(state, _action: PayloadAction<string>) {
      state.activeIndex = -1
    },
    /** Submitted, and Google has nothing for it. Keep the dropdown open to say so. */
    noResultsFound(state, action: PayloadAction<string>) {
      state.query = action.payload
      state.suggestions = []
      state.status = 'succeeded'
      state.isOpen = true
    },
    searchCleared() {
      return initialState
    },
  },
})

export const {
  queryChanged,
  suggestionsReceived,
  suggestionsFailed,
  suggestionsCleared,
  activeIndexChanged,
  dropdownOpened,
  dropdownClosed,
  suggestionChosen,
  searchSubmitted,
  noResultsFound,
  searchCleared,
} = searchSlice.actions

export default searchSlice.reducer
