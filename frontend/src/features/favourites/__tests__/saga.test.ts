import { afterEach, describe, expect, it, vi } from 'vitest'
import { setupStore } from '@/app/store'
import * as favouritesApi from '@/services/api/favouritesApi'
import { HttpError } from '@/services/api/httpClient'
import { copy } from '@/shared/copy'
import { deferred, pavilionFavourite } from '@/test/fixtures'
import type { Favourite, FavouriteDraft } from '@/types/place'
import { selectIsFavourite } from '../selectors'
import { favouritesLoaded, favouritesLoadRequested, favouriteToggleRequested } from '../slice'

vi.mock('@/services/api/favouritesApi')
const api = vi.mocked(favouritesApi)

const pavilionDraft: FavouriteDraft = {
  placeId: pavilionFavourite.placeId,
  name: pavilionFavourite.name,
  address: pavilionFavourite.address,
  latitude: pavilionFavourite.latitude,
  longitude: pavilionFavourite.longitude,
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('favourites saga', () => {
  afterEach(() => vi.resetAllMocks())

  it('loads favourites on request', async () => {
    api.listFavourites.mockResolvedValue([pavilionFavourite])
    const store = setupStore()
    store.dispatch(favouritesLoadRequested())
    await settle()
    expect(store.getState().favourites.ids).toEqual(['place-pavilion'])
  })

  it('shows the offline message when the backend is down', async () => {
    api.listFavourites.mockRejectedValue(new HttpError(0, 'Network error'))
    const store = setupStore()
    store.dispatch(favouritesLoadRequested())
    await settle()
    expect(store.getState().favourites).toMatchObject({ status: 'failed', error: copy.backendDown })
  })

  it('add: star shows at once, then the server copy replaces it', async () => {
    const saving = deferred<Favourite>()
    api.saveFavourite.mockReturnValue(saving.promise)
    const store = setupStore()

    store.dispatch(favouriteToggleRequested(pavilionDraft))
    // Optimistic: already a favourite before the server answers.
    expect(selectIsFavourite(store.getState(), 'place-pavilion')).toBe(true)
    expect(store.getState().favourites.pendingIds).toEqual(['place-pavilion'])

    saving.resolve(pavilionFavourite)
    await settle()
    expect(api.saveFavourite).toHaveBeenCalledWith(pavilionDraft)
    expect(store.getState().favourites.entities['place-pavilion']).toEqual(pavilionFavourite)
    expect(store.getState().favourites.pendingIds).toEqual([])
  })

  it('add fails: rolls back and shows a toast', async () => {
    api.saveFavourite.mockRejectedValue(new HttpError(500, 'Server error'))
    const store = setupStore()

    store.dispatch(favouriteToggleRequested(pavilionDraft))
    await settle()

    const state = store.getState()
    expect(selectIsFavourite(state, 'place-pavilion')).toBe(false)
    expect(state.favourites.pendingIds).toEqual([])
    expect(state.ui.toasts[0]).toMatchObject({ kind: 'error', message: copy.favouriteToggleFailed })
  })

  it('remove fails: the favourite comes back', async () => {
    api.removeFavourite.mockRejectedValue(new HttpError(0, 'Network error'))
    const store = setupStore()
    store.dispatch(favouritesLoaded([pavilionFavourite]))

    store.dispatch(favouriteToggleRequested(pavilionDraft))
    expect(selectIsFavourite(store.getState(), 'place-pavilion')).toBe(false)
    await settle()

    expect(store.getState().favourites.entities['place-pavilion']).toEqual(pavilionFavourite)
  })

  it('ignores a second click while the first is still saving', async () => {
    const saving = deferred<Favourite>()
    api.saveFavourite.mockReturnValue(saving.promise)
    const store = setupStore()

    store.dispatch(favouriteToggleRequested(pavilionDraft))
    store.dispatch(favouriteToggleRequested(pavilionDraft))
    saving.resolve(pavilionFavourite)
    await settle()

    expect(api.saveFavourite).toHaveBeenCalledTimes(1)
    expect(api.removeFavourite).not.toHaveBeenCalled()
    expect(selectIsFavourite(store.getState(), 'place-pavilion')).toBe(true)
  })
})
