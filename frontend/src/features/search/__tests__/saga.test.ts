import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setupStore } from '@/app/store'
import * as placesService from '@/services/google/placesService'
import { ServiceError } from '@/services/serviceError'
import { copy } from '@/shared/copy'
import { deferred, klccSuggestion, pavilionPlace, pavilionSuggestion } from '@/test/fixtures'
import type { PlaceSuggestion } from '@/types/place'
import { DEBOUNCE_MS } from '../constants'
import { initialState, queryChanged, searchSubmitted, suggestionChosen } from '../slice'

vi.mock('@/services/google/placesService')
const fetchSuggestions = vi.mocked(placesService.fetchSuggestions)
const getPlaceDetails = vi.mocked(placesService.getPlaceDetails)

describe('search saga: typing (debounce + cancel)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('debounces: only the last query within 300 ms reaches Google', async () => {
    fetchSuggestions.mockResolvedValue([pavilionSuggestion])
    const store = setupStore()

    store.dispatch(queryChanged('pa'))
    await vi.advanceTimersByTimeAsync(100)
    store.dispatch(queryChanged('pav'))
    await vi.advanceTimersByTimeAsync(100)
    store.dispatch(queryChanged('pavi'))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    expect(fetchSuggestions).toHaveBeenCalledTimes(1)
    expect(fetchSuggestions).toHaveBeenCalledWith('pavi', expect.anything())
    expect(store.getState().search.suggestions).toEqual([pavilionSuggestion])
  })

  it('a slow, older response never overwrites a newer one', async () => {
    const older = deferred<PlaceSuggestion[]>()
    const newer = deferred<PlaceSuggestion[]>()
    fetchSuggestions.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise)
    const store = setupStore()

    store.dispatch(queryChanged('pet'))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS) // request 1 in flight
    store.dispatch(queryChanged('petronas'))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS) // request 2 in flight, request 1 cancelled

    newer.resolve([klccSuggestion])
    await vi.advanceTimersByTimeAsync(0)
    older.resolve([pavilionSuggestion]) // arrives late
    await vi.advanceTimersByTimeAsync(0)

    expect(fetchSuggestions).toHaveBeenCalledTimes(2)
    expect(store.getState().search.suggestions).toEqual([klccSuggestion])
  })

  it('fewer than 2 characters: no request, list cleared', async () => {
    const store = setupStore()
    store.dispatch(queryChanged('p'))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    expect(fetchSuggestions).not.toHaveBeenCalled()
    expect(store.getState().search).toMatchObject({
      suggestions: [],
      isOpen: false,
      status: 'idle',
    })
  })

  it('shows a friendly message when Google fails', async () => {
    fetchSuggestions.mockRejectedValue(new ServiceError(copy.googleRequestFailed))
    const store = setupStore()
    store.dispatch(queryChanged('pavi'))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    expect(store.getState().search).toMatchObject({
      status: 'failed',
      error: copy.googleRequestFailed,
    })
  })

  it('never leaks a raw error message to the UI', async () => {
    fetchSuggestions.mockRejectedValue(new Error('INVALID_REQUEST: raw google text'))
    const store = setupStore()
    store.dispatch(queryChanged('pavi'))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    expect(store.getState().search.error).toBe(copy.googleRequestFailed)
  })
})

describe('search saga: choosing and submitting', () => {
  afterEach(() => vi.resetAllMocks())

  const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

  it('chosen: loads details, shows the place, adds a "found" history entry', async () => {
    getPlaceDetails.mockResolvedValue(pavilionPlace)
    const store = setupStore()

    store.dispatch(
      suggestionChosen({
        placeId: 'place-pavilion',
        query: 'pavi',
        label: 'Pavilion Kuala Lumpur',
      }),
    )
    await settle()

    const state = store.getState()
    expect(getPlaceDetails).toHaveBeenCalledWith('place-pavilion')
    expect(state.place).toMatchObject({ selected: pavilionPlace, status: 'succeeded' })
    expect(state.history.entries[0]).toMatchObject({
      query: 'pavi',
      status: 'found',
      place: pavilionPlace,
    })
  })

  it('chosen but details fail: records an "error" entry and shows a toast', async () => {
    getPlaceDetails.mockRejectedValue(new Error('boom'))
    const store = setupStore()

    store.dispatch(suggestionChosen({ placeId: 'x', query: 'pavi', label: 'Pavilion' }))
    await settle()

    const state = store.getState()
    expect(state.place.status).toBe('failed')
    expect(state.history.entries[0]).toMatchObject({ status: 'error', place: null })
    expect(state.ui.toasts).toHaveLength(1)
  })

  it('submitted with no suggestions: records "no-results" and keeps the message open', async () => {
    fetchSuggestions.mockResolvedValue([])
    const store = setupStore()

    store.dispatch(searchSubmitted('asdfgh'))
    await settle()

    const state = store.getState()
    expect(getPlaceDetails).not.toHaveBeenCalled()
    expect(state.history.entries[0]).toMatchObject({
      query: 'asdfgh',
      status: 'no-results',
      place: null,
    })
    expect(state.search).toMatchObject({ isOpen: true, suggestions: [] })
  })

  it('submitted with suggestions on screen: picks the first one', async () => {
    getPlaceDetails.mockResolvedValue(pavilionPlace)
    const store = setupStore({
      search: {
        ...initialState,
        query: 'pavi',
        status: 'succeeded',
        suggestions: [pavilionSuggestion, klccSuggestion],
      },
    })

    store.dispatch(searchSubmitted('pavi'))
    await settle()

    expect(fetchSuggestions).not.toHaveBeenCalled()
    expect(getPlaceDetails).toHaveBeenCalledWith('place-pavilion')
    expect(store.getState().history.entries[0]).toMatchObject({ query: 'pavi', status: 'found' })
  })
})
