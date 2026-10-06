import { afterEach, describe, expect, it, vi } from 'vitest'
import { setupStore } from '@/app/store'
import * as geolocation from '@/services/browser/geolocation'
import { ServiceError } from '@/services/serviceError'
import * as placesService from '@/services/google/placesService'
import { DEBOUNCE_MS } from '@/features/search/constants'
import { queryChanged } from '@/features/search/slice'
import { locateRequested } from '../slice'

vi.mock('@/services/browser/geolocation', async (importOriginal) => ({
  ...(await importOriginal<typeof geolocation>()),
  getCurrentPosition: vi.fn(),
}))
vi.mock('@/services/google/placesService')

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))
const ME = { lat: 3.0738, lng: 101.5183 } // Shah Alam

describe('location saga', () => {
  afterEach(() => vi.resetAllMocks())

  it('stores the position when the user allows it', async () => {
    vi.mocked(geolocation.getCurrentPosition).mockResolvedValue(ME)
    const store = setupStore()

    store.dispatch(locateRequested())
    expect(store.getState().location.status).toBe('loading')
    await settle()

    expect(store.getState().location).toMatchObject({ position: ME, status: 'succeeded' })
  })

  it('explains a blocked permission in a toast', async () => {
    vi.mocked(geolocation.getCurrentPosition).mockRejectedValue(
      new ServiceError(geolocation.LOCATION_DENIED),
    )
    const store = setupStore()

    store.dispatch(locateRequested())
    await settle()

    const state = store.getState()
    expect(state.location).toMatchObject({ status: 'failed', error: geolocation.LOCATION_DENIED })
    expect(state.ui.toasts[0]).toMatchObject({
      kind: 'error',
      message: geolocation.LOCATION_DENIED,
    })
  })

  it('once located, suggestions are biased around the user', async () => {
    vi.useFakeTimers()
    try {
      vi.mocked(geolocation.getCurrentPosition).mockResolvedValue(ME)
      vi.mocked(placesService.fetchSuggestions).mockResolvedValue([])
      const store = setupStore()

      store.dispatch(locateRequested())
      await vi.advanceTimersByTimeAsync(0)
      store.dispatch(queryChanged('mall'))
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

      expect(placesService.fetchSuggestions).toHaveBeenCalledWith('mall', { near: ME })
    } finally {
      vi.useRealTimers()
    }
  })
})
