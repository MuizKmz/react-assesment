import { useCallback, type ChangeEvent, type KeyboardEvent } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useListNavigation } from '@/shared/hooks/useListNavigation'
import type { PlaceSuggestion } from '@/types/place'
import {
  selectActiveIndex,
  selectQuery,
  selectSearch,
  selectSearchError,
  selectSearchStatus,
  selectSuggestions,
} from '../selectors'
import {
  activeIndexChanged,
  dropdownClosed,
  dropdownOpened,
  queryChanged,
  searchCleared,
  searchSubmitted,
  suggestionChosen,
} from '../slice'

/**
 * All combobox state and handlers, built on selectors + dispatch.
 * SearchBox stays presentational: it only wires these to elements.
 */
export function usePlaceSearch() {
  const dispatch = useAppDispatch()
  const query = useAppSelector(selectQuery)
  const suggestions = useAppSelector(selectSuggestions)
  const status = useAppSelector(selectSearchStatus)
  const error = useAppSelector(selectSearchError)
  const activeIndex = useAppSelector(selectActiveIndex)
  const { isOpen } = useAppSelector(selectSearch)

  const setActiveIndex = useCallback(
    (index: number) => dispatch(activeIndexChanged(index)),
    [dispatch],
  )
  const navigate = useListNavigation({
    count: suggestions.length,
    activeIndex,
    onActiveIndexChange: setActiveIndex,
  })

  const choose = useCallback(
    (suggestion: PlaceSuggestion) =>
      dispatch(
        suggestionChosen({
          placeId: suggestion.placeId,
          query: query.trim(),
          label: suggestion.primaryText,
        }),
      ),
    [dispatch, query],
  )

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => dispatch(queryChanged(event.target.value)),
    [dispatch],
  )

  const close = useCallback(() => dispatch(dropdownClosed()), [dispatch])
  const clear = useCallback(() => dispatch(searchCleared()), [dispatch])
  const retry = useCallback(() => dispatch(queryChanged(query)), [dispatch, query])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        dispatch(dropdownOpened())
        return
      }
      if (isOpen && navigate(event)) return

      switch (event.key) {
        case 'Enter': {
          event.preventDefault()
          const active = isOpen ? suggestions[activeIndex] : undefined
          if (active) choose(active)
          else dispatch(searchSubmitted(query))
          break
        }
        case 'Escape':
          // First Esc closes the list, second Esc clears the text.
          event.preventDefault()
          if (isOpen) close()
          else clear()
          break
      }
    },
    [isOpen, navigate, suggestions, activeIndex, choose, query, close, clear, dispatch],
  )

  return {
    query,
    suggestions,
    status,
    error,
    isOpen,
    activeIndex,
    isLoading: status === 'loading',
    onChange,
    onKeyDown,
    choose,
    close,
    clear,
    retry,
    setActiveIndex,
  }
}
