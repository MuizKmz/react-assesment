import { describe, expect, it } from 'vitest'
import { pavilionSuggestion } from '@/test/fixtures'
import reducer, {
  dropdownClosed,
  initialState,
  noResultsFound,
  queryChanged,
  searchCleared,
  suggestionChosen,
  suggestionsFailed,
  suggestionsReceived,
} from '../slice'

describe('search slice', () => {
  it('opens and shows loading as soon as the query is long enough', () => {
    const state = reducer(initialState, queryChanged('pa'))
    expect(state).toMatchObject({ query: 'pa', status: 'loading', isOpen: true })
  })

  it('stays closed and idle under 2 characters', () => {
    const withList = { ...initialState, suggestions: [pavilionSuggestion], isOpen: true }
    const state = reducer(withList, queryChanged('p'))
    expect(state).toMatchObject({ status: 'idle', isOpen: false, suggestions: [] })
  })

  it('stores received suggestions and resets the highlight', () => {
    const state = reducer(
      { ...initialState, activeIndex: 2 },
      suggestionsReceived([pavilionSuggestion]),
    )
    expect(state).toMatchObject({ status: 'succeeded', activeIndex: -1 })
    expect(state.suggestions).toEqual([pavilionSuggestion])
  })

  it('stores a friendly error on failure', () => {
    const state = reducer(initialState, suggestionsFailed('Nope'))
    expect(state).toMatchObject({ status: 'failed', error: 'Nope', suggestions: [] })
  })

  it('puts the chosen label in the input and closes the list', () => {
    const open = {
      ...initialState,
      isOpen: true,
      activeIndex: 0,
      suggestions: [pavilionSuggestion],
    }
    const state = reducer(
      open,
      suggestionChosen({ placeId: 'x', query: 'pavi', label: 'Pavilion Kuala Lumpur' }),
    )
    expect(state).toMatchObject({ query: 'Pavilion Kuala Lumpur', isOpen: false, activeIndex: -1 })
  })

  it('keeps the dropdown open to show "no places match"', () => {
    const state = reducer(initialState, noResultsFound('asdfgh'))
    expect(state).toMatchObject({ isOpen: true, status: 'succeeded', suggestions: [] })
  })

  it('closes and clears', () => {
    const open = { ...initialState, query: 'pavi', isOpen: true, activeIndex: 1 }
    expect(reducer(open, dropdownClosed())).toMatchObject({
      query: 'pavi',
      isOpen: false,
      activeIndex: -1,
    })
    expect(reducer(open, searchCleared())).toEqual(initialState)
  })
})
