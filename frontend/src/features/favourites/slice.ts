import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AsyncStatus } from '@/types/async'
import type { Favourite, FavouriteDraft } from '@/types/place'

/** Normalised by placeId, newest first. */
export const favouritesAdapter = createEntityAdapter({
  selectId: (favourite: Favourite) => favourite.placeId,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
})

export const initialState = favouritesAdapter.getInitialState({
  status: 'idle' as AsyncStatus,
  error: null as string | null,
  /** placeIds with a PUT/DELETE in flight */
  pendingIds: [] as string[],
})

export type FavouritesState = typeof initialState

const removePending = (state: FavouritesState, placeId: string) => {
  state.pendingIds = state.pendingIds.filter((id) => id !== placeId)
}

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    favouritesLoadRequested(state) {
      state.status = 'loading'
      state.error = null
    },
    favouritesLoaded(state, action: PayloadAction<Favourite[]>) {
      favouritesAdapter.setAll(state, action.payload)
      state.status = 'succeeded'
    },
    favouritesLoadFailed(state, action: PayloadAction<string>) {
      state.status = 'failed'
      state.error = action.payload
    },

    /** User clicked a star. The saga decides add vs remove. */
    favouriteToggleRequested(_state, _action: PayloadAction<FavouriteDraft>) {},

    /** Optimistic add: shown at once, before the server answers. */
    favouriteAdded(state, action: PayloadAction<Favourite>) {
      favouritesAdapter.addOne(state, action.payload)
      state.pendingIds.push(action.payload.placeId)
    },
    /** Optimistic remove. */
    favouriteRemoved(state, action: PayloadAction<string>) {
      favouritesAdapter.removeOne(state, action.payload)
      state.pendingIds.push(action.payload)
    },
    /** Server confirmed. For an add, store the server copy (real createdAt). */
    favouriteSyncSucceeded(
      state,
      action: PayloadAction<{ placeId: string; favourite?: Favourite }>,
    ) {
      const { placeId, favourite } = action.payload
      if (favourite) favouritesAdapter.upsertOne(state, favourite)
      removePending(state, placeId)
    },
    /** Server failed: undo. `previous` is what was there before the toggle (null = nothing). */
    favouriteRolledBack(
      state,
      action: PayloadAction<{ placeId: string; previous: Favourite | null }>,
    ) {
      const { placeId, previous } = action.payload
      if (previous) favouritesAdapter.addOne(state, previous)
      else favouritesAdapter.removeOne(state, placeId)
      removePending(state, placeId)
    },

    /** Show a favourite on the map. Handled by the place slice. */
    favouriteFocused(_state, _action: PayloadAction<Favourite>) {},
  },
})

export const {
  favouritesLoadRequested,
  favouritesLoaded,
  favouritesLoadFailed,
  favouriteToggleRequested,
  favouriteAdded,
  favouriteRemoved,
  favouriteSyncSucceeded,
  favouriteRolledBack,
  favouriteFocused,
} = favouritesSlice.actions

export default favouritesSlice.reducer
