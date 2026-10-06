import { describe, expect, it } from 'vitest'
import { pavilionFavourite } from '@/test/fixtures'
import reducer, {
  favouriteAdded,
  favouriteRemoved,
  favouriteRolledBack,
  favouritesLoaded,
  favouritesLoadFailed,
  favouriteSyncSucceeded,
  initialState,
} from '../slice'

const older = { ...pavilionFavourite, placeId: 'older', createdAt: '2026-01-01T00:00:00.000Z' }

describe('favourites slice', () => {
  it('loads and sorts newest first', () => {
    const state = reducer(initialState, favouritesLoaded([older, pavilionFavourite]))
    expect(state.ids).toEqual(['place-pavilion', 'older'])
    expect(state.status).toBe('succeeded')
  })

  it('records a load failure', () => {
    expect(reducer(initialState, favouritesLoadFailed('offline'))).toMatchObject({
      status: 'failed',
      error: 'offline',
    })
  })

  it('optimistic add marks the place pending until the server confirms', () => {
    let state = reducer(initialState, favouriteAdded(pavilionFavourite))
    expect(state.entities['place-pavilion']).toEqual(pavilionFavourite)
    expect(state.pendingIds).toEqual(['place-pavilion'])

    const fromServer = { ...pavilionFavourite, createdAt: '2026-10-06T02:05:01.000Z' }
    state = reducer(
      state,
      favouriteSyncSucceeded({ placeId: 'place-pavilion', favourite: fromServer }),
    )
    expect(state.entities['place-pavilion']).toEqual(fromServer)
    expect(state.pendingIds).toEqual([])
  })

  it('rolls back a failed add', () => {
    let state = reducer(initialState, favouriteAdded(pavilionFavourite))
    state = reducer(state, favouriteRolledBack({ placeId: 'place-pavilion', previous: null }))
    expect(state.ids).toEqual([])
    expect(state.pendingIds).toEqual([])
  })

  it('rolls back a failed remove', () => {
    let state = reducer(initialState, favouritesLoaded([pavilionFavourite]))
    state = reducer(state, favouriteRemoved('place-pavilion'))
    expect(state.ids).toEqual([])

    state = reducer(
      state,
      favouriteRolledBack({ placeId: 'place-pavilion', previous: pavilionFavourite }),
    )
    expect(state.entities['place-pavilion']).toEqual(pavilionFavourite)
    expect(state.pendingIds).toEqual([])
  })
})
