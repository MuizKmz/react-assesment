import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AsyncStatus } from '@/types/async'
import type { LatLng } from '@/types/place'

export interface LocationState {
  /** The user's position, once they allow it */
  position: LatLng | null
  status: AsyncStatus
  error: string | null
}

export const initialState: LocationState = { position: null, status: 'idle', error: null }

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    locateRequested(state) {
      state.status = 'loading'
      state.error = null
    },
    locateSucceeded(state, action: PayloadAction<LatLng>) {
      state.position = action.payload
      state.status = 'succeeded'
    },
    locateFailed(state, action: PayloadAction<string>) {
      state.status = 'failed'
      state.error = action.payload
    },
  },
})

export const { locateRequested, locateSucceeded, locateFailed } = locationSlice.actions

export default locationSlice.reducer
