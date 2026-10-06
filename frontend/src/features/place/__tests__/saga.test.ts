import { afterEach, describe, expect, it, vi } from 'vitest'
import { setupStore } from '@/app/store'
import * as placesService from '@/services/google/placesService'
import { makeEntry, pavilionFavourite, pavilionPlace } from '@/test/fixtures'
import { favouriteFocused } from '@/features/favourites/slice'
import { selectionRefreshed } from '../slice'

vi.mock('@/services/google/placesService')
vi.mock('@/services/api/favouritesApi')
const getPlaceDetails = vi.mocked(placesService.getPlaceDetails)

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('place saga: showing a favourite', () => {
  afterEach(() => vi.resetAllMocks())

  it('shows the favourite at once, with the basic stored data', () => {
    getPlaceDetails.mockReturnValue(new Promise(() => {})) // never answers
    const store = setupStore()

    store.dispatch(favouriteFocused(pavilionFavourite))

    expect(store.getState().place.selected).toMatchObject({
      placeId: 'place-pavilion',
      name: 'Pavilion Kuala Lumpur',
      types: [],
    })
  })

  it('fills in details from a past search, with no Google call', async () => {
    const store = setupStore({
      history: { entries: [makeEntry({ place: pavilionPlace })], selectedId: null },
    })

    store.dispatch(favouriteFocused(pavilionFavourite))
    await settle()

    expect(getPlaceDetails).not.toHaveBeenCalled()
    expect(store.getState().place.selected).toEqual(pavilionPlace)
  })

  it('otherwise asks Google once and fills in category, viewport and link', async () => {
    getPlaceDetails.mockResolvedValue(pavilionPlace)
    const store = setupStore()

    store.dispatch(favouriteFocused(pavilionFavourite))
    await settle()

    expect(getPlaceDetails).toHaveBeenCalledWith('place-pavilion')
    expect(store.getState().place.selected?.types).toEqual(['shopping_mall'])
  })

  it('keeps the basic card if Google fails', async () => {
    getPlaceDetails.mockRejectedValue(new Error('offline'))
    const store = setupStore()

    store.dispatch(favouriteFocused(pavilionFavourite))
    await settle()

    expect(store.getState().place.selected).toMatchObject({ name: 'Pavilion Kuala Lumpur' })
    expect(store.getState().ui.toasts).toHaveLength(0)
  })

  it('ignores late details for a place the user already left', () => {
    const store = setupStore()
    store.dispatch(favouriteFocused({ ...pavilionFavourite, placeId: 'other', name: 'Other' }))

    store.dispatch(selectionRefreshed(pavilionPlace))

    expect(store.getState().place.selected?.name).toBe('Other')
  })
})
