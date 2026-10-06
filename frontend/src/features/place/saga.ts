import type { PayloadAction } from '@reduxjs/toolkit'
import type { SagaIterator } from 'redux-saga'
import { call, put, select, takeLatest } from 'redux-saga/effects'
import * as placesService from '@/services/google/placesService'
import type { Favourite, PlaceDetails } from '@/types/place'
import { favouriteFocused } from '@/features/favourites/slice'
import { selectKnownPlace } from '@/features/history/selectors'
import { selectionRefreshed } from './slice'

/**
 * A favourite is shown at once from what the backend stores (name, address, point).
 * Then we fill in the rest (category, viewport, Maps link, photo):
 *   1. from a past search in history: free, no network;
 *   2. otherwise from Google, once per session (the service caches it).
 * If Google fails, the basic card simply stays; nothing for the user to fix.
 */
export function* enrichFavouriteFlow(action: PayloadAction<Favourite>): SagaIterator {
  const { placeId } = action.payload
  const known: PlaceDetails | null = yield select(selectKnownPlace, placeId)
  if (known) {
    yield put(selectionRefreshed(known))
    return
  }
  try {
    const details: PlaceDetails = yield call(placesService.getPlaceDetails, placeId)
    yield put(selectionRefreshed(details))
  } catch {
    // Keep the basic card.
  }
}

export function* placeSaga(): SagaIterator {
  // takeLatest: clicking another favourite cancels the previous lookup.
  yield takeLatest(favouriteFocused.type, enrichFavouriteFlow)
}
