import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { loadHistory } from '@/features/history/storage'
import { rootReducer, type RootState } from './rootReducer'
import rootSaga from './rootSaga'

/**
 * Builds a store. Tests call this to get a fresh store with their own state.
 * Redux-Saga is the ONLY middleware: RTK's built-in thunk is switched off.
 * The serializable and immutability checks stay on (dev only).
 */
export function setupStore(preloadedState?: Partial<RootState>) {
  const sagaMiddleware = createSagaMiddleware()
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  })
  sagaMiddleware.run(rootSaga)
  return store
}

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
export type { RootState }

/** The app's store, with saved search history loaded from localStorage. */
export const store = setupStore({ history: loadHistory() })
