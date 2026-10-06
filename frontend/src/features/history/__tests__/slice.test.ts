import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import { makeEntry, pavilionPlace } from '@/test/fixtures'
import reducer, {
  entryAdded,
  entryRemoved,
  entrySelected,
  historyCleared,
  HISTORY_LIMIT,
  initialState,
} from '../slice'

describe('history slice', () => {
  it('adds entries newest first, with an id and ISO time', () => {
    let state = reducer(
      initialState,
      entryAdded({ query: 'one', status: 'no-results', place: null }),
    )
    state = reducer(state, entryAdded({ query: 'two', status: 'found', place: pavilionPlace }))

    expect(state.entries.map((e) => e.query)).toEqual(['two', 'one'])
    expect(state.entries[0].id).toEqual(expect.any(String))
    expect(new Date(state.entries[0].searchedAt).toISOString()).toBe(state.entries[0].searchedAt)
  })

  it(`keeps at most ${HISTORY_LIMIT} entries, dropping the oldest`, () => {
    const full = {
      ...initialState,
      entries: Array.from({ length: HISTORY_LIMIT }, (_, i) => makeEntry({ id: `e${i}` })),
    }
    const state = reducer(full, entryAdded({ query: 'newest', status: 'error', place: null }))

    expect(state.entries).toHaveLength(HISTORY_LIMIT)
    expect(state.entries[0].query).toBe('newest')
    expect(state.entries.at(-1)?.id).toBe(`e${HISTORY_LIMIT - 2}`)
  })

  it('selects a found entry automatically', () => {
    const state = reducer(
      initialState,
      entryAdded({ query: 'pavi', status: 'found', place: pavilionPlace }),
    )
    expect(state.selectedId).toBe(state.entries[0].id)
  })

  it('removes one entry and clears all', () => {
    const a = makeEntry({ id: 'a' })
    const b = makeEntry({ id: 'b' })
    const state = { entries: [a, b], selectedId: 'a' }

    expect(reducer(state, entryRemoved('a'))).toEqual({ entries: [b], selectedId: null })
    expect(reducer(state, historyCleared())).toEqual(initialState)
  })

  it('entrySelected shows the stored place without any service call', () => {
    const entry = makeEntry({ id: 'a' })
    const store = setupStore({ history: { entries: [entry], selectedId: null } })

    store.dispatch(entrySelected({ id: 'a', place: pavilionPlace }))

    expect(store.getState().history.selectedId).toBe('a')
    expect(store.getState().place.selected).toEqual(pavilionPlace)
  })
})
