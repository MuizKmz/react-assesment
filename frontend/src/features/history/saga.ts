import type { SagaIterator } from 'redux-saga'
import { call, select, takeEvery } from 'redux-saga/effects'
import type { SearchEntry } from '@/types/place'
import { selectHistoryEntries } from './selectors'
import { entryAdded, entryRemoved, historyCleared } from './slice'
import { saveHistory } from './storage'

/** After any change to the list, write it to localStorage. */
export function* persistHistory(): SagaIterator {
  const entries: SearchEntry[] = yield select(selectHistoryEntries)
  yield call(saveHistory, entries)
}

export function* historySaga(): SagaIterator {
  yield takeEvery([entryAdded.type, entryRemoved.type, historyCleared.type], persistHistory)
}
