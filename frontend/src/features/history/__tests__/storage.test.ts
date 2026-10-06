import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import { makeEntry } from '@/test/fixtures'
import { entryAdded, historyCleared, initialState } from '../slice'
import { HISTORY_STORAGE_KEY, loadHistory } from '../storage'

describe('history persistence', () => {
  it('saga writes history to localStorage after every change', () => {
    const store = setupStore()
    store.dispatch(entryAdded({ query: 'asdfgh', status: 'no-results', place: null }))

    const saved = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({ query: 'asdfgh', status: 'no-results' })

    store.dispatch(historyCleared())
    expect(JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? 'null')).toEqual([])
  })

  it('loads saved entries back', () => {
    const entry = makeEntry({ id: 'a' })
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([entry]))
    expect(loadHistory()).toEqual({ entries: [entry], selectedId: null })
  })

  it('ignores and removes broken data', () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, '{not json')
    expect(loadHistory()).toEqual(initialState)
    expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBeNull()
  })

  it('drops entries with the wrong shape', () => {
    const good = makeEntry({ id: 'good' })
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify([good, { id: 1 }, { ...good, id: 'x', status: 'weird' }]),
    )
    expect(loadHistory().entries).toEqual([good])
  })
})
