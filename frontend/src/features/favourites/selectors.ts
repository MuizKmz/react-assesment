import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/rootReducer'
import { favouritesAdapter } from './slice'

const adapterSelectors = favouritesAdapter.getSelectors((state: RootState) => state.favourites)

/** Newest first (the adapter's sortComparer). */
export const selectAllFavourites = adapterSelectors.selectAll
export const selectFavouriteById = adapterSelectors.selectById
export const selectFavouriteCount = adapterSelectors.selectTotal

export const selectFavouritesStatus = (state: RootState) => state.favourites.status
export const selectFavouritesError = (state: RootState) => state.favourites.error
export const selectPendingIds = (state: RootState) => state.favourites.pendingIds

export const selectIsFavourite = (state: RootState, placeId: string) =>
  placeId in state.favourites.entities

/** Memoized Set, so "is this pending?" is O(1) and stable between renders. */
const selectPendingSet = createSelector([selectPendingIds], (ids) => new Set(ids))

export const selectIsFavouritePending = (state: RootState, placeId: string) =>
  selectPendingSet(state).has(placeId)
