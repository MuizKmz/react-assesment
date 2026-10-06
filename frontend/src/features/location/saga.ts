import type { SagaIterator } from 'redux-saga'
import { call, put, takeLatest } from 'redux-saga/effects'
import * as geolocation from '@/services/browser/geolocation'
import { toUserMessage } from '@/services/serviceError'
import type { LatLng } from '@/types/place'
import { toastShown } from '@/features/ui/slice'
import { locateFailed, locateRequested, locateSucceeded } from './slice'

/** Same pattern as Google or the backend: the saga owns the side effect, not the button. */
export function* locateFlow(): SagaIterator {
  try {
    const position: LatLng = yield call(geolocation.getCurrentPosition)
    yield put(locateSucceeded(position))
  } catch (error) {
    const message = toUserMessage(error, geolocation.LOCATION_UNAVAILABLE)
    yield put(locateFailed(message))
    yield put(toastShown({ kind: 'error', message }))
  }
}

export function* locationSaga(): SagaIterator {
  yield takeLatest(locateRequested.type, locateFlow)
}
