import type { PayloadAction } from '@reduxjs/toolkit'
import type { SagaIterator } from 'redux-saga'
import { delay, put, takeEvery } from 'redux-saga/effects'
import { toastDismissed, toastShown, type Toast } from './slice'

export const TOAST_DURATION_MS = 5000

/** Each toast removes itself after a few seconds. */
export function* autoDismissToast(action: PayloadAction<Toast>): SagaIterator {
  yield delay(TOAST_DURATION_MS)
  yield put(toastDismissed(action.payload.id))
}

export function* uiSaga(): SagaIterator {
  yield takeEvery(toastShown.type, autoDismissToast)
}
