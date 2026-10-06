import type { SagaIterator } from 'redux-saga'
import { all, fork } from 'redux-saga/effects'
import { searchSaga } from '@/features/search/saga'
import { historySaga } from '@/features/history/saga'
import { favouritesSaga } from '@/features/favourites/saga'
import { uiSaga } from '@/features/ui/saga'

/** Starts every feature's watcher. A new feature adds one line here. */
export default function* rootSaga(): SagaIterator {
  yield all([fork(searchSaga), fork(historySaga), fork(favouritesSaga), fork(uiSaga)])
}
