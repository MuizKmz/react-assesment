import { useCallback } from 'react'

/**
 * Pure rule: which index should be active after a key press?
 * -1 means "nothing highlighted". Returns null when the key is not a navigation key.
 */
export function nextListIndex(key: string, current: number, count: number): number | null {
  if (count === 0) return null
  switch (key) {
    case 'ArrowDown':
      return current >= count - 1 ? 0 : current + 1
    case 'ArrowUp':
      return current <= 0 ? count - 1 : current - 1
    // Home/End only move the list once the user is in it; otherwise they move the text caret.
    case 'Home':
      return current >= 0 ? 0 : null
    case 'End':
      return current >= 0 ? count - 1 : null
    default:
      return null
  }
}

interface Options {
  count: number
  activeIndex: number
  onActiveIndexChange: (index: number) => void
}

/**
 * ↑ ↓ Home End with wrap-around, for any list.
 * The active index is owned by the caller (here: Redux), so the hook stays reusable.
 */
export function useListNavigation({ count, activeIndex, onActiveIndexChange }: Options) {
  return useCallback(
    (event: { key: string; preventDefault: () => void }): boolean => {
      const next = nextListIndex(event.key, activeIndex, count)
      if (next === null) return false
      event.preventDefault()
      onActiveIndexChange(next)
      return true
    },
    [count, activeIndex, onActiveIndexChange],
  )
}
