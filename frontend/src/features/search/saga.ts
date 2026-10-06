import type { PayloadAction, UnknownAction } from '@reduxjs/toolkit'
import type { SagaIterator } from 'redux-saga'
import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects'
import { env } from '@/config/env'
import * as placesService from '@/services/google/placesService'
import { toUserMessage } from '@/services/serviceError'
import { copy } from '@/shared/copy'
import type { AsyncStatus } from '@/types/async'
import type { LatLng, PlaceDetails, PlaceSuggestion } from '@/types/place'
import { entryAdded } from '@/features/history/slice'
import { selectBiasLocation } from '@/features/place/selectors'
import { selectionFailed, selectionStarted, selectionSucceeded } from '@/features/place/slice'
import { toastShown } from '@/features/ui/slice'
import { DEBOUNCE_MS, MIN_QUERY_LENGTH } from './constants'
import { selectSearchStatus, selectSuggestions } from './selectors'
import {
  noResultsFound,
  queryChanged,
  searchCleared,
  searchSubmitted,
  suggestionChosen,
  suggestionsCleared,
  suggestionsFailed,
  suggestionsReceived,
  type SuggestionChosenPayload,
} from './slice'

function* fetchSuggestionsNear(query: string): SagaIterator<PlaceSuggestion[]> {
  const near: LatLng | null = yield select(selectBiasLocation)
  return yield call(placesService.fetchSuggestions, query, { near: near ?? env.defaultCenter })
}

/**
 * Debounced suggestions.
 * takeLatest cancels the previous run whenever a new watched action arrives, so:
 *  - while the user keeps typing, the run is cancelled inside delay() -> debounce;
 *  - if a request is already in flight, it is cancelled too, so an old response
 *    can never overwrite a newer one.
 * Choosing, submitting or clearing also cancel a pending fetch; that is all they do here.
 */
export function* fetchSuggestionsFlow(action: UnknownAction): SagaIterator {
  if (!queryChanged.match(action)) return

  yield delay(DEBOUNCE_MS)
  const query = action.payload.trim()
  if (query.length < MIN_QUERY_LENGTH) {
    yield put(suggestionsCleared())
    return
  }
  try {
    const suggestions: PlaceSuggestion[] = yield call(fetchSuggestionsNear, query)
    yield put(suggestionsReceived(suggestions))
  } catch (error) {
    yield put(suggestionsFailed(toUserMessage(error, copy.googleRequestFailed)))
  }
}

/** A suggestion was chosen: load its details, show it, record the attempt. */
export function* chooseSuggestionFlow(
  action: PayloadAction<SuggestionChosenPayload>,
): SagaIterator {
  const { placeId, query } = action.payload
  yield put(selectionStarted())
  try {
    const place: PlaceDetails = yield call(placesService.getPlaceDetails, placeId)
    yield put(selectionSucceeded(place))
    yield put(entryAdded({ query, status: 'found', place }))
  } catch (error) {
    const message = toUserMessage(error, copy.placeDetailsFailed)
    yield put(selectionFailed(message))
    yield put(entryAdded({ query, status: 'error', place: null }))
    yield put(toastShown({ kind: 'error', message }))
  }
}

/** Enter with nothing highlighted: take the first suggestion, or record "no results". */
export function* submitSearchFlow(action: PayloadAction<string>): SagaIterator {
  const query = action.payload.trim()
  if (query.length < MIN_QUERY_LENGTH) return

  const status: AsyncStatus = yield select(selectSearchStatus)
  let suggestions: PlaceSuggestion[] = yield select(selectSuggestions)

  // Enter pressed during the debounce (list is stale or missing): ask Google now.
  if (status !== 'succeeded') {
    try {
      suggestions = yield call(fetchSuggestionsNear, query)
    } catch (error) {
      yield put(suggestionsFailed(toUserMessage(error, copy.googleRequestFailed)))
      yield put(entryAdded({ query, status: 'error', place: null }))
      return
    }
  }

  const [first] = suggestions
  if (first) {
    yield put(suggestionChosen({ placeId: first.placeId, query, label: first.primaryText }))
  } else {
    yield put(noResultsFound(action.payload))
    yield put(entryAdded({ query, status: 'no-results', place: null }))
  }
}

export function* searchSaga(): SagaIterator {
  yield all([
    takeLatest(
      [queryChanged.type, suggestionChosen.type, searchSubmitted.type, searchCleared.type],
      fetchSuggestionsFlow,
    ),
    takeLatest(suggestionChosen.type, chooseSuggestionFlow),
    takeLatest(searchSubmitted.type, submitSearchFlow),
  ])
}
