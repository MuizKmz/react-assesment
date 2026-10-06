import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AsyncStatus } from '@/types/async'
import type { PlaceDetails } from '@/types/place'
import { entrySelected } from '@/features/history/slice'
import { favouriteFocused } from '@/features/favourites/slice'

export interface PlaceState {
  /** The place on the map and in the card */
  selected: PlaceDetails | null
  status: AsyncStatus
  error: string | null
}

export const initialState: PlaceState = { selected: null, status: 'idle', error: null }

const placeSlice = createSlice({
  name: 'place',
  initialState,
  reducers: {
    selectionStarted(state) {
      state.status = 'loading'
      state.error = null
    },
    selectionSucceeded(state, action: PayloadAction<PlaceDetails>) {
      state.selected = action.payload
      state.status = 'succeeded'
    },
    selectionFailed(state, action: PayloadAction<string>) {
      state.status = 'failed'
      state.error = action.payload
    },
    selectionCleared() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      // Reuse the stored result: no Google call.
      .addCase(entrySelected, (state, action) => {
        state.selected = action.payload.place
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(favouriteFocused, (state, { payload: fav }) => {
        state.selected = {
          placeId: fav.placeId,
          name: fav.name,
          address: fav.address,
          location: { lat: fav.latitude, lng: fav.longitude },
          viewport: null,
          googleMapsUri: null,
          types: [],
        }
        state.status = 'succeeded'
        state.error = null
      })
  },
})

export const { selectionStarted, selectionSucceeded, selectionFailed, selectionCleared } =
  placeSlice.actions

export default placeSlice.reducer
