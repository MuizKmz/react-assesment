import type { PayloadAction } from '@reduxjs/toolkit'
import type { SagaIterator } from 'redux-saga'
import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import * as favouritesApi from '@/services/api/favouritesApi'
import { copy } from '@/shared/copy'
import type { Favourite, FavouriteDraft } from '@/types/place'
import { toastShown } from '@/features/ui/slice'
import { selectFavouriteById, selectIsFavouritePending } from './selectors'
import {
  favouriteAdded,
  favouriteRemoved,
  favouriteRolledBack,
  favouriteSyncSucceeded,
  favouriteToggleRequested,
  favouritesLoaded,
  favouritesLoadFailed,
  favouritesLoadRequested,
} from './slice'

export function* loadFavouritesFlow(): SagaIterator {
  try {
    const favourites: Favourite[] = yield call(favouritesApi.listFavourites)
    yield put(favouritesLoaded(favourites))
  } catch {
    yield put(favouritesLoadFailed(copy.backendDown))
  }
}

/**
 * Optimistic toggle: update the store at once, then call the API.
 * On failure, put back exactly what was there before and tell the user.
 */
export function* toggleFavouriteFlow(action: PayloadAction<FavouriteDraft>): SagaIterator {
  const draft = action.payload
  const { placeId } = draft

  // A second click while the first is still saving is ignored.
  const pending: boolean = yield select(selectIsFavouritePending, placeId)
  if (pending) return

  const existing: Favourite | undefined = yield select(selectFavouriteById, placeId)
  try {
    if (existing) {
      yield put(favouriteRemoved(placeId))
      yield call(favouritesApi.removeFavourite, placeId)
      yield put(favouriteSyncSucceeded({ placeId }))
    } else {
      yield put(favouriteAdded({ ...draft, createdAt: new Date().toISOString() }))
      const saved: Favourite = yield call(favouritesApi.saveFavourite, draft)
      yield put(favouriteSyncSucceeded({ placeId, favourite: saved }))
    }
  } catch {
    yield put(favouriteRolledBack({ placeId, previous: existing ?? null }))
    yield put(toastShown({ kind: 'error', message: copy.favouriteToggleFailed }))
  }
}

export function* favouritesSaga(): SagaIterator {
  yield all([
    takeLatest(favouritesLoadRequested.type, loadFavouritesFlow),
    // takeEvery: toggles for different places can run side by side.
    takeEvery(favouriteToggleRequested.type, toggleFavouriteFlow),
  ])
}
