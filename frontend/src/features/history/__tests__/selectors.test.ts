import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import { makeEntry, pavilionPlace } from '@/test/fixtures'
import { queryChanged } from '@/features/search/slice'
import { selectHistoryItems } from '../selectors'
import { entrySelected } from '../slice'

describe('selectHistoryItems', () => {
  it('builds display rows: title and selection', () => {
    const found = makeEntry({ id: 'a' })
    const none = makeEntry({ id: 'b', query: 'asdfgh', status: 'no-results', place: null })
    const store = setupStore({ history: { entries: [found, none], selectedId: null } })
    store.dispatch(entrySelected({ id: 'a', place: pavilionPlace }))

    const rows = selectHistoryItems(store.getState())
    expect(rows.map((r) => [r.title, r.isSelected])).toEqual([
      ['Pavilion Kuala Lumpur', true],
      ['asdfgh', false],
    ])
  })

  it('is memoized: typing in the search box does not rebuild the list', () => {
    const store = setupStore({ history: { entries: [makeEntry()], selectedId: null } })
    const before = selectHistoryItems(store.getState())
    store.dispatch(queryChanged('k'))
    expect(selectHistoryItems(store.getState())).toBe(before)
  })
})
